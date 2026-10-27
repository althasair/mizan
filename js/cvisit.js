/* الميزان — الحضور الصفي للمنسقة: خطة الزيارات الشهرية + استمارة الإشراف + متابعة توصيات الزيارة السابقة (ثابتة)
   كل زيارة تُحفظ بند «V» فتنعكس تلقائياً على تقرير أعمال القسم */
'use strict';

/* خطة الزيارات الشهرية لكل معلمة (ثابتة بقرار النائب الأكاديمي) */
const VDEF = { n: 2, seq: ['كلية', 'جزئية'], min: 10, max: 15, lbl: 'كلية ثم جزئية' };
const VPLAN = {
  'هبه الإبراهيم': { n: 4, seq: ['كلية', 'جزئية', 'كلية', 'جزئية'], min: 6, max: 9, lbl: 'أسبوعياً بالتناوب (معلمة مستجدة)' },
  'إسراء عزت': { n: 3, seq: ['كلية', 'جزئية', 'جزئية'], min: 7, max: 12, lbl: 'كلية ثم جزئية ثم جزئية' },
};
const planOf = t => Object.assign({}, VDEF, VPLAN[t] || {});
const FU_ST = ['تم التنفيذ', 'تم التنفيذ جزئياً', 'لم تُنفذ بعد'];
const ORD = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة', 'الثالثة عشرة', 'الرابعة عشرة', 'الخامسة عشرة', 'السادسة عشرة', 'السابعة عشرة', 'الثامنة عشرة', 'التاسعة عشرة', 'العشرون'];
const daysBtw = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const monthKey = d => String(d || '').slice(0, 7);
const cvTeachers = () => S.staff.filter(s => s.dept === S.dept && s.role !== 'منسقة' && s.name !== S.user.name).map(s => s.name).sort((a, b) => a.localeCompare(b, 'ar'));
const cvVisits = t => S.records.filter(r => r.item === 'V' && r.dept === S.dept && (!t || r.d.t === t)).sort((a, b) => (a.date || '').localeCompare(b.date || '') || String(a.id).localeCompare(String(b.id)));
/* توصيات الزيارة: النقاط التي تحتاج إلى تحسين (أو التوصيات في السجلات القديمة) */
const recsOf = r => { const d = r.d || {}; const L = (d.imp && d.imp.length) ? d.imp : [d.r1, d.r2, d.r3]; return uniqA(L.map(cleanEnd)); };
/* ما يُتابَع في الزيارة الجديدة: توصيات الزيارة السابقة + ما لم يُنفَّذ كلياً من متابعاتها */
function carryOf(prev) {
  if (!prev) return [];
  const pend = (prev.d.fu || []).filter(x => x.st && x.st !== 'تم التنفيذ').map(x => x.r);
  return uniqA([...recsOf(prev), ...pend]);
}
/* حالة المعلمة في الشهر */
function cvStatus(t, mk) {
  const P = planOf(t); const all = cvVisits(t); const inM = all.filter(r => monthKey(r.date) === mk);
  const last = all.filter(r => r.date <= today()).slice(-1)[0];
  const next = P.seq[inM.length % P.seq.length];
  const isCur = mk === monthKey(today());
  const gap = last ? daysBtw(last.date, today()) : null;
  let st, cls;
  if (inM.length >= P.n) { st = 'مكتملة' + (inM.length > P.n ? ` (+${inM.length - P.n} إضافية)` : ''); cls = 'ok'; }
  else if (!isCur) { st = `ناقصة (${P.n - inM.length})`; cls = 'bad'; }
  else if (!last) { st = 'لم تُزَر بعد'; cls = 'bad'; }
  else if (gap > P.max) { st = `تأخر موعد الحضور (${gap} يوماً)`; cls = 'bad'; }
  else if (gap >= P.min) { st = 'مستحقة الآن'; cls = 'warn'; }
  else { st = `التالية بعد ${P.min - gap} يوم`; cls = 'tf'; }
  const close = [];
  inM.forEach(r => { const i = all.indexOf(r); if (i > 0) { const g = daysBtw(all[i - 1].date, r.date); if (g < P.min) close.push({ r, g }); } });
  const order = inM.filter((r, i) => r.d.kj && r.d.kj !== P.seq[i % P.seq.length]);
  return { P, inM, last, next, st, cls, close, order, gap };
}

