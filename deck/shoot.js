const {chromium}=require('playwright');
(async()=>{
  const nums=process.argv.slice(2);
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1400,height:900},deviceScaleFactor:1.4});
  await p.goto('file:///home/user/Jim/deck/preview.html',{waitUntil:'load'});
  for(const n of nums)
    await p.locator(`.slide[data-n="${n}"]`).screenshot({path:`/home/user/Jim/deck/qa-${n}.png`});
  await b.close(); console.log('ok');
})();
