/* الميزان — واجهة المعلمة (برقمها السري): الفترة الحالية تلقائياً، وخمسة تبويبات فقط
   الزيارات التبادلية · الورش وتطوير الزملاء · التواصل مع أولياء الأمور · الإنجازات والمشاركات · الأنشطة والمبادرات */
'use strict';

const TPV_WHY = ['حاجة مهنية بتوجيه من المنسقة', 'تطوير ذاتي بمبادرة مني'];
const TPV_PICK = ['إجادتها تفعيل استراتيجيات التعلم النشط', 'مراعاتها الفروق الفردية وتمايز المهام', 'إجادتها توظيف التكنولوجيا الحديثة', 'تميّزها في التقويم البنائي والتحقق من الفهم', 'تميّز أساليب التعزيز والتحفيز لديها', 'حسن تنظيم المجموعات وتوزيع الأدوار', 'إدارتها الصفية الهادئة وضبط السلوك', 'علاقتها الطيبة بالطالبات ومحبتهن لها', 'صياغتها أسئلة صفية مثيرة للتفكير', 'إدارتها زمن الحصة والانتقال بين الأنشطة', 'دمجها القيم وربط الدرس بالحياة', 'تكاملها مع المواد الأخرى', 'توظيفها مصادر التعلم والوسائل', 'تنميتها مهارات التفكير العليا', 'تقديمها تغذية راجعة فعّالة', 'تميّز تهيئة الدرس وغلقه', 'توصية المنسقة بحضور درسها'];
const TPV_SAW = ['تهيئة مشوّقة ومرتبطة بالهدف', 'استراتيجية تعلم نشط جديدة', 'أسئلة متدرجة ومثيرة للتفكير', 'توظيف أداة تقنية أو تطبيق إلكتروني', 'أسلوب تعزيز وتحفيز مبتكر', 'تنظيم المجموعات وتوزيع الأدوار بوضوح', 'مهام متمايزة تراعي الفروق الفردية', 'أساليب تقويم بنائي سريعة', 'تغذية راجعة فورية ومحددة', 'إشراك جميع الطالبات في الحصة', 'ربط الدرس بالحياة والقيم', 'إدارة صفية هادئة وفعالة', 'استثمار زمن الحصة', 'غلق الدرس وتلخيصه بمشاركة الطالبات', 'بيئة صفية إيجابية وآمنة'];
const TPV_HOW = ['مباشرة', 'بعد تكييفه', 'يصعب تطبيقه'];
const TPV_HARD = ['لا يخدم طبيعة مادتي', 'لا يناسب مستوى طالباتي أو أعدادهن', 'يحتاج أدوات أو تقنيات غير متوفرة', 'يحتاج زمناً أطول من زمن الحصة'];
const TWS_ROLE = ['حضرتُ ورشة داخلية', 'حضرتُ ورشة خارجية', 'قدّمتُ لتطوير الزملاء'];
const TWS_TYPE = ['ورشة', 'جلسة نقاش', 'درس تطبيقي أو نموذجي', 'ورقة عمل', 'نموذج مميز', 'فكرة أو ممارسة', 'مجتمع تعلم مهني'];
const TPA_WAY = ['اتصال هاتفي', 'رسالة نصية أو واتساب', 'رسالة صوتية بالأهداف التعليمية', 'رسالة شكر', 'دعوة لحضور درس معايشة', 'مشاركة ولي الأمر في حصة', 'دعوة ولي الأمر لتقديم ورشة', 'حضور فعالية أو اجتماع في المدرسة', 'اجتماع فردي في المدرسة', 'عبر نظام قطر للتعليم'];
const TPA_CAT = ['أكاديمي', 'سلوكي', 'المشاركة في الأنشطة', 'مشاركة ولي الأمر', 'الشكر والتعزيز'];
const TPA_TOP = {
  'أكاديمي': ['متابعة المستوى الأكاديمي', 'تدنٍّ في نتيجة تقييم أو اختبار', 'خطة دعم قبل الاختبار', 'عدم حل الواجبات', 'عدم إحضار الكتب والأدوات', 'الدعوة للحصص الإثرائية أو الساعات المكتبية', 'تحسّن ملحوظ في المستوى'],
  'سلوكي': ['مخالفة سلوكية', 'الغياب والتأخر', 'عدم الالتزام بالزي المدرسي', 'استخدام الهاتف في الحصة', 'تحسّن في السلوك'],
  'المشاركة في الأنشطة': ['دعوة الطالبة لمسابقة أو نشاط', 'متابعة مشاركة الطالبة في نشاط', 'إبلاغ بنتيجة مشاركة الطالبة'],
  'مشاركة ولي الأمر': ['دعوة لحضور درس معايشة', 'دعوة للمشاركة في حصة', 'دعوة لتقديم ورشة', 'دعوة لفعالية أو اجتماع', 'رسالة صوتية بالأهداف التعليمية للوحدة'],
  'الشكر والتعزيز': ['شكر على تميّز الطالبة', 'شكر على تعاون ولي الأمر', 'تكريم الطالبة', 'تحسّن ملحوظ في مستوى الطالبة أو سلوكها'],
};
const TPA_RCOM = ['أبدى ولي الأمر تجاوباً جزئياً', 'لم يُبدِ ولي الأمر تعاوناً', 'لا يوجد رد من ولي الأمر', 'رقم التواصل غير صحيح أو مغلق'];
const TPA_RESC = {
  'أكاديمي': ['ولي الأمر متعاون، وتعهّد بمتابعة الطالبة', 'تم الاتفاق على خطة متابعة مشتركة بين المعلمة وولي الأمر', 'تعهّد ولي الأمر بمتابعة الواجبات والمذاكرة اليومية', 'تعهّد ولي الأمر بإحضار الطالبة أدواتها وكتبها', 'تعهّد ولي الأمر بحضور الطالبة الحصص الإثرائية أو الساعات المكتبية', 'طلب ولي الأمر تقريراً دورياً عن مستوى الطالبة', 'تم تحديد موعد لمقابلة ولي الأمر في المدرسة', 'أبدى ولي الأمر تجاوباً، وظهر تحسّن على الطالبة'],
  'سلوكي': ['تم إبلاغ ولي الأمر بمخالفة سلوكية', 'تم إبلاغ ولي الأمر بتكرار الغياب أو التأخر', 'تعهّد ولي الأمر بمتابعة سلوك الطالبة والتزامها', 'تعهّد ولي الأمر بالتزام الطالبة بالحضور وعدم الغياب', 'تمت إحالة الحالة إلى الأخصائية الاجتماعية أو النفسية', 'تم تحديد موعد لمقابلة ولي الأمر في المدرسة', 'أبدى ولي الأمر تجاوباً، وظهر تحسّن على الطالبة'],
  'المشاركة في الأنشطة': ['وافق ولي الأمر على مشاركة الطالبة ودعمها', 'اعتذر ولي الأمر عن مشاركة الطالبة', 'أبدى ولي الأمر شكره ورضاه'],
  'مشاركة ولي الأمر': ['حضر ولي الأمر وشارك', 'قبل ولي الأمر الدعوة وحُدّد موعد', 'قدّم ولي الأمر ورشة أو مشاركة للطالبات', 'اعتذر ولي الأمر عن الحضور'],
  'الشكر والتعزيز': ['أبدى ولي الأمر شكره ورضاه عن متابعة المعلمة', 'تم إبلاغ ولي الأمر بتميّز الطالبة وتكريمها'],
};
const paTopOf = c => TPA_TOP[c] || [].concat(...Object.values(TPA_TOP));
const paResOf = c => (TPA_RESC[c] || [].concat(...Object.values(TPA_RESC))).concat(TPA_RCOM);
const TPA_TOPIC = paTopOf(''), TPA_RES = paResOf('');
const TACH_KIND = ['مشاركة', 'إنجاز (مركز أو جائزة)'];
const TACH_LVL = ['على مستوى المدرسة', 'على مستوى الدولة', 'دولي'];
const TA_TG = ['طالبات الصف العاشر', 'طالبات الصف الحادي عشر', 'طالبات الصف الثاني عشر', 'جميع الطالبات', 'طالبات شعبتي', 'الطالبات الواعدات', 'الموهوبات والمتفوقات', 'أولياء الأمور', 'المعلمات'];

(() => { const st = document.createElement('style'); st.textContent = '.multi label,#stuPanel label,.tradio label{display:flex!important;align-items:center;gap:6px;font-weight:400!important;font-size:12.5px}.multi input[type=checkbox],#stuPanel input[type=checkbox],.tradio input[type=radio]{width:auto!important;margin:0;flex:none}.multi,#stuPanel{text-align:right}'; document.head.appendChild(st); })();
/* الفترة الحالية حسب التاريخ: تدخل المعلمة عليها مباشرة */
function curPer() { const t = today(); return S.periods.find(p => t >= p.from && t <= p.to) || [...S.periods].reverse().find(p => p.from <= t) || S.periods[0]; }
const mine = it => S.records.filter(r => r.item === it && r.d && r.d.t === S.user.name).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const inCur = r => inP(r.date, curPer());
const others = () => ((S.staffAll && S.staffAll.length) ? S.staffAll : (S.staff || [])).filter(s => s.name && s.name !== S.user.name);
const listTxt = a => (Array.isArray(a) ? a : [a]).filter(Boolean).join('، ');

function T_navHTML() {
  const it = (v, t, ic, n) => `<a class="it ${S.view === v ? 'on' : ''}" data-v="${v}">${ICON[ic] || ICON.dot}<span>${t}</span>${n ? `<span class="n">${n}</span>` : ''}</a>`;
  const n = k => mine(k).filter(inCur).length;
  return `${it('home', 'الرئيسية', 'home')}<div class="grp">سجلّي — ${esc(curPer().name)}</div>${it('t_pv', 'الزيارات التبادلية', 'scale', n('TPV'))}${it('t_ws', 'الورش وتطوير الزملاء', 'doc', n('TWS'))}${it('t_pa', 'التواصل مع أولياء الأمور', 'user', n('TPA'))}${it('t_ach', 'الإنجازات والمشاركات', 'star', n('TACH'))}${it('t_act', 'الأنشطة والبرامج والمبادرات', 'cal', n('TA'))}${it('t_tas', 'التكليفات والأعباء الوظيفية', 'doc', n('TAS'))}${it('t_ds', 'الانضباط الوظيفي', 'scale', n('TDS'))}`;
}