/* ================================================================== القائمة الشهرية */
async function C_visit(el) {
  await loadForms(); setTitle('الحضور الصفي');
  if (S.cvv) return cvForm(el, S.cvv === 'new' ? null : S.records.find(r => r.id === S.cvv));
  const mk = S.cvm || monthKey(today());
  const months = (() => { const L = []; const t = today(); let [y, m] = [2026, 9]; for (let k = 0; k < 12; k++) { const key = `${y}-${String(m).padStart(2, '0')}`; if (key > monthKey(t)) break; L.push(key); m++; if (m > 12) { m = 1; y++; } } return L.slice(-6); })();
  const T = cvTeachers(); const X = T.map(t => ({ t, ...cvStatus(t, mk) }));
  const req = X.reduce((a, x) => a + x.P.n, 0), done = X.reduce((a, x) => a + Math.min(x.inM.length, x.P.n), 0);
  const late = X.filter(x => x.cls === 'bad'), close = X.flatMap(x => x.close.map(c => ({ t: x.t, ...c }))), order = X.flatMap(x => x.order.map(r => ({ t: x.t, r, exp: x.P.seq[x.inM.indexOf(r) % x.P.seq.length] })));
  const mName = k => MONTHS[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4);
  el.innerHTML = `
  <div class="tabs">${months.map(k => `<button class="${k === mk ? 'on' : ''}" data-m="${k}">${mName(k)}</button>`).join('')}</div>
  <div class="grid g4">
    ${kpi('الزيارات المطلوبة', req, mName(mk), 'var(--navy)')}
    ${kpi('المنفذة', done, req ? Math.round(done / req * 100) + '% من المطلوب' : '', 'var(--ok)')}
    ${kpi('معلمات يحتجن زيارة', late.length, mk === monthKey(today()) ? 'متأخرة أو لم تُزر' : 'لم تكتمل خطتهن', 'var(--maroon)')}
    ${kpi('زيارات متقاربة', close.length, 'فاصل أقل من المطلوب', 'var(--gold)')}
  </div>
  <div class="note">الخطة الشهرية لكل معلمة: زيارتان (كلية ثم جزئية) بفاصل 10–15 يوماً، ما عدا: ${Object.entries(VPLAN).map(([n, p]) => `أ. ${esc(n)} (${p.n} زيارات: ${esc(p.lbl)})`).join('، ')}. ويمكنكِ إضافة زيارات إضافية. <b>كل زيارة تبدأ بمتابعة توصيات الزيارة السابقة</b>، كلية كانت أو جزئية، وتنعكس الزيارة تلقائياً على تقرير القسم.</div>
  ${(late.length || close.length || order.length) ? `<div class="card" style="border-inline-start:4px solid var(--gold)"><h2>تنبيهات لتنظيم وقتكِ <span class="sub">خاصة بكِ وحدكِ — لا تظهر في التقرير الشهري ولا لأي جهة أخرى</span></h2>
  <div style="font-size:13px;color:var(--muted);margin-bottom:6px">الغاية أن تتاح للمعلمة فرصة (10–15) يوماً بعد كل زيارة لتطبيق التوصيات قبل الزيارة التالية. وإن كنتِ ترغبين بالحضور لمعلمة أكثر من المطلوب، فلا حرج في تجاهل هذه التنبيهات.</div><ul style="margin:0;padding-inline-start:18px;line-height:2">
    ${late.map(x => `<li><b>أ. ${esc(x.t)}</b>: ${x.last ? 'تأخر موعد الحضور' + (x.gap != null ? ` (مضى ${x.gap} يوماً على آخر زيارة)` : '') : 'لم تُزر بعد'} — المخطط ${x.P.n} في الشهر، والمنفذ ${x.inM.length}.</li>`).join('')}
    ${close.map(c => `<li><b>أ. ${esc(c.t)}</b>: زيارة ${dm(c.r.date)} بعد ${c.g} ${c.g === 1 ? 'يوم' : 'أيام'} فقط من سابقتها — قد لا يتيح هذا الفاصل للمعلمة تطبيق التوصيات.</li>`).join('')}
    ${order.map(o => `<li><b>أ. ${esc(o.t)}</b>: زيارة ${dm(o.r.date)} سُجّلت ${esc(o.r.d.kj)} والمتوقع وفق الخطة ${esc(o.exp)}.</li>`).join('')}</ul></div>` : ''}
  <div class="card"><div class="row"><h2 style="margin:0">خطة ${mName(mk)}</h2><span class="sp"></span><button class="btn" id="cvNew">+ حضور صفي جديد</button></div>
  <div class="tbl" style="margin-top:10px"><table class="t"><tr><th>المعلمة</th><th>الخطة</th><th>زيارات الشهر</th><th>آخر زيارة</th><th>التالية المتوقعة</th><th>الحالة</th><th></th></tr>
  ${X.map(x => `<tr><td><b>${esc(x.t)}</b></td><td style="font-size:12px">${x.P.n} · ${esc(x.P.lbl)}</td>
    <td>${x.inM.map(r => `<button class="chip ${r.d.kj === 'كلية' ? 'tf' : ''}" data-o="${r.id}" style="cursor:pointer">${dm(r.date)} ${esc(r.d.kj || '')}</button>`).join(' ') || '—'}</td>
    <td>${x.last ? dmy(x.last.date) : '—'}</td><td>${x.inM.length >= x.P.n ? '<span class="chip">إضافية (اختياري)</span>' : `<span class="chip">${esc(x.next)}</span>`}</td>
    <td><span class="chip ${x.cls}">${esc(x.st)}</span></td><td><button class="btn sm" data-nt="${esc(x.t)}" data-kj="${esc(x.next)}">+ حضور</button></td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">لا توجد معلمات مسجلات في القسم</div></td></tr>'}</table></div></div>
  <div class="card"><h2>سجل الزيارات</h2><div class="tbl"><table class="t"><tr><th>التاريخ</th><th>المعلمة</th><th>النوع</th><th>الصف</th><th>متابعة السابقة</th><th>الإرسال</th><th></th></tr>
  ${cvVisits().filter(r => monthKey(r.date) === mk).reverse().map(r => { const f = r.d.fu || []; const ok = f.filter(x => x.st === 'تم التنفيذ').length;
    return `<tr><td>${dmy(r.date)}</td><td><b>${esc(r.d.t)}</b></td><td>${esc(r.d.kj || '')}${r.d.ty ? `<div style="font-size:11px;color:var(--muted)">${esc(r.d.ty)}</div>` : ''}</td><td>${esc(r.d.s || '')}</td>
    <td>${f.length ? `<span class="chip ${ok === f.length ? 'ok' : 'warn'}">${ok} من ${f.length} منفذة</span>` : (r.d.form ? '<span class="chip">أول زيارة</span>' : '<span class="chip">إدخال يدوي</span>')}</td>
    <td>${r.d.sent ? `<span class="chip ok">${dm(r.d.sent)}</span>` : '<span class="chip">لم تُرسل</span>'}</td><td><button class="btn sm sec" data-o="${r.id}">فتح</button></td></tr>`; }).join('') || '<tr><td colspan="7"><div class="empty">لا توجد زيارات في هذا الشهر</div></td></tr>'}</table></div></div>`;
  $$('[data-m]', el).forEach(b => b.onclick = () => { S.cvm = b.dataset.m; show(); });
  $('#cvNew').onclick = () => { S.cvv = 'new'; S.cvT = ''; S.cvK = ''; show(); };
  $$('[data-nt]', el).forEach(b => b.onclick = () => { S.cvv = 'new'; S.cvT = b.dataset.nt; S.cvK = b.dataset.kj; show(); });
  $$('[data-o]', el).forEach(b => b.onclick = () => { S.cvv = b.dataset.o; show(); });
}

/* ================================================================== الاستمارة */
function cvForm(el, rec) {
  const F = FORMS.visit;
  const d = rec ? JSON.parse(JSON.stringify(rec.d)) : { t: S.cvT || '', date: today(), mode: 'ميدانية', kj: S.cvK || 'كلية', rt: {}, rc: {}, fu: [], str: ['', ''], imp: ['', ''], pre: '', form: 1 };
  d.rt = d.rt || {}; d.rc = d.rc || {}; d.fu = d.fu || []; d.str = d.str || (d.f1 ? [d.f1, d.f2].filter(Boolean) : ['', '']); d.imp = d.imp || recsOf({ d }); if (!d.imp.length) d.imp = ['', ''];
  const T = cvTeachers();
  const prevOf = () => cvVisits(d.t).filter(r => (!rec || r.id !== rec.id) && (r.date < d.date || (r.date === d.date && rec && String(r.id) < String(rec.id)))).slice(-1)[0];
  const syncFU = () => {   // متابعة توصيات الزيارة السابقة — ثابتة في كل زيارة
    const prev = prevOf(); d.prevId = prev ? prev.id : ''; d.prevDate = prev ? prev.date : '';
    const want = carryOf(prev); const old = {}; d.fu.forEach(x => old[x.r] = x);
    d.fu = want.map(r => old[r] || { r, st: '', note: '' });
  };
  syncFU();
  let lastD = '';
  const draw = () => {
    const s = staffBy(d.t); const secs = String(s.secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean);
    const subs = uniqA(String(s.subj || '').replace(/\(.*?\)/g, '').split(/\+|،|\//).map(x => x.trim()));
    if (!d.subj && subs.length === 1) d.subj = subs[0];
    const cls = (d.s && d.subj && typeof sanabilClass === 'function') ? sanabilClass(d.s, d.subj) : null;
    if (cls && (!d.ach || d.achAuto)) { d.ach = cls.txt; d.achAuto = 1; }
    const P = planOf(d.t); const prev = prevOf(); const gap = prev ? daysBtw(prev.date, d.date) : null;
    const inM = cvVisits(d.t).filter(r => monthKey(r.date) === monthKey(d.date) && (!rec || r.id !== rec.id) && r.date <= d.date);
    const expK = P.seq[inM.length % P.seq.length];
    lastD = '';
    el.innerHTML = `
    <div class="row noprint" style="margin-bottom:10px"><button class="btn sec" id="cb">رجوع للخطة</button><span class="sp"></span>${rec ? '<button class="btn ghost" id="cdel">حذف</button>' : ''}<button class="btn" id="csave">حفظ</button>${rec ? '<button class="btn sec" id="cprev">معاينة الاستمارة</button><button class="btn tf" id="csend">إرسال للمعلمة</button>' : ''}</div>
    <div class="card"><h2>${esc(F.title)} <span class="sub">تُعبَّأ من قِبل منسقة القسم</span></h2>
    <form class="form" onsubmit="return false">
      <div class="fld"><label>المعلّمة</label><select id="cT"><option value="">اختاري المعلمة…</option>${T.map(x => `<option ${x === d.t ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
      <div class="fld"><label>المادّة</label><input list="cdlSub" id="cSub" value="${esc(d.subj || '')}">${dl('cdlSub', [...subs, ...(REF.L.subject_all || [])])}</div>
      <div class="fld"><label>الصّف</label><input list="cdlSec" id="cSec" value="${esc(d.s || '')}" placeholder="${secs.length ? 'شعب المعلمة' : ''}">${dl('cdlSec', [...secs, ...REF.SECTIONS])}</div>
      <div class="fld"><label>التاريخ</label><input type="date" id="cD" value="${esc(d.date)}"></div>
      <div class="fld"><label>اليوم</label><input value="${esc(dayOf(d.date))}" disabled></div>
      <div class="fld"><label>الموضوع</label><input id="cTop" value="${esc(d.topic || '')}" placeholder="عنوان الدرس"></div>
      <div class="fld"><label>كلية / جزئية <small style="color:var(--muted)">· المتوقع وفق الخطة: ${esc(expK)}</small></label><select id="cKj">${['كلية', 'جزئية'].map(x => `<option ${d.kj === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="fld"><label>نوع المتابعة</label><select id="cMode">${['ميدانية', 'عن بُعد'].map(x => `<option ${d.mode === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="fld"><label>ملاحظات (البث المباشر)</label><select id="cLive"><option value="">—</option>${['بث مباشر مدمج', 'بث مباشر غير مدمج'].map(x => `<option ${d.live === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="fld" style="grid-column:1/-1"><label>تحصيل الصف في المادة ${cls ? '<small style="color:var(--tiffany-d)">· محسوب تلقائياً من سنابل</small>' : ''}</label><textarea id="cAch" rows="2" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:6px;line-height:1.8">${esc(d.ach || '')}</textarea></div>
    </form>
    ${d.t ? `<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><span class="chip">خطة أ. ${esc(d.t)}: ${P.n} زيارات شهرياً (${esc(P.lbl)})</span><span class="chip">زيارات الشهر قبل هذه: ${inM.length}</span>
      ${prev ? `<span class="chip ${gap < P.min ? 'bad' : gap > P.max ? 'warn' : 'ok'}">الفاصل عن الزيارة السابقة (${dm(prev.date)}): ${gap} يوماً${gap < P.min ? ' — أقل من المقترح (تنبيه لكِ فقط)' : ''}</span>` : '<span class="chip">أول زيارة للمعلمة</span>'}
      ${d.kj !== expK ? `<span class="chip warn">المتوقع وفق الخطة: ${esc(expK)}</span>` : ''}</div>` : ''}
    ${achMini(d.t, d.subj)}</div>

    <div class="card" style="border-inline-start:4px solid var(--tiffany-d)"><h2>متابعة توصيات الزيارة السابقة <span class="sub">بند ثابت في كل زيارة — كلية أو جزئية</span></h2>
    ${!d.t ? '<div class="empty">اختاري المعلمة أولاً</div>' : !prev ? '<div class="empty">هذه أول زيارة للمعلمة؛ تظهر توصياتها هنا للمتابعة في الزيارة القادمة.</div>'
      : !d.fu.length ? `<div class="empty">لم تُدوَّن توصيات في زيارة ${dmy(prev.date)}.</div>`
      : `<div style="font-size:13px;color:var(--muted);margin-bottom:6px">الزيارة السابقة بتاريخ <b>${dmy(prev.date)}</b> (${esc(prev.d.kj || '')}) — كان من أبرز توصياتها:</div>
      <div class="tbl"><table class="t"><tr><th>التوصية</th><th style="width:170px">مدى التنفيذ</th><th>ملاحظة</th></tr>
      ${d.fu.map((x, i) => `<tr><td style="font-size:13px">${esc(x.r)}</td><td><select data-fs="${i}" style="width:100%">${['', ...FU_ST].map(o => `<option ${x.st === o ? 'selected' : ''} value="${o}">${o || 'اختاري…'}</option>`).join('')}</select></td><td><input data-fn="${i}" value="${esc(x.note || '')}" style="width:100%" placeholder="اختياري"></td></tr>`).join('')}</table></div>`}
    </div>

    <div class="card"><h2>التقديرات <span class="sub">اضغطي على الخانة لوضع ✓ — والتوصية لكل معيار اختيارية (قائمة مقترحة أو كتابة حرة)</span></h2>
    <div class="tbl"><table class="t vt"><tr><th>المجال</th><th>معايير الأداء</th>${F.scale.map(x => `<th style="font-size:11px;width:70px">${esc(x)}</th>`).join('')}<th>التوصيات</th></tr>
    ${F.items.map((x, i) => { const first = x.d !== lastD; lastD = x.d; const n = F.items.filter(y => y.d === x.d).length;
      return `<tr>${first ? `<td rowspan="${n}" style="background:var(--maroon-l);color:var(--maroon);font-weight:700;text-align:center">${esc(x.d)}</td>` : ''}<td style="font-size:12.5px">${esc(x.c)}${x.ind ? `<details style="margin-top:3px"><summary style="cursor:pointer;color:var(--tiffany-d);font-size:11.5px">ما يجب توفره (${x.ind.length})</summary><ul style="margin:4px 0;padding-inline-start:16px;font-size:11.5px;color:var(--muted)">${x.ind.map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>` : ''}</td>
        ${F.scale.map((_, k) => `<td class="ck" data-i="${i}" data-k="${k}" style="text-align:center;cursor:pointer;font-size:18px;color:var(--tiffany-d)">${d.rt[i] === k ? '✓' : ''}</td>`).join('')}
        <td><textarea data-rc="${i}" rows="${d.rc[i] ? 2 : 1}" style="width:100%;min-width:220px;border:1px solid var(--line);border-radius:8px;padding:3px 6px;font-size:12px;resize:vertical" placeholder="اكتبي أو اختاري من القائمة">${esc(d.rc[i] || '')}</textarea>
          <select data-add="${i}" style="width:100%;border:1px solid var(--line);border-radius:8px;font-size:11.5px;margin-top:2px"><option value="">+ توصية مقترحة (${x.r.length})…</option>${x.r.map(t => `<option>${esc(t)}</option>`).join('')}</select></td></tr>`; }).join('')}</table></div></div>

    <div class="card"><h2>ملاحظات وتوصيات عامّة <span class="sub">تكتبها المنسقة بصياغتها</span></h2>
      <div class="fld"><label>عبارة الشكر للمعلمة</label><textarea id="cPre" rows="2" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:6px" placeholder="اكتبي عبارة الشكر والتقدير للمعلمة">${esc(d.pre || '')}</textarea></div>
      <div class="grid g2" style="margin-top:8px">
        <div><b style="color:var(--ok)">نقاط القوة</b>${d.str.map((v, j) => `<textarea data-str="${j}" rows="2" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:10px;padding:6px" placeholder="نقطة قوة ${j + 1}">${esc(v)}</textarea>`).join('')}<button class="btn sm ghost" id="addStr" type="button" style="margin-top:6px">+ نقطة</button></div>
        <div><b style="color:var(--maroon)">النقاط التي تحتاج إلى تحسين (التوصيات)</b>${d.imp.map((v, j) => `<textarea data-imp="${j}" rows="2" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:10px;padding:6px" placeholder="نقطة ${j + 1} — تُتابَع في الزيارة القادمة">${esc(v)}</textarea>`).join('')}<button class="btn sm ghost" id="addImp" type="button" style="margin-top:6px">+ نقطة</button></div>
      </div></div>`;
    bind();
  };
  const grab = () => {
    if (!$('#cT')) return;
    d.t = $('#cT').value.trim(); d.subj = $('#cSub').value.trim(); d.s = $('#cSec').value.trim(); d.date = $('#cD').value; d.topic = $('#cTop').value.trim();
    d.kj = $('#cKj').value; d.mode = $('#cMode').value; d.live = $('#cLive').value; { const v = $('#cAch').value.trim(); if (v !== d.ach) d.achAuto = 0; d.ach = v; }
    d.pre = $('#cPre').value.trim();
    $$('[data-rc]', el).forEach(i => { const v = i.value.trim(); if (v) d.rc[i.dataset.rc] = v; else delete d.rc[i.dataset.rc]; });
    $$('[data-fs]', el).forEach(s => d.fu[s.dataset.fs].st = s.value); $$('[data-fn]', el).forEach(s => d.fu[s.dataset.fn].note = s.value.trim());
    d.str = $$('[data-str]', el).map(i => i.value.trim()); d.imp = $$('[data-imp]', el).map(i => i.value.trim());
  };
  const bind = () => {
    $('#cT').onchange = () => { grab(); d.subj = ''; d.s = ''; d.ach = ''; d.achAuto = 1; syncFU(); draw(); };
    $('#cD').onchange = () => { grab(); syncFU(); draw(); };
    $('#cKj').onchange = () => { grab(); draw(); };
    $('#cSec').onchange = $('#cSub').onchange = () => { grab(); if (d.achAuto || !d.ach) { d.ach = ''; d.achAuto = 1; } draw(); };
    $$('.ck', el).forEach(c => c.onclick = () => { grab(); const i = +c.dataset.i, k = +c.dataset.k; if (d.rt[i] === k) delete d.rt[i]; else d.rt[i] = k; draw(); });
    $$('[data-add]', el).forEach(sl => sl.onchange = () => { if (!sl.value) return; grab(); const i = sl.dataset.add; const cur = (d.rc[i] || '').trim(); if (!cur.split('؛ ').includes(sl.value)) d.rc[i] = cur ? cur.replace(/[.؛\s]+$/, '') + '؛ ' + sl.value : sl.value; draw(); });
    $('#addStr').onclick = () => { grab(); d.str.push(''); draw(); };
    $('#addImp').onclick = () => { grab(); d.imp.push(''); draw(); };
    $('#cb').onclick = () => { S.cvv = null; show(); };
    $('#csave').onclick = async () => { if (await save()) { toast('تم الحفظ ✓ — وانعكست الزيارة على تقرير القسم'); show(); } };
    if ($('#cprev')) $('#cprev').onclick = async () => { const r = await save(); if (r) cvPreview(el, r); };
    if ($('#csend')) $('#csend').onclick = async () => { const r = await save(); if (r) cvSend(r); };
    if ($('#cdel')) $('#cdel').onclick = async () => { if (!confirm('حذف هذه الزيارة نهائياً؟')) return; await call('delete', { id: rec.id }); S.records = S.records.filter(x => x.id !== rec.id); S.cvv = null; show(); };
  };
  const save = async () => {
    grab(); syncFU();
    if (!d.t || !d.date) { toast('اختاري المعلمة والتاريخ', 1); return null; }
    const miss = d.fu.filter(x => !x.st);
    if (miss.length) { toast(`حدّدي مدى تنفيذ توصيات الزيارة السابقة (${miss.length}) — بند ثابت في كل زيارة`, 1); return null; }
    const P = planOf(d.t); const prev = prevOf();
    if (prev && daysBtw(prev.date, d.date) < P.min && !confirm(`تنبيه خاص بكِ لتنظيم الوقت: الفاصل بين هذه الزيارة والسابقة (${dm(prev.date)}) ${daysBtw(prev.date, d.date)} أيام، والمقترح ${P.min} أيام على الأقل ليتسنى للمعلمة تطبيق التوصيات.\n\nإن كنتِ ترغبين بالحضور لها أكثر من المطلوب فاضغطي «موافق» وتجاهلي هذا التنبيه، ولن يظهر في التقرير.`)) return null;
    d.str = d.str.filter(Boolean); d.imp = d.imp.filter(Boolean);
    // حقول التقرير الشهري (بند الحضور الصفي)
    const before = cvVisits(d.t).filter(r => (!rec || r.id !== rec.id) && r.date <= d.date && r.d.kj === 'كلية').length;
    d.ty = d.kj === 'كلية' ? 'الزيارة ' + (ORD[before] || before + 1) : 'متابعة الزيارة ' + (ORD[Math.max(0, before - 1)] || before);
    d.f1 = d.str[0] || ''; d.f2 = d.str[1] || ''; d.r1 = d.imp[0] || ''; d.r2 = d.imp[1] || ''; d.r3 = d.imp[2] || '';
    const n = d.fu.length, ok = d.fu.filter(x => x.st === 'تم التنفيذ').length, no = d.fu.filter(x => x.st === 'لم تُنفذ بعد').length;
    d.st = !n ? '' : ok === n ? 'تم تنفيذ التوصيات' : no === n ? 'لم تُنفذ بعد' : 'تم التنفيذ جزئياً';
    Object.keys(d).forEach(k => { if (d[k] === '') delete d[k]; });
    const j = await call('save', { rec: { id: rec && rec.id, dept: S.dept, item: 'V', date: d.date, sum: `أ. ${d.t} — ${d.ty}`, d } });
    const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record);
    S.cvv = j.record.id; return j.record;
  };
  draw();
}

/* ================================================================== الطباعة والإرسال */
function cvInner(r) {
  const F = FORMS.visit, d = r.d; let lastD = '';
  const ys = (v, x) => v === x ? '☑' : '☐';
  const fuTxt = (d.fu || []).length ? `\n\nمتابعة توصيات الزيارة السابقة (${dmy(d.prevDate)}):\n` + d.fu.map(x => `• ${cleanEnd(x.r)}: ${x.st}${x.note ? ' — ' + cleanEnd(x.note) : ''}.`).join('\n') : '';
  return `<h1>${esc(F.title)}</h1><div class="sub">${esc(SCHOOL())} · <bdi dir="ltr">${REF.YEAR || ''}</bdi></div>
  <table><tr><th colspan="4">المعلومات الأساسيّة</th></tr>
    <tr><td class="k">المــدرسة</td><td>${esc(SCHOOL())}</td><td class="k">اليوم/التاريخ</td><td>${esc(dayOf(d.date))} ${dmy(d.date)}</td></tr>
    <tr><td class="k">المادّة</td><td>${esc(d.subj || '')}</td><td class="k">الصّف</td><td>${esc(d.s || '')}</td></tr>
    <tr><td class="k">الموضوع</td><td>${esc(d.topic || '')}</td><td class="k">منسق المادة</td><td>أ. ${esc(S.user.name)}</td></tr>
    <tr><td class="k">المعلّم</td><td>أ. ${esc(d.t)}</td><td class="k">نوع المتابعة</td><td>${ys(d.mode, 'ميدانية')} ميدانيّة &nbsp; ${ys(d.mode, 'عن بُعد')} عن بُعد &nbsp;&nbsp; ${ys(d.kj, 'جزئية')} جزئيّة &nbsp; ${ys(d.kj, 'كلية')} كليّة</td></tr>
    <tr><td class="k">التحصيل الأكاديمي</td><td>${esc(d.ach || '')}</td><td class="k">ملاحظات</td><td>${ys(d.live, 'بث مباشر مدمج')} بث مباشر مدمج &nbsp; ${ys(d.live, 'بث مباشر غير مدمج')} بث مباشر غير مدمج</td></tr></table>
  <table><tr><th>المجال</th><th>معايير الأداء</th>${F.scale.map(x => `<th style="width:6.5%;font-size:8.5px">${esc(x)}</th>`).join('')}<th style="width:24%">التوصيات<br><span style="font-weight:normal;font-size:8.5px">(تتضمن توجيهات لزيادة أثر الممارسات في تعلم الطلاب)</span></th></tr>
  ${F.items.map((x, i) => { const first = x.d !== lastD; lastD = x.d; const n = F.items.filter(y => y.d === x.d).length;
    return `<tr>${first ? `<td class="dm" rowspan="${n}">${esc(x.d)}</td>` : ''}<td style="font-size:10px">${esc(x.c)}</td>${F.scale.map((_, k) => `<td class="c">${ratingCell(d.rt && d.rt[i] === k)}</td>`).join('')}<td class="j" style="font-size:9.5px">${esc((d.rc || {})[i] || '')}</td></tr>`; }).join('')}</table>
  <div class="gen"><div class="h">ملاحظات وتوصيات عامّة</div><div class="b">${esc((d.pre || '') + fuTxt + ((d.str || []).length ? '\n\nنقاط القوة:\n' + d.str.map(x => '• ' + cleanEnd(x) + '.').join('\n') : '') + ((d.imp || []).length ? '\n\nالنقاط التي تحتاج إلى تحسين:\n' + d.imp.map(x => '• ' + cleanEnd(x) + '.').join('\n') : '')).trim()}</div></div>
  <table class="sg"><tr><td>توقيع المعلم<br>أ. ${esc(d.t)}</td><td>توقيع منسق المادة<br>أ. ${esc(S.user.name)}{{SIG}}</td></tr></table>`;
}
let CSIG = null;
async function cvSig() { if (CSIG !== null) return CSIG; try { CSIG = (await API.call('signature', { who: S.user.id })).data || ''; } catch (e) { CSIG = ''; } return CSIG; }
const cvBody = (name, what) => `<div dir="rtl" style="font-family:Lusail,'IBM Plex Sans Arabic',Arial,sans-serif;font-size:12pt;line-height:1.9;color:#1E2230;text-align:justify;max-width:640px">
  <p style="margin:0 0 10px">الأستاذة الفاضلة/ <b>${esc(name)}</b> المحترمة،</p>
  <p style="margin:0 0 10px">السلام عليكم ورحمة الله وبركاته، وبعد،</p>
  <p style="margin:0 0 10px">أشكر لكِ جهودكِ المخلصة في سبيل تعلّم طالباتنا، وأرفق لكِ ${esc(what)}، آملةً التكرّم بالاطلاع عليها والتوقيع، ثم إعادة إرسالها.</p>
  <p style="margin:0 0 10px">مع دعائي لكِ بدوام التوفيق والسداد.</p>
  <p style="margin:16px 0 0;font-size:11pt;text-align:right">مع خالص التقدير والاحترام،<br><b>${esc(S.user.name)}</b><br>منسقة قسم ${esc(S.dept)}<br>${esc(SCHOOL())}</p></div>`;
async function cvPaper(r) { const imgs = await lhImgs(); const sig = await cvSig(); return { imgs, sig, inner: cvInner(r) }; }
async function cvPreview(el, r) {
  const { imgs, sig, inner } = await cvPaper(r);
  el.innerHTML = `<div class="row noprint" style="margin-bottom:12px"><button class="btn sec" id="pBack">رجوع</button><span class="sp"></span><button class="btn tf" id="pSend">إرسال للمعلمة</button><button class="btn sec" onclick="window.print()">طباعة / حفظ PDF</button></div>
    <style>${FORM_CSS}</style><div class="paper" style="padding:0">${paperWrap(inner.replace(/\{\{SIG\}\}/g, sig ? `<img src="${sig}" alt="">` : ''), imgs)}</div>`;
  setTitle('استمارة الإشراف — ' + r.d.t);
  $('#pBack').onclick = () => show(); $('#pSend').onclick = () => cvSend(r);
}
async function cvSend(r) {
  const { imgs, sig, inner } = await cvPaper(r);
  const what = `استمارة الإشراف على أدائكِ في حصة ${r.d.subj || ''}${r.d.s ? ' للصف ' + r.d.s : ''} بتاريخ ${dmy(r.date)}`;
  const subject = `استمارة الإشراف على الأداء — ${dmy(r.date)}`, file = `استمارة الإشراف - ${r.d.t} - ${r.date}`, body = cvBody(r.d.t, what);
  const ok = await new Promise(res => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="box" style="max-width:900px;width:96vw;max-height:92vh;overflow:auto"><h3>معاينة قبل الإرسال</h3>
      <div style="font-size:13px;color:var(--muted);margin-bottom:6px">إلى: <b>أ. ${esc(r.d.t)}</b> (بريدها المسجل) · يظهر المرسِل باسمكِ، ويصلكِ الرد ونسخة من الرسالة · المرفق: <b>${esc(file)}.pdf</b></div>
      <div style="border:1px solid var(--line);border-radius:12px;padding:14px 18px;background:#fff">${body}</div>
      <details style="margin-top:10px" open><summary style="cursor:pointer;color:var(--tiffany-d)">الاستمارة المرفقة</summary><style>${FORM_CSS}</style><div style="border:1px solid var(--line);margin-top:6px;zoom:.8">${paperWrap(inner.replace(/\{\{SIG\}\}/g, sig ? `<img src="${sig}" alt="">` : ''), imgs)}</div></details>
      <div class="row" style="margin-top:12px"><button class="btn tf" id="sOk">إرسال الآن</button><button class="btn sec" id="sNo">إلغاء</button></div></div>`;
    document.body.appendChild(m); $('#sOk', m).onclick = () => { m.remove(); res(true); }; $('#sNo', m).onclick = () => { m.remove(); res(false); };
  });
  if (!ok) return;
  const j = await call('sendVisitC', { id: r.id, subject, body, file, html: docHTML(inner, imgs, file) });
  toast('تم الإرسال إلى أ. ' + r.d.t + ' ✓');
  const i = S.records.findIndex(x => x.id === r.id); if (i >= 0 && j.record) S.records[i] = j.record; show();
}
