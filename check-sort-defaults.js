/* ===================================================================
   check-sort-defaults.js

   Asserts that every sortable table in the prototype opens sorted on
   its FIRST column. Client instruction, 27 Aug 2026.

   Why this exists as its own check: a wrong default sort is invisible.
   The page renders, every test passes, and the only symptom is a blue
   marker sitting over the wrong heading. grep cannot see it either,
   because the defaults live in one file and the column order in
   another part of the same file, and nothing ties them together. The
   only way to know is to mount each table and look at which header
   carries the .on class.

   It walks all six dashboards, clicks every tile that opens a drill,
   and checks each .dhead it finds.

   Usage: node check-sort-defaults.js [path/to/index.html]
   =================================================================== */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SRC = process.argv[2] || path.join(__dirname, 'index.html');

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!fs.existsSync(root)) return undefined;
  const dirs = fs.readdirSync(root).filter(d => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const d of dirs) {
    const bin = path.join(root, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(bin)) return bin;
  }
}

const KEYS = ['bw', 'dp', 'pj', 'fp', 'rd', 'ra'];

/* Reads every SORTABLE table on screen and reports which header carries .on.
   A header is sortable only if it carries data-s; the prototype also uses
   .dhead for static tables (the project lists, and the File Plan, Project
   Insights and Holdings tables), and those have no sort state to get wrong. */
const SCAN = () => [...document.querySelectorAll('.dhead')].map(h => {
  const hds = [...h.querySelectorAll('.hd')];
  if (!hds.some(x => x.hasAttribute('data-s'))) return null;
  const label = t => (t || '').replace(/[\u2191\u2193]/g, '').trim().replace(/\s+/g, ' ');
  const labels = hds.map(x => label(x.textContent));
  const on = hds.findIndex(x => x.classList.contains('on'));
  return {
    cols: hds.length,
    onIndex: on,
    first: labels[0].slice(0, 34),
    /* the full column list is the table's identity: several drills share a
       first column and a column count, and would otherwise dedupe together */
    sig: labels.join('|'),
    onLabel: on >= 0 ? labels[on].slice(0, 34) : '(none highlighted)'
  };
}).filter(Boolean);

(async () => {
  const browser = await chromium.launch({ executablePath: findChromium() });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + SRC, { waitUntil: 'load' });

  const seen = new Set();
  const fails = [];
  let checked = 0;

  for (const key of KEYS) {
    await page.evaluate(k => switchTo(k), key);

    /* Tiles reveal the drills, so open each one before scanning. The landing
       state is scanned first, since some tables are on the screen already. */
    const tiles = await page.evaluate(() => document.querySelectorAll('#view .kpi').length);
    for (let i = -1; i < tiles; i++) {
      if (i >= 0) {
        await page.evaluate(n => {
          const t = document.querySelectorAll('#view .kpi')[n];
          if (t) t.click();
        }, i);
      }
      const tables = await page.evaluate(SCAN);
      for (const t of tables) {
        const id = key + '|' + t.sig;
        if (seen.has(id)) continue;
        seen.add(id); checked++;
        const ok = t.onIndex === 0;
        if (!ok) fails.push(`${key}: "${t.first}" table is sorted on "${t.onLabel}" (column ${t.onIndex + 1} of ${t.cols})`);
        console.log(`  ${ok ? '✅' : '❌'} ${key.padEnd(3)} ${t.first.padEnd(36)} sorted on: ${t.onLabel}`);
      }
    }
  }

  await browser.close();
  console.log('\n' + '='.repeat(64));
  console.log(`Tables checked: ${checked}`);
  if (errors.length) { console.error('Page errors:'); errors.forEach(e => console.error('  ' + e)); }
  if (fails.length || errors.length) {
    console.error(`❌ FAILED: ${fails.length} table(s) not sorted on their first column`);
    fails.forEach(f => console.error('  ' + f));
    process.exit(1);
  }
  console.log('✅ Every sortable table opens sorted on its first column');
})();
