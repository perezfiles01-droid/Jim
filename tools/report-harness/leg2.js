const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0;
for(const [w,h,f] of [[1225,703,"sp2.html"],[1366,768,"sp2.html"],[1600,900,"sp.html"],[1920,1080,"sp.html"]]){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+__dirname+'/'+f);await p.waitForTimeout(4000);
const seg=t=>p.locator(`[class*=SegmentedControl_module_scss_field]:has(> span:text-is("Show # Months")) button:text-is("${t}")`).first().click();
const st=()=>p.evaluate(()=>{const h=document.querySelector('[class*=chartHead]').getBoundingClientRect();const l=document.querySelector('ul[class*=legend]');const lis=[...l.querySelectorAll('li')];const lr=l.getBoundingClientRect();
 const vis=lis.filter(x=>{const r=x.getBoundingClientRect();return r.left>=lr.left-1&&r.right<=lr.right+1}).map(x=>x.innerText.trim());
 return {head:Math.round(h.height),t:document.querySelector('[data-sizing]').style.transform,over:l.scrollWidth>l.clientWidth+1,first:vis[0],last:vis[vis.length-1],n:lis.length,btn:document.querySelectorAll('[aria-label$="periods in the legend"]').length}});
const base=await st();const out=[];
for(const m of ['2','3','6','12']){await seg(m);await p.waitForTimeout(900);const x=await st();const ok=x.head===base.head;if(!ok)bad++;out.push(m+':'+(ok?'1 row':'HEAD '+x.head)+(x.t!==base.t?' size '+x.t:'')+(x.over?' fits? no ('+x.first+'..'+x.last+')':''));}
let syncMsg='';const x12=await st();if(x12.over){await p.evaluate(()=>{const s=document.querySelector('[class*=chartScroll]');s.scrollLeft=s.scrollWidth;s.dispatchEvent(new Event('scroll'))});await p.waitForTimeout(300);const y=await st();syncMsg=' scrolled-end legend: '+y.first+'..'+y.last;if(!/Nov/.test(y.last))bad++;}
console.log(w+'x'+h,out.join('  ')+syncMsg);if(w===1366){const r=await p.locator('[class*=chartCard]').first().boundingBox();await p.screenshot({path:'leg'+w+'.png',clip:{x:r.x,y:r.y,width:r.width,height:r.height}});}await p.close();}
console.log(bad?'FAIL':'PASS');await b.close();})();
