/* ==================================================================
   متابعة تنفيذ الخطة السنوية للقسم
   خطة كل قسم مرتّبة في data/plans.json: المجال ← البند الأساسي ← البنود الفرعية (لكل فرعي وصف جاهز لما تم).
   المنسقة تختار البند الأساسي ثم تؤشّر على ما تحقق من فروعه؛ والبند الأساسي لا يكتمل إلا بتحقق فروعه كلها.
   كل بند فرعي متحقق يُحفظ سجلاً (APL) بتاريخه ووصفه، فيظهر في التقرير الشهري تحت «الخطة السنوية للقسم».
   ================================================================== */
let PLANS = {};
async function plansLoad() { try { PLANS = await fetch('data/plans.json?v=' + (window.MIZAN_V || Date.now())).then(r => r.json()); } catch (e) { PLANS = {}; } }
const aplPlanOf = dept => PLANS[dept] || null;
/* الوصف الذكي: {الاختبار} = آخر اختبار تحصيلي سجّله القسم في «التقييمات» حتى تاريخ التحقق (وإلا من التقويم المدرسي)،
   و{الاختبار القادم} = أقرب اختبار بعده في التقويم؛ ويُضاف الفصل (الأول/الثاني) من فترة التاريخ */
const APL_TESTS = ['اختبار دوري', 'اختبار الوحدة', 'اختبار منتصف الفصل', 'اختبار نهاية الفصل'];
function aplTerm(date) { const p = (S.periods || []).find(x => date >= x.from && date <= x.to); return p && /الثالث|الرابع/.test(p.name) ? 'الثاني' : 'الأول'; }
function aplTestName(dept, date, next) {
  const term = n => /الفصل$/.test(n) ? n + ' الدراسي ' + aplTerm(date) : n;
  const cal = (S.cal || []).filter(c => /اختبار|تقييم/.test(c.t));
  if (next) { const c = cal.filter(c => c.from > date).sort((a, b) => a.from.localeCompare(b.from))[0]; return c ? c.t : 'الاختبار القادم'; }
  const a = S.records.filter(r => r.dept === dept && r.item === 'AS' && APL_TESTS.includes((r.d || {}).ty) && (r.date || '') <= date).sort((x, y) => y.date.localeCompare(x.date) || APL_TESTS.indexOf(y.d.ty) - APL_TESTS.indexOf(x.d.ty))[0];
  if (a) return term(a.d.ty);
  const c = cal.filter(c => c.from <= date).sort((x, y) => y.from.localeCompare(x.from))[0];
  return c ? c.t : 'الاختبار الأخير';
}
const aplFill = (t, dept, date) => String(t).replace(/\{الاختبار القادم\}/g, () => aplTestName(dept, date, 1)).replace(/\{الاختبار\}/g, () => aplTestName(dept, date));
const aplRecs = (recs, dept, upto) => recs.filter(r => r.dept === dept && r.item === 'APL' && r.d && r.d.st === 'تحقق' && (!upto || (r.date || '') <= upto));
/* آخر سجل متحقق لكل بند فرعي */
function aplDone(recs, dept, upto) { const m = {}; aplRecs(recs, dept, upto).forEach(r => { if (!m[r.d.sid] || r.date > m[r.d.sid].date) m[r.d.sid] = r; }); return m; }
function aplStat(plan, done) {
  let all = 0, ok = 0; const per = {};
  plan.doms.forEach(D => D.items.forEach(it => { const n = it.subs.length, k = it.subs.filter(s => done[s.id] || s.once).length; all += n; ok += k; per[it.id] = { n, k }; }));
  return { all, ok, pct: all ? Math.round(ok / all * 100) : 0, per };
}
/* الربع المعروض (من الفترة المختارة أعلى الصفحة): تظهر فيه بنوده فقط، وبنود بداية العام مستكملة في الربع الأول */
function aplQ() { const n = (typeof P === 'function' && P() && P().name) || ''; return /الرابع/.test(n) ? 4 : /الثالث/.test(n) ? 3 : /الثاني/.test(n) ? 2 : 1; }
const aplActive = (s, q) => !s.once && (!s.q || s.q.includes(q));
const aplChip = (k, n) => k === n ? '<span class="chip ok">مكتمل</span>' : k ? `<span class="chip warn">جارٍ ${k}/${n}</span>` : '<span class="chip">لم يبدأ</span>';
const aplBar = (k, n) => `<span class="apl-bar"><i style="width:${n ? Math.round(k / n * 100) : 0}%"></i></span>`;

/* ------------------------------------------------------------------ واجهة المتابعة السريعة: جدول النموذج المعتمد نفسه
   نقرة واحدة على حالة المتابعة (على المسار / متأخر / …) أو على بند فرعي تحقق، والحفظ يجري في الخلفية دون انتظار */
