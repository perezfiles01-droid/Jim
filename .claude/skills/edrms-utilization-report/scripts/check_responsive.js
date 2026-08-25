/* Layout at every width, which is also what browser zoom does.
 *
 * Zooming in shrinks the CSS viewport: 1440px at 200% is 720 CSS px. So a
 * sweep of widths is a sweep of zoom levels, and there is no need to simulate
 * zoom separately. Do not use body{zoom} for this, which was the mistake that
 * hid these faults for a while: it scales the pixels but leaves media queries
 * reading the old width, so it reports breakage that a real browser never
 * shows and misses breakage that it does.
 *
 * Faults this was written after finding, 13 Aug 2026:
 *   - the KPI container was itself a four column grid, so the two card groups
 *     injected into it became two columns and every card was crushed
 *   - treemap blocks shorter than about 78px printed their value on top of
 *     their subtitle
 *   - the trend strips and column charts had no scroll fallback
 *   - long KPI values overflowed their card once the grid narrowed
 *
 *   node check_responsive.js [path or url]
 */
const {chromium}=(()=>{for(const m of ["playwright-core","/tmp/node_modules/playwright-core"]){try{return require(m);}catch(e){}}throw new Error("playwright-core not found");})();
const A=process.argv[2]||"/home/user/Jim/index.html";
const URL=A.startsWith("http")?A:"file://"+A;
const KEYS=["bw","dp","pj","fp","rd","ra"];
// Real browser zoom shrinks the CSS viewport. 1440 at 200% == 720 CSS px.
const WIDTHS=[1920,1600,1440,1280,1100,1024,900,820,720,640,560,480,400];
(async()=>{
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
let total=0;
for(const w of WIDTHS){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(URL);
  const rows=[];
  for(const k of KEYS){
    await p.evaluate(key=>switchTo(key),k);
    await p.waitForTimeout(90);
    const bad=await p.evaluate(()=>{
      const out=[],doc=document.documentElement;
      if(doc.scrollWidth>doc.clientWidth+1)out.push("PAGE scrolls sideways "+doc.scrollWidth+">"+doc.clientWidth);
      document.querySelectorAll("section *").forEach(e=>{
        if(!(e instanceof HTMLElement))return;
        const cs=getComputedStyle(e);
        if(cs.display==="none"||cs.visibility==="hidden")return;
        if(e.closest(".scrollx,.tmwrap,.cols,.trend"))return;
        if(cs.overflowX==="auto"||cs.overflowX==="scroll")return;
        if(e.scrollWidth>e.clientWidth+2)
          out.push("clip-x ."+String(e.className).split(" ")[0]+" "+e.scrollWidth+">"+e.clientWidth+" \""+(e.textContent||"").trim().slice(0,26)+"\"");
      });
      return [...new Set(out)];
    });
    if(bad.length)rows.push("  "+k+": "+bad.slice(0,3).join(" | "));
    total+=bad.length;
  }
  if(rows.length){console.log("== "+w+"px");rows.forEach(r=>console.log(r));}
  await p.close();
}
console.log(total?("\nFAIL: "+total+" layout faults"):("\nno layout faults across "+WIDTHS.length+" widths, "+WIDTHS[0]+"px down to "+WIDTHS[WIDTHS.length-1]+"px"));
await b.close();
process.exit(total?1:0);})();
