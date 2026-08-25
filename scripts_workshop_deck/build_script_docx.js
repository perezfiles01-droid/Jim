/* Builds the EDRMS workshop facilitation script.
   Run: node build_script_docx.js */
const fs = require("fs");
const S = require("./script_style.js");
const { D, p, block, switchCue, h1, h2, h3, table } = S;
const { Document, Packer, Paragraph, TextRun, PageBreak, TableOfContents,
        AlignmentType, BorderStyle, ShadingType, convertInchesToTwip,
        Header, Footer, PageNumber } = D;

const body = [];
const W = S.TEXT_W;

/* ───────────────────────────── title ───────────────────────────── */
body.push(
  new Paragraph({ spacing: { before: 1500, after: 0 },
    children: [new TextRun({ text: "EDRMS UTILIZATION REPORT", bold: true,
      color: S.TEAL, size: 22, font: "Calibri", characterSpacing: 60 })] }),
  new Paragraph({ spacing: { before: 120, after: 0 },
    children: [new TextRun({ text: "Reconfirmation Workshop", bold: true,
      color: S.NAVY, size: 56, font: "Calibri" })] }),
  new Paragraph({ spacing: { before: 60, after: 200 },
    children: [new TextRun({ text: "Facilitation Script", color: S.NAVY,
      size: 40, font: "Calibri" })] }),
  new Paragraph({ spacing: { before: 0, after: 400 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: S.TEAL, space: 10 } },
    children: [new TextRun({ text: "R2026.4  ·  August 2026  ·  Approximately 90 minutes",
      color: S.MUTE, size: 21, font: "Calibri" })] }),
  p([{ t: "Read this once before the session. " , bold: true },
     { t: "You do not need to memorise it. Every segment follows the same six blocks, so once you have read one you know them all. The lines under SAY are written out in full so you can read them aloud if the room goes quiet." }],
    { size: 22 }),
  new Paragraph({ children: [new PageBreak()] }),
);

/* ───────────────────────────── TOC ───────────────────────────── */
body.push(h1("Contents"));
body.push(new TableOfContents("Contents", {
  hyperlink: true, headingStyleRange: "1-3",
}));
body.push(new Paragraph({ children: [new PageBreak()] }));

/* ═══════════════════ PART A — BEFORE YOU START ═══════════════════ */
body.push(h1("Part A — Before You Start"));

body.push(h2("The one rule that runs the whole session"));
body.push(p([{ t: "Every item that is not built gets exactly one of two answers, and you do not leave it until it has one." }]));
body.push(...block("DOOR 1 — WHERE DO WE GET IT", S.TEAL, [
  [{ t: "They name a system, a file, a report or a person. " , bold: true },
   { t: "That is a source. Write it down and move on. We will build it." }],
]));
body.push(...block("DOOR 2 — SHOULD WE STILL INCLUDE IT", S.RED, [
  [{ t: "There is no source, or it is not worth the effort to create one. ", bold: true },
   { t: "Then it comes out of scope, agreed in the room and written down. That is a good outcome, not a failure." }],
]));
body.push(p([{ t: "There is no third door. ", bold: true },
  { t: "“We will look into it” is not an answer — it is Door 1 without a name on it. When you hear it, close it with: " },
  { t: "“Who owns finding that out, and by when?”", italics: true, color: S.NAVY },
  { t: " Then write the name and the date. Now it is Door 1." }]));

body.push(p([{ t: "Say this rule out loud at the start. ", bold: true },
  { t: "It is what makes the session finish on time, because the client learns the shape of every question before the first one arrives." }],
  { shading: { type: ShadingType.CLEAR, fill: S.TINT },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: S.TEAL, space: 10 },
              top: { style: BorderStyle.SINGLE, size: 4, color: S.TEAL, space: 8 },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: S.TEAL, space: 8 },
              right: { style: BorderStyle.SINGLE, size: 4, color: S.TEAL, space: 8 } },
    before: 200, after: 200 }));

body.push(h2("Set up your screen before anyone joins"));
body.push(p("Do this ten minutes early. Fumbling between windows in front of the client is the fastest way to lose the room."));
body.push(table([600, 3100, 5948],
  ["#", "Do this", "Why it matters"],
  [
    ["1", "Open the deck and start the slideshow, then press Esc",
     "The show is loaded and ready; Esc leaves you on the slide without the black screen."],
    ["2", "Open the gap checker workbook in a second window",
     "You will move between the two perhaps a dozen times. It must already be open."],
    ["3", "Close everything else",
     "Alt+Tab should have exactly two destinations. Test it three times."],
    ["4", "In the workbook, click each of the six tabs once",
     "Excel remembers the last cell per tab, so this puts every tab at the top before you share."],
    ["5", "Share the whole screen, not a single window",
     "Sharing one window means the client sees nothing when you switch. This is the most common failure."],
    ["6", "Have a blank note open, or paper",
     "For names and dates that do not belong in a cell."],
  ]));

