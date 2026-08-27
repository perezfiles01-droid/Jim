/* ===================================================================
   build_dashboard_pdf.js

   Renders the prototype's six dashboards to a single PDF, one page per
   dashboard, each page sized to that dashboard's true content height so
   no panel is sliced across a page break.

   It drives the REAL index.html in a real browser. Nothing here redraws
   or approximates the prototype: it calls the page's own switchTo() and
   prints what Chromium actually painted. So the PDF is only ever as
   correct as the prototype, which is the point.

   Screen media is emulated deliberately. Chromium prints with print
   media by default, which would apply any print stylesheet and change
   the very thing this file exists to capture.

   Run:  node build_dashboard_pdf.js [outfile.pdf]
   =================================================================== */
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'index.html');

/* This container ships a Chromium that the pinned Playwright does not
   recognise by build number, so resolve the binary ourselves rather than
   let it go looking for a build it will never find. Falls back to
   Playwright's own copy wherever that is not the case. */
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!fs.existsSync(root)) return undefined;
  const dirs = fs.readdirSync(root)
    .filter(d => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const d of dirs) {
    const bin = path.join(root, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(bin)) return bin;
  }
  return undefined;
}
const OUT = process.argv[2] || path.join(__dirname, 'EDRMS_Prototype_Dashboards.pdf');

const WIDTH = 1600;          // wide enough that panels lay out as they do on screen
const MAX_H = 19000;         // Chromium refuses a PDF page taller than 200in at 96dpi
const PAD   = 24;            // a little air at the foot of each page

/* Nav order is the client's own order from PPT s13. Keep it. */
const DASHBOARDS = [
  { key: 'bw', label: 'Bank-wide Oversight' },
  { key: 'dp', label: 'Department Insights' },
  { key: 'pj', label: 'Project Insights' },
  { key: 'fp', label: 'Institutional File Plan' },
  { key: 'rd', label: 'Retention & Disposal' },
  { key: 'ra', label: 'Records & Archive Holdings' }
];

const COVER = `
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"Segoe UI",system-ui,sans-serif;background:#F4F7FA;color:#16324F;
       width:${WIDTH}px;padding:120px 120px 130px}
  .eyebrow{font-size:22px;font-weight:700;letter-spacing:.14em;color:#4A79A8;margin-bottom:56px}
  ol{list-style:none;counter-reset:d}
  li{counter-increment:d;display:flex;align-items:center;gap:26px;
     background:#fff;border:1px solid #DCE6F0;border-left:7px solid #16324F;border-radius:12px;
     padding:26px 32px;margin-bottom:18px}
  li .n{font-size:30px;font-weight:700;color:#8AA6C2;min-width:52px}
  li .t{font-size:32px;font-weight:600}
  li .n::before{content:counter(d)}
</style>
<div class="eyebrow">EDRMS UTILIZATION REPORT</div>
<ol>${DASHBOARDS.map(d => `<li><span class="n"></span><span class="t">${d.label}</span></li>`).join('')}</ol>
`;

