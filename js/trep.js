/* الميزان — تقرير أعمال المعلمة الشهري
   يجمع ما وثّقته المعلمة في الميزان (وما يصل من سبع سنابل) خلال شهر، ويختم بوصفٍ لأدائها:
   معلمة مبادِرة · معلمة مجتهدة · بحاجة إلى مضاعفة الجهد. يظهر للمعلمة ولمنسقتها وللنائب والمديرة. */
'use strict';

const TR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const trM = k => (TR_MONTHS[+String(k).slice(5, 7) - 1] || '') + ' ' + String(k).slice(0, 4);
function trMonthList() {   // أشهر العام الدراسي حتى الشهر الحالي، الأحدث أولاً
  const ps = (S.periods || []).slice().sort((a, b) => a.from.localeCompare(b.from)); if (!ps.length) return [today().slice(0, 7)];
  const L = []; let d = new Date(ps[0].from.slice(0, 7) + '-01T12:00:00'); const end = today().slice(0, 7);
  while (true) { const k = d.toISOString().slice(0, 7); L.push(k); if (k >= end || L.length > 14) break; d.setMonth(d.getMonth() + 1); }
  return L.reverse();
}
const trList = v => Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);

/* الفترة: أسبوع · شهر · فترة تقويم (فصلية) · من تاريخ إلى تاريخ */
function trRange() {
  const k = S.trk || 'm', t = today();
  if (k === 'w') { const d = new Date((S.trw || t) + 'T12:00:00'); const st = new Date(d); st.setDate(d.getDate() - d.getDay()); const en = new Date(st); en.setDate(st.getDate() + 6);
    const f = st.toISOString().slice(0, 10), to = en.toISOString().slice(0, 10); return { from: f, to, label: `الأسبوع ${dm(f)} – ${dm(to)}`, kind: 'الأسبوعي' }; }
  if (k === 'p') { const ps = S.periods || []; const p = ps.find(x => x.name === S.trp) || curPer(); S.trp = p.name; return { from: p.from, to: p.to, label: p.name, kind: 'الفصلي' }; }
  if (k === 'c') { const f = S.trf || (t.slice(0, 8) + '01'), to = S.trto || t; return { from: f, to, label: `من ${dm(f)} إلى ${dm(to)}`, kind: '' }; }
  const mk = S.trm || t.slice(0, 7); const last = new Date(+mk.slice(0, 4), +mk.slice(5, 7), 0).getDate();
  return { from: mk + '-01', to: mk + '-' + ('0' + last).slice(-2), label: 'شهر ' + trM(mk), kind: 'الشهري' };
}
function trData(name, rng) {
  const inM = r => { const d = String(r.date || '').slice(0, 10); return d >= rng.from && d <= rng.to; };
  const own = it => S.records.filter(r => r.item === it && r.d && r.d.t === name && inM(r));
  const D = {
    ta: own('TA'), pv: own('TPV'), ws: own('TWS'), pa: own('TPA'), ach: own('TACH'), tas: own('TAS'), ds: own('TDS'),
    host: S.records.filter(r => r.item === 'TPV' && r.d && r.d.v === name && inM(r)),
    sen: S.records.filter(r => r.item === 'SEN' && r.d && (r.d.t === name || r.d.teacher === name) && inM(r)),
    is: S.records.filter(r => r.item === 'IS' && r.d && r.d.t === name && inM(r)),
    v: S.records.filter(r => r.item === 'V' && r.d && r.d.t === name && inM(r)),
    rf: S.records.filter(r => r.item === 'SRF' && r.d && r.d.t === name && inM(r)),
  };
  D.ini = D.ta.filter(r => r.d.kind === 'مبادرة').length + D.ws.filter(r => r.d.role === 'قدّمتُ لتطوير الزملاء').length;
  D.work = D.ta.length + D.pv.length + D.ws.length + D.pa.length + D.ach.length + D.tas.length;
  D.cls = D.ini >= 1 && D.work >= 5 ? 'مبادرة' : D.work >= 3 ? 'مجتهدة' : 'ضعيف';
  return D;
}

