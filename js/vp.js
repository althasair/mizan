/* الميزان — لوحة النائب الأكاديمي: حضوري الصفي · متابعة ملفات المنسقات · متابعة ملفات الإدارية الأكاديمية
   كل ما في هذا الملف خاص بالنائب الأكاديمي (بنود VPV · CF · AF · AST لا تصل إلى أي منسقة) */
'use strict';

let FORMS = null;
const loadForms = async () => FORMS || (FORMS = await fetch('data/forms.json?v=' + (window.MIZAN_V || Date.now())).then(r => r.json()));
const DAYS7 = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayOf = d => d ? DAYS7[new Date(d + 'T12:00:00').getDay()] : '';
const SEMS = ['الفصل الأول', 'الفصل الثاني'];
const semRange = sem => { const L = S.periods.filter(p => p.sem === sem); return L.length ? { from: L[0].from, to: L[L.length - 1].to } : { from: '2026-08-23', to: '2027-06-30' }; };
const curSem = () => { const t = today(); const p = S.periods.find(x => t >= x.from && t <= x.to) || [...S.periods].reverse().find(x => x.from <= t); return (p && p.sem) || SEMS[0]; };
const VP_NAME = 'آسيا الذبياني';
const staffBy = n => S.staff.find(s => s.name === n) || {};
const uniqA = a => [...new Set(a.filter(Boolean))];
const SCHOOL = () => REF.SCHOOL || 'مدرسة الشيماء الثانوية للبنات';
const dl = (id, L) => `<datalist id="${id}">${uniqA(L).map(x => `<option value="${esc(x)}">`).join('')}</datalist>`;
const cleanEnd = s => String(s || '').trim().replace(/[.،؛\s]+$/, '');

