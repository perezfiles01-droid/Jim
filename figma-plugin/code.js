
// Live Extraction: Fetch latest design.json from GitHub
// This ensures the plugin always reflects the current prototype state.
// On each run, the plugin fetches the latest design.json, so no rebuild needed.

(async () => {
  try {
    // Show loading indicator
    figma.showUI(
      '<div style="font-family: Inter, sans-serif; padding: 20px; text-align: center; color: #666;">' +
      '<p style="margin: 0 0 8px 0;">🔄 Loading design from GitHub...</p>' +
      '<p style="margin: 0; font-size: 12px; color: #999;">Fetching latest prototype state</p>' +
      '</div>',
      { width: 320, height: 120 }
    );

    // Fetch design.json from GitHub Pages
    const GITHUB_URL = 'https://perezfiles01-droid.github.io/Jim/figma-plugin/design.json';
    const response = await fetch(GITHUB_URL);

    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ': Failed to fetch design from GitHub');
    }

    var DESIGN = await response.json();

    // Validate design object
    if (!DESIGN.tokens || !DESIGN.screens || !DESIGN.nav) {
      throw new Error('Invalid design data structure from GitHub');
    }

    // All runtime.js code will run here with DESIGN available in scope
/* ============================================================================
   ADB EDRMS Utilization Report, Figma plugin.

   Draws the whole prototype into the open Figma file: one page of six dashboard
   frames, plus a design system page carrying the ADB palette as colour styles,
   the type scale as text styles, and the recurring pieces as components.

   Everything below is drawn from DESIGN, which extract_design.js reads off the
   rendered prototype. Nothing here is a hand transcription of a screen, which
   is why the plugin stays correct when the prototype changes: re-run the
   extractor, rebuild, run the plugin again.
   ========================================================================== */

const PAGE_DESIGN = 'EDRMS Report, dashboards';
const PAGE_SYSTEM = 'EDRMS Report, design system';
const GAP = 160;                 /* space between dashboard frames */
const PAD = 0;

/* Figma ships Inter. Georgia is a system font and may not be present, so the
   serif face is resolved once at startup and falls back rather than throwing
   halfway through drawing a screen. */
const FONTS = {};
async function loadFonts() {
  const wanted = [
    ['Inter', 'Regular'], ['Inter', 'Medium'],
    ['Inter', 'Semi Bold'], ['Inter', 'Bold'],
  ];
  for (const [family, style] of wanted) {
    try { await figma.loadFontAsync({ family, style }); FONTS[family + '|' + style] = true; }
    catch (e) { FONTS[family + '|' + style] = false; }
  }
  for (const cand of [['Georgia', 'Regular'], ['Georgia', 'Bold']]) {
    try { await figma.loadFontAsync({ family: cand[0], style: cand[1] });
          FONTS[cand[0] + '|' + cand[1]] = true; }
    catch (e) { FONTS[cand[0] + '|' + cand[1]] = false; }
  }
}
function faceFor(serif, weight) {
  const bold = weight >= 700, semi = weight >= 600, med = weight >= 500;
  if (serif) {
    const style = bold || semi ? 'Bold' : 'Regular';
    if (FONTS['Georgia|' + style]) return { family: 'Georgia', style };
  }
  let style = 'Regular';
  if (bold) style = 'Bold'; else if (semi) style = 'Semi Bold'; else if (med) style = 'Medium';
  if (!FONTS['Inter|' + style]) style = 'Regular';
  return { family: 'Inter', style };
}

const solid = c => [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a }];
const ALIGN = { left: 'LEFT', right: 'RIGHT', center: 'CENTER', start: 'LEFT', end: 'RIGHT' };

