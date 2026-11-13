/**
 * الميزان — ميزان تربوي
 * الخادم (Google Apps Script) — مدرسة الشيماء الثانوية للبنات
 *
 * يُلصق هذا الملف كما هو في مشروع Apps Script المرتبط بحساب النائب الأكاديمي،
 * ثم يُنشر كتطبيق ويب (Execute as: Me — Who has access: Anyone).
 * كل التحقق من الأرقام السرية يتم هنا على الخادم، ولا يصل أي رقم سري إلى المتصفح.
 */

const SS_ID = '1H49-iBPf3wM87IRhxOkUuZO89vDetj_Rv714knzSt-g';
const PRIVATE_FOLDER = '1KMmGu5jsd8DP791YzeFv1Tz3Tu01Y8U6';   // «الميزان — ملفات خاصة» في Drive
const SIG_FILE = 'signature-vp.png';
const INDIBAT_ID = '1VwCK6BZ5eCEFEpQbKTowzgn-dNyHCrhFLoDQLM7Juw0';   // منصة «انضباط»: الاحتياط والتبديل (قراءة فقط)
const SESSION_SECONDS = 6 * 60 * 60;                          // مدة الجلسة: 6 ساعات
const PROTECTED_ITEMS = ['AC'];                                       // لا يحذفها إلا النائب الأكاديمي (أنشطة المعلمة تحذفها صاحبتها)
const ADMIN_ITEMS = ['VPV', 'PRV', 'FILES', 'NOTE', 'CF', 'AF', 'AST'];   // إجراءات سبع سنابل (SEN حصص إثرائية، SFB تغذية راجعة، SAC أنشطة، SRF تعزيز) تصل للمنسقة لقسمها فتنعكس في «إجراءات رفع التحصيل»
const PRINCIPAL_MAIL = 's.al-rumaihi0105@education.qa';   // نسخة (CC) من رسائل النائب الأكاديمي للمعلمات
function isPrincipal_(u) { return u && u.role === 'admin' && u.id !== 'admin'; }
// النائب الأكاديمي وحده: المديرة والنائبة الإدارية والمستشارة (حسابات الإدارة الأخرى) للاطلاع وتسجيل حضورهن الصفي فقط
function isVP_(u) { return !!u && u.role === 'admin' && u.id === 'admin'; }                 // بنود خاصة بالنائب لا تراها المنسقات

const SH = {
  users: 'المستخدمون', teachers: 'المعلمات', periods: 'الفترات', prio: 'الأولويات',
  cal: 'التقويم', pd: 'خطة التطوير', rec: 'السجلات', rep: 'التقارير', log: 'سجل العمليات', stu: 'الطالبات'
};

/* ------------------------------------------------------------------ أدوات */
function ss_() { return SpreadsheetApp.openById(SS_ID); }
function sheet_(n) { return ss_().getSheetByName(n); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function iso_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Qatar', 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : String(v);
}
function rows_(name) {
  const sh = sheet_(name); const v = sh.getDataRange().getValues();
  const h = v.shift(); return { h: h, rows: v, sh: sh };
}
function now_() { return Utilities.formatDate(new Date(), 'Asia/Qatar', 'yyyy-MM-dd HH:mm'); }
function log_(user, op, dept, details) {
  try { sheet_(SH.log).appendRow([now_(), user ? user.name : '—', op, dept || '', details || '']); } catch (e) {}
}
function fail_(msg) { throw new Error(msg); }

/* ------------------------------------------------------------------ الدخول */
function roleOf_(r) {
  const k = String(r[1]).trim();
  if (r[0] === 'admin' || k === 'المديرة') return 'admin';   // النائب الأكاديمي ومديرة المدرسة
  if (k === 'توجيه') return 'viewer';
  if (k === 'سكرتارية') return 'sec';                          // السكرتارية: حصر الاستئذانات في «إذنٌ مُيسَّر» للاطلاع فقط                        // ضيوف التوجيه: اطّلاع فقط على سبع سنابل
  return k === 'معلمة' ? 'teacher' : 'coord';
}
const TEACHER_ITEMS = ['TA', 'TPV', 'TWS', 'TPA', 'TACH', 'TDS', 'TAS', 'XCMP'];   // XCMP: توثيق تعويض الطالبات عن الحصص الفائتة بسبب الخروج للأنشطة
      // ما تسجّله المعلمة بنفسها: مبادرات وأنشطة، زيارات تبادلية، ورش وتطوير الزملاء، أولياء الأمور، إنجازات
const CROSS_ITEMS = ['TPV', 'TWS'];                              // تظهر أيضاً لقسم المعلمة المزورة أو المقدِّمة
function findUserByPin_(pin) {
  const t = rows_(SH.users);
  for (const r of t.rows) {
    if (String(r[4]).trim() === String(pin).trim() && String(r[5]).trim() !== 'لا') {
      return { id: String(r[0]), role: roleOf_(r), dept: String(r[2]).split('|').map(s => s.trim()).filter(Boolean), name: String(r[3]) };
    }
  }
  return null;
}
function userById_(id) {
  const t = rows_(SH.users);
  for (const r of t.rows) if (String(r[0]) === id) return { id: String(r[0]), role: roleOf_(r), dept: String(r[2]).split('|').map(s => s.trim()).filter(Boolean), name: String(r[3]), pin: String(r[4]) };
  return null;
}
function login_(pin, app) {
  const cache = CacheService.getScriptCache();
  // لا إيقاف جماعي للدخول: الرقم الخاطئ يتأخر ثانية ونصف فقط (يُبطئ التخمين دون أن يمنع أحداً من الدخول)
  const u = findUserByPin_(pin);
  if (!u) { Utilities.sleep(1500); fail_('الرقم السري غير صحيح'); }
  // المنسقات من «الميزان» فقط؛ والمعلمات يدخلن «الميزان» بتبويبات محدودة، و«سبع سنابل» لمبادراتهن وأنشطتهن
  if (app === 'sanabil' && u.role === 'coord') fail_('هذا الرقم للدخول إلى منصة الميزان');
  if (u.role === 'viewer' && app !== 'sab3' && app !== 'mizan') fail_('هذا الرقم للاطلاع على منصتي سبع سنابل والميزان فقط');
  if (u.role === 'sec' && app && app !== 'mizan') fail_('هذا الرقم للدخول إلى منصة الميزان فقط');
  const token = Utilities.getUuid();
  cache.put('tok_' + token, u.id, SESSION_SECONDS);
  log_(u, 'دخول', u.dept.join('، '));
  return { token: token, user: u };
}
function auth_(token) {
  if (!token) fail_('انتهت الجلسة، الرجاء الدخول مرة أخرى');
  const id = CacheService.getScriptCache().get('tok_' + token);
  if (!id) fail_('انتهت الجلسة، الرجاء الدخول مرة أخرى');
  const u = userById_(id); if (!u) fail_('المستخدم غير موجود');
  return u;
}
function checkPin_(u, pin) {
  if (String(pin).trim() !== u.pin) { Utilities.sleep(600); fail_('الرقم السري غير صحيح — التوقيع يتم برقمك السري فقط'); }
}
function canDept_(u, dept) { return u.role === 'admin' || u.dept.indexOf(dept) >= 0; }

