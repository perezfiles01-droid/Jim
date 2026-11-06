// Builds EDRMS_Utilization_Report_Walkthrough.pptx: a click-by-click tour of
// the SharePoint web part (1.0.57) for the client to confirm each function.
// Screenshots come from presentations/walkthrough_shots/ (captured from the
// built web part with Playwright). Run: node presentations/build_walkthrough_deck.js
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const SHOTS = path.join(__dirname, 'walkthrough_shots');
const OUT = path.join(__dirname, 'EDRMS_Utilization_Report_Walkthrough.pptx');

const THEME = {
  name: 'EDRMS Walkthrough', headFontFace: 'Calibri', bodyFontFace: 'Calibri',
  colors: {
    dk1: '172B4D', lt1: 'FFFFFF', dk2: '194F8E', lt2: 'EEF3F9',
    accent1: '194F8E', accent2: '0072BC', accent3: 'D97706', accent4: '5CA943',
    accent5: '0F9F87', accent6: '8A1C12', hlink: '0072BC', folHlink: '194F8E'
  }
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'EDRMS Utilization Report: functional walkthrough';
pres.author = 'EDRMS Team';
const C = pres.SchemeColor;

/* ---------- layouts ---------- */
pres.defineSlideMaster({
  title: 'COVER', background: { color: THEME.colors.dk2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 2.2, w: 11.7, h: 1.6, fontSize: 44, bold: true, color: C.background1, valign: 'bottom' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 3.95, w: 11.7, h: 1.4, fontSize: 20, color: C.background2, valign: 'top' }, text: '' } }
  ]
});
pres.defineSlideMaster({
  title: 'SECTION', background: { color: THEME.colors.dk2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 2.6, w: 11.7, h: 1.2, fontSize: 40, bold: true, color: C.background1, valign: 'bottom' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 3.9, w: 11.7, h: 1.6, fontSize: 18, color: C.background2, valign: 'top' }, text: '' } }
  ],
  slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: 'CADCFC' }
});
pres.defineSlideMaster({
  title: 'CONTENT', background: { color: 'FFFFFF' },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.3, w: 12.3, h: 0.75, fontSize: 30, bold: true, color: C.accent1, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    { text: { text: 'EDRMS Utilization Report  |  Functional walkthrough', options: { x: 0.5, y: 7.05, w: 8, h: 0.3, fontSize: 10, color: '6B7B8C', margin: 0 } } }
  ],
  slideNumber: { x: 12.3, y: 7.05, w: 0.6, h: 0.3, fontSize: 10, color: '6B7B8C' }
});

/* ---------- helpers ---------- */
function pngSize(f) {
  const b = fs.readFileSync(f);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function fit(file, box) {
  const s = pngSize(file), r = Math.min(box.w / s.w, box.h / s.h);
  const w = s.w * r, h = s.h * r;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}
function shot(slide, name, box, alt) {
  const f = path.join(SHOTS, name + '.png');
  if (!fs.existsSync(f)) throw new Error('Missing screenshot ' + name);
  const p = fit(f, box);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x - 0.06, y: p.y - 0.06, w: p.w + 0.12, h: p.h + 0.12, rectRadius: 0.08,
    fill: { color: 'F4F7FB' }, line: { color: 'D6E1EC', width: 0.75 }, objectName: 'Screenshot frame' });
  slide.addImage({ path: f, ...p, altText: alt || name });
}
/** The RAC decision box: three small boxes to click and type X in, and a comments box to type in. */
function decisionBox(s, id, X, Y, W, H, example) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y: Y, w: W, h: H, rectRadius: 0.1, fill: { color: 'FFF7E8' }, line: { color: 'F2C786', width: 1 }, objectName: 'RAC decision box' });
  s.addText('RAC decision for ' + id, { x: X + 0.2, y: Y + 0.08, w: W - 0.4, h: 0.3, fontSize: 12, bold: true, color: '8A4B00', margin: 0, isTextBox: true });
  s.addText('click a box, type X', { x: X + W - 2.0, y: Y + 0.1, w: 1.8, h: 0.26, fontSize: 10, italic: true, color: '8A6A3A', align: 'right', margin: 0, isTextBox: true });
  ['Keep', 'Change', 'Remove'].forEach((o, i) => {
    const bx = X + 0.2 + i * 1.3, by = Y + 0.45;
    s.addText(example && example.mark === i ? 'X' : '', { shape: pres.shapes.RECTANGLE, x: bx, y: by, w: 0.3, h: 0.3, fill: { color: 'FFFFFF' }, line: { color: '8A4B00', width: 1 },
      fontSize: 14, bold: true, color: '8A1C12', align: 'center', valign: 'middle', margin: 0, objectName: 'Type X here: ' + o + ' (' + id + ')' });
    s.addText(o, { x: bx + 0.38, y: by, w: 0.85, h: 0.3, fontSize: 12, color: C.text1, valign: 'middle', margin: 0, isTextBox: true });
  });
  s.addText('Comments:', { x: X + 0.2, y: Y + 0.85, w: 2, h: 0.22, fontSize: 11, color: '52657A', margin: 0, isTextBox: true });
  s.addText(example ? example.comment : '', { shape: pres.shapes.RECTANGLE, x: X + 0.2, y: Y + 1.08, w: W - 0.4, h: H - 1.2, fill: { color: 'FFFFFF' }, line: { color: 'E0B36A', width: 0.75 },
    fontSize: 11, italic: !!example, color: C.text1, valign: 'top', margin: 0.05, objectName: 'Type comments here (' + id + ')' });
}

