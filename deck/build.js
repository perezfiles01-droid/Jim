const pptxgen=require('pptxgenjs');
const fs=require('fs'),path=require('path');
const {execSync}=require('child_process');
const CONTENT=require('./content.js');
const GAP=require('./gap.json');
const D=__dirname, SHOTS=path.join(D,'shots');

/* ADB palette, taken from the prototype's own tokens so the deck and the
   screenshots inside it read as one thing. */
const C={navy:'0E1F35',ink:'10243E',ink2:'33475F',blue:'0072BC',blued:'005A96',
  teal:'00A5A8',green:'5CA943',amber:'C77B18',red:'B3241C',
  bg:'FFFFFF',soft:'F4F7FA',line:'DCE4EC',mut:'6B7A8C',white:'FFFFFF',
  greenbg:'EAF4E4',amberbg:'FDF1DE',redbg:'FBE6E4',
  later:'3D6E8C',laterbg:'E6EEF4'};
const SER='Cambria', SAN='Calibri';
const W=13.333,H=7.5;

const MANIFEST=[];
const p=new pptxgen();
const _add=p.addSlide.bind(p);
p.addSlide=function(){const s=_add();MANIFEST.push({n:MANIFEST.length+1});return s;};
function mark(kind,extra){Object.assign(MANIFEST[MANIFEST.length-1],{kind},extra||{});}
p.layout='LAYOUT_WIDE';
p.author='ADB EDRMS Utilization Report';
p.title='EDRMS Utilization Report — Workshop';

const img=f=>path.join(SHOTS,f);
const dim=f=>{const b=fs.readFileSync(img(f));return{w:b.readUInt32BE(16),h:b.readUInt32BE(20)};};
/* Fit inside a frame without ever changing the aspect ratio: the screenshots
   are the point of the deck and a stretched one is a broken one. */
function fit(f,fx,fy,fw,fh){
  const d=dim(f), r=d.w/d.h;
  let w=fw,h=w/r;
  if(h>fh){h=fh;w=h*r;}
  return{path:img(f),x:fx+(fw-w)/2,y:fy+(fh-h)/2,w,h};
}
const shadow=()=>({type:'outer',blur:14,offset:2,angle:90,color:'8FA3B8',opacity:0.35});
const rows=(sheet,a,b)=>GAP[sheet].filter(r=>r.n>=a&&r.n<=b);
/* An item waiting on a release is not an item waiting on the client. Every
   count in the deck goes through here so the two never get added together. */
const LATER=CONTENT.later||{};
const isLater=(sheet,n)=>!!(LATER[sheet]&&LATER[sheet].ns.includes(n));
function tally(sheet){
  const rs=GAP[sheet].filter(r=>r.d);
  let yes=0,no=0,later=0;
  rs.forEach(r=>{ if(isLater(sheet,r.n))later++; else if(r.d==='Yes')yes++; else no++; });
  return {yes,no,later,tot:rs.length};
}
const TOT=CONTENT.order.reduce((a,d)=>{const t=tally(d.sheet);
  a.yes+=t.yes;a.no+=t.no;a.later+=t.later;a.tot+=t.tot;return a;},{yes:0,no:0,later:0,tot:0});

/* ---------- shared furniture ---------- */
function head(s,eyebrow,title){
  s.addText(eyebrow.toUpperCase(),{x:0.55,y:0.3,w:9,h:0.26,fontFace:SAN,fontSize:10.5,
    bold:true,charSpacing:1.4,color:C.blue,margin:0});
  s.addText(title,{x:0.55,y:0.56,w:11,h:0.5,fontFace:SER,fontSize:25,bold:true,
    color:C.ink,margin:0});
}
function statusChip(s,x,y,d,amber,later){
  const fill=later?C.laterbg:(d==='No'?C.redbg:(amber?C.amberbg:C.greenbg));
  const col =later?C.later  :(d==='No'?C.red  :(amber?C.amber :C.green));
  const lab =later?'LATER RELEASE':(d==='No'?'NEEDS YOU':(amber?'PLACEHOLDER':'BUILT'));
  s.addShape(p.ShapeType.roundRect,{x,y:y+0.03,w:0.8,h:0.185,fill:{color:fill},
    line:{color:fill},rectRadius:0.09});
  s.addText(lab,{x,y:y+0.03,w:0.8,h:0.185,fontFace:SAN,fontSize:6.3,bold:true,
    color:col,align:'center',valign:'middle',margin:0,charSpacing:0.3});
}
function notes(s,txt){s.addNotes(txt);}

