// Captures every screen state of the web part for a clickable PowerPoint prototype:
// one full-page screenshot per state, plus the exact box of each clickable part and
// the state it leads to. Output: presentations/prototype/<state>.png and states.json.
// Needs the test build: node sharepoint-webpart-react/test/build-test-page.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '../sharepoint-webpart-react/test/out/index.html');
const OUT = path.join(__dirname, 'prototype');
fs.mkdirSync(OUT, { recursive: true });
const W = 1600, H = 900;

const panel = (p, t) => p.locator('.panel', { hasText: t }).first();
const kpi = (p, t) => p.locator('.kpi', { hasText: t }).first();
const sitesPanel = p => panel(p, 'Top 10 by number of sites');
const ROW_CODES = ['CWRD', 'EARD', 'ERO', 'FIN', 'HRD', 'INRM', 'ITD', 'NARO', 'OGC', 'OSFG'];
const scrollToBand = async (p, title) => {
  await p.evaluate(t => { const b = [...document.querySelectorAll('.band')].find(x => x.innerText.indexOf(t) === 0); window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 10); }, title);
  await p.waitForTimeout(400);
};
const openCard = async (p, t) => { await kpi(p, t).click(); await p.waitForTimeout(400); };
const diCard = async (p, re) => { await p.locator('.dash-dp .kpi', { hasText: re }).first().click(); await p.waitForTimeout(400); };

// Hotspot groups: [description, locator fn, target state]
const NAV = [
  ['Bank-wide Oversight', p => p.locator('.nav', { hasText: 'Bank-wide Oversight' }), 'bw_sites'],
  ['Department Insights', p => p.locator('.nav', { hasText: 'Department Insights' }), 'di_top']
];
const BW_TOP = [
  ...NAV,
  ['Active EDRMS sites card', p => kpi(p, 'Active EDRMS sites'), 'bw_sites'],
  ['EDRMS users card', p => kpi(p, 'EDRMS users'), 'bw_users'],
  ['Documents card', p => kpi(p, 'Documents in EDRMS'), 'bw_docs'],
  ['Records card', p => kpi(p, 'Records declared in EDRMS'), 'bw_rec'],
  ['Menu button', p => p.locator('.menuBtn'), 'bw_menu_closed'],
  ['Export', p => p.locator('.pdfBtn:not(.impOpen)'), 'bw_export'],
  ['Import data', p => p.locator('.impOpen'), 'bw_import']
];
const SITES = [
  ['Filter', p => sitesPanel(p).locator('.fBtn'), 'bw_filter'],
  ['Next page', p => sitesPanel(p).locator('.pager button', { hasText: 'Next' }), 'bw_sites_p2'],
  ['Sort by Sites', p => sitesPanel(p).locator('th', { hasText: 'Sites' }), 'bw_sites_sorted'],
  ...ROW_CODES.map(c => ['Open ' + c, p => sitesPanel(p).locator('tbody tr', { has: p.locator('.dn, td:first-child *', { hasText: new RegExp('^' + c + '$') }) }).locator('td').first(), 'di_' + c])
];
const DI_TOP = [
  ...NAV,
  ['Sites card', p => p.locator('.dash-dp .kpi', { hasText: /^\s*SITES/i }), 'di_top'],
  ['Site visitors card', p => p.locator('.dash-dp .kpi', { hasText: /SITE VISITORS/i }), 'di_visitors'],
  ['Documents card', p => p.locator('.dash-dp .kpi', { hasText: /^\s*DOCUMENTS/i }), 'di_docs'],
  ['Records card', p => p.locator('.dash-dp .kpi', { hasText: /RECORDS DECLARED/i }), 'di_rec'],
  ['Physical card', p => p.locator('.dash-dp .kpi', { hasText: /PHYSICAL COUNTERPARTS/i }), 'di_phys'],
  ['Category box', p => p.locator('.dash-dp .cgPick').first(), 'di_cat']
];

