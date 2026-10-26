/* الميزان — واجهة المعلمة: مبادراتي وأنشطتي (تسجيل فقط، والحذف للنائب الأكاديمي) + عرضها للنائب */
'use strict';

const isTeacher = () => S.user && S.user.role === 'teacher';
const TA_KIND = { ini: 'مبادرة', act: 'نشاط' };
const TA_SRC = ['نشاط استحدثته مع طالباتي', 'نشاط قائم في المدرسة شاركتُ فيه'];
const myTA = kind => S.records.filter(r => r.item === 'TA' && (!kind || r.d.kind === kind)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const meStaff = () => S.staff.find(s => s.name === S.user.name) || {};

function T_navHTML() {
  const it = (v, t, ic, n) => `<a class="it ${S.view === v ? 'on' : ''}" data-v="${v}">${ICON[ic]}<span>${t}</span>${n ? `<span class="n">${n}</span>` : ''}</a>`;
  return `${it('home', 'الرئيسية', 'home')}<div class="grp">سجلّي</div>${it('t_ini', 'مبادراتي', 'star', myTA('مبادرة').length)}${it('t_act', 'أنشطتي', 'cal', myTA('نشاط').length)}`;
}
function T_home(el) {
  setTitle('الرئيسية');
  const p = P(); const inPer = r => inP(r.date, p);
  const I = myTA('مبادرة'), A = myTA('نشاط');
  el.innerHTML = `
  <div class="hero"><div class="pat pattern"></div><h2>أهلاً أ. ${esc(S.user.name)}</h2><p>سجّلي مبادراتك وأنشطتك أولاً بأول، فهي تُحسب في تقارير القسم ولوحات التميز. ${esc(p.name)} · من ${dmy(p.from)} إلى ${dmy(p.to)}</p></div>
  <div class="grid g4">
    ${kpi('مبادراتي في الفترة', I.filter(inPer).length, 'الإجمالي ' + I.length, 'var(--maroon)')}
    ${kpi('أنشطتي في الفترة', A.filter(inPer).length, 'الإجمالي ' + A.length, 'var(--navy)')}
    ${kpi('الطالبات المستفيدات', [...I, ...A].filter(inPer).reduce((a, r) => a + (+r.d.n || 0), 0), 'في الفترة', 'var(--tiffany-d)')}
    ${kpi('الأولويات التي خدمتُها', new Set([...I, ...A].filter(inPer).map(r => r.d.p).filter(Boolean)).size, 'من 4 أولويات', 'var(--gold)')}
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card" style="cursor:pointer" id="goI"><h2>${ICON.star} مبادراتي</h2><p style="color:var(--muted)">مبادرة من فكرتك تخدم الطالبات أو المدرسة: هدفها، الفئة المستهدفة، والأولوية التي تخدمها.</p><button class="btn">+ تسجيل مبادرة</button></div>
    <div class="card" style="cursor:pointer" id="goA"><h2>${ICON.cal} أنشطتي</h2><p style="color:var(--muted)">نشاط استحدثتِه مع طالباتك، أو نشاط قائم في المدرسة شاركتِ فيه.</p><button class="btn">+ تسجيل نشاط</button></div>
  </div>`;
  $('#goI').onclick = () => { S.view = 't_ini'; S.edit = 'new'; refresh(); };
  $('#goA').onclick = () => { S.view = 't_act'; S.edit = 'new'; refresh(); };
}
function T_list(el, kind) {
  const isIni = kind === 'مبادرة';
  setTitle(isIni ? 'مبادراتي' : 'أنشطتي');
  const L = myTA(kind); const rec = S.edit && S.edit !== 'new' ? L.find(r => r.id === S.edit) : null;
  const d = S.taDraft || (rec ? Object.assign({}, rec.d) : { kind, date: today(), src: TA_SRC[0], secs: [] }); S.taDraft = null;
  const secs = String(meStaff().secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean);
  const form = S.edit ? `
  <div class="card"><h2>${rec ? 'تعديل' : 'تسجيل'} ${isIni ? 'مبادرة' : 'نشاط'}</h2>
  <form class="form" id="taf">
    ${isIni ? '' : `<div class="fld" style="grid-column:1/-1"><label>نوع النشاط</label><div class="row">${TA_SRC.map(x => `<label style="margin-inline-end:16px"><input type="radio" name="src" value="${esc(x)}" ${d.src === x ? 'checked' : ''}> ${esc(x)}</label>`).join('')}</div></div>`}
    <div class="fld" style="grid-column:1/-1"><label>${isIni ? 'اسم المبادرة' : 'اسم النشاط'}</label><input data-n="name" list="dlActs" value="${esc(d.name || '')}" required placeholder="${isIni ? 'مثال: مبادرة «أهديك رحمة»' : d.src === TA_SRC[1] ? 'اختاري من الأنشطة القائمة أو اكتبي' : 'اكتبي اسم النشاط'}">${!isIni && d.src === TA_SRC[1] ? `<datalist id="dlActs">${(S.acts || []).map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}</div>
    <div class="fld"><label>التاريخ</label><input type="date" data-n="date" value="${esc(d.date || today())}" required></div>
    <div class="fld"><label>الفئة المستهدفة</label><input data-n="tg" list="dlTg" value="${esc(d.tg || '')}" required placeholder="اختاري أو اكتبي"><datalist id="dlTg">${(REF.L.ac_target || []).concat(['الطالبات الواعدات', 'طالبات شعبتي']).map(x => `<option value="${esc(x)}">`).join('')}</datalist></div>
    <div class="fld"><label>الأولوية التي تخدمها</label><select data-n="p" required><option value="">اختاري…</option>${REF.PRIO.map(x => `<option ${d.p === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
    <div class="fld"><label>عدد الطالبات المشاركات</label><input type="number" min="0" data-n="n" value="${esc(d.n || '')}"></div>
    ${secs.length ? `<div class="fld" style="grid-column:1/-1"><label>الشعب</label><div class="row" style="flex-wrap:wrap">${secs.map(x => `<label style="margin-inline-end:12px"><input type="checkbox" data-sec value="${esc(x)}" ${(d.secs || []).includes(x) ? 'checked' : ''}> ${esc(x)}</label>`).join('')}</div></div>` : ''}
    <div class="fld" style="grid-column:1/-1"><label>${isIni ? 'فكرة المبادرة وهدفها' : 'وصف مختصر لما نُفّذ'}</label><textarea data-n="desc" rows="2">${esc(d.desc || '')}</textarea></div>
    <div class="fld" style="grid-column:1/-1"><label>الأثر على الطالبات</label><input data-n="imp" list="dlImp" value="${esc(d.imp || '')}" placeholder="اختاري أو اكتبي"><datalist id="dlImp">${(REF.L.ac_impact || []).map(x => `<option value="${esc(x)}">`).join('')}</datalist></div>
    <div class="fld" style="grid-column:1/-1"><label>رابط الدليل (اختياري — صورة أو ملف في Teams)</label><input data-n="ev" dir="ltr" value="${esc(d.ev || '')}"></div>
    <div class="actions"><button class="btn" type="submit">حفظ</button><button class="btn sec" type="button" id="tac">إلغاء</button></div>
  </form><div class="note" style="margin-top:8px">بعد الحفظ يمكنكِ التعديل، أما الحذف فيتم عن طريق النائب الأكاديمي فقط.</div></div>` : '';
  el.innerHTML = `${form}
  <div class="card"><div class="row"><h2 style="margin:0">${isIni ? 'مبادراتي المسجلة' : 'أنشطتي المسجلة'} (${L.length})</h2><span class="sp"></span>${S.edit ? '' : `<button class="btn" id="tan">+ تسجيل ${isIni ? 'مبادرة' : 'نشاط'}</button>`}</div>
  <div class="list" style="margin-top:8px">${L.map(r => `<div class="rec"><div class="dt">${dm(r.date)}</div><div class="tx"><b>${esc(r.d.name)}</b> <small style="color:var(--muted)">${esc(r.d.tg || '')}${r.d.n ? ' · ' + r.d.n + ' طالبة' : ''}${r.d.src && !isIni ? ' · ' + esc(r.d.src) : ''}</small><div class="by">${esc((r.d.p || '').replace(/^الأولوية \d: /, ''))}${r.d.desc ? ' — ' + esc(r.d.desc) : ''}</div></div><div class="ops"><button class="btn sm sec" data-e="${r.id}">تعديل</button></div></div>`).join('') || '<div class="empty">لم تُسجَّل بعد</div>'}</div></div>`;
  if ($('#tan')) $('#tan').onclick = () => { S.edit = 'new'; show(); };
  $$('[data-e]', el).forEach(b => b.onclick = () => { S.edit = b.dataset.e; show(); window.scrollTo(0, 0); });
  if (!S.edit) return;
  $('#tac').onclick = () => { S.edit = null; show(); };
  $$('input[name="src"]', el).forEach(x => x.onchange = () => { Object.assign(d, readForm($('#taf'))); d.src = x.value; S.taDraft = d; show(); });
  $('#taf').onsubmit = async e => {
    e.preventDefault(); const r = Object.assign(d, readForm($('#taf'))); r.kind = kind; r.n = r.n === '' ? '' : +r.n;
    const sr = $('input[name="src"]:checked', el); if (sr) r.src = sr.value; if (isIni) delete r.src;
    r.secs = $$('[data-sec]', el).filter(c => c.checked).map(c => c.value);
    const j = await call('save', { rec: { id: rec && rec.id, dept: S.user.dept[0], item: 'TA', date: r.date, sum: kind + ': ' + r.name, d: r } });
    const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record);
    S.edit = null; toast('تم الحفظ ✓ شكراً لعطائك'); refresh();
  };
}
function T_ini(el) { return T_list(el, 'مبادرة'); }
function T_act(el) { return T_list(el, 'نشاط'); }

/* ------------------------------------------------------------------ النائب: مبادرات المعلمات وأنشطتهن */
function A_tacts(el) {
  setTitle('مبادرات المعلمات وأنشطتهن (من سبع سنابل)');
  const p = P(); S.taF = S.taF || { kind: '', dept: '', all: false };
  const F = S.taF;
  const L = S.records.filter(r => r.item === 'TA' && (F.all || inP(r.date, p)) && (!F.kind || r.d.kind === F.kind) && (!F.dept || r.dept === F.dept)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const depts = [...new Set(S.records.filter(r => r.item === 'TA').map(r => r.dept))];
  const byT = {}; L.forEach(r => { const o = byT[r.d.t] = byT[r.d.t] || { i: 0, a: 0, n: 0, dept: r.dept }; o[r.d.kind === 'مبادرة' ? 'i' : 'a']++; o.n += +r.d.n || 0; });
  const prio = REF.PRIO.map(x => L.filter(r => r.d.p === x).length);
  el.innerHTML = `
  <div class="grid g4">${kpi('المبادرات', L.filter(r => r.d.kind === 'مبادرة').length, F.all ? 'كل العام' : p.name, 'var(--maroon)')}${kpi('الأنشطة', L.filter(r => r.d.kind === 'نشاط').length, F.all ? 'كل العام' : p.name, 'var(--navy)')}${kpi('المعلمات المسجّلات', Object.keys(byT).length, 'من ' + S.staff.filter(s => s.role === 'معلمة').length, 'var(--tiffany-d)')}${kpi('الطالبات المستفيدات', L.reduce((a, r) => a + (+r.d.n || 0), 0), '', 'var(--gold)')}</div>
  <div class="card noprint" style="margin-top:14px"><div class="row" style="flex-wrap:wrap;gap:8px">
    <select id="fk"><option value="">المبادرات والأنشطة</option><option ${F.kind === 'مبادرة' ? 'selected' : ''}>مبادرة</option><option ${F.kind === 'نشاط' ? 'selected' : ''}>نشاط</option></select>
    <select id="fd"><option value="">كل الأقسام</option>${depts.map(x => `<option ${F.dept === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
    <label><input type="checkbox" id="fa" ${F.all ? 'checked' : ''}> كل العام (وليس ${esc(p.name)} فقط)</label><span class="sp"></span><button class="btn sec" onclick="window.print()">طباعة</button></div></div>
  <div class="grid g2">
    <div class="card"><h2>حسب المعلمة</h2>${Object.entries(byT).sort((a, b) => (b[1].i + b[1].a) - (a[1].i + a[1].a)).map(([t, o], i) => `<div class="row" style="margin:6px 0"><span class="medal ${i < 3 ? 'g' + (i + 1) : ''}">${i + 1}</span><span class="sp"><b>${esc(t)}</b> <small style="color:var(--muted)">${esc(o.dept)}</small></span><span class="chip">مبادرات ${o.i}</span><span class="chip">أنشطة ${o.a}</span></div>`).join('') || '<div class="empty">لا توجد تسجيلات</div>'}</div>
    <div class="card"><h2>حسب الأولوية</h2>${REF.PRIO.map((x, i) => `<div class="row" style="margin:6px 0"><span style="width:230px;font-size:13px">${esc(x.replace(/^الأولوية \d: /, ''))}</span><div class="bar sp"><i style="width:${L.length ? prio[i] / L.length * 100 : 0}%"></i></div><b>${prio[i]}</b></div>`).join('')}</div>
  </div>
  <div class="card"><h2>السجل (${L.length})</h2><div class="tbl"><table class="t"><tr><th>التاريخ</th><th>المعلمة</th><th>القسم</th><th>النوع</th><th>الاسم</th><th>الفئة المستهدفة</th><th>الأولوية</th><th>العدد</th><th class="noprint"></th></tr>
    ${L.map(r => `<tr><td>${dm(r.date)}</td><td><b>${esc(r.d.t)}</b></td><td style="font-size:12px">${esc(r.dept)}</td><td><span class="chip ${r.d.kind === 'مبادرة' ? 'tf' : ''}">${esc(r.d.kind)}</span>${r.d.src ? `<br><small style="color:var(--muted)">${esc(r.d.src === TA_SRC[0] ? 'مستحدث' : 'قائم')}</small>` : ''}</td><td>${esc(r.d.name)}${r.d.desc ? `<div style="font-size:11.5px;color:var(--muted)">${esc(r.d.desc)}</div>` : ''}${r.d.ev ? ` <a href="${esc(r.d.ev)}" target="_blank" rel="noopener">الدليل</a>` : ''}</td><td style="font-size:12px">${esc(r.d.tg || '')}</td><td style="font-size:12px">${esc((r.d.p || '').replace(/^الأولوية \d: /, ''))}</td><td>${esc(r.d.n || '')}</td><td class="noprint"><button class="btn sm ghost" data-x="${r.id}">حذف</button></td></tr>`).join('') || '<tr><td colspan="9"><div class="empty">لا توجد تسجيلات في هذه الفترة</div></td></tr>'}</table></div></div>`;
  $('#fk').onchange = e => { F.kind = e.target.value; show(); }; $('#fd').onchange = e => { F.dept = e.target.value; show(); }; $('#fa').onchange = e => { F.all = e.target.checked; show(); };
  $$('[data-x]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذا السجل نهائياً؟')) return; await call('delete', { id: b.dataset.x }); S.records = S.records.filter(x => x.id !== b.dataset.x); show(); });
}
