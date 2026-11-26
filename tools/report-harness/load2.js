const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0,n=0;
const hash='#edrms='+encodeURIComponent(JSON.stringify({'bw.overview.months':'12','bw.overview.types':['docs']}));
const sizes=[];for(const w of [1280,1366,1414,1440,1536,1600,1768])for(const h of [700,768,800,864,904,960])sizes.push([w,h]);
await Promise.all([0,1,2,3].map(async k=>{for(let i=k;i<sizes.length;i+=4){const [w,h]=sizes[i];for(const f of ['sp2.html','sp3.html']){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+__dirname+'/'+f+hash);await p.waitForTimeout(4200);
const seen=new Set();for(let j=0;j<15;j++){await p.waitForTimeout(100);seen.add(await p.evaluate(()=>document.querySelector('[data-sizing]').style.transform));}
const scroll=await p.evaluate(()=>{const m=document.querySelector('#main');return m.scrollHeight-m.clientHeight});n++;
if(seen.size>1||scroll>1){bad++;console.log(f,w+'x'+h,seen.size>1?'JUMPING '+seen.size:'',scroll>1?'scroll '+scroll:'');}
await p.close();}}}));
console.log(n,'pages',bad?'FAIL '+bad:'PASS');await b.close();})();
