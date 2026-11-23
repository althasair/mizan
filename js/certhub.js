/* الميزان — «شهادات الشكر والتقدير»: صفحة واحدة بثلاثة أقسام
   ١) الصادرة من المعلمات للطالبات (من سبع سنابل، بأثر رجعي)  ٢) الصادرة من المنسقات للمعلمات والزميلات  ٣) الصادرة من النائب الأكاديمي */
'use strict';
const CH_TABS = [['t', '🎓 الصادرة من المعلمات للطالبات'], ['c', '🌾 الصادرة من المنسقات'], ['v', '👑 الصادرة من النائب الأكاديمي']];
function A_certs(el) {
  S.chTab = S.chTab || (isAdmin() ? 'v' : 'c');
  el.innerHTML = `<div class="card" style="padding:10px 12px;margin-bottom:12px"><div class="row" style="gap:8px;flex-wrap:wrap">${CH_TABS.map(([k, t]) =>
    `<button type="button" class="btn ${S.chTab === k ? '' : 'sec'}" data-ch="${k}">${t}</button>`).join('')}</div></div><div id="chBox"></div>`;
  $$('[data-ch]', el).forEach(b => b.onclick = () => { S.chTab = b.dataset.ch; show(); });
  const box = $('#chBox', el);
  if (S.chTab === 't') chTeachers(box);
  else if (S.chTab === 'c') C_tcert(box);
  else if (isAdmin()) A_vcert(box);
  else chVP(box);
  setTitle('شهادات الشكر والتقدير');
}

/* ١) شهادات المعلمات للطالبات — كل ما أصدرته المعلمات في سبع سنابل منذ بداية العام */
function chTeachers(el) {
  const per = S.chPer || 'all', t = today();
  const rng = per === 'm' ? [t.slice(0, 8) + '01', t] : per === 's' ? (() => { const ps = (S.periods || []).filter(p => p.sem); const cur = (ps.find(p => p.from <= t && p.to >= t) || ps[0] || {}).sem; const L = ps.filter(p => p.sem === cur); return L.length ? [L.map(p => p.from).sort()[0], L.map(p => p.to).sort().slice(-1)[0]] : ['0000', '9999']; })() : ['0000', '9999'];
  const isCert = r => /شهادة|رسالة شكر|هدية|تعزيز/.test(String(r.d.det || ''));
  const L = S.records.filter(r => r.item === 'SRF' && r.d && isCert(r) && String(r.date).slice(0, 10) >= rng[0] && String(r.date).slice(0, 10) <= rng[1] && (isAdmin() || (S.user.dept || []).includes(r.dept)));
  const kind = r => (String(r.d.det).match(/^(شهادة [^(—]+|رسالة شكر مكتوبة|هدية|تعزيز خلال الحصة الدراسية|شهادة)/) || [, 'تعزيز'])[1].trim();
  const why = r => String(r.d.det).split(/—\s*على:\s*|—\s*/).slice(1).join(' — ').trim();
  const depts = [...new Set(L.map(r => r.dept))].sort((a, b) => a.localeCompare(b, 'ar'));
  const nStu = new Set(L.flatMap(r => r.d.stu || [])).size;
  el.innerHTML = `<div class="tins">جميع ما أصدرته المعلمات لطالباتهن من شهادات ورسائل شكر وتعزيز في منصة سبع سنابل — يُعرض تلقائياً وبأثر رجعي منذ بداية العام. الفئة المستهدفة: الطالبات.</div>
  <div class="card"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
    ${[['all', 'منذ بداية العام'], ['s', 'الفصل الحالي'], ['m', 'هذا الشهر']].map(([k, l]) => `<button type="button" class="btn sm ${per === k ? '' : 'sec'}" data-cp="${k}">${l}</button>`).join('')}
    <span class="sp"></span><span class="chip ok">${L.length} شهادة وتعزيز</span><span class="chip tf">${nStu} طالبة</span><span class="chip">${new Set(L.map(r => r.d.t)).size} معلمة</span></div></div>
  ${!L.length ? '<div class="empty">لا توجد شهادات صادرة من المعلمات في هذه الفترة.</div>' : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px">${depts.map(d => {
    const D = L.filter(r => r.dept === d), by = {}; D.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
    return `<div style="border:1px solid #EADFCF;border-radius:16px;padding:10px;background:#fff"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="color:var(--maroon);font-size:15px">${esc(d)}</b><span class="chip ok">${D.length}</span></div>
      ${Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([tn, R]) => `<details style="border-radius:9px;background:#FBFAF8;margin-bottom:3px;padding:3px 8px"><summary style="cursor:pointer;display:flex;gap:6px;align-items:center"><span style="flex:1;white-space:nowrap;font-size:13px">أ. ${esc(tn)}</span><span class="chip ok" style="font-size:11px">${R.length}</span></summary>
        ${R.sort((a, b) => String(b.date).localeCompare(String(a.date))).map(r => `<div style="font-size:11.5px;padding:3px 0;border-top:1px dashed #EEE"><b>${esc(kind(r))}</b> — ${esc((r.d.stu || []).map(x => String(x).split(/\s+/).slice(0, 3).join(' ')).join('، '))}${r.d.s ? ` (${esc(r.d.s)})` : ''}${why(r) ? `<div style="color:#666">${esc(why(r))}</div>` : ''}<span style="color:#999;font-size:10.5px"> ${dm(r.date)}</span></div>`).join('')}</details>`).join('')}</div>`; }).join('')}</div>`}`;
  $$('[data-cp]', el).forEach(b => b.onclick = () => { S.chPer = b.dataset.cp; show(); });
}

/* ٣) للمنسقة: ما أصدره النائب الأكاديمي لمعلمات قسمها (للاطلاع) */
function chVP(el) {
  const L = S.records.filter(r => r.item === 'VCR' && r.d && (S.user.dept || []).includes(r.dept)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  el.innerHTML = `<div class="tins">شهادات الشكر والتقدير التي أصدرها النائب الأكاديمي لمعلمات القسم ومنسقته.</div>
  <div class="card">${!L.length ? '<div class="empty">لم تصدر شهادات من النائب الأكاديمي لقسمكِ بعد.</div>' : L.map(r => `<div style="display:flex;gap:8px;align-items:center;padding:5px 8px;border-radius:9px;background:#FBFAF8;margin-bottom:3px">
    <span style="white-space:nowrap;font-weight:bold">أ. ${esc(r.d.t || '')}</span><span class="chip tf">${esc(r.d.title || 'شهادة شكر وتقدير')}</span><span style="flex:1;font-size:12px;color:#555">${esc((r.d.reasons || []).join('، '))}</span><span style="font-size:11px;color:#999">${dm(r.date)}</span></div>`).join('')}</div>`;
}