/* ---------- 1. title ---------- */
{
  const s=p.addSlide(); mark('title'); s.background={color:C.navy};
  s.addShape(p.ShapeType.rect,{x:0,y:0,w:W,h:0.055,fill:{color:C.green},line:{color:C.green}});
  s.addText('EDRMS Utilization Report',{x:0.9,y:2.15,w:11.5,h:0.9,fontFace:SER,fontSize:46,
    bold:true,color:C.white,margin:0});
  s.addText('Walking through the working prototype, screen by screen — and what we still need from you',
    {x:0.9,y:3.12,w:10.4,h:0.95,fontFace:SAN,fontSize:17,color:'AFC4D8',margin:0,lineSpacing:24});
  const facts=[['6','key views'],[String(TOT.tot),'things you asked for'],
               [String(TOT.yes),'built so far'],
               [String(TOT.later),'waiting on a later release']];
  facts.forEach((f,i)=>{
    const x=0.9+i*2.85;
    s.addText(f[0],{x,y:4.5,w:2.5,h:0.68,fontFace:SER,fontSize:40,bold:true,color:C.teal,margin:0});
    s.addText(f[1],{x,y:5.2,w:2.5,h:0.3,fontFace:SAN,fontSize:12,color:'AFC4D8',margin:0});
  });
  s.addText('Client workshop  ·  22 August 2026  ·  Prototype, not final',
    {x:0.9,y:6.5,w:11.5,h:0.3,fontFace:SAN,fontSize:12,color:'7E97B0',margin:0});
  notes(s,'Open by saying what this session is for: we built a working prototype from your slides, we want to walk it with you, and we have 27 questions where we are stuck without you.\n\nSet expectations: nothing here is final. This is exactly the point where changing things is cheap.');
}

/* ---------- 2. how to read this deck ---------- */
{
  const s=p.addSlide(); s.background={color:C.bg};
  mark('legend'); head(s,'Before we start','How to read every slide from here on');
  const fx=0.55,fy=1.42,fw=6.5,fh=4.1;
  s.addShape(p.ShapeType.roundRect,{x:fx,y:fy,w:fw,h:fh,fill:{color:C.soft},
    line:{color:C.line},rectRadius:0.08});
  s.addText('LEFT SIDE',{x:fx+0.4,y:fy+0.3,w:3,h:0.25,fontFace:SAN,fontSize:10,bold:true,
    charSpacing:1.2,color:C.blue,margin:0});
  s.addText('The actual screen',{x:fx+0.4,y:fy+0.58,w:5.7,h:0.4,fontFace:SER,fontSize:19,
    bold:true,color:C.ink,margin:0});
  s.addText('A real screenshot of the working prototype. Everything you see is clickable in the live version — we can open it at any point if you want to poke at something.',
    {x:fx+0.4,y:fy+1.05,w:5.7,h:1.0,fontFace:SAN,fontSize:12.5,color:C.ink2,margin:0,lineSpacing:17});
  s.addText('RIGHT SIDE',{x:fx+0.4,y:fy+2.15,w:3,h:0.25,fontFace:SAN,fontSize:10,bold:true,
    charSpacing:1.2,color:C.blue,margin:0});
  s.addText('Your checklist for that screen',{x:fx+0.4,y:fy+2.43,w:5.7,h:0.4,fontFace:SER,
    fontSize:19,bold:true,color:C.ink,margin:0});
  s.addText('Every item you asked for on that screen, and whether it is there. Nothing has been left off the list.',
    {x:fx+0.4,y:fy+2.9,w:5.7,h:0.5,fontFace:SAN,fontSize:12.5,color:C.ink2,margin:0,lineSpacing:17});

  const legend=[
    ['BUILT',C.green,C.greenbg,'On the screen and running on real data. Nothing needed from you.'],
    ['PLACEHOLDER',C.amber,C.amberbg,'The screen is built and correct, but the numbers on it are made up, because we have no source yet. It will look real. It is not.'],
    ['NEEDS YOU',C.red,C.redbg,'Not built. We are stuck until you answer a question. These are what today is really for.'],
    ['LATER RELEASE',C.later,C.laterbg,'Not built, and not something you can answer today. The feature it depends on has not shipped yet. We come back to these at the end.'],
  ];
  let y=1.42;
  legend.forEach(([lab,col,bgc,txt])=>{
    s.addShape(p.ShapeType.roundRect,{x:7.35,y,w:5.4,h:1.07,fill:{color:C.bg},
      line:{color:C.line},rectRadius:0.06,shadow:shadow()});
    s.addShape(p.ShapeType.roundRect,{x:7.6,y:y+0.2,w:1.45,h:0.26,fill:{color:bgc},
      line:{color:bgc},rectRadius:0.12});
    s.addText(lab,{x:7.6,y:y+0.2,w:1.45,h:0.26,fontFace:SAN,fontSize:7.6,bold:true,
      color:col,align:'center',valign:'middle',margin:0});
    s.addText(txt,{x:9.2,y:y+0.12,w:3.35,h:0.84,fontFace:SAN,fontSize:9.8,color:C.ink2,
      margin:0,valign:'middle',lineSpacing:13});
    y+=1.19;
  });
  s.addText('Please stop me the moment something does not look right. That is far more useful to us today than politeness at the end.',
    {x:0.55,y:6.3,w:12.2,h:0.4,fontFace:SER,fontSize:15,italic:true,color:C.blued,margin:0});
  notes(s,'Spend a full minute on the amber category. It is the one that causes trouble later — a screen that looks finished but is running on invented numbers. Say plainly: if you see a number today, assume it is illustrative unless the checklist says BUILT.');
}

