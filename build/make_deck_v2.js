/* Rebuilds the RAC Reporting Suite MVP deck in the house format taken from
   slides 1 and 2 of the original: F1F5FA ground, Cambria 36pt bold 44546A
   title at 0.36in / 0.05in, Calibri body. Geometry is explicit throughout
   because LibreOffice cannot render in this container, so there is no
   picture to check the layout against. */
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.defineLayout({ name: "ADB", width: 13.333, height: 7.5 });
pres.layout = "ADB";
pres.author = "EDRMS Utilization Report";
pres.title  = "RAC Reporting Suite: MVP Proposal and Next Steps";

const BG="F1F5FA", TTL="44546A", NAVY="1E2761", ICE="CADCFC", MUT="6B7A90",
      INK="333F50", WHITE="FFFFFF",
      GRN="1F6B3B", GRNF="DCEDE2", AMB="8A5A00", AMBF="FBEFD4",
      RED="9C2B2B", REDF="F7E0E0", CARD="FFFFFF";
const SER="Cambria", SANS="Calibri";

/* House title block, copied from slide 2's own geometry. */
function slide(title, eyebrow){
  const s = pres.addSlide();
  s.background = { color: BG };
  if (eyebrow) s.addText(eyebrow, { x:0.36, y:0.30, w:12.27, h:0.24, fontSize:10.5,
    bold:true, color:MUT, charSpacing:1.6, fontFace:SANS, isTextBox:true, margin:0 });
  s.addText(title, { x:0.36, y: eyebrow?0.56:0.05, w:12.27, h:0.72, fontSize:32,
    bold:true, color:TTL, fontFace:SER, isTextBox:true, margin:0, valign:"middle" });
  return s;
}
function card(s,x,y,w,h,fill){ s.addShape(pres.shapes.ROUNDED_RECTANGLE,
  { x,y,w,h, rectRadius:0.06, fill:{color:fill||CARD}, line:{color:"DCE4EF",width:1},
    shadow:{type:"outer",color:"9AA8BC",blur:6,offset:1,angle:90,opacity:0.18} }); }
function label(s,t,x,y,w){ s.addText(t,{x,y,w,h:0.24,fontSize:10,bold:true,color:MUT,
  charSpacing:1.4,fontFace:SANS,isTextBox:true,margin:0}); }
/* Placeholder the requester fills with a screenshot of the named mockup area. */
function shot(s,x,y,w,h,what){
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,rectRadius:0.05,
    fill:{color:"E6ECF6"},line:{color:"9FB2CE",width:1.25,dashType:"dash"}});
  s.addText("IMAGE PLACEHOLDER",{x:x, y:y+h/2-0.42, w, h:0.26, align:"center",
    fontSize:10.5, bold:true, color:"5C7396", fontFace:SANS, isTextBox:true, margin:0});
  s.addText(what,{x:x+0.2, y:y+h/2-0.12, w:w-0.4, h:0.60, align:"center",
    fontSize:11.5, color:INK, fontFace:SANS, isTextBox:true, margin:0});
}
function tbl(s,rows,x,y,w,colW,fontSize){
  s.addTable(rows,{ x,y,w,colW, fontFace:SANS, fontSize:fontSize||10.5,
    color:INK, border:{type:"solid",color:"DCE4EF",pt:0.75}, autoPage:false, valign:"top" });
}
const H = t => ({ text:t, options:{ bold:true, color:WHITE, fill:{color:NAVY}, fontSize:10.5 } });
const KEY = { GREEN:{f:GRNF,c:GRN,t:"Available"}, AMBER:{f:AMBF,c:AMB,t:"Define"}, RED:{f:REDF,c:RED,t:"No source"} };
function row(term, meaning, source, flag){
  const k = KEY[flag];
  return [ {text:term,options:{bold:true,fill:{color:k.f}}},
           {text:meaning,options:{fill:{color:k.f}}},
           {text:source,options:{fill:{color:k.f}}},
           {text:k.t,options:{bold:true,color:k.c,fill:{color:k.f},align:"center"}} ];
}
function legend(s,y){
  const items=[["Available","Sourced and buildable today",GRN,GRNF],
               ["Define","Term is ambiguous. What it means changes the figure",AMB,AMBF],
               ["No source","Nothing available produces this",RED,REDF]];
  let x=0.6;
  items.forEach(([t,d,c,f])=>{
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:0.95,h:0.26,rectRadius:0.05,fill:{color:f},line:{color:c,width:0.75}});
    s.addText(t,{x,y,w:0.95,h:0.26,align:"center",fontSize:9,bold:true,color:c,fontFace:SANS,isTextBox:true,margin:0});
    s.addText(d,{x:x+1.05,y,w:3.05,h:0.26,fontSize:9,color:MUT,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    x+=4.15;
  });
}

