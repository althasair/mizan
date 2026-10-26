/* الميزان — لوحة النائب الأكاديمي (خاصة) */
'use strict';

const adminDepts = () => { const s = []; S.coords.filter(c => c.active !== false).forEach(c => c.dept.forEach(d => { if (!s.includes(d)) s.push(d); })); return s; };
const coordOf = d => (S.coords.find(c => c.dept.includes(d)) || {}).name || '—';
const statusChip = rp => { const s = rp ? rp.status : 'مسودة'; const c = s === 'معتمد' ? 'ok' : s === 'موقّع من المنسقة' ? 'tf' : s === 'معاد للتعديل' ? 'bad' : ''; return `<span class="chip ${c}">${esc(s)}</span>`; };
const nrm = s => String(s || '').replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
const nameKey = full => { const p = nrm(full).split(' '); return p[0] + '|' + p[p.length - 1]; };

/* ------------------------------------------------------------------ نظرة عامة */
function A_home(el) {
  setTitle('نظرة عامة');
  const p = P(); const D = adminDepts();
  const Rs = D.map(d => ({ d, R: buildReport(ctxFor(d, p)), rp: repFor(d, p.name) }));
  const signed = Rs.filter(x => x.rp && ['موقّع من المنسقة', 'معتمد'].includes(x.rp.status)).length;
  const approved = Rs.filter(x => x.rp && x.rp.status === 'معتمد').length;
  const recs = Rs.reduce((a, x) => a + x.R.K.records, 0);
  const vp = vpPlanData();
  el.innerHTML = `
  <div class="hero"><div class="pat pattern"></div><h2>أهلاً أ. ${esc(S.user.name)}</h2><p>${esc(p.name)} · من ${dmy(p.from)} إلى ${dmy(p.to)} · هذه اللوحة خاصة بكِ ولا تظهر لأي منسقة</p></div>
  <div class="grid g4">
    ${kpi('تقارير موقّعة من المنسقات', `${signed} / ${D.length}`, `معتمدة: ${approved}`)}
    ${kpi('السجلات الموثّقة في الفترة', recs, 'لجميع الأقسام', 'var(--tiffany-d)')}
    ${kpi('زياراتي للمعلمات (الفصل الأول)', `${vp.done.length} / ${vp.pool.length}`, `المتبقي ${vp.remain.length}`, 'var(--navy)')}
    ${kpi('الزيارات الصفية للمنسقات', Rs.reduce((a, x) => a + x.R.K.visits, 0), 'خلال الفترة', 'var(--gold)')}
  </div>
  <div class="card" style="margin-top:16px"><h2>حالة الأقسام في ${esc(p.name)}</h2><div class="tbl"><table class="t">
    <tr><th>القسم</th><th>المنسقة</th><th>السجلات</th><th>البنود الموثّقة</th><th>الزيارات</th><th>المعلمات المُزارات</th><th>خطة التطوير</th><th>التقرير</th><th></th></tr>
    ${Rs.map(({ d, R, rp }) => { const docs = SECTIONS.filter(s => s.k !== 'SN' && S.records.some(r => r.dept === d && r.item === s.k && inP(r.date, p))).length;
      return `<tr><td><b>${esc(d)}</b></td><td>${esc(coordOf(d))}</td><td>${R.K.records}</td><td><div class="row"><div class="bar" style="width:70px"><i style="width:${docs / 15 * 100}%"></i></div>${docs}/15</div></td><td>${R.K.visits}</td><td>${fmtPct(R.K.visitedPct)}</td><td>${fmtPct(R.K.planPct)}</td><td>${statusChip(rp)}</td><td><button class="btn sm sec" data-rep="${esc(d)}">التقرير</button></td></tr>`; }).join('')}
  </table></div></div>`;
  $$('[data-rep]', el).forEach(b => b.onclick = () => { S.view = 'a_reports'; S.adminDept = b.dataset.rep; refresh(); });
}

/* ------------------------------------------------------------------ مقارنة المنسقات */
function A_compare(el) {
  setTitle('مقارنة المنسقات والأقسام');
  const p = P(); const D = adminDepts();
  const Rs = D.map(d => ({ d, R: buildReport(ctxFor(d, p)) }));
  const metrics = [
    ['السجلات', x => x.R.K.records], ['الزيارات الصفية', x => x.R.K.visits], ['المعلمات المُزارات %', x => Math.round(x.R.K.visitedPct * 100)],
    ['خطة التطوير %', x => x.R.K.planPct == null ? 0 : Math.round(x.R.K.planPct * 100)], ['الاجتماعات', x => x.R.K.meetings], ['الأنشطة', x => x.R.K.activities],
    ['أولياء الأمور', x => x.R.K.parents], ['التبادلية', x => x.R.K.peer], ['الإنجازات', x => x.R.K.achievements], ['التعليم الإلكتروني', x => x.R.K.elearn],
    ['إجراءات التوصيات المشتركة', x => x.R.K.cpActions],
  ];
  S.cmpM = S.cmpM || 0;
  const [ml, mf] = metrics[S.cmpM]; const mx = Math.max(1, ...Rs.map(mf));
  const pers = S.periods.filter(q => q.from <= today());
  el.innerHTML = `
  <div class="card"><h2>مقارنة الأقسام في ${esc(p.name)}</h2>
    <div class="tabs">${metrics.map((m, i) => `<button class="${i === S.cmpM ? 'on' : ''}" data-m="${i}">${m[0]}</button>`).join('')}</div>
    ${[...Rs].sort((a, b) => mf(b) - mf(a)).map((x, i) => `<div class="row" style="margin:7px 0"><span class="medal ${i < 3 ? 'g' + (i + 1) : ''}">${i + 1}</span><span style="width:210px">${esc(x.d)}<br><small style="color:var(--muted)">${esc(coordOf(x.d))}</small></span><div class="bar sp m"><i style="width:${mf(x) / mx * 100}%"></i></div><b style="width:40px;text-align:center">${mf(x)}</b></div>`).join('')}
  </div>
  <div class="card"><h2>تطور كل قسم عبر الفترات <span class="sub">${ml}</span></h2><div class="tbl"><table class="t"><tr><th>القسم</th>${pers.map(q => `<th>${q.name}</th>`).join('')}<th>الاتجاه</th></tr>
    ${D.map(d => { const v = pers.map(q => mf({ R: buildReport(ctxFor(d, q)) })); const tr = v.length > 1 ? v[v.length - 1] - v[v.length - 2] : 0;
      return `<tr><td>${esc(d)}</td>${v.map(x => `<td>${x}</td>`).join('')}<td>${tr > 0 ? '<span class="chip ok">▲ ' + tr + '</span>' : tr < 0 ? '<span class="chip bad">▼ ' + (-tr) + '</span>' : '<span class="chip">—</span>'}</td></tr>`; }).join('')}</table></div></div>`;
  $$('[data-m]', el).forEach(b => b.onclick = () => { S.cmpM = +b.dataset.m; show(); });
}