/* ---------- 3. the six views ---------- */
{
  const s=p.addSlide(); s.background={color:C.bg};
  mark('sixviews'); head(s,'The shape of the report','Six views, each answering one question');
  const cards=CONTENT.order.map((d,i)=>({n:i+1,name:d.name,q:d.q,sheet:d.sheet}));
  cards.forEach((c,i)=>{
    const col=i%3, row=Math.floor(i/3);
    const x=0.55+col*4.15, y=1.5+row*2.5;
    const t=tally(c.sheet), yes=t.yes, tot=t.tot;
    s.addShape(p.ShapeType.roundRect,{x,y,w:3.85,h:2.2,fill:{color:C.bg},
      line:{color:C.line},rectRadius:0.07,shadow:shadow()});
    s.addShape(p.ShapeType.ellipse,{x:x+0.28,y:y+0.28,w:0.46,h:0.46,
      fill:{color:C.navy},line:{color:C.navy}});
    s.addText(String(c.n),{x:x+0.28,y:y+0.28,w:0.46,h:0.46,fontFace:SER,fontSize:15,
      bold:true,color:C.white,align:'center',valign:'middle',margin:0});
    s.addText(c.name,{x:x+0.86,y:y+0.26,w:2.75,h:0.5,fontFace:SER,fontSize:14.5,bold:true,
      color:C.ink,margin:0,valign:'middle'});
    s.addText(c.q,{x:x+0.28,y:y+0.88,w:3.3,h:0.72,fontFace:SAN,fontSize:11,color:C.ink2,
      margin:0,lineSpacing:14.5});
    s.addText(`${yes} of ${tot} built`+(t.later?`  ·  ${t.later} later release`:''),
      {x:x+0.28,y:y+1.68,w:3.3,h:0.28,fontFace:SAN,fontSize:10,bold:true,color:C.blue,margin:0});
    s.addShape(p.ShapeType.rect,{x:x+0.28,y:y+1.98,w:3.3,h:0.075,fill:{color:'E4EBF2'},line:{color:'E4EBF2'}});
    s.addShape(p.ShapeType.rect,{x:x+0.28,y:y+1.98,w:3.3*(yes/tot),h:0.075,fill:{color:C.green},line:{color:C.green}});
    if(t.later)s.addShape(p.ShapeType.rect,{x:x+0.28+3.3*(yes/tot),y:y+1.98,w:3.3*(t.later/tot),
      h:0.075,fill:{color:C.later},line:{color:C.later}});
  });
  notes(s,'Give one sentence per view, no more. The point of this slide is that they can see the whole shape before you dive in, and can tell you now if a view is missing or misnamed.');
}

/* ---------- 4. scoreboard ---------- */
{
  const s=p.addSlide(); s.background={color:C.bg};
  mark('scoreboard'); head(s,'Where we are',`${TOT.yes} of the ${TOT.tot} things you asked for are built`);
  const labels=[],built=[],needs=[],later=[];
  CONTENT.order.forEach(d=>{
    const t=tally(d.sheet);
    labels.push(d.name.replace(' and ',' & '));
    built.push(t.yes); needs.push(t.no); later.push(t.later);
  });
  s.addChart(p.ChartType.bar,[
    {name:'Built',labels,values:built},
    {name:'Needs you',labels,values:needs},
    {name:'Later release',labels,values:later}],
    {x:0.55,y:1.5,w:8.1,h:5.1,barDir:'bar',barGrouping:'stacked',
     chartColors:[C.green,C.red,C.later],showValue:true,dataLabelPosition:'ctr',
     dataLabelColor:C.white,dataLabelFontFace:SAN,dataLabelFontSize:10,dataLabelFontBold:true,
     showLegend:true,legendPos:'t',legendFontFace:SAN,legendFontSize:11,
     catAxisLabelColor:C.ink2,catAxisLabelFontFace:SAN,catAxisLabelFontSize:11,
     valAxisLabelColor:C.mut,valAxisLabelFontFace:SAN,valAxisLabelFontSize:10,
     valGridLine:{color:'EDF1F5',size:1},catGridLine:{style:'none'},
     valAxisMaxVal:90,barGapWidthPct:55});
  const box=(x,y,big,lab,sub,col)=>{
    s.addShape(p.ShapeType.roundRect,{x,y,w:3.9,h:1.5,fill:{color:C.soft},
      line:{color:C.line},rectRadius:0.07});
    s.addText(big,{x:x+0.3,y:y+0.2,w:3.3,h:0.62,fontFace:SER,fontSize:34,bold:true,color:col,margin:0});
    s.addText(lab,{x:x+0.3,y:y+0.82,w:3.3,h:0.26,fontFace:SAN,fontSize:11.5,bold:true,color:C.ink,margin:0});
    s.addText(sub,{x:x+0.3,y:y+1.06,w:3.4,h:0.34,fontFace:SAN,fontSize:9.5,color:C.mut,margin:0,lineSpacing:12});
  };
  box(8.85,1.9,Math.round(100*TOT.yes/TOT.tot)+'%','Built','Working in the prototype today',C.green);
  box(8.85,3.55,String(TOT.no),'Waiting on you','Questions only you can answer',C.red);
  box(8.85,5.2,String(TOT.later),'Waiting on a release','Disposal and Physical Records. Not a data problem.',C.later);
  notes(s,'Do not let them read the chart as a report card on the team. Frame it the other way round: the 61 red items are almost all one of three missing sources, and they are the only people who can point us at them.');
}