function T_home(el) {
  const p = curPer(); setTitle('الرئيسية');
  const hosted = S.records.filter(r => r.item === 'TPV' && r.d.v === S.user.name && inCur(r));
  const att = S.records.filter(r => r.item === 'TWS' && r.d.by === S.user.name && r.d.t !== S.user.name && inCur(r));
  el.innerHTML = `
  <div class="hero"><div class="pat pattern"></div><h2>أهلاً أ. ${esc(S.user.name)}</h2><p>${esc(p.name)} (من ${dmy(p.from)} إلى ${dmy(p.to)}) — كل ما تسجّلينه يُحفظ في هذه الفترة، ويظهر في تقرير قسمكِ تلقائياً.</p></div>
  <div class="grid g4">
    ${kpi('زياراتي التبادلية', mine('TPV').filter(inCur).length, 'المطلوب زيارة إلى زيارتين شهرياً', 'var(--maroon)')}
    ${kpi('توظيف جوانب تميزي', hosted.length + att.length + mine('TWS').filter(r => r.d.role === TWS_ROLE[2] && inCur(r)).length, 'زيارات استضفتُها وما قدّمتُه للزميلات', 'var(--tiffany-d)')}
    ${kpi('التواصل مع أولياء الأمور', mine('TPA').filter(inCur).reduce((a, r) => a + (+r.d.n || 1), 0), 'ولي أمر في الفترة', 'var(--navy)')}
    ${kpi('أنشطتي ومبادراتي', mine('TA').filter(inCur).length, 'في الفترة', 'var(--gold)')}
  </div>
  <div class="grid g2" style="margin-top:14px">${[['t_pv', 'الزيارات التبادلية', 'سجّلي زيارتكِ لزميلة: لماذا اخترتِها، وما استفدتِه، وما ستطبقينه.'], ['t_pa', 'التواصل مع أولياء الأمور', 'اختاري الطالبة فيظهر رقم ولي أمرها، ثم الغرض ووسيلة التواصل والنتيجة.'], ['t_ws', 'الورش وتطوير الزملاء', 'ما حضرتِه من ورش داخلية وخارجية، وما قدّمتِه لزميلاتكِ.'], ['t_ach', 'الإنجازات والمشاركات', 'مشاركات طالباتكِ ومراكزهن في المسابقات.'], ['t_act', 'الأنشطة والبرامج والمبادرات', 'برنامج أو مشروع أو نشاط أو مبادرة: مدته، وعدد الطالبات، وأثره، والأولوية التي يخدمها.'], ['t_tas', 'التكليفات والأعباء الوظيفية', 'ما كُلّفتِ به من ملفات ومهام وأعباء: اختاري من القائمة أو اكتبي بعباراتكِ.'], ['t_ds', 'الانضباط الوظيفي', 'غياباتكِ واستئذاناتكِ في الشهر، مع حساب ساعات الاستئذان الشخصي.']].map(([v, t, s]) => `<div class="card" style="cursor:pointer" data-go="${v}"><h2>${esc(t)}</h2><p style="color:var(--muted);margin:0">${esc(s)}</p></div>`).join('')}</div>`;
  $$('[data-go]', el).forEach(c => c.onclick = () => { S.view = c.dataset.go; S.edit = 'new'; refresh(); });
}

/* ربط كل بند بمجال تقييم أداء المعلمة: n رقم المعيار (يُضاف من نموذج التقييم المعتمد)، d المجال */
const TSTD = {
  TPV: { n: '5.1.1 · 5.4.1', d: 'التأمل في الممارسة المهنية، وتطبيق الخبرات المكتسبة من التطوير المهني' },
  TWS: { n: '5.3 · 5.4 · 5.2.1', d: 'مواكبة المستجدات، وإظهار أثر التطوير المهني، والمساهمة في شبكات التعلم المهنية بتمكين الزميلات' },
  TPA: { n: '6.1.1 · 6.1.2', d: 'التواصل بفاعلية مع أولياء الأمور، وإشراكهم في دعم تعلم الطالبة ورفع تحصيلها' },
  TACH: { n: '2.6 · 6.3', d: 'تطوير مهارات التفكير العليا لدى الطالبات، وإعدادهن مواطنات فاعلات محلياً ودولياً' },
  TA: { n: '2.2 · 2.7.1 · 5.5.2', d: 'استخدام أنشطة متنوعة، وإثراء المنهج بأنشطة إضافية، وإظهار المبادرة بأدوار قيادية' },
  TAS: { n: '5.5.1 · 7.1.2 · 7.2', d: 'إنجاز المهام الموكلة على النحو المطلوب، وتحمّل المسؤولية تجاهها، والالتزام بالمسؤوليات الإدارية والفنية' },
  TDS: { n: '7.6.1 · 7.6.3', d: 'الالتزام بأوقات الحضور والانصراف، وبحضور الاجتماعات والدورات في مواعيدها' }
};
/* معيار كل نوع من أنواع الأنشطة */
const TA_STD = { 'برنامج': ['2.2 · 2.7.1', 'تنوع الأنشطة وإثراء المنهج'], 'مشروع': ['2.2 · 2.7.1', 'تنوع الأنشطة وإثراء المنهج'], 'نشاط': ['2.2 · 2.7.1', 'تنوع الأنشطة وإثراء المنهج'], 'مبادرة': ['5.5.2', 'إظهار المبادرة وأخذ أدوار قيادية بمبادرات إضافية'], 'مسابقة': ['2.6 · 6.3', 'تطوير مهارات التفكير العليا، وإعداد الطالبات مواطنات فاعلات'] };
const stdLine = it => { const x = TSTD[it]; return x ? `<div class="tstd"><b>${esc(x.n)}</b> · <span>يدخل هذا البند في تقييم أدائكِ: ${esc(x.d)}</span></div>` : ''; };

