// Crawls the web part test build and captures a clickable prototype: every screen
// state reachable by one click from each dashboard view (and up to three clicks inside
// pop-ups such as Filter), with the box of every clickable control and where it leads.
// Output: presentations/prototype2/<state>.jpg and graph.json
// Needs: node sharepoint-webpart-react/test/build-test-page.js
const { chromium } = require('playwright');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '../sharepoint-webpart-react/test/out/index.html');
const OUT = path.join(__dirname, 'prototype2');
fs.mkdirSync(OUT, { recursive: true });
const W = 2560, H = 1440, STEP = 1000;

// Dashboard views: a dashboard with one card open. Every view is cut into screens by scroll position.
const CONFIGS = {
  bw_sites: { q: '?imp=1&ts=standard', card: null }, bw_users: { q: '?imp=1&ts=standard', card: 'EDRMS users' },
  bw_docs: { q: '?imp=1&ts=standard', card: 'Documents in EDRMS' }, bw_rec: { q: '?imp=1&ts=standard', card: 'Records declared in EDRMS' },
  dp_sites: { q: '?d=dp&imp=1&ts=standard', card: null }, dp_visitors: { q: '?d=dp&imp=1&ts=standard', card: /SITE VISITORS/i },
  dp_docs: { q: '?d=dp&imp=1&ts=standard', card: /^\s*DOCUMENTS/i }, dp_rec: { q: '?d=dp&imp=1&ts=standard', card: /RECORDS DECLARED/i },
  dp_phys: { q: '?d=dp&imp=1&ts=standard', card: /PHYSICAL COUNTERPARTS/i }
};
const CARD_TO_CONFIG = { 'Active EDRMS sites': 'bw_sites', 'EDRMS users': 'bw_users', 'Documents in EDRMS': 'bw_docs', 'Records declared in EDRMS': 'bw_rec',
  'SITES': 'dp_sites', 'SITE VISITORS': 'dp_visitors', 'DOCUMENTS': 'dp_docs', 'RECORDS DECLARED': 'dp_rec', 'PHYSICAL COUNTERPARTS': 'dp_phys' };

// In-page: list the clickable controls on screen, each with a stable key.
const ENUM = (onlyPopups) => {
  const POP = '.fPop, .cgOpts, .xMenu, .ms-Callout, .ms-Dropdown-callout, .impPanel, .cgPop';
  const sel = 'button, [role=button], [role=option], [role=menuitem], [role=checkbox], th, .kpi, .nav, tbody tr, .hbar, .rankRow, .cgPick, .ms-Dropdown, .picker, input[type=search], .search input, .ms-Checkbox, .ms-Dropdown-item, a, .bar, rect[style*="cursor"], g[style*="cursor"], .cmpH > *, .go';
  const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return null; if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null; return r; };
  const out = [], seen = new Map();
  const all = [...document.querySelectorAll(sel)];
  const popups = [...document.querySelectorAll(POP)].filter(p => vis(p));
  for (const el of all) {
    if (el.closest('#__cur')) continue;
    const inPop = popups.some(p => p.contains(el));
    if (onlyPopups && !inPop) continue;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
    if (el.matches('a') && el.getAttribute('href') && el.getAttribute('href') !== '#') continue; // external links
    // skip a control nested in another listed control (keep the outer one), except inputs
    const outer = el.parentElement && el.parentElement.closest(sel);
    if (outer && !el.matches('input') && !outer.matches('tbody tr') && all.includes(outer) && outer !== el && !outer.matches('.ms-Dropdown')) continue;
    const r = vis(el); if (!r) continue;
    const cs = getComputedStyle(el);
    const clickable = el.matches('button, input, th, .kpi, .nav, .cgPick, .ms-Dropdown, .picker, .ms-Checkbox, [role]') || cs.cursor === 'pointer';
    if (!clickable) continue;
    if (el.matches('.nav.future')) continue;
    const txt = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 50);
    if (/Export table|Download Excel template/.test(txt)) continue; // downloads: no screen change
    const sig = el.tagName + '|' + (el.className && el.className.baseVal === undefined ? String(el.className).split(' ').slice(0, 2).join('.') : '') + '|' + txt;
    const n = (seen.get(sig) || 0); seen.set(sig, n + 1);
    out.push({ key: sig + '#' + n, text: txt, x: r.left, y: r.top, w: r.width, h: r.height, input: el.matches('input'), card: el.matches('.kpi'), nav: el.matches('.nav'), inPop,
      ph: el.getAttribute('placeholder') || '' });
  }
  return out;
};