/* ---------- 5. how this gets delivered ---------- */
{
  const s=p.addSlide(); s.background={color:C.bg};
  mark('timeline'); head(s,'Sequencing','Two of the six views are waiting on a release, not on data');
  s.addText('Four dashboards can be finished on the Utilization work alone. The other two depend on things that do not exist in the system yet — so the honest plan is to sequence them, not to force them.',
    {x:0.55,y:1.18,w:12.2,h:0.42,fontFace:SAN,fontSize:12.5,color:C.ink2,margin:0,lineSpacing:16});

  const phases=[
    {tag:'NOW',rel:'Utilization',col:C.green,
     views:['Bank-wide Oversight','Department Insights','Project Insights','Institutional File Plan','Retention & Disposal — the retention half'],
     note:'Deliverable on this programme, once the open questions are answered.'},
    {tag:'NEXT',rel:'Disposal release',col:C.later,
     views:['Retention & Disposal — the disposal half','Disposal approver and outcome, bank-wide','Disposal approver and outcome, per department'],
     note:'14 items. Disposal is not built in EDRMS yet: no approval screen, no field to record an outcome.'},
    {tag:'AFTER THAT',rel:'Physical Records release',col:C.blued,
     views:['Records & Archive Holdings, in full','Storage, retrieval and capacity','Boxes and folders held by RAC'],
     note:'26 items. This dashboard is about paper, and the physical work comes after Utilization.'},
  ];
  phases.forEach((ph,i)=>{
    const x=0.55+i*4.14;
    s.addShape(p.ShapeType.roundRect,{x,y:1.78,w:3.9,h:4.28,fill:{color:C.bg},
      line:{color:C.line},rectRadius:0.07,shadow:shadow()});
    s.addShape(p.ShapeType.roundRect,{x:x+0.3,y:2.05,w:1.5,h:0.28,fill:{color:ph.col},
      line:{color:ph.col},rectRadius:0.13});
    s.addText(ph.tag,{x:x+0.3,y:2.05,w:1.5,h:0.28,fontFace:SAN,fontSize:8.5,bold:true,
      color:C.white,align:'center',valign:'middle',margin:0,charSpacing:0.7});
    s.addText(ph.rel,{x:x+0.3,y:2.46,w:3.3,h:0.6,fontFace:SER,fontSize:19,bold:true,
      color:C.ink,margin:0,lineSpacing:22});
    ph.views.forEach((v,j)=>{
      const vy=3.14+j*0.44;
      s.addShape(p.ShapeType.ellipse,{x:x+0.33,y:vy+0.08,w:0.1,h:0.1,
        fill:{color:ph.col},line:{color:ph.col}});
      s.addText(v,{x:x+0.55,y:vy,w:3.1,h:0.42,fontFace:SAN,fontSize:10,color:C.ink2,
        margin:0,valign:'top',lineSpacing:12.5});
    });
    s.addText(ph.note,{x:x+0.3,y:5.32,w:3.3,h:0.66,fontFace:SAN,fontSize:9.2,
      color:C.mut,margin:0,italic:true,lineSpacing:11.5});
  });
  s.addText('Nothing is being dropped. The screens for the later two are already drawn — they switch on when the feature behind them exists.',
    {x:0.55,y:6.3,w:12.2,h:0.4,fontFace:SER,fontSize:14,italic:true,color:C.blued,margin:0});
  notes(s,'This is the most important slide in the deck and it comes early on purpose. If they take one thing away, it is that two dashboards are sequenced, not failed.\n\nSay it in their language: the report cannot show a disposal outcome because nobody can record a disposal outcome yet. That is not a reporting gap, it is a feature that has not shipped.\n\nDo not apologise here. This is a normal delivery decision and presenting it as one is what makes them accept it.');
}

