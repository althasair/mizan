/* الميزان — «إذنٌ مُيسَّر»: طلب الاستئذان واعتماده (المنسقة ← النائب الأكاديمي ← مديرة المدرسة) ثم تسجيله في الرصيد تلقائياً */
'use strict';

ICON.prq = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M16.5 17.2c.9-.9 2.3-.9 2.3.4 0 1.1-2.3 2.4-2.3 2.4s-2.3-1.3-2.3-2.4c0-1.3 1.4-1.3 2.3-.4z" fill="currentColor" stroke="none"/></svg>';

const PRQ_LIMIT = 10;
const PRQ_END = 14;   // نهاية الدوام 2:00 ظهراً
const PRQ_R = {
  'شخصي': ['موعد طبي', 'ظرف عائلي', 'مراجعة جهة', 'حاجة إلى راحة', 'ظرف طارئ'],
  'إذن عمل': ['ورشة تدريبية', 'مهمة رسمية', 'اجتماع خارجي', 'مرافقة طالبات'],
};
const PRQ_PH = ['في حفظ الله ورعايته', 'يسّر الله أمركِ وقضى حاجتكِ', 'رافقتكِ السلامة وعوداً حميداً', 'أعانكِ الله ويسّر لكِ'];
const PRQ_WHO = { coord: 'منسقة القسم', vp: 'النائب الأكاديمي', pr: 'مديرة المدرسة' };
const PRQ_TOP = { v: 'وَالْعَصْرِ  إِنَّ الْإِنسَانَ لَفِي خُسْرٍ  إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ', s: 'العصر' };
function prqVerse(used) {
  const r = used / PRQ_LIMIT;
  if (r >= 0.9) return { c: '#A3202F', v: 'وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا', s: 'الإسراء 34', h: '«إنّ الله يحب إذا عمل أحدكم عملاً أن يتقنه»' };
  if (r >= 0.75) return { c: '#B8521A', v: 'فَإِذَا فَرَغْتَ فَانصَبْ', s: 'الشرح 7' };
  if (r >= 0.5) return { c: '#946410', v: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا', s: 'الكهف 30' };
  return { c: '#17734A', v: 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ', s: 'التوبة 105' };
}
const prqKind = reason => PRQ_R['إذن عمل'].includes(reason) ? 'إذن عمل' : 'شخصي';
const prqTimes = (() => { const L = []; for (let m = 6 * 60 + 30; m <= 14 * 60; m += 15) L.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); return L; })();
const prqT12 = t => { if (!t) return ''; const h = +t.slice(0, 2), m = t.slice(3); return (h > 12 ? h - 12 : h) + ':' + m + (h >= 12 ? ' م' : ' ص'); };
const prqDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const prqDay = d => prqDays[new Date(d + 'T12:00:00').getDay()];

/* اليوم الافتراضي: اليوم، وبعد نهاية الدوام (2:00 ظهراً) أو في الإجازة الأسبوعية يصبح يوم العمل التالي */
function prqAutoDate() {
  const q = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Qatar' }));
  const off = x => x.getDay() === 5 || x.getDay() === 6 || (S.cal || []).some(c => c.k !== 'حدث' && /إجازة|عطلة/.test(c.t || '') && iso(x) >= c.from && iso(x) <= (c.to || c.from));
  const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  if (q.getHours() >= PRQ_END || off(q)) { do { q.setDate(q.getDate() + 1); } while (off(q)); }
  return iso(q);
}
const prqMine = () => S.records.filter(r => r.item === 'PRQ' && r.d && r.d.t === S.user.name).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.at || '').localeCompare(a.at || ''));
/* الساعات الشخصية المعتمدة في شهر (من الانضباط الوظيفي، ويشمل ما سجّله «إذنٌ مُيسَّر» تلقائياً) */
/* يُحتسب الإذن من الرصيد فور اعتماد المنسقة (ولو لم تعتمده النائبة بعد)، أو عند اعتماده النهائي */
const prqCounted = d => d.st === 'ok' || (['vp', 'pr'].includes(d.st) && (d.steps || []).some(s => s.w === 'coord'));
function prqUsed(name, month) {
  let h = 0; const prqIds = new Set();
  S.records.filter(r => r.item === 'TDS' && r.d && r.d.t === name).forEach(r => { if (r.d.prq) prqIds.add(r.d.prq); (r.d.perm || []).forEach(x => { if (String(x.date).slice(0, 7) === month && x.type !== 'إذن عمل') h += +x.h || 0; }); });
  S.records.filter(r => r.item === 'PRQ' && r.d && r.d.t === name && prqCounted(r.d) && !prqIds.has(r.id) && String(r.date).slice(0, 7) === month && r.d.kind !== 'إذن عمل').forEach(r => h += +r.d.h || 0);
  return Math.round(h * 100) / 100;
}
const prqPend = (name, month, except) => Math.round(S.records.filter(r => r.item === 'PRQ' && r.d && r.d.t === name && ['coord', 'vp', 'pr'].includes(r.d.st) && !prqCounted(r.d) && r.id !== except && String(r.date).slice(0, 7) === month && r.d.kind !== 'إذن عمل').reduce((a, r) => a + (+r.d.h || 0), 0) * 100) / 100;
const prqHrs = (a, b) => { if (!a || !b) return 0; const m = x => +x.slice(0, 2) * 60 + +x.slice(3); return Math.round((m(b) - m(a)) / 60 * 100) / 100; };
const prqNum = n => String(Math.round((+n || 0) * 100) / 100);

