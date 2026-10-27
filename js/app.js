/* الميزان — الواجهة */
'use strict';

let REF = null;
const S = { token: null, user: null, periods: [], cal: [], pd: [], staff: [], coords: [], records: [], reports: [], dept: null, period: null, view: 'home', edit: null };
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const isAdmin = () => S.user && S.user.role === 'admin';
const P = () => S.periods.find(p => p.name === S.period) || S.periods[0];
const fmtPct = v => v == null ? '—' : Math.round(v * 100) + '%';

function toast(msg, bad) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), bad ? 4500 : 2600); }
function busy(on) { let b = $('#busy'); if (on && !b) { b = document.createElement('div'); b.id = 'busy'; b.className = 'loading'; b.innerHTML = '<div class="spin"></div>'; document.body.appendChild(b); } if (!on && b) b.remove(); }
async function call(a, p) { busy(true); try { return await API.call(a, p); } catch (e) { toast(e.message, 1); throw e; } finally { busy(false); } }

/* ------------------------------------------------------------------ الإقلاع */
async function start() {
  REF = await fetch('data/ref.json?v=' + (window.MIZAN_V || Date.now())).then(r => r.json());
  const tok = sessionStorage.getItem('mizan_tok');
  if (tok) { S.token = tok; try { await boot(); return; } catch (e) { sessionStorage.removeItem('mizan_tok'); } }
  renderLogin();
}
async function boot() {
  const j = await call('boot');
  Object.assign(S, { user: j.user, periods: j.periods, cal: j.cal, pd: j.pd, staff: j.staff, coords: j.coords || [], records: j.records, reports: j.reports, acts: j.acts || [], staffAll: j.staffAll || [], students: j.students || [] });
  const t = today(); const cur = S.periods.find(p => t >= p.from && t <= p.to) || [...S.periods].reverse().find(p => p.from <= t) || S.periods[0];
  S.period = S.period || (cur && cur.name);
  S.dept = S.dept || (isAdmin() ? null : S.user.dept[0]);
  S.view = S.view || 'home';
  renderApp();
}

/* ------------------------------------------------------------------ الدخول */
function renderLogin() {
  document.body.innerHTML = `
  <div class="login pattern">
    <div class="card">
      <img class="logo" src="assets/logo.png" alt="">
      <h1 class="brand-name">الميزان</h1>
      <div class="brand-tag">ميزان تربوي</div>
      <div class="brand-school">مدرسة الشيماء الثانوية للبنات · ${REF.YEAR}</div>
      ${API.live() ? '' : '<div class="note warn" style="text-align:right">وضع المعاينة: بيانات وأسماء خيالية للتجربة فقط. جرّبي 1111 للمنسقة أو 000000 للإدارة.</div>'}
      <div>أدخلي رقمك السري</div>
      <div class="pin-dots" id="dots"></div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button class="act" data-k="del">مسح</button><button data-k="0">0</button><button class="act" data-k="ok">دخول</button></div>
      <div class="err" id="err"></div>
      <div class="foot">الدخول برقمك السري فقط · لا يمكن لأحد التعبئة أو التوقيع نيابةً عنك</div>
    </div>
  </div>`;
  let pin = '';
  const draw = () => { $('#dots').innerHTML = Array.from({ length: Math.max(4, pin.length) }, (_, i) => `<span class="${i < pin.length ? 'on' : ''}"></span>`).join(''); };
  const go = async () => {
    if (pin.length < 4) return;
    $('#err').textContent = '';
    try { const j = await API.call('login', { pin, app: 'mizan' }); S.token = j.token; sessionStorage.setItem('mizan_tok', j.token); await boot(); }
    catch (e) { $('#err').textContent = e.message; pin = ''; draw(); }
  };
  $$('.pad button').forEach(b => b.onclick = () => { const k = b.dataset.k; if (k === 'del') pin = pin.slice(0, -1); else if (k === 'ok') return go(); else if (pin.length < 8) pin += k; draw(); });
  document.onkeydown = e => { if (!$('#dots')) return; if (/^\d$/.test(e.key) && pin.length < 8) { pin += e.key; draw(); } else if (e.key === 'Backspace') { pin = pin.slice(0, -1); draw(); } else if (e.key === 'Enter') go(); };
  draw();
}
async function logout() { try { await API.call('logout'); } catch (e) {} sessionStorage.removeItem('mizan_tok'); location.reload(); }

