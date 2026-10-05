/* ===================================================================
   sync-from-floot.js

   Makes index.html exactly what the Floot app shows.

   The Floot app (edrms-reporting-suite.floot.app) loads a copy of this
   prototype and applies its own patches in the browser, then renders the
   result in an iframe. This script opens the live app, unlocks it, reads
   that finished iframe document, adds floot-wrapper.html (the same 1920px
   scaled canvas and one time password gate the Floot app has) and writes
   it over index.html.

   Run by .github/workflows/sync-from-floot.yml, which then runs
   check-dashboard.js and only publishes if it passes.

   Usage: node sync-from-floot.js [out.html]
   =================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const FLOOT_URL = process.env.FLOOT_URL || 'https://edrms-reporting-suite.floot.app/';
const PASSWORD = 'adb';
const out = process.argv[2] || path.join(__dirname, 'index.html');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(FLOOT_URL, { waitUntil: 'networkidle', timeout: 120000 });

  const gate = page.locator('input[type="password"]');
  if (await gate.count()) {
    await gate.fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
  }

  const frame = page.locator('iframe[title="EDRMS Reporting Suite"]');
  await frame.waitFor({ timeout: 120000 });
  const html = await frame.evaluate(f => f.srcdoc);
  await browser.close();

  if (!html || !html.includes('id="nav"') || !html.includes('id="view"') || !html.includes('</body>')) {
    console.error('The Floot app did not return a complete report. Nothing was written.');
    process.exit(1);
  }

  // Files the report loads from Floot's own server (the ADB logo) do not
  // exist on GitHub Pages, so keep a copy in floot-assets/ and point at it.
  let page_ = html;
  const cdn = [...new Set(html.match(/\/_cdn\/[^"')\s]+/g) || [])];
  if (cdn.length) fs.mkdirSync(path.join(__dirname, 'floot-assets'), { recursive: true });
  for (const ref of cdn) {
    const res = await fetch(new URL(ref, FLOOT_URL));
    if (!res.ok) throw new Error('Could not download ' + ref + ': HTTP ' + res.status);
    const name = path.basename(ref);
    fs.writeFileSync(path.join(__dirname, 'floot-assets', name), Buffer.from(await res.arrayBuffer()));
    page_ = page_.split(ref).join('floot-assets/' + name);
    console.log('Copied ' + ref + ' to floot-assets/' + name);
  }

  const wrapper = fs.readFileSync(path.join(__dirname, 'floot-wrapper.html'), 'utf8');
  const i = page_.lastIndexOf('</body>');
  const result = page_.slice(0, i) + wrapper + page_.slice(i);
  fs.writeFileSync(out, result);
  console.log('Wrote ' + out + ' (' + result.length + ' characters) from ' + FLOOT_URL);
})().catch(e => { console.error(e); process.exit(1); });
