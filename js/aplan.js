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
  plan.doms.forEach(D => D.items.forEach(it => { const sb = it.subs || []; const n = sb.length, k = sb.filter(s => done[s.id] || s.once).length; all += n; ok += k; per[it.id] = { n, k }; }));
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
/* مفتاح حالات المتابعة (قائمة نموذج الوزارة) — يظهر في بداية الخطة على الشاشة وفي الطباعة */
const APS_KEY = { 'مكتمل': 'انتهى الإجراء كله ولن نرجع إليه هذا العام، مثل وضع الخطة السنوية، أو إجراء له مرة واحدة فقط، أو إجراء متكرر نُفّذت آخر مرة منه.', 'على المسار': 'الإجراء متكرر أو ممتد، ونفّذنا ما حلّ موعده منه، وبقيت له مرات قادمة (مثل الخطة العلاجية، وحصر الطالبات بعد كل اختبار).', 'متأخر': 'حلّ موعده ولم يُستكمل بعد، والتأخير بسيط يمكن تداركه قريبًا.', 'متأخر جداً': 'تجاوز موعده بفترة طويلة، ويحتاج إلى إجراء عاجل لإنجازه.', 'لم يبدأ': 'لم يحن موعد تنفيذه بعد.' };
const APS_HEX = { g: '#1F7A4D', o: '#D98A00', r: '#A4012D', n: '#6B7280', b: '#1E5AA8' };
const apsKeyHTML = pr => pr
  ? `<div style="border:1.2px solid #7A1F3D;border-radius:2mm;padding:1.6mm 2.6mm;margin:0 0 2.5mm;font-size:7.8pt;line-height:1.65;background:#FBF4F6"><b style="color:#7A1F3D;font-size:8.6pt">🔑 مفتاح المتابعة</b><br>` + ['مكتمل', 'على المسار', 'متأخر', 'متأخر جداً', 'لم يبدأ'].map(v => `<span style="white-space:nowrap"><i style="display:inline-block;width:2.6mm;height:2.6mm;border-radius:.6mm;background:${APS_HEX[APS_C[v]]};vertical-align:middle"></i> <b>${v}:</b></span> ${APS_KEY[v]}`).join(' &nbsp;·&nbsp; ') + `</div>`
  : `<div class="aps-key" style="border:2px solid #7A1F3D;border-radius:14px;padding:10px 14px;margin:10px 0 12px;font-size:13px;line-height:1.85;background:linear-gradient(180deg,#FFF8F1,#FBF4F6);box-shadow:0 2px 8px rgba(122,31,61,.08)"><div style="font-weight:800;color:#7A1F3D;font-size:15px;margin-bottom:4px">🔑 مفتاح المتابعة <small style="font-weight:400;color:#6B5A60;font-size:12px">— مرجعكِ في اختيار الحالة</small></div>` + ['مكتمل', 'على المسار', 'متأخر', 'متأخر جداً', 'لم يبدأ'].map(v => `<div><span style="display:inline-block;min-width:92px;text-align:center;border-radius:8px;padding:1px 8px;margin-inline-end:8px;background:${APS_HEX[APS_C[v]]};color:#fff;font-weight:700">${v}</span>${APS_KEY[v]}</div>`).join('') + `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #D9C4CB"><span style="display:inline-block;min-width:92px;text-align:center;border-radius:8px;padding:1px 8px;margin-inline-end:8px;background:#FCEADB;color:#8A4B12;font-weight:700;border:1px solid #E8B98A">برتقالي</span>بحاجة إلى قراركِ: لا يوجد تسجيل في المنصات يدل على حالته، فاختاري حالته بنفسكِ. · ⚙️ تلقائي: حُسبت الحالة من تسجيلات الميزان وسبع سنابل · ✍️ قراركِ: اخترتِها بنفسكِ.</div></div>`;
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
  const r = apsOf(dept, it.id); if (r) return { st: r.d.st, date: r.d.mo ? aplEndDay(r.d.mo) : r.date, set: 1 };
  const k = it.subs.filter(s => done[s.id] || s.once).length;
  if (k === it.subs.length) { const ds = it.subs.map(s => done[s.id] && done[s.id].date).filter(Boolean).sort(); return { st: 'مكتمل', date: ds.pop() || '', q1: it.subs.every(s => s.once) }; }
  if (k > it.subs.filter(s => s.once).length) { const ds = it.subs.map(s => done[s.id] && done[s.id].date).filter(Boolean).sort(); return { st: 'على المسار', date: ds.pop() || '' }; }
  return { st: '', date: '' };
}

