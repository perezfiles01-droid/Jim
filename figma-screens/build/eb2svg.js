// Renders each report screen and converts the live layout into an SVG of
// editable shapes and text (no pictures), one <g> per section.
const {chromium}=require('/home/user/Jim/node_modules/playwright');const fs=require('fs');
const SER=()=>{
 const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const col=c=>{const m=c&&c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(Number);if(p.length>3&&p[3]===0)return null;return {hex:'#'+p.slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join(''),a:p.length>3?p[3]:1};};
 const root=document.querySelector('.report'), R=root.getBoundingClientRect();
 const out=[];
 const box=(e,ox,oy)=>{const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return;const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return;
  const bg=col(cs.backgroundColor), bw=parseFloat(cs.borderTopWidth)||0, bc=col(cs.borderTopColor), lw=parseFloat(cs.borderLeftWidth)||0, lc=col(cs.borderLeftColor), bb=parseFloat(cs.borderBottomWidth)||0, bbc=col(cs.borderBottomColor);
  const rad=Math.min(parseFloat(cs.borderTopLeftRadius)||0,r.height/2);const x=r.left-ox,y=r.top-oy;
  const uni=bw>0&&bc&&bb===bw;
  if(bg||uni){out.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${r.width.toFixed(1)}" height="${r.height.toFixed(1)}" rx="${rad}" fill="${bg?bg.hex:'none'}"${bg&&bg.a<1?` fill-opacity="${bg.a}"`:''}${uni?` stroke="${bc.hex}" stroke-width="${bw}"`:''}/>`);}
  if(!uni&&bb>0&&bbc)out.push(`<rect x="${x.toFixed(1)}" y="${(y+r.height-bb).toFixed(1)}" width="${r.width.toFixed(1)}" height="${bb}" fill="${bbc.hex}"/>`);
  if(lw>bw&&lc&&lc.a>0)out.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${lw}" height="${r.height.toFixed(1)}" rx="${Math.min(rad,2)}" fill="${lc.hex}"/>`);
 };
 const text=(tn,ox,oy)=>{const p=tn.parentElement,cs=getComputedStyle(p);if(cs.visibility==='hidden')return;const c=col(cs.color);if(!c)return;
  let s=tn.textContent;if(!s.trim())return;
  // a sort arrow in a header rides on the header's own text, so it stays beside it when Figma drops letter-spacing
  const th=p.closest('th');let tail='';if(th){const tw=document.createTreeWalker(th,NodeFilter.SHOW_TEXT);const ns=[];let n;while((n=tw.nextNode()))if(n.textContent.trim())ns.push(n);if(ns[0]!==tn)return;tail=ns.slice(1).map(n=>n.textContent.trim()).join(' ');}const tt=cs.textTransform;
  const fs=parseFloat(cs.fontSize),fw=+cs.fontWeight>=650?700:+cs.fontWeight>=550?600:400,ls=parseFloat(cs.letterSpacing)||0;
  // group words into lines
  const rg=document.createRange(),words=[];const re=/\S+/g;let m;while((m=re.exec(s))){rg.setStart(tn,m.index);rg.setEnd(tn,m.index+m[0].length);const rr=rg.getClientRects()[0];if(rr&&rr.width)words.push({w:m[0],r:rr});}
  const lines=[];words.forEach(w=>{const L=lines[lines.length-1];if(L&&Math.abs(L.top-w.r.top)<fs*0.5){L.t+=' '+w.w;L.rt=w.r.right;}else lines.push({top:w.r.top,h:w.r.height,x:w.r.left,t:w.w});lines[lines.length-1].rt=w.r.right;});
  let al='start';{let a=p;while(a&&a!==root){const ac=getComputedStyle(a);if(/^(table-cell|block|list-item)$/.test(ac.display)||a.tagName==='TD'||a.tagName==='TH'){const ta=ac.textAlign;al=(ta==='right'||ta==='end')?'end':ta==='center'?'middle':'start';break;}a=a.parentElement;}}
  if(tail&&lines.length)lines[lines.length-1].tail=' '+tail;
  lines.forEach(L=>{let t=(tt==='uppercase'?L.t.toUpperCase():L.t)+(L.tail||'');const y=L.top+(L.h-fs)/2+fs*0.82-oy;
   const ax=al==='end'?L.rt:al==='middle'?(L.x+L.rt)/2:L.x;
   out.push(`<text x="${(ax-ox).toFixed(1)}" y="${y.toFixed(1)}"${al!=='start'?` text-anchor="${al}"`:''} font-family="Inter" font-size="${fs}" font-weight="${fw}"${ls?` letter-spacing="${ls.toFixed(2)}"`:''} fill="${c.hex}">${esc(t)}</text>`);
   if(cs.textDecorationLine.indexOf('underline')>=0){rg.setStart(tn,0);rg.setEnd(tn,s.length);const rr=rg.getBoundingClientRect();out.push(`<rect x="${(rr.left-ox).toFixed(1)}" y="${(y+2.5).toFixed(1)}" width="${rr.width.toFixed(1)}" height="1" fill="${c.hex}"/>`);}});
 };
 const field=(e,ox,oy)=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);let v=e.value||e.placeholder||'';if(e.type==='date'&&!e.value)v='mm/dd/yyyy';if(!v)return;const ph=!e.value;const fs=parseFloat(cs.fontSize);
  out.push(`<text x="${(r.left+parseFloat(cs.paddingLeft)-ox).toFixed(1)}" y="${(r.top+r.height/2+fs*0.35-oy).toFixed(1)}" font-family="Inter" font-size="${fs}" fill="${ph?'#8a9aab':'#10243e'}">${esc(v)}</text>`);};
 const svg=(e,ox,oy)=>{const r=e.getBoundingClientRect();if(r.width<1)return;const c=getComputedStyle(e).color;const cl=e.cloneNode(true);
  cl.setAttribute('x',(r.left-ox).toFixed(1));cl.setAttribute('y',(r.top-oy).toFixed(1));cl.setAttribute('width',r.width.toFixed(1));cl.setAttribute('height',r.height.toFixed(1));cl.removeAttribute('style');cl.removeAttribute('class');
  // computed fill/stroke onto every shape
  const src=[e,...e.querySelectorAll('*')],dst=[cl,...cl.querySelectorAll('*')];src.forEach((n,i)=>{if(n===e&&false)return;const k=getComputedStyle(n);const d=dst[i];
   if(n.tagName!=='svg'){const f=col(k.fill),s=col(k.stroke);d.setAttribute('fill',f?f.hex:'none');if(s){d.setAttribute('stroke',s.hex);d.setAttribute('stroke-width',k.strokeWidth);d.setAttribute('stroke-linecap',k.strokeLinecap);d.setAttribute('stroke-linejoin',k.strokeLinejoin);}if(n.tagName==='text'){d.setAttribute('font-family','Inter');d.removeAttribute('stroke');d.removeAttribute('stroke-width');d.removeAttribute('paint-order');d.removeAttribute('stroke-linecap');d.removeAttribute('stroke-linejoin');}}
   d.removeAttribute('class');});
  cl.querySelectorAll('title').forEach(t=>t.remove());
  out.push(new XMLSerializer().serializeToString(cl).replace(/ xmlns="[^"]*"/g,''));};
 const walk=(e,ox,oy)=>{if(e.nodeType===3){text(e,ox,oy);return;}if(e.nodeType!==1)return;const cs=getComputedStyle(e);if(cs.display==='none')return;
  if(e.tagName==='svg'){svg(e,ox,oy);return;}
  box(e,ox,oy);if(e.tagName==='INPUT'||e.tagName==='SELECT'){if(e.classList.contains('search')){const r=e.getBoundingClientRect();out.push(`<svg x="${(r.left+11-ox).toFixed(1)}" y="${(r.top+r.height/2-7-oy).toFixed(1)}" width="14" height="14" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="#8a9aab" stroke-width="2"/><path d="M20 20l-3.5-3.5" fill="none" stroke="#8a9aab" stroke-width="2" stroke-linecap="round"/></svg>`);}field(e,ox,oy);return;}
  e.childNodes.forEach(c=>walk(c,ox,oy));};
 // sections: sidebar, then each direct child of the dashboard
 const secs=[];const side=root.querySelector('.side');if(side)secs.push(['Sidebar',side]);
 const dash=root.querySelector('.main > div');[...dash.children].forEach((c,i)=>{const n=c.querySelector('h2,.ptitle,h3')?.textContent||c.className;secs.push([(c.className.split(' ')[0]||'section')+' - '+n.trim().slice(0,60),c]);});
 const parts=[];const mainR=root.querySelector('.main').getBoundingClientRect();
 out.push(`<rect x="0" y="0" width="${R.width}" height="${R.height}" fill="#eef2f6"/>`);parts.push(`<g id="Page background">${out.splice(0).join('')}</g>`);
 secs.forEach(([n,el])=>{walk(el,R.left,R.top);parts.push(`<g id="${esc(n)}">${out.splice(0).join('')}</g>`);});
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(R.width)}" height="${Math.round(R.height)}" viewBox="0 0 ${Math.round(R.width)} ${Math.round(R.height)}">${parts.join('')}</svg>`;
};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1600,height:1000}});
const base='file://'+__dirname+'/out/index.html?ts=standard';
const shots=[['01 Bank-wide Oversight - Active EDRMS sites','bw',0],['02 Bank-wide Oversight - EDRMS users','bw',1],['03 Bank-wide Oversight - Documents in EDRMS','bw',2],['04 Bank-wide Oversight - Records declared','bw',3],
 ['05 Department Insights - Sites','dp',0],['06 Department Insights - Site visitors','dp',1],['07 Department Insights - Documents','dp',2],['08 Department Insights - Records declared','dp',3],['09 Department Insights - Physical Counterparts','dp',4]];
for(const [name,d,k] of shots){await p.goto(base+'&d='+d);await p.waitForTimeout(500);if(k){await (await p.$$('.kpi'))[k].click();await p.waitForTimeout(300);}
 await p.mouse.move(0,0);const s=await p.evaluate(SER);fs.writeFileSync(__dirname+'/svg/'+name+'.svg',s);console.log(name,(s.length/1024).toFixed(0)+'KB');}
await b.close();})();
