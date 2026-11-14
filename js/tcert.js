/* الميزان — تعزيز المعلمات: المنسقة تختار المعلمة وبنود التعزيز فتصدر الشهادة (نفس تصاميم سبع سنابل) بتوقيع المنسقة والنائب الأكاديمي */
'use strict';

ICON.cert = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="9" r="5.5"/><path d="M12 6.4l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 8.5l2-.3z" fill="currentColor" stroke="none"/><path d="M8.6 13.5L7 21l5-2.6 5 2.6-1.6-7.5"/></svg>';

const TC_R = [
  'سرعة إنجاز المهام وإتقانها',
  'الدقة في العمل والالتزام بالمواعيد',
  'المبادرة وتقديم الأفكار البنّاءة',
  'التعاون مع الزميلات وروح الفريق الواحد',
  'تحمّل حصص الاحتياط والحصص الإضافية بطيب نفس',
  'تحمّل الأعباء والتكليفات الإضافية بروح المسؤولية',
  'تقديم الورش التدريبية وتطوير الزميلات',
  'رفع التحصيل الأكاديمي للطالبات',
  'متابعة الطالبات المتعثرات ودعمهن',
  'التواصل الفعّال مع أولياء الأمور',
  'التجديد في استراتيجيات التدريس',
  'توظيف التقنية في التعليم',
  'الإسهام المتميز في الأنشطة والفعاليات المدرسية',
  'إعداد الطالبات للمسابقات وتحقيقهن مراكز متقدمة',
  'إتقان إعداد الاختبارات والتقييمات',
  'دعم القسم في إنجاز ملفاته وتقاريره',
  'الانضباط الوظيفي والحضور المبكر',
  'حسن الخلق وطيب التعامل',
];
const TC_T = ['شهادة شكر وتقدير', 'شهادة تميّز', 'شهادة امتنان', 'شهادة فخر واعتزاز', 'شهادة إشادة', 'وسام سنبلة العطاء'];
const TC_P = [
  'عطاؤكِ سنبلةٌ مباركة، أثمرت في طالباتكِ وزميلاتكِ خيرًا كثيرًا',
  'بكِ يزدان القسم، وبأمثالكِ تسمو رسالة التعليم',
  'جهدكِ محفوظٌ عند من لا يضيع عنده مثقال ذرّة، فجزاكِ الله خير الجزاء',
  'أنتِ قدوةٌ في الإخلاص، ومثالٌ في التفاني والعطاء',
  'شكرًا لأنكِ تعطين بصمت، وتتقنين بحب',
];
const TC_V = [['إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا', 'الكهف: 30'], ['وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ', 'التوبة: 105'], ['هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ', 'الرحمن: 60'],
  ['إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ', 'البقرة: 195'], ['وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ ۚ وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ', 'النجم: 39-40'], ['يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', 'المجادلة: 11'],
  ['وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ', 'المائدة: 2'], ['وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ', 'المطففين: 26']];