/* ---------- per dashboard ---------- */
CONTENT.order.forEach((d,di)=>{
  const t=tally(d.sheet), yes=t.yes, no=t.no;

  /* divider */
  {
    const s=p.addSlide(); mark('divider',{dash:d.name}); s.background={color:C.navy};
    s.addShape(p.ShapeType.rect,{x:0,y:0,w:W,h:0.055,fill:{color:C.teal},line:{color:C.teal}});
    s.addText(`VIEW ${di+1} OF 6`,{x:0.9,y:2.3,w:6,h:0.3,fontFace:SAN,fontSize:11.5,bold:true,
      charSpacing:1.6,color:C.teal,margin:0});
    s.addText(d.name,{x:0.9,y:2.7,w:8.4,h:1.0,fontFace:SER,fontSize:40,bold:true,color:C.white,margin:0});
    s.addText(d.q,{x:0.9,y:3.85,w:8.2,h:1.0,fontFace:SAN,fontSize:17,color:'AFC4D8',margin:0,lineSpacing:24});
    s.addShape(p.ShapeType.roundRect,{x:9.8,y:2.5,w:2.85,h:2.3,fill:{color:'16304F'},
      line:{color:'27476C'},rectRadius:0.08});
    s.addText(`${yes}`,{x:9.8,y:2.75,w:2.85,h:0.85,fontFace:SER,fontSize:46,bold:true,
      color:C.green,align:'center',margin:0});
    s.addText(`of ${t.tot} built`,{x:9.8,y:3.6,w:2.85,h:0.3,fontFace:SAN,fontSize:12.5,
      color:'AFC4D8',align:'center',margin:0});
    const line=[no?`${no} need your input`:null,
                t.later?`${t.later} wait on the ${d.seq?d.seq.rel:'next release'}`:null]
                .filter(Boolean).join('\n');
    s.addText(line||'nothing outstanding on the checklist',
      {x:9.9,y:3.98,w:2.65,h:0.72,fontFace:SAN,fontSize:11,bold:true,
       color:no?'E88A82':(t.later?'9FC0D8':C.teal),align:'center',margin:0,lineSpacing:14});
    s.addText(`${d.slides.length} screens to walk through`,{x:0.9,y:5.4,w:8,h:0.3,
      fontFace:SAN,fontSize:12,color:'7E97B0',margin:0});
    notes(s,`Pause here. Ask whether this is still the right question for this view before showing any screen — if the question is wrong, everything after it is wrong too.`);
  }

  /* side-by-side screens */
  d.slides.forEach(sl=>{
    let items=rows(d.sheet,sl.items[0],sl.items[1]);
    if(sl.extra) items=items.concat(rows(d.sheet,sl.extra[0],sl.extra[1]));
    const s=p.addSlide(); mark('screen',{dash:d.name,title:sl.t,img:sl.img}); s.background={color:C.bg};
    head(s,d.name,sl.t);

    /* left: the screenshot, at its own aspect ratio */
    const FX=0.55,FY=1.3,FW=7.78,FH=4.78;
    const im=fit(sl.img,FX,FY,FW,FH);
    /* Top-align a tall screenshot with the card beside it; centre a short wide
       one, which otherwise leaves all its dead space in one block. */
    im.y=im.h>3.3?FY:FY+(FH-im.h)/2.4;
    s.addShape(p.ShapeType.rect,{x:im.x-0.035,y:im.y-0.035,w:im.w+0.07,h:im.h+0.07,
      fill:{color:'F0F4F8'},line:{color:C.line},shadow:shadow()});
    s.addImage(im);

    /* right: the checklist */
    const CX=8.55,CY=1.3,CW=4.23,CH=4.78;
    s.addShape(p.ShapeType.roundRect,{x:CX,y:CY,w:CW,h:CH,fill:{color:C.bg},
      line:{color:C.line},rectRadius:0.06,shadow:shadow()});
    s.addText('WHAT YOU ASKED FOR ON THIS SCREEN',{x:CX+0.25,y:CY+0.22,w:CW-0.5,h:0.24,
      fontFace:SAN,fontSize:8,bold:true,charSpacing:0.9,color:C.mut,margin:0});
    const avail=CH-0.78, TW=CW-1.35;
    /* Pick the largest size at which every label still fits: a clipped
       requirement is worse than a small one. */
    let fsz=8.8,lines=[],total=0;
    for(const size of [8.8,8.2,7.6,7.1,6.6,6.2]){
      const cpl=Math.floor(TW*(96/(size*0.575)));   // chars per line at this size
      lines=items.map(it=>Math.max(1,Math.ceil(String(it.item).length/cpl)));
      const lh=(size+2.2)/72;
      total=lines.reduce((a,l)=>a+l*lh+0.075,0);
      fsz=size;
      if(total<=avail) break;
    }
    const lh=(fsz+2.2)/72;
    const pad=total<avail-0.2?Math.min(0.075+(avail-total)/items.length,0.2):0.075;
    let y=CY+0.6;
    items.forEach((it,i)=>{
      const rh=lines[i]*lh+pad;
      const lt=isLater(d.sheet,it.n);
      statusChip(s,CX+0.22,y,it.d,it.amber&&it.d==='Yes',lt);
      s.addText(String(it.item),{x:CX+1.12,y:y-0.02,w:TW,h:rh,fontFace:SAN,
        fontSize:fsz,color:lt?C.later:(it.d==='No'?C.red:C.ink2),
        bold:lt||it.d==='No',margin:0,valign:'top',lineSpacing:fsz+2.2});
      y+=rh;
    });

    /* bottom: what to say */
    sl.say.forEach((t,i)=>{
      const x=0.55+i*4.12;
      s.addShape(p.ShapeType.ellipse,{x,y:6.32,w:0.13,h:0.13,
        fill:{color:[C.blue,C.teal,C.green][i]},line:{color:[C.blue,C.teal,C.green][i]}});
      s.addText(t,{x:x+0.24,y:6.2,w:3.72,h:0.86,fontFace:SAN,fontSize:10,color:C.ink2,
        margin:0,valign:'top',lineSpacing:12.5});
    });
    const nRed=items.filter(i=>i.d==='No').length;
    notes(s,`${sl.t}\n\nOn the checklist: ${items.length} items, ${items.length-nRed} built, ${nRed} needing them.\n\nTalking points:\n- ${sl.say.join('\n- ')}\n\n${nRed?'Do not solve the red items here — say "we come back to this in three slides" and keep moving.':'Nothing red on this screen. Say so out loud; it builds credit for the screens where there is.'}`);
  });

  /* the sequencing case, for the two views that depend on a later release */
  if(d.seq){
    const q=d.seq;
    const s=p.addSlide(); mark('seq',{dash:d.name,title:q.head}); s.background={color:C.bg};
    head(s,d.name,q.head);
    s.addShape(p.ShapeType.roundRect,{x:0.55,y:1.32,w:6.0,h:3.5,fill:{color:C.greenbg},
      line:{color:'CFE4C2'},rectRadius:0.07});
    s.addText('WHAT WORKS TODAY',{x:0.9,y:1.62,w:5,h:0.24,fontFace:SAN,fontSize:9,bold:true,
      charSpacing:1,color:'3F7A2C',margin:0});
    q.now.forEach((t,i)=>{
      s.addText('\u2713',{x:0.9,y:2.02+i*0.86,w:0.3,h:0.3,fontFace:SAN,fontSize:13,bold:true,
        color:C.green,margin:0});
      s.addText(t,{x:1.28,y:1.98+i*0.86,w:4.9,h:0.78,fontFace:SAN,fontSize:11.5,color:C.ink,
        margin:0,valign:'top',lineSpacing:14.5});
    });
    s.addShape(p.ShapeType.roundRect,{x:6.78,y:1.32,w:6.0,h:3.5,fill:{color:C.laterbg},
      line:{color:'C6D6E2'},rectRadius:0.07});
    s.addText('WHAT CANNOT WORK YET, AND WHY',{x:7.13,y:1.62,w:5.3,h:0.24,fontFace:SAN,
      fontSize:9,bold:true,charSpacing:1,color:C.later,margin:0});
    q.blocked.forEach((t,i)=>{
      s.addText('\u2715',{x:7.13,y:2.02+i*0.86,w:0.3,h:0.3,fontFace:SAN,fontSize:12,bold:true,
        color:C.later,margin:0});
      s.addText(t,{x:7.51,y:1.98+i*0.86,w:4.9,h:0.78,fontFace:SAN,fontSize:11.5,color:C.ink,
        margin:0,valign:'top',lineSpacing:14.5});
    });
    s.addShape(p.ShapeType.roundRect,{x:0.55,y:5.05,w:12.23,h:1.55,fill:{color:C.navy},
      line:{color:C.navy},rectRadius:0.07});
    s.addText('WHAT WE PROPOSE',{x:0.95,y:5.28,w:4,h:0.24,fontFace:SAN,fontSize:9,bold:true,
      charSpacing:1,color:C.teal,margin:0});
    s.addText(q.ask,{x:0.95,y:5.56,w:8.3,h:0.86,fontFace:SAN,fontSize:12.5,color:C.white,
      margin:0,valign:'top',lineSpacing:16});
    s.addText(String(q.count),{x:9.6,y:5.32,w:1.5,h:0.72,fontFace:SER,fontSize:38,bold:true,
      color:C.teal,align:'right',margin:0});
    s.addText('items move to the\n'+q.rel,{x:11.2,y:5.44,w:1.5,h:0.6,fontFace:SAN,fontSize:9.5,
      color:'AFC4D8',margin:0,valign:'middle',lineSpacing:12});
    notes(s,`The sequencing case for ${d.name}.\n\nLead with the green column. They need to hear what does work before they hear what does not, or the whole thing sounds like an excuse.\n\nThen the blue column, stated as fact, not apology: the feature does not exist yet.\n\nThen stop and ask directly: "Are you comfortable with us sequencing this?" Get a yes or a no in the room. If they push back, the fallback is on the next slide — we can build the screens now and leave them empty, but empty screens get quoted as zero, and that is worse than not shipping them.`);
  }

  /* asks */
  const CHUNK=5;
  for(let i=0;i<d.asks.length;i+=CHUNK){
    const part=d.asks.slice(i,i+CHUNK);
    const s=p.addSlide(); mark('asks',{dash:d.name,from:i,to:i+part.length}); s.background={color:C.soft};
    const many=d.asks.length>CHUNK;
    head(s,d.name,many?`What we need from you (${Math.floor(i/CHUNK)+1} of ${Math.ceil(d.asks.length/CHUNK)})`
                      :'What we need from you');
    let y=1.4;
    /* Fill the slide rather than leaving a short list floating at the top. */
    const h=Math.min(2.15,(5.05-0.12*(part.length-1))/part.length);
    part.forEach((a,j)=>{
      s.addShape(p.ShapeType.roundRect,{x:0.55,y,w:12.2,h,fill:{color:C.bg},
        line:{color:C.line},rectRadius:0.06,shadow:shadow()});
      s.addShape(p.ShapeType.ellipse,{x:0.85,y:y+(h-0.44)/2,w:0.44,h:0.44,
        fill:{color:C.redbg},line:{color:C.redbg}});
      s.addText(String(i+j+1),{x:0.85,y:y+(h-0.44)/2,w:0.44,h:0.44,fontFace:SER,fontSize:14,
        bold:true,color:C.red,align:'center',valign:'middle',margin:0});
      s.addText(a.q,{x:1.5,y:y+0.14,w:5.1,h:h-0.28,fontFace:SER,fontSize:13.5,bold:true,
        color:C.ink,margin:0,valign:'middle',lineSpacing:17});
      s.addText(a.b,{x:6.8,y:y+0.13,w:3.0,h:h-0.26,fontFace:SAN,fontSize:8.6,color:C.ink2,
        margin:0,valign:'middle',lineSpacing:11});
      s.addText(a.n,{x:9.95,y:y+0.13,w:2.65,h:h-0.26,fontFace:SAN,fontSize:8.6,color:C.blued,
        margin:0,valign:'middle',lineSpacing:11,italic:true});
      y+=h+0.12;
    });
    s.addText('THE QUESTION',{x:1.5,y:1.1,w:3,h:0.22,fontFace:SAN,fontSize:7.5,bold:true,
      charSpacing:0.9,color:C.mut,margin:0});
    s.addText('WHY WE ARE STUCK',{x:6.8,y:1.1,w:3,h:0.22,fontFace:SAN,fontSize:7.5,bold:true,
      charSpacing:0.9,color:C.mut,margin:0});
    s.addText('WHAT WOULD UNBLOCK IT',{x:9.95,y:1.1,w:3,h:0.22,fontFace:SAN,fontSize:7.5,
      bold:true,charSpacing:0.9,color:C.mut,margin:0});
    notes(s,`Read the question in the left column out loud, then stop talking. Do not fill the silence with the middle column unless they ask why.\n\nWhat a good answer sounds like: a system name, a person's name, or "it's in a spreadsheet". Any of those three is a win. "We'll look into it" is not — get a name against it before moving on.`);
  }
});

