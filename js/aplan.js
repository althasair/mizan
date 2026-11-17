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

function aplCard(dept) {
  const box = $('#aplC'); if (!box) return;
  const plan = aplPlanOf(dept);
  if (!plan) { box.innerHTML = '<h2>✅ متابعة تنفيذ الخطة السنوية</h2><div class="empty" style="padding:8px 0">لم تُرتَّب بنود خطة القسم بعد. بعد رفع الخطة السنوية تُرتَّب بنودها هنا، فتختارين منها ما تحقق كل شهر.</div>'; return; }
  const can = isAdmin() || S.user.role === 'coord';
  const done = aplDone(S.records, dept), st = aplStat(plan, done);
  // البنود المتكررة (كالحصر بعد كل اختبار) تُسجَّل في كل شهر تتحقق فيه؛ «تحقق هذا الشهر» يُقفل البند للشهر الحالي فقط
  const mo = today().slice(0, 7), all = aplRecs(S.records, dept);
  const thisMo = {}, hist = {}; all.forEach(r => { (hist[r.d.sid] = hist[r.d.sid] || []).push(r); if ((r.date || '').slice(0, 7) === mo) thisMo[r.d.sid] = r; });
  const Q = aplQ(), QN = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع'][Q];
  S.aplD = S.aplD == null ? 0 : S.aplD;
  const D = plan.doms[S.aplD] || plan.doms[0];
  const act = D.items.filter(it => it.subs.some(x => aplActive(x, Q))), fin = D.items.filter(it => it.subs.every(x => x.once));
  if (!act.some(i => i.id === S.aplM)) S.aplM = act.length ? act[0].id : null;
  const M = act.find(i => i.id === S.aplM);
  const finHTML = fin.length ? `<details class="apl-fin"><summary>✔ بنود استُكملت في الربع الأول (${fin.length})</summary>${fin.map(it => `<div>${esc(it.t)}</div>`).join('')}</details>` : '';
  box.innerHTML = `<h2>✅ متابعة تنفيذ الخطة السنوية <span class="sub">بنود الربع ${QN} — اختاري المجال ثم البند الأساسي، وأشّري على ما تحقق من بنوده الفرعية؛ يكتمل البند الأساسي بتحقق فروعه كلها.</span></h2>
    <div class="apl-sum"><b>${st.pct}%</b><div>${aplBar(st.ok, st.all)}<small>تحقق ${st.ok} من ${st.all} بنداً فرعياً في خطة القسم</small></div></div>
    <div class="apl-doms">${plan.doms.map((x, i) => { const k = x.items.reduce((a, it) => a + st.per[it.id].k, 0), n = x.items.reduce((a, it) => a + st.per[it.id].n, 0);
      return `<button class="apl-dom${x === D ? ' on' : ''}" data-ad="${i}"><span>${esc(x.d)}</span>${aplBar(k, n)}<small>${k}/${n}</small></button>`; }).join('')}</div>
    <div class="form" style="margin-top:12px"><div class="fld wide"><label>البند الأساسي</label><select id="aplM">${act.map(it => `<option value="${it.id}" ${it.id === S.aplM ? 'selected' : ''}>${esc(it.t)} — ${st.per[it.id].k}/${st.per[it.id].n}</option>`).join('')}</select></div></div>
    ${finHTML}${!M ? `<div class="empty" style="padding:8px 0">لا توجد بنود لهذا المجال في الربع ${QN}.</div>` : `<div class="apl-main"><div>${aplChip(st.per[M.id].k, st.per[M.id].n)} <small>أشّري على ما تحقق هذا الشهر، والوصف بجانبه يظهر في التقرير الشهري ويمكنكِ تعديله · المنفّذ: ${esc(M.by)} · موعد الانتهاء: ${esc(M.due)}</small></div>
      ${M.subs.some(x => x.once) ? `<div class="apl-sub ok"><b>✔ استُكمل في الربع الأول:</b> <span class="apl-ds">${M.subs.filter(x => x.once).map(x => esc(x.t)).join('، ')}</span></div>` : ''}
      ${M.subs.filter(x => aplActive(x, Q)).map(s => { const r = thisMo[s.id], H = (hist[s.id] || []).filter(x => x !== r).sort((a, b) => a.date.localeCompare(b.date));
        return `<div class="apl-sub${r ? ' ok' : ''}">
          <label class="apl-chk"><input type="checkbox" data-as="${s.id}" ${r ? 'checked disabled' : ''} ${can ? '' : 'disabled'}> <b>${esc(s.t)}</b>${r ? ` <span class="chip ok">تحقق ${dm(r.date)}</span>` : ''}${H.length ? ` <small class="apl-h">سبق تحققه: ${H.map(x => dm(x.date)).join('، ')}</small>` : ''}</label>
          ${r ? `<div class="apl-ds">${esc(r.d.ds)}${can ? ` <button class="btn sm ghost" data-aun="${r.id}">إلغاء التحقق</button>` : ''}</div>`
              : `<textarea class="apl-ta" data-ads="${s.id}" rows="2" ${can ? '' : 'disabled'}>${esc(aplFill(s.ds, dept, today()))}</textarea>`}</div>`; }).join('')}
      ${can && M.subs.some(s => aplActive(s, Q) && !thisMo[s.id]) ? `<div class="row" style="gap:10px;align-items:center;margin-top:10px"><label style="font-size:13px">تاريخ التحقق</label><input type="date" id="aplDt" value="${today()}" style="max-width:170px"><button class="btn" id="aplSave">حفظ ما تحقق</button></div>` : ''}
    </div>`}`;
  $$('[data-ad]', box).forEach(b => b.onclick = () => { S.aplD = +b.dataset.ad; S.aplM = null; aplCard(dept); });
  if ($('#aplM', box)) $('#aplM', box).onchange = e => { S.aplM = e.target.value; aplCard(dept); };
  $$('.apl-ta', box).forEach(t => t.oninput = () => { t.dataset.ed = 1; const c = $(`[data-as="${t.dataset.ads}"]`, box); if (c && !c.checked) c.checked = true; });
  if ($('#aplDt', box)) $('#aplDt', box).onchange = e => { const dt = e.target.value || today(); $$('.apl-ta', box).forEach(t => { if (t.dataset.ed) return; const s = M.subs.find(x => x.id === t.dataset.ads); t.value = aplFill(s.ds, dept, dt); }); };
  if ($('#aplSave', box)) $('#aplSave', box).onclick = async () => {
    const pick = M.subs.filter(s => aplActive(s, Q) && !thisMo[s.id] && $(`[data-as="${s.id}"]`, box).checked);
    if (!pick.length) return toast('أشّري على البند الفرعي الذي تحقق', 1);
    const date = $('#aplDt', box).value || today();
    for (const s of pick) {
      const ds = ($(`[data-ads="${s.id}"]`, box).value || aplFill(s.ds, dept, date)).trim();
      const d = { dom: D.d, mid: M.id, main: M.t, sid: s.id, sub: s.t, st: 'تحقق', ds, date };
      const j = await call('save', { rec: { dept, item: 'APL', date, sum: (s.t + ': ' + ds).slice(0, 400), d } });
      S.records.push(j.record);
    }
    toast(pick.length > 1 ? `تم حفظ ${pick.length} بنود فرعية ✓` : 'تم الحفظ ✓'); aplCard(dept);
  };
  $$('[data-aun]', box).forEach(b => b.onclick = async () => { if (!confirm('إلغاء تحقق هذا البند الفرعي؟')) return; await call('delete', { id: b.dataset.aun }); S.records = S.records.filter(x => x.id !== b.dataset.aun); toast('تم الإلغاء'); aplCard(dept); });
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
