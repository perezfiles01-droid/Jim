const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const OUT='/home/user/Jim/deck/shots';
/* The tiles the client drew on s39-s43 (bank-wide), s53-s60 (department) and
   s38 (project) open a table underneath rather than a new screen. Capture each
   one open, so the deck can show the screen each requirement actually lands on. */
const DRILLS={bw:'#bw-kpis',dp:'#dp-kpis',pj:'#pj-kpis'};
const PANEL={bw:'#bw-drill',dp:'#dp-drill',pj:'#pj-drill'};

(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1680,height:1000},deviceScaleFactor:2});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/user/Jim/index.html',{waitUntil:'load'});
  const out={};
  for(const k of Object.keys(DRILLS)){
    await p.evaluate(k=>switchTo(k),k); await p.waitForTimeout(350);
    const keys=await p.$$eval(DRILLS[k]+' .kpi[data-k]',els=>els.map(e=>e.dataset.k));
    out[k]=[];
    for(const dk of keys){
      await p.click(`${DRILLS[k]} .kpi[data-k="${dk}"]`);
      await p.waitForTimeout(280);
      const file=`${k}-drill-${dk}.png`;
      const el=p.locator(PANEL[k]);
      if(!await el.count())continue;
      await el.screenshot({path:path.join(OUT,file)});
      const box=await el.boundingBox();
      const title=await p.$eval(PANEL[k]+' .ptitle',e=>e.textContent.trim()).catch(()=>dk);
      out[k].push({file,key:dk,title,w:Math.round(box.width),h:Math.round(box.height)});
    }
    console.log(k,out[k].map(x=>x.key+' '+x.w+'x'+x.h).join(' | '));
  }
  fs.writeFileSync('/home/user/Jim/deck/drills.json',JSON.stringify(out,null,2));
  await b.close();
  if(errs.length){console.error('PAGE ERRORS',errs);process.exit(1);}
})();