/* ---------- closing: everything we need ---------- */
{
  const s=p.addSlide(); s.background={color:C.bg};
  mark('rootcause'); head(s,'Pulling it together','The three answers that unlock almost everything');
  const big=[
    ['Who is who','A list that says, for each person, whether they are staff, a consultant or a contractor — and which department they sit in.',
     '18 items','Unlocks every user split on Bank-wide and Department Insights, plus the internal / external visitor question.',C.blue],
    ['Which site belongs to which project','Anything that connects a SharePoint site to a project number. A spreadsheet is fine.',
     '21 items','Turns the whole of Project Insights from a layout into a working dashboard.',C.teal],
    ['Where a disposal is recorded','Somewhere that says a record was actually disposed of, and who approved it.',
     '15 items','Closes the largest single gap across Bank-wide, Department Insights and Retention & Disposal.',C.green],
  ];
  let y=1.42;
  big.forEach(([t,what,cnt,eff,col])=>{
    s.addShape(p.ShapeType.roundRect,{x:0.55,y,w:12.2,h:1.62,fill:{color:C.soft},
      line:{color:C.line},rectRadius:0.07});
    s.addShape(p.ShapeType.ellipse,{x:0.9,y:y+0.55,w:0.5,h:0.5,fill:{color:col},line:{color:col}});
    s.addText(cnt.split(' ')[0],{x:0.9,y:y+0.55,w:0.5,h:0.5,fontFace:SER,fontSize:14,bold:true,
      color:C.white,align:'center',valign:'middle',margin:0});
    s.addText(t,{x:1.6,y:y+0.2,w:4.0,h:0.42,fontFace:SER,fontSize:17,bold:true,color:C.ink,margin:0});
    s.addText(what,{x:1.6,y:y+0.66,w:4.6,h:0.8,fontFace:SAN,fontSize:10.5,color:C.ink2,
      margin:0,lineSpacing:13.5});
    s.addText('WHAT IT UNBLOCKS',{x:6.65,y:y+0.24,w:3,h:0.22,fontFace:SAN,fontSize:7.5,bold:true,
      charSpacing:0.9,color:C.mut,margin:0});
    s.addText(eff,{x:6.65,y:y+0.5,w:5.85,h:0.92,fontFace:SAN,fontSize:11,color:C.ink2,
      margin:0,lineSpacing:14});
    y+=1.75;
  });
  s.addText('The other 24 questions matter, but these three account for 54 of the 61 outstanding items between them.',
    {x:0.55,y:6.75,w:12.2,h:0.35,fontFace:SER,fontSize:13,italic:true,color:C.blued,margin:0});
  notes(s,'If the room is running short on time, this is the slide to land. Everything else can go to email; these three cannot.');
}

