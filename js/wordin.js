/* رفع استمارات الحضور الصفي (Word) وتحويلها إلى سجلات في الميزان تلقائياً
   يقرأ استمارة «الإشراف على أداء المعلم» الوزارية: المادة والموضوع والصف والمعلمة والتاريخ ونوع المتابعة،
   وتقدير كل بند من البنود الـ23 (بحسب عناوين أعمدة السلّم في الاستمارة نفسها)، وتوصيات البنود، والملاحظات العامة.
   kind: OV زيارة الموجه التربوي · VPV حضور النائب الأكاديمي · V حضور المنسقة */
const WI_KIND = {
  OV: { t: 'رفع استمارات التوجيه التربوي (Word)', ty: 'زيارة الموجه التربوي' },
  VPV: { t: 'رفع استمارات حضوري (Word)' },
  V: { t: 'رفع استمارات حضور المنسقة (Word)' },
};
const wiBtn = kind => `<button class="btn sec" data-wi="${kind}" title="ارفعي استمارة أو أكثر بصيغة Word، وتتحول إلى سجلات كاملة بالبنود والتوصيات">＋ ${esc(WI_KIND[kind].t)}</button>`;
function wiBind(el, kind, opt) {
  $$('[data-wi="' + kind + '"]', el).forEach(b => b.onclick = () => {
    const f = document.createElement('input'); f.type = 'file'; f.accept = '.docx'; f.multiple = true;
    f.onchange = () => { if (f.files.length) wiRun(kind, [...f.files], opt || {}); };
    f.click();
  });
}
async function wiZip() {
  if (window.JSZip) return;
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'assets/vendor/jszip.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
const wiNz = s => String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
function wiLev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
/* مطابقة اسم المعلمة المكتوب في الاستمارة مع أسماء الطاقم (تسامح مع اختلاف الإملاء والمسافات) */
function wiWho(name) {
  const k = wiNz(name).replace(/^(ا|الاستاذه|استاذه)\.?\s*/, ''); if (!k) return '';
  const ks = k.replace(/\s/g, ''), kf = k.split(' ')[0];
  let best = '', bs = 99;
  (S.staff || []).forEach(s => { const n = wiNz(s.name), ns = n.replace(/\s/g, '');
    if (n.split(' ')[0] !== kf) return; const parts = k.split(' '); const last = parts[parts.length - 1];
    const d = Math.min(wiLev(ks, ns), parts.length > 1 ? wiLev(kf + last, n.split(' ')[0] + n.split(' ').slice(-1)[0]) : 99);
    if (d < bs) { bs = d; best = s.name; } });
  return bs <= 3 ? best : '';
}
const WI_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
function wiParse(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const kids = (el, ln) => [...el.getElementsByTagNameNS(WI_W, ln)];
  const ownCells = tr => kids(tr, 'tc').filter(tc => { let p = tc.parentNode; while (p && p.localName !== 'tr') p = p.parentNode; return p === tr; });
  const txt = el => kids(el, 'p').map(p => kids(p, 't').map(t => t.textContent).join('')).join('\n').replace(/\n{2,}/g, '\n').trim();
  const checked = tc => {
    if (kids(tc, 'sym').some(s => /^F0(50|FC|FE|52|FB)$/i.test(s.getAttributeNS(WI_W, 'char') || s.getAttribute('w:char') || ''))) return true;
    const t = txt(tc).replace(/\s/g, ''); return /^[✓✔√☑☒xX]+$/.test(t);
  };
  const rows = kids(doc, 'tr').map(tr => { const cs = ownCells(tr); return { cs, tx: cs.map(txt) }; });
  const out = { rt: {}, rc: {}, rcg: '', pre: '', warn: [] };
  /* البيانات الأساسية: الخلية التالية لعنوانها */
  const lab = (re, row) => { const i = row.tx.findIndex(x => re.test(wiNz(x))); return i >= 0 ? (row.tx.slice(i + 1).find(x => x && !/^(اليوم|الموضوع|الصف|المعلم|المعـ|الماده|المدرسه)/.test(wiNz(x))) || '') : ''; };
  rows.slice(0, 12).forEach(r => {
    if (!out.subj && r.tx.some(x => /^الماد/.test(wiNz(x)))) out.subj = lab(/^الماد/, r);
    if (!out.topic && r.tx.some(x => /^الموضوع/.test(wiNz(x)))) out.topic = lab(/^الموضوع/, r);
    if (!out.s && r.tx.some(x => /^الصف/.test(wiNz(x)))) out.s = lab(/^الصف/, r);
    if (!out.tw && r.tx.some(x => /^المع[ـ]*لم/.test(wiNz(x)))) out.tw = lab(/^المع[ـ]*لم/, r);
    if (!out.who && r.tx.some(x => /^(الموجه|منسق)/.test(wiNz(x)))) out.who = lab(/^(الموجه|منسق)/, r);
    r.tx.forEach((x, i) => { const n = wiNz(x).replace(/\s/g, ''); const on = checked(r.cs[i]) || (r.cs[i + 1] && !wiNz(r.tx[i + 1]) && checked(r.cs[i + 1]));
      if (!on) return; if (/^ميداني/.test(n)) out.mode = 'ميدانيّة'; else if (/^عنبعد/.test(n)) out.mode = 'عن بُعد'; else if (/^جزئي/.test(n)) out.kj = 'جزئيّة'; else if (/^كلي/.test(n)) out.kj = 'كليّة'; });
  });
  /* التاريخ: من حقل التاريخ في الاستمارة، أو أي تاريخ مكتوب في الجزء الأول */
  const dates = [...doc.getElementsByTagNameNS(WI_W, 'date')].map(d => (d.getAttributeNS(WI_W, 'fullDate') || d.getAttribute('w:fullDate') || '').slice(0, 10)).filter(d => /^202[5-8]-/.test(d));
  const head = rows.slice(0, 6).map(r => r.tx.join(' ')).join(' ');
  let m = head.match(/(20\d\d)[-/.](\d{1,2})[-/.](\d{1,2})/), m2 = head.match(/(\d{1,2})[-/.](\d{1,2})[-/.](20\d\d)/);
  out.date = m ? `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}` : m2 ? `${m2[3]}-${String(m2[2]).padStart(2, '0')}-${String(m2[1]).padStart(2, '0')}` : (dates[0] || '');
  /* البنود: صفوف تلي صف «معايير الأداء»، وأعمدة السلّم تُعرف من عناوينها */
  let col = null, recCol = -1, n = 0, gen = false;
  const scaleOf = t => { t = wiNz(t); return /مبتكر/.test(t) ? 0 : /لم يتم/.test(t) ? 5 : /معظم/.test(t) ? 2 : /بعض/.test(t) ? 3 : /غير متوفر|محدود/.test(t) ? 4 : /مستكمل/.test(t) ? 1 : -1; };
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], all = wiNz(r.tx.join(' '));
    if (r.tx.some(x => /معايير الاداء/.test(wiNz(x)))) { col = {}; r.tx.forEach((x, j) => { const k = scaleOf(x); if (k >= 0 && col[k] == null) col[k] = j; if (/التوصيات/.test(wiNz(x))) recCol = j; }); continue; }
    if (/ملاحظات وتوصيات عام/.test(all)) { gen = true; const rest = r.tx.filter(x => x && !/ملاحظات وتوصيات عام/.test(wiNz(x))).join('\n'); if (rest) out.pre += (out.pre ? '\n' : '') + rest; continue; }
    if (gen) { if (/توقيع/.test(all)) break; const t = r.tx.filter(Boolean).join('\n'); if (t) out.pre += (out.pre ? '\n' : '') + t; continue; }
    if (!col || n >= 23) continue;
    const hit = Object.keys(col).filter(k => r.cs[col[k]] && checked(r.cs[col[k]]));
    const crit = r.tx.find((x, j) => x.length > 12 && !Object.values(col).includes(j) && j !== recCol);
    if (!crit && !hit.length) continue;
    out.rt[n] = hit.length ? +hit[0] : 5; if (!hit.length) out.warn.push(n + 1);
    if (recCol >= 0 && r.cs[recCol]) { const tc = r.cs[recCol]; const vm = kids(tc, 'vMerge')[0]; const v = vm ? (vm.getAttributeNS(WI_W, 'val') || vm.getAttribute('w:val') || 'continue') : '';
      const rt = r.tx[recCol]; if (rt && v !== 'continue') { if (v === 'restart') out.rcg += (out.rcg ? '\n' : '') + rt; else out.rc[n] = rt; } }
    n++;
  }
  out.n = n;
  return out;
}
async function wiRun(kind, files, opt) {
  try { await wiZip(); } catch (e) { return toast('تعذّر تحميل قارئ ملفات Word', 1); }
  const P = [];
  for (const f of files) {
    try { const z = await JSZip.loadAsync(await f.arrayBuffer()); const x = await z.file('word/document.xml').async('string'); const p = wiParse(x); p.file = f.name; p.t = wiWho(p.tw); P.push(p); }
    catch (e) { P.push({ file: f.name, err: 'ليست استمارة Word صالحة' }); }
  }
  wiPreview(kind, P, opt);
}
/* الصف بصيغة الميزان: «عاشر5» أو «حادي عشر 7» ← 10-5 / 11-7 */
function wiSec(x) { const t = wiNz(x).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); let m = t.match(/(1[0-2])\s*[-/ ]\s*(\d{1,2})/); if (m) return m[1] + '-' + m[2];
  const g = /ثاني عشر|الثاني عشر/.test(t) ? 12 : /حادي عشر|الحادي عشر/.test(t) ? 11 : /عاشر/.test(t) ? 10 : 0; const n = (t.match(/(\d{1,2})\s*$/) || t.match(/(\d{1,2})/) || [])[1];
  return g && n ? g + '-' + n : String(x || '').trim(); }
