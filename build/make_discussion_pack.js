const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, LevelFormat, convertInchesToTwip, PageOrientation,
  Footer, PageNumber, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const NAVY = "1F3864", BLUE = "2E5A88", GREY = "595959", RED = "9C2B2B", GREEN = "1F6B3B";
const HDRFILL = "1F3864", BANDFILL = "EDF1F7", ALTFILL = "F7F9FC";
const CW = 10080; // content width in dxa (Letter, 0.75" margins)

const P = (text, o = {}) => new Paragraph({
  spacing: { before: o.before ?? 60, after: o.after ?? 100, line: 264 },
  alignment: o.align,
  indent: o.indent,
  border: o.border,
  children: [new TextRun({ text, bold: o.bold, italics: o.italics, color: o.color, size: o.size ?? 20, font: "Calibri" })]
});

const RUNS = (parts, o = {}) => new Paragraph({
  spacing: { before: o.before ?? 60, after: o.after ?? 100, line: 264 },
  indent: o.indent,
  children: parts.map(p => new TextRun({ text: p[0], bold: p[1] === 'b', italics: p[1] === 'i', color: p[2], size: o.size ?? 20, font: "Calibri" }))
});

const B = (text, lvl = 0, o = {}) => new Paragraph({
  numbering: { reference: "bul", level: lvl },
  spacing: { before: 30, after: 50, line: 264 },
  children: [new TextRun({ text, size: o.size ?? 20, font: "Calibri", bold: o.bold, color: o.color, italics: o.italics })]
});

const BR = (parts, lvl = 0) => new Paragraph({
  numbering: { reference: "bul", level: lvl },
  spacing: { before: 30, after: 50, line: 264 },
  children: parts.map(p => new TextRun({ text: p[0], bold: p[1] === 'b', italics: p[1] === 'i', color: p[2], size: 20, font: "Calibri" }))
});

const H1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 240, after: 140 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 6 } },
  children: [new TextRun({ text: t, bold: true, color: NAVY, size: 30, font: "Calibri" })]
});
const H2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 220, after: 100 },
  children: [new TextRun({ text: t, bold: true, color: BLUE, size: 24, font: "Calibri" })]
});
const H3 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 170, after: 70 },
  children: [new TextRun({ text: t, bold: true, color: NAVY, size: 21, font: "Calibri" })]
});

const cell = (text, w, o = {}) => new TableCell({
  width: { size: w, type: WidthType.DXA },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
  margins: { top: 70, bottom: 70, left: 100, right: 100 },
  verticalAlign: "top",
  columnSpan: o.span,
  children: (Array.isArray(text) ? text : [text]).map(t => new Paragraph({
    spacing: { before: 10, after: 10, line: 250 },
    alignment: o.align,
    children: [new TextRun({ text: t, bold: o.bold, italics: o.italics, color: o.color ?? (o.head ? "FFFFFF" : undefined), size: o.size ?? 18, font: "Calibri" })]
  }))
});

const TBL = (widths, headers, rows, opts = {}) => {
  const trs = [];
  if (headers) trs.push(new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, widths[i], { head: true, bold: true, fill: HDRFILL, size: opts.hsize ?? 18 }))
  }));
  rows.forEach((r, ri) => {
    if (r.__band) {
      trs.push(new TableRow({ children: [cell(r.__band, CW, { bold: true, fill: BANDFILL, color: NAVY, span: widths.length, size: 18 })] }));
      return;
    }
    trs.push(new TableRow({
      children: r.map((c, i) => cell(c, widths[i], { fill: ri % 2 ? ALTFILL : undefined, size: opts.size ?? 18, bold: opts.boldFirst && i === 0 }))
    }));
  });
  return new Table({
    columnWidths: widths,
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "AAB4C4" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "AAB4C4" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "AAB4C4" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "AAB4C4" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "C6CEDC" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "C6CEDC" }
    },
    rows: trs
  });
};

const SPACER = () => new Paragraph({ spacing: { after: 120 }, children: [] });
const PB = () => new Paragraph({ children: [new PageBreak()] });

const CALLOUT = (title, lines) => new Table({
  columnWidths: [CW],
  width: { size: CW, type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: "9BB0CC" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "9BB0CC" },
    left: { style: BorderStyle.SINGLE, size: 18, color: NAVY },
    right: { style: BorderStyle.SINGLE, size: 4, color: "9BB0CC" },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
  },
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: CW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: BANDFILL, color: "auto" },
      margins: { top: 120, bottom: 120, left: 160, right: 140 },
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, color: NAVY, size: 20, font: "Calibri" })] }),
        ...lines.map(l => new Paragraph({ spacing: { after: 50, line: 260 }, children: [new TextRun({ text: l, size: 19, font: "Calibri" })] }))
      ]
    })]
  })]
});

// ============================================================ CONTENT
const doc = [];

// ---------- TITLE
doc.push(new Paragraph({
  spacing: { after: 40 },
  children: [new TextRun({ text: "EDRMS UTILIZATION REPORT", bold: true, color: BLUE, size: 22, font: "Calibri" })]
}));
doc.push(new Paragraph({
  spacing: { after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: NAVY, space: 8 } },
  children: [new TextRun({ text: "Discussion Pack: RAC and ITD Sessions", bold: true, color: NAVY, size: 40, font: "Calibri" })]
}));
doc.push(RUNS([
  ["Prepared from ", 'n'], ["EDRMS_Utilization_Dashboard_Checker.xlsx", 'b'],
  [" — 6 dashboard sheets, 251 requirement rows. Every statement in this pack traces to a row in that workbook.", 'n']
], { size: 19 }));
doc.push(SPACER());

