/* الميزان — شهادات تقدير النائب الأكاديمي للمعلمات والمنسقات:
   اختيار واحدة أو أكثر أو الجميع، ويظهر المسمى الوظيفي، وسبب التكريم من قوائم جاهزة أو بعباراتها، وكل التصاميم (المبتكرة أولًا) */
'use strict';

const VC_G = [
  ['🏆 الإنجازات والمسابقات', ['تحقيق إنجاز متميز يرفع اسم المدرسة', 'المشاركة في المسابقات وتمثيل المدرسة', 'تحقيق مركز متقدم في مسابقة', 'إعداد الطالبات للمسابقات وتحقيقهن مراكز متقدمة',
    'تمثيل المدرسة في المحافل والفعاليات الخارجية', 'تقديم ممارسة متميزة تستحق النشر', 'الحصول على الرخصة المهنية']],
  ['📈 التحصيل ونواتج التعلّم', ['الجهود المبذولة في رفع التحصيل الأكاديمي للطالبات', 'تحسّن نتائج الطالبات وتحقيق المستهدفات', 'متابعة الطالبات المتعثرات ودعمهن',
    'رعاية الموهوبات والمتفوقات', 'تقديم الحصص الإثرائية والعلاجية', 'التجديد في استراتيجيات التدريس', 'توظيف التقنية في التعليم']],
  ['📋 التقارير والمنصات والمهام', ['استكمال التقرير الأكاديمي السلوكي في موعده', 'توثيق الأعمال في منصة الميزان أولًا بأول', 'التميّز في تسجيل إجراءات التحصيل على منصة سبع سنابل',
    'إنجاز التقارير والملفات بدقة وفي موعدها', 'إتقان إعداد الاختبارات والتقييمات', 'التواصل الفعّال مع أولياء الأمور']],
  ['🌱 التطوير المهني والقيادة', ['تقديم الورش التدريبية وتطوير الزميلات', 'الأداء المتميز في الزيارة الصفية', 'تقديم درس تطبيقي نموذجي',
    'القيادة المتميزة للقسم ومتابعة معلماته', 'المبادرة وتقديم الأفكار البنّاءة', 'التعلّم الذاتي والسعي إلى التطوير المهني']],
  ['🤍 المسؤولية والقيم', ['تحمّل حصص الاحتياط والتكليفات الإضافية بروح المسؤولية', 'التعاون مع الزميلات وروح الفريق الواحد', 'الإسهام المتميز في الأنشطة والفعاليات المدرسية',
    'الانضباط الوظيفي والحضور المبكر', 'حسن الخلق وطيب التعامل', 'العطاء المتميز طوال الفصل الدراسي']],
];
const VC_T = ['شهادة شكر وتقدير', 'شهادة تميّز', 'شهادة إنجاز', 'شهادة امتنان', 'شهادة فخر واعتزاز', 'شهادة إشادة', 'وسام الأثر', 'وسام الريادة', 'وسام سنبلة العطاء'];
const VC_TH = ['للشكر على جهد أو مهمة أُتقنت', 'لأداء لافت يفوق المتوقع', 'لإنجاز محدد: مسابقة، مركز، مشروع', 'لمن ساندت وتحمّلت عبئًا إضافيًا', 'لإنجاز يرفع اسم المدرسة',
  'لممارسة متميزة تستحق النشر', 'لأثر واضح في نتائج الطالبات', 'للمبادرة والقيادة والتجديد', 'أرفع تكريم: عطاء ممتد طوال الفصل'];
const VC_TE = ['🌿', '⭐', '🏆', '🤍', '🏅', '📣', '🌊', '🚀', '🌾'];
const VC_P = TC_P.concat(['أثرُكِ باقٍ في طالباتكِ، وعطاؤكِ محلُّ فخرنا واعتزازنا', 'بكِ تكتمل رسالة الشيماء، وبجهدكِ يرتقي الأداء', 'إنجازكِ اليوم بذرةُ نجاحٍ يحصدها جيلٌ كامل']);

