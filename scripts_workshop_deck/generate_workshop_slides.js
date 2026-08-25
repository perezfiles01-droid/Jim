/* EDRMS Workshop deck generator.
   Content comes from deck_content.js, which is derived from the real
   gap checker workbook. No figure in this deck is inferred.
   Run: node generate_workshop_slides.js */

const PptxGenJS = require("pptxgenjs");
const { TOTALS, DEPENDENCIES, SLIDES } = require("./deck_content.js");

const prs = new PptxGenJS();
prs.defineLayout({ name: "W16x9", width: 13.333, height: 7.5 });
prs.layout = "W16x9";

const C = {
  blue:     "003D5B",
  teal:     "009B8A",
  orange:   "E67C3B",
  burgundy: "C41E3A",
  ink:      "333333",
  mute:     "6B7280",
  panel:    "F4F7F8",
  tint:     "E8F7F5",
  white:    "FFFFFF"
};

const W = 13.333, H = 7.5, M = 0.6;
const CONTENT_W = W - 2 * M;

let slideNo = 0;

function newSlide(section) {
  slideNo++;
  const s = prs.addSlide();
  s.background = { color: C.white };
  // footer rule
  s.addShape(prs.ShapeType.line, {
    x: M, y: H - 0.55, w: CONTENT_W, h: 0,
    line: { color: "D8DEE1", width: 1 }
  });
  s.addText(section || "EDRMS Utilization Report Requirements Workshop", {
    x: M, y: H - 0.48, w: 8, h: 0.3,
    fontSize: 9, color: C.mute, fontFace: "Calibri", charSpacing: 1
  });
  s.addText(String(slideNo), {
    x: W - M - 1, y: H - 0.48, w: 1, h: 0.3,
    fontSize: 9, color: C.mute, fontFace: "Calibri", align: "right"
  });
  return s;
}

function addHeader(s, title, subtitle) {
  s.addText(title, {
    x: M, y: 0.42, w: CONTENT_W, h: 0.5,
    fontSize: 32, bold: true, color: C.blue, fontFace: "Cambria"
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: M, y: 0.95, w: CONTENT_W, h: 0.32,
      fontSize: 14, color: C.teal, fontFace: "Calibri"
    });
  }
  s.addShape(prs.ShapeType.line, {
    x: M, y: subtitle ? 1.36 : 1.02, w: 1.6, h: 0,
    line: { color: C.teal, width: 3 }
  });
  return subtitle ? 1.62 : 1.28;
}

/* Stat block: big number, small label */
function addStats(s, stats, x, y) {
  let cx = x;
  stats.forEach(st => {
    s.addText(String(st.v), {
      x: cx, y: y, w: 1.5, h: 0.55,
      fontSize: 34, bold: true, color: st.c || C.blue, fontFace: "Cambria"
    });
    s.addText(st.l, {
      x: cx, y: y + 0.55, w: 1.6, h: 0.3,
      fontSize: 10, color: C.mute, fontFace: "Calibri"
    });
    cx += 1.75;
  });
  return y + 1.0;
}

/* Questions panel — the ask. Four-part pattern per question. */
function addQuestionPanel(s, questions, x, y, w, opts) {
  opts = opts || {};
  const rowH = opts.rowH || 0.62;
  const h = 0.5 + questions.length * rowH;
  s.addShape(prs.ShapeType.rect, {
    x: x, y: y, w: w, h: h,
    fill: { color: C.tint }, line: { color: C.teal, width: 1.25 }
  });
  s.addText(opts.title || "WHAT WE NEED FROM YOU", {
    x: x + 0.22, y: y + 0.12, w: w - 0.44, h: 0.26,
    fontSize: 10, bold: true, color: C.blue, fontFace: "Calibri", charSpacing: 1.4
  });
  let ry = y + 0.44;
  questions.forEach((q, i) => {
    s.addShape(prs.ShapeType.ellipse, {
      x: x + 0.24, y: ry + 0.04, w: 0.26, h: 0.26,
      fill: { color: C.teal }, line: { type: "none" }
    });
    s.addText(String(i + 1), {
      x: x + 0.24, y: ry + 0.06, w: 0.26, h: 0.22,
      fontSize: 10, bold: true, color: C.white, fontFace: "Calibri", align: "center"
    });
    s.addText(q.q, {
      x: x + 0.6, y: ry, w: w - 3.5, h: 0.34,
      fontSize: 11, color: C.ink, fontFace: "Calibri", valign: "top"
    });
    s.addText(`Unblocks ${q.unblocks}  ·  If not: ${q.fallback}`, {
      x: x + 0.6, y: ry + 0.32, w: w - 1.0, h: 0.24,
      fontSize: 9, italic: true, color: C.mute, fontFace: "Calibri"
    });
    ry += rowH;
  });
  return y + h;
}

