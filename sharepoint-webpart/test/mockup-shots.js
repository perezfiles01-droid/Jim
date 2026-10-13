/* mockup-shots.js: screenshots of the built web part for the mockup PDF.
   Same mock host as host-test.js, but only the web part, 1920x1080, "window" sizing.
   Usage: node test/mockup-shots.js <outdir> */
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const HERE=path.join(__dirname,'..'),ASSETS=path.join(HERE,'release','assets'),OUT=process.argv[2];
const t=fs.readFileSync(path.join(HERE,'src/webparts/edrmsUtilizationReport/reportTemplate.ts'),'utf8');
const html=t.match(/export const REPORT_HTML: string = (.*);\n/)[1],scripts=t.match(/export const REPORT_SCRIPTS: string\[\] = (.*);\n/)[1];
const host=fs.readFileSync(path.join(HERE,'lib-commonjs/webparts/edrmsUtilizationReport/ReportHost.js'),'utf8');
const files={'template.js':'window.REPORT_HTML='+html+';window.REPORT_SCRIPTS='+scripts+';',
 'reporthost.js':'(function(){var exports={};var module={exports:exports};\n'+host+'\n;window.ReportHost=exports.ReportHost;})();',
 'start.js':"(function(){var o=new URLSearchParams(location.search);window.__host=new ReportHost(document.getElementById('wp'),location.origin+'/assets/',window.REPORT_HTML,window.REPORT_SCRIPTS,{dashboard:o.get('d')||'bw',showSidebar:true,sizing:'content',height:1080,textSize:'large',adbBlue:true});})();"};
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');
 if(u.pathname==='/'){r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end('<!doctype html><html><head><style>body{margin:0}.box{position:relative;width:100%;overflow-y:hidden}.frame,iframe{display:block;border:0;transform-origin:0 0!important}</style></head><body><div id="wp"></div>'+['template.js','reporthost.js','start.js'].map(f=>'<script src="/t/'+f+'"></script>').join('')+'</body></html>');return;}
 if(u.pathname.startsWith('/t/')&&files[u.pathname.slice(3)]){r.writeHead(200,{'Content-Type':'application/javascript'});r.end(files[u.pathname.slice(3)]);return;}
 const p=path.join(ASSETS,path.basename(u.pathname));if(u.pathname.startsWith('/assets/')&&fs.existsSync(p)){r.writeHead(200,{'Content-Type':p.endsWith('.js')?'application/javascript':'image/png'});fs.createReadStream(p).pipe(r);return;}
 r.writeHead(404);r.end();});
(async()=>{await new Promise(res=>server.listen(0,res));const base='http://127.0.0.1:'+server.address().port+'/';
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1920,height:5200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const fr=async()=>{for(let i=0;i<40;i++){const f=p.frames().find(f=>f!==p.mainFrame());if(f&&await f.$('#view .band').catch(()=>null))return f;await p.waitForTimeout(250);}throw new Error('no report frame');};
 const shots=[
  ['03-bw-sites','bw',{card:0}],['04-bw-users','bw',{card:1}],['05-bw-docs','bw',{card:2}],['06-bw-records','bw',{card:3}],
  ['07-bw-physical','bw',{scroll:'#bw-phys-panel'}],['08-bw-compare','bw',{scroll:'#bw-cmp'}],['09-bw-trend','bw',{scroll:'#bw-trend-panel'}],
  ['11-dp-sites','dp',{card:0,dp:1}],['12-dp-visitors','dp',{card:1,dp:1}],['13-dp-docs','dp',{card:2,dp:1}],['14-dp-records','dp',{card:3,dp:1}],['15-dp-physical','dp',{card:4,dp:1}],
  ['16-dp-libraries','dp',{scroll:'#dp-libs',dp:1}]];
 const offs={};
 for(const [name,d,o] of shots){
  await p.goto(base+'?d='+d);const f=await fr();await p.waitForTimeout(1200);
  await f.evaluate(o=>{const sel=o.dp?'#dp-kpis .kpi':'#view .kpi';
   if(o.card!==undefined){const k=[...document.querySelectorAll(sel)].filter(x=>x.offsetWidth>0)[o.card];k&&k.click();}},o);
  await p.waitForTimeout(900);
  const y=await f.evaluate(o=>{let el=null;
   if(o.scroll){el=document.querySelector(o.scroll);el=el&&(el.closest('.panel')||el);const pv=el&&el.previousElementSibling;if(pv&&pv.classList.contains('band'))el=pv;}
   if(!el)return 0;return el.getBoundingClientRect().top+document.documentElement.scrollTop-12;},o);
  const oy=await p.evaluate(y=>{const fr=document.querySelector('iframe');const r=fr.getBoundingClientRect();const sc=r.width/(fr.contentDocument?fr.contentDocument.documentElement.clientWidth:r.width);return Math.max(0,Math.round(r.top+window.scrollY+y*sc));},y);
  const bot=await f.evaluate(o=>{let el=null;
   if(o.scroll){el=document.querySelector(o.scroll);el=el&&(el.closest('.panel')||el);}
   else{el=document.querySelector(o.dp?'#dp-drill':'#bw-drill');el=el&&(el.closest('.panel')||el);}
   if(!el)return 0;return el.getBoundingClientRect().bottom+document.documentElement.scrollTop+16;},o);
  const ob=await p.evaluate(y=>{const fr=document.querySelector('iframe');const r=fr.getBoundingClientRect();const sc=r.width/(fr.contentDocument?fr.contentDocument.documentElement.clientWidth:r.width);return Math.round(r.top+window.scrollY+y*sc);},bot);
  offs[name]=[oy,ob];
  await f.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>{window.scrollTo(0,0);document.querySelectorAll('*').forEach(e=>{if(e.scrollTop)e.scrollTop=0;if(e.scrollLeft)e.scrollLeft=0;});});await p.waitForTimeout(800);
  await p.screenshot({path:path.join(OUT,name+'.full.png')});
 }
 fs.writeFileSync(path.join(OUT,'offsets.json'),JSON.stringify(offs));
 console.log(JSON.stringify({done:shots.length,errs,offs}));await b.close();server.close();})();
