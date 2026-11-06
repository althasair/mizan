/* الميزان — التقارير التحليلية المطبوعة (للنائب الأكاديمي ومديرة المدرسة فقط)
   تختار الإدارة نوع التقرير والفترة والنطاق، فيُبنى تقرير رأسي بترويسة المدرسة:
   بطاقات أرقام + رسوم بيانية + تحليل مكتوب محسوب من البيانات + مقارنة بالفترة السابقة المماثلة + جدول تفصيلي */
'use strict';

const AR_ALL = 'جميع الأقسام';
const arList = a => (Array.isArray(a) ? a : (a ? [a] : [])).map(x => String(x).trim()).filter(Boolean);
const arPct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;
const arNum = n => String(n);
const arDays = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const arShift = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const arDmy = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return `${+dd}/${+m}/${y}`; };
const arMonth = k => MONTHS[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4);

/* أنواع التقارير: كل نوع يحوّل سجلاته إلى صيغة موحّدة */
const AR_TYPES = {
  pa: {
    t: 'التواصل مع أولياء الأمور', unit: ['تواصل', 'تواصلاً'], catH: 'الغرض من التواصل', sub2: 'وسيلة التواصل', stuLine: 1,
    rows: () => S.records.filter(r => (r.item === 'TPA' || r.item === 'PA') && r.d).map(r => {
      const d = r.d; const stu = arList(d.stu);
      return { dept: r.dept, date: r.date, t: d.t || (r.item === 'PA' ? 'منسقة القسم' : ''), stu, n: stu.length || +d.n || 1,
        cat: d.cat || d.topic || d.c || d.why || 'غير محدد', sub: d.way || '', res: d.res || d.act || '', det: [d.s, d.topic || d.why, d.res].filter(Boolean).join(' — ') };
    }),
  },
  sen: {
    t: 'الحصص الإثرائية', unit: ['حصة إثرائية', 'حصص إثرائية'], catH: 'المادة', sub2: 'نوع الحصة', stuLine: 1,
    rows: () => S.records.filter(r => r.item === 'SEN' && r.d).map(r => {
      const d = r.d; const stu = arList(d.stu);
      return { dept: r.dept, date: r.date, t: d.t || '', stu, n: stu.length, cat: d.subj || 'غير محدد', sub: d.whole ? 'جماعية (للشعبة)' : 'فردية', det: [d.s, d.det].filter(Boolean).join(' — '), whole: !!d.whole, sec: d.s || '' };
    }),
  },
  rf: {
    t: 'تعزيز الطالبات بالشهادات', unit: ['شهادة', 'شهادات'], catH: 'عنوان الشهادة', sub2: 'سبب التكريم', stuLine: 1,
    rows: () => S.records.filter(r => r.item === 'SRF' && r.d).map(r => {
      const d = r.d; const stu = arList(d.stu); const m = String(d.det || '').split(' — على: ');
      return { dept: r.dept, date: r.date, t: d.t || '', stu, n: stu.length || 1, cat: m[0] || 'شهادة', sub: (m[1] || '').split('، ')[0] || '', det: [d.s, d.subj, m[1] ? 'على: ' + m[1] : ''].filter(Boolean).join(' — ') };
    }),
  },
  act: {
    t: 'المبادرات والأنشطة والمسابقات', unit: ['برنامجاً أو نشاطاً', 'برامج وأنشطة'], catH: 'النوع', sub2: 'الأولوية التي يخدمها',
    rows: () => S.records.filter(r => (r.item === 'TA' && r.d && !r.d.q1) || r.item === 'AC').map(r => {
      const d = r.d || {};
      return { dept: r.dept, date: r.date, t: d.t || d.e1 || 'القسم', stu: [], n: +d.n || 0, cat: d.kind || d.ty || 'نشاط', sub: (d.p || d.p1 || '').replace(/^الأولوية \d: /, ''), det: `«${d.name || ''}»` + (d.impact || d.imp ? ' — ' + (d.impact || d.imp) : '') };
    }),
  },
  pv: {
    t: 'الزيارات التبادلية', unit: ['زيارة تبادلية', 'زيارات تبادلية'], catH: 'القسم المُزار', sub2: 'سبب الاختيار',
    rows: () => S.records.filter(r => r.item === 'TPV' && r.d).map(r => {
      const d = r.d;
      return { dept: r.dept, date: r.date, t: d.t || '', stu: [], n: 0, cat: d.vdept || r.dept, sub: arList(d.pick)[0] || '', cross: d.vdept && d.vdept !== r.dept, det: `حضرت حصة أ. ${d.v || ''}` + (arList(d.saw).length ? ' — استفادت: ' + arList(d.saw).join('، ') : '') };
    }),
  },
  ws: {
    t: 'الورش والتطوير المهني', unit: ['ورشة أو مساهمة', 'ورش ومساهمات'], catH: 'الدور', sub2: 'نوع التدريب',
    rows: () => S.records.filter(r => r.item === 'TWS' && r.d).map(r => {
      const d = r.d;
      return { dept: r.dept, date: r.date || (d.date || ''), t: d.t || '', stu: [], n: 0, cat: d.role || 'غير محدد', sub: d.type || '', det: `«${d.title || ''}»` + (d.by ? ' — تقديم: أ. ' + d.by : '') };
    }),
  },
  ach: {
    t: 'الإنجازات والمشاركات', unit: ['إنجازاً أو مشاركة', 'إنجازات ومشاركات'], catH: 'النوع', sub2: 'المستوى',
    rows: () => S.records.filter(r => r.item === 'TACH' && r.d).map(r => {
      const d = r.d;
      return { dept: r.dept, date: r.date, t: d.t || '', stu: [], n: 0, cat: d.kind || 'مشاركة', sub: d.lvl || '', det: `«${d.name || ''}»` + (d.res ? ' — ' + d.res : '') + (d.stu ? ' — ' + d.stu : '') };
    }),
  },
};