doc.push(TBL([2200, 7880], null, [
  ["Two sessions", "Session 1 — RAC (business, non technical). Session 2 — ITD (technical)."],
  ["The workbook", "6 sheets, one per dashboard. 251 requirement rows. Columns: Requirement Item, Type, In the Mockup?, Slide, Why it is not there, What it needs before it can be built."],
  ["Headline count", "193 rows are in the mockup. 54 rows are not. 4 are continuation rows."],
  ["What RAC decides", "Definitions, labels, and which of the five registers they will supply."],
  ["What ITD decides", "Sources, the document scan, division, disposal, and the change requests behind them."],
  ["Your single goal", "Leave both rooms with a named owner and a date against every open row."]
], { boldFirst: true }));

doc.push(SPACER());
doc.push(CALLOUT("The one sentence to open both meetings with", [
  "Everything the report says about declared records can be built today, because declared records already exist in the database.",
  "Everything that needs a denominator — documents, users, libraries, projects, the file plan — cannot be built yet, because nothing we can reach counts them.",
  "That single fact explains all 54 removals and every question in this pack."
]));

doc.push(SPACER());
doc.push(H2("What each dashboard looks like right now"));
doc.push(TBL([2100, 900, 900, 6180],
  ["Dashboard", "Rows", "In mockup", "Where it stands, in one line"],
  [
    ["1. Bank-wide Oversight", "66", "44 of 66", "Largely buildable. The ten tiles, the site overview, the trend and the comparison all have a source. Blocked: the two project tiles, everything per division, and every disposal outcome."],
    ["2. Department Insights", "86", "59 of 86", "The biggest sheet and the most complete. Sites, records, counterparts, disposal due and site visits all work. Blocked: library level detail, division, employment type, go-live date."],
    ["3. Project Insights", "20", "20 of 20", "Drawn in full and sourced by nothing. All 20 rows wait on a site to project register, and the eight profile fields also wait on an ADB project system nobody has named."],
    ["4. Institutional File Plan", "24", "24 of 24", "Drawn in full and sourced by nothing. All 24 rows wait on one thing: the file plan term list, and confirmation of where it is maintained."],
    ["5. Retention and Disposal", "27", "18 of 27", "The retention half is fully buildable from the database. The disposal half is not: no system records an approval, a decline, an extension or a disposal."],
    ["6. Records and Archive Holdings", "28", "28 of 28", "One row of 28 has a source (physical counterparts identified). The other 27 need a physical archive system that this project cannot reach."]
  ]));

doc.push(PB());

// ============================================================ PART 1 RAC
doc.push(H1("PART 1 — SESSION WITH RAC (business, non technical)"));

doc.push(H2("What you are trying to get out of the room"));
doc.push(B("Show them the six dashboards as screens, not as data. They should react to shapes and labels, not to sources."));
doc.push(B("Get the definitions settled. Seventeen words in their own deck mean more than one thing, and the report cannot be built until each means exactly one."));
doc.push(B("Get a yes or no on the five registers only they can produce. Nothing else on your critical path is theirs."));
doc.push(B("Explain the label changes before they spot them. Twenty five things are on the screen under a different name than they asked for. Every one has a reason."));
doc.push(B("Do not debug in the room. Anything technical goes on the parking list and into the ITD session."));

doc.push(SPACER());
doc.push(CALLOUT("Ground rule to state out loud at the start", [
  "“In the mockup” means we have drawn it. It does not mean we can fill it with real numbers yet.",
  "Some things are drawn and live. Some are drawn and waiting on a file from you. Some were taken off the drawing because no system anywhere records them.",
  "I will tell you which of the three you are looking at on every screen. If I do not, stop me and ask."
]));

doc.push(SPACER());
doc.push(H2("Running order for the RAC session"));
doc.push(TBL([700, 2500, 6880],
  ["#", "Segment", "What you say and do"],
  [
    ["1", "Open and frame (5 min)", "Purpose: confirm what the report shows and what it calls things. Set the ground rule above. Say plainly that you are not asking them for technical answers."],
    ["2", "The one sentence (2 min)", "Declared records exist and can be counted today. Documents, users, libraries, projects and the file plan are not counted anywhere yet. Everything else follows from that."],
    ["3", "Walk the six dashboards (30 min)", "In the nav order below. For each: what it is for, what is live, what is blank and why, and the one decision they own on that screen."],
    ["4", "The 25 relabelled items (8 min)", "Read the before and after. Ask them to accept, or to give you the wording they want."],
    ["5", "What came off, and why (10 min)", "Go by the missing thing, not by the 54 items. There are only a handful of missing things and each one explains a whole group."],
    ["6", "The definitions to settle (15 min)", "Work the register in Part 3. Take a decision or a named owner on each. Do not leave one open with nobody on it."],
    ["7", "The five registers you need (8 min)", "Name the file, the columns, the key and who signs it off. Ask for a date."],
    ["8", "Close (5 min)", "Read back every decision and every owner. Confirm what goes to ITD tomorrow. Confirm when the next version is shown."]
  ]));

doc.push(SPACER());
doc.push(H2("How to present each dashboard"));
doc.push(P("Use the same four beats on every screen: what it is for, what is live, what is blank and why, the decision you need. Nothing else.", { italics: true, color: GREY }));

