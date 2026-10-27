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
  const teachers0 = members.filter(s => s.role !== 'منسقة').map(s => s.name);
  // معلمات من أقسام بلا منسقة (مثل العلوم العامة) يُتابعن من منسقة هذا القسم
  const extraT = uniq(R('V').filter(r => inP(r.date, P)).map(r => r.d.t)).filter(t => t && t !== coord && !teachers0.includes(t) && ctx.staff.some(s => s.name === t));
  const teachers = [...teachers0, ...extraT];
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
  const isDiag = r => /تشخيص/.test(d(r).ty || ''); const ASd = ASs.filter(isDiag), ASq = ASs.filter(r => !isDiag(r));
  const nAS = ASq.reduce((a, r) => a + (+d(r).n > 0 ? +d(r).n : d(r).nc ? 0 : 1), 0);
  const grpAS = L => { const g = []; L.forEach(r => { const x = d(r), k = [x.ty, x.lvl, x.corr || '', x.note || ''].join('|'); let o = g.find(y => y.k === k); if (!o) g.push(o = { k, x, n: 0, ds: [] }); o.n += +x.n > 0 ? +x.n : x.nc ? 0 : 1; if (x.date) o.ds.push(dm(x.date)); }); return g; };
  const asG = o => o.x.ty + (o.n > 1 ? ` (${o.n})` : '') + ' — ' + o.x.lvl + (o.ds.length ? ` (${o.ds.join('، ')})` : '') + (o.x.corr ? '، ' + o.x.corr : '') + (o.x.note ? ` (${o.x.note})` : '');
  const dgTxt = ASd.length ? 'التقييم التشخيصي — ' + grpAS(ASd).map(o => o.x.lvl + (o.ds.length ? ` (${o.ds.join('، ')})` : '') + (o.x.corr ? '، ' + o.x.corr : '') + (o.x.note ? ` (${o.x.note})` : '')).join('؛ ') + '.' : '';
  T.as_short = ASq.length ? `نفّذ القسم (${nAS}) من التقييمات القصيرة والتطبيقات: ` + grpAS(ASq).map(asG).join('؛ ') + '.' + (dgTxt ? ' إضافةً إلى ' + dgTxt : '') : dgTxt ? 'نُفّذ ' + dgTxt : 'لم تُسجَّل تقييمات قصيرة خلال الفترة.';
  T.as_ach = sec(ASa, r => SEC.AS.tx(d(r)), 'لم تُسجَّل اختبارات تحصيلية خلال الفترة.', 'الاختبارات التحصيلية: ');
  const ASn = AS.filter(r => SEC.AS.an(d(r)));
  T.as_anal = sec(ASn, r => SEC.AS.an(d(r)), 'لم يُسجَّل تحليل للنتائج خلال الفترة.', 'تمت قراءة النتائج وتحليلها: ');

  /* رفع التحصيل */
  const RA = Rp('RA');
  T.ra = sec(RA, r => SEC.RA.tx(d(r)), 'لم تُسجَّل إجراءات لرفع التحصيل خلال الفترة.', 'نفّذ القسم الإجراءات الآتية لرفع التحصيل: ');

  /* التطوير الداخلي */
  const WSall = R('WS').map(r => ({ r, x: d(r), w: SEC.WS.when(d(r)) || r.date }));
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
  const exP = uniq(EX.map(r => String(d(r).name || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim())).length;
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
    const AGl = uniq(vs.map(v => v.subj).filter(Boolean)).sort((a, b) => subjAll.indexOf(a) - subjAll.indexOf(b)); const AG = AGl.join(' و');
    const Vs = uniq(vs.flatMap(v => [v.f1, v.f2]).filter(Boolean).map(coreOf)).join('، و');
    const W = uniq(vs.filter(v => !isFU(v) || v.form).flatMap(v => [v.r1, v.r2, v.r3]).filter(Boolean)).join('، و');
    const X = REF.REC.map((rc, i) => {
      const f = vs.filter(v => isFU(v) && !(v.fu && v.fu.length) && !v.form && [v.r1, v.r2, v.r3].includes(rc));
      if (!f.length) return '';
      const p = f.filter(v => v.st === 'تم التنفيذ جزئياً').length, n = f.filter(v => v.st === 'لم تُنفذ بعد').length;
      if (f.length - p - n > 0) return REF.CRIT[i].done;
      if (p) return 'تحسّن جزئي في ' + REF.CRIT[i].core;
      if (n) return 'ما زالت بحاجة إلى ' + REF.CRIT[i].core;
      return '';
    }).filter(Boolean).join('، و');
    const XF = vs.filter(v => (v.fu || []).length).map(v => { const g = k => v.fu.filter(x => x.st === k).map(x => '«' + String(x.r).trim().replace(/[.،؛\s]+$/, '') + '»');
      const p = [g('تم التنفيذ').length ? 'تم تنفيذ ' + g('تم التنفيذ').join('، و') : '', g('تم التنفيذ جزئياً').length ? 'تحسّن جزئي في ' + g('تم التنفيذ جزئياً').join('، و') : '', g('لم تُنفذ بعد').length ? 'ما زالت بحاجة إلى ' + g('لم تُنفذ بعد').join('، و') : ''].filter(Boolean);
      return p.length ? `وفي متابعة توصيات زيارة ${dm(v.prevDate)} (في زيارة ${dm(v.date)}): ${p.join('؛ و')}.` : ''; }).filter(Boolean).join(' ');
    const Y = (x => x.length ? x.join('؛ ') + '.' : '')(uniq(vs.map(v => String(v.note || '').replace(/\s*\n\s*/g, ' ').trim().replace(/[.。]+$/, '')).filter(Boolean)));
    const z = `• تم الحضور للأستاذة ${t} ${Tt}` + (U ? (U.includes('،') ? ' في الصفوف (' : ' في الصف (') + U + ')' : '') + (AG ? (AGl.length > 1 ? ' في مادتي ' : ' في مادة ') + AG : '') + '.'
      + (Vs ? ' وتميّزت في: ' + Vs + '.' : '') + (W ? ' وأبرز التوصيات: ' + W + '.' : '') + (X ? ' وفي زيارات المتابعة: ' + X + '.' : '') + (XF ? ' ' + XF : '') + (Y ? ' ' + Y : '');
    return { t, c, kul: vs.filter(v => v.kj === 'كلية').length, juz: vs.filter(v => v.kj === 'جزئية').length, fu: vs.filter(isFU).length, z };
  });
  const kjTxt = per => { const k = per.reduce((a, p) => a + p.kul, 0), j = per.reduce((a, p) => a + p.juz, 0), f = per.reduce((a, p) => a + p.fu, 0); const parts = []; if (k || j) parts.push(`كلية: ${k}، جزئية: ${j}`); if (f) parts.push(`منها ${f} من زيارات المتابعة`); return parts.length ? ' (' + parts.join('، ') + ')' : ''; };
  const vN = per.reduce((a, p) => a + p.c, 0), vK = per.filter(p => p.c).length, vMax = Math.max(0, ...per.map(p => p.c));
  T.v_n = vN; T.v_k = vK; T.nteach = NT;
  T.v_sum = !vN ? 'لم تُسجَّل زيارات صفية للمنسقة خلال الفترة.'
    : `نفّذت المنسقة زيارات صفية بلغ عددها (${vN}) ${vN >= 3 && vN <= 10 ? 'زيارات' : 'زيارة'} خلال الفترة، شملت ${vK} من أصل ${NT} معلمات بنسبة ${pct(vK, NT)}${kjTxt(per)}` + (vMax > 1 && per.some(p => p.c && p.c < vMax) ? `، وكانت أكثر المعلمات زيارةً: أ. ${per.filter(p => p.c === vMax).map(p => p.t).join('، ')} (${vMax}).` : (vMax === 1 ? '، بزيارة واحدة لكل معلمة.' : '.'))
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
  const nStu = PAi.reduce((a, r) => a + (+d(r).n > 0 ? +d(r).n : 1), 0);
  T.pa_ind = PAi.length ? `تم التواصل مع أولياء أمور (${nStu}) من الطالبات خلال الفترة، وتحقق الحل أو التحسن في (${solved}) حالة: ` + PAi.map(r => SEC.PA.tx(d(r))).join('؛ ') + '.' : 'لم يُسجَّل تواصل فردي مع أولياء الأمور خلال الفترة.';
  T.pa_ev = sec(PAe, r => SEC.PA.tx(d(r)), 'لم تُسجَّل فعاليات أو مبادرات لأولياء الأمور خلال الفترة.', 'الفعاليات والمبادرات المقدَّمة لأولياء الأمور بمشاركة القسم: ');
  T.pa_ind_n = PAi.length; T.pa_ev_n = PAe.length;

  /* المصادر والتعليم الإلكتروني */
  const LR = Rp('LR');
  T.lrc = sec(LR.filter(r => d(r).k === 'تفعيل مركز مصادر التعلم'), r => SEC.LR.tx(d(r)), 'لم يُسجَّل تفعيل لمركز مصادر التعلم خلال الفترة.', 'فعّلت معلمات القسم مركز مصادر التعلم: ');
  const EL = LR.filter(r => d(r).k === 'توظيف أدوات التعليم الإلكتروني');
  const elBy = [REF.ALL_MEMBERS, 'القسم', coord, ...teachers].map(t => ({ t, tools: uniq(EL.filter(r => d(r).t === t).map(r => d(r).e + ((x => x ? ` (${x})` : '')([d(r).s ? (/^الصف/.test(d(r).s) ? d(r).s : 'الصف ' + d(r).s) : '', d(r).nd ? '' : dm(r.date)].filter(Boolean).join('، '))))) })).filter(x => x.tools.length);
  T.el_n = elBy.reduce((a, x) => a + x.tools.length, 0);
  T.elearn = T.el_n ? 'وظّفت معلمات القسم أدوات التعليم الإلكتروني: ' + elBy.map(x => (x.t === REF.ALL_MEMBERS ? 'جميع معلمات القسم' : x.t === 'القسم' ? 'القسم' : `أ. ${x.t}`) + `: ${x.tools.join('، ')}`).join('؛ ') + '.' : 'لم يُسجَّل توظيف لأدوات التعليم الإلكتروني خلال الفترة.';

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

  /* ---------- ما تسجّله المعلمات بأنفسهن (الميزان برقم المعلمة) ---------- */
  {
    const TT = it => ctx.recs.filter(r => r.item === it && inP(r.date, P) && r.d);
    const mineD = it => TT(it).filter(r => r.dept === dept || (extraT.includes(r.d.t)));
    const lst = a => (Array.isArray(a) ? a : [a]).filter(Boolean).map(x => String(x).replace(/[.،؛\s]+$/, ''));
    const add = (k, txt) => { if (!txt) return; T[k] = /^لم|^لا توجد/.test(T[k] || '') ? txt : (T[k] ? T[k] + ' ' + txt : txt); };
    const nz = s => String(s || '').replace(/\s+/g, ' ').trim();
    const dateTxt = d0 => d0 ? ` (${dm(d0)})` : '';
    // الزيارات التبادلية التي سجّلتها معلمات القسم
    const PVt = mineD('TPV');
    if (PVt.length) add('ov_peer', `وسجّلت معلمات القسم (${PVt.length}) ${PVt.length >= 3 && PVt.length <= 10 ? 'زيارات تبادلية' : 'زيارة تبادلية'}: ` + PVt.map(r => `حضرت أ. ${r.d.t} حصة أ. ${r.d.v}` + (r.d.vdept && r.d.vdept !== dept ? ` (${r.d.vdept})` : '') + dateTxt(r.date) + (lst(r.d.pick).length ? ' لتميّزها في ' + lst(r.d.pick).join('، و') : '') + (lst(r.d.saw).length ? '، واستفادت: ' + lst(r.d.saw).join('، و') : '') + (lst(r.d.apply).length ? '، وستطبّق' + (r.d.how === 'بعد تكييفه' ? ' بعد التكييف' : '') + ': ' + lst(r.d.apply).join('، و') : '')).join('؛ ') + '.');
    // الحرص على التطوير الذاتي: ثلاث زيارات فأكثر في شهر واحد
    const byM = {}; PVt.forEach(r => { const k = r.d.t + '|' + String(r.date).slice(0, 7); byM[k] = (byM[k] || 0) + 1; });
    const keen = uniq(Object.entries(byM).filter(([, n]) => n >= 3).map(([k]) => k.split('|')[0]));
    if (keen.length) add('ov_peer', `وتُعدّ ${keen.map(t => 'أ. ' + t).join(' و')} من الحريصات على التطوير الذاتي، إذ نفّذت ثلاث زيارات تبادلية فأكثر في شهر واحد، بارك الله جهودها.`);
    // توظيف جوانب التميز والاستفادة من الكفاءات
    const host = TT('TPV').filter(r => r.d.vdept === dept);
    const WS = TT('TWS');
    const pres = WS.filter(r => r.dept === dept && r.d.role === 'قدّمتُ لتطوير الزملاء');
    const attOur = WS.filter(r => r.d.role === 'حضرتُ ورشة داخلية' && r.d.bydept === dept && r.d.by !== r.d.t);
    const parts = [];
    const hBy = {}; host.forEach(r => { const o = hBy[r.d.v] = hBy[r.d.v] || { n: 0, deps: new Set(), picks: new Set() }; o.n++; if (r.dept !== dept) o.deps.add(r.dept); lst(r.d.pick).forEach(x => o.picks.add(x)); });
    Object.entries(hBy).forEach(([t, o]) => parts.push(`أ. ${t} من خلال الحضور الصفي، إذ حضرت لها ${o.n === 1 ? 'معلمة واحدة' : o.n === 2 ? 'معلمتان' : '(' + o.n + ') معلمات'}` + (o.deps.size ? ' من ' + (o.deps.size > 1 ? 'أقسام ' : 'قسم ') + [...o.deps].join(' و') : ' من القسم') + (o.picks.size ? ' لتميّزها في ' + [...o.picks].slice(0, 3).join('، و') : '')));
    const used = new Set();
    pres.forEach(r => { const att = attOur.filter(a => a.d.by === r.d.t && nz(a.d.title) === nz(r.d.title)); att.forEach(a => used.add(a.id));
      const deps = uniq(att.map(a => a.dept).filter(x => x !== dept));
      parts.push(`أ. ${r.d.t} بتقديمها ${r.d.type || 'ورشة'} «${nz(r.d.title)}»` + dateTxt(r.date) + (r.d.aud ? `، واستفادت منها ${r.d.aud}` : '') + (deps.length ? `، وحضرتها معلمات من ${deps.length > 1 ? 'أقسام ' : 'قسم '}${deps.join(' و')}` : '')); });
    const restA = {}; attOur.filter(a => !used.has(a.id)).forEach(a => { const k = a.d.by + '|' + nz(a.d.title); const o = restA[k] = restA[k] || { by: a.d.by, title: nz(a.d.title), date: a.date, deps: new Set() }; if (a.dept !== dept) o.deps.add(a.dept); });
    Object.values(restA).forEach(o => parts.push(`أ. ${o.by} بتقديمها ورشة «${o.title}»` + dateTxt(o.date) + (o.deps.size ? ` لمعلمات من ${o.deps.size > 1 ? 'أقسام ' : 'قسم '}${[...o.deps].join(' و')}` : '')));
    T.excel = parts.length ? 'تم توظيف جوانب التميز والاستفادة من كفاءات معلمات القسم: ' + parts.join('؛ و') + '.' : '';
    if (T.excel) add('pd_int', T.excel);
    // ورش حضرتها معلمات القسم
    const inT = WS.filter(r => r.dept === dept && r.d.role === 'حضرتُ ورشة داخلية'), exT = WS.filter(r => r.dept === dept && r.d.role === 'حضرتُ ورشة خارجية');
    if (inT.length) add('pd_int', 'وحضرت معلمات القسم: ' + inT.map(r => `أ. ${r.d.t} ورشة «${nz(r.d.title)}» من تقديم أ. ${r.d.by}` + dateTxt(r.date)).join('؛ ') + '.');
    if (exT.length) add('pd_ext', 'وسجّلت معلمات القسم مشاركتهن في: ' + exT.map(r => `«${nz(r.d.title)}»` + (r.d.place ? ` (${r.d.place})` : '') + (r.d.byx ? ` من تقديم ${r.d.byx}` : '') + ` — أ. ${r.d.t}` + dateTxt(r.date)).join('؛ ') + '.');
    // التواصل مع أولياء الأمور
    const PAt = mineD('TPA');
    if (PAt.length) { const by = {}; PAt.forEach(r => { const o = by[r.d.t] = by[r.d.t] || { n: 0, ways: new Set() }; o.n += +r.d.n > 0 ? +r.d.n : 1; if (r.d.way) o.ways.add(r.d.way); });
      add('pa_ind', 'وسجّلت المعلمات تواصلهن مع أولياء الأمور: ' + Object.entries(by).map(([t, o]) => `أ. ${t} (${o.n}) ${o.ways.size ? '— ' + [...o.ways].join('، ') : ''}`).join('؛ ') + '.'); }
    // الإنجازات والمشاركات
    const AH = mineD('TACH'); const AHw = AH.filter(r => /إنجاز/.test(r.d.kind)), AHp = AH.filter(r => !/إنجاز/.test(r.d.kind));
    const ahTx = r => `«${nz(r.d.name)}»` + (r.d.ent ? ` (${r.d.ent})` : '') + (r.d.res ? `، ${r.d.res}` : '') + ` بإشراف أ. ${r.d.t}` + dateTxt(r.date);
    if (AHw.length) add('ach', 'ومن إنجازات الطالبات بإشراف معلمات القسم: ' + AHw.map(ahTx).join('؛ ') + '.');
    if (AHp.length) add('part', 'وشاركت الطالبات بإشراف معلمات القسم في: ' + AHp.map(ahTx).join('؛ ') + '.');
    // الأنشطة والمبادرات التي سجّلتها المعلمات (عدا ما نُقل من تقارير الربع الأول)
    const TAt = mineD('TA').filter(r => !r.d.q1);
    if (TAt.length) add('ac_int', 'وسجّلت المعلمات: ' + TAt.map(r => `${r.d.kind} «${nz(r.d.name)}» — أ. ${r.d.t}` + dateTxt(r.date)).join('؛ ') + '.');
  }
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
      if (PAi.length) parts.push(`التواصل الفردي مع أولياء أمور (${nStu}) من الطالبات`);
      if (PAe.length) parts.push(`(${PAe.length}) من الفعاليات والمبادرات لأولياء الأمور`);
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