/* ==================================================================
   متابعة الخطة السنوية شهرياً (نموذج الوزارة): لكل إجراء حالة تُحسب تلقائياً مما سجّلته المعلمات والمنسقة في الميزان وسبع سنابل،
   والمنسقة تراجع وتعدّل بنقرة. البرتقالي = بحاجة إلى قرار المنسقة. تُطبع الخطة على الترويسة بتوقيع المنسقة والنائب الأكاديمي.
   ================================================================== */
const APL_MONTHS = ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06'];
const APL_MN = k => (typeof MONTHS !== 'undefined' ? MONTHS : [])[+k.slice(5, 7) - 1] || k;
const aplEnd = k => { const [y, m] = k.split('-').map(Number); return k + '-' + String(new Date(y, m, 0).getDate()).padStart(2, '0'); };
const aplPrevM = k => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 2, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
/* الخطة المعتمدة للقسم: آخر نسخة عدّلتها المنسقة (APE)، وإلا الخطة المرفوعة */
const apeOf = dept => S.records.filter(r => r.dept === dept && r.item === 'APE' && r.d && r.d.doms).sort((a, b) => String(b.at || b.date).localeCompare(String(a.at || a.date)))[0];
const aplPlanCur = dept => { const e = apeOf(dept), b = aplPlanOf(dept); if (!e) return b; return Object.assign({}, b || {}, { doms: e.d.doms, edited: e.date }); };
const APL_LBL = { MT: 'اجتماع', V: 'زيارة صفية', LVV: 'زيارة قيادية', CP: 'إجراء للتوصيات المشتركة', PL: 'متابعة خطط', ACH: 'إنجاز', TACH: 'مشاركة طالبات', SRF: 'تعزيز طالبات', AC: 'نشاط', TA: 'نشاط معلمة', RA: 'إجراء رفع تحصيل', SAN: 'تحليل نتائج', SRQ: 'قراءة نتائج معتمدة', SFB: 'تغذية راجعة للطالبات', SAC: 'نشاط وتعلّم أقران', SEN: 'حصة إثرائية', TPA: 'تواصل مع ولي أمر', PA: 'تواصل مع ولي أمر', AS: 'تقييم', WS: 'ورشة', TWS: 'ورشة', EX: 'برنامج تدريبي', TPV: 'زيارة تبادلية', PV: 'زيارة تبادلية', TEX: 'فعالية تبادلية', LR: 'مصادر تعلم', IS: 'جلسة فردية' };
/* القواعد: نص الإجراء ← مصادر الأدلة ونوع المتابعة (once: مرة واحدة، cyc: بعد كل اختبار، rec: متكرر، man: يدوي، ev: تقييم الأداء) */
const APL_RULES = [
  [/إعداد الخط(ة|ط) (السنوية|الفصلية)|توزيع المهام|الاحتياجات التدريبية|إعداد قالب|وجود الخطط الفصلية|وجود نموذج التحضير|جاهزية المعمل|تعميم الأدلة|ذوات الميول|خطة التطوير المهني للقسم$/, ['PL', 'WS'], 'once'],
  [/تقييم أداء المعلم/, [], 'ev'],
  [/قراءة النتائج|قراءة نتائج|تحليل النتائج|تحليل نتائج|الأقل من|دون \(?70|تقارير كمية|إعادة بناء|إجراءات رفع التحصيل|منخفضات الأداء|قياس أثر|ربط نتائج الطالبات/, ['SRQ', 'SAN', 'RA', 'SFB'], 'cyc'],
  [/اجتماع/, ['MT'], 'rec'],
  [/الزيارات التبادلية|تبادل الزيارات|تبادل الخبرات/, ['TPV', 'PV', 'TEX'], 'rec'],
  [/زيارات? صفية|الزيارات الصفية|خطة الزيارات|تغذية راجعة تطويرية|التوصيات داخل الحصة|متابعة تنفيذ التوصيات|تنفيذ توصيات/, ['V', 'LVV', 'CP'], 'rec'],
  [/الخطط الفصلية|الخطط اليومية|خطط دروس|التغذية الراجعة على الخطط/, ['PL', 'V'], 'rec'],
  [/الحصص الإثرائية/, ['SEN'], 'rec'],
  [/أولياء الأمور|ولي الأمر/, ['TPA', 'PA'], 'rec'],
  [/موهوب|متفوق|فائق|المسابقات|مشاركة الطالبات|مشاركات الطالبات|تعزيز وتحفيز|رعاية/, ['ACH', 'TACH', 'SRF', 'AC', 'TA'], 'rec'],
  [/المتدني|الضعيفات|الضعاف|رفع التحصيل لطالبات|خطط دعم|المتعثرات|الواعدات|المرحلة الوقائية|التهيئة القبلية/, ['RA', 'SFB', 'SAC', 'SEN', 'SAN'], 'rec'],
  [/اختبار|تقويم قبلي|التقويم القبلي|تقييمات بنائية|التقييمات البنائية|أدوات تقييم|أعمال الطالبات|اللياقة/, ['AS'], 'rec'],
  [/مجتمعات تعلم|مجتمعات التعلم المهنية$|ورش تدريبية|ورش عمل|جلسات نقاشية|تطوير المهني على/, ['WS', 'TWS', 'MT'], 'rec'],
  [/البرامج التدريبية وتطبيق|شبكات التعلم/, ['EX', 'TWS'], 'rec'],
  [/خطط تحسين/, ['IS'], 'rec'],
  [/التعليم الإلكتروني|مصادر التعلم/, ['LR', 'V'], 'rec'],
  [/التعلم النشط|الأسئلة الصفية|الفروق الفردية|البيئة الصفية|الأنشطة الصفية|الأنشطة العملية|تنمية مهارات|مواءمة الأنشطة|إجراءات السلامة|البرامج الوقائية|الأنشطة الرياضية/, ['V', 'LVV'], 'rec'],
];
function aplRule(t) { for (const [re, src, ty] of APL_RULES) if (re.test(t)) return { src, ty }; return { src: [], ty: 'man' }; }
function aplEv(dept, src, from, to) { return S.records.filter(r => r.dept === dept && src.includes(r.item) && r.date && String(r.date).slice(0, 10) >= from && String(r.date).slice(0, 10) <= to && !(r.item === 'PL' && /السنوية/.test((r.d || {}).c || '') && false)); }
const aplEvTxt = L => { const c = {}; L.forEach(r => { const k = APL_LBL[r.item] || r.item; c[k] = (c[k] || 0) + 1; }); return Object.entries(c).map(([k, n]) => `${k} (${n})`).join('، '); };
/* الحالة التلقائية للإجراء في شهر معيّن */
function aplAuto(dept, it, mk) {
  const R = aplRule(it.t), start = '2026-08-30', mEnd = aplEnd(mk), mFrom = mk + '-01', due = it.due || '2027-05-31';
  const inM = aplEv(dept, R.src, mFrom, mEnd), last2 = aplEv(dept, R.src, aplPrevM(mk) + '-01', mEnd), ever = aplEv(dept, R.src, start, mEnd);
  const lastD = ever.map(r => String(r.date).slice(0, 10)).sort().pop() || '';
  const out = (st, need, ev, date) => ({ st, need: !!need, ev: ev || '', date: date || '' });
  if (R.ty === 'once') { if (ever.length || due <= mEnd) return out('مكتمل', 0, ever.length ? aplEvTxt(ever) : 'إجراء بداية العام', lastD || due); return out('على المسار', 0, '', ''); }
  if (R.ty === 'ev') return mk < '2027-02' ? out('لم يبدأ', 0, 'التقييم الأولي في الفصل الثاني', '') : out('على المسار', 1, 'تؤكد المنسقة رفع التقييم في النظام', '');
  if (R.ty === 'man') return mFrom > due ? out('مكتمل', 1, 'بحاجة إلى تأكيدكِ', '') : out('على المسار', 1, 'لا يوجد تسجيل يدل عليه في المنصات، فالقرار لكِ', '');
  /* مكتمل: انتهى الإجراء كله (آخر مرة منه في موعد انتهائه)، وعلى المسار: متكرر أو ممتد نُفّذ ما حلّ موعده وبقيت له مرات قادمة */
  const fin = mEnd >= due;
  if (R.ty === 'cyc') { if (last2.length) return out(fin ? 'مكتمل' : 'على المسار', 0, aplEvTxt(last2), lastD); if (mk < '2026-10') return out('لم يبدأ', 0, 'بعد أول اختبار', ''); if (ever.length) return out('على المسار', 0, 'آخر تنفيذ ' + dm(lastD) + ' — بانتظار نتائج الاختبار القادم', lastD); return out('متأخر', 1, 'لا يوجد تحليل أو حصر مسجّل بعد الاختبار', ''); }
  if (inM.length) return out(fin ? 'مكتمل' : 'على المسار', 0, aplEvTxt(inM), lastD);
  if (last2.length) return out('على المسار', 0, 'آخر تنفيذ ' + dm(lastD), lastD);
  if (mFrom > due) return ever.length ? out('مكتمل', 0, aplEvTxt(ever), lastD) : out('متأخر', 1, 'انتهى موعده ولا يوجد ما يثبت تنفيذه', '');
  if (mk <= '2026-09' && !ever.length) return out('على المسار', 1, 'لا يوجد تسجيل بعد', '');
  return out('متأخر', 1, ever.length ? 'آخر تنفيذ ' + dm(lastD) + ' — لا يوجد تسجيل منذ شهرين' : 'لا يوجد ما يثبت تنفيذه حتى الآن', '');
}
/* تاريخ المتابعة = آخر يوم عمل (الأحد–الخميس) في شهر المتابعة، أو في نهاية الفترة إن مُرّر تاريخ */
function aplEndDay(mk) {
  const d = mk.length > 7 ? new Date(mk + 'T12:00:00') : new Date(+mk.slice(0, 4), +mk.slice(5, 7), 0, 12);
  while (d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
/* قرار المنسقة لشهر معيّن يتقدّم على الحساب التلقائي */
const apsFor = (dept, mid, mk) => S.records.filter(r => r.dept === dept && r.item === 'APS' && r.d && r.d.mid === mid && (r.d.mo || String(r.date).slice(0, 7)) === mk).sort((a, b) => String(b.at || b.date).localeCompare(String(a.at || a.date)))[0];
function aplStatus(dept, it, mk) { const a = aplAuto(dept, it, mk), o = apsFor(dept, it.id, mk); return o ? Object.assign({}, a, { st: o.d.st, need: false, set: 1, date: o.d.date || o.date }) : a; }
const aplMonths = () => APL_MONTHS.filter(k => k <= today().slice(0, 7) || k === APL_MONTHS[0]);

function aplCard(dept) {
  const box = $('#aplC'); if (!box) return;
  const can = isAdmin() || S.user.role === 'coord';
  if (!aplPlanCur(dept)) { box.innerHTML = '<h2>✅ متابعة تنفيذ الخطة السنوية</h2><div class="empty" style="padding:8px 0">لم تُرفع خطة القسم بعد.</div>'; return; }
  const draw = () => {
    const plan = aplPlanCur(dept), mk = S.aplM && APL_MONTHS.includes(S.aplM) ? S.aplM : today().slice(0, 7);
    if (S.aplEd) return aplEditor(dept, plan, draw);
    let n = 0, ok = 0, okC = 0, need = 0;
    const rows = plan.doms.map(D => `<tr class="apl-dh"><td colspan="6"><b>${esc(D.d)}</b>${D.items.length ? '' : ' <small style="color:#B8521A">— لم تُحدَّد إجراءات في هذا المجال بعد، أضيفيها من «✏️ تعديل الخطة»</small>'}</td></tr>` + D.items.map(it => {
      const s = aplStatus(dept, it, mk); n++; if ((s.st === 'مكتمل' || s.st === 'على المسار') && !s.need) ok++; if (s.st === 'مكتمل') okC++; if (s.need) need++;
      return `<tr class="${s.need ? 'apl-need' : ''}"><td class="apl-a"><div>${esc(it.t)}</div>${s.ev ? `<div class="apl-ev">${s.set ? '✍️ قرار المنسقة' : '⚙️ تلقائي'} · ${esc(s.ev)}</div>` : ''}</td><td class="apl-by">${esc(it.by)}</td><td class="apl-due">${dmy(it.due)}</td><td class="apl-due" style="white-space:normal;max-width:140px">${esc(it.ev || '')}</td>
        <td class="apl-st">${APS_ST.map(v => `<button class="aps ${APS_C[v]}${s.st === v ? ' on' : ''}${s.st === v && !s.set ? ' auto' : ''}" data-st="${v}" data-mid="${it.id}" ${can ? '' : 'disabled'}>${v}</button>`).join('')}</td><td class="apl-dt">${s.st ? dm(aplEndDay(mk)) : '—'}</td></tr>`; }).join('')).join('');
    box.innerHTML = `<h2>✅ متابعة تنفيذ الخطة السنوية <span class="sub">تُحسب حالة كل إجراء تلقائياً مما سجّلته المعلمات وسجّلتِه في الميزان وسبع سنابل. راجعي ما ظهر بالبرتقالي فهو بحاجة إلى قراركِ، ويمكنكِ تغيير أي حالة بنقرة. الحفظ تلقائي.</span></h2>
      ${apsKeyHTML(0)}
      <div class="apl-mos">${aplMonths().map(k => `<button class="${k === mk ? 'on' : ''}" data-mo="${k}">${APL_MN(k)}</button>`).join('')}</div>
      <div class="apl-sum"><b>${n ? Math.round(ok / n * 100) : 0}%</b><div>${aplBar(ok, n)}<small>منجز وفق موعده ${ok} من ${n} إجراءً في شهر ${APL_MN(mk)} (مكتمل ${okC} · على المسار ${ok - okC})${need ? ` · <span style="color:#B8521A;font-weight:700">${need} بحاجة إلى قراركِ</span>` : ''}</small></div>
        <div class="apl-tools"><span id="aplSv" class="apl-sv">${aplBusy ? '… جارٍ الحفظ' : ''}</span>
        ${can ? '<button class="btn sm sec" id="aplEdB">✏️ تعديل الخطة</button>' : ''}<button class="btn sm" id="aplPr">🖨️ حفظ وطباعة الخطة (نموذج الوزارة)</button></div></div>
      <div class="apl-tw"><table class="apl-t"><thead><tr><th>الإجراءات والأنشطة الإشرافية والبرامج</th><th>المنفّذ</th><th>موعد الانتهاء</th><th>أدلة التنفيذ</th><th>المتابعة <small>(${APL_MN(mk)})</small></th><th>تاريخ المتابعة</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="apl-note">⚙️ تلقائي: حُسبت الحالة من التسجيلات · ✍️ قرار المنسقة: اخترتِها بنفسكِ. وتاريخ المتابعة هو آخر يوم عمل في شهر المتابعة.</div>`;
    $$('[data-mo]', box).forEach(b => b.onclick = () => { S.aplM = b.dataset.mo; draw(); });
    $('#aplPr', box).onclick = () => aplPrint(dept, mk);
    if ($('#aplEdB', box)) $('#aplEdB', box).onclick = () => { S.aplEd = 1; draw(); };
    $$('[data-st]', box).forEach(b => b.onclick = () => {
      const mid = b.dataset.mid, v = b.dataset.st, r = apsFor(dept, mid, mk), it = plan.doms.flatMap(D => D.items).find(i => i.id === mid);
      if (r && r.d.st === v) return;
      const rec = { dept, item: 'APS', date: today(), sum: `${it.t}: ${v}`.slice(0, 400), d: { mid, main: it.t, st: v, mo: mk, date: aplEndDay(mk) } };
      if (r) { Object.assign(r, { date: rec.date, sum: rec.sum, d: rec.d, at: new Date().toISOString() }); aplPush(async () => { const j = await API.call('save', { rec: Object.assign({}, rec, { id: r.real || r.id }) }); r.id = j.record.id; }); }
      else aplSave(rec);
      draw();
    });
  };
  draw();
}
/* تعديل الخطة: نص الإجراء والمنفّذ وموعد الانتهاء والأدلة، وإضافة إجراء أو حذفه — تُحفظ نسخة القسم (APE) */
function aplEditor(dept, plan, back) {
  const box = $('#aplC'); const P = JSON.parse(JSON.stringify(plan.doms));
  const html = () => `<h2>✏️ تعديل الخطة السنوية <span class="sub">عدّلي ما تحتاجينه ثم اضغطي «حفظ الخطة». المتابعة السابقة لا تتأثر.</span></h2>
    <div class="apl-tw"><table class="apl-t apl-ed"><thead><tr><th>الإجراءات والأنشطة الإشرافية والبرامج</th><th>المنفّذ</th><th>موعد الانتهاء</th><th>أدلة التنفيذ</th><th></th></tr></thead><tbody>
    ${P.map((D, di) => `<tr class="apl-dh"><td colspan="5"><b>${esc(D.d)}</b> <button class="btn sm ghost" data-add="${di}" type="button">+ إضافة إجراء</button></td></tr>` + D.items.map((it, ii) => `<tr>
      <td><textarea data-f="t" data-d="${di}" data-i="${ii}" rows="2">${esc(it.t)}</textarea></td><td><input data-f="by" data-d="${di}" data-i="${ii}" value="${esc(it.by)}"></td>
      <td><input type="date" data-f="due" data-d="${di}" data-i="${ii}" value="${esc(it.due || '')}"></td><td><input data-f="ev" data-d="${di}" data-i="${ii}" value="${esc(it.ev || '')}"></td>
      <td><button class="btn sm ghost" data-rm="${di}|${ii}" type="button" title="حذف">🗑️</button></td></tr>`).join('')).join('')}</tbody></table></div>
    <div class="apl-tools" style="margin-top:10px"><button class="btn" id="aplSvE">💾 حفظ الخطة</button><button class="btn sec" id="aplCx">إلغاء</button></div>`;
  const grab = () => $$('[data-f]', box).forEach(x => { P[x.dataset.d].items[x.dataset.i][x.dataset.f] = x.value.trim(); });
  const draw = () => { box.innerHTML = html();
    $$('[data-add]', box).forEach(b => b.onclick = () => { grab(); P[b.dataset.add].items.push({ id: 'n' + Date.now().toString(36), t: '', by: 'المنسقة', due: '2027-05-20', ev: '' }); draw(); });
    $$('[data-rm]', box).forEach(b => b.onclick = () => { grab(); const [di, ii] = b.dataset.rm.split('|'); if (!confirm('حذف هذا الإجراء من الخطة؟')) return; P[di].items.splice(ii, 1); draw(); });
    $('#aplCx', box).onclick = () => { S.aplEd = 0; back(); };
    $('#aplSvE', box).onclick = () => { grab(); P.forEach(D => D.items = D.items.filter(i => i.t)); const e = apeOf(dept);
      const rec = { dept, item: 'APE', date: today(), sum: 'تعديل الخطة السنوية للقسم', d: { doms: P } };
      if (e) { Object.assign(e, { date: rec.date, d: rec.d, at: new Date().toISOString() }); aplPush(async () => { const j = await API.call('save', { rec: Object.assign({}, rec, { id: e.real || e.id }) }); e.id = j.record.id; }); }
      else aplSave(rec);
      S.aplEd = 0; toast('تم حفظ الخطة ✓'); back(); };
  };
  draw();
}
/* الطباعة على الترويسة الأفقية وبنموذج الوزارة نفسه، وتاريخ المتابعة = تاريخ يوم الطباعة */
let APL_IMG = null;
async function aplImgs() { if (APL_IMG) return APL_IMG; const get = f => fetch('assets/' + f).then(r => r.blob()).then(b => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); })).catch(() => '');
  const [top, bot, mark] = await Promise.all(['lhl-top.jpg', 'lhl-bot.jpg', 'lhl-mark.jpg'].map(get)); return (APL_IMG = { top, bot, mark }); }
