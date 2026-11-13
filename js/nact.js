/* الميزان — ملف أخصائية الأنشطة المدرسية: ممارسة متميزة (السجل، الإحصائيات، مؤشرات الجولة الأولى للبرامج والأنشطة اللامنهجية) */
'use strict';

const NA_DEPT = 'البرامج والأنشطة';
ICON.act = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8z"/><path d="M8 21h8"/></svg>';
const isAct = () => S.user && S.user.role === 'coord' && (S.user.dept || []).includes(NA_DEPT);

/* أبواب الملف بنفس تنظيم مجلدات تيمز */
const NA_K = {
  plan: ['الخطة المعتمدة', 'التقارير والاستمارات والإنجازات', [2]],
  event: ['الفعاليات المدرسية', 'التقارير والاستمارات والإنجازات', [2]],
  vol: ['تحدي التطوع', 'التقارير والاستمارات والإنجازات', [2]],
  values: ['البرامج الإذاعية والقيم التربوية', 'التقارير والاستمارات والإنجازات', [2]],
  club: ['نادي مشارق للموهوبات', 'التقارير والاستمارات والإنجازات', [2]],
  day: ['الأيام العالمية والمناسبات المحلية', 'التقارير والاستمارات والإنجازات', [2]],
  nat: ['الهوية الوطنية', 'التقارير والاستمارات والإنجازات', [2]],
  exh: ['المعارض المدرسية', 'التقارير والاستمارات والإنجازات', [2]],
  res: ['أنشطة البحث العلمي', 'التقارير والاستمارات والإنجازات', [2]],
  ach: ['الإنجازات', 'التقارير والاستمارات والإنجازات', [2]],
  media: ['التوثيق والنشر الإعلامي', 'التقارير والاستمارات والإنجازات', [4]],
  stat: ['الإحصائيات والتقارير التحليلية', 'التقارير والاستمارات والإنجازات', [2]],
  trip: ['الرحلات المدرسية', 'الرحلات المدرسية', [3, 5]],
  exitl: ['كشوف خروج الطالبات من الحصص', 'الرحلات المدرسية', [5]],
  org: ['الشراكة مع المؤسسات', 'الشراكات المجتمعية', [2]],
  par: ['الشراكة مع أولياء الأمور', 'الشراكات المجتمعية', [2]],
};
const NA_COL = { 'التقارير والاستمارات والإنجازات': '#7A1F3D', 'الرحلات المدرسية': '#0A6F6B', 'الشراكات المجتمعية': '#946410' };
/* مؤشرات الدليل التفسيري لاستمارة الجولة الأولى 2026-2027 */
const NA_IND = [
  { n: 1, t: 'نشر وتفعيل سياسة البرامج والأنشطة والتقيد بالاستمارات المعتمدة', ck: [['pol_s', 'نشر السياسة للطالبات'], ['pol_p', 'نشر السياسة لأولياء الأمور'], ['pol_e', 'نشر السياسة للموظفات'], ['f_plan', 'استمارة الخطة الإجرائية السنوية'], ['f_rep', 'استمارة تقرير النشاط'], ['f_photo', 'استمارة موافقة ولي الأمر على التصوير'], ['f_trip', 'استمارات الرحلات المدرسية'], ['f_task', 'تكليف مهام التصوير']] },
  { n: 2, t: 'توفر خطة إجرائية سنوية معتمدة وتوثيق الأدلة والتقارير', ck: [['plan_ok', 'الخطة معتمدة من إدارة المدرسة ومسجلة في النظام'], ['plan_all', 'الخطة تشمل جميع الأنشطة المنفذة دون تكرار'], ['plan_upd', 'تحديث الخطة دورياً'], ['rep_ph', 'تقارير الأنشطة مرفقة بالصور']] },
  { n: 3, t: 'التقيد باشتراطات الأمن والصحة والسلامة', ck: [['safe_in', 'إجراءات السلامة مثبتة في تقارير الأنشطة'], ['safe_trip', 'استمارات الرحلات مكتملة قبل التنفيذ']] },
  { n: 4, t: 'نشر جميع أنشطة الخطة السنوية للبرامج والأنشطة', ck: [['pub_ch', 'تنوع وسائل النشر'], ['pub_all', 'نشر جميع أنشطة الخطة'], ['pub_rule', 'الالتزام بضوابط النشر المعتمدة']] },
  { n: 5, t: 'عدم الإخلال بساعات التدريس عند تنفيذ أنشطة الخطة', ck: [['exit', 'كشوف خروج الطالبات لكل نشاط ورحلة'], ['comp', 'حصر الحصص التعويضية للطالبات']] },
  { n: 6, t: 'الاستمرارية المهنية في تنفيذ البرامج والأنشطة', ck: [['meet', 'محاضر اجتماعات ومراسلات المتابعة'], ['circ', 'الاستجابة لتعاميم قسم البرامج والأنشطة'], ['sub', 'تسمية بديلة أو مكلفة معتمدة عند الحاجة']] },
];
const naRecs = () => S.records.filter(r => r.item === 'NAC' && r.d).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
const naCk = () => S.records.find(r => r.item === 'NCK') || null;
const NA_MO = { '08': 'أغسطس', '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر', '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل', '05': 'مايو', '06': 'يونيو' };
const naName = () => (S.coords.concat(S.actUser ? [S.actUser] : []).find(c => (c.dept || []).includes(NA_DEPT)) || {}).name || (isAct() ? S.user.name : 'نوف الخيارين');

