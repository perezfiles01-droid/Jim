const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.argv[2]);
const L=await p.evaluate(()=>S.map(s=>({chap:s.chap,lines:s.lines})));require('fs').writeFileSync('lines.json',JSON.stringify(L,null,1));await b.close()})();