/* ------------------------------------------------------------------ قراءة البيانات */
function bootTeacher_(u) {
  const per = rows_(SH.periods).rows.filter(r => r[0]).map(r => ({ name: r[0], from: iso_(r[1]), to: iso_(r[2]), sem: r[3] }));
  const me = rows_(SH.teachers).rows.filter(r => r[1] === u.name).map(r => ({ dept: r[0], name: r[1], role: r[3], subj: r[4], secs: String(r[5]), load: Number(r[6]) || 0 }));
  const all = rows_(SH.rec).rows.filter(r => r[0]);
  const recs = all.filter(r => TEACHER_ITEMS.indexOf(r[2]) >= 0).map(recObj_).filter(x => x.d && (x.d.t === u.name || (x.item === 'TPV' && x.d.v === u.name) || (x.item === 'TWS' && x.d.by === u.name)));
  const secs = []; me.forEach(m => String(m.secs).split(/[،,]/).forEach(x => { x = x.trim(); if (x) secs.push(x); }));
  const students = students_(secs);
  // طلبات الإذن الخاصة بها، وتواصلها مع أولياء الأمور المسجَّل في سبع سنابل (للعرض فقط)
  rows_(SH.rec).rows.filter(r => r[2] === 'PRQ').map(recObj_).filter(x => x.d.t === u.name).forEach(x => recs.push(x));
  try { const me1 = normAr_(u.name); sabPA_().filter(x => x.item === 'TPA' && normAr_(x.d.t) === me1).forEach(x => recs.push(x)); } catch (e) {}
  const staffAll = rows_(SH.teachers).rows.filter(r => r[1] && r[8] !== 'لا').map(r => ({ dept: r[0], name: r[1], role: r[3] }));
  // أسماء الأنشطة القائمة في المدرسة (للاختيار منها)
  const acts = {};
  all.forEach(r => { if (r[2] !== 'AC' && r[2] !== 'TA') return; let d = {}; try { d = JSON.parse(r[5] || '{}'); } catch (e) {} if (r[2] === 'TA' && d.kind !== 'نشاط') return; const n = String(d.name || '').replace(/\s*—.*$/, '').trim(); if (n) acts[n] = 1; });
  return { user: { id: u.id, role: u.role, dept: u.dept, name: u.name }, periods: per, cal: [], pd: [], staff: me, staffAll: staffAll, students: students, coords: [], records: recs, reports: [], acts: Object.keys(acts).sort(), server: now_() };
}
/* أسماء طالبات شُعب المعلمة فقط (الشعبة والاسم — بلا درجات) */
function students_(secs) {
  const sh = sheet_(SH.stu); if (!sh) return [];
  const v = sh.getDataRange().getValues(); v.shift(); const S = {}; secs.forEach(x => S[x] = 1);
  // الشعبة قد يحوّلها الجدول إلى تاريخ (11-4 ← 4 نوفمبر)، فتُعاد إلى صيغتها
  const sec = x => x instanceof Date ? (x.getMonth() + 1) + '-' + x.getDate() : String(x).trim();
  const base = v.filter(r => r[1] && S[sec(r[0])]).map(r => ({ s: sec(r[0]), n: String(r[1]).trim() }));
  // سجل القيد الرسمي (الشعبة، الاسم، هاتف ولي الأمر، الصلة) — ورقة خاصة لا يكتب عليها سبع سنابل
  const ph = SpreadsheetApp.getActive().getSheetByName('أرقام أولياء الأمور'); if (!ph) return base;
  const pv = ph.getDataRange().getValues(); pv.shift();
  const L = pv.filter(r => r[1] && S[sec(r[0])]).map(r => ({ s: sec(r[0]), n: String(r[1]).trim(), ph: String(r[2] || '').trim(), rel: String(r[3] || '').trim() }));
  return L.length ? L : base;
}
/* أسماء طالبات شُعب صاحبة الحساب نفسها (معلمة أو منسقة) — لرصد التقرير الأكاديمي السلوكي في سبع سنابل */
function myStudents_(u) {
  if (u.role === 'admin') {   // حساب النائب: كل الشعب (لاستكمال سجل القيد في سبع سنابل، مثل الثاني عشر)
    const sh = sheet_(SH.stu); const all = {}; if (sh) { const v = sh.getDataRange().getValues(); v.shift(); v.forEach(r => { if (r[1]) all[r[0] instanceof Date ? (r[0].getMonth() + 1) + '-' + r[0].getDate() : String(r[0]).trim()] = 1; }); }
    return students_(Object.keys(all)).map(x => ({ s: x.s, n: x.n }));
  }
  const secs = []; rows_(SH.teachers).rows.filter(r => String(r[1]).trim() === String(u.name).trim()).forEach(r => String(r[5]).split(/[،,]/).forEach(x => { x = x.trim(); if (x) secs.push(x); }));
  return students_(secs).map(x => ({ s: x.s, n: x.n }));
}
function boot_(u) {
  if (u.role === 'teacher') return bootTeacher_(u);
  if (u.role === 'sec') return bootSec_(u);
  const per = rows_(SH.periods).rows.filter(r => r[0]).map(r => ({ name: r[0], from: iso_(r[1]), to: iso_(r[2]), sem: r[3] }));
  const cal = rows_(SH.cal).rows.filter(r => r[0]).map(r => ({ t: r[0], from: iso_(r[1]), to: iso_(r[2]), k: r[3] }));
  const pd = rows_(SH.pd).rows.filter(r => r[3]).map((r, i) => ({ i: i, sem: r[0], dept: r[1], need: r[2], title: r[3], type: r[4], hrs: r[5], date: iso_(r[6]), by: r[7], n: r[8], impact: r[9] }))
    .filter(p => u.role === 'admin' || p.dept === 'خطة المدرسة العامة' || p.dept.split('|').some(d => u.dept.indexOf(d) >= 0));
  const coords = rows_(SH.users).rows.filter(r => r[0] && roleOf_(r) === 'coord').map(r => ({ id: r[0], dept: String(r[2]).split('|'), name: r[3], active: r[5] !== 'لا' }));
  const staff = rows_(SH.teachers).rows.filter(r => r[1] && r[8] !== 'لا').map(r => {
    const o = { dept: r[0], name: r[1], role: r[3], subj: r[4], secs: String(r[5]), load: Number(r[6]) || 0 };
    if (u.role === 'admin') { o.full = r[2]; o.email = r[7]; }
    return o;
  });
  const recs = listRecords_(u);
  const reps = listReports_(u);
  let stuN = 0; if (u.role === 'admin') { const ph = SpreadsheetApp.getActive().getSheetByName('أرقام أولياء الأمور'); if (ph) stuN = ph.getDataRange().getValues().slice(1).filter(r => r[1]).length; }
  return { user: { id: u.id, role: u.role, dept: u.dept, name: u.name }, periods: per, cal: cal, pd: pd, staff: staff, coords: coords, records: recs, reports: reps, stuN: stuN, server: now_(), indibatAt: PropertiesService.getScriptProperties().getProperty('indibatAt') || '' };
}
function recObj_(r) {
  let d = {}; try { d = JSON.parse(r[5] || '{}'); } catch (e) {}
  return { id: String(r[0]), dept: r[1], item: r[2], date: iso_(r[3]), sum: r[4], d: d, by: r[6], at: iso_(r[7]), up: iso_(r[8]) };
}
function listRecords_(u) {
  if (u.role === 'teacher') return bootTeacher_(u).records;
  const all = rows_(SH.rec).rows.filter(r => r[0]).map(recObj_);
  // زيارات النائب الأكاديمي والمديرة تنعكس على تقرير المنسقة تلقائياً (المعلمة والصف والمحور ونقاط القوة والتحسين فقط)
  const lead = u.role === 'admin' ? [] : all.filter(x => (x.item === 'VPV' || x.item === 'PRV') && u.dept.indexOf(x.dept) >= 0).map(x => ({
    id: 'lv-' + x.id, dept: x.dept, item: 'LVV', date: x.date, sum: x.sum, by: x.by,
    d: { k: x.item === 'PRV' ? 'pr' : 'vp', t: x.d.t || '', s: x.d.s || '', goal: x.d.topic || x.d.note || '', st: (x.d.st || []).slice(0, 2), im: (x.d.im || []).slice(0, 2) } }));
  return all.filter(x => x.item !== 'PRQ').concat(prqList_(u)).concat(sabPA_()).concat(indibat_())
    .filter(x => u.role === 'admin' || (x.item === 'PRQ' || ADMIN_ITEMS.indexOf(x.item) < 0 && x.item !== 'TDS' && (u.dept.indexOf(x.dept) >= 0 || (x.item === 'XCMP' && u.dept.indexOf('البرامج والأنشطة') >= 0) || (CROSS_ITEMS.indexOf(x.item) >= 0 && x.d && (u.dept.indexOf(x.d.vdept) >= 0 || u.dept.indexOf(x.d.bydept) >= 0)))))
    .concat(lead);
}
function repObj_(r) {
  let snap = null; try { snap = r[11] ? JSON.parse(r[11]) : null; } catch (e) {}
  return { id: String(r[0]), dept: r[1], period: r[2], from: iso_(r[3]), to: iso_(r[4]), status: r[5], coordSig: r[6], coordAt: iso_(r[7]), vpSig: r[8], vpAt: iso_(r[9]), feedback: r[10], snap: snap };
}
function listReports_(u) {
  return rows_(SH.rep).rows.filter(r => r[0]).map(repObj_).filter(x => u.role === 'admin' || u.dept.indexOf(x.dept) >= 0);
}

/* ------------------------------------------------------------------ السجلات */
function saveRecord_(u, rec) {
  if (!rec || !rec.item || !rec.dept) fail_('بيانات ناقصة');
  if (!canDept_(u, rec.dept)) fail_('لا تملكين صلاحية على هذا القسم');
  if (ADMIN_ITEMS.indexOf(rec.item) >= 0 && !(isVP_(u) || (rec.item === 'PRV' && isPrincipal_(u)))) fail_('هذا البند خاص بالنائب الأكاديمي');
  if (isPrincipal_(u) && rec.item !== 'PRV') fail_('حسابكِ للاطلاع، ويسجّل حضوركِ الصفي فقط');
  if (rec.item === 'VPV' && isPrincipal_(u)) fail_('حضور النائب الأكاديمي للاطلاع فقط');
  if (rec.item === 'PRV' && !isPrincipal_(u)) fail_('حضور مديرة المدرسة للاطلاع فقط');
  const coordOwn = u.role === 'coord' && ['TPV', 'TWS', 'TAS', 'XCMP'].indexOf(rec.item) >= 0;   // المنسقة تسجّل زياراتها التبادلية وورشها بنفسها
  if (u.role === 'teacher' || coordOwn) {
    if (TEACHER_ITEMS.indexOf(rec.item) < 0) fail_('يمكن للمعلمة تسجيل مبادراتها وأنشطتها فقط');
    rec.d = rec.d || {}; rec.d.t = u.name; rec.dept = u.dept[0];
    const T = rows_(SH.teachers).rows; const dOf = n => { const x = T.find(r => r[1] === n); return x ? String(x[0]) : ''; };
    if (rec.item === 'TPV') rec.d.vdept = dOf(rec.d.v);
    if (rec.item === 'TWS') rec.d.bydept = rec.d.role === 'قدّمتُ لتطوير الزملاء' ? rec.dept : dOf(rec.d.by);
  } else if (TEACHER_ITEMS.indexOf(rec.item) >= 0 && u.role !== 'admin') fail_('هذا البند تسجّله المعلمة بنفسها');
  if (u.role === 'coord' && !coordOwn) assertNotLocked_(rec.dept, rec.date);   // سجلات المعلمة والمنسقة الشخصية تُقبل في الأرباع السابقة، والتقرير الموقّع محفوظ بنسخته
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const t = rows_(SH.rec);
    const data = JSON.stringify(rec.d || {});
    // منع التكرار: نفس القسم + البند + بصمة البيانات
    if (rec.key) {
      for (const r of t.rows) {
        if (r[1] === rec.dept && r[2] === rec.item && String(r[0]) !== String(rec.id || '')) {
          let d = {}; try { d = JSON.parse(r[5] || '{}'); } catch (e) {}
          if (d._key && d._key === rec.key) fail_('هذا السجل موجود مسبقاً (تم منع التكرار)');
        }
      }
      rec.d = rec.d || {}; rec.d._key = rec.key;
    }
    const payload = JSON.stringify(rec.d || {});
    if (rec.id) {
      for (let i = 0; i < t.rows.length; i++) {
        if (String(t.rows[i][0]) === String(rec.id)) {
          if (!canDept_(u, t.rows[i][1])) fail_('لا تملكين صلاحية على هذا السجل');
          if (u.role === 'teacher') { let od = {}; try { od = JSON.parse(t.rows[i][5] || '{}'); } catch (e) {} if (TEACHER_ITEMS.indexOf(t.rows[i][2]) < 0 || od.t !== u.name) fail_('لا تملكين صلاحية على هذا السجل'); }
          t.sh.getRange(i + 2, 2, 1, 8).setValues([[rec.dept, rec.item, rec.date || '', rec.sum || '', payload, u.name, t.rows[i][7], now_()]]);
          log_(u, 'تعديل سجل', rec.dept, rec.item + ' — ' + (rec.sum || '').slice(0, 80));
          return recObj_([rec.id, rec.dept, rec.item, rec.date || '', rec.sum || '', payload, u.name, t.rows[i][7], now_()]);
        }
      }
    }
    const id = 'r' + new Date().getTime().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    const row = [id, rec.dept, rec.item, rec.date || '', rec.sum || '', payload, u.name, now_(), now_()];
    t.sh.appendRow(row);
    log_(u, 'إضافة سجل', rec.dept, rec.item + ' — ' + (rec.sum || '').slice(0, 80));
    return recObj_(row);
  } finally { lock.releaseLock(); }
}
function saveMany_(u, list) {
  const out = []; const skipped = [];
  (list || []).forEach(rec => { try { out.push(saveRecord_(u, rec)); } catch (e) { skipped.push(String(e.message || e)); } });
  return { saved: out, skipped: skipped };
}
function deleteRecord_(u, id) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const t = rows_(SH.rec);
    for (let i = 0; i < t.rows.length; i++) {
      if (String(t.rows[i][0]) === String(id)) {
        if (!canDept_(u, t.rows[i][1])) fail_('لا تملكين صلاحية على هذا السجل');
        if ((String(t.rows[i][2]) === 'VPV' && isPrincipal_(u)) || (String(t.rows[i][2]) === 'PRV' && !isPrincipal_(u))) fail_('هذا السجل للاطلاع فقط');
        if (isPrincipal_(u) && String(t.rows[i][2]) !== 'PRV') fail_('حسابكِ للاطلاع، ولا يحذف إلا حضوركِ الصفي');
        if (u.role !== 'admin' && PROTECTED_ITEMS.indexOf(String(t.rows[i][2])) >= 0) fail_('حذف الأنشطة والمبادرات متاح للنائب الأكاديمي فقط');
        if (u.role === 'teacher') { let od = {}; try { od = JSON.parse(t.rows[i][5] || '{}'); } catch (e) {} if ((TEACHER_ITEMS.indexOf(String(t.rows[i][2])) < 0 && String(t.rows[i][2]) !== 'PRQ') || od.t !== u.name) fail_('لا تملكين صلاحية على هذا السجل'); }
        else if (u.role === 'coord' && TEACHER_ITEMS.indexOf(String(t.rows[i][2])) >= 0) { let od = {}; try { od = JSON.parse(t.rows[i][5] || '{}'); } catch (e) {} if (!(['TPV', 'TWS', 'TAS'].indexOf(String(t.rows[i][2])) >= 0 && od.t === u.name)) fail_('هذا السجل تسجّله المعلمة بنفسها'); }
        if (String(t.rows[i][2]) === 'PRQ' || String(t.rows[i][2]) === 'TDS') { let od = {}; try { od = JSON.parse(t.rows[i][5] || '{}'); } catch (e) {}
          if (!isVP_(u) && (od.prq || (String(t.rows[i][2]) === 'PRQ' && (od.t !== u.name || od.st === 'ok')))) fail_('الإذن المعتمد يُلغى عن طريق النائب الأكاديمي'); }
        if (u.role !== 'admin' && ['PRQ'].indexOf(String(t.rows[i][2])) < 0) assertNotLocked_(t.rows[i][1], iso_(t.rows[i][3]));
        archive_(u, t.rows[i]);
        t.sh.deleteRow(i + 2); log_(u, 'حذف سجل', t.rows[i][1], t.rows[i][2] + ' — ' + String(t.rows[i][4]).slice(0, 80));
        return { id: id };
      }
    }
    fail_('السجل غير موجود');
  } finally { lock.releaseLock(); }
}
/* لا يضيع شيء: كل سجل يُحذف يُنسخ أولاً كما هو إلى ورقة «المحذوفات» (ويمكن استرجاعه منها) */
function archive_(u, row) {
  try { const ss = ss_(); const sh = ss.getSheetByName('المحذوفات') || ss.insertSheet('المحذوفات');
    if (sh.getLastRow() === 0) sh.appendRow(['وقت الحذف', 'حذفته', 'المعرّف', 'القسم', 'البند', 'التاريخ', 'الملخص', 'البيانات', 'أدخلته', 'أُنشئ', 'عُدّل']);
    sh.appendRow([now_(), u ? u.name : '—'].concat(row.slice(0, 9).map(iso_))); } catch (e) {}
}
// بعد توقيع المنسقة على تقرير فترة ما، تُقفل سجلات تلك الفترة لقسمها (ما لم تُعِده النائب للتعديل)
function assertNotLocked_(dept, date) {
  if (!date) return;
  const reps = rows_(SH.rep).rows.filter(r => r[1] === dept && (r[5] === 'موقّع من المنسقة' || r[5] === 'معتمد'));
  for (const r of reps) { if (date >= iso_(r[3]) && date <= iso_(r[4])) fail_('تقرير هذه الفترة موقّع ومقفل. اطلبي من النائب الأكاديمي إعادته للتعديل.'); }
}

