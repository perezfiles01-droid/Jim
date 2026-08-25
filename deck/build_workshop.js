/* Workshop navigation deck. Sixteen slides whose job is to get the room into
   the gap checker workbook and then get out of the way: every section slide
   ends with the tab and the row to open. The counts come from workshop.json,
   which is read out of the workbook itself, so a number on a slide and the same
   number in the script or the file cannot drift apart. */
const pptxgen = require('pptxgenjs');
const fs = require('fs'), path = require('path');
const D = __dirname, SHOTS = path.join(D, 'shots');
const K = JSON.parse(fs.readFileSync(path.join(D, 'workshop_content.json'), 'utf8'));

/* ADB palette, same tokens as the 22 August deck so the two read as one family. */
const C = { navy:'0E1F35', ink:'10243E', ink2:'33475F', blue:'0072BC', blued:'005A96',
  teal:'00A5A8', green:'5CA943', amber:'C77B18', red:'B3241C',
  white:'FFFFFF', soft:'F4F7FA', line:'DCE4EC', mut:'6B7A8C',
  greenbg:'EAF4E4', amberbg:'FDF1DE', redbg:'FBE6E4' };
const SER = 'Cambria', SAN = 'Calibri';
const W = 13.333, H = 7.5;

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = 'ADB EDRMS Utilization Report';
p.title  = 'EDRMS Utilization Report, requirements workshop';