/* ------------------------------------------------------------------ لوحات التميز */
function A_boards(el) {
  setTitle('لوحات التميز');
  const p = P(); const R = S.records.filter(r => inP(r.date, p));
  const add = (m, k, n = 1) => { if (k && k !== REF.ALL_MEMBERS) m[k] = (m[k] || 0) + n; };
  const str = {}, act = {}, enr = {};
  R.filter(r => r.item === 'V' || r.item === 'OV').forEach(r => { add(str, r.d.t, (r.d.f1 ? 1 : 0) + (r.d.f2 ? 1 : 0)); });
  R.filter(r => r.item === 'AC').forEach(r => [r.d.e1, r.d.e2, r.d.e3].forEach(t => add(act, t, Math.max(1, +r.d.times || 1))));
  R.filter(r => (r.item === 'RA' && /إثرائ/.test(r.d.item || '')) || r.item === 'EN').forEach(r => add(enr, r.d.by || r.d.t, Math.max(1, +r.d.n || 1)));
  const deptOf = n => (S.staff.find(s => s.name === n) || {}).dept || '';
  const board = (t, m, unit, empty) => { const L = Object.entries(m).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return `<div class="card"><h2>${t}</h2>${L.length ? L.map(([n, v], i) => `<div class="row" style="margin:7px 0"><span class="medal ${i < 3 ? 'g' + (i + 1) : ''}">${i + 1}</span><span class="sp"><b>${esc(n)}</b> <small style="color:var(--muted)">${esc(deptOf(n))}</small></span><span class="chip ok">${v} ${unit}</span></div>`).join('') : `<div class="empty">${empty}</div>`}</div>`; };
  el.innerHTML = `<div class="note">تُحسب اللوحات من سجلات ${esc(p.name)}. خاصة بكِ ولا تظهر للمنسقات أو المعلمات.</div>
  <div class="grid g3">
    ${board('الأعلى في نقاط القوة بالزيارات', str, 'نقطة قوة', 'لا توجد زيارات موثّقة بنقاط قوة')}
    ${board('الأكثر تفعيلاً للأنشطة', act, 'تنفيذ', 'لا توجد أنشطة بأسماء منفذات')}
    ${board('الأكثر تنفيذاً للجلسات الإثرائية', enr, 'جلسة', 'تُحسب من «حصص إثرائية» في رفع التحصيل، ومن ملفات Forms عند استيرادها')}
  </div>`;
}

