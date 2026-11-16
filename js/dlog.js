/* ================================================================== سجل أعمال القسم — مرجع كمي للمنسقة
   كل ما سجّلته المعلمات والمنسقة في الميزان وما يصل من سبع سنابل ومنصة انضباط، مصنّفاً حسب البنود؛ والتقرير الشهري يبقى للوصف */
const DL_CATS = [
  { k: 'ra', n: 'إجراءات رفع التحصيل', e: '📈', c: '#7A1F3D', it: { SEN: 'حصة إثرائية', SFB: 'تغذية راجعة وتقييم قصير', SAC: 'نشاط وتعلّم أقران', SRF: 'تعزيز الطالبات', SAN: 'تحليل النتائج', SCH: 'ميثاق الشراكة', RA: 'إجراء سجّلته المنسقة', XCMP: 'تعويض عن الخروج للأنشطة' } },
  { k: 'en', n: 'الحصص الإثرائية', e: '📚', c: '#946410', it: { SEN: 'حصة إثرائية' }, sub: r => r.d.whole ? 'جماعية' : 'فردية' },
  { k: 'as', n: 'التقييمات وتحليل النتائج', e: '📝', c: '#1F5F99', it: { AS: 'تقييم أو اختبار', SAN: 'تحليل النتائج' } },
  { k: 'pd', n: 'التطوير المهني', e: '🎓', c: '#0A6F6B', it: { WS: 'برنامج داخلي', EX: 'برنامج خارجي', TWS: 'ورشة (سجل المعلمة)' } },
  { k: 'vis', n: 'الزيارات الصفية', e: '👁️', c: '#5B3E8F', it: { V: 'حضور المنسقة', TPV: 'زيارة تبادلية', PV: 'زيارة تبادلية (سجل المنسقة)', VPV: 'حضور النائب الأكاديمي', PRV: 'حضور المديرة', LVV: 'حضور القيادة', OV: 'زيارة (سجل المنسقة)' } },
  { k: 'att', n: 'الحضور والغياب', e: '🕘', c: '#A3202F', it: { TDS: 'غياب واستئذان', PRQ: 'إذنٌ مُيسَّر', SBA: 'غياب عن حصة', SBC: 'احتياط وتبديل' } },
  { k: 'act', n: 'الأنشطة والمبادرات والمسابقات', e: '🎯', c: '#B8521A', it: { AC: 'سجل المنسقة', TA: 'سجل المعلمة' }, sub: r => dlKind(r) },
  { k: 'pa', n: 'التواصل مع أولياء الأمور', e: '🏡', c: '#17734A', it: { PA: 'سجل المنسقة', TPA: 'تواصل المعلمة' } },
  { k: 'ach', n: 'الإنجازات والمشاركات', e: '🏆', c: '#946410', it: { ACH: 'سجل المنسقة', TACH: 'إشراف المعلمة' } },
  { k: 'mt', n: 'الاجتماعات', e: '🗣️', c: '#3A5A7A', it: { MT: 'اجتماع' }, sub: r => String(r.d.ty || 'اجتماع').replace(/^اجتماع /, '') },
  { k: 'pl', n: 'التخطيط', e: '🗂️', c: '#3A5A7A', it: { PL: 'متابعة الخطط' } },
  { k: 'lr', n: 'مصادر التعلم والتعليم الإلكتروني', e: '💻', c: '#1F5F99', it: { LR: 'تفعيل' } },
  { k: 'tas', n: 'تكليفات المعلمات', e: '📌', c: '#5A6B7D', it: { TAS: 'تكليف' } },
  { k: 'ch', n: 'التحديات', e: '🧩', c: '#5A6B7D', it: { CH: 'تحدٍّ' } },
];
/* نوع النشاط: مبادرة · مسابقة · برنامج · مشروع · شراكة مجتمعية · قيمة · نشاط */
const dlKind = r => { const d = r.d || {}; if (r.item === 'TA') return d.kind || 'نشاط'; const t = String(d.ty || '');
  return /مبادر/.test(t) ? 'مبادرة' : /مسابق/.test(t) ? 'مسابقة' : /شراك/.test(t) ? 'شراكة مجتمعية' : /قيم/.test(t) ? 'قيمة' : /برنامج/.test(t) ? 'برنامج' : /مشروع/.test(t) ? 'مشروع' : 'نشاط'; };