/* ---------- closing: the three decisions we need ---------- */
{
  const s=p.addSlide(); s.background={color:C.bg};
  mark('decisions'); head(s,'Before we finish','Three decisions we would like from you today');
  const asks=[
    ['1','Accept the four dashboards that are ready',
     'Bank-wide Oversight, Department Insights, Project Insights and the Institutional File Plan. They are built. Once the open questions are answered, they run on real data.',
     'What we need: a yes, and a name against each open question.',C.green],
    ['2','Agree the disposal half follows the Disposal release',
     'Disposal is not built in EDRMS yet. There is no approval screen and no field to record an outcome, so 14 items across three dashboards cannot be measured however hard we look.',
     'What we need: agreement to sequence, not a date.',C.later],
    ['3','Agree Records & Archive Holdings follows Physical Records',
     'Everything on it is paper: boxes, folders, rooms, retrievals. Those sources arrive with the physical work, after Utilization. Building it now would mean showing you 26 invented figures.',
     'What we need: sign off the layout today, build it later.',C.blued],
  ];
  let y=1.35;
  asks.forEach(([n,t,b,need,col])=>{
    s.addShape(p.ShapeType.roundRect,{x:0.55,y,w:12.2,h:1.72,fill:{color:C.soft},
      line:{color:C.line},rectRadius:0.07});
    s.addShape(p.ShapeType.ellipse,{x:0.9,y:y+0.6,w:0.52,h:0.52,fill:{color:col},line:{color:col}});
    s.addText(n,{x:0.9,y:y+0.6,w:0.52,h:0.52,fontFace:SER,fontSize:17,bold:true,color:C.white,
      align:'center',valign:'middle',margin:0});
    s.addText(t,{x:1.62,y:y+0.22,w:5.0,h:0.86,fontFace:SER,fontSize:16,bold:true,color:C.ink,
      margin:0,valign:'top',lineSpacing:20});
    s.addText(b,{x:6.85,y:y+0.22,w:4.0,h:1.28,fontFace:SAN,fontSize:10.2,color:C.ink2,
      margin:0,valign:'top',lineSpacing:13});
    s.addText(need,{x:11.0,y:y+0.22,w:1.62,h:1.28,fontFace:SAN,fontSize:10,color:col,
      bold:true,margin:0,valign:'top',lineSpacing:13});
    y+=1.84;
  });
  s.addText('None of the three asks you for a date. All three ask you to agree an order.',
    {x:0.55,y:6.85,w:12.2,h:0.35,fontFace:SER,fontSize:14,italic:true,color:C.blued,margin:0});
  notes(s,'Ask for all three explicitly and wait for an answer on each. A nod is not agreement — say "can I take that as agreed?" and let the silence do the work.\n\nIf they resist number 2 or 3, the argument is that an empty dashboard is worse than a sequenced one: a screen full of zeroes gets screenshotted and quoted as fact. Offer instead to show the layout as a signed-off specification now.');
}

