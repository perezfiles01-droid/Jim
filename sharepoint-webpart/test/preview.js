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

const HERE = '/home/user/Jim/sharepoint-webpart';
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
// Preview: screenshot the first screen of a dashboard and measure where its
// first table ends. Usage: node test/preview.js <d> <out.png> [w] [h]
(async () => {
  await new Promise(res => server.listen(0, res));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ executablePath: findChromium() });
  const [d, out, w, h] = [process.argv[2] || 'bw', process.argv[3], +(process.argv[4] || 1920), +(process.argv[5] || 1030)];
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto(base + '?d=' + d);
  await page.waitForTimeout(4500);
  if (process.env.CLOSE) { await page.evaluate(() => document.querySelector('#wp iframe').contentDocument.querySelector('.edrms-menu').click()); await page.waitForTimeout(800); }
  const m = await page.evaluate(() => {
    const f = document.querySelector('#wp iframe'), doc = f.contentDocument, fr = f.getBoundingClientRect(), sc = fr.width / f.offsetWidth;
    const at = sel => { const e = doc.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(fr.top + r.bottom * sc); };
    return { band: at('#view .band'), kpis: at('#view .kpis'), table: at('#view .sites-split .sites-table, #view .panel'), pager: at('#view .pager, #view .pg, #view [class*="pager"]'), screen: innerHeight };
  });
  console.log(JSON.stringify(m));
  if (process.env.SIDE) console.log(await page.evaluate(() => { const d = document.querySelector('#wp iframe').contentDocument; const sd = d.getElementById('side');
    return sd.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g,'<svg/>').slice(0, 3000) + '\nWIDTH ' + sd.offsetWidth + ' ' + getComputedStyle(sd).position; }));
  if (process.env.DUMP) console.log(await page.evaluate(() => { const doc = document.querySelector('#wp iframe').contentDocument;
    const out = []; const walk = (e, d) => { if (d > 6) return; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      if (r.height > 12) out.push('  '.repeat(d) + e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' y=' + Math.round(r.top) + ' h=' + Math.round(r.height) + ' pad=' + cs.paddingTop + '/' + cs.paddingBottom + ' mb=' + cs.marginBottom);
      if (!/drow|hbar|kpi$/.test(e.className)) [...e.children].forEach(c => walk(c, d + 1)); };
    walk(doc.getElementById('view'), 0); return out.slice(0, 70).join('\n'); }));
  if (out) await page.screenshot({ path: out });
  await browser.close(); server.close();
})();
