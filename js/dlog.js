/* ================================================================== سجل أعمال القسم — مرجع كمي للمنسقة (بالأشهر)
   المصادر: ما سجّلته المنسقة، وما سجّلته المعلمات بأنفسهن، وما يصل من سبع سنابل ومنصة انضباط.
   قواعد الدقة (حتى لا يُعدّ العمل مرتين):
   1) سجل المعلمة المنقول من تقرير المنسقة (q1) نسخة من سجل المنسقة نفسه فلا يُعدّ.
   2) سجلات «منقولة من تقرير الربع الأول» (nd) بلا تاريخ لا تُنسب إلى شهر، وتظهر منفصلة؛ وما له سجل تفصيلي مؤرخ مماثل يُستبعد.
   3) ما سجّلته المعلمة وسجّلته المنسقة للعمل نفسه يُعدّ مرة واحدة (الزيارة التبادلية، الإنجاز، البرنامج الخارجي، الورشة المقدَّمة، النشاط).
   4) سجل الاجتماع قد يمثّل عدة اجتماعات (cnt). */
const DL_CATS = [
  { k: 'act', n: 'الأنشطة والمبادرات والمسابقات', e: '🎯', c: '#B8521A', it: ['AC', 'TA'], sub: r => dlKind(r) },
  { k: 'pv', n: 'الزيارات التبادلية', e: '🤝', c: '#5B3E8F', it: ['PV', 'TPV', 'TEX'], sub: r => r.item === 'TEX' ? 'فعالية تبادلية' : 'زيارة نفّذتها' },
  { k: 'cv', n: 'الحضور الصفي (زيارات لها)', e: '👁️', c: '#3E5C9A', it: ['V', 'OV', 'VPV', 'PRV', 'LVV'], sub: r => ({ V: 'المنسقة', OV: 'القيادة والتوجيه', VPV: 'النائب الأكاديمي', PRV: 'المديرة', LVV: r.d.k === 'pr' ? 'المديرة' : 'النائب الأكاديمي' })[r.item] },
  { k: 'pd', n: 'التطوير المهني', e: '🎓', c: '#0A6F6B', it: ['WS', 'EX', 'TWS'], sub: r => r.item === 'WS' ? 'قدّمت ورشة' : r.item === 'EX' ? (pdKind(r.d) === 'self' ? 'تنمية ذاتية' : 'برنامج خارجي رسمي') : r.d.role === 'قدّمتُ لتطوير الزملاء' ? 'قدّمت ورشة' : r.d.role === 'حضرتُ ورشة خارجية' ? (pdKind(r.d) === 'self' ? 'تنمية ذاتية' : 'برنامج خارجي رسمي') : 'حضرت ورشة داخلية' },
  { k: 'ra', n: 'إجراءات رفع التحصيل', e: '📈', c: '#7A1F3D', it: ['RA', 'SFB', 'SAC', 'SRF', 'SAN', 'XCMP'], sub: r => ({ RA: 'سجل المنسقة', SFB: 'تغذية راجعة وتقييم قصير', SAC: 'نشاط وتعلّم أقران', SRF: 'تعزيز الطالبات', SAN: 'تحليل النتائج', XCMP: 'تعويض عن الخروج' })[r.item] },
  { k: 'en', n: 'الحصص الإثرائية', e: '📚', c: '#946410', it: ['SEN'], sub: r => r.d.whole ? 'جماعية' : 'فردية' },
  { k: 'pa', n: 'التواصل مع أولياء الأمور', e: '🏡', c: '#17734A', it: ['PA', 'TPA'], sub: r => r.item === 'PA' ? 'سجل المنسقة' : r.d.src === 'sab3' ? 'سبع سنابل' : 'سجل المعلمة' },
  { k: 'ach', n: 'الإنجازات والمشاركات', e: '🏆', c: '#946410', it: ['ACH', 'TACH'], sub: r => /إنجاز|مركز|فوز/.test((r.d.kind || '') + (r.d.c || '') + (r.d.res || '')) ? 'إنجاز' : 'مشاركة' },
  { k: 'mt', n: 'اجتماعات القسم', e: '🗣️', c: '#3A5A7A', it: ['MT'], f: r => /قسم/.test(r.d.ty || ''), sub: r => r.d.by && r.d.by !== 'المنسقة' ? 'بحضور ' + r.d.by : 'اجتماع قسم دوري', org: 1 },
  { k: 'att', n: 'الحضور والغياب', e: '🕘', c: '#A3202F', it: ['PRQ', 'SBA', 'SBC', 'TDS'], sub: r => ({ PRQ: 'إذنٌ مُيسَّر', SBA: 'غياب عن حصة', SBC: 'احتياط وتبديل', TDS: 'غياب واستئذان' })[r.item] },
  { k: 'tas', n: 'تكليفات المعلمات', e: '📌', c: '#5A6B7D', it: ['TAS'] },
  { k: 'lr', n: 'مصادر التعلم والتعليم الإلكتروني', e: '💻', c: '#1F5F99', it: ['LR', 'TLR'] },
  { k: 'as', n: 'التقييمات', e: '📝', c: '#1F5F99', it: ['AS'], org: 1 },
  { k: 'pl', n: 'التخطيط', e: '🗂️', c: '#3A5A7A', it: ['PL'], org: 1 },
  { k: 'ch', n: 'التحديات', e: '🧩', c: '#5A6B7D', it: ['CH'] },
];
const DL_TCOLS = ['act', 'pv', 'cv', 'pd', 'ra', 'en', 'pa', 'ach', 'mt', 'tas', 'lr', 'att'];
const dlN = s => String(s || '').replace(/[ً-ْـ\s«»"()\-–—:،.]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const dlKind = r => { const d = r.d || {}; if (r.item === 'TA') return d.kind || 'نشاط'; const t = String(d.ty || '');
  return /مبادر/.test(t) ? 'مبادرة' : /مسابق/.test(t) ? 'مسابقة' : /شراك/.test(t) ? 'شراكة مجتمعية' : /قيم/.test(t) ? 'قيمة' : /برنامج/.test(t) ? 'برنامج' : /مشروع/.test(t) ? 'مشروع' : 'نشاط'; };
/* صاحبة العمل في كل بند */
function dlWhos(r) {
  const d = r.d || {}; let L;
  switch (r.item) {
    case 'AC': L = [d.e1, d.e2, d.e3].concat(r._x || []); break;
    case 'PV': L = [d.v]; break;
    case 'WS': L = [d.pres]; break;
    case 'PA': case 'RA': L = [d.by]; break;
    case 'ACH': L = [d.sup]; break;
    case 'CH': L = [d.who]; break;
    case 'MT': L = [d.by]; break;
    case 'AS': case 'PL': L = []; break;
    default: L = [d.t];
  }
  return uniq(L.map(x => String(x || '').trim()).filter(Boolean));
}
const dlWhat = r => { const d = r.d || {};
  if (r.item === 'TDS') return [(d.abs || []).length ? `غياب ${(d.abs || []).length}` : '', (d.perm || []).length ? `استئذان ${(d.perm || []).length}` : ''].filter(Boolean).join('، ') || 'سجل الحضور';
  if (r.item === 'PRQ') return `${d.kind || 'إذن'} ${typeof prqNum === 'function' ? prqNum(d.h) : d.h} ساعة — ${d.reason || ''}`;
  if (r.item === 'SBA' || r.item === 'SBC') return `${d.cls || ''}${d.sub ? ' — ' + (d.type || 'احتياط') + ' أ. ' + d.sub : ''}${d.abs ? ' — بدلاً عن أ. ' + d.abs : ''}`;
  if (r.item === 'XCMP') return `${d.ex || ''} — ${d.c || ''} (${d.how || ''})`;
  if (r.item === 'TEX') return `${(d.role || []).join(' و') || 'حاضرة'} في «${d.name || ''}»${d.odept ? ' — ' + d.odept : ''}`;
  if (r.item === 'PV' || r.item === 'TPV') return `زارت أ. ${r.item === 'PV' ? d.t : d.v}`;
  if (['V', 'OV', 'VPV', 'PRV', 'LVV'].includes(r.item)) return [d.ty, d.kj, d.s].filter(Boolean).join(' — ') || 'زيارة صفية';
  const s = d.name || d.title || d.t1 || d.item || d.topic || d.det || d.c || d.b || d.e || d.ty || r.sum || '';
  return String(s).split(' — ').slice(0, 3).join(' — ').slice(0, 160);
};
const dlKey = r => { const d = r.d || {}; return r.item + '|' + dlN(d.name || d.title || d.item || d.t1 || d.c || d.b || d.e || d.ty) + '|' + dlN(d.t || d.v || d.by || d.sup || ''); };

/* تجهيز سجلات القسم: إزالة المكرر، وأوزان الاجتماعات، ومنفّذات النشاط المشترك */
function dlPrep(dept) {
  let R = S.records.filter(r => r.d && r.dept === dept && !r.d.q1).map(r => Object.assign({}, r));
  const detK = new Set(R.filter(r => !r.d.nd).map(dlKey));
  R = R.filter(r => !(r.d.nd && detK.has(dlKey(r))));
  const drop = new Set();
  const PV = R.filter(r => r.item === 'PV'), ACH = R.filter(r => r.item === 'ACH'), EX = R.filter(r => r.item === 'EX'), WS = R.filter(r => r.item === 'WS'), AC = R.filter(r => r.item === 'AC');
  R.forEach(r => { const d = r.d;
    if (r.item === 'TPV' && PV.some(p => p.date === r.date && dlN(p.d.v) === dlN(d.t) && dlN(p.d.t) === dlN(d.v))) drop.add(r.id);
    if (r.item === 'TACH' && ACH.some(a => dlN(a.d.name) && dlN(a.d.name) === dlN(d.name))) drop.add(r.id);
    if (r.item === 'TWS' && d.role === 'حضرتُ ورشة خارجية' && EX.some(e => dlN(e.d.name) === dlN(d.title) && dlN(e.d.t) === dlN(d.t))) drop.add(r.id);
    if (r.item === 'TWS' && d.role === 'قدّمتُ لتطوير الزملاء' && WS.some(w => [dlN(w.d.c), dlN(w.d.b)].includes(dlN(d.title)))) drop.add(r.id);
    if (r.item === 'TA') { const a = AC.find(x => dlN(x.d.name) && dlN(x.d.name) === dlN(d.name)); if (a) { drop.add(r.id); (a._x = a._x || []).push(d.t); } }
  });
  R = R.filter(r => !drop.has(r.id));
  const W = new Map(); R.forEach(r => W.set(r.id, r.item === 'MT' ? Math.max(1, +r.d.cnt || 1) : 1));
  R.filter(r => r.item === 'MT' && r.d.nd).forEach(r => { const det = R.filter(x => x.item === 'MT' && !x.d.nd && x.d.ty === r.d.ty).reduce((a, x) => a + W.get(x.id), 0); W.set(r.id, Math.max(0, W.get(r.id) - det)); });
  return { R, W };
}
function dlMonths() {   // أشهر العام الدراسي حتى الشهر الحالي
  const ps = (S.periods || []).slice().sort((a, b) => a.from.localeCompare(b.from)); const y = ps.length ? ps[0].from.slice(0, 4) : today().slice(0, 4);
  const L = []; let d = new Date(+y, 7, 1, 12); const end = today().slice(0, 7);
  while (L.length < 13) { const k = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); L.push(k); if (k >= end) break; d.setMonth(d.getMonth() + 1); }
  return L;
}
const dlMName = k => MONTHS[+k.slice(5, 7) - 1];

