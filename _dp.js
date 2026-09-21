const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'assert') errs.push(m.type() + ': ' + m.text()); });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(400);
  await p.evaluate(() => switchTo('dp')); await p.waitForTimeout(300);
  const k = process.argv[3] || 'users';
  await p.click('#dp-kpis .kpi[data-k="' + k + '"]'); await p.waitForTimeout(250);
  const html = await p.evaluate(() => {
    const d = document.getElementById('dp-drill');
    return { t:(d.querySelector('.ptitle')||{}).textContent,
      bars:[...d.querySelectorAll('.dchart .ct, .dchart .bl, .dchart b, .mstats span')].map(e=>e.textContent.trim()),
      text: d.textContent.replace(/\s+/g,' ').slice(0,400) };
  });
  console.log('"' + html.t + '"');
  console.log(html.text);
  console.log(errs.length ? '❌ ' + errs.join('\n') : '✅ no runtime errors');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