const APS_ST = ['على المسار', 'متأخر', 'متأخر جداً', 'لم يبدأ', 'مكتمل'];
const APS_C = { 'على المسار': 'g', 'متأخر': 'o', 'متأخر جداً': 'r', 'لم يبدأ': 'n', 'مكتمل': 'b' };
const aplQueue = []; let aplBusy = false;
function aplMark(t) { const m = $('#aplSv'); if (m) m.textContent = t; }
function aplPush(fn) { aplQueue.push(fn); aplRun(); }
async function aplRun() {
  if (aplBusy) return; aplBusy = true; aplMark('… جارٍ الحفظ');
  while (aplQueue.length) { const f = aplQueue.shift(); try { await f(); } catch (e) { toast('تعذّر الحفظ: ' + e.message, 1); } }
  aplBusy = false; aplMark('✓ حُفظ كل شيء');
}
/* حفظ سجل في الخلفية: يظهر فوراً، ثم يأخذ رقمه من الخادم */
function aplSave(rec) {
  const tmp = Object.assign({ id: 'tmp' + Date.now() + Math.random().toString(36).slice(2, 6), at: new Date().toISOString() }, rec);
  S.records.push(tmp);
  aplPush(async () => { const r = Object.assign({}, rec); if (tmp.real) r.id = tmp.real; const j = await API.call('save', { rec: r }); tmp.real = j.record.id; tmp.id = j.record.id; });
  return tmp;
}
function aplDel(r) {
  S.records = S.records.filter(x => x !== r);
  aplPush(async () => { if (r.id && !String(r.id).startsWith('tmp')) await API.call('delete', { id: r.id }); });
}
const apsOf = (dept, mid) => S.records.filter(r => r.dept === dept && r.item === 'APS' && r.d && r.d.mid === mid).sort((a, b) => (b.date + b.at).localeCompare(a.date + a.at))[0];
/* الحالة المعروضة: ما اختارته المنسقة، وإلا تُستنتج من البنود الفرعية */
function apsShow(dept, it, done) {
  const r = apsOf(dept, it.id); if (r) return { st: r.d.st, date: r.date, set: 1 };
  const k = it.subs.filter(s => done[s.id] || s.once).length;
  if (k === it.subs.length) { const ds = it.subs.map(s => done[s.id] && done[s.id].date).filter(Boolean).sort(); return { st: 'مكتمل', date: ds.pop() || '', q1: it.subs.every(s => s.once) }; }
  if (k > it.subs.filter(s => s.once).length) { const ds = it.subs.map(s => done[s.id] && done[s.id].date).filter(Boolean).sort(); return { st: 'على المسار', date: ds.pop() || '' }; }
  return { st: '', date: '' };
}

