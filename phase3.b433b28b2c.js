/* Kundli Studio — calculation engine, Phase 3 (src/engine3.js)
   Extends the global JE (src/engine.js + src/engine2.js) with:
     JE.dashas(chart, system, opts)              24 dasha systems (nakshatra, graha, rashi/Jaimini, annual), trees to >= 3 levels
     JE.dashaPath(tree, jd, depth)               running periods at a moment (works for planet and sign dashas)
     JE.jaiminiFull(chart, opts)                 karakas, karakamsa/swamsa, arudhas + graha arudhas, upapada, argala, Jaimini yogas,
                                                 sthira karakas, Brahma/Rudra/Maheshwara, longevity (three pairs)
     JE.kp(chart|input, opts)                    Placidus cusps, star/sub/sub-sub lords, 4-step significators, ruling planets, event promises
     JE.kpRulingPlanets(jdUT, place, opts)       ruling planets for a moment & place
     JE.kpHorary(number, momentInput, opts)      KP horary chart from a number 1-249
     JE.varshaphal(chart, year|age, opts)        Tajika annual chart: solar return, Muntha, five office bearers, year lord,
                                                 Tajika aspects & 16 yogas, 36 sahams, Mudda and Patyayini dashas, masa pravesha
     JE.lalKitab(chart, opts)                    Lal Kitab teva, pakka ghar, kayam/sleeping planets & houses, rin, masnui, teva types,
                                                 age-based varshphal (1-120)
     JE.prashna(input, opts)                     Prashna chart for a moment (default now), rule list, KP number and Vedic 1-108 number methods
     JE.rectify(input, events, opts) / JE.rectifyAsync(input, events, opts, onProgress)
                                                 time-band explorer, event scoring, Kunda / Pranapada / Bhrigu-bindu checks
   Load after engine2.js (browser: later <script>; node: require('./engine3.js') returns JE).
   Pure functions, no DOM. All text objects are {en, hi}. Rule descriptions are our own words.
   Where schools differ the default follows Jagannatha Hora as reproduced by PyJHora 4.8.7 (documented per item in
   tests/ENGINE-CHANGES.md, Phase 3 section). */
(function (JE) {
  'use strict';
  if (!JE) throw new Error('engine3.js needs engine.js (global JE) to be loaded first');
  const norm = a => ((a % 360) + 360) % 360;
  const nrm180 = a => { a = norm(a); return a > 180 ? a - 360 : a; };
  const T = (en, hi) => ({ en, hi });
  const NAK = 360 / 27, PADA = NAK / 4;
  const NM = JE.names, CN = JE.constants, SIGN_LORD = CN.SIGN_LORD, VIM_YEARS = CN.VIM_YEARS, DASHA_ORDER = CN.DASHA_ORDER;
  const PL7 = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'], PL9 = PL7.concat(['Ra', 'Ke']);
  const PN = id => NM.planets[id] || T(String(id), String(id)), SN = s => NM.signs[((s % 12) + 12) % 12];
  const r2 = x => Math.round(x * 100) / 100, r4 = x => Math.round(x * 1e4) / 1e4;
  const sgn = s => ((s % 12) + 12) % 12;
  const signOf = lon => Math.floor(norm(lon) / 30) % 12;
  const degIn = lon => norm(lon) - 30 * signOf(lon);
  const isMov = s => s % 3 === 0, isFix = s => s % 3 === 1, isDual = s => s % 3 === 2;
  const isOddSign = s => s % 2 === 0;                     // Aries, Gemini, ... (0-based even index = odd sign)
  const ODD_FOOTED = [0, 1, 2, 6, 7, 8];                  // Ar Ta Ge Li Sc Sg (savya / odd-footed)
  const house = (from, to) => sgn(to - from) + 1;         // count from sign `from` to sign `to` (1..12)
  const SIGN_KEYS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const hrnow = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  // exaltation / debilitation signs (nodes: Rahu exalted Ta & Ge, Ketu Sc & Sg, as in JH/PyJHora house_strengths)
  const EXS = { Su: [0], Mo: [1], Ma: [9], Me: [5], Ju: [3], Ve: [11], Sa: [6], Ra: [1, 2], Ke: [7, 8] };
  const DBS = { Su: [6], Mo: [7], Ma: [3], Me: [11], Ju: [9], Ve: [5], Sa: [0], Ra: [7, 8], Ke: [1, 2] };
  const OWNS = { Su: [4], Mo: [3], Ma: [0, 7], Me: [2, 5], Ju: [8, 11], Ve: [1, 6], Sa: [9, 10], Ra: [10], Ke: [7] };
  const MTS = { Su: 4, Mo: 1, Ma: 0, Me: 5, Ju: 8, Ve: 6, Sa: 10, Ra: 10, Ke: 7 };
  const NATREL = {
    Su: { f: ['Mo', 'Ma', 'Ju'], e: ['Ve', 'Sa'] }, Mo: { f: ['Su', 'Me'], e: [] }, Ma: { f: ['Su', 'Mo', 'Ju'], e: ['Me'] },
    Me: { f: ['Su', 'Ve'], e: ['Mo'] }, Ju: { f: ['Su', 'Mo', 'Ma'], e: ['Me', 'Ve'] }, Ve: { f: ['Me', 'Sa'], e: ['Su', 'Mo'] },
    Sa: { f: ['Me', 'Ve'], e: ['Su', 'Mo', 'Ma'] }, Ra: { f: ['Me', 'Ve', 'Sa'], e: ['Su', 'Mo', 'Ma'] }, Ke: { f: ['Ma', 'Ve', 'Sa'], e: ['Su', 'Mo'] }
  };
  const isExalted = (id, s) => (EXS[id] || []).includes(s), isDebil = (id, s) => (DBS[id] || []).includes(s);
  // Jaimini/JH dignity code (PyJHora house_strengths): own 5 > exalted 4 > friend 3 > neutral 2 > enemy 1 > debilitated 0; Mercury in Virgo counts as own sign
  const isExaltedJ = (id, s) => isExalted(id, s) && !(id === 'Me' && s === 5);
  const jCode = (id, s) => OWNS[id].includes(s) ? 5 : isExaltedJ(id, s) ? 4 : isDebil(id, s) ? 0 : NATREL[id].f.includes(SIGN_LORD[s]) ? 3 : NATREL[id].e.includes(SIGN_LORD[s]) ? 1 : 2;
  const BENEFICS = ['Ju', 'Ve', 'Me', 'Mo'], MALEFICS = ['Su', 'Ma', 'Sa', 'Ra', 'Ke'];

  /* ==================================================================
     Chart context: one compact, cached view of a JE chart
     ================================================================== */
  const CTX = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function ctxOf(C) {
    if (CTX && CTX.has(C)) return CTX.get(C);
    const lon = {}, sign = {}, speed = {}, retro = {}, dign = {};
    for (const p of C.planets) { lon[p.id] = p.lon; sign[p.id] = p.sign; speed[p.id] = p.speed; retro[p.id] = p.retro; dign[p.id] = p.dignity; }
    lon.La = C.asc.lon; sign.La = C.asc.sign;
    const occ = []; for (let s = 0; s < 12; s++) occ.push(PL9.filter(id => sign[id] === s));
    const x = {
      C, lon, sign, speed, retro, dign, occ, asc: C.asc.lon, ascS: C.asc.sign,
      jd: C.meta.jdUT, off: C.meta.utcOffsetUsed, yd: (C.meta.options && C.meta.options.dashaYear) || 365.25,
      d9: C.vargas.D9.planets, d9asc: C.vargas.D9.asc
    };
    if (CTX) CTX.set(C, x);
    return x;
  }
  const deg = (x, id) => degIn(x.lon[id]);
  const jDeg = (x, id) => (id === 'Ra' || id === 'Ke') ? 30 - deg(x, id) : deg(x, id); // Jaimini: nodes counted from the end of the sign

  /* ------------------------------------------------------------------
     Jaimini strength rules (sign vs sign, planet vs planet), JH order as in PyJHora house.py, with the
     intended comparisons (PyJHora's "lord counted as occupant" compares a planet id with a sign index; we
     use the lord's actual sign). Nodes: degrees counted from the end of the sign.
     ------------------------------------------------------------------ */
  function rashiAspects(s) { // Jaimini rashi drishti
    const out = [];
    for (let t = 0; t < 12; t++) {
      if (t === s) continue;
      if (isMov(s) && isFix(t) && t !== (s + 1) % 12) out.push(t);
      else if (isFix(s) && isMov(t) && t !== (s + 11) % 12) out.push(t);
      else if (isDual(s) && isDual(t)) out.push(t);
    }
    return out;
  }
  const RD = []; for (let s = 0; s < 12; s++) RD.push(rashiAspects(s));
  const aspects = (from, to) => RD[from].includes(to);
  // planets (Su..Ke) that conjoin or aspect sign s by rashi drishti
  const reachSign = (x, ids, s) => ids.filter(id => x.sign[id] === s || aspects(x.sign[id], s)).length;
  function strongerPlanet(x, a, b) {
    if (a === b) return a;
    // basic co-lord rule (only Mars/Ketu for Scorpio, Saturn/Rahu for Aquarius)
    const pair = (a === 'Ma' && b === 'Ke') || (a === 'Ke' && b === 'Ma') ? 7 : (a === 'Sa' && b === 'Ra') || (a === 'Ra' && b === 'Sa') ? 10 : -1;
    if (pair >= 0) {
      const ia = x.sign[a] === pair, ib = x.sign[b] === pair;
      if (ia && !ib) return b; if (ib && !ia) return a;
    }
    const cot = id => x.occ[x.sign[id]].length - 1 + (x.ascS === x.sign[id] ? 1 : 0);
    if (cot(a) !== cot(b)) return cot(a) > cot(b) ? a : b;
    const sc = id => { const s = x.sign[id], L = SIGN_LORD[s]; return reachSign(x, ['Me', 'Ju', L], s); };
    if (sc(a) !== sc(b)) return sc(a) > sc(b) ? a : b;
    const ca = jCode(a, x.sign[a]), cb = jCode(b, x.sign[b]);
    if (isExaltedJ(a, x.sign[a]) && ca > cb) return a; if (isExaltedJ(b, x.sign[b]) && cb > ca) return b;
    const mod = id => isDual(x.sign[id]) ? 3 : isFix(x.sign[id]) ? 2 : 1;
    if (mod(a) !== mod(b)) return mod(a) > mod(b) ? a : b;
    return jDeg(x, a) > jDeg(x, b) ? a : b;
  }
  function lordOf(x, s) { s = sgn(s); if (s === 7) return strongerPlanet(x, 'Ma', 'Ke'); if (s === 10) return strongerPlanet(x, 'Sa', 'Ra'); return SIGN_LORD[s]; }
  function strongerRasiWhy(x, r1, r2) {
    r1 = sgn(r1); r2 = sgn(r2);
    const n = s => x.occ[s].length;
    if (n(r1) !== n(r2)) return { sign: n(r1) > n(r2) ? r1 : r2, rule: 'more_planets' };
    const sc = s => reachSign(x, ['Me', 'Ju', SIGN_LORD[s]], s);
    if (sc(r1) !== sc(r2)) return { sign: sc(r1) > sc(r2) ? r1 : r2, rule: 'mercury_jupiter_lord' };
    const ex = s => x.occ[s].some(id => isExaltedJ(id, s));
    if (ex(r1) !== ex(r2)) return { sign: ex(r1) ? r1 : r2, rule: 'exalted_planet' };
    const odd = s => isOddSign(x.sign[SIGN_LORD[s]]) !== isOddSign(s);
    if (odd(r1) !== odd(r2)) return { sign: odd(r1) ? r1 : r2, rule: 'lord_in_opposite_oddity' };
    const mod = s => isDual(s) ? 3 : isFix(s) ? 2 : 1;
    if (mod(r1) !== mod(r2)) return { sign: mod(r1) > mod(r2) ? r1 : r2, rule: 'dual_fixed_movable' };
    return { sign: jDeg(x, lordOf(x, r1)) > jDeg(x, lordOf(x, r2)) ? r1 : r2, rule: 'lord_degree' };
  }
  const strongerRasi = (x, a, b) => strongerRasiWhy(x, a, b).sign;

  /* ------------------------------------------------------------------
     Dasha tree nodes (lazy children like Phase 1: levels 1-2 enumerable, deeper ones generated on demand)
     ------------------------------------------------------------------ */
  function mkNode(key, isSign, start, years, level, maxLevel, x, yd, kidsFn, extra) {
    const n = isSign ? { sign: key, lord: null } : { lord: key };
    n.level = level; n.start = start; n.years = years; n.end = start + years * yd;
    n.startISO = JE.isoLocal(n.start, x.off); n.endISO = JE.isoLocal(n.end, x.off);
    if (extra) Object.assign(n, extra);
    if (level < maxLevel && kidsFn) {
      let kids = null;
      Object.defineProperty(n, 'children', { enumerable: level < 2, configurable: true, get() { if (!kids) kids = kidsFn(n); return kids; } });
    } else n.children = [];
    return n;
  }
  // split a parent into children: list of [key, weight]; equal when all weights equal
  function splitKids(parent, list, isSign, maxLevel, x, yd, kidsFn) {
    const tot = list.reduce((s, e) => s + e[1], 0), out = []; let t = parent.start;
    for (const [k, w, extra] of list) { const y = parent.years * w / tot; out.push(mkNode(k, isSign, t, y, parent.level + 1, maxLevel, x, yd, kidsFn, extra)); t += y * yd; }
    return out;
  }
  // restrict a node (and lazily its children) to [a, b]; returns null when it lies outside
  function clipNode(n, a, b, x, yd) {
    const st = Math.max(n.start, a), en = Math.min(n.end, b);
    if (en - st <= 1e-9) return null;
    if (st === n.start && en === n.end) return n;
    const c = {};
    for (const k of Object.keys(n)) if (k !== 'children') c[k] = n[k];
    Object.assign(c, { start: st, end: en, years: (en - st) / yd, startISO: JE.isoLocal(st, x.off), endISO: JE.isoLocal(en, x.off), clipped: true, fullStart: n.start, fullEnd: n.end });
    if (c.days !== undefined) c.days = r2(en - st);
    let kids = null;
    Object.defineProperty(c, 'children', { enumerable: n.level < 2, configurable: true, get() { if (!kids) kids = (n.children || []).map(k => clipNode(k, st, en, x, yd)).filter(Boolean); return kids; } });
    return c;
  }
  function dashaPath(tree, jd, depth) {
    const path = []; let list = tree;
    for (let l = 0; l < (depth || 5) && list && list.length; l++) {
      const n = list.find(q => jd >= q.start && jd < q.end); if (!n) break;
      path.push({ level: n.level, lord: n.lord, sign: n.sign === undefined ? null : n.sign, start: n.start, end: n.end, startISO: n.startISO, endISO: n.endISO, years: n.years });
      list = n.children;
    }
    return path;
  }
  const balanceObj = (x, key, isSign, totalYears, firstStart, years, yd) => {
    const by = Math.floor(totalYears + 1e-9), bm = Math.floor((totalYears - by) * 12 + 1e-9), bd = ((totalYears - by) * 12 - bm) * 30;
    const endJd = firstStart + years * yd;
    return Object.assign(isSign ? { sign: key } : { lord: key }, { years: by, months: bm, days: Math.round(bd * 10) / 10, totalYears, endJd, endISO: JE.isoLocal(endJd, x.off) });
  };

  /* ==================================================================
     1. Nakshatra (graha) dashas
     ================================================================== */
  // The 8 "conditional" nakshatra dashas of BPHS ch. 46-47. ORDER = [lord, years]; seed = star (1-based) whose lord is ORDER[seedIdx];
  // the birth star's lord is found by counting from the seed star (dir -1 = counted backwards). As in JH/PyJHora.
  const NAK_DASHAS = {
    shodashottari: { order: [['Su', 11], ['Ma', 12], ['Ju', 13], ['Sa', 14], ['Ke', 15], ['Mo', 16], ['Me', 17], ['Ve', 18]], seed: 8, dir: 1, cycles: 1 },
    dwadashottari: { order: [['Su', 7], ['Ju', 9], ['Ke', 11], ['Me', 13], ['Ra', 15], ['Ma', 17], ['Sa', 19], ['Mo', 21]], seed: 27, dir: -1, cycles: 1 },
    panchottari: { order: [['Su', 12], ['Me', 13], ['Sa', 14], ['Ma', 15], ['Ve', 16], ['Mo', 17], ['Ju', 18]], seed: 17, dir: 1, cycles: 1 },
    shatabdika: { order: [['Su', 5], ['Mo', 5], ['Ve', 10], ['Me', 10], ['Ju', 20], ['Ma', 20], ['Sa', 30]], seed: 27, dir: 1, cycles: 1 },
    chaturashiti_sama: { order: [['Su', 12], ['Mo', 12], ['Ma', 12], ['Me', 12], ['Ju', 12], ['Ve', 12], ['Sa', 12]], seed: 15, dir: 1, cycles: 1 },
    dwisaptati_sama: { order: [['Su', 9], ['Mo', 9], ['Ma', 9], ['Me', 9], ['Ju', 9], ['Ve', 9], ['Sa', 9], ['Ra', 9]], seed: 19, dir: 1, cycles: 2 },
    shattrimsha_sama: { order: [['Mo', 1], ['Su', 2], ['Ju', 3], ['Ma', 4], ['Me', 5], ['Sa', 6], ['Ve', 7], ['Ra', 8]], seed: 22, dir: 1, cycles: 3 },
    // Shashtihayani: stars grouped 3,4,3,4,... from Ashwini in ORDER (Ju 1-3, Su 4-7, Ma 8-10, Mo 11-14, Me 15-17, Ve 18-21, Sa 22-24, Ra 25-27)
    shashtihayani: { order: [['Ju', 10], ['Su', 10], ['Ma', 10], ['Mo', 6], ['Me', 6], ['Ve', 6], ['Sa', 6], ['Ra', 6]], groups: [3, 4, 3, 4, 3, 4, 3, 3], cycles: 2 }
  };
  const ANTARDASHA_LABELS = { equal: T('Equal (JH)', 'बराबर (ज.हो.)'), proportional: T('Proportional (BPHS)', 'अनुपातिक (बृ.पा.हो.शा.)') };
  const TOTALS = {}; for (const k in NAK_DASHAS) TOTALS[k] = NAK_DASHAS[k].order.reduce((s, e) => s + e[1], 0);
  function horaOfLagna(x) { return JE.vargaSign(x.asc, 2) === 4 ? 'Su' : 'Mo'; }
  function applicabilityOf(x, system) {
    const C = x.C, ascS = x.ascS, lordH = h => SIGN_LORD[sgn(ascS + h - 1)], hOf = id => house(ascS, x.sign[id]);
    const pk = C.panchang.paksha, day = C.panchang.isDayBirth, hora = horaOfLagna(x);
    switch (system) {
      case 'ashtottari': { const a = C.dashas.ashtottari; return { applicable: !!a.applicable, why: a.applicability, rule: T('Rahu in a kendra or trikona from the lagna lord (not in the lagna), or Krishna-paksha day / Shukla-paksha night birth.', 'राहु लग्नेश से केंद्र या त्रिकोण में (लग्न में नहीं), या कृष्ण पक्ष में दिन / शुक्ल पक्ष में रात का जन्म।') }; }
      case 'shodashottari': { const ok = (pk === 'shukla' && hora === 'Su') || (pk === 'krishna' && hora === 'Mo'); return { applicable: ok, why: { paksha: pk, lagnaHora: hora }, rule: T('Lagna in the Sun\'s hora in Shukla paksha, or in the Moon\'s hora in Krishna paksha (BPHS; translations differ on which hora goes with which paksha).', 'शुक्ल पक्ष में लग्न सूर्य की होरा में, या कृष्ण पक्ष में चंद्र की होरा में (बृ.पा.हो.शा.; अनुवादों में मतभेद)।') }; }
      case 'dwadashottari': { const ok = x.d9asc === 1 || x.d9asc === 6; return { applicable: ok, why: { navamsaLagna: x.d9asc }, rule: T('Navamsa lagna in a sign of Venus (Taurus or Libra).', 'नवांश लग्न शुक्र की राशि (वृषभ या तुला) में।') }; }
      case 'panchottari': { const d12 = C.vargas.D12.asc, ok = d12 === 3; return { applicable: ok, why: { dwadashamsaLagna: d12, lagnaIsCancer: ascS === 3 }, rule: T('Lagna in Cancer dwadashamsha (JH checks the D12 lagna; BPHS also has the rasi lagna in Cancer).', 'लग्न कर्क द्वादशांश में (ज.हो. D12 लग्न देखता है; बृ.पा.हो.शा. में राशि लग्न भी कर्क)।') }; }
      case 'shatabdika': { const ok = x.d9asc === ascS; return { applicable: ok, why: { vargottamaLagna: ok }, rule: T('Lagna vargottama (same sign in rasi and navamsa).', 'लग्न वर्गोत्तम (राशि और नवांश में एक ही राशि)।') }; }
      case 'chaturashiti_sama': { const L = lordH(10), ok = hOf(L) === 10; return { applicable: ok, why: { tenthLord: L, inHouse: hOf(L) }, rule: T('Lord of the 10th placed in the 10th house.', 'दशमेश दसवें भाव में।') }; }
      case 'dwisaptati_sama': { const L1 = lordH(1), L7 = lordH(7), ok = hOf(L1) === 7 || hOf(L7) === 1; return { applicable: ok, why: { lagnaLord: L1, lagnaLordHouse: hOf(L1), seventhLord: L7, seventhLordHouse: hOf(L7) }, rule: T('Lagna lord in the 7th, or 7th lord in the lagna.', 'लग्नेश सातवें में, या सप्तमेश लग्न में।') }; }
      case 'shashtihayani': { const ok = x.sign.Su === ascS; return { applicable: ok, why: { sunHouse: hOf('Su') }, rule: T('Sun in the lagna.', 'सूर्य लग्न में।') }; }
      case 'tara': { const occ = [1, 4, 7, 10].map(h => x.occ[sgn(ascS + h - 1)].length), ok = occ.every(n => n > 0); return { applicable: ok, why: { kendraOccupants: { 1: occ[0], 4: occ[1], 7: occ[2], 10: occ[3] } }, rule: T('All four kendras (houses 1, 4, 7 and 10) occupied by planets (BPHS; Rahu and Ketu count as planets here).', 'चारों केंद्र (भाव 1, 4, 7, 10) ग्रहों से युक्त (बृ.पा.हो.शा.; यहाँ राहु-केतु भी ग्रह गिने गए)।') }; }
      case 'shattrimsha_sama': { const ok = (day && hora === 'Su') || (!day && hora === 'Mo'); return { applicable: ok, why: { dayBirth: day, lagnaHora: hora }, rule: T('Day birth with lagna in the Sun\'s hora, or night birth with lagna in the Moon\'s hora.', 'दिन का जन्म और लग्न सूर्य की होरा में, या रात का जन्म और लग्न चंद्र की होरा में।') }; }
    }
    return { applicable: true, why: null, rule: null };
  }
  function nakDasha(x, system, o) {
    const cfg = NAK_DASHAS[system], ord = cfg.order, N = ord.length, tot = TOTALS[system], yd = o.yd, maxL = o.levels;
    const moon = norm(x.lon.Mo + ((o.starFromMoon || 1) - 1) * NAK), nk = Math.floor(moon / NAK), birth = nk + 1, frac = (moon - nk * NAK) / NAK;
    let li;
    if (cfg.groups) { let acc = 0; li = 0; for (let i = 0; i < cfg.groups.length; i++) { if (nk < acc + cfg.groups[i]) { li = i; break; } acc += cfg.groups[i]; } }
    else li = ((((birth - cfg.seed) * cfg.dir) % 27) + 27) % 27 % N;
    const yrs = ord[li][1], start0 = x.jd - frac * yrs * yd;
    const prop = o.antardasha === 'proportional';
    const kids = p => { const i0 = ord.findIndex(e => e[0] === p.lord), list = []; for (let k = 0; k < N; k++) { const e = ord[(i0 + k) % N]; list.push([e[0], prop ? e[1] : 1]); } return splitKids(p, list, false, maxL, x, yd, kids); };
    const tree = []; let t = start0;
    for (let c = 0; c < cfg.cycles; c++) for (let k = 0; k < N; k++) { const e = ord[(li + k) % N]; tree.push(mkNode(e[0], false, t, e[1], 1, maxL, x, yd, kids, { cycle: c + 1 })); t += e[1] * yd; }
    return {
      kind: 'graha', totalYears: tot, cycles: cfg.cycles, order: ord.map(e => ({ lord: e[0], years: e[1] })), tree,
      balanceAtBirth: balanceObj(x, ord[li][0], false, (1 - frac) * yrs, start0, yrs, yd),
      birthStar: nk, antardasha: prop ? 'proportional' : 'equal', antardashaLabel: ANTARDASHA_LABELS[prop ? 'proportional' : 'equal'],
      note: T('Starting lord counted from star ' + (cfg.seed || 1) + ' as in BPHS/JH; balance = unexpired part of the Moon\'s nakshatra × the lord\'s years. Antardashas ' + (prop ? 'proportional to the lords\' years (BPHS style).' : 'equal parts from the mahadasha lord (JH/PyJHora default; opts.antardasha:\'proportional\' for the BPHS-style split).'),
        'आरंभिक स्वामी बृ.पा.हो.शा./ज.हो. के अनुसार; शेष = चंद्र नक्षत्र का बचा भाग × स्वामी के वर्ष। अंतर्दशाएँ ' + (prop ? 'स्वामियों के वर्षों के अनुपात में।' : 'महादशा स्वामी से बराबर भागों में (ज.हो. डिफ़ॉल्ट)।'))
    };
  }

  // Tara dasha (Sanjay Rath / JH): planets in kendras from lagna ordered by strength; years as Vimshottari; balance from the Moon.
  const TARA_ORDER = { sanjay_rath: [['Ve', 20], ['Mo', 10], ['Ke', 7], ['Sa', 19], ['Ju', 16], ['Me', 17], ['Ra', 18], ['Ma', 7], ['Su', 6]],
    parashara: [['Ve', 20], ['Su', 6], ['Mo', 10], ['Ma', 7], ['Ra', 18], ['Ju', 16], ['Sa', 19], ['Me', 17], ['Ke', 7]] };
  function taraDasha(x, o) {
    const ord = TARA_ORDER[o.variant === 'parashara' ? 'parashara' : 'sanjay_rath'], yd = o.yd, maxL = o.levels;
    // kendra groups, larger groups first (lagna counts in its house), stable in kendra order 1,4,7,10
    const groups = [1, 4, 7, 10].map(h => { const s = sgn(x.ascS + h - 1); return { h, ids: x.occ[s].slice(), size: x.occ[s].length + (h === 1 ? 1 : 0) }; });
    const sorted = groups.slice().sort((a, b) => b.size - a.size), flat = [].concat(...sorted.map(g => g.ids));
    let first;
    if (flat.length) { first = flat[0]; for (let i = 1; i < flat.length; i++) first = strongerPlanet(x, flat[i], first); }
    else first = ord[0][0];
    const li = ord.findIndex(e => e[0] === first), moon = x.lon.Mo, nk = Math.floor(moon / NAK), frac = (moon - nk * NAK) / NAK;
    const yrs = ord[li][1], start0 = x.jd - frac * yrs * yd;
    const kids = p => { const i0 = ord.findIndex(e => e[0] === p.lord), list = []; for (let k = 0; k < 9; k++) { const e = ord[(i0 + k) % 9]; list.push([e[0], e[1]]); } return splitKids(p, list, false, maxL, x, yd, kids); };
    const tree = []; let t = start0;
    for (let k = 0; k < 9; k++) { const e = ord[(li + k) % 9]; tree.push(mkNode(e[0], false, t, e[1], 1, maxL, x, yd, kids)); t += e[1] * yd; }
    return { kind: 'graha', totalYears: 120, tree, order: ord.map(e => ({ lord: e[0], years: e[1] })), kendraPlanets: flat, firstLordReason: flat.length ? 'strongest_in_kendra' : 'no_kendra_planet',
      balanceAtBirth: balanceObj(x, first, false, (1 - frac) * yrs, start0, yrs, yd), variant: o.variant === 'parashara' ? 'parashara' : 'sanjay_rath',
      note: T('Tara dasha (JH, Sanjay Rath order): the first lord is the strongest planet in the kendras from the lagna (Jaimini strength rules, larger kendra groups first); the periods then follow the fixed Tara order (' + ord.map(e => e[0]).join(', ') + ') with Vimshottari years; balance from the Moon\'s nakshatra; antardashas proportional. BPHS gives it for charts with all four kendras occupied (see applicability).', 'तारा दशा (ज.हो., संजय रथ क्रम): पहला स्वामी लग्न से केंद्रों में सबसे बलवान ग्रह; फिर निश्चित तारा क्रम में विंशोत्तरी वर्षों से; शेष चंद्र नक्षत्र से; अंतर्दशाएँ अनुपात में। बृ.पा.हो.शा. इसे चारों केंद्रों में ग्रह होने पर देता है।') };
  }

  // Tithi Ashtottari: Ashtottari order and years; lord from the birth tithi; balance = unexpired part of the tithi.
  const ASHTO_ORDER = [['Su', 6], ['Mo', 15], ['Ma', 8], ['Me', 17], ['Sa', 10], ['Ju', 19], ['Ra', 12], ['Ve', 21]];
  function tithiLordOf(t) { // t = 1..30
    const TAB = { Su: [1, 9, 16, 24], Mo: [2, 10, 17, 25], Ma: [3, 11, 18, 26], Me: [4, 12, 19, 27], Ju: [5, 13, 20, 28], Ve: [6, 14, 21, 29], Sa: [7, 15, 22], Ra: [8, 23, 30] };
    for (const k in TAB) if (TAB[k].includes(t)) return k;
    return 'Su';
  }
  function tithiAshtottari(x, o) {
    const yd = o.yd, maxL = o.levels, el = norm(x.C._P ? (x.C._P.Mo.trop - x.C._P.Su.trop) : (x.lon.Mo - x.lon.Su));
    const ti = Math.floor(el / 12), tnum = ti + 1, frac = (el - ti * 12) / 12, lord = tithiLordOf(tnum);
    const li = ASHTO_ORDER.findIndex(e => e[0] === lord), yrs = ASHTO_ORDER[li][1], start0 = x.jd - frac * yrs * yd;
    const startNext = o.antardashaFrom !== 'self';
    const kids = p => { const i0 = ASHTO_ORDER.findIndex(e => e[0] === p.lord) + (startNext ? 1 : 0), list = []; for (let k = 0; k < 8; k++) { const e = ASHTO_ORDER[(i0 + k) % 8]; list.push([e[0], e[1]]); } return splitKids(p, list, false, maxL, x, yd, kids); };
    const tree = []; let t = start0;
    for (let k = 0; k < 8; k++) { const e = ASHTO_ORDER[(li + k) % 8]; tree.push(mkNode(e[0], false, t, e[1], 1, maxL, x, yd, kids)); t += e[1] * yd; }
    return { kind: 'graha', totalYears: 108, tree, tithi: tnum, tithiLord: lord, order: ASHTO_ORDER.map(e => ({ lord: e[0], years: e[1] })),
      balanceAtBirth: balanceObj(x, lord, false, (1 - frac) * yrs, start0, yrs, yd),
      note: T('Tithi Ashtottari: lord from the birth tithi (Sun 1/9/16/24, Moon 2/10/17/25, Mars 3/11/18/26, Mercury 4/12/19/27, Jupiter 5/13/20/28, Venus 6/14/21/29, Saturn 7/15/22, Rahu 8/23/30); balance = unexpired part of the tithi × years; antardashas proportional, starting from the next lord (JH default; opts.antardashaFrom:\'self\' to start from the mahadasha lord).',
        'तिथि अष्टोत्तरी: स्वामी जन्म-तिथि से; शेष = तिथि का बचा भाग × वर्ष; अंतर्दशाएँ अनुपात में, अगले स्वामी से (ज.हो. डिफ़ॉल्ट)।') };
  }

  // Moola dasha = Lagna Kendradi Graha dasha (JH): planets in kendras, then panapharas, then apoklimas from the lagna, by strength.
  function moolaGraha(x, o) {
    const yd = o.yd, maxL = o.levels;
    const byStrength = ids => { const a = ids.slice(), out = []; while (a.length) { let b = a[0]; for (const id of a) b = strongerPlanet(x, id, b); out.push(b); a.splice(a.indexOf(b), 1); } return out; };
    const inHouses = hs => PL9.filter(id => hs.includes(house(x.ascS, x.sign[id])));
    const Q = byStrength(inHouses([1, 4, 7, 10])).concat(byStrength(inHouses([2, 5, 8, 11])), byStrength(inHouses([3, 6, 9, 12])));
    const cand = [...new Set([x.ascS, x.sign.Mo, x.sign.Su].flatMap(r => PL9.filter(id => [1, 4, 7, 10].includes(house(r, x.sign[id])))))];
    let seed = cand.length ? cand[0] : Q[0]; for (const id of cand) seed = strongerPlanet(x, id, seed);
    const qi = Q.indexOf(seed), q = Q.slice(qi).concat(Q.slice(0, qi));
    const y1 = {}, y2 = {};
    for (const id of PL9) {
      const s = x.sign[id]; let y = VIM_YEARS[id] - (s === MTS[id] ? (o.moolatrikonaZero ? 0 : 12) : sgn(MTS[id] - s));
      if (isExalted(id, s)) y += 1; else if (isDebil(id, s)) y -= 1;
      if (y <= 0) y = 1; y1[id] = y; y2[id] = VIM_YEARS[id] - y;
    }
    const kids = p => { const i0 = q.indexOf(p.lord), list = []; for (let k = 0; k < 9; k++) { const id = q[(i0 + k) % 9]; list.push([id, y1[id]]); } return splitKids(p, list, false, maxL, x, yd, kids); };
    const tree = []; let t = x.jd;
    for (let c = 0; c < 2; c++) for (const id of q) { const y = c ? y2[id] : y1[id]; if (y <= 0) continue; tree.push(mkNode(id, false, t, y, 1, maxL, x, yd, kids, { cycle: c + 1 })); t += y * yd; }
    return { kind: 'graha', tree, sequence: q, years: { cycle1: y1, cycle2: y2 }, seedPlanet: seed,
      balanceAtBirth: balanceObj(x, q[0], false, y1[q[0]], x.jd, y1[q[0]], yd),
      note: T('Moola dasha (Lagna Kendradi Graha dasha, as in JH): order = planets in kendras, panapharas, apoklimas from the lagna, strongest first, starting with the strongest planet in kendras from lagna, Moon or Sun. Years = Vimshottari years minus the distance to the moolatrikona sign (12 if in it), ±1 for exaltation/debilitation, minimum 1; second cycle = remainder. Starts at birth (no balance). This graha form is the default (JH); opts.variant:"rasi" gives the sign form (Lagna Kendradi Rasi dasha).',
        'मूल दशा (लग्न केंद्रादि ग्रह दशा, ज.हो.): क्रम = लग्न से केंद्र, पणफर, आपोक्लिम के ग्रह, बलवान पहले। वर्ष = विंशोत्तरी वर्ष − मूलत्रिकोण तक दूरी, उच्च/नीच ±1; दूसरा चक्र = शेष। जन्म से आरंभ।') };
  }

  /* ==================================================================
     2. Kalachakra dasha (BPHS ch. 49; JH/PyJHora tables)
     ================================================================== */
  const KC_YEARS = [7, 16, 9, 21, 5, 9, 16, 7, 10, 4, 4, 10];
  const KC_SEQ = [
    [[0, 1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 7, 6, 5, 3, 4, 2], [1, 0, 11, 10, 9, 8, 0, 1, 2], [3, 4, 5, 6, 7, 8, 9, 10, 11]],
    [[7, 6, 5, 3, 4, 2, 1, 0, 11], [10, 9, 8, 0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11, 7, 6, 5], [3, 4, 2, 1, 0, 11, 10, 9, 8]],
    [[8, 9, 10, 11, 0, 1, 2, 4, 3], [5, 6, 7, 11, 10, 9, 8, 7, 6], [5, 4, 3, 2, 1, 0, 8, 9, 10], [11, 0, 1, 2, 4, 3, 5, 6, 7]],
    [[11, 10, 9, 8, 7, 6, 5, 4, 3], [2, 1, 0, 8, 9, 10, 11, 0, 1], [2, 4, 3, 5, 6, 7, 11, 10, 9], [8, 7, 6, 5, 4, 3, 2, 1, 0]]];
  const KC_G0 = [0, 2, 6, 8, 12, 14, 18, 20, 24, 26], KC_G1 = [1, 7, 13, 19, 25], KC_G2 = [3, 9, 15, 21];
  function kcGroup(nk, revati) {
    if (nk === 26) return revati === 'pyjhora' ? 1 : 0;
    return KC_G0.includes(nk) ? 0 : KC_G1.includes(nk) ? 1 : KC_G2.includes(nk) ? 2 : 3;
  }
  const kcSum = seq => seq.reduce((s, z) => s + KC_YEARS[z], 0);
  function kalachakra(x, o) {
    const yd = o.yd, maxL = o.levels, moon = x.lon.Mo, nk = Math.floor(moon / NAK), pada = Math.min(3, Math.floor((moon - nk * NAK) / PADA));
    const frac = (moon - nk * NAK - pada * PADA) / PADA, g0 = kcGroup(nk, o.revati);
    const seq0 = KC_SEQ[g0][pada], param = kcSum(seq0), done = frac * param;
    let idx = 0, cum = 0; while (idx < 8 && cum + KC_YEARS[seq0[idx]] <= done) { cum += KC_YEARS[seq0[idx]]; idx++; }
    const elapsedFirst = done - cum;
    const savya = g0 <= 1, part = { deha: savya ? seq0[0] : seq0[8], jeeva: savya ? seq0[8] : seq0[0] };
    const kids = p => { const seq = KC_SEQ[p.kcGroup][p.kcPada], i0 = o.kcAntardasha === 'positional' ? p.kcIndex : seq.indexOf(p.sign), list = []; for (let k = 0; k < 9; k++) { const z = seq[(i0 + k) % 9]; list.push([z, KC_YEARS[z], { kcGroup: p.kcGroup, kcPada: p.kcPada, kcIndex: (i0 + k) % 9 }]); } return splitKids(p, list, true, maxL, x, yd, kids); };
    const tree = []; let t = x.jd - elapsedFirst * yd, n = nk, pd = pada, i = idx, prev = null, prevDir = savya ? 1 : -1;
    const limit = x.jd + (o.years || 120) * yd;
    while (t < limit && tree.length < 60) {
      const g = kcGroup(n, o.revati), seq = KC_SEQ[g][pd], z = seq[i];
      let gati = null;
      if (prev !== null) {
        const d = nrm180((z - prev) * 30) / 30;
        if (Math.abs(d) === 2) gati = 'manduka'; else if (Math.abs(d) === 4) gati = 'simhavalokana';
        else if (Math.abs(d) === 1 && Math.sign(d) !== prevDir) gati = 'markata';
        if (d !== 0) prevDir = Math.sign(d);
      }
      tree.push(mkNode(z, true, t, KC_YEARS[z], 1, maxL, x, yd, kids, { kcGroup: g, kcPada: pd, kcIndex: i, nakshatra: n, savya: g <= 1, gati, deha: (g <= 1 ? seq[0] : seq[8]) === z && i === (g <= 1 ? 0 : 8), jeeva: (g <= 1 ? seq[8] : seq[0]) === z && i === (g <= 1 ? 8 : 0) }));
      t += KC_YEARS[z] * yd; prev = z; i++;
      if (i === 9) { i = 0; pd++; if (pd === 4) { pd = 0; n = (n + 1) % 27; } }
    }
    return { kind: 'rashi', tree, group: savya ? 'savya' : 'apasavya', groupIndex: g0, dehaJeevaConvention: 'app_convention',
      dehaJeevaNote: T('Deha and jeeva are labelled by a convention: the first and last signs of the pada cycle, reversed for the apasavya group. BPHS names them but texts and software differ on the apasavya ends (PyJHora shows none), so treat these two labels as a reading aid.', 'देह और जीव एक परिपाटी से चिह्नित: पाद-चक्र की पहली और अंतिम राशि, अपसव्य में उलटी। ग्रंथ और सॉफ़्टवेयर अपसव्य के छोरों पर भिन्न हैं, इसलिए इन्हें पढ़ने में सहायक मानें।'), nakshatra: nk, pada: pada + 1, paramayush: param, sequence: seq0,
      deha: part.deha, jeeva: part.jeeva, balanceAtBirth: balanceObj(x, seq0[idx], true, KC_YEARS[seq0[idx]] - elapsedFirst, x.jd - elapsedFirst * yd, KC_YEARS[seq0[idx]], yd),
      note: T('Kalachakra (BPHS): the Moon\'s nakshatra pada fixes a 9-sign sequence (savya or apasavya group) whose sign years add up to the paramayush; the elapsed part of the pada × paramayush is taken off from the start. Antardashas follow the same 9-sign cycle from (the first occurrence of) the mahadasha sign, in proportion to sign years (JH/PyJHora; opts.kcAntardasha:\'positional\' starts from the mahadasha\'s own position when a sign occurs twice). Gatis mark the jumps: manduka (frog, 2 signs), markata (monkey, reversal), simhavalokana (lion\'s glance, trine jump). Deha/jeeva: first/last sign of the cycle for savya, last/first for apasavya. Revati follows the Krittika pattern as in BPHS (opts.revati:\'pyjhora\' puts it with Bharani as PyJHora does).',
        'कालचक्र (बृ.पा.हो.शा.): चंद्र के नक्षत्र-पाद से 9 राशियों का क्रम (सव्य या अपसव्य); राशि-वर्षों का योग परमायु; पाद का बीता भाग × परमायु आरंभ से घटाया जाता है। अंतर्दशाएँ उसी चक्र में, राशि-वर्षों के अनुपात में। गतियाँ: मंडूक (2 राशि की छलाँग), मर्कट (उलटी चाल), सिंहावलोकन (त्रिकोण की छलाँग)। देह/जीव: सव्य में पहली/अंतिम राशि, अपसव्य में उलटा।') };
  }

  /* ==================================================================
     3. Rashi (Jaimini) dashas: Narayana, Sudasa, Drig, Sthira, Navamsa, Shoola, Moola (rasi), Chara
     ================================================================== */
  // Narayana years (JH): count from the sign to its lord (backwards for even-footed signs) minus one; 12 if the lord is in the sign;
  // +1 exalted lord, -1 debilitated lord. Scorpio/Aquarius use the stronger co-lord.
  function narYears(x, s) {
    if ((s === 7 && x.sign.Ma === 7 && x.sign.Ke === 7) || (s === 10 && x.sign.Sa === 10 && x.sign.Ra === 10)) return 12; // both co-lords in the sign
    const L = lordOf(x, s), H = x.sign[L];
    let n = ODD_FOOTED.includes(s) ? house(s, H) : house(H, s);
    n -= 1; if (n <= 0) n = 12;
    if (isExaltedJ(L, H)) n += 1; else if (isDebil(L, H)) n -= 1;
    return n;
  }
  const NAR_NORMAL = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [1, 8, 3, 10, 5, 0, 7, 2, 9, 4, 11, 6], [2, 10, 6, 5, 1, 9, 8, 4, 0, 11, 7, 3], [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4],
    [4, 9, 2, 7, 0, 5, 10, 3, 8, 1, 6, 11], [5, 9, 1, 2, 6, 10, 11, 3, 7, 8, 0, 4], [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5], [7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5, 0],
    [8, 4, 0, 11, 7, 3, 2, 10, 6, 5, 1, 9], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10], [10, 3, 8, 1, 6, 11, 4, 9, 2, 7, 0, 5], [11, 3, 7, 8, 0, 4, 5, 9, 1, 2, 6, 10]];
  const NAR_KETU = [[0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], [1, 6, 11, 4, 9, 2, 7, 0, 5, 10, 3, 8], [2, 6, 10, 11, 3, 7, 8, 0, 4, 5, 9, 1], [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
    [4, 11, 6, 1, 8, 3, 10, 5, 0, 7, 2, 9], [5, 1, 9, 8, 4, 0, 11, 7, 3, 2, 10, 6], [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7], [7, 0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2],
    [8, 0, 4, 5, 9, 1, 2, 6, 10, 11, 3, 7], [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8], [10, 5, 0, 7, 2, 9, 4, 11, 6, 1, 8, 3], [11, 7, 3, 2, 10, 6, 5, 1, 9, 8, 4, 0]];
  // Narayana antardasha (JH): from the stronger of the signs holding the lords of the dasha sign and its 7th; odd sign forward,
  // even backward; Saturn there = forward; Ketu in the dasha sign reverses.
  function narAntarOrder(x, s) {
    const a = x.sign[lordOf(x, s)], b = x.sign[lordOf(x, s + 6)], seed = strongerRasi(x, a, b);
    let dir = isOddSign(seed) ? 1 : -1; if (x.occ[seed].includes('Sa')) dir = 1; if (x.occ[s].includes('Ke')) dir = -dir;
    const out = []; for (let i = 0; i < 12; i++) out.push(sgn(seed + dir * i)); return out;
  }
  // generic two-cycle rashi dasha: seq of 12 signs, years(s); second cycle 12 - years (zero periods skipped)
  function rashiTree(x, o, seq, yrsOf, adOrder, opt) {
    opt = opt || {}; const yd = o.yd, maxL = o.levels;
    const kids = p => { const ord = adOrder(p.sign, p), list = ord.map(z => [z, 1]); return splitKids(p, list, true, maxL, x, yd, kids); };
    const tree = []; let t = x.jd - (opt.elapsedFirst || 0) * yd;
    const first = seq.map(yrsOf);
    for (let c = 0; c < (opt.cycles || 2); c++) seq.forEach((s, k) => {
      const y = c === 0 ? first[k] : 12 - first[k]; if (y <= 0) return;
      tree.push(mkNode(s, true, t, y, 1, maxL, x, yd, kids, { cycle: c + 1 })); t += y * yd;
    });
    return { tree, firstYears: first };
  }
  function narayana(x, o) {
    const sw = o.seed === 'lagna' ? { sign: x.ascS, rule: 'from_lagna' } : strongerRasiWhy(x, x.ascS, x.ascS + 6), seed = sw.sign;
    const tab = x.occ[seed].includes('Ke') ? NAR_KETU : x.occ[seed].includes('Sa') ? null : NAR_NORMAL;
    const seq = tab ? tab[seed] : Array.from({ length: 12 }, (_, i) => sgn(seed + i));
    const r = rashiTree(x, o, seq, s => narYears(x, s), s => narAntarOrder(x, s));
    return { kind: 'rashi', tree: r.tree, seed, seedRule: sw.rule, sequence: seq, years: Object.fromEntries(seq.map((s, k) => [s, r.firstYears[k]])),
      balanceAtBirth: balanceObj(x, seq[0], true, r.firstYears[0], x.jd, r.firstYears[0], o.yd),
      note: T('Narayana dasha (JH method): starts from the stronger of lagna and 7th (Jaimini strength rules); movable signs run in order, fixed signs every 6th sign, dual signs kendra-wise, forward from an odd seed sign and backward from an even one; Saturn in the seed makes it run zodiacally, Ketu reverses. Years as for Chara dasha (count to lord −1, 12 in own sign, ±1 exalted/debilitated); second cycle 12 − first. Antardashas from the stronger of the signs of the dasha-sign lord and the 7th lord. Starts at birth.',
        'नारायण दशा (ज.हो.): लग्न और सप्तम में बलवान से आरंभ; चर राशियाँ क्रम से, स्थिर हर छठी, द्विस्वभाव केंद्र-क्रम से; विषम बीज राशि से आगे, सम से पीछे; बीज में शनि हो तो सीधा, केतु हो तो उलटा। वर्ष चर दशा जैसे; दूसरा चक्र 12 − पहला। जन्म से आरंभ।') };
  }
  function sudasa(x, o) {
    const sl = x.C.specialLagnas.sree.lon, S = signOf(sl), d = degIn(sl);
    let dir = isOddSign(S) ? 1 : -1; if (x.occ[S].includes('Sa')) dir = 1; else if (x.occ[S].includes('Ke')) dir = -dir;
    const seq = [1, 4, 7, 10, 2, 5, 8, 11, 3, 6, 9, 12].map(k => sgn(S + dir * (k - 1)));
    const n0 = narYears(x, S), elapsed = n0 * d / 30;
    const ad = s => { const seed = strongerRasi(x, s, s + 6), dd = isOddSign(seed) ? -1 : 1, out = []; for (let i = 0; i < 12; i++) out.push(sgn(seed + dd * i)); return out; };
    const r = rashiTree(x, o, seq, s => narYears(x, s), ad, { elapsedFirst: elapsed });
    return { kind: 'rashi', tree: r.tree, sreeLagna: { lon: sl, sign: S, deg: d }, direction: dir > 0 ? 'forward' : 'backward', sequence: seq,
      balanceAtBirth: balanceObj(x, S, true, n0 - elapsed, x.jd - elapsed * o.yd, n0, o.yd),
      note: T('Sudasa (Parashara/JH): starts from Sree Lagna; kendras, then panapharas, then apoklimas, forward for an odd sign and backward for an even one (Saturn there: forward; Ketu: reversed). Years as Narayana; the part of the first sign already crossed by Sree Lagna is taken as elapsed. Antardashas: from the stronger of the dasha sign and its 7th, even sign forward (JH option 2).',
        'सुदशा (पराशर/ज.हो.): श्री लग्न से; केंद्र, पणफर, आपोक्लिम क्रम से; विषम राशि आगे, सम पीछे। वर्ष नारायण जैसे; श्री लग्न द्वारा पार किया भाग बीता माना जाता है।') };
  }
  function drig(x, o) {
    const seq = [];
    for (const k of [8, 9, 10]) {
      const a = sgn(x.ascS + k), asp = RD[a].slice();
      let ordd;
      if (!ODD_FOOTED.includes(a)) ordd = asp.filter(z => z < a).sort((p, q) => q - p).concat(asp.filter(z => z > a).sort((p, q) => q - p));
      else ordd = asp.filter(z => z > a).sort((p, q) => p - q).concat(asp.filter(z => z < a).sort((p, q) => p - q));
      seq.push(a, ...ordd);
    }
    const r = rashiTree(x, o, seq, s => narYears(x, s), s => narAntarOrder(x, s));
    return { kind: 'rashi', tree: r.tree, sequence: seq,
      balanceAtBirth: balanceObj(x, seq[0], true, r.firstYears[0], x.jd, r.firstYears[0], o.yd),
      note: T('Drig dasha (Jaimini, PVR book / JH): the 9th, 10th and 11th signs from the lagna, each followed by the signs it aspects (forward from an odd-footed sign, backward from an even-footed one); years and antardashas as in Narayana dasha. Mainly used for spiritual progress.',
        'दृग दशा (जैमिनी): लग्न से 9वीं, 10वीं, 11वीं राशि, प्रत्येक के बाद उसकी दृष्ट राशियाँ; वर्ष और अंतर्दशाएँ नारायण जैसी। मुख्यतः आध्यात्मिक प्रगति के लिए।') };
  }
  const MOD_YEARS = s => isMov(s) ? 7 : isFix(s) ? 8 : 9;
  function sthira(x, o) {
    const b = brahmaOf(x, o.brahma), seed = x.sign[b.planet], seq = Array.from({ length: 12 }, (_, i) => sgn(seed + i));
    const r = rashiTree(x, o, seq, MOD_YEARS, s => Array.from({ length: 12 }, (_, i) => sgn(s + i)), { cycles: 1 });
    return { kind: 'rashi', tree: r.tree, seed, brahma: b.planet, sequence: seq, balanceAtBirth: balanceObj(x, seed, true, MOD_YEARS(seed), x.jd, MOD_YEARS(seed), o.yd),
      note: T('Sthira dasha (Jaimini): starts from the sign of Brahma and runs forward; movable signs 7, fixed 8, dual 9 years (96 years). Antardashas forward from the dasha sign. Used for longevity.', 'स्थिर दशा (जैमिनी): ब्रह्मा की राशि से आगे; चर 7, स्थिर 8, द्विस्वभाव 9 वर्ष। आयु के लिए।') };
  }
  const NAV_SEED = [0, 4, 6, 10, 0, 4, 6, 10, 0, 4, 6, 10], NAV_AD = [6, 0, 8, 10, 4, 8, 6, 0, 8, 10, 4, 8];
  function navamsaDasha(x, o) {
    const seed = NAV_SEED[x.d9asc], seq = Array.from({ length: 12 }, (_, i) => sgn(seed + i));
    const r = rashiTree(x, o, seq, () => 9, s => Array.from({ length: 12 }, (_, i) => sgn(NAV_AD[s] + i)), { cycles: 1 });
    return { kind: 'rashi', tree: r.tree, seed, sequence: seq, navamsaLagna: x.d9asc, balanceAtBirth: balanceObj(x, seed, true, 9, x.jd, 9, o.yd),
      note: T('Navamsa dasha (Jaimini, as tabulated in JH/PyJHora): the first sign depends on the element of the navamsa lagna (fire: Aries, earth: Leo, air: Libra, water: Aquarius) and the signs then run forward (zodiacally) for every chart; every sign gets 9 years (108 years); antardashas run forward from a tabulated sign.', 'नवांश दशा (जैमिनी, ज.हो. तालिका): पहली राशि नवांश लग्न के तत्व से (अग्नि: मेष, पृथ्वी: सिंह, वायु: तुला, जल: कुंभ), फिर हर कुंडली में राशियाँ आगे क्रम से; हर राशि 9 वर्ष; अंतर्दशाएँ तालिका की राशि से आगे।') };
  }
  function shoola(x, o) {
    const seed = strongerRasi(x, x.ascS, x.ascS + 6), seq = Array.from({ length: 12 }, (_, i) => sgn(seed + i));
    const r = rashiTree(x, o, seq, () => 9, s => { const st = strongerRasi(x, s, s + 6); return Array.from({ length: 12 }, (_, i) => sgn(st + i)); }, { cycles: 1 });
    return { kind: 'rashi', tree: r.tree, seed, sequence: seq, rudra: rudraOf(x).planet, balanceAtBirth: balanceObj(x, seed, true, 9, x.jd, 9, o.yd),
      note: T('Shoola dasha (Jaimini): from the stronger of lagna and 7th, forward, 9 years per sign; antardashas from the stronger of the dasha sign and its 7th. Read with Rudra and the trines of Rudra (trishoola) for health crises and longevity.', 'शूल दशा (जैमिनी): लग्न और सप्तम में बलवान से, आगे, हर राशि 9 वर्ष। रुद्र और त्रिशूल के साथ स्वास्थ्य-संकट और आयु के लिए।') };
  }
  function moolaRasi(x, o) {
    const seed = strongerRasi(x, x.ascS, x.ascS + 6);
    let dir = x.occ[seed].includes('Sa') ? 1 : x.occ[seed].includes('Ke') ? -1 : isOddSign(seed) ? 1 : -1;
    const seq = [0, 3, 6, 9, 1, 4, 7, 10, 2, 5, 8, 11].map(k => sgn(seed + dir * k));
    const ad = s => { let d = (x.occ[s].includes('Sa') || isOddSign(s)) ? 1 : -1; if (x.occ[s].includes('Ke')) d = -d; return Array.from({ length: 12 }, (_, i) => sgn(s + d * i)); };
    const r = rashiTree(x, o, seq, s => narYears(x, s), ad);
    return { kind: 'rashi', tree: r.tree, seed, sequence: seq, variant: 'rasi', balanceAtBirth: balanceObj(x, seed, true, r.firstYears[0], x.jd, r.firstYears[0], o.yd),
      note: T('Moola dasha, rasi variant (Lagna Kendradi Rasi dasha): from the stronger of lagna and 7th, kendras then panapharas then apoklimas; Narayana years. The default Moola dasha is the graha form (JH); this sign form is the option.', 'मूल दशा, राशि रूप: लग्न-सप्तम में बलवान से, केंद्र-पणफर-आपोक्लिम; नारायण वर्ष।') };
  }
  // Chara dasha (K.N. Rao), Phase 1 periods wrapped as a tree; deeper levels repeat the antardasha rule
  function charaTree(x, o) {
    const ch = x.C.dashas.chara, yd = ch.yearDays || o.yd, maxL = o.levels, SAV = [0, 1, 2, 6, 7, 8];
    const kids = p => { const dd = SAV.includes(p.sign) ? 1 : -1, list = []; for (let j = 1; j <= 12; j++) list.push([sgn(p.sign + dd * j), 1]); return splitKids(p, list, true, maxL, x, yd, kids); };
    const tree = ch.periods.map(pp => mkNode(pp.sign, true, pp.start, pp.years, 1, maxL, x, yd, kids, { cycle: pp.cycle }));
    return { kind: 'rashi', tree, direction: ch.direction, note: ch.note, balanceAtBirth: balanceObj(x, tree[0].sign, true, tree[0].years, tree[0].start, tree[0].years, yd), yearDaysUsedByChart: ch.yearDays };
  }

  /* ==================================================================
     4. Jaimini (complete)
     ================================================================== */
  const goodDign = d => ['exalted', 'moolatrikona', 'own', 'friend', 'great_friend'].includes(d);
  // Brahma: opts.brahma 'houses_1_7' (default, JH/PyJHora: placed in houses 1-7 from the reference sign) or 'visible_half'
  // (the classical "visible half", houses 7-12, as most translations of the Jaimini Sutras read it).
  function brahmaOf(x, mode) {
    const sp = strongerRasi(x, x.ascS, x.ascS + 6), vis = mode === 'visible_half';
    const half = id => { const h = house(sp, x.sign[id]); return vis ? h >= 7 : h <= 7; };
    let cands = [6, 8, 12].map(h => { let L = lordOf(x, sp + h - 1); if (L === 'Ra' || L === 'Ke') L = SIGN_LORD[sgn(sp + h - 1)]; return L; });
    cands = [...new Set(cands)];
    const score = id => (goodDign(x.dign[id]) ? 1 : 0) + (isOddSign(x.sign[id]) ? 1 : 0) + (half(id) ? 1 : 0);
    const ranked = cands.map((id, i) => ({ id, s: score(id), i })).sort((a, b) => b.s - a.s || a.i - b.i);
    const top = ranked.slice(0, 2), planet = top.length > 1 ? strongerPlanet(x, top[0].id, top[1].id) : top[0].id;
    return { planet, sign: x.sign[planet], from: sp, mode: vis ? 'visible_half' : 'houses_1_7', candidates: ranked.map(r => ({ planet: r.id, score: r.s })),
      rule: vis ? T('Brahma (visible-half reading): among the lords of the 6th, 8th and 12th from the stronger of lagna and 7th, the one best placed (friendly/own/exalted, odd sign, in the visible half: houses 7-12 from that sign), the stronger of the two best.', 'ब्रह्मा (दृश्य-अर्ध पाठ): लग्न-सप्तम में बलवान से 6, 8, 12 के स्वामियों में सबसे अच्छी स्थिति वाला (मित्र/स्व/उच्च, विषम राशि, दृश्य अर्ध: उस राशि से भाव 7-12 में)।')
        : T('Brahma (default, JH): among the lords of the 6th, 8th and 12th from the stronger of lagna and 7th, the one best placed (friendly/own/exalted, odd sign, in houses 1-7 from that sign), the stronger of the two best. opts.brahma:"visible_half" uses houses 7-12 instead.', 'ब्रह्मा (डिफ़ॉल्ट, ज.हो.): लग्न-सप्तम में बलवान से 6, 8, 12 के स्वामियों में सबसे अच्छी स्थिति वाला (मित्र/स्व/उच्च, विषम राशि, उस राशि से भाव 1-7 में)। विकल्प: दृश्य अर्ध (भाव 7-12)।') };
  }
  // Jaimini 8th house for Rudra (PVR, Integrated Approach, table 32; JH): 8th counted forward from odd-footed and backward from
  // even-footed signs, but the 2nd (forward / backward) for fixed signs.
  const RUDRA8 = [7, 2, 9, 8, 3, 10, 1, 8, 3, 2, 9, 4];
  function rudraOf(x) {
    const a = lordOf(x, RUDRA8[x.ascS]), b = lordOf(x, RUDRA8[sgn(x.ascS + 6)]), planet = strongerPlanet(x, a, b), s = x.sign[planet];
    return { planet, sign: s, trishoola: [s, sgn(s + 4), sgn(s + 8)], candidates: [a, b],
      rule: T('Rudra (PVR/JH): the stronger of the lords of the Jaimini 8th house from the lagna and from the 7th. The Jaimini 8th is counted forward from an odd-footed sign and backward from an even-footed one, but for fixed signs the 2nd (forward or backward) is used. Its sign and trines form the trishoola.', 'रुद्र (पी.वी.आर./ज.हो.): लग्न से और सप्तम से जैमिनी अष्टम के स्वामियों में बलवान। जैमिनी अष्टम विषम-पाद राशि से आगे और सम-पाद से पीछे गिना जाता है, पर स्थिर राशियों के लिए दूसरा भाव। उसकी राशि और त्रिकोण त्रिशूल।') };
  }
  function maheshwaraOf(x, ak) {
    const base = x.sign[ak]; let M = lordOf(x, base + 7), why = 'eighth_lord_from_ak';
    if (OWNS[M] && (OWNS[M].includes(x.sign[M]) || isExalted(M, x.sign[M]))) { M = strongerPlanet(x, lordOf(x, base + 7), lordOf(x, base + 11)); why = 'stronger_of_8th_12th_lords'; }
    const nodeWith = x.occ[x.sign[M]].some(id => (id === 'Ra' || id === 'Ke') && id !== M) || x.occ[sgn(x.sign[M] + 7)].some(id => id === 'Ra' || id === 'Ke');
    if (nodeWith) { M = lordOf(x, base + 5); why = 'sixth_lord_nodes_involved'; }
    if (M === 'Ra') M = 'Me'; else if (M === 'Ke') M = 'Ju';
    const isAK = M === ak;
    return { planet: M, sign: x.sign[M], why, isAtmakaraka: isAK, akNote: isAK ? T('Here Maheshwara is the Atmakaraka itself: the soul\'s own significator also guides its release, so the themes of the Atmakaraka and of moksha are read together.', 'यहाँ महेश्वर स्वयं आत्मकारक है: आत्मा का कारक ही मुक्ति का मार्गदर्शक भी, इसलिए आत्मकारक और मोक्ष के विषय साथ पढ़े जाते हैं।') : null, rule: T('Maheshwara: the lord of the 8th from the Atmakaraka; if that lord is in own or exaltation sign, the stronger of the 8th and 12th lords; with Rahu/Ketu involved, the 6th lord; Rahu/Ketu are replaced by Mercury/Jupiter.', 'महेश्वर: आत्मकारक से अष्टमेश; वह स्व/उच्च हो तो 8वें और 12वें स्वामियों में बलवान; राहु/केतु जुड़े हों तो षष्ठेश।') };
  }
  function bhavaArudhas(x, ref) {
    const out = {};
    for (let n = 1; n <= 12; n++) {
      const s = sgn(ref + n - 1), L = lordOf(x, s), ls = x.sign[L], d = house(s, ls);
      let a = sgn(ls + d - 1); let exc = false;
      if (a === s || a === sgn(s + 6)) { a = sgn(a + 9); exc = true; }
      out['A' + n] = { sign: a, lord: L, lordSign: ls, exception: exc };
    }
    return out;
  }
  function grahaArudhas(x) {
    const out = {};
    for (const id of PL9) {
      const h = x.sign[id], own = OWNS[id]; const S = own.length > 1 ? strongerRasi(x, own[0], own[1]) : own[0];
      let a = sgn(S + (S - h)); let exc = false; if (a === h || a === sgn(h + 6)) { a = sgn(a + 9); exc = true; }
      out[id] = { sign: a, ownSign: S, exception: exc };
    }
    return out;
  }
  // Argala on a sign: 2nd, 4th, 11th (primary) and 5th (secondary) cause argala; 12th, 10th, 3rd, 9th obstruct (virodhargala).
  // Malefics in the 3rd also give argala (Jaimini 1.1.8). Ketu counts in reverse (Ketu in the 12th acts on the 2nd, etc.).
  function argalaOn(x, ref) {
    const pos = (id, k) => (id === 'Ke' ? sgn(ref - (k - 1)) : sgn(ref + k - 1));
    const at = k => PL9.filter(id => x.sign[id] === pos(id, k));
    const list = [];
    for (const [k, ob, kind] of [[2, 12, 'primary'], [4, 10, 'primary'], [11, 3, 'primary'], [5, 9, 'secondary']]) {
      const a = at(k), v = at(ob); if (!a.length && !v.length) continue;
      let effective = a.length > v.length;
      if (a.length && a.length === v.length) effective = strongerRasi(x, sgn(ref + k - 1), sgn(ref + ob - 1)) === sgn(ref + k - 1);
      const benefic = a.length && a.every(id => BENEFICS.includes(id)), malefic = a.length && a.every(id => MALEFICS.includes(id));
      list.push({ from: k, kind, planets: a, obstructionFrom: ob, obstructers: v, effective: !!a.length && effective, nature: benefic ? 'shubha' : malefic ? 'papa' : 'mixed' });
    }
    const m3 = at(3).filter(id => MALEFICS.includes(id)); if (m3.length) list.push({ from: 3, kind: 'malefic_third', planets: m3, obstructionFrom: null, obstructers: [], effective: true, nature: 'papa' });
    return list;
  }
  function longevity(x) {
    const typ = s => isMov(s) ? 'movable' : isFix(s) ? 'fixed' : 'dual';
    const cls = (a, b) => { const k = [typ(a), typ(b)].sort().join('+'); return { 'movable+movable': 'purna', 'dual+fixed': 'purna', 'fixed+movable': 'madhya', 'dual+dual': 'madhya', 'dual+movable': 'alpa', 'fixed+fixed': 'alpa' }[k]; };
    const L1 = lordOf(x, x.ascS), L8 = lordOf(x, x.ascS + 7), hl = x.C.specialLagnas.hora.sign; // Scorpio/Aquarius: the stronger co-lord, as everywhere in Jaimini
    const pairs = [
      { id: 'lagna_8th_lord', signs: [x.sign[L1], x.sign[L8]], planets: [L1, L8] },
      { id: 'moon_saturn', signs: [x.sign.Mo, x.sign.Sa], planets: ['Mo', 'Sa'] },
      { id: 'lagna_hora_lagna', signs: [x.ascS, hl], planets: ['La', 'HL'] }];
    for (const p of pairs) { p.types = p.signs.map(typ); p.class = cls(p.signs[0], p.signs[1]); }
    const c = pairs.map(p => p.class), cnt = {}; c.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
    let result = Object.keys(cnt).find(k => cnt[k] >= 2), basis = 'majority';
    if (!result) { const moonKendra = [1, 7].includes(house(x.ascS, x.sign.Mo)); result = moonKendra ? c[1] : c[2]; basis = moonKendra ? 'moon_in_lagna_or_7th' : 'lagna_hora_lagna'; }
    const agree = cnt[result] || 1;
    // No span in years is computed or exported (ethics: the app never shows a lifespan).
    return { pairs, result, basis, agreement: agree,
      note: T('Jaimini three-pair method (Ayur khanda): movable+movable or fixed+dual = long (purna), movable+fixed or dual+dual = middle (madhya), movable+dual or fixed+fixed = short (alpa). Two or three agreeing pairs decide; if all differ, the lagna–hora lagna pair decides, or the Moon–Saturn pair when the Moon is in the lagna or 7th. Scorpio and Aquarius use the stronger co-lord for the lagna and 8th lords. A traditional framework only; never a prediction of death, and no span in years is given.',
        'जैमिनी त्रि-युग्म विधि (आयु खंड): चर+चर या स्थिर+द्विस्वभाव = पूर्ण, चर+स्थिर या द्वि+द्वि = मध्य, चर+द्वि या स्थिर+स्थिर = अल्प। केवल पारंपरिक ढाँचा; मृत्यु की भविष्यवाणी कभी नहीं।') };
  }
  const conjOrAsp = (x, a, b) => x.sign[a] === x.sign[b] ? 'conjunction' : (aspects(x.sign[a], x.sign[b]) && aspects(x.sign[b], x.sign[a])) ? 'aspect' : null;
  function jaiminiYogas(x, K, AL, UL, A7, KK, HL, GL) {
    const out = [], add = (id, present, planets, reasonEn, reasonHi, strength, extra) => out.push(Object.assign({ id, present: !!present, strength: present ? (strength || 'medium') : null, planets: planets || [], reason: T(reasonEn, reasonHi) }, extra || {}));
    const waxing = x.C.panchang.paksha === 'shukla', ben = id => id === 'Mo' ? waxing : ['Ju', 'Ve', 'Me'].includes(id), mal = id => !ben(id);
    for (const [id, a, b] of [['jy_ak_amk', 'AK', 'AmK'], ['jy_ak_pk', 'AK', 'PK'], ['jy_ak_dk', 'AK', 'DK'], ['jy_amk_pk', 'AmK', 'PK'], ['jy_amk_dk', 'AmK', 'DK'], ['jy_pk_dk', 'PK', 'DK'], ['jy_ak_bk', 'AK', 'BK']]) {
      const pa = K[a], pb = K[b]; if (!pa || !pb) { add(id, false, [], 'Karaka not available in this scheme', 'इस पद्धति में कारक उपलब्ध नहीं'); continue; }
      const how = conjOrAsp(x, pa, pb), d9 = x.d9[pa] === x.d9[pb];
      add(id, how, [pa, pb], a + ' (' + PN(pa).en + ') and ' + b + ' (' + PN(pb).en + ') ' + (how ? (how === 'conjunction' ? 'are conjoined' : 'aspect each other by rashi drishti') : 'are not linked') + (d9 ? '; also together in the navamsa' : ''),
        a + ' (' + PN(pa).hi + ') और ' + b + ' (' + PN(pb).hi + ') ' + (how ? (how === 'conjunction' ? 'युति में' : 'राशि दृष्टि से परस्पर दृष्ट') : 'संबंधित नहीं') + (d9 ? '; नवांश में भी साथ' : ''), how === 'conjunction' || d9 ? 'strong' : 'medium', { link: how, navamsaConjunction: d9 });
    }
    const lhg = PL9.filter(id => [x.ascS, HL, GL].every(s => x.sign[id] === s || aspects(x.sign[id], s)));
    add('jy_lagna_hora_ghati', lhg.length, lhg, lhg.length ? 'Lagna, hora lagna and ghatika lagna are all joined or aspected by ' + lhg.map(i => PN(i).en).join(', ') : 'No single planet joins or aspects lagna, hora lagna and ghatika lagna together',
      lhg.length ? 'लग्न, होरा लग्न और घटी लग्न तीनों ' + lhg.map(i => PN(i).hi).join(', ') + ' से युत/दृष्ट' : 'कोई एक ग्रह तीनों लग्नों को नहीं जोड़ता', 'strong');
    const inFrom = (r, hs) => PL9.filter(id => hs.includes(house(r, x.sign[id])));
    const b245 = inFrom(AL, [2, 4, 5]).filter(ben), m245 = inFrom(AL, [2, 4, 5]).filter(mal);
    add('jy_al_benefics_2_4_5', b245.length && !m245.length, b245, 'Benefics in the 2nd/4th/5th from the arudha lagna' + (m245.length ? ' but malefics there too' : ''), 'आरूढ़ लग्न से 2/4/5 में शुभ ग्रह' + (m245.length ? ' पर पाप ग्रह भी' : ''));
    const p11 = inFrom(AL, [11]), p12 = inFrom(AL, [12]);
    add('jy_al_11_gain', p11.length && p11.length >= p12.length, p11, p11.length + ' planet(s) in the 11th from AL and ' + p12.length + ' in the 12th: gains outweigh losses', 'AL से 11वें में ' + p11.length + ' और 12वें में ' + p12.length + ' ग्रह: लाभ अधिक');
    add('jy_al_12_clear', !p12.filter(mal).length, p12, p12.length ? '12th from AL holds only ' + p12.map(i => PN(i).en).join(', ') : '12th from AL is empty: expenses are kept in check', p12.length ? 'AL से 12वें में केवल ' + p12.map(i => PN(i).hi).join(', ') : 'AL से 12वाँ खाली: व्यय नियंत्रित');
    const hA7 = house(AL, A7), hUL = house(AL, UL);
    add('jy_al_a7_kendra', [1, 4, 7, 10, 5, 9].includes(hA7), [], 'A7 is in house ' + hA7 + ' from the arudha lagna', 'A7 आरूढ़ लग्न से ' + hA7 + 'वें भाव में', null, { house: hA7 });
    add('jy_al_ul_kendra', [1, 4, 7, 10, 5, 9].includes(hUL), [], 'Upapada is in house ' + hUL + ' from the arudha lagna', 'उपपद आरूढ़ लग्न से ' + hUL + 'वें भाव में', null, { house: hUL });
    const bk = inFrom(KK, [1, 4, 7, 10]).filter(ben);
    add('jy_karakamsa_benefic_kendra', bk.length, bk, 'Benefics in kendras from the karakamsa (in the rasi chart)', 'कारकांश से केंद्र में शुभ ग्रह');
    const ak = K.AK, akd9 = x.d9[ak];
    add('jy_ak_own_exalted_navamsa', (OWNS[ak] || []).includes(akd9) || isExalted(ak, akd9), [ak], 'Atmakaraka ' + PN(ak).en + ' is in ' + SN(akd9).en + ' in the navamsa', 'आत्मकारक ' + PN(ak).hi + ' नवांश में ' + SN(akd9).hi + ' में', 'strong');
    const arg = argalaOn(x, AL), sh = arg.filter(a => a.effective && a.nature === 'shubha');
    add('jy_al_shubha_argala', sh.length, [].concat(...sh.map(a => a.planets)), 'Unobstructed benefic argala on the arudha lagna from house(s) ' + sh.map(a => a.from).join(', '), 'आरूढ़ लग्न पर अबाधित शुभ अर्गला');
    const pk2 = inFrom(AL, [2]), pk12 = inFrom(AL, [12]), pkk = pk2.length && pk12.length && pk2.every(mal) && pk12.every(mal);
    add('jy_al_papa_kartari', pkk, pk2.concat(pk12), 'Malefics on both sides (2nd and 12th) of the arudha lagna', 'आरूढ़ लग्न के दोनों ओर (2 और 12) पाप ग्रह');
    const u2 = PL9.filter(id => x.sign[id] === sgn(UL + 1)), u2m = u2.filter(mal), u2b = u2.filter(ben);
    add('jy_ul_2nd_malefic', u2m.length && !u2b.length, u2m, 'Malefics (without benefics) in the 2nd from the upapada: traditionally a strain on marriage needing care', 'उपपद से दूसरे में (बिना शुभ के) पाप ग्रह: परंपरा में वैवाहिक तनाव का संकेत', 'medium');
    return out;
  }
  function jaiminiFull(C, opts) {
    opts = opts || {};
    const x = ctxOf(C), scheme = +opts.karakas === 7 ? 7 : +opts.karakas === 8 ? 8 : (C.jaimini.karakas.scheme || 8);
    const K = scheme === 7 ? C.jaimini.karakas.seven : C.jaimini.karakas.eight;
    const AK = K.AK, KK = x.d9[AK];
    const ar = bhavaArudhas(x, x.ascS), AL = ar.A1.sign, UL = ar.A12.sign, A7 = ar.A7.sign;
    const HL = C.specialLagnas.hora.sign, GL = C.specialLagnas.ghati.sign;
    const ishtaSign = sgn(KK + 11), ishtaPlanets = PL9.filter(id => x.d9[id] === ishtaSign);
    const kkRasi = PL9.filter(id => x.sign[id] === KK), kkNav = PL9.filter(id => x.d9[id] === KK && id !== AK);
    const argala = []; for (let h = 1; h <= 12; h++) { const s = sgn(x.ascS + h - 1); argala.push({ house: h, sign: s, argala: argalaOn(x, s) }); }
    const ul2 = sgn(UL + 1);
    const res = {
      karakas: { scheme, list: K, seven: C.jaimini.karakas.seven, eight: C.jaimini.karakas.eight, atmakaraka: AK, amatyakaraka: K.AmK, readingIds: { atmakaraka: 'ak_' + AK } },
      karakamsa: { sign: KK, readingId: 'karakamsa_' + SIGN_KEYS[KK], planetsInRasi: kkRasi, planetsInNavamsa: kkNav, planetReadingIds: [...new Set(kkRasi.concat(kkNav))].map(id => 'kk_planet_' + id),
        note: T('Karakamsa = navamsa sign of the Atmakaraka. Planets in that sign in the rasi chart and (swamsa) in the navamsa chart are read together.', 'कारकांश = आत्मकारक की नवांश राशि; राशि कुंडली और नवांश (स्वांश) दोनों में उस राशि के ग्रह देखे जाते हैं।') },
      swamsa: { sign: KK, planets: kkNav },
      ishtaDevata: { sign: ishtaSign, planets: ishtaPlanets, lord: SIGN_LORD[ishtaSign], planet: ishtaPlanets.length ? ishtaPlanets.reduce((a, b) => strongerPlanet(x, a, b)) : SIGN_LORD[ishtaSign],
        readingId: 'ishta_' + (ishtaPlanets.length ? ishtaPlanets.reduce((a, b) => strongerPlanet(x, a, b)) : SIGN_LORD[ishtaSign]), rule: T('12th from the karakamsa in the navamsa: planets there (else its lord) show the ishta devata.', 'नवांश में कारकांश से 12वाँ: वहाँ के ग्रह (अन्यथा स्वामी) इष्ट देवता।') },
      arudhas: ar, arudhaLagna: AL, upapada: { sign: UL, lord: lordOf(x, UL), planets: x.occ[UL].slice(), second: { sign: ul2, lord: lordOf(x, ul2), planets: x.occ[ul2].slice() } },
      grahaArudhas: grahaArudhas(x), rashiDrishti: RD.map(a => a.slice()), argala, argalaOnAL: argalaOn(x, AL),
      sthiraKarakas: { father: strongerPlanet(x, 'Su', 'Ve'), mother: strongerPlanet(x, 'Mo', 'Ma'), siblings: 'Ma', relatives: 'Me', children: 'Ju', spouse: 'Ve', longevity: 'Sa' },
      brahma: brahmaOf(x, opts.brahma), rudra: rudraOf(x), maheshwara: maheshwaraOf(x, AK), longevity: longevity(x),
      horaLagna: HL, ghatiLagna: GL,
      notes: T('Strength comparisons follow Jagannatha Hora\'s order (number of planets, Mercury/Jupiter/lord association, exalted planet, lord in a sign of opposite oddity, dual>fixed>movable, lord\'s degree). Scorpio and Aquarius use the stronger co-lord. Arudha exceptions: a pada in the sign itself or the 7th moves to the 10th from it.', 'बल तुलना जगन्नाथ होरा के क्रम से। वृश्चिक और कुंभ में बलवान सह-स्वामी। आरूढ़ अपवाद: पद स्वयं या सातवें में पड़े तो उससे दसवाँ।')
    };
    res.yogas = jaiminiYogas(x, K, AL, UL, A7, KK, HL, GL);
    return res;
  }

  /* ==================================================================
     5. KP (Krishnamurti Paddhati)
     ================================================================== */
  const pad2 = n => String(n).padStart(2, '0');
  // Build a chart input for a moment (JD UT or Date or omitted = now) at a place, using JE.timeRules for the local offset.
  function momentInput(place, when, name) {
    let jd;
    if (when === undefined || when === null) jd = Date.now() / 86400000 + 2440587.5;
    else if (typeof when === 'number') jd = when;
    else if (when instanceof Date) jd = when.getTime() / 86400000 + 2440587.5;
    else if (typeof when === 'object' && when.date) return Object.assign({ name: name || '', place }, when, { place: when.place || place });
    const c0 = JE.calFromJd(jd), d0 = c0.y + '-' + pad2(c0.m) + '-' + pad2(c0.d);
    const tr = JE.timeRules(d0, place), off = (typeof place.tz === 'number') ? place.tz : tr.offset;
    const c = JE.calFromJd(jd + off / 24);
    return { name: name || '', date: c.y + '-' + pad2(c.m) + '-' + pad2(c.d), time: pad2(c.h) + ':' + pad2(c.mi) + ':' + pad2(Math.min(59, Math.round(c.s || 0))), place: Object.assign({}, place, { tz: off }), _jd: jd };
  }
  /* KP event rules: THE single source of the house sets (JE.kpEventRules; content3.js keys its texts to these ids and reads the
     houses from here). Classical KP sets (KP Readers IV-VI): the negating houses are the 12th from the favourable ones (a house
     is "lost" by the house before it), except the houses listed in `extraNeg`, which the KP Readers name explicitly (for divorce,
     2 and 7 are simply the marriage houses that hold the bond together).
     kind 'promise': verdict promised | mixed | denied.  kind 'sensitive' (divorce, disease): never called "promised"; the verdict is
     tendency_noted | not_indicated (| not_applicable for divorce when marriage itself is not promised). */
  const KP_EVENTS = {
    kp_marriage: { cusp: 7, fav: [2, 7, 11], neg: [1, 6, 10], kind: 'promise' },
    kp_divorce: { cusp: 7, fav: [1, 6, 10, 12], neg: [2, 7, 11], extraNeg: [2, 7], kind: 'sensitive', requires: 'kp_marriage', needAll: [1, 6, 10, 12] },
    kp_love: { cusp: 5, fav: [5, 7, 11], neg: [4, 6, 10], kind: 'promise' },
    kp_child: { cusp: 5, fav: [2, 5, 11], neg: [1, 4, 10], kind: 'promise' },
    kp_education: { cusp: 4, fav: [4, 9, 11], neg: [3, 8, 10], kind: 'promise' },
    kp_higher_education: { cusp: 9, fav: [4, 9, 11], neg: [3, 8, 10], kind: 'promise' },
    kp_job: { cusp: 10, fav: [2, 6, 10, 11], neg: [1, 5, 9], kind: 'promise' },
    kp_promotion: { cusp: 10, fav: [2, 6, 10, 11], neg: [1, 5, 9], kind: 'promise' },
    kp_transfer: { cusp: 10, fav: [3, 10, 12], neg: [2, 9, 11, 4], extraNeg: [4], kind: 'promise' },
    kp_business: { cusp: 7, fav: [2, 7, 10, 11], neg: [1, 6, 9], kind: 'promise' },
    kp_income_gain: { cusp: 11, fav: [2, 6, 11], neg: [1, 5, 10], kind: 'promise' },
    kp_foreign_travel: { cusp: 12, fav: [3, 9, 12], neg: [2, 8, 11, 4], extraNeg: [4], kind: 'promise' },
    kp_foreign_settlement: { cusp: 12, fav: [3, 9, 12], neg: [2, 8, 11, 4], extraNeg: [4], kind: 'promise' },
    kp_property: { cusp: 4, fav: [4, 11, 12], neg: [3, 10], kind: 'promise' },
    kp_vehicle: { cusp: 4, fav: [4, 11], neg: [3, 10], kind: 'promise' },
    kp_health_disease: { cusp: 6, fav: [1, 6, 8, 12], neg: [5, 11], kind: 'sensitive', minHits: 3 },
    kp_recovery: { cusp: 1, fav: [1, 5, 11], neg: [12, 6, 8], extraNeg: [6, 8], kind: 'promise' },
    kp_litigation_win: { cusp: 6, fav: [1, 6, 11], neg: [5, 12, 7], extraNeg: [7], kind: 'promise' },
    kp_loan: { cusp: 6, fav: [2, 6, 11], neg: [1, 5, 10], kind: 'promise' },
    kp_debt_repayment: { cusp: 6, fav: [5, 12], neg: [4, 11, 2, 6], extraNeg: [2, 6], kind: 'promise' }
  };
  for (const k in KP_EVENTS) KP_EVENTS[k].neg.sort((a, b) => a - b);
  const kpEventRulesPublic = () => { const o = {}; for (const k in KP_EVENTS) { const e = KP_EVENTS[k]; o[k] = Object.freeze({ id: k, cusp: e.cusp, fav: Object.freeze(e.fav.slice()), neg: Object.freeze(e.neg.slice()), extraNeg: Object.freeze((e.extraNeg || []).slice()), kind: e.kind, requires: e.requires || null, needAll: e.needAll ? Object.freeze(e.needAll.slice()) : null, minHits: e.minHits || 1 }); } return Object.freeze(o); };
  const KP_VERDICTS = { promise: ['promised', 'mixed', 'denied'], sensitive: ['tendency_noted', 'not_indicated', 'not_applicable'] };
  function kpFromChart(K, opts) {
    const cusps = K.houses.map(h => h.cusp), lonOf = {}; for (const p of K.planets) lonOf[p.id] = p.lon;
    const houseOf = L => { for (let i = 0; i < 12; i++) { const a = cusps[i], b = cusps[(i + 1) % 12]; if (norm(L - a) < norm(b - a)) return i + 1; } return 1; };
    const ids = PL9, star = {}, sub = {}, ss = {}, hIn = {};
    for (const id of ids) { const s = JE.subLords(lonOf[id]); star[id] = s.nakLord; sub[id] = s.subLord; ss[id] = s.subSubLord; hIn[id] = houseOf(lonOf[id]); }
    const owns = {}; for (const id of ids) owns[id] = [];
    const cuspTab = cusps.map((c, i) => { const s = JE.subLords(c), sg = signOf(c); owns[SIGN_LORD[sg]].push(i + 1); return { house: i + 1, cusp: c, sign: sg, deg: degIn(c), signLord: SIGN_LORD[sg], starLord: s.nakLord, subLord: s.subLord, subSubLord: s.subSubLord, nakshatra: s.nak }; });
    // intercepted sign lords (KP: secondary owners)
    for (let i = 0; i < 12; i++) { const a = cusps[i], b = cusps[(i + 1) % 12], span = norm(b - a); for (let s = 0; s < 12; s++) { const st = s * 30; if (norm(st - a) > 0 && norm(st - a) < span && norm(st + 30 - a) <= span) cuspTab[i].intercepted = (cuspTab[i].intercepted || []).concat([s]); } }
    const occupants = h => ids.filter(id => hIn[id] === h);
    const inStarOf = list => ids.filter(id => list.includes(star[id]));
    const houses = cuspTab.map(c => { const occ = occupants(c.house), own = [c.signLord]; return { house: c.house, A: inStarOf(occ), B: occ, C: inStarOf(own), D: own }; });
    // node agency: Rahu/Ketu also give the results of their sign lord and of planets conjoined in the same sign
    const agentOf = { Ra: [SIGN_LORD[signOf(lonOf.Ra)]].concat(PL7.filter(p => signOf(lonOf[p]) === signOf(lonOf.Ra))), Ke: [SIGN_LORD[signOf(lonOf.Ke)]].concat(PL7.filter(p => signOf(lonOf[p]) === signOf(lonOf.Ke))) };
    const planets = ids.map(id => {
      const sl = star[id], lv = { A: [hIn[sl]], B: [hIn[id]], C: owns[sl].slice(), D: owns[id].slice() };
      if (agentOf[id]) lv.agent = [...new Set([].concat(...agentOf[id].map(a => [hIn[a]].concat(owns[a]))))].sort((p, q) => p - q);
      const all = [...new Set([].concat(lv.A, lv.B, lv.C, lv.D, lv.agent || []))].sort((p, q) => p - q);
      return { id, lon: lonOf[id], sign: signOf(lonOf[id]), house: hIn[id], starLord: sl, subLord: sub[id], subSubLord: ss[id], owns: owns[id], levels: lv, signifies: all, agentOf: agentOf[id] || null };
    });
    const sigOf = id => planets.find(p => p.id === id);
    const evById = {};
    const events = Object.keys(KP_EVENTS).map(evId => {
      const ev = KP_EVENTS[evId], c = cuspTab[ev.cusp - 1], csl = c.subLord, P = sigOf(csl), SL = sigOf(P.starLord);
      const primary = [...new Set([].concat(SL.levels.A, SL.levels.B, SL.levels.C, SL.levels.D, P.levels.agent || []))].sort((a, b) => a - b);
      const fh = ev.fav.filter(h => primary.includes(h)), nh = ev.neg.filter(h => primary.includes(h));
      const own = P.signifies, fo = ev.fav.filter(h => own.includes(h));
      let verdict;
      if (ev.kind === 'sensitive') {
        // never "promised": a gentle tendency only, and divorce only where marriage itself is promised and 1, 6, 10 and 12 are all signified
        if (ev.requires && evById[ev.requires] && evById[ev.requires].verdict !== 'promised') verdict = 'not_applicable';
        else if (ev.needAll) verdict = ev.needAll.every(h => primary.includes(h)) ? 'tendency_noted' : 'not_indicated';
        else verdict = fh.length >= (ev.minHits || 1) && fh.length > nh.length ? 'tendency_noted' : 'not_indicated';
      } else verdict = fh.length && fh.length >= nh.length ? 'promised' : fh.length || fo.length ? 'mixed' : 'denied';
      const base = 'Cusp ' + ev.cusp + ' sub-lord ' + PN(csl).en + ' (star lord ' + PN(P.starLord).en + ') signifies houses ' + primary.join(', ') + '; ' + (ev.kind === 'sensitive' ? 'houses read for this theme ' : 'needed ') + ev.fav.join('/') + ', against ' + ev.neg.join('/') + '.';
      const baseHi = ev.cusp + 'वें भाव का उप-स्वामी ' + PN(csl).hi + ' (नक्षत्र स्वामी ' + PN(P.starLord).hi + ') भाव ' + primary.join(', ') + ' का कारक; ' + (ev.kind === 'sensitive' ? 'इस विषय के भाव ' : 'आवश्यक ') + ev.fav.join('/') + ', विरोधी ' + ev.neg.join('/') + '।';
      const extra = verdict === 'not_applicable' ? T(' Not read, because the 7th cusp does not indicate marriage itself.', ' नहीं पढ़ा गया, क्योंकि सप्तम भाव से विवाह का ही संकेत नहीं है।')
        : verdict === 'tendency_noted' ? T(' A traditional tendency is noted for reflection only; it is not a prediction, and care, communication and professional help shape real outcomes.', ' केवल विचार के लिए एक पारंपरिक प्रवृत्ति दिखती है; यह भविष्यवाणी नहीं है, वास्तविक परिणाम देखभाल, संवाद और विशेषज्ञ सहायता से बनते हैं।')
          : verdict === 'not_indicated' ? T(' No such tendency is indicated.', ' ऐसी कोई प्रवृत्ति नहीं दिखती।') : null;
      const out = { id: evId, kind: ev.kind, cusp: ev.cusp, cuspalSubLord: csl, starLordOfCsl: P.starLord, favourable: ev.fav.slice(), negating: ev.neg.slice(), starLordSignifies: primary, cslSignifies: own, favourableHits: fh, negatingHits: nh, verdict,
        text: T(base + (extra ? extra.en : ''), baseHi + (extra ? extra.hi : '')) };
      if (ev.needAll) out.needAll = ev.needAll.slice();
      evById[evId] = out;
      return out;
    });
    return { cusps: cuspTab, planets, houses, events, houseSystemUsed: K.meta.houseSystemUsed, ayanamsa: K.meta.ayanamsaId, ayanamsaValue: K.meta.ayanamsaValue, warnings: K.meta.warnings,
      note: T('KP: Placidus cusps (Porphyry fallback where Placidus is undefined, above about 66° latitude), KP ayanamsa (new VP291 by default). Significators in 4 steps: A planets in the star of occupants, B occupants, C planets in the star of the owner, D owner. A planet signifies the houses occupied and owned by its star lord (stronger) and by itself; Rahu/Ketu also act for their sign lord and conjoined planets. Event promise: the cusp\'s sub-lord, judged through its star lord.',
        'केपी: प्लेसिडस भाव (उच्च अक्षांश पर पोर्फिरी), केपी अयनांश। कारक 4 चरणों में: A अधिवासियों के नक्षत्र में ग्रह, B अधिवासी, C स्वामी के नक्षत्र में ग्रह, D स्वामी। घटना का वादा भाव के उप-स्वामी से, उसके नक्षत्र स्वामी द्वारा।') };
  }
  function kp(input, opts) {
    opts = opts || {};
    const ay = opts.ayanamsa || 'kp_new';
    const inp = input && input.meta && input.planets ? input.meta.input : input;
    const K = JE.chart(inp, Object.assign({}, input && input.meta ? { tzMode: input.meta.utcOffsetUsed } : {}, { ayanamsa: ay, houses: 'placidus', node: opts.node || 'mean', dashaLevels: 2 }));
    const out = kpFromChart(K, opts);
    out.rulingPlanets = rulingPlanetsAt(K.meta.jdUT, inp.place, Object.assign({}, opts, { ayanamsa: ay, offset: K.meta.utcOffsetUsed }));
    out.chart = K; Object.defineProperty(out, 'chart', { enumerable: false });
    return out;
  }
  function rulingPlanetsAt(jdUT, place, opts) {
    opts = opts || {};
    const ay = opts.ayanamsa || 'kp_new', lat = +place.lat, lon = +place.lon;
    const off = opts.offset !== undefined ? opts.offset : (typeof place.tz === 'number' ? place.tz : JE.timeRules(JE.isoLocal(jdUT, 5.5).slice(0, 10), place).offset);
    const asc = JE.ascSid(jdUT, lat, lon, ay), ps = JE.positionsAt(jdUT, ay, opts.node || 'mean', ['Mo', 'Ra']), mo = ps.pos.Mo.lon, ra = ps.pos.Ra.lon, ke = norm(ra + 180);
    const la = JE.subLords(asc), ml = JE.subLords(mo), pc = JE.panchangAt(jdUT, off, lat, lon, ay === 'tropical' ? 'lahiri' : ay);
    const list = [
      { id: 'rp_lagna_star_lord', planet: la.nakLord }, { id: 'rp_lagna_sign_lord', planet: SIGN_LORD[signOf(asc)] },
      { id: 'rp_moon_star_lord', planet: ml.nakLord }, { id: 'rp_moon_sign_lord', planet: SIGN_LORD[signOf(mo)] },
      { id: 'rp_day_lord', planet: pc.vara.lord }, { id: 'rp_lagna_sub_lord', planet: la.subLord, optional: true }, { id: 'rp_moon_sub_lord', planet: ml.subLord, optional: true }];
    const core = list.filter(e => !e.optional).map(e => e.planet), set = new Set(core);
    const nodes = [];
    for (const [id, L] of [['Ra', ra], ['Ke', ke]]) {
      const sl = SIGN_LORD[signOf(L)], st = JE.subLords(L).nakLord;
      const why = []; if (set.has(sl)) why.push('sign_of_rp'); if (set.has(st)) why.push('star_of_rp');
      if (why.length) nodes.push({ id: 'rp_node_agency', planet: id, why, representing: [...new Set([sl, st].filter(p => set.has(p)))] });
    }
    const combined = [...new Set(nodes.map(n => n.planet).concat(core))];
    return { jdUT, iso: JE.isoLocal(jdUT, off), ascendant: { lon: asc, sign: signOf(asc), starLord: la.nakLord, subLord: la.subLord }, moon: { lon: mo, sign: signOf(mo), starLord: ml.nakLord, subLord: ml.subLord },
      dayLord: pc.vara.lord, list, nodes, combined, ayanamsa: ay,
      note: T('Ruling planets (strength order): lagna star lord, lagna sign lord, Moon star lord, Moon sign lord, day lord (Hindu day from sunrise); sub lords listed as optional. Rahu/Ketu join (and rank first) when they sit in a sign or star of a ruling planet.', 'शासक ग्रह (बल क्रम): लग्न नक्षत्र स्वामी, लग्न राशि स्वामी, चंद्र नक्षत्र स्वामी, चंद्र राशि स्वामी, वार स्वामी; राहु/केतु शासक ग्रह की राशि/नक्षत्र में हों तो शामिल।') };
  }
  // KP horary: 249 parts = the 243 sub divisions of the zodiac, with the 6 subs that cross a sign boundary split in two.
  const KP249 = (() => {
    const out = []; let start = 0;
    for (let n = 0; n < 27; n++) {
      const i0 = n % 9; let acc = n * NAK;
      for (let i = 0; i < 9; i++) {
        const L = DASHA_ORDER[(i0 + i) % 9], w = NAK * VIM_YEARS[L] / 120, a = acc, b = acc + w;
        const bound = Math.ceil((a + 1e-9) / 30) * 30;
        if (bound < b - 1e-9) { out.push({ start: a, end: bound, star: DASHA_ORDER[i0], sub: L }); out.push({ start: bound, end: b, star: DASHA_ORDER[i0], sub: L }); }
        else out.push({ start: a, end: b, star: DASHA_ORDER[i0], sub: L });
        acc = b;
      }
    }
    return out.map((e, i) => Object.assign(e, { number: i + 1, sign: signOf(e.start + 1e-9) }));
  })();
  function kpHorary(number, moment, opts) {
    opts = opts || {}; number = Math.round(+number);
    if (!(number >= 1 && number <= 249)) throw new Error('KP horary number must be 1-249');
    const seg = KP249[number - 1], place = (moment && moment.place) || opts.place;
    const inp = momentInput(place, moment && moment.date ? moment : (moment && moment.jd) || (opts.jd), 'KP horary ' + number);
    const ay = opts.ayanamsa || 'kp_new';
    const Q = JE.chart(inp, { ayanamsa: ay, houses: 'placidus', node: opts.node || 'mean', dashaLevels: 2, tzMode: inp.place.tz });
    // find the moment (within ±12 h of the question) when the KP ascendant is at the start of the chosen part; cusps from that moment
    const target = seg.start + 1e-6, lat = +place.lat, lon = +place.lon; let t = Q.meta.jdUT;
    for (let i = 0; i < 30; i++) { const d = nrm180(target - JE.ascSid(t, lat, lon, ay)); if (Math.abs(d) < 1e-7) break; t += d / 361; }
    while (t - Q.meta.jdUT > 0.5) t -= 0.99727; while (Q.meta.jdUT - t > 0.5) t += 0.99727;
    const H = momentInput(Object.assign({}, inp.place), t);
    const HC = JE.chart(H, { ayanamsa: ay, houses: 'placidus', node: opts.node || 'mean', dashaLevels: 2, tzMode: inp.place.tz });
    // planets from the question moment, cusps from the horary ascendant
    const merged = Object.assign({}, HC, { planets: Q.planets, meta: Object.assign({}, HC.meta, { input: Q.meta.input, jdUT: Q.meta.jdUT }) });
    const out = kpFromChart(merged, opts);
    out.number = number; out.part = seg; out.horaryAscendant = HC.houses[0].cusp; out.questionMoment = { jdUT: Q.meta.jdUT, iso: Q.meta.localISO };
    out.rulingPlanets = rulingPlanetsAt(Q.meta.jdUT, place, { ayanamsa: ay, offset: Q.meta.utcOffsetUsed });
    out.note = T('KP horary: the number (1-249) fixes the ascendant at the start of that sub; cusps are Placidus for the moment that ascendant rises on the question day, planets are for the moment of the question.', 'केपी प्रश्न: संख्या (1-249) से लग्न उस उप-भाग के आरंभ पर; भाव उस क्षण के प्लेसिडस, ग्रह प्रश्न के क्षण के।');
    return out;
  }

  /* ==================================================================
     6. Varshaphal / Tajika (Tajika Neelakanthi as implemented in JH/PyJHora, classical corrections documented)
     ================================================================== */
  function sunSid(jd, ay) { return JE.positionsAt(jd, ay, 'mean', ['Su']).pos.Su.lon; }
  function solarReturn(target, jdGuess, ay) {
    let t = jdGuess;
    for (let i = 0; i < 20; i++) { const d = nrm180(target - sunSid(t, ay)); t += d / 0.98565; if (Math.abs(d) < 1e-8) break; }
    return t;
  }
  const TRI_DAY = ['Su', 'Ve', 'Sa', 'Ve', 'Ju', 'Mo', 'Me', 'Ma', 'Sa', 'Ma', 'Ju', 'Mo'], TRI_NIGHT = ['Ju', 'Mo', 'Me', 'Ma', 'Su', 'Ve', 'Sa', 'Ve', 'Sa', 'Ma', 'Ju', 'Mo'];
  const DEEPTAMSHA = { Su: 15, Mo: 12, Ma: 8, Me: 7, Ju: 9, Ve: 7, Sa: 9 };
  const SPEED_ORDER = ['Mo', 'Me', 'Ve', 'Su', 'Ma', 'Ju', 'Sa']; // fastest first (mean motion)
  const EXALT_LON = { Su: 10, Mo: 33, Ma: 298, Me: 165, Ju: 95, Ve: 357, Sa: 200 };
  // Tajika hadda (Egyptian terms): per sign [lord, upto-degree]
  const HADDA = [[['Ju', 6], ['Ve', 12], ['Me', 20], ['Ma', 25], ['Sa', 30]], [['Ve', 8], ['Me', 14], ['Ju', 22], ['Sa', 27], ['Ma', 30]], [['Me', 6], ['Ju', 12], ['Ve', 17], ['Ma', 24], ['Sa', 30]],
    [['Ma', 7], ['Ve', 13], ['Me', 19], ['Ju', 26], ['Sa', 30]], [['Ju', 6], ['Ve', 11], ['Sa', 18], ['Me', 24], ['Ma', 30]], [['Me', 7], ['Ve', 17], ['Ju', 21], ['Ma', 28], ['Sa', 30]],
    [['Sa', 6], ['Me', 14], ['Ju', 21], ['Ve', 28], ['Ma', 30]], [['Ma', 7], ['Ve', 11], ['Me', 19], ['Ju', 24], ['Sa', 30]], [['Ju', 12], ['Ve', 17], ['Me', 21], ['Sa', 26], ['Ma', 30]],
    [['Me', 7], ['Ju', 14], ['Ve', 22], ['Sa', 26], ['Ma', 30]], [['Me', 7], ['Ve', 13], ['Ju', 20], ['Ma', 25], ['Sa', 30]], [['Ve', 12], ['Ju', 16], ['Me', 19], ['Ma', 28], ['Sa', 30]]];
  const haddaLord = lon => { const s = signOf(lon), d = degIn(lon); for (const [L, u] of HADDA[s]) if (d < u) return L; return HADDA[s][4][0]; };
  const rel = (p, L) => p === L ? 'own' : NATREL[p].f.includes(L) ? 'friend' : NATREL[p].e.includes(L) ? 'enemy' : 'neutral';
  // Pancha-vargiya bala (Tajika Neelakanthi; PVR/JH scale): each varga scores own (or exalted, for the sign) = full, friend = 3/4,
  // neutral = 1/2, enemy = 1/4 of its maximum (kshetra 30 / 22.5 / 15 / 7.5, hadda 15 / 11.25 / 7.5 / 3.75, drekkana 10 / 7.5 / 5 / 2.5,
  // navamsa 5 / 3.75 / 2.5 / 1.25) - strictly monotonic. (Phase 3 had neutral 0 < enemy 1/4, a scale inversion PyJHora shares.)
  // Debilitation is not zeroed separately: the Uchcha part already measures it.
  const PVB_SHARE = { own: 1, friend: 0.75, neutral: 0.5, enemy: 0.25 };
  function panchaVargiya(lon, id) {
    const s = signOf(lon), r1 = (isExalted(id, s) || OWNS[id].includes(s)) ? 'own' : rel(id, SIGN_LORD[s]);
    const val = (r, full) => full * PVB_SHARE[r];
    const kshetra = val(r1, 30);
    const dist = Math.abs(nrm180(lon - norm(EXALT_LON[id] + 180))), uchcha = dist / 9;
    const hadda = val(rel(id, haddaLord(lon)), 15);
    const d3 = JE.vargaSign(lon, 3), drek = val(OWNS[id].includes(d3) ? 'own' : rel(id, SIGN_LORD[d3]), 10);
    const d9 = JE.vargaSign(lon, 9), nav = val(OWNS[id].includes(d9) ? 'own' : rel(id, SIGN_LORD[d9]), 5);
    const total = (kshetra + uchcha + hadda + drek + nav) / 4;
    return { kshetra, uchcha: r2(uchcha), hadda, drekkana: drek, navamsa: nav, total: r2(total), grade: total >= 15 ? 'strong' : total >= 10 ? 'medium' : total >= 5 ? 'weak' : 'very_weak' };
  }
  const HARSHA_HOUSE = { Su: 9, Mo: 3, Ma: 6, Me: 1, Ju: 11, Ve: 5, Sa: 12 };
  // Harsha bala (Tajika Neelakanthi as given by PVR and JH/PyJHora): (1) joy house, (2) own or exaltation sign, (3) stree-purusha:
  // a feminine planet in houses 1-3 or 7-9, a masculine planet in houses 4-6 or 10-12 (houses from the annual lagna, not signs),
  // (4) a masculine planet in a day year, a feminine one in a night year; 5 points each.
  // Masculine: Sun, Mars, Jupiter. Feminine: Moon, Venus, Saturn and, by default, Mercury (JH/PyJHora count the neuter Mercury with the
  // feminine group); opts.harshaMercury: 'masculine' moves it, 'neutral' leaves it out of tests 3 and 4.
  const HARSHA_FEM_HOUSES = [1, 2, 3, 7, 8, 9], HARSHA_MASC_HOUSES = [4, 5, 6, 10, 11, 12];
  function harshaBala(V, id, day, mercury) {
    const mer = mercury === 'masculine' || mercury === 'neutral' ? mercury : 'feminine';
    const h = house(V.ascS, V.sign[id]), male = ['Su', 'Ma', 'Ju'].includes(id) || (id === 'Me' && mer === 'masculine'), female = ['Mo', 'Ve', 'Sa'].includes(id) || (id === 'Me' && mer === 'feminine');
    const a = HARSHA_HOUSE[id] === h ? 5 : 0, b = (OWNS[id].includes(V.sign[id]) || isExalted(id, V.sign[id])) ? 5 : 0;
    const c = (female && HARSHA_FEM_HOUSES.includes(h)) || (male && HARSHA_MASC_HOUSES.includes(h)) ? 5 : 0;
    const d = (day && male) || (!day && female) ? 5 : 0;
    return { sthana: a, swochcha: b, strePurusha: c, dinaRatri: d, total: a + b + c + d, gender: male ? 'masculine' : female ? 'feminine' : 'neutral', house: h };
  }
  const TAJ_ASPECT = k => ({ 1: 'tajika_pratyaksha_shatru', 7: 'tajika_pratyaksha_shatru', 4: 'tajika_gupta_shatru', 10: 'tajika_gupta_shatru', 5: 'tajika_pratyaksha_mitra', 9: 'tajika_pratyaksha_mitra', 3: 'tajika_gupta_mitra', 11: 'tajika_gupta_mitra' })[k] || 'tajika_neutral';
  function tajikaPair(V, a, b) {
    const k = house(V.sign[a], V.sign[b]), type = TAJ_ASPECT(k), aspect = type !== 'tajika_neutral';
    const fast = SPEED_ORDER.indexOf(a) < SPEED_ORDER.indexOf(b) ? a : b, slow = fast === a ? b : a;
    const dd = degIn(V.lon[slow]) - degIn(V.lon[fast]), orb = (DEEPTAMSHA[a] + DEEPTAMSHA[b]) / 2;
    const closing = Math.sign(dd || 1) * (V.speed[fast] - V.speed[slow]) > 0;
    const within = Math.abs(dd) <= orb;
    return { a, b, houseDistance: k, aspectType: type, aspect, fast, slow, gap: r2(dd), orb, within, applying: aspect && within && closing && Math.abs(dd) > 1e-6, separating: aspect && within && !closing };
  }
  function tajikaYogas(V, opts) {
    const P = PL7, pairs = [], yogas = [], add = (id, planets, detail, en, hi) => yogas.push({ id, planets, detail: detail || null, text: T(en, hi) });
    for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) pairs.push(tajikaPair(V, P[i], P[j]));
    const pr = (a, b) => pairs.find(p => (p.a === a && p.b === b) || (p.a === b && p.b === a));
    const H = id => house(V.ascS, V.sign[id]);
    if (P.every(id => [1, 2, 4, 5, 7, 8, 10, 11].includes(H(id)))) add('ikkabala', P.slice(), null, 'All seven planets in kendras and panapharas: Ikkabala, a strong, supportive year.', 'सातों ग्रह केंद्र और पणफर में: इक्कबाल योग।');
    if (P.every(id => [3, 6, 9, 12].includes(H(id)))) add('induvara', P.slice(), null, 'All seven planets in apoklimas: Induvara, a year needing patience.', 'सातों ग्रह आपोक्लिम में: इंदुवार योग।');
    const ith = pairs.filter(p => p.applying), esa = pairs.filter(p => p.separating);
    for (const p of ith) add('ithasala', [p.fast, p.slow], { kind: Math.abs(p.gap) <= 1 ? 'poorna' : 'vartamana', gap: p.gap, orb: p.orb, aspectType: p.aspectType }, PN(p.fast).en + ' applies to ' + PN(p.slow).en + ' within orb (' + Math.abs(p.gap).toFixed(1) + '° of ' + p.orb + '°): Ithasala.', PN(p.fast).hi + ' का ' + PN(p.slow).hi + ' से इत्थशाल।');
    for (const p of esa) add('easarapha', [p.fast, p.slow], { gap: p.gap, orb: p.orb }, PN(p.fast).en + ' has passed ' + PN(p.slow).en + ' (separating within orb): Easarapha.', PN(p.fast).hi + ' और ' + PN(p.slow).hi + ' में ईसराफ (वियोग)।');
    const ithWith = (a, b) => { const p = pr(a, b); return p && p.applying; };
    const inOrb = (a, b) => { const p = pr(a, b); return p && p.aspect && p.within; };
    const faster = (a, b) => SPEED_ORDER.indexOf(a) < SPEED_ORDER.indexOf(b);
    for (const p of pairs) if (!p.aspect) {
      for (const t of P) if (t !== p.a && t !== p.b) {
        if (faster(t, p.a) && faster(t, p.b) && inOrb(t, p.a) && inOrb(t, p.b)) add('nakta', [p.a, p.b, t], { carrier: t }, PN(t).en + ', faster than both, links ' + PN(p.a).en + ' and ' + PN(p.b).en + ' who do not aspect each other: Nakta (transfer of light).', PN(t).hi + ' द्वारा ' + PN(p.a).hi + ' और ' + PN(p.b).hi + ' का नक्त योग।');
        if (faster(p.a, t) && faster(p.b, t) && ithWith(p.a, t) && ithWith(p.b, t)) add('yamaya', [p.a, p.b, t], { collector: t }, PN(t).en + ', slower than both, receives Ithasala from ' + PN(p.a).en + ' and ' + PN(p.b).en + ': Yamaya (collection of light).', PN(t).hi + ' द्वारा यमया योग।');
      }
    }
    const strongD = id => isExalted(id, V.sign[id]) || OWNS[id].includes(V.sign[id]) || MTS[id] === V.sign[id];
    const weakD = id => isDebil(id, V.sign[id]) || V.combust[id] || rel(id, SIGN_LORD[V.sign[id]]) === 'enemy';
    const moonIth = p => p.fast !== 'Mo' && p.slow !== 'Mo' && (ithWith('Mo', p.fast) || ithWith('Mo', p.slow));
    for (const p of ith) {
      for (const m of ['Ma', 'Sa']) if (m !== p.fast && m !== p.slow) { const q = pr(m, p.fast); if (q && q.within && ['tajika_pratyaksha_shatru', 'tajika_gupta_shatru'].includes(q.aspectType)) add('manau', [p.fast, p.slow, m], { obstructer: m }, PN(m).en + ' casts an inimical aspect within orb on ' + PN(p.fast).en + ', obstructing its Ithasala with ' + PN(p.slow).en + ': Manau.', PN(m).hi + ' द्वारा मणऊ योग (बाधा)।'); }
      if (p.fast !== 'Mo' && p.slow !== 'Mo') {
        if (moonIth(p)) add('kamboola', [p.fast, p.slow, 'Mo'], null, 'The Moon joins the Ithasala of ' + PN(p.fast).en + ' and ' + PN(p.slow).en + ': Kamboola, the matter is strengthened.', 'चंद्रमा ' + PN(p.fast).hi + '–' + PN(p.slow).hi + ' के इत्थशाल में: कंबूल योग।');
        else {
          const moonAny = P.some(q => q !== 'Mo' && inOrb('Mo', q));
          const next = sgn(V.sign.Mo + 1), nextAsp = [p.fast, p.slow].filter(q => TAJ_ASPECT(house(next, V.sign[q])) !== 'tajika_neutral' && strongD(q));
          if (degIn(V.lon.Mo) >= 30 - DEEPTAMSHA.Mo && nextAsp.length) add('gairi_kamboola', [p.fast, p.slow, 'Mo'], null, 'The Moon, at the end of its sign, will aspect a strong ' + PN(nextAsp[0]).en + ' after changing sign: Gairi-kamboola.', 'राशि के अंत में चंद्रमा अगली राशि में बलवान ' + PN(nextAsp[0]).hi + ' को देखेगा: गैरी-कंबूल।');
          else if (!moonAny) add('khallasara', [p.fast, p.slow, 'Mo'], null, 'The Moon is void of aspect within orb while ' + PN(p.fast).en + ' and ' + PN(p.slow).en + ' form Ithasala: Khallasara, support is lacking.', 'चंद्रमा किसी से दृष्टि-संबंध में नहीं: खल्लासर योग।');
        }
      }
      const bad = [p.fast, p.slow].filter(q => V.retro[q] || V.combust[q] || isDebil(q, V.sign[q]) || [6, 8, 12].includes(H(q)));
      if (bad.length) add('radda', [p.fast, p.slow], { afflicted: bad }, 'Ithasala of ' + PN(p.fast).en + ' and ' + PN(p.slow).en + ' with ' + bad.map(q => PN(q).en).join(', ') + ' retrograde, combust, debilitated or in 6/8/12: Radda (refusal).', 'पीड़ित ग्रह के साथ इत्थशाल: रद्द योग।');
      if (strongD(p.slow) && weakD(p.fast)) add('duphali_kuttha', [p.fast, p.slow], null, 'The faster ' + PN(p.fast).en + ' is weak but the slower ' + PN(p.slow).en + ' is strong in dignity: Duphali-kuttha, success through the stronger partner.', 'धीमा ग्रह बलवान, तेज़ निर्बल: दुफालि-कुत्थ योग।');
      if (weakD(p.fast) && weakD(p.slow)) { const helper = P.find(q => q !== p.fast && q !== p.slow && strongD(q) && (ithWith(q, p.fast) || ithWith(q, p.slow))); if (helper) add('dutthottha_davira', [p.fast, p.slow, helper], { helper }, 'Both ' + PN(p.fast).en + ' and ' + PN(p.slow).en + ' are weak, but the strong ' + PN(helper).en + ' joins them by Ithasala: Dutthottha-davira, help arrives from a third party.', 'दोनों निर्बल पर बलवान ' + PN(helper).hi + ' सहायक: दुत्थोत्थ-दवीर योग।'); }
    }
    for (const id of P) {
      if (degIn(V.lon[id]) >= 29) { const next = sgn(V.sign[id] + 1), tgt = P.find(q => q !== id && strongD(q) && TAJ_ASPECT(house(next, V.sign[q])) !== 'tajika_neutral' && Math.abs(degIn(V.lon[q])) <= (DEEPTAMSHA[id] + DEEPTAMSHA[q]) / 2); if (tgt) add('tambira', [id, tgt], null, PN(id).en + ' at the end of its sign will form Ithasala with the strong ' + PN(tgt).en + ' in the next sign: Tambira, a delayed result.', PN(id).hi + ' अगली राशि में बलवान ' + PN(tgt).hi + ' से इत्थशाल करेगा: तंबीर योग।'); }
      const h = H(id);
      if ([1, 2, 4, 5, 7, 8, 10, 11].includes(h) && strongD(id) && !V.combust[id] && !V.retro[id]) add('kuttha', [id], { house: h }, PN(id).en + ' is strong (own/exalted, in a kendra or panaphara, not combust or retrograde): Kuttha.', PN(id).hi + ' बलवान: कुत्थ योग।');
      if ([3, 6, 9, 12].includes(h) && (isDebil(id, V.sign[id]) || V.combust[id] || V.retro[id])) add('durapha', [id], { house: h }, PN(id).en + ' is weak (in an apoklima and debilitated, combust or retrograde): Durapha.', PN(id).hi + ' निर्बल: दुरफ योग।');
    }
    if (opts && opts.karyaHouse) { const LL = SIGN_LORD[V.ascS], KL = SIGN_LORD[sgn(V.ascS + opts.karyaHouse - 1)]; for (const y of yogas) y.relevant = y.planets.includes(LL) && y.planets.includes(KL); }
    return { pairs, yogas };
  }
  const SAHAM_DEF = [ // [id, A, B, C, nightReverse]; strings: planet ids, 'L' annual lagna, special keys resolved in sahams()
    ['punya', 'Mo', 'Su', 'L', 1], ['vidya', 'Su', 'Mo', 'L', 1], ['yashas', 'Ju', '@punya', 'L', 1], ['mitra', 'Ju', '@punya', 'Ve', 1], ['mahatmya', '@punya', 'Ma', 'L', 1],
    ['asha', 'Sa', 'Ma', 'L', 1], ['samartha', 'Ma', '#LL', 'L', 1], ['bhratri', 'Ju', 'Sa', 'L', 0], ['gaurava', 'Ju', 'Mo', 'Su', 1], ['pitri', 'Sa', 'Su', 'L', 1],
    ['rajya', 'Sa', 'Su', 'L', 1], ['matri', 'Mo', 'Ve', 'L', 1], ['putra', 'Ju', 'Mo', 'L', 1], ['jeeva', 'Sa', 'Ju', 'L', 1], ['karma', 'Ma', 'Me', 'L', 1],
    ['roga', 'L', 'Mo', 'L', 0], ['kali', 'Ju', 'Ma', 'L', 1], ['shastra', 'Ju', 'Sa', 'Me', 1], ['bandhu', 'Me', 'Mo', 'L', 1], ['mrityu', '+210', 'Mo', 'L', 0],
    ['paradesha', '+240', '#L9', 'L', 0], ['artha', '+30', '#L2', 'L', 0], ['paradara', 'Ve', 'Su', 'L', 1], ['vanik', 'Mo', 'Me', 'L', 1], ['karyasiddhi', 'Sa', 'Su', '#SuL', 2],
    ['vivaha', 'Ve', 'Sa', 'L', 1], ['santapa', 'Sa', 'Mo', '+150', 1], ['shraddha', 'Ve', 'Ma', 'L', 1], ['preeti', '@shastra', '@punya', 'L', 1], ['jadya', 'Ma', 'Sa', 'Me', 1],
    ['vyapara', 'Ma', 'Sa', 'L', 0], ['shatru', 'Ma', 'Sa', 'L', 1], ['jalapatha', '=105', 'Sa', 'L', 1], ['bandhana', '@punya', 'Sa', 'L', 1], ['apamrityu', '+210', 'Ma', 'L', 1], ['labha', '+300', '#L11', 'L', 1]];
  function sahams(V, night, rule) {
    const L = V.asc, out = {}, LLord = SIGN_LORD[V.ascS];
    const val = k => {
      if (k === 'L') return L; if (k[0] === '@') return out[k.slice(1)].lon; if (k[0] === '+') return norm(L + +k.slice(1)); if (k[0] === '=') return +k.slice(1);
      if (k === '#LL') return V.lon[LLord === 'Ma' ? 'Ju' : LLord]; if (k === '#L9') return V.lon[SIGN_LORD[sgn(V.ascS + 8)]]; if (k === '#L2') return V.lon[SIGN_LORD[sgn(V.ascS + 1)]];
      if (k === '#L11') return V.lon[SIGN_LORD[sgn(V.ascS + 10)]]; if (k === '#SuL') return V.lon[SIGN_LORD[V.sign.Su]]; if (k === '#MoL') return V.lon[SIGN_LORD[V.sign.Mo]];
      return V.lon[k];
    };
    for (const [id, A0, B0, C0, nr] of SAHAM_DEF) {
      let A = A0, B = B0, C = C0;
      if (night && nr === 1) { A = B0; B = A0; } else if (night && nr === 2) { B = 'Mo'; C = '#MoL'; }
      if (id === 'samartha' && LLord === 'Ma') { A = night ? 'Ju' : 'Ma'; B = night ? 'Ma' : '#LL'; } // lagna lord Mars: Jupiter replaces it (JH)
      const a = val(A), b = val(B), c = val(C);
      let lon = norm(a - b + c), added = false;
      // +30° rule: add a sign when C does not fall between B and A (counted forward from B). JH/PyJHora test it by signs
      // (walking sign by sign from B's sign); rule:'longitude' tests the exact longitudes instead.
      let between;
      if (rule === 'longitude') between = norm(c - b) < norm(a - b);
      else { const sa = signOf(a), sb = signOf(b), sc = signOf(c); between = false; for (let n = 1; n <= 11; n++) { const z = sgn(sb + n); if (z === sc) { between = true; break; } if (z === sa) break; } }
      if (id !== 'roga' && !between) { lon = norm(lon + 30); added = true; }
      out[id] = { lon, sign: signOf(lon), deg: degIn(lon), lord: SIGN_LORD[signOf(lon)], house: house(V.ascS, signOf(lon)), formula: [A, B, C], plus30: added };
    }
    return out;
  }
  function vChart(C) { // compact view of an annual / monthly chart
    const V = { lon: {}, sign: {}, speed: {}, retro: {}, combust: {} };
    for (const p of C.planets) { V.lon[p.id] = p.lon; V.sign[p.id] = p.sign; V.speed[p.id] = p.speed; V.retro[p.id] = p.retro; V.combust[p.id] = p.combust; }
    V.asc = C.asc.lon; V.ascS = C.asc.sign; return V;
  }
  // Muntha, the five office bearers and the year lord from an annual-chart view V (lon/sign by planet, ascS)
  // yearLordRule 'friendly' (default): office bearers with a friendly Tajika aspect (3/5/9/11) on the annual lagna first, then those with
  // an inimical one (1/4/7/10), the strongest by Pancha-vargiya bala in that group (reproduces B.V. Raman's worked example).
  // 'plain' (Tajika Neelakanthi as usually quoted): the strongest of the office bearers that aspects the annual lagna by any Tajika
  // aspect; if none aspects it, the strongest of the five.
  function annualCore(V, natAsc, age, day, rule) {
    const muntha = sgn(natAsc + age);
    const ob = { muntha_lord: SIGN_LORD[muntha], janma_lagna_lord: SIGN_LORD[natAsc], varsha_lagna_lord: SIGN_LORD[V.ascS],
      tri_rashi_pati: (day ? TRI_DAY : TRI_NIGHT)[V.ascS], dina_ratri_pati: day ? SIGN_LORD[V.sign.Su] : SIGN_LORD[V.sign.Mo] };
    const pvb = {}; for (const id of PL7) pvb[id] = panchaVargiya(V.lon[id], id);
    const order = ['muntha_lord', 'janma_lagna_lord', 'varsha_lagna_lord', 'tri_rashi_pati', 'dina_ratri_pati'];
    const cand = [...new Set(order.map(k => ob[k]))];
    const aspOf = id => TAJ_ASPECT(house(V.sign[id], V.ascS));
    const friendly = cand.filter(id => ['tajika_pratyaksha_mitra', 'tajika_gupta_mitra'].includes(aspOf(id)));
    const inimical = cand.filter(id => ['tajika_pratyaksha_shatru', 'tajika_gupta_shatru'].includes(aspOf(id)));
    const plain = rule === 'plain', aspecting = friendly.concat(inimical);
    const pool = plain ? (aspecting.length ? aspecting : cand) : friendly.length ? friendly : inimical.length ? inimical : cand;
    const lord = pool.reduce((best, id) => pvb[id].total > pvb[best].total ? id : best, pool[0]);
    const basis = plain ? (aspecting.length ? 'aspect_on_lagna_strongest' : 'no_aspect_strongest') : friendly.length ? 'friendly_aspect_on_lagna' : inimical.length ? 'inimical_aspect_on_lagna' : 'no_aspect_strongest';
    return {
      muntha: { sign: muntha, house: house(V.ascS, muntha) }, officeBearers: ob, pvb,
      yearLord: { planet: lord, readingId: 'year_lord_' + lord, basis, yearLordRule: plain ? 'plain' : 'friendly',
        candidates: cand.map(id => ({ planet: id, roles: order.filter(k => ob[k] === id), aspectOnLagna: aspOf(id), pvb: pvb[id].total })),
        rule: plain ? T('Year lord (Varsheshwar), plain rule (Tajika Neelakanthi): among the five office bearers (Muntha lord, natal lagna lord, annual lagna lord, Tri-rashi pati, Sun-sign lord by day / Moon-sign lord by night), the one with the greatest Pancha-vargiya bala that aspects the annual lagna by any Tajika aspect; if none aspects it, the strongest of the five.',
          'वर्षेश, सीधा नियम (ताजिक नीलकंठी): पाँच पदाधिकारियों में जो वर्ष लग्न को किसी भी ताजिक दृष्टि से देखे और जिसका पंचवर्गीय बल सबसे अधिक हो; कोई न देखे तो पाँचों में सबसे बलवान।')
          : T('Year lord (Varsheshwar), default rule: among the five office bearers (Muntha lord, natal lagna lord, annual lagna lord, Tri-rashi pati, Sun-sign lord by day / Moon-sign lord by night), those casting a friendly Tajika aspect (3/5/9/11) on the annual lagna are preferred, then those with an inimical aspect (1/4/7/10); the one with the greatest Pancha-vargiya bala in that group wins; if none aspects, the strongest of the five. The preference for a friendly aspect reproduces B.V. Raman’s worked example (Varshaphal); opts.yearLordRule = "plain" gives the plain Neelakanthi rule.',
            'वर्षेश, डिफ़ॉल्ट नियम: पाँच पदाधिकारियों में से जो वर्ष लग्न पर मित्र ताजिक दृष्टि (3/5/9/11) डालें वे पहले, फिर शत्रु दृष्टि (1/4/7/10) वाले; उस समूह में पंचवर्गीय बल में सबसे अधिक; कोई न देखे तो पाँचों में सबसे बलवान। यह बी.वी. रमन के उदाहरण से मेल खाता है; सीधा नीलकंठी नियम विकल्प के रूप में उपलब्ध है।') }
    };
  }
  function varshaphal(C, yearOrAge, opts) {
    opts = opts || {};
    const t0 = hrnow(), by = +C.meta.input.date.slice(0, 4);
    const age = yearOrAge === undefined ? (opts.age !== undefined ? +opts.age : JE.calFromJd(Date.now() / 86400000 + 2440587.5).y - by) : (+yearOrAge > 200 ? +yearOrAge - by : +yearOrAge);
    const ay = C.meta.ayanamsaId === 'tropical' ? 'lahiri' : C.meta.ayanamsaId, natalSun = sunSid(C.meta.jdUT, ay);
    const jdR = solarReturn(natalSun, C.meta.jdUT + age * 365.25636, ay), jdN = solarReturn(natalSun, jdR + 365.25636, ay), yearLen = jdN - jdR;
    const place = opts.place || C.meta.input.place;
    const inp = momentInput(place, jdR, (C.meta.input.name || '') + ' varsha ' + age);
    const A = JE.chart(inp, { ayanamsa: ay, node: C.meta.nodeType, houses: 'whole', dashaLevels: 2, tzMode: inp.place.tz });
    const V = vChart(A), day = A.panchang.isDayBirth;
    const core = annualCore(V, C.asc.sign, age, day, opts.yearLordRule), muntha = core.muntha.sign, munthaHouse = core.muntha.house;
    const ob = core.officeBearers, pvb = core.pvb, yearLord = core.yearLord;
    const hb = {}; for (const id of PL7) hb[id] = harshaBala(V, id, day, opts.harshaMercury);
    const tj = tajikaYogas(V, opts);
    const sah = sahams(V, !day, opts.sahamRule);
    const md = muddaDasha(C, A, jdR, yearLen, age, opts), pt = patyayini(A, V, jdR, yearLen, opts);
    const months = [];
    if (opts.months !== false) for (let m = 1; m < 12; m++) {
      const jm = solarReturn(norm(natalSun + 30 * m), jdR + m * 30.44, ay);
      months.push({ month: m + 1, jdUT: jm, iso: JE.isoLocal(jm, A.meta.utcOffsetUsed), ascSign: signOf(JE.ascSid(jm, +place.lat, +place.lon, ay)), moonSign: signOf(JE.positionsAt(jm, ay, 'mean', ['Mo']).pos.Mo.lon), munthaSign: sgn(muntha + m) });
    }
    months.unshift({ month: 1, jdUT: jdR, iso: A.meta.localISO, ascSign: V.ascS, moonSign: V.sign.Mo, munthaSign: muntha });
    return {
      age, year: by + age, solarReturn: { jdUT: jdR, iso: A.meta.localISO, utcISO: A.meta.utcISO, offset: A.meta.utcOffsetUsed, natalSunLon: natalSun, nextReturnJd: jdN, yearDays: yearLen, dayBirth: day },
      chart: A, muntha: { sign: muntha, house: munthaHouse, lord: SIGN_LORD[muntha], readingId: 'muntha_h' + munthaHouse, rule: T('Muntha = natal lagna sign advanced one sign per completed year.', 'मुंथा = जन्म लग्न राशि से हर पूर्ण वर्ष के लिए एक राशि आगे।') },
      officeBearers: ob, yearLord, panchaVargiyaBala: pvb, harshaBala: hb,
      tajika: { aspects: tj.pairs, yogas: tj.yogas, deeptamsha: DEEPTAMSHA }, sahams: sah, sahamsNight: !day,
      dashas: { mudda: md, patyayini: pt }, masaPravesha: months, computeMs: Math.round(hrnow() - t0),
      note: T('Annual chart for the exact sidereal solar return with the natal ayanamsa; Tajika aspects by sign, Ithasala/Easarapha by degree within the mean of the two deeptamshas, applying judged from actual speeds. Pancha-vargiya bala uses natural friendships and Egyptian hadda (Tajika), each varga scored own 1 > friend 3/4 > neutral 1/2 > enemy 1/4 of its maximum; the Uchcha part is (distance from debilitation)/9 so the total runs 0-20. Harsha bala houses: feminine planets (Moon, Venus, Saturn, Mercury by default) in houses 1-3 and 7-9, masculine ones in 4-6 and 10-12.',
        'वर्ष कुंडली ठीक नाक्षत्र सौर पुनरागमन के क्षण की; ताजिक दृष्टि राशि से, इत्थशाल/ईसराफ अंशों से (दोनों दीप्तांशों का औसत)। पंचवर्गीय बल 0-20।')
    };
  }
  function muddaDasha(C, A, jdR, yearLen, age, opts) {
    const x = ctxOf(A), moon = C.planets.find(p => p.id === 'Mo').lon, nk = Math.floor(moon / NAK), frac = (moon - nk * NAK) / NAK;
    const i0 = (DASHA_ORDER.indexOf(DASHA_ORDER[nk % 9]) + age) % 9, lord = DASHA_ORDER[i0], maxL = Math.min(3, (opts && opts.levels) || 3), yd = yearLen;
    const kids = p => { const j = DASHA_ORDER.indexOf(p.lord), list = []; for (let k = 0; k < 9; k++) { const L = DASHA_ORDER[(j + k) % 9]; list.push([L, VIM_YEARS[L]]); } return splitKids(p, list, false, maxL, x, yd, kids); };
    // The cycle starts before the return by the elapsed part of the natal nakshatra. It is clipped to this year's return-to-return
    // window: the first lord runs from the return, and its elapsed part comes back at the end of the year (up to the next return),
    // so consecutive years join without gaps or overlaps.
    const start0 = jdR - frac * VIM_YEARS[lord] / 120 * yd, full = []; let t = start0;
    for (let k = 0; k < 10; k++) { const L = DASHA_ORDER[(i0 + k) % 9], y = VIM_YEARS[L] / 120; full.push(mkNode(L, false, t, y, 1, maxL, x, yd, kids, { days: r2(y * yd), cycle: k < 9 ? 1 : 2 })); t += y * yd; }
    const tree = full.map(n => clipNode(n, jdR, jdR + yd, x, yd)).filter(Boolean);
    return { system: 'mudda', kind: 'graha', tree, firstLord: lord, yearDays: yd, unit: 'fraction_of_year', window: { start: jdR, end: jdR + yd },
      note: T('Mudda (annual Vimshottari): the lord is the natal Moon\'s nakshatra lord advanced one step per completed year; 360 parts (Sun 18, Moon 30, Mars 21, Rahu 54, Jupiter 48, Saturn 57, Mercury 51, Ketu 21, Venus 60) spread over the solar year; the elapsed part of the natal nakshatra is taken off the first period and returns at the end of the year, so the periods fill exactly the time from this solar return to the next. node.years = fraction of the year.',
        'मुद्दा (वार्षिक विंशोत्तरी): स्वामी = जन्म चंद्र नक्षत्र स्वामी से हर पूर्ण वर्ष एक कदम आगे; 360 भाग सौर वर्ष में।') };
  }
  function patyayiniItems(V) { // lagna + 7 planets by krisamsa (degree in sign); arc = difference from the previous one; w = arc / largest
    const items = ['La'].concat(PL7).map(id => ({ id, d: degIn(id === 'La' ? V.asc : V.lon[id]) })).sort((a, b) => a.d - b.d);
    const tot = items[items.length - 1].d || 1; let prev = 0;
    for (const it of items) { it.arc = it.d - prev; prev = it.d; it.w = it.arc / tot; }
    return items;
  }
  function patyayini(A, V, jdR, yearLen, opts) {
    const x = ctxOf(A), maxL = Math.min(3, (opts && opts.levels) || 3), items = patyayiniItems(V);
    const seq = items.map(i => i.id), W = Object.fromEntries(items.map(i => [i.id, i.w]));
    const kids = p => { const j = seq.indexOf(p.lord), list = []; for (let k = 0; k < seq.length; k++) { const id = seq[(j + k) % seq.length]; list.push([id, W[id]]); } return splitKids(p, list, false, maxL, x, yearLen, kids); };
    const tree = []; let t = jdR;
    for (const it of items) { if (it.w <= 0) continue; tree.push(mkNode(it.id, false, t, it.w, 1, maxL, x, yearLen, kids, { days: r2(it.w * yearLen), krisamsa: r4(it.d) })); t += it.w * yearLen; }
    return { system: 'patyayini', kind: 'graha', tree, sequence: seq, yearDays: yearLen, unit: 'fraction_of_year',
      note: T('Patyayini (Tajika): lagna and the seven planets ordered by degrees within their signs (krisamsa); each period is the difference from the previous degree, as a share of the year. Antardashas follow the same order from the period lord.', 'पात्यायिनी (ताजिक): लग्न और सात ग्रह राशि-अंशों के क्रम में; हर अवधि पिछले अंश से अंतर के अनुपात में।') };
  }

  /* ==================================================================
     7. Lal Kitab (1952 edition conventions as commonly implemented)
     ================================================================== */
  // Varshphal (annual) house table: row = running year of life 1..120 (completed age + 1), entry = annual house of a planet in natal house h.
  // Source: Lal Kitab varshphal chart (Astrostudents PDF, cross-checked with R.N. Bhandari's table; see tests/ref-phase3.json).
  const LK_TABLE_STR = '19a352b76c4841c9375628ab941283a57bc63841a96b572cb3841592c67a5c384b291a677695c41ab283276c9a3185b4c276b184a359ab276c48319585ba76c394126a5b287c493115a8b672c3944132578b6ca994168527bac33941c86527bab3941a56782c5b6941c8a2377ab3941c8562275c39a1468bc285a3941b76ac276b39514886ca72b39415687b2c4a395116a32874b5c94138672bc95a9415abc768233941b56872acb3941682ac755b89413c2a6775bc941a8632275b3ca64198c26a8391574bac2759b314868ac6724593b16872ca593b1413a69c75b24841386527cab9941c82ab63573941b86c257ab7941682ac355b89c13476a275b2341a89c62a5349c8176bc265a7913b84ac2753b6489186ca7b495123687b2a53941c17a6c284b93541836c5b27a9941283c67a5b3941b72c586aba741639c5825b394162ac7875b8391a642c235b94a186c7c265a8974b13ac275b48319686ca75b39241689c2a7513b41ba6c247895341683c2a957b941286cb73a53941687c52bab2941583ac675a392168b7c475b3a419c682235b97a1684cc875b3941a26ac275b36419886ca79b52431678c4a523b1914a6cb78259342386c1b7a599a13862754cb3961285cb7a4b394128ac6755b497162ac3875b294c6318a285b47a3196cc175ba948326ac27534968b186ca35b19247678ca9354b1213a6c28b549741836cb279a5941738c526ba39418a27c56bba94167c38525b694138a27c75b2a46983c1275b93a41c86c8752b916a34ac28b546971386ca57134b29623c795ab14819a6c275348b4168acb29735941268cb53a73a81576c29b4b394168a75c25b3941268c7a75b39418ca26275b39a1684cc245b397a618ac2785394b6186ca7b431259687c2a54b19319a6c27b53484168ac3572b9941258ca673b3a89b7412c65b3941627a58c5b314a68c97275b3941c8a26275b39a648c1c24561893ba7ac278b93165486ca75b29413687c2354b19a';
  const LK_TABLE = []; for (let a = 0; a < 120; a++) LK_TABLE.push(Array.from(LK_TABLE_STR.slice(a * 12, a * 12 + 12), c => parseInt(c, 13)));
  // Primary pakka ghar (used for the status and the awake rule) and, separately, the further houses Lal Kitab links with the planet
  // as karaka (shown, never used for status).
  const LK_PAKKA = { Su: [1], Mo: [4], Ma: [3, 8], Me: [7], Ju: [2], Ve: [7], Sa: [8], Ra: [12], Ke: [6] };
  const LK_KARAKA_HOUSES = { Su: [1, 5], Mo: [4], Ma: [3, 8], Me: [7], Ju: [2, 5, 9, 11, 12], Ve: [7], Sa: [8, 10, 11], Ra: [12], Ke: [6] };
  const LK_HOUSE_KARAKA = { 1: 'Su', 2: 'Ju', 3: 'Ma', 4: 'Mo', 5: 'Ju', 6: 'Ke', 7: 'Ve', 8: 'Ma', 9: 'Ju', 10: 'Sa', 11: 'Ju', 12: 'Ra' };
  const LK_EX = { Su: [1], Mo: [2], Ma: [10], Me: [6], Ju: [4], Ve: [12], Sa: [7], Ra: [3, 6], Ke: [9, 12] };
  const LK_DB = { Su: [7], Mo: [8], Ma: [4], Me: [12], Ju: [10], Ve: [6], Sa: [1], Ra: [8, 9], Ke: [3, 6] };
  const LK_ASPECT = { 1: [[7, 100]], 2: [[6, 25]], 3: [[9, 50], [11, 50]], 4: [[10, 100]], 5: [[9, 50]], 6: [[12, 25]], 8: [[2, 25]] };
  const LK_RIN = [
    ['pitri_rin', ['Ve', 'Me', 'Ra'], [2, 5, 9, 12], 'Venus, Mercury or Rahu in a house of Jupiter (2, 5, 9, 12)', 'शुक्र, बुध या राहु गुरु के भाव (2, 5, 9, 12) में'],
    ['swayam_rin', ['Ve', 'Sa', 'Ra', 'Ke'], [5], 'Venus, Saturn, Rahu or Ketu in the 5th', 'शुक्र, शनि, राहु या केतु पाँचवें में'],
    ['matri_rin', ['Ke'], [4], 'Ketu in the 4th', 'केतु चौथे में'],
    ['stri_rin', ['Su', 'Ra', 'Ke'], [2, 7], 'Sun, Rahu or Ketu in the 2nd or 7th', 'सूर्य, राहु या केतु दूसरे या सातवें में'],
    ['sambandhi_rin', ['Me', 'Ke'], [1, 8], 'Mercury or Ketu in the 1st or 8th', 'बुध या केतु पहले या आठवें में'],
    ['kanya_rin', ['Mo'], [3, 6], 'Moon in the 3rd or 6th', 'चंद्रमा तीसरे या छठे में'],
    ['zalim_rin', ['Su', 'Mo', 'Ma'], [10, 11], 'Sun, Moon or Mars in the 10th or 11th', 'सूर्य, चंद्र या मंगल दसवें या ग्यारहवें में'],
    ['ajanma_rin', ['Su', 'Ve', 'Ma'], [12], 'Sun, Venus or Mars in the 12th', 'सूर्य, शुक्र या मंगल बारहवें में'],
    ['daivik_rin', ['Mo', 'Ma'], [6], 'Moon or Mars in the 6th', 'चंद्र या मंगल छठे में']];
  const LK_MASNUI = [
    ['masnui_ju_su_ve', 'Ju', ['Su', 'Ve']], ['masnui_su_me_ve', 'Su', ['Me', 'Ve']], ['masnui_mo_su_ju', 'Mo', ['Su', 'Ju']], ['masnui_ve_ra_ke', 'Ve', ['Ra', 'Ke']],
    ['masnui_ma_nek_su_me', 'Ma', ['Su', 'Me'], 'nek'], ['masnui_ma_bad_su_sa', 'Ma', ['Su', 'Sa'], 'bad'], ['masnui_me_ju_ra', 'Me', ['Ju', 'Ra']],
    ['masnui_sa_ketu_like_ve_ju', 'Sa', ['Ve', 'Ju'], 'ketu_like'], ['masnui_sa_rahu_like_ma_me', 'Sa', ['Ma', 'Me'], 'rahu_like'],
    ['masnui_ra_uchha_ma_sa', 'Ra', ['Ma', 'Sa'], 'exalted'], ['masnui_ra_neech_su_sa', 'Ra', ['Su', 'Sa'], 'debilitated'],
    ['masnui_ke_uchha_ve_sa', 'Ke', ['Ve', 'Sa'], 'exalted'], ['masnui_ke_neech_mo_sa', 'Ke', ['Mo', 'Sa'], 'debilitated']];
  const lkEnemy = (a, b) => NATREL[a].e.includes(b) || NATREL[b].e.includes(a);
  function lkAnalyse(hp) { // hp: {planet: house}
    const inH = h => PL9.filter(id => hp[id] === h);
    const aspectsOf = h => (LK_ASPECT[h] || []);
    const aspectedBy = h => { const out = []; for (const id of PL9) for (const [t, pct] of aspectsOf(hp[id])) if (t === h) out.push({ planet: id, pct }); return out; };
    const planets = PL9.map(id => {
      const h = hp[id], ex = LK_EX[id].includes(h), db = LK_DB[id].includes(h), pakka = LK_PAKKA[id].includes(h), karakaH = !pakka && LK_KARAKA_HOUSES[id].includes(h);
      const targets = aspectsOf(h).map(([t, pct]) => ({ house: t, pct, planets: inH(t) }));
      const awake = pakka || ex || targets.some(t => t.planets.length) || (!targets.length && aspectedBy(h).length > 0);
      const enemies = inH(h).filter(o => o !== id && lkEnemy(id, o)).concat(aspectedBy(h).map(a => a.planet).filter(o => o !== id && lkEnemy(id, o)));
      const status = [ex ? 'lk_exalted' : db ? 'lk_debilitated' : null, pakka ? 'lk_pakka_ghar' : null, enemies.length ? null : 'lk_kayam', awake ? 'lk_jaagta' : 'lk_soya'].filter(Boolean);
      return { id, house: h, readingId: 'lk_' + id + '_' + h, remedyId: 'lk_' + id + '_' + h, planetRemedyId: 'lk_upay_' + id, exalted: ex, debilitated: db, pakkaGhar: pakka, pakkaGharHouses: LK_PAKKA[id].slice(), karakaHouse: karakaH, karakaHouses: LK_KARAKA_HOUSES[id].slice(), kayam: !enemies.length, enemies: [...new Set(enemies)], sleeping: !awake, aspects: targets, status };
    });
    const houses = []; for (let h = 1; h <= 12; h++) { const occ = inH(h), asp = aspectedBy(h); const pg = PL9.filter(id => LK_PAKKA[id].includes(h)); houses.push({ house: h, readingId: 'lk_h' + h, planets: occ, aspectedBy: asp, pakkaGharOf: pg[0] || null, pakkaGharPlanets: pg, karaka: LK_HOUSE_KARAKA[h], sleeping: !occ.length && !asp.length }); }
    const rin = LK_RIN.map(([id, ps, hs, en, hi]) => { const who = ps.filter(p => hs.includes(hp[p])); return { id, present: who.length > 0, planets: who, rule: T(en, hi) }; });
    const masnui = LK_MASNUI.map(([id, as, pair, kind]) => { const same = hp[pair[0]] === hp[pair[1]]; return { id, present: same, actsAs: as, from: pair, kind: kind || null, house: same ? hp[pair[0]] : null }; });
    const tenth = inH(10), blind = tenth.some((a, i) => tenth.slice(i + 1).some(b => lkEnemy(a, b)));
    const types = [
      { id: 'andha_teva', present: blind, rule: T('Mutually inimical planets together in the 10th house.', 'परस्पर शत्रु ग्रह दसवें भाव में साथ।') },
      { id: 'ratandh_teva', present: hp.Su === 4 && hp.Sa === 7, rule: T('Sun in the 4th and Saturn in the 7th.', 'सूर्य चौथे और शनि सातवें में।') },
      { id: 'dharmi_teva', present: hp.Ju === hp.Sa || hp.Ra === 4 || hp.Ke === 4, rule: T('Jupiter and Saturn together, or Rahu/Ketu in the 4th.', 'गुरु और शनि साथ, या राहु/केतु चौथे में।') },
      { id: 'nabalig_teva', present: [1, 4, 7, 10].every(h => !inH(h).length), rule: T('Houses 1, 4, 7 and 10 all empty (a "minor" chart: results are said to mature after age 12).', 'भाव 1, 4, 7, 10 सब खाली (नाबालिग टेवा)।') }];
    return { planets, houses, rin, masnui, types, sleepingPlanets: planets.filter(p => p.sleeping).map(p => p.id), sleepingHouses: houses.filter(h => h.sleeping).map(h => h.house) };
  }
  function lalKitab(C, opts) {
    opts = opts || {};
    const x = ctxOf(C), hp = {}; for (const id of PL9) hp[id] = house(x.ascS, x.sign[id]);
    const res = lkAnalyse(hp);
    res.teva = Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: i, planets: PL9.filter(id => hp[id] === i + 1) }));
    const ageNow = opts.age !== undefined ? +opts.age : Math.max(0, JE.calFromJd((opts.jd || (Date.now() / 86400000 + 2440587.5))).y - +C.meta.input.date.slice(0, 4));
    const year = opts.year !== undefined ? +opts.year : Math.min(120, Math.max(1, ageNow + 1));
    const annual = y => { const row = LK_TABLE[(Math.max(1, Math.min(120, y))) - 1], ap = {}; for (const id of PL9) ap[id] = row[hp[id] - 1]; return ap; };
    const ap = annual(year);
    res.varshphal = { year, age: year - 1, houses: ap, analysis: lkAnalyse(ap), row: LK_TABLE[year - 1].slice(),
      rule: T('Lal Kitab varshphal: each natal house moves to the house given by the 120-year table for the running year of life (year 1 = birth to first birthday).', 'लाल किताब वर्षफल: हर जन्म-भाव 120-वर्षीय तालिका के अनुसार चालू वर्ष में दूसरे भाव में जाता है (वर्ष 1 = जन्म से पहला जन्मदिन)।') };
    if (opts.allYears) res.varshphalTable = Array.from({ length: 120 }, (_, i) => ({ year: i + 1, houses: annual(i + 1) }));
    res.note = T('Lal Kitab teva: houses counted from the lagna and renumbered so the lagna is Aries/house 1 (signs are ignored). Pakka ghar (primary houses: Su 1, Mo 4, Ma 3/8, Me 7, Ju 2, Ve 7, Sa 8, Ra 12, Ke 6; the wider karaka houses are listed separately and not used for status), exaltation houses, aspects (1→7, 4→10 full; 3→9/11, 5→9 half; 2→6, 6→12, 8→2 quarter), sleeping planets (no planet in the houses it aspects, unless in pakka ghar or exalted) and houses (empty and unaspected), debts (rin) and artificial (masnui) planets follow the 1952-edition rules as commonly tabulated; Lal Kitab commentators differ in details. Remedies are optional cultural practices.',
      'लाल किताब टेवा: भाव लग्न से, लग्न = मेष/पहला भाव (राशियाँ नहीं देखी जातीं)। पक्का घर, उच्च भाव, दृष्टि, सोए ग्रह और भाव, ऋण और मसनूई ग्रह 1952 संस्करण के प्रचलित नियमों से; टीकाकारों में मतभेद। उपाय वैकल्पिक सांस्कृतिक परंपराएँ।');
    return res;
  }

  /* ==================================================================
     8. Prashna (horary)
     ================================================================== */
  // Question types -> question (karya) house. 'wellbeing' (general wellbeing, lagna) replaces the Phase 3 'health' type, in line with the
  // ethics note (prashna is not used for illness or lifespan questions); 'health' is still accepted as an alias of 'wellbeing'.
  const Q_HOUSE = { general: 1, marriage: 7, job: 10, wellbeing: 1, travel: 9, lost_item: 2, child: 5, property: 4, litigation: 6, education: 4, money: 2 };
  const Q_ALIAS = { health: 'wellbeing' };
  const Q_KP = { general: null, marriage: 'kp_marriage', job: 'kp_job', wellbeing: 'kp_recovery', travel: 'kp_foreign_travel', lost_item: null, child: 'kp_child', property: 'kp_property', litigation: 'kp_litigation_win', education: 'kp_education', money: 'kp_income_gain' };
  const SHIRSHODAYA = [2, 4, 5, 6, 7, 10], PRISHTODAYA = [0, 1, 3, 8, 9];
  // Verdict bands on the normalised score (score / half the sum of all positive and negative weights that could apply); calibrated so
  // that on random moments no question type gives "likely yes" 40% of the time or more and "likely no" stays above 10%
  // (tests/test-phase3.js, 150 moments per type).
  const PRASHNA_BAND = 0.15;
  // Rules come in balanced pairs (each positive indicator has a negative counterpart of the same weight, or weights set so that
  // the expected contribution on a random moment is about zero).
  function prashnaRules(C, V, ascS, kh, kpRes, qtype, arudha) {
    const rules = [], add = (id, applies, effect, weight, en, hi) => rules.push({ id, applies: !!applies, effect, weight: applies ? weight : 0, maxWeight: weight, text: T(en, hi) });
    const H = id => house(ascS, V.sign[id]), LL = SIGN_LORD[ascS], KL = SIGN_LORD[sgn(ascS + kh - 1)];
    const dig = id => (C.planets.find(p => p.id === id) || {}).dignity, comb = id => (C.planets.find(p => p.id === id) || {}).combust;
    const strong = id => ['exalted', 'moolatrikona', 'own', 'great_friend', 'friend'].includes(dig(id)) && !comb(id);
    const weak = id => ['debilitated', 'enemy', 'great_enemy'].includes(dig(id));
    const waxing = C.panchang.paksha === 'shukla';
    const ben = id => id === 'Mo' ? waxing : ['Ju', 'Ve', 'Me'].includes(id), mal = id => !ben(id) && PL9.includes(id);
    add('pr_lagna_lord_strong', strong(LL), 'positive', 1, 'Lagna lord ' + PN(LL).en + ' is strong (own/exalted/friendly sign, not combust).', 'लग्नेश ' + PN(LL).hi + ' बलवान।');
    add('pr_lagna_lord_weak', weak(LL) || comb(LL), 'negative', -1, 'Lagna lord ' + PN(LL).en + ' is weak (debilitated, in an enemy sign or combust).', 'लग्नेश ' + PN(LL).hi + ' निर्बल (नीच, शत्रु राशि या अस्त)।');
    add('pr_lagna_lord_kendra', [1, 4, 7, 10, 5, 9].includes(H(LL)), 'positive', 0.5, 'Lagna lord in a kendra or trikona (house ' + H(LL) + ').', 'लग्नेश केंद्र/त्रिकोण में (भाव ' + H(LL) + ')।');
    add('pr_lagna_lord_dusthana', [6, 8, 12].includes(H(LL)), 'negative', -1, 'Lagna lord in house ' + H(LL) + ' (6/8/12).', 'लग्नेश ' + H(LL) + 'वें भाव में (6/8/12)।');
    add('pr_moon_strong', strong('Mo') || isExalted('Mo', V.sign.Mo), 'positive', 0.5, 'The Moon is well placed by sign.', 'चंद्रमा राशि से अच्छी स्थिति में।');
    add('pr_moon_dusthana', [6, 8, 12].includes(H('Mo')), 'negative', -1, 'The Moon in house ' + H('Mo') + ' (6/8/12).', 'चंद्रमा ' + H('Mo') + 'वें भाव में।');
    add('pr_moon_waxing', waxing, 'positive', 0.5, 'Waxing Moon (Shukla paksha).', 'शुक्ल पक्ष का चंद्रमा।');
    add('pr_moon_waning', !waxing, 'negative', -0.5, 'Waning Moon (Krishna paksha).', 'कृष्ण पक्ष का चंद्रमा।');
    const inL = PL9.filter(id => H(id) === 1);
    add('pr_benefic_in_lagna', inL.some(ben), 'positive', 1, 'Benefic in the lagna: ' + inL.filter(ben).map(i => PN(i).en).join(', '), 'लग्न में शुभ ग्रह।');
    add('pr_malefic_in_lagna', inL.some(mal), 'negative', -1, 'Malefic in the lagna: ' + inL.filter(mal).map(i => PN(i).en).join(', '), 'लग्न में पाप ग्रह।');
    add('pr_karya_lord_strong', kh !== 1 && strong(KL), 'positive', 1, 'Lord of the question house (' + kh + ') ' + PN(KL).en + ' is strong.', 'प्रश्न भाव (' + kh + ') का स्वामी ' + PN(KL).hi + ' बलवान।');
    add('pr_karya_lord_weak', kh !== 1 && weak(KL) && !comb(KL), 'negative', -1, 'Lord of the question house (' + kh + ') ' + PN(KL).en + ' is weak (debilitated or in an enemy sign).', 'प्रश्न भाव (' + kh + ') का स्वामी ' + PN(KL).hi + ' निर्बल (नीच या शत्रु राशि)।');
    add('pr_karya_lord_combust', kh !== 1 && comb(KL), 'negative', -1, 'Lord of the question house ' + PN(KL).en + ' is combust.', 'कार्येश ' + PN(KL).hi + ' अस्त।');
    const pairLL = LL !== KL && PL7.includes(LL) && PL7.includes(KL) ? tajikaPair(V, LL, KL) : null, pairMo = KL !== 'Mo' && PL7.includes(KL) ? tajikaPair(V, 'Mo', KL) : null;
    add('pr_ithasala_lagna_karya', pairLL && pairLL.applying, 'positive', 1.5, 'Ithasala (applying Tajika aspect) between the lagna lord and the question lord.', 'लग्नेश और कार्येश में इत्थशाल।');
    add('pr_easarapha_lagna_karya', pairLL && pairLL.separating, 'negative', -1.5, 'Lagna lord and question lord are separating (Easarapha): the chance may have passed.', 'लग्नेश और कार्येश में ईसराफ (वियोग)।');
    add('pr_ithasala_moon_karya', pairMo && pairMo.applying, 'positive', 1, 'The Moon applies to the question lord (Ithasala).', 'चंद्रमा का कार्येश से इत्थशाल।');
    add('pr_easarapha_moon_karya', pairMo && pairMo.separating, 'negative', -1, 'The Moon is separating from the question lord (Easarapha).', 'चंद्रमा कार्येश से अलग हो रहा है (ईसराफ)।');
    const inK = PL9.filter(id => H(id) === kh);
    add('pr_karya_house_benefic', kh !== 1 && inK.some(ben), 'positive', 1, 'Benefic in the question house.', 'प्रश्न भाव में शुभ ग्रह।');
    add('pr_karya_house_malefic', kh !== 1 && inK.some(mal), 'negative', -1, 'Malefic in the question house.', 'प्रश्न भाव में पाप ग्रह।');
    add('pr_shirshodaya_lagna', SHIRSHODAYA.includes(ascS), 'positive', 0.5, 'Head-rising (shirshodaya) lagna: matters move readily.', 'शीर्षोदय लग्न: कार्य सहज।');
    add('pr_prishtodaya_lagna', PRISHTODAYA.includes(ascS), 'negative', -0.5, 'Back-rising (prishtodaya) lagna: delays.', 'पृष्ठोदय लग्न: विलंब।');
    const link = LL !== KL && (V.sign[LL] === V.sign[KL] || (V.sign[LL] === sgn(ascS + kh - 1) && V.sign[KL] === ascS) || house(V.sign[LL], V.sign[KL]) === 7);
    add('pr_lagna_karya_link', link, 'positive', 1, 'Lagna lord and question lord are linked (together, exchanged between lagna and question house, or opposite).', 'लग्नेश और कार्येश जुड़े हुए (युति, परिवर्तन या आमने-सामने)।');
    const d68 = LL !== KL && [6, 8].includes(house(V.sign[LL], V.sign[KL]));
    add('pr_lagna_karya_6_8', d68, 'negative', -1, 'Lagna lord and question lord are 6th/8th from each other (shadashtaka): the two sides pull apart.', 'लग्नेश और कार्येश परस्पर छठे/आठवें (षडाष्टक): दोनों पक्ष अलग खिंचते हैं।');
    const tim = isMov(ascS) ? 'quick' : isFix(ascS) ? 'slow' : 'moderate';
    rules.push({ id: 'pr_lagna_type_timing', applies: true, effect: 'timing', weight: 0, maxWeight: 0, timing: tim, text: T('Lagna is ' + (isMov(ascS) ? 'movable: results tend to come quickly' : isFix(ascS) ? 'fixed: results take time' : 'dual: results come after some delay') + ' (traditional timing hint).', 'लग्न ' + (isMov(ascS) ? 'चर: फल शीघ्र' : isFix(ascS) ? 'स्थिर: फल में समय' : 'द्विस्वभाव: फल कुछ विलंब से') + ' (पारंपरिक संकेत)।') });
    if (kpRes && kpRes.rulingPlanets) {
      const rp = kpRes.rulingPlanets.combined, csl = kpRes.cusps[kh - 1].subLord, agree = rp.includes(KL) || rp.includes(csl);
      add('pr_ruling_planets_agree', agree, 'positive', 0.5, 'KP ruling planets of the moment include ' + (rp.includes(KL) ? 'the question lord' : 'the question cusp\'s sub-lord') + '.', 'प्रश्न-क्षण के शासक ग्रहों में कार्येश/उप-स्वामी शामिल।');
    }
    const kb = PL9.filter(id => [1, 4, 7, 10].includes(house(arudha, V.sign[id])) && ben(id)), km = PL9.filter(id => [1, 4, 7, 10].includes(house(arudha, V.sign[id])) && mal(id));
    add('pr_arudha_kendra_benefic', kb.length > 0 && kb.length >= km.length, 'positive', 1, 'Benefics in kendras from the arudha of the question, at least as many as malefics.', 'प्रश्न आरूढ़ से केंद्रों में शुभ ग्रह, पाप ग्रहों से कम नहीं।');
    add('pr_arudha_kendra_malefic', km.length > kb.length, 'negative', -1, 'More malefics than benefics in kendras from the arudha of the question.', 'प्रश्न आरूढ़ से केंद्रों में शुभ ग्रहों से अधिक पाप ग्रह।');
    if (kpRes) {
      const ev = kpRes.events.find(e => e.id === Q_KP[qtype]);
      if (ev && ev.kind !== 'sensitive') { add('pr_kp_csl_promise', ev.verdict === 'promised', 'positive', 2, 'KP: ' + ev.text.en, 'केपी: ' + ev.text.hi); add('pr_kp_csl_denial', ev.verdict === 'denied', 'negative', -2, 'KP: ' + ev.text.en, 'केपी: ' + ev.text.hi); }
    }
    const score = rules.reduce((t, r) => t + r.weight, 0);
    const maxPositive = rules.reduce((t, r) => t + Math.max(0, r.maxWeight), 0), maxNegative = rules.reduce((t, r) => t + Math.min(0, r.maxWeight), 0);
    const scale = (maxPositive - maxNegative) / 2 || 1, normalised = r4(score / scale);
    for (const r of rules) delete r.maxWeight;
    return { rules, score: r2(score), maxPositive, maxNegative, normalisedScore: normalised, band: PRASHNA_BAND,
      verdict: normalised >= PRASHNA_BAND ? 'likely_yes' : normalised <= -PRASHNA_BAND ? 'likely_no' : 'mixed', lagnaLord: LL, karyaLord: KL };
  }
  // all question types for one moment (one chart): used by the calibration test and available to tools
  function prashnaAll(input, opts) {
    opts = opts || {};
    const inp = input && input.date ? input : momentInput((input && input.place) || opts.place, input && input.when !== undefined ? input.when : opts.when, 'Prashna');
    const C = JE.chart(inp, Object.assign({ dashaLevels: 1 }, opts.chartOpts || {}, typeof inp.place.tz === 'number' ? { tzMode: inp.place.tz } : {}));
    const V = vChart(C), kpRes = opts.kp ? kp(C, { ayanamsa: opts.kpAyanamsa }) : null, arudha = bhavaArudhas(ctxOf(C), C.asc.sign).A1.sign, out = {};
    for (const q of Object.keys(Q_HOUSE)) out[q] = prashnaRules(C, V, C.asc.sign, Q_HOUSE[q], kpRes, q, arudha);
    return out;
  }
  function prashna(input, opts) {
    opts = opts || {};
    const t0 = hrnow(), qreq = Q_ALIAS[opts.question] || opts.question, qtype = Q_HOUSE[qreq] ? qreq : 'general', kh = opts.karyaHouse || Q_HOUSE[qtype];
    const inp = input && input.date ? input : momentInput((input && input.place) || opts.place, input && input.when !== undefined ? input.when : opts.when, 'Prashna');
    const C = JE.chart(inp, Object.assign({ dashaLevels: 2 }, opts.chartOpts || {}, typeof inp.place.tz === 'number' ? { tzMode: inp.place.tz } : {}));
    const V = vChart(C);
    const kpRes = opts.kp === false ? null : kp(C, { ayanamsa: opts.kpAyanamsa });
    const jf = bhavaArudhas(ctxOf(C), C.asc.sign), arudha = opts.arudhaSign !== undefined ? sgn(+opts.arudhaSign) : jf.A1.sign;
    const main = prashnaRules(C, V, C.asc.sign, kh, kpRes, qtype, arudha);
    const out = { chart: C, question: qtype, karyaHouse: kh, arudha, moment: { jdUT: C.meta.jdUT, iso: C.meta.localISO }, analysis: main,
      note: T('Traditional horary indicators only: each rule adds or subtracts weight, positive and negative indicators are balanced in pairs, and the score is normalised by the total weight that could apply; a normalised score of +' + PRASHNA_BAND + ' or more reads "likely yes", −' + PRASHNA_BAND + ' or less "likely no", anything between "mixed". A reading aid, not a certainty.', 'केवल पारंपरिक प्रश्न-संकेत: शुभ और अशुभ संकेत जोड़ों में संतुलित हैं और अंक कुल संभावित भार से सामान्यीकृत है; +' + PRASHNA_BAND + ' या अधिक "संभवतः हाँ", −' + PRASHNA_BAND + ' या कम "संभवतः नहीं", बीच में "मिश्रित"। पढ़ने में सहायक, निश्चितता नहीं।') };
    if (opts.vedicNumber !== undefined) {
      const n = Math.round(+opts.vedicNumber); if (!(n >= 1 && n <= 108)) throw new Error('Vedic number must be 1-108');
      const lon = (n - 1) * (10 / 3), s = signOf(lon + 1e-9), nv = JE.vargaSign(lon + 1e-6, 9);
      out.vedicNumber = { number: n, lagnaLon: lon, sign: s, navamsaSign: nv, nakshatra: Math.floor((lon + 1e-9) / NAK), pada: Math.floor(((lon + 1e-9) % NAK) / PADA) + 1, analysis: prashnaRules(C, V, s, kh, null, qtype, arudha),
        rule: T('Number 1-108 = one navamsa (pada) of the zodiac from Aries 0°; its sign is used as the prashna lagna.', 'संख्या 1-108 = मेष 0° से एक नवांश (पाद); उसकी राशि प्रश्न लग्न।') };
    }
    if (opts.kpNumber !== undefined) out.kpHorary = kpHorary(opts.kpNumber, inp, { ayanamsa: opts.kpAyanamsa });
    out.computeMs = Math.round(hrnow() - t0);
    return out;
  }

  /* ==================================================================
     9. Rectification helpers (a helper, never a certainty)
     ================================================================== */
  const EVENT_RULES = {
    marriage: { houses: [7, 2, 11], karaka: ['Ve', 'Ju'] }, child_birth: { houses: [5, 9, 11], karaka: ['Ju'] }, job_start: { houses: [10, 6, 2, 11], karaka: ['Sa', 'Su'] },
    promotion: { houses: [10, 11, 2], karaka: ['Su', 'Ju'] }, job_loss: { houses: [12, 8, 5], karaka: ['Sa'] }, business_start: { houses: [7, 10, 11], karaka: ['Me'] },
    education_start: { houses: [4, 5, 9], karaka: ['Me', 'Ju'] }, graduation: { houses: [4, 9, 11], karaka: ['Ju', 'Me'] }, relocation: { houses: [4, 12, 3], karaka: ['Mo'] },
    foreign_travel: { houses: [9, 12, 3], karaka: ['Ra'] }, property: { houses: [4, 11, 2], karaka: ['Ma', 'Ve'] }, vehicle: { houses: [4, 11], karaka: ['Ve'] },
    father_death: { houses: [10, 3, 9], karaka: ['Su', 'Sa'] }, mother_death: { houses: [5, 11, 4], karaka: ['Mo', 'Sa'] }, spouse_death: { houses: [8, 2, 7], karaka: ['Ve', 'Sa'] },
    accident: { houses: [8, 6, 12], karaka: ['Ma', 'Ra'] }, illness: { houses: [6, 8, 12], karaka: ['Sa'] }, surgery: { houses: [8, 6], karaka: ['Ma'] },
    divorce: { houses: [6, 12, 1], karaka: ['Ve', 'Ra'] }, sibling_birth: { houses: [3, 11], karaka: ['Ma'] }, spiritual: { houses: [9, 12, 5], karaka: ['Ke', 'Ju'] }
  };
  function vimPathFast(moonLon, birthJd, jdE, yd, depth) {
    const nk = Math.floor(moonLon / NAK), frac = (moonLon - nk * NAK) / NAK, l0 = DASHA_ORDER.indexOf(DASHA_ORDER[nk % 9]);
    let start = birthJd - frac * VIM_YEARS[DASHA_ORDER[l0]] * yd, i0 = l0, span = 120; const out = [];
    for (let lev = 0; lev < depth; lev++) {
      let t = start, found = false;
      for (let k = 0; k < 9; k++) {
        const L = DASHA_ORDER[(i0 + k) % 9], y = span * VIM_YEARS[L] / 120;
        if (jdE < t + y * yd || k === 8) { out.push(L); start = t; i0 = (i0 + k) % 9; span = y; found = true; break; }
        t += y * yd;
      }
      if (!found) break;
    }
    return out;
  }
  function timeBand(input, opts) {
    opts = opts || {};
    const C = input.meta ? input : JE.chart(input, opts.chartOpts || {}), place = C.meta.input.place, lat = +place.lat, lon = +place.lon, ay = C.meta.ayanamsaId, off = C.meta.utcOffsetUsed;
    const W = (opts.windowMinutes || (opts.hours || 2) * 60) / 1440, j0 = C.meta.jdUT - W, j1 = C.meta.jdUT + W;
    const ascF = j => JE.ascSid(j, lat, lon, ay), moonF = j => JE.positionsAt(j, ay, C.meta.nodeType, ['Mo']).pos.Mo.lon;
    const kinds = {
      lagna: j => signOf(ascF(j)), D9: j => JE.vargaSign(ascF(j), 9), D10: j => JE.vargaSign(ascF(j), 10), D12: j => JE.vargaSign(ascF(j), 12), D60: j => JE.vargaSign(ascF(j), 60),
      moon_nakshatra: j => Math.floor(moonF(j) / NAK), moon_pada: j => Math.floor(moonF(j) / PADA),
      kunda: j => { const k = Math.floor(norm(ascF(j) * 81) / NAK) % 9, m = Math.floor(moonF(j) / NAK) % 9; return k === m ? 1 : 0; }
    };
    const out = [], step = { lagna: 0.5, D9: 0.5, D10: 0.5, D12: 0.5, D60: 0.25, moon_nakshatra: 10, moon_pada: 10, kunda: 0.25 };
    for (const kind of (opts.kinds || Object.keys(kinds))) {
      const f = kinds[kind], st = step[kind] / 1440; let t = j0, v = f(t);
      while (t < j1) {
        const t2 = Math.min(j1, t + st), v2 = f(t2);
        if (v2 !== v) { let a = t, b = t2; for (let i = 0; i < 20 && (b - a) > 0.5 / 86400; i++) { const m = (a + b) / 2; if (f(m) === v) a = m; else b = m; } const jt = (a + b) / 2; out.push({ kind, jdUT: jt, iso: JE.isoLocal(jt, off, true), from: v, to: v2, minutesFromBirth: Math.round((jt - C.meta.jdUT) * 14400) / 10 }); }
        t = t2; v = v2;
      }
    }
    out.sort((a, b) => a.jdUT - b.jdUT);
    const kundaWindows = []; let open = null;
    for (const e of out.filter(e => e.kind === 'kunda')) { if (e.to === 1) open = e.jdUT; else if (open !== null) { kundaWindows.push({ start: open, end: e.jdUT, startISO: JE.isoLocal(open, off, true), endISO: JE.isoLocal(e.jdUT, off, true) }); open = null; } }
    return { from: j0, to: j1, boundaries: out.filter(e => e.kind !== 'kunda'), kundaWindows, kundaChanges: out.filter(e => e.kind === 'kunda').length,
      lagnaStable: (() => { const lb = out.filter(e => e.kind === 'lagna'), b = lb.filter(e => e.jdUT <= C.meta.jdUT).pop(), a = lb.find(e => e.jdUT > C.meta.jdUT); return { from: b ? b.iso : null, to: a ? a.iso : null }; })() };
  }
  function rectPrepare(input, events, opts) {
    opts = opts || {};
    const C = JE.chart(input, Object.assign({ dashaLevels: 2 }, opts.chartOpts || {})), place = C.meta.input.place, lat = +place.lat, lon = +place.lon;
    const ay = C.meta.ayanamsaId, yd = C.meta.options.dashaYear, off = C.meta.utcOffsetUsed, node = C.meta.nodeType;
    const step = (opts.stepMinutes || 2) / 1440, W = (opts.windowMinutes || 120) / 1440, n = Math.round(W / step);
    const sign = {}; for (const p of C.planets) sign[p.id] = p.sign;
    const sunrise = C.panchang.sunrise, sunLon = C.planets.find(p => p.id === 'Su').lon, raLon = C.planets.find(p => p.id === 'Ra').lon;
    const cands = []; for (let k = -n; k <= n; k++) cands.push(C.meta.jdUT + k * step);
    const S = { C, lat, lon, ay, yd, off, node, sign, ev: [], sunrise, sunLon, raLon, cands, charaCache: {}, input, opts };
    S.ev = rectEvents(S, events);
    return S;
  }
  function rectEvents(S, events) { // event dates -> JD (local noon) and the Jupiter/Saturn signs then
    return (events || []).filter(e => e && EVENT_RULES[e.type] && e.date).map(e => {
      const jd = JE.julianDay(+e.date.slice(0, 4), +e.date.slice(5, 7), +e.date.slice(8, 10), 12 - S.off);
      const tp = JE.positionsAt(jd, S.ay, S.node, ['Ju', 'Sa']).pos; return Object.assign({}, e, { jd, ju: signOf(tp.Ju.lon), sa: signOf(tp.Sa.lon), weight: e.weight || 1 });
    });
  }
  function rectCand(S, jd) { // per-candidate data (lagna, Moon, Chara periods, Kunda, Pranapada), cached so several event sets can be scored
    S.candCache = S.candCache || {};
    if (S.candCache[jd]) return S.candCache[jd];
    const asc = JE.ascSid(jd, S.lat, S.lon, S.ay), aS = signOf(asc), moon = JE.positionsAt(jd, S.ay, S.node, ['Mo']).pos.Mo.lon;
    const sg = Object.assign({}, S.sign, { Mo: signOf(moon) });
    let chara = S.charaCache[aS];
    if (!chara) {
      const tm = JE.isoLocal(jd, S.off, true); const inp = Object.assign({}, S.C.meta.input, { date: tm.slice(0, 10), time: tm.slice(11, 19) });
      chara = S.charaCache[aS] = JE.chart(inp, Object.assign({ dashaLevels: 1 }, S.opts.chartOpts || {}, { tzMode: S.off })).dashas.chara.periods;
    }
    const kundaNak = Math.floor(norm(asc * 81) / NAK), moonNak = Math.floor(moon / NAK), kunda = kundaNak % 9 === moonNak % 9;
    const vig = (jd - S.sunrise) * 86400 / 24, sS = signOf(S.sunLon), prana = norm(S.sunLon + vig * 2 + (isMov(sS) ? 0 : isFix(sS) ? 240 : 120)), ph = house(aS, signOf(prana));
    const bb = norm(S.raLon + norm(moon - S.raLon) / 2);
    const bonus = (kunda ? (kundaNak === moonNak ? 0.6 : 0.4) : 0) + ([1, 5, 9].includes(ph) ? 0.4 : [2, 6, 8, 12].includes(ph) ? -0.3 : 0);
    return (S.candCache[jd] = { jd, asc, aS, moon, sg, chara, kundaNak, moonNak, kunda, prana, ph, bb, bonus });
  }
  function rectEventScore(S, K, e) {
    const aS = K.aS, sg = K.sg, hOf = id => house(aS, sg[id]), owns = (id, h) => SIGN_LORD[sgn(aS + h - 1)] === id;
    const R = EVENT_RULES[e.type], rel = L => R.houses.some(h => owns(L, h) || hOf(L) === h) || R.karaka.includes(L);
    const vp = vimPathFast(K.moon, K.jd, e.jd, S.yd, 3), vpts = vp.reduce((t, L, i) => t + (rel(L) ? [1, 2, 3][i] : 0), 0);
    const md = K.chara.find(p => e.jd >= p.start && e.jd < p.end), ad = md && md.children.find(p => e.jd >= p.start && e.jd < p.end);
    const crel = z => z !== undefined && (R.houses.includes(house(aS, z)) || R.karaka.some(k => sg[k] === z));
    const cpts = (md && crel(md.sign) ? 1 : 0) + (ad && crel(ad.sign) ? 2 : 0);
    const tgt = sgn(aS + R.houses[0] - 1), tl = sgn(sg[SIGN_LORD[tgt]]);
    const saOn = z => [1, 3, 7, 10].includes(house(e.sa, z)), juOn = z => [1, 5, 7, 9].includes(house(e.ju, z));
    const tpts = ((saOn(tgt) || saOn(tl)) ? 1 : 0) + ((juOn(tgt) || juOn(tl)) ? 1 : 0);
    const sc = (vpts / 6 * 3 + cpts / 3 * 1.5 + (tpts === 2 ? 1 : tpts * 0.3)) * e.weight;
    return { sc, vp, vpts, md, ad, cpts, tpts };
  }
  function rectScore(S, jd, evs) {
    const K = rectCand(S, jd);
    let total = 0; const details = [];
    for (const e of (evs || S.ev)) {
      const r = rectEventScore(S, K, e);
      total += r.sc; details.push({ type: e.type, date: e.date, vimshottari: r.vp, vimPoints: r.vpts, chara: r.md ? [r.md.sign, r.ad ? r.ad.sign : null] : null, charaPoints: r.cpts, transitPoints: r.tpts, score: r2(r.sc) });
    }
    total += K.bonus;
    return { jdUT: jd, iso: JE.isoLocal(jd, S.off, true), minutesFromInput: Math.round((jd - S.C.meta.jdUT) * 1440 * 10) / 10, score: r2(total), lagna: K.aS, ascLon: r4(K.asc),
      d9: JE.vargaSign(K.asc, 9), d10: JE.vargaSign(K.asc, 10), moonNakshatra: K.moonNak, moonPada: Math.floor(K.moon / PADA) % 4 + 1,
      kunda: { lon: r4(norm(K.asc * 81)), nakshatra: K.kundaNak, matchesMoon: K.kunda }, pranapada: { lon: r4(K.prana), house: K.ph }, bhriguBindu: { lon: r4(K.bb), sign: signOf(K.bb) }, events: details };
  }
  // quick total only (for the random-event baseline)
  function rectTotal(S, jd, evs) { const K = rectCand(S, jd); let t = K.bonus; for (const e of evs) t += rectEventScore(S, K, e).sc; return t; }
  const median = arr => { const a = arr.slice().sort((p, q) => p - q), n = a.length; return n ? (n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2) : 0; };
  // peak prominence of a score curve: best minus median (how far the best time stands out of the window)
  const prominence = vals => Math.max(...vals) - median(vals);
  // Confidence of a rectification run (never a certainty): the prominence of the real events' best score is compared with the
  // prominence obtained from opts.randomSets sets of random dates for the same event types (seeded, reproducible). The margin is the
  // best score minus the best score more than opts.clusterMinutes away from it (a rival time); flatness = (max - min) / max.
  function rectConfidence(S, scored, opts) {
    const K = Math.max(0, opts.randomSets === undefined ? 24 : +opts.randomSets), ev = S.ev, vals = scored.map(c => c.score);
    const best = scored.reduce((p, c) => c.score > p.score ? c : p, scored[0]), clusterM = opts.clusterMinutes || 15;
    const rival = scored.filter(c => Math.abs(c.minutesFromInput - best.minutesFromInput) > clusterM).reduce((m, c) => Math.max(m, c.score), -Infinity);
    const prom = prominence(vals), mx = Math.max(...vals), mn = Math.min(...vals);
    const base = { prominence: r2(prom), margin: r2(isFinite(rival) ? best.score - rival : 0), flatness: r4(mx > 0 ? (mx - mn) / mx : 0), randomSets: K, clusterMinutes: clusterM };
    if (!ev.length || !K) return Object.assign(base, { level: 'none', noClearWinner: true, baselineMean: null, baselineSd: null, z: null, percentile: null });
    // reproducible random dates: uniform between 1 year after birth and 5 years after the latest event (at least 40 years of life)
    let seed = (Math.floor(S.C.meta.jdUT * 1000) % 2147483646) + 1;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const j0 = S.C.meta.jdUT + 365.25, j1 = Math.max(S.C.meta.jdUT + 40 * 365.25, Math.max(...ev.map(e => e.jd)) + 5 * 365.25);
    const proms = [];
    for (let k = 0; k < K; k++) {
      const rev = ev.map(e => { const jd = j0 + rnd() * (j1 - j0), tp = JE.positionsAt(jd, S.ay, S.node, ['Ju', 'Sa']).pos; return { type: e.type, jd, ju: signOf(tp.Ju.lon), sa: signOf(tp.Sa.lon), weight: e.weight }; });
      proms.push(prominence(S.cands.map(j => rectTotal(S, j, rev))));
    }
    const mean = proms.reduce((p, q) => p + q, 0) / K, sd = Math.sqrt(proms.reduce((p, q) => p + (q - mean) * (q - mean), 0) / Math.max(1, K - 1)) || 1e-9;
    const z = (prom - mean) / sd, pct = proms.filter(p => p < prom).length / K;
    const marginOk = base.margin >= 0.5 * sd; // the best time must also beat its nearest rival outside the cluster
    const level = z >= 2 && pct >= 0.95 && marginOk ? 'high' : z >= 1 && pct >= 0.8 ? 'moderate' : 'low';
    return Object.assign(base, { level, noClearWinner: level === 'low', baselineMean: r2(mean), baselineSd: r2(sd), z: r2(z), percentile: r2(pct) });
  }
  function rectFinish(S, scored, t0) {
    const sorted = scored.slice().sort((a, b) => b.score - a.score || Math.abs(a.minutesFromInput) - Math.abs(b.minutesFromInput));
    const top = sorted.slice(0, S.opts.top || 10).map((c, i) => Object.assign({ rank: i + 1 }, c, {
      explanation: T('Score ' + c.score + ': ' + c.events.map(e => e.type + ' ' + e.date + ' (Vimshottari ' + e.vimshottari.join('-') + ', ' + e.vimPoints + '/6; Chara ' + e.charaPoints + '/3; transit ' + e.transitPoints + '/2)').join('; ') + (c.kunda.matchesMoon ? '; Kunda agrees with the Moon\'s nakshatra' : '') + '; Pranapada in house ' + c.pranapada.house + '.',
        'अंक ' + c.score + ': घटनाओं का विंशोत्तरी, चर दशा और गोचर से मेल' + (c.kunda.matchesMoon ? '; कुंड चंद्र नक्षत्र से मेल खाता है' : '') + '; प्राणपद ' + c.pranapada.house + 'वें भाव में।') }));
    const conf = rectConfidence(S, scored, S.opts);
    conf.text = conf.level === 'high' ? T('The best time stands out clearly: its peak is higher than the peaks random dates for the same events give (' + Math.round(conf.percentile * 100) + '% of ' + conf.randomSets + ' random sets). Still a helper, not proof.', 'सर्वश्रेष्ठ समय स्पष्ट रूप से अलग दिखता है: उसका शिखर उन्हीं घटनाओं की यादृच्छिक तिथियों से बने शिखरों से ऊँचा है। फिर भी केवल सहायक, प्रमाण नहीं।')
      : conf.level === 'moderate' ? T('The best time stands out somewhat compared with random dates for the same events; treat the ranking as a suggestion and check it with more events.', 'सर्वश्रेष्ठ समय यादृच्छिक तिथियों की तुलना में कुछ अलग दिखता है; क्रम को सुझाव मानें और अधिक घटनाओं से जाँचें।')
        : T('No clear winner: the scores of these events do not stand out from what random dates give, so no time in the window can be preferred. Add more, well-dated events or keep the recorded time.', 'कोई स्पष्ट विजेता नहीं: इन घटनाओं के अंक यादृच्छिक तिथियों से अलग नहीं दिखते, इसलिए खिड़की में किसी समय को वरीयता नहीं दी जा सकती। अधिक, ठीक तिथि वाली घटनाएँ जोड़ें या दर्ज समय रखें।');
    const res = { input: S.C.meta.input, inputJd: S.C.meta.jdUT, candidatesTested: scored.length, stepMinutes: S.opts.stepMinutes || 2, windowMinutes: S.opts.windowMinutes || 120,
      best: top[0] || null, top, confidence: conf, noClearWinner: conf.noClearWinner, curve: scored.map(c => ({ jdUT: c.jdUT, minutes: c.minutesFromInput, score: c.score })), events: S.ev.map(e => ({ type: e.type, date: e.date, weight: e.weight })),
      ignoredEvents: (S.rawEvents || []).filter(e => !e || !EVENT_RULES[e.type] || !e.date).length,
      method: T('Each candidate time (every ' + (S.opts.stepMinutes || 2) + ' min within ±' + (S.opts.windowMinutes || 120) + ' min) is scored: for every event, the Vimshottari mahadasha/antardasha/pratyantardasha lords (1/2/3 points when they own, occupy or signify the event houses from that lagna), the K.N. Rao Chara dasha signs (1/2 points) and the double transit of Jupiter and Saturn on the event house or its lord (up to 1 point); plus small bonuses when the Kunda (lagna × 81) falls in a nakshatra of the Moon\'s lord group and when Pranapada is in a trine from the lagna. Confidence: the peak of the curve (best minus median score) is compared with the peaks that random dates for the same event types give; when it does not stand out, the result is "no clear winner". A helper for comparing times, never a certainty.',
        'हर संभावित समय को अंक: हर घटना के लिए विंशोत्तरी महादशा/अंतर/प्रत्यंतर स्वामी, चर दशा राशियाँ और गुरु-शनि का दोहरा गोचर; साथ में कुंड (लग्न × 81) और प्राणपद की जाँच। विश्वास-स्तर: वक्र का शिखर उन्हीं घटनाओं की यादृच्छिक तिथियों से बने शिखरों से तुलना किया जाता है; अलग न दिखे तो "कोई स्पष्ट विजेता नहीं"। केवल तुलना का सहायक, निश्चितता नहीं।'),
      computeMs: Math.round(hrnow() - t0) };
    if (S.opts.bands !== false) res.timeBand = timeBand(S.C, { windowMinutes: S.opts.windowMinutes || 120 });
    return res;
  }
  function rectify(input, events, opts) {
    const t0 = hrnow(), S = rectPrepare(input, events, opts); S.rawEvents = events;
    return rectFinish(S, S.cands.map(j => rectScore(S, j)), t0);
  }
  function rectifyAsync(input, events, opts, onProgress) {
    return new Promise((resolve, reject) => {
      let S; const t0 = hrnow();
      try { S = rectPrepare(input, events, opts); S.rawEvents = events; } catch (e) { reject(e); return; }
      const out = [], N = S.cands.length, chunk = Math.max(5, Math.ceil(N / 40)); let i = 0;
      const tick = () => {
        try {
          const end = Math.min(N, i + chunk); for (; i < end; i++) out.push(rectScore(S, S.cands[i]));
          if (onProgress) onProgress({ done: i, total: N, fraction: i / N });
          if (i < N) setTimeout(tick, 0); else resolve(rectFinish(S, out, t0));
        } catch (e) { reject(e); }
      };
      setTimeout(tick, 0);
    });
  }

  /* ==================================================================
     10. Dispatcher and exports
     ================================================================== */
  const SYSTEMS = {
    vimshottari: 'nakshatra', ashtottari: 'nakshatra', yogini: 'nakshatra', shodashottari: 'nakshatra', dwadashottari: 'nakshatra', panchottari: 'nakshatra', shatabdika: 'nakshatra',
    chaturashiti_sama: 'nakshatra', dwisaptati_sama: 'nakshatra', shashtihayani: 'nakshatra', shattrimsha_sama: 'nakshatra', tara: 'graha', tithi_ashtottari: 'nakshatra', kalachakra: 'nakshatra',
    moola: 'graha', chara: 'rashi', narayana: 'rashi', sudasa: 'rashi', drig: 'rashi', sthira: 'rashi', navamsa: 'rashi', shoola: 'rashi', mudda: 'annual', patyayini: 'annual'
  };
  // wrap a Phase 1 period list (vimshottari tree / yogini / ashtottari periods) in the common shape
  function phase1(x, system, o) {
    const C = x.C, d = C.dashas[system];
    if (system === 'vimshottari') {
      const v = (o.yd !== d.yearDays || o.levels !== 5) ? null : d;
      const tree = v ? d.tree : (() => { // recompute with the requested year / levels
        const ord = DASHA_ORDER, kids = p => { const i0 = ord.indexOf(p.lord), list = []; for (let k = 0; k < 9; k++) { const L = ord[(i0 + k) % 9]; list.push([L, VIM_YEARS[L]]); } return splitKids(p, list, false, o.levels, x, o.yd, kids); };
        const moon = x.lon.Mo, nk = Math.floor(moon / NAK), frac = (moon - nk * NAK) / NAK, i0 = nk % 9; let t = x.jd - frac * VIM_YEARS[ord[i0]] * o.yd; const out = [];
        for (let k = 0; k < 9; k++) { const L = ord[(i0 + k) % 9]; out.push(mkNode(L, false, t, VIM_YEARS[L], 1, o.levels, x, o.yd, kids)); t += VIM_YEARS[L] * o.yd; }
        return out;
      })();
      return { kind: 'graha', tree, balanceAtBirth: d.balanceAtBirth, totalYears: 120, note: d.note };
    }
    const tot = system === 'yogini' ? 36 : 108, list = d.periods;
    const yrs = {}; for (const p of list) yrs[p.lord + (p.id ? ':' + p.id : '')] = p.years;
    const seq = list.slice(0, system === 'yogini' ? 8 : 8).map(p => ({ lord: p.lord, id: p.id, years: p.years }));
    const kids = p => { const i0 = seq.findIndex(q => q.lord === p.lord && (!p.yoginiId || q.id === p.yoginiId)), lst = []; for (let k = 0; k < seq.length; k++) { const q = seq[(i0 + k) % seq.length]; lst.push([q.lord, q.years, q.id ? { yoginiId: q.id } : null]); } return splitKids(p, lst, false, o.levels, x, d.yearDays, kids); };
    const tree = list.map(p => mkNode(p.lord, false, p.start, p.years, 1, o.levels, x, d.yearDays, kids, p.id ? { yoginiId: p.id } : null));
    return { kind: 'graha', tree, balanceAtBirth: Object.assign({}, d.balanceAtBirth, { totalYears: d.balanceAtBirth.totalYears !== undefined ? d.balanceAtBirth.totalYears : d.balanceAtBirth.years }), totalYears: tot, note: d.note, applicable: d.applicable, applicability: d.applicability };
  }
  function dashas(C, system, opts) {
    opts = opts || {};
    const t0 = hrnow(), x = ctxOf(C);
    if (!SYSTEMS[system]) throw new Error('unknown dasha system ' + system + ' (known: ' + Object.keys(SYSTEMS).join(', ') + ')');
    let yd = x.yd; if (opts.dashaYear !== undefined) { const m = { julian: 365.25, tropical: 365.2422, sidereal: 365.2564, savana: 360 }; yd = m[opts.dashaYear] || (+opts.dashaYear >= 350 && +opts.dashaYear <= 370 ? +opts.dashaYear : x.yd); }
    const o = Object.assign({}, opts, { yd, levels: Math.max(1, Math.min(5, opts.levels || 3)) });
    let r;
    switch (system) {
      case 'vimshottari': case 'yogini': case 'ashtottari': r = phase1(x, system, o); break;
      case 'tara': r = taraDasha(x, o); break;
      case 'tithi_ashtottari': r = tithiAshtottari(x, o); break;
      case 'kalachakra': r = kalachakra(x, o); break;
      case 'moola': r = o.variant === 'rasi' ? moolaRasi(x, o) : moolaGraha(x, o); break;
      case 'chara': r = charaTree(x, o); break;
      case 'narayana': r = narayana(x, o); break;
      case 'sudasa': r = sudasa(x, o); break;
      case 'drig': r = drig(x, o); break;
      case 'sthira': r = sthira(x, o); break;
      case 'navamsa': r = navamsaDasha(x, o); break;
      case 'shoola': r = shoola(x, o); break;
      case 'mudda': case 'patyayini': { const v = varshaphal(C, opts.age !== undefined ? +opts.age : opts.year, Object.assign({}, opts, { months: false })); r = Object.assign({ kind: 'graha', varsha: { age: v.age, solarReturn: v.solarReturn } }, v.dashas[system]); break; }
      default: r = nakDasha(x, system, o);
    }
    const app = applicabilityOf(x, system);
    const res = Object.assign({ system, group: SYSTEMS[system], yearDays: r.yearDays || (system === 'chara' ? C.dashas.chara.yearDays : yd), levels: o.levels }, r);
    res.applicability = Object.assign({ id: system }, app, r.applicability ? { detail: r.applicability } : {});
    res.current = dashaPath(res.tree, opts.at || (Date.now() / 86400000 + 2440587.5), o.levels);
    res.computeMs = Math.round((hrnow() - t0) * 100) / 100;
    return res;
  }
  function allDashas(C, opts) { const out = {}; for (const s of Object.keys(SYSTEMS)) if (SYSTEMS[s] !== 'annual') out[s] = dashas(C, s, opts); return out; }

  Object.assign(JE, {
    VERSION3: '3.1.0', kpEventRules: kpEventRulesPublic(), dashaOptionLabels: { antardasha: ANTARDASHA_LABELS }, dashas, allDashas, dashaPath, dashaSystems: Object.assign({}, SYSTEMS), jaiminiFull, kp, kpRulingPlanets: rulingPlanetsAt, kpHorary, varshaphal, lalKitab, prashna,
    rectify, rectifyAsync, timeBand, momentInput,
    _p3: { strongerPlanet: (C, a, b) => strongerPlanet(ctxOf(C), a, b), strongerRasi: (C, a, b) => strongerRasiWhy(ctxOf(C), a, b), lordOf: (C, s) => lordOf(ctxOf(C), s), narYears: (C, s) => narYears(ctxOf(C), s),
      KP249, KP_EVENTS, KP_VERDICTS, LK_TABLE, LK_PAKKA, LK_KARAKA_HOUSES, LK_HOUSE_KARAKA, ANTARDASHA_LABELS, brahmaOf: (C, mode) => brahmaOf(ctxOf(C), mode), LK_RIN, LK_MASNUI, SAHAM_DEF, KC_SEQ, KC_YEARS, NAK_DASHAS, TARA_ORDER, EVENT_RULES, DEEPTAMSHA, HADDA, TRI_DAY, TRI_NIGHT,
      solarReturn, panchaVargiya, harshaBala, annualCore, prashnaAll, PRASHNA_BAND, Q_HOUSE, patyayiniItems, vFromPositions: pos => { const V = { lon: {}, sign: {}, speed: {}, retro: {}, combust: {} }; for (const k in pos) if (k !== "La") { V.lon[k] = pos[k]; V.sign[k] = signOf(pos[k]); V.speed[k] = 0; V.retro[k] = false; V.combust[k] = false; } V.asc = pos.La; V.ascS = signOf(pos.La); return V; }, tajikaPair: (C, a, b) => tajikaPair(vChart(C), a, b), sahams: (C, night, rule) => sahams(vChart(C), night, rule), lkAnalyse, vimPathFast, rectPrepare, rectScore, rectEvents, rectConfidence, rashiAspects, SIGN_KEYS }
  });
})((function () { // the JE of engine.js/engine2.js: a global in browsers, require('./engine2.js') in node
  let g; try { g = JE; } catch (e) { g = undefined; }
  if (g === undefined && typeof require !== 'undefined') g = require('./engine2.js');
  return g;
})());
if (typeof module !== 'undefined' && typeof require !== 'undefined') module.exports = require('./engine2.js');

;
/* Kundli Studio — calculation engine, Phase 4 (src/engine4.js)
   Extends the global JE (engine.js + engine2.js + engine3.js) with:
     JE.synthesis(chart, opts)        "Strongest themes": where most traditional indicator families agree
     JE.lifeTimeline(chart, opts)     time windows where several independent classical timing methods converge
     JE.similarCharts(chart, library) famous charts that share the most meaningful factors
     JE.synthesisText(item, JC, lang) fills the bilingual factor templates of content4.js (JC.synth.tests / JC.tl.tests)
   HONESTY: everything here measures AGREEMENT between traditional rules, never a probability that a statement is true.
   Astrology is a traditional belief system; nothing here is science, prediction or advice.

   ---------------------------------------------------------------------------------------------------------
   1. SYNTHESIS — method
   Each theme (≈55 natal statements + 8 "current period" statements) has a SIGNATURE: the planets (karakas),
   elements, modalities, signs, houses, ganas, yogas, divisional chart and KP event that the classical texts
   associate with it, plus the opposite signature (things that point the other way). Indicator FAMILIES then
   test the chart against that signature. Correlated indicators sit in the same family (e.g. the lagna sign and the
   lagna lord are both "lagna"), and each family casts ONE vote (+1 agree, −1 disagree, 0 neutral) when its net score
   reaches ±1. Consensus = number of families agreeing, out of the families that can speak on the theme.
   Families and their classical basis (whole-sign houses from the lagna; graha drishti by sign):
     lagna      lagna sign (element, modality, sign), lagna lord's identity and house, planets in the 1st — BPHS ch. 4, 11 (tanu bhava);
                Saravali / Phaladeepika on the rising sign as the self.
     moon       Moon sign (element/modality), nakshatra lord and gana, planets with the Moon, Moon's house, lunar brightness —
                BPHS ch. 3 (Moon = manas), Phaladeepika ch. 8, nakshatra gana from Muhurta Chintamani / Hora Sara.
     sun        Sun sign, house and conjunctions — BPHS ch. 3 (Sun = atma, vitality, authority).
     jaimini    Atmakaraka, karakamsa sign & occupants, Amatyakaraka for career — Jaimini Sutras 1.1–1.2 (as in JH).
     houses     lords of the relevant houses in kendra/trikona (strong) or 6/8/12 (weakened), planets in the relevant houses,
                stelliums, specific lord placements, KP cuspal sub-lord promise — BPHS ch. 24–25 (bhavesha phala), KP Reader IV.
     yogas      yogas present, weighted by strength and by rarity (common yogas count less) — BPHS ch. 34–41, Phaladeepika ch. 6–7.
     divisional D9 lagna element, the theme's varga (D9/D10/D24/D7/D4/D20) lagna lord, karakas dignified/debilitated there,
                vargottama karakas, planets in the D9 7th — BPHS ch. 6–7 (shodashavarga purposes).
     strength   Shadbala ratio rank (top 2 / bottom 2 of seven), D1 dignity, combustion, Ashtakavarga SAV of the theme houses
                (≥ 30.5 high, ≤ 25.5 low; average is 28) — BPHS ch. 27 (shadbala), ch. 66–72 (ashtakavarga).
     aspects    graha drishti of the theme's karakas (or of the opposing planets) on the theme houses / on the Moon / on a
                specific house; Mars 4/7/8, Jupiter 5/7/9, Saturn 3/7/10, nodes 7th only (conservative), others 7th — BPHS ch. 26.
     balance    element and modality spread of the lagna + seven planets (≥ 3 of 8 in one element, ≥ 4 in one modality) —
                Brihat Jataka ch. 1 (sign natures); traditional synthesis.
     timing     (period themes) Vimshottari MD/AD + Yogini lord: the houses they own/occupy and their karakatwa — BPHS ch. 46–52.
     chara      (period themes) Chara dasha sign (K.N. Rao) and its antardasha sign — Jaimini Sutras 2.
     annual     (period themes) Varshaphal Muntha house and year lord — Tajika Neelakanthi.
     transit    (period themes) Jupiter / Saturn transit house from the lagna — Phaladeepika ch. 26 (gochara).
   Ranking: (agree − disagree) / families-that-speak, ties by total support. Mutually exclusive themes (two poles of
   one axis, duplicates, explicit conflicts) are resolved before ranking: the side with the clearly higher net
   consensus wins; if the two sides are within 2 votes, both are left out. Base rates (how often a theme reaches a
   level in 2,000 random charts) are stored in SYNTH_BASE (tests/test-synthesis.js --write) and give the
   "distinctive" list: high consensus here, low base rate in charts generally.
   Time unknown: lagna/house/varga/yoga/aspect/strength families are switched off (they need the birth time).

   2. LIFE TIMELINE — method (month resolution, birth to age 90)
   For each life area the methods below are tested month by month; a month counts when at least `need` of the
   applicable methods agree; months are merged into windows (gaps ≤ 2 months bridged, windows < 3 months dropped).
     vim      Vimshottari MD and AD (and PD) lords both linked to the area: own/occupy its houses, are its karakas, or rule
              the relevant house of its varga (D9 7th, D10 10th, D7 5th, D24 4th, D4 4th, D20 9th) — BPHS ch. 46–52, Uttara Kalamrita.
     dt       Jupiter AND Saturn both transit or aspect the area's main house or the sign of its lord (K.N. Rao's double transit).
     chara    Chara dasha MD and AD signs both among the area's house signs or the sign holding its Jaimini karaka (DK, AmK, PK, MK, AK).
     av       Jupiter transiting an area house in a sign where its own BAV has ≥ 4 bindus and SAV ≥ 28 — BPHS ch. 66–72.
     varsha   Varshaphal Muntha in an area house, or the year lord strongly linked to the area — Tajika Neelakanthi.
     kp       KP: running MD and AD lords both signify the event's favourable houses and the AD lord's favourable hits ≥ its
              negating hits (KP Reader IV); not used when the event is "denied" for the chart.
     sade     Sade Sati / Dhaiya (needing-care and wellbeing areas only).
     yogini   Yogini dasha lord linked to the area (supporting check).
     gochara  (favourable / care) Jupiter in 2/5/7/9/11 and Saturn in 3/6/11 from the Moon (favourable) — Phaladeepika ch. 26.
   Age gates: no marriage window before 21, no children window before 23; under-18s see only education,
   generally favourable and needing-care periods. Wellbeing windows only ever say "take extra care of rest and health".
   --------------------------------------------------------------------------------------------------------- */
(function (JE) {
  'use strict';
  if (!JE || !JE.chart) throw new Error('engine4.js needs engine.js (global JE) to be loaded first');
  const CN = JE.constants, SL = CN.SIGN_LORD, NM = JE.names;
  const PL7 = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'], PL9 = PL7.concat(['Ra', 'Ke']);
  const ELEM = ['fire', 'earth', 'air', 'water'], MODE = ['movable', 'fixed', 'dual'];
  const SAB = { Ar: 0, Ta: 1, Ge: 2, Cn: 3, Le: 4, Vi: 5, Li: 6, Sc: 7, Sg: 8, Cp: 9, Aq: 10, Pi: 11 };
  const EAB = { fi: 'fire', ea: 'earth', ai: 'air', wa: 'water' }, MAB = { mov: 'movable', fix: 'fixed', dua: 'dual' };
  const sgn = s => ((s % 12) + 12) % 12, norm = a => ((a % 360) + 360) % 360;
  const elemOf = s => ELEM[sgn(s) % 4], modeOf = s => MODE[sgn(s) % 3];
  const KENDRA = [1, 4, 7, 10], TRIKONA = [1, 5, 9], DUSTHANA = [6, 8, 12], GOOD = [1, 4, 5, 7, 9, 10];
  const MALEFIC = ['Su', 'Ma', 'Sa', 'Ra', 'Ke'];
  const uniq = a => a.filter((x, i) => x && a.indexOf(x) === i);
  const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
  const hrnow = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const nowJd = () => Date.now() / 86400000 + 2440587.5;
  const VERSION4 = '4.0.0';

  // graha drishti by sign (offsets from the planet's sign; 0 = conjunction is handled separately)
  const ASP = { Ma: [3, 6, 7], Ju: [4, 6, 8], Sa: [2, 6, 9], Ra: [6], Ke: [6] };
  const aspOff = id => ASP[id] || [6];
  const aspects = (id, from, to) => aspOff(id).includes(sgn(to - from));
  const influences = (id, from, to) => from === to || aspects(id, from, to); // conjunction or aspect

  /* ------------------------------------------------------------------ features (computed once per chart) */
  function feat(C, at) {
    const F = { C, at, tu: !!C.meta.timeUnknown, asc: C.asc.sign, pl: {}, sign: {}, house: {}, d9: C.vargas.D9.planets, d9asc: C.vargas.D9.asc };
    for (const p of C.planets) if (PL9.includes(p.id)) { F.pl[p.id] = p; F.sign[p.id] = p.sign; F.house[p.id] = sgn(p.sign - F.asc) + 1; }
    F.hs = h => sgn(F.asc + h - 1);                        // sign of house h (whole sign)
    F.lord = h => SL[F.hs(h)];
    F.occ = h => PL9.filter(id => F.house[id] === h);
    F.inSign = s => PL9.filter(id => F.sign[id] === s);
    const sb = C.shadbala || {}, ranked = PL7.filter(id => sb[id]).sort((a, b) => sb[b].ratio - sb[a].ratio);
    F.top2 = ranked.slice(0, 2); F.bot2 = ranked.slice(-2); F.ratio = id => sb[id] ? sb[id].ratio : null;
    F.elong = norm(F.pl.Mo.lon - F.pl.Su.lon);
    F.gana = C.avakhada && C.avakhada.gana;
    const k = (C.jaimini && C.jaimini.karakas && (C.jaimini.karakas.used || C.jaimini.karakas)) || {};
    F.AK = k.AK; F.AmK = k.AmK; F.DK = k.DK; F.PK = k.PK; F.MK = k.MK;
    F.kk = F.AK ? F.d9[F.AK] : null; // karakamsa
    F.yog = {}; for (const y of C.yogas || []) if (y.present && y.category !== 'classification') F.yog[y.id] = y;
    F.sav = C.ashtakavarga ? C.ashtakavarga.sav : null; F.bav = C.ashtakavarga ? C.ashtakavarga.bav : null;
    F.dig = id => F.pl[id].dignity;
    F.strongDig = id => ['exalted', 'moolatrikona', 'own'].includes(F.pl[id].dignity);
    F.debil = id => F.pl[id].dignity === 'debilitated';
    F.nbCancelled = id => !!(F.pl[id].neechaBhanga && F.pl[id].neechaBhanga.cancelled);
    F.vsign = (v, id) => C.vargas[v] ? C.vargas[v].planets[id] : null;
    F.vasc = v => C.vargas[v] ? C.vargas[v].asc : null;
    return F;
  }
  const EX = CN.EXALT, OWN = CN.OWN;
  const vDig = (id, s) => { if (s == null || !EX[id]) return null; if (EX[id][0] === s) return 'exalted'; if (sgn(EX[id][0] + 6) === s) return 'debilitated'; if ((OWN[id] || []).includes(s)) return 'own'; return null; };

  /* ------------------------------------------------------------------ theme signatures */
  const parseW = s => { const o = {}; for (const t of (s || '').split(/\s+/).filter(Boolean)) { const [k, w] = t.split(':'); o[k] = w == null ? 1 : +w; } return o; };
  const parseL = (s, map) => (s || '').split(/\s+/).filter(Boolean).map(t => map ? map[t] : +t);
  const THEMES = [];
  function th(id, area, o) {
    const t = { id, area, ax: o.ax || null, pole: o.pole || 0, dup: o.dup || null, conflicts: (o.cf || '').split(/\s+/).filter(Boolean),
      P: parseW(o.P), N: parseW(o.N), E: parseL(o.E, EAB), NE: parseL(o.NE, EAB), M: parseL(o.M, MAB), NM: parseL(o.NM, MAB),
      S: parseL(o.S, SAB), NS: parseL(o.NS, SAB), H: parseL(o.H), NH: parseL(o.NH), G: parseL(o.G, { de: 'deva', ma: 'manushya', ra: 'rakshasa' }), NG: parseL(o.NG, { de: 'deva', ma: 'manushya', ra: 'rakshasa' }),
      Y: parseW(o.Y), NY: parseW(o.NY), V: o.V || 'D9', K: parseW(o.K), X: parseW(o.X), AM: !!o.AM, timing: o.timing || null };
    t.HL = o.HL != null ? parseL(o.HL) : t.H.slice(); t.NHL = parseL(o.NHL);
    THEMES.push(t); return t;
  }
  // temperament
  th('t_leader', 'temperament', { ax: 'lead', pole: 1, P: 'Su:1.5 Ma', N: 'Ve Mo', E: 'fi', NE: 'wa', M: 'mov', NM: 'dua', S: 'Le Ar', H: '1 10', NH: '12 6', G: 'ra', NG: 'de', Y: 'ruchaka kahala:0.7 amala:0.5', cf: 'g_selfworth' });
  th('t_collab', 'temperament', { ax: 'lead', pole: -1, P: 'Ve:1.5 Mo', N: 'Su Ma', E: 'wa', NE: 'fi', M: 'dua', NM: 'mov', S: 'Li Pi', H: '7 11', NH: '1', G: 'de', NG: 'ra', Y: 'malavya:0.7' });
  th('t_extro', 'temperament', { ax: 'social', pole: 1, P: 'Ju Ve Me', N: 'Sa Ke', E: 'fi ai', NE: 'ea wa', M: 'mov', NM: 'fix', H: '3 7 11', NH: '8 12', AM: 1 });
  th('t_intro', 'temperament', { ax: 'social', pole: -1, P: 'Sa Ke', N: 'Ju Ve', E: 'ea wa', NE: 'fi ai', M: 'fix', NM: 'mov', H: '4 8 12', HL: '4', NH: '3 11', AM: 1 });
  th('t_steady', 'temperament', { ax: 'pace', pole: 1, P: 'Sa Ve', N: 'Me Ra', E: 'ea', NE: 'ai', M: 'fix', NM: 'dua', S: 'Ta Sc', H: '2 4', NH: '3', Y: 'shasha', cf: 'g_focus' });
  th('t_quick', 'temperament', { ax: 'pace', pole: -1, P: 'Me Ra Mo:0.5', N: 'Sa', E: 'ai', NE: 'ea', M: 'dua', NM: 'fix', S: 'Ge Sg', H: '3', NH: '4', Y: 'bhadra' });
  th('t_calm', 'temperament', { ax: 'temper', pole: 1, P: 'Ju Mo Ve', N: 'Ma Ra', E: 'wa', NE: 'fi', G: 'de', NG: 'ra', S: 'Cn Pi', H: '4', AM: 1, Y: 'hamsa gajakesari:0.7', X: 'ma_on_moon:-1', cf: 'g_patience' });
  th('t_fiery', 'temperament', { ax: 'temper', pole: -1, dup: 'patience', P: 'Ma Su Ra:0.5', N: 'Ju', E: 'fi', NE: 'wa', G: 'ra', NG: 'de', S: 'Ar Sc', H: '1 3', AM: 1, Y: 'ruchaka:0.7', X: 'ma_on_moon:1', cf: 'st_prudent' });
  // mind & emotions
  th('m_sensitive', 'mind', { ax: 'emo', pole: 1, P: 'Mo Ke Ve:0.5', N: 'Me', E: 'wa', NE: 'ai', S: 'Cn Sc Pi', H: '4 8 12', HL: '4', NH: '3', AM: 1, X: 'mo_with_node:0.5' });
  th('m_rational', 'mind', { ax: 'emo', pole: -1, P: 'Me Sa', N: 'Mo', E: 'ai', NE: 'wa', S: 'Ge Vi Aq', H: '3 6 10', NH: '4', AM: 1, Y: 'bhadra:0.7 budhaditya:0.5' });
  th('m_optimist', 'mind', { ax: 'outlook', pole: 1, P: 'Ju Ve', N: 'Sa Ra', E: 'fi', NE: 'ea', H: '5 9', NH: '8', AM: 1, Y: 'gajakesari sunapha:0.4 anapha:0.4 durudhara:0.4', NY: 'kemadruma', X: 'mo_bright:1 ju_on_moon:1 sa_on_moon:-1' });
  th('m_serious', 'mind', { ax: 'outlook', pole: -1, dup: 'worry', P: 'Sa Ra', N: 'Ju Ve', E: 'ea', NE: 'fi', H: '8 6', HL: '', NH: '5', AM: 1, Y: 'kemadruma', NY: 'gajakesari', X: 'mo_dark:1 sa_on_moon:1 ju_on_moon:-1', cf: 'cr_playful' });
  // communication & learning
  th('c_speaker', 'learning', { ax: 'voice', pole: 1, P: 'Me Ju', N: 'Sa Ke', E: 'ai', NE: 'ea', S: 'Ge Vi', H: '2 3', NH: '12', Y: 'bhadra saraswati sharada:0.7 budhaditya:0.5 chamara:0.7', V: 'D24' });
  th('c_listener', 'learning', { ax: 'voice', pole: -1, P: 'Sa Ke', N: 'Me Ju', E: 'ea', NE: 'ai', S: 'Cp Sc', H: '2 3', HL: '', NHL: '2 3', NY: 'bhadra saraswati', V: 'D24', X: 'me_afflicted:1' });
  th('c_structured', 'learning', { ax: 'lstyle', pole: 1, P: 'Sa Me', N: 'Ra', E: 'ea', NE: 'ai', M: 'fix', NM: 'dua', S: 'Vi Cp', H: '4 5', HL: '4', V: 'D24' });
  th('c_explorer', 'learning', { ax: 'lstyle', pole: -1, P: 'Ra Ju Me:0.5', N: 'Sa', E: 'ai', NE: 'ea', M: 'dua', NM: 'fix', S: 'Ge Sg Aq', H: '9 3 5', HL: '9', V: 'D24' });
  th('c_scholar', 'learning', { ax: 'theory', pole: 1, P: 'Ju Ke Me:0.5', N: 'Ma', E: 'ai', NE: 'ea', S: 'Sg Pi', H: '5 9 8', HL: '5 9', V: 'D24', Y: 'saraswati sharada:0.7 hamsa:0.5' });
  th('c_handson', 'learning', { ax: 'theory', pole: -1, P: 'Ma Sa Su:0.5', N: 'Ke', E: 'ea', NE: 'ai', S: 'Ar Cp Ta', H: '3 6 10', HL: '3 6', V: 'D10', Y: 'ruchaka:0.5' });
  // career & work
  th('k_authority', 'career', { P: 'Su Sa', N: 'Ke', S: 'Le Cp', H: '10 1', HL: '10 1 9', V: 'D10', Y: 'raja_yoga_kendra_trikona dharma_karmadhipati yogakaraka:0.7 amala:0.5 shasha:0.5 neecha_bhanga_raja:0.5 jaimini_raja_ak_amk:0.7', K: 'kp_promotion:1' });
  th('k_enterprise', 'career', { ax: 'employ', pole: 1, P: 'Me Ra Ma', N: 'Sa', M: 'mov', NM: 'fix', S: 'Ge Ar', H: '7 3 11', HL: '7 11', V: 'D10', Y: 'dhana_yoga:0.5 chandra_mangala:0.5', K: 'kp_business:1', X: 'l10_in_7_3_11:1 l10_in_6:-1' });
  th('k_service', 'career', { ax: 'employ', pole: -1, P: 'Sa Mo:0.5', N: 'Ra Ma', M: 'fix', NM: 'mov', S: 'Cp Vi', H: '6 10', HL: '6', V: 'D10', K: 'kp_job:1', X: 'l10_in_6:1 l10_in_7_3_11:-1' });
  th('k_helping', 'career', { ax: 'orient', pole: 1, P: 'Ju Mo Ke:0.5', N: 'Ra', E: 'wa', NE: 'ea', S: 'Pi Cn Sg', H: '6 9 4', HL: '9 6', V: 'D10', Y: 'hamsa:0.7' });
  th('k_technical', 'career', { ax: 'orient', pole: -1, P: 'Me Sa Ra:0.5 Ma:0.5', N: 'Mo', E: 'ea', NE: 'wa', S: 'Vi Aq Cp', H: '6 10 3', HL: '10', V: 'D10' });
  th('k_creative', 'career', { dup: 'creative', P: 'Ve Mo:0.5 Me:0.5', N: 'Sa', S: 'Ta Li Pi', H: '10 5 3', HL: '10 5', V: 'D10', Y: 'malavya kalanidhi:0.7 gandharva:0.7' });
  th('k_slowrise', 'career', { ax: 'rise', pole: 1, P: 'Sa:1.5', N: 'Su Ju', S: 'Cp Aq', H: '10', HL: '', NHL: '10', V: 'D10', Y: 'shasha:0.7', X: 'sa_on_10:1 sa_with_l10:1' });
  th('k_earlyrise', 'career', { ax: 'rise', pole: -1, P: 'Su Ju Ma:0.5', N: 'Sa', S: 'Le Sg', H: '10 1', HL: '10 1', V: 'D10', Y: 'raja_yoga_kendra_trikona:0.7 amala:0.7 ruchaka:0.5', X: 'sa_on_10:-1' });
  th('k_foreign', 'career', { dup: 'away', P: 'Ra Ke:0.5 Mo:0.5', N: 'Sa:0.5', E: 'wa', M: 'mov', S: 'Cn Pi', H: '12 9', HL: '12 9', V: 'D10', K: 'kp_foreign_settlement:1 kp_foreign_travel:0.5', X: 'l12_in_kendra:1', cf: 'f_homebody' });
  // wealth
  th('w_saver', 'wealth', { ax: 'money', pole: 1, P: 'Sa Me Mo:0.5', N: 'Ve Ra', E: 'ea', NE: 'fi', M: 'fix', NM: 'mov', S: 'Ta Cp Vi', H: '2 11', NH: '12', X: 'l12_in_2_11:-1 l2_in_12:-1' });
  th('w_spender', 'wealth', { ax: 'money', pole: -1, P: 'Ve Ju Ra:0.5', N: 'Sa Me:0.5', E: 'fi', NE: 'ea', M: 'mov', NM: 'fix', S: 'Sg Pi Li', H: '12 5', HL: '12', NH: '2', X: 'l12_in_2_11:1 l2_in_12:1' });
  th('w_gains', 'wealth', { P: 'Ju Ve:0.5 Me:0.5', N: 'Ke', S: 'Ta Sg', H: '11 2', HL: '11 2 5 9', V: 'D9', Y: 'dhana_yoga lakshmi maha_bhagya:0.5 vasumati:0.7 chandra_mangala:0.5', NY: 'daridra', K: 'kp_income_gain:1' });
  th('w_property', 'wealth', { P: 'Ma Ve', N: 'Ke Ra:0.5', E: 'ea', M: 'fix', NM: 'dua', S: 'Ta Cn', H: '4', HL: '4', V: 'D4', K: 'kp_property:1 kp_vehicle:0.5', X: 'l4_in_kendra:1' });
  // relationships & marriage
  th('r_devoted', 'relationships', { ax: 'love', pole: 1, P: 'Ve Ju', N: 'Sa Ke Ra', M: 'fix', NM: 'dua', S: 'Ta Le Cn', H: '7', HL: '7', V: 'D9', Y: 'malavya:0.5', X: 'ju_on_7:1 ve_strong:1 ve_afflicted:-1' });
  th('r_space', 'relationships', { ax: 'love', pole: -1, P: 'Sa Ke Ra Su:0.5', N: 'Ve Ju', M: 'dua', NM: 'fix', S: 'Aq Sg Ge', H: '7', HL: '', NHL: '7', V: 'D9', X: 've_afflicted:1 ju_on_7:-1' });
  th('r_romantic', 'relationships', { ax: 'romance', pole: 1, P: 'Ve Mo', N: 'Sa', E: 'wa', NE: 'ea', S: 'Li Pi Ta', H: '5 7', HL: '5', V: 'D9', Y: 'malavya:0.7', X: 'l5_l7_link:1 ve_mo_link:1' });
  th('r_practical', 'relationships', { ax: 'romance', pole: -1, P: 'Sa Me', N: 'Mo', E: 'ea', NE: 'wa', S: 'Vi Cp', H: '7 2', HL: '2', V: 'D9', X: 'sa_on_7:1 ve_mo_link:-1' });
  // family & home
  th('f_homebody', 'family', { ax: 'roots', pole: 1, P: 'Mo Ve Ju:0.5', N: 'Ra Ke', E: 'wa', NE: 'ai', M: 'fix', NM: 'mov', S: 'Cn Ta', H: '4', HL: '4', V: 'D4', K: 'kp_property:0.5', X: 'l4_in_kendra:1 malefic_in_4:-1' });
  th('f_wanderer', 'family', { ax: 'roots', pole: -1, dup: 'away', P: 'Ra Ke Ma:0.5', N: 'Mo', E: 'ai', NE: 'wa', M: 'mov', NM: 'fix', S: 'Sg Ge', H: '3 9 12', HL: '', V: 'D4', X: 'l4_in_3_9_12:1 malefic_in_4:1' });
  th('f_pillar', 'family', { P: 'Sa Ju', N: 'Ra', S: 'Cp Cn', H: '2 4', HL: '2 4', V: 'D4', Y: 'shasha:0.5 hamsa:0.5' });
  // creativity & children
  th('cr_creative', 'creativity', { dup: 'creative', P: 'Ve Mo Me:0.5', N: 'Sa', E: 'wa', NE: 'ea', S: 'Ta Li Pi', H: '5 3', HL: '5 3', V: 'D9', Y: 'malavya kalanidhi gandharva saraswati:0.5' });
  th('cr_mentor', 'creativity', { P: 'Ju:1.5 Mo:0.5', N: 'Ke Sa:0.5', S: 'Sg Pi Cn', H: '5', HL: '5', V: 'D7', K: 'kp_child:1', Y: 'hamsa:0.5', X: 'ju_on_5:1' });
  th('cr_playful', 'creativity', { P: 'Me Mo Ve', N: 'Sa', E: 'ai', NE: 'ea', M: 'dua', NM: 'fix', S: 'Ge Sg Li', H: '5 3', V: 'D9' });
  // spirituality & values
  th('s_spiritual', 'spirit', { ax: 'spirit', pole: 1, P: 'Ju Ke', N: 'Ra Ve:0.5', E: 'wa', NE: 'ea', S: 'Pi Sg Cn', H: '9 12 5', HL: '9 12', V: 'D20', Y: 'hamsa:0.7 pravrajya', X: 'occ_Ke_12:1' });
  th('s_worldly', 'spirit', { ax: 'spirit', pole: -1, P: 'Ra Ve Ma:0.5', N: 'Ke Ju', E: 'ea', NE: 'wa', S: 'Ta Li Cp', H: '10 11 3', HL: '10 11', V: 'D20', NY: 'pravrajya' });
  th('s_principled', 'spirit', { P: 'Ju Su', N: 'Ra', S: 'Sg Le', H: '9', HL: '9 10', V: 'D9', Y: 'hamsa:0.5 dharma_karmadhipati:0.7' });
  th('s_tradition', 'spirit', { ax: 'trad', pole: 1, P: 'Ju Sa Su:0.5', N: 'Ra', E: 'ea', NE: 'ai', M: 'fix', NM: 'mov', S: 'Cp Cn Sg', H: '9 4', V: 'D20' });
  th('s_reformer', 'spirit', { ax: 'trad', pole: -1, P: 'Ra Ma Me:0.5', N: 'Sa', E: 'ai', NE: 'ea', M: 'mov', NM: 'fix', S: 'Aq Ar Ge', H: '11 3', V: 'D20', X: 'occ_Ra_1_9_10:1' });
  // strengths
  th('st_resilient', 'strengths', { P: 'Ma Sa', N: 'Ke:0.5', S: 'Sc Cp', H: '3 6 11', HL: '3 6', Y: 'viparita_harsha:0.7 viparita_sarala:0.7 viparita_vimala:0.7', X: 'upachaya_malefics:1' });
  th('st_charisma', 'strengths', { P: 'Ve Mo Ju', N: 'Sa Ke', S: 'Le Li Ta', H: '1', HL: '1', Y: 'malavya:0.7 hamsa:0.5 shubha_kartari:0.7', NY: 'papa_kartari:0.7', X: 'benefic_on_lagna:1' });
  th('st_organised', 'strengths', { ax: 'method', pole: 1, P: 'Me Sa', N: 'Ra Ma:0.5', E: 'ea', NE: 'fi', M: 'fix', NM: 'mov', S: 'Vi Cp', H: '6', HL: '6', Y: 'bhadra:0.5', cf: 'g_focus' });
  th('st_improviser', 'strengths', { ax: 'method', pole: -1, P: 'Ma Ra Mo:0.5', N: 'Sa', E: 'fi', NE: 'ea', M: 'mov', NM: 'fix', S: 'Ar Ge', H: '3 1' });
  th('st_courage', 'strengths', { ax: 'risk', pole: 1, P: 'Ma Su', N: 'Sa', E: 'fi', NE: 'ea', M: 'mov', NM: 'fix', S: 'Ar Sc Le', H: '3 1', HL: '3', Y: 'ruchaka kahala:0.7' });
  th('st_prudent', 'strengths', { ax: 'risk', pole: -1, P: 'Sa Me', N: 'Ma', E: 'ea', NE: 'fi', M: 'fix', NM: 'mov', S: 'Cp Ta Vi', H: '6 2' });
  // growth areas (gentle)
  th('g_patience', 'growth', { dup: 'patience', P: 'Ma Ra', N: 'Ju Sa:0.5', E: 'fi', NE: 'ea', M: 'mov', NM: 'fix', G: 'ra', NG: 'de', H: '1 7', AM: 1, X: 'ma_on_moon:1', cf: 't_calm st_prudent' });
  th('g_overthink', 'growth', { dup: 'worry', P: 'Sa Ra Ke', N: 'Ju', E: 'wa', NE: 'fi', H: '8 12 6', HL: '', NH: '5 9', AM: 1, X: 'sa_on_moon:1 mo_with_node:1 mo_dark:0.5 me_afflicted:0.5', cf: 'm_optimist' });
  th('g_selfworth', 'growth', { P: 'Sa Ke', N: 'Su Ma', NS: 'Le Ar', H: '12 8 6', HL: '', NH: '1 10', X: 'sun_weak:1 sa_on_sun:1 ll_dusthana:1', cf: 't_leader st_charisma st_courage' });
  th('g_rest', 'growth', { P: 'Sa Su Ma', N: 'Mo', S: 'Cp Vi', H: '10 6', HL: '10', NH: '4 12', X: 'stel_10_6:1' });
  th('g_boundaries', 'growth', { P: 'Mo Ve Ju Ke:0.5', N: 'Sa:0.5', E: 'wa', NE: 'ea', S: 'Pi Li', H: '12', HL: '', X: 'l1_in_12:1' });
  th('g_focus', 'growth', { P: 'Me Ra Mo:0.5', N: 'Sa', E: 'ai', NE: 'ea', M: 'dua', NM: 'fix', S: 'Ge Sg Pi', H: '3', cf: 't_steady st_organised' });
  // current period (timing)
  const TH_TIMING = { tm_career: ['10 11 6', 'Su Sa Me'], tm_learning: ['4 5 9', 'Me Ju'], tm_partner: ['7 11', 'Ve'], tm_home: ['4 2', 'Mo Ve'], tm_inner: ['12 8', 'Ke Ju'], tm_gains: ['11 2', 'Ju Ve'], tm_creative: ['5 3', 'Ve Su'], tm_travel: ['3 9 12', 'Ra Mo'] };
  for (const id in TH_TIMING) th(id, 'timing', { dup: null, timing: { H: parseL(TH_TIMING[id][0]), P: parseW(TH_TIMING[id][1]) } });
  const THEME_BY_ID = Object.fromEntries(THEMES.map(t => [t.id, t]));

  /* ------------------------------------------------------------------ custom tests */
  // each returns null (does not apply) or {params, hl}; fam = the family it votes in
  const P_ = (p, h) => ({ params: p || {}, hl: h || {} });
  function custom(id, F) {
    const C = F.C; let m;
    if ((m = /^l(\d+)_in_([\d_]+)$/.exec(id))) { if (F.tu) return null; const h = +m[1], L = F.lord(h), hs = m[2].split('_').map(Number); return hs.includes(F.house[L]) ? { fam: 'houses', ...P_({ H: [h], P: [L], X: F.house[L] }, { p: [L], h: [h, F.house[L]] }) } : null; }
    if ((m = /^l(\d+)_in_kendra$/.exec(id))) { if (F.tu) return null; const h = +m[1], L = F.lord(h); return KENDRA.includes(F.house[L]) ? { fam: 'houses', ...P_({ H: [h], P: [L], X: F.house[L] }, { p: [L], h: [h, F.house[L]] }) } : null; }
    if ((m = /^occ_(\w\w)_([\d_]+)$/.exec(id))) { if (F.tu) return null; const p = m[1], hs = m[2].split('_').map(Number); return hs.includes(F.house[p]) ? { fam: 'houses', ...P_({ P: [p], H: [F.house[p]] }, { p: [p], h: [F.house[p]] }) } : null; }
    if ((m = /^stel_([\d_]+)$/.exec(id))) { if (F.tu) return null; for (const h of m[1].split('_').map(Number)) { const o = F.occ(h); if (o.length >= 3) return { fam: 'houses', ...P_({ H: [h], P: o }, { p: o, h: [h] }) }; } return null; }
    const mo = F.sign.Mo;
    switch (id) {
      case 'mo_bright': return F.elong >= 90 && F.elong <= 270 ? { fam: 'moon', ...P_({ X: Math.round(F.elong) }, { p: ['Mo'] }) } : null;
      case 'mo_dark': return F.elong < 45 || F.elong > 315 ? { fam: 'moon', ...P_({ X: Math.round(F.elong) }, { p: ['Mo', 'Su'] }) } : null;
      case 'mo_with_node': { const n = ['Ra', 'Ke'].find(x => F.sign[x] === mo); return n ? { fam: 'moon', ...P_({ P: [n] }, { p: ['Mo', n] }) } : null; }
      case 'sa_on_moon': case 'ju_on_moon': case 'ma_on_moon': { const p = { sa_on_moon: 'Sa', ju_on_moon: 'Ju', ma_on_moon: 'Ma' }[id]; return influences(p, F.sign[p], mo) ? { fam: 'aspects', ...P_({ P: [p], T: 'moon' }, { p: [p, 'Mo'] }) } : null; }
      case 'sa_on_sun': return influences('Sa', F.sign.Sa, F.sign.Su) ? { fam: 'aspects', ...P_({ P: ['Sa'], T: 'sun' }, { p: ['Sa', 'Su'] }) } : null;
      case 'sa_on_10': case 'sa_on_7': case 'ju_on_7': case 'ju_on_5': { if (F.tu) return null; const p = id.slice(0, 2) === 'sa' ? 'Sa' : 'Ju', h = +id.split('_')[2]; return influences(p, F.sign[p], F.hs(h)) ? { fam: 'aspects', ...P_({ P: [p], H: [h] }, { p: [p], h: [h] }) } : null; }
      case 'sa_with_l10': { if (F.tu) return null; const L = F.lord(10); return L !== 'Sa' && F.sign.Sa === F.sign[L] ? { fam: 'houses', ...P_({ P: ['Sa', L], H: [10] }, { p: ['Sa', L], h: [10] }) } : null; }
      case 'upachaya_malefics': { if (F.tu) return null; const o = ['Su', 'Ma', 'Sa', 'Ra'].filter(p => [3, 6, 11].includes(F.house[p])); return o.length >= 2 ? { fam: 'houses', ...P_({ P: o, H: [3, 6, 11] }, { p: o, h: [3, 6, 11] }) } : null; }
      case 'benefic_on_lagna': { if (F.tu) return null; const o = ['Ju', 'Ve'].filter(p => influences(p, F.sign[p], F.asc)); return o.length ? { fam: 'aspects', ...P_({ P: o, H: [1] }, { p: o, h: [1] }) } : null; }
      case 'malefic_in_4': { if (F.tu) return null; const o = ['Ma', 'Sa', 'Ra', 'Ke'].filter(p => F.house[p] === 4); return o.length ? { fam: 'houses', ...P_({ P: o, H: [4] }, { p: o, h: [4] }) } : null; }
      case 've_afflicted': { const o = ['Sa', 'Ra', 'Ke'].filter(p => F.sign[p] === F.sign.Ve); return o.length || F.pl.Ve.combust ? { fam: 'strength', ...P_({ P: o.length ? o : ['Su'] }, { p: ['Ve'].concat(o) }) } : null; }
      case 've_strong': return F.strongDig('Ve') || F.top2.includes('Ve') ? { fam: 'strength', ...P_({ P: ['Ve'] }, { p: ['Ve'] }) } : null;
      case 've_mo_link': { const d = sgn(F.sign.Ve - mo); return d === 0 || d === 6 ? { fam: 'moon', ...P_({ P: ['Ve'] }, { p: ['Ve', 'Mo'] }) } : null; }
      case 'l5_l7_link': { if (F.tu) return null; const a = F.lord(5), b = F.lord(7); if (a === b) return null; const sa = F.sign[a], sb = F.sign[b]; const link = sa === sb || sgn(sa - sb) === 6 || (sa === F.hs(7) && sb === F.hs(5)); return link ? { fam: 'houses', ...P_({ P: [a, b], H: [5, 7] }, { p: [a, b], h: [5, 7] }) } : null; }
      case 'sun_weak': return F.debil('Su') || (!F.tu && DUSTHANA.includes(F.house.Su)) ? { fam: 'sun', ...P_({ H: F.tu ? [] : [F.house.Su], X: F.pl.Su.dignity }, { p: ['Su'] }) } : null;
      case 'll_dusthana': { if (F.tu) return null; const L = F.lord(1); return DUSTHANA.includes(F.house[L]) ? { fam: 'lagna', ...P_({ P: [L], H: [F.house[L]] }, { p: [L], h: [1, F.house[L]] }) } : null; }
      case 'me_afflicted': { const o = ['Ra', 'Ke'].filter(p => F.sign[p] === F.sign.Me); return o.length || F.pl.Me.combust || F.debil('Me') ? { fam: 'strength', ...P_({ P: ['Me'] }, { p: ['Me'].concat(o) }) } : null; }
    }
    return null;
  }
  const CUSTOM_TEXT = id => /^l\d+_in_kendra$/.test(id) ? 'cx_lord_kendra' : /^l\d+_in_/.test(id) ? 'cx_lord_in' : /^occ_/.test(id) ? 'cx_occ' : /^stel_/.test(id) ? 'cx_stellium' : /^(sa|ju)_on_\d+$/.test(id) ? 'cx_asp_house' : /_on_moon$/.test(id) ? 'cx_asp_moon' : id === 'sa_on_sun' ? 'cx_asp_sun' : 'cx_' + id;

  /* ------------------------------------------------------------------ family evaluation for one theme */
  const YS = { strong: 1, medium: 0.7, weak: 0.4 }, YR = { rare: 1.2, uncommon: 1, common: 0.75, very_common: 0.5 };
  function evalTheme(t, F, T) {
    const fams = {}, add = (fam, test, w, params, hl) => { if (!w) return; (fams[fam] = fams[fam] || { score: 0, items: [] }); fams[fam].score += w; fams[fam].items.push({ fam, test, w: r2(w), params: params || {}, hl: hl || {} }); };
    const appl = new Set();
    const pw = id => t.P[id] || 0, nw = id => t.N[id] || 0;
    const elemW = s => (t.E.includes(elemOf(s)) ? 1 : 0) - (t.NE.includes(elemOf(s)) ? 1 : 0);
    const modeW = s => (t.M.includes(modeOf(s)) ? 0.5 : 0) - (t.NM.includes(modeOf(s)) ? 0.5 : 0);
    const signW = s => (t.S.includes(s) ? 1 : 0) - (t.NS.includes(s) ? 1 : 0);
    const plW = id => pw(id) - nw(id);
    const hasSig = t.P && (Object.keys(t.P).length || Object.keys(t.N).length);
    if (t.timing) return evalTiming(t, F, T);
    // lagna
    if (!F.tu) {
      appl.add('lagna'); const a = F.asc, L = F.lord(1);
      add('lagna', 'lg_elem', elemW(a), { S: a, E: elemOf(a) }, { h: [1] });
      add('lagna', 'lg_mode', modeW(a), { S: a, M: modeOf(a) }, { h: [1] });
      add('lagna', 'lg_sign', signW(a), { S: a }, { h: [1] });
      add('lagna', 'lg_lord', plW(L), { P: [L] }, { p: [L], h: [1] });
      const lh = F.house[L]; add('lagna', 'lg_lord_house', 0.5 * ((t.H.includes(lh) ? 1 : 0) - (t.NH.includes(lh) ? 1 : 0)), { P: [L], H: [lh] }, { p: [L], h: [1, lh] });
      for (const p of F.occ(1)) add('lagna', 'lg_occ', 0.5 * plW(p), { P: [p] }, { p: [p], h: [1] });
    }
    // moon
    { appl.add('moon'); const mo = F.pl.Mo, s = mo.sign;
      add('moon', 'mo_elem', elemW(s), { S: s, E: elemOf(s) }, { p: ['Mo'] });
      add('moon', 'mo_mode', modeW(s), { S: s, M: modeOf(s) }, { p: ['Mo'] });
      add('moon', 'mo_sign', signW(s), { S: s }, { p: ['Mo'] });
      add('moon', 'mo_naklord', 0.5 * plW(mo.nakLord), { N: mo.nak, P: [mo.nakLord] }, { p: ['Mo', mo.nakLord] });
      if (F.gana) add('moon', 'mo_gana', (t.G.includes(F.gana) ? 1 : 0) - (t.NG.includes(F.gana) ? 1 : 0), { N: mo.nak, G: F.gana }, { p: ['Mo'] });
      for (const p of PL9) if (p !== 'Mo' && F.sign[p] === s) add('moon', 'mo_conj', 0.5 * plW(p), { P: [p] }, { p: ['Mo', p] });
      if (!F.tu) add('moon', 'mo_house', 0.5 * ((t.H.includes(F.house.Mo) ? 1 : 0) - (t.NH.includes(F.house.Mo) ? 1 : 0)), { H: [F.house.Mo] }, { p: ['Mo'], h: [F.house.Mo] });
    }
    // sun
    { appl.add('sun'); const s = F.sign.Su;
      add('sun', 'su_elem', elemW(s), { S: s, E: elemOf(s) }, { p: ['Su'] });
      add('sun', 'su_mode', modeW(s), { S: s, M: modeOf(s) }, { p: ['Su'] });
      add('sun', 'su_sign', signW(s), { S: s }, { p: ['Su'] });
      if (!F.tu) add('sun', 'su_house', 0.5 * ((t.H.includes(F.house.Su) ? 1 : 0) - (t.NH.includes(F.house.Su) ? 1 : 0)), { H: [F.house.Su] }, { p: ['Su'], h: [F.house.Su] });
      for (const p of PL9) if (p !== 'Su' && F.sign[p] === s) add('sun', 'su_conj', 0.5 * plW(p), { P: [p] }, { p: ['Su', p] });
    }
    // jaimini
    if (F.AK) {
      appl.add('jaimini');
      add('jaimini', 'jm_ak', plW(F.AK), { P: [F.AK] }, { p: [F.AK] });
      add('jaimini', 'jm_kk_elem', elemW(F.kk), { S: F.kk, E: elemOf(F.kk) }, { s: [F.kk] });
      for (const p of PL9) if (p !== F.AK && F.d9[p] === F.kk) add('jaimini', 'jm_kk_occ', 0.5 * plW(p), { P: [p], S: F.kk }, { p: [p] });
      if (t.area === 'career' && F.AmK) add('jaimini', 'jm_amk', 0.5 * plW(F.AmK), { P: [F.AmK] }, { p: [F.AmK] });
    }
    // houses
    if (!F.tu) {
      appl.add('houses');
      let lw = 0;
      for (const h of t.HL) { const L = F.lord(h), x = F.house[L]; let w = 0; if (GOOD.includes(x)) w = 0.5; else if (DUSTHANA.includes(x) && !DUSTHANA.includes(h)) w = -0.5; if (w && Math.abs(lw + w) <= 1.5) { lw += w; add('houses', w > 0 ? 'hs_lord_good' : 'hs_lord_dusthana', w, { H: [h], P: [L], X: x }, { p: [L], h: [h, x] }); } }
      for (const h of t.NHL) { const L = F.lord(h), x = F.house[L]; if (GOOD.includes(x)) add('houses', 'hs_lord_good', -0.5, { H: [h], P: [L], X: x }, { p: [L], h: [h, x] }); }
      let ow = 0;
      for (const h of t.H) for (const p of F.occ(h)) { const w = 0.5 * plW(p); if (w && Math.abs(ow + w) <= 1.5) { ow += w; add('houses', 'hs_occ', w, { P: [p], H: [h] }, { p: [p], h: [h] }); } }
      for (const h of t.H) { const o = F.occ(h); if (o.length >= 3) add('houses', 'hs_stellium', 1, { H: [h], P: o }, { p: o, h: [h] }); }
      for (const h of t.NH) { const o = F.occ(h); if (o.length >= 3) add('houses', 'hs_stellium', -1, { H: [h], P: o }, { p: o, h: [h] }); }
      if (T.kp) for (const ev in t.K) { const e = T.kp[ev]; if (!e) continue; const w = e.verdict === 'promised' ? 0.5 : e.verdict === 'denied' ? -0.5 : 0; add('houses', 'hs_kp', w * t.K[ev], { H: [e.cusp], P: [e.cuspalSubLord], Y: ev, X: e.verdict }, { p: [e.cuspalSubLord], h: [e.cusp] }); }
    }
    // yogas
    if (!F.tu && (Object.keys(t.Y).length || Object.keys(t.NY).length)) {
      appl.add('yogas');
      for (const id in t.Y) { const y = F.yog[id]; if (y) add('yogas', 'yg', t.Y[id] * (YS[y.strength] || 0.7) * (YR[y.rarity] || 1), { Y: id, X: y.rarity || '' }, { p: y.planets || [], h: y.houses || [] }); }
      for (const id in t.NY) { const y = F.yog[id]; if (y) add('yogas', 'yg', -t.NY[id] * (YS[y.strength] || 0.7) * (YR[y.rarity] || 1), { Y: id, X: y.rarity || '' }, { p: y.planets || [], h: y.houses || [] }); }
    }
    // divisional
    if (!F.tu) {
      appl.add('divisional');
      const d9a = F.d9asc; add('divisional', 'dv_d9_elem', elemW(d9a), { S: d9a, E: elemOf(d9a), V: 'D9' }, {});
      const V = t.V, va = F.vasc(V);
      if (va != null) { const vl = SL[va]; add('divisional', 'dv_lord', plW(vl), { V, S: va, P: [vl] }, { p: [vl] }); }
      let dw = 0;
      for (const p of PL9) { const w0 = plW(p); if (!w0) continue; const s = F.vsign(V, p), d = vDig(p, s);
        if (d === 'exalted' || d === 'own') { const w = 0.5 * w0; if (Math.abs(dw + w) <= 1.5) { dw += w; add('divisional', 'dv_dig', w, { P: [p], V, S: s, X: d }, { p: [p] }); } }
        else if (d === 'debilitated') { const w = -0.5 * w0; if (Math.abs(dw + w) <= 1.5) { dw += w; add('divisional', 'dv_debil', w, { P: [p], V, S: s }, { p: [p] }); } }
        if (pw(p) && F.pl[p].vargottama) add('divisional', 'dv_varg', 0.5 * pw(p), { P: [p] }, { p: [p] });
      }
      if (t.area === 'relationships') for (const p of PL9) if (F.d9[p] === sgn(d9a + 6)) add('divisional', 'dv_d9_7', 0.5 * plW(p), { P: [p], V: 'D9' }, { p: [p] });
    }
    // strength
    { appl.add('strength');
      for (const p of F.top2) add('strength', 'sb_top', plW(p), { P: [p], X: r2(F.ratio(p)) }, { p: [p] });
      for (const p of F.bot2) if (pw(p)) add('strength', 'sb_low', -0.5 * pw(p), { P: [p], X: r2(F.ratio(p)) }, { p: [p] });
      for (const p of PL9) { const w0 = plW(p); if (!w0) continue;
        if (F.strongDig(p)) add('strength', 'dg_high', 0.5 * w0, { P: [p], X: F.dig(p) }, { p: [p] });
        else if (F.debil(p)) add('strength', 'dg_low', (F.nbCancelled(p) ? -0.25 : -0.5) * w0, { P: [p], X: F.nbCancelled(p) ? 'nb' : '' }, { p: [p] });
        if (pw(p) && F.pl[p].combust) add('strength', 'combust', -0.5 * pw(p), { P: [p] }, { p: [p, 'Su'] });
      }
      if (!F.tu && F.sav && t.H.length) { const m = t.H.reduce((a, h) => a + F.sav[F.hs(h)], 0) / t.H.length; if (m >= 30.5) add('strength', 'sav_high', 1, { H: t.H, X: r1(m) }, { h: t.H }); else if (m <= 25.5) add('strength', 'sav_low', -1, { H: t.H, X: r1(m) }, { h: t.H }); }
    }
    // aspects
    { let any = false, aw = 0, nwSum = 0;
      if (!F.tu) for (const h of t.H) { const s = F.hs(h); for (const p of PL9) { if (!plW(p) || F.sign[p] === s) continue; if (aspects(p, F.sign[p], s)) { any = true; const w = 0.5 * plW(p); if (w > 0 && aw + w <= 1.5) { aw += w; add('aspects', 'as_house', w, { P: [p], H: [h] }, { p: [p], h: [h] }); } else if (w < 0 && nwSum + w >= -1.5) { nwSum += w; add('aspects', 'as_house', w, { P: [p], H: [h] }, { p: [p], h: [h] }); } } } }
      if (t.AM) for (const p of PL9) { if (p === 'Mo' || !plW(p)) continue; if (aspects(p, F.sign[p], F.sign.Mo)) { any = true; add('aspects', 'as_moon', 0.5 * plW(p), { P: [p] }, { p: [p, 'Mo'] }); } }
      if ((!F.tu && t.H.length) || t.AM) appl.add('aspects');
    }
    // balance
    { appl.add('balance'); const pts = PL7.map(p => F.sign[p]).concat(F.tu ? [] : [F.asc]), cnt = { fire: 0, earth: 0, air: 0, water: 0 }, mc = { movable: 0, fixed: 0, dual: 0 };
      for (const s of pts) { cnt[elemOf(s)]++; mc[modeOf(s)]++; }
      const n = pts.length;
      for (const e of t.E) { if (cnt[e] >= 3) add('balance', 'bl_elem', 1, { E: e, X: cnt[e], D: n }, {}); else if (cnt[e] === 0) add('balance', 'bl_lack', -0.5, { E: e, D: n }, {}); }
      for (const e of t.NE) if (cnt[e] >= 3) add('balance', 'bl_elem', -1, { E: e, X: cnt[e], D: n }, {});
      for (const m of t.M) if (mc[m] >= 4) add('balance', 'bl_mode', 1, { M: m, X: mc[m], D: n }, {});
      for (const m of t.NM) if (mc[m] >= 4) add('balance', 'bl_mode', -1, { M: m, X: mc[m], D: n }, {});
    }
    // custom tests (each in its own family)
    for (const id in t.X) { const r = custom(id, F); if (!r) continue; appl.add(r.fam); add(r.fam, CUSTOM_TEXT(id), t.X[id], r.params, r.hl); }
    return { fams, appl };
  }

  /* ------------------------------------------------------------------ timing context (current period) */
  function lordSig(F, X, H, P, primary) {
    // how strongly planet X is linked to houses H / karakas P (for the current-period themes and the life timeline)
    if (!X) return 0;
    let s = 0; const own = [];
    if (!F.tu) for (const h of H) if (F.lord(h) === X) { s += h === primary ? 1.5 : 1; own.push(h); }
    if (!F.tu && H.includes(F.house[X])) s += F.house[X] === primary ? 1.2 : 1;
    if (P[X]) s += P[X];
    if ((X === 'Ra' || X === 'Ke') && !F.tu) { const d = SL[F.sign[X]]; if (d !== X) s += 0.5 * H.filter(h => F.lord(h) === d).length; }
    return s;
  }
  function timingCtx(C, F, at, kp) {
    const T = { at, kp: null };
    const vim = C.dashas.vimshottari.tree, path = JE.dashaAt(vim, at, 3);
    T.md = path[0] || null; T.ad = path[1] || null; T.pd = path[2] || null;
    const yo = C.dashas.yogini && C.dashas.yogini.periods; T.yo = yo ? (JE.dashaAt(yo, at, 1)[0] || null) : null;
    const ch = C.dashas.chara && C.dashas.chara.periods; if (ch && !F.tu) { const m = ch.find(x => at >= x.start && at < x.end); if (m) { T.chMd = m; T.chAd = (m.children || []).find(x => at >= x.start && at < x.end) || null; } }
    if (T.md) { const i = vim.findIndex(x => x.start === T.md.start); T.nextMd = vim[i + 1] || null; }
    T.kp = kp;
    return T;
  }

  function evalTiming(t, F, T) {
    const fams = {}, appl = new Set(), add = (fam, test, w, params, hl) => { if (!w) return; (fams[fam] = fams[fam] || { score: 0, items: [] }); fams[fam].score += w; fams[fam].items.push({ fam, test, w: r2(w), params: params || {}, hl: hl || {} }); };
    const H = t.timing.H, Pk = t.timing.P, pri = H[0];
    if (T.md) {
      appl.add('timing');
      const sm = lordSig(F, T.md.lord, H, Pk, pri), sa = T.ad ? lordSig(F, T.ad.lord, H, Pk, pri) : 0, sy = T.yo ? lordSig(F, T.yo.lord, H, Pk, pri) : 0;
      const hl = l => ({ p: [l], h: F.tu ? [] : H.filter(h => F.lord(h) === l || F.house[l] === h) });
      if (sm >= 1) add('timing', 'tm_md', sm >= 2 ? 1.2 : 0.8, { P: [T.md.lord], D: T.md.endISO, H: hl(T.md.lord).h }, hl(T.md.lord)); else add('timing', 'tm_md_no', -0.6, { P: [T.md.lord], D: T.md.endISO }, { p: [T.md.lord] });
      if (T.ad) { if (sa >= 1) add('timing', 'tm_ad', sa >= 2 ? 0.7 : 0.5, { P: [T.ad.lord], D: T.ad.endISO, H: hl(T.ad.lord).h }, hl(T.ad.lord)); else add('timing', 'tm_ad_no', -0.3, { P: [T.ad.lord], D: T.ad.endISO }, { p: [T.ad.lord] }); }
      if (T.yo && sy >= 1.5) add('timing', 'tm_yogini', 0.4, { P: [T.yo.lord], D: T.yo.endISO }, { p: [T.yo.lord] });
    }
    if (T.chMd && !F.tu) {
      appl.add('chara');
      const hm = sgn(T.chMd.sign - F.asc) + 1; let s = 0;
      if (H.includes(hm)) { s += 1; add('chara', 'ch_md', 1, { S: T.chMd.sign, H: [hm], D: T.chMd.endISO }, { s: [T.chMd.sign], h: [hm] }); }
      const occ = F.inSign(T.chMd.sign).filter(p => Pk[p]); if (occ.length) { s += 0.5; add('chara', 'ch_occ', 0.5, { S: T.chMd.sign, P: occ }, { s: [T.chMd.sign], p: occ }); }
      if (T.chAd) { const ha = sgn(T.chAd.sign - F.asc) + 1; if (H.includes(ha)) add('chara', 'ch_ad', 0.5, { S: T.chAd.sign, H: [ha], D: T.chAd.endISO }, { s: [T.chAd.sign], h: [ha] }); }
      if (!s) add('chara', 'ch_md_no', -0.5, { S: T.chMd.sign, H: [hm] }, { s: [T.chMd.sign] });
    }
    if (T.year && !F.tu) {
      appl.add('annual');
      if (H.includes(T.year.munthaHouse)) add('annual', 'an_muntha', 1, { H: [T.year.munthaHouse], S: T.year.munthaSign }, { s: [T.year.munthaSign] });
      const syl = lordSig(F, T.year.yearLord, H, Pk, pri); if (syl >= 1) add('annual', 'an_yl', syl >= 2 ? 1 : 0.6, { P: [T.year.yearLord] }, { p: [T.year.yearLord] });
    }
    if (T.tr && !F.tu) {
      appl.add('transit');
      const hj = sgn(T.tr.Ju - F.asc) + 1, hs = sgn(T.tr.Sa - F.asc) + 1;
      if (H.includes(hj)) add('transit', 'tr_ju', 1, { H: [hj], S: T.tr.Ju }, { s: [T.tr.Ju] });
      else if (H.some(h => aspects('Ju', T.tr.Ju, F.hs(h)))) add('transit', 'tr_ju_asp', 0.5, { H: H.filter(h => aspects('Ju', T.tr.Ju, F.hs(h))), S: T.tr.Ju }, { s: [T.tr.Ju] });
      if (H.includes(hs)) add('transit', 'tr_sa', 0.5, { H: [hs], S: T.tr.Sa }, { s: [T.tr.Sa] });
    }
    return { fams, appl };
  }

  /* ------------------------------------------------------------------ Varshaphal year (fast: Muntha + year lord only) */
  function yearAt(C, age) {
    const P3 = JE._p3; if (!P3 || !P3.solarReturn || !P3.annualCore || age < 0) return null;
    const ay = C.meta.ayanamsaId === 'tropical' ? 'lahiri' : C.meta.ayanamsaId, natSun = C.planets.find(p => p.id === 'Su').lon;
    const jd = P3.solarReturn(natSun, C.meta.jdUT + age * 365.25636, ay);
    const pl = C.meta.input.place, pos = JE.positionsAt(jd, ay, C.meta.nodeType, PL7).pos, ascLon = JE.ascSid(jd, +pl.lat, +pl.lon, ay);
    const V = { lon: {}, sign: {}, speed: {}, retro: {}, combust: {} }; for (const id of PL7) { V.lon[id] = pos[id].lon; V.sign[id] = Math.floor(pos[id].lon / 30); }
    V.asc = ascLon; V.ascS = Math.floor(ascLon / 30);
    const day = norm(pos.Su.lon - ascLon) > 180; // Sun above the horizon (houses 7-12)
    const core = P3.annualCore(V, C.asc.sign, age, day, 'friendly');
    return { age, jd, munthaSign: core.muntha.sign, munthaHouse: sgn(core.muntha.sign - C.asc.sign) + 1, yearLord: core.yearLord.planet };
  }
  const ageAt = (C, jd) => Math.floor((jd - C.meta.jdUT) / 365.25636);

  /* ------------------------------------------------------------------ synthesis */
  // base rates: % of 2,000 random charts in which a theme reaches moderate+/clear+/strong (tests/test-synthesis.js --write)
  const SYNTH_BASE = /*SYNTH-BASE*/{"N":2000,"at":"2026-10-22T06:00Z","note":"Percent of N random Indian charts (1930-2019, IST, seed 12345) in which the theme reaches moderate+/clear+/strong after mutual-exclusion resolution. Generated by tests/test-synthesis.js --write.","rates":{"t_leader":[21,10,3],"t_collab":[20.6,8.1,2.3],"t_extro":[35,20.3,8.1],"t_intro":[16,6.8,1.4],"t_steady":[20.2,7.7,2.2],"t_quick":[16.7,6.3,1],"t_calm":[19.6,9.5,2.5],"t_fiery":[23,13.4,5.2],"m_sensitive":[17,7.7,2],"m_rational":[33.3,18.8,7.5],"m_optimist":[23.2,12.2,3.6],"m_serious":[8.1,4,0.7],"c_speaker":[21.8,9.2,2.5],"c_listener":[11.5,3.5,0.4],"c_structured":[23.2,10.5,3.3],"c_explorer":[21.3,10.5,2.8],"c_scholar":[17,10.3,3.2],"c_handson":[41,25.7,11.1],"k_authority":[28.3,10.9,3.4],"k_enterprise":[33.4,17.7,5.9],"k_service":[6.9,1.7,0.3],"k_helping":[27.6,15.8,5.4],"k_technical":[29.3,18.5,6.8],"k_creative":[5.8,1.8,0.3],"k_slowrise":[2.9,0.5,0.1],"k_earlyrise":[11.6,4.3,0.7],"k_foreign":[16.9,7.6,1.9],"w_saver":[24.9,12,3.3],"w_spender":[21.5,9.9,2.8],"w_gains":[10.9,2.2,0.4],"w_property":[44.6,23.2,8.7],"r_devoted":[16,5,1.3],"r_space":[8,2.4,0.4],"r_romantic":[20.4,9.8,2.5],"r_practical":[17.9,9.3,2.8],"f_homebody":[22.1,11.9,4.5],"f_wanderer":[21.5,11.5,3.4],"f_pillar":[17.4,4.9,1],"cr_creative":[26.6,12.9,3.9],"cr_mentor":[9.4,2.5,0.3],"cr_playful":[32,14.4,3.4],"s_spiritual":[18.6,7.8,1.9],"s_worldly":[26.9,13.7,4.1],"s_principled":[5.7,1,0.1],"s_tradition":[33.1,20.7,7.6],"s_reformer":[25,14.4,5.3],"st_resilient":[31.1,10.8,1.8],"st_charisma":[26.1,8.8,2.4],"st_organised":[18.6,8.5,2.2],"st_improviser":[28.3,13.8,4.1],"st_courage":[25.5,13,4.3],"st_prudent":[26.1,13.6,3.8],"g_patience":[10.1,4.8,1.6],"g_overthink":[28.7,14,4.7],"g_selfworth":[3.4,0.6,0],"g_rest":[24.2,7.3,1.6],"g_boundaries":[27,10.4,2.4],"g_focus":[19,7.3,1.5],"tm_career":[36.6,36.6,16],"tm_learning":[33.3,33.3,13.3],"tm_partner":[10.4,10.4,2.2],"tm_home":[18,18,4.4],"tm_inner":[13.3,13.3,2.8],"tm_gains":[20.1,20.1,5.6],"tm_creative":[15.9,15.9,4],"tm_travel":[34.9,34.9,15.4]}}/*END-SYNTH-BASE*/;
  const FAMS = ['lagna', 'moon', 'sun', 'jaimini', 'houses', 'yogas', 'divisional', 'strength', 'aspects', 'balance', 'timing', 'chara', 'annual', 'transit'];
  const LEVELS = ['moderate', 'clear', 'strong'];
  function scoreTheme(t, F, T) {
    const { fams, appl } = evalTheme(t, F, T);
    let A = 0, D = 0, sup = 0, con = 0; const fam = {};
    for (const f of appl) { const x = fams[f] || { score: 0, items: [] }; const v = x.score >= 1 ? 1 : x.score <= -1 ? -1 : 0; if (v > 0) A++; if (v < 0) D++; fam[f] = { score: r2(x.score), vote: v, items: x.items }; }
    for (const f in fam) for (const it of fam[f].items) { if (it.w > 0) sup += it.w; else con -= it.w; }
    const R = appl.size, net = A - D;
    let level = null;
    if (t.timing) { const tv = fam.timing && fam.timing.vote > 0; if (tv && A >= 2 && D === 0) level = A >= 3 ? 'strong' : 'clear'; else if (tv && A >= 2 && A > D) level = 'moderate'; }
    else if (A >= 3 && net >= 2 && A >= 0.35 * R) level = (A >= 0.6 * R && D <= 1 && A >= 5) ? 'strong' : (A >= 0.45 * R && D <= 2 && A >= 4) ? 'clear' : 'moderate';
    return { id: t.id, area: t.area, ax: t.ax, pole: t.pole, dup: t.dup, conflicts: t.conflicts, A, D, R, net, sup: r2(sup), con: r2(con), rs: R ? net / R + 0.01 * sup : 0, level, fam };
  }
  function synthesis(C, opts) {
    opts = opts || {}; const t0 = hrnow();
    const at = opts.at != null ? opts.at : nowJd();
    const F = feat(C, at);
    let kp = null;
    if (opts.kp !== false && !F.tu && JE.kp) { try { const K = opts.kpResult || JE.kp(C); kp = {}; for (const e of K.events) kp[e.id] = e; } catch (e) { kp = null; } }
    const T = timingCtx(C, F, at, kp);
    const age = ageAt(C, at);
    if (!F.tu && opts.annual !== false) T.year = yearAt(C, age);
    if (!F.tu) { const ay = C.meta.ayanamsaId === 'tropical' ? 'lahiri' : C.meta.ayanamsaId, ps = JE.positionsAt(at, ay, C.meta.nodeType, ['Ju', 'Sa']).pos; T.tr = { Ju: Math.floor(ps.Ju.lon / 30), Sa: Math.floor(ps.Sa.lon / 30) }; }
    const all = THEMES.map(t => scoreTheme(t, F, T));
    // family app: relationship / partnership themes are not shown for anyone under 18 (opts.ageGates: false turns this off)
    // relationship themes are shown at every age unless the caller asks to hide them for minors (opts.hideMinor)
    const minor = !!opts.hideMinor && age < 18;
    if (minor) for (const x of all) if (x.area === 'relationships' || x.id === 'tm_partner') { x.level = null; x.hidden = 'minor'; }
    const res = resolve(all, opts);
    const out = {
      version: VERSION4, at, timeUnknown: F.tu, minor, computeMs: 0,
      themes: res.main, distinctive: res.distinctive, timing: res.timing, resolved: res.kept,
      period: T.md ? { md: T.md.lord, mdEnd: T.md.endISO, ad: T.ad && T.ad.lord, adEnd: T.ad && T.ad.endISO, yogini: T.yo && T.yo.lord, chara: T.chMd ? T.chMd.sign : null, year: T.year || null,
        next: T.nextMd ? { lord: T.nextMd.lord, startISO: T.nextMd.startISO, emphasis: nextEmphasis(F, T.nextMd.lord) } : null } : null,
      all, familiesUsed: FAMS.filter(f => all.some(x => x.fam[f])), baseRateN: SYNTH_BASE.N || 0
    };
    if (opts.content) attachTexts(out, opts.content);
    out.computeMs = r1(hrnow() - t0);
    return out;
  }
  function nextEmphasis(F, lord) {
    let best = null, bs = 0;
    for (const id in TH_TIMING) { const t = THEME_BY_ID[id]; const s = lordSig(F, lord, t.timing.H, t.timing.P, t.timing.H[0]); if (s > bs) { bs = s; best = id; } }
    return bs >= 1 ? best : null;
  }
  function resolve(all, opts) {
    const cand = all.filter(x => x.level);
    const byId = Object.fromEntries(all.map(x => [x.id, x]));
    const drop = new Set();
    // axis poles: clearly higher net wins; within 2 → both omitted
    const axes = {}; for (const x of all) if (x.ax) (axes[x.ax] = axes[x.ax] || []).push(x);
    for (const k in axes) { const [a, b] = axes[k]; if (!a || !b) continue; const d = a.net - b.net; if (Math.abs(d) < 2) { drop.add(a.id); drop.add(b.id); } else drop.add(d > 0 ? b.id : a.id); }
    const rank = (a, b) => (LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level)) || (b.rs - a.rs) || (b.sup - a.sup) || (a.id < b.id ? -1 : 1);
    let list = cand.filter(x => !drop.has(x.id)).sort(rank);
    // duplicates and explicit conflicts: the higher ranked one stays
    const kept = [];
    for (const x of list) {
      if (x.dup && kept.some(k => k.dup === x.dup)) continue;
      if (kept.some(k => k.conflicts.includes(x.id) || x.conflicts.includes(k.id))) continue;
      kept.push(x);
    }
    const natal = kept.filter(x => x.area !== 'timing'), timing = kept.filter(x => x.area === 'timing').slice(0, 2);
    // main list: strong + clear first (≤ 3 per area), then moderate until 10
    const main = [], perArea = {};
    const take = x => { if ((perArea[x.area] || 0) >= 3) return false; perArea[x.area] = (perArea[x.area] || 0) + 1; main.push(x); return true; };
    const maxN = opts.max || 15, minN = opts.min || 10;
    for (const x of natal.filter(x => x.level !== 'moderate')) { if (main.length >= maxN - timing.length) break; take(x); }
    for (const x of natal.filter(x => x.level === 'moderate')) { if (main.length + timing.length >= minN) break; take(x); }
    // still short of the minimum: themes where at least 3 families agree and at least 2 more agree than disagree
    if (main.length + timing.length < minN) {
      const extra = all.filter(x => !x.level && !x.hidden && x.area !== 'timing' && x.A >= 3 && x.net >= 2 && !drop.has(x.id)).sort((a, b) => (b.rs - a.rs) || (a.id < b.id ? -1 : 1));
      for (const x of extra) { if (main.length + timing.length >= minN) break; if (main.concat(timing).some(k => (x.dup && k.dup === x.dup) || k.conflicts.includes(x.id) || x.conflicts.includes(k.id))) continue; x.level = 'moderate'; x.fill = true; take(x); }
    }
    const mainAll = main.concat(timing);
    // distinctive: clear+ consensus, low base rate for that level
    const dist = [];
    for (const x of natal) {
      const b = baseRate(x.id, x.level); if (b == null || x.level === 'moderate') continue;
      if (b <= (opts.distinctiveMax || 20)) dist.push(Object.assign({}, x, { baseRate: b }));
    }
    dist.sort((a, b) => (a.baseRate - b.baseRate) || rank(a, b));
    for (const x of mainAll) x.baseRate = baseRate(x.id, x.level);
    return { main: mainAll, distinctive: dist.slice(0, opts.distinctiveN || 8), timing, kept: kept.map(x => ({ id: x.id, level: x.level })) };
  }
  function baseRate(id, level) { const b = SYNTH_BASE.rates && SYNTH_BASE.rates[id]; if (!b) return null; return level === 'strong' ? b[2] : level === 'clear' ? b[1] : b[0]; }

  /* ------------------------------------------------------------------ texts (templates live in content4.js) */
  function fill(tpl, p, lang, J) {
    if (!tpl) return '';
    const L = o => o == null ? '' : typeof o === 'string' ? o : (o[lang] != null ? o[lang] : o.en);
    const lab = (grp, k) => { const g = J && J.synth && J.synth.labels && J.synth.labels[grp]; return g && g[k] ? L(g[k]) : String(k); };
    const pl = a => (a || []).map(x => L(NM.planets[x]) || x).join(lang === 'hi' ? ', ' : ', ');
    const date = iso => { if (!iso) return ''; const [y, m] = String(iso).slice(0, 7).split('-'); const mn = J && J.synth && J.synth.labels && J.synth.labels.months; return (mn ? L(mn[+m - 1]) : m) + ' ' + y; };
    return L(tpl).replace(/\{(\w)\}/g, (_, k) => {
      const v = p[k];
      switch (k) {
        case 'P': return pl(v);
        case 'S': return v == null ? '' : L(NM.signs[v]);
        case 'E': return lab('elements', v);
        case 'M': return lab('modes', v);
        case 'G': return lab('ganas', v);
        case 'H': return (Array.isArray(v) ? v : [v]).filter(x => x != null).join(', ');
        case 'N': return v == null ? '' : L(NM.nakshatras[v]);
        case 'Y': { const y = J && ((J.yogas && J.yogas[v]) || (J.kp && J.kp.eventRules && J.kp.eventRules[v])); return y && y.name ? L(y.name) : lab('kpEvents', v); }
        case 'X': return typeof v === 'string' && J && J.synth && J.synth.labels.x && J.synth.labels.x[v] ? L(J.synth.labels.x[v]) : v == null ? '' : String(v);
        case 'D': return typeof v === 'string' && /^\d{4}-\d\d/.test(v) ? date(v) : v == null ? '' : String(v);
        case 'V': return String(v || '');
        case 'T': return lab('targets', v);
        case 'A': return lab('areas', v);
        default: return v == null ? '' : String(v);
      }
    });
  }
  function synthesisText(item, J, lang) {
    const tests = (J && J.synth && J.synth.tests) || {};
    const tl = (J && J.tl && J.tl.tests) || {};
    const t = tests[item.test] || tl[item.test];
    if (!t) return { en: item.test, hi: item.test };
    return { en: fill(t, item.params || {}, 'en', J), hi: fill(t, item.params || {}, 'hi', J) };
  }
  function attachTexts(out, J) {
    const S = J.synth || {};
    const each = x => { const th = S.themes && S.themes[x.id]; x.statement = th ? th.s : null; x.explanation = th ? th.x : null;
      x.supporting = []; x.contradicting = [];
      for (const f in x.fam) { const fm = x.fam[f]; for (const it of fm.items) { const o = { family: f, test: it.test, w: it.w, text: synthesisText(it, J), hl: it.hl, vote: fm.vote }; if (it.w > 0) x.supporting.push(o); else x.contradicting.push(o); } }
      x.supporting.sort((a, b) => (b.vote - a.vote) || (b.w - a.w)); x.contradicting.sort((a, b) => (a.vote - b.vote) || (a.w - b.w));
    };
    out.themes.forEach(each); out.distinctive.forEach(each);
  }

  /* ------------------------------------------------------------------ LIFE TIMELINE */
  // minAge/maxAge: the life stage in which an area's windows are looked for (traditional readings judge marriage,
  // children, studies and career within the usual life stage; opts.ageGates: false removes both limits)
  const AREAS = {
    career: { H: [10, 11, 6], pri: 10, K: { Su: 1, Sa: 1, Me: 0.5 }, V: 'D10', vh: 10, jk: 'AmK', kp: 'kp_job', minAge: 18, maxAge: 65 },
    education: { H: [4, 5, 9], pri: 4, K: { Me: 1, Ju: 1 }, V: 'D24', vh: 4, jk: 'PK', kp: 'kp_education', minAge: 4, maxAge: 25 },
    marriage: { H: [7, 2, 11], pri: 7, K: { Ve: 1, Ju: 0.5 }, V: 'D9', vh: 7, jk: 'DK', kp: 'kp_marriage', minAge: 21, maxAge: 40 },
    children: { H: [5, 2, 11], pri: 5, K: { Ju: 1 }, V: 'D7', vh: 5, jk: 'PK', kp: 'kp_child', minAge: 23, maxAge: 45 },
    property: { H: [4, 11, 2], pri: 4, K: { Ma: 1, Ve: 0.5 }, V: 'D4', vh: 4, jk: 'MK', kp: 'kp_property', minAge: 21, maxAge: 75 },
    travel: { H: [12, 9, 3], pri: 12, K: { Ra: 1 }, V: null, kp: 'kp_foreign_travel', minAge: 16, maxAge: 75 },
    finance: { H: [11, 2], pri: 11, K: { Ju: 1, Ve: 0.5 }, V: null, kp: 'kp_income_gain', minAge: 18, maxAge: 75 },
    spiritual: { H: [9, 12, 5], pri: 9, K: { Ju: 1, Ke: 1 }, V: 'D20', vh: 9, jk: 'AK', minAge: 12 },
    favourable: { special: 'good' },
    care: { special: 'care' },
    wellbeing: { special: 'well' }
  };
  const AREA_IDS = Object.keys(AREAS);
  const MINOR_AREAS = ['education', 'favourable', 'care', 'wellbeing'];
  // methods per area and the minimum number that must agree (calibrated once on random charts for coverage, then frozen)
  const TL_NEED = /*TL-NEED*/{"career":4,"education":4,"marriage":4,"children":4,"property":4,"travel":3,"finance":3,"spiritual":3,"favourable":3,"care":3,"wellbeing":3}/*END-TL-NEED*/;
  function funcGood(F, X) { // functional benefic score (Laghu Parashari): trikona lords good, kendra lords neutral-good, 6/8/12 lords difficult
    if (!X || F.tu) return 0; let s = 0; const own = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(h => F.lord(h) === X);
    for (const h of own) { if ([1, 5, 9].includes(h)) s += 1; else if ([4, 10].includes(h)) s += 0.4; else if ([6, 8, 12].includes(h)) s -= 0.8; else if (h === 11) s -= 0.2; }
    if (['Ju', 'Ve'].includes(X)) s += 0.4; if ((X === 'Ra' || X === 'Ke')) { const h = F.house[X]; if ([3, 6, 11].includes(h)) s += 0.6; else if ([8, 12].includes(h)) s -= 0.6; }
    if (F.strongDig(X)) s += 0.3; if (F.debil(X) && !F.nbCancelled(X)) s -= 0.3;
    return s;
  }
  function careSig(F, X, hs) { if (!X || F.tu) return 0; let s = 0; for (const h of hs) { if (F.lord(h) === X && ![1, 5, 9].some(t => F.lord(t) === X)) s += 1; if (F.house[X] === h) s += 0.7; } return s; }
  function areaSig(F, ar, X) {
    const A = AREAS[ar];
    if (A.special === 'good') return funcGood(F, X);
    if (A.special === 'care') return careSig(F, X, [6, 8, 12]);
    if (A.special === 'well') return careSig(F, X, [6, 8]) + (X === F.lord(1) && DUSTHANA.includes(F.house[X]) ? 0.5 : 0);
    let s = lordSig(F, X, A.H, A.K, A.pri);
    if (A.V && F.C.vargas[A.V] && !F.tu) { const va = F.C.vargas[A.V].asc; if (SL[sgn(va + A.vh - 1)] === X) s += 0.75; }
    return s;
  }
  function lifeTimeline(C, opts) {
    opts = opts || {}; const t0 = hrnow();
    const at = opts.at != null ? opts.at : nowJd();
    const F = feat(C, at), birth = C.meta.jdUT, MONTH = 365.25 / 12, maxAge = opts.maxAge || 90;
    const ay = C.meta.ayanamsaId === 'tropical' ? 'lahiri' : C.meta.ayanamsaId;
    const nM = Math.floor(maxAge * 12);
    let kp = null, kpEv = {};
    if (!F.tu && opts.kp !== false && JE.kp) { try { kp = opts.kpResult || JE.kp(C); for (const e of kp.events) kpEv[e.id] = e; } catch (e) { kp = null; } }
    const sig = {}; if (kp) for (const p of kp.planets) sig[p.id] = p.signifies || [];
    F._kpSig = kp ? sig : null;
    // per-year varshaphal
    const years = []; if (!F.tu && opts.annual !== false) for (let a = 0; a <= maxAge; a++) years.push(yearAt(C, a));
    // sade sati periods
    const vim = C.dashas.vimshottari.tree, yo = C.dashas.yogini && C.dashas.yogini.periods, ch = C.dashas.chara && C.dashas.chara.periods;
    const moS = F.sign.Mo;
    const months = [];
    const sigCache = {};
    const sigOf = (ar, X) => { const k = ar + X; if (!(k in sigCache)) sigCache[k] = areaSig(F, ar, X); return sigCache[k]; };
    // Jupiter / Saturn month by month: exact every 2nd month, the months between by 4-point (cubic) interpolation of the
    // unwrapped longitude (error well under 0.1°, far below the month resolution of the windows)
    const ex = [], lonAt = m => { const ps = JE.positionsAt(birth + (m + 0.5) * MONTH, ay, C.meta.nodeType, ['Ju', 'Sa']).pos; return [ps.Ju.lon, ps.Sa.lon]; };
    for (let m = -2; m <= nM + 3; m += 2) ex.push(lonAt(m));
    for (const k of [0, 1]) for (let i = 1; i < ex.length; i++) { let d = ex[i][k] - ex[i - 1][k]; while (d > 180) d -= 360; while (d < -180) d += 360; ex[i][k] = ex[i - 1][k] + d; }
    const JS = new Array(nM), sg2 = l => Math.floor(norm(l) / 30);
    for (let m = 0; m < nM; m++) {
      const i = (m + 2) >> 1; // ex[i] is month 2i-2
      if (m % 2 === 0) { JS[m] = [sg2(ex[i][0]), sg2(ex[i][1])]; continue; }
      const c = k => (-ex[i - 1][k] + 9 * ex[i][k] + 9 * ex[i + 1][k] - ex[i + 2][k]) / 16;
      JS[m] = [sg2(c(0)), sg2(c(1))];
    }
    for (let m = 0; m < nM; m++) {
      const jd = birth + (m + 0.5) * MONTH, age = m / 12;
      const path = JE.dashaAt(vim, jd, 3), yl = yo ? JE.dashaAt(yo, jd, 1)[0] : null;
      const ju = JS[m][0], sa = JS[m][1];
      let chM = null, chA = null; if (ch && !F.tu) { chM = ch.find(x => jd >= x.start && jd < x.end) || null; if (chM) chA = (chM.children || []).find(x => jd >= x.start && jd < x.end) || null; }
      const yr = years[Math.floor(age)] || null;
      const sh = sgn(sa - F.sign.Mo) + 1, ssp = sh === 12 ? 'rising' : sh === 1 ? 'peak' : sh === 2 ? 'setting' : sh === 4 ? 'dhaiya4' : sh === 8 ? 'dhaiya8' : null; // Saturn from the natal Moon (monthly)
      months.push({ m, jd, age, md: path[0] && path[0].lord, ad: path[1] && path[1].lord, pd: path[2] && path[2].lord, mdEnd: path[0] && path[0].endISO, adEnd: path[1] && path[1].endISO, yo: yl && yl.lord, ju, sa, chM: chM && chM.sign, chA: chA && chA.sign, yr, ss: ssp });
    }
    const res = { version: VERSION4, at, birthJd: birth, maxAge, timeUnknown: F.tu, areas: {}, coverage: {}, computeMs: 0 };
    const ageNow = (at - birth) / 365.25;
    res.minor = ageNow < 18; res.ageNow = r1(ageNow);
    for (const ar of AREA_IDS) {
      const A = AREAS[ar], need0 = TL_NEED[ar] || 4;
      const methods = methodsFor(ar, F, kpEv);
      const flags = new Array(nM);
      for (let i = 0; i < nM; i++) {
        const M = months[i], act = [];
        for (const me of methods) { const r = me.f(M); if (r) act.push(Object.assign({ method: me.id }, r)); }
        flags[i] = act;
      }
      const minAge = opts.ageGates === false ? 0 : (A.minAge || 0), maxA = opts.ageGates === false ? maxAge : Math.min(maxAge, A.maxAge || maxAge);
      const windowsAt = nd => {
        let ws = [], cur = null;
        for (let i = 0; i < nM; i++) {
          const k = flags[i].length, on = k >= nd && months[i].age >= minAge && months[i].age < maxA;
          if (on) { if (cur && i - cur.e <= 3) { cur.e = i; cur.peak = Math.max(cur.peak, k); } else { if (cur) ws.push(cur); cur = { s: i, e: i, peak: k }; } }
        }
        if (cur) ws.push(cur);
        return ws.filter(w => w.e - w.s + 1 >= 3);
      };
      // the bar is raised by one method while windows would cover more than 35% of the months (no area may fill most of a life)
      const span = Math.min(nM, Math.round(maxA * 12)) - Math.min(nM, Math.round(minAge * 12));
      let need = need0, wins = windowsAt(need);
      while (span > 0 && wins.reduce((a, w) => a + (w.e - w.s + 1), 0) / span > 0.35 && need < methods.length) wins = windowsAt(++need);      const n = methods.length;
      const out = wins.map(w => {
        const cnt = {}, rep = {}; let sumK = 0;
        for (let i = w.s; i <= w.e; i++) { sumK += flags[i].length; for (const a of flags[i]) { cnt[a.method] = (cnt[a.method] || 0) + 1; if (!rep[a.method] || flags[i].length === w.peak) rep[a.method] = a; } }
        const len = w.e - w.s + 1, factors = Object.keys(cnt).filter(k => cnt[k] / len >= 0.4).map(k => ({ method: k, share: r2(cnt[k] / len), test: rep[k].test, params: rep[k].params, hl: rep[k].hl || {} }));
        const avgK = sumK / len;
        const strength = (w.peak >= Math.min(n, need + 2) && avgK >= need + 0.7) ? 'strong' : (w.peak >= need + 1) ? 'clear' : 'moderate';
        return { area: ar, from: months[w.s].jd - MONTH / 2, to: months[w.e].jd + MONTH / 2, fromISO: JE.isoLocal(months[w.s].jd - MONTH / 2, C.meta.utcOffsetUsed).slice(0, 7), toISO: JE.isoLocal(months[w.e].jd + MONTH / 2, C.meta.utcOffsetUsed).slice(0, 7), ageFrom: r1(months[w.s].age), ageTo: r1(months[w.e].age + 1 / 12), months: len, peak: w.peak, avg: r2(avgK), of: n, strength, factors };
      });
      const covered = wins.reduce((a, w) => a + (w.e - w.s + 1), 0);
      res.coverage[ar] = span > 0 ? r2(covered / span) : 0;
      res.areas[ar] = { windows: out, methods: methods.map(x => x.id), need, need0, of: n, minAge, maxAge: maxA };
      if (opts.debug) { res.debug = res.debug || { months, flags: {} }; res.debug.flags[ar] = flags; }
    }
    // the view: calendar-neutral by default (birth → maxAge, whatever today's date is); ≤ 3 windows per area, strongest first, listed by age
    const vFrom = opts.from != null ? opts.from : birth, vTo = opts.to != null ? opts.to : birth + maxAge * 365.25;
    res.view = { from: vFrom, to: vTo, areas: {} };
    const SR = { strong: 3, clear: 2, moderate: 1 };
    for (const ar of AREA_IDS) {
      if (opts.hideMinor && res.minor && !MINOR_AREAS.includes(ar)) { res.view.areas[ar] = { hidden: 'minor', top: [] }; continue; }
      const ws = res.areas[ar].windows.filter(w => w.to >= vFrom && w.from <= vTo);
      res.view.areas[ar] = { top: ws.slice().sort((a, b) => (SR[b.strength] - SR[a.strength]) || (b.avg - a.avg) || (a.from - b.from)).slice(0, opts.perArea || 3).sort((a, b) => a.from - b.from), all: ws };
    }
    if (opts.content) for (const ar of AREA_IDS) for (const w of res.areas[ar].windows) for (const f of w.factors) f.text = synthesisText(f, opts.content);
    res.computeMs = r1(hrnow() - t0);
    return res;
  }
  // timing methods; each returns null or {test, params, hl}
  function methodsFor(ar, F, kpEv) {
    const A = AREAS[ar], L = [], tu = F.tu;
    const sg = X => areaSig(F, ar, X);
    if (A.special === 'good') {
      L.push({ id: 'vim', f: M => (M.md && M.ad && sg(M.md) >= 0.8 && sg(M.ad) >= 0.8) ? { test: 'tl_vim_good', params: { P: uniq([M.md, M.ad]), D: M.adEnd }, hl: { p: [M.md, M.ad] } } : null });
      L.push({ id: 'gochara', f: M => ([2, 5, 7, 9, 11].includes(sgn(M.ju - F.sign.Mo) + 1) && [3, 6, 11].includes(sgn(M.sa - F.sign.Mo) + 1)) || ([2, 5, 7, 9, 11].includes(sgn(M.ju - F.sign.Mo) + 1) && !M.ss) ? { test: 'tl_gochara_good', params: { S: M.ju, H: [sgn(M.ju - F.sign.Mo) + 1] }, hl: { s: [M.ju] } } : null });
      if (F.bav && !tu) L.push({ id: 'av', f: M => (F.bav.Ju[M.ju] >= 5 && F.sav[M.ju] >= 28) ? { test: 'tl_av_ju', params: { S: M.ju, X: F.bav.Ju[M.ju] }, hl: { s: [M.ju] } } : null });
      if (!tu) L.push({ id: 'varsha', f: M => M.yr && ([1, 2, 5, 9, 10, 11].includes(M.yr.munthaHouse) && funcGood(F, M.yr.yearLord) > 0) ? { test: 'tl_varsha_good', params: { H: [M.yr.munthaHouse], P: [M.yr.yearLord] }, hl: { p: [M.yr.yearLord] } } : null });
      if (!tu) L.push({ id: 'chara', f: M => M.chM != null && ([1, 5, 9, 10, 11].includes(sgn(M.chM - F.asc) + 1) || F.inSign(M.chM).some(p => p === 'Ju' || p === 'Ve')) ? { test: 'tl_chara_good', params: { S: M.chM, H: [sgn(M.chM - F.asc) + 1] }, hl: { s: [M.chM] } } : null });
      L.push({ id: 'yogini', f: M => M.yo && sg(M.yo) >= 1 ? { test: 'tl_yogini', params: { P: [M.yo] }, hl: { p: [M.yo] } } : null });
      return L;
    }
    if (A.special === 'care' || A.special === 'well') {
      const well = A.special === 'well', thr = 1;
      L.push({ id: 'vim', f: M => (M.md && M.ad && sg(M.md) >= thr && sg(M.ad) >= thr) ? { test: well ? 'tl_vim_well' : 'tl_vim_care', params: { P: uniq([M.md, M.ad]), D: M.adEnd }, hl: { p: [M.md, M.ad] } } : null });
      L.push({ id: 'sade', f: M => (well ? (M.ss === 'peak' || M.ss === 'dhaiya8') : !!M.ss) ? { test: 'tl_sade', params: { X: M.ss }, hl: { p: ['Sa', 'Mo'] } } : null });
      if (F.sav && !tu) L.push({ id: 'av', f: M => (well ? (F.sav[M.sa] <= 25 && (M.sa === F.asc || M.sa === F.sign.Mo || M.sa === sgn(F.asc + 7))) : (F.bav.Sa[M.sa] <= 2 || F.sav[M.sa] <= 24)) ? { test: 'tl_av_sa_low', params: { S: M.sa, X: F.sav[M.sa] }, hl: { s: [M.sa] } } : null });
      if (!tu) L.push({ id: 'varsha', f: M => M.yr && (well ? [6, 8].includes(M.yr.munthaHouse) : [6, 8, 12].includes(M.yr.munthaHouse)) ? { test: 'tl_varsha_care', params: { H: [M.yr.munthaHouse] }, hl: { h: [M.yr.munthaHouse] } } : null });
      if (!tu) L.push({ id: 'chara', f: M => M.chM != null && (well ? [6, 8].includes(sgn(M.chM - F.asc) + 1) : [6, 8, 12].includes(sgn(M.chM - F.asc) + 1)) ? { test: 'tl_chara_care', params: { S: M.chM, H: [sgn(M.chM - F.asc) + 1] }, hl: { s: [M.chM] } } : null });
      if (well && !tu) L.push({ id: 'gochara', f: M => (M.sa === F.asc || M.sa === sgn(F.sign.Mo + 7)) ? { test: 'tl_gochara_well', params: { S: M.sa }, hl: { s: [M.sa] } } : null });
      else L.push({ id: 'yogini', f: M => M.yo && sg(M.yo) >= 1 ? { test: 'tl_yogini', params: { P: [M.yo] }, hl: { p: [M.yo] } } : null });
      return L;
    }
    // positive life areas
    L.push({ id: 'vim', f: M => { if (!M.md || !M.ad) return null; const a = sg(M.md), b = sg(M.ad), c = M.pd ? sg(M.pd) : 0; return (a >= 1 && b >= 1 && a + b + 0.5 * c >= 3) ? { test: 'tl_vim', params: { P: uniq([M.md, M.ad]), D: M.adEnd, A: ar }, hl: { p: [M.md, M.ad] } } : null; } });
    if (!tu) { const hsg = F.hs(A.pri), lsg = F.sign[F.lord(A.pri)];
      L.push({ id: 'dt', f: M => { const t = [hsg, lsg]; return t.some(s => influences('Ju', M.ju, s)) && t.some(s => influences('Sa', M.sa, s)) ? { test: 'tl_dt', params: { H: [A.pri], S: M.ju, X: M.sa }, hl: { h: [A.pri], p: [F.lord(A.pri)] } } : null; } }); }
    if (!tu && relSignsOf(F, ar)) { const RS = relSignsOf(F, ar); L.push({ id: 'chara', f: M => M.chM != null && RS.has(M.chM) && (M.chA == null || RS.has(M.chA) || M.chM === F.hs(A.pri)) ? { test: 'tl_chara', params: { S: M.chM, H: [sgn(M.chM - F.asc) + 1] }, hl: { s: [M.chM] } } : null }); }
    if (F.bav && !tu) L.push({ id: 'av', f: M => A.H.includes(sgn(M.ju - F.asc) + 1) && F.bav.Ju[M.ju] >= 4 && F.sav[M.ju] >= 28 ? { test: 'tl_av', params: { S: M.ju, H: [sgn(M.ju - F.asc) + 1], X: F.bav.Ju[M.ju] }, hl: { s: [M.ju] } } : null });
    if (!tu) L.push({ id: 'varsha', f: M => M.yr && (A.H.includes(M.yr.munthaHouse) || sg(M.yr.yearLord) >= 2) ? { test: 'tl_varsha', params: { H: [M.yr.munthaHouse], P: [M.yr.yearLord] }, hl: { p: [M.yr.yearLord] } } : null });
    if (A.kp && kpEv[A.kp] && kpEv[A.kp].verdict !== 'denied') {
      const rule = JE.kpEventRules ? JE.kpEventRules[A.kp] : null, fav = rule ? rule.fav : A.H, neg = rule ? rule.neg : [];
      L.push({ id: 'kp', f: M => { const s1 = kpSigOf(F, M.md), s2 = kpSigOf(F, M.ad); if (!s1 || !s2) return null; const f1 = fav.filter(h => s1.includes(h)).length, f2 = fav.filter(h => s2.includes(h)).length, n2 = neg.filter(h => s2.includes(h)).length; return f1 >= 1 && f2 >= 1 && f2 >= n2 ? { test: 'tl_kp', params: { P: uniq([M.md, M.ad]), Y: A.kp, H: fav }, hl: { p: [M.md, M.ad] } } : null; } });
    }
    L.push({ id: 'yogini', f: M => M.yo && sg(M.yo) >= 1.5 ? { test: 'tl_yogini', params: { P: [M.yo] }, hl: { p: [M.yo] } } : null });
    return L;
  }
  function relSignsOf(F, ar) { const A = AREAS[ar]; if (A.special) return null; const s = new Set(A.H.map(h => F.hs(h))); if (A.jk && F[A.jk]) s.add(F.sign[F[A.jk]]); return s; }
  function kpSigOf(F, X) { return F._kpSig ? F._kpSig[X] : null; }

  /* ------------------------------------------------------------------ SIMILAR CHARTS */
  // features of one chart for matching (the library stores these, computed with the default settings)
  function chartFeatures(C, opts) {
    const F = feat(C, opts && opts.at != null ? opts.at : nowJd());
    const yog = Object.values(F.yog).filter(y => y.rarity === 'rare' || y.rarity === 'uncommon').map(y => [y.id, y.rarity]);
    let themes = [];
    try { const S = synthesis(C, Object.assign({ kp: true, annual: false }, opts || {})); themes = S.themes.filter(x => x.area !== 'timing' && x.level !== 'moderate').map(x => x.id); } catch (e) { themes = []; }
    return { tu: F.tu, asc: F.tu ? null : F.asc, mo: F.sign.Mo, nak: F.pl.Mo.nak, su: F.sign.Su, ak: F.AK || null, yog, themes, houses: F.tu ? null : PL9.map(p => F.house[p]) };
  }
  const SIM_W = { asc: 3, mo: 3, nak: 4, su: 2, ak: 2, yog_rare: 3, yog_uncommon: 1.5, theme: 1.5, house: 0.8 };
  function similarCharts(C, library, opts) {
    opts = opts || {};
    const me = C.planets ? chartFeatures(C, opts) : C;
    const list = (library && (library.people || library)) || [];
    const out = [];
    for (const L of list) {
      const o = L.f || L.features; if (!o) continue;
      const shared = []; let score = 0;
      const addF = (key, w, params) => { score += w; shared.push({ key, w, params }); };
      if (!me.tu && !o.tu && me.asc === o.asc) addF('asc', SIM_W.asc, { S: me.asc });
      if (me.mo === o.mo) addF('mo', SIM_W.mo, { S: me.mo });
      if (me.nak === o.nak) addF('nak', SIM_W.nak, { N: me.nak });
      if (me.su === o.su) addF('su', SIM_W.su, { S: me.su });
      if (me.ak && me.ak === o.ak) addF('ak', SIM_W.ak, { P: [me.ak] });
      const oy = Object.fromEntries((o.yog || []).map(x => [x[0], x[1]]));
      for (const [id, r] of me.yog || []) if (oy[id]) addF('yog', r === 'rare' || oy[id] === 'rare' ? SIM_W.yog_rare : SIM_W.yog_uncommon, { Y: id, X: r });
      for (const t of me.themes || []) if ((o.themes || []).includes(t)) addF('theme', SIM_W.theme, { T: t });
      if (me.houses && o.houses && !me.tu && !o.tu) PL9.forEach((p, i) => { if (me.houses[i] === o.houses[i]) addF('house', p === 'Ra' || p === 'Ke' ? SIM_W.house / 2 : SIM_W.house, { P: [p], H: [me.houses[i]] }); });
      out.push({ id: L.id, name: L.name, field: L.field, rating: L.rating, desc: L.desc, flag: L.flag || null, score: r1(score), shared: shared.sort((a, b) => b.w - a.w) });
    }
    out.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
    return { me, matches: out.slice(0, opts.top || 6), maxScore: r1(SIM_W.asc + SIM_W.mo + SIM_W.nak + SIM_W.su + SIM_W.ak), weights: SIM_W, n: list.length };
  }

  Object.assign(JE, {
    VERSION4, synthesis, lifeTimeline, similarCharts, synthesisText, chartFeatures,
    _p4: { THEMES, THEME_BY_ID, AREAS, AREA_IDS, MINOR_AREAS, FAMS, SYNTH_BASE, TL_NEED, feat, scoreTheme, evalTheme, custom, yearAt, aspects, influences, lordSig, areaSig, funcGood, methodsFor, resolve, SIM_W }
  });
})((function () {
  let g; try { g = JE; } catch (e) { g = undefined; }
  if (g === undefined && typeof require !== 'undefined') g = require('./engine3.js');
  return g;
})());
if (typeof module !== 'undefined' && typeof require !== 'undefined') module.exports = require('./engine3.js');

;
/* Kundli Studio — famous-chart library and proof cases (generated by tests/proof-cases.js --write; do not edit by hand).
   Birth data: tests/famous-charts.json (Rodden AA/A). Descriptions are one-line summaries in our own words. */
var KS_FAMOUS = {"version":1,"generated":"2026-10-22","settings":"Lahiri, mean node, whole-sign houses; at = 2026-10-22","note":"Generated by tests/proof-cases.js from tests/famous-charts.json. Birth data with Rodden ratings (AA/A); event dates approximate to the month.","people":[{"id":"indira-gandhi","name":{"en":"Indira Gandhi","hi":"इंदिरा गांधी"},"field":"politics","rating":"A","desc":{"en":"Prime Minister of India (1966–77, 1980–84).","hi":"भारत की प्रधानमंत्री (1966–77, 1980–84)।"},"flag":null,"alt":null,"f":{"tu":false,"asc":3,"mo":9,"nak":20,"su":7,"ak":"Sa","yog":[["papa_kartari","uncommon"],["maha_bhagya","uncommon"]],"themes":["g_overthink","m_sensitive","f_homebody","w_property","t_steady","k_helping","cr_creative"],"houses":[5,7,2,5,11,6,1,6,12]}},{"id":"jawaharlal-nehru","name":{"en":"Jawaharlal Nehru","hi":"जवाहरलाल नेहरू"},"field":"politics","rating":"A","desc":{"en":"First Prime Minister of independent India.","hi":"स्वतंत्र भारत के पहले प्रधानमंत्री।"},"flag":"time_conflict","alt":"23:03","f":{"tu":false,"asc":3,"mo":3,"nak":8,"su":7,"ak":"Mo","yog":[["malavya","uncommon"],["pushkala","uncommon"],["papa_kartari","uncommon"],["graha_malika","uncommon"],["maha_bhagya","uncommon"]],"themes":["f_homebody","m_sensitive","g_boundaries","t_calm","cr_creative","r_romantic","st_improviser","k_helping","s_spiritual","w_property","st_charisma","st_courage","f_pillar"],"houses":[5,1,3,4,6,4,2,12,6]}},{"id":"swami-vivekananda","name":{"en":"Swami Vivekananda","hi":"स्वामी विवेकानंद"},"field":"spirituality","rating":"AA","desc":{"en":"Monk and teacher who carried Vedanta to the world.","hi":"संन्यासी व शिक्षक जिन्होंने वेदांत को विश्व तक पहुँचाया।"},"flag":null,"alt":null,"f":{"tu":false,"asc":8,"mo":5,"nak":12,"su":8,"ak":"Su","yog":[["bheri","uncommon"]],"themes":["st_courage","k_authority","st_improviser","t_leader","t_fiery","t_extro"],"houses":[1,10,5,2,11,2,10,12,6]}},{"id":"subhas-chandra-bose","name":{"en":"Subhas Chandra Bose","hi":"सुभाष चंद्र बोस"},"field":"freedom_movement","rating":"AA","desc":{"en":"Freedom-movement leader of the Indian National Army.","hi":"आज़ाद हिंद फ़ौज के स्वतंत्रता सेनानी नेता।"},"flag":"time_conflict","alt":"12:10","f":{"tu":false,"asc":0,"mo":5,"nak":11,"su":9,"ak":"Ve","yog":[["dur_yoga","uncommon"],["bheri","uncommon"]],"themes":["c_handson","c_listener","s_worldly","w_property","s_tradition","c_structured","st_prudent","r_practical","st_organised"],"houses":[10,6,2,10,5,11,8,10,4]}},{"id":"rajiv-gandhi","name":{"en":"Rajiv Gandhi","hi":"राजीव गांधी"},"field":"politics","rating":"AA","desc":{"en":"Pilot turned Prime Minister of India (1984–89).","hi":"पायलट से भारत के प्रधानमंत्री (1984–89)।"},"flag":null,"alt":null,"f":{"tu":false,"asc":4,"mo":4,"nak":10,"su":4,"ak":"Me","yog":[["pushkala","uncommon"],["papa_kartari","uncommon"],["pravrajya","rare"],["shula","uncommon"],["chamara","uncommon"],["bheri","uncommon"],["maha_bhagya","uncommon"],["rajalakshana","rare"]],"themes":["t_leader","st_courage","t_fiery","t_extro","st_improviser","k_authority","m_optimist","s_principled","w_gains","c_speaker","k_earlyrise","c_structured","r_devoted"],"houses":[1,1,2,1,1,1,11,12,6]}},{"id":"sonia-gandhi","name":{"en":"Sonia Gandhi","hi":"सोनिया गांधी"},"field":"politics","rating":"AA","desc":{"en":"Italian-born Indian political leader.","hi":"इटली में जन्मी भारतीय राजनीतिक नेता।"},"flag":null,"alt":null,"f":{"tu":false,"asc":3,"mo":2,"nak":5,"su":7,"ak":"Su","yog":[["malavya","uncommon"],["dur_yoga","uncommon"]],"themes":["cr_creative","g_boundaries","k_foreign","t_calm","cr_playful","k_helping","r_romantic","c_scholar","m_sensitive","t_collab","s_spiritual"],"houses":[5,12,6,5,4,4,1,11,5]}},{"id":"sachin-tendulkar","name":{"en":"Sachin Tendulkar","hi":"सचिन तेंदुलकर"},"field":"sports","rating":"A","desc":{"en":"Cricketer with the most international runs.","hi":"सबसे अधिक अंतरराष्ट्रीय रन बनाने वाले क्रिकेटर।"},"flag":"time_conflict","alt":"16:20","f":{"tu":false,"asc":3,"mo":8,"nak":19,"su":0,"ak":"Ma","yog":[["ruchaka","uncommon"],["mridanga","uncommon"],["jaya","rare"],["ashta_lakshmi","uncommon"]],"themes":["t_leader","st_courage","st_improviser","w_property","c_handson","t_fiery","t_extro","s_worldly"],"houses":[10,6,7,9,7,10,11,6,12]}},{"id":"ms-dhoni","name":{"en":"MS Dhoni","hi":"महेंद्र सिंह धोनी"},"field":"sports","rating":"A","desc":{"en":"Cricket captain who led India to world titles.","hi":"क्रिकेट कप्तान जिन्होंने भारत को विश्व ख़िताब दिलाए।"},"flag":null,"alt":null,"f":{"tu":false,"asc":2,"mo":4,"nak":11,"su":2,"ak":"Ma","yog":[["bhadra","uncommon"],["durudhara","uncommon"],["pushkala","uncommon"],["papa_kartari","uncommon"],["graha_malika","uncommon"],["maha_bhagya","uncommon"]],"themes":["t_fiery","m_rational","st_improviser","k_technical","t_quick","k_enterprise","k_authority","t_extro","st_courage","c_speaker"],"houses":[1,3,12,1,4,2,4,2,8]}},{"id":"sunil-gavaskar","name":{"en":"Sunil Gavaskar","hi":"सुनील गावस्कर"},"field":"sports","rating":"A","desc":{"en":"Opening batsman, first to 10,000 Test runs.","hi":"सलामी बल्लेबाज़, 10,000 टेस्ट रन बनाने वाले पहले खिलाड़ी।"},"flag":null,"alt":null,"f":{"tu":false,"asc":9,"mo":8,"nak":20,"su":2,"ak":"Mo","yog":[["bhadra","uncommon"]],"themes":["k_technical","s_worldly","cr_playful","g_focus"],"houses":[6,12,5,6,1,7,8,3,9]}},{"id":"rajesh-khanna","name":{"en":"Rajesh Khanna","hi":"राजेश खन्ना"},"field":"cinema","rating":"A","desc":{"en":"Hindi film actor, the first \"superstar\".","hi":"हिंदी फ़िल्म अभिनेता, पहले \"सुपरस्टार\"।"},"flag":null,"alt":null,"f":{"tu":false,"asc":4,"mo":4,"nak":10,"su":8,"ak":"Ju","yog":[["ruchaka","uncommon"],["bheri","uncommon"]],"themes":["st_improviser","st_courage","m_optimist","t_fiery","k_earlyrise","w_spender","st_charisma","t_extro","c_explorer","k_authority","s_principled","k_helping"],"houses":[5,1,4,5,11,5,10,1,7]}},{"id":"albert-einstein","name":{"en":"Albert Einstein","hi":"अल्बर्ट आइंस्टीन"},"field":"science","rating":"AA","desc":{"en":"Physicist of relativity.","hi":"सापेक्षता के भौतिक विज्ञानी।"},"flag":null,"alt":null,"f":{"tu":false,"asc":2,"mo":7,"nak":17,"su":11,"ak":"Ve","yog":[["malavya","uncommon"],["saraswati","uncommon"]],"themes":["cr_creative","f_homebody","c_explorer","cr_playful","g_boundaries","r_romantic","k_helping","m_sensitive","s_spiritual"],"houses":[10,6,8,10,9,10,10,8,2]}},{"id":"barack-obama","name":{"en":"Barack Obama","hi":"बराक ओबामा"},"field":"politics","rating":"AA","desc":{"en":"44th President of the United States.","hi":"संयुक्त राज्य अमेरिका के 44वें राष्ट्रपति।"},"flag":null,"alt":null,"f":{"tu":false,"asc":9,"mo":1,"nak":3,"su":3,"ak":"Ma","yog":[["dur_yoga","uncommon"],["maha_bhagya","uncommon"]],"themes":["c_handson","w_property","c_listener","st_resilient","r_practical","s_worldly"],"houses":[7,5,8,7,1,6,1,8,2]}},{"id":"steve-jobs","name":{"en":"Steve Jobs","hi":"स्टीव जॉब्स"},"field":"business","rating":"AA","desc":{"en":"Co-founder of Apple.","hi":"ऐपल के सह-संस्थापक।"},"flag":null,"alt":null,"f":{"tu":false,"asc":4,"mo":11,"nak":25,"su":10,"ak":"Ve","yog":[["vallaki","rare"],["lakshmi","uncommon"]],"themes":["st_courage","t_extro","t_fiery"],"houses":[7,8,9,6,11,5,3,5,11]}},{"id":"martin-luther-king","name":{"en":"Martin Luther King Jr.","hi":"मार्टिन लूथर किंग जूनियर"},"field":"social_reform","rating":"A","desc":{"en":"Civil-rights leader and preacher.","hi":"नागरिक अधिकार नेता और उपदेशक।"},"flag":"time_rounded","alt":null,"f":{"tu":false,"asc":0,"mo":10,"nak":24,"su":9,"ak":"Ma","yog":[["gaja","rare"]],"themes":["k_technical","t_leader","c_handson","k_enterprise","w_property","m_rational","st_resilient","w_spender","t_extro"],"houses":[10,11,2,10,1,11,9,2,8]}},{"id":"marilyn-monroe","name":{"en":"Marilyn Monroe","hi":"मर्लिन मुनरो"},"field":"cinema","rating":"AA","desc":{"en":"Hollywood film actress.","hi":"हॉलीवुड फ़िल्म अभिनेत्री।"},"flag":null,"alt":null,"f":{"tu":false,"asc":3,"mo":9,"nak":22,"su":1,"ak":"Sa","yog":[],"themes":["m_serious","w_property","f_pillar","w_saver","c_structured","t_steady","c_handson","k_technical","k_enterprise","r_practical"],"houses":[11,7,8,11,8,10,4,12,6]}},{"id":"winston-churchill","name":{"en":"Winston Churchill","hi":"विंस्टन चर्चिल"},"field":"politics","rating":"A","desc":{"en":"British wartime Prime Minister and writer.","hi":"युद्धकालीन ब्रिटिश प्रधानमंत्री और लेखक।"},"flag":null,"alt":null,"f":{"tu":false,"asc":5,"mo":4,"nak":9,"su":7,"ak":"Ve","yog":[],"themes":["c_handson"],"houses":[3,12,1,2,2,3,5,8,2]}},{"id":"bill-gates","name":{"en":"Bill Gates","hi":"बिल गेट्स"},"field":"business","rating":"A","desc":{"en":"Co-founder of Microsoft and philanthropist.","hi":"माइक्रोसॉफ़्ट के सह-संस्थापक और परोपकारी।"},"flag":null,"alt":null,"f":{"tu":false,"asc":3,"mo":11,"nak":25,"su":6,"ak":"Sa","yog":[["bhadra","uncommon"],["malavya","uncommon"]],"themes":["f_pillar","k_authority","f_homebody","t_extro","m_rational","t_collab","t_calm"],"houses":[4,9,3,3,2,4,4,5,11]}},{"id":"oprah-winfrey","name":{"en":"Oprah Winfrey","hi":"ओपरा विनफ्रे"},"field":"media","rating":"A","desc":{"en":"Talk-show host and media founder.","hi":"टॉक-शो प्रस्तोता और मीडिया संस्थापक।"},"flag":null,"alt":null,"f":{"tu":false,"asc":8,"mo":7,"nak":16,"su":9,"ak":"Ra","yog":[["ruchaka","uncommon"],["papa_kartari","uncommon"],["vishnu","rare"]],"themes":["c_handson","f_wanderer","c_listener","k_technical","s_tradition","r_practical","c_structured","w_property"],"houses":[2,12,12,2,6,2,11,2,8]}},{"id":"elvis-presley","name":{"en":"Elvis Presley","hi":"एल्विस प्रेस्ली"},"field":"music","rating":"AA","desc":{"en":"Singer, \"king of rock and roll\".","hi":"गायक, \"रॉक एंड रोल के राजा\"।"},"flag":null,"alt":null,"f":{"tu":false,"asc":7,"mo":10,"nak":23,"su":8,"ak":"Me","yog":[],"themes":["f_wanderer","t_extro"],"houses":[2,4,11,2,12,3,4,3,9]}},{"id":"muhammad-ali","name":{"en":"Muhammad Ali","hi":"मोहम्मद अली"},"field":"sports","rating":"AA","desc":{"en":"World heavyweight boxing champion.","hi":"विश्व हैवीवेट मुक्केबाज़ी चैंपियन।"},"flag":null,"alt":null,"f":{"tu":false,"asc":3,"mo":9,"nak":21,"su":9,"ak":"Sa","yog":[["ruchaka","uncommon"],["pravrajya","rare"],["shula","uncommon"],["maha_bhagya","uncommon"]],"themes":["r_practical","c_handson","k_technical","w_property","k_slowrise","k_authority","c_structured"],"houses":[7,7,10,7,11,7,10,2,8]}},{"id":"sigmund-freud","name":{"en":"Sigmund Freud","hi":"सिगमंड फ्रायड"},"field":"science","rating":"AA","desc":{"en":"Founder of psychoanalysis.","hi":"मनोविश्लेषण के संस्थापक।"},"flag":null,"alt":null,"f":{"tu":false,"asc":6,"mo":1,"nak":3,"su":0,"ak":"Ra","yog":[["durudhara","uncommon"],["pushkala","uncommon"],["dur_yoga","uncommon"],["garuda","rare"]],"themes":["s_worldly","w_property","g_patience","f_wanderer","c_handson"],"houses":[7,8,12,8,6,7,9,7,1]}},{"id":"pablo-picasso","name":{"en":"Pablo Picasso","hi":"पाब्लो पिकासो"},"field":"art","rating":"AA","desc":{"en":"Painter and sculptor, co-founder of Cubism.","hi":"चित्रकार व मूर्तिकार, घनवाद के सह-संस्थापक।"},"flag":null,"alt":null,"f":{"tu":false,"asc":3,"mo":7,"nak":16,"su":6,"ak":"Ma","yog":[["dur_yoga","uncommon"],["hari","rare"]],"themes":["cr_creative","r_romantic","st_improviser","st_resilient","s_spiritual"],"houses":[4,5,12,5,11,3,10,5,11]}},{"id":"franklin-d-roosevelt","name":{"en":"Franklin D. Roosevelt","hi":"फ्रैंकलिन डी. रूजवेल्ट"},"field":"politics","rating":"AA","desc":{"en":"32nd President of the United States.","hi":"संयुक्त राज्य अमेरिका के 32वें राष्ट्रपति।"},"flag":null,"alt":null,"f":{"tu":false,"asc":5,"mo":2,"nak":5,"su":9,"ak":"Ju","yog":[["dur_yoga","uncommon"]],"themes":["s_worldly","s_reformer","c_handson","m_rational","f_wanderer","c_speaker","k_enterprise"],"houses":[5,10,10,6,8,5,8,3,9]}}],"proof":{"stats":{"people":23,"counted":19,"events":93,"hits":7,"rate":0.075,"ci95":[0.037,0.147],"anyWindowHits":13,"expectedByCoverage":7.94,"pCoverage":0.7,"shiftedMean":7.4,"shiftedRange":[2,13],"shifts":30,"pPermutation":0.677,"better":false,"perArea":{"marriage":{"n":17,"hit":1,"exp":0.71},"career":{"n":27,"hit":1,"exp":2.99},"care":{"n":6,"hit":0,"exp":0.82},"favourable":{"n":15,"hit":4,"exp":1.88},"children":{"n":7,"hit":0,"exp":0.22},"spiritual":{"n":2,"hit":0,"exp":0.11},"education":{"n":7,"hit":0,"exp":0.36},"travel":{"n":7,"hit":0,"exp":0.58},"finance":{"n":2,"hit":1,"exp":0.26},"property":{"n":3,"hit":0,"exp":0.02}}},"cases":[{"id":"indira-gandhi","name":{"en":"Indira Gandhi","hi":"इंदिरा गांधी"},"rating":"A","excluded":false,"time":"23:11","alt":null,"events":[{"cat":"marriage","area":"marriage","ym":"1942-03","hit":false,"any":true,"gated":false,"win":"1941-12…1942-05","strength":"moderate","chance":0,"altHit":null},{"cat":"career_rise","area":"career","ym":"1966-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"challenging","area":"care","ym":"1977-03","hit":false,"any":true,"gated":false,"win":"1976-11…1977-11","strength":"moderate","chance":0.219,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1980-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.07,"altHit":null},{"cat":"children","area":"children","ym":"1944-08","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null}]},{"id":"jawaharlal-nehru","name":{"en":"Jawaharlal Nehru","hi":"जवाहरलाल नेहरू"},"rating":"A","excluded":true,"time":"23:30","alt":"23:03","events":[{"cat":"travel_relocation","area":"travel","ym":"1905-05","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":false},{"cat":"education","area":"education","ym":"1912-07","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.06,"altHit":false},{"cat":"marriage","area":"marriage","ym":"1916-02","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.07,"altHit":false},{"cat":"challenging","area":"care","ym":"1921-12","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.147,"altHit":false},{"cat":"career_rise","area":"career","ym":"1947-08","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.117,"altHit":false}]},{"id":"swami-vivekananda","name":{"en":"Swami Vivekananda","hi":"स्वामी विवेकानंद"},"rating":"AA","excluded":false,"time":"06:33","alt":null,"events":[{"cat":"spiritual","area":"spiritual","ym":"1881-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.054,"altHit":null},{"cat":"education","area":"education","ym":"1884-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"travel_relocation","area":"travel","ym":"1893-05","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.007,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1893-09","hit":false,"any":true,"gated":false,"win":"1893-07…1894-07","strength":"moderate","chance":0.038,"altHit":null},{"cat":"spiritual","area":"spiritual","ym":"1897-05","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.054,"altHit":null}]},{"id":"subhas-chandra-bose","name":{"en":"Subhas Chandra Bose","hi":"सुभाष चंद्र बोस"},"rating":"AA","excluded":true,"time":"12:00","alt":"12:10","events":[{"cat":"travel_relocation","area":"travel","ym":"1919-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":true},{"cat":"education","area":"education","ym":"1920-07","hit":false,"any":true,"gated":false,"win":"1920-01…1920-07","strength":"moderate","chance":0,"altHit":false},{"cat":"career_rise","area":"career","ym":"1921-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.215,"altHit":false},{"cat":"career_rise","area":"career","ym":"1938-02","hit":true,"any":true,"gated":false,"win":"1938-01…1939-01","strength":"clear","chance":0.215,"altHit":true},{"cat":"career_rise","area":"career","ym":"1943-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.215,"altHit":false}]},{"id":"rajiv-gandhi","name":{"en":"Rajiv Gandhi","hi":"राजीव गांधी"},"rating":"AA","excluded":false,"time":"06:34","alt":null,"events":[{"cat":"marriage","area":"marriage","ym":"1968-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"children","area":"children","ym":"1970-06","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.023,"altHit":null},{"cat":"career_rise","area":"career","ym":"1981-06","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"career_rise","area":"career","ym":"1984-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"challenging","area":"care","ym":"1989-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.183,"altHit":null}]},{"id":"sonia-gandhi","name":{"en":"Sonia Gandhi","hi":"सोनिया गांधी"},"rating":"AA","excluded":false,"time":"21:30","alt":null,"events":[{"cat":"marriage","area":"marriage","ym":"1968-02","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"children","area":"children","ym":"1970-06","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"travel_relocation","area":"travel","ym":"1983-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.082,"altHit":null},{"cat":"career_rise","area":"career","ym":"1998-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.051,"altHit":null},{"cat":"favourable","area":"favourable","ym":"2004-05","hit":false,"any":true,"gated":false,"win":"2002-12…2004-09","strength":"moderate","chance":0.124,"altHit":null}]},{"id":"sachin-tendulkar","name":{"en":"Sachin Tendulkar","hi":"सचिन तेंदुलकर"},"rating":"A","excluded":true,"time":"13:00","alt":"16:20","events":[{"cat":"career_rise","area":"career","ym":"1989-11","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":false},{"cat":"marriage","area":"marriage","ym":"1995-05","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.053,"altHit":false},{"cat":"children","area":"children","ym":"1997-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":false},{"cat":"favourable","area":"favourable","ym":"2011-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.134,"altHit":false},{"cat":"career_rise","area":"career","ym":"2013-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.092,"altHit":false}]},{"id":"ms-dhoni","name":{"en":"MS Dhoni","hi":"महेंद्र सिंह धोनी"},"rating":"A","excluded":false,"time":"05:10","alt":null,"events":[{"cat":"career_rise","area":"career","ym":"2004-12","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.126,"altHit":null},{"cat":"favourable","area":"favourable","ym":"2007-09","hit":true,"any":true,"gated":false,"win":"2006-07…2007-12","strength":"clear","chance":0.146,"altHit":null},{"cat":"marriage","area":"marriage","ym":"2010-07","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.132,"altHit":null},{"cat":"favourable","area":"favourable","ym":"2011-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.146,"altHit":null},{"cat":"children","area":"children","ym":"2015-02","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.061,"altHit":null}]},{"id":"sunil-gavaskar","name":{"en":"Sunil Gavaskar","hi":"सुनील गावस्कर"},"rating":"A","excluded":false,"time":"20:42","alt":null,"events":[{"cat":"career_rise","area":"career","ym":"1971-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.176,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1983-06","hit":true,"any":true,"gated":false,"win":"1981-11…1983-12","strength":"clear","chance":0.061,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1987-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.061,"altHit":null},{"cat":"career_rise","area":"career","ym":"1987-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.176,"altHit":null}]},{"id":"rajesh-khanna","name":{"en":"Rajesh Khanna","hi":"राजेश खन्ना"},"rating":"A","excluded":false,"time":"00:25","alt":null,"events":[{"cat":"career_rise","area":"career","ym":"1966-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.197,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1969-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.109,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1973-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.026,"altHit":null},{"cat":"children","area":"children","ym":"1974-12","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.019,"altHit":null},{"cat":"career_rise","area":"career","ym":"1992-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.197,"altHit":null}]},{"id":"albert-einstein","name":{"en":"Albert Einstein","hi":"अल्बर्ट आइंस्टीन"},"rating":"AA","excluded":false,"time":"11:30","alt":null,"events":[{"cat":"education","area":"education","ym":"1896-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.079,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1903-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.101,"altHit":null},{"cat":"career_rise","area":"career","ym":"1905-06","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.211,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1921-12","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.123,"altHit":null},{"cat":"travel_relocation","area":"travel","ym":"1933-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.194,"altHit":null}]},{"id":"barack-obama","name":{"en":"Barack Obama","hi":"बराक ओबामा"},"rating":"AA","excluded":false,"time":"19:24","alt":null,"events":[{"cat":"education","area":"education","ym":"1991-05","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1992-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"children","area":"children","ym":"1998-07","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"career_rise","area":"career","ym":"2004-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.101,"altHit":null},{"cat":"career_rise","area":"career","ym":"2008-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.101,"altHit":null}]},{"id":"steve-jobs","name":{"en":"Steve Jobs","hi":"स्टीव जॉब्स"},"rating":"AA","excluded":false,"time":"19:15","alt":null,"events":[{"cat":"education","area":"education","ym":"1972-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.159,"altHit":null},{"cat":"career_rise","area":"career","ym":"1976-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.234,"altHit":null},{"cat":"challenging","area":"care","ym":"1985-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.124,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1991-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"career_rise","area":"career","ym":"1997-09","hit":true,"any":true,"gated":false,"win":"1996-02…1998-02","strength":"strong","chance":0.234,"altHit":null}]},{"id":"martin-luther-king","name":{"en":"Martin Luther King Jr.","hi":"मार्टिन लूथर किंग जूनियर"},"rating":"A","excluded":true,"time":"12:00","alt":null,"events":[{"cat":"marriage","area":"marriage","ym":"1953-06","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.149,"altHit":null},{"cat":"education","area":"education","ym":"1955-06","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"career_rise","area":"career","ym":"1955-12","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.069,"altHit":null},{"cat":"challenging","area":"care","ym":"1963-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.076,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1964-12","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.051,"altHit":null}]},{"id":"marilyn-monroe","name":{"en":"Marilyn Monroe","hi":"मर्लिन मुनरो"},"rating":"AA","excluded":false,"time":"09:30","alt":null,"events":[{"cat":"marriage","area":"marriage","ym":"1942-06","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"career_rise","area":"career","ym":"1946-08","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.115,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1954-01","hit":true,"any":true,"gated":false,"win":"1953-07…1954-06","strength":"clear","chance":0.048,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1956-06","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.048,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1962-05","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.182,"altHit":null}]},{"id":"winston-churchill","name":{"en":"Winston Churchill","hi":"विंस्टन चर्चिल"},"rating":"A","excluded":false,"time":"01:30","alt":null,"events":[{"cat":"career_rise","area":"career","ym":"1900-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.059,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1908-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.075,"altHit":null},{"cat":"challenging","area":"care","ym":"1915-05","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.047,"altHit":null},{"cat":"career_rise","area":"career","ym":"1940-05","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1953-10","hit":false,"any":true,"gated":false,"win":"1953-08…1953-11","strength":"moderate","chance":0.27,"altHit":null}]},{"id":"bill-gates","name":{"en":"Bill Gates","hi":"बिल गेट्स"},"rating":"A","excluded":false,"time":"22:00","alt":null,"events":[{"cat":"education","area":"education","ym":"1973-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.127,"altHit":null},{"cat":"career_rise","area":"career","ym":"1975-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.117,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1994-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.171,"altHit":null},{"cat":"children","area":"children","ym":"1996-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.117,"altHit":null},{"cat":"finances","area":"finance","ym":"2000-01","hit":true,"any":true,"gated":false,"win":"1999-05…2002-06","strength":"strong","chance":0.213,"altHit":null}]},{"id":"oprah-winfrey","name":{"en":"Oprah Winfrey","hi":"ओपरा विनफ्रे"},"rating":"A","excluded":false,"time":"04:30","alt":null,"events":[{"cat":"travel_relocation","area":"travel","ym":"1984-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.073,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1986-01","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.101,"altHit":null},{"cat":"career_rise","area":"career","ym":"1986-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.232,"altHit":null},{"cat":"finances","area":"finance","ym":"1986-10","hit":false,"any":true,"gated":false,"win":"1985-09…1987-01","strength":"moderate","chance":0.045,"altHit":null},{"cat":"career_rise","area":"career","ym":"2011-05","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.232,"altHit":null}]},{"id":"elvis-presley","name":{"en":"Elvis Presley","hi":"एल्विस प्रेस्ली"},"rating":"AA","excluded":false,"time":"04:35","alt":null,"events":[{"cat":"career_rise","area":"career","ym":"1954-07","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.168,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1956-01","hit":true,"any":true,"gated":false,"win":"1955-01…1959-01","strength":"clear","chance":0.185,"altHit":null},{"cat":"property","area":"property","ym":"1957-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"challenging","area":"care","ym":"1958-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.077,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1967-05","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.105,"altHit":null}]},{"id":"muhammad-ali","name":{"en":"Muhammad Ali","hi":"मोहम्मद अली"},"rating":"AA","excluded":false,"time":"18:35","alt":null,"events":[{"cat":"favourable","area":"favourable","ym":"1960-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.13,"altHit":null},{"cat":"career_rise","area":"career","ym":"1964-02","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.083,"altHit":null},{"cat":"challenging","area":"care","ym":"1967-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.173,"altHit":null},{"cat":"favourable","area":"favourable","ym":"1974-10","hit":true,"any":true,"gated":false,"win":"1974-02…1975-02","strength":"clear","chance":0.13,"altHit":null}]},{"id":"sigmund-freud","name":{"en":"Sigmund Freud","hi":"सिगमंड फ्रायड"},"rating":"AA","excluded":false,"time":"18:30","alt":null,"events":[{"cat":"education","area":"education","ym":"1873-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1886-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"property","area":"property","ym":"1891-09","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.022,"altHit":null},{"cat":"career_rise","area":"career","ym":"1899-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.032,"altHit":null},{"cat":"travel_relocation","area":"travel","ym":"1938-06","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":null}]},{"id":"pablo-picasso","name":{"en":"Pablo Picasso","hi":"पाब्लो पिकासो"},"rating":"AA","excluded":false,"time":"23:15","alt":null,"events":[{"cat":"travel_relocation","area":"travel","ym":"1900-10","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.112,"altHit":null},{"cat":"travel_relocation","area":"travel","ym":"1904-04","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.112,"altHit":null},{"cat":"career_rise","area":"career","ym":"1907-07","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.089,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1918-07","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"property","area":"property","ym":"1958-09","hit":false,"any":false,"gated":true,"win":null,"strength":null,"chance":0,"altHit":null}]},{"id":"franklin-d-roosevelt","name":{"en":"Franklin D. Roosevelt","hi":"फ्रैंकलिन डी. रूजवेल्ट"},"rating":"AA","excluded":false,"time":"20:45","alt":null,"events":[{"cat":"education","area":"education","ym":"1904-06","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"marriage","area":"marriage","ym":"1905-03","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0,"altHit":null},{"cat":"career_rise","area":"career","ym":"1910-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.018,"altHit":null},{"cat":"career_rise","area":"career","ym":"1928-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.018,"altHit":null},{"cat":"career_rise","area":"career","ym":"1932-11","hit":false,"any":false,"gated":false,"win":null,"strength":null,"chance":0.018,"altHit":null}]}]}};
if (typeof module !== 'undefined' && module.exports) module.exports = KS_FAMOUS; else (typeof self !== 'undefined' ? self : globalThis).KS_FAMOUS = KS_FAMOUS;

;(self.KS_PACK = self.KS_PACK || {}).content3 = {"b64":"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","len":549953};
self.KS_PACK.content4 = {"b64":"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","len":100836};
/* =====================================================================
   Kundli Studio — Phase 3 screens (app3.js). Loaded lazily in the phase3 bundle together with
   engine3.js and content3.js; registers its views with app.js through the module API K.
   Systems tab: Dashas (all 24 systems, the shared zoomable timeline), Jaimini, KP, Varshaphal, Lal Kitab.
   Plan & more: Prashna, Rectify. Every text is bilingual; astrology is shown as a tradition, never as certainty.
   ===================================================================== */
(function (G) {
'use strict';
(G.KS_MODS = G.KS_MODS || []).push(function app3(K) {
const { S, esc, tr, L, num, fx, dms, fmtDate, fmtDur, pn, pnA, sgn, sab, pab, nkn, ord, pcol, term, P, PL9, PL7, SIGN_LORD, houseOf, signOfHouse, chartModel, chartSVG, regionCenter, AFTER, DT, $, $$, clamp, nowJd, hi, toast, showDetail, rerenderAt, rerenderKeep, go } = K;
const JE = () => K.JE, JC = () => K.JC || {};
K.addTX({
  p3sysAbout: ['About this system', 'इस पद्धति के बारे में'], whenUsed: ['When it is used', 'कब प्रयोग होती है'], src: ['Source', 'स्रोत'], cycle: ['cycle', 'चक्र'],
  options3: ['Options', 'विकल्प'], antarMode: ['Antardasha split', 'अंतर्दशा विभाजन'], antEqual: ['Equal (JH)', 'समान (JH)'], antProp: ['Proportional (BPHS)', 'आनुपातिक (BPHS)'],
  yearLen: ['Year length', 'वर्ष की लंबाई'], chartDefault: ['chart setting', 'कुंडली सेटिंग'], variant: ['Variant', 'रूप'], seed: ['Starting sign', 'आरंभ राशि'], seedStrong: ['Stronger of lagna/7th (JH)', 'लग्न/सप्तम में बली (JH)'], seedLagna: ['From the lagna', 'लग्न से'],
  forYear: ['For the year', 'वर्ष'], ageL: ['age', 'आयु'], gati: ['Gati (jump)', 'गति'], deha: ['Deha', 'देह'], jeeva: ['Jeeva', 'जीव'], group3: ['Group', 'समूह'], paramayush: ['Paramayush', 'परमायु'],
  overlay: ['Overlay', 'परत'], ovArudha: ['Arudhas', 'आरूढ़'], ovGraha: ['Graha arudhas', 'ग्रह आरूढ़'], ovKarakamsa: ['Karakamsa (D9)', 'कारकांश (D9)'], ovArgala: ['Argala arrows', 'अर्गला तीर'],
  argalaFor: ['Argala on house', 'इस भाव पर अर्गला'], onAL: ['on Arudha lagna', 'आरूढ़ लग्न पर'], primary: ['primary', 'मुख्य'], secondary: ['secondary', 'गौण'], malefic3: ['malefics in 3rd', '3 में पाप ग्रह'],
  shubha: ['benefic', 'शुभ'], papa: ['malefic', 'पाप'], mixed: ['mixed', 'मिश्रित'], obstructedBy: ['obstructed from', 'बाधा'], karakamsa: ['Karakamsa', 'कारकांश'], swamsa: ['Swamsa', 'स्वांश'], ishta: ['Ishta devata', 'इष्ट देवता'],
  grahaArudhas: ['Graha arudhas', 'ग्रह आरूढ़'], ownSign: ['own sign', 'स्वराशि'], exception: ['exception', 'अपवाद'], second: ['2nd from it', 'इससे दूसरा'], jYogas: ['Jaimini yogas', 'जैमिनी योग'], sthiraK: ['Sthira karakas', 'स्थिर कारक'],
  trinity: ['Brahma · Rudra · Maheshwara', 'ब्रह्मा · रुद्र · महेश्वर'], longevityT: ['Longevity framework (Ayur khanda)', 'आयु खंड (परंपरागत ढाँचा)'], longevityNote: ['A traditional classification only — it never predicts a lifespan.', 'केवल परंपरागत वर्गीकरण — यह कभी आयु की भविष्यवाणी नहीं करता।'],
  kpTitle: ['Krishnamurti Paddhati (KP)', 'कृष्णमूर्ति पद्धति (केपी)'], cusps: ['Cusps (Placidus)', 'भाव संधियाँ (प्लेसिडस)'], signLord: ['Sign lord', 'राशि स्वामी'], significators: ['Significators (A–D)', 'कारक (A–D)'], houseSig: ['House significators', 'भाव कारक'],
  signifies: ['Signifies houses', 'भावों का कारक'], events: ['Event promise (cuspal sub-lord)', 'घटना वचन (भाव-संधि उप-स्वामी)'], csl: ['Cusp sub lord', 'भाव-संधि उप-स्वामी'], cslStar: ['its star lord', 'उसका नक्षत्र स्वामी'], fav: ['for', 'पक्ष'], neg: ['against', 'विपक्ष'],
  promised: ['promised', 'संकेतित'], notApplicable: ['not applicable', 'लागू नहीं'], conf_high: ['high', 'अधिक'], conf_medium: ['medium', 'मध्यम'], conf_moderate: ['moderate', 'मध्यम'], yearLordRule: ['Year-lord rule', 'वर्षेश नियम'], ylFriendly: ['Friendly aspect first (default)', 'मित्र दृष्टि पहले (मानक)'], ylPlain: ['Plain Neelakanthi', 'सरल नीलकंठी'], brahmaMode: ['Brahma reading', 'ब्रह्मा गणना'], brHouses: ['Houses 1–7 (JH, default)', 'भाव 1–7 (JH, मानक)'], brVisible: ['Visible half (7–12)', 'दृश्य अर्ध (7–12)'], harshaMe: ['Mercury in Harsha bala', 'हर्ष बल में बुध'], conf_low: ['low', 'कम'], conf_none: ['none', 'कोई नहीं'], deniedV: ['not indicated', 'संकेत नहीं'], mixedV: ['mixed', 'मिश्रित'], tendency: ['tendency noted', 'प्रवृत्ति'], rpNow: ['Ruling planets — now', 'शासक ग्रह — अभी'], rpLive: ['updates every 30 s', 'हर 30 सेकंड अपडेट'],
  dayLord: ['Day lord', 'वार स्वामी'], combined: ['Combined', 'संयुक्त'], nodeAgency: ['Node agency', 'राहु/केतु प्रतिनिधित्व'], horary: ['KP horary (1–249)', 'केपी प्रश्न (1–249)'], pickNumber: ['Think of the question, then pick a number', 'प्रश्न मन में रखें, फिर एक संख्या चुनें'],
  go: ['Go', 'देखें'], clear: ['Clear', 'मिटाएँ'], question: ['Question', 'प्रश्न'], horaryAsc: ['Horary ascendant', 'प्रश्न लग्न'], tapHL: ['Tap a cusp or planet row to highlight what it signifies.', 'जिसका कारक है उसे देखने के लिए भाव या ग्रह की पंक्ति पर टैप करें।'],
  kpAyan: ['KP ayanamsa', 'केपी अयनांश'], kpNew: ['KP new (default)', 'केपी नया (मानक)'], kpOld: ['KP old', 'केपी पुराना'], warnings: ['Notes', 'टिप्पणियाँ'],
  varshaTitle: ['Varshaphal (annual chart)', 'वर्षफल (वार्षिक कुंडली)'], solarReturn: ['Solar return', 'सूर्य प्रवेश'], thisYear: ['This year', 'यह वर्ष'], muntha: ['Muntha', 'मुंथा'], yearLord: ['Year lord (Varsheshwar)', 'वर्षेश'],
  officeBearers: ['Five office-bearers (Pancha adhikari)', 'पंचाधिकारी'], aspectOnLagna: ['aspect on lagna', 'लग्न पर दृष्टि'], pvb: ['Pancha-vargiya bala', 'पंचवर्गीय बल'], harsha: ['Harsha bala', 'हर्ष बल'], tajYogas: ['Tajika yogas', 'ताजिक योग'],
  tajAspects: ['Tajika aspects', 'ताजिक दृष्टियाँ'], sahams: ['Sahams', 'सहम'], mudda: ['Mudda dasha', 'मुद्दा दशा'], patyayini: ['Patyayini dasha', 'पात्यायिनी दशा'], monthly: ['Monthly charts (Masa pravesha)', 'मासिक कुंडलियाँ (मास प्रवेश)'],
  residence: ['Residence for the year', 'वर्ष का निवास'], applying: ['applying', 'आसन्न'], separating: ['separating', 'वियोगी'], orb: ['orb', 'दीप्तांश'], formula: ['Formula', 'सूत्र'], meaning: ['Meaning', 'अर्थ'],
  lkTitle: ['Lal Kitab', 'लाल किताब'], teva: ['Teva (Lal Kitab chart)', 'टेवा (लाल किताब कुंडली)'], lkReadings: ['Planets in houses', 'भावों में ग्रह'], rin: ['Debts (Rin)', 'ऋण'], noRin: ['No debt pattern found.', 'कोई ऋण योग नहीं मिला।'],
  sleeping: ['Sleeping planets & houses', 'सोए ग्रह व भाव'], masnui: ['Artificial planets (Masnui)', 'मसनूई ग्रह'], tevaType: ['Teva type', 'टेवा प्रकार'], showRemedies: ['Show optional remedies', 'वैकल्पिक उपाय दिखाएँ'], hideRemedies: ['Hide remedies', 'उपाय छिपाएँ'],
  lkVarshphal: ['Age-based varshphal (1–120)', 'आयु आधारित वर्षफल (1–120)'], runningYear: ['Running year', 'चालू वर्ष'], allYears: ['All 120 years', 'सभी 120 वर्ष'], houses3: ['Houses', 'भाव'],
  prTitle: ['Prashna (question chart)', 'प्रश्न कुंडली'], askNow: ['Ask now', 'अभी पूछें'], askHelp: ['Hold one clear question in mind and tap — the chart is cast for this moment and place.', 'मन में एक स्पष्ट प्रश्न रखें और टैप करें — इसी क्षण और स्थान की कुंडली बनेगी।'],
  numberMode: ['Number method', 'संख्या विधि'], none: ['None', 'कोई नहीं'], kpNum: ['KP 1–249', 'केपी 1–249'], vedicNum: ['Vedic 1–108', 'वैदिक 1–108'], verdict: ['Traditional indication', 'परंपरागत संकेत'], rulesChecked: ['Rules checked', 'जाँचे गए नियम'],
  timing: ['timing', 'समय'], positive: ['supports', 'पक्ष में'], negative: ['against', 'विपक्ष में'], karyaHouse: ['Question house', 'कार्य भाव'], askedAt: ['Asked at', 'पूछा गया'], howAsk: ['How to ask', 'कैसे पूछें'], vedicNumRes: ['Vedic number (navamsa)', 'वैदिक संख्या (नवांश)'],
  rcTitle: ['Birth-time rectification helper', 'जन्म-समय शोधन सहायक'], rcEvents: ['Life events', 'जीवन की घटनाएँ'], addEvent: ['Add event', 'घटना जोड़ें'], weight: ['Weight', 'महत्व'], windowL: ['Search window', 'खोज सीमा'], stepL: ['Step', 'अंतराल'],
  runRect: ['Find candidate times', 'संभावित समय खोजें'], candidates: ['Ranked candidate times', 'क्रमबद्ध संभावित समय'], scoreCurve: ['Score across the window', 'पूरी सीमा में अंक'], preview: ['Preview this time', 'इस समय को देखें'],
  minutes: ['min', 'मिनट'], timeBand: ['Time-band boundaries', 'समय-सीमा परिवर्तन'], lagnaStable: ['Lagna stays the same', 'लग्न एक ही रहता है'], kundaWin: ['Kunda windows', 'कुंड खिड़कियाँ'], needEvents: ['Add at least two dated events (more is better).', 'कम से कम दो तिथि वाली घटनाएँ जोड़ें (अधिक बेहतर)।'],
  noClear: ['No clear winner — several times fit about equally well.', 'कोई स्पष्ट विजेता नहीं — कई समय लगभग बराबर मेल खाते हैं।'], confidence: ['Confidence', 'विश्वास'], useTime: ['Use this time for the profile', 'इस समय को प्रोफ़ाइल में अपनाएँ'],
  useTimeQ: ['Change the saved birth time to', 'सहेजा जन्म-समय बदलें:'], helperNote: ['A helper for comparing times, never a certainty.', 'समय की तुलना का सहायक, निश्चितता नहीं।'], kinds: ['Show', 'दिखाएँ'], delEvent: ['Remove', 'हटाएँ']
});
// ---------------------------------------------------------------- helpers
const STHK = { father: ['Father', 'पिता'], mother: ['Mother', 'माता'], siblings: ['Siblings', 'भाई-बहन'], relatives: ['Relatives', 'संबंधी'], children: ['Children', 'संतान'], spouse: ['Spouse', 'जीवनसाथी'], longevity: ['Longevity', 'आयु'] }, sthk = k => STHK[k] ? STHK[k][hi() ? 1 : 0] : k;
const tx = o => { if (o == null) return ''; if (typeof o === 'string') return o; if (Array.isArray(o)) return o.map(tx).join(' '); if ('en' in o || 'hi' in o) { const v = o[S.lang] != null ? o[S.lang] : o.en; return Array.isArray(v) ? v.join(' ') : String(v == null ? '' : v); } if (o.text) return tx(o.text); if (o.name) return tx(o.name); return ''; };
const txList = o => { if (!o) return []; const v = o.en || o.hi ? (o[S.lang] || o.en) : o; return Array.isArray(v) ? v : [tx(o)]; };
const g = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const nm = (o, fb) => o && o.name ? tx(o.name) : fb;
const pill = (t, c) => '<span class="pill ' + (c || '') + '">' + t + '</span>';
const tbl = (head, rows, cls) => '<div class="tablewrap"><table' + (cls ? ' class="' + cls + '"' : '') + '><thead><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
const card = (title, body, id, cls) => '<div class="card' + (cls ? ' ' + cls : '') + '"' + (id ? ' id="' + id + '"' : '') + '>' + (title ? '<h2>' + title + '</h2>' : '') + body + '</div>';
const plist = arr => (arr && arr.length ? arr.map(id => esc(pn(id))).join(', ') : '—');
const hlist = arr => (arr && arr.length ? arr.map(h => num(h)).join(', ') : '—');
const isoLocal = (jd, off) => JE().isoLocal ? JE().isoLocal(jd, off) : '';
const signSafe = s => (s == null || isNaN(s) ? '—' : esc(sgn(s)));
const lord = n => n.lord && n.lord !== 'La' ? n.lord : (n.lord === 'La' ? 'La' : SIGN_LORD[n.sign]);
const memo = new Map();
function cached(key, fn) { if (memo.has(key)) return memo.get(key); const v = fn(); if (memo.size > 60) memo.delete(memo.keys().next().value); memo.set(key, v); return v; }
const ckey = C => C.meta.jdUT + '|' + JSON.stringify(C.meta.options || {}) + S.ayan + S.node + S.houses + (C.meta.input ? JSON.stringify(C.meta.input.place) : '');
function safe(fn, label) { try { return fn(); } catch (e) { console.error(label || 'phase3', e); return '<div class="banner err">⚠️ ' + esc(label || '') + ' — ' + esc(e.message) + '</div>'; } }
const yearNow = () => new Date().getFullYear();
const curAge = C => Math.max(0, Math.floor((nowJd() - C.meta.jdUT) / 365.2422));
function seg(id, cur, opts) { return '<div class="seg" id="' + id + '" role="group">' + opts.map(([v, l]) => '<button type="button" data-v="' + esc(v) + '" class="' + (String(cur) === String(v) ? 'on' : '') + '" aria-pressed="' + (String(cur) === String(v)) + '">' + l + '</button>').join('') + '</div>'; }
// a chart overlay: arrows between sign regions (argala, aspects)
function arrowSvg(M, list) {
  if (!list.length) return '';
  let s = '<defs>' + ['g', 'r', 'a', 'n'].map(c => '<marker id="ksah' + c + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah ' + c + '"/></marker>').join('') + '</defs><g class="arrows">';
  for (const a of list) {
    let [x1, y1] = regionCenter(M, a.from), [x2, y2] = regionCenter(M, a.to);
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, cut = 22;
    x1 += dx / d * cut * 0.6; y1 += dy / d * cut * 0.6; x2 -= dx / d * cut; y2 -= dy / d * cut;
    const mx = (x1 + x2) / 2 - dy / d * 18, my = (y1 + y2) / 2 + dx / d * 18; // gentle curve so arrows do not overlap the diagonals
    s += '<path class="arr ' + a.c + (a.dash ? ' dash' : '') + '" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" marker-end="url(#ksah' + a.c + ')"><title>' + esc(a.title || '') + '</title></path>';
  }
  return s + '</g>';
}
const withOverlay = (svg, extra) => svg.replace(/<\/svg>$/, extra + '</svg>');
// static period bar (Mudda, Patyayini): segments across a span, each tappable
function periodBar(nodes, key, nameOf, colorOf, t0, t1, nowJ) {
  const W = 1000, H = 46, X = jd => (jd - t0) / (t1 - t0) * W;
  let s = '<svg class="pbarsvg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(key) + '">';
  nodes.forEach((n, i) => {
    const x = X(n.start), w = Math.max(1, X(n.end) - x);
    s += '<rect class="pseg" data-pseg="' + key + ':' + i + '" x="' + x.toFixed(1) + '" y="4" width="' + w.toFixed(1) + '" height="30" rx="4" style="fill:' + colorOf(n) + '"><title>' + esc(nameOf(n) + ' · ' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO)) + '</title></rect>';
  });
  if (nowJ >= t0 && nowJ <= t1) s += '<line x1="' + X(nowJ).toFixed(1) + '" x2="' + X(nowJ).toFixed(1) + '" y1="0" y2="40" class="nowln"/>';
  s += '</svg><div class="pbarlab">' + nodes.map((n, i) => '<button type="button" class="chip sm" data-pseg="' + key + ':' + i + '" style="border-color:' + colorOf(n) + '">' + esc(nameOf(n)) + ' <small>' + fmtDate(n.startISO) + '</small></button>').join('') + '</div>';
  return s;
}

/* ================================================================
   1. Dashas+ : any of the 24 systems on the shared zoomable timeline
   ================================================================ */
const D3 = { yearLen: '', antar: 'equal', tara: 'sanjay_rath', moola: 'graha', mtZero: false, revati: 'bphs', kcAnt: 'first_occurrence', seed: '', antFrom: 'next', age: null };
const CONDITIONAL = ['shodashottari', 'dwadashottari', 'panchottari', 'shatabdika', 'chaturashiti_sama', 'dwisaptati_sama', 'shashtihayani', 'shattrimsha_sama'];
function dashaOpts(C, sys) {
  const o = { levels: 3 };
  if (D3.yearLen) o.dashaYear = +D3.yearLen;
  if (CONDITIONAL.includes(sys)) o.antardasha = D3.antar;
  if (sys === 'tara') o.variant = D3.tara;
  if (sys === 'moola') { o.variant = D3.moola; if (D3.mtZero) o.moolatrikonaZero = true; }
  if (sys === 'kalachakra') { o.revati = D3.revati; o.kcAntardasha = D3.kcAnt; }
  if (sys === 'narayana' && D3.seed) o.seed = D3.seed;
  if (sys === 'tithi_ashtottari') o.antardashaFrom = D3.antFrom;
  if (sys === 'mudda' || sys === 'patyayini') o.age = D3.age != null ? D3.age : curAge(C);
  return o;
}
function dashaRes(C, sys) { const o = dashaOpts(C, sys); return cached('d|' + ckey(C) + sys + JSON.stringify(o), () => JE().dashas(C, sys, o)); }
function genericSo(C, sys, res) {
  return {
    roots: res.tree, max: clamp(res.levels || 3, 1, 3),
    name: n => n.lord ? pn(n.lord) : sgn(n.sign), short: n => n.lord ? pab(n.lord) : sab(n.sign),
    color: n => pcol(lord(n)), kids: n => n.children || [], card: path => periodCard3(C, sys, res, path)
  };
}
function periodCard3(C, sys, res, path) {
  if (!path || !path.length) return '<p class="sub">' + tr('tlHelp') + '</p>';
  const n = path[path.length - 1], lvl = path.length, dur = (n.end - n.start) / 365.25, nowJ = nowJd();
  const so = genericSo(C, sys, res);
  let h = '<h2><span class="pdot" style="background:' + so.color(n) + ';width:14px;height:14px"></span>' + esc(path.map(so.name).join(' › ')) + '</h2>' +
    '<div class="chips">' + pill(tr(K.LEVEL_NAME[lvl] || 'antardasha'), 'saff') + pill(fmtDate(n.startISO, lvl > 2) + ' – ' + fmtDate(n.endISO, lvl > 2)) + pill(tr('duration') + ' ' + fmtDur(dur)) +
    pill(n.end <= C.meta.jdUT ? tr('beforeBirth') : tr('age') + ' ' + fx(Math.max(0, K.ageAt(C, n.start)), 1) + '–' + fx(K.ageAt(C, n.end), 1), 'indigo') + (nowJ >= n.start && nowJ < n.end ? pill(tr('youAreHere'), 'green') : '') + (n.cycle ? pill(tr('cycle') + ' ' + num(n.cycle)) : '') + '</div>';
  const J = JC();
  if (n.lord && PL9.includes(n.lord)) {
    const dl = J.dashaLord && J.dashaLord[n.lord], p = P(C, n.lord);
    if (lvl >= 2 && path[lvl - 2].lord && J.antardasha && J.antardasha[path[lvl - 2].lord] && J.antardasha[path[lvl - 2].lord][n.lord]) h += '<p class="reading"><b>' + esc(pn(path[lvl - 2].lord)) + '–' + esc(pn(n.lord)) + ':</b> ' + esc(tx(J.antardasha[path[lvl - 2].lord][n.lord])) + '</p>';
    if (dl) h += '<p class="reading"><b>' + esc(pn(n.lord)) + ':</b> ' + esc(tx(dl.summary)) + '</p>';
    if (p) h += '<p class="sub">🧭 ' + esc(pn(n.lord)) + ' ' + tr('inSign') + ' ' + esc(sgn(p.sign)) + ', ' + tr('house') + ' ' + num(p.house) + ' · ' + esc(K.digName(p.dignity)) + '</p>';
  } else if (n.sign != null) {
    const hh = houseOf(C, n.sign), jh = J.houses && J.houses[hh];
    h += '<p class="reading"><b>' + esc(sgn(n.sign)) + '</b> — ' + tr('house') + ' ' + num(hh) + (jh ? ': ' + esc(tx(jh.significations)) : '') + '</p>';
    const occ = PL9.filter(id => P(C, id).sign === n.sign); h += '<p class="sub">' + tr('occupants') + ': ' + plist(occ) + ' · ' + tr('lord') + ' ' + esc(pn(SIGN_LORD[n.sign])) + '</p>';
  } else if (n.lord === 'La') h += '<p class="sub">' + tr('lagna') + '</p>';
  if (sys === 'kalachakra') {
    const KC = J.kalachakra || {};
    if (n.deha) h += '<p>🧍 <b>' + esc(nm(g(KC, 'parts.deha'), tr('deha'))) + '</b> — ' + esc(tx(g(KC, 'parts.deha.what'))) + '</p>';
    if (n.jeeva) h += '<p>💠 <b>' + esc(nm(g(KC, 'parts.jeeva'), tr('jeeva'))) + '</b> — ' + esc(tx(g(KC, 'parts.jeeva.what'))) + '</p>';
    if (n.gati) h += '<p>🐸 <b>' + esc(nm(g(KC, 'gatis.' + n.gati), n.gati)) + '</b> — ' + esc(tx(g(KC, 'gatis.' + n.gati + '.what'))) + '</p>';
    if (n.savya != null) h += '<p class="sub">' + esc(nm(g(KC, 'groups.' + (n.savya ? 'savya' : 'apasavya')), n.savya ? 'savya' : 'apasavya')) + '</p>';
  }
  const ds = J.dashaSystems && J.dashaSystems[sys];
  if (ds && ds.howToRead) h += '<details class="x"><summary>📖 ' + tr('howRead') + '</summary><div class="body reading"><p>' + esc(tx(ds.howToRead)) + '</p></div></details>';
  return h;
}
function dashaControls(C, sys, res) {
  const yl = [['', tr('chartDefault') + ' (' + fx(res.yearDays || 365.25, 4) + ')'], ['365.25', '365.25'], ['365.2422', '365.2422'], ['365.2564', '365.2564'], ['360', '360']];
  let h = '<div class="row wrap3"><label class="mini"><span>' + tr('yearLen') + '</span><select id="d3Year">' + yl.map(([v, l]) => '<option value="' + v + '"' + (String(D3.yearLen) === v ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select></label>';
  const sel = (id, cur, opts, lab) => '<label class="mini"><span>' + lab + '</span><select id="' + id + '">' + opts.map(([v, l]) => '<option value="' + v + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select></label>';
  if (CONDITIONAL.includes(sys)) h += sel('d3Antar', D3.antar, [['equal', JE().dashaOptionLabels ? tx(JE().dashaOptionLabels.antardasha.equal) : tr('antEqual')], ['proportional', JE().dashaOptionLabels ? tx(JE().dashaOptionLabels.antardasha.proportional) : tr('antProp')]], tr('antarMode'));
  if (sys === 'tara') h += sel('d3Tara', D3.tara, [['sanjay_rath', 'Sanjay Rath (JH)'], ['parashara', 'Parashara']], tr('variant'));
  if (sys === 'moola') h += sel('d3Moola', D3.moola, [['graha', hi() ? 'ग्रह (JH)' : 'Graha (JH)'], ['rasi', hi() ? 'राशि' : 'Rasi']], tr('variant')) + '<label class="switch"><input type="checkbox" id="d3Mt"' + (D3.mtZero ? ' checked' : '') + '> MT = 0</label>';
  if (sys === 'kalachakra') h += sel('d3Rev', D3.revati, [['bphs', 'Revati: BPHS'], ['pyjhora', 'Revati: PyJHora']], tr('variant')) + sel('d3Kc', D3.kcAnt, [['first_occurrence', hi() ? 'पहली बार (JH)' : 'First occurrence (JH)'], ['positional', hi() ? 'स्थिति अनुसार' : 'Positional']], tr('antardasha'));
  if (sys === 'narayana') h += sel('d3Seed', D3.seed, [['', tr('seedStrong')], ['lagna', tr('seedLagna')]], tr('seed'));
  if (sys === 'tithi_ashtottari') h += sel('d3From', D3.antFrom, [['next', hi() ? 'अगला स्वामी (JH)' : 'Next lord (JH)'], ['self', hi() ? 'दशा स्वामी' : 'MD lord']], tr('antardasha'));
  if (sys === 'mudda' || sys === 'patyayini') { const a = D3.age != null ? D3.age : curAge(C), y0 = +C.meta.localISO.slice(0, 4); h += '<label class="mini"><span>' + tr('forYear') + '</span><select id="d3Age">' + Array.from({ length: 101 }, (_, i) => '<option value="' + i + '"' + (i === a ? ' selected' : '') + '>' + num(y0 + i) + '–' + num((y0 + i + 1) % 100).padStart(2, '0') + ' · ' + tr('ageL') + ' ' + num(i) + '</option>').join('') + '</select></label>'; }
  return h + '</div>';
}
K.view('dasha:generic', (C, sys) => safe(() => {
  const res = dashaRes(C, sys), so = genericSo(C, sys, res), J = JC(), ds = J.dashaSystems && J.dashaSystems[sys];
  const key = 'g:' + sys + C.meta.jdUT + S.ayan + JSON.stringify(dashaOpts(C, sys));
  const annual = sys === 'mudda' || sys === 'patyayini';
  if (DT.sys !== key) {
    DT.sys = key; DT.sel = null;
    const a = res.tree[0].start, z = res.tree[res.tree.length - 1].end;
    if (annual) { DT.t0 = a - (z - a) * 0.03; DT.t1 = z + (z - a) * 0.03; } else { DT.t0 = Math.max(a, C.meta.jdUT - 365.25 * 2); DT.t1 = DT.t0 + 365.25 * 84; }
  }
  const nowJ = nowJd(), path = K.dashaPathAt(so, nowJ);
  const ap = res.applicability || {};
  let h = '<div class="card"><h2>⏳ ' + esc(K.dsName(sys)) + ' ' + term(sys + '_dasha', tr('dasha')) + '</h2>' + (ds ? '<p class="sub">' + esc(tx(ds.what)) + '</p>' : '') +
    '<div class="chips">' + (res.group ? pill(esc(String(res.group))) : '') + (res.kind ? pill(res.kind === 'rashi' ? (hi() ? 'राशि दशा' : 'sign dasha') : (hi() ? 'ग्रह दशा' : 'planet dasha'), 'indigo') : '') + (res.totalYears ? pill(num(Math.round(res.totalYears)) + ' ' + tr('years')) : '') + (res.paramayush ? pill(tr('paramayush') + ' ' + num(res.paramayush)) : '') +
    (res.balanceAtBirth ? pill(term('dasha_balance', tr('balance')) + ': ' + esc(res.balanceAtBirth.lord ? pn(res.balanceAtBirth.lord) : res.balanceAtBirth.sign != null ? sgn(res.balanceAtBirth.sign) : '') + ' ' + fmtDur(res.balanceAtBirth.totalYears != null ? res.balanceAtBirth.totalYears : (res.balanceAtBirth.years || 0)), 'saff') : '') + '</div>';
  if (ap.rule || (J.dashaApplicability && J.dashaApplicability[sys])) h += '<div class="banner ' + (ap.applicable ? 'info' : 'warn') + '"><b>' + tr('applicable') + ':</b> ' + (ap.applicable ? tr('applies') : tr('notApplies')) + '<br><span class="sub">' + esc(tx(J.dashaApplicability && J.dashaApplicability[sys]) || tx(ap.rule)) + '</span>' + (ap.why && tx(ap.why) ? '<br><span class="sub">' + esc(tx(ap.why)) + '</span>' : '') + '</div>';
  if (sys === 'kalachakra') { const KC = J.kalachakra || {}; h += '<p class="sub">' + tr('group3') + ': <b>' + esc(nm(g(KC, 'groups.' + res.group), res.group)) + '</b> · ' + tr('deha') + ' ' + signSafe(res.deha) + ' · ' + tr('jeeva') + ' ' + signSafe(res.jeeva) + ' · ' + tr('nakshatra') + ' ' + esc(nkn(res.nakshatra)) + ' ' + num(res.pada) + '</p>' + (res.dehaJeevaNote ? '<p class="sub">' + esc(tx(res.dehaJeevaNote)) + '</p>' : ''); }
  h += '<details class="x"><summary>⚙️ ' + tr('options3') + '</summary><div class="body">' + dashaControls(C, sys, res) + (res.note ? '<p class="sub">' + esc(tx(res.note)) + '</p>' : '') + '</div></details>';
  if (ds) h += '<details class="x"><summary>📖 ' + tr('p3sysAbout') + '</summary><div class="body reading"><p><b>' + tr('whenUsed') + ':</b> ' + esc(tx(ds.when)) + '</p><p>' + esc(tx(ds.howToRead)) + '</p><p class="sub">' + tr('src') + ': ' + esc(tx(ds.source)) + '</p></div></details>';
  h += '<h3>📍 ' + tr('currentPeriods') + '</h3><div class="curp">' + path.map((n, i) => '<button type="button" data-dsel="' + i + '" data-now="1"><span class="lv">' + tr(K.LEVEL_NAME[i + 1] || 'antardasha') + '</span><b style="color:' + so.color(n) + '">' + esc(so.name(n)) + '</b><span>' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO) + '</span></button>').join('') + '</div></div>';
  h += '<div class="card"><div class="tlbar noprint"><button type="button" class="btn sm" data-tl="in" aria-label="' + tr('zoomIn') + '">＋</button><button type="button" class="btn sm" data-tl="out" aria-label="' + tr('zoomOut') + '">－</button><button type="button" class="btn sm" data-tl="now">📍 ' + tr('now') + '</button><button type="button" class="btn sm" data-tl="life">🌍 ' + tr('life') + '</button><span class="sub">' + tr('tlHelp') + '</span></div>' +
    '<div class="tl" id="tl" tabindex="0" role="application" aria-label="' + esc(K.dsName(sys)) + ' timeline"></div><div class="crumbs" id="crumbs" style="margin-top:8px"></div></div>' +
    '<div class="card" id="dcard">' + periodCard3(C, sys, res, DT.sel || path) + '</div>';
  h += '<div class="card"><h2>📜 ' + tr('periodList') + '</h2>' + res.tree.map(n => { const on = nowJ >= n.start && nowJ < n.end; return '<details class="x"' + (on ? ' open' : '') + '><summary><span class="pdot" style="background:' + so.color(n) + '"></span>' + esc(so.name(n)) + ' <span class="sub">' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO) + (annual ? '' : ' · ' + tr('age') + ' ' + fx(Math.max(0, K.ageAt(C, n.start)), 1)) + '</span>' + (on ? pill(tr('now'), 'green') : '') + (n.gati ? pill(esc(nm(g(J, 'kalachakra.gatis.' + n.gati), n.gati))) : '') + '</summary><div class="body"><div class="tablewrap"><table><tbody>' +
    (n.children || []).map(c => '<tr' + (nowJ >= c.start && nowJ < c.end ? ' class="sel"' : '') + '><td><span class="pdot" style="background:' + so.color(c) + '"></span>' + esc(so.name(n)) + ' › ' + esc(so.name(c)) + '</td><td>' + fmtDate(c.startISO) + '</td><td>' + fmtDate(c.endISO) + '</td></tr>').join('') + '</tbody></table></div></div></details>'; }).join('') + '</div>';
  AFTER.push(() => { DT.C = C; DT.so = so; DT.sysName = sys; K.drawTL(); });
  return h;
}, K.dsName(sys)));
K.onChange(e => {
  const t = e.target, id = t.id, map = { d3Year: 'yearLen', d3Antar: 'antar', d3Tara: 'tara', d3Moola: 'moola', d3Rev: 'revati', d3Kc: 'kcAnt', d3Seed: 'seed', d3From: 'antFrom' };
  if (map[id]) { D3[map[id]] = t.value; DT.sys = null; rerenderKeep(id); return true; }
  if (id === 'd3Mt') { D3.mtZero = t.checked; DT.sys = null; rerenderKeep(id); return true; }
  if (id === 'd3Age') { D3.age = +t.value; DT.sys = null; rerenderKeep(id); return true; }
  return false;
});

/* ================================================================
   2. Jaimini (complete): karakas, karakamsa, arudhas, argala arrows, yogas
   ================================================================ */
const JM = { ov: 'arudha', house: 1, al: false, brahma: '' };
const jaimini = C => cached('j|' + ckey(C) + JM.brahma, () => JE().jaiminiFull(C, JM.brahma ? { brahma: JM.brahma } : {}));
function argalaArrows(J, M) {
  const list = [];
  const items = JM.al ? (J.argalaOnAL || []) : ((J.argala || [])[JM.house - 1] || {}).argala || [];
  const target = JM.al ? (J.arudhaLagna && J.arudhaLagna.sign != null ? J.arudhaLagna.sign : J.arudhaLagna) : signOfHouse(M.asc, JM.house);
  for (const x of items) {
    const from = (target + (x.from || 1) - 1) % 12;
    const c = !x.effective ? 'n' : x.nature === 'shubha' ? 'g' : x.nature === 'papa' ? 'r' : 'a';
    list.push({ from, to: target, c, dash: !x.effective, title: ord(x.from) + ' · ' + plist(x.planets) });
    if (x.obstructionFrom && x.obstructers && x.obstructers.length) list.push({ from: (target + x.obstructionFrom - 1) % 12, to: target, c: 'n', dash: true, title: tr('obstructedBy') + ' ' + ord(x.obstructionFrom) });
  }
  return { list, items, target };
}
K.view('dasha:jaimini', C => safe(() => {
  const J = jaimini(C), CJ = JC().jaimini || {}, M = chartModel(C, 'D1');
  let chart, cap = '';
  const tags = {}, add = (s, t) => { if (s == null) return; (tags[s] = tags[s] || []).push(t); };
  if (JM.ov === 'arudha') { for (const k in J.arudhas) add(J.arudhas[k].sign, k === 'A1' ? 'AL' : k === 'A12' ? 'UL' : k); chart = chartSVG(M, { ctx: 'jm', label: tr('ovArudha'), title: tr('ovArudha'), tags, hl: { s: [J.arudhas.A1 && J.arudhas.A1.sign, J.upapada && J.upapada.sign] } }); }
  else if (JM.ov === 'graha') { for (const id in J.grahaArudhas) add(J.grahaArudhas[id].sign, pab(id) + 'ᴬ'); chart = chartSVG(M, { ctx: 'jm', label: tr('ovGraha'), title: tr('grahaArudhas'), tags, noPlanets: true }); cap = '<p class="sub">ᴬ = ' + tr('grahaArudhas') + '</p>'; }
  else if (JM.ov === 'karakamsa') { const M9 = chartModel(C, 'D9'); add(J.karakamsa.sign, 'KK'); if (J.ishtaDevata) add(J.ishtaDevata.sign, 'ID'); chart = chartSVG(M9, { ctx: 'jm', label: tr('ovKarakamsa'), title: 'D9', subtitle: tr('karakamsa'), tags, hl: { s: [J.karakamsa.sign] } }); cap = '<p class="sub">KK = ' + tr('karakamsa') + ' · ID = ' + tr('ishta') + '</p>'; }
  else { const A = argalaArrows(J, M); chart = withOverlay(chartSVG(M, { ctx: 'jm', label: tr('ovArgala'), title: tr('argala'), hl: { s: [A.target] } }), arrowSvg(M, A.list)); cap = '<div class="legend"><span><i class="lk g"></i>' + tr('shubha') + '</span><span><i class="lk r"></i>' + tr('papa') + '</span><span><i class="lk a"></i>' + tr('mixed') + '</span><span><i class="lk n"></i>' + tr('obstructed') + '</span></div>'; }
  let h = K.provChips(C) + '<div class="chartlayout"><div class="card"><h2>🔱 ' + term('jaimini', tr('jaimini')) + '</h2>' + (CJ.intro ? '<p class="sub">' + esc(tx(CJ.intro)) + '</p>' : '') +
    seg('jmOv', JM.ov, [['arudha', tr('ovArudha')], ['graha', tr('ovGraha')], ['karakamsa', tr('ovKarakamsa')], ['argala', tr('ovArgala')]]) +
    (JM.ov === 'argala' ? '<div class="chips" role="group" aria-label="' + tr('argalaFor') + '" style="margin-top:6px">' + Array.from({ length: 12 }, (_, i) => '<button type="button" class="chip' + (!JM.al && JM.house === i + 1 ? ' on' : '') + '" data-jmh="' + (i + 1) + '" aria-pressed="' + (!JM.al && JM.house === i + 1) + '">' + num(i + 1) + '</button>').join('') + '<button type="button" class="chip' + (JM.al ? ' on' : '') + '" data-jmh="AL">AL</button></div>' : '') +
    '<div class="chartwrap" style="margin-top:8px">' + chart + '</div>' + cap + '</div>';
  // argala table for the selected house (always visible in argala mode)
  let side = '';
  if (JM.ov === 'argala') {
    const A = argalaArrows(J, M);
    side = '<h3>' + tr('argalaFor') + ' ' + (JM.al ? 'AL' : num(JM.house)) + ' · ' + esc(sgn(A.target)) + '</h3>' + (A.items.length ? tbl([tr('from'), tr('planets'), '', tr('obstructed')], A.items.map(x => '<tr><td>' + ord(x.from) + ' <span class="sub">' + esc(x.kind === 'primary' ? tr('primary') : x.kind === 'secondary' ? tr('secondary') : tr('malefic3')) + '</span></td><td>' + plist(x.planets) + '</td><td>' + (x.effective ? '<span class="ok">✓ ' + tr('effective') + '</span>' : '<span class="bad">✗</span>') + ' ' + pill(esc(x.nature === 'shubha' ? tr('shubha') : x.nature === 'papa' ? tr('papa') : tr('mixed')), x.nature === 'shubha' ? 'green' : x.nature === 'papa' ? 'red' : 'gold') + '</td><td>' + (x.obstructionFrom ? ord(x.obstructionFrom) + ': ' + plist(x.obstructers) : '—') + '</td></tr>')) : '<p class="sub">' + tr('noneP') + '</p>') +
      (g(CJ, 'concepts.argala.what') ? '<p class="sub">' + esc(tx(g(CJ, 'concepts.argala.what'))) + '</p>' : '') + (g(CJ, 'concepts.ketu_reverse_argala.what') ? '<p class="sub">' + esc(tx(g(CJ, 'concepts.ketu_reverse_argala.what'))) + '</p>' : '');
  } else side = '<p class="sub">' + tr('tapHint') + '</p>';
  h += '<div class="detailpane" id="detailPane"><div class="card"><h2>👆 ' + tr('details') + '</h2>' + side + '</div></div></div>';
  // karakas
  const kl = J.karakas.list || {}, ak = J.karakas.atmakaraka, akR = g(CJ, 'atmakarakaPlanet.' + (J.karakas.readingIds && J.karakas.readingIds.atmakaraka));
  h += '<div class="grid2">' + card('👑 ' + term('chara_karaka', tr('karakasOpt')), '<div class="row"><label for="engS_karakas" class="lbl">' + tr('karakasOpt') + '</label><select id="engS_karakas" class="inline"><option value="8"' + (String(S.eng.karakas) === '8' ? ' selected' : '') + '>' + tr('k8') + '</option><option value="7"' + (String(S.eng.karakas) === '7' ? ' selected' : '') + '>' + tr('k7') + '</option></select></div>' +
    tbl([tr('karaka'), tr('planet'), tr('meaning')], Object.keys(kl).map(k => '<tr class="click" data-k="p:' + kl[k] + '"><td><b>' + esc(k) + '</b> · ' + esc(K.kName(k)) + '</td><td>' + esc(pn(kl[k])) + '</td><td class="wrap sub">' + esc(tx(g(CJ, 'karakas.' + k + '.signifies'))) + '</td></tr>')) +
    (akR ? '<p class="reading"><b>' + tr('karaka') + ' AK · ' + esc(pn(ak)) + ':</b> ' + esc(tx(akR)) + '</p>' : ''));
  const kk = J.karakamsa || {}, kkR = g(CJ, 'karakamsaSign.' + kk.readingId), isd = J.ishtaDevata || {};
  h += card('🎯 ' + term('karakamsa', tr('karakamsa')), '<p><b>' + tr('karakamsa') + ':</b> ' + signSafe(kk.sign) + ' · ' + tr('swamsa') + ' ' + signSafe(J.swamsa && J.swamsa.sign) + '</p>' + (kkR ? '<p class="reading">' + esc(tx(kkR)) + '</p>' : '') +
    (kk.planetReadingIds || []).map(id => { const r = g(CJ, 'karakamsaPlanet.' + id); return r ? '<p class="reading"><b>' + esc(pn(id.replace('kk_planet_', ''))) + ':</b> ' + esc(tx(r)) + '</p>' : ''; }).join('') +
    '<p><b>' + tr('ishta') + ':</b> ' + signSafe(isd.sign) + (isd.planet ? ' · ' + esc(pn(isd.planet)) : '') + '</p>' + (g(CJ, 'ishtaDevata.' + isd.readingId) ? '<p class="reading">' + esc(tx(g(CJ, 'ishtaDevata.' + isd.readingId))) + '</p>' : '') + (isd.rule ? '<p class="sub">' + esc(tx(isd.rule)) + '</p>' : '') + (CJ.ishtaNote ? '<p class="sub">' + esc(tx(CJ.ishtaNote)) + '</p>' : '')) + '</div>';
  // arudhas
  h += '<div class="grid2">' + card('🪞 ' + term('arudha', tr('arudhas')), tbl([hi() ? 'पद' : 'Pada', tr('sign'), tr('lord'), tr('meaning')], Object.keys(J.arudhas).map(k => { const a = J.arudhas[k]; return '<tr><td><b>' + esc(k) + '</b>' + (k === 'A1' ? ' AL' : k === 'A12' ? ' UL' : '') + '</td><td>' + signSafe(a.sign) + (a.exception ? ' <span class="sub" title="' + esc(tr('exception')) + '">*</span>' : '') + '</td><td>' + esc(pn(a.lord)) + '</td><td class="wrap sub">' + esc(nm(g(CJ, 'arudhas.' + k), '')) + '</td></tr>'; })) +
    '<p class="sub">* ' + tr('exception') + ' (10th)</p><h3>' + term('upapada', tr('upapada')) + '</h3><p>' + signSafe(J.upapada.sign) + ' · ' + tr('lord') + ' ' + esc(pn(J.upapada.lord)) + ' · ' + tr('occupants') + ': ' + plist(J.upapada.planets) + '</p>' + (J.upapada.second ? '<p class="sub">' + tr('second') + ': ' + signSafe(J.upapada.second.sign) + ' · ' + plist(J.upapada.second.planets) + '</p>' : ''));
  h += card('🪐 ' + tr('grahaArudhas'), tbl([tr('planet'), tr('sign'), tr('ownSign')], PL9.filter(id => J.grahaArudhas[id]).map(id => { const a = J.grahaArudhas[id]; return '<tr><td>' + esc(pn(id)) + '</td><td>' + signSafe(a.sign) + (a.exception ? ' *' : '') + '</td><td>' + signSafe(a.ownSign) + '</td></tr>'; })) +
    '<h3>' + tr('sthiraK') + '</h3><dl class="kv">' + Object.keys(J.sthiraKarakas || {}).map(k => '<dt>' + esc(sthk(k)) + '</dt><dd>' + esc(pn(J.sthiraKarakas[k])) + '</dd>').join('') + '</dl>') + '</div>';
  // yogas
  const ys = (J.yogas || []).slice().sort((a, b) => (b.present ? 1 : 0) - (a.present ? 1 : 0));
  h += card('✨ ' + tr('jYogas') + ' <small>' + num(ys.filter(y => y.present).length) + ' / ' + num(ys.length) + '</small>', ys.map(y => { const c = g(CJ, 'yogas.' + y.id) || {}; return '<details class="x"' + (y.present ? '' : '') + '><summary>' + (y.present ? '✅ ' : '⚪ ') + esc(nm(c, y.id.replace(/_/g, ' '))) + (y.present && y.strength ? ' ' + pill(tr(y.strength) || y.strength) : '') + '</summary><div class="body reading">' + (c.rule ? '<p><b>' + tr('rule') + ':</b> ' + esc(tx(c.rule)) + '</p>' : '') + (y.reason ? '<p><b>' + tr('whyHere') + ':</b> ' + esc(tx(y.reason)) + '</p>' : '') + (c.effect ? '<p>' + esc(tx(c.effect)) + '</p>' : '') + (c.source ? '<p class="sub">' + tr('src') + ': ' + esc(tx(c.source)) + '</p>' : '') + '</div></details>'; }).join('') + (CJ.yogaNote ? '<p class="sub">' + esc(tx(CJ.yogaNote)) + '</p>' : ''));
  // trinity & longevity (classification only — never a lifespan)
  const lg = J.longevity || {};
  h += '<div class="grid2">' + card('🕉️ ' + tr('trinity'), ['brahma', 'rudra', 'maheshwara'].map(k => { const o = J[k]; if (!o) return ''; return '<p><b>' + esc(nm(g(CJ, 'concepts.' + k), k)) + ':</b> ' + esc(pn(o.planet)) + (o.sign != null ? ' · ' + signSafe(o.sign) : '') + '</p>' + (o.rule ? '<p class="sub">' + esc(tx(o.rule)) + '</p>' : '') + (o.akNote ? '<p class="sub">' + esc(tx(o.akNote)) + '</p>' : ''); }).join('') + '<label class="mini"><span>' + tr('brahmaMode') + '</span><select id="jmBrahma"><option value=""' + (!JM.brahma ? ' selected' : '') + '>' + tr('brHouses') + '</option><option value="visible_half"' + (JM.brahma === 'visible_half' ? ' selected' : '') + '>' + tr('brVisible') + '</option></select></label>') +
    card('⏳ ' + tr('longevityT'), '<div class="banner info">' + tr('longevityNote') + '</div>' + (lg.pairs ? tbl([tr('rule'), tr('sign'), ''], lg.pairs.map(p => '<tr><td>' + esc(nm(g(CJ, 'longevityPairs.' + p.id), p.id.replace(/_/g, ' '))) + '</td><td>' + (p.signs || []).map(signSafe).join(' + ') + '</td><td>' + esc(nm(g(CJ, 'longevity.' + p.class), p.class || '')) + '</td></tr>')) : '') +
      (lg.result ? '<p><b>' + esc(nm(g(CJ, 'longevity.' + lg.result), lg.result)) + '</b></p>' : '') + (CJ.longevityNote ? '<p class="sub">' + esc(tx(CJ.longevityNote)) + '</p>' : '')) + '</div>';
  h += card('👁️ ' + term('rashi_drishti', tr('rashiDrishti')), tbl([tr('sign'), tr('aspectsSigns')], (J.rashiDrishti || []).map((arr, s) => '<tr><td><b>' + esc(sgn(s)) + '</b> <span class="sub">(' + tr('house') + ' ' + num(houseOf(C, s)) + ')</span></td><td class="wrap">' + arr.map(x => esc(sgn(x))).join(', ') + '</td></tr>')));
  return h;
}, 'Jaimini'));

/* ================================================================
   3. KP: cusps, significators (tap to highlight), ruling planets now, horary pad
   ================================================================ */
const KPS = { ayan: 'kp_new', selH: null, selP: null, num: '', ev: 'kp_marriage', hor: null, horErr: null, rp: { place: null }, hp: { place: null } };
const kpOf = (C, p) => cached('kp|' + ckey(C) + KPS.ayan + S.node, () => JE().kp(K.inputFor(p), { ayanamsa: KPS.ayan, node: S.node }));
const evName = id => nm(g(JC(), 'kp.eventRules.' + id), id.replace(/^kp_/, '').replace(/_/g, ' '));
const vLab = v => { const o = g(JC(), 'kp.eventVerdicts.' + v); return o && o.label ? tx(o.label) : null; };
const verdictPill = v => vLab(v) ? pill(({ promised: '✓ ', denied: '✗ ', mixed: '◐ ', tendency_noted: '• ', not_indicated: '○ ', not_applicable: '— ' })[v] + esc(vLab(v)), ({ promised: 'green', denied: 'red', mixed: 'gold', tendency_noted: 'indigo' })[v] || '') : v === 'promised' ? pill('✓ ' + tr('promised'), 'green') : v === 'denied' ? pill('✗ ' + tr('deniedV'), 'red') : v === 'mixed' ? pill('◐ ' + tr('mixedV'), 'gold') : v === 'tendency_noted' ? pill('• ' + tr('tendency'), 'indigo') : v === 'not_indicated' ? pill('○ ' + tr('deniedV')) : v === 'not_applicable' ? pill('— ' + tr('notApplicable')) : pill('• ' + esc(String(v || '').replace(/_/g, ' ')), 'indigo');
const verdictText = v => vLab(v) || ({ promised: tr('promised'), denied: tr('deniedV'), mixed: tr('mixedV'), tendency_noted: tr('tendency'), not_indicated: tr('deniedV'), not_applicable: tr('notApplicable') })[v] || String(v || '').replace(/_/g, ' ');
function rpCard() {
  const pl = KPS.rp.place || K.defaultPlace(); KPS.rp.place = pl;
  let r; try { r = JE().kpRulingPlanets(nowJd(), K.enginePlace(pl), { ayanamsa: KPS.ayan }); } catch (e) { return '<div class="banner err">' + esc(e.message) + '</div>'; }
  const comp = g(JC(), 'kp.rulingPlanets.components') || {};
  return '<p class="sub">🕒 <b>' + esc(fmtDate(r.iso, true)) + '</b> · ' + tr('rpLive') + '</p><div class="facts" style="grid-template-columns:repeat(3,minmax(0,1fr))">' +
    K.fact(tr('asc'), sgn(r.ascendant.sign), pnA(r.ascendant.starLord) + ' › ' + pnA(r.ascendant.subLord)) + K.fact(pnA('Mo'), sgn(r.moon.sign), pnA(r.moon.starLord) + ' › ' + pnA(r.moon.subLord)) + K.fact(tr('dayLord'), pn(r.dayLord), '') + '</div>' +
    tbl([tr('rule'), tr('planet')], (r.list || []).map(x => '<tr><td>' + esc(nm(comp[x.id], x.id.replace(/^rp_/, '').replace(/_/g, ' '))) + (x.optional ? ' <span class="sub">(opt.)</span>' : '') + '</td><td><b>' + esc(pn(x.planet)) + '</b></td></tr>')) +
    ((r.nodes || []).length ? '<p class="sub">🐍 ' + tr('nodeAgency') + ': ' + r.nodes.map(n => esc(pn(n.planet)) + ' → ' + plist(n.representing)).join(' · ') + '</p>' : '') +
    '<p><b>' + tr('combined') + ':</b> ' + (r.combined || []).map(id => '<span class="chip">' + esc(pn(id)) + '</span>').join(' ') + '</p>';
}
function horaryPad() {
  return '<div class="numpad" role="group" aria-label="' + tr('horary') + '"><output class="npout" id="kpNumOut" aria-live="polite">' + esc(num(KPS.num || '—')) + '</output>' +
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button type="button" class="btn" data-np="' + n + '">' + num(n) + '</button>').join('') +
    '<button type="button" class="btn" data-np="back" aria-label="⌫">⌫</button><button type="button" class="btn" data-np="0">' + num(0) + '</button><button type="button" class="btn primary" data-np="go">' + tr('go') + '</button></div>';
}
K.view('dasha:kp', C => safe(() => {
  const p = K.curP(), R = kpOf(C, p), CK = JC().kp || {};
  const sigH = h => R.planets.filter(x => (x.signifies || []).includes(h)).map(x => x.id);
  const selP = KPS.selP && R.planets.find(x => x.id === KPS.selP), hlH = selP ? new Set(selP.signifies || []) : new Set(KPS.selH ? [KPS.selH] : []), hlP = new Set(KPS.selH ? sigH(KPS.selH) : (KPS.selP ? [KPS.selP] : []));
  let h = '<div class="card"><h2>🎯 ' + tr('kpTitle') + '</h2>' + (CK.intro ? '<p class="sub">' + esc(tx(CK.intro)) + '</p>' : '') +
    '<div class="row"><span class="lbl">' + tr('kpAyan') + '</span>' + seg('kpAyan', KPS.ayan, [['kp_new', tr('kpNew')], ['kp_old', tr('kpOld')]]) + pill(tr('ayanamsa') + ' ' + dms(R.ayanamsaValue, true), 'indigo') + pill(esc(String(R.houseSystemUsed))) + '</div>' +
    ((R.warnings || []).length ? '<div class="banner warn">' + R.warnings.map(w => esc(tx(w))).join('<br>') + '</div>' : '') + '<p class="sub">👆 ' + tr('tapHL') + '</p></div>';
  // ruling planets live + horary pad
  KPS.rp.onPlace = () => { }; KPS.hp.onPlace = () => { KPS.hor = null; }; if (KPS.pid !== p.id) { KPS.pid = p.id; KPS.rp.place = K.defaultPlace(); KPS.hp.place = K.defaultPlace(); KPS.hor = null; }
  h += '<div class="grid2"><div class="card" id="kpRpCard"><h2>⏱️ ' + term('ruling_planets', tr('rpNow')) + '</h2>' + K.placePicker('kprp', KPS.rp) + '<div id="kpRp">' + rpCard() + '</div></div>';
  let hor = '';
  if (KPS.hor) {
    const H = KPS.hor, ev = (H.events || []).find(e => e.id === KPS.ev);
    hor = '<div class="banner info"><b>#' + num(H.number) + '</b> · ' + tr('horaryAsc') + ': ' + esc(sgn(H.part ? H.part.sign : H.cusps[0].sign)) + ' ' + dms((H.cusps[0].cusp || 0) % 30) + ' · ' + pnA(H.cusps[0].starLord) + ' › ' + pnA(H.cusps[0].subLord) + '</div>' +
      (ev ? '<p><b>' + esc(evName(ev.id)) + ':</b> ' + verdictPill(ev.verdict) + ' · ' + tr('csl') + ' ' + esc(pn(ev.cuspalSubLord)) + ' (' + tr('cslStar') + ' ' + esc(pn(ev.starLordOfCsl)) + ')</p><p class="sub">' + tr('fav') + ': ' + hlist(ev.favourableHits) + ' · ' + tr('neg') + ': ' + hlist(ev.negatingHits) + '</p>' + (ev.text ? '<p class="sub">' + esc(tx(ev.text)) + '</p>' : '') : '') +
      tbl([tr('house'), tr('cusp'), tr('nakLord'), tr('subLord')], H.cusps.map(c => '<tr><td>' + num(c.house) + '</td><td>' + esc(sab(c.sign)) + ' ' + dms(c.deg) + '</td><td>' + esc(pn(c.starLord)) + '</td><td>' + esc(pn(c.subLord)) + '</td></tr>'));
  } else if (KPS.horErr) hor = '<div class="banner err">' + esc(KPS.horErr) + '</div>';
  h += '<div class="card"><h2>🔢 ' + term('horary_number', tr('horary')) + '</h2><p class="sub">' + tr('pickNumber') + '</p>' + K.placePicker('kphp', KPS.hp) +
    '<label class="mini"><span>' + tr('question') + '</span><select id="kpEv">' + (R.events || []).map(e => '<option value="' + e.id + '"' + (e.id === KPS.ev ? ' selected' : '') + '>' + esc(evName(e.id)) + '</option>').join('') + '</select></label>' + horaryPad() + '<div id="kpHor">' + hor + '</div></div></div>';
  // tables
  h += '<div class="card" id="kpTables"><h2>🏠 ' + term('placidus_cusps', tr('cusps')) + '</h2>' + tbl([tr('house'), tr('cusp'), tr('signLord'), tr('nakLord'), tr('subLord'), tr('subSub')], R.cusps.map(c => '<tr class="click' + (hlH.has(c.house) ? ' sel' : '') + '" data-kph="' + c.house + '" tabindex="0"><td><b>' + num(c.house) + '</b></td><td>' + esc(sgn(c.sign)) + ' ' + dms(c.deg, true) + (c.intercepted && c.intercepted.length ? ' <span class="sub">(+' + c.intercepted.map(s => esc(sab(s))).join(',') + ')</span>' : '') + '</td><td>' + esc(pn(c.signLord)) + '</td><td>' + esc(pn(c.starLord)) + '</td><td><b>' + esc(pn(c.subLord)) + '</b></td><td>' + esc(pn(c.subSubLord)) + '</td></tr>')) +
    '<h2>🪐 ' + term('significators', tr('significators')) + '</h2>' + tbl([tr('planet'), tr('sign'), tr('house'), tr('nakLord'), tr('subLord'), 'A', 'B', 'C', 'D', tr('signifies')], R.planets.map(x => { const lv = x.levels || {}; return '<tr class="click' + (hlP.has(x.id) ? ' sel' : '') + '" data-kpp="' + x.id + '" tabindex="0"><td><b style="color:' + pcol(x.id) + '">' + esc(pn(x.id)) + '</b></td><td>' + esc(sab(x.sign)) + ' ' + dms(x.lon % 30) + '</td><td>' + num(x.house) + '</td><td>' + esc(pn(x.starLord)) + '</td><td>' + esc(pn(x.subLord)) + '</td><td>' + hlist(lv.A) + '</td><td>' + hlist(lv.B) + '</td><td>' + hlist(lv.C) + '</td><td>' + hlist(lv.D) + (lv.agent && lv.agent.length ? ' +' + hlist(lv.agent) : '') + '</td><td><b>' + hlist(x.signifies) + '</b></td></tr>'; })) +
    '<h2>📊 ' + tr('houseSig') + '</h2>' + tbl([tr('house'), 'A', 'B', 'C', 'D'], R.houses.map(x => '<tr class="click' + (hlH.has(x.house) ? ' sel' : '') + '" data-kph="' + x.house + '"><td><b>' + num(x.house) + '</b></td><td>' + plist(x.A) + '</td><td>' + plist(x.B) + '</td><td>' + plist(x.C) + '</td><td>' + plist(x.D) + '</td></tr>')) +
    (g(CK, 'significators.levels') ? '<p class="sub">' + Object.keys(CK.significators.levels).map(k => '<b>' + esc(k.slice(-1).toUpperCase()) + '</b>: ' + esc(tx(CK.significators.levels[k].name || CK.significators.levels[k]))).join(' · ') + '</p>' : '') + '</div>';
  h += '<div class="card"><h2>📜 ' + term('event_promise', tr('events')) + '</h2>' + tbl([tr('question'), tr('cusp'), tr('csl'), tr('cslStar'), tr('fav'), tr('neg'), ''], (R.events || []).map((e, i) => '<tr class="click" data-kpev="' + i + '" tabindex="0"><td>' + esc(evName(e.id)) + '</td><td>' + num(e.cusp) + '</td><td>' + esc(pn(e.cuspalSubLord)) + '</td><td>' + esc(pn(e.starLordOfCsl)) + '</td><td>' + hlist(e.favourableHits) + '</td><td>' + hlist(e.negatingHits) + '</td><td>' + verdictPill(e.verdict) + '</td></tr>')) + '<p class="sub">' + (hi() ? 'परंपरागत केपी नियम; कोई भी संकेत निश्चित भविष्य नहीं है।' : 'Traditional KP rules; no indication is a fixed future.') + '</p></div>';
  AFTER.push(() => { if (K.IS_NODE) return; if (K.ANIM.kprp) K.ANIM.kprp.stop(); const iv = setInterval(() => { const b = $('#kpRp'); if (!b) { clearInterval(iv); return; } b.innerHTML = rpCard(); }, 30000); K.ANIM.kprp = { stop: () => clearInterval(iv) }; });
  return h;
}, 'KP'));
function runHorary() {
  const n = +KPS.num; if (!(n >= 1 && n <= 249)) { toast('1–249'); return; }
  const pl = KPS.hp.place || K.defaultPlace(); KPS.hp.place = pl;
  try { KPS.hor = JE().kpHorary(n, { place: K.enginePlace(pl), jd: nowJd() }, { ayanamsa: KPS.ayan }); KPS.horErr = null; } catch (e) { KPS.hor = null; KPS.horErr = e.message; }
  rerenderAt();
}

/* ================================================================
   4. Varshaphal / Tajika
   ================================================================ */
const VY = { age: null, place: { place: null }, ver: 0, ylr: '', hme: '' };
const varsha = (C, age) => cached('v|' + ckey(C) + age + VY.ylr + VY.hme + JSON.stringify(VY.place.place && K.enginePlace(VY.place.place)), () => JE().varshaphal(C, age, Object.assign(VY.place.place ? { place: K.enginePlace(VY.place.place) } : {}, VY.ylr ? { yearLordRule: VY.ylr } : {}, VY.hme ? { harshaMercury: VY.hme } : {})));
const tajName = (sec, id) => nm(g(JC(), 'tajika.' + sec + '.' + id), String(id).replace(/_/g, ' '));
function monthCharts(C, V) {
  const pl = VY.place.place ? K.enginePlace(VY.place.place) : C.meta.input && C.meta.input.place;
  return cached('vm|' + ckey(C) + V.year + JSON.stringify(pl), () => (V.masaPravesha || []).map(m => { try { const inp = JE().momentInput(pl, m.jdUT, 'M' + m.month); return JE().chart(inp, K.optsFor(K.curP())); } catch (e) { return null; } }));
}
K.view('dasha:varsha', C => safe(() => {
  const pp = K.curP(); if (VY.pid !== pp.id) { VY.pid = pp.id; VY.age = null; VY.place.place = null; }
  const age = VY.age != null ? VY.age : curAge(C), V = varsha(C, age), CT = JC().tajika || {}, y0 = +C.meta.localISO.slice(0, 4);
  const M = chartModel(V.chart, 'D1'), tags = {}; tags[V.muntha.sign] = ['Mu'];
  let h = '<div class="card"><h2>🎂 ' + term('varshaphal', tr('varshaTitle')) + '</h2>' + (CT.intro ? '<p class="sub">' + esc(tx(CT.intro)) + '</p>' : '') +
    '<div class="row"><button type="button" class="btn sm" data-vy="-1" aria-label="' + tr('prevL') + '">‹</button><label class="vh" for="vyAge">' + tr('forYear') + '</label><select id="vyAge" class="inline">' + Array.from({ length: 101 }, (_, i) => '<option value="' + i + '"' + (i === age ? ' selected' : '') + '>' + num(y0 + i) + '–' + num(String((y0 + i + 1) % 100).padStart(2, '0')) + ' · ' + tr('ageL') + ' ' + num(i) + '</option>').join('') + '</select><button type="button" class="btn sm" data-vy="1" aria-label="' + tr('nextL') + '">›</button><button type="button" class="btn sm" data-vy="0">' + tr('thisYear') + '</button></div>' +
    '<div class="row wrap3"><label class="mini"><span>' + tr('yearLordRule') + '</span><select id="vyYlr"><option value=""' + (!VY.ylr ? ' selected' : '') + '>' + tr('ylFriendly') + '</option><option value="plain"' + (VY.ylr === 'plain' ? ' selected' : '') + '>' + tr('ylPlain') + '</option></select></label><label class="mini"><span>' + tr('harshaMe') + '</span><select id="vyHme">' + [['', hi() ? 'स्त्री (मानक)' : 'Feminine (default)'], ['masculine', hi() ? 'पुरुष' : 'Masculine'], ['neutral', hi() ? 'नपुंसक' : 'Neutral']].map(([v, l]) => '<option value="' + v + '"' + (VY.hme === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label></div><details class="x"' + (VY.place.place ? ' open' : '') + '><summary>📍 ' + tr('residence') + '</summary><div class="body">' + K.placePicker('vyp', VY.place.place ? VY.place : { place: Object.assign({}, pp.place), onPlace() { VY.place.place = this.place; } }) + '</div></details></div>';
  h += '<div class="chartlayout"><div class="card"><h2>' + tr('solarReturn') + ' · ' + num(V.year) + '</h2><p><b>' + esc(fmtDate(V.solarReturn.iso, true)) + '</b> · UTC' + K.hm(V.solarReturn.offset) + ' · ' + (V.solarReturn.dayBirth ? '☀️ ' + tr('dayBirth') : '🌙 ' + tr('nightBirth')) + '</p>' +
    '<div class="chartwrap">' + chartSVG(M, { ctx: 'vp', label: tr('varshaTitle'), title: num(V.year), subtitle: sgn(M.asc), tags }) + '</div><p class="sub">Mu = ' + tr('muntha') + '</p></div>' +
    '<div class="detailpane" id="detailPane">';
  const mr = g(CT, 'munthaHouse.' + V.muntha.readingId), yl = V.yearLord || {}, ylr = g(CT, 'yearLordById.' + yl.readingId);
  h += card('🎯 ' + term('muntha', tr('muntha')), '<p><b>' + esc(sgn(V.muntha.sign)) + '</b> · ' + tr('house') + ' ' + num(V.muntha.house) + ' · ' + tr('lord') + ' ' + esc(pn(V.muntha.lord)) + '</p>' + (mr ? '<p class="reading">' + esc(tx(mr.text || mr)) + '</p>' : '') + (V.muntha.rule ? '<p class="sub">' + esc(tx(V.muntha.rule)) + '</p>' : '')) +
    card('👑 ' + term('varsheshwar', tr('yearLord')), '<p><b style="font-size:1.15rem">' + esc(pn(yl.planet)) + '</b> ' + (yl.basis ? pill(esc(String(yl.basis).replace(/_/g, ' '))) : '') + '</p>' + (ylr ? '<p class="reading">' + esc(tx(ylr.text || ylr)) + '</p>' : '') +
      tbl([tr('planet'), tr('officeBearers'), tr('aspectOnLagna'), 'PVB'], (yl.candidates || []).map(c => '<tr' + (c.planet === yl.planet ? ' class="sel"' : '') + '><td>' + esc(pn(c.planet)) + '</td><td class="wrap">' + (c.roles || []).map(r => esc(nm(g(CT, 'yearLord.candidates.' + r), r.replace(/_/g, ' ')))).join(', ') + '</td><td>' + esc(c.aspectOnLagna == null ? '—' : String(c.aspectOnLagna).replace(/_/g, ' ')) + '</td><td class="num">' + fx(c.pvb || 0, 2) + '</td></tr>')) + (yl.rule ? '<p class="sub">' + esc(tx(yl.rule)) + '</p>' : '')) + '</div></div>';
  // strengths
  const pv = V.panchaVargiyaBala || {}, hb = V.harshaBala || {};
  h += '<div class="grid2">' + card('⚖️ ' + term('panchavargiya_bala', tr('pvb')), tbl([tr('planet'), 'Kshetra', 'Uchcha', 'Hadda', 'Drekkana', 'Navamsa', tr('total')], PL7.filter(id => pv[id]).map(id => { const x = pv[id]; return '<tr><td>' + esc(pn(id)) + '</td>' + ['kshetra', 'uchcha', 'hadda', 'drekkana', 'navamsa', 'total'].map(k => '<td class="num">' + fx(x[k] || 0, 2) + '</td>').join('') + '</tr>'; }))) +
    card('😊 ' + term('harsha_bala', tr('harsha')), tbl([tr('planet'), 'Sthana', 'Swochcha', 'Stri/Purusha', 'Dina/Ratri', tr('total')], PL7.filter(id => hb[id]).map(id => { const x = hb[id]; return '<tr><td>' + esc(pn(id)) + '</td>' + ['sthana', 'swochcha', 'strePurusha', 'dinaRatri', 'total'].map(k => '<td class="num">' + num(x[k] != null ? x[k] : 0) + '</td>').join('') + '</tr>'; }))) + '</div>';
  // yogas & aspects
  const TJ = V.tajika || {};
  h += card('✨ ' + term('tajika_yogas', tr('tajYogas')) + ' <small>' + num((TJ.yogas || []).length) + '</small>', ((TJ.yogas || []).length ? (TJ.yogas || []).map(y => { const c = g(CT, 'yogas.' + y.id) || {}; return '<details class="x"><summary>' + esc(nm(c, y.id)) + ' · ' + plist(y.planets) + (y.relevant ? ' ' + pill('★', 'gold') : '') + (y.detail && y.detail.kind ? ' ' + pill(esc(y.detail.kind)) : '') + '</summary><div class="body reading">' + (c.rule ? '<p><b>' + tr('rule') + ':</b> ' + esc(tx(c.rule)) + '</p>' : '') + (c.effect ? '<p>' + esc(tx(c.effect)) + '</p>' : '') + (y.text ? '<p class="sub">' + esc(tx(y.text)) + '</p>' : '') + '</div></details>'; }).join('') : '<p class="sub">' + tr('noneP') + '</p>') +
    '<details class="x"><summary>👁️ ' + tr('tajAspects') + '</summary><div class="body">' + tbl([tr('planet'), tr('planet'), tr('house'), '', tr('orb'), ''], (TJ.aspects || []).map(a => '<tr><td>' + esc(pn(a.a)) + '</td><td>' + esc(pn(a.b)) + '</td><td>' + num(a.houseDistance) + '</td><td>' + esc(nm(g(CT, 'aspects.kinds.' + a.aspectType), String(a.aspectType || '').replace(/^tajika_/, '').replace(/_/g, ' '))) + '</td><td class="num">' + (a.gap != null ? fx(a.gap, 1) + '° / ' + fx(a.orb || 0, 1) + '°' : '') + '</td><td>' + (a.within ? (a.applying ? tr('applying') : a.separating ? tr('separating') : '') : '') + '</td></tr>')) + '</div></details>');
  // sahams
  const SH = V.sahams || {};
  h += card('🎯 ' + term('saham', tr('sahams')) + ' <small>' + num(Object.keys(SH).length) + '</small>', tbl([tr('name'), tr('sign'), tr('lord'), tr('house'), tr('meaning')], Object.keys(SH).map(k => { const x = SH[k], c = g(CT, 'sahams.' + k) || {}; return '<tr><td><b>' + esc(nm(c, k)) + '</b></td><td>' + esc(sgn(x.sign)) + ' ' + dms(x.deg) + '</td><td>' + esc(pn(x.lord)) + '</td><td class="num">' + num(x.house) + '</td><td class="wrap sub">' + esc(tx(c.meaning)) + '</td></tr>'; })) + (CT.sahamsNote ? '<p class="sub">' + esc(tx(CT.sahamsNote)) + '</p>' : ''));
  // Mudda & Patyayini timelines
  const DSV = V.dashas || {}, t0 = V.solarReturn.jdUT, t1 = V.solarReturn.nextReturnJd || (t0 + 365.25), nowJ = nowJd();
  const nmP = n => n.lord ? (n.lord === 'La' ? tr('lagna') : pn(n.lord)) : sgn(n.sign), colP = n => pcol(n.lord || SIGN_LORD[n.sign]);
  h += '<div class="grid2">' + ['mudda', 'patyayini'].map(k => { const tree = (DSV[k] && DSV[k].tree) || []; return card('⏳ ' + term(k + '_dasha', tr(k)), tree.length ? periodBar(tree, k, nmP, colP, t0, t1, nowJ) + tbl([tr('lord'), tr('from'), tr('till'), tr('duration')], tree.map(n => '<tr' + (nowJ >= n.start && nowJ < n.end ? ' class="sel"' : '') + '><td>' + esc(nmP(n)) + '</td><td>' + fmtDate(n.startISO) + '</td><td>' + fmtDate(n.endISO) + '</td><td class="num">' + (n.days != null ? num(Math.round(n.days)) + ' ' + tr('days') : fmtDur((n.end - n.start) / 365.25)) + '</td></tr>')) : '<p class="sub">' + tr('noneP') + '</p>'); }).join('') + '</div>';
  // monthly charts
  const MC = monthCharts(C, V);
  h += card('🗓️ ' + term('masa_pravesha', tr('monthly')), '<div class="vgrid">' + (V.masaPravesha || []).map((m, i) => { const Cm = MC[i]; return '<button type="button" class="vcell" data-vmonth="' + i + '" aria-label="' + esc(tr('monthly') + ' ' + num(m.month)) + '"><b>' + num(m.month) + '</b><small>' + fmtDate(m.iso) + '</small>' + (Cm ? chartSVG(chartModel(Cm, 'D1'), { mini: true, ctx: 'mini', title: '' }) : '') + '<small>' + tr('lagna') + ' ' + esc(sab(m.ascSign)) + ' · ☽ ' + esc(sab(m.moonSign)) + '</small></button>'; }).join('') + '</div>');
  if (CT.howToRead) h += card('📖 ' + tr('howRead'), '<ol class="reading">' + txList(g(CT, 'howToRead.steps')).map(s => '<li>' + esc(s.en ? tx(s) : s) + '</li>').join('') + '</ol>');
  return h;
}, 'Varshaphal'));

/* ================================================================
   5. Lal Kitab
   ================================================================ */
const LKS = { year: null, rem: false };
const lalKitab = (C, year) => cached('lk|' + ckey(C) + year, () => JE().lalKitab(C, Object.assign({ allYears: true }, year ? { year } : {})));
const lkStatus = id => nm(g(JC(), 'lalKitab.status.' + id), String(id).replace(/^lk_/, '').replace(/_/g, ' '));
function tevaModel(C, houses) { return { asc: 0, ascDeg: null, ascLon: 0, list: PL9.map(id => ({ id, sign: (houses[id] - 1 + 12) % 12 })), vk: 'lk', withDeg: false, C }; }
K.view('dasha:lalkitab', C => safe(() => {
  const LK = lalKitab(C, LKS.year), CL = JC().lalKitab || {}, houses = {};
  for (const p of LK.planets) houses[p.id] = p.house;
  const M = tevaModel(C, houses);
  M.list.forEach(it => { const p = LK.planets.find(x => x.id === it.id); if (p) it.dig = p.exalted ? 'exalted' : p.debilitated ? 'debilitated' : ''; });
  let h = '<div class="card"><h2>📕 ' + term('lk_teva', tr('lkTitle')) + '</h2>' + (CL.intro ? '<p class="sub">' + esc(tx(CL.intro)) + '</p>' : '') + (CL.folkNote ? '<div class="banner info">' + esc(tx(CL.folkNote)) + '</div>' : '') + '</div>';
  h += '<div class="chartlayout"><div class="card"><h2>' + tr('teva') + '</h2><div class="chartwrap">' + chartSVG(M, { ctx: 'lk', label: tr('teva'), title: 'LK', noAsc: true }) + '</div><p class="sub">' + (hi() ? 'लाल किताब में भाव = राशि (पहला भाव सदा मेष)।' : 'In Lal Kitab the house is the sign (1st house is always Aries).') + '</p>' +
    '<div class="chips">' + (LK.types || []).filter(t => t.present).map(t => pill(esc(nm(g(CL, 'concepts.' + t.id), t.id)), 'gold')).join('') + '</div></div><div class="detailpane" id="detailPane">';
  h += card('😴 ' + term('soya_graha', tr('sleeping')), '<p><b>' + tr('planets') + ':</b> ' + plist(LK.sleepingPlanets) + '</p><p><b>' + tr('houses3') + ':</b> ' + hlist(LK.sleepingHouses) + '</p>' + (g(CL, 'concepts.soya_graha.what') ? '<p class="sub">' + esc(tx(g(CL, 'concepts.soya_graha.what'))) + '</p>' : '')) + '</div></div>';
  // planet readings
  h += card('🪐 ' + tr('lkReadings'), '<div class="row"><button type="button" class="btn sm" data-lkrem="1" aria-pressed="' + LKS.rem + '">🪔 ' + (LKS.rem ? tr('hideRemedies') : (CL.upayLabel ? tx(CL.upayLabel) : tr('showRemedies'))) + '</button></div>' + (LKS.rem && CL.upayNote ? '<p class="sub">' + esc(tx(CL.upayNote)) + '</p>' : '') +
    LK.planets.map(p => { const r = g(CL, 'planetInHouse.' + p.readingId), u = g(CL, 'upay.' + p.remedyId); return '<div class="lkrow" id="lk_' + p.id + '"><h3>' + esc(pn(p.id)) + ' · ' + tr('house') + ' ' + num(p.house) + ' ' + (p.status || []).map(s => pill(esc(lkStatus(s)), s === 'lk_exalted' || s === 'lk_pakka_ghar' || s === 'lk_kayam' ? 'green' : s === 'lk_debilitated' ? 'red' : s === 'lk_soya' ? 'indigo' : '')).join('') + '</h3>' + (r ? '<p class="reading">' + esc(tx(r)) + '</p>' : '') + (LKS.rem && u ? '<p class="sub">🪔 ' + esc(tx(u)) + '</p>' : '') + '</div>'; }).join(''));
  // debts
  const rins = LK.rin || [], pres = rins.filter(r => r.present);
  h += '<div class="grid2">' + card('🧾 ' + term('rin_debt', tr('rin')), (pres.length ? pres.map(r => { const c = g(CL, 'rin.' + r.id) || {}; return '<div class="lkrow"><h3>' + esc(nm(c, r.id)) + ' · ' + plist(r.planets) + '</h3>' + (c.meaning ? '<p class="reading">' + esc(tx(c.meaning)) + '</p>' : '') + (c.rule ? '<p class="sub">' + tr('rule') + ': ' + esc(tx(c.rule)) + '</p>' : '') + (LKS.rem && c.remedy ? '<p class="sub">🪔 ' + esc(tx(c.remedy)) + '</p>' : '') + '</div>'; }).join('') : '<p>' + tr('noRin') + '</p>') +
    '<details class="x"><summary>' + (hi() ? 'सभी जाँचे गए ऋण' : 'All debts checked') + ' (' + num(rins.length) + ')</summary><div class="body">' + rins.map(r => '<p>' + (r.present ? '● ' : '○ ') + esc(nm(g(CL, 'rin.' + r.id), r.id)) + '</p>').join('') + '</div></details>') +
    card('🧪 ' + term('masnui_graha', tr('masnui')), ((LK.masnui || []).filter(m => m.present).map(m => { const c = g(CL, 'masnui.' + m.id) || {}; return '<p><b>' + esc(nm(c, m.id)) + '</b> · ' + tr('house') + ' ' + num(m.house) + (c.text ? '<br><span class="sub">' + esc(tx(c.text)) + '</span>' : '') + '</p>'; }).join('') || '<p class="sub">' + tr('noneP') + '</p>') +
      '<h3>' + tr('tevaType') + '</h3>' + (LK.types || []).map(t => '<p>' + (t.present ? '● ' : '○ ') + esc(nm(g(CL, 'concepts.' + t.id), t.id)) + '</p>').join('')) + '</div>';
  // houses
  h += card('🏠 ' + tr('houses3'), LK.houses.map(x => { const c = g(CL, 'houses.' + x.readingId) || {}; return '<details class="x"><summary>' + num(x.house) + ' · ' + esc(nm(c, '')) + (x.planets.length ? ' — ' + plist(x.planets) : '') + (x.sleeping ? ' ' + pill('😴', 'indigo') : '') + '</summary><div class="body reading"><p>' + esc(tx(c.meaning)) + '</p>' + (LKS.rem && g(CL, 'upayByHouse.' + x.readingId) ? '<p class="sub">🪔 ' + esc(tx(g(CL, 'upayByHouse.' + x.readingId))) + '</p>' : '') + '</div></details>'; }).join(''));
  // varshphal
  const vf = LK.varshphal || {}, tbl120 = LK.varshphalTable || [], vh = vf.houses || {};
  h += card('📅 ' + term('lk_varshphal', tr('lkVarshphal')), '<div class="row"><label for="lkYear" class="lbl">' + tr('runningYear') + '</label><select id="lkYear" class="inline">' + Array.from({ length: 120 }, (_, i) => '<option value="' + (i + 1) + '"' + (i + 1 === vf.year ? ' selected' : '') + '>' + num(i + 1) + ' (' + tr('ageL') + ' ' + num(i) + ')</option>').join('') + '</select></div>' +
    '<div class="compare"><div class="chartwrap" style="max-width:320px">' + chartSVG(tevaModel(C, vh), { ctx: 'lkv', label: tr('lkVarshphal'), title: num(vf.year || ''), noAsc: true }) + '</div><div>' + (vf.analysis ? '<p><b>' + tr('sleeping') + ':</b> ' + plist(vf.analysis.sleepingPlanets) + '</p><p class="sub">' + tr('rin') + ': ' + ((vf.analysis.rin || []).filter(r => r.present).map(r => esc(nm(g(CL, 'rin.' + r.id), r.id))).join(', ') || '—') + '</p>' : '') + (vf.rule ? '<p class="sub">' + esc(tx(vf.rule)) + '</p>' : '') + '</div></div>' +
    '<details class="x"><summary>' + tr('allYears') + '</summary><div class="body"><div class="tablewrap" style="max-height:420px;overflow:auto"><table class="lk120"><thead><tr><th>#</th>' + PL9.map(id => '<th>' + esc(pab(id)) + '</th>').join('') + '</tr></thead><tbody>' + tbl120.map(r => '<tr' + (r.year === vf.year ? ' class="sel"' : '') + '><td>' + num(r.year) + '</td>' + PL9.map(id => '<td class="num">' + num(r.houses[id]) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div></div></details>');
  return h;
}, 'Lal Kitab'));

/* ================================================================
   6. Prashna — one-tap "Ask now", KP / Vedic number pads
   ================================================================ */
const PRS = { q: 'general', mode: 'none', num: '', st: { place: null }, res: null, err: null };
K.view('more:prashna', () => safe(() => {
  const CP3 = JC().prashna || {}, qt = CP3.questionTypes || {};
  if (!PRS.st.place) PRS.st.place = K.defaultPlace();
  const max = PRS.mode === 'kp' ? 249 : 108;
  let h = '<div class="card"><h2>❓ ' + term('prashna', tr('prTitle')) + '</h2>' + (CP3.intro ? '<p class="sub">' + esc(tx(CP3.intro)) + '</p>' : '') +
    '<h3>' + tr('question') + '</h3><div class="chips" role="group">' + Object.keys(qt).map(k => '<button type="button" class="chip' + (PRS.q === k ? ' on' : '') + '" data-prq="' + k + '" aria-pressed="' + (PRS.q === k) + '">' + esc(nm(qt[k], k)) + '</button>').join('') + '</div>' +
    (qt[PRS.q] && qt[PRS.q].note ? '<p class="sub">' + esc(tx(qt[PRS.q].note)) + '</p>' : '') + K.placePicker('prp', PRS.st) +
    '<div class="row" style="margin-top:8px"><span class="lbl">' + tr('numberMode') + '</span>' + seg('prMode', PRS.mode, [['none', tr('none')], ['kp', tr('kpNum')], ['vedic', tr('vedicNum')]]) + '</div>' +
    (PRS.mode !== 'none' ? '<div class="numpad" role="group" aria-label="' + tr('numberMode') + '"><output class="npout" aria-live="polite">' + esc(num(PRS.num || '—')) + ' <small>/ ' + num(max) + '</small></output>' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button type="button" class="btn" data-prn="' + n + '">' + num(n) + '</button>').join('') + '<button type="button" class="btn" data-prn="back" aria-label="⌫">⌫</button><button type="button" class="btn" data-prn="0">' + num(0) + '</button><button type="button" class="btn" data-prn="clear">' + tr('clear') + '</button></div>' : '') +
    '<div class="askwrap"><button type="button" class="btn primary ask" data-act3="ask">🙏 ' + tr('askNow') + '</button><p class="sub">' + tr('askHelp') + '</p></div></div>';
  if (PRS.err) h += '<div class="banner err">' + esc(PRS.err) + '</div>';
  if (PRS.res) h += prashnaResult(PRS.res);
  h += '<div class="grid2">' + card('🙏 ' + tr('howAsk'), '<ul class="reading">' + txList(g(CP3, 'howToAsk.points')).map(s => '<li>' + esc(s.en ? tx(s) : s) + '</li>').join('') + '</ul>') + card('📖 ' + tr('howRead'), '<ol class="reading">' + txList(g(CP3, 'howRead.steps')).map(s => '<li>' + esc(s.en ? tx(s) : s) + '</li>').join('') + '</ol>' + (CP3.ethics ? '<p class="sub">' + esc(tx(CP3.ethics)) + '</p>' : '')) + '</div>';
  return h;
}, 'Prashna'));
function prashnaResult(R) {
  const CP3 = JC().prashna || {}, A = R.analysis || {}, v = g(CP3, 'verdicts.' + A.verdict) || {};
  const M = chartModel(R.chart, 'D1');
  let h = '<div class="chartlayout"><div class="card"><h2>🪐 ' + tr('askedAt') + ' ' + esc(fmtDate(R.moment && R.moment.iso, true)) + '</h2><div class="chartwrap">' + chartSVG(M, { ctx: 'pr', label: tr('prTitle'), title: tr('prashna'), subtitle: sgn(M.asc), hl: { h: [R.karyaHouse] } }) + '</div>' +
    '<p class="sub">' + tr('karyaHouse') + ': ' + num(R.karyaHouse) + ' · ' + tr('lagna') + ' ' + esc(sgn(R.chart.asc.sign)) + (A.lagnaLord ? ' (' + esc(pn(A.lagnaLord)) + ')' : '') + (A.karyaLord ? ' · ' + esc(pn(A.karyaLord)) + '' : '') + '</p></div><div class="detailpane" id="detailPane">' +
    card('🔮 ' + tr('verdict'), '<div class="verdict ' + esc(A.verdict || '') + '"><b>' + esc(nm({ name: v.label }, String(A.verdict || '').replace(/_/g, ' '))) + '</b>' + (A.score != null ? ' <span class="sub">(' + (A.score > 0 ? '+' : '') + num(A.score) + ')</span>' : '') + '</div>' + (v.text ? '<p class="reading">' + esc(tx(v.text)) + '</p>' : '') + '<p class="sub">' + esc(tx(g(JC(), 'systemLabels.traditional')) || (hi() ? 'परंपरागत संकेत, निश्चितता नहीं।' : 'A traditional indication, not a certainty.')) + '</p>') + '</div></div>';
  const rules = (A.rules || []).slice().sort((a, b) => (b.applies ? 1 : 0) - (a.applies ? 1 : 0));
  h += card('📋 ' + tr('rulesChecked') + ' <small>' + num(rules.filter(r => r.applies).length) + ' / ' + num(rules.length) + '</small>', rules.map(r => { const c = g(CP3, 'rules.' + r.id) || {}; return '<p class="' + (r.applies ? '' : 'sub') + '">' + (r.applies ? (r.effect === 'positive' ? '✅' : r.effect === 'negative' ? '⛔' : '⏳') : '⚪') + ' <b>' + esc(nm(c, r.id)) + '</b>' + (r.applies ? ' ' + pill(r.effect === 'positive' ? tr('positive') : r.effect === 'negative' ? tr('negative') : tr('timing'), r.effect === 'positive' ? 'green' : r.effect === 'negative' ? 'red' : 'indigo') : '') + (r.applies && (r.text || c.text) ? '<br><span class="sub">' + esc(tx(r.text) || tx(c.text)) + '</span>' : '') + (r.timing ? '<br><span class="sub">⏳ ' + esc(tx(r.timing)) + '</span>' : '') + '</p>'; }).join(''));
  if (R.kpHorary) { const H = R.kpHorary, kc = (H.cusps || [])[R.karyaHouse - 1]; h += card('🎯 ' + tr('horary') + ' #' + num(H.number), '<p>' + tr('horaryAsc') + ': ' + esc(sgn(H.cusps[0].sign)) + ' ' + dms(H.cusps[0].deg) + ' · ' + pnA(H.cusps[0].starLord) + ' › ' + pnA(H.cusps[0].subLord) + '</p>' + (kc ? '<p>' + tr('karyaHouse') + ' ' + num(kc.house) + ': ' + tr('csl') + ' <b>' + esc(pn(kc.subLord)) + '</b></p>' : '')); }
  if (R.vedicNumber) { const VN = R.vedicNumber; h += card('🔢 ' + tr('vedicNumRes') + ' #' + num(VN.number), '<p>' + tr('lagna') + ': ' + esc(sgn(VN.sign)) + ' · D9 ' + esc(sgn(VN.navamsaSign)) + ' · ' + esc(nkn(VN.nakshatra)) + ' ' + num(VN.pada) + '</p>' + (VN.rule ? '<p class="sub">' + esc(tx(VN.rule)) + '</p>' : '')); }
  return h;
}
function ask() {
  const pl = PRS.st.place || K.defaultPlace(), o = { question: PRS.q }, n = +PRS.num;
  if (PRS.mode === 'kp') { if (!(n >= 1 && n <= 249)) { toast('KP: 1–249'); return; } o.kpNumber = n; }
  if (PRS.mode === 'vedic') { if (!(n >= 1 && n <= 108)) { toast('1–108'); return; } o.vedicNumber = n; }
  if (PRS.mode !== 'kp') o.kp = false;
  try { PRS.res = JE().prashna({ place: K.enginePlace(pl) }, o); PRS.err = null; } catch (e) { PRS.res = null; PRS.err = e.message; console.error(e); }
  rerenderAt();
  if (!K.IS_NODE) setTimeout(() => { const v = document.querySelector('.verdict'); if (v) v.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60);
}

/* ================================================================
   7. Rectify — events, rectifyAsync with progress, ranked candidates, curve, slider, time band
   ================================================================ */
const RC = { type: 'marriage', date: '', w: 1, win: 120, step: 2, busy: false, prog: 0, res: null, err: null, key: '', slider: null, kinds: new Set(['lagna', 'D9', 'moon_nakshatra']), tok: 0 };
const evTypes = () => Object.keys(g(JC(), 'rectification.eventTypes') || {});
const evTName = id => nm(g(JC(), 'rectification.eventTypes.' + id), id.replace(/_/g, ' '));
function rcEvents(p) { if (!Array.isArray(p.rectEvents)) p.rectEvents = []; return p.rectEvents; }
const timeBand = (C, win) => cached('tb|' + ckey(C) + win, () => JE().timeBand(C, { windowMinutes: win }));
function curveSvg(R, p) {
  const pts = R.curve || []; if (!pts.length) return '';
  const W = 600, H = 150, m0 = pts[0].minutes, m1 = pts[pts.length - 1].minutes, smax = Math.max(1, ...pts.map(x => x.score));
  const X = m => 30 + (m - m0) / ((m1 - m0) || 1) * (W - 40), Y = s => H - 22 - s / smax * (H - 40);
  let s = '<svg class="curve" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(tr('scoreCurve')) + '"><line class="ax" x1="30" y1="' + (H - 22) + '" x2="' + (W - 10) + '" y2="' + (H - 22) + '"/>';
  s += '<path class="cl" d="' + pts.map((q, i) => (i ? 'L' : 'M') + X(q.minutes).toFixed(1) + ' ' + Y(q.score).toFixed(1)).join(' ') + '"/>';
  for (const t of [m0, Math.round(m0 / 2), 0, Math.round(m1 / 2), m1]) s += '<text class="axt" x="' + X(t).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + (t > 0 ? '+' : '') + num(t) + '</text>';
  s += '<line class="inl" x1="' + X(0) + '" x2="' + X(0) + '" y1="8" y2="' + (H - 22) + '"/>';
  (R.top || []).slice(0, 5).forEach(c => { s += '<circle class="cand" data-rcm="' + c.minutesFromInput + '" cx="' + X(c.minutesFromInput).toFixed(1) + '" cy="' + Y(c.score).toFixed(1) + '" r="' + (c.rank === 1 ? 7 : 5) + '" tabindex="0" role="button" aria-label="#' + c.rank + ' ' + esc(fmtDate(c.iso, true)) + '"><title>#' + c.rank + ' · ' + esc(fmtDate(c.iso, true)) + ' · ' + fx(c.score, 1) + '</title></circle>'; });
  if (RC.slider != null) s += '<line class="sl" x1="' + X(RC.slider).toFixed(1) + '" x2="' + X(RC.slider).toFixed(1) + '" y1="8" y2="' + (H - 22) + '"/>';
  return s + '</svg>';
}
function previewHtml(C, p) {
  const m = RC.slider || 0, sh = K.shiftLocal(p.date, p.time || '12:00', m);
  let Cx; try { Cx = K.computeChart(p, null, Object.assign(K.inputFor(p), { date: sh.date, time: sh.time })); } catch (e) { return '<div class="banner err">' + esc(e.message) + '</div>'; }
  const mo = P(Cx, 'Mo');
  return '<div class="compare"><div class="chartwrap" style="max-width:260px">' + chartSVG(chartModel(Cx, 'D1'), { ctx: 'rcp', label: tr('preview'), title: num(sh.time.slice(0, 5)), subtitle: sgn(Cx.asc.sign) }) + '</div><div><div class="facts" style="grid-template-columns:1fr 1fr">' +
    K.fact(tr('lagna'), sgn(Cx.asc.sign), dms(Cx.asc.deg)) + K.fact('D9', sgn(Cx.vargas.D9.asc), '') + K.fact('D10', sgn(Cx.vargas.D10.asc), '') + K.fact(tr('moonNak'), nkn(mo.nak), tr('pada') + ' ' + num(mo.pada)) + '</div><p><b>' + esc(fmtDate(sh.date + 'T' + sh.time, true)) + '</b> (' + (m > 0 ? '+' : '') + num(m) + ' ' + tr('minutes') + ')</p>' +
    (p.time ? '<button type="button" class="btn sm" data-act3="useTime">✅ ' + tr('useTime') + '</button>' : '') + '</div></div>';
}
K.view('more:rectify', C => safe(() => {
  const p = K.curP(), CR = JC().rectification || {}, evs = rcEvents(p);
  if (!RC.date) RC.date = K.todayStr();
  let h = '<div class="card"><h2>🕰️ ' + term('candidate_time', tr('rcTitle')) + '</h2>' + (CR.intro ? '<p class="sub">' + esc(tx(CR.intro)) + '</p>' : '') + '<div class="banner warn">⚠️ ' + tr('helperNote') + (CR.disclaimer ? ' ' + esc(tx(CR.disclaimer)) : '') + '</div>' +
    (!p.time ? '<div class="banner info">⏰ ' + tr('timeUnknown') + ' — 12:00 ±12h</div>' : '') + '</div>';
  h += '<div class="grid2"><div class="card"><h2>📌 ' + tr('rcEvents') + ' <small>' + num(evs.length) + '</small></h2><div class="formgrid">' +
    '<div class="field"><label for="rcType">' + tr('category') + '</label><select id="rcType">' + evTypes().map(id => '<option value="' + id + '"' + (id === RC.type ? ' selected' : '') + '>' + esc(evTName(id)) + '</option>').join('') + '</select></div>' +
    '<div class="field"><label for="rcDate">' + tr('dateL') + '</label><input type="date" id="rcDate" min="' + p.date + '" max="2100-12-31" value="' + esc(RC.date) + '"></div>' +
    '<div class="field"><label for="rcW">' + tr('weight') + '</label><select id="rcW">' + [1, 2, 3].map(w => '<option value="' + w + '"' + (w === RC.w ? ' selected' : '') + '>' + num(w) + '</option>').join('') + '</select></div></div>' +
    '<button type="button" class="btn" data-act3="rcAdd">➕ ' + tr('addEvent') + '</button>' +
    (evs.length ? '<ul class="evlist">' + evs.map((e, i) => '<li><span>' + esc(evTName(e.type)) + ' · <b>' + fmtDate(e.date) + '</b>' + (e.weight > 1 ? ' ×' + num(e.weight) : '') + '</span><button type="button" class="btn xs danger" data-rcdel="' + i + '" aria-label="' + esc(tr('delEvent') + ' ' + evTName(e.type)) + '">✕</button></li>').join('') + '</ul>' : '<p class="sub">' + tr('needEvents') + '</p>') + '</div>';
  h += '<div class="card"><h2>⚙️ ' + tr('options3') + '</h2><div class="row"><span class="lbl">' + tr('windowL') + '</span>' + seg('rcWin', RC.win, [[30, '±30′'], [60, '±1h'], [120, '±2h'], [240, '±4h']]) + '</div><div class="row"><span class="lbl">' + tr('stepL') + '</span>' + seg('rcStep', RC.step, [[1, '1′'], [2, '2′'], [5, '5′']]) + '</div>' +
    '<button type="button" class="btn primary" data-act3="rcRun"' + (evs.length < 2 || RC.busy ? ' disabled' : '') + '>🔍 ' + tr('runRect') + '</button>' + (RC.busy ? '<div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(RC.prog * 100) + '"><i id="rcProg" style="width:' + (RC.prog * 100).toFixed(0) + '%"></i></div>' : '') +
    (RC.err ? '<div class="banner err">' + esc(RC.err) + '</div>' : '') + (CR.methods ? '<details class="x"><summary>📖 ' + tr('method') + '</summary><div class="body reading">' + Object.keys(CR.methods).map(k => '<p><b>' + esc(nm(CR.methods[k], k)) + ':</b> ' + esc(tx(CR.methods[k].what)) + '</p>').join('') + '</div></details>' : '') + '</div></div>';
  const R = RC.res && RC.key === p.id ? RC.res : null;
  if (R) {
    const conf = R.confidence, noClear = R.noClearWinner || (conf && (conf.level === 'none' || conf.noClearWinner));
    if (RC.slider == null) RC.slider = R.best ? R.best.minutesFromInput : 0;
    h += '<div class="card"><h2>🏆 ' + tr('candidates') + '</h2>' + (noClear ? '<div class="banner warn">' + tr('noClear') + '</div>' : '') + (conf != null ? (typeof conf === 'object' && g(JC(), 'rectification.confidence.' + conf.level + '.text') ? '<p class="sub">' + esc(tx(g(JC(), 'rectification.confidence.' + conf.level + '.text'))) + '</p>' : '') + '<p>' + tr('confidence') + ': <b>' + esc(typeof conf === 'object' ? (tx(conf.label) || tx(g(JC(), 'rectification.confidence.' + conf.level + '.label')) || (K.T.en['conf_' + conf.level] ? tr('conf_' + conf.level) : String(conf.level || conf.value || ''))) + (conf.percentile != null ? ' · ' + fx(conf.percentile, 0) + ' %ile' : '') : (typeof conf === 'number' ? fx(conf * (conf <= 1 ? 100 : 1), 0) + '%' : String(conf))) + '</b></p>' : '') +
      '<h3>' + tr('scoreCurve') + '</h3>' + curveSvg(R, p) +
      tbl(['#', tr('localTime'), 'Δ', tr('scoreL'), tr('lagna'), 'D9', tr('moonNak'), 'Kunda'], (R.top || []).map(c => '<tr class="click' + (c.minutesFromInput === RC.slider ? ' sel' : '') + '" data-rcm="' + c.minutesFromInput + '" tabindex="0"><td>' + num(c.rank) + '</td><td>' + esc(fmtDate(c.iso, true)) + '</td><td class="num">' + (c.minutesFromInput > 0 ? '+' : '') + num(c.minutesFromInput) + '′</td><td class="num"><b>' + fx(c.score, 1) + '</b></td><td>' + esc(sab(c.lagna)) + '</td><td>' + esc(sab(c.d9)) + '</td><td>' + esc(nkn(c.moonNakshatra)) + ' ' + num(c.moonPada) + '</td><td>' + (c.kunda && c.kunda.matchesMoon ? '✓' : '—') + '</td></tr>')) +
      (R.best && R.best.explanation ? '<p class="sub">' + esc(tx(R.best.explanation)) + '</p>' : '') + (R.method ? '<details class="x"><summary>' + tr('method') + '</summary><div class="body"><p class="sub">' + esc(tx(R.method)) + '</p></div></details>' : '') + '</div>';
  }
  // slider preview + time band (works before any search)
  const win = R ? R.windowMinutes : RC.win, TB = timeBand(C, win);
  if (RC.slider == null) RC.slider = 0;
  const marks = (TB.boundaries || []).filter(b => RC.kinds.has(b.kind)).map(b => '<span class="mk k-' + esc(b.kind) + '" style="left:' + (50 + b.minutesFromBirth / win * 50).toFixed(2) + '%" title="' + esc(b.kind + ' ' + fmtDate(b.iso, true)) + '"></span>').join('');
  h += '<div class="card"><h2>🎚️ ' + tr('preview') + '</h2><div class="scrub rcs"><div class="track">' + marks + '</div><label class="vh" for="rcSlider">' + tr('preview') + '</label><input type="range" id="rcSlider" min="' + (-win) + '" max="' + win + '" step="1" value="' + RC.slider + '"></div><div id="rcPrev">' + previewHtml(C, p) + '</div></div>';
  const kinds = ['lagna', 'D9', 'D10', 'D12', 'D60', 'moon_nakshatra', 'moon_pada'], bn = g(CR, 'boundaries') || {};
  const list = (TB.boundaries || []).filter(b => RC.kinds.has(b.kind));
  h += card('📏 ' + term('time_band', tr('timeBand')), (TB.lagnaStable ? '<p>' + tr('lagnaStable') + ': <b>' + esc(fmtDate(TB.lagnaStable.from, true)) + ' – ' + esc(K.fmtTime(TB.lagnaStable.to)) + '</b> · ' + tr('kundaWin') + ': ' + num((TB.kundaWindows || []).length) + '</p>' : '') +
    '<div class="chips" role="group" aria-label="' + tr('kinds') + '">' + kinds.map(k => '<button type="button" class="chip' + (RC.kinds.has(k) ? ' on' : '') + '" data-rck="' + k + '" aria-pressed="' + RC.kinds.has(k) + '"><span class="sw k-' + k + '"></span>' + esc(nm(bn[k], k.replace(/_/g, ' '))) + '</button>').join('') + '</div>' +
    tbl([tr('localTime'), '', tr('from'), tr('to'), 'Δ'], list.slice(0, 200).map(b => { const sg = ['lagna', 'D9', 'D10', 'D12', 'D60'].includes(b.kind), f = v => sg ? esc(sab(v)) : b.kind === 'moon_nakshatra' ? esc(nkn(v)) : num(v); return '<tr class="click" data-rcm="' + b.minutesFromBirth + '"><td>' + esc(K.fmtTime(b.iso)) + ':' + esc(String(b.iso).slice(17, 19)) + '</td><td>' + esc(nm(bn[b.kind], b.kind)) + '</td><td>' + f(b.from) + '</td><td>' + f(b.to) + '</td><td class="num">' + (b.minutesFromBirth > 0 ? '+' : '') + num(b.minutesFromBirth) + '′</td></tr>'; })));
  return h;
}, 'Rectify'));
function rcRun() {
  const p = K.curP(), evs = rcEvents(p); if (evs.length < 2 || RC.busy) return;
  const tok = ++RC.tok; RC.busy = true; RC.prog = 0; RC.err = null; rerenderAt();
  const input = K.inputFor(p); if (!input.time) input.time = '12:00';
  const win = p.time ? RC.win : Math.max(RC.win, 720);
  JE().rectifyAsync(input, evs.map(e => ({ type: e.type, date: e.date, weight: e.weight })), { windowMinutes: win, stepMinutes: RC.step, top: 10, chartOpts: K.optsFor(p) }, pr => { if (tok !== RC.tok) return; RC.prog = pr.fraction; const b = $('#rcProg'); if (b) { b.style.width = (pr.fraction * 100).toFixed(0) + '%'; const pb = b.parentElement; if (pb) pb.setAttribute('aria-valuenow', Math.round(pr.fraction * 100)); } })
    .then(R => { if (tok !== RC.tok) return; RC.busy = false; RC.res = R; RC.key = p.id; RC.slider = R.best ? R.best.minutesFromInput : 0; rerenderAt(); toast('✅ ' + tr('candidates')); }, e => { if (tok !== RC.tok) return; RC.busy = false; RC.err = e.message; rerenderAt(); });
}

/* ================================================================
   events
   ================================================================ */
K.onClick((e, t) => {
  // tapping a planet in charts that are not the natal chart (annual, Lal Kitab, prashna, preview)
  const svg = t.closest && t.closest('svg.chart');
  const ctx = svg && svg.getAttribute('data-ctx');
  const kEl = t.closest && t.closest('[data-k]');
  if (ctx && kEl && ['vp', 'lk', 'lkv', 'pr', 'rcp', 'jm'].includes(ctx)) {
    const [kind, v] = kEl.getAttribute('data-k').split(':');
    const C = K.curChart();
    if (ctx === 'vp' && C) { const V = varsha(C, VY.age != null ? VY.age : curAge(C)); if (kind === 'p') showDetail(esc(pn(v)) + ' · ' + tr('varsha'), K.detailPlanet(V.chart, v, 'D1'), kEl); else showDetail(tr('house') + ' ' + num(v), K.detailHouse(V.chart, +v, 'D1'), kEl); return true; }
    if ((ctx === 'lk' || ctx === 'lkv') && C && kind === 'p') { const LK = lalKitab(C, LKS.year), pp = LK.planets.find(x => x.id === v), r = pp && g(JC(), 'lalKitab.planetInHouse.' + pp.readingId); showDetail(esc(pn(v)) + ' · ' + tr('lkTitle'), (pp ? '<p>' + tr('house') + ' ' + num(pp.house) + ' ' + (pp.status || []).map(s => pill(esc(lkStatus(s)))).join('') + '</p>' : '') + (r ? '<p class="reading">' + esc(tx(r)) + '</p>' : ''), kEl); return true; }
    if (ctx === 'pr' && PRS.res) { if (kind === 'p') showDetail(esc(pn(v)) + ' · ' + tr('prashna'), K.detailPlanet(PRS.res.chart, v, 'D1'), kEl); else showDetail(tr('house') + ' ' + num(v), K.detailHouse(PRS.res.chart, +v, 'D1'), kEl); return true; }
    if (ctx === 'jm' && C && kind === 'h' && JM.ov === 'argala') { JM.al = false; JM.house = +v; rerenderAt(); return true; }
    if (ctx === 'jm') return false;
    return true;
  }
  const b = t.closest && t.closest('button, [data-kph], [data-kpp], [data-kpev], [data-rcm], [data-pseg]'); if (!b) return false;
  const d = b.dataset;
  if (b.closest('#jmOv')) { JM.ov = d.v; rerenderAt(); return true; }
  if (d.jmh) { if (d.jmh === 'AL') JM.al = true; else { JM.al = false; JM.house = +d.jmh; } rerenderAt(); return true; }
  if (b.closest('#kpAyan')) { KPS.ayan = d.v; KPS.hor = null; rerenderAt(); return true; }
  if (d.kph) { const h = +d.kph; KPS.selH = KPS.selH === h ? null : h; KPS.selP = null; rerenderAt(); return true; }
  if (d.kpp) { KPS.selP = KPS.selP === d.kpp ? null : d.kpp; KPS.selH = null; rerenderAt(); return true; }
  if (d.kpev != null) { const C = K.curChart(), R = kpOf(C, K.curP()), ev = R.events[+d.kpev], c = g(JC(), 'kp.eventRules.' + ev.id) || {}; showDetail(esc(evName(ev.id)), '<p>' + verdictPill(ev.verdict) + '</p>' + (g(JC(), 'kp.eventVerdicts.' + ev.verdict + '.text') ? '<p class="sub">' + esc(tx(g(JC(), 'kp.eventVerdicts.' + ev.verdict + '.text'))) + '</p>' : '') + (c.rule ? '<p class="reading">' + esc(tx(c.rule)) + '</p>' : '') + '<dl class="kv"><dt>' + tr('cusp') + '</dt><dd>' + num(ev.cusp) + '</dd><dt>' + tr('csl') + '</dt><dd>' + esc(pn(ev.cuspalSubLord)) + ' → ' + hlist(ev.cslSignifies) + '</dd><dt>' + tr('cslStar') + '</dt><dd>' + esc(pn(ev.starLordOfCsl)) + ' → ' + hlist(ev.starLordSignifies) + '</dd><dt>' + tr('fav') + '</dt><dd>' + hlist(ev.favourable) + ' (' + hlist(ev.favourableHits) + ')</dd><dt>' + tr('neg') + '</dt><dd>' + hlist(ev.negating) + ' (' + hlist(ev.negatingHits) + ')</dd></dl>' + (ev.text ? '<p class="sub">' + esc(tx(ev.text)) + '</p>' : '') + (c.note ? '<p class="sub">' + esc(tx(c.note)) + '</p>' : ''), b); return true; }
  if (d.np) { if (d.np === 'back') KPS.num = KPS.num.slice(0, -1); else if (d.np === 'go') { runHorary(); return true; } else if ((KPS.num + d.np).length <= 3 && +(KPS.num + d.np) <= 249) KPS.num = (KPS.num + d.np).replace(/^0+/, ''); const o = $('#kpNumOut'); if (o) o.textContent = num(KPS.num || '—'); return true; }
  if (d.vy != null) { const C = K.curChart(); const a = VY.age != null ? VY.age : curAge(C); VY.age = +d.vy === 0 ? null : clamp(a + +d.vy, 0, 100); rerenderAt(); return true; }
  if (d.vmonth != null) { const C = K.curChart(), V = varsha(C, VY.age != null ? VY.age : curAge(C)), Cm = monthCharts(C, V)[+d.vmonth], m = V.masaPravesha[+d.vmonth]; if (Cm) showDetail('🗓️ ' + tr('monthly') + ' ' + num(m.month), '<p><b>' + esc(fmtDate(m.iso, true)) + '</b></p><div class="chartwrap">' + chartSVG(chartModel(Cm, 'D1'), { ctx: 'mpv', label: tr('monthly'), title: num(m.month), subtitle: sgn(Cm.asc.sign), tags: { [m.munthaSign]: ['Mu'] } }) + '</div><p class="sub">' + tr('lagna') + ' ' + esc(sgn(m.ascSign)) + ' · ' + pnA('Mo') + ' ' + esc(sgn(m.moonSign)) + ' · ' + tr('muntha') + ' ' + esc(sgn(m.munthaSign)) + '</p>', b); return true; }
  if (d.pseg) { const [k, i] = d.pseg.split(':'), C = K.curChart(), V = varsha(C, VY.age != null ? VY.age : curAge(C)), n = V.dashas[k].tree[+i]; showDetail(esc(tr(k)) + ' · ' + esc(n.lord ? (n.lord === 'La' ? tr('lagna') : pn(n.lord)) : sgn(n.sign)), '<p><b>' + fmtDate(n.startISO, true) + ' – ' + fmtDate(n.endISO, true) + '</b></p>' + ((n.children || []).length ? tbl([tr('antardasha'), tr('from'), tr('till')], n.children.map(c => '<tr><td>' + esc(c.lord ? (c.lord === 'La' ? tr('lagna') : pn(c.lord)) : sgn(c.sign)) + '</td><td>' + fmtDate(c.startISO) + '</td><td>' + fmtDate(c.endISO) + '</td></tr>')) : ''), b); return true; }
  if (d.lkrem) { LKS.rem = !LKS.rem; rerenderAt(); return true; }
  if (d.prq) { PRS.q = d.prq; rerenderAt(); return true; }
  if (b.closest('#prMode')) { PRS.mode = d.v; PRS.num = ''; rerenderAt(); return true; }
  if (d.prn) { const max = PRS.mode === 'kp' ? 249 : 108; if (d.prn === 'back') PRS.num = PRS.num.slice(0, -1); else if (d.prn === 'clear') PRS.num = ''; else if (+(PRS.num + d.prn) <= max) PRS.num = (PRS.num + d.prn).replace(/^0+/, ''); const o = document.querySelector('.numpad .npout'); if (o) o.innerHTML = esc(num(PRS.num || '—')) + ' <small>/ ' + num(max) + '</small>'; return true; }
  if (d.act3 === 'ask') { ask(); return true; }
  if (b.closest('#rcWin')) { RC.win = +d.v; RC.slider = clamp(RC.slider || 0, -RC.win, RC.win); rerenderAt(); return true; }
  if (b.closest('#rcStep')) { RC.step = +d.v; rerenderAt(); return true; }
  if (d.act3 === 'rcAdd') { const p = K.curP(), dt = ($('#rcDate') || {}).value || RC.date; if (!K.validDate(dt) || dt < p.date) { toast(tr('needDate')); return true; } RC.date = dt; rcEvents(p).push({ type: RC.type, date: dt, weight: RC.w }); rcEvents(p).sort((a, b2) => a.date < b2.date ? -1 : 1); K.saveP(); rerenderAt(); return true; }
  if (d.rcdel != null) { const p = K.curP(); rcEvents(p).splice(+d.rcdel, 1); K.saveP(); rerenderAt(); return true; }
  if (d.act3 === 'rcRun') { rcRun(); return true; }
  if (d.rcm != null) { RC.slider = +d.rcm; const sl = $('#rcSlider'); if (sl) { sl.value = RC.slider; const pv = $('#rcPrev'); if (pv) pv.innerHTML = previewHtml(K.curChart(), K.curP()); } rerenderAt(); return true; }
  if (d.rck) { if (RC.kinds.has(d.rck)) RC.kinds.delete(d.rck); else RC.kinds.add(d.rck); rerenderAt(); return true; }
  if (d.act3 === 'useTime') { const p = K.curP(); if (!p || !p.time) return true; const sh = K.shiftLocal(p.date, p.time, RC.slider || 0); if (K.IS_NODE || confirm(tr('useTimeQ') + ' ' + sh.date + ' ' + sh.time + '?')) { p.date = sh.date; p.time = sh.time.endsWith(':00') ? sh.time.slice(0, 5) : sh.time; RC.res = null; RC.slider = 0; K.saveP(); toast(tr('saved')); rerenderAt(); } return true; }
  return false;
});
K.onInput(e => {
  const t = e.target;
  if (t.id === 'rcSlider') { RC.slider = +t.value; const pv = $('#rcPrev'); if (pv) pv.innerHTML = previewHtml(K.curChart(), K.curP()); return true; }
  return false;
});
K.onChange(e => {
  const t = e.target, id = t.id;
  if (id === 'vyAge') { VY.age = +t.value; rerenderKeep(id); return true; }
  if (id === 'vyYlr') { VY.ylr = t.value; rerenderKeep(id); return true; }
  if (id === 'vyHme') { VY.hme = t.value; rerenderKeep(id); return true; }
  if (id === 'jmBrahma') { JM.brahma = t.value; rerenderKeep(id); return true; }
  if (id === 'kpEv') { KPS.ev = t.value; rerenderKeep(id); return true; }
  if (id === 'lkYear') { LKS.year = +t.value; rerenderKeep(id); return true; }
  if (id === 'rcType') { RC.type = t.value; return true; }
  if (id === 'rcDate') { RC.date = t.value; return true; }
  if (id === 'rcW') { RC.w = +t.value; return true; }
  return false;
});
K.onKey(e => {
  const t = e.target;
  if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('[data-kph],[data-kpp],[data-kpev],[data-rcm]') && t.tagName !== 'BUTTON') { e.preventDefault(); t.click(); return true; }
  return false;
});
// exported for tests / print
K.p3 = { dashaRes, jaimini, kpOf, varsha, lalKitab, timeBand, monthCharts, tx, txList, nm, g, evName, tajName, lkStatus, tevaModel, arrowSvg, withOverlay, verdictPill, verdictText, state: { D3, JM, KPS, VY, LKS, PRS, RC }, ask, runHorary };
});
})(typeof window !== 'undefined' ? window : globalThis);

;
/* =====================================================================
   Kundli Studio — Phase 4 screens (app4.js). Loaded lazily in the phase3 bundle with engine4.js, content4.js and famous.js.
   Kundli › ✨ Strongest themes (+ the summary cards at the top of the chart screen), 🗓️ Life timeline, 🌟 Similar charts;
   Plan & more › 📚 Proof cases. Everything bilingual; results are shown as AGREEMENT of traditional indicators,
   never as a probability. Registers its views with app.js through the module API K.
   ===================================================================== */
(function (G) {
'use strict';
(G.KS_MODS = G.KS_MODS || []).push(function app4(K) {
const { S, esc, tr, num, fx, pn, sgn, chartModel, chartSVG, $, hi, showDetail, rerenderAt, PL9 } = K;
const JE = () => K.JE, JC = () => K.JC || {};
const L = o => o == null ? '' : typeof o === 'string' ? o : (o[S.lang] != null ? o[S.lang] : o.en);
const fmt = (o, v) => L(o).replace(/\{(\w+)\}/g, (_, k) => v[k] != null ? v[k] : '');
const SY = () => JC().synth || {}, TLc = () => JC().tl || {}, SIM = () => JC().similar || {}, PRF = () => JC().proof || {};
K.addTX({ thLoading: ['Finding the strongest themes…', 'सबसे प्रबल विषय खोजे जा रहे हैं…'], openTl: ['Open the life timeline', 'जीवन समयरेखा खोलें'], simShort: ['Similar charts', 'मिलती-जुलती कुंडलियाँ'], proofShort: ['Proof cases', 'प्रमाण उदाहरण'],
  famLbl: ['Family', 'समूह'], agreeL: ['agree', 'सहमत'], againstL: ['against', 'विरोध'], neutralL: ['neutral', 'तटस्थ'], methodsL: ['Methods', 'विधियाँ'], windowL: ['Window', 'अवधि'], strengthL: ['Strength', 'बल'], areaL: ['Area', 'क्षेत्र'],
  factorsL: ['Factors', 'कारक'], peopleL: ['people', 'लोग'], eventsL: ['events', 'घटनाएँ'], hitsL: ['hits', 'मेल'], methodNote: ['How it works', 'यह कैसे काम करता है'], keyFactors: ['Key factors', 'मुख्य कारक'], nowL: ['now', 'अभी'] });
// ---------- cache (per chart and day)
const memo = new Map();
const cached = (key, fn) => { if (memo.has(key)) return memo.get(key); const v = fn(); if (memo.size > 24) memo.delete(memo.keys().next().value); memo.set(key, v); return v; };
const ckey = C => JSON.stringify([C.meta.jdUT, C.meta.ayanamsaId, C.meta.nodeType, C.meta.houseSystem, C.meta.options, C.meta.input.place.lat, C.meta.input.place.lon, C.meta.timeUnknown, K.todayStr()]);
const synth = C => cached('s' + ckey(C), () => JE().synthesis(C, { content: JC() }));
const timeline = C => cached('t' + ckey(C), () => JE().lifeTimeline(C, { content: JC() }));
const library = () => G.KS_FAMOUS || (K.IS_NODE ? (() => { try { return require('./famous.js'); } catch (e) { return null; } })() : null);
const similar = C => cached('m' + ckey(C), () => { const lib = library(); return lib ? JE().similarCharts(C, lib, { top: 6 }) : null; });
const safe = (fn, label) => { try { return fn(); } catch (e) { console.error(label, e); return '<div class="card"><div class="banner err">⚠️ ' + esc(label) + ' — ' + esc(e.message) + '</div></div>'; } };
// ---------- small renderers
const LVL_CLS = { strong: 'green', clear: 'indigo', moderate: 'saff' };
const lvlPill = l => '<span class="pill ' + (LVL_CLS[l] || '') + '">' + esc(L(SY().levels && SY().levels[l] && SY().levels[l].name) || l) + '</span>';
const areaName = a => esc(L(SY().areas && SY().areas[a]) || a);
const famName = f => esc(L(SY().families && SY().families[f] && SY().families[f].name) || f);
function consBar(x) {
  const R = Math.max(1, x.R), a = x.A / R * 100, d = x.D / R * 100;
  return '<span class="consbar" role="img" aria-label="' + esc(fmt(SY().agreeOf, { a: num(x.A), r: num(x.R) })) + '"><i class="ag" style="width:' + a.toFixed(1) + '%"></i><i class="dg" style="width:' + d.toFixed(1) + '%"></i></span>';
}
const consText = x => esc(fmt(SY().agreeOf, { a: num(x.A), r: num(x.R) })) + (x.D ? ' · ' + esc(fmt(SY().against, { d: num(x.D) })) : '') + (x.R - x.A - x.D > 0 ? ' · ' + esc(fmt(SY().neutral, { n: num(x.R - x.A - x.D) })) : '');
const hlAttr = hl => { const p = (hl && hl.p || []).filter(Boolean), h = (hl && hl.h || []).filter(Boolean), s = (hl && hl.s || []).filter(v => v != null); return esc(p.join(',') + ';' + h.join(',') + ';' + s.join(',')); };
function factorList(arr, key) {
  if (!arr.length) return '<p class="sub">' + esc(L(SY().noContra)) + '</p>';
  const by = {}; for (const f of arr) (by[f.family] = by[f.family] || []).push(f);
  return '<ul class="thf">' + Object.keys(by).map(fam => '<li><b>' + famName(fam) + '</b>' + (by[fam][0].vote ? ' <span class="sub">(' + (by[fam][0].vote > 0 ? tr('agreeL') : tr('againstL')) + ')</span>' : '') + '<div class="chips">' +
    by[fam].map(f => '<button type="button" class="chip cbt ' + (f.w > 0 ? 'good' : 'bad') + '" data-thl="' + hlAttr(f.hl) + '" data-thf="' + esc(key) + '" data-tht="' + esc(L(f.text)) + '" data-thfam="' + esc(fam) + '">' + esc(L(f.text)) + '</button>').join('') + '</div></li>').join('') + '</ul>';
}
function themeItem(C, x, i, open) {
  const st = x.statement ? L(x.statement) : x.id;
  let h = '<details class="x th"' + (open ? ' open' : '') + ' data-thid="' + x.id + '"><summary><span class="thn">' + num(i + 1) + '</span><span class="tht"><b>' + esc(st) + '</b><span class="sub">' + areaName(x.area) + ' · ' + consText(x) + (x.fill ? ' · ' + esc(L(SY().fill)) : '') + '</span><span class="thlv">' + lvlPill(x.level) + consBar(x) + '</span></span></summary><div class="body">';
  if (x.explanation) h += '<p><b>' + esc(L(SY().why)) + ':</b> ' + esc(L(x.explanation)) + '</p>';
  if (x.baseRate != null) h += '<p class="sub">📊 ' + esc(fmt(SY().baseRate, { b: num(fx(x.baseRate, x.baseRate < 10 ? 1 : 0)) })) + '</p>';
  h += '<h4>✅ ' + esc(L(SY().supporting)) + '</h4>' + factorList(x.supporting || [], x.id) + '<h4>↔️ ' + esc(L(SY().contradicting)) + '</h4>' + factorList(x.contradicting || [], x.id) + '<p class="sub">👆 ' + esc(L(SY().tapHl)) + '</p></div></details>';
  return h;
}
const honesty = () => '<div class="banner info thhon">ℹ️ ' + esc(L(SY().honesty)) + '</div>';
function periodLine(R) {
  const p = R.period; if (!p) return '';
  let s = '<p class="sub">⏳ ' + esc(pn(p.md)) + (p.ad ? ' – ' + esc(pn(p.ad)) : '') + (p.mdEnd ? ' · ' + K.fmtDate(p.mdEnd.slice(0, 10)) : '') + '</p>';
  if (p.next) s += '<p class="sub">➡️ ' + esc(fmt(SY().nextPeriod, { p: pn(p.next.lord), d: K.fmtDate(p.next.startISO.slice(0, 10)) })) + (p.next.emphasis && SY().themes[p.next.emphasis] ? ' — ' + esc(L(SY().nextEmph)) + ': ' + esc(L(SY().themes[p.next.emphasis].s).replace(/^(This period emphasises|यह अवधि)\s*/, '')) : '') + '</p>';
  return s;
}
// ---------- timeline helpers
const AR_IC = { career: '💼', education: '📚', marriage: '💞', children: '👶', property: '🏡', travel: '✈️', finance: '💰', spiritual: '🕉️', favourable: '🌤️', care: '🌧️', wellbeing: '🌿' };
const AR_COL = { career: '#2f6fd6', education: '#7a4fd0', marriage: '#d64f8a', children: '#e08a2e', property: '#7a5a2a', travel: '#1f9ab0', finance: '#2f9a4f', spiritual: '#b0902f', favourable: '#3aa06a', care: '#8a8aa0', wellbeing: '#5a9a8a' };
const tlArea = a => L(TLc().areas && TLc().areas[a] && TLc().areas[a].name) || a;
const monthName = m => L(SY().labels && SY().labels.months && SY().labels.months[m - 1]) || String(m);
const ymText = iso => { const [y, m] = String(iso).split('-'); return monthName(+m) + ' ' + num(y); };
const AGE_W = { en: 'Age', hi: 'आयु' };
const ageText = w => L(AGE_W) + ' ' + num(Math.floor(w.ageFrom)) + (Math.floor(w.ageTo) > Math.floor(w.ageFrom) ? '–' + num(Math.floor(w.ageTo)) : '');
// calendar-neutral: the age range leads, the calendar months follow
const winText = w => ageText(w) + ' · ' + ymText(w.fromISO) + ' – ' + ymText(w.toISO);
const TLV = { range: 'life', sel: null };
function tlAreas(T) { return JE()._p4.AREA_IDS.filter(a => !(T.view.areas[a] && T.view.areas[a].hidden)); }
function tlRange(T) { return [T.birthJd, T.birthJd + T.maxAge * 365.25]; }
function tlHtml(C, T) {
  const [a, b] = tlRange(T), X = jd => Math.max(0, Math.min(100, (jd - a) / (b - a) * 100));
  let ticks = ''; for (let ag = 0; ag <= T.maxAge; ag += 10) ticks += '<span style="left:' + X(T.birthJd + ag * 365.25).toFixed(2) + '%">' + num(ag) + '</span>';
  let h = '<div class="tl" role="group" aria-label="' + esc(L(TLc().title)) + '"><div class="tlaxis">' + ticks + '</div>';
  for (const ar of tlAreas(T)) {
    const ws = T.areas[ar].windows.filter(w => w.to >= a && w.from <= b);
    h += '<div class="tlrow"><div class="tllab">' + AR_IC[ar] + ' ' + esc(tlArea(ar)) + '</div><div class="tltrack">' +
      ws.map(w => { const i = T.areas[ar].windows.indexOf(w), l = X(w.from), r = X(w.to); return '<span class="tlw ' + w.strength + '" style="left:' + l.toFixed(2) + '%;width:' + Math.max(0.6, r - l).toFixed(2) + '%;background:' + AR_COL[ar] + '" data-tlw="' + ar + ':' + i + '" role="button" tabindex="0" aria-label="' + esc(tlArea(ar) + ': ' + winText(w) + ', ' + L(TLc().levels[w.strength])) + '"></span>'; }).join('') +
      '</div></div>';
  }
  h += '<div class="tlleg sub"><span class="tlw strong"></span> ' + esc(L(TLc().levels.strong)) + ' <span class="tlw clear"></span> ' + esc(L(TLc().levels.clear)) + ' <span class="tlw moderate"></span> ' + esc(L(TLc().levels.moderate)) + ' · ' + esc(L({ en: 'axis = age in years', hi: 'अक्ष = आयु (वर्ष)' })) + '</div></div>';
  return h;
}
// print / PDF: the same timeline as one vector SVG (A4 text-block width), strength by height + opacity so it reads in grey
function tlSvg(T, o) {
  o = o || {}; const a = o.from != null ? o.from : T.view.from, b = o.to != null ? o.to : T.view.to, areas = tlAreas(T);
  const W = 700, LW = 185, RH = 22, top = 22, H = top + areas.length * RH + 14, X = jd => LW + Math.max(0, Math.min(1, (jd - a) / (b - a))) * (W - LW - 6);
  let s = '<svg class="tlsvg" style="font-family:&quot;KS Sans&quot;,&quot;KS Symbols&quot;,Nunito,system-ui,sans-serif" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(L(TLc().title)) + '" xmlns="http://www.w3.org/2000/svg">';
  const g0 = Math.max(0, (a - T.birthJd) / 365.25), g1 = (b - T.birthJd) / 365.25, step = (g1 - g0) > 40 ? 10 : (g1 - g0) > 15 ? 5 : 2;
  for (let ag = Math.ceil(g0 / step) * step; ag <= g1 + 1e-6; ag += step) { const x = X(T.birthJd + ag * 365.25); s += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (top - 4) + '" y2="' + (H - 10) + '" stroke="#ccc" stroke-width="0.6"/><text x="' + x.toFixed(1) + '" y="' + (top - 8) + '" font-size="9" text-anchor="middle" fill="#555">' + (ag === 0 ? esc(L(AGE_W)) + ' 0' : ag) + '</text>'; }
  areas.forEach((ar, i) => {
    const y = top + i * RH; s += '<text x="4" y="' + (y + 14) + '" font-size="8.6" fill="#222">' + esc(tlArea(ar).slice(0, 42)) + '</text><line x1="' + LW + '" x2="' + (W - 6) + '" y1="' + (y + RH - 2) + '" y2="' + (y + RH - 2) + '" stroke="#eee" stroke-width="0.6"/>';
    for (const w of T.areas[ar].windows) { if (w.to < a || w.from > b) continue; const hgt = w.strength === 'strong' ? 16 : w.strength === 'clear' ? 12 : 7, op = w.strength === 'strong' ? 1 : w.strength === 'clear' ? 0.75 : 0.4; s += '<rect x="' + X(w.from).toFixed(1) + '" y="' + (y + (RH - 2 - hgt) / 2 + 1).toFixed(1) + '" width="' + Math.max(1.2, X(w.to) - X(w.from)).toFixed(1) + '" height="' + hgt + '" rx="2" fill="' + AR_COL[ar] + '" fill-opacity="' + op + '"/>'; }
  });
  return s + '</svg>';
}
function winDetail(C, T, ar, i) {
  const w = T.areas[ar].windows[i]; if (!w) return;
  const A = TLc().areas[ar];
  let h = '<p><b>' + esc(winText(w)) + '</b></p><p>' + '<span class="pill ' + (LVL_CLS[w.strength] || '') + '">' + esc(L(TLc().levels[w.strength])) + '</span> ' + esc(fmt(TLc().methodsAgree, { k: num(w.peak), n: num(w.of) })) + ' (' + esc(L(TLc().peak)) + ')</p>';
  if (A && A.w) h += '<p class="reading">' + esc(L(A.w)) + '</p>';
  h += '<h4>' + esc(tr('keyFactors')) + '</h4><ul class="pts">' + w.factors.map(f => '<li><b>' + esc(L(TLc().methods[f.method] && TLc().methods[f.method].name) || f.method) + ':</b> ' + esc(f.text ? L(f.text) : f.test) + ' <span class="sub">(' + num(Math.round(f.share * 100)) + '%)</span></li>').join('') + '</ul>';
  const hl = { p: [], h: [], s: [] }; for (const f of w.factors) { const x = f.hl || {}; hl.p.push(...(x.p || [])); hl.h.push(...(x.h || [])); hl.s.push(...(x.s || [])); }
  h += '<div class="chartwrap" style="max-width:300px">' + chartSVG(chartModel(C, 'D1'), { ctx: 'main:D1', label: tlArea(ar), hl, title: tlArea(ar).slice(0, 16) }) + '</div>';
  h += '<p class="sub">' + esc(L(TLc().honesty)) + '</p>';
  showDetail(AR_IC[ar] + ' ' + esc(tlArea(ar)), h);
}
// ---------- views
K.view('kundli:themesCard', C => safe(() => {
  const R = synth(C), T = timeline(C);
  let h = '<div class="grid2 thcards"><div class="card thcard"><div class="row between"><h2>✨ ' + esc(L(SY().title)) + '</h2><button type="button" class="btn sm" data-go="kundli:themes">' + esc(L(SY().seeAll)) + ' →</button></div><p class="sub">' + esc(L(SY().subtitle)) + '</p><ol class="thmini">' +
    R.themes.filter(x => x.area !== 'timing').slice(0, 5).map(x => '<li><button type="button" class="linkish" data-go="kundli:themes" data-thopen="' + x.id + '">' + esc(L(x.statement)) + '</button> ' + lvlPill(x.level) + '<span class="sub"> ' + num(x.A) + '/' + num(x.R) + '</span></li>').join('') + '</ol><p class="sub">ℹ️ ' + esc(L(SY().honesty).split('. ').slice(0, 2).join('. ')) + '.</p></div>';
  // calendar-neutral: the strongest window of each main life area, whatever today's date
  const up = [], SR0 = { strong: 3, clear: 2, moderate: 1 };
  for (const ar of ['marriage', 'children', 'career', 'education', 'property', 'finance', 'travel', 'spiritual']) {
    if (!T.view.areas[ar] || T.view.areas[ar].hidden) continue;
    const best = (T.view.areas[ar].top || []).slice().sort((x, y) => (SR0[y.strength] - SR0[x.strength]) || (y.avg - x.avg) || (x.from - y.from))[0];
    if (best) up.push(best);
  }
  h += '<div class="card thcard"><div class="row between"><h2>🗓️ ' + esc(L(TLc().title)) + '</h2><button type="button" class="btn sm" data-go="kundli:timeline">' + esc(tr('openTl')) + ' →</button></div><p class="sub">' + esc(L(TLc().subtitle)) + '</p>' +
    (up.length ? '<ul class="tlmini">' + up.slice(0, 6).map(w => '<li><button type="button" class="linkish" data-tlw="' + w.area + ':' + T.areas[w.area].windows.indexOf(w) + '">' + AR_IC[w.area] + ' <b>' + esc(tlArea(w.area)) + '</b></button> <span class="sub">' + esc(winText(w)) + '</span> <span class="pill ' + (LVL_CLS[w.strength] || '') + '">' + esc(L(TLc().levels[w.strength])) + '</span></li>').join('') + '</ul>' : '<p class="sub">' + esc(L(TLc().noWindows)) + '</p>') +
    '<p class="sub">' + esc(L(TLc().ageGate)) + '</p><p class="row"><button type="button" class="btn xs" data-go="kundli:similar">🌟 ' + esc(tr('simShort')) + '</button><button type="button" class="btn xs" data-go="more:proof">📚 ' + esc(tr('proofShort')) + '</button></p></div></div>';
  return h;
}, 'themes'));
K.view('kundli:themes', C => safe(() => {
  const R = synth(C);
  let h = '<div class="card"><h2>✨ ' + esc(L(SY().title)) + '</h2><p class="sub">' + esc(L(SY().subtitle)) + '</p>' + honesty() + (R.timeUnknown ? '<div class="banner warn">🕰️ ' + esc(L(SY().timeUnknownNote)) + '</div>' : '') +
    (R.themes.length < 10 ? '<p class="sub">' + esc(fmt(SY().fewer, { n: num(R.themes.length) })) + '</p>' : '') + '</div>';
  const natal = R.themes.filter(x => x.area !== 'timing'), per = R.themes.filter(x => x.area === 'timing');
  h += '<div class="card">' + natal.map((x, i) => themeItem(C, x, i, TH.open === x.id)).join('') + '</div>';
  h += '<div class="card"><h3 style="margin-top:0">💎 ' + esc(L(SY().distinctiveTitle)) + '</h3><p class="sub">' + esc(L(SY().distinctiveNote)) + '</p>' +
    (R.distinctive.length ? '<ul class="thdist">' + R.distinctive.map(x => '<li><b>' + esc(L(x.statement)) + '</b> ' + lvlPill(x.level) + '<br><span class="sub">' + consText(x) + ' · ' + esc(fmt(SY().baseRate, { b: num(fx(x.baseRate, x.baseRate < 10 ? 1 : 0)) })) + '</span></li>').join('') + '</ul>' : '<p class="sub">' + esc(L(SY().noDistinctive)) + '</p>') + '</div>';
  h += '<details class="x"><summary>🧭 ' + esc(tr('methodNote')) + '</summary><div class="body reading"><p>' + esc(L(SY().method)) + '</p><ul class="pts">' + JE()._p4.FAMS.map(f => '<li><b>' + famName(f) + ':</b> ' + esc(L(SY().families[f].text)) + '</li>').join('') + '</ul><p class="sub">' + Object.keys(SY().levels).map(l => esc(L(SY().levels[l].name)) + ': ' + esc(L(SY().levels[l].text))).join(' · ') + '</p></div></details>';
  return h;
}, 'themes'));
const TH = { open: null };
K.view('kundli:timeline', C => safe(() => {
  const T = timeline(C);
  let h = '<div class="card"><h2>🗓️ ' + esc(L(TLc().title)) + '</h2><p class="sub">' + esc(L(TLc().subtitle)) + '</p><div class="banner info">ℹ️ ' + esc(L(TLc().honesty)) + '</div>' +
    '<p class="sub">' + esc(L(TLc().ageGate)) + ' ' + esc(L({ en: 'Windows are listed by age across the whole life (0–90), past and future alike; the date today plays no part.', hi: 'अवधियाँ पूरे जीवन (0–90) में आयु के अनुसार दी गई हैं, बीती और आने वाली दोनों; आज की तारीख़ का इसमें कोई योगदान नहीं।' })) + '</p>' + tlHtml(C, T) + '</div>';
  const [a, b] = tlRange(T), SR = { strong: 3, clear: 2, moderate: 1 };
  h += '<div class="grid2">';
  for (const ar of tlAreas(T)) {
    const ws = T.areas[ar].windows.filter(w => w.to >= a && w.from <= b).sort((x, y) => (SR[y.strength] - SR[x.strength]) || (y.avg - x.avg) || (x.from - y.from)).slice(0, 3).sort((x, y) => x.from - y.from);
    h += '<div class="card"><h3 style="margin-top:0">' + AR_IC[ar] + ' ' + esc(tlArea(ar)) + '</h3>' + (ws.length ? '<ul class="tlmini">' + ws.map(w => '<li><button type="button" class="linkish" data-tlw="' + ar + ':' + T.areas[ar].windows.indexOf(w) + '">' + esc(winText(w)) + '</button> <span class="pill ' + (LVL_CLS[w.strength] || '') + '">' + esc(L(TLc().levels[w.strength])) + '</span> <span class="sub">' + esc(fmt(TLc().methodsAgree, { k: num(w.peak), n: num(w.of) })) + '</span></li>').join('') + '</ul>' : '<p class="sub">' + esc(L(TLc().noWindows)) + '</p>') +
      '<p class="sub">' + esc(fmt(TLc().coverage, { c: num(Math.round((T.coverage[ar] || 0) * 100)) })) + '</p></div>';
  }
  h += '</div><details class="x"><summary>🧭 ' + esc(tr('methodNote')) + '</summary><div class="body reading"><ul class="pts">' + Object.keys(TLc().methods).map(m => '<li><b>' + esc(L(TLc().methods[m].name)) + ':</b> ' + esc(L(TLc().methods[m].rule)) + '</li>').join('') + '</ul></div></details>';
  return h;
}, 'timeline'));
K.view('kundli:similar', C => safe(() => {
  const M = similar(C), lib = library();
  let h = '<div class="card"><h2>🌟 ' + esc(L(SIM().title)) + '</h2><div class="banner info">ℹ️ ' + esc(L(SIM().note)) + '</div><p class="sub">' + esc(L(SIM().settingsNote)) + '</p></div>';
  if (!M) return h + '<div class="card"><p class="sub">—</p></div>';
  h += '<div class="grid2">' + M.matches.map((m, i) => {
    const fld = SIM().fields[m.field];
    return '<div class="card simc"><div class="row between"><h3 style="margin:0">' + esc(L(m.name)) + '</h3><span class="pill" title="' + esc(L(SIM().ratings[m.rating])) + '">' + esc(L(SIM().rating).split(' ')[0]) + ' ' + esc(m.rating) + '</span></div><p class="sub">' + esc(fld ? L(fld) : m.field) + ' · ' + esc(L(m.desc)) + '</p>' +
      (m.flag ? '<p class="banner warn sm">⚠️ ' + esc(L(SIM().conflict)) + '</p>' : '') +
      '<p><b>' + esc(L(SIM().youShare)) + ':</b></p><div class="chips">' + m.shared.map((f, j) => '<button type="button" class="chip cbt good" data-simf="' + i + ':' + j + '">' + esc(simName(f)) + '</button>').join('') + '</div><p class="sub">' + num(fx(m.score, 1)) + ' ' + esc(L(SIM().score)) + '</p></div>';
  }).join('') + '</div>';
  return h;
}, 'similar'));
function simFill(tpl, p) {
  return L(tpl).replace(/\{(\w)\}/g, (_, k) => { const v = p[k]; if (k === 'S') return sgn(v); if (k === 'N') return K.nkn(v); if (k === 'P') return (v || []).map(pn).join(', '); if (k === 'H') return num((v || []).join(', '));
    if (k === 'Y') return K.yogaName(v); if (k === 'X') return L(SY().labels.x[v]) || v; if (k === 'T') return L(SY().themes[v] && SY().themes[v].s) || v; return v == null ? '' : v; });
}
const simName = f => simFill(SIM().factors[f.key].name, f.params);
K.view('more:proof', () => safe(() => {
  const lib = library(); const P = PRF();
  if (!lib || !lib.proof) return '<div class="card"><p class="sub">—</p></div>';
  const st = lib.proof.stats, pc = v => num(fx(v * 100, 0)) + '%';
  let h = '<div class="card"><h2>📚 ' + esc(L(P.title)) + '</h2><p>' + esc(L(P.intro)) + '</p><div class="banner warn">⚠️ ' + esc(L(P.small)) + '</div>' +
    '<div class="facts"><div class="fact"><span class="lbl">' + esc(L(P.hitRate)) + '</span><b>' + num(st.hits) + ' / ' + num(st.events) + '</b><span>' + pc(st.rate) + ' · ' + esc(L(P.ci)) + ' ' + pc(st.ci95[0]) + '–' + pc(st.ci95[1]) + '</span></div>' +
    '<div class="fact"><span class="lbl">' + esc(L(P.baseline)) + '</span><b>' + num(fx(st.expectedByCoverage, 1)) + '</b><span>p = ' + num(fx(st.pCoverage, 2)) + '</span></div>' +
    '<div class="fact"><span class="lbl">' + esc(L(P.shifted)) + '</span><b>' + num(fx(st.shiftedMean, 1)) + '</b><span>' + esc(L(P.pValue)) + ' ' + num(fx(st.pPermutation, 2)) + '</span></div></div>' +
    '<p class="banner ' + (st.better ? 'info' : 'warn') + '"><b>' + esc(L(st.better ? P.verdictBetter : P.verdictNot)) + '</b></p><p class="sub">' + num(st.counted) + ' ' + tr('peopleL') + ' · ' + num(st.events) + ' ' + tr('eventsL') + ' · ' + esc(L(P.generated)) + '</p></div>';
  // 6-10 example people: those with hits first, then others (misses shown honestly)
  const cs = lib.proof.cases.filter(c => !c.excluded), withHit = cs.filter(c => c.events.some(e => e.hit)), rest = cs.filter(c => !c.events.some(e => e.hit));
  const pick = withHit.slice(0, 5).concat(rest.slice(0, 3));
  const nameOf = c => L(c.name);
  h += '<div class="grid2">' + pick.map(c => '<div class="card"><h3 style="margin-top:0">' + esc(nameOf(c)) + ' <span class="pill">' + esc(c.rating) + '</span></h3><ul class="pts nob">' + c.events.map(e => '<li>' + (e.hit ? '✅' : '▫️') + ' ' + AR_IC[e.area] + ' ' + esc(tlArea(e.area)) + ' · ' + esc(ymText(e.ym)) + ' — <span class="sub">' + esc(L(e.hit ? P.hit : P.miss)) + (e.hit && e.win ? ' (' + esc(e.win.split('…').map(ymText).join(' – ')) + ')' : '') + '</span></li>').join('') + '</ul></div>').join('') + '</div>';
  const ex = lib.proof.cases.filter(c => c.excluded);
  if (ex.length) h += '<div class="card"><p class="sub">⚠️ ' + esc(L(P.excluded)) + ': ' + ex.map(c => esc(nameOf(c)) + ' (' + esc(c.time) + (c.alt ? ' / ' + esc(c.alt) : '') + ')').join(', ') + '</p></div>';
  return h;
}, 'proof'));
// ---------- interactions
K.onClick((e, t) => {
  const b = t.closest && t.closest('[data-thl], [data-tlw], [data-simf], [data-thopen], #tlRange button'); if (!b) return false;
  const d = b.dataset, C = K.curChart();
  if (d.thopen) { TH.open = d.thopen; return false; } // let data-go navigate
  if (b.closest('#tlRange')) { TLV.range = d.v; rerenderAt(); return true; }
  if (d.thl != null && C) {
    const [p, h, s] = d.thl.split(';').map(x => x ? x.split(',') : []);
    const hl = { p, h: h.map(Number), s: s.map(Number) };
    showDetail('✨ ' + famName(d.thfam), '<p><b>' + esc(d.tht) + '</b></p><div class="chartwrap" style="max-width:320px">' + chartSVG(chartModel(C, 'D1'), { ctx: 'main:D1', label: d.tht, hl, title: L(SY().title).slice(0, 18) }) + '</div><p class="sub">' + esc(L(SY().families[d.thfam] && SY().families[d.thfam].text)) + '</p>', b);
    return true;
  }
  if (d.tlw && C) { const [ar, i] = d.tlw.split(':'); winDetail(C, timeline(C), ar, +i); return true; }
  if (d.simf && C) { const [i, j] = d.simf.split(':').map(Number), m = similar(C).matches[i], f = m.shared[j]; showDetail('🌟 ' + esc(L(m.name)), '<p><b>' + esc(simName(f)) + '</b></p><p>' + esc(simFill(SIM().factors[f.key].text, f.params)) + '</p><p class="sub">' + esc(L(SIM().note)) + '</p>', b); return true; }
  return false;
});
K.onKey(e => { const t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('[data-tlw]') && t.tagName !== 'BUTTON') { e.preventDefault(); t.click(); return true; } return false; });
K.p5 = { synth, timeline, similar, library, tlSvg, winText, ymText, tlArea, tlAreas, areaName, famName, lvlName: l => L(SY().levels[l].name), AR_IC, state: { TLV, TH } };
});
})(typeof window !== 'undefined' ? window : globalThis);
