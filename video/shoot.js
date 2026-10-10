const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({executablePath: process.env.CHROME}); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
  const names = await p.$$eval('#nav a[data-d]', as => as.map(a => [a.dataset.d, a.textContent.trim()]));
  for (const [k] of names) { await p.evaluate(k => switchTo(k), k); await p.waitForTimeout(800);
    await p.screenshot({ path: `${__dirname}/public/${k}.png` }); }
  console.log(JSON.stringify(names), errs); await b.close();
})();
