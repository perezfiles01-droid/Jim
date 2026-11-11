// Records one short click-through video per function of the web part (F-01 ...),
// with a visible pointer and a click ripple, for the Dashboard Controls deck.
// Uses the test build of the web part: node sharepoint-webpart-react/test/build-test-page.js first.
// Usage: node presentations/record_demos.js [F-01 F-02 ...]   (no ids = all)
// Output: presentations/demo_videos/F-01.mp4 ... and F-01.png (poster frame)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '../sharepoint-webpart-react/test/out/index.html');
const OUT = path.join(__dirname, 'demo_videos');
const RAW = path.join(OUT, 'raw');
fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(path.join(OUT, 'steps'), { recursive: true });
const W = 1600, H = 900;

// The pointer and the click ripple, drawn in the page so the recording shows them.
const CURSOR = () => {
  const c = document.createElement('div');
  c.id = '__cur';
  c.innerHTML = '<svg width="26" height="30" viewBox="0 0 26 30"><path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L21 16 Z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';
  c.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(-2px,-2px);will-change:left,top';
  document.body.appendChild(c);
  const st = document.createElement('style');
  st.textContent = '.__rip{position:fixed;z-index:2147483646;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid rgba(217,119,6,.9);background:rgba(217,119,6,.18);animation:__r .55s ease-out forwards}@keyframes __r{from{transform:scale(.3);opacity:1}to{transform:scale(1.4);opacity:0}}';
  document.head.appendChild(st);
  document.addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
  document.addEventListener('mousedown', e => { const r = document.createElement('div'); r.className = '__rip'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); }, true);
};

const STEPS = process.env.STEPS === '1';
const STEPDIR = path.join(OUT, 'steps');
function helpers(p, id) {
  let mx = 800, my = 500, n = 0;
  const steps = [];
  const label = async loc => {
    const t = await loc.first().evaluate(el => {
      const g = el.closest && el.closest('.cgG');
      if (g && el.classList.contains('cgPick')) return '@the ' + ((g.querySelector('.cgL') || {}).textContent || '').trim() + ' box';
      if (el.closest && el.closest('.cgOpts')) return '#' + (el.innerText || '').trim();
      if (el.classList && (el.classList.contains('info') || el.classList.contains('infoWrap'))) return '@the (i) icon';
      const a = el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('title') || '';
      const tx = (el.innerText || el.value || '').replace(/\s+/g, ' ').trim();
      return (tx && tx.length <= 40 ? tx : a || tx).slice(0, 40);
    }).catch(() => '');
    return t;
  };
  const snap = async (loc, verb) => {
    if (!STEPS) return;
    const b = await loc.first().boundingBox();
    if (!b) return;
    n += 1;
    const f = id + '_' + String(n).padStart(2, '0') + '.png';
    await p.mouse.move(-50, -50).catch(() => {});
    await p.screenshot({ path: path.join(STEPDIR, f) });
    await p.mouse.move(mx, my);
    const lb = await label(loc);
    const text = lb.startsWith('#') ? 'Tick ' + lb.slice(1) : lb.startsWith('@') ? verb + ' ' + lb.slice(1) : verb + ' ' + lb;
    steps.push({ file: f, x: b.x / W, y: b.y / H, w: b.width / W, h: b.height / H, text });
  };
  const finish = async () => {
    if (!STEPS) return;
    n += 1;
    const f = id + '_' + String(n).padStart(2, '0') + '.png';
    await p.mouse.move(-50, -50).catch(() => {});
    await p.screenshot({ path: path.join(STEPDIR, f) });
    steps.push({ file: f, final: true, text: 'Result' });
    fs.writeFileSync(path.join(STEPDIR, id + '.json'), JSON.stringify(steps, null, 1));
  };
  const wait = ms => p.waitForTimeout(ms);
  const box = async loc => { await loc.first().scrollIntoViewIfNeeded(); const b = await loc.first().boundingBox(); if (!b) throw new Error('no box'); return b; };
  const moveTo = async (loc, dx, dy) => {
    const b = await box(loc);
    const x = b.x + (dx === undefined ? b.width / 2 : dx), y = b.y + (dy === undefined ? b.height / 2 : dy);
    const steps = Math.max(12, Math.min(40, Math.round(Math.hypot(x - mx, y - my) / 18)));
    await p.mouse.move(x, y, { steps }); mx = x; my = y;
    await wait(250);
  };
  const click = async (loc, dx, dy) => { await loc.first().scrollIntoViewIfNeeded().catch(() => {}); await snap(loc, 'Click'); await moveTo(loc, dx, dy); await p.mouse.down(); await wait(90); await p.mouse.up(); await wait(650); };
  const type = async (loc, text) => { await click(loc); for (const ch of text) { await p.keyboard.type(ch); await wait(170); } await wait(700); };
  const clear = async loc => { await loc.first().fill(''); await wait(500); };
  const scrollTo = async loc => {
    await p.evaluate(el => { const r = el.getBoundingClientRect(); window.scrollBy({ top: r.top - 90, behavior: 'smooth' }); }, await loc.first().elementHandle());
    await wait(900);
  };
  const top = async () => { await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await wait(800); };
  const panel = t => p.locator('.panel', { hasText: t }).first();
  const kpi = t => p.locator('.kpi', { hasText: t }).first();
  const esc = async () => { await p.keyboard.press('Escape'); await wait(500); };
  const hover = async loc => { await loc.first().scrollIntoViewIfNeeded().catch(() => {}); await snap(loc, 'Point at'); await moveTo(loc); };
  return { wait, moveTo, hover, click, type, clear, scrollTo, top, panel, kpi, esc, p, finish };
}

