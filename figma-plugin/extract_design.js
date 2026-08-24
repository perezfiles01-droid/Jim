/* Read the rendered prototype and emit design.json: the tokens, and one layout
   tree per dashboard.

   The tree is taken from the LIVE RENDER, not from the source, because the
   source is CSS and the thing we need is the resolved geometry: what colour a
   box actually ended up, where it actually sits, how wide it actually is. This
   is the same reason the checkers in this project screenshot the page rather
   than reading the file.

   Two rules make the output importable rather than merely accurate:
     1. Every SVG is captured as its own markup, so the plugin can hand it to
        figma.createNodeFromSvg and get native vectors instead of a picture.
     2. Text is only emitted on leaf elements. A parent whose text content is
        just its children's text would otherwise be drawn twice, once as a box
        and once as a duplicate string on top of it. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const KEYS = [
  ['bw', 'Bank-wide Oversight'],
  ['dp', 'Department Insights'],
  ['pj', 'Project Insights'],
  ['fp', 'Institutional File Plan'],
  ['rd', 'Retention and Disposal'],
  ['ra', 'Records and Archive Holdings'],
];
const WIDTH = 1440;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: WIDTH, height: 1200 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'assert') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, '..', 'index.html'), { waitUntil: 'load' });

  const tokens = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const names = ['ink','ink2','blue','blue-d','teal','green','orange','greyblue',
                   'deepblue','bg','card','line','mut','nav','nav-hi'];
    const colors = {};
    names.forEach(n => { colors[n] = cs.getPropertyValue('--' + n).trim(); });
    return { colors };
  });

  const screens = [];
  for (const [key, title] of KEYS) {
    await p.evaluate(k => switchTo(k), key);
    await p.waitForTimeout(350);
    const tree = await p.evaluate(() => {
      const root = document.querySelector('#view > section');
      const base = root.getBoundingClientRect();
      const px = v => Math.round(parseFloat(v) || 0);
      /* rgb() and rgba() out of getComputedStyle, into the {r,g,b,a} 0..1 that
         the Figma plugin API wants. Anything fully transparent returns null so
         the plugin can skip the fill entirely rather than paint clear paint. */
      const col = v => {
        if (!v) return null;
        const m = v.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const n = m[1].split(',').map(s => parseFloat(s.trim()));
        const a = n.length > 3 ? n[3] : 1;
        if (a === 0) return null;
        return { r: n[0] / 255, g: n[1] / 255, b: n[2] / 255, a };
      };
      const SKIP = new Set(['SCRIPT', 'STYLE']);

      function walk(el, depth) {
        if (SKIP.has(el.tagName)) return null;
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') return null;
        const r = el.getBoundingClientRect();
        if (r.width < 0.5 || r.height < 0.5) return null;

        if (el.tagName === 'svg') {
          return { kind: 'svg', x: r.left - base.left, y: r.top - base.top,
                   w: r.width, h: r.height, svg: el.outerHTML };
        }

        const kids = [...el.children].map(c => walk(c, depth + 1)).filter(Boolean);
        /* Leaf text only. A node with element children never carries text of
           its own here, even when textContent says it does. */
        const ownText = kids.length === 0 ? el.textContent.replace(/\s+/g, ' ').trim() : '';

        const node = {
          kind: ownText ? 'text' : 'box',
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') || '').trim(),
          x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height,
          fill: col(s.backgroundColor),
          radius: px(s.borderTopLeftRadius),
          children: kids,
        };
        const bw = px(s.borderTopWidth), bwl = px(s.borderLeftWidth),
              bwr = px(s.borderRightWidth), bwb = px(s.borderBottomWidth);
        if (bw || bwl || bwr || bwb) {
          node.stroke = col(s.borderTopColor) || col(s.borderLeftColor);
          node.strokeW = { t: bw, l: bwl, r: bwr, b: bwb };
        }
        if (s.boxShadow && s.boxShadow !== 'none') node.shadow = true;
        if (ownText) {
          node.text = ownText;
          node.font = { size: parseFloat(s.fontSize), weight: parseInt(s.fontWeight, 10) || 400,
                        color: col(s.color), align: s.textAlign,
                        serif: /Georgia|serif/i.test(s.fontFamily),
                        upper: s.textTransform === 'uppercase',
                        tracking: parseFloat(s.letterSpacing) || 0,
                        lh: parseFloat(s.lineHeight) || 0 };
        }
        return node;
      }
      const t = walk(root, 0);
      return { w: base.width, h: root.scrollHeight || base.height, tree: t };
    });
    screens.push({ key, title, ...tree });
    console.log(key.padEnd(3), Math.round(tree.w) + 'x' + Math.round(tree.h),
      'nodes', JSON.stringify(tree.tree).length);
  }

  /* The left navigation is part of the design and is not inside #view, so it is
     captured once and drawn on every screen by the plugin. */
  const nav = await p.evaluate(() => {
    const el = document.getElementById('side');
    const r = el.getBoundingClientRect();
    const items = [...el.querySelectorAll('nav a')].map(a => ({
      text: a.textContent.replace(/\s+/g, ' ').trim(),
      on: a.classList.contains('on'), dis: a.classList.contains('dis'),
      key: a.dataset.d || '',
    }));
    const brand = [...el.querySelectorAll('.brand > *')].map(x => x.textContent.trim());
    const groups = [...el.querySelectorAll('.grp')].map(x => x.textContent.trim());
    return { w: r.width, brand, items, groups };
  });

  const out = { generated: new Date().toISOString().slice(0, 10), width: WIDTH,
                tokens, nav, screens };
  fs.writeFileSync(path.join(__dirname, 'design.json'), JSON.stringify(out));
  const kb = Math.round(fs.statSync(path.join(__dirname, 'design.json')).size / 1024);
  console.log('design.json', kb + 'KB', '| errors:', errs.length ? errs : 'none');
  await b.close();
})();
