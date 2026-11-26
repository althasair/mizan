/* الميزان — توليد «تقرير أعمال القسم» بنفس منطق نموذج Excel (v4) */
'use strict';

function getList(l) {
  if (REF.L[l]) return REF.L[l];
  const m = { levels_tr: ['الصف العاشر', 'الحادي عشر — المسار العلمي', 'الحادي عشر — المسار الأدبي', 'الحادي عشر — المسار التكنولوجي', 'الثاني عشر — المسار العلمي', 'الثاني عشر — المسار الأدبي', 'الثاني عشر — المسار التكنولوجي', 'جميع المستويات'], levels: REF.LEVELS, sections: REF.SECTIONS, prio: REF.PRIO, purpose: REF.PURPOSE, prio_full: REF.PRIO_FULL };
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
  { const plA = PL.filter(r => d(r).c === 'الخطة السنوية للقسم'), ap = typeof aplReport === 'function' ? aplReport(ctx.recs, dept, P) : '';
    T.pl_annual = ap ? (plA.length ? sec(plA, r => SEC.PL.tx(d(r)), '', 'الخطة السنوية للقسم: ') + ' ' : '') + ap
      : sec(plA, r => SEC.PL.tx(d(r)), 'لم تُسجَّل حالة الخطة السنوية خلال الفترة.', 'الخطة السنوية للقسم: '); }
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
  /* قراءة نتائج القسم المعتمدة من المنسقة في سبع سنابل: مؤشرات مختصرة + مقترحات الفترة القادمة */
  /* مؤشرات القراءة المعتمدة (جدول ملوّن + رسم 70% و90% + فئات الطالبات) تُضاف داخل بند «تحليل وقراءة النتائج» تحت ما كتبته المنسقة؛
     من آخر قراءة اعتمدتها المنسقة حتى نهاية الفترة (وإن اعتُمدت قبل الفترة) */
  { const RQ = ctx.recs.filter(r => r.dept === dept && r.item === 'SRQ' && r.d && (r.d.rows || []).length && String(r.date).slice(0, 10) <= P.to).sort((a, b) => (+b.d.per || 0) - (+a.d.per || 0) || String(b.date).localeCompare(String(a.date)) || String(b.at).localeCompare(String(a.at)));
    if (RQ.length) { const q = RQ[0].d; T.as_anal = { res: q.rows, pn: q.pn, pre: /^لم /.test(T.as_anal) ? '' : T.as_anal }; T.as_next = (q.so || []).length ? { lines: q.so.map(x => ({ st: 0, tx: String(x).replace(/[.،؛\s]+$/, '') + '.' })) } : null; } }
  /* تحليل النتائج الذي سجّلته المعلمات في سبع سنابل */
  { const SA = ctx.recs.filter(r => r.dept === dept && r.item === 'SAN' && r.d && inP(String(r.date).slice(0, 10), P));
    if (SA.length) { const by = {}; SA.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
      const tx = `حلّلت معلمات القسم نتائج (${SA.length}) من الشعب وحدّدن المهارات المفقودة والمستهدفات في منصة سبع سنابل: ` + Object.entries(by).map(([t, L]) => `أ. ${t} (${uniq(L.map(r => r.d.s)).join('، ')})`).join('؛ ') + '.';
      if (T.as_anal && typeof T.as_anal === 'object') T.as_anal.pre = (T.as_anal.pre ? T.as_anal.pre + ' ' : '') + tx;   // مع جدول القراءة المعتمدة: لا يُستبدل الجدول
      else T.as_anal = /^لم /.test(T.as_anal) ? tx : T.as_anal + ' ' + tx; } }

  /* رفع التحصيل — بنقاط عامة مرتّبة: بلا أسماء طالبات ولا تكرار (الإجراء المتكرر يُذكر مرة واحدة مع عدده ومستوياته) */
  const RA = Rp('RA');
  { const L = [], nk = x => String(x || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^ء-ي0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const GR = { '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر' };
    const lvOf = s => { const m = String(s || '').match(/^(1[012])/); return m ? GR[m[1]] : ''; };
    const lvTx = (A, t) => { const u = [...new Set(A.filter(Boolean))].filter(x => !(t && String(t).includes(x))); if (!u.length) return ''; const j = u.join(' و'); return ' — ' + (/ و/.test(j) ? (u.length > 2 || / و.* و/.test(j) ? 'للصفوف ' : 'للصفين ') : 'للصف ') + j; };
    const cnt = n => n > 1 ? ` (${n})` : '';
    const top = (M, k) => Object.values(M).sort((x, y) => y.n - x.n).slice(0, k || 8);
    /* ما سجّلته المعلمات في سبع سنابل: يُجمع حسب نوع الإجراء (أول مقطع في التفصيل)، وتُحذف أسماء الطالبات */
    const SB = ctx.recs.filter(r => r.dept === dept && ['SEN', 'SFB', 'SAC'].includes(r.item) && r.d && inP(r.date, P));
    const opt = r => { const g = String(r.d.det || '').split(' — ').map(x => x.trim()).filter(x => x && !/^(الغائبات|من الميزان)/.test(x));
      let o = (g[0] || '').replace(/^إجراء مبتكر:\s*/, ''); if (r.item === 'SEN') { o = g.find(x => !/^حصة إثرائية (فردية|جماعية)$/.test(x) && x.length <= 70) || ''; } return o.length > 90 ? '' : o; };
    const grp = (it, head) => { const X = SB.filter(r => r.item === it); if (!X.length) return;
      const M = {}; X.forEach(r => { const o = opt(r), k = nk(o); if (!k) return; (M[k] = M[k] || { t: o, n: 0 }).n++; });
      const kinds = top(M, 6).map(o => o.t + cnt(o.n));
      L.push({ st: 0, tx: head(X) + (kinds.length ? '، شملت: ' + kinds.join('، ') : '') + lvTx(X.map(r => lvOf(r.d.s))) + '.' }); };
    grp('SEN', X => { const f = X.filter(r => !r.d.whole).length, w = X.length - f;
      return `تقديم (${X.length}) من الحصص الإثرائية` + (f && w ? ` (${f} فردية و${w} جماعية)` : f ? ' الفردية' : ' الجماعية'); });
    grp('SFB', X => `تقديم التغذية الراجعة والتقييمات القصيرة (${X.length})`);
    grp('SAC', X => `تنفيذ الأنشطة الصفية وتعلّم الأقران (${X.length})`);
    /* ما سجّلته المنسقة: الإجراء المكرر يُذكر مرة واحدة */
    { const M = {}; RA.forEach(r => { const x = d(r), k = nk(x.item); if (!k) return; const o = M[k] = M[k] || { t: String(x.item).trim(), n: 0, lv: [], tg: [], imp: [] }; o.n++;
        o.lv.push(x.lvl && x.lvl !== 'جميع المستويات' ? String(x.lvl).replace(/^الصف(ان)?\s+/, '').replace(/^الصفين\s+/, '') : ''); if (x.tg) o.tg.push(x.tg); if (x.imp && !/قيد المتابعة/.test(x.imp)) o.imp.push(x.imp); });
      Object.values(M).forEach(o => { const tg = [...new Set(o.tg)], im = [...new Set(o.imp)];
        L.push({ st: 0, tx: o.t.replace(/[.،؛]\s*$/, '') + lvTx(o.lv, o.t) + (tg.length ? ' (' + tg.join('، ') + ')' : '') + (im.length ? ' — الأثر: ' + im.join('، ') : '') + '.' }); }); }
    /* تعويض الحصص الفائتة بسبب الأنشطة */
    { const XC = ctx.recs.filter(r => r.dept === dept && r.item === 'XCMP' && r.d && inP(String(r.date).slice(0, 10), P));
      if (XC.length) { const how = [...new Set(XC.map(r => r.d.how).filter(Boolean))];
        L.push({ st: 0, tx: `تعويض الطالبات عن (${XC.length}) من الحصص التي فاتتهن بسبب الخروج للأنشطة المدرسية` + (how.length ? ' (' + how.join('، ') + ')' : '') + lvTx(XC.map(r => lvOf(r.d.c))) + '.' }); } }
    /* تعزيز الطالبات بشهادات الشكر من سبع سنابل: العدد وأسباب التعزيز فقط */
    { const RF = ctx.recs.filter(r => r.dept === dept && r.item === 'SRF' && r.d && inP(r.date, P));
      if (RF.length) { const M = {}; RF.forEach(r => String(String(r.d.det || '').split(' — على: ')[1] || '').split('، ').map(x => x.trim()).filter(Boolean).forEach(w => { const k = nk(w); (M[k] = M[k] || { t: w, n: 0 }).n++; }));
        const ws = top(M, 6).map(o => o.t);
        L.push({ st: 0, tx: `تعزيز (${new Set(RF.flatMap(r => (r.d.stu || []).map(n => n + '|' + r.d.s))).size}) من الطالبات بـ(${RF.length}) من شهادات الشكر` + (ws.length ? '، تقديرًا لـ: ' + ws.join('، ') : '') + '.' }); } }
    T.ra = L.length ? 'نفّذت معلمات القسم خلال الفترة الإجراءات الآتية لرفع التحصيل الأكاديمي:' : 'لم تُسجَّل إجراءات لرفع التحصيل خلال الفترة.';
    T.ra_lines = L.length ? L : null; }

  /* التطوير الداخلي */
  const WSall = R('WS').map(r => ({ r, x: d(r), w: SEC.WS.when(d(r)) || r.date }));
  const WS = WSall.filter(o => inP(o.w, P));
  /* فصل الورش: ما نفّذه القسم (المقدِّمة من معلمات القسم أو ورشة من خطته) عن ورش حضرتها معلمات القسم وقدّمتها جهة أخرى (القيادة العليا أو غيرها) */
  const nA = x => String(x || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^\u0621-\u064A ]/g, ' ').replace(/\s+/g, ' ').trim();
  const deptStaff = (ctx.staff || []).filter(t => t.dept === dept).map(t => nA(t.name).split(' ')).filter(w => w.length);
  const byDept = o => { const pr = nA(o.x.pres); if (!pr) return true;
    return deptStaff.some(w => pr.includes(w[0]) && pr.includes(w[w.length - 1])); };
  const isOwn = o => byDept(o) && !((o.x.b === REF.OUT_OF_PLAN || !o.x.b) && o.x.pres && !byDept(o));
  const attended = WS.filter(o => (o.x.g || '').startsWith('تمت') && !isOwn(o));
  const done = WS.filter(o => (o.x.g || '').startsWith('تمت') && isOwn(o)), post = WS.filter(o => o.x.g && !(o.x.g || '').startsWith('تمت') && isOwn(o));
  const attTx = o => { const ti = (o.x.b === REF.OUT_OF_PLAN || !o.x.b) ? o.x.c : o.x.b, who = o.r.by && o.r.by === ctx.coordName ? 'منسقة القسم أ. ' + o.r.by : (o.r.by ? 'أ. ' + o.r.by : 'منسقة القسم');
    return `حضرت ${who} ${o.x.type || 'ورشة'} «${ti}» التي قدّمتها ${String(o.x.pres).replace(/^\s*(أ\s*\.|الأستاذة)\s*/, 'أ. ')}` + ((o.x.h || o.x.planned) ? ` بتاريخ ${dmy(o.x.h || o.x.planned)}` : '') + (o.x.o ? '، وأثرها: ' + o.x.o : ''); };
  // نسبة تنفيذ الخطة = بنود خطة القسم المقررة في الفترة التي نُفّذت ÷ بنود الخطة المقررة في الفترة (كل بند يُحسب مرة واحدة)
  const nrm = x => String(x || '').trim().replace(/\s+/g, ' ');
  const planItems = ctx.pd.filter(p => String(p.dept || '').split('|').includes(dept) && inP(p.date, P));
  const planN = planItems.length;
  const planDone = planItems.filter(p => WSall.some(o => (o.x.g || '').startsWith('تمت') && nrm(o.x.b) === nrm(p.title))).length;
  const attK = done.filter(o => o.x.k !== '' && o.x.k != null && +o.x.j > 0);
  const att = attK.length ? attK.reduce((a, o) => a + (+o.x.k), 0) / attK.reduce((a, o) => a + (+o.x.j), 0) : null;
  T.pd_done_n = done.length; T.pd_plan_n = planN; T.pd_plan_done = planDone; T.pd_att = att;
  const ownTx = (!done.length && !post.length)
    ? 'لم تُسجَّل برامج تطوير مهني نفّذها القسم خلال الفترة.' + (planN ? ` (مقرر في خطة القسم (${planN}) من البرامج خلال الفترة ولم تُسجَّل حالة تنفيذه بعد).` : '')
    : (planN ? `نفّذ القسم (${planDone}) من أصل (${planN}) من البرامج المقررة في خطة التطوير المهني خلال الفترة بنسبة ${pct(planDone, planN)}. ` : '')
      + (done.length ? 'قام القسم بتنفيذ: ' + done.map(o => SEC.WS.tx(o.x)).join('؛ ') + '. ' : '')
      + (post.length ? 'كما تم ' + post.map(o => SEC.WS.tx(o.x)).join('؛ ') + '. ' : '')
      + (att != null ? `وبلغت نسبة حضور المعلمات للبرامج المسجَّل فيها عدد الحاضرات ${Math.round(att * 100)}%.` : '');
  T.pd_int = ownTx + (attended.length ? ' وفي برامج قدّمتها جهات من خارج القسم: ' + attended.map(attTx).join('؛ ') + '.' : '');

  /* التطوير الخارجي */
  const EXm = Rp('EX').filter(r => isMeet(d(r).name)), EXa = Rp('EX').filter(r => !isMeet(d(r).name)); const allM = [coord, ...teachers].filter(Boolean), NM = allM.length;
  const EX = EXa.filter(r => pdKind(d(r)) === 'off'), EXs = EXa.filter(r => pdKind(d(r)) === 'self');
  const exK = EX.some(r => d(r).t === REF.ALL_MEMBERS) ? NM : uniq(EX.map(r => d(r).t)).filter(t => allM.includes(t)).length;
  const exP = uniq(EX.map(r => String(d(r).name || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim())).length;
  T.ex_n = exP; T.ex_k = exK;
  T.pd_ext = !EX.length ? 'لم تُسجَّل مشاركات في برامج تطوير مهني خارجية رسمية خلال الفترة.'
    : (NM ? `شاركت ${exK} من أصل ${NM} من أعضاء القسم في برامج التطوير المهني الخارجية الرسمية (مركز التدريب والتوجيه التربوي والتقييم) خلال وقت الدوام بنسبة ${pct(exK, NM)}، ` : '') + `بإجمالي (${exP}) ${exP === 1 ? 'برنامج' : 'برامج'}: ` + EX.map(r => SEC.EX.tx(d(r))).join('؛ ') + '.';
  /* التنمية الذاتية: ما تختار المعلمة حضوره بمحض إرادتها بعد الدوام */
  const sfK = EXs.some(r => d(r).t === REF.ALL_MEMBERS) ? NM : uniq(EXs.map(r => d(r).t)).filter(t => allM.includes(t)).length;
  const sfP = uniq(EXs.map(r => String(d(r).name || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim())).length;
  T.sf_n = sfP; T.sf_k = sfK;
  T.pd_self = !EXs.length ? 'لم تُسجَّل برامج تنمية ذاتية خلال الفترة.'
    : (NM ? `حرصت ${sfK} من أصل ${NM} من أعضاء القسم على تنميتهن الذاتية بحضور برامج اخترنها بمبادرة شخصية خارج وقت الدوام بنسبة ${pct(sfK, NM)}، ` : '') + `بإجمالي (${sfP}) ${sfP === 1 ? 'برنامج' : 'برامج'}: ` + EXs.map(r => SEC.EX.tx(d(r))).join('؛ ') + '.';

  /* الاجتماعات */
  const MT = Rp('MT'); const MTi = MT.filter(r => SEC.MT.io(d(r)) === 'داخلي'), MTe = MT.filter(r => SEC.MT.io(d(r)) === 'خارجي');
  T.mt_int = MTi.length ? `عقد القسم (${nMT(MTi)}) من الاجتماعات الداخلية: ` + MTi.map(r => SEC.MT.tx(d(r))).join('؛ ') + '.' : 'لم تُسجَّل اجتماعات داخلية خلال الفترة.';
  const exMt = r => `«${String(d(r).name || "").trim()}»` + (d(r).ent ? ` (${d(r).ent})` : '') + ` — أ. ${d(r).t}` + bt(d(r).date || r.date);
  T.mt_ext = (MTe.length || EXm.length) ? `شارك القسم في (${nMT(MTe) + EXm.length}) من الاجتماعات الخارجية: ` + [...MTe.map(r => SEC.MT.tx(d(r))), ...EXm.map(exMt)].join('؛ ') + '.' : 'لم تُسجَّل اجتماعات خارجية خلال الفترة.';

  /* زيارات القيادة */
  const OV0 = Rp('OV');
  // زيارات النائب والمديرة من سجلاتهما مباشرة (للإدارة: VPV/PRV، وللمنسقة: نسخة مختصرة LVV)
  const LVsrc = ctx.recs.filter(r => r.dept === dept && inP(r.date, P) && r.d && (r.item === 'VPV' || r.item === 'PRV' || r.item === 'LVV')).map(r => {
    const k = r.item === 'LVV' ? r.d.k : r.item === 'PRV' ? 'pr' : 'vp'; const st = r.d.st || [], im = r.d.im || [];
    return { item: 'OV', date: r.date, d: { ty: k === 'pr' ? 'زيارة مديرة المدرسة' : 'زيارة نائب المدير للشؤون الأكاديمية', t: r.d.t, s: r.d.s, goal: r.d.topic || r.d.goal || r.d.note || '', f1: st[0] || '', f2: st[1] || '', i1: im[0] || '', i2: im[1] || '', date: r.date } };
  });
  // ما سجّلته المنسقة يدوياً لنفس الزيارة يُقدَّم (لأنه يحمل متابعتها للتوصيات)
  const ovKey = (x) => [SEC.OV.cat(d(x)), d(x).t, x.date || d(x).date].join('|');
  const have = new Set(OV0.map(ovKey));
  const OV = OV0.concat(LVsrc.filter(x => !have.has(ovKey(x))));
  [['ov_pr', 'pr', 'زارت مديرة المدرسة'], ['ov_vp', 'vp', 'زار نائب المدير للشؤون الأكاديمية'], ['ov_sup', 'sup', 'زار الموجه التربوي']].forEach(([k, c, lab]) => {
    const L = OV.filter(r => SEC.OV.cat(d(r)) === c);
    T[k] = L.length ? `${lab} (${L.length}) من معلمات القسم: ` + L.map(r => SEC.OV.tx(d(r))).join('؛ ') + '.' : 'لا توجد زيارات مسجلة خلال الفترة.';
  });
  /* زيارة الموجه في فترة سابقة: تظهر في الفترة التي نفّذت فيها المنسقة إجراء المتابعة وقاست أثره، أو ما دامت متابعتها معلّقة */
  { const y0 = ((S.periods || [])[0] || {}).from || '2026-08-01', seen = new Set();
    const prevSup = ctx.recs.filter(r => r.dept === dept && r.item === 'OV' && r.d && SEC.OV.cat(d(r)) === 'sup' && String(r.date).slice(0, 10) < P.from && String(r.date).slice(0, 10) >= y0
      && (r.d.fud ? inP(String(r.d.fud).slice(0, 10), P) : true))
      .sort((a, b) => String(a.date).localeCompare(String(b.date))).filter(r => { const k = [r.d.t, String(r.date).slice(0, 10)].join('|'); return seen.has(k) ? false : seen.add(k); });
    if (prevSup.length) { const tx = 'وفي متابعة توصيات زيارات الموجه التربوي السابقة: ' + prevSup.map(r => SEC.OV.tx(d(r)) + (!r.d.mech && !r.d.fud ? ' (لم تُسجَّل متابعة المنسقة بعد)' : '')).join('؛ ') + '.';
      T.ov_sup = /^لا توجد/.test(T.ov_sup) ? tx.replace(/^وفي /, 'في ') : T.ov_sup + ' ' + tx; } }
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
      const p = [g('تم التنفيذ').length ? 'تم تنفيذ ' + g('تم التنفيذ').join('، و') : '', g('تم التنفيذ جزئياً').length ? 'تحسّن جزئي في ' + g('تم التنفيذ جزئياً').join('، و') : '', g('لم تُنفذ بعد').length ? 'ما زالت بحاجة إلى ' + g('لم تُنفذ بعد').join('، و') : '', g('لم يتم قياسه').length ? 'ولم يتم قياس ' + g('لم يتم قياسه').join('، و') + ' (تُرحَّل للزيارة القادمة)' : ''].filter(Boolean);
      return p.length ? `وفي متابعة توصيات ${v.prevK === 'VPV' ? 'حضور النائب الأكاديمي' : v.prevK === 'PRV' ? 'حضور مديرة المدرسة' : 'حضور المنسقة'} بتاريخ ${dm(v.prevDate)} (في زيارة ${dm(v.date)}): ${p.join('؛ و')}.` : ''; }).filter(Boolean).join(' ');
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
  // المتابعة الشهرية للمعلمات ذوات الخطة الخاصة (زيارات + جلسات فردية)
  T.v_spec = (typeof VPLAN === 'undefined') ? [] : Object.keys(VPLAN).filter(t => VPLAN[t].perMonth && (ctx.staff || S.staff || []).some(s => s.name === t && s.dept === dept)).map(t => {
    const L = specFollow(t, P, R('V').concat(R('IS'))) || []; if (!L.length) return '';
    const parts = L.map(x => `${mAr(x.m)}: ${x.v} من ${x.needV} زيارات و${x.s} من ${x.needS} ${x.needS === 1 ? 'جلسة فردية' : 'جلسات فردية'}`);
    const sh = L.filter(x => x.done && (x.shortV || x.shortS)).map(x => mAr(x.m));
    return `• متابعة أ. ${t} (خطة شهرية خاصة): ${parts.join('؛ ')}.` + (sh.length ? ` ويُلاحظ قصور في متابعة المعلمة خلال شهر ${sh.join(' و')}، إذ لم تكتمل الزيارات أو الجلسات الفردية المطلوبة.` : '');
  }).filter(Boolean);
  // التوصيات المشتركة (تكررت لدى معلمتين فأكثر): تُجمع حسب موضوعها لا حرفيّتها، فتلتقي العبارات المتقاربة (مثل «توظيف التعلم التعاوني» و«تعزيز التعلم التعاوني»)
  const recStats = uniq([...REF.REC, ...V.flatMap(v => [v.r1, v.r2, v.r3]).filter(Boolean)]).map((rc, i) => {
    const l = V.filter(v => !isFU(v) && [v.r1, v.r2, v.r3].includes(rc));
    return { rc, i, n: l.length, k: uniq(l.map(v => v.t)).length };
  });
  const REC_TH = [
    ['توظيف التعلم التعاوني وتوزيع الأدوار في المجموعات', /تعاون|المجموعات|مجموعة|الأدوار|تشارك/],
    ['مراعاة الفروق الفردية وتمايز الأنشطة', /الفروق الفردية|متمايز|تمايز|ذوات الأداء|المتفوقات|مستويات الطالبات/],
    ['تفعيل دور الطالبة ومحورية التعلم والمناقشة', /دور الطالب|محور|التعلم النشط|استنتاج|المناقشة|التفاعل/],
    ['الأسئلة الصفية ومهارات التفكير العليا', /أسئلة|الأسئلة|التفكير|زمن انتظار/],
    ['تنويع التقويم البنائي والتغذية الراجعة', /تقويم|تقييم|تغذية راجعة/],
    ['التهيئة وغلق الدرس', /تمهيد|تهيئة|غلق|تذكرة خروج/],
    ['الإدارة الصفية واستثمار زمن الحصة', /إدارة الصف|الإدارة الصفية|السلوك|زمن الحصة|الوقت|المؤقت|الانتقال بين/],
    ['توظيف التقنية ومصادر التعلم', /تكنولوجيا|التقنية|نظام قطر|مصادر التعلم|مصدر التعلم|الوسائل/],
    ['التخطيط وصياغة الأهداف', /خطة الدرس|صياغة الأهداف|أهداف التعلم|التدرج المنطقي|خطوات الدرس/],
    ['المهارات اللغوية (القراءة والكتابة والتعبير)', /الكتابة|للكتابة|القراءة|التعبير|المفردات|الكلمات/],
  ];
  const recTxt = v => uniq([v.r1, v.r2, v.r3, ...(v.imp || [])].filter(Boolean));
  const TH = REC_TH.map(([lbl, re]) => { const L = V.filter(v => !isFU(v) && recTxt(v).some(x => re.test(x))); return { lbl, re, ts: uniq(L.map(v => v.t)), ex: uniq(L.flatMap(v => recTxt(v).filter(x => re.test(x)))) }; }).filter(x => x.ts.length >= 2);
  // ما عالجته المنسقة: إجراء التوصيات المشتركة، أو اجتماع أو حلقة نقاشية أو جلسة فردية أو ورشة في الفترة يتناول موضوعها
  const CP = Rp('CP');
  const actTx = r => { const x = d(r); return [x.rec, x.proc, x.t1, x.t2, x.t3, x.ty, x.topic, x.title, x.b, x.c, x.det, x.note, ...(Array.isArray(x.tp) ? x.tp : [])].filter(Boolean).join(' '); };
  const ACTS = ['CP', 'MT', 'IS', 'WS'].flatMap(k => Rp(k).map(r => ({ k, r, tx: actTx(r) })));
  const actName = a => { const x = d(a.r); return a.k === 'CP' ? `${x.proc || 'إجراء'}${x.date || a.r.date ? ' (' + dm(x.date || a.r.date) + ')' : ''}` : a.k === 'MT' ? `اجتماع القسم (${dm(a.r.date)})` : a.k === 'IS' ? `جلسة فردية مع أ. ${x.t || ''} (${dm(a.r.date)})` : `ورشة «${(SEC.WS && SEC.WS.title_ ? SEC.WS.title_(x) : x.c || x.b || '')}»`; };
  TH.forEach(th => { th.acts = ACTS.filter(a => th.re.test(a.tx) || (a.k === 'CP' && (th.ex.includes(d(a.r).rec) || /المشتركة/.test(a.tx))) || (/التوصيات المشتركة/.test(a.tx) && a.k !== 'CP')); });
  T.common = TH.map(x => x.lbl);
  T.commonOpen = TH.filter(x => !x.acts.length).map(x => x.lbl);
  T.v_common_p = !vN ? '' : (TH.length ? 'التوصيات المشتركة بين معلمات القسم: ' + TH.map((x, i) => `(${i + 1}) ${x.lbl} — لدى ${x.ts.map(t => 'أ. ' + t).join('، ')}؛ ` + (x.acts.length ? 'وعالجتها المنسقة من خلال: ' + uniq(x.acts.map(actName)).join('، ') : 'ولم يُوثَّق إجراء للمنسقة لمعالجتها بعد')).join('. ') + '.' : 'لا توجد توصيات مشتركة بين معلمات القسم خلال الفترة.');
  T.topRecs = recStats.filter(x => x.n).sort((a, b) => b.n - a.n || b.k - a.k).slice(0, 5);
  T.topStr = REF.CRIT.map((cr, i) => ({ core: cr.core, n: V.filter(v => v.f1 === cr.label || v.f2 === cr.label).length })).filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 5);
  T.perTeacher = per;

  /* الأنشطة */
  const AC = Rp('AC'); const ACi = AC.filter(r => acScope(d(r)) === 'int'), ACe = AC.filter(r => acScope(d(r)) === 'ext'), ACc = AC.filter(r => acScope(d(r)) === 'cp');
  T.ac_cp = sec(ACc, r => SEC.AC.tx(d(r)), 'لم تُسجَّل شراكات مجتمعية خلال الفترة.', `استضاف القسم (${ACc.length}) من الجهات الخارجية داخل المدرسة ضمن الشراكة المجتمعية: `);
  T.ac_int = sec(ACi, r => SEC.AC.tx(d(r)), 'لم تُسجَّل أنشطة داخلية خلال الفترة.', `نفّذ القسم (${ACi.length}) من الأنشطة والمبادرات الداخلية: `);
  T.ac_ext = sec(ACe, r => SEC.AC.tx(d(r)), 'لم تُسجَّل أنشطة خارجية خلال الفترة.', `شاركت طالبات القسم في (${ACe.length}) من الأنشطة خارج المدرسة: `);

  /* أولياء الأمور */
  const PA = Rp('PA'); const PAi = PA.filter(r => SEC.PA.ind(d(r))), PAe = PA.filter(r => !SEC.PA.ind(d(r)));
  const solved = PAi.filter(r => ['تم الحل', 'تحسن ملحوظ'].includes(d(r).res)).length;
  const nStu = PAi.reduce((a, r) => a + (+d(r).n > 0 ? +d(r).n : 1), 0);
  T.pa_ind = PAi.length ? `تم التواصل مع أولياء أمور (${nStu}) من الطالبات خلال الفترة، وتحقق الحل أو التحسن في (${solved}) حالة: ` + PAi.map(r => SEC.PA.tx(d(r))).join('؛ ') + '.' : 'لم يُسجَّل تواصل فردي مع أولياء الأمور خلال الفترة.';
  T.pa_ev = sec(PAe, r => SEC.PA.tx(d(r)), 'لم تُسجَّل فعاليات أو مبادرات لأولياء الأمور خلال الفترة.', 'الفعاليات والمبادرات المقدَّمة لأولياء الأمور بمشاركة القسم: ');
  T.pa_ind_n = PAi.length; T.pa_ev_n = PAe.length;

  /* المصادر والتعليم الإلكتروني */
  const LR = Rp('LR').concat(Rp('TLR'));   // ما سجّلته المنسقة + ما سجّلته المعلمات بأنفسهن
  T.lrc = sec(LR.filter(r => !lrIsEL(d(r).k)), r => SEC.LR.tx(d(r)), 'لم يُسجَّل تفعيل لمركز مصادر التعلم خلال الفترة.', 'فعّلت معلمات القسم مركز مصادر التعلم: ');
  const EL = LR.filter(r => lrIsEL(d(r).k));
  const elBy = [REF.ALL_MEMBERS, 'القسم', coord, ...teachers].map(t => ({ t, tools: uniq(EL.filter(r => d(r).t === t).map(r => lrTools(d(r)).join('، ') + ((x => x ? ` (${x})` : '')([d(r).s ? (/^الصف/.test(d(r).s) ? d(r).s : 'الصف ' + d(r).s) : '', d(r).mode && d(r).mode !== 'داخل الحصة الصفية' ? d(r).mode : '', d(r).nd ? '' : dm(r.date)].filter(Boolean).join('، '))))) })).filter(x => x.tools.length);
  T.el_n = elBy.reduce((a, x) => a + x.tools.length, 0);
  T.elearn = T.el_n ? 'وظّفت معلمات القسم أدوات التعليم الإلكتروني: ' + elBy.map(x => (x.t === REF.ALL_MEMBERS ? 'جميع معلمات القسم' : x.t === 'القسم' ? 'القسم' : `أ. ${x.t}`) + `: ${x.tools.join('، ')}`).join('؛ ') + '.' : 'لم يُسجَّل توظيف لأدوات التعليم الإلكتروني خلال الفترة.';

  /* الإنجازات */
  const ACH = Rp('ACH');
  const A1 = ACH.filter(r => SEC.ACH.kind(d(r)) === 1), A2 = ACH.filter(r => SEC.ACH.kind(d(r)) === 2);
  T.ach = sec(A1, r => SEC.ACH.tx(d(r)), 'لا توجد إنجازات (مراكز أو جوائز) مسجلة خلال الفترة.', 'إنجازات القسم خلال الفترة: ');
  T.part = sec(A2, r => SEC.ACH.tx(d(r)), 'لا توجد مشاركات مسجلة خلال الفترة.', 'مشاركات القسم خلال الفترة: ');
  T.ach_n = A1.length; T.part_n = A2.length;

  /* الاحتياط والتبديل (من منصة انضباط) */
  const nP = n => n === 1 ? 'حصة واحدة' : n === 2 ? 'حصتان' : n <= 10 ? `${n} حصص` : `${n} حصة`;
  const SBC = Rp('SBC').map(r => Object.assign({}, r.d, { date: r.date })), SBA = Rp('SBA').map(r => Object.assign({}, r.d, { date: r.date }));
  const byT = L => { const o = {}; L.forEach(x => (o[x.t] = o[x.t] || []).push(x)); return Object.entries(o).sort((a, b) => b[1].length - a[1].length); };
  const cIht = SBC.filter(x => x.type !== 'تبديل').length, cTb = SBC.filter(x => x.type === 'تبديل').length;
  T.sb_cov = !SBC.length ? 'لم تُسجَّل حصص احتياط أو تبديل لمعلمات القسم خلال الفترة.'
    : `غطّت معلمات القسم (${SBC.length}) من الحصص: احتياطاً (${cIht}) وتبديلاً (${cTb})، كالآتي: ` + byT(SBC).map(([t, L]) => {
        const a = L.filter(x => x.type !== 'تبديل').length, b = L.length - a;
        return `أ. ${t} ${nP(L.length)}` + ' (' + [a ? `احتياط ${a}` : '', b ? `تبديل ${b}` : ''].filter(Boolean).join('، ') + ' — ' + L.map(x => `${dm(x.date)} ${x.cls}`).join('، ') + ')';
      }).join('؛ ') + '.';
  const aCov = SBA.filter(x => x.sub).length, aNo = SBA.length - aCov;
  T.sb_abs = !SBA.length ? 'لم تُسجَّل حصص غابت فيها معلمات القسم خلال الفترة.'
    : `غابت معلمات القسم عن (${SBA.length}) من الحصص، غُطّي منها (${aCov})` + (aNo ? ` ولم يُغطَّ (${aNo})` : '') + ': ' + byT(SBA).map(([t, L]) =>
        `أ. ${t} ${nP(L.length)} (` + L.map(x => `${dm(x.date)} ${x.cls}: ` + (x.sub ? `${x.type === 'تبديل' ? 'تبديل مع' : 'احتياط'} أ. ${x.sub}` : 'لم تُغطَّ')).join('، ') + ')').join('؛ ') + '.';
  T.sb_n = SBC.length; T.sb_abs_n = SBA.length;

  /* التحديات */
  const CH = Rp('CH');
  T.chal = CH.length ? CH.map(r => SEC.CH.tx(d(r))).join('؛ ') + '.' : 'لا توجد تحديات مسجلة خلال الفترة.';

  /* الأولويات */
  const firstBy = (list, keyf) => { const s = new Set(); return list.filter(r => { const k = keyf(r); if (s.has(k)) return false; s.add(k); return true; }); };
  const RAf = firstBy(RA, r => d(r).item), ACf = firstBy(AC, r => d(r).name);

  /* ---------- ما تسجّله المعلمات بأنفسهن (الميزان برقم المعلمة) ----------
     يظهر فور حفظه. ما له مدة يظهر في كل فترة يمتد إليها: التكليف «طوال العام» في كل فترات العام بعد تاريخه،
     و«خلال الفصل الدراسي» في فترات فصله، والبرنامج أو المشروع الممتد (له تاريخ انتهاء) في كل فترة يتقاطع معها */
  const yKey = x => { const y = +String(x).slice(0, 4), m = +String(x).slice(5, 7); return m >= 8 ? y : y - 1; };
  const semKey = x => { const m = +String(x).slice(5, 7); return yKey(x) + '-' + (m >= 8 || m === 1 ? 1 : 2); };
  /* q1: نسخة المعلمة من سجل للمنسقة (يُعدّ هناك فلا يُكرَّر). إن لم يعد سجل المنسقة موجوداً بعد الربع الأول، يُوثَّق من سجل المعلمة */
  const q1End = ((S.periods || [])[0] || {}).to || '2026-10-11';
  const recIds = new Set(ctx.recs.map(x => String(x.id)));
  const q1Dup = r => { if (!(r.d && r.d.q1)) return false; const m = String(r.d.q1).match(/\(([^)]+)\)/); return String(r.date || '').slice(0, 10) <= q1End || !m || recIds.has(m[1]); };
  const tIn = r => { const dt = String(r.date || '').slice(0, 10); if (!dt) return false; const d0 = r.d || {};
    if (r.item === 'TAS' && d0.scope === 'طوال العام') return dt <= P.to && yKey(dt) === yKey(P.to);
    if (r.item === 'TAS' && d0.scope === 'خلال الفصل الدراسي') return dt <= P.to && (semKey(dt) === semKey(P.to) || semKey(dt) === semKey(P.from));
    if (r.item === 'TA' && d0.to && d0.to > dt) return dt <= P.to && String(d0.to).slice(0, 10) >= P.from;
    return inP(dt, P); };
  {
    const TT = it => ctx.recs.filter(r => r.item === it && tIn(r) && r.d && !q1Dup(r)); // q1 = منقول من تقرير المنسقة، لا يُعدّ مرتين
    const mineD = it => TT(it).filter(r => r.dept === dept || (extraT.includes(r.d.t)));
    const lst = a => (Array.isArray(a) ? a : [a]).filter(Boolean).map(x => String(x).replace(/[.،؛\s]+$/, ''));
    const add = (k, txt) => { if (!txt) return; if (T[k] && typeof T[k] === 'object') { T[k].pre = (T[k].pre ? T[k].pre + ' ' : '') + txt; return; } T[k] = /^لم|^لا توجد/.test(T[k] || '') ? txt.replace(/^و(?=(سجّل|حضر|شارك|عزّز|نفّذ|قدّم|تُعدّ|في |من ))/, '') : (T[k] ? T[k] + ' ' + txt : txt); };
    const nz = s => String(s || '').replace(/\s+/g, ' ').trim();
    const dateTxt = d0 => d0 ? ` (${dm(d0)})` : '';
    // الزيارات التبادلية التي سجّلتها معلمات القسم
    const PVt = mineD('TPV');
    if (PVt.length && !Rp('PV').length) { const nT = uniq(PVt.map(r => r.d.t)).length;
      T.ov_peer = `نفّذت معلمات القسم (${PVt.length}) من الزيارات التبادلية خلال الفترة، بمشاركة (${nT}) ${nT === 1 ? 'معلمة' : 'معلمات'}، وفق التفصيل الآتي:`; }
    // تُعرض في جدول داخل خانة «الزملاء (الزيارات التبادلية)»
    { const by = {}; PVt.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
      T.ov_peer_lines = Object.entries(by).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ar')).map(([t, L]) => { const saw = uniq(L.flatMap(r => lst(r.d.saw))), ap = uniq(L.flatMap(r => lst(r.d.apply)));
        return { st: Math.min(L.length, 3), tx: `أ. ${t} (${L.length}): زارت ` + L.map(r => `أ. ${r.d.v}${r.d.vdept && r.d.vdept !== dept ? ' (' + r.d.vdept + ')' : ''}` + dateTxt(r.date)).join('، و') + (saw.length ? `؛ واستفادت: ${saw.join('، ')}` : '') + (ap.length ? `؛ وستطبّق: ${ap.join('، ')}` : '') + '.' }; }); }
    T.ov_peer_tbl = PVt.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map(r => ({
      t: r.d.t || '', v: r.d.v || '', vd: r.d.vdept && r.d.vdept !== dept ? r.d.vdept : '', date: r.date || '',
      pick: lst(r.d.pick).join('، '), saw: lst(r.d.saw).join('، '), apply: lst(r.d.apply).join('، ') + (lst(r.d.apply).length && r.d.how === 'بعد تكييفه' ? ' (بعد التكييف)' : '') }));
    // الحرص على التطوير الذاتي: ثلاث زيارات فأكثر في شهر واحد
    const byM = {}; PVt.forEach(r => { const k = r.d.t + '|' + String(r.date).slice(0, 7); byM[k] = (byM[k] || 0) + 1; });
    const keen = uniq(Object.entries(byM).filter(([, n]) => n >= 3).map(([k]) => k.split('|')[0]));
    { const EX = mineD('TEX'); if (EX.length) { const by = {}; EX.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
      add('ov_peer', `وفي تبادل الخبرات في الفعاليات والأنشطة: ` + Object.entries(by).map(([t, L]) => `أ. ${t} ` + L.map(r => `${lst(r.d.role).join(' و') || 'حاضرة'} في «${String(r.d.name || '').trim()}»${r.d.odept && r.d.odept !== dept ? ' (' + r.d.odept + ')' : ''}`).join('، و')).join('؛ ') + '.'); } }
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
    const mtT = WS.filter(r => r.dept === dept && /^حضرتُ/.test(r.d.role || '') && isMeet(r.d.title));
    if (mtT.length) add('mt_ext', 'وحضرت معلمات القسم من الاجتماعات الخارجية: ' + mtT.map(r => `«${nz(r.d.title)}»` + (r.d.place ? ` (${r.d.place})` : '') + ` — أ. ${r.d.t}` + dateTxt(r.date)).join('؛ ') + '.');
    const inT = WS.filter(r => r.dept === dept && r.d.role === 'حضرتُ ورشة داخلية' && !isMeet(r.d.title)), exT = WS.filter(r => r.dept === dept && r.d.role === 'حضرتُ ورشة خارجية' && !isMeet(r.d.title));
    if (inT.length) add('pd_int', 'وحضرت معلمات القسم: ' + inT.map(r => `أ. ${r.d.t} ورشة «${nz(r.d.title)}» من تقديم أ. ${r.d.by}` + dateTxt(r.date)).join('؛ ') + '.');
    const exTw = r => (S.records || []).find(e => e.item === 'EX' && e.d && e.d.t === r.d.t && nz(e.d.name) === nz(r.d.title));
    const exLine = r => `«${nz(r.d.title)}»` + (r.d.place ? ` (${r.d.place})` : '') + (r.d.byx ? ` من تقديم ${r.d.byx}` : '') + ` — أ. ${r.d.t}` + dateTxt(r.date);
    const exO = exT.filter(r => pdKind(r.d, (exTw(r) || {}).d) === 'off'), exS = exT.filter(r => pdKind(r.d, (exTw(r) || {}).d) === 'self');
    if (exO.length) add('pd_ext', 'وسجّلت معلمات القسم مشاركتهن في: ' + exO.map(exLine).join('؛ ') + '.');
    if (exS.length) add('pd_self', 'وسجّلت معلمات القسم تنميتهن الذاتية بحضور: ' + exS.map(exLine).join('؛ ') + '.');
    // التواصل مع أولياء الأمور
    const PAt = mineD('TPA');
    if (PAt.length) { const by = {}; PAt.forEach(r => { const o = by[r.d.t] = by[r.d.t] || { n: 0, ways: new Set(), cats: new Set() }; o.n += +r.d.n > 0 ? +r.d.n : 1; if (r.d.way) o.ways.add(r.d.way); if (r.d.cat) o.cats.add(r.d.cat); });
      add('pa_ind', 'وسجّلت المعلمات تواصلهن مع أولياء الأمور: ' + Object.entries(by).map(([t, o]) => `أ. ${t} (${o.n})` + (o.cats.size ? ` لأغراض: ${[...o.cats].join('، ')}` : '') + (o.ways.size ? ` — ${[...o.ways].join('، ')}` : '')).join('؛ ') + '.'); }
    // أنشطة المعلمات ومبادراتهن للشراكة مع أولياء الأمور (دون ما سجّلته المنسقة نفسه في بند أولياء الأمور)
    { const nk = x => String(x || '').replace(/[ً-ْـ\s«»"()\-–—:،.]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
      const pe = PAe.map(r => nk(d(r).why) + '|' + nk(d(r).c));
      const PAa = mineD('TA').filter(r => !r.d.q1 && isPaAct(r) && !(nk(r.d.name).length > 3 && pe.some(k => k.includes(nk(r.d.name)))));
      const ACa = Rp('AC').filter(r => /أولياء/.test(d(r).tg || '') && !(nk(d(r).name).length > 3 && pe.some(k => k.includes(nk(d(r).name)))));
      if (ACa.length) add('pa_ev', 'ونفّذ القسم بمشاركة أولياء الأمور: ' + ACa.map(r => `${d(r).ty || 'نشاط'} «${nz(d(r).name)}»` + (d(r).tg ? ` (المستهدف: ${d(r).tg})` : '') + dateTxt(r.date)).join('؛ ') + '.');
      if (PAa.length) add('pa_ev', 'ونفّذت معلمات القسم للشراكة مع أولياء الأمور: ' + PAa.map(r => `${r.d.kind || 'نشاط'} «${nz(r.d.name)}» (أ. ${r.d.t})` + dateTxt(r.date)).join('؛ ') + '.'); }
    // الإنجازات والمشاركات
    const AH = mineD('TACH'); const AHw = AH.filter(r => /إنجاز/.test(r.d.kind)), AHp = AH.filter(r => !/إنجاز/.test(r.d.kind));
    const ahTx = r => `«${nz(r.d.name)}»` + (r.d.ent ? ` (${r.d.ent})` : '') + (r.d.res ? `، ${r.d.res}` : '') + ` بإشراف أ. ${r.d.t}` + dateTxt(r.date);
    if (AHw.length) add('ach', 'ومن إنجازات الطالبات بإشراف معلمات القسم: ' + AHw.map(ahTx).join('؛ ') + '.');
    if (AHp.length) add('part', 'وشاركت الطالبات بإشراف معلمات القسم في: ' + AHp.map(ahTx).join('؛ ') + '.');
    // الأنشطة والمبادرات التي سجّلتها المعلمات (عدا ما نُقل من تقارير الربع الأول)
    { const TS = mineD('TAS'); const by = {}; TS.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
      T.tas_lines = Object.entries(by).map(([t, L]) => { const it = uniq(L.flatMap(r => lst(r.d.what).map(w => w + (r.d.scope === 'طوال العام' && !/طوال العام/.test(w) ? ' (طوال العام)' : ''))));
        return { st: Math.min(it.length, 3), n: it.length, tx: `أ. ${t}: تم تكليفها بـ ` + it.join('، ') + '.' }; }).sort((a, b) => b.n - a.n); }
    /* حصص الاحتياط التي سجّلتها المعلمات بأنفسهن في «التكليفات والأعباء الوظيفية» تظهر أيضاً في «تغطية معلمات القسم للحصص»
       (بتاريخها داخل الفترة)، ولا تُكرَّر إن سُجّلت الحصة نفسها في منصة انضباط لنفس المعلمة واليوم */
    { const ind = new Set(SBC.map(x => nz(x.t) + '|' + String(x.date).slice(0, 10)));
      const CV = ctx.recs.filter(r => r.item === 'TAS' && r.d && inP(String(r.date).slice(0, 10), P) && (r.dept === dept || extraT.includes(r.d.t))
        && lst(r.d.what).some(w => /احتياط|تبديل|تغطية/.test(w)) && !ind.has(nz(r.d.t) + '|' + String(r.date).slice(0, 10)));
      if (CV.length) { const by = {}; CV.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
        const tx = Object.entries(by).sort((x, y) => y[1].length - x[1].length).map(([t, L]) => `أ. ${t} (` + L.sort((x, y) => String(x.date).localeCompare(String(y.date))).map(r => dm(String(r.date).slice(0, 10)) + (nz(r.d.note) && lst(r.d.what).length === 1 ? ': ' + nz(r.d.note).replace(/[.،؛\s]+$/, '') : '')).join('، ') + ')').join('؛ ');
        T.sb_cov = SBC.length ? T.sb_cov + ` وسجّلت معلمات القسم في التكليفات (${CV.length}) من حصص الاحتياط: ` + tx + '.' : `سجّلت معلمات القسم (${CV.length}) من حصص الاحتياط: ` + tx + '.';
        T.sb_n = SBC.length + CV.length; } }
    // ما كان على مستوى المدارس أو خارج المدرسة يُعرض في «الأنشطة الخارجية»، والباقي في «الداخلية»
    const TAext = r => taScope(r.d) === 'ext';
    const TAall = mineD('TA').filter(r => !r.d.q1), TAt = TAall.filter(r => taScope(r.d) === 'int'), TAx = TAall.filter(TAext), TAc = TAall.filter(r => taScope(r.d) === 'cp');
    /* المجالس والفعاليات والمبادرات والشهادات (الشراكة مع أولياء الأمور): لكل معلمة أنشطتها ومبادراتها الموجّهة لأولياء الأمور وشهاداتها للطالبات، ثم المنسقة، مع أعداد المستفيدات */
    try { const isPar = r => /أولياء/.test(r.d.tg || '');
      const RF = ctx.recs.filter(r => r.item === 'SRF' && r.d && inP(r.date, P) && (r.dept === dept || extraT.includes(r.d.t)));
      const TAp = TAall.filter(isPar), by = {};
      TAp.forEach(r => ((by[r.d.t] = by[r.d.t] || { a: [], i: [], c: [] })[r.d.kind === 'مبادرة' ? 'i' : 'a']).push(r));
      RF.forEach(r => (by[r.d.t] = by[r.d.t] || { a: [], i: [], c: [] }).c.push(r));
      const why = r => String(r.d.det || '').split(' — على: ')[0] || 'شهادة';
      const tl = Object.entries(by).map(([t, o]) => { const P2 = [];
        if (o.a.length) P2.push(`أنشطتها (${o.a.length}): ` + o.a.map(r => `${r.d.kind} «${nz(r.d.name)}»` + (r.d.tg ? ` (الفئة المستهدفة: ${r.d.tg})` : '') + (+r.d.n ? ` بمشاركة (${+r.d.n})` : '') + dateTxt(r.date)).join('، '));
        if (o.i.length) P2.push(`مبادراتها (${o.i.length}): ` + o.i.map(r => `«${nz(r.d.name)}»` + (r.d.tg ? ` (الفئة المستهدفة: ${r.d.tg})` : '') + (+r.d.n ? ` بمشاركة (${+r.d.n})` : '') + dateTxt(r.date)).join('، '));
        if (o.c.length) { const st = new Set(o.c.flatMap(r => r.d.stu || [])).size; P2.push(`شهاداتها (${o.c.length}) لـ(${st}) من الطالبات: ` + uniq(o.c.map(why)).join('، ')); }
        return { st: Math.min(o.a.length + o.i.length + o.c.length, 3), n: o.a.length + o.i.length + o.c.length, tx: `أ. ${t}: ` + P2.join('؛ ') + '.' }; }).sort((a, b) => b.n - a.n);
      // المنسقة: شهاداتها ومبادراتها ومجالسها وفعالياتها لأولياء الأمور، ولمن وُجّهت، وعدد المستفيدين
      const PAe2 = Rp('PA').filter(r => !SEC.PA.ind(d(r))), ACp = Rp('AC').filter(r => /أولياء/.test(d(r).tg || ''));
      const grp = (re, L) => L.filter(r => re.test(d(r).c || ''));
      const cT = (lbl, L) => L.length ? `${lbl} (${L.length}): ` + L.map(r => nz(d(r).why || d(r).c) + (+d(r).n ? ` لـ(${+d(r).n}) من أولياء الأمور` : ' لأولياء الأمور') + dateTxt(r.date)).join('، ') : '';
      const cl = [cT('شهاداتها ورسائل الشكر', grp(/شهاد|رسائل شكر/, PAe2)), cT('مبادراتها', grp(/مبادرة/, PAe2)), cT('المجالس واللقاءات والفعاليات', grp(/مجلس|اجتماع|لقاء|درس|ورشة|فعالية|استبانة/, PAe2)),
        ACp.length ? `الأنشطة والمبادرات (${ACp.length}): ` + ACp.map(r => `«${nz(d(r).name)}» (الفئة المستهدفة: ${d(r).tg})` + dateTxt(r.date)).join('، ') : ''].filter(Boolean);
      if (cl.length) tl.unshift({ st: 3, n: 99, tx: `منسقة القسم${coord ? ' أ. ' + coord : ''}: ` + cl.join('؛ ') + '.' });
      const nStu = new Set(RF.flatMap(r => r.d.stu || [])).size + TAp.filter(r => /طالب/.test(r.d.tg || '')).reduce((a, r) => a + (+r.d.n || 0), 0);
      const nPar = PAe2.reduce((a, r) => a + (+d(r).n || 0), 0);
      const nStf = TAp.concat(ACp.map(r => ({ d: d(r) }))).filter(r => /معلم|موظف|الهيئة/.test(r.d.tg || '')).reduce((a, r) => a + (+r.d.n || 0), 0);
      if (tl.length) { T.pa_tlines = tl; T.pa_cnt = `عدد المستفيدات: (${nStu}) من الطالبات، و(${nStf}) من الموظفات` + (nPar ? `، و(${nPar}) من أولياء الأمور` : '') + '.'; } } catch (e) { console.warn('pa_tlines', e); }
    if (TAx.length) { const by = {}; TAx.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
      T.ac_xlines = Object.entries(by).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ar')).map(([t, L]) => ({ st: Math.min(L.length, 3), tx: `أ. ${t} (${L.length}): ` + L.map(r => `${r.d.kind} «${nz(r.d.name)}»` + (r.d.ptn ? ` لدى ${r.d.ptn}` : '') + (r.d.lvl ? ` (${r.d.lvl})` : '') + dateTxt(r.date)).join('، ') + '.' })); }
    if (TAc.length) { const by = {}; TAc.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
      T.ac_clines = Object.entries(by).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ar')).map(([t, L]) => ({ st: Math.min(L.length, 3), tx: `أ. ${t} (${L.length}): ` + L.map(r => `${r.d.kind} «${nz(r.d.name)}»` + (r.d.ptn ? ` باستضافة ${r.d.ptn}` : '') + (r.d.tg ? ` (الفئة المستهدفة: ${r.d.tg})` : '') + dateTxt(r.date)).join('، ') + '.' })); }
    if (TAt.length) { const by = {}; TAt.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
      T.ac_tlines = Object.entries(by).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ar')).map(([t, L]) => ({ st: Math.min(L.length, 3), tx: `أ. ${t} (${L.length}): ` + L.map(r => `${r.d.kind} «${nz(r.d.name)}»` + dateTxt(r.date)).join('، ') + '.' })); }
    /* المسابقات والمشاركات الخارجية التي سجّلتها المعلمات لطالباتهن (تبقى أيضاً في «الإنجازات والمشاركات») */
    { const AHx = AH.filter(r => r.d && !/مستوى المدرسة/.test(r.d.lvl || '') && !/^قسم\s|^المدرسة$/.test(String(r.d.ent || '').trim()) && !TAx.some(x => x.d.t === r.d.t && String(x.date).slice(0, 10) === String(r.date).slice(0, 10)));
      if (AHx.length) { const by = {}; AHx.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
        const stuTx = v => { const x = String(v || '').trim(); if (!x || x === '0') return ''; const m = x.match(/^(\d+)/); return m ? ` بمشاركة (${+m[1]}) طالبات` : ` بمشاركة الطالبات: ${x}`; };
        const resTx = v => { const x = String(v || '').trim(); return x && x !== '0' ? `، النتيجة: ${x}` : ''; };
        T.ac_xlines = (T.ac_xlines || []).concat(Object.entries(by).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ar')).map(([t, L]) => ({ st: Math.min(L.length, 3), tx: `أ. ${t} (${L.length}): ` + L.map(r => `«${nz(r.d.name)}»` + ([r.d.ent, r.d.lvl].filter(Boolean).length ? ` (${[r.d.ent, r.d.lvl].filter(Boolean).join('، ')})` : '') + stuTx(r.d.stu) + resTx(r.d.res) + dateTxt(r.date)).join('؛ ') + '.' }))); } }
    const hdr = (k, L, tx) => { if (L && L.length && /^لم /.test(T[k] || '')) T[k] = tx(L.reduce((a, x) => a + (+(String(x.tx).match(/\((\d+)\)/) || [0, 1])[1]), 0)); };
    hdr('ac_int', T.ac_tlines, n => `نفّذت معلمات القسم (${n}) من الأنشطة والمبادرات الداخلية، وفق التفصيل الآتي:`);
    hdr('ac_ext', T.ac_xlines, n => `شاركت معلمات القسم وطالباتهن في (${n}) من الأنشطة خارج المدرسة، وفق التفصيل الآتي:`);
    hdr('ac_cp', T.ac_clines, n => `استضافت معلمات القسم (${n}) من الجهات الخارجية داخل المدرسة ضمن الشراكة المجتمعية، وفق التفصيل الآتي:`);
    /* الأنشطة وتعلّم الأقران المسجّلة في سبع سنابل (تبقى أيضاً في إجراءات رفع التحصيل) */
    { const SC = ctx.recs.filter(r => r.dept === dept && r.item === 'SAC' && r.d && inP(r.date, P));
      if (SC.length) { const by = {}; SC.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
        T.ac_slines = Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([t, L]) => ({ st: Math.min(L.length, 3), tx: `أ. ${t} (${L.length}): ` + L.map(r => `${nz(String(r.d.det || 'نشاط').replace(/\s*—\s*/, ': '))}` + (r.d.s ? ` (${r.d.s}` + (+r.d.n ? `، ${r.d.n} طالبات` : '') + ')' : '') + dateTxt(r.date)).join('؛ ') + '.' }));
        if (/^لم /.test(T.ac_int || '')) T.ac_int = `نفّذت معلمات القسم (${SC.length}) من الأنشطة الصفية وتعلّم الأقران المسجّلة في سبع سنابل، وفق التفصيل الآتي:`; } }
  }
  /* ما سجّلته المعلمات بأنفسهن يصب في الأولويات */
  const TQ = it => ctx.recs.filter(r => r.item === it && r.d && !q1Dup(r) && tIn(r) && (r.dept === dept || extraT.includes(r.d.t)));
  const tTA = TQ('TA'), tPV = TQ('TPV'), tWS = TQ('TWS'), tPA = TQ('TPA'), tEX = TQ('TEX');
  const tStu = new Set(); tPA.forEach(r => (r.d.stu && r.d.stu.length ? r.d.stu : [r.id]).forEach(x => tStu.add(x)));
  T.prio = [1, 2, 3, 4].map(p => {
    const parts = [];
    const ta = tTA.filter(r => (r.d.ps && r.d.ps.length ? r.d.ps : [r.d.p]).some(x => x && REF.PRIO.indexOf(x) + 1 === p));
    const ra = RAf.filter(r => (d(r).p ? REF.PRIO.indexOf(d(r).p) + 1 : 1) === p).map(r => d(r).item);
    const ac = ACf.filter(r => SEC.AC.prioFlag(d(r), p)).map(r => `«${d(r).name}»`);
    const ach = ACH.filter(r => d(r).p && REF.PRIO.indexOf(d(r).p) + 1 === p).length;
    const tAch = TQ('TACH').filter(r => (r.d.ps || []).some(x => REF.PRIO.indexOf(x) + 1 === p)); if (tAch.length) parts.push('مشاركات طالبات المعلمات في ' + tAch.map(r => `«${String(r.d.name || '').trim()}»`).join('، '));
    if (ra.length) parts.push(ra.join('، ')); if (ac.length) parts.push(ac.join('، ')); if (ach) parts.push(`(${ach}) من الإنجازات والمشاركات`);
    if (ta.length) parts.push('وما نفّذته المعلمات من ' + ta.map(r => `${r.d.kind || 'نشاط'} «${String(r.d.name || '').trim()}»`).join('، و'));
    let n = ra.length + ac.length + ach + ta.length + tAch.length;
    if (p === 2) {
      if (tPV.length) parts.push(`(${tPV.length}) من الزيارات التبادلية التي نفّذتها المعلمات`);
      if (tWS.length) parts.push(`(${tWS.length}) من الورش والممارسات المتميزة في تطوير الزملاء`);
      if (tEX.length) parts.push(`(${tEX.length}) من مشاركات المعلمات في فعاليات زميلاتهن وأنشطتهن تبادلاً للخبرات`);
      n += tPV.length + tWS.length + tEX.length;
    }
    if (p === 4 && tPA.length) { parts.push(`تواصل المعلمات مع أولياء أمور (${tStu.size}) من الطالبات`); n += tPA.length; }
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
    ['التحصيل الأكاديمي', [['التقييمات القصيرة', [T.as_short]], ['الاختبارات التحصيلية', [T.as_ach]], ['تحليل وقراءة النتائج', [T.as_anal]], ['إجراءات رفع التحصيل', [T.ra, ...(T.ra_lines ? [{ lines: T.ra_lines }] : [])]], ...(T.as_next ? [['الإجراءات المقترحة للفترة القادمة', [T.as_next]]] : [])]],
    ['التطوير المهني', [['التطوير الداخلي', [T.pd_int]], ['التطوير الخارجي', [T.pd_ext]], ['التنمية الذاتية', [T.pd_self]]]],
    ['الاجتماعات الأكاديمية', [['الخارجية', [T.mt_ext]], ['الداخلية', [T.mt_int]]]],
    ['الزيارات الأكاديمية', [['مدير المدرسة', [T.ov_pr]], ['نائب المدير للشؤون الأكاديمية', [T.ov_vp]], ['الموجه التربوي', [T.ov_sup]],
      ['المنسق', [T.v_sum, ...(vN ? T.v_ch : []), ...(T.v_spec || []), T.v_common_p].filter(Boolean)], ['الزملاء (الزيارات التبادلية)', (T.ov_peer_lines && T.ov_peer_lines.length) ? [{ lines: T.ov_peer_lines }, ...(/^لم /.test(T.ov_peer || '') ? [] : [T.ov_peer])] : [T.ov_peer]]]],
    ['الأنشطة المدرسية', [['داخلية', [T.ac_int, ...(T.ac_tlines ? [{ lines: T.ac_tlines, head: 'ما سجّلته المعلمات (مرتّبات حسب عدد الأعمال):' }] : []), ...(T.ac_slines ? [{ lines: T.ac_slines, head: 'الأنشطة الصفية وتعلّم الأقران (من سبع سنابل):' }] : [])]], ['الأنشطة الخارجية والشراكة المجتمعية', (() => { const E = /^لم /.test(T.ac_ext || '') && !T.ac_xlines, C = /^لم /.test(T.ac_cp || '') && !T.ac_clines; if (E && C) return ['لم تُسجَّل أنشطة خارجية أو شراكات مجتمعية خلال الفترة.']; return [...(E ? [] : [T.ac_ext, ...(T.ac_xlines ? [{ lines: T.ac_xlines, head: 'ما سجّلته المعلمات:' }] : [])]), ...(C ? [] : [T.ac_cp, ...(T.ac_clines ? [{ lines: T.ac_clines, head: 'ما سجّلته المعلمات (استضافة جهات خارجية):' }] : [])])]; })()]]],
    ['الشراكة مع أولياء الأمور', [['التواصل الفردي ومتابعة الطالبات', [T.pa_ind]], ['المجالس والفعاليات والمبادرات وشهادات الشكر', [T.pa_ev, ...(T.pa_tlines ? [{ lines: T.pa_tlines, head: 'تفصيل المعلمات والمنسقة:' }, T.pa_cnt] : [])]]]],
    ['تفعيل مركز مصادر التعلم', [[null, [T.lrc]]]],
    ['تفعيل التعليم الإلكتروني', [[null, [T.elearn]]]],
    ['الإنجازات والمشاركات', [['الإنجازات (مراكز وجوائز)', [T.ach]], ['المشاركات', [T.part]]]],
    ['تكليفات المعلمات والأعباء الوظيفية', [[null, [(T.tas_lines && T.tas_lines.length) ? { lines: T.tas_lines } : 'لم تُسجَّل تكليفات للمعلمات خلال الفترة.']]]],
    ['تحقيق أولويات المدرسة', REF.PRIO_FULL.map((p, i) => [p, [T.prio[i].txt], 1])],
    ['الاحتياط والتبديل', [['تغطية معلمات القسم للحصص', [T.sb_cov]], ['غياب معلمات القسم وتغطيته', [T.sb_abs]]]],
    ['التحديات والحلول المقترحة', [[null, [T.chal]]]],
  ];

  /* مؤشرات */
  const K = {
    visits: vN, visitedPct: NT ? vK / NT : 0, perTeacher: NT ? vN / NT : 0,
    planPct: planN ? planDone / planN : null, att: att, extPct: NM ? exK / NM : 0,
    meetings: nMT(MT), activities: AC.length, parents: PA.length, achievements: A1.length, participations: A2.length,
    peer: PV.length, peerMet: pvMet, elearn: T.el_n, challenges: CH.length, records: ctx.recs.filter(r => r.dept === dept && !/^SB[AC]$/.test(r.item) && inP(r.date || SEC.WS.when(r.d), P)).length,
    commonRecs: T.common.length, cpActions: T.common.length - T.commonOpen.length, commonOpen: T.commonOpen.length, subCover: T.sb_n || SBC.length, subAbs: SBA.length,
  };
  return { dept, P, coord, NT, teachers, T, rows, K };
}