function arCount(L, key) { const m = {}; L.forEach(x => { const k = typeof key === 'function' ? key(x) : x[key]; if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }
function arDepts() { return uniq(S.staff.map(s => s.dept).filter(Boolean)).sort((a, b) => a.localeCompare(b, 'ar')); }

/* حساب المؤشرات لفترة ونطاق */
function arCompute(type, from, to, dept) {
  const T = AR_TYPES[type];
  const all = T.rows().filter(x => x.date);
  const inR = (x, a, b) => x.date >= a && x.date <= b && (dept === AR_ALL || x.dept === dept);
  const L = all.filter(x => inR(x, from, to)).sort((a, b) => a.date.localeCompare(b.date));
  const len = arDays(from, to) + 1; const pTo = arShift(from, -1), pFrom = arShift(pTo, -(len - 1));
  const P = all.filter(x => inR(x, pFrom, pTo));
  const staff = S.staff.filter(s => dept === AR_ALL || s.dept === dept);
  const tset = new Set(L.map(x => x.t).filter(t => staff.some(s => s.name === t)));
  const stu = new Set(); L.forEach(x => x.stu.forEach(n => stu.add(n)));
  return { T, L, P, from, to, pFrom, pTo, dept, staffN: staff.length, tN: tset.size, stuN: stu.size, stuSum: L.reduce((a, x) => a + (+x.n || 0), 0),
    byDept: arCount(L, 'dept'), byCat: arCount(L, 'cat'), bySub: arCount(L, 'sub'), byT: arCount(L, 't'), byM: arCount(L, x => x.date.slice(0, 7)).sort((a, b) => a[0].localeCompare(b[0])),
    nonT: staff.filter(s => !tset.has(s.name)).map(s => s.name), zeroDepts: dept === AR_ALL ? arDepts().filter(d => !L.some(x => x.dept === d)) : [] };
}

/* التحليل المكتوب — بالمبني للمجهول، محسوب من الأرقام نفسها */
function arAnalysis(c, type) {
  const u = c.T.unit, N = c.L.length, out = [];
  const scope = c.dept === AR_ALL ? 'على مستوى المدرسة' : 'في قسم ' + c.dept;
  if (!N) return [`لم يُسجَّل أي ${u[0]} ${scope} خلال الفترة من ${arDmy(c.from)} إلى ${arDmy(c.to)}.`];
  out.push(`تم رصد (${N}) ${N > 2 && N < 11 ? u[1] : u[0]} ${scope} خلال الفترة من ${arDmy(c.from)} إلى ${arDmy(c.to)}، نفّذتها (${c.tN}) من أصل (${c.staffN}) معلمة بنسبة مشاركة بلغت (${arPct(c.tN, c.staffN)}%).`);
  if (type === 'pa' || type === 'sen') {
    const tot = S.stuN || 0; const n = c.stuN;
    const wh = c.L.filter(x => x.whole).length;
    if (n) out.push(`وبلغ عدد الطالبات المستفيدات (${n}) طالبة` + (tot && c.dept === AR_ALL ? ` بنسبة (${arPct(n, tot)}%) من إجمالي طالبات المدرسة البالغ (${tot}) طالبة` : '') + (wh ? '، دون احتساب طالبات الحصص الجماعية للشعب.' : '.'));
  }
  if (type === 'sen') { const w = c.L.filter(x => x.whole).length; out.push(`وتوزعت الحصص بين (${w}) حصة جماعية للشعبة و(${N - w}) حصة فردية.`); }
  if (type === 'act' && c.stuSum) out.push(`وبلغ مجموع مشاركات الطالبات المسجلة (${c.stuSum}) مشاركة.`);
  if (type === 'pv') { const x = c.L.filter(r => r.cross).length; out.push(`ومنها (${x}) زيارة إلى أقسام أخرى بنسبة (${arPct(x, N)}%)، وهو مؤشر على تبادل الخبرات بين التخصصات.`); }
  // المقارنة بالفترة السابقة المماثلة
  const pN = c.P.length;
  if (pN) { const ch = Math.round((N - pN) / pN * 100); out.push(`وبالمقارنة مع الفترة السابقة المماثلة (${arDmy(c.pFrom)} – ${arDmy(c.pTo)}) التي رُصد فيها (${pN})، ` + (ch > 0 ? `يظهر ارتفاع بنسبة (${ch}%).` : ch < 0 ? `يظهر انخفاض بنسبة (${-ch}%).` : 'يظهر ثبات في العدد.')); }
  else out.push(`ولم يُسجَّل شيء في الفترة السابقة المماثلة (${arDmy(c.pFrom)} – ${arDmy(c.pTo)})، فلا تتوفر مقارنة.`);
  // الأقسام
  if (c.dept === AR_ALL && c.byDept.length) {
    const [d1, n1] = c.byDept[0]; let s = `وتصدّر قسم ${d1} بـ(${n1}) بنسبة (${arPct(n1, N)}%) من الإجمالي`;
    if (c.byDept[1]) s += `، تلاه قسم ${c.byDept[1][0]} بـ(${c.byDept[1][1]})`; if (c.byDept[2]) s += `، ثم قسم ${c.byDept[2][0]} بـ(${c.byDept[2][1]})`;
    out.push(s + '.');
    if (c.zeroDepts.length) out.push(`ولم يُسجَّل شيء في ${c.zeroDepts.length > 1 ? 'أقسام' : 'قسم'}: ${c.zeroDepts.join('، ')}.`);
  }
  // التصنيف
  if (c.byCat.length && c.byCat[0][0] !== 'غير محدد') out.push(`وجاء في مقدمة «${c.T.catH}»: ${c.byCat.slice(0, 3).map(([k, n]) => `${k} (${n}، ${arPct(n, N)}%)`).join('، ')}.`);
  // الأشهر
  if (c.byM.length > 1) { const pk = c.byM.slice().sort((a, b) => b[1] - a[1])[0]; out.push(`وكان شهر ${arMonth(pk[0])} الأعلى بـ(${pk[1]}).`); }
  // المعلمات
  const tt = c.byT.filter(([t]) => t && t !== 'القسم' && t !== 'منسقة القسم').slice(0, 3);
  if (tt.length) out.push(`ومن أكثر المعلمات تسجيلاً: ${tt.map(([t, n]) => `أ. ${t} (${n})`).join('، ')}.`);
  if (c.dept !== AR_ALL && c.nonT.length && c.nonT.length <= 8) out.push(`ولم يُسجَّل شيء لكل من: ${c.nonT.map(t => 'أ. ' + t).join('، ')}.`);
  return out;
}

/* رسوم بيانية بأعمدة HTML (تُطبع بوضوح وتدعم العربية) */
function arBars(rows, title, max = 12) {
  rows = rows.filter(([k]) => k).slice(0, max); if (!rows.length) return '';
  const M = Math.max(...rows.map(r => r[1])); const tot = rows.reduce((a, r) => a + r[1], 0);
  return `<div class="arc"><div class="arh">${esc(title)}</div>${rows.map(([k, n], i) => `<div class="br"><span class="bl">${esc(String(k).slice(0, 40))}</span><span class="bt"><i style="width:${Math.max(1.5, 100 * n / M)}%;background:${i === 0 ? '#7A1F33' : '#C9A0AA'}"></i></span><span class="bv">${n} <small>(${arPct(n, tot)}%)</small></span></div>`).join('')}</div>`;
}
function arCols(rows, title) {
  if (rows.length < 2) return '';
  const M = Math.max(...rows.map(r => r[1]));
  return `<div class="arc"><div class="arh">${esc(title)}</div><div class="cols">${rows.map(([k, n]) => `<div class="cl"><span class="cv">${n}</span><i style="height:${Math.max(2, 100 * n / M)}%"></i><span class="ck">${esc(arMonth(k))}</span></div>`).join('')}</div></div>`;
}

const AR_CSS = `.fp .kp{display:flex;gap:3mm;margin:3mm 0}.fp .kp div{flex:1;border:1px solid #D8C3C8;border-radius:6px;padding:2mm;text-align:center;background:#FBF6F7}
.fp .kp b{display:block;font-size:17px;color:#7A1F33}.fp .kp span{font-size:9.5px;color:#555}
.fp .arc{border:1px solid #E2D5D8;border-radius:6px;padding:2mm;margin:2mm 0;page-break-inside:avoid}.fp .arh{color:#7A1F33;font-weight:bold;margin-bottom:1mm}
.fp .an p{margin:1.2mm 0;text-align:justify}.fp h2{color:#7A1F33;font-size:13px;margin:4mm 0 1mm;border-bottom:1px solid #E2D5D8;padding-bottom:1mm}
.fp .q{text-align:left;margin:6mm 0 1mm;font-weight:normal}.fp .qn{text-align:left;display:flex;justify-content:flex-end;gap:10mm;font-weight:normal}
.fp .s3{width:100%;margin-top:5mm;border:0}.fp .s3 td{border:0;text-align:center;vertical-align:top;font-weight:normal;font-size:11px}.fp .s3 img{max-height:15mm;max-width:32mm;display:block;margin:1mm auto 0}
.fp .br{display:flex;align-items:center;gap:2mm;margin:1mm 0}.fp .bl{width:38%;font-size:10px;text-align:right}.fp .bt{flex:1;background:#F4EEF0;border-radius:3px;height:3.2mm;overflow:hidden}.fp .bt i{display:block;height:100%;border-radius:3px}.fp .bv{width:16%;font-size:10px;text-align:left}
.fp .cols{display:flex;align-items:flex-end;gap:3mm;height:34mm;padding-top:4mm}.fp .cl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}.fp .cl i{display:block;width:60%;background:#1F4E9A;opacity:.8;border-radius:3px 3px 0 0}.fp .cv{font-size:10px}.fp .ck{font-size:9.5px;margin-top:1mm}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fp table.dt td{font-size:9.5px}.fp table.dt{page-break-inside:auto}.fp table.dt tr{page-break-inside:avoid}`;

async function arPrint(type, from, to, dept, withTable) {
  const c = arCompute(type, from, to, dept); const T = c.T; const N = c.L.length;
  const [imgs, sig] = await Promise.all([lhImgs(), vpSig()]);
  const kp = [[N, 'إجمالي ' + T.unit[1]], [`${c.tN} / ${c.staffN}`, 'المعلمات المشاركات'], [arPct(c.tN, c.staffN) + '%', 'نسبة مشاركة المعلمات']];
  if (T.stuLine) kp.push([c.stuN + (S.stuN && dept === AR_ALL ? ` (${arPct(c.stuN, S.stuN)}%)` : ''), 'الطالبات المستفيدات']);
  else if (c.P.length) kp.push([(N >= c.P.length ? '+' : '') + (N - c.P.length), 'التغير عن الفترة السابقة']);
  const inner = `<h1>تقرير تحليلي: ${esc(T.t)}</h1><div class="sub">${esc(dept === AR_ALL ? 'على مستوى المدرسة' : 'قسم ' + dept)} · من ${arDmy(from)} إلى ${arDmy(to)}</div>
    <div class="kp">${kp.map(([v, l]) => `<div><b>${esc(String(v))}</b><span>${esc(l)}</span></div>`).join('')}</div>
    <h2>التحليل</h2><div class="an">${arAnalysis(c, type).map(p => `<p>${esc(p)}</p>`).join('')}</div>
    ${N ? `<h2>الرسوم البيانية</h2>${dept === AR_ALL ? arBars(c.byDept, 'التوزيع حسب القسم') : arBars(c.byT, 'التوزيع حسب المعلمة')}${arBars(c.byCat, 'التوزيع حسب ' + T.catH, 8)}${arBars(c.bySub.filter(([k]) => k), 'التوزيع حسب ' + T.sub2, 8)}${arCols(c.byM, 'التوزيع حسب الشهر')}` : ''}
    ${withTable && N ? `<h2>السجل التفصيلي (${N})</h2><table class="dt"><tr><th>م</th><th>التاريخ</th>${dept === AR_ALL ? '<th>القسم</th>' : ''}<th>المعلمة</th><th>${esc(T.catH)}</th><th>التفاصيل</th></tr>${c.L.map((x, i) => `<tr><td style="text-align:center">${i + 1}</td><td style="white-space:nowrap">${arDmy(x.date)}</td>${dept === AR_ALL ? `<td>${esc(x.dept)}</td>` : ''}<td>${esc(x.t)}</td><td>${esc(x.cat)}</td><td class="j">${esc(x.det || '')}${x.stu.length ? ` <small>(${x.stu.length} طالبة)</small>` : ''}</td></tr>`).join('')}</table>` : ''}
    <div class="q">«عودًا حميدًا طيبًا مباركًا، عنوانه الإتقان وغايته رضا الرحمن»</div>
    <div class="qn"><span>نائب المديرة للشؤون الأكاديمية</span><span>أ. آسيا الذبياني</span></div>
    <table class="s3"><tr><td>النائبة الإدارية<br>أ. وداد الكربي</td><td>نائب المديرة للشؤون الأكاديمية<br>أ. آسيا الذبياني${sig ? `<img src="${sig}" alt="">` : ''}</td><td>مديرة المدرسة<br>أ. شيخة الرميحي</td></tr></table>`;
  const html = docHTML(inner, imgs, 'تقرير تحليلي — ' + T.t).replace('</style>', AR_CSS + '</style>');
  const w = window.open('', '_blank'); if (!w) { toast('اسمحي بالنوافذ المنبثقة لهذا الموقع ثم أعيدي المحاولة', 1); return; }
  w.document.open(); w.document.write(html); w.document.close();
  w.onload = () => setTimeout(() => w.print(), 400);
}

function A_anrep(el) {
  setTitle('التقارير التحليلية');
  const p = (S.periods.find(x => today() >= x.from && today() <= x.to) || S.periods[0] || { from: today(), to: today() });
  const st = S.arSt || (S.arSt = { type: 'pa', from: p.from, to: today() < p.to ? today() : p.to, dept: AR_ALL, tbl: true });
  const draw = () => {
    const c = arCompute(st.type, st.from, st.to, st.dept);
    el.innerHTML = `<div class="card"><h2>تقرير تحليلي مطبوع <span class="sub">بترويسة المدرسة · رأسي · للنائب الأكاديمي ومديرة المدرسة</span></h2>
      <div class="form" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
        <div class="fld"><label>نوع التقرير</label><select id="arT">${Object.entries(AR_TYPES).map(([k, v]) => `<option value="${k}" ${k === st.type ? 'selected' : ''}>${esc(v.t)}</option>`).join('')}</select></div>
        <div class="fld"><label>من</label><input type="date" id="arF" value="${esc(st.from)}"></div>
        <div class="fld"><label>إلى</label><input type="date" id="arTo" value="${esc(st.to)}"></div>
        <div class="fld"><label>النطاق</label><select id="arD">${[AR_ALL, ...arDepts()].map(d => `<option ${d === st.dept ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
      </div>
      <div class="row" style="gap:10px;margin-top:8px;flex-wrap:wrap"><label style="font-size:13px"><input type="checkbox" id="arTb" ${st.tbl ? 'checked' : ''}> إرفاق السجل التفصيلي</label>
        <div class="row" style="gap:6px">${S.periods.map(x => `<button class="btn sm ghost" data-ap="${esc(x.name)}">${esc(x.name)}</button>`).join('')}</div><span class="sp"></span><button class="btn" id="arP">🖨 طباعة التقرير</button></div></div>
      <div class="card"><h2>معاينة الأرقام</h2>
      <div class="grid g4">${kpi('الإجمالي', c.L.length, c.T.t, 'var(--maroon)')}${kpi('المعلمات المشاركات', c.tN + ' / ' + c.staffN, arPct(c.tN, c.staffN) + '%', 'var(--navy)')}${c.T.stuLine ? kpi('الطالبات المستفيدات', c.stuN, S.stuN && st.dept === AR_ALL ? arPct(c.stuN, S.stuN) + '% من ' + S.stuN : '', 'var(--ok)') : kpi('عدد الأقسام', c.byDept.length, '', 'var(--ok)')}${kpi('الفترة السابقة المماثلة', c.P.length, arDmy(c.pFrom) + ' – ' + arDmy(c.pTo), 'var(--gold)')}</div>
      <div class="note" style="margin-top:8px;text-align:justify">${arAnalysis(c, st.type).map(esc).join('<br>')}</div></div>`;
    const up = () => { st.type = $('#arT').value; st.from = $('#arF').value; st.to = $('#arTo').value; st.dept = $('#arD').value; st.tbl = $('#arTb').checked; if (st.to < st.from) { toast('تاريخ النهاية قبل البداية', 1); return; } draw(); };
    ['#arT', '#arF', '#arTo', '#arD', '#arTb'].forEach(s => $(s).onchange = up);
    $$('[data-ap]', el).forEach(b => b.onclick = () => { const q = S.periods.find(x => x.name === b.dataset.ap); st.from = q.from; st.to = q.to; draw(); });
    $('#arP').onclick = () => arPrint(st.type, st.from, st.to, st.dept, st.tbl);
  };
  draw();
}