// state: { q, setup(p), hot: [...], down: next state (scroll down button), up: previous state, back: whole-page click target }
const S = {
  bw_sites: { setup: async () => {}, hot: [...BW_TOP, ...SITES], down: 'bw_phys' },
  bw_users: { setup: async p => openCard(p, 'EDRMS users'), hot: BW_TOP, down: 'bw_phys' },
  bw_docs: { setup: async p => openCard(p, 'Documents in EDRMS'), hot: BW_TOP, down: 'bw_phys' },
  bw_rec: { setup: async p => openCard(p, 'Records declared in EDRMS'), hot: BW_TOP, down: 'bw_phys' },
  bw_menu_closed: { setup: async p => { await p.locator('.menuBtn').click(); await p.waitForTimeout(400); }, hot: [['Menu button', p => p.locator('.menuBtn'), 'bw_sites']] },
  bw_export: { setup: async p => { await p.locator('.pdfBtn:not(.impOpen)').click(); await p.waitForTimeout(300); }, hot: [], back: 'bw_sites' },
  bw_import: { setup: async p => { await p.locator('.impOpen').click(); await p.waitForTimeout(400); }, hot: [['Close', p => p.locator('.impX'), 'bw_sites']] },
  bw_filter: { setup: async p => { await sitesPanel(p).locator('.fBtn').click(); await p.waitForTimeout(400); },
    hot: [['Category box', p => p.locator('.fPop .cgPick').first(), 'bw_filter_cat'], ['Apply', p => p.locator('.fBtns >> text=Apply'), 'bw_sites'], ['Reset', p => p.locator('.fBtns >> text=Reset'), 'bw_sites']] },
  bw_filter_cat: { setup: async p => { await sitesPanel(p).locator('.fBtn').click(); await p.waitForTimeout(300); await p.locator('.fPop .cgPick').first().click(); await p.waitForTimeout(400); },
    hot: [['RM', p => p.locator('.cgOpts .ms-Checkbox', { hasText: 'RM' }).first(), 'bw_filter_rm']] },
  bw_filter_rm: { setup: async p => { await sitesPanel(p).locator('.fBtn').click(); await p.waitForTimeout(300); await p.locator('.fPop .cgPick').first().click(); await p.waitForTimeout(300); await p.locator('.cgOpts .ms-Checkbox', { hasText: 'RM' }).first().click(); await p.keyboard.press('Escape'); await p.waitForTimeout(300); },
    hot: [['Apply', p => p.locator('.fBtns >> text=Apply'), 'bw_sites_rm'], ['Reset', p => p.locator('.fBtns >> text=Reset'), 'bw_sites']] },
  bw_sites_rm: { setup: async p => { await sitesPanel(p).locator('.fBtn').click(); await p.waitForTimeout(300); await p.locator('.fPop .cgPick').first().click(); await p.waitForTimeout(300); await p.locator('.cgOpts .ms-Checkbox', { hasText: 'RM' }).first().click(); await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.locator('.fBtns >> text=Apply').click(); await p.waitForTimeout(400); },
    hot: [...BW_TOP, ['Filter', p => sitesPanel(p).locator('.fBtn'), 'bw_sites']] },
  bw_sites_p2: { setup: async p => { await sitesPanel(p).locator('.pager button', { hasText: 'Next' }).click(); await p.waitForTimeout(400); },
    hot: [...BW_TOP, ['Page 1', p => sitesPanel(p).locator('.pager button', { hasText: /^1$/ }), 'bw_sites'], ['Prev', p => sitesPanel(p).locator('.pager button', { hasText: 'Prev' }), 'bw_sites']] },
  bw_sites_sorted: { setup: async p => { await sitesPanel(p).locator('th', { hasText: 'Sites' }).click(); await p.waitForTimeout(400); },
    hot: [...BW_TOP, ['Sort by Sites', p => sitesPanel(p).locator('th', { hasText: 'Sites' }), 'bw_sites']] },
  bw_phys: { setup: async p => scrollToBand(p, 'Physical counterparts'), hot: NAV, up: 'bw_sites', down: 'bw_cmp' },
  bw_cmp: { setup: async p => scrollToBand(p, 'Comparison'), hot: NAV, up: 'bw_phys', down: 'bw_trend' },
  bw_trend: { setup: async p => scrollToBand(p, 'Records declaration trend'), hot: NAV, up: 'bw_cmp' },
  di_top: { q: '?d=dp', setup: async () => {}, hot: DI_TOP, down: 'di_lib' },
  di_visitors: { q: '?d=dp', setup: async p => diCard(p, /SITE VISITORS/i), hot: DI_TOP, down: 'di_lib' },
  di_docs: { q: '?d=dp', setup: async p => diCard(p, /^\s*DOCUMENTS/i), hot: DI_TOP, down: 'di_lib' },
  di_rec: { q: '?d=dp', setup: async p => diCard(p, /RECORDS DECLARED/i), hot: DI_TOP, down: 'di_lib' },
  di_phys: { q: '?d=dp', setup: async p => diCard(p, /PHYSICAL COUNTERPARTS/i), hot: DI_TOP, down: 'di_lib' },
  di_cat: { q: '?d=dp', setup: async p => { await p.locator('.dash-dp .cgPick').first().click(); await p.waitForTimeout(400); }, hot: [], back: 'di_top' },
  di_lib: { q: '?d=dp', setup: async p => scrollToBand(p, 'Library usage'), hot: NAV, up: 'di_top' }
};
// Department Insights opened from a code in the Sites table
for (const c of ROW_CODES) {
  S['di_' + c] = { setup: async p => { await sitesPanel(p).locator('tbody tr', { has: p.locator('.dn, td:first-child *', { hasText: new RegExp('^' + c + '$') }) }).locator('td').first().click(); await p.waitForTimeout(700); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300); }, hot: DI_TOP, down: 'di_lib' };
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const out = {};
  for (const [id, st] of Object.entries(S)) {
    const p = await b.newPage({ viewport: { width: W, height: H } });
    try {
      await p.goto(PAGE + (st.q || '?imp=1').replace('?d=dp', '?d=dp&imp=1'));
      await p.waitForTimeout(900);
      await st.setup(p);
      await p.mouse.move(-10, -10);
      await p.screenshot({ path: path.join(OUT, id + '.png') });
      const hot = [];
      for (const [name, loc, target] of st.hot) {
        const l = loc(p).first();
        if (!(await l.count())) { console.log('  missing', id, name); continue; }
        const bb = await l.boundingBox();
        if (!bb || bb.y + bb.height < 0 || bb.y > H || bb.width < 2) continue; // off screen
        hot.push({ name, target, x: bb.x / W, y: bb.y / H, w: bb.width / W, h: bb.height / H });
      }
      out[id] = { hot, up: st.up || null, down: st.down || null, back: st.back || null };
      console.log('OK', id, hot.length);
    } catch (e) {
      console.log('FAIL', id, e.message.split('\n')[0]);
    }
    await p.close();
  }
  fs.writeFileSync(path.join(OUT, 'states.json'), JSON.stringify(out, null, 1));
  await b.close();
})();