/* ---------- محرك نماذج بسيط ---------- */
const fSel = (n, opts, v, ph) => `<select data-n="${n}"><option value="">${esc(ph || 'اختاري…')}</option>${opts.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
const fCombo = (n, opts, v, ph) => `<input data-n="${n}" list="dl_${n}" value="${esc(v || '')}" placeholder="${esc(ph || 'اختاري من القائمة أو اكتبي')}"><datalist id="dl_${n}">${opts.map(o => `<option value="${esc(o)}">`).join('')}</datalist>`;
const fMulti = (n, opts, v) => { const cur = Array.isArray(v) ? v : (v ? [v] : []); const extra = cur.filter(x => !opts.includes(x));
  return `<div class="multi" data-m="${n}" style="border:1px solid var(--line);border-radius:12px;padding:6px 10px;max-height:170px;overflow:auto;font-size:12px;line-height:1.9">${opts.map(o => `<label style="display:block"><input type="checkbox" value="${esc(o)}" ${cur.includes(o) ? 'checked' : ''}> ${esc(o)}</label>`).join('')}<input data-mx="${n}" value="${esc(extra.join('، '))}" placeholder="أخرى (اكتبي)" style="width:100%;margin-top:4px;font-size:12px"></div>`; };
const fRadio = (n, opts, v) => `<div class="row tradio" style="gap:14px;font-size:13px">${opts.map(o => `<label><input type="radio" name="r_${n}" value="${esc(o)}" ${o === v ? 'checked' : ''}> ${esc(o)}</label>`).join('')}</div>`;
const staffSel = (n, v) => { const by = {}, co = {}; others().forEach(s => { by[s.dept] = by[s.dept] || []; if (!by[s.dept].includes(s.name)) by[s.dept].push(s.name); if (s.role === 'منسقة') co[s.name] = 1; });
  const ord = L => L.sort((a, b) => (co[b] ? 1 : 0) - (co[a] ? 1 : 0) || a.localeCompare(b, 'ar'));
  return `<select data-n="${n}"><option value="">اختاري المعلمة أو المنسقة…</option>${Object.keys(by).sort((a, b) => a.localeCompare(b, 'ar')).map(dp => `<optgroup label="${esc(dp)}">${ord(by[dp]).map(x => `<option value="${esc(x)}" ${x === v ? 'selected' : ''}>${esc(x)}${co[x] ? ' (منسقة القسم)' : ''}</option>`).join('')}</optgroup>`).join('')}</select>`; };
function readT(form) {
  const r = readForm(form);
  $$('[data-m]', form).forEach(m => { const L = $$('input[type=checkbox]', m).filter(c => c.checked).map(c => c.value); const x = ($(`[data-mx="${m.dataset.m}"]`, m).value || '').split(/[،,]/).map(s => s.trim()).filter(Boolean); r[m.dataset.m] = [...L, ...x]; });
  $$('input[type=radio]:checked', form).forEach(i => r[i.name.slice(2)] = i.value);
  return r;
}
const fld = (h, inner, w) => `<div class="fld${w ? '" style="grid-column:1/-1' : ''}"><label>${h}</label>${inner}</div>`;
async function fileToData(f) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(f); }); }

/* قائمة + نموذج لكل بند */
function T_page(el, cfg) {
  const p = curPer(); setTitle(cfg.title);
  const L = mine(cfg.item); const cur = L.filter(inCur);
  const rec = S.edit && S.edit !== 'new' ? L.find(r => r.id === S.edit) : null;
  const d = rec ? JSON.parse(JSON.stringify(rec.d)) : (S.tDraft ? S.tDraft : Object.assign({ date: today() }, cfg.blank || {})); S.tDraft = null;
  const form = S.edit ? `<div class="card"><h2>${rec ? 'تعديل' : 'تسجيل'} — ${esc(cfg.one)}</h2><form class="form" id="tf" onsubmit="return false">${cfg.form(d)}
     ${cfg.noDate ? `<input type="hidden" data-n="date" value="${esc(d.date || today())}">` : fld(cfg.dateLbl || 'التاريخ', `<input type="date" data-n="date" value="${esc(d.date || today())}" min="${p.from}" max="${p.to}" required>`)}
     <div class="actions" style="grid-column:1/-1"><button class="btn" id="tsave">حفظ</button>${cfg.copyBtn ? `<button class="btn sec" type="button" id="tsavec">${esc(cfg.copyBtn)}</button>` : ''}${rec && cfg.item !== 'TA' ? '<button class="btn ghost" type="button" id="tdel">حذف</button>' : ''}<button class="btn sec" type="button" id="tcx">إلغاء</button></div></form></div>` : '';
  el.innerHTML = `${cfg.top ? cfg.top() : ''}<div class="tins">${esc(cfg.note || '')}<span class="tper">التسجيل متاح في الفترة الحالية فقط: ${esc(p.name)} (${dmy(p.from)} – ${dmy(p.to)}).</span>${stdLine(cfg.item)}</div>${form}
  <div class="card"><div class="row"><h2 style="margin:0">${esc(cfg.title)} — ${esc(p.name)} (${cur.length})</h2><span class="sp"></span>${cfg.actions || ''}${S.edit ? '' : '<button class="btn" id="tnew">+ تسجيل جديد</button>'}</div>
  <div class="tbl" style="margin-top:10px"><table class="t">${cfg.head}${cur.map(r => `<tr>${cfg.row(r)}<td style="white-space:nowrap"><button class="btn sm sec" data-e="${r.id}">فتح</button>${cfg.item !== 'TA' ? ` <button class="btn sm ghost" data-del="${r.id}" title="حذف" style="color:#A33">🗑 حذف</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="9"><div class="empty">لا توجد سجلات في هذه الفترة بعد</div></td></tr>`}</table></div></div>${cfg.bottom ? cfg.bottom() : ''}`;
  if (cfg.top) fillVps(el);
  if ($('#tnew')) $('#tnew').onclick = () => { S.edit = 'new'; show(); };
  $$('[data-e]', el).forEach(b => b.onclick = () => { S.edit = b.dataset.e; show(); window.scrollTo(0, 0); });
  if (cfg.bind) cfg.bind(el, d);
  $$('[data-del]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف هذا السجل؟')) return; b.disabled = true; try { await call('delete', { id: b.dataset.del }); S.records = S.records.filter(x => x.id !== b.dataset.del); toast('تم الحذف ✓'); } catch (e) { b.disabled = false; return; } if (S.edit === b.dataset.del) S.edit = null; show(); });
  if ($('#tcx')) $('#tcx').onclick = () => { S.edit = null; show(); };
  if ($('#tdel')) $('#tdel').onclick = async () => { if (!confirm('حذف هذا السجل؟')) return; await call('delete', { id: rec.id }); S.records = S.records.filter(x => x.id !== rec.id); S.edit = null; refresh(); };
  const doSave = async (copy) => {
    const f = $('#tf'); const r = Object.assign({}, d, readT(f));
    if (cfg.files) for (const k of cfg.files) { const inp = $(`[data-file="${k}"]`, f); if (inp && inp.files[0]) { const fl = inp.files[0]; if (fl.size > 8e6) return toast('حجم الملف أكبر من 8 ميجابايت', 1); const j = await call('upload', { name: fl.name, data: await fileToData(fl) }); r[k] = { fid: j.fid, name: j.name }; } }
    if (cfg.pre) cfg.pre(r, f);
    const err = cfg.check ? cfg.check(r) : ''; if (err) return toast(err, 1);
    if (!r.date || r.date < p.from || r.date > p.to) return toast('التاريخ يجب أن يكون ضمن ' + p.name, 1);
    const j = await call('save', { rec: { id: rec && rec.id, dept: S.user.dept[0], item: cfg.item, date: r.date, sum: cfg.sum(r), d: r } });
    const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record);
    if (copy) { S.edit = null; refresh(); paCopy(r); return; }
    S.edit = null; toast('تم الحفظ ✓ — ويظهر في تقرير القسم'); refresh();
    if (cfg.item === 'TA' && !rec) taCelebrate(mine('TA').filter(inCur).length, r.kind);
    if (cfg.item === 'TPV' && !rec) { const n = mine('TPV').filter(x => monthOf(x.date) === monthOf(r.date)).length; const h = pvCheer(n); if (h) { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="box" style="max-width:520px">${h}<div class="row" style="margin-top:10px"><button class="btn" id="cOk">شكراً</button></div></div>`; document.body.appendChild(m); fillVps(m); chime(n >= 3); $('#cOk', m).onclick = () => m.remove(); } }
  };
  if ($('#tsave')) $('#tsave').onclick = () => doSave(false);
  if ($('#tsavec')) $('#tsavec').onclick = () => doSave(true);
}
const fileLink = f => f && f.fid ? `<button class="btn sm ghost" data-fid="${esc(f.fid)}">${esc(f.name || 'ملف')}</button>` : '';
document.addEventListener('click', async e => { const b = e.target.closest && e.target.closest('[data-fid]'); if (!b) return; e.preventDefault(); const j = await call('file', { fid: b.dataset.fid }); const a = document.createElement('a'); a.href = j.data; a.download = j.name; a.click(); });

/* ================================================================== الزيارات التبادلية */
const monthOf = d => String(d || '').slice(0, 7);
function pvCheer(n) {
  const nm = 'أ. ' + esc(S.user.name);
  if (n >= 3) return `<div class="card pv-cheer" style="background:linear-gradient(90deg,#FFF8E6,#fff);border-inline-start:4px solid var(--gold)"><div style="font-size:22px;color:var(--gold);letter-spacing:4px">★★★ 💛</div><p style="margin:4px 0 0;text-align:justify;font-weight:600">${nm}، حرصكِ المتجدد على التعلّم من زميلاتكِ شاهدٌ على همّةٍ لا ترضى بما دون الكمال، وهذا ديدنكِ. فخورةٌ بكِ.</p>${vpSignLine()}</div>`;
  if (n === 2) return `<div class="card pv-cheer" style="background:linear-gradient(90deg,#FFF8E6,#fff);border-inline-start:4px solid var(--gold)"><div style="font-size:20px;color:var(--gold);letter-spacing:4px">★★</div><p style="margin:4px 0 0;text-align:justify;font-weight:600">${nm}، زيارتكِ الثانية تنبئ عن شغفٍ صادقٍ بالتعلّم المستمر؛ ومن جعل التعلّم دأبه ارتقى وارتقت به طالباته.</p>${vpSignLine()}</div>`;
  if (n === 1) return `<div class="card pv-cheer" style="background:linear-gradient(90deg,#FFF8E6,#fff);border-inline-start:4px solid var(--gold)"><div style="font-size:18px;color:var(--gold)">★</div><p style="margin:4px 0 0;text-align:justify;font-weight:600">${nm}، شكرٌ موصولٌ لكِ؛ فتبادل الخبرات أقصر الطرق إلى إتقان الصنعة.</p>${vpSignLine()}</div>`;
  return '';
}
function T_pv(el) {
  T_page(el, {
    item: 'TPV', title: 'الزيارات التبادلية', one: 'زيارة تبادلية', top: () => pvCheer(mine('TPV').filter(r => monthOf(r.date) === monthOf(today())).length), note: 'معلمتي الغالية، اضغطي «تسجيل جديد»، ثم اختاري الزميلة التي زرتِها، وسبب اختياركِ لها، وما استفدتِه، وما ستطبّقينه. المطلوب زيارة واحدة على الأقل في الشهر، وإن زدتِ فلكل مجتهدٍ نصيب.',
    blank: { why: TPV_WHY[1], pick: [], saw: [], apply: [], how: '' },
    form: d => fld('المعلمة المزورة', staffSel('v', d.v)) + fld('الصف', `<input data-n="s" value="${esc(d.s || '')}" placeholder="مثل 11-3">`) +
      fld('سبب الزيارة', fRadio('why', TPV_WHY, d.why), 1) + fld('لماذا اخترتِ هذه المعلمة؟', fMulti('pick', TPV_PICK, d.pick), 1) +
      fld('ما لاحظتُه واستفدتُ منه', fMulti('saw', TPV_SAW, d.saw), 1) + fld('ما سأطبقه في حصتي', fMulti('apply', TPV_SAW, d.apply), 1) +
      fld('مدى إمكانية التطبيق', fRadio('how', TPV_HOW, d.how), 1) + fld('يصعب تطبيقه لأن', fCombo('hard', TPV_HARD, d.hard), 1) + fld('ملاحظة', `<input data-n="note" value="${esc(d.note || '')}">`, 1),
    check: r => !r.v ? 'اختاري المعلمة المزورة' : !(r.pick || []).length ? 'اختاري لماذا اخترتِ هذه المعلمة' : '',
    sum: r => 'زيارة تبادلية: ' + r.v,
    head: '<tr><th>التاريخ</th><th>المعلمة المزورة</th><th>القسم</th><th>لماذا اخترتِها</th><th>ما سأطبقه</th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td><b>${esc(r.d.v)}</b></td><td>${esc(r.d.vdept || '')}</td><td style="font-size:12px">${esc(listTxt(r.d.pick))}</td><td style="font-size:12px">${esc(listTxt(r.d.apply))}${r.d.how ? ` <span class="chip">${esc(r.d.how)}</span>` : ''}</td>`,
    actions: '<button class="btn sec" id="tprint">ورقة الزيارات: حفظ PDF أو طباعة</button>',
    bind: el => { if ($('#tprint')) $('#tprint').onclick = () => T_pvPaper(el); },
    bottom: () => { const H = S.records.filter(r => r.item === 'TPV' && r.d.v === S.user.name && inCur(r)).sort((a, b) => a.date < b.date ? -1 : 1);
      return `<div class="card" style="border-inline-start:4px solid var(--tiffany-d)"><h2>زارتني — توظيف جوانب تميزي</h2>
      <p style="margin:0 0 8px;text-align:justify">نشكر لكِ سعة صدركِ واستضافتكِ للزميلات، توظيفاً لجوانب التميز والمهارات التي تتميزين بها.</p>
      <div class="tbl"><table class="t"><tr><th>التاريخ</th><th>الزائرة</th><th>القسم</th><th>جانب التميز الذي حضرت لأجله</th><th>ما استفادته</th></tr>
      ${H.map(r => `<tr><td>${dmy(r.date)}</td><td><b>${esc(r.d.t)}</b></td><td>${esc(r.dept)}</td><td style="font-size:12px">${esc(listTxt(r.d.pick))}</td><td style="font-size:12px">${esc(listTxt(r.d.saw))}</td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">لم تُسجَّل زيارات لكِ في هذه الفترة بعد — تظهر هنا تلقائياً حين تسجّلها الزائرة</div></td></tr>'}</table></div></div>`; },
  });
}
async function T_pvPaper(el) {
  const L = mine('TPV').filter(inCur).sort((a, b) => a.date < b.date ? -1 : 1); if (!L.length) return toast('لا توجد زيارات في هذه الفترة', 1);
  const me = meStaff(); const pages = []; for (let i = 0; i < L.length; i += 3) pages.push(L.slice(i, i + 3));
  const card = (r, n) => `<table style="margin-top:3mm;table-layout:fixed"><colgroup><col style="width:17%"><col style="width:20%"><col style="width:9%"><col style="width:17%"><col style="width:9%"><col style="width:12%"><col style="width:7%"><col style="width:9%"></colgroup><tr><th colspan="8" style="text-align:right">الزيارة التبادلية (${n})</th></tr>
    <tr><td class="k">المعلمة المزورة</td><td>أ. ${esc(r.d.v)}</td><td class="k">القسم</td><td>${esc(r.d.vdept || '')}</td><td class="k">التاريخ</td><td>${dmy(r.date)}</td><td class="k">الصف</td><td>${esc(r.d.s || '')}</td></tr>
    <tr><td class="k">سبب الزيارة</td><td colspan="7">${TPV_WHY.map(x => (r.d.why === x ? '☑ ' : '☐ ') + x).join(' &nbsp;&nbsp; ')}</td></tr>
    <tr><td class="k">لماذا اخترتُ هذه المعلمة</td><td colspan="7" class="j">${esc(listTxt(r.d.pick))}</td></tr>
    <tr><td class="k">ما لاحظتُه واستفدتُ منه</td><td colspan="7" class="j">${esc(listTxt(r.d.saw))}</td></tr>
    <tr><td class="k">ما سأطبقه في حصتي</td><td colspan="7" class="j">${esc(listTxt(r.d.apply))} ${r.d.how ? '— ' + TPV_HOW.map(x => (r.d.how === x ? '☑ ' : '☐ ') + x).join(' ') : ''}${r.d.hard ? ' لأن: ' + esc(r.d.hard) : ''}</td></tr>
    ${r.d.note ? `<tr><td class="k">ملاحظة</td><td colspan="7" class="j">${esc(r.d.note)}</td></tr>` : ''}</table>`;
  const inner = pages.map((pg, pi) => `<div style="${pi ? 'page-break-before:always;' : ''}"><h1>سجل الزيارات التبادلية</h1><div class="sub">${esc(SCHOOL())} · ${esc(curPer().name)}</div>
    <table><tr><td class="k">اسم المعلمة</td><td>أ. ${esc(S.user.name)}</td><td class="k">القسم</td><td>${esc(S.user.dept[0])}</td></tr></table>${pg.map((r, i) => card(r, pi * 3 + i + 1)).join('')}</div>`).join('');
  await showPaper(el, 'سجل الزيارات التبادلية', inner + `<p style="font-size:10px;color:#666;margin-top:3mm">لحفظ الورقة دليلاً في Teams: اضغطي «طباعة / حفظ PDF» ثم اختاري «Save as PDF».</p>`, '');
  $('#pBack').onclick = () => show();
}