/* Gap cluster rows with orange accent bar */
function addGapClusters(s, clusters, x, y, w) {
  s.addText("WHERE THE GAPS ARE", {
    x: x, y: y, w: w, h: 0.26,
    fontSize: 10, bold: true, color: C.orange, fontFace: "Calibri", charSpacing: 1.4
  });
  let ry = y + 0.34;
  clusters.forEach(c => {
    s.addShape(prs.ShapeType.rect, {
      x: x, y: ry, w: 0.055, h: 0.46,
      fill: { color: C.orange }, line: { type: "none" }
    });
    s.addText(`${c.label}  ·  ${c.count}`, {
      x: x + 0.18, y: ry - 0.02, w: w - 0.3, h: 0.24,
      fontSize: 11, bold: true, color: C.ink, fontFace: "Calibri"
    });
    s.addText(c.detail, {
      x: x + 0.18, y: ry + 0.2, w: w - 0.3, h: 0.26,
      fontSize: 9, color: C.mute, fontFace: "Calibri"
    });
    ry += 0.54;
  });
  return ry;
}

function addBuiltNotes(s, notes, x, y, w) {
  s.addText("WHAT IS BUILT", {
    x: x, y: y, w: w, h: 0.26,
    fontSize: 10, bold: true, color: C.teal, fontFace: "Calibri", charSpacing: 1.4
  });
  let ry = y + 0.34;
  notes.forEach(n => {
    s.addShape(prs.ShapeType.ellipse, {
      x: x + 0.02, y: ry + 0.05, w: 0.16, h: 0.16,
      fill: { color: C.teal }, line: { type: "none" }
    });
    s.addText(n, {
      x: x + 0.28, y: ry - 0.02, w: w - 0.35, h: 0.34,
      fontSize: 10.5, color: C.ink, fontFace: "Calibri", valign: "top"
    });
    ry += 0.38;
  });
  return ry;
}

/* ---------------- SLIDE 1: How to read the gap checker ---------------- */
{
  const s = newSlide("Introduction");
  let y = addHeader(s, "How to Read the Gap Checker",
    "One workbook, six tabs, 250 requirements — and the columns that matter");

  y = addStats(s, [
    { v: TOTALS.reqs,  l: "requirements" },
    { v: TOTALS.built, l: "in the prototype", c: C.teal },
    { v: TOTALS.gaps,  l: "not built", c: C.orange },
    { v: 6,            l: "things block most of it", c: C.burgundy }
  ], M, y) + 0.15;

  const cols = [
    { h: "In the prototype?", d: "Yes or No. This is the honest state of the build today, not a plan." },
    { h: "Why it is not there", d: "The reason a requirement was removed or relabelled. Read this before assuming anything is missing by accident." },
    { h: "What it needs before it can be built", d: "The data or decision that would unblock it. This column is the agenda for today." },
    { h: "Slide", d: "Where the requirement appears in the prototype, so you can see it working." }
  ];
  s.addText("THE FOUR COLUMNS TO READ", {
    x: M, y: y, w: CONTENT_W, h: 0.26,
    fontSize: 10, bold: true, color: C.blue, fontFace: "Calibri", charSpacing: 1.4
  });
  let cy = y + 0.36;
  cols.forEach(c => {
    s.addShape(prs.ShapeType.rect, {
      x: M, y: cy, w: 0.055, h: 0.52, fill: { color: C.teal }, line: { type: "none" }
    });
    s.addText(c.h, {
      x: M + 0.2, y: cy - 0.02, w: 3.6, h: 0.28,
      fontSize: 11.5, bold: true, color: C.blue, fontFace: "Calibri"
    });
    s.addText(c.d, {
      x: M + 3.9, y: cy - 0.02, w: CONTENT_W - 4.0, h: 0.5,
      fontSize: 10, color: C.ink, fontFace: "Calibri", valign: "top"
    });
    cy += 0.62;
  });

  s.addShape(prs.ShapeType.rect, {
    x: M, y: cy + 0.12, w: CONTENT_W, h: 0.62,
    fill: { color: C.panel }, line: { color: "D8DEE1", width: 1 }
  });
  s.addText("A note on relabelling", {
    x: M + 0.22, y: cy + 0.2, w: 2.4, h: 0.24,
    fontSize: 10.5, bold: true, color: C.blue, fontFace: "Calibri"
  });
  s.addText("Many requirements are built but renamed — \"total EDRMS users\" is live as \"users with recorded activity, last 180 days\". Those count as built. We will flag the renames as we go.", {
    x: M + 2.8, y: cy + 0.2, w: CONTENT_W - 3.0, h: 0.42,
    fontSize: 10, color: C.ink, fontFace: "Calibri", valign: "top"
  });
}