/* ------------------------------------------------------------------ أدوات مشتركة: التوقيع والترويسة والإرسال */
let SIG = null, LH = null;
async function vpSig() { if (SIG) return SIG; try { SIG = (await API.call('signature', {})).data; } catch (e) { SIG = ''; } return SIG; }
async function lhImgs() {
  if (LH) return LH;
  const toData = u => fetch(u).then(r => r.blob()).then(b => new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); }));
  try { LH = { top: await toData('assets/lh-top.jpg'), bot: await toData('assets/lh-bot.jpg') }; } catch (e) { LH = { top: 'assets/lh-top.jpg', bot: 'assets/lh-bot.jpg' }; }
  return LH;
}
const FORM_CSS = `
.fp{font-family:'Lusail','IBM Plex Sans Arabic',Arial,sans-serif;color:#1E2230;direction:rtl;font-size:11px;line-height:1.6}
.fp .in{padding:2mm 11mm 0}
.fp img.lh{width:100%;display:block}
.fp h1{text-align:center;color:#7A1F33;font-size:17px;margin:2mm 0 1mm}
.fp .sub{text-align:center;color:#B08D57;font-weight:bold;font-size:11.5px;margin-bottom:2mm}
.fp table{width:100%;border-collapse:collapse;margin-top:2mm}
.fp td,.fp th{border:1px solid #8f8f8f;padding:3px 5px;vertical-align:middle;text-align:right}
.fp th{background:#7A1F33;color:#fff;text-align:center;font-weight:bold;font-size:10.5px}
.fp td.k{background:#F6ECEE;color:#7A1F33;font-weight:bold;width:17%}
.fp td.dm{background:#F6ECEE;color:#7A1F33;font-weight:bold;text-align:center;width:11%}
.fp td.c{text-align:center;width:7%;font-size:14px;color:#1F8F88;font-weight:bold}
.fp td.j,.fp div.j{text-align:justify}
.fp .gen{border:1px solid #8f8f8f;margin-top:2mm}
.fp .gen .h{background:#F6ECEE;color:#7A1F33;font-weight:bold;padding:3px 6px}
.fp .gen .b{padding:5px 8px;white-space:pre-wrap;text-align:justify;min-height:16mm}
.fp .sg{width:100%;margin-top:4mm;border:0}
.fp .sg td{border:0;text-align:center;vertical-align:top;font-weight:bold;height:30mm}
.fp .sg img{height:20mm;display:block;margin:2mm auto 0}
.fp .fnote{font-size:9.5px;color:#555;margin-top:2mm}
.fp .chk{font-size:13px;color:#1F8F88}`;
function paperWrap(inner, imgs) {
  return `<div class="fp"><img class="lh" src="${imgs.top}" alt=""><div class="in">${inner}</div><img class="lh" src="${imgs.bot}" alt="" style="margin-top:6mm"></div>`;
}
function docHTML(inner, imgs, title) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4;margin:0}body{margin:0}${FORM_CSS}</style></head><body>${paperWrap(inner, imgs)}</body></html>`;
}
const emailBody = (name, what) => `<div dir="rtl" style="font-family:Lusail,'IBM Plex Sans Arabic',Arial,sans-serif;font-size:15px;line-height:1.9;color:#1E2230">
  <p>الأستاذة الفاضلة/ <b>${esc(name)}</b> المحترمة،</p>
  <p>السلام عليكم ورحمة الله وبركاته،</p>
  <p>يسعدني أن أرفق لكِ <b>${esc(what)}</b>، مع خالص الشكر والتقدير لجهودكِ المخلصة وعطائكِ المتميز الذي يُسهم في الارتقاء بتعلّم طالباتنا وتحقيق رؤية مدرستنا «متعلم ريادي لتنمية مستدامة».</p>
  <p>آمل التكرّم بالاطلاع على الاستمارة والتوقيع عليها، ثم إعادة إرسالها، سائلةً المولى لكِ دوام التوفيق والسداد.</p>
  <p style="margin-top:18px">مع خالص التقدير،<br><b>آسيا الذبياني</b><br>نائب المدير للشؤون الأكاديمية<br>${esc(SCHOOL())}</p></div>`;
async function sendForm({ to, name, subject, what, inner, file }) {
  if (!to) { toast('لا يوجد بريد إلكتروني مسجّل لهذه الموظفة', 1); return false; }
  const imgs = await lhImgs();
  const html = docHTML(inner.replace(/\{\{SIG\}\}/g, '{{SIG}}'), imgs, file);
  await call('sendForm', { to, subject, html, body: emailBody(name, what), file });
  toast('تم الإرسال إلى ' + to + ' ✓'); return true;
}
async function showPaper(el, title, inner, actions) {
  const imgs = await lhImgs(); const sig = await vpSig();
  el.innerHTML = `<div class="row noprint" style="margin-bottom:12px"><button class="btn sec" id="pBack">رجوع</button><span class="sp"></span>${actions || ''}<button class="btn sec" onclick="window.print()">طباعة / حفظ PDF</button></div>
    <style>${FORM_CSS}</style><div class="paper" style="padding:0">${paperWrap(inner.replace(/\{\{SIG\}\}/g, sig ? `<img src="${sig}" alt="">` : ''), imgs)}</div>`;
  setTitle(title);
}
const ratingCell = (on) => on ? '<span class="chk">✓</span>' : '';
const pickHTML = (name, opts, val, ph) => `<input list="${name}" value="${esc(val || '')}" placeholder="${esc(ph || 'اختاري أو اكتبي')}">`;

/* ================================================================== 1) حضور النائب الأكاديمي (استمارة الإشراف على أداء المعلّم) */
function vpVisits() { return S.records.filter(r => r.item === 'VPV').sort((a, b) => (b.date || '').localeCompare(a.date || '')); }
async function A_vpvisit(el) {
  await loadForms(); setTitle('حضور النائب الأكاديمي');
  if (S.vpv) return vpVisitForm(el, S.vpv === 'new' ? null : S.records.find(r => r.id === S.vpv));
  const L = vpVisits(); const sem = S.vsem || curSem(); const R = semRange(sem);
  const inS = L.filter(r => r.date >= R.from && r.date <= R.to);
  const pool = S.staff.filter(s => s.role !== 'منسقة' && +s.load > 0);
  const seen = new Set(inS.map(r => r.d.t));
  const lv = r => { const rt = r.d.rt || {}; const v = Object.values(rt).filter(x => x < 5); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  el.innerHTML = `
  <div class="tabs">${SEMS.map(s => `<button class="${s === sem ? 'on' : ''}" data-s="${s}">${s}</button>`).join('')}</div>
  <div class="grid g4">
    ${kpi('حضرتُ لهن', seen.size, 'من ' + pool.length + ' معلمة لها نصاب', 'var(--ok)')}
    ${kpi('عدد الزيارات', inS.length, sem, 'var(--navy)')}
    ${kpi('أُرسلت للمعلمات', inS.filter(r => r.d.sent).length, 'من ' + inS.length, 'var(--tiffany-d)')}
    ${kpi('لم أحضر لهن بعد', pool.length - [...seen].filter(n => pool.some(p => p.name === n)).length, 'في ' + sem, 'var(--maroon)')}
  </div>
  <div class="card" style="margin-top:14px"><div class="row"><h2 style="margin:0">زياراتي الصفية — ${sem}</h2><span class="sp"></span><button class="btn" id="nv">+ حضور جديد (تعبئة الاستمارة)</button></div>
  <div class="tbl" style="margin-top:10px"><table class="t"><tr><th>التاريخ</th><th>المعلمة</th><th>القسم</th><th>الصف</th><th>الموضوع</th><th>التحصيل الأكاديمي</th><th>المستوى العام</th><th>الإرسال</th><th></th></tr>
  ${inS.map(r => { const a = lv(r); const ok = a == null ? '' : a < 1.25 ? 'ok' : a < 2.2 ? 'tf' : a < 3.2 ? 'warn' : 'bad';
    const lbl = a == null ? '—' : FORMS.visit.scale[Math.round(a)];
    return `<tr><td>${dmy(r.date)}</td><td><b>${esc(r.d.t)}</b></td><td>${esc(r.dept)}</td><td>${esc(r.d.s || '')}</td><td>${esc(r.d.topic || '')}</td><td style="font-size:12px">${esc(r.d.ach || '')}</td><td>${a == null ? '<span class="chip">بلا استمارة</span>' : `<span class="chip ${ok}">${esc(lbl)}</span>`}</td><td>${r.d.sent ? `<span class="chip ok">${dm(r.d.sent)}</span>` : '<span class="chip">لم تُرسل</span>'}</td>
      <td><button class="btn sm sec" data-o="${r.id}">فتح</button></td></tr>`; }).join('') || '<tr><td colspan="9"><div class="empty">لا توجد زيارات في هذا الفصل بعد</div></td></tr>'}</table></div></div>
  <div class="card"><h2>معلمات لم أحضر لهن في ${sem}</h2><div style="display:flex;flex-wrap:wrap;gap:6px">${pool.filter(p => !seen.has(p.name)).map(p => `<button class="chip" data-nt="${esc(p.name)}" style="cursor:pointer">${esc(p.name)} · ${esc(p.dept)}</button>`).join('') || '<div class="empty">تم الحضور لجميع المعلمات ✓</div>'}</div></div>`;
  $$('[data-s]', el).forEach(b => b.onclick = () => { S.vsem = b.dataset.s; show(); });
  $('#nv').onclick = () => { S.vpv = 'new'; S.vpvT = ''; show(); };
  $$('[data-nt]', el).forEach(b => b.onclick = () => { S.vpv = 'new'; S.vpvT = b.dataset.nt; show(); });
  $$('[data-o]', el).forEach(b => b.onclick = () => { S.vpv = b.dataset.o; show(); });
}
function sanabilFor(name) {
  try { const m = sanabilMeans(); if (!m) return null; const s = staffBy(name); return m[nameKey(s.full || name)] || m[nameKey(name)] || null; } catch (e) { return null; }
}
function vpVisitForm(el, rec) {
  const F = FORMS.visit; const d = rec ? JSON.parse(JSON.stringify(rec.d)) : { t: S.vpvT || '', date: today(), mode: 'ميدانيّة', kj: 'كليّة', rt: {}, rc: {}, st: ['', '', ''], im: ['', '', ''] };
  d.rt = d.rt || {}; d.rc = d.rc || {}; d.st = d.st || ['', '', '']; d.im = d.im || ['', '', ''];
  const subjToks = st => String(st.subj || '').replace(/\(.*?\)/g, '').split(/\+|،|\/| و(?=ال)/).map(x => x.trim()).filter(Boolean);
  const allSubj = uniqA([...S.staff.flatMap(subjToks), ...(REF.L.subject_all || [])]);
  const teaches = (st, sub) => !sub || subjToks(st).some(x => nrm(x) === nrm(sub) || nrm(x).includes(nrm(sub)) || nrm(sub).includes(nrm(x))) || nrm(st.dept || '') === nrm(sub);
  const tchAll = S.staff.filter(s => +s.load > 0 || s.role === 'معلمة');
  const draw = () => {
    const tch = tchAll.filter(x => teaches(x, d.subj)).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    const s = staffBy(d.t); const secs = String(s.secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean);
    const subs = uniqA(String(s.subj || '').split(/\+|،/).map(x => x.trim()));
    const cls = (d.s && d.subj && typeof sanabilClass === 'function') ? sanabilClass(d.s, d.subj) : null;
    if (cls && (!d.ach || d.achAuto)) { d.ach = cls.txt; d.achAuto = 1; }
    const strongI = F.items.map((x, i) => i).filter(i => d.rt[i] === 0 || d.rt[i] === 1);
    const weakI = F.items.map((x, i) => i).filter(i => d.rt[i] === 3 || d.rt[i] === 4);
    const stOpts = [...strongI.flatMap(i => F.items[i].s), ...F.items.flatMap(x => x.s)];
    const imOpts = [...weakI.flatMap(i => [d.rc[i], ...F.items[i].r]), ...F.items.flatMap(x => x.r)];
    let lastD = '';
    el.innerHTML = `
    <div class="row noprint" style="margin-bottom:10px"><button class="btn sec" id="vb">رجوع للقائمة</button><span class="sp"></span>${rec ? '<button class="btn ghost" id="vdel">حذف</button>' : ''}<button class="btn sec" id="vauto">اقتراح نقاط القوة والتحسين من التقديرات</button><button class="btn" id="vsave">حفظ</button>${rec ? '<button class="btn sec" id="vprev">معاينة الاستمارة</button><button class="btn tf" id="vsend">إرسال للمعلمة</button>' : ''}</div>
    <div class="card"><h2>${esc(F.title)} <span class="sub">نموذج (9) من الدليل الإرشادي — تُعبَّأ من قِبل نائب المدير للشؤون الأكاديمية</span></h2>
    <form class="form" id="vh" onsubmit="return false">
      <div class="fld"><label>المادّة <small style="color:var(--muted)">· اختاريها أولاً</small></label><select id="fSub"><option value="">اختاري المادة…</option>${allSubj.map(x => `<option ${nrm(x) === nrm(d.subj || '') ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
      <div class="fld"><label>المعلّمة ${d.subj ? `<small style="color:var(--muted)">· معلمات ${esc(d.subj)} (${tch.length})</small>` : ''}</label><select id="fT"><option value="">${d.subj ? 'اختاري المعلمة…' : 'اختاري المادة أولاً'}</option>${tch.map(x => `<option ${x.name === d.t ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div class="fld"><label>الصّف</label><input list="dlSec" id="fSec" value="${esc(d.s || '')}" placeholder="${secs.length ? 'شعب المعلمة' : ''}">${dl('dlSec', [...secs, ...REF.SECTIONS])}</div>
      <div class="fld"><label>التاريخ</label><input type="date" id="fD" value="${esc(d.date)}"></div>
      <div class="fld"><label>اليوم</label><input id="fDay" value="${esc(dayOf(d.date))}" disabled></div>
      <div class="fld"><label>الموضوع</label><input id="fTop" value="${esc(d.topic || '')}" placeholder="عنوان الدرس"></div>
      <div class="fld"><label>نوع المتابعة</label><select id="fMode">${['ميدانيّة', 'عن بُعد'].map(x => `<option ${d.mode === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="fld"><label>كليّة / جزئيّة</label><select id="fKj">${['كليّة', 'جزئيّة'].map(x => `<option ${d.kj === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="fld"><label>ملاحظات (البث المباشر)</label><select id="fLive"><option value="">—</option>${['بث مباشر مدمج', 'بث مباشر غير مدمج'].map(x => `<option ${d.live === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="fld" style="grid-column:1/-1"><label>تحصيل الصف في المادة ${cls ? `<small style="color:var(--tiffany-d)">· محسوب تلقائياً من سنابل (الفترة ${esc(cls.per)})</small>` : `<small style="color:var(--muted)">· ${d.s && d.subj ? 'لا تتوفر نتائج هذا الصف في سنابل على هذا المتصفح — افتحي سنابل مرة واحدة على نفس المتصفح أو اكتبي يدوياً' : 'اختاري الصف والمادة فيظهر التحصيل تلقائياً'}</small>`}</label><textarea id="fAch" rows="2" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:6px;line-height:1.8">${esc(d.ach || '')}</textarea>${cls ? `<div class="row" style="margin-top:4px;gap:6px"><span class="chip ${cls.band === 'ممتاز' || cls.band === 'جيد جداً' ? 'ok' : cls.band === 'جيد' ? 'tf' : cls.band === 'مقبول' ? 'warn' : 'bad'}">${esc(cls.band)} · ${cls.me.mean.toFixed(1)}%</span>${cls.rel ? `<span class="chip">${esc(cls.rel)} متوسط المستوى (${cls.lv.mean.toFixed(1)}%)</span><span class="chip">الترتيب ${cls.rank} من ${cls.of}</span>` : ''}<button type="button" class="btn sm ghost" id="achRe">إعادة الحساب</button></div>` : ''}</div>
    </form>${achMini(d.t, d.subj)}</div>
    <div class="card"><h2>التقديرات <span class="sub">اضغطي على الخانة لوضع ✓ — والتوصية لكل معيار اختيارية (قائمة أو كتابة حرة)</span></h2>
    <div class="tbl"><table class="t vt"><tr><th>المجال</th><th>معايير الأداء</th>${F.scale.map(x => `<th style="font-size:11px;width:70px">${esc(x)}</th>`).join('')}<th>التوصيات</th></tr>
    ${F.items.map((x, i) => { const first = x.d !== lastD; lastD = x.d; const n = F.items.filter(y => y.d === x.d).length;
      return `<tr>${first ? `<td rowspan="${n}" style="background:var(--maroon-l);color:var(--maroon);font-weight:700;text-align:center">${esc(x.d)}</td>` : ''}<td style="font-size:12.5px">${esc(x.c)}${x.ind ? `<details style="margin-top:3px"><summary style="cursor:pointer;color:var(--tiffany-d);font-size:11.5px">ما يجب توفره (${x.ind.length})</summary><ul style="margin:4px 0;padding-inline-start:16px;font-size:11.5px;color:var(--muted)">${x.ind.map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>` : ''}</td>
        ${F.scale.map((_, k) => `<td class="ck ${d.rt[i] === k ? 'on' : ''}" data-i="${i}" data-k="${k}" style="text-align:center;cursor:pointer;font-size:18px;color:var(--tiffany-d)">${d.rt[i] === k ? '✓' : ''}</td>`).join('')}
        <td><textarea data-rc="${i}" rows="${d.rc[i] ? 2 : 1}" style="width:100%;min-width:220px;border:1px solid var(--line);border-radius:8px;padding:3px 6px;font-size:12px;resize:vertical" placeholder="اكتبي أو اختاري من القائمة">${esc(d.rc[i] || '')}</textarea>
          <select data-add="${i}" style="width:100%;border:1px solid var(--line);border-radius:8px;font-size:11.5px;margin-top:2px"><option value="">+ إضافة توصية (${x.r.length})…</option>${x.r.map(t => `<option>${esc(t)}</option>`).join('')}</select></td></tr>`; }).join('')}</table></div></div>
    <div class="card"><h2>ملاحظات وتوصيات عامّة</h2>
      <div class="fld"><label>الديباجة</label><input list="dlPre" id="fPre" value="${esc(d.pre || F.preamble.replace('{name}', d.t || '...'))}" style="width:100%">${dl('dlPre', F.pre_opts.map(x => x.replace('{name}', d.t || '...')))}</div>
      <div class="grid g2" style="margin-top:8px">
        <div><b style="color:var(--ok)">نقاط القوة</b>${d.st.map((v, j) => `<input list="dlSt" data-st="${j}" value="${esc(v)}" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:10px;padding:6px" placeholder="نقطة قوة ${j + 1}">`).join('')}${dl('dlSt', stOpts)}<button class="btn sm ghost" id="addSt" type="button" style="margin-top:6px">+ نقطة</button></div>
        <div><b style="color:var(--maroon)">نقاط تحتاج إلى تحسين</b>${d.im.map((v, j) => `<input list="dlIm" data-im="${j}" value="${esc(v)}" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:10px;padding:6px" placeholder="نقطة ${j + 1}">`).join('')}${dl('dlIm', imOpts)}<button class="btn sm ghost" id="addIm" type="button" style="margin-top:6px">+ نقطة</button></div>
      </div></div>`;
    const grab = () => {
      d.t = $('#fT').value.trim(); d.date = $('#fD').value; d.subj = $('#fSub').value.trim(); d.s = $('#fSec').value.trim(); d.topic = $('#fTop').value.trim();
      d.mode = $('#fMode').value; d.kj = $('#fKj').value; d.live = $('#fLive').value; { const v = $('#fAch').value.trim(); if (v !== d.ach) d.achAuto = 0; d.ach = v; } d.pre = $('#fPre').value.trim();
      $$('[data-rc]', el).forEach(i => { const v = i.value.trim(); if (v) d.rc[i.dataset.rc] = v; else delete d.rc[i.dataset.rc]; });
      d.st = $$('[data-st]', el).map(i => i.value.trim()); d.im = $$('[data-im]', el).map(i => i.value.trim());
    };
    $('#fT').onchange = () => { const old = d.t; grab(); if (!d.pre || d.pre.includes(old || '...')) d.pre = F.preamble.replace('{name}', d.t); const st = staffBy(d.t); if (!d.subj || !teaches(st, d.subj)) d.subj = subjToks(st)[0] || ''; const sc = String(st.secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean); d.s = sc.length === 1 ? sc[0] : ''; if (d.achAuto || !d.ach) { d.ach = ''; d.achAuto = 1; } draw(); };
    $('#fD').onchange = () => { $('#fDay').value = dayOf($('#fD').value); };
    const reAch = () => { grab(); if (d.achAuto || !d.ach) { d.ach = ''; d.achAuto = 1; } draw(); };
    $('#fSec').onchange = reAch; $('#fSub').onchange = () => { grab(); if (d.t && !teaches(staffBy(d.t), d.subj)) { d.t = ''; d.s = ''; } if (d.achAuto || !d.ach) { d.ach = ''; d.achAuto = 1; } draw(); };
    if ($('#achRe')) $('#achRe').onclick = () => { grab(); d.ach = ''; d.achAuto = 1; draw(); };
    $$('.ck', el).forEach(c => c.onclick = () => { grab(); const i = +c.dataset.i, k = +c.dataset.k; if (d.rt[i] === k) delete d.rt[i]; else { d.rt[i] = k; if ((k === 3 || k === 4) && !d.rc[i]) d.rc[i] = FORMS.visit.items[i].r[0]; if (k < 2 && d.rc[i] === FORMS.visit.items[i].r[0]) delete d.rc[i]; } draw(); });
    $$('[data-add]', el).forEach(sl => sl.onchange = () => { if (!sl.value) return; grab(); const i = sl.dataset.add; const cur = (d.rc[i] || '').trim(); if (!cur.split('؛ ').includes(sl.value)) d.rc[i] = cur ? cur.replace(/[.؛\s]+$/, '') + '؛ ' + sl.value : sl.value; draw(); });
    $('#addSt').onclick = () => { grab(); d.st.push(''); draw(); };
    $('#addIm').onclick = () => { grab(); d.im.push(''); draw(); };
    $('#vb').onclick = () => { S.vpv = null; show(); };
    $('#vauto').onclick = () => {
      grab(); const sI = F.items.map((x, i) => i).filter(i => d.rt[i] === 0).concat(F.items.map((x, i) => i).filter(i => d.rt[i] === 1));
      const wI = F.items.map((x, i) => i).filter(i => d.rt[i] === 4).concat(F.items.map((x, i) => i).filter(i => d.rt[i] === 3));
      if (!sI.length && !wI.length) return toast('ضعي التقديرات (✓) أولاً', 1);
      d.st = sI.slice(0, 3).map(i => F.items[i].s[0]); while (d.st.length < 2) d.st.push('');
      d.im = wI.slice(0, 3).map(i => d.rc[i] || F.items[i].r[0]); while (d.im.length < 2) d.im.push('');
      draw(); toast('تم الاقتراح — عدّليه كما ترين');
    };
    const save = async () => {
      grab(); if (!d.t || !d.date) { toast('اختاري المعلمة والتاريخ', 1); return null; }
      const st = staffBy(d.t); if (!st.dept) { toast('اسم المعلمة غير موجود في قائمة المعلمات', 1); return null; }
      d.st = d.st.filter(Boolean); d.im = d.im.filter(Boolean); d.note = d.topic || d.note || '';
      const j = await call('save', { rec: { id: rec && rec.id, dept: st.dept, item: 'VPV', date: d.date, sum: 'زيارة النائب الأكاديمي: ' + d.t, d, key: d.t + '|' + d.date } });
      const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record);
      S.vpv = j.record.id; return j.record;
    };
    $('#vsave').onclick = async () => { if (await save()) { toast('تم الحفظ ✓'); show(); } };
    if ($('#vprev')) $('#vprev').onclick = async () => { const r = await save(); if (r) previewVisit(el, r); };
    if ($('#vsend')) $('#vsend').onclick = async () => { const r = await save(); if (r) sendVisit(r); };
    if ($('#vdel')) $('#vdel').onclick = async () => { if (!confirm('حذف هذه الزيارة نهائياً؟')) return; await call('delete', { id: rec.id }); S.records = S.records.filter(x => x.id !== rec.id); S.vpv = null; show(); };
  };
  draw();
}
/* رسم مصغّر لتحصيل طالبات المعلمة في المادة حسب المستوى (من سنابل) */
function achMini(t, subj) {
  if (!t || !subj || typeof sanabilClass !== 'function') return '';
  const st = staffBy(t); const secs = String(st.secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean);
  const L = { 10: 'العاشر', 11: 'الحادي عشر', 12: 'الثاني عشر' }; const agg = {};
  secs.forEach(sc => { const c = sanabilClass(sc, subj); if (!c) return; const lv = c.sec.split('-')[0]; const a = agg[lv] = agg[lv] || { sum: 0, n: 0, lvMean: c.lv ? c.lv.mean : null }; a.sum += c.me.mean * c.me.n; a.n += c.me.n; });
  const lvls = ['10', '11', '12'].filter(l => secs.some(x => x.startsWith(l)));
  if (!lvls.length) return '';
  const col = m => m >= 90 ? '#1F8F5B' : m >= 80 ? '#2E9E6E' : m >= 70 ? '#B7791F' : m >= 50 ? '#D2691E' : '#B42335';
  const tot = Object.values(agg).reduce((a, x) => ({ s: a.s + x.sum, n: a.n + x.n }), { s: 0, n: 0 });
  const bar = (lbl, m, sub) => `<div style="display:flex;align-items:center;gap:6px;flex:1;min-width:190px"><span style="font-size:11.5px;width:68px;color:var(--navy);font-weight:600">${lbl}</span>${m == null ? '<span style="font-size:11px;color:var(--muted)">لا توجد نتائج</span>' : `<span style="flex:1;height:9px;background:#EEF0F3;border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${Math.min(100, m)}%;background:${col(m)}"></i></span><b style="font-size:11.5px;color:${col(m)}">${m.toFixed(1)}%</b>${sub ? `<small style="font-size:10px;color:var(--muted)">${sub}</small>` : ''}`}</div>`;
  return `<div style="margin-top:10px;border:1px solid var(--line);border-radius:12px;padding:6px 10px;background:linear-gradient(90deg,#F6FBFA,#fff)"><div style="font-size:11px;color:var(--tiffany-d);margin-bottom:3px">تحصيل طالبات أ. ${esc(t)} في ${esc(subj)} — من سنابل</div><div style="display:flex;flex-wrap:wrap;gap:4px 14px">
    ${lvls.map(l => { const a = agg[l]; const m = a && a.n ? a.sum / a.n : null; return bar(L[l], m, m != null && a.lvMean != null ? `المستوى ${a.lvMean.toFixed(0)}%` : ''); }).join('')}
    ${tot.n && Object.keys(agg).length > 1 ? bar('الإجمالي', tot.s / tot.n, '') : ''}</div></div>`;
}
function visitInner(r) {
  const F = FORMS.visit, d = r.d; let lastD = '';
  const ys = (v, x) => v === x ? '☑' : '☐';
  return `<h1>${esc(F.title)}</h1><div class="sub">${esc(SCHOOL())} · <bdi dir="ltr">${REF.YEAR || ''}</bdi></div>
  <table><tr><th colspan="4">المعلومات الأساسيّة</th></tr>
    <tr><td class="k">المــدرسة</td><td>${esc(SCHOOL())}</td><td class="k">اليوم/التاريخ</td><td>${esc(dayOf(d.date))} ${dmy(d.date)}</td></tr>
    <tr><td class="k">المادّة</td><td>${esc(d.subj || '')}</td><td class="k">الصّف</td><td>${esc(d.s || '')}</td></tr>
    <tr><td class="k">الموضوع</td><td>${esc(d.topic || '')}</td><td class="k">نائب المدير للشؤون الأكاديمية</td><td>أ. ${VP_NAME}</td></tr>
    <tr><td class="k">المعلّم</td><td>أ. ${esc(d.t)}</td><td class="k">نوع المتابعة</td><td>${ys(d.mode, 'ميدانيّة')} ميدانيّة &nbsp; ${ys(d.mode, 'عن بُعد')} عن بُعد &nbsp;&nbsp; ${ys(d.kj, 'جزئيّة')} جزئيّة &nbsp; ${ys(d.kj, 'كليّة')} كليّة</td></tr>
    <tr><td class="k">التحصيل الأكاديمي</td><td>${esc(d.ach || '')}</td><td class="k">ملاحظات</td><td>${ys(d.live, 'بث مباشر مدمج')} بث مباشر مدمج &nbsp; ${ys(d.live, 'بث مباشر غير مدمج')} بث مباشر غير مدمج</td></tr></table>
  <table><tr><th>المجال</th><th>معايير الأداء</th>${F.scale.map(x => `<th style="width:6.5%;font-size:8.5px">${esc(x)}</th>`).join('')}<th style="width:24%">التوصيات<br><span style="font-weight:normal;font-size:8.5px">(تتضمن توجيهات لزيادة أثر الممارسات في تعلم الطلاب)</span></th></tr>
  ${F.items.map((x, i) => { const first = x.d !== lastD; lastD = x.d; const n = F.items.filter(y => y.d === x.d).length;
    return `<tr>${first ? `<td class="dm" rowspan="${n}">${esc(x.d)}</td>` : ''}<td style="font-size:10px">${esc(x.c)}</td>${F.scale.map((_, k) => `<td class="c">${ratingCell(d.rt && d.rt[i] === k)}</td>`).join('')}<td class="j" style="font-size:9.5px">${esc((d.rc || {})[i] || '')}</td></tr>`; }).join('')}</table>
  <div class="gen"><div class="h">ملاحظات وتوصيات عامّة</div><div class="b">${esc(d.pre || '')}${(d.st || []).length ? '\n\nنقاط القوة:\n' + d.st.map(x => '• ' + cleanEnd(x) + '.').join('\n') : ''}${(d.im || []).length ? '\n\nنقاط تحتاج إلى تحسين:\n' + d.im.map(x => '• ' + cleanEnd(x) + '.').join('\n') : ''}</div></div>
  <table class="sg"><tr><td>توقيع المعلم<br>أ. ${esc(d.t)}</td><td>توقيع نائب المدير للشؤون الأكاديمية<br>أ. ${VP_NAME}{{SIG}}</td></tr></table>`;
}
async function previewVisit(el, r) {
  await showPaper(el, 'استمارة الإشراف — ' + r.d.t, visitInner(r), '<button class="btn tf" id="pSend">إرسال للمعلمة</button>');
  $('#pBack').onclick = () => show(); $('#pSend').onclick = () => sendVisit(r);
}
async function sendVisit(r) {
  const s = staffBy(r.d.t);
  if (!confirm(`إرسال استمارة الإشراف بتوقيعك إلى أ. ${r.d.t}${s.email ? ' (' + s.email + ')' : ''}؟`)) return;
  const ok = await sendForm({ to: s.email, name: r.d.t, subject: `استمارة الإشراف على الأداء — ${dmy(r.date)}`, what: `استمارة الإشراف على أدائكِ في حصة ${r.d.subj || ''}${r.d.s ? ' للصف ' + r.d.s : ''} بتاريخ ${dmy(r.date)}`, inner: visitInner(r), file: `استمارة الإشراف - ${r.d.t} - ${r.date}` });
  if (ok) await markSent(r);
}
async function markSent(r) {
  const d = Object.assign({}, r.d, { sent: today() }); delete d._key;
  const j = await API.call('save', { rec: { id: r.id, dept: r.dept, item: r.item, date: r.date, sum: r.sum, d } });
  const i = S.records.findIndex(x => x.id === r.id); if (i >= 0) S.records[i] = j.record; show();
}

/* ================================================================== 2+3) متابعة الملفات (استمارات المتابعة الفصلية) */
const SC_CHIP = { 'مستكمل': 'ok', 'مستكمل جزئياً': 'warn', 'غير مستكمل': 'bad', 'لم يتم قياسه': '' };
function followTarget(kind) {
  if (kind === 'CF') return S.coords.filter(c => c.active !== false).map(c => ({ key: c.id, name: c.name, dept: c.dept[0], depts: c.dept, form: 'coord', role: 'منسقة قسم ' + c.dept.join(' و'), email: staffBy(c.name).email }));
  return S.records.filter(r => r.item === 'AST').map(r => ({ key: r.id, name: r.d.name, dept: 'الإدارية الأكاديمية', form: r.d.form, role: (FORMS.admin.find(a => a.k === r.d.form) || {}).rf || '', email: r.d.email, rec: r }));
}
function formDef(k) {
  if (k === 'coord') { const C = FORMS.coord; return { title: C.title, role: C.role, sig: C.sig, notes: C.notes, rows: C.domains.flatMap((dm, di) => dm.ev.map((e, j) => ({ dom: dm.d, ind: dm.ind, di, first: j === 0, span: dm.ev.length, e: e.e, t: e.t, r: e.r }))), pos: C.pos, neg: C.neg }; }
  const A = FORMS.admin.find(a => a.k === k); if (!A) return null;
  const nums = k === 'lrc' ? [1, 3, 4, 5, 6, 7] : A.tasks.map((_, i) => i + 1);
  return { title: A.title, role: A.role, sig: A.sig, rows: A.tasks.map((t, i) => ({ n: nums[i], e: t.e, t: t.t, r: t.r })), pos: FORMS.coord.pos, neg: FORMS.coord.neg };
}
async function A_files(el, kind) {
  await loadForms();
  const ttl = kind === 'CF' ? 'متابعة ملفات المنسقات' : 'متابعة ملفات الإدارية الأكاديمية';
  setTitle(ttl);
  const sem = S.fsem || curSem();
  if (S.fopen) { const T = followTarget(kind).find(x => x.key === S.fopen); if (T) return fileForm(el, kind, T, sem); S.fopen = null; }
  const T = followTarget(kind);
  const recOf = t => S.records.find(r => r.item === kind && r.d.tk === t.key && r.d.sem === sem);
  const sumOf = r => { const ev = (r && r.d.ev) || {}; const v = Object.values(ev); return { c: v.filter(x => x === 'مستكمل').length, p: v.filter(x => x === 'مستكمل جزئياً').length, n: v.filter(x => x === 'غير مستكمل').length }; };
  el.innerHTML = `
  <div class="tabs">${SEMS.map(s => `<button class="${s === sem ? 'on' : ''}" data-s="${s}">متابعة ملفات ${s}</button>`).join('')}</div>
  <div class="note">الاستمارة المعتمدة من الدليل الإرشادي لنائب المدير للشؤون الأكاديمية، وتُعبَّأ بصورة فصلية. التقدير بالقائمة (مستكمل · مستكمل جزئياً · غير مستكمل · لم يتم قياسه)، وتبقى خانة الملاحظات فارغة للمستكمل، وتظهر التوصيات المناسبة للمستكمل جزئياً وغير المستكمل مع إمكانية الكتابة الحرة.</div>
  ${kind === 'AF' ? `<div class="card noprint"><div class="row"><h2 style="margin:0">موظفات الإدارية الأكاديمية</h2><span class="sp"></span><button class="btn sec" id="addStf">+ إضافة موظفة</button></div><div style="font-size:12.5px;color:var(--muted);margin-top:6px">أضيفي الاسم والمسمى الوظيفي والبريد الإلكتروني مرة واحدة، وتبقى محفوظة لكِ وحدكِ.</div></div>` : ''}
  <div class="card"><h2>${ttl} — ${sem}</h2><div class="tbl"><table class="t"><tr><th>الاسم</th><th>المسمى</th><th>تاريخ المتابعة</th><th>مستكمل</th><th>جزئياً</th><th>غير مستكمل</th><th>الإرسال</th><th></th></tr>
  ${T.map(t => { const r = recOf(t), x = sumOf(r);
    return `<tr><td><b>${esc(t.name)}</b></td><td style="font-size:12.5px">${esc(t.role)}</td><td>${r ? dmy(r.date) : '<span class="chip">لم تُعبّأ</span>'}</td><td>${r ? `<span class="chip ok">${x.c}</span>` : ''}</td><td>${r ? `<span class="chip warn">${x.p}</span>` : ''}</td><td>${r ? `<span class="chip bad">${x.n}</span>` : ''}</td><td>${r && r.d.sent ? `<span class="chip ok">${dm(r.d.sent)}</span>` : r ? '<span class="chip">لم تُرسل</span>' : ''}</td>
      <td><button class="btn sm" data-o="${esc(t.key)}">${r ? 'فتح' : 'تعبئة'}</button>${kind === 'AF' ? ` <button class="btn sm ghost" data-e="${esc(t.key)}">تعديل البيانات</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="8"><div class="empty">${kind === 'AF' ? 'أضيفي موظفات الإدارية الأكاديمية أولاً (محضرة المختبر، مسؤولة مصادر التعلم، المرشدة الأكاديمية، منسقة مشاريع التعليم الإلكتروني، اختصاصية الأنشطة)' : 'لا توجد منسقات'}</div></td></tr>`}</table></div></div>`;
  $$('[data-s]', el).forEach(b => b.onclick = () => { S.fsem = b.dataset.s; show(); });
  $$('[data-o]', el).forEach(b => b.onclick = () => { S.fopen = b.dataset.o; show(); });
  if (kind === 'AF') { $('#addStf').onclick = () => staffModal(null); $$('[data-e]', el).forEach(b => b.onclick = () => staffModal(S.records.find(r => r.id === b.dataset.e))); }
}
function staffModal(rec) {
  const d = rec ? rec.d : { name: '', form: 'lab', email: '' };
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box"><h3>${rec ? 'تعديل بيانات موظفة' : 'إضافة موظفة — الإدارية الأكاديمية'}</h3><form class="form" id="sf" style="grid-template-columns:1fr">
    <div class="fld"><label>الاسم</label><input data-n="name" value="${esc(d.name)}" required></div>
    <div class="fld"><label>المسمى الوظيفي (يحدد الاستمارة)</label><select data-n="form">${FORMS.admin.map(a => `<option value="${a.k}" ${d.form === a.k ? 'selected' : ''}>${esc(a.rf)}</option>`).join('')}</select></div>
    <div class="fld"><label>البريد الإلكتروني (للإرسال)</label><input data-n="email" type="email" dir="ltr" value="${esc(d.email || '')}" placeholder="name@education.qa"></div>
    <div class="actions"><button class="btn" type="submit">حفظ</button>${rec ? '<button class="btn ghost" type="button" id="sdel">حذف</button>' : ''}<button class="btn sec" type="button" id="sc">إلغاء</button></div></form></div>`;
  document.body.appendChild(m); $('#sc', m).onclick = () => m.remove();
  if ($('#sdel', m)) $('#sdel', m).onclick = async () => { if (!confirm('حذف الموظفة من القائمة؟ (لا تُحذف استماراتها السابقة)')) return; await call('delete', { id: rec.id }); S.records = S.records.filter(x => x.id !== rec.id); m.remove(); show(); };
  $('#sf', m).onsubmit = async e => { e.preventDefault(); const r = readForm($('#sf', m)); if (!r.name) return;
    const j = await call('save', { rec: { id: rec && rec.id, dept: 'الإدارية الأكاديمية', item: 'AST', date: today(), sum: r.name, d: r } });
    const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record); m.remove(); toast('تم الحفظ ✓'); show(); };
}
/* مؤشرات من المنصة لمساعدة النائب عند تقدير أدلة المنسقة (للاسترشاد فقط — لا تُطبع) */
function coordHints(T, sem) {
  const R = semRange(sem); const Pf = { name: sem, from: R.from, to: R.to };
  const out = {};
  try {
    const Rs = T.depts.map(dp => buildReport(ctxFor(dp, Pf))); const K = k => Rs.reduce((a, x) => a + (+x.K[k] || 0), 0);
    const pct = k => { const v = Rs.map(x => x.K[k]).filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) + '%' : '—'; };
    const recs = (it, f) => S.records.filter(r => T.depts.includes(r.dept) && r.item === it && r.date >= R.from && r.date <= R.to && (!f || f(r)));
    const reps = S.reports.filter(r => T.depts.includes(r.dept) && S.periods.some(p => p.name === r.period && p.sem === sem));
    out['متابعة المنسق للخطة السنوية للقسم.'] = `سجلات التخطيط: ${recs('PL').length}`;
    out['متابعة أنشطة القسم'] = `الأنشطة الموثقة: ${K('activities')}`;
    out['إعداد التقارير الأكاديمية'] = `تقارير الفترات: ${reps.length} (موقّعة ${reps.filter(r => ['موقّع من المنسقة', 'معتمد'].includes(r.status)).length}، معتمدة ${reps.filter(r => r.status === 'معتمد').length})`;
    out['إجراء الزيارات الصفية وفق تصنيف المعلمين.'] = `الزيارات: ${K('visits')} · شمول المعلمات: ${pct('visitedPct')}`;
    out['تحرير استمارات الإشراف على أداء المعلم.'] = `زيارات بتوصيات موثقة: ${recs('V', r => r.d.r1).length}`;
    out['متابعة دمج التكنولوجيا في التعليم عبر نظام قطر للتعليم.'] = `أدوات التعليم الإلكتروني: ${K('elearn')}`;
    out['متابعة المنسق إعداد الاختبارات الداخلية.'] = `سجلات التقييم: ${recs('AS').length}`;
    out['إعداد وقراءة التحليل الوصفي والكمي للنتائج.'] = `تحليلات موثقة: ${recs('AS', r => SEC.AS.an(r.d)).length}`;
    out['قياس أثر إجراءات تحسين تعلم الطلبة.'] = `إجراءات رفع التحصيل: ${recs('RA').length} · بأثر موثق: ${recs('RA', r => r.d.imp).length}`;
    out['متابعة خطة التطوير المهني'] = `الالتزام بخطة التطوير: ${pct('planPct')}`;
    out['توثيق البرامج التدريبية'] = `برامج داخلية: ${recs('WS').length} · خارجية: ${recs('EX').length}`;
    out['قياس أثر التطوير'] = `ورش بأثر موثق: ${recs('WS', r => r.d.o).length}`;
    out['التطوير الذاتي'] = `مشاركات خارجية للمنسقة: ${recs('EX', r => r.d.t === T.name).length}`;
  } catch (e) {}
  return out;
}
function fileForm(el, kind, T, sem) {
  const D = formDef(T.form); if (!D) { el.innerHTML = '<div class="empty">الاستمارة غير معروفة</div>'; return; }
  const rec = S.records.find(r => r.item === kind && r.d.tk === T.key && r.d.sem === sem);
  const d = rec ? JSON.parse(JSON.stringify(rec.d)) : { tk: T.key, sem, name: T.name, date: today(), mode: 'ميدانية', ev: {}, nt: {}, pos: [], neg: [], gen: '' };
  d.ev = d.ev || {}; d.nt = d.nt || {}; d.pos = d.pos || []; d.neg = d.neg || [];
  const hints = kind === 'CF' ? coordHints(T, sem) : {};
  const SC = FORMS.scaleF;
  const compose = () => {
    const done = D.rows.map((x, i) => i).filter(i => d.ev[i] === 'مستكمل');
    const rest = D.rows.map((x, i) => i).filter(i => ['مستكمل جزئياً', 'غير مستكمل'].includes(d.ev[i]));
    const thanks = uniqA([...done.slice(0, 4).map(i => D.rows[i].t[0]), ...d.pos]).map(cleanEnd);
    let t = `أتقدم بخالص الشكر والتقدير للأستاذة ${T.name}${kind === 'CF' ? ' منسقة قسم ' + T.depts.join(' و') : ' ' + T.role} على جهودها المخلصة خلال ${sem}`;
    t += thanks.length ? '، ولا سيما: ' + thanks.join('، و') + '.' : '.';
    const rcs = uniqA([...rest.map(i => d.nt[i] || D.rows[i].r[0]), ...d.neg.map(x => 'معالجة ' + cleanEnd(x).replace(/^الحاجة إلى /, ''))]).map(cleanEnd);
    if (rcs.length) t += '\n\nوأوصي بـ:\n' + rcs.map(x => '• ' + x + '.').join('\n');
    t += '\n\nمع خالص التمنيات بدوام التميز والعطاء.';
    return t;
  };
  const draw = () => {
    let h = `<div class="row noprint" style="margin-bottom:10px"><button class="btn sec" id="fb">رجوع</button><span class="sp"></span>${rec ? '<button class="btn ghost" id="fdel">حذف</button>' : ''}<button class="btn" id="fs">حفظ</button>${rec ? '<button class="btn sec" id="fp">معاينة الاستمارة</button><button class="btn tf" id="fsend">إرسال للموظفة</button>' : ''}</div>
    <div class="card"><h2>${esc(D.title)} <span class="sub">${esc(sem)}</span></h2><form class="form" onsubmit="return false">
      <div class="fld"><label>المدرسة</label><input value="${esc(SCHOOL())}" disabled></div>
      <div class="fld"><label>الاسم</label><input value="${esc(T.name)}" disabled></div>
      <div class="fld"><label>التاريخ</label><input type="date" id="fD" value="${esc(d.date)}"></div>
      <div class="fld"><label>اليوم</label><input id="fDay" value="${esc(dayOf(d.date))}" disabled></div>
      <div class="fld"><label>نوع المتابعة</label><select id="fM">${['ميدانية', 'عن بعد'].map(x => `<option ${d.mode === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    </form></div>
    <div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">${kind === 'CF' ? 'الأدلة والمتابعة' : 'المهام الأكاديمية ومتابعة تنفيذها'}</h2><span class="sp"></span><button class="btn sm sec" id="allC" type="button">تعيين الكل «مستكمل»</button></div>
    <div class="tbl"><table class="t"><tr>${kind === 'CF' ? '<th>المجال</th><th>المؤشرات</th><th>الأدلة</th>' : '<th>الرقم</th><th>المهام الأكاديمية</th>'}<th style="width:150px">المتابعة</th><th>الملاحظات والتوصيات</th></tr>
    ${D.rows.map((x, i) => { const v = d.ev[i] || ''; const need = ['مستكمل جزئياً', 'غير مستكمل'].includes(v);
      const hint = hints[x.e] ? `<div style="font-size:11px;color:var(--tiffany-d)">📊 ${esc(hints[x.e])}</div>` : '';
      return `<tr>${kind === 'CF' ? (x.first ? `<td rowspan="${x.span}" style="background:var(--maroon-l);color:var(--maroon);font-weight:700;text-align:center">${esc(x.dom)}</td><td rowspan="${x.span}" style="font-size:12px">${esc(x.ind)}</td>` : '') : `<td style="text-align:center">${x.n}</td>`}
        <td style="font-size:13px">${esc(x.e)}${hint}</td>
        <td><select data-ev="${i}" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:4px">${['', ...SC].map(s => `<option ${v === s ? 'selected' : ''} value="${s}">${s || 'اختاري…'}</option>`).join('')}</select></td>
        <td>${need ? `<input list="dlN${i}" data-nt="${i}" value="${esc(d.nt[i] || x.r[0])}" style="width:100%;min-width:220px;border:1px solid var(--line);border-radius:8px;padding:4px 6px;font-size:12.5px">${dl('dlN' + i, x.r)}` : v === 'مستكمل' ? `<span style="font-size:11.5px;color:var(--muted)">تبقى فارغة في الاستمارة · يُضاف الشكر في التوصيات</span>` : ''}</td></tr>`; }).join('')}</table></div></div>
    <div class="grid g2">
      <div class="card"><h2>إشادات وشكر <span class="sub">تُضاف إلى بداية التوصيات العامة</span></h2>${D.pos.map(x => `<label style="display:block;margin:4px 0"><input type="checkbox" data-pos="${esc(x)}" ${d.pos.includes(x) ? 'checked' : ''}> ${esc(x)}</label>`).join('')}<input id="posX" placeholder="إشادة أخرى (كتابة حرة) ثم Enter" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:10px;padding:6px">${d.pos.filter(x => !D.pos.includes(x)).map(x => `<label style="display:block;margin:4px 0"><input type="checkbox" data-pos="${esc(x)}" checked> ${esc(x)}</label>`).join('')}</div>
      <div class="card"><h2>نقاط تحتاج إلى تحسين <span class="sub">تتحول إلى توصيات</span></h2>${D.neg.map(x => `<label style="display:block;margin:4px 0"><input type="checkbox" data-neg="${esc(x)}" ${d.neg.includes(x) ? 'checked' : ''}> ${esc(x)}</label>`).join('')}<input id="negX" placeholder="ملاحظة أخرى (كتابة حرة) ثم Enter" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:10px;padding:6px">${d.neg.filter(x => !D.neg.includes(x)).map(x => `<label style="display:block;margin:4px 0"><input type="checkbox" data-neg="${esc(x)}" checked> ${esc(x)}</label>`).join('')}</div>
    </div>
    <div class="card"><div class="row"><h2 style="margin:0">التوصيات العامة</h2><span class="sp"></span><button class="btn sm sec" id="gAuto" type="button">إعادة الصياغة التلقائية من التقديرات</button></div>
      <textarea id="gen" style="width:100%;min-height:200px;border:1px solid var(--line);border-radius:12px;padding:10px;margin-top:8px;line-height:1.9;text-align:justify">${esc(d.gen || compose())}</textarea></div>`;
    el.innerHTML = h;
    const grab = () => { d.date = $('#fD').value; d.mode = $('#fM').value; $$('[data-ev]', el).forEach(s => { if (s.value) d.ev[s.dataset.ev] = s.value; else delete d.ev[s.dataset.ev]; });
      $$('[data-nt]', el).forEach(i => d.nt[i.dataset.nt] = i.value.trim());
      Object.keys(d.nt).forEach(k => { if (!['مستكمل جزئياً', 'غير مستكمل'].includes(d.ev[k])) delete d.nt[k]; });
      d.pos = $$('[data-pos]', el).filter(c => c.checked).map(c => c.dataset.pos); d.neg = $$('[data-neg]', el).filter(c => c.checked).map(c => c.dataset.neg); d.gen = $('#gen').value; };
    const regen = () => { grab(); d.gen = compose(); };
    $('#fD').onchange = () => { $('#fDay').value = dayOf($('#fD').value); };
    $$('[data-ev]', el).forEach(s => s.onchange = () => { regen(); draw(); });
    $$('[data-pos],[data-neg]', el).forEach(c => c.onchange = () => { regen(); draw(); });
    const addFree = (id, arr) => { $(id).onkeydown = e => { if (e.key === 'Enter' && e.target.value.trim()) { e.preventDefault(); grab(); d[arr].push(e.target.value.trim()); d.gen = compose(); draw(); } }; };
    addFree('#posX', 'pos'); addFree('#negX', 'neg');
    $('#allC').onclick = () => { grab(); D.rows.forEach((x, i) => { if (!d.ev[i]) d.ev[i] = 'مستكمل'; }); d.gen = compose(); draw(); };
    $('#gAuto').onclick = () => { regen(); draw(); };
    $('#fb').onclick = () => { S.fopen = null; show(); };
    const save = async () => { grab(); d.name = T.name; d.role = T.role; d.form = T.form;
      const j = await call('save', { rec: { id: rec && rec.id, dept: T.dept, item: kind, date: d.date, sum: (kind === 'CF' ? 'متابعة ملفات المنسقة: ' : 'متابعة ملفات: ') + T.name + ' — ' + sem, d, key: T.key + '|' + sem } });
      const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record); return j.record; };
    $('#fs').onclick = async () => { await save(); toast('تم الحفظ ✓'); show(); };
    if ($('#fp')) $('#fp').onclick = async () => { const r = await save(); await showPaper(el, D.title, await withCSig(fileInner(D, T, r, kind), T, kind), '<button class="btn tf" id="pSend">إرسال للموظفة</button>'); $('#pBack').onclick = () => show(); $('#pSend').onclick = () => sendFile(D, T, r, kind); };
    if ($('#fsend')) $('#fsend').onclick = async () => { const r = await save(); sendFile(D, T, r, kind); };
    if ($('#fdel')) $('#fdel').onclick = async () => { if (!confirm('حذف هذه الاستمارة؟')) return; await call('delete', { id: rec.id }); S.records = S.records.filter(x => x.id !== rec.id); S.fopen = null; show(); };
  };
  draw();
}
function fileInner(D, T, r, kind) {
  const d = r.d; const SC = FORMS.scaleF;
  const rows = D.rows.map((x, i) => { const v = d.ev[i] || ''; const nt = ['مستكمل جزئياً', 'غير مستكمل'].includes(v) ? (d.nt[i] || '') : '';
    return `<tr>${kind === 'CF' ? (x.first ? `<td class="dm" rowspan="${x.span}">${x.di + 1}.</td><td class="dm" rowspan="${x.span}">${esc(x.dom)}</td><td rowspan="${x.span}" class="j" style="font-size:9.5px">${esc(x.ind)}</td>` : '') : (i === 0 ? `<td class="dm" rowspan="${D.rows.length}">${esc(D.role)}</td>` : '') + `<td style="text-align:center;width:5%">${x.n}</td>`}
      <td style="font-size:10px">${esc(x.e)}</td><td style="text-align:center;font-weight:bold;width:13%">${esc(v)}</td>${kind === 'CF' ? '' : `<td class="j" style="font-size:9.5px;width:30%">${esc(nt)}</td>`}</tr>`; }).join('');
  const head = kind === 'CF' ? '<tr><th>م</th><th>المجال</th><th>المؤشرات</th><th>الأدلة</th><th>المتابعة</th></tr>' : '<tr><th>المسمى المستهدف</th><th>الرقم</th><th>المهام الأكاديمية</th><th>متابعة تنفيذ المهام</th><th>الملاحظات والتوصيات</th></tr>';
  const sigs = D.sig.map(s => s === 'نائب المدير للشؤون الأكاديمية' ? `<td>${s}<br>أ. ${VP_NAME}{{SIG}}</td>` : s === D.sig[0] ? `<td>${s}<br>أ. ${esc(T.name)}${kind === 'CF' ? '{{CSIG}}' : ''}</td>` : `<td>${s}</td>`).join('');
  return `<h1>${esc(D.title)}</h1><div class="sub">${esc(d.sem)} · <bdi dir="ltr">${REF.YEAR || ''}</bdi></div>
  <table><tr><th colspan="4">المعلومات الأساسيّة</th></tr>
    <tr><td class="k">المدرسة</td><td colspan="3">${esc(SCHOOL())}</td></tr>
    <tr><td class="k">اسم ${esc(kind === 'CF' ? 'المنسق' : D.role)}</td><td colspan="3">أ. ${esc(T.name)}${kind === 'CF' ? ' — قسم ' + esc(T.depts.join(' و')) : ''}</td></tr>
    <tr><td class="k">اليوم</td><td>${esc(dayOf(d.date))}</td><td class="k">التاريخ</td><td>${dmy(d.date)}</td></tr>
    <tr><td class="k">نوع المتابعة</td><td colspan="3">${d.mode === 'ميدانية' ? '☑' : '☐'} ميدانية &nbsp;&nbsp; ${d.mode === 'عن بعد' ? '☑' : '☐'} عن بعد</td></tr></table>
  <table>${head}${rows}</table>
  ${kind === 'CF' ? `<div class="gen"><div class="h">التوصيات العامة</div><div class="fnote" style="padding:2px 8px">${D.notes.map(n => '* ' + esc(n)).join('<br>')}</div><div class="b">${esc(d.gen || '')}</div></div>` : `<div class="gen"><div class="h">التوصيات العامة</div><div class="b">${esc(d.gen || '')}</div></div>`}
  <div class="fnote">تنويه: يستخدم هذا النموذج من قبل نائب المدير للشؤون الأكاديمية بصورة فصلية.</div>
  <table class="sg"><tr>${sigs}</tr></table>`;
}
async function withCSig(inner, T, kind) {
  if (kind !== 'CF' || !inner.includes('{{CSIG}}')) return inner.replace(/\{\{CSIG\}\}/g, '');
  let d = ''; try { d = (await API.call('signature', { who: T.key })).data; } catch (e) {}
  return inner.replace(/\{\{CSIG\}\}/g, d ? `<img src="${d}" alt="">` : '');
}
async function sendFile(D, T, r, kind) {
  const to = T.email || staffBy(T.name).email;
  if (!confirm(`إرسال «${D.title}» بتوقيعك إلى أ. ${T.name}${to ? ' (' + to + ')' : ''}؟`)) return;
  const ok = await sendForm({ to, name: T.name, subject: `${D.title} — ${r.d.sem}`, what: `${D.title} الخاصة بكِ عن ${r.d.sem}`, inner: await withCSig(fileInner(D, T, r, kind), T, kind), file: `${D.title} - ${T.name} - ${r.d.sem}` });
  if (ok) await markSent(r);
}
function A_cfiles(el) { return A_files(el, 'CF'); }
function A_afiles(el) { return A_files(el, 'AF'); }
