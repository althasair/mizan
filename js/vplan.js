/* ==================================================================
   متابعة الخطة الإجرائية للنائب الأكاديمي «الخطة العامة لتحسين تعلم الطلبة» (المجال الأول) — نموذج الوزارة
   بنود الخطة في data/vplan.json كما كُتبت دون تعديل. تُتابَع كل ربع بالحالات المعتمدة نفسها في خطط المنسقات
   (على المسار / متأخر / متأخر جداً / لم يبدأ / مكتمل): تُحسب تلقائياً مما سُجّل في الميزان وسبع سنابل في جميع الأقسام،
   والبرتقالي بحاجة إلى قرار النائب، وقرارها بنقرة يُحفظ سجلاً (VPS) لذلك الربع ويتقدّم على الحساب التلقائي.
   ================================================================== */
let VPL_PLAN = null;
async function vplLoad() { if (VPL_PLAN) return VPL_PLAN; try { VPL_PLAN = await fetch('data/vplan.json?v=' + (window.MIZAN_V || Date.now())).then(r => r.json()); } catch (e) { VPL_PLAN = null; } return VPL_PLAN; }
const VPL_DEPT = 'الإدارية الأكاديمية';
const VPL_QN = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'];
const vplPer = q => (S.periods || []).find(p => p.name === VPL_QN[q - 1]) || null;
const vplQs = () => [1, 2, 3, 4].filter(q => { const p = vplPer(q); return p && p.from <= today(); });
/* مصادر الأدلة لكل نوع إجراء: [البند، نمط اختياري في نص السجل]؛ k: cyc بعد الاختبارات، rec متكرر، man يدوي، end نهاية العام */
const VPL_RE = {
  near: /حصر|القريب|70|الواعدات|المستهدف/, rem: /علاج|دعم|تقوية|الواعدات|المتدني|الضعيف|المتعثر/, enr: /إثرائ|علاج|تقوية/, hot: /التفكير العليا|مهارات التفكير|عمق المعرفة|DOK|مستويات التفكير|مستويات الأسئلة/,
  pledge: /ميثاق|تعهد|اتفاقي/, honor: /تكريم|الأوائل|المتفوق|تحفيز|تعزيز/, diag: /تشخيص|قبلي/, pisa: /PISA|بيزا|الاختبارات الدولية|الدراسات الدولية|TIMSS|الاختبارات العالمية/,
  track: /المسارات|المسار العلمي|المسار الأدبي|اختيار المسار|التخصص|الجامع|مهني/, uni: /الجامع|التخصصات الجامعية|القبول الجامعي/, career: /المهن|مهني|وظيف|سوق العمل/, alumni: /خريج|استضاف/,
  proj: /بحث|مشروع|ابتكار|تفكير|علمي/, gift: /متفوق|موهوب|مسابق|الأوائل|أولمبياد/, el: /قطر للتعليم|التعليم الإلكتروني|التعلم الإلكتروني|المنصة|منصة/, dev: /أجهز|جهاز/, remote: /عن بعد|عن بُعد/
};
const VPL_R = {
  near70: { k: 'cyc', s: [['SAN'], ['SRQ'], ['RA', 'near']] },
  read: { k: 'cyc', s: [['SRQ']] },
  anal: { k: 'cyc', s: [['SAN'], ['SRQ']] },
  impact: { k: 'cyc', s: [['SRQ'], ['RA', /أثر/]] },
  readMSR: { k: 'cyc', s: [['SRQ']], dept: /الرياضيات|الفيزياء|الكيمياء|الأحياء|العربية/ },
  pledge: { k: 'man', s: [['TPA', 'pledge'], ['PA', 'pledge'], ['RA', 'pledge']] },
  support: { k: 'rec', s: [['SEN'], ['SAC'], ['SFB'], ['RA', 'rem']] },
  enrich: { k: 'rec', s: [['SEN'], ['RA', 'enr']] },
  hot: { k: 'rec', s: [['AS', 'hot'], ['RA', 'hot'], ['PL', 'hot']] },
  parents: { k: 'rec', s: [['TPA'], ['PA']] },
  reinf: { k: 'rec', s: [['SRF'], ['TACH', 'honor'], ['AC', 'honor']] },
  diag: { k: 'rec', s: [['AS', 'diag'], ['RA', 'diag'], ['TAS', 'diag']] },
  pisa: { k: 'rec', s: [['AC', 'pisa'], ['TA', 'pisa'], ['ACH', 'pisa'], ['TACH', 'pisa'], ['AS', 'pisa'], ['LR', 'pisa'], ['NAC', 'pisa'], ['PL', 'pisa'], ['MT', 'pisa']] },
  pisaAw: { k: 'rec', s: [['AC', 'pisa'], ['TA', 'pisa'], ['NAC', 'pisa'], ['MT', 'pisa'], ['WS', 'hot'], ['TWS', 'hot']] },
  track: { k: 'rec', s: [['AC', 'track'], ['TA', 'track'], ['NAC', 'track'], ['ACH', 'track']] },
  uni: { k: 'rec', s: [['AC', 'uni'], ['TA', 'uni'], ['NAC', 'uni']] },
  career: { k: 'rec', s: [['AC', 'career'], ['TA', 'career'], ['NAC', 'career'], ['WS', 'career']] },
  alumni: { k: 'rec', s: [['AC', 'alumni'], ['TA', 'alumni'], ['NAC', 'alumni']] },
  proj: { k: 'rec', s: [['AC', 'proj'], ['TA', 'proj'], ['ACH', 'proj'], ['TACH', 'proj']] },
  peer: { k: 'rec', s: [['SAC']] },
  gifted: { k: 'rec', s: [['ACH'], ['TACH'], ['AC', 'gift'], ['TA', 'gift']] },
  honor: { k: 'rec', s: [['SRF'], ['AC', 'honor'], ['TA', 'honor'], ['NAC', 'honor']] },
  elearn: { k: 'rec', s: [['LR', 'el'], ['NAC', 'el']] },
  etrain: { k: 'rec', s: [['WS', 'el'], ['TWS', 'el'], ['EX', 'el']] },
  device: { k: 'rec', s: [['LR', 'dev'], ['NAC', 'dev']] },
  remote: { k: 'rec', s: [['LR', 'remote'], ['PL', 'remote'], ['MT', 'remote']] },
  end: { k: 'end', s: [] }, man: { k: 'man', s: [] }
};
const VPL_LBL = { NAC: 'تقرير البرامج والأنشطة', TAS: 'تكليف معلمة', SRQ: 'قراءة نتائج معتمدة', SAN: 'تحليل نتائج' };
const VPL_SKIP = { rt: 1, rc: 1, str: 1, imp: 1, f1: 1, f2: 1, r1: 1, r2: 1, r3: 1, fu: 1, rows: 1, so: 1, stu: 1 };
const vplTxt = r => { if (r._vt != null) return r._vt; const d = r.d || {}; return (r._vt = (r.sum || '') + ' ' + Object.keys(d).filter(k => !VPL_SKIP[k]).map(k => typeof d[k] === 'string' ? d[k] : Array.isArray(d[k]) ? d[k].filter(x => typeof x === 'string').join(' ') : '').join(' ')); };
function vplEv(it, from, to) {
  const R = VPL_R[it.r] || VPL_R.man; if (!R.s.length) return [];
  return (S.records || []).filter(r => { const dt = String(r.date || '').slice(0, 10); if (!dt || dt < from || dt > to) return false;
    if (R.dept && !R.dept.test(r.dept || '')) return false;
    return R.s.some(([it2, re]) => r.item === it2 && (!re || (typeof re === 'string' ? VPL_RE[re] : re).test(vplTxt(r)))); });
}
const vplEvTxt = L => { const c = {}; L.forEach(r => { const k = VPL_LBL[r.item] || (typeof APL_LBL !== 'undefined' && APL_LBL[r.item]) || r.item; c[k] = (c[k] || 0) + 1; }); const dn = new Set(L.map(r => r.dept)).size;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n})`).join('، ') + (dn > 1 ? ` — في ${dn} أقسام` : ''); };
/* الحالة التلقائية للإجراء في ربع معيّن */
function vplAuto(I, it, q) {
  const P = vplPer(q); if (!P) return { st: '', ev: '' };
  const R = VPL_R[it.r] || VPL_R.man, ended = P.to < today(), sched = I.q.includes(q) && !(R.k === 'end' && q < 4);
  const L = vplEv(it, P.from, P.to), last = L.map(r => String(r.date).slice(0, 10)).sort().pop() || '';
  const out = (st, need, ev, date) => ({ st, need: !!need, ev: ev || '', date: date || '' });
  // مكتمل: آخر ربع مقرر للإجراء أو إجراء نهاية العام؛ وقبله «على المسار» لأنه متكرر وبقيت له مرات قادمة
  if (L.length) return out(R.k === 'end' || q >= Math.max(...I.q) ? 'مكتمل' : 'على المسار', 0, vplEvTxt(L), last);
  if (!sched) return out('لم يبدأ', 0, R.k === 'end' ? 'إجراء نهاية العام' : 'موعده: ' + I.when.replace(/\n/g, '، '), '');
  if (R.k === 'cyc' && q === 1) return out('لم يبدأ', 0, 'يبدأ بعد نتائج أول اختبار', '');
  if (R.k === 'man') return out('على المسار', 1, 'لا يوجد تسجيل يدل عليه في المنصات، فالقرار لكِ', '');
  return ended ? out('متأخر', 1, 'لا يوجد ما يثبت تنفيذه في هذا الربع', '') : out('على المسار', 1, 'لا يوجد تسجيل بعد في هذا الربع', '');
}
const vpsFor = (mid, q) => (S.records || []).filter(r => r.item === 'VPS' && r.d && r.d.mid === mid && +r.d.q === q).sort((a, b) => String(b.at || b.date).localeCompare(String(a.at || a.date)))[0];
function vplStatus(I, it, q) { const a = vplAuto(I, it, q), o = vpsFor(it.id, q); return o ? Object.assign({}, a, { st: o.d.st, need: false, set: 1, date: o.d.date || o.date }) : a; }
const vplShort = q => ['ر1', 'ر2', 'ر3', 'ر4'][q - 1];

async function A_vplan(el) {
  setTitle('خطتي الإجرائية — تحسين تعلم الطلبة');
  el.innerHTML = '<div class="card"><div class="empty">جارٍ تحميل الخطة…</div></div>';
  const plan = await vplLoad(); if (!plan) { el.innerHTML = '<div class="card"><div class="empty">تعذّر تحميل الخطة.</div></div>'; return; }
  const can = isAdmin() && !(typeof isPrincipal === 'function' && isPrincipal());
  const draw = () => {
    const Qs = vplQs(); let q = S.vplQ && Qs.includes(S.vplQ) ? S.vplQ : Qs[Qs.length - 1] || 1;
    let n = 0, ok = 0, need = 0; const cnt = {};
    const rows = plan.inds.map(I => `<tr class="apl-dh"><td colspan="3"><b>${esc(I.n)} ${esc(I.ind)}</b><div style="font-size:12px;font-weight:400;color:#5A4048;margin-top:2px">🎯 ${esc(I.goal)}</div>
        <div style="font-size:11.5px;font-weight:400;color:var(--muted);margin-top:2px">الجهة المنفذة: ${esc(I.by.replace(/\n/g, '، '))} · زمن التنفيذ: ${esc(I.when.replace(/\n/g, '، '))}</div></td></tr>` +
      I.items.map(it => { const s = vplStatus(I, it, q); n++; cnt[s.st] = (cnt[s.st] || 0) + 1; if ((s.st === 'مكتمل' || s.st === 'على المسار') && !s.need) ok++; if (s.need) need++;
        const other = Qs.filter(x => x !== q).map(x => { const o = vplStatus(I, it, x); return `<span class="vpl-oq ${APS_C[o.st] || ''}">${vplShort(x)}: ${esc(o.st || '—')}</span>`; }).join('');
        return `<tr class="${s.need ? 'apl-need' : ''}"><td class="apl-a"><div><b style="color:var(--maroon)">${esc(it.n)}</b> ${esc(it.t)}</div>${s.ev ? `<div class="apl-ev">${s.set ? '✍️ قراركِ' : '⚙️ تلقائي'} · ${esc(s.ev)}</div>` : ''}${other ? `<div class="vpl-oqs">${other}</div>` : ''}</td>
          <td class="apl-st">${APS_ST.map(v => `<button class="aps ${APS_C[v]}${s.st === v ? ' on' : ''}${s.st === v && !s.set ? ' auto' : ''}" data-st="${v}" data-mid="${it.id}" ${can ? '' : 'disabled'}>${v}</button>`).join('')}</td>
          <td class="apl-dt">${s.st && vplPer(q) ? dm(aplEndDay(vplPer(q).to)) : '—'}</td></tr>`; }).join('')).join('');
    const P = vplPer(q);
    el.innerHTML = `<div class="card apl"><h2>✅ متابعة ${esc(plan.title)} <span class="sub">${esc(plan.dom)} · تُحسب حالة كل إجراء تلقائياً مما سجّلته المعلمات والمنسقات في الميزان وسبع سنابل في جميع الأقسام خلال الربع. راجعي ما ظهر بالبرتقالي فهو بحاجة إلى قراركِ، ويمكنكِ تغيير أي حالة بنقرة. الحفظ تلقائي.</span></h2>
      ${apsKeyHTML(0)}
      <div class="apl-mos">${Qs.map(x => `<button class="${x === q ? 'on' : ''}" data-q="${x}">${VPL_QN[x - 1]}</button>`).join('')}</div>
      <div class="apl-sum"><b>${n ? Math.round(ok / n * 100) : 0}%</b><div>${aplBar(ok, n)}<small>${VPL_QN[q - 1]} (${P ? dm(P.from) + ' – ' + dm(P.to) : ''}): ${APS_ST.filter(v => cnt[v]).map(v => `${v} ${cnt[v]}`).join(' · ')} من ${n} إجراءً${need ? ` · <span style="color:#B8521A;font-weight:700">${need} بحاجة إلى قراركِ</span>` : ''}</small></div>
        <div class="apl-tools"><span id="aplSv" class="apl-sv">${aplBusy ? '… جارٍ الحفظ' : ''}</span><button class="btn sm" id="vplPr">🖨️ طباعة متابعة الخطة (نموذج الوزارة)</button></div></div>
      <div class="apl-tw"><table class="apl-t"><thead><tr><th>الإجراءات والأنشطة الإشرافية والبرامج</th><th>المتابعة <small>(${VPL_QN[q - 1]})</small></th><th>تاريخ المتابعة</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="apl-note">⚙️ تلقائي: حُسبت الحالة من التسجيلات في الربع · ✍️ قراركِ: اخترتِها بنفسكِ. الطباعة تشمل متابعة كل ربع حتى ${VPL_QN[q - 1]}، وتاريخ المتابعة هو آخر يوم عمل في الربع.</div></div>`;
    $$('[data-q]', el).forEach(b => b.onclick = () => { S.vplQ = +b.dataset.q; draw(); });
    $('#vplPr', el).onclick = () => vplPrint(plan, q);
    $$('[data-st]', el).forEach(b => b.onclick = () => {
      const mid = b.dataset.mid, v = b.dataset.st, r = vpsFor(mid, q), it = plan.inds.flatMap(I => I.items).find(i => i.id === mid);
      if (r && r.d.st === v) return;
      const rec = { dept: VPL_DEPT, item: 'VPS', date: today(), sum: `الخطة الإجرائية ${it.n} (${VPL_QN[q - 1]}): ${v}`.slice(0, 400), d: { mid, n: it.n, q, st: v, date: vplPer(q) ? aplEndDay(vplPer(q).to) : today() } };
      if (r) { Object.assign(r, { date: rec.date, sum: rec.sum, d: rec.d, at: new Date().toISOString() }); aplPush(async () => { const j = await API.call('save', { rec: Object.assign({}, rec, { id: r.real || r.id }) }); r.id = j.record.id; }); }
      else aplSave(rec);
      draw();
    });
  };
  draw();
}

/* الطباعة على الترويسة الأفقية بنموذج الوزارة نفسه، مع عمود متابعة لكل ربع حتى الربع المختار */
async function vplPrint(plan, q) {
  /* تُفتح نافذة الطباعة فور الضغط (قبل جلب التواقيع والصور) حتى لا يحجبها المتصفح */
  const w = window.open('', '_blank'); if (!w) return toast('اسمحي بالنوافذ المنبثقة للطباعة', 1);
  try { w.document.write('<p style="font-family:sans-serif;text-align:center;margin-top:40vh">جارٍ تجهيز الخطة للطباعة…</p>'); } catch (e) {}
  const t0 = vplPer(q) ? aplEndDay(vplPer(q).to) : today(), Qs = vplQs().filter(x => x <= q);
  let vsig = ''; try { vsig = (await API.call('signature', { cheer: 1 })).data || ''; } catch (e) {}
  const nl = s => esc(s || '').replace(/\n/g, '<br>');
  /* سطور الجهة والزمن والأدلة تتوزّع على صفوف المؤشر (سطر لكل صف) فلا يطول الصف الأول */
  const part = (t, i, n) => { const L = String(t || '').split('\n').filter(Boolean); return i < n - 1 ? esc(L[i] || '') : L.slice(i).map(esc).join('<br>'); };
  const tbl = T => T ? `<table class="mini">${T.map((r, i) => `<tr>${r.map(c => i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</table>` : '';
  const rows = plan.inds.map(I => I.items.map((it, i) => { const f = i === 0, l = i === I.items.length - 1, cls = `g${f ? ' f' : ''}${l ? ' l' : ''}`;
    return `<tr><td class="${cls} ind">${f ? esc(I.n) + ' ' + esc(I.ind) : ''}</td><td class="${cls} gl">${f ? esc(I.goal) + tbl(I.tbl) : ''}</td><td class="ac"><b>${esc(it.n)}</b> ${esc(it.t)}</td>
      <td class="${cls}">${part(I.by, i, I.items.length)}</td><td class="${cls}">${part(I.when, i, I.items.length)}</td><td class="${cls} evd">${part(I.ev, i, I.items.length)}</td>
      ${Qs.map(x => { const s = vplStatus(I, it, x); return `<td class="st ${APS_C[s.st] || ''}">${esc(s.st)}</td>`; }).join('')}<td class="dt">${dmy(t0)}</td></tr>`; }).join('')).join('');
  w.document.write('<p style="font-family:sans-serif;text-align:center;margin-top:40vh">جارٍ تجهيز الخطة للطباعة…</p>');
  const IMG = await aplImgs();
  w.document.open(); w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>متابعة ${esc(plan.title)} - ${VPL_QN[q - 1]} - ${dmy(t0)}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap"><style>
  @page{size:A4 landscape;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:Lusail,'IBM Plex Sans Arabic',sans-serif;color:#222}
  .pg{position:relative;width:297mm;min-height:210mm}.top{position:fixed;top:0;left:0;width:297mm}.bot{position:fixed;bottom:0;left:0;width:297mm}.mark{position:fixed;top:48mm;left:98mm;width:100mm;opacity:.5;z-index:-1}
  table.hold{width:100%;border-collapse:collapse}thead.sp td{height:40mm}tfoot.sp td{height:32mm}
  .in{padding:0 10mm}h1{text-align:center;font-size:14.5pt;color:#7A1F3D;margin:0 0 1mm}.sub{text-align:center;font-size:10pt;margin:0 0 2.5mm;color:#333}
  .dom{background:#3B8DB0;color:#fff;text-align:center;font-weight:700;font-size:10pt;padding:1.4mm}
  table.p{width:100%;border-collapse:collapse;font-size:7.7pt;line-height:1.42}table.p th{background:#5C0A14;color:#fff;border:1px solid #5C0A14;padding:1.8mm 1.2mm;font-size:8.2pt}
  table.p td{border:1px solid #B9A7AD;padding:1.1mm 1.3mm;text-align:center;vertical-align:middle;background:rgba(255,255,255,.9)}table.p td.ac{text-align:justify}
  table.p td.g{border-top:0;border-bottom:0;vertical-align:top}table.p td.g.f{border-top:1px solid #B9A7AD}table.p td.g.l{border-bottom:1px solid #B9A7AD}
  table.p td.ind{font-weight:700;color:#5C0A14;width:24mm}table.p td.gl{width:40mm;text-align:justify}table.p td.evd{width:30mm;text-align:right}
  table.mini{border-collapse:collapse;margin:1.5mm auto 0;font-size:7pt}table.mini th,table.mini td{border:1px solid #999!important;padding:.4mm 1.5mm!important;background:#fff}table.mini th{background:#eee;color:#333}
  table.p tr{break-inside:avoid}td.st{font-weight:700;white-space:nowrap;width:17mm}td.dt{white-space:nowrap;width:16mm}
  td.st.b{background:#E4F3EA!important}td.st.g{background:#E6EEF8!important}td.st.o{background:#FCEADB!important}td.st.r{background:#F9E3E6!important}td.st.n{background:#F1F1F1!important}
  .sigs{display:flex;justify-content:flex-end;margin-top:4mm;break-inside:avoid}.sgc{width:80mm;text-align:center}
  .sg .tt{font-size:9.5pt;color:#555}.sg .nm{position:relative;display:inline-block;padding:7mm 0;min-width:60mm}.sg .nm b{position:relative;z-index:1;font-size:11pt}.sg img{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:24mm;max-width:62mm;object-fit:contain;opacity:.62;mix-blend-mode:multiply}
  .pr{font-size:8.5pt;color:#666;margin-top:1mm}@media screen{body{background:#eee}.pg{margin:0 auto;background:#fff}}</style></head><body>
  <img class="top" src="${IMG.top}"><img class="bot" src="${IMG.bot}"><img class="mark" src="${IMG.mark}">
  <div class="pg"><table class="hold"><thead class="sp"><tr><td></td></tr></thead><tfoot class="sp"><tr><td></td></tr></tfoot><tbody><tr><td><div class="in">
  <h1>${esc(plan.title)}</h1><div class="sub">متابعة ${Qs.map(x => VPL_QN[x - 1]).join(' و')} · العام الأكاديمي 2026-2027م · مدرسة الشيماء الثانوية للبنات · المتابعة حتى تاريخ ${dmy(t0)}</div>
  ${apsKeyHTML(1)}<div class="dom">${esc(plan.dom)}:</div>
  <table class="p"><thead><tr><th>مؤشرات الأداء الاستراتيجي</th><th>الأهداف</th><th>الإجراءات والأنشطة الإشرافية والبرامج</th><th>الجهة المنفذة</th><th>زمن التنفيذ</th><th>أدلة التنفيذ</th>${Qs.map(x => `<th>متابعة ${VPL_QN[x - 1]}</th>`).join('')}<th>تاريخ المتابعة</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="sigs"><div class="sgc"><div class="sg"><div class="tt">النائبة الأكاديمية</div><div class="nm"><b>أ. آسيا الذبياني</b>${vsig ? `<img src="${vsig}" alt="">` : ''}</div></div><div class="pr">مديرة المدرسة: أ. شيخة الرميحي</div></div></div>
  </div></td></tr></tbody></table></div><script>window.onload=()=>setTimeout(()=>print(),600)<\/script></body></html>`);
  w.document.close();
}
