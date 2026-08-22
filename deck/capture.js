const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const OUT='/home/user/Jim/deck/shots';
const KEYS=['bw','dp','pj','fp','rd','ra'];

(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1680,height:1000},deviceScaleFactor:2});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/user/Jim/index.html',{waitUntil:'load'});
  const manifest={};
  for(const k of KEYS){
    await p.evaluate(k=>switchTo(k),k);
    await p.waitForTimeout(400);
    // Wrap each logical chunk (a .band plus the panels that follow it) in its
    // own div, so each can be screenshotted as an element. Element shots scroll
    // themselves into view, which a page clip past the viewport cannot do.
    const groups=await p.evaluate(()=>{
      const sec=document.querySelector('#view > section');
      const kids=[...sec.children];
      const chunks=[]; let cur=null;
      for(const el of kids){
        if(el.classList.contains('band')||!cur){cur={els:[],title:''};chunks.push(cur);}
        cur.els.push(el);
        if(el.classList.contains('band')&&!cur.title){
          const h=el.querySelector('h2'); if(h)cur.title=h.textContent.trim();
        }
      }
      const split=[];
      for(const c of chunks){
        let acc=[],h=0;
        for(const el of c.els){
          const eh=el.getBoundingClientRect().height;
          if(acc.length&&h+eh>720){split.push({title:c.title,els:acc});acc=[];h=0;}
          acc.push(el);h+=eh;
        }
        if(acc.length)split.push({title:c.title,els:acc});
      }
      // A band on its own is a heading, not a screen. Fold any short chunk into
      // the one after it so no slide gets a screenshot of just a caption.
      const merged=[];
      for(const c of split){
        const h=c.els.reduce((a,e)=>a+e.getBoundingClientRect().height,0);
        if(h<260&&merged.length===0){merged.push(c);continue;}
        if(h<260&&split.indexOf(c)<split.length-1){c._pend=true;}
        merged.push(c);
      }
      const final=[];
      for(let i=0;i<merged.length;i++){
        const c=merged[i];
        const h=c.els.reduce((a,e)=>a+e.getBoundingClientRect().height,0);
        if(h<260&&i<merged.length-1){
          merged[i+1].els=c.els.concat(merged[i+1].els);
          merged[i+1].title=c.title||merged[i+1].title;
        } else final.push(c);
      }
      return final.map((c,i)=>{
        const w=document.createElement('div');
        w.id='shot'+i; w.style.padding='6px';
        c.els[0].parentNode.insertBefore(w,c.els[0]);
        c.els.forEach(e=>w.appendChild(e));
        const r=w.getBoundingClientRect();
        return {id:w.id,title:c.title,w:Math.round(r.width),h:Math.round(r.height)};
      });
    });
    manifest[k]=[];
    for(let i=0;i<groups.length;i++){
      const g=groups[i];
      if(g.w<50||g.h<30)continue;
      const file=`${k}-${String(i+1).padStart(2,'0')}.png`;
      await p.locator('#'+g.id).screenshot({path:path.join(OUT,file)});
      manifest[k].push({file,title:g.title,w:g.w,h:g.h});
    }
    console.log(k,'->',manifest[k].length,'shots',manifest[k].map(m=>m.w+'x'+m.h).join(' '));
  }
  fs.writeFileSync('/home/user/Jim/deck/shots.json',JSON.stringify(manifest,null,2));
  await b.close();
  if(errs.length){console.error('PAGE ERRORS',errs);process.exit(1);}
})();
