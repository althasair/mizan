/* ==================================================================
   الميزان — 🎓 ورشي التدريبية (حساب النائبة الأكاديمية، والمديرة للاطلاع)
   · كل ورشة بطاقة: الغلاف والحالة والشهر والمؤشرات، ثم أربعة تبويبات (العرض · الدعوة · التقييم · الكشف)
   · التقييم والكشف: «قبل الاستجابة» (النموذج الفارغ) و«بعد الاستجابة» (النتائج)، والقادمة تظهر باهتة
   · لكل ملف: عرض داخل المنصة · تحميل · طباعة · والرابط التفاعلي إن وُجد
   · لإضافة ورشة: ارفعي ملفاتها في ws/<id>/ وأضيفي كتلتها في MYWS
   ================================================================== */
const MYWS = [
  { id: 'sandooq', title: 'الصندوق الأسود', sub: 'حين يتكلّم التقرير', theme: 'التقارير التأملية منهجٌ قيادي لتطوير الأداء', audience: 'القيادة الوسطى (المنسقات)', date: 'الاثنين 16 نوفمبر 2026', month: 'نوفمبر 2026', status: 'done',
    cover: 'ws/sandooq/cover.jpg', stats: [['14', 'دعوة'], ['13', 'حاضرة'], ['11', 'نشاطًا'], ['98%', 'التقييم']],
    parts: {
      deck: [{ t: 'العرض التقديمي', d: 'شرائح الورشة كاملة (61 شريحة) بالقصص والأنشطة.', file: 'ws/sandooq/deck.pdf', live: 'https://sandooq.alshaimaa-school.com/?view#screen', liveT: 'العرض التفاعلي' }],
      invite: [{ t: 'بطاقة الدعوة', d: 'بطاقة صعود إلكترونية اختارت منها كل قائدة اسمها وأكّدت رغبتها.', file: 'ws/sandooq/invite.png', live: 'https://sandooq.alshaimaa-school.com/invite.html?view', liveT: 'الدعوة التفاعلية' },
        { t: 'كشف تسجيل الرغبة', ph: 'a', d: 'من أكّدت رغبتها في الحضور ووقت التأكيد: 12 من 14.', file: 'ws/sandooq/rsvp.pdf' }],
      eval: [{ t: 'نموذج التقييم', ph: 'b', d: '6 عبارات بمقياس خماسي (المحتوى والمدرّبة) و3 أسئلة مفتوحة.', file: 'ws/sandooq/eval-form.pdf', live: 'https://sandooq.alshaimaa-school.com/evaluation.html?view', liveT: 'النموذج الإلكتروني' },
        { t: 'نتائج التقييم', ph: 'a', d: 'المؤشرات والدلالات ورسائل القائدات للمدرّبة.', file: 'ws/sandooq/eval-results.pdf', live: 'https://sandooq.alshaimaa-school.com/evaluation.html#list', liveT: 'النتائج المباشرة' }],
      att: [{ t: 'كشف الحضور', ph: 'b', d: 'الكشف الفارغ بأسماء المدعوّات الـ 14 قبل الورشة.', file: 'ws/sandooq/att-before.pdf' },
        { t: 'كشف الحضور', ph: 'a', d: 'من حضرت ووقت تسجيلها بمسح رمز QR: 13 حاضرة.', file: 'ws/sandooq/att-after.pdf', live: 'https://sandooq.alshaimaa-school.com/?view#join', liveT: 'تجربة تسجيل الحضور' }]
    } },
  { id: 'katalog', title: 'بنات بدون كتالوج', sub: 'طالبة الثانوية: أنماط ومفاتيح', theme: 'خصائص المراهقة وشخصيات الصف… وكيف نكسبها في المدرسة والبيت', audience: 'المعلمات والمنسقات', date: 'الاثنين 23 نوفمبر 2026', month: 'نوفمبر 2026', status: 'soon',
    cover: 'ws/katalog/cover.jpg', stats: [['70', 'معلمة'], ['23', 'نمطًا'], ['6', 'مجموعات'], ['4', 'جولات']],
    parts: {
      deck: [{ t: 'العرض التقديمي', d: 'العرض التفاعلي: الأنماط والمفاتيح ولعبة «أنا في عمرهم» وخريطة صفّي.', live: 'https://katalog.alshaimaa-school.com/warsha.html?view', liveT: 'العرض التفاعلي' }],
      invite: [],
      eval: [{ t: 'نموذج التقييم', ph: 'b', d: '6 عبارات (المحتوى والمدرّبة) و3 أسئلة مفتوحة.', file: 'ws/katalog/eval-form.pdf', live: 'https://katalog.alshaimaa-school.com/warsha.html?view#eval', liveT: 'النموذج الإلكتروني' },
        { t: 'نتائج التقييم', ph: 'a', d: 'تُضاف بعد تنفيذ الورشة.', pending: 1 }],
      att: [{ t: 'كشف الحضور', ph: 'b', d: 'الكشف الفارغ بأسماء المعلمات الـ 70 مرتبات حسب القسم، والمنسقة أولًا.', file: 'ws/katalog/att-before.pdf' },
        { t: 'كشف الحضور', ph: 'a', d: 'يُضاف بعد تنفيذ الورشة.', pending: 1 }]
    } }
];
const MYWS_TABS = [['deck', '🖥️ العرض'], ['invite', '🎫 الدعوة'], ['eval', '⭐ التقييم'], ['att', '📋 الكشف']];
const MYWS_CSS = `
@font-face{font-family:Marhey;src:url(fonts/marhey.ttf)}
.mw{--nv:#1B2560;--gd:#C9A04E;--tq:#2EA9BA}
.mw-hd{background:linear-gradient(135deg,#1B2560,#0f1840);color:#fff;border-radius:20px;padding:18px 20px;border-bottom:4px solid var(--gd);text-align:center;margin-bottom:14px}
.mw-hd h1{margin:0;font-family:Marhey,inherit;font-size:26px}.mw-hd p{margin:6px 0 0;color:#cfd6ee;font-size:13.5px}
.mw-in{background:#fff;border-radius:14px;padding:10px 14px;font-size:13px;color:#777;line-height:1.8;border-right:5px solid var(--gd);margin-bottom:16px}
.mw-ws{background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(27,37,89,.08);overflow:hidden;margin-bottom:20px;border:1px solid #ece6d8}
.mw-top{display:grid;grid-template-columns:300px 1fr}.mw-top img{width:100%;height:100%;object-fit:cover;min-height:180px;display:block}
.mw-inf{padding:16px 20px}.mw-inf h2{margin:6px 0 0;font-family:Marhey,inherit;font-size:24px;color:var(--nv)}.mw-inf .sb{color:var(--tq);font-size:15px;margin:2px 0 8px}
.mw-ch{display:inline-block;font-size:12px;border-radius:20px;padding:3px 12px;margin-inline-end:6px}.mw-ch.done{background:#e3f6ec;color:#1f7a50}.mw-ch.soon{background:#fff3d9;color:#8a6212}.mw-ch.m{background:#eef0f6;color:#333}
.mw-mt{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.mw-mt span{background:#F7F3EC;border-radius:12px;padding:4px 11px;font-size:12.5px;color:#444;white-space:nowrap}
.mw-st{display:flex;gap:10px;margin-top:12px}.mw-st div{flex:1;text-align:center;background:#f2f4fa;border-radius:12px;padding:6px}.mw-st b{display:block;font-size:19px;color:var(--nv)}.mw-st small{font-size:11.5px;color:#6b7385}
.mw-tb{display:flex;gap:6px;padding:10px 14px 0;border-top:1px solid #eee;flex-wrap:wrap}
.mw-tb button{font-family:inherit;font-size:14px;border:none;background:#f2f4fa;color:var(--nv);border-radius:14px 14px 0 0;padding:8px 16px;cursor:pointer}.mw-tb button.on{background:var(--nv);color:#fff}
.mw-pn{padding:14px 16px 18px;background:#fbfaf6;border-top:3px solid var(--nv)}
.mw-its{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mw-it{background:#fff;border:1px solid #e6e0d0;border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.mw-it h4{margin:0;font-size:15px;color:var(--nv)}.mw-ph{font-size:11.5px;border-radius:10px;padding:1px 9px;align-self:flex-start}.mw-ph.b{background:#eef0f6;color:#555}.mw-ph.a{background:#e3f6ec;color:#1f7a50}
.mw-it p{margin:0;font-size:12.5px;color:#666;line-height:1.7}
.mw-bt{display:flex;gap:7px;flex-wrap:wrap;margin-top:4px}
.mw-bt a,.mw-bt button{font-family:inherit;font-size:13px;text-decoration:none;border:none;cursor:pointer;border-radius:20px;padding:6px 13px;background:var(--nv);color:#fff}
.mw-bt .l{background:#fff;color:var(--nv);border:1.5px solid var(--nv)}
.mw-it.off{opacity:.55}.mw-it.off .mw-bt{display:none}.mw-wt{font-size:12px;color:#8a6212}
#mwV{position:fixed;inset:0;background:rgba(10,15,40,.78);display:none;z-index:200;align-items:center;justify-content:center;padding:18px}#mwV.on{display:flex}
#mwV .bx{background:#fff;border-radius:16px;width:min(1100px,100%);height:min(92vh,900px);display:flex;flex-direction:column;overflow:hidden}
#mwV .br{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 14px;background:#1B2560;color:#fff}
#mwV .br button,#mwV .br a{font-family:inherit;background:none;border:1px solid rgba(255,255,255,.5);color:#fff;border-radius:14px;padding:4px 12px;cursor:pointer;text-decoration:none;font-size:13px;margin-inline-start:6px}
#mwV iframe,#mwV img{flex:1;border:0;width:100%;min-height:0;object-fit:contain;background:#eee}
@media(max-width:760px){.mw-top{grid-template-columns:1fr}.mw-its{grid-template-columns:1fr}}`;
function A_myws(el) {
  setTitle('ورشي التدريبية');
  const card = w => { const tabs = MYWS_TABS.filter(([k]) => (w.parts[k] || []).length); const cur = (S.mwTab || {})[w.id] || tabs[0][0];
    return `<div class="mw-ws"><div class="mw-top"><img src="${w.cover}" alt=""><div class="mw-inf"><span class="mw-ch ${w.status}">${w.status === 'done' ? '✓ نُفّذت' : '⏳ قادمة'}</span><span class="mw-ch m">📅 ${esc(w.month)}</span>
      <h2>${esc(w.title)}</h2><div class="sb">${esc(w.sub)}</div><div class="mw-mt"><span>🎯 ${esc(w.theme)}</span><span>👥 ${esc(w.audience)}</span><span>🗓️ ${esc(w.date)}</span></div>
      <div class="mw-st">${w.stats.map(s => `<div><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div>`).join('')}</div></div></div>
      <div class="mw-tb">${tabs.map(([k, t]) => `<button class="${k === cur ? 'on' : ''}" data-mw="${w.id}" data-mk="${k}">${t}</button>`).join('')}</div>
      <div class="mw-pn"><div class="mw-its">${w.parts[cur].map(it => `<div class="mw-it ${it.pending ? 'off' : ''}"><h4>${esc(it.t)}</h4>${it.ph ? `<span class="mw-ph ${it.ph}">${it.ph === 'b' ? 'قبل الاستجابة' : 'بعد الاستجابة'}</span>` : ''}<p>${esc(it.d)}</p>${it.pending ? '<span class="mw-wt">⏳ بعد تنفيذ الورشة</span>' : ''}
        <div class="mw-bt">${it.file ? `<button data-mv="${esc(it.file)}" data-mt="${esc(w.title + ' · ' + it.t)}">👁️ عرض</button><a class="l" href="${esc(it.file)}" download="${esc(w.title + ' - ' + it.t + (it.ph === 'a' ? ' (بعد)' : it.ph === 'b' ? ' (قبل)' : '') + it.file.slice(it.file.lastIndexOf('.')))}">⬇️ تحميل</a><button class="l" data-mp="${esc(it.file)}">🖨️ طباعة</button>` : ''}${it.live ? `<a class="l" href="${esc(it.live)}" target="_blank" rel="noopener">↗ ${esc(it.liveT)}</a>` : ''}</div></div>`).join('')}</div></div></div>`; };
  el.innerHTML = `<style>${MYWS_CSS}</style><div class="mw"><div class="mw-hd"><h1>🎓 ورشي التدريبية</h1><p>كل ورشة قدّمتها النائبة الأكاديمية: عرضها ودعوتها وتقييمها وكشف حضورها في مكان واحد</p></div>
    <div class="mw-in">اختاري الورشة، ثم القسم الذي تريدينه (العرض، الدعوة، التقييم، الكشف). لكل تقييم وكشف نسختان: <b>قبل الاستجابة</b> (النموذج الفارغ) و<b>بعد الاستجابة</b> (النتائج كما وصلت)، وتظهر نسخة «بعد» عند تنفيذ الورشة.</div>
    ${MYWS.map(card).join('')}</div>`;
  $$('[data-mw]', el).forEach(b => b.onclick = () => { S.mwTab = Object.assign({}, S.mwTab, { [b.dataset.mw]: b.dataset.mk }); A_myws(el); });
  $$('[data-mv]', el).forEach(b => b.onclick = () => mwOpen(b.dataset.mv, b.dataset.mt));
  $$('[data-mp]', el).forEach(b => b.onclick = () => mwPrint(b.dataset.mp));
}
const mwIsImg = f => /\.(png|jpe?g)$/i.test(f);
function mwOpen(f, t) {
  let v = $('#mwV'); if (!v) { v = document.createElement('div'); v.id = 'mwV'; document.body.appendChild(v); }
  v.innerHTML = `<div class="bx"><div class="br"><b>${esc(t)}</b><span><button id="mwP">🖨️ طباعة</button><a href="${esc(f)}" target="_blank" rel="noopener">↗ فتح في نافذة جديدة</a><button id="mwX">✕ إغلاق</button></span></div>${mwIsImg(f) ? `<img src="${esc(f)}" alt="">` : `<iframe src="${esc(f)}"></iframe>`}</div>`;
  v.classList.add('on'); const close = () => { v.classList.remove('on'); v.innerHTML = ''; };
  $('#mwX', v).onclick = close; v.onclick = e => { if (e.target === v) close(); }; $('#mwP', v).onclick = () => mwPrint(f);
}
/* طباعة بالجودة الأصلية: الصورة في صفحة A4 مستقلة، والـ PDF من عارضه مباشرة */
function mwPrint(f) {
  if (mwIsImg(f)) { const w = window.open('', '_blank'); if (!w) return toast('اسمحي بالنوافذ المنبثقة للطباعة');
    w.document.write(`<!doctype html><html><head><title>طباعة</title><style>@page{size:A4;margin:8mm}body{margin:0;display:flex;justify-content:center}img{max-width:100%;max-height:100vh}</style></head><body><img src="${new URL(f, location.href).href}" onload="setTimeout(()=>print(),300)"></body></html>`); w.document.close(); return; }
  const fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;width:0;height:0;border:0;right:-9999px'; fr.src = f; document.body.appendChild(fr);
  fr.onload = () => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { window.open(f, '_blank'); } setTimeout(() => fr.remove(), 60000); };
}