/* ------------------------------------------------------------------ الإطار */
const ICON = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  doc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h4"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  dot: '<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="currentColor" opacity=".6"/></svg>',
  scale: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M5 21h14M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/></svg>',
  user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  star: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.5l1.1-6L3.4 9.3l6-.8z"/></svg>',
  cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
};
function navHTML() {
  const cnt = k => S.records.filter(r => r.item === k && r.dept === S.dept && inP(r.date, P())).length;
  if (isTeacher()) return T_navHTML();
  if (isAdmin()) {
    const it = (v, t, ic) => `<a class="it ${S.view === v ? 'on' : ''}" data-v="${v}">${ICON[ic]}<span>${t}</span></a>`;
    return `<div class="grp">لوحة القيادة</div>${it('home', 'نظرة عامة', 'home')}${it('a_compare', 'مقارنة المنسقات', 'chart')}${it('a_boards', 'لوحات التميز', 'star')}
      <div class="grp">التقارير</div>${it('a_reports', 'تقارير الأقسام والاعتماد', 'doc')}
      <div class="grp">حضوري الصفي</div>${it('a_vpvisit', 'حضور النائب الأكاديمي', 'scale')}${it('a_visits', 'خطة زيارات المعلمات', 'cal')}
      <div class="grp">المعلمات</div>${it('a_tacts', 'مبادرات المعلمات وأنشطتهن', 'star')}
      <div class="grp">متابعة الملفات</div>${it('a_cfiles', 'ملفات المنسقات', 'doc')}${it('a_afiles', 'ملفات الإدارية الأكاديمية', 'user')}
      <div class="grp">الإعدادات</div>${it('a_accounts', 'حسابات المنسقات', 'user')}`;
  }
  let h = `<a class="it ${S.view === 'home' ? 'on' : ''}" data-v="home">${ICON.home}<span>الرئيسية</span></a><div class="grp">الحضور الصفي</div><a class="it ${S.view === 'c_visit' ? 'on' : ''}" data-v="c_visit">${ICON.scale || ICON.dot}<span>الحضور الصفي وخطته الشهرية</span></a>`;
  GROUPS.forEach(g => {
    h += `<div class="grp">${g.t}</div>`;
    SECTIONS.filter(s => s.g === g.id).forEach(s => { const n = cnt(s.k); h += `<a class="it ${S.view === 'sec:' + s.k ? 'on' : ''}" data-v="sec:${s.k}">${ICON.dot}<span>${s.t}</span>${n ? `<span class="n">${n}</span>` : ''}</a>`; });
  });
  h += `<div class="grp">المخرجات</div><a class="it ${S.view === 'report' ? 'on' : ''}" data-v="report">${ICON.doc}<span>تقرير أعمال القسم</span></a><a class="it ${S.view === 'stats' ? 'on' : ''}" data-v="stats">${ICON.chart}<span>مؤشراتي ومقارناتي</span></a>`;
  return h;
}
function renderApp() {
  document.onkeydown = null;
  const deptSel = !isAdmin() && !isTeacher() && S.user.dept.length > 1 ? `<select id="deptSel">${S.user.dept.map(d => `<option ${d === S.dept ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>` : '';
  document.body.innerHTML = `
  <div class="app">
    <aside class="side" id="side">
      <div class="head band"><img src="assets/logo.png" alt=""><div><b>الميزان</b><small>ميزان تربوي</small></div></div>
      <nav id="nav">${navHTML()}</nav>
      <div class="who"><b>${esc(S.user.name)}</b>${isAdmin() ? 'نائب المدير للشؤون الأكاديمية' : isTeacher() ? 'معلمة ' + esc(S.user.dept.join(' و')) : 'منسقة ' + esc(S.user.dept.join(' و'))}${API.live() ? '' : ' · <span style="color:var(--tiffany)">معاينة</span>'}<br><button id="out">تسجيل الخروج</button></div>
    </aside>
    <main class="main">
      <div class="topbar"><button class="menu-btn" id="menu">☰</button><h1 id="ttl"></h1>${deptSel}
        ${isTeacher() ? '' : `<select id="perSel">${S.periods.map(p => `<option ${p.name === S.period ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`}</div>
      <div class="content" id="view"></div>
    </main>
  </div>`;
  $('#out').onclick = logout;
  $('#menu').onclick = () => $('#side').classList.toggle('open');
  if ($('#perSel')) $('#perSel').onchange = e => { S.period = e.target.value; refresh(); };
  if ($('#deptSel')) $('#deptSel').onchange = e => { S.dept = e.target.value; refresh(); };
  bindNav(); show();
}
function bindNav() { $$('#nav a.it').forEach(a => a.onclick = () => { S.view = a.dataset.v; S.edit = null; S.vpv = null; S.fopen = null; S.cvv = null; $('#side').classList.remove('open'); refresh(); }); }
function refresh() { $('#nav').innerHTML = navHTML(); bindNav(); show(); window.scrollTo(0, 0); }
function show() {
  const v = S.view, el = $('#view');
  const map = { home: isAdmin() ? A_home : C_home, report: C_report, stats: C_stats, a_compare: A_compare, a_boards: A_boards, a_reports: A_reports, a_visits: A_visits, a_accounts: A_accounts, a_vpvisit: A_vpvisit, a_cfiles: A_cfiles, a_afiles: A_afiles, a_tacts: A_tacts, t_ini: T_ini, t_act: T_act, c_visit: C_visit, t_pv: T_pv, t_ws: T_ws, t_pa: T_pa, t_ach: T_ach };
  if (isTeacher() && !['t_pv', 't_ws', 't_pa', 't_ach', 't_act'].includes(v)) return T_home(el);
  if (v.startsWith('sec:')) return C_section(SEC[v.slice(4)], el);
  (map[v] || map.home)(el);
}
const setTitle = t => { $('#ttl').textContent = t; };
const deptStaff = d => S.staff.filter(s => s.dept === d);
const repFor = (dept, per) => S.reports.find(r => r.dept === dept && r.period === per);

/* ------------------------------------------------------------------ المنسقة: الرئيسية */
function C_home(el) {
  setTitle('الرئيسية');
  const p = P(); const R = buildReport(ctxFor(S.dept, p)); const K = R.K;
  const rp = repFor(S.dept, p.name);
  const filled = SECTIONS.filter(s => s.k !== 'SN' && S.records.some(r => r.dept === S.dept && r.item === s.k && inP(r.date, p))).length;
  const nextPD = S.pd.filter(x => x.dept.split('|').includes(S.dept) && x.date >= today()).sort((a, b) => a.date < b.date ? -1 : 1)[0];
  el.innerHTML = `
  <div class="hero"><div class="pat pattern"></div><h2>أهلاً أ. ${esc(S.user.name)}</h2><p>قسم ${esc(S.dept)} · ${esc(p.name)} (من ${dmy(p.from)} إلى ${dmy(p.to)})</p></div>
  <div class="grid g4">
    ${kpi('الزيارات الصفية', K.visits, `شملت ${fmtPct(K.visitedPct)} من المعلمات`)}
    ${kpi('توثيق البنود', filled + ' / ' + SECTIONS.length, 'بنود فيها سجلات خلال الفترة', 'var(--tiffany-d)')}
    ${kpi('الالتزام بخطة التطوير', fmtPct(K.planPct), K.planPct == null ? 'لا توجد ورش مقررة في الفترة' : (K.att != null ? 'نسبة الحضور ' + fmtPct(K.att) : 'لم تُسجَّل ورش منفذة بعد'), 'var(--navy)')}
    ${kpi('حالة التقرير', rp ? rp.status : 'مسودة', rp && rp.feedback ? 'يوجد تغذية راجعة' : '', 'var(--gold)')}
  </div>
  ${rp && rp.feedback ? `<div class="card"><h2>تغذية راجعة من النائب الأكاديمي</h2><div style="white-space:pre-wrap">${esc(rp.feedback)}</div></div>` : ''}
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h2>تقدّم التوثيق في الفترة</h2>${SECTIONS.map(s => { const n = S.records.filter(r => r.dept === S.dept && r.item === s.k && inP(r.date, p)).length; return `<div class="row" style="margin:6px 0"><a style="width:170px;cursor:pointer" data-go="sec:${s.k}">${s.t}</a><div class="bar sp"><i style="width:${Math.min(100, n * 20)}%"></i></div><span class="chip ${n ? 'ok' : ''}">${n}</span></div>`; }).join('')}</div>
    <div>
      <div class="card"><h2>الورشة القادمة في خطة القسم</h2>${nextPD ? `<b>${esc(nextPD.title)}</b><div class="row" style="margin-top:6px"><span class="chip tf">${dmy(nextPD.date)}</span><span class="chip">${esc(nextPD.type || '')}</span><span class="chip">${esc(nextPD.by || '')}</span></div>` : '<div class="empty">لا توجد ورش قادمة</div>'}</div>
      <div class="card"><h2>توصيات مشتركة تحتاج إجراءً</h2>${R.T.common.length ? R.T.common.map(c => `<div style="margin:4px 0">• ${esc(c)}</div>`).join('') + `<button class="btn sm sec" data-go="sec:CP" style="margin-top:8px">تسجيل إجراء</button>` : '<div class="empty">لا توجد توصيات متكررة لدى معلمتين فأكثر</div>'}</div>
      <div class="card"><h2>أحداث الفترة</h2><div style="font-size:13px;color:var(--muted)">${esc(R.T.calendar) || '—'}</div></div>
    </div>
  </div>`;
  $$('[data-go]', el).forEach(a => a.onclick = () => { S.view = a.dataset.go; refresh(); });
}
function kpi(l, v, s, c) { return `<div class="kpi" style="${c ? '--c:' + c : ''}"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${s || ''}</div></div>`; }
function ctxFor(dept, per) { return { dept, P: per, recs: S.records, staff: S.staff, pd: S.pd, cal: S.cal, coordName: (S.coords.find(c => c.dept.includes(dept)) || {}).name }; }

/* ------------------------------------------------------------------ المنسقة: بند إدخال */
function optsFor(f, r) {
  const dept = S.dept, mem = deptStaff(dept);
  const coord = mem.filter(s => s.role === 'منسقة').map(s => s.name), tch = mem.filter(s => s.role !== 'منسقة').map(s => s.name);
  switch (f.ty) {
    case 'sel': case 'combo': return getList(f.l);
    case 'teacher': return tch;
    case 'teacherC': return [...coord, ...tch];
    case 'member': return [ALL(), ...coord, ...tch];
    case 'allT': return S.staff.map(s => s.name);
    case 'crit': return REF.CRIT.map(c => c.label);
    case 'rec': { const R = buildReport(ctxFor(dept, P())); return [...R.T.common, ...REF.REC.filter(x => !R.T.common.includes(x))]; }
    case 'subj': return REF.SUBJ_MAP[dept] || [dept];
    case 'actype': return REF.AC_TYPES.map(t => t.t);
    case 'dep': return f.src(r);
    case 'pd': return [...S.pd.filter(x => x.dept.split('|').includes(dept) || x.dept === REF.GEN).map(x => x.title), REF.OUT_OF_PLAN];
  }
  return [];
}
function fieldHTML(f, r) {
  const v = r[f.n] == null ? '' : r[f.n];
  const lab = `<label>${esc(f.h)}${f.req ? ' <i>*</i>' : ''}</label>`;
  const hidden = f.show && !f.show(r) ? ' hide' : '';
  const wide = ['area'].includes(f.ty) || ['crit', 'rec'].includes(f.ty) || f.n === 'b' ? ' wide' : '';
  let inp;
  if (f.ty === 'date') inp = `<input type="date" data-n="${f.n}" value="${esc(v)}">`;
  else if (f.ty === 'int') inp = `<input type="number" min="0" step="1" data-n="${f.n}" value="${esc(v)}">`;
  else if (f.ty === 'pct') inp = `<input type="number" min="0" max="100" step="1" data-n="${f.n}" value="${esc(v)}">`;
  else if (f.ty === 'text') inp = `<input type="text" data-n="${f.n}" value="${esc(v)}">`;
  else if (f.ty === 'area') inp = `<textarea data-n="${f.n}">${esc(v)}</textarea>`;
  else {
    const o = optsFor(f, r);
    const free = ['combo', 'allT', 'dep', 'subj', 'member'].includes(f.ty) || f.free;
    if (free) inp = `<input list="dl_${f.n}" data-n="${f.n}" value="${esc(v)}" placeholder="اختاري أو اكتبي"><datalist id="dl_${f.n}">${o.map(x => `<option value="${esc(x)}">`).join('')}</datalist>`;
    else inp = `<select data-n="${f.n}"><option value=""></option>${o.map(x => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('')}${v && !o.includes(v) ? `<option selected>${esc(v)}</option>` : ''}</select>`;
  }
  return `<div class="fld${wide}${hidden}" data-f="${f.n}">${lab}${inp}</div>`;
}
function readForm(form) { const r = {}; $$('[data-n]', form).forEach(i => { r[i.dataset.n] = i.type === 'number' ? (i.value === '' ? '' : +i.value) : i.value.trim(); }); return r; }

function C_section(sec, el) {
  setTitle(sec.title);
  const p = P(); const list = S.records.filter(r => r.dept === S.dept && r.item === sec.k).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const inPer = list.filter(r => inP(r.date, p)), other = list.filter(r => !inP(r.date, p));
  const editing = S.edit ? list.find(r => r.id === S.edit) : null;
  const base = editing ? { ...editing.d, date: editing.d.date || editing.date } : { date: today() };
  if (sec.k === 'WS' && !editing && S.prefill) Object.assign(base, S.prefill);
  const rp = repFor(S.dept, p.name), locked = rp && ['موقّع من المنسقة', 'معتمد'].includes(rp.status);
  el.innerHTML = `
    <div class="note">${esc(sec.note)}</div>
    ${locked ? '<div class="note warn">تقرير هذه الفترة موقّع ومقفل؛ لا يمكن إضافة أو تعديل سجلات بتاريخ داخل الفترة إلا إذا أعادته النائب للتعديل.</div>' : ''}
    ${sec.k === 'WS' ? wsPlanHTML() : ''}
    <div class="card" id="fc"><h2>${editing ? 'تعديل سجل' : 'إضافة سجل جديد'} <span class="sub">الحقول المعلَّمة بـ * مطلوبة</span></h2>
      <form class="form" id="frm" autocomplete="off">${sec.f.map(f => fieldHTML(f, base)).join('')}
        <div class="preview"><b>هكذا ستظهر في التقرير</b><span id="pv"></span></div>
        <div class="actions"><button class="btn" type="submit">${editing ? 'حفظ التعديل' : 'حفظ'}</button>${editing ? '<button class="btn sec" type="button" id="cancel">إلغاء</button>' : ''}${sec.k === 'PA' ? '<button class="btn sec" type="button" id="imp">استيراد Excel (Forms)</button>' : ''}</div>
      </form>
    </div>
    <div class="card"><h2>سجلات ${esc(p.name)} <span class="chip">${inPer.length}</span></h2><div class="list">${inPer.map(recHTML).join('') || '<div class="empty">لا توجد سجلات في هذه الفترة بعد</div>'}</div></div>
    ${other.length ? `<details class="card"><summary style="cursor:pointer;font-family:var(--f-head)">سجلات فترات أخرى (${other.length})</summary><div class="list" style="margin-top:10px">${other.map(recHTML).join('')}</div></details>` : ''}`;
  const frm = $('#frm');
  const upd = (changed) => {
    const r = readForm(frm);
    if (sec.k === 'WS' && changed === 'b') {
      const pdi = S.pd.find(x => x.title === r.b);
      if (pdi) { setVal(frm, 'type', pdi.type); setVal(frm, 'pres', pdi.by); setVal(frm, 'planned', pdi.date); }
      setVal(frm, 'j', deptStaff(S.dept).filter(s => s.role !== 'منسقة').length);
    }
    sec.f.forEach(f => {
      const box = $(`[data-f="${f.n}"]`, frm); if (f.show) box.classList.toggle('hide', !f.show(r));
      if (f.ty === 'dep' && changed === f.on) { const dl = $(`#dl_${f.n}`, frm); dl.innerHTML = f.src(r).map(x => `<option value="${esc(x)}">`).join(''); }
    });
    const ok = sec.f.filter(f => f.req).every(f => r[f.n] !== '' && r[f.n] != null);
    $('#pv').textContent = ok ? sec.tx(r) : '…أكملي الحقول المطلوبة لتظهر الجملة';
  };
  frm.addEventListener('input', e => upd(e.target.dataset.n)); frm.addEventListener('change', e => upd(e.target.dataset.n)); upd(S.prefill ? 'b' : '');
  S.prefill = null;
  frm.onsubmit = async e => {
    e.preventDefault(); const r = readForm(frm);
    sec.f.forEach(f => { const box = $(`[data-f="${f.n}"]`, frm); if (box.classList.contains('hide')) r[f.n] = ''; });
    const miss = sec.f.filter(f => f.req && (r[f.n] === '' || r[f.n] == null) && !(f.show && !f.show(r)));
    if (miss.length) return toast('أكملي: ' + miss.map(f => f.h).join('، '), 1);
    const date = sec.when ? sec.when(r) : r.date;
    if (!date) return toast('حددي التاريخ', 1);
    const j = await call('save', { rec: { id: editing ? editing.id : undefined, dept: S.dept, item: sec.k, date, sum: sec.tx(r).slice(0, 400), d: r } });
    const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record);
    S.edit = null; toast('تم الحفظ'); refresh();
  };
  if ($('#cancel')) $('#cancel').onclick = () => { S.edit = null; refresh(); };
  if ($('#imp')) $('#imp').onclick = () => importForms('PA');
  $$('[data-ed]', el).forEach(b => b.onclick = () => { S.edit = b.dataset.ed; refresh(); setTimeout(() => $('#fc').scrollIntoView({ behavior: 'smooth' }), 50); });
  $$('[data-del]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذا السجل؟')) return; await call('delete', { id: b.dataset.del }); S.records = S.records.filter(x => x.id !== b.dataset.del); toast('تم الحذف'); refresh(); });
  $$('[data-pd]', el).forEach(b => b.onclick = () => { S.prefill = { b: b.dataset.pd }; S.edit = null; refresh(); setTimeout(() => $('#fc').scrollIntoView({ behavior: 'smooth' }), 50); });
}
function setVal(frm, n, v) { const i = $(`[data-n="${n}"]`, frm); if (i && (i.value === '' || n !== 'j')) i.value = v == null ? '' : v; }
function recHTML(r) {
  const sec = SEC[r.item]; const tx = sec ? sec.tx(r.d) : r.sum;
  return `<div class="rec"><div class="dt">${dm(r.date)}<small>${r.date ? r.date.slice(0, 4) : ''}</small></div><div class="tx">${esc(tx)}<div class="by">أدخلته: ${esc(r.by || '')}${r.up && r.up !== r.at ? ' · عُدّل ' + esc(r.up) : ''}</div></div>
    <div class="ops"><button class="btn sm sec" data-ed="${r.id}">تعديل</button>${isAdmin() || r.item !== 'AC' ? `<button class="btn sm ghost" data-del="${r.id}">حذف</button>` : ''}</div></div>`;
}
function wsPlanHTML() {
  const mine = S.pd.filter(x => x.dept.split('|').includes(S.dept)).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'));
  const ws = S.records.filter(r => r.dept === S.dept && r.item === 'WS');
  const t = today();
  return `<div class="card"><h2>ورش خطة التطوير المهني لقسمك <span class="sub">${mine.length} ورشة</span></h2><div class="tbl"><table class="t"><tr><th>الورشة</th><th>النوع</th><th>المقدِّمة</th><th>الموعد</th><th>الحالة</th><th></th></tr>
    ${mine.map(x => { const w = ws.find(r => r.d.b === x.title); const st = w ? w.d.g : (x.date && x.date < t ? '⚠ لم تُسجَّل الحالة' : 'قادمة');
      const cls = w ? ((w.d.g || '').startsWith('تمت') ? 'ok' : 'warn') : (x.date && x.date < t ? 'bad' : '');
      return `<tr><td>${esc(x.title)}</td><td>${esc(x.type || '')}</td><td>${esc(x.by || '')}</td><td>${x.date ? dmy(x.date) : '—'}</td><td><span class="chip ${cls}">${esc(st)}</span></td><td>${w ? `<button class="btn sm sec" data-ed="${w.id}">تعديل</button>` : `<button class="btn sm" data-pd="${esc(x.title)}">تسجيل التنفيذ</button>`}</td></tr>`; }).join('')}</table></div></div>`;
}