async function aplPrint(dept, mk) {
  /* تُفتح نافذة الطباعة فور الضغط (قبل جلب التواقيع والصور) حتى لا يحجبها المتصفح */
  const w = window.open('', '_blank'); if (!w) return toast('اسمحي بالنوافذ المنبثقة للطباعة', 1);
  try { w.document.write('<p style="font-family:sans-serif;text-align:center;margin-top:40vh">جارٍ تجهيز الخطة للطباعة…</p>'); } catch (e) {}
  const plan = aplPlanCur(dept), co = (S.coords || []).find(c => (c.dept || []).includes(dept)) || (S.user.role === 'coord' ? S.user : null);
  const coName = (co && co.name) || plan.co || '', t0 = aplEndDay(mk);
  let csig = '', vsig = '';
  try { if (co && co.id) csig = (await API.call('signature', { who: co.id })).data || ''; } catch (e) {}
  try { vsig = (await API.call('signature', { cheer: 1 })).data || ''; } catch (e) {}
  const rows = plan.doms.map(D => !D.items.length ? `<tr><td class="dm f l">${esc(D.d)}</td><td colspan="6" style="color:#888">لم تُحدَّد إجراءات في هذا المجال بعد</td></tr>` : D.items.map((it, i) => { const s = aplStatus(dept, it, mk);
    return `<tr>${`<td class="dm${i === 0 ? ' f' : ''}${i === D.items.length - 1 ? ' l' : ''}">${i === 0 ? esc(D.d) : ''}</td>`}<td class="ac">${esc(it.t)}</td><td>${esc(it.by)}</td><td>${dmy(it.due)}</td><td>${esc(it.ev || '')}</td><td class="st ${APS_C[s.st] || ''}">${esc(s.st)}</td><td>${dmy(t0)}</td></tr>`; }).join('')).join('');
  const sigBox = (ttl, nm, sg, big) => `<div class="sg"><div class="tt">${ttl}</div><div class="nm"><b>${esc(nm)}</b>${sg ? `<img src="${sg}" alt="">` : ''}</div></div>`;
  w.document.write('<p style="font-family:sans-serif;text-align:center;margin-top:40vh">جارٍ تجهيز الخطة للطباعة…</p>');
  const IMG = await aplImgs();
  w.document.open(); w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>الخطة السنوية لقسم ${esc(dept)} - متابعة ${dmy(t0)}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap"><style>
  @page{size:A4 landscape;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:Lusail,'IBM Plex Sans Arabic',sans-serif;color:#222}
  .pg{position:relative;width:297mm;min-height:210mm}.top{position:fixed;top:0;left:0;width:297mm}.bot{position:fixed;bottom:0;left:0;width:297mm}.mark{position:fixed;top:48mm;left:98mm;width:100mm;opacity:.5;z-index:-1}
  table.hold{width:100%;border-collapse:collapse}thead.sp td{height:40mm}tfoot.sp td{height:32mm}
  .in{padding:0 12mm}h1{text-align:center;font-size:15pt;color:#7A1F3D;margin:0 0 1mm}.sub{text-align:center;font-size:10.5pt;margin:0 0 3mm;color:#333}
  table.p{width:100%;border-collapse:collapse;font-size:8.6pt;line-height:1.45}table.p th{background:#7A1F3D;color:#fff;border:1px solid #7A1F3D;padding:2mm 1.5mm;font-size:9pt}
  table.p td{border:1px solid #B9A7AD;padding:1.4mm 1.5mm;text-align:center;vertical-align:middle;background:rgba(255,255,255,.88)}table.p td.ac{text-align:justify}table.p td.dm{font-weight:700;color:#7A1F3D;width:22mm;background:#FBF4F6;border-top:0;border-bottom:0}table.p td.dm.f{border-top:1px solid #B9A7AD}table.p td.dm.l{border-bottom:1px solid #B9A7AD}
  table.p tr{break-inside:avoid}td.st{font-weight:700;white-space:nowrap}td.st.b{background:#E4F3EA!important}td.st.g{background:#E6EEF8!important}td.st.o{background:#FCEADB!important}td.st.r{background:#F9E3E6!important}td.st.n{background:#F1F1F1!important}
  .note{font-size:8.6pt;margin-top:2mm;text-align:justify}.sigs{display:flex;justify-content:flex-end;margin-top:4mm;break-inside:avoid}.sgc{width:80mm;text-align:center}
  .sg{margin-bottom:2mm}.sg .tt{font-size:9.5pt;color:#555}.sg .nm{position:relative;display:inline-block;padding:7mm 0;min-width:60mm}.sg .nm b{position:relative;z-index:1;font-size:11pt}.sg img{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:24mm;max-width:62mm;object-fit:contain;opacity:.62;mix-blend-mode:multiply}
  .pr{font-size:8.5pt;color:#666;margin-top:1mm}@media screen{body{background:#eee}.pg{margin:0 auto;background:#fff}}</style></head><body>
  <img class="top" src="${IMG.top}"><img class="bot" src="${IMG.bot}"><img class="mark" src="${IMG.mark}">
  <div class="pg"><table class="hold"><thead class="sp"><tr><td></td></tr></thead><tfoot class="sp"><tr><td></td></tr></tfoot><tbody><tr><td><div class="in">
  <h1>الخطة السنوية لقسم ${esc(dept)}</h1><div class="sub">العام الأكاديمي 2026-2027م · مدرسة الشيماء الثانوية للبنات · المتابعة حتى تاريخ ${dmy(t0)}</div>
  ${apsKeyHTML(1)}
  <table class="p"><thead><tr><th>المجال</th><th>الإجراءات والأنشطة الإشرافية والبرامج</th><th>المنفّذ</th><th>موعد الانتهاء</th><th>أدلة التنفيذ</th><th>المتابعة</th><th>تاريخ المتابعة</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="note">يستخدم المنسق هذا النموذج في بداية العام الدراسي للتخطيط لجميع أعمال القسم، مع مراعاة الإيجاز والتركيز على الإجراءات الرئيسة، وتتم متابعة إجراءات الخطة شهرياً.<br>تعتمد الخطة من الموجه التربوي.</div>
  <div class="sigs"><div class="sgc">${sigBox('منسقة قسم ' + esc(dept), 'أ. ' + coName, csig)}${sigBox('النائبة الأكاديمية', 'أ. آسيا الذبياني', vsig)}<div class="pr">مديرة المدرسة: أ. شيخة الرميحي</div></div></div>
  </div></td></tr></tbody></table></div><script>window.onload=()=>setTimeout(()=>print(),600)<\/script></body></html>`);
  w.document.close();
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
  if (!inP_.length) {   // المتابعة الشهرية التلقائية: حالة إجراءات الخطة في آخر شهر من الفترة
    const pl = aplPlanCur(dept); if (!pl) return ''; const mk = (P.to < today() ? P.to : today()).slice(0, 7); const its = pl.doms.flatMap(D => D.items);
    const St = its.map(it => ({ it, s: aplStatus(dept, it, mk) })); const ok = St.filter(x => x.s.st === 'مكتمل').length, on = St.filter(x => x.s.st === 'على المسار').length, late = St.filter(x => /متأخر/.test(x.s.st));
    return `تمت متابعة إجراءات الخطة السنوية للقسم حتى شهر ${APL_MN(mk)}: مكتمل (${ok}) وعلى المسار (${on}) من أصل (${its.length}) إجراءً` + (late.length ? `، ومتأخر (${late.length}): ${late.slice(0, 4).map(x => '«' + x.it.t.replace(/\s*\(.*?\)/g, '').slice(0, 60) + '»').join('، ')}${late.length > 4 ? '، وغيرها' : ''}` : '') + '.';
  }
  const by = {}; inP_.sort((a, b) => a.date.localeCompare(b.date)).forEach(r => { (by[r.d.mid] = by[r.d.mid] || { t: r.d.main, L: [] }).L.push(r.d.ds.replace(/[.。]\s*$/, '')); });
  const st = aplStat(plan, aplDone(recs, dept, P.to));
  return 'من بنود الخطة السنوية للقسم: ' + Object.values(by).map(x => x.L.join('، و')).join('؛ و') + `. ونسبة ما تحقق من البنود الفرعية للخطة حتى نهاية الفترة ${st.pct}% (${st.ok} من ${st.all}).`;
}