/* المنفّذات: سجل المنسقة قد يذكر حتى ثلاث معلمات أو «جميع أعضاء القسم» */
const dlWhos = r => { const d = r.d || {}; if (r.item === 'AC') return uniq([d.e1, d.e2, d.e3].map(x => String(x || '').trim()).filter(Boolean)); const w = dlWho(r); return w ? [w] : []; };
const dlWho = r => { const d = r.d || {}; return d.t || d.e1 || d.pres || d.by || d.sup || d.v || ''; };
const dlWhat = r => { const d = r.d || {};
  if (r.item === 'TDS') return [(d.abs || []).length ? `غياب ${(d.abs || []).length}` : '', (d.perm || []).length ? `استئذان ${(d.perm || []).length}` : ''].filter(Boolean).join('، ') || 'سجل الحضور';
  if (r.item === 'PRQ') return `${d.kind || 'إذن'} ${prqNum ? prqNum(d.h) : d.h} ساعة — ${d.reason || ''}`;
  if (r.item === 'SBA' || r.item === 'SBC') return `${d.cls || ''}${d.sub ? ' — ' + (d.type || 'احتياط') + ' أ. ' + d.sub : ''}`;
  if (r.item === 'XCMP') return `${d.ex || ''} — ${d.c || ''} (${d.how || ''})`;
  const s = d.name || d.title || d.t1 || d.topic || d.item || d.det || d.c || d.ty || r.sum || '';
  return String(s).split(' — ').slice(0, 3).join(' — ').slice(0, 160);
};
function dlYear() { const ps = (S.periods || []).slice().sort((a, b) => a.from.localeCompare(b.from)); return { name: 'العام الدراسي', from: (ps.length && ps[0].from < (ps[0].from.slice(0, 4) + '-08-01') ? ps[0].from : (ps.length ? ps[0].from.slice(0, 4) : today().slice(0, 4)) + '-08-01'), to: today() }; }
/* سجل المعلمة المنقول من تقرير المنسقة (q1) نسخة من سجل المنسقة نفسه، فلا يُعدّ مرتين */
/* وزن السجل: سجل الاجتماع قد يمثّل عدة اجتماعات (cnt)، وسجل «منقول من تقرير الربع الأول» (nd، بلا تاريخ محدد)
   لا يُضاف منه إلا ما يزيد على الاجتماعات المسجّلة تفصيلياً من النوع نفسه قبله، حتى لا تُعدّ مرتين */