/* --------------------------------------------------------------- styles --- */
const PAINT = {};
async function makeColorStyles() {
  const pretty = {
    ink: 'Ink', ink2: 'Ink secondary', blue: 'Blue', 'blue-d': 'Blue dark',
    teal: 'Teal', green: 'Green', orange: 'Orange', greyblue: 'Grey blue',
    deepblue: 'Deep blue', bg: 'Background', card: 'Card', line: 'Line',
    mut: 'Muted', nav: 'Navigation', 'nav-hi': 'Navigation highlight',
  };
  const existing = await figma.getLocalPaintStylesAsync();
  const byName = {};
  existing.forEach(s => { byName[s.name] = s; });
  for (const key of Object.keys(DESIGN.tokens.colors)) {
    const hex = DESIGN.tokens.colors[key];
    if (!hex) continue;
    const c = hexToRgb(hex);
    if (!c) continue;
    const name = 'ADB/' + (pretty[key] || key);
    let st = byName[name];
    if (!st) { st = figma.createPaintStyle(); st.name = name; }
    st.paints = [{ type: 'SOLID', color: c }];
    PAINT[key] = st;
  }
}
function hexToRgb(h) {
  h = (h || '').trim().replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (isNaN(n)) return null;
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

/* The type scale is not invented here: it is every distinct size and weight the
   prototype actually renders, counted, with the rare ones dropped. */
function typeScale() {
  const seen = {};
  const visit = n => {
    if (n.kind === 'text' && n.font) {
      const k = [Math.round(n.font.size), n.font.weight, n.font.serif ? 'serif' : 'sans'].join('|');
      seen[k] = (seen[k] || 0) + 1;
    }
    (n.children || []).forEach(visit);
  };
  DESIGN.screens.forEach(s => visit(s.tree));
  return Object.keys(seen)
    .map(k => { const p = k.split('|');
      return { size: +p[0], weight: +p[1], serif: p[2] === 'serif', count: seen[k] }; })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.size - a.size || b.weight - a.weight);
}
async function makeTextStyles(scale) {
  const existing = await figma.getLocalTextStylesAsync();
  const byName = {};
  existing.forEach(s => { byName[s.name] = s; });
  const out = [];
  for (const t of scale) {
    const f = faceFor(t.serif, t.weight);
    const name = 'ADB/' + (t.serif ? 'Serif' : 'Sans') + '/' + t.size + ' ' + f.style;
    let st = byName[name];
    if (!st) { st = figma.createTextStyle(); st.name = name; }
    st.fontName = f;
    st.fontSize = t.size;
    out.push({ name, t, style: st });
  }
  return out;
}

/* ---------------------------------------------------------------- draw ---- */
let COUNT = { frames: 0, texts: 0, svgs: 0, skipped: 0 };

function nameFor(n) {
  if (n.cls) return n.cls.split(/\s+/).slice(0, 2).join(' ');
  return n.tag;
}

function drawNode(n, parent, ox, oy) {
  if (n.kind === 'svg') {
    let node;
    try { node = figma.createNodeFromSvg(n.svg); }
    catch (e) { COUNT.skipped += 1; return null; }
    node.name = 'chart';
    node.x = n.x - ox; node.y = n.y - oy;
    try { node.resize(Math.max(1, n.w), Math.max(1, n.h)); } catch (e) {}
    parent.appendChild(node);
    COUNT.svgs += 1;
    return node;
  }

  if (n.kind === 'text') {
    /* A text node still carries its own box: the caption chips and the table
       cells are coloured boxes with text in them, and dropping the box would
       lose the fill. Draw the box only when it actually paints something. */
    let box = null;
    if (n.fill || n.stroke) {
      box = figma.createFrame();
      box.name = nameFor(n);
      box.x = n.x - ox; box.y = n.y - oy;
      box.resize(Math.max(1, n.w), Math.max(1, n.h));
      paintBox(box, n);
      parent.appendChild(box);
      COUNT.frames += 1;
    }
    const t = figma.createText();
    const f = faceFor(n.font.serif, n.font.weight);
    t.fontName = f;
    t.characters = n.font.upper ? n.text.toUpperCase() : n.text;
    t.fontSize = Math.max(1, n.font.size);
    if (n.font.color) t.fills = solid(n.font.color);
    if (n.font.tracking) t.letterSpacing = { unit: 'PIXELS', value: n.font.tracking };
    if (n.font.lh) t.lineHeight = { unit: 'PIXELS', value: n.font.lh };
    t.textAlignHorizontal = ALIGN[n.font.align] || 'LEFT';
    /* A cell that is much taller than its type is a flex box centring its text.
       Top aligning it in Figma would drop every table cell to the top of its
       row, which reads as broken even though every number is right. */
    t.textAlignVertical = n.h >= n.font.size * 1.8 ? 'CENTER' : 'TOP';
    t.textAutoResize = 'NONE';
    t.name = n.text.slice(0, 40);
    const host = box || parent;
    const hx = box ? 0 : n.x - ox, hy = box ? 0 : n.y - oy;
    t.x = hx; t.y = hy;
    try { t.resize(Math.max(1, n.w), Math.max(1, n.h)); } catch (e) {}
    host.appendChild(t);
    COUNT.texts += 1;
    return box || t;
  }

  const f = figma.createFrame();
  f.name = nameFor(n);
  f.x = n.x - ox; f.y = n.y - oy;
  f.resize(Math.max(1, n.w), Math.max(1, n.h));
  paintBox(f, n);
  f.clipsContent = false;
  parent.appendChild(f);
  COUNT.frames += 1;
  (n.children || []).forEach(c => drawNode(c, f, n.x, n.y));
  return f;
}

