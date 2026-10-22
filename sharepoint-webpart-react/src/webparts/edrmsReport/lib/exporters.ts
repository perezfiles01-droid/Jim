// Export table (Excel) and Export to PDF.
// Both libraries are bundled with the web part and loaded only when a reader
// first exports, so they never slow down the first view.

export type Cell = string | number;

export interface IExportTable {
  /** File name without extension. */
  name: string;
  head: string[];
  rows: Cell[][];
  /** Optional total row, drawn in bold. */
  total?: Cell[];
}

/** Writes an .xlsx in the house style: ADB blue header, banding, filters. */
export async function exportTable(t: IExportTable): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX: any = await import(/* webpackChunkName: 'edrms-xlsx' */ 'xlsx-js-style');
  const aoa: Cell[][] = [t.head, ...t.rows];
  if (t.total) aoa.push(t.total);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const thin = { style: 'thin', color: { rgb: 'D9E1EA' } };
  const box = { top: thin, bottom: thin, left: thin, right: thin };
  const nR = aoa.length, nC = t.head.length;
  for (let r = 0; r < nR; r++) {
    for (let c = 0; c < nC; c++) {
      const a = XLSX.utils.encode_cell({ r, c });
      const x = ws[a] || (ws[a] = { t: 's', v: '' });
      const hd = r === 0, tot = !!t.total && r === nR - 1;
      x.s = {
        font: { name: 'Segoe UI', sz: hd ? 11 : 10, bold: hd || tot, color: { rgb: hd ? 'FFFFFF' : '10243E' } },
        fill: { patternType: 'solid', fgColor: { rgb: hd ? '194F8E' : tot ? 'DCEAF7' : r % 2 === 0 ? 'EAF3FB' : 'FFFFFF' } },
        alignment: { vertical: 'center', horizontal: x.t === 'n' ? 'right' : 'left', wrapText: hd },
        border: box
      };
    }
  }
  ws['!cols'] = t.head.map((h, c) => ({
    wch: Math.min(60, Math.max(h.length + 2, ...aoa.map(row => String(row[c] === undefined ? '' : row[c]).length + 2)))
  }));
  ws['!rows'] = [{ hpt: 26 }];
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: nR - 1 - (t.total ? 1 : 0), c: nC - 1 } }) };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, t.name.slice(0, 31));
  XLSX.writeFile(wb, t.name + '.xlsx');
}

/** Draws the element as a picture and saves it as a landscape A4 PDF, page by page. */
export async function exportPdf(el: HTMLElement, name: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import(/* webpackChunkName: 'edrms-pdf' */ 'html2canvas'),
    import(/* webpackChunkName: 'edrms-pdf' */ 'jspdf')
  ]);
  el.classList.add('edrms-printing');
  try {
    const canvas = await html2canvas(el, { scale: 1.5, backgroundColor: '#EEF2F6', useCORS: true, logging: false });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 20;
    const w = pw - m * 2, scale = w / canvas.width, sliceH = Math.floor((ph - m * 2) / scale);
    for (let y = 0, page = 0; y < canvas.height; y += sliceH, page++) {
      const part = document.createElement('canvas');
      part.width = canvas.width;
      part.height = Math.min(sliceH, canvas.height - y);
      const ctx = part.getContext('2d');
      if (!ctx) break;
      ctx.drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height);
      if (page) pdf.addPage();
      pdf.addImage(part.toDataURL('image/jpeg', 0.88), 'JPEG', m, m, w, part.height * scale);
    }
    pdf.save(name + '.pdf');
  } finally {
    el.classList.remove('edrms-printing');
  }
}

/* ---------- PowerPoint (RAC Item 8, 22 Oct 2026) ---------- */

export interface IPptMeta {
  /** Dashboard name, e.g. "Bank-wide Oversight". */
  name: string;
  /** The dashboard's one-line description. */
  desc: string;
  asOf: string;
  filter: string;
}

/* Controls that do nothing on a slide are left out of the pictures. */
const PPT_HIDE = '.search,.fBtn,.xpBtn,.pager,.pbtns,.pinfo,.info,.infoWrap,input[type=search]{display:none!important}';

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
const clean = (el: Element | null): string => {
  if (!el) return '';
  const c = el.cloneNode(true) as HTMLElement;
  c.querySelectorAll('.info,.infoWrap,svg').forEach(x => x.remove());
  return (c.textContent || '').replace(/\s+/g, ' ').trim();
};

interface IShot { title: string; on?: number; canvas: HTMLCanvasElement; breaks: number[]; blocks: number[]; tops: number[] }