function dlWeights(R) {
  const W = new Map();
  R.forEach(r => { if (r.item === 'MT') W.set(r.id, Math.max(1, +r.d.cnt || 1)); else W.set(r.id, 1); });
  R.filter(r => r.item === 'MT' && r.d.nd).forEach(r => { const det = R.filter(x => x.item === 'MT' && !x.d.nd && x.d.ty === r.d.ty && String(x.date) <= String(r.date)).reduce((a, x) => a + W.get(x.id), 0);
    W.set(r.id, Math.max(0, W.get(r.id) - det)); });
  return W;
}
function dlRecs(dept, P) {
  return S.records.filter(r => r.d && r.dept === dept && inP(String(r.date).slice(0, 10), P) && !(r.item === 'TA' && r.d.q1));
}
function C_dlog(el) {
  setTitle('سجل أعمال القسم');
  const dept = S.dept, P_ = dlYear(), R = dlRecs(dept, P_);
  const mo = S.dlMo || '', RM = mo ? R.filter(r => !r.d.nd && String(r.date).slice(0, 7) === mo) : R;
  const months = uniq(R.filter(r => !r.d.nd).map(r => String(r.date).slice(0, 7))).sort();
  const nND = R.filter(r => r.d.nd).length; S.dlW = dlWeights(R); const wt = r => S.dlW.get(r.id) ?? 1, sumW = L => L.reduce((a, r) => a + wt(r), 0);
  const cats = DL_CATS.map(c => ({ ...c, L: RM.filter(r => c.it[r.item]), N: sumW(RM.filter(r => c.it[r.item])) }));
  const cur = cats.find(c => c.k === S.dlCat) || null;
  const coord = (S.coords.find(c => c.dept.includes(dept)) || {}).name;
  const mem = uniq(S.staff.filter(s => s.dept === dept).map(s => s.name));
  el.innerHTML = `
  <div class="card"><div class="row" style="flex-wrap:wrap;gap:8px"><div><h2 style="margin:0">سجل أعمال القسم — ${esc(dept)}</h2>
    <div class="note" style="margin-top:4px">مرجعكِ الكمي: كل ما سجّلته معلمات القسم وسجّلتِه في الميزان، وما يصل تلقائياً من سبع سنابل ومنصة انضباط، مصنّفاً حسب البنود. اضغطي على أي بند لعرض أعداده لكل معلمة وتفاصيل أعماله. أما الوصف فمكانه تقرير أعمال القسم.</div></div></div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px"><b style="font-size:13px">الفترة:</b>
      <button class="btn sm ${mo ? 'sec' : ''}" data-dm="">العام الدراسي كاملاً (حتى اليوم)</button>${months.map(m => `<button class="btn sm ${mo === m ? '' : 'sec'}" data-dm="${m}">${MONTHS[+m.slice(5, 7) - 1]}</button>`).join('')}
      <span class="sp"></span><span class="chip">${RM.length} سجلًا</span><button class="btn sm sec noprint" onclick="window.print()">طباعة</button></div></div>
  <div class="dl-grid">${cats.map(c => `<button type="button" class="dl-c ${cur && cur.k === c.k ? 'on' : ''} ${c.L.length ? '' : 'z'}" data-dc="${c.k}" style="--c:${c.c}">
    <span class="dl-e">${c.e}</span><b>${c.N}</b><span>${c.n}</span>
    <small>${Object.entries(c.it).map(([k, t]) => [t, sumW(c.L.filter(r => r.item === k))]).filter(x => x[1]).map(([t, n]) => `${t} ${n}`).join(' · ') || 'لم يُسجَّل بعد'}</small></button>`).join('')}</div>
  ${mo && nND ? `<div class="note" style="margin:-4px 0 12px">يُضاف إلى ذلك (${nND}) من سجلات «منقولة من تقرير الربع الأول» بلا تاريخ محدد، لا تُنسب إلى شهر بعينه؛ وتظهر عند اختيار «العام الدراسي كاملاً».</div>` : ''}
  ${cur ? dlDetail(cur, mem, coord) : '<div class="card"><div class="empty">اختاري بندًا لعرض تفاصيله 👆</div></div>'}`;
  $$('[data-dm]', el).forEach(b => b.onclick = () => { S.dlMo = b.dataset.dm; show(); });
  $$('[data-dc]', el).forEach(b => b.onclick = () => { S.dlCat = S.dlCat === b.dataset.dc ? '' : b.dataset.dc; show(); });
}
function dlDetail(c, mem, coord) {
  const L = c.L.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const col = r => c.sub && c.sub(r) ? c.sub(r) : c.it[r.item];
  const cols = uniq(L.map(col)); const who = uniq([...(['mt', 'pl', 'ch'].includes(c.k) ? [] : mem), ...L.flatMap(dlWhos)]).filter(Boolean);
  const wt = r => (S.dlW && S.dlW.get(r.id)) ?? 1, sw = A => A.reduce((a, r) => a + wt(r), 0);
  const cnt = (t, k) => sw(L.filter(r => dlWhos(r).includes(t) && col(r) === k));
  const rows = who.map(t => ({ t, n: sw(L.filter(r => dlWhos(r).includes(t))) })).sort((a, b) => (a.t === REF.ALL_MEMBERS) - (b.t === REF.ALL_MEMBERS) || b.n - a.n || a.t.localeCompare(b.t, 'ar'));
  const byOrg = ['mt', 'pl', 'ch'].includes(c.k);
  const zero = byOrg ? [] : L.some(r => dlWhos(r).includes(REF.ALL_MEMBERS)) ? [] : rows.filter(x => !x.n && x.t !== coord).map(x => x.t);
  return `<div class="card" style="border-top:4px solid ${c.c}"><h2 style="margin:0 0 6px">${c.e} ${c.n} <span class="chip">${sw(L)}</span></h2>
    ${L.length ? `<div class="tbl"><table class="t"><tr><th>${byOrg ? 'الجهة / المنفّذة' : 'المعلمة'}</th>${cols.map(k => `<th>${esc(k)}</th>`).join('')}<th>المجموع</th></tr>
      ${rows.filter(x => x.n).map(x => `<tr><td><b>${esc(x.t)}</b>${x.t === coord ? ' <small style="color:var(--muted)">(المنسقة)</small>' : ''}</td>${cols.map(k => { const n = cnt(x.t, k); return `<td>${n || '—'}</td>`; }).join('')}<td><b>${x.n}</b></td></tr>`).join('')}
      <tr style="background:#FAF6EE"><td><b>مجموع السجلات</b>${L.some(r => dlWhos(r).length > 1) ? '<div style="font-size:10.5px;color:var(--muted);font-weight:400">العمل المشترك يظهر لكل منفّذة، ويُعدّ هنا مرة واحدة</div>' : ''}</td>${cols.map(k => `<td><b>${sw(L.filter(r => col(r) === k))}</b></td>`).join('')}<td><b>${sw(L)}</b></td></tr></table></div>
      ${zero.length ? `<div class="note dl-zero">لم يُسجَّل لهن في هذا البند: ${zero.map(esc).join('، ')}</div>` : ''}
      <h3 style="margin:14px 0 6px;font-size:14px">تفاصيل الأعمال</h3>
      <div class="tbl"><table class="t"><tr><th>التاريخ</th><th>النوع</th><th>المعلمة</th><th>العمل</th><th>المصدر</th></tr>
      ${L.map(r => `<tr><td style="white-space:nowrap">${r.d.nd ? '<span style="font-size:11.5px;color:var(--muted)">الربع الأول<br>(بلا تاريخ)</span>' : dmy(String(r.date).slice(0, 10))}</td><td>${esc(col(r))}</td><td>${esc(dlWhos(r).join('، ') || '—')}</td><td style="font-size:12.5px">${esc(dlWhat(r))}${r.item === 'MT' && wt(r) !== 1 ? ` <span class="chip" style="font-size:10.5px">${wt(r) ? wt(r) + ' اجتماعات' : 'مُدرج تفصيلياً — لا يُعدّ مرتين'}</span>` : ''}</td><td style="font-size:11.5px;color:var(--muted)">${r.d.src === 'sab3' || /^S(EN|FB|AC|RF|AN|CH)$/.test(r.item) ? 'سبع سنابل' : /^SB[AC]$/.test(r.item) ? 'انضباط' : /^T|PRQ|XCMP/.test(r.item) ? 'المعلمة' : 'المنسقة'}</td></tr>`).join('')}</table></div>`
    : '<div class="empty">لم يُسجَّل في هذا البند خلال الفترة المختارة</div>'}</div>`;
}
