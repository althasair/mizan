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
  'عودًا حميدًا طيبًا مباركًا، عنوانه الإتقان وغايته رضا الرحمن',
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

function C_tcert(el) {
  setTitle('تعزيز المعلمات');
  const dept = tcDept();
  const depts = isAdmin() ? uniq(S.staff.map(s => s.dept).filter(Boolean)).sort((a, b) => a.localeCompare(b, 'ar')) : [];
  const T = S.staff.filter(s => s.dept === dept && s.name !== S.user.name).map(s => s.name).filter((x, i, A) => A.indexOf(x) === i).sort((a, b) => a.localeCompare(b, 'ar'));
  const L = S.records.filter(r => r.item === 'CRT' && r.d && (!dept || r.dept === dept)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const st = S.tcSt || (S.tcSt = { t: [], rs: [], tpl: 1, ti: 0, vs: 0, ph: 0, or: 'L' });
  const nTpl = window.MCK ? MCK.names() : ['التصميم الأول'];
  const cnt = {}; L.forEach(r => cnt[r.d.t] = (cnt[r.d.t] || 0) + 1);
  el.innerHTML = `
  <div class="prq-top"><div class="prq-v">﴿هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ﴾</div><small>الرحمن 60</small></div>
  ${isAdmin() ? `<div class="card"><div class="row"><b>القسم</b><select id="tcD" style="max-width:320px"><option value="">جميع الأقسام (للاطلاع)</option>${depts.map(d => `<option ${d === dept ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div></div>` : ''}
  ${dept ? `<div class="card"><h2>${ICON.cert} شهادة تعزيز لمعلمة <span class="sub">اختاري المعلمة وبنود التعزيز، فتصدر الشهادة بتوقيعكِ وتوقيع النائب الأكاديمي</span></h2>
    <div class="note" style="margin-bottom:10px">معلماتكِ يستحققن التقدير؛ يمكنكِ اختيار أكثر من معلمة لنفس البنود فتصدر شهادة لكل واحدة في ملف واحد.</div>
    <div class="fld"><label style="font-weight:700;display:block;margin-bottom:6px">المعلمة (أو المعلمات)</label><div class="row" style="flex-wrap:wrap;gap:6px">${T.map(n => `<label class="chip" style="cursor:pointer;padding:6px 12px;${st.t.includes(n) ? 'background:var(--maroon);color:#fff' : ''}"><input type="checkbox" data-tt="${esc(n)}" ${st.t.includes(n) ? 'checked' : ''} style="display:none"> ${esc(n)}${cnt[n] ? ` <small style="opacity:.7">(${cnt[n]})</small>` : ''}</label>`).join('') || '<span class="muted">لا توجد معلمات في هذا القسم</span>'}</div></div>
    <div class="fld" style="margin-top:14px"><label style="font-weight:700;display:block;margin-bottom:6px">بنود التعزيز (اختاري ما ينطبق)</label><div class="tc-rs">${TC_R.map((r, i) => `<label><input type="checkbox" data-tr="${i}" ${st.rs.includes(i) ? 'checked' : ''}> ${r}</label>`).join('')}</div>
      <input id="tcO" placeholder="بند آخر تكتبينه بعباراتكِ (اختياري)" value="${esc(st.oth || '')}" style="margin-top:8px;width:100%;border:1px solid var(--line);border-radius:10px;padding:8px 10px"></div>
    <div class="form" style="margin-top:12px">
      <div class="fld"><label>عنوان الشهادة</label><select id="tcTi">${TC_T.map((t, i) => `<option value="${i}" ${st.ti === i ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="fld"><label>تصميم الشهادة</label><select id="tcTp">${nTpl.map((t, i) => `<option value="${i + 1}" ${st.tpl === i + 1 ? 'selected' : ''}>${i + 1}. ${esc(t)}</option>`).join('')}</select></div>
      <div class="fld"><label>الآية الكريمة</label><select id="tcV">${TC_V.map((v, i) => `<option value="${i}" ${st.vs === i ? 'selected' : ''}>﴿${v[0]}﴾ — ${v[1]}</option>`).join('')}</select></div>
      <div class="fld"><label>العبارة التحفيزية</label><select id="tcP">${TC_P.map((p, i) => `<option value="${i}" ${st.ph === i ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
      <div class="fld"><label>اتجاه الصفحة</label><select id="tcOr"><option value="L" ${st.or !== 'P' ? 'selected' : ''}>بالعرض</option><option value="P" ${st.or === 'P' ? 'selected' : ''}>بالطول</option></select></div>
    </div>
    <div class="actions" style="margin-top:12px"><button class="btn" id="tcGo">${ICON.cert} حفظ وإصدار الشهادة</button><button class="btn sec" id="tcPv" type="button">معاينة قبل الحفظ</button></div></div>` : ''}
  <div class="card"><h2>الشهادات الصادرة (${L.length})</h2><div class="tbl"><table class="t"><tr><th>التاريخ</th><th>المعلمة</th>${dept ? '' : '<th>القسم</th>'}<th>الشهادة</th><th>بنود التعزيز</th><th></th></tr>
    ${L.map(r => `<tr><td>${dmy(r.date)}</td><td><b>${esc(r.d.t)}</b></td>${dept ? '' : `<td>${esc(r.dept)}</td>`}<td>${esc(r.d.title)}</td><td style="font-size:12.5px">${(r.d.reasons || []).map(esc).join('، ')}</td>
      <td style="white-space:nowrap"><button class="btn sm sec" data-to="${r.id}">فتح الشهادة</button> <button class="btn sm ghost" data-tx="${r.id}" style="color:#A33">🗑 حذف</button></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">لم تصدر شهادات بعد</div></td></tr>`}</table></div></div>`;
  if ($('#tcD')) $('#tcD').onchange = e => { S.tcDept = e.target.value; S.tcSt = null; show(); };
  $$('[data-to]', el).forEach(b => b.onclick = () => tcOpen([S.records.find(x => x.id === b.dataset.to)]));
  $$('[data-tx]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذه الشهادة من السجل؟')) return; await call('delete', { id: b.dataset.tx }); S.records = S.records.filter(x => x.id !== b.dataset.tx); toast('تم الحذف'); refresh(); });
  if (!dept) return;
  const grab = () => {
    st.t = $$('[data-tt]', el).filter(c => c.checked).map(c => c.dataset.tt); st.rs = $$('[data-tr]', el).filter(c => c.checked).map(c => +c.dataset.tr);
    st.oth = $('#tcO').value.trim(); st.ti = +$('#tcTi').value; st.tpl = +$('#tcTp').value; st.vs = +$('#tcV').value; st.ph = +$('#tcP').value; st.or = $('#tcOr').value;
  };
  $$('[data-tt]', el).forEach(c => c.onchange = () => { grab(); show(); });
  const build = () => {
    grab(); const reasons = st.rs.map(i => TC_R[i]).concat(st.oth ? [st.oth] : []);
    if (!st.t.length) { toast('اختاري المعلمة', 1); return null; } if (!reasons.length) { toast('اختاري بند تعزيز واحدًا على الأقل', 1); return null; }
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