const tcDept = () => isAdmin() ? (S.tcDept || '') : S.dept;
let TC_SIG = {};
async function tcSigs(dept) {
  const co = isAdmin() ? S.coords.find(c => c.dept.includes(dept)) : { id: S.user.id, name: S.user.name };
  const k = (co && co.id) || '-';
  if (!TC_SIG[k]) {
    let c = '', v = '';
    try { if (co && co.id) c = (await API.call('signature', { who: co.id })).data || ''; } catch (e) {}
    try { v = isAdmin() ? (await API.call('signature', {})).data || '' : (await API.call('signature', { cheer: 1 })).data || ''; } catch (e) {}
    TC_SIG[k] = { c, v, name: co ? co.name : '' };
  }
  return TC_SIG[k];
}
async function tcOpen(list) {
  if (!window.MCK) return toast('تعذّر تحميل قوالب الشهادات', 1);
  const w = window.open('', '_blank'); if (!w) { toast('اسمحي بالنوافذ المنبثقة لهذا الموقع ثم أعيدي المحاولة', 1); return; }
  w.document.write('<p style="font-family:sans-serif;text-align:center;margin-top:40px">جارٍ تجهيز الشهادة…</p>');
  const docs = [];
  for (const r of list) {
    const d = r.d, sg = await tcSigs(r.dept);
    docs.push(MCK.doc({ or: d.or || 'L', tpl: d.tpl || 1, title: d.title, name: 'أ. ' + d.t, lead: 'تُمنح هذه الشهادة بكل فخر واعتزاز للمعلمة', meta: 'قسم ' + esc(r.dept),
      reasons: d.reasons, phrase: d.ph, verse: d.verse, date: dmy(r.date),
      sigs: [{ role: 'منسقة القسم', name: 'أ. ' + (sg.name || d.by || ''), img: sg.c }, { role: 'نائب المديرة للشؤون الأكاديمية', name: 'أ. آسيا الذبياني', img: sg.v }] }));
  }
  let html = docs[0];
  if (docs.length > 1) html = docs[0].slice(0, docs[0].indexOf('<body>')).replace('</head>', '<style>.c{break-after:page;page-break-after:always}.c:last-child{break-after:auto}@media screen{.c{margin-bottom:8mm}}</style></head>') +
    '<body>' + docs.map(x => x.slice(x.indexOf('<body>') + 6, x.lastIndexOf('</body>'))).join('') + '</body></html>';
  w.document.open(); w.document.write(html); w.document.close();
  w.onload = () => setTimeout(() => w.print(), 700);
}

/* تنظيم الشهادات: البنود في مجموعات، وأنواع الشهادات مع متى تُستخدم، ومعرض مصغّر للتصاميم، ومعاينة حية */
const TC_G = [['الإنجاز وجودة العمل', [0, 1, 14, 15]], ['التعليم ونواتج التعلّم', [7, 8, 10, 11]], ['المبادرة والعمل الجماعي', [2, 3, 6, 12, 13]], ['المسؤولية والقيم', [4, 5, 16, 17, 9]]];
const TC_TH = ['لجهدٍ أو مهمةٍ أُنجزت بإتقان', 'لأداءٍ لافتٍ يفوق المتوقع', 'لمن تحمّلت عبئًا إضافيًا أو ساندت زميلاتها', 'لإنجازٍ يرفع اسم القسم والمدرسة', 'لممارسةٍ متميزة تستحق النشر', 'أرفع تكريم: لعطاءٍ ممتد طوال الفصل'];
const TC_TE = ['🌿', '⭐', '🤍', '🏅', '📣', '🌾'];
const TC_FAM = [['الكل', /./], ['كحلي وأزرق', /كحلي|الأزرق/], ['ذهبي وأسود', /الذهبي|الأسود|الذهبية/], ['أخضر', /الأخضر/], ['أحمر ووردي', /الأحمر|الوردي/], ['هادئ', /الكريمي|الرمادي|الهندسية|الشبكة|المزخرف/]];
function tcSample(st, sg, name) {
  const reasons = (st.rs || []).map(i => TC_R[i]).concat(st.oth ? [st.oth] : []);
  return MCK.doc({ or: st.or, tpl: st.tpl, title: TC_T[st.ti], name: 'أ. ' + (name || 'اسم المعلمة'), lead: 'تُمنح هذه الشهادة بكل فخر واعتزاز للمعلمة', meta: 'قسم ' + esc(tcDept() || 'القسم'),
    reasons: reasons.length ? reasons : ['سرعة إنجاز المهام وإتقانها', 'التعاون مع الزميلات وروح الفريق الواحد'], phrase: TC_P[st.ph], verse: TC_V[st.vs], date: dmy(today()),
    sigs: [{ role: 'منسقة القسم', name: 'أ. ' + ((sg && sg.name) || 'منسقة القسم'), img: sg ? sg.c : '' }, { role: 'نائب المديرة للشؤون الأكاديمية', name: 'أ. آسيا الذبياني', img: sg ? sg.v : '' }] });
}
/* إطار مصغّر يعرض الشهادة بحجمها الحقيقي مصغّرةً بدقة */
function tcFrame(box, html, or) {
  const W = or === 'P' ? 794 : 1123, H = or === 'P' ? 1123 : 794, k = box.clientWidth / W;
  box.style.height = Math.round(H * k) + 'px';
  let f = box.querySelector('iframe'); if (!f) { f = document.createElement('iframe'); f.setAttribute('tabindex', '-1'); box.appendChild(f); }
  Object.assign(f.style, { width: W + 'px', height: H + 'px', transform: `scale(${k})`, transformOrigin: 'top right', border: 0, pointerEvents: 'none', position: 'absolute', top: 0, right: 0, background: '#fff' });
  f.srcdoc = html;
}