/* ------------------------------------------------------------------ استيراد Forms (Excel) */
async function importForms(kind) {
  if (!window.XLSX) { await new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv';
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    const wb = XLSX.read(await f.arrayBuffer(), { cellDates: true });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    if (!rows.length) return toast('الملف فارغ', 1);
    const cols = Object.keys(rows[0]);
    const pick = (...keys) => cols.find(c => keys.some(k => c.includes(k)));
    const cName = pick('اسم الطالبة', 'الطالبة', 'الاسم'), cWhy = pick('المشكلة', 'سبب', 'الموضوع'), cAct = pick('الحل', 'الإجراء', 'كيف'), cDate = pick('وقت الانتهاء', 'التاريخ', 'Completion', 'وقت البدء'), cSec = pick('الصف', 'الشعبة'), cBy = pick('المعلمة', 'اسم المعلمة');
    const list = rows.map(x => {
      let dt = x[cDate]; dt = dt instanceof Date ? dt.toISOString().slice(0, 10) : String(dt || '').slice(0, 10).replace(/\//g, '-');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) dt = today();
      const d = { date: dt, c: REF.BARCODE, stu: String(x[cName] || '').trim(), why: String(x[cWhy] || '').trim(), act: String(x[cAct] || '').trim(), s: String(x[cSec] || '').trim(), by: String(x[cBy] || '').trim() };
      return { dept: S.dept, item: 'PA', date: dt, d, sum: SEC.PA.tx(d).slice(0, 400), key: [d.stu, d.why, dt].join('|') };
    }).filter(r => r.d.stu);
    if (!confirm(`سيتم استيراد ${list.length} سجلاً للتواصل الفردي. السجلات المكررة تُتجاهل تلقائياً. متابعة؟`)) return;
    const j = await call('saveMany', { list });
    S.records.push(...j.saved);
    toast(`تم استيراد ${j.saved.length}` + (j.skipped.length ? ` · تجاهل ${j.skipped.length} مكرر` : '')); refresh();
  };
  inp.click();
}

/* ------------------------------------------------------------------ التقرير الرسمي */
async function C_report(el, deptArg) {
  const dept = deptArg || S.dept, p = P();
  setTitle('تقرير أعمال القسم');
  const rp = repFor(dept, p.name);
  const frozen = rp && rp.snap && ['موقّع من المنسقة', 'معتمد'].includes(rp.status);
  const R = frozen ? rp.snap : buildReport(ctxFor(dept, p));
  let sig = '';
  if (rp && rp.status === 'معتمد') { try { sig = (await API.call('signature', { dept, period: p.name })).data; } catch (e) {} }
  let csig = '';
  if (rp && rp.coordSig) { const cid = isAdmin() ? (S.coords.find(c => c.dept.includes(dept)) || {}).id : S.user.id; if (cid) { try { csig = (await API.call('signature', { who: cid })).data; } catch (e) {} } }
  const canSign = !isAdmin() && (!rp || !['موقّع من المنسقة', 'معتمد'].includes(rp.status));
  el.innerHTML = `
    <div class="row noprint" style="margin-bottom:14px">
      <span class="chip ${rp && rp.status === 'معتمد' ? 'ok' : rp && rp.status === 'موقّع من المنسقة' ? 'tf' : rp && rp.status === 'معاد للتعديل' ? 'bad' : ''}">${esc(rp ? rp.status : 'مسودة — يتحدّث تلقائياً من السجلات')}</span>
      <span class="sp"></span>
      ${canSign ? '<button class="btn" id="sign">توقيع التقرير برقمي السري</button>' : ''}
      ${isAdmin() ? adminRepButtons(rp) : ''}
      <button class="btn sec" onclick="window.print()">طباعة / حفظ PDF</button>
    </div>
    ${paperHTML(R, rp, sig, csig)}`;
  if ($('#sign')) $('#sign').onclick = () => pinModal('توقيع التقرير', 'بالتوقيع تُقفل سجلات هذه الفترة ويُرسل التقرير للنائب الأكاديمي للاعتماد. أدخلي رقمك السري:', async pin => {
    const snap = buildReport(ctxFor(dept, p)); delete snap.T.perTeacher;
    const j = await call('sign', { dept, period: p.name, from: p.from, to: p.to, pin, snap: { rows: snap.rows, coord: snap.coord, NT: snap.NT, T: { calendar: snap.T.calendar }, K: snap.K, P: snap.P, dept } });
    upsertRep(j.report); toast('تم التوقيع ✓'); refresh();
  });
  if (isAdmin()) bindAdminRep(rp, dept, p);
}
function upsertRep(r) { const i = S.reports.findIndex(x => x.dept === r.dept && x.period === r.period); if (i >= 0) S.reports[i] = r; else S.reports.push(r); }
function paperHTML(R, rp, sig, csig) {
  const P_ = R.P;
  const body = R.rows.map(([main, subs]) => {
    const total = subs.reduce((a, s) => a + s[1].length, 0);
    let h = ''; let first = true;
    subs.forEach(([sub, texts, small]) => {
      texts.forEach((t, i) => {
        h += '<tr>';
        if (first) { h += `<td class="m" rowspan="${total}"${sub === null ? ' colspan="2"' : ''}>${esc(main)}</td>`; first = false; }
        if (i === 0 && sub !== null) h += `<td class="s${small ? ' small' : ''}" rowspan="${texts.length}">${esc(sub)}</td>`;
        h += `<td class="x">${esc(t)}</td></tr>`;
      });
    });
    return h;
  }).join('');
  const coordSig = rp && rp.coordSig ? `${csig ? `<img src="${csig}" alt="">` : ''}<div class="stamp">وُقّع إلكترونياً برقمها السري · ${esc(rp.coordAt || '')}</div>` : '<div style="margin-top:10mm">التوقيع: ......................</div>';
  const vpSig = rp && rp.status === 'معتمد' ? `${sig ? `<img src="${sig}" alt="">` : ''}<div class="stamp">اعتُمد إلكترونياً · ${esc(rp.vpAt || '')}</div>` : '<div style="margin-top:10mm">التوقيع: ......................</div>';
  return `<div class="paper">
    <img class="lh-top" src="assets/lh-top.jpg" alt="">
    <div class="in">
      <h1>تقرير أعمال القسم</h1>
      <div class="per">التقرير الدوري — ${esc(P_.name)} — من ${dmy(P_.from)} إلى ${dmy(P_.to)}</div>
      <table class="rep meta"><tr><td class="k">القسم</td><td style="width:22%;text-align:center;font-weight:700">${esc(R.dept)}</td><td style="font-weight:700">المنسقة: أ. ${esc(R.coord)}</td></tr>
        <tr><td class="k">عدد معلمات القسم</td><td style="text-align:center;font-weight:700">${R.NT}</td><td style="font-weight:700">تاريخ إعداد التقرير: ${dmy(today())}</td></tr>
        <tr><td class="k" style="font-size:10px">أبرز أحداث الفترة</td><td colspan="2" style="font-size:10.5px">${esc(R.T.calendar || '—')}</td></tr></table>
      <table class="rep" style="margin-top:3mm"><tr><th>المجالات الرئيسة</th><th>المجال الفرعي</th><th>أهم ما تم إنجازه</th></tr>${body}</table>
      <div class="fb"><div class="h">التغذية الراجعة من نائب المدير للشؤون الأكاديمية:</div><div class="b">${esc(rp && rp.feedback || '')}</div></div>
      <div class="sigs"><div class="s"><b>اسم المنسق: أ. ${esc(R.coord)}</b>${coordSig}</div><div class="s"><b>اسم نائب المدير للشؤون الأكاديمية: أ. آسيا الذبياني</b>${vpSig}</div></div>
    </div>
    <img class="lh-bot" src="assets/lh-bot.jpg" alt="">
  </div>`;
}
function pinModal(title, msg, fn, extra) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box"><h3>${esc(title)}</h3><p style="font-size:14px;color:var(--muted)">${esc(msg)}</p>${extra || ''}<input class="pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"><div class="row" style="margin-top:14px"><button class="btn" id="mok">تأكيد</button><button class="btn sec" id="mno">إلغاء</button></div></div>`;
  document.body.appendChild(m); const i = $('input.pin', m); i.focus();
  const close = () => m.remove();
  $('#mno', m).onclick = close;
  const ok = async () => { try { await fn(i.value, m); close(); } catch (e) { i.value = ''; i.focus(); } };
  $('#mok', m).onclick = ok; i.onkeydown = e => { if (e.key === 'Enter') ok(); };
}