doc.push(H3("1. Bank-wide Oversight — the screen the committee will actually look at"));
doc.push(B("What it is for: one page that answers ‘how much is in EDRMS and who is using it’ for the whole bank."));
doc.push(B("Live and real: sites, records declared, physical counterparts, records due for disposal, the site overview table, the cumulative declaration trend, and the zero declaration list. These come straight from the records database and the Cloud Governance site export."));
doc.push(B("Live but caveated: total documents (a per site figure, so it cannot be split by library, format or date) and total users (an activity figure, not an entitlement figure)."));
doc.push(B("Blank, waiting on RAC: the two project tiles, sovereign and nonsovereign. They need one file from you — a list of EDRMS sites with the project number and the sovereign flag."));
doc.push(B("Off the screen: staff, contractor and consultant counts, training completion, onboarded since go-live, every per division column, and the whole disposal approval group. Twenty items."));
doc.push(BR([["Decision you need: ", 'b'], ["do the site rows on the overview table need to separate RM and office from department, or are those already inside department?", 'n']]));

doc.push(H3("2. Department Insights — the screen a department head will use"));
doc.push(B("What it is for: pick a department, see everything that department holds and does."));
doc.push(B("Live and real: sites, site names and owners, records declared, people who declared, counterparts, records due for disposal in 3, 6 and 12 months, sites with no declaration in 180 days, and site visits."));
doc.push(B("Live but caveated: documents and storage are per site, and a site that belongs to several departments cannot be attributed to one without a decision from you."));
doc.push(B("Blank, waiting on a file: the library usage screens behind the picker. We can count declared records per library but not documents per library, and not users per library at all."));
doc.push(B("Off the screen: go-live date, the naming convention panel, programme dates, staff and contractor splits, training rate, internal versus external visitors, access requests granted and denied. Twenty five items."));
doc.push(BR([["Decision you need: ", 'b'], ["when one SharePoint site belongs to two departments, does its whole figure count to both, or do you nominate one primary department per site?", 'n']]));

doc.push(H3("3. Project Insights — show it as a shape, not as a report"));
doc.push(B("What it is for: one project, its profile and its EDRMS footprint."));
doc.push(B("Say this before you show it: every number on this screen is illustrative. Not one of the twenty rows on this dashboard has a source today."));
doc.push(B("Two things are missing, not one. First, nothing anywhere says which SharePoint site belongs to which project. Second, the eight profile fields — facility type, modality, country, status, effectivity date, closing date, project number, project name — sit in an ADB project system that has never been named in this work."));
doc.push(B("Why show it at all: so they can look at the shape and tell you whether it is right, and so the two missing things become their question rather than yours."));
doc.push(BR([["Decision you need: ", 'b'], ["who owns the site to project register, and which ADB system holds project attributes? A name and a contact is enough tomorrow.", 'n']]));

doc.push(H3("4. Institutional File Plan — one missing file blocks all 24 rows"));
doc.push(B("What it is for: the five file plan categories, the terms under each, and how much sits against every term."));
doc.push(B("All 24 rows wait on exactly the same thing: the file plan term list, one row per term with its category, and confirmation of where it is maintained."));
doc.push(B("This is the cheapest unblock in the whole report. One list turns a completely empty dashboard into a fully working one."));
doc.push(BR([["Decision you need: ", 'b'], ["where is the Institutional File Plan maintained today, and who can export it?", 'n']]));

doc.push(H3("5. Retention and Disposal — the half that works and the half that cannot"));
doc.push(B("Live and real: permanent and temporary retention, by sites, by libraries and by records, plus declared records by retention label. All of it comes from the database."));
doc.push(B("Not built, and this is the point to make carefully: due is not disposed. The report can tell you a record has reached its disposal date. It cannot tell you that anyone requested, approved, declined, extended or carried out a disposal, because no system records those events."));
doc.push(B("Off the screen for that reason: approver, Approved, Declined, Extended, records disposed, disposed size, disposal completion rate, overdue and pending actions."));
doc.push(BR([["Decision you need: ", 'b'], ["do you accept that disposal outcomes are deferred to a future release, with the report showing only what is due?", 'n']]));

doc.push(H3("6. Records and Archive Holdings — be blunt about this one"));
doc.push(B("What it is for: physical storage and retrieval — boxes, folders, locations, requests, capacity."));
doc.push(B("One row of 28 has a source: physical counterparts identified, which comes from the records database."));
doc.push(B("The other 27 need a system that records physical archive activity, and no such system is available to this project. It is not a build problem and no amount of engineering solves it."));
doc.push(B("Show it as a specification of what the screen would need, and ask them to fill the gap or to drop the dashboard. Both are acceptable answers."));
doc.push(BR([["Decision you need: ", 'b'], ["is there a register, spreadsheet or system that records RAC storage and retrieval requests? If not, does this dashboard stay in scope?", 'n']]));

doc.push(PB());

