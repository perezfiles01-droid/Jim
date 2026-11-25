const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1840,height:1050}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/sp.html');await p.waitForTimeout(3500);
await p.click('[aria-label="EDRMS Sites"]');await p.waitForTimeout(1200);
const g=await p.$('[aria-label="Key Performance Indicators"]');await g.screenshot({path:__dirname+'/cards.png'});
console.log(errs);await b.close();})();
