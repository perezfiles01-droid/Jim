/* ===================================================================
   build-report.js

   Turns the report (index.html at the repo root (one folder up), the same file GitHub
   Pages serves, which is synced from the Floot app) into what the
   SharePoint web part ships.

   SharePoint Online enforces a Content Security Policy that blocks script
   written inside a page. So every inline <script> block is moved into its
   own .js file, and the three export libraries and the ADB logo, which the
   report otherwise loads from cdnjs and floot-assets/, are shipped as files
   too. All of them are packaged with the web part as client side assets, so
   SharePoint serves them from its own trusted storage. The page itself keeps
   only markup and styles, with __EDRMS_BASE__ where the asset location goes;
   the web part fills that in at run time, then adds the scripts itself (see
   step 6 below for why).

   The GitHub Pages wrapper (password gate and window fitting) is left out:
   SharePoint signs people in, and the web part does its own fitting.

   Usage:
     node build-report.js prepare [path/to/index.html]   before the build
     node build-report.js copy                           after the build,
                                                         before packaging
   =================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HERE = __dirname;
const STAGE = path.join(HERE, 'report-assets');
const TEMPLATE = path.join(HERE, 'src', 'webparts', 'edrmsUtilizationReport', 'reportTemplate.ts');
const BASE = '__EDRMS_BASE__';

const LIBS = {
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js': 'node_modules/xlsx/dist/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js': 'node_modules/html2canvas/dist/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js': 'node_modules/jspdf/dist/jspdf.umd.min.js'
};

function hash(buf) { return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10); }

function stage(name, buf) {
  const dot = name.lastIndexOf('.');
  const out = 'edrms-' + name.slice(0, dot) + '_' + hash(buf) + name.slice(dot);
  fs.writeFileSync(path.join(STAGE, out), buf);
  return out;
}

function prepare(src) {
  let html = fs.readFileSync(src, 'utf8');
  fs.rmSync(STAGE, { recursive: true, force: true });
  fs.mkdirSync(STAGE, { recursive: true });

  // 1. Drop the GitHub Pages wrapper (comment plus its script).
  const w = html.indexOf('<!-- Same as the Floot app: the report is laid out');
  if (w >= 0) {
    const e = html.indexOf('</script>', w) + '</script>'.length;
    html = html.slice(0, w) + html.slice(e);
  }
  if (html.includes('edrms-report-access-v1')) throw new Error('The GitHub Pages wrapper is still in the page.');

  // 2. Libraries from cdnjs become packaged files.
  for (const [url, file] of Object.entries(LIBS)) {
    if (!html.includes(url)) continue;
    // A UTF-8 byte order mark makes the browser read the file as UTF-8
    // whatever character set the server declares, and these libraries
    // contain non-ASCII characters.
    const bytes = fs.readFileSync(path.join(HERE, file));
    const bom = Buffer.from([0xef, 0xbb, 0xbf]);
    const name = stage(path.basename(file), bytes.slice(0, 3).equals(bom) ? bytes : Buffer.concat([bom, bytes]));
    html = html.split('<script src="' + url + '"').join('<script charset="utf-8" src="' + BASE + name + '"');
    if (html.includes(url)) throw new Error('Could not replace ' + url);
  }

  // 3. Every inline script becomes a packaged file, in the same order. A
  // script that names an image in floot-assets/ reads the asset location from
  // the page instead, since a .js file is not rewritten at run time.
  const assetDir = path.resolve(path.dirname(src), 'floot-assets');
  const image = (file) => {
    const p = path.join(assetDir, file);
    if (!fs.existsSync(p)) throw new Error('Missing ' + p);
    return stage(file, fs.readFileSync(p));
  };
  let n = 0;
  html = html.replace(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, body) => {
    body = body.replace(/(["'])floot-assets\/([A-Za-z0-9._-]+)\1/g, (mm, q, file) =>
      '(document.documentElement.getAttribute("data-edrms-base")||"")+' + q + image(file) + q);
    n++;
    // Written as plain ASCII (every other character as a \\u escape), so the
    // file reads the same whatever character set the server declares for it.
    body = body.replace(/[^\x00-\x7f]/g, (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
    const name = stage('script' + String(n).padStart(2, '0') + '.js', Buffer.from(body, 'utf8'));
    return '<script charset="utf-8" src="' + BASE + name + '"' + attrs + '></script>';
  });

  // 4. Images the markup or styles load from floot-assets/ become packaged files.
  html = html.replace(/floot-assets\/([A-Za-z0-9._-]+)/g, (m, file) => BASE + image(file));
  if (/floot-assets\//.test(html)) throw new Error('The page still refers to floot-assets/.');
  html = html.replace(/<html([\s>])/i, '<html data-edrms-base="' + BASE + '"$1');
  if (!html.includes('data-edrms-base="' + BASE + '"')) throw new Error('Could not mark the asset location on <html>.');

  // 5. No non-ASCII characters in the page: CSS escapes inside <style>, HTML
  // character references elsewhere. The bundler would otherwise turn JSON
  // escapes back into raw characters, and how those read depends on the
  // character set SharePoint declares for the bundle.
  const hex = (ch) => ch.codePointAt(0).toString(16).toUpperCase();
  html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, css, b) =>
    a + css.replace(/[^\x00-\x7f]/gu, (ch) => '\\' + hex(ch).padStart(6, '0')) + b);
  html = html.replace(/[^\x00-\x7f]/gu, (ch) => '&#x' + hex(ch) + ';');

  const left = (html.match(/<script(?![^>]*\bsrc=)[^>]*>/g) || []).length;
  if (left) throw new Error(left + ' inline script blocks are still in the page.');

  // 6. Take every <script> tag out of the page and list its file, in order.
  // SharePoint's policy carries 'strict-dynamic', which refuses scripts the
  // page's own markup asks for, even from SharePoint's servers. Only scripts
  // added by already trusted code run, so the web part adds these itself,
  // in this order, once the markup has loaded.
  const scripts = [];
  html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (m, url) => {
    if (!url.startsWith(BASE)) throw new Error('Unexpected script source ' + url);
    scripts.push(url.slice(BASE.length));
    return '';
  });
  if (/<script\b/i.test(html)) throw new Error('A <script> tag is still in the page.');
  if (scripts.length !== n + Object.keys(LIBS).length) throw new Error('Expected ' + (n + Object.keys(LIBS).length) + ' scripts, found ' + scripts.length + '.');
  if (/cdnjs\.cloudflare\.com/.test(html)) throw new Error('The page still loads from cdnjs.');
  if (!html.includes('id="nav"') || !html.includes('id="view"')) throw new Error('This does not look like the report.');

  fs.writeFileSync(TEMPLATE,
    '// Generated by build-report.js from the repo\'s index.html. Do not edit by hand.\n' +
    'export const REPORT_HTML: string = ' +
    JSON.stringify(html).replace(/[^\x00-\x7f]/g, (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + ';\n' +
    '// The report\'s scripts, in page order, loaded by the web part.\n' +
    'export const REPORT_SCRIPTS: string[] = ' + JSON.stringify(scripts) + ';\n');
  for (const f of fs.readdirSync(STAGE)) {
    if (f.endsWith('.js') && /floot-assets\//.test(fs.readFileSync(path.join(STAGE, f), 'utf8'))) throw new Error(f + ' still refers to floot-assets/.');
  }
  const files = fs.readdirSync(STAGE);
  console.log('Report template: ' + (html.length / 1024).toFixed(0) + ' KB of markup and styles, ' +
    n + ' scripts and ' + (files.length - n) + ' other files moved out (' + files.length + ' assets).');
}

function copy() {
  const dest = path.join(HERE, 'release', 'assets');
  if (!fs.existsSync(dest)) throw new Error('Build the web part first: ' + dest + ' does not exist.');
  const files = fs.readdirSync(STAGE);
  for (const f of files) fs.copyFileSync(path.join(STAGE, f), path.join(dest, f));
  console.log('Copied ' + files.length + ' report assets into release/assets.');
}

const cmd = process.argv[2];
if (cmd === 'prepare') prepare(path.resolve(process.argv[3] || process.env.REPORT_SOURCE || path.join(HERE, '..', 'index.html')));
else if (cmd === 'copy') copy();
else { console.error('Usage: node build-report.js prepare [index.html] | copy'); process.exit(1); }