doc.push(H2("The 25 relabelled rows, which are 17 distinct changes"));
doc.push(P("Twenty five rows in the workbook are marked relabelled or replaced. Several are the same change repeated on more than one dashboard, so they collapse into the seventeen below. Read these out before they find them. Every relabel is there because the original wording claims something the data cannot support. Ask them to accept the wording or to give you theirs.", { italics: true, color: GREY }));
doc.push(TBL([3400, 3400, 3280],
  ["They asked for", "The screen says", "Because"],
  [
    { __band: "USERS AND ACTIVITY" },
    ["Total number of EDRMS users", "EDRMS users with recorded activity, last 180 days", "No register of who is entitled to EDRMS. Only activity can be counted, and only for 180 days."],
    ["Total number of users (count)", "Users with recorded activity", "Same. The figure is activity, not headcount."],
    ["Total number of active users", "Users with recorded activity in EDRMS compliant sites", "Activity cannot be attributed to EDRMS sites specifically. The word active is doing work the data cannot support."],
    ["Indicator: not accessed in 90 days", "No access in 90 days", "Wording only, to match the window actually measured."],
    ["Total number of site visitors", "Total number of site visits", "The report counts page views and visited pages, not people."],
    { __band: "DOCUMENTS AND STORAGE" },
    ["Number of documents created / uploaded", "Total number of documents", "The source gives a file count per site. It does not know what was created versus uploaded, or when."],
    ["Documents size (in GB)", "Total documents size", "Storage used per site, not the sum of document sizes."],
    { __band: "RECORDS" },
    ["Total number of records declared", "Records declared", "Wording only."],
    ["Total number of users declaring records", "People who declared a record", "The figure is distinct people, and the original wording read as a record count."],
    ["Total number of physical records declared", "Physical counterparts", "Matches what the field actually flags."],
    ["Indicator: zero record declarations", "Departments, offices and RMs with zero declarations", "Names what the list contains."],
    ["Indicator: declaration rate against documents", "Share of documents declared as records", "Plain wording, and it flags that the denominator is the interim document count."],
    { __band: "DISPOSAL" },
    ["Total number of records due for disposal", "Records due for disposal within 12 months", "Without a window the figure is meaningless. Shown as 30 days, 90 days and 12 months."],
    ["Number of records due for disposal (table)", "Due within 3 months", "Same reason, as a column."],
    ["Next due date for disposal", "Due within 6 months", "A single next date told a department nothing useful. Replaced with a window."],
    ["With physical counterpart?", "Due within 12 months / With counterpart", "Kept as a counterpart flag on Bank-wide, replaced by the third window on the department table."],
    { __band: "SITES" },
    ["Total number of sites created", "Total number of EDRMS compliant sites created", "The source cannot separate a newly created site from an adopted one, and it only sees compliant sites."]
  ], { size: 17 }));

doc.push(SPACER());
doc.push(H2("What came off the mockup, grouped by the one thing that is missing"));
doc.push(P("Fifty four rows came off. They are not fifty four problems. They are eight.", { italics: true, color: GREY }));
doc.push(TBL([3000, 900, 6180],
  ["The missing thing", "Rows", "What came off because of it"],
  [
    ["A register of EDRMS users carrying employment type", "8", "Staff, contractor and consultant counts and percentages on Bank-wide and on Department Insights, and the users pie on Project Insights."],
    ["Division, which is empty on every EDRMS site", "8", "Every per division column and indicator: records declared per division, users declaring per division, counterparts per division, documents per division, and the per library per division indicators."],
    ["A system that records disposal decisions", "13", "Approver, Approved, Declined, Extended, records disposed, disposed size, disposal completion rate, overdue actions and pending approvals, on both Bank-wide and Department Insights."],
    ["A document level scan", "5", "Users creating documents, new documents month on month, average monthly storage growth, and the library level document counts."],
    ["A record of physical handover to RAC", "2", "Physical counterpart completion rate, described in the deck as turned over to RAC, on both dashboards."],
    ["A source for site access and visitor origin", "4", "Visitors internal and external, access requests granted, access requests denied."],
    ["A go-live date per site, a training system, a naming convention, programme dates", "6", "Go-Live date, onboarded since go-live, completion of training, training completion rate, the approved site and library and folder convention, and the programme dates panel."],
    ["Nothing reports below site level", "3", "Number of users per library, and the library counts on the retention rollup."],
    ["Design decisions on the retention rollup", "5", "The s44 rollup columns, now presented as the landing screen rather than as a table."]
  ], { size: 17 }));

doc.push(SPACER());
doc.push(H2("The five registers only RAC can produce"));
doc.push(P("Ask for each by name, with its columns and its key. A vague ask comes back as a vague file.", { italics: true, color: GREY }));
doc.push(TBL([2400, 3900, 1400, 2380],
  ["Register", "One row per, and the columns", "Key", "What it unblocks"],
  [
    ["Site to project register", "One row per EDRMS site: site, project number, sovereign or nonsovereign flag", "Site Id", "All 20 Project Insights rows, Bank-wide tiles 9 and 10, the s36 and s37 lists"],
    ["Institutional File Plan term list", "One row per term: term name, category, and where it is maintained", "Term", "All 24 Institutional File Plan rows, plus the Term column on both retention screens"],
    ["EDRMS user register", "One row per user: user principal name, employment type (staff, contractor, consultant)", "User Principal Name", "8 removed columns, the users pie, and the denominator under every user figure"],
    ["Go-live date per site", "One row per EDRMS site with its go-live date, or written agreement that the site creation date stands in", "Site Id", "Go-Live date, onboarded since go-live"],
    ["Physical archive register", "One row per storage or retrieval request: date, requester, location, boxes, folders, status, remarks", "Request", "27 of the 28 Records and Archive Holdings rows"]
  ], { size: 17 }));