/* ------------------------------------------------------------------ التقارير والتوقيع */
function findRep_(t, dept, period) {
  for (let i = 0; i < t.rows.length; i++) if (t.rows[i][1] === dept && t.rows[i][2] === period) return i;
  return -1;
}
function signReport_(u, p) {
  if (u.role !== 'coord') fail_('التوقيع هنا للمنسقة فقط');
  if (!canDept_(u, p.dept)) fail_('لا تملكين صلاحية على هذا القسم');
  checkPin_(u, p.pin);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const t = rows_(SH.rep); const i = findRep_(t, p.dept, p.period);
    if (i >= 0 && (t.rows[i][5] === 'موقّع من المنسقة' || t.rows[i][5] === 'معتمد')) fail_('التقرير موقّع مسبقاً');
    const row = [i >= 0 ? t.rows[i][0] : 'p' + new Date().getTime().toString(36), p.dept, p.period, p.from, p.to, 'موقّع من المنسقة', u.name, now_(), '', '', i >= 0 ? t.rows[i][10] : '', JSON.stringify(p.snap || {})];
    if (i >= 0) t.sh.getRange(i + 2, 1, 1, 12).setValues([row]); else t.sh.appendRow(row);
    log_(u, 'توقيع تقرير', p.dept, p.period);
    return repObj_(row);
  } finally { lock.releaseLock(); }
}
function approveReport_(u, p) {
  if (!isVP_(u)) fail_('الاعتماد للنائب الأكاديمي فقط');
  checkPin_(u, p.pin);
  const t = rows_(SH.rep); const i = findRep_(t, p.dept, p.period);
  if (i < 0) fail_('لم توقّع المنسقة على هذا التقرير بعد');
  const r = t.rows[i];
  r[5] = 'معتمد'; r[8] = u.name; r[9] = now_(); r[10] = p.feedback || r[10] || '';
  t.sh.getRange(i + 2, 1, 1, 12).setValues([r]);
  log_(u, 'اعتماد تقرير', p.dept, p.period);
  return repObj_(r);
}
function returnReport_(u, p) {
  if (!isVP_(u)) fail_('للنائب الأكاديمي فقط');
  const t = rows_(SH.rep); const i = findRep_(t, p.dept, p.period);
  if (i < 0) fail_('التقرير غير موجود');
  const r = t.rows[i]; r[5] = 'معاد للتعديل'; r[8] = ''; r[9] = ''; r[10] = p.feedback || r[10] || '';
  t.sh.getRange(i + 2, 1, 1, 12).setValues([r]);
  log_(u, 'إعادة تقرير للتعديل', p.dept, p.period);
  return repObj_(r);
}
function feedback_(u, p) {
  if (!isVP_(u)) fail_('للنائب الأكاديمي فقط');
  const t = rows_(SH.rep); const i = findRep_(t, p.dept, p.period);
  if (i < 0) { const row = ['p' + new Date().getTime().toString(36), p.dept, p.period, p.from, p.to, 'مسودة', '', '', '', '', p.feedback || '', '']; t.sh.appendRow(row); return repObj_(row); }
  t.sh.getRange(i + 2, 11).setValue(p.feedback || ''); t.rows[i][10] = p.feedback || '';
  log_(u, 'تغذية راجعة', p.dept, p.period);
  return repObj_(t.rows[i]);
}
function sigData_(name) {
  const it = DriveApp.getFolderById(PRIVATE_FOLDER).getFilesByName(name);
  if (!it.hasNext()) return '';
  const b = it.next().getBlob();
  return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
}
// توقيع المنسقة: للنائب، أو للمنسقة نفسها فقط
function coordSig_(u, p) {
  if (!isVP_(u) && u.id !== p.who) fail_('التوقيع غير متاح');
  return { data: sigData_('sig-' + p.who + '.png') };
}
function setSig_(u, p) {
  if (!isVP_(u)) fail_('للنائب الأكاديمي فقط');
  if (!/^c\d+$/.test(String(p.id))) fail_('حساب غير صالح');
  const m = String(p.data || '').match(/^data:(image\/(png|jpeg));base64,(.+)$/);
  if (!m) fail_('صيغة الصورة غير مدعومة (PNG أو JPG)');
  const folder = DriveApp.getFolderById(PRIVATE_FOLDER); const name = 'sig-' + p.id + '.png';
  const old = folder.getFilesByName(name); while (old.hasNext()) old.next().setTrashed(true);
  folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[3]), m[1], name));
  log_(u, 'تحديث توقيع منسقة', '', p.id);
  return { ok: true };
}
function signature_(u, p) {
  if (p.who) return coordSig_(u, p);
  if (p.cheer) return { data: sigData_(SIG_FILE) };   // توقيع النائب الباهت تحت عبارات الشكر للمعلمات
  // توقيع النائب على استمارة حضور المنسقة: يُعطى فقط بعد كتابة النائب ملاحظتها عليها
  if (p.visit) {
    const r = rows_(SH.rec).rows.find(x => String(x[0]) === String(p.visit));
    let d = {}; try { d = JSON.parse((r && r[5]) || '{}'); } catch (e) {}
    if (!r || r[2] !== 'V' || !d.vpfb || !canDept_(u, r[1])) fail_('التوقيع غير متاح');
    return { data: sigData_(SIG_FILE) };
  }
  // توقيع النائب لا يُعطى إلا للنائب نفسها، أو لتقرير معتمد يخص قسم المنسقة
  if (!isVP_(u)) {
    const t = rows_(SH.rep); const i = findRep_(t, p.dept, p.period);
    if (i < 0 || (t.rows[i][5] !== 'معتمد' && !String(t.rows[i][10] || '').trim()) || !canDept_(u, p.dept)) fail_('التوقيع غير متاح');   // بعد الاعتماد أو بعد كتابة النائب تغذيتها الراجعة
  }
  const it = DriveApp.getFolderById(PRIVATE_FOLDER).getFilesByName(SIG_FILE);
  if (!it.hasNext()) fail_('ملف التوقيع غير موجود');
  const b = it.next().getBlob();
  return { data: 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) };
}

/* ملاحظة النائب على استمارة حضور المنسقة: تُحفظ دون تغيير كاتب الاستمارة */
function vpFeedback_(u, p) {
  if (u.role !== 'admin' || isPrincipal_(u)) fail_('للنائب الأكاديمي فقط');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const t = rows_(SH.rec);
    for (let i = 0; i < t.rows.length; i++) {
      if (String(t.rows[i][0]) !== String(p.id)) continue;
      if (t.rows[i][2] !== 'V') fail_('هذا السجل ليس استمارة حضور');
      let d = {}; try { d = JSON.parse(t.rows[i][5] || '{}'); } catch (e) {}
      const fb = String(p.fb || '').trim();
      if (fb) { d.vpfb = fb; d.vpfbAt = Utilities.formatDate(new Date(), 'Asia/Qatar', 'yyyy-MM-dd'); } else { delete d.vpfb; delete d.vpfbAt; }
      const payload = JSON.stringify(d);
      t.sh.getRange(i + 2, 6).setValue(payload); t.sh.getRange(i + 2, 9).setValue(now_());
      log_(u, 'ملاحظة النائب على زيارة', t.rows[i][1], String(d.t || ''));
      const row = t.rows[i].slice(); row[5] = payload; row[8] = now_();
      return { record: recObj_(row) };
    }
    fail_('السجل غير موجود');
  } finally { lock.releaseLock(); }
}

