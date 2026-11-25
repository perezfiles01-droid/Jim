const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/sp.html');await p.waitForTimeout(3500);
const r=await p.$('[class*=results]');
const icons=await r.$$('[role=img]');await icons[0].hover();await p.waitForTimeout(800);
const bb=await r.boundingBox();
await p.screenshot({path:__dirname+'/res.png',clip:{x:bb.x,y:bb.y,width:bb.width,height:bb.height+60}});
console.log(icons.length,errs);await b.close();})();