doc.push(SPACER());
doc.push(H2("Questions RAC will ask, and the answer to give"));
doc.push(TBL([4200, 5880],
  ["They ask", "You answer"],
  [
    ["Why does the report not show the number of EDRMS users?", "Because no list exists of who is entitled to EDRMS. What we can count is who was active in SharePoint in the last 180 days, and that is what the tile says. Give us a user register and the tile becomes what you asked for."],
    ["Why can we not see documents per library?", "Every source we have reports at site level. Nothing counts documents inside a library. That needs a document level scan, which is an ITD change, not a report change."],
    ["Why is the disposal section so thin?", "The report can tell you a record has reached its disposal date. Nothing in any system we can reach records that a disposal was requested, approved or done. Those columns come back when the disposal release exists."],
    ["Why does Project Insights have no real numbers?", "Nothing links a SharePoint site to a project. One file from you fixes half of it. The other half is the ADB system that holds project attributes, which we still need named."],
    ["Can you not just estimate it?", "No. An invented figure that looks reasonable is the failure mode that would embarrass this report in front of the committee. Where there is no source, the column comes off and the question stays visible."],
    ["Is the Records and Archive Holdings dashboard dead?", "It is unsourced, not dead. Twenty seven of its twenty eight rows need a physical archive system. If one exists anywhere, even as a spreadsheet, the dashboard is buildable."],
    ["Why did the labels change?", "Every changed label is a claim the data cannot support. The figure is real, the original wording was not. Tell us the wording you want and we will use anything the data can stand behind."]
  ], { size: 17 }));

doc.push(PB());

// ============================================================ PART 2 ITD
doc.push(H1("PART 2 — SESSION WITH ITD (technical)"));

doc.push(H2("What you are trying to get out of the room"));
doc.push(B("Confirm the four sources the report already reads, and that the same four exist in production under the same names."));
doc.push(B("Get a decision on the document level scan. It is the single change that unblocks the largest number of rows."));
doc.push(B("Get a decision on division: is it maintained at all, and if yes, who backfills and who provisions it."));
doc.push(B("Get the disposal change request either scheduled or formally deferred, in writing."));
doc.push(B("Confirm the limitations that are product behaviour, so nobody spends a sprint trying to engineer around them."));
doc.push(B("Agree the one measure set, six groupings design before anyone builds nine screens nine different ways."));

doc.push(SPACER());
doc.push(H2("Running order for the ITD session"));
doc.push(TBL([700, 2500, 6880],
  ["#", "Segment", "What you cover"],
  [
    ["1", "Frame the session (3 min)", "This is a sourcing conversation, not a design one. RAC has already seen the screens. You are here for feasibility, ownership and dates."],
    ["2", "The four sources (7 min)", "Walk the table below. Confirm each exists in ADB production, who can run it, and how often."],
    ["3", "The document scan (15 min)", "The single biggest unblock. Present the spec, the keys and the cadence. Get a yes, a no, or an owner."],
    ["4", "Division (10 min)", "Is it maintained? If yes: backfill existing sites, and provision it on site creation. If no, eight columns are permanently gone."],
    ["5", "Department attribution (8 min)", "Blank in the database and in SharePoint, and multi valued in the Cloud Governance export. Needs a rule."],
    ["6", "Users and activity (10 min)", "Entitlement versus activity, the 180 day cap, and per user per site attribution. Set expectations here rather than in the committee."],
    ["7", "Disposal (7 min)", "Confirm the change request and its release, or record the deferral."],
    ["8", "The design recommendation (7 min)", "One document level table, six groupings. Cheaper to build and it reconciles by construction."],
    ["9", "Close (5 min)", "Owner and date on every ask. Confirm what goes back to RAC."]
  ]));

doc.push(SPACER());
doc.push(H2("The four sources the report already reads"));
doc.push(TBL([2600, 3200, 4280],
  ["Source", "What it gives", "What to confirm with ITD"],
  [
    ["Cloud Governance Workspace report (AvePoint)", "One row per workspace. The compliant site list via EDRMS Site Type, department, owner, storage used, last active time, status", "That ADB's own AvePoint instance exports the same columns, who can run it, and how often it can be scheduled"],
    ["SharePoint site usage report (M365 admin)", "File Count, Page View Count, Visited Page Count, per site", "Refresh cadence, retention window, and that Site Id is available to join on"],
    ["SharePoint activity user detail (M365 admin)", "One row per licensed user, with last activity date and viewed or edited file count", "That the 180 day cap is the maximum, and that there is no per user per site variant"],
    ["The drm-npr database, public.\"Records\"", "Declared records only. ListId, ItemId, CreatedBy, SiteUrl, the EDRMSMeta JSON, retention label applied, due date for disposal", "Production connection, refresh, and whether the schema in production matches the tested one"]
  ], { size: 17 }));

doc.push(SPACER());
doc.push(CALLOUT("Say this early in the ITD session", [
  "Everything proven in this work was proven against the test tenant. The method transfers, the numbers do not.",
  "Every column name, click path and query is unchanged for production. What changes is the tenant name in the admin URLs and pointing Cloud Governance at ADB's own instance.",
  "So the ask is not ‘can this be built’. It is ‘who runs these four exports against production, and how often’."
]));

doc.push(SPACER());
doc.push(H2("The seven technical asks, in the order they unblock the most"));

doc.push(H3("Ask 1 — the document level scan (the largest single unblock)"));
doc.push(B("What: a scheduled Microsoft Graph scan producing one row per document across the EDRMS compliant sites."));
doc.push(B("Columns needed: Site Id, ListId, ItemId, LibraryId, LibraryName, file size, created date, created by."));
doc.push(B("Key: Site Id plus ListId and ItemId. Cadence: weekly is sufficient."));
doc.push(B("Warning to raise: folders return a cumulative size in Graph, so the scan must filter to files only or storage is double counted."));
doc.push(B("What it unblocks: an accurate document count everywhere, document size, new documents month on month, average monthly storage growth, users creating documents, the denominator under declaration rate, every library level column on Department Insights, and libraries provisioned on all three retention screens."));
doc.push(BR([["Ask: ", 'b'], ["is this approved, who builds it, and what is the target date?", 'n']]));

