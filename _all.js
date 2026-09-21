const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'assert') errs.push(m.type() + ': ' + m.text()); });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(400);
  await p.evaluate(() => switchTo('dp')); await p.waitForTimeout(300);
  for (const k of await p.$$eval('#dp-kpis .kpi[data-k]', e => e.map(x => x.dataset.k))) {
    await p.click('#dp-kpis .kpi[data-k="' + k + '"]'); await p.waitForTimeout(180);
    const i = await p.evaluate(() => {
      const d = document.getElementById('dp-drill'); const cols = d.querySelectorAll('.hd').length;
      return { t:(d.querySelector('.ptitle')||{}).textContent, cols, rows:d.querySelectorAll('.drow').length,
        ragged:[...d.querySelectorAll('.drow')].some(r=>r.children.length!==cols),
        nan:[...d.querySelectorAll('.drow')].slice(0,3).flatMap(r=>[...r.children].map(c=>c.textContent.trim())).some(c=>c==='NaN'||c==='undefined') };
    });
    console.log(`  ${(i.ragged||i.nan)?'❌':'✅'} ${k.padEnd(9)} "${i.t}" rows=${i.rows} cols=${i.cols}${i.ragged?' RAGGED':''}${i.nan?' NaN':''}`);
  }
  // department picker sweep
  const opts = await p.$$eval('#dp-sel option', e => e.map(o=>o.value));
  for (const o of [opts[0], opts[opts.length-1]]) {
    await p.selectOption('#dp-sel', o); await p.waitForTimeout(150);
  }
  console.log('picker swept ' + opts.length + ' options, ends on ' + opts[opts.length-1]);
  console.log(errs.length ? '❌ ' + errs.join('\n') : '✅ no runtime errors');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