let section = '';
const REGISTER = [];
// Slide order and content, written out for build_walkthrough_adb.py (ADB template version).
const SPEC = [];

function cover() {
  const s = pres.addSlide({ masterName: 'COVER', sectionTitle: section });
  s.addText('EDRMS Utilization Report', { placeholder: 'title' });
  s.addText('Functional walkthrough of the SharePoint web part, for RAC to confirm each function\nRelease 2026.4  |  Web part version 1.0.57  |  November 2026', { placeholder: 'body' });
  s.addNotes('Purpose: walk RAC through every screen and every click of the Utilization Report, and collect a decision on each function: keep it, change it, or remove it.');
}
function divider(title, text, notes) {
  SPEC.push({ type: 'divider', title, text });
  section = title;
  pres.addSection({ title });
  const s = pres.addSlide({ masterName: 'SECTION', sectionTitle: section });
  s.addText(title, { placeholder: 'title' });
  s.addText(text, { placeholder: 'body' });
  if (notes) s.addNotes(notes);
}

/**
 * One function per slide: screenshot left, explanation right, decision box.
 * f = { id, title, shot, shot2?, what, clicks: [..], data?, notes? }
 */
function feature(f) {
  SPEC.push(Object.assign({ type: 'feature', section }, f));
  REGISTER.push({ id: f.id, title: f.title, area: section });
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText([{ text: f.id + '  ', options: { color: C.accent3 } }, { text: f.title }], { placeholder: 'title' });
  const left = { x: 0.5, y: 1.25, w: 7.5, h: 5.6 };
  if (f.shot2) {
    shot(s, f.shot, { x: left.x, y: left.y, w: left.w, h: 2.7 }, f.title);
    shot(s, f.shot2, { x: left.x, y: left.y + 2.9, w: left.w, h: 2.7 }, f.title + ', after the click');
  } else shot(s, f.shot, left, f.title);

  const X = 8.35, W = 4.5;
  s.addText('What it shows', { x: X, y: 1.2, w: W, h: 0.3, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText(f.what, { x: X, y: 1.5, w: W, h: f.whatH || 1.05, fontSize: 13, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
  const cy = 1.5 + (f.whatH || 1.05) + 0.12;
  s.addText('When you click', { x: X, y: cy, w: W, h: 0.3, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText(f.clicks.map((t, i) => ({ text: t, options: { bullet: { type: 'number' }, breakLine: i < f.clicks.length - 1, paraSpaceAfter: 3 } })),
    { x: X, y: cy + 0.3, w: W, h: 5.15 - cy - 0.3 - (f.data ? 0.62 : 0), fontSize: 13, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
  if (f.data) {
    s.addText([{ text: 'Data: ', options: { bold: true } }, { text: f.data }],
      { x: X, y: 5.12 - 0.58, w: W, h: 0.55, fontSize: 11, color: '52657A', margin: 0, valign: 'top', isTextBox: true });
  }
  // Decision box
  decisionBox(s, f.id, X, 5.25, W, 1.6);
  s.addNotes(f.notes || (f.what + ' Click steps: ' + f.clicks.join(' ')));
}

/* =====================================================================
   CONTENT
   ===================================================================== */
section = 'Introduction';
pres.addSection({ title: section });
SPEC.push({ type: 'custom', key: 'cover' });
cover();

SPEC.push({ type: 'custom', key: 'howto', section });
{ // How to use this deck
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText('How to read and comment on this deck', { placeholder: 'title' });
  const steps = [
    ['1', 'One function per slide', 'Each slide shows one part of the report as it looks in SharePoint, what it shows, and exactly what happens when you click.'],
    ['2', 'Every function has an ID', 'F-01, F-02 and so on. Use the ID when you comment, so there is no doubt which part you mean.'],
    ['3', 'Type X in one box per function', 'Click the small box beside Keep, Change or Remove and type X. Click the Comments box to type a change. The last slides repeat all decisions in one table.'],
    ['4', 'Figures are sample data', 'Numbers on screen are sample figures for review. Real figures replace them when the reporting database is connected.']
  ];
  steps.forEach((st, i) => {
    const y = 1.35 + i * 1.35;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.08, w: 0.7, h: 0.7, fill: { color: THEME.colors.dk2 }, line: { color: THEME.colors.dk2 }, objectName: 'Step ' + st[0] });
    s.addText(st[0], { x: 0.6, y: y + 0.08, w: 0.7, h: 0.7, fontSize: 22, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addText(st[1], { x: 1.6, y: y, w: 5.6, h: 0.4, fontSize: 18, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(st[2], { x: 1.6, y: y + 0.42, w: 5.8, h: 0.75, fontSize: 14, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
  });
  // sample decision box
  decisionBox(s, 'F-00', 8.2, 2.3, 4.5, 2.0, { mark: 1, comment: 'Show the top 15 instead of the top 10.' });
  s.addText('Example of a filled-in decision box', { x: 8.2, y: 4.6, w: 4.5, h: 0.3, fontSize: 11, color: '6B7B8C', align: 'center', margin: 0, isTextBox: true });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.2, y: 5.05, w: 4.5, h: 1.8, rectRadius: 0.1, fill: { color: 'EEF3F9' }, line: { color: 'D6E1EC', width: 1 }, objectName: 'Mockup note' });
  s.addText('Please note', { x: 8.4, y: 5.15, w: 4.1, h: 0.3, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText('The screens shown are from the current prototype of the web part. Layout, wording and colours are still subject to minor changes when it is implemented in the final system. What we ask you to confirm is the function: what each part shows and what each click does.', { x: 8.4, y: 5.47, w: 4.1, h: 1.3, fontSize: 12, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
}

SPEC.push({ type: 'custom', key: 'glance', section });
{ // Report at a glance
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText('The report at a glance', { placeholder: 'title' });
  shot(s, '01_bw_full', { x: 0.5, y: 1.25, w: 7.9, h: 5.6 }, 'Bank-wide Oversight as it opens');
  const rows = [
    ['Two live dashboards', 'Bank-wide Oversight (all of ADB) and Department Insights (one or more units).'],
    ['Four future dashboards', 'Project Insights, Institutional File Plan, Retention and Disposal, Records and Archive Holdings: shown in the menu, not yet available.'],
    ['Same pattern everywhere', 'A title band, summary cards, and a breakdown that opens under the card you click.'],
    ['Every figure is clickable to the detail', 'Cards open breakdowns; department codes open Department Insights; bars find their row.'],
    ['Weekly data', '"Data as of" shows the Monday of the latest weekly refresh.']
  ];
  rows.forEach((r, i) => {
    const y = 1.3 + i * 1.08;
    s.addText(r[0], { x: 8.75, y, w: 4.1, h: 0.32, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(r[1], { x: 8.75, y: y + 0.33, w: 4.1, h: 0.7, fontSize: 12, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
  });
}

SPEC.push({ type: 'custom', key: 'who', section });
{ // Who sees what
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText('Who sees what', { placeholder: 'title' });
  const cards = [
    ['Visitors and Members', 'Read or Edit access to the site', ['See both dashboards and every breakdown', 'Use search, filters, sorting and paging', 'Export to PDF, PowerPoint and Excel', 'Do NOT see Import data']],
    ['Site Owners and admins', 'Full Control, or site collection admin', ['Everything Members can do', 'PLUS the Import data button beside Export', 'Load the manual data template (headcount, training, Go-Live, site convention, site list)', 'Only they can change the stored manual data']]
  ];
  cards.forEach((c, i) => {
    const x = 0.6 + i * 6.2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.35, w: 5.9, h: 5.4, rectRadius: 0.12, fill: { color: i ? 'EEF3F9' : 'F7F9FB' }, line: { color: 'D6E1EC', width: 1 }, objectName: c[0] + ' card' });
    s.addText(c[0], { x: x + 0.35, y: 1.6, w: 5.2, h: 0.5, fontSize: 22, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(c[1], { x: x + 0.35, y: 2.1, w: 5.2, h: 0.35, fontSize: 13, italic: true, color: '52657A', margin: 0, isTextBox: true });
    s.addText(c[2].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < c[2].length - 1, paraSpaceAfter: 8 } })),
      { x: x + 0.35, y: 2.65, w: 5.2, h: 2.2, fontSize: 15, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
  });
  shot(s, '50_reader_header', { x: 0.95, y: 5.05, w: 5.2, h: 1.5 }, 'Header for Members and Visitors');
  shot(s, '51_owner_header', { x: 7.15, y: 5.05, w: 5.2, h: 1.5 }, 'Header for Owners');
}

/* ---------- A. Navigation and tools on every page ---------- */
divider('A. Navigation and common tools', 'Controls that work the same way on every dashboard: the menu, the information icons, export, search, filter, sorting, paging and table export.');

feature({ id: 'F-01', title: 'Dashboard menu', shot: '01_bw_full',
  what: 'The left menu lists the two live dashboards under Key Views and the four planned ones under For Future Release.',
  clicks: ['Bank-wide Oversight or Department Insights: the page switches to that dashboard and scrolls to the top.', 'A For Future Release item: nothing opens. It is greyed out until that dashboard is built (RAC Item 6).'],
  data: 'None. Menu labels can be renamed.' });
feature({ id: 'F-02', title: 'Collapse and expand the menu', shot: '02_sidebar_closed',
  what: 'The menu button (three lines) at the top of the menu hides the menu so the dashboard uses the full width.',
  clicks: ['Menu button: the menu shrinks to icons only; the dashboard widens.', 'Menu button again: the full menu returns.', 'The choice is remembered on that browser the next time the report opens.'] });
feature({ id: 'F-03', title: 'Information icons (i)', shot: '03_tooltip',
  what: 'Every card has a small (i) icon. It explains in one sentence what the figure counts and over which period.',
  clicks: ['Point at or tap the (i): a tooltip shows the definition.', 'Move away: it closes. Nothing else changes.'] });
feature({ id: 'F-04', title: 'Data as of', shot: '51_owner_header',
  what: 'The green dot and date beside the dashboard title show when the data was last refreshed: the Monday of the latest weekly refresh (RAC Item 11).',
  clicks: ['Not clickable. It updates on its own every week.', 'Date pickers in the report cannot go past this date.'] });
feature({ id: 'F-05', title: 'Export the dashboard (PDF or PowerPoint)', shot: '04_export_menu',
  what: 'The Export button beside the title exports the whole dashboard as it is on screen, including open breakdowns and the filters in use (RAC Item 8).',
  clicks: ['Export: a menu opens with PDF and PowerPoint.', 'PDF: downloads the dashboard as a PDF. Page breaks never cut through a chart.', 'PowerPoint: downloads one slide per breakdown and section, with an editable title, a Key points box, the filter line and the Data as of date. Tall sections continue on a "(continued)" slide.'],
  data: 'Excel is per table (F-10). Word is not offered (not a standard Power BI export).' });
feature({ id: 'F-06', title: 'Search in a table', shot: '05_sites_drill', shot2: '06_search',
  what: 'Department tables have a search box. It matches the code or the name of the Department / Office / RM / RO.',
  clicks: ['Type in the box: the table narrows as you type (here "SA" finds SARD, ERO, NARO and others).', 'Clear the box: all rows return.', 'Counts under the table ("Showing 1 to 10 of N") follow the search.'] });
feature({ id: 'F-07', title: 'Filter Department / Office / RM / RO', shot: '07_filter_popup', shot2: '09_filter_applied',
  what: 'The Filter button opens three linked boxes: Category (HQ, RM, RO), Sub-category (the department) and Sub-group (e.g. a Resident Mission). Each box narrows the next (RAC Item 5).',
  clicks: ['Filter: the pop-up opens.', 'Pick one or more values in each box (each box has its own search). The pop-up stays open while you choose.', 'Apply: the table shows only the matching units. Reset: clears all three boxes.'],
  data: 'Category values come from the Sites tab of the manual data template (F-50).' });
feature({ id: 'F-08', title: 'Sort a table', shot: '10_sort',
  what: 'Every column heading in every table can be sorted. The arrow beside the heading shows the current order.',
  clicks: ['Click a heading: the table sorts by it (numbers largest first, names A to Z).', 'Click the same heading again: the order reverses.', 'Sorting returns the table to page 1.'] });
feature({ id: 'F-09', title: 'Page through a table', shot: '11_pager_p2',
  what: 'Tables show 10 rows at a time with a pager under them, and say which rows are shown out of how many.',
  clicks: ['Next / Prev: moves one page.', 'A page number: jumps to that page.', 'Search, filter and sort all go back to page 1.'] });
feature({ id: 'F-10', title: 'Export a table to Excel', shot: '05_sites_drill',
  what: 'Export table, beside each table, downloads that table to Excel with the rows currently shown by the search and filter.',
  clicks: ['Export table: an .xlsx file downloads at once (e.g. "Sites by department.xlsx").', 'The file has the same columns as the screen, formatted headings and a filter on each column.'] });
feature({ id: 'F-11', title: 'Click a department code to open Department Insights', shot: '05_sites_drill', shot2: '24_click_dept_to_di',
  what: 'Department codes in the tables are underlined links. They take you straight to that unit\'s details (RAC Item 9).',
  clicks: ['Click a code (e.g. CWRD) or its row: Department Insights opens, already filtered to that unit.', 'The Category, Sub-category and Site boxes are set for that unit, so every panel and export on the page shows only that unit.'] });

SPEC.push({ type: 'custom', key: 'settings', section });
{ // Web part settings for page editors
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  REGISTER.push({ id: 'F-24', title: 'Web part settings (page editors)', area: section });
  s.addText([{ text: 'F-24  ', options: { color: C.accent3 } }, { text: 'Web part settings (page editors)' }], { placeholder: 'title' });
  s.addText('When the SharePoint page is in Edit mode, the web part\'s settings pane (pencil icon on the web part) offers three choices. Readers never see these.',
    { x: 0.5, y: 1.25, w: 12.3, h: 0.6, fontSize: 15, color: C.text1, margin: 0, isTextBox: true });
  const cards = [
    ['Dashboard on this page', 'Bank-wide Oversight or Department Insights', 'Which dashboard the page opens on. Readers can still switch with the menu.'],
    ['Show the report\'s own sidebar', 'Shown or Hidden', 'Hide it when the site\'s own navigation already links to each dashboard page.'],
    ['Text size', 'Standard, Large (default) or Extra large', 'Large is 25% bigger, Extra large 50% bigger, for readers who need larger text. Exports are always drawn at standard size.']
  ];
  cards.forEach((c, i) => {
    const x = 0.5 + i * 4.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.1, w: 3.9, h: 2.9, rectRadius: 0.12, fill: { color: 'EEF3F9' }, line: { color: 'D6E1EC', width: 1 }, objectName: c[0] + ' card' });
    s.addText(c[0], { x: x + 0.3, y: 2.3, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(c[1], { x: x + 0.3, y: 2.85, w: 3.3, h: 0.6, fontSize: 14, italic: true, color: '52657A', margin: 0, valign: 'top', isTextBox: true });
    s.addText(c[2], { x: x + 0.3, y: 3.5, w: 3.3, h: 1.4, fontSize: 14, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
  });
  const X = 0.5, W = 12.3;
  decisionBox(s, 'F-24', X, 5.3, W, 1.5);
  s.addNotes('Page settings are for whoever edits the SharePoint page, not for readers.');
}

/* ---------- B. Bank-wide Oversight ---------- */
divider('B. Bank-wide Oversight', 'EDRMS adoption across ADB: four summary cards, each opening a breakdown, then physical counterparts, the comparison and the records declaration trend.');

feature({ id: 'F-12', title: 'The four summary cards', shot: '01_bw_full',
  what: 'Active EDRMS sites, EDRMS users (approximate headcount), Documents in EDRMS and Records declared in EDRMS, for all of ADB.',
  clicks: ['Click a card (or View breakdown): its breakdown opens under the cards; the card is highlighted.', 'Only one breakdown is open at a time. Active EDRMS sites is open when the page loads.'],
  data: 'Sites: Cloud Governance. Headcount: AP All Users export (manual). Documents: M365 usage. Records: EDRMS records table.' });
feature({ id: 'F-13', title: 'Active EDRMS sites breakdown', shot: '05_sites_drill',
  what: 'Left: the Top 10 units by number of sites as bars. Right: every unit with its number of sites.',
  clicks: ['Hover a bar: shows the unit\'s full name and site count.', 'Table: search (F-06), filter (F-07), sort (F-08), page (F-09), Export table (F-10).', 'A code or row opens Department Insights for that unit (F-11).'] });
feature({ id: 'F-14', title: 'EDRMS users breakdown', shot: '13_users_drill',
  what: 'Six figures: Approximate Headcount, Users active in the last 180 days, No access in 180 days (Approx), units in the list, Completed training and Training completion %. The table gives the same per unit.',
  whatH: 1.3,
  clicks: ['Search or Filter (F-06, F-07): the table and all six figures follow the units chosen.', 'Sort any column; Export table downloads all six columns.', 'A row opens Department Insights for that unit.'],
  data: 'Headcount and training are imported (F-50). No access = headcount minus active users.' });
feature({ id: 'F-15', title: 'Documents in EDRMS breakdown', shot: '14_docs_drill',
  what: 'Documents held over time with three choices: Year (2024, 2025, 2026, All), Show by (Year or Month) and View (Total documents or New documents), plus Search and Filter for the units.',
  whatH: 1.3,
  clicks: ['Change Year / Show by / View: the chart, the three figures and the table update.', 'Search or Filter (Category > Sub-category > Sub-group): the chart, figures and table add up only the units chosen.', 'Table: total at start, total now, new documents and storage (GB) per unit, with a total row.'] });
feature({ id: 'F-16', title: 'Documents: by month, new documents, filtered', shot: '15_docs_month_new',
  what: 'The same panel set to 2025, by Month, New documents, and filtered to Category RM: how many documents the Resident Missions added each month.',
  clicks: ['Year 2025 + Month + New documents: one column per month of 2025.', 'Filter, Category RM, Apply: only PRCM, INRM and SLRM are counted; the button shows Filter (3).', 'Switch back to Total documents: the columns show documents held at each month end.'] });
feature({ id: 'F-17', title: 'Records declared breakdown', shot: '16_records_drill',
  what: 'Documents, Records declared, Declaration rate (records as a share of documents) and Unique users declaring records, overall and per unit.',
  clicks: ['Search or Filter: the table and the four figures follow the units chosen.', 'Sort, page and Export table as in F-08 to F-10.', 'A row opens Department Insights for that unit.'] });
feature({ id: 'F-18', title: 'Physical counterparts', shot: '17_physical',
  what: 'Declared records that also exist on paper: total, records declared, and the share of records with a counterpart, with a table and a donut per unit.',
  clicks: ['Search, Filter, sort, page and Export table as in F-06 to F-10.', 'Filter also updates the three figures and the donut.', 'A row opens Department Insights for that unit.'] });
feature({ id: 'F-19', title: 'Comparison: headcount against documents', shot: '18_comparison',
  what: 'Each unit\'s approximate headcount (green) beside its documents (blue). Each column has its own scale, so bars compare within a column.',
  clicks: ['Compare: choose Documents in EDRMS or Records declared in EDRMS.', 'Click a column heading: sort by it; again to reverse.', 'Search and Filter narrow the units; bar scales stay fixed so they do not jump.', 'Click a unit: opens Department Insights.'] });
feature({ id: 'F-20', title: 'Comparison: headcount against records declared', shot: '19_comparison_records',
  what: 'The same panel with Compare set to Records declared in EDRMS (green bars change to records).',
  clicks: ['Compare drop-down: switch between documents and records.', 'Hover a bar: exact figure.'] });
feature({ id: 'F-21', title: 'Records declaration trend', shot: '20_trend',
  what: 'Records declared per month (bars, left axis) and the running total (line, right axis) for a chosen period.',
  clicks: ['Preset: Last 3 / 6 / 12 months, Year to date, All time. Last 12 months on opening.', 'Custom range: pick From and To, then Apply. Reset goes back to Last 12 months.', 'Show by: Year or Month.'] });
feature({ id: 'F-22', title: 'Trend: drill from years into months', shot: '21_trend_all_years', shot2: '22_trend_drill_year',
  what: 'Shown by Year, each year\'s bar can be opened to see its months.',
  clicks: ['Click a year\'s bar: the chart shows that year by month; the figure becomes "Records declared in <year>".', 'Click "All years" in the path above the chart: back to years.'] });
feature({ id: 'F-23', title: 'Trend: custom date range', shot: '23_trend_custom',
  what: 'Any From and To date up to the Data as of date. Here January to June 2026.',
  clicks: ['Pick From and To, then Apply: the chart and the total use that range; the preset is cleared.', 'Reset: returns to Last 12 months.'] });

/* ---------- C. Department Insights ---------- */
divider('C. Department Insights', 'One or more Departments, Offices, RMs or ROs in detail: the profile, five cards with their breakdowns, and library usage.');

feature({ id: 'F-30', title: 'Department Profile and the four filter boxes', shot: '30_di_full',
  what: 'Category, Sub-category, Sub-group and Site at the top decide which units and sites every panel on the page shows. Opens on All.',
  clicks: ['Pick values in any box: every card, breakdown and export below follows.', 'Each box narrows the next (Category > Sub-category > Sub-group > Site).', 'Several values can be ticked in each box.'] });
feature({ id: 'F-31', title: 'Category and Sub-category boxes', shot: '31_di_category_open', shot2: '32_di_subcategory_open',
  what: 'Category lists HQ, RM and RO. Sub-category lists the departments in the chosen category; Sub-group the missions or groups under them.',
  clicks: ['Open a box: tick one or more values; "All" clears the box.', 'Type in the box\'s search to find a value.', 'Values and labels come from the site list and can be renamed (RAC Item 5).'] });
feature({ id: 'F-32', title: 'Site box with search', shot: '33_di_site_search',
  what: 'Lists the sites under the chosen units ("All 1,032 sites" when nothing is chosen).',
  clicks: ['Type part of a name: the list narrows.', 'Tick one or more sites: the cards and breakdowns show only those sites.', 'Changing the unit boxes resets the site choice.'] });
feature({ id: 'F-33', title: 'Go-Live date and site convention', shot: '34_di_one_dept',
  what: 'Two chips under the filters: the date the unit started using EDRMS, and a link to its approved site naming guide (RAC Items 3 and 4).',
  clicks: ['With one unit chosen: shows its Go-Live date ("Not yet provided" if blank).', 'View guide: opens the unit\'s guide in a new tab. With several units: "Varies by department" / "Select a department".'],
  data: 'Imported from the Departments tab of the manual data template (F-50).' });
feature({ id: 'F-34', title: 'The five cards', shot: '30_di_full',
  what: 'Sites, Site visitors, Documents, Records declared and Physical Counterparts for the chosen units and sites.',
  clicks: ['Click a card: its breakdown opens beneath the cards. Sites is open on loading.', 'The cards follow the four filter boxes.'] });
feature({ id: 'F-35', title: 'EDRMS sites breakdown', shot: '35_di_sites_panel',
  what: 'Each site, its owner and when it was created (RAC Item 10: site names, not URLs; owners by name, not email).',
  clicks: ['Year: all years or one year. Or choose a custom From / To, then Apply.', 'Search a site or owner; sort; page; Export table.', 'Hover an owner: shows the owner\'s email.'] });
feature({ id: 'F-36', title: 'Site visitors breakdown', shot: '36_di_visitors',
  what: 'Unique visitors in the last 180 days, split into internal (ADB accounts) and external (guests), per site, plus the 10 most visited sites.',
  clicks: ['All / Internal / External: changes the top 10 chart.', 'Click a bar: finds that site in the table and highlights it.', 'Search a site; sort; page; Export table.'],
  data: 'A visitor opened anything on the site; counted once per site (Purview audit log).' });
feature({ id: 'F-37', title: 'Site visitors: external only', shot: '37_di_visitors_external',
  what: 'The same panel with External chosen: the sites most visited by guests.',
  clicks: ['External: the chart ranks sites by external visitors.', 'All: back to all visitors.'] });
feature({ id: 'F-38', title: 'Documents breakdown', shot: '38_di_docs', shot2: '38_di_docs_alt',
  what: 'Files and storage per site, with the total storage in the panel title.',
  clicks: ['Measure Documents / Storage: the top 10 chart ranks by that measure.', 'Click a bar: finds the site in the table.', 'Search; sort; page; Export table.'] });
feature({ id: 'F-39', title: 'Records declared breakdown', shot: '39_di_records', shot2: '39_di_records_alt',
  what: 'Records declared per site and the number of people who declared them.',
  clicks: ['Measure Records / People: the chart ranks by records or by people declaring.', 'Click a bar: finds the site in the table.', 'Search; sort; page; Export table.'] });
feature({ id: 'F-40', title: 'Physical counterparts breakdown', shot: '40_di_physical', shot2: '40_di_physical_alt',
  what: 'Records with a paper version per site, and their share of the site\'s records.',
  clicks: ['Measure Count / Share: the chart ranks by number or by share.', 'Click a bar: finds the site in the table.', 'Search; sort; page; Export table.'] });
feature({ id: 'F-41', title: 'Library usage', shot: '42_library',
  what: 'Every document library in the chosen sites: folders, documents, records, physical counterparts and active users, with its own four filter boxes.',
  clicks: ['Category / Sub-category / Sub-group / Site boxes: narrow the libraries.', 'Six summary figures update with the boxes.', 'Search a library or site; sort; page; Export table.'],
  data: 'Folder count: Microsoft Graph weekly scan, pending AvePoint confirmation (Item 12).' });
feature({ id: 'F-42', title: 'Library usage: most used libraries', shot: '43_library_users',
  what: 'The top 10 libraries by the chosen measure. Here Users: people who opened or edited files in the library in the last 180 days.',
  clicks: ['Measure Folders / Documents / Records / Counterparts / Users: re-ranks the chart.', 'Click a bar: finds the library in the table.', '"+ N more libraries with ..." lists ties beyond the top 10.'],
  data: 'Active users are counted per library (Purview audit log, file actions only).' });

/* ---------- D. Import data ---------- */
divider('D. Import data (Owners and admins only)', 'How the manual data RAC provides gets into the report: one template, checked in full before anything is saved.');

feature({ id: 'F-50', title: 'Import data button and panel', shot: '51_owner_header', shot2: '52_import_panel',
  what: 'Site Owners and admins see Import data beside Export. Members and Visitors do not see it at all; SharePoint decides from the person\'s site permission.',
  clicks: ['Import data: a side panel opens over the report.', 'Download Excel template: one file with the tabs Sites, People, Departments, Code mapping and Valid values, pre-filled with what is loaded now.', 'Close (X) or Esc: closes the panel.'],
  data: 'Saved in a library on the site that only Owners can change. No names or emails are stored.' });
SPEC.push({ type: 'custom', key: 'template', section });
{ // Template tabs
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  REGISTER.push({ id: 'F-51', title: 'The manual data template', area: section });
  s.addText([{ text: 'F-51  ', options: { color: C.accent3 } }, { text: 'The manual data template' }], { placeholder: 'title' });
  const tabs = [
    ['Sites', 'Sir Rotsen\'s site list (VLOOKUP SITE), pasted as it is', 'Site, URL, Site Name, Department, Division, Production, Full Name, Category, Sub-category, Sub-group', 'The four filter boxes (F-07, F-30)'],
    ['People', 'The AP All Users export, plus one column RAC fills', 'Email, Display Name, Department, Division, Unit, Office Location, Staff type, Completed EDRMS training (Yes/No)', 'Headcount and Completed training (F-14, F-19)'],
    ['Departments', 'One row per unit', 'Unit code, Go-Live date, Site convention link, Completed training (count)', 'Go-Live date and View guide (F-33); training as a number'],
    ['Code mapping', 'Optional', 'Code in People, Report unit (e.g. SD1 > report unit)', 'Places people under the right unit']
  ];
  s.addTable([[{ text: 'Tab', options: { bold: true, color: 'FFFFFF', fill: { color: THEME.colors.dk2 } } }, { text: 'What it is', options: { bold: true, color: 'FFFFFF', fill: { color: THEME.colors.dk2 } } }, { text: 'Columns', options: { bold: true, color: 'FFFFFF', fill: { color: THEME.colors.dk2 } } }, { text: 'Feeds', options: { bold: true, color: 'FFFFFF', fill: { color: THEME.colors.dk2 } } }]]
    .concat(tabs.map(t => t.map((c, i) => ({ text: c, options: { bold: i === 0 } })))),
  { x: 0.5, y: 1.3, w: 8.0, colW: [1.3, 1.9, 3.0, 1.8], fontSize: 11, color: '172B4D', border: { type: 'solid', color: 'D6E1EC', pt: 0.75 }, valign: 'top', margin: 0.06 });
  const X = 8.75, W = 4.1;
  s.addText('Rules every file must pass', { x: X, y: 1.2, w: W, h: 0.3, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  const rules = ['Tab names and headings as in the template', 'Valid codes, Yes/No, dates up to today, sharepoint.com links', 'Training no more than the headcount; per person or as a count, not both', 'Service accounts and repeated rows skipped and reported', 'If any rule is broken, nothing is loaded'];
  s.addText(rules.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < rules.length - 1, paraSpaceAfter: 4 } })), { x: X, y: 1.5, w: W, h: 3.5, fontSize: 12, color: C.text1, margin: 0, valign: 'top', isTextBox: true });
  decisionBox(s, 'F-51', X, 5.25, W, 1.6);
}
feature({ id: 'F-52', title: 'A file with problems is refused', shot: 'import_refused',
  what: 'Uploading a file checks every row first. Any problem means nothing is loaded, and every problem is listed.',
  clicks: ['Drop the file in the panel or browse to it.', 'The list shows each problem by tab, row and column, in plain words.', 'Fix the file and upload again. The refusal is recorded in the import history.'] });
feature({ id: 'F-53', title: 'A file that passes is loaded in one click', shot: 'import_passed',
  what: 'When every row passes, the panel shows what will be loaded and any notes (e.g. service accounts skipped).',
  clicks: ['Import: the data is saved; every reader sees the new figures on their next refresh.', 'Cancel: nothing changes.', 'Import history: who loaded which file, and when.'] });

/* ---------- E. Data and decisions ---------- */
divider('E. Data behind the figures, and your decisions', 'Where each figure comes from, what RAC still needs to provide, and the decision register.');

SPEC.push({ type: 'custom', key: 'sources', section });
{ // Data sources
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText('Where each figure comes from', { placeholder: 'title' });
  const H = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: THEME.colors.dk2 } } });
  const rows = [
    ['Sites, site owners, created date', 'AvePoint Cloud Governance', 'Automatic, weekly'],
    ['Documents, storage', 'Microsoft 365 / Graph scan', 'Automatic, weekly'],
    ['Records declared, physical counterparts', 'EDRMS records table (drm-npr)', 'Automatic, weekly'],
    ['Site visitors, active users', 'Purview audit log', 'Automatic, weekly'],
    ['Folders per library', 'Microsoft Graph scan', 'Pending AvePoint confirmation'],
    ['Headcount, staff type', 'AP All Users export (People tab)', 'Manual import (F-50)'],
    ['Completed training', 'RAC list (People or Departments tab)', 'Manual import'],
    ['Go-Live date, site convention link', 'RAC (Departments tab)', 'Manual import'],
    ['Category, Sub-category, Sub-group', 'Sir Rotsen\'s site list (Sites tab)', 'Manual import']
  ];
  s.addTable([[H('Figure'), H('Source'), H('How it arrives')]].concat(rows.map(r => r.map(c => ({ text: c })))),
    { x: 0.5, y: 1.3, w: 12.3, colW: [4.3, 4.6, 3.4], fontSize: 13, color: '172B4D', border: { type: 'solid', color: 'D6E1EC', pt: 0.75 }, margin: 0.08, rowH: 0.5 });
}
SPEC.push({ type: 'custom', key: 'asks', section });
{ // What RAC still needs to provide
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText('What we still need from RAC', { placeholder: 'title' });
  const asks = [
    ['Completed EDRMS training', 'Per person (Yes/No on People) or a count per unit (Departments). Please say which.'],
    ['Go-Live date and site convention link', 'One row per Department / Office / RM / RO on the Departments tab.'],
    ['Category, Sub-category, Sub-group', 'The three columns in sir Rotsen\'s site file, to confirm the drill-down (HQ, RM, RO and below).'],
    ['Code mapping', 'Which report unit each HR code belongs to (SD1, SD2, SD3, CCSD, CSD and others).'],
    ['Decisions on F-01 to F-53', 'Keep, change or remove, using the register on the next slides.']
  ];
  asks.forEach((a, i) => {
    const y = 1.35 + i * 1.08;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.08, w: 0.6, h: 0.6, fill: { color: THEME.colors.accent3 }, line: { color: THEME.colors.accent3 }, objectName: 'Ask ' + (i + 1) });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.08, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addText(a[0], { x: 1.5, y, w: 11, h: 0.38, fontSize: 18, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(a[1], { x: 1.5, y: y + 0.4, w: 11, h: 0.5, fontSize: 14, color: C.text1, margin: 0, isTextBox: true });
  });
}
SPEC.push({ type: 'custom', key: 'register', section });
{ // Decision register (auto-paged table)
  const H = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: THEME.colors.dk2 } } });
  const rows = [[H('ID'), H('Function'), H('Area'), H('Keep (X)'), H('Change (X)'), H('Remove (X)'), H('Comments')]]
    .concat(REGISTER.slice().sort((a, b) => a.id.localeCompare(b.id)).map(r => [r.id, r.title, r.area.replace(/^[A-E]\. /, ''), '', '', '', ''].map(c => ({ text: c }))));
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText('Decision register', { placeholder: 'title' });
  s.addTable(rows, { x: 0.5, y: 1.25, w: 12.3, colW: [0.8, 4.0, 2.6, 0.7, 0.8, 0.8, 2.6], fontSize: 11, color: '172B4D',
    border: { type: 'solid', color: 'D6E1EC', pt: 0.75 }, margin: 0.05, rowH: 0.3, autoPage: true, autoPageRepeatHeader: true,
    autoPageSlideStartY: 1.25, autoPageCharWeight: -0.5, autoPageLineWeight: 0.3, newSlideStartY: 1.25 });
  (s.newAutoPagedSlides || []).forEach(ns => ns.addText('Decision register (continued)', { placeholder: 'title' }));
}
SPEC.push({ type: 'custom', key: 'close', section });
{ // Close
  pres.addSection({ title: 'Next steps' });
  const s = pres.addSlide({ masterName: 'SECTION', sectionTitle: 'Next steps' });
  s.addText('Next steps', { placeholder: 'title' });
  s.addText('1. RAC reviews each function and fills in the decision register.\n2. RAC provides the training list, Go-Live dates, convention links, categories and code mapping.\n3. The EDRMS team updates the report and walks RAC through the changes.', { placeholder: 'body' });
}

(async () => {
  fs.writeFileSync(path.join(__dirname, 'walkthrough_content.json'), JSON.stringify({ spec: SPEC, register: REGISTER.slice().sort((a, b) => a.id.localeCompare(b.id)) }, null, 1));
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT, 'functions', REGISTER.length);
})();