function naStats(L) {
  const sum = (f) => L.reduce((a, r) => a + (+f(r) || 0), 0);
  const partners = new Set(L.filter(r => r.d.partner).map(r => r.d.partner.trim()));
  const trips = L.filter(r => r.d.k === 'trip');
  return {
    acts: L.filter(r => !['stat', 'media', 'plan', 'ach', 'exitl'].includes(r.d.k)).length,
    stu: sum(r => r.d.n), partners: partners.size, ach: L.filter(r => r.d.k === 'ach').length,
    intl: L.filter(r => r.d.k === 'ach' && /دولي/.test(r.d.level || '')).length,
    trips: trips.length, tripsOk: trips.filter(r => r.d.f_consent && r.d.f_pledge && r.d.f_list).length,
    par: L.filter(r => r.d.k === 'par').length, cert: L.filter(r => r.d.cert).length,
    vh: sum(r => r.d.vh), vol: sum(r => r.d.vn), pub: L.filter(r => r.d.pub).length,
  };
}
function naIndState(L) {
  const ck = (naCk() || { d: {} }).d.ck || {};
  const st = naStats(L);
  // ما يُستنتج تلقائياً من السجل
  const auto = { plan_ok: L.some(r => r.d.k === 'plan'), rep_ph: L.filter(r => r.d.rep).length >= 5, safe_trip: st.trips > 0 && st.tripsOk === st.trips, f_trip: st.trips > 0 && st.tripsOk === st.trips, pub_ch: L.filter(r => r.d.k === 'media').length >= 2, f_rep: L.filter(r => r.d.rep).length > 0, exit: L.some(r => r.d.k === 'exitl'), comp: L.some(r => r.d.k === 'exitl') && L.filter(r => r.d.k === 'exitl').every(r => r.d.comp) };
  return NA_IND.map(I => { const items = I.ck.map(([k, t]) => ({ k, t, on: !!(ck[k] || auto[k]), auto: !!auto[k] && !ck[k] })); const done = items.filter(x => x.on).length;
    return Object.assign({}, I, { items, done, pct: Math.round(done / items.length * 100) }); });
}

