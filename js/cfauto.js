/* ==================================================================
   الميزان — التعبئة التلقائية لاستمارة متابعة أداء منسق القسم (الإشراف على أداء المنسق)
   · كل دليل من الأدلة الـ22 يُقدَّر من سجلات المنسقة في الفصل المختار، ويظهر بجانبه دليله (العدد أو النسبة)
   · التقدير هيّن ومنصف: سجل واحد على الأقل ← «مستكمل»؛ «مستكمل جزئياً» عند النقص الواضح فقط؛
     ولا يُكتب «غير مستكمل» تلقائياً أبداً: ما لا سجل له يظهر «يحتاج تأكيدكِ»
   · البنود التي لا تسجّلها المنصة تُعبّأ «مستكمل» بتقدير النائبة، ويبقى تعديلها بنقرة
   · النائبة صاحبة القرار: ما تعدّله يُحفظ ولا يكتب التحديث التلقائي فوقه
   ================================================================== */
const CF_N = 22;
function cfCtx(T, sem) {
  const R = semRange(sem), Pf = { name: sem, from: R.from, to: R.to };
  const inS = r => T.depts.includes(r.dept) && (r.date || '') >= R.from && (r.date || '') <= R.to;
  const recs = (it, f) => S.records.filter(r => r.item === it && r.d && inS(r) && (!f || f(r)));
  let Rs = []; try { Rs = T.depts.map(dp => buildReport(ctxFor(dp, Pf))); } catch (e) { Rs = []; }
  const K = k => Rs.reduce((a, x) => a + (+((x.K || {})[k]) || 0), 0);
  const avg = k => { const v = Rs.map(x => (x.K || {})[k]).filter(x => x != null && !isNaN(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const T2 = k => Rs.reduce((a, x) => a + (+((x.T || {})[k]) || 0), 0);
  // الزيارات وشمولها كما في تقرير القسم: معلمات القسم (ومن تتابعهن المنسقة) فقط
  const vis = T2('v_n'), nT = Rs.reduce((a, x) => a + (x.NT || 0), 0), cov = nT ? T2('v_k') / nT : null, wsDone = T2('pd_done_n');
  return { R, Pf, inS, recs, K, avg, vis, cov, wsDone };
}
const cfPct = x => Math.round(x * 100) + '%';
function cfAuto(T, sem) {
  const C = cfCtx(T, sem), { recs, K, avg, R, vis, cov: cov0, wsDone } = C;
  const ok = why => ({ v: 'مستكمل', why, src: 'auto' }), part = why => ({ v: 'مستكمل جزئياً', why, src: 'auto' });
  const need = why => ({ v: '', why, src: 'need' }), vp = why => ({ v: 'مستكمل', why, src: 'vp' }), nm = why => ({ v: 'لم يتم قياسه', why, src: 'auto' });
  const one = (n, why, empty) => n ? ok(why) : need(empty);
  const A = [];
  // 1) الإدارة والقيادة الأكاديمية
  A[0] = vp('لا تُسجَّل المشاركة في الخطة التشغيلية في المنصة — تقديركِ');
  { const apl = recs('APL').length + recs('APS').length, pl = recs('PL').length;
    const pls = T.depts.map(dp => typeof aplPlanOf === 'function' ? aplPlanOf(dp) : null).filter(Boolean);
    const pct = pls.length ? (() => { const st = aplStat(pls[0], aplDone(S.records, T.depts[0], R.to)); return ` · ما تحقق من الخطة ${st.pct}%`; })() : '';
    A[1] = one(apl + pl, `بنود الخطة المتابَعة: ${apl} · سجلات التخطيط: ${pl}${pct}`, 'لا توجد متابعة مسجلة للخطة السنوية في الفصل'); }
  { const ac = recs('AC').length; A[2] = one(ac, `الأنشطة والمبادرات الموثقة: ${ac}`, 'لا توجد أنشطة موثقة للقسم في الفصل'); }
  { const ended = S.periods.filter(p => p.sem === sem && p.to < today());
    const reps = S.reports.filter(r => T.depts.includes(r.dept) && ended.some(p => p.name === r.period));
    const sg = reps.filter(r => ['موقّع من المنسقة', 'معتمد'].includes(r.status)).length, req = ended.length * T.depts.length;
    A[3] = !req ? nm('لم تنتهِ فترة تقرير بعد في هذا الفصل') : !sg ? need(`لا تقارير موقّعة من ${req} مطلوبة`) : sg * 2 < req ? part(`التقارير الموقّعة: ${sg} من ${req}`) : ok(`التقارير الموقّعة: ${sg} من ${req}`); }
  // 2) التعليم والتعلم
  A[4] = vp('لا تُسجَّل مراجعة الخطط اليومية في المنصة — تقديركِ');
  { const v = vis, cov = cov0;
    A[5] = !v ? need('لا زيارات صفية مسجلة في الفصل') : cov != null && cov < 0.5 ? part(`الزيارات: ${v} · شمول المعلمات ${cfPct(cov)}`) : ok(`الزيارات: ${v}` + (cov != null ? ` · شمول المعلمات ${cfPct(cov)}` : '')); }
  { const n = recs('V', r => r.d.r1).length; A[6] = one(n, `زيارات بتوصيات موثقة: ${n}`, 'لا توجد استمارات إشراف بتوصيات موثقة'); }
  { const n = recs('LR', r => typeof lrIsEL === 'function' ? lrIsEL(r.d.k) : /الإلكتروني/.test(r.d.k || '')).length || K('elearn');
    A[7] = one(n, `توظيف أدوات التعليم الإلكتروني: ${n}`, 'لا يوجد توثيق لدمج التكنولوجيا في الفصل'); }
  // 3) تقييم تعلّم الطلبة
  { const n = recs('AS').length; A[8] = one(n, `سجلات التقييمات والاختبارات: ${n}`, 'لا توجد اختبارات مسجلة في الفصل'); }
  { const n = recs('AS', r => SEC.AS.an(r.d)).length + recs('SAN').length; A[9] = one(n, `تحليلات وقراءات نتائج موثقة: ${n}`, 'لا توجد قراءة موثقة للنتائج'); }
  { const ra = recs('RA'), im = ra.filter(r => r.d.imp).length, sen = recs('SEN').length;
    A[10] = im ? ok(`إجراءات رفع التحصيل: ${ra.length} · بأثر موثق: ${im}` + (sen ? ` · حصص إثرائية: ${sen}` : '')) : ra.length ? part(`إجراءات رفع التحصيل: ${ra.length} دون أثر موثق`) : need('لا توجد إجراءات رفع تحصيل مسجلة'); }
  // 4) تطوير أداء معلمي القسم
  { const pd = (S.pd || []).filter(x => T.depts.some(dp => String(x.dept).split('|').includes(dp)) && x.need).length;
    A[11] = pd ? ok(`احتياجات تدريبية مدرجة في خطة التطوير المهني: ${pd}`) : vp('لا يُسجَّل حصر الاحتياجات في المنصة — تقديركِ'); }
  A[12] = vp('لا يُسجَّل تصنيف المعلمات في المنصة — تقديركِ');
  { const pp = avg('planPct'), ws = wsDone;
    A[13] = !ws ? need('لا توجد ورش منفذة من خطة التطوير في الفصل') : pp != null && pp < 0.5 ? part(`الالتزام بخطة التطوير: ${cfPct(pp)} · ورش منفذة: ${ws}`) : ok((pp != null ? `الالتزام بخطة التطوير: ${cfPct(pp)} · ` : '') + `ورش منفذة: ${ws}`); }
  { const ws = wsDone, ex = recs('EX').length; A[14] = one(ws + ex, `برامج داخلية: ${ws} · خارجية: ${ex}`, 'لا توجد برامج تدريبية موثقة'); }
  { const ws = wsDone, im = recs('WS', r => r.d.o).length + recs('CP').length;
    A[15] = im ? ok(`ورش بأثر موثق وإجراءات توصيات مشتركة: ${im}`) : ws ? part(`ورش منفذة: ${ws} دون قياس أثر موثق`) : need('لا يوجد قياس أثر للتطوير'); }
  // 5) الجوانب المهنية والشخصية
  { const ex = recs('EX', r => !r.d.t || r.d.t === T.name).length, tw = S.records.filter(r => r.item === 'TWS' && r.d && r.d.t === T.name && C.inS(r)).length;
    A[16] = one(ex + tw, `مشاركات المنسقة في التطوير: ${ex + tw}`, 'لا توجد مشاركات مسجلة للمنسقة في التطوير الذاتي'); }
  { const n = recs('CH').length; A[17] = n ? ok(`تحديات موثقة بحلولها: ${n}`) : need('لا توجد تحديات وحلول موثقة — رأيكِ'); }
  { const n = recs('ACH').length + recs('AC', r => /مسابق|إثرائ|بحث/.test([r.d.ty, r.d.name].join(' '))).length + recs('LR').length;
    A[18] = one(n, `مسابقات وإثراء ومصادر تعلم وإنجازات: ${n}`, 'لا توجد سجلات إثراء للمادة'); }
  A[19] = vp('لا يوجد مؤشر مباشر لدقة الأعمال — تقديركِ');
  A[20] = vp('لا يوجد مؤشر مباشر للعلاقة الإيجابية — تقديركِ');
  { const ms = []; for (let d = new Date(C.R.from); d <= new Date(C.R.to < today() ? C.R.to : today()); d.setMonth(d.getMonth() + 1)) ms.push(d.toISOString().slice(0, 7));
    const over = typeof prqUsed === 'function' ? ms.filter(m => prqUsed(T.name, m) > PRQ_LIMIT) : [];
    A[21] = over.length ? need(`تجاوز رصيد الاستئذان في ${over.length} شهر`) : ok('الالتزام برصيد الاستئذان «إذنٌ مُيسَّر»'); }
  return A;
}

/* ---------------------------------------------------- التوصيات العامة: شكر، فإشادة من سجلاتها هي، فتوصيات لطيفة للجزئي فقط */
const CF_REC = [
  'المشاركة في إعداد الخطة التشغيلية للمدرسة بما يعكس احتياجات القسم',
  'متابعة تنفيذ بنود الخطة السنوية للقسم شهرياً وتوثيق ما تحقق منها',
  'تنويع أنشطة القسم ومبادراته وتوثيق أثرها في تعلّم الطالبات',
  'إعداد التقارير الأكاديمية وتوقيعها في مواعيدها المحددة',
  'مراجعة الخطط اليومية للمعلمات وتقديم التغذية الراجعة البنّاءة حولها',
  'استكمال الزيارات الصفية لجميع معلمات القسم وفق تصنيفهن، تحقيقاً لمراقبة جودة التعليم والتعلم من خلال المشاهدة الصفية',
  'توثيق التوصيات في استمارات الإشراف على أداء المعلمات ومتابعة تنفيذها',
  'متابعة دمج التكنولوجيا وأدوات التعليم الإلكتروني في الحصص عبر نظام قطر للتعليم',
  'متابعة إعداد الاختبارات الداخلية وفق جداول المواصفات',
  'إعداد قراءة وصفية وكمية للنتائج وتوظيفها في دعم تعلّم الطالبات',
  'توثيق أثر إجراءات رفع التحصيل على نتائج الطالبات المستهدفات',
  'المشاركة في حصر الاحتياجات التدريبية لمعلمات القسم',
  'تصنيف معلمات القسم وبناء خطة الزيارات على أساسه',
  'متابعة تنفيذ ورش خطة التطوير المهني في مواعيدها',
  'توثيق البرامج التدريبية الداخلية والخارجية لمعلمات القسم',
  'قياس أثر التطوير المهني في الممارسات الصفية من خلال الزيارات اللاحقة',
  'المشاركة في برامج التنمية المهنية الذاتية وشبكات التعلم المهنية',
  'توثيق التحديات وحلولها ومتابعة أثر القرارات المتخذة',
  'إثراء المادة العلمية بمسابقات ومصادر تعلم ومستجدات التخصص',
  'مراجعة الأعمال والتقارير قبل اعتمادها لضمان دقتها',
  'تعزيز العلاقة الإيجابية مع معلمات القسم والزميلات',
  'الالتزام برصيد الاستئذان الشهري والمواظبة',
];
function cfFacts(T, sem) {
  const { recs, K, avg, vis, cov: cov0 } = cfCtx(T, sem), out = [];
  const R = semRange(sem), inS = r => (r.date || '') >= R.from && (r.date || '') <= R.to;
  // عدد أنشطة القسم وترتيبه بين الأقسام
  const byD = {}; S.records.filter(r => r.item === 'AC' && inS(r)).forEach(r => byD[r.dept] = (byD[r.dept] || 0) + 1);
  // الترتيب بين الأقسام بالمعدل لكل معلمة، حتى لا يظلم القسمَ الصغيرَ قلةُ معلماته
  const nTd = dp => Math.max(1, (S.staff || []).filter(x => x.dept === dp && !/منسق/.test(x.role || '')).length);
  const ac = T.depts.reduce((a, dp) => a + (byD[dp] || 0), 0), myRate = ac / T.depts.reduce((a, dp) => a + nTd(dp), 0);
  const rank = Object.entries(byD).filter(([dp, n]) => !T.depts.includes(dp) && n / nTd(dp) > myRate).length + 1;
  if (ac >= 3) out.push(`وثّق القسم (${ac}) نشاطاً ومبادرة${rank <= 3 ? '، وهو من أعلى الأقسام في المدرسة' : ''}، وهذا يدل على حيوية القسم وحرصها على إثراء تعلّم الطالبات`);
  const v = vis, cov = cov0;
  if (v && cov != null && cov >= 0.99) out.push(`شملت زياراتها الصفية (${v}) جميع معلمات القسم، وهذا يدل على متابعتها الدقيقة للممارسات الصفية`);
  const ws = recs('WS', r => /تم|نُفّذ|منفذ/.test(r.d.g || '') || r.d.h).map(r => (r.d.b && r.d.b !== REF.OUT_OF_PLAN ? r.d.b : r.d.c) || '').filter(Boolean);
  if (ws.length) out.push(`نفّذ القسم ${ws.length > 1 ? 'ورشتي' : 'ورشة'} «${ws.slice(0, 2).join('» و«')}»، وهذا يدل على حرصها على التطوير المهني لمعلمات القسم`);
  const im = recs('RA', r => r.d.imp).length;
  if (im >= 2) out.push(`وثّقت أثر (${im}) من إجراءات رفع التحصيل، وهذا يدل على وعيها بقياس الأثر لا مجرد تنفيذ الإجراء`);
  const pls = T.depts.map(dp => typeof aplPlanOf === 'function' ? aplPlanOf(dp) : null).filter(Boolean);
  if (pls.length) { const st = aplStat(pls[0], aplDone(S.records, T.depts[0], R.to)); if (st.pct >= 40) out.push(`بلغ ما تحقق من خطة القسم السنوية (${st.pct}%)، وهذا يدل على التزامها بالتخطيط ومتابعته`); }
  const an = recs('AS', r => SEC.AS.an(r.d)).length + recs('SAN').length;
  if (an >= 2 && out.length < 3) out.push(`وثّقت (${an}) قراءات وتحليلات للنتائج، وهذا يدل على اعتمادها على البيانات في دعم تعلّم الطالبات`);
  return out.slice(0, 3);
}
function cfCompose(T, sem, d, D) {
  let t = `أتقدم بخالص الشكر والتقدير للأستاذة ${T.name} منسقة قسم ${T.depts.join(' و')} على جهودها المخلصة وعطائها المتميز خلال ${sem}`;
  const facts = uniqA([...cfFacts(T, sem), ...(d.pos || []).map(cleanEnd)]);
  t += facts.length ? '؛ إذ ' + facts.join('، كما ') + '.' : '.';
  const part = D.rows.map((x, i) => i).filter(i => d.ev[i] === 'مستكمل جزئياً' || d.ev[i] === 'غير مستكمل');
  const why = (d.auto || {});
  const recs = uniqA([...part.map(i => (d.nt[i] && d.nt[i] !== D.rows[i].r[0] ? d.nt[i] : CF_REC[i] || D.rows[i].r[0]) + (why[i] ? ` (${why[i]})` : '')), ...(d.neg || []).map(x => 'معالجة ' + cleanEnd(x).replace(/^الحاجة إلى /, ''))]).map(cleanEnd);
  if (recs.length) t += '\n\nوأوصي بـ:\n' + recs.map(x => '• ' + x + '.').join('\n');
  t += '\n\nمع خالص التمنيات بدوام التميز والعطاء.';
  return t;
}

/* ---------------------------------------------------- ملف المنسق الرقمي (تنظيم ملفات ووثائق عمل المنسق) */
function cfFile(T, sem) {
  const { recs } = cfCtx(T, sem);
  const R = semRange(sem);
  const has = (n, txt) => ({ n, txt });
  const pd = (S.pd || []).filter(x => T.depts.some(dp => String(x.dept).split('|').includes(dp)));
  const reps = S.reports.filter(r => T.depts.includes(r.dept) && S.periods.some(p => p.name === r.period && p.sem === sem));
  const plan = T.depts.some(dp => typeof aplPlanOf === 'function' && aplPlanOf(dp));
  return [
    ['الخطط اليومية والفصلية', [
      ['1-1 الخطة الفصلية', has(recs('PL', r => /فصل/.test(r.d.c || '')).length, 'سجلات الخطط الفصلية')],
      ['1-2 الخطط اليومية', has(null, 'خارج المنصة (نظام قطر للتعليم)')],
      ['1-3 نماذج من مراجعة المنسق للخطط اليومية', has(null, 'خارج المنصة')]]],
    ['التحصيل الأكاديمي', [
      ['2-1 الاختبارات الداخلية والقصيرة', has(recs('AS').length, 'سجلات التقييمات')],
      ['2-2 قراءة نتائج الطلاب والمقارنات', has(recs('AS', r => SEC.AS.an(r.d)).length + recs('SAN').length, 'تحليلات موثقة')],
      ['2-3 إجراءات رفع التحصيل وقياس أثرها', has(recs('RA').length, 'إجراءات رفع التحصيل')]]],
    ['التطوير المهني', [
      ['3-1 حصر الاحتياجات التدريبية', has(pd.filter(x => x.need).length, 'احتياجات في خطة التطوير')],
      ['3-2 خطة التطوير المهني وأدلة تنفيذها', has(pd.length + recs('WS').length, 'ورش الخطة وتنفيذها')],
      ['3-3 خطة تطوير معلم مستجد (إن وجد)', has(null, 'إن وجد — خارج المنصة')],
      ['3-4 خطة تحسين أداء معلم (إن وجد)', has(null, 'إن وجد — خارج المنصة')],
      ['3-5 استمارات الإشراف على أداء المعلم', has(recs('V').length, 'زيارات صفية')]]],
    ['متابعة القسم', [
      ['4-1 الخطة السنوية للقسم', has(plan ? 1 : 0, plan ? 'مرتّبة في المنصة' : 'لم تُرفع بعد')],
      ['4-2 محاضر اجتماعات القسم', has(recs('MT').length, 'اجتماعات')],
      ['4-3 تقارير المنسق للنائب', has(reps.length, 'تقارير الفترات')]]],
  ];
}
function cfFileHTML(T, sem) {
  const F = cfFile(T, sem); let ok = 0, all = 0;
  const body = F.map(([h, L]) => `<div class="cff-g"><b>${esc(h)}</b>${L.map(([t, x]) => { if (x.n != null) { all++; if (x.n) ok++; }
    return `<div class="cff-i ${x.n == null ? 'out' : x.n ? 'ok' : 'no'}"><span>${x.n == null ? '◌' : x.n ? '✓' : '✕'}</span>${esc(t)}<small>${x.n == null ? esc(x.txt) : x.n ? `${esc(x.txt)}: ${x.n}` : 'لا يوجد في المنصة'}</small></div>`; }).join('')}</div>`).join('');
  return { ok, all, html: `<div class="card"><h2>📁 ملف المنسق الرقمي <span class="sub">ما هو موجود في المنصة لقسم ${esc(T.depts.join(' و'))} وما ينقص — ${ok} من ${all}</span></h2><div class="cff">${body}</div></div>` };
}

/* ---------------------------------------------------- لوحة الأقسام (للنائبة والمديرة فقط) */
function cfSummary(T, sem) {
  const rec = S.records.find(r => r.item === 'CF' && r.d.tk === T.key && r.d.sem === sem);
  const A = cfAuto(T, sem), ev = i => (rec && rec.d.ev && rec.d.ev[i]) || A[i].v;
  const D = formDef('coord');
  const c = [], p = [], n = [];
  for (let i = 0; i < D.rows.length; i++) { const v = ev(i); if (v === 'مستكمل') c.push(i); else if (v === 'مستكمل جزئياً' || v === 'غير مستكمل') p.push(i); else if (!v) n.push(i); }
  const strong = c.filter(i => A[i].src === 'auto').slice(0, 3).map(i => D.rows[i].e.replace(/\.$/, ''));
  return { rec, A, c, p, n, strong, weak: p.map(i => D.rows[i].e.replace(/\.$/, '')), D };
}
function cfDash(el, T, sem) {
  const cards = T.map(t => { const x = cfSummary(t, sem), f = cfFileHTML(t, sem), r = x.rec;
    const st = r && r.d.ok ? `<span class="chip ok">معتمدة ${dm(r.d.ok)}</span>${r.d.csig ? ' <span class="chip ok">وقّعتها المنسقة</span>' : ''}` : r ? '<span class="chip warn">محفوظة — لم تُعتمد</span>' : '<span class="chip">تعبئة تلقائية — لم تُحفظ</span>';
    return `<div class="cfd"><div class="cfd-h"><div><b>قسم ${esc(t.depts.join(' و'))}</b><small>أ. ${esc(t.name)}</small></div>${st}</div>
      <div class="cfd-k"><span class="ok"><b>${x.c.length}</b>مستكمل</span><span class="warn"><b>${x.p.length}</b>جزئي</span><span class="need"><b>${x.n.length}</b>يحتاج تأكيدكِ</span><span><b>${f.ok}/${f.all}</b>الملف الرقمي</span></div>
      ${x.strong.length ? `<div class="cfd-l"><i>نقاط القوة</i>${x.strong.map(s => `<span>✓ ${esc(s)}</span>`).join('')}</div>` : ''}
      ${x.weak.length ? `<div class="cfd-l w"><i>يحتاج إلى تحسين</i>${x.weak.map(s => `<span>• ${esc(s)}</span>`).join('')}</div>` : ''}
      <button class="btn sm" data-o="${esc(t.key)}">${r ? 'فتح الاستمارة' : 'مراجعة الاستمارة'}</button></div>`; }).join('');
  return `<div class="cfds">${cards}</div>`;
}

/* ---------------------------------------------------- المنسقة: استمارتها هي فقط بعد اعتماد النائبة */
async function C_mycf(el) {
  await loadForms(); setTitle('استمارة متابعة أدائي');
  const L = S.records.filter(r => r.item === 'CF' && r.d && r.d.ok).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (!L.length) { el.innerHTML = '<div class="card"><div class="empty">لم تُعتمد استمارة متابعة أدائكِ بعد. ستظهر هنا فور اعتمادها من النائبة الأكاديمية، ويصلكِ إشعار بالبريد.</div></div>'; return; }
  const D = formDef('coord'); const r = L.find(x => x.id === S.mycf) || L[0];
  const T = { key: r.d.tk, name: r.d.name, depts: S.user.dept, dept: r.dept, form: 'coord', role: r.d.role || '' };
  el.innerHTML = `${L.length > 1 ? `<div class="tabs">${L.map(x => `<button class="${x === r ? 'on' : ''}" data-m="${x.id}">${esc(x.d.sem)}</button>`).join('')}</div>` : ''}
    <div class="card"><div class="row"><h2 style="margin:0">${esc(D.title)} — ${esc(r.d.sem)}</h2><span class="sp"></span>
      ${r.d.csig ? `<span class="chip ok">وقّعتِها ${dm(r.d.csig)}</span>` : '<button class="btn" id="cfSg">✍️ توقيع الاستلام</button>'} <button class="btn sec" id="cfPr">معاينة وطباعة</button></div>
      <div class="note" style="margin-top:8px">اعتمدتها النائبة الأكاديمية بتاريخ ${dmy(r.d.ok)}. التوقيع يعني الاطلاع على الاستمارة واستلامها.</div></div>
    <div class="card"><div class="tbl"><table class="t"><tr><th>المجال</th><th>الأدلة</th><th>المتابعة</th></tr>${D.rows.map((x, i) => `<tr>${x.first ? `<td rowspan="${x.span}" style="background:var(--maroon-l);color:var(--maroon);font-weight:700;text-align:center">${esc(x.dom)}</td>` : ''}<td style="text-align:justify">${esc((r.d.evx && r.d.evx[i]) || x.e)}</td><td><span class="chip ${SC_CHIP[r.d.ev[i]] || ''}">${esc(cfL(r.d.ev[i] || '—'))}</span></td></tr>`).join('')}</table></div></div>
    <div class="card"><h2>التوصيات العامة</h2><div style="white-space:pre-wrap;line-height:2;text-align:justify">${esc(r.d.gen || '')}</div></div>`;
  $$('[data-m]', el).forEach(b => b.onclick = () => { S.mycf = b.dataset.m; show(); });
  $('#cfPr', el).onclick = async () => { await showPaper(el, D.title, fileInner(D, T, r, 'CF'), ''); $('#pBack').onclick = () => show(); };
  if ($('#cfSg', el)) $('#cfSg', el).onclick = async () => { if (!confirm('توقيع استلام الاستمارة والاطلاع عليها؟')) return;
    const j = await call('cfSign', { id: r.id }); const i = S.records.findIndex(x => x.id === r.id); if (i >= 0) S.records[i] = j.record; toast('تم التوقيع ✓'); show(); };
}

/* ---------------------------------------------------- الأدلة المكتوبة لكل منسقة (تحلّ محل نص الأدلة الثابت في الطباعة)
   تُبنى من سجلات الميزان (سجلات المنسقة وما سجّلته المعلمات) بعبارات «حرصت المنسقة على…»، وتعدّلها النائبة كما تشاء */
function cfEvid(T, sem) {
  const C = cfCtx(T, sem), { recs, vis, cov, wsDone } = C;
  const nm = n => { const p = String(n || '').trim().split(/\s+/); return p.length > 2 ? p[0] + ' ' + p[p.length - 1] : p.join(' '); };
  const q = (a, k = 2) => [...new Set(a.filter(Boolean).map(x => String(x).trim().replace(/\s*\(.*$/, '')))].slice(0, k).map(x => '«' + x + '»').join(' و');
  const n = x => `(${x})`;
  const A = (x, w) => x === 1 ? w[0] : x === 2 ? w[1] : `(${x}) ` + (x >= 3 && x <= 10 ? w[2] : w[3]);
  const W = { mt: ['اجتماعاً واحداً', 'اجتماعين', 'اجتماعات', 'اجتماعاً'], ac: ['نشاطاً واحداً', 'نشاطين', 'أنشطة ومبادرات', 'نشاطاً ومبادرة'], ext: ['مشاركة خارجية واحدة', 'مشاركتين خارجيتين', 'مشاركات خارجية وشراكات مجتمعية', 'مشاركة خارجية وشراكة مجتمعية'], mr: ['مرة واحدة', 'مرتين', 'مرات', 'مرة'], it: ['بنداً واحداً', 'بندين', 'بنود', 'بنداً'], rep: ['تقريراً واحداً', 'تقريرين', 'تقارير', 'تقريراً'], v: ['زيارة واحدة', 'زيارتين', 'زيارات', 'زيارة'], vf: ['زيارة متابعة واحدة', 'زيارتي متابعة', 'زيارات متابعة', 'زيارة متابعة'], t: ['معلمة واحدة', 'معلمتين', 'معلمات', 'معلمة'], pr: ['ممارسة موثقة', 'ممارستين موثقتين', 'ممارسات موثقة', 'ممارسة موثقة'], ws: ['ورشة واحدة', 'ورشتين', 'ورش', 'ورشة'], as: ['تقييماً واحداً', 'تقييمين', 'تقييمات واختبارات داخلية', 'تقييماً واختباراً داخلياً'], an: ['تحليلاً واحداً', 'تحليلين', 'تحليلات كمية ووصفية', 'تحليلاً كمياً ووصفياً'], ra: ['إجراءً واحداً', 'إجراءين', 'إجراءات', 'إجراءً'], pg: ['برنامجاً واحداً', 'برنامجين', 'برامج', 'برنامجاً'], ch: ['تحدياً واحداً', 'تحديين', 'تحديات', 'تحدياً'], cm: ['مسابقة أو نشاط إثرائي', 'مسابقتين وأنشطة إثرائية', 'مسابقات وأنشطة إثرائية', 'مسابقة ونشاطاً إثرائياً'], ach: ['إنجازاً واحداً', 'إنجازين', 'إنجازات', 'إنجازاً'], ex: ['اختباراً واحداً', 'اختبارين', 'اختبارات', 'اختباراً'], rc: ['توصية مشتركة', 'توصيتين مشتركتين', 'توصيات مشتركة', 'توصية مشتركة'], mo: ['شهر واحد', 'شهرين', 'أشهر', 'شهراً'] };
  const cut = t => String(t || '').split(/[؛]/)[0].trim().replace(/[.،\s]+$/, '');
  const wsT = r => (r.d.b === REF.OUT_OF_PLAN || !r.d.b ? r.d.c : r.d.b) || '';
  const done = recs('WS', r => /^تمت/.test(r.d.g || ''));
  const coordName = T.name;
  const E = [];
  // 1) الإدارة والقيادة الأكاديمية
  { const mt = recs('MT', r => /القيادة المدرسية/.test(r.d.ty || ''));
    const tp = q(mt.map(r => r.d.t1).filter(t => /خطة|المراجعة الذاتية|التحصيل/.test(t || '')));
    E[0] = mt.length ? `شاركت المنسقة في ${mt.length === 1 ? 'اجتماع واحد' : A(mt.length, W.mt)} مع القيادة المدرسية${tp ? (mt.length > 1 ? '، منها ' : '، موضوعه ') + tp : ''}، وأسهمت في إعداد الخطة التشغيلية بما يخص القسم.` : 'شاركت المنسقة في إعداد الخطة التشغيلية للمدرسة بما يخص القسم.'; }
  { const pl = recs('PL'), an = pl.find(r => /السنوية/.test(r.d.c || '')), fs = pl.filter(r => /الفصلية/.test(r.d.c || '')).length, apl = recs('APL').length + recs('APS').length;
    E[1] = `${an ? 'أعدّت المنسقة خطة القسم السنوية' : 'تابعت المنسقة خطة القسم السنوية'}${fs ? `، وتابعت مطابقة الخطط الفصلية للمعلمات ${A(fs, W.mr)}` : ''}${apl ? `، ووثّقت متابعة ${A(apl, W.it)} من بنود الخطة في المنصة` : ''}.`; }
  { const ac = recs('AC'); const ext = ac.filter(r => /شراكة|خارجي|التوجيه/.test([r.d.ty, r.d.io].join(' '))).length;
    E[2] = ac.length ? `حرصت المنسقة على تنفيذ ${A(ac.length, W.ac)} للقسم، منها ${q(ac.map(r => r.d.name), 3)}${ext ? `، وشملت ${A(ext, W.ext)}` : ''}.` : 'لا توجد أنشطة موثقة للقسم في الفصل، ولا يتبنى القسم أنشطة خاصة بالمادة.'; }
  { const reps = S.reports.filter(r => T.depts.includes(r.dept) && S.periods.some(p => p.name === r.period && p.sem === sem));
    const an = recs('AS', r => SEC.AS.an(r.d) && /رفع التقرير|التقرير/.test(r.d.an || '')).length;
    E[3] = `أعدّت المنسقة تقرير القسم الدوري${reps.length ? ` لفترات الفصل` : ''}${an ? `، ورفعت ${A(an, W.rep)} لتحليل النتائج` : ''}${recs('MT').length ? `، ووثّقت محاضر ${A(recs('MT').length, W.mt)} في المنصة` : ''}.`; }
  // 2) التعليم والتعلم
  { const pl = recs('PL', r => /الفصلية/.test(r.d.c || '')), ac = pl.map(r => r.d.ac).find(x => x && x.length > 30);
    E[4] = pl.length ? `تابعت المنسقة الخطط الفصلية واليومية للمعلمات ${A(pl.length, W.mr)}، وأكدت مطابقتها للخطة الفصلية${ac ? `، ومن إجراءاتها: ${cut(ac)}` : ''}.` : 'تابعت المنسقة الخطط اليومية للمعلمات على نظام قطر للتعليم.'; }
  { const V = recs('V'), seen = new Set(V.map(r => r.d.t)), fu = V.filter(r => /متابعة/.test(r.d.ty || '')).length, nT = Math.round(cov != null ? seen.size / Math.max(cov, 0.01) : seen.size);
    E[5] = V.length ? `نفّذت المنسقة ${A(vis || V.length, W.v)} صفية شملت ${cov != null && cov >= 0.99 ? 'جميع معلمات القسم' : A(seen.size, W.t)}${fu ? `، منها ${A(fu, W.vf)} للتحقق من تنفيذ التوصيات` : ''}${V.some(r => /الثالثة|الرابعة|الخامسة/.test(r.d.ty || '')) ? '، وكثّفت زياراتها لمن تحتاج إلى دعم' : ''}.` : 'لا توجد زيارات صفية مسجلة في الفصل.'; }
  { const V = recs('V'), Vd = V.filter(r => (r.d.r1 || '').trim() && !/^لا يوجد/.test(r.d.r1.trim())), ex = Vd.map(r => r.d.r1).find(x => x.length > 20 && x.length < 110);
    E[6] = V.length ? `حرّرت المنسقة استمارات الإشراف في ${A(V.length, W.v)}، ووثّقت نقاط القوة والتوصيات في ${Vd.length === V.length ? 'جميعها' : A(Vd.length, W.v) + ' منها'}${ex ? `، ومن توصياتها: «${cut(ex)}»` : ''}.` : 'لا توجد استمارات إشراف مسجلة.'; }
  { const lr = recs('LR', r => typeof lrIsEL === 'function' ? lrIsEL(r.d.k) : /الإلكتروني/.test(r.d.k || '')), ai = done.filter(r => /AI|ذكاء|Gemini|Chalk|تكنولوجيا|رقمي|Canva/i.test(wsT(r))).length;
    E[7] = lr.length || ai ? `تابعت المنسقة توظيف التكنولوجيا ونظام قطر للتعليم${lr.length ? ` في ${A(lr.length, W.pr)}، ${lr.length > 1 ? 'منها' : 'هي'} ${q(lr.map(r => r.d.e))}` : ''}${ai ? `، وحضرت معلمات القسم ${A(ai, W.ws)} في التقنية والذكاء الاصطناعي` : ''}.` : 'لا يوجد توثيق لمتابعة دمج التكنولوجيا في الفصل.'; }
  // 3) تقييم تعلّم الطلبة
  { const as = recs('AS'), ty = {}; as.forEach(r => ty[r.d.ty] = (ty[r.d.ty] || 0) + 1);
    E[8] = as.length ? `تابعت المنسقة إعداد ${A(as.length, W.as)} (${Object.entries(ty).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${v}`).join('، ')}) في جميع المستويات.` : 'لا توجد اختبارات داخلية مسجلة في الفصل.'; }
  { const an = recs('AS', r => SEC.AS.an(r.d) && !/قيد/.test(r.d.an || '')), pend = recs('AS', r => /قيد/.test(r.d.an || '')).length;
    E[9] = an.length ? `أعدّت المنسقة ${A(an.length, W.an)} للنتائج${an.length > 1 ? '، منها' : ' هو'} ${q(an.map(r => `${r.d.ty} (${r.d.lvl})`))}${pend ? `، وما زال تحليل ${A(pend, W.ex)} قيد الإنجاز` : ''}.` : pend ? `بدأت المنسقة تحليل ${A(pend, W.ex)} من نتائج الاختبارات، وما زالت قيد التحليل.` : 'لا توجد تحليلات موثقة للنتائج في الفصل.'; }
  { const ra = recs('RA'), im = ra.filter(r => r.d.imp && !/قيد/.test(r.d.imp)), tg = ra.filter(r => r.d.tg && !/جميع/.test(r.d.tg)).length;
    E[10] = ra.length ? `نفّذ القسم ${A(ra.length, W.ra)} لرفع التحصيل${tg ? `، منها ${tg === 1 ? 'إجراء واحد موجّه' : tg === 2 ? 'إجراءان موجّهان' : A(tg, W.ra) + ' موجّهة'} لفئات محددة` : ''}، ${im.length ? `ووثّقت المنسقة أثر ${A(im.length, W.ra)} منها (${q(im.map(r => r.d.imp), 1).replace(/[«»]/g, '')})` : 'ولم يُوثَّق أثرها بعد'}.` : 'لا توجد إجراءات رفع تحصيل مسجلة.'; }
  // 4) تطوير أداء المعلمين
  { const pd = (S.pd || []).filter(x => T.depts.some(dp => String(x.dept).split('|').includes(dp)));
    E[11] = pd.length ? `شاركت المنسقة في حصر الاحتياجات التدريبية لمعلمات القسم، وأدرجت ${A(pd.length, W.pg)} في خطة التطوير المهني، منها ${q(pd.map(x => x.title))}.` : 'شاركت المنسقة في حصر الاحتياجات التدريبية لمعلمات القسم.'; }
  { const V = recs('V'), byT = {}; V.forEach(r => byT[r.d.t] = (byT[r.d.t] || 0) + 1); const many = Object.entries(byT).filter(([, c]) => c >= 3).map(([t]) => nm(t));
    const nw = recs('WS', r => /مستجد/.test(wsT(r)) || /مستجد/.test(r.d.c || '')).length + recs('EX', r => /مستجد/.test(r.d.name || '')).length;
    E[12] = `وزّعت المنسقة زياراتها وفق احتياج معلمات القسم${many.length ? `، فكثّفت متابعة ${many.slice(0, 3).map(t => 'أ. ' + t).join(' و')}` : ''}${nw ? '، وخصّت المعلمة المستجدة ببرامج دعم' : ''}.`; }
  { const pl = done.filter(r => r.d.b && r.d.b !== REF.OUT_OF_PLAN), pst = recs('WS', r => /رُحّلت|أُلغيت|تأجيل/.test(r.d.g || '') && !/^تمت/.test(r.d.g || ''));
    E[13] = `تابعت المنسقة تنفيذ خطة التطوير المهني، ونُفّذت ${A(wsDone, W.ws)}${pl.length ? `، منها من الخطة ${q(pl.map(wsT))}` : ''}${pst.length ? `، ورُحّلت أو أُلغيت ${A(pst.length, W.ws)}` : ''}.`; }
  { const ex = recs('EX');
    E[14] = `وثّقت المنسقة ${A(done.length, W.pg)} تدريبية داخلية${ex.length ? ` و${A(ex.length, W.pg)} خارجية لمعلمات القسم` : ''}${done.length ? `، منها ${q(done.map(wsT))}` : ''}.`; }
  { const o = done.filter(r => r.d.o), cp = recs('CP'), m = done.map(r => r.d.m).find(Boolean);
    E[15] = o.length || cp.length ? `قاست المنسقة أثر التطوير${o.length ? ` في ${A(o.length, W.ws)} (${cut(o[0].d.o)})` : ''}${cp.length ? `${o.length ? '، و' : ' '}حوّلت ${A(cp.length, W.rc)} إلى إجراءات للقسم (${q(cp.map(r => r.d.proc), 1).replace(/[«»]/g, '')})` : ''}.` : `نُفّذت ورش التطوير${m ? ` وكان من إيجابياتها «${cut(m)}»` : ''}، ولم يُوثَّق قياس أثرها في الممارسات الصفية بعد.`; }
  // 5) الجوانب المهنية والشخصية
  { const ex = recs('EX', r => r.d.t === coordName), tw = S.records.filter(r => r.item === 'TWS' && r.d && r.d.t === coordName && C.inS(r)), pres = done.filter(r => (r.d.pres || '').includes(coordName.split(' ')[0]));
    E[16] = ex.length + tw.length + pres.length ? `حرصت المنسقة على تطوير ذاتها${ex.length + tw.length ? ` بحضور ${ex.length + tw.length === 1 ? 'برنامج واحد' : A(ex.length + tw.length, W.pg) + ' وورش'}` : ''}${pres.length ? `${ex.length + tw.length ? '، و' : ' '}بتقديم ${A(pres.length, W.ws)} لمعلمات القسم منها ${q(pres.map(wsT), 1)}` : ''}.` : 'لا توجد مشاركات مسجلة للمنسقة في التطوير الذاتي في الفصل.'; }
  { const ch = recs('CH'), x = ch.find(r => r.d.sol);
    E[17] = ch.length ? `وثّقت المنسقة ${A(ch.length, W.ch)} واتخذت قرارات لمعالجتها${x ? `، منها: ${cut(x.d.ch)}، وكان القرار: ${cut(x.d.sol)}` : ''}.` : 'لا توجد تحديات وقرارات موثقة في الفصل.'; }
  { const ach = recs('ACH').filter(r => /إنجاز|ممارسة/.test(r.d.c || '')), cm = recs('AC', r => /مسابق|أولمبياد|إثرائ/.test([r.d.ty, r.d.name].join(' '))), lr = recs('LR', r => /مصادر/.test(r.d.k || ''));
    E[18] = `أثرت المنسقة المادة العلمية${cm.length ? ` بـ${A(cm.length, W.cm)}، منها ${q(cm.map(r => r.d.name))}` : ''}${lr.length ? `، وفعّلت مركز مصادر التعلم ${A(lr.length, W.mr)}` : ''}${ach.length ? `، وحقق القسم ${A(ach.length, W.ach)}` : ''}.`; }
  { const all = S.records.filter(r => T.depts.includes(r.dept) && C.inS(r) && !['PRQ', 'CF'].includes(r.item)).length;
    E[19] = `وثّقت المنسقة أعمال القسم في منصة الميزان بانتظام (${all} سجلاً في الفصل)، بما يتيح متابعتها ومراجعتها.`; }
  { const pv = recs('PV'), tw = S.records.filter(r => r.item === 'TWS' && T.depts.includes(r.dept) && C.inS(r) && /قدّمتُ/.test(r.d.role || '')).length;
    E[20] = `حرصت المنسقة على علاقة إيجابية مع معلمات القسم وتبادل الخبرات بينهن${pv.length ? `، فوجّهت ${A(pv.length, W.v)} تبادلية` : ''}${tw ? `، وقدّمت معلمات القسم ${A(tw, W.ws)} لزميلاتهن` : ''}.`; }
  { const ms = []; for (let d = new Date(C.R.from); d <= new Date(C.R.to < today() ? C.R.to : today()); d.setMonth(d.getMonth() + 1)) ms.push(d.toISOString().slice(0, 7));
    const over = typeof prqUsed === 'function' ? ms.filter(m => prqUsed(T.name, m) > PRQ_LIMIT).length : 0;
    E[21] = over ? `تجاوزت المنسقة رصيد الاستئذان الشهري في ${A(over, W.mo)}.` : 'التزمت المنسقة بالدوام ورصيد الاستئذان الشهري في «إذنٌ مُيسَّر».'; }
  return E.map(x => x.replace(/\s+/g, ' ').replace(/ ،/g, '،').trim());
}
