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
/* الأنشطة والمبادرات التي سجّلتها المعلمة للشراكة مع أولياء الأمور (من الميزان أو من «مبادراتي وأنشطتي» في سبع سنابل):
   ما اختارت له «الأولوية 4: الشراكة مع أولياء الأمور»، أو كانت فئته المستهدفة أولياء الأمور، أو ورد في اسمه أو وصفه أو أثره ولي الأمر أو الأسرة */
const PA_RX = /(ولي|أولياء|اولياء)\s*(ال)?[أا]مر|الأسر[ةه]|الاسر[ةه]|أسر الطالبات/;
const isPaAct = r => { const d = r.d || {}; return trList(d.ps).concat(trList(d.p)).some(p => /الأولوية 4/.test(p)) || PA_RX.test([d.tg, d.name, d.title, d.desc, d.imp, d.impact].filter(Boolean).join(' ')); };

/* الفترة: أسبوع · شهر · فترة تقويم (فصلية) · من تاريخ إلى تاريخ */
function trRange() {
  const k = S.trk || 's', t = today();
  if (k === 'w') { const d = new Date((S.trw || t) + 'T12:00:00'); const st = new Date(d); st.setDate(d.getDate() - d.getDay()); const en = new Date(st); en.setDate(st.getDate() + 6);
    const f = st.toISOString().slice(0, 10), to = en.toISOString().slice(0, 10); return { from: f, to, label: `الأسبوع ${dm(f)} – ${dm(to)}`, kind: 'الأسبوعي' }; }
  if (k === 's') { const ps = (S.periods || []).filter(x => x.sem); const sems = [...new Set(ps.map(x => x.sem))]; const cur = (ps.find(x => x.from <= t && x.to >= t) || ps[0] || {}).sem;
    const sm = sems.includes(S.trs) ? S.trs : cur; S.trs = sm; const L = ps.filter(x => x.sem === sm);
    if (L.length) return { from: L.map(x => x.from).sort()[0], to: L.map(x => x.to).sort().slice(-1)[0], label: sm, kind: 'الفصلي' }; }
  if (k === 'p') { const ps = S.periods || []; const p = ps.find(x => x.name === S.trp) || curPer(); S.trp = p.name; return { from: p.from, to: p.to, label: p.name, kind: 'الفصلي' }; }
  if (k === 'mm') { const ms = trMonthList().slice().reverse(); const a = S.trm1 && ms.includes(S.trm1) ? S.trm1 : ms[0], b0 = S.trm2 && ms.includes(S.trm2) ? S.trm2 : ms[ms.length - 1];
    const [m1, m2] = a <= b0 ? [a, b0] : [b0, a]; S.trm1 = m1; S.trm2 = m2; const last = new Date(+m2.slice(0, 4), +m2.slice(5, 7), 0).getDate();
    return { from: m1 + '-01', to: m2 + '-' + ('0' + last).slice(-2), label: m1 === m2 ? 'شهر ' + trM(m1) : `من ${trM(m1)} إلى ${trM(m2)}`, kind: m1 === m2 ? 'الشهري' : '' }; }
  if (k === 'c') { const f = S.trf || (t.slice(0, 8) + '01'), to = S.trto || t; return { from: f, to, label: `من ${dm(f)} إلى ${dm(to)}`, kind: '' }; }
  const mk = S.trm || t.slice(0, 7); const last = new Date(+mk.slice(0, 4), +mk.slice(5, 7), 0).getDate();
  return { from: mk + '-01', to: mk + '-' + ('0' + last).slice(-2), label: 'شهر ' + trM(mk), kind: 'الشهري' };
}
function trData(name, rng) {
  const inM = r => { const d = String(r.date || '').slice(0, 10); return d >= rng.from && d <= rng.to; };
  const own = it => S.records.filter(r => r.item === it && r.d && r.d.t === name && inM(r));
  const D = {
    ta: own('TA'), pv: own('TPV'), tex: own('TEX'), ws: own('TWS'), pa: own('TPA'), ach: own('TACH'), tas: own('TAS'), ds: own('TDS'),
    host: S.records.filter(r => r.item === 'TPV' && r.d && r.d.v === name && inM(r)),
    sen: S.records.filter(r => r.item === 'SEN' && r.d && (r.d.t === name || r.d.teacher === name) && inM(r)),
    is: S.records.filter(r => r.item === 'IS' && r.d && r.d.t === name && inM(r)),
    v: S.records.filter(r => r.item === 'V' && r.d && r.d.t === name && inM(r)),
    rf: S.records.filter(r => r.item === 'SRF' && r.d && r.d.t === name && inM(r)),
    vis: S.records.filter(r => ['V', 'VPV', 'PRV', 'LVV', 'TVR'].includes(r.item) && r.d && r.d.t === name && r.d.rt && Object.values(r.d.rt).some(v => v != null && +v < 5) && inM(r)),
    ex: S.records.filter(r => r.item === 'EX' && r.d && (r.d.t === name || r.d.t === REF.ALL_MEMBERS) && inM(r)),
    sfb: S.records.filter(r => ['SFB', 'SAN', 'SAC'].includes(r.item) && r.d && r.d.t === name && inM(r)),
  };
  /* أعمال المعلمة التي سجّلتها المنسقة باسمها (منفّذة نشاط، أو مقدّمة ورشة للقسم) — تُضاف ما لم تكن المعلمة سجّلتها بنفسها */
  const nzT = x => String(x || '').replace(/\s+/g, ' ').trim();
  const myTA = new Set(D.ta.map(r => nzT(r.d.name))), myWS = new Set(D.ws.map(r => nzT(r.d.title)));
  D.acC = S.records.filter(r => r.item === 'AC' && r.d && [r.d.e1, r.d.e2, r.d.e3].includes(name) && inM(r) && !myTA.has(nzT(r.d.name)));
  D.wsC = S.records.filter(r => r.item === 'WS' && r.d && String(r.d.pres || '').includes(name) && /^تمت/.test(r.d.g || '') && inM(r) && !myWS.has(nzT(r.d.c || r.d.b)));
  D.lr = own('TLR');
  D.sab = D.sen.length + D.rf.length + D.sfb.length;
  D.paa = D.ta.filter(isPaAct);   // تُحسب مع الأنشطة، وتظهر أيضاً في الشراكة مع أولياء الأمور
  D.ini = D.ta.filter(r => r.d.kind === 'مبادرة').length + D.ws.filter(r => r.d.role === 'قدّمتُ لتطوير الزملاء').length + D.wsC.length;
  D.work = D.ta.length + D.pv.length + D.tex.length + D.ws.length + D.pa.length + D.ach.length + D.tas.length + D.acC.length + D.wsC.length + D.lr.length + Math.ceil(D.sab / 3);
  D.cls = D.ini >= 1 && D.work >= 5 ? 'مبادرة' : D.work >= 3 ? 'مجتهدة' : 'ضعيف';
  return D;
}