/* ---------- closing: next steps ---------- */
{
  const s=p.addSlide(); s.background={color:C.bg};
  mark('nextsteps'); head(s,'After today','What happens next');
  const steps=[
    ['1','You point us at the sources','Even a name — a system, a team, a person who keeps the spreadsheet. We do the chasing from there.','This week'],
    ['2','We confirm what is really there','We check each source ourselves rather than assuming. Every claim in the checklist has been tested this way.','1–2 weeks'],
    ['3','We swap placeholders for real data','The screens do not change. The invented numbers become measured ones, and the amber items turn green.','Ongoing'],
    ['4','The later releases pick up the rest','The disposal screens switch on when Disposal ships. Records & Archive Holdings is built with the physical work. Both layouts are already agreed by then.','Per release'],
  ];
  steps.forEach(([n,t,b,when],i)=>{
    const x=0.55+i*3.14;
    s.addShape(p.ShapeType.roundRect,{x,y:1.5,w:2.92,h:4.3,fill:{color:C.bg},
      line:{color:C.line},rectRadius:0.07,shadow:shadow()});
    s.addShape(p.ShapeType.ellipse,{x:x+0.3,y:1.82,w:0.52,h:0.52,fill:{color:C.navy},line:{color:C.navy}});
    s.addText(n,{x:x+0.3,y:1.82,w:0.52,h:0.52,fontFace:SER,fontSize:17,bold:true,color:C.white,
      align:'center',valign:'middle',margin:0});
    s.addText(t,{x:x+0.3,y:2.55,w:2.35,h:0.85,fontFace:SER,fontSize:15,bold:true,color:C.ink,
      margin:0,lineSpacing:19});
    s.addText(b,{x:x+0.3,y:3.45,w:2.35,h:1.6,fontFace:SAN,fontSize:10.5,color:C.ink2,
      margin:0,lineSpacing:14});
    s.addText(when.toUpperCase(),{x:x+0.3,y:5.25,w:2.35,h:0.26,fontFace:SAN,fontSize:8.5,
      bold:true,charSpacing:0.8,color:C.blue,margin:0});
  });
  s.addText('The prototype is live and will stay live. Open it any time, click anything, and tell us what is wrong with it.',
    {x:0.55,y:6.2,w:12.2,h:0.35,fontFace:SAN,fontSize:12,color:C.ink2,margin:0});
  s.addText('perezfiles01-droid.github.io/Jim',{x:0.55,y:6.55,w:12.2,h:0.35,fontFace:SAN,
    fontSize:13,bold:true,color:C.blue,margin:0});
  notes(s,'Close by naming who owes what, out loud, before people leave the room. A question with a name against it gets answered; a question on a slide does not.');
}

/* ---------- closing ---------- */
{
  const s=p.addSlide(); s.background={color:C.navy};
  s.addShape(p.ShapeType.rect,{x:0,y:0,w:W,h:0.055,fill:{color:C.green},line:{color:C.green}});
  mark('close'); s.addText('Over to you',{x:0.9,y:2.6,w:9,h:1.0,fontFace:SER,fontSize:44,bold:true,
    color:C.white,margin:0});
  s.addText('Which of the red items matters most to you — and which could we drop without anyone missing it?',
    {x:0.9,y:3.75,w:9.8,h:1.1,fontFace:SAN,fontSize:17,color:'AFC4D8',margin:0,lineSpacing:24});
  s.addText('Both answers are useful. The second one is often more useful.',
    {x:0.9,y:4.85,w:9.8,h:0.4,fontFace:SER,fontSize:14,italic:true,color:C.teal,margin:0});
  notes(s,'Ask the dropping question genuinely. A requirement nobody actually wants is worth more to lose than a requirement we cannot source is worth to keep.');
}

fs.writeFileSync(path.join(D,'manifest.json'),JSON.stringify(MANIFEST,null,1));
const OUT=path.join(D,'..','EDRMS_Client_Workshop_2026-08-22.pptx');
p.writeFile({fileName:OUT}).then(()=>console.log('written',OUT));