function paintBox(f, n) {
  f.fills = n.fill ? solid(n.fill) : [];
  if (n.radius) f.cornerRadius = n.radius;
  if (n.stroke && n.strokeW) {
    const w = n.strokeW;
    f.strokes = solid(n.stroke);
    /* CSS borders are per side. Figma has one stroke weight per side too, but
       only on a frame, and only when the individual weights are set. */
    f.strokeTopWeight = w.t; f.strokeBottomWeight = w.b;
    f.strokeLeftWeight = w.l; f.strokeRightWeight = w.r;
    f.strokeAlign = 'INSIDE';
  }
  if (n.shadow) {
    f.effects = [{ type: 'DROP_SHADOW', color: { r: 0.06, g: 0.14, b: 0.24, a: 0.10 },
      offset: { x: 0, y: 4 }, radius: 14, spread: 0, visible: true, blendMode: 'NORMAL' }];
  }
}

/* The left navigation lives outside #view, so it is rebuilt rather than walked.
   It is the same on every screen except which row is highlighted. */
function drawNav(parent, h, activeKey) {
  const nav = DESIGN.nav;
  const f = figma.createFrame();
  f.name = 'nav';
  f.x = 0; f.y = 0;
  f.resize(nav.w, h);
  f.fills = solid(hexAlpha(DESIGN.tokens.colors.nav));
  parent.appendChild(f);

  let y = 18;
  nav.brand.forEach((line, i) => {
    const t = figma.createText();
    t.fontName = faceFor(i === 0, i === 0 ? 400 : 400);
    t.characters = i === 1 ? line.toUpperCase() : line;
    t.fontSize = i === 0 ? 18 : 10;
    t.fills = solid(i === 0 ? { r: 1, g: 1, b: 1, a: 1 } : hexAlpha('#7FA8CC'));
    if (i === 1) t.letterSpacing = { unit: 'PIXELS', value: 1.4 };
    t.x = 18; t.y = y;
    t.resize(nav.w - 36, i === 0 ? 24 : 14);
    f.appendChild(t);
    y += i === 0 ? 26 : 18;
    COUNT.texts += 1;
  });
  y += 14;

  nav.items.forEach(it => {
    const on = it.key ? it.key === activeKey : it.on;
    if (on) {
      const hi = figma.createFrame();
      hi.name = 'nav row, active';
      hi.x = 0; hi.y = y - 6;
      hi.resize(nav.w, 32);
      hi.fills = solid(hexAlpha(DESIGN.tokens.colors['nav-hi']));
      f.appendChild(hi);
      const bar = figma.createRectangle();
      bar.name = 'active bar';
      bar.x = 0; bar.y = y - 6; bar.resize(3, 32);
      bar.fills = solid(hexAlpha(DESIGN.tokens.colors.green));
      f.appendChild(bar);
      COUNT.frames += 2;
    }
    const t = figma.createText();
    t.fontName = faceFor(false, on ? 600 : 400);
    t.characters = it.text;
    t.fontSize = 13.5;
    t.fills = solid(hexAlpha(on ? '#FFFFFF' : (it.dis ? '#4C6079' : '#C7D3E0')));
    t.x = 18; t.y = y;
    t.resize(nav.w - 30, 20);
    f.appendChild(t);
    COUNT.texts += 1;
    y += 32;
  });
  return f;
}
function hexAlpha(h) { const c = hexToRgb(h) || { r: 0, g: 0, b: 0 }; return { r: c.r, g: c.g, b: c.b, a: 1 }; }

/* ------------------------------------------------------------- components - */
/* Components are made from the first real instance of each recurring piece,
   cloned onto the system page. Making every screen occurrence an instance would
   be a lie: they carry different content and different widths. */
const COMPONENT_TARGETS = [
  ['kpi', 'KPI tile'],
  ['tile', 'Stat tile'],
  ['panel', 'Panel'],
  ['band', 'Section band'],
  ['dhead', 'Table header'],
  ['drow', 'Table row'],
];
function findByClass(n, cls) {
  if (n.cls && n.cls.split(/\s+/).indexOf(cls) >= 0) return n;
  const kids = n.children || [];
  for (let i = 0; i < kids.length; i++) {
    const hit = findByClass(kids[i], cls);
    if (hit) return hit;
  }
  return null;
}
function makeComponents(page) {
  let x = 0;
  const made = [];
  COMPONENT_TARGETS.forEach(pair => {
    const cls = pair[0], label = pair[1];
    let found = null;
    for (let i = 0; i < DESIGN.screens.length && !found; i++)
      found = findByClass(DESIGN.screens[i].tree, cls);
    if (!found) return;
    const holder = figma.createFrame();
    holder.name = 'tmp';
    holder.resize(Math.max(1, found.w), Math.max(1, found.h));
    page.appendChild(holder);
    drawNode(found, holder, found.x, found.y);
    const inner = holder.children.slice();
    const comp = figma.createComponent();
    comp.name = 'ADB/' + label;
    comp.resize(Math.max(1, found.w), Math.max(1, found.h));
    comp.x = x; comp.y = 0;
    inner.forEach(ch => comp.appendChild(ch));
    page.appendChild(comp);
    holder.remove();
    x += found.w + 40;
    made.push(label);
  });
  return made;
}