const WI_SC = ['مبتكرة', 'مستكملة', 'معظم الأدلة', 'بعض الأدلة', 'غير متوفرة', 'لم يُقس'];
function wiPreview(kind, P, opt) {
  const names = (S.staff || []).filter(s => s.name).map(s => s.name).sort((a, b) => a.localeCompare(b, 'ar'));
  const deptOf = n => ((S.staff || []).find(s => s.name === n) || {}).dept || '';
  const sumRt = p => { const c = [0, 0, 0, 0, 0, 0]; Object.values(p.rt || {}).forEach(v => c[v]++); return c.map((x, i) => x ? `${WI_SC[i]} ${x}` : '').filter(Boolean).join(' · '); };
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box" style="max-width:1100px;width:96vw;max-height:92vh;overflow:auto"><h3>${esc(WI_KIND[kind].t)}</h3>
    <div class="note" style="margin-bottom:8px">قرأت المنصة الاستمارات التالية. راجعي اسم المعلمة والتاريخ والصف، ثم اضغطي «حفظ». الاستمارة التي لم تُعرف معلمتها اختاري اسمها من القائمة.</div>
    <div class="tbl"><table class="t" style="font-size:12.5px"><tr><th>الملف</th><th>المعلمة</th><th>التاريخ</th><th>الصف</th><th>الموضوع</th><th>التقديرات (${'23 بنداً'})</th><th></th></tr>
    ${P.map((p, i) => p.err ? `<tr><td>${esc(p.file)}</td><td colspan="6" style="color:var(--maroon)">${esc(p.err)}</td></tr>` : `<tr data-i="${i}">
      <td style="font-size:11px;max-width:160px;word-break:break-all">${esc(p.file)}</td>
      <td><select data-k="t"><option value="">— اختاري —</option>${names.map(n => `<option ${n === p.t ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>${p.tw && !p.t ? `<div style="font-size:11px;color:var(--muted)">في الاستمارة: ${esc(p.tw)}</div>` : ''}</td>
      <td><input type="date" data-k="date" value="${esc(p.date || '')}"></td>
      <td><input data-k="s" value="${esc(wiSec(p.s))}" style="width:70px"></td>
      <td><input data-k="topic" value="${esc(p.topic || '')}"></td>
      <td style="font-size:11.5px">${p.n === 23 ? '' : `<span class="chip warn">${p.n} بنداً</span> `}${esc(sumRt(p))}${p.warn.length ? `<div style="color:#B8521A">بنود بلا علامة في الاستمارة (سُجّلت «لم يتم قياسه»): ${p.warn.join('، ')}</div>` : ''}</td>
      <td><label style="font-size:12px;white-space:nowrap"><input type="checkbox" data-k="on" checked> حفظ</label></td></tr>`).join('')}</table></div>
    <div class="row" style="margin-top:12px"><button class="btn" id="wiOk">حفظ</button><button class="btn sec" id="wiNo">إلغاء</button><span class="sp"></span><span id="wiMsg" style="font-size:12.5px;color:var(--muted)"></span></div></div>`;
  document.body.appendChild(m);
  $('#wiNo', m).onclick = () => m.remove();
  $('#wiOk', m).onclick = async () => {
    const L = [];
    $$('tr[data-i]', m).forEach(tr => { const p = P[+tr.dataset.i]; const g = k => $('[data-k="' + k + '"]', tr); if (!g('on').checked) return;
      const t = g('t').value, date = g('date').value; if (!t || !date) return L.push({ bad: p.file });
      const s = g('s').value.trim(), topic = g('topic').value.trim(); const dept = kind === 'V' && opt.dept ? opt.dept : deptOf(t);
      const base = { t, date, s, subj: p.subj || '', topic, mode: p.mode || 'ميدانيّة', kj: p.kj || 'كليّة', rt: p.rt, rc: p.rc || {}, pre: [p.pre, p.rcg].filter(Boolean).join('\n'), src: 'استمارة Word مرفوعة', file: p.file };
      let d;
      if (kind === 'OV') { const recs = String(p.rcg || Object.values(p.rc || {}).join('\n')).split(/\n+/).map(x => x.replace(/^[-•\s]*(اوصي|أوصي) بالتالي\s*:?\s*/, '').trim()).filter(x => x.length > 4);
        d = Object.assign(base, { ty: WI_KIND.OV.ty, who: p.who ? 'أ. ' + p.who.replace(/^أ\.\s*/, '') : '', goal: 'الإشراف على أداء المعلم' + (topic ? ' — ' + topic : ''), i1: recs[0] || '', i2: recs[1] || '', i3: recs.slice(2).join('، ') }); }
      else if (kind === 'VPV') d = Object.assign(base, { st: [], im: [], fu: [], wsi: {}, live: '' });
      else d = Object.assign(base, { ty: '', form: 1, cby: opt.cby ? opt.cby(dept) : '' });
      const item = kind; const sum = kind === 'OV' ? 'زيارة الموجه التربوي: ' + t : kind === 'VPV' ? 'زيارة النائب الأكاديمي: ' + t : `أ. ${t} — زيارة صفية`;
      L.push({ rec: { dept, item, date, sum, d, key: t + '|' + date } }); });
    const bad = L.filter(x => x.bad); if (bad.length) return toast('اختاري المعلمة والتاريخ لكل استمارة: ' + bad.map(x => x.bad).join('، '), 1);
    const ok = L.filter(x => x.rec); if (!ok.length) return m.remove();
    $('#wiOk', m).disabled = true; let saved = 0; const skipped = [];
    for (const x of ok) { $('#wiMsg', m).textContent = `جارٍ الحفظ ${saved + 1} من ${ok.length}…`;
      try { const j = await call('save', { rec: x.rec }); S.records.push(j.record); saved++; } catch (e) { skipped.push(x.rec.d.t + ': ' + (e.message || e)); } }
    m.remove(); toast(`تم حفظ ${saved} استمارة ✓` + (skipped.length ? ` · لم يُحفظ ${skipped.length}` : ''), skipped.length ? 1 : 0);
    if (skipped.length) alert('لم تُحفظ:\n' + skipped.join('\n'));
    show();
  };
}
