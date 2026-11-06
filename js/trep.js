/* الميزان — تقرير أعمال المعلمة الشهري
   يجمع ما وثّقته المعلمة في الميزان (وما يصل من سبع سنابل) خلال شهر، ويختم بوصفٍ لأدائها:
   معلمة مبادِرة · معلمة مجتهدة · بحاجة إلى مضاعفة الجهد. يظهر للمعلمة ولمنسقتها وللنائب والمديرة. */
'use strict';

const TR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const trM = k => (TR_MONTHS[+String(k).slice(5, 7) - 1] || '') + ' ' + String(k).slice(0, 4);
function trMonthList() {   // أشهر العام الدراسي حتى الشهر الحالي، الأحدث أولاً
  const ps = (S.periods || []).slice().sort((a, b) => a.from.localeCompare(b.from)); if (!ps.length) return [today().slice(0, 7)];
  const L = []; let d = new Date(ps[0].from.slice(0, 7) + '-01T12:00:00'); const end = today().slice(0, 7);
  while (true) { const k = d.toISOString().slice(0, 7); L.push(k); if (k >= end || L.length > 14) break; d.setMonth(d.getMonth() + 1); }
  return L.reverse();
}
const trList = v => Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);

function trData(name, mk) {
  const inM = r => String(r.date || '').slice(0, 7) === mk;
  const own = it => S.records.filter(r => r.item === it && r.d && r.d.t === name && inM(r));
  const D = {
    ta: own('TA'), pv: own('TPV'), ws: own('TWS'), pa: own('TPA'), ach: own('TACH'), tas: own('TAS'), ds: own('TDS'),
    host: S.records.filter(r => r.item === 'TPV' && r.d && r.d.v === name && inM(r)),
    sen: S.records.filter(r => r.item === 'SEN' && r.d && (r.d.t === name || r.d.teacher === name) && inM(r)),
    is: S.records.filter(r => r.item === 'IS' && r.d && r.d.t === name && inM(r)),
    v: S.records.filter(r => r.item === 'V' && r.d && r.d.t === name && inM(r)),
  };
  D.ini = D.ta.filter(r => r.d.kind === 'مبادرة').length + D.ws.filter(r => r.d.role === 'قدّمتُ لتطوير الزملاء').length;
  D.work = D.ta.length + D.pv.length + D.ws.length + D.pa.length + D.ach.length + D.tas.length;
  D.cls = D.ini >= 1 && D.work >= 5 ? 'مبادرة' : D.work >= 3 ? 'مجتهدة' : 'ضعيف';
  return D;
}

