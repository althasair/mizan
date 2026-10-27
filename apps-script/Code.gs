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
const SESSION_SECONDS = 6 * 60 * 60;                          // مدة الجلسة: 6 ساعات
const PROTECTED_ITEMS = ['AC', 'TA'];                                 // لا يحذفها إلا النائب الأكاديمي
const ADMIN_ITEMS = ['VPV', 'FILES', 'NOTE', 'CF', 'AF', 'AST'];                 // بنود خاصة بالنائب لا تراها المنسقات

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
function roleOf_(r) { return r[0] === 'admin' ? 'admin' : String(r[1]).trim() === 'معلمة' ? 'teacher' : 'coord'; }
const TEACHER_ITEMS = ['TA', 'TPV', 'TWS', 'TPA', 'TACH'];      // ما تسجّله المعلمة بنفسها: مبادرات وأنشطة، زيارات تبادلية، ورش وتطوير الزملاء، أولياء الأمور، إنجازات
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
  const fails = Number(cache.get('fails') || 0);
  if (fails >= 25) fail_('تم إيقاف الدخول مؤقتاً بسبب محاولات خاطئة متكررة. حاولي بعد 10 دقائق.');
  const u = findUserByPin_(pin);
  if (!u) { cache.put('fails', String(fails + 1), 600); Utilities.sleep(700); fail_('الرقم السري غير صحيح'); }
  // المنسقات من «الميزان» فقط؛ والمعلمات يدخلن «الميزان» بتبويبات محدودة، و«سبع سنابل» لمبادراتهن وأنشطتهن
  if (app === 'sanabil' && u.role === 'coord') fail_('هذا الرقم للدخول إلى منصة الميزان');
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
  return v.filter(r => r[1] && S[String(r[0]).trim()]).map(r => ({ s: String(r[0]).trim(), n: String(r[1]).trim() }));
}
function boot_(u) {
  if (u.role === 'teacher') return bootTeacher_(u);
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
  return { user: { id: u.id, role: u.role, dept: u.dept, name: u.name }, periods: per, cal: cal, pd: pd, staff: staff, coords: coords, records: recs, reports: reps, server: now_() };
}
function recObj_(r) {
  let d = {}; try { d = JSON.parse(r[5] || '{}'); } catch (e) {}
  return { id: String(r[0]), dept: r[1], item: r[2], date: iso_(r[3]), sum: r[4], d: d, by: r[6], at: iso_(r[7]), up: iso_(r[8]) };
}
function listRecords_(u) {
  if (u.role === 'teacher') return bootTeacher_(u).records;
  return rows_(SH.rec).rows.filter(r => r[0]).map(recObj_)
    .filter(x => u.role === 'admin' || (ADMIN_ITEMS.indexOf(x.item) < 0 && (u.dept.indexOf(x.dept) >= 0 || (CROSS_ITEMS.indexOf(x.item) >= 0 && x.d && (u.dept.indexOf(x.d.vdept) >= 0 || u.dept.indexOf(x.d.bydept) >= 0)))));
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
  if (ADMIN_ITEMS.indexOf(rec.item) >= 0 && u.role !== 'admin') fail_('هذا البند خاص بالنائب الأكاديمي');
  if (u.role === 'teacher') {
    if (TEACHER_ITEMS.indexOf(rec.item) < 0) fail_('يمكن للمعلمة تسجيل مبادراتها وأنشطتها فقط');
    rec.d = rec.d || {}; rec.d.t = u.name; rec.dept = u.dept[0];
    const T = rows_(SH.teachers).rows; const dOf = n => { const x = T.find(r => r[1] === n); return x ? String(x[0]) : ''; };
    if (rec.item === 'TPV') rec.d.vdept = dOf(rec.d.v);
    if (rec.item === 'TWS') rec.d.bydept = rec.d.role === 'قدّمتُ لتطوير الزملاء' ? rec.dept : dOf(rec.d.by);
  } else if (TEACHER_ITEMS.indexOf(rec.item) >= 0 && u.role !== 'admin') fail_('هذا البند تسجّله المعلمة بنفسها');
  if (u.role === 'coord') assertNotLocked_(rec.dept, rec.date);
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
        if (u.role !== 'admin' && PROTECTED_ITEMS.indexOf(String(t.rows[i][2])) >= 0) fail_('حذف الأنشطة والمبادرات متاح للنائب الأكاديمي فقط');
        if (u.role === 'teacher') { let od = {}; try { od = JSON.parse(t.rows[i][5] || '{}'); } catch (e) {} if (TEACHER_ITEMS.indexOf(String(t.rows[i][2])) < 0 || od.t !== u.name) fail_('لا تملكين صلاحية على هذا السجل'); }
        else if (u.role === 'coord' && TEACHER_ITEMS.indexOf(String(t.rows[i][2])) >= 0) fail_('هذا السجل تسجّله المعلمة بنفسها');
        if (u.role !== 'admin') assertNotLocked_(t.rows[i][1], iso_(t.rows[i][3]));
        t.sh.deleteRow(i + 2); log_(u, 'حذف سجل', t.rows[i][1], t.rows[i][2] + ' — ' + String(t.rows[i][4]).slice(0, 80));
        return { id: id };
      }
    }
    fail_('السجل غير موجود');
  } finally { lock.releaseLock(); }
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
  if (u.role !== 'admin') fail_('الاعتماد للنائب الأكاديمي فقط');
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
  if (u.role !== 'admin') fail_('للنائب الأكاديمي فقط');
  const t = rows_(SH.rep); const i = findRep_(t, p.dept, p.period);
  if (i < 0) fail_('التقرير غير موجود');
  const r = t.rows[i]; r[5] = 'معاد للتعديل'; r[8] = ''; r[9] = ''; r[10] = p.feedback || r[10] || '';
  t.sh.getRange(i + 2, 1, 1, 12).setValues([r]);
  log_(u, 'إعادة تقرير للتعديل', p.dept, p.period);
  return repObj_(r);
}
function feedback_(u, p) {
  if (u.role !== 'admin') fail_('للنائب الأكاديمي فقط');
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
  if (u.role !== 'admin' && u.id !== p.who) fail_('التوقيع غير متاح');
  return { data: sigData_('sig-' + p.who + '.png') };
}
function setSig_(u, p) {
  if (u.role !== 'admin') fail_('للنائب الأكاديمي فقط');
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
  // توقيع النائب لا يُعطى إلا للنائب نفسها، أو لتقرير معتمد يخص قسم المنسقة
  if (u.role !== 'admin') {
    const t = rows_(SH.rep); const i = findRep_(t, p.dept, p.period);
    if (i < 0 || t.rows[i][5] !== 'معتمد' || !canDept_(u, p.dept)) fail_('التوقيع غير متاح');
  }
  const it = DriveApp.getFolderById(PRIVATE_FOLDER).getFilesByName(SIG_FILE);
  if (!it.hasNext()) fail_('ملف التوقيع غير موجود');
  const b = it.next().getBlob();
  return { data: 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) };
}

