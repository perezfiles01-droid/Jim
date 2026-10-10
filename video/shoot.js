// Screenshots both dashboards at full height and records, for every beat in
// beats.json, the page rectangle of the element that beat talks about.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const beats = JSON.parse(fs.readFileSync(__dirname + '/beats.json'));
  const b = await chromium.launch({ executablePath: process.env.CHROME });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + require('path').resolve(process.argv[2])); await p.waitForTimeout(1500);
  const rects = [];
  for (const k of ['bw', 'dp']) {
    await p.setViewportSize({ width: 1920, height: 1080 });
    await p.evaluate(k => switchTo(k), k); await p.waitForTimeout(800);
    // The dashboard scrolls inside its own container, so grow the viewport to its full height.
    const h = await p.$eval('#view > section', e => Math.ceil(e.getBoundingClientRect().bottom) + 40);
    await p.setViewportSize({ width: 1920, height: h }); await p.waitForTimeout(800);
    await p.screenshot({ path: `${__dirname}/public/${k}.png` });
    beats.forEach((bt, i) => { if (bt.dash === k) rects[i] = bt; });
    for (const [i, bt] of beats.entries()) {
      if (bt.dash !== k) continue;
      bt.rect = await p.$$eval('#view ' + bt.sel, (els, bt) => {
        els = els.filter(e => e.getBoundingClientRect().height > 0);
        const n = (bt.n ?? 0) < 0 ? els.length + bt.n : (bt.n ?? 0);
        const pick = els.slice(n, bt.until ?? n + 1).map(e => e.getBoundingClientRect());
        if (!pick.length) return null;
        const r = { x: Math.min(...pick.map(r => r.left)), y: Math.min(...pick.map(r => r.top)),
          r: Math.max(...pick.map(r => r.right)), b: Math.max(...pick.map(r => r.bottom)) };
        if (bt.skipTop) r.y += bt.skipTop;
        return { x: r.x, y: r.y, w: r.r - r.x, h: r.b - r.y };
      }, bt);
      if (!bt.rect) errs.push(`no element for beat ${i}: ${bt.sel}`);
    }
  }
  fs.writeFileSync(__dirname + '/public/beats.rects.json', JSON.stringify(beats.map(b => b.rect ?? null)));
  console.log(errs.length ? errs : 'all beats located'); await b.close();
})();
