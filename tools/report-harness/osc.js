const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0;
for(const [w,h,f] of [[1920,1080,'sp.html'],[1840,1050,'sp.html'],[1600,900,'sp.html'],[1366,768,'sp2.html'],[1536,864,'sp2.html'],[1280,720,'sp2.html']]){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+__dirname+'/'+f);await p.waitForTimeout(4500);
const seg=t=>p.locator(`[class*=SegmentedControl_module_scss_field]:has(> span:text-is("Show # Months")) button:text-is("${t}")`).first().click();
const res=[];
for(const m of ['6','12','1','12']){await seg(m);const seen=[];for(let i=0;i<30;i++){await p.waitForTimeout(100);seen.push(await p.evaluate(()=>document.querySelector('[data-sizing]').style.transform));}
 const late=new Set(seen.slice(10));const scroll=await p.evaluate(()=>{const m=document.querySelector('#main');return m.scrollHeight-m.clientHeight});
 res.push(m+':'+(late.size>1?'JUMPING('+late.size+')':'steady')+(scroll>1?' scroll'+scroll:''));if(late.size>1||scroll>1)bad++;}
console.log(w+'x'+h,res.join('  '));await p.close();}
console.log(bad?'FAIL':'PASS');await b.close();})();
