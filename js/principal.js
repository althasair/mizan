/* =====================================================================
   مديرة المدرسة: حضورها الصفي وخطته السنوية · واللوحة الشاملة للمنصة
   ===================================================================== */
function isPrincipal() { return !!(S.user && S.user.role === 'admin' && S.user.id !== 'admin'); }
const yearRange = () => { const a = semRange(SEMS[0]), b = semRange(SEMS[1]); return { from: a.from, to: b.to }; };
const tPool = () => S.staff.filter(s => s.role !== 'منسقة' && +s.load > 0);
const CUPC = [['#F4D27A', '#C9971F', 'الأول'], ['#E3E6EA', '#9AA3AD', 'الثاني'], ['#E9B88A', '#A8682E', 'الثالث']];
function cupSVG(i, sz) {
  const [a, b] = CUPC[i] || CUPC[2]; const id = 'cg' + i + Math.random().toString(36).slice(2, 6);
  return `<svg width="${sz || 34}" height="${sz || 34}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${b}"/><stop offset=".5" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <path d="M18 8h28v10c0 10-6 18-14 18S18 28 18 18z" fill="url(#${id})"/><path d="M18 12H9c0 9 5 14 11 15M46 12h9c0 9-5 14-11 15" fill="none" stroke="${b}" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="28" y="35" width="8" height="9" fill="${b}"/><rect x="20" y="44" width="24" height="6" rx="2" fill="url(#${id})"/><rect x="16" y="50" width="32" height="6" rx="2" fill="${b}"/>
    <text x="32" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Arial">${i + 1}</text></svg>`;
}
const STAR = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#E0B23C" stroke="#B8862A" stroke-width="1"/></svg>';
function ring(p, c, lbl, sub) {
  const r = 34, C = 2 * Math.PI * r, v = Math.max(0, Math.min(100, p));
  return `<div style="display:flex;align-items:center;gap:12px"><svg width="86" height="86" viewBox="0 0 86 86"><circle cx="43" cy="43" r="${r}" fill="none" stroke="#EEE7DA" stroke-width="9"/><circle cx="43" cy="43" r="${r}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C * v / 100} ${C}" transform="rotate(-90 43 43)"/><text x="43" y="48" text-anchor="middle" font-size="17" font-weight="800" fill="${c}" font-family="Arial">${Math.round(v)}%</text></svg><div><b style="font-size:14px">${lbl}</b><div style="font-size:12px;color:var(--muted)">${sub}</div></div></div>`;
}

