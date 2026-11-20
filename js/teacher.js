/* الميزان — واجهة المعلمة: مبادراتي وأنشطتي (تسجيل فقط، والحذف للنائب الأكاديمي) + عرضها للنائب */
'use strict';

const isTeacher = () => S.user && S.user.role === 'teacher';
const TA_KIND = { ini: 'مبادرة', act: 'نشاط' };
const TA_SRC = ['نشاط استحدثته مع طالباتي', 'نشاط قائم في المدرسة شاركتُ فيه'];
const myTA = kind => S.records.filter(r => r.item === 'TA' && (!kind || (kind === 'مبادرة' ? r.d.kind === 'مبادرة' : r.d.kind !== 'مبادرة'))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
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
    ${kpi('الأولويات التي خدمتُها', new Set([...I, ...A].filter(inPer).flatMap(r => r.d.ps && r.d.ps.length ? r.d.ps : [r.d.p]).filter(Boolean)).size, 'من 4 أولويات', 'var(--gold)')}
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
  const base = S.records.filter(r => r.item === 'TA' && (F.all || inP(r.date, p)));
  const isIni = r => r.d.kind === 'مبادرة';
  const L = base.filter(r => (!F.kind || (F.kind === 'مبادرة' ? isIni(r) : !isIni(r))) && (!F.dept || r.dept === F.dept)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const TCH = S.staff.filter(s => s.role === 'معلمة' || s.role === 'منسقة');
  const depts = [...new Set([...TCH.map(s => s.dept), ...base.map(r => r.dept)])].filter(Boolean);
  const byT = {}; L.forEach(r => { const o = byT[r.d.t] = byT[r.d.t] || { i: 0, a: 0, n: 0, dept: r.dept }; o[r.d.kind === 'مبادرة' ? 'i' : 'a']++; o.n += +r.d.n || 0; });
  const tl = (v, a, b, c) => v >= a ? 'tl4' : v >= b ? 'tl3' : v >= c ? 'tl2' : v > 0 ? 'tl1' : 'tl0';
  const per = F.all ? 'كل العام' : p.name;
  const D = depts.map(d => { const T = TCH.filter(s => s.dept === d).map(s => s.name); const R = L.filter(r => r.dept === d); const act = new Set(R.map(r => r.d.t));
    return { d, nT: T.length, nA: T.filter(t => act.has(t)).length, pc: T.length ? Math.round(T.filter(t => act.has(t)).length / T.length * 100) : 0, i: R.filter(r => r.d.kind === 'مبادرة').length, a: R.filter(r => r.d.kind !== 'مبادرة').length, st: R.reduce((x, r) => x + (+r.d.n || 0), 0), miss: T.filter(t => !act.has(t)), na: act.size }; })
    .filter(x => x.nT || x.i || x.a).sort((x, y) => y.pc - x.pc || (y.i + y.a) - (x.i + x.a));
  const mxW = Math.max(1, ...D.map(x => x.i + x.a)), mxS = Math.max(1, ...D.map(x => x.st));
  const Tl = Object.entries(byT).sort((a, b) => (b[1].i + b[1].a) - (a[1].i + a[1].a));
  const mxT = Math.max(1, ...Tl.map(([, o]) => o.i + o.a));
  const psOf = r => (r.d.ps && r.d.ps.length ? r.d.ps : [r.d.p]).filter(Boolean);
  const prio = REF.PRIO.map(x => L.filter(r => psOf(r).includes(x)).length);
  const nT = TCH.filter(s => !F.dept || s.dept === F.dept).length;
  const miss = D.filter(x => !F.dept || x.d === F.dept).flatMap(x => x.miss.map(t => [t, x.d]));
  el.innerHTML = `
  <div class="note">تُجمع هنا المبادرات والأنشطة التي سجّلتها المعلمات في سبع سنابل والميزان. الأخضر يعني مشاركة واسعة والأحمر يعني مشاركة قليلة، واضغطي اسم القسم لعرض تفاصيله.</div>
  <div class="row noprint" style="margin:10px 0;gap:8px;flex-wrap:wrap">
    <div class="tabs" style="margin:0"><button class="${F.all ? '' : 'on'}" data-al="0">${esc(p.name)}</button><button class="${F.all ? 'on' : ''}" data-al="1">كل العام</button></div>
    <div class="tabs" style="margin:0"><button class="${!F.kind ? 'on' : ''}" data-k="">الكل</button><button class="${F.kind === 'مبادرة' ? 'on' : ''}" data-k="مبادرة">المبادرات</button><button class="${F.kind === 'نشاط' ? 'on' : ''}" data-k="نشاط">الأنشطة والمسابقات والبرامج</button></div>
    ${F.dept ? `<button class="btn sm ghost" id="tdAll">✕ ${esc(F.dept)} — عرض كل الأقسام</button>` : ''}<span class="sp"></span><button class="btn sec" onclick="window.print()">🖨️ طباعة</button></div>
  <div class="cmhero"><div><h2>مبادرات المعلمات وأنشطتهن — ${esc(per)}</h2><div class="sub">${F.dept ? esc(F.dept) : 'جميع الأقسام'}</div></div><div class="cmks">
    <div class="cmk"><b>${L.filter(r => r.d.kind === 'مبادرة').length}</b><span>مبادرة</span></div><div class="cmk"><b>${L.filter(r => r.d.kind !== 'مبادرة').length}</b><span>نشاطاً ومسابقة وبرنامجاً</span></div>
    <div class="cmk"><b>${Object.keys(byT).filter(t => TCH.some(x => x.name === t && (!F.dept || x.dept === F.dept))).length}<small style="font-size:13px;color:#dfe5f3"> من ${nT}</small></b><span>معلمة شاركت</span></div><div class="cmk"><b>${L.reduce((x, r) => x + (+r.d.n || 0), 0)}</b><span>طالبة مستفيدة</span></div></div></div>
  ${F.dept ? '' : `<div class="card"><h2>مشاركة الأقسام <span class="sub">مرتّبة حسب نسبة المعلمات المشاركات</span></h2>
    <div class="tllg"><span class="tlc tl4">مرتفع</span><span class="tlc tl3">جيد</span><span class="tlc tl2">متوسط</span><span class="tlc tl1">منخفض</span><span class="tlc tl0">لا يوجد</span></div>
    <div class="tbl"><table class="t cmh"><tr><th style="min-width:170px">القسم</th><th>المعلمات المشاركات</th><th>المبادرات</th><th>الأنشطة والمسابقات</th><th>الطالبات المستفيدات</th></tr>
    ${D.map(x => `<tr class="acvr" data-dp="${esc(x.d)}" style="cursor:pointer"><td><b>${esc(x.d)}</b></td>
      <td class="tlc ${x.nT ? tl(x.pc, 80, 60, 30) : (x.na ? 'tl3' : 'tl0')}">${x.nT ? `${x.pc}%<br><small style="font-weight:500">${x.nA} من ${x.nT}</small>` : x.na ? x.na + ' معلمة' : '—'}</td>
      <td class="tlc ${tl(x.i / mxW * 4, 1.5, 1, .5)}">${x.i || '—'}</td><td class="tlc ${tl(x.a / mxW, .6, .4, .2)}">${x.a || '—'}</td><td class="tlc ${tl(x.st / mxS, .6, .35, .15)}">${x.st || '—'}</td></tr>`).join('')}</table></div></div>`}
  <div class="card"><h2>توزيع الأعمال على أولويات المدرسة <span class="sub">النسبة من مجموع الأعمال (${L.length})، وقد يرتبط العمل الواحد بأكثر من أولوية</span></h2><div class="tapr">${REF.PRIO.map((x, i) => `<div class="tapc"><b>${prio[i]}</b><span>${L.length ? Math.round(prio[i] / L.length * 100) : 0}%</span><div>${esc(x.replace(/^الأولوية \d: /, ''))}</div></div>`).join('')}</div></div>
  <div class="grid g2">
    <div class="card"><h2>المعلمات المشاركات <span class="sub">${Tl.length}</span></h2><div class="tbl"><table class="t cmh"><tr><th style="text-align:right">المعلمة</th><th>مبادرات</th><th>أنشطة</th><th>المجموع</th></tr>
      ${Tl.map(([t, o]) => `<tr><td style="white-space:nowrap"><b>${esc(t)}</b> <small style="color:var(--muted)">${esc(o.dept)}</small></td><td style="text-align:center">${o.i || '—'}</td><td style="text-align:center">${o.a || '—'}</td><td class="tlc ${tl((o.i + o.a) / mxT, .6, .35, .15)}">${o.i + o.a}</td></tr>`).join('') || '<tr><td colspan="4"><div class="empty">لا توجد مشاركات</div></td></tr>'}</table></div></div>
    <div class="card"><h2>معلمات لم يسجّلن بعد <span class="sub">${miss.length}</span></h2>${miss.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${miss.map(([t, d]) => `<span class="tlc tl0" style="border-radius:20px;padding:3px 12px;font-size:12.5px;white-space:nowrap">${esc(t)}${F.dept ? '' : ` <small style="font-weight:400">· ${esc(d)}</small>`}</span>`).join('')}</div>` : '<div class="empty">جميع المعلمات سجّلن ✓</div>'}</div>
  </div>
  <div class="card"><h2>السجل التفصيلي <span class="sub">${L.length}</span></h2><div class="tbl"><table class="t"><tr><th>التاريخ</th><th>المعلمة</th>${F.dept ? '' : '<th>القسم</th>'}<th>النوع</th><th>الاسم</th><th>الفئة المستهدفة</th><th>الأولوية</th><th>العدد</th><th class="noprint"></th></tr>
    ${L.map(r => `<tr><td style="white-space:nowrap">${dm(r.date)}</td><td style="white-space:nowrap"><b>${esc(r.d.t)}</b></td>${F.dept ? '' : `<td style="font-size:12px;white-space:nowrap">${esc(r.dept)}</td>`}<td><span class="chip ${r.d.kind === 'مبادرة' ? 'tf' : ''}">${esc(r.d.kind)}</span></td><td>${esc(r.d.name)}${r.d.ev ? ` <a href="${esc(r.d.ev)}" target="_blank" rel="noopener">الدليل</a>` : ''}</td><td style="font-size:12px">${esc(r.d.tg || '')}</td><td style="font-size:12px">${esc((r.d.p || '').replace(/^الأولوية \d: /, ''))}</td><td>${esc(r.d.n || '')}</td><td class="noprint"><button class="btn sm ghost" data-x="${r.id}">حذف</button></td></tr>`).join('') || '<tr><td colspan="9"><div class="empty">لا توجد تسجيلات في هذه الفترة</div></td></tr>'}</table></div></div>`;
  $$('[data-al]', el).forEach(b => b.onclick = () => { F.all = b.dataset.al === '1'; show(); });
  $$('[data-k]', el).forEach(b => b.onclick = () => { F.kind = b.dataset.k; show(); });
  $$('[data-dp]', el).forEach(b => b.onclick = () => { F.dept = b.dataset.dp; show(); window.scrollTo(0, 0); });
  if ($('#tdAll')) $('#tdAll').onclick = () => { F.dept = ''; show(); };
  $$('[data-x]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذا السجل نهائياً؟')) return; await call('delete', { id: b.dataset.x }); S.records = S.records.filter(x => x.id !== b.dataset.x); show(); });
}
