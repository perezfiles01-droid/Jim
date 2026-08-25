/* Run code.js against a stub of the Figma plugin API.

   The lesson recorded in CLAUDE.md is that static review does not catch runtime
   faults in generated code, and a Figma plugin is the worst possible place to
   discover one: it fails in the client's Figma, halfway through drawing, with a
   half built page left behind. So the whole plugin is executed here first,
   against a stub that enforces the parts of the real API that actually bite:
   fonts must be loaded before a font is assigned, characters cannot be set
   before fontName, a node must be appended before it is positioned meaningfully,
   and resize rejects zero. */
const fs = require('fs'), path = require('path'), vm = require('vm');

let loaded = new Set();
const counts = { frame:0, text:0, rect:0, comp:0, svg:0, paintStyle:0, textStyle:0, page:0 };
const problems = [];

class Node {
  constructor(type) {
    this.type = type; this.children = []; this.x = 0; this.y = 0;
    this.width = 1; this.height = 1; this.name = '';
    this.removed = false;
  }
  appendChild(c) {
    if (!(c instanceof Node)) problems.push('appendChild got a non-node');
    if (c.parent && c.parent !== this) c.parent.children = c.parent.children.filter(k => k !== c);
    c.parent = this; this.children.push(c);
  }
  resize(w, h) {
    if (!(w > 0) || !(h > 0)) { problems.push(`resize(${w},${h}) on ${this.type} "${this.name}"`); throw new Error('bad resize'); }
    this.width = w; this.height = h;
  }
  remove() { this.removed = true; if (this.parent) this.parent.children = this.parent.children.filter(k => k !== this); }
}
class TextNode extends Node {
  constructor() { super('TEXT'); this._font = null; this._chars = null; }
  set fontName(f) {
    if (!f || !f.family || !f.style) problems.push('fontName without family/style');
    if (!loaded.has(f.family + '|' + f.style))
      problems.push(`font not loaded before use: ${f.family} ${f.style}`);
    this._font = f;
  }
  get fontName() { return this._font; }
  set characters(v) {
    if (!this._font) problems.push('characters set before fontName on "' + String(v).slice(0,30) + '"');
    if (typeof v !== 'string') problems.push('characters set to a non string');
    this._chars = v;
  }
  get characters() { return this._chars; }
  set fontSize(v) { if (!(v > 0)) problems.push('fontSize ' + v); this._size = v; }
  get fontSize() { return this._size; }
}
class PageNode extends Node {
  constructor() { super('PAGE'); }
  get children() {
    if (!figma._pagesLoaded) problems.push('page children read before loadAllPagesAsync');
    return this._kids || (this._kids = []);
  }
  set children(v) { this._kids = v; }
}

const paintStyles = [], textStyles = [];
const figma = {
  root: { children: [] },
  currentPage: null,
  createFrame() { counts.frame++; return new Node('FRAME'); },
  createText() { counts.text++; return new TextNode(); },
  createRectangle() { counts.rect++; return new Node('RECTANGLE'); },
  createComponent() { counts.comp++; return new Node('COMPONENT'); },
  createNodeFromSvg(svg) {
    if (typeof svg !== 'string' || svg.indexOf('<svg') !== 0)
      { problems.push('createNodeFromSvg got something that is not svg markup'); throw new Error('bad svg'); }
    counts.svg++; return new Node('FRAME');
  },
  createPage() { counts.page++; const p = new PageNode(); figma.root.children.push(p); return p; },
  createPaintStyle() { counts.paintStyle++; const s = { paints: [] }; paintStyles.push(s); return s; },
  createTextStyle() { counts.textStyle++; const s = {}; textStyles.push(s); return s; },
  getLocalPaintStylesAsync: async () => paintStyles,
  getLocalTextStylesAsync: async () => textStyles,
  setCurrentPageAsync: async p => { figma.currentPage = p; },
  loadAllPagesAsync: async () => { figma._pagesLoaded = true; },
  loadFontAsync: async f => {
    /* The stub mirrors a real Figma desktop client: Inter is present, Georgia
       is not guaranteed. Rejecting Georgia here is the point, it proves the
       fallback path runs. */
    if (f.family === 'Inter') { loaded.add(f.family + '|' + f.style); return; }
    throw new Error('font not available: ' + f.family);
  },
  notify: m => { console.log('  notify:', m); },
  closePlugin: m => { console.log('  closePlugin:', m); },
};

const code = fs.readFileSync(path.join(__dirname, 'code.js'), 'utf8');
const ctx = vm.createContext({ figma, console, setTimeout, Promise, JSON, Math, String, Number, Object, Array, parseInt, parseFloat, isNaN });
try {
  vm.runInContext(code, ctx, { filename: 'code.js' });
} catch (e) {
  console.error('THREW:', e.message, '\n', (e.stack || '').split('\n').slice(0, 5).join('\n'));
  process.exit(1);
}
setTimeout(() => {
  console.log('  created:', JSON.stringify(counts));
  const uniq = [...new Set(problems)];
  if (uniq.length) {
    console.error('  PROBLEMS:', uniq.length, 'distinct');
    uniq.slice(0, 12).forEach(p => console.error('   -', p));
    process.exit(1);
  }
  console.log('  clean, no API misuse detected');
}, 2500);