doc.push(H3("Ask 2 — division"));
doc.push(B("Current state: division exists as a column in the Cloud Governance Workspace report and is empty on every EDRMS site. No other source carries it."));
doc.push(B("Three things are needed, in order: a decision that division is maintained at all, a backfill of every existing site, and provisioning of division at site creation so it never goes empty again."));
doc.push(B("What it unblocks: eight columns and indicators across s40, s41, s42, s58, s59 and s61 to s66."));
doc.push(BR([["Ask: ", 'b'], ["is division in scope? If yes, who owns the backfill and the provisioning change? If no, say so and the eight columns stay off permanently.", 'n']]));

doc.push(H3("Ask 3 — department attribution"));
doc.push(B("Two separate problems. The department column is blank in both the database and SharePoint. And in the Cloud Governance export some sites carry several departments, semicolon separated, for example ADBI;BOD and CWRD;SARD and ADBI;BOD;CSD;CWRD;SARD."));
doc.push(B("Consequence: every departmental total is either counted in each department, which overstates the bank total, or assigned to one, which understates the others."));
doc.push(B("The approach already confirmed is to load a site to department mapping and let documents inherit through SiteUrl, which every existing row already carries. No migration is required."));
doc.push(BR([["Ask: ", 'b'], ["confirm the inheritance approach, and confirm whether RAC nominates one primary department per multi department site.", 'n']]));

doc.push(H3("Ask 4 — users, entitlement versus activity"));
doc.push(B("There is no list of who is entitled to EDRMS. Ask whether one can be built from site permissions, and whether that is approved."));
doc.push(B("SharePoint activity is reported per user and per site, but never per user per site. So activity cannot be attributed to EDRMS sites specifically. This is product behaviour, not a gap in our query."));
doc.push(B("The window is capped at 180 days. A user active 200 days ago is indistinguishable from a user who never touched the system, which is why the word never cannot be used."));
doc.push(B("The activity export carries no department. Department would come from the Entra ID profile, which gives the user's own department, not the department of the site they worked in."));
doc.push(BR([["Ask: ", 'b'], ["is there any source that attributes activity to specific sites? If not, the user tiles are permanently tenant wide and the labels stay as they are.", 'n']]));

doc.push(H3("Ask 5 — disposal"));
doc.push(B("What exists: the due date is already computed in the database as retention label applied plus duration, so every due within 30 days, 90 days and 12 months figure is live today."));
doc.push(B("What does not exist: any record of a disposal being requested, approved, declined, extended or carried out."));
doc.push(B("Needed: the system recording disposal decisions, carrying approver, decision and decision date, keyed on ListId and ItemId."));
doc.push(BR([["Ask: ", 'b'], ["confirm disposal is a separate future release, and get that written down. Thirteen removed rows all point at this one change request.", 'n']]));

doc.push(H3("Ask 6 — the registers ITD must help source"));
doc.push(B("The site to project register: RAC owns the content, but ITD should confirm whether any existing system already holds a site to project link before RAC builds one by hand."));
doc.push(B("The ADB project system: this has never been named in this work by anyone. Ask ITD to name it, and to say whether it is queryable."));
doc.push(B("The Institutional File Plan term list: confirm whether it lives in the SharePoint term store, and whether it can be exported."));
doc.push(B("Cloud Governance created versus adopted: the export does not distinguish a newly provisioned site from a converted one. Ask whether any column or job history can."));

doc.push(H3("Ask 7 — access requests and visitor origin"));
doc.push(B("No available report records site access requests or their outcomes, and none splits visitors into internal and external."));
doc.push(B("Needed: a source recording access requests with request date, requester and outcome, keyed on Site Id and User Principal Name."));
doc.push(BR([["Ask: ", 'b'], ["does anything in the tenant record access requests? If not, four columns stay off.", 'n']]));

doc.push(SPACER());
doc.push(H2("Limitations to state plainly, so nobody tries to engineer around them"));
doc.push(TBL([4100, 5980],
  ["Limitation", "Why it cannot be worked around"],
  [
    ["File Count is per site and cannot be split by library, folder, format or created date", "The site usage report reports at site level only. Splitting it requires the document scan, not a better query."],
    ["SharePoint activity is per user and per site, never per user per site", "The report has no such dimension. No join produces it, because the raw data does not carry it."],
    ["The activity window is capped at 180 days", "180 days is the longest window the report offers. ‘Never accessed’ can only ever mean ‘not in 180 days’."],
    ["Nothing reports below site level", "Neither Cloud Governance nor site usage sees inside a site. Declared records can be grouped by ListId, but that reaches declared records only, so it cannot list libraries holding no declarations."],
    ["The Cloud Governance export does not separate created from adopted sites", "A converted site is counted the same as a newly provisioned one. Until a distinguishing column exists, ‘sites created’ means ‘compliant sites’."],
    ["Due is not disposed", "The due date is a computed date being reached. It is not an event, and no system logs the event."],
    ["Graph returns a cumulative size on folders", "The scan must filter to files only, or storage is double counted. Worth flagging before anyone builds it."]
  ], { size: 17 }));

