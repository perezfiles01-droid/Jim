const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1840,height:1050}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/sp.html');await p.waitForTimeout(3500);
const c=await p.$('[class*=chartCard]');await c.screenshot({path:__dirname+'/chart.png'});
await p.click('[role=checkbox]:has-text("Sites")');await p.waitForTimeout(800);await c.screenshot({path:__dirname+'/chart2.png'});
console.log(errs);await b.close();})();