function N_act(el) {
  setTitle('ملف أخصائية الأنشطة المدرسية');
  const L = naRecs(), st = naStats(L), ind = naIndState(L);
  const tot = Math.round(ind.reduce((a, x) => a + x.pct, 0) / ind.length);
  const tab = S.naTab || 'home'; const tour = !!S.naTour;
  const LV = tour ? L.filter(r => r.d.k !== 'exitl' || r.d.comp) : L;
  const mo = {}; LV.forEach(r => { const m = String(r.date).slice(5, 7); (mo[m] = mo[m] || []).push(r); });
  const grp = {}; LV.forEach(r => { const g = (NA_K[r.d.k] || ['', 'أخرى'])[1]; (grp[g] = grp[g] || {}); (grp[g][r.d.k] = grp[g][r.d.k] || []).push(r); });
  const chip = (t, c) => `<span class="chip" style="font-size:11px;${c ? `background:${c}1A;color:${c}` : ''}">${t}</span>`;
  const row = r => { const d = r.d, K = NA_K[d.k] || ['—'];
    const T = !!S.naTour; const flags = [d.rep ? chip('تقرير ✓', '#17734A') : T ? '' : chip('بلا تقرير', '#A3202F'), d.cert ? chip('شهادة شكر', '#946410') : '', d.pub ? chip('منشور', '#1F5F99') : '',
      d.k === 'exitl' ? (d.comp ? chip('✓ عُوّضت الطالبات', '#17734A') : T ? '' : chip('✗ لم يُوثَّق التعويض', '#A3202F')) : '', d.k === 'trip' ? [['f_consent', 'موافقات'], ['f_pledge', 'تعهد مشرفة'], ['f_list', 'كشف الطالبات']].map(([k, t]) => d[k] ? chip('✓ ' + t, '#17734A') : T ? '' : chip('✗ ' + t, '#A3202F')).join(' ') : ''].join(' ');
    return `<tr><td style="white-space:nowrap">${dmy(r.date)}</td><td><b>${esc(d.title)}</b>${d.partner ? `<div style="font-size:12px;color:var(--muted)">بالشراكة مع: ${esc(d.partner)}</div>` : ''}${d.note ? `<div style="font-size:12px;color:var(--muted)">${esc(d.note)}</div>` : ''}</td>
      <td style="font-size:12px">${esc(K[0])}</td><td style="text-align:center">${d.n ? `<b>${d.n}</b>` : '—'}</td><td>${flags}</td>
      <td style="white-space:nowrap" class="noprint"><button class="btn sm sec" data-ne="${r.id}">تعديل</button> <button class="btn sm ghost" data-nx="${r.id}" style="color:#A33">🗑</button></td></tr>`; };
  const head = '<tr><th>التاريخ</th><th>النشاط</th><th>الباب</th><th>المستفيدات</th><th>الشواهد</th><th class="noprint"></th></tr>';
  el.innerHTML = `
  <div class="na-hero"><div><div class="na-k">ممارسة متميزة</div><h1>ملف البرامج والأنشطة اللامنهجية</h1><div class="na-n">أ. ${esc(naName())} · أخصائية الأنشطة المدرسية · العام الأكاديمي 2026–2027</div></div>
    <div class="na-v">﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾<small>المائدة 2</small></div></div>
  <div class="card"><div class="row" style="flex-wrap:wrap;gap:6px">
    ${[['home', '🌟 لوحتي'], ['ind', 'مؤشرات الجولة الأولى'], ['teams', 'حسب تنظيم تيمز'], ['month', 'السجل الشهري'], ['add', '+ إضافة نشاط']].map(([k, t]) => `<button class="btn ${tab === k ? '' : 'sec'} sm" data-nt="${k}">${t}</button>`).join('')}
    <span class="sp"></span><label class="na-tour noprint" title="يُخفي ما يحتاج إلى استكمال، ويُبقي المنجز فقط — مناسب للعرض أثناء الجولة"><input type="checkbox" id="naTour" ${tour ? 'checked' : ''}> وضع العرض في الجولة</label>
    <button class="btn sec sm noprint" onclick="window.print()">طباعة</button></div></div>
  <div id="naBody"></div>`;
  const B = $('#naBody', el);
  if (tab === 'home') { naHome(B, L, st, ind, tot, tour);
  } else if (tab === 'ind') {
    B.innerHTML = `<div class="card"><div class="row"><h2 style="margin:0">مدى الجاهزية للجولة الأولى</h2><span class="sp"></span><div class="na-bar" style="width:220px"><i style="width:${tot}%"></i></div><b style="margin-inline-start:8px">${tot}%</b></div>
      <div class="note" style="margin-top:6px">المؤشرات كما وردت في الدليل التفسيري لاستمارة الجولة الأولى للبرامج والأنشطة اللامنهجية 2026–2027. ما يُستدل عليه من السجل يُعلَّم تلقائياً، والباقي تؤشّر عليه الأخصائية عند توفر الشاهد في تيمز.</div></div>
      ${ind.map(I => `<div class="card na-ind"><div class="row"><span class="na-num">${I.n}</span><h3 style="margin:0;flex:1">${I.t}</h3><b style="color:${I.pct === 100 ? '#17734A' : I.pct >= 50 ? '#946410' : '#A3202F'}">${I.done} / ${I.items.length}</b></div>
        <div class="na-bar"><i style="width:${I.pct}%;background:${I.pct === 100 ? '#17734A' : I.pct >= 50 ? '#C99A2E' : '#A3202F'}"></i></div>
        <div class="na-ck">${I.items.map(x => `<label class="${x.on ? 'on' : ''}"><input type="checkbox" data-ck="${x.k}" ${x.on ? 'checked' : ''} ${x.auto ? 'disabled' : ''}> ${x.t}${x.auto ? ' <small>(من السجل)</small>' : ''}</label>`).join('')}</div>
        ${naIndNote(I.n, L, st)}${naLinked(I.n, LV)}</div>`).join('')}`;
    $$('[data-ck]', B).forEach(c => c.onchange = async () => {
      let r = naCk(); const d = r ? Object.assign({}, r.d) : { ck: {} }; d.ck = Object.assign({}, d.ck, { [c.dataset.ck]: c.checked });
      const rec = { id: r && r.id, dept: NA_DEPT, item: 'NCK', date: '2026-08-23', sum: 'مؤشرات الجولة الأولى', d };
      const j = await call('save', { rec }); const nr = j.record || Object.assign({}, rec, { id: j.id });
      S.records = S.records.filter(x => x.item !== 'NCK').concat([nr]); show();
    });
  } else if (tab === 'teams') {
    B.innerHTML = Object.keys(NA_COL).map(g => `<div class="card"><h2 style="color:${NA_COL[g]}">${g}</h2>
      ${Object.keys(NA_K).filter(k => NA_K[k][1] === g).map(k => { const A = (grp[g] || {})[k] || [];
        return `<details ${A.length ? '' : ''} class="na-det"><summary><b>${NA_K[k][0]}</b> <span class="chip" style="font-size:11px">${A.length}</span>${A.length || tour ? '' : ' <span class="na-need">بحاجة إلى إضافة</span>'}</summary>
          ${A.length ? `<div class="tbl"><table class="t">${head}${A.map(row).join('')}</table></div>` : ''}</details>`; }).join('')}</div>`).join('');
  } else if (tab === 'month') {
    B.innerHTML = Object.keys(mo).sort((a, b) => (a < '08' ? +a + 12 : +a) - (b < '08' ? +b + 12 : +b)).map(m => { const A = mo[m], s = naStats(A);
      return `<div class="card"><div class="row"><h2 style="margin:0">${NA_MO[m] || m}</h2><span class="sp"></span><span class="chip">${A.length} سجلاً</span> <span class="chip">${s.stu} مستفيدة</span> <span class="chip">${s.partners} جهة</span></div>
        <div class="tbl" style="margin-top:8px"><table class="t">${head}${A.map(row).join('')}</table></div></div>`; }).join('') || '<div class="card"><div class="empty">لا توجد سجلات بعد</div></div>';
  } else {
    naForm(B, S.naEdit ? L.find(r => r.id === S.naEdit) : null);
  }
  $$('[data-nt]', el).forEach(b => b.onclick = () => { S.naTab = b.dataset.nt; S.naEdit = null; show(); });
  const tg = $('#naTour', el); if (tg) tg.onchange = () => { S.naTour = tg.checked; show(); };
  if (tab === 'home') naWelcomeOnce(L, st);
  $$('[data-ne]', el).forEach(b => b.onclick = () => { S.naTab = 'add'; S.naEdit = b.dataset.ne; show(); window.scrollTo(0, 0); });
  $$('[data-nx]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذا السجل؟ (يبقى محفوظاً في ورقة المحذوفات)')) return; await call('delete', { id: b.dataset.nx }); S.records = S.records.filter(x => x.id !== b.dataset.nx); toast('تم الحذف'); show(); });
}