/* ------------------------------------------------------------------ المنسقة: مؤشراتي */
function C_stats(el) {
  setTitle('مؤشراتي ومقارناتي');
  const pers = S.periods.filter(p => p.from <= today());
  const Rs = pers.map(p => buildReport(ctxFor(S.dept, p)));
  const fu = (p, k) => S.records.filter(r => r.dept === S.dept && r.item === 'V' && inP(r.date, p) && (r.d.ty || '').includes('متابعة') && r.d.st === k).length;
  const ovs = (p, k) => S.records.filter(r => r.dept === S.dept && r.item === 'OV' && inP(r.date, p) && r.d.fus === k).length;
  const docs = p => SECTIONS.filter(s => s.k !== 'SN' && S.records.some(r => r.dept === S.dept && r.item === s.k && inP(r.date, p))).length;
  const rowsK = [
    ['السجلات الموثّقة', R => R.K.records], ['البنود الموثّقة (من 15)', (R, i) => docs(pers[i])],
    ['الزيارات الصفية', R => R.K.visits], ['نسبة المعلمات المُزارات', R => fmtPct(R.K.visitedPct)], ['الالتزام بخطة التطوير', R => fmtPct(R.K.planPct)],
    ['نسبة حضور الورش', R => fmtPct(R.K.att)], ['المشاركة في التطوير الخارجي', R => fmtPct(R.K.extPct)], ['الاجتماعات', R => R.K.meetings],
    ['الأنشطة والمبادرات', R => R.K.activities], ['الزيارات التبادلية (لبّت الاحتياج)', R => `${R.K.peer} (${R.K.peerMet})`], ['الشراكة مع أولياء الأمور', R => R.K.parents],
    ['الإنجازات / المشاركات', R => `${R.K.achievements} / ${R.K.participations}`], ['أدوات التعليم الإلكتروني', R => R.K.elearn],
  ];
  const last = Rs[Rs.length - 1];
  el.innerHTML = `
  <div class="card"><h2>مقارنة الفترات (تراكمي)</h2><div class="tbl"><table class="t"><tr><th>المؤشر</th>${pers.map(p => `<th>${esc(p.name)}</th>`).join('')}</tr>
    ${rowsK.map(([l, f]) => `<tr><td>${l}</td>${Rs.map((R, i) => `<td>${f(R, i)}</td>`).join('')}</tr>`).join('')}</table></div></div>
  <div class="grid g2">
    <div class="card"><h2>تنفيذ توصياتي في زيارات المتابعة</h2><table class="t"><tr><th>الفترة</th><th>نُفّذت</th><th>جزئياً</th><th>لم تُنفذ</th></tr>${pers.map(p => `<tr><td>${p.name}</td><td>${fu(p, 'تم تنفيذ التوصيات')}</td><td>${fu(p, 'تم التنفيذ جزئياً')}</td><td>${fu(p, 'لم تُنفذ بعد')}</td></tr>`).join('')}</table></div>
    <div class="card"><h2>تنفيذ توصيات القيادة والتوجيه</h2><table class="t"><tr><th>الفترة</th><th>نُفّذت</th><th>جزئياً</th><th>لم تُنفذ</th></tr>${pers.map(p => `<tr><td>${p.name}</td><td>${ovs(p, 'تم تنفيذ التوصيات')}</td><td>${ovs(p, 'تم التنفيذ جزئياً')}</td><td>${ovs(p, 'لم تُنفذ بعد')}</td></tr>`).join('')}</table></div>
  </div>
  ${last ? `<div class="grid g2">
    <div class="card"><h2>أبرز نقاط القوة (${esc(last.P.name)})</h2>${last.T.topStr.map(x => `<div class="row" style="margin:5px 0"><span class="sp">${esc(x.core)}</span><span class="chip ok">${x.n}</span></div>`).join('') || '<div class="empty">—</div>'}</div>
    <div class="card"><h2>أكثر التوصيات تكراراً (${esc(last.P.name)})</h2>${last.T.topRecs.map(x => `<div class="row" style="margin:5px 0"><span class="sp">${esc(x.rc)}</span><span class="chip warn">${x.n} · ${x.k} معلمات</span></div>`).join('') || '<div class="empty">—</div>'}</div>
  </div>
  <div class="card"><h2>زياراتي لمعلمات القسم حسب الفترة</h2><div class="tbl"><table class="t"><tr><th>المعلمة</th>${pers.map(p => `<th>${esc(p.name)}</th>`).join('')}</tr>
    ${last.teachers.map(t => `<tr><td>${esc(t)}</td>${Rs.map(R => { const x = R.T.perTeacher.find(z => z.t === t); return `<td>${x && x.c ? x.c : '<span style="color:var(--bad)">0</span>'}</td>`; }).join('')}</tr>`).join('')}</table></div></div>` : ''}`;
}

window.addEventListener('DOMContentLoaded', start);