/* ------------------------------------------------------------------ إدارة (النائب) */
function setPin_(u, p) {
  if (!isVP_(u)) fail_('للنائب الأكاديمي فقط');
  if (!/^\d{4,8}$/.test(String(p.newPin))) fail_('الرقم السري من 4 إلى 8 أرقام');
  const t = rows_(SH.users);
  if (t.rows.some(r => String(r[4]) === String(p.newPin) && r[0] !== p.id)) fail_('هذا الرقم مستخدم لحساب آخر');
  for (let i = 0; i < t.rows.length; i++) if (t.rows[i][0] === p.id) { t.sh.getRange(i + 2, 5).setValue(String(p.newPin)); log_(u, 'تغيير رقم سري', '', p.id); return { ok: true }; }
  fail_('الحساب غير موجود');
}

/* قائمة الأرقام السرية: للإدارة فقط، وبعد إعادة إدخال رقمها السري. لا تُعرض أرقام الإدارة والمديرة */
function pinList_(u, p) {
  if (!isVP_(u)) fail_('للإدارة فقط');
  checkPin_(u, p.pin);
  const t = rows_(SH.users); const role = { 'منسقة': 'منسقة', 'معلمة': 'معلمة', 'توجيه': 'موجهة' };
  const list = t.rows.filter(r => role[String(r[1]).trim()]).map(r => ({ id: String(r[0]), role: role[String(r[1]).trim()], dept: String(r[2]).split('|').join(' / '), name: String(r[3]), pin: String(r[4]), on: String(r[5]).trim() !== 'لا' }));
  log_(u, 'عرض الأرقام السرية', '', '');
  return { list: list };
}

/* ------------------------------------------------------------------ إرسال الاستمارات بالبريد (PDF موقّع) */
function sendForm_(u, p) {
  if (u.role !== 'admin') fail_('للنائب الأكاديمي فقط');
  if (!p.to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(p.to))) fail_('البريد الإلكتروني غير صالح');
  const it = DriveApp.getFolderById(PRIVATE_FOLDER).getFilesByName(SIG_FILE);
  let sig = '';
  if (it.hasNext()) { const b = it.next().getBlob(); sig = '<img src="data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) + '" alt="">'; }
  const html = String(p.html || '').replace(/\{\{SIG\}\}/g, sig);
  const name = String(p.file || 'استمارة').replace(/[\\/:*?"<>|]/g, '-');
  const pdf = Utilities.newBlob(html, 'text/html', name + '.html').getAs('application/pdf').setName(name + '.pdf');
  // نسخة محفوظة في مجلد «الاستمارات المرسلة» داخل المجلد الخاص
  try {
    const root = DriveApp.getFolderById(PRIVATE_FOLDER); const f = root.getFoldersByName('الاستمارات المرسلة');
    (f.hasNext() ? f.next() : root.createFolder('الاستمارات المرسلة')).createFile(pdf.copyBlob().setName(name + '.pdf'));
  } catch (e) {}
  const pr = isPrincipal_(u);
  const opt = { to: String(p.to), subject: String(p.subject || name), htmlBody: String(p.body || ''), attachments: [pdf], name: pr ? u.name + ' — مديرة المدرسة' : u.name + ' — نائب المدير للشؤون الأكاديمية', cc: PRINCIPAL_MAIL };
  if (pr) opt.replyTo = PRINCIPAL_MAIL;
  MailApp.sendEmail(opt);
  log_(u, 'إرسال استمارة', '', name + ' ← ' + p.to);
  return { sent: true };
}


/* إرسال المنسقة استمارة الإشراف لمعلمة قسمها: يظهر المرسل باسم المنسقة، والرد يصل إليها، ونسخة لها */
function sendVisitC_(u, p) {
  if (u.role !== 'coord') fail_('للمنسقات فقط');
  const t = rows_(SH.rec); let i = -1;
  for (let k = 0; k < t.rows.length; k++) if (String(t.rows[k][0]) === String(p.id)) { i = k; break; }
  if (i < 0) fail_('الزيارة غير موجودة');
  const row = t.rows[i]; if (row[2] !== 'V' || !canDept_(u, row[1])) fail_('غير مسموح');
  const d = JSON.parse(row[5] || '{}');
  const T = rows_(SH.teachers).rows;
  const tr = T.find(r => r[1] === d.t && r[0] === row[1]) || T.find(r => r[1] === d.t);
  const to = tr && String(tr[7] || '').trim(); if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) fail_('لا يوجد بريد إلكتروني مسجّل للمعلمة');
  const cr = T.find(r => r[1] === u.name); const me = cr && String(cr[7] || '').trim();
  const sig = sigData_('sig-' + u.id + '.png');
  const html = String(p.html || '').replace(/\{\{SIG\}\}/g, sig ? '<img src="' + sig + '" alt="">' : '');
  const name = String(p.file || 'استمارة').replace(/[\\/:*?"<>|]/g, '-');
  const pdf = Utilities.newBlob(html, 'text/html', name + '.html').getAs('application/pdf').setName(name + '.pdf');
  try {
    const root = DriveApp.getFolderById(PRIVATE_FOLDER); const f = root.getFoldersByName('الاستمارات المرسلة');
    (f.hasNext() ? f.next() : root.createFolder('الاستمارات المرسلة')).createFile(pdf.copyBlob().setName(name + '.pdf'));
  } catch (e) {}
  const opt = { to: to, subject: String(p.subject || name), htmlBody: String(p.body || ''), attachments: [pdf], name: u.name + ' — منسقة قسم ' + row[1] };
  if (me && /@/.test(me)) { opt.replyTo = me; opt.cc = me; }
  MailApp.sendEmail(opt);
  d.sent = now_().slice(0, 10); row[5] = JSON.stringify(d);
  t.sh.getRange(i + 2, 6).setValue(row[5]); t.sh.getRange(i + 2, 9).setValue(now_());
  log_(u, 'إرسال استمارة زيارة', row[1], name + ' ← ' + to);
  return { sent: true, record: recObj_(row) };
}


/* ------------------------------------------------------------------ مرفقات المعلمات (كشوف الحضور وأوراق العمل) — في المجلد الخاص */
function upload_(u, p) {
  const m = String(p.data || '').match(/^data:([\w.+\/-]+);base64,(.+)$/);
  if (!m) fail_('صيغة الملف غير مدعومة');
  const bytes = Utilities.base64Decode(m[2]); if (bytes.length > 8 * 1024 * 1024) fail_('حجم الملف أكبر من 8 ميجابايت');
  const root = DriveApp.getFolderById(PRIVATE_FOLDER); const it = root.getFoldersByName('مرفقات المعلمات');
  const folder = it.hasNext() ? it.next() : root.createFolder('مرفقات المعلمات');
  const name = String(p.name || 'ملف').replace(/[\\/:*?"<>|]/g, '-').slice(0, 120);
  const f = folder.createFile(Utilities.newBlob(bytes, m[1], name)); f.setDescription(u.id + '|' + u.dept.join('|'));
  log_(u, 'رفع مرفق', u.dept.join('، '), name);
  return { fid: f.getId(), name: name };
}
function getFile_(u, p) {
  const f = DriveApp.getFileById(String(p.fid)); if (f.getParents().next().getName() !== 'مرفقات المعلمات') fail_('غير مسموح');
  const [owner, ...depts] = String(f.getDescription() || '').split('|');
  if (!(u.role === 'admin' || owner === u.id || (u.role === 'coord' && depts.some(d => u.dept.indexOf(d) >= 0)))) fail_('غير مسموح');
  const b = f.getBlob(); return { name: f.getName(), data: 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) };
}


/* أسماء الطالبات (الشعبة والاسم فقط) — يرسلها النائب الأكاديمي من «سبع سنابل» */
function setStudents_(u, p) {
  if (!isVP_(u)) fail_('للنائب الأكاديمي فقط');
  const L = (p.list || []).filter(x => x && x.n && /^1[0-2]-\d+$/.test(String(x.s))).map(x => [String(x.s), String(x.n).slice(0, 120)]);
  if (!L.length) fail_('القائمة فارغة');
  let sh = sheet_(SH.stu); if (!sh) sh = ss_().insertSheet(SH.stu);
  sh.clearContents(); sh.getRange(1, 1, 1, 2).setValues([['الشعبة', 'اسم الطالبة']]);
  sh.getRange(2, 1, Math.max(L.length, 1), 1).setNumberFormat('@');
  sh.getRange(2, 1, L.length, 2).setValues(L);
  log_(u, 'تحديث أسماء الطالبات', '', L.length + ' طالبة');
  return { n: L.length };
}


/* ------------------------------------------------------------------ دخول «سبع سنابل» بالرقم السري نفسه */
// يتحقق من الرقم السري هنا، ثم يصدر مفتاح دخول مؤقتاً (ساعة) لقاعدة بيانات سبع سنابل (Firebase).
// يحتاج خاصية سكربت باسم FB_SA فيها محتوى ملف مفتاح حساب الخدمة من Firebase.
function normAr_(s) {
  return String(s == null ? '' : s).replace(/[\u064B-\u0670\u065F\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim().toLowerCase();
}
function b64u_(x) { return Utilities.base64EncodeWebSafe(x).replace(/=+$/, ''); }
function fbToken_(pin) {
  const raw = PropertiesService.getScriptProperties().getProperty('FB_SA');
  if (!raw) fail_('لم يُضبط مفتاح ربط سبع سنابل في الخادم بعد');
  const r = login_(pin, 'sab3');
  const u = r.user;
  const sa = JSON.parse(raw);
  // الاسم الكامل من جدول «المعلمات» (هو نفسه المستخدم في توزيع المعلمات بسبع سنابل)
  let full = u.name;
  try { const tr = rows_(SH.teachers).rows.find(x => String(x[1]).trim() === String(u.name).trim() && String(x[2]).trim()); if (tr) full = String(tr[2]); } catch (e) {}
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now, exp: now + 3600, uid: 'mz_' + u.id,
    claims: { role: u.role, nk: normAr_(full), nm: u.name, dept: u.dept.map(normAr_), mz: u.id }
  };
  const head = b64u_(Utilities.newBlob(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).getBytes());
  const body = b64u_(Utilities.newBlob(JSON.stringify(payload)).getBytes());
  const sig = b64u_(Utilities.computeRsaSha256Signature(head + '.' + body, sa.private_key));
  return { fbToken: head + '.' + body + '.' + sig, token: r.token, user: { id: u.id, role: u.role, name: u.name, dept: u.dept } };
}


/* ------------------------------------------------------------------ التواصل مع أولياء الأمور من سبع سنابل */
// تسجّل المعلمات التواصل مع أولياء الأمور في «سبع سنابل»، ويقرؤه الميزان هنا ليظهر في التقرير الشهري كما كان
function sabAccess_() {
  const c = CacheService.getScriptCache(); const k = c.get('sabTok'); if (k) return k;
  const raw = PropertiesService.getScriptProperties().getProperty('FB_SA'); if (!raw) return null;
  const sa = JSON.parse(raw); const now = Math.floor(Date.now() / 1000);
  const head = b64u_(Utilities.newBlob(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).getBytes());
  const body = b64u_(Utilities.newBlob(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })).getBytes());
  const sig = b64u_(Utilities.computeRsaSha256Signature(head + '.' + body, sa.private_key));
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: head + '.' + body + '.' + sig }, muteHttpExceptions: true });
  const tok = JSON.parse(r.getContentText()).access_token; if (tok) c.put('sabTok', tok, 3000); return tok || null;
}
function sabPA_() {
  const c = CacheService.getScriptCache(); const hit = c.get('sabPA4'); if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  let out = [];
  try {
    const tok = sabAccess_(); if (!tok) return [];
    const r = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/projects/sab3-sanabil/databases/(default)/documents:runQuery', {
      method: 'post', contentType: 'application/json', headers: { Authorization: 'Bearer ' + tok }, muteHttpExceptions: true,
      payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'entries' }], where: { fieldFilter: { field: { fieldPath: 'type' }, op: 'IN', value: { arrayValue: { values: [{ integerValue: '5' }, { integerValue: '3' }, { integerValue: '6' }, { integerValue: '4' }, { integerValue: '7' }] } } } } } }) });
    const val = v => v == null ? '' : v.stringValue != null ? v.stringValue : v.integerValue != null ? Number(v.integerValue) : v.doubleValue != null ? v.doubleValue : v.booleanValue != null ? v.booleanValue : v.arrayValue ? (v.arrayValue.values || []).map(val) : '';
    const T = rows_(SH.teachers).rows.filter(x => x[1]);
    const depts = {}; T.forEach(x => depts[normAr_(x[0])] = x[0]);
    const short = n => { const k = normAr_(n); const t = T.find(x => normAr_(x[2]) === k || normAr_(x[1]) === k); return t ? String(t[1]) : String(n); };
    JSON.parse(r.getContentText()).forEach(x => {
      if (!x.document) return; const f = x.document.fields || {}; const g = k => val(f[k]);
      const det = String(g('detail')).split(' — '); const stu = g('students') || [];
      const topic = (det.find(s => s.indexOf('السبب: ') === 0) || '').replace('السبب: ', ''), res = (det.find(s => s.indexOf('النتيجة: ') === 0) || '').replace('النتيجة: ', '');
      if (Number(g('type')) === 6) {   // تعزيز الطالبات وشهاداتهن (العنوان وأسباب التكريم)
        out.push({ id: 'sab_' + x.document.name.split('/').pop(), dept: depts[g('dept')] || g('dept'), item: 'SRF', date: String(g('date')), sum: 'تعزيز — سبع سنابل',
          d: { t: short(g('teacher')), s: g('section'), subj: g('subject'), stu: stu, det: String(g('detail') || ''), src: 'sab3' }, by: 'سبع سنابل', at: String(g('at')), up: '' });
        return;
      }
      if (Number(g('type')) === 4 || Number(g('type')) === 7) {   // التغذية الراجعة، والأنشطة وتعلّم الأقران: تنعكس في «إجراءات رفع التحصيل» بتقرير المنسقة
        out.push({ id: 'sab_' + x.document.name.split('/').pop(), dept: depts[g('dept')] || g('dept'), item: Number(g('type')) === 4 ? 'SFB' : 'SAC', date: String(g('date')), sum: (Number(g('type')) === 4 ? 'تغذية راجعة' : 'نشاط وتعلّم أقران') + ' — سبع سنابل',
          d: { t: short(g('teacher')), s: g('section'), subj: g('subject'), whole: !!g('whole'), n: g('whole') ? 0 : stu.length, stu: stu, det: String(g('detail') || ''), link: String(g('link') || ''), src: 'sab3' }, by: 'سبع سنابل', at: String(g('at')), up: '' });
        return;
      }
      if (Number(g('type')) === 3) {   // حصة إثرائية
        out.push({ id: 'sab_' + x.document.name.split('/').pop(), dept: depts[g('dept')] || g('dept'), item: 'SEN', date: String(g('date')), sum: 'حصة إثرائية — سبع سنابل',
          d: { t: short(g('teacher')), s: g('section'), subj: g('subject'), whole: !!g('whole'), n: g('whole') ? 0 : stu.length, stu: stu, det: String(g('detail') || ''), src: 'sab3' }, by: 'سبع سنابل', at: String(g('at')), up: '' });
        return;
      }
      out.push({ id: 'sab_' + x.document.name.split('/').pop(), dept: depts[g('dept')] || g('dept'), item: 'TPA', date: String(g('date')), sum: 'من سبع سنابل',
        d: { t: short(g('teacher')), s: g('section'), n: g('whole') ? 1 : Math.max(1, stu.length), way: det[0] || '', topic: topic, res: res, stu: stu, src: 'sab3' }, by: 'سبع سنابل', at: String(g('at')), up: '' });
    });
  } catch (e) { return []; }
  const txt = JSON.stringify(out); if (txt.length < 95000) c.put('sabPA4', txt, 120);
  return out;
}