const filterRM = async (h, P, value) => {
  await h.click(P.locator('.fBtn'));
  await h.click(h.p.locator('.fPop .cgPick').first());
  await h.click(h.p.locator('.cgOpts .ms-Checkbox', { hasText: value || 'RM' }).first());
  await h.esc();
  await h.click(h.p.locator('.fBtns >> text=Apply'));
};
const cardDrill = async (h, card, title) => { await h.click(h.kpi(card)); await h.scrollTo(h.panel(title)); };

// One scenario per function: { q: page query, run: async h => ... }
const S = {
  'F-01': { run: async h => { await h.hover(h.p.locator('.nav', { hasText: 'Project Insights' })); await h.wait(600); await h.click(h.p.locator('.nav', { hasText: 'Department Insights' })); await h.wait(1200); await h.click(h.p.locator('.nav', { hasText: 'Bank-wide Oversight' })); } },
  'F-02': { run: async h => { await h.click(h.p.locator('.menuBtn')); await h.wait(1200); await h.click(h.p.locator('.menuBtn')); } },
  'F-03': { run: async h => { for (const i of [0, 1]) { await h.hover(h.p.locator('.kpi .info').nth(i)); await h.wait(1800); } await h.hover(h.p.locator('.band').first(), 300, 30); } },
  'F-04': { run: async h => { await h.hover(h.p.locator('.asof').first()); await h.wait(2200); } },
  'F-05': { run: async h => { await h.click(h.p.locator('.pdfBtn:not(.impOpen)').first()); await h.hover(h.p.locator('.xMenu button').nth(0)); await h.wait(900); await h.hover(h.p.locator('.xMenu button').nth(1)); await h.wait(1200); await h.esc(); } },
  'F-06': { run: async h => { const P = h.panel('Top 10 by number of sites'); await h.type(P.locator('input').first(), 'SA'); await h.wait(1200); await h.clear(P.locator('input').first()); } },
  'F-07': { run: async h => { await filterRM(h, h.panel('Top 10 by number of sites')); await h.wait(1500); } },
  'F-08': { run: async h => { const P = h.panel('Top 10 by number of sites'); await h.click(P.locator('th', { hasText: 'Sites' })); await h.wait(1000); await h.click(P.locator('th', { hasText: 'Sites' })); } },
  'F-09': { run: async h => { const P = h.panel('Top 10 by number of sites'); await h.click(P.locator('.pager button', { hasText: 'Next' })); await h.wait(1200); await h.click(P.locator('.pager button', { hasText: /^1$/ })); } },
  'F-10': { run: async h => { const P = h.panel('Top 10 by number of sites'); await h.click(P.locator('.xpBtn')); await h.wait(1200); } },
  'F-11': { run: async h => { await h.click(h.panel('Top 10 by number of sites').locator('tbody tr', { hasText: 'CWRD' }).locator('td').first(), 20); await h.wait(1500); } },
  'F-12': { run: async h => { for (const k of ['EDRMS users', 'Documents in EDRMS', 'Records declared in EDRMS', 'Active EDRMS sites']) { await h.click(h.kpi(k)); await h.wait(900); } } },
  'F-13': { run: async h => { const P = h.panel('Top 10 by number of sites'); for (const i of [0, 3, 6]) { await h.hover(P.locator('.rankRow').nth(i)); await h.wait(700); } await h.hover(P.locator('tbody tr').nth(2)); } },
  'F-14': { run: async h => { await cardDrill(h, 'EDRMS users', 'Total number of EDRMS users'); const P = h.panel('Total number of EDRMS users'); await h.type(P.locator('input').first(), 'ITD'); await h.wait(1200); await h.clear(P.locator('input').first()); } },
  'F-15': { run: async h => { await cardDrill(h, 'Documents in EDRMS', 'Documents over time'); const P = h.panel('Documents over time'); await h.click(P.locator('button', { hasText: /^2025$/ })); await h.click(P.locator('button', { hasText: 'Month' })); await h.click(P.locator('button', { hasText: 'New documents' })); await h.wait(1000); await h.click(P.locator('button', { hasText: /^All$/ })); await h.click(P.locator('button', { hasText: /^Year$/ })); await h.click(P.locator('button', { hasText: 'Total documents' })); } },
  'F-16': { run: async h => { await cardDrill(h, 'Documents in EDRMS', 'Documents over time'); const P = h.panel('Documents over time'); await h.click(P.locator('button', { hasText: /^2025$/ })); await h.click(P.locator('button', { hasText: 'Month' })); await h.click(P.locator('button', { hasText: 'New documents' })); await filterRM(h, P); await h.scrollTo(P); await h.wait(1500); } },
  'F-17': { run: async h => { await cardDrill(h, 'Records declared in EDRMS', 'Total number of records declared'); const P = h.panel('Total number of records declared'); await h.click(P.locator('th', { hasText: 'Records declared' })); await h.wait(900); await h.type(P.locator('input').first(), 'SARD'); await h.wait(1000); await h.clear(P.locator('input').first()); } },
  'F-18': { run: async h => { const P = h.panel('Total number of physical counterparts'); await h.scrollTo(P); await filterRM(h, P); await h.wait(1500); } },
  'F-19': { run: async h => { const P = h.panel('Compare Departments'); await h.scrollTo(P); await h.click(P.locator('.cmpH > *').nth(1)); await h.wait(1000); await h.click(P.locator('.cmpH > *').nth(2)); await h.wait(1000); } },
  'F-20': { run: async h => { const P = h.panel('Compare Departments'); await h.scrollTo(P); await h.click(P.locator('.picker').first()); await h.click(h.p.locator('.ms-Dropdown-item', { hasText: 'records' }).first()); await h.wait(1500); } },
  'F-21': { run: async h => { const P = h.panel('Records declared over time'); await h.scrollTo(P); for (const b of ['Last 3 months', 'Last 6 months', 'Year to date', 'All time']) { await h.click(P.locator('button', { hasText: b })); await h.wait(600); } } },
  'F-22': { run: async h => { const P = h.panel('Records declared over time'); await h.scrollTo(P); await h.click(P.locator('button', { hasText: 'All time' })); await h.click(P.locator('.seg').nth(1).locator('button', { hasText: 'Year' })); await h.wait(800); const r = P.locator('svg rect'); const n = await r.count(); await h.click(r.nth(Math.floor(n / 2))); await h.wait(1200); const back = P.locator('.crumb a'); if (await back.count()) await h.click(back.first()); } },
  'F-23': { run: async h => { const P = h.panel('Records declared over time'); await h.scrollTo(P); await h.click(P.locator('input[aria-label=From]')); await P.locator('input[aria-label=From]').fill('2026-01-01'); await h.wait(500); await h.click(P.locator('input[aria-label=To]')); await P.locator('input[aria-label=To]').fill('2026-06-30'); await h.wait(500); await h.click(P.locator('button', { hasText: 'Apply' })); await h.wait(1500); await h.click(P.locator('button', { hasText: 'Reset' })); } },
  'F-30': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .cgPick').first()); await h.click(h.p.locator('.cgOpts .ms-Checkbox', { hasText: 'HQ' }).first()); await h.esc(); await h.wait(1200); } },
  'F-31': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .cgPick').nth(0)); await h.click(h.p.locator('.cgOpts .ms-Checkbox', { hasText: 'RM' }).first()); await h.esc(); await h.click(h.p.locator('.dash-dp .cgPick').nth(1)); await h.click(h.p.locator('.cgOpts .ms-Checkbox', { hasText: 'SARD' }).first()); await h.esc(); await h.wait(1000); } },
  'F-32': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .cgPick').nth(3)); await h.type(h.p.locator('.cgQ').first(), 'ITD'); await h.click(h.p.locator('.cgOpts .ms-Checkbox').nth(1)); await h.esc(); await h.wait(1000); } },
  'F-33': { run: async h => { await h.click(h.panel('Top 10 by number of sites').locator('tbody tr', { hasText: 'Information Technology' }).locator('td').first(), 20); await h.wait(1200); await h.hover(h.p.locator('.chipCard').nth(0)); await h.wait(900); await h.hover(h.p.locator('.chipCard a').first()); await h.wait(1200); } },
  'F-34': { q: '?d=dp', run: async h => { for (const k of ['SITE VISITORS', 'DOCUMENTS', 'RECORDS DECLARED', 'PHYSICAL COUNTERPARTS', 'SITES']) { await h.click(h.p.locator('.dash-dp .kpi', { hasText: new RegExp('^\\s*' + k, 'i') }).first()); await h.wait(800); } } },
  'F-35': { q: '?d=dp', run: async h => { const P = h.panel('Each EDRMS site, who owns it'); await h.scrollTo(P); await h.type(P.locator('input[type=search], .search input').first(), 'Admin'); await h.wait(1000); await h.clear(P.locator('input[type=search], .search input').first()); await h.click(P.locator('th', { hasText: 'Created' })); await h.wait(1000); } },
  'F-36': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .kpi', { hasText: /SITE VISITORS/i }).first()); const P = h.panel('Number of people who opened each site'); await h.scrollTo(P); for (const i of [0, 2]) { await h.hover(P.locator('.hbar').nth(i)); await h.wait(700); } } },
  'F-37': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .kpi', { hasText: /SITE VISITORS/i }).first()); const P = h.panel('Number of people who opened each site'); await h.scrollTo(P); await h.click(P.locator('button', { hasText: 'External' })); await h.wait(1200); await h.click(P.locator('button', { hasText: 'Internal' })); await h.wait(900); await h.click(P.locator('button', { hasText: /^All$/ })); } },
  'F-38': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .kpi', { hasText: /^\s*DOCUMENTS/i }).first()); const P = h.p.locator('.dash-dp .panel').nth(1); await h.scrollTo(P); await h.click(P.locator('.seg button').nth(1)); await h.wait(1000); await h.click(P.locator('.seg button').nth(0)); } },
  'F-39': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .kpi', { hasText: /RECORDS DECLARED/i }).first()); const P = h.p.locator('.dash-dp .panel').nth(1); await h.scrollTo(P); await h.click(P.locator('.seg button').nth(1)); await h.wait(1000); await h.click(P.locator('.seg button').nth(0)); } },
  'F-40': { q: '?d=dp', run: async h => { await h.click(h.p.locator('.dash-dp .kpi', { hasText: /PHYSICAL COUNTERPARTS/i }).first()); const P = h.p.locator('.dash-dp .panel').nth(1); await h.scrollTo(P); await h.click(P.locator('.seg button').nth(1)); await h.wait(1000); await h.click(P.locator('.seg button').nth(0)); } },
  'F-41': { q: '?d=dp', run: async h => { const P = h.panel('Libraries by Department'); await h.scrollTo(P); await h.click(P.locator('.cgPick').first()); await h.click(h.p.locator('.cgOpts .ms-Checkbox', { hasText: 'RM' }).first()); await h.esc(); await h.wait(1200); } },
  'F-42': { q: '?d=dp', run: async h => { const P = h.panel('Libraries by Department'); await h.scrollTo(P); for (const b of ['Documents', 'Records', 'Users']) { await h.click(P.locator('.seg button', { hasText: b })); await h.wait(800); } } },
  'F-50': { q: '?imp=1', run: async h => { await h.click(h.p.locator('.impOpen')); await h.wait(800); await h.hover(h.p.locator('.impPanel button', { hasText: 'Download Excel template' })); await h.wait(900); await h.hover(h.p.locator('.impDrop')); await h.wait(900); await h.click(h.p.locator('.impX')); } }
};

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(S);
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  for (const id of ids) {
    const sc = S[id];
    const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, acceptDownloads: true }, STEPS ? {} : { recordVideo: { dir: RAW, size: { width: W, height: H } } }));
    const t0 = Date.now();
    const p = await ctx.newPage();
    try {
      await p.goto(PAGE + (sc.q || ''));
      await p.waitForTimeout(1200);
      if (!STEPS) await p.evaluate(CURSOR);
      const h = helpers(p, id);
      await p.mouse.move(800, 500);
      const start = (Date.now() - t0) / 1000;
      await h.wait(700);
      await sc.run(h);
      await h.wait(1300);
      await h.finish();
      const end = (Date.now() - t0) / 1000;
      if (STEPS) { await ctx.close(); console.log('OK', id, 'steps'); continue; }
      const vp = await p.video().path();
      await ctx.close();
      const mp4 = path.join(OUT, id + '.mp4');
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', start.toFixed(2), '-to', end.toFixed(2), '-i', vp,
        '-vf', 'fps=30,scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', '-an', mp4]);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.3', '-i', mp4, '-frames:v', '1', path.join(OUT, id + '.png')]);
      fs.unlinkSync(vp);
      console.log('OK', id, (end - start).toFixed(1) + 's');
    } catch (e) {
      console.log('FAIL', id, e.message.split('\n')[0]);
      await ctx.close().catch(() => {});
    }
  }
  await b.close();
})();