function trBody(name, mk, D) {
  const dt = r => r.date ? ` (${dm(r.date)})` : '';
  const sec = (h, lines, empty) => `<tr><td class="k">${h}</td><td class="j">${lines.length ? lines.map(x => `<div>• ${esc(x)}</div>`).join('') : `<span style="color:#888">${empty}</span>`}</td></tr>`;
  const taL = D.ta.map(r => `${r.d.kind || 'نشاط'} «${String(r.d.name || '').trim()}»${dt(r)}` + (trList(r.d.ps).length ? ` — يخدم: ${trList(r.d.ps).map(p => p.replace(/^الأولوية (\d): .*/, 'الأولوية $1')).join('، ')}` : ''));
  const pvL = D.pv.map(r => `زارت أ. ${r.d.v}${dt(r)}` + (trList(r.d.saw).length ? `، واستفادت: ${trList(r.d.saw).join('، ')}` : '') + (trList(r.d.apply).length ? `، وستطبّق: ${trList(r.d.apply).join('، ')}` : ''))
    .concat(D.host.map(r => `استضافت زيارة من أ. ${r.d.t}${dt(r)}، توظيفاً لجوانب تميّزها`));
  const wsL = D.ws.map(r => `${r.d.role === 'قدّمتُ لتطوير الزملاء' ? 'قدّمت لزميلاتها' : r.d.role === 'حضرتُ ورشة خارجية' ? 'حضرت ورشة خارجية' : 'حضرت ورشة داخلية'}: «${String(r.d.title || '').trim()}»${dt(r)}`);
  const nPA = D.pa.reduce((a, r) => a + (+r.d.n || (r.d.stu && r.d.stu.length) || 1), 0);
  const paL = D.pa.length ? [`تواصلت مع أولياء أمور (${nPA}) من الطالبات، ومن أغراض التواصل: ${[...new Set(D.pa.map(r => r.d.topic || r.d.why).filter(Boolean))].join('، ') || 'متابعة أكاديمية'}`] : [];
  const achL = D.ach.map(r => `${r.d.kind || 'مشاركة'}: «${String(r.d.name || '').trim()}»${r.d.res ? ' — ' + r.d.res : ''}${dt(r)}`);
  const tasL = D.tas.map(r => `${trList(r.d.what).join('، ')}${r.d.scope === 'طوال العام' ? ' (طوال العام)' : ''}${r.d.by ? ' — بتكليف من ' + r.d.by : ''}`);
  const dsAbs = D.ds.reduce((a, r) => a + (r.d.abs || []).length, 0), dsPerm = D.ds.reduce((a, r) => a + (r.d.perm || []).length, 0);
  const showDs = isTeacher() || isAdmin();
  const senL = D.sen.length ? [`نفّذت (${D.sen.length}) من الحصص الإثرائية المسجّلة في سبع سنابل`] : [];
  const supL = [...(D.v.length ? [`زارتها منسقة القسم (${D.v.length}) ${D.v.length === 1 ? 'زيارة' : 'زيارات'} صفية`] : []), ...(D.is.length ? [`عُقدت معها (${D.is.length}) ${D.is.length === 1 ? 'جلسة فردية' : 'جلسات فردية'}`] : [])];
  const kpi = (n, l) => `<td style="text-align:center"><div style="font-size:16px;font-weight:bold;color:#7A1F33">${n}</div><div style="font-size:9.5px">${l}</div></td>`;
  const verdict = {
    'مبادرة': ['معلمة مبادِرة', `تميّزت المعلمة خلال شهر ${trM(mk)} بروحٍ مبادِرة وعطاءٍ يتجاوز المطلوب، إذ جمعت بين التطوير المهني والعمل مع الطالبات والمبادرة بما لم تُكلَّف به، وهذا يدل على حرصها على صناعة الأثر وإتقان العمل.`],
    'مجتهدة': ['معلمة مجتهدة', `أدّت المعلمة خلال شهر ${trM(mk)} ما أُنيط بها بجدٍّ واجتهاد، ووثّقت أعمالها بانتظام، والمأمول منها مزيدٌ من المبادرة بأعمالٍ نوعية تخدم أولويات المدرسة.`],
    'ضعيف': ['بحاجة إلى مضاعفة الجهد', `قلّ ما وُثّق من أعمال المعلمة خلال شهر ${trM(mk)}، والتوصية: مضاعفة الجهد في ${[!D.pv.length ? 'الزيارات التبادلية' : '', !D.pa.length ? 'التواصل مع أولياء الأمور' : '', !D.ta.length ? 'الأنشطة والمبادرات' : '', !D.ws.length ? 'التطوير المهني' : ''].filter(Boolean).join('، ') || 'توثيق الأعمال أولاً بأول'}.`]
  }[D.cls];
  return `<h1>تقرير أعمال المعلمة الشهري</h1><div class="sub">أ. ${esc(name)} — شهر ${trM(mk)}</div>
  <table><tr>${kpi(D.ta.length, 'أنشطة ومبادرات')}${kpi(D.pv.length + D.host.length, 'زيارات تبادلية')}${kpi(D.ws.length, 'ورش وتطوير')}${kpi(nPA, 'أولياء أمور')}${kpi(D.ach.length, 'إنجازات ومشاركات')}${kpi(D.tas.length, 'تكليفات')}</tr></table>
  <table>
    ${sec('الأنشطة والبرامج والمبادرات', taL, 'لم يُوثَّق خلال الشهر.')}
    ${sec('الزيارات التبادلية', pvL, 'لم يُوثَّق خلال الشهر.')}
    ${sec('الورش والتطوير المهني', wsL, 'لم يُوثَّق خلال الشهر.')}
    ${sec('التواصل مع أولياء الأمور', paL, 'لم يُوثَّق خلال الشهر.')}
    ${sec('الإنجازات والمشاركات', achL, 'لم يُوثَّق خلال الشهر.')}
    ${sec('التكليفات والأعباء الوظيفية', tasL, 'لم تُسجَّل تكليفات خلال الشهر.')}
    ${senL.length ? sec('من سبع سنابل', senL, '') : ''}
    ${supL.length ? sec('المتابعة الإشرافية', supL, '') : ''}
    ${showDs ? sec('الانضباط الوظيفي', D.ds.length ? [`غياب: ${dsAbs} · استئذان: ${dsPerm}`] : [], 'لم يُسجَّل الانضباط لهذا الشهر.') : ''}
  </table>
  <div class="gen"><div class="h">التقدير العام: ${verdict[0]}</div><div class="b">${esc(verdict[1])}</div></div>`;
}