const XL = 'EDRMS_Util_Dashboard_Gap_Checker_2026-08-21.xlsx';
const dim = f => { const b = fs.readFileSync(path.join(SHOTS, f));
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
/* Never change a screenshot's aspect ratio: a stretched dashboard is a wrong
   dashboard, and these are the pictures the client will compare against. */
function fit(f, fx, fy, fw, fh) {
  const d = dim(f), r = d.w / d.h;
  let w = fw, h = w / r;
  if (h > fh) { h = fh; w = h * r; }
  return { path: path.join(SHOTS, f), x: fx + (fw - w) / 2, y: fy + (fh - h) / 2, w, h };
}
const shadow = () => ({ type:'outer', blur:14, offset:2, angle:90, color:'8FA3B8', opacity:0.35 });

function head(s, eyebrow, title) {
  s.addText(eyebrow.toUpperCase(), { x:0.55, y:0.3, w:11, h:0.26, fontFace:SAN,
    fontSize:10.5, bold:true, charSpacing:1.4, color:C.blue, margin:0 });
  s.addText(title, { x:0.55, y:0.56, w:12.2, h:0.55, fontFace:SER, fontSize:25,
    bold:true, color:C.ink, margin:0 });
}
/* The instruction bar. It is on every section slide, in the same place, in the
   same colour, because the one thing the room must never wonder is where to
   look. */
function openBar(s, text) {
  s.addShape(p.ShapeType.roundRect, { x:0.55, y:6.45, w:12.2, h:0.62,
    fill:{ color:C.ink }, rectRadius:0.08, line:{ color:C.ink } });
  s.addText([{ text:'OPEN THE FILE   ', options:{ bold:true, color:C.teal, fontSize:12 } },
             { text, options:{ color:C.white, fontSize:13 } }],
    { x:0.85, y:6.45, w:11.6, h:0.62, fontFace:SAN, valign:'middle', margin:0 });
}
function footer(s, n) {
  s.addText(XL, { x:0.55, y:7.05, w:8, h:0.28, fontFace:SAN, fontSize:9,
    color:C.mut, margin:0 });
  s.addText(String(n), { x:12.2, y:7.05, w:0.6, h:0.28, fontFace:SAN, fontSize:9,
    color:C.mut, align:'right', margin:0 });
}
let N = 0;
function slide() { const s = p.addSlide(); N += 1; return s; }

/* ---------------------------------------------------------- 1. title ---- */
{
  const s = slide();
  s.background = { color: C.navy };
  s.addText('EDRMS Utilization Report', { x:0.9, y:2.25, w:11.5, h:0.8, fontFace:SER,
    fontSize:40, bold:true, color:C.white, margin:0 });
  s.addText('Requirements workshop', { x:0.9, y:3.1, w:11.5, h:0.5, fontFace:SER,
    fontSize:24, color:C.teal, margin:0 });
  s.addShape(p.ShapeType.rect, { x:0.92, y:3.85, w:1.5, h:0.045, fill:{ color:C.blue }, line:{ color:C.blue } });
  s.addText('We will spend most of today inside one file, not in these slides.',
    { x:0.9, y:4.15, w:10.5, h:0.4, fontFace:SAN, fontSize:15, color:'C6D3E0', margin:0 });
  s.addText(XL, { x:0.9, y:6.4, w:11.5, h:0.3, fontFace:SAN, fontSize:11, color:C.mut, margin:0 });
}

/* ------------------------------------------------------- 2. why here ---- */
{
  const s = slide();
  head(s, 'Why we are here', 'You wrote the requirements. We built what could be built.');
  const box = (x, big, lab, sub, col) => {
    s.addShape(p.ShapeType.roundRect, { x, y:1.55, w:3.85, h:2.0, fill:{ color:C.soft },
      rectRadius:0.08, line:{ color:C.line } });
    s.addText(big, { x, y:1.75, w:3.85, h:0.85, fontFace:SER, fontSize:44, bold:true,
      color:col, align:'center', margin:0 });
    s.addText(lab, { x, y:2.6, w:3.85, h:0.3, fontFace:SAN, fontSize:13, bold:true,
      color:C.ink, align:'center', margin:0 });
    s.addText(sub, { x:x+0.25, y:2.92, w:3.35, h:0.5, fontFace:SAN, fontSize:10.5,
      color:C.mut, align:'center', margin:0 });
  };
  box(0.55,  String(K.tot.tot), 'requirement items', 'Read off your 69 slide deck', C.ink);
  box(4.75,  String(K.tot.yes), 'are in the prototype', 'Built and on screen today', C.green);
  box(8.95,  String(K.tot.no),  'are not', 'Almost all for one reason: no source', C.red);
  s.addText([
    { text:'The 55 are not a backlog of work we have not done.', options:{ bold:true } },
    { text:' They are questions we cannot answer without you. Most of them collapse into five ' +
           'missing sources, and today is about finding out whether those five exist.' }],
    { x:0.55, y:3.95, w:12.2, h:0.9, fontFace:SAN, fontSize:14.5, color:C.ink2, margin:0 });
  s.addText('The file we are about to open holds all ' + K.tot.tot + ' of them, one per row, ' +
    'with a picture of the built screen beside each one.',
    { x:0.55, y:5.0, w:12.2, h:0.5, fontFace:SAN, fontSize:13, color:C.mut, italic:true, margin:0 });
  footer(s, N);
}

/* -------------------------------------------------- 3. how this runs ---- */
{
  const s = slide();
  head(s, 'How today runs', 'Three minutes of slides, then the file for the rest.');
  let y = 1.6;
  K.agenda.forEach(([name, mins, note]) => {
    const isSlides = name === 'Slides' || name === 'Close';
    s.addShape(p.ShapeType.rect, { x:0.55, y, w:12.2, h:0.54,
      fill:{ color: isSlides ? C.white : C.soft }, line:{ color:C.line } });
    s.addText(name, { x:0.8, y, w:4.4, h:0.54, fontFace:SAN, fontSize:13,
      bold:!isSlides, color:C.ink, valign:'middle', margin:0 });
    s.addText(mins + ' min', { x:5.3, y, w:1.1, h:0.54, fontFace:SAN, fontSize:12,
      color:C.blued, bold:true, valign:'middle', margin:0 });
    s.addText(note, { x:6.6, y, w:5.9, h:0.54, fontFace:SAN, fontSize:11.5,
      color:C.mut, valign:'middle', margin:0 });
    y += 0.58;
  });
  s.addText('You will be asked a lot of questions today. That is the point of the session: ' +
    'seventeen of them, and we will write your answers straight into the file as we go.',
    { x:0.55, y:6.4, w:12.2, h:0.6, fontFace:SAN, fontSize:13.5, color:C.ink2, margin:0 });
  footer(s, N);
}

/* --------------------------------------------- 4. how to read the file -- */
{
  const s = slide();
  head(s, 'How to read the file', 'Eight columns. Two of them matter most.');
  const cols = [
    ['#', 'The row number we will call out'],
    ['Requirement Items', 'Your words, off your slide'],
    ['Type', 'Tile, table column, chart, indicator'],
    ['In the prototype?', 'Yes means you can see it today'],
    ['Slide', 'Which of your 69 slides it came from'],
    ['Why it is not there', 'Only filled in when the answer is No'],
    ['What it needs', 'Where it says ASK, that is a question for you'],
    ['Question', 'Which of the seventeen it belongs to'],
  ];
  let y = 1.55;
  cols.forEach(([c, d], i) => {
    const hot = (i === 3 || i === 6);
    s.addShape(p.ShapeType.rect, { x:0.55, y, w:12.2, h:0.5,
      fill:{ color: hot ? C.amberbg : C.white }, line:{ color:C.line } });
    s.addText(c, { x:0.8, y, w:3.4, h:0.5, fontFace:SAN, fontSize:12.5,
      bold:true, color:C.ink, valign:'middle', margin:0 });
    s.addText(d, { x:4.4, y, w:8.1, h:0.5, fontFace:SAN, fontSize:12,
      color: hot ? C.ink : C.mut, valign:'middle', margin:0 });
    y += 0.53;
  });
  y += 0.15;
  const chip = (x, fill, txt, note) => {
    s.addShape(p.ShapeType.roundRect, { x, y, w:1.35, h:0.5, fill:{ color:fill },
      rectRadius:0.06, line:{ color:C.line } });
    s.addText(txt, { x, y, w:1.35, h:0.5, fontFace:SAN, fontSize:12, bold:true,
      color:C.ink, align:'center', valign:'middle', margin:0 });
    s.addText(note, { x:x+1.5, y, w:4.3, h:0.5, fontFace:SAN, fontSize:12,
      color:C.ink2, valign:'middle', margin:0 });
  };
  chip(0.55, C.amberbg, 'Yes', 'Built. On screen. Argue with it today.');
  chip(6.9,  C.redbg,   'No',  'Not built, and the row says why.');
  openBar(s, 'Any tab. Look at row 4, the headings, then row 6, the first requirement.');
  footer(s, N);
}

/* ------------------------------------------------- 5. mockups column ---- */
{
  const s = slide();
  head(s, 'The MOCKUPS column', 'Every screen is pictured beside the requirement it came from.');
  s.addImage({ ...fit('bw-01.png', 0.55, 1.35, 7.6, 4.75), shadow: shadow() });
  s.addText('What you get on each row', { x:8.5, y:1.4, w:4.3, h:0.35, fontFace:SAN,
    fontSize:13, bold:true, color:C.ink, margin:0 });
  const bullets = [
    'Your requirement, in your own words',
    'Whether it is built, in one word',
    'A picture of the built screen, in the row',
    'If it is not built, the reason and the ask',
  ];
  let by = 1.85;
  bullets.forEach(b => {
    s.addShape(p.ShapeType.rect, { x:8.5, y:by+0.12, w:0.1, h:0.1, fill:{ color:C.teal }, line:{ color:C.teal } });
    s.addText(b, { x:8.75, y:by, w:4.05, h:0.55, fontFace:SAN, fontSize:12.5,
      color:C.ink2, margin:0 });
    by += 0.62;
  });
  s.addText('So nobody has to remember what a screen looked like. It is on the row, next to ' +
    'the words you wrote about it.',
    { x:8.5, y:4.6, w:4.3, h:0.9, fontFace:SAN, fontSize:12, italic:true, color:C.mut, margin:0 });
  openBar(s, 'Any tab, column I. Click a picture to enlarge it.');
  footer(s, N);
}

/* ---------------------------------------------------- 6. scoreboard ----- */
{
  const s = slide();
  head(s, 'The scoreboard', 'Six tabs, and where the open questions actually are.');
  let y = 1.5;
  const maxTot = Math.max(...K.sheets.map(x => x.tot));
  K.sheets.forEach(sh => {
    s.addText(sh.name, { x:0.55, y, w:3.5, h:0.55, fontFace:SAN, fontSize:13,
      bold:true, color:C.ink, valign:'middle', margin:0 });
    const bw = 6.4 * (sh.tot / maxTot);
    const gw = bw * (sh.yes / sh.tot);
    s.addShape(p.ShapeType.rect, { x:4.2, y:y+0.13, w:gw, h:0.3,
      fill:{ color:C.green }, line:{ color:C.green } });
    if (sh.no) s.addShape(p.ShapeType.rect, { x:4.2+gw, y:y+0.13, w:bw-gw, h:0.3,
      fill:{ color:C.red }, line:{ color:C.red } });
    s.addText(`${sh.yes} in`, { x:10.75, y, w:1.0, h:0.55, fontFace:SAN, fontSize:12,
      color:C.green, bold:true, valign:'middle', margin:0 });
    s.addText(sh.no ? `${sh.no} out` : 'none out', { x:11.7, y, w:1.1, h:0.55,
      fontFace:SAN, fontSize:12, color: sh.no ? C.red : C.mut, bold:!!sh.no,
      valign:'middle', margin:0 });
    y += 0.62;
  });
  s.addText([
    { text:'Tabs 3, 4 and 6 have nothing marked out, and that is not good news. ',
      options:{ bold:true } },
    { text:'It means every row is drawn but almost none of it has a real source yet. ' +
           'Tabs 1 and 2 carry all 55 of the open rows.' }],
    { x:0.55, y:5.5, w:12.2, h:0.8, fontFace:SAN, fontSize:14, color:C.ink2, margin:0 });
  openBar(s, 'Tab 1 to start. We work left to right.');
  footer(s, N);
}

/* -------------------------------------------------- 7. five answers ----- */
{
  const s = slide();
  head(s, 'The five answers', 'Almost every open row waits on one of these five.');
  let y = 1.55;
  K.five.forEach(([name, what, count, q]) => {
    s.addShape(p.ShapeType.roundRect, { x:0.55, y, w:12.2, h:0.86, fill:{ color:C.soft },
      rectRadius:0.06, line:{ color:C.line } });
    s.addText(name, { x:0.85, y, w:3.1, h:0.86, fontFace:SAN, fontSize:14, bold:true,
      color:C.ink, valign:'middle', margin:0 });
    s.addText(what, { x:4.0, y, w:6.0, h:0.86, fontFace:SAN, fontSize:12,
      color:C.ink2, valign:'middle', margin:0 });
    s.addText(count, { x:10.1, y, w:1.5, h:0.86, fontFace:SAN, fontSize:12.5,
      color:C.red, bold:true, valign:'middle', margin:0 });
    s.addText(q, { x:11.6, y, w:1.1, h:0.86, fontFace:SAN, fontSize:12,
      color:C.blued, bold:true, valign:'middle', align:'right', margin:0 });
    y += 0.94;
  });
  s.addText('If we leave today with an owner and a date against each of these five, the ' +
    'workshop has done its job. Everything else is detail.',
    { x:0.55, y:6.4, w:12.2, h:0.6, fontFace:SAN, fontSize:14, color:C.ink2, margin:0 });
  footer(s, N);
}

/* ------------------------------------------- 8 to 13. tab handoffs ------ */
K.tabs.forEach(t => {
  const sh = K.sheets.find(x => x.tab === t.tab);
  const s = slide();
  head(s, `Tab ${t.tab} of 6`, t.short);
  s.addImage({ ...fit(t.shot, 0.55, 1.3, 7.3, 4.15), shadow: shadow() });

  /* counts */
  s.addShape(p.ShapeType.roundRect, { x:8.2, y:1.3, w:4.55, h:0.72, fill:{ color:C.soft },
    rectRadius:0.06, line:{ color:C.line } });
  s.addText([
    { text:`${sh.yes} in`, options:{ bold:true, color:C.green, fontSize:15 } },
    { text:'   •   ', options:{ color:C.line } },
    { text: sh.no ? `${sh.no} not built` : 'none marked out',
      options:{ bold:true, color: sh.no ? C.red : C.mut, fontSize:15 } },
    { text:`   •   rows ${sh.first_row} to ${sh.last_row}`,
      options:{ color:C.mut, fontSize:12 } }],
    { x:8.45, y:1.3, w:4.3, h:0.72, fontFace:SAN, valign:'middle', margin:0 });

  s.addText(t.what, { x:8.2, y:2.15, w:4.55, h:1.35, fontFace:SAN, fontSize:12,
    color:C.ink2, margin:0 });

  s.addText('WHAT WE NEED TO SETTLE HERE', { x:8.2, y:3.5, w:4.55, h:0.28, fontFace:SAN,
    fontSize:10, bold:true, charSpacing:1.2, color:C.blue, margin:0 });
  let dy = 3.82;
  t.decisions.forEach(d => {
    s.addShape(p.ShapeType.rect, { x:8.2, y:dy+0.11, w:0.1, h:0.1,
      fill:{ color:C.amber }, line:{ color:C.amber } });
    s.addText(d, { x:8.45, y:dy, w:4.3, h:0.6, fontFace:SAN, fontSize:12,
      color:C.ink, margin:0 });
    dy += 0.62;
  });

  /* the questions that live on this tab */
  const qs = K.questions.filter(q => q.tab === t.tab).map(q => 'Q' + q.id);
  s.addText(qs.length ? 'Questions on this tab: ' + qs.join(', ')
                      : 'No dedicated questions on this tab',
    { x:0.55, y:5.6, w:7.3, h:0.35, fontFace:SAN, fontSize:12, bold:true,
      color:C.blued, margin:0 });
  s.addText(t.jump, { x:0.55, y:5.92, w:12.2, h:0.45, fontFace:SAN, fontSize:12,
    italic:true, color:C.mut, margin:0 });

  openBar(s, `Tab ${t.tab}, "${sh.name.replace(/^\d+\s/, '')}". Rows ${sh.first_row} to ${sh.last_row}.`);
  footer(s, N);
});

/* ------------------------------------------- 14. what we need from you -- */
{
  const s = slide();
  head(s, 'What we need from you', 'A name and a date against each. We will fill this in now.');
  const hdr = ['The source', 'Does it exist?', 'Who owns it', 'By when'];
  const xs = [0.55, 5.6, 7.9, 10.6];
  const ws = [5.0, 2.25, 2.65, 2.15];
  hdr.forEach((h, i) => {
    s.addShape(p.ShapeType.rect, { x:xs[i], y:1.5, w:ws[i], h:0.5, fill:{ color:C.ink }, line:{ color:C.ink } });
    s.addText(h, { x:xs[i]+0.15, y:1.5, w:ws[i]-0.2, h:0.5, fontFace:SAN, fontSize:12,
      bold:true, color:C.white, valign:'middle', margin:0 });
  });
  let y = 2.0;
  K.five.forEach(([name, what]) => {
    for (let i = 0; i < 4; i++)
      s.addShape(p.ShapeType.rect, { x:xs[i], y, w:ws[i], h:0.78,
        fill:{ color: i === 0 ? C.soft : C.white }, line:{ color:C.line } });
    s.addText([{ text:name + '\n', options:{ bold:true, fontSize:12.5, color:C.ink } },
               { text:what, options:{ fontSize:10.5, color:C.mut } }],
      { x:xs[0]+0.15, y, w:ws[0]-0.3, h:0.78, fontFace:SAN, valign:'middle', margin:0 });
    y += 0.82;
  });
  s.addText('If the answer to "does it exist" is no, that is a good answer. It lets us take ' +
    'the rows off the report today instead of showing you a blank column for another month.',
    { x:0.55, y:6.35, w:12.2, h:0.7, fontFace:SAN, fontSize:13.5, color:C.ink2, margin:0 });
  footer(s, N);
}

/* ------------------------------------------------ 15. what happens next - */
{
  const s = slide();
  head(s, 'What happens next', 'What each answer turns into.');
  const nxt = [
    ['You confirm the department rule', 'Every per department figure reconciles to the bank total', 'Same week'],
    ['You send the project register', 'Project Insights becomes real, all 20 rows', 'Same week'],
    ['You send the user register', 'Nine columns across two dashboards come back', 'Same week'],
    ['You settle division', 'Eight rows either return or come off for good', 'Immediate'],
    ['You name the physical sources', 'Tab 6 stops being an illustration', 'Depends on eServe'],
    ['Anything you say no to', 'We remove the row rather than leave it pending', 'Immediate'],
  ];
  let y = 1.55;
  nxt.forEach(([a, b, c], i) => {
    s.addShape(p.ShapeType.rect, { x:0.55, y, w:12.2, h:0.68,
      fill:{ color: i % 2 ? C.white : C.soft }, line:{ color:C.line } });
    s.addText(a, { x:0.8, y, w:4.2, h:0.68, fontFace:SAN, fontSize:12.5, bold:true,
      color:C.ink, valign:'middle', margin:0 });
    s.addText('→', { x:5.05, y, w:0.4, h:0.68, fontFace:SAN, fontSize:14,
      color:C.teal, valign:'middle', margin:0 });
    s.addText(b, { x:5.5, y, w:5.6, h:0.68, fontFace:SAN, fontSize:12,
      color:C.ink2, valign:'middle', margin:0 });
    s.addText(c, { x:11.2, y, w:1.5, h:0.68, fontFace:SAN, fontSize:11,
      color:C.mut, valign:'middle', align:'right', margin:0 });
    y += 0.72;
  });
  s.addText('The prototype is at perezfiles01-droid.github.io/Jim. It is a specification for ' +
    'the Power BI report, not the report itself.',
    { x:0.55, y:6.3, w:12.2, h:0.5, fontFace:SAN, fontSize:12.5, color:C.mut,
      italic:true, margin:0 });
  footer(s, N);
}

/* ------------------------------------------------------------ 16. close - */
{
  const s = slide();
  s.background = { color: C.navy };
  s.addText('The file is the record.', { x:0.9, y:2.4, w:11.5, h:0.7, fontFace:SER,
    fontSize:34, bold:true, color:C.white, margin:0 });
  s.addText('It goes back to you today with your answers typed into it, in the same ' +
    'rows we read them from.',
    { x:0.9, y:3.25, w:10.8, h:0.8, fontFace:SAN, fontSize:16, color:'C6D3E0', margin:0 });
  s.addShape(p.ShapeType.rect, { x:0.92, y:4.25, w:1.5, h:0.045, fill:{ color:C.blue }, line:{ color:C.blue } });
  s.addText([
    { text:`${K.tot.yes} built  •  `, options:{ color:C.teal } },
    { text:`${K.tot.no} waiting on you  •  `, options:{ color:C.white } },
    { text:'17 questions', options:{ color:C.teal } }],
    { x:0.9, y:4.55, w:11.5, h:0.4, fontFace:SAN, fontSize:15, margin:0 });
  s.addText(XL, { x:0.9, y:6.4, w:11.5, h:0.3, fontFace:SAN, fontSize:11, color:C.mut, margin:0 });
}

const OUT = path.join(D, '..', 'EDRMS_Workshop_Deck_2026-08-24.pptx');
p.writeFile({ fileName: OUT }).then(() => console.log('wrote', OUT, N, 'slides'));