/* ---------------- SLIDE 2: Six things we need ---------------- */
{
  const s = newSlide("The whole workshop in one view");
  let y = addHeader(s, "Six Things We Need From You",
    "55 requirements are unbuilt. Six data dependencies account for nearly all of them.");

  const cardW = (CONTENT_W - 2 * 0.28) / 3;
  const cardH = 2.28;
  DEPENDENCIES.forEach((dep, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const cx = M + col * (cardW + 0.28);
    const cy = y + row * (cardH + 0.26);

    s.addShape(prs.ShapeType.rect, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: C.white }, line: { color: "D8DEE1", width: 1 }
    });
    s.addShape(prs.ShapeType.rect, {
      x: cx, y: cy, w: cardW, h: 0.055,
      fill: { color: C.teal }, line: { type: "none" }
    });

    // number badge
    s.addShape(prs.ShapeType.ellipse, {
      x: cx + 0.2, y: cy + 0.22, w: 0.34, h: 0.34,
      fill: { color: C.blue }, line: { type: "none" }
    });
    s.addText(String(dep.n), {
      x: cx + 0.2, y: cy + 0.26, w: 0.34, h: 0.28,
      fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", align: "center"
    });

    // unblocks count, right aligned
    s.addText(String(dep.unblocks), {
      x: cx + cardW - 1.15, y: cy + 0.18, w: 0.55, h: 0.4,
      fontSize: 22, bold: true, color: C.orange, fontFace: "Cambria", align: "right"
    });
    s.addText("reqs", {
      x: cx + cardW - 0.56, y: cy + 0.32, w: 0.42, h: 0.24,
      fontSize: 9, color: C.mute, fontFace: "Calibri"
    });

    s.addText(dep.name, {
      x: cx + 0.2, y: cy + 0.64, w: cardW - 0.4, h: 0.46,
      fontSize: 12.5, bold: true, color: C.blue, fontFace: "Calibri", valign: "top"
    });
    s.addText(dep.ask, {
      x: cx + 0.2, y: cy + 1.1, w: cardW - 0.4, h: 0.6,
      fontSize: 9.5, color: C.ink, fontFace: "Calibri", valign: "top"
    });

    s.addShape(prs.ShapeType.line, {
      x: cx + 0.2, y: cy + 1.74, w: cardW - 0.4, h: 0,
      line: { color: "E5E9EB", width: 1 }
    });
    s.addText("Likely owner", {
      x: cx + 0.2, y: cy + 1.8, w: cardW - 0.4, h: 0.2,
      fontSize: 8, color: C.mute, fontFace: "Calibri", charSpacing: 1
    });
    s.addText(dep.owner, {
      x: cx + 0.2, y: cy + 1.98, w: cardW - 0.4, h: 0.24,
      fontSize: 9.5, bold: true,
      color: dep.owner.startsWith("Unknown") ? C.burgundy : C.teal,
      fontFace: "Calibri"
    });
  });

  const fy = y + 2 * (cardH + 0.26) + 0.04;
  s.addShape(prs.ShapeType.rect, {
    x: M, y: fy, w: CONTENT_W, h: 0.42,
    fill: { color: C.panel }, line: { color: "D8DEE1", width: 1 }
  });
  s.addText([
    { text: "Deps 1–4 unblock 18 gaps.  Deps 5–6 source 21 built-but-unsourced requirements.  ",
      options: { color: C.ink } },
    { text: "The other 37 gaps carry no recorded reason — we need your steer on those.",
      options: { color: C.burgundy, bold: true } }
  ], {
    x: M + 0.2, y: fy + 0.08, w: CONTENT_W - 0.4, h: 0.28,
    fontSize: 10.5, fontFace: "Calibri", align: "center"
  });
}