function C_tcert(el) {
  setTitle('شهادات التكريم');
  const dept = tcDept();
  const depts = isAdmin() ? uniq(S.staff.map(s => s.dept).filter(Boolean)).sort((a, b) => a.localeCompare(b, 'ar')) : [];
  const T = S.staff.filter(s => s.dept === dept && s.name !== S.user.name).map(s => s.name).filter((x, i, A) => A.indexOf(x) === i).sort((a, b) => a.localeCompare(b, 'ar'));
  const L = S.records.filter(r => r.item === 'CRT' && r.d && (!dept || r.dept === dept)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const st = S.tcSt || (S.tcSt = { t: [], rs: [], tpl: 1, ti: 0, vs: 0, ph: 0, or: 'L', fam: 0 });
  const nTpl = window.MCK ? MCK.names() : ['التصميم الأول'];
  const cnt = {}; L.forEach(r => cnt[r.d.t] = (cnt[r.d.t] || 0) + 1);
  const fq = S.tcF || '';
  const LF = fq ? L.filter(r => r.d.t === fq) : L;
  const step = (n, t, sub) => `<div class="tc-st"><span>${n}</span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  el.innerHTML = `
  <div class="prq-top"><div class="prq-v">﴿هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ﴾</div><small>الرحمن 60</small></div>
  ${isAdmin() ? `<div class="card"><div class="row"><b>القسم</b><select id="tcD" style="max-width:320px"><option value="">جميع الأقسام (للاطلاع)</option>${depts.map(d => `<option ${d === dept ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div></div>` : ''}
  ${dept ? `<div class="tc-wrap">
   <div class="tc-main">
    <div class="card"><div class="note">التكريم الصادق يصنع الفرق؛ اتبعي الخطوات الخمس، وتظهر الشهادة أمامكِ في المعاينة الحية قبل إصدارها.</div>
      ${step(1, 'المكرَّمة', 'يمكنكِ اختيار أكثر من معلمة فتصدر شهادة لكل واحدة في ملف واحد')}
      <div class="tc-ts">${T.map(n => `<label class="${st.t.includes(n) ? 'on' : ''}"><input type="checkbox" data-tt="${esc(n)}" ${st.t.includes(n) ? 'checked' : ''}>${esc(n)}${cnt[n] ? `<i title="شهادات سابقة">${cnt[n]}</i>` : ''}</label>`).join('') || '<div class="empty">لا توجد أسماء في هذا القسم</div>'}</div></div>

    <div class="card">${step(2, 'سبب التكريم', 'اختاري ما ينطبق، أو اكتبي سببًا بعباراتكِ')}
      <div class="tc-gr">${TC_G.map(([g, I]) => `<div><h4>${g}</h4>${I.map(i => `<label class="${st.rs.includes(i) ? 'on' : ''}"><input type="checkbox" data-tr="${i}" ${st.rs.includes(i) ? 'checked' : ''}>${TC_R[i]}</label>`).join('')}</div>`).join('')}</div>
      <input id="tcO" class="tc-in" placeholder="سبب آخر بعباراتكِ (اختياري)" value="${esc(st.oth || '')}"></div>

    <div class="card">${step(3, 'نوع الشهادة', 'لكل نوع مناسبته')}
      <div class="tc-ty">${TC_T.map((t, i) => `<button type="button" class="${st.ti === i ? 'on' : ''}" data-ti="${i}"><span>${TC_TE[i]}</span><b>${t}</b><small>${TC_TH[i]}</small></button>`).join('')}</div></div>

    <div class="card">${step(4, 'التصميم', `${nTpl.length} تصميمًا — اضغطي على التصميم لاختياره`)}
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">${TC_FAM.map(([f], i) => `<button type="button" class="btn sm ${st.fam === i ? '' : 'sec'}" data-fm="${i}">${f}</button>`).join('')}<span class="sp"></span>
        <button type="button" class="btn sm ${st.or !== 'P' ? '' : 'sec'}" data-or="L">▭ بالعرض</button><button type="button" class="btn sm ${st.or === 'P' ? '' : 'sec'}" data-or="P">▯ بالطول</button></div>
      <div class="tc-gal">${nTpl.map((n, i) => TC_FAM[st.fam][1].test(n) ? `<button type="button" class="${st.tpl === i + 1 ? 'on' : ''}" data-tp="${i + 1}"><div class="tc-th" data-th="${i + 1}"></div><span>${i + 1}. ${esc(n)}</span></button>` : '').join('')}</div></div>

    <div class="card">${step(5, 'الآية والعبارة')}
      <div class="form"><div class="fld"><label>الآية الكريمة</label><select id="tcV">${TC_V.map((v, i) => `<option value="${i}" ${st.vs === i ? 'selected' : ''}>﴿${v[0]}﴾ — ${v[1]}</option>`).join('')}</select></div>
      <div class="fld"><label>العبارة التحفيزية</label><select id="tcP">${TC_P.map((p, i) => `<option value="${i}" ${st.ph === i ? 'selected' : ''}>${p}</option>`).join('')}</select></div></div></div>
   </div>
   <div class="tc-side"><div class="card tc-live"><h2 style="margin:0 0 8px">المعاينة الحية</h2>
     <div class="tc-pv" id="tcLive"></div>
     <div class="note" style="margin:8px 0">${st.t.length ? `ستصدر ${st.t.length} ${st.t.length > 2 ? 'شهادات' : st.t.length === 2 ? 'شهادتان' : 'شهادة'}: ${st.t.map(esc).join('، ')}` : 'اختاري المكرَّمة لتظهر في الشهادة.'}</div>
     <div class="actions" style="margin:0;flex-wrap:wrap"><button class="btn" id="tcGo">${ICON.cert} حفظ وإصدار</button><button class="btn sec" id="tcPv" type="button">فتح بالحجم الكامل</button></div></div></div>
  </div>` : ''}
  <div class="card"><div class="row"><h2 style="margin:0">الشهادات الصادرة (${L.length})</h2><span class="sp"></span>
    ${L.length ? `<select id="tcF" style="max-width:240px"><option value="">كل المكرَّمات</option>${Object.keys(cnt).sort((a, b) => a.localeCompare(b, 'ar')).map(n => `<option ${fq === n ? 'selected' : ''} value="${esc(n)}">${esc(n)} (${cnt[n]})</option>`).join('')}</select>` : ''}</div>
    <div class="tbl" style="margin-top:8px"><table class="t"><tr><th>التاريخ</th><th>المكرَّمة</th>${dept ? '' : '<th>القسم</th>'}<th>الشهادة</th><th>سبب التكريم</th><th></th></tr>
    ${LF.map(r => `<tr><td>${dmy(r.date)}</td><td><b>${esc(r.d.t)}</b></td>${dept ? '' : `<td>${esc(r.dept)}</td>`}<td>${esc(r.d.title)}</td><td style="font-size:12.5px">${(r.d.reasons || []).map(esc).join('، ')}</td>
      <td style="white-space:nowrap"><button class="btn sm sec" data-to="${r.id}">فتح الشهادة</button> <button class="btn sm ghost" data-tx="${r.id}" style="color:#A33">🗑 حذف</button></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">لم تصدر شهادات بعد</div></td></tr>`}</table></div></div>`;
  if ($('#tcD')) $('#tcD').onchange = e => { S.tcDept = e.target.value; S.tcSt = null; show(); };
  if ($('#tcF')) $('#tcF').onchange = e => { S.tcF = e.target.value; show(); };
  $$('[data-to]', el).forEach(b => b.onclick = () => tcOpen([S.records.find(x => x.id === b.dataset.to)]));
  $$('[data-tx]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذه الشهادة من السجل؟')) return; await call('delete', { id: b.dataset.tx }); S.records = S.records.filter(x => x.id !== b.dataset.tx); toast('تم الحذف'); refresh(); });
  if (!dept) return;
  const grab = () => {
    st.t = $$('[data-tt]', el).filter(c => c.checked).map(c => c.dataset.tt); st.rs = $$('[data-tr]', el).filter(c => c.checked).map(c => +c.dataset.tr);
    st.oth = $('#tcO').value.trim(); st.vs = +$('#tcV').value; st.ph = +$('#tcP').value;
  };
  const keep = () => { const y = window.scrollY; grab(); show(); window.scrollTo(0, y); };
  $$('[data-tt],[data-tr]', el).forEach(c => c.onchange = keep);
  ['#tcV', '#tcP'].forEach(q => $(q, el).onchange = keep); $('#tcO').onchange = keep;
  $$('[data-ti]', el).forEach(b => b.onclick = () => { st.ti = +b.dataset.ti; keep(); });
  $$('[data-tp]', el).forEach(b => b.onclick = () => { st.tpl = +b.dataset.tp; keep(); });
  $$('[data-fm]', el).forEach(b => b.onclick = () => { st.fam = +b.dataset.fm; keep(); });
  $$('[data-or]', el).forEach(b => b.onclick = () => { st.or = b.dataset.or; keep(); });
  // المعاينة الحية بالتوقيعات، والمصغرات تُرسم عند ظهورها فقط
  if (window.MCK) {
    tcSigs(dept).then(sg => { const bx = $('#tcLive', el); if (bx) tcFrame(bx, tcSample(st, sg, st.t[0]), st.or); });
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(E => E.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); const n = +e.target.dataset.th;
      tcFrame(e.target, tcSample(Object.assign({}, st, { tpl: n }), null, st.t[0]), st.or); }), { rootMargin: '200px' }) : null;
    $$('[data-th]', el).forEach(x => io ? io.observe(x) : tcFrame(x, tcSample(Object.assign({}, st, { tpl: +x.dataset.th }), null, st.t[0]), st.or));
  }
  const build = () => {
    grab(); const reasons = st.rs.map(i => TC_R[i]).concat(st.oth ? [st.oth] : []);
    if (!st.t.length) { toast('اختاري المكرَّمة', 1); return null; } if (!reasons.length) { toast('اختاري سبب تكريم واحدًا على الأقل', 1); return null; }
    return st.t.map(t => ({ dept, item: 'CRT', date: today(), sum: TC_T[st.ti] + ' — ' + reasons.slice(0, 2).join('، '),
      d: { t, reasons, title: TC_T[st.ti], tpl: st.tpl, verse: TC_V[st.vs], ph: TC_P[st.ph], or: st.or, by: S.user.name } }));
  };
  $('#tcPv').onclick = () => { const R = build(); if (R) tcOpen(R); };
  $('#tcGo').onclick = async () => {
    const R = build(); if (!R) return;
    const out = [];
    for (const r of R) { const j = await call('save', { rec: r }); out.push(j.record || Object.assign({ id: j.id }, r)); }
    out.forEach(r => S.records.push(r));
    st.t = []; st.rs = []; st.oth = '';
    toast(`تم حفظ ${out.length} ${out.length > 1 ? 'شهادات' : 'شهادة'} ✓`);
    tcOpen(out); refresh();
  };
}