doc.push(SPACER());
doc.push(CALLOUT("The design recommendation to put to ITD", [
  "The deck puts the same four measures — documents, records declared, physical counterparts and records due — on nine different screens, grouped nine different ways.",
  "That is not nine requirements. It is one measure set and six groupings.",
  "Built once as a single document level table with a different GROUP BY per screen, every screen reconciles to the same bank-wide total by construction rather than by luck.",
  "This changes nothing the client sees, and a great deal about what it costs to build and maintain."
]));

doc.push(PB());

// ============================================================ PART 3 CLARIFICATIONS
doc.push(H1("PART 3 — MASTER CLARIFICATION REGISTER"));
doc.push(P("Every clarification the workbook raises, in one place. Work this list in the RAC session for the items marked RAC, and in the ITD session for the items marked ITD. Nothing here should leave tomorrow without a decision or a named owner.", { italics: true, color: GREY }));
doc.push(SPACER());

doc.push(TBL([500, 2500, 900, 3200, 2980],
  ["#", "The clarification", "Ask", "Why it matters", "Recommended answer to propose"],
  [
    ["1", "What is an EDRMS user?", "RAC", "Every user tile, both comparison ratios and the users pie hang on this one word. The workbook offers three candidate definitions.", "Propose: someone who has declared a record, because that is the only one countable today. Keep the other two as future definitions."],
    ["2", "What does never accessed EDRMS mean?", "RAC", "The activity report looks back 180 days only. Someone active 200 days ago appears as never.", "Propose: drop the word never. Use no recorded activity in the last 180 days."],
    ["3", "Visitors, or visits?", "RAC", "The deck asks for visitors. The source counts page views and visited pages, which are events, not people.", "Propose: site visits, and say so in the label. Revisit if a per person source appears."],
    ["4", "Total number of users declaring records — people or records?", "RAC", "The wording on s42 reads two ways. One is a distinct person count, the other is a record count.", "Propose: people who declared a record, which is distinct CreatedBy, and it is already built."],
    ["5", "What is a user creating documents?", "Both", "It cannot be answered until the document scan exists, and then it means distinct createdBy.", "Park until Ask 1 is decided, then define as distinct creators from the scan."],
    ["6", "No. of sites created — all sites, or compliant sites only?", "RAC", "The indicator on s35 reads either way, and the two figures differ substantially.", "Propose: EDRMS compliant sites, and add all sites as a second figure only if they want it."],
    ["7", "Are RM and office part of department, or separate metadata?", "RAC", "The overview table column reads ‘Department / office / RM’. Whether that is one field or three changes the grouping.", "Ask them directly. It affects every grouped table in the report."],
    ["8", "Is division maintained at all?", "Both", "Eight columns depend on it. The column exists in the export and is empty on every EDRMS site.", "Propose: decide now. If yes, backfill plus provisioning. If no, the eight columns stay off permanently."],
    ["9", "Multi department sites — count to each, or nominate one?", "RAC", "Some sites carry several departments, semicolon separated. Counting to each overstates the bank total.", "Propose: RAC nominates one primary department per site. It is the only rule that reconciles."],
    ["10", "Must created and adopted sites be distinguished?", "Both", "The export cannot tell them apart, and the requirement asks for sites created.", "Propose: relabel to compliant sites created, unless ITD can find a distinguishing column."],
    ["11", "Do documents need to be cut by library, format or created date?", "RAC", "The interim figure is per site only. If the requirement persists, the document scan becomes mandatory rather than desirable.", "Ask whether it persists. Their answer decides whether Ask 1 is optional."],
    ["12", "Due versus disposed — is due only acceptable?", "RAC", "Thirteen removed rows follow from this. Due is a date being reached, not an outcome.", "Propose: the report shows due only. Disposal outcomes return with the disposal release."],
    ["13", "Disposal windows — confirm 30, 90 and 12 months", "RAC", "The deck asks for upcoming next quarter. The mockup shows three windows instead.", "Propose: keep the three windows. They answer the quarter question and more."],
    ["14", "Go-live date — supply it, or accept a stand-in?", "RAC", "Nothing records when a site went live on EDRMS. The site creation date can be years earlier for an adopted site.", "Propose: RAC supplies the date, or signs off the creation date as a stand-in with the caveat stated on screen."],
    ["15", "Retention filter buckets — confirm All, 3, 5, 7, 10, other years", "RAC", "The filter is built. The bucket list should be theirs, not ours.", "Read the list out and get a yes."],
    ["16", "Where is the Institutional File Plan maintained?", "Both", "All 24 rows of that dashboard wait on this single answer.", "Get a system name and an owner. Confirm with ITD whether it can be exported."],
    ["17", "Is turned over to RAC to be captured in a future workflow?", "RAC", "The physical counterpart completion rate is a custody event that no system records.", "Propose: fold it into the future physical records release, and note it as a requirement on that release."]
  ], { size: 16, hsize: 17 }));

doc.push(PB());

// ============================================================ PART 4 BLOCKERS
doc.push(H1("PART 4 — BLOCKER REGISTER"));
doc.push(P("The full list of missing things behind every unbuilt row in the workbook. Bring this to both rooms. It is the page that turns 251 requirement rows into a short list of decisions.", { italics: true, color: GREY }));
doc.push(SPACER());

