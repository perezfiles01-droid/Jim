const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();for(const [w,h] of [[1600,1000],[1366,768],[1920,1080]]){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+__dirname+'/index.html');await p.waitForTimeout(3500);await p.locator('[aria-label="EDRMS Sites"]').first().click();await p.waitForTimeout(800);
await p.locator('[aria-haspopup="tree"]').click();await p.waitForTimeout(400);
const r=await p.evaluate(()=>{const t=document.querySelector('[aria-haspopup="tree"]').getBoundingClientRect();const l=document.querySelector('[role=tree]').parentElement.getBoundingClientRect();return {box:[Math.round(t.left),Math.round(t.right)],list:[Math.round(l.left),Math.round(l.right)]}});
console.log(w+'x'+h,JSON.stringify(r),Math.abs(r.box[0]-r.list[0])<=1&&Math.abs(r.box[1]-r.list[1])<=1?'PASS same width':'FAIL');
if(w===1366)await p.screenshot({path:'wid.png',clip:{x:200,y:250,width:1166,height:500}});await p.close();}await b.close();})();
