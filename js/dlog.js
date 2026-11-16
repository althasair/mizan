/* ================================================================== سجل أعمال القسم — مرجع كمي للمنسقة
   كل ما سجّلته المعلمات والمنسقة في الميزان وما يصل من سبع سنابل ومنصة انضباط، مصنّفاً حسب البنود؛ والتقرير الشهري يبقى للوصف */
const DL_CATS = [
  { k: 'ra', n: 'إجراءات رفع التحصيل', e: '📈', c: '#7A1F3D', it: { SEN: 'حصة إثرائية', SFB: 'تغذية راجعة وتقييم قصير', SAC: 'نشاط وتعلّم أقران', SRF: 'تعزيز الطالبات', SAN: 'تحليل النتائج', SCH: 'ميثاق الشراكة', RA: 'إجراء سجّلته المنسقة', XCMP: 'تعويض عن الخروج للأنشطة' } },
  { k: 'en', n: 'الحصص الإثرائية', e: '📚', c: '#946410', it: { SEN: 'حصة إثرائية' }, sub: r => r.d.whole ? 'جماعية' : 'فردية' },
  { k: 'as', n: 'التقييمات وتحليل النتائج', e: '📝', c: '#1F5F99', it: { AS: 'تقييم أو اختبار', SAN: 'تحليل النتائج' } },
  { k: 'pd', n: 'التطوير المهني', e: '🎓', c: '#0A6F6B', it: { WS: 'برنامج داخلي', EX: 'برنامج خارجي', TWS: 'ورشة (سجل المعلمة)' } },
  { k: 'vis', n: 'الزيارات الصفية', e: '👁️', c: '#5B3E8F', it: { V: 'حضور المنسقة', TPV: 'زيارة تبادلية', PV: 'زيارة تبادلية (سجل المنسقة)', VPV: 'حضور النائب الأكاديمي', PRV: 'حضور المديرة', LVV: 'حضور القيادة', OV: 'زيارة (سجل المنسقة)' } },
  { k: 'att', n: 'الحضور والغياب', e: '🕘', c: '#A3202F', it: { TDS: 'غياب واستئذان', PRQ: 'إذنٌ مُيسَّر', SBA: 'غياب عن حصة', SBC: 'احتياط وتبديل' } },
  { k: 'act', n: 'الأنشطة والمبادرات', e: '🎯', c: '#B8521A', it: { AC: 'نشاط القسم', TA: 'عمل المعلمة' }, sub: r => r.item === 'TA' ? (r.d.kind || 'نشاط') : '' },
  { k: 'pa', n: 'التواصل مع أولياء الأمور', e: '🏡', c: '#17734A', it: { PA: 'سجل المنسقة', TPA: 'تواصل المعلمة' } },
  { k: 'ach', n: 'الإنجازات والمشاركات', e: '🏆', c: '#946410', it: { ACH: 'سجل المنسقة', TACH: 'إشراف المعلمة' } },
  { k: 'mt', n: 'الاجتماعات', e: '🗣️', c: '#3A5A7A', it: { MT: 'اجتماع' } },
  { k: 'pl', n: 'التخطيط', e: '🗂️', c: '#3A5A7A', it: { PL: 'متابعة الخطط' } },
  { k: 'lr', n: 'مصادر التعلم والتعليم الإلكتروني', e: '💻', c: '#1F5F99', it: { LR: 'تفعيل' } },
  { k: 'tas', n: 'تكليفات المعلمات', e: '📌', c: '#5A6B7D', it: { TAS: 'تكليف' } },
  { k: 'ch', n: 'التحديات', e: '🧩', c: '#5A6B7D', it: { CH: 'تحدٍّ' } },
];
const dlWho = r => { const d = r.d || {}; return d.t || d.e1 || d.pres || d.by || d.sup || d.v || ''; };
const dlWhat = r => { const d = r.d || {};
  if (r.item === 'TDS') return [(d.abs || []).length ? `غياب ${(d.abs || []).length}` : '', (d.perm || []).length ? `استئذان ${(d.perm || []).length}` : ''].filter(Boolean).join('، ') || 'سجل الحضور';
  if (r.item === 'PRQ') return `${d.kind || 'إذن'} ${prqNum ? prqNum(d.h) : d.h} ساعة — ${d.reason || ''}`;
  if (r.item === 'SBA' || r.item === 'SBC') return `${d.cls || ''}${d.sub ? ' — ' + (d.type || 'احتياط') + ' أ. ' + d.sub : ''}`;
  if (r.item === 'XCMP') return `${d.ex || ''} — ${d.c || ''} (${d.how || ''})`;
  const s = d.name || d.title || d.topic || d.item || d.det || d.c || d.ty || r.sum || '';
  return String(s).split(' — ').slice(0, 3).join(' — ').slice(0, 160);
};
function dlRecs(dept, P) {
  return S.records.filter(r => r.d && r.dept === dept && inP(String(r.date).slice(0, 10), P) && !(r.item === 'TA' && r.d.q1));
}
function C_dlog(el) {
  setTitle('سجل أعمال القسم');
  const dept = S.dept, P_ = P(), R = dlRecs(dept, P_);
  const mo = S.dlMo || '', RM = mo ? R.filter(r => String(r.date).slice(0, 7) === mo) : R;
  const months = uniq(R.map(r => String(r.date).slice(0, 7))).sort();
  const cats = DL_CATS.map(c => ({ ...c, L: RM.filter(r => c.it[r.item]) }));
  const cur = cats.find(c => c.k === S.dlCat) || null;
  const coord = (S.coords.find(c => c.dept.includes(dept)) || {}).name;
  const mem = uniq(S.staff.filter(s => s.dept === dept).map(s => s.name));
  el.innerHTML = `
  <div class="card"><div class="row" style="flex-wrap:wrap;gap:8px"><div><h2 style="margin:0">سجل أعمال القسم — ${esc(dept)}</h2>
    <div class="note" style="margin-top:4px">مرجعكِ الكمي: كل ما سجّلته معلمات القسم وسجّلتِه في الميزان، وما يصل تلقائياً من سبع سنابل ومنصة انضباط، مصنّفاً حسب البنود. اضغطي على أي بند لعرض أعداده لكل معلمة وتفاصيل أعماله. أما الوصف فمكانه تقرير أعمال القسم.</div></div></div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px"><b style="font-size:13px">${esc(P_.name)}:</b>
      <button class="btn sm ${mo ? 'sec' : ''}" data-dm="">الفترة كاملة</button>${months.map(m => `<button class="btn sm ${mo === m ? '' : 'sec'}" data-dm="${m}">${MONTHS[+m.slice(5, 7) - 1]}</button>`).join('')}
      <span class="sp"></span><span class="chip">${RM.length} سجلًا</span><button class="btn sm sec noprint" onclick="window.print()">طباعة</button></div></div>
  <div class="dl-grid">${cats.map(c => `<button type="button" class="dl-c ${cur && cur.k === c.k ? 'on' : ''} ${c.L.length ? '' : 'z'}" data-dc="${c.k}" style="--c:${c.c}">
    <span class="dl-e">${c.e}</span><b>${c.L.length}</b><span>${c.n}</span>
    <small>${Object.entries(c.it).map(([k, t]) => [t, c.L.filter(r => r.item === k).length]).filter(x => x[1]).map(([t, n]) => `${t} ${n}`).join(' · ') || 'لم يُسجَّل بعد'}</small></button>`).join('')}</div>
  ${cur ? dlDetail(cur, mem, coord) : '<div class="card"><div class="empty">اختاري بندًا لعرض تفاصيله 👆</div></div>'}`;
  $$('[data-dm]', el).forEach(b => b.onclick = () => { S.dlMo = b.dataset.dm; show(); });
  $$('[data-dc]', el).forEach(b => b.onclick = () => { S.dlCat = S.dlCat === b.dataset.dc ? '' : b.dataset.dc; show(); });
}
function dlDetail(c, mem, coord) {
  const L = c.L.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const col = r => c.sub && c.sub(r) ? c.sub(r) : c.it[r.item];
  const cols = uniq(L.map(col)); const who = uniq([...mem, ...L.map(dlWho).filter(Boolean)]).filter(Boolean);
  const cnt = (t, k) => L.filter(r => dlWho(r) === t && col(r) === k).length;
  const rows = who.map(t => ({ t, n: L.filter(r => dlWho(r) === t).length })).sort((a, b) => b.n - a.n || a.t.localeCompare(b.t, 'ar'));
  const zero = rows.filter(x => !x.n && x.t !== coord).map(x => x.t);
  return `<div class="card" style="border-top:4px solid ${c.c}"><h2 style="margin:0 0 6px">${c.e} ${c.n} <span class="chip">${L.length}</span></h2>
    ${L.length ? `<div class="tbl"><table class="t"><tr><th>المعلمة</th>${cols.map(k => `<th>${esc(k)}</th>`).join('')}<th>المجموع</th></tr>
      ${rows.filter(x => x.n).map(x => `<tr><td><b>${esc(x.t)}</b>${x.t === coord ? ' <small style="color:var(--muted)">(المنسقة)</small>' : ''}</td>${cols.map(k => { const n = cnt(x.t, k); return `<td>${n || '—'}</td>`; }).join('')}<td><b>${x.n}</b></td></tr>`).join('')}
      <tr style="background:#FAF6EE"><td><b>المجموع</b></td>${cols.map(k => `<td><b>${L.filter(r => col(r) === k).length}</b></td>`).join('')}<td><b>${L.length}</b></td></tr></table></div>
      ${zero.length ? `<div class="note dl-zero">لم يُسجَّل لهن في هذا البند: ${zero.map(esc).join('، ')}</div>` : ''}
      <h3 style="margin:14px 0 6px;font-size:14px">تفاصيل الأعمال</h3>
      <div class="tbl"><table class="t"><tr><th>التاريخ</th><th>النوع</th><th>المعلمة</th><th>العمل</th><th>المصدر</th></tr>
      ${L.map(r => `<tr><td style="white-space:nowrap">${dmy(String(r.date).slice(0, 10))}</td><td>${esc(col(r))}</td><td style="white-space:nowrap">${esc(dlWho(r) || '—')}</td><td style="font-size:12.5px">${esc(dlWhat(r))}</td><td style="font-size:11.5px;color:var(--muted)">${r.d.src === 'sab3' || /^S(EN|FB|AC|RF|AN|CH)$/.test(r.item) ? 'سبع سنابل' : /^SB[AC]$/.test(r.item) ? 'انضباط' : /^T|PRQ|XCMP/.test(r.item) ? 'المعلمة' : 'المنسقة'}</td></tr>`).join('')}</table></div>`
    : '<div class="empty">لم يُسجَّل في هذا البند خلال الفترة المختارة</div>'}</div>`;
}