/* ما يُكتب تحت كل مؤشر من واقع السجل */
function naIndNote(n, L, st) {
  const c = k => L.filter(r => r.d.k === k).length;
  const t = {
    1: `يتوفر في السجل ${L.filter(r => r.d.rep).length} تقريراً على استمارة تقرير النشاط، وخطة معتمدة من النظام.`,
    2: `نُفّذ ${st.acts} نشاطاً وبرنامجاً موثقاً، منها: الأيام العالمية والمناسبات (${c('day')})، والهوية الوطنية (${c('nat')})، والقيم التربوية والإذاعة (${c('values') + c('club')})، والفعاليات المدرسية (${c('event') + c('vol')}).`,
    3: st.trips ? `نُفّذت ${st.trips} رحلة مدرسية، اكتملت استماراتها (الموافقات والتعهد والكشف) في ${st.tripsOk} منها.` : 'لم تُسجَّل رحلات بعد.',
    4: `تتوفر ${c('media')} شواهد لقنوات النشر، و${st.pub} نشاطاً موسوماً بأنه منشور.`,
    5: (() => { const E = L.filter(r => r.d.k === 'exitl'), C = E.filter(r => r.d.comp); return E.length ? `وُثّق خروج الطالبات من الحصص في ${E.length} مناسبة (${E.reduce((a, r) => a + (+r.d.n || 0), 0)} طالبة على الأقل) بموافقة النائبة الإدارية، وتم تعويض الطالبات في ${C.length} منها؛ ويُستكمل بربط كل خروج بحصة تعويضية لدى القسم المعني.` : 'يُستكمل بربط كشوف خروج الطالبات للأنشطة والرحلات بسجل الحصص التعويضية لدى الأقسام.'; })(),
    6: `يتضمن السجل ${st.partners} جهة شريكة و${st.cert} شهادة شكر، ويُستكمل بمحاضر الاجتماعات وتسمية البديلة.`,
  };
  return `<div class="na-note">${t[n]}</div>`;
}