/**
 * Pictures one panel, and records where rows, charts and blocks end (in
 * canvas pixels) so a tall picture can be split there instead of through a row.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function shoot(h2c: any, el: HTMLElement, title: string, on?: number): Promise<IShot> {
  const scale = 2;
  let breaks: number[] = [], blocks: number[] = [], tops: number[] = [], boxW = 0;
  // Measured in html2canvas's own copy of the page, after the controls are hidden,
  // because that copy is what the picture shows (its layout can differ from the screen).
  const measure = (root: HTMLElement): void => {
    const box = root.getBoundingClientRect();
    boxW = box.width;
    const at = (q: string, edge: 'top' | 'bottom'): number[] => Array.from(root.querySelectorAll(q))
      .map(x => (x as HTMLElement).getBoundingClientRect())
      .filter(r => r.height > 0).map(r => r[edge] - box.top).sort((x, y) => x - y);
    // Rows are where a cut is allowed; blocks (a chart, a control bar) are where it is better;
    // just above a table is best, so the header stays with its rows.
    breaks = at('tbody tr, .hbar, .drow, .ctl, .chart, .split, .strip, .kpis, .note, .psub, h3, svg', 'bottom');
    blocks = at('.ctl, .chart, .split, .strip, .kpis', 'bottom');
    tops = at('table', 'top').map(v => v - 3);
  };
  const canvas: HTMLCanvasElement = await h2c(el, {
    scale, backgroundColor: '#FFFFFF', useCORS: true, logging: false,
    onclone: (doc: Document, clone: HTMLElement) => {
      const s = doc.createElement('style'); s.textContent = PPT_HIDE; doc.head.appendChild(s);
      if (clone) measure(clone);
    }
  });
  const k = boxW ? canvas.width / boxW : scale, px = (v: number[]): number[] => v.map(x => Math.round(x * k));
  return { title, on, canvas, breaks: px(breaks), blocks: px(blocks), tops: px(tops) };
}

/** Cuts a canvas into pieces no taller than maxH, each ending on a recorded break. */
function slices(c: HTMLCanvasElement, breaks: number[], blocks: number[], tops: number[], maxH: number): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  let y = 0;
  while (y < c.height) {
    let end = Math.min(c.height, y + maxH);
    if (end < c.height) {
      const fit = (list: number[]): number[] => list.filter(b => b > y + maxH * 0.4 && b <= end);
      // Best: just above a table. Then: after a block. Last resort: after a row.
      const ok = fit(tops).length ? fit(tops) : fit(blocks).length ? fit(blocks) : fit(breaks);
      if (ok.length) end = ok[ok.length - 1] + 4;
    }
    const p = document.createElement('canvas');
    p.width = c.width; p.height = end - y;
    const ctx = p.getContext('2d');
    if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, p.width, p.height); ctx.drawImage(c, 0, y, c.width, p.height, 0, 0, c.width, p.height); }
    out.push(p);
    y = end;
  }
  return out;
}

/**
 * One slide per breakdown (every card, opened in turn) and per section below,
 * as on screen without the controls. A tall picture continues on a second
 * slide rather than being shrunk. Leaves the reader's open card as it was.
 */
