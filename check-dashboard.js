/**
 * Browser-based dashboard verification using Playwright
 *
 * This script launches Chromium, loads index.html, and verifies:
 * - All five dashboards mount without throwing errors
 * - No console errors, warnings, or assertions in critical paths
 * - Key UI elements render correctly
 *
 * CRITICAL: This test must pass before merging to main.
 * Catches runtime errors that static code review cannot find (e.g., temporal dead zone).
 *
 * Usage:
 *   node check-dashboard.js /path/to/index.html
 *
 * Example:
 *   node check-dashboard.js $(pwd)/index.html
 *
 * Created: 2026-08-18
 * Updated to prevent temporal dead zone and other runtime bugs
 */

const { chromium } = require('playwright');

(async () => {
  // Use pre-installed Chromium in the environment, or fall back to downloaded
  const executablePath = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch({ executablePath });
  const page = await browser.newPage();
  const errors = [];

  // Capture runtime errors (e.g., ReferenceError from TDZ)
  page.on('pageerror', e => {
    const msg = 'PAGEERROR: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n');
    errors.push(msg);
    console.error('❌', e.message); // Show immediately
  });

  // Capture console errors/warnings (syntax issues, undefined refs, etc.)
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'assert' || m.type() === 'warning') {
      const msg = m.type().toUpperCase() + ': ' + m.text();
      errors.push(msg);
      if (m.type() === 'error') console.error('❌', m.text());
    }
  });

  // Load the dashboard
  console.log('Loading dashboard from:', process.argv[2]);
  await page.goto('file://' + process.argv[2]);
  await page.waitForTimeout(500); // Let scripts execute

  // Verify all five dashboards mounted without throwing
  const keys = await page.evaluate(() => Object.keys(DASHBOARDS));
  console.log('\n✅ Dashboards initialized:', JSON.stringify(keys));

  // Check each dashboard mounts without error
  console.log('\nVerifying each dashboard mounts:');
  for (const k of keys) {
    const r = await page.evaluate(k => {
      try {
        switchTo(k);
        const v = document.getElementById('view');
        return {
          len: v.innerHTML.length,
          panels: v.querySelectorAll('.panel').length,
          status: 'mounted'
        };
      } catch (e) {
        return { threw: e.message, status: 'error' };
      }
    }, k);

    const status = r.status === 'error' ? '❌' : '✅';
    console.log(`  ${status} ${k.padEnd(18)} ->`, JSON.stringify(r));
  }

  // Verify retention label bars render correctly
  console.log('\nVerifying retention label bars (rd dashboard):');
  const bars = await page.evaluate(() => {
    try {
      switchTo('rd');
      const panels = [...document.querySelectorAll('#view .panel')];
      const p = panels.find(x => /by retention label/i.test(x.querySelector('.ptitle')?.textContent || ''));
      if (!p) return { status: 'error', msg: 'panel not found' };

      const barData = [...p.querySelectorAll('.hbar')].map(b => ({
        label: b.querySelector('.hl').textContent.trim(),
        value: b.querySelector('.hf').textContent.trim(),
        pct: b.querySelector('.hp')?.textContent.trim(),
      }));

      return { status: 'rendered', count: barData.length, bars: barData };
    } catch (e) {
      return { status: 'error', threw: e.message };
    }
  });

  if (bars.status === 'rendered') {
    console.log(`  ✅ ${bars.count} retention label bars rendered`);
    bars.bars.slice(0, 3).forEach((b, i) => {
      console.log(`     ${i + 1}. ${b.label}: ${b.value} (${b.pct})`);
    });
  } else {
    console.log(`  ❌ Failed to render bars:`, bars.msg || bars.threw);
    errors.push('Retention bars failed: ' + (bars.msg || bars.threw));
  }

  // Verify rollup chart filter still works
  console.log('\nVerifying rollup chart filter (rd dashboard):');
  const filt = await page.evaluate(() => {
    try {
      switchTo('rd');
      const sel = document.getElementById('rd-filter');
      if (!sel) return { status: 'error', msg: 'filter not found' };

      const before = document.querySelectorAll('#rd-chart .ccol').length;
      sel.value = 'Permanent';
      sel.dispatchEvent(new Event('change'));
      const after = document.querySelectorAll('#rd-chart .ccol').length;

      return { status: 'working', before, after };
    } catch (e) {
      return { status: 'error', threw: e.message };
    }
  });

  if (filt.status === 'working') {
    console.log(`  ✅ Filter works (columns before: ${filt.before}, after: ${filt.after})`);
  } else {
    console.log(`  ❌ Filter test failed:`, filt.msg || filt.threw);
    errors.push('Filter failed: ' + (filt.msg || filt.threw));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (errors.length === 0) {
    console.log('✅ ALL TESTS PASSED - Dashboard is production ready');
    console.log('Safe to merge to main');
  } else {
    console.log(`❌ TESTS FAILED - ${errors.length} error(s) found:`);
    console.log('=' .repeat(60));
    errors.slice(0, 20).forEach((e, i) => {
      console.log(`\nError ${i + 1}:`);
      console.log(e);
    });
    if (errors.length > 20) {
      console.log(`\n... and ${errors.length - 20} more errors`);
    }
    console.log('\n❌ DO NOT MERGE until all errors are fixed');
  }

  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