function aplCard(dept) {
  const box = $('#aplC'); if (!box) return;
  const plan = aplPlanOf(dept);
  if (!plan) { box.innerHTML = '<h2>✅ متابعة تنفيذ الخطة السنوية</h2><div class="empty" style="padding:8px 0">لم تُرتَّب بنود خطة القسم بعد. بعد رفع الخطة السنوية تُرتَّب بنودها هنا، فتتابعينها بنقرة واحدة.</div>'; return; }
  const can = isAdmin() || S.user.role === 'coord';
  const Q = aplQ(), QN = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع'][Q];
  const draw = () => {
    const done = aplDone(S.records, dept), st = aplStat(plan, done), mo = today().slice(0, 7);
    const all = S.aplAll;
    const thisMo = {}; aplRecs(S.records, dept).forEach(r => { if ((r.date || '').slice(0, 7) === mo) thisMo[r.d.sid] = r; });
    const rows = plan.doms.map(D => {
      const items = D.items.filter(it => all || it.subs.some(s => aplActive(s, Q)));
      if (!items.length) return '';
      const k = D.items.reduce((a, it) => a + st.per[it.id].k, 0), n = D.items.reduce((a, it) => a + st.per[it.id].n, 0);
      return `<tr class="apl-dh"><td colspan="5"><b>${esc(D.d)}</b> ${aplBar(k, n)} <small>${k}/${n}</small></td></tr>` + items.map(it => {
        const s = apsShow(dept, it, done);
        const subs = it.subs.filter(x => all || aplActive(x, Q) || x.once);
        return `<tr><td class="apl-a"><div>${esc(it.t)}</div><div class="apl-subs">${subs.map(x => {
            if (x.once) return `<span class="apl-sc q1" title="استُكمل في الربع الأول">✔ ${esc(x.t)}</span>`;
            const r = thisMo[x.id], ever = done[x.id];
            return `<button class="apl-sc${r ? ' on' : ever ? ' was' : ''}" data-sc="${x.id}" data-mid="${it.id}" title="${esc(aplFill(x.ds, dept, today()))}" ${can ? '' : 'disabled'}>${r ? '✔ ' : ''}${esc(x.t)}${!r && ever ? ` <small>${dm(ever.date)}</small>` : ''}</button>`; }).join('')}</div></td>
          <td class="apl-by">${esc(it.by)}</td><td class="apl-due">${esc(it.due)}</td>
          <td class="apl-st">${s.q1 ? '<span class="aps b on">مكتمل</span>' : APS_ST.map(v => `<button class="aps ${APS_C[v]}${s.st === v ? ' on' : ''}${s.st === v && !s.set ? ' auto' : ''}" data-st="${v}" data-mid="${it.id}" ${can ? '' : 'disabled'}>${v}</button>`).join('')}</td>
          <td class="apl-dt">${s.q1 ? 'الربع الأول' : s.date ? dm(s.date) : '—'}</td></tr>`; }).join('');
    }).join('');
    box.innerHTML = `<h2>✅ متابعة تنفيذ الخطة السنوية <span class="sub">انقري حالة المتابعة لكل إجراء، وانقري البند الفرعي الذي تحقق هذا الشهر فيظهر وصفه في التقرير الشهري. الحفظ تلقائي.</span></h2>
      <div class="apl-sum"><b>${st.pct}%</b><div>${aplBar(st.ok, st.all)}<small>تحقق ${st.ok} من ${st.all} بنداً فرعياً في خطة القسم</small></div>
        <div class="apl-tools"><span id="aplSv" class="apl-sv">${aplBusy ? '… جارٍ الحفظ' : ''}</span>
        <button class="btn sm sec" id="aplAll">${all ? 'بنود الربع ' + QN + ' فقط' : 'عرض الخطة كاملة'}</button>
        <button class="btn sm" id="aplPr">🖨️ طباعة متابعة الخطة (نموذج الوزارة)</button></div></div>
      <div class="apl-tw"><table class="apl-t"><thead><tr><th>الإجراءات والأنشطة الإشرافية والبرامج ${all ? '' : `<small>(الربع ${QN})</small>`}</th><th>المنفّذ</th><th>موعد الانتهاء</th><th>المتابعة</th><th>تاريخ المتابعة</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${!all ? '<div class="apl-note">✔ البنود الخضراء استُكملت في الربع الأول، وما اكتملت بنوده كلها في الربع الأول يظهر في «عرض الخطة كاملة» وفي الطباعة بحالة «مكتمل».</div>' : ''}`;
    $('#aplAll', box).onclick = () => { S.aplAll = !S.aplAll; draw(); };
    $('#aplPr', box).onclick = () => aplDocx(dept);
    $$('[data-st]', box).forEach(b => b.onclick = () => {
      const mid = b.dataset.mid, v = b.dataset.st, r = apsOf(dept, mid), it = plan.doms.flatMap(D => D.items).find(i => i.id === mid);
      if (r && r.d.st === v) return;
      const rec = { dept, item: 'APS', date: today(), sum: `${it.t}: ${v}`.slice(0, 400), d: { mid, main: it.t, st: v, date: today() } };
      if (r && (r.date || '').slice(0, 7) === today().slice(0, 7)) { Object.assign(r, { date: rec.date, sum: rec.sum, d: rec.d, at: new Date().toISOString() }); aplPush(async () => { const j = await API.call('save', { rec: Object.assign({}, rec, { id: r.real || r.id }) }); r.id = j.record.id; }); }
      else aplSave(rec);
      draw();
    });
    $$('[data-sc]', box).forEach(b => b.onclick = () => {
      const sid = b.dataset.sc, r = thisMo[sid];
      if (r) { aplDel(r); draw(); return; }
      const it = plan.doms.flatMap(D => D.items).find(i => i.id === b.dataset.mid), D = plan.doms.find(D => D.items.includes(it)), s = it.subs.find(x => x.id === sid);
      const ds = aplFill(s.ds, dept, today());
      aplSave({ dept, item: 'APL', date: today(), sum: (s.t + ': ' + ds).slice(0, 400), d: { dom: D.d, mid: it.id, main: it.t, sid, sub: s.t, st: 'تحقق', ds, date: today() } });
      draw();
    });
  };
  draw();
}

/* طباعة متابعة الخطة على النموذج المعتمد نفسه: ملف Word الخاص بخطة القسم (بترويسته وأعمدته وقوائمه)،
   تُملأ فيه خانتا «المتابعة» و«تاريخ المتابعة» لكل إجراء من الميزان، ثم يُنزَّل لطباعته من Word */
