/* ==================================================================
   الميزان — 🎓 ورشي التدريبية (حساب النائبة الأكاديمية، والمديرة للاطلاع)
   · كل ورشة بطاقة: الغلاف والحالة والشهر والمؤشرات، ثم أربعة تبويبات (العرض · الدعوة · التقييم · الكشف)
   · التقييم والكشف: «قبل الاستجابة» (النموذج الفارغ) و«بعد الاستجابة» (النتائج)، والقادمة تظهر باهتة
   · لكل ملف: عرض داخل المنصة · تحميل · طباعة · والرابط التفاعلي إن وُجد
   · لإضافة ورشة: ارفعي ملفاتها في ws/<id>/ وأضيفي كتلتها في MYWS
   ================================================================== */
const MYWS = [
  { id: 'sandooq', acc: '#E07A2E', title: 'الصندوق الأسود', sub: 'حين يتكلّم التقرير', theme: 'التقارير التأملية منهجٌ قيادي لتطوير الأداء', audience: 'القيادة الوسطى (المنسقات)', date: 'الاثنين 16 نوفمبر 2026', month: 'نوفمبر 2026', status: 'done',
    cover: 'ws/sandooq/cover.jpg', stats: [['14', 'دعوة'], ['13', 'حاضرة'], ['11', 'نشاطًا'], ['98%', 'التقييم']],
    live: [{ ic: '🖥️', t: 'العرض', d: 'شرائح الورشة (61 شريحة) بالقصص والمحطات', url: 'https://sandooq.alshaimaa-school.com/deck.html' },
      { ic: '🎫', t: 'الدعوة', d: 'بطاقة الصعود التي أكّدت منها القائدات رغبتهن', url: 'https://sandooq.alshaimaa-school.com/invite.html?view' },
      { ic: '📋', t: 'الكشف', d: 'تسجيل الحضور بمسح رمز QR', url: 'https://sandooq.alshaimaa-school.com/?view#join' },
      { ic: '🎯', t: 'الأنشطة', d: 'منصة التفاعل: الأسئلة والإجابات على الشاشة', url: 'https://sandooq.alshaimaa-school.com/?view#screen' },
      { ic: '⭐', t: 'التقييم', d: 'نموذج التقييم الإلكتروني ونتائجه المباشرة', url: 'https://sandooq.alshaimaa-school.com/evaluation.html?view' }],
    docs: [{ t: 'العرض التقديمي', b: { file: 'ws/sandooq/deck.pdf', d: 'نسخة PDF من الشرائح' } },
      { t: 'الدعوة', b: { file: 'ws/sandooq/invite.png', d: 'بطاقة الدعوة' }, a: { file: 'ws/sandooq/rsvp.pdf', d: 'كشف تسجيل الرغبة: 12 من 14' } },
      { t: 'كشف الحضور', b: { file: 'ws/sandooq/att-before.pdf', d: 'الكشف بأسماء المدعوّات الـ 14' }, a: { file: 'ws/sandooq/att-after.pdf', d: 'الحاضرات ووقت تسجيلهن: 13 حاضرة' } },
      { t: 'التقييم', b: { file: 'ws/sandooq/eval-form.pdf', d: 'نموذج التقييم: 6 عبارات و3 أسئلة' }, a: { file: 'ws/sandooq/eval-results.pdf', d: 'نتائج التقييم ودلالاتها' } }] },
  { id: 'katalog', acc: '#C2185B', title: 'بنات بدون كتالوج', sub: 'طالبة الثانوية: أنماط ومفاتيح', theme: 'خصائص المراهقة وشخصيات الصف… وكيف نكسبها في المدرسة والبيت', audience: 'المعلمات والمنسقات', date: 'الاثنين 23 نوفمبر 2026', month: 'نوفمبر 2026', status: 'soon',
    cover: 'ws/katalog/cover.jpg', stats: [['70', 'معلمة'], ['23', 'نمطًا'], ['6', 'مجموعات'], ['4', 'جولات']],
    live: [{ ic: '🖥️', t: 'العرض', d: 'العرض التفاعلي: الأنماط والمفاتيح', url: 'https://katalog.alshaimaa-school.com/warsha.html?view' },
      { ic: '📋', t: 'الكشف', d: 'تسجيل حضور المعلمات من الجوال', url: 'https://katalog.alshaimaa-school.com/warsha.html?view#join' },
      { ic: '🎯', t: 'الأنشطة', d: 'لعبة «أنا في عمرهم» وأدوات المعلمة', url: 'https://katalog.alshaimaa-school.com/#game' },
      { ic: '🗺️', t: 'خريطة صفّي', d: 'خريطة طالبات كل معلمة حسب الأنماط', url: 'https://katalog.alshaimaa-school.com/map.html' },
      { ic: '⭐', t: 'التقييم', d: 'نموذج التقييم الإلكتروني', url: 'https://katalog.alshaimaa-school.com/warsha.html?view#eval' }],
    docs: [{ t: 'كشف الحضور', b: { file: 'ws/katalog/att-before.pdf', d: 'الكشف بأسماء المعلمات الـ 70 حسب القسم' }, a: null },
      { t: 'التقييم', b: { file: 'ws/katalog/eval-form.pdf', d: 'نموذج التقييم: 6 عبارات و3 أسئلة' }, a: null }] }
];
const MYWS_TABS = [['deck', '🖥️ العرض'], ['invite', '🎫 الدعوة'], ['eval', '⭐ التقييم'], ['att', '📋 الكشف']];
const MYWS_CSS = `
@font-face{font-family:Marhey;src:url(fonts/marhey.ttf)}
.mw{--nv:#1B2560;--gd:#C9A04E;--tq:#2EA9BA;max-width:1080px;margin:0 auto}
.mw-top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:2px 0 16px}
.mw-top h1{margin:0;font-family:Marhey,inherit;font-size:24px;color:var(--nv)}.mw-top p{margin:4px 0 0;font-size:13px;color:#7a7f8c}
.mw-sum{display:flex;gap:8px}.mw-sum span{background:#fff;border:1px solid #ece6d8;border-radius:12px;padding:6px 12px;font-size:12.5px;color:#555;white-space:nowrap}.mw-sum b{color:var(--nv);font-size:15px;margin-inline-end:4px}
.mw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px}
.mw-c{background:#fff;border:1px solid #ece6d8;border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(27,37,89,.07);display:flex;flex-direction:column;cursor:pointer;transition:transform .15s,box-shadow .15s}
.mw-c:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(27,37,89,.13)}
.mw-cv{position:relative;aspect-ratio:16/9;background:#0f1840;display:flex;align-items:center;justify-content:center}
.mw-cv img{width:100%;height:100%;object-fit:contain;display:block}
.mw-st{position:absolute;top:10px;right:10px;font-size:12px;border-radius:20px;padding:3px 11px;font-weight:700}.mw-st.done{background:#e3f6ec;color:#1f7a50}.mw-st.soon{background:#fff3d9;color:#8a6212}
.mw-b{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.mw-b h2{margin:0;font-family:Marhey,inherit;font-size:21px;color:var(--nv)}.mw-b .sb{color:var(--tq);font-size:14px}
.mw-ln{font-size:12.5px;color:#666;display:flex;gap:12px;flex-wrap:wrap}
.mw-k{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}.mw-k div{text-align:center;background:#f4f5fa;border-radius:10px;padding:5px 2px}.mw-k b{display:block;font-size:16px;color:var(--nv)}.mw-k small{font-size:11px;color:#6b7385}
.mw-go{margin-top:auto;align-self:flex-start;font-family:inherit;border:none;background:var(--nv);color:#fff;border-radius:20px;padding:7px 16px;font-size:13px;cursor:pointer;margin-top:10px}
.mw-d{background:#fff;border:1px solid #ece6d8;border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(27,37,89,.07)}
.mw-dh{display:grid;grid-template-columns:360px 1fr;gap:0;border-bottom:1px solid #eee}
.mw-dh .mw-cv{aspect-ratio:auto;min-height:100%}
.mw-di{padding:16px 20px;display:flex;flex-direction:column;gap:7px}
.mw-di h2{margin:0;font-family:Marhey,inherit;font-size:24px;color:var(--nv)}
.mw-ch{display:inline-block;font-size:12px;border-radius:20px;padding:3px 11px;margin-inline-end:6px}.mw-ch.done{background:#e3f6ec;color:#1f7a50}.mw-ch.soon{background:#fff3d9;color:#8a6212}.mw-ch.m{background:#eef0f6;color:#333}
.mw-mt{display:flex;flex-direction:column;gap:3px;font-size:13px;color:#555}
.mw-tb{display:flex;gap:6px;padding:12px 16px;background:#faf8f3;border-bottom:1px solid #eee;flex-wrap:wrap}
.mw-tb button{font-family:inherit;font-size:13.5px;border:1px solid #e2dccd;background:#fff;color:var(--nv);border-radius:20px;padding:6px 16px;cursor:pointer}.mw-tb button.on{background:var(--nv);color:#fff;border-color:var(--nv)}
.mw-its{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px}
.mw-it{border:1px solid #e6e0d0;border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;background:#fff}
.mw-it h4{margin:0;font-size:15px;color:var(--nv);display:flex;align-items:center;gap:8px}.mw-ph{font-size:11px;border-radius:10px;padding:1px 8px;font-weight:400}.mw-ph.b{background:#eef0f6;color:#555}.mw-ph.a{background:#e3f6ec;color:#1f7a50}
.mw-it p{margin:0;font-size:12.5px;color:#666;line-height:1.7}
.mw-bt{display:flex;gap:7px;flex-wrap:wrap;margin-top:auto;padding-top:4px}
.mw-bt a,.mw-bt button{font-family:inherit;font-size:12.5px;text-decoration:none;border:none;cursor:pointer;border-radius:20px;padding:5px 12px;background:var(--nv);color:#fff}
.mw-bt .l{background:#fff;color:var(--nv);border:1.5px solid var(--nv)}
.mw-it.off{opacity:.55;background:#fbfaf6}.mw-it.off .mw-bt{display:none}.mw-wt{font-size:12px;color:#8a6212}
#mwV{position:fixed;inset:0;background:rgba(10,15,40,.78);display:none;z-index:200;align-items:center;justify-content:center;padding:18px}#mwV.on{display:flex}
#mwV .bx{background:#fff;border-radius:16px;width:min(1100px,100%);height:min(92vh,900px);display:flex;flex-direction:column;overflow:hidden}
#mwV .br{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 14px;background:#1B2560;color:#fff}
#mwV .br button,#mwV .br a{font-family:inherit;background:none;border:1px solid rgba(255,255,255,.5);color:#fff;border-radius:14px;padding:4px 12px;cursor:pointer;text-decoration:none;font-size:13px;margin-inline-start:6px}
#mwV iframe,#mwV img{flex:1;border:0;width:100%;min-height:0;object-fit:contain;background:#eee}

.mw-hero{position:relative;overflow:hidden;border-radius:22px;padding:26px 28px;margin-bottom:20px;color:#fff;background:radial-gradient(circle at 15% 20%,rgba(201,160,78,.35),transparent 45%),radial-gradient(circle at 85% 90%,rgba(46,169,186,.3),transparent 50%),linear-gradient(135deg,#1B2560,#0b1236);box-shadow:0 14px 34px rgba(11,18,54,.28)}
.mw-hero:after{content:"";position:absolute;inset:auto -60px -80px auto;width:260px;height:260px;border:2px solid rgba(201,160,78,.35);border-radius:50%}
.mw-hero h1{margin:0;font-family:Marhey,inherit;font-size:30px;color:#fff}.mw-hero h1 em{font-style:normal;color:var(--gd)}
.mw-hero p{margin:8px 0 0;color:#cfd6ee;font-size:14px;line-height:1.9;max-width:560px}
.mw-cnt{display:flex;gap:12px;margin-top:18px;flex-wrap:wrap;position:relative;z-index:1}
.mw-cnt div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:8px 16px;min-width:96px;text-align:center}
.mw-cnt b{display:block;font-family:Marhey,inherit;font-size:24px;color:var(--gd)}.mw-cnt small{font-size:12px;color:#dfe4f5}
.mw-grid{grid-template-columns:repeat(2,1fr)!important}
.mw-c{border-top:5px solid var(--acc)}
.mw-c .mw-b h2{color:var(--acc)}
.mw-th{font-size:13px;color:#555;line-height:1.7}
.mw-ft{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;padding-top:12px;border-top:1px dashed #e6e0d0}
.mw-ft .dt{font-size:12.5px;color:#444;background:#f6f3ec;border-radius:12px;padding:4px 10px}
.mw-c .mw-go{margin:0;background:var(--acc)}
.mw-d .mw-di h2{color:var(--acc)}.mw-d .mw-tb button.on{background:var(--acc);border-color:var(--acc)}.mw-d .mw-k div{border-bottom:3px solid var(--acc)}
.mw-k div{border-bottom:3px solid var(--acc,#1B2560)}
.mw-sh{display:flex;align-items:center;gap:8px;margin:18px 16px 10px;font-weight:700;font-size:16px;color:var(--nv)}.mw-sh span{width:26px;height:26px;border-radius:50%;background:var(--acc);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px}.mw-sh small{font-weight:400;color:#8a8f99;font-size:12px}
.mw-lv{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;padding:0 16px}
.mw-l{font-family:inherit;text-align:center;cursor:pointer;background:#fff;border:1.5px solid #ece6d8;border-radius:16px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .15s}
.mw-l:hover{border-color:var(--acc);transform:translateY(-2px);box-shadow:0 8px 18px rgba(0,0,0,.08)}.mw-l i{font-style:normal;font-size:28px;width:52px;height:52px;border-radius:50%;background:color-mix(in srgb,var(--acc) 12%,#fff);display:flex;align-items:center;justify-content:center}.mw-l b{color:var(--acc);font-size:15px}.mw-l small{color:#777;font-size:11.5px;line-height:1.6}
.mw-dc{margin:0 16px 18px;border:1px solid #ece6d8;border-radius:14px;overflow:hidden}
.mw-dr{display:grid;grid-template-columns:130px 1fr 1fr;border-top:1px solid #f0ebe0}.mw-dr:first-child{border-top:none}.mw-dr>div{padding:10px 12px}
.mw-dr.hd{background:#faf8f3;font-size:12.5px;color:#666;font-weight:700}.mw-dr .t{font-weight:700;color:var(--nv);display:flex;align-items:center;background:#fcfbf8}
.mw-dr .c p{margin:0 0 6px;font-size:12.5px;color:#555}.mw-dr .c.a{background:#f3f9f5}.mw-dr .c.off{opacity:.6}
@media(max-width:760px){.mw-dr{grid-template-columns:1fr}}

@media(max-width:760px){.mw-dh{grid-template-columns:1fr}.mw-its{grid-template-columns:1fr}.mw-grid{grid-template-columns:1fr}}`;
const mwStat = w => w.status === 'done' ? '✓ نُفّذت' : '⏳ قادمة';
function A_myws(el) {
  setTitle('ورشي التدريبية');
  const W = MYWS.slice().sort((a, b) => (a.status === 'soon' ? 0 : 1) - (b.status === 'soon' ? 0 : 1));
  const w = MYWS.find(x => x.id === S.mwOpen);
  if (!w) {
    const att = MYWS.filter(x => x.status === 'done').reduce((a, x) => a + (+((x.stats.find(s => /حاضر/.test(s[1])) || [])[0]) || 0), 0);
    el.innerHTML = `<style>${MYWS_CSS}</style><div class="mw">
      <div class="mw-hero"><h1>🎓 ورشي <em>التدريبية</em></h1><p>كل ورشة قدّمتُها حقيبةٌ متكاملة: عرضها التفاعلي، ودعوتها، وتقييمها، وكشف حضورها، قبل التنفيذ وبعده.</p>
        <div class="mw-cnt"><div><b>${MYWS.length}</b><small>ورشة</small></div><div><b>${MYWS.filter(x => x.status === 'done').length}</b><small>نُفّذت</small></div><div><b>${MYWS.filter(x => x.status !== 'done').length}</b><small>قادمة</small></div>${att ? `<div><b>${att}</b><small>حاضرة حتى الآن</small></div>` : ''}</div></div>
      <div class="mw-grid">${W.map(x => `<div class="mw-c" data-mo="${x.id}" style="--acc:${x.acc || '#1B2560'}"><div class="mw-cv"><img src="${x.cover}" alt=""><span class="mw-st ${x.status}">${mwStat(x)}</span></div>
        <div class="mw-b"><h2>${esc(x.title)}</h2><div class="sb">${esc(x.sub)}</div><div class="mw-th">🎯 ${esc(x.theme)}<br>👥 ${esc(x.audience)}</div>
        <div class="mw-k">${x.stats.map(s => `<div><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div>`).join('')}</div>
        <div class="mw-ft"><span class="dt">🗓️ ${esc(x.date)}</span><button class="mw-go">فتح الحقيبة ←</button></div></div></div>`).join('')}</div></div>`;
    $$('[data-mo]', el).forEach(c => c.onclick = () => { S.mwOpen = c.dataset.mo; A_myws(el); });
    return;
  }
  const fBtns = (x, lbl) => `<div class="mw-bt"><button data-mv="${esc(x.file)}" data-mt="${esc(w.title + ' · ' + lbl)}">👁️ عرض</button><a class="l" href="${esc(x.file)}" download="${esc(w.title + ' - ' + lbl + x.file.slice(x.file.lastIndexOf('.')))}">⬇️ تحميل</a><button class="l" data-mp="${esc(x.file)}">🖨️ طباعة</button></div>`;
  el.innerHTML = `<style>${MYWS_CSS}</style><div class="mw">
    <div class="row" style="margin-bottom:12px"><button class="btn sec" id="mwB">→ كل الورش</button></div>
    <div class="mw-d" style="--acc:${w.acc || '#1B2560'};border-top:5px solid var(--acc)"><div class="mw-dh"><div class="mw-cv"><img src="${w.cover}" alt=""></div>
      <div class="mw-di"><div><span class="mw-ch ${w.status}">${mwStat(w)}</span><span class="mw-ch m">📅 ${esc(w.month)}</span></div>
        <h2>${esc(w.title)}</h2><div style="color:var(--tq);font-size:15px">${esc(w.sub)}</div>
        <div class="mw-mt"><span>🎯 ${esc(w.theme)}</span><span>👥 ${esc(w.audience)}</span><span>🗓️ ${esc(w.date)}</span></div>
        <div class="mw-k">${w.stats.map(s => `<div><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div>`).join('')}</div></div></div>
      <div class="mw-sh"><span>1</span>العروض التفاعلية للورشة</div>
      <div class="mw-lv">${w.live.map(x => `<button class="mw-l" data-mv="${esc(x.url)}" data-mt="${esc(w.title + ' · ' + x.t)}"><i>${x.ic}</i><b>${esc(x.t)}</b><small>${esc(x.d)}</small></button>`).join('')}</div>
      <div class="mw-sh"><span>2</span>النماذج والاستجابات <small>على ترويسة المدرسة</small></div>
      <div class="mw-dc"><div class="mw-dr hd"><div></div><div>قبل الاستجابة (النموذج)</div><div>بعد الاستجابة</div></div>
      ${w.docs.map(x => `<div class="mw-dr"><div class="t">${esc(x.t)}</div>
        <div class="c"><p>${esc(x.b.d)}</p>${fBtns(x.b, x.t)}</div>
        <div class="c ${x.a ? 'a' : x.a === null ? 'off' : ''}">${x.a ? `<p>${esc(x.a.d)}</p>${fBtns(x.a, x.t + ' (بعد)')}` : x.a === null ? '<p class="mw-wt">⏳ تُضاف بعد تنفيذ الورشة</p>' : '<p style="color:#aaa">—</p>'}</div></div>`).join('')}</div>
    </div></div>`;
  $('#mwB', el).onclick = () => { S.mwOpen = null; A_myws(el); };
  $$('[data-mv]', el).forEach(b => b.onclick = () => mwOpen(b.dataset.mv, b.dataset.mt));
  $$('[data-mp]', el).forEach(b => b.onclick = () => mwPrint(b.dataset.mp));
}
const mwIsImg = f => /\.(png|jpe?g)$/i.test(f);
function mwOpen(f, t) {
  let v = $('#mwV'); if (!v) { v = document.createElement('div'); v.id = 'mwV'; document.body.appendChild(v); }
  v.innerHTML = `<div class="bx"><div class="br"><b>${esc(t)}</b><span>${/^https?:/.test(f) ? '' : '<button id="mwP">🖨️ طباعة</button>'}<a href="${esc(f)}" target="_blank" rel="noopener">↗ فتح في نافذة جديدة</a><button id="mwX">✕ إغلاق</button></span></div>${mwIsImg(f) ? `<img src="${esc(f)}" alt="">` : `<iframe src="${esc(/\.pdf$/i.test(f) ? f + '#view=FitH' : f)}"></iframe>`}</div>`;
  v.classList.add('on'); const close = () => { v.classList.remove('on'); v.innerHTML = ''; };
  $('#mwX', v).onclick = close; v.onclick = e => { if (e.target === v) close(); }; if ($('#mwP', v)) $('#mwP', v).onclick = () => mwPrint(f);
}
/* طباعة بالجودة الأصلية: الصورة في صفحة A4 مستقلة، والـ PDF من عارضه مباشرة */
function mwPrint(f) {
  if (mwIsImg(f)) { const w = window.open('', '_blank'); if (!w) return toast('اسمحي بالنوافذ المنبثقة للطباعة');
    w.document.write(`<!doctype html><html><head><title>طباعة</title><style>@page{size:A4;margin:8mm}body{margin:0;display:flex;justify-content:center}img{max-width:100%;max-height:100vh}</style></head><body><img src="${new URL(f, location.href).href}" onload="setTimeout(()=>print(),300)"></body></html>`); w.document.close(); return; }
  const fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;width:0;height:0;border:0;right:-9999px'; fr.src = f; document.body.appendChild(fr);
  fr.onload = () => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { window.open(f, '_blank'); } setTimeout(() => fr.remove(), 60000); };
}