/* معايير استمارة تقييم الأداء السنوي التي غطّتها الأعمال الموثّقة في الفترة */
const TR_DOM = [[1, 'التخطيط لتطوير أداء وتحصيل الطلبة', 15], [2, 'إشراك الطلبة في عملية التعلم', 25], [3, 'توفير بيئة تعلم آمنة وداعمة', 10], [4, 'تقييم تعلم الطلبة واستخدام بياناته', 15], [5, 'الممارسات المهنية والتطوير المهني المستمر', 10], [6, 'الشراكة مع أولياء الأمور والمجتمع', 10], [7, 'الجوانب الشخصية والمهنية', 15]];
function trStd(D) {
  const add = (m, ind, n, what) => { if (!n) return; ind.split(' · ').forEach(x => { const k = x.trim(); m[k] = m[k] || { n: 0, w: {} }; m[k].n += n; m[k].w[what] = n; }); };
  const m = {}, T = typeof TSTD !== 'undefined' ? TSTD : {};
  [['TA', D.ta, 'الأنشطة والمبادرات'], ['TPV', D.pv, 'الزيارات التبادلية'], ['TWS', D.ws, 'الورش والتطوير'], ['TPA', D.pa, 'التواصل مع أولياء الأمور'], ['TACH', D.ach, 'الإنجازات والمشاركات'], ['TAS', D.tas, 'التكليفات'], ['TDS', D.ds, 'الانضباط الوظيفي']].forEach(([k, L, w]) => T[k] && add(m, T[k].n, L.length, w));
  add(m, '4.3.2 · 2.3', D.sen.length, 'الحصص الإثرائية'); add(m, '3.2.3 · 3.1', D.rf.length, 'شهادات الطالبات');
  return TR_DOM.map(([n, t, w]) => { const ks = Object.keys(m).filter(k => k.split('.')[0] === String(n)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const W = {}; ks.forEach(k => Object.assign(W, m[k].w)); return { n, t, w, ks, cnt: Object.values(W).reduce((a, b) => a + b, 0), what: Object.keys(W) }; });
}
function trBody(name, rng, D) {
  const dt = r => r.date ? ` (${dm(r.date)})` : '';
  const sec = (h, lines, empty) => `<tr><td class="k">${h}</td><td class="j">${lines.length ? lines.map(x => `<div>• ${esc(x)}</div>`).join('') : `<span style="color:#888">${empty}</span>`}</td></tr>`;
  const taL = D.ta.map(r => `${r.d.kind || 'نشاط'} «${String(r.d.name || '').trim()}»${dt(r)}` + (trList(r.d.ps).length ? ` — يخدم: ${trList(r.d.ps).map(p => p.replace(/^الأولوية (\d): .*/, 'الأولوية $1')).join('، ')}` : ''));
  const pvL = D.pv.map(r => `زارت أ. ${r.d.v}${dt(r)}` + (trList(r.d.saw).length ? `، واستفادت: ${trList(r.d.saw).join('، ')}` : '') + (trList(r.d.apply).length ? `، وستطبّق: ${trList(r.d.apply).join('، ')}` : ''))
    .concat(D.host.map(r => `استضافت زيارة من أ. ${r.d.t}${dt(r)}، توظيفاً لجوانب تميّزها`));
  const wsL = D.ws.map(r => `${r.d.role === 'قدّمتُ لتطوير الزملاء' ? 'قدّمت لزميلاتها' : r.d.role === 'حضرتُ ورشة خارجية' ? 'حضرت ورشة خارجية' : 'حضرت ورشة داخلية'}: «${String(r.d.title || '').trim()}»${dt(r)}`);
  const nPA = D.pa.reduce((a, r) => a + (+r.d.n || (r.d.stu && r.d.stu.length) || 1), 0);
  const paL = D.pa.length ? [`تواصلت مع أولياء أمور (${nPA}) من الطالبات، ومن أغراض التواصل: ${[...new Set(D.pa.map(r => r.d.topic || r.d.why).filter(Boolean))].join('، ') || 'متابعة أكاديمية'}`] : [];
  const achL = D.ach.map(r => `${r.d.kind || 'مشاركة'}: «${String(r.d.name || '').trim()}»${r.d.res ? ' — ' + r.d.res : ''}${dt(r)}`);
  const tasL = D.tas.map(r => `${trList(r.d.what).join('، ')}${r.d.scope === 'طوال العام' ? ' (طوال العام)' : ''}${r.d.by ? ' — بتكليف من ' + r.d.by : ''}`);
  const dsAbs = D.ds.reduce((a, r) => a + (r.d.abs || []).length, 0), dsPerm = D.ds.reduce((a, r) => a + (r.d.perm || []).length, 0);
  const showDs = isTeacher() || isAdmin();
  const senL = D.sen.length ? [`نفّذت (${D.sen.length}) من الحصص الإثرائية المسجّلة في سبع سنابل`] : [];
  const supL = [...(D.v.length ? [`زارتها منسقة القسم (${D.v.length}) ${D.v.length === 1 ? 'زيارة' : 'زيارات'} صفية`] : []), ...(D.is.length ? [`عُقدت معها (${D.is.length}) ${D.is.length === 1 ? 'جلسة فردية' : 'جلسات فردية'}`] : [])];
  const kpi = (n, l) => `<td style="text-align:center"><div style="font-size:16px;font-weight:bold;color:#7A1F33">${n}</div><div style="font-size:9.5px">${l}</div></td>`;
  const verdict = {
    'مبادرة': ['معلمة مبادِرة', `تميّزت المعلمة خلال ${rng.label} بروحٍ مبادِرة وعطاءٍ يتجاوز المطلوب، إذ جمعت بين التطوير المهني والعمل مع الطالبات والمبادرة بما لم تُكلَّف به، وهذا يدل على حرصها على صناعة الأثر وإتقان العمل.`],
    'مجتهدة': ['معلمة مجتهدة', `أدّت المعلمة خلال ${rng.label} ما أُنيط بها بجدٍّ واجتهاد، ووثّقت أعمالها بانتظام، والمأمول منها مزيدٌ من المبادرة بأعمالٍ نوعية تخدم أولويات المدرسة.`],
    'ضعيف': ['بحاجة إلى مضاعفة الجهد', `قلّ ما وُثّق من أعمال المعلمة خلال ${rng.label}، والتوصية: مضاعفة الجهد في ${[!D.pv.length ? 'الزيارات التبادلية' : '', !D.pa.length ? 'التواصل مع أولياء الأمور' : '', !D.ta.length ? 'الأنشطة والمبادرات' : '', !D.ws.length ? 'التطوير المهني' : ''].filter(Boolean).join('، ') || 'توثيق الأعمال أولاً بأول'}.`]
  }[D.cls];
  const SD = trStd(D);
  return `<h1>تقرير أعمال المعلمة ${rng.kind}</h1><div class="sub">أ. ${esc(name)} — ${esc(rng.label)}</div>
  <table><tr>${kpi(D.ta.length, 'أنشطة ومبادرات')}${kpi(D.pv.length + D.host.length, 'زيارات تبادلية')}${kpi(D.ws.length, 'ورش وتطوير')}${kpi(nPA, 'أولياء أمور')}${kpi(D.ach.length, 'إنجازات ومشاركات')}${kpi(D.tas.length, 'تكليفات')}</tr></table>
  <table>
    ${sec('الأنشطة والبرامج والمبادرات', taL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('الزيارات التبادلية', pvL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('الورش والتطوير المهني', wsL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('التواصل مع أولياء الأمور', paL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('الإنجازات والمشاركات', achL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('التكليفات والأعباء الوظيفية', tasL, 'لم تُسجَّل تكليفات خلال الفترة.')}
    ${senL.length ? sec('من سبع سنابل', senL, '') : ''}
    ${supL.length ? sec('المتابعة الإشرافية', supL, '') : ''}
    ${showDs ? sec('الانضباط الوظيفي', D.ds.length ? [`غياب: ${dsAbs} · استئذان: ${dsPerm}`] : [], 'لم يُسجَّل الانضباط لهذه الفترة.') : ''}
  </table>
  <div class="h2" style="font-weight:bold;color:#7A1F33;margin:10px 0 4px">معايير تقييم الأداء التي غطّتها الأعمال الموثّقة</div>
  <table><tr><th style="width:34%">مجال التقييم (الوزن)</th><th style="width:22%">المؤشرات المغطّاة</th><th>الشواهد</th></tr>
  ${SD.map(x => `<tr><td class="k">${x.n}. ${x.t} (${x.w}%)</td><td style="color:#B23A48;font-weight:bold">${x.ks.length ? x.ks.join('، ') : '<span style="color:#999;font-weight:normal">—</span>'}</td><td class="j">${x.cnt ? `(${x.cnt}) من ${x.what.join('، ')}` : '<span style="color:#888">تُقاس بالحضور الصفي والمتابعة الإشرافية</span>'}</td></tr>`).join('')}</table>
  <div class="gen"><div class="h">التقدير العام: ${verdict[0]}</div><div class="b">${esc(verdict[1])}</div></div>`;
}

/* خانة التواقيع: يميناً المنسقة، ويساراً النائب الأكاديمي. التواقيع تظهر للمنسقة والنائب فقط، أما المعلمة فترى الأسماء دون تواقيع */
const TR_SIG = {};
async function trSigs(dept) {
  if (isTeacher()) return { c: '', v: '' };
  const k = dept || ''; if (TR_SIG[k]) return TR_SIG[k];
  const cid = isAdmin() ? (S.coords.find(c => (c.dept || []).includes(dept)) || {}).id : S.user.id; let c = '', v = '';
  try { if (cid) c = (await API.call('signature', { who: cid })).data || ''; } catch (e) {}
  try { v = isAdmin() ? (await API.call('signature', {})).data || '' : (await API.call('signature', { cheer: 1 })).data || ''; } catch (e) {}
  return (TR_SIG[k] = { c, v });
}
function trSignBlock(name, sig) {
  const st = (S.staff || []).find(x => x.name === name) || {}; const dept = st.dept || (S.user.dept || [])[0] || '';
  const coord = isAdmin() ? ((S.coords.find(c => (c.dept || []).includes(dept)) || {}).name || '') : isTeacher() ? (((S.coords || []).find(c => (c.dept || []).includes(dept)) || {}).name || ((S.staffAll || []).concat(S.staff || [])).filter(x => x.dept === dept && x.role === 'منسقة').map(x => x.name)[0] || '') : S.user.name;
  const cell = (ttl, nm, img) => `<td style="border:0;width:50%;text-align:center;vertical-align:top;padding-top:4mm"><div style="font-weight:bold;color:#7A1F33">${esc(ttl)}</div>
    <div style="position:relative;height:22mm;margin-top:1mm">${img ? `<img src="${img}" alt="" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:20mm;max-width:46mm">` : ''}<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);white-space:nowrap;font-weight:bold">${nm ? 'أ. ' + esc(nm) : '........................'}</div></div></td>`;
  return `<table style="width:100%;border:0;margin-top:5mm"><tr>${cell('منسقة قسم ' + dept, coord, sig.c)}${cell('نائب المدير للشؤون الأكاديمية', 'آسيا الذبياني', sig.v)}</tr></table>`;
}

function T_rep(el) { trPage(el, S.user.name); }
function C_trep(el) { trPage(el, null); }
function trPage(el, fixed) {
  if (!document.getElementById('trcss')) { const st = document.createElement('style'); st.id = 'trcss'; st.textContent = FORM_CSS + '.trv{font-size:12.5px}.trv h1{font-size:18px}'; document.head.appendChild(st); }
  setTitle(fixed ? 'تقرير أعمالي' : 'تقارير أعمال المعلمات');
  const months = trMonthList(); S.trm = months.includes(S.trm) ? S.trm : months[0];
  const staff = fixed ? [fixed] : (S.staff || []).filter(s => s.name && (isAdmin() ? (!S.dept || s.dept === S.dept) : (S.user.dept || []).includes(s.dept))).map(s => s.name).filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a.localeCompare(b, 'ar'));
  S.trt = fixed || (staff.includes(S.trt) ? S.trt : staff[0] || '');
  const RG = trRange();
  const D = S.trt ? trData(S.trt, RG) : null;
  const chip = c => c === 'مبادرة' ? '<span class="chip ok">مبادِرة</span>' : c === 'مجتهدة' ? '<span class="chip tf">مجتهدة</span>' : '<span class="chip warn">بحاجة إلى مضاعفة الجهد</span>';
  el.innerHTML = `<div class="tins">${fixed ? 'معلمتي الغالية، هذا تقرير (أسبوعي أو شهري أو فصلي أو لأي فترة تختارينها) يجمع تلقائياً كل ما وثّقتِه في الميزان وما يصل من سبع سنابل. اختاري نوع التقرير والفترة، ثم اطبعيه أو احفظيه PDF لملفكِ.' : 'اختاري الشهر لتظهر أعمال كل معلمة وتقديرها العام، ثم افتحي تقرير أي معلمة لطباعته. يُبنى التقرير تلقائياً مما وثّقته المعلمة في الميزان وما يصل من سبع سنابل.'}</div>
  <div class="card"><div class="row" style="gap:10px;flex-wrap:wrap">
    <select id="trK">${[['w', 'أسبوعي'], ['m', 'شهري'], ['p', 'فصلي (فترة التقويم)'], ['c', 'من تاريخ إلى تاريخ']].map(([k, l]) => `<option value="${k}" ${(S.trk || 'm') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    ${(S.trk || 'm') === 'm' ? `<select id="trM">${months.map(m => `<option value="${m}" ${m === S.trm ? 'selected' : ''}>${trM(m)}</option>`).join('')}</select>` : ''}
    ${S.trk === 'w' ? `<label style="font-size:12px">أسبوع يوم <input type="date" id="trW" value="${S.trw || today()}"></label>` : ''}
    ${S.trk === 'p' ? `<select id="trPp">${(S.periods || []).map(p => `<option ${p.name === S.trp ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>` : ''}
    ${S.trk === 'c' ? `<label style="font-size:12px">من <input type="date" id="trF" value="${RG.from}"></label><label style="font-size:12px">إلى <input type="date" id="trTo" value="${RG.to}"></label>` : ''}
    ${fixed ? '' : `<select id="trT">${staff.map(t => `<option ${t === S.trt ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`}
    <span class="sp"></span>${S.trt ? '<button class="btn ro-keep" id="trP">طباعة / حفظ PDF</button>' : ''}</div>
  ${fixed ? '' : `<div class="tbl" style="margin-top:10px"><table class="t"><tr><th>المعلمة</th><th>الأعمال</th><th>مبادرات</th><th>زيارات تبادلية</th><th>أولياء أمور</th><th>التقدير</th><th></th></tr>
    ${staff.map(t => { const x = trData(t, RG); return `<tr><td style="white-space:nowrap"><b>${esc(t)}</b></td><td>${x.work}</td><td>${x.ini}</td><td>${x.pv.length}</td><td>${x.pa.length}</td><td>${chip(x.cls)}</td><td><button class="btn sm sec" data-tt="${esc(t)}">عرض</button></td></tr>`; }).join('')}</table></div>`}</div>
  ${D ? `<div class="card"><div class="fp trv">${trBody(S.trt, RG, D)}<div id="trSign">${trSignBlock(S.trt, { c: '', v: '' })}</div></div></div>` : '<div class="empty">لا توجد معلمات</div>'}`;
  if (S.trt && !isTeacher()) trSigs(((S.staff || []).find(x => x.name === S.trt) || {}).dept).then(sg => { const b = $('#trSign', el); if (b) b.innerHTML = trSignBlock(S.trt, sg); });
  if ($('#trM')) $('#trM').onchange = e => { S.trm = e.target.value; show(); };
  $('#trK').onchange = e => { S.trk = e.target.value; show(); };
  if ($('#trW')) $('#trW').onchange = e => { S.trw = e.target.value; show(); };
  if ($('#trPp')) $('#trPp').onchange = e => { S.trp = e.target.value; show(); };
  if ($('#trF')) $('#trF').onchange = e => { S.trf = e.target.value; show(); };
  if ($('#trTo')) $('#trTo').onchange = e => { S.trto = e.target.value; show(); };
  if ($('#trT')) $('#trT').onchange = e => { S.trt = e.target.value; show(); };
  $$('[data-tt]', el).forEach(b => b.onclick = () => { S.trt = b.dataset.tt; show(); setTimeout(() => { const c = $('.trv'); if (c) c.scrollIntoView({ behavior: 'smooth' }); }, 50); });
  if ($('#trP')) $('#trP').onclick = async () => {
    const imgs = await lhImgs(); const sg = await trSigs(((S.staff || []).find(x => x.name === S.trt) || {}).dept);
    const html = docHTML(trBody(S.trt, RG, trData(S.trt, RG)) + trSignBlock(S.trt, sg), imgs, `تقرير أعمال ${S.trt} ${RG.label}`);
    const w = window.open('', '_blank'); if (!w) { toast('اسمحي بالنوافذ المنبثقة لهذا الموقع ثم أعيدي المحاولة', 1); return; }
    w.document.write(html); w.document.close(); setTimeout(() => w.print(), 700);
  };
}
