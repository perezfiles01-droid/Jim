/* Shared styling helpers for the facilitation script document. */
const D = require("docx");
const { Paragraph, TextRun, HeadingLevel, BorderStyle, ShadingType,
        Table, TableRow, TableCell, WidthType, convertInchesToTwip } = D;

const NAVY = "003D5B", TEAL = "009B8A", INK = "333333", MUTE = "6B7280";
const ORANGE = "C05621", RED = "9B2C2C";
const PANEL = "F4F7F8", TINT = "E8F7F5", BAND = "FFF7ED";

const PAGE_W = 12240, PAGE_H = 15840;
const MARGIN = convertInchesToTwip(0.9);
const TEXT_W = PAGE_W - 2 * MARGIN;

function p(text, o = {}) {
  return new Paragraph({
    spacing: { before: o.before ?? 60, after: o.after ?? 60, line: o.line ?? 264 },
    indent: o.indent, alignment: o.align, border: o.border,
    shading: o.shading, keepNext: o.keepNext,
    children: (Array.isArray(text) ? text : [{ t: text }]).map(r =>
      new TextRun({
        text: r.t, bold: r.bold ?? o.bold, italics: r.italics ?? o.italics,
        color: r.color ?? o.color ?? INK, size: r.size ?? o.size ?? 21,
        font: "Calibri", allCaps: r.caps ?? o.caps,
        characterSpacing: r.spc ?? o.spc,
      })),
  });
}

function block(tag, tagColor, lines, o = {}) {
  const out = [];
  out.push(new Paragraph({
    spacing: { before: 140, after: 40 }, keepNext: true,
    children: [new TextRun({ text: tag, bold: true, color: tagColor,
      size: 17, font: "Calibri", allCaps: true, characterSpacing: 30 })],
  }));
  (Array.isArray(lines) ? lines : [lines]).forEach(l => {
    out.push(new Paragraph({
      spacing: { before: 30, after: 30, line: 264 },
      indent: { left: convertInchesToTwip(0.18) },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: tagColor, space: 10 } },
      children: typeof l === "string"
        ? [new TextRun({ text: l, size: 21, font: "Calibri", color: INK, italics: o.italics })]
        : l.map(r => new TextRun({ text: r.t, bold: r.bold,
            italics: r.italics ?? o.italics, color: r.color ?? INK,
            size: 21, font: "Calibri" })),
    }));
  });
  return out;
}

function switchCue(text) {
  return new Paragraph({
    spacing: { before: 180, after: 180 },
    shading: { type: ShadingType.CLEAR, fill: BAND },
    border: {
      top:    { style: BorderStyle.SINGLE, size: 8,  color: ORANGE, space: 8 },
      bottom: { style: BorderStyle.SINGLE, size: 8,  color: ORANGE, space: 8 },
      left:   { style: BorderStyle.SINGLE, size: 24, color: ORANGE, space: 10 },
      right:  { style: BorderStyle.SINGLE, size: 8,  color: ORANGE, space: 8 },
    },
    children: [
      new TextRun({ text: "SWITCH NOW   ", bold: true, color: ORANGE,
        size: 20, font: "Calibri", characterSpacing: 30 }),
      new TextRun({ text: text, bold: true, color: NAVY, size: 21, font: "Calibri" }),
    ],
  });
}

function h1(t) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 140 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 6 } },
    children: [new TextRun({ text: t, bold: true, color: NAVY, size: 30, font: "Calibri" })],
  });
}
function h2(t) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 100 }, keepNext: true,
    children: [new TextRun({ text: t, bold: true, color: NAVY, size: 25, font: "Calibri" })],
  });
}
function h3(t) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 70 }, keepNext: true,
    children: [new TextRun({ text: t, bold: true, color: TEAL, size: 22, font: "Calibri" })],
  });
}

function cell(text, o = {}) {
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: (Array.isArray(text) ? text : [text]).map(t =>
      new Paragraph({
        spacing: { before: 20, after: 20, line: 250 },
        children: [new TextRun({ text: t, bold: o.bold, size: o.size ?? 20,
          font: "Calibri", color: o.color ?? INK, allCaps: o.caps,
          characterSpacing: o.caps ? 25 : undefined })],
      })),
  });
}

function table(widths, headers, rows) {
  const total = widths.reduce((a, b) => a + b, 0);
  const trs = [];
  if (headers) {
    trs.push(new TableRow({ tableHeader: true,
      children: headers.map((h, i) => cell(h, { w: widths[i], fill: NAVY,
        color: "FFFFFF", bold: true, size: 18, caps: true })) }));
  }
  rows.forEach((r, ri) => {
    trs.push(new TableRow({ children: r.map((c, i) =>
      cell(c, { w: widths[i], fill: ri % 2 ? PANEL : undefined,
                bold: i === 0 && String(c).length < 30 })) }));
  });
  return new Table({ columnWidths: widths,
    width: { size: total, type: WidthType.DXA }, rows: trs });
}

module.exports = { D, p, block, switchCue, h1, h2, h3, table, cell,
  NAVY, TEAL, INK, MUTE, ORANGE, RED, PANEL, TINT, BAND,
  PAGE_W, PAGE_H, MARGIN, TEXT_W };