export async function exportPptx(dashEl: HTMLElement, meta: IPptMeta): Promise<void> {
  const [{ default: html2canvas }, pptxMod] = await Promise.all([
    import(/* webpackChunkName: 'edrms-pdf' */ 'html2canvas'),
    import(/* webpackChunkName: 'edrms-pptx' */ 'pptxgenjs')
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PptxGenJS: any = (pptxMod as any).default || pptxMod;
  const cards = Array.from(dashEl.querySelectorAll<HTMLElement>('.kpis .kpi'));
  const info = cards.map(c => ({ lab: clean(c.querySelector('.lab')), val: clean(c.querySelector('.val')) }));
  const openIdx = Math.max(0, cards.findIndex(c => c.classList.contains('on')));
  const drill = (): HTMLElement | null => {
    const k = dashEl.querySelector('.kpis');
    const host = (k && k.closest('section.panel')) || k;
    let n = host ? host.nextElementSibling : null;
    while (n && !n.matches('section.panel')) n = n.nextElementSibling;
    return n as HTMLElement | null;
  };
  const shots: IShot[] = [];
  for (let i = 0; i < cards.length; i++) {
    (dashEl.querySelectorAll<HTMLElement>('.kpis .kpi')[i]).click();
    await wait(450);
    const d = drill();
    if (d) shots.push(await shoot(html2canvas, d, info[i].lab, i));
  }
  // Every section after the breakdown: a band's title, then its panel.
  const after = drill();
  let n = after ? after.nextElementSibling : null, title = '';
  while (n) {
    if (n.classList.contains('band')) title = clean(n.querySelector('h2'));
    else if (n.matches('section.panel')) shots.push(await shoot(html2canvas, n as HTMLElement, title || clean(n.querySelector('h3'))));
    n = n.nextElementSibling;
  }
  if (cards.length) dashEl.querySelectorAll<HTMLElement>('.kpis .kpi')[openIdx].click();

  const P = new PptxGenJS();
  P.layout = 'LAYOUT_WIDE';
  P.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
  P.title = 'EDRMS Utilization Report - ' + meta.name;
  const kw = 2.5, aw = 12.33 - kw - 0.3;
  shots.forEach(sh => {
    const top = sh.on !== undefined ? 2.55 : 1.45, ah = 6.85 - top;
    // Split where the picture would otherwise shrink below 85% of the area's width.
    const maxH = Math.round(sh.canvas.width * ah / (aw * 0.85));
    slices(sh.canvas, sh.breaks, sh.blocks, sh.tops, maxH).forEach((part, pi) => {
      const s = P.addSlide();
      s.background = { color: 'FFFFFF' };
      s.addText(sh.title + (pi ? ' (continued)' : ''), { x: 0.5, y: 0.35, w: 8.6, h: 0.55, fontSize: 28, bold: true, color: '10243E', isTextBox: true, margin: 0 });
      s.addText(meta.name + (meta.desc ? '  ·  ' + meta.desc : ''), { x: 0.5, y: 0.92, w: 8.6, h: 0.45, fontSize: 13, color: '33475F', valign: 'top', isTextBox: true, margin: 0 });
      s.addText([{ text: 'Data as of ', options: { color: '33475F' } }, { text: meta.asOf, options: { bold: true, color: '10243E', breakLine: true } }, { text: meta.filter, options: { color: '6B7A8C' } }],
        { x: 9.2, y: 0.38, w: 3.63, h: 0.7, fontSize: 11, align: 'right', valign: 'top', isTextBox: true, margin: 0 });
      if (sh.on !== undefined) {
        const gap = 0.2, cw = (12.33 - gap * (info.length - 1)) / info.length;
        info.forEach((k, i) => {
          const x = 0.5 + i * (cw + gap), on = i === sh.on;
          s.addShape(P.ShapeType.roundRect, { x, y: 1.45, w: cw, h: 0.9, rectRadius: 0.08, fill: { color: on ? 'EAF3FB' : 'FFFFFF' }, line: { color: on ? '0072BC' : 'D9E1EA', width: on ? 1.25 : 0.75 } });
          s.addText(k.lab, { x: x + 0.15, y: 1.55, w: cw - 0.3, h: 0.3, fontSize: 11, color: '6B7A8C', isTextBox: true, margin: 0, fit: 'shrink' });
          s.addText(k.val, { x: x + 0.15, y: 1.85, w: cw - 0.3, h: 0.42, fontSize: 22, bold: true, color: '10243E', isTextBox: true, margin: 0 });
        });
      }
      const ratio = part.width / part.height;
      let w = aw, h = w / ratio;
      if (h > ah) { h = ah; w = h * ratio; }
      s.addImage({ data: part.toDataURL('image/png'), x: 0.5, y: top, w, h });
      const kx = 12.83 - kw;
      s.addShape(P.ShapeType.roundRect, { x: kx, y: top, w: kw, h: ah, rectRadius: 0.08, fill: { color: 'F5F8FC' }, line: { color: 'D9E1EA', width: 0.75 } });
      s.addText('Key points', { x: kx + 0.18, y: top + 0.15, w: kw - 0.36, h: 0.35, fontSize: 14, bold: true, color: '10243E', isTextBox: true, margin: 0 });
      s.addText([0, 1, 2].map(j => ({ text: 'Add a key point', options: { bullet: true, breakLine: j < 2 } })),
        { x: kx + 0.18, y: top + 0.6, w: kw - 0.36, h: 1.8, fontSize: 12, italic: true, color: '6B7A8C', valign: 'top', paraSpaceAfter: 6, isTextBox: true, margin: 0 });
      s.addText('Asian Development Bank', { x: 0.5, y: 7.05, w: 6, h: 0.3, fontSize: 10, color: '6B7A8C', isTextBox: true, margin: 0 });
      s.addNotes('Exported from the EDRMS Utilization Report, ' + meta.name + '. Data as of ' + meta.asOf + '. The chart or table is a picture; the title, cards and key points are editable. Editable figures are in the Excel export.');
    });
  });
  const d = new Date(), stamp = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  await P.writeFile({ fileName: 'EDRMS ' + meta.name + ' ' + stamp + '.pptx' });
}