/* ================================================================== الورش وتطوير الزملاء */
function T_ws(el) {
  T_page(el, {
    item: 'TWS', title: 'الورش وتطوير الزملاء', one: 'ورشة أو مساهمة', note: 'معلمتي الغالية، اضغطي «تسجيل جديد»، ثم اختاري: ورشة حضرتِها (داخلية أو خارجية)، أو ما قدّمتِه لتطوير زميلاتكِ (ورشة، جلسة نقاش، ورقة عمل، نموذج مميز، فكرة).',
    blank: { role: TWS_ROLE[0] }, files: ['att', 'file'],
    form: d => fld('نوع التسجيل', fRadio('role', TWS_ROLE, d.role), 1) +
      `<div class="fld" style="grid-column:1/-1" data-show="${TWS_ROLE[2]}"><label>ماذا قدّمتِ؟</label>${fSel('type', TWS_TYPE, d.type)}</div>` +
      fld('العنوان', `<input data-n="title" value="${esc(d.title || '')}" required>`, 1) +
      `<div class="fld" data-show="${TWS_ROLE[0]}"><label>المقدِّمة</label>${staffSel('by', d.by)}</div>` +
      `<div class="fld" data-show="${TWS_ROLE[1]}"><label>المقدِّم</label><input data-n="byx" value="${esc(d.byx || '')}"></div>` +
      `<div class="fld" data-show="${TWS_ROLE[1]}"><label>مكان الورشة / الجهة</label><input data-n="place" value="${esc(d.place || '')}"></div>` +
      `<div class="fld" data-show="${TWS_ROLE[2]}"><label>المستفيدات (اختياري)</label><input data-n="aud" value="${esc(d.aud || '')}" placeholder="معلمات القسم، أو أسماء، أو أقسام"></div>` +
      `<div class="fld" data-show="${TWS_ROLE[2]}"><label>كشف أسماء الحضور (اختياري) ${fileLink(d.att)}</label><input type="file" data-file="att"></div>` +
      `<div class="fld" data-show="${TWS_ROLE[2]}"><label>الملف نفسه: ورقة العمل أو النموذج (اختياري) ${fileLink(d.file)}</label><input type="file" data-file="file"></div>` +
      `<div class="fld" data-show="${TWS_ROLE[2]}"><label>أو رابط</label><input data-n="link" dir="ltr" value="${esc(d.link || '')}" placeholder="https://"></div>`,
    bind: (el, d) => { const f = $('#tf'); if (!f) return; const upd = () => { const v = ($('input[name="r_role"]:checked', f) || {}).value || d.role; $$('[data-show]', f).forEach(x => x.style.display = x.dataset.show === v ? '' : 'none'); }; $$('input[name="r_role"]', f).forEach(i => i.onchange = upd); upd(); },
    check: r => !r.title ? 'اكتبي العنوان' : r.role === TWS_ROLE[0] && !r.by ? 'اختاري المقدِّمة' : r.role === TWS_ROLE[2] && !r.type ? 'اختاري ماذا قدّمتِ' : '',
    sum: r => (r.role === TWS_ROLE[2] ? 'قدّمتُ ' + (r.type || '') : r.role) + ': ' + r.title,
    head: '<tr><th>التاريخ</th><th>النوع</th><th>العنوان</th><th>المقدِّمة / الجهة</th><th>مرفقات</th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td><span class="chip ${r.d.role === TWS_ROLE[2] ? 'tf' : ''}">${esc(r.d.role === TWS_ROLE[2] ? 'قدّمتُ: ' + (r.d.type || '') : r.d.role)}</span></td><td><b>${esc(r.d.title)}</b></td><td>${esc(r.d.role === TWS_ROLE[0] ? 'أ. ' + r.d.by : r.d.role === TWS_ROLE[1] ? [r.d.byx, r.d.place].filter(Boolean).join(' — ') : r.d.aud || '')}</td><td>${fileLink(r.d.att)} ${fileLink(r.d.file)} ${r.d.link ? `<a href="${esc(r.d.link)}" target="_blank" rel="noopener">رابط</a>` : ''}</td>`,
    bottom: () => { const H = S.records.filter(r => r.item === 'TWS' && r.d.by === S.user.name && r.d.t !== S.user.name && inCur(r));
      return H.length ? `<div class="card" style="border-inline-start:4px solid var(--tiffany-d)"><h2>حضرن ورشكِ — توظيف جوانب تميزكِ</h2><div class="tbl"><table class="t"><tr><th>التاريخ</th><th>العنوان</th><th>الحاضرة</th><th>قسمها</th></tr>${H.map(r => `<tr><td>${dmy(r.date)}</td><td>${esc(r.d.title)}</td><td>أ. ${esc(r.d.t)}</td><td>${esc(r.dept)}</td></tr>`).join('')}</table></div></div>` : ''; },
  });
}

