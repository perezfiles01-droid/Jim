// Screenshots both dashboards from the BUILT SharePoint web part (the latest version,
// same mock host as sharepoint-webpart/test/mockup-shots.js) and records, for every
// beat in beats.json, the page rectangle of the element that beat talks about.
// Build the web part first (see SESSION_HANDOFF.txt), then: node shoot-webpart.js
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const WP=path.join(__dirname,'..','sharepoint-webpart'),ASSETS=path.join(WP,'release','assets');
const t=fs.readFileSync(path.join(WP,'src/webparts/edrmsUtilizationReport/reportTemplate.ts'),'utf8');
const html=t.match(/export const REPORT_HTML: string = (.*);\n/)[1],scripts=t.match(/export const REPORT_SCRIPTS: string\[\] = (.*);\n/)[1];
const host=fs.readFileSync(path.join(WP,'lib-commonjs/webparts/edrmsUtilizationReport/ReportHost.js'),'utf8');
const files={'template.js':'window.REPORT_HTML='+html+';window.REPORT_SCRIPTS='+scripts+';',
 'reporthost.js':'(function(){var exports={};var module={exports:exports};\n'+host+'\n;window.ReportHost=exports.ReportHost;})();',
 'start.js':"(function(){var o=new URLSearchParams(location.search);window.__host=new ReportHost(document.getElementById('wp'),location.origin+'/assets/',window.REPORT_HTML,window.REPORT_SCRIPTS,{dashboard:o.get('d')||'bw',showSidebar:true,sizing:'content',height:1080,textSize:'large',adbBlue:true});})();"};
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');
 if(u.pathname==='/'){r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end('<!doctype html><html><head><style>body{margin:0}.box{position:relative;width:100%;overflow-y:hidden}.frame,iframe{display:block;border:0;transform-origin:0 0!important}</style></head><body><div id="wp"></div>'+['template.js','reporthost.js','start.js'].map(f=>'<script src="/t/'+f+'"></script>').join('')+'</body></html>');return;}
 if(u.pathname.startsWith('/t/')&&files[u.pathname.slice(3)]){r.writeHead(200,{'Content-Type':'application/javascript'});r.end(files[u.pathname.slice(3)]);return;}
 const p=path.join(ASSETS,path.basename(u.pathname));if(u.pathname.startsWith('/assets/')&&fs.existsSync(p)){r.writeHead(200,{'Content-Type':p.endsWith('.js')?'application/javascript':'image/png'});fs.createReadStream(p).pipe(r);return;}
 r.writeHead(404);r.end();});
(async()=>{await new Promise(res=>server.listen(0,res));const base='http://127.0.0.1:'+server.address().port+'/';
 const beats=JSON.parse(fs.readFileSync(__dirname+'/beats.json'));
 const b=await chromium.launch({executablePath:process.env.CHROME});const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const fr=async()=>{for(let i=0;i<40;i++){const f=p.frames().find(f=>f!==p.mainFrame());if(f&&await f.$('#view .band').catch(()=>null))return f;await p.waitForTimeout(250);}throw new Error('no report frame');};
 const heights={};
 for(const k of ['bw','dp']){
  await p.setViewportSize({width:1920,height:1080});await p.goto(base+'?d='+k);await fr();await p.waitForTimeout(1500);
  const h=await p.evaluate(()=>Math.ceil(document.documentElement.scrollHeight));
  await p.setViewportSize({width:1920,height:h});await p.waitForTimeout(1500);
  const f=await fr();await p.waitForTimeout(500);
  const h2=await p.evaluate(()=>Math.ceil(document.documentElement.scrollHeight));
  if(h2!==h){await p.setViewportSize({width:1920,height:h2});await p.waitForTimeout(1200);}
  heights[k]=h2;
  await p.screenshot({path:`${__dirname}/public/${k}.png`});
  const fb=await p.evaluate(()=>{const e=document.querySelector('iframe'),r=e.getBoundingClientRect();return {x:r.left,y:r.top,s:r.width/e.contentDocument.documentElement.clientWidth};});
  for(const [i,bt] of beats.entries()){
   if(bt.dash!==k)continue;
   const r=await f.$$eval('#view '+bt.sel,(els,bt)=>{
    els=els.filter(e=>e.getBoundingClientRect().height>0);
    const n=(bt.n??0)<0?els.length+bt.n:(bt.n??0);
    const pick=els.slice(n,bt.until??n+1).map(e=>e.getBoundingClientRect());
    if(!pick.length)return null;
    const x=Math.min(...pick.map(r=>r.left)),y=Math.min(...pick.map(r=>r.top));
    return {x,y:y+(bt.skipTop||0),w:Math.max(...pick.map(r=>r.right))-x,h:Math.max(...pick.map(r=>r.bottom))-y-(bt.skipTop||0)};
   },bt).catch(()=>null);
   if(!r){errs.push(`no element for beat ${i}: ${bt.sel}`);continue;}
   bt.rect={x:fb.x+r.x*fb.s,y:fb.y+r.y*fb.s,w:r.w*fb.s,h:r.h*fb.s};
  }
 }
 fs.writeFileSync(__dirname+'/public/beats.rects.json',JSON.stringify(beats.map(b=>b.rect??null)));
 console.log(JSON.stringify({heights}),errs.length?errs:'all beats located');await b.close();server.close();})();