/* ------------------------------------------------------------------ إدارة (النائب) */
function setPin_(u, p) {
  if (u.role !== 'admin') fail_('للنائب الأكاديمي فقط');
  if (!/^\d{4,8}$/.test(String(p.newPin))) fail_('الرقم السري من 4 إلى 8 أرقام');
  const t = rows_(SH.users);
  if (t.rows.some(r => String(r[4]) === String(p.newPin) && r[0] !== p.id)) fail_('هذا الرقم مستخدم لحساب آخر');
  for (let i = 0; i < t.rows.length; i++) if (t.rows[i][0] === p.id) { t.sh.getRange(i + 2, 5).setValue(String(p.newPin)); log_(u, 'تغيير رقم سري', '', p.id); return { ok: true }; }
  fail_('الحساب غير موجود');
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
  MailApp.sendEmail({ to: String(p.to), subject: String(p.subject || name), htmlBody: String(p.body || ''), attachments: [pdf], name: u.name + ' — نائب المدير للشؤون الأكاديمية' });
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

/* ------------------------------------------------------------------ الموجّه */
function route_(req) {
  const a = req.action;
  if (a === 'ping') return { ok: true, name: 'الميزان', at: now_() };
  if (a === 'login') return login_(req.pin, req.app);
  const u = auth_(req.token);
  switch (a) {
    case 'boot': return boot_(u);
    case 'records': return { records: listRecords_(u) };
    case 'save': return { record: saveRecord_(u, req.rec) };
    case 'saveMany': return saveMany_(u, req.list);
    case 'delete': return deleteRecord_(u, req.id);
    case 'sign': return { report: signReport_(u, req) };
    case 'approve': return { report: approveReport_(u, req) };
    case 'return': return { report: returnReport_(u, req) };
    case 'feedback': return { report: feedback_(u, req) };
    case 'signature': return signature_(u, req);
    case 'setPin': return setPin_(u, req);
    case 'sendForm': return sendForm_(u, req);
    case 'sendVisitC': return sendVisitC_(u, req);
    case 'upload': return upload_(u, req);
    case 'file': return getFile_(u, req);
    case 'setSig': return setSig_(u, req);
    case 'logout': CacheService.getScriptCache().remove('tok_' + req.token); return { ok: true };
  }
  fail_('عملية غير معروفة');
}
function doPost(e) {
  try { const req = JSON.parse(e.postData.contents); return out_(Object.assign({ ok: true }, route_(req))); }
  catch (err) { return out_({ ok: false, error: String(err && err.message || err) }); }
}
function doGet() { return out_({ ok: true, name: 'الميزان — ميزان تربوي' }); }

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
}
