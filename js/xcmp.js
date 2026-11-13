/* ================================================================== تعويض الطالبات عن الحصص الفائتة بسبب خروجهن للأنشطة
   الحصص الفائتة مستخرجة من كشوف تسهيل الخروج (أخصائية الأنشطة) مطابقةً بالجدول المدرسي المعتمد؛ والمعلمة تؤشّر «تم التعويض» فيرتبط التعويض بالخروج تلقائياً */
const XM_EX = [
  { k: 'deb', d: '2026-11-04', act: 'تدريب مناظرات قطر — المدينة التعليمية', m: /مناظرات/ },
  { k: 'ryd', d: '2026-11-04', act: 'تدريب مسابقة الريادة الاجتماعية', m: /الريادة/ },
  { k: 'chm', d: '2026-11-05', act: 'نشاط «كيمياء خضراء»', m: /كيمياء خضراء/ },
  { k: 'dkh', d: '2026-11-11', act: 'الترويج لمعرض «ذخر الدار»', m: /ذخر الدار/ },
];
const XM_ROWS = [   // [الخروج، الصف، الحصة، المادة الفائتة، المعلمة]
  ['deb', '12-4', 3, 'الأحياء', 'أمل ناجي'], ['deb', '12-4', 4, 'الفيزياء', 'أريج أبو حاشية'], ['deb', '12-4', 5, 'التربية الإسلامية', 'وفاء أحمد'],
  ['deb', '11-2', 3, 'التربية البدنية', 'هيا الودعاني'], ['deb', '11-2', 4, 'الكيمياء', 'إسراء عزت'], ['deb', '11-2', 5, 'اللغة العربية', 'تسنيم سمير'],
  ['deb', '11-5', 3, 'الكيمياء', 'عبير أحمد'], ['deb', '11-5', 4, 'الرياضيات', 'عبير عيسى'], ['deb', '11-5', 5, 'الرياضيات', 'عبير عيسى'],
  ['deb', '10-5', 3, 'اللغة العربية', 'ذكريات عبدالعزيز'], ['deb', '10-5', 4, 'الرياضيات', 'آلاء خميس'], ['deb', '10-5', 5, 'الدراسات الاجتماعية', 'نورة المظفر'],
  ['ryd', '11-7', 7, 'اللغة العربية', 'سعاد فريد'],
  ['chm', '10-4', 3, 'المهارات الحياتية', 'خلود النعيمي'], ['chm', '11-3', 3, 'التربية الإسلامية', 'ردينة عبداللطيف'], ['chm', '11-2', 3, 'الفيزياء', 'إسراء بركات'],
  ['dkh', '12-6', 6, 'الجغرافيا', 'سارة باوزير'],
];
const XM_HOW = ['حصة دراسية بدلاً عن مادة أخرى', 'الاستراحة', 'استراحة الصلاة', 'حصة نشاط', 'أخرى'];
const XM_PER = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة'];
const xmN = s => String(s || '').replace(/[ً-ْـ\s]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
const xmKey = x => `${x.ex}|${x.c}|${x.p}`;
function xmAll() {   // كل الحصص الفائتة مع حالة التعويض
  const C = {}; S.records.filter(r => r.item === 'XCMP' && r.d).forEach(r => C[r.d.k] = r);
  return XM_ROWS.map(([ex, c, p, s, t]) => { const E = XM_EX.find(e => e.k === ex); const o = { ex, c, p, s, t, d: E.d, act: E.act }; o.k = xmKey(o); o.rec = C[o.k] || null; return o; });
}
const xmMine = () => S.user ? xmAll().filter(x => xmN(x.t) === xmN(S.user.name)) : [];
const xmPend = () => xmMine().filter(x => !x.rec).length;
/* حالة التعويض لكشف خروج في ملف أخصائية الأنشطة */
function xmOfExit(r) { const E = XM_EX.find(e => e.d === String(r.date).slice(0, 10) && e.m.test(r.d.title || '')); if (!E) return null; const L = xmAll().filter(x => x.ex === E.k); return { n: L.length, done: L.filter(x => x.rec).length, L }; }

function T_xcmp(el) {
  setTitle('تعويض طالباتي عن الخروج');
  const L = xmMine(), done = L.filter(x => x.rec).length;
  el.innerHTML = `<div class="card">
    <div class="tahint">معلمتي الغالية، هذه الحصص فاتت طالباتكِ بسبب خروجهن لنشاط مدرسي بموافقة الإدارة. بعد أن تعوّضيهن عنها، اضغطي «تم التعويض» واختاري التاريخ والوقت؛ فيُوثَّق تعويضكِ ويُضاف إلى ملف الأنشطة وتقرير الحصص التعويضية تلقائياً.</div>
    <div class="row" style="margin-top:10px"><h2 style="margin:0">حصصي الفائتة بسبب الخروج</h2><span class="sp"></span><span class="chip">${done} من ${L.length} عُوِّضت</span></div></div>
    ${L.length ? L.map((x, i) => `<div class="card xm-c ${x.rec ? 'ok' : ''}">
      <div class="xm-h"><div><b>${esc(x.act)}</b><small>${typeof prqDay === 'function' ? prqDay(x.d) + ' ' : ''}${dmy(x.d)} · الصف ${esc(x.c)} · الحصة ${XM_PER[x.p] || x.p} · ${esc(x.s)}</small></div>
        ${x.rec ? `<span class="xm-st">✓ تم التعويض ${dmy(x.rec.date)} · ${esc(x.rec.d.how || '')}${x.rec.d.per ? ' — ' + esc(x.rec.d.per) : ''}</span>` : '<span class="xm-st w">بانتظار التعويض</span>'}</div>
      <div class="xm-f form" data-i="${i}" ${x.rec ? 'hidden' : ''}>
        <div class="fld"><label>تاريخ التعويض</label><input type="date" data-n="date" value="${esc(x.rec ? x.rec.date : today())}"></div>
        <div class="fld"><label>وقت التعويض</label><select data-n="how">${XM_HOW.map(h => `<option ${x.rec && x.rec.d.how === h ? 'selected' : ''}>${h}</option>`).join('')}</select></div>
        <div class="fld"><label>الحصة أو المادة البديلة (اختياري)</label><input data-n="per" value="${esc(x.rec ? x.rec.d.per || '' : '')}" placeholder="مثال: السادسة بدلاً عن المهارات الحياتية"></div>
        <div class="actions"><button class="btn" data-sv="${i}">تم التعويض ✓</button></div></div>
      ${x.rec ? `<div class="row noprint" style="gap:6px;margin-top:6px"><button class="btn sm sec" data-ed="${i}">تعديل</button><button class="btn sm ghost" data-dl="${i}" style="color:#A33">حذف</button></div>` : ''}</div>`).join('')
    : '<div class="card"><div class="empty">لا توجد حصص فائتة لطالباتكِ بسبب الخروج — شكراً لكِ 🌸</div></div>'}`;
  $$('[data-ed]', el).forEach(b => b.onclick = () => { $(`.xm-f[data-i="${b.dataset.ed}"]`, el).hidden = false; b.parentNode.remove(); });
  $$('[data-dl]', el).forEach(b => b.onclick = async () => { const x = L[+b.dataset.dl]; if (!confirm('حذف توثيق هذا التعويض؟')) return; await call('delete', { id: x.rec.id }); S.records = S.records.filter(r => r.id !== x.rec.id); toast("تم الحذف"); refresh(); });
  $$('[data-sv]', el).forEach(b => b.onclick = async () => {
    const x = L[+b.dataset.sv], f = $(`.xm-f[data-i="${b.dataset.sv}"]`, el), v = readForm(f); if (!v.date) return toast('حدّدي تاريخ التعويض', 1);
    const rec = { id: x.rec && x.rec.id, dept: S.user.dept[0], item: 'XCMP', date: v.date, sum: `تعويض الطالبات — ${x.act} (${x.c})`, d: { k: x.k, ex: x.act, exd: x.d, c: x.c, p: x.p, s: x.s, how: v.how, per: (v.per || '').trim(), t: S.user.name } };
    b.disabled = true; try { const j = await call('save', { rec }); const nr = j.record || Object.assign({}, rec, { id: j.id }); S.records = S.records.filter(r => r.id !== nr.id).concat([nr]); } catch (e) { b.disabled = false; return; }
    const left = xmPend(); refresh();
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="box" style="max-width:500px"><div class="card ta-cheer" style="background:linear-gradient(90deg,#FFF8E6,#fff);border-inline-start:5px solid var(--gold);text-align:center">
      <div style="font-size:22px;color:var(--gold);letter-spacing:5px">★★★</div><h3 style="margin:2px 0 6px;color:var(--maroon)">حقُّ الطالبات في التعلّم محفوظٌ بكِ</h3>
      <p style="margin:0;text-align:justify">أ. ${esc(S.user.name)}، شكرٌ موصولٌ لكِ على تعويض طالبات الصف ${esc(x.c)}؛ حرصكِ على ألّا يفوتهنّ شيءٌ من تعلّمهنّ أمانةٌ أدّيتِها بإتقان.${left ? '' : ' اكتمل تعويض جميع حصصكِ الفائتة، بارك الله فيكِ.'}</p>${vpSignLine()}</div>
      <div class="row" style="margin-top:10px;justify-content:center"><button class="btn" id="cOk">شكراً</button></div></div>`;
    document.body.appendChild(m); $('#cOk', m).onclick = () => m.remove(); fillVps(m); confetti(left ? 1500 : 3500); chime(!left);
  });
}