/* ------------------------------------------------------------------ إحصاءات المعلمات إلى «سبع سنابل» */
// الأنشطة والمبادرات (AC) والزيارات التبادلية (PV) والإنجازات (ACH) تُكتب في قاعدة سبع سنابل (shared/mizan)
// فتظهر في لوحة الصدارة ونجوم المعلمات تلقائياً بعد كل حفظ في الميزان
function sabSoon_(item) { if (item && item !== '*' && ['AC', 'PV', 'ACH', 'WS', 'EX', 'PA', 'LR', 'TA', 'TPV', 'TWS', 'TPA', 'TACH', 'TDS'].indexOf(item) < 0) return; try { syncSanabil(); } catch (e) {} }
// k: a نشاط · i مبادرة · v حضور حصة تبادلية · w توظيف جوانب التميز (ورشة قدّمتها أو زيارة استضافتها) · h إنجاز/مشاركة
//    p تطوير مهني (ورشة حضرتها أو برنامج خارجي) · o تواصل مع أولياء الأمور · r مصادر التعلم والتقنية
function syncSanabil() {
  const tok = sabAccess_(); if (!tok) return 'لم يُضبط مفتاح ربط سبع سنابل (FB_SA)';
  const T = rows_(SH.teachers).rows.filter(x => x[1]);
  const find = n => { const k = normAr_(n); return T.find(x => normAr_(x[1]) === k || normAr_(x[2]) === k); };
  const full = n => { n = String(n || '').trim(); const t = find(n); return t ? String(t[2] || t[1]) : n; };
  const deptAll = d => T.filter(x => String(x[0]) === String(d)).map(x => String(x[2] || x[1]));
  const list = [], abs = [], pa = [], cv = [];
  // strict: يُحتسب الاسم فقط إن طابق معلمة في جدول «المعلمات» (للخانات النصية الحرة)
  // منع العدّ المزدوج: سجل المعلمة المنقول من تقرير المنسقة (q1) يُحتسب مرة واحدة، فلا يُعدّ معه السجل الأصلي للشخص نفسه في السنبلة نفسها
  const cover = {}, grp = k => (k === 'a' || k === 'i') ? 'ai' : k;
  const ex = (r, names, k, ti, strict) => { const s = {}; names.filter(Boolean).forEach(n => { n = String(n).trim(); if (/جميع/.test(n)) deptAll(r.dept).forEach(x => s[x] = 1); else if (!strict || find(n)) s[full(n)] = 1; });
    const q = r.d && r.d.q1 ? ((String(r.d.q1).match(/\(([^)]+)\)\s*$/) || [])[1] || '') : '';
    Object.keys(s).forEach(n => { if (!q && cover[r.id + '|' + n + '|' + grp(k)]) return; if (q) cover[q + '|' + n + '|' + grp(k)] = 1;
      list.push({ n: n, k: k, t: String(ti || '').slice(0, 120), d: r.date || '' }); }); };
  const all = rows_(SH.rec).rows.filter(r => r[0]).map(recObj_);
  all.filter(r => r.d && r.d.q1).concat(all.filter(r => !(r.d && r.d.q1))).forEach(r => { const d = r.d || {};
    switch (r.item) {
      case 'AC': ex(r, [d.e1, d.e2, d.e3], /مبادر/.test(d.ty || '') ? 'i' : 'a', d.name || d.ty); break;
      case 'TA': ex(r, [d.t], d.kind === 'مبادرة' ? 'i' : 'a', d.name); break;
      case 'PV': ex(r, [d.v], 'v', 'زيارة تبادلية' + (d.t ? ' — ' + d.t : '')); ex(r, [d.t], 'w', 'استضافة زيارة تبادلية' + (d.v ? ' — ' + d.v : '')); break;
      case 'TPV': ex(r, [d.t], 'v', 'زيارة تبادلية' + (d.v ? ' — ' + d.v : '')); ex(r, [d.v], 'w', 'استضافة زيارة تبادلية' + (d.t ? ' — ' + d.t : '')); break;
      case 'TWS': ex(r, [d.t], d.role === 'قدّمتُ لتطوير الزملاء' ? 'w' : 'p', d.title); break;
      case 'WS': if (!d.g || /^تمت/.test(d.g)) ex(r, [d.pres], 'w', d.c || d.b, true); break;
      case 'EX': ex(r, [d.t], 'p', d.name); break;
      case 'ACH': ex(r, [d.sup], 'h', d.name || d.c); break;
      case 'TACH': ex(r, [d.t], 'h', d.name); break;
      case 'PA': ex(r, [d.by], 'o', d.c || d.why, true); break;
      case 'TPA': ex(r, [d.t], 'o', d.topic || 'تواصل مع ولي أمر'); if (d.s && d.stu && d.stu.length) pa.push({ id: r.id, t: full(d.t), s: String(d.s), st: d.stu, d: r.date || '', c: d.cat || '', tp: d.topic || '', w: d.way || '' }); break;
      case 'LR': ex(r, [d.t], 'r', d.e || d.k); break;
      // الحضور الصفي (أعداد فقط بلا ملاحظات) للوحة الأرقام في سبع سنابل: w = co المنسقة، vp النائب الأكاديمي، pr المديرة
      case 'V': case 'VPV': case 'PRV': if (d.t) cv.push({ w: r.item === 'V' ? 'co' : r.item === 'VPV' ? 'vp' : 'pr', p: String(r.dept || ''), t: full(d.t), d: r.date || d.date || '', kj: d.kj || '' }); break;
      case 'TDS': (d.abs || []).forEach(x => abs.push({ n: full(d.t), d: x.date, ty: 'غياب' })); (d.perm || []).forEach(x => abs.push({ n: full(d.t), d: x.date, ty: 'استئذان' })); break;
    } });
  const body = { fields: { t: { stringValue: JSON.stringify(list) }, cv: { stringValue: JSON.stringify(cv) }, at: { stringValue: new Date().toISOString() }, n: { integerValue: String(list.length) } } };
  const res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/projects/sab3-sanabil/databases/(default)/documents/shared/mizan', {
    method: 'patch', contentType: 'application/json', headers: { Authorization: 'Bearer ' + tok }, payload: JSON.stringify(body), muteHttpExceptions: true });
  // تواصل المعلمات مع أولياء الأمور بأسماء الطالبات، والغياب والاستئذان: في وثيقة لا يقرؤها إلا حساب النائب الأكاديمي، ومنها تمتلئ سنبلة «التواصل مع ولي الأمر» لكل طالبة
  UrlFetchApp.fetch('https://firestore.googleapis.com/v1/projects/sab3-sanabil/databases/(default)/documents/adm/mizanpa', {
    method: 'patch', contentType: 'application/json', headers: { Authorization: 'Bearer ' + tok }, muteHttpExceptions: true,
    payload: JSON.stringify({ fields: { t: { stringValue: JSON.stringify(pa) }, abs: { stringValue: JSON.stringify(abs) }, at: { stringValue: new Date().toISOString() } } }) });
  const msg = res.getResponseCode() === 200 ? 'تم إرسال ' + list.length + ' سجل و' + pa.length + ' تواصل مع أولياء الأمور إلى سبع سنابل' : 'تعذّر الإرسال: ' + res.getContentText().slice(0, 200);
  Logger.log(msg); return msg;
}