async function aplJSZip() {
  if (window.JSZip) return window.JSZip;
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'assets/vendor/jszip.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  return window.JSZip;
}
const aplXText = s => (s.match(/<w:t(?: [^>]*)?>[^<]*<\/w:t>/g) || []).map(t => t.replace(/<[^>]+>/g, '')).join('').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
const aplXEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const aplNorm = s => String(s).replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
const APL_VAL_RPR = '<w:rPr><w:rFonts w:ascii="Lusail+" w:hAnsi="Lusail+" w:cs="Lusail+"/><w:color w:val="A4012D"/><w:lang w:val="en-GB" w:bidi="ar-QA"/></w:rPr>';
/* يضع قيمة في عنصر تحكم (قائمة أو تاريخ) ويُلغي النص الإرشادي */
function aplSetSdt(sdt, text, iso) {
  let s = sdt.replace('<w:showingPlcHdr/>', '');
  if (iso) s = s.replace(/w:fullDate="[^"]*"/, `w:fullDate="${iso}T00:00:00Z"`);
  s = s.replace(/(<w:sdtContent>[\s\S]*?<w:p[ >][\s\S]*?<\/w:pPr>)([\s\S]*?)(<\/w:p>)/, (m, a, runs, c) => a + `<w:r>${APL_VAL_RPR}<w:t xml:space="preserve">${aplXEsc(text)}</w:t></w:r>` + c);
  return s;
}
async function aplDocx(dept) {
  const plan = aplPlanOf(dept); if (!plan || !plan.docx) return toast('لا يوجد ملف النموذج لخطة هذا القسم', 1);
  toast('جارٍ تجهيز ملف الخطة…');
  try {
    const JSZip = await aplJSZip();
    const buf = await fetch(encodeURI(plan.docx) + '?v=' + (window.MIZAN_V || '')).then(r => { if (!r.ok) throw new Error('تعذّر تحميل النموذج'); return r.arrayBuffer(); });
    const zip = await JSZip.loadAsync(buf);
    let x = await zip.file('word/document.xml').async('string');
    const done = aplDone(S.records, dept), items = {}; plan.doms.forEach(D => D.items.forEach(it => items[aplNorm(it.t)] = it));
    let n = 0;
    x = x.replace(/<w:tr[ >][\s\S]*?<\/w:tr>/g, row => {
      const parts = row.match(/<w:tc>[\s\S]*?<\/w:tc>|<w:sdt>[\s\S]*?<\/w:sdt>/g) || [];
      if (parts.length < 7) return row;
      const it = items[aplNorm(aplXText(parts[1]))]; if (!it) return row;
      const s = apsShow(dept, it, done); if (!s.st) return row;   // لا متابعة في الميزان: يبقى ما في الملف كما هو
      const stSdt = parts[5], dtSdt = parts[6];
      if (stSdt.indexOf('<w:comboBox>') < 0 && stSdt.indexOf('<w:dropDownList>') < 0) return row;
      const li = (stSdt.match(/<w:listItem [^>]*\/>/g) || []).map(l => (l.match(/w:displayText="([^"]*)"/) || [])[1]).filter(Boolean);
      const val = li.find(v => aplNorm(v) === aplNorm(s.st)) || s.st;
      let out = row.replace(stSdt, aplSetSdt(stSdt, val));
      const iso = s.date || (s.q1 ? '' : '');
      if (iso && dtSdt.indexOf('<w:date') >= 0) out = out.replace(dtSdt, aplSetSdt(dtSdt, iso.split('-').reverse().join('/'), iso));
      n++; return out;
    });
    zip.file('word/document.xml', x);
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `متابعة الخطة السنوية - ${dept} - ${today().split('-').reverse().join('-')}.docx`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast(`تم تجهيز الخطة على النموذج المعتمد (${n} إجراءً محدَّث المتابعة) ✓`);
  } catch (e) { toast('تعذّر تجهيز الملف: ' + e.message, 1); }
}

/* جملة التقرير الشهري: ما تحقق خلال الفترة مجمّعاً تحت بنده الأساسي، ثم نسبة ما تحقق من الخطة حتى نهاية الفترة */
function aplReport(recs, dept, P) {
  const plan = aplPlanOf(dept); if (!plan) return '';
  const inP_ = aplRecs(recs, dept).filter(r => r.date >= P.from && r.date <= P.to);
  if (!inP_.length) return '';
  const by = {}; inP_.sort((a, b) => a.date.localeCompare(b.date)).forEach(r => { (by[r.d.mid] = by[r.d.mid] || { t: r.d.main, L: [] }).L.push(r.d.ds.replace(/[.。]\s*$/, '')); });
  const st = aplStat(plan, aplDone(recs, dept, P.to));
  return 'من بنود الخطة السنوية للقسم: ' + Object.values(by).map(x => x.L.join('، و')).join('؛ و') + `. ونسبة ما تحقق من البنود الفرعية للخطة حتى نهاية الفترة ${st.pct}% (${st.ok} من ${st.all}).`;
}
