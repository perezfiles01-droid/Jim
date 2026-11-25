const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [w,h] of [[1840,1050],[1600,900],[2560,1440]]){const p=await b.newPage({viewport:{width:w,height:h}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/sp.html');await p.waitForTimeout(4000);
console.log(w,h,JSON.stringify(await p.evaluate(()=>{const sc=document.getElementById('sc');const svg=document.querySelector('[class*=chartBox] svg');const box=document.querySelector('[class*=chartBox]').getBoundingClientRect();const leg=document.querySelector('[class*=chartBox]').lastElementChild.getBoundingClientRect();return {gapBelowReport:Math.round(innerHeight-document.querySelector('.edrmsReportRoot').getBoundingClientRect().bottom),pageScroll:sc.scrollHeight-sc.clientHeight,svgBottom:Math.round(svg.getBoundingClientRect().bottom),legTop:Math.round(leg.top),legBottom:Math.round(leg.bottom),boxBottom:Math.round(box.bottom)}})),errs);
if(w==1840)await p.screenshot({path:'sp.png'});await p.close();}
await b.close();})();
