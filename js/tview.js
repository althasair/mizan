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
const TPA_WAY = ['اتصال هاتفي', 'رسالة نصية أو واتساب', 'حضور فعالية في المدرسة', 'حضور درس معايشة أو مشاهدة', 'مشاركة في جدارية أو نشاط', 'رسالة صوتية للطالبة', 'اجتماع فردي'];
const TPA_TOPIC = ['متابعة المستوى الأكاديمي', 'السلوك والانضباط', 'الغياب والتأخر', 'التعزيز والتحفيز', 'دعوة لفعالية أو نشاط', 'تكريم الطالبة'];
const TACH_KIND = ['مشاركة', 'إنجاز (مركز أو جائزة)'];
const TACH_LVL = ['على مستوى المدرسة', 'على مستوى الدولة', 'دولي'];
const TA_TG = ['طالبات الصف العاشر', 'طالبات الصف الحادي عشر', 'طالبات الصف الثاني عشر', 'جميع الطالبات', 'طالبات شعبتي', 'الطالبات الواعدات', 'الموهوبات والمتفوقات', 'أولياء الأمور', 'المعلمات'];

/* الفترة الحالية حسب التاريخ: تدخل المعلمة عليها مباشرة */
function curPer() { const t = today(); return S.periods.find(p => t >= p.from && t <= p.to) || [...S.periods].reverse().find(p => p.from <= t) || S.periods[0]; }
const mine = it => S.records.filter(r => r.item === it && r.d && r.d.t === S.user.name).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const inCur = r => inP(r.date, curPer());
const others = () => (S.staffAll || []).filter(s => s.name !== S.user.name && s.role !== 'منسقة');
const listTxt = a => (Array.isArray(a) ? a : [a]).filter(Boolean).join('، ');

