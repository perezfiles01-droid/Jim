// Full-page screenshot of each dashboard plus the page y-range of every scene in scenes.json.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const scenes = JSON.parse(fs.readFileSync(__dirname + '/scenes.json'));
  const b = await chromium.launch({ executablePath: process.env.CHROME });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + require('path').resolve(process.argv[2])); await p.waitForTimeout(1500);
  const rects = {};
  for (const k of ['bw', 'dp']) {
    await p.setViewportSize({ width: 1920, height: 1080 });
    await p.evaluate(k => switchTo(k), k); await p.waitForTimeout(800);
    // The dashboard scrolls inside its own container, so grow the viewport to its full height.
    const h = await p.$eval('#view > section', e => Math.ceil(e.getBoundingClientRect().bottom) + 40);
    await p.setViewportSize({ width: 1920, height: h }); await p.waitForTimeout(800);
    await p.screenshot({ path: `${__dirname}/public/${k}.png` });
    rects[k] = {};
    for (const s of scenes.filter(s => s.dash === k)) {
      rects[k][s.id] = await p.$$eval('#view > section > *', (els, [a, z]) => {
        const r = els.slice(a, z).map(e => e.getBoundingClientRect());
        return { top: Math.min(...r.map(x => x.top)) + scrollY, bottom: Math.max(...r.map(x => x.bottom)) + scrollY };
      }, s.sections);
    }
  }
  fs.writeFileSync(__dirname + '/public/rects.json', JSON.stringify(rects));
  console.log(JSON.stringify(rects), errs); await b.close();
})();