/* ------------------------------------------------------------------ حضور مديرة المدرسة */
function prCoverage() {
  const pool = tPool(), Y = yearRange(), s1 = semRange(SEMS[0]);
  const L = S.records.filter(r => r.item === 'PRV' && r.date >= Y.from && r.date <= Y.to).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const names = new Set(pool.map(p => p.name));
  const seen = new Set(L.map(r => r.d.t).filter(n => names.has(n)));
  const seenS1 = new Set(L.filter(r => r.date <= s1.to).map(r => r.d.t).filter(n => names.has(n)));
  const target = pool.length, half = Math.ceil(target / 2);
  return { pool, L, seen, seenS1, target, half, pct: target ? seen.size / target * 100 : 0, s1 };
}
async function P_visit(el) {
  await loadForms(); setTitle('حضور مديرة المدرسة');
  if (S.vpv && isPrincipal()) { S.vkind = 'PRV'; return vpVisitForm(el, S.vpv === 'new' ? null : S.records.find(r => r.id === S.vpv)); }
  const RO = !isPrincipal(); const C = prCoverage(); const inS1 = today() <= C.s1.to;
  const done = C.seen.size >= C.target && C.target > 0, s1done = C.seenS1.size >= C.half;
  const banner = done ? `<div class="card" style="background:linear-gradient(90deg,#FFF7E0,#fff);border-color:#E9C46A;display:flex;align-items:center;gap:10px">${STAR}${STAR}${STAR}<b style="font-size:16px;color:#7A5A12">تمت تغطية جميع المعلمات خلال العام الأكاديمي — شكرًا لكِ</b></div>`
    : s1done && inS1 ? `<div class="card" style="background:linear-gradient(90deg,#FFF7E0,#fff);border-color:#E9C46A;display:flex;align-items:center;gap:10px">${STAR}<b style="font-size:15px;color:#7A5A12">تمت تغطية نصف المدرسة المستهدف في الفصل الأول — شكرًا لكِ</b><span style="font-size:12.5px;color:var(--muted)">ويمكن الزيادة على العدد بحسب ما ترينه.</span></div>` : '';
  const lv = r => { const v = Object.values(r.d.rt || {}).filter(x => x < 5); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  el.innerHTML = `${RO ? '<div class="note">حضور مديرة المدرسة — للاطلاع فقط.</div>' : ''}${banner}
  <div class="grid g4">
    ${kpi('تمت تغطيتهن', C.seen.size, 'من ' + C.target + ' معلمة · ' + Math.round(C.pct) + '%', 'var(--ok)')}
    ${kpi('المتبقي', C.target - C.seen.size, Math.round(100 - C.pct) + '% من المعلمات', 'var(--maroon)')}
    ${kpi('هدف الفصل الأول', C.seenS1.size + ' / ' + C.half, s1done ? 'تحقق الهدف ⭐' : 'نصف المدرسة', 'var(--tiffany-d)')}
    ${kpi('عدد الزيارات', C.L.length, 'خلال العام (تشمل الزيادة)', 'var(--navy)')}
  </div>
  <div class="card" style="margin-top:14px"><div class="row"><b>التغطية السنوية</b><div class="bar sp"><i style="width:${C.pct}%"></i></div><b>${Math.round(C.pct)}%</b>${done ? STAR : ''}</div>
    <div style="font-size:12.5px;color:var(--muted);margin-top:6px">حضور واحد لكل معلمة خلال العام: نصف المدرسة في الفصل الأول، والنصف الآخر في الفصل الثاني.</div></div>
  <div class="card"><div class="row"><h2 style="margin:0">زيارات مديرة المدرسة</h2><span class="sp"></span>${RO ? '' : '<button class="btn sec" id="pplan">خطة الحضور</button><button class="btn" id="pnew">+ حضور جديد</button>'}</div>
  <div class="tbl" style="margin-top:10px"><table class="t"><tr><th>التاريخ</th><th>المعلمة</th><th>القسم</th><th>الصف</th><th>الموضوع</th><th>المستوى العام</th><th>الإرسال</th><th></th></tr>
  ${C.L.map(r => { const a = lv(r); const ok = a == null ? '' : a < 1.25 ? 'ok' : a < 2.2 ? 'tf' : a < 3.2 ? 'warn' : 'bad';
    return `<tr><td>${dmy(r.date)}</td><td><b>${esc(r.d.t)}</b></td><td>${esc(r.dept)}</td><td>${esc(r.d.s || '')}</td><td>${esc(r.d.topic || '')}</td><td>${a == null ? `<span class="chip">${r.d.imp ? 'استمارة ورقية' : 'بلا تقديرات'}</span>` : `<span class="chip ${ok}">${esc(FORMS.visit.scale[Math.round(a)])}</span>`}</td><td>${r.d.sent ? `<span class="chip ok">${dm(r.d.sent)}</span>` : '<span class="chip">—</span>'}</td><td><button class="btn sm sec" data-o="${r.id}">فتح</button></td></tr>`; }).join('') || '<tr><td colspan="8"><div class="empty">لا توجد زيارات بعد</div></td></tr>'}</table></div></div>
  <div class="card"><h2>معلمات لم تتم زيارتهن هذا العام (${C.target - C.seen.size})</h2><div style="display:flex;flex-wrap:wrap;gap:6px">${C.pool.filter(p => !C.seen.has(p.name)).map(p => `<button class="chip" ${RO ? 'disabled' : ''} data-nt="${esc(p.name)}" style="cursor:${RO ? 'default' : 'pointer'}">${esc(p.name)} · ${esc(p.dept)}</button>`).join('') || '<div class="empty">تمت تغطية الجميع ⭐</div>'}</div></div>`;
  $$('[data-o]', el).forEach(b => b.onclick = async () => { const r = S.records.find(x => x.id === b.dataset.o); if (!RO) { S.vpv = r.id; return show(); } await showPaper(el, 'استمارة الإشراف — ' + r.d.t, visitInner(r)); $('#pBack').onclick = () => show(); });
  if (RO) return;
  $('#pnew').onclick = () => { S.vpv = 'new'; S.vpvT = ''; show(); };
  $('#pplan').onclick = () => { S.view = 'p_plan'; refresh(); };
  $$('[data-nt]', el).forEach(b => b.onclick = () => { S.vpv = 'new'; S.vpvT = b.dataset.nt; show(); });
}

/* ------------------------------------------------------------------ خطة حضور مديرة المدرسة (سنوية) */
function P_plan(el) {
  setTitle('خطة حضور مديرة المدرسة — العام الأكاديمي');
  const C = prCoverage(); const Y = yearRange(); const V = vpPlanData({ item: 'PRV', from: Y.from, to: Y.to });
  const inS1 = today() <= C.s1.to; const need1 = inS1 ? Math.max(0, C.half - C.seenS1.size) : 0;
  const L1 = V.remain.slice(0, need1), L2 = V.remain.slice(need1);
  const RO = !isPrincipal();
  const row = t => `<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.dept)}</td><td style="font-size:12px">${esc(t.secs)}</td><td>${t.mean == null ? '—' : `<span class="chip ${t.mean < 75 ? 'bad' : t.mean < 80 ? 'warn' : t.mean < 90 ? 'tf' : 'ok'}">${t.mean.toFixed(1)}%</span>`}</td><td style="font-size:11.5px;color:var(--muted)">${esc(t.why || '')}</td>${RO ? '' : `<td><button class="btn sm" data-go="${esc(t.name)}">تسجيل الحضور</button></td>`}</tr>`;
  const table = (L, e) => L.length ? `<div class="tbl"><table class="t"><tr><th>المعلمة</th><th>القسم</th><th>الشعب</th><th>متوسط التحصيل</th><th>المصدر</th>${RO ? '' : '<th></th>'}</tr>${L.map(row).join('')}</table></div>` : `<div class="empty">${e}</div>`;
  el.innerHTML = `<div class="grid g4">
    ${kpi('تمت تغطيتهن', C.seen.size, Math.round(C.pct) + '% من ' + C.target, 'var(--ok)')}
    ${kpi('المتبقي في الفصل الأول', need1, inS1 ? 'لبلوغ نصف المدرسة (' + C.half + ')' : 'انتهى الفصل الأول', 'var(--maroon)')}
    ${kpi('للفصل الثاني', L2.length, 'معلمة', 'var(--navy)')}
    ${kpi('هدف العام', C.target, 'حضور واحد لكل معلمة', 'var(--tiffany-d)')}</div>
  <div class="note" style="margin-top:12px">الأولوية حسب متوسط تحصيل طالبات المعلمة في جميع شعبها (الأقل أولًا)، بالطريقة نفسها في خطة النائب الأكاديمي. ويمكن الزيادة على العدد بحسب ما ترينه.</div>
  <div class="card"><h2>الفصل الأول ${inS1 ? '' : '<span class="sub">انتهى</span>'} ${!need1 && inS1 ? STAR + ' <span class="sub">تحقق هدف الفصل الأول</span>' : ''}</h2>${table(L1, inS1 ? 'تحقق هدف الفصل الأول — شكرًا لكِ' : 'انتهى الفصل الأول')}</div>
  <div class="card"><h2>الفصل الثاني</h2>${table(L2, 'تمت تغطية جميع المعلمات ⭐')}</div>`;
  $$('[data-go]', el).forEach(b => b.onclick = () => { S.view = 'p_visit'; S.vpv = 'new'; S.vpvT = b.dataset.go; refresh(); });
}

/* ------------------------------------------------------------------ اللوحة الشاملة */
function A_dash(el) {
  setTitle('اللوحة الشاملة');
  const Y = yearRange(); const R = S.records.filter(r => !r.date || (r.date >= Y.from && r.date <= Y.to));
  const by = it => R.filter(r => r.item === it);
  const add = (m, k, n) => { if (!k || k === REF.ALL_MEMBERS) return; m[k] = (m[k] || 0) + (n == null ? 1 : n); };
  const isIni = r => r.item === 'TA' ? r.d.kind === 'مبادرة' : (/مبادر/.test(r.d.ty || '') || /مبادر/.test(r.d.name || ''));
  const ini = {}, act = {}, pv = {}, ws = {}, pa = {}, ach = {};
  R.filter(r => r.item === 'TA').forEach(r => add(isIni(r) ? ini : act, r.d.t));
  R.filter(r => r.item === 'AC').forEach(r => [r.d.e1, r.d.e2, r.d.e3].forEach(t => add(isIni(r) ? ini : act, t)));
  by('TPV').forEach(r => add(pv, r.d.t)); by('TWS').filter(r => /قدّمت/.test(r.d.role || '')).forEach(r => add(ws, r.d.t));
  by('TPA').forEach(r => add(pa, r.d.t, +r.d.n > 0 ? +r.d.n : 1)); by('TACH').forEach(r => add(ach, r.d.t));
  const coordOf = d => { const c = S.coords.find(c => (c.dept || []).includes(d)); return c ? c.name : ''; };
  const cm = k => { const m = {}; R.filter(r => r.item === k).forEach(r => add(m, coordOf(r.dept))); return m; };
  const cAll = {}; R.filter(r => SECTIONS.some(s => s.k === r.item)).forEach(r => add(cAll, coordOf(r.dept)));
  const cRep = {}; S.reports.filter(x => x.status === 'معتمد').forEach(x => add(cRep, coordOf(x.dept)));
  const deptOf = n => (S.staff.find(s => s.name === n) || {}).dept || '';
  const nIni = Object.values(ini).reduce((a, b) => a + b, 0), nAct = Object.values(act).reduce((a, b) => a + b, 0);
  const vpPool = tPool(); const semR = semRange(curSem()); const vpSeen = new Set(R.filter(r => r.item === 'VPV' && r.date >= semR.from && r.date <= semR.to).map(r => r.d.t).filter(n => vpPool.some(p => p.name === n)));
  const vpPct = vpPool.length ? vpSeen.size / vpPool.length * 100 : 0; const PC = prCoverage();
  const repAll = S.reports.length, repOk = S.reports.filter(x => x.status === 'معتمد').length;
  const tile = (n, l, c, ic) => `<div class="kpi" style="--c:${c}"><div class="l">${l}</div><div class="v">${n}</div></div>`;
  const podium = (t, m, unit, sub) => { const L = Object.entries(m).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    if (!L.length) return `<div class="card"><h2>${t}</h2><div class="empty">لا توجد سجلات بعد</div></div>`;
    return `<div class="card"><h2>${t}</h2>
      <div style="display:flex;gap:8px;align-items:flex-end;justify-content:center;margin:6px 0 10px">${[1, 0, 2].map(i => L[i] ? `<div style="flex:1;max-width:150px;text-align:center;background:${i === 0 ? 'linear-gradient(180deg,#FFF6DA,#fff)' : '#FBF8F2'};border:1px solid ${i === 0 ? '#E9C46A' : 'var(--line)'};border-radius:14px;padding:${i === 0 ? '12px 6px 10px' : '8px 6px'}">${cupSVG(i, i === 0 ? 46 : 36)}<div style="font-weight:700;font-size:13px;margin-top:4px">${esc(L[i][0])}</div><div style="font-size:11px;color:var(--muted)">${esc(sub ? sub(L[i][0]) : deptOf(L[i][0]))}</div><div style="font-weight:800;color:var(--maroon)">${L[i][1]} <small style="font-weight:400">${unit}</small></div></div>` : '<div style="flex:1;max-width:150px"></div>').join('')}</div>
      ${L.slice(3, 8).map(([n, v], j) => `<div class="row" style="margin:4px 0;font-size:13px"><span class="chip">${j + 4}</span><span class="sp">${esc(n)}</span><b>${v}</b></div>`).join('')}</div>`; };
  const deptCov = [...new Set(vpPool.map(t => t.dept))].map(d => { const n = R.filter(r => r.dept === d && SECTIONS.some(s => s.k === r.item)).length; return [d, n]; }).sort((a, b) => b[1] - a[1]);
  const mx = Math.max(1, ...deptCov.map(x => x[1]));
  el.innerHTML = `<div class="note">لوحة شاملة لكل ما في المنصة خلال العام الأكاديمي ${REF.YEAR || ''}، وتتحدث تلقائيًا مع كل تسجيل.</div>
  <div class="grid g4">
    ${tile(nIni, 'المبادرات', '#62102A')}${tile(nAct, 'الأنشطة', '#B8903A')}${tile(by('TPV').length, 'الزيارات التبادلية', '#0E8C88')}${tile(by('TWS').length + by('WS').length, 'الورش والتطوير', '#1F3A5F')}
    ${tile(by('TPA').reduce((a, r) => a + (+r.d.n > 0 ? +r.d.n : 1), 0), 'التواصل مع أولياء الأمور', '#7A4FA3')}${tile(by('TACH').length + by('ACH').length, 'الإنجازات والمشاركات', '#2E7D52')}${tile(by('MT').length, 'الاجتماعات الأكاديمية', '#8A6A2E')}${tile(by('V').length, 'حضور المنسقات الصفي', '#5A6B7D')}
  </div>
  <div class="grid g4" style="margin-top:14px">
    <div class="card">${ring(vpPct, '#62102A', 'حضور النائب الأكاديمي', vpSeen.size + ' من ' + vpPool.length + ' · ' + curSem() + ' · المتبقي ' + Math.round(100 - vpPct) + '%')}</div>
    <div class="card">${ring(PC.pct, '#B8903A', 'حضور مديرة المدرسة', PC.seen.size + ' من ' + PC.target + ' · العام · المتبقي ' + Math.round(100 - PC.pct) + '%')}${PC.seen.size >= PC.target && PC.target ? STAR : ''}</div>
    <div class="card">${ring(repAll ? repOk / repAll * 100 : 0, '#0E8C88', 'التقارير المعتمدة', repOk + ' من ' + repAll + ' تقرير')}</div>
    <div class="card">${ring(PC.half ? Math.min(100, PC.seenS1.size / PC.half * 100) : 0, '#2E7D52', 'هدف المديرة للفصل الأول', PC.seenS1.size + ' من ' + PC.half)}</div>
  </div>
  <h2 style="margin:22px 0 8px;color:var(--maroon)">المعلمات المتميزات</h2>
  <div class="grid g2">${podium('المبادرات', ini, 'مبادرة')}${podium('الأنشطة', act, 'نشاط')}${podium('الزيارات التبادلية', pv, 'زيارة')}${podium('تطوير الزميلات (ورش قدّمتها)', ws, 'ورشة')}${podium('التواصل مع أولياء الأمور', pa, 'ولي أمر')}${podium('الإنجازات والمشاركات', ach, 'إنجاز')}</div>
  <h2 style="margin:22px 0 8px;color:var(--maroon)">المنسقات المتميزات</h2>
  <div class="grid g2">${podium('الأكثر توثيقًا لأعمال القسم', cAll, 'سجل', n => 'منسقة')}${podium('التقارير المعتمدة', cRep, 'تقرير', n => 'منسقة')}${podium('الاجتماعات الأكاديمية', cm('MT'), 'اجتماع', n => 'منسقة')}${podium('الحضور الصفي', cm('V'), 'زيارة', n => 'منسقة')}${podium('الورش الداخلية', cm('WS'), 'ورشة', n => 'منسقة')}${podium('الأنشطة والمبادرات', cm('AC'), 'نشاط', n => 'منسقة')}</div>
  <div class="card" style="margin-top:14px"><h2>حجم التوثيق في الأقسام</h2>${deptCov.map(([d, n]) => `<div class="row" style="margin:6px 0"><span style="width:200px">${esc(d)}</span><div class="bar sp"><i style="width:${n / mx * 100}%"></i></div><b>${n}</b></div>`).join('')}</div>`;
}