/* ------------------------------------------------------------------ الاحتياط والتبديل من «انضباط» */
// يقرأ ورقة «الاحتياط» من منصة انضباط (قراءة فقط) ويحوّلها إلى سجلات تظهر في تقرير كل قسم:
// SBC = حصة غطّتها معلمة من القسم (احتياط أو تبديل)، SBA = حصة غابت فيها معلمة من القسم ومن غطّاها
function indibatDate_(s) {
  s = String(s || '').trim();
  let m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/); if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/); if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return '';
}
function indibat_(force) {
  const c = CacheService.getScriptCache();
  if (!force) { const hit = c.get('indibat'); if (hit) { try { return JSON.parse(hit); } catch (e) {} } }
  const out = [];
  try {
    const sh = SpreadsheetApp.openById(INDIBAT_ID).getSheetByName('الاحتياط'); if (!sh) return [];
    const v = sh.getDataRange().getDisplayValues(); v.shift();
    const T = rows_(SH.teachers).rows.filter(x => x[1]);
    const who = n => { const k = normAr_(n); const t = T.find(x => normAr_(x[2]) === k || normAr_(x[1]) === k); return t ? { name: String(t[1]), dept: String(t[0]) } : null; };
    v.forEach((r, i) => {
      const date = indibatDate_(r[0]); if (!date) return;
      const p = Number(String(r[1]).replace(/[^0-9]/g, '')) || 0, cls = String(r[2]).trim(), type = String(r[8] || '').trim() || 'احتياط';
      const A = r[4] ? who(r[4]) : null, B = r[6] ? who(r[6]) : null;
      if (A) out.push({ id: 'ind_a' + i, dept: A.dept, item: 'SBA', date: date, sum: 'من انضباط', d: { t: A.name, cls: cls, p: p, sub: B ? B.name : '', subDept: B ? B.dept : '', type: B ? type : '' }, by: 'انضباط', at: '', up: '' });
      if (B) out.push({ id: 'ind_c' + i, dept: B.dept, item: 'SBC', date: date, sum: 'من انضباط', d: { t: B.name, cls: cls, p: p, abs: A ? A.name : '', absDept: A ? A.dept : '', type: type }, by: 'انضباط', at: '', up: '' });
    });
  } catch (e) { return []; }
  const txt = JSON.stringify(out); if (txt.length < 95000) c.put('indibat', txt, 600);
  const at = now_(); PropertiesService.getScriptProperties().setProperty('indibatAt', at);
  try {   // تسجيل وقت المزامنة في انضباط ليظهر في «فحص المزامنة»
    const st = SpreadsheetApp.openById(INDIBAT_ID).getSheetByName('الإعدادات'); const sv = st.getDataRange().getDisplayValues();
    let row = 0; for (let i = 1; i < sv.length; i++) if (String(sv[i][0]).trim() === 'آخر مزامنة مع الميزان') row = i + 1;
    if (row) st.getRange(row, 2).setValue(at); else st.appendRow(['آخر مزامنة مع الميزان', at, 'يُحدَّث تلقائياً من منصة الميزان']);
  } catch (e) {}
  return out;
}
/* السكرتارية: الأذونات فقط (من، متى، كم ساعة، الحالة) دون السبب والملاحظات */
function bootSec_(u) {
  const per = rows_(SH.periods).rows.filter(r => r[0]).map(r => ({ name: r[0], from: iso_(r[1]), to: iso_(r[2]), sem: r[3] }));
  const staffAll = rows_(SH.teachers).rows.filter(r => r[1]).map(r => ({ dept: String(r[0]), name: String(r[1]), role: String(r[3] || '') }));
  const recs = rows_(SH.rec).rows.filter(r => r[2] === 'PRQ').map(recObj_).map(x => ({ id: x.id, dept: x.dept, item: 'PRQ', date: x.date, d: { t: x.d.t, from: x.d.from || '', to: x.d.to || '', h: x.d.h, kind: x.d.kind, st: x.d.st, first: x.d.first, steps: (x.d.steps || []).map(s => ({ w: s.w })) } }));
  return { user: { id: u.id, role: u.role, dept: u.dept, name: u.name }, periods: per, cal: [], pd: [], staff: [], staffAll: staffAll, coords: [], records: recs, reports: [], server: now_() };
}
/* ------------------------------------------------------------------ الموجّه */
function route_(req) {
  const a = req.action;
  if (a === 'ping') return { ok: true, name: 'الميزان', at: now_() };
  if (a === 'login') return login_(req.pin, req.app);
  if (a === 'fbToken') return fbToken_(req.pin);
  const u = auth_(req.token);
  // الموجهة التربوية: اطلاع فقط على أقسامها في الميزان (جميع الأقسام للحساب العام)
  if (u.role === 'viewer') {
    if (u.dept.indexOf('جميع الأقسام') >= 0) u.dept = rows_(SH.teachers).rows.map(r => String(r[0])).filter((d, i, A) => d && A.indexOf(d) === i);
    if (['boot', 'records', 'signature'].indexOf(a) < 0) fail_('حساب الموجهة للاطلاع فقط، ولا يسمح بالتعديل');
  }
  // السكرتارية: اطلاع على حصر الاستئذانات فقط
  if (u.role === 'sec' && ['boot', 'logout'].indexOf(a) < 0) fail_('هذا الحساب للاطلاع على حصر الاستئذانات فقط');
  switch (a) {
    case 'boot': return boot_(u);
    case 'records': return { records: listRecords_(u) };
    case 'save': { const r = { record: saveRecord_(u, req.rec) }; sabSoon_(req.rec && req.rec.item); return r; }
    case 'saveMany': { const r = saveMany_(u, req.list); sabSoon_('*'); return r; }
    case 'delete': { const r = deleteRecord_(u, req.id); sabSoon_('*'); return r; }
    case 'syncSanabil': if (!isVP_(u)) fail_('للنائب الأكاديمي فقط'); return { result: syncSanabil() };
    case 'sign': return { report: signReport_(u, req) };
    case 'approve': return { report: approveReport_(u, req) };
    case 'return': return { report: returnReport_(u, req) };
    case 'feedback': return { report: feedback_(u, req) };
    case 'signature': return signature_(u, req);
    case 'setPin': return setPin_(u, req);
    case 'pinList': return pinList_(u, req);
    case 'sendForm': return sendForm_(u, req);
    case 'sendVisitC': return sendVisitC_(u, req);
    case 'vpFeedback': return vpFeedback_(u, req);
    case 'upload': return upload_(u, req);
    case 'setStudents': return setStudents_(u, req);
    case 'myStudents': return { students: myStudents_(u) };
    case 'sabRefresh': CacheService.getScriptCache().remove('sabPA4'); return { done: 1 };   // زر «تحديث ومزامنة»: يجلب إجراءات سبع سنابل فورًا
    case 'file': return getFile_(u, req);
    case 'setSig': return setSig_(u, req);
    case 'syncIndibat': if (!isVP_(u)) fail_('للنائب الأكاديمي فقط'); indibat_(true); return { records: listRecords_(u), indibatAt: PropertiesService.getScriptProperties().getProperty('indibatAt') || '' };
    case 'prqSubmit': return prqSubmit_(u, req);
    case 'prqAct': return prqAct_(u, req);
    case 'prqSeen': return prqSeen_(u, req);
    case 'logout': CacheService.getScriptCache().remove('tok_' + req.token); return { ok: true };
  }
  fail_('عملية غير معروفة');
}
function doPost(e) {
  try { const req = JSON.parse(e.postData.contents); return out_(Object.assign({ ok: true }, route_(req))); }
  catch (err) { return out_({ ok: false, error: String(err && err.message || err) }); }
}
function doGet(e) { if (e && e.parameter && e.parameter.prq) return prqMailPage_(e.parameter); return out_({ ok: true, name: 'الميزان — ميزان تربوي' }); }

/* ------------------------------------------------------------------ تهيئة لمرة واحدة */
function setup() {
  // يضبط عمود التاريخ في السجلات كنص حتى لا تتحول التواريخ
  sheet_(SH.rec).getRange('D:D').setNumberFormat('@');
  sheet_(SH.rep).getRange('D:E').setNumberFormat('@');
  // تجربة الوصول لملف التوقيع (يطلب الصلاحية أول مرة)
  const it = DriveApp.getFolderById(PRIVATE_FOLDER).getFilesByName(SIG_FILE);
  Logger.log(it.hasNext() ? 'التوقيع موجود ✓' : 'لم يُعثر على ملف التوقيع');
  Logger.log('عدد المعلمات: ' + (rows_(SH.teachers).rows.length));
  Logger.log('حصة البريد المتبقية اليوم: ' + MailApp.getRemainingDailyQuota());
  Logger.log('عنوان المنصات للإرسال: ' + (GmailApp.getAliases().map(a => String(a).toLowerCase()).indexOf(PLATFORM_MAIL) >= 0 ? 'جاهز ✓' : 'لم يُضبط بعد'));
}

/* ------------------------------------------------------------------ المزامنة التلقائية مع سبع سنابل
   تُشغَّل مرة واحدة من المحرّر (اختاري startSanabilAutoSync ثم Run): بعدها تُرسَل أعمال المعلمات إلى سبع سنابل
   كل 10 دقائق تلقائياً، حتى لو لم يحفظ أحد شيئاً في الميزان. */
function startSanabilAutoSync() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sanabilAutoSync').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sanabilAutoSync').timeBased().everyMinutes(10).create();
  const msg = syncSanabil(); Logger.log('تم تشغيل المزامنة التلقائية كل 10 دقائق — ' + msg); return msg;
}
function sanabilAutoSync() { try { syncSanabil(); } catch (e) { Logger.log(e); } }


/* ================================================================== إذنٌ مُيسَّر — استئذان المعلمات
   المعلمة تطلب ← منسقة القسم ← النائب الأكاديمي ← مديرة المدرسة ← يُسجَّل في رصيدها (الانضباط الوظيفي) وتصلها رسالة الموافقة.
   الرصيد: 10 ساعات شخصية في الشهر (إذن العمل لا يُحسب). نهاية الدوام 2:00 ظهراً. */
