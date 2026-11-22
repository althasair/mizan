/* توصيات التوجيه التربوي — عرض النائب الأكاديمي لكل زيارات الموجهين في الأقسام،
   وما اتخذته المنسقة من إجراءات لمتابعة التوصيات، وتاريخ قياس أثرها (من بند «زيارات القيادة وتوصيات التوجيه» عند المنسقات) */
function A_supv(el) {
  setTitle('توصيات التوجيه التربوي — متابعة المنسقات');
  const k = r => [r.dept, r.d.t, String(r.date).slice(0, 10)].join('|'), seen = {};
  const L = S.records.filter(r => r.item === 'OV' && r.d && /الموجه/.test(r.d.ty || ''))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .filter(r => seen[k(r)] ? false : (seen[k(r)] = 1));
  const who = r => String(r.d.who || '').replace(/^(أ\s*\.|الأستاذة|الاستاذة|استاذة|أستاذة)\s*:?\s*/, '').trim().replace(/^الموجه التربوي$/, '');
  const nM = L.filter(r => r.d.mech).length, nD = L.filter(r => r.d.fud).length;
  const depts = [...new Set(L.map(r => r.dept))].sort((a, b) => L.filter(r => r.dept === b).length - L.filter(r => r.dept === a).length);
  const miss = '<span style="color:#B8521A;font-weight:700">لم تسجّله المنسقة بعد</span>';
  const kpi = (n, t, c) => `<div style="flex:1;min-width:130px;background:${c};border-radius:10px;padding:10px 12px;text-align:center"><b style="font-size:22px">${n}</b><div style="font-size:12.5px">${t}</div></div>`;
  el.innerHTML = `<div class="card"><h2>🧭 توصيات التوجيه التربوي <span class="sub">زيارات الموجهين لمعلمات الأقسام، وإجراء كل منسقة لمتابعة التوصيات وتاريخ قياس أثره. تُسجّلها المنسقة في بند «زيارات القيادة وتوصيات التوجيه»، وتنعكس في تقريرها الشهري.</span></h2>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:8px 0 12px">${kpi(L.length, 'زيارة للموجهين', '#F3ECEF')}${kpi(depts.length, 'قسمًا زاره الموجه', '#EEF3F8')}${kpi(nM + ' من ' + L.length, 'سُجّل لها إجراء المنسقة', nM === L.length ? '#E4F3EA' : '#FCEADB')}${kpi(nD + ' من ' + L.length, 'حُدّد لها تاريخ قياس الأثر', nD === L.length ? '#E4F3EA' : '#FCEADB')}</div>
    ${!L.length ? '<div class="empty">لا توجد زيارات للموجهين مسجّلة بعد.</div>' : depts.map(d => { const R = L.filter(r => r.dept === d);
      return `<h3 style="margin:14px 0 6px;color:var(--maroon)">${esc(d)} <small style="color:var(--muted);font-weight:400">(${R.length})</small></h3>
      <div class="apl-tw"><table class="apl-t"><thead><tr><th>التاريخ</th><th>المعلمة</th><th>الصف</th><th>الموجه/ة</th><th>التوصيات</th><th>إجراء المنسقة</th><th>تاريخ قياس الأثر</th></tr></thead><tbody>
      ${R.map(r => `<tr><td class="apl-due">${dm(String(r.date).slice(0, 10))}</td><td style="white-space:nowrap">${esc(r.d.t || '')}</td><td class="apl-due">${esc(r.d.s || '')}</td><td style="white-space:nowrap">${esc(who(r) || '—')}</td>
        <td style="text-align:justify">${[r.d.i1, r.d.i2].filter(Boolean).map(esc).join('<br>') || '<span style="color:var(--muted)">—</span>'}</td>
        <td style="text-align:justify">${r.d.mech ? esc(r.d.mech) : miss}</td><td class="apl-due">${r.d.fud ? dmy(r.d.fud) : miss}</td></tr>`).join('')}</tbody></table></div>`; }).join('')}</div>`;
}
