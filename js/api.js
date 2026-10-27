/* الميزان — الاتصال بالخادم (Apps Script) + وضع المعاينة ببيانات تجريبية */
'use strict';

const API = {
  live: () => !!(window.MIZAN && MIZAN.API),
  async call(action, payload = {}) {
    if (!API.live()) return DEMO.call(action, payload);
    const body = JSON.stringify(Object.assign({ action, token: S.token }, payload));
    let res;
    try {
      res = await fetch(MIZAN.API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body, redirect: 'follow' });
    } catch (e) { throw new Error('تعذّر الاتصال بالخادم. تحققي من الإنترنت.'); }
    const j = await res.json().catch(() => ({ ok: false, error: 'استجابة غير صالحة من الخادم' }));
    if (!j.ok) {
      if (/انتهت الجلسة/.test(j.error || '')) { sessionStorage.removeItem('mizan_tok'); setTimeout(() => location.reload(), 1200); }
      throw new Error(j.error || 'خطأ غير معروف');
    }
    return j;
  }
};

/* ------------------------------------------------------------------
   وضع المعاينة: يعمل بالكامل في المتصفح ببيانات وأسماء خيالية،
   حتى يظهر شكل المنصة قبل ربط الخادم. لا يحتوي أي بيانات حقيقية.
   أرقام المعاينة: 000000 (الإدارة) · 1111 (منسقة الكيمياء) · 2222 (منسقة الرياضيات)
------------------------------------------------------------------- */
const DEMO = {
  KEY: 'mizan_demo_v1',
  db() {
    let d = null; try { d = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) {}
    if (d && d.v === 7) return d;
    const staff = [
      ['الكيمياء', 'منى السالم', 'منسقة', 'الكيمياء', '12-3', 4], ['الكيمياء', 'ريم الكعبي', 'معلمة', 'الكيمياء', '12-1، 12-2', 16], ['الكيمياء', 'لطيفة المري', 'معلمة', 'الكيمياء', '11-1، 11-3', 16],
      ['الكيمياء', 'دانة الهاجري', 'معلمة', 'العلوم + الكيمياء', '11-2، 11-6', 12], ['الرياضيات', 'سلمى العتيبي', 'منسقة', 'الرياضيات', '12-3', 6],
      ['الرياضيات', 'نوال الخاطر', 'معلمة', 'الرياضيات', '12-4، 12-5', 15], ['الرياضيات', 'عائشة المهندي', 'معلمة', 'الرياضيات', '10-2، 10-5', 12], ['الرياضيات', 'مها الشمري', 'معلمة', 'الرياضيات', '11-3، 11-4', 12],
      ['اللغة العربية', 'جميلة البوعينين', 'معلمة', 'اللغة العربية', '10-1، 10-2', 18], ['اللغة الإنجليزية', 'سارة آل ثاني', 'معلمة', 'اللغة الإنجليزية', '12-1، 12-2', 18],
    ].map(r => ({ dept: r[0], name: r[1], role: r[2], subj: r[3], secs: r[4], load: r[5], email: 'demo@example.com' }));
    const t = (k, dept, date, d) => ({ id: 'd' + Math.random().toString(36).slice(2, 9), dept, item: k, date, sum: '', d, by: 'معاينة', at: date });
    const recs = [
      t('V', 'الكيمياء', '2026-10-05', { t: 'ريم الكعبي', s: '12-1', subj: 'الكيمياء', ty: 'الزيارة الأولى', kj: 'كلية', mode: 'ميدانية', f1: REF.CRIT[8].label, r1: REF.REC[14], r2: REF.REC[1] }),
      t('V', 'الكيمياء', '2026-10-12', { t: 'لطيفة المري', s: '11-3', subj: 'الكيمياء', ty: 'الزيارة الأولى', kj: 'جزئية', mode: 'ميدانية', f1: REF.CRIT[6].label, r1: REF.REC[14] }),
      t('V', 'الكيمياء', '2026-10-20', { t: 'ريم الكعبي', s: '12-2', subj: 'الكيمياء', ty: 'متابعة الزيارة الأولى', kj: 'جزئية', mode: 'ميدانية', r1: REF.REC[14], st: 'تم التنفيذ جزئياً' }),
      t('MT', 'الكيمياء', '2026-10-04', { ty: 'اجتماع قسم دوري', by: 'المنسقة', t1: REF.L.mt_topic[0], place: 'غرفة القسم' }),
      t('AC', 'الكيمياء', '2026-10-15', { ty: 'يوم عالمي', name: 'اليوم العالمي للغذاء (16 أكتوبر)', io: 'داخلي', e1: 'دانة الهاجري', tg: 'جميع الطالبات', pos: REF.L.ac_pos[0], imp: REF.L.ac_impact[0], p1: REF.PRIO[2] }),
      t('PL', 'الكيمياء', '2026-10-01', { c: 'الخطة الفصلية', lvl: 'الصف الحادي عشر', st: 'مطابقة للخطة الفصلية' }),
      t('V', 'الكيمياء', '2026-09-20', { t: 'دانة الهاجري', s: '11-2', subj: 'العلوم', ty: 'الزيارة الأولى', kj: 'كلية', mode: 'ميدانية', f1: REF.CRIT[2].label, f2: REF.CRIT[8].label, r1: REF.REC[3] }),
      t('V', 'الرياضيات', '2026-10-08', { t: 'نوال الخاطر', s: '12-4', subj: 'الرياضيات', ty: 'الزيارة الأولى', kj: 'كلية', mode: 'ميدانية', f1: REF.CRIT[8].label, r1: REF.REC[14] }),
      t('AC', 'الرياضيات', '2026-10-14', { ty: 'مسابقة داخلية', name: 'مسابقة التحدي المعرفي', io: 'داخلي', e1: 'مها الشمري', e2: 'نوال الخاطر', times: 2 }),
      t('VPV', 'الكيمياء', '2026-09-29', { t: 'ريم الكعبي', s: '12-1', note: 'زيارة معاينة' }),
    ];
    const pd = [{ i: 0, sem: 'الفصل الأول', dept: 'الكيمياء', title: 'تطبيق أساليب تغذية راجعة إبداعية', type: 'حلقة نقاشية', hrs: '1', date: '2026-10-21', by: 'منى السالم', n: 4 },
                { i: 1, sem: 'الفصل الأول', dept: 'الرياضيات', title: 'تنويع مستويات الأسئلة الصفية', type: 'حصة نموذجية', hrs: '1', date: '2026-10-11', by: 'نوال الخاطر', n: 4 }];
    d = { v: 7, staff, recs, pd, reps: [], users: [
      { id: 'admin', role: 'admin', dept: ['جميع الأقسام'], name: 'النائب الأكاديمي (معاينة)', pin: '000000' },
      { id: 'c1', role: 'coord', dept: ['الكيمياء'], name: 'منى السالم', pin: '1111' },
      { id: 'c2', role: 'coord', dept: ['الرياضيات'], name: 'سلمى العتيبي', pin: '2222' },
      { id: 't1', role: 'teacher', dept: ['الكيمياء'], name: 'ريم الكعبي', pin: '3333' }, { id: 't2', role: 'teacher', dept: ['الرياضيات'], name: 'نوال الخاطر', pin: '4444' }] };
    localStorage.setItem(this.KEY, JSON.stringify(d)); return d;
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },
  periods: [{ name: 'الربع الأول', from: '2026-08-30', to: '2026-10-11', sem: 'الفصل الأول' }, { name: 'الربع الثاني', from: '2026-10-12', to: '2026-11-30', sem: 'الفصل الأول' },
            { name: 'الربع الثالث', from: '2026-11-30', to: '2027-02-25', sem: 'الفصل الثاني' }, { name: 'الربع الرابع', from: '2027-02-28', to: '2027-05-12', sem: 'الفصل الثاني' }],
  cal: [{ t: 'اليوم العالمي للمعلم', from: '2026-10-05', to: '2026-10-05' }, { t: 'إجازة منتصف الفصل الأول', from: '2026-10-25', to: '2026-10-29' }],
  async call(a, p) {
    await new Promise(r => setTimeout(r, 120));
    const d = this.db(); const me = d.users.find(u => u.id === sessionStorage.getItem('mizan_demo_u'));
    const strip = u => ({ id: u.id, role: u.role, dept: u.dept, name: u.name });
    if (a === 'login') { const u = d.users.find(x => x.pin === String(p.pin)); if (!u) throw new Error('الرقم السري غير صحيح'); sessionStorage.setItem('mizan_demo_u', u.id); return { ok: 1, token: 'demo', user: strip(u) }; }
    if (!me) throw new Error('انتهت الجلسة، الرجاء الدخول مرة أخرى');
    const can = dep => me.role === 'admin' || me.dept.includes(dep);
    const vis = r => me.role === 'admin' || ((can(r.dept) || (['TPV', 'TWS'].includes(r.item) && r.d && (can(r.d.vdept) || can(r.d.bydept)))) && !['VPV', 'FILES', 'NOTE'].includes(r.item));
    if (a === 'boot' && me.role === 'teacher') { const TI = ['TA', 'TPV', 'TWS', 'TPA', 'TACH']; return { ok: 1, user: strip(me), periods: this.periods, cal: [], pd: [], staff: d.staff.filter(s => s.name === me.name), staffAll: d.staff.map(s => ({ dept: s.dept, name: s.name, role: s.role })), coords: [], records: d.recs.filter(r => TI.includes(r.item) && r.d && (r.d.t === me.name || r.d.v === me.name || r.d.by === me.name)), reports: [], acts: [] }; }
    if (a === 'boot') return { ok: 1, user: strip(me), periods: this.periods, cal: this.cal, pd: d.pd.filter(x => me.role === 'admin' || can(x.dept)), staff: d.staff.map(s => me.role === 'admin' ? s : { ...s, email: undefined }),
      coords: d.users.filter(u => u.role === 'coord').map(u => ({ id: u.id, dept: u.dept, name: u.name, active: true })), records: d.recs.filter(vis), reports: d.reps.filter(r => can(r.dept)) };
    if (a === 'save') {
      const r = p.rec; if (me.role === 'teacher') { r.d = r.d || {}; r.d.t = me.name; r.dept = me.dept[0]; const dOf = n => (d.staff.find(s => s.name === n) || {}).dept || ''; if (r.item === 'TPV') r.d.vdept = dOf(r.d.v); if (r.item === 'TWS') r.d.bydept = r.d.role === 'قدّمتُ لتطوير الزملاء' ? r.dept : dOf(r.d.by); }
      if (!can(r.dept)) throw new Error('لا تملكين صلاحية على هذا القسم');
      if (r.key && d.recs.some(x => x.dept === r.dept && x.item === r.item && x.d && x.d._key === r.key && x.id !== r.id)) throw new Error('هذا السجل موجود مسبقاً (تم منع التكرار)');
      if (r.key) r.d._key = r.key;
      const o = { id: r.id || 'd' + Date.now().toString(36), dept: r.dept, item: r.item, date: r.date, sum: r.sum, d: r.d, by: me.name, at: new Date().toISOString().slice(0, 10) };
      const i = d.recs.findIndex(x => x.id === o.id); if (i >= 0) d.recs[i] = o; else d.recs.push(o); this.save(d); return { ok: 1, record: o };
    }
    if (a === 'saveMany') { const saved = [], skipped = []; for (const rec of p.list) { try { saved.push((await this.call('save', { rec })).record); } catch (e) { skipped.push(e.message); } } return { ok: 1, saved, skipped }; }
    if (a === 'delete' && me.role !== 'admin' && ['AC', 'TA'].includes((d.recs.find(x => x.id === p.id) || {}).item)) throw new Error('حذف الأنشطة والمبادرات متاح للنائب الأكاديمي فقط');
    if (a === 'delete') { d.recs = d.recs.filter(x => x.id !== p.id); this.save(d); return { ok: 1 }; }
    const fr = () => d.reps.findIndex(x => x.dept === p.dept && x.period === p.period);
    if (a === 'sign') { if (String(p.pin) !== me.pin) throw new Error('الرقم السري غير صحيح — التوقيع يتم برقمك السري فقط'); const o = { id: 'p' + Date.now(), dept: p.dept, period: p.period, from: p.from, to: p.to, status: 'موقّع من المنسقة', coordSig: me.name, coordAt: new Date().toLocaleString('en-GB'), snap: p.snap, feedback: '' }; const i = fr(); if (i >= 0) { o.feedback = d.reps[i].feedback; d.reps[i] = o; } else d.reps.push(o); this.save(d); return { ok: 1, report: o }; }
    if (a === 'approve') { if (String(p.pin) !== me.pin) throw new Error('الرقم السري غير صحيح'); const i = fr(); if (i < 0) throw new Error('لم توقّع المنسقة بعد'); Object.assign(d.reps[i], { status: 'معتمد', vpSig: me.name, vpAt: new Date().toLocaleString('en-GB'), feedback: p.feedback || d.reps[i].feedback }); this.save(d); return { ok: 1, report: d.reps[i] }; }
    if (a === 'return') { const i = fr(); Object.assign(d.reps[i], { status: 'معاد للتعديل', feedback: p.feedback || d.reps[i].feedback }); this.save(d); return { ok: 1, report: d.reps[i] }; }
    if (a === 'feedback') { let i = fr(); if (i < 0) { d.reps.push({ id: 'p' + Date.now(), dept: p.dept, period: p.period, from: p.from, to: p.to, status: 'مسودة', feedback: p.feedback }); i = d.reps.length - 1; } else d.reps[i].feedback = p.feedback; this.save(d); return { ok: 1, report: d.reps[i] }; }
    if (a === 'signature' && p.who) return { ok: 1, data: '' };
    if (a === 'setSig') return { ok: 1 };
    if (a === 'signature') return { ok: 1, data: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M20 90 C80 10,140 10,160 60 S260 100,280 30" stroke="#1B2A6E" stroke-width="4" fill="none"/><text x="150" y="112" font-size="12" text-anchor="middle" fill="#999">توقيع تجريبي</text></svg>') };
    if (a === 'setPin') { const u = d.users.find(x => x.id === p.id); u.pin = String(p.newPin); this.save(d); return { ok: 1 }; }
    if (a === 'upload') return { ok: 1, fid: 'demo' + Date.now(), name: p.name };
    if (a === 'file') return { ok: 1, name: 'ملف.txt', data: 'data:text/plain;base64,' + btoa('demo') };
    if (a === 'sendForm') { console.log('معاينة: لا يُرسل بريد فعلي', p.to, p.subject); return { ok: 1, sent: true }; }
    if (a === 'logout') { sessionStorage.removeItem('mizan_demo_u'); return { ok: 1 }; }
    throw new Error('عملية غير معروفة');
  }
};