/* ------------------------------------------------------------------ run --- */
async function run() {
  /* The manifest declares documentAccess: dynamic-page, so Figma loads pages
     lazily. Reading figma.root.children to find our own pages, and reading a
     found page's children to clear it, both require every page to be loaded
     first. Skipping this is the classic dynamic-page plugin crash. */
  await figma.loadAllPagesAsync();
  await loadFonts();
  await makeColorStyles();
  const scale = typeScale();
  const styles = await makeTextStyles(scale);

  /* Reuse the pages if the plugin has run before, so a second run replaces the
     drawing instead of stacking a second copy beside it. */
  const pages = figma.root.children;
  const findPage = name => {
    for (let i = 0; i < pages.length; i++) if (pages[i].name === name) return pages[i];
    return null;
  };
  let dp = findPage(PAGE_DESIGN);
  if (dp) { dp.children.slice().forEach(c => c.remove()); }
  else { dp = figma.createPage(); dp.name = PAGE_DESIGN; }
  let sp = findPage(PAGE_SYSTEM);
  if (sp) { sp.children.slice().forEach(c => c.remove()); }
  else { sp = figma.createPage(); sp.name = PAGE_SYSTEM; }

  await figma.setCurrentPageAsync(dp);

  let x = 0;
  DESIGN.screens.forEach((s, i) => {
    const total = DESIGN.nav.w + s.w;
    const frame = figma.createFrame();
    frame.name = (i + 1) + '. ' + s.title;
    frame.x = x; frame.y = 0;
    frame.resize(total, s.h + PAD);
    frame.fills = solid(hexAlpha(DESIGN.tokens.colors.bg));
    frame.clipsContent = true;
    dp.appendChild(frame);

    drawNav(frame, s.h + PAD, s.key);

    const body = figma.createFrame();
    body.name = 'view';
    body.x = DESIGN.nav.w; body.y = 0;
    body.resize(s.w, s.h + PAD);
    body.fills = solid(hexAlpha(DESIGN.tokens.colors.bg));
    body.clipsContent = false;
    frame.appendChild(body);
    (s.tree.children || []).forEach(c => drawNode(c, body, 0, 0));

    x += total + GAP;
  });

  await figma.setCurrentPageAsync(sp);
  const made = makeComponents(sp);

  /* A legend on the system page, so the file explains itself to whoever opens
     it next rather than relying on this conversation. */
  const note = figma.createText();
  note.fontName = faceFor(false, 400);
  note.characters =
    'ADB EDRMS Utilization Report, generated from the prototype on ' + DESIGN.generated + '.\n' +
    'Source: index.html at perezfiles01-droid.github.io/Jim. Do not hand edit as a source of ' +
    'truth: re-run the plugin after the prototype changes.\n\n' +
    'Colour styles: ADB/…   Text styles: ADB/Sans and ADB/Serif   Components: ' +
    (made.length ? made.join(', ') : 'none found') + '\n' +
    'Charts are real vectors, imported from the prototype\'s own SVG.';
  note.fontSize = 14;
  note.x = 0; note.y = -160;
  note.resize(900, 120);
  sp.appendChild(note);

  await figma.setCurrentPageAsync(dp);
  figma.notify('EDRMS report drawn: ' + DESIGN.screens.length + ' dashboards, ' +
    COUNT.frames + ' frames, ' + COUNT.texts + ' text, ' + COUNT.svgs + ' charts');
  figma.closePlugin(
    'Done. ' + DESIGN.screens.length + ' dashboards on "' + PAGE_DESIGN + '", ' +
    Object.keys(PAINT).length + ' colour styles, ' + styles.length + ' text styles, ' +
    made.length + ' components on "' + PAGE_SYSTEM + '".' +
    (COUNT.skipped ? ' ' + COUNT.skipped + ' chart(s) could not be parsed.' : ''));
}

  } catch (error) { console.error("Plugin error:", error); figma.showUI('<div style="font-family: Inter, sans-serif; padding: 16px; color: #c00;"><p style="margin: 0 0 8px 0;"><strong>⚠️ Plugin error</strong></p><p style="margin: 0; font-size: 12px; line-height: 1.5;">' + error.message + '</p></div>', { width: 400, height: 140 }); } })();
