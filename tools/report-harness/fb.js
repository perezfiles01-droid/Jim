const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0;
for(const [w,h] of [[1366,768],[1536,864],[1600,900],[1920,1080]]){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+__dirname+'/sp4.html');await p.waitForTimeout(5000);
const seen=new Set();for(let j=0;j<20;j++){await p.waitForTimeout(100);seen.add(await p.evaluate(()=>document.querySelector('[data-sizing]').style.transform));}
const scroll=await p.evaluate(()=>{const m=document.querySelector('#main');const c=document.querySelector('[data-sizing]');return Math.max(m.scrollHeight-m.clientHeight,c.scrollHeight-c.clientHeight)});
console.log(w+'x'+h,seen.size>1?'JUMPING ('+seen.size+' sizes)':'steady',scroll>1?'scroll '+scroll:'');if(seen.size>1||scroll>1)bad++;await p.close();}
console.log(bad?'FAIL':'PASS');await b.close();})();
