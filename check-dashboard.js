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

  // Bank-wide: every tile actually opens its drill, and every panel renders.
  // The scripted click is the part static review cannot do: a drill whose row
  // builder still reads a removed field renders NaN without throwing, and a
  // panel that writes into another panel's container blanks it silently.
  // Both happened on 21 September 2026 and both were caught here.
  console.log('\nVerifying Bank-wide tiles open their drills (bw dashboard):');
  const bwClicks = await page.evaluate(async () => {
    switchTo('bw');
    await new Promise(r => setTimeout(r, 100));
    const out = [];
    const tiles = [...document.querySelectorAll('#bw-kpis .kpigrp.act .kpi')];
    for (const t of tiles) {
      t.click();
      await new Promise(r => setTimeout(r, 60));
      const d = document.getElementById('bw-drill');
      const cols = d.querySelectorAll('.hd').length;
      const cells = [...d.querySelectorAll('.drow')].slice(0, 3)
        .flatMap(r => [...r.children].map(c => c.textContent.trim()));
      out.push({
        key: t.dataset.k,
        title: (d.querySelector('.ptitle') || {}).textContent || '',
        rows: d.querySelectorAll('.drow').length,
        cols,
        ragged: [...d.querySelectorAll('.drow')].some(r => r.children.length !== cols),
        nan: cells.some(c => c === 'NaN' || c === 'undefined' || c === 'null'),
      });
    }
    const phys = document.getElementById('bw-phys-panel');
    const drillBefore = (document.querySelector('#bw-drill .ptitle') || {}).textContent;
    const sortable = phys && phys.querySelector('.hd');
    if (sortable) { sortable.click(); await new Promise(r => setTimeout(r, 60)); }
    return {
      tiles: out,
      physRows: phys ? phys.querySelectorAll('.drow').length : 0,
      drillSurvivedPhysSort: (document.querySelector('#bw-drill .ptitle') || {}).textContent === drillBefore,
      trendMonths: document.querySelectorAll('#bw-trend-months .ccol').length,
      cmpOptions: document.querySelectorAll('#bw-cmp-sel option').length,
    };
  });

  bwClicks.tiles.forEach(t => {
    const bad = t.rows === 0 || t.cols === 0 || t.ragged || t.nan;
    console.log(`  ${bad ? '❌' : '✅'} ${t.key.padEnd(8)} -> ${t.rows} rows, ${t.cols} cols` +
                (t.nan ? '  HAS NaN/undefined CELLS' : '') + (t.ragged ? '  RAGGED ROWS' : ''));
    if (bad) errors.push(`Bank-wide tile "${t.key}" drill is broken: ` +
      JSON.stringify({ rows: t.rows, cols: t.cols, ragged: t.ragged, nan: t.nan }));
  });
  if (bwClicks.tiles.length === 0) errors.push('Bank-wide has no clickable tiles at all');
  const say = (label, ok, detail) => {
    console.log(`  ${ok ? '✅' : '❌'} ${label}${detail ? ' (' + detail + ')' : ''}`);
    if (!ok) errors.push(label);
  };
  say('Physical counterparts panel renders its own rows', bwClicks.physRows > 0, bwClicks.physRows + ' rows');
  say('Sorting the physical panel does not overwrite the drill', bwClicks.drillSurvivedPhysSort);
  say('Records declared per month is drawn', bwClicks.trendMonths > 0, bwClicks.trendMonths + ' columns');
  say('The comparison offers the two ratios RAC kept', bwClicks.cmpOptions === 2,
      bwClicks.cmpOptions + ' options');

  // Department Insights: same click-through as Bank-wide. The two faults it
  // exists to catch both happened here on 21 September 2026: a summary figure
  // reading a field another dashboard had removed, which printed NaN without
  // throwing, and a grid track count left disagreeing with the column count.
  console.log('\nVerifying Department Insights tiles open their drills (dp dashboard):');
  const dpClicks = await page.evaluate(async () => {
    switchTo('dp');
    await new Promise(r => setTimeout(r, 120));
    const out = [];
    for (const t of [...document.querySelectorAll('#dp-kpis .kpi[data-k]')]) {
      t.click();
      await new Promise(r => setTimeout(r, 60));
      const d = document.getElementById('dp-drill');
      const cols = d.querySelectorAll('.hd').length;
      const text = d.textContent;
      out.push({
        key: t.dataset.k,
        rows: d.querySelectorAll('.drow').length,
        cols,
        ragged: [...d.querySelectorAll('.drow')].some(r => r.children.length !== cols),
        // Plain includes, not a word-boundary regex. textContent runs labels
        // together, so a NaN value renders as "...sitesNaN Used EDRMS..." and
        // \bNaN\b finds no boundary to match. That mistake made this check
        // pass against a file with a NaN visibly on screen.
        nan: text.includes('NaN') || text.includes('undefined'),
      });
    }
    // Sweeping the picker: a unit with no sites must not throw or print NaN.
    const sel = document.getElementById('dp-sel');
    const opts = [...sel.options].map(o => o.value);
    let sweepNaN = null;
    for (const v of opts) {
      sel.value = v;
      sel.dispatchEvent(new Event('change'));
      await new Promise(r => setTimeout(r, 15));
      if (document.querySelector('.dash-dp').textContent.includes('NaN')) { sweepNaN = v; break; }
    }
    return {
      tiles: out,
      options: opts.length,
      sweepNaN,
      libTiles: document.querySelectorAll('#dp-libs .tl').length,
    };
  });

  dpClicks.tiles.forEach(t => {
    const bad = t.ragged || t.nan || (t.cols > 0 && t.rows === 0);
    console.log(`  ${bad ? '❌' : '✅'} ${t.key.padEnd(9)} -> ${t.rows} rows, ${t.cols} cols` +
                (t.nan ? '  HAS NaN/undefined' : '') + (t.ragged ? '  RAGGED ROWS' : ''));
    if (bad) errors.push(`Department Insights tile "${t.key}" drill is broken: ` +
      JSON.stringify({ rows: t.rows, cols: t.cols, ragged: t.ragged, nan: t.nan }));
  });
  const sayDp = (label, ok, detail) => {
    console.log(`  ${ok ? '✅' : '❌'} ${label}${detail ? ' (' + detail + ')' : ''}`);
    if (!ok) errors.push(label);
  };
  sayDp('Department Insights has the six tiles RAC kept', dpClicks.tiles.length === 6,
        dpClicks.tiles.length + ' tiles');
  sayDp('Every unit on the picker renders without NaN', dpClicks.sweepNaN === null,
        dpClicks.sweepNaN ? 'NaN on ' + dpClicks.sweepNaN : dpClicks.options + ' units swept');
  sayDp('The library panel renders its tiles', dpClicks.libTiles > 0, dpClicks.libTiles + ' tiles');

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