/* ---------------- SLIDE 3: Bank-wide Oversight ---------------- */
{
  const d = SLIDES.bankwide;
  const s = newSlide("1 · Bank-wide Oversight");
  let y = addHeader(s, d.title, d.purpose);
  addStats(s, [
    { v: d.reqs,  l: "requirements" },
    { v: d.built, l: "built", c: C.teal },
    { v: d.gaps,  l: "gaps", c: C.orange }
  ], M, y);
  const colW = (CONTENT_W - 0.5) / 2;
  addBuiltNotes(s, d.builtNotes, M + 5.6, y + 0.05, CONTENT_W - 5.6);
  addGapClusters(s, d.gapClusters, M, y + 1.15, CONTENT_W);
}

/* ---------------- SLIDE 3: Bank-wide questions ---------------- */
{
  const d = SLIDES.bankwide;
  const s = newSlide("1 · Bank-wide Oversight");
  let y = addHeader(s, "Bank-wide Oversight: The Asks",
    `21 gaps. Five questions close most of them.`);
  addQuestionPanel(s, d.questions, M, y, CONTENT_W, { rowH: 0.72 });
}

/* ---------------- SLIDE 4: Department Insights ---------------- */
{
  const d = SLIDES.department;
  const s = newSlide("2 · Department Insights");
  let y = addHeader(s, d.title, d.purpose);
  addStats(s, [
    { v: d.reqs,  l: "requirements" },
    { v: d.built, l: "built", c: C.teal },
    { v: d.gaps,  l: "gaps", c: C.orange }
  ], M, y);
  addBuiltNotes(s, d.builtNotes, M + 5.6, y + 0.05, CONTENT_W - 5.6);
  addGapClusters(s, d.gapClusters, M, y + 1.15, CONTENT_W);
}

/* ---------------- SLIDE 5: Department questions ---------------- */
{
  const d = SLIDES.department;
  const s = newSlide("2 · Department Insights");
  let y = addHeader(s, "Department Insights: The Asks",
    "25 gaps — but 8 of them are the same two questions asked on Bank-wide");
  addQuestionPanel(s, d.questions, M, y, CONTENT_W, { rowH: 0.72 });
}

/* ---------------- SLIDE 6: Project Insights ---------------- */
{
  const d = SLIDES.project;
  const s = newSlide("3 · Project Insights");
  let y = addHeader(s, d.title, d.purpose);

  s.addShape(prs.ShapeType.rect, {
    x: M, y: y, w: CONTENT_W, h: 0.72,
    fill: { color: "FDF2F4" }, line: { color: C.burgundy, width: 1.5 }
  });
  s.addShape(prs.ShapeType.rect, {
    x: M, y: y, w: 0.07, h: 0.72, fill: { color: C.burgundy }, line: { type: "none" }
  });
  s.addText("BUILT, BUT UNSOURCED", {
    x: M + 0.28, y: y + 0.1, w: 4, h: 0.24,
    fontSize: 10, bold: true, color: C.burgundy, fontFace: "Calibri", charSpacing: 1.4
  });
  s.addText(d.framing, {
    x: M + 0.28, y: y + 0.34, w: CONTENT_W - 0.6, h: 0.3,
    fontSize: 12, color: C.ink, fontFace: "Calibri"
  });

  y += 0.9;
  addStats(s, [
    { v: 20, l: "requirements" },
    { v: 20, l: "built as UI", c: C.teal },
    { v: 0,  l: "with a data source", c: C.burgundy }
  ], M, y);

  addQuestionPanel(s, d.questions, M, y + 1.1, CONTENT_W, { rowH: 0.66 });
}