function prqChain(r) {
  const d = r.d; const order = ['coord', 'vp', 'pr']; const done = {}; (d.steps || []).forEach(s => done[s.w] = s);
  const L = order.slice(order.indexOf(d.first || 'coord') < 0 ? 0 : order.indexOf(d.first || 'coord'));
  return L.map(w => { const s = done[w], now = d.st === w, skip = !s && !now && L.slice(L.indexOf(w) + 1).some(z => done[z]);
    return `<span class="chip" style="font-size:11px;${s ? 'background:#E4F3EA;color:#17734A' : now ? 'background:#FBF1DB;color:#946410' : 'opacity:.55'}" title="${s ? esc(s.by + ' · ' + s.at) : ''}">${s ? '✓' : now ? '⏳' : skip ? '—' : '○'} ${PRQ_WHO[w]}</span>`; }).join(' ');
}
function prqStatus(r) {
  const d = r.d;
  if (d.st === 'ok') return '<span class="chip ok">معتمد ✓</span>';
  if (d.st === 'ret') return `<span class="chip" style="background:#FCEADB;color:#B8521A">أُعيد للتعديل</span>${d.ret && d.ret.note ? `<div style="font-size:12px;color:#B8521A">${esc(d.ret.by)}: ${esc(d.ret.note)}</div>` : ''}`;
  return `<span class="chip" style="background:#FBF1DB;color:#946410">بانتظار ${PRQ_WHO[d.st] || ''}</span>`;
}

/* منسقة قسم المعلمة: أول من يصله الطلب (وطلب المنسقة يصل للنائب مباشرة) */
const PRQ_COORD = { 'التربية الإسلامية': 'خولة المطوع', 'اللغة العربية': 'نجوى أبو ناهية', 'اللغة الإنجليزية': 'هيا الدوسري', 'العلوم الاجتماعية': 'فاطمة النعيمي', 'الرياضيات': 'سحر الرشيد', 'الأحياء': 'يسرا عبده', 'الكيمياء': 'انتصار أحمد', 'الفيزياء': 'أريج أبو حاشية', 'التربية البدنية': 'شيخة القحطاني', 'الحوسبة وتكنولوجيا المعلومات': 'فاتن الجوارنة', 'المهارات الحياتية والمهنية': 'خلود أبو خديجة', 'إدارة الأعمال': 'كوثر الدالي', 'الفنون البصرية': 'كوثر الدالي' };
function prqFirstName() {
  const dep = (S.user.dept || [])[0] || ''; const all = S.staffAll || [];
  const c = all.find(x => x.dept === dep && /منسق/.test(x.role || '') && x.name !== S.user.name) || (PRQ_COORD[dep] && PRQ_COORD[dep] !== S.user.name ? { name: PRQ_COORD[dep] } : null);
  return c ? 'منسقتكِ أ. ' + c.name : 'النائب الأكاديمي أ. آسيا الذبياني';
}
function prqGuide() {
  return `<div class="card prq-guide"><p class="prq-g1">معلمتي العزيزة، تخفيفًا عليكِ وحتى لا تكتبي طلبكِ في أكثر من مكان، أُنشئ تبويب «إذنٌ مُيسَّر»: طلبٌ واحد يصل إلى من يعتمده، ويُسجَّل وحده، وترين رصيدكِ في كل لحظة.</p>
    <p class="prq-g2">رصيدكِ <b>${PRQ_LIMIT} ساعات في الشهر</b>، و<b>إذن العمل</b> (ورشة، مهمة رسمية…) لا يُخصم منه. نوصيكِ باستثمار اليوم الدراسي حتى لا تحملي عملكِ إلى البيت، وبالمحافظة على ساعاتكِ للضرورة؛ فقد تحتاجينها آخر الشهر لأمرٍ مهم.</p>
    <ol class="prq-steps"><li>اختاري اليوم والوقت والسبب.</li><li>اضغطي «إرسال الطلب».</li><li>يصل طلبكِ إلى ${esc(prqFirstName())}، ويُحتسب من رصيدكِ فور اعتمادها.</li><li>يصلكِ إشعار فور الاعتماد النهائي.</li></ol></div>`;
}