/* المسمى الوظيفي من بيانات المعلمات */
function vcJob(p) {
  if (/منسق/.test(p.role || '')) return 'منسقة قسم ' + p.dept;
  const sj = String(p.subj || p.dept || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s*\+\s*/g, ' و').trim();
  return 'معلمة ' + (sj || p.dept);
}
function vcPeople() {
  const seen = {}, L = [];
  (S.staff || []).forEach(p => { if (!p.name || seen[p.name]) return; seen[p.name] = 1; L.push({ name: p.name, dept: p.dept, coord: /منسق/.test(p.role || ''), job: vcJob(p) }); });
  return L;
}
let VC_SIG = null;
async function vcSig() { if (VC_SIG === null) { try { VC_SIG = (await API.call('signature', {})).data || ''; } catch (e) { VC_SIG = ''; } } return VC_SIG; }
function vcDoc(o, sig) {
  return MCK.doc({ all: 1, or: o.or || 'L', tpl: o.tpl || 1, title: o.title, name: 'أ. ' + o.t, lead: 'تُمنح هذه الشهادة بكل فخر واعتزاز إلى', meta: esc(o.job || ''),
    reasons: o.reasons, phrase: o.ph, verse: o.verse, date: o.date,
    sigs: [{ role: 'مديرة المدرسة', name: 'أ. شيخة الرميحي', img: '' }, { role: 'النائبة الأكاديمية', name: 'أ. آسيا الذبياني', img: sig || '' }] });
}
async function vcOpen(list) {
  if (!window.MCK) return toast('تعذّر تحميل قوالب الشهادات', 1);
  const w = window.open('', '_blank'); if (!w) { toast('اسمحي بالنوافذ المنبثقة لهذا الموقع ثم أعيدي المحاولة', 1); return; }
  w.document.write('<p style="font-family:sans-serif;text-align:center;margin-top:40px">جارٍ تجهيز الشهادات…</p>');
  const sig = await vcSig();
  const docs = list.map(r => vcDoc(Object.assign({ date: dmy(r.date) }, r.d), sig));
  let html = docs[0];
  if (docs.length > 1) html = docs[0].slice(0, docs[0].indexOf('<body>')).replace('</head>', '<style>.c{break-after:page;page-break-after:always}.c:last-child{break-after:auto}@media screen{.c{margin-bottom:8mm}}</style></head>') +
    '<body>' + docs.map(x => x.slice(x.indexOf('<body>') + 6, x.lastIndexOf('</body>'))).join('') + '</body></html>';
  w.document.open(); w.document.write(html); w.document.close();
  w.onload = () => setTimeout(() => w.print(), 700);
}