function naForm(B, rec) {
  const d = rec ? rec.d : { k: S.naK || 'event' };
  const ks = Object.keys(NA_K);
  B.innerHTML = `<div class="card"><h2>${rec ? 'تعديل سجل' : 'إضافة نشاط إلى الملف'}</h2>
    <div class="note" style="margin-bottom:10px">سجّلي النشاط مرة واحدة هنا، وارفعي شواهده في المجلد المقابل في تيمز؛ فيظهر في الإحصائيات وفي المؤشر المرتبط به تلقائياً.</div>
    <form class="form" id="naf" onsubmit="return false">
      <div class="fld"><label>الباب</label><select data-n="k">${ks.map(k => `<option value="${k}" ${d.k === k ? 'selected' : ''}>${NA_K[k][0]} — ${NA_K[k][1]}</option>`).join('')}</select></div>
      <div class="fld"><label>التاريخ</label><input type="date" data-n="date" value="${esc(rec ? rec.date : today())}"></div>
      <div class="fld" style="grid-column:1/-1"><label>عنوان النشاط</label><input data-n="title" value="${esc(d.title || '')}" placeholder="مثال: فعالية اليوم الوطني"></div>
      <div class="fld"><label>عدد المستفيدات</label><input type="number" min="0" data-n="n" value="${esc(d.n || '')}"></div>
      <div class="fld"><label>الجهة الشريكة (إن وجدت)</label><input data-n="partner" value="${esc(d.partner || '')}"></div>
      <div class="fld"><label>القسم المنفذ</label><input data-n="by" value="${esc(d.by || '')}" placeholder="قسم الأنشطة / قسم العلوم …"></div>
      <div class="fld"><label>مستوى الإنجاز (للإنجازات)</label><select data-n="level"><option value="">—</option>${['إنجاز دولي', 'إنجاز محلي', 'إنجاز على مستوى المدرسة'].map(x => `<option ${d.level === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="fld"><label>عدد المتطوعات (لتحدي التطوع)</label><input type="number" min="0" data-n="vn" value="${esc(d.vn || '')}"></div>
      <div class="fld"><label>ساعات التطوع</label><input type="number" min="0" data-n="vh" value="${esc(d.vh || '')}"></div>
      <div class="fld" style="grid-column:1/-1"><label>الشواهد المتوفرة</label><div class="na-ck">
        ${[['rep', 'تقرير النشاط'], ['cert', 'شهادة شكر وتقدير'], ['pub', 'نُشر في قنوات المدرسة'], ['f_consent', 'موافقات أولياء الأمور (للرحلات)'], ['f_pledge', 'تعهد المشرفة (للرحلات)'], ['f_list', 'كشف الطالبات (للرحلات)'], ['exit', 'كشف خروج الطالبات من الحصص'], ['comp', 'تم تعويض الطالبات عن الحصص الفائتة']]
          .map(([k, t]) => `<label><input type="checkbox" data-c="${k}" ${d[k] ? 'checked' : ''}> ${t}</label>`).join('')}</div></div>
      <div class="fld" style="grid-column:1/-1"><label>ملاحظة / أثر النشاط</label><input data-n="note" value="${esc(d.note || '')}"></div>
      <div class="actions" style="grid-column:1/-1"><button class="btn" id="naS">حفظ</button>${rec ? '<button class="btn sec" type="button" id="naC">إلغاء</button>' : ''}</div>
    </form></div>`;
  if ($('#naC')) $('#naC').onclick = () => { S.naEdit = null; S.naTab = 'teams'; show(); };
  $('#naS').onclick = async () => {
    const f = $('#naf'), v = readForm(f); if (!String(v.title || '').trim()) return toast('اكتبي عنوان النشاط', 1); if (!v.date) return toast('حدّدي التاريخ', 1);
    const nd = Object.assign({}, rec ? rec.d : {}, { k: v.k, title: v.title.trim(), n: +v.n || 0, partner: (v.partner || '').trim(), by: (v.by || '').trim(), level: v.level || '', vn: +v.vn || 0, vh: +v.vh || 0, note: (v.note || '').trim(), t: naName() });
    $$('[data-c]', f).forEach(c => nd[c.dataset.c] = c.checked);
    const r = { id: rec && rec.id, dept: NA_DEPT, item: 'NAC', date: v.date, sum: (NA_K[v.k] || [''])[0] + ' — ' + nd.title, d: nd };
    const j = await call('save', { rec: r }); const nr = j.record || Object.assign({}, r, { id: j.id });
    S.records = S.records.filter(x => x.id !== nr.id).concat([nr]); S.naK = v.k; S.naEdit = null; S.naTab = 'month';
    toast('تم الحفظ ✓'); show(); if (!rec) naCelebrate(nr, naRecs());
  };
}

/* ================================================================== لوحتي: لوحة تفاعلية خاصة بأخصائية الأنشطة */
const NA_EMO = { plan: '🗂️', event: '🎉', vol: '🌱', values: '🎙️', club: '✨', day: '🌍', nat: '🇶🇦', exh: '📚', res: '🔬', ach: '🏆', media: '📣', stat: '📊', trip: '🚌', exitl: '⏱️', org: '🤝', par: '🏡' };
/* عبارات ثناء لكل باب، تُختار ثابتة لكل نشاط حتى لا تتبدل عند كل تحديث */
const NA_PR = {
  event: ['فعاليةٌ أضاءت أروقة المدرسة', 'بهجةٌ صنعتِها بإتقان'], vol: ['عطاءٌ يمتد أثره خارج الأسوار', 'غرسٌ طيّب يثمر في القلوب'],
  values: ['قيمةٌ تُغرس كل صباح', 'صوتٌ تربويّ يصنع الفرق'], club: ['نادٍ ينبض بالقيم', 'لمسةٌ تربوية تشرق أثرًا'],
  day: ['مناسبةٌ عالمية بروحٍ قطرية', 'حضورٌ واعٍ في المناسبات'], nat: ['انتماءٌ يُزهر في نفوس الطالبات', 'هويةٌ وطنية تُصان وتُعتز بها'],
  exh: ['معرفةٌ تُعرض بشغف'], res: ['بحثٌ يصنع عالمات المستقبل'], ach: ['إنجازٌ يرفع اسم الشيماء', 'فخرٌ للمدرسة وللوطن'],
  media: ['صوت الشيماء يصل للجميع'], stat: ['رقمٌ يُحكى به الأثر'], trip: ['رحلةٌ تفتح للطالبات آفاقًا', 'تعلّمٌ خارج الجدران'],
  exitl: ['وقتٌ تعليميّ مصون'], org: ['شراكةٌ تثري الطالبات', 'جسرٌ مع المجتمع'], par: ['أسرةٌ شريكةٌ في التعلم', 'بيتٌ ومدرسة يدًا بيد'], plan: ['خطةٌ واضحة تقود العمل'],
};
const naHash = x => [...String(x)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const naPraise = r => { const A = NA_PR[r.d.k] || ['عملٌ متقن']; return A[naHash(r.id || r.d.title) % A.length]; };
const NA_DAILY = ['الأثر الجميل لا يُنسى، وأنتِ تصنعينه كل يوم', 'كل نشاطٍ توثقينه شاهدٌ على عطائكِ', 'خلف كل فعاليةٍ ناجحة أخصائيةٌ مخلصة', 'ما تزرعينه اليوم تحصده الطالبات غدًا', 'أنتِ روح المدرسة النابضة بالحياة', 'إتقانكِ يُرى في تفاصيل كل نشاط', 'العطاء الهادئ أبلغ أثرًا'];

function naBadges(L, st) {
  const c = k => L.filter(r => r.d.k === k).length, rep = L.filter(r => r.d.rep).length;
  const E = L.filter(r => r.d.k === 'exitl');
  return [
    ['🇶🇦', 'سفيرة الهوية الوطنية', c('nat'), 5, 'فعاليات للهوية الوطنية'],
    ['🤝', 'صانعة الشراكات', c('org'), 10, 'شراكات مع المؤسسات'],
    ['✨', 'حارسة القيم', c('values') + c('club'), 10, 'برامج إذاعية وأنشطة قيمية'],
    ['🌍', 'نجمة المناسبات', c('day'), 5, 'أيام عالمية ومناسبات'],
    ['🏆', 'صانعة الإنجاز', c('ach'), 5, 'إنجازات للطالبات'],
    ['🚌', 'رحّالة المعرفة', c('trip'), 5, 'رحلات مدرسية'],
    ['🏡', 'جسر الأسرة', c('par'), 5, 'شراكات مع أولياء الأمور'],
    ['🌱', 'رائدة التطوع', c('vol'), 3, 'مبادرات تطوعية'],
    ['📣', 'صوت الشيماء', c('media'), 3, 'قنوات نشر موثقة'],
    ['📑', 'موثِّقة متقنة', rep, Math.max(10, Math.ceil(L.length * .9)), 'نشاطًا بتقرير موثق'],
    ['⏱️', 'حارسة الوقت التعليمي', E.filter(r => r.d.comp).length, Math.max(1, E.length), 'خروجًا عُوّضت فيه الطالبات'],
    ['💯', 'المئوية', L.length, 100, 'سجلًا في الملف'],
  ].map(([e, t, v, goal, u]) => ({ e, t, v, goal, u, on: v >= goal }));
}
/* ما يحتاج إلى إضافة: يُستخرج من السجل نفسه */
function naNeeds(L, ind) {
  const N = [], c = k => L.filter(r => r.d.k === k).length;
  Object.keys(NA_K).forEach(k => { if (!c(k) && !['exitl'].includes(k)) N.push(['📂', `باب «${NA_K[k][0]}»`, 'لا توجد له شواهد بعد في الملف']); });
  L.filter(r => /يحتاج|تحتاج|يُستكمل|دون تقرير/.test(r.d.note || '')).forEach(r => N.push([NA_EMO[r.d.k] || '•', r.d.title, r.d.note]));
  const noRep = L.filter(r => !r.d.rep && !['exitl', 'media', 'plan', 'stat'].includes(r.d.k) && !/دون تقرير/.test(r.d.note || ''));
  if (noRep.length) N.push(['📝', `تقرير النشاط لـ${noRep.length} ${noRep.length > 10 ? 'نشاطًا' : 'أنشطة'}`, noRep.slice(0, 4).map(r => r.d.title).join('، ') + (noRep.length > 4 ? '…' : '')]);
  const tr = L.filter(r => r.d.k === 'trip' && !(r.d.f_consent && r.d.f_pledge && r.d.f_list));
  if (tr.length) N.push(['🚌', `استمارات ${tr.length} ${tr.length > 2 ? 'رحلات' : 'رحلة'}`, 'موافقات أولياء الأمور، وتعهد المشرفة، وكشف الطالبات']);
  const ex = L.filter(r => r.d.k === 'exitl' && !r.d.comp);
  if (ex.length) N.push(['⏱️', `تعويض الطالبات في ${ex.length} ${ex.length > 2 ? 'مناسبات' : 'مناسبة'} خروج`, 'التنسيق مع الأقسام لتوثيق الحصص التعويضية']);
  ind.forEach(I => { const M = I.items.filter(x => !x.on); if (M.length) N.push(['☑️', `المؤشر ${I.n}: ${I.t}`, M.map(x => x.t).join('، ')]); });
  return N;
}
function naRing(p, sz, col, lbl) {
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 36 36" class="na-ring" aria-hidden="true"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#EFE7DA" stroke-width="3.2"/>
    <circle cx="18" cy="18" r="15.9" fill="none" stroke="${col}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="${p} 100" pathLength="100" transform="rotate(-90 18 18)" style="--p:${p}"/>
    <text x="18" y="${lbl ? 19 : 21}" text-anchor="middle" font-size="${lbl ? 8.5 : 9}" font-weight="800" fill="${col}">${p}%</text>${lbl ? `<text x="18" y="25.5" text-anchor="middle" font-size="3.6" fill="#8A8F98">${lbl}</text>` : ''}</svg>`;
}

function naHome(B, L, st, ind, tot, tour) {
  const nm = naName(), first = nm.split(' ')[0], me = isAct();
  const h = new Date().getHours(), greet = h < 12 ? 'صباحُ الخيرِ والإنجاز' : 'مساءُ الخيرِ والعطاء';
  const daily = NA_DAILY[new Date().getDate() % NA_DAILY.length];
  const bd = naBadges(L, st), earned = bd.filter(b => b.on), needs = naNeeds(L, ind);
  const MO = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06'].map(m => [m, L.filter(r => String(r.date).slice(5, 7) === m).length]).filter(([m, n], i, A) => n || A.slice(i).some(x => x[1]));
  const mx = Math.max(1, ...MO.map(x => x[1]));
  const recent = L.filter(r => !['stat', 'plan', 'exitl', 'media'].includes(r.d.k)).slice(-8).reverse();
  const kpi = [[st.acts, 'نشاطًا وبرنامجًا', '🎯', '#7A1F3D'], [st.stu, 'مشاركة طالبات', '👭', '#0A6F6B'], [L.filter(r => r.d.k === 'org').length, 'شراكة مع المؤسسات', '🤝', '#946410'], [st.ach, 'إنجازًا للطالبات', '🏆', '#1F5F99'],
    [st.trips, 'رحلة مدرسية', '🚌', '#0A6F6B'], [st.par, 'شراكة مع أولياء الأمور', '🏡', '#946410'], [st.cert, 'شهادة شكر وتقدير', '📜', '#7A1F3D'], [st.vh, 'ساعة تطوع', '🌱', '#17734A']];
  B.innerHTML = `
  <div class="card na-wel ta-cheer">
    <div class="na-wel-s">${'✦ '.repeat(3)}</div>
    <h3>${greet}، أ. ${esc(first)} 🌸</h3>
    <div class="na-wel-t">أخصائية الأنشطة المميزة</div>
    <p>هذه المساحة خاصةٌ بكِ وحدكِ؛ صُمّمت لتحفظ أثركِ وتُريكِ ثمرة جهدكِ في كل فعاليةٍ ورحلةٍ وشراكة. ${st.acts} نشاطًا موثقًا، و${st.stu} مشاركةً للطالبات، و${earned.length} وسامًا من أوسمة التميز؛ وما هذا إلا ثمرة همّةٍ عالية جعلت الإتقان عنوانكِ. ﴿إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا﴾</p>
    <div class="na-wel-d">«${daily}»</div>${vpSignLine()}</div>

  <div class="grid g4 na-kpi">${kpi.map(([n, t, e, c], i) => `<div class="card na-t na-pop" style="--c:${c};animation-delay:${i * 70}ms"><span class="na-e">${e}</span><b data-cnt="${+n || 0}">0</b><span>${t}</span></div>`).join('')}</div>

  <div class="na-two">
    ${tour ? '' : `<div class="card na-rd"><h2>جاهزيتكِ للجولة الأولى</h2>
      <div class="na-rd-in">${naRing(tot, 150, tot >= 80 ? '#17734A' : tot >= 50 ? '#B8892E' : '#7A1F3D')}
        <div class="na-rd-g">${ind.map(I => `<div title="${esc(I.t)}">${naRing(I.pct, 62, I.pct === 100 ? '#17734A' : I.pct >= 50 ? '#B8892E' : '#A3202F', 'المؤشر ' + I.n)}</div>`).join('')}</div></div>
      <div class="note" style="margin-top:8px">${tot >= 80 ? 'جاهزيةٌ عالية — أحسنتِ!' : 'كل شاهدٍ تضيفينه يرفع النسبة مباشرة.'} اضغطي على «مؤشرات الجولة الأولى» لتفاصيل كل مؤشر.</div></div>`}
    <div class="card"><h2>نبض الأشهر</h2>
      <div class="na-mo">${MO.map(([m, n]) => `<div><i style="--h:${Math.round(n / mx * 100)}%"><b>${n}</b></i><span>${NA_MO[m]}</span></div>`).join('')}</div>
      <div class="note">عدد الأعمال المسجلة في ملفكِ كل شهر.</div></div>
  </div>

  <div class="card"><div class="row"><h2 style="margin:0">أوسمتكِ</h2><span class="sp"></span><span class="chip" style="background:#FFF3D6;color:#7A5A12">${earned.length} من ${bd.length}</span></div>
    <div class="na-bdg">${bd.filter(b => b.on || !tour).map(b => `<div class="${b.on ? 'on' : ''}" title="${esc(b.t)}"><span>${b.e}</span><b>${b.t}</b><small>${b.on ? `${b.v} ${b.u} ✓` : `${b.v} من ${b.goal} · بقي ${b.goal - b.v}`}</small>${b.on ? '' : `<i style="--w:${Math.round(b.v / b.goal * 100)}%"></i>`}</div>`).join('')}</div></div>

  <div class="card"><h2>آخر أعمالكِ</h2><div class="na-tl">${recent.map(r => `<div><span class="na-e">${NA_EMO[r.d.k] || '•'}</span><div><b>${esc(r.d.title)}</b><small>${dmy(r.date)} · ${esc((NA_K[r.d.k] || [''])[0])}${r.d.n ? ` · ${r.d.n} طالبة` : ''}</small></div><em>${naPraise(r)} <span>★</span></em></div>`).join('') || '<div class="empty">ابدئي بإضافة أول نشاط ✨</div>'}</div></div>

  ${tour ? '' : `<div class="card na-needs"><div class="row"><h2 style="margin:0">لمساتٌ تُكمل تميّزكِ</h2><span class="sp"></span><span class="chip">${needs.length}</span></div>
    <div class="note" style="margin:6px 0 8px">أشياء معيّنة بحاجة إلى إضافة؛ كل لمسة منها ترفع جاهزيتكِ وتُضيء وسامًا جديدًا. عند الإضافة سجّليها من «+ إضافة نشاط» أو أشّري عليها في «مؤشرات الجولة الأولى».</div>
    ${needs.length ? `<div class="na-nd">${needs.map(([e, t, d]) => `<div><span>${e}</span><div><b>${esc(t)}</b><small>${esc(d || '')}</small></div><em>بحاجة إلى إضافة</em></div>`).join('')}</div>` : '<div class="empty">ملفكِ مكتمل — ما شاء الله تبارك الله 🌸</div>'}</div>`}`;
  fillVps(B);
  // عدّاد متحرك للأرقام
  $$('[data-cnt]', B).forEach(x => { const n = +x.dataset.cnt, t0 = performance.now(), D = 900 + Math.min(n, 600);
    (function f(t) { const k = Math.min(1, (t - t0) / D); x.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); });
}

/* الشواهد المرتبطة بكل مؤشر */
function naLinked(n, L) {
  const M = { 1: r => ['plan', 'trip'].includes(r.d.k) || r.d.rep && r.d.k === 'stat', 2: r => !['media', 'exitl'].includes(r.d.k), 3: r => r.d.k === 'trip', 4: r => r.d.k === 'media' || r.d.pub, 5: r => ['exitl', 'trip'].includes(r.d.k), 6: r => ['org', 'ach', 'stat'].includes(r.d.k) || r.d.cert };
  const A = L.filter(M[n] || (() => false)); if (!A.length) return '';
  return `<details class="na-det na-lk"><summary>الشواهد المرتبطة بهذا المؤشر <span class="chip" style="font-size:11px">${A.length}</span></summary>
    <div class="na-lkl">${A.map(r => `<span>${NA_EMO[r.d.k] || '•'} ${esc(r.d.title)} <small>${dmy(r.date)}</small></span>`).join('')}</div></details>`;
}

/* احتفال عند الدخول مرة كل يوم، وعند كل إضافة */
function naWelcomeOnce(L, st) {
  if (!isAct()) return; let k = 'mz_na_' + today(); try { if (localStorage.getItem(k)) return; localStorage.setItem(k, 1); } catch (e) { if (S.naWel) return; S.naWel = 1; }
  setTimeout(() => { confetti(2600); chime(); }, 400);
}
function naCelebrate(r, L) {
  const n = L.length, c = L.filter(x => x.d.k === r.d.k).length, big = n % 10 === 0 || c === 5 || c === 10;
  const before = naBadges(L.filter(x => x.id !== r.id), {}), after = naBadges(L, {}), nb = after.find((b, i) => b.on && !before[i].on);
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box" style="max-width:540px"><div class="card ta-cheer" style="background:linear-gradient(135deg,#FFF6DD,#FFFDF6);border:1px solid #E9D3A8;border-inline-start:5px solid var(--gold);text-align:center">
    <div style="font-size:48px;line-height:1">${nb ? nb.e : NA_EMO[r.d.k] || '🌟'}</div><div style="font-size:22px;color:var(--gold);letter-spacing:5px;margin:4px 0">★★★</div>
    <h3 style="margin:2px 0 6px;color:var(--maroon)">${nb ? `وسامٌ جديد: ${nb.t}` : naPraise(r)}</h3>
    <p style="margin:0;text-align:justify">أ. ${esc(naName().split(' ')[0])}، أُضيف «${esc(r.d.title)}» إلى ملفكِ، فصار في باب «${esc((NA_K[r.d.k] || [''])[0])}» ${c} ${c > 2 && c < 11 ? 'أعمال' : 'عملًا'}، وفي الملف كله ${n} عملًا. جهدٌ مباركٌ وأثرٌ يُرى، زادكِ الله توفيقًا.</p>${vpSignLine()}</div>
    <div class="row" style="margin-top:10px;justify-content:center"><button class="btn" id="cOk">الحمد لله 🌸</button></div></div>`;
  document.body.appendChild(m); $('#cOk', m).onclick = () => m.remove(); fillVps(m);
  if (nb || big) { confetti(4500); chime(1); } else { confetti(1600); chime(); }
}