/* ------------------------------------------------------------------ التقارير والاعتماد */
function A_reports(el) {
  setTitle('تقارير الأقسام والاعتماد');
  const p = P(); const D = adminDepts(); S.adminDept = S.adminDept || D[0];
  el.innerHTML = `<div class="tabs noprint">${D.map(d => { const rp = repFor(d, p.name); return `<button class="${d === S.adminDept ? 'on' : ''}" data-d="${esc(d)}">${esc(d)} ${rp && rp.status === 'موقّع من المنسقة' ? '●' : ''}</button>`; }).join('')}</div><div id="rv"></div>`;
  $$('[data-d]', el).forEach(b => b.onclick = () => { S.adminDept = b.dataset.d; show(); });
  C_report($('#rv'), S.adminDept);
}
function adminRepButtons(rp) {
  return `<button class="btn sec" id="fbBtn">التغذية الراجعة</button>${rp && rp.status === 'موقّع من المنسقة' ? '<button class="btn tf" id="apBtn">اعتماد بتوقيعي</button><button class="btn sec" id="rtBtn">إعادة للتعديل</button>' : ''}`;
}
/* ------------------------------------------------------------------ التغذية الراجعة التلقائية (مسودة تراجعها النائب) */
function autoFeedback(dept, p) {
  const R = buildReport(ctxFor(dept, p)), K = R.K, T = R.T;
  const docs = SECTIONS.filter(s => s.k !== 'SN' && S.records.some(r => r.dept === dept && r.item === s.k && inP(r.date, p)));
  const snK = new Set(S.records.filter(r => r.dept === dept && r.item === 'SN' && inP(r.date, p)).map(r => r.d.k));
  const noted = (...L) => L.some(x => snK.has(x));
  const SNMAP = { V: ['الحضور الصفي للمنسقة'], PA: ['التواصل الفردي مع أولياء الأمور', 'فعاليات أولياء الأمور'], WS: ['التطوير الداخلي'], EX: ['التطوير الخارجي'], MT: ['الاجتماعات الداخلية', 'الاجتماعات الخارجية'], PV: ['الزيارات التبادلية'], ACH: ['الإنجازات', 'المشاركات'], LR: ['تفعيل مركز مصادر التعلم', 'تفعيل التعليم الإلكتروني'], AS: ['التقييمات القصيرة', 'الاختبارات التحصيلية', 'تحليل وقراءة النتائج'], PL: ['الخطة السنوية للقسم', 'متابعة الخطط الفصلية'], RA: ['إجراءات رفع التحصيل'], AC: ['الأنشطة الداخلية', 'الأنشطة الخارجية'], OV: ['زيارات مدير المدرسة', 'زيارات نائب المدير للشؤون الأكاديمية', 'زيارات الموجه التربوي'], CH: ['التحديات والحلول'] };
  const missing = SECTIONS.filter(s => s.k !== 'SN' && !docs.includes(s) && !noted(...(SNMAP[s.k] || []))).map(s => s.t);
  const inFile = [];
  const notVisited = (T.perTeacher || []).filter(x => !x.c).map(x => 'أ. ' + x.t);
  const fuNot = S.records.filter(r => r.dept === dept && r.item === 'V' && inP(r.date, p) && (r.d.ty || '').includes('متابعة') && r.d.st === 'لم تُنفذ بعد').length;
  const ovNot = S.records.filter(r => r.dept === dept && r.item === 'OV' && inP(r.date, p) && r.d.fus && r.d.fus !== 'تم تنفيذ التوصيات').length;
  const has = k => S.records.some(r => r.dept === dept && r.item === k && inP(r.date, p));
  const asAnal = S.records.some(r => r.dept === dept && r.item === 'AS' && inP(r.date, p) && SEC.AS.an(r.d));
  const st = [], rc = [];
  // نقاط التميز
  if (K.visits && K.visitedPct >= 0.8) st.push(`شمول الزيارات الصفية ${fmtPct(K.visitedPct)} من معلمات القسم بإجمالي (${K.visits}) زيارة`);
  if (K.planPct === 1) st.push('الالتزام التام بتنفيذ ورش خطة التطوير المهني في مواعيدها');
  else if (K.planPct >= 0.75) st.push(`تنفيذ ${fmtPct(K.planPct)} من ورش خطة التطوير المهني المقررة`);
  if (K.att != null && K.att >= 0.85) st.push(`ارتفاع نسبة حضور المعلمات للورش الداخلية (${fmtPct(K.att)})`);
  if (K.extPct >= 0.5) st.push(`مشاركة ${fmtPct(K.extPct)} من المعلمات في برامج التطوير المهني الخارجية`);
  if (K.commonRecs && K.cpActions) st.push('اتخاذ إجراءات عملية لمعالجة التوصيات المشتركة بين المعلمات');
  if (K.activities >= 3) st.push(`تنوع الأنشطة والمبادرات المنفذة (${K.activities})`);
  if (K.achievements) st.push(`تحقيق (${K.achievements}) من الإنجازات والمراكز`);
  if (K.peer && K.peerMet) st.push('تفعيل الزيارات التبادلية بما يلبي احتياجات المعلمات');
  if (K.parents >= 5) st.push('تفعيل الشراكة مع أولياء الأمور وتوثيق التواصل معهم');
  if (K.elearn >= 3) st.push('توظيف أدوات التعليم الإلكتروني وتنويعها');
  if (asAnal && has('RA')) st.push('تحليل نتائج التقييمات وربطها بإجراءات رفع التحصيل');
  if (docs.length >= 12) st.push(`استكمال توثيق (${docs.length}) من بنود التقرير الخمسة عشر`);
  // التوصيات
  if (!K.visits) { if (noted('الحضور الصفي للمنسقة')) inFile.push('الزيارات الصفية'); else rc.push('تنفيذ الزيارات الصفية لمعلمات القسم وتوثيقها'); }
  else if (notVisited.length) rc.push('استكمال الزيارات الصفية للمعلمات اللاتي لم تتم زيارتهن: ' + notVisited.join('، '));
  if (fuNot) rc.push(`متابعة تنفيذ التوصيات التي لم تُنفذ بعد في زيارات المتابعة (${fuNot})`);
  if (K.commonRecs && !K.cpActions) rc.push('اتخاذ إجراءات لمعالجة التوصيات المشتركة: ' + T.common.join('؛ '));
  if (ovNot) rc.push('متابعة تنفيذ توصيات زيارات القيادة والتوجيه التربوي');
  if (K.planPct != null && K.planPct < 1) rc.push('متابعة تنفيذ ورش خطة التطوير المهني المتبقية وتوثيق حالتها');
  if (!has('PL') && !noted(...SNMAP.PL)) rc.push('توثيق متابعة الخطط الفصلية وتغطية المنهج');
  if (!asAnal && !noted('تحليل وقراءة النتائج')) rc.push('تحليل نتائج التقييمات وقراءتها وتوثيقها');
  if (!has('RA') && !noted('إجراءات رفع التحصيل')) rc.push('توثيق إجراءات رفع التحصيل وربطها بأولويات المدرسة');
  if (!K.meetings) noted(...SNMAP.MT) ? inFile.push('الاجتماعات') : rc.push('عقد اجتماعات القسم الدورية وتوثيق محاورها');
  if (!K.peer) noted('الزيارات التبادلية') ? inFile.push('الزيارات التبادلية') : rc.push('تفعيل الزيارات التبادلية بين المعلمات وربطها باحتياجاتهن');
  if (!K.parents) noted(...SNMAP.PA) ? inFile.push('التواصل مع أولياء الأمور') : rc.push('تفعيل الشراكة مع أولياء الأمور وتوثيق التواصل الفردي');
  if (!K.elearn) noted('تفعيل التعليم الإلكتروني') ? inFile.push('التعليم الإلكتروني') : rc.push('توثيق توظيف أدوات التعليم الإلكتروني');
  if (missing.length > 3) rc.push('استكمال توثيق بنود التقرير: ' + missing.join('، '));
  // قراءة تحليلية: مقارنة بالفترة السابقة وبمتوسط الأقسام، وعمق الزيارات، وربط الإجراءات بالأثر
  const an = [];
  const pi = S.periods.findIndex(x => x.name === p.name); const prevP = pi > 0 ? S.periods[pi - 1] : null;
  const others = adminDepts().filter(x => x !== dept).map(x => buildReport(ctxFor(x, p)).K);
  const avg = f => { const v = others.map(f).filter(x => x != null && !isNaN(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const cmp = (v, m, unit) => m == null ? '' : v > m * 1.1 ? ` (أعلى من متوسط الأقسام ${unit(m)})` : v < m * 0.9 ? ` (أقل من متوسط الأقسام ${unit(m)})` : ` (قريب من متوسط الأقسام ${unit(m)})`;
  const pc = x => Math.round(x * 100) + '%', n1 = x => x.toFixed(1);
  if (K.visits) an.push(`بلغ معدل الزيارات الصفية ${n1(K.perTeacher)} زيارة لكل معلمة${cmp(K.perTeacher, avg(k => k.perTeacher), n1)}، وشمول المعلمات ${pc(K.visitedPct)}${cmp(K.visitedPct, avg(k => k.visitedPct), pc)}`);
  const Vs = S.records.filter(r => r.dept === dept && r.item === 'V' && inP(r.date, p));
  const fuN = Vs.filter(v => (v.d.ty || '').includes('متابعة')).length;
  if (Vs.length) an.push(fuN ? `شكّلت زيارات المتابعة ${fuN} من ${Vs.length} زيارة، بما يعكس متابعة أثر التوصيات` : 'لم تتضمن الزيارات زيارات متابعة للتحقق من تنفيذ التوصيات السابقة');
  const weakT = (T.perTeacher || []).map(x => { const cnt = {}; Vs.filter(v => v.d.t === x.t && !(v.d.ty || '').includes('متابعة')).forEach(v => new Set([v.d.r1, v.d.r2, v.d.r3].filter(Boolean)).forEach(r => cnt[r] = (cnt[r] || 0) + 1)); const rep = Object.keys(cnt).filter(r => cnt[r] >= 2); return { t: x.t, n: rep.length, rep }; }).filter(x => x.n);
  if (weakT.length) an.push('تكررت التوصية نفسها في أكثر من زيارة لدى: ' + weakT.map(x => `أ. ${x.t} («${x.rep[0]}»${x.n > 1 ? ' و' + (x.n - 1) + ' غيرها' : ''})`).join('، ') + '، مما يستدعي خطة دعم فردية ومتابعة لصيقة');
  if (K.planPct != null) an.push(`نُفّذ ${pc(K.planPct)} من ورش خطة التطوير المهني المقررة${cmp(K.planPct, avg(k => k.planPct), pc)}` + (K.att != null ? `، بنسبة حضور ${pc(K.att)}` : ''));
  const RA = S.records.filter(r => r.dept === dept && r.item === 'RA' && inP(r.date, p)); const RAi = RA.filter(r => r.d.imp && !/قيد/.test(r.d.imp));
  if (RA.length) an.push(`وُثّق (${RA.length}) من إجراءات رفع التحصيل` + (!RAi.length ? '، دون توثيق لأثرها المقيس على نتائج الطالبات' : `، منها (${RAi.length}) بأثر موثق` + (RAi.length < RA.length ? '، ويحتاج الباقي إلى قياس أثره بالبيانات' : '')));
  const noPr = (T.prio || []).map((x, i) => x.n ? null : REF.PRIO[i]).filter(Boolean);
  if (noPr.length) an.push('لم تُسجَّل إجراءات مرتبطة بـ: ' + noPr.map(x => x.replace(/^الأولوية \d: /, '')).join('، '));
  const att = S.records.filter(r => r.dept === dept && r.item === 'SN' && inP(r.date, p) && /مرفق|موثق في ملف|في الملف/.test(r.d.t || ''));
  if (att.length) an.push(`اكتُفي بالإحالة إلى ملفات مرفقة في (${att.length}) من البنود دون تفصيلها في التقرير`);
  if (prevP) { const KP = buildReport(ctxFor(dept, prevP)).K; const dv = K.visits - KP.visits, dr = K.records - KP.records;
    an.push(`مقارنةً بـ${prevP.name}: الزيارات ${dv >= 0 ? 'ارتفعت' : 'انخفضت'} بمقدار (${Math.abs(dv)})، والسجلات الموثقة ${dr >= 0 ? 'ارتفعت' : 'انخفضت'} بمقدار (${Math.abs(dr)})`); }
  if (weakT.length) rc.push('إعداد خطة دعم فردية للمعلمات اللاتي تكررت توصياتهن ومتابعتها بزيارات متابعة موثقة');
  if (Vs.length && !fuN) rc.push('تنفيذ زيارات متابعة للتحقق من تنفيذ التوصيات السابقة وتوثيق نتائجها');
  if (RA.length && RAi.length < RA.length) rc.push('قياس أثر إجراءات رفع التحصيل بالمقارنة بين نتائج التقييمات قبل الإجراء وبعده');
  if (noPr.length) rc.push('ربط إجراءات القسم بجميع أولويات المدرسة، ولا سيما: ' + noPr.map(x => x.replace(/^الأولوية \d: /, '')).join('، '));
  if (att.length || inFile.length) rc.push('تفصيل الإجراءات المنفذة في متن التقرير بدلاً من الاكتفاء بالإحالة إلى الملفات المرفقة' + (inFile.length ? '، ولا سيما: ' + inFile.join('، ') : ''));
  let t = `أتقدم بخالص الشكر والتقدير للأستاذة ${R.coord || coordOf(dept)} ولمعلمات قسم ${dept} على الجهود المبذولة خلال ${p.name}.`;
  if (st.length) t += '\n\nنقاط التميز:\n' + st.map(x => '• ' + x + '.').join('\n');
  if (an.length) t += '\n\nقراءة في مؤشرات الأداء:\n' + an.map(x => '• ' + x + '.').join('\n');
  if (rc.length) t += '\n\nوأوصي بـ:\n' + [...new Set(rc)].map(x => '• ' + x + '.').join('\n');
  t += '\n\nمع خالص التمنيات بدوام التميز والعطاء.';
  return t;
}

function bindAdminRep(rp, dept, p) {
  const fbBox = (v) => `<div class="row" style="margin-bottom:6px"><span style="font-size:12.5px;color:var(--muted)">${v ? 'التغذية الراجعة المحفوظة' : 'مسودة مكتوبة تلقائياً من أداء القسم — راجعيها وأضيفي ملاحظاتك'}</span><span class="sp"></span><button class="btn sm sec" type="button" id="fbAuto">إعادة التوليد التلقائي</button></div>
    <textarea id="fbt" style="width:100%;min-height:260px;border:1px solid var(--line);border-radius:12px;padding:10px;margin-bottom:10px;line-height:1.8">${esc(v || autoFeedback(dept, p))}</textarea>`;
  const bindAuto = m => { $('#fbAuto', m).onclick = () => { if (!$('#fbt', m).value.trim() || confirm('سيُستبدل النص الحالي بمسودة جديدة من الأداء. متابعة؟')) $('#fbt', m).value = autoFeedback(dept, p); }; };
  if ($('#fbBtn')) $('#fbBtn').onclick = () => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="box" style="max-width:640px"><h3>التغذية الراجعة — ${esc(dept)} · ${esc(p.name)}</h3>${fbBox(rp && rp.feedback)}<div class="row"><button class="btn" id="fs">حفظ وإظهارها للمنسقة</button><button class="btn sec" id="fc">إلغاء</button></div></div>`;
    document.body.appendChild(m); bindAuto(m); $('#fc', m).onclick = () => m.remove();
    $('#fs', m).onclick = async () => { const j = await call('feedback', { dept, period: p.name, from: p.from, to: p.to, feedback: $('#fbt', m).value }); upsertRep(j.report); m.remove(); toast('تم الحفظ'); show(); };
  };
  if ($('#apBtn')) $('#apBtn').onclick = () => pinModal('اعتماد التقرير', 'يُضاف توقيعك على التقرير ويظهر للمنسقة. يمكنكِ كتابة التغذية الراجعة أولاً:', async (pin, m) => {
    const j = await call('approve', { dept, period: p.name, pin, feedback: $('#fbt', m).value }); upsertRep(j.report); toast('تم الاعتماد ✓'); show();
  }, fbBox(rp && rp.feedback)) || (() => { const m = $$('.modal').pop(); $('.box', m).style.maxWidth = '640px'; bindAuto(m); })();
  if ($('#rtBtn')) $('#rtBtn').onclick = async () => { const fb = prompt('سبب الإعادة / الملاحظات للمنسقة:', rp.feedback || ''); if (fb === null) return; const j = await call('return', { dept, period: p.name, feedback: fb }); upsertRep(j.report); toast('أُعيد التقرير للمنسقة'); show(); };
}

/* ------------------------------------------------------------------ حسابات المنسقات */
function A_accounts(el) {
  setTitle('حسابات المنسقات');
  el.innerHTML = `<div class="note">الأرقام السرية محفوظة في قاعدة البيانات الخاصة بكِ على Google ولا تظهر هنا. يمكنكِ تعيين رقم جديد لأي منسقة عند الحاجة.</div>
  <div class="card"><table class="t"><tr><th>المنسقة</th><th>القسم</th><th>التوقيع</th><th></th></tr>${S.coords.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.dept.join(' و'))}</td><td><span class="sigbox" data-sv="${esc(c.id)}" style="display:inline-block;min-width:90px;height:34px;vertical-align:middle"></span> <button class="btn sm ghost" data-sg="${esc(c.id)}">رفع التوقيع</button></td><td><button class="btn sm sec" data-pin="${esc(c.id)}">تعيين رقم سري جديد</button></td></tr>`).join('')}</table></div>
  <input type="file" id="sigF" accept="image/png,image/jpeg" style="display:none">`;
  $$('[data-sv]', el).forEach(async b => { try { const d = (await API.call('signature', { who: b.dataset.sv })).data; b.innerHTML = d ? `<img src="${d}" style="max-height:34px;max-width:140px">` : '<small style="color:var(--bad)">لا يوجد</small>'; } catch (e) {} });
  let sgFor = null;
  $$('[data-sg]', el).forEach(b => b.onclick = () => { sgFor = b.dataset.sg; $('#sigF').value = ''; $('#sigF').click(); });
  $('#sigF').onchange = e => { const f = e.target.files[0]; if (!f || !sgFor) return; const r = new FileReader(); r.onload = async () => { await call('setSig', { id: sgFor, data: r.result }); toast('تم حفظ التوقيع ✓'); show(); }; r.readAsDataURL(f); };
  $$('[data-pin]', el).forEach(b => b.onclick = async () => { const v = prompt('الرقم السري الجديد (4–8 أرقام):'); if (!v) return; await call('setPin', { id: b.dataset.pin, newPin: v }); toast('تم التغيير — أبلغي المنسقة بالرقم الجديد'); });
}

/* ------------------------------------------------------------------ نتائج سنابل (قراءة فقط) */
function sanabilMeans() {
  let A = null; try { A = JSON.parse(localStorage.getItem('sab3_tahleel_v1') || 'null'); } catch (e) {}
  if (!A || !A.cur) return null;
  let staff = A.staff; if (!staff || !staff.length) { try { const x = JSON.parse(localStorage.getItem('sab3_sanabil_v1') || 'null'); staff = x && x.staff; } catch (e) {} }
  if (!staff || !staff.length) return null;
  const pers = Object.keys(A.cur).map(Number).sort((a, b) => a - b); const cur = A.cur[pers[pers.length - 1]] || {};
  const secKey = s => { const m = String(s || '').match(/(1[0-2])\s*[\/\-]\s*(\d+)/); return m ? m[1] + '-' + m[2] : ''; };
  const bySec = {}; Object.values(cur).forEach(o => { (bySec[secKey(o.s)] = bySec[secKey(o.s)] || []).push(o.g || {}); });
  const pickKey = (subj, sec, rows) => {
    const keys = [...new Set(rows.flatMap(g => Object.keys(g)))];
    const g10 = sec.startsWith('10');
    let toks = String(subj || '').replace(/\(.*?\)/g, '').split(/\+|،| و(?=ال)/).map(x => x.trim()).filter(Boolean);
    if (/الدراسات الاجتماعية/.test(subj) && g10) toks = ['الدراسات الاجتماعية', ...toks];
    for (const t of toks) { const k = keys.find(k => nrm(k) === nrm(t)) || keys.find(k => nrm(k).includes(nrm(t)) || nrm(t).includes(nrm(k))); if (k) return k; }
    return null;
  };
  const out = {};
  staff.forEach(t => {
    const vals = [];
    (t.sections || []).forEach(s0 => { const sec = secKey(s0); const rows = bySec[sec]; if (!rows) return; const k = pickKey(t.subject, sec, rows); if (!k) return; rows.forEach(g => { if (typeof g[k] === 'number') vals.push(g[k]); }); });
    if (vals.length) out[nameKey(t.name)] = { mean: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length, low: vals.filter(v => v < 70).length };
  });
  return out;
}

/* تحصيل شعبة في مادة من سنابل (قراءة فقط) مع مقارنتها ببقية شعب المستوى نفسه */
function sanabilClass(sec0, subj) {
  let A = null; try { A = JSON.parse(localStorage.getItem('sab3_tahleel_v1') || 'null'); } catch (e) {}
  if (!A || !A.cur || !sec0 || !subj) return null;
  const pers = Object.keys(A.cur).map(Number).sort((a, b) => a - b); const cur = A.cur[pers[pers.length - 1]] || {};
  const secKey = s => { const m = String(s || '').match(/(1[0-2])\s*[\/\-]\s*(\d+)/); return m ? m[1] + '-' + m[2] : ''; };
  const sec = secKey(sec0); if (!sec) return null;
  const bySec = {}; Object.values(cur).forEach(o => { const k = secKey(o.s); if (k) (bySec[k] = bySec[k] || []).push(o.g || {}); });
  const rows = bySec[sec]; if (!rows) return null;
  const keys = [...new Set(rows.flatMap(g => Object.keys(g)))];
  let toks = String(subj).replace(/\(.*?\)/g, '').split(/\+|،| و(?=ال)/).map(x => x.trim()).filter(Boolean);
  const key = (() => { for (const t of toks) { const k = keys.find(k => nrm(k) === nrm(t)) || keys.find(k => nrm(k).includes(nrm(t)) || nrm(t).includes(nrm(k))); if (k) return k; } return null; })();
  if (!key) return null;
  const st = L => { const v = L.map(g => g[key]).filter(x => typeof x === 'number'); return v.length ? { mean: v.reduce((a, b) => a + b, 0) / v.length, n: v.length, pass: v.filter(x => x >= 50).length / v.length * 100, low: v.filter(x => x < 70).length, top: v.filter(x => x >= 90).length } : null; };
  const me = st(rows); if (!me) return null;
  const lvl = sec.split('-')[0];
  const sibs = Object.keys(bySec).filter(k => k.split('-')[0] === lvl).map(k => ({ k, s: st(bySec[k]) })).filter(x => x.s).sort((a, b) => b.s.mean - a.s.mean);
  const all = sibs.flatMap(x => bySec[x.k]); const lv = st(all);
  const rank = sibs.findIndex(x => x.k === sec) + 1;
  const band = m => m >= 90 ? 'ممتاز' : m >= 80 ? 'جيد جداً' : m >= 70 ? 'جيد' : m >= 50 ? 'مقبول' : 'ضعيف';
  const diff = lv ? me.mean - lv.mean : 0;
  const rel = !lv || sibs.length < 2 ? '' : diff >= 3 ? 'أعلى من' : diff <= -3 ? 'أدنى من' : 'قريب من';
  const LV = { 10: 'العاشر', 11: 'الحادي عشر', 12: 'الثاني عشر' }[lvl] || lvl;
  const txt = `بلغ متوسط تحصيل الصف ${sec} في مادة ${key} ${me.mean.toFixed(1)}% (${band(me.mean)})، ونسبة النجاح ${Math.round(me.pass)}%` + (me.top ? `، و(${me.top}) طالبات بنسبة 90% فأعلى` : '') + (me.low ? `، و(${me.low}) طالبات دون 70%` : '')
    + (rel ? `، وهو ${rel} متوسط شعب الصف ${LV} في المادة (${lv.mean.toFixed(1)}%)، ويحتل الترتيب (${rank}) من (${sibs.length}) شعب` : '') + '.';
  return { sec, key, me, lv, rank, of: sibs.length, band: band(me.mean), rel, txt, per: pers[pers.length - 1] };
}

/* ------------------------------------------------------------------ خطة زيارات النائب */
const CORE12 = ['التربية الإسلامية', 'اللغة العربية', 'اللغة الإنجليزية', 'الرياضيات', 'الكيمياء', 'الفيزياء', 'الأحياء'];
function vpCfg() { let c = {}; try { c = JSON.parse(localStorage.getItem('mizan_vp_cfg') || '{}'); } catch (e) {} return Object.assign({ start: '2026-11-01', end: '2026-12-03' }, c); }
function vpPlanData() {
  const cfg = vpCfg();
  const sem1 = S.periods.filter(p => p.sem === 'الفصل الأول'); const s1 = { from: sem1[0] ? sem1[0].from : '2026-08-30', to: sem1.length ? sem1[sem1.length - 1].to : '2026-12-31' };
  const visits = S.records.filter(r => r.item === 'VPV' && (!r.date || (r.date >= s1.from && r.date <= '2026-12-31')));
  const pool = S.staff.filter(s => s.role !== 'منسقة' && +s.load > 0);
  const doneNames = new Set(visits.map(v => v.d.t));
  const san = sanabilMeans();
  const score = t => {
    const secs = String(t.secs).split(/[،,]/).map(x => x.trim()).filter(Boolean);
    const g12 = secs.filter(x => x.startsWith('12')).length;
    const core = CORE12.some(c => (t.dept + ' ' + t.subj).includes(c));
    let s = 0, why = [];
    const a = san && (san[nameKey(t.full || t.name)] || san[nameKey(t.name)]);
    if (a) { const pts = Math.max(0, Math.min(50, (85 - a.mean) * 2)); s += pts; why.push(`متوسط تحصيل طالباتها في سنابل ${a.mean.toFixed(1)}` + (a.low ? ` (${a.low} دون 70)` : '')); }
    if (g12) { s += Math.min(g12, 4) * 6 + (core ? 10 : 0); why.push(`${g12} شعب ثاني عشر` + (core ? ' — مادة اختبار وطني' : '')); }
    if (!a && !g12) why.push('لا تتوفر نتائج بعد');
    return { s: Math.round(s), why: why.join(' · '), mean: a ? a.mean : null };
  };
  const remain = pool.filter(t => !doneNames.has(t.name)).map(t => Object.assign({}, t, score(t))).sort((a, b) => b.s - a.s);
  // أسابيع الخطة (الأحد إلى الخميس)
  const weeks = []; const d0 = new Date(cfg.start + 'T00:00:00'); const tNow = new Date(today() + 'T00:00:00');
  let w = new Date(d0); w.setDate(w.getDate() - w.getDay());
  const end = new Date(cfg.end + 'T00:00:00');
  while (w <= end) { const we = new Date(w); we.setDate(we.getDate() + 4); if (we >= tNow) weeks.push(new Date(w)); w.setDate(w.getDate() + 7); }
  if (!weeks.length) { const x = new Date(tNow); x.setDate(x.getDate() - x.getDay()); weeks.push(x); }
  // توزيع متوازن: معلمة من كل قسم أسبوعياً حسب الأولوية
  const byDept = {}; remain.forEach(t => (byDept[t.dept] = byDept[t.dept] || []).push(t));
  const plan = weeks.map(() => []); let left = remain.length;
  weeks.forEach((wk, i) => {
    const quota = Math.ceil(left / (weeks.length - i));
    while (plan[i].length < quota && left > 0) {
      const ds = Object.keys(byDept).filter(d => byDept[d].length && !plan[i].some(x => x.dept === d)).sort((a, b) => byDept[b].length - byDept[a].length || byDept[b][0].s - byDept[a][0].s);
      const pickFrom = ds.length ? ds : Object.keys(byDept).filter(d => byDept[d].length).sort((a, b) => byDept[b].length - byDept[a].length);
      if (!pickFrom.length) break;
      plan[i].push(byDept[pickFrom[0]].shift()); left--;
    }
    plan[i].sort((a, b) => b.s - a.s);
  });
  return { cfg, pool, done: visits, remain, weeks, plan, san };
}
function A_visits(el) {
  setTitle('خطة زيارات المعلمات — الفصل الأول');
  const V = vpPlanData(); const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const depts = [...new Set(V.pool.map(t => t.dept))];
  const sanN = V.san ? Object.keys(V.san).length : 0;
  el.innerHTML = `
  <div class="grid g4">
    ${kpi('تمت زيارتهن', V.done.length, 'من ' + V.pool.length + ' معلمة لها نصاب', 'var(--ok)')}
    ${kpi('المتبقي', V.remain.length, 'حتى نهاية الفصل الأول', 'var(--maroon)')}
    ${kpi('أسابيع الخطة', V.weeks.length, `بمعدل ${V.weeks.length ? Math.ceil(V.remain.length / V.weeks.length) : 0} زيارات أسبوعياً`, 'var(--navy)')}
    ${kpi('نتائج سنابل', sanN ? sanN + ' معلمة' : 'غير متاحة', sanN ? 'قراءة فقط من متصفحك' : 'افتحي سنابل في هذا المتصفح', 'var(--tiffany-d)')}
  </div>
  <div class="card noprint" style="margin-top:16px"><div class="row"><b>بداية الخطة</b><input type="date" id="vs" value="${V.cfg.start}" style="border:1px solid var(--line);border-radius:10px;padding:4px 8px"><b>نهاية الفصل</b><input type="date" id="ve" value="${V.cfg.end}" style="border:1px solid var(--line);border-radius:10px;padding:4px 8px"><span class="sp"></span><button class="btn" id="addv">تسجيل زيارة منفّذة</button><button class="btn sec" onclick="window.print()">طباعة الخطة</button></div>
  <div style="font-size:12.5px;color:var(--muted);margin-top:8px">الأولوية: للعاشر والحادي عشر من متوسط تحصيل طالبات المعلمة في سنابل (الأقل تحصيلاً أولاً)، وللثاني عشر حسب عدد الشعب ومواد الاختبارات الوطنية. التوزيع: معلمة من كل قسم أسبوعياً قدر الإمكان، وتتحدّث الخطة تلقائياً كلما سجّلتِ زيارة.</div></div>
  ${V.plan.map((L, i) => { const w0 = V.weeks[i];
    return `<div class="card"><h2>الأسبوع ${i + 1} <span class="sub">${dmy(iso(w0))} – ${dmy(iso(new Date(w0.getTime() + 4 * 864e5)))} · ${L.length} زيارات</span></h2>
      ${L.length ? `<div class="tbl"><table class="t"><tr><th>اليوم المقترح</th><th>المعلمة</th><th>القسم</th><th>الشعب</th><th>سبب الأولوية</th><th>الدرجة</th><th class="noprint"></th></tr>
      ${L.map((t, j) => `<tr><td>${DAYS[Math.min(4, Math.floor(j / Math.max(1, Math.ceil(L.length / 5))))]}</td><td><b>${esc(t.name)}</b></td><td>${esc(t.dept)}</td><td style="font-size:12px">${esc(t.secs)}</td><td style="font-size:12px">${esc(t.why)}</td><td><span class="chip ${t.s >= 40 ? 'bad' : t.s >= 20 ? 'warn' : ''}">${t.s}</span></td><td class="noprint"><button class="btn sm" data-v="${esc(t.name)}">تمت</button></td></tr>`).join('')}</table></div>` : '<div class="empty">لا زيارات</div>'}</div>`; }).join('')}
  <div class="grid g2">
    <div class="card"><h2>التغطية حسب القسم</h2>${depts.map(d => { const n = V.pool.filter(t => t.dept === d).length, k = V.pool.filter(t => t.dept === d && V.done.some(v => v.d.t === t.name)).length;
      return `<div class="row" style="margin:6px 0"><span style="width:190px">${esc(d)}</span><div class="bar sp"><i style="width:${n ? k / n * 100 : 0}%"></i></div><span class="chip">${k}/${n}</span></div>`; }).join('')}</div>
    <div class="card"><h2>الزيارات المنفّذة</h2><div class="list">${V.done.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(r => `<div class="rec"><div class="dt">${r.date ? dm(r.date) : '—'}</div><div class="tx"><b>${esc(r.d.t)}</b> <small style="color:var(--muted)">${esc(r.dept)}${r.d.s ? ' · ' + esc(r.d.s) : ''}</small>${r.d.note ? `<div class="by">${esc(r.d.note)}</div>` : ''}</div><div class="ops"><button class="btn sm ghost" data-delv="${r.id}">حذف</button></div></div>`).join('') || '<div class="empty">لا توجد</div>'}</div></div>
  </div>`;
  const saveCfg = () => { localStorage.setItem('mizan_vp_cfg', JSON.stringify({ start: $('#vs').value, end: $('#ve').value })); show(); };
  $('#vs').onchange = saveCfg; $('#ve').onchange = saveCfg;
  const visitModal = (name) => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="box"><h3>تسجيل زيارة منفّذة</h3><form class="form" id="vf" style="grid-template-columns:1fr">
      <div class="fld"><label>المعلمة</label><select data-n="t">${V.pool.map(t => `<option ${t.name === name ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
      <div class="fld"><label>التاريخ</label><input type="date" data-n="date" value="${today()}"></div>
      <div class="fld"><label>الصف / الشعبة</label><select data-n="s"><option></option>${REF.SECTIONS.map(s => `<option>${s}</option>`).join('')}</select></div>
      <div class="fld"><label>ملاحظة (اختياري)</label><input data-n="note"></div>
      <div class="actions"><button class="btn" type="submit">حفظ</button><button class="btn sec" type="button" id="vc">إلغاء</button></div></form></div>`;
    document.body.appendChild(m); $('#vc', m).onclick = () => m.remove();
    $('#vf', m).onsubmit = async e => { e.preventDefault(); const r = readForm($('#vf', m)); const t = S.staff.find(x => x.name === r.t);
      const j = await call('save', { rec: { dept: t.dept, item: 'VPV', date: r.date, sum: 'زيارة النائب الأكاديمي: ' + r.t, d: r, key: r.t + '|' + r.date } }); S.records.push(j.record); m.remove(); toast('تم — حُدّثت الخطة'); show(); };
  };
  $('#addv').onclick = () => visitModal('');
  $$('[data-v]', el).forEach(b => b.onclick = () => visitModal(b.dataset.v));
  $$('[data-delv]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذه الزيارة؟')) return; await call('delete', { id: b.dataset.delv }); S.records = S.records.filter(x => x.id !== b.dataset.delv); show(); });
}