const states = {};   // id -> { file, hash, frameOf, items: [{...box, target}] , up, down, back }
const byHash = {};
let counter = 0;

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1920 / 2560, acceptDownloads: true });
  const page = await ctx.newPage();

  const load = async cfg => {
    const c = CONFIGS[cfg];
    await page.goto(PAGE + c.q); await page.waitForTimeout(700);
    if (c.card) { await page.locator('.kpi', { hasText: c.card }).first().click(); await page.waitForTimeout(350); }
  };
  const scroll = async y => { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(250); };
  const act = async (key, popOnly) => {
    const items = await page.evaluate(ENUM, popOnly);
    const it = items.find(i => i.key === key);
    if (!it) return false;
    if (it.input) {
      await page.mouse.click(it.x + it.w / 2, it.y + it.h / 2);
      const t = /site or owner/i.test(it.ph) ? 'Admin' : /library/i.test(it.ph) ? 'Annual' : /site/i.test(it.ph) ? 'ITD' : /categ|sub|group|search/i.test(it.ph) && !/department/i.test(it.ph) ? 'R' : 'SA';
      await page.keyboard.type(t);
    } else {
      await page.mouse.click(it.x + Math.min(it.w / 2, 40), it.y + it.h / 2);
    }
    await page.waitForTimeout(450);
    return true;
  };
  const capture = async (meta) => {
    await page.mouse.move(-5, -5);
    const buf = await page.screenshot({ type: 'jpeg', quality: 82 });
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    if (byHash[hash]) return { id: byHash[hash], fresh: false };
    const id = 's' + String(++counter).padStart(3, '0');
    fs.writeFileSync(path.join(OUT, id + '.jpg'), buf);
    const items = await page.evaluate(ENUM, false);
    const popOpen = items.some(i => i.inPop);
    states[id] = Object.assign({ file: id + '.jpg', items, popOpen }, meta);
    byHash[hash] = id;
    return { id, fresh: true };
  };

  // 1) every view, every scroll position
  const frames = {};
  for (const cfg of Object.keys(CONFIGS)) {
    await load(cfg);
    // screens start at section bands and panels, so a card and its table are not cut in half
    const uniq = await page.evaluate(Hh => {
      // a new screen starts wherever a panel or band would otherwise be cut off at the bottom
      const max = Math.max(0, document.documentElement.scrollHeight - Hh);
      const els = [...document.querySelectorAll('.band, .panel')].filter(e => !e.parentElement.closest('.panel'))
        .map(e => { const r = e.getBoundingClientRect(); return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY }; })
        .sort((x, y) => x.top - y.top);
      const ys = [0];
      for (const e of els) {
        const cur = ys[ys.length - 1];
        if (e.bottom <= cur + Hh) continue;
        const y = Math.min(Math.max(0, Math.round(e.top - 4)), max);
        if (y > cur) ys.push(y);
      }
      if (max > ys[ys.length - 1]) { const last = ys[ys.length - 1]; if (max - last > 150) ys.push(max); }
      return ys;
    }, H);
    frames[cfg] = [];
    for (const y of uniq) {
      await scroll(y);
      const r = await capture({ cfg, y, base: true });
      frames[cfg].push(r.id);
    }
    frames[cfg].forEach((id, i) => { states[id].up = frames[cfg][i - 1] || null; states[id].down = frames[cfg][i + 1] || null; });
    console.log('view', cfg, frames[cfg].length, 'screens');
  }

  // 2) one click from each screen; inside pop-ups, up to three clicks
  const explore = async (baseId, pathKeys, depth) => {
    const st = states[baseId];
    let popCount = 0;
    for (const it of st.items) {
      if (depth > 0 && it.inPop && ++popCount > 8) continue;   // first 8 options in a pop-up list
      if (it.target !== undefined) continue;
      if (depth > 0 && !it.inPop) continue;          // inside a pop-up only its own controls are explored
      if (it.card) {
        const k = Object.keys(CARD_TO_CONFIG).find(c => it.text.toUpperCase().startsWith(c.toUpperCase()));
        const cfgDash = st.cfg.slice(0, 2);
        const cand = Object.entries(CARD_TO_CONFIG).filter(([c, v]) => v.startsWith(cfgDash) && it.text.toUpperCase().startsWith(c.toUpperCase()));
        if (cand.length) { it.target = frames[cand.sort((a, b) => b[0].length - a[0].length)[0][1]][0]; continue; }
      }
      if (it.nav) { it.target = /Department/.test(it.text) ? frames.dp_sites[0] : frames.bw_sites[0]; continue; }
      try {
        await load(st.cfg); await scroll(st.y);
        let ok = true;
        for (const [k, pop] of pathKeys) { ok = ok && await act(k, pop); }
        ok = ok && await act(it.key, depth > 0);
        if (!ok) { it.target = null; continue; }
        const dash = await page.evaluate(() => document.querySelector('.dash-dp') ? 'dp' : 'bw');
        if (dash !== st.cfg.slice(0, 2)) await scroll(0);
        const r = await capture({ cfg: st.cfg, y: st.y, from: baseId, via: it.key, depth: depth + 1 });
        it.target = r.id;
        if (r.fresh && states[r.id].popOpen && depth < 3) {
          states[r.id].back = st.base ? baseId : (st.back || baseId);
          await explore(r.id, pathKeys.concat([[it.key, depth > 0]]), depth + 1);
        }
      } catch (e) { it.target = null; console.log('  skip', it.text, e.message.split('\n')[0]); }
    }
  };
  for (const cfg of Object.keys(CONFIGS)) for (const id of frames[cfg]) { await explore(id, [], 0); console.log('explored', id, Object.keys(states).length, 'states'); }

  // 3) controls on derived screens: same control as on the screen they came from leads to the same place,
  //    and the control that made the screen toggles back.
  for (const st of Object.values(states)) {
    if (st.base) continue;
    const src = states[st.from];
    for (const it of st.items) {
      if (it.target !== undefined) continue;
      if (it.key === st.via) { it.target = st.from; continue; }
      const same = src.items.find(s => s.key === it.key && s.target);
      it.target = same ? same.target : null;
    }
    if (!st.popOpen) { st.up = states[st.from].up; st.down = states[st.from].down; }
  }
  const graph = { start: frames.bw_sites[0], frames, states: Object.fromEntries(Object.entries(states).map(([k, v]) => [k, {
    file: v.file, up: v.up || null, down: v.down || null, back: v.back || null, popOpen: v.popOpen,
    hot: v.items.filter(i => i.target && i.target !== k).map(i => ({ name: i.text || i.key, target: i.target, x: i.x / W, y: i.y / H, w: i.w / W, h: i.h / H, pop: i.inPop })) }])) };
  fs.writeFileSync(path.join(OUT, 'graph.json'), JSON.stringify(graph, null, 1));
  console.log('DONE states', Object.keys(states).length);
  await b.close();
})();