/* ================================================================== السكرتارية: حصر الغياب والاستئذان (اطلاع وطباعة) */
const isSec = () => S.user && S.user.role === 'sec';
function S_prq(el) {
  setTitle('إذنٌ مُيسَّر — حصر الغياب والاستئذان');
  const all = S.records.filter(r => r.item === 'PRQ' && r.d && r.d.st !== 'ret');
  const t0 = today(); const MN = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const months = [...new Set(all.map(r => String(r.date).slice(0, 7)).concat([t0.slice(0, 7)]))].sort().reverse();
  const mo = S.secMo && months.includes(S.secMo) ? S.secMo : t0.slice(0, 7);
  const st = r => prqCounted(r.d) ? (r.d.st === 'ok' ? '<span class="chip ok">معتمد ✓</span>' : '<span class="chip" style="background:#E7F1FB;color:#1F4E8C">اعتمدته المنسقة</span>') : `<span class="chip" style="background:#FBF1DB;color:#946410">بانتظار ${PRQ_WHO[r.d.st] || ''}</span>`;
  const tm = r => r.d.from ? `${prqT12(r.d.from)} – ${prqT12(r.d.to)}` : '—';
  const todayL = all.filter(r => r.date === t0).sort((a, b) => String(a.d.from).localeCompare(String(b.d.from)));
  const M = all.filter(r => String(r.date).slice(0, 7) === mo);
  const by = {}; M.forEach(r => { const o = by[r.d.t] = by[r.d.t] || { t: r.d.t, dept: r.dept, n: 0, p: 0, w: 0, pend: 0 }; o.n++; if (r.d.kind === 'إذن عمل') o.w += +r.d.h || 0; else if (prqCounted(r.d)) o.p += +r.d.h || 0; else o.pend += +r.d.h || 0; });
  const rows = Object.values(by).sort((a, b) => a.dept.localeCompare(b.dept, 'ar') || b.p - a.p);
  const sum = k => Math.round(rows.reduce((a, o) => a + o[k], 0) * 10) / 10;
  const names = ['نجمة', 'نائلة'];
  el.innerHTML = `
  <div class="hero"><div class="pat pattern"></div><h2>مرحبًا بكنّ سكرتيراتنا الرائعات: ${names.join(' و')} 🌷</h2><p>هنا حصر الغياب والاستئذان من «إذنٌ مُيسَّر»، يتحدّث تلقائيًا كلما اعتُمد إذن، للاطلاع والطباعة.</p></div>
  <div class="card"><h2>📅 من استأذنت اليوم — ${prqDay(t0)} ${dmy(t0)} <span class="sub">${todayL.length} إذن</span></h2>
    <div class="tbl"><table class="t"><tr><th>الموظفة</th><th>القسم</th><th>الوقت</th><th>الساعات</th><th>النوع</th><th>الحالة</th></tr>
    ${todayL.map(r => `<tr><td><b>${esc(r.d.t)}</b></td><td>${esc(r.dept)}</td><td style="white-space:nowrap">${tm(r)}</td><td>${prqNum(r.d.h)}</td><td>${esc(r.d.kind || '')}</td><td>${st(r)}</td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">لا توجد أذونات اليوم</div></td></tr>'}</table></div></div>
  <div class="card"><h2>📋 حصر الغياب والاستئذان</h2>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">${months.map(m => `<button class="btn sm ${m === mo ? '' : 'sec'}" data-smo="${m}">${MN[+m.slice(5, 7) - 1]} ${m.slice(0, 4)}</button>`).join('')}<span style="flex:1"></span><button class="btn sm ghost" onclick="window.print()">🖨 طباعة</button></div>
    <div class="grid g4" style="margin-bottom:10px"><div class="kpi"><div class="v">${M.length}</div><div class="l">إذنًا في ${MN[+mo.slice(5, 7) - 1]}</div></div><div class="kpi"><div class="v">${rows.length}</div><div class="l">موظفة</div></div><div class="kpi"><div class="v">${prqNum(sum('p'))}</div><div class="l">ساعة شخصية</div></div><div class="kpi"><div class="v">${prqNum(sum('w'))}</div><div class="l">ساعة إذن عمل</div></div></div>
    <div class="tbl"><table class="t"><tr><th>#</th><th>الموظفة</th><th>القسم</th><th>الأذونات</th><th>ساعات شخصية</th><th>إذن عمل</th><th>المتبقي من ${PRQ_LIMIT}</th></tr>
    ${rows.map((o, i) => { const left = Math.max(0, PRQ_LIMIT - o.p); return `<tr><td>${i + 1}</td><td><b>${esc(o.t)}</b></td><td>${esc(o.dept)}</td><td>${o.n}</td><td>${prqNum(o.p)}${o.pend ? ` <small style="color:#946410">(+${prqNum(o.pend)} بانتظار)</small>` : ''}</td><td>${prqNum(o.w)}</td><td style="${left <= 2 ? 'background:#FBE7E9;font-weight:700' : ''}">${prqNum(left)}</td></tr>`; }).join('') || '<tr><td colspan="7"><div class="empty">لا توجد أذونات في هذا الشهر</div></td></tr>'}</table></div>
    <div class="note" style="margin-top:8px">رصيد كل موظفة ${PRQ_LIMIT} ساعات شهريًا، ويُحتسب الإذن فور اعتماد المنسقة. إذن العمل لا يُخصم من الرصيد.</div></div>`;
  $$('[data-smo]', el).forEach(b => b.onclick = () => { S.secMo = b.dataset.smo; S_prq(el); });
}

/* ================================================================== صفحة المعلمة */
function T_prq(el) {
  setTitle('إذنٌ مُيسَّر');
  const L = prqMine();
  const rec = S.edit && S.edit !== 'new' ? L.find(r => r.id === S.edit) : null;
  const d = rec ? Object.assign({}, rec.d, { date: rec.date }) : (S.prqDraft || { date: prqAutoDate() }); S.prqDraft = null;
  const month = String(d.date || today()).slice(0, 7);
  const used = prqUsed(S.user.name, month), pend = prqPend(S.user.name, month, rec && rec.id);
  const reasonIn = d.reason && !Object.values(PRQ_R).flat().includes(d.reason);
  el.innerHTML = `
  <div class="prq-top"><div class="prq-v">﴿${PRQ_TOP.v}﴾</div><small>${PRQ_TOP.s}</small></div>
  ${prqGuide()}
  <div class="grid g2" style="align-items:start">
  <div class="card"><h2>${ICON.prq} ${rec ? 'تعديل طلب الإذن' : 'طلب إذن'}</h2>
    <form class="form" id="pqf" onsubmit="return false">
      <div class="fld"><label>اليوم</label><input type="date" data-n="date" value="${esc(d.date)}" min="${today()}" required><small id="pqDay" style="color:var(--muted)"></small></div>
      <div class="fld"><label>عدد الساعات</label><div id="pqH" style="font-size:22px;font-weight:700;color:var(--maroon)">—</div></div>
      <div class="fld"><label>من الساعة</label><select data-n="from"><option value="">اختاري…</option>${prqTimes.map(t => `<option value="${t}" ${d.from === t ? 'selected' : ''}>${prqT12(t)}</option>`).join('')}</select></div>
      <div class="fld"><label>إلى الساعة</label><select data-n="to"><option value="">اختاري…</option>${prqTimes.map(t => `<option value="${t}" ${d.to === t ? 'selected' : ''}>${prqT12(t)}</option>`).join('')}</select></div>
      <div class="fld" style="grid-column:1/-1"><label>السبب</label><select data-n="reason" id="pqR"><option value="">اختاري السبب…</option>
        ${Object.entries(PRQ_R).map(([k, A]) => `<optgroup label="${k === 'شخصي' ? 'شخصي (يُحسب من الرصيد)' : 'إذن عمل (لا يُحسب من الرصيد)'}">${A.map(x => `<option ${d.reason === x ? 'selected' : ''}>${x}</option>`).join('')}</optgroup>`).join('')}
        <option value="__x" ${reasonIn ? 'selected' : ''}>سبب آخر (اكتبيه)</option></select>
        <input id="pqRx" placeholder="اكتبي السبب" value="${reasonIn ? esc(d.reason) : ''}" style="margin-top:6px;${reasonIn ? '' : 'display:none'}">
        <div id="pqK" style="margin-top:6px;${reasonIn ? '' : 'display:none'}"><label style="margin-inline-end:14px"><input type="radio" name="pqk" value="شخصي" ${d.kind !== 'إذن عمل' ? 'checked' : ''}> شخصي</label><label><input type="radio" name="pqk" value="إذن عمل" ${d.kind === 'إذن عمل' ? 'checked' : ''}> إذن عمل</label></div></div>
      <div class="fld" style="grid-column:1/-1"><label>ملاحظة (اختياري)</label><input data-n="note" value="${esc(d.note || '')}" placeholder="أي تفصيل تودّين إضافته"></div>
      <div id="pqW" style="grid-column:1/-1"></div>
      <div class="actions" style="grid-column:1/-1"><button class="btn" id="pqS">${rec ? 'إعادة الإرسال' : 'إرسال الطلب'}</button>${rec ? '<button class="btn sec" type="button" id="pqC">إلغاء التعديل</button>' : ''}</div>
    </form></div>
  <div class="card" id="pqBal"></div>
  </div>
  <div class="card"><h2>طلباتي (${L.length})</h2><div class="tbl"><table class="t"><tr><th>اليوم</th><th>الوقت</th><th>الساعات</th><th>السبب</th><th>الحالة</th><th>مسار الاعتماد</th><th></th></tr>
    ${L.map(r => `<tr><td>${prqDay(r.date)}<br><small>${dmy(r.date)}</small></td><td style="white-space:nowrap">${prqT12(r.d.from)} – ${prqT12(r.d.to)}</td><td><b>${prqNum(r.d.h)}</b></td><td>${esc(r.d.reason)}<br><small style="color:var(--muted)">${esc(r.d.kind)}</small></td><td>${prqStatus(r)}</td><td>${prqChain(r)}</td>
      <td style="white-space:nowrap">${r.d.st !== 'ok' ? `<button class="btn sm sec" data-pe="${r.id}">تعديل</button> <button class="btn sm ghost" data-px="${r.id}" style="color:#A33">إلغاء الطلب</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">لا توجد طلبات بعد</div></td></tr>'}</table></div>
    <div class="note" style="margin-top:8px">طلبكِ لا يراه إلا أنتِ ومن تعتمده. وبعد الاعتماد النهائي يُسجَّل في «الانضباط الوظيفي» تلقائياً دون إدخالٍ آخر.</div></div>`;
  const f = $('#pqf');
  const kindNow = () => { const r = $('#pqR', f).value; return r === '__x' ? (($('input[name="pqk"]:checked', f) || {}).value || 'شخصي') : r ? prqKind(r) : 'شخصي'; };
  const upd = () => {
    const dt = $('[data-n="date"]', f).value; $('#pqDay', f).textContent = dt ? 'يوم ' + prqDay(dt) : '';
    const h = prqHrs($('[data-n="from"]', f).value, $('[data-n="to"]', f).value); $('#pqH', f).textContent = h > 0 ? prqNum(h) + ' ساعة' : '—';
    const mo = String(dt || today()).slice(0, 7); const u0 = prqUsed(S.user.name, mo), p0 = prqPend(S.user.name, mo, rec && rec.id);
    const add = kindNow() === 'شخصي' && h > 0 ? h : 0; const left = Math.max(0, PRQ_LIMIT - u0);
    const V = prqVerse(u0 + p0 + add);
    $('#pqBal').innerHTML = `<h2>رصيدي — ${MONTHS[+mo.slice(5, 7) - 1]}</h2>
      <div class="prq-bal"><div class="prq-ring" style="--p:${Math.min(100, (u0 / PRQ_LIMIT) * 100)}%;--c:${V.c}"><b>${prqNum(left)}</b><small>ساعات</small></div>
      <div><div style="font-size:17px;font-weight:700">المتبقي لكِ ${prqNum(left)} ${left === 1 ? 'ساعة' : 'ساعات'}</div><div style="color:var(--muted);font-size:13px">من ${PRQ_LIMIT} ساعات شخصية في الشهر · المعتمد ${prqNum(u0)}${p0 ? ` · قيد الاعتماد ${prqNum(p0)}` : ''}</div>${kindNow() === 'إذن عمل' ? '<div class="chip ok" style="margin-top:4px">إذن العمل لا يُحسب من رصيدكِ</div>' : ''}</div></div>
      <div class="prq-verse" style="border-color:${V.c}"><div class="prq-v" style="color:${V.c}">﴿${V.v}﴾</div><small>${V.s}</small>${V.h ? `<div style="margin-top:6px;font-size:14px">قال رسول الله ﷺ: ${V.h}</div>` : ''}</div>`;
    $('#pqW', f).innerHTML = add && u0 + p0 + add > PRQ_LIMIT ? `<div class="note" style="background:#F9E3E6;color:#A3202F">هذا الطلب يتجاوز رصيدكِ الشهري (${PRQ_LIMIT} ساعات). يمكنكِ إرساله، والقرار لمن تعتمده.</div>` : '';
  };
  $('#pqR', f).onchange = () => { const x = $('#pqR', f).value === '__x'; $('#pqRx', f).style.display = $('#pqK', f).style.display = x ? '' : 'none'; upd(); };
  $$('input[name="pqk"],[data-n]', f).forEach(i => i.addEventListener('change', upd)); upd();
  if ($('#pqC')) $('#pqC').onclick = () => { S.edit = null; show(); };
  $$('[data-pe]', el).forEach(b => b.onclick = () => { S.edit = b.dataset.pe; show(); window.scrollTo(0, 0); });
  $$('[data-px]', el).forEach(b => b.onclick = async () => { if (!confirm('إلغاء هذا الطلب؟')) return; await call('delete', { id: b.dataset.px }); S.records = S.records.filter(x => x.id !== b.dataset.px); toast('تم إلغاء الطلب'); refresh(); });
  $('#pqS', f).onclick = async () => {
    const r = readForm(f); let reason = r.reason; if (reason === '__x') reason = $('#pqRx', f).value.trim();
    if (!r.date) return toast('حدّدي اليوم', 1); if (!r.from || !r.to) return toast('حدّدي وقت الإذن', 1);
    if (prqHrs(r.from, r.to) <= 0) return toast('وقت النهاية يجب أن يكون بعد وقت البداية', 1); if (!reason) return toast('اختاري سبب الإذن', 1);
    const btn = $('#pqS', f); if (btn.disabled) return; btn.disabled = true; btn.textContent = 'جارٍ الإرسال…';
    let j; try { j = await call('prqSubmit', { rec: { id: rec && rec.id, date: r.date, from: r.from, to: r.to, reason, kind: kindNow(), note: r.note } }); } finally { btn.disabled = false; btn.textContent = rec ? 'إعادة الإرسال' : 'إرسال الطلب'; }
    const i = S.records.findIndex(x => x.id === j.record.id); if (i >= 0) S.records[i] = j.record; else S.records.push(j.record);
    S.edit = null; refresh();
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="box" style="max-width:480px;text-align:center"><div style="font-size:40px">📨</div><h2 style="margin:6px 0">وصل طلبكِ بأمان</h2>
      <p style="line-height:2">يمرّ الآن على ${j.record.d.st === 'coord' ? 'منسقة القسم، ثم ' : ''}النائب الأكاديمي، ثم مديرة المدرسة،<br>وتصلكِ رسالة فور اعتماده بإذن الله.</p>
      <div style="font-family:'Aref Ruqaa',serif;font-size:22px;color:var(--maroon)">يسّر الله لكِ ما تقصدين</div>
      <div class="row" style="justify-content:center;margin-top:10px"><button class="btn" id="cOk">حسناً</button></div></div>`;
    document.body.appendChild(m); $('#cOk', m).onclick = () => m.remove();
  };
}

/* ================================================================== رسالة الموافقة: خط رقعة يكبر مع قلوب بيضاء */
function prqCelebrate() {
  if (!S.user || S.prqShown) return; S.prqShown = 1;
  const L = S.records.filter(r => r.item === 'PRQ' && r.d && r.d.t === S.user.name && r.d.st === 'ok' && !r.d.seen);
  if (!L.length) return;
  const ph = [...new Set(L.flatMap(r => (r.d.steps || []).map(s => s.ph)).filter(Boolean))];
  const m = document.createElement('div'); m.className = 'prq-cel';
  m.innerHTML = `<canvas></canvas><div class="prq-cel-in"><div class="prq-big">تمت الموافقة على إذنكِ</div><div class="prq-big2">${esc(ph[0] || PRQ_PH[0])}</div><div class="prq-big3">يومكِ سعيد 🤍</div>
    <div class="prq-sm">${L.map(r => `${prqDay(r.date)} ${dmy(r.date)} · ${prqT12(r.d.from)} – ${prqT12(r.d.to)}`).join('<br>')}${ph.length > 1 ? '<br>' + ph.slice(1).map(esc).join(' · ') : ''}</div>
    <button class="btn" id="cOk" style="background:#fff;color:var(--maroon);margin-top:14px">آمين، شكراً 🤍</button></div>`;
  document.body.appendChild(m);
  const c = $('canvas', m), x = c.getContext('2d'); const W = c.width = innerWidth, H = c.height = innerHeight;
  const P = Array.from({ length: 46 }, () => ({ x: Math.random() * W, y: H + Math.random() * H, s: 10 + Math.random() * 22, v: .6 + Math.random() * 1.6, a: Math.random() * 6, o: .45 + Math.random() * .5 }));
  let live = true;
  (function f() { if (!live) return; x.clearRect(0, 0, W, H); P.forEach(p => { p.y -= p.v; p.a += .02; if (p.y < -30) { p.y = H + 30; p.x = Math.random() * W; }
    x.save(); x.globalAlpha = p.o; x.fillStyle = '#fff'; x.font = p.s + 'px serif'; x.fillText('♥', p.x + Math.sin(p.a) * 14, p.y); x.restore(); }); requestAnimationFrame(f); })();
  try { chime(1); } catch (e) {}
  $('#cOk', m).onclick = () => { live = false; m.remove(); L.forEach(r => { r.d.seen = true; API.call('prqSeen', { id: r.id }).catch(() => {}); }); };
}

/* ================================================================== صفحة الاعتماد (المنسقة · النائب الأكاديمي · مديرة المدرسة) */
function prqLvl() { if (!S.user) return 0; if (S.user.id === 'p1' || (S.user.id !== 'admin' && S.user.role === 'admin' && /الرميحي/.test(S.user.name))) return 3; if (S.user.role === 'admin' && S.user.id === 'admin') return 2; if (S.user.role === 'coord') return 1; return 0; }
const PRQ_L = { coord: 1, vp: 2, pr: 3 };
function prqForMe() {
  const lv = prqLvl(); const me = lv === 3 ? 'pr' : lv === 2 ? 'vp' : 'coord';
  return S.records.filter(r => r.item === 'PRQ' && r.d && PRQ_L[r.d.st] && r.d.t !== S.user.name && (lv === 1 ? r.d.st === 'coord' && S.user.dept.includes(r.dept) : PRQ_L[r.d.st] <= lv))
    .map(r => Object.assign(r, { _mine: r.d.st === me })).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}
const prqPendN = () => prqLvl() ? prqForMe().filter(r => r._mine).length : 0;
function prqPhGet() { try { const o = JSON.parse(localStorage.getItem('mz_prqph') || 'null'); if (o && o.until >= today()) return o.p; } catch (e) {} return ''; }
function prqPhSet(p) { try { const u = new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10); localStorage.setItem('mz_prqph', JSON.stringify({ p, until: u })); } catch (e) {} }

