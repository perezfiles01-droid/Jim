/* ===================================================================
   host-test.js

   Runs the web part's real display code (lib-commonjs/.../ReportHost.js,
   built by `npm run build`) on a mock SharePoint page in Chromium, under the
   conditions that broke earlier versions in the test tenant:

     - a Content Security Policy with a nonce and 'strict-dynamic', which
       refuses any <script src> written in the report's markup
     - the web part being moved after it renders, which reloads its iframe
     - browser zoom changed after the page has loaded

   and checks that both dashboards draw, nothing is blocked, the report is
   exactly the web part's width, and in the default sizing the web part is
   exactly as tall as the report.

   Usage: npm run build && node test/host-test.js
   Needs Playwright with a Chromium (set CHROMIUM_PATH if it cannot find one).
   =================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const HERE = path.join(__dirname, '..');
const ASSETS = path.join(HERE, 'release', 'assets');
const N = 'testnonce';
const CSP = "script-src 'nonce-" + N + "' 'strict-dynamic' https: 'unsafe-eval'; object-src 'none'";

const t = fs.readFileSync(path.join(HERE, 'src/webparts/edrmsUtilizationReport/reportTemplate.ts'), 'utf8');
const html = t.match(/export const REPORT_HTML: string = (.*);\n/)[1];
const scripts = t.match(/export const REPORT_SCRIPTS: string\[\] = (.*);\n/)[1];
const host = fs.readFileSync(path.join(HERE, 'lib-commonjs/webparts/edrmsUtilizationReport/ReportHost.js'), 'utf8');

const files = {
  'template.js': 'window.REPORT_HTML=' + html + ';window.REPORT_SCRIPTS=' + scripts + ';',
  'reporthost.js': '(function(){var exports={};var module={exports:exports};\n' + host + '\n;window.ReportHost=exports.ReportHost;})();',
  'start.js': "(function(){var o=new URLSearchParams(location.search);window.__host=new ReportHost(document.getElementById('wp'),location.origin+'/assets/'," +
    "window.REPORT_HTML,window.REPORT_SCRIPTS,{dashboard:o.get('d')||'bw',showSidebar:o.get('sb')!=='0',sizing:o.get('sz')||'content',height:900,textSize:o.get('ts')||'large',adbBlue:true},'test','box','frame','EDRMS');" +
    "setTimeout(function(){var wp=document.getElementById('wp');var n=document.createElement('div');wp.parentNode.appendChild(n);n.appendChild(wp);},300);})();"
};

const server = http.createServer((q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/') {
    r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': CSP });
    r.end('<!doctype html><html><head><style>body{margin:0}.box{position:relative;width:100%;overflow-y:hidden}.frame{display:block;border:0;transform-origin:0 0}</style></head>' +
      '<body><div style="height:48px;background:#0f6cbd"></div><div style="position:absolute;top:48px;bottom:0;left:48px;right:0;overflow:auto">' +
      '<div style="height:130px;background:#036c70"></div><div><div id="wp"></div></div></div>' +
      ['template.js', 'reporthost.js', 'start.js'].map(f => '<script nonce="' + N + '" src="/t/' + f + '"></script>').join('') + '</body></html>');
    return;
  }
  if (u.pathname.startsWith('/t/') && files[u.pathname.slice(3)]) {
    r.writeHead(200, { 'Content-Type': 'application/javascript' }); r.end(files[u.pathname.slice(3)]); return;
  }
  const p = path.join(ASSETS, path.basename(u.pathname));
  if (u.pathname.startsWith('/assets/') && fs.existsSync(p)) {
    r.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'application/javascript' : 'image/png' }); fs.createReadStream(p).pipe(r); return;
  }
  r.writeHead(404); r.end();
});

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!fs.existsSync(root)) return undefined;
  for (const d of fs.readdirSync(root).filter(d => /^chromium-\d+$/.test(d))) {
    const bin = path.join(root, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(bin)) return bin;
  }
  return undefined;
}

(async () => {
  await new Promise(res => server.listen(0, res));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ executablePath: findChromium() });
  let failed = 0;
  const cases = [
    ['Bank-wide, 1920x1080', 'd=bw', 1920, 1080],
    ['Bank-wide, 1280x720', 'd=bw', 1280, 720],
    ['Bank-wide, zoom 200% after load', 'd=bw', 1920, 1080, 2],
    ['Department Insights page', 'd=dp', 1920, 1080],
    ['Report sidebar off', 'd=bw&sb=0', 1920, 1080],
    ['Text size standard', 'd=bw&ts=standard', 1920, 1080],
    ['Text size extra large', 'd=bw&ts=xlarge', 1920, 1080],
    ['Fill the window', 'd=bw&sz=window', 1920, 1080]
  ];
  for (const [label, q, w, h, zoom] of cases) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const blocked = [];
    page.on('console', m => { if (/Refused/.test(m.text())) blocked.push(m.text()); });
    await page.goto(base + '?' + q);
    await page.waitForTimeout(4500);
    if (zoom) {
      const s = await ctx.newCDPSession(page);
      await s.send('Emulation.setDeviceMetricsOverride', { width: Math.round(w / zoom), height: Math.round(h / zoom), deviceScaleFactor: zoom, mobile: false });
      await page.waitForTimeout(1500);
    }
    const frame = page.frames().find(f => f !== page.mainFrame());
    const inner = await frame.evaluate(() => ({
      kpis: document.querySelectorAll('#view .kpi').length,
      dashboard: ((document.querySelector('#nav a.on') || {}).textContent || '').replace(/[^A-Za-z -]/g, '').trim(),
      sidebar: getComputedStyle(document.getElementById('side')).display !== 'none',
      reportH: Math.ceil(document.body.getBoundingClientRect().height),
      frameH: innerHeight,
      canvas: innerWidth,
      menu: !!document.querySelector('.edrms-menu')
    }));
    const outer = await page.evaluate(() => {
      const wp = document.getElementById('wp'), box = wp.firstChild, r = box.firstChild.getBoundingClientRect();
      return { width: wp.clientWidth, reportWidth: Math.round(r.width), boxH: box.offsetHeight, reportVisualH: Math.round(r.height) };
    });
    const wantDash = q.includes('d=dp') ? 'Department Insights' : 'Bank-wide Oversight';
    const problems = [];
    if (!inner.kpis) problems.push('dashboard did not draw');
    if (inner.dashboard !== wantDash) problems.push('shows ' + inner.dashboard + ', expected ' + wantDash);
    const wantSidebar = !q.includes('sb=0');
    if (inner.sidebar !== wantSidebar) problems.push('sidebar ' + (inner.sidebar ? 'shown' : 'hidden'));
    if (inner.menu !== wantSidebar) problems.push('menu button ' + (inner.menu ? 'present' : 'missing'));
    const wantCanvas = q.includes('ts=standard') ? 1920 : q.includes('ts=xlarge') ? 1280 : 1536;
    if (inner.canvas !== wantCanvas) problems.push('laid out at ' + inner.canvas + 'px, expected ' + wantCanvas);
    // The header's controls live on the dashboard's title band, and must come
    // back after the band is redrawn by switching dashboards.
    for (const step of ['loaded', 'switched']) {
      if (step === 'switched') { await frame.evaluate(d => switchTo(d === 'bw' ? 'dp' : 'bw'), q.includes('d=dp') ? 'dp' : 'bw'); await page.waitForTimeout(800); }
      const c = await frame.evaluate(() => ({
        pdf: !!document.querySelector('#view .band .edrms-tools .dx-btn'),
        card: !!document.querySelector('#view .band .edrms-tools .crumb'),
        menu: !!document.querySelector('#side .brand > .edrms-menu'),
        header: getComputedStyle(document.querySelector('header')).display
      }));
      if (!c.pdf || !c.card) problems.push('Export / Reporting Suite not on the title band (' + step + ')');
      if (c.menu !== wantSidebar) problems.push('menu button ' + (c.menu ? 'shown' : 'missing') + ' at the top of the sidebar (' + step + ')');
      if (c.header !== 'none') problems.push('top header still shown');
    }
    if (q.includes('d=dp')) await frame.evaluate(() => switchTo('dp')); else await frame.evaluate(() => switchTo('bw'));
    await page.waitForTimeout(500);
    if (wantSidebar && !zoom && !q.includes('sz=')) {
      // 1.0.11: the sidebar stays put while SharePoint's page scrolls
      // (following the scroll by script looked shaky). It must not move.
      await page.evaluate(() => { const sc = document.getElementById('wp').closest('div[style*="overflow"]'); sc.scrollTop = sc.scrollHeight / 2; });
      await page.waitForTimeout(300);
      const moved = await page.evaluate(() => {
        const d = document.querySelector('#wp iframe').contentDocument, a = d.querySelector('#nav a');
        return a.getBoundingClientRect().top - d.getElementById('side').getBoundingClientRect().top > 400;
      });
      if (moved) problems.push('sidebar moved with the scroll');
      await page.evaluate(() => { document.getElementById('wp').closest('div[style*="overflow"]').scrollTop = 0; });
    }
    if (wantSidebar && !zoom) {
      // The menu button closes the sidebar to its icon rail (1.0.22), keeps it
      // closed after a reload, and opens it again.
      await frame.click('.edrms-menu');
      await page.waitForTimeout(300);
      const closed = await frame.evaluate(() => document.getElementById('side').offsetWidth <= 60);
      await page.reload(); await page.waitForTimeout(4500);
      const f2 = page.frames().find(f => f !== page.mainFrame());
      const stillClosed = await f2.evaluate(() => document.getElementById('side').offsetWidth <= 60);
      await f2.click('.edrms-menu'); await page.waitForTimeout(300);
      const reopened = await f2.evaluate(() => document.getElementById('side').offsetWidth > 150);
      if (!closed) problems.push('menu button did not close the sidebar');
      if (!stillClosed) problems.push('closed sidebar did not stay closed after reload');
      if (!reopened) problems.push('menu button did not reopen the sidebar');
    }
    if (blocked.length) problems.push(blocked.length + ' blocked by the security policy');
    if (Math.abs(outer.reportWidth - outer.width) > 1) problems.push('report ' + outer.reportWidth + 'px wide in a ' + outer.width + 'px web part');
    if (Math.abs(outer.boxH - outer.reportVisualH) > 2) problems.push('web part ' + outer.boxH + 'px tall, report ' + outer.reportVisualH + 'px');
    if (!q.includes('sz=') && Math.abs(inner.reportH - inner.frameH) > 2) problems.push('report scrolls inside the web part');
    console.log((problems.length ? 'FAIL ' : 'PASS ') + label + (problems.length ? ': ' + problems.join('; ') : ''));
    if (problems.length) failed++;
    await ctx.close();
  }
  await browser.close();
  server.close();
  console.log(failed ? failed + ' failed' : 'All passed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