const PRQ_LIMIT = 10;
const PLATFORM_MAIL = 'alshaimaa.platforms@gmail.com';    // كل رسائل المنصات تخرج من هذا العنوان فقط
const PRQ_ST = { coord: 1, vp: 2, pr: 3, ok: 4 };
const PRQ_WHO = { coord: 'منسقة القسم', vp: 'النائب الأكاديمي', pr: 'مديرة المدرسة' };
const PRQ_DEF = 'في حفظ الله ورعايته';

function prqLvl_(u) { if (!u) return 0; if (u.id === 'p1' || (isPrincipal_(u) && u.name === 'شيخة الرميحي')) return 3; if (isVP_(u)) return 2; if (u.role === 'coord') return 1; return 0; }
function coordsOf_(dept) {
  return rows_(SH.users).rows.filter(r => r[0] && roleOf_(r) === 'coord' && String(r[5]).trim() !== 'لا' && String(r[2]).split('|').map(s => s.trim()).indexOf(String(dept)) >= 0)
    .map(r => ({ id: String(r[0]), name: String(r[3]).trim() }));
}
function isCoordName_(n) { return rows_(SH.users).rows.some(r => roleOf_(r) === 'coord' && String(r[3]).trim() === String(n).trim()); }
function mailOf_(name) { const r = rows_(SH.teachers).rows.find(x => String(x[1]).trim() === String(name).trim()); const m = r && String(r[7] || '').trim(); return m && /@/.test(m) ? m : ''; }
function vpMail_() { let m = PropertiesService.getScriptProperties().getProperty('VP_MAIL') || mailOf_('آسيا الذبياني'); if (!m) { try { m = Session.getEffectiveUser().getEmail(); } catch (e) { m = ''; } } return m; }
function prqFirst_(dept, t) { return (!isCoordName_(t) && coordsOf_(dept).some(c => c.name !== t)) ? 'coord' : 'vp'; }
function prqNext_(st) { return st === 'coord' ? 'vp' : st === 'vp' ? 'pr' : 'ok'; }

/* البريد: يخرج من عنوان المنصات فقط، ولا يُرسل أبداً من البريد الشخصي */
function platMail_(to, subject, html) {
  if (!to) return false;
  try {
    const opt = { htmlBody: html, name: 'مدرسة الشيماء — الميزان' };
    let me = ''; try { me = String(Session.getEffectiveUser().getEmail()).toLowerCase(); } catch (e) {}
    if (me === PLATFORM_MAIL) { opt.to = to; opt.subject = subject; MailApp.sendEmail(opt); return true; }
    if (GmailApp.getAliases().map(a => String(a).toLowerCase()).indexOf(PLATFORM_MAIL) < 0) { log_(null, 'بريد لم يُرسل', '', 'لم يُضبط عنوان المنصات بعد ← ' + to); return false; }
    opt.from = PLATFORM_MAIL; GmailApp.sendEmail(to, subject, 'افتحي الرسالة في تطبيق بريد يدعم التنسيق', opt); return true;
  } catch (e) { Logger.log(e); log_(null, 'بريد لم يُرسل', '', String(e).slice(0, 120)); return false; }
}
function mailBox_(title, body, btns) {
  return '<div dir="rtl" style="font-family:Tahoma,Arial;max-width:560px;margin:auto;border:1px solid #E3D9C6;border-radius:14px;overflow:hidden">' +
    '<div style="background:#7A1F3D;color:#fff;padding:14px 18px;font-size:18px;font-weight:bold">' + title + '</div>' +
    '<div style="padding:16px 18px;line-height:2;font-size:15px;color:#222">' + body + '</div>' +
    (btns ? '<div style="padding:0 18px 18px">' + btns + '</div>' : '') +
    '<div style="background:#F7F2EA;color:#7a6a55;font-size:12px;padding:8px 18px">مدرسة الشيماء الثانوية للبنات — منصة الميزان</div></div>';
}
function mailBtn_(href, txt, c) { return '<a href="' + href + '" style="display:inline-block;background:' + (c || '#0A8F8A') + ';color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;margin:4px;font-weight:bold">' + txt + '</a>'; }
function prqKey_() { const P = PropertiesService.getScriptProperties(); let k = P.getProperty('PRQ_KEY'); if (!k) { k = Utilities.getUuid() + Utilities.getUuid(); P.setProperty('PRQ_KEY', k); } return k; }
function prqSig_(id, st, uid) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(id + '|' + st + '|' + uid, prqKey_())).slice(0, 24); }
function prqDesc_(d, date) { return '<b>' + d.t + '</b> — ' + (d.kind || '') + '<br>اليوم: <b>' + date + '</b> · من ' + d.from + ' إلى ' + d.to + ' (' + d.h + ' ساعة)<br>السبب: ' + (d.reason || '') + (d.note ? ' — ' + d.note : ''); }
/* إشعار من عليها الاعتماد الآن */
function prqNotify_(rec) { try { prqNotifyX_(rec); } catch (e) { log_(null, 'بريد لم يُرسل', rec.dept, String(e.message || e).slice(0, 120)); } }
function prqNotifyX_(rec) {
  const d = rec.d, st = d.st; let to = [];
  if (st === 'coord') to = coordsOf_(rec.dept).filter(c => c.name !== d.t).map(c => ({ id: c.id, m: mailOf_(c.name) }));
  if (st === 'vp') to = [{ id: 'admin', m: vpMail_() }];
  if (st === 'pr') to = [{ id: 'p1', m: PRINCIPAL_MAIL }];
  let url = ''; try { url = ScriptApp.getService().getUrl(); } catch (e) {}
  to.forEach(x => {
    const btn = url ? mailBtn_(url + '?prq=' + encodeURIComponent(rec.id) + '&s=' + st + '&u=' + x.id + '&k=' + prqSig_(rec.id, st, x.id), '✓ اعتماد الإذن') : '';
    platMail_(x.m, 'طلب إذن بانتظار اعتمادكِ — ' + d.t, mailBox_('إذنٌ مُيسَّر — طلب بانتظار اعتمادكِ', prqDesc_(d, rec.date) + '<br><br>يمكنكِ الاعتماد من هنا مباشرة، أو من صفحة «إذنٌ مُيسَّر» في الميزان (اعتماد الكل).', btn));
  });
}
function prqFind_(t, id) { for (let i = 0; i < t.rows.length; i++) if (String(t.rows[i][0]) === String(id)) return i; return -1; }
function prqPhrase_(uid) { try { const o = JSON.parse(PropertiesService.getScriptProperties().getProperty('phr_' + uid) || 'null'); if (o && o.until >= now_().slice(0, 10)) return o.p; } catch (e) {} return ''; }

/* طلب المعلمة (جديد أو بعد إعادته للتعديل) */
function prqSubmit_(u, p) {
  const x = p.rec || {};
  if (u.role !== 'teacher' && u.role !== 'coord') fail_('طلب الإذن للمعلمات والمنسقات');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(x.date || ''))) fail_('حدّدي يوم الإذن');
  if (!/^\d{2}:\d{2}$/.test(String(x.from || '')) || !/^\d{2}:\d{2}$/.test(String(x.to || ''))) fail_('حدّدي وقت الإذن');
  const h = Math.round(((+x.to.slice(0, 2) * 60 + +x.to.slice(3)) - (+x.from.slice(0, 2) * 60 + +x.from.slice(3))) / 60 * 100) / 100;
  if (!(h > 0 && h <= 7)) fail_('وقت النهاية يجب أن يكون بعد وقت البداية');
  if (!String(x.reason || '').trim()) fail_('اختاري سبب الإذن');
  const kind = x.kind === 'إذن عمل' ? 'إذن عمل' : 'شخصي';
  const dept = u.dept[0];
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let rec;
  try {
    const t = rows_(SH.rec);
    const d = { t: u.name, from: x.from, to: x.to, h: h, kind: kind, reason: String(x.reason).slice(0, 120), note: String(x.note || '').slice(0, 300), steps: [], at: now_() };
    d.st = prqFirst_(dept, u.name); d.first = d.st;
    const sum = 'إذن ' + kind + ' — ' + h + ' ساعة — ' + d.reason;
    if (x.id) {
      const i = prqFind_(t, x.id); if (i < 0) fail_('الطلب غير موجود');
      let od = {}; try { od = JSON.parse(t.rows[i][5] || '{}'); } catch (e) {}
      if (t.rows[i][2] !== 'PRQ' || od.t !== u.name) fail_('لا تملكين صلاحية على هذا الطلب');
      if (od.st === 'ok') fail_('هذا الإذن معتمد، ولا يُعدَّل');
      d.hist = (od.hist || []).concat(od.steps || []).concat(od.ret ? [od.ret] : []).slice(-10);
      const row = [x.id, dept, 'PRQ', x.date, sum, JSON.stringify(d), u.name, t.rows[i][7], now_()];
      t.sh.getRange(i + 2, 1, 1, 9).setValues([row]); rec = recObj_(row);
      log_(u, 'تعديل طلب إذن', dept, sum);
    } else {
      const id = 'q' + new Date().getTime().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
      const row = [id, dept, 'PRQ', x.date, sum, JSON.stringify(d), u.name, now_(), now_()];
      t.sh.appendRow(row); rec = recObj_(row);
      log_(u, 'طلب إذن', dept, sum);
    }
  } finally { lock.releaseLock(); }
  prqNotify_(rec);
  return { record: rec };
}

