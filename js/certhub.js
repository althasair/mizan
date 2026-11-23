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
  ${chIssued(L, 'data-vw', '', 'شهادات النائب الأكاديمي لقسمكِ')}`;
  $$('[data-vw]', el).forEach(b => b.onclick = () => { const r = S.records.find(x => x.id === b.dataset.vw); if (r && typeof vcOpen === 'function') vcOpen([r]); });
}

/* الشهادات الصادرة في مربعات الأقسام: القسم ← المكرَّمات وعدد شهادات كل واحدة ← التفاصيل عند الضغط */
const CH_COL = ['#7A1C2E', '#1F4E9E', '#16806A', '#B0661A', '#5B3A8E', '#0E6E86', '#9E1B5A', '#3E6B1F', '#8A5A12', '#2F3E66'];
function chIssued(L, ko, kx, title) {
  const sh = n => String(n || '').trim().split(/\s+/).filter((w, i, A) => i < 2 || i === A.length - 1).join(' ');
  const depts = [...new Set(L.map(r => r.dept || '—'))].sort((a, b) => a.localeCompare(b, 'ar'));
  const nT = new Set(L.map(r => r.d.t)).size;
  return `<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><h2 style="margin:0">${title || 'الشهادات الصادرة'}</h2><span class="sp"></span>
    <span class="chip ok">${L.length} شهادة</span><span class="chip tf">${nT} مكرَّمة</span><span class="chip">${depts.length} ${depts.length > 2 ? 'أقسام' : 'قسم'}</span></div>
  ${!L.length ? '<div class="empty">لم تصدر شهادات بعد</div>' : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin-top:10px">${depts.map((d, di) => {
    const c = CH_COL[di % CH_COL.length], D = L.filter(r => (r.dept || '—') === d), by = {};
    D.forEach(r => (by[r.d.t] = by[r.d.t] || []).push(r));
    return `<div style="border-radius:16px;overflow:hidden;border:1px solid ${c}33;background:#fff;box-shadow:0 2px 8px #0000000d">
      <div style="background:${c};color:#fff;padding:8px 12px;display:flex;align-items:center;gap:8px"><b style="flex:1;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d)}</b><span style="background:#fff;color:${c};border-radius:20px;padding:1px 10px;font-weight:bold;font-size:13px">${D.length}</span></div>
      <div style="padding:6px 8px">${Object.entries(by).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ar')).map(([tn, R]) => `<details style="border-radius:9px;background:${c}0D;margin-bottom:4px;padding:4px 8px"><summary style="cursor:pointer;display:flex;gap:6px;align-items:center;list-style:none"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px;font-weight:bold">أ. ${esc(sh(tn))}</span>${R.some(r => r.d.odept) ? '<span style="font-size:10.5px;color:#888">زميلة من قسم آخر</span>' : ''}<span style="background:${c};color:#fff;border-radius:20px;min-width:22px;text-align:center;padding:0 7px;font-size:12px;font-weight:bold">${R.length}</span></summary>
        ${R.sort((a, b) => String(b.date).localeCompare(String(a.date))).map(r => `<div style="font-size:11.5px;padding:5px 0;border-top:1px dashed #E5E5E5"><div style="display:flex;gap:6px;align-items:center"><b style="flex:1">${esc(r.d.title || 'شهادة شكر وتقدير')}</b><span style="color:#999;font-size:10.5px">${dmy(r.date)}</span></div>
          <div style="color:#555">${(r.d.reasons || []).map(esc).join('، ')}</div>
          <div style="margin-top:3px"><button class="btn sm sec" ${ko}="${r.id}" style="padding:2px 10px;font-size:11px">فتح الشهادة</button>${kx ? ` <button class="btn sm ghost" ${kx}="${r.id}" style="color:#A33;padding:2px 8px;font-size:11px">🗑 حذف</button>` : ''}</div></div>`).join('')}</details>`).join('')}</div></div>`; }).join('')}</div>`}</div>`;
}