function C_dlog(el) {
  setTitle('سجل أعمال القسم');
  const dept = S.dept, all = dlMonths();
  let sel = (S.dlMs || []).filter(m => all.includes(m)); if (!sel.length) sel = [all[all.length - 1]]; S.dlMs = sel;
  const { R, W } = dlPrep(dept); const wt = r => W.get(r.id) ?? 1, sw = L => L.reduce((a, r) => a + wt(r), 0);
  const RM = R.filter(r => !r.d.nd && sel.includes(String(r.date).slice(0, 7)));
  const ND = R.filter(r => r.d.nd);
  const inC = (c, r) => c.it.includes(r.item) && (!c.f || c.f(r));
  const cats = DL_CATS.map(c => ({ ...c, L: RM.filter(r => inC(c, r)) })).map(c => ({ ...c, N: sw(c.L) }));
  const coord = (S.coords.find(c => c.dept.includes(dept)) || {}).name || '';
  const mem = uniq(S.staff.filter(s => s.dept === dept && s.name && s.name !== coord && s.role !== 'منسقة').map(s => s.name)).sort((a, b) => a.localeCompare(b, 'ar'));
  const cur = cats.find(c => c.k === S.dlCat) || null;
  const lbl = sel.length === 1 ? 'شهر ' + dlMName(sel[0]) : 'أشهر ' + sel.map(dlMName).join(' و');
  const subTxt = c => { const g = {}; c.L.forEach(r => { const k = c.sub ? c.sub(r) : ''; if (k) g[k] = (g[k] || 0) + wt(r); }); return Object.entries(g).map(([k, n]) => `${k} ${n}`).join(' · '); };
  el.innerHTML = `
  <div class="card"><h2 style="margin:0">سجل أعمال القسم — ${esc(dept)}</h2>
    <div class="note" style="margin-top:6px">مرجعكِ الكمي لكل ما سجّلته معلمات القسم وسجّلتِه في الميزان، وما يصل تلقائياً من سبع سنابل ومنصة انضباط. يُعدّ العمل الواحد مرة واحدة حتى لو سجّلته المعلمة وسجّلتِه أنتِ. اختاري شهراً أو أكثر.</div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px"><b style="font-size:13px">الأشهر:</b>
      ${all.map(m => `<button class="btn sm ${sel.includes(m) ? '' : 'sec'}" data-dm="${m}">${sel.includes(m) ? '✓ ' : ''}${dlMName(m)}</button>`).join('')}
      <span class="sp"></span><button class="btn sm sec noprint" onclick="window.print()">طباعة</button></div></div>

  <h3 class="dl-h">أولاً: الأعمال العامة للقسم — ${esc(lbl)}</h3>
  <div class="dl-grid">${cats.map(c => `<button type="button" class="dl-c ${cur && cur.k === c.k ? 'on' : ''} ${c.N ? '' : 'z'}" data-dc="${c.k}" style="--c:${c.c}">
    <span class="dl-e">${c.e}</span><b>${c.N}</b><span>${c.n}</span><small>${subTxt(c) || 'لم يُسجَّل'}</small></button>`).join('')}</div>

  <h3 class="dl-h">ثانياً: أعمال كل معلمة — ${esc(lbl)}</h3>
  ${dlTeachers(cats, mem, coord, wt)}
  ${cur ? dlDetail(cur, mem, coord, wt) : ''}
  ${ND.length && sel.some(m => m <= '2026-10' && m >= '2026-08') ? dlND(ND, wt) : ''}`;
  $$('[data-dm]', el).forEach(b => b.onclick = () => { const m = b.dataset.dm; let s = S.dlMs.slice(); s = s.includes(m) ? s.filter(x => x !== m) : s.concat(m); S.dlMs = s.length ? s.sort() : [m]; show(); });
  $$('[data-dc]', el).forEach(b => b.onclick = () => { S.dlCat = S.dlCat === b.dataset.dc ? '' : b.dataset.dc; show(); setTimeout(() => { const x = $('#dlDet'); if (x && S.dlCat) x.scrollIntoView({ behavior: 'smooth' }); }, 60); });
}
/* جدول المعلمات: كل معلمة وما سجّلته في كل بند (0 لما لم يُسجَّل) */
function dlTeachers(cats, mem, coord, wt) {
  const C = DL_TCOLS.map(k => cats.find(c => c.k === k));
  const ALL = REF.ALL_MEMBERS;
  const mtIn = () => true;   // اجتماعات القسم: تُحسب لكل معلمة لم تُسجَّل غائبة
  const val = (t, c) => {
    if (c.k === 'mt') return c.L.filter(r => mtIn(r) && ![r.d.a1, r.d.a2, r.d.a3].map(dlN).includes(dlN(t))).reduce((a, r) => a + wt(r), 0);
    return c.L.filter(r => { const w = dlWhos(r).map(dlN); return w.includes(dlN(t)) || w.includes(dlN(ALL)); }).reduce((a, r) => a + wt(r), 0);
  };
  const rows = mem.concat(coord ? [coord] : []);
  return `<div class="card"><div class="tbl"><table class="t dl-tt"><tr><th>المعلمة</th>${C.map(c => `<th title="${esc(c.n)}">${c.e}<br><span>${esc(c.k === 'mt' ? 'اجتماعات القسم (حضرتها)' : c.n)}</span></th>`).join('')}</tr>
    ${rows.map(t => `<tr${t === coord ? ' style="background:#FAF6EE"' : ''}><td style="white-space:nowrap"><b>${esc(t)}</b>${t === coord ? ' <small style="color:var(--muted)">(المنسقة)</small>' : ''}</td>${C.map(c => { const n = val(t, c); return `<td class="${n ? '' : 'z'}">${n}</td>`; }).join('')}</tr>`).join('')}</table></div>
    <div class="note" style="margin-top:6px">اجتماعات القسم: الاجتماعات الدورية للقسم التي لم تُسجَّل فيها المعلمة ضمن الغائبات (لا تدخل اجتماعات القيادة والتوجيه والمنسقين). الأعمال المسجّلة لـ«جميع أعضاء القسم» تُحسب لكل معلمة. اضغطي على أي بند في الأعلى لتفاصيله.</div></div>`;
}
function dlDetail(c, mem, coord, wt) {
  const L = c.L.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const col = r => (c.sub && c.sub(r)) || c.n;
  const sw = A => A.reduce((a, r) => a + wt(r), 0);
  const cols = uniq(L.map(col));
  const who = uniq([...(c.org ? [] : mem), ...L.flatMap(dlWhos)]).filter(Boolean);
  const cnt = (t, k) => sw(L.filter(r => dlWhos(r).includes(t) && col(r) === k));
  const rows = who.map(t => ({ t, n: sw(L.filter(r => dlWhos(r).includes(t))) })).sort((a, b) => (a.t === REF.ALL_MEMBERS) - (b.t === REF.ALL_MEMBERS) || b.n - a.n || a.t.localeCompare(b.t, 'ar'));
  const src = r => r.d.src === 'sab3' || /^S(EN|FB|AC|RF|AN)$/.test(r.item) ? 'سبع سنابل' : /^SB[AC]$/.test(r.item) ? 'انضباط' : /^(T[A-Z]+|PRQ|XCMP)$/.test(r.item) ? 'المعلمة' : /^(VPV|PRV|LVV)$/.test(r.item) ? 'القيادة' : 'المنسقة';
  return `<div class="card" id="dlDet" style="border-top:4px solid ${c.c}"><h2 style="margin:0 0 6px">${c.e} ${c.n} <span class="chip">${sw(L)}</span></h2>
    ${L.length ? `${rows.length ? `<div class="tbl"><table class="t"><tr><th>${c.org ? 'الجهة / المنفّذة' : 'المعلمة'}</th>${cols.map(k => `<th>${esc(k)}</th>`).join('')}<th>المجموع</th></tr>
      ${rows.map(x => `<tr><td><b>${esc(x.t)}</b></td>${cols.map(k => `<td>${cnt(x.t, k) || '—'}</td>`).join('')}<td><b>${x.n}</b></td></tr>`).join('')}
      <tr style="background:#FAF6EE"><td><b>عدد الأعمال</b></td>${cols.map(k => `<td><b>${sw(L.filter(r => col(r) === k))}</b></td>`).join('')}<td><b>${sw(L)}</b></td></tr></table></div>` : ''}
      <h3 style="margin:14px 0 6px;font-size:14px">تفاصيل الأعمال</h3>
      <div class="tbl"><table class="t"><tr><th>التاريخ</th><th>النوع</th><th>المعلمة / المنفّذة</th><th>العمل</th><th>المصدر</th></tr>
      ${L.map(r => `<tr><td style="white-space:nowrap">${dmy(String(r.date).slice(0, 10))}</td><td>${esc(col(r))}</td><td>${esc(dlWhos(r).join('، ') || '—')}</td><td style="font-size:12.5px">${esc(dlWhat(r))}${r.item === 'MT' && wt(r) > 1 ? ` <span class="chip" style="font-size:10.5px">${wt(r)} اجتماعات</span>` : ''}</td><td style="font-size:11.5px;color:var(--muted)">${src(r)}</td></tr>`).join('')}</table></div>`
    : '<div class="empty">لم يُسجَّل في هذا البند خلال الأشهر المختارة</div>'}</div>`;
}
/* سجلات منقولة من تقرير الربع الأول بلا تاريخ محدد */
function dlND(ND, wt) {
  const g = {}; ND.forEach(r => { const c = DL_CATS.find(x => x.it.includes(r.item) && (!x.f || x.f(r))); if (!c) return; (g[c.n] = g[c.n] || []).push(r); });
  const E = Object.entries(g).filter(([, L]) => L.reduce((a, r) => a + wt(r), 0));
  if (!E.length) return '';
  return `<div class="card"><h3 style="margin:0 0 6px;font-size:15px">سجلات منقولة من تقرير الربع الأول (بلا تاريخ محدد)</h3>
    <div class="note">هذه الأعمال وردت في تقرير الربع الأول دون تاريخ، فلا تُنسب إلى شهر بعينه ولا تدخل في أرقام الأشهر أعلاه. ما كان له سجل مؤرخ مماثل استُبعد منها حتى لا يُعدّ مرتين.</div>
    <div class="tbl" style="margin-top:8px"><table class="t"><tr><th>البند</th><th>العدد</th><th>الأعمال</th></tr>
    ${E.map(([n, L]) => `<tr><td><b>${esc(n)}</b></td><td>${L.reduce((a, r) => a + wt(r), 0)}</td><td style="font-size:12px">${L.filter(r => wt(r)).map(r => esc(dlWhat(r)) + (dlWhos(r).length ? ' (' + esc(dlWhos(r).join('، ')) + ')' : '')).join('؛ ')}</td></tr>`).join('')}</table></div></div>`;
}