/* اعتماد أو إعادة (طلب واحد أو الكل) */
function prqApply_(u, t, i, act, phrase, note) {
  const row = t.rows[i]; if (row[2] !== 'PRQ') fail_('ليس طلب إذن');
  const d = JSON.parse(row[5] || '{}'); const lv = prqLvl_(u);
  if (d.st === 'ok' || d.st === 'ret') return null;
  if (!lv || lv < PRQ_ST[d.st]) fail_('هذا الطلب بانتظار ' + PRQ_WHO[d.st]);
  if (lv === 1 && (u.dept.indexOf(row[1]) < 0 || d.t === u.name)) fail_('هذا الطلب ليس لقسمكِ');
  const who = lv === 3 ? 'pr' : lv === 2 ? 'vp' : 'coord';
  if (act === 'ret') {
    d.ret = { by: u.name, w: who, at: now_(), note: String(note || '').slice(0, 300) }; d.st = 'ret'; d.seen = false;
  } else {
    d.steps = (d.steps || []).filter(s => PRQ_ST[s.w] < PRQ_ST[who]).concat([{ by: u.name, w: who, at: now_(), ph: String(phrase || PRQ_DEF).slice(0, 80) }]);
    d.st = prqNext_(who); if (d.st === 'ok') { d.okAt = now_(); d.seen = false; }
  }
  row[5] = JSON.stringify(d); row[8] = now_();
  t.sh.getRange(i + 2, 6).setValue(row[5]); t.sh.getRange(i + 2, 9).setValue(row[8]);
  log_(u, act === 'ret' ? 'إعادة طلب إذن' : 'اعتماد طلب إذن', row[1], d.t + ' — ' + row[4]);
  return recObj_(row);
}
function prqAfter_(rec) { try { return prqAfterX_(rec); } catch (e) { log_(null, 'تنبيه', rec.dept, String(e.message || e).slice(0, 120)); return [rec]; } }
function prqAfterX_(rec) {
  const d = rec.d; const tm = mailOf_(d.t);
  if (d.st === 'ret') { platMail_(tm, 'طلب إذنكِ يحتاج تعديلاً', mailBox_('إذنٌ مُيسَّر', 'معلمتي الغالية أ. ' + d.t + '،<br>أُعيد طلب إذنكِ ليوم ' + rec.date + ' للتعديل' + (d.ret.note ? ': <b>' + d.ret.note + '</b>' : '') + '.<br>افتحي «إذنٌ مُيسَّر» في الميزان لتعديله وإرساله.')); return [rec]; }
  if (d.st !== 'ok') { prqNotify_(rec); return [rec]; }
  // الاعتماد النهائي: يُسجَّل في الانضباط الوظيفي تلقائياً (بلا إدخال ثالث)
  const t = rows_(SH.rec); const has = t.rows.find(r => r[2] === 'TDS' && String(r[5]).indexOf('"prq":"' + rec.id + '"') >= 0);
  let tds = null;
  if (!has) {
    const td = { t: d.t, abs: [], perm: [{ date: rec.date, h: d.h, type: d.kind === 'إذن عمل' ? 'إذن عمل' : 'شخصي' }], prq: rec.id, why: d.reason };
    const row = ['r' + new Date().getTime().toString(36) + Math.floor(Math.random() * 1e4).toString(36), rec.dept, 'TDS', rec.date, 'استئذان 1 (إذنٌ مُيسَّر)', JSON.stringify(td), 'إذنٌ مُيسَّر', now_(), now_()];
    t.sh.appendRow(row); tds = recObj_(row);
  }
  const ph = (d.steps || []).map(s => s.ph).filter((x, k, A) => x && A.indexOf(x) === k);
  platMail_(tm, 'تمت الموافقة على إذنكِ 🤍', mailBox_('تمت الموافقة على إذنكِ', 'معلمتي الغالية أ. ' + d.t + '،<br><b style="font-size:18px;color:#7A1F3D">تمت الموافقة على إذنكِ، ' + (ph[0] || PRQ_DEF) + '، يومكِ سعيد 🤍</b><br>' + prqDesc_(d, rec.date) + (ph.length > 1 ? '<br>' + ph.slice(1).join(' · ') : '')));
  return tds ? [rec, tds] : [rec];
}
function prqAct_(u, p) {
  const ids = [].concat(p.ids || p.id || []); if (!ids.length) fail_('لا توجد طلبات');
  if (p.fix && p.phrase) { const until = Utilities.formatDate(new Date(Date.now() + 6 * 864e5), 'Asia/Qatar', 'yyyy-MM-dd'); PropertiesService.getScriptProperties().setProperty('phr_' + u.id, JSON.stringify({ p: String(p.phrase).slice(0, 80), until: until })); }
  const out = [], skipped = [];
  const lock = LockService.getScriptLock(); lock.waitLock(25000);
  const done = [];
  try {
    const t = rows_(SH.rec);
    ids.forEach(id => { try { const i = prqFind_(t, id); if (i < 0) throw new Error('غير موجود'); const r = prqApply_(u, t, i, p.act === 'ret' ? 'ret' : 'ok', p.phrase || prqPhrase_(u.id), p.note); if (r) done.push(r); } catch (e) { skipped.push(String(e.message || e)); } });
  } finally { lock.releaseLock(); }
  done.forEach(r => prqAfter_(r).forEach(x => out.push(x)));
  if (done.some(r => r.d.st === 'ok')) sabSoon_('TDS');
  return { records: out, skipped: skipped, phrase: prqPhrase_(u.id) };
}
function prqSeen_(u, p) {
  const t = rows_(SH.rec); const i = prqFind_(t, p.id); if (i < 0) return { ok: true };
  const d = JSON.parse(t.rows[i][5] || '{}'); if (d.t !== u.name) fail_('غير مسموح');
  d.seen = true; t.sh.getRange(i + 2, 6).setValue(JSON.stringify(d)); return { ok: true };
}
/* ما يظهر لكل حساب من طلبات الإذن: المعلمة طلباتها فقط، والمنسقة طلبات قسمها، والإدارة الجميع */
function prqList_(u) {
  return rows_(SH.rec).rows.filter(r => r[2] === 'PRQ').map(recObj_).filter(x => u.role === 'admin' || x.d.t === u.name || (u.role === 'coord' && u.dept.indexOf(x.dept) >= 0));
}

/* الاعتماد من زر البريد: صفحة تأكيد بزر (لا يُعتمد شيء بمجرد فتح الرابط) */
function prqMailPage_(q) {
  const t = rows_(SH.rec); const i = prqFind_(t, q.prq);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let body;
  if (i < 0 || q.k !== prqSig_(q.prq, q.s, q.u)) body = '<p>الرابط غير صالح أو انتهت صلاحيته.</p>';
  else {
    const d = JSON.parse(t.rows[i][5] || '{}');
    if (d.st !== q.s) body = '<p>' + (d.st === 'ok' ? 'هذا الإذن معتمد مسبقاً ✓' : 'تم التعامل مع هذا الطلب مسبقاً ✓') + '</p>';
    else body = '<p>' + prqDesc_({ t: esc(d.t), kind: esc(d.kind), from: d.from, to: d.to, h: d.h, reason: esc(d.reason), note: esc(d.note) }, esc(t.rows[i][3])) + '</p>' +
      '<select id="ph" style="font-size:16px;padding:8px;border-radius:8px;width:100%">' + ['في حفظ الله ورعايته', 'يسّر الله أمركِ وقضى حاجتكِ', 'رافقتكِ السلامة وعوداً حميداً', 'أعانكِ الله ويسّر لكِ'].map(x => '<option>' + x + '</option>').join('') + '</select>' +
      '<button id="b" style="margin-top:12px;width:100%;background:#0A8F8A;color:#fff;border:0;border-radius:10px;padding:12px;font-size:17px;font-weight:bold">✓ اعتماد الإذن</button><p id="m"></p>' +
      '<script>document.getElementById("b").onclick=function(){this.disabled=true;document.getElementById("m").textContent="جارٍ الاعتماد…";google.script.run.withSuccessHandler(function(x){document.getElementById("m").textContent=x;}).withFailureHandler(function(e){document.getElementById("m").textContent=e.message;}).prqMailAct(' + JSON.stringify(q) + ',document.getElementById("ph").value);};</script>';
  }
  return HtmlService.createHtmlOutput('<div dir="rtl" style="font-family:Tahoma,Arial;max-width:520px;margin:30px auto;padding:20px;border:1px solid #E3D9C6;border-radius:14px;line-height:2"><h2 style="color:#7A1F3D">إذنٌ مُيسَّر</h2>' + body + '</div>')
    .setTitle('إذنٌ مُيسَّر').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
function prqMailAct(q, phrase) {
  if (!q || q.k !== prqSig_(q.prq, q.s, q.u)) throw new Error('الرابط غير صالح');
  const u = userById_(String(q.u)); if (!u) throw new Error('الحساب غير موجود');
  const lock = LockService.getScriptLock(); lock.waitLock(25000); let r;
  try { const t = rows_(SH.rec); const i = prqFind_(t, q.prq); if (i < 0) throw new Error('الطلب غير موجود');
    const d = JSON.parse(t.rows[i][5] || '{}'); if (d.st !== q.s) return 'تم التعامل مع هذا الطلب مسبقاً ✓';
    r = prqApply_(u, t, i, 'ok', phrase || prqPhrase_(u.id), ''); } finally { lock.releaseLock(); }
  if (r) { prqAfter_(r); if (r.d.st === 'ok') sabSoon_('TDS'); }
  return 'تم اعتماد الإذن ✓ جزاكِ الله خيراً';
}

/* تذكير صباحي لمن لديها طلبات معلّقة */
function prqMorning() {
  const L = rows_(SH.rec).rows.filter(r => r[2] === 'PRQ').map(recObj_).filter(x => ['coord', 'vp', 'pr'].indexOf(x.d.st) >= 0);
  if (!L.length) return;
  const by = {};
  L.forEach(x => { const to = x.d.st === 'coord' ? coordsOf_(x.dept).filter(c => c.name !== x.d.t).map(c => mailOf_(c.name)) : [x.d.st === 'vp' ? vpMail_() : PRINCIPAL_MAIL]; to.filter(Boolean).forEach(m => (by[m] = by[m] || []).push(x)); });
  Object.keys(by).forEach(m => platMail_(m, 'صباح الخير — ' + by[m].length + ' طلب إذن بانتظار اعتمادكِ', mailBox_('طلبات إذن بانتظار اعتمادكِ', by[m].map(x => '• ' + x.d.t + ' — ' + x.date + ' (' + x.d.h + ' س) — ' + x.d.reason).join('<br>') + '<br><br>افتحي «إذنٌ مُيسَّر» في الميزان، واضغطي «اعتماد الكل».')));
}

/* ================================================================== النسخ الاحتياطي اليومي
   نسخة كاملة من ملف الميزان كل ليلة في مجلد «النسخ الاحتياطية» داخل المجلد الخاص، ويُحتفظ بآخر 30 نسخة
   (الأقدم تنتقل إلى سلة المهملات ولا تُحذف نهائياً). */
function dailyBackup() {
  const root = DriveApp.getFolderById(PRIVATE_FOLDER); const it = root.getFoldersByName('النسخ الاحتياطية');
  const f = it.hasNext() ? it.next() : root.createFolder('النسخ الاحتياطية');
  DriveApp.getFileById(SS_ID).makeCopy('نسخة الميزان ' + Utilities.formatDate(new Date(), 'Asia/Qatar', 'yyyy-MM-dd HH-mm'), f);
  const L = []; const fi = f.getFiles(); while (fi.hasNext()) L.push(fi.next());
  L.sort((a, b) => b.getDateCreated() - a.getDateCreated()).slice(30).forEach(x => x.setTrashed(true));
  Logger.log('تم حفظ نسخة احتياطية ✓ — عدد النسخ: ' + Math.min(L.length, 30));
}
/* تُشغَّل مرة واحدة من المحرّر: النسخ الاحتياطي كل ليلة (2 فجراً) + تذكير الاعتماد الصباحي (6:30) */
function startDailyJobs() {
  ScriptApp.getProjectTriggers().filter(t => ['dailyBackup', 'prqMorning'].indexOf(t.getHandlerFunction()) >= 0).forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyBackup').timeBased().everyDays(1).atHour(2).inTimezone('Asia/Qatar').create();
  ScriptApp.newTrigger('prqMorning').timeBased().everyDays(1).atHour(6).nearMinute(30).inTimezone('Asia/Qatar').create();
  dailyBackup();
  const al = GmailApp.getAliases();
  Logger.log('تم ✓ النسخ الاحتياطي يومياً، والتذكير الصباحي. عنوان المنصات ' + (al.map(a => String(a).toLowerCase()).indexOf(PLATFORM_MAIL) >= 0 ? 'جاهز للإرسال ✓' : 'لم يُضبط بعد في Gmail (Send mail as)'));
}