doc.push(TBL([2500, 3900, 1180, 2500],
  ["Missing thing", "What it blocks", "Owner", "What done looks like"],
  [
    ["Site to project register", "All 20 Project Insights rows, Bank-wide tiles 9 and 10, the sovereign and nonsovereign lists on s36 and s37", "RAC", "A file, one row per EDRMS site, carrying project number and the sovereign flag, keyed on Site Id"],
    ["The ADB project system", "The eight profile fields on s38: facility type, modality, country, status, effectivity date, closing date, project number, project name", "ITD to name it", "A named system, a contact, and confirmation it can be queried"],
    ["Institutional File Plan term list", "All 24 Institutional File Plan rows, and the Term column on s45 and s46", "RAC", "An export, one row per term with its category, plus where it is maintained"],
    ["Document level Graph scan", "Accurate document counts, document size, monthly growth, users creating documents, the declaration rate denominator, every library level column, libraries provisioned on all retention screens", "ITD", "A weekly job producing one row per document, keyed on Site Id plus ListId and ItemId, files only"],
    ["EDRMS user register", "Staff, contractor and consultant splits on s39 and s54, the users pie on s38, onboarded since go-live", "RAC", "A file keyed on User Principal Name, carrying employment type"],
    ["Definition of EDRMS user", "Every user tile, and two of the three comparison ratios", "RAC to define", "One written definition, and approval to derive entitlement from site permissions if that is the route"],
    ["Activity attributed to EDRMS sites", "Active users, no access counts, never accessed, both user based comparison ratios", "ITD", "A source giving activity per user per site, or written acceptance that the figures are tenant wide"],
    ["Division", "8 per division columns and indicators across s40, s41, s42, s58, s59 and s61 to s66", "RAC decides, ITD builds", "A decision, then a backfill of existing sites, then provisioning at site creation"],
    ["A primary department per site", "Exact departmental attribution of documents, storage and records on every grouped table", "RAC", "A nominated primary department for every multi department site"],
    ["Disposal decision system", "13 rows: approver, Approved, Declined, Extended, records disposed, disposed size, completion rate, overdue and pending", "ITD change request", "A scheduled release, or a written deferral"],
    ["Physical custody event to RAC", "Physical counterpart completion rate on s42 and s59", "RAC", "A register or workflow recording handover, carrying the record identifier and handover date"],
    ["Go-live date per site", "The Go-Live date field on s53, and onboarded since go-live on s39", "RAC", "A date per site, or written agreement that the creation date stands in"],
    ["Access request and visitor origin source", "4 columns on s56: visitors internal and external, access requests granted and denied", "ITD to identify", "A source recording requests and outcomes, keyed on Site Id and User Principal Name"],
    ["Physical archive activity source", "27 of the 28 Records and Archive Holdings rows", "RAC", "Any register of storage and retrieval requests, even a spreadsheet, or a decision to drop the dashboard"],
    ["Training system", "Completion of training on s39, training completion rate on s54", "Client", "The system where training completion is recorded, keyed on User Principal Name"],
    ["Created versus adopted flag", "‘Sites created’ being a true created count rather than a compliant count", "ITD", "A distinguishing column, or acceptance of the relabel"],
    ["Naming convention and programme dates", "The approved site, library and folder convention panel, and the programme dates panel", "RAC", "The convention document, and the programme schedule keyed to departments or sites"]
  ], { size: 16, hsize: 17 }));

doc.push(SPACER());
doc.push(H2("If you only get three things tomorrow"));
doc.push(TBL([700, 1600, 7780],
  ["", "From", "Get this"],
  [
    ["1", "RAC", "The Institutional File Plan term list. One file turns a completely empty 24 row dashboard into a working one. It is the cheapest unblock in the report."],
    ["2", "ITD", "A yes or a no on the document level scan. It is the single change that unblocks the largest number of rows, and it is the only route to a real document count."],
    ["3", "RAC", "The site to project register. It is the whole of Project Insights and two Bank-wide tiles, and it is a list they can produce without any system change."]
  ], { size: 18 }));

doc.push(SPACER());
doc.push(H2("Closing checklist, use it in both rooms"));
doc.push(B("Every decision read back out loud, with the person's name against it."));
doc.push(B("Every open item has an owner and a date. ‘We will look into it’ is not an owner."));
doc.push(B("Every parked technical question from the RAC session is written down and carried into the ITD session."));
doc.push(B("Every relabelled item is either accepted or has replacement wording."));
doc.push(B("Every register asked for has a named producer and a date."));
doc.push(B("Anything they want that has no source is recorded as a requirement with no source, not quietly dropped. A gap they can see is a question they can answer. A gap we delete is a requirement that disappears."));
doc.push(B("Agree when they see the next version, and what will have changed in it."));

// ============================================================ DOC
const document = new Document({
  creator: "EDRMS Utilization Report",
  title: "Discussion Pack: RAC and ITD Sessions",
  description: "Prepared from EDRMS_Utilization_Dashboard_Checker.xlsx",
  numbering: {
    config: [{
      reference: "bul",
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 200 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 200 } } } },
        { level: 2, format: LevelFormat.BULLET, text: "▪", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 200 } } } }
      ]
    }]
  },
  styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          spacing: { before: 100 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "AAB4C4", space: 6 } },
          tabStops: [{ type: TabStopType.RIGHT, position: CW }],
          children: [
            new TextRun({ text: "EDRMS Utilization Report  |  RAC and ITD Discussion Pack", size: 16, color: GREY, font: "Calibri" }),
            new TextRun({ text: "\t", size: 16 }),
            new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 16, color: GREY, font: "Calibri" })
          ]
        })]
      })
    },
    children: doc
  }]
});

Packer.toBuffer(document).then(buf => {
  fs.writeFileSync(process.argv[2] || "EDRMS_RAC_ITD_Discussion_Pack.docx", buf);
  console.log("written");
});
