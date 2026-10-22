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
