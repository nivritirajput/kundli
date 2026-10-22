self.KS_BUILD = "f1c6d33ad4";
/* =====================================================================
   Kundli Studio — print / PDF booklet (print.js, core bundle). SPEC J.
   The app paginates the booklet itself: blocks are measured at the exact A4 (or Letter) text-block width
   with the bundled print fonts, packed into page boxes (210 × 297 mm, margin 0 at @page level, running
   header/footer drawn inside each page's margin area), tables split at row boundaries with their header
   repeated, wide tables placed on named landscape pages. The same pages are the on-screen preview,
   so the table of contents and "Page X of Y" are exact in every browser.
   ===================================================================== */
(function (G) {
'use strict';
(G.KS_MODS = G.KS_MODS || []).push(function printMod(K) {
const { S, esc, tr, L, num, fx, dms, fmtDate, fmtDur, pn, pnA, sgn, sgnA, sab, pab, nkn, ord, pcol, P, PL9, PL7, SIGN_LORD, VARGAS, houseOf, signOfHouse, chartModel, chartSVG, $, nowJd, hi, toast } = K;
const JE = () => K.JE, JC = () => K.JC || {};
K.addTX({
  pTitle: ['Kundli booklet (PDF)', 'कुंडली पुस्तिका (PDF)'], preset: ['Contents', 'सामग्री'], pFull: ['Full kundli', 'पूर्ण कुंडली'], pEss: ['Essentials', 'मुख्य बातें'], pCustom: ['Custom', 'अपनी पसंद'],
  pBw: ['Black & white / ink-saver', 'श्वेत-श्याम / कम स्याही'], pBi: ['Bilingual headings (English + हिंदी)', 'द्विभाषी शीर्षक (हिंदी + English)'], pPaper: ['Paper', 'कागज़'],
  pPrint: ['Print / Save as PDF', 'प्रिंट / PDF सहेजें'], pTip: ['In the print dialog choose “Save as PDF”, paper A4, margins Default, scale 100 %, turn on “Background graphics” and turn off “Headers and footers”.', 'प्रिंट विंडो में “PDF के रूप में सहेजें”, कागज़ A4, मार्जिन डिफ़ॉल्ट, स्केल 100 % चुनें, “बैकग्राउंड ग्राफ़िक्स” चालू और “हेडर व फ़ुटर” बंद करें।'],
  pFile: ['Suggested file name', 'सुझाया गया फ़ाइल नाम'], pPages: ['pages', 'पृष्ठ'], pBuilding: ['Laying out pages…', 'पृष्ठ बन रहे हैं…'], pPreview: ['Print preview (each outline is one A4 page)', 'प्रिंट पूर्वावलोकन (हर रूपरेखा एक A4 पृष्ठ)'],
  pageOf: ['Page {x} of {y}', 'पृष्ठ {x} / {y}'], contents: ['Contents', 'विषय-सूची'], chapter: ['Chapter', 'अध्याय'], contd: ['continued', 'जारी'], generated: ['Generated', 'तैयार'], appVersion: ['App version', 'ऐप संस्करण'],
  chBirth: ['Birth details & Panchang', 'जन्म विवरण व पंचांग'], chCharts: ['Charts, planets & houses', 'कुंडलियाँ, ग्रह व भाव'], chVargas: ['Divisional charts (vargas)', 'वर्ग कुंडलियाँ'], chReadings: ['Readings', 'फलादेश'],
  chDashas: ['Dashas', 'दशाएँ'], chYogas: ['Yogas & doshas', 'योग व दोष'], chStrength: ['Ashtakavarga & Shadbala', 'अष्टकवर्ग व षड्बल'], chTransits: ['Transits & Sade Sati', 'गोचर व साढ़ेसाती'],
  chSystems: ['Jaimini, KP, Varshaphal & Lal Kitab', 'जैमिनी, केपी, वर्षफल व लाल किताब'], chGloss: ['Glossary, methods & disclaimer', 'शब्दकोश, विधि व अस्वीकरण'], chThemes: ['Key themes', 'मुख्य विषय'], chTimeline: ['Life timeline', 'जीवन समयरेखा'], pStatement: ['Theme', 'विषय'], pAgree: ['Indicator families', 'संकेत-समूह'], pLevel: ['Agreement', 'सहमति'], pBase: ['Found in', 'मिलता है'], pWin: ['Window', 'अवधि'], pMeth: ['Methods agreeing', 'सहमत विधियाँ'], pDetail: ['Why — supporting and opposite factors', 'क्यों — समर्थक व उलटे कारक'],
  birthData: ['Birth data', 'जन्म विवरण'], coords: ['Coordinates', 'निर्देशांक'], tz: ['Time zone & offset', 'समय क्षेत्र व अंतर'], settingsUsed: ['Calculation settings', 'गणना सेटिंग'], chartPoints: ['Chart points', 'कुंडली बिंदु'],
  wheelThumb: ['Western wheel', 'पाश्चात्य चक्र'], houseTable: ['Houses', 'भाव'], relationships: ['Compound relationships', 'पंचधा मैत्री'], acrossVargas: ['Each planet across the vargas', 'सभी वर्गों में ग्रह'],
  houseByHouse: ['House by house', 'भाव-दर-भाव'], planetReadings: ['Planets in signs and houses', 'राशि व भाव में ग्रह'], mdAd: ['Vimshottari: mahadasha → antardasha (whole life)', 'विंशोत्तरी: महादशा → अंतर्दशा (पूरा जीवन)'],
  pdFor: ['Pratyantar dashas of', 'प्रत्यंतर दशाएँ —'], otherSystems: ['Other dasha systems (summary)', 'अन्य दशा पद्धतियाँ (सारांश)'], yogasPresent: ['Yogas present', 'बनने वाले योग'], yogasCancelled: ['Notable cancelled / weakened', 'उल्लेखनीय भंग / कमज़ोर'],
  bavGrids: ['Bhinnashtakavarga & Sarvashtakavarga', 'भिन्नाष्टकवर्ग व सर्वाष्टकवर्ग'], reduced: ['Reductions', 'शोधन'], prastaraT: ['Prastara (contributors)', 'प्रस्तार (योगदानकर्ता)'], sbTable: ['Shadbala (shashtiamsas)', 'षड्बल (षष्ट्यंश)'], sbChart: ['Strength in rupas vs required', 'रूप में बल बनाम आवश्यक'],
  transitsNow: ['Transits now', 'अभी का गोचर'], ssLife: ['Sade Sati & Dhaiya — whole life', 'साढ़ेसाती व ढैया — पूरा जीवन'], next12: ['Next 12 months: sign changes & stations', 'अगले 12 माह: राशि परिवर्तन व वक्री/मार्गी'],
  glossUsed: ['Glossary of terms used', 'प्रयुक्त शब्दों का कोश'], methods: ['Methods & provenance', 'विधि व स्रोत'], disclaimerT: ['Disclaimer', 'अस्वीकरण'], kpRp: ['Ruling planets at birth', 'जन्म के समय शासक ग्रह'],
  annualChart: ['Annual chart', 'वार्षिक कुंडली'], pSex: ['Gender', 'लिंग'], wholeLife: ['whole life', 'पूरा जीवन'], current: ['current', 'वर्तमान']
});
const p3 = () => K.p3 || null;
const STHK = { father: ['Father', 'पिता'], mother: ['Mother', 'माता'], siblings: ['Siblings', 'भाई-बहन'], relatives: ['Relatives', 'संबंधी'], children: ['Children', 'संतान'], spouse: ['Spouse', 'जीवनसाथी'], longevity: ['Longevity', 'आयु'] }, sthk = k => STHK[k] ? STHK[k][hi() ? 1 : 0] : k;
const tx = o => { if (o == null) return ''; if (typeof o === 'string') return o; if (Array.isArray(o)) return o.map(tx).join(' '); if ('en' in o || 'hi' in o) { const v = o[S.lang] != null ? o[S.lang] : o.en; return Array.isArray(v) ? v.join(' ') : String(v == null ? '' : v); } if (o.text) return tx(o.text); if (o.name) return tx(o.name); return ''; };
const gg = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const nm = (o, fb) => o && o.name ? tx(o.name) : fb;
const other = () => (S.lang === 'hi' ? 'en' : 'hi');
// bilingual helpers (headings and key terms) — the second language is added only when the option is on
const PR = Object.assign({ preset: 'full', custom: null, bw: false, bi: false, paper: 'a4' }, (S.print && typeof S.print === 'object') ? S.print : {});
const bt = k => esc(tr(k)) + (PR.bi && K.T[other()][k] && K.T[other()][k] !== tr(k) ? '<span class="alt" lang="' + other() + '"> · ' + esc(K.T[other()][k]) + '</span>' : '');
const bo = o => esc(tx(o)) + (PR.bi && o && o[other()] && o[other()] !== tx(o) ? '<span class="alt" lang="' + other() + '"> · ' + esc(o[other()]) + '</span>' : '');
const bth = k => '<th>' + esc(tr(k)) + (PR.bi && K.T[other()][k] && K.T[other()][k] !== tr(k) ? '<br><span class="alt" lang="' + other() + '">' + esc(K.T[other()][k]) + '</span>' : '') + '</th>';
const th = s => '<th>' + s + '</th>';
const CHAPTERS = [['themes', 'chThemes', '✨'], ['timeline', 'chTimeline', '🗓️'], ['birth', 'chBirth', '🗓️'], ['charts', 'chCharts', '🪐'], ['vargas', 'chVargas', '🔲'], ['readings', 'chReadings', '📖'], ['dashas', 'chDashas', '⏳'], ['yogas', 'chYogas', '✨'], ['strength', 'chStrength', '📊'], ['transits', 'chTransits', '🌍'], ['systems', 'chSystems', '🔭'], ['glossary', 'chGloss', '📚']];
const PRESETS = { full: CHAPTERS.map(c => c[0]), essentials: ['themes', 'timeline', 'birth', 'charts', 'readings', 'dashas', 'yogas', 'glossary'] };
const chosen = () => PR.preset === 'custom' && Array.isArray(PR.custom) ? CHAPTERS.map(c => c[0]).filter(c => PR.custom.includes(c)) : PRESETS[PR.preset] || PRESETS.full;
function savePR() { S.print = { preset: PR.preset, custom: PR.custom, bw: PR.bw, bi: PR.bi, paper: PR.paper }; K.saveS(); }

/* ---------------------------------------------------------------- blocks */
// block: {t:'h1'|'h2'|'h3'|'blk'|'tbl'|'cover'|'toc', html, keep, wide, newPage, head, rows, cap, toc:{key,label,level}}
let GLOSS_USED = new Set();
const gl = k => { if (JC().glossary && JC().glossary[k]) GLOSS_USED.add(k); return k; };
function Blocks() {
  const out = [], ch = { id: '', title: '' };
  const api = {
    out,
    chapter(id, n, key, ic) { ch.id = id; ch.title = tr(key); out.push({ t: 'h1', newPage: true, ch: ch.title, toc: { key: 'c_' + id, label: num(n) + '. ' + tr(key), level: 1 }, html: '<div class="chtitle"><span class="chn">' + esc(tr('chapter')) + ' ' + num(n) + '</span><h1>' + bt(key) + '</h1></div>' }); },
    h2(html, tocLabel) { out.push({ t: 'h2', keep: true, ch: ch.title, toc: tocLabel ? { key: 's_' + out.length, label: tocLabel, level: 2 } : null, html: '<h2>' + html + '</h2>' }); },
    h3(html) { out.push({ t: 'h3', keep: true, ch: ch.title, html: '<h3>' + html + '</h3>' }); },
    p(html, cls) { if (html) out.push({ t: 'blk', ch: ch.title, html: '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + html + '</p>' }); },
    blk(html, o) { out.push(Object.assign({ t: 'blk', ch: ch.title, html }, o || {})); },
    tbl(headHtml, rows, o) { if (!rows.length) return; out.push(Object.assign({ t: 'tbl', ch: ch.title, head: '<tr>' + headHtml + '</tr>', rows }, o || {})); },
    kv(pairs, o) { api.tbl(th(esc(tr('name'))) + th(''), pairs.filter(x => x).map(([k, v]) => '<tr><th scope="row">' + k + '</th><td>' + v + '</td></tr>'), Object.assign({ cls: 'kvt nohead' }, o || {})); }
  };
  return api;
}
const td = (v, cls) => '<td' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</td>';
const tr0 = cells => '<tr>' + cells.join('') + '</tr>';
const lonS = l => esc(sgn(Math.floor(((l % 360) + 360) % 360 / 30))) + ' ' + dms((((l % 360) + 360) % 360) % 30, true);
const ddeg = d => dms(d, true);
const pl = id => '<span class="pc-' + id + '">' + esc(pn(id)) + '</span>';
const plistH = arr => arr && arr.length ? arr.map(pl).join(', ') : '—';
const hl = arr => arr && arr.length ? arr.map(num).join(', ') : '—';
const nowFlag = (a, b) => { const n = nowJd(); return n >= a && n < b; };
function chartBox(svg, cap, wide) { return '<figure class="pchart' + (wide ? ' w' : '') + '">' + svg + (cap ? '<figcaption>' + cap + '</figcaption>' : '') + '</figure>'; }
const csvg = (C, vk, o) => chartSVG(chartModel(C, vk), Object.assign({ ctx: 'print', style: S.style }, o || {}));

function bookBlocks(C) {
  GLOSS_USED = new Set(['lagna', 'rashi', 'nakshatra', 'pada', 'dasha', 'mahadasha', 'antardasha', 'ayanamsa', 'varga', 'navamsa', 'yoga', 'dosha', 'gochar', 'sade_sati', 'ashtakavarga', 'shadbala', 'vimshottari', 'retrograde', 'combust', 'dignity', 'vargottama', 'chara_karaka', 'arudha', 'upapada', 'argala', 'avakhada', 'tithi', 'karana', 'vara']);
  const B = Blocks(), p = K.curP(), sel = chosen(), J = JC(), m = C.meta, mo = P(C, 'Mo');
  const P3 = sel.includes('systems') || sel.includes('dashas') ? p3() : null;
  // ---------------- cover
  const ver = [m.engineVersion ? 'JE ' + m.engineVersion : '', JE().VERSION3 ? 'P3 ' + JE().VERSION3 : '', G.KS_BUILD ? 'build ' + G.KS_BUILD : ''].filter(Boolean).join(' · ');
  const opt = m.options || {}, ayn = JE().AYAN && JE().AYAN[S.ayan] ? tx(JE().AYAN[S.ayan].name) : tx(m.ayanamsaName);
  B.out.push({ t: 'cover', html: '<div class="cover"><div class="cvframe"><div class="cvapp">' + esc(tr('appName')) + '</div><h1 class="cvname">' + esc(p.name || '') + '</h1><div class="cvsub">' + bt('booklet') + '</div>' +
    '<div class="cvglyphs"><div><span class="bigg" aria-hidden="true">' + K.zg(C.asc.sign) + '</span><b>' + esc(sgnA(C.asc.sign)) + '</b><small>' + bt('lagna') + (m.timeUnknown ? ' (≈)' : '') + '</small></div><div><span class="bigg" aria-hidden="true">' + K.zg(mo.sign) + '</span><b>' + esc(sgnA(mo.sign)) + '</b><small>' + bt('moonReading') + '</small></div><div><span class="bigg nak" aria-hidden="true">' + K.pg('Mo') + '</span><b>' + esc(nkn(mo.nak)) + ' ' + num(mo.pada) + '</b><small>' + bt('nakshatra') + '</small></div></div>' +
    '<table class="cvt"><tbody>' +
    [[bt('dob'), fmtDate(p.date) + (p.gender ? ' · ' + esc(K.gender(p.gender)) : '')], [bt('tob'), p.time ? num(p.time) : esc(tr('timeUnknown'))], [bt('place'), esc(K.placeLabel(p.place)) + (p.place.state ? ', ' + esc(p.place.state) : '') + (p.place.country && p.place.country !== 'IN' ? ' (' + esc(p.place.country) + ')' : '')],
     [bt('coords'), dmsLat(+p.place.lat) + ', ' + dmsLon(+p.place.lon)], [bt('tz'), 'UTC' + K.hm(m.utcOffsetUsed) + ' — ' + esc(tx(m.offsetReason))],
     [bt('settingsUsed'), esc(ayn.split(' (')[0]) + ' ' + dms(m.ayanamsaValue, true) + ' · ' + esc(tr('node')) + ': ' + esc(tr(m.nodeType)) + ' · ' + esc(tr(m.houseSystemUsed)) + ' · ' + esc(tr('dashaYear')) + ' ' + num(m.dashaYear && m.dashaYear.days ? m.dashaYear.days : 365.25) + ' · ' + esc(tr('karakasOpt')) + ' ' + num(opt.karakas || 8) + ' · ' + esc(tr('yogaMode')) + ': ' + esc(opt.yogaMode || 'standard')],
     [bt('generated'), fmtDate(K.todayStr()) + ' ' + num(new Date().toTimeString().slice(0, 5))], [bt('appVersion'), esc(ver)]].map(([a, b]) => '<tr><th>' + a + '</th><td>' + b + '</td></tr>').join('') + '</tbody></table>' +
    '<p class="cvdisc">' + esc(J.disclaimer ? tx(J.disclaimer.short) : '') + '</p><div class="cvmade">Made by Nivriti Rajput <span class="heart">♥</span></div></div></div>' });
  B.out.push({ t: 'toc', html: '' });
  let n = 0;
  if ((sel.includes('themes') || sel.includes('timeline')) && K.p5) n = keyChapters(B, C, sel, n);
  // ---------------- 1. birth
  if (sel.includes('birth')) {
    B.chapter('birth', ++n, 'chBirth', '🗓️');
    B.h2(bt('birthData'), tr('birthData'));
    B.kv([[bt('name'), esc(p.name)], [bt('localTime'), fmtDate(m.localISO, true) + (m.timeUnknown ? ' (' + esc(tr('timeUnknown')) + ')' : '')], [bt('utc'), fmtDate(m.utcISO, true)], [bt('offsetUsed'), 'UTC' + K.hm(m.utcOffsetUsed) + ' — ' + esc(tx(m.offsetReason))], ['JD (UT)', fx(m.jdUT, 5)], [bt('deltaT'), fx(m.deltaT, 1) + ' s'], [bt('coords'), dmsLat(+p.place.lat) + ', ' + dmsLon(+p.place.lon)], [bt('ayanamsa'), esc(tx(m.ayanamsaName)) + ' = ' + dms(m.ayanamsaValue, true)]]);
    if (m.warnings && m.warnings.length) B.p('⚠ ' + m.warnings.map(w => esc(tx(w))).join(' '), 'note');
    const pc = C.panchang;
    B.h2(bt('panchangBirth'), tr('panchangBirth')); gl('tithi'); gl('yoga');
    B.kv([[bt('tithi'), esc(tx(pc.tithi.name)) + ' (' + esc(tx(pc.pakshaName)) + ') · ' + esc(tr('ends')) + ' ' + fmtDate(pc.tithi.endISO, true)], [bt('vara'), esc(tx(pc.vara.name)) + ' · ' + esc(pn(pc.vara.lord))], [bt('nakshatra'), esc(tx(pc.nakshatra.name)) + ' ' + num(pc.nakshatra.pada) + ' · ' + esc(pn(pc.nakshatra.lord)) + ' · ' + esc(tr('ends')) + ' ' + fmtDate(pc.nakshatra.endISO, true)],
      [bt('yoga'), esc(tx(pc.yoga.name)) + ' · ' + esc(tr('ends')) + ' ' + fmtDate(pc.yoga.endISO, true)], [bt('karana'), esc(tx(pc.karana.name)) + ' · ' + esc(tr('ends')) + ' ' + fmtDate(pc.karana.endISO, true)], [bt('sunrise'), K.fmtTime(pc.sunriseISO) + ' · ' + bt('sunset') + ' ' + K.fmtTime(pc.sunsetISO)], [bt('moonrise'), K.fmtTime(pc.moonriseISO) + ' · ' + bt('moonset') + ' ' + K.fmtTime(pc.moonsetISO)], ['', pc.isDayBirth ? '☀ ' + bt('dayBirth') : '☾ ' + bt('nightBirth')]]);
    const av = C.avakhada, avv = (k, v) => { const o = gg(J, 'avakhada.values.' + k); return o && o[v] ? esc(tx(o[v])) : esc(String(v)); }, avt = k => { const t = gg(J, 'avakhada.terms.' + k); return t ? esc(tx(t.name)) : esc(k); };
    B.h2(bt('avakhada'), tr('avakhada')); gl('avakhada'); gl('naam_akshar');
    B.kv([[bt('naamAkshar'), (tx(av.nameSyllables) ? (Array.isArray(av.nameSyllables[S.lang]) ? av.nameSyllables[S.lang] : [].concat(tx(av.nameSyllables))).map((s, i) => i === av.pada - 1 ? '<b class="hlx">' + esc(s) + '</b>' : esc(s)).join(' · ') : '—')]].concat(['varna', 'vashya', 'yoni', 'gana', 'nadi', 'tatva', 'paya', 'yunja'].map(k => [avt(k), avv(k, av[k])]),
      [[avt('rashi'), esc(tx(av.rashiName)) + ' · ' + esc(pn(av.rashiLord))], [avt('nakshatra'), esc(tx(av.nakshatraName)) + ' ' + num(av.pada) + ' · ' + esc(pn(av.nakLord))], [bt('lagna'), esc(sgn(av.lagna)) + ' · ' + esc(pn(av.lagnaLord))]]));
    const SL = { hora: 'hora_lagna', ghati: 'ghati_lagna', bhava: 'bhava_lagna', sree: 'sree_lagna', indu: 'indu_lagna', varnada: 'varnada_lagna', pranapada: 'pranapada' };
    const gname = k => J.glossary && J.glossary[k] ? esc(tx(J.glossary[k].term)) : esc(k);
    B.h2(bt('specialLagnas') + ' · ' + bt('upagrahas'), tr('specialLagnas'));
    B.tbl(bth('name') + bth('sign') + bth('degree') + bth('house'), Object.keys(SL).filter(k => C.specialLagnas[k]).map(k => { gl(SL[k]); const v = C.specialLagnas[k]; return tr0([td(gname(SL[k])), td(esc(sgn(v.sign))), td(v.deg != null ? dms(v.deg, true) : '—', 'num'), td(num(houseOf(C, v.sign)), 'num')]); }).concat(K.upaKeys(C).map(k => { const v = C.upagrahas[k]; return tr0([td(K.upaName(k).replace(/<[^>]+>/g, '')), td(esc(sgn(v.sign))), td(dms(v.deg, true), 'num'), td(num(houseOf(C, v.sign)), 'num')]); })), { cls: 'num4' });
    if (C.points && Object.keys(C.points).length) { B.h2(bt('chartPoints'), tr('chartPoints')); B.kv(Object.keys(C.points).filter(k => k !== 'note').map(k => [esc(K.pointName(k)), esc(K.pointVal(C, C.points[k])) + (K.pointRule(C.points[k]) ? '<br><span class="sub">' + esc(K.pointRule(C.points[k])) + '</span>' : '')])); if (C.points.note) B.p(esc(tx(C.points.note)), 'sub'); }
  }
  // ---------------- 2. charts, planets, houses
  if (sel.includes('charts')) {
    B.chapter('charts', ++n, 'chCharts', '🪐');
    B.h2(bt('rashiChart') + ' · ' + bt('moonChart'), tr('rashiChart'));
    B.blk('<div class="c2">' + chartBox(csvg(C, 'D1', { title: 'D1', subtitle: sgn(C.asc.sign) }), bt('rashiChart')) + chartBox(csvg(C, 'moon', { title: tr('moonChart') }), bt('moonChart')) + '</div>');
    B.blk('<div class="c2">' + chartBox(csvg(C, 'chalit', { title: tr('chalit') }), bt('bhavaChalitT')) + chartBox(chartSVG(chartModel(C, 'D1'), { ctx: 'print', style: 'western', title: '', subtitle: '' }), bt('wheelThumb')) + '</div>');
    B.p(esc(tr('legend')) + (K.glyphsOn() ? ' · ' + PL9.map(id => K.pg(id) + ' ' + esc(pab(id))).join('  ') : ''), 'sub');
    // wide planet table
    const avn = (k, v) => { const st = v && gg(J, 'avasthas.' + k + '.states.' + v); return st ? tx(st.name).split(' (')[0] : (v || '—'); };
    const flags = (pp) => [K.isVargottama(C, pp) ? 'V' : '', pp.gandanta ? 'G' : '', pp.pushkara && (pp.pushkara.navamsa || pp.pushkara.bhaga) ? 'Pu' : '', pp.mrityuBhaga && pp.mrityuBhaga.inMrityuBhaga ? 'MB' : '', pp.neechaBhanga && pp.neechaBhanga.cancelled ? 'NB' : ''].filter(Boolean).join(' ');
    B.h2(bt('planetTable'), tr('planetTable'));
    const rows = [tr0([td('<b>' + bt('lagna') + '</b>'), td(esc(sgn(C.asc.sign))), td(ddeg(C.asc.deg), 'num'), td(esc(nkn(C.asc.nak)) + '-' + num(C.asc.pada)), td(esc(pab(C.asc.nakLord))), td(esc(pab(C.asc.subLord))), td(esc(pab(C.asc.subSubLord))), td('1', 'num'), td('1', 'num'), td(''), td(''), td(''), td(''), td(''), td(''), td(''), td(''), td(''), td(flags(C.asc))])];
    for (const id of PL9.concat(S.outer ? K.OUTER : [])) { const q = P(C, id); if (!q) continue; rows.push(tr0([td('<b>' + pl(id) + '</b>'), td(esc(sgn(q.sign))), td(ddeg(q.deg), 'num'), td(esc(nkn(q.nak)) + '-' + num(q.pada)), td(esc(pab(q.nakLord))), td(esc(pab(q.subLord))), td(esc(pab(q.subSubLord))), td(num(q.house), 'num'), td(num(q.bhavaChalit), 'num'), td(esc(K.digName(q.dignity))), td(q.retro && id !== 'Ra' && id !== 'Ke' ? '℞' : ''), td(q.combust ? 'c' : ''), td(fx(q.speed, 3), 'num'), td(esc(avn('baladi', q.avasthas && q.avasthas.baladi))), td(esc(avn('jagradadi', q.avasthas && q.avasthas.jagradadi))), td(esc(avn('deeptadi', q.avasthas && q.avasthas.deeptadi))), td(esc(avn('lajjitadi', q.avasthas && q.avasthas.lajjitadi))), td(esc(q.karaka || '')), td(flags(q))])); }
    B.tbl(bth('planet') + bth('sign') + bth('degree') + bth('nakshatra') + bth('nakLord') + bth('subLord') + bth('subSub') + bth('house') + bth('chalit') + bth('dignity') + th('℞') + th('c') + bth('speed') + bth('baladi') + bth('jagradadi') + bth('deeptadi') + bth('lajjitadi') + bth('karaka') + th('V/G/Pu/MB/NB'), rows, { wide: true, cls: 'dense' });
    B.p('V = ' + esc(tr('vargottama')) + ' · G = ' + esc(tr('gandanta')) + ' · Pu = ' + esc(tr('pushkara')) + ' · MB = ' + esc(tr('mrityuBhaga')) + ' · NB = ' + esc(tr('neechaBhanga')) + ' · MC ' + lonS(C.mc), 'sub', { wide: true });
    B.out[B.out.length - 1].wide = true;
    const nbs = PL9.map(id => P(C, id)).filter(q => q.neechaBhanga && Array.isArray(q.neechaBhanga.rules));
    if (nbs.length) { B.h3(bt('neechaBhanga')); for (const q of nbs) B.p('<b>' + pl(q.id) + ':</b> ' + q.neechaBhanga.rules.map(r => (r.applies ? '✓ ' : '○ ') + esc(tx(r.rule))).join('; ') + (q.neechaBhanga.cancelled ? ' — <b>' + esc(tr('cancelled')) + '</b>' : ''), 'small'); }
    // houses
    B.h2(bt('houseTable'), tr('houseTable'));
    B.tbl(bth('house') + bth('sign') + bth('cusp') + bth('lord') + bth('occupants') + bth('aspectsRecv') + th('SAV') + bth('bhavaBala'), Array.from({ length: 12 }, (_, i) => { const h = i + 1, s = signOfHouse(C.asc.sign, h), lo = SIGN_LORD[s], lp = P(C, lo); return tr0([td(num(h), 'num'), td(esc(sgn(s))), td(lonS(C.bhavaChalit.houses[i].cusp)), td(pl(lo) + ' → ' + num(lp.house)), td(plistH(PL9.filter(id => P(C, id).sign === s))), td(plistH(K.aspectsReceived(C, s, null))), td(num(C.ashtakavarga.sav[s]), 'num'), td(fx(C.bhavabala[i].rupas, 2), 'num')]); }));
    B.h3(bt('relationships'));
    B.tbl(th('') + PL9.map(id => th(esc(pab(id)))).join(''), PL9.map(a => tr0([td('<b>' + esc(pab(a)) + '</b>')].concat(PL9.map(b => td(a === b ? '—' : esc(K.digName(C.relationships[a][b]).slice(0, hi() ? 6 : 8))))))), { cls: 'dense' });
  }
  // ---------------- 3. vargas
  if (sel.includes('vargas')) {
    B.chapter('vargas', ++n, 'chVargas', '🔲'); gl('varga');
    for (let i = 0; i < VARGAS.length; i += 2) {
      const pair = VARGAS.slice(i, i + 2);
      B.blk('<div class="c2 v">' + pair.map(v => { const M = chartModel(C, v), jv = J.vargas && J.vargas[v]; return chartBox(chartSVG(M, { ctx: 'print', style: S.style, title: v, subtitle: sgn(M.asc) }), '<b>' + esc(v) + ' · ' + esc(K.vargaTitle(v)) + '</b>' + (jv ? '<br><span class="sub">' + esc(tx(jv.area || jv.purpose)) + '</span>' : '')); }).join('') + '</div>', i === 0 ? { toc: { key: 'vg', label: tr('vargaGrid'), level: 2 } } : null);
    }
    B.h2(bt('vimsopaka'), tr('vimsopaka')); gl('vimsopaka_bala');
    B.tbl(bth('planet') + bth('shadvarga') + bth('saptavarga') + bth('dashavarga') + bth('shodashavarga'), PL7.map(id => tr0([td(pl(id))].concat(['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga'].map(k => td(fx(C.vimsopaka[id][k], 2), 'num'))))), { cls: 'num4' });
    B.h2(bt('acrossVargas'), tr('acrossVargas'));
    B.tbl(th('') + VARGAS.map(v => th(v)).join(''), [tr0([td('<b>' + esc(tr('lagna')) + '</b>')].concat(VARGAS.map(v => td(esc(sab(C.vargas[v].asc))))))].concat(PL9.map(id => tr0([td('<b>' + esc(pab(id)) + '</b>')].concat(VARGAS.map(v => { const s = C.vargas[v].planets[id], d = K.vDig(id, s); return td(esc(sab(s)) + (d === 'exalted' ? '↑' : d === 'debilitated' ? '↓' : d === 'own' ? '•' : ''), v !== 'D1' && s === C.vargas.D1.planets[id] ? 'vo' : ''); }))))), { wide: true, cls: 'dense grid' });
    B.p('↑ ' + esc(K.digName('exalted')) + ' · ↓ ' + esc(K.digName('debilitated')) + ' · • ' + esc(K.digName('own')) + ' · ▢ ' + esc(tr('sameSign')) + ' (D1)', 'sub');
    B.out[B.out.length - 1].wide = true;
  }
  // ---------------- 4. readings
  if (sel.includes('readings') && J.lagna) {
    B.chapter('readings', ++n, 'chReadings', '📖');
    const lg = J.lagna[C.asc.sign], ms = J.moonSign && J.moonSign[mo.sign], nk = J.nakshatras && J.nakshatras[mo.nak];
    const secs = (o, keys) => keys.filter(k => o && o[k]).forEach(k => B.p('<b>' + esc(K.secName(k)) + ':</b> ' + esc(tx(o[k])), 'reading'));
    if (lg) { B.h2(bt('lagnaReading') + ': ' + esc(sgn(C.asc.sign)), tr('lagnaReading')); B.p(esc(tx(lg.summary)), 'reading'); secs(lg, ['personality', 'body', 'strengths', 'challenges', 'career', 'relationships', 'health', 'tip']); }
    if (ms) { B.h2(bt('moonReading') + ': ' + esc(sgn(mo.sign)), tr('moonReading')); B.p(esc(tx(ms.summary)), 'reading'); secs(ms, ['mind', 'strengths', 'challenges', 'tip']); }
    if (nk) { B.h2(bt('nakReading') + ': ' + esc(nkn(mo.nak)) + ' · ' + esc(tr('pada')) + ' ' + num(mo.pada), tr('nakReading')); B.p([nk.deity ? tx(nk.deity) : '', nk.symbol ? tx(nk.symbol) : '', nk.gana ? tx(nk.gana) : ''].filter(Boolean).map(esc).join(' · '), 'sub'); B.p(esc(tx(nk.summary)), 'reading'); if (nk.padas && nk.padas[mo.pada - 1]) B.p('<b>' + esc(tr('pada')) + ' ' + num(mo.pada) + ':</b> ' + esc(tx(nk.padas[mo.pada - 1])), 'reading'); secs(nk, ['personality', 'strengths', 'challenges', 'career', 'relationships']); }
    B.h2(bt('planetReadings'), tr('planetReadings'));
    for (const id of PL9) { const q = P(C, id); B.h3(pl(id) + ' · ' + esc(sgn(q.sign)) + ' · ' + esc(tr('house')) + ' ' + num(q.house)); if (J.planetInSign && J.planetInSign[id]) B.p(esc(tx(J.planetInSign[id][q.sign])), 'reading'); if (J.planetInHouse && J.planetInHouse[id]) B.p(esc(tx(J.planetInHouse[id][q.house])), 'reading'); }
    B.h2(bt('houseByHouse'), tr('houseByHouse'));
    for (let h = 1; h <= 12; h++) { const s = signOfHouse(C.asc.sign, h), jh = J.houses && J.houses[h], lo = SIGN_LORD[s], occ = PL9.filter(id => P(C, id).sign === s); B.blk('<h4>' + num(h) + '. ' + esc(jh ? tx(jh.name) : tr('house') + ' ' + h) + ' · ' + esc(sgn(s)) + '</h4><p class="reading">' + (jh ? '<i>' + esc(tx(jh.significations).replace(/[.।s]+$/, '')) + '.</i> ' : '') + esc(tr('houseLord')) + ' ' + pl(lo) + ' → ' + esc(tr('house')) + ' ' + num(P(C, lo).house) + ' (' + esc(sgn(P(C, lo).sign)) + '). ' + esc(tr('occupants')) + ': ' + plistH(occ) + '. SAV ' + num(C.ashtakavarga.sav[s]) + '.</p>'); }
  }
  // ---------------- 5. dashas
  if (sel.includes('dashas')) {
    B.chapter('dashas', ++n, 'chDashas', '⏳'); gl('vimshottari'); gl('dasha_balance');
    const V = C.dashas.vimshottari, b = V.balanceAtBirth;
    B.h2(bt('mdAd'), tr('vim'));
    B.p(esc(tr('balance')) + ': <b>' + esc(pn(b.lord)) + ' ' + fmtDur(b.totalYears) + '</b> · ' + esc(tr('till')) + ' ' + fmtDate(b.endISO));
    const rows = [];
    for (const md of V.tree) { rows.push('<tr class="mdrow' + (nowFlag(md.start, md.end) ? ' cur' : '') + '"><td colspan="2"><b>' + pl(md.lord) + '</b></td><td>' + fmtDate(md.startISO) + '</td><td>' + fmtDate(md.endISO) + '</td><td class="num">' + fx(Math.max(0, K.ageAt(C, md.start)), 1) + '</td></tr>'); for (const ad of md.children) rows.push('<tr' + (nowFlag(ad.start, ad.end) ? ' class="cur"' : '') + '><td></td><td>' + esc(pab(md.lord)) + ' › ' + pl(ad.lord) + '</td><td>' + fmtDate(ad.startISO) + '</td><td>' + fmtDate(ad.endISO) + '</td><td class="num">' + fx(Math.max(0, K.ageAt(C, ad.start)), 1) + '</td></tr>'); }
    B.tbl(bth('mahadasha') + bth('antardasha') + bth('from') + bth('till') + bth('age'), rows, { cls: 'dash' });
    // PD for current and next AD
    const cur = JE().dashaAt(V.tree, nowJd(), 2);
    if (cur.length === 2) {
      const md = V.tree.find(x => x.start === cur[0].start), ads = md ? md.children : [], i = ads.findIndex(x => x.start === cur[1].start);
      let nextAd = ads[i + 1]; if (!nextAd) { const mi = V.tree.indexOf(md); nextAd = V.tree[mi + 1] && V.tree[mi + 1].children[0]; }
      for (const ad of [ads[i], nextAd].filter(Boolean)) { const mdl = V.tree.find(x => x.start <= ad.start && x.end >= ad.end); B.h3(bt('pdFor') + ' ' + esc(pn(mdl ? mdl.lord : '')) + ' › ' + esc(pn(ad.lord))); B.tbl(bth('pratyantar') + bth('from') + bth('till') + bth('duration'), ad.children.map(pd => '<tr' + (nowFlag(pd.start, pd.end) ? ' class="cur"' : '') + '><td>' + pl(pd.lord) + '</td><td>' + fmtDate(pd.startISO, true) + '</td><td>' + fmtDate(pd.endISO, true) + '</td><td class="num">' + fmtDur((pd.end - pd.start) / 365.25) + '</td></tr>')); }
    }
    const inline = (nodes, name) => nodes.map(md => '<tr' + (nowFlag(md.start, md.end) ? ' class="cur"' : '') + '><td><b>' + name(md) + '</b></td><td>' + fmtDate(md.startISO) + '</td><td>' + fmtDate(md.endISO) + '</td><td class="small">' + (md.children || []).map(c => name(c) + ' ' + fmtDate(c.startISO)).join(' · ') + '</td></tr>');
    const Y = C.dashas.yogini; gl('yogini_dasha');
    B.h2(bt('yogini'), tr('yogini')); B.tbl(bth('mahadasha') + bth('from') + bth('till') + bth('antardasha'), inline(Y.periods, x => esc((J.yogini && J.yogini[x.id] ? tx(J.yogini[x.id].name) : x.id) + ' (' + pab(x.lord) + ')')), { cls: 'dash' });
    const As = C.dashas.ashtottari; gl('ashtottari_dasha');
    B.h2(bt('ashtottari'), tr('ashtottari')); B.p('<b>' + esc(tr('applicable')) + ':</b> ' + esc(As.applicable ? tr('applies') : tr('notApplies')) + ' — ' + esc(tx(As.note)), 'sub');
    B.tbl(bth('mahadasha') + bth('from') + bth('till') + bth('antardasha'), inline(As.periods, x => esc(pn(x.lord))), { cls: 'dash' });
    const Ch = C.dashas.chara; gl('chara_dasha');
    B.h2(bt('chara'), tr('chara')); B.tbl(bth('mahadasha') + bth('from') + bth('till') + bth('antardasha'), inline(Ch.periods, x => esc(sgn(x.sign))), { cls: 'dash' });
    if (P3 && JE().dashas) {
      B.h2(bt('otherSystems'), tr('otherSystems'));
      const skip = ['vimshottari', 'yogini', 'ashtottari', 'chara'];
      for (const sys of Object.keys(JE().dashaSystems).filter(s => !skip.includes(s))) {
        let r; try { r = P3.dashaRes(C, sys); } catch (e) { continue; }
        const ap = r.applicability || {}, nmF = x => x.lord ? (x.lord === 'La' ? tr('lagna') : pn(x.lord)) : sgn(x.sign);
        B.h3(esc(K.dsName(sys)) + (ap.rule ? ' <span class="sub">— ' + esc(ap.applicable ? tr('applies') : tr('notApplies')) + '</span>' : ''));
        B.tbl(bth('mahadasha') + bth('from') + bth('till') + bth('antardasha'), r.tree.slice(0, 16).map(md => '<tr' + (nowFlag(md.start, md.end) ? ' class="cur"' : '') + '><td><b>' + esc(nmF(md)) + '</b></td><td>' + fmtDate(md.startISO) + '</td><td>' + fmtDate(md.endISO) + '</td><td class="small">' + (md.children || []).slice(0, 12).map(c => esc(c.lord ? (c.lord === 'La' ? 'La' : pab(c.lord)) : sab(c.sign))).join(' ') + '</td></tr>'), { cls: 'dash' });
      }
    }
  }
  // ---------------- 6. yogas & doshas
  if (sel.includes('yogas')) {
    B.chapter('yogas', ++n, 'chYogas', '✨');
    const ys = C.yogas.filter(y => y.present && !K.isClassif(y));
    B.h2(bt('yogasPresent') + ' <small>(' + num(ys.length) + ')</small>', tr('yogasPresent'));
    for (const y of ys) { const jy = J.yogas && J.yogas[y.id]; B.blk('<h4>' + esc(K.yogaName(y.id)) + ' <span class="tag">' + esc(tr(y.strength) || y.strength || '') + '</span>' + (y.rarity ? ' <span class="tag">' + esc(J.yogaRarity && J.yogaRarity[y.rarity] ? tx(J.yogaRarity[y.rarity]).split(' (')[0] : y.rarity) + (typeof y.commonness === 'number' ? ' · ' + fx(y.commonness, 1) + '%' : '') + '</span>' : '') + '</h4>' +
      (jy && jy.rule ? '<p class="small"><b>' + esc(tr('rule')) + ':</b> ' + esc(tx(jy.rule)) + '</p>' : '') + '<p class="small"><b>' + esc(tr('whyHere')) + ':</b> ' + esc(tx(y.reason)) + (y.planets && y.planets.length ? ' (' + plistH(y.planets) + ')' : '') + '</p>' + (jy && jy.effect ? '<p class="small">' + esc(tx(jy.effect)) + '</p>' : '') + (jy && jy.source ? '<p class="sub">' + esc(tr('source')) + ': ' + esc(tx(jy.source)) + '</p>' : '')); }
    const cls = C.yogas.filter(y => y.present && K.isClassif(y)); if (cls.length) B.p('<b>' + esc(tr('classifications')) + ':</b> ' + cls.map(y => esc(K.yogaName(y.id)) + ' — ' + esc(tx(y.reason))).join('; '), 'small');
    const canc = C.yogas.filter(y => y.cancelled && (y.present || y.cancelled)).slice(0, 20);
    if (canc.length) { B.h2(bt('yogasCancelled'), tr('yogasCancelled')); B.tbl(bth('yoga') + bth('whyHere'), canc.map(y => tr0([td(esc(K.yogaName(y.id))), td(esc(tx(y.cancelled) || tx(y.reason)), 'small')]))); }
    const D = C.doshas, JD = J.doshas || {};
    B.h2(bt('doshas'), tr('doshas'));
    const M = D.manglik, lvl = gg(JD, 'manglik.levels.' + M.level);
    B.h3(bt('manglik')); gl('manglik');
    const lt = lvl ? tx(lvl.name || lvl.label || lvl) : String(M.level), li = lt.indexOf(':');
    B.p((li > 0 ? '<b>' + esc(lt.slice(0, li)) + '</b>' + esc(lt.slice(li)) : '<b>' + esc(lt) + '</b>') + ' · ' + esc(tr('fromLagna')) + ' ' + (M.fromLagna ? '✓' : '✗') + ' · ' + esc(tr('fromMoon')) + ' ' + (M.fromMoon ? '✓' : '✗') + ' · ' + esc(tr('fromVenus')) + ' ' + (M.fromVenus ? '✓' : '✗') + ' · ' + esc(tr('manglikHouses')) + ' ' + hl(M.houseSet) + (M.grading ? ' — ' + esc(tx(M.grading)) : ''));
    B.tbl(bth('cancellations') + th(''), (M.cancellations || []).map(c => tr0([td(esc(tx(c.rule)) + (c.folk ? ' <span class="tag">folk</span>' : ''), 'small'), td(c.applies ? '✓ ' + esc(tr('appliesY')) : '○ ' + esc(tr('appliesN')))])));
    const KS = D.kaalSarp; B.h3(bt('kaalSarp')); B.p((KS.present ? '<b>' + esc(tr('full')) + '</b> ' + esc(KS.type || '') : KS.nearPattern ? esc(tr('nearPattern')) + ' — ' + esc(tx(KS.nearReason)) : esc(tr('absent'))) + (gg(JD, 'kaalSarp.balanced') ? ' <span class="sub">' + esc(tx(JD.kaalSarp.balanced)) + '</span>' : ''), 'small');
    const KD = D.kemadruma; B.h3(bt('kemadruma')); B.p((KD.present ? esc(tr('present')) : KD.formed ? esc(tr('cancelled')) + (KD.cancelledBy ? ' — ' + esc(tx(KD.cancelledBy)) : '') : esc(tr('absent'))), 'small');
    B.tbl(bth('otherDoshas') + th('') + th(''), ['pitru', 'grahan', 'guruChandal', 'shrapit'].filter(k => D[k]).map(k => tr0([td(esc(nm(JD[k], k))), td(D[k].present ? '● ' + esc(tr('present')) : '○ ' + esc(tr('absent'))), td(esc(tx(D[k].note)), 'small')])));
    if (JD.manglik && JD.manglik.balanced) B.p(esc(tx(JD.manglik.balanced)), 'note');
  }
  // ---------------- 7. strength
  if (sel.includes('strength')) {
    B.chapter('strength', ++n, 'chStrength', '📊'); gl('ashtakavarga'); gl('sav');
    const A = C.ashtakavarga, sgH = Array.from({ length: 12 }, (_, s) => th(esc(sab(s)))).join('');
    const avRows = (o, withSav) => PL7.map(id => tr0([td('<b>' + esc(pab(id)) + '</b>')].concat(o[id].map(v => td(num(v), 'num')), [td('<b>' + num(o[id].reduce((a, b) => a + b, 0)) + '</b>', 'num')]))).concat(withSav ? [tr0([td('<b>SAV</b>')].concat(A.sav.map(v => td('<b>' + num(v) + '</b>', 'num')), [td('<b>' + num(A.savTotal) + '</b>', 'num')]))] : []);
    B.h2(bt('bavGrids'), tr('bavGrids'));
    B.tbl(th('') + sgH + bth('total'), avRows(A.bav, true), { cls: 'grid' });
    B.blk(barSvg(Array.from({ length: 12 }, (_, s) => ({ l: sab(s), v: A.sav[s], c: A.sav[s] >= 28 ? 'g' : 'r' })), 56, 28, 'SAV'));
    if (A.reductions) for (const k of ['trikona', 'ekadhipatya']) if (A.reductions[k]) { B.h3(bt('reduced') + ': ' + bt(k)); B.tbl(th('') + sgH + bth('total'), avRows(A.reductions[k], false), { cls: 'grid' }); }
    if (A.reductions && A.reductions.shodhyaPinda) { const sp = A.reductions.shodhyaPinda; B.h3(bt('shodhya')); B.tbl(bth('planet') + th('Rashi') + th('Graha') + th('Shodhya'), PL7.filter(id => sp[id]).map(id => tr0([td(esc(pn(id))), td(num(sp[id].rashiPinda != null ? sp[id].rashiPinda : (sp[id].rashi || 0)), 'num'), td(num(sp[id].grahaPinda != null ? sp[id].grahaPinda : (sp[id].graha || 0)), 'num'), td('<b>' + num(sp[id].shodhyaPinda != null ? sp[id].shodhyaPinda : (sp[id].total || 0)) + '</b>', 'num')]))); }
    if (A.prastara) {
      const contrib = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'La'];
      for (let i = 0; i < PL7.length; i += 2) {
        const pair = PL7.slice(i, i + 2);
        B.blk((i === 0 ? '<h2>' + bt('prastaraT') + '</h2>' : '') + '<div class="c2">' + pair.map(id => '<div><h4>' + esc(pn(id)) + ' — BAV ' + num(A.bav[id].reduce((a, b) => a + b, 0)) + '</h4><table class="grid prast"><thead><tr><th></th>' + sgH + '</tr></thead><tbody>' + contrib.filter(c => A.prastara[id][c]).map(c => '<tr><td><b>' + esc(pab(c)) + '</b></td>' + A.prastara[id][c].map(v => '<td class="' + (v ? 'dot' : '') + '">' + (v ? '●' : '') + '</td>').join('') + '</tr>').join('') + '<tr class="tot"><td>Σ</td>' + A.bav[id].map(v => '<td>' + num(v) + '</td>').join('') + '</tr></tbody></table></div>').join('') + '</div>', { wide: true, toc: i === 0 ? { key: 'prast', label: tr('prastaraT'), level: 2 } : null });
      }
    }
    const SB = C.shadbala; gl('shadbala');
    B.h2(bt('sbTable'), tr('shadbala'));
    const sbk = [['Uchcha', x => x.sthana.uchcha], ['Saptavargaja', x => x.sthana.saptavargaja], ['Ojayugma', x => x.sthana.ojayugma], ['Kendradi', x => x.sthana.kendradi], ['Drekkana', x => x.sthana.drekkana], ['Sthana Σ', x => x.sthanaTotal], ['Dig', x => x.dig], ['Natonnata', x => x.kala.natonnata], ['Paksha', x => x.kala.paksha], ['Tribhaga', x => x.kala.tribhaga], ['Abda/Masa/Vara/Hora', x => x.kala.abda + x.kala.masa + x.kala.vara + x.kala.hora], ['Ayana', x => x.kala.ayana], ['Yuddha', x => x.kala.yuddha], ['Kala Σ', x => x.kalaTotal], ['Chesta', x => x.chesta], ['Naisargika', x => x.naisargika], ['Drik', x => x.drik], [tr('total'), x => x.total], [tr('rupas'), x => x.rupas], [tr('required'), x => x.required], [tr('ratio'), x => x.ratio], [tr('rank'), x => x.rank], [tr('ishta'), x => x.ishta], [tr('kashta'), x => x.kashta]];
    B.tbl(th('') + PL7.map(id => th(esc(pab(id)))).join(''), sbk.map(([l, f]) => tr0([td(esc(l))].concat(PL7.map(id => { let v; try { v = f(SB[id]); } catch (e) { v = null; } return td(v == null || isNaN(v) ? '—' : fx(v, Number.isInteger(v) ? 0 : 2), 'num'); })))), { cls: 'grid' });
    B.blk('<h3>' + bt('sbChart') + '</h3>' + barSvg(PL7.map(id => ({ l: pab(id), v: SB[id].rupas, r: SB[id].required, c: SB[id].rupas >= SB[id].required ? 'g' : 'r' })), Math.max(10, ...PL7.map(id => SB[id].rupas)) * 1.1, null, tr('rupas')));
    B.h2(bt('bhavabala'), tr('bhavabala'));
    B.tbl(bth('house') + bth('sign') + bth('lord') + th('Bhavadhipati') + th('Dig') + th('Drishti') + bth('total') + bth('rupas'), C.bhavabala.map(x => tr0([td(num(x.house), 'num'), td(esc(sgn(x.sign))), td(esc(pn(x.lord))), td(fx(x.lordBala, 1), 'num'), td(fx(x.digBala, 1), 'num'), td(fx(x.drishtiBala, 1), 'num'), td(fx(x.total, 1), 'num'), td('<b>' + fx(x.rupas, 2) + '</b>', 'num')])), { cls: 'num4' });
    B.blk(barSvg(C.bhavabala.map(x => ({ l: num(x.house), v: x.rupas, c: 'a' })), Math.max(...C.bhavabala.map(x => x.rupas)) * 1.1, null, tr('rupas')));
  }
  // ---------------- 8. transits
  if (sel.includes('transits')) {
    B.chapter('transits', ++n, 'chTransits', '🌍'); gl('gochar'); gl('sade_sati');
    const t = JE().transitsNow(C, nowJd());
    B.h2(bt('transitsNow') + ' · ' + fmtDate(t.iso, true), tr('transitsNow'));
    B.blk('<div class="c2 one">' + chartBox(chartSVG(chartModel(C, 'D1'), { ctx: 'print', style: S.style, title: tr('transits'), subtitle: fmtDate(t.iso), extra: t.planets.map(q => ({ id: q.id, sign: q.sign, lon: q.lon, deg: q.deg, retro: q.retro && q.id !== 'Ra' && q.id !== 'Ke' })) }), esc(tr('overlay'))) + '<div>' +
      '<table class="grid"><thead><tr>' + bth('planet') + bth('sign') + bth('nakshatra') + bth('fromMoonH') + bth('fromLagnaH') + th('SAV') + th('BAV') + '</tr></thead><tbody>' + t.planets.map(q => '<tr><td>' + pl(q.id) + (q.retro && q.id !== 'Ra' && q.id !== 'Ke' ? ' ℞' : '') + '</td><td>' + esc(sab(q.sign)) + ' ' + dms(q.deg) + '</td><td>' + esc(nkn(q.nak)) + '</td><td class="num">' + num(q.houseFromMoon) + '</td><td class="num">' + num(q.houseFromLagna) + '</td><td class="num">' + num(q.savBindus) + '</td><td class="num">' + (C.ashtakavarga.bav[q.id] ? num(C.ashtakavarga.bav[q.id][q.sign]) : '—') + '</td></tr>').join('') + '</tbody></table>' +
      '<p class="small">♄ ' + esc(t.sadeSati ? tr('inSadeSati') : t.dhaiya ? tr('inDhaiya') : tr('noSS')) + '</p></div></div>');
    const per = K.sadeSatiPeriods(C), JS = gg(J, 'doshas.sadeSati'), phn = ph => JS && JS.phases && JS.phases[ph] ? tx(JS.phases[ph].name) : ph;
    B.h2(bt('ssLife'), tr('sadeSati'));
    B.blk(ssBar(C, per, phn));
    B.tbl(bth('sadeSati') + bth('from') + bth('till') + bth('age'), per.filter(q => q.end >= C.meta.jdUT).map(q => '<tr' + (nowFlag(q.start, q.end) ? ' class="cur"' : '') + '><td><span class="sw ph-' + q.phase + '"></span>' + esc(phn(q.phase)) + (q.sign != null ? ' · ' + esc(sab(q.sign)) : '') + '</td><td>' + fmtDate(q.startISO) + '</td><td>' + fmtDate(q.endISO) + '</td><td class="num">' + fx(Math.max(0, K.ageAt(C, q.start)), 1) + '–' + fx(K.ageAt(C, q.end), 1) + '</td></tr>'));
    if (JS && JS.balanced) B.p(esc(tx(JS.balanced)), 'note');
    const ing = K.computeIngresses(nowJd(), 366).filter(e => e.id !== 'Mo'), off = C.meta.utcOffsetUsed, msign = mo.sign;
    B.h2(bt('next12'), tr('next12'));
    B.tbl(bth('localTime') + bth('planet') + th('') + bth('fromMoonH'), ing.map(e => tr0([td(fmtDate(JE().isoLocal(e.jd, off), e.type === 'enter')), td(pl(e.id) + (e.id === 'Ra' ? ' / ' + pl('Ke') : '')), td(e.type === 'enter' ? esc(tr('enters')) + ' <b>' + esc(sgn(e.sign)) + '</b>' : e.type === 'retro' ? '℞ ' + esc(tr('turnsRetro')) + ' (±2 d)' : esc(tr('turnsDirect')) + ' (±2 d)'), td(e.type === 'enter' ? num(((e.sign - msign + 12) % 12) + 1) : '', 'num')])));
  }
  // ---------------- 9. Phase 3 systems
  if (sel.includes('systems') && P3) {
    B.chapter('systems', ++n, 'chSystems', '🔭');
    systemsChapter(B, C, P3, J, p);
  }
  // ---------------- 10. glossary, methods, disclaimer
  if (sel.includes('glossary')) {
    B.chapter('glossary', ++n, 'chGloss', '📚');
    B.h2(bt('methods'), tr('methods'));
    B.kv([[bt('ayanamsa'), esc(tx(m.ayanamsaName)) + ' = ' + dms(m.ayanamsaValue, true)], [bt('node'), esc(tr(m.nodeType))], [bt('houses'), esc(tr(m.houseSystemUsed))], [bt('dashaYear'), num(m.dashaYear && m.dashaYear.days ? m.dashaYear.days : 365.25) + ' ' + esc(tr('days'))], [bt('offsetUsed'), 'UTC' + K.hm(m.utcOffsetUsed) + ' — ' + esc(tx(m.offsetReason))], [bt('engine'), esc(ver)]]
      .concat(Object.keys(opt).map(k => [esc(tr(({ manglikHouses: 'manglikHouses', dashaYear: 'dashaYear', karakas: 'karakasOpt', yogaMode: 'yogaMode', shadbalaSchool: 'shadbalaSchool', doshaOrb: 'doshaOrbL', nodeAspects: 'nodeAspectsL' })[k] || k)), esc(String(opt[k]))])));
    B.p(hi() ? 'खगोलीय गणना: VSOP87 / ELP-2000 (सार्वजनिक डेटा) — स्विस एफ़ेमेरिस से ग्रह 1″ के भीतर, लाहिड़ी अयनांश SE_SIDM_LAHIRI के अनुसार। जहाँ परंपराएँ भिन्न हैं वहाँ मानक जगन्नाथ होरा (JH) के अनुसार। शहर डेटा GeoNames (CC BY 4.0)। सभी पाठ हमारे अपने शब्दों में।' : 'Astronomy: VSOP87 / ELP-2000 (public data) — planets within about 1″ of the Swiss Ephemeris; Lahiri ayanamsa as SE_SIDM_LAHIRI. Where schools differ the defaults follow Jagannatha Hora (JH). City data: GeoNames (CC BY 4.0). All texts are written in our own words.', 'small');
    B.h2(bt('glossUsed'), tr('glossUsed'));
    const G2 = J.glossary || {}, keys = [...GLOSS_USED].filter(k => G2[k]).sort((a, b) => tx(G2[a].term).localeCompare(tx(G2[b].term), S.lang));
    for (let i = 0; i < keys.length; i += 4) B.blk('<dl class="gl">' + keys.slice(i, i + 4).map(k => '<dt>' + bo(G2[k].term) + '</dt><dd>' + esc(tx(G2[k].def)) + '</dd>').join('') + '</dl>');
    B.h2(bt('disclaimerT'), tr('disclaimerT'));
    B.p(esc(J.disclaimer ? tx(J.disclaimer.full || J.disclaimer.short) : ''), 'reading');
    B.p('Made by Nivriti Rajput <span class="heart">♥</span> · ' + esc(tr('appName')), 'sub');
  }
  return B.out;
}
// Key themes (JE.synthesis) and Life timeline (JE.lifeTimeline) chapters — right after the cover and contents (Phase 4)
function keyChapters(B, C, sel, n) {
  const P5 = K.p5, S4 = JC().synth || {}, TL = JC().tl || {};
  const fmt4 = (o, v) => tx(o).replace(/\{(\w+)\}/g, (_, k) => v[k] != null ? v[k] : '');
  if (sel.includes('themes')) {
    const R = P5.synth(C);
    B.chapter('themes', ++n, 'chThemes', '✨');
    B.p(esc(tx(S4.honesty)), 'note');
    if (R.timeUnknown) B.p('⚠ ' + esc(tx(S4.timeUnknownNote)), 'note');
    if (R.minor) B.p('🌱 ' + esc(tx(S4.minorNote)), 'sub');
    const natal = R.themes.filter(x => x.area !== 'timing'), per = R.themes.filter(x => x.area === 'timing');
    const row = (x, i) => tr0([td(num(i + 1), 'num'), td('<b>' + esc(tx(x.statement)) + '</b><br><span class="sub">' + esc(P5.areaName(x.area).replace(/&amp;/g, '&')) + '</span>'), td(esc(fmt4(S4.agreeOf, { a: num(x.A), r: num(x.R) })) + (x.D ? '<br><span class="sub">' + esc(fmt4(S4.against, { d: num(x.D) })) + '</span>' : '')), td(esc(P5.lvlName(x.level)) + (x.baseRate != null ? '<br><span class="sub">' + esc(fmt4(S4.baseRate, { b: num(fx(x.baseRate, x.baseRate < 10 ? 1 : 0)) })) + '</span>' : ''))]);
    B.h2(bt('chThemes'), tr('chThemes'));
    B.tbl(th('#') + bth('pStatement') + bth('pAgree') + bth('pLevel'), natal.map(row), { cls: 'dense' });
    if (per.length || R.period) {
      B.h2(esc(tx(S4.periodTitle)), tx(S4.periodTitle));
      if (R.period) B.p('⏳ ' + esc(pn(R.period.md)) + (R.period.ad ? ' – ' + esc(pn(R.period.ad)) : '') + (R.period.next ? ' · ' + esc(fmt4(S4.nextPeriod, { p: pn(R.period.next.lord), d: fmtDate(R.period.next.startISO.slice(0, 10)) })) : ''), 'sub');
      if (per.length) B.tbl(th('#') + bth('pStatement') + bth('pAgree') + bth('pLevel'), per.map((x, i) => row(x, natal.length + i)), { cls: 'dense' });
    }
    B.h2(esc(tx(S4.distinctiveTitle)), tx(S4.distinctiveTitle));
    B.p(esc(tx(S4.distinctiveNote)), 'sub');
    if (R.distinctive.length) B.tbl(bth('pStatement') + bth('pAgree') + bth('pBase'), R.distinctive.map(x => tr0([td(esc(tx(x.statement))), td(esc(fmt4(S4.agreeOf, { a: num(x.A), r: num(x.R) })) + ' · ' + esc(P5.lvlName(x.level))), td(num(fx(x.baseRate, x.baseRate < 10 ? 1 : 0)) + '%', 'num')])), { cls: 'dense' });
    else B.p(esc(tx(S4.noDistinctive)), 'sub');
    // the heading travels inside the first theme block, so it is never left alone at the foot of a page
    R.themes.forEach((x, i) => {
      const sup = (x.supporting || []).slice(0, 6), con = (x.contradicting || []).slice(0, 3);
      const li = f => '<li><b>' + esc(P5.famName(f.family).replace(/&amp;/g, '&')) + ':</b> ' + esc(tx(f.text)) + '</li>';
      B.blk((i ? '' : '<h2>' + bt('pDetail') + '</h2>') + '<div class="pth"><p><b>' + num(i + 1) + '. ' + esc(tx(x.statement)) + '</b> <span class="sub">(' + esc(fmt4(S4.agreeOf, { a: num(x.A), r: num(x.R) })) + ')</span></p>' + (x.explanation ? '<p class="small">' + esc(tx(x.explanation)) + '</p>' : '') +
        '<div class="pthc"><div><p class="small"><b>✓ ' + esc(tx(S4.supporting)) + '</b></p><ul class="small">' + sup.map(li).join('') + '</ul></div><div><p class="small"><b>↔ ' + esc(tx(S4.contradicting)) + '</b></p>' + (con.length ? '<ul class="small">' + con.map(li).join('') + '</ul>' : '<p class="small">' + esc(tx(S4.noContra)) + '</p>') + '</div></div></div>', i ? {} : { toc: { key: 's_pdetail', label: tr('pDetail'), level: 2 } });
    });
    B.p(esc(tx(S4.method)), 'small');
  }
  if (sel.includes('timeline')) {
    const T = P5.timeline(C), areas = P5.tlAreas(T), SR = { strong: 3, clear: 2, moderate: 1 };
    B.chapter('timeline', ++n, 'chTimeline', '🗓️');
    B.p(esc(tx(TL.honesty)), 'note');
    B.p(esc(tx(T.minor ? TL.minorNote : TL.ageGate)), 'sub');
    const tlFig = (svg, cap) => '<figure class="ptl">' + svg + '<figcaption>' + cap + '</figcaption></figure>';
    B.blk(tlFig(P5.tlSvg(T), esc(tx(TL.viewNow))), { keep: true });
    B.blk(tlFig(P5.tlSvg(T, { from: T.birthJd, to: T.birthJd + T.maxAge * 365.25 }), esc(tx(TL.viewLife))), { keep: true });
    const rows = [];
    for (const ar of areas) {
      const ws = T.areas[ar].windows.filter(w => w.to >= T.view.from && w.from <= T.view.to).sort((a, b) => (SR[b.strength] - SR[a.strength]) || (b.avg - a.avg) || (a.from - b.from)).slice(0, 3).sort((a, b) => a.from - b.from);
      if (!ws.length) { rows.push(tr0([td(esc(P5.AR_IC[ar] + ' ' + P5.tlArea(ar))), td('—'), td(''), td(''), td('<span class="sub">' + esc(tx(TL.noWindows)) + '</span>')])); continue; }
      ws.forEach((w, i) => rows.push(tr0([td(i ? '' : esc(P5.AR_IC[ar] + ' ' + P5.tlArea(ar))), td(esc(P5.winText(w))), td(esc(tx(TL.levels[w.strength]))), td(num(w.peak) + ' / ' + num(w.of), 'num'), td('<span class="small">' + w.factors.slice(0, 3).map(f => esc(tx(TL.methods[f.method] && TL.methods[f.method].name)) + ': ' + esc(f.text ? tx(f.text) : '')).join('; ') + '</span>')])));
    }
    B.tbl(bth('areaL') + bth('pWin') + bth('pLevel') + bth('pMeth') + bth('keyFactors'), rows, { cls: 'dense' });
    B.p(Object.keys(TL.methods).map(k => '<b>' + esc(tx(TL.methods[k].name)) + ':</b> ' + esc(tx(TL.methods[k].rule))).join(' '), 'small');
  }
  return n;
}
function systemsChapter(B, C, P3, J, p) {
  const gl3 = k => gl(k);
  // Jaimini
  let Jm; try { Jm = P3.jaimini(C); } catch (e) { Jm = null; }
  if (Jm) {
    const CJ = J.jaimini || {};
    B.h2(bt('jaimini'), tr('jaimini')); gl3('chara_karaka'); gl3('karakamsa'); gl3('arudha'); gl3('argala');
    const kl = Jm.karakas.list || {};
    B.tbl(bth('karaka') + bth('planet') + bth('meaning'), Object.keys(kl).map(k => tr0([td('<b>' + esc(k) + '</b> ' + esc(K.kName(k))), td(pl(kl[k])), td(esc(tx(gg(CJ, 'karakas.' + k + '.signifies'))), 'small')])));
    const ak = gg(CJ, 'atmakarakaPlanet.' + (Jm.karakas.readingIds && Jm.karakas.readingIds.atmakaraka)); if (ak) B.p('<b>AK ' + esc(pn(Jm.karakas.atmakaraka)) + ':</b> ' + esc(tx(ak)), 'reading');
    const kk = Jm.karakamsa || {}, kkr = gg(CJ, 'karakamsaSign.' + kk.readingId);
    B.h3(bt('karakamsa') + ': ' + esc(sgn(kk.sign)));
    if (kkr) B.p(esc(tx(kkr)), 'reading');
    if (Jm.ishtaDevata) { const r = gg(CJ, 'ishtaDevata.' + Jm.ishtaDevata.readingId); B.p('<b>' + esc(tr('ishta')) + ':</b> ' + esc(sgn(Jm.ishtaDevata.sign)) + (Jm.ishtaDevata.planet ? ' · ' + esc(pn(Jm.ishtaDevata.planet)) : '') + (r ? ' — ' + esc(tx(r)) : ''), 'reading'); }
    B.h3(bt('arudhas'));
    B.blk('<div class="c2">' + chartBox(chartSVG(chartModel(C, 'D1'), { ctx: 'print', style: S.style, title: tr('arudhas'), tags: (() => { const t = {}; for (const k in Jm.arudhas) (t[Jm.arudhas[k].sign] = t[Jm.arudhas[k].sign] || []).push(k === 'A1' ? 'AL' : k === 'A12' ? 'UL' : k); return t; })() }), bt('arudhas')) +
      '<div><table class="grid"><thead><tr><th>' + (hi() ? 'पद' : 'Pada') + '</th>' + bth('sign') + bth('lord') + '</tr></thead><tbody>' + Object.keys(Jm.arudhas).map(k => '<tr><td><b>' + k + '</b></td><td>' + esc(sgn(Jm.arudhas[k].sign)) + '</td><td>' + esc(pab(Jm.arudhas[k].lord)) + '</td></tr>').join('') + '</tbody></table><p class="small">UL: ' + esc(sgn(Jm.upapada.sign)) + ' · ' + esc(tr('second')) + ' ' + esc(sgn(Jm.upapada.second ? Jm.upapada.second.sign : 0)) + '</p></div></div>');
    B.tbl(bth('grahaArudhas') + PL9.map(id => th(esc(pab(id)))).join(''), [tr0([td(esc(tr('sign')))].concat(PL9.map(id => td(Jm.grahaArudhas[id] ? esc(sab(Jm.grahaArudhas[id].sign)) : '—'))))], { cls: 'grid' });
    B.tbl(bth('argala') + bth('house') + bth('sign') + th('✓') + th('✗'), (Jm.argala || []).map(a => tr0([td(''), td(num(a.house), 'num'), td(esc(sgn(a.sign))), td(a.argala.filter(x => x.effective).map(x => ord(x.from) + ' ' + x.planets.map(pab).join('')).join(', ') || '—', 'small'), td(a.argala.filter(x => !x.effective).map(x => ord(x.from)).join(', ') || '—', 'small')])), { cls: 'grid' });
    const jy = (Jm.yogas || []).filter(y => y.present);
    if (jy.length) { B.h3(bt('jYogas')); for (const y of jy) { const c = gg(CJ, 'yogas.' + y.id) || {}; B.p('<b>' + esc(nm(c, y.id)) + ':</b> ' + esc(tx(y.reason)) + (c.effect ? ' <span class="sub">' + esc(tx(c.effect)) + '</span>' : ''), 'small'); } }
    B.kv(Object.keys(Jm.sthiraKarakas || {}).map(k => [esc(sthk(k)), pl(Jm.sthiraKarakas[k])]).concat(['brahma', 'rudra', 'maheshwara'].filter(k => Jm[k]).map(k => [esc(nm(gg(CJ, 'concepts.' + k), k)), pl(Jm[k].planet)])));
    if (Jm.longevity && Jm.longevity.result) B.p('<b>' + esc(tr('longevityT')) + ':</b> ' + esc(nm(gg(CJ, 'longevity.' + Jm.longevity.result), Jm.longevity.result)) + ' — ' + esc(tr('longevityNote')), 'small');
  }
  // KP
  let R; try { R = P3.kpOf(C, p); } catch (e) { R = null; }
  if (R) {
    B.h2(bt('kpTitle'), tr('kpTitle')); gl3('cuspal_sub_lord'); gl3('significator_level');
    B.p(esc(tr('kpAyan')) + ': ' + dms(R.ayanamsaValue, true) + ' · ' + esc(String(R.houseSystemUsed)), 'sub');
    B.tbl(bth('house') + bth('cusp') + bth('signLord') + bth('nakLord') + bth('subLord') + bth('subSub'), R.cusps.map(c => tr0([td(num(c.house), 'num'), td(esc(sgn(c.sign)) + ' ' + dms(c.deg, true)), td(esc(pab(c.signLord))), td(esc(pab(c.starLord))), td('<b>' + esc(pab(c.subLord)) + '</b>'), td(esc(pab(c.subSubLord)))])), { cls: 'grid' });
    B.tbl(bth('planet') + bth('sign') + bth('house') + bth('nakLord') + bth('subLord') + th('A') + th('B') + th('C') + th('D') + bth('signifies'), R.planets.map(x => { const lv = x.levels || {}; return tr0([td(pl(x.id)), td(esc(sab(x.sign)) + ' ' + dms(x.lon % 30)), td(num(x.house), 'num'), td(esc(pab(x.starLord))), td(esc(pab(x.subLord))), td(hl(lv.A)), td(hl(lv.B)), td(hl(lv.C)), td(hl(lv.D)), td('<b>' + hl(x.signifies) + '</b>')]); }), { cls: 'grid dense' });
    B.tbl(bth('house') + th('A') + th('B') + th('C') + th('D'), R.houses.map(x => tr0([td(num(x.house), 'num'), td(x.A.map(pab).join(' ') || '—'), td(x.B.map(pab).join(' ') || '—'), td(x.C.map(pab).join(' ') || '—'), td(x.D.map(pab).join(' ') || '—')])), { cls: 'grid dense' });
    const rp = R.rulingPlanets; if (rp) { B.h3(bt('kpRp')); B.p((rp.list || []).map(x => esc(nm(gg(J, 'kp.rulingPlanets.components.' + x.id), x.id)) + ': <b>' + esc(pn(x.planet)) + '</b>').join(' · ') + ' — ' + esc(tr('combined')) + ': ' + plistH(rp.combined), 'small'); }
    B.tbl(bth('question') + bth('cusp') + bth('csl') + bth('fav') + bth('neg') + th(''), (R.events || []).map(e => tr0([td(esc(P3.evName(e.id))), td(num(e.cusp), 'num'), td(esc(pab(e.cuspalSubLord)) + ' / ' + esc(pab(e.starLordOfCsl))), td(hl(e.favourableHits)), td(hl(e.negatingHits)), td(esc(P3.verdictText ? P3.verdictText(e.verdict) : String(e.verdict || '')))])), { cls: 'grid' });
  }
  // Varshaphal (current year)
  let V; const age = Math.max(0, Math.floor((nowJd() - C.meta.jdUT) / 365.2422)); try { V = P3.varsha(C, age); } catch (e) { V = null; }
  if (V) {
    const CT = J.tajika || {}; gl3('varsha_pravesh'); gl3('muntha'); gl3('varsheshwar'); gl3('saham');
    B.h2(bt('varshaTitle') + ' ' + num(V.year), tr('varshaTitle'));
    const M = chartModel(V.chart, 'D1'), tg = {}; tg[V.muntha.sign] = ['Mu'];
    const mr = gg(CT, 'munthaHouse.' + V.muntha.readingId), yl = V.yearLord || {}, ylr = gg(CT, 'yearLordById.' + yl.readingId);
    B.blk('<div class="c2">' + chartBox(chartSVG(M, { ctx: 'print', style: S.style, title: num(V.year), subtitle: sgn(M.asc), tags: tg }), bt('annualChart') + ' · ' + fmtDate(V.solarReturn.iso, true)) + '<div><p class="small"><b>' + bt('muntha') + ':</b> ' + esc(sgn(V.muntha.sign)) + ' · ' + esc(tr('house')) + ' ' + num(V.muntha.house) + ' · ' + pl(V.muntha.lord) + '</p>' + (mr ? '<p class="small">' + esc(tx(mr.text || mr)) + '</p>' : '') + '<p class="small"><b>' + bt('yearLord') + ':</b> ' + pl(yl.planet) + '</p>' + (ylr ? '<p class="small">' + esc(tx(ylr.text || ylr)) + '</p>' : '') + '</div></div>');
    const ty = (V.tajika && V.tajika.yogas) || [];
    if (ty.length) B.tbl(bth('tajYogas') + bth('planets') + bth('meaning'), ty.map(y => { const c = gg(CT, 'yogas.' + y.id) || {}; return tr0([td('<b>' + esc(nm(c, y.id)) + '</b>'), td(plistH(y.planets)), td(esc(tx(c.effect)), 'small')]); }));
    const SH = V.sahams || {};
    B.tbl(bth('sahams') + bth('sign') + bth('lord') + bth('house') + bth('meaning'), Object.keys(SH).map(k => { const c = gg(CT, 'sahams.' + k) || {}; return tr0([td('<b>' + esc(nm(c, k)) + '</b>'), td(esc(sab(SH[k].sign)) + ' ' + dms(SH[k].deg)), td(esc(pab(SH[k].lord))), td(num(SH[k].house), 'num'), td(esc(tx(c.meaning)), 'small')]); }), { cls: 'dense' });
    for (const k of ['mudda', 'patyayini']) { const tree = (V.dashas && V.dashas[k] && V.dashas[k].tree) || []; if (tree.length) { B.h3(bt(k)); B.tbl(bth('lord') + bth('from') + bth('till'), tree.map(nd => '<tr' + (nowFlag(nd.start, nd.end) ? ' class="cur"' : '') + '><td>' + (nd.lord ? (nd.lord === 'La' ? esc(tr('lagna')) : pl(nd.lord)) : esc(sgn(nd.sign))) + '</td><td>' + fmtDate(nd.startISO) + '</td><td>' + fmtDate(nd.endISO) + '</td></tr>'), { cls: 'grid' }); } }
  }
  // Lal Kitab
  let LK; try { LK = P3.lalKitab(C, null); } catch (e) { LK = null; }
  if (LK) {
    const CL = J.lalKitab || {}, houses = {}; for (const q of LK.planets) houses[q.id] = q.house; gl3('lk_teva'); gl3('rin_debt'); gl3('soya_graha'); gl3('upay');
    B.h2(bt('lkTitle'), tr('lkTitle'));
    if (CL.folkNote) B.p(esc(tx(CL.folkNote)), 'note');
    B.blk('<div class="c2">' + chartBox(chartSVG(P3.tevaModel(C, houses), { ctx: 'print', style: S.style, title: 'LK', noAsc: true }), bt('teva')) + '<div><p class="small"><b>' + bt('sleeping') + ':</b> ' + plistH(LK.sleepingPlanets) + ' · ' + esc(tr('houses3')) + ' ' + hl(LK.sleepingHouses) + '</p><p class="small"><b>' + bt('rin') + ':</b> ' + ((LK.rin || []).filter(r => r.present).map(r => esc(nm(gg(CL, 'rin.' + r.id), r.id))).join(', ') || esc(tr('noRin'))) + '</p><p class="small"><b>' + bt('lkVarshphal') + ' ' + num(LK.varshphal ? LK.varshphal.year : '') + ':</b> ' + (LK.varshphal ? PL9.map(id => esc(pab(id)) + ' ' + num(LK.varshphal.houses[id])).join(' · ') : '') + '</p></div></div>');
    for (const q of LK.planets) { const r = gg(CL, 'planetInHouse.' + q.readingId); B.p('<b>' + pl(q.id) + ' · ' + esc(tr('house')) + ' ' + num(q.house) + '</b>' + ((q.status || []).length ? ' <span class="tag">' + (q.status || []).map(s => esc(P3.lkStatus(s))).join(', ') + '</span>' : '') + (r ? ' — ' + esc(tx(r)) : ''), 'small'); }
    for (const r of (LK.rin || []).filter(x => x.present)) { const c = gg(CL, 'rin.' + r.id) || {}; B.p('<b>' + esc(nm(c, r.id)) + ':</b> ' + esc(tx(c.meaning)), 'small'); }
    B.h3((CL.upayLabel ? bo(CL.upayLabel) : bt('remedy')) + ' <span class="sub">(' + esc(hi() ? 'वैकल्पिक, सांस्कृतिक' : 'optional, cultural') + ')</span>');
    if (CL.upayNote) B.p(esc(tx(CL.upayNote)), 'sub');
    for (const q of LK.planets) { const u = gg(CL, 'upay.' + q.remedyId); if (u) B.p('<b>' + esc(pab(q.id)) + ':</b> ' + esc(tx(u)), 'small'); }
  }
}
function dmsLat(v) { return dms(Math.abs(v)) + (v >= 0 ? ' N' : ' S'); }
function dmsLon(v) { return dms(Math.abs(v)) + (v >= 0 ? ' E' : ' W'); }
// vector bar chart (SVG, print-safe; colour + pattern so it reads in black & white)
function barSvg(items, max, line, unit) {
  const W = 640, H = 170, n = items.length, bw = (W - 50) / n;
  let s = '<svg class="pbars" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(unit || '') + '"><line x1="40" y1="' + (H - 24) + '" x2="' + W + '" y2="' + (H - 24) + '" class="ax"/>';
  const Y = v => H - 24 - v / max * (H - 40);
  items.forEach((it, i) => { const x = 44 + i * bw, h = Math.max(0, H - 24 - Y(it.v)); s += '<rect x="' + x.toFixed(1) + '" y="' + Y(it.v).toFixed(1) + '" width="' + (bw * 0.68).toFixed(1) + '" height="' + h.toFixed(1) + '" class="b ' + (it.c || '') + '"/><text x="' + (x + bw * 0.34).toFixed(1) + '" y="' + (H - 9) + '" text-anchor="middle">' + esc(it.l) + '</text><text x="' + (x + bw * 0.34).toFixed(1) + '" y="' + (Y(it.v) - 3).toFixed(1) + '" text-anchor="middle" class="v">' + esc(num(Math.round(it.v * 10) / 10)) + '</text>'; if (it.r != null) s += '<line x1="' + (x - 2).toFixed(1) + '" x2="' + (x + bw * 0.68 + 2).toFixed(1) + '" y1="' + Y(it.r).toFixed(1) + '" y2="' + Y(it.r).toFixed(1) + '" class="req"/>'; });
  if (line != null) s += '<line x1="40" x2="' + W + '" y1="' + Y(line).toFixed(1) + '" y2="' + Y(line).toFixed(1) + '" class="req"/><text x="36" y="' + (Y(line) + 3).toFixed(1) + '" text-anchor="end" class="v">' + num(line) + '</text>';
  return s + '<text x="4" y="12" class="v">' + esc(unit || '') + '</text></svg>';
}
function ssBar(C, per, phn) {
  const b0 = C.meta.jdUT, b1 = b0 + 100 * 365.25, W = 640, X = jd => 10 + Math.max(0, Math.min(1, (jd - b0) / (b1 - b0))) * (W - 20);
  let s = '<svg class="ssb" viewBox="0 0 ' + W + ' 54" role="img" aria-label="' + esc(tr('sadeSati')) + '"><rect x="10" y="8" width="' + (W - 20) + '" height="20" class="bgx"/>';
  for (const q of per) { if (q.end < b0) continue; s += '<rect x="' + X(q.start).toFixed(1) + '" y="8" width="' + Math.max(0.8, X(q.end) - X(q.start)).toFixed(1) + '" height="20" class="ph-' + q.phase + '"><title>' + esc(phn(q.phase)) + '</title></rect>'; }
  for (let a = 0; a <= 100; a += 10) s += '<text x="' + X(b0 + a * 365.25).toFixed(1) + '" y="44" text-anchor="middle">' + num(a) + '</text>';
  const xn = X(nowJd()); s += '<line x1="' + xn.toFixed(1) + '" x2="' + xn.toFixed(1) + '" y1="4" y2="32" class="nowln"/>';
  return s + '</svg><p class="sub">' + ['rising', 'peak', 'setting', 'dhaiya4', 'dhaiya8'].map(ph => '<span class="sw ph-' + ph + '"></span>' + esc(phn(ph))).join('  ') + ' · ' + esc(tr('age')) + '</p>';
}

/* ---------------------------------------------------------------- pagination */
const PAPER = { a4: { w: 210, h: 297 }, letter: { w: 215.9, h: 279.4 } }, MAR = { t: 14, r: 12, b: 16, l: 12 }, PX = 96 / 25.4;
const geo = wide => { const pp = PAPER[PR.paper] || PAPER.a4, W = wide ? pp.h : pp.w, H = wide ? pp.w : pp.h; return { W, H, cw: W - MAR.l - MAR.r, ch: H - MAR.t - MAR.b }; };
function blockHtml(b) { if (b.t === 'tbl') return (b.cap ? '<div class="tcap">' + b.cap + '</div>' : '') + '<table class="' + (b.cls || '') + '"><thead>' + b.head + '</thead><tbody>' + b.rows.join('') + '</tbody></table>'; return b.html; }
function measure(blocks, book) {
  const box = document.createElement('div'); box.className = book.className + ' ksmeasure'; box.setAttribute('aria-hidden', 'true');
  const mk = wide => { const d = document.createElement('div'); d.className = 'pc'; d.style.width = geo(wide).cw + 'mm'; box.appendChild(d); return d; };
  const cP = mk(false), cW = mk(true);
  document.body.appendChild(box);
  const els = blocks.map((b, i) => { if (b.t === 'cover' || b.t === 'toc') return null; const e = document.createElement('div'); e.className = 'b b-' + b.t; e.innerHTML = blockHtml(b); (b.wide ? cW : cP).appendChild(e); return e; });
  blocks.forEach((b, i) => {
    const e = els[i]; if (!e) return;
    b.h = e.getBoundingClientRect().height;
    if (b.t === 'tbl') { const t = e.querySelector('table'), th0 = t.tHead; b.hh = th0 ? th0.getBoundingClientRect().height : 0; b.rh = Array.from(t.tBodies[0].rows).map(r => r.getBoundingClientRect().height); b.extra = b.h - b.hh - b.rh.reduce((a, c) => a + c, 0); }
  });
  box.remove();
}
function paginate(blocks) {
  const pages = [], toc = {};
  let cur = null;
  const open = (wide, ch) => { cur = { wide: !!wide, ch: ch || '', items: [], used: 0, cap: geo(!!wide).ch * PX - 2 }; pages.push(cur); return cur; };
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === 'cover' || b.t === 'toc') { open(false, ''); cur.special = b.t; cur.items.push(b.t === 'cover' ? b.html : ''); cur = null; continue; }
    if (!cur || b.newPage || cur.wide !== !!b.wide) open(!!b.wide, b.ch);
    if (!cur.ch) cur.ch = b.ch;
    // keep headings with what follows (at least the next block's first row or 30 mm)
    if (b.keep && cur.used > 0) { const nx = blocks[i + 1]; const small = x => x && x.t === 'tbl' && x.h <= cur.cap * 0.42, nh = x => !x ? 0 : small(x) ? x.h : x.t === 'tbl' ? x.extra + x.hh + (x.rh[0] || 0) + (x.rh[1] || 0) : Math.min(x.h, 30 * PX); const nx2 = blocks[i + 2]; const need = b.h + nh(nx) + (nx && nx.t === 'blk' && nx.h < 18 * PX && nx2 && !nx2.newPage && !!nx2.wide === cur.wide ? nh(nx2) : 0); if (cur.used + need > cur.cap || (nx && !!nx.wide !== cur.wide)) open(!!(nx ? nx.wide : b.wide), b.ch); }
    if (b.toc) toc[b.toc.key] = { page: pages.length, label: b.toc.label, level: b.toc.level };
    if (b.t === 'tbl' && b.h <= cur.cap * 0.42 && cur.used + b.h > cur.cap && cur.used > 0) open(!!b.wide, b.ch);
    if (b.t === 'tbl') {
      let r = 0, part = 0;
      while (r < b.rh.length) {
        let avail = cur.cap - cur.used;
        const first = b.extra + b.hh + b.rh[r];
        if (first > avail && cur.used > 0) { open(!!b.wide, b.ch); avail = cur.cap; }
        let k = r, hsum = b.extra + b.hh;
        while (k < b.rh.length && (hsum + b.rh[k] <= avail || k === r)) { hsum += b.rh[k]; k++; }
        const capt = part > 0 ? '<div class="tcap contd">… ' + esc(tr('contd')) + '</div>' : (b.cap ? '<div class="tcap">' + b.cap + '</div>' : '');
        cur.items.push('<div class="b b-tbl">' + capt + '<table class="' + (b.cls || '') + '"><thead>' + b.head + '</thead><tbody>' + b.rows.slice(r, k).join('') + '</tbody></table></div>');
        cur.used += hsum + (part > 0 ? 14 : 0); r = k; part++;
        if (r < b.rh.length) open(!!b.wide, b.ch);
      }
      continue;
    }
    let h = b.h;
    if (cur.used + h > cur.cap && cur.used > 0) open(!!b.wide, b.ch);
    if (h > cur.cap) { const f = cur.cap / h; cur.items.push('<div class="b b-' + b.t + ' fit" style="height:' + (cur.cap - 1).toFixed(0) + 'px"><div style="transform:scale(' + f.toFixed(4) + ');transform-origin:0 0;width:' + (100 / f).toFixed(2) + '%">' + b.html + '</div></div>'); h = cur.cap; }
    else cur.items.push('<div class="b b-' + b.t + '">' + b.html + '</div>');
    cur.used += h;
  }
  return { pages, toc };
}
function tocHtml(toc) {
  const keys = Object.keys(toc);
  return '<div class="toc"><h1>' + bt('contents') + '</h1><ol>' + keys.map(k => { const t = toc[k]; return '<li class="l' + t.level + '"><span class="tocl">' + esc(t.label) + '</span><span class="dots"></span><span class="tn">' + num(t.page) + '</span></li>'; }).join('') + '</ol></div>';
}
function pagesHtml(C, pg) {
  const p = K.curP(), total = pg.pages.length;
  const head = esc(p.name || '') + ' · ' + fmtDate(p.date) + (p.time ? ' ' + num(p.time) : '') + ' · ' + esc(K.cityOnly(p.place));
  return pg.pages.map((x, i) => {
    const cls = 'pg' + (x.wide ? ' wide' : '') + (x.special ? ' ' + x.special : '');
    let body = x.special === 'toc' ? tocHtml(pg.toc) : x.items.join('');
    const hf = x.special === 'cover' ? '' : '<header class="ph"><span>' + head + '</span><span>' + esc(tr('appName')) + '</span></header>';
    const ff = x.special === 'cover' ? '' : '<footer class="pf"><span>' + esc(x.ch || tr('contents')) + '</span><span>' + esc(tr('pageOf').replace('{x}', num(i + 1)).replace('{y}', num(total))) + '</span></footer>';
    return '<section class="' + cls + '" aria-label="' + esc(tr('pageOf').replace('{x}', i + 1).replace('{y}', total)) + '">' + hf + '<div class="pc">' + body + '</div>' + ff + '</section>';
  }).join('');
}
// fonts used by the booklet; wait for them so measurement and the PDF never use a fallback face
const FONT_TESTS = ['400 11pt "KS Serif"', '700 11pt "KS Serif"', '400 9pt "KS Sans"', '700 9pt "KS Sans"', '400 12pt "KS Symbols"'];
function fontsReady() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const sample = 'Aa१२ कुंडली ♈☉✓';
  return Promise.all(FONT_TESTS.map(f => document.fonts.load(f, sample).catch(() => null))).then(() => document.fonts.ready).catch(() => null);
}
let BUILD = { key: '', pages: 0, busy: false, tok: 0 };
function bookKey(C) { return JSON.stringify([C.meta.jdUT, S.lang, S.style, S.glyphs, S.ayan, S.node, S.houses, S.eng, PR, K.curP() && K.curP().name]); }
function build(C) {
  const book = $('#ksBook'); if (!book) return Promise.resolve();
  const key = bookKey(C), tok = ++BUILD.tok;
  if (BUILD.key === key && book.dataset.built === key) { fitPreview(); return Promise.resolve(); }
  BUILD.busy = true; setStatus('⏳ ' + tr('pBuilding'));
  const needP3 = chosen().some(c => c === 'systems' || c === 'dashas' || c === 'themes' || c === 'timeline');
  return (needP3 ? K.need('phase3').catch(() => null) : Promise.resolve()).then(fontsReady).then(() => new Promise(r => setTimeout(r, 0))).then(() => {
    if (tok !== BUILD.tok) return;
    const blocks = bookBlocks(C);
    book.className = 'ksbook ' + (PR.bw ? 'bw ' : '') + (PR.paper === 'letter' ? 'letter ' : 'a4 ') + (S.lang === 'hi' ? 'lhi' : 'len');
    measure(blocks, book);
    const pg = paginate(blocks);
    book.innerHTML = pagesHtml(C, pg);
    book.dataset.built = key; BUILD.key = key; BUILD.pages = pg.pages.length; BUILD.busy = false;
    setStatus('📄 ' + num(pg.pages.length) + ' ' + tr('pPages'));
    fitPreview();
    G.KS_PRINT_READY = true; document.documentElement.setAttribute('data-print-ready', '1');
    if (K.PRINT_HOOK) document.title = K.fileBaseFor(K.curP());
  }).catch(e => { console.error(e); BUILD.busy = false; setStatus('⚠️ ' + e.message); });
}
function setStatus(t) { const s = $('#ksStatus'); if (s) s.textContent = t; }
function fitPreview() {
  const wrap = $('#ksPrev'), book = $('#ksBook'); if (!wrap || !book) return;
  if (document.documentElement.classList.contains('ks-printmode')) { book.style.zoom = ''; return; }
  const pw = geo(true).W * PX + 8, w = wrap.clientWidth - 8, z = Math.min(1, w / pw);
  book.style.zoom = z.toFixed(3);
}
function pageStyle() {
  // named pages: portrait and landscape A4 (or Letter), margin 0 — the page boxes carry their own margins
  const pp = PR.paper === 'letter' ? 'letter' : 'A4';
  let st = document.getElementById('ksPageCss'); if (!st) { st = document.createElement('style'); st.id = 'ksPageCss'; document.head.appendChild(st); }
  st.textContent = '@page ksP{size:' + pp + ' portrait;margin:0}@page ksW{size:' + pp + ' landscape;margin:0}' +
    '.ksbook .pg{width:' + geo(false).W + 'mm;height:' + (geo(false).H - 0.3) + 'mm}.ksbook .pg.wide{width:' + geo(true).W + 'mm;height:' + (geo(true).H - 0.3) + 'mm}';
}
K.view('more:print', C => {
  if (K.PRINT_HOOK && !PR.hooked) Object.assign(PR, { preset: K.PRINT_HOOK.preset, bw: K.PRINT_HOOK.bw, bi: K.PRINT_HOOK.bi, paper: K.PRINT_HOOK.paper, hooked: true });
  const sel = chosen();
  let h = '<div class="card noprint pctl"><h2>🖨️ ' + tr('pTitle') + '</h2>' +
    '<div class="row"><span class="lbl">' + tr('preset') + '</span><div class="seg" id="pPreset">' + [['full', tr('pFull')], ['essentials', tr('pEss')], ['custom', tr('pCustom')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (PR.preset === v ? 'on' : '') + '" aria-pressed="' + (PR.preset === v) + '">' + esc(l) + '</button>').join('') + '</div></div>' +
    '<div class="chips" role="group" aria-label="' + tr('preset') + '">' + CHAPTERS.map(([id, k], i) => '<label class="chip' + (sel.includes(id) ? ' on' : '') + '"><input type="checkbox" class="vh" data-pch="' + id + '"' + (sel.includes(id) ? ' checked' : '') + '>' + num(i + 1) + '. ' + esc(tr(k)) + '</label>').join('') + '</div>' +
    '<div class="row"><label class="switch"><input type="checkbox" id="pBw"' + (PR.bw ? ' checked' : '') + '> ' + tr('pBw') + '</label><label class="switch"><input type="checkbox" id="pBi"' + (PR.bi ? ' checked' : '') + '> ' + tr('pBi') + '</label><span class="lbl">' + tr('pPaper') + '</span><div class="seg" id="pPaper">' + [['a4', 'A4'], ['letter', 'Letter']].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (PR.paper === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div></div>' +
    '<div class="row"><button type="button" class="btn primary" data-act4="print">🖨️ ' + tr('pPrint') + '</button><span class="sub" id="ksStatus" role="status">' + (BUILD.pages ? '📄 ' + num(BUILD.pages) + ' ' + tr('pPages') : '') + '</span></div>' +
    '<p class="sub">💡 ' + tr('pTip') + '</p><p class="sub">' + tr('pFile') + ': <code>' + esc(K.fileBaseFor(K.curP())) + '.pdf</code></p></div>';
  h += '<h2 class="noprint pvh">👀 ' + tr('pPreview') + '</h2><div class="ksprev" id="ksPrev"><div class="ksbook" id="ksBook">';
  if (K.IS_NODE) { const bl = bookBlocks(C); h += bl.map(blockHtml).join(''); }
  else h += '<p class="sub" style="padding:20px">⏳ ' + tr('pBuilding') + '</p>';
  h += '</div></div>';
  K.AFTER.push(() => { pageStyle(); BUILD.key = ''; build(C); });
  return h;
});
K.onAfter(kind => { if (kind === 'resize') fitPreview(); });
K.onClick((e, t) => {
  const b = t.closest && t.closest('button'); if (!b) return false;
  if (b.closest('#pPreset')) { PR.preset = b.dataset.v; if (PR.preset === 'custom' && !PR.custom) PR.custom = PRESETS.full.slice(); savePR(); K.rerenderAt(); return true; }
  if (b.closest('#pPaper')) { PR.paper = b.dataset.v; savePR(); K.rerenderAt(); return true; }
  if (b.dataset.act4 === 'print') { printNow(); return true; }
  return false;
});
K.onChange(e => {
  const t = e.target;
  if (t.dataset && t.dataset.pch) { const cur = chosen(); PR.custom = t.checked ? CHAPTERS.map(c => c[0]).filter(c => c === t.dataset.pch || cur.includes(c)) : cur.filter(c => c !== t.dataset.pch); PR.preset = 'custom'; savePR(); K.rerenderAt(); return true; }
  if (t.id === 'pBw') { PR.bw = t.checked; savePR(); K.rerenderAt(); return true; }
  if (t.id === 'pBi') { PR.bi = t.checked; savePR(); K.rerenderAt(); return true; }
  return false;
});
function printNow() {
  const C = K.curChart(); if (!C) return;
  const base = K.fileBaseFor(K.curP());
  build(C).then(() => fontsReady()).then(() => { document.documentElement.classList.add('ks-printing-book'); K.doPrint(base); });
}
if (!K.IS_NODE) { G.addEventListener('beforeprint', () => { if (document.querySelector('#ksBook .pg')) document.documentElement.classList.add('ks-printing-book'); }); G.addEventListener('afterprint', () => document.documentElement.classList.remove('ks-printing-book')); }
K.p4 = { bookBlocks, chosen, PR, CHAPTERS, PRESETS, blockHtml, paginate };
});
})(typeof window !== 'undefined' ? window : globalThis);

;
/* =====================================================================
   Kundli Studio — UI (app.js). Plain JS + SVG + Canvas, no libraries.
   Uses globals: JE (engine.js), JC (content.js), JE_CITIES (cities.js).
   In the built index.html, content.js and cities.js arrive deflate+base64
   packed in KS_PACK and are inflated here by a small pure-JS inflater.
   ===================================================================== */
(function (G) {
'use strict';
const IS_NODE = typeof document === 'undefined';
let JC = G.JC || null, JE_CITIES = G.JE_CITIES || null;
let JE = G.JE || null; // engine.js (+ engine2.js) declare `const JE`; in the built page both arrive packed in KS_PACK.engine and are inflated first thing in boot()

/* ---------------------------------------------------------------------
   1. Raw-DEFLATE inflater (RFC 1951), adapted from the tiny-inflate design
   --------------------------------------------------------------------- */
const Inflate = (() => {
  function Tree() { this.table = new Uint16Array(16); this.trans = new Uint16Array(288); }
  const lenBits = new Uint8Array(30), lenBase = new Uint16Array(30), distBits = new Uint8Array(30), distBase = new Uint16Array(30);
  const clcidx = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  function bitsBase(bits, base, delta, first) {
    for (let i = 0; i < delta; i++) bits[i] = 0;
    for (let i = 0; i < 30 - delta; i++) bits[i + delta] = (i / delta) | 0;
    for (let sum = first, i = 0; i < 30; i++) { base[i] = sum; sum += 1 << bits[i]; }
  }
  bitsBase(lenBits, lenBase, 4, 3); bitsBase(distBits, distBase, 2, 1);
  lenBits[28] = 0; lenBase[28] = 258;
  const offs = new Uint16Array(16);
  function build(t, lengths, off, num) {
    for (let i = 0; i < 16; i++) t.table[i] = 0;
    for (let i = 0; i < num; i++) t.table[lengths[off + i]]++;
    t.table[0] = 0;
    for (let sum = 0, i = 0; i < 16; i++) { offs[i] = sum; sum += t.table[i]; }
    for (let i = 0; i < num; i++) if (lengths[off + i]) t.trans[offs[lengths[off + i]]++] = i;
  }
  const fixL = new Tree(), fixD = new Tree();
  (function () {
    const l = new Uint8Array(288);
    for (let i = 0; i < 144; i++) l[i] = 8; for (let i = 144; i < 256; i++) l[i] = 9; for (let i = 256; i < 280; i++) l[i] = 7; for (let i = 280; i < 288; i++) l[i] = 8;
    build(fixL, l, 0, 288);
    const d = new Uint8Array(30); d.fill(5); build(fixD, d, 0, 30);
  })();
  return function inflate(src, outLen) {
    let si = 0, tag = 0, bc = 0, op = 0;
    let out = new Uint8Array(outLen || src.length * 4 + 1024);
    const grow = n => { if (op + n > out.length) { const o = new Uint8Array(Math.max(out.length * 2, op + n)); o.set(out); out = o; } };
    const getbit = () => { if (!bc--) { tag = src[si++] | 0; bc = 7; } const b = tag & 1; tag >>>= 1; return b; };
    const bits = (num, base) => {
      if (!num) return base;
      while (bc < 24) { tag |= (src[si++] | 0) << bc; bc += 8; }
      const v = tag & (0xffff >>> (16 - num)); tag >>>= num; bc -= num; return v + base;
    };
    const sym = t => {
      while (bc < 24) { tag |= (src[si++] | 0) << bc; bc += 8; }
      let sum = 0, cur = 0, len = 0, tg = tag;
      do { cur = 2 * cur + (tg & 1); tg >>>= 1; ++len; if (len > 15) throw new Error('bad code'); sum += t.table[len]; cur -= t.table[len]; } while (cur >= 0);
      tag = tg; bc -= len; return t.trans[sum + cur];
    };
    const dynL = new Tree(), dynD = new Tree(), code = new Tree(), lengths = new Uint8Array(288 + 32);
    const trees = () => {
      const hlit = bits(5, 257), hdist = bits(5, 1), hclen = bits(4, 4);
      for (let i = 0; i < 19; i++) lengths[i] = 0;
      for (let i = 0; i < hclen; i++) lengths[clcidx[i]] = bits(3, 0);
      build(code, lengths, 0, 19);
      for (let num = 0; num < hlit + hdist;) {
        const s = sym(code);
        if (s === 16) { const prev = lengths[num - 1]; for (let n = bits(2, 3); n; n--) lengths[num++] = prev; }
        else if (s === 17) { for (let n = bits(3, 3); n; n--) lengths[num++] = 0; }
        else if (s === 18) { for (let n = bits(7, 11); n; n--) lengths[num++] = 0; }
        else lengths[num++] = s;
      }
      build(dynL, lengths, 0, hlit); build(dynD, lengths, hlit, hdist);
    };
    const block = (lt, dt) => {
      for (;;) {
        let s = sym(lt);
        if (s === 256) return;
        if (s < 256) { grow(1); out[op++] = s; }
        else {
          s -= 257; const len = bits(lenBits[s], lenBase[s]), ds = sym(dt), from = op - bits(distBits[ds], distBase[ds]);
          if (from < 0) throw new Error('bad distance');
          grow(len); for (let i = from; i < from + len; i++) out[op++] = out[i];
        }
      }
    };
    let final;
    do {
      final = getbit();
      const type = bits(2, 0);
      if (type === 0) {
        while (bc > 8) { si--; bc -= 8; }
        const len = src[si] | (src[si + 1] << 8); si += 4;
        grow(len); for (let i = 0; i < len; i++) out[op++] = src[si++];
        bc = 0; tag = 0;
      } else if (type === 1) block(fixL, fixD);
      else if (type === 2) { trees(); block(dynL, dynD); }
      else throw new Error('bad block type');
      if (si > src.length + 4) throw new Error('truncated');
    } while (!final);
    return op === out.length ? out : out.subarray(0, op);
  };
})();
function b64bytes(s) {
  const bin = (typeof atob === 'function') ? atob(s) : Buffer.from(s, 'base64').toString('binary');
  const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u;
}
function utf8(u) {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(u);
  let s = '', i = 0; const n = u.length, parts = [];
  while (i < n) {
    let c = u[i++];
    if (c >= 0xf0) { c = ((c & 7) << 18) | ((u[i++] & 63) << 12) | ((u[i++] & 63) << 6) | (u[i++] & 63); c -= 0x10000; s += String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 1023)); }
    else if (c >= 0xe0) s += String.fromCharCode(((c & 15) << 12) | ((u[i++] & 63) << 6) | (u[i++] & 63));
    else if (c >= 0xc0) s += String.fromCharCode(((c & 31) << 6) | (u[i++] & 63));
    else s += String.fromCharCode(c);
    if (s.length > 8192) { parts.push(s); s = ''; }
  }
  parts.push(s); return parts.join('');
}
let CITIES_TRIED = false;
const citiesPending = () => !JE_CITIES && !!G.KS_LOADER && !IS_NODE && !BUN_ERR.cities;
function citiesArrived() {
  if (IS_NODE) return;
  $$('input[id$="City"]').forEach(i => { i.disabled = false; });
  $$('.citywait').forEach(b => b.remove());
}
function ensureCities() {
  if (JE_CITIES) return JE_CITIES;
  if (G.JE_CITIES) { JE_CITIES = G.JE_CITIES; return JE_CITIES; }
  if (G.KS_LOADER && !IS_NODE) { if (!BUN.cities && !BUN_ERR.cities) need('cities').then(citiesArrived, () => { $$('.citywait').forEach(b => { b.className = 'banner err'; b.textContent = tr('citiesErr'); }); }); return null; }
  if (CITIES_TRIED) return JE_CITIES;
  CITIES_TRIED = true;
  const PK = G.KS_PACK || {};
  if (PK.cities) { try { JE_CITIES = unpack(PK.cities, 'JE_CITIES'); G.JE_CITIES = JE_CITIES; } catch (e) { console.error('cities unpack failed', e); JE_CITIES = null; } }
  return JE_CITIES;
}
function unpack(p, ret) { const code = utf8(Inflate(b64bytes(p.b64), p.len)); return (new Function(code + '\n;return ' + ret + ';'))(); }

/* ---------------------------------------------------------------------
   2. Small helpers
   --------------------------------------------------------------------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const norm = a => ((a % 360) + 360) % 360;
const PL9 = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'], PL7 = PL9.slice(0, 7), OUTER = ['Ur', 'Ne', 'Pl'];
const DASHA_ORDER = ['Ke', 'Ve', 'Su', 'Mo', 'Ma', 'Ra', 'Ju', 'Sa', 'Me'];
const SIGN_LORD = ['Ma', 'Ve', 'Me', 'Mo', 'Su', 'Me', 'Ve', 'Ma', 'Ju', 'Sa', 'Sa', 'Ju'];
const EXALT = { Su: 0, Mo: 1, Ma: 9, Me: 5, Ju: 3, Ve: 11, Sa: 6, Ra: 1, Ke: 7 };
const OWN = { Su: [4], Mo: [3], Ma: [0, 7], Me: [2, 5], Ju: [8, 11], Ve: [1, 6], Sa: [9, 10] };
const VARGAS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60', 'D81', 'D108', 'D144'];
const nowJd = () => Date.now() / 86400000 + 2440587.5;
const jdOfDate = d => d.getTime() / 86400000 + 2440587.5;
const DAY_MS = 86400000;
// rAF with a timeout fallback (rAF is paused in hidden/background panes)
function raf1(fn) { let done = false; const go = () => { if (!done) { done = true; fn(performance.now()); } }; if (typeof requestAnimationFrame === 'function') requestAnimationFrame(go); setTimeout(go, 120); }

/* ---------------------------------------------------------------------
   3. Bilingual UI dictionary: TX key → [English, हिंदी]; T = {en:{}, hi:{}}
   --------------------------------------------------------------------- */
const TX = {
  appName: ['Kundli Studio', 'कुंडली स्टूडियो'], tagline: ['Vedic birth chart workbench · offline', 'वैदिक जन्म-कुंडली कार्यशाला · ऑफ़लाइन'],
  langBtn: ['हिंदी', 'English'], options: ['Options', 'विकल्प'], skip: ['Skip to content', 'मुख्य भाग पर जाएँ'],
  language: ['Language', 'भाषा'], theme: ['Theme', 'थीम'], light: ['Day', 'दिन'], dark: ['Night', 'रात'], auto: ['Auto', 'स्वतः'],
  ayanamsa: ['Ayanamsa', 'अयनांश'], node: ['Rahu/Ketu', 'राहु/केतु'], mean: ['Mean', 'माध्य'], true: ['True', 'स्पष्ट'],
  houses: ['House system', 'भाव पद्धति'], whole: ['Whole sign', 'पूर्ण राशि'], sripati: ['Sripati', 'श्रीपति'], placidus: ['Placidus', 'प्लेसिडस'], equal: ['Equal', 'समान भाव'],
  chartStyle: ['Chart style', 'कुंडली शैली'], north: ['North', 'उत्तर'], south: ['South', 'दक्षिण'], east: ['East', 'पूर्व'], western: ['Wheel', 'चक्र'],
  devnum: ['Devanagari numerals (१२३)', 'देवनागरी अंक (१२३)'], elder: ['Elder mode (large text)', 'बड़े अक्षर (बुज़ुर्ग मोड)'], outerOpt: ['Show Uranus, Neptune, Pluto', 'यूरेनस, नेप्च्यून, प्लूटो दिखाएँ'],
  resetSettings: ['Reset settings', 'सेटिंग रीसेट'], wipe: ['Wipe all data', 'सारा डेटा मिटाएँ'], wipeQ: ['Delete ALL saved people and settings from this browser? This cannot be undone.', 'इस ब्राउज़र से सभी सहेजे लोग और सेटिंग मिटाएँ? यह वापस नहीं होगा।'],
  wiped: ['All data wiped', 'सारा डेटा मिटा दिया'], reset: ['Settings reset', 'सेटिंग रीसेट हुईं'],
  // nav
  people: ['People', 'लोग'], kundli: ['Kundli', 'कुंडली'], dasha: ['Dasha', 'दशा'], insights: ['Insights', 'विश्लेषण'], more: ['Plan & more', 'योजना व अन्य'],
  chart: ['Chart', 'चार्ट'], themes: ['Strongest themes', 'प्रबल विषय'], timeline: ['Life timeline', 'जीवन समयरेखा'], similar: ['Similar charts', 'मिलती कुंडलियाँ'], proof: ['Proof cases', 'प्रमाण उदाहरण'], thLoadingC: ['Finding the strongest themes…', 'सबसे प्रबल विषय खोजे जा रहे हैं…'], planets: ['Planets', 'ग्रह'], vargas: ['Vargas', 'वर्ग'], details: ['Details', 'विवरण'], jaimini: ['Jaimini', 'जैमिनी'],
  vim: ['Vimshottari', 'विंशोत्तरी'], yogini: ['Yogini', 'योगिनी'], ashtottari: ['Ashtottari', 'अष्टोत्तरी'], chara: ['Chara', 'चर'],
  yogas: ['Yogas', 'योग'], doshas: ['Doshas', 'दोष'], transits: ['Transits', 'गोचर'], strength: ['Strength', 'बल'],
  sky: ['Sky', 'आकाश'], learn: ['Learn', 'सीखें'], settings: ['Settings & tests', 'सेटिंग व जाँच'], print: ['Print', 'प्रिंट'],
  grpChart: ['Chart', 'कुंडली'], grpTime: ['Time', 'समय'], grpInsight: ['Insights', 'विश्लेषण'], grpMore: ['Explore', 'खोजें'],
  // people
  noPeople: ['No one saved yet', 'अभी कोई सहेजा नहीं गया'], noPeopleP: ['Add a person with date, time and place of birth. Everything stays in this browser — nothing is uploaded.', 'जन्म की तारीख, समय और स्थान के साथ व्यक्ति जोड़ें। सब कुछ इसी ब्राउज़र में रहता है — कुछ भी अपलोड नहीं होता।'],
  addPerson: ['Add person', 'व्यक्ति जोड़ें'], editPerson: ['Edit person', 'व्यक्ति बदलें'], trySample: ['Try a sample chart', 'नमूना कुंडली देखें'],
  name: ['Name', 'नाम'], gender: ['Gender', 'लिंग'], male: ['Male', 'पुरुष'], female: ['Female', 'स्त्री'], other: ['Other / skip', 'अन्य / छोड़ें'],
  dob: ['Date of birth', 'जन्म तिथि'], tob: ['Time of birth', 'जन्म समय'], timeUnknown: ['Time unknown', 'समय अज्ञात'], seconds: ['Seconds (optional)', 'सेकंड (वैकल्पिक)'],
  place: ['Place of birth', 'जन्म स्थान'], cityPh: ['Type a city or town (e.g. Delhi, Bombay, प्रयागराज)', 'शहर या कस्बा लिखें (जैसे दिल्ली, Bombay, Prayagraj)'],
  manual: ['Enter latitude / longitude manually', 'अक्षांश / देशांतर स्वयं भरें'], lat: ['Latitude (°N +, °S −)', 'अक्षांश (उत्तर +, दक्षिण −)'], lon: ['Longitude (°E +, °W −)', 'देशांतर (पूर्व +, पश्चिम −)'],
  tzOff: ['UTC offset (hours, e.g. 5.5)', 'UTC अंतर (घंटे, जैसे 5.5)'], placeName: ['Place name', 'स्थान का नाम'], inIndia: ['Place is in India (apply historical Indian time rules)', 'स्थान भारत में है (ऐतिहासिक भारतीय समय नियम लागू करें)'],
  group: ['Family group', 'परिवार समूह'], groupPh: ['e.g. Family, Friends', 'जैसे परिवार, मित्र'], notes: ['Notes', 'टिप्पणी'],
  save: ['Save', 'सहेजें'], cancel: ['Cancel', 'रद्द करें'], del: ['Delete', 'हटाएँ'], edit: ['Edit', 'बदलें'], open: ['Open', 'खोलें'], dup: ['Duplicate', 'प्रतिलिपि'], share: ['Share link', 'साझा लिंक'],
  delQ: ['Delete this person?', 'इस व्यक्ति को हटाएँ?'], saved: ['Saved', 'सहेजा गया'], deleted: ['Deleted', 'हटाया गया'],
  needName: ['Please enter a name.', 'कृपया नाम लिखें।'], needDate: ['Please enter a valid date (year 1800–2100).', 'कृपया सही तारीख लिखें (वर्ष 1800–2100)।'], needTime: ['Please enter the time or tick “time unknown”.', 'कृपया समय लिखें या “समय अज्ञात” चुनें।'],
  needPlace: ['Please pick a place from the list or enter latitude and longitude.', 'कृपया सूची से स्थान चुनें या अक्षांश-देशांतर भरें।'],
  timeRule: ['Clock time used', 'प्रयुक्त घड़ी-समय'], offsetUsed: ['Offset used', 'प्रयुक्त अंतर'], why: ['Why', 'क्यों'], alternatives: ['Alternatives — pick if the time was noted differently', 'विकल्प — यदि समय अलग घड़ी से लिखा गया था तो चुनें'],
  useAuto: ['Use automatic rule', 'स्वचालित नियम'], chosen: ['chosen', 'चुना गया'],
  exportJson: ['Export JSON', 'JSON निर्यात'], importJson: ['Import JSON', 'JSON आयात'], imported: ['Imported', 'आयात हुआ'], importBad: ['That file could not be read as Kundli Studio data.', 'यह फ़ाइल कुंडली स्टूडियो डेटा के रूप में पढ़ी नहीं जा सकी।'],
  shareTitle: ['Share link (data stays in the link)', 'साझा लिंक (डेटा केवल लिंक में)'], shareNote: ['Everything after # stays in the browser and is never sent to a server. Anyone with the link can see these birth details.', '# के बाद का भाग ब्राउज़र में ही रहता है और किसी सर्वर पर नहीं जाता। लिंक वाला कोई भी ये जन्म-विवरण देख सकता है।'],
  copied: ['Copied', 'कॉपी हुआ'], copy: ['Copy', 'कॉपी'], sharedIn: ['Someone shared a birth profile with you', 'किसी ने आपके साथ जन्म-विवरण साझा किया'], addIt: ['Add to my people', 'मेरे लोगों में जोड़ें'], ignore: ['Ignore', 'अनदेखा करें'],
  all: ['All', 'सभी'], search: ['Search', 'खोजें'], current: ['current', 'वर्तमान'], viewing: ['Viewing', 'देख रहे हैं'],
  privacy: ['Private by design: no account, no tracking, no network after the page loads.', 'निजता: कोई खाता नहीं, कोई ट्रैकिंग नहीं, पेज खुलने के बाद कोई नेटवर्क नहीं।'],
  // chart
  lagna: ['Lagna', 'लग्न'], asc: ['Ascendant', 'लग्न'], house: ['House', 'भाव'], sign: ['Sign', 'राशि'], degree: ['Degree', 'अंश'], nakshatra: ['Nakshatra', 'नक्षत्र'], pada: ['Pada', 'पाद'],
  nakLord: ['Star lord', 'नक्षत्र स्वामी'], subLord: ['Sub lord', 'उप स्वामी'], subSub: ['Sub-sub', 'उप-उप'], dignity: ['Dignity', 'स्थिति'], retro: ['Retrograde', 'वक्री'], combust: ['Combust', 'अस्त'],
  speed: ['Speed °/day', 'गति °/दिन'], karaka: ['Karaka', 'कारक'], chalit: ['Chalit', 'चलित'], lord: ['Lord', 'स्वामी'], planet: ['Planet', 'ग्रह'],
  moonChart: ['Moon chart', 'चंद्र कुंडली'], chalitChart: ['Bhava chalit', 'भाव चलित'], rashiChart: ['Rashi (D1)', 'राशि (D1)'], navamsa: ['Navamsa (D9)', 'नवांश (D9)'],
  tapHint: ['Tap a planet, house or sign for details. Arrow keys move between them.', 'विवरण के लिए ग्रह, भाव या राशि पर टैप करें। तीर-कुंजियों से आगे-पीछे जाएँ।'],
  legend: ['℞ retrograde · ↑ exalted · ↓ debilitated · c combust', '℞ वक्री · ↑ उच्च · ↓ नीच · c अस्त'],
  zoomIn: ['Zoom in', 'बड़ा करें'], zoomOut: ['Zoom out', 'छोटा करें'], zoomReset: ['Reset zoom', 'ज़ूम रीसेट'],
  scrubber: ['Time scrubber', 'समय स्लाइडर'], scrubHelp: ['Slide or step through time and watch the chart change. Marks show when the lagna (saffron), navamsa lagna (indigo), dasamsa lagna (green) or Moon nakshatra (grey) change within ±2 hours.', 'समय आगे-पीछे करें और कुंडली बदलते देखें। निशान दिखाते हैं कि ±2 घंटे में लग्न (केसरिया), नवांश लग्न (नीला), दशमांश लग्न (हरा) या चंद्र नक्षत्र (स्लेटी) कब बदलते हैं।'],
  play: ['Play', 'चलाएँ'], pause: ['Pause', 'रोकें'], resetBirth: ['Back to birth time', 'जन्म-समय पर लौटें'], useThis: ['Use this time', 'यह समय अपनाएँ'],
  stable: ['Lagna stays the same from', 'लग्न इस समय तक एक ही रहता है:'], to: ['to', 'से'], noChange2h: ['no change within 2 hours', '2 घंटे में कोई बदलाव नहीं'],
  scrubbed: ['Exploring a different time — not saved', 'दूसरा समय देख रहे हैं — सहेजा नहीं गया'], minFromBirth: ['min from birth', 'मिनट जन्म से'],
  d9asc: ['D9 lagna', 'D9 लग्न'], d10asc: ['D10 lagna', 'D10 लग्न'], moonNak: ['Moon nakshatra', 'चंद्र नक्षत्र'], moonPada: ['Moon pada', 'चंद्र पाद'],
  lagnaReading: ['Your lagna', 'आपका लग्न'], moonReading: ['Your Moon sign', 'आपकी चंद्र राशि'], nakReading: ['Your birth nakshatra', 'आपका जन्म नक्षत्र'],
  placement: ['Placement', 'स्थिति का अर्थ'], inSign: ['in', 'में'], rules: ['Rules houses', 'भावों का स्वामी'], aspectsGiven: ['Aspects (drishti) given', 'दी गई दृष्टि'], aspectsRecv: ['Aspects received', 'प्राप्त दृष्टि'],
  noneP: ['none', 'कोई नहीं'], yogasInv: ['Yogas involving it', 'इससे जुड़े योग'], dashasRules: ['Dasha periods it rules', 'इसकी दशाएँ'], avasthas: ['Avasthas (states)', 'अवस्थाएँ'],
  remedy: ['Optional cultural practices', 'वैकल्पिक सांस्कृतिक उपाय'], occupants: ['Planets here', 'यहाँ ग्रह'], houseLord: ['House lord', 'भावेश'], placedIn: ['placed in house', 'भाव में स्थित'],
  bindus: ['SAV bindus', 'सर्वाष्टक बिंदु'], bhavaBala: ['Bhava bala', 'भाव बल'], keywords: ['Keywords', 'मुख्य शब्द'], karakatwa: ['Signifies', 'कारकत्व'],
  vargottama: ['Vargottama', 'वर्गोत्तम'], timeUnknownBanner: ['Birth time unknown: the Moon chart (Chandra lagna) is shown first. Lagna, houses, fast vargas, dasha balance and time-based strengths are approximate.', 'जन्म-समय अज्ञात: पहले चंद्र कुंडली दिखाई गई है। लग्न, भाव, सूक्ष्म वर्ग, दशा-शेष और समय-आधारित बल अनुमानित हैं।'],
  moonChanges: ['During that day the Moon moves from', 'उस दिन चंद्रमा बदलता है:'], moonSteady: ['The Moon stays in the same sign and nakshatra all day.', 'पूरे दिन चंद्रमा एक ही राशि और नक्षत्र में रहता है।'],
  planetTable: ['Planet positions', 'ग्रह स्थिति'], tableHint: ['Tap a row for details. The table scrolls sideways on small screens.', 'विवरण के लिए पंक्ति पर टैप करें। छोटी स्क्रीन पर तालिका दाएँ-बाएँ खिसकती है।'],
  baladi: ['Baladi', 'बालादि'], jagradadi: ['Jagradadi', 'जाग्रदादि'], deeptadi: ['Deeptadi', 'दीप्तादि'], lajjitadi: ['Lajjitadi', 'लज्जितादि'],
  panchangBirth: ['Panchang at birth', 'जन्म का पंचांग'], avakhada: ['Avakhada chakra', 'अवकहड़ा चक्र'], naamAkshar: ['Naam akshar (name syllables)', 'नाम अक्षर'],
  specialLagnas: ['Special lagnas', 'विशेष लग्न'], upagrahas: ['Upagrahas', 'उपग्रह'], bhavaChalitT: ['Bhava chalit (Sripati)', 'भाव चलित (श्रीपति)'],
  tithi: ['Tithi', 'तिथि'], paksha: ['Paksha', 'पक्ष'], vara: ['Vara', 'वार'], yoga: ['Yoga', 'योग'], karana: ['Karana', 'करण'], sunrise: ['Sunrise', 'सूर्योदय'], sunset: ['Sunset', 'सूर्यास्त'], moonrise: ['Moonrise', 'चंद्रोदय'], moonset: ['Moonset', 'चंद्रास्त'],
  ends: ['ends', 'समाप्त'], dayBirth: ['Day birth', 'दिन का जन्म'], nightBirth: ['Night birth', 'रात का जन्म'],
  cusp: ['Cusp (mid)', 'भाव मध्य'], start: ['Start', 'आरंभ'], end: ['End', 'अंत'], rashiHouse: ['Rashi house', 'राशि भाव'], chalitHouse: ['Chalit house', 'चलित भाव'], shifted: ['shifted', 'खिसका'],
  karakas7: ['Chara karakas (7)', 'चर कारक (7)'], karakas8: ['Chara karakas (8, with Rahu)', 'चर कारक (8, राहु सहित)'], arudhas: ['Arudha padas', 'आरूढ़ पद'], upapada: ['Upapada (UL)', 'उपपद (UL)'], arudhaLagna: ['Arudha lagna (AL)', 'आरूढ़ लग्न (AL)'],
  rashiDrishti: ['Rashi drishti (sign aspects)', 'राशि दृष्टि'], argala: ['Argala (interventions)', 'अर्गला'], effective: ['effective', 'प्रभावी'], obstructed: ['obstructed', 'बाधित'], aspectsSigns: ['aspects signs', 'इन राशियों पर दृष्टि'],
  // vargas
  vargaGrid: ['All 23 divisional charts', 'सभी 23 वर्ग कुंडलियाँ'], compare: ['Compare', 'तुलना'], compareMode: ['Compare two charts', 'दो कुंडलियों की तुलना'], acrossV: ['Planet across all vargas', 'सभी वर्गों में ग्रह'],
  vimsopaka: ['Vimsopaka bala (out of 20)', 'विंशोपक बल (20 में से)'], shadvarga: ['Shadvarga', 'षड्वर्ग'], saptavarga: ['Saptavarga', 'सप्तवर्ग'], dashavarga: ['Dashavarga', 'दशवर्ग'], shodashavarga: ['Shodashavarga', 'षोडशवर्ग'],
  method: ['Method', 'विधि'], purpose: ['Purpose', 'उद्देश्य'], howRead: ['How to read', 'कैसे पढ़ें'], nearBoundary: ['Near a varga boundary (within 1′)', 'वर्ग सीमा के पास (1′ के भीतर)'], sameSign: ['same sign in both', 'दोनों में एक राशि'],
  // dasha
  mahadasha: ['Mahadasha', 'महादशा'], antardasha: ['Antardasha', 'अंतर्दशा'], pratyantar: ['Pratyantar', 'प्रत्यंतर'], sookshma: ['Sookshma', 'सूक्ष्म'], prana: ['Prana', 'प्राण'],
  youAreHere: ['You are here', 'आप यहाँ हैं'], now: ['Now', 'अभी'], life: ['Whole life', 'पूरा जीवन'], age: ['Age', 'आयु'], years: ['years', 'वर्ष'], yr: ['y', 'व'], mo: ['m', 'मा'], dy: ['d', 'दि'],
  balance: ['Balance at birth', 'जन्म के समय शेष'], currentPeriods: ['Running now', 'अभी चल रही दशा'], tlHelp: ['Drag to pan, scroll or pinch to zoom, tap a block to drill down.', 'खिसकाने के लिए खींचें, ज़ूम के लिए स्क्रॉल या पिंच करें, अंदर जाने के लिए खंड पर टैप करें।'],
  periodList: ['Period list', 'दशा सूची'], applicable: ['Applicability', 'प्रयोज्यता'], applies: ['traditionally applicable to this chart', 'इस कुंडली पर परंपरागत रूप से लागू'], notApplies: ['not traditionally indicated for this chart (shown for study)', 'इस कुंडली के लिए परंपरागत रूप से संकेतित नहीं (अध्ययन के लिए)'],
  duration: ['Duration', 'अवधि'], from: ['From', 'से'], till: ['till', 'तक'], good: ['Supportive side', 'सहायक पक्ष'], challenging: ['Needs care', 'सावधानी'], tip: ['Tip', 'सुझाव'], inYourChart: ['In your chart', 'आपकी कुंडली में'],
  // insights
  present: ['Present', 'बनते हैं'], absent: ['Not formed', 'नहीं बनते'], cancelled: ['Cancelled / weakened', 'भंग / कमज़ोर'], category: ['Category', 'श्रेणी'], showOnChart: ['Show on chart', 'कुंडली पर दिखाएँ'],
  rule: ['Rule', 'नियम'], effect: ['Traditional effect', 'परंपरागत फल'], source: ['Source', 'स्रोत'], whyHere: ['Why (this chart)', 'क्यों (इस कुंडली में)'], strong: ['strong', 'प्रबल'], medium: ['medium', 'मध्यम'], weak: ['weak', 'हल्का'],
  found: ['found', 'मिले'], of: ['of', 'में से'], manglik: ['Manglik (Kuja) dosha', 'मांगलिक दोष'], fromLagna: ['From lagna', 'लग्न से'], fromMoon: ['From Moon', 'चंद्र से'], fromVenus: ['From Venus', 'शुक्र से'],
  yes: ['Yes', 'हाँ'], no: ['No', 'नहीं'], level: ['Level', 'स्तर'], cancellations: ['Cancellation rules checked', 'भंग नियम जाँचे गए'], appliesY: ['applies', 'लागू'], appliesN: ['does not apply', 'लागू नहीं'],
  kaalSarp: ['Kaal Sarp', 'काल सर्प'], partial: ['Partial (not full) pattern', 'आंशिक (पूर्ण नहीं)'], full: ['Full pattern', 'पूर्ण'], outsideAxis: ['Outside the axis', 'अक्ष के बाहर'], caveat: ['Caveat', 'सावधानी'],
  kemadruma: ['Kemadruma', 'केमद्रुम'], otherDoshas: ['Other traditional checks', 'अन्य परंपरागत जाँच'], whatIs: ['What it is', 'यह क्या है'], computedHow: ['How the app checks', 'ऐप कैसे जाँचता है'], traditional: ['Traditional view', 'परंपरागत मत'], balanced: ['Balanced view', 'संतुलित दृष्टि'],
  gochar: ['Gochar (transits) over your chart', 'आपकी कुंडली पर गोचर'], transitDate: ['Transit date', 'गोचर तिथि'], today: ['Today', 'आज'], overlay: ['Natal + transit', 'जन्म + गोचर'], transitOnly: ['Transit only', 'केवल गोचर'],
  fromMoonH: ['From Moon', 'चंद्र से'], fromLagnaH: ['From lagna', 'लग्न से'], bavB: ['Own BAV', 'स्वयं BAV'], sadeSati: ['Sade Sati & Dhaiya', 'साढ़ेसाती व ढैया'], ingresses: ['Upcoming sign changes', 'आगामी राशि परिवर्तन'],
  enters: ['enters', 'प्रवेश'], turnsRetro: ['turns retrograde', 'वक्री होगा'], turnsDirect: ['turns direct', 'मार्गी होगा'], inSadeSati: ['Saturn is now in Sade Sati position from your Moon', 'शनि अभी आपके चंद्र से साढ़ेसाती स्थिति में है'], inDhaiya: ['Saturn is now in Dhaiya position from your Moon', 'शनि अभी आपके चंद्र से ढैया स्थिति में है'], noSS: ['Saturn is not in Sade Sati or Dhaiya position now', 'शनि अभी साढ़ेसाती या ढैया स्थिति में नहीं है'],
  ashtakavarga: ['Ashtakavarga', 'अष्टकवर्ग'], shadbala: ['Shadbala', 'षड्बल'], bhavabala: ['Bhava bala', 'भाव बल'], raw: ['Raw', 'मूल'], trikona: ['Trikona shodhana', 'त्रिकोण शोधन'], ekadhipatya: ['Ekadhipatya', 'एकाधिपत्य'],
  bySign: ['by sign', 'राशि अनुसार'], byHouse: ['by house', 'भाव अनुसार'], prastara: ['Prastara (who gave each bindu)', 'प्रस्तार (किसने बिंदु दिया)'], contributors: ['Contributors', 'योगदान'], total: ['Total', 'कुल'],
  shodhya: ['Shodhya pinda', 'शोध्य पिंड'], rupas: ['Rupas', 'रूप'], required: ['Required', 'आवश्यक'], ratio: ['Ratio', 'अनुपात'], rank: ['Rank', 'क्रम'], ishta: ['Ishta', 'इष्ट'], kashta: ['Kashta', 'कष्ट'],
  components: ['Components (shashtiamsas)', 'घटक (षष्ट्यंश)'], radar: ['Six-strength profile', 'छह बलों की रूपरेखा'], tapCell: ['Tap a cell to see who contributed.', 'योगदान देखने के लिए खाने पर टैप करें।'],
  // sky
  skyTitle: ['Sky now — sidereal zodiac', 'अभी का आकाश — निरयण राशि चक्र'], geo: ['Geocentric distance', 'पृथ्वी से दूरी'], rings: ['Rings', 'वलय'], trails: ['Trails', 'पथ'], speedL: ['Speed', 'गति'],
  perSec: ['per second', 'प्रति सेकंड'], day1: ['1 day', '1 दिन'], week1: ['1 week', '1 सप्ताह'], month1: ['1 month', '1 माह'], skyHelp: ['Planets are drawn around the Earth at their sidereal longitudes. In the distance view, retrograde loops appear as the Earth overtakes them. Tap a planet.', 'ग्रह पृथ्वी के चारों ओर अपने निरयण देशांतर पर दिखते हैं। दूरी वाले दृश्य में, पृथ्वी के आगे निकलने पर वक्री फंदे दिखते हैं। किसी ग्रह पर टैप करें।'],
  natalRing: ['Show natal positions', 'जन्म स्थिति दिखाएँ'],
  // learn
  tourShort: ['Tour', 'टूर'],
  tour: ['Read your kundli in 10 steps', '10 चरणों में अपनी कुंडली पढ़ें'], next: ['Next', 'आगे'], prev: ['Back', 'पीछे'], openScreen: ['Open this screen', 'यह स्क्रीन खोलें'],
  glossary: ['Glossary', 'शब्दकोश'], glossPh: ['Search terms in English or Hindi', 'अंग्रेज़ी या हिंदी में शब्द खोजें'], quiz: ['Quick quiz', 'छोटी प्रश्नोत्तरी'], newQuiz: ['New questions', 'नए प्रश्न'], score: ['Score', 'अंक'], right: ['Right!', 'सही!'], wrong: ['Not quite — the answer is', 'नहीं — सही उत्तर है'],
  openGloss: ['Open in glossary', 'शब्दकोश में खोलें'],
  // settings
  provenance: ['How this chart was calculated', 'यह कुंडली कैसे गणना हुई'], deltaT: ['ΔT (TT−UT)', 'ΔT (TT−UT)'], engine: ['Engine', 'इंजन'], localTime: ['Local time', 'स्थानीय समय'], utc: ['UTC', 'UTC'],
  whatChanged: ['What changes with other conventions?', 'दूसरी पद्धतियों से क्या बदलता है?'], compareA: ['Compare with', 'इससे तुलना'], changedN: ['changed', 'बदले'], unchanged: ['nothing changed', 'कुछ नहीं बदला'], dashaShift: ['Dasha dates shift by', 'दशा तिथियाँ खिसकीं'], days: ['days', 'दिन'],
  vargaChanges: ['Varga placements that change', 'बदलने वाली वर्ग स्थितियाँ'], yogaChanges: ['Yogas gained / lost', 'योग जुड़े / हटे'], selfTest: ['Self-test against reference values', 'संदर्भ मानों से स्व-जाँच'], runTest: ['Run self-test', 'जाँच चलाएँ'],
  passed: ['passed', 'सफल'], case: ['Case', 'मामला'], field: ['Field', 'मान'], ours: ['Ours', 'हमारा'], ref: ['Reference', 'संदर्भ'], diff: ['Difference', 'अंतर'], pass: ['Pass', 'सफल'],
  dataPrivacy: ['Your data', 'आपका डेटा'], about: ['About & sources', 'परिचय व स्रोत'], changeNote: ['Settings changed', 'सेटिंग बदलीं'], seeChanges: ['See what changed', 'क्या बदला देखें'], dismiss: ['Dismiss', 'हटाएँ'],
  // print
  printTitle: ['Kundli booklet (A4)', 'कुंडली पुस्तिका (A4)'], printBtn: ['Print / Save as PDF', 'प्रिंट / PDF सहेजें'], printHelp: ['Opens the browser print dialog. Choose “Save as PDF” to keep a copy. Pick the sections to include:', 'ब्राउज़र का प्रिंट विंडो खुलेगा। प्रति रखने के लिए “PDF के रूप में सहेजें” चुनें। शामिल करने के भाग चुनें:'],
  cover: ['Cover', 'मुखपृष्ठ'], readings: ['Readings', 'फलादेश'], preparedOn: ['Prepared on', 'तैयार'], booklet: ['Kundli', 'कुंडली'],
  pickPerson: ['Pick or add a person first.', 'पहले किसी व्यक्ति को चुनें या जोड़ें।'], goPeople: ['Go to People', 'लोग पर जाएँ'],
  contentErr: ['Some texts could not be unpacked, so readings are hidden. Charts and calculations still work. Try reloading the page.', 'कुछ पाठ खुल नहीं सके, इसलिए फलादेश छिपे हैं। कुंडली और गणनाएँ काम कर रही हैं। पेज फिर से लोड करें।'],
  citiesErr: ['The offline city list could not be unpacked. Enter latitude, longitude and offset manually.', 'ऑफ़लाइन शहर-सूची खुल नहीं सकी। अक्षांश, देशांतर और समय-अंतर स्वयं भरें।'],
  chartErr: ['This chart could not be calculated', 'यह कुंडली गणना नहीं हो सकी'], close: ['Close', 'बंद करें'], loading: ['Calculating…', 'गणना हो रही है…'],
  beforeBirth: ['before birth', 'जन्म से पहले'],
  // ---- Phase 2: navigation
  list: ['People', 'लोग'], family: ['Family', 'परिवार'], match: ['Match', 'मिलान'], muhurta: ['Muhurta', 'मुहूर्त'], calendar: ['Calendar', 'कैलेंडर'], grpPeople: ['People', 'लोग'],
  // match
  matchTitle: ['Kundli matching', 'कुंडली मिलान'], personA: ['First person', 'पहला व्यक्ति'], personB: ['Second person', 'दूसरा व्यक्ति'], swap: ['Swap', 'अदला-बदली'], quickAdd: ['Quick add', 'तुरंत जोड़ें'],
  system: ['System', 'पद्धति'], sysNorth: ['North · Ashtakoota', 'उत्तर · अष्टकूट'], sysSouth: ['South · Porutham', 'दक्षिण · पोरुत्तम'], sysBoth: ['Both', 'दोनों'],
  ashtakoota: ['Ashtakoota (36 gunas)', 'अष्टकूट (36 गुण)'], porutham: ['Dashakoota / Porutham (10)', 'दशकूट / पोरुत्तम (10)'], gunas: ['gunas', 'गुण'], adjusted: ['Adjusted', 'समायोजित'], rawScore: ['Raw', 'मूल'],
  pariharas: ['Pariharas (traditional exceptions)', 'परिहार (परंपरागत अपवाद)'], relevantH: ['Relevant to this match', 'इस मिलान से संबंधित'], otherRules: ['Other exceptions checked (not needed here)', 'अन्य जाँचे गए अपवाद (यहाँ आवश्यक नहीं)'],
  critical: ['critical', 'महत्वपूर्ण'], agrees: ['agrees', 'मेल'], notAgree: ['does not agree', 'मेल नहीं'], partly: ['partly', 'आंशिक'], dosha: ['dosha', 'दोष'],
  manglikCmp: ['Manglik comparison', 'मांगलिक तुलना'], extrasT: ['More traditional checks', 'अन्य परंपरागत जाँच'], dashaNow: ['Running dashas', 'चल रही दशाएँ'], cancelledInChart: ['cancelled in own chart', 'अपनी कुंडली में भंग'],
  printReport: ['Print A4 report', 'A4 रिपोर्ट प्रिंट करें'], shareSummary: ['Share summary', 'सारांश साझा करें'], shareNative: ['Share…', 'साझा करें…'],
  needTwo: ['Save at least two people to compare their charts.', 'कुंडली मिलाने के लिए कम से कम दो लोग सहेजें।'], samePerson: ['Pick two different people.', 'दो अलग-अलग लोग चुनें।'],
  boy: ['Groom', 'वर'], girl: ['Bride', 'वधू'], tapExplain: ['Tap a card to see how it is scored.', 'अंक कैसे बने, देखने के लिए कार्ड पर टैप करें।'], readMore: ['Read more', 'और पढ़ें'],
  possibleNak: ['Possible Moon nakshatras', 'संभावित चंद्र नक्षत्र'], combos: ['Score for each possibility', 'हर संभावना के अंक'], matchReport: ['Kundli matching report', 'कुंडली मिलान रिपोर्ट'],
  measures: ['What it measures', 'यह क्या मापता है'], scoring: ['How it is scored', 'अंक कैसे मिलते हैं'], lowScore: ['If the score is low', 'अंक कम हों तो'], weightFull: ['full', 'पूर्ण'], weightPartial: ['partial', 'आंशिक'],
  verdictL: ['Traditional verdict', 'परंपरागत निष्कर्ष'], groups: ['Groups', 'समूह'],
  // family
  familyTitle: ['Family dashboard', 'परिवार डैशबोर्ड'], todayFamily: ['Today for the family', 'परिवार के लिए आज'], chandrabala: ['Chandrabala', 'चंद्रबल'], tarabala: ['Tarabala', 'ताराबल'],
  heatmap: ['Pairwise match (Ashtakoota)', 'आपसी मिलान (अष्टकूट)'], tapOpenMatch: ['Tap a cell to open the full match.', 'पूरा मिलान खोलने के लिए खाने पर टैप करें।'], nextChange: ['Next change', 'अगला बदलाव'],
  noSSnow: ['No Sade Sati or Dhaiya now', 'अभी साढ़ेसाती या ढैया नहीं'], comingUp: ['Coming up', 'आगे आने वाला'], openKundli: ['Open kundli', 'कुंडली खोलें'], moonToday: ['Moon on this day', 'इस दिन चंद्रमा'],
  dateL: ['Date', 'तिथि'], needOne: ['Save a few people to see the family dashboard.', 'परिवार डैशबोर्ड देखने के लिए कुछ लोग सहेजें।'], left: ['left', 'शेष'],
  // muhurta
  muhurtaTitle: ['Muhurta finder', 'मुहूर्त खोजक'], purposeL: ['What is it for?', 'किस कार्य के लिए?'], rangeL: ['Date range', 'तिथि सीमा'], fromD: ['From', 'से'], toD: ['To', 'तक'],
  m1: ['1 month', '1 माह'], m3: ['3 months', '3 माह'], m6: ['6 months', '6 माह'], y1: ['1 year', '1 वर्ष'], placeL: ['Place', 'स्थान'], peopleL: ['People (Tarabala & Chandrabala)', 'लोग (ताराबल व चंद्रबल)'], upTo2: ['up to 2', 'अधिकतम 2'],
  findBtn: ['Find muhurtas', 'मुहूर्त खोजें'], searching: ['Searching…', 'खोज रहे हैं…'], results: ['Best windows', 'सर्वश्रेष्ठ समय'], monthMap: ['Month heat-map', 'मासिक ताप-मानचित्र'], listV: ['List', 'सूची'],
  scoreL: ['Score', 'अंक'], downloadIcs: ['Add to calendar (.ics)', 'कैलेंडर में जोड़ें (.ics)'], icsTop: ['Download top 10 (.ics)', 'शीर्ष 10 डाउनलोड (.ics)'], blockedBy: ['Not suitable', 'उपयुक्त नहीं'], softBy: ['Caution', 'सावधानी'],
  noWindows: ['No suitable window in this range. Try a longer range or another purpose.', 'इस अवधि में कोई उपयुक्त समय नहीं मिला। लंबी अवधि या कोई दूसरा कार्य आज़माएँ।'], bestOfDay: ['Best of the day', 'दिन का सर्वश्रेष्ठ'],
  windowsOn: ['Windows on this day', 'इस दिन के समय'], rangeMax: ['The range is limited to 366 days.', 'अवधि अधिकतम 366 दिन की हो सकती है।'], cityPick: ['Search a city or town', 'शहर या कस्बा खोजें'],
  icsSaved: ['Calendar file downloaded', 'कैलेंडर फ़ाइल डाउनलोड हुई'], reasonsGood: ['In favour', 'पक्ष में'], reasonsBad: ['Against', 'विपक्ष में'], forPerson: ['for', 'के लिए'], runAgain: ['Run again', 'फिर से खोजें'],
  goodDay: ['good', 'अच्छा'], fairDay: ['fair', 'ठीक'], weakDay: ['weak', 'कमज़ोर'], blockedDay: ['avoided', 'वर्जित'], outRange: ['outside range', 'सीमा से बाहर'],
  // calendar
  calTitle: ['Transit calendar', 'गोचर कैलेंडर'], monthV: ['Month', 'माह'], yearV: ['Year', 'वर्ष'], eclOnly: ['Eclipses only', 'केवल ग्रहण'], personal: ['Personal', 'व्यक्तिगत'], filters: ['Filters', 'फ़िल्टर'],
  moonSignsOpt: ['Moon sign changes', 'चंद्र राशि परिवर्तन'], eclipses: ['Eclipses', 'ग्रहण'], visibleHere: ['Visible here', 'यहाँ दिखेगा'], notVisible: ['Not visible here', 'यहाँ नहीं दिखेगा'],
  greatest: ['Greatest eclipse', 'मध्य ग्रहण'], magnitude: ['Magnitude', 'ग्रास (परिमाण)'], contacts: ['Contacts (local time)', 'स्पर्श-मोक्ष (स्थानीय समय)'], safety: ['Safe viewing', 'सुरक्षित दर्शन'], sutakT: ['Sutak tradition', 'सूतक परंपरा'],
  pregnancy: ['Tradition for expectant mothers', 'गर्भवती महिलाओं के लिए परंपरा'], exportIcs: ['Export .ics', '.ics निर्यात'], noEvents: ['No events match these filters.', 'इन फ़िल्टरों से कोई घटना नहीं मिली।'],
  prevL: ['Previous', 'पिछला'], nextL: ['Next', 'अगला'], touches: ['touches your chart', 'आपकी कुंडली से जुड़ा'], fromMoonS: ['from Moon', 'चंद्र से'], fromLagnaS: ['from lagna', 'लग्न से'], bodiesL: ['Planets', 'ग्रह'],
  catIngress: ['Sign & star changes', 'राशि व नक्षत्र परिवर्तन'], catStation: ['Retro / direct', 'वक्री / मार्गी'], catCombust: ['Combustion', 'अस्त / उदय'], catLunation: ['New & full moon', 'अमावस्या व पूर्णिमा'],
  catEkadashi: ['Ekadashi', 'एकादशी'], catSankranti: ['Sankranti', 'संक्रांति'], catEclipse: ['Eclipses', 'ग्रहण'], catSadesati: ['Sade Sati', 'साढ़ेसाती'], catMoonsign: ['Moon sign', 'चंद्र राशि'],
  personalNeeds: ['Personal mode uses the selected person’s chart.', 'व्यक्तिगत मोड चुने गए व्यक्ति की कुंडली का उपयोग करता है।'], eventsN: ['events', 'घटनाएँ'], whatHappens: ['What happens', 'क्या होता है'], tradMeaning: ['Traditional meaning', 'परंपरागत अर्थ'],
  localTimes: ['Local times', 'स्थानीय समय'], from2: ['from', 'से'], until: ['until', 'तक'], penumbral: ['penumbral', 'उपच्छाया'],
  // advanced engine options (wired when the engine supports them)
  advanced: ['Advanced calculation choices', 'उन्नत गणना विकल्प'], manglikHouses: ['Manglik houses', 'मांगलिक भाव'], mhNorth: ['North (1 4 7 8 12)', 'उत्तर (1 4 7 8 12)'], mhSouth: ['South (2 4 7 8 12)', 'दक्षिण (2 4 7 8 12)'], mhBoth: ['Both lists', 'दोनों सूचियाँ'],
  dashaYear: ['Dasha year length', 'दशा वर्ष की लंबाई'], karakasOpt: ['Chara karakas', 'चर कारक'], k7: ['7 (without Rahu)', '7 (राहु के बिना)'], k8: ['8 (with Rahu)', '8 (राहु सहित)'],
  yogaMode: ['Yoga rules', 'योग नियम'], ymStandard: ['Standard', 'मानक'], ymStrict: ['Strict (classical conditions)', 'कठोर (शास्त्रीय शर्तें)'], shadbalaSchool: ['Shadbala school', 'षड्बल पद्धति'], sbBphs: ['BPHS', 'बृहत् पाराशर'], sbRaman: ['B. V. Raman', 'बी. वी. रमन'],
  doshaOrbL: ['Dosha conjunction orb', 'दोष युति की सीमा'], nodeAspectsL: ['Rahu/Ketu aspects (for yogas)', 'राहु/केतु दृष्टि (योगों के लिए)'], naAll: ['5th, 7th and 9th (default)', '5, 7 और 9 (मानक)'], na7: ['7th only', 'केवल 7'], naOff: ['None', 'कोई नहीं'],
  classifications: ['Classifications', 'वर्गीकरण'], weakPair: ['weak link', 'कमज़ोर संबंध'], confirmOffset: ['Use this offset', 'यह अंतर अपनाएँ'], schoolL: ['School', 'पद्धति'],
  wb_lagna_lord_only: ['only through the lagna lord', 'केवल लग्नेश के कारण'], wb_aspect_only: ['aspect only', 'केवल दृष्टि'], wb_spoiled_by_8: ['spoiled by 8th lordship', '8वें भाव के स्वामित्व से दूषित'], wb_spoiled_by_11: ['spoiled by 11th lordship', '11वें भाव के स्वामित्व से दूषित'], dyJulian: ['365.25 days (Julian, default)', '365.25 दिन (जूलियन, मानक)'], dyTrop: ['365.2422 days (tropical)', '365.2422 दिन (सायन)'], dySid: ['365.2564 days (sidereal)', '365.2564 दिन (नाक्षत्र)'], dySav: ['360 days (savana)', '360 दिन (सावन)'],
  engNote: ['These follow different classical schools. Changing one recalculates every chart, match and family view.', 'ये अलग-अलग शास्त्रीय परंपराएँ हैं। बदलने पर हर कुंडली, मिलान और परिवार दृश्य फिर से गणना होता है।'], engUnsupported: ['(needs the updated engine)', '(नए इंजन की आवश्यकता)'],
  common: ['common', 'सामान्य'], rare: ['rare', 'दुर्लभ'], uncommon: ['uncommon', 'कम मिलने वाला'], neechaBhanga: ['Neecha bhanga', 'नीच भंग'], gandanta: ['Gandanta', 'गंडांत'], mrityuBhaga: ['Mrityu bhaga', 'मृत्यु भाग'], pushkara: ['Pushkara', 'पुष्कर'],
  badhaka: ['Badhaka', 'बाधक'], maraka: ['Maraka', 'मारक'], badhakaMaraka: ['Badhaka & Maraka', 'बाधक व मारक'], nearPattern: ['Near pattern (not a dosha)', 'निकट रूप (दोष नहीं)'], needOffset: ['This place is outside India: please enter its UTC offset (or the country’s offset at that date).', 'यह स्थान भारत से बाहर है: कृपया इसका UTC अंतर (या उस तिथि पर उस देश का अंतर) भरें।'],
  // ---- Phase 3: navigation, glyphs, lazy loading, updates
  systems: ['Systems', 'पद्धतियाँ'], dashas: ['Dashas', 'दशाएँ'], kp: ['KP', 'केपी'], varsha: ['Varshaphal', 'वर्षफल'], lalkitab: ['Lal Kitab', 'लाल किताब'], prashna: ['Prashna', 'प्रश्न'], rectify: ['Rectify', 'समय-शोधन'],
  grpSystems: ['Systems', 'पद्धतियाँ'], glyphsOpt: ['Show zodiac & planet symbols (♈ ☉)', 'राशि व ग्रह चिह्न दिखाएँ (♈ ☉)'], dashaSystem: ['Dasha system', 'दशा पद्धति'],
  loadingP3: ['Loading the extra systems (one-time, then offline)…', 'अतिरिक्त पद्धतियाँ लोड हो रही हैं (एक बार, फिर ऑफ़लाइन)…'],
  loadErr: ['Part of the app could not be loaded. Check the connection and try again.', 'ऐप का एक भाग लोड नहीं हो सका। इंटरनेट जाँचें और फिर कोशिश करें।'], retry: ['Retry', 'फिर कोशिश करें'],
  newVersion: ['New version available — tap to refresh', 'नया संस्करण उपलब्ध — ताज़ा करने के लिए टैप करें'], offlineReady: ['Ready to work offline', 'अब ऑफ़लाइन भी चलेगा'],
  loadingCities: ['Loading the city list…', 'शहर-सूची लोड हो रही है…'], exportPerson: ['Export this person (.json)', 'इस व्यक्ति का निर्यात (.json)'],
  credits: ['City data: GeoNames (CC BY 4.0). Planetary theory: VSOP87 / ELP-2000 (public data), Meeus. Texts written in our own words.', 'शहर डेटा: GeoNames (CC BY 4.0)। ग्रह सिद्धांत: VSOP87 / ELP-2000 (सार्वजनिक डेटा), मीयस। पाठ हमारे अपने शब्दों में।']
};
const T = { en: {}, hi: {} };
for (const k in TX) { T.en[k] = TX[k][0]; T.hi[k] = TX[k][1]; }

/* ---------------------------------------------------------------------
   4. Settings & storage (localStorage, every access in try/catch)
   --------------------------------------------------------------------- */
const KEY_S = 'ks.settings', KEY_P = 'ks.profiles';
const DEF = { lang: 'en', theme: 'auto', ayan: 'lahiri', node: 'mean', houses: 'whole', style: 'north', dev: false, elder: false, outer: false, glyphs: true,
  view: 'people', sub: { people: 'list', kundli: 'chart', dasha: 'dashas', insights: 'yogas', more: 'muhurta' }, cur: null, varga: 'D1', tourStep: 0, strength: 'av', printSec: null, dsys: 'vimshottari',
  eng: { manglikHouses: 'north', dashaYear: 365.25, karakas: 8, yogaMode: 'standard', shadbalaSchool: 'bphs', doshaOrb: 12, nodeAspects: true } };
const S = Object.assign({}, DEF, { sub: Object.assign({}, DEF.sub), eng: Object.assign({}, DEF.eng) });
let PROFILES = [];
function lsGet(k) { try { const v = G.localStorage && G.localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { G.localStorage && G.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function loadState() {
  const s = lsGet(KEY_S); if (s && typeof s === 'object') { Object.assign(S, s); S.sub = Object.assign({}, DEF.sub, s.sub || {}); S.eng = Object.assign({}, DEF.eng, s.eng && typeof s.eng === 'object' ? s.eng : {}); }
  const p = lsGet(KEY_P); PROFILES = Array.isArray(p) ? p.filter(validProfile) : [];
  if (S.cur && !PROFILES.find(x => x.id === S.cur)) S.cur = PROFILES[0] ? PROFILES[0].id : null;
}
function saveS() { if (NO_SAVE) return; const o = Object.assign({}, S); lsSet(KEY_S, o); }
function saveP() { if (NO_SAVE) return; if (!lsSet(KEY_P, PROFILES)) toast(S.lang === 'hi' ? 'सहेजा नहीं जा सका (ब्राउज़र भंडारण बंद है)' : 'Could not save (browser storage is blocked)'); }
function validProfile(p) { return p && typeof p === 'object' && typeof p.date === 'string' && p.place && isFinite(+p.place.lat) && isFinite(+p.place.lon); }

/* ---------------------------------------------------------------------
   5. Language & formatting
   --------------------------------------------------------------------- */
const hi = () => S.lang === 'hi';
const tr = k => (T[S.lang] && T[S.lang][k] != null) ? T[S.lang][k] : (T.en[k] != null ? T.en[k] : k);
const L = o => o == null ? '' : (typeof o === 'string' || typeof o === 'number') ? String(o) : (o[S.lang] != null ? o[S.lang] : (o.en != null ? o.en : ''));
const DEVA = '०१२३४५६७८९';
const num = x => { const s = String(x); return S.dev ? s.replace(/[0-9]/g, d => DEVA[d]) : s; };
const fx = (x, d) => num((+x).toFixed(d == null ? 2 : d));
const pad2 = n => (n < 10 ? '0' : '') + n;
function dms(d, sec) { d = +d; const neg = d < 0; d = Math.abs(d); let t = Math.round(d * (sec ? 3600 : 60)); const D = Math.floor(t / (sec ? 3600 : 60)); t -= D * (sec ? 3600 : 60); const M = sec ? Math.floor(t / 60) : t, Sx = sec ? t % 60 : 0; return num((neg ? '−' : '') + D + '°' + pad2(M) + '′' + (sec ? pad2(Sx) + '″' : '')); }
function hm(h) { const s = h < 0 ? '−' : '+', a = Math.abs(h); let H = Math.floor(a + 1e-9), M = Math.round((a - H) * 3600); const sec = M % 60; M = Math.floor(M / 60); if (M === 60) { H++; M = 0; } return num(s + H + ':' + pad2(M) + (sec ? ':' + pad2(sec) : '')); }
const MON = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'] };
function fmtDate(iso, withTime) {
  if (!iso) return '—';
  const [d, t] = String(iso).split('T'); const p = d.split('-'); const y = +p[0], m = +p[1], dd = +p[2];
  let s = num(dd) + ' ' + MON[S.lang][m - 1] + ' ' + num(y);
  if (withTime && t) s += ', ' + num(t.slice(0, 5));
  return s;
}
const fmtTime = iso => iso ? num(String(iso).split('T')[1].slice(0, 5)) : '—';
function fmtDur(years) {
  if (years * 365.25 < 1) { const h = years * 365.25 * 24, H = Math.floor(h), M = Math.round((h - H) * 60); return (H ? num(H) + (hi() ? 'घं ' : 'h ') : '') + num(M) + (hi() ? 'मि' : 'm'); }
  let y = Math.floor(years + 1e-9), mf = (years - y) * 12, m = Math.floor(mf + 1e-9), d = Math.round((mf - m) * 30.4375);
  if (d >= 30) { m++; d = 0; } if (m >= 12) { y++; m = 0; }
  const parts = []; if (y) parts.push(num(y) + tr('yr')); if (m) parts.push(num(m) + tr('mo')); if (d || (!y && !m)) parts.push(num(d) + tr('dy'));
  return parts.join(' ');
}
const PAB = { en: { Su: 'Su', Mo: 'Mo', Ma: 'Ma', Me: 'Me', Ju: 'Ju', Ve: 'Ve', Sa: 'Sa', Ra: 'Ra', Ke: 'Ke', Ur: 'Ur', Ne: 'Ne', Pl: 'Pl', La: 'As' }, hi: { Su: 'सू', Mo: 'चं', Ma: 'मं', Me: 'बु', Ju: 'गु', Ve: 'शु', Sa: 'श', Ra: 'रा', Ke: 'के', Ur: 'यू', Ne: 'ने', Pl: 'प्लू', La: 'ल' } };
const OUTER_NAME = { Ur: { en: 'Uranus', hi: 'यूरेनस' }, Ne: { en: 'Neptune', hi: 'नेप्च्यून' }, Pl: { en: 'Pluto', hi: 'प्लूटो' }, La: { en: 'Lagna', hi: 'लग्न' } };
const pab = id => PAB[S.lang][id] || id;
// zodiac & planet glyphs (SPEC J): text glyphs + U+FE0E (text presentation, never colour emoji); names are always kept
const VS15 = '︎';
const ZG = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(g => g + VS15);
const PG = { Su: '☉', Mo: '☽', Ma: '♂', Me: '☿', Ju: '♃', Ve: '♀', Sa: '♄', Ra: '☊', Ke: '☋', Ur: '♅', Ne: '♆', Pl: '♇' };
for (const k in PG) PG[k] += VS15;
const glyphsOn = () => S.glyphs !== false;
const zg = s => ZG[((s % 12) + 12) % 12];
const pg = id => PG[id] || '';
const pnA = id => L((JE.names.planets && JE.names.planets[id]) || OUTER_NAME[id]) || id; // plain name (aria-labels, sorting)
const pn = id => (glyphsOn() && PG[id] ? PG[id] + ' ' : '') + pnA(id);
const sgnA = s => L(JE.names.signs[((s % 12) + 12) % 12]);
const sgn = s => (glyphsOn() ? zg(s) + ' ' : '') + sgnA(s);
// glyph-only spans for HTML (aria-hidden; the name sits next to it)
const zgH = s => glyphsOn() ? '<span class="zg" aria-hidden="true">' + zg(s) + '</span>' : '';
const pgH = id => glyphsOn() && PG[id] ? '<span class="zg" aria-hidden="true">' + PG[id] + '</span>' : '';
const SAB = { en: ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'], hi: ['मेष', 'वृष', 'मिथु', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चि', 'धनु', 'मकर', 'कुंभ', 'मीन'] };
const sab = s => SAB[S.lang][((s % 12) + 12) % 12];
const nkn = n => L(JE.names.nakshatras[n]);
const ord = n => hi() ? num(n) + 'वाँ' : num(n) + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const DIG_NAME = { exalted: ['Exalted', 'उच्च'], debilitated: ['Debilitated', 'नीच'], moolatrikona: ['Moolatrikona', 'मूलत्रिकोण'], own: ['Own sign', 'स्वराशि'], great_friend: ['Great friend', 'अधिमित्र'], friend: ['Friend', 'मित्र'], neutral: ['Neutral', 'सम'], enemy: ['Enemy', 'शत्रु'], great_enemy: ['Great enemy', 'अधिशत्रु'] };
const digName = d => d ? (DIG_NAME[d] ? DIG_NAME[d][hi() ? 1 : 0] : d) : '—';
const digCls = d => d === 'exalted' ? 'green' : d === 'debilitated' ? 'red' : (d === 'own' || d === 'moolatrikona') ? 'indigo' : (d === 'great_friend' || d === 'friend') ? 'gold' : '';
const LEVEL_NAME = ['', 'mahadasha', 'antardasha', 'pratyantar', 'sookshma', 'prana'];
const KARAKA_NAME = { AK: ['Atmakaraka', 'आत्मकारक'], AmK: ['Amatyakaraka', 'अमात्यकारक'], BK: ['Bhratrikaraka', 'भ्रातृकारक'], MK: ['Matrikaraka', 'मातृकारक'], PiK: ['Pitrikaraka', 'पितृकारक'], PK: ['Putrakaraka', 'पुत्रकारक'], GK: ['Gnatikaraka', 'ज्ञातिकारक'], DK: ['Darakaraka', 'दारकारक'] };
const kName = k => KARAKA_NAME[k] ? KARAKA_NAME[k][hi() ? 1 : 0] : (k || '—');
const pcol = id => 'var(--p' + id + ')';
const gender = g => g === 'm' ? tr('male') : g === 'f' ? tr('female') : '';
// fold for search: lower-case, strip accents and Devanagari nukta / chandrabindu variants
const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-़ͯ]/g, '').replace(/ँ/g, 'ं').replace(/[^a-z0-9ऀ-ॿ ]/g, ' ').replace(/\s+/g, ' ').trim();
// glossary term button (popover)
function term(key, text) {
  const g = JC && JC.glossary && JC.glossary[key];
  if (!g) return esc(text || key);
  return '<button type="button" class="term" data-gl="' + key + '">' + esc(text || L(g.term)) + '</button>';
}

/* ---------------------------------------------------------------------
   6. Chart computation (memoised)
   --------------------------------------------------------------------- */
const CACHE = new Map();
function optsFor(p, extra) { return Object.assign({ ayanamsa: S.ayan, node: S.node, houses: S.houses, tzMode: (p && p.tzMode != null) ? p.tzMode : 'auto', outer: true }, engOpts(), extra || {}); }
// advanced engine options (tests/ENGINE-CHANGES.md); an engine that does not know them simply ignores them
const ENG_OPTS = {
  manglikHouses: [['north', 'mhNorth'], ['south', 'mhSouth'], ['both', 'mhBoth']],
  dashaYear: [[365.25, 'dyJulian'], [365.2422, 'dyTrop'], [365.2564, 'dySid'], [360, 'dySav']],
  karakas: [[8, 'k8'], [7, 'k7']],
  yogaMode: [['standard', 'ymStandard'], ['strict', 'ymStrict']],
  shadbalaSchool: [['bphs', 'sbBphs'], ['raman', 'sbRaman']],
  doshaOrb: [[8, '8°'], [10, '10°'], [12, '12°'], [15, '15°']],
  nodeAspects: [[true, 'naAll'], ['7', 'na7'], [false, 'naOff']]
};
const ENG_JC_KEY = { karakas: { 8: 'eight', 7: 'seven' }, nodeAspects: { true: 'on', 7: 'seven', false: 'off' }, dashaYear: { 365.25: 'julian', 365.2422: 'tropical', 365.2564: 'sidereal', 360: 'savana' } };
function engExplain(k, v) {
  const E = JC && JC.engineOptions && JC.engineOptions[k]; if (!E) return '';
  const key = ENG_JC_KEY[k] ? ENG_JC_KEY[k][String(v)] : String(v);
  return E[key] ? L(E[key]) : (E.what ? L(E.what) : '');
}
const ENG_LABEL = { manglikHouses: 'manglikHouses', dashaYear: 'dashaYear', karakas: 'karakasOpt', yogaMode: 'yogaMode', shadbalaSchool: 'shadbalaSchool', doshaOrb: 'doshaOrbL', nodeAspects: 'nodeAspectsL' };
function engOpts() { const o = {}, E = S.eng || {}; for (const k in ENG_OPTS) if (E[k] != null && ENG_OPTS[k].some(x => String(x[0]) === String(E[k]))) o[k] = E[k]; return o; }
function inputFor(p) { return { name: p.name || '', date: p.date, time: p.time || null, place: Object.assign({}, p.place), gender: p.gender || null }; }
function computeChart(p, extraOpts, inputOverride) {
  const input = inputOverride || inputFor(p), opts = optsFor(p, extraOpts);
  const key = JSON.stringify([input, opts]);
  if (CACHE.has(key)) return CACHE.get(key);
  const C = JE.chart(input, opts);
  if (CACHE.size > 40) CACHE.delete(CACHE.keys().next().value);
  CACHE.set(key, C); return C;
}
const curP = () => PROFILES.find(x => x.id === S.cur) || null;
let CHART_ERR = null;
function curChart() {
  const p = curP(); if (!p) return null;
  try { CHART_ERR = null; return computeChart(p); } catch (e) { CHART_ERR = e; console.error(e); return null; }
}
const P = (C, id) => C.planets.find(x => x.id === id);
const birthJd = C => C.meta.jdUT;
const ageAt = (C, jd) => (jd - C.meta.jdUT) / 365.25;
const houseOf = (C, sign) => ((sign - C.asc.sign + 12) % 12) + 1;
const signOfHouse = (asc, h) => (asc + h - 1) % 12;
const aspectsOf = id => { const a = JC && JC.planets && JC.planets[id] && Array.isArray(JC.planets[id].aspects) ? JC.planets[id].aspects : null; if (a) return a; return id === 'Ma' ? [4, 7, 8] : id === 'Ju' ? [5, 7, 9] : id === 'Sa' ? [3, 7, 10] : (id === 'Ra' || id === 'Ke') ? [5, 7, 9] : [7]; };
function vDig(id, s) {
  if (EXALT[id] != null) { if (EXALT[id] === s) return 'exalted'; if ((EXALT[id] + 6) % 12 === s) return 'debilitated'; }
  if (OWN[id] && OWN[id].includes(s)) return 'own';
  return '';
}
// add minutes to a local date/time string pair → {date,time}
function shiftLocal(date, time, minutes) {
  const [y, m, d] = date.split('-').map(Number); const tp = (time || '12:00').split(':').map(Number);
  const real = new Date(Date.UTC(y, m - 1, d, tp[0] || 0, tp[1] || 0, tp[2] || 0) + Math.round(minutes * 60000));
  const Y = real.getUTCFullYear();
  return { date: String(Y).padStart(4, '0') + '-' + pad2(real.getUTCMonth() + 1) + '-' + pad2(real.getUTCDate()), time: pad2(real.getUTCHours()) + ':' + pad2(real.getUTCMinutes()) + ':' + pad2(real.getUTCSeconds()) };
}
/* ---------------------------------------------------------------------
   7. Chart models and SVG renderers (North, South, East, Western wheel)
   --------------------------------------------------------------------- */
function chartModel(C, vk) {
  vk = vk || 'D1';
  const ids = PL9.concat(S.outer ? OUTER : []);
  const asc0 = C.asc.sign; let asc = asc0, list;
  if (vk === 'D1' || vk === 'moon' || vk === 'chalit') {
    list = ids.map(id => { const p = P(C, id); if (!p) return null; return { id, sign: vk === 'chalit' ? (asc0 + p.bhavaChalit - 1) % 12 : p.sign, deg: p.deg, lon: p.lon, retro: p.retro && id !== 'Ra' && id !== 'Ke', combust: p.combust, dig: p.dignity }; }).filter(Boolean);
    if (vk === 'moon') asc = P(C, 'Mo').sign;
  } else {
    const V = C.vargas[vk]; asc = V.asc;
    list = ids.filter(id => V.planets[id] != null).map(id => ({ id, sign: V.planets[id], retro: P(C, id).retro && id !== 'Ra' && id !== 'Ke', dig: vDig(id, V.planets[id]) }));
  }
  const withDeg = vk === 'D1' || vk === 'chalit';
  return { asc, ascDeg: withDeg ? C.asc.deg : null, ascLon: C.asc.lon, list, vk, withDeg, C };
}
const N_POLY = { 1: [[200, 0], [300, 100], [200, 200], [100, 100]], 2: [[0, 0], [200, 0], [100, 100]], 3: [[0, 0], [100, 100], [0, 200]], 4: [[0, 200], [100, 100], [200, 200], [100, 300]], 5: [[0, 200], [100, 300], [0, 400]], 6: [[0, 400], [100, 300], [200, 400]], 7: [[200, 400], [100, 300], [200, 200], [300, 300]], 8: [[200, 400], [300, 300], [400, 400]], 9: [[400, 400], [300, 300], [400, 200]], 10: [[400, 200], [300, 300], [200, 200], [300, 100]], 11: [[400, 200], [300, 100], [400, 0]], 12: [[400, 0], [300, 100], [200, 0]] };
const N_CTR = { 1: [200, 92], 2: [100, 30], 3: [32, 100], 4: [100, 200], 5: [32, 300], 6: [100, 370], 7: [200, 308], 8: [300, 370], 9: [368, 300], 10: [300, 200], 11: [368, 100], 12: [300, 30] };
const N_NUM = { 1: [200, 166], 2: [100, 68], 3: [68, 100], 4: [166, 200], 5: [68, 300], 6: [100, 332], 7: [200, 234], 8: [300, 332], 9: [332, 300], 10: [234, 200], 11: [332, 100], 12: [300, 68] };
const S_POS = { 11: [0, 0], 0: [1, 0], 1: [2, 0], 2: [3, 0], 3: [3, 1], 4: [3, 2], 5: [3, 3], 6: [2, 3], 7: [1, 3], 8: [0, 3], 9: [0, 2], 10: [0, 1] };
const EC = 400 / 3;
const E_POLY = (() => { const c = EC; return {
  0: [[c, 0], [2 * c, 0], [2 * c, c], [c, c]], 1: [[0, 0], [c, 0], [c, c]], 2: [[0, 0], [c, c], [0, c]], 3: [[0, c], [c, c], [c, 2 * c], [0, 2 * c]],
  4: [[0, 2 * c], [c, 2 * c], [0, 3 * c]], 5: [[c, 2 * c], [c, 3 * c], [0, 3 * c]], 6: [[c, 2 * c], [2 * c, 2 * c], [2 * c, 3 * c], [c, 3 * c]], 7: [[2 * c, 2 * c], [2 * c, 3 * c], [3 * c, 3 * c]],
  8: [[2 * c, 2 * c], [3 * c, 2 * c], [3 * c, 3 * c]], 9: [[2 * c, c], [3 * c, c], [3 * c, 2 * c], [2 * c, 2 * c]], 10: [[2 * c, c], [3 * c, c], [3 * c, 0]], 11: [[2 * c, 0], [2 * c, c], [3 * c, 0]] }; })();
const centroid = pts => { if (pts.length === 4) return [(pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2]; return [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3]; };
const ptsStr = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

function ariaHouse(M, h, s) {
  const occ = M.list.filter(it => it.sign === s).map(it => pnA(it.id));
  return tr('house') + ' ' + num(h) + ', ' + sgnA(s) + (occ.length ? ': ' + occ.join(', ') : '');
}
function ariaPlanet(M, it) {
  let a = pnA(it.id) + ' ' + tr('inSign') + ' ' + sgnA(it.sign);
  if (it.deg != null) a += ' ' + dms(it.deg);
  a += ', ' + tr('house') + ' ' + num(((it.sign - M.asc + 12) % 12) + 1);
  if (it.retro) a += ', ' + tr('retro'); if (it.dig) a += ', ' + digName(it.dig);
  return a;
}
// items in a region: planets (+ lagna marker, transits, tags)
function regionItems(M, s, o) {
  const its = [];
  if (!o.noAsc && M.vk !== 'moon' && s === M.asc) its.push({ id: 'La', asc: true, deg: M.ascDeg });
  if (!o.noPlanets) for (const it of M.list) if (it.sign === s) its.push(it);
  if (o.extra) for (const it of o.extra) if (it.sign === s) its.push(Object.assign({ tr: true }, it));
  if (o.tags && o.tags[s]) for (const t of o.tags[s]) its.push({ tag: t });
  return its;
}
function itemSvg(M, it, x, y, o, small) {
  if (it.tag) return '<text class="pl" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" style="fill:var(--accent-2);font-size:' + (small ? 11 : 12) + 'px;pointer-events:none">' + esc(it.tag) + '</text>';
  const id = it.id, hl = o.hl && o.hl.p && o.hl.p.includes(id) && !it.tr;
  let suf = '';
  if (it.retro) suf += '℞'; if (it.dig === 'exalted') suf += '↑'; else if (it.dig === 'debilitated') suf += '↓'; if (it.combust) suf += 'c';
  const deg = (M.withDeg && it.deg != null && !o.mini) ? num(Math.floor(it.deg)) + '°' : '';
  const fill = it.asc ? 'var(--accent)' : it.tr ? 'var(--accent-2)' : pcol(id);
  const fs = o.mini ? 20 : small ? 12.5 : 15;
  const k = it.asc ? 'h:1' : (it.tr ? 't:' : 'p:') + id;
  const focus = o.mini || it.asc ? '' : ' tabindex="0" role="button" aria-label="' + esc(it.tr ? (S.lang === 'hi' ? 'गोचर ' : 'Transit ') + pnA(id) + ' ' + sgnA(it.sign) : ariaPlanet(M, it)) + '"';
  return '<text class="pl' + (hl ? ' hl' : '') + (it.tr ? ' tr' : '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" style="fill:' + fill + ';font-size:' + fs + 'px" data-k="' + k + '"' + focus + '>' + esc(it.asc ? pab('La') : pab(id)) + (deg || suf ? '<tspan class="dg">' + deg + esc(suf) + '</tspan>' : '') + '</text>';
}
function placeItems(M, its, cx, cy, cols, colW, lineH, o) {
  if (!its.length) return '';
  const small = its.length > (cols === 1 ? 5 : cols * 3);
  if (small) { colW *= 0.85; lineH *= 0.82; if (cols > 1 || its.length > 7) cols += 1; }
  const rows = Math.ceil(its.length / cols); let out = '';
  const y0 = cy - (rows - 1) * lineH / 2;
  for (let r = 0; r < rows; r++) {
    const row = its.slice(r * cols, r * cols + cols), k = row.length;
    for (let i = 0; i < k; i++) out += itemSvg(M, row[i], cx + (i - (k - 1) / 2) * colW, y0 + r * lineH, o, small);
  }
  return out;
}
function svgOpen(o, cls) {
  return '<svg class="chart' + (o.mini ? ' mini' : '') + (cls ? ' ' + cls : '') + '" viewBox="0 0 400 400" role="group" aria-label="' + esc(o.label || tr('chart')) + '" data-ctx="' + esc(o.ctx || 'main') + '" xmlns="http://www.w3.org/2000/svg"><rect class="bg" x="0" y="0" width="400" height="400" rx="6"/>';
}
function regionAttrs(M, h, s, o) {
  const hl = o.hl && ((o.hl.h && o.hl.h.includes(h)) || (o.hl.s && o.hl.s.includes(s)));
  return ' class="hz' + (hl ? ' hl' : '') + '" data-k="h:' + h + '" data-s="' + s + '"' + (o.mini ? '' : ' tabindex="0" role="button" aria-label="' + esc(ariaHouse(M, h, s)) + '"');
}
function signTextSvg(o, s, x, y) {
  if (!o.signText || o.signText[s] == null) return '';
  return '<text class="big" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" style="fill:' + (o.signColor ? o.signColor(s) : 'var(--accent-d)') + '">' + esc(o.signText[s]) + '</text>';
}
function svgNorth(M, o) {
  let out = svgOpen(o);
  for (let h = 1; h <= 12; h++) { const s = signOfHouse(M.asc, h); out += '<polygon points="' + ptsStr(N_POLY[h]) + '"' + regionAttrs(M, h, s, o) + '/>'; }
  out += '<rect class="ln" x="1" y="1" width="398" height="398"/>';
  for (let h = 1; h <= 12; h++) {
    const s = signOfHouse(M.asc, h), [nx, ny] = N_NUM[h];
    out += '<text class="sn" x="' + nx + '" y="' + ny + '" text-anchor="middle" dominant-baseline="middle">' + num(s + 1) + (glyphsOn() && !o.mini ? '<tspan class="zgs" dx="1.5">' + zg(s) + '</tspan>' : '') + '</text>';
    const [cx, cy] = N_CTR[h], diamond = [1, 4, 7, 10].includes(h);
    if (o.signText) out += signTextSvg(o, s, cx, cy);
    else { const side = [3, 5, 9, 11].includes(h); out += placeItems(M, regionItems(M, s, o), cx, cy, diamond ? 3 : side ? 1 : 2, o.mini ? 40 : diamond ? 44 : 42, o.mini ? 24 : side ? 17 : 18, o); }
  }
  return out + '</svg>';
}
function svgSouth(M, o) {
  let out = svgOpen(o);
  for (let s = 0; s < 12; s++) {
    const [c, r] = S_POS[s], x = c * 100, y = r * 100, h = ((s - M.asc + 12) % 12) + 1;
    out += '<rect x="' + x + '" y="' + y + '" width="100" height="100"' + regionAttrs(M, h, s, o) + '/>';
  }
  out += '<rect class="ln" x="1" y="1" width="398" height="398"/><rect class="ln" x="100" y="100" width="200" height="200"/>';
  for (let s = 0; s < 12; s++) {
    const [c, r] = S_POS[s], x = c * 100, y = r * 100, h = ((s - M.asc + 12) % 12) + 1;
    if (!o.mini) out += '<text class="hn" x="' + (x + 6) + '" y="' + (y + 13) + '">' + (glyphsOn() ? '<tspan class="zgs">' + zg(s) + '</tspan> ' : '') + esc(sab(s)) + '</text><text class="hn" x="' + (x + 94) + '" y="' + (y + 13) + '" text-anchor="end">' + num(h) + '</text>';
    if (s === M.asc) out += '<line class="lagmark" x1="' + x + '" y1="' + (y + 26) + '" x2="' + (x + 26) + '" y2="' + y + '"/>';
    if (o.signText) out += signTextSvg(o, s, x + 50, y + 56);
    else out += placeItems(M, regionItems(M, s, o), x + 50, y + 58, 2, o.mini ? 46 : 46, o.mini ? 26 : 19, o);
  }
  out += centerTitle(o, 200, 200);
  return out + '</svg>';
}
function svgEast(M, o) {
  let out = svgOpen(o);
  for (let s = 0; s < 12; s++) { const h = ((s - M.asc + 12) % 12) + 1; out += '<polygon points="' + ptsStr(E_POLY[s]) + '"' + regionAttrs(M, h, s, o) + '/>'; }
  out += '<rect class="ln" x="1" y="1" width="398" height="398"/><rect class="ln" x="' + EC + '" y="' + EC + '" width="' + EC + '" height="' + EC + '"/>';
  for (let s = 0; s < 12; s++) {
    const pts = E_POLY[s], [cx, cy] = centroid(pts), h = ((s - M.asc + 12) % 12) + 1, rect = pts.length === 4;
    if (!o.mini) out += '<text class="hn" x="' + cx.toFixed(1) + '" y="' + (cy + (rect ? 44 : 26)).toFixed(1) + '" text-anchor="middle">' + (glyphsOn() ? '<tspan class="zgs">' + zg(s) + '</tspan> ' : '') + esc(sab(s)) + ' · ' + num(h) + '</text>';
    if (s === M.asc) out += '<polygon points="' + ptsStr(pts) + '" style="fill:none;stroke:var(--accent);stroke-width:3;pointer-events:none"/>';
    if (o.signText) out += signTextSvg(o, s, cx, cy);
    else out += placeItems(M, regionItems(M, s, o), cx, cy - (rect ? 4 : 2), rect ? 3 : (o.mini ? 2 : 1), o.mini ? 40 : rect ? 42 : 40, o.mini ? 24 : rect ? 18 : 16, o);
  }
  out += centerTitle(o, 200, 200);
  return out + '</svg>';
}
function centerTitle(o, x, y) {
  if (o.mini) return o.title ? '<text class="ctr" x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="middle" style="font-size:30px">' + esc(o.title) + '</text>' : '';
  let s = '';
  if (o.title) s += '<text class="ctr" x="' + x + '" y="' + (y - 8) + '" text-anchor="middle">' + esc(o.title) + '</text>';
  if (o.subtitle) s += '<text class="ctr2" x="' + x + '" y="' + (y + 14) + '" text-anchor="middle">' + esc(o.subtitle) + '</text>';
  return s;
}
function svgWheel(M, o) {
  const cx = 200, cy = 200, R1 = 194, R2 = 158, R3 = 62;
  const ascL = M.withDeg ? M.ascLon : M.asc * 30 + 15;
  const pos = (lon, r) => { const a = (lon - ascL) * Math.PI / 180; return [cx - r * Math.cos(a), cy + r * Math.sin(a)]; };
  let out = svgOpen(o);
  for (let s = 0; s < 12; s++) {
    const a = s * 30, b = a + 30, h = ((s - M.asc + 12) % 12) + 1;
    const p1 = pos(a, R1), p2 = pos(b, R1), p3 = pos(b, R2), p4 = pos(a, R2);
    const hl = o.hl && ((o.hl.h && o.hl.h.includes(h)) || (o.hl.s && o.hl.s.includes(s)));
    out += '<path class="wheelband hz' + (hl ? ' hl' : '') + '" d="M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + R1 + ' ' + R1 + ' 0 0 0 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + ' L' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + ' A' + R2 + ' ' + R2 + ' 0 0 1 ' + p4[0].toFixed(1) + ' ' + p4[1].toFixed(1) + 'Z" data-k="h:' + h + '" data-s="' + s + '"' + (o.mini ? '' : ' tabindex="0" role="button" aria-label="' + esc(ariaHouse(M, h, s)) + '"') + '/>';
    const m = pos(a + 15, (R1 + R2) / 2);
    out += '<text class="sn" x="' + m[0].toFixed(1) + '" y="' + m[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" style="font-size:' + (o.mini ? 17 : 12) + 'px">' + (o.mini ? esc(num(s + 1)) : (glyphsOn() ? '<tspan class="zgs">' + zg(s) + '</tspan>' : '') + esc(sab(s))) + '</text>';
  }
  if (!o.mini) for (let d = 0; d < 360; d += 5) { const q1 = pos(d, R2), q2 = pos(d, R2 - (d % 30 === 0 ? 0 : d % 10 === 0 ? 7 : 4)); out += '<line class="tick" x1="' + q1[0].toFixed(1) + '" y1="' + q1[1].toFixed(1) + '" x2="' + q2[0].toFixed(1) + '" y2="' + q2[1].toFixed(1) + '"/>'; }
  out += '<circle class="ln" cx="200" cy="200" r="' + R2 + '"/><circle class="ln" cx="200" cy="200" r="' + R1 + '"/><circle class="ln" cx="200" cy="200" r="' + R3 + '" style="fill:var(--chart-house)"/>';
  // house cusps
  const starts = (M.withDeg && M.vk === 'D1') ? M.C.houses.map(h => h.start) : Array.from({ length: 12 }, (_, i) => ((M.asc + i) % 12) * 30);
  for (let i = 0; i < 12; i++) {
    const q1 = pos(starts[i], R3), q2 = pos(starts[i], R2), next = starts[(i + 1) % 12], mid = starts[i] + norm(next - starts[i]) / 2, hn = pos(mid, R3 + 12);
    out += '<line class="cusp" x1="' + q1[0].toFixed(1) + '" y1="' + q1[1].toFixed(1) + '" x2="' + q2[0].toFixed(1) + '" y2="' + q2[1].toFixed(1) + '"/>';
    if (!o.mini) out += '<text class="hn" x="' + hn[0].toFixed(1) + '" y="' + hn[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle">' + num(i + 1) + '</text>';
  }
  // ascendant (and MC for D1)
  const a1 = pos(ascL, R3), a2 = pos(ascL, R1 + 4);
  out += '<line class="ascln" x1="' + a1[0].toFixed(1) + '" y1="' + a1[1].toFixed(1) + '" x2="' + a2[0].toFixed(1) + '" y2="' + a2[1].toFixed(1) + '"/>';
  if (M.vk === 'D1' && !o.mini) { const m1 = pos(M.C.mc, R3), m2 = pos(M.C.mc, R2); out += '<line class="cusp" style="stroke:var(--accent);stroke-dasharray:4 3" x1="' + m1[0].toFixed(1) + '" y1="' + m1[1].toFixed(1) + '" x2="' + m2[0].toFixed(1) + '" y2="' + m2[1].toFixed(1) + '"/>'; const mt = pos(M.C.mc, R2 - 12); out += '<text class="hn" x="' + mt[0].toFixed(1) + '" y="' + mt[1].toFixed(1) + '" text-anchor="middle" style="fill:var(--accent)">MC</text>'; }
  // planets: spread by longitude with collision avoidance
  const all = [];
  if (!o.noPlanets) for (const it of M.list) all.push(it);
  if (o.extra) for (const it of o.extra) all.push(Object.assign({ tr: true }, it));
  const pts = all.map(it => {
    let lon = it.lon != null && M.withDeg ? it.lon : null;
    if (lon == null) { const same = all.filter(x => x.sign === it.sign && x.tr === it.tr), i = same.indexOf(it); lon = it.sign * 30 + 30 * (i + 1) / (same.length + 1); }
    return { it, lon };
  }).sort((a, b) => a.lon - b.lon);
  const levels = [], RAD = o.mini ? [118, 88] : [134, 114, 94, 76];
  for (const p of pts) {
    let lv = 0; while (lv < RAD.length - 1 && levels.some(q => q.lv === lv && Math.abs(norm(p.lon - q.lon + 180) - 180) < (o.mini ? 14 : 9))) lv++;
    p.lv = lv; levels.push(p);
  }
  for (const p of pts) {
    const r = p.it.tr ? Math.max(RAD[RAD.length - 1] - 4, 70) - 0 : RAD[p.lv];
    const d1 = pos(p.lon, R2), d2 = pos(p.lon, R2 - 6);
    if (!o.mini) out += '<line x1="' + d1[0].toFixed(1) + '" y1="' + d1[1].toFixed(1) + '" x2="' + d2[0].toFixed(1) + '" y2="' + d2[1].toFixed(1) + '" style="stroke:' + (p.it.tr ? 'var(--accent-2)' : pcol(p.it.id)) + ';stroke-width:3"/>';
    const q = pos(p.lon, p.it.tr ? R3 + 26 + p.lv * 0 : r);
    out += itemSvg(M, p.it, q[0], q[1], o, false);
  }
  out += '<text class="ctr" x="200" y="196" text-anchor="middle" style="font-size:' + (o.mini ? 30 : 15) + 'px">' + esc(o.title || '') + '</text>';
  if (!o.mini && o.subtitle) out += '<text class="ctr2" x="200" y="214" text-anchor="middle">' + esc(o.subtitle) + '</text>';
  return out + '</svg>';
}
function chartSVG(M, o) {
  o = o || {};
  const st = o.style || S.style;
  if (st === 'south') return svgSouth(M, o);
  if (st === 'east') return svgEast(M, o);
  if (st === 'western') return svgWheel(M, o);
  return svgNorth(M, o);
}
// centre of a sign's region in the 400×400 chart box (for overlays such as argala arrows)
function regionCenter(M, s, style) {
  const st = style || S.style, h = ((s - M.asc + 12) % 12) + 1;
  if (st === 'south') { const [c, r] = S_POS[s]; return [c * 100 + 50, r * 100 + 50]; }
  if (st === 'east') return centroid(E_POLY[s]);
  if (st === 'western') { const ascL = M.withDeg ? M.ascLon : M.asc * 30 + 15, a = (s * 30 + 15 - ascL) * Math.PI / 180; return [200 - 112 * Math.cos(a), 200 + 112 * Math.sin(a)]; }
  const c = N_CTR[h]; return [c[0], c[1] + ([1, 4, 7, 10].includes(h) ? 8 : 0)];
}
function vargaTitle(vk) { if (vk === 'moon') return tr('moonChart'); if (vk === 'chalit') return tr('chalitChart'); const v = JC && JC.vargas && JC.vargas[vk]; return v ? L(v.name) : vk; }
/* ---------------------------------------------------------------------
   8. Shell: header, navigation, options drawer, sheet, popover, toast
   --------------------------------------------------------------------- */
const NAV = [
  { v: 'people', ic: '👥', g: 'grpPeople', subs: [['list', '👤'], ['family', '👨‍👩‍👧'], ['match', '💞']] },
  { v: 'kundli', ic: '🪐', g: 'grpChart', subs: [['chart', '🪐'], ['themes', '✨'], ['timeline', '🗓️'], ['similar', '🌟'], ['planets', '📋'], ['vargas', '🔲'], ['details', '📜']] },
  // "dasha" is the Systems tab (Phase 3): all 24 dasha systems + Jaimini, KP, Varshaphal, Lal Kitab
  { v: 'dasha', lab: 'systems', ic: '🔭', g: 'grpSystems', subs: [['dashas', '⏳'], ['jaimini', '🔱'], ['kp', '🎯'], ['varsha', '🎂'], ['lalkitab', '📕']] },
  { v: 'insights', ic: '🔮', g: 'grpInsight', subs: [['yogas', '✨'], ['doshas', '⚖️'], ['transits', '🌍'], ['calendar', '🗓️'], ['strength', '📊']] },
  { v: 'more', ic: '📅', g: 'grpMore', subs: [['muhurta', '📅'], ['prashna', '❓'], ['rectify', '🕰️'], ['sky', '🌌'], ['learn', '📖'], ['proof', '📚'], ['settings', '🧪'], ['print', '🖨️']] }
];
// old screen ids (Phase 1/2 links, saved settings, the tour) → the Systems tab
const DASHA_OLD = { vim: 'vimshottari', yogini: 'yogini', ashtottari: 'ashtottari', chara: 'chara' };
function mapView(view, sub) {
  if (view === 'dasha' && DASHA_OLD[sub]) { S.dsys = DASHA_OLD[sub]; return ['dasha', 'dashas']; }
  if (view === 'kundli' && sub === 'jaimini') return ['dasha', 'jaimini'];
  return [view, sub];
}
const ANIM = {};
function stopAnims() { for (const k in ANIM) { if (ANIM[k] && ANIM[k].stop) ANIM[k].stop(); delete ANIM[k]; } }
let LAST_FOCUS = null, CHANGE = null;
function applyTheme() { const r = document.documentElement; if (S.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = S.theme; r.dataset.elder = S.elder ? '1' : '0'; r.lang = S.lang; }
function renderShell() {
  applyTheme();
  document.title = tr('appName');
  $('#appName').textContent = tr('appName'); $('#tagline').textContent = tr('tagline');
  $('#langBtn').textContent = tr('langBtn'); $('#langBtn').setAttribute('lang', hi() ? 'en' : 'hi');
  $('#optBtn').setAttribute('aria-label', tr('options')); $('#brandBtn').setAttribute('aria-label', tr('appName'));
  $('.skip').textContent = tr('skip');
  $('#disclaimer').textContent = JC && JC.disclaimer ? L(JC.disclaimer.short) : (hi() ? 'ज्योतिष एक पारंपरिक मान्यता है, विज्ञान या सलाह नहीं।' : 'Astrology is a traditional belief system, not science or advice.');
  $('#credits').textContent = tr('credits') + ' ' + tr('privacy');
  $('#mainNav').innerHTML = NAV.map(n => '<button type="button" data-nav="' + n.v + '" class="' + (S.view === n.v ? 'on' : '') + '" aria-current="' + (S.view === n.v ? 'page' : 'false') + '"><span class="ic" aria-hidden="true">' + n.ic + '</span>' + esc(tr(n.lab || n.v)) + '</button>').join('');
  $('#sideNav').innerHTML = NAV.map(n => n.subs ? '<div class="grp">' + esc(tr(n.lab || n.v)) + '</div>' + n.subs.map(s => '<button type="button" data-nav="' + n.v + '" data-sub="' + s[0] + '" class="' + (S.view === n.v && S.sub[n.v] === s[0] ? 'on' : '') + '"><span aria-hidden="true">' + s[1] + '</span>' + esc(tr(s[0])) + '</button>').join('')
    : '<button type="button" data-nav="' + n.v + '" class="' + (S.view === n.v ? 'on' : '') + '"><span aria-hidden="true">' + n.ic + '</span>' + esc(tr(n.v)) + '</button>').join('');
  const nv = NAV.find(n => n.v === S.view);
  const sn = $('#subNav');
  if (nv && nv.subs) { sn.classList.remove('hidden'); sn.classList.add('hasside'); sn.innerHTML = nv.subs.map(s => '<button type="button" data-nav="' + nv.v + '" data-sub="' + s[0] + '" class="' + (S.sub[nv.v] === s[0] ? 'on' : '') + '" aria-current="' + (S.sub[nv.v] === s[0] ? 'page' : 'false') + '">' + s[1] + ' ' + esc(tr(s[0])) + '</button>').join('');
    const on = sn.querySelector('button.on'); if (on && sn.scrollWidth > sn.clientWidth) { const l = on.getBoundingClientRect().left - sn.getBoundingClientRect().left + sn.scrollLeft, r = l + on.offsetWidth; if (l < sn.scrollLeft || r > sn.scrollLeft + sn.clientWidth) sn.scrollLeft = Math.max(0, l - (sn.clientWidth - on.offsetWidth) / 2); } }
  else sn.classList.add('hidden');
  renderOptions(); renderPbar(); renderSidePanel();
}
function renderOptions() {
  const seg = (id, val, opts) => '<div class="seg" id="' + id + '">' + opts.map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (String(val) === String(v) ? 'on' : '') + '" aria-pressed="' + (String(val) === String(v)) + '">' + esc(l) + '</button>').join('') + '</div>';
  const ay = Object.keys(JE.AYAN).map(k => '<option value="' + k + '"' + (S.ayan === k ? ' selected' : '') + '>' + esc(L(JE.AYAN[k].name)) + '</option>').join('');
  $('#options').innerHTML =
    '<div class="opt"><span class="lbl">' + tr('language') + '</span>' + seg('langSeg', S.lang, [['en', 'English'], ['hi', 'हिंदी']]) + '</div>' +
    '<div class="opt"><span class="lbl">' + tr('theme') + '</span>' + seg('themeSeg', S.theme, [['light', '☀️ ' + tr('light')], ['dark', '🌙 ' + tr('dark')], ['auto', tr('auto')]]) + '</div>' +
    '<div class="opt"><label class="lbl" for="ayanSel">' + tr('ayanamsa') + '</label><select id="ayanSel">' + ay + '</select></div>' +
    '<div class="opt"><span class="lbl">' + tr('node') + '</span>' + seg('nodeSeg', S.node, [['mean', tr('mean')], ['true', tr('true')]]) + '</div>' +
    '<div class="opt"><label class="lbl" for="houseSel">' + tr('houses') + '</label><select id="houseSel">' + ['whole', 'sripati', 'placidus', 'equal'].map(h => '<option value="' + h + '"' + (S.houses === h ? ' selected' : '') + '>' + tr(h) + '</option>').join('') + '</select></div>' +
    '<div class="opt"><span class="lbl">' + tr('chartStyle') + '</span>' + seg('styleSeg', S.style, [['north', tr('north')], ['south', tr('south')], ['east', tr('east')], ['western', tr('western')]]) + '</div>' +
    '<div class="opt full"><details class="x engopt"><summary>🧮 ' + tr('advanced') + '</summary><div class="body">' + engControls('eng_') + '</div></details></div>' +
    '<div class="opt"><label class="switch"><input type="checkbox" id="devChk"' + (S.dev ? ' checked' : '') + '> ' + tr('devnum') + '</label><label class="switch"><input type="checkbox" id="elderChk"' + (S.elder ? ' checked' : '') + '> ' + tr('elder') + '</label><label class="switch"><input type="checkbox" id="outerChk"' + (S.outer ? ' checked' : '') + '> ' + tr('outerOpt') + '</label><label class="switch"><input type="checkbox" id="glyphChk"' + (glyphsOn() ? ' checked' : '') + '> ' + tr('glyphsOpt') + '</label></div>' +
    '<div class="opt"><span class="lbl">' + tr('dataPrivacy') + '</span><div class="row"><button type="button" class="btn sm" id="resetBtn">' + tr('resetSettings') + '</button><button type="button" class="btn sm danger" id="wipeBtn">🗑️ ' + tr('wipe') + '</button></div></div>';
}
function engControls(pre) {
  return '<p class="sub">' + tr('engNote') + '</p><div class="enggrid">' + Object.keys(ENG_OPTS).map(k => '<div class="field"><label for="' + pre + k + '">' + tr(ENG_LABEL[k]) + '</label><select id="' + pre + k + '" aria-describedby="' + pre + k + 'D">' + ENG_OPTS[k].map(([v, l]) => '<option value="' + v + '"' + (String(S.eng[k]) === String(v) ? ' selected' : '') + '>' + esc(T.en[l] != null ? tr(l) : l) + '</option>').join('') + '</select><small id="' + pre + k + 'D">' + esc(engExplain(k, S.eng[k])) + '</small></div>').join('') + '</div>';
}
function setEng(k, raw) {
  const def = ENG_OPTS[k]; if (!def) return;
  const hit = def.find(x => String(x[0]) === String(raw)); if (!hit) return;
  S.eng = Object.assign({}, DEF.eng, S.eng, { [k]: hit[0] }); saveS(); QF.clear(); SCRUB.sensKey = ''; TRANSIT.ssKey = '';
  if (!IS_NODE) toast(tr(ENG_LABEL[k]) + ': ' + (T.en[hit[1]] != null ? tr(hit[1]) : hit[1]));
}
function personLine(p) {
  const tz = p.time ? num(p.time.slice(0, 5)) : tr('timeUnknown');
  return fmtDate(p.date) + ' · ' + tz + ' · ' + esc(placeLabel(p.place));
}
function placeLabel(pl) { if (!pl) return ''; return (hi() && pl.hi) ? pl.hi : (pl.name || (fx(pl.lat, 2) + ', ' + fx(pl.lon, 2))); }
function renderPbar() {
  const box = $('#pbar'), p = curP();
  if (S.view === 'people' || !p) { box.innerHTML = ''; return; }
  box.innerHTML = '<div class="card pbar noprint"><div class="avatar" aria-hidden="true">' + esc((p.name || '?').trim().charAt(0).toUpperCase() || '?') + '</div><div class="who"><b>' + esc(p.name || '—') + '</b><span>' + personLine(p) + '</span></div>' +
    (PROFILES.length > 1 ? '<label class="vh" for="pSwitch">' + tr('viewing') + '</label><select id="pSwitch">' + PROFILES.map(x => '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select>' : '') +
    '<button type="button" class="btn sm" data-act="editP" data-id="' + p.id + '" aria-label="' + tr('edit') + '">✏️</button></div>';
}
function renderSidePanel() {
  const box = $('#sidePanel'); if (!box) return;
  const C = curChart();
  if (!C || S.view === 'people') { box.innerHTML = '<div class="card"><h2>🌟 ' + tr('appName') + '</h2><p class="sub">' + tr('privacy') + '</p></div>'; return; }
  const mo = P(C, 'Mo'), now = nowJd(), path = JE.dashaAt(C.dashas.vimshottari.tree, now, 3);
  let html = '<div class="card"><h2>🧭 ' + tr('inYourChart') + '</h2><div class="facts" style="grid-template-columns:1fr 1fr">' +
    fact(tr('lagna'), sgn(C.asc.sign), dms(C.asc.deg)) + fact(tr('moonReading'), sgn(mo.sign), nkn(mo.nak) + ' ' + num(mo.pada)) + '</div>';
  if (path.length) html += '<h3>⏳ ' + tr('currentPeriods') + '</h3><div class="sub">' + path.map(n => pn(n.lord)).join(' › ') + '</div><div class="sub">' + tr('till') + ' ' + fmtDate(path[path.length - 1].endISO) + '</div>';
  html += '</div><div class="card"><h2>🧪 ' + tr('provenance') + '</h2>' + provList(C) + '</div>';
  box.innerHTML = html;
}
const fact = (l, b, s) => '<div class="fact"><span class="lbl">' + esc(l) + '</span><b>' + esc(b) + '</b><span>' + esc(s || '') + '</span></div>';
function provChips(C) {
  return '<div class="prov noprint" aria-label="' + tr('provenance') + '"><span class="pill indigo" title="' + esc(L(C.meta.ayanamsaName)) + '">' + term('ayanamsa', tr('ayanamsa')) + ': ' + esc(L(C.meta.ayanamsaName).split(' (')[0]) + ' ' + dms(C.meta.ayanamsaValue) + '</span>' +
    '<span class="pill">' + tr('node') + ': ' + tr(C.meta.nodeType) + '</span><span class="pill">' + tr(C.meta.houseSystemUsed) + '</span>' +
    '<span class="pill saff" title="' + esc(L(C.meta.offsetReason)) + '">UTC' + hm(C.meta.utcOffsetUsed) + '</span><span class="pill">ΔT ' + num(Math.round(C.meta.deltaT)) + 's</span>' +
    '<button type="button" class="btn xs" data-go="more:settings">' + tr('whatChanged').replace('?', '') + ' →</button></div>';
}
function provList(C) {
  const m = C.meta;
  return '<dl class="kv">' +
    '<dt>' + tr('ayanamsa') + '</dt><dd>' + esc(L(m.ayanamsaName)) + ' = ' + dms(m.ayanamsaValue, true) + '</dd>' +
    '<dt>' + tr('node') + '</dt><dd>' + tr(m.nodeType) + '</dd>' +
    '<dt>' + tr('houses') + '</dt><dd>' + tr(m.houseSystemUsed) + (m.houseSystemUsed !== m.houseSystem ? ' (' + tr(m.houseSystem) + ' → ' + tr(m.houseSystemUsed) + ')' : '') + '</dd>' +
    '<dt>' + tr('offsetUsed') + '</dt><dd>UTC' + hm(m.utcOffsetUsed) + ' — ' + esc(L(m.offsetReason)) + '</dd>' +
    '<dt>' + tr('localTime') + '</dt><dd>' + fmtDate(m.localISO, true) + (m.timeUnknown ? ' (' + tr('timeUnknown') + ')' : '') + '</dd>' +
    '<dt>' + tr('utc') + '</dt><dd>' + fmtDate(m.utcISO, true) + '</dd>' +
    '<dt>' + tr('deltaT') + '</dt><dd>' + fx(m.deltaT, 1) + ' s</dd>' +
    '<dt>JD (UT)</dt><dd>' + fx(m.jdUT, 5) + '</dd>' +
    '<dt>' + tr('engine') + '</dt><dd>JE ' + esc(m.engineVersion) + '</dd></dl>' +
    (m.warnings && m.warnings.length ? '<div class="banner warn"><ul>' + m.warnings.map(w => '<li>' + esc(L(w)) + '</li>').join('') + '</ul></div>' : '');
}
// details: inline pane (wide screens) or bottom sheet (phones)
function showDetail(title, html, trigger) {
  const pane = $('#detailPane');
  if (pane && pane.offsetParent !== null && getComputedStyle(pane).display !== 'none') {
    pane.innerHTML = '<div class="card"><h2>' + title + '</h2>' + html + '</div>'; pane.scrollTop = 0;
    announce(stripTags(title)); return;
  }
  openSheet(title, html, trigger);
}
function openSheet(title, html, trigger) {
  LAST_FOCUS = trigger || document.activeElement;
  $('#sheetTitle').innerHTML = title; $('#sheetBody').innerHTML = html; $('#sheetBody').scrollTop = 0;
  const sh = $('#sheet'); sh.classList.add('open'); sh.setAttribute('aria-hidden', 'false');
  if (G.innerWidth < 1100) $('#scrim').classList.add('on');
  setTimeout(() => { const c = $('#sheetClose'); c && c.focus({ preventScroll: true }); }, 30);
}
function closeSheet() {
  const sh = $('#sheet'); if (!sh.classList.contains('open')) return;
  sh.classList.remove('open'); sh.setAttribute('aria-hidden', 'true'); $('#scrim').classList.remove('on');
  if (HL) { HL = null; const box = $('#mainChart'), C0 = curChart(); if (box && C0 && LAST_FOCUS && box.contains(LAST_FOCUS)) { const k = LAST_FOCUS.getAttribute('data-k'); box.innerHTML = mainChartSvg(scrubChart(C0), false); applyZoom(); LAST_FOCUS = box.querySelector('[data-k="' + k + '"]') || LAST_FOCUS; } else if (box && C0) { box.innerHTML = mainChartSvg(scrubChart(C0), false); applyZoom(); } }
  if (LAST_FOCUS && LAST_FOCUS.focus && document.contains(LAST_FOCUS)) LAST_FOCUS.focus({ preventScroll: true });
}
const stripTags = s => String(s).replace(/<[^>]+>/g, '');
let toastT = null;
function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
function announce(msg) { toast(msg); }
function showPop(el, key) {
  const g = JC && JC.glossary && JC.glossary[key]; if (!g) return;
  const pop = $('#pop');
  pop.innerHTML = '<b>' + esc(L(g.term)) + '</b><div>' + esc(L(g.def)) + '</div><div class="row"><button type="button" class="btn xs" data-glopen="' + key + '">' + tr('openGloss') + '</button><button type="button" class="btn xs" data-popclose="1">' + tr('close') + '</button></div>';
  pop.hidden = false;
  const r = el.getBoundingClientRect(), w = Math.min(320, G.innerWidth - 24);
  pop.style.maxWidth = w + 'px';
  let x = clamp(r.left, 12, G.innerWidth - w - 12), y = r.bottom + 8;
  pop.style.left = x + 'px'; pop.style.top = y + 'px';
  const ph = pop.offsetHeight; if (y + ph > G.innerHeight - 8) pop.style.top = Math.max(8, r.top - ph - 8) + 'px';
  pop.setAttribute('aria-label', L(g.term));
  setTimeout(() => { const b = pop.querySelector('button'); b && b.focus({ preventScroll: true }); }, 20);
  LAST_POP = el;
}
let LAST_POP = null;
function hidePop() { const pop = $('#pop'); if (!pop || pop.hidden) return; pop.hidden = true; if (LAST_POP && document.contains(LAST_POP)) LAST_POP.focus({ preventScroll: true }); LAST_POP = null; }
function go(view, sub) {
  stopAnims(); closeSheet(); hidePop(); HL = null;
  if (view === 'people' && !sub) sub = 'list';
  [view, sub] = mapView(view, sub);
  S.view = view; if (sub) S.sub[view] = sub; saveS(); render();
  const m = $('#app'); if (m) { m.focus({ preventScroll: true }); if (G.scrollY > 120) G.scrollTo({ top: 0, behavior: 'auto' }); }
}
function render() {
  if (IS_NODE) return;
  stopAnims();
  renderShell();
  const app = $('#app');
  let html = '';
  try { html = renderView(); } catch (e) { console.error(e); html = '<div class="card"><div class="banner err"><b>' + tr('chartErr') + '</b><br>' + esc(e.message) + '</div></div>'; }
  app.innerHTML = '<div class="view">' + html + '</div>';
  try { afterRender(); } catch (e) { console.error(e); }
}
const AFTER = [];
function afterRender() { while (AFTER.length) AFTER.shift()(); }
function needChart() {
  return '<div class="card hero"><div class="big">🪐</div><h2>' + tr('pickPerson') + '</h2><p>' + tr('noPeopleP') + '</p><div class="row" style="justify-content:center"><button type="button" class="btn primary" data-go="people">' + tr('goPeople') + '</button><button type="button" class="btn" data-act="sample">' + tr('trySample') + '</button></div></div>';
}
function changeBanner(C) {
  if (!CHANGE) return '';
  return '<div class="banner info noprint row between"><span>⚙️ <b>' + tr('changeNote') + ':</b> ' + esc(CHANGE.text) + '</span><span class="row"><button type="button" class="btn xs" data-go="more:settings">' + tr('seeChanges') + '</button><button type="button" class="btn xs" data-act="dismissChange">' + tr('dismiss') + '</button></span></div>';
}
function renderView() {
  if (S.view === 'people') { const ps = S.sub.people; if (ps === 'family') return viewFamily(); if (ps === 'match') return viewMatch(); if (ps !== 'list') S.sub.people = 'list'; return viewPeople(); }
  { const [v2, s2] = mapView(S.view, S.sub[S.view]); S.view = v2; S.sub[v2] = s2; }
  if (S.view === 'more' && S.sub.more === 'muhurta') return viewMuhurta();
  if (S.view === 'insights' && S.sub.insights === 'calendar') return viewCalendar();
  const mk = S.view + ':' + S.sub[S.view];
  if (NOCHART_VIEWS.includes(mk)) { if (!MODS.views[mk] || !have('phase3')) return p3Loading(); return MODS.views[mk](null, S.sub[S.view]); }
  const C = curChart();
  if (!C) return CHART_ERR ? '<div class="card"><div class="banner err"><b>' + tr('chartErr') + '</b><br>' + esc(CHART_ERR.message) + '</div><button class="btn" data-go="people">' + tr('goPeople') + '</button></div>' : needChart();
  const sub = S.sub[S.view];
  const head = changeBanner(C);
  if (MODS.views[mk] && (!P3_VIEWS.includes(mk) || have('phase3'))) return head + MODS.views[mk](C, sub);
  if (P3_VIEWS.includes(mk)) return head + p3Loading();
  const V = {
    kundli: { chart: viewChart, planets: viewPlanets, vargas: viewVargas, details: viewDetails },
    dasha: { dashas: viewDashas },
    insights: { yogas: viewYogas, doshas: viewDoshas, transits: viewTransits, strength: viewStrength },
    more: { sky: viewSky, learn: viewLearn, settings: viewSettings }
  };
  const f = V[S.view] && V[S.view][sub];
  if (!f) { S.view = 'kundli'; S.sub.kundli = 'chart'; return viewChart(C); }
  return head + f(C, sub);
}
/* ---------------------------------------------------------------------
   8b. Bundles (multi-file build: index.html's KS_LOADER fetches hashed files;
       single-file build: everything is in KS_PACK) and UI modules
       (print.js in the core bundle, app3.js in the lazy phase3 bundle)
   --------------------------------------------------------------------- */
const MODS = { views: {}, click: [], input: [], change: [], key: [], after: [], inited: new Set() };
const NOCHART_VIEWS = ['more:prashna', 'more:proof'];
const P3_VIEWS = ['dasha:jaimini', 'dasha:kp', 'dasha:varsha', 'dasha:lalkitab', 'more:prashna', 'more:rectify', 'dasha:generic', 'kundli:themes', 'kundli:timeline', 'kundli:similar', 'more:proof'];
const BUN = {}, BUN_ERR = {};
let CONTENT_WAIT = false;
function have(name) {
  if (name === 'content') return !!JC;
  if (name === 'cities') return !!JE_CITIES;
  if (name === 'phase3') return !!(JE && JE.dashas && JE.kp && JE.varshaphal && JE.lalKitab && JE.prashna && JE.rectifyAsync && JE.synthesis && JC && JC.dashaSystems && JC.synth && MODS.views['dasha:kp'] && MODS.views['kundli:themes']);
  return false;
}
function afterLoad(name) {
  const PK = G.KS_PACK || {};
  if (name === 'content' && !JC) {
    if (G.JC) JC = G.JC;
    else if (PK.content) { JC = unpack(PK.content, 'JC'); G.JC = JC; if (PK.content2) { JC = unpack(PK.content2, 'JC') || JC; G.JC = JC; } }
    if (!JC) throw new Error('content missing');
  }
  if (name === 'cities' && !JE_CITIES) { JE_CITIES = G.JE_CITIES || (PK.cities ? unpack(PK.cities, 'JE_CITIES') : null); G.JE_CITIES = JE_CITIES; if (!JE_CITIES) throw new Error('cities missing'); }
  if (name === 'phase3') {
    if (!JE.dashas && PK.engine3) (new Function(utf8(Inflate(b64bytes(PK.engine3.b64), PK.engine3.len))))();
    if (!JE.synthesis && PK.engine4) (new Function(utf8(Inflate(b64bytes(PK.engine4.b64), PK.engine4.len))))();
    if (JC && !JC.dashaSystems && PK.content3) { G.JC = JC; JC = unpack(PK.content3, 'JC') || JC; G.JC = JC; }
    if (JC && !JC.synth && PK.content4) { G.JC = JC; JC = unpack(PK.content4, 'JC') || JC; G.JC = JC; }
    initMods();
    if (!have('phase3')) throw new Error('phase3 incomplete');
  }
}
// need(name) → Promise: load a bundle once (lazy), then unpack/register what it brought
function need(name) {
  if (have(name)) return Promise.resolve();
  if (BUN[name]) return BUN[name];
  let p;
  if (name === 'phase3' && !have('content')) p = need('content').then(() => need2(name));
  else p = need2(name);
  BUN[name] = p.catch(e => { delete BUN[name]; BUN_ERR[name] = e; throw e; });
  return BUN[name];
}
function need2(name) {
  if (G.KS_LOADER && !IS_NODE) return G.KS_LOADER.load(name).then(() => afterLoad(name));
  try { afterLoad(name); return Promise.resolve(); } catch (e) { return Promise.reject(e); }
}
function loadErrCard(name) {
  return '<div class="card"><div class="banner err" role="alert">⚠️ ' + esc(T.en.loadErr) + '<br>' + esc(T.hi.loadErr) + '</div><button type="button" class="btn primary" data-act="bunRetry" data-bun="' + name + '">🔄 ' + tr('retry') + '</button></div>';
}
function p3Loading() {
  if (BUN_ERR.phase3) return loadErrCard('phase3');
  const mk = S.view + ':' + S.sub[S.view];
  if (!IS_NODE) need('phase3').then(() => { if (S.view + ':' + S.sub[S.view] === mk) rerenderAt(); }, () => { if (S.view + ':' + S.sub[S.view] === mk) rerenderAt(); });
  let h = '<div class="card" role="status"><p><span class="spin" aria-hidden="true">🔭</span> ' + tr('loadingP3') + '</p><div class="prog"><i style="width:60%"></i></div></div>';
  if (mk === 'dasha:jaimini') { const C = curChart(); if (C) h += viewJaimini(C); }
  return h;
}
function initMods() {
  for (const f of (G.KS_MODS || [])) if (!MODS.inited.has(f)) { MODS.inited.add(f); try { f(K); } catch (e) { console.error('module init failed', e); } }
}
// Systems › Dashas: one picker for all 24 systems; the four Phase 1 systems keep their rich explorer
const DS_NAMES = { vimshottari: ['Vimshottari', 'विंशोत्तरी'], ashtottari: ['Ashtottari', 'अष्टोत्तरी'], yogini: ['Yogini', 'योगिनी'], shodashottari: ['Shodashottari', 'षोडशोत्तरी'], dwadashottari: ['Dwadashottari', 'द्वादशोत्तरी'], panchottari: ['Panchottari', 'पंचोत्तरी'], shatabdika: ['Shatabdika', 'शताब्दिका'], chaturashiti_sama: ['Chaturashiti-sama', 'चतुरशीति-सम'], dwisaptati_sama: ['Dwisaptati-sama', 'द्विसप्तति-सम'], shashtihayani: ['Shashtihayani', 'षष्टिहायनी'], shattrimsha_sama: ['Shat-trimsha-sama', 'षट्त्रिंश-सम'], tara: ['Tara', 'तारा'], tithi_ashtottari: ['Tithi Ashtottari', 'तिथि अष्टोत्तरी'], kalachakra: ['Kalachakra', 'कालचक्र'], moola: ['Moola', 'मूल'], chara: ['Chara (K.N. Rao)', 'चर (के.एन. राव)'], narayana: ['Narayana', 'नारायण'], sudasa: ['Sudasa', 'सुदशा'], drig: ['Drig', 'दृग'], sthira: ['Sthira', 'स्थिर'], navamsa: ['Navamsa', 'नवांश'], shoola: ['Shoola', 'शूल'], mudda: ['Mudda (annual)', 'मुद्दा (वार्षिक)'], patyayini: ['Patyayini (annual)', 'पात्यायिनी (वार्षिक)'] };
const DS_GROUPS = [['nakshatra', ['vimshottari', 'ashtottari', 'yogini', 'shodashottari', 'dwadashottari', 'panchottari', 'shatabdika', 'chaturashiti_sama', 'dwisaptati_sama', 'shashtihayani', 'shattrimsha_sama', 'tithi_ashtottari', 'kalachakra']], ['graha', ['tara', 'moola']], ['rashi', ['chara', 'narayana', 'sudasa', 'drig', 'sthira', 'navamsa', 'shoola']], ['annual', ['mudda', 'patyayini']]];
const DS_GROUP_NAME = { nakshatra: ['Nakshatra dashas', 'नक्षत्र दशाएँ'], graha: ['Graha dashas', 'ग्रह दशाएँ'], rashi: ['Rashi (Jaimini) dashas', 'राशि (जैमिनी) दशाएँ'], annual: ['Annual (Tajika)', 'वार्षिक (ताजिक)'] };
const dsName = id => { const j = JC && JC.dashaSystems && JC.dashaSystems[id]; return j && j.name ? L(j.name) : (DS_NAMES[id] ? DS_NAMES[id][hi() ? 1 : 0] : id); };
const CLASSIC = { vimshottari: 'vim', yogini: 'yogini', ashtottari: 'ashtottari', chara: 'chara' };
function dashaPicker() {
  const cur = S.dsys || 'vimshottari';
  return '<div class="card noprint dpick"><div class="row between"><label for="dsysSel"><b>⏳ ' + tr('dashaSystem') + '</b> <small class="sub">(' + num(24) + ')</small></label>' +
    '<select id="dsysSel" class="inline">' + DS_GROUPS.map(([g, ids]) => '<optgroup label="' + esc(DS_GROUP_NAME[g][hi() ? 1 : 0]) + '">' + ids.map(id => '<option value="' + id + '"' + (id === cur ? ' selected' : '') + '>' + esc(dsName(id)) + '</option>').join('') + '</optgroup>').join('') + '</select></div>' +
    '<div class="chips scroll1" role="group" aria-label="' + esc(tr('dashaSystem')) + '">' + ['vimshottari', 'yogini', 'ashtottari', 'chara', 'kalachakra', 'narayana', 'mudda'].map(id => '<button type="button" class="chip' + (id === cur ? ' on' : '') + '" data-dsys="' + id + '" aria-pressed="' + (id === cur) + '">' + esc(dsName(id).split(' (')[0]) + '</button>').join('') + '</div></div>';
}
function viewDashas(C) {
  const sys = S.dsys || 'vimshottari';
  const top = provChips(C) + dashaPicker();
  if (CLASSIC[sys]) return top + viewDasha(C, CLASSIC[sys]);
  if (!MODS.views['dasha:generic'] || !have('phase3')) return top + p3Loading();
  return top + MODS.views['dasha:generic'](C, sys);
}

/* ---------------------------------------------------------------------
   9. People: list, groups, add/edit form with city search & time rules
   --------------------------------------------------------------------- */
let FORM = null, SHARED = null;
const PF = { q: '', g: '' };
const QF = new Map();
function quickFacts(p) {
  const k = JSON.stringify([p.date, p.time, p.place, p.tzMode, S.ayan]);
  if (QF.has(k)) return QF.get(k);
  let r = null;
  try {
    const tr0 = JE.timeRules(p.date, p.place);
    let off = tr0.offset;
    if (typeof p.tzMode === 'number') off = p.tzMode; else if (p.tzMode && p.tzMode !== 'auto') { const a = tr0.alternatives.find(x => x.mode === p.tzMode); if (a) off = a.offset; }
    const [y, m, d] = p.date.split('-').map(Number), tp = (p.time || '12:00').split(':').map(Number);
    const jd = JE.julianDay(y, m, d, tp[0] + (tp[1] || 0) / 60 + (tp[2] || 0) / 3600 - off);
    const mo = JE.positionsAt(jd, S.ayan, S.node, ['Mo']).pos.Mo.lon;
    r = { moon: Math.floor(mo / 30), nak: Math.floor(mo / (360 / 27)), lagna: p.time ? Math.floor(JE.ascSid(jd, +p.place.lat, +p.place.lon, S.ayan) / 30) : null };
  } catch (e) { r = null; }
  QF.set(k, r); return r;
}
function viewPeople() {
  let html = '';
  if (SHARED) html += '<div class="card"><h2>🔗 ' + tr('sharedIn') + '</h2><p><b>' + esc(SHARED.name) + '</b> — ' + personLine(SHARED) + '</p><div class="row"><button type="button" class="btn primary" data-act="acceptShare">' + tr('addIt') + '</button><button type="button" class="btn" data-act="ignoreShare">' + tr('ignore') + '</button></div></div>';
  if (FORM) return html + viewForm();
  const groups = [...new Set(PROFILES.map(p => (p.group || '').trim()).filter(Boolean))];
  if (!PROFILES.length) {
    html += '<div class="card hero"><div class="big">🪐</div><h2>' + tr('noPeople') + '</h2><p>' + tr('noPeopleP') + '</p><div class="row" style="justify-content:center"><button type="button" class="btn primary" data-act="addP">➕ ' + tr('addPerson') + '</button><button type="button" class="btn" data-act="sample">✨ ' + tr('trySample') + '</button><label class="btn">📥 ' + tr('importJson') + '<input type="file" accept=".json,application/json" id="importFile" class="vh"></label></div><p class="sub" style="margin-top:12px">🔒 ' + tr('privacy') + '</p></div>';
    return html;
  }
  const q = fold(PF.q);
  const list = PROFILES.filter(p => (!PF.g || (p.group || '') === PF.g) && (!q || fold(p.name + ' ' + (p.place && p.place.name) + ' ' + (p.group || '')).includes(q)));
  html += '<div class="card"><div class="row between"><h2>👤 ' + tr('people') + ' <small>' + num(PROFILES.length) + '</small></h2><div class="row"><button type="button" class="btn primary" data-act="addP">➕ ' + tr('addPerson') + '</button></div></div>' +
    '<div class="row" style="margin:6px 0 4px"><div class="field" style="flex:1;min-width:180px;margin:0"><label class="vh" for="pSearch">' + tr('search') + '</label><input id="pSearch" type="search" placeholder="🔍 ' + tr('search') + '" value="' + esc(PF.q) + '"></div></div>' +
    (groups.length ? '<div class="chips" role="group" aria-label="' + tr('group') + '"><button type="button" class="chip' + (!PF.g ? ' on' : '') + '" data-pg="">' + tr('all') + '</button>' + groups.map(g => '<button type="button" class="chip' + (PF.g === g ? ' on' : '') + '" data-pg="' + esc(g) + '">' + esc(g) + ' · ' + num(PROFILES.filter(p => p.group === g).length) + '</button>').join('') + '</div>' : '') + '</div>';
  const byGroup = {};
  for (const p of list) (byGroup[p.group || ''] = byGroup[p.group || ''] || []).push(p);
  for (const g of Object.keys(byGroup).sort((a, b) => (a === '') - (b === '') || a.localeCompare(b))) {
    html += '<div class="card">' + (g ? '<h2>👪 ' + esc(g) + '</h2>' : (groups.length ? '<h2>' + tr('other') + '</h2>' : '')) + '<div class="plist">' + byGroup[g].map(personCard).join('') + '</div></div>';
  }
  html += '<div class="card"><h2>💾 ' + tr('dataPrivacy') + '</h2><p class="sub">🔒 ' + tr('privacy') + '</p><div class="row" style="margin-top:8px"><button type="button" class="btn" data-act="export">📤 ' + tr('exportJson') + '</button><label class="btn">📥 ' + tr('importJson') + '<input type="file" accept=".json,application/json" id="importFile" class="vh"></label><button type="button" class="btn" data-act="sample">✨ ' + tr('trySample') + '</button><button type="button" class="btn danger" data-act="wipe">🗑️ ' + tr('wipe') + '</button></div></div>';
  return html;
}
function personCard(p) {
  const f = quickFacts(p);
  const facts = f ? '<div class="chips">' + (f.lagna != null ? '<span class="pill saff">' + tr('lagna') + ': ' + sgn(f.lagna) + '</span>' : '<span class="pill">' + tr('timeUnknown') + '</span>') + '<span class="pill indigo">🌙 ' + sgn(f.moon) + '</span><span class="pill">' + nkn(f.nak) + '</span></div>' : '';
  return '<div class="pcard' + (p.id === S.cur ? ' cur' : '') + '"><div class="avatar" aria-hidden="true">' + esc((p.name || '?').trim().charAt(0).toUpperCase()) + '</div><div class="info"><b>' + esc(p.name) + (p.id === S.cur ? ' <span class="pill green">' + tr('current') + '</span>' : '') + '</b><span>' + personLine(p) + (p.gender ? ' · ' + gender(p.gender) : '') + '</span>' + facts +
    '<div class="acts"><button type="button" class="btn sm primary" data-act="openP" data-id="' + p.id + '">🪐 ' + tr('open') + '</button><button type="button" class="btn sm" data-act="editP" data-id="' + p.id + '">✏️ ' + tr('edit') + '</button><button type="button" class="btn sm" data-act="dupP" data-id="' + p.id + '">⧉ ' + tr('dup') + '</button><button type="button" class="btn sm" data-act="shareP" data-id="' + p.id + '">🔗 ' + tr('share') + '</button><button type="button" class="btn sm danger" data-act="delP" data-id="' + p.id + '" aria-label="' + tr('del') + ' ' + esc(p.name) + '">🗑️</button></div></div></div>';
}
function newForm(p) {
  FORM = p ? { id: p.id, name: p.name || '', gender: p.gender || '', date: p.date, time: p.time ? p.time.slice(0, 5) : '', sec: p.time && p.time.length > 5 ? p.time.slice(6, 8) : '', unknown: !p.time, place: Object.assign({}, p.place), manual: !p.place.country && !p.place.region && p.place.tz !== 'auto' ? true : !!p.place.manual, tzMode: p.tzMode == null ? 'auto' : p.tzMode, group: p.group || '', notes: p.notes || '' }
    : { id: null, name: '', gender: '', date: '', time: '', sec: '', unknown: false, place: null, manual: false, tzMode: 'auto', group: '', notes: '' };
}
function viewForm() {
  ensureCities();
  const F = FORM, pl = F.place;
  const groups = [...new Set(PROFILES.map(p => p.group).filter(Boolean))];
  return '<div class="card"><h2>' + (F.id ? '✏️ ' + tr('editPerson') : '➕ ' + tr('addPerson')) + '</h2><form id="pForm" novalidate autocomplete="off"><div class="formgrid">' +
    '<div class="field full"><label for="fName">' + tr('name') + '</label><input id="fName" value="' + esc(F.name) + '" maxlength="80" required></div>' +
    '<div class="field"><span class="lbl">' + tr('gender') + '</span><div class="seg" id="fGender">' + [['m', tr('male')], ['f', tr('female')], ['', tr('other')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (F.gender === v ? 'on' : '') + '" aria-pressed="' + (F.gender === v) + '">' + l + '</button>').join('') + '</div></div>' +
    '<div class="field"><label for="fDate">' + tr('dob') + '</label><input id="fDate" type="date" min="1800-01-01" max="2100-12-31" value="' + esc(F.date) + '" required></div>' +
    '<div class="field"><label for="fTime">' + tr('tob') + '</label><input id="fTime" type="time" value="' + esc(F.time) + '"' + (F.unknown ? ' disabled' : '') + '><small><label class="switch"><input type="checkbox" id="fUnknown"' + (F.unknown ? ' checked' : '') + '> ' + tr('timeUnknown') + '</label></small></div>' +
    '<div class="field"><label for="fSec">' + tr('seconds') + '</label><input id="fSec" type="number" min="0" max="59" inputmode="numeric" value="' + esc(F.sec) + '"' + (F.unknown ? ' disabled' : '') + '></div>' +
    '<div class="field full"><label for="fCity">' + tr('place') + '</label><input id="fCity" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="citySugg" placeholder="' + esc(tr('cityPh')) + '" value="' + esc(pl && !F.manual ? placeLabel(pl) : '') + '"' + (JE_CITIES ? '' : ' disabled') + '><div class="sugg hidden" id="citySugg" role="listbox"></div>' +
    (JE_CITIES ? '' : citiesPending() ? '<div class="banner info citywait" role="status">⏳ ' + tr('loadingCities') + '</div>' : '<div class="banner err">' + tr('citiesErr') + '</div>') +
    '<div id="placeBox">' + placeBoxHtml() + '</div><small><label class="switch"><input type="checkbox" id="fManual"' + (F.manual ? ' checked' : '') + '> ' + tr('manual') + '</label></small></div>' +
    '<div class="full" id="manualBox">' + manualHtml() + '</div>' +
    '<div class="full" id="tzBanner">' + tzBannerHtml() + '</div>' +
    '<div class="field"><label for="fGroup">' + tr('group') + '</label><input id="fGroup" list="groupList" value="' + esc(F.group) + '" placeholder="' + esc(tr('groupPh')) + '" maxlength="40"><datalist id="groupList">' + groups.map(g => '<option value="' + esc(g) + '">').join('') + '</datalist></div>' +
    '<div class="field"><label for="fNotes">' + tr('notes') + '</label><input id="fNotes" value="' + esc(F.notes) + '" maxlength="200"></div>' +
    '</div><div class="err" id="fErr" role="alert"></div><div class="row"><button type="submit" class="btn primary">💾 ' + tr('save') + '</button><button type="button" class="btn" data-act="cancelForm">' + tr('cancel') + '</button></div></form></div>';
}
function placeBoxHtml() {
  const pl = FORM.place; if (!pl || FORM.manual) return '';
  return '<div class="placebox" style="margin-top:6px">📍 ' + esc(placeLabel(pl)) + (pl.state ? ', ' + esc(pl.state) : '') + (pl.country && pl.country !== 'IN' ? ' (' + esc(pl.country) + ')' : '') + ' · ' + fx(pl.lat, 3) + '°, ' + fx(pl.lon, 3) + '°' + (typeof pl.tz === 'number' ? ' · UTC' + hm(pl.tz) : '') + (pl.region ? ' · ' + (pl.region === 'bombay' ? (hi() ? 'बॉम्बे-समय क्षेत्र' : 'Bombay-time region') : (hi() ? 'कलकत्ता-समय क्षेत्र' : 'Calcutta-time region')) : '') + '</div>';
}
function manualHtml() {
  if (!FORM.manual) return '';
  const pl = FORM.place || {};
  const india = FORM.india != null ? FORM.india : (pl.country === 'IN' || pl.tz === 'auto' || pl.tz == null);
  return '<div class="formgrid" style="background:var(--soft2);border-radius:14px;padding:10px 12px 0;margin-bottom:10px">' +
    '<div class="field full"><label for="mName">' + tr('placeName') + '</label><input id="mName" value="' + esc(pl.name || '') + '"></div>' +
    '<div class="field"><label for="mLat">' + tr('lat') + '</label><input id="mLat" type="number" step="0.0001" min="-90" max="90" inputmode="decimal" value="' + (pl.lat != null ? esc(pl.lat) : '') + '"></div>' +
    '<div class="field"><label for="mLon">' + tr('lon') + '</label><input id="mLon" type="number" step="0.0001" min="-180" max="180" inputmode="decimal" value="' + (pl.lon != null ? esc(pl.lon) : '') + '"></div>' +
    '<div class="field full"><label class="switch"><input type="checkbox" id="mIndia"' + (india ? ' checked' : '') + '> ' + tr('inIndia') + '</label></div>' +
    '<div class="field"><label for="mTz">' + tr('tzOff') + '</label><input id="mTz" type="number" step="0.25" min="-12" max="14" inputmode="decimal" value="' + (typeof pl.tz === 'number' ? esc(pl.tz) : '') + '"' + (india ? ' disabled' : '') + '></div></div>';
}
function formPlace() {
  const F = FORM; if (!F.place) return null;
  const pl = F.place; if (!isFinite(+pl.lat) || !isFinite(+pl.lon) || pl.lat === '' || pl.lon === '') return null;
  return pl;
}
function tzBannerHtml() {
  const F = FORM, pl = formPlace();
  if (!pl || !/^\d{4}-\d\d-\d\d$/.test(F.date)) return '';
  let r; try { r = JE.timeRules(F.date, pl); } catch (e) { return ''; }
  const sel = F.tzMode == null ? 'auto' : F.tzMode;
  const special = r.mode !== 'ist' && r.mode !== 'fixed' || (r.warnings && r.warnings.length);
  let cur = r.offset, curLabel = L(r.reason);
  if (sel !== 'auto') { const a = r.alternatives.find(x => x.mode === sel); if (a) { cur = a.offset; curLabel = L(a.label); } }
  const needOff = (r.needsOffset || r.mode === 'estimated') && !(typeof pl.tz === 'number' && isFinite(pl.tz)) && F.manual;
  const sugg = needOff && Array.isArray(r.suggestions) && r.suggestions.length ? '<div class="chips">' + r.suggestions.map(x => { const o = typeof x === 'number' ? x : +x.offset; const lb = (typeof x === 'object' && (x.name || x.label) ? L(x.name || x.label) + (x.cc ? ' ' + x.cc : '') + ' · ' : '') + 'UTC' + hm(o); return isFinite(o) ? '<button type="button" class="chip" data-tzs="' + o + '">' + esc(lb) + '</button>' : ''; }).join('') + '</div>' : '';
  if (needOff) return '<div class="banner err" role="alert">🕰️ <b>' + tr('needOffset') + '</b>' + (r.warnings && r.warnings.length ? '<ul>' + r.warnings.map(w => '<li>' + esc(L(w)) + '</li>').join('') + '</ul>' : '') + sugg + '</div>';
  return '<div class="banner ' + (special ? 'warn' : 'info') + '"><b>🕰️ ' + tr('timeRule') + ':</b> UTC' + hm(cur) + ' — ' + esc(curLabel) + (sel !== 'auto' ? ' <span class="pill saff">' + tr('chosen') + '</span>' : '') +
    (r.warnings && r.warnings.length ? '<ul>' + r.warnings.map(w => '<li>' + esc(L(w)) + '</li>').join('') + '</ul>' : '') +
    (r.alternatives && r.alternatives.length ? '<div class="sub" style="margin-top:6px">' + tr('alternatives') + '</div><div class="chips"><button type="button" class="chip' + (sel === 'auto' ? ' on' : '') + '" data-tz="auto">' + tr('useAuto') + ' (' + esc(L(r.reason)).replace(/:.*/, '') + ' ' + hm(r.offset) + ')</button>' + r.alternatives.map(a => '<button type="button" class="chip' + (sel === a.mode ? ' on' : '') + '" data-tz="' + esc(a.mode) + '">' + esc(L(a.label)) + '</button>').join('') + '</div>' : '') + '</div>';
}
function refreshTz() { const b = $('#tzBanner'); if (b) b.innerHTML = tzBannerHtml(); }
function citySearch(q) {
  const box = $('#citySugg'), inp = $('#fCity'); if (!box || !ensureCities()) return;
  const res = q && q.trim().length >= 1 ? JE_CITIES.search(q, 12) : [];
  CITY_RES = res; CITY_SEL = -1;
  if (!res.length) { box.classList.add('hidden'); inp.setAttribute('aria-expanded', 'false'); box.innerHTML = ''; return; }
  box.innerHTML = res.map((c, i) => '<div role="option" id="cs' + i + '" data-ci="' + i + '" aria-selected="false"><b>' + esc(hi() && c.hi ? c.hi : c.name) + (c.hi && !hi() ? ' <small class="muted">' + esc(c.hi) + '</small>' : '') + '</b><span>' + esc(c.country === 'IN' ? [c.district, c.state].filter(Boolean).join(', ') : c.country + ' · UTC' + hm(c.tz)) + '</span></div>').join('');
  box.classList.remove('hidden'); inp.setAttribute('aria-expanded', 'true');
}
let CITY_RES = [], CITY_SEL = -1;
function pickCity(i) {
  const c = CITY_RES[i]; if (!c) return;
  FORM.place = { name: c.name, hi: c.hi || null, lat: c.lat, lon: c.lon, tz: c.tz, country: c.country, region: c.region || null, state: c.state || null, district: c.district || null, zone: c.zone || null };
  FORM.tzMode = 'auto';
  $('#fCity').value = placeLabel(FORM.place);
  $('#citySugg').classList.add('hidden'); $('#fCity').setAttribute('aria-expanded', 'false');
  $('#placeBox').innerHTML = placeBoxHtml(); refreshTz();
}
function readForm() {
  const F = FORM;
  F.name = $('#fName').value.trim(); F.date = $('#fDate').value; F.time = $('#fTime').value; F.sec = $('#fSec').value; F.unknown = $('#fUnknown').checked;
  F.group = $('#fGroup').value.trim(); F.notes = $('#fNotes').value.trim();
  if (F.manual) readManual();
}
function readManual() {
  const pl = FORM.place = FORM.place && FORM.place.manual ? FORM.place : { manual: true };
  pl.manual = true;
  const g = id => $(id) ? $(id).value : '';
  pl.name = g('#mName').trim() || null; pl.lat = g('#mLat') === '' ? '' : +g('#mLat'); pl.lon = g('#mLon') === '' ? '' : +g('#mLon');
  const india = $('#mIndia') && $('#mIndia').checked; if ($('#mIndia')) FORM.india = !!india;
  if (india) { pl.country = 'IN'; pl.tz = 'auto'; } else { pl.country = null; const t = g('#mTz'); pl.tz = t === '' ? undefined : +t; }
  pl.region = null;
}
function saveForm() {
  readForm();
  const F = FORM, err = $('#fErr');
  const y = +(F.date || '').slice(0, 4);
  if (!F.name) { err.textContent = tr('needName'); $('#fName').focus(); return; }
  if (!/^\d{4}-\d\d-\d\d$/.test(F.date) || y < 1800 || y > 2100) { err.textContent = tr('needDate'); $('#fDate').focus(); return; }
  if (!F.unknown && !/^\d\d:\d\d$/.test(F.time)) { err.textContent = tr('needTime'); $('#fTime').focus(); return; }
  const pl = formPlace();
  if (!pl || Math.abs(+pl.lat) > 90 || Math.abs(+pl.lon) > 180) { err.textContent = tr('needPlace'); ($('#mLat') || $('#fCity')).focus(); return; }
  if (F.manual && pl.country !== 'IN' && !(typeof pl.tz === 'number' && isFinite(pl.tz))) { err.textContent = tr('needOffset'); const z = $('#mTz'); if (z) z.focus(); return; }
  const sec = F.sec !== '' && isFinite(+F.sec) ? clamp(Math.round(+F.sec), 0, 59) : 0;
  const prof = { id: F.id || ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)), name: F.name, gender: F.gender || null, date: F.date, time: F.unknown ? null : F.time + (sec ? ':' + pad2(sec) : ''),
    place: Object.assign({}, pl, { lat: +pl.lat, lon: +pl.lon }), tzMode: F.tzMode == null ? 'auto' : F.tzMode, group: F.group || '', notes: F.notes || '' };
  try { JE.chart(inputFor(prof), optsFor(prof)); } catch (e) { err.textContent = tr('chartErr') + ': ' + e.message; return; }
  const i = PROFILES.findIndex(p => p.id === prof.id);
  if (i >= 0) PROFILES[i] = prof; else PROFILES.push(prof);
  const ret = FORM.ret;
  saveP(); S.cur = prof.id; FORM = null; SCRUB.min = 0; toast(tr('saved'));
  if (ret && ret.slot) { MT[ret.slot] = prof.id; go('people', 'match'); return; }
  go('kundli', 'chart');
}
function addSample() {
  const prof = { id: 'p' + Date.now().toString(36), name: hi() ? 'नमूना · दिल्ली 2010' : 'Sample · Delhi 2010', gender: 'f', date: '2010-05-15', time: '10:30', place: { name: 'Delhi', hi: 'दिल्ली', lat: 28.6139, lon: 77.209, tz: 'auto', country: 'IN', state: 'Delhi' }, tzMode: 'auto', group: hi() ? 'नमूने' : 'Samples', notes: '' };
  PROFILES.push(prof); saveP(); S.cur = prof.id; toast(tr('saved')); go('kundli', 'chart');
}
function b64urlEncode(str) { const u = new TextEncoder().encode(str); let b = ''; for (let i = 0; i < u.length; i++) b += String.fromCharCode(u[i]); return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64urlDecode(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return utf8(b64bytes(s)); }
function shareLink(p) {
  const o = { n: p.name, g: p.gender, d: p.date, t: p.time, p: { name: p.place.name, hi: p.place.hi, lat: p.place.lat, lon: p.place.lon, tz: p.place.tz, country: p.place.country, region: p.place.region }, z: p.tzMode };
  return location.href.split('#')[0] + '#share=' + b64urlEncode(JSON.stringify(o));
}
function parseShare(h) {
  try { const o = JSON.parse(b64urlDecode(h)); const p = { id: 'p' + Date.now().toString(36), name: String(o.n || '').slice(0, 80), gender: o.g || null, date: o.d, time: o.t || null, place: o.p, tzMode: o.z == null ? 'auto' : o.z, group: '', notes: '' }; return validProfile(p) ? p : null; } catch (e) { return null; }
}
function exportJson() {
  const data = JSON.stringify({ app: 'kundli-studio', version: 1, exported: new Date().toISOString(), profiles: PROFILES }, null, 1);
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = namedFile(['Kundli Studio People', dmyOf(todayStr())], '.json');
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function importJson(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const o = JSON.parse(rd.result), arr = Array.isArray(o) ? o : o.profiles;
      if (!Array.isArray(arr)) throw new Error('no profiles');
      let n = 0;
      for (const p of arr) { if (!validProfile(p)) continue; const q = Object.assign({}, p); if (!q.id || PROFILES.some(x => x.id === q.id)) q.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); PROFILES.push(q); n++; }
      if (!n) throw new Error('empty');
      saveP(); if (!S.cur) S.cur = PROFILES[0].id; toast(tr('imported') + ': ' + num(n)); render();
    } catch (e) { toast(tr('importBad')); }
  };
  rd.readAsText(file);
}
/* ---------------------------------------------------------------------
   10. Kundli: main chart, time scrubber, detail sheets
   --------------------------------------------------------------------- */
const SCRUB = { min: 0, playing: false, raf: 0, pending: false, sensKey: '', sens: null, speed: 0.5 };
const ZOOM = { s: 1, x: 0, y: 0 };
function scrubChart(C) {
  const p = curP(); if (!p || !SCRUB.min || !p.time) return C;
  const sh = shiftLocal(p.date, p.time, SCRUB.min);
  const inp = Object.assign(inputFor(p), sh);
  return computeChart(p, { tzMode: C.meta.utcOffsetUsed }, inp);
}
function sensFor(C) {
  const p = curP(); if (!p || !p.time) return null;
  const k = JSON.stringify([p.date, p.time, p.place, p.tzMode, S.ayan]);
  if (SCRUB.sensKey !== k) { try { SCRUB.sens = JE.sensitivity(inputFor(p), optsFor(p)); } catch (e) { SCRUB.sens = null; } SCRUB.sensKey = k; }
  return SCRUB.sens;
}
function vkOptions(sel) {
  const opts = [['D1', tr('rashiChart')], ['moon', tr('moonChart')], ['chalit', tr('chalitChart')]].concat(VARGAS.slice(1).map(v => [v, vargaTitle(v)]));
  return opts.map(([v, l]) => '<option value="' + v + '"' + (sel === v ? ' selected' : '') + '>' + esc(l) + '</option>').join('');
}
function styleSeg(id) { return '<div class="seg" id="' + (id || 'chartStyle') + '" role="group" aria-label="' + tr('chartStyle') + '">' + [['north', tr('north')], ['south', tr('south')], ['east', tr('east')], ['western', tr('western')]].map(([v, l]) => '<button type="button" data-style="' + v + '" class="' + (S.style === v ? 'on' : '') + '" aria-pressed="' + (S.style === v) + '">' + l + '</button>').join('') + '</div>'; }
function mainChartSvg(C, swap) {
  const M = chartModel(C, S.varga);
  const p = curP();
  return chartSVG(M, { ctx: 'main:' + S.varga, label: vargaTitle(S.varga) + ' — ' + (p ? p.name : ''), title: vargaTitle(S.varga).replace(/\s*\(.*\)/, ''), subtitle: S.varga === 'D1' ? sgn(M.asc) + ' ' + tr('lagna') : sgn(M.asc), hl: HL }).replace('class="chart', 'class="chart' + (swap ? ' swap' : ''));
}
let HL = null;
function needsOffsetHtml(C, p) {
  if (!C || !C.meta || !C.meta.needsOffset || typeof (p && p.tzMode) === 'number') return '';
  const NO = JC && JC.engineOptions && JC.engineOptions.needsOffset, sug = C.meta.offsetSuggestions || [];
  return '<div class="banner warn noprint" role="alert">🕰️ <b>' + esc(NO && NO.name ? L(NO.name) : tr('needOffset')) + '</b> ' + esc(NO && NO.what ? L(NO.what) : tr('needOffset')) + ' <span class="pill saff">UTC' + hm(C.meta.utcOffsetUsed) + '</span>' +
    (sug.length ? '<div class="chips">' + sug.map(x => isFinite(+x.offset) ? '<button type="button" class="chip" data-ptzn="' + (+x.offset) + '">' + esc((x.name ? L(x.name) : x.label || '') + (x.cc ? ' ' + x.cc : '') + ' · UTC' + hm(+x.offset)) + '</button>' : '').join('') + '<button type="button" class="chip" data-act="editP" data-id="' + p.id + '">✏️ ' + tr('edit') + '</button></div>' : '') + '</div>';
}
function timeUnknownNote(C) {
  const p = curP(); if (!p || p.time) return '';
  let extra = '';
  try {
    const off = C.meta.utcOffsetUsed, [y, m, d] = p.date.split('-').map(Number);
    const j0 = JE.julianDay(y, m, d, -off), j1 = j0 + 1 - 1 / 1440;
    const a = JE.positionsAt(j0, S.ayan, S.node, ['Mo']).pos.Mo.lon, b = JE.positionsAt(j1, S.ayan, S.node, ['Mo']).pos.Mo.lon;
    const sa = Math.floor(a / 30), sb = Math.floor(b / 30), na = Math.floor(a / (360 / 27)), nb = Math.floor(b / (360 / 27));
    extra = (sa !== sb || na !== nb) ? '<br>🌙 ' + tr('moonChanges') + ' ' + sgn(sa) + ' / ' + nkn(na) + ' → ' + sgn(sb) + ' / ' + nkn(nb) + '.' : '<br>🌙 ' + tr('moonSteady');
  } catch (e) { }
  return '<div class="banner warn">⏰ ' + tr('timeUnknownBanner') + extra + '</div>';
}
function viewChart(C) {
  const p = curP();
  if (!p.time && !S._tuSet) { S.varga = 'moon'; S._tuSet = true; }
  if (p.time && S._tuSet) { S._tuSet = false; if (S.varga === 'moon') S.varga = 'D1'; }
  const D = scrubChart(C);
  const trm = C.meta.timeRules && C.meta.timeRules.mode;
  const histNote = (trm && trm !== 'ist' && trm !== 'fixed') || (p.tzMode && p.tzMode !== 'auto') ? '<div class="banner warn noprint">🕰️ <b>' + tr('timeRule') + ':</b> UTC' + hm(C.meta.utcOffsetUsed) + ' — ' + esc(L(C.meta.offsetReason)) + ' <button type="button" class="btn xs" data-go="more:settings">' + tr('alternatives').split(' —')[0] + ' →</button></div>' : '';
  let html = provChips(C) + needsOffsetHtml(C, p) + histNote + timeUnknownNote(C) + (SCRUB.min ? scrubBannerHtml(D) : '') + themesSlot(C);
  html += '<div class="chartlayout"><div><div class="card" id="tourChart"><div class="chartbar noprint">' + styleSeg() + '<label class="vh" for="vkSel">' + tr('vargas') + '</label><select id="vkSel" class="inline">' + vkOptions(S.varga) + '</select>' +
    '<span class="row"><button type="button" class="btn sm icon" data-zoom="1" aria-label="' + tr('zoomIn') + '">＋</button><button type="button" class="btn sm icon" data-zoom="-1" aria-label="' + tr('zoomOut') + '">－</button><button type="button" class="btn sm icon" data-zoom="0" aria-label="' + tr('zoomReset') + '">⟲</button></span></div>' +
    '<div class="chartwrap" id="mainChart">' + mainChartSvg(D, true) + '</div>' +
    '<div class="legend">' + tr('legend') + '</div><p class="sub" style="text-align:center">' + tr('tapHint') + '</p>' +
    '<div class="pchips noprint" role="group" aria-label="' + tr('planets') + '">' + PL9.concat(S.outer ? OUTER : []).map(id => '<button type="button" data-k="p:' + id + '" style="color:' + pcol(id) + '">' + esc(pn(id)) + '</button>').join('') + '<button type="button" data-k="h:1" style="color:var(--accent)">' + tr('lagna') + '</button></div>' +
    (p.time ? scrubberHtml(C, D) : '') + '</div></div>' +
    '<div class="detailpane" id="detailPane">' + '<div class="card"><h2>👆 ' + tr('details') + '</h2><p class="sub">' + tr('tapHint') + '</p>' + quickSummary(C) + '</div></div></div>';
  html += '<div class="grid2">' + readingCards(C) + '</div>';
  AFTER.push(() => { applyZoom(); });
  return html;
}
// ✨ Strongest themes + 🗓️ Life timeline summary cards (Phase 4, lazy phase3 bundle) at the top of the chart screen
function themesSlot(C) {
  if (MODS.views['kundli:themesCard'] && have('phase3')) return MODS.views['kundli:themesCard'](C);
  if (BUN_ERR.phase3) return '';
  if (!IS_NODE) need('phase3').then(() => { if (S.view === 'kundli' && S.sub.kundli === 'chart') rerenderAt(); }, () => { });
  return '<div class="card thcard" role="status"><h2>✨ ' + tr('themes') + '</h2><p class="sub"><span class="spin" aria-hidden="true">🔭</span> ' + tr('thLoadingC') + '</p></div>';
}
function quickSummary(C) {
  const mo = P(C, 'Mo'), su = P(C, 'Su');
  return '<div class="facts" style="margin-top:8px">' +
    '<button type="button" class="fact" data-k="h:1"><span class="lbl">' + tr('lagna') + '</span><b>' + sgn(C.asc.sign) + '</b><span>' + dms(C.asc.deg) + ' · ' + nkn(C.asc.nak) + '</span></button>' +
    '<button type="button" class="fact" data-k="p:Mo"><span class="lbl">' + tr('moonReading') + '</span><b>' + sgn(mo.sign) + '</b><span>' + nkn(mo.nak) + ' ' + tr('pada') + ' ' + num(mo.pada) + '</span></button>' +
    '<button type="button" class="fact" data-k="p:Su"><span class="lbl">' + pn('Su') + '</span><b>' + sgn(su.sign) + '</b><span>' + dms(su.deg) + '</span></button></div>';
}
function scrubBannerHtml(D) {
  return '<div class="banner info scrubnote noprint">🕰️ <b>' + tr('scrubbed') + ':</b> ' + fmtDate(D.meta.localISO, true) + ' (' + (SCRUB.min > 0 ? '+' : '') + num(Math.round(SCRUB.min)) + ' ' + tr('minFromBirth') + ')<span class="spacer"></span><button type="button" class="btn xs" data-act="scrubReset">' + tr('resetBirth') + '</button><button type="button" class="btn xs" data-act="scrubUse">' + tr('useThis') + '</button></div>';
}
function scrubberHtml(C, D) {
  const sn = sensFor(C);
  let marks = '', stable = '';
  if (sn) {
    for (const e of sn.events) { const x = (e.minutesFromBirth + 120) / 240 * 100; if (x < 0 || x > 100) continue; marks += '<span class="mk ' + e.type + '" style="left:' + x.toFixed(2) + '%" title="' + esc(tr(e.type === 'lagna' ? 'lagna' : e.type) + ' ' + fmtTime(e.time)) + '"></span>'; }
    const a = (sn.stableFromMin + 120) / 240 * 100, b = (sn.stableToMin + 120) / 240 * 100;
    stable = '<span class="stable" style="left:' + a.toFixed(2) + '%;width:' + Math.max(0, b - a).toFixed(2) + '%"></span>';
  }
  const st = sn ? (tr('stable') + ' ' + (sn.stableFrom ? fmtTime(sn.stableFrom + '') : '−2h') + ' ' + (hi() ? 'से' : tr('to')) + ' ' + (sn.stableTo ? fmtTime(sn.stableTo + '') : '+2h') + (hi() ? ' तक' : '') + (!sn.stableFrom && !sn.stableTo ? ' (' + tr('noChange2h') + ')' : '')) : '';
  const evList = sn && sn.events.length ? '<details class="x"><summary>📍 ' + (hi() ? 'बदलाव के समय' : 'Change times') + ' <span class="pill">' + num(sn.events.length) + '</span></summary><div class="body"><div class="tablewrap"><table><thead><tr><th>' + tr('field') + '</th><th>' + tr('localTime') + '</th><th class="num">min</th><th>' + tr('sign') + '</th></tr></thead><tbody>' +
    sn.events.map(e => '<tr><td>' + tr(e.type === 'lagna' ? 'lagna' : e.type) + '</td><td>' + fmtTime(e.time) + ':' + num(String(e.time).slice(17, 19)) + '</td><td class="num">' + (e.minutesFromBirth > 0 ? '+' : '') + fx(e.minutesFromBirth, 1) + '</td><td>' + esc(sensVal(e.type, e.from)) + ' → ' + esc(sensVal(e.type, e.to)) + '</td></tr>').join('') + '</tbody></table></div></div></details>' : '';
  return '<div class="scrub noprint" id="scrub"><div class="row between"><b>🎚️ ' + tr('scrubber') + '</b><span class="sub" id="scrubT">' + scrubLabel(D) + '</span></div><p class="sub">' + tr('scrubHelp') + '</p>' +
    '<div class="track"><div class="marks">' + stable + marks + '</div><input type="range" id="scrubR" min="-120" max="120" step="1" value="' + clamp(Math.round(SCRUB.min), -120, 120) + '" aria-label="' + tr('scrubber') + '" aria-valuetext="' + esc(scrubLabel(D)) + '"></div>' +
    '<div class="row between sub" style="font-size:.72rem"><span>−2h</span><span>' + (hi() ? 'जन्म' : 'birth') + '</span><span>+2h</span></div>' +
    '<div class="btns">' + [[-525960, '−1y'], [-1440, '−1d'], [-60, '−1h'], [-1, '−1m']].map(([m, l]) => '<button type="button" class="btn sm" data-scrub="' + m + '">' + num(l) + '</button>').join('') +
    '<button type="button" class="btn sm primary" id="scrubPlay" aria-pressed="' + SCRUB.playing + '">' + (SCRUB.playing ? '⏸ ' + tr('pause') : '▶ ' + tr('play')) + '</button>' +
    [[1, '+1m'], [60, '+1h'], [1440, '+1d'], [525960, '+1y']].map(([m, l]) => '<button type="button" class="btn sm" data-scrub="' + m + '">' + num(l) + '</button>').join('') + '<button type="button" class="btn sm" data-act="scrubReset" aria-label="' + tr('resetBirth') + '">⟲</button></div>' +
    '<div class="live" id="scrubLive">' + scrubLive(D) + '</div><p class="sub" style="margin-top:6px">✅ ' + st + '</p>' + evList + '</div>';
}
function sensVal(type, v) { if (type === 'lagna' || type === 'd9asc' || type === 'd10asc') return sgn(v); if (type === 'moonNak') return nkn(v); if (type === 'moonPada') return nkn(Math.floor(v / 4)) + ' ' + num(v % 4 + 1); return v; }
function scrubLabel(D) { return fmtDate(D.meta.localISO, true) + ':' + num(String(D.meta.localISO).slice(17, 19) || '00'); }
let LIVE_PREV = {};
function scrubLive(D) {
  const mo = P(D, 'Mo');
  const vals = { lagna: sgn(D.asc.sign) + ' ' + dms(D.asc.deg), d9asc: sgn(D.vargas.D9.asc), d10asc: sgn(D.vargas.D10.asc), moonNak: nkn(mo.nak) + ' ' + num(mo.pada) };
  let s = '';
  for (const k in vals) { const ch = LIVE_PREV[k] && LIVE_PREV[k].split(' ')[0] !== vals[k].split(' ')[0]; s += '<div' + (ch ? ' class="chg"' : '') + '><span class="lbl">' + tr(k === 'lagna' ? 'lagna' : k) + '</span><b>' + esc(vals[k]) + '</b></div>'; }
  LIVE_PREV = vals; return s;
}
function scrubTo(min) {
  SCRUB.min = min;
  if (SCRUB.pending) return; SCRUB.pending = true;
  raf1(() => { SCRUB.pending = false; scrubPaint(); });
}
function scrubPaint() {
  const C = curChart(); if (!C) return;
  const D = scrubChart(C);
  const box = $('#mainChart'); if (!box) return;
  box.innerHTML = mainChartSvg(D, false); applyZoom();
  const r = $('#scrubR'); if (r) { r.value = clamp(Math.round(SCRUB.min), -120, 120); r.setAttribute('aria-valuetext', scrubLabel(D)); }
  const t = $('#scrubT'); if (t) t.textContent = scrubLabel(D);
  const lv = $('#scrubLive'); if (lv) lv.innerHTML = scrubLive(D);
  let bn = $('.scrubnote');
  if (SCRUB.min && !bn) { const app = $('#app .view'); const prov = app && app.querySelector('.prov'); if (prov) prov.insertAdjacentHTML('afterend', scrubBannerHtml(D)); }
  else if (bn && SCRUB.min) bn.outerHTML = scrubBannerHtml(D);
  else if (bn && !SCRUB.min) bn.remove();
}
function scrubPlay(on) {
  SCRUB.playing = on;
  const b = $('#scrubPlay'); if (b) { b.innerHTML = on ? '⏸ ' + tr('pause') : '▶ ' + tr('play'); b.setAttribute('aria-pressed', on); }
  cancelAnimationFrame(SCRUB.raf);
  if (!on) { delete ANIM.scrub; return; }
  let last = performance.now();
  const step = t => {
    if (!SCRUB.playing) return;
    const dt = Math.min(100, t - last); last = t;
    SCRUB.min += SCRUB.speed * dt / 16.7;
    if (SCRUB.min > 120 && SCRUB.min - SCRUB.speed * dt / 16.7 <= 120) { /* keep running past the track */ }
    scrubPaint();
    SCRUB.raf = requestAnimationFrame(step);
  };
  SCRUB.raf = requestAnimationFrame(step);
  ANIM.scrub = { stop: () => { SCRUB.playing = false; cancelAnimationFrame(SCRUB.raf); } };
}
function applyZoom() {
  const w = $('#mainChart'); if (!w) return; const svg = w.querySelector('svg'); if (!svg) return;
  svg.style.transformOrigin = '50% 50%';
  svg.style.transform = ZOOM.s === 1 ? '' : 'translate(' + ZOOM.x + 'px,' + ZOOM.y + 'px) scale(' + ZOOM.s + ')';
  w.classList.toggle('zoomed', ZOOM.s !== 1);
}
function readingCards(C) {
  if (!JC) return '<div class="card wide">' + (CONTENT_WAIT ? '<p class="sub" role="status">⏳ ' + tr('loading') + '</p>' : '<div class="banner err">' + tr('contentErr') + '</div>') + '</div>';
  const lg = JC.lagna && JC.lagna[C.asc.sign], mo = P(C, 'Mo'), ms = JC.moonSign && JC.moonSign[mo.sign], nk = JC.nakshatras && JC.nakshatras[mo.nak];
  const rows = (o, keys) => keys.filter(k => o[k]).map(k => '<details class="x"><summary>' + esc(secName(k)) + '</summary><div class="body reading"><p>' + esc(L(o[k])) + '</p></div></details>').join('');
  let h = '';
  if (lg) h += '<div class="card" id="tourLagna"><h2>🌅 ' + tr('lagnaReading') + ': ' + sgn(C.asc.sign) + '</h2>' + (curP().time ? '' : '<p class="sub">⚠️ ' + tr('timeUnknown') + '</p>') + '<p class="reading">' + esc(L(lg.summary)) + '</p>' + rows(lg, ['personality', 'body', 'strengths', 'challenges', 'career', 'relationships', 'health', 'tip']) + '</div>';
  if (ms) h += '<div class="card" id="tourMoon"><h2>🌙 ' + tr('moonReading') + ': ' + sgn(mo.sign) + '</h2><p class="reading">' + esc(L(ms.summary)) + '</p>' + rows(ms, ['mind', 'strengths', 'challenges', 'tip']) + '</div>';
  if (nk) h += '<div class="card wide" id="tourNak"><h2>⭐ ' + tr('nakReading') + ': ' + nkn(mo.nak) + ' · ' + tr('pada') + ' ' + num(mo.pada) + '</h2><div class="chips"><span class="pill">' + tr('lord') + ': ' + pn(nk.lord || DASHA_ORDER[mo.nak % 9]) + '</span>' + (nk.deity ? '<span class="pill gold">' + esc(L(nk.deity)) + '</span>' : '') + (nk.symbol ? '<span class="pill">' + esc(L(nk.symbol)) + '</span>' : '') + (nk.gana ? '<span class="pill indigo">' + esc(L(nk.gana)) + '</span>' : '') + '</div><p class="reading">' + esc(L(nk.summary)) + '</p>' +
    (nk.padas && nk.padas[mo.pada - 1] ? '<p class="reading"><b>' + tr('pada') + ' ' + num(mo.pada) + ':</b> ' + esc(L(nk.padas[mo.pada - 1])) + '</p>' : '') + rows(nk, ['personality', 'strengths', 'challenges', 'career', 'relationships']) + '</div>';
  return h;
}
const SEC = { personality: ['Personality', 'व्यक्तित्व'], body: ['Body & looks', 'शरीर व रूप'], strengths: ['Strengths', 'गुण'], challenges: ['Challenges', 'चुनौतियाँ'], career: ['Career', 'करियर'], relationships: ['Relationships', 'रिश्ते'], health: ['Health', 'स्वास्थ्य'], tip: ['Tip', 'सुझाव'], mind: ['Mind', 'मन'], summary: ['Summary', 'सार'] };
const secName = k => SEC[k] ? SEC[k][hi() ? 1 : 0] : k;
function ctxVk(ctx) { const m = /^(?:main|varga|cmp\d?):(.+)$/.exec(ctx || ''); return m ? m[1] : 'D1'; }
function aspectsGiven(C, id, vkSigns) {
  const p = P(C, id), s0 = vkSigns ? vkSigns[id] : p.sign;
  return aspectsOf(id).map(n => { const s = (s0 + n - 1) % 12; return { n, s, h: houseOf(C, s), occ: PL9.filter(q => q !== id && (vkSigns ? vkSigns[q] : P(C, q).sign) === s) }; });
}
function aspectsReceived(C, sign, exclude, vkSigns) {
  return PL9.filter(q => q !== exclude).filter(q => { const qs = vkSigns ? vkSigns[q] : P(C, q).sign; return aspectsOf(q).includes(((sign - qs + 12) % 12) + 1); });
}
function pChip(id) { return '<button type="button" class="chip" data-k="p:' + id + '" style="border-color:' + pcol(id) + '">' + esc(pn(id)) + '</button>'; }
/* new engine fields (tests/ENGINE-CHANGES.md) — every helper accepts both old and new chart shapes */
function flagOf(v) {
  if (v == null || v === false) return null;
  if (v === true) return { on: true, text: '' };
  if (typeof v === 'object') {
    const on = 'present' in v ? !!v.present : 'applies' in v ? !!v.applies : 'is' in v ? !!v.is : 'value' in v ? !!v.value : ('active' in v ? !!v.active : true);
    if (!on) return null;
    const t = v.reason || v.text || v.note || v.desc || v.label;
    return { on: true, text: t ? L(t) : '', obj: v };
  }
  return { on: true, text: typeof v === 'string' ? v : '' };
}
function nbRules(p) {
  const nb = p.neechaBhanga; if (!nb || typeof nb !== 'object' || !Array.isArray(nb.rules)) return '';
  const B = JC && JC.chartPoints && JC.chartPoints.neechaBhanga && JC.chartPoints.neechaBhanga.bases;
  return '<details class="x"><summary>🔄 ' + (hi() ? 'नीचभंग नियम' : 'Neecha bhanga rules') + ' <span class="pill' + (nb.cancelled ? ' green' : '') + '">' + num(nb.rules.filter(r => r.applies).length) + '/' + num(nb.rules.length) + '</span></summary><div class="body">' +
    nb.rules.map(r => '<p>' + (r.applies ? '✅' : '⚪') + ' ' + esc(L(r.rule)) + ' <span class="pill">' + esc(B && B[r.basis] ? L(B[r.basis]).split(' (')[0] : r.basis || '') + '</span>' + (r.src ? ' <span class="sub">' + esc(r.src) + '</span>' : '') + '</p>').join('') +
    (nb.strictRaja && JC && JC.chartPoints && JC.chartPoints.neechaBhanga.raja ? '<p class="sub">👑 ' + esc(L(JC.chartPoints.neechaBhanga.raja)) + '</p>' : '') + '</div></details>';
}
const isVargottama = (C, p) => p.vargottama != null ? !!flagOf(p.vargottama) : (C.vargas && C.vargas.D9 && C.vargas.D9.planets[p.id] === p.sign);
function planetFlags(C, p) {
  const out = [], yes = v => v === true || (v && typeof v === 'object' && (v.present === true || v.applies === true || v.cancelled === true || v.inMrityuBhaga === true));
  const nb = p.neechaBhanga;
  if (nb === true || (nb && typeof nb === 'object' && (nb.cancelled === true || nb.present === true))) {
    const rules = nb && Array.isArray(nb.rules) ? nb.rules.filter(r => r.applies) : [];
    out.push({ k: 'neechaBhanga', cls: 'green', ic: '🔄', text: rules.map(r => L(r.rule)).join('; ') || (nb && nb.reason ? L(nb.reason) : ''), extra: nb && nb.strictRaja ? (hi() ? 'नीचभंग राजयोग (कठोर शर्तें पूरी)' : 'Neecha-bhanga Raja yoga (strict conditions met)') : '' });
  }
  const g = p.gandanta;
  if (g === true || (g && typeof g === 'object' && g.present !== false)) out.push({ k: 'gandanta', cls: 'gold', ic: '🌀', text: g && typeof g === 'object' ? [g.junction ? String(g.junction).split('_').map(x => { const i = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'].indexOf(x); return i >= 0 ? sgn(i) : x; }).join(' / ') : '', g.distance != null ? fx(g.distance, 2) + '°' : '', g.core ? (hi() ? 'मुख्य गंडांत' : 'core gandanta') : '', g.reason ? L(g.reason) : ''].filter(Boolean).join(' · ') : '' });
  const mb = p.mrityuBhaga;
  if (mb === true || (mb && typeof mb === 'object' && (mb.inMrityuBhaga === true || mb.present === true))) out.push({ k: 'mrityuBhaga', cls: 'gold', ic: '⚠️', text: mb && mb.degree != null ? (hi() ? 'मृत्यु भाग ' : 'Mrityu bhaga ') + num(mb.degree) + '° (±' + fx(mb.orb || 0, 2) + '°)' + (hi() ? ' — परंपरागत संवेदनशील अंश, भय का कारण नहीं' : ' — a traditional sensitive degree, not a cause for fear') : '' });
  const pu = p.pushkara;
  if (pu === true || (pu && typeof pu === 'object' && (pu.navamsa === true || pu.bhaga === true || pu.present === true))) out.push({ k: 'pushkara', cls: 'green', ic: '🌸', text: pu && typeof pu === 'object' ? [pu.navamsa ? (hi() ? 'पुष्कर नवांश' : 'Pushkara navamsa') + (pu.navamsaNo ? ' #' + num(pu.navamsaNo) : '') : '', pu.bhaga ? (hi() ? 'पुष्कर भाग' : 'Pushkara bhaga') + (pu.bhagaDegree != null ? ' ' + num(pu.bhagaDegree) + '°' : '') : ''].filter(Boolean).join(' · ') : '' });
  void yes;
  return out;
}
function wbLabel(w) {
  w = String(w); if (T.en['wb_' + w] != null) return tr('wb_' + w);
  const m = /^spoiled_by_([\d_]+)$/.exec(w); if (m) return (hi() ? 'दूषित: ' : 'spoiled by ') + m[1].split('_').map(n => ord(+n)).join(' + ') + (hi() ? ' स्वामित्व' : ' lordship');
  return w.replace(/_/g, ' ');
}
const RARITY = { very_common: ['common', ''], common: ['common', ''], uncommon: ['uncommon', 'indigo'], rare: ['rare', 'gold'], very_rare: ['rare', 'gold'] };
function rarityPill(y) {
  let r = y.rarity; if (!r && typeof y.commonness === 'number') r = y.commonness >= 25 ? 'common' : y.commonness >= 8 ? 'uncommon' : 'rare';
  const R2 = RARITY[r]; if (!R2) return '';
  const lab = JC && JC.yogaRarity && JC.yogaRarity[r] ? L(JC.yogaRarity[r]) : '';
  return '<span class="pill ' + R2[1] + '" title="' + esc(lab || (typeof y.commonness === 'number' ? fx(y.commonness, 1) + '%' : '')) + '">' + (r === 'rare' || r === 'very_rare' ? '💎 ' : '') + tr(R2[0]) + '</span>';
}
function pointVal(C, v) {
  if (v == null) return '—';
  if (typeof v === 'number') return v >= 0 && v < 12 && Number.isInteger(v) ? sgn(v) : lonStr(v);
  if (typeof v === 'string') return PL9.includes(v) ? pn(v) : v;
  if (Array.isArray(v)) return v.map(x => pointVal(C, x)).join(', ');
  if (typeof v === 'object') {
    if ('en' in v && 'hi' in v) return L(v);
    const parts = [];
    if (v.fromLagna || v.fromMoon) { if (v.fromLagna) parts.push(tr('fromLagna') + ': ' + pointVal(C, v.fromLagna)); if (v.fromMoon) parts.push(tr('fromMoon') + ': ' + pointVal(C, v.fromMoon)); return parts.join(' · '); }
    if (v.house != null) parts.push(tr('house') + ' ' + num(v.house));
    if (v.houses) parts.push(tr('house') + ' ' + [].concat(v.houses).map(num).join(', '));
    if (v.sign != null) parts.push(sgn(v.sign) + (v.lon != null ? ' ' + dms(norm(v.lon) % 30) : ''));
    else if (v.lon != null) parts.push(lonStr(v.lon));
    if (v.lord) parts.push(tr('lord') + ' ' + pn(v.lord));
    if (v.lords) parts.push(tr('lord') + ' ' + [].concat(v.lords).map(pn).join(', '));
    if (v.occupants && v.occupants.length) parts.push(tr('occupants') + ': ' + [].concat(v.occupants).map(pn).join(', '));
    if (v.planets && v.planets.length) parts.push([].concat(v.planets).map(pn).join(', '));
    if (v.nakshatra != null || v.nak != null) parts.push(nkn(v.nakshatra != null ? v.nakshatra : v.nak));
    if (v.reason || v.text || v.note) parts.push(L(v.reason || v.text || v.note));
    return parts.join(' · ') || '—';
  }
  return String(v);
}
const pointRule = v => v && typeof v === 'object' && v.rule ? L(v.rule) : '';
const POINT_NAME = { badhaka: ['Badhaka', 'बाधक'], maraka: ['Maraka', 'मारक'], marakas: ['Maraka', 'मारक'], navamsa64: ['64th navamsa', '64वाँ नवांश'], d64: ['64th navamsa', '64वाँ नवांश'], navamsa_64: ['64th navamsa', '64वाँ नवांश'], drekkana22: ['22nd drekkana', '22वाँ द्रेष्काण'], d22: ['22nd drekkana', '22वाँ द्रेष्काण'], drekkana_22: ['22nd drekkana', '22वाँ द्रेष्काण'], khara: ['Khara (22nd drekkana)', 'खर (22वाँ द्रेष्काण)'], vainashika: ['Vainashika', 'वैनाशिक'] };
const pointName = k => JC && JC.chartPoints && JC.chartPoints[k] && JC.chartPoints[k].name ? L(JC.chartPoints[k].name) : POINT_NAME[k] ? POINT_NAME[k][hi() ? 1 : 0] : (JC && JC.glossary && JC.glossary[k] ? L(JC.glossary[k].term) : k.replace(/_/g, ' ').replace(/([a-z])([A-Z0-9])/g, '$1 $2'));
const UPA_KNOWN = ['gulika', 'mandi', 'dhuma', 'vyatipata', 'parivesha', 'indrachapa', 'upaketu', 'kala', 'mrityu', 'ardhaprahara', 'yamaghantaka'];
const UPA_NAME = { kala: ['Kala', 'काल'], mrityu: ['Mrityu', 'मृत्यु'], ardhaprahara: ['Ardhaprahara', 'अर्धप्रहर'], yamaghantaka: ['Yamaghantaka', 'यमघंटक'] };
function upaKeys(C) { const u = C.upagrahas || {}; return UPA_KNOWN.filter(k => u[k] && u[k].sign != null).concat(Object.keys(u).filter(k => !UPA_KNOWN.includes(k) && u[k] && typeof u[k] === 'object' && u[k].sign != null)); }
function upaName(k) { const g = JC && JC.glossary && JC.glossary[k]; if (g) return term(k, L(g.term)); const cu = JC && JC.chartPoints && JC.chartPoints.upagrahas && JC.chartPoints.upagrahas[k]; return cu && cu.name ? '<span title="' + esc(cu.what ? L(cu.what) : '') + '">' + esc(L(cu.name)) + '</span>' : esc(UPA_NAME[k] ? UPA_NAME[k][hi() ? 1 : 0] : k.charAt(0).toUpperCase() + k.slice(1)); }
function detailPlanet(C, id, vk) {
  const p = P(C, id); if (!p) return '';
  const jp = JC && JC.planets && JC.planets[id];
  const varga = vk && vk !== 'D1' && vk !== 'moon' && vk !== 'chalit' && C.vargas[vk];
  let h = '<div class="dhead"><div class="dglyph" style="background:' + pcol(id) + '">' + esc(pab(id)) + '</div><div><b style="font-family:Baloo 2;font-size:1.15rem">' + esc(pn(id)) + '</b><div class="sub">' + sgn(p.sign) + ' ' + dms(p.deg, true) + ' · ' + tr('house') + ' ' + num(p.house) + (p.bhavaChalit !== p.house ? ' (' + tr('chalit') + ' ' + num(p.bhavaChalit) + ')' : '') + '</div></div></div>';
  h += '<div class="chips">' + (p.dignity ? '<span class="pill ' + digCls(p.dignity) + '">' + term('dignity', digName(p.dignity)) + '</span>' : '') + (p.retro && id !== 'Ra' && id !== 'Ke' ? '<span class="pill red">℞ ' + term('retrograde', tr('retro')) + '</span>' : '') + (p.combust ? '<span class="pill red">' + term('combust', tr('combust')) + '</span>' : '') +
    (p.karaka ? '<span class="pill indigo">' + term('chara_karaka', kName(p.karaka)) + '</span>' : '') + (isVargottama(C, p) ? '<span class="pill gold">' + term('vargottama', tr('vargottama')) + '</span>' : '') + planetFlags(C, p).map(f => '<span class="pill ' + f.cls + '" title="' + esc(f.text) + '">' + f.ic + ' ' + tr(f.k) + '</span>').join('') + '<span class="pill">' + fx(p.speed, 3) + '°/' + (hi() ? 'दिन' : 'day') + '</span></div>';
  const pf = planetFlags(C, p).filter(f => f.text);
  const CPd = JC && JC.chartPoints, cpKey = { neechaBhanga: 'neechaBhanga', gandanta: 'gandanta', mrityuBhaga: 'mrityuBhaga', pushkara: 'pushkaraNavamsa' };
  if (pf.length) h += '<div class="dsec">' + pf.map(f => { const cp = CPd && CPd[cpKey[f.k]]; return '<p class="sub">' + f.ic + ' <b>' + (cp && cp.name ? esc(L(cp.name)) : tr(f.k)) + ':</b> ' + esc(f.text) + (f.extra ? ' <span class="pill green">' + esc(f.extra) + '</span>' : '') + '</p>' + (cp && cp.what ? '<details class="inl why"><summary aria-label="' + esc(tr('why')) + '">ⓘ</summary><p class="sub">' + esc(L(cp.what)) + '</p></details>' : ''); }).join('') + nbRules(p) + '</div>';
  if (varga) {
    const vs = varga.planets[id], vd = vDig(id, vs), vh = ((vs - varga.asc + 12) % 12) + 1, vj = JC && JC.vargas && JC.vargas[vk];
    h += '<div class="dsec"><h4>🔲 ' + esc(vargaTitle(vk)) + '</h4><p><b>' + sgn(vs) + '</b> · ' + tr('house') + ' ' + num(vh) + (vd ? ' · <span class="pill ' + digCls(vd) + '">' + digName(vd) + '</span>' : '') + '</p>' + (vj ? '<p class="sub">' + esc(L(vj.purpose)) + '</p>' : '') + '</div>';
  }
  if (JC && JC.planetInSign && JC.planetInSign[id]) h += '<div class="dsec reading"><h4>📜 ' + tr('placement') + '</h4><p><b>' + pn(id) + ' ' + tr('inSign') + ' ' + sgn(p.sign) + ':</b> ' + esc(L(JC.planetInSign[id][p.sign])) + '</p>' + (JC.planetInHouse && JC.planetInHouse[id] ? '<p><b>' + pn(id) + ', ' + tr('house') + ' ' + num(p.house) + ':</b> ' + esc(L(JC.planetInHouse[id][p.house])) + '</p>' : '') + '</div>';
  else if (OUTER.includes(id)) h += '<p class="sub">' + (hi() ? 'बाहरी ग्रह — शास्त्रीय वैदिक फलादेश में प्रयोग नहीं।' : 'Outer planet — not used in classical Vedic readings.') + '</p>';
  h += '<div class="dsec"><h4>⭐ ' + term('nakshatra', tr('nakshatra')) + '</h4><dl class="kv"><dt>' + tr('nakshatra') + '</dt><dd>' + nkn(p.nak) + ' · ' + tr('pada') + ' ' + num(p.pada) + '</dd><dt>' + term('star_lord', tr('nakLord')) + '</dt><dd>' + pn(p.nakLord) + '</dd><dt>' + term('sub_lord', tr('subLord')) + '</dt><dd>' + pn(p.subLord) + '</dd><dt>' + term('sub_sub_lord', tr('subSub')) + '</dt><dd>' + pn(p.subSubLord) + '</dd></dl>' +
    (JC && JC.nakshatras && JC.nakshatras[p.nak] ? '<p class="sub">' + esc(L(JC.nakshatras[p.nak].summary)) + '</p>' : '') + '</div>';
  if (PL9.includes(id)) {
    const ruled = []; for (let s = 0; s < 12; s++) if (SIGN_LORD[s] === id) ruled.push(houseOf(C, s));
    if (ruled.length) h += '<div class="dsec"><h4>🏠 ' + tr('rules') + '</h4><p>' + ruled.map(x => '<button type="button" class="chip" data-k="h:' + x + '">' + tr('house') + ' ' + num(x) + ' · ' + sgn(signOfHouse(C.asc.sign, x)) + '</button>').join(' ') + '</p></div>';
    const ag = aspectsGiven(C, id), ar = aspectsReceived(C, p.sign, id);
    h += '<div class="dsec"><h4>👁️ ' + term('drishti', tr('aspectsGiven')) + '</h4><p>' + ag.map(a => '<button type="button" class="chip" data-k="h:' + a.h + '">' + ord(a.n) + ' → ' + tr('house') + ' ' + num(a.h) + (a.occ.length ? ' (' + a.occ.map(pab).join(', ') + ')' : '') + '</button>').join(' ') + '</p>' + (jp && jp.aspectNote ? '<p class="sub">' + esc(L(jp.aspectNote)) + '</p>' : '') +
      '<h4 style="margin-top:6px">' + tr('aspectsRecv') + '</h4><p>' + (ar.length ? ar.map(pChip).join(' ') : tr('noneP')) + '</p></div>';
  }
  if (p.dignity && JC && JC.dignity && JC.dignity[p.dignity]) h += '<div class="dsec"><h4>⚖️ ' + tr('dignity') + ': ' + digName(p.dignity) + '</h4><p class="sub">' + esc(L(JC.dignity[p.dignity].desc)) + '</p>' + (p.retro && id !== 'Ra' && id !== 'Ke' && JC.retro ? '<p class="sub">℞ ' + esc(L(JC.retro.desc)) + '</p>' : '') + (p.combust && JC.combust ? '<p class="sub">☀️ ' + esc(L(JC.combust.desc)) + '</p>' : '') + '</div>';
  if (p.avasthas) {
    const av = p.avasthas;
    h += '<div class="dsec"><h4>🌗 ' + term('avastha', tr('avasthas')) + '</h4><dl class="kv">' + ['baladi', 'jagradadi', 'deeptadi', 'lajjitadi'].filter(k => av[k]).map(k => { const st = JC && JC.avasthas && JC.avasthas[k] && JC.avasthas[k].states && JC.avasthas[k].states[av[k]]; return '<dt>' + tr(k) + '</dt><dd>' + esc(st ? L(st.name) : av[k]) + (st && st.desc ? '<div class="sub">' + esc(L(st.desc)) + '</div>' : '') + '</dd>'; }).join('') + '</dl></div>';
  }
  const ys = C.yogas.filter(y => y.present && y.planets && y.planets.includes(id));
  if (PL9.includes(id)) h += '<div class="dsec"><h4>✨ ' + tr('yogasInv') + '</h4><p>' + (ys.length ? ys.map(y => '<button type="button" class="chip" data-yoga="' + y.id + '">' + esc(yogaName(y.id)) + '</button>').join(' ') : tr('noneP')) + '</p></div>';
  if (PL9.includes(id)) {
    const mds = C.dashas.vimshottari.tree.filter(n => n.lord === id), now = nowJd();
    const cur = JE.dashaAt(C.dashas.vimshottari.tree, now, 1)[0];
    let ads = [];
    if (cur) { const md = C.dashas.vimshottari.tree.find(n => n.start === cur.start); if (md) ads = md.children.filter(n => n.lord === id); }
    h += '<div class="dsec"><h4>⏳ ' + tr('dashasRules') + '</h4>' + mds.map(n => '<p>' + tr('mahadasha') + ': <b>' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO) + '</b> <span class="sub">(' + tr('age') + ' ' + fx(Math.max(0, ageAt(C, n.start)), 1) + '–' + fx(ageAt(C, n.end), 1) + ')</span>' + (now >= n.start && now < n.end ? ' <span class="pill green">' + tr('now') + '</span>' : '') + '</p>').join('') +
      ads.map(n => '<p class="sub">' + tr('antardasha') + ' ' + pn(cur.lord) + '–' + pn(id) + ': ' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO) + '</p>').join('') + '<button type="button" class="btn xs" data-go="dasha:vim">' + tr('dasha') + ' →</button></div>';
  }
  if (jp) h += '<details class="x"><summary>🪐 ' + tr('karakatwa') + '</summary><div class="body"><p>' + esc(L(jp.karakatwa)) + '</p><p class="sub">' + esc(L(jp.nature)) + '</p><p class="sub"><b>' + tr('keywords') + ':</b> ' + esc(L(jp.keywords)) + '</p></div></details>';
  const rm = JC && JC.remedies && JC.remedies[id];
  if (rm) h += '<details class="x"><summary>🪔 ' + tr('remedy') + '</summary><div class="body"><dl class="kv">' + ['mantra', 'day', 'charity', 'colour', 'practice', 'gemstone'].filter(k => rm[k]).map(k => '<dt>' + esc(remName(k)) + '</dt><dd>' + esc(L(rm[k])) + '</dd>').join('') + '</dl><p class="sub">' + esc(L(rm.note)) + '</p></div></details>';
  return h;
}
const REM = { mantra: ['Mantra', 'मंत्र'], day: ['Day', 'दिन'], charity: ['Charity', 'दान'], colour: ['Colour', 'रंग'], practice: ['Practice', 'अभ्यास'], gemstone: ['Gemstone', 'रत्न'] };
const remName = k => REM[k] ? REM[k][hi() ? 1 : 0] : k;
const yogaName = id => (JC && JC.yogas && JC.yogas[id]) ? L(JC.yogas[id].name) : id.replace(/_/g, ' ');
function detailHouse(C, h, vk) {
  vk = vk || 'D1';
  let asc = C.asc.sign, signs = null;
  if (vk === 'moon') asc = P(C, 'Mo').sign;
  else if (vk !== 'D1' && vk !== 'chalit' && C.vargas[vk]) { asc = C.vargas[vk].asc; signs = C.vargas[vk].planets; }
  const s = signOfHouse(asc, h);
  const occ = vk === 'chalit' ? PL9.filter(id => P(C, id).bhavaChalit === h) : PL9.concat(S.outer ? OUTER : []).filter(id => (signs ? signs[id] : P(C, id).sign) === s);
  const lord = SIGN_LORD[s], lp = P(C, lord), lordSign = signs ? signs[lord] : lp.sign, lordH = ((lordSign - asc + 12) % 12) + 1;
  const jh = JC && JC.houses && JC.houses[h], js = JC && JC.signs && JC.signs[s];
  let html = '<div class="dhead"><div class="dglyph" style="background:var(--accent)">' + num(h) + '</div><div><b style="font-family:Baloo 2;font-size:1.15rem">' + (jh ? esc(L(jh.name)) : tr('house') + ' ' + num(h)) + '</b><div class="sub">' + sgn(s) + (vk !== 'D1' ? ' · ' + esc(vargaTitle(vk)) : '') + (jh ? ' · ' + esc(L(jh.sanskrit)) : '') + '</div></div></div>';
  html += '<dl class="kv"><dt>' + tr('sign') + '</dt><dd>' + sgn(s) + (js ? ' — ' + esc(L(js.keywords)) : '') + '</dd><dt>' + term('bhavesh', tr('houseLord')) + '</dt><dd>' + pChip(lord) + ' ' + tr('placedIn') + ' ' + num(lordH) + ' (' + sgn(lordSign) + ')</dd>' +
    '<dt>' + tr('occupants') + '</dt><dd>' + (occ.length ? occ.map(pChip).join(' ') : tr('noneP')) + '</dd>' +
    '<dt>' + tr('aspectsRecv') + '</dt><dd>' + (aspectsReceived(C, s, null, signs).map(pChip).join(' ') || tr('noneP')) + '</dd>' +
    (vk === 'D1' ? '<dt>' + term('sav', tr('bindus')) + '</dt><dd>' + num(C.ashtakavarga.sav[s]) + ' / ' + num(56) + '</dd><dt>' + term('bhava_bala', tr('bhavaBala')) + '</dt><dd>' + fx(C.bhavabala[h - 1].rupas, 2) + ' ' + tr('rupas') + '</dd><dt>' + term('bhava_chalit', tr('cusp')) + '</dt><dd>' + sgn(Math.floor(C.bhavaChalit.houses[h - 1].cusp / 30)) + ' ' + dms(C.bhavaChalit.houses[h - 1].cusp % 30) + '</dd>' : '') + '</dl>';
  if (vk === 'D1' && h === 1) html += '<div class="dsec reading"><h4>🌅 ' + tr('lagna') + ': ' + sgn(C.asc.sign) + ' ' + dms(C.asc.deg, true) + '</h4>' + (C.asc.vargottama === true || planetFlags(C, C.asc).length ? '<p>' + (C.asc.vargottama === true ? '<span class="pill gold">' + tr('vargottama') + '</span> ' : '') + planetFlags(C, C.asc).map(f => '<span class="pill ' + f.cls + '" title="' + esc(f.text) + '">' + f.ic + ' ' + tr(f.k) + '</span>').join(' ') + '</p>' : '') + '<p class="sub">' + nkn(C.asc.nak) + ' ' + tr('pada') + ' ' + num(C.asc.pada) + ' · ' + tr('nakLord') + ' ' + pn(C.asc.nakLord) + ' · ' + tr('subLord') + ' ' + pn(C.asc.subLord) + '</p>' + (JC && JC.lagna ? '<p>' + esc(L(JC.lagna[C.asc.sign].summary)) + '</p>' : '') + '</div>';
  if (jh) html += '<div class="dsec reading"><h4>🏠 ' + esc(L(jh.type)) + '</h4><p><b>' + esc(L(jh.significations)) + '</b></p><p>' + esc(L(jh.description)) + '</p></div>';
  if (vk !== 'D1' && JC && JC.vargas && JC.vargas[vk]) html += '<div class="dsec"><h4>🔲 ' + esc(vargaTitle(vk)) + '</h4><p class="sub">' + esc(L(JC.vargas[vk].purpose)) + '</p></div>';
  if (js) html += '<details class="x"><summary>♈ ' + sgn(s) + '</summary><div class="body"><p>' + esc(L(js.description)) + '</p><p class="sub">' + esc(L(js.element)) + ' · ' + esc(L(js.quality)) + ' · ' + esc(L(js.body)) + '</p></div></details>';
  return html;
}
function openKey(k, ctx, trigger) {
  const C0 = curChart(); if (!C0) return;
  const C = (ctx || '').startsWith('main') ? scrubChart(C0) : C0;
  const vk = ctxVk(ctx);
  const [t, v] = k.split(':');
  if (t === 'p') { HL = { p: [v] }; showDetail(esc(pn(v)), detailPlanet(C, v, vk), trigger); }
  else if (t === 'h') {
    const h = +v; let asc = C.asc.sign; if (vk === 'moon') asc = P(C, 'Mo').sign; else if (C.vargas[vk] && vk !== 'D1') asc = C.vargas[vk].asc;
    HL = { s: [signOfHouse(asc, h)] }; showDetail(tr('house') + ' ' + num(h) + ' · ' + sgn(signOfHouse(asc, h)), detailHouse(C, h, vk), trigger);
  } else if (t === 't') { const tp = (TRANSIT.last || []).find(x => x.id === v); if (tp) showDetail(esc(pn(v)) + ' · ' + tr('transits'), transitDetail(C, tp), trigger); return; }
  if ((ctx || '').startsWith('main')) { const box = $('#mainChart'); if (box) { box.innerHTML = mainChartSvg(scrubChart(C0), false); applyZoom(); const el = box.querySelector('[data-k="' + k + '"]'); if (el && trigger && trigger.closest && trigger.closest('svg')) el.focus({ preventScroll: true }); } }
}

/* ---------------------------------------------------------------------
   11. Planets table, birth details, Jaimini
   --------------------------------------------------------------------- */
function viewPlanets(C) {
  const ids = PL9.concat(S.outer ? OUTER : []);
  const avn = (k, v) => { const st = v && JC && JC.avasthas && JC.avasthas[k] && JC.avasthas[k].states && JC.avasthas[k].states[v]; return st ? L(st.name).split(' (')[0] : (v || '—'); };
  let rows = '<tr class="click" data-k="h:1"><td><b style="color:var(--accent)">' + tr('lagna') + '</b></td><td>' + sgn(C.asc.sign) + '</td><td class="num">' + dms(C.asc.deg, true) + '</td><td>' + nkn(C.asc.nak) + ' ' + num(C.asc.pada) + '</td><td>' + pn(C.asc.nakLord) + '</td><td>' + pn(C.asc.subLord) + '</td><td>' + pn(C.asc.subSubLord) + '</td><td class="num">1</td><td class="num">1</td><td>' + (planetFlags(C, C.asc).map(f => '<span class="pill ' + f.cls + '" title="' + esc(tr(f.k) + (f.text ? ': ' + f.text : '')) + '">' + f.ic + '</span>').join(' ') + (C.asc.vargottama === true ? ' <span class="pill gold" title="' + esc(tr('vargottama')) + '">V</span>' : '') || '—') + '</td><td></td><td></td><td></td><td>' + pn(SIGN_LORD[C.asc.sign]) + '</td><td></td><td></td><td></td><td></td><td></td></tr>';
  for (const id of ids) {
    const p = P(C, id); if (!p) continue;
    rows += '<tr class="click" data-k="p:' + id + '" tabindex="0"><td><b style="color:' + pcol(id) + '">' + esc(pn(id)) + '</b></td><td>' + sgn(p.sign) + '</td><td class="num">' + dms(p.deg, true) + '</td><td>' + nkn(p.nak) + ' ' + num(p.pada) + '</td><td>' + pn(p.nakLord) + '</td><td>' + pn(p.subLord) + '</td><td>' + pn(p.subSubLord) + '</td><td class="num">' + num(p.house) + '</td><td class="num' + (p.bhavaChalit !== p.house ? ' bad' : '') + '">' + num(p.bhavaChalit) + '</td>' +
      '<td>' + (p.dignity ? '<span class="pill ' + digCls(p.dignity) + '">' + digName(p.dignity) + '</span>' : '—') + planetFlags(C, p).map(f => ' <span class="pill ' + f.cls + '" title="' + esc(tr(f.k) + (f.text ? ': ' + f.text : '')) + '">' + f.ic + '</span>').join('') + (isVargottama(C, p) && PL9.includes(id) ? ' <span class="pill gold" title="' + esc(tr('vargottama')) + '">V</span>' : '') + '</td><td>' + (p.retro && id !== 'Ra' && id !== 'Ke' ? '℞' : '') + '</td><td>' + (p.combust ? '<span class="bad">' + tr('combust') + '</span>' : '') + '</td><td class="num">' + fx(p.speed, 3) + '</td><td>' + pn(SIGN_LORD[p.sign]) + '</td>' +
      '<td>' + esc(avn('baladi', p.avasthas && p.avasthas.baladi)) + '</td><td>' + esc(avn('jagradadi', p.avasthas && p.avasthas.jagradadi)) + '</td><td>' + esc(avn('deeptadi', p.avasthas && p.avasthas.deeptadi)) + '</td><td>' + esc(avn('lajjitadi', p.avasthas && p.avasthas.lajjitadi)) + '</td><td>' + (p.karaka ? esc(p.karaka) : '') + '</td></tr>';
  }
  const head = [tr('planet'), tr('sign'), tr('degree'), tr('nakshatra'), tr('nakLord'), tr('subLord'), tr('subSub'), tr('house'), tr('chalit'), tr('dignity'), '℞', tr('combust'), tr('speed'), tr('lord'), tr('baladi'), tr('jagradadi'), tr('deeptadi'), tr('lajjitadi'), tr('karaka')];
  let html = provChips(C) + '<div class="chartlayout"><div class="card" id="tourPlanets"><h2>📋 ' + tr('planetTable') + '</h2><p class="sub">' + tr('tableHint') + '</p><div class="tablewrap"><table><thead><tr>' + head.map((h, i) => '<th' + ([2, 7, 8, 12].includes(i) ? ' class="num"' : '') + '>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="row" style="margin-top:10px"><span class="pill">MC: ' + sgn(Math.floor(C.mc / 30)) + ' ' + dms(C.mc % 30) + '</span><span class="pill">' + term('ayanamsa', tr('ayanamsa')) + ' ' + dms(C.meta.ayanamsaValue, true) + '</span></div></div>' +
    '<div class="detailpane" id="detailPane"><div class="card"><h2>👆 ' + tr('details') + '</h2><p class="sub">' + tr('tableHint') + '</p></div></div></div>';
  html += '<div class="card"><h2>🤝 ' + term('panchadha_maitri', hi() ? 'पंचधा मैत्री' : 'Compound relationships') + '</h2><div class="tablewrap"><table><thead><tr><th></th>' + PL9.map(id => '<th>' + pab(id) + '</th>').join('') + '</tr></thead><tbody>' + PL9.map(a => '<tr><td><b>' + pn(a) + '</b></td>' + PL9.map(b => a === b ? '<td>—</td>' : '<td><span class="pill ' + digCls(C.relationships[a][b]) + '">' + digName(C.relationships[a][b]) + '</span></td>').join('') + '</tr>').join('') + '</tbody></table></div></div>';
  return html;
}
function viewDetails(C) {
  const pc = C.panchang, av = C.avakhada;
  const pd = k => JC && JC.panchang && JC.panchang[k] ? '<div class="sub">' + esc(L(JC.panchang[k].desc)) + '</div>' : '';
  let html = provChips(C) + '<div class="grid2">';
  html += '<div class="card"><h2>🗓️ ' + tr('panchangBirth') + '</h2><dl class="kv">' +
    '<dt>' + term('tithi', tr('tithi')) + '</dt><dd>' + esc(L(pc.tithi.name)) + ' (' + esc(L(pc.pakshaName)) + ') · ' + tr('ends') + ' ' + fmtDate(pc.tithi.endISO, true) + pd('tithi') + '</dd>' +
    '<dt>' + term('vara', tr('vara')) + '</dt><dd>' + esc(L(pc.vara.name)) + ' · ' + pn(pc.vara.lord) + pd('vara') + '</dd>' +
    '<dt>' + term('nakshatra', tr('nakshatra')) + '</dt><dd>' + esc(L(pc.nakshatra.name)) + ' ' + num(pc.nakshatra.pada) + ' · ' + pn(pc.nakshatra.lord) + ' · ' + tr('ends') + ' ' + fmtDate(pc.nakshatra.endISO, true) + '</dd>' +
    '<dt>' + term('panchang_yoga', tr('yoga')) + '</dt><dd>' + esc(L(pc.yoga.name)) + ' · ' + tr('ends') + ' ' + fmtDate(pc.yoga.endISO, true) + pd('yoga') + '</dd>' +
    '<dt>' + term('karana', tr('karana')) + '</dt><dd>' + esc(L(pc.karana.name)) + ' · ' + tr('ends') + ' ' + fmtDate(pc.karana.endISO, true) + '</dd>' +
    '<dt>' + term('sunrise', tr('sunrise')) + '</dt><dd>' + fmtTime(pc.sunriseISO) + ' · ' + tr('sunset') + ' ' + fmtTime(pc.sunsetISO) + '</dd>' +
    '<dt>' + tr('moonrise') + '</dt><dd>' + fmtTime(pc.moonriseISO) + ' · ' + tr('moonset') + ' ' + fmtTime(pc.moonsetISO) + '</dd>' +
    '<dt></dt><dd><span class="pill ' + (pc.isDayBirth ? 'gold' : 'indigo') + '">' + (pc.isDayBirth ? '☀️ ' + tr('dayBirth') : '🌙 ' + tr('nightBirth')) + '</span></dd></dl>' +
    (pc.warnings && pc.warnings.length ? '<div class="banner warn">' + pc.warnings.map(w => esc(L(w))).join('<br>') + '</div>' : '') + '</div>';
  const avv = (k, v) => { const o = JC && JC.avakhada && JC.avakhada.values && JC.avakhada.values[k]; return o && o[v] ? L(o[v]) : String(v); };
  const avt = k => { const t = JC && JC.avakhada && JC.avakhada.terms && JC.avakhada.terms[k]; return t ? L(t.name) : k; };
  const avRows = [['varna', avv('varna', av.varna)], ['vashya', avv('vashya', av.vashya)], ['yoni', avv('yoni', av.yoni)], ['gana', avv('gana', av.gana)], ['nadi', avv('nadi', av.nadi)], ['tatva', avv('tatva', av.tatva)], ['paya', avv('paya', av.paya)],
    ['rashi', L(av.rashiName)], ['rashiLord', pn(av.rashiLord)], ['nakshatra', L(av.nakshatraName) + ' · ' + tr('pada') + ' ' + num(av.pada)], ['nakLord', pn(av.nakLord)], ['yunja', avv('yunja', av.yunja)]];
  html += '<div class="card"><h2>🔱 ' + term('avakhada', tr('avakhada')) + '</h2>' + (JC && JC.avakhada ? '<p class="sub">' + esc(L(JC.avakhada.intro)) + '</p>' : '') +
    '<div class="banner info" style="text-align:center"><span class="lbl">' + term('naam_akshar', tr('naamAkshar')) + '</span><div style="font-family:Baloo 2;font-size:1.6rem;color:var(--accent-d)">' + (L(av.nameSyllables) || []).map((s, i) => '<span style="' + (i === av.pada - 1 ? 'background:var(--chart-hl);border-radius:8px;padding:0 6px' : 'opacity:.6;padding:0 6px') + '">' + esc(s) + '</span>').join(' ') + '</div><div class="sub">' + (hi() ? 'आपके पाद का अक्षर: ' : 'Syllable for your pada: ') + '<b>' + esc(L(av.nameSyllable)) + '</b></div></div>' +
    '<dl class="kv">' + avRows.map(([k, v]) => '<dt>' + esc(avt(k)) + '</dt><dd>' + esc(v) + '</dd>').join('') +
    '<dt>' + tr('tithi') + '</dt><dd>' + esc(L(av.tithi)) + '</dd><dt>' + tr('yoga') + '</dt><dd>' + esc(L(av.yoga)) + '</dd><dt>' + tr('karana') + '</dt><dd>' + esc(L(av.karana)) + '</dd><dt>' + tr('vara') + '</dt><dd>' + esc(L(av.vara)) + '</dd><dt>' + tr('lagna') + '</dt><dd>' + sgn(av.lagna) + ' · ' + pn(av.lagnaLord) + '</dd></dl></div>';
  // bhava chalit
  const ch = C.bhavaChalit;
  html += '<div class="card"><h2>🏠 ' + term('bhava_chalit', tr('bhavaChalitT')) + '</h2><div class="compare"><div class="chartwrap" style="max-width:300px">' + chartSVG(chartModel(C, 'chalit'), { ctx: 'main:chalit', label: tr('chalitChart'), title: tr('chalit') }) + '</div><div class="tablewrap"><table><thead><tr><th>' + tr('planet') + '</th><th class="num">' + tr('rashiHouse') + '</th><th class="num">' + tr('chalitHouse') + '</th></tr></thead><tbody>' +
    PL9.map(id => { const p = P(C, id); return '<tr class="click' + (p.house !== p.bhavaChalit ? ' chg' : '') + '" data-k="p:' + id + '"><td>' + pn(id) + '</td><td class="num">' + num(p.house) + '</td><td class="num">' + num(p.bhavaChalit) + (p.house !== p.bhavaChalit ? ' ↷' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
    '<details class="x"><summary>' + tr('cusp') + ' · ' + tr('start') + ' · ' + tr('end') + '</summary><div class="body"><div class="tablewrap"><table><thead><tr><th>' + tr('house') + '</th><th>' + tr('start') + '</th><th>' + tr('cusp') + '</th><th>' + tr('end') + '</th></tr></thead><tbody>' +
    ch.houses.map(h => '<tr><td>' + num(h.house) + '</td><td>' + lonStr(h.start) + '</td><td><b>' + lonStr(h.cusp) + '</b></td><td>' + lonStr(h.end) + '</td></tr>').join('') + '</tbody></table></div></div></details></div>';
  // special lagnas & upagrahas
  const SL = { hora: 'hora_lagna', ghati: 'ghati_lagna', bhava: 'bhava_lagna', sree: 'sree_lagna', indu: 'indu_lagna', varnada: 'varnada_lagna', pranapada: 'pranapada' };
  const nm = k => { const g = JC && JC.glossary && JC.glossary[k]; return g ? L(g.term) : k; };
  html += '<div class="card"><h2>🎯 ' + term('special_lagna', tr('specialLagnas')) + '</h2><div class="tablewrap"><table><thead><tr><th>' + tr('name') + '</th><th>' + tr('sign') + '</th><th class="num">' + tr('degree') + '</th><th class="num">' + tr('house') + '</th></tr></thead><tbody>' +
    Object.keys(SL).filter(k => C.specialLagnas[k]).map(k => { const v = C.specialLagnas[k]; return '<tr><td>' + term(SL[k], nm(SL[k])) + '</td><td>' + sgn(v.sign) + '</td><td class="num">' + (v.deg != null ? dms(v.deg) : '—') + '</td><td class="num">' + num(houseOf(C, v.sign)) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    '<h3>🌑 ' + term('upagraha', tr('upagrahas')) + '</h3><div class="tablewrap"><table><thead><tr><th>' + tr('name') + '</th><th>' + tr('sign') + '</th><th class="num">' + tr('degree') + '</th><th class="num">' + tr('house') + '</th></tr></thead><tbody>' +
    upaKeys(C).map(k => { const v = C.upagrahas[k]; return '<tr><td>' + upaName(k) + '</td><td>' + sgn(v.sign) + '</td><td class="num">' + dms(v.deg) + '</td><td class="num">' + num(houseOf(C, v.sign)) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    (C.upagrahas.note ? '<p class="sub">' + esc(L(C.upagrahas.note)) + '</p>' : '') + (JC && JC.chartPoints && JC.chartPoints.upagrahas && JC.chartPoints.upagrahas.method ? '<p class="sub">' + esc(L(JC.chartPoints.upagrahas.method)) + '</p>' : '') + '</div>';
  if (C.points && typeof C.points === 'object' && Object.keys(C.points).length) html += '<div class="card"><h2>🎯 ' + tr('badhakaMaraka') + '</h2><dl class="kv">' + Object.keys(C.points).filter(k => k !== 'note').map(k => '<dt>' + esc(pointName(k)) + '</dt><dd><b>' + esc(pointVal(C, C.points[k])) + '</b>' + (pointRule(C.points[k]) ? '<div class="sub">' + esc(pointRule(C.points[k])) + '</div>' : '') + '</dd>').join('') + '</dl>' + (C.points.note ? '<p class="sub">' + esc(L(C.points.note)) + '</p>' : '') + (C.meta && C.meta.timeUnknown ? '<p class="sub">⏰ ' + tr('timeUnknown') + ' — ≈</p>' : '') + '</div>';
  html += '</div>';
  return html;
}
const lonStr = l => sab(Math.floor(norm(l) / 30)) + ' ' + dms(norm(l) % 30);
function viewJaimini(C) {
  const J = C.jaimini;
  const kt = (sch, title) => '<h3>' + title + '</h3><div class="tablewrap"><table><thead><tr><th>' + tr('karaka') + '</th><th>' + tr('planet') + '</th><th class="num">' + tr('degree') + '</th></tr></thead><tbody>' + Object.keys(J.karakas[sch]).map(k => { const id = J.karakas[sch][k], p = P(C, id); return '<tr class="click" data-k="p:' + id + '"><td><b>' + esc(k) + '</b> · ' + kName(k) + '</td><td>' + pn(id) + '</td><td class="num">' + dms(id === 'Ra' ? 30 - p.deg : p.deg) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  const tags = {};
  const addTag = (s, t) => (tags[s] = tags[s] || []).push(t);
  for (const k in J.arudhas) addTag(J.arudhas[k], k === 'A1' ? 'AL' : k === 'A12' ? 'UL' : k);
  let html = provChips(C) + '<div class="grid2">';
  const used = J.karakas && J.karakas.used != null ? String(J.karakas.used) : (S.eng && S.eng.karakas ? String(S.eng.karakas) : '');
  const usedMark = n => used && (used === String(n) || used === (n === 7 ? 'seven' : 'eight')) ? ' <span class="pill green">✓ ' + (hi() ? 'उपयोग में' : 'in use') + '</span>' : '';
  html += '<div class="card"><h2>👑 ' + term('chara_karaka', tr('karakas7')) + '</h2>' + (J.karakas && J.karakas.note ? '<p class="sub">' + esc(L(J.karakas.note)) + ' <button type="button" class="btn xs" data-go="more:settings">⚙️</button></p>' : '') + kt('seven', tr('karakas7') + usedMark(7)) + kt('eight', tr('karakas8') + usedMark(8)) + '</div>';
  html += '<div class="card"><h2>🪞 ' + term('arudha', tr('arudhas')) + '</h2><div class="chartwrap" style="max-width:380px">' + chartSVG(chartModel(C, 'D1'), { ctx: 'main:D1', label: tr('arudhas'), title: tr('arudhas'), tags, hl: { s: [J.arudhaLagna, J.upapada] } }) + '</div>' +
    '<div class="chips"><span class="pill saff">' + term('arudha_lagna', tr('arudhaLagna')) + ': ' + sgn(J.arudhaLagna) + '</span><span class="pill indigo">' + term('upapada', tr('upapada')) + ': ' + sgn(J.upapada) + '</span></div>' +
    '<div class="tablewrap"><table><thead><tr><th>Pada</th><th>' + tr('house') + '</th><th>' + tr('sign') + '</th></tr></thead><tbody>' + Object.keys(J.arudhas).map(k => '<tr><td><b>' + k + '</b></td><td>' + num(+k.slice(1)) + '</td><td>' + sgn(J.arudhas[k]) + '</td></tr>').join('') + '</tbody></table></div></div>';
  html += '<div class="card"><h2>👁️ ' + term('rashi_drishti', tr('rashiDrishti')) + '</h2><div class="tablewrap"><table><thead><tr><th>' + tr('sign') + '</th><th>' + tr('aspectsSigns') + '</th></tr></thead><tbody>' +
    J.rashiDrishti.map((arr, s) => '<tr><td><b>' + sgn(s) + '</b> <span class="sub">(' + tr('house') + ' ' + num(houseOf(C, s)) + ')</span></td><td class="wrap">' + arr.map(sgn).join(', ') + '</td></tr>').join('') + '</tbody></table></div></div>';
  html += '<div class="card"><h2>🧱 ' + term('argala', tr('argala')) + '</h2>' + J.argala.map(a => '<details class="x"><summary>' + tr('house') + ' ' + num(a.house) + ' · ' + sgn(a.sign) + ' <span class="pill' + (a.argala.some(x => x.effective) ? ' green' : '') + '">' + num(a.argala.filter(x => x.effective).length) + '/' + num(a.argala.length) + '</span></summary><div class="body">' +
    (a.argala.length ? a.argala.map(x => '<p>' + ord(x.from) + ': ' + x.planets.map(pn).join(', ') + ' — ' + (x.effective ? '<span class="ok">' + tr('effective') + '</span>' : '<span class="bad">' + tr('obstructed') + '</span> (' + ord(x.obstructionFrom) + ': ' + (x.obstructers.map(pn).join(', ') || '—') + ')') + '</p>').join('') : '<p class="sub">' + tr('noneP') + '</p>') + '</div></details>').join('') + '</div>';
  return html + '</div>';
}
/* ---------------------------------------------------------------------
   12. Vargas: grid, enlarge, compare, planet strip, vimsopaka
   --------------------------------------------------------------------- */
const VS = { open: 'D9', cmp: false, a: 'D1', b: 'D9', planet: 'Su', scheme: 'shodashavarga' };
function viewVargas(C) {
  let html = provChips(C);
  const vopt = sel => VARGAS.map(v => '<option value="' + v + '"' + (sel === v ? ' selected' : '') + '>' + esc(vargaTitle(v)) + '</option>').join('');
  html += '<div class="card"><div class="row between"><h2>🔲 ' + tr('vargaGrid') + '</h2><div class="row">' + styleSeg('vStyle') + '<button type="button" class="btn sm' + (VS.cmp ? ' on' : '') + '" data-act="vcmp" aria-pressed="' + VS.cmp + '">⚖️ ' + tr('compareMode') + '</button></div></div>';
  if (VS.cmp) {
    const A = chartModel(C, VS.a), B = chartModel(C, VS.b);
    const same = PL9.filter(id => (A.list.find(x => x.id === id) || {}).sign === (B.list.find(x => x.id === id) || {}).sign);
    html += '<div class="compare" style="margin-top:8px"><div><label class="vh" for="vA">A</label><select id="vA" class="inline">' + vopt(VS.a) + '</select><div class="chartwrap">' + chartSVG(A, { ctx: 'varga:' + VS.a, label: vargaTitle(VS.a), title: VS.a, subtitle: sgn(A.asc), hl: { p: same } }).replace('class="chart', 'class="chart swap') + '</div></div>' +
      '<div><label class="vh" for="vB">B</label><select id="vB" class="inline">' + vopt(VS.b) + '</select><div class="chartwrap">' + chartSVG(B, { ctx: 'varga:' + VS.b, label: vargaTitle(VS.b), title: VS.b, subtitle: sgn(B.asc), hl: { p: same } }).replace('class="chart', 'class="chart swap') + '</div></div></div>' +
      '<p class="sub" style="margin-top:6px">✨ ' + tr('sameSign') + ': ' + (same.length ? same.map(pn).join(', ') : tr('noneP')) + (A.asc === B.asc ? ' · ' + tr('lagna') : '') + '</p>' +
      '<div class="tablewrap"><table><thead><tr><th>' + tr('planet') + '</th><th>' + esc(VS.a) + '</th><th>' + esc(VS.b) + '</th></tr></thead><tbody><tr><td>' + tr('lagna') + '</td><td>' + sgn(A.asc) + '</td><td>' + sgn(B.asc) + '</td></tr>' +
      PL9.map(id => { const a = A.list.find(x => x.id === id), b = B.list.find(x => x.id === id); return '<tr class="' + (a.sign === b.sign ? 'chg' : '') + '"><td>' + pn(id) + '</td><td>' + sgn(a.sign) + (a.dig ? ' <span class="pill ' + digCls(a.dig) + '">' + digName(a.dig) + '</span>' : '') + '</td><td>' + sgn(b.sign) + (b.dig ? ' <span class="pill ' + digCls(b.dig) + '">' + digName(b.dig) + '</span>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  } else {
    html += '<div class="vgrid" style="margin-top:10px">' + VARGAS.map(v => { const M = chartModel(C, v), jv = JC && JC.vargas && JC.vargas[v]; return '<button type="button" class="vcell' + (VS.open === v ? ' sel' : '') + '" data-varga="' + v + '" aria-label="' + esc(vargaTitle(v)) + '"><b>' + esc(v) + '</b><small>' + esc(jv ? L(jv.area) : '') + '</small>' + chartSVG(M, { mini: true, ctx: 'mini', title: '', style: S.style }) + '</button>'; }).join('') + '</div>';
  }
  html += '</div>';
  if (!VS.cmp && VS.open) {
    const v = VS.open, M = chartModel(C, v), jv = JC && JC.vargas && JC.vargas[v];
    const nb = C.vargaInfo.nearBoundary.filter(x => x.varga === v);
    html += '<div class="chartlayout" id="vOpen"><div class="card"><h2>🔍 ' + esc(vargaTitle(v)) + '</h2><div class="chartwrap">' + chartSVG(M, { ctx: 'varga:' + v, label: vargaTitle(v), title: v, subtitle: sgn(M.asc) }).replace('class="chart', 'class="chart swap') + '</div><div class="legend">' + tr('legend') + '</div>' +
      (jv ? '<dl class="kv" style="margin-top:8px"><dt>' + tr('purpose') + '</dt><dd>' + esc(L(jv.purpose)) + '</dd><dt>' + tr('howRead') + '</dt><dd>' + esc(L(jv.howRead)) + '</dd>' : '<dl class="kv">') +
      '<dt>' + tr('method') + '</dt><dd>' + esc(L(C.vargaInfo.methods[v])) + '</dd></dl>' +
      (nb.length ? '<div class="banner warn">⚠️ ' + tr('nearBoundary') + ': ' + nb.map(x => pn(x.id) + ' (' + fx(x.distanceArcmin, 2) + '′)').join(', ') + '</div>' : '') + '</div>' +
      '<div class="detailpane" id="detailPane"><div class="card"><h2>👆 ' + tr('details') + '</h2><p class="sub">' + tr('tapHint') + '</p></div></div></div>';
  }
  // planet across vargas
  const pid = VS.planet;
  html += '<div class="card"><h2>🧭 ' + tr('acrossV') + '</h2><div class="chips" role="group">' + PL9.map(id => '<button type="button" class="chip' + (pid === id ? ' on' : '') + '" data-vplanet="' + id + '">' + esc(pn(id)) + '</button>').join('') + '</div>' +
    '<div class="vstrip">' + VARGAS.map(v => { const s = C.vargas[v].planets[pid], d = vDig(pid, s), vo = v !== 'D1' && s === C.vargas.D1.planets[pid]; return '<div class="' + d + (vo ? ' vo' : '') + '" title="' + esc(vargaTitle(v)) + '"><b>' + v + '</b>' + esc(sab(s)) + (d ? '<br><small>' + digName(d) + '</small>' : '') + '</div>'; }).join('') + '</div>' +
    '<div class="legend"><span><span class="sw" style="background:var(--green-l);border:1px solid var(--green)"></span>' + digName('exalted') + '</span><span><span class="sw" style="background:var(--blue-l);border:1px solid var(--blue)"></span>' + digName('own') + '</span><span><span class="sw" style="background:var(--red-l);border:1px solid var(--red)"></span>' + digName('debilitated') + '</span><span><span class="sw" style="outline:2px solid var(--gold)"></span>' + tr('sameSign') + ' (D1)</span></div></div>';
  // vimsopaka
  const sch = VS.scheme;
  html += '<div class="card"><h2>📊 ' + term('vimsopaka_bala', tr('vimsopaka')) + '</h2><div class="seg scroll" id="vimSeg">' + ['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga'].map(k => '<button type="button" data-v="' + k + '" class="' + (sch === k ? 'on' : '') + '">' + tr(k) + '</button>').join('') + '</div><div class="bars" style="margin-top:10px">' +
    PL7.map(id => { const v = C.vimsopaka[id][sch]; return '<div class="bar"><span style="color:' + pcol(id) + '">' + esc(pn(id)) + '</span><span class="tr"><span class="fl" style="width:' + (v / 20 * 100).toFixed(1) + '%;background:' + pcol(id) + '"></span><span class="req" style="left:50%" title="10"></span></span><span class="num">' + fx(v, 2) + '</span></div>'; }).join('') + '</div><p class="sub">' + (hi() ? 'रेखा = 10 (मध्य)। अधिक अंक = वर्गों में बेहतर स्थिति।' : 'Line = 10 (middle). Higher = better dignity across the vargas.') + '</p></div>';
  return html;
}

/* ---------------------------------------------------------------------
   13. Dasha explorer: zoomable timeline (SVG), drill-down, period cards
   --------------------------------------------------------------------- */
const DT = { sys: null, t0: 0, t1: 0, sel: null, rects: [], anim: 0, ptrs: new Map(), drag: null };
function dashaSys(C, sys) {
  const D = C.dashas;
  if (sys === 'yogini') return { roots: D.yogini.periods, max: 2, name: n => (JC && JC.yogini && JC.yogini[n.id] ? L(JC.yogini[n.id].name) : n.id) + ' · ' + pab(n.lord), short: n => pab(n.lord), color: n => pcol(n.lord), kids: n => n.children || [] };
  if (sys === 'ashtottari') return { roots: D.ashtottari.periods, max: 2, name: n => pn(n.lord), short: n => pab(n.lord), color: n => pcol(n.lord), kids: n => n.children || [] };
  if (sys === 'chara') return { roots: D.chara.periods, max: 2, name: n => sgn(n.sign), short: n => sab(n.sign), color: n => pcol(SIGN_LORD[n.sign]), kids: n => n.children || [] };
  return { roots: D.vimshottari.tree, max: 5, name: n => pn(n.lord), short: n => pab(n.lord), color: n => pcol(n.lord), kids: n => n.children || [] };
}
function dashaPathAt(sysO, jd) {
  const path = []; let list = sysO.roots;
  for (let l = 0; l < sysO.max && list && list.length; l++) { const n = list.find(x => jd >= x.start && jd < x.end); if (!n) break; path.push(n); list = sysO.kids(n); }
  return path;
}
function viewDasha(C, sub) {
  const sys = sub;
  const so = dashaSys(C, sys);
  if (DT.sys !== sys + C.meta.jdUT + S.ayan) {
    DT.sys = sys + C.meta.jdUT + S.ayan; DT.sel = null;
    const now = nowJd(); const a = Math.max(so.roots[0].start, Math.min(now, C.meta.jdUT)) - 365.25 * 2;
    DT.t0 = Math.max(so.roots[0].start, C.meta.jdUT - 365.25 * 2); DT.t1 = DT.t0 + 365.25 * 84; void a;
  }
  const now = nowJd(), path = dashaPathAt(so, now);
  const intro = JC && JC.dashaIntro ? L(JC.dashaIntro[sys === 'vim' ? 'vimshottari' : sys]) : '';
  let html = '<div class="card"><h2>⏳ ' + tr(sys) + ' ' + term(sys === 'vim' ? 'vimshottari' : sys === 'yogini' ? 'yogini_dasha' : sys === 'ashtottari' ? 'ashtottari_dasha' : 'chara_dasha', tr('dasha')) + '</h2><p class="sub">' + esc(intro) + '</p>';
  if (sys === 'vim') { const b = C.dashas.vimshottari.balanceAtBirth; html += '<div class="chips"><span class="pill saff">' + term('dasha_balance', tr('balance')) + ': ' + pn(b.lord) + ' ' + fmtDur(b.totalYears) + '</span><span class="pill">' + tr('till') + ' ' + fmtDate(b.endISO) + '</span></div>'; }
  if (sys === 'yogini') { const b = C.dashas.yogini.balanceAtBirth; html += '<div class="chips"><span class="pill saff">' + tr('balance') + ': ' + esc(JC && JC.yogini && JC.yogini[b.id] ? L(JC.yogini[b.id].name) : b.id) + ' (' + pn(b.lord) + ') ' + fmtDur(b.years) + '</span></div>'; }
  if (sys === 'ashtottari') { const A = C.dashas.ashtottari; html += '<div class="banner ' + (A.applicable ? 'info' : 'warn') + '"><b>' + tr('applicable') + ':</b> ' + (A.applicable ? tr('applies') : tr('notApplies')) + '<br><span class="sub">' + esc(L(A.note)) + '</span><br><span class="sub">' + (hi() ? 'लग्नेश से राहु: ' : 'Rahu from lagna lord: ') + num(A.applicability.rahuFromLagnaLord) + ' · ' + (hi() ? 'राहु नियम ' : 'Rahu rule ') + (A.applicability.rahuRule ? '✓' : '✗') + ' · ' + (hi() ? 'पक्ष नियम ' : 'Paksha rule ') + (A.applicability.pakshaRule ? '✓' : '✗') + '</span></div>'; }
  if (sys === 'chara') { const A = C.dashas.chara; html += '<p class="sub">' + esc(L(A.note)) + '</p>'; }
  // running now
  html += '<h3>📍 ' + tr('currentPeriods') + '</h3><div class="curp">' + path.map((n, i) => '<button type="button" data-dsel="' + i + '" data-now="1"><span class="lv">' + tr(LEVEL_NAME[i + 1] || 'antardasha') + '</span><b style="color:' + so.color(n) + '">' + esc(so.name(n)) + '</b><span>' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO) + '</span></button>').join('') + '</div></div>';
  html += '<div class="card" id="tourDasha"><div class="tlbar noprint"><button type="button" class="btn sm" data-tl="in" aria-label="' + tr('zoomIn') + '">＋</button><button type="button" class="btn sm" data-tl="out" aria-label="' + tr('zoomOut') + '">－</button><button type="button" class="btn sm" data-tl="now">📍 ' + tr('now') + '</button><button type="button" class="btn sm" data-tl="life">🌍 ' + tr('life') + '</button><span class="sub">' + tr('tlHelp') + '</span></div>' +
    '<div class="tl" id="tl" tabindex="0" role="application" aria-label="' + tr('dasha') + ' timeline"></div><p class="sub" style="margin-top:4px">' + (so.max === 5 ? ['mahadasha', 'antardasha', 'pratyantar', 'sookshma', 'prana'] : ['mahadasha', 'antardasha']).map((k, i) => num(i + 1) + '. ' + tr(k)).join(' · ') + ' ↓</p><div class="crumbs" id="crumbs" style="margin-top:8px"></div></div>' +
    '<div class="card" id="dcard">' + periodCard(C, so, sys, DT.sel || path) + '</div>';
  // list
  html += '<div class="card"><h2>📜 ' + tr('periodList') + '</h2>' + so.roots.map(n => { const on = now >= n.start && now < n.end; return '<details class="x"' + (on ? ' open' : '') + '><summary><span class="pdot" style="background:' + so.color(n) + '"></span>' + esc(so.name(n)) + ' <span class="sub">' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO) + ' · ' + tr('age') + ' ' + fx(Math.max(0, ageAt(C, n.start)), 1) + '</span>' + (on ? '<span class="pill green">' + tr('now') + '</span>' : '') + '</summary><div class="body"><div class="tablewrap"><table><tbody>' +
    so.kids(n).map(c => '<tr' + (now >= c.start && now < c.end ? ' class="sel"' : '') + '><td><span class="pdot" style="background:' + so.color(c) + '"></span>' + esc(so.name(n)) + ' › ' + esc(so.name(c)) + '</td><td>' + fmtDate(c.startISO) + '</td><td>' + fmtDate(c.endISO) + '</td></tr>').join('') + '</tbody></table></div></div></details>'; }).join('') + '</div>';
  AFTER.push(() => { DT.C = C; DT.so = so; DT.sysName = sys; drawTL(); });
  return html;
}
function periodCard(C, so, sys, path) {
  if (so && so.card) return so.card(path);
  if (!path || !path.length) return '<p class="sub">' + tr('tlHelp') + '</p>';
  const n = path[path.length - 1], lvl = path.length;
  const dur = (n.end - n.start) / 365.25;
  let h = '<h2><span class="pdot" style="background:' + so.color(n) + ';width:14px;height:14px"></span>' + esc(path.map(so.name).join(' › ')) + '</h2>' +
    '<div class="chips"><span class="pill saff">' + tr(LEVEL_NAME[lvl] || 'antardasha') + '</span><span class="pill">' + fmtDate(n.startISO, lvl > 2) + ' – ' + fmtDate(n.endISO, lvl > 2) + '</span><span class="pill">' + tr('duration') + ' ' + fmtDur(dur) + '</span><span class="pill indigo">' + (n.end <= C.meta.jdUT ? tr('beforeBirth') : tr('age') + ' ' + fx(Math.max(0, ageAt(C, n.start)), 1) + '–' + fx(ageAt(C, n.end), 1)) + '</span>' + (nowJd() >= n.start && nowJd() < n.end ? '<span class="pill green">' + tr('youAreHere') + '</span>' : '') + '</div>';
  if (!JC) return h;
  if (sys === 'vim' || sys === 'ashtottari') {
    const md = path[0], dl = JC.dashaLord && JC.dashaLord[md.lord];
    if (lvl >= 2 && JC.antardasha && JC.antardasha[path[lvl - 2].lord] && JC.antardasha[path[lvl - 2].lord][n.lord]) h += '<p class="reading"><b>' + pn(path[lvl - 2].lord) + '–' + pn(n.lord) + ':</b> ' + esc(L(JC.antardasha[path[lvl - 2].lord][n.lord])) + '</p>';
    if (dl) {
      h += '<p class="reading"><b>' + tr('mahadasha') + ' ' + pn(md.lord) + ':</b> ' + esc(L(dl.summary)) + '</p>';
      const p = P(C, md.lord), pl = dl.placement || {}, notes = [];
      if (['exalted', 'own', 'moolatrikona'].includes(p.dignity) && pl.strong) notes.push(pl.strong);
      if ((p.dignity === 'debilitated' || p.combust) && pl.weak) notes.push(pl.weak);
      if ([1, 4, 5, 7, 9, 10].includes(p.house) && pl.kendra_trikona) notes.push(pl.kendra_trikona);
      if ([6, 8, 12].includes(p.house) && pl.dusthana) notes.push(pl.dusthana);
      if (PL9.some(q => q !== md.lord && ['Sa', 'Ra', 'Ke', 'Ma'].includes(q) && P(C, q).sign === p.sign) && pl.with_malefics) notes.push(pl.with_malefics);
      h += '<details class="x" open><summary>🧭 ' + tr('inYourChart') + ': ' + pn(md.lord) + ' ' + tr('inSign') + ' ' + sgn(p.sign) + ', ' + tr('house') + ' ' + num(p.house) + '</summary><div class="body reading">' + (notes.length ? notes.map(x => '<p>' + esc(L(x)) + '</p>').join('') : '<p class="sub">' + digName(p.dignity) + '</p>') + '</div></details>';
      h += '<details class="x"><summary>🌿 ' + tr('good') + '</summary><div class="body reading"><p>' + esc(L(dl.good)) + '</p></div></details><details class="x"><summary>⚠️ ' + tr('challenging') + '</summary><div class="body reading"><p>' + esc(L(dl.challenging)) + '</p></div></details>' + (dl.tip ? '<details class="x"><summary>💡 ' + tr('tip') + '</summary><div class="body reading"><p>' + esc(L(dl.tip)) + '</p></div></details>' : '');
    }
  } else if (sys === 'yogini') {
    const y = JC.yogini && JC.yogini[n.id]; if (y) h += '<p class="reading">' + esc(L(y.effect)) + '</p>';
    if (lvl === 2) { const y0 = JC.yogini[path[0].id]; if (y0) h += '<p class="sub">' + esc(L(y0.effect)) + '</p>'; }
  } else if (sys === 'chara') {
    const hh = houseOf(C, n.sign), js = JC.signs && JC.signs[n.sign], jh = JC.houses && JC.houses[hh];
    h += '<p class="reading"><b>' + sgn(n.sign) + '</b> — ' + tr('house') + ' ' + num(hh) + (jh ? ': ' + esc(L(jh.significations)) : '') + '</p>' + (js ? '<p class="sub">' + esc(L(js.keywords)) + '</p>' : '');
  }
  if (JC.dashaIntro && JC.dashaIntro.howToRead) h += '<details class="x"><summary>📖 ' + tr('howRead') + '</summary><div class="body reading"><p>' + esc(L(JC.dashaIntro.howToRead)) + '</p></div></details>';
  return h;
}
function tlTicks(t0, t1, W) {
  const spanY = (t1 - t0) / 365.25, want = spanY * 58 / Math.max(200, W);
  const steps = [1 / 365.25, 7 / 365.25, 1 / 12, 3 / 12, 6 / 12, 1, 2, 5, 10, 20, 50];
  return steps.find(s => s >= want) || 50;
}
function jdToYMD(jd, off) { const d = new Date((jd - 2440587.5) * DAY_MS + (off || 0) * 3600000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; }
function drawTL() {
  const box = $('#tl'); if (!box || !DT.C) return;
  const C = DT.C, so = DT.so, W = Math.max(280, box.clientWidth || 600);
  const rowH = W < 500 ? 28 : 32, top = 24, L = so.max, H = top + rowH * L + 26;
  const t0 = DT.t0, t1 = DT.t1, X = jd => (jd - t0) / (t1 - t0) * W;
  const rects = []; DT.rects = rects;
  const selKeys = new Set((DT.sel || []).map(n => n.start + ':' + n.end));
  const walk = (nodes, lvl, path) => {
    for (const n of nodes) {
      if (n.end < t0 || n.start > t1) continue;
      const x0 = X(n.start), x1 = X(n.end), w = x1 - x0;
      if (w < 0.6) continue;
      rects.push({ n, lvl, path: path.concat(n), x0, w });
      if (lvl < L && w > 14) walk(so.kids(n), lvl + 1, path.concat(n));
    }
  };
  walk(so.roots, 1, []);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg">';
  // axis (calendar years) top, age bottom
  const step = tlTicks(t0, t1, W), off = C.meta.utcOffsetUsed;
  const a = jdToYMD(t0, off), b = jdToYMD(t1, off);
  if (step >= 1) {
    for (let y = Math.ceil(a.y / step) * step; y <= b.y + 1; y += step) { const jd = JE.julianDay(y, 1, 1, -off); const x = X(jd); if (x < 0 || x > W) continue; s += '<line class="axl" x1="' + x.toFixed(1) + '" y1="' + (top - 4) + '" x2="' + x.toFixed(1) + '" y2="' + (H - 18) + '"/><text class="ax" x="' + (x + 2).toFixed(1) + '" y="14">' + num(y) + '</text>'; }
  } else if (step >= 1 / 12) {
    const mstep = Math.round(step * 12);
    for (let y = a.y, m = a.m; y * 12 + m <= b.y * 12 + b.m + 1; m += mstep) { while (m > 12) { m -= 12; y++; } if ((m - 1) % mstep) continue; const x = X(JE.julianDay(y, m, 1, -off)); if (x < 0 || x > W) continue; s += '<line class="axl" x1="' + x.toFixed(1) + '" y1="' + (top - 4) + '" x2="' + x.toFixed(1) + '" y2="' + (H - 18) + '"/><text class="ax" x="' + (x + 2).toFixed(1) + '" y="14">' + esc(MON[S.lang][m - 1].slice(0, hi() ? 6 : 3)) + ' ' + num(y) + '</text>'; }
  } else {
    const dstep = Math.round(step * 365.25);
    for (let jd = Math.floor(t0 + 0.5) - 0.5 - off / 24; jd <= t1; jd += 1) { const d = jdToYMD(jd + 0.01, off); if ((d.d - 1) % dstep) continue; const x = X(jd); if (x < 0) continue; s += '<line class="axl" x1="' + x.toFixed(1) + '" y1="' + (top - 4) + '" x2="' + x.toFixed(1) + '" y2="' + (H - 18) + '"/><text class="ax" x="' + (x + 2).toFixed(1) + '" y="14">' + num(d.d) + ' ' + esc(MON[S.lang][d.m - 1].slice(0, hi() ? 6 : 3)) + '</text>'; }
  }
  rects.forEach((r, i) => {
    const y = top + (r.lvl - 1) * rowH, sel = selKeys.has(r.n.start + ':' + r.n.end);
    s += '<rect class="dseg' + (sel ? ' sel' : '') + '" data-i="' + i + '" x="' + Math.max(-2, r.x0).toFixed(1) + '" y="' + y + '" width="' + Math.min(W + 4, r.w).toFixed(1) + '" height="' + (rowH - 3) + '" rx="5" style="fill:' + so.color(r.n) + ';opacity:' + (1 - (r.lvl - 1) * 0.12) + '"><title>' + esc(r.path.map(so.name).join(' › ') + ' · ' + fmtDate(r.n.startISO) + ' – ' + fmtDate(r.n.endISO)) + '</title></rect>';
    const vx0 = Math.max(0, r.x0), vx1 = Math.min(W, r.x0 + r.w), vw = vx1 - vx0;
    if (vw > 24) { const lab = vw > 80 ? so.name(r.n) + (r.lvl === 1 && vw > 130 ? ' · ' + num(jdToYMD(r.n.start, off).y) : '') : so.short(r.n); s += '<text x="' + (vx0 + vw / 2).toFixed(1) + '" y="' + (y + rowH / 2) + '" text-anchor="middle" dominant-baseline="middle" style="fill:#fff;font-size:' + (r.lvl === 1 ? 12 : 11) + 'px;paint-order:stroke;stroke:rgba(0,0,0,.35);stroke-width:2px">' + esc(lab) + '</text>'; }
  });
  // age axis
  const aStep = Math.max(step, 1 / 12);
  if (step >= 1) for (let ag = Math.ceil(ageAt(C, t0) / aStep) * aStep; ag <= ageAt(C, t1); ag += aStep) { if (ag < 0) continue; const x = X(C.meta.jdUT + ag * 365.25); if (x > W - 34) continue; s += '<text class="ax" x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + num(Math.round(ag)) + '</text>'; }
  s += '<text class="ax" x="' + (W - 4) + '" y="' + (H - 6) + '" text-anchor="end" style="font-weight:800">' + tr('age') + '</text>';
  const xb = X(C.meta.jdUT); if (xb >= 0 && xb <= W) s += '<line x1="' + xb.toFixed(1) + '" y1="' + (top - 6) + '" x2="' + xb.toFixed(1) + '" y2="' + (H - 18) + '" style="stroke:var(--accent-2);stroke-width:2;stroke-dasharray:3 3"/>';
  const xn = X(nowJd()); if (xn >= 0 && xn <= W) s += '<line class="now" x1="' + xn.toFixed(1) + '" y1="' + (top - 6) + '" x2="' + xn.toFixed(1) + '" y2="' + (H - 18) + '"/><text x="' + clamp(xn, 30, W - 30).toFixed(1) + '" y="' + (H - 20 + 0) + '" text-anchor="middle" style="fill:var(--red);font-size:10px;font-weight:800">▲ ' + esc(tr('youAreHere')) + '</text>';
  s += '</svg>';
  box.innerHTML = s;
  const cr = $('#crumbs');
  if (cr) cr.innerHTML = (DT.sel || []).length ? '<button type="button" data-crumb="-1">🌍 ' + tr('life') + '</button>' + DT.sel.map((n, i) => '<span class="sep">›</span><button type="button" data-crumb="' + i + '" style="box-shadow:inset 3px 0 0 ' + so.color(n) + '">' + esc(so.name(n)) + '</button>').join('') : '';
}
function tlAnimate(a, b) {
  cancelAnimationFrame(DT.anim);
  const s0 = DT.t0, s1 = DT.t1, start = performance.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380;
  const tok = DT.tok = (DT.tok || 0) + 1;
  const f = t => { if (tok !== DT.tok) return; const k = dur ? Math.min(1, (t - start) / dur) : 1, e = 1 - Math.pow(1 - k, 3); DT.t0 = s0 + (a - s0) * e; DT.t1 = s1 + (b - s1) * e; drawTL(); if (k < 1) DT.anim = requestAnimationFrame(f); };
  DT.anim = requestAnimationFrame(f);
  setTimeout(() => { if (tok === DT.tok && (DT.t0 !== a || DT.t1 !== b)) { cancelAnimationFrame(DT.anim); DT.t0 = a; DT.t1 = b; drawTL(); } }, dur + 150);
}
function tlSelect(path) {
  DT.sel = path; const n = path[path.length - 1], pad = (n.end - n.start) * 0.06;
  tlAnimate(n.start - pad, n.end + pad);
  const dc = $('#dcard'); if (dc) dc.innerHTML = periodCard(DT.C, DT.so, DT.sysName, path);
}
function tlZoom(f, cx) {
  const W = $('#tl').clientWidth || 600, at = DT.t0 + (cx == null ? 0.5 : cx / W) * (DT.t1 - DT.t0);
  let span = (DT.t1 - DT.t0) * f; span = clamp(span, 2, 365.25 * 130);
  const r = cx == null ? 0.5 : cx / W; DT.t0 = at - span * r; DT.t1 = DT.t0 + span; drawTL();
}
function tlBounds() { const so = DT.so; return [so.roots[0].start, so.roots[so.roots.length - 1].end]; }
function bindTL() {
  const box = $('#tl'); if (!box || box._b) return; box._b = 1;
  box.addEventListener('wheel', e => { e.preventDefault(); const r = box.getBoundingClientRect(); tlZoom(Math.exp(e.deltaY * 0.0015), e.clientX - r.left); }, { passive: false });
  box.addEventListener('pointerdown', e => { box.setPointerCapture(e.pointerId); DT.ptrs.set(e.pointerId, e.clientX); DT.drag = { x: e.clientX, t0: DT.t0, t1: DT.t1, moved: 0, target: e.target, dist: DT.ptrs.size === 2 ? Math.abs([...DT.ptrs.values()][0] - [...DT.ptrs.values()][1]) : 0 }; });
  box.addEventListener('pointermove', e => {
    if (!DT.drag || !DT.ptrs.has(e.pointerId)) return;
    DT.ptrs.set(e.pointerId, e.clientX);
    const W = box.clientWidth || 600;
    if (DT.ptrs.size === 2) { const v = [...DT.ptrs.values()], d = Math.abs(v[0] - v[1]); if (DT.drag.dist > 10 && d > 10) { const r = box.getBoundingClientRect(); tlZoom(DT.drag.dist / d, (v[0] + v[1]) / 2 - r.left); } DT.drag.dist = d; DT.drag.moved = 99; return; }
    const dx = e.clientX - DT.drag.x; DT.drag.moved = Math.max(DT.drag.moved, Math.abs(dx));
    if (DT.drag.moved > 4) { const span = DT.drag.t1 - DT.drag.t0, dt = -dx / W * span; DT.t0 = DT.drag.t0 + dt; DT.t1 = DT.drag.t1 + dt; drawTL(); }
  });
  const up = e => {
    if (!DT.drag) return; DT.ptrs.delete(e.pointerId);
    if (DT.drag.moved <= 4 && DT.ptrs.size === 0) { const el = document.elementFromPoint(e.clientX, e.clientY); const i = el && el.getAttribute && el.getAttribute('data-i'); if (i != null && DT.rects[+i]) tlSelect(DT.rects[+i].path); }
    if (DT.ptrs.size === 0) DT.drag = null;
  };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', e => { DT.ptrs.delete(e.pointerId); DT.drag = null; });
  box.addEventListener('keydown', e => {
    const span = DT.t1 - DT.t0;
    if (e.key === 'ArrowLeft') { DT.t0 -= span * 0.1; DT.t1 -= span * 0.1; drawTL(); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { DT.t0 += span * 0.1; DT.t1 += span * 0.1; drawTL(); e.preventDefault(); }
    else if (e.key === '+' || e.key === '=') { tlZoom(0.6); e.preventDefault(); }
    else if (e.key === '-') { tlZoom(1.6); e.preventDefault(); }
    else if (e.key === 'Enter') { const mid = (DT.t0 + DT.t1) / 2; const path = dashaPathAt(DT.so, mid); const deeper = path.slice(0, Math.min(path.length, ((DT.sel || []).length || 0) + 1)); if (deeper.length) tlSelect(deeper); e.preventDefault(); }
  });
}
/* ---------------------------------------------------------------------
   14. Yogas (filterable, "why" cards with highlighted chart)
   --------------------------------------------------------------------- */
const YF = { f: 'present', cat: '', q: '', open: null };
function yogaList(C) {
  const q = fold(YF.q);
  return C.yogas.filter(y => {
    const jy = JC && JC.yogas && JC.yogas[y.id];
    if (YF.f === 'present' && !y.present) return false;
    if (YF.f === 'absent' && y.present) return false;
    if (YF.f === 'cancelled' && !y.cancelled) return false;
    if (YF.cat && (!jy || jy.category !== YF.cat)) return false;
    if (q && !fold(y.id + ' ' + (jy ? L(jy.name) + ' ' + jy.name.en + ' ' + L(jy.rule) : '')).includes(q)) return false;
    return true;
  });
}
function viewYogas(C) {
  const list = yogaList(C), cats = JC && JC.yogaCategories ? Object.keys(JC.yogaCategories) : [];
  const nP = C.yogas.filter(y => y.present && !isClassif(y)).length, nC = C.yogas.filter(y => y.cancelled).length;
  let html = provChips(C) + '<div class="card" id="tourYogas"><h2>✨ ' + term('yoga', tr('yogas')) + ' <small>' + num(nP) + ' ' + tr('present').toLowerCase() + ' · ' + num(C.yogas.length) + ' ' + (hi() ? 'नियम जाँचे' : 'rules checked') + '</small></h2>' +
    '<div class="row"><div class="seg scroll" id="yFilter">' + [['present', tr('present') + ' ' + num(nP)], ['all', tr('all')], ['cancelled', tr('cancelled') + ' ' + num(nC)], ['absent', tr('absent')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (YF.f === v ? 'on' : '') + '" aria-pressed="' + (YF.f === v) + '">' + l + '</button>').join('') + '</div>' +
    '<label class="vh" for="yCat">' + tr('category') + '</label><select id="yCat" class="inline"><option value="">' + tr('category') + ': ' + tr('all') + '</option>' + cats.map(c => '<option value="' + c + '"' + (YF.cat === c ? ' selected' : '') + '>' + esc(L(JC.yogaCategories[c])) + '</option>').join('') + '</select></div>' +
    '<div class="field" style="margin:8px 0 0"><label class="vh" for="ySearch">' + tr('search') + '</label><input type="search" id="ySearch" placeholder="🔍 ' + tr('search') + '" value="' + esc(YF.q) + '"></div><p class="sub" id="yCount">' + num(list.length) + ' ' + tr('found') + '</p></div>';
  html += '<div id="yList">' + yogaItems(C, list) + '</div>';
  return html;
}
const isClassif = y => y.category === 'classification' || !!(JC && JC.yogas && JC.yogas[y.id] && JC.yogas[y.id].category === 'classification');
function yogaItems(C, list) {
  if (!list.length) return '<div class="card"><p class="sub">' + tr('noneP') + '</p></div>';
  const cls = list.filter(isClassif), main = list.filter(y => !isClassif(y));
  return (main.length ? yogaItems2(C, main) : '') + (cls.length ? '<div class="card"><h3 style="margin-top:0">🏷️ ' + esc(JC && JC.yogaCategories && JC.yogaCategories.classification ? L(JC.yogaCategories.classification) : tr('classifications')) + '</h3>' + yogaItems2(C, cls).replace(/^<div class="card">/, '').replace(/<\/div>$/, '') + '</div>' : '');
}
function yogaItems2(C, list) {
  return '<div class="card">' + list.map(y => {
    const jy = JC && JC.yogas && JC.yogas[y.id], cls = y.cancelled ? 'cancel' : y.present ? 'present' : 'absent';
    return '<details class="x ' + cls + '" data-yid="' + y.id + '"' + (YF.open === y.id ? ' open' : '') + '><summary><span class="ynm">' + (y.present ? '✅' : '⚪') + ' ' + esc(yogaName(y.id)) + '</span>' + (jy ? ' <span class="pill">' + esc(L(JC.yogaCategories && JC.yogaCategories[jy.category]).split(' (')[0]) + '</span>' : '') + (y.present && y.strength ? ' <span class="pill ' + (y.strength === 'strong' ? 'green' : y.strength === 'medium' ? 'gold' : '') + '">' + tr(y.strength) + '</span>' : '') + (y.cancelled ? ' <span class="pill gold">' + tr('cancelled') + '</span>' : '') + (y.present && !isClassif(y) ? ' ' + rarityPill(y) : '') + '</summary><div class="body"></div></details>';
  }).join('') + '</div>';
}
function yogaBody(C, y) {
  const jy = JC && JC.yogas && JC.yogas[y.id];
  const hs = (y.houses || []).filter(h => h >= 1 && h <= 12);
  let h = '<div class="compare"><div><div class="dsec"><h4>🔎 ' + tr('whyHere') + '</h4><p>' + esc(L(y.reason)) + '</p>' + (y.cancelled ? '<p class="banner warn">' + esc(L(y.cancelled)) + '</p>' : '') + '</div>';
  if (typeof y.commonness === 'number' || y.rarity || y.basis || y.variant) h += '<p class="sub">' + rarityPill(y) + (typeof y.commonness === 'number' ? ' ' + (hi() ? 'लगभग ' : 'Present in about ') + fx(y.commonness, y.commonness < 10 ? 1 : 0) + '% ' + (hi() ? 'कुंडलियों में बनता है' : 'of charts') : '') + (y.basis ? ' · ' + esc(typeof y.basis === 'object' ? L(y.basis) : String(y.basis)) : '') + (y.variant ? ' · ' + esc(typeof y.variant === 'object' ? L(y.variant) : String(y.variant)) : '') + '</p>';
  if (typeof y.commonness === 'number' && JC && JC.yogaRarity && JC.yogaRarity.note) h += '<p class="sub">' + esc(L(JC.yogaRarity.note)) + '</p>';
  const DP = y.details && Array.isArray(y.details.pairs) ? y.details.pairs : null;
  if (DP && DP.length) h += '<div class="dsec"><h4>🔗 ' + (hi() ? 'स्वामी-संबंध' : 'Lord links') + '</h4><ul class="pts">' + DP.map(pp => '<li>' + [pp.a, pp.b].filter(Boolean).map(pn).join(' + ') + (pp.kendra != null || pp.trikona != null ? ' <span class="sub">(' + [pp.kendra != null ? (hi() ? 'केंद्र ' : 'kendra ') + [].concat(pp.kendra).map(num).join('/') : '', pp.trikona != null ? (hi() ? 'त्रिकोण ' : 'trikona ') + [].concat(pp.trikona).map(num).join('/') : ''].filter(Boolean).join(' · ') + ')</span>' : '') + (pp.c ? ' · ' + esc(({ conj: hi() ? 'युति' : 'conjunction', aspect: hi() ? 'दृष्टि' : 'aspect', mutual_aspect: hi() ? 'परस्पर दृष्टि' : 'mutual aspect', exchange: hi() ? 'परिवर्तन' : 'exchange' })[pp.c] || String(pp.c).replace(/_/g, ' ')) : '') + (pp.grade ? ' <span class="pill' + (pp.grade === 'strong' ? ' green' : pp.grade === 'weak' ? '' : ' gold') + '">' + esc(T.en[pp.grade] != null ? tr(pp.grade) : String(pp.grade)) + '</span>' : '') + ((pp.weakBecause || []).length ? ' <span class="pill">' + tr('weakPair') + ': ' + [].concat(pp.weakBecause).map(w => esc(wbLabel(w))).join(', ') + '</span>' : '') + '</li>').join('') + '</ul>' + (y.details.yogakaraka && y.details.yogakaraka.length ? '<p class="sub">⭐ ' + yogaName('yogakaraka') + ': ' + [].concat(y.details.yogakaraka).map(x => pn(typeof x === 'object' ? x.planet || x.id : x)).join(', ') + '</p>' : '') + '</div>';
  if (jy) h += '<div class="dsec"><h4>📏 ' + tr('rule') + '</h4><p>' + esc(L(jy.rule)) + '</p></div><div class="dsec"><h4>🌿 ' + tr('effect') + '</h4><p>' + esc(L(jy.effect)) + '</p></div><p class="sub">' + tr('source') + ': ' + esc(L(jy.source)) + '</p>';
  if (y.planets && y.planets.length) h += '<p>' + y.planets.filter(id => PL9.includes(id)).map(pChip).join(' ') + '</p>';
  h += '</div><div class="chartwrap" style="max-width:300px">' + chartSVG(chartModel(C, 'D1'), { ctx: 'main:D1', label: yogaName(y.id), hl: { p: y.planets || [], h: hs }, title: yogaName(y.id).slice(0, 18) }) + '</div></div>';
  return h;
}

/* ---------------------------------------------------------------------
   15. Doshas: Manglik (with every cancellation), Kaal Sarp, Kemadruma, others
   --------------------------------------------------------------------- */
function jcBlock(d, keys) {
  if (!d) return '';
  return keys.filter(k => d[k]).map(k => '<details class="x"><summary>' + ({ what: '❓ ' + tr('whatIs'), computed: '🧮 ' + tr('computedHow'), traditional: '📜 ' + tr('traditional'), balanced: '⚖️ ' + tr('balanced'), caveat: '⚠️ ' + tr('caveat') }[k] || k) + '</summary><div class="body reading"><p>' + esc(L(d[k])) + '</p></div></details>').join('');
}
function viewDoshas(C) {
  const D = C.doshas, M = D.manglik, K = D.kaalSarp, KM = D.kemadruma, JD = JC && JC.doshas;
  const yn = b => b ? '<span class="bad">✓ ' + tr('yes') + '</span>' : '<span class="ok">✗ ' + tr('no') + '</span>';
  let html = provChips(C) + '<div class="grid2">';
  // Manglik
  html += '<div class="card wide"><h2>🔴 ' + term('manglik', tr('manglik')) + ' <span class="pill ' + (M.present ? 'red' : 'green') + '">' + (JD && JD.manglik && JD.manglik.levels && JD.manglik.levels[M.level] ? esc(L(JD.manglik.levels[M.level]).split(':')[0]) : esc(M.level)) + '</span></h2>' +
    '<div class="compare"><div><div class="tablewrap"><table><thead><tr><th></th><th class="num">' + tr('house') + '</th><th>Manglik?</th></tr></thead><tbody>' +
    [['fromLagna', 'lagna'], ['fromMoon', 'moon'], ['fromVenus', 'venus']].map(([k, h]) => '<tr><td>' + tr(k) + '</td><td class="num">' + num(M.houses[h]) + '</td><td>' + yn(M[k]) + (M[k] && M.uncancelledFrom && !M.uncancelledFrom.includes(h) && M.uncancelledFrom.length !== undefined ? '' : '') + '</td></tr>').join('') + '</tbody></table></div>' +
    '<p>' + esc(L(M.reason)) + '</p>' + (JD && JD.manglik && JD.manglik.levels ? '<p class="sub">' + esc(L(JD.manglik.levels[M.level])) + '</p>' : '') +
    (M.houseSet ? '<p class="sub">🏠 ' + tr('manglikHouses') + ': <b>' + [].concat(M.houseSet).map(num).join(', ') + '</b>' + (M.houseSetName ? ' (' + esc(typeof M.houseSetName === 'object' ? L(M.houseSetName) : String(M.houseSetName)) + ')' : '') + ' <button type="button" class="btn xs" data-go="more:settings">⚙️</button></p>' : '') +
    (M.primary != null || (M.secondary && M.secondary.length) ? '<p class="sub">' + (M.primary != null ? (hi() ? 'लग्न से मुख्य: ' : 'Primary (from lagna): ') + (M.primary ? tr('yes') : tr('no')) : '') + (M.secondary && M.secondary.length ? ' · ' + (hi() ? 'गौण: ' : 'Secondary: ') + [].concat(M.secondary).map(x => x === 'moon' ? tr('fromMoon') : x === 'venus' ? tr('fromVenus') : String(x)).join(', ') : '') + '</p>' : '') +
    (M.grading ? '<p class="sub">📏 ' + esc(L(M.grading)) + '</p>' : '') + '</div>' +
    '<div class="chartwrap" style="max-width:280px">' + chartSVG(chartModel(C, 'D1'), { ctx: 'main:D1', label: tr('manglik'), hl: { p: ['Ma'], h: [1, 2, 4, 7, 8, 12] }, title: 'Manglik' }) + '</div></div>' +
    '<h3>' + tr('cancellations') + '</h3>' + M.cancellations.map(c => { const jc = JD && JD.manglik && JD.manglik.cancellations && JD.manglik.cancellations[c.id]; return '<details class="x ' + (c.applies ? 'present' : 'absent') + '"><summary>' + (c.applies ? '✅' : '⚪') + ' ' + esc(jc ? L(jc.rule) : L(c.rule)) + ' <span class="pill ' + (c.applies ? 'green' : '') + '">' + (c.applies ? tr('appliesY') : tr('appliesN')) + '</span>' + (c.folk ? '<span class="pill">' + (hi() ? 'लोक परंपरा' : 'folk') + '</span>' : '') + '</summary><div class="body"><p class="sub">' + esc(L(c.rule)) + '</p>' + (jc && jc.note ? '<p>' + esc(L(jc.note)) + '</p>' : '') + '</div></details>'; }).join('') +
    jcBlock(JD && JD.manglik, ['what', 'computed', 'traditional', 'balanced']) + '</div>';
  // Kaal Sarp
  const kt = K.type && JD && JD.kaalSarp && JD.kaalSarp.types ? JD.kaalSarp.types[K.type] : null;
  const kNear = !K.present && (K.nearPattern === true || (K.nearPattern && typeof K.nearPattern === 'object'));
  html += '<div class="card"><h2>🐍 ' + term('kaal_sarp', tr('kaalSarp')) + ' <span class="pill ' + (K.present ? (K.partial ? 'gold' : 'red') : 'green') + '">' + (K.present ? (K.partial ? tr('partial') : tr('full')) : tr('absent')) + '</span>' + (kNear ? '<span class="pill">◌ ' + tr('nearPattern') + '</span>' : '') + '</h2>' +
    (K.present && K.partial ? '<div class="banner warn">⚠️ <b>' + tr('partial') + '.</b> ' + (JD && JD.kaalSarp && JD.kaalSarp.partial ? esc(L(JD.kaalSarp.partial)) : '') + '</div>' : '') +
    (kNear ? '<div class="banner neutral">◌ <b>' + tr('nearPattern') + '.</b> ' + (K.nearReason ? esc(L(K.nearReason)) : '') + (K.nearType && JD && JD.kaalSarp && JD.kaalSarp.types && JD.kaalSarp.types[K.nearType] ? ' <span class="sub">(' + esc(L(JD.kaalSarp.types[K.nearType].name)) + ')</span>' : '') + (JD && JD.kaalSarp && (JD.kaalSarp.nearPattern || JD.kaalSarp.partial) ? '<br><span class="sub">' + esc(L(JD.kaalSarp.nearPattern || JD.kaalSarp.partial)) + '</span>' : '') + '</div>' : '') +
    '<p>' + esc(L(K.reason)) + '</p>' + (kt ? '<p><b>' + esc(L(kt.name)) + '</b> (' + tr('house') + ' ' + num(K.rahuHouse) + '): ' + esc(L(kt.desc)) + '</p>' : '') +
    '<div class="chips"><span class="pill">' + (K.axis === 'rahu_to_ketu' ? 'Rahu → Ketu' : 'Ketu → Rahu') + '</span>' + (K.kaalAmrit ? '<span class="pill indigo">Kaal Amrit</span>' : '') + (K.outside && K.outside.length ? '<span class="pill">' + tr('outsideAxis') + ': ' + K.outside.map(pn).join(', ') + '</span>' : '') + '</div>' +
    '<div class="chartwrap" style="max-width:260px">' + chartSVG(chartModel(C, 'D1'), { ctx: 'main:D1', label: tr('kaalSarp'), hl: { p: ['Ra', 'Ke'] }, title: 'Rahu–Ketu' }) + '</div>' +
    (JD && JD.kaalSarp && JD.kaalSarp.caveat ? '<div class="banner info">ℹ️ ' + esc(L(JD.kaalSarp.caveat)) + '</div>' : '') + jcBlock(JD && JD.kaalSarp, ['what', 'computed', 'traditional', 'balanced']) + '</div>';
  // Kemadruma
  const kmFormed = KM.formed != null ? !!KM.formed : !!KM.present, kmCan = !!KM.cancelled && kmFormed, kmOn = !!KM.present && !kmCan;
  html += '<div class="card"><h2>🌙 ' + term('kemadruma', tr('kemadruma')) + ' <span class="pill ' + (kmOn ? 'red' : 'green') + '">' + (kmOn ? tr('present') : tr('absent')) + '</span>' + (kmCan ? '<span class="pill">✅ ' + tr('cancelled') + '</span>' : '') + '</h2>' + (kmCan ? '<p class="sub">' + (hi() ? 'मूल योग बनता है, पर भंग नियम लागू होने से इसे दोष नहीं गिना जाता।' : 'The raw pattern forms, but a cancellation applies, so it is not counted as a dosha.') + (KM.cancelledBy ? ' ' + esc(L(KM.cancelledBy)) : '') + '</p>' : '') + '<p>' + esc(L(KM.reason)) + '</p>' +
    '<h3>' + tr('cancellations') + '</h3>' + KM.cancellations.map(c => { const jc = JD && JD.kemadruma && JD.kemadruma.cancellations && JD.kemadruma.cancellations[c.id]; return '<p>' + (c.applies ? '✅' : '⚪') + ' ' + esc(jc ? L(jc.rule || jc) : L(c.rule)) + (c.counts === false ? ' <span class="pill">' + (hi() ? 'गिना नहीं' : 'not counted') + '</span>' : '') + (c.basis && c.basis !== 'classical' && c.basis !== 'textual' ? ' <span class="pill">' + esc(String(c.basis)) + '</span>' : '') + '</p>'; }).join('') + jcBlock(JD && JD.kemadruma, ['what', 'computed', 'traditional', 'balanced']) + '</div>';
  // others
  const others = [['pitru', '🕯️', 'pitru_dosha'], ['grahan', '🌘', 'grahan_dosha'], ['guruChandal', '🪐', 'guru_chandal'], ['shrapit', '⛓️', 'shrapit_dosha']];
  html += '<div class="card"><h2>📋 ' + tr('otherDoshas') + '</h2>' + others.map(([k, ic, g]) => { const d = D[k] || {}, jd = JD && JD[k]; const extra = k === 'grahan' ? ' (' + pn('Su') + ' ' + (d.sun ? '✓' : '✗') + ', ' + pn('Mo') + ' ' + (d.moon ? '✓' : '✗') + ')' : k === 'guruChandal' && d.present ? ' (' + (d.withRahu ? pn('Ra') : '') + (d.withKetu ? ' ' + pn('Ke') : '') + ')' : '';
    return '<details class="x ' + (d.present ? 'cancel' : 'absent') + '"><summary>' + ic + ' ' + (jd ? esc(L(jd.name)) : k) + ' <span class="pill ' + (d.present ? 'gold' : 'green') + '">' + (d.present ? tr('present') : tr('absent')) + '</span>' + extra + '</summary><div class="body">' + (d.reason ? '<p>' + esc(L(d.reason)) + '</p>' : '') + (d.note ? '<p class="sub">ℹ️ ' + esc(L(d.note)) + (d.orb != null ? ' · ' + num(d.orb) + '°' : '') + '</p>' : '') + (jd ? '<p class="reading">' + esc(L(jd.what)) + '</p><p class="sub">' + esc(L(jd.balanced)) + '</p>' : '') + ' ' + term(g, '📖') + '</div></details>'; }).join('') +
    '<div class="row" style="margin-top:8px"><button type="button" class="btn sm" data-go="insights:transits">🪐 ' + tr('sadeSati') + ' →</button></div></div>';
  return html + '</div>';
}

/* ---------------------------------------------------------------------
   16. Transits (Gochar): animated date, overlay, Sade Sati bar, ingresses
   --------------------------------------------------------------------- */
const TRANSIT = { date: null, playing: false, raf: 0, mode: 'overlay', last: null, ss: null, ssKey: '', ing: null, ingKey: '' };
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
function trJd(C) { const [y, m, d] = TRANSIT.date.split('-').map(Number); const t = TRANSIT.date === todayStr() ? new Date() : null; return t ? nowJd() : JE.julianDay(y, m, d, 12 - C.meta.utcOffsetUsed); }
function transitDetail(C, tp) {
  const p = P(C, tp.id);
  return '<dl class="kv"><dt>' + tr('sign') + '</dt><dd>' + sgn(tp.sign) + ' ' + dms(tp.deg) + (tp.retro && tp.id !== 'Ra' && tp.id !== 'Ke' ? ' ℞' : '') + '</dd><dt>' + tr('nakshatra') + '</dt><dd>' + nkn(tp.nak) + '</dd><dt>' + tr('fromMoonH') + '</dt><dd>' + tr('house') + ' ' + num(tp.houseFromMoon) + '</dd><dt>' + tr('fromLagnaH') + '</dt><dd>' + tr('house') + ' ' + num(tp.houseFromLagna) + '</dd><dt>' + tr('bindus') + '</dt><dd>' + num(tp.savBindus) + '</dd>' +
    (C.ashtakavarga.bav[tp.id] ? '<dt>' + tr('bavB') + '</dt><dd>' + num(C.ashtakavarga.bav[tp.id][tp.sign]) + ' / 8</dd>' : '') + '<dt>' + (hi() ? 'जन्म में' : 'At birth') + '</dt><dd>' + sgn(p.sign) + ' ' + dms(p.deg) + '</dd></dl>' +
    (JC && JC.ashtakavarga ? '<p class="sub">' + esc(L(JC.ashtakavarga.transit)) + '</p>' : '');
}
function viewTransits(C) {
  if (!TRANSIT.date) TRANSIT.date = todayStr();
  let html = provChips(C) + '<div class="chartlayout"><div><div class="card"><h2>🌍 ' + term('gochar', tr('gochar')) + '</h2><div class="row noprint"><label class="vh" for="trDate">' + tr('transitDate') + '</label><input type="date" id="trDate" value="' + TRANSIT.date + '" min="1800-01-01" max="2100-12-31" style="width:auto">' +
    [[-365, '−1y'], [-30, '−1m'], [-1, '−1d']].map(([d, l]) => '<button type="button" class="btn sm" data-trstep="' + d + '">' + num(l) + '</button>').join('') + '<button type="button" class="btn sm primary" id="trPlay">' + (TRANSIT.playing ? '⏸' : '▶') + '</button>' + [[1, '+1d'], [30, '+1m'], [365, '+1y']].map(([d, l]) => '<button type="button" class="btn sm" data-trstep="' + d + '">' + num(l) + '</button>').join('') + '<button type="button" class="btn sm" data-trstep="0">' + tr('today') + '</button></div>' +
    '<div class="seg" id="trMode" style="margin-top:8px">' + [['overlay', tr('overlay')], ['only', tr('transitOnly')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (TRANSIT.mode === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
    '<div id="trBox">' + transitBox(C) + '</div></div></div><div class="detailpane" id="detailPane"><div class="card"><h2>👆 ' + tr('details') + '</h2><p class="sub">' + tr('tapHint') + '</p></div></div></div>';
  html += '<div class="card" id="ssCard"><h2>🪐 ' + tr('sadeSati') + '</h2><p class="sub">' + tr('loading') + '</p></div><div class="card" id="ingCard"><h2>📅 ' + tr('ingresses') + '</h2><div id="ingBox"><p class="sub">' + tr('loading') + '</p></div></div>';
  AFTER.push(() => setTimeout(() => { const s = $('#ssCard'); if (s) s.innerHTML = sadeSatiHtml(C); const b = $('#ingBox'); if (b) b.innerHTML = ingressHtml(C); }, 30));
  return html;
}
function transitBox(C) {
  const t = JE.transitsNow(C, trJd(C)); TRANSIT.last = t.planets;
  const M = chartModel(C, 'D1');
  const extra = t.planets.map(p => ({ id: p.id, sign: p.sign, lon: p.lon, deg: p.deg, retro: p.retro && p.id !== 'Ra' && p.id !== 'Ke' }));
  const o = { ctx: 'transit', label: tr('gochar'), title: tr('transits'), subtitle: fmtDate(t.iso), extra, noPlanets: TRANSIT.mode === 'only' };
  let h = '<div class="chartwrap" style="margin-top:8px">' + chartSVG(M, o) + '</div><div class="legend"><span style="color:var(--accent-2);font-style:italic">' + (hi() ? 'तिरछे नीले = गोचर' : 'italic indigo = transit') + '</span><span>' + (hi() ? 'रंगीन = जन्म' : 'coloured = natal') + '</span></div>' +
    '<div class="banner ' + (t.sadeSati ? 'warn' : t.dhaiya ? 'warn' : 'info') + '">🪐 ' + (t.sadeSati ? tr('inSadeSati') : t.dhaiya ? tr('inDhaiya') : tr('noSS')) + ' (' + pn('Sa') + ' ' + tr('fromMoonH').toLowerCase() + ': ' + num(t.saturnFromMoon) + ')</div>' +
    '<div class="tablewrap"><table><thead><tr><th>' + tr('planet') + '</th><th>' + tr('sign') + '</th><th>' + tr('nakshatra') + '</th><th class="num">' + tr('fromMoonH') + '</th><th class="num">' + tr('fromLagnaH') + '</th><th class="num">SAV</th><th class="num">BAV</th></tr></thead><tbody>' +
    t.planets.map(p => '<tr class="click" data-k="t:' + p.id + '"><td><b style="color:' + pcol(p.id) + '">' + esc(pn(p.id)) + '</b>' + (p.retro && p.id !== 'Ra' && p.id !== 'Ke' ? ' ℞' : '') + '</td><td>' + sgn(p.sign) + ' ' + dms(p.deg) + '</td><td>' + nkn(p.nak) + '</td><td class="num">' + num(p.houseFromMoon) + '</td><td class="num">' + num(p.houseFromLagna) + '</td><td class="num">' + heatSpan(p.savBindus, 'sav') + '</td><td class="num">' + (C.ashtakavarga.bav[p.id] ? heatSpan(C.ashtakavarga.bav[p.id][p.sign], 'bav') : '—') + '</td></tr>').join('') + '</tbody></table></div>';
  return h;
}
function heatColor(v, kind) {
  const mid = kind === 'sav' ? 28 : 4, span = kind === 'sav' ? 12 : 4;
  const k = clamp((v - mid) / span, -1, 1);
  return k >= 0 ? 'color-mix(in srgb, var(--green) ' + Math.round(18 + k * 50) + '%, var(--card))' : 'color-mix(in srgb, var(--red) ' + Math.round(18 - k * 45) + '%, var(--card))';
}
const heatSpan = (v, kind) => '<span class="pill" style="background:' + heatColor(v, kind) + ';border-color:transparent">' + num(v) + '</span>';
function sadeSatiPeriods(C) {
  const y0 = +C.meta.localISO.slice(0, 4), k = C.meta.jdUT + S.ayan;
  if (TRANSIT.ssKey !== k) { try { TRANSIT.ss = JE.sadeSati(C, y0, y0 + 100); } catch (e) { TRANSIT.ss = []; } TRANSIT.ssKey = k; }
  return TRANSIT.ss;
}
function sadeSatiHtml(C) {
  const per = sadeSatiPeriods(C), b0 = C.meta.jdUT, b1 = b0 + 100 * 365.25, X = jd => clamp((jd - b0) / (b1 - b0) * 100, 0, 100);
  const JS = JC && JC.doshas && JC.doshas.sadeSati;
  const phName = ph => JS && JS.phases && JS.phases[ph] ? L(JS.phases[ph].name) : ph;
  let bar = '<div class="ssbar" role="img" aria-label="' + tr('sadeSati') + '">';
  per.forEach((p, i) => { if (p.end < b0) return; const a = X(Math.max(p.start, b0)), w = X(p.end) - a; bar += '<button type="button" class="ph ' + p.phase + '" data-ss="' + i + '" style="left:' + a.toFixed(2) + '%;width:' + Math.max(0.3, w).toFixed(2) + '%;border:0;padding:0" title="' + esc(phName(p.phase) + ': ' + fmtDate(p.startISO) + ' – ' + fmtDate(p.endISO)) + '" aria-label="' + esc(phName(p.phase) + ': ' + fmtDate(p.startISO) + ' – ' + fmtDate(p.endISO)) + '"></button>'; });
  const xn = X(nowJd()); bar += '<span class="nowl" style="left:' + xn.toFixed(2) + '%"></span></div><div class="ssaxis">' + [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(a => '<span style="left:' + a + '%">' + num(a) + '</span>').join('') + '</div>';
  const cycles = {};
  for (const p of per) if (p.cycle) { const c = cycles[p.cycle] = cycles[p.cycle] || { start: p.start, end: p.end, startISO: p.startISO, endISO: p.endISO, parts: [] }; c.end = Math.max(c.end, p.end); if (p.end >= c.end) c.endISO = p.endISO; c.parts.push(p); }
  const now = nowJd();
  return '<h2>🪐 ' + term('sade_sati', tr('sadeSati')) + '</h2>' + (JS ? '<p class="sub">' + esc(L(JS.what)) + '</p>' : '') + bar +
    '<div class="legend">' + ['rising', 'peak', 'setting', 'dhaiya4', 'dhaiya8'].map(ph => '<span><span class="sw ph ' + ph + '" style="position:static;display:inline-block;background:' + ({ rising: '#f6b26b', peak: '#e06666', setting: '#f9cb9c', dhaiya4: '#9fc5e8', dhaiya8: '#b4a7d6' }[ph]) + '"></span>' + esc(phName(ph)) + '</span>').join('') + '<span>▮ ' + tr('now') + ' · ' + tr('age') + '</span></div>' +
    '<div class="tablewrap"><table><thead><tr><th>#</th><th>' + tr('sadeSati') + '</th><th>' + tr('from') + '</th><th>' + tr('till') + '</th><th class="num">' + tr('age') + '</th></tr></thead><tbody>' +
    Object.keys(cycles).map(k => { const c = cycles[k], on = now >= c.start && now < c.end; return '<tr' + (on ? ' class="sel"' : '') + '><td>' + num(k) + '</td><td>' + c.parts.map(p => esc(phName(p.phase).split(' (')[0])).filter((v, i, a) => a.indexOf(v) === i).join(' → ') + (on ? ' <span class="pill green">' + tr('now') + '</span>' : '') + '</td><td>' + fmtDate(c.startISO) + '</td><td>' + fmtDate(c.endISO) + '</td><td class="num">' + fx(Math.max(0, ageAt(C, c.start)), 1) + '–' + fx(ageAt(C, c.end), 1) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    '<details class="x"><summary>' + (hi() ? 'ढैया व सभी चरण' : 'Dhaiya and every phase (incl. retrograde re-entries)') + '</summary><div class="body"><div class="tablewrap"><table><tbody>' + per.filter(p => p.end >= b0).map(p => '<tr><td><span class="sw ' + p.phase + '" style="background:' + ({ rising: '#f6b26b', peak: '#e06666', setting: '#f9cb9c', dhaiya4: '#9fc5e8', dhaiya8: '#b4a7d6' }[p.phase]) + '"></span>' + esc(phName(p.phase)) + '</td><td>' + fmtDate(p.startISO) + '</td><td>' + fmtDate(p.endISO) + '</td></tr>').join('') + '</tbody></table></div></div></details>' +
    jcBlock(JS, ['computed', 'traditional', 'balanced']);
}
function computeIngresses(jd0, days) {
  const ids = ['Su', 'Ma', 'Me', 'Ve', 'Ju', 'Sa', 'Ra'], step = 2, out = [];
  const lonAt = (id, j) => JE.positionsAt(j, S.ayan, S.node, [id]).pos[id].lon;
  let prev = JE.positionsAt(jd0, S.ayan, S.node, ids).pos, prevD = {};
  for (let k = 1; k * step <= days; k++) {
    const j = jd0 + k * step, cur = JE.positionsAt(j, S.ayan, S.node, ids).pos;
    for (const id of ids) {
      const a = prev[id].lon, b = cur[id].lon, sa = Math.floor(a / 30), sb = Math.floor(b / 30);
      if (sa !== sb) { let lo = j - step, hi2 = j; for (let i = 0; i < 22; i++) { const m = (lo + hi2) / 2; if (Math.floor(lonAt(id, m) / 30) === sa) lo = m; else hi2 = m; } out.push({ id, jd: hi2, type: 'enter', sign: sb }); }
      const d = ((b - a + 540) % 360) - 180;
      if (id !== 'Ra' && id !== 'Su' && prevD[id] != null && Math.sign(d) !== Math.sign(prevD[id]) && d !== 0) out.push({ id, jd: j - step, type: d < 0 ? 'retro' : 'direct' });
      prevD[id] = d;
    }
    prev = cur;
  }
  // next Moon ingresses (3)
  let j = jd0, s = Math.floor(lonAt('Mo', j) / 30), n = 0;
  while (n < 3 && j < jd0 + 10) { j += 0.25; const s2 = Math.floor(lonAt('Mo', j) / 30); if (s2 !== s) { let lo = j - 0.25, hi2 = j; for (let i = 0; i < 18; i++) { const m = (lo + hi2) / 2; if (Math.floor(lonAt('Mo', m) / 30) === s) lo = m; else hi2 = m; } out.push({ id: 'Mo', jd: hi2, type: 'enter', sign: s2 }); s = s2; n++; } }
  return out.sort((a, b) => a.jd - b.jd);
}
function ingressHtml(C) {
  const jd0 = trJd(C), k = Math.floor(jd0) + S.ayan + S.node;
  if (TRANSIT.ingKey !== k) { TRANSIT.ing = computeIngresses(jd0, 400); TRANSIT.ingKey = k; }
  const off = C.meta.utcOffsetUsed, mo = P(C, 'Mo').sign;
  return '<div class="tablewrap"><table><thead><tr><th>' + tr('localTime') + '</th><th>' + tr('planet') + '</th><th></th><th class="num">' + tr('fromMoonH') + '</th></tr></thead><tbody>' + TRANSIT.ing.map(e => '<tr><td>' + fmtDate(JE.isoLocal(e.jd, off), e.id === 'Mo' || e.type === 'enter') + '</td><td><b style="color:' + pcol(e.id) + '">' + esc(pn(e.id)) + '</b>' + (e.id === 'Ra' ? ' / ' + esc(pn('Ke')) : '') + '</td><td>' + (e.type === 'enter' ? tr('enters') + ' <b>' + sgn(e.sign) + '</b>' + (e.id === 'Ra' ? ' / ' + sgn((e.sign + 6) % 12) : '') : e.type === 'retro' ? '℞ ' + tr('turnsRetro') + ' (≈)' : tr('turnsDirect') + ' (≈)') + '</td><td class="num">' + (e.type === 'enter' ? num(((e.sign - mo + 12) % 12) + 1) : '') + '</td></tr>').join('') + '</tbody></table></div><p class="sub">' + (hi() ? 'स्थानीय समय जन्म-स्थान के अंतर पर। वक्री/मार्गी तिथियाँ ±2 दिन।' : 'Times use the birth-place offset. Retrograde/direct dates are ±2 days.') + ' UTC' + hm(off) + '</p>';
}
function trRefresh() { const C = curChart(); if (!C) return; const b = $('#trBox'); if (b) b.innerHTML = transitBox(C); const d = $('#trDate'); if (d) d.value = TRANSIT.date; }
function trStep(days) {
  if (!days) TRANSIT.date = todayStr();
  else { const [y, m, d] = TRANSIT.date.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d) + days * DAY_MS); const Y = t.getUTCFullYear(); if (Y < 1800 || Y > 2100) return; TRANSIT.date = Y + '-' + pad2(t.getUTCMonth() + 1) + '-' + pad2(t.getUTCDate()); }
  trRefresh();
}
function trPlay(on) {
  TRANSIT.playing = on; const b = $('#trPlay'); if (b) b.textContent = on ? '⏸' : '▶';
  cancelAnimationFrame(TRANSIT.raf); if (!on) { delete ANIM.tr; return; }
  let last = 0;
  const f = t => { if (!TRANSIT.playing) return; if (t - last > 110) { last = t; trStep(1); } TRANSIT.raf = requestAnimationFrame(f); };
  TRANSIT.raf = requestAnimationFrame(f);
  ANIM.tr = { stop: () => { TRANSIT.playing = false; cancelAnimationFrame(TRANSIT.raf); } };
}

/* ---------------------------------------------------------------------
   17. Strength: Ashtakavarga heat-maps & prastara, Shadbala bars + radar, Bhava bala
   --------------------------------------------------------------------- */
const AV = { mode: 'raw', order: 'sign', sel: null, prast: 'Su' };
function viewStrength(C) {
  const sub = S.strength || 'av';
  let html = provChips(C) + '<nav class="seg scroll" id="stSeg" style="margin-bottom:12px;display:flex" aria-label="' + tr('strength') + '">' + [['av', '🔢 ' + tr('ashtakavarga')], ['sb', '💪 ' + tr('shadbala')], ['bb', '🏠 ' + tr('bhavabala')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (sub === v ? 'on' : '') + '" style="flex:1" aria-current="' + (sub === v) + '">' + l + '</button>').join('') + '</nav>';
  if (sub === 'sb') return html + shadbalaHtml(C);
  if (sub === 'bb') return html + bhavaBalaHtml(C);
  return html + ashtakaHtml(C);
}
function avTable(C) {
  const A = C.ashtakavarga, src = AV.mode === 'raw' ? A.bav : A.reductions[AV.mode === 'trikona' ? 'trikona' : 'ekadhipatya'];
  const cols = Array.from({ length: 12 }, (_, i) => AV.order === 'sign' ? i : (C.asc.sign + i) % 12);
  let h = '<div class="tablewrap"><table class="heat"><thead><tr><th></th>' + cols.map((s, i) => '<th>' + (AV.order === 'sign' ? esc(sab(s)) : num(i + 1) + '<br><small>' + esc(sab(s)) + '</small>') + '</th>').join('') + '<th>' + tr('total') + '</th></tr></thead><tbody>';
  for (const id of PL7) {
    const row = src[id]; let t = 0;
    h += '<tr><td class="rh" style="color:' + pcol(id) + '">' + esc(pab(id)) + '</td>' + cols.map(s => { t += row[s]; const sel = AV.sel && AV.sel.id === id && AV.sel.s === s; return '<td><button type="button" class="' + (sel ? 'sel' : '') + '" data-av="' + id + ':' + s + '" style="background:' + heatColor(row[s], 'bav') + '" aria-label="' + esc(pn(id) + ' ' + sgn(s) + ': ' + row[s]) + '">' + num(row[s]) + '</button></td>'; }).join('') + '<td class="tot">' + num(t) + '</td></tr>';
  }
  const sav = cols.map(s => PL7.reduce((a, id) => a + src[id][s], 0));
  h += '<tr><td class="rh">SAV</td>' + cols.map((s, i) => { const sel = AV.sel && AV.sel.id === 'SAV' && AV.sel.s === s; return '<td><button type="button" class="' + (sel ? 'sel' : '') + '" data-av="SAV:' + s + '" style="background:' + heatColor(sav[i], 'sav') + ';font-size:.9rem" aria-label="SAV ' + esc(sgn(s)) + ': ' + sav[i] + '">' + num(sav[i]) + '</button></td>'; }).join('') + '<td class="tot">' + num(sav.reduce((a, b) => a + b, 0)) + '</td></tr></tbody></table></div>';
  return h;
}
function avInfo(C) {
  if (!AV.sel) return '<p class="sub">👆 ' + tr('tapCell') + '</p>';
  const { id, s } = AV.sel, A = C.ashtakavarga;
  if (id === 'SAV') return '<h3>SAV · ' + sgn(s) + ' (' + tr('house') + ' ' + num(houseOf(C, s)) + ')</h3><div class="chips">' + PL7.map(q => '<span class="pill" style="border-color:' + pcol(q) + '">' + esc(pn(q)) + ': ' + num(A.bav[q][s]) + '</span>').join('') + '</div>';
  const pr = A.prastara[id], who = Object.keys(pr).filter(c => pr[c][s]);
  return '<h3>' + esc(pn(id)) + ' · ' + sgn(s) + ' = ' + num(A.bav[id][s]) + '</h3><p>' + tr('contributors') + ': ' + (who.length ? who.map(c => '<span class="pill" style="border-color:' + pcol(c) + '">' + esc(c === 'La' ? tr('lagna') : pn(c)) + '</span>').join(' ') : tr('noneP')) + '</p><p class="sub">' + (hi() ? 'बिंदु न देने वाले: ' : 'No bindu from: ') + Object.keys(pr).filter(c => !pr[c][s]).map(c => c === 'La' ? tr('lagna') : pn(c)).join(', ') + '</p>';
}
function ashtakaHtml(C) {
  const A = C.ashtakavarga, JA = JC && JC.ashtakavarga;
  const savText = {}; for (let s = 0; s < 12; s++) savText[s] = num(A.sav[s]);
  let h = '<div class="card"><h2>🔢 ' + term('ashtakavarga', tr('ashtakavarga')) + ' <small>SAV ' + num(A.savTotal) + '</small></h2>' + (JA ? '<p class="sub">' + esc(L(JA.intro)) + '</p>' : '') +
    '<div class="row" style="margin:8px 0"><div class="seg scroll" id="avMode">' + [['raw', tr('raw')], ['trikona', tr('trikona')], ['ekadhipatya', tr('ekadhipatya')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (AV.mode === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div><div class="seg" id="avOrder">' + [['sign', tr('bySign')], ['house', tr('byHouse')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (AV.order === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div></div>' +
    '<div id="avTable">' + avTable(C) + '</div><div id="avInfo" class="banner info">' + avInfo(C) + '</div></div>';
  h += '<div class="grid2"><div class="card"><h2>🗺️ SAV ' + tr('chart') + '</h2><div class="chartwrap" style="max-width:380px">' + chartSVG(chartModel(C, 'D1'), { ctx: 'main:D1', label: 'SAV', signText: savText, signColor: s => A.sav[s] >= 30 ? 'var(--green)' : A.sav[s] < 25 ? 'var(--red)' : 'var(--accent-d)', title: 'SAV', subtitle: num(A.savTotal) }) + '</div>' + (JA ? '<p class="sub">' + esc(L(JA.reading)) + '</p>' : '') + '</div>';
  const pr = A.prastara[AV.prast];
  h += '<div class="card"><h2>🧮 ' + term('prastara', tr('prastara')) + '</h2><div class="chips">' + PL7.map(id => '<button type="button" class="chip' + (AV.prast === id ? ' on' : '') + '" data-prast="' + id + '">' + esc(pn(id)) + '</button>').join('') + '</div><div class="tablewrap"><table class="heat"><thead><tr><th></th>' + Array.from({ length: 12 }, (_, s) => '<th>' + esc(sab(s)) + '</th>').join('') + '<th>' + tr('total') + '</th></tr></thead><tbody>' +
    Object.keys(pr).map(c => '<tr><td class="rh" style="color:' + pcol(c) + '">' + esc(c === 'La' ? pab('La') : pab(c)) + '</td>' + pr[c].map(v => '<td><span class="dotg' + (v ? '' : ' o') + '" aria-label="' + v + '"></span></td>').join('') + '<td class="tot">' + num(pr[c].reduce((a, b) => a + b, 0)) + '</td></tr>').join('') +
    '<tr><td class="rh">' + tr('total') + '</td>' + A.bav[AV.prast].map(v => '<td class="tot">' + num(v) + '</td>').join('') + '<td class="tot">' + num(A.bav[AV.prast].reduce((a, b) => a + b, 0)) + '</td></tr></tbody></table></div>' + (JA ? '<p class="sub">' + esc(L(JA.prastara)) + '</p>' : '') + '</div></div>';
  h += '<div class="card"><h2>⚗️ ' + term('shodhya_pinda', tr('shodhya')) + '</h2><div class="tablewrap"><table><thead><tr><th>' + tr('planet') + '</th><th class="num">Rashi</th><th class="num">Graha</th><th class="num">' + tr('total') + '</th></tr></thead><tbody>' + PL7.map(id => { const s = A.reductions.shodhyaPinda[id]; return '<tr><td>' + pn(id) + '</td><td class="num">' + num(s.rashi) + '</td><td class="num">' + num(s.graha) + '</td><td class="num"><b>' + num(s.total) + '</b></td></tr>'; }).join('') + '</tbody></table></div>' +
    (A.note ? '<p class="sub">' + esc(L(A.note)) + '</p>' : '') + (JA ? jcList(JA.reductions) + '<p class="sub">💡 ' + esc(L(JA.tips)) + '</p>' : '') + '</div>';
  return h;
}
const jcList = o => o ? Object.keys(o).map(k => '<details class="x"><summary>' + esc(k) + '</summary><div class="body"><p>' + esc(L(o[k])) + '</p></div></details>').join('') : '';
const SBC = [['sthanaTotal', 'sthana'], ['dig', 'dig'], ['kalaTotal', 'kala'], ['chesta', 'chesta'], ['naisargika', 'naisargika'], ['drik', 'drik']];
const sbName = k => { const c = JC && JC.shadbala && JC.shadbala.components && JC.shadbala.components[k]; return c ? L(c.name).split(' (')[0] : k; };
let SB_SEL = null;
function radarSvg(C, sel) {
  const B = C.shadbala, n = SBC.length, cx = 160, cy = 150, R = 110;
  const vals = SBC.map(([k]) => PL7.map(id => B[id][k])), mins = vals.map(v => Math.min(0, ...v)), maxs = vals.map(v => Math.max(...v));
  const pt = (i, f) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + R * f * Math.cos(a), cy + R * f * Math.sin(a)]; };
  let s = '<svg viewBox="0 0 320 300" class="radar" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="' + esc(tr('radar')) + '">';
  for (const f of [0.25, 0.5, 0.75, 1]) s += '<polygon points="' + SBC.map((_, i) => pt(i, f).map(v => v.toFixed(1)).join(',')).join(' ') + '" style="fill:none;stroke:var(--line);stroke-width:1"/>';
  SBC.forEach(([k, c], i) => { const [x, y] = pt(i, 1.17); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + pt(i, 1)[0].toFixed(1) + '" y2="' + pt(i, 1)[1].toFixed(1) + '" style="stroke:var(--line)"/><text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" style="fill:var(--muted);font-size:11px;font-weight:800;font-family:Nunito">' + esc(sbName(c)) + '</text>'; });
  for (const id of PL7) {
    const on = !sel || sel === id;
    const pts = SBC.map(([k], i) => { const f = (B[id][k] - mins[i]) / ((maxs[i] - mins[i]) || 1); return pt(i, 0.08 + 0.92 * f).map(v => v.toFixed(1)).join(','); }).join(' ');
    s += '<polygon points="' + pts + '" style="fill:' + pcol(id) + ';fill-opacity:' + (sel === id ? 0.28 : on ? 0.06 : 0.02) + ';stroke:' + pcol(id) + ';stroke-width:' + (sel === id ? 3 : 1.4) + ';stroke-opacity:' + (on ? 1 : 0.25) + '"/>';
  }
  return s + '</svg>';
}
function shadbalaHtml(C) {
  const B = C.shadbala, JS = JC && JC.shadbala, mx = Math.max(...PL7.map(id => Math.max(B[id].rupas, B[id].required))) * 1.08;
  let h = '<div class="grid2"><div class="card"><h2>💪 ' + term('shadbala', tr('shadbala')) + ' <small>' + tr('rupas') + '</small></h2>' + (JS ? '<p class="sub">' + esc(L(JS.intro)) + '</p>' : '') + (C.shadbalaInfo && C.shadbalaInfo.note ? '<p class="sub">📚 ' + tr('schoolL') + ': <b>' + esc(String(C.shadbalaInfo.school || '').toUpperCase()) + '</b> — ' + esc(L(C.shadbalaInfo.note)) + ' <button type="button" class="btn xs" data-go="more:settings">⚙️</button></p>' : '') + '<div class="bars" style="margin-top:8px">' +
    PL7.map(id => { const b = B[id], ok = b.ratio >= 1; return '<div class="bar" title="' + esc(tr('required') + ' ' + b.required) + '"><span style="color:' + pcol(id) + '">' + esc(pn(id)) + '</span><span class="tr"><span class="fl" style="width:' + (b.rupas / mx * 100).toFixed(1) + '%;background:' + (ok ? 'var(--green)' : 'var(--red)') + '"></span><span class="req" style="left:' + (b.required / mx * 100).toFixed(1) + '%"></span></span><span class="num">' + fx(b.rupas, 2) + '</span></div>'; }).join('') +
    '</div><p class="sub">▮ = ' + tr('required') + ' · ' + (hi() ? 'हरा = आवश्यक से अधिक' : 'green = above the required minimum') + '</p></div>';
  h += '<div class="card"><h2>🕸️ ' + tr('radar') + '</h2><div class="chips">' + '<button type="button" class="chip' + (!SB_SEL ? ' on' : '') + '" data-sbsel="">' + tr('all') + '</button>' + PL7.map(id => '<button type="button" class="chip' + (SB_SEL === id ? ' on' : '') + '" data-sbsel="' + id + '">' + esc(pn(id)) + '</button>').join('') + '</div><div id="radarBox">' + radarSvg(C, SB_SEL) + '</div><p class="sub">' + (hi() ? 'हर अक्ष ग्रहों के बीच तुलनात्मक है।' : 'Each axis is scaled across the seven planets.') + '</p></div></div>';
  const sub = (o, k) => Object.keys(o).map(x => '<tr class="sub"><td>&nbsp;&nbsp;' + esc(JS && JS.components && JS.components[k] && JS.components[k].sub && JS.components[k].sub[x] ? L(JS.components[k].sub[x].name || JS.components[k].sub[x]).split(' (')[0] : x) + '</td>' + PL7.map(id => '<td class="num">' + fx(B[id][k][x], 1) + '</td>').join('') + '</tr>').join('');
  h += '<div class="card"><h2>🧾 ' + tr('components') + '</h2><div class="tablewrap"><table><thead><tr><th></th>' + PL7.map(id => '<th class="num" style="color:' + pcol(id) + '">' + esc(pab(id)) + '</th>').join('') + '</tr></thead><tbody>' +
    '<tr><td><b>' + esc(sbName('sthana')) + '</b></td>' + PL7.map(id => '<td class="num"><b>' + fx(B[id].sthanaTotal, 1) + '</b></td>').join('') + '</tr>' + sub(B.Su.sthana, 'sthana') +
    '<tr><td><b>' + esc(sbName('dig')) + '</b></td>' + PL7.map(id => '<td class="num"><b>' + fx(B[id].dig, 1) + '</b></td>').join('') + '</tr>' +
    '<tr><td><b>' + esc(sbName('kala')) + '</b></td>' + PL7.map(id => '<td class="num"><b>' + fx(B[id].kalaTotal, 1) + '</b></td>').join('') + '</tr>' + sub(B.Su.kala, 'kala') +
    ['chesta', 'naisargika', 'drik'].map(k => '<tr><td><b>' + esc(sbName(k)) + '</b></td>' + PL7.map(id => '<td class="num"><b>' + fx(B[id][k], 1) + '</b></td>').join('') + '</tr>').join('') +
    '<tr><td><b>' + tr('total') + '</b></td>' + PL7.map(id => '<td class="num"><b>' + fx(B[id].total, 1) + '</b></td>').join('') + '</tr>' +
    '<tr><td>' + tr('rupas') + '</td>' + PL7.map(id => '<td class="num">' + fx(B[id].rupas, 2) + '</td>').join('') + '</tr><tr><td>' + tr('required') + '</td>' + PL7.map(id => '<td class="num">' + fx(B[id].required, 1) + '</td>').join('') + '</tr>' +
    '<tr><td>' + tr('ratio') + '</td>' + PL7.map(id => '<td class="num ' + (B[id].ratio >= 1 ? 'ok' : 'bad') + '">' + fx(B[id].ratio, 2) + '</td>').join('') + '</tr><tr><td>' + tr('rank') + '</td>' + PL7.map(id => '<td class="num">' + num(B[id].rank) + '</td>').join('') + '</tr></tbody></table></div>' +
    (C.shadbalaInfo && C.shadbalaInfo.wars && C.shadbalaInfo.wars.length ? '<p class="banner warn">⚔️ ' + term('graha_yuddha', hi() ? 'ग्रह युद्ध' : 'Planetary war') + ': ' + C.shadbalaInfo.wars.map(w => pn(w.winner || '') + ' > ' + pn(w.loser)).join(', ') + '</p>' : '') +
    (JS ? jcBlockSB(JS) : '') + '</div>';
  h += '<div class="card"><h2>⚖️ ' + term('ishta_kashta', tr('ishta') + ' / ' + tr('kashta')) + '</h2><div class="bars">' + PL7.map(id => { const b = B[id]; return '<div class="bar"><span style="color:' + pcol(id) + '">' + esc(pn(id)) + '</span><span class="tr" style="display:flex"><span style="width:' + (b.ishta / 60 * 50).toFixed(1) + '%;background:var(--green);margin-left:' + (50 - b.ishta / 60 * 50).toFixed(1) + '%;border-radius:7px 0 0 7px"></span><span style="width:' + (b.kashta / 60 * 50).toFixed(1) + '%;background:var(--red);border-radius:0 7px 7px 0"></span></span><span class="num">' + fx(b.ishta, 0) + '/' + fx(b.kashta, 0) + '</span></div>'; }).join('') + '</div><p class="sub">◀ ' + tr('ishta') + ' · ' + tr('kashta') + ' ▶ (0–60)</p>' + (JS ? '<p class="sub">' + esc(L(JS.ishta)) + '</p>' : '') + '</div>';
  return h;
}
function jcBlockSB(JS) { return ['rupas', 'required', 'ratio', 'reading'].filter(k => JS[k]).map(k => '<details class="x"><summary>📖 ' + esc(k === 'reading' ? tr('howRead') : tr(k)) + '</summary><div class="body"><p>' + esc(L(JS[k])) + '</p></div></details>').join(''); }
function bhavaBalaHtml(C) {
  const B = C.bhavabala, mx = Math.max(...B.map(b => b.rupas)) * 1.05;
  return '<div class="card"><h2>🏠 ' + term('bhava_bala', tr('bhavabala')) + '</h2>' + (JC && JC.shadbala ? '<p class="sub">' + esc(L(JC.shadbala.bhavabala)) + '</p>' : '') + '<div class="bars" style="margin-top:8px">' +
    B.map(b => '<div class="bar"><span>' + tr('house') + ' ' + num(b.house) + '</span><span class="tr"><span class="fl" style="width:' + (b.rupas / mx * 100).toFixed(1) + '%;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></span></span><span class="num">' + fx(b.rupas, 2) + '</span></div>').join('') + '</div>' +
    '<div class="tablewrap" style="margin-top:10px"><table><thead><tr><th>' + tr('house') + '</th><th>' + tr('sign') + '</th><th>' + tr('lord') + '</th><th class="num">' + (hi() ? 'स्वामी बल' : 'Lord bala') + '</th><th class="num">Dig</th><th class="num">Drishti</th><th class="num">' + tr('total') + '</th><th class="num">' + tr('rupas') + '</th></tr></thead><tbody>' +
    B.map(b => '<tr class="click" data-k="h:' + b.house + '"><td>' + num(b.house) + '</td><td>' + sgn(b.sign) + '</td><td>' + pn(b.lord) + '</td><td class="num">' + fx(b.lordBala, 1) + '</td><td class="num">' + fx(b.digBala, 1) + '</td><td class="num">' + fx(b.drishtiBala, 1) + '</td><td class="num">' + fx(b.total, 1) + '</td><td class="num"><b>' + fx(b.rupas, 2) + '</b></td></tr>').join('') + '</tbody></table></div></div>';
}
/* ---------------------------------------------------------------------
   18. Sky: animated canvas — geocentric sidereal zodiac with trails
   --------------------------------------------------------------------- */
const SKY = { jd: null, playing: false, speed: 1, mode: 'geo', trails: true, natal: true, raf: 0, trail: {}, sel: null, lastLon: {}, lastJd: null, stars: null };
function viewSky(C) {
  if (SKY.jd == null) SKY.jd = nowJd();
  const sp = [[1, tr('day1')], [7, tr('week1')], [30, tr('month1')]];
  return '<div class="card"><h2>🌌 ' + tr('skyTitle') + '</h2><p class="sub">' + tr('skyHelp') + '</p>' +
    '<div class="skyctl noprint"><button type="button" class="btn primary" id="skyPlay" aria-pressed="' + SKY.playing + '">' + (SKY.playing ? '⏸ ' + tr('pause') : '▶ ' + tr('play')) + '</button>' +
    '<span class="lbl">' + tr('speedL') + '</span><div class="seg" id="skySpeed">' + sp.map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (SKY.speed === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div><span class="sub">/ ' + (hi() ? 'सेकंड' : 'sec') + '</span></div>' +
    '<div class="skyctl noprint"><div class="seg" id="skyMode">' + [['geo', tr('geo')], ['rings', tr('rings')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (SKY.mode === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
    '<label class="switch"><input type="checkbox" id="skyTrails"' + (SKY.trails ? ' checked' : '') + '> ' + tr('trails') + '</label><label class="switch"><input type="checkbox" id="skyNatal"' + (SKY.natal ? ' checked' : '') + '> ' + tr('natalRing') + '</label>' +
    '<label class="vh" for="skyDate">' + tr('transitDate') + '</label><input type="date" id="skyDate" style="width:auto" min="1800-01-01" max="2100-12-31"><button type="button" class="btn sm" id="skyNow">' + tr('now') + '</button></div>' +
    '<div class="skybox"><canvas id="skyCv" aria-label="' + esc(tr('skyTitle')) + '" role="img"></canvas></div><div class="skyinfo banner info" id="skyInfo" aria-live="off">' + tr('skyHelp') + '</div></div>';
}
function skyIds() { return PL9.concat(S.outer ? OUTER : []); }
function skyRadius(id, dist, R) {
  if (SKY.mode === 'rings') { const ring = { Mo: .16, Me: .27, Ve: .37, Su: .47, Ma: .57, Ju: .68, Sa: .79, Ra: .9, Ke: .9, Ur: .96, Ne: .96, Pl: .96 }; return R * ring[id]; }
  if (id === 'Mo') return R * 0.1;
  if (id === 'Ra' || id === 'Ke') return R * 0.985;
  const big = S.outer ? Math.log(1 + 40) : Math.log(12);
  return R * clamp(0.14 + 0.84 * Math.log(1 + dist) / big, 0.12, 0.97);
}
function skySetup() {
  const cv = $('#skyCv'); if (!cv) return;
  const box = cv.parentElement, w = box.clientWidth, h = Math.min(w, 620), dpr = Math.min(2, G.devicePixelRatio || 1);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px';
  SKY.dpr = dpr; SKY.w = w; SKY.h = h;
  if (!SKY.stars) { let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; SKY.stars = Array.from({ length: 160 }, () => [rnd(), rnd(), rnd() * 1.3 + 0.2]); }
  const d = $('#skyDate'); if (d) d.value = JE.isoLocal(SKY.jd, 5.5).slice(0, 10);
  skyDraw(true);
}
function skyPositions(jd) { return JE.positionsAt(jd, S.ayan, S.node, skyIds()).pos; }
function skyDraw(force) {
  const cv = $('#skyCv'); if (!cv) return;
  const ctx = cv.getContext('2d'), w = SKY.w, h = SKY.h, dpr = SKY.dpr, cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 36;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const pos = (lon, r) => { const a = lon * Math.PI / 180; return [cx - r * Math.cos(a), cy + r * Math.sin(a)]; };
  for (const [x, y, s] of SKY.stars) { ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + s * 0.3) + ')'; ctx.fillRect(x * w, y * h, s, s); }
  // zodiac band
  ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,190,120,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R + 3, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, R + 29, 0, Math.PI * 2); ctx.stroke();
  ctx.font = '700 11px Nunito, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let s = 0; s < 12; s++) {
    const [x1, y1] = pos(s * 30, R + 3), [x2, y2] = pos(s * 30, R + 29); ctx.strokeStyle = 'rgba(255,190,120,.35)'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const [tx, ty] = pos(s * 30 + 15, R + 16); ctx.fillStyle = 'rgba(255,214,170,.85)'; ctx.fillText(sab(s), tx, ty);
  }
  ctx.strokeStyle = 'rgba(180,170,255,.25)';
  for (let n = 0; n < 27; n++) { const [x1, y1] = pos(n * 360 / 27, R - 2), [x2, y2] = pos(n * 360 / 27, R + 3); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  // Earth
  const g = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 9); g.addColorStop(0, '#9fd3ff'); g.addColorStop(1, '#2a6fd6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
  const P0 = skyPositions(SKY.jd), css = getComputedStyle(document.documentElement);
  const col = id => (css.getPropertyValue('--p' + id) || '#fff').trim() || '#fff';
  // natal markers
  const C = curChart();
  if (SKY.natal && C) for (const id of skyIds()) { const p = P(C, id); if (!p) continue; const [x, y] = pos(p.lon, R - 8); ctx.strokeStyle = col(id); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.stroke(); }
  // trails
  SKY.pts = [];
  for (const id of skyIds()) {
    const p = P0[id], r = skyRadius(id, p.dist, R);
    const tr0 = SKY.trail[id] = SKY.trail[id] || [];
    if (SKY.trails && SKY.playing && (!tr0.length || Math.abs(tr0[tr0.length - 1][2] - SKY.jd) >= 0.5)) { tr0.push([p.lon, r, SKY.jd]); if (tr0.length > 500) tr0.shift(); }
    if (SKY.trails && tr0.length > 1) {
      ctx.lineWidth = 1.6;
      for (let i = 1; i < tr0.length; i++) { const a = pos(tr0[i - 1][0], tr0[i - 1][1] * R / tr0[i][1] * (tr0[i][1] / R)), b = pos(tr0[i][0], tr0[i][1]); if (Math.abs(tr0[i][0] - tr0[i - 1][0]) > 180) continue; ctx.strokeStyle = col(id); ctx.globalAlpha = 0.08 + 0.6 * i / tr0.length; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    const [x, y] = pos(p.lon, r);
    const rad = id === 'Su' ? 9 : id === 'Mo' ? 7 : (id === 'Ra' || id === 'Ke') ? 4.5 : 6;
    ctx.fillStyle = col(id); ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
    if (SKY.sel === id) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, rad + 4, 0, Math.PI * 2); ctx.stroke(); }
    const prev = SKY.lastLon[id]; let retro = false;
    if (prev != null && SKY.lastJd != null && SKY.jd !== SKY.lastJd) retro = (((p.lon - prev + 540) % 360) - 180) * Math.sign(SKY.jd - SKY.lastJd) < 0;
    else if (id !== 'Ra' && id !== 'Ke' && id !== 'Su' && id !== 'Mo') { const q = JE.positionsAt(SKY.jd + 0.5, S.ayan, S.node, [id]).pos[id].lon; retro = ((q - p.lon + 540) % 360) - 180 < 0; }
    if (id === 'Ra' || id === 'Ke') retro = false;
    ctx.fillStyle = '#fff'; ctx.font = '800 12px Nunito, system-ui, sans-serif'; ctx.fillText(pab(id) + (retro ? '℞' : ''), x, y - rad - 8);
    SKY.pts.push({ id, x, y, lon: p.lon, retro, dist: p.dist });
  }
  for (const id of skyIds()) SKY.lastLon[id] = P0[id].lon; SKY.lastJd = SKY.jd;
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '800 13px "Baloo 2", system-ui, sans-serif';
  ctx.fillText(fmtDate(JE.isoLocal(SKY.jd, 5.5), true) + ' IST', 10, 16);
  ctx.font = '700 11px Nunito, system-ui'; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText(L(JE.AYAN[S.ayan].name).split(' (')[0], 10, 32);
  const d = $('#skyDate'); if (d && SKY.playing) d.value = JE.isoLocal(SKY.jd, 5.5).slice(0, 10);
  if (SKY.sel) skyInfo();
}
function skyInfo() {
  const box = $('#skyInfo'); const p = SKY.pts && SKY.pts.find(x => x.id === SKY.sel); if (!box || !p) return;
  const s = Math.floor(p.lon / 30), nk = Math.floor(p.lon / (360 / 27)), pada = Math.floor((p.lon % (360 / 27)) / (360 / 108)) + 1;
  const C = curChart(), np = C && P(C, p.id);
  box.innerHTML = '<b style="color:' + pcol(p.id) + '">' + esc(pn(p.id)) + '</b> · ' + sgn(s) + ' ' + dms(p.lon % 30) + ' · ' + nkn(nk) + ' ' + num(pada) + (p.retro ? ' · ℞ ' + tr('retro') : '') + (p.id !== 'Mo' && p.id !== 'Ra' && p.id !== 'Ke' ? ' · ' + fx(p.dist, 2) + ' AU' : '') + (np ? '<br><span class="sub">' + (hi() ? 'जन्म में: ' : 'At birth: ') + sgn(np.sign) + ' ' + dms(np.deg) + ' · ' + tr('fromMoonH') + ' ' + tr('house') + ' ' + num(((s - P(C, 'Mo').sign + 12) % 12) + 1) + '</span>' : '');
}
function skyPlay(on) {
  SKY.playing = on; const b = $('#skyPlay'); if (b) { b.innerHTML = on ? '⏸ ' + tr('pause') : '▶ ' + tr('play'); b.setAttribute('aria-pressed', on); }
  cancelAnimationFrame(SKY.raf);
  if (!on) { delete ANIM.sky; skyDraw(true); return; }
  let last = performance.now();
  const f = t => { if (!SKY.playing) return; const dt = Math.min(80, t - last); last = t; SKY.jd += SKY.speed * dt / 1000; if (SKY.jd > 2488069) SKY.jd = 2488069; skyDraw(); SKY.raf = requestAnimationFrame(f); };
  SKY.raf = requestAnimationFrame(f);
  ANIM.sky = { stop: () => { SKY.playing = false; cancelAnimationFrame(SKY.raf); } };
}
function bindSky() {
  const cv = $('#skyCv'); if (!cv) return;
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = null, bd = 26;
    for (const p of SKY.pts || []) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
    if (best) { SKY.sel = best.id; skyDraw(true); skyInfo(); }
  });
}

/* ---------------------------------------------------------------------
   19. Learn: guided tour on the real chart, glossary, quizzes
   --------------------------------------------------------------------- */
const LEARN = { tab: 'tour', q: '', quiz: null };
const TOUR_GO = { input: ['people'], chart: ['kundli', 'chart'], lagna: ['kundli', 'chart'], planets: ['kundli', 'planets'], moon: ['kundli', 'chart'], nakshatra: ['kundli', 'details'], houses: ['kundli', 'chart'], dasha: ['dasha', 'vim'], yogas: ['insights', 'yogas'], vargas: ['kundli', 'vargas'] };
function viewLearn(C) {
  let html = '<nav class="seg scroll" id="learnSeg" style="display:flex;margin-bottom:12px">' + [['tour', '🧭 ' + tr('tourShort')], ['gloss', '📚 ' + tr('glossary')], ['quiz', '❓ ' + tr('quiz')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (LEARN.tab === v ? 'on' : '') + '" style="flex:1">' + l + '</button>').join('') + '</nav>';
  if (!JC) return html + '<div class="card"><div class="banner err">' + tr('contentErr') + '</div></div>';
  if (LEARN.tab === 'gloss') return html + glossHtml();
  if (LEARN.tab === 'quiz') return html + quizHtml(C);
  const steps = JC.tour || [], i = clamp(S.tourStep || 0, 0, steps.length - 1), st = steps[i];
  html += '<div class="tour"><div class="card"><h2>🧭 ' + tr('tour') + '</h2><div class="tdots" role="group">' + steps.map((s, k) => '<button type="button" data-tour="' + k + '" class="' + (k === i ? 'on' : k < i ? 'done' : '') + '" aria-label="' + esc(L(s.title)) + '" aria-current="' + (k === i) + '">' + num(k + 1) + '</button>').join('') + '</div>' +
    '<h3>' + esc(L(st.title)) + '</h3><p class="reading">' + esc(L(st.body)) + '</p><div class="row" style="margin-top:10px"><button type="button" class="btn" data-tour="' + (i - 1) + '"' + (i === 0 ? ' disabled' : '') + '>◀ ' + tr('prev') + '</button><button type="button" class="btn primary" data-tour="' + (i + 1) + '"' + (i === steps.length - 1 ? ' disabled' : '') + '>' + tr('next') + ' ▶</button>' +
    (TOUR_GO[st.target] ? '<button type="button" class="btn sm" data-go="' + TOUR_GO[st.target].join(':') + '">↗ ' + tr('openScreen') + '</button>' : '') + '</div></div>' +
    '<div class="card" style="border:2px solid var(--accent)"><h2>🔦 ' + tr('inYourChart') + '</h2>' + tourDemo(C, st.target) + '</div></div>';
  return html;
}
function tourDemo(C, target) {
  const mo = P(C, 'Mo'), M = chartModel(C, 'D1'), p = curP();
  const ch = o => '<div class="chartwrap" style="max-width:360px">' + chartSVG(M, Object.assign({ ctx: 'main:D1', label: tr('chart'), title: tr('rashiChart').replace(/\s*\(.*\)/, '') }, o)).replace('class="chart', 'class="chart swap') + '</div>';
  switch (target) {
    case 'input': return '<p><b>' + esc(p.name) + '</b><br>' + personLine(p) + '</p>' + provList(C);
    case 'chart': return ch({}) + '<p class="sub">' + tr('tapHint') + '</p>';
    case 'lagna': return ch({ hl: { h: [1] } }) + '<p><b>' + tr('lagna') + ': ' + sgn(C.asc.sign) + ' ' + dms(C.asc.deg) + '</b> — ' + esc(L(JC.lagna[C.asc.sign].summary)) + '</p>';
    case 'planets': return ch({ hl: { p: PL9 } }) + '<div class="tablewrap"><table><tbody>' + PL9.map(id => { const q = P(C, id); return '<tr class="click" data-k="p:' + id + '"><td><b style="color:' + pcol(id) + '">' + esc(pn(id)) + '</b></td><td>' + sgn(q.sign) + '</td><td>' + tr('house') + ' ' + num(q.house) + '</td><td>' + digName(q.dignity) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    case 'moon': return ch({ hl: { p: ['Mo'] } }) + '<p><b>🌙 ' + sgn(mo.sign) + '</b> — ' + esc(L(JC.moonSign[mo.sign].summary)) + '</p>';
    case 'nakshatra': return '<p><b>⭐ ' + nkn(mo.nak) + ' · ' + tr('pada') + ' ' + num(mo.pada) + '</b> (' + tr('lord') + ' ' + pn(mo.nakLord) + ')</p><p class="reading">' + esc(L(JC.nakshatras[mo.nak].summary)) + '</p><p class="sub">' + tr('naamAkshar') + ': <b>' + esc(L(C.avakhada.nameSyllable)) + '</b></p>';
    case 'houses': return ch({ hl: { h: [1, 4, 7, 10] } }) + '<div class="tablewrap"><table><tbody>' + Array.from({ length: 12 }, (_, k) => '<tr class="click" data-k="h:' + (k + 1) + '"><td><b>' + num(k + 1) + '</b></td><td>' + sgn(signOfHouse(C.asc.sign, k + 1)) + '</td><td class="wrap">' + esc(L(JC.houses[k + 1].name)) + '</td></tr>').join('') + '</tbody></table></div>';
    case 'dasha': { const path = JE.dashaAt(C.dashas.vimshottari.tree, nowJd(), 3); return '<div class="curp">' + path.map((n, k) => '<button type="button" data-go="dasha:vim"><span class="lv">' + tr(LEVEL_NAME[k + 1]) + '</span><b style="color:' + pcol(n.lord) + '">' + esc(pn(n.lord)) + '</b><span>' + fmtDate(n.startISO) + ' – ' + fmtDate(n.endISO) + '</span></button>').join('') + '</div>' + (path[0] ? '<p class="reading">' + esc(L(JC.dashaLord[path[0].lord].summary)) + '</p>' : ''); }
    case 'yogas': { const ys = C.yogas.filter(y => y.present); return '<p>' + ys.map(y => '<button type="button" class="chip" data-yoga="' + y.id + '">' + esc(yogaName(y.id)) + '</button>').join(' ') + '</p><p class="sub">' + num(ys.length) + ' / ' + num(C.yogas.length) + '</p>'; }
    case 'vargas': { const best = PL7.slice().sort((a, b) => C.shadbala[b].ratio - C.shadbala[a].ratio)[0]; return '<div class="chartwrap" style="max-width:300px">' + chartSVG(chartModel(C, 'D9'), { ctx: 'varga:D9', label: 'D9', title: 'D9' }) + '</div><p>' + (hi() ? 'षड्बल में सबसे बलवान: ' : 'Strongest by Shadbala: ') + '<b>' + pn(best) + '</b> (' + fx(C.shadbala[best].ratio, 2) + '×)</p>'; }
  }
  return ch({});
}
function glossHtml() {
  const q = fold(LEARN.q), G2 = JC.glossary || {};
  const keys = Object.keys(G2).filter(k => !q || fold(k.replace(/_/g, ' ') + ' ' + G2[k].term.en + ' ' + G2[k].term.hi + ' ' + G2[k].def.en + ' ' + G2[k].def.hi).includes(q));
  keys.sort((a, b) => L(G2[a].term).localeCompare(L(G2[b].term), hi() ? 'hi' : 'en'));
  return '<div class="card"><h2>📚 ' + tr('glossary') + ' <small>' + num(keys.length) + ' / ' + num(Object.keys(G2).length) + '</small></h2><div class="field"><label class="vh" for="glSearch">' + tr('search') + '</label><input type="search" id="glSearch" placeholder="🔍 ' + esc(tr('glossPh')) + '" value="' + esc(LEARN.q) + '"></div><div class="gl" id="glList">' + glossItems(keys) + '</div></div>';
}
function glossItems(keys) { const G2 = JC.glossary; return keys.map(k => '<div class="g" id="gl-' + k + '"><b>' + esc(L(G2[k].term)) + '</b> <span class="sub">' + esc(hi() ? G2[k].term.en : G2[k].term.hi) + '</span><p>' + esc(L(G2[k].def)) + '</p></div>').join('') || '<p class="sub">' + tr('noneP') + '</p>'; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function makeQuiz(C) {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const VY = { Ke: 7, Ve: 20, Su: 6, Mo: 10, Ma: 7, Ra: 18, Ju: 16, Sa: 19, Me: 17 };
  const opts = (ans, pool, fmt) => shuffle([ans].concat(shuffle(pool.filter(x => x !== ans)).slice(0, 3))).map(x => ({ v: x, l: fmt(x) }));
  const gens = [
    () => { const s = Math.floor(Math.random() * 12), a = SIGN_LORD[s]; return { q: hi() ? sgn(s) + ' राशि का स्वामी कौन है?' : 'Which planet rules ' + sgn(s) + '?', opts: opts(a, PL7, pn), ans: a }; },
    () => { const p = pick(PL7), a = EXALT[p]; return { q: hi() ? pn(p) + ' किस राशि में उच्च होता है?' : 'In which sign is ' + pn(p) + ' exalted?', opts: opts(a, [...Array(12).keys()], sgn), ans: a }; },
    () => { const p = pick(PL9), a = VY[p]; return { q: hi() ? pn(p) + ' की विंशोत्तरी महादशा कितने वर्ष की है?' : 'How many years is the Vimshottari mahadasha of ' + pn(p) + '?', opts: opts(a, [6, 7, 10, 16, 17, 18, 19, 20], x => num(x)), ans: a }; },
    () => { const a = C.asc.sign; return { q: hi() ? 'इस कुंडली का लग्न क्या है?' : 'What is the lagna of this chart?', opts: opts(a, [...Array(12).keys()], sgn), ans: a }; },
    () => { const a = P(C, 'Mo').nak; return { q: hi() ? 'जन्म नक्षत्र क्या है?' : 'What is the birth nakshatra (Moon\'s nakshatra)?', opts: opts(a, [...Array(27).keys()], nkn), ans: a }; },
    () => { const n = Math.floor(Math.random() * 27), a = DASHA_ORDER[n % 9]; return { q: hi() ? nkn(n) + ' नक्षत्र का स्वामी कौन है?' : 'Who is the lord of ' + nkn(n) + ' nakshatra?', opts: opts(a, PL9, pn), ans: a }; },
    () => { const p = pick(PL7), a = P(C, p).house; return { q: hi() ? 'इस कुंडली में ' + pn(p) + ' किस भाव में है?' : 'In which house is ' + pn(p) + ' in this chart?', opts: opts(a, [...Array(12).keys()].map(x => x + 1), x => tr('house') + ' ' + num(x)), ans: a }; },
    () => { const a = 'Sa'; return { q: hi() ? 'साढ़ेसाती किस ग्रह के गोचर से होती है?' : 'Sade Sati is caused by the transit of which planet?', opts: opts(a, PL9, pn), ans: a }; }
  ];
  return { qs: shuffle(gens.slice()).slice(0, 5).map(g => g()), done: {}, score: 0 };
}
function quizHtml(C) {
  if (!LEARN.quiz) LEARN.quiz = makeQuiz(C);
  const Q = LEARN.quiz;
  return '<div class="card quiz"><div class="row between"><h2>❓ ' + tr('quiz') + '</h2><span class="pill gold">' + tr('score') + ': ' + num(Q.score) + ' / ' + num(Q.qs.length) + '</span></div>' + Q.qs.map((q, i) => {
    const d = Q.done[i];
    return '<div class="dsec"><h3>' + num(i + 1) + '. ' + esc(q.q) + '</h3><div class="opts">' + q.opts.map((o, j) => '<button type="button" data-quiz="' + i + ':' + j + '"' + (d != null ? ' disabled class="' + (o.v === q.ans ? 'right' : d === j ? 'wrong' : '') + '"' : '') + '>' + esc(o.l) + '</button>').join('') + '</div>' + (d != null ? '<p class="' + (q.opts[d].v === q.ans ? 'ok' : 'bad') + '">' + (q.opts[d].v === q.ans ? tr('right') : tr('wrong') + ' ' + esc(q.opts.find(o => o.v === q.ans).l)) + '</p>' : '') + '</div>';
  }).join('') + '<button type="button" class="btn primary" data-act="newQuiz">🔄 ' + tr('newQuiz') + '</button></div>';
}

/* ---------------------------------------------------------------------
   20. Settings: provenance, time rules, "what changed", self-test, about
   --------------------------------------------------------------------- */
const CMP = { ayan: null, node: null, houses: null };
let SELFTEST = null;
function compareCharts(A, B) {
  const out = { planets: [], lagna: A.asc.sign !== B.asc.sign, vargas: [], yogasAdd: [], yogasLost: [], dashaDays: 0 };
  for (const id of PL9) { const a = P(A, id), b = P(B, id); const ch = { sign: a.sign !== b.sign, nak: a.nak !== b.nak || a.pada !== b.pada, house: a.house !== b.house }; if (ch.sign || ch.nak || ch.house) out.planets.push({ id, a, b, ch }); }
  for (const v of VARGAS) { const list = PL9.filter(id => A.vargas[v].planets[id] !== B.vargas[v].planets[id]); if (A.vargas[v].asc !== B.vargas[v].asc) list.unshift('La'); if (list.length) out.vargas.push({ v, list }); }
  const pa = new Set(A.yogas.filter(y => y.present).map(y => y.id)), pb = new Set(B.yogas.filter(y => y.present).map(y => y.id));
  out.yogasAdd = [...pb].filter(x => !pa.has(x)); out.yogasLost = [...pa].filter(x => !pb.has(x));
  out.dashaDays = B.dashas.vimshottari.tree[1].start - A.dashas.vimshottari.tree[1].start;
  out.mdA = A.dashas.vimshottari.tree; out.mdB = B.dashas.vimshottari.tree;
  return out;
}
function changeSummary(d) {
  const parts = [];
  parts.push(d.lagna ? (hi() ? 'लग्न बदला' : 'lagna changed') : (hi() ? 'लग्न वही' : 'lagna same'));
  parts.push(num(d.planets.filter(x => x.ch.sign).length) + ' ' + (hi() ? 'ग्रहों की राशि बदली' : 'planets changed sign'));
  parts.push(num(d.planets.filter(x => x.ch.nak).length) + ' ' + (hi() ? 'नक्षत्र/पाद बदले' : 'changed nakshatra/pada'));
  parts.push(num(d.vargas.length) + ' ' + (hi() ? 'वर्ग बदले' : 'vargas differ'));
  parts.push(tr('dashaShift') + ' ' + fx(d.dashaDays, 1) + ' ' + tr('days'));
  return parts.join(' · ');
}
function viewSettings(C) {
  const p = curP();
  let html = needsOffsetHtml(C, p) + '<div class="grid2"><div class="card"><h2>🧪 ' + tr('provenance') + '</h2>' + provList(C) + '</div>';
  // time rules for this person
  let tr0 = null; try { tr0 = JE.timeRules(p.date, p.place); } catch (e) { }
  if (tr0) html += '<div class="card"><h2>🕰️ ' + tr('timeRule') + '</h2><p><b>UTC' + hm(C.meta.utcOffsetUsed) + '</b> — ' + esc(L(C.meta.offsetReason)) + '</p>' + (tr0.warnings.length ? '<div class="banner warn"><ul>' + tr0.warnings.map(w => '<li>' + esc(L(w)) + '</li>').join('') + '</ul></div>' : '') +
    '<div class="sub">' + tr('alternatives') + '</div><div class="chips"><button type="button" class="chip' + ((p.tzMode || 'auto') === 'auto' ? ' on' : '') + '" data-ptz="auto">' + tr('useAuto') + ' (' + hm(tr0.offset) + ')</button>' + tr0.alternatives.map(a => '<button type="button" class="chip' + (p.tzMode === a.mode ? ' on' : '') + '" data-ptz="' + esc(a.mode) + '">' + esc(L(a.label)) + '</button>').join('') + '</div></div>';
  // compare conventions
  const def = CHANGE ? CHANGE.from : null;
  const ca = CMP.ayan || (def ? def.ayan : (S.ayan === 'lahiri' ? 'raman' : 'lahiri')), cn = CMP.node || (def ? def.node : S.node), chs = CMP.houses || (def ? def.houses : S.houses);
  let B = null; try { B = computeChart(p, { ayanamsa: ca, node: cn, houses: chs }); } catch (e) { }
  html += '<div class="card wide" id="cmpCard"><h2>🔁 ' + tr('whatChanged') + '</h2><p class="sub">' + (hi() ? 'वर्तमान: ' : 'Current: ') + esc(L(JE.AYAN[S.ayan].name).split(' (')[0]) + ' · ' + tr(S.node) + ' · ' + tr(S.houses) + '</p>' +
    '<div class="row"><span class="lbl">' + tr('compareA') + '</span><label class="vh" for="cmpAyan">' + tr('ayanamsa') + '</label><select id="cmpAyan" class="inline">' + Object.keys(JE.AYAN).map(k => '<option value="' + k + '"' + (ca === k ? ' selected' : '') + '>' + esc(L(JE.AYAN[k].name).split(' (')[0]) + '</option>').join('') + '</select>' +
    '<label class="vh" for="cmpNode">' + tr('node') + '</label><select id="cmpNode" class="inline">' + ['mean', 'true'].map(k => '<option value="' + k + '"' + (cn === k ? ' selected' : '') + '>' + tr('node') + ': ' + tr(k) + '</option>').join('') + '</select>' +
    '<label class="vh" for="cmpHouses">' + tr('houses') + '</label><select id="cmpHouses" class="inline">' + ['whole', 'sripati', 'placidus', 'equal'].map(k => '<option value="' + k + '"' + (chs === k ? ' selected' : '') + '>' + tr(k) + '</option>').join('') + '</select></div>';
  if (B) {
    const d = compareCharts(C, B);
    html += '<div class="banner info">' + esc(changeSummary(d)) + '</div><div class="tablewrap"><table><thead><tr><th></th><th>' + (hi() ? 'वर्तमान' : 'Current') + '</th><th>' + tr('compareA') + '</th></tr></thead><tbody>' +
      '<tr class="' + (d.lagna ? 'chg' : '') + '"><td><b>' + tr('lagna') + '</b></td><td>' + sgn(C.asc.sign) + ' ' + dms(C.asc.deg) + ' · ' + nkn(C.asc.nak) + '</td><td>' + sgn(B.asc.sign) + ' ' + dms(B.asc.deg) + ' · ' + nkn(B.asc.nak) + '</td></tr>' +
      PL9.map(id => { const a = P(C, id), b = P(B, id), ch = a.sign !== b.sign || a.nak !== b.nak || a.pada !== b.pada || a.house !== b.house; return '<tr class="' + (ch ? 'chg' : '') + '"><td><b style="color:' + pcol(id) + '">' + esc(pn(id)) + '</b></td><td>' + sgn(a.sign) + ' ' + dms(a.deg) + ' · ' + nkn(a.nak) + ' ' + num(a.pada) + ' · H' + num(a.house) + '</td><td>' + (a.sign !== b.sign ? '<b>' + sgn(b.sign) + '</b>' : sgn(b.sign)) + ' ' + dms(b.deg) + ' · ' + (a.nak !== b.nak || a.pada !== b.pada ? '<b>' + nkn(b.nak) + ' ' + num(b.pada) + '</b>' : nkn(b.nak) + ' ' + num(b.pada)) + ' · ' + (a.house !== b.house ? '<b>H' + num(b.house) + '</b>' : 'H' + num(b.house)) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h3>🔲 ' + tr('vargaChanges') + '</h3>' + (d.vargas.length ? '<div class="chips">' + d.vargas.map(v => '<span class="pill gold">' + v.v + ': ' + v.list.map(pab).join(', ') + '</span>').join('') + '</div>' : '<p class="sub">' + tr('unchanged') + '</p>') +
      '<h3>⏳ ' + tr('mahadasha') + '</h3><div class="tablewrap"><table><tbody>' + d.mdA.slice(0, 9).map((n, i) => { const m = d.mdB[i]; const dd = m ? (m.start - n.start) : 0; return '<tr class="' + (Math.abs(dd) > 1 || (m && m.lord !== n.lord) ? 'chg' : '') + '"><td>' + pn(n.lord) + (m && m.lord !== n.lord ? ' → ' + pn(m.lord) : '') + '</td><td>' + fmtDate(n.startISO) + '</td><td>' + (m ? fmtDate(m.startISO) : '') + '</td><td class="num">' + (dd > 0 ? '+' : '') + fx(dd, 1) + ' ' + tr('dy') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h3>✨ ' + tr('yogaChanges') + '</h3><p>' + (d.yogasAdd.length || d.yogasLost.length ? d.yogasAdd.map(y => '<span class="pill green">+ ' + esc(yogaName(y)) + '</span> ').join('') + d.yogasLost.map(y => '<span class="pill red">− ' + esc(yogaName(y)) + '</span> ').join('') : '<span class="sub">' + tr('unchanged') + '</span>') + '</p>';
  }
  html += '</div>';
  html += '<div class="card wide"><h2>🧮 ' + tr('advanced') + '</h2>' + engControls('engS_') + (C.meta && C.meta.dashaYear ? '<p class="sub">✓ ' + tr('dashaYear') + ': ' + esc(typeof C.meta.dashaYear === 'object' ? num(C.meta.dashaYear.days) + ' ' + tr('days') + (C.meta.dashaYear.name ? ' (' + C.meta.dashaYear.name + ')' : '') : String(C.meta.dashaYear)) + '</p>' : '') + '</div>';
  // self test
  html += '<div class="card wide"><h2>✅ ' + tr('selfTest') + '</h2><button type="button" class="btn primary" data-act="selftest">▶ ' + tr('runTest') + '</button><div id="stBox" style="margin-top:10px">' + selfTestHtml() + '</div></div>';
  html += '<div class="card wide"><h2>ℹ️ ' + tr('about') + '</h2>' + (JC && JC.disclaimer ? '<p class="reading">' + esc(L(JC.disclaimer.full)) + '</p>' : '') + '<p class="sub">' + tr('credits') + '</p><p class="sub">' + (ensureCities() ? esc(JE_CITIES.attribution) : '') + '</p><p class="sub">⌨️ ' + (hi() ? 'कीबोर्ड: Tab से आगे, Enter/Space से खोलें, तीर-कुंजियाँ कुंडली में, Esc से बंद।' : 'Keyboard: Tab to move, Enter/Space to open, arrow keys inside charts and the dasha timeline, Esc to close.') + '</p></div></div>';
  return html;
}
function selfTestHtml() {
  if (!SELFTEST) return '';
  const r = SELFTEST.rows, ok = r.filter(x => x.pass).length;
  return '<div class="banner ' + (ok === r.length ? 'info' : 'err') + '"><b>' + num(ok) + ' / ' + num(r.length) + ' ' + tr('passed') + '</b> · ' + num(SELFTEST.ms) + ' ms</div><div class="tablewrap" style="max-height:420px;overflow:auto"><table><thead><tr><th>' + tr('case') + '</th><th>' + tr('field') + '</th><th class="num">' + tr('ours') + '</th><th class="num">' + tr('ref') + '</th><th class="num">' + tr('diff') + '</th><th>' + tr('pass') + '</th></tr></thead><tbody>' +
    r.map(x => '<tr><td>' + esc(x.case) + '</td><td>' + esc(x.field) + '</td><td class="num">' + esc(x.ours) + '</td><td class="num">' + esc(x.ref) + '</td><td class="num">' + esc(x.diff) + '</td><td class="' + (x.pass ? 'ok' : 'bad') + '">' + (x.pass ? '✓' : '✗') + '</td></tr>').join('') + '</tbody></table></div>';
}

/* ---------------------------------------------------------------------
   21. Print: A4 kundli booklet
   --------------------------------------------------------------------- */
// (the A4 booklet lives in src/print.js)
/* ---------------------------------------------------------------------
   21b. Phase 2 shared helpers: charts of saved people, dates, place picker,
        .ics files, share text, score colours
   --------------------------------------------------------------------- */
const P2OK = () => !!(JE && JE.match && JE.family && JE.muhurtaAsync && JE.calendar);
const p2Missing = () => '<div class="card"><div class="banner err">' + (hi() ? 'इस संस्करण में चरण-2 इंजन (engine2.js) नहीं मिला।' : 'The Phase 2 engine (engine2.js) is not loaded in this build.') + '</div></div>';
const profById = id => PROFILES.find(x => x.id === id) || null;
function chartOf(p) { if (!p) return null; try { return computeChart(p); } catch (e) { console.error(e); return null; } }
const initial = p => esc(((p && p.name) || '?').trim().charAt(0).toUpperCase() || '?');
const WD = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'] };
const ymd = t => t.getUTCFullYear() + '-' + pad2(t.getUTCMonth() + 1) + '-' + pad2(t.getUTCDate());
const dUTC = ds => { const [y, m, d] = String(ds).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d || 1)); };
const addDays = (ds, n) => ymd(new Date(dUTC(ds).getTime() + n * DAY_MS));
function addMonths(ds, n) { const t = dUTC(ds), y = t.getUTCFullYear(), m = t.getUTCMonth() + n, d = t.getUTCDate(); const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); return ymd(new Date(Date.UTC(y, m, Math.min(d, last)))); }
const daysBetween = (a, b) => Math.round((dUTC(b) - dUTC(a)) / DAY_MS);
const dowOf = ds => dUTC(ds).getUTCDay();
const dayLabel = ds => WD[S.lang][dowOf(ds)] + ', ' + fmtDate(ds);
const validDate = ds => /^\d{4}-\d\d-\d\d$/.test(ds || '') && +ds.slice(0, 4) >= 1800 && +ds.slice(0, 4) <= 2100;
const monthTitle = ym => MON[S.lang][+ym.slice(5, 7) - 1] + ' ' + num(ym.slice(0, 4));
const fmtLeft = days => days < 1 ? (hi() ? 'आज' : 'today') : fmtDur(days / 365.25);
const firstWord = o => L(o).split(' (')[0];
function sidSignAt(jd, id) { try { return Math.floor(JE.positionsAt(jd, S.ayan === 'tropical' ? 'lahiri' : S.ayan, S.node, [id]).pos[id].lon / 30); } catch (e) { return null; } }
const scoreCls = s => s >= 75 ? 's-top' : s >= 60 ? 's-good' : s >= 45 ? 's-fair' : s > 0 ? 's-weak' : 's-none';
function matchColor(total) { const k = clamp((total - 20) / 10, -1, 1); return k >= 0 ? 'color-mix(in srgb, var(--green) ' + Math.round(22 + k * 50) + '%, var(--card))' : 'color-mix(in srgb, var(--red) ' + Math.round(20 - k * 40) + '%, var(--card))'; }
const reduceMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

/* ---- place picker (offline city table) ---- */
const DEF_PLACE = { name: 'New Delhi', hi: 'नई दिल्ली', lat: 28.6139, lon: 77.209, tz: 'auto', country: 'IN', state: 'Delhi' };
function defaultPlace() { const p = curP() || PROFILES[0]; return p && p.place ? Object.assign({}, p.place) : Object.assign({}, DEF_PLACE); }
function offsetOf(pl, date) { if (pl && typeof pl.tz === 'number' && isFinite(pl.tz)) return pl.tz; try { return JE.timeRules(date || todayStr(), pl).offset; } catch (e) { return 5.5; } }
const enginePlace = pl => ({ name: pl.name || '', lat: +pl.lat, lon: +pl.lon, tz: pl.tz, country: pl.country || null, region: pl.region || null, state: pl.state || null });
const placeKey = pl => pl ? [(+pl.lat).toFixed(3), (+pl.lon).toFixed(3), pl.tz, pl.country].join('|') : '';
const CP = { st: {}, res: {}, sel: {} };
function placePicker(key, st, onDate) {
  const pl = st.place, seen = new Set([placeKey(pl)]), chips = [];
  for (const p of PROFILES) { const k = placeKey(p.place); if (!seen.has(k) && chips.length < 5) { seen.add(k); chips.push('<button type="button" class="chip" data-cpp="' + key + ':' + p.id + '">📍 ' + esc(placeLabel(p.place)) + '</button>'); } }
  CP.st[key] = st;
  return '<div class="field cp" data-cp="' + key + '"><label for="' + key + 'City">' + tr('placeL') + '</label>' +
    '<input id="' + key + 'City" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + key + 'Sugg" autocomplete="off" placeholder="🔍 ' + esc(tr('cityPick')) + '"' + (ensureCities() ? '' : ' disabled') + '>' +
    '<div class="sugg hidden" id="' + key + 'Sugg" role="listbox" aria-label="' + esc(tr('cityPick')) + '"></div>' +
    '<div class="placebox" id="' + key + 'Pl" style="margin-top:6px">📍 <b>' + esc(placeLabel(pl)) + '</b>' + (pl.state ? ', ' + esc(pl.state) : '') + ' · ' + fx(pl.lat, 2) + '°, ' + fx(pl.lon, 2) + '° · UTC' + hm(offsetOf(pl, onDate)) + '</div>' +
    (chips.length ? '<div class="chips">' + chips.join('') + '</div>' : '') + '</div>';
}
function cpSearch(key, q) {
  const box = $('#' + key + 'Sugg'), inp = $('#' + key + 'City'); if (!box || !ensureCities()) return;
  const res = q && q.trim().length >= 1 ? JE_CITIES.search(q, 10) : [];
  CP.res[key] = res; CP.sel[key] = -1;
  if (!res.length) { box.classList.add('hidden'); box.innerHTML = ''; inp.setAttribute('aria-expanded', 'false'); return; }
  box.innerHTML = res.map((c, i) => '<div role="option" id="' + key + 'o' + i + '" data-cpi="' + key + ':' + i + '" aria-selected="false"><b>' + esc(hi() && c.hi ? c.hi : c.name) + '</b><span>' + esc(c.country === 'IN' ? [c.district, c.state].filter(Boolean).join(', ') : c.country + ' · UTC' + hm(c.tz)) + '</span></div>').join('');
  box.classList.remove('hidden'); inp.setAttribute('aria-expanded', 'true');
}
function cpPick(key, place) {
  const st = CP.st[key]; if (!st || !place) return;
  st.place = { name: place.name, hi: place.hi || null, lat: +place.lat, lon: +place.lon, tz: place.tz, country: place.country || null, region: place.region || null, state: place.state || null, district: place.district || null };
  if (st.onPlace) st.onPlace();
  const y = G.scrollY; render(); G.scrollTo(0, y);
  const i = $('#' + key + 'City'); if (i) i.focus({ preventScroll: true });
  toast('📍 ' + placeLabel(st.place));
}

/* ---- files & sharing ---- */
// SPEC J file names: Name_DD-MM-YYYY_Place — letters (any script, with their combining marks, so Devanagari stays intact),
// digits, '-' and '_' only; spaces → '_'; \ / : * ? " < > | and other punctuation dropped; repeats collapsed; ≤ 80 characters
function safeName(s) {
  return String(s == null ? '' : s).normalize('NFC').replace(/[\\/:*?"<>|]+/g, '').replace(/[^\p{L}\p{M}\p{N}_\- ]+/gu, ' ')
    .trim().replace(/\s+/g, '_').replace(/_+/g, '_').replace(/-+/g, '-').replace(/(?:_-|-_)+/g, '_').replace(/^[-_]+|[-_]+$/g, '');
}
function clipName(t, max) {
  max = max || 80; const ch = Array.from(t); if (ch.length <= max) return t;
  let n = max; while (n > 1 && /\p{M}/u.test(ch[n])) n--; // never cut between a letter and its matra/virama
  return ch.slice(0, n).join('').replace(/[-_&]+$/g, '');
}
const dmyOf = iso => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(String(iso || '')); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; };
const cityOnly = pl => pl ? String(placeLabel(pl) || '').split(',')[0] : '';
function fileBaseFor(p) {
  if (!p) return 'Kundli_Studio';
  return clipName([safeName(p.name) || 'Kundli', dmyOf(p.date), safeName(cityOnly(p.place))].filter(Boolean).join('_'), 80) || 'Kundli_Studio';
}
function matchFileBase(a, b) { return clipName((safeName(a && a.name) || '1') + '_&_' + (safeName(b && b.name) || '2') + '_Match_' + dmyOf(todayStr()), 80); }
function namedFile(parts, ext) { return (clipName(parts.map(safeName).filter(Boolean).join('_'), 80) || 'Kundli_Studio') + ext; }
let TITLE_SAVED = null;
function titleForPrint() {
  if (S.view === 'people' && S.sub.people === 'match') { const A = profById(MT.a), B = profById(MT.b); if (A && B) return matchFileBase(A, B); }
  const p = curP(); return p ? fileBaseFor(p) : null;
}
function setPrintTitle(t) { if (IS_NODE) return; if (TITLE_SAVED == null) TITLE_SAVED = document.title; if (t) document.title = t; }
function restoreTitle() { if (IS_NODE || TITLE_SAVED == null) return; document.title = TITLE_SAVED; TITLE_SAVED = null; }
function doPrint(t) { setPrintTitle(t || titleForPrint()); closeSheet(); hidePop(); setTimeout(() => G.print(), 30); }
function download(name, text, mime) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const icsStamp = jd => new Date(Math.round((jd - 2440587.5) * 86400) * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
function icsFold(line) {
  const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null, out = []; let cur = '', bytes = 0;
  for (const ch of line) { const b = enc ? enc.encode(ch).length : 1; if (bytes + b > 74) { out.push(cur); cur = ''; bytes = 0; } cur += ch; bytes += b; }
  out.push(cur); return out.join('\r\n ');
}
function icsBuild(items) {
  const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kundli Studio//Nivriti Rajput//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'], now = icsStamp(nowJd());
  items.forEach((it, i) => {
    out.push('BEGIN:VEVENT', 'UID:ks-' + Math.round(it.start * 1e5) + '-' + i + '@kundli-studio.local', 'DTSTAMP:' + now);
    if (it.allDay) out.push('DTSTART;VALUE=DATE:' + it.allDay.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + addDays(it.allDay, 1).replace(/-/g, ''));
    else out.push('DTSTART:' + icsStamp(it.start), 'DTEND:' + icsStamp(it.end && it.end > it.start ? it.end : it.start + 1 / 96));
    out.push('SUMMARY:' + icsEsc(it.title));
    if (it.desc) out.push('DESCRIPTION:' + icsEsc(it.desc));
    if (it.loc) out.push('LOCATION:' + icsEsc(it.loc));
    out.push('TRANSP:TRANSPARENT', 'END:VEVENT');
  });
  out.push('END:VCALENDAR'); return out.map(icsFold).join('\r\n') + '\r\n';
}
function saveIcs(name, items) { if (!items.length) { toast(tr('noEvents')); return; } download(name, icsBuild(items), 'text/calendar;charset=utf-8'); toast('📅 ' + tr('icsSaved')); }
let SHARE_TXT = '';
function shareSheet(title, text, trigger) {
  SHARE_TXT = text;
  openSheet('📋 ' + esc(title), '<div class="field"><label class="vh" for="shareTxt">' + esc(title) + '</label><textarea id="shareTxt" rows="10" readonly>' + esc(text) + '</textarea></div><div class="row"><button type="button" class="btn primary" data-p2="copyTxt">📋 ' + tr('copy') + '</button>' +
    (typeof navigator !== 'undefined' && navigator.share ? '<button type="button" class="btn" data-p2="shareTxt">📤 ' + tr('shareNative') + '</button>' : '') + '</div><p class="sub" style="margin-top:8px">🔒 ' + tr('privacy') + '</p>', trigger);
}
function copyText(txt) {
  const done = () => toast(tr('copied'));
  const fallback = () => { const t = $('#shareTxt'); if (t) { t.select(); try { document.execCommand('copy'); done(); } catch (e) { } } };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
}

/* ---------------------------------------------------------------------
   21c. 💞 Match: two people, North / South / Both
   --------------------------------------------------------------------- */
const MT = { a: null, b: null, sys: 'both' };
let MATCH_C = { k: '', m: null, e: null };
function matchPair() {
  if (!profById(MT.a)) MT.a = (curP() || PROFILES[0] || {}).id || null;
  const A = profById(MT.a);
  if (!profById(MT.b) || MT.b === MT.a) { const o = PROFILES.find(x => x.id !== MT.a && A && x.gender && A.gender && x.gender !== A.gender) || PROFILES.find(x => x.id !== MT.a); MT.b = o ? o.id : null; }
}
function computeMatch() {
  const A = profById(MT.a), B = profById(MT.b); if (!A || !B || A.id === B.id) return null;
  const k = JSON.stringify([A, B, MT.sys, S.ayan, S.node, S.houses, S.eng]);
  if (MATCH_C.k === k) return MATCH_C;
  let m = null, e = null;
  try { const CA = computeChart(A), CB = computeChart(B); m = JE.match(CA, CB, { system: MT.sys }); } catch (er) { e = er; console.error(er); }
  MATCH_C = { k, m, e, A, B }; return MATCH_C;
}
const kootaName = id => JC && JC.kootas && JC.kootas[id] ? firstWord(JC.kootas[id].name) : id;
const porName = id => JC && JC.poruthams && JC.poruthams[id] ? firstWord(JC.poruthams[id].name).replace(/ Porutham| पोरुथम| पोरुत्तम/, '') : id;
const taraInfo = id => JC && JC.familyHelp && JC.familyHelp.tarabala && (JC.familyHelp.tarabala.taras || []).find(t => t.id === id);
const bandOf = id => JC && JC.matchVerdicts && (JC.matchVerdicts.bands || []).find(b => b.id === id);
function kootaVal(id, v) {
  if (v == null || v === '') return '—';
  const AV = JC && JC.avakhada && JC.avakhada.values;
  if (id === 'graha_maitri') return pn(v);
  if (id === 'bhakoot') return isFinite(+v) ? sgn(+v) : String(v);
  if (id === 'tara') { const t = taraInfo(v); return t ? firstWord(t.name) : String(v); }
  if (AV && AV[id] && AV[id][v]) return firstWord(AV[id][v]);
  return String(v).replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
}
function gaugeSvg(id, val, max, label, unit) {
  const r = 80, len = Math.PI * r, frac = clamp(val / max, 0, 1);
  const pt = (f, rr) => [100 - rr * Math.cos(Math.PI * f), 100 - rr * Math.sin(Math.PI * f)];
  const marks = (max === 36 ? [18, 24, 28] : [5, 7.5]).map(mk => { const [x1, y1] = pt(mk / max, r - 13), [x2, y2] = pt(mk / max, r + 13), [tx, ty] = pt(mk / max, r + 22); return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="gmark"/><text x="' + tx.toFixed(1) + '" y="' + (ty + 3).toFixed(1) + '" class="gtick">' + num(mk) + '</text>'; }).join('');
  return '<svg class="gauge" viewBox="0 -6 200 128" role="img" aria-label="' + esc(label + ': ' + val + ' / ' + max) + '"><defs><linearGradient id="' + id + 'G" x1="0" x2="1" y1="0" y2="0"><stop offset="0" style="stop-color:var(--red)"/><stop offset=".55" style="stop-color:var(--gold)"/><stop offset="1" style="stop-color:var(--green)"/></linearGradient></defs>' +
    '<path d="M20,100 A80,80 0 0 1 180,100" class="gtrack"/><path d="M20,100 A80,80 0 0 1 180,100" class="gfill" style="stroke:url(#' + id + 'G);stroke-dasharray:' + len.toFixed(1) + ';stroke-dashoffset:' + len.toFixed(1) + '" data-off="' + (len * (1 - frac)).toFixed(1) + '"/>' + marks +
    '<text x="100" y="88" class="gnum" data-to="' + val + '">' + num(val) + '</text><text x="100" y="112" class="gmax">' + esc('/ ' + num(max) + (unit ? ' ' + unit : '')) + '</text></svg>';
}
function animateGauges() {
  const run = !reduceMotion();
  $$('svg.gauge').forEach(svg => {
    const f = svg.querySelector('.gfill'), t = svg.querySelector('.gnum'); if (!f || !t) return;
    const to = +t.dataset.to, dg = (String(t.dataset.to).split('.')[1] || '').length, fin = () => { t.textContent = num(to.toFixed(dg)); };
    if (!run) { f.style.strokeDashoffset = f.dataset.off; fin(); return; }
    t.textContent = num((0).toFixed(dg));
    raf1(() => { f.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)'; f.style.strokeDashoffset = f.dataset.off; });
    const t0 = performance.now(), step = now => { const k = clamp((now - t0) / 1000, 0, 1), e = 1 - Math.pow(1 - k, 3); t.textContent = num((Math.round(to * e * 2) / 2).toFixed(dg)); if (k < 1 && document.contains(t)) requestAnimationFrame(step); else fin(); };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(step);
    setTimeout(() => { if (document.contains(t)) { fin(); f.style.strokeDashoffset = f.dataset.off; } }, 1500);
  });
}
const sex = g => g === 'm' ? '♂' : g === 'f' ? '♀' : '◦';
const moonLine = x => x ? esc(L(x.rashiName)) + ' · ' + esc(L(x.nakshatraName)) + ' ' + num(x.pada) : '—';
function viewMatch() {
  if (!P2OK()) return p2Missing();
  const MD = JC && JC.matchDisclaimer;
  const disc = '<div class="banner info gentle noprint">💜 ' + (MD ? esc(L(MD.short)) : '') + (MD && MD.full ? ' <details class="inl"><summary>' + tr('readMore') + '</summary><p>' + esc(L(MD.full)) + '</p>' + (MD.inclusive ? '<p class="sub">' + esc(L(MD.inclusive)) + '</p>' : '') + '</details>' : '') + '</div>';
  if (PROFILES.length < 2) return disc + '<div class="card hero"><div class="big">💞</div><h2>' + tr('matchTitle') + '</h2><p>' + tr('needTwo') + '</p><div class="row" style="justify-content:center"><button type="button" class="btn primary" data-p2="quickAdd" data-slot="b">➕ ' + tr('addPerson') + '</button><button type="button" class="btn" data-act="sample">✨ ' + tr('trySample') + '</button></div></div>';
  matchPair();
  const opt = sel => PROFILES.map(p => '<option value="' + p.id + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.name) + (p.gender ? ' ' + sex(p.gender) : '') + (p.time ? '' : ' ⏰?') + '</option>').join('');
  let h = disc + '<div class="card noprint" id="mPickCard"><h2>💞 ' + term('kundli_milan', tr('matchTitle')) + '</h2><div class="mpick">' +
    '<div class="field"><label for="mA">' + tr('personA') + '</label><select id="mA">' + opt(MT.a) + '</select><button type="button" class="btn xs" data-p2="quickAdd" data-slot="a">➕ ' + tr('quickAdd') + '</button></div>' +
    '<button type="button" class="btn icon mswap" data-p2="mswap" aria-label="' + tr('swap') + '" title="' + tr('swap') + '">⇄</button>' +
    '<div class="field"><label for="mB">' + tr('personB') + '</label><select id="mB">' + opt(MT.b) + '</select><button type="button" class="btn xs" data-p2="quickAdd" data-slot="b">➕ ' + tr('quickAdd') + '</button></div></div>' +
    '<div class="row"><span class="lbl">' + tr('system') + '</span><div class="seg scroll" id="mSys" role="group" aria-label="' + tr('system') + '">' + [['north', tr('sysNorth')], ['south', tr('sysSouth')], ['both', tr('sysBoth')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (MT.sys === v ? 'on' : '') + '" aria-pressed="' + (MT.sys === v) + '">' + l + '</button>').join('') + '</div></div></div>';
  const R = computeMatch();
  if (!R) return h + '<div class="card"><p class="sub">' + tr('samePerson') + '</p></div>';
  if (R.e || !R.m) return h + '<div class="card"><div class="banner err"><b>' + tr('chartErr') + '</b><br>' + esc(R.e ? R.e.message : '') + '</div></div>';
  const m = R.m, N = m.north, So = m.south, MX = (JC && JC.matchExtras) || {};
  const boyP = m.swapped ? R.B : R.A, girlP = m.swapped ? R.A : R.B;
  h += '<div class="print-only mrhead"><h1>💞 ' + tr('matchReport') + '</h1><p><b>' + esc(m.boy.name) + '</b> & <b>' + esc(m.girl.name) + '</b> · ' + tr('preparedOn') + ' ' + fmtDate(todayStr()) + ' · ' + tr('appName') + '</p></div>';
  const who = (x, p, role) => '<div class="mwho"><div class="avatar" aria-hidden="true">' + initial(p) + '</div><div><b>' + sex(x.gender) + ' ' + esc(x.name) + '</b><span class="sub">' + (m.genderNote ? '' : tr(role) + ' · ') + moonLine(x) + '</span><span class="sub">' + (p ? personLine(p) : '') + '</span></div></div>';
  h += '<div class="card mreport"><div class="mpair">' + who(m.boy, boyP, 'boy') + '<div class="mheart" aria-hidden="true">💞</div>' + who(m.girl, girlP, 'girl') + '</div>';
  if (m.genderNote) h += '<div class="banner info">' + esc(L(m.genderNote)) + (MD && MD.inclusive ? '<br><span class="sub">' + esc(L(MD.inclusive)) + '</span>' : '') + '</div>';
  h += '<div class="gauges">';
  if (N) {
    const b = bandOf(N.verdict), ba = bandOf(N.adjustedVerdict);
    h += '<div class="gbox">' + gaugeSvg('gN', N.total, N.max || 36, tr('ashtakoota'), tr('gunas')) + '<b class="gtitle">' + term('guna_milan', tr('ashtakoota')) + '</b><span class="pill ' + ({ excellent: 'green', good: 'green', average: 'gold', low: 'red' }[N.verdict] || '') + '">' + esc(b ? L(b.label) : L(N.verdictText)) + '</span>' +
      (N.adjustedScore !== N.total ? '<span class="sub">' + term('adjusted_score', tr('adjusted')) + ': <b>' + num(N.adjustedScore) + '</b> / ' + num(N.max || 36) + (ba ? ' · ' + esc(L(ba.label)) : '') + '</span>' : '') + (b ? '<p class="sub">' + esc(L(b.text)) + '</p>' : '') + '</div>';
  }
  if (So) {
    const sv = JC && JC.matchVerdicts && JC.matchVerdicts[So.verdict];
    h += '<div class="gbox">' + gaugeSvg('gS', So.score, So.max || 10, tr('porutham'), '') + '<b class="gtitle">' + term('dashakoota', tr('porutham')) + '</b><span class="pill ' + (So.criticalFail ? 'red' : So.verdict === 'porutham_good' ? 'green' : 'gold') + '">' + esc(sv ? L(sv.label) : So.verdict) + '</span><span class="sub">✓ ' + num(So.okCount) + ' · ~ ' + num(So.mediumCount) + ' · ✗ ' + num(10 - So.okCount - So.mediumCount) + '</span>' + (sv ? '<p class="sub">' + esc(L(sv.text)) + '</p>' : '') + '</div>';
  }
  h += '</div>' + (N && N.verdictNote ? '<p class="sub" style="text-align:center">' + esc(L(N.verdictNote)) + '</p>' : '');
  if (m.ambiguity) {
    const A2 = m.ambiguity, side = (lst, nm) => lst && lst.length ? '<p><b>' + esc(nm) + ':</b> ' + lst.map(x => '<span class="pill gold">' + esc(L(x.nakshatraName)) + ' ' + num(x.pada) + ' · ' + esc(L(x.rashiName)) + '</span>').join(' ') + '</p>' : '';
    h += '<div class="banner warn">⏰ <b>' + esc(MX.nak_ambiguous ? L(MX.nak_ambiguous.title) : tr('possibleNak')) + '</b><br>' + esc(L(A2.text)) + side(A2.boy, m.boy.name) + side(A2.girl, m.girl.name) +
      (A2.combinations && A2.combinations.length ? '<h4>' + tr('combos') + '</h4><div class="tablewrap"><table><thead><tr><th>' + sex(m.boy.gender) + ' ' + esc(m.boy.name) + '</th><th>' + sex(m.girl.gender) + ' ' + esc(m.girl.name) + '</th><th class="num">' + tr('ashtakoota').split(' (')[0] + '</th><th class="num">' + tr('sysSouth').split(' · ').pop() + '</th></tr></thead><tbody>' +
        A2.combinations.map(c => '<tr><td>' + nkn(c.boyNakshatra) + ' · ' + sab(c.boySign) + '</td><td>' + nkn(c.girlNakshatra) + ' · ' + sab(c.girlSign) + '</td><td class="num"><b>' + num(c.total) + '</b>/' + num(36) + '</td><td class="num">' + (c.south != null ? num(c.south) + '/' + num(10) : '—') + '</td></tr>').join('') + '</tbody></table></div>' : '') +
      (MX.nak_ambiguous ? '<p class="sub">' + esc(L(MX.nak_ambiguous.text)) + '</p>' : '') + '</div>';
  }
  h += '</div>';
  if (N) {
    h += '<div class="card mreport"><h2>🔢 ' + tr('ashtakoota') + ' <small>' + num(N.total) + ' / ' + num(N.max || 36) + '</small></h2><p class="sub noprint">' + tr('tapExplain') + '</p><div class="kgrid">' + N.kootas.map(k => {
      const f = k.max ? k.got / k.max : 0, adj = k.adjusted != null && k.adjusted !== k.got;
      return '<button type="button" class="kcard' + (k.dosha ? ' dosha' : '') + '" data-koota="' + k.id + '" aria-label="' + esc(kootaName(k.id) + ': ' + k.got + ' / ' + k.max) + '"><span class="kh"><b>' + esc(kootaName(k.id)) + '</b><span class="kpts">' + num(k.got) + '<small>/' + num(k.max) + '</small></span></span>' +
        '<span class="kbar"><i style="width:' + (f * 100).toFixed(0) + '%;background:' + (f >= 0.75 ? 'var(--green)' : f >= 0.4 ? 'var(--gold)' : 'var(--red)') + '"></i></span>' +
        '<span class="kvals"><span>' + sex(m.boy.gender) + ' ' + esc(kootaVal(k.id, k.aVal)) + '</span><span>' + sex(m.girl.gender) + ' ' + esc(kootaVal(k.id, k.bVal)) + '</span></span>' +
        (k.dosha || adj ? '<span class="chips" style="margin:2px 0 0">' + (k.dosha ? '<span class="pill red">' + tr('dosha') + '</span>' : '') + (adj ? '<span class="pill green">' + tr('adjusted') + ' ' + num(k.adjusted) + '</span>' : '') + '</span>' : '') + '</button>';
    }).join('') + '</div>' +
      '<div class="print-only">' + N.kootas.map(k => '<p><b>' + esc(kootaName(k.id)) + ' ' + num(k.got) + '/' + num(k.max) + ':</b> ' + esc(L(k.explanation)) + '</p>').join('') + '</div></div>';
    const rel = (N.parihara || []).filter(p => p.relevant), oth = (N.parihara || []).filter(p => !p.relevant);
    const pRow = p => { const jp = JC && JC.matchParihara && JC.matchParihara[p.id]; return '<details class="x ' + (p.applies ? 'present' : 'absent') + '"><summary>' + (p.applies ? '✅' : '✗') + ' ' + esc(jp ? L(jp.name) : p.id) + ' <span class="pill ' + (p.applies ? 'green' : '') + '">' + (p.applies ? tr('appliesY') : tr('appliesN')) + '</span>' + (p.weight === 'full' || p.weight === 'partial' ? '<span class="pill">' + (p.weight === 'full' ? tr('weightFull') : tr('weightPartial')) + '</span>' : '') + '</summary><div class="body"><p>' + esc(L(p.reason)) + '</p>' + (jp ? '<p class="sub">' + esc(L(jp.rule)) + '</p><p class="sub">' + esc(L(jp.why)) + '</p>' : '') + '</div></details>'; };
    h += '<div class="card mreport"><h2>🛡️ ' + term('parihara', tr('pariharas')) + '</h2>' + (JC && JC.matchVerdicts && JC.matchVerdicts.adjusted ? '<p class="sub">' + esc(L(JC.matchVerdicts.adjusted)) + '</p>' : '') +
      '<h3>' + tr('relevantH') + ' <small>' + num(rel.length) + '</small></h3>' + (rel.length ? rel.map(pRow).join('') : '<p class="sub">' + tr('noneP') + '</p>') +
      (oth.length ? '<details class="x noprint"><summary>📋 ' + tr('otherRules') + ' <span class="pill">' + num(oth.length) + '</span></summary><div class="body">' + oth.map(pRow).join('') + '</div></details>' : '') + '</div>';
  }
  if (So) {
    h += '<div class="card mreport"><h2>🌺 ' + tr('porutham') + ' <small>' + num(So.score) + ' / ' + num(So.max || 10) + '</small></h2>' + (JC && JC.matchVerdicts && JC.matchVerdicts.south ? '<p class="sub">' + esc(L(JC.matchVerdicts.south)) + '</p>' : '') + '<div class="pgrid">' + So.poruthams.map(p => {
      const st = p.ok === true ? 'ok' : p.ok === false ? 'no' : 'mid', stT = st === 'ok' ? tr('agrees') : st === 'no' ? tr('notAgree') : tr('partly');
      return '<button type="button" class="ptile ' + st + (p.critical ? ' crit' : '') + '" data-por="' + p.id + '" aria-label="' + esc(porName(p.id) + ': ' + stT + (p.critical ? ', ' + tr('critical') : '')) + '"><span class="pi" aria-hidden="true">' + (st === 'ok' ? '✓' : st === 'no' ? '✗' : '~') + '</span><b>' + esc(porName(p.id)) + '</b><small>' + stT + '</small>' + (p.critical ? '<small class="crit">⚠ ' + tr('critical') + '</small>' : '') + '</button>';
    }).join('') + '</div>' + (So.criticalFail ? '<div class="banner warn">⚠️ ' + term('rajju_dosha', porName('rajju')) + ' / ' + term('vedha_dosha', porName('vedha')) + ': ' + tr('notAgree') + '. ' + esc(JC && JC.poruthams && JC.poruthams.rajju ? L(JC.poruthams.rajju.balanced) : '') + '</div>' : '') +
      '<div class="print-only">' + So.poruthams.map(p => '<p><b>' + esc(porName(p.id)) + ' ' + (p.ok === true ? '✓' : p.ok === false ? '✗' : '~') + ':</b> ' + esc(L(p.explanation)) + '</p>').join('') + '</div></div>';
  }
  const MG = m.manglik, JDm = JC && JC.doshas && JC.doshas.manglik;
  const lvl = x => JDm && JDm.levels && JDm.levels[x.level] ? L(JDm.levels[x.level]).split(':')[0] : x.level;
  const yn = b => b ? '<span class="bad">✓</span>' : '<span class="ok">✗</span>';
  if (MG && MG.boy && MG.girl) h += '<div class="card mreport"><h2>🔴 ' + term('manglik', tr('manglikCmp')) + '</h2><div class="tablewrap"><table><thead><tr><th></th><th>' + sex(m.boy.gender) + ' ' + esc(m.boy.name) + '</th><th>' + sex(m.girl.gender) + ' ' + esc(m.girl.name) + '</th></tr></thead><tbody>' +
    '<tr><td>' + tr('level') + '</td><td><b>' + esc(lvl(MG.boy)) + '</b></td><td><b>' + esc(lvl(MG.girl)) + '</b></td></tr>' +
    ['fromLagna', 'fromMoon', 'fromVenus'].map(k => '<tr><td>' + tr(k) + '</td><td>' + yn(MG.boy[k]) + '</td><td>' + yn(MG.girl[k]) + '</td></tr>').join('') +
    '<tr><td>' + tr('cancelledInChart') + '</td><td>' + (MG.boy.cancelledInChart ? '✅' : '—') + '</td><td>' + (MG.girl.cancelledInChart ? '✅' : '—') + '</td></tr></tbody></table></div><p>' + esc(L(MG.text)) + '</p>' + (MX.manglik_compare ? '<p class="sub">' + esc(L(MX.manglik_compare.text)) + '</p>' : '') + '</div>';
  const E = m.extras || {};
  let ex = '';
  if (E.moon_relation) ex += '<div class="dsec"><h4>🌙 ' + esc(MX.moon_relation ? L(MX.moon_relation.title) : 'Moon') + '</h4><p><b>' + esc(L(E.moon_relation.name)) + '</b> · ' + sex(m.girl.gender) + '→' + sex(m.boy.gender) + ' ' + num(E.moon_relation.boyFromGirl) + ' · ' + sex(m.boy.gender) + '→' + sex(m.girl.gender) + ' ' + num(E.moon_relation.girlFromBoy) + '</p>' + (MX.moon_relation ? '<p class="sub">' + esc(L(MX.moon_relation.text)) + '</p>' : '') + '</div>';
  if (E.seventh_house) { const s7 = (x, nm, g) => x ? '<tr><td>' + sex(g) + ' ' + esc(nm) + '</td><td>' + esc(L(x.signName)) + '</td><td>' + pn(x.lord) + ' → ' + tr('house') + ' ' + num(x.lordHouse) + ' (' + digName(x.lordDignity) + ')</td><td>' + (x.occupants && x.occupants.length ? x.occupants.map(pn).join(', ') : '—') + (x.reliable === false ? ' <span class="pill gold">⏰ ≈</span>' : '') + '</td></tr>' : ''; ex += '<div class="dsec"><h4>🏠 ' + esc(MX.seventh_house ? L(MX.seventh_house.title) : '7th') + '</h4><div class="tablewrap"><table><thead><tr><th></th><th>' + tr('sign') + '</th><th>' + tr('lord') + '</th><th>' + tr('occupants') + '</th></tr></thead><tbody>' + s7(E.seventh_house.boy, m.boy.name, m.boy.gender) + s7(E.seventh_house.girl, m.girl.name, m.girl.gender) + '</tbody></table></div>' + (MX.seventh_house ? '<p class="sub">' + esc(L(MX.seventh_house.text)) + '</p>' : '') + '</div>'; }
  if (E.venus_jupiter) { const vj = (x, nm, g) => x ? '<tr><td>' + sex(g) + ' ' + esc(nm) + '</td>' + ['Ve', 'Ju'].map(id => { const q = x[id]; return '<td>' + (q ? esc(L(q.signName)) + ' · ' + tr('house') + ' ' + num(q.house) + ' · ' + digName(q.dignity) + (q.combust ? ' · ' + tr('combust') : '') + (q.retro ? ' ℞' : '') : '—') + '</td>'; }).join('') + '</tr>' : ''; ex += '<div class="dsec"><h4>💫 ' + esc(MX.venus_jupiter ? L(MX.venus_jupiter.title) : 'Venus & Jupiter') + '</h4><div class="tablewrap"><table><thead><tr><th></th><th>' + pn('Ve') + '</th><th>' + pn('Ju') + '</th></tr></thead><tbody>' + vj(E.venus_jupiter.boy, m.boy.name, m.boy.gender) + vj(E.venus_jupiter.girl, m.girl.name, m.girl.gender) + '</tbody></table></div>' + (MX.venus_jupiter ? '<p class="sub">' + esc(L(MX.venus_jupiter.text)) + '</p>' : '') + '</div>'; }
  if (E.dasha_now) { const dn = (x, nm, g) => x ? '<p>' + sex(g) + ' <b>' + esc(nm) + ':</b> ' + pn(x.md) + ' › ' + pn(x.ad) + ' <span class="sub">(' + tr('mahadasha') + ' ' + (hi() ? fmtDate(x.mdEndISO) + ' ' + tr('till') : tr('till') + ' ' + fmtDate(x.mdEndISO)) + ')</span></p>' : ''; ex += '<div class="dsec"><h4>⏳ ' + tr('dashaNow') + '</h4>' + dn(E.dasha_now.boy, m.boy.name, m.boy.gender) + dn(E.dasha_now.girl, m.girl.name, m.girl.gender) + '</div>'; }
  if (E.dasha_sandhi) ex += '<div class="banner ' + (E.dasha_sandhi.warning ? 'warn' : 'info') + '">⏳ <b>' + term('dasha_sandhi', MX.dasha_sandhi ? L(MX.dasha_sandhi.title) : tr('dashaNow')) + ':</b> ' + esc(L(E.dasha_sandhi.text)) + (E.dasha_sandhi.warning && MX.dasha_sandhi ? '<br><span class="sub">' + esc(L(MX.dasha_sandhi.text)) + '</span>' : '') + '</div>';
  if (ex) h += '<div class="card mreport"><h2>📋 ' + tr('extrasT') + '</h2>' + ex + '</div>';
  h += '<div class="card noprint"><div class="row"><button type="button" class="btn primary" data-p2="mprint">🖨️ ' + tr('printReport') + '</button><button type="button" class="btn" data-p2="mshare">📋 ' + tr('shareSummary') + '</button></div></div>';
  h += '<section class="card print-only"><p class="sub">' + (MD ? esc(L(MD.full)) : '') + '</p>' + (MD && MD.inclusive ? '<p class="sub">' + esc(L(MD.inclusive)) + '</p>' : '') + '<p class="sub">Made by Nivriti Rajput 💜</p></section>';
  AFTER.push(animateGauges);
  return h;
}
function matchShareText(m) {
  const N = m.north, So = m.south, out = [];
  out.push('💞 ' + tr('matchTitle') + ': ' + m.boy.name + ' & ' + m.girl.name);
  out.push(sex(m.boy.gender) + ' ' + m.boy.name + ': ' + L(m.boy.rashiName) + ', ' + L(m.boy.nakshatraName) + ' ' + m.boy.pada);
  out.push(sex(m.girl.gender) + ' ' + m.girl.name + ': ' + L(m.girl.rashiName) + ', ' + L(m.girl.nakshatraName) + ' ' + m.girl.pada);
  if (N) { const b = bandOf(N.verdict); out.push(tr('ashtakoota') + ': ' + N.total + '/' + (N.max || 36) + (N.adjustedScore !== N.total ? ' (' + tr('adjusted') + ' ' + N.adjustedScore + ')' : '') + ' — ' + (b ? L(b.label) : '')); out.push(N.kootas.map(k => kootaName(k.id) + ' ' + k.got + '/' + k.max).join(' · ')); }
  if (So) { const sv = JC && JC.matchVerdicts && JC.matchVerdicts[So.verdict]; out.push(tr('porutham') + ': ' + So.score + '/' + (So.max || 10) + ' — ' + (sv ? L(sv.label) : '')); out.push(So.poruthams.map(p => porName(p.id) + ' ' + (p.ok === true ? '✓' : p.ok === false ? '✗' : '~')).join(' · ')); }
  if (m.manglik && m.manglik.text) out.push(tr('manglikCmp') + ': ' + L(m.manglik.text));
  if (m.ambiguity) out.push('⏰ ' + L(m.ambiguity.text));
  out.push(''); out.push(JC && JC.matchDisclaimer ? L(JC.matchDisclaimer.short) : '');
  out.push('— ' + tr('appName') + ' · Made by Nivriti Rajput 💜');
  return out.join('\n');
}
function detailKoota(m, id) {
  const k = m.north && m.north.kootas.find(x => x.id === id), jk = JC && JC.kootas && JC.kootas[id]; if (!k) return '';
  const rel = (m.north.parihara || []).filter(p => p.koota === id);
  return '<div class="facts" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="fact"><span class="lbl">' + tr('scoreL') + '</span><b>' + num(k.got) + ' / ' + num(k.max) + '</b>' + (k.adjusted != null && k.adjusted !== k.got ? '<span>' + tr('adjusted') + ' ' + num(k.adjusted) + '</span>' : '') + '</div><div class="fact"><span class="lbl">' + sex(m.boy.gender) + ' ' + esc(m.boy.name) + '</span><b>' + esc(kootaVal(id, k.aVal)) + '</b></div><div class="fact"><span class="lbl">' + sex(m.girl.gender) + ' ' + esc(m.girl.name) + '</span><b>' + esc(kootaVal(id, k.bVal)) + '</b></div></div>' +
    (k.dosha ? '<p><span class="pill red">' + tr('dosha') + '</span></p>' : '') + '<div class="dsec reading"><h4>🔎 ' + tr('whyHere') + '</h4><p>' + esc(L(k.explanation)) + '</p></div>' +
    (jk ? ['measures', 'scoring', 'lowScore', 'balanced'].filter(x => jk[x]).map(x => '<div class="dsec"><h4>' + ({ measures: '❓ ' + tr('measures'), scoring: '🧮 ' + tr('scoring'), lowScore: '📜 ' + tr('lowScore'), balanced: '⚖️ ' + tr('balanced') })[x] + '</h4><p class="reading">' + esc(L(jk[x])) + '</p></div>').join('') : '') +
    (rel.length ? '<div class="dsec"><h4>🛡️ ' + tr('pariharas') + '</h4>' + rel.map(p => { const jp = JC && JC.matchParihara && JC.matchParihara[p.id]; return '<p>' + (p.applies ? '✅' : '✗') + ' ' + esc(jp ? L(jp.name) : p.id) + '</p>'; }).join('') + '</div>' : '');
}
function detailPorutham(m, id) {
  const p = m.south && m.south.poruthams.find(x => x.id === id), jp = JC && JC.poruthams && JC.poruthams[id]; if (!p) return '';
  const st = p.ok === true ? tr('agrees') : p.ok === false ? tr('notAgree') : tr('partly');
  let h = '<p><span class="pill ' + (p.ok === true ? 'green' : p.ok === false ? 'red' : 'gold') + '">' + (p.ok === true ? '✓' : p.ok === false ? '✗' : '~') + ' ' + st + '</span>' + (p.critical ? ' <span class="pill red">⚠ ' + tr('critical') + '</span>' : '') + (p.count != null ? ' <span class="pill">#' + num(p.count) + '</span>' : '') + (p.aVal ? ' <span class="pill">' + sex(m.boy.gender) + ' ' + esc(kootaVal('rajju', p.aVal)) + ' · ' + sex(m.girl.gender) + ' ' + esc(kootaVal('rajju', p.bVal)) + '</span>' : '') + '</p>';
  h += '<div class="dsec reading"><h4>🔎 ' + tr('whyHere') + '</h4><p>' + esc(L(p.explanation)) + '</p></div>';
  if (jp) h += ['measures', 'rule', 'lowScore', 'balanced'].filter(x => jp[x]).map(x => '<div class="dsec"><h4>' + ({ measures: '❓ ' + tr('measures'), rule: '📏 ' + tr('rule'), lowScore: '📜 ' + tr('lowScore'), balanced: '⚖️ ' + tr('balanced') })[x] + '</h4><p class="reading">' + esc(L(jp[x])) + '</p></div>').join('');
  if (jp && jp.groups && typeof jp.groups === 'object') {
    const G3 = jp.groups, rows = Array.isArray(G3) ? G3.map(g => (g && typeof g === 'object' && !('en' in g)) ? '<p><b>' + esc(L(g.name)) + '</b>' + (g.stars ? ': ' + esc(Array.isArray(g.stars) ? g.stars.map(n => typeof n === 'number' ? nkn(n - 1) : L(n)).join(', ') : L(g.stars)) : '') + '</p>' : '<p>' + esc(L(g)) + '</p>') : ('en' in G3 ? ['<p>' + esc(L(G3)) + '</p>'] : Object.keys(G3).map(k => '<p><b>' + esc(k) + ':</b> ' + esc(L(G3[k])) + '</p>'));
    h += '<details class="x"><summary>' + tr('groups') + '</summary><div class="body">' + rows.join('') + '</div></details>';
  }
  return h;
}

/* ---------------------------------------------------------------------
   21d. 👨‍👩‍👧 Family dashboard
   --------------------------------------------------------------------- */
const FAM = { g: null, date: null, key: '', res: null };
const famPeople = () => PROFILES.filter(p => !FAM.g || (p.group || '') === FAM.g);
const famKey = list => JSON.stringify([list.map(p => [p.id, p.date, p.time, p.place.lat, p.place.lon, p.tzMode, p.name, p.gender]), FAM.date, S.ayan, S.node, S.houses, S.eng, S.lang]);
function famCompute(list) {
  const k = famKey(list); if (FAM.key === k) return FAM.res;
  const charts = [], ok = [];
  for (const p of list) { const C = chartOf(p); if (C) { charts.push(C); ok.push(p); } }
  let F = null, err = null;
  try { F = charts.length ? JE.family(charts, FAM.date) : null; } catch (e) { err = e; console.error(e); }
  FAM.key = k; FAM.res = { F, people: ok, charts, err }; return FAM.res;
}
const goodCls = g => g === true ? 'good' : g === false ? 'bad' : 'mixed';
const goodMark = g => g === true ? '✓' : g === false ? '✗' : '~';
function viewFamily() {
  if (!P2OK()) return p2Missing();
  if (!FAM.date) FAM.date = todayStr();
  const FH = JC && JC.familyHelp;
  const groups = [...new Set(PROFILES.map(p => (p.group || '').trim()).filter(Boolean))];
  if (FAM.g && !groups.includes(FAM.g)) FAM.g = null;
  let h = '<div class="card"><div class="row between"><h2>👨‍👩‍👧 ' + tr('familyTitle') + ' <small>' + num(famPeople().length) + '</small></h2><button type="button" class="btn sm" data-act="addP">➕ ' + tr('addPerson') + '</button></div>' + (FH ? '<p class="sub">' + esc(L(FH.intro)) + '</p>' : '') +
    (groups.length ? '<div class="chips" role="group" aria-label="' + tr('group') + '"><button type="button" class="chip' + (!FAM.g ? ' on' : '') + '" data-fg="" aria-pressed="' + !FAM.g + '">' + tr('all') + ' · ' + num(PROFILES.length) + '</button>' + groups.map(g => '<button type="button" class="chip' + (FAM.g === g ? ' on' : '') + '" data-fg="' + esc(g) + '" aria-pressed="' + (FAM.g === g) + '">👪 ' + esc(g) + ' · ' + num(PROFILES.filter(p => p.group === g).length) + '</button>').join('') + '</div>' : '') +
    '<div class="row" style="margin-top:6px"><label class="lbl" for="famDate">' + tr('dateL') + '</label><input type="date" id="famDate" value="' + FAM.date + '" min="1900-01-01" max="2100-12-31" style="width:auto"><button type="button" class="btn sm" data-fstep="-1" aria-label="' + tr('prevL') + '">‹</button><button type="button" class="btn sm" data-fstep="0">' + tr('today') + '</button><button type="button" class="btn sm" data-fstep="1" aria-label="' + tr('nextL') + '">›</button></div></div>';
  const list = famPeople();
  if (!list.length) return h + '<div class="card hero"><div class="big">👨‍👩‍👧</div><p>' + tr('needOne') + '</p><div class="row" style="justify-content:center"><button type="button" class="btn primary" data-act="addP">➕ ' + tr('addPerson') + '</button><button type="button" class="btn" data-act="sample">✨ ' + tr('trySample') + '</button></div></div>';
  if (FAM.key !== famKey(list)) {
    AFTER.push(() => setTimeout(() => { if (S.view !== 'people' || S.sub.people !== 'family') return; famCompute(famPeople()); rerenderAt(); }, 30));
    return h + '<div class="card" role="status"><p class="sub">⏳ ' + tr('loading') + '</p><div class="skel"></div><div class="skel"></div></div>';
  }
  const R = FAM.res, F = R.F;
  if (R.err || !F) return h + '<div class="card"><div class="banner err">' + tr('chartErr') + (R.err ? ': ' + esc(R.err.message) : '') + '</div></div>';
  const tm = F.transitMoon, TOD = FH && FH.today;
  h += '<div class="card" id="famToday"><h2>☀️ ' + tr('todayFamily') + ' <small>' + dayLabel(FAM.date) + '</small></h2><p class="sub">🌙 ' + tr('moonToday') + ': <b>' + sgn(tm.sign) + '</b> · ' + nkn(tm.nakshatra) + ' · ' + (tm.shukla ? (hi() ? 'शुक्ल पक्ष' : 'Shukla paksha') : (hi() ? 'कृष्ण पक्ष' : 'Krishna paksha')) + '</p><div class="today">' +
    F.people.map((q, i) => {
      const tb = q.tarabala, cb = q.chandrabala, sc = (tb.good === true ? 1 : tb.good === false ? 0 : 0.5) + (cb.good === true ? 1 : cb.good === false ? 0 : 0.5), mood = sc >= 1.5 ? 'good' : sc >= 1 ? 'mixed' : 'gentle';
      return '<div class="trow ' + mood + '"><div class="avatar sm" aria-hidden="true">' + initial(R.people[i]) + '</div><div class="tinfo"><b>' + esc(q.name) + '</b><div class="chips"><button type="button" class="chip cbt ' + goodCls(cb.good) + '" data-fh="cb:' + i + '">🌙 ' + tr('chandrabala') + ': ' + ord(cb.house) + ' ' + goodMark(cb.good) + '</button><button type="button" class="chip cbt ' + goodCls(tb.good) + '" data-fh="tb:' + i + '">⭐ ' + tr('tarabala') + ': ' + esc(firstWord(tb.name)) + ' ' + goodMark(tb.good) + '</button></div>' +
        (TOD && TOD[mood] ? '<span class="sub">' + esc(L(TOD[mood]).replace('{name}', q.name)) + '</span>' : '') + '</div></div>';
    }).join('') + '</div></div>';
  const JS = JC && JC.doshas && JC.doshas.sadeSati, phN = ph => ph === 'end' ? (hi() ? 'समाप्ति' : 'ends') : JS && JS.phases && JS.phases[ph] ? firstWord(JS.phases[ph].name) : ph;
  h += '<div class="fgrid">' + F.people.map((q, i) => {
    const p = R.people[i], jd = F.jd, LV = hi() ? ['महा', 'अंतर', 'प्रत्यं'] : ['MD', 'AD', 'PD'], LVN = ['mahadasha', 'antardasha', 'pratyantar'];
    const bars = q.dasha.map((d, k) => { const f = clamp((jd - d.start) / (d.end - d.start), 0, 1); return '<div class="dbar" title="' + esc(tr(LVN[k]) + ': ' + pn(d.lord) + ' · ' + fmtDate(d.startISO) + ' – ' + fmtDate(d.endISO)) + '"><span class="lv">' + LV[k] + '</span><span class="tr" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(f * 100) + '" aria-label="' + esc(tr(LVN[k]) + ' ' + pn(d.lord)) + '"><span class="fl" style="width:' + (f * 100).toFixed(1) + '%;background:' + pcol(d.lord) + '"></span></span><span class="nm"><b style="color:' + pcol(d.lord) + '">' + esc(pn(d.lord)) + '</b> <span class="sub">' + (hi() ? fmtDate(d.endISO) + ' ' + tr('till') : tr('till') + ' ' + fmtDate(d.endISO)) + '</span></span></div>'; }).join('');
    const ss = q.sadeSati || {};
    const ssH = '<div class="ssstat' + (ss.active ? ' on' : '') + '">🪐 ' + (ss.active && ss.current ? '<b>' + esc(phN(ss.current.phase)) + '</b> <span class="sub">' + fmtDate(ss.current.startISO) + ' – ' + fmtDate(ss.current.endISO) + '</span>' : '<b>' + tr('noSSnow') + '</b>') +
      (ss.nextChange ? '<div class="sub">' + tr('nextChange') + ': ' + esc(phN(ss.nextChange.to)) + ' · ' + fmtDate(ss.nextChange.iso) + ' · ⏳ <b class="cd">' + fmtLeft(ss.nextChange.daysLeft) + '</b></div>' : '') + '</div>';
    const ing = (q.ingresses || []).slice(0, 3).map(e => '<li>' + fmtDate(e.iso) + ' · <b style="color:' + pcol(e.body) + '">' + esc(pn(e.body)) + '</b> → ' + sgn(e.to) + ' <span class="sub">(' + ord(e.houseFromMoon) + ' ' + tr('fromMoonS') + ')</span></li>').join('');
    return '<div class="card fcard"><div class="row"><div class="avatar" aria-hidden="true">' + initial(p) + '</div><div style="flex:1;min-width:0"><b class="fname">' + esc(q.name) + '</b><div class="sub">🌙 ' + sgn(q.moonSign) + ' · ' + nkn(q.moonNakshatra) + (p.time ? '' : ' · ⏰ ' + tr('timeUnknown')) + '</div></div></div>' +
      '<div class="dbars">' + bars + '</div>' + ssH + (ing ? '<div class="dsec"><h4>📅 ' + tr('comingUp') + '</h4><ul class="ing">' + ing + '</ul></div>' : '') +
      '<div class="row" style="margin-top:8px"><button type="button" class="btn sm primary" data-act="openP" data-id="' + p.id + '">🪐 ' + tr('openKundli') + '</button>' + (F.people.length > 1 ? '<button type="button" class="btn sm" data-fmatch="' + p.id + '">💞 ' + tr('match') + '</button>' : '') + '</div></div>';
  }).join('') + '</div>';
  if (F.people.length >= 2) {
    const cell = {};
    for (const x of F.matrix) cell[x.a + ':' + x.b] = cell[x.b + ':' + x.a] = x;
    h += '<div class="card"><h2>🧩 ' + term('heat_map', tr('heatmap')) + '</h2><p class="sub">' + tr('tapOpenMatch') + '</p><div class="tablewrap"><table class="heat fheat"><thead><tr><th></th>' + F.people.map((q, i) => '<th title="' + esc(q.name) + '"><span class="avatar sm" aria-hidden="true">' + initial(R.people[i]) + '</span><span class="vh">' + esc(q.name) + '</span></th>').join('') + '</tr></thead><tbody>' +
      F.people.map((q, i) => '<tr><td class="rh">' + esc(q.name) + '</td>' + F.people.map((r, j) => { if (i === j) return '<td><span class="hself" aria-hidden="true">—</span></td>'; const x = cell[i + ':' + j]; if (!x) return '<td></td>'; return '<td><button type="button" data-fm="' + R.people[i].id + ':' + R.people[j].id + '" style="background:' + matchColor(x.total) + '" aria-label="' + esc(q.name + ' & ' + r.name + ': ' + x.total + ' / 36') + '" title="' + esc(q.name + ' & ' + r.name) + '">' + num(x.total) + (x.nadiDosha || x.bhakootDosha ? '<sup>•</sup>' : '') + '</button></td>'; }).join('') + '</tr>').join('') + '</tbody></table></div>' +
      '<div class="legend"><span><span class="sw" style="background:' + matchColor(12) + '"></span>&lt;18</span><span><span class="sw" style="background:' + matchColor(21) + '"></span>18–23</span><span><span class="sw" style="background:' + matchColor(26) + '"></span>24–27</span><span><span class="sw" style="background:' + matchColor(32) + '"></span>28+</span><span>• ' + term('nadi_dosha', hi() ? 'नाड़ी/भकूट दोष' : 'Nadi / Bhakoot dosha') + '</span></div>' + (FH && FH.matrixNote ? '<p class="sub">' + esc(L(FH.matrixNote)) + '</p>' : '') + '</div>';
  }
  if (FH) h += '<div class="card"><h2>📖 ' + esc(FH.dashboard ? L(FH.dashboard.title) : tr('howRead')) + '</h2>' + (FH.dashboard && FH.dashboard.points ? '<ul class="pts">' + FH.dashboard.points.map(x => '<li>' + esc(L(x)) + '</li>').join('') + '</ul>' : '') +
    [['chandrabala', '🌙'], ['tarabala', '⭐']].map(([k, ic]) => FH[k] ? '<details class="x"><summary>' + ic + ' ' + esc(L(FH[k].name)) + '</summary><div class="body reading"><p>' + esc(L(FH[k].what)) + '</p><p class="sub">' + esc(L(FH[k].rule)) + '</p>' + (FH[k].good ? '<p>✅ ' + esc(L(FH[k].good)) + '</p>' : '') + (FH[k].weak ? '<p>🌿 ' + esc(L(FH[k].weak)) + '</p>' : '') + (FH[k].taras ? '<div class="tablewrap"><table><tbody>' + FH[k].taras.map(t => '<tr><td class="num">' + num(t.n) + '</td><td><b>' + esc(L(t.name)) + '</b></td><td class="wrap">' + esc(L(t.meaning)) + '</td></tr>').join('') + '</tbody></table></div>' : '') + '</div></details>' : '').join('') +
    (FH.privacy ? '<p class="sub">🔒 ' + esc(L(FH.privacy)) + '</p>' : '') + '</div>';
  return h;
}
function famHelpDetail(kind, i) {
  const R = FAM.res, q = R && R.F && R.F.people[i], FH = JC && JC.familyHelp; if (!q) return '';
  if (kind === 'cb') { const cb = q.chandrabala, d = FH && FH.chandrabala; return '<p><b>' + esc(q.name) + ':</b> ' + ord(cb.house) + ' ' + tr('fromMoonS') + ' <span class="pill ' + (cb.good === true ? 'green' : cb.good === false ? 'red' : 'gold') + '">' + goodMark(cb.good) + '</span></p>' + (d ? '<p class="reading">' + esc(L(d.what)) + '</p><p class="sub">' + esc(L(d.rule)) + '</p><p>' + esc(L(cb.good === false ? d.weak : d.good)) + '</p>' : ''); }
  const tb = q.tarabala, d = FH && FH.tarabala, t = taraInfo(tb.tara);
  return '<p><b>' + esc(q.name) + ':</b> ' + esc(L(tb.name)) + ' (#' + num(tb.count) + ') <span class="pill ' + (tb.good === true ? 'green' : tb.good === false ? 'red' : 'gold') + '">' + goodMark(tb.good) + '</span></p>' + (t ? '<p class="reading">' + esc(L(t.meaning)) + '</p>' : '') + (d ? '<p class="sub">' + esc(L(d.what)) + '</p><p class="sub">' + esc(L(d.rule)) + '</p>' : '');
}

/* ---------------------------------------------------------------------
   21e. 📅 Muhurta finder (chunked search with progress)
   --------------------------------------------------------------------- */
const MU = { purpose: 'marriage', from: null, to: null, place: null, people: [], token: 0, busy: false, prog: 0, res: null, err: null, view: 'list', month: null, day: null, more: false, open: -1 };
const MU_ICON = { marriage: '💍', griha_pravesh: '🏠', vehicle: '🚗', business: '🏪', naming: '👶', mundan: '✂️', travel: '🧳', property: '🏡', education: '📚', general: '✨' };
const muPurposes = () => (JC && JC.muhurtaPurposes ? Object.keys(JC.muhurtaPurposes) : Object.keys(MU_ICON));
const muName = id => JC && JC.muhurtaPurposes && JC.muhurtaPurposes[id] ? firstWord(JC.muhurtaPurposes[id].name) : id.replace(/_/g, ' ');
const muIcon = id => (JC && JC.muhurtaPurposes && JC.muhurtaPurposes[id] && JC.muhurtaPurposes[id].icon) || MU_ICON[id] || '✨';
const ruleName = id => JC && JC.muhurtaRules && JC.muhurtaRules[id] ? L(JC.muhurtaRules[id].name) : String(id).replace(/_/g, ' ');
function muInit() {
  if (!MU.from) { MU.from = todayStr(); MU.to = addMonths(MU.from, 6); }
  if (!MU.place) MU.place = defaultPlace();
  MU.onPlace = () => { MU.res = null; MU.token++; MU.busy = false; };
  MU.people = MU.people.filter(id => profById(id));
}
function karanaName(k) { const K = JE.names && JE.names.karanas; if (!K || k == null) return '—'; const i = k === 0 ? 10 : k >= 57 ? 7 + (k - 57) : (k - 1) % 7; return K[i] ? L(K[i]) : '—'; }
function viewMuhurta() {
  if (!P2OK()) return p2Missing();
  muInit();
  const MI = JC && JC.muhurtaIntro, jp = JC && JC.muhurtaPurposes && JC.muhurtaPurposes[MU.purpose];
  let h = '<div class="card"><h2>📅 ' + tr('muhurtaTitle') + '</h2>' + (MI ? '<p class="sub">' + esc(L(MI.text)) + '</p><div class="banner info gentle">🌿 ' + esc(L(MI.disclaimer)) + '</div>' : '') + '</div>';
  h += '<div class="card noprint"><h3 style="margin-top:0">' + tr('purposeL') + '</h3><div class="mupur" role="group" aria-label="' + tr('purposeL') + '">' + muPurposes().map(id => '<button type="button" data-mup="' + id + '" class="' + (MU.purpose === id ? 'on' : '') + '" aria-pressed="' + (MU.purpose === id) + '"><span class="ic" aria-hidden="true">' + esc(muIcon(id)) + '</span><span>' + esc(muName(id)) + '</span></button>').join('') + '</div>' +
    (jp ? '<details class="x"><summary>' + esc(muIcon(MU.purpose)) + ' ' + esc(L(jp.name)) + '</summary><div class="body reading"><p>' + esc(L(jp.intro)) + '</p>' + (jp.points ? '<ul class="pts">' + jp.points.map(x => '<li>' + esc(L(x)) + '</li>').join('') + '</ul>' : '') + (jp.tip ? '<p class="sub">💡 ' + esc(L(jp.tip)) + '</p>' : '') + '</div></details>' : '') +
    '<div class="formgrid mform"><div class="field"><label for="muFrom">' + tr('fromD') + '</label><input type="date" id="muFrom" value="' + MU.from + '" min="1800-01-01" max="2100-12-31"></div><div class="field"><label for="muTo">' + tr('toD') + '</label><input type="date" id="muTo" value="' + MU.to + '" min="1800-01-01" max="2100-12-31"></div>' +
    '<div class="field full"><div class="chips" role="group" aria-label="' + tr('rangeL') + '">' + [[1, 'm1'], [3, 'm3'], [6, 'm6'], [12, 'y1']].map(([n, k]) => '<button type="button" class="chip" data-mur="' + n + '">' + tr(k) + '</button>').join('') + '</div><small>' + tr('rangeMax') + '</small></div>' +
    '<div class="full">' + placePicker('mu', MU, MU.from) + '</div>' +
    '<div class="field full"><span class="lbl">' + tr('peopleL') + ' · ' + tr('upTo2') + '</span><div class="chips" role="group" aria-label="' + tr('peopleL') + '">' + (PROFILES.length ? PROFILES.map(p => { const on = MU.people.includes(p.id); return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-mupp="' + p.id + '" aria-pressed="' + on + '">' + (on ? '✓ ' : '') + esc(p.name) + '</button>'; }).join('') : '<span class="sub">' + tr('noPeople') + '</span>') + '</div></div></div>' +
    '<div class="row"><button type="button" class="btn primary" data-p2="muRun" id="muRunBtn"' + (MU.busy ? ' disabled' : '') + '>🔍 ' + (MU.res ? tr('runAgain') : tr('findBtn')) + '</button><div class="prog' + (MU.busy ? '' : ' idle') + '" id="muProg" role="progressbar" aria-label="' + tr('searching') + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(MU.prog * 100) + '"><span id="muBar" style="width:' + (MU.prog * 100).toFixed(0) + '%"></span><em id="muPct">' + (MU.busy ? tr('searching') + ' ' + num(Math.round(MU.prog * 100)) + '%' : '') + '</em></div></div><div class="err" id="muErr" role="alert">' + (MU.err ? esc(MU.err) : '') + '</div></div>';
  h += '<div id="muRes">' + muResults() + '</div>';
  return h;
}
function muResults() {
  const R = MU.res; if (!R) return '';
  const W = R.windows || [], nShow = MU.more ? W.length : Math.min(W.length, 12);
  let h = '<div class="card"><div class="row between"><h2>🏆 ' + tr('results') + ' <small>' + esc(muIcon(R.purpose) + ' ' + muName(R.purpose)) + ' · ' + fmtDate(String(R.from).slice(0, 10)) + ' – ' + fmtDate(addDays(String(R.to).slice(0, 10), -1)) + ' · ' + num(W.length) + '</small></h2>' +
    '<div class="seg" id="muView" role="group" aria-label="' + tr('results') + '">' + [['list', '📋 ' + tr('listV')], ['month', '🗓️ ' + tr('monthMap')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (MU.view === v ? 'on' : '') + '" aria-pressed="' + (MU.view === v) + '">' + l + '</button>').join('') + '</div></div>' +
    '<p class="sub">📍 ' + esc(placeLabel(MU.place)) + ' · UTC' + hm(R.utcOffset) + (R.people && R.people.length ? ' · 👥 ' + R.people.map(p => esc(p.name)).join(', ') : '') + (R.computeMs != null ? ' · ' + num(R.computeMs) + ' ms' : '') + '</p>' + (R.note ? '<p class="sub">' + esc(L(R.note)) + '</p>' : '') +
    (R.warnings && R.warnings.length ? '<div class="banner warn">' + R.warnings.map(w => esc(L(w))).join('<br>') + '</div>' : '') +
    (R.eclipses && R.eclipses.length ? '<div class="banner info">🌑 ' + R.eclipses.map(e => esc(L(e.text)) + ' · ' + fmtDate(e.iso)).join(' · ') + '</div>' : '');
  if (MU.view === 'month') h += muMonth(R);
  else {
    if (!W.length) h += '<div class="banner warn">' + tr('noWindows') + '</div>';
    h += '<div class="mwins">' + W.slice(0, nShow).map((w, i) => muWin(R, w, i)).join('') + '</div>' + (W.length > nShow ? '<button type="button" class="btn sm" data-p2="muMore">⬇️ ' + tr('all') + ' ' + num(W.length) + '</button>' : '');
    if (W.length) h += '<div class="row noprint" style="margin-top:10px"><button type="button" class="btn" data-p2="muIcsTop">📅 ' + tr('icsTop') + '</button><button type="button" class="btn" data-p2="muShareTop">📋 ' + tr('share') + '</button></div>';
  }
  return h + '</div>';
}
function muWin(R, w, i) {
  const good = w.reasons.filter(r => r.kind === 'good'), bad = w.reasons.filter(r => r.kind !== 'good'), pc = w.panchang || {}, sd = w.date || String(w.startISO).slice(0, 10);
  const rr = r => {
    const jr = JC && JC.muhurtaRules && JC.muhurtaRules[r.id], nm = ruleName(r.id), tx = L(r.text), who = r.person != null && R.people && R.people[r.person] ? ' <span class="pill indigo">' + esc(R.people[r.person].name) + '</span>' : '';
    return '<li class="' + (r.kind === 'good' ? 'ok' : 'bad') + '"><span aria-hidden="true">' + (r.kind === 'good' ? '✓' : '✗') + '</span> <b>' + esc(nm) + '</b>' + who + (r.points ? ' <small class="sub">(' + (r.points > 0 ? '+' : '') + num(r.points) + ')</small>' : '') + (jr && jr.text ? ' <details class="inl why"><summary aria-label="' + esc(tr('why') + ': ' + nm) + '">ⓘ</summary><p class="sub">' + esc(L(jr.text)) + '</p></details>' : '') + (tx && tx !== nm && !nm.startsWith(tx) ? '<div class="sub">' + esc(tx) + '</div>' : '') + '</li>';
  };
  return '<details class="x mwin" data-mw="' + i + '"' + (MU.open === i ? ' open' : '') + '><summary><span class="rank">#' + num(i + 1) + '</span><span class="mwd"><b>' + dayLabel(sd) + '</b><span>' + fmtTime(w.startISO) + ' – ' + fmtTime(w.endISO) + (String(w.endISO).slice(0, 10) !== String(w.startISO).slice(0, 10) ? ' (+1)' : '') + ' · ' + esc(L(w.lagnaName)) + ' ' + tr('lagna') + '</span></span><span class="score ' + scoreCls(w.score) + '" aria-label="' + tr('scoreL') + ' ' + w.score + '">' + num(w.score) + '</span><span class="sub rc">✓' + num(good.length) + ' ✗' + num(bad.length) + '</span></summary>' +
    '<div class="body"><div class="compare"><div><h4 class="ok">✓ ' + tr('reasonsGood') + '</h4><ul class="rlist">' + good.map(rr).join('') + '</ul></div><div><h4 class="bad">✗ ' + tr('reasonsBad') + '</h4><ul class="rlist">' + (bad.length ? bad.map(rr).join('') : '<li class="sub">' + tr('noneP') + '</li>') + '</ul></div></div>' +
    '<dl class="kv"><dt>' + tr('vara') + '</dt><dd>' + esc(L(pc.varaName)) + '</dd><dt>' + tr('tithi') + '</dt><dd>' + esc(L(pc.tithiName)) + '</dd><dt>' + tr('nakshatra') + '</dt><dd>' + esc(L(pc.nakshatraName)) + '</dd><dt>' + tr('yoga') + '</dt><dd>' + esc(L(pc.yogaName)) + '</dd><dt>' + tr('karana') + '</dt><dd>' + esc(karanaName(pc.karana)) + '</dd></dl>' +
    '<div class="row" style="margin-top:8px"><button type="button" class="btn sm" data-mics="' + i + '">📅 ' + tr('downloadIcs') + '</button><button type="button" class="btn sm" data-msh="' + i + '">📋 ' + tr('share') + '</button></div></div></details>';
}
function muMonth(R) {
  const days = R.days || [], byDate = {}; for (const d of days) byDate[d.date] = d;
  if (!days.length) return '';
  const first = days[0].date.slice(0, 7), last = days[days.length - 1].date.slice(0, 7);
  if (!MU.month || MU.month < first || MU.month > last) { const bestDay = days.reduce((a, b) => (b.best > a.best ? b : a), days[0]); MU.month = bestDay.date.slice(0, 7); }
  const ym = MU.month, d0 = ym + '-01', n = new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0)).getUTCDate(), off = dowOf(d0);
  let g = '<div class="row between calhead"><button type="button" class="btn sm" data-mum="-1"' + (ym <= first ? ' disabled' : '') + ' aria-label="' + tr('prevL') + '">‹</button><b>' + monthTitle(ym) + '</b><button type="button" class="btn sm" data-mum="1"' + (ym >= last ? ' disabled' : '') + ' aria-label="' + tr('nextL') + '">›</button></div><div class="mcal" aria-label="' + esc(monthTitle(ym)) + '">' + WD[S.lang].map(w => '<span class="wd">' + w + '</span>').join('');
  for (let i = 0; i < off; i++) g += '<span class="pad"></span>';
  for (let dd = 1; dd <= n; dd++) {
    const ds = ym + '-' + pad2(dd), r = byDate[ds];
    if (!r) { g += '<span class="mday out" title="' + tr('outRange') + '">' + num(dd) + '</span>'; continue; }
    const c = r.best >= 75 ? 'h4' : r.best >= 60 ? 'h3' : r.best >= 45 ? 'h2' : r.best > 0 ? 'h1' : 'h0';
    g += '<button type="button" class="mday ' + c + (MU.day === ds ? ' sel' : '') + (ds === todayStr() ? ' today' : '') + '" data-mud="' + ds + '" aria-pressed="' + (MU.day === ds) + '" aria-label="' + esc(dayLabel(ds) + ': ' + (r.best > 0 ? tr('scoreL') + ' ' + r.best : tr('blockedDay'))) + '"><b>' + num(dd) + '</b><small>' + (r.best > 0 ? num(r.best) : (r.blocked && r.blocked.length ? '⛔' : '·')) + '</small></button>';
  }
  g += '</div><div class="legend"><span><span class="sw mday h4"></span>75+</span><span><span class="sw mday h3"></span>60–74</span><span><span class="sw mday h2"></span>45–59</span><span><span class="sw mday h1"></span>&lt;45</span><span><span class="sw mday h0"></span>⛔ ' + tr('blockedDay') + '</span></div>';
  if (MU.day && byDate[MU.day]) {
    const r = byDate[MU.day], pc = r.panchang || {}, ws = (R.windows || []).map((w, i) => [w, i]).filter(([w]) => (w.date || String(w.startISO).slice(0, 10)) === MU.day);
    const tl = x => typeof x === 'number' ? fmtTime(JE.isoLocal(x, R.utcOffset)) : x ? fmtTime(x) : '';
    g += '<div class="dayp"><h3>' + dayLabel(MU.day) + '</h3><p class="sub">' + esc(L(pc.varaName)) + ' · ' + esc(L(pc.tithiName)) + ' · ' + esc(L(pc.nakshatraName)) + ' · ' + esc(L(pc.yogaName)) + (pc.monthName ? ' · ' + esc(L(pc.monthName)) + (pc.adhik ? ' (' + (hi() ? 'अधिक' : 'Adhik') + ')' : '') : '') + ' · ' + tr('sunrise') + ' ' + fmtTime(r.sunriseISO) + '</p>' +
      (r.blocked && r.blocked.length ? '<p>⛔ <b>' + tr('blockedBy') + ':</b> ' + r.blocked.map(b => '<span class="pill red">' + esc(ruleName(b)) + '</span>').join(' ') + '</p>' : '') +
      (r.soft && r.soft.length ? '<p>⚠️ <b>' + tr('softBy') + ':</b> ' + r.soft.map(b => '<span class="pill gold">' + esc(ruleName(b)) + '</span>').join(' ') + '</p>' : '') +
      (r.best > 0 ? '<p>🏆 ' + tr('bestOfDay') + ': <span class="score ' + scoreCls(r.best) + '">' + num(r.best) + '</span> ' + (r.bestStart != null ? tl(r.bestStart) + ' – ' + tl(r.bestEnd) : '') + '</p>' : '') +
      (ws.length ? '<h4>' + tr('windowsOn') + '</h4><div class="mwins">' + ws.map(([w, i]) => muWin(R, w, i)).join('') + '</div>' : '') + '</div>';
  }
  return g;
}
function muRun() {
  const f = $('#muFrom'), t = $('#muTo'); if (f && f.value) MU.from = f.value; if (t && t.value) MU.to = t.value;
  const err = m => { MU.err = m || null; const e = $('#muErr'); if (e) e.textContent = m || ''; };
  if (!validDate(MU.from) || !validDate(MU.to) || MU.to < MU.from) { err(tr('needDate')); return; }
  if (daysBetween(MU.from, MU.to) > 365) { MU.to = addDays(MU.from, 365); if (t) t.value = MU.to; }
  err('');
  const token = ++MU.token, people = MU.people.map(id => chartOf(profById(id))).filter(Boolean).slice(0, 2);
  const opts = { purpose: MU.purpose, from: MU.from, to: MU.to, place: enginePlace(MU.place), people, stepMinutes: 15 };
  MU.busy = true; MU.prog = 0;
  const paint = () => { const b = $('#muBar'), p = $('#muProg'), x = $('#muPct'), bt = $('#muRunBtn'); if (b) b.style.width = (MU.prog * 100).toFixed(0) + '%'; if (p) { p.setAttribute('aria-valuenow', Math.round(MU.prog * 100)); p.classList.toggle('idle', !MU.busy); } if (x) x.textContent = MU.busy ? tr('searching') + ' ' + num(Math.round(MU.prog * 100)) + '%' : ''; if (bt) bt.disabled = MU.busy; };
  paint();
  JE.muhurtaAsync(opts, fr => { if (token !== MU.token) return; MU.prog = fr; paint(); }).then(r => {
    if (token !== MU.token) return;
    MU.busy = false; MU.prog = 1; MU.res = r; MU.day = null; MU.month = null; MU.more = false; MU.open = r.windows && r.windows.length ? 0 : -1;
    paint(); const box = $('#muRes'); if (box) { box.innerHTML = muResults(); const bt = $('#muRunBtn'); if (bt) bt.innerHTML = '🔍 ' + tr('runAgain'); box.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); }
    announce('🏆 ' + num((r.windows || []).length) + ' · ' + tr('results'));
  }).catch(e => { if (token !== MU.token) return; console.error(e); MU.busy = false; paint(); err(tr('chartErr') + ': ' + e.message); });
}
function muIcsItem(R, w) {
  const rs = w.reasons.map(r => (r.kind === 'good' ? '✓ ' : '✗ ') + ruleName(r.id)), pc = w.panchang || {};
  return { start: w.start, end: w.end, title: muIcon(R.purpose) + ' ' + muName(R.purpose) + ' · ' + tr('muhurta') + ' (' + w.score + ')', loc: placeLabel(MU.place), desc: [L(pc.varaName), L(pc.tithiName), L(pc.nakshatraName), L(w.lagnaName) + ' ' + tr('lagna')].join(' · ') + '\n' + rs.join('\n') + '\n\n' + (JC && JC.muhurtaIntro ? L(JC.muhurtaIntro.disclaimer) : '') + '\n— ' + tr('appName') };
}
function muShareText(R, list) {
  return '📅 ' + tr('muhurtaTitle') + ': ' + muName(R.purpose) + ' · ' + placeLabel(MU.place) + '\n' + list.map(([w, i]) => '#' + (i + 1) + ' ' + dayLabel(w.date || String(w.startISO).slice(0, 10)) + ' ' + fmtTime(w.startISO) + '–' + fmtTime(w.endISO) + ' · ' + tr('scoreL') + ' ' + w.score + ' · ' + L(w.panchang.tithiName) + ', ' + L(w.panchang.nakshatraName)).join('\n') + '\n\n' + (JC && JC.muhurtaIntro ? L(JC.muhurtaIntro.disclaimer) : '') + '\n— ' + tr('appName') + ' · Made by Nivriti Rajput 💜';
}

/* ---------------------------------------------------------------------
   21f. 🗓️ Transit calendar: month / year / list, filters, eclipses, personal mode
   --------------------------------------------------------------------- */
const CAL_CATS = [['ingress', '➡️', ['sign_ingress', 'nakshatra_ingress']], ['station', '↩️', ['station_retro', 'station_direct']], ['combust', '🔆', ['combust_start', 'combust_end']], ['lunation', '🌕', ['new_moon', 'full_moon', 'purnima', 'amavasya']], ['ekadashi', '🙏', ['ekadashi']], ['sankranti', '☀️', ['sankranti']], ['eclipse', '🌑', ['solar_eclipse', 'lunar_eclipse']], ['sadesati', '🪐', ['sade_sati_change']], ['moonsign', '🌙', ['moon_sign']]];
const CAT_KEY = { ingress: 'catIngress', station: 'catStation', combust: 'catCombust', lunation: 'catLunation', ekadashi: 'catEkadashi', sankranti: 'catSankranti', eclipse: 'catEclipse', sadesati: 'catSadesati', moonsign: 'catMoonsign' };
const CAT_OF = {}; for (const [c, , ts] of CAL_CATS) for (const t of ts) CAT_OF[t] = c;
const CAL_BODIES = ['Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
const CAL = { view: 'month', ym: null, place: null, cats: null, bodies: null, eclOnly: false, personal: false, sel: null, key: '', res: null, err: null, list: [], fOpen: false };
const evIcon = e => (JC && JC.events && JC.events[e.type] && JC.events[e.type].icon) || (e.type === 'solar_eclipse' ? '🌑' : e.type === 'lunar_eclipse' ? '🌕' : (CAL_CATS.find(c => c[0] === CAT_OF[e.type]) || [0, '•'])[1]);
const TITHI_EV = ['purnima', 'amavasya', 'ekadashi'];
const evDate = e => (e.observeDate && TITHI_EV.includes(e.type) ? e.observeDate : String(e.iso).slice(0, 10));
function calInit() {
  if (!CAL.ym) CAL.ym = todayStr().slice(0, 7);
  if (!CAL.place) CAL.place = defaultPlace();
  CAL.onPlace = () => { CAL.key = ''; };
  if (!CAL.cats) CAL.cats = new Set(CAL_CATS.map(c => c[0]).filter(c => c !== 'moonsign'));
  if (!CAL.bodies) CAL.bodies = new Set(CAL_BODIES);
}
function calKey() { const p = curP(); return JSON.stringify([CAL.ym.slice(0, 4), placeKey(CAL.place), S.ayan, S.node, CAL.cats.has('moonsign'), p ? [p.id, p.date, p.time, p.place.lat, p.tzMode, p.name] : null, S.eng, S.lang]); }
function calCompute() {
  const k = calKey(); if (CAL.key === k) return;
  const y = CAL.ym.slice(0, 4), C = curP() ? curChart() : null;
  try { CAL.res = JE.calendar(y + '-01-01', y + '-12-31', enginePlace(CAL.place), { charts: C ? [C] : [], moonSigns: CAL.cats.has('moonsign'), ayanamsa: S.ayan === 'tropical' ? 'lahiri' : S.ayan, node: S.node }); CAL.err = null; }
  catch (e) { console.error(e); CAL.res = null; CAL.err = e; }
  CAL.key = k;
}
function calTouch(e, C) {
  if (!C) return null;
  const mo = P(C, 'Mo'), ms = mo.sign, ls = C.meta.timeUnknown ? null : C.asc.sign;
  const hx = s => s == null ? null : { m: ((s - ms + 12) % 12) + 1, l: ls == null ? null : ((s - ls + 12) % 12) + 1 };
  if (e.type === 'sade_sati_change') return { always: true };
  if (e.type === 'solar_eclipse' || e.type === 'lunar_eclipse') { const x = hx(sidSignAt(e.jd, e.type === 'solar_eclipse' ? 'Su' : 'Mo')); return x && (x.m === 1 || x.l === 1 || x.m === 7 || x.l === 7) ? x : (x ? Object.assign({ weak: true }, x) : null); }
  if (e.type === 'nakshatra_ingress') return e.to === mo.nak ? { nak: true } : null;
  if (['sign_ingress', 'sankranti', 'moon_sign', 'station_retro', 'station_direct', 'new_moon', 'full_moon'].includes(e.type) && e.to != null) {
    const x = hx(e.to); if (!x) return null;
    if (e.to === ms || e.to === ls) return x;
    if (['Ju', 'Sa', 'Ra', 'Ke'].includes(e.body) && e.type === 'sign_ingress') return x;
    return Object.assign({ weak: true }, x);
  }
  return null;
}
function calFiltered() {
  const R = CAL.res; if (!R) return [];
  const C = CAL.personal && curP() ? curChart() : null;
  return R.events.map((e, i) => ({ e, i })).filter(({ e }) => {
    const c = CAT_OF[e.type] || 'other';
    if (CAL.eclOnly) return c === 'eclipse';
    if (!CAL.cats.has(c)) return false;
    if (['ingress', 'station', 'combust'].includes(c) && e.body && CAL_BODIES.includes(e.body) && !CAL.bodies.has(e.body)) return false;
    if (CAL.personal && C) { const t = calTouch(e, C); if (!t || t.weak) return false; }
    return true;
  });
}
function viewCalendar() {
  if (!P2OK()) return p2Missing();
  calInit();
  const EH = JC && JC.eventsHelp, p0 = curP(), C0 = p0 ? curChart() : null;
  if (!C0) CAL.personal = false;
  let h = '<div class="card noprint"><div class="row between"><h2>🗓️ ' + tr('calTitle') + ' <small>' + num(CAL.ym.slice(0, 4)) + '</small></h2><div class="seg" id="calView" role="group" aria-label="' + tr('calTitle') + '">' + [['month', tr('monthV')], ['year', tr('yearV')], ['list', tr('listV')]].map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + (CAL.view === v ? 'on' : '') + '" aria-pressed="' + (CAL.view === v) + '">' + l + '</button>').join('') + '</div></div>' +
    (EH && EH.calm ? '<p class="sub">' + esc(L(EH.calm)) + '</p>' : '') +
    '<div class="row"><button type="button" class="btn sm' + (CAL.eclOnly ? ' on' : '') + '" data-p2="calEcl" aria-pressed="' + CAL.eclOnly + '">🌑 ' + tr('eclOnly') + '</button><button type="button" class="btn sm' + (CAL.personal ? ' on' : '') + '" data-p2="calPers" aria-pressed="' + CAL.personal + '"' + (C0 ? '' : ' disabled title="' + esc(tr('personalNeeds')) + '"') + '>👤 ' + tr('personal') + (C0 ? ': ' + esc(p0.name) : '') + '</button><button type="button" class="btn sm" data-p2="calIcs">📅 ' + tr('exportIcs') + '</button></div>' +
    (CAL.personal && EH ? '<p class="sub">' + esc(L(EH.personal)) + '</p>' : '') +
    '<details class="x" id="calF"' + (CAL.fOpen ? ' open' : '') + '><summary>🎛️ ' + tr('filters') + ' <span class="pill">' + num(CAL.cats.size) + '/' + num(CAL_CATS.length) + '</span> <span class="sub">📍 ' + esc(placeLabel(CAL.place)) + '</span></summary><div class="body"><span class="lbl">' + tr('types') + '</span><div class="chips">' + CAL_CATS.map(([c, ic]) => '<button type="button" class="chip' + (CAL.cats.has(c) ? ' on' : '') + '" data-ccat="' + c + '" aria-pressed="' + CAL.cats.has(c) + '">' + ic + ' ' + tr(CAT_KEY[c]) + '</button>').join('') + '</div><span class="lbl">' + tr('bodiesL') + '</span><div class="chips">' + CAL_BODIES.map(id => '<button type="button" class="chip' + (CAL.bodies.has(id) ? ' on' : '') + '" data-cbody="' + id + '" aria-pressed="' + CAL.bodies.has(id) + '">' + esc(pn(id)) + '</button>').join('') + '</div>' + placePicker('cal', CAL, CAL.ym + '-01') + '</div></details></div>';
  if (CAL.key !== calKey()) {
    AFTER.push(() => setTimeout(() => { if (S.view !== 'insights' || S.sub.insights !== 'calendar') return; calCompute(); rerenderAt(); }, 30));
    return h + '<div class="card" role="status"><p class="sub">⏳ ' + tr('loading') + '</p><div class="skel"></div><div class="skel"></div></div>';
  }
  if (CAL.err || !CAL.res) return h + '<div class="card"><div class="banner err">' + tr('chartErr') + (CAL.err ? ': ' + esc(CAL.err.message) : '') + '</div></div>';
  const R = CAL.res, list = calFiltered(); CAL.list = list;
  h += '<div class="print-only"><h2>🗓️ ' + tr('calTitle') + ' ' + num(CAL.ym.slice(0, 4)) + ' · ' + esc(placeLabel(CAL.place)) + '</h2></div>';
  const ecl = R.events.map((e, i) => ({ e, i })).filter(x => x.e.type === 'solar_eclipse' || x.e.type === 'lunar_eclipse');
  if (ecl.length && (CAL.eclOnly || CAL.cats.has('eclipse'))) h += '<div class="card"><h2>🌘 ' + tr('eclipses') + ' ' + num(CAL.ym.slice(0, 4)) + ' <small>📍 ' + esc(placeLabel(CAL.place)) + ' · UTC' + hm(R.utcOffset) + '</small></h2><div class="egrid">' + ecl.map(x => eclipseCard(x.e, x.i, R)).join('') + '</div></div>';
  h += '<div class="card"><div class="row between calhead"><button type="button" class="btn sm" data-calm="' + (CAL.view === 'month' ? -1 : -12) + '" aria-label="' + tr('prevL') + '">‹</button><b>' + (CAL.view === 'month' ? monthTitle(CAL.ym) : num(CAL.ym.slice(0, 4))) + '</b><button type="button" class="btn sm" data-calm="' + (CAL.view === 'month' ? 1 : 12) + '" aria-label="' + tr('nextL') + '">›</button></div>' +
    '<p class="sub" style="text-align:center">' + num(list.length) + ' ' + tr('eventsN') + ' · ' + (EH ? esc(L(EH.times)) : '') + '</p>';
  if (CAL.view === 'month') h += calMonth(list);
  else if (CAL.view === 'year') h += calYear(list);
  else h += calList(list);
  return h + '</div>';
}
function calRow(x, C) {
  const e = x.e, t = CAL.personal && C ? calTouch(e, C) : null, ev = JC && JC.events && JC.events[e.type], isT = TITHI_EV.includes(e.type);
  return '<button type="button" class="evrow ev-' + (CAT_OF[e.type] || 'other') + '" data-cev="' + x.i + '"><span class="ei" aria-hidden="true">' + esc(evIcon(e)) + '</span><span class="et"><b>' + esc(L(e.text)) + '</b><span>' + (isT ? dayLabel(evDate(e)) : fmtDate(e.iso, true)) + (ev ? ' · ' + esc(firstWord(ev.name)) : '') + '</span>' +
    (t && (t.m || t.nak || t.always) ? '<span class="tch">👤 ' + (t.nak ? tr('nakshatra') : t.always ? tr('sadeSati') : ord(t.m) + ' ' + tr('fromMoonS') + (t.l ? ' · ' + ord(t.l) + ' ' + tr('fromLagnaS') : '')) + '</span>' : '') + '</span></button>';
}
function calMonth(list) {
  const ym = CAL.ym, d0 = ym + '-01', n = new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0)).getUTCDate(), off = dowOf(d0), by = {};
  for (const x of list) { const d = evDate(x.e); if (d.slice(0, 7) === ym) (by[d] = by[d] || []).push(x); }
  let g = '<div class="mcal ccal" aria-label="' + esc(monthTitle(ym)) + '">' + WD[S.lang].map(w => '<span class="wd">' + w + '</span>').join('');
  for (let i = 0; i < off; i++) g += '<span class="pad"></span>';
  for (let d = 1; d <= n; d++) {
    const ds = ym + '-' + pad2(d), ev = by[ds] || [], ecl = ev.some(x => CAT_OF[x.e.type] === 'eclipse');
    g += '<button type="button" class="cday' + (ev.length ? ' has' : '') + (ecl ? ' ecl' : '') + (CAL.sel === ds ? ' sel' : '') + (ds === todayStr() ? ' today' : '') + '" data-cald="' + ds + '" aria-pressed="' + (CAL.sel === ds) + '" aria-label="' + esc(dayLabel(ds) + ': ' + ev.length + ' ' + tr('eventsN')) + '"><b>' + num(d) + '</b><span class="icons" aria-hidden="true">' + ev.slice(0, 3).map(x => esc(evIcon(x.e))).join('') + (ev.length > 3 ? '<small>+' + num(ev.length - 3) + '</small>' : '') + '</span></button>';
  }
  g += '</div>';
  const C = CAL.personal && curP() ? curChart() : null, sel = CAL.sel && CAL.sel.slice(0, 7) === ym ? CAL.sel : null;
  const show = sel ? (by[sel] || []) : Object.keys(by).sort().flatMap(k => by[k]);
  return g + '<div class="evlist" id="calDay">' + (sel ? '<h3>' + dayLabel(sel) + ' <button type="button" class="btn xs" data-cald="" aria-label="' + tr('close') + '">✕</button></h3>' : '') + (show.length ? show.map(x => calRow(x, C)).join('') : '<p class="sub">' + tr('noEvents') + '</p>') + '</div>';
}
function calYear(list) {
  const y = CAL.ym.slice(0, 4), C = CAL.personal && curP() ? curChart() : null;
  let g = '<div class="ygrid">';
  for (let m = 1; m <= 12; m++) {
    const ym = y + '-' + pad2(m), ev = list.filter(x => evDate(x.e).slice(0, 7) === ym), cnt = {};
    for (const x of ev) { const c = CAT_OF[x.e.type]; cnt[c] = (cnt[c] || 0) + 1; }
    const key = ev.filter(x => ['eclipse', 'sadesati'].includes(CAT_OF[x.e.type]) || (['Ju', 'Sa', 'Ra'].includes(x.e.body) && ['sign_ingress', 'station_retro', 'station_direct'].includes(x.e.type)) || x.e.type === 'sankranti').slice(0, 5);
    g += '<div class="ymon"><button type="button" class="ymh" data-calym="' + ym + '"><b>' + MON[S.lang][m - 1] + '</b><span class="sub">' + num(ev.length) + ' ' + tr('eventsN') + ' →</span></button><div class="chips">' + CAL_CATS.filter(c => cnt[c[0]]).map(c => '<span class="pill" title="' + esc(tr(CAT_KEY[c[0]])) + '">' + c[1] + ' ' + num(cnt[c[0]]) + '</span>').join('') + '</div>' + key.map(x => calRow(x, C)).join('') + '</div>';
  }
  return g + '</div>';
}
function calList(list) {
  const C = CAL.personal && curP() ? curChart() : null;
  if (!list.length) return '<p class="sub">' + tr('noEvents') + '</p>';
  let g = '', cur = '';
  for (const x of list.slice().sort((a, b) => a.e.jd - b.e.jd)) { const ym = evDate(x.e).slice(0, 7); if (ym !== cur) { cur = ym; g += '<h3 class="lmon">' + monthTitle(ym) + '</h3>'; } g += calRow(x, C); }
  return '<div class="evlist">' + g + '</div>';
}
function eclipseCard(e, i, R) {
  const J = JC && JC.events && JC.events[e.type], lc = e.local || {}, solar = e.type === 'solar_eclipse';
  const kind = J && J.kinds && J.kinds[e.kind] ? L(J.kinds[e.kind]) : '';
  let t = '';
  if (solar && lc.eclipsedHere && lc.visible) t = '<dl class="kv"><dt>' + tr('from2') + '</dt><dd>' + fmtTime(lc.visibleFromISO || lc.startISO) + '</dd><dt>' + tr('greatest') + '</dt><dd>' + fmtTime(lc.maxVisibleISO || lc.maxISO) + '</dd><dt>' + tr('until') + '</dt><dd>' + fmtTime(lc.visibleToISO || lc.endISO) + '</dd><dt>' + tr('magnitude') + '</dt><dd>' + fx(lc.magnitudeVisible != null ? lc.magnitudeVisible : lc.magnitude, 3) + '</dd></dl>';
  else if (!solar && e.contactsISO) t = '<dl class="kv">' + ['P1', 'U1', 'U2', 'U3', 'U4', 'P4'].filter(k => e.contactsISO[k]).map(k => '<dt>' + k + '</dt><dd>' + fmtDate(e.contactsISO[k], true) + '</dd>').join('') + (lc.visible ? '<dt>👁️ ' + tr('visibleHere') + '</dt><dd>' + fmtTime(lc.visibleFromISO) + ' – ' + fmtTime(lc.visibleToISO) + '</dd>' : '') + '</dl>';
  return '<div class="ecard ' + (lc.visible ? 'vis' : 'nov') + ' ' + (solar ? 'sol' : 'lun') + '"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="eic" aria-hidden="true">' + (solar ? '🌑' : '🌕') + '</span><div style="flex:1;min-width:0"><b>' + esc(L(e.text)) + '</b><div class="sub">' + dayLabel(String(e.iso).slice(0, 10)) + ' · ' + tr('greatest') + ' ' + fmtTime(e.iso) + ' · ' + term('eclipse_magnitude', tr('magnitude')) + ' ' + fx(solar ? e.magnitude : e.umbralMagnitude, 3) + '</div></div></div><span class="pill ' + (lc.visible ? 'saff' : '') + '">' + (lc.visible ? '👁️ ' + tr('visibleHere') : '🚫 ' + tr('notVisible')) + '</span>' +
    '<p class="sub">' + esc(L(lc.text)) + '</p>' + (kind ? '<p class="sub">' + esc(kind) + '</p>' : '') + (t ? '<h4>🕰️ ' + tr('localTimes') + '</h4>' + t : '') +
    (J ? (solar && J.safety ? '<details class="x"' + (lc.visible ? ' open' : '') + '><summary>🕶️ ' + tr('safety') + '</summary><div class="body"><p>' + esc(L(J.safety)) + '</p></div></details>' : '') + (!solar && J.viewing ? '<details class="x"><summary>👀 ' + tr('safety') + '</summary><div class="body"><p>' + esc(L(J.viewing)) + '</p></div></details>' : '') + (J.sutak ? '<details class="x"><summary>🪔 ' + term('sutak', tr('sutakT')) + '</summary><div class="body"><p>' + esc(L(J.sutak)) + '</p>' + (J.pregnancy ? '<p class="sub">' + esc(L(J.pregnancy)) + '</p>' : '') + '</div></details>' : '') : '') +
    '<div class="row" style="margin-top:6px"><button type="button" class="btn xs" data-cics="' + i + '">📅 .ics</button><button type="button" class="btn xs" data-cev="' + i + '">ℹ️ ' + tr('details') + '</button></div></div>';
}
function calEventDetail(e) {
  const J = JC && JC.events && JC.events[e.type], C = curP() ? curChart() : null, t = C ? calTouch(e, C) : null, idx = CAL.res.events.indexOf(e);
  let h = '<p class="sub">' + fmtDate(e.iso, true) + ' · UTC' + hm(CAL.res.utcOffset) + (e.endISO ? ' → ' + fmtDate(e.endISO, true) : '') + (e.observeDate ? ' · ' + (hi() ? 'पालन तिथि ' : 'observed ') + fmtDate(e.observeDate) : '') + '</p>';
  if (e.type === 'solar_eclipse' || e.type === 'lunar_eclipse') h += eclipseCard(e, idx, CAL.res);
  if (J) h += '<div class="dsec"><h4>' + esc(J.icon || '') + ' ' + esc(L(J.name)) + '</h4>' + (J.what ? '<p class="reading"><b>' + tr('whatHappens') + ':</b> ' + esc(L(J.what)) + '</p>' : '') + (J.meaning ? '<p class="reading"><b>' + tr('tradMeaning') + ':</b> ' + esc(L(J.meaning)) + '</p>' : '') + (J.byPlanet && J.byPlanet[e.body] ? '<p class="sub">' + esc(L(J.byPlanet[e.body])) + '</p>' : '') + (e.type === 'sade_sati_change' && J.phases && J.phases[e.to] ? '<p class="sub">' + esc(L(J.phases[e.to])) + '</p>' : '') + '</div>';
  if (t && C && !t.weak) h += '<div class="banner info">👤 ' + esc(curP().name) + ': ' + (t.always ? tr('sadeSati') : t.nak ? tr('nakshatra') + ' ' + nkn(P(C, 'Mo').nak) : ord(t.m) + ' ' + tr('fromMoonS') + (t.l ? ' · ' + ord(t.l) + ' ' + tr('fromLagnaS') : '')) + '</div>';
  return h + '<button type="button" class="btn sm" data-cics="' + idx + '">📅 ' + tr('downloadIcs') + '</button>';
}
const calIcsItem = e => ({ start: e.jd, end: (e.local && e.local.end) || e.jd + 1 / 48, title: evIcon(e) + ' ' + L(e.text), desc: (JC && JC.events && JC.events[e.type] ? L(JC.events[e.type].what) + '\n' : '') + '— ' + tr('appName'), loc: placeLabel(CAL.place) });

/* ---------------------------------------------------------------------
   21g. Phase 2 event handlers (called first from onClick / onInput / onChange / onKey)
   --------------------------------------------------------------------- */
function rerenderAt() { if (IS_NODE) return; const y = G.scrollY; render(); G.scrollTo(0, y); }
function p2Click(e, t) {
  if (!t.closest('.cp')) $$('.cp .sugg').forEach(x => { if (!x.classList.contains('hidden')) { x.classList.add('hidden'); const i = x.parentElement && x.parentElement.querySelector('input'); if (i) i.setAttribute('aria-expanded', 'false'); } });
  const o = t.closest('[data-cpi]'); if (o) { const [k, i] = o.dataset.cpi.split(':'); cpPick(k, (CP.res[k] || [])[+i]); return true; }
  const b = t.closest('button'); if (!b) return false;
  const d = b.dataset;
  if (d.cpp) { const [k, id] = d.cpp.split(':'); const p = profById(id); if (p) cpPick(k, p.place); return true; }
  if (d.koota) { const R = computeMatch(); if (R && R.m) showDetail('🔢 ' + esc(kootaName(d.koota)), detailKoota(R.m, d.koota), b); return true; }
  if (d.por) { const R = computeMatch(); if (R && R.m) showDetail('🌺 ' + esc(porName(d.por)), detailPorutham(R.m, d.por), b); return true; }
  if (b.closest('#mSys')) { MT.sys = d.v; rerenderAt(); return true; }
  if (d.fm) { const [a, c] = d.fm.split(':'); MT.a = a; MT.b = c; go('people', 'match'); return true; }
  if (d.fmatch) { MT.a = d.fmatch; MT.b = null; go('people', 'match'); return true; }
  if (d.fg != null) { FAM.g = d.fg || null; rerenderAt(); return true; }
  if (d.fstep != null) { const n = +d.fstep; FAM.date = n === 0 ? todayStr() : addDays(FAM.date || todayStr(), n); rerenderAt(); return true; }
  if (d.fh) { const [k, i] = d.fh.split(':'); showDetail(k === 'cb' ? '🌙 ' + tr('chandrabala') : '⭐ ' + tr('tarabala'), famHelpDetail(k, +i), b); return true; }
  if (d.mup) { MU.purpose = d.mup; MU.res = null; MU.token++; MU.busy = false; MU.prog = 0; rerenderAt(); return true; }
  if (d.mur) { const f = $('#muFrom'); MU.from = f && validDate(f.value) ? f.value : todayStr(); MU.to = addDays(addMonths(MU.from, +d.mur), +d.mur === 12 ? -1 : 0); if (daysBetween(MU.from, MU.to) > 365) MU.to = addDays(MU.from, 365); rerenderAt(); return true; }
  if (d.mupp) { const i = MU.people.indexOf(d.mupp); if (i >= 0) MU.people.splice(i, 1); else { MU.people.push(d.mupp); if (MU.people.length > 2) MU.people.shift(); } rerenderAt(); return true; }
  if (b.closest('#muView')) { MU.view = d.v; const box = $('#muRes'); if (box) box.innerHTML = muResults(); return true; }
  if (d.mum) { MU.month = addMonths(MU.month + '-01', +d.mum).slice(0, 7); MU.day = null; const box = $('#muRes'); if (box) box.innerHTML = muResults(); return true; }
  if (d.mud) { MU.day = MU.day === d.mud ? null : d.mud; const box = $('#muRes'); if (box) { box.innerHTML = muResults(); const n = box.querySelector('[data-mud="' + d.mud + '"]'); if (n) n.focus({ preventScroll: true }); } return true; }
  if (d.mics != null) { const R = MU.res, w = R && R.windows[+d.mics]; if (w) saveIcs(namedFile(['Muhurta', muName(R.purpose), dmyOf(w.date || String(w.startISO).slice(0, 10)), cityOnly(MU.place)], '.ics'), [muIcsItem(R, w)]); return true; }
  if (d.msh != null) { const R = MU.res, w = R && R.windows[+d.msh]; if (w) shareSheet(tr('muhurtaTitle'), muShareText(R, [[w, +d.msh]]), b); return true; }
  if (b.closest('#calView')) { CAL.view = d.v; rerenderAt(); return true; }
  if (d.calm) { CAL.ym = addMonths(CAL.ym + '-01', +d.calm).slice(0, 7); if (CAL.ym < '1800-01') CAL.ym = '1800-01'; if (CAL.ym > '2100-12') CAL.ym = '2100-12'; CAL.sel = null; rerenderAt(); return true; }
  if (d.calym) { CAL.ym = d.calym; CAL.view = 'month'; CAL.sel = null; rerenderAt(); return true; }
  if (d.cald != null) { CAL.sel = d.cald && CAL.sel !== d.cald ? d.cald : null; rerenderAt(); const n = d.cald && document.querySelector('[data-cald="' + d.cald + '"]'); if (n) n.focus({ preventScroll: true }); return true; }
  if (d.ccat) { if (CAL.cats.has(d.ccat)) CAL.cats.delete(d.ccat); else CAL.cats.add(d.ccat); CAL.fOpen = true; rerenderAt(); return true; }
  if (d.cbody) { if (CAL.bodies.has(d.cbody)) CAL.bodies.delete(d.cbody); else CAL.bodies.add(d.cbody); CAL.fOpen = true; rerenderAt(); return true; }
  if (d.cev != null) { const ev = CAL.res && CAL.res.events[+d.cev]; if (ev) showDetail(esc(evIcon(ev)) + ' ' + esc(L(ev.text)), calEventDetail(ev), b); return true; }
  if (d.cics != null) { const ev = CAL.res && CAL.res.events[+d.cics]; if (ev) saveIcs(namedFile([L(ev.text).slice(0, 40), dmyOf(String(ev.iso).slice(0, 10)), cityOnly(CAL.place)], '.ics'), [calIcsItem(ev)]); return true; }
  switch (d.p2) {
    case 'quickAdd': newForm(null); FORM.ret = { slot: d.slot || 'b' }; go('people', 'list'); setTimeout(() => $('#fName') && $('#fName').focus(), 30); return true;
    case 'mswap': { const x = MT.a; MT.a = MT.b; MT.b = x; rerenderAt(); return true; }
    case 'mprint': doPrint(titleForPrint()); return true;
    case 'mshare': { const R = computeMatch(); if (R && R.m) shareSheet(tr('shareSummary'), matchShareText(R.m), b); return true; }
    case 'copyTxt': copyText(SHARE_TXT); return true;
    case 'shareTxt': try { navigator.share({ title: tr('appName'), text: SHARE_TXT }).catch(() => { }); } catch (er) { } return true;
    case 'muRun': muRun(); return true;
    case 'muMore': { MU.more = true; const box = $('#muRes'); if (box) box.innerHTML = muResults(); return true; }
    case 'muIcsTop': { const R = MU.res; if (R) saveIcs(namedFile(['Muhurta', muName(R.purpose), 'Top10', dmyOf(MU.from), cityOnly(MU.place)], '.ics'), R.windows.slice(0, 10).map(w => muIcsItem(R, w))); return true; }
    case 'muShareTop': { const R = MU.res; if (R) shareSheet(tr('muhurtaTitle'), muShareText(R, R.windows.slice(0, 10).map((w, i) => [w, i])), b); return true; }
    case 'calEcl': CAL.eclOnly = !CAL.eclOnly; rerenderAt(); return true;
    case 'calPers': CAL.personal = !CAL.personal; rerenderAt(); return true;
    case 'calIcs': { const L2 = CAL.view === 'month' ? CAL.list.filter(x => evDate(x.e).slice(0, 7) === CAL.ym) : CAL.list; saveIcs(namedFile([CAL.personal && curP() ? curP().name : '', 'Transit Calendar', CAL.view === 'month' ? CAL.ym.slice(5, 7) + '-' + CAL.ym.slice(0, 4) : CAL.ym.slice(0, 4), cityOnly(CAL.place)], '.ics'), L2.map(x => calIcsItem(x.e))); return true; }
  }
  return false;
}
function p2Input(e) {
  const t = e.target, cp = t.closest && t.closest('.cp');
  if (cp && t.id === cp.dataset.cp + 'City') { cpSearch(cp.dataset.cp, t.value); return true; }
  return false;
}
function p2Change(e) {
  const t = e.target, id = t.id;
  if (id === 'mA' || id === 'mB') { MT[id === 'mA' ? 'a' : 'b'] = t.value; rerenderAt(); return true; }
  if (id === 'famDate') { if (validDate(t.value)) { FAM.date = t.value; rerenderAt(); } return true; }
  if (id === 'muFrom' || id === 'muTo') {
    if (validDate(t.value)) {
      MU[id === 'muFrom' ? 'from' : 'to'] = t.value; const x = $('#muTo');
      if (MU.to < MU.from) { MU.to = addMonths(MU.from, 1); if (x) x.value = MU.to; }
      if (daysBetween(MU.from, MU.to) > 365) { MU.to = addDays(MU.from, 365); if (x) x.value = MU.to; toast(tr('rangeMax')); }
    }
    return true;
  }
  return false;
}
function p2Key(e) {
  const t = e.target, cp = t.closest && t.closest('.cp'); if (!cp || t.tagName !== 'INPUT') return false;
  const k = cp.dataset.cp, box = $('#' + k + 'Sugg'), res = CP.res[k] || [];
  if (!box || box.classList.contains('hidden') || !res.length) return false;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); CP.sel[k] = clamp((CP.sel[k] == null ? -1 : CP.sel[k]) + (e.key === 'ArrowDown' ? 1 : -1), 0, res.length - 1); $$('[role=option]', box).forEach((o, i) => o.setAttribute('aria-selected', i === CP.sel[k])); t.setAttribute('aria-activedescendant', k + 'o' + CP.sel[k]); const o = $('#' + k + 'o' + CP.sel[k]); if (o) o.scrollIntoView({ block: 'nearest' }); return true; }
  if (e.key === 'Enter') { e.preventDefault(); cpPick(k, res[CP.sel[k] >= 0 ? CP.sel[k] : 0]); return true; }
  if (e.key === 'Escape') { box.classList.add('hidden'); t.setAttribute('aria-expanded', 'false'); return true; }
  return false;
}
/* ---------------------------------------------------------------------
   22. Events
   --------------------------------------------------------------------- */
function rerenderKeep(id) {
  if (IS_NODE) return;
  const el = id && document.getElementById(id), pos = el && el.selectionStart, y = G.scrollY;
  render();
  const n = id && document.getElementById(id);
  if (n) { n.focus({ preventScroll: true }); try { if (pos != null) n.setSelectionRange(pos, pos); } catch (e) { } }
  G.scrollTo(0, y);
}
function setConv(k, v) {
  const prev = { ayan: S.ayan, node: S.node, houses: S.houses };
  const p = curP(); let A = null; try { A = p && computeChart(p); } catch (e) { }
  S[k] = v; saveS(); QF.clear();
  if (A) { try { const B = computeChart(p); CHANGE = { from: prev, text: (k === 'ayan' ? L(JE.AYAN[prev.ayan].name).split(' (')[0] + ' → ' + L(JE.AYAN[v].name).split(' (')[0] : k === 'node' ? tr(prev.node) + ' → ' + tr(v) : tr(prev.houses) + ' → ' + tr(v)) + ': ' + changeSummary(compareCharts(A, B)) }; CMP.ayan = CMP.node = CMP.houses = null; } catch (e) { CHANGE = null; } }
  render(); $('#options').classList.add('open');
}
function ctxOf(el) {
  const svg = el.closest('svg.chart'); if (svg) return svg.getAttribute('data-ctx');
  if (S.view === 'kundli' && S.sub.kundli === 'chart') return 'main:' + S.varga;
  if (S.view === 'kundli' && S.sub.kundli === 'vargas' && VS.open && el.closest('#vOpen')) return 'varga:' + VS.open;
  return 'main:D1';
}
function onClick(e) {
  const t = e.target;
  if (!t.closest('#pop') && !t.closest('[data-gl]')) hidePop();
  if (!t.closest('.field') && $('#citySugg')) $('#citySugg').classList.add('hidden');
  if (p2Click(e, t)) return;
  for (const f of MODS.click) if (f(e, t)) return;
  const b = t.closest('button, [data-k], [data-ci], label.chip');
  if (!b) return;
  const d = b.dataset;
  if (d.dsys) { S.dsys = d.dsys; DT.sys = null; saveS(); rerenderAt(); return; }
  if (d.act === 'bunRetry') { delete BUN_ERR[d.bun]; delete BUN[d.bun]; if (G.KS_LOADER && G.KS_LOADER.reset) G.KS_LOADER.reset(d.bun); need(d.bun).then(rerenderAt, rerenderAt); rerenderAt(); return; }
  if (b.id === 'langBtn') { S.lang = hi() ? 'en' : 'hi'; saveS(); QF.clear(); render(); return; }
  if (b.id === 'optBtn') { const o = $('#options'); o.classList.toggle('open'); b.setAttribute('aria-expanded', o.classList.contains('open')); return; }
  if (b.id === 'brandBtn') { go('people'); return; }
  if (b.id === 'sheetClose') { closeSheet(); return; }
  if (d.popclose) { hidePop(); return; }
  if (d.gl) { e.preventDefault(); showPop(b, d.gl); return; }
  if (d.glopen) { const g = JC.glossary[d.glopen]; LEARN.tab = 'gloss'; LEARN.q = g ? L(g.term).split(' (')[0] : ''; hidePop(); go('more', 'learn'); return; }
  if (b.closest('#langSeg')) { S.lang = d.v; saveS(); QF.clear(); render(); $('#options').classList.add('open'); return; }
  if (b.closest('#themeSeg')) { S.theme = d.v; saveS(); render(); $('#options').classList.add('open'); return; }
  if (b.closest('#nodeSeg')) { if (d.v !== S.node) setConv('node', d.v); return; }
  if (b.closest('#styleSeg')) { S.style = d.v; saveS(); render(); $('#options').classList.add('open'); return; }
  if (d.style) { S.style = d.style; saveS(); const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (b.id === 'resetBtn') { const keep = { cur: S.cur, view: S.view, sub: S.sub }; Object.assign(S, JSON.parse(JSON.stringify(DEF)), keep); saveS(); CHANGE = null; toast(tr('reset')); render(); return; }
  if (b.id === 'wipeBtn' || d.act === 'wipe') { if (confirm(tr('wipeQ'))) { try { for (const k of Object.keys(localStorage)) if (k.startsWith('ks.')) localStorage.removeItem(k); } catch (er) { } PROFILES = []; Object.assign(S, JSON.parse(JSON.stringify(DEF))); CACHE.clear(); QF.clear(); FORM = null; toast(tr('wiped')); render(); } return; }
  if (d.nav) { if (d.nav === 'people') FORM = null; go(d.nav, d.sub || S.sub[d.nav]); return; }
  if (d.go) { const [v, s] = d.go.split(':'); go(v, s); return; }
  if (d.varga) { VS.open = d.varga; const y = G.scrollY; render(); G.scrollTo(0, y); const o = $('#vOpen'); if (o) o.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); return; }
  if (d.k) { openKey(d.k, ctxOf(b), b); return; }
  if (d.ci != null) { pickCity(+d.ci); return; }
  if (d.tz) { FORM.tzMode = d.tz; refreshTz(); return; }
  if (d.tzs != null) { const z = $('#mTz'); if (z) { z.value = d.tzs; readManual(); refreshTz(); z.focus(); } return; }
  if (b.closest('#fGender')) { FORM.gender = d.v; $$('#fGender button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); return; }
  if (d.ptzn != null) { const p = curP(); if (p) { p.tzMode = +d.ptzn; saveP(); QF.clear(); SCRUB.sensKey = ''; render(); toast(tr('saved') + ' · UTC' + hm(+d.ptzn)); } return; }
  if (d.ptz) { const p = curP(); p.tzMode = d.ptz; saveP(); QF.clear(); SCRUB.sensKey = ''; render(); toast(tr('saved')); return; }
  if (d.pg != null) { PF.g = d.pg; render(); return; }
  if (d.zoom != null) { const z = +d.zoom; ZOOM.s = z === 0 ? 1 : clamp(ZOOM.s * (z > 0 ? 1.35 : 1 / 1.35), 1, 4); if (ZOOM.s === 1) ZOOM.x = ZOOM.y = 0; applyZoom(); return; }
  if (d.scrub) { const v = +d.scrub; if (Math.abs(v) === 525960) { const p = curP(), cur = shiftLocal(p.date, p.time, SCRUB.min), [y, m, dd] = cur.date.split('-').map(Number), tp = cur.time.split(':').map(Number); SCRUB.min += (Date.UTC(y + Math.sign(v), m - 1, dd, tp[0], tp[1], tp[2] || 0) - Date.UTC(y, m - 1, dd, tp[0], tp[1], tp[2] || 0)) / 60000; } else SCRUB.min += v; scrubPaint(); return; }
  if (b.id === 'scrubPlay') { scrubPlay(!SCRUB.playing); return; }
  if (d.vplanet) { VS.planet = d.vplanet; const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (b.closest('#vimSeg')) { VS.scheme = d.v; const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (d.yoga) { YF.f = 'all'; YF.q = ''; YF.cat = ''; YF.open = d.yoga; closeSheet(); go('insights', 'yogas'); const el = document.querySelector('[data-yid="' + d.yoga + '"]'); if (el) { fillYoga(el); el.scrollIntoView({ block: 'center' }); } return; }
  if (b.closest('#yFilter')) { YF.f = d.v; rerenderKeep(); return; }
  if (d.dsel != null) { const path = dashaPathAt(DT.so, nowJd()).slice(0, +d.dsel + 1); tlSelect(path); return; }
  if (d.tl) { const [a, z] = tlBounds(); if (d.tl === 'in') tlZoom(0.5); else if (d.tl === 'out') tlZoom(2); else if (d.tl === 'now') tlAnimate(nowJd() - 365.25 * 1.5, nowJd() + 365.25 * 2.5); else { DT.sel = null; tlAnimate(a, z); } return; }
  if (d.crumb != null) { const i = +d.crumb; if (i < 0) { DT.sel = null; const [a, z] = tlBounds(); tlAnimate(a, z); const dc = $('#dcard'); if (dc) dc.innerHTML = periodCard(DT.C, DT.so, DT.sysName, dashaPathAt(DT.so, nowJd())); } else tlSelect(DT.sel.slice(0, i + 1)); return; }
  if (d.trstep != null) { trStep(+d.trstep); return; }
  if (b.id === 'trPlay') { trPlay(!TRANSIT.playing); return; }
  if (b.closest('#trMode')) { TRANSIT.mode = d.v; $$('#trMode button').forEach(x => x.classList.toggle('on', x === b)); trRefresh(); return; }
  if (d.ss != null) { const C = curChart(), p = sadeSatiPeriods(C)[+d.ss], JS = JC && JC.doshas && JC.doshas.sadeSati, ph = JS && JS.phases && JS.phases[p.phase]; showDetail(esc(ph ? L(ph.name) : p.phase), '<p><b>' + fmtDate(p.startISO) + ' – ' + fmtDate(p.endISO) + '</b> · ' + pn('Sa') + ' ' + tr('inSign') + ' ' + sgn(p.sign) + '</p><p class="sub">' + tr('age') + ' ' + fx(Math.max(0, ageAt(C, p.start)), 1) + '–' + fx(ageAt(C, p.end), 1) + '</p>' + (ph ? '<p class="reading">' + esc(L(ph.desc)) + '</p>' : ''), b); return; }
  if (b.closest('#stSeg')) { S.strength = d.v; saveS(); render(); return; }
  if (b.closest('#avMode')) { AV.mode = d.v; const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (b.closest('#avOrder')) { AV.order = d.v; const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (d.av) { const [id, s] = d.av.split(':'); AV.sel = { id, s: +s }; const C = curChart(); $('#avTable').innerHTML = avTable(C); $('#avInfo').innerHTML = avInfo(C); const nb = document.querySelector('[data-av="' + d.av + '"]'); if (nb) nb.focus({ preventScroll: true }); return; }
  if (d.prast) { AV.prast = d.prast; const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (d.sbsel != null) { SB_SEL = d.sbsel || null; $('#radarBox').innerHTML = radarSvg(curChart(), SB_SEL); $$('[data-sbsel]').forEach(x => x.classList.toggle('on', (x.dataset.sbsel || null) === SB_SEL)); return; }
  if (b.id === 'skyPlay') { skyPlay(!SKY.playing); return; }
  if (b.closest('#skySpeed')) { SKY.speed = +d.v; $$('#skySpeed button').forEach(x => x.classList.toggle('on', x === b)); return; }
  if (b.closest('#skyMode')) { SKY.mode = d.v; SKY.trail = {}; $$('#skyMode button').forEach(x => x.classList.toggle('on', x === b)); skyDraw(true); return; }
  if (b.id === 'skyNow') { SKY.jd = nowJd(); SKY.trail = {}; SKY.lastJd = null; skySetup(); return; }
  if (b.closest('#learnSeg')) { LEARN.tab = d.v; render(); return; }
  if (d.tour != null) { S.tourStep = clamp(+d.tour, 0, (JC.tour || []).length - 1); saveS(); const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (d.quiz) { const [i, j] = d.quiz.split(':').map(Number), Q = LEARN.quiz; if (Q.done[i] == null) { Q.done[i] = j; if (Q.qs[i].opts[j].v === Q.qs[i].ans) Q.score++; const y = G.scrollY; render(); G.scrollTo(0, y); announce(Q.qs[i].opts[j].v === Q.qs[i].ans ? tr('right') : tr('wrong')); } return; }
  switch (d.act) {
    case 'addP': newForm(null); go('people'); setTimeout(() => $('#fName') && $('#fName').focus(), 30); return;
    case 'sample': addSample(); return;
    case 'openP': S.cur = d.id; SCRUB.min = 0; FORM = null; go('kundli', 'chart'); return;
    case 'editP': { const p = PROFILES.find(x => x.id === d.id); if (p) { newForm(p); go('people'); setTimeout(() => $('#fName') && $('#fName').focus(), 30); } return; }
    case 'dupP': { const p = PROFILES.find(x => x.id === d.id); if (p) { const q = JSON.parse(JSON.stringify(p)); q.id = 'p' + Date.now().toString(36); q.name += ' (2)'; PROFILES.push(q); saveP(); render(); toast(tr('saved')); } return; }
    case 'delP': { const p = PROFILES.find(x => x.id === d.id); if (p && confirm(tr('delQ') + '\n' + p.name)) { PROFILES = PROFILES.filter(x => x.id !== p.id); if (S.cur === p.id) S.cur = PROFILES[0] ? PROFILES[0].id : null; saveP(); saveS(); render(); toast(tr('deleted')); } return; }
    case 'shareP': { const p = PROFILES.find(x => x.id === d.id); if (!p) return; const link = shareLink(p); showDetail('🔗 ' + tr('shareTitle'), '<p class="sub">' + tr('shareNote') + '</p><div class="field"><label class="vh" for="shareUrl">URL</label><input id="shareUrl" readonly value="' + esc(link) + '"></div><div class="row"><button type="button" class="btn primary" data-act="copyShare">📋 ' + tr('copy') + '</button><button type="button" class="btn" data-act="exportP" data-id="' + p.id + '">📤 ' + tr('exportPerson') + '</button></div>', b); return; }
    case 'copyShare': { const i = $('#shareUrl'); i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).then(() => toast(tr('copied')), () => { try { document.execCommand('copy'); toast(tr('copied')); } catch (er) { } }); return; }
    case 'export': exportJson(); return;
    case 'cancelForm': { const ret = FORM && FORM.ret; FORM = null; if (ret) go('people', 'match'); else render(); return; }
    case 'acceptShare': PROFILES.push(SHARED); saveP(); S.cur = SHARED.id; SHARED = null; toast(tr('saved')); go('kundli', 'chart'); return;
    case 'ignoreShare': SHARED = null; render(); return;
    case 'scrubReset': scrubPlay(false); SCRUB.min = 0; scrubPaint(); return;
    case 'scrubUse': { const p = curP(); if (!p || !p.time) return; scrubPlay(false); const sh = shiftLocal(p.date, p.time, SCRUB.min); p.date = sh.date; p.time = sh.time.endsWith(':00') ? sh.time.slice(0, 5) : sh.time; SCRUB.min = 0; SCRUB.sensKey = ''; saveP(); QF.clear(); toast(tr('saved')); render(); return; }
    case 'vcmp': VS.cmp = !VS.cmp; render(); return;
    case 'dismissChange': CHANGE = null; render(); return;
    case 'newQuiz': LEARN.quiz = null; render(); return;
    case 'selftest': { const t0 = performance.now(); let rows = []; try { rows = JE.selfTest(); } catch (er) { rows = [{ case: 'error', field: er.message, ours: '', ref: '', diff: '', pass: false }]; } SELFTEST = { rows, ms: Math.round(performance.now() - t0) }; $('#stBox').innerHTML = selfTestHtml(); announce(rows.filter(x => x.pass).length + '/' + rows.length + ' ' + tr('passed')); return; }
    case 'print': doPrint(); return;
    case 'exportP': { const p = PROFILES.find(x => x.id === d.id); if (p) download(fileBaseFor(p) + '.json', JSON.stringify({ app: 'kundli-studio', version: 1, exported: new Date().toISOString(), profiles: [p] }, null, 1), 'application/json'); return; }
  }
}
function fillYoga(el) { const body = el.querySelector('.body'); if (body && !body.innerHTML) { const C = curChart(), y = C.yogas.find(x => x.id === el.dataset.yid); if (y) body.innerHTML = yogaBody(C, y); } }
function onInput(e) {
  const t = e.target, id = t.id;
  if (p2Input(e)) return;
  for (const f of MODS.input) if (f(e)) return;
  if (id === 'pSearch') { PF.q = t.value; rerenderKeep('pSearch'); return; }
  if (id === 'fCity') { citySearch(t.value); return; }
  if (id === 'scrubR') { if (SCRUB.playing) scrubPlay(false); scrubTo(+t.value); return; }
  if (id === 'ySearch') { YF.q = t.value; const C = curChart(), l = yogaList(C); $('#yList').innerHTML = yogaItems(C, l); $('#yCount').textContent = num(l.length) + ' ' + tr('found'); return; }
  if (id === 'glSearch') { LEARN.q = t.value; const q = fold(t.value), G2 = JC.glossary; const keys = Object.keys(G2).filter(k => !q || fold(k.replace(/_/g, ' ') + ' ' + G2[k].term.en + ' ' + G2[k].term.hi + ' ' + G2[k].def.en + ' ' + G2[k].def.hi).includes(q)).sort((a, b) => L(G2[a].term).localeCompare(L(G2[b].term))); $('#glList').innerHTML = glossItems(keys); return; }
  if (FORM && t.closest('#manualBox')) { readManual(); refreshTz(); return; }
}
function onChange(e) {
  const t = e.target, id = t.id;
  if (p2Change(e)) return;
  if (id === 'dsysSel') { S.dsys = t.value; DT.sys = null; saveS(); rerenderKeep('dsysSel'); return; }
  if (id === 'ayanSel') { setConv('ayan', t.value); return; }
  if (id.startsWith('eng_') || id.startsWith('engS_')) { const k = id.replace(/^engS?_/, ''); setEng(k, t.value); const y = G.scrollY; render(); G.scrollTo(0, y); if (id.startsWith('eng_')) { $('#options').classList.add('open'); const d = $('#options .engopt'); if (d) d.open = true; const n = $('#' + id); if (n) n.focus({ preventScroll: true }); } else { const n = $('#' + id); if (n) n.focus({ preventScroll: true }); } return; }
  if (id === 'houseSel') { setConv('houses', t.value); return; }
  if (id === 'devChk') { S.dev = t.checked; saveS(); render(); $('#options').classList.add('open'); return; }
  if (id === 'elderChk') { S.elder = t.checked; saveS(); render(); $('#options').classList.add('open'); return; }
  if (id === 'outerChk') { S.outer = t.checked; saveS(); render(); $('#options').classList.add('open'); return; }
  if (id === 'glyphChk') { S.glyphs = t.checked; saveS(); render(); $('#options').classList.add('open'); return; }
  for (const f of MODS.change) if (f(e)) return;
  if (id === 'vkSel') { S.varga = t.value; saveS(); const box = $('#mainChart'); if (box) { box.innerHTML = mainChartSvg(scrubChart(curChart()), true); applyZoom(); } return; }
  if (id === 'pSwitch') { S.cur = t.value; SCRUB.min = 0; saveS(); render(); return; }
  if (id === 'fDate') { FORM.date = t.value; refreshTz(); return; }
  if (id === 'fUnknown') { FORM.unknown = t.checked; $('#fTime').disabled = t.checked; $('#fSec').disabled = t.checked; return; }
  if (id === 'fManual') { readForm(); FORM.manual = t.checked; if (t.checked) { const pl = FORM.place; FORM.place = Object.assign({ manual: true }, pl || {}, { manual: true }); } $('#manualBox').innerHTML = manualHtml(); $('#placeBox').innerHTML = placeBoxHtml(); refreshTz(); return; }
  if (id === 'mIndia') { readManual(); $('#manualBox').innerHTML = manualHtml(); refreshTz(); return; }
  if (id === 'trDate') { if (t.value) { TRANSIT.date = t.value; trRefresh(); } return; }
  if (id === 'vA' || id === 'vB') { VS[id === 'vA' ? 'a' : 'b'] = t.value; const y = G.scrollY; render(); G.scrollTo(0, y); return; }
  if (id === 'yCat') { YF.cat = t.value; rerenderKeep('yCat'); return; }
  if (id === 'cmpAyan' || id === 'cmpNode' || id === 'cmpHouses') { CMP.ayan = $('#cmpAyan').value; CMP.node = $('#cmpNode').value; CMP.houses = $('#cmpHouses').value; rerenderKeep(id); return; }
  if (id === 'skyDate') { if (t.value) { const [y, m, d] = t.value.split('-').map(Number); SKY.jd = JE.julianDay(y, m, d, 12 - 5.5); SKY.trail = {}; SKY.lastJd = null; skyDraw(true); } return; }
  if (id === 'skyTrails') { SKY.trails = t.checked; if (!t.checked) SKY.trail = {}; skyDraw(true); return; }
  if (id === 'skyNatal') { SKY.natal = t.checked; skyDraw(true); return; }
  if (id === 'importFile') { if (t.files && t.files[0]) importJson(t.files[0]); return; }
}
function onKey(e) {
  const t = e.target;
  if (p2Key(e)) return;
  for (const f of MODS.key) if (f(e)) return;
  if (e.key === 'Escape') { if (!$('#pop').hidden) { hidePop(); return; } if ($('#sheet').classList.contains('open')) { closeSheet(); return; } const sg = $('#citySugg'); if (sg && !sg.classList.contains('hidden')) { sg.classList.add('hidden'); return; } const o = $('#options'); if (o.classList.contains('open')) { o.classList.remove('open'); $('#optBtn').setAttribute('aria-expanded', 'false'); $('#optBtn').focus(); } return; }
  if (t.id === 'fCity') {
    const sg = $('#citySugg'); if (!sg || sg.classList.contains('hidden')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); CITY_SEL = clamp(CITY_SEL + (e.key === 'ArrowDown' ? 1 : -1), 0, CITY_RES.length - 1); $$('#citySugg [role=option]').forEach((o, i) => o.setAttribute('aria-selected', i === CITY_SEL)); t.setAttribute('aria-activedescendant', 'cs' + CITY_SEL); const o = $('#cs' + CITY_SEL); o && o.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); pickCity(CITY_SEL >= 0 ? CITY_SEL : 0); }
    return;
  }
  const k = t.closest && t.closest('[data-k]');
  if (k && (e.key === 'Enter' || e.key === ' ') && k.tagName !== 'BUTTON') { e.preventDefault(); openKey(k.dataset.k, ctxOf(k), k); return; }
  if (k && k.closest('svg.chart') && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    const all = $$('[tabindex="0"][data-k]', k.closest('svg.chart')), i = all.indexOf(k);
    const n = all[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length]; if (n) { e.preventDefault(); n.focus(); }
  }
}
function bindChartGestures() {
  // pinch-zoom & drag-pan on the main chart (phones); ctrl+wheel zoom on desktop
  const ptr = new Map(); let base = null;
  document.addEventListener('pointerdown', e => { const w = e.target.closest && e.target.closest('#mainChart'); if (!w) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size === 2) { const v = [...ptr.values()]; base = { d: Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]), s: ZOOM.s }; } else if (ZOOM.s > 1) base = { x: e.clientX, y: e.clientY, ox: ZOOM.x, oy: ZOOM.y, pan: true }; });
  document.addEventListener('pointermove', e => {
    if (!ptr.has(e.pointerId) || !base) return; ptr.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptr.size === 2 && base.d) { const v = [...ptr.values()], d = Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]); ZOOM.s = clamp(base.s * d / base.d, 1, 4); if (ZOOM.s === 1) ZOOM.x = ZOOM.y = 0; applyZoom(); }
    else if (base.pan && ptr.size === 1) { const w = $('#mainChart'), lim = w ? w.clientWidth * (ZOOM.s - 1) / 2 : 200; ZOOM.x = clamp(base.ox + e.clientX - base.x, -lim, lim); ZOOM.y = clamp(base.oy + e.clientY - base.y, -lim, lim); applyZoom(); }
  });
  const end = e => { ptr.delete(e.pointerId); if (ptr.size < 2 && base && base.d) base = null; if (!ptr.size) base = null; };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  document.addEventListener('wheel', e => { const w = e.target.closest && e.target.closest('#mainChart'); if (!w || !e.ctrlKey) return; e.preventDefault(); ZOOM.s = clamp(ZOOM.s * Math.exp(-e.deltaY * 0.004), 1, 4); if (ZOOM.s === 1) ZOOM.x = ZOOM.y = 0; applyZoom(); }, { passive: false });
}

/* ---------------------------------------------------------------------
   23. Boot
   --------------------------------------------------------------------- */
let PRINT_HOOK = null, NO_SAVE = false;
// headless / link printing: #print=full|essentials&lang=en|hi&bw=1&bi=1&paper=a4|letter&share=<share-link data>
function parsePrintHook(h) {
  if (!/^#print=/.test(h)) return null;
  const q = {}; h.slice(1).split('&').forEach(kv => { const i = kv.indexOf('='); if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
  const prof = q.share ? parseShare(q.share) : null;
  return { preset: q.print === 'essentials' ? 'essentials' : 'full', lang: q.lang === 'hi' ? 'hi' : (q.lang === 'en' ? 'en' : null), bw: q.bw === '1', bi: q.bi === '1', paper: q.paper === 'letter' ? 'letter' : 'a4', style: q.style || null, profile: prof };
}
function boot() {
  const errs = [];
  try { performance.mark('ks-unpack-start'); } catch (e) { }
  const PK = G.KS_PACK || {}, MULTI = !!G.KS_LOADER;
  if (!JE && G.JE) JE = G.JE;
  if (!JE && PK.engine) { try { JE = unpack(PK.engine, 'JE'); G.JE = JE; } catch (e) { console.error('engine unpack failed', e); JE = null; } }
  if (!JE) { const be = $('#bootErr'); if (be) be.innerHTML = '<div class="banner err" role="alert">⚠️ The calculation engine could not be loaded. Please reload the page.<br>गणना इंजन लोड नहीं हो सका। कृपया पेज फिर से खोलें।</div>'; return; }
  if (!JC && G.JC) JC = G.JC;
  if (!JC && PK.content) { try { afterLoad('content'); } catch (e) { console.error('content unpack failed', e); JC = null; errs.push('contentErr'); } }
  if (!JC && !MULTI && !errs.includes('contentErr')) errs.push('contentErr');
  if (JC && PK.content2 && !JC.kootas) { try { JC = unpack(PK.content2, 'JC') || JC; G.JC = JC; } catch (e) { console.error('content2 unpack failed', e); } }
  if (!JE_CITIES && G.JE_CITIES) JE_CITIES = G.JE_CITIES;
  if (!JE_CITIES && !PK.cities && !MULTI) errs.push('citiesErr');
  const h = location.hash || '';
  PRINT_HOOK = parsePrintHook(h);
  if (PRINT_HOOK) {
    NO_SAVE = true; // a printed link never touches this browser's saved people or settings
    if (PRINT_HOOK.lang) S.lang = PRINT_HOOK.lang;
    if (PRINT_HOOK.style && ['north', 'south', 'east', 'western'].includes(PRINT_HOOK.style)) S.style = PRINT_HOOK.style;
    if (PRINT_HOOK.profile) { PROFILES = [PRINT_HOOK.profile]; S.cur = PRINT_HOOK.profile.id; } else loadState();
    S.view = 'more'; S.sub.more = 'print';
    document.documentElement.classList.add('ks-printmode');
  } else {
    loadState();
    if (h.startsWith('#share=')) { SHARED = parseShare(h.slice(7)); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } if (SHARED) S.view = 'people'; }
  }
  initMods();
  if (!S.cur && PROFILES.length) S.cur = PROFILES[0].id;
  { const [v2, s2] = mapView(S.view, S.sub[S.view]); S.view = v2; S.sub[v2] = s2; }
  if (S.view !== 'people' && !curP() && !((S.view === 'more' && ['muhurta', 'prashna'].includes(S.sub.more)) || (S.view === 'insights' && S.sub.insights === 'calendar'))) S.view = 'people';
  if (S.view === 'people' && !['list', 'family', 'match'].includes(S.sub.people)) S.sub.people = 'list';
  if (!['north', 'south', 'east', 'western'].includes(S.style)) S.style = 'north';
  if (!(S.ayan in JE.AYAN)) S.ayan = 'lahiri';
  try { performance.mark('ks-boot-start'); } catch (e) { }
  if (!JC && MULTI) { CONTENT_WAIT = true; need('content').then(() => { CONTENT_WAIT = false; QF.clear(); rerenderAt(); }, e => { console.error('content bundle failed', e); CONTENT_WAIT = false; $('#bootErr').innerHTML = loadErrCard('content'); rerenderAt(); }); }
  render();
  try { performance.mark('ks-first-render'); } catch (e) { }
  if (errs.length) $('#bootErr').innerHTML = errs.map(k => '<div class="banner err" role="alert">⚠️ ' + esc(T.en[k]) + '<br>' + esc(T.hi[k]) + '</div>').join('');
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', onKey);
  document.addEventListener('submit', e => { if (e.target.id === 'pForm') { e.preventDefault(); saveForm(); } });
  document.addEventListener('toggle', e => { const el = e.target; if (el.matches && el.matches('details[data-yid]') && el.open) { fillYoga(el); YF.open = el.dataset.yid; } }, true);
  $('#scrim').addEventListener('click', closeSheet);
  bindChartGestures();
  let rt = 0;
  G.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if ($('#tl')) drawTL(); if ($('#skyCv')) skySetup(); for (const f of MODS.after) try { f('resize'); } catch (e) { } }, 150); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (SKY.playing) skyPlay(false); if (SCRUB.playing) scrubPlay(false); if (TRANSIT.playing) trPlay(false); } });
  // SPEC J: browsers suggest document.title as the PDF file name → Name_DD-MM-YYYY_Place while printing
  G.addEventListener('beforeprint', () => { closeSheet(); hidePop(); if (TITLE_SAVED == null) setPrintTitle(titleForPrint()); });
  G.addEventListener('afterprint', restoreTitle);
  if (MULTI && !PRINT_HOOK) {
    // warm the city list in the background once the first screen is up (cached by the service worker)
    const idle = G.requestIdleCallback || (f => setTimeout(f, 1500));
    idle(() => { ensureCities(); });
    swInit();
  } else if (!MULTI && !IS_NODE && 'serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
    // single-file fallback build: drop a service worker left by the multi-file build so this page is never shadowed
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => { });
  }
}
function swInit() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const had = !!navigator.serviceWorker.controller;
  let shown = false;
  const offer = () => {
    if (shown) return; shown = true;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'updtoast'; b.id = 'updToast';
    b.textContent = '🔄 ' + tr('newVersion'); b.setAttribute('lang', S.lang);
    b.addEventListener('click', () => location.reload());
    document.body.appendChild(b);
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) offer(); else toast('✅ ' + tr('offlineReady')); });
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => { const w = reg.installing; if (w && had) w.addEventListener('statechange', () => { if (w.state === 'activated') offer(); }); });
    setInterval(() => reg.update().catch(() => { }), 60 * 60 * 1000);
  }).catch(e => console.warn('service worker not registered', e));
}
// view-specific post-render hooks
const _afterRender = afterRender;
afterRender = function () {
  _afterRender();
  if ($('#tl')) bindTL();
  if ($('#skyCv')) { skySetup(); bindSky(); }
  if (S.view === 'insights' && S.sub.insights === 'yogas' && YF.open) { const el = document.querySelector('[data-yid="' + YF.open + '"]'); if (el && el.open) fillYoga(el); }
  for (const f of MODS.after) { try { f('render'); } catch (e) { console.error(e); } }
};
/* ---------------------------------------------------------------------
   24. Module API (K): what print.js and app3.js may use
   --------------------------------------------------------------------- */
const K = {
  G, IS_NODE, S, DEF, TX, T, MODS, AFTER, ANIM, DT, TRANSIT, CP, MON, PL9, PL7, OUTER, VARGAS, SIGN_LORD, DASHA_ORDER, EXALT, OWN, DAY_MS, KARAKA_NAME, LEVEL_NAME, ZG, PG, DS_NAMES, DS_GROUPS,
  get JE() { return JE; }, get JC() { return JC; }, get PROFILES() { return PROFILES; }, get PRINT_HOOK() { return PRINT_HOOK; }, get CONTENT_WAIT() { return CONTENT_WAIT; },
  $, $$, esc, clamp, norm, nowJd, jdOfDate, raf1, pad2, hi, tr, L, num, fx, dms, hm, fmtDate, fmtTime, fmtDur, ord, todayStr, ymd, dUTC, addDays, addMonths, validDate,
  pab, pn, pnA, sgn, sgnA, sab, nkn, zg, pg, zgH, pgH, glyphsOn, digName, digCls, kName, pcol, gender, term, fact, lonStr, vDig, houseOf, signOfHouse, aspectsOf, aspectsGiven, aspectsReceived,
  P, optsFor, inputFor, computeChart, curChart, curP, profById, chartOf, chartModel, chartSVG, regionCenter, vargaTitle, provChips, provList, personLine, placeLabel, shiftLocal, ageAt,
  showDetail, openSheet, closeSheet, hidePop, toast, announce, render, rerenderAt, rerenderKeep, go, stopAnims, needChart, p3Loading, loadErrCard, need, have, initMods,
  drawTL, tlSelect, tlAnimate, dashaPathAt, periodCard, dsName, saveS, saveP, setEng, engControls,
  placePicker, defaultPlace, enginePlace, offsetOf, DEF_PLACE, ensureCities, download, saveIcs, icsBuild, copyText,
  safeName, clipName, dmyOf, cityOnly, fileBaseFor, matchFileBase, namedFile, setPrintTitle, restoreTitle, doPrint, titleForPrint,
  readingCards, secName, detailPlanet, detailHouse, planetFlags, isVargottama, nbRules, pointVal, pointRule, pointName, upaKeys, upaName, yogaName, yogaBody, rarityPill, isClassif, wbLabel,
  sadeSatiPeriods, computeIngresses, avTable, radarSvg, heatColor, digName2: digName, remName, REM, jcBlock, viewJaimini, dashaSys, compareCharts,
  addTX(o) { for (const k in o) { TX[k] = o[k]; T.en[k] = o[k][0]; T.hi[k] = o[k][1]; } },
  view(key, fn) { MODS.views[key] = fn; }, onClick(f) { MODS.click.push(f); }, onInput(f) { MODS.input.push(f); }, onChange(f) { MODS.change.push(f); }, onKey(f) { MODS.key.push(f); }, onAfter(f) { MODS.after.push(f); }
};
if (IS_NODE) {
  // node (tests): load the UI modules that the browser gets from the bundles
  const path = require('path');
  for (const m of ['print.js', 'app3.js', 'app4.js']) { try { require(path.join(__dirname, m)); } catch (e) { if (!/Cannot find module/.test(e.message)) throw e; } }
  initMods();
  module.exports = { K, renderView, viewPeople, AFTER, Inflate, utf8, b64bytes, unpack, TX, T, S, DEF, MODS, fmtDate, fmtDur, dms, hm, num, fold, esc, chartModel, chartSVG, shiftLocal, vDig, compareCharts, changeSummary, makeQuiz, computeIngresses, tlTicks, dashaSys, dashaPathAt, aspectsOf, aspectsGiven, aspectsReceived, detailPlanet, detailHouse, periodCard, yogaBody, viewMatch, viewFamily, viewMuhurta, viewCalendar, famCompute, famPeople, calCompute, calFiltered, muResults, muMonth, MU, CAL, MT, FAM, icsBuild, matchShareText, muShareText, computeMatch, detailKoota, detailPorutham, calEventDetail, eclipseCard, famHelpDetail, engControls, setEng, optsFor, gaugeSvg, kootaVal, safeName, clipName, fileBaseFor, matchFileBase, namedFile, dmyOf, sgn, pn, sgnA, pnA, regionCenter, mapView, initMods, have, setJC: j => { JC = j; }, setCities: c => { JE_CITIES = c; }, setProfiles: (p, cur) => { PROFILES = p; S.cur = cur; } };
} else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof window !== 'undefined' ? window : globalThis);