body.push(h2("The switch discipline"));
body.push(p([{ t: "The deck answers ", }, { t: "why", bold: true },
  { t: ". The workbook answers " }, { t: "which", bold: true },
  { t: ". You are never in both for the same purpose, and that is what keeps the session from drifting." }]));
body.push(table([2400, 7248],
  ["When you are in", "You are doing this"],
  [
    ["The deck", "Explaining the purpose of a dashboard, the logic of what we built, and the shape of the ask. No row-level detail. No scrolling."],
    ["The workbook", "Working through the actual items. Naming sources. Typing answers into cells while they watch."],
  ]));
body.push(p([{ t: "Every switch in this script is marked with an orange SWITCH NOW bar. ", bold: true },
  { t: "If you are skimming mid-session, those bars are the only thing you need to find." }]));

body.push(h2("What finished looks like"));
body.push(p("At the end of each dashboard segment, before you move on, check that:"));
body.push(...block("THE CHECK", S.NAVY, [
  "Every red row you opened has either a named source, or an agreed decision to drop it.",
  "Every measure we renamed or swapped has been said out loud and not objected to.",
  "Anything parked has a person's name and a date against it.",
]));
body.push(p([{ t: "If you cannot say all three, do not move to the next dashboard. ", bold: true },
  { t: "Losing five minutes here is cheaper than a second workshop." }]));

body.push(new Paragraph({ children: [new PageBreak()] }));

/* ═══════════════════ PART B — RUN SHEET ═══════════════════ */
body.push(h1("Part B — Run Sheet"));
body.push(p("One line per segment. Keep this page open on a phone or printed beside you."));
body.push(table([900, 900, 2400, 5448],
  ["Time", "Mins", "On screen", "Do not move on until"],
  [
    ["0:00", "6",  "Deck, slides 1–3",       "They understand the two doors and the colour key."],
    ["0:06", "17", "Deck 4–5, then Tab 1",   "Division has an owner. The user register has an owner or is dropped."],
    ["0:23", "19", "Deck 6–7, then Tab 2",   "Visitors-versus-visits is accepted. Division confirmed as one answer for both."],
    ["0:42", "12", "Deck 8–9, then Tab 3",   "Someone is named as owning project attributes, or the page is deferred."],
    ["0:54", "8",  "Deck 10–11, then Tab 4", "They confirm the file plan structure, or name what is wrong with it."],
    ["1:02", "12", "Deck 12–13, then Tab 5", "They accept retention now, disposal later — or say plainly that they do not."],
    ["1:14", "10", "Deck 14–15, then Tab 6", "They either name a source we have not seen, or agree to defer."],
    ["1:24", "6",  "Workbook, all tabs",          "You have read every decision back and nobody has objected."],
  ]));
body.push(p([{ t: "If you are running late, ", bold: true },
  { t: "cut the walk-through of what is built — never the questions. The built items are visible in the prototype at any time; the answers only exist while these people are in the room." }]));

body.push(new Paragraph({ children: [new PageBreak()] }));

/* ───────────────────── assemble ───────────────────── */
try {
  const seg = require("./script_segments.js");
  body.push(...seg.build(S));
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") throw e;
}
try {
  const app = require("./script_appendix.js");
  body.push(...app.build(S));
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") throw e;
}

const doc = new Document({
  creator: "EDRMS Utilization Report",
  title: "Reconfirmation Workshop — Facilitation Script",
  styles: { default: { document: { run: { font: "Calibri", size: 21, color: S.INK } } } },
  sections: [{
    properties: {
      page: { size: { width: S.PAGE_W, height: S.PAGE_H },
              margin: { top: S.MARGIN, bottom: S.MARGIN,
                        left: S.MARGIN, right: S.MARGIN } },
    },
    headers: { default: new Header({ children: [ new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D8DEE1", space: 6 } },
      children: [new TextRun({ text: "EDRMS Reconfirmation Workshop · Facilitation Script",
        color: S.MUTE, size: 16, font: "Calibri" })] }) ] }) },
    footers: { default: new Footer({ children: [ new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ children: [PageNumber.CURRENT],
        color: S.MUTE, size: 16, font: "Calibri" })] }) ] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then(b => {
  const out = "/home/user/Jim/EDRMS_Workshop_Facilitation_Script_20260825.docx";
  fs.writeFileSync(out, b);
  console.log("written:", out, Math.round(b.length / 1024) + "KB");
});