function A_prq(el) {
  setTitle('إذنٌ مُيسَّر — الاعتماد');
  const lv = prqLvl(); const L = prqForMe(); const mineL = L.filter(r => r._mine), early = L.filter(r => !r._mine);
  const fixed = prqPhGet(); const ph = S.prqPh || fixed || PRQ_PH[0];
  const mo = S.prqMo || today().slice(0, 7);
  const all = S.records.filter(r => r.item === 'PRQ' && r.d);
  const okMo = all.filter(r => prqCounted(r.d) && String(r.date).slice(0, 7) === mo);
  const byT = {}; okMo.forEach(r => { const o = byT[r.d.t] = byT[r.d.t] || { dept: r.dept, p: 0, w: 0, n: 0 }; o[r.d.kind === 'إذن عمل' ? 'w' : 'p'] += +r.d.h || 0; o.n++; });
  const months = [...new Set(all.map(r => String(r.date).slice(0, 7)).concat([today().slice(0, 7)]))].sort().reverse();
  const row = (r, act) => { const u0 = prqUsed(r.d.t, String(r.date).slice(0, 7)); const tot = u0 + (r.d.kind === 'إذن عمل' ? 0 : +r.d.h || 0);
    return `<tr><td>${act ? `<input type="checkbox" data-pk="${r.id}" checked>` : ''}</td><td><b>${esc(r.d.t)}</b><br><small style="color:var(--muted)">${esc(r.dept)}</small></td><td>${prqDay(r.date)}<br><small>${dmy(r.date)}</small></td><td style="white-space:nowrap">${prqT12(r.d.from)} – ${prqT12(r.d.to)}<br><b>${prqNum(r.d.h)} س</b></td>
      <td>${esc(r.d.reason)}${r.d.note ? `<br><small>${esc(r.d.note)}</small>` : ''}<br><span class="chip" style="font-size:11px">${esc(r.d.kind)}</span></td>
      <td style="font-size:12px">${r.d.kind === 'إذن عمل' ? 'لا يُحسب' : `<b style="color:${tot > PRQ_LIMIT ? '#A3202F' : 'inherit'}">${prqNum(tot)}</b> من ${PRQ_LIMIT} بعد هذا الإذن`}</td><td>${prqChain(r)}</td>
      <td style="white-space:nowrap"><button class="btn sm" data-pa="${r.id}">✓ اعتماد</button> <button class="btn sm ghost" data-pr="${r.id}" style="color:#B8521A">إعادة للتعديل</button></td></tr>`; };
  const head = '<tr><th></th><th>المعلمة</th><th>اليوم</th><th>الوقت</th><th>السبب</th><th>رصيد الشهر</th><th>المسار</th><th></th></tr>';
  el.innerHTML = `
  <div class="prq-top"><div class="prq-v">﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا﴾</div><small>النساء 58</small></div>
  <div class="card"><h2>عبارة الاعتماد <span class="sub">تظهر للمعلمة مع رسالة الموافقة</span></h2>
    <div class="row" style="flex-wrap:wrap;gap:8px">${PRQ_PH.map(x => `<label class="chip" style="cursor:pointer;padding:6px 12px;${x === ph ? 'background:var(--maroon);color:#fff' : ''}"><input type="radio" name="pph" value="${esc(x)}" ${x === ph ? 'checked' : ''} style="display:none"> ${esc(x)}</label>`).join('')}</div>
    ${'Notification' in window && Notification.permission !== 'granted' ? '<button class="btn sec sm" id="pNot" style="float:left">🔔 تفعيل إشعارات هذا الجهاز</button>' : ''}<label style="display:block;margin-top:8px"><input type="checkbox" id="pfix" ${fixed && fixed === ph ? 'checked' : ''}> تثبيت هذه العبارة لهذا الأسبوع</label></div>
  <div class="card"><div class="row"><h2 style="margin:0">بانتظار اعتمادكِ (${mineL.length})</h2><span class="sp"></span>${mineL.length ? `<button class="btn" id="pAll">✓ اعتماد المحدد (${mineL.length})</button>` : ''}</div>
    <div class="tbl" style="margin-top:8px"><table class="t">${head}${mineL.map(r => row(r, 1)).join('') || '<tr><td colspan="8"><div class="empty">لا توجد طلبات بانتظاركِ الآن 🌿</div></td></tr>'}</table></div></div>
  ${early.length ? `<div class="card"><h2>في مراحل سابقة (${early.length}) <span class="sub">يمكنكِ اعتمادها مباشرة عند الحاجة</span></h2><div class="tbl"><table class="t">${head}${early.map(r => row(r, 0)).join('')}</table></div></div>` : ''}
  ${lv >= 2 ? `<div class="card"><div class="row"><h2 style="margin:0">تقرير الساعات الشهري</h2><span class="sp"></span><select id="pMo">${months.map(m => `<option value="${m}" ${m === mo ? 'selected' : ''}>${MONTHS[+m.slice(5, 7) - 1]} ${m.slice(0, 4)}</option>`).join('')}</select><button class="btn sec noprint" onclick="window.print()">طباعة</button></div>
    <div class="tbl" style="margin-top:8px"><table class="t"><tr><th>المعلمة</th><th>القسم</th><th>عدد الأذونات</th><th>الشخصي (من ${PRQ_LIMIT})</th><th>إذن عمل</th></tr>
    ${Object.entries(byT).sort((a, b) => b[1].p - a[1].p).map(([t, o]) => `<tr><td><b>${esc(t)}</b></td><td>${esc(o.dept)}</td><td>${o.n}</td><td><b style="color:${o.p > PRQ_LIMIT ? '#A3202F' : o.p >= 8 ? '#B8521A' : 'inherit'}">${prqNum(o.p)}</b></td><td>${prqNum(o.w)}</td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">لا أذونات معتمدة في هذا الشهر</div></td></tr>'}</table></div></div>` : ''}`;
  const curPh = () => ($('input[name="pph"]:checked', el) || {}).value || PRQ_PH[0];
  $$('input[name="pph"]', el).forEach(i => i.onchange = () => { S.prqPh = i.value; if ($('#pfix').checked) prqPhSet(i.value); show(); });
  if ($('#pNot')) $('#pNot').onclick = () => { try { Notification.requestPermission().then(p => { toast(p === 'granted' ? 'تم تفعيل الإشعارات على هذا الجهاز ✓' : 'لم يُسمح بالإشعارات من المتصفح', p !== 'granted'); if (p === 'granted') { prqBell(); show(); } }); } catch (e) { toast('هذا المتصفح لا يدعم الإشعارات', 1); } };
  $('#pfix').onchange = e => { if (e.target.checked) prqPhSet(curPh()); else try { localStorage.removeItem('mz_prqph'); } catch (x) {} };
  if ($('#pMo')) $('#pMo').onchange = e => { S.prqMo = e.target.value; show(); };
  const run = async (ids, act, note) => {
    if (S.prqBusy) return; S.prqBusy = 1; $$('[data-pa],[data-pr],#pAll', el).forEach(b => b.disabled = true);
    try {
    const j = await call('prqAct', { ids, act, phrase: curPh(), fix: $('#pfix').checked, note });
    j.records.forEach(r => { const i = S.records.findIndex(x => x.id === r.id); if (i >= 0) S.records[i] = r; else S.records.push(r); });
    if (j.skipped && j.skipped.length) toast(j.skipped[0], 1); else toast(act === 'ret' ? 'أُعيد الطلب للمعلمة ✓' : `تم الاعتماد ✓ (${ids.length}) — ${curPh()}`);
    } finally { S.prqBusy = 0; }
    refresh();
  };
  $$('[data-pa]', el).forEach(b => b.onclick = () => run([b.dataset.pa], 'ok'));
  $$('[data-pr]', el).forEach(b => b.onclick = () => { const n = prompt('سبب الإعادة للتعديل (يصل للمعلمة):', ''); if (n === null) return; run([b.dataset.pr], 'ret', n); });
  if ($('#pAll')) $('#pAll').onclick = () => { const ids = $$('[data-pk]', el).filter(c => c.checked).map(c => c.dataset.pk); if (!ids.length) return toast('حدّدي طلباً واحداً على الأقل', 1); run(ids, 'ok'); };
}

/* تنبيه فوري عند الدخول: طلبات إذن بانتظار اعتمادكِ */
function prqBell() {   // جرس تنبيه واضح (ثلاث نغمات) بلا ملفات خارجية
  try { const C = new (window.AudioContext || window.webkitAudioContext)();
    [[880, 0], [1175, .22], [1568, .44], [880, .9], [1175, 1.12], [1568, 1.34]].forEach(([f, d]) => { const o = C.createOscillator(), g = C.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(C.destination);
      const t = C.currentTime + d; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.start(t); o.stop(t + 0.55); });
  } catch (e) {}
}
function prqSysNote(n) {   // إشعار على شاشة الجهاز (عند السماح بالإشعارات)
  try { if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const t = 'إذنٌ مُيسَّر', b = 'لديكِ ' + n + ' طلب إذن بانتظار اعتمادكِ';
    if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.getRegistration().then(r => r ? r.showNotification(t, { body: b, icon: 'icons/192.png', tag: 'prq', renotify: true }) : new Notification(t, { body: b, tag: 'prq' })).catch(() => new Notification(t, { body: b, tag: 'prq' }));
    else new Notification(t, { body: b, tag: 'prq' });
  } catch (e) {}
}
/* متابعة تلقائية كل 3 دقائق ما دام الميزان مفتوحاً: أي طلب جديد يُنبَّه له بالصوت والرسالة وإشعار الجهاز */
function prqWatch() {
  if (S.prqWatching || !prqLvl()) return; S.prqWatching = 1;
  S.prqKnown = new Set(prqForMe().filter(r => r._mine).map(r => r.id));
  setInterval(async () => {
    try { const j = await API.call('records', {}); if (!j || !j.records) return;
      const P = j.records.filter(r => r.item === 'PRQ'); S.records = S.records.filter(r => r.item !== 'PRQ').concat(P);
      const L = prqForMe().filter(r => r._mine), fresh = L.filter(r => !S.prqKnown.has(r.id)); L.forEach(r => S.prqKnown.add(r.id));
      if (fresh.length) { S.prqAlerted = 0; $$('.modal.prq-al').forEach(x => x.remove()); prqAlert(); if (S.view === 'a_prq') show(); else { const nav = $('#nav'); if (nav && typeof navHTML === 'function') { nav.innerHTML = navHTML(); } } }
    } catch (e) {}
  }, 180000);
}
function prqAlert() {
  if (!S.user || S.prqAlerted || !prqLvl()) return; prqWatch(); const n = prqPendN(); if (!n) return; S.prqAlerted = 1;
  prqBell(); prqSysNote(n);
  const L = prqForMe().filter(r => r._mine);
  const m = document.createElement('div'); m.className = 'modal prq-al';
  m.innerHTML = `<div class="box" style="max-width:520px;text-align:center"><div style="font-size:42px;color:var(--maroon)">${ICON.prq.replace(/width="18" height="18"/, 'width="54" height="54"')}</div>
    <h2 style="margin:6px 0">إذنٌ مُيسَّر</h2><p style="font-size:17px;margin:4px 0 10px">لديكِ <b style="color:var(--maroon)">${n}</b> ${n === 1 ? 'طلب إذن' : n === 2 ? 'طلبا إذن' : 'طلبات إذن'} بانتظار اعتمادكِ</p>
    <div style="text-align:right;max-height:220px;overflow:auto;font-size:14px;line-height:2;background:#FAFBFC;border-radius:10px;padding:8px 12px">${L.map(r => `• <b>${esc(r.d.t)}</b> — ${prqDay(r.date)} ${dmy(r.date)} · ${prqT12(r.d.from)}–${prqT12(r.d.to)} · ${esc(r.d.reason)}`).join('<br>')}</div>
    <div class="row" style="justify-content:center;margin-top:12px;gap:8px"><button class="btn" id="paGo">افتحي الاعتماد</button><button class="btn sec" id="paLater">لاحقاً</button></div></div>`;
  document.body.appendChild(m);
  $('#paLater', m).onclick = () => m.remove();
  $('#paGo', m).onclick = () => { m.remove(); S.view = 'a_prq'; S.edit = null; refresh(); };
}
