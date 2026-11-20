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
  return { R, Pf, inS, recs, K, avg };
}
const cfPct = x => Math.round(x * 100) + '%';
function cfAuto(T, sem) {
  const C = cfCtx(T, sem), { recs, K, avg, R } = C;
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
  { const VV = recs('V'), v = VV.length, tch = (S.staff || []).filter(x => T.depts.includes(x.dept) && x.name !== T.name && !/منسق/.test(x.role || '')).map(x => x.name);
    const seen = new Set(VV.map(r => r.d.t)), cov = tch.length ? tch.filter(n => seen.has(n)).length / tch.length : avg('visitedPct');
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
  { const pp = avg('planPct'), ws = recs('WS').length;
    A[13] = !ws ? need('لا توجد ورش منفذة من خطة التطوير في الفصل') : pp != null && pp < 0.5 ? part(`الالتزام بخطة التطوير: ${cfPct(pp)} · ورش منفذة: ${ws}`) : ok((pp != null ? `الالتزام بخطة التطوير: ${cfPct(pp)} · ` : '') + `ورش منفذة: ${ws}`); }
  { const ws = recs('WS').length, ex = recs('EX').length; A[14] = one(ws + ex, `برامج داخلية: ${ws} · خارجية: ${ex}`, 'لا توجد برامج تدريبية موثقة'); }
  { const ws = recs('WS').length, im = recs('WS', r => r.d.o).length + recs('CP').length;
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
  const { recs, K, avg } = cfCtx(T, sem), out = [];
  const R = semRange(sem), inS = r => (r.date || '') >= R.from && (r.date || '') <= R.to;
  // عدد أنشطة القسم وترتيبه بين الأقسام
  const byD = {}; S.records.filter(r => r.item === 'AC' && inS(r)).forEach(r => byD[r.dept] = (byD[r.dept] || 0) + 1);
  const ac = T.depts.reduce((a, dp) => a + (byD[dp] || 0), 0), rank = Object.values(byD).filter(n => n > ac).length + 1;
  if (ac >= 3) out.push(`وثّق القسم (${ac}) نشاطاً ومبادرة${rank <= 3 ? '، وهو من أعلى الأقسام في المدرسة' : ''}، وهذا يدل على حيوية القسم وحرصها على إثراء تعلّم الطالبات`);
  const VV = recs('V'), v = VV.length, tch = (S.staff || []).filter(x => T.depts.includes(x.dept) && x.name !== T.name && !/منسق/.test(x.role || '')).map(x => x.name);
  const cov = tch.length ? tch.filter(n => VV.some(r => r.d.t === n)).length / tch.length : avg('visitedPct');
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
    <div class="card"><div class="tbl"><table class="t"><tr><th>المجال</th><th>الأدلة</th><th>المتابعة</th></tr>${D.rows.map((x, i) => `<tr>${x.first ? `<td rowspan="${x.span}" style="background:var(--maroon-l);color:var(--maroon);font-weight:700;text-align:center">${esc(x.dom)}</td>` : ''}<td>${esc(x.e)}</td><td><span class="chip ${SC_CHIP[r.d.ev[i]] || ''}">${esc(r.d.ev[i] || '—')}</span></td></tr>`).join('')}</table></div></div>
    <div class="card"><h2>التوصيات العامة</h2><div style="white-space:pre-wrap;line-height:2;text-align:justify">${esc(r.d.gen || '')}</div></div>`;
  $$('[data-m]', el).forEach(b => b.onclick = () => { S.mycf = b.dataset.m; show(); });
  $('#cfPr', el).onclick = async () => { await showPaper(el, D.title, fileInner(D, T, r, 'CF'), ''); $('#pBack').onclick = () => show(); };
  if ($('#cfSg', el)) $('#cfSg', el).onclick = async () => { if (!confirm('توقيع استلام الاستمارة والاطلاع عليها؟')) return;
    const j = await call('cfSign', { id: r.id }); const i = S.records.findIndex(x => x.id === r.id); if (i >= 0) S.records[i] = j.record; toast('تم التوقيع ✓'); show(); };
}