function A_vcert(el) {
  setTitle('شهادات التقدير');
  const P = vcPeople(), byName = {}; P.forEach(p => byName[p.name] = p);
  const depts = uniq(P.map(p => p.dept)).sort((a, b) => a.localeCompare(b, 'ar'));
  const st = S.vcSt || (S.vcSt = { t: [], rs: [], oth: '', det: '', tpl: 1, ti: 0, vs: 0, ph: 0, or: 'L' });
  const nTpl = window.MCK && MCK.namesAll ? MCK.namesAll() : ['التصميم الأول'], nNew = window.MCK && MCK.newCount ? MCK.newCount() : 0;
  const L = S.records.filter(r => r.item === 'VCR' && r.d).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const cnt = {}; L.forEach(r => cnt[r.d.t] = (cnt[r.d.t] || 0) + 1);
  const step = (n, t, sub) => `<div class="tc-st"><span>${n}</span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const allOn = P.length && st.t.length === P.length;
  const one = st.t.length === 1 ? byName[st.t[0]] : null;
  el.innerHTML = `
  <div class="prq-top"><div class="prq-v">﴿هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ﴾</div><small>الرحمن 60</small></div>
  <div class="tc-wrap"><div class="tc-main">
    <div class="card"><div class="note">التقدير الصادق يصنع الأثر؛ اختاري المكرَّمة أو المكرَّمات، ثم سبب التكريم ونوع الشهادة وتصميمها، وتظهر الشهادة في المعاينة الحية قبل إصدارها.</div>
      ${step(1, 'المكرَّمة', 'واحدة أو أكثر أو الجميع — تصدر شهادة لكل واحدة في ملف واحد')}
      <div class="row" style="gap:8px;flex-wrap:wrap;margin:4px 0 10px"><button type="button" class="btn sm ${allOn ? '' : 'sec'}" data-va="all">${allOn ? '✓ ' : ''}جميع المعلمات والمنسقات (${P.length})</button>
        <button type="button" class="btn sm sec" data-va="co">المنسقات فقط</button>${st.t.length ? `<button type="button" class="btn sm ghost" data-va="none">إلغاء التحديد (${st.t.length})</button>` : ''}</div>
      ${one ? `<div class="vc-one">👤 <b>${esc(one.name)}</b> — ${esc(one.job)}</div>` : ''}
      <div class="vc-ds">${depts.map(d => { const D = P.filter(p => p.dept === d).sort((a, b) => (b.coord - a.coord) || a.name.localeCompare(b.name, 'ar')); const on = D.every(p => st.t.includes(p.name));
        return `<div class="vc-d"><div class="vc-dh"><b>${esc(d)}</b><button type="button" class="lnk" data-vd="${esc(d)}">${on ? 'إلغاء القسم' : 'تحديد القسم'}</button></div>
        ${D.map(p => `<label class="${st.t.includes(p.name) ? 'on' : ''}" title="${esc(p.job)}"><input type="checkbox" data-vt="${esc(p.name)}" ${st.t.includes(p.name) ? 'checked' : ''}><span>${esc(p.name)}${p.coord ? ' <i class="vc-co">منسقة</i>' : ''}${cnt[p.name] ? ` <i class="vc-n" title="شهادات سابقة">${cnt[p.name]}</i>` : ''}</span><small>${esc(p.job)}</small></label>`).join('')}</div>`; }).join('')}</div></div>

    <div class="card">${step(2, 'سبب التكريم', 'اختاري ما ينطبق، أو اكتبي بعباراتكِ')}
      <div class="tc-gr">${VC_G.map(([g, I], gi) => `<div><h4>${g}</h4>${I.map((x, i) => { const k = gi + '.' + i; return `<label class="${st.rs.includes(k) ? 'on' : ''}"><input type="checkbox" data-vr="${k}" ${st.rs.includes(k) ? 'checked' : ''}>${x}</label>`; }).join('')}</div>`).join('')}</div>
      <input id="vcO" class="tc-in" placeholder="سبب آخر بعباراتكِ (اختياري) — مثال: تنظيم يوم الفيزياء" value="${esc(st.oth || '')}">
      <input id="vcDt" class="tc-in" placeholder="تفاصيل الإنجاز (اختياري) — مثال: المركز الأول في مسابقة نجوم العلوم 2026" value="${esc(st.det || '')}"></div>

    <div class="card">${step(3, 'نوع الشهادة', 'لكل نوع مناسبته')}
      <div class="tc-ty">${VC_T.map((t, i) => `<button type="button" class="${st.ti === i ? 'on' : ''}" data-vi="${i}"><span>${VC_TE[i]}</span><b>${t}</b><small>${VC_TH[i]}</small></button>`).join('')}</div></div>

    <div class="card">${step(4, 'التصميم', `${nTpl.length} تصميمًا — أولها ${nNew} تصاميم مبتكرة جديدة ✨`)}
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px"><span class="sp"></span>
        <button type="button" class="btn sm ${st.or !== 'P' ? '' : 'sec'}" data-vo="L">▭ بالعرض</button><button type="button" class="btn sm ${st.or === 'P' ? '' : 'sec'}" data-vo="P">▯ بالطول</button></div>
      <div class="tc-gal">${nTpl.map((n, i) => `<button type="button" class="${st.tpl === i + 1 ? 'on' : ''}" data-vp="${i + 1}"><div class="tc-th" data-vh="${i + 1}"></div><span>${i < nNew ? '✨ ' : ''}${i + 1}. ${esc(n)}</span></button>`).join('')}</div></div>

    <div class="card">${step(5, 'الآية والعبارة')}
      <div class="form"><div class="fld"><label>الآية الكريمة</label><select id="vcV">${TC_V.map((v, i) => `<option value="${i}" ${st.vs === i ? 'selected' : ''}>﴿${v[0]}﴾ — ${v[1]}</option>`).join('')}</select></div>
      <div class="fld"><label>العبارة التحفيزية</label><select id="vcP">${VC_P.map((p, i) => `<option value="${i}" ${st.ph === i ? 'selected' : ''}>${p}</option>`).join('')}</select></div></div></div>
  </div>
  <div class="tc-side"><div class="card tc-live"><h2 style="margin:0 0 8px">المعاينة الحية</h2><div class="tc-pv" id="vcLive"></div>
    <div class="note" style="margin:8px 0">${st.t.length ? `ستصدر ${st.t.length} ${st.t.length > 2 ? 'شهادات' : st.t.length === 2 ? 'شهادتان' : 'شهادة'}${st.t.length <= 6 ? ': ' + st.t.map(esc).join('، ') : ''}` : 'اختاري المكرَّمة لتظهر في الشهادة.'}</div>
    <div class="actions" style="margin:0;flex-wrap:wrap"><button class="btn" id="vcGo">${ICON.cert} حفظ وإصدار</button><button class="btn sec" id="vcPv" type="button">فتح بالحجم الكامل</button></div></div></div>
  </div>
  <div class="card"><h2 style="margin:0">الشهادات الصادرة (${L.length})</h2>
    <div class="tbl" style="margin-top:8px"><table class="t"><tr><th>التاريخ</th><th>المكرَّمة</th><th>المسمى</th><th>الشهادة</th><th>سبب التكريم</th><th></th></tr>
    ${L.map(r => `<tr><td>${dmy(r.date)}</td><td style="white-space:nowrap"><b>${esc(r.d.t)}</b></td><td style="font-size:12.5px">${esc(r.d.job || '')}</td><td>${esc(r.d.title)}</td><td style="font-size:12.5px">${(r.d.reasons || []).map(esc).join('، ')}</td>
      <td style="white-space:nowrap"><button class="btn sm sec" data-vw="${r.id}">فتح الشهادة</button> <button class="btn sm ghost" data-vx="${r.id}" style="color:#A33">🗑 حذف</button></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">لم تصدر شهادات بعد</div></td></tr>`}</table></div></div>`;

  const reasons = () => st.rs.map(k => { const [g, i] = k.split('.').map(Number); return VC_G[g][1][i]; }).concat(st.oth ? [st.oth] : []).concat(st.det ? [st.det] : []);
  const grab = () => { st.oth = $('#vcO').value.trim(); st.det = $('#vcDt').value.trim(); st.vs = +$('#vcV').value; st.ph = +$('#vcP').value; };
  const keep = () => { const y = window.scrollY; grab(); show(); window.scrollTo(0, y); };
  $$('[data-vt]', el).forEach(c => c.onchange = () => { const n = c.dataset.vt; st.t = c.checked ? uniq(st.t.concat(n)) : st.t.filter(x => x !== n); keep(); });
  $$('[data-vd]', el).forEach(b => b.onclick = () => { const D = P.filter(p => p.dept === b.dataset.vd).map(p => p.name); const on = D.every(n => st.t.includes(n));
    st.t = on ? st.t.filter(n => !D.includes(n)) : uniq(st.t.concat(D)); keep(); });
  $$('[data-va]', el).forEach(b => b.onclick = () => { const a = b.dataset.va; st.t = a === 'none' ? [] : a === 'co' ? P.filter(p => p.coord).map(p => p.name) : (allOn ? [] : P.map(p => p.name)); keep(); });
  $$('[data-vr]', el).forEach(c => c.onchange = () => { const k = c.dataset.vr; st.rs = c.checked ? uniq(st.rs.concat(k)) : st.rs.filter(x => x !== k); keep(); });
  ['#vcV', '#vcP', '#vcO', '#vcDt'].forEach(q => $(q, el).onchange = keep);
  $$('[data-vi]', el).forEach(b => b.onclick = () => { st.ti = +b.dataset.vi; keep(); });
  $$('[data-vp]', el).forEach(b => b.onclick = () => { st.tpl = +b.dataset.vp; keep(); });
  $$('[data-vo]', el).forEach(b => b.onclick = () => { st.or = b.dataset.vo; keep(); });
  $$('[data-vw]', el).forEach(b => b.onclick = () => vcOpen([S.records.find(x => x.id === b.dataset.vw)]));
  $$('[data-vx]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذه الشهادة من السجل؟')) return; await call('delete', { id: b.dataset.vx }); S.records = S.records.filter(x => x.id !== b.dataset.vx); toast('تم الحذف'); refresh(); });

  const sample = (tpl, sig) => { const p = byName[st.t[0]]; const R = reasons();
    return vcDoc({ or: st.or, tpl, title: VC_T[st.ti], t: p ? p.name : 'اسم المكرَّمة', job: p ? p.job : 'المسمى الوظيفي', reasons: R.length ? R : ['الجهود المبذولة في رفع التحصيل الأكاديمي للطالبات'],
      ph: VC_P[st.ph], verse: TC_V[st.vs], date: dmy(today()) }, sig); };
  if (window.MCK) {
    vcSig().then(sig => { const bx = $('#vcLive', el); if (bx) tcFrame(bx, sample(st.tpl, sig), st.or); });
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(E => E.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); tcFrame(e.target, sample(+e.target.dataset.vh, ''), st.or); }), { rootMargin: '200px' }) : null;
    $$('[data-vh]', el).forEach(x => io ? io.observe(x) : tcFrame(x, sample(+x.dataset.vh, ''), st.or));
  }
  const build = () => {
    grab(); const R = reasons();
    if (!st.t.length) { toast('اختاري المكرَّمة', 1); return null; } if (!R.length) { toast('اختاري سبب تكريم واحدًا على الأقل', 1); return null; }
    return st.t.map(t => { const p = byName[t] || { dept: '', job: '' };
      return { dept: p.dept, item: 'VCR', date: today(), sum: VC_T[st.ti] + ' — ' + t + ' — ' + R.slice(0, 2).join('، '),
        d: { t, job: p.job, reasons: R, title: VC_T[st.ti], tpl: st.tpl, verse: TC_V[st.vs], ph: VC_P[st.ph], or: st.or, by: S.user.name } }; });
  };
  $('#vcPv').onclick = () => { const R = build(); if (R) vcOpen(R.map(r => Object.assign({}, r))); };
  $('#vcGo').onclick = async () => {
    const R = build(); if (!R) return;
    if (R.length > 5 && !confirm(`سيتم حفظ وإصدار ${R.length} شهادة. متابعة؟`)) return;
    const out = [];
    for (const r of R) { const j = await call('save', { rec: r }); out.push(j.record || Object.assign({ id: j.id }, r)); }
    out.forEach(r => S.records.push(r));
    st.t = []; st.rs = []; st.oth = ''; st.det = '';
    toast(`تم حفظ ${out.length} ${out.length > 1 ? 'شهادات' : 'شهادة'} ✓`);
    vcOpen(out); refresh();
  };
}