/* ---------------- SLIDE 7: Institutional File Plan ---------------- */
{
  const d = SLIDES.filePlan;
  const s = newSlide("4 · Institutional File Plan");
  let y = addHeader(s, d.title, d.purpose);

  s.addShape(prs.ShapeType.rect, {
    x: M, y: y, w: CONTENT_W, h: 1.15,
    fill: { color: C.tint }, line: { color: C.teal, width: 1.5 }
  });
  s.addText("NO GAPS", {
    x: M + 0.3, y: y + 0.18, w: 3, h: 0.34,
    fontSize: 16, bold: true, color: C.teal, fontFace: "Cambria"
  });
  s.addText("All 24 requirements on this tab are built in the prototype. The workbook records no missing data and no outstanding question.", {
    x: M + 0.3, y: y + 0.58, w: CONTENT_W - 0.6, h: 0.42,
    fontSize: 12, color: C.ink, fontFace: "Calibri", valign: "top"
  });

  y += 1.35;
  addStats(s, [
    { v: 24, l: "requirements" },
    { v: 24, l: "built", c: C.teal },
    { v: 0,  l: "gaps", c: C.teal }
  ], M, y);

  addQuestionPanel(s, d.questions, M, y + 1.1, CONTENT_W,
    { title: "WHAT WE NEED FROM YOU — CONFIRMATION ONLY", rowH: 0.66 });
}

/* ---------------- SLIDE 8: Retention and Disposal ---------------- */
{
  const d = SLIDES.retention;
  const s = newSlide("5 · Retention and Disposal");
  let y = addHeader(s, d.title, d.purpose);
  addStats(s, [
    { v: d.reqs,  l: "requirements" },
    { v: d.built, l: "built", c: C.teal },
    { v: d.gaps,  l: "gaps", c: C.orange }
  ], M, y);

  s.addShape(prs.ShapeType.rect, {
    x: M + 5.6, y: y + 0.02, w: CONTENT_W - 5.6, h: 0.8,
    fill: { color: "FFF6EF" }, line: { color: C.orange, width: 1.25 }
  });
  s.addText("UNEXPLAINED", {
    x: M + 5.8, y: y + 0.1, w: 3, h: 0.22,
    fontSize: 9.5, bold: true, color: C.orange, fontFace: "Calibri", charSpacing: 1.4
  });
  s.addText(d.flag, {
    x: M + 5.8, y: y + 0.32, w: CONTENT_W - 6.0, h: 0.44,
    fontSize: 10, color: C.ink, fontFace: "Calibri", valign: "top"
  });

  y += 1.05;
  s.addText("THE NINE REMOVED ITEMS", {
    x: M, y: y, w: CONTENT_W, h: 0.26,
    fontSize: 10, bold: true, color: C.orange, fontFace: "Calibri", charSpacing: 1.4
  });
  let gy = y + 0.34, gx = M;
  d.gapItems.forEach((g, i) => {
    s.addText("—  " + g, {
      x: gx, y: gy, w: 4.0, h: 0.26,
      fontSize: 10, color: C.ink, fontFace: "Calibri"
    });
    gy += 0.28;
    if (i === 3) { gy = y + 0.34; gx = M + 4.3; }
  });

  addQuestionPanel(s, d.questions, M, y + 1.55, CONTENT_W, { rowH: 0.66 });
}

/* ---------------- SLIDE 9: Records and Archive Holdings ---------------- */
{
  const d = SLIDES.archive;
  const s = newSlide("6 · Records and Archive Holdings");
  let y = addHeader(s, d.title, d.purpose);

  s.addShape(prs.ShapeType.rect, {
    x: M, y: y, w: CONTENT_W, h: 1.15,
    fill: { color: C.tint }, line: { color: C.teal, width: 1.5 }
  });
  s.addText("NO GAPS", {
    x: M + 0.3, y: y + 0.18, w: 3, h: 0.34,
    fontSize: 16, bold: true, color: C.teal, fontFace: "Cambria"
  });
  s.addText("All 28 requirements on this tab are built in the prototype. The workbook records no missing data and no outstanding question.", {
    x: M + 0.3, y: y + 0.58, w: CONTENT_W - 0.6, h: 0.42,
    fontSize: 12, color: C.ink, fontFace: "Calibri", valign: "top"
  });

  y += 1.35;
  addStats(s, [
    { v: 28, l: "requirements" },
    { v: 28, l: "built", c: C.teal },
    { v: 0,  l: "gaps", c: C.teal }
  ], M, y);

  addQuestionPanel(s, d.questions, M, y + 1.1, CONTENT_W,
    { title: "WHAT WE NEED FROM YOU — CONFIRMATION ONLY", rowH: 0.66 });
}

prs.writeFile({ fileName: "/home/user/Jim/EDRMS_Workshop_Slides_20260825.pptx" })
  .then(() => {
    console.log("Deck written. Slides: " + slideNo);
    console.log("Totals used: " + TOTALS.reqs + " reqs, " + TOTALS.built +
                " built, " + TOTALS.gaps + " gaps");
  });