function T_navHTML() {
  const it = (v, t, ic, n) => `<a class="it ${S.view === v ? 'on' : ''}" data-v="${v}">${ICON[ic] || ICON.dot}<span>${t}</span>${n ? `<span class="n">${n}</span>` : ''}</a>`;
  const n = k => mine(k).filter(inCur).length;
  return `${it('home', 'الرئيسية', 'home')}<div class="grp">سجلّي — ${esc(curPer().name)}</div>${it('t_pv', 'الزيارات التبادلية', 'scale', n('TPV'))}${it('t_ws', 'الورش وتطوير الزملاء', 'doc', n('TWS'))}${it('t_pa', 'التواصل مع أولياء الأمور', 'user', n('TPA'))}${it('t_ach', 'الإنجازات والمشاركات', 'star', n('TACH'))}${it('t_act', 'الأنشطة والمبادرات', 'cal', n('TA'))}`;
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
  <div class="grid g2" style="margin-top:14px">${[['t_pv', 'الزيارات التبادلية', 'سجّلي زيارتكِ لزميلة: لماذا اخترتِها، وما استفدتِه، وما ستطبقينه.'], ['t_ws', 'الورش وتطوير الزملاء', 'ما حضرتِه من ورش داخلية وخارجية، وما قدّمتِه لزميلاتكِ.'], ['t_pa', 'التواصل مع أولياء الأمور', 'كل تواصل مع ولي أمر: الطريقة والموضوع والنتيجة.'], ['t_ach', 'الإنجازات والمشاركات', 'مشاركات طالباتكِ ومراكزهن في المسابقات.'], ['t_act', 'الأنشطة والمبادرات', 'نشاط استحدثتِه، أو نشاط قائم شاركتِ فيه، أو مبادرة من فكرتكِ.']].map(([v, t, s]) => `<div class="card" style="cursor:pointer" data-go="${v}"><h2>${esc(t)}</h2><p style="color:var(--muted);margin:0">${esc(s)}</p></div>`).join('')}</div>`;
  $$('[data-go]', el).forEach(c => c.onclick = () => { S.view = c.dataset.go; S.edit = 'new'; refresh(); });
}

/* ---------- محرك نماذج بسيط ---------- */
const fSel = (n, opts, v, ph) => `<select data-n="${n}"><option value="">${esc(ph || 'اختاري…')}</option>${opts.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
const fCombo = (n, opts, v, ph) => `<input data-n="${n}" list="dl_${n}" value="${esc(v || '')}" placeholder="${esc(ph || 'اختاري من القائمة أو اكتبي')}"><datalist id="dl_${n}">${opts.map(o => `<option value="${esc(o)}">`).join('')}</datalist>`;
const fMulti = (n, opts, v) => { const cur = Array.isArray(v) ? v : (v ? [v] : []); const extra = cur.filter(x => !opts.includes(x));
  return `<div class="multi" data-m="${n}" style="border:1px solid var(--line);border-radius:12px;padding:6px 10px;max-height:170px;overflow:auto;font-size:12px;line-height:1.9">${opts.map(o => `<label style="display:block"><input type="checkbox" value="${esc(o)}" ${cur.includes(o) ? 'checked' : ''}> ${esc(o)}</label>`).join('')}<input data-mx="${n}" value="${esc(extra.join('، '))}" placeholder="أخرى (اكتبي)" style="width:100%;margin-top:4px;font-size:12px"></div>`; };
const fRadio = (n, opts, v) => `<div class="row" style="gap:14px;font-size:13px">${opts.map(o => `<label><input type="radio" name="r_${n}" value="${esc(o)}" ${o === v ? 'checked' : ''}> ${esc(o)}</label>`).join('')}</div>`;
const staffSel = (n, v) => { const by = {}; others().forEach(s => (by[s.dept] = by[s.dept] || []).push(s.name));
  return `<select data-n="${n}"><option value="">اختاري المعلمة…</option>${Object.keys(by).sort((a, b) => a.localeCompare(b, 'ar')).map(dp => `<optgroup label="${esc(dp)}">${by[dp].sort((a, b) => a.localeCompare(b, 'ar')).map(x => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('')}</optgroup>`).join('')}</select>`; };
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
     ${fld('التاريخ', `<input type="date" data-n="date" value="${esc(d.date || today())}" min="${p.from}" max="${p.to}" required>`)}
     <div class="actions" style="grid-column:1/-1"><button class="btn" id="tsave">حفظ</button>${rec && cfg.item !== 'TA' ? '<button class="btn ghost" type="button" id="tdel">حذف</button>' : ''}<button class="btn sec" type="button" id="tcx">إلغاء</button></div></form></div>` : '';
  el.innerHTML = `${cfg.top ? cfg.top() : ''}<div class="note">${esc(cfg.note || '')} التسجيل متاح في الفترة الحالية فقط: ${esc(p.name)} (${dmy(p.from)} – ${dmy(p.to)}).</div>${form}
  <div class="card"><div class="row"><h2 style="margin:0">${esc(cfg.title)} — ${esc(p.name)} (${cur.length})</h2><span class="sp"></span>${cfg.actions || ''}${S.edit ? '' : '<button class="btn" id="tnew">+ تسجيل جديد</button>'}</div>
  <div class="tbl" style="margin-top:10px"><table class="t">${cfg.head}${cur.map(r => `<tr>${cfg.row(r)}<td><button class="btn sm sec" data-e="${r.id}">فتح</button></td></tr>`).join('') || `<tr><td colspan="9"><div class="empty">لا توجد سجلات في هذه الفترة بعد</div></td></tr>`}</table></div></div>${cfg.bottom ? cfg.bottom() : ''}`;
  if ($('#tnew')) $('#tnew').onclick = () => { S.edit = 'new'; show(); };
  $$('[data-e]', el).forEach(b => b.onclick = () => { S.edit = b.dataset.e; show(); window.scrollTo(0, 0); });
  if (cfg.bind) cfg.bind(el, d);
  if ($('#tcx')) $('#tcx').onclick = () => { S.edit = null; show(); };
  if ($('#tdel')) $('#tdel').onclick = async () => { if (!confirm('حذف هذا السجل؟')) return; await call('delete', { id: rec.id }); S.records = S.records.filter(x => x.id !== rec.id); S.edit = null; refresh(); };
  if ($('#tsave')) $('#tsave').onclick = async () => {
    const f = $('#tf'); const r = Object.assign({}, d, readT(f));
    if (cfg.files) for (const k of cfg.files) { const inp = $(`[data-file="${k}"]`, f); if (inp && inp.files[0]) { const fl = inp.files[0]; if (fl.size > 8e6) return toast('حجم الملف أكبر من 8 ميجابايت', 1); const j = await call('upload', { name: fl.name, data: await fileToData(fl) }); r[k] = { fid: j.fid, name: j.name }; } }
    if (cfg.pre) cfg.pre(r, f);
    const err = cfg.check ? cfg.check(r) : ''; if (err) return toast(err, 1);
    if (!r.date || r.date < p.from || r.date > p.to) return toast('التاريخ يجب أن يكون ضمن ' + p.name, 1);
    const j = await call('save', { rec: { id: rec && rec.id, dept: S.user.dept[0], item: cfg.item, date: r.date, sum: cfg.sum(r), d: r } });
    const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record);
    S.edit = null; toast('تم الحفظ ✓ — ويظهر في تقرير القسم'); refresh();
    if (cfg.item === 'TPV' && !rec) { const n = mine('TPV').filter(x => monthOf(x.date) === monthOf(r.date)).length; const h = pvCheer(n); if (h) { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="box" style="max-width:520px">${h}<div class="row" style="margin-top:10px"><button class="btn" id="cOk">شكراً</button></div></div>`; document.body.appendChild(m); $('#cOk', m).onclick = () => m.remove(); } }
  };
}
const fileLink = f => f && f.fid ? `<button class="btn sm ghost" data-fid="${esc(f.fid)}">${esc(f.name || 'ملف')}</button>` : '';
document.addEventListener('click', async e => { const b = e.target.closest && e.target.closest('[data-fid]'); if (!b) return; e.preventDefault(); const j = await call('file', { fid: b.dataset.fid }); const a = document.createElement('a'); a.href = j.data; a.download = j.name; a.click(); });