/* ===================================================== 1 TITLE ============ */
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:13.333,h:2.35,fill:{color:NAVY}});
  s.addText("EDRMS UTILIZATION REPORT",{x:0.9,y:0.95,w:11.5,h:0.34,fontSize:13,bold:true,
    color:ICE,charSpacing:2.4,fontFace:SANS,isTextBox:true,margin:0});
  s.addText("Reporting Suite",{x:0.9,y:1.28,w:11.5,h:0.72,fontSize:40,bold:true,color:WHITE,
    fontFace:SER,isTextBox:true,margin:0});
  s.addText("MVP Proposal and Next Steps",{x:0.9,y:2.85,w:11.5,h:0.62,fontSize:30,bold:true,
    color:TTL,fontFace:SER,isTextBox:true,margin:0});
  s.addText("Deliver two dashboards well in this release, rather than six partially.",
    {x:0.9,y:3.55,w:10.6,h:0.40,fontSize:15,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  card(s,0.9,4.35,7.2,0.72);
  s.addText("Decision needed: team consensus on the MVP scope",
    {x:1.2,y:4.35,w:6.7,h:0.72,fontSize:14,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
  s.addText("RAC   |   ITD   |   AvePoint",{x:0.9,y:5.42,w:7.0,h:0.30,fontSize:12,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
  s.addText("Reconfirmation Workshop (R2026.4)   ·   August 2026",
    {x:0.9,y:6.55,w:11.5,h:0.30,fontSize:11.5,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
  s.addNotes("Frame the session: this is a proposal for scope, not a sign-off on figures. The ask is consensus on two dashboards for this release.");
}

/* ===================================================== 2 AGENDA =========== */
{
  const s = slide("Agenda");
  const items=[
    ["1","The proposal","Two dashboards as the MVP for this release"],
    ["2","The data we have today","Four sources, what each gives us, how each is produced"],
    ["3","Feeding and maintaining the report","How the sources reach the report and who keeps them current"],
    ["4","Bank-wide Oversight","Section by section: the term, what it means, where it comes from"],
    ["5","Department Insights","Section by section: the term, what it means, where it comes from"],
    ["6","Two points to resolve","Where your assessment and ours do not yet agree"],
    ["7","Terminology to confirm","Words that change the figure depending on how you read them"],
    ["8","Next steps","What we need from each party, and by when"],
  ];
  let y=1.15;
  items.forEach(([n,t,d])=>{
    card(s,0.6,y,12.13,0.63);
    s.addShape(pres.shapes.OVAL,{x:0.85,y:y+0.15,w:0.33,h:0.33,fill:{color:NAVY}});
    s.addText(n,{x:0.85,y:y+0.15,w:0.33,h:0.33,align:"center",fontSize:11,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(t,{x:1.35,y,w:3.5,h:0.63,fontSize:13.5,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(d,{x:4.95,y,w:7.5,h:0.63,fontSize:11.5,color:INK,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    y+=0.72;
  });
}

/* ===================================================== 4 THE PROPOSAL ===== */
{
  const s = slide("Two dashboards as the MVP for this release","THE PROPOSAL");
  s.addText([{text:"Nothing is removed from scope. ",options:{}},
             {text:"The four labels on the right are your own, from checker 4. Two of them wait on an AvePoint feature release rather than on missing data, which puts them on a roadmap rather than in doubt.",options:{}}],
    {x:0.6,y:1.42,w:12.13,h:0.34,fontSize:12,color:INK,fontFace:SANS,isTextBox:true,margin:0});

  card(s,0.6,1.88,6.10,2.55);
  label(s,"IN THIS RELEASE",0.95,2.08,5.4);
  [["1","Bank-wide Oversight"],["2","Department Insights"]].forEach(([n,t],i)=>{
    const y=2.45+i*0.60;
    s.addShape(pres.shapes.OVAL,{x:0.95,y,w:0.36,h:0.36,fill:{color:NAVY}});
    s.addText(n,{x:0.95,y,w:0.36,h:0.36,align:"center",fontSize:11,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(t,{x:1.48,y,w:4.9,h:0.36,fontSize:15,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
  });
  s.addText(["Available from the sources we hold today","The two the team most needs to use now","Every figure has a confirmed source and a named owner"].map((t,i,a)=>
    ({text:t,options:{bullet:true,breakLine:i<a.length-1}})),
    {x:0.95,y:3.68,w:5.4,h:0.68,fontSize:11.5,color:INK,fontFace:SANS,isTextBox:true,margin:0,paraSpaceAfter:4});

  card(s,6.93,1.88,5.80,2.55);
  label(s,"PARKED, STILL IN SCOPE",7.28,2.08,5.1);
  /* Labels are the client's own, from the sheet titles in checker 4. */
  const parked=[["Project Insights","Out of scope"],
                ["Institutional File Plan","Needs more information"],
                ["Retention and Disposal","Needs the disposition feature release"],
                ["Records and Archives Holdings","Needs the Physical Records Management feature release"]];
  let py=2.45;
  parked.forEach(([t,d])=>{
    s.addText(t,{x:7.28,y:py,w:2.55,h:0.44,fontSize:12,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(d,{x:9.90,y:py,w:2.60,h:0.44,fontSize:10,color:MUT,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    py+=0.46;
  });

  card(s,0.6,4.62,12.13,2.20,"FFFFFF");
  s.addText("THE DECISION WE NEED TODAY",{x:0.95,y:4.80,w:11.4,h:0.26,fontSize:10.5,bold:true,color:MUT,charSpacing:1.4,fontFace:SANS,isTextBox:true,margin:0});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.95,y:5.12,w:5.55,h:1.50,rectRadius:0.05,fill:{color:"E8F0E9"},line:{color:GRN,width:1}});
  s.addText("Option A",{x:1.20,y:5.24,w:5.0,h:0.28,fontSize:12,bold:true,color:GRN,fontFace:SANS,isTextBox:true,margin:0});
  s.addText("Bank-wide Oversight and Department Insights as the MVP for this release, with the other four parked in scope for a future release.",
    {x:1.20,y:5.54,w:5.05,h:0.95,fontSize:11.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:6.83,y:5.12,w:5.55,h:1.50,rectRadius:0.05,fill:{color:"F3F5F9"},line:{color:"AAB6C8",width:1}});
  s.addText("Option B",{x:7.08,y:5.24,w:5.0,h:0.28,fontSize:12,bold:true,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  s.addText("All six dashboards in one release. This means four of them ship with most measures unsourced until the systems behind them exist.",
    {x:7.08,y:5.54,w:5.05,h:0.95,fontSize:11.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  s.addNotes("Ask for consensus explicitly. If the room prefers Option B, the consequence to state is that four dashboards would carry mostly empty columns.");
}

/* ===================================================== 5 THE FOUR SOURCES = */
{
  const s = slide("The four sources we have today","AVAILABLE DATA");
  s.addText("Everything on the two MVP dashboards is built from these. Nothing else is assumed.",
    {x:0.6,y:1.42,w:12.13,h:0.30,fontSize:12.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  const rows=[
    [H("Source"),H("What it gives us"),H("How it is produced"),H("How current")],
    [{text:"EDRMS Database\n(drm-npr)",options:{bold:true}},
     "Declared records, physical counterparts, retention labels, disposal due dates, who declared and when",
     "Written by EDRMS itself as records are declared. Read directly by query.",
     "Live. No manual step."],
    [{text:"AvePoint\nCloud Governance",options:{bold:true}},
     "The EDRMS compliant site list, department, site owner, site status, storage used, last active time",
     "Cloud Governance > Directory > Workspace report > Export report",
     "On demand today. Can be scheduled."],
    [{text:"Microsoft 365\nSharePoint reports",options:{bold:true}},
     "Site usage: file count, page views, visited pages, storage.\nActivity: per user last activity date",
     "M365 admin centre > Reports > Usage > SharePoint site usage, and SharePoint activity",
     {text:"Windows of 7, 30, 90 or 180 days. Nothing longer is offered.",options:{bold:true}}],
    [{text:"Site lookup file\n(from ITD)",options:{bold:true}},
     {text:"Site to department, division and library mapping, plus a production flag separating live sites from demo and UAT. It does NOT yet carry RM, which your review now requires.",options:{}},
     "Maintained by the BA team. Currently an Excel file on the project site.",
     {text:"Manual. This is the one that can go stale.",options:{bold:true,color:AMB}}],
  ];
  tbl(s,rows,0.6,1.85,12.13,[2.05,3.60,3.55,2.93],10);
  card(s,0.6,5.95,12.13,0.92,"FFFFFF");
  s.addText([{text:"Sample of each report:  ",options:{bold:true,color:NAVY}},
             {text:"[ LINK TO BE PASTED HERE ]",options:{bold:true,color:AMB}},
             {text:"   so you can see the columns each one returns and how it is generated.",options:{color:INK}}],
    {x:0.95,y:6.12,w:11.4,h:0.30,fontSize:12,fontFace:SANS,isTextBox:true,margin:0});
  s.addText("Covers 92 sites today, 38 of them production, and carries department and division but not RM. Extending it to the full estate and adding RM is the single request that most increases what we can report on.",
    {x:0.95,y:6.44,w:11.4,h:0.32,fontSize:11,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
  s.addNotes("The 7/30/90/180 day windows are a hard product limit on the Microsoft reports, not a design choice. It is why anything phrased as 'never' cannot be answered from activity alone.");
}

/* ============================================ 6 FEEDING AND MAINTAINING === */
{
  const s = slide("How the report is fed, and who keeps it current","THE PIPELINE");
  s.addText("Every figure is a join between these sources. The join key is the site.",
    {x:0.6,y:1.42,w:12.13,h:0.30,fontSize:12.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  const boxes=[["EDRMS Database","Records, counterparts,\nretention, disposal dates"],
               ["Cloud Governance","Site list, department,\nowner, status, storage"],
               ["Microsoft 365","Usage and activity,\n7 to 180 day windows"],
               ["ITD lookup file","Department, division,\nlibrary, production flag"]];
  let bx=0.6;
  boxes.forEach(([t,d])=>{
    card(s,bx,1.88,2.86,1.30);
    s.addText(t,{x:bx+0.2,y:2.02,w:2.46,h:0.30,fontSize:12,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0});
    s.addText(d,{x:bx+0.2,y:2.34,w:2.46,h:0.74,fontSize:10,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
    bx+=3.10;
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6,y:3.40,w:12.13,h:0.62,rectRadius:0.06,fill:{color:NAVY}});
  s.addText("Joined on the site, then grouped by department or division",
    {x:0.6,y:3.40,w:12.13,h:0.62,align:"center",fontSize:13,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6,y:4.20,w:12.13,h:0.55,rectRadius:0.06,fill:{color:ICE}});
  s.addText("Bank-wide Oversight   and   Department Insights",
    {x:0.6,y:4.20,w:12.13,h:0.55,align:"center",fontSize:13,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});

  const rows=[
    [H("Source"),H("Who keeps it current"),H("What that person has to do")],
    ["EDRMS Database","Nobody. EDRMS writes it.","Nothing. The figure appears because a record was declared."],
    ["Cloud Governance",{text:"Whoever provisions the site",options:{bold:true}},
      {text:"Set department, division and RM when a site is created. Left blank, that site drops out of every departmental figure without any error showing.",options:{color:AMB}}],
    ["Microsoft 365","Nobody. Microsoft generates it.","Nothing, but the window cannot be widened beyond 180 days."],
    ["ITD lookup file",{text:"BA team today",options:{bold:true}},
      {text:"Keep the mapping current as sites are created, renamed or retired, and add RM. Proposed to move into the EDRMS database with an admin page so RAC can maintain it.",options:{color:AMB}}],
  ];
  tbl(s,rows,0.6,4.98,12.13,[2.60,3.10,6.43],10);
  s.addNotes("This slide answers the question asked twice in the workshop: how does the data stay up to date, and who owns it once the project ends.");
}

/* ============================================ 7 BANK-WIDE, WHAT IT ANSWERS  */
{
  const s = slide("Bank-wide Oversight","MVP DASHBOARD 1");
  s.addText("How much is in EDRMS, and who is using it, for the whole bank on one page.",
    {x:0.6,y:1.42,w:12.13,h:0.30,fontSize:13,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  shot(s,0.6,1.85,7.35,4.47,"Mockup: Bank-wide Oversight, full page\n(cover page 2 of the mockup PDF)");
  const secs=[["Top panel","Ten tiles. Eight open a table below. Two navigate to another dashboard."],
              ["Overview of EDRMS sites","Every department, office and RM with its sites, documents, records and counterparts."],
              ["Comparison","Documents set against records declared, so you can see who is storing but not declaring."],
              ["Records declaration trend","A running total over time, with a date range you choose."]];
  let y=1.85;
  secs.forEach(([t,d],i)=>{
    card(s,8.20,y,4.53,1.02);
    s.addShape(pres.shapes.OVAL,{x:8.45,y:y+0.16,w:0.30,h:0.30,fill:{color:NAVY}});
    s.addText(String(i+1),{x:8.45,y:y+0.16,w:0.30,h:0.30,align:"center",fontSize:10,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(t,{x:8.90,y:y+0.13,w:3.60,h:0.30,fontSize:12,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(d,{x:8.90,y:y+0.44,w:3.60,h:0.52,fontSize:9.5,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
    y+=1.15;
  });
  s.addText("The figures shown are illustrative. React to the shape, the labels and the logic.",
    {x:0.6,y:6.55,w:12.13,h:0.30,fontSize:11,italic:true,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
}

/* ================================= 8 BANK-WIDE TERMS, PART 1 ============== */
{
  const s = slide("Bank-wide Oversight: the top panel","WHAT EACH ITEM MEANS AND WHERE IT COMES FROM");
  const rows=[
    [H("Your term"),H("What it counts"),H("Source"),H("Status")],
    row("Active EDRMS SharePoint sites","EDRMS sites, grouped by department, office or RM","Cloud Governance, with department and division backfilled","AMBER"),
    row("Total number of EDRMS users","People with recorded SharePoint activity in the window","SharePoint activity log","AMBER"),
    row("Total number of documents","File count per site, rolled up","SharePoint site usage, joined to the Cloud Governance site list","GREEN"),
    row("Total number of records declared","Declared records, counted once each","EDRMS database","GREEN"),
    row("Total physical counterparts","Declared records flagged as having a paper counterpart","EDRMS database","GREEN"),
    row("Records due for disposal","Records reaching their disposal due date in a window","EDRMS database","AMBER"),
    row("Sovereign and nonsovereign project sites","Sites belonging to a project","No source. Out of scope for this release.","RED"),
  ];
  tbl(s,rows,0.6,1.72,12.13,[2.55,3.35,4.28,1.95],10);
  card(s,0.6,5.05,12.13,1.30,"FFFFFF");
  s.addText("Raised by your own review",{x:0.95,y:5.22,w:11.4,h:0.26,fontSize:10.5,bold:true,color:MUT,charSpacing:1.4,fontFace:SANS,isTextBox:true,margin:0});
  s.addText([
    {text:"“All records have a due date for disposal. What does due for disposal mean? Due in the next 30, 60 or 90 days?”",options:{italic:true,breakLine:true}},
    {text:"“Is this user with access to EDRMS sites?”     “What is a declaration rate?”     “Is this zero records in an EDRMS site? Department? Division? RMs?”",options:{italic:true,breakLine:true}},
    {text:"Each one changes the figure entirely. We need one answer each before these tiles can be built.",options:{bold:true}}
  ],{x:0.95,y:5.50,w:11.4,h:0.78,fontSize:10.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  legend(s,6.66);
}

/* ================================= 9 BANK-WIDE TERMS, PART 2 ============== */
{
  const s = slide("Bank-wide Oversight: tables, indicators and trend","WHAT EACH ITEM MEANS AND WHERE IT COMES FROM");
  const rows=[
    [H("Your term"),H("What it counts"),H("Source"),H("Status")],
    row("Department / office / RM","The owning unit of each site","Cloud Governance. Department is set at provisioning; division needs backfilling","AMBER"),
    row("Sites created, deleted, archived","Site lifecycle counts","Cloud Governance site status","AMBER"),
    row("Inactive site for 90 days","Sites with no activity in the window","SharePoint site usage, last activity date","GREEN"),
    row("Never accessed EDRMS","People with access to a site who have never opened it","Site permissions checked against the activity log","GREEN"),
    row("Staff, contractors, consultants","Users split by employment type","No source. Needs a user register with employment type.","RED"),
    row("Completion of training","Users who completed EDRMS training","Held by the learning team. Owner identified, file not yet supplied.","RED"),
    row("New documents month on month","Documents added in each month","Needs a document level scan that does not exist yet","RED"),
    row("Records declaration trend","Declared records as a running total over time","EDRMS database","GREEN"),
  ];
  tbl(s,rows,0.6,1.72,12.13,[2.55,3.35,4.28,1.95],10);
  card(s,0.6,5.45,12.13,0.95,"FFFFFF");
  s.addText([
    {text:"Never accessed is now settled.  ",options:{bold:true,color:GRN}},
    {text:"Your comment on Department Insights reads “users with site access but never accessed the site, feasible, SPO Activity”. That matches what was agreed in the technical session, so this moves from a question to a buildable measure.",options:{color:INK}}
  ],{x:0.95,y:5.62,w:11.4,h:0.62,fontSize:11.5,fontFace:SANS,isTextBox:true,margin:0});
  legend(s,6.66);
}

/* ============================ 10 DEPARTMENT, WHAT IT ANSWERS ============== */
{
  const s = slide("Department Insights","MVP DASHBOARD 2");
  s.addText("One unit's own view. Pick a department, office or RM and everything below refreshes for it.",
    {x:0.6,y:1.42,w:12.13,h:0.30,fontSize:13,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  shot(s,0.6,1.85,7.35,4.47,"Mockup: Department Insights, full page\n(cover page 3 of the mockup PDF)");
  const secs=[["Department profile","Seven tiles for the selected unit, each opening its own table."],
              ["Overview of EDRMS sites","Every site the unit owns, with its owner, documents, records and counterparts."],
              ["Site visits","Page views and visited pages per site, over a window you choose."],
              ["Library usage","Libraries inside the unit's sites, grouped by file plan category."]];
  let y=1.85;
  secs.forEach(([t,d],i)=>{
    card(s,8.20,y,4.53,1.02);
    s.addShape(pres.shapes.OVAL,{x:8.45,y:y+0.16,w:0.30,h:0.30,fill:{color:NAVY}});
    s.addText(String(i+1),{x:8.45,y:y+0.16,w:0.30,h:0.30,align:"center",fontSize:10,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(t,{x:8.90,y:y+0.13,w:3.60,h:0.30,fontSize:12,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(d,{x:8.90,y:y+0.44,w:3.60,h:0.52,fontSize:9.5,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
    y+=1.15;
  });
  s.addText([{text:"Your first comment on this dashboard applies to all of it:  ",options:{bold:true,color:AMB}},
             {text:"“For all: as long as department, division and RM is backfilled.” Every figure on this screen depends on that one piece of work.",options:{italic:true,color:INK}}],
    {x:0.6,y:6.52,w:12.13,h:0.34,fontSize:11.5,fontFace:SANS,isTextBox:true,margin:0});
}

/* ============================ 11 DEPARTMENT TERMS, PART 1 ================= */
{
  const s = slide("Department Insights: the profile tiles","WHAT EACH ITEM MEANS AND WHERE IT COMES FROM");
  const rows=[
    [H("Your term"),H("What it counts"),H("Source"),H("Status")],
    row("EDRMS compliant sites created","Sites provisioned to this unit","Cloud Governance","AMBER"),
    row("Total number of EDRMS users","People with recorded activity for this unit","SharePoint activity log","AMBER"),
    row("Total number of site visitors","Page views and visited pages, not distinct people","SharePoint site usage","AMBER"),
    row("Total number of documents","File count across the unit's sites","SharePoint site usage","GREEN"),
    row("Total number of records declared","Declared records for the unit's sites","EDRMS database","GREEN"),
    row("Total physical counterparts","Declared records flagged as having a paper counterpart","EDRMS database","GREEN"),
    row("Records due for disposal","Records reaching their due date in a window","EDRMS database","AMBER"),
    row("Go-Live date","When the unit went live on EDRMS","No source. Nothing records it.","RED"),
  ];
  tbl(s,rows,0.6,1.72,12.13,[2.55,3.35,4.28,1.95],10);
  card(s,0.6,5.45,12.13,0.95,"FFFFFF");
  s.addText([
    {text:"Thank you for the review.  ",options:{bold:true,color:GRN}},
    {text:"All 79 rows on this dashboard now carry your assessment, and the table above follows it. Most of it agrees with ours. A small number of source attributions differ, and two points need resolving together: they are on the next slide.",options:{color:INK}}
  ],{x:0.95,y:5.62,w:11.4,h:0.62,fontSize:11.5,fontFace:SANS,isTextBox:true,margin:0});
  legend(s,6.66);
}

/* ============================ 12 DEPARTMENT TERMS, PART 2 ================= */
{
  const s = slide("Department Insights: sites, visits and libraries","WHAT EACH ITEM MEANS AND WHERE IT COMES FROM");
  const rows=[
    [H("Your term"),H("What it counts"),H("Source"),H("Status")],
    row("Name of sites, site owners","Each site the unit owns and who owns it","Cloud Governance","GREEN"),
    row("Number of documents per site","File count for that site","SharePoint site usage","GREEN"),
    row("Number of records, counterparts","Declared records and paper counterparts per site","EDRMS database","GREEN"),
    row("Page views, visited pages","Visit activity per site in the window","SharePoint site usage, 7 to 180 days","GREEN"),
    row("Visitors internal and external","Visits split by where the person comes from","No available report splits this","RED"),
    row("Access requests granted, denied","Requests to join a site and their outcome","Not yet defined. Your comment reads “need more details on what is meant by this”","AMBER"),
    row("Library names","Libraries inside each site","ITD lookup file","GREEN"),
    row("Number of documents per library","Documents inside each library","You have marked this feasible. We read nothing as reporting below site level. See the next slide.","AMBER"),
    row("Number of users per library","People using each library","No source will ever produce this. Activity is never reported per library.","RED"),
  ];
  tbl(s,rows,0.6,1.72,12.13,[2.55,3.35,4.28,1.95],9.5);
  card(s,0.6,5.72,12.13,0.72,"FFFFFF");
  s.addText([
    {text:"Worth a decision now:  ",options:{bold:true,color:NAVY}},
    {text:"users per library cannot be produced by any source, now or later, because activity is never reported below site level. We suggest dropping it rather than leaving it open.",options:{color:INK}}
  ],{x:0.95,y:5.86,w:11.4,h:0.44,fontSize:11.5,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
  legend(s,6.66);
}

/* ============================ RESOLVE: WHERE WE DISAGREE ================== */
{
  const s = slide("Two points to resolve together","WHERE OUR READINGS DIFFER");
  s.addText("Your review and ours agree almost everywhere. These two do not, and both are worth settling before anything is built.",
    {x:0.6,y:1.42,w:12.13,h:0.30,fontSize:12.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});

  card(s,0.6,1.90,12.13,2.05);
  s.addShape(pres.shapes.OVAL,{x:0.95,y:2.18,w:0.40,h:0.40,fill:{color:NAVY}});
  s.addText("1",{x:0.95,y:2.18,w:0.40,h:0.40,align:"center",fontSize:11,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
  s.addText("Number of documents per library",{x:1.60,y:2.12,w:10.6,h:0.34,fontSize:14,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0});
  s.addText([
    {text:"You have marked this feasible. ",options:{bold:true,breakLine:true}},
    {text:"Our reading is that nothing available reports below site level. The lookup file gives us library names for each site, which is why library names are buildable, but it carries no count of what is inside them. Cloud Governance and the Microsoft reports both stop at the site.",options:{breakLine:true}},
    {text:"If you know of a source that counts documents per library, that changes the answer and we would like to see it. If not, this needs a document level scan, which is an ITD change rather than a report change.",options:{bold:true}}
  ],{x:1.60,y:2.50,w:10.6,h:1.30,fontSize:11.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});

  card(s,0.6,4.12,12.13,2.05);
  s.addShape(pres.shapes.OVAL,{x:0.95,y:4.40,w:0.40,h:0.40,fill:{color:NAVY}});
  s.addText("2",{x:0.95,y:4.40,w:0.40,h:0.40,align:"center",fontSize:11,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
  s.addText("Retention and Disposal is marked out of scope in full",{x:1.60,y:4.34,w:10.6,h:0.34,fontSize:14,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0});
  s.addText([
    {text:"Your sheet title reads out of scope, needs the disposition feature release. That is right for the disposal half. ",options:{bold:true,breakLine:true}},
    {text:"The retention half does not depend on it. Permanent and temporary retention by site, by library and by record, and the split of declared records by retention label, all come from the EDRMS database and can be built today.",options:{breakLine:true}},
    {text:"Parking the whole dashboard gives up a working half. Would you rather we bring the retention side into the MVP and leave only disposal for the feature release?",options:{bold:true}}
  ],{x:1.60,y:4.72,w:10.6,h:1.30,fontSize:11.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});

  s.addText("A handful of source attributions also differ, for example sites created, which you read from the EDRMS database and we read from Cloud Governance. Those are small and we will reconcile them row by row.",
    {x:0.6,y:6.35,w:12.13,h:0.44,fontSize:10.5,italic:true,color:MUT,fontFace:SANS,isTextBox:true,margin:0});
  s.addNotes("Do not argue either point in the room. Put both as questions and let them answer.");
}

/* ============================ 13 TERMINOLOGY ============================== */
{
  const s = slide("Terminology to confirm","WORDS THAT CHANGE THE FIGURE");
  s.addText("Each of these reads more than one way. Which one you mean decides what the report counts.",
    {x:0.6,y:1.42,w:12.13,h:0.30,fontSize:12.5,color:INK,fontFace:SANS,isTextBox:true,margin:0});
  const rows=[
    [H("Term"),H("It could mean"),H("Our proposal")],
    [{text:"EDRMS user",options:{bold:true,fill:{color:AMBF}}},
     {text:"Anyone with access to an EDRMS site  ·  anyone who used it  ·  anyone who declared a record",options:{fill:{color:AMBF}}},
     {text:"Someone who declared a record. It is the only one countable today.",options:{fill:{color:AMBF}}}],
    [{text:"Due for disposal",options:{bold:true,fill:{color:AMBF}}},
     {text:"Every record has a due date, so all of them are due eventually. In 30, 60, 90 days, or overdue?",options:{fill:{color:AMBF}}},
     {text:"Show it in windows: due within 30 days, 90 days and 12 months.",options:{fill:{color:AMBF}}}],
    [{text:"Never accessed",options:{bold:true,fill:{color:AMBF}}},
     {text:"Never at all  ·  not in the last 180 days, which is as far back as the report reaches",options:{fill:{color:AMBF}}},
     {text:"People with access to the site who have never opened it, from site permissions.",options:{fill:{color:AMBF}}}],
    [{text:"Department",options:{bold:true,fill:{color:AMBF}}},
     {text:"The HQ office only  ·  the whole department including its RMs, offices and divisions",options:{fill:{color:AMBF}}},
     {text:"Two levels: department, then division. Countries, RMs and offices are divisions.",options:{fill:{color:AMBF}}}],
    [{text:"Sites created, deleted, archived",options:{bold:true,fill:{color:AMBF}}},
     {text:"All SharePoint sites  ·  EDRMS compliant sites only",options:{fill:{color:AMBF}}},
     {text:"EDRMS sites only. Confirmed in the workshop that the other sites stay out.",options:{fill:{color:AMBF}}}],
    [{text:"Visitors",options:{bold:true,fill:{color:AMBF}}},
     {text:"Distinct people who came  ·  the number of visits, which is what the report counts",options:{fill:{color:AMBF}}},
     {text:"Site visits, and label it that way.",options:{fill:{color:AMBF}}}],
    [{text:"Users creating documents",options:{bold:true,fill:{color:AMBF}}},
     {text:"People who created a document  ·  people who uploaded one  ·  both",options:{fill:{color:AMBF}}},
     {text:"Needs your answer before it can be built either way.",options:{fill:{color:AMBF}}}],
    [{text:"Unit",options:{bold:true,fill:{color:AMBF}}},
     {text:"Your own review asks what unit means in “clickable into that unit's dashboard”",options:{fill:{color:AMBF}}},
     {text:"We read it as the department, office or RM on that row.",options:{fill:{color:AMBF}}}],
    [{text:"Declaration rate",options:{bold:true,fill:{color:AMBF}}},
     {text:"Your review asks what a declaration rate is. Records against documents, or something else?",options:{fill:{color:AMBF}}},
     {text:"Declared records divided by documents held, for the same unit.",options:{fill:{color:AMBF}}}],
    [{text:"Active user",options:{bold:true,fill:{color:AMBF}}},
     {text:"Your review asks us to define it before the two comparison ratios can be built",options:{fill:{color:AMBF}}},
     {text:"Someone with recorded activity in the window chosen. It is not the same as an EDRMS user.",options:{fill:{color:AMBF}}}],
    [{text:"Division, on a user figure",options:{bold:true,fill:{color:AMBF}}},
     {text:"Your review asks whether a user has a division of their own, or takes the division of the site they worked in",options:{fill:{color:AMBF}}},
     {text:"The site's division. A person can work across several units, a site belongs to one.",options:{fill:{color:AMBF}}}],
    [{text:"SPO with MM",options:{bold:true,fill:{color:AMBF}}},
     {text:"Your own abbreviation, used as the source on three rows. We do not know what MM stands for.",options:{fill:{color:AMBF}}},
     {text:"Please confirm, so we record the right source against those rows.",options:{fill:{color:AMBF}}}],
  ];
  tbl(s,rows,0.6,1.78,12.13,[2.45,5.55,4.13],9);
  s.addNotes("Work this list in the room. Every one of these was raised either in RAC's own comments on the checker or in the technical session.");
}

/* ============================ 14 NEXT STEPS ============================== */
{
  const s = slide("From sources to a confirmed requirement set","NEXT STEPS");
  const steps=[
    ["1","RAC reviews the two MVP dashboards","The review pack lists every item with its source and what it costs to maintain. Comments go in the two response columns."],
    ["2","RAC settles the terminology","The eight terms on the previous slide. Each one decides what a figure counts."],
    ["3","ITD confirms the lookup file","Extend it to the full estate, add the site identifier, and agree where it lives and who maintains it."],
    ["4","We match requirements to sources","Every item is marked available, needs a definition, or has no source."],
    ["5","The team decides on what remains","Where no source can be provided, we agree together whether the item is dropped or deferred."],
  ];
  let y=1.62;
  steps.forEach(([n,t,d])=>{
    card(s,0.6,y,12.13,0.94);
    s.addShape(pres.shapes.OVAL,{x:0.92,y:y+0.28,w:0.38,h:0.38,fill:{color:NAVY}});
    s.addText(n,{x:0.92,y:y+0.28,w:0.38,h:0.38,align:"center",fontSize:11,bold:true,color:WHITE,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(t,{x:1.52,y,w:4.35,h:0.94,fontSize:13,bold:true,color:NAVY,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    s.addText(d,{x:6.00,y,w:6.45,h:0.94,fontSize:11,color:INK,fontFace:SANS,isTextBox:true,margin:0,valign:"middle"});
    y+=1.02;
  });
}

/* ============================ CLOSING ==================================== */
{
  const s = pres.addSlide(); s.background={color:NAVY};
  s.addText("Thank You",{x:0.9,y:3.05,w:11.5,h:0.90,fontSize:44,bold:true,color:WHITE,fontFace:SER,isTextBox:true,margin:0});
  s.addText("RAC   |   ITD   |   AvePoint",{x:0.9,y:4.05,w:11.5,h:0.36,fontSize:15,color:ICE,fontFace:SANS,isTextBox:true,margin:0});
}

pres.writeFile({ fileName: "/home/user/Jim/EDRMS_Util_Report_v2.pptx" })
  .then(f => console.log("written:", f));
