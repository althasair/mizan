/* الميزان — توليد «تقرير أعمال القسم» بنفس منطق نموذج Excel (v4) */
'use strict';

function getList(l) {
  if (REF.L[l]) return REF.L[l];
  const m = { levels: REF.LEVELS, sections: REF.SECTIONS, prio: REF.PRIO, purpose: REF.PURPOSE, prio_full: REF.PRIO_FULL };
  return m[l] || [];
}
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '0%';
const inP = (d, P) => d && d >= P.from && d <= P.to;
const uniq = a => [...new Set(a)];
const timesWord = c => c === 1 ? 'مرة واحدة' : c === 2 ? 'مرتين' : c <= 10 ? `${c} مرات` : `${c} مرة`;

/** ctx: { dept, P:{name,from,to}, recs (كل سجلات القسم), staff (كل المعلمات), pd, cal, feedback } */
function buildReport(ctx) {
  const { dept, P } = ctx;
  const R = k => ctx.recs.filter(r => r.dept === dept && r.item === k);
  const Rp = k => R(k).filter(r => inP(r.date, P));
  const d = r => (r.d.nd ? Object.assign({}, r.d, { date: '' }) : r.d.date ? r.d : Object.assign({}, r.d, { date: r.date }));
  const nMT = L => L.reduce((a, r) => a + (+r.d.cnt > 1 ? +r.d.cnt : 1), 0);
  const members = ctx.staff.filter(s => s.dept === dept);
  const coord = (members.find(s => s.role === 'منسقة') || {}).name || ctx.coordName || '';
  const teachers = members.filter(s => s.role !== 'منسقة').map(s => s.name);
  const NT = teachers.length;
  const T = {};

  /* التقويم */
  T.calendar = ctx.cal.filter(c => c.from <= P.to && c.to >= P.from).map(c => c.t + ` (${dm(c.from)}` + (c.to > c.from ? '–' + dm(c.to) : '') + ')').join('، ');

  const sec = (list, txf, empty, lead, sep = '؛ ') => list.length ? lead + list.map(txf).join(sep) + '.' : empty;

  /* التخطيط */
  const PL = Rp('PL');
  T.pl_annual = sec(PL.filter(r => d(r).c === 'الخطة السنوية للقسم'), r => SEC.PL.tx(d(r)), 'لم تُسجَّل حالة الخطة السنوية خلال الفترة.', 'الخطة السنوية للقسم: ');
  T.pl_sem = sec(PL.filter(r => d(r).c === 'الخطة الفصلية'), r => SEC.PL.tx(d(r)), 'لم تُسجَّل متابعة الخطط الفصلية خلال الفترة.', 'تمت متابعة تغطية المعايير وفق الخطط الفصلية: ');

  /* التقييمات */
  const AS = Rp('AS'); const prevYr = r => /^نتائج/.test(d(r).lvl || '');
  const ASs = AS.filter(r => SEC.AS.cat(d(r)) === 'قصير'), ASa = AS.filter(r => SEC.AS.cat(d(r)) === 'تحصيلي' && !prevYr(r));
  const nAS = ASs.reduce((a, r) => a + (+d(r).n > 0 ? +d(r).n : 1), 0);
  T.as_short = sec(ASs, r => SEC.AS.tx(d(r)), 'لم تُسجَّل تقييمات قصيرة خلال الفترة.', `نفّذ القسم (${nAS}) من التقييمات القصيرة والتطبيقات: `);
  T.as_ach = sec(ASa, r => SEC.AS.tx(d(r)), 'لم تُسجَّل اختبارات تحصيلية خلال الفترة.', 'الاختبارات التحصيلية: ');
  const ASn = AS.filter(r => SEC.AS.an(d(r)));
  T.as_anal = sec(ASn, r => SEC.AS.an(d(r)), 'لم يُسجَّل تحليل للنتائج خلال الفترة.', 'تمت قراءة النتائج وتحليلها: ');

  /* رفع التحصيل */
  const RA = Rp('RA');
  T.ra = sec(RA, r => SEC.RA.tx(d(r)), 'لم تُسجَّل إجراءات لرفع التحصيل خلال الفترة.', 'نفّذ القسم الإجراءات الآتية لرفع التحصيل: ');

  /* التطوير الداخلي */
  const WSall = R('WS').map(r => ({ r, x: d(r), w: SEC.WS.when(d(r)) }));
  const WS = WSall.filter(o => inP(o.w, P));
  const done = WS.filter(o => (o.x.g || '').startsWith('تمت')), post = WS.filter(o => o.x.g && !(o.x.g || '').startsWith('تمت'));
  const planN = ctx.pd.filter(p => p.dept.split('|').includes(dept) && inP(p.date, P)).length;
  const planDone = WSall.filter(o => inP(o.x.planned, P) && (o.x.g || '').startsWith('تمت') && o.x.b !== REF.OUT_OF_PLAN).length;
  const attK = done.filter(o => o.x.k !== '' && o.x.k != null && +o.x.j > 0);
  const att = attK.length ? attK.reduce((a, o) => a + (+o.x.k), 0) / attK.reduce((a, o) => a + (+o.x.j), 0) : null;
  T.pd_done_n = done.length; T.pd_plan_n = planN; T.pd_plan_done = planDone; T.pd_att = att;
  T.pd_int = (!done.length && !post.length)
    ? 'لم تُسجَّل برامج تطوير مهني داخلية خلال الفترة.' + (planN ? ` (مقرر في خطة القسم (${planN}) من البرامج خلال الفترة ولم تُسجَّل حالة تنفيذه بعد).` : '')
    : (planN ? `نفّذ القسم (${planDone}) من أصل (${planN}) من البرامج المقررة في خطة التطوير المهني خلال الفترة بنسبة ${pct(planDone, planN)}. ` : '')
      + (done.length ? 'قام القسم بتنفيذ: ' + done.map(o => SEC.WS.tx(o.x)).join('؛ ') + '. ' : '')
      + (post.length ? 'كما تم ' + post.map(o => SEC.WS.tx(o.x)).join('؛ ') + '. ' : '')
      + (att != null ? `وبلغت نسبة حضور المعلمات للبرامج المسجَّل فيها عدد الحاضرات ${Math.round(att * 100)}%.` : '');

  /* التطوير الخارجي */
  const EX = Rp('EX'); const allM = [coord, ...teachers].filter(Boolean), NM = allM.length;
  const exK = EX.some(r => d(r).t === REF.ALL_MEMBERS) ? NM : uniq(EX.map(r => d(r).t)).filter(t => allM.includes(t)).length;
  const exP = uniq(EX.map(r => d(r).name)).length;
  T.ex_n = exP; T.ex_k = exK;
  T.pd_ext = !EX.length ? 'لم تُسجَّل مشاركات في برامج تطوير مهني خارجية خلال الفترة.'
    : (NM ? `شاركت ${exK} من أصل ${NM} من أعضاء القسم في برامج تطوير مهني خارجية بنسبة ${pct(exK, NM)}، ` : '') + `بإجمالي (${exP}) ${exP === 1 ? 'برنامج' : 'برامج'}: ` + EX.map(r => SEC.EX.tx(d(r))).join('؛ ') + '.';

  /* الاجتماعات */
  const MT = Rp('MT'); const MTi = MT.filter(r => SEC.MT.io(d(r)) === 'داخلي'), MTe = MT.filter(r => SEC.MT.io(d(r)) === 'خارجي');
  T.mt_int = MTi.length ? `عقد القسم (${nMT(MTi)}) من الاجتماعات الداخلية: ` + MTi.map(r => SEC.MT.tx(d(r))).join('؛ ') + '.' : 'لم تُسجَّل اجتماعات داخلية خلال الفترة.';
  T.mt_ext = MTe.length ? `شارك القسم في (${nMT(MTe)}) من الاجتماعات الخارجية: ` + MTe.map(r => SEC.MT.tx(d(r))).join('؛ ') + '.' : 'لم تُسجَّل اجتماعات خارجية خلال الفترة.';

  /* زيارات القيادة */
  const OV = Rp('OV');
  [['ov_pr', 'pr', 'زارت مديرة المدرسة'], ['ov_vp', 'vp', 'زار نائب المدير للشؤون الأكاديمية'], ['ov_sup', 'sup', 'زار الموجه التربوي']].forEach(([k, c, lab]) => {
    const L = OV.filter(r => SEC.OV.cat(d(r)) === c);
    T[k] = L.length ? `${lab} (${L.length}) من معلمات القسم: ` + L.map(r => SEC.OV.tx(d(r))).join('؛ ') + '.' : 'لا توجد زيارات مسجلة خلال الفترة.';
  });
  const PV = Rp('PV'); const pvMet = PV.filter(r => d(r).yes === 'نعم').length;
  T.ov_peer = PV.length ? `نفّذت معلمات القسم (${PV.length}) من الزيارات التبادلية` + (PV.some(r => d(r).yes) ? `، لبّى (${pvMet}) منها احتياج المعلمة` : '') + ': ' + PV.map(r => SEC.PV.tx(d(r))).join('؛ ') + '.' : 'لم تُسجَّل زيارات تبادلية خلال الفترة.';

  /* الحضور الصفي للمنسقة */
  const V = Rp('V').map(r => ({ ...d(r), date: r.date }));
  const isFU = v => (v.ty || '').includes('متابعة');
  const months = []; { let y = +P.from.slice(0, 4), m = +P.from.slice(5, 7); for (let k = 0; k < 4; k++) { const key = `${y}-${String(m).padStart(2, '0')}`; if (key + '-01' <= P.to) months.push({ key, name: MONTHS[m - 1] }); m++; if (m > 12) { m = 1; y++; } } }
  const subjAll = REF.L.subject_all || [];
  const per = teachers.map(t => {
    const vs = V.filter(v => v.t === t).sort((a, b) => a.date < b.date ? -1 : 1);
    const c = vs.length;
    if (!c) return { t, c, kul: 0, juz: 0, fu: 0, z: `• لم تتم زيارة الأستاذة ${t} خلال الفترة.` };
    const mm = months.map(M => { const l = vs.filter(v => v.date.startsWith(M.key)); return { n: l.length, name: M.name, dates: l.map(v => dm(v.date)).join('، ') }; }).filter(x => x.n);
    const Q = mm.length === 1 ? 'خلال شهر ' : mm.length === 2 ? 'خلال شهري ' : 'خلال أشهر ';
    const Tt = timesWord(c) + ' ' + Q + mm.map(x => x.name).join(' و') + (mm.length === 1 ? ` (${mm[0].dates})` : '، بمعدل ' + mm.map(x => (x.n === 1 ? 'مرة' : x.n === 2 ? 'مرتين' : x.n + ' مرات') + ` في ${x.name} (${x.dates})`).join(' و'));
    const U = REF.SECTIONS.filter(s => vs.some(v => v.s === s)).join('، ');
    const AG = uniq(vs.map(v => v.subj).filter(Boolean)).sort((a, b) => subjAll.indexOf(a) - subjAll.indexOf(b)).join(' و');
    const Vs = uniq(vs.flatMap(v => [v.f1, v.f2]).filter(Boolean).map(coreOf)).join('، و');
    const W = uniq(vs.filter(v => !isFU(v)).flatMap(v => [v.r1, v.r2, v.r3]).filter(Boolean)).join('، و');
    const X = REF.REC.map((rc, i) => {
      const f = vs.filter(v => isFU(v) && [v.r1, v.r2, v.r3].includes(rc));
      if (!f.length) return '';
      const p = f.filter(v => v.st === 'تم التنفيذ جزئياً').length, n = f.filter(v => v.st === 'لم تُنفذ بعد').length;
      if (f.length - p - n > 0) return REF.CRIT[i].done;
      if (p) return 'تحسّن جزئي في ' + REF.CRIT[i].core;
      if (n) return 'ما زالت بحاجة إلى ' + REF.CRIT[i].core;
      return '';
    }).filter(Boolean).join('، و');
    const Y = vs.map(v => v.note).filter(Boolean).join('؛ ');
    const z = `• تم الحضور للأستاذة ${t} ${Tt}` + (U ? (U.includes('،') ? ' في الصفوف (' : ' في الصف (') + U + ')' : '') + (AG ? (AG.includes(' و') ? ' في مادتي ' : ' في مادة ') + AG : '') + '.'
      + (Vs ? ' وتميّزت في: ' + Vs + '.' : '') + (W ? ' وأبرز التوصيات: ' + W + '.' : '') + (X ? ' وفي زيارات المتابعة: ' + X + '.' : '') + (Y ? ' ' + Y : '');
    return { t, c, kul: vs.filter(v => v.kj === 'كلية').length, juz: vs.filter(v => v.kj === 'جزئية').length, fu: vs.filter(isFU).length, z };
  });
  const kjTxt = per => { const k = per.reduce((a, p) => a + p.kul, 0), j = per.reduce((a, p) => a + p.juz, 0), f = per.reduce((a, p) => a + p.fu, 0); const parts = []; if (k || j) parts.push(`كلية: ${k}، جزئية: ${j}`); if (f) parts.push(`منها ${f} من زيارات المتابعة`); return parts.length ? ' (' + parts.join('، ') + ')' : ''; };
  const vN = per.reduce((a, p) => a + p.c, 0), vK = per.filter(p => p.c).length, vMax = Math.max(0, ...per.map(p => p.c));
  T.v_n = vN; T.v_k = vK; T.nteach = NT;
  T.v_sum = !vN ? 'لم تُسجَّل زيارات صفية للمنسقة خلال الفترة.'
    : `نفّذت المنسقة زيارات صفية بلغ عددها (${vN}) زيارة خلال الفترة، شملت ${vK} من أصل ${NT} معلمات بنسبة ${pct(vK, NT)}${kjTxt(per)}، وكانت أكثر المعلمات زيارةً: أ. ${per.filter(p => p.c === vMax).map(p => p.t).join('، ')} (${vMax}).`
      + (per.some(p => !p.c) ? ' ولم تتم زيارة: ' + per.filter(p => !p.c).map(p => p.t).join('، ') + '.' : '');
  T.v_ch = per.map(p => p.z);
  // التوصيات المشتركة (تكررت لدى معلمتين فأكثر)
  const recStats = uniq([...REF.REC, ...V.flatMap(v => [v.r1, v.r2, v.r3]).filter(Boolean)]).map((rc, i) => {
    const l = V.filter(v => !isFU(v) && [v.r1, v.r2, v.r3].includes(rc));
    return { rc, i, n: l.length, k: uniq(l.map(v => v.t)).length };
  });
  T.common = recStats.filter(x => x.k >= 2).map(x => x.rc);
  const CP = Rp('CP');
  const cpTxt = CP.map(r => SEC.CP.tx(d(r))).join('؛ ');
  T.v_common_p = !vN ? '' : (T.common.length ? 'التوصيات المشتركة لمعلمات القسم: ' + T.common.join('؛ ') + '.' : 'لا توجد توصيات مشتركة بين معلمات القسم خلال الفترة.') + (cpTxt ? ' وإجراءات المنسقة: ' + cpTxt + '.' : '');
  T.topRecs = recStats.filter(x => x.n).sort((a, b) => b.n - a.n || b.k - a.k).slice(0, 5);
  T.topStr = REF.CRIT.map((cr, i) => ({ core: cr.core, n: V.filter(v => v.f1 === cr.label || v.f2 === cr.label).length })).filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 5);
  T.perTeacher = per;

  /* الأنشطة */
  const AC = Rp('AC'); const ACi = AC.filter(r => d(r).io !== 'خارجي'), ACe = AC.filter(r => d(r).io === 'خارجي');
  T.ac_int = sec(ACi, r => SEC.AC.tx(d(r)), 'لم تُسجَّل أنشطة داخلية خلال الفترة.', `نفّذ القسم (${ACi.length}) من الأنشطة والمبادرات الداخلية: `);
  T.ac_ext = sec(ACe, r => SEC.AC.tx(d(r)), 'لم تُسجَّل أنشطة خارجية خلال الفترة.', `نفّذ القسم (${ACe.length}) من الأنشطة الخارجية: `);

  /* أولياء الأمور */
  const PA = Rp('PA'); const PAi = PA.filter(r => SEC.PA.ind(d(r))), PAe = PA.filter(r => !SEC.PA.ind(d(r)));
  const solved = PAi.filter(r => ['تم الحل', 'تحسن ملحوظ'].includes(d(r).res)).length;
  T.pa_ind = PAi.length ? `تم التواصل مع أولياء أمور (${PAi.length}) من الطالبات خلال الفترة، وتحقق الحل أو التحسن في (${solved}) حالة: ` + PAi.map(r => SEC.PA.tx(d(r))).join('؛ ') + '.' : 'لم يُسجَّل تواصل فردي مع أولياء الأمور خلال الفترة.';
  T.pa_ev = sec(PAe, r => SEC.PA.tx(d(r)), 'لم تُسجَّل فعاليات أو مبادرات لأولياء الأمور خلال الفترة.', 'قدّم القسم لأولياء الأمور: ');
  T.pa_ind_n = PAi.length; T.pa_ev_n = PAe.length;

  /* المصادر والتعليم الإلكتروني */
  const LR = Rp('LR');
  T.lrc = sec(LR.filter(r => d(r).k === 'تفعيل مركز مصادر التعلم'), r => SEC.LR.tx(d(r)), 'لم يُسجَّل تفعيل لمركز مصادر التعلم خلال الفترة.', 'فعّلت معلمات القسم مركز مصادر التعلم: ');
  const EL = LR.filter(r => d(r).k === 'توظيف أدوات التعليم الإلكتروني');
  const elBy = [REF.ALL_MEMBERS, coord, ...teachers].map(t => ({ t, tools: uniq(EL.filter(r => d(r).t === t).map(r => d(r).e)) })).filter(x => x.tools.length);
  T.el_n = elBy.reduce((a, x) => a + x.tools.length, 0);
  T.elearn = T.el_n ? 'وظّفت معلمات القسم أدوات التعليم الإلكتروني: ' + elBy.map(x => (x.t === REF.ALL_MEMBERS ? 'جميع معلمات القسم' : `أ. ${x.t}`) + `: ${x.tools.join('، ')}`).join('؛ ') + '.' : 'لم يُسجَّل توظيف لأدوات التعليم الإلكتروني خلال الفترة.';

  /* الإنجازات */
  const ACH = Rp('ACH');
  const A1 = ACH.filter(r => SEC.ACH.kind(d(r)) === 1), A2 = ACH.filter(r => SEC.ACH.kind(d(r)) === 2);
  T.ach = sec(A1, r => SEC.ACH.tx(d(r)), 'لا توجد إنجازات (مراكز أو جوائز) مسجلة خلال الفترة.', 'إنجازات القسم خلال الفترة: ');
  T.part = sec(A2, r => SEC.ACH.tx(d(r)), 'لا توجد مشاركات مسجلة خلال الفترة.', 'مشاركات القسم خلال الفترة: ');
  T.ach_n = A1.length; T.part_n = A2.length;

  /* التحديات */
  const CH = Rp('CH');
  T.chal = CH.length ? CH.map(r => SEC.CH.tx(d(r))).join('؛ ') + '.' : 'لا توجد تحديات مسجلة خلال الفترة.';

  /* الأولويات */
  const firstBy = (list, keyf) => { const s = new Set(); return list.filter(r => { const k = keyf(r); if (s.has(k)) return false; s.add(k); return true; }); };
  const RAf = firstBy(RA, r => d(r).item), ACf = firstBy(AC, r => d(r).name);
  T.prio = [1, 2, 3, 4].map(p => {
    const parts = [];
    const ra = RAf.filter(r => (d(r).p ? REF.PRIO.indexOf(d(r).p) + 1 : 1) === p).map(r => d(r).item);
    const ac = ACf.filter(r => SEC.AC.prioFlag(d(r), p)).map(r => `«${d(r).name}»`);
    const ach = ACH.filter(r => d(r).p && REF.PRIO.indexOf(d(r).p) + 1 === p).length;
    if (ra.length) parts.push(ra.join('، ')); if (ac.length) parts.push(ac.join('، ')); if (ach) parts.push(`(${ach}) من الإنجازات والمشاركات`);
    let n = ra.length + ac.length + ach;
    if (p === 2) {
      if (done.length) parts.push(`تنفيذ (${done.length}) من برامج التطوير المهني الداخلية`);
      if (EX.length) parts.push(`مشاركة (${exK}) من المعلمات في برامج تطوير مهني خارجية`);
      if (T.el_n) parts.push(`توظيف (${T.el_n}) من أدوات التعليم الإلكتروني`);
      n += done.length + EX.length + T.el_n;
    }
    if (p === 4) {
      if (PAi.length) parts.push(`التواصل الفردي مع أولياء أمور (${PAi.length}) من الطالبات`);
      if (PAe.length) parts.push(`تقديم (${PAe.length}) من الفعاليات والمبادرات لأولياء الأمور`);
      n += PA.length;
    }
    return { txt: parts.length ? 'تحققت من خلال: ' + parts.join('، ') + '.' : 'لم تُسجَّل إجراءات مرتبطة بهذه الأولوية خلال الفترة.', n };
  });

  /* ملاحظات المنسقة على البنود */
  const isEmpty = x => typeof x === 'string' && /^(لم |لا توجد)/.test(x);
  Rp('SN').forEach(r => { const key = REF.SN_KEYS[d(r).k]; if (!key || T[key] == null) return; const t = String(d(r).t || '').trim().replace(/[.。]?$/, '.');
    T[key] = isEmpty(T[key]) ? t : T[key] + ' ' + t; });

  /* هيكل التقرير الرسمي */
  const rows = [
    ['التخطيط', [['الخطة السنوية للقسم', [T.pl_annual]], ['متابعة الخطط الفصلية', [T.pl_sem]]]],
    ['التحصيل الأكاديمي', [['التقييمات القصيرة', [T.as_short]], ['الاختبارات التحصيلية', [T.as_ach]], ['تحليل وقراءة النتائج', [T.as_anal]], ['إجراءات رفع التحصيل', [T.ra]]]],
    ['التطوير المهني', [['التطوير الداخلي', [T.pd_int]], ['التطوير الخارجي', [T.pd_ext]]]],
    ['الاجتماعات الأكاديمية', [['الخارجية', [T.mt_ext]], ['الداخلية', [T.mt_int]]]],
    ['الزيارات الأكاديمية', [['مدير المدرسة', [T.ov_pr]], ['نائب المدير للشؤون الأكاديمية', [T.ov_vp]], ['الموجه التربوي', [T.ov_sup]],
      ['المنسق', [T.v_sum, ...(vN ? T.v_ch : []), T.v_common_p].filter(Boolean)], ['الزملاء (الزيارات التبادلية)', [T.ov_peer]]]],
    ['الأنشطة المدرسية', [['داخلية', [T.ac_int]], ['خارجية', [T.ac_ext]]]],
    ['الشراكة مع أولياء الأمور', [['التواصل الفردي ومتابعة الطالبات', [T.pa_ind]], ['المجالس والفعاليات والمبادرات وشهادات الشكر', [T.pa_ev]]]],
    ['تفعيل مركز مصادر التعلم', [[null, [T.lrc]]]],
    ['تفعيل التعليم الإلكتروني', [[null, [T.elearn]]]],
    ['الإنجازات والمشاركات', [['الإنجازات (مراكز وجوائز)', [T.ach]], ['المشاركات', [T.part]]]],
    ['تحقيق أولويات المدرسة', REF.PRIO_FULL.map((p, i) => [p, [T.prio[i].txt], 1])],
    ['التحديات والحلول المقترحة', [[null, [T.chal]]]],
  ];

  /* مؤشرات */
  const K = {
    visits: vN, visitedPct: NT ? vK / NT : 0, perTeacher: NT ? vN / NT : 0,
    planPct: planN ? planDone / planN : null, att: att, extPct: NM ? exK / NM : 0,
    meetings: nMT(MT), activities: AC.length, parents: PA.length, achievements: A1.length, participations: A2.length,
    peer: PV.length, peerMet: pvMet, elearn: T.el_n, challenges: CH.length, records: ctx.recs.filter(r => r.dept === dept && inP(r.date || SEC.WS.when(r.d), P)).length,
    commonRecs: T.common.length, cpActions: CP.length,
  };
  return { dept, P, coord, NT, teachers, T, rows, K };
}
