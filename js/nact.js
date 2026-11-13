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
    acts: L.filter(r => !['stat', 'media', 'plan', 'ach'].includes(r.d.k)).length,
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
  const auto = { plan_ok: L.some(r => r.d.k === 'plan'), rep_ph: L.filter(r => r.d.rep).length >= 5, safe_trip: st.trips > 0 && st.tripsOk === st.trips, f_trip: st.trips > 0 && st.tripsOk === st.trips, pub_ch: L.filter(r => r.d.k === 'media').length >= 2, f_rep: L.filter(r => r.d.rep).length > 0 };
  return NA_IND.map(I => { const items = I.ck.map(([k, t]) => ({ k, t, on: !!(ck[k] || auto[k]), auto: !!auto[k] && !ck[k] })); const done = items.filter(x => x.on).length;
    return Object.assign({}, I, { items, done, pct: Math.round(done / items.length * 100) }); });
}

function N_act(el) {
  setTitle('ملف أخصائية الأنشطة المدرسية');
  const L = naRecs(), st = naStats(L), ind = naIndState(L);
  const tot = Math.round(ind.reduce((a, x) => a + x.pct, 0) / ind.length);
  const tab = S.naTab || 'ind';
  const mo = {}; L.forEach(r => { const m = String(r.date).slice(5, 7); (mo[m] = mo[m] || []).push(r); });
  const grp = {}; L.forEach(r => { const g = (NA_K[r.d.k] || ['', 'أخرى'])[1]; (grp[g] = grp[g] || {}); (grp[g][r.d.k] = grp[g][r.d.k] || []).push(r); });
  const chip = (t, c) => `<span class="chip" style="font-size:11px;${c ? `background:${c}1A;color:${c}` : ''}">${t}</span>`;
  const row = r => { const d = r.d, K = NA_K[d.k] || ['—'];
    const flags = [d.rep ? chip('تقرير ✓', '#17734A') : chip('بلا تقرير', '#A3202F'), d.cert ? chip('شهادة شكر', '#946410') : '', d.pub ? chip('منشور', '#1F5F99') : '',
      d.k === 'trip' ? [['f_consent', 'موافقات'], ['f_pledge', 'تعهد مشرفة'], ['f_list', 'كشف الطالبات']].map(([k, t]) => chip((d[k] ? '✓ ' : '✗ ') + t, d[k] ? '#17734A' : '#A3202F')).join(' ') : ''].join(' ');
    return `<tr><td style="white-space:nowrap">${dmy(r.date)}</td><td><b>${esc(d.title)}</b>${d.partner ? `<div style="font-size:12px;color:var(--muted)">بالشراكة مع: ${esc(d.partner)}</div>` : ''}${d.note ? `<div style="font-size:12px;color:var(--muted)">${esc(d.note)}</div>` : ''}</td>
      <td style="font-size:12px">${esc(K[0])}</td><td style="text-align:center">${d.n ? `<b>${d.n}</b>` : '—'}</td><td>${flags}</td>
      <td style="white-space:nowrap" class="noprint"><button class="btn sm sec" data-ne="${r.id}">تعديل</button> <button class="btn sm ghost" data-nx="${r.id}" style="color:#A33">🗑</button></td></tr>`; };
  const head = '<tr><th>التاريخ</th><th>النشاط</th><th>الباب</th><th>المستفيدات</th><th>الشواهد</th><th class="noprint"></th></tr>';
  el.innerHTML = `
  <div class="na-hero"><div><div class="na-k">ممارسة متميزة</div><h1>ملف البرامج والأنشطة اللامنهجية</h1><div class="na-n">أ. ${esc(naName())} · أخصائية الأنشطة المدرسية · العام الأكاديمي 2026–2027</div></div>
    <div class="na-v">﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾<small>المائدة 2</small></div></div>
  <div class="grid g4 na-kpi">
    ${[[st.acts, 'نشاط وبرنامج موثق', '#7A1F3D'], [st.stu, 'مستفيدة مسجلة', '#0A6F6B'], [st.partners, 'جهة شريكة', '#946410'], [st.ach, `إنجازاً (${st.intl} دولية)`, '#1F5F99'],
       [st.trips, 'رحلة مدرسية', '#0A6F6B'], [st.par, 'شراكة مع أولياء الأمور', '#946410'], [st.cert, 'شهادة شكر وتقدير', '#7A1F3D'], [st.vh, `ساعة تطوع (${st.vol} متطوعة)`, '#17734A']]
      .map(([n, t, c]) => `<div class="card na-t" style="border-top:4px solid ${c}"><b style="color:${c}">${n}</b><span>${t}</span></div>`).join('')}
  </div>
  <div class="card"><div class="row" style="flex-wrap:wrap;gap:6px">
    ${[['ind', 'مؤشرات الجولة الأولى'], ['teams', 'حسب تنظيم تيمز'], ['month', 'السجل الشهري'], ['add', '+ إضافة نشاط']].map(([k, t]) => `<button class="btn ${tab === k ? '' : 'sec'} sm" data-nt="${k}">${t}</button>`).join('')}
    <span class="sp"></span><button class="btn sec sm noprint" onclick="window.print()">طباعة</button></div></div>
  <div id="naBody"></div>`;
  const B = $('#naBody', el);
  if (tab === 'ind') {
    B.innerHTML = `<div class="card"><div class="row"><h2 style="margin:0">مدى الجاهزية للجولة الأولى</h2><span class="sp"></span><div class="na-bar" style="width:220px"><i style="width:${tot}%"></i></div><b style="margin-inline-start:8px">${tot}%</b></div>
      <div class="note" style="margin-top:6px">المؤشرات كما وردت في الدليل التفسيري لاستمارة الجولة الأولى للبرامج والأنشطة اللامنهجية 2026–2027. ما يُستدل عليه من السجل يُعلَّم تلقائياً، والباقي تؤشّر عليه الأخصائية عند توفر الشاهد في تيمز.</div></div>
      ${ind.map(I => `<div class="card na-ind"><div class="row"><span class="na-num">${I.n}</span><h3 style="margin:0;flex:1">${I.t}</h3><b style="color:${I.pct === 100 ? '#17734A' : I.pct >= 50 ? '#946410' : '#A3202F'}">${I.done} / ${I.items.length}</b></div>
        <div class="na-bar"><i style="width:${I.pct}%;background:${I.pct === 100 ? '#17734A' : I.pct >= 50 ? '#C99A2E' : '#A3202F'}"></i></div>
        <div class="na-ck">${I.items.map(x => `<label class="${x.on ? 'on' : ''}"><input type="checkbox" data-ck="${x.k}" ${x.on ? 'checked' : ''} ${x.auto ? 'disabled' : ''}> ${x.t}${x.auto ? ' <small>(من السجل)</small>' : ''}</label>`).join('')}</div>
        ${naIndNote(I.n, L, st)}</div>`).join('')}`;
    $$('[data-ck]', B).forEach(c => c.onchange = async () => {
      let r = naCk(); const d = r ? Object.assign({}, r.d) : { ck: {} }; d.ck = Object.assign({}, d.ck, { [c.dataset.ck]: c.checked });
      const rec = { id: r && r.id, dept: NA_DEPT, item: 'NCK', date: '2026-08-23', sum: 'مؤشرات الجولة الأولى', d };
      const j = await call('save', { rec }); const nr = j.record || Object.assign({}, rec, { id: j.id });
      S.records = S.records.filter(x => x.item !== 'NCK').concat([nr]); show();
    });
  } else if (tab === 'teams') {
    B.innerHTML = Object.keys(NA_COL).map(g => `<div class="card"><h2 style="color:${NA_COL[g]}">${g}</h2>
      ${Object.keys(NA_K).filter(k => NA_K[k][1] === g).map(k => { const A = (grp[g] || {})[k] || [];
        return `<details ${A.length ? '' : ''} class="na-det"><summary><b>${NA_K[k][0]}</b> <span class="chip" style="font-size:11px">${A.length}</span>${A.length ? '' : ' <span style="color:#A3202F;font-size:12px">— لا توجد شواهد بعد</span>'}</summary>
          ${A.length ? `<div class="tbl"><table class="t">${head}${A.map(row).join('')}</table></div>` : ''}</details>`; }).join('')}</div>`).join('');
  } else if (tab === 'month') {
    B.innerHTML = Object.keys(mo).sort((a, b) => (a < '08' ? +a + 12 : +a) - (b < '08' ? +b + 12 : +b)).map(m => { const A = mo[m], s = naStats(A);
      return `<div class="card"><div class="row"><h2 style="margin:0">${NA_MO[m] || m}</h2><span class="sp"></span><span class="chip">${A.length} سجلاً</span> <span class="chip">${s.stu} مستفيدة</span> <span class="chip">${s.partners} جهة</span></div>
        <div class="tbl" style="margin-top:8px"><table class="t">${head}${A.map(row).join('')}</table></div></div>`; }).join('') || '<div class="card"><div class="empty">لا توجد سجلات بعد</div></div>';
  } else {
    naForm(B, S.naEdit ? L.find(r => r.id === S.naEdit) : null);
  }
  $$('[data-nt]', el).forEach(b => b.onclick = () => { S.naTab = b.dataset.nt; S.naEdit = null; show(); });
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
    5: 'يُستكمل بربط كشوف خروج الطالبات للأنشطة والرحلات بسجل الحصص التعويضية لدى الأقسام.',
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
        ${[['rep', 'تقرير النشاط'], ['cert', 'شهادة شكر وتقدير'], ['pub', 'نُشر في قنوات المدرسة'], ['f_consent', 'موافقات أولياء الأمور (للرحلات)'], ['f_pledge', 'تعهد المشرفة (للرحلات)'], ['f_list', 'كشف الطالبات (للرحلات)'], ['exit', 'كشف خروج الطالبات من الحصص']]
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
    toast('تم الحفظ ✓'); show();
  };
}