/* معايير استمارة تقييم الأداء السنوي التي غطّتها الأعمال الموثّقة في الفترة */
const TR_DOM = [[1, 'التخطيط لتطوير أداء وتحصيل الطلبة', 15], [2, 'إشراك الطلبة في عملية التعلم', 25], [3, 'توفير بيئة تعلم آمنة وداعمة', 10], [4, 'تقييم تعلم الطلبة واستخدام بياناته', 15], [5, 'الممارسات المهنية والتطوير المهني المستمر', 10], [6, 'الشراكة مع أولياء الأمور والمجتمع', 10], [7, 'الجوانب الشخصية والمهنية', 15]];
function trStd(D) {
  const add = (m, ind, n, what) => { if (!n) return; ind.split(' · ').forEach(x => { const k = x.trim(); m[k] = m[k] || { n: 0, w: {} }; m[k].n += n; m[k].w[what] = n; }); };
  const m = {}, T = typeof TSTD !== 'undefined' ? TSTD : {};
  [['TA', D.ta, 'الأنشطة والمبادرات'], ['TPV', D.pv, 'الزيارات التبادلية'], ['TEX', D.tex, 'تبادل الخبرات في الفعاليات والأنشطة'], ['TWS', D.ws, 'الورش والتطوير'], ['TPA', D.pa, 'التواصل مع أولياء الأمور'], ['TACH', D.ach, 'الإنجازات والمشاركات'], ['TAS', D.tas, 'التكليفات'], ['TDS', D.ds, 'الانضباط الوظيفي']].forEach(([k, L, w]) => T[k] && add(m, T[k].n, L.length, w));
  if (T.TPA) add(m, T.TPA.n, D.paa.length, 'أنشطة الشراكة مع أولياء الأمور');
  add(m, '4.3.2 · 2.3', D.sen.length, 'الحصص الإثرائية'); add(m, '3.2.3 · 3.1', D.rf.length, 'شهادات الطالبات');
  return TR_DOM.map(([n, t, w]) => { const ks = Object.keys(m).filter(k => k.split('.')[0] === String(n)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const W = {}; ks.forEach(k => Object.assign(W, m[k].w)); return { n, t, w, ks, cnt: Object.values(W).reduce((a, b) => a + b, 0), what: Object.keys(W) }; });
}
function trBody(name, rng, D) {
  const dt = r => r.date ? ` (${dm(r.date)})` : '';
  const sec = (h, lines, empty) => `<tr><td class="k">${h}</td><td class="j">${lines.length ? lines.map(x => `<div>• ${esc(x)}</div>`).join('') : `<span style="color:#888">${empty}</span>`}</td></tr>`;
  const taL0 = D.ta.map(r => `${r.d.kind || 'نشاط'} «${String(r.d.name || '').trim()}»${dt(r)}` + (trList(r.d.ps).length ? ` — يخدم: ${trList(r.d.ps).map(p => p.replace(/^الأولوية (\d): .*/, 'الأولوية $1')).join('، ')}` : ''));
  const pvL = D.pv.map(r => `زارت أ. ${r.d.v}${dt(r)}` + (trList(r.d.saw).length ? `، واستفادت: ${trList(r.d.saw).join('، ')}` : '') + (trList(r.d.apply).length ? `، وستطبّق: ${trList(r.d.apply).join('، ')}` : ''))
    .concat(D.host.map(r => `استضافت زيارة من أ. ${r.d.t}${dt(r)}، توظيفاً لجوانب تميّزها`))
    .concat(D.tex.map(r => `${trList(r.d.role).join(' و') || 'حاضرة'} في ${r.d.kind || 'فعالية'} «${String(r.d.name || '').trim()}»${r.d.odept ? ' لقسم ' + r.d.odept : ''}${dt(r)}` + (trList(r.d.gain).length ? `، واستفادت: ${trList(r.d.gain).join('، ')}` : '') + (r.d.idea ? `، وفكرة للتطبيق: ${r.d.idea}` : '')));
  const taL = taL0.concat(D.acC.map(r => `نفّذت ${r.d.ty || 'نشاطاً'} «${String(r.d.name || '').trim()}»${dt(r)} (من سجلات المنسقة)`));
  const wsL0 = D.ws.map(r => `${r.d.role === 'قدّمتُ لتطوير الزملاء' ? 'قدّمت لزميلاتها' : r.d.role === 'حضرتُ ورشة خارجية' ? (pdKind(r.d) === 'self' ? 'تنمية ذاتية' : 'حضرت ورشة خارجية رسمية') : 'حضرت ورشة داخلية'}: «${String(r.d.title || '').trim()}»${dt(r)}`);
  const wsL = wsL0.concat(D.wsC.map(r => `قدّمت لزميلاتها «${String(r.d.c || r.d.b || '').trim()}»${dt(r)} (من سجلات المنسقة)`));
  const lrL = D.lr.map(r => `${r.d.k || 'مصادر التعلم'}${r.d.bk ? ': ' + r.d.bk : r.d.tool ? ': ' + trList(r.d.tool).join('، ') : ''}${r.d.use ? ' — ' + r.d.use : ''}${r.d.s ? ' (' + r.d.s + ')' : ''}${dt(r)}`);
  const sabL = D.sab ? [`سجّلت في سبع سنابل: ${D.sen.length} حصة إثرائية، و${D.sfb.length} من التغذية الراجعة وتحليل النتائج والأنشطة، و${D.rf.length} من التعزيز والشهادات`] : [];
  const nPA = D.pa.reduce((a, r) => a + (+r.d.n || (r.d.stu && r.d.stu.length) || 1), 0);
  const paL = (D.pa.length ? [`تواصلت مع أولياء أمور (${nPA}) من الطالبات، ومن أغراض التواصل: ${[...new Set(D.pa.map(r => r.d.topic || r.d.why).filter(Boolean))].join('، ') || 'متابعة أكاديمية'}`] : [])
    .concat(D.paa.map(r => `${r.d.kind || 'نشاط'} «${String(r.d.name || '').trim()}» للشراكة مع أولياء الأمور${dt(r)}` + (r.d.tg ? ` — المستهدف: ${r.d.tg}` : '')));
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
    'ضعيف': ['بحاجة إلى مضاعفة الجهد', `قلّ ما وُثّق من أعمال المعلمة خلال ${rng.label}، والتوصية: مضاعفة الجهد في ${[!D.pv.length ? 'الزيارات التبادلية' : '', !D.pa.length && !D.paa.length ? 'التواصل مع أولياء الأمور' : '', !D.ta.length ? 'الأنشطة والمبادرات' : '', !D.ws.length ? 'التطوير المهني' : ''].filter(Boolean).join('، ') || 'توثيق الأعمال أولاً بأول'}.`]
  }[D.cls];
  const SD = trStd(D);
  return `<h1>تقرير أعمال المعلمة ${rng.kind}</h1><div class="sub">أ. ${esc(name)} — ${esc(rng.label)}</div>
  <table><tr>${kpi(D.ta.length, 'أنشطة ومبادرات')}${kpi(D.pv.length + D.host.length, 'زيارات تبادلية')}${kpi(D.ws.length, 'ورش وتطوير')}${kpi(nPA, 'أولياء أمور')}${kpi(D.ach.length, 'إنجازات ومشاركات')}${kpi(D.tas.length, 'تكليفات')}</tr></table>
  ${trVisHTML(D)}
  <table>
    ${sec('الأنشطة والبرامج والمبادرات', taL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('الزيارات التبادلية', pvL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('الورش والتطوير المهني', wsL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('التواصل والشراكة مع أولياء الأمور', paL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('الإنجازات والمشاركات', achL, 'لم يُوثَّق خلال الفترة.')}
    ${sec('التكليفات والأعباء الوظيفية', tasL, 'لم تُسجَّل تكليفات خلال الفترة.')}
    ${sec('مصادر التعلم والتعليم الإلكتروني', lrL, 'لم يُوثَّق خلال الفترة.')}
    ${sabL.length ? sec('من سبع سنابل', sabL, '') : ''}
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
  const coordN = new Set((S.coords || []).map(c => c.name).concat((S.staff || []).filter(s => s.role === 'منسقة').map(s => s.name)));
  const staff = fixed ? [fixed] : (S.staff || []).filter(s => s.name && (isAdmin() || (!coordN.has(s.name) && s.role !== 'منسقة')) && (isAdmin() ? true : (S.user.dept || []).includes(s.dept))).map(s => s.name).filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a.localeCompare(b, 'ar'));
  S.trt = fixed || (staff.includes(S.trt) ? S.trt : staff[0] || '');
  const RG = trRange();
  const D = S.trt && (!isAdmin() || S.trPick) ? trData(S.trt, RG) : null;   // للنائب: لا يظهر تقرير قبل الضغط على «عرض»
  const chip = c => c === 'مبادرة' ? '<span class="chip ok">مبادِرة</span>' : c === 'مجتهدة' ? '<span class="chip tf">مجتهدة</span>' : '<span class="chip warn">بحاجة إلى مضاعفة الجهد</span>';
  el.innerHTML = `<div class="tins">${fixed ? 'معلمتي الغالية، هذا تقرير (أسبوعي أو شهري أو فصلي أو لأي فترة تختارينها) يجمع تلقائياً كل ما وثّقتِه في الميزان وما يصل من سبع سنابل. اختاري نوع التقرير والفترة، ثم اطبعيه أو احفظيه PDF لملفكِ.' : 'اختاري الشهر لتظهر أعمال كل معلمة وتقديرها العام، ثم افتحي تقرير أي معلمة لطباعته. يُبنى التقرير تلقائياً مما وثّقته المعلمة في الميزان وما يصل من سبع سنابل.'}</div>
  <div class="card"><div class="row" style="gap:10px;flex-wrap:wrap">
    <select id="trK">${[['m', 'شهر واحد'], ['mm', 'من شهر إلى شهر'], ['s', 'الفصل الدراسي كاملاً'], ['p', 'فترة تقويم (ربع)'], ['w', 'أسبوعي'], ['c', 'من تاريخ إلى تاريخ']].map(([k, l]) => `<option value="${k}" ${(S.trk || 's') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    ${(S.trk || 's') === 'm' ? `<select id="trM">${months.map(m => `<option value="${m}" ${m === S.trm ? 'selected' : ''}>${trM(m)}</option>`).join('')}</select>` : ''}
    ${S.trk === 'mm' ? (() => { const ms = months.slice().reverse(); return `<label style="font-size:12px">من شهر <select id="trM1">${ms.map(m => `<option value="${m}" ${m === S.trm1 ? 'selected' : ''}>${trM(m)}</option>`).join('')}</select></label><label style="font-size:12px">إلى شهر <select id="trM2">${ms.map(m => `<option value="${m}" ${m === S.trm2 ? 'selected' : ''}>${trM(m)}</option>`).join('')}</select></label>`; })() : ''}
    ${S.trk === 'w' ? `<label style="font-size:12px">أسبوع يوم <input type="date" id="trW" value="${S.trw || today()}"></label>` : ''}
    ${S.trk === 's' ? `<select id="trS">${[...new Set((S.periods || []).map(p => p.sem).filter(Boolean))].map(x => `<option ${x === S.trs ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>` : ''}
    ${S.trk === 'p' ? `<select id="trPp">${(S.periods || []).map(p => `<option ${p.name === S.trp ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>` : ''}
    ${S.trk === 'c' ? `<label style="font-size:12px">من <input type="date" id="trF" value="${RG.from}"></label><label style="font-size:12px">إلى <input type="date" id="trTo" value="${RG.to}"></label>` : ''}
    ${fixed || isAdmin() ? '' : `<select id="trT">${staff.map(t => `<option ${t === S.trt ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`}
    <span class="sp"></span>${D ? '<button class="btn ro-keep" id="trP">طباعة / حفظ PDF</button>' : ''}</div>
  ${!fixed && isAdmin() ? trGridHTML(RG, chip) : fixed ? '' : `<div class="tbl" style="margin-top:10px"><table class="t"><tr><th>المعلمة</th><th>الأعمال</th><th>مبادرات</th><th>زيارات تبادلية</th><th>أولياء أمور</th><th>التقدير</th><th></th></tr>
    ${staff.map(t => { const x = trData(t, RG); return `<tr><td style="white-space:nowrap"><b>${esc(t)}</b></td><td>${x.work}</td><td>${x.ini}</td><td>${x.pv.length}</td><td>${x.pa.length + x.paa.length}</td><td>${chip(x.cls)}</td><td><button class="btn sm sec" data-tt="${esc(t)}">عرض</button></td></tr>`; }).join('')}</table></div>`}</div>
  ${D ? `<div class="card"><div class="fp trv">${trBody(S.trt, RG, D)}<div id="trSign">${trSignBlock(S.trt, { c: '', v: '' })}</div></div></div>` : (isAdmin() && !S.trPick ? '' : '<div class="empty">لا توجد معلمات</div>')}
  ${D && !isTeacher() ? `<div class="card" id="trEv">${typeof FORMS !== 'undefined' && FORMS ? trEvalHTML(S.trt, RG, trEval(S.trt, RG, D), true) : '<div class="empty">جارٍ تحميل استمارة التقييم…</div>'}</div>` : ''}`;
  if (D && !isTeacher() && typeof loadForms === 'function' && !FORMS) loadForms().then(() => { const b = $('#trEv', el); if (b) { b.innerHTML = trEvalHTML(S.trt, RG, trEval(S.trt, RG, D), true); trEvBind(b, S.trt, RG); } });
  if (D && !isTeacher() && $('#trEv', el) && FORMS) trEvBind($('#trEv', el), S.trt, RG);
  if (S.trt && !isTeacher()) trSigs(((S.staff || []).find(x => x.name === S.trt) || {}).dept).then(sg => { const b = $('#trSign', el); if (b) b.innerHTML = trSignBlock(S.trt, sg); });
  if ($('#trM')) $('#trM').onchange = e => { S.trm = e.target.value; show(); };
  if ($('#trM1')) $('#trM1').onchange = e => { S.trm1 = e.target.value; show(); };
  if ($('#trM2')) $('#trM2').onchange = e => { S.trm2 = e.target.value; show(); };
  $('#trK').onchange = e => { S.trk = e.target.value; show(); };
  if ($('#trW')) $('#trW').onchange = e => { S.trw = e.target.value; show(); };
  if ($('#trPp')) $('#trPp').onchange = e => { S.trp = e.target.value; show(); };
  if ($('#trS')) $('#trS').onchange = e => { S.trs = e.target.value; show(); };
  if (typeof FORMS !== 'undefined' && !FORMS && typeof loadForms === 'function' && !S._trFL) { S._trFL = 1; loadForms().then(() => { S._trFL = 0; if (el.isConnected) show(); }).catch(() => { S._trFL = 0; }); }
  if ($('#trF')) $('#trF').onchange = e => { S.trf = e.target.value; show(); };
  if ($('#trTo')) $('#trTo').onchange = e => { S.trto = e.target.value; show(); };
  if ($('#trT')) $('#trT').onchange = e => { S.trt = e.target.value; show(); };
  $$('[data-tt]', el).forEach(b => b.onclick = () => { S.trt = b.dataset.tt; S.trPick = 1; show(); setTimeout(() => { const c = $('.trv'); if (c) c.scrollIntoView({ behavior: 'smooth' }); }, 50); });
  if ($('#trP')) $('#trP').onclick = async () => {
    const imgs = await lhImgs(); const sg = await trSigs(((S.staff || []).find(x => x.name === S.trt) || {}).dept);
    const html = docHTML(trBody(S.trt, RG, trData(S.trt, RG)) + trSignBlock(S.trt, sg), imgs, `تقرير أعمال ${S.trt} ${RG.label}`);
    const w = window.open('', '_blank'); if (!w) { toast('اسمحي بالنوافذ المنبثقة لهذا الموقع ثم أعيدي المحاولة', 1); return; }
    w.document.write(html); w.document.close(); setTimeout(() => w.print(), 700);
  };
}

/* ================================================================== استمارة تقييم الأداء السنوي (العادية) — تقدير مقترح
   يُبنى على متوسط تقديرات الحضور الصفي (المنسقة والنائب والمديرة) لمعايير الحصة، وعلى الأعمال التي وثّقتها المعلمة خلال الفترة.
   الدرجة مقترحة فقط، ويمكن تعديلها قبل الطباعة. */
const TR_BAND = p => p >= 90 ? 'ممتاز' : p >= 80 ? 'جيد جداً' : p >= 70 ? 'جيد' : p >= 60 ? 'مقبول' : 'ضعيف';
const TR_RT = [100, 92, 84, 74, 62];   // سلّم الحضور الصفي: مستكملة ومبتكرة … غير متوفرة (5 = لم يُقس)
const TR_VD = { 1: 'التخطيط', 2: 'تنفيذ الدرس', 3: 'الإدارة الصفية وبيئة التعلم', 4: 'التقويم' };
const TR_OV = {};
/* مشاركات الطالبات الخارجية (3 درجات من مجال إشراك الطلبة): جائزة/مركز على مستوى الدولة أو دولي = 3 · مشاركة دولية = 2.5 · مشاركة على مستوى الدولة = 2 · مدرسية = 1 · لا شيء = 0.5
   أنشطة مدرسية سُجّلت خطأً على مستوى الدولة تُحسب مدرسية */
/* كثيرات الغياب بحسب متابعة النائب الأكاديمي — مؤقتاً حتى وصول كشف الغياب من السكرتارية */
const TR_ABS_HIGH = ['هند خالد', 'سابرينا حمدان', 'سعيدة خليلي'];
const TR_SCHOOL_ONLY = /يوم فيزيائي|من الشيماء (ال[ىي]|إلى) قطر/;
function trExt(name, D, inM) {
  const L = D.ach.map(r => ({ k: r.d.kind || '', l: r.d.lvl || '', n: r.d.name || '', res: r.d.res || '' }))
    .concat(S.records.filter(r => r.item === 'ACH' && r.d && r.d.sup === name && inM(r) && !/معلم|تدريب/.test((r.d.field || '') + ' ' + (r.d.name || '')) && (!r.d.who || /طالب/.test(r.d.who))).map(r => ({ k: r.d.c || '', l: r.d.lvl || '', n: r.d.name || '', res: r.d.res || '' })));
  let best = { v: 0.5, why: 'لا توجد مشاركات للطالبات في مسابقات خارجية' };
  L.forEach(x => { const win = /إنجاز/.test(x.k), sch = TR_SCHOOL_ONLY.test(x.n) || /المدرسة/.test(x.l), intl = /دولي|الدولية/.test(x.l + ' ' + x.n), st = /الدولة|المدارس/.test(x.l);
    const v = sch ? 1 : win && (intl || st) ? 3 : intl ? 2.5 : st ? 2 : 1;
    if (v > best.v) best = { v, why: (win ? 'إنجاز: ' : 'مشاركة: ') + x.n + (x.res && x.res !== '-' && x.res !== '0' ? ' (' + x.res + ')' : '') }; });
  return best;
}
/* المنسقة في تقييم الأداء: تُحسب لها جميع أنشطة القسم وإجراءاته (سبع سنابل والميزان) دون تكرار،
   ويُعدّ حضورها الصفي «مستكملة وفاعلة» في جميع البنود (لا تُمنح «مبتكرة») */
const trIsCoord = name => ((S.staff || []).find(x => x.name === name) || {}).role === 'منسقة';
function trCoordD(name, rng, D) {
  const dept = ((S.staff || []).find(x => x.name === name) || {}).dept;
  const inM = r => { const d = String(r.date || '').slice(0, 10); return d >= rng.from && d <= rng.to; };
  const dp = its => S.records.filter(r => its.includes(r.item) && r.d && r.dept === dept && inM(r));
  const uniq = (L, key) => { const seen = {}; return L.filter(r => { const k = key(r); return seen[k] ? false : (seen[k] = 1); }); };
  const nz = x => String(x || '').replace(/\s+/g, ' ').trim();
  const X = Object.assign({}, D);
  X.ta = uniq(dp(['TA', 'AC']), r => nz(r.d.name || r.d.title || r.id) + '|' + String(r.date).slice(0, 10));
  X.sen = dp(['SEN']); X.sfb = dp(['SFB', 'SAN', 'SAC']); X.rf = dp(['SRF']); X.pa = dp(['TPA']);
  X.paa = X.ta.filter(isPaAct);
  X.vis = []; X.coordVis = true;
  return X;
}
/* المعلمة في تقييم الأداء: تُضاف أعمالها التي سجّلتها المنسقة باسمها أو باسم «جميع أعضاء القسم»:
   الأنشطة (AC) وبرامج رفع التحصيل والرعاية (RA) والتواصل مع أولياء الأمور (PA) — دون تكرار ما سجّلته بنفسها */
function trTeachX(name, rng, D) {
  const dept = ((S.staff || []).find(x => x.name === name) || {}).dept, ALL = REF.ALL_MEMBERS || 'جميع أعضاء القسم';
  const inM = r => { const d = String(r.date || '').slice(0, 10); return d >= rng.from && d <= rng.to; };
  const nz = x => String(x || '').replace(/\s+/g, ' ').trim(), mine = new Set(D.ta.map(r => nz(r.d.name)));
  const hit = v => { v = String(v || ''); return v.includes(name) || v.includes(ALL); };
  const ac = S.records.filter(r => r.item === 'AC' && r.d && r.dept === dept && inM(r) && [r.d.e1, r.d.e2, r.d.e3].some(hit) && !mine.has(nz(r.d.name)));
  const ra = S.records.filter(r => r.item === 'RA' && r.d && r.dept === dept && inM(r) && hit(r.d.by)).map(r => Object.assign({}, r, { d: Object.assign({ name: r.d.item }, r.d) }));
  const pa = S.records.filter(r => r.item === 'PA' && r.d && r.dept === dept && inM(r) && String(r.d.by || '').includes(name));
  const X = Object.assign({}, D, { tX: true });
  /* زيارات صفية مسجّلة بلا تقدير للبنود (مثل المستوردة من تقارير المنسقات): تُحسب «مستكملة وفاعلة» في جميع البنود */
  const seenV = new Set(D.vis.map(r => String(r.date).slice(0, 10)));
  const unr = S.records.filter(r => ['V', 'VPV', 'PRV', 'LVV', 'TVR'].includes(r.item) && r.d && r.d.t === name && inM(r) && !(r.d.rt && Object.values(r.d.rt).some(v => v != null && +v < 5)))
    .filter(r => { const k = String(r.date).slice(0, 10); return seenV.has(k) ? false : (seenV.add(k), true); })
    .map(r => Object.assign({}, r, { d: Object.assign({}, r.d, { rt: new Proxy({}, { get: (o, k) => /^\d+$/.test(String(k)) ? 1 : undefined }) }) }));
  X.vis = D.vis.concat(unr);
  X.ta = D.ta.concat(ac, ra); X.pa = D.pa.concat(pa); X.paa = X.ta.filter(isPaAct);
  return X;
}
function trEval(name, rng, D) {
  if (trIsCoord(name) && !D.coordVis) D = trCoordD(name, rng, D);
  else if (!trIsCoord(name) && !D.tX) D = trTeachX(name, rng, D);
  const mo = Math.max(1, Math.round((new Date(rng.to) - new Date(rng.from)) / 864e5 / 30));
  const F = (typeof FORMS !== 'undefined' && FORMS && FORMS.visit) ? FORMS.visit.items : [];
  const vw = n => n === 1 ? 'زيارة صفية واحدة' : n === 2 ? 'زيارتين صفيتين' : n <= 10 ? `${n} زيارات صفية` : `${n} زيارة صفية`;
  const vAvg = dn => { if (D.coordVis) { const n = F.filter(it => it.d === TR_VD[dn]).length; return n ? { p: TR_RT[1], n } : null; } const xs = []; D.vis.forEach(r => F.forEach((it, i) => { const k = r.d.rt[i]; if (it.d === TR_VD[dn] && k != null && k < 5) xs.push(TR_RT[k]); })); return xs.length ? { p: xs.reduce((a, b) => a + b, 0) / xs.length, n: xs.length } : null; };
  const wk = (n, target) => 72 + 28 * Math.min(1, n / Math.max(1, target));
  const nPA = D.pa.reduce((a, r) => a + (+r.d.n || (r.d.stu && r.d.stu.length) || 1), 0);
  const presWS = D.ws.filter(r => r.d.role === 'قدّمتُ لتطوير الزملاء').length;
  const abs = D.ds.reduce((a, r) => a + (r.d.abs || []).filter(x => x.type !== 'مرضي').length, 0);
  const absAll = D.ds.reduce((a, r) => a + (r.d.abs || []).length, 0);
  const inM = r => { const d = String(r.date || '').slice(0, 10); return d >= rng.from && d <= rng.to; };
  const prq = S.records.filter(r => r.item === 'PRQ' && r.d && r.d.t === name && !/rej|ref/.test(r.d.st || '') && inM(r)), prqH = Math.round(prq.reduce((a, r) => a + (+r.d.h || 0), 0) * 100) / 100;
  const nVis = D.vis.length;
  const vSrc = v => D.coordVis ? 'الحضور الصفي: الأدلة مستكملة وفاعلة (للمنسقة)، مع أعمال القسم وإجراءاته' : `متوسط تقديرات ${vw(nVis)} (${v.n} تقديراً)`;
  const mix = (v, w, wv) => v ? { p: v.p * wv + w * (1 - wv), src: vSrc(v) } : null;
  const rows = TR_DOM.map(([n, t, w]) => {
    let o = null, ev = [];
    if (n === 1) { const v = vAvg(1); o = v ? { p: v.p, src: vSrc(v) } : null; }
    if (n === 2) { const c = D.ta.length + D.sen.length; ev.push(`${D.ta.length} نشاطاً وبرنامجاً`, `${D.sen.length} حصة إثرائية`); o = mix(vAvg(2), wk(c, mo * 2), 0.8) || (c ? { p: Math.min(88, wk(c, mo * 2)), src: 'الأعمال الموثّقة فقط (لا توجد زيارات صفية في الفترة)' } : null); }
    if (n === 3) { ev.push(`${D.rf.length} شهادة تعزيز للطالبات`); o = mix(vAvg(3), wk(D.rf.length, mo), 0.85); }
    if (n === 4) { const c = D.sen.length + D.sfb.length; ev.push(`${D.sfb.length} تغذية راجعة وتحليل نتائج`, `${D.sen.length} حصة إثرائية`); o = mix(vAvg(4), wk(c, mo * 2), 0.8) || (c ? { p: Math.min(88, wk(c, mo * 2)), src: 'الأعمال الموثّقة فقط (لا توجد زيارات صفية في الفترة)' } : null); }
    if (n === 5) { const c = D.pv.length + D.host.length + D.ws.length + D.ex.length + D.tex.length; ev.push(`${D.pv.length + D.host.length} زيارة تبادلية`, D.tex.length ? `${D.tex.length} فعالية تبادلية` : '', `${D.ws.length + D.ex.length} ورشة وبرنامج`, presWS ? `قدّمت ${presWS} لزميلاتها` : ''); o = { p: Math.min(100, wk(c, mo * 1.5) + (presWS ? 5 : 0)), src: 'الأعمال الموثّقة' }; }
    if (n === 6) { ev.push(nPA ? `تواصل مع أولياء أمور ${nPA} طالبة` : '', D.paa.length ? `${D.paa.length} من أنشطة الشراكة مع أولياء الأمور` : '', D.ach.length ? `${D.ach.length} إنجاز ومشاركة` : ''); o = { p: wk(D.pa.length + D.paa.length + D.ach.length, mo * 2), src: 'الأعمال الموثّقة' }; }
    if (n === 7) { ev.push(`${D.tas.length} تكليفاً`, `${D.ini} مبادرة`); o = { p: Math.max(50, Math.min(100, 85 + 15 * Math.min(1, (D.tas.length + D.ini) / mo) - 4 * abs)), src: 'التكليفات والمبادرات والانضباط' }; }
    const key = name + '|' + rng.from + '|' + rng.to + '|' + n;
    let sug = o ? Math.round(o.p / 100 * w * 2) / 2 : null;
    if (n === 2 && o) { const X = trExt(name, D, inM); sug = Math.round((o.p / 100 * (w - 3) + X.v - 0.5) * 2) / 2; ev.push(`المسابقات الخارجية: ${X.v} من 3 — ${X.why}`, 'خصم نصف درجة: مهارات التفكير العليا (بحاجة دائمة إلى صقل)'); }
    if (n === 5 && sug != null) { const myDept = ((S.staff || []).find(x => x.name === name) || {}).dept;
      const fx = r => r.item === 'TWS' && r.d && r.d.role === 'قدّمتُ لتطوير الزملاء' && /المدارس الأخرى/.test(r.d.aud || '') && inM(r);
      const own5 = D.ws.some(r => fx(Object.assign({ item: 'TWS' }, r))), dep5 = S.records.find(r => fx(r) && r.dept === myDept && r.d.t !== name);
      if (own5) ev.push('قدّمت ملتقى لمعلمات المدارس الأخرى'); else if (dep5) ev.push(`شاركت في ملتقى القسم «${dep5.d.title}» لمعلمات المدارس الأخرى`);
      else if (!presWS && !D.wsC.length) sug = Math.min(sug, w - 0.5); }
    if (n === 7 && sug != null) { const ex = Math.max(0, prq.length - mo); if (ex) sug = Math.max(w * 0.5, sug - 0.5 * ex);
      if (TR_ABS_HIGH.includes(name)) { sug = Math.max(w * 0.5, sug - 1.5); ev.push('كثرة الغياب (بحسب متابعة النائب الأكاديمي) — خصم 1.5'); } ev.push(prq.length ? `الاستئذان: ${prq.length} مرة (${prqH} ساعة)${ex ? ' — خصم ' + ex * 0.5 + ' لما زاد على استئذان شهرياً' : ''}` : 'الاستئذان: لا يوجد', absAll ? `أيام الغياب: ${absAll}${abs ? ' (غير مرضي: ' + abs + ')' : ' (مرضي)'}` : 'أيام الغياب المسجّلة: لا يوجد'); }
    const val = TR_OV[key] != null ? TR_OV[key] : sug;
    return { n, t, w, sug, val, key, src: o ? o.src : 'لا تتوفر بيانات كافية — يُستكمل بالحضور الصفي', ev: ev.filter(x => x && !/(^|\s)0\s/.test(x)) };
  });
  const have = rows.filter(r => r.val != null), tot = have.reduce((a, r) => a + r.val, 0), wSum = have.reduce((a, r) => a + r.w, 0);
  const pct = wSum ? tot / wSum * 100 : 0;
  return { rows, tot, wSum, pct, band: wSum ? TR_BAND(trH(pct)) : '—', missing: rows.filter(r => r.val == null).map(r => r.n) };
}
function trEvalHTML(name, rng, E, live) {
  const st = (S.staff || []).find(x => x.name === name) || {};
  const num = v => v == null ? '—' : (Math.round(v * 2) / 2).toString();
  return `<div class="ev-f">
    <h2 style="margin:0 0 2px;text-align:center;color:#7A1F33">استمارة تقييم الأداء السنوي للمعلمة — تقدير مقترح</h2>
    <div style="text-align:center;font-size:12.5px;color:#555;margin-bottom:8px">أ. ${esc(name)} — ${esc(st.dept || '')} — ${esc(rng.label)}</div>
    ${live ? '<div class="note noprint" style="margin-bottom:8px">الدرجات مقترحة: تُبنى على متوسط تقديرات الحضور الصفي لمعايير الحصة (التخطيط، وتنفيذ الدرس، والإدارة الصفية، والتقويم)، وعلى ما وثّقته المعلمة خلال الفترة. يمكنكِ تعديل أي درجة قبل الطباعة.</div>' : ''}
    <table class="ev-t"><tr><th style="width:30%">المعيار</th><th style="width:8%">الوزن</th><th>أساس التقدير والشواهد</th><th style="width:12%">الدرجة</th></tr>
    ${E.rows.map(r => `<tr><td><b>${r.n}. ${esc(r.t)}</b></td><td class="c">${r.w}</td><td style="font-size:12px">${esc(r.src)}${r.ev.length ? `<div style="color:#666">${esc(r.ev.join('، '))}</div>` : /الأعمال/.test(r.src) ? '<div style="color:#8A4A08">لم يُوثَّق خلال الفترة</div>' : ''}</td>
      <td class="c">${live ? `<input type="number" class="ev-in" data-k="${esc(r.key)}" min="0" max="${r.w}" step="0.5" value="${r.val == null ? '' : num(r.val)}" placeholder="—">${r.sug != null && r.val !== r.sug ? `<div style="font-size:10px;color:#888">المقترح ${num(r.sug)}</div>` : ''}` : `<b>${num(r.val)}</b>`}</td></tr>`).join('')}
    <tr class="ev-sum"><td colspan="2"><b>المجموع</b></td><td>${E.missing.length ? `<span style="font-size:11.5px;color:#8A4A08">احتُسب من ${E.wSum} درجة لعدم توفر بيانات المعيار ${E.missing.join(' و')}</span>` : ''}</td><td class="c"><b>${num(E.tot)} / ${E.wSum}</b></td></tr>
    <tr class="ev-sum"><td colspan="3"><b>النسبة والتقدير العام</b></td><td class="c"><b>${trH(E.pct)}% — ${E.band}</b></td></tr></table>
    ${live ? `<div class="actions noprint" style="margin-top:8px"><button class="btn sec" id="evRst">العودة للدرجات المقترحة</button><button class="btn" id="evPr">طباعة الاستمارة</button></div>` : ''}</div>`;
}
function trEvBind(box, name, rng) {
  const D = trData(name, rng);
  $$('.ev-in', box).forEach(i => i.onchange = () => { const v = i.value === '' ? null : Math.max(0, Math.min(+i.max, +i.value)); if (v == null) delete TR_OV[i.dataset.k]; else TR_OV[i.dataset.k] = v; box.innerHTML = trEvalHTML(name, rng, trEval(name, rng, D), true); trEvBind(box, name, rng); });
  const rs = $('#evRst', box); if (rs) rs.onclick = () => { Object.keys(TR_OV).filter(k => k.startsWith(name + '|' + rng.from + '|' + rng.to + '|')).forEach(k => delete TR_OV[k]); box.innerHTML = trEvalHTML(name, rng, trEval(name, rng, D), true); trEvBind(box, name, rng); };
  const pr = $('#evPr', box); if (pr) pr.onclick = async () => {
    const imgs = await lhImgs(); const sg = await trSigs(((S.staff || []).find(x => x.name === name) || {}).dept);
    const css = '<style>.ev-t{width:100%;border-collapse:collapse}.ev-t th,.ev-t td{border:1px solid #999;padding:5px 6px;font-size:12px;vertical-align:top}.ev-t th{background:#7A1F33;color:#fff}.ev-t .c{text-align:center}.ev-sum td{background:#F6EFE3}</style>';
    const html = docHTML(css + trEvalHTML(name, rng, trEval(name, rng, D), false) + trSignBlock(name, sg), imgs, `استمارة تقييم ${name} ${rng.label}`);
    const w = window.open('', '_blank'); if (!w) { toast('اسمحي بالنوافذ المنبثقة لهذا الموقع ثم أعيدي المحاولة', 1); return; }
    w.document.write(html); w.document.close(); setTimeout(() => w.print(), 700);
  };
}

/* ================================================================== متوسط تقديرات الحضور الصفي
   لكل معيار من معايير استمارة الحضور الصفي: تقدير المنسقة والنائب الأكاديمي ومديرة المدرسة خلال الفترة، والمتوسط العام لها جميعاً
   (السلّم: مستكملة وفاعلة ومبتكرة 100 · مستكملة وفاعلة 88 · معظم الأدلة 75 · بعض الأدلة 60 · غير متوفرة 45؛ «لم يتم قياسه» لا يُحتسب) */
const trSrc = r => r.item === 'V' ? 'c' : r.item === 'VPV' ? 'v' : r.item === 'PRV' ? 'p' : r.item === 'LVV' ? (r.d.k === 'pr' ? 'p' : 'v') : r.item === 'TVR' ? (r.d.src === 'V' ? 'c' : r.d.src === 'PRV' ? 'p' : 'v') : '';
const trBand = p => p == null ? '' : p >= 90 ? '#DFF2E6' : p >= 80 ? '#EEF6DA' : p >= 70 ? '#FFF4D6' : p >= 60 ? '#FCE6D4' : '#F9DADA';
/* التقدير بالكسور كما هو: نصف يبقى نصفاً، والربع يُجبر إلى أقرب نصف (95.5 تبقى 95.5) */
const trH = x => Math.round(x * 2) / 2;
function trVisHTML(D) {
  const F = (typeof FORMS !== 'undefined' && FORMS && FORMS.visit) ? FORMS.visit.items : null;
  const head = '<div class="h2" style="font-weight:bold;color:#7A1F33;margin:10px 0 4px">متوسط تقديرات الحضور الصفي (المنسقة والنائب الأكاديمي ومديرة المدرسة)</div>';
  if (!D.vis.length) return head + '<div style="color:#888;font-size:12px;margin-bottom:6px">لا توجد زيارات صفية مقدَّرة خلال الفترة.</div>';
  if (!F) return head + '<div style="color:#888;font-size:12px">جارٍ تحميل معايير الحضور الصفي…</div>';
  const SRC = [['c', 'المنسقة'], ['v', 'النائب'], ['p', 'المديرة']], n = {}; SRC.forEach(([k]) => n[k] = D.vis.filter(r => trSrc(r) === k).length);
  const avg = (i, k) => { const xs = []; D.vis.forEach(r => { if (k && trSrc(r) !== k) return; const v = r.d.rt[i]; if (v != null && +v < 5) xs.push(TR_RT[+v]); }); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
  const cell = p => `<td style="text-align:center;background:${trBand(p)}">${p == null ? '—' : Math.round(p) + '%'}</td>`;
  let lastD = '', rows = '';
  const doms = [...new Set(F.map(x => x.d))];
  doms.forEach(dn => { const ix = F.map((x, i) => i).filter(i => F[i].d === dn);
    const dAvg = k => { const xs = ix.map(i => avg(i, k)).filter(x => x != null); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
    rows += `<tr style="font-weight:bold"><td style="background:#F6EFE3">${esc(dn)}</td>${SRC.map(([k]) => n[k] ? cell(dAvg(k)) : '<td style="text-align:center;color:#aaa">—</td>').join('')}${cell(dAvg(null))}</tr>`;
    ix.forEach(i => { rows += `<tr><td style="font-size:11px;padding-right:12px">${esc(F[i].c)}</td>${SRC.map(([k]) => n[k] ? cell(avg(i, k)) : '<td style="text-align:center;color:#aaa">—</td>').join('')}${cell(avg(i, null))}</tr>`; }); });
  const all = []; D.vis.forEach(r => F.forEach((x, i) => { const v = r.d.rt[i]; if (v != null && +v < 5) all.push(TR_RT[+v]); }));
  const tot = all.length ? all.reduce((a, b) => a + b, 0) / all.length : null;
  return head + `<div style="font-size:11.5px;margin-bottom:4px">عدد الزيارات المقدَّرة: ${SRC.map(([k, l]) => `${l} (${n[k]})`).join(' · ')} — المتوسط العام لجميع الزيارات: <b>${tot == null ? '—' : Math.round(tot) + '% (' + TR_BAND(Math.round(tot)) + ')'}</b></div>
  <table><tr><th style="width:52%">المعيار</th>${SRC.map(([, l]) => `<th>${l}</th>`).join('')}<th>المتوسط</th></tr>${rows}</table>
  <div style="font-size:10px;color:#666;margin:3px 0 8px">مستكملة وفاعلة ومبتكرة = ${TR_RT[0]}% · مستكملة وفاعلة = ${TR_RT[1]}% · تتوفر معظم الأدلة = ${TR_RT[2]}% · تتوفر بعض الأدلة = ${TR_RT[3]}% · غير متوفرة = ${TR_RT[4]}%؛ ولا يُحتسب «لم يتم قياسه».</div>`;
}

/* تقارير أعمال المعلمات للنائب الأكاديمي: مربع لكل قسم (المنسقة ثم معلماتها، ولكل منها تقديرها وزر «عرض»)،
   والضغط على «عرض» يفتح تقرير أعمالها كاملاً أسفل الصفحة بالنموذج نفسه الذي تراه المعلمة */
function A_trep(el) { trPage(el, null); }
function trGridHTML(RG, chip) {
  const ST = (S.staff || []).filter(s => s.name && s.dept), depts = [...new Set(ST.map(s => s.dept))];
  const ev = n => { const D = trData(n, RG), E = trEval(n, RG, D); return { D, p: E.wSum ? trH(E.pct) : null }; };
  const tone = p => p == null ? ['#F1F1F1', '#888'] : p >= 90 ? ['#DFF2E6', '#1F6B3A'] : p >= 80 ? ['#EEF6DA', '#4C6B12'] : p >= 70 ? ['#FFF4D6', '#7A5A06'] : ['#F9DADA', '#8A2B2B'];
  const clsT = { 'مبادرة': ['مبادِرة', '#E4F3EA', '#1F6B3A'], 'مجتهدة': ['مجتهدة', '#E3F2F4', '#1E6670'], 'ضعيف': ['تحتاج دعماً', '#FCEADB', '#8A4A08'] };
  const pill = (t, bg, fg, extra) => `<span style="background:${bg};color:${fg};border-radius:20px;padding:1px 9px;font-size:11px;white-space:nowrap;${extra || ''}">${t}</span>`;
  const row = (s, x, co, lead, i) => { const [bg, fg] = tone(x.p), on = s.name === S.trt && S.trPick, c = clsT[x.D.cls] || clsT['مجتهدة'];
    return `<div style="display:flex;align-items:center;gap:6px;padding:3px 8px;border-radius:9px;background:${on ? '#F3E6D6' : co ? '#F8F2EA' : i % 2 ? '#FBFAF8' : '#fff'}">
      <span style="width:18px;height:18px;border-radius:50%;background:${bg};color:${fg};display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex:none">${co ? '★' : '✓'}</span>
      <span style="flex:1;white-space:nowrap;font-size:13px;${co ? 'font-weight:bold;color:var(--maroon)' : ''}">${esc(s.name)}${co ? ' <small style="color:#A88A55;font-weight:normal">(المنسقة)</small>' : ''}${lead ? ' <span title="المتصدّرة في القسم">🏆</span>' : ''}</span>
      ${co ? '' : pill(c[0], c[1], c[2])}${pill(x.p == null ? '—' : x.p + '%', bg, fg, 'font-weight:bold;min-width:38px;text-align:center')}
      <button data-tt="${esc(s.name)}" style="background:#1B2A4A;color:#fff;border:0;border-radius:20px;padding:2px 11px;font-size:11.5px;cursor:pointer;white-space:nowrap">👁 عرض</button></div>`; };
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px;margin-top:12px">${depts.map(d => {
    const c = ST.find(s => s.dept === d && s.role === 'منسقة');
    const T = ST.filter(s => s.dept === d && s !== c).map(s => ({ s, x: ev(s.name) })).sort((a, b) => (b.x.p == null ? -1 : b.x.p) - (a.x.p == null ? -1 : a.x.p) || b.x.D.work - a.x.D.work);
    const ps = T.map(o => o.x.p).filter(v => v != null), av = ps.length ? trH(ps.reduce((a, b) => a + b, 0) / ps.length) : null, [hb, hf] = tone(av);
    const leadName = T.length && T[0].x.p != null ? T[0].s.name : '';
    return `<div style="border:1px solid #EADFCF;border-radius:16px;padding:10px 10px 8px;background:#fff;box-shadow:0 1px 3px rgba(122,31,51,.06)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;padding:0 4px">
        <span style="font-weight:bold;font-size:15px;color:var(--maroon)">${esc(d)}</span>${pill(av == null ? '—' : 'متوسط القسم ' + av + '%', hb, hf, 'font-weight:bold')}</div>
      ${leadName ? `<div style="font-size:11px;color:#7A5A06;background:#FFF8E6;border-radius:8px;padding:2px 8px;margin:0 2px 5px">🏆 المتصدّرة: أ. ${esc(leadName)} (${T[0].x.p}%)</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:2px">${c ? row(c, ev(c.name), 1, 0, 0) : ''}${T.map((o, i) => row(o.s, o.x, 0, o.s.name === leadName, i)).join('')}</div></div>`; }).join('')}</div>
  <div style="font-size:11px;color:var(--muted);margin-top:6px">النسبة: الدرجة المقترحة للمعلمة في الفترة المختارة (من متوسط تقديرات الحضور الصفي وأعمالها الموثّقة في الميزان وسبع سنابل)، وتفاصيلها في استمارة التقييم أسفل تقريرها. اضغطي «عرض» ليظهر تقريرها أسفل الصفحة.</div>`;
}