function T_rep(el) { trPage(el, S.user.name); }
function C_trep(el) { trPage(el, null); }
function trPage(el, fixed) {
  if (!document.getElementById('trcss')) { const st = document.createElement('style'); st.id = 'trcss'; st.textContent = FORM_CSS + '.trv{font-size:12.5px}.trv h1{font-size:18px}'; document.head.appendChild(st); }
  setTitle(fixed ? 'تقرير أعمالي الشهري' : 'تقارير أعمال المعلمات');
  const months = trMonthList(); S.trm = months.includes(S.trm) ? S.trm : months[0];
  const staff = fixed ? [fixed] : (S.staff || []).filter(s => s.name && (isAdmin() ? (!S.dept || s.dept === S.dept) : (S.user.dept || []).includes(s.dept))).map(s => s.name).filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a.localeCompare(b, 'ar'));
  S.trt = fixed || (staff.includes(S.trt) ? S.trt : staff[0] || '');
  const D = S.trt ? trData(S.trt, S.trm) : null;
  const chip = c => c === 'مبادرة' ? '<span class="chip ok">مبادِرة</span>' : c === 'مجتهدة' ? '<span class="chip tf">مجتهدة</span>' : '<span class="chip warn">بحاجة إلى مضاعفة الجهد</span>';
  el.innerHTML = `<div class="tins">${fixed ? 'معلمتي الغالية، هذا تقرير شهري يجمع تلقائياً كل ما وثّقتِه في الميزان وما يصل من سبع سنابل. اختاري الشهر، ثم اطبعيه أو احفظيه PDF لملفكِ.' : 'اختاري الشهر لتظهر أعمال كل معلمة وتقديرها العام، ثم افتحي تقرير أي معلمة لطباعته. يُبنى التقرير تلقائياً مما وثّقته المعلمة في الميزان وما يصل من سبع سنابل.'}</div>
  <div class="card"><div class="row" style="gap:10px;flex-wrap:wrap">
    <select id="trM">${months.map(m => `<option value="${m}" ${m === S.trm ? 'selected' : ''}>${trM(m)}</option>`).join('')}</select>
    ${fixed ? '' : `<select id="trT">${staff.map(t => `<option ${t === S.trt ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`}
    <span class="sp"></span>${S.trt ? '<button class="btn ro-keep" id="trP">طباعة / حفظ PDF</button>' : ''}</div>
  ${fixed ? '' : `<div class="tbl" style="margin-top:10px"><table class="t"><tr><th>المعلمة</th><th>الأعمال</th><th>مبادرات</th><th>زيارات تبادلية</th><th>أولياء أمور</th><th>التقدير</th><th></th></tr>
    ${staff.map(t => { const x = trData(t, S.trm); return `<tr><td style="white-space:nowrap"><b>${esc(t)}</b></td><td>${x.work}</td><td>${x.ini}</td><td>${x.pv.length}</td><td>${x.pa.length}</td><td>${chip(x.cls)}</td><td><button class="btn sm sec" data-tt="${esc(t)}">عرض</button></td></tr>`; }).join('')}</table></div>`}</div>
  ${D ? `<div class="card"><div class="fp trv">${trBody(S.trt, S.trm, D)}${vpSignLine()}</div></div>` : '<div class="empty">لا توجد معلمات</div>'}`;
  fillVps(el);
  $('#trM').onchange = e => { S.trm = e.target.value; show(); };
  if ($('#trT')) $('#trT').onchange = e => { S.trt = e.target.value; show(); };
  $$('[data-tt]', el).forEach(b => b.onclick = () => { S.trt = b.dataset.tt; show(); setTimeout(() => { const c = $('.trv'); if (c) c.scrollIntoView({ behavior: 'smooth' }); }, 50); });
  if ($('#trP')) $('#trP').onclick = async () => {
    const imgs = await lhImgs(); await fillVps();
    const font = new URL('fonts/ruqaa.ttf', location.href).href;
    const sign = VPS_CHEER ? `<div style="position:relative;width:200px;height:84px;margin:6mm 0 0 4mm;margin-inline-start:auto"><img src="${VPS_CHEER}" style="height:84px;opacity:.2;filter:grayscale(1);transform:translateX(-45px)"><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:RuqaaName;font-size:24px;color:#8E929A;white-space:nowrap">آسيا الذبياني</div></div>` : `<div style="text-align:left;margin-top:6mm;font-family:RuqaaName;font-size:22px;color:#8E929A">آسيا الذبياني</div>`;
    const html = docHTML(trBody(S.trt, S.trm, trData(S.trt, S.trm)) + sign, imgs, `تقرير أعمال ${S.trt} ${trM(S.trm)}`).replace('</style>', `@font-face{font-family:'RuqaaName';src:url('${font}') format('truetype')}</style>`);
    const w = window.open('', '_blank'); if (!w) { toast('اسمحي بالنوافذ المنبثقة لهذا الموقع ثم أعيدي المحاولة', 1); return; }
    w.document.write(html); w.document.close(); setTimeout(() => w.print(), 700);
  };
}