/* ================================================================== التواصل مع أولياء الأمور */
/* أرقام أولياء الأمور من سجل القيد (لطالبات شُعب المعلمة فقط) */
const stuOf = (sc, n) => (S.students || []).find(x => x.s === sc && x.n === n) || {};
const telLinks = ph => String(ph || '').split(/[،,]/).map(x => x.trim()).filter(Boolean).map(x => `<a href="tel:${esc(x)}" dir="ltr" style="text-decoration:none;color:var(--tiffany-d);font-weight:600">${esc(x)}</a>`).join(' · ');
const selX = (n, opts, v, ph, other) => `<select data-n="${n}"><option value="">${esc(ph || 'اختاري…')}</option>${opts.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}${v && !opts.includes(v) ? `<option selected>${esc(v)}</option>` : ''}${other ? '<option value="__x">أخرى (اكتبي)</option>' : ''}</select>`;
/* نسخ الإجراء نفسه لطالبات أخريات: سجل مستقل لكل طالبة، ويمكن تعديل الموضوع والنتيجة لكل واحدة */
function paCopy(src) {
  const secs = String(meStaff().secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean);
  const done = new Set(src.stu || []); const chosen = new Map();
  const TOP = paTopOf(src.cat), RES = paResOf(src.cat);
  const m = document.createElement('div'); m.className = 'modal';
  const opt = (L, v) => L.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('');
  const draw = () => { const sc = ($('#cpSec', m) || {}).value || src.s || secs[0] || '';
    const L = (S.students || []).filter(x => x.s === sc).sort((a, b) => a.n.localeCompare(b.n, 'ar'));
    m.innerHTML = `<div class="box" style="max-width:860px;width:96vw;max-height:92vh;overflow:auto"><h3>نسخ الإجراء لطالبات أخريات</h3>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:8px">${src.cat ? `الغرض: <b>${esc(src.cat)}</b> · ` : ''}الوسيلة: <b>${esc(src.way || '')}</b> · التاريخ: <b>${dmy(src.date)}</b> — يُنشأ سجل مستقل لكل طالبة، ويمكنكِ تغيير الموضوع والنتيجة لكل واحدة.</div>
      <div class="row" style="gap:8px"><label style="font-size:13px">الشعبة <select id="cpSec">${secs.map(x => `<option ${x === sc ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label><input id="cpQ" placeholder="ابحثي باسم الطالبة" style="flex:1;font-size:12px"></div>
      <div class="multi" style="border:1px solid var(--line);border-radius:12px;padding:6px 10px;margin-top:8px;max-height:200px;overflow:auto;font-size:12px">${!L.length ? '<div style="color:var(--muted)">لا توجد أسماء لهذه الشعبة بعد</div>' : `<label style="font-weight:700"><input type="checkbox" id="cpAll"> تحديد الكل (${L.length})</label>` + L.map(x => `<label data-nm="${esc(x.n)}"><input type="checkbox" data-cp value="${esc(x.n)}" ${chosen.has(sc + '|' + x.n) ? 'checked' : ''}> ${esc(x.n)}${done.has(x.n) ? ' <span class="chip">مسجّلة</span>' : ''}${x.ph ? ` <small style="margin-inline-start:auto">${telLinks(x.ph)}</small>` : ''}</label>`).join('')}</div>
      <div class="tbl" style="margin-top:10px"><table class="t"><tr><th>الطالبة</th><th>هاتف ولي الأمر</th><th>الموضوع</th><th>النتيجة / ما تم الاتفاق عليه</th><th></th></tr>
      ${[...chosen.entries()].map(([k, o]) => `<tr><td style="font-size:12.5px"><b>${esc(o.n)}</b> <small>${esc(o.s)}</small></td><td style="font-size:12px">${telLinks(stuOf(o.s, o.n).ph)}</td><td><select data-ct="${esc(k)}" style="font-size:12px">${opt(TOP, o.topic)}${o.topic && !TOP.includes(o.topic) ? `<option selected>${esc(o.topic)}</option>` : ''}</select></td><td><select data-cr="${esc(k)}" style="font-size:12px;max-width:330px">${opt(RES, o.res)}${o.res && !RES.includes(o.res) ? `<option selected>${esc(o.res)}</option>` : ''}</select></td><td><button class="btn sm ghost" data-cx="${esc(k)}">×</button></td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">حدّدي الطالبات من القائمة فيظهرن هنا</div></td></tr>'}</table></div>
      <div class="row" style="margin-top:12px"><button class="btn" id="cpOk">حفظ (${chosen.size})</button><button class="btn sec" id="cpNo">إلغاء</button></div></div>`;
    $('#cpSec', m).onchange = () => draw();
    $('#cpQ', m).oninput = e => { const q = nrm(e.target.value); $$('[data-nm]', m).forEach(l => l.style.display = !q || nrm(l.dataset.nm).includes(q) ? '' : 'none'); };
    const pick = (n, on) => { const k = sc + '|' + n; if (on) chosen.set(k, { s: sc, n, topic: src.topic || '', res: src.res || '' }); else chosen.delete(k); };
    $$('[data-cp]', m).forEach(c => c.onchange = () => { pick(c.value, c.checked); draw(); });
    if ($('#cpAll', m)) $('#cpAll', m).onchange = e => { $$('[data-cp]', m).forEach(c => { if (c.closest('label').style.display !== 'none') pick(c.value, e.target.checked); }); draw(); };
    $$('[data-ct]', m).forEach(x => x.onchange = () => chosen.get(x.dataset.ct).topic = x.value);
    $$('[data-cr]', m).forEach(x => x.onchange = () => chosen.get(x.dataset.cr).res = x.value);
    $$('[data-cx]', m).forEach(x => x.onclick = () => { chosen.delete(x.dataset.cx); draw(); });
    $('#cpNo', m).onclick = () => m.remove();
    $('#cpOk', m).onclick = async () => { if (!chosen.size) return toast('حدّدي طالبة واحدة على الأقل', 1);
      const base = Object.assign({}, src); delete base._key; delete base.t;
      const list = [...chosen.values()].map(o => { const d = Object.assign({}, base, { s: o.s, stu: [o.n], n: 1, topic: o.topic, res: o.res }); return { dept: S.user.dept[0], item: 'TPA', date: d.date, sum: 'تواصل مع ولي أمر: ' + o.n, d }; });
      const j = await call('saveMany', { list }); (j.saved || []).forEach(x => S.records.push(x));
      m.remove(); toast(`تم الحفظ ✓ — ${(j.saved || []).length} سجل` + ((j.skipped || []).length ? ` (تعذّر ${j.skipped.length})` : '')); refresh(); };
  };
  document.body.appendChild(m); draw();
}
function T_pa(el) {
  const secs = String(meStaff().secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean);
  T_page(el, {
    item: 'TPA', title: 'التواصل مع أولياء الأمور', one: 'تواصل مع ولي أمر', note: 'معلمتي الغالية، اضغطي «تسجيل جديد»، ثم اختاري الشعبة والطالبة فيظهر رقم ولي أمرها، ثم الغرض من التواصل ووسيلته والنتيجة. أما التواصل مع ولي أمر طالبة مستهدفة فيُسجَّل في سبع سنابل فقط، ويصل هنا تلقائياً.',
    form: d => fld('الشعبة', fSel('s', secs, d.s, 'اختاري الشعبة')) + fld('عدد أولياء الأمور', `<input type="number" min="1" data-n="n" value="${esc(d.n || 1)}">`) + (S.tStu = d.stu || [], '') + fld('الطالبة ورقم ولي أمرها', '<div id="stuBox"></div><div id="phBox" style="margin-top:6px"></div>', 1) +
      fld('الغرض من التواصل', fRadio('cat', TPA_CAT, d.cat), 1) +
      fld('الموضوع', `<select data-n="topic" id="paTop"></select><input data-n="topicx" placeholder="اكتبي الموضوع" style="margin-top:6px;display:none">`) + fld('وسيلة التواصل', selX('way', TPA_WAY, d.way)) +
      fld('النتيجة / ما تم الاتفاق عليه مع ولي الأمر', `<select data-n="res" id="paRes"></select><input data-n="resx" placeholder="اكتبي ما تم الاتفاق عليه" style="margin-top:6px;display:none">`, 1),
    check: r => !r.cat ? 'اختاري الغرض من التواصل' : !r.way ? 'اختاري وسيلة التواصل' : '',
    sum: r => 'تواصل مع أولياء الأمور: ' + [r.cat, r.way].filter(Boolean).join(' — '),
    pre: (r, f) => { r.stu = $$('[data-stu]', f).filter(c => c.checked).map(c => c.value); if (r.stu.length) r.n = r.stu.length;
      if (r.topic === '__x' || (!r.topic && r.topicx)) r.topic = r.topicx; if (r.res === '__x' || (!r.res && r.resx)) r.res = r.resx; delete r.topicx; delete r.resx; },
    copyBtn: 'حفظ ثم نسخ لطالبات أخريات',
    head: '<tr><th>التاريخ</th><th>الشعبة</th><th>الغرض والموضوع</th><th>الوسيلة</th><th>العدد والطالبات</th><th>النتيجة</th><th></th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td>${esc(r.d.s || '')}</td><td>${r.d.cat ? `<span class="chip">${esc(r.d.cat)}</span> ` : ''}${esc(r.d.topic || '')}</td><td>${esc(r.d.way || '')}</td><td>${esc(r.d.n || 1)}${(r.d.stu || []).length ? `<div style="font-size:11px;color:var(--muted)">${esc(r.d.stu.join('، '))}</div>` : ''}</td><td style="font-size:12px">${esc(r.d.res || '')}</td><td><button class="btn sm sec" data-copy="${r.id}" title="نسخ الإجراء نفسه لطالبات أخريات">⧉ نسخ لطالبات أخريات</button></td>`,
    bind: (el, d) => { $$('[data-copy]', el).forEach(b => b.onclick = () => { const r = S.records.find(x => x.id === b.dataset.copy); paCopy(r.d); });
      const f = $('#tf'); if (!f) return; const sel = $('[data-n="s"]', f), box = $('#stuBox', f), phB = $('#phBox', f);
      const keep = new Set(S.tStu || []); S.tStu = null;
      // الموضوع والنتيجة يتبعان الغرض
      const tp = $('#paTop', f), tx = $('[data-n="topicx"]', f), rs = $('#paRes', f), rx = $('[data-n="resx"]', f);
      const fill = (s0, L, v, ph) => { s0.innerHTML = `<option value="">${ph}</option>` + L.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('') + (v && !L.includes(v) ? `<option selected>${esc(v)}</option>` : '') + '<option value="__x">أخرى (اكتبي)</option>'; };
      const tgl = () => { tx.style.display = tp.value === '__x' ? '' : 'none'; rx.style.display = rs.value === '__x' ? '' : 'none'; };
      const byCat = (keepV) => { const c = ($('input[name="r_cat"]:checked', f) || {}).value || ''; fill(tp, paTopOf(c), keepV ? d.topic : tp.value, c ? 'اختاري الموضوع…' : 'اختاري الغرض أولاً…'); fill(rs, paResOf(c), keepV ? d.res : rs.value, 'اختاري…'); tgl(); };
      $$('input[name="r_cat"]', f).forEach(i => i.onchange = () => byCat(false)); tp.onchange = rs.onchange = tgl; byCat(true);
      const draw = () => { const sc = sel.value.trim(); const L = (S.students || []).filter(x => x.s === sc).sort((a, b) => a.n.localeCompare(b.n, 'ar'));
        phB.innerHTML = '';
        if (!sc) { box.innerHTML = '<div style="color:var(--muted);border:1px solid var(--line);border-radius:10px;padding:8px 10px">▾ اختاري الشعبة أولاً</div>'; return; }
        if (!L.length) { box.innerHTML = '<div style="color:var(--muted);border:1px solid var(--line);border-radius:10px;padding:8px 10px">لا توجد أسماء لهذه الشعبة بعد</div>'; return; }
        box.innerHTML = `<button type="button" id="stuBtn" style="width:100%;text-align:right;background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 10px;cursor:pointer">▾ <span id="stuLbl"></span></button>
          <div id="stuPanel" style="display:none;border:1px solid var(--line);border-top:0;border-radius:0 0 10px 10px;padding:6px 10px;background:#fff">
            <input id="stuQ" placeholder="ابحثي باسم الطالبة" style="width:100%;margin-bottom:6px;font-size:12px">
            <label style="display:block;font-weight:700;font-size:12px"><input type="checkbox" id="stuAll"> تحديد الكل (${L.length})</label>
            <div style="max-height:240px;overflow:auto;font-size:12px;line-height:1.9">${L.map(x => `<label style="display:block" data-nm="${esc(x.n)}"><input type="checkbox" data-stu value="${esc(x.n)}" ${keep.has(x.n) ? 'checked' : ''}> ${esc(x.n)}</label>`).join('')}</div></div>`;
        const upd = () => { const ch = $$('[data-stu]', box).filter(x => x.checked).map(x => x.value); $('#stuLbl').textContent = ch.length ? `${ch.length} طالبة: ${ch.slice(0, 3).join('، ')}${ch.length > 3 ? '…' : ''}` : 'اختاري الطالبة من القائمة'; if (ch.length) $('[data-n="n"]', f).value = ch.length;
          phB.innerHTML = ch.length ? `<div style="border:1px solid var(--line);border-radius:10px;padding:6px 10px;background:#F7FBFB;font-size:12.5px;line-height:2">${ch.map(n => { const o = stuOf(sc, n); return `<div><b>${esc(n)}</b> — ${o.ph ? `ولي الأمر${o.rel ? ' (' + esc(o.rel) + ')' : ''}: ${telLinks(o.ph)}` : '<span style="color:var(--muted)">لا يوجد رقم مسجّل</span>'}</div>`; }).join('')}</div>` : ''; };
        $('#stuBtn').onclick = () => { const pn = $('#stuPanel'); pn.style.display = pn.style.display === 'none' ? '' : 'none'; if (pn.style.display === '') $('#stuQ').focus(); };
        $('#stuQ').oninput = e => { const q = nrm(e.target.value); $$('[data-nm]', box).forEach(l => l.style.display = !q || nrm(l.dataset.nm).includes(q) ? '' : 'none'); };
        $('#stuAll').onchange = e => { $$('[data-stu]', box).forEach(c => { if (c.closest('label').style.display !== 'none') c.checked = e.target.checked; }); upd(); };
        $$('[data-stu]', box).forEach(c => c.onchange = upd); upd(); };
      sel.onchange = () => { keep.clear(); draw(); }; draw(); },
  });
}

/* ================================================================== الإنجازات والمشاركات */
function T_ach(el) {
  T_page(el, {
    item: 'TACH', title: 'الإنجازات والمشاركات', one: 'إنجاز أو مشاركة', note: 'معلمتي الغالية، اضغطي «تسجيل جديد»، ثم سجّلي مشاركة طالباتكِ في مسابقة أو فعالية، ومراكزهن إن وُجدت.', blank: { kind: TACH_KIND[0] },
    form: d => fld('النوع', fRadio('kind', TACH_KIND, d.kind), 1) + fld('اسم المسابقة / الفعالية', `<input data-n="name" value="${esc(d.name || '')}" required>`, 1) + fld('الجهة المنظمة', `<input data-n="ent" value="${esc(d.ent || '')}">`) + fld('المستوى', fSel('lvl', TACH_LVL, d.lvl)) +
      fld('الطالبات المشاركات', `<input data-n="stu" value="${esc(d.stu || '')}" placeholder="الأسماء أو العدد">`, 1) + fld('النتيجة / المركز', `<input data-n="res" value="${esc(d.res || '')}">`),
    check: r => !r.name ? 'اكتبي اسم المسابقة أو الفعالية' : '',
    sum: r => r.kind + ': ' + r.name,
    head: '<tr><th>التاريخ</th><th>النوع</th><th>المسابقة / الفعالية</th><th>الجهة</th><th>الطالبات</th><th>النتيجة</th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td><span class="chip ${r.d.kind === TACH_KIND[1] ? 'ok' : ''}">${esc(r.d.kind)}</span></td><td><b>${esc(r.d.name)}</b></td><td>${esc(r.d.ent || '')}</td><td style="font-size:12px">${esc(r.d.stu || '')}</td><td>${esc(r.d.res || '')}</td>`,
  });
}

/* ================================================================== الأنشطة والبرامج والمبادرات (نفس سجل سبع سنابل)
   البرنامج مظلة تنبثق منه المشاريع، وتنبثق من المشروع الأنشطة */
const TA_KINDS = ['برنامج', 'مشروع', 'نشاط', 'مبادرة', 'مسابقة'];
/* تعريف كل نوع وشروط اختياره، تظهر للمعلمة في النموذج لتختار النوع الصحيح */
const TA_DEF = {
  'برنامج': { d: 'مظلة كبرى طويلة المدى (فصل دراسي أو عام كامل)، لها خطة وأهداف عامة وفريق عمل، وتنبثق منها عدة مشاريع وأنشطة.', w: 'لا تختاري «برنامج» إلا إذا كان ممتداً طوال الفصل أو العام، وله خطة مكتوبة، وتنبثق منه مشاريع أو أنشطة متعددة.', e: 'نادي مشارق للموهوبات' },
  'مشروع': { d: 'مجموعة أنشطة مترابطة تُنفَّذ على مدى زمني محدد (أسابيع أو أشهر)، لها هدف واضح ومُخرَج نهائي ملموس، وغالباً تنبثق من برنامج.', w: 'لا تختاري «مشروع» إلا إذا تكوّن من عدة مراحل أو أنشطة مترابطة، وانتهى بمُخرَج واضح.', e: 'مشروع اللياقة البدنية، البحث العلمي للطالبات' },
  'نشاط': { d: 'فعالية واحدة تُنفَّذ في وقت محدد (حصة أو يوم)، وغالباً ضمن خطة المدرسة أو القسم أو تقويم الوزارة.', w: 'لا تختاري «نشاط» إلا إذا كان فعالية واحدة محددة بوقت، مثل الطابور الصباحي أو يوم احتفالي أو ركن المادة.', e: 'أهلاً مدرستي، الطابور الصباحي، اليوم الوطني' },
  'مبادرة': { d: 'فكرة تطوعية من المعلمة نفسها، خارج المهام المطلوبة منها وخارج خطة المدرسة، تعالج حاجة أو مشكلة محددة لدى فئة مستهدفة.', w: 'لا تختاري «مبادرة» إلا إذا كانت الفكرة من مبادرتكِ الشخصية، وغير مكلّفة بها، وتعالج حاجة واضحة. الأنشطة المعتادة والفعاليات المكلّف بها ليست مبادرات.', e: 'مبادرة فصحى العلوم، مبادرة لدعم الطالبات المتعثرات' },
  'مسابقة': { d: 'منافسة بين الطالبات بمعايير تحكيم وفائزات، داخلية أو خارجية، ويشمل ذلك الأولمبيادات.', w: 'لا تختاري «مسابقة» إلا إذا كانت فيها منافسة وتحكيم وفائزات.', e: 'مسابقة حماة العربية، أولمبياد العلوم' }
};
const taKindPick = v => `<div class="takind">${TA_KINDS.map(k => { const x = TA_DEF[k]; return `<label class="tk ${k === v ? 'on' : ''}"><input type="radio" name="r_kind" value="${esc(k)}" ${k === v ? 'checked' : ''}><b>${esc(k)}</b><span class="tkd">${esc(x.d)}</span><span class="tkw">${esc(x.w)}</span><span class="tke">مثال: ${esc(x.e)}</span></label>`; }).join('')}</div>`;
const TA_PARENT = { 'مشروع': 'برنامج', 'نشاط': 'مشروع' };
const TA_TERMS = ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني', 'العام الدراسي كاملاً'];
const TA_NEEDS = ['تدني التحصيل لدى فئة من الطالبات', 'ضعف الدافعية نحو التعلم', 'الغياب والتأخر الصباحي', 'السلوك والقيم', 'رعاية المتفوقات والموهوبات', 'ضعف مهارة محددة (قراءة، كتابة، حساب…)', 'التواصل مع أولياء الأمور', 'جودة الحياة المدرسية والانتماء', 'دعم الزميلات المعلمات', 'أخرى'];
const TA_LVL = ['على مستوى الصف', 'على مستوى القسم', 'على مستوى المدرسة', 'على مستوى المدارس (الوزارة)', 'محلية خارجية', 'دولية'];
/* ما يميز خانات كل نوع: تظهر للمعلمة بعد الاختيار */
const TA_FORM = {
  'برنامج': { h: 'ممتد دائماً على فصل أو عام، له هدف عام وفئة مستهدفة، وتسجّلين مشاريعه وأنشطته لاحقاً كلٌّ على حدة.', date: 'تاريخ بداية البرنامج', name: 'اسم البرنامج' },
  'مشروع': { h: 'ممتد من تاريخ إلى تاريخ، يتكوّن من مرحلتين أو أكثر، وينتهي بمُخرَج نهائي.', date: 'تاريخ بداية المشروع', name: 'اسم المشروع' },
  'نشاط': { h: 'فعالية واحدة بتاريخ تنفيذ واحد، بلا مدة ممتدة. إن احتاج عدة مراحل فهو «مشروع».', date: 'تاريخ التنفيذ', name: 'اسم النشاط' },
  'مبادرة': { h: 'فكرة شخصية غير مكلّفة بها، تحددين الحاجة التي تعالجها والفئة المستهدفة، وتؤكدين أنها من مبادرتكِ.', date: 'تاريخ التنفيذ (أو البداية إن كانت ممتدة)', name: 'اسم المبادرة' },
  'مسابقة': { h: 'منافسة بتاريخ واحد، تحددين مستواها وعدد المشاركات والفائزات.', date: 'تاريخ المسابقة', name: 'اسم المسابقة' }
};
const kf = (kinds, inner, wide, id) => `<div class="fld"${id ? ` id="${id}"` : ''} data-k="${kinds}"${wide ? ' style="grid-column:1/-1"' : ''}>${inner}</div>`;
/* الأثر: قائمة منسدلة حسب الأولوية المختارة */
const TA_IMPACT = [
  ['تحسّن التحصيل الدراسي لدى الطالبات المستهدفات', 'رفع دافعية الطالبات نحو التعلم', 'معالجة الفاقد التعليمي لدى الطالبات المتعثرات', 'تحسّن استعداد الطالبات للاختبارات', 'تنمية مهارات التفكير والإبداع', 'تحسّن مهارات القراءة والكتابة', 'اكتشاف الموهوبات ورعايتهن'],
  ['توظيف الطالبات للتقنيات الحديثة في التعلم', 'تنمية مهارات البحث والتعلم الذاتي', 'تنمية المهارات الرقمية لدى الطالبات', 'انتقال أثر التدريب المهني إلى ممارسات المعلمات في الصف'],
  ['تعزيز القيم والسلوك الإيجابي لدى الطالبات', 'تعزيز الانتماء والهوية الوطنية', 'تنمية مهارات التواصل والعرض', 'تعزيز الثقة بالنفس', 'تعزيز روح التعاون والعمل الجماعي', 'زيادة الوعي بالقضية المطروحة', 'تحسّن الانضباط والالتزام المدرسي'],
  ['تعزيز الشراكة مع أولياء الأمور', 'زيادة مشاركة أولياء الأمور في تعلم بناتهن', 'تحسّن التواصل بين المدرسة والأسرة', 'متابعة أولياء الأمور لمستوى بناتهن'],
];
const TA_OTHER = 'أخرى (اكتبي الأثر)';
/* ---- الشكر والثناء على الأنشطة: نجمة لكل نشاط، وثناء أكبر عند 3، وكأس واحتفال عند 5 فأكثر */
function taStars(n, max) { const k = Math.min(n, max || 5); return '★'.repeat(k) + (n > k ? ` <small style="font-size:13px;letter-spacing:0">×${n}</small>` : ''); }
function taCheer(n, kind) {
  if (!n) return '';
  const nm = 'أ. ' + esc(S.user.name), kd = esc(kind || 'نشاط'), per = esc(curPer().name);
  if (n >= 5) return `<div class="card ta-cheer" style="background:linear-gradient(135deg,#FFF6DD,#FFFDF6);border:1px solid #E9D3A8;border-inline-start:5px solid var(--gold);text-align:center">
    <div style="font-size:54px;line-height:1">🏆</div><div style="font-size:26px;color:var(--gold);letter-spacing:5px;margin:6px 0">${taStars(n, 7)}</div>
    <h3 style="margin:2px 0 6px;color:var(--maroon)">معلمةٌ متميزةٌ في المبادرة والعطاء</h3>
    <p style="margin:0;text-align:justify;font-weight:600">${nm}، ${n} أعمالٍ في ${per}، وما هذا إلا ثمرة همّةٍ عالية جعلت التميّز ديدنكِ والإتقانَ عنوانكِ. فخورةٌ بكِ أيّما فخر، ﴿إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا﴾.</p>${vpSignLine()}</div>`;
  if (n >= 3) return `<div class="card ta-cheer" style="background:linear-gradient(90deg,#FFF8E6,#fff);border-inline-start:5px solid var(--gold)">
    <div style="font-size:24px;color:var(--gold);letter-spacing:5px">${taStars(n)} 💛</div>
    <p style="margin:4px 0 0;text-align:justify;font-weight:600">${nm}، ${n} أعمالٍ نوعيةٍ في ${per}، شاهدةٌ على شغفٍ أصيلٍ بالمهنة، وعطاؤكِ محلّ تقديرٍ واعتزاز؛ ${n === 3 ? 'وبقي عملان لتنالي كأس التميز 🏆.' : 'وبقي عملٌ واحد لتنالي كأس التميز 🏆.'}</p>${vpSignLine()}</div>`;
  return `<div class="card ta-cheer" style="background:linear-gradient(90deg,#FFF8E6,#fff);border-inline-start:4px solid var(--gold)">
    <div style="font-size:20px;color:var(--gold);letter-spacing:4px">${taStars(n)}</div>
    <p style="margin:4px 0 0;text-align:justify;font-weight:600">${n === 1 ? `${nm}، شكرٌ موصولٌ لكِ على ${({ 'برنامج': 'هذا البرنامج', 'مشروع': 'هذا المشروع', 'نشاط': 'هذا النشاط', 'مبادرة': 'هذه المبادرة', 'مسابقة': 'هذه المسابقة' })[kind] || 'هذا العمل'}؛ بدايةٌ مباركة، والبدايات الحسنة تُنبئ بالخواتيم الحسنة.` : `${nm}، عملكِ الثاني دليلٌ على حرصكِ على إثراء تعلّم طالباتكِ، والثالث يضاعف لكِ النجوم ⭐.`}</p>${vpSignLine()}</div>`;
}
/* سطر التوقيع تحت عبارات الشكر: توقيع النائب باهت، ثم المسمى والاسم */
let VPS_CHEER = null;
const vpSignLine = () => `<div class="vpsign"><span class="vps">${VPS_CHEER ? `<img src="${VPS_CHEER}" alt="">` : ''}</span><div class="vpn">آسيا الذبياني</div></div>`;
async function fillVps(root) {
  if (VPS_CHEER === null) { try { VPS_CHEER = (await API.call('signature', { cheer: 1 })).data || ''; } catch (e) { VPS_CHEER = ''; } }
  if (VPS_CHEER) $$('.vps', root || document).forEach(x => { if (!x.firstChild) x.innerHTML = `<img src="${VPS_CHEER}" alt="">`; });
}
function chime(big) {   // نغمة احتفال خفيفة بلا ملفات خارجية
  try { const C = new (window.AudioContext || window.webkitAudioContext)(); const notes = big ? [523, 659, 784, 1047, 784, 1047] : [659, 784, 1047];
    notes.forEach((f, i) => { const o = C.createOscillator(), g = C.createGain(); o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(C.destination);
      const t = C.currentTime + i * 0.13; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); o.start(t); o.stop(t + 0.4); });
  } catch (e) {}
}
function confetti(ms) {
  const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60';
  document.body.appendChild(c); const x = c.getContext('2d'); const W = c.width = innerWidth, H = c.height = innerHeight;
  const col = ['#7A1F3D', '#B08D57', '#E9D3A8', '#0ABAB5', '#1F4E79', '#F2B705', '#E85D75'];
  const P = Array.from({ length: 180 }, () => ({ x: Math.random() * W, y: -Math.random() * H, w: 6 + Math.random() * 7, h: 8 + Math.random() * 10, vy: 2 + Math.random() * 3.5, vx: -1.5 + Math.random() * 3, a: Math.random() * 6, va: -.15 + Math.random() * .3, c: col[Math.floor(Math.random() * col.length)] }));
  const end = Date.now() + (ms || 4500);
  (function f() { x.clearRect(0, 0, W, H); const live = Date.now() < end;
    P.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(p.a) * .6; p.a += p.va; if (p.y > H + 20 && live) { p.y = -20; p.x = Math.random() * W; }
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
    if (live || P.some(p => p.y < H + 20)) requestAnimationFrame(f); else c.remove(); })();
}
function taCelebrate(n, kind) {
  const h = taCheer(n, kind); if (!h) return;
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="box" style="max-width:${n >= 5 ? 560 : 520}px">${h}<div class="row" style="margin-top:10px;justify-content:center"><button class="btn" id="cOk">${n >= 5 ? 'الحمد لله 🌸' : 'شكراً'}</button></div></div>`;
  document.body.appendChild(m); $('#cOk', m).onclick = () => m.remove(); fillVps(m);
  if (n >= 5) { confetti(5000); chime(1); } else if (n >= 3) { confetti(1800); chime(); } else chime();
}
function T_act(el) {
  const parents = k => uniqA(mine('TA').filter(r => r.d.kind === k).map(r => r.d.name).filter(Boolean));
  T_page(el, {
    item: 'TA', top: () => taCheer(mine('TA').filter(inCur).length), title: 'الأنشطة والبرامج والمبادرات', one: 'برنامج أو مشروع أو نشاط أو مبادرة', note: 'معلمتي الغالية، اضغطي «تسجيل جديد»، ثم اختاري النوع بعد قراءة تعريفه، فتظهر لكِ خاناته فقط. كل عمل تسجّلينه يمنحكِ نجمة، وعند الخامس كأس التميز.', blank: {}, dateLbl: 'التاريخ',
    form: d => fld('النوع <small style="color:var(--muted)">(اقرئي التعريف قبل الاختيار، وستظهر لكِ خانات النوع الذي تختارينه فقط)</small>', taKindPick(d.kind), 1) +
      `<div id="taHint" class="tahint" style="grid-column:1/-1"></div>` +
      kf('مشروع نشاط', `<label>ينبثق من <small style="color:var(--muted)">(اختياري)</small></label>${fCombo('par', [], d.par, 'اختاري أو اكتبي')}`, 1, 'taPar') +
      kf('*', `<label id="taNameL">الاسم</label><input data-n="name" value="${esc(d.name || '')}" placeholder="اكتبي الاسم" required>`, 1) +
      kf('برنامج مشروع', `<label>الهدف العام</label><input data-n="goal" value="${esc(d.goal || '')}" placeholder="ماذا يريد أن يحقق؟">`, 1) +
      kf('برنامج', `<label>مدة البرنامج</label>${fSel('term', TA_TERMS, d.term, 'اختاري المدة')}`) +
      kf('مشروع', `<label>عدد المراحل أو الأنشطة</label><input type="number" min="2" data-n="stages" value="${esc(d.stages || '')}" placeholder="2 فأكثر">`) +
      kf('مشروع', `<label>المُخرَج النهائي</label><input data-n="out" value="${esc(d.out || '')}" placeholder="مثال: معرض، بحث، منتج، عرض نهائي">`, 1) +
      kf('مبادرة', `<label>الحاجة أو المشكلة التي تعالجها</label>${fSel('need', TA_NEEDS, d.need, 'اختاري الحاجة')}`) +
      kf('برنامج مبادرة', `<label>الفئة المستهدفة</label>${fSel('tg', TA_TG, d.tg, 'اختاري الفئة')}`) +
      kf('مسابقة', `<label>مستوى المسابقة</label>${fSel('lvl', TA_LVL, d.lvl, 'اختاري المستوى')}`) +
      kf('مبادرة', `<label>المدة</label>${fRadio('dur', ['منتهي', 'ممتد'], d.dur || 'منتهي')}`) +
      `<div class="fld" id="taTo"><label>تاريخ النهاية</label><input type="date" data-n="to" value="${esc(d.to || '')}"></div>` +
      kf('مشروع نشاط مبادرة مسابقة', `<label id="taNL">عدد الطالبات المشاركات</label><input type="number" min="0" data-n="n" value="${esc(d.n || '')}">`) +
      kf('مسابقة', `<label>عدد الفائزات</label><input type="number" min="0" data-n="win" value="${esc(d.win || '')}">`) +
      kf('*', `<label>الأولوية التي يخدمها <span style="color:#A33">*</span></label>${fSel('p', REF.PRIO || [], d.p, 'اختاري الأولوية')}`) +
      kf('مبادرة', `<label class="tkok"><input type="checkbox" data-n="own" ${d.own ? 'checked' : ''}> أؤكد أن الفكرة من مبادرتي الشخصية، وغير مكلّفة بها ضمن مهامي أو خطة المدرسة</label>`, 1) +
      kf('*', `<label>الأثر</label><select data-n="impact" id="taImp" class="smsel"></select><input id="taImpO" class="smsel" placeholder="اكتبي الأثر الذي تحقق في الطالبات" style="display:none;margin-top:6px">`, 1),
    bind: (el, d) => { const f = $('#tf'); if (!f) return;
      const dateF = $('input[data-n="date"]', f).closest('.fld'); if (dateF) $('#taTo', f).before(dateF);
      const upd = () => { const k = ($('input[name="r_kind"]:checked', f) || {}).value || d.kind || '';
        $$('[data-k]', f).forEach(x => { const ks = x.dataset.k; x.style.display = k && (ks === '*' || ks.split(' ').includes(k)) ? '' : 'none'; });
        const H = TA_FORM[k], SD = TA_STD[k]; $('#taHint', f).innerHTML = H ? `<b>خانات «${esc(k)}»:</b> ${esc(H.h)}${SD ? `<div class="tstd"><b>${esc(SD[0])}</b> · <span>يدخل «${esc(k)}» في تقييم أدائكِ: ${esc(SD[1])}</span></div>` : ''}` : 'اختاري النوع أولاً لتظهر لكِ خاناته.';
        $('#taHint', f).classList.toggle('on', !!H);
        if (dateF) { dateF.style.display = k ? '' : 'none'; $('label', dateF).textContent = H ? H.date : 'التاريخ'; }
        $('#taNameL', f).textContent = H ? H.name : 'الاسم';
        const pk = TA_PARENT[k], pw = $('#taPar', f);
        if (pk) { $('label', pw).firstChild.textContent = 'ينبثق من ' + pk + ' '; $('datalist', pw).innerHTML = parents(pk).map(o => `<option value="${esc(o)}">`).join(''); }
        const dur = k === 'مبادرة' ? (($('input[name="r_dur"]:checked', f) || {}).value || 'منتهي') : (k === 'برنامج' || k === 'مشروع') ? 'ممتد' : 'منتهي';
        $('#taTo', f).style.display = dur === 'ممتد' ? '' : 'none'; };
      $$('input[name="r_kind"],input[name="r_dur"]', f).forEach(i => i.onchange = () => { $$('.tk', f).forEach(l => l.classList.toggle('on', $('input', l).checked)); upd(); }); upd();
      const imp = $('#taImp', f), oth = $('#taImpO', f), pSel = $('select[data-n="p"]', f); let cur = d.impact || d.desc || '';
      const all = TA_IMPACT.flat();
      if (cur && !all.includes(cur)) { oth.value = cur; cur = TA_OTHER; }
      const fill = () => { const pi = (REF.PRIO || []).indexOf(pSel.value); const v = imp.value || cur;
        const grp = (i) => `<optgroup label="${esc((REF.PRIO[i] || '').replace(/^الأولوية \d: /, ''))}">${TA_IMPACT[i].map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</optgroup>`;
        imp.innerHTML = `<option value="">اختاري الأثر…</option>` + (pi >= 0 ? grp(pi) + TA_IMPACT.map((_, i) => i === pi ? '' : grp(i)).join('') : TA_IMPACT.map((_, i) => grp(i)).join('')) + `<option ${v === TA_OTHER ? 'selected' : ''}>${TA_OTHER}</option>`;
        oth.style.display = imp.value === TA_OTHER ? '' : 'none'; };
      pSel.addEventListener('change', fill); imp.onchange = () => { oth.style.display = imp.value === TA_OTHER ? '' : 'none'; if (imp.value === TA_OTHER) oth.focus(); }; fill(); },
    pre: r => { const k = r.kind; const ow = $('#tf [data-n="own"]'); r.own = !!(ow && ow.checked); r.dur = k === 'مبادرة' ? (r.dur || 'منتهي') : (k === 'برنامج' || k === 'مشروع') ? 'ممتد' : 'منتهي';
      const keep = { 'برنامج': ['goal', 'term', 'tg'], 'مشروع': ['par', 'goal', 'stages', 'out', 'n'], 'نشاط': ['par', 'n'], 'مبادرة': ['need', 'tg', 'n', 'own'], 'مسابقة': ['lvl', 'n', 'win'] }[k] || [];
      ['par', 'goal', 'term', 'stages', 'out', 'need', 'tg', 'lvl', 'n', 'win', 'own'].forEach(x => { if (!keep.includes(x)) delete r[x]; });
      if (r.dur !== 'ممتد') delete r.to; if (r.impact === TA_OTHER) r.impact = (($('#taImpO') || {}).value || '').trim(); r.desc = r.impact || ''; },
    check: r => !r.kind ? 'اختاري النوع بعد قراءة التعريف' : !r.name ? 'اكتبي الاسم' : !r.p ? 'اختاري الأولوية التي يخدمها'
      : r.kind === 'برنامج' && !r.term ? 'حدّدي مدة البرنامج، فالبرنامج ممتد على فصل أو عام'
      : r.kind === 'مشروع' && !(+r.stages >= 2) ? 'المشروع يتكوّن من مرحلتين أو نشاطين على الأقل؛ إن كان فعالية واحدة فاختاري «نشاط»'
      : r.kind === 'مشروع' && !r.out ? 'اكتبي المُخرَج النهائي للمشروع'
      : r.kind === 'مبادرة' && !r.need ? 'اختاري الحاجة التي تعالجها المبادرة'
      : r.kind === 'مبادرة' && !r.own ? 'المبادرة فكرة شخصية غير مكلّف بها؛ إن كانت مكلّفة بها فاختاري «نشاط»'
      : r.kind === 'مسابقة' && !r.lvl ? 'اختاري مستوى المسابقة'
      : r.dur === 'ممتد' && !r.to ? 'حدّدي تاريخ النهاية' : r.dur === 'ممتد' && r.to < r.date ? 'تاريخ النهاية قبل البداية' : '',
    sum: r => r.kind + ': ' + r.name,
    head: '<tr><th>التاريخ</th><th>النوع</th><th>الاسم</th><th>الطالبات</th><th>الأولوية</th><th>الأثر</th><th></th></tr>',
    row: r => `<td style="white-space:nowrap">${dmy(r.date)}${r.d.to ? '<br><small>إلى ' + dmy(r.d.to) + '</small>' : ''}</td><td><span class="chip ${r.d.kind === 'مبادرة' ? 'tf' : r.d.kind === 'برنامج' ? 'ok' : ''}">${esc(r.d.kind)}</span></td><td><b>${esc(r.d.name)}</b>${r.d.par ? `<div style="font-size:11px;color:var(--muted)">من: ${esc(r.d.par)}</div>` : ''}${(x => x ? `<div style="font-size:11px;color:var(--muted)">${esc(x)}</div>` : '')([r.d.term, r.d.need, r.d.lvl, r.d.out ? 'المُخرَج: ' + r.d.out : '', r.d.win ? 'الفائزات: ' + r.d.win : ''].filter(Boolean).join(' · '))}</td><td>${esc(r.d.n || '')}</td><td style="font-size:12px">${esc(r.d.p || '')}</td><td style="font-size:12px">${esc(r.d.impact || r.d.desc || '')}</td>`,
  });
}

/* ================================================================== التكليفات والأعباء الوظيفية */
const TAS_LIST = [
  ['الملفات', ['ملف التطوير المهني للقسم', 'ملف الموهوبات والمتفوقات', 'ملف الطالبات المتعثرات ورفع التحصيل', 'ملف الأنشطة والمبادرات', 'ملف التواصل مع أولياء الأمور', 'ملف الاختبارات والتقييمات', 'ملف الخطط الفصلية', 'ملف الجودة والاعتماد', 'ملف مصادر التعلم', 'ملف التعلم الإلكتروني', 'ملف البحث العلمي', 'ملف الإنجازات والمشاركات']],
  ['التخويل والتمثيل', ['مخوّلة عن المنسقة طوال العام', 'مخوّلة عن المنسقة أثناء غيابها', 'حضور اجتماع بدلاً من المنسقة', 'تمثيل القسم في لجنة مدرسية', 'تمثيل المدرسة في جهة خارجية']],
  ['الإعداد', ['إعداد اختبار', 'إعداد تقييم قصير', 'إعداد تقييم صفي', 'إعداد خطط دروس', 'إعداد خطة علاجية', 'إعداد خطة إثرائية', 'إعداد أوراق عمل', 'إعداد أنشطة', 'إعداد مسابقة', 'إعداد إذاعة مدرسية', 'إعداد ورشة للزميلات']],
  ['التنفيذ والمتابعة', ['تدريب طالبات لمسابقة', 'الإشراف على مسابقة', 'المشاركة في مسابقة', 'تصحيح ومراجعة اختبارات', 'تدقيق رصد الدرجات', 'متابعة طالبات متعثرات', 'الإشراف على نادٍ طلابي', 'المشاركة في لجنة الاختبارات', 'المشاركة في فعالية مدرسية', 'حصص الاحتياط']]
];
const TAS_SCOPE = ['طوال العام', 'خلال الفصل الدراسي', 'مهمة محددة'];
const TAS_BY = ['المنسقة', 'النائب الأكاديمي', 'مديرة المدرسة', 'الموجهة التربوية', 'النائبة الإدارية'];
function T_tas(el) {
  T_page(el, {
    item: 'TAS', title: 'التكليفات والأعباء الوظيفية', one: 'تكليف',
    note: 'معلمتي الغالية، اضغطي «تسجيل جديد»، ثم اختاري كل ما كُلّفتِ به من ملفات ومهام (أكثر من بند)، أو اكتبيه بعباراتكِ، ليُحتسب لكِ في تقرير القسم وتقرير أعمالكِ.',
    blank: { scope: TAS_SCOPE[2], what: [] },
    form: d => fld('ما كُلّفتِ به <small style="color:#C98A8A;font-weight:400">يمكنكِ الاختيار من القائمة أو الكتابة بعباراتكِ التي تجدينها مناسبة</small>',
        `<div class="multi" data-m="what" style="border:1px solid var(--line);border-radius:12px;padding:6px 10px;max-height:240px;overflow:auto;font-size:12.5px;line-height:1.9">${TAS_LIST.map(([g, L]) => `<div style="font-weight:700;color:var(--maroon);margin-top:4px">${esc(g)}</div>${L.map(o => `<label style="display:block"><input type="checkbox" value="${esc(o)}" ${(d.what || []).includes(o) ? 'checked' : ''}> ${esc(o)}</label>`).join('')}`).join('')}<input data-mx="what" placeholder="أو اكتبي تكليفاً آخر (افصلي بين التكليفات بفاصلة)" value="${esc((d.what || []).filter(x => !TAS_LIST.some(([, L]) => L.includes(x))).join('، '))}" style="margin-top:6px"></div>`, 1) +
      fld('المدة', fRadio('scope', TAS_SCOPE, d.scope || TAS_SCOPE[2])) + fld('جهة التكليف', fSel('by', TAS_BY, d.by, 'اختاري الجهة')) +
      fld('ملاحظة <small style="color:var(--muted)">(اختياري)</small>', `<input data-n="note" value="${esc(d.note || '')}" placeholder="مثل: اختبار منتصف الفصل للصف العاشر">`, 1),
    check: r => !(r.what || []).length ? 'اختاري تكليفاً واحداً على الأقل أو اكتبيه' : '',
    sum: r => 'تكليف: ' + (r.what || []).join('، '),
    head: '<tr><th>التاريخ</th><th>التكليف</th><th>المدة</th><th>الجهة</th><th></th></tr>',
    row: r => `<td style="white-space:nowrap">${dmy(r.date)}</td><td><b>${esc((r.d.what || []).join('، '))}</b>${r.d.note ? `<div style="font-size:11px;color:var(--muted)">${esc(r.d.note)}</div>` : ''}</td><td>${esc(r.d.scope || '')}</td><td>${esc(r.d.by || '')}</td>`,
  });
}

/* ================================================================== الانضباط الوظيفي
   الغياب: عارضة، مرضي، بلا راتب · الاستئذان: شخصي (يُحسب من الساعات العشر شهرياً) أو إذن عمل (لا يُحسب) */
const TDS_ABS = ['عارضة', 'مرضي', 'بلا راتب'];
const TDS_PERM = ['شخصي', 'إذن عمل'];
const TDS_H = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6'];
function tdsMsg(h) {
  if (h > 10) return { c: 'bad', t: 'تجاوز الحد المطلوب' };
  if (h >= 8) return { c: 'warn', t: 'أكيد ما طلبتِها إلا لأمر طارئ وهو حق مشروع، مع الحرص على استثمار الزمن' };
  if (h >= 6) return { c: 'warn', t: 'ما طلبتِها إلا لشيء مهم' };
  if (h > 2) return { c: 'ok', t: 'نشكركِ على استثمار زمن العمل' };
  return { c: 'ok', t: 'موظفة متميزة تحرصين على إنهاء المهام خلال الدوام، وهذا من إدارة الوقت ونشكركِ عليه' };
}
function tdsMonths() {
  const M = {};
  mine('TDS').forEach(r => { (r.d.abs || []).forEach(a => { const k = monthOf(a.date); const o = M[k] = M[k] || { h: 0, w: 0, a: {} }; o.a[a.type] = (o.a[a.type] || 0) + 1; });
    (r.d.perm || []).forEach(x => { const k = monthOf(x.date); const o = M[k] = M[k] || { h: 0, w: 0, a: {} }; if (x.type === 'إذن عمل') o.w += +x.h || 0; else o.h += +x.h || 0; }); });
  return M;
}
function T_ds(el) {
  const p = curPer();
  const rowsA = (n, L) => Array.from({ length: n }, (_, i) => { const a = L[i] || {}; return `<div class="row" style="gap:8px;margin:4px 0"><b style="width:22px">${i + 1}</b><input type="date" data-ad="${i}" value="${esc(a.date || '')}" min="${p.from}" max="${p.to}"><select data-at="${i}">${TDS_ABS.map(o => `<option ${o === a.type ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`; }).join('');
  const rowsP = (n, L) => Array.from({ length: n }, (_, i) => { const a = L[i] || {}; return `<div class="row" style="gap:8px;margin:4px 0"><b style="width:22px">${i + 1}</b><input type="date" data-pd="${i}" value="${esc(a.date || '')}" min="${p.from}" max="${p.to}"><select data-ph="${i}">${TDS_H.map(o => `<option value="${o}" ${o === String(a.h || '1') ? 'selected' : ''}>${o} ${+o <= 2 && +o !== 1 ? 'ساعة' : +o === 1 ? 'ساعة' : 'ساعات'}</option>`).join('')}</select><select data-pt="${i}">${TDS_PERM.map(o => `<option ${o === a.type ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`; }).join('');
  const grab = f => ({ abs: $$('[data-ad]', f).map((x, i) => ({ date: x.value, type: $(`[data-at="${i}"]`, f).value })), perm: $$('[data-pd]', f).map((x, i) => ({ date: x.value, h: +$(`[data-ph="${i}"]`, f).value, type: $(`[data-pt="${i}"]`, f).value })) });
  T_page(el, {
    item: 'TDS', title: 'الانضباط الوظيفي', one: 'غياب أو استئذان', noDate: 1, note: 'معلمتي الغالية، اكتبي عدد أيام الغياب أو الاستئذانات فتظهر خاناتها. وإن لم يكن لديكِ شيء فاتركي الرقمين صفراً واضغطي «حفظ». إذن العمل لا يُحسب من الساعات العشر الشهرية.',
    top: () => { const M = tdsMonths(); const ks = Object.keys(M).sort().reverse();
      return ks.length ? `<div class="card"><h2>ساعات الاستئذان الشخصي شهرياً</h2>${ks.map(k => { const o = M[k], g = tdsMsg(o.h);
        return `<div style="border-inline-start:4px solid ${g.c === 'bad' ? '#A33' : g.c === 'warn' ? 'var(--gold)' : 'var(--tiffany-d)'};padding:6px 12px;margin:8px 0;background:#FAFBFC;border-radius:8px"><b>${MONTHS[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}</b> — شخصي: <b>${o.h}</b> من 10 ساعات${o.w ? ` · إذن عمل: ${o.w} (لا يُحسب)` : ''}${Object.keys(o.a).length ? ' · غياب: ' + Object.entries(o.a).map(([t, n]) => `${t} ${n}`).join('، ') : ''}<div style="margin-top:4px;font-weight:600;text-align:justify">${esc(g.t)}</div></div>`; }).join('')}</div>` : ''; },
    form: d => fld('عدد أيام الغياب', `<input type="number" min="0" max="20" id="dsNA" value="${(d.abs || []).length}">`) + fld('عدد الاستئذانات', `<input type="number" min="0" max="20" id="dsNP" value="${(d.perm || []).length}">`) +
      `<div class="fld" style="grid-column:1/-1"><label>الغياب: التاريخ والنوع</label><div id="dsA">${rowsA((d.abs || []).length, d.abs || [])}</div></div>` +
      `<div class="fld" style="grid-column:1/-1"><label>الاستئذان: التاريخ وعدد الساعات والنوع</label><div id="dsP">${rowsP((d.perm || []).length, d.perm || [])}</div></div>`,
    bind: (el, d) => { const f = $('#tf'); if (!f) return;
      const re = () => { const g = grab(f); $('#dsA', f).innerHTML = rowsA(Math.max(0, Math.min(20, +$('#dsNA', f).value || 0)), g.abs); $('#dsP', f).innerHTML = rowsP(Math.max(0, Math.min(20, +$('#dsNP', f).value || 0)), g.perm); };
      $('#dsNA', f).oninput = $('#dsNP', f).oninput = re; },
    pre: (r, f) => { const g = grab(f); r.abs = g.abs; r.perm = g.perm; const ds = [...g.abs, ...g.perm].map(x => x.date).filter(Boolean).sort(); r.date = ds[0] || today(); },
    check: r => [...r.abs, ...r.perm].some(x => !x.date) ? 'حدّدي التاريخ في كل خانة' : '',
    sum: r => [r.abs.length ? `غياب ${r.abs.length}` : '', r.perm.length ? `استئذان ${r.perm.length}` : ''].filter(Boolean).join(' · ') || 'لا غياب ولا استئذان',
    head: '<tr><th>التاريخ</th><th>الغياب</th><th>الاستئذان</th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td style="font-size:12px">${(r.d.abs || []).map(a => `${dmy(a.date)} (${esc(a.type)})`).join('<br>') || ((r.d.perm || []).length ? '—' : 'لا غياب ولا استئذان')}</td><td style="font-size:12px">${(r.d.perm || []).map(x => `${dmy(x.date)}: ${x.h} س (${esc(x.type)})`).join('<br>') || '—'}</td>`,
  });
}
