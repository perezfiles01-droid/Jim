const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1400,height:900},deviceScaleFactor:1.5});
  await p.goto('file:///home/user/Jim/deck/preview.html',{waitUntil:'load'});
  const issues=await p.evaluate(()=>{
    const out=[];
    document.querySelectorAll('.slide').forEach(sl=>{
      const n=sl.dataset.n, sr=sl.getBoundingClientRect();
      sl.querySelectorAll('.txt').forEach(el=>{
        const raw=(el.textContent||'').replace(/\u00a0/g,'').trim();
        if(!raw) return;                      // decorative shape, not a text box
        const t=raw.slice(0,42);
        if(el.scrollHeight>el.clientHeight+3)
          out.push({n,kind:'overflow',by:el.scrollHeight-el.clientHeight,t});
        if(el.scrollWidth>el.clientWidth+3)
          out.push({n,kind:'wide',by:el.scrollWidth-el.clientWidth,t});
      });
      sl.querySelectorAll('.shp,.pic').forEach(el=>{
        const r=el.getBoundingClientRect();
        const m=el.classList.contains('txt')?(el.textContent||'').trim().slice(0,36):'shape';
        if(r.left<sr.left-1||r.right>sr.right+1||r.top<sr.top-1||r.bottom>sr.bottom+1)
          out.push({n,kind:'outofbounds',t:m});
      });
    });
    return out;
  });
  fs.writeFileSync('/home/user/Jim/deck/qa.json',JSON.stringify(issues,null,1));
  const by={};issues.forEach(i=>{by[i.n]=by[i.n]||[];by[i.n].push(i);});
  for(const n of Object.keys(by).sort((a,b)=>a-b))
    console.log('slide',n,by[n].map(i=>`${i.kind}${i.by?'+'+Math.round(i.by):''}: ${i.t}`).join(' || '));
  console.log('TOTAL ISSUES',issues.length);
  await b.close();
})();
