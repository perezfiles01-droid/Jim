#!/usr/bin/env node
/*
 * Generic structural verification for the EDRMS Reporting Suite prototype.
 *
 * These are the checks that apply to every dashboard and that are easy to break
 * by accident: console errors (which is also how a failed reconciliation
 * console.assert surfaces), duplicate element ids, em dashes in visible text,
 * horizontal overflow, and more than one dashboard section mounted at once.
 *
 * It discovers dashboards from the nav, so it keeps working as new ones are
 * added without needing an edit here.
 *
 * Run it, then add assertions specific to whatever you built. This script is a
 * floor, not a substitute for checking the numbers a stakeholder would notice.
 *
 *   cd /tmp && npm i playwright-core
 *   node verify.js /home/user/Jim/EDRMS_Reporting_Suite_Integrated_v1.html
 */
const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (!target) {
  console.error('usage: node verify.js <path-to-html>');
  process.exit(2);
}
const abs = path.resolve(target);
if (!fs.existsSync(abs)) {
  console.error('not found: ' + abs);
  process.exit(2);
}

// playwright-core is installed ad hoc; resolve it from wherever npm put it.
let chromium;
for (const base of [process.cwd(), '/tmp', process.env.HOME || '']) {
  try {
    ({ chromium } = require(require.resolve('playwright-core', { paths: [base] })));
    break;
  } catch (e) { /* keep looking */ }
}
if (!chromium) {
  console.error('playwright-core not found. Run:  cd /tmp && npm i playwright-core');
  process.exit(2);
}

// The image ships Chromium already; never download one.
const CANDIDATES = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
];
const exec = CANDIDATES.find(p => fs.existsSync(p));
if (!exec) {
  const found = fs.existsSync('/opt/pw-browsers') ? fs.readdirSync('/opt/pw-browsers').join(', ') : 'none';
  console.error('no chromium binary found. /opt/pw-browsers contains: ' + found);
  process.exit(2);
}

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  pass  ' + name); }
  else {
    fail++; failures.push(name + (detail ? ' -> ' + detail : ''));
    console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : ''));
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: exec });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  const consoleErrors = [];
  page.on('console', m => {
    // console.assert surfaces here too, which is how a broken reconciliation
    // between dashboards announces itself.
    if (m.type() === 'error' || m.type() === 'assert') consoleErrors.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', e => consoleErrors.push('[pageerror] ' + e.message));

  await page.goto('file://' + abs);
  await page.waitForTimeout(500);

  console.log('\nShell');
  const keys = await page.locator('#nav a[data-d]').evaluateAll(as => as.map(a => a.dataset.d));
  check('at least one dashboard in the nav', keys.length > 0, String(keys.length));
  console.log('  dashboards found: ' + keys.join(', '));
  check('a dashboard is mounted on load', await page.locator('#view section').count() === 1);
  check('header breadcrumb populated', ((await page.locator('#crumb-b').textContent()) || '').trim().length > 0);
  check('data-as-of populated', ((await page.locator('#asof').textContent()) || '').trim().length > 0);

  for (const key of keys) {
    console.log('\nDashboard: ' + key);
    await page.click(`#nav a[data-d="${key}"]`);
    await page.waitForTimeout(450);

    check('nav row marked active', await page.locator(`#nav a[data-d="${key}"].on`).count() === 1);
    check('exactly one section mounted', await page.locator('#view section').count() === 1,
      String(await page.locator('#view section').count()));
    check('section carries a .dash- scope class',
      await page.locator('#view section[class^="dash-"]').count() === 1);
    check('sidebar subtitle populated', ((await page.locator('#side-ver').textContent()) || '').trim().length > 0);

    // Duplicate ids are the failure mode that scoped-CSS-plus-shared-ids would
    // cause if two dashboards were ever mounted together.
    const dupes = await page.evaluate(() => {
      const seen = new Set(), dup = [];
      document.querySelectorAll('[id]').forEach(el => {
        if (seen.has(el.id)) dup.push(el.id); else seen.add(el.id);
      });
      return dup;
    });
    check('no duplicate element ids', dupes.length === 0, dupes.join(', '));

    // Em dash check must run per dashboard: a page-level check passes or fails
    // depending on which one happens to be mounted.
    const em = await page.evaluate(() => {
      const hits = [];
      if (document.body.innerText.includes('—')) hits.push('visible text');
      document.querySelectorAll('option').forEach(o => {
        if (o.textContent.includes('—')) hits.push('option "' + o.textContent.trim() + '"');
      });
      return [...new Set(hits)].slice(0, 3);
    });
    check('no em dash in visible text', em.length === 0, em.join(' | '));

    const noOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth + 1);
    check('no horizontal page overflow', noOverflow);

    const kpis = await page.locator('#view .kpi').count();
    check('has at least one KPI card', kpis > 0, String(kpis));
    const emptyKpis = await page.locator('#view .kpi .val').evaluateAll(
      els => els.filter(e => !e.textContent.trim()).length);
    check('every KPI card has a value', emptyKpis === 0, emptyKpis + ' empty');
  }

  // Re-mount the first dashboard to confirm switching is repeatable and does not
  // leave state behind.
  if (keys.length > 1) {
    console.log('\nRound trip');
    await page.click(`#nav a[data-d="${keys[0]}"]`);
    await page.waitForTimeout(450);
    check('first dashboard remounts cleanly', await page.locator('#view section').count() === 1);
    check('nav shows exactly one active row', await page.locator('#nav a[data-d].on').count() === 1);
  }

  await browser.close();

  console.log('\n' + '='.repeat(46));
  console.log(`pass ${pass}   fail ${fail}`);
  console.log('console errors: ' + (consoleErrors.length ? '\n  ' + consoleErrors.join('\n  ') : 'none'));
  if (failures.length) console.log('\nfailures:\n  ' + failures.join('\n  '));
  console.log('\nThis is the generic floor. Add assertions for the numbers this');
  console.log('change actually affects before reporting it as verified.');
  process.exit(fail === 0 && consoleErrors.length === 0 ? 0 : 1);
})();