/* ================================================================== الزيارات التبادلية */
const monthOf = d => String(d || '').slice(0, 7);
function pvCheer(n) {
  const nm = 'أ. ' + esc(S.user.name);
  if (n >= 3) return `<div class="card" style="background:linear-gradient(90deg,#FFF8E6,#fff);border-inline-start:4px solid var(--gold)"><div style="font-size:22px;color:var(--gold);letter-spacing:4px">★★★</div><p style="margin:4px 0 0;text-align:justify;font-weight:600">${nm}، أنتِ فعلاً حريصة على تطوير ذاتكِ، ونحن نفتخر بكِ معلمةً منفتحة على التغيير، تبحث عن الأفضل لطالباتها وتجدّد أساليبها بحب. بارك الله جهودكِ وجعلها في ميزان حسناتكِ.</p></div>`;
  if (n === 2) return `<div class="card" style="background:linear-gradient(90deg,#F2FBFA,#fff);border-inline-start:4px solid var(--tiffany-d)"><div style="font-size:20px;color:var(--tiffany-d);letter-spacing:4px">★★</div><p style="margin:4px 0 0;text-align:justify;font-weight:600">ما أجمل حرصكِ يا ${nm}! زيارتكِ الثانية هذا الشهر دليل على شغفكِ بالتعلّم المستمر وتقديركِ لخبرات زميلاتكِ. وزيارة ثالثة تضعكِ في مصافّ المعلمات المبادِرات إلى تطوير ذواتهن.</p></div>`;
  if (n === 1) return `<div class="card" style="border-inline-start:4px solid var(--maroon)"><div style="font-size:18px;color:var(--maroon)">★</div><p style="margin:4px 0 0;text-align:justify;font-weight:600">شكراً لكِ ${nm} على زيارتكِ التبادلية هذا الشهر؛ خطوة جميلة في تبادل الخبرات، يعود أثرها على طالباتكِ.</p></div>`;
  return '';
}
function T_pv(el) {
  T_page(el, {
    item: 'TPV', title: 'الزيارات التبادلية', one: 'زيارة تبادلية', top: () => pvCheer(mine('TPV').filter(r => monthOf(r.date) === monthOf(today())).length), note: 'المطلوب زيارة تبادلية إلى زيارتين شهرياً. اختاري من القوائم أو اكتبي.',
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
    item: 'TWS', title: 'الورش وتطوير الزملاء', one: 'ورشة أو مساهمة', note: 'سجّلي ما حضرتِه من ورش داخلية وخارجية، وما قدّمتِه لتطوير زميلاتكِ (ورشة، جلسة نقاش، ورقة عمل، نموذج مميز، فكرة).',
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
function T_pa(el) {
  const secs = String(meStaff().secs || '').split(/[،,]/).map(x => x.trim()).filter(Boolean);
  T_page(el, {
    item: 'TPA', title: 'التواصل مع أولياء الأمور', one: 'تواصل مع أولياء الأمور', note: 'سجّلي كل تواصل: الطريقة والموضوع وعدد أولياء الأمور، ويُحسب لكِ في سنابلكِ.',
    form: d => fld('الشعبة', fSel('s', secs, d.s, 'اختاري الشعبة')) + fld('طريقة التواصل', fCombo('way', TPA_WAY, d.way)) + fld('الموضوع', fCombo('topic', TPA_TOPIC, d.topic)) +
      fld('عدد أولياء الأمور', `<input type="number" min="1" data-n="n" value="${esc(d.n || 1)}">`) + (S.tStu = d.stu || [], '') + fld('الطالبات', '<div id="stuBox" style="border:1px solid var(--line);border-radius:12px;padding:8px 10px;max-height:260px;overflow:auto"></div>', 1) + fld('النتيجة / ما تم الاتفاق عليه', `<input data-n="res" value="${esc(d.res || '')}">`, 1),
    check: r => !r.way ? 'اختاري طريقة التواصل' : '',
    sum: r => 'تواصل مع أولياء الأمور: ' + (r.way || ''),
    pre: (r, f) => { r.stu = $$('[data-stu]', f).filter(c => c.checked).map(c => c.value); if (r.stu.length) r.n = r.stu.length; },
    head: '<tr><th>التاريخ</th><th>الشعبة</th><th>الطريقة</th><th>الموضوع</th><th>العدد والطالبات</th><th>النتيجة</th><th></th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td>${esc(r.d.s || '')}</td><td>${esc(r.d.way || '')}</td><td>${esc(r.d.topic || '')}</td><td>${esc(r.d.n || 1)}${(r.d.stu || []).length ? `<div style="font-size:11px;color:var(--muted)">${esc(r.d.stu.join('، '))}</div>` : ''}</td><td style="font-size:12px">${esc(r.d.res || '')}</td><td><button class="btn sm ghost" data-copy="${r.id}" title="نسخ الإجراء نفسه لطالبات أخريات">نسخ لطالبات أخريات</button></td>`,
    bind: el => { $$('[data-copy]', el).forEach(b => b.onclick = () => { const r = S.records.find(x => x.id === b.dataset.copy); S.tDraft = Object.assign({}, r.d, { s: '', stu: [], n: '' }); delete S.tDraft._key; S.edit = 'new'; show(); window.scrollTo(0, 0); toast('اختاري الشعبة والطالبات، ثم احفظي'); });
      const f = $('#tf'); if (!f) return; const sel = $('[data-n="s"]', f), box = $('#stuBox', f);
      const draw = () => { const sc = sel.value.trim(); const L = (S.students || []).filter(x => x.s === sc).map(x => x.n).sort((a, b) => a.localeCompare(b, 'ar')); const cur = new Set(S.tStu || []);
        box.innerHTML = !sc ? '<div style="color:var(--muted);font-size:12px">اختاري الشعبة فتظهر أسماء طالباتها</div>' : !L.length ? '<div style="color:var(--muted);font-size:12px">لا توجد أسماء لهذه الشعبة بعد</div>' :
          `<label style="display:block;font-weight:700;font-size:12px;margin-bottom:4px"><input type="checkbox" id="stuAll"> تحديد الكل (${L.length})</label><div style="columns:3 180px;font-size:12px;line-height:1.9">${L.map(n => `<label style="display:block"><input type="checkbox" data-stu value="${esc(n)}" ${cur.has(n) ? 'checked' : ''}> ${esc(n)}</label>`).join('')}</div>`;
        const all = $('#stuAll', box); if (all) all.onchange = () => $$('[data-stu]', box).forEach(c => c.checked = all.checked);
        $$('[data-stu]', box).forEach(c => c.onchange = () => { const n = $$('[data-stu]', box).filter(x => x.checked).length; if (n) $('[data-n="n"]', f).value = n; }); };
      S.tStu = null; sel.onchange = draw; draw(); },
  });
}

/* ================================================================== الإنجازات والمشاركات */
function T_ach(el) {
  T_page(el, {
    item: 'TACH', title: 'الإنجازات والمشاركات', one: 'إنجاز أو مشاركة', note: 'مشاركات طالباتكِ في المسابقات والفعاليات، ومراكزهن إن وُجدت.', blank: { kind: TACH_KIND[0] },
    form: d => fld('النوع', fRadio('kind', TACH_KIND, d.kind), 1) + fld('اسم المسابقة / الفعالية', `<input data-n="name" value="${esc(d.name || '')}" required>`, 1) + fld('الجهة المنظمة', `<input data-n="ent" value="${esc(d.ent || '')}">`) + fld('المستوى', fSel('lvl', TACH_LVL, d.lvl)) +
      fld('الطالبات المشاركات', `<input data-n="stu" value="${esc(d.stu || '')}" placeholder="الأسماء أو العدد">`, 1) + fld('النتيجة / المركز', `<input data-n="res" value="${esc(d.res || '')}">`),
    check: r => !r.name ? 'اكتبي اسم المسابقة أو الفعالية' : '',
    sum: r => r.kind + ': ' + r.name,
    head: '<tr><th>التاريخ</th><th>النوع</th><th>المسابقة / الفعالية</th><th>الجهة</th><th>الطالبات</th><th>النتيجة</th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td><span class="chip ${r.d.kind === TACH_KIND[1] ? 'ok' : ''}">${esc(r.d.kind)}</span></td><td><b>${esc(r.d.name)}</b></td><td>${esc(r.d.ent || '')}</td><td style="font-size:12px">${esc(r.d.stu || '')}</td><td>${esc(r.d.res || '')}</td>`,
  });
}

/* ================================================================== الأنشطة والمبادرات (نفس سجل سبع سنابل) */
function T_act(el) {
  T_page(el, {
    item: 'TA', title: 'الأنشطة والمبادرات', one: 'نشاط أو مبادرة', note: 'نشاط استحدثتِه مع طالباتكِ، أو نشاط قائم في المدرسة شاركتِ فيه، أو مبادرة من فكرتكِ. (الحذف للنائب الأكاديمي فقط)', blank: { kind: 'نشاط', src: TA_SRC[0] },
    form: d => fld('النوع', fRadio('kind', ['نشاط', 'مبادرة'], d.kind), 1) + fld('نوع النشاط', fRadio('src', TA_SRC, d.src), 1) + fld('الاسم', fCombo('name', S.acts || [], d.name, 'اكتبي الاسم أو اختاري من أنشطة المدرسة'), 1) +
      fld('الفئة المستهدفة', fSel('tg', TA_TG, d.tg)) + fld('الأولوية التي يخدمها', fSel('p', REF.PRIO || [], d.p)) + fld('عدد الطالبات', `<input type="number" min="0" data-n="n" value="${esc(d.n || '')}">`) + fld('وصف مختصر وأثره', `<input data-n="desc" value="${esc(d.desc || '')}">`, 1),
    check: r => !r.name ? 'اكتبي اسم النشاط أو المبادرة' : '',
    sum: r => r.kind + ': ' + r.name,
    head: '<tr><th>التاريخ</th><th>النوع</th><th>الاسم</th><th>الفئة</th><th>الأولوية</th><th></th></tr>',
    row: r => `<td>${dmy(r.date)}</td><td><span class="chip ${r.d.kind === 'مبادرة' ? 'tf' : ''}">${esc(r.d.kind)}</span></td><td><b>${esc(r.d.name)}</b></td><td style="font-size:12px">${esc(r.d.tg || '')}</td><td style="font-size:12px">${esc(r.d.p || '')}</td>`,
  });
}