(async () => {
  const exe = findChromium();
  if (exe) console.log('Chromium: ' + exe);
  const browser = await chromium.launch({ executablePath: exe });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 1200 } });

  /* Collect everything the page complains about. A dashboard that throws
     during init() mounts blank, and a blank page is invisible to a script
     that only checks the file got written. See the TDZ bug of 18 Aug 2026. */
  const problems = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') problems.push(`console.error: ${m.text()}`); });

  await page.goto('file://' + SRC, { waitUntil: 'load' });
  await page.emulateMedia({ media: 'screen' });

  const pdfs = [];

  /* ---- cover ---- */
  const cover = await browser.newPage({ viewport: { width: WIDTH, height: 1200 } });
  await cover.setContent(COVER, { waitUntil: 'load' });
  await cover.emulateMedia({ media: 'screen' });
  /* Same viewport-clamping trap as the dashboards below: with content shorter
     than the window, body.scrollHeight returns the viewport height, which would
     leave a slab of dead space under the list. Measure the real content extent. */
  const coverH = await cover.evaluate(() => {
    const pad = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    return Math.ceil(document.body.lastElementChild.getBoundingClientRect().bottom + pad);
  });
  pdfs.push(await cover.pdf({
    width: `${WIDTH}px`, height: `${coverH + PAD}px`,
    printBackground: true, pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 }
  }));
  await cover.close();

  /* ---- one page per dashboard ---- */
  const report = [];
  for (const d of DASHBOARDS) {
    const info = await page.evaluate((key) => {
      switchTo(key);
      const view = document.getElementById('view');
      const main = document.getElementById('main');
      /* #main carries overflow-x:hidden, which makes overflow-y compute to auto
         and turns it into its own scroll container. So body never grows past the
         viewport and body.scrollHeight reports 100vh no matter how long the
         dashboard is. The real height is #main's, plus whatever sits above it. */
      const h = main.scrollHeight + main.getBoundingClientRect().top;
      return {
        height: Math.ceil(Math.max(h, view.scrollHeight, document.body.scrollHeight)),
        chars: view.innerText.trim().length,
        panels: view.querySelectorAll('.panel, .band, .kpi').length,
        navOn: (document.querySelector('#nav a.on') || {}).textContent || ''
      };
    }, d.key);

    /* Two frames, so any layout the browser deferred has settled before we measure again. */
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

    if (info.chars < 400 || info.panels === 0) {
      problems.push(`${d.key} (${d.label}) mounted with almost nothing in it: ` +
                    `${info.chars} chars, ${info.panels} panels`);
    }

    let h = info.height + PAD;
    if (h > MAX_H) {
      problems.push(`${d.key} is ${h}px tall, beyond Chromium's ${MAX_H}px page limit; capped`);
      h = MAX_H;
    }

    /* Growing the viewport to the full height means 100vh resolves to the whole
       page, so the sticky sidebar runs the full length instead of stopping short. */
    await page.setViewportSize({ width: WIDTH, height: Math.min(h, MAX_H) });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

    /* Re-measure once the viewport is tall. Reflow at the new height can change
       the content height, and printing the stale figure clips the foot of the page. */
    const settled = await page.evaluate(() => {
      const main = document.getElementById('main');
      return Math.ceil(Math.max(
        main.scrollHeight + main.getBoundingClientRect().top,
        document.body.scrollHeight));
    });
    if (settled + PAD > h && settled + PAD <= MAX_H) {
      h = settled + PAD;
      await page.setViewportSize({ width: WIDTH, height: h });
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    }

    pdfs.push(await page.pdf({
      width: `${WIDTH}px`, height: `${h}px`,
      printBackground: true, pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 }
    }));

    report.push({ ...d, height: info.height, chars: info.chars, panels: info.panels, nav: info.navOn.trim() });
    await page.setViewportSize({ width: WIDTH, height: 1200 });
  }

  await browser.close();

  /* ---- merge ---- */
  const out = await PDFDocument.create();
  out.setTitle('EDRMS Reporting Suite Prototype: the six dashboards');
  out.setSubject('Captured from index.html');
  out.setCreator('build_dashboard_pdf.js');
  out.setProducer('Chromium via Playwright');
  for (const buf of pdfs) {
    const src = await PDFDocument.load(buf);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(p => out.addPage(p));
  }
  fs.writeFileSync(OUT, await out.save());

  /* ---- report ---- */
  console.log('\nDashboard            Height    Chars  Panels  Nav highlighted');
  console.log('-'.repeat(72));
  for (const r of report) {
    console.log(
      r.label.padEnd(21) + String(r.height + 'px').padEnd(10) +
      String(r.chars).padEnd(7) + String(r.panels).padEnd(8) + r.nav
    );
  }
  console.log('-'.repeat(72));
  console.log(`Pages: ${pdfs.length} (1 cover + ${report.length} dashboards)`);
  console.log(`Wrote: ${OUT}`);

  if (problems.length) {
    console.error('\nPROBLEMS:');
    problems.forEach(p => console.error('  ' + p));
    process.exit(1);
  }
  console.log('No page errors, no console errors, every dashboard has content.');
})();
