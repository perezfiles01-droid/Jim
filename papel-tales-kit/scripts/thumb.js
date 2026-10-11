const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:800}});
await p.addInitScript(()=>{window.requestAnimationFrame=()=>0});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(1500);
const d=await p.evaluate(()=>{const t=5.3;c.setTransform(1,0,0,1,0,0);
 sky('#1b1f4a','#6a3a8a');stars(t,70);
 [[180,150,'#ff6b6b',.9],[470,95,'#ffd166',1.3],[1120,140,'#4dd4ff',1.0],[930,80,'#7cf29c',1.5],[700,200,'#b388ff',.7]].forEach(f=>{
  const q=f[3]*.6;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=q*150;c.fillStyle=f[2];c.beginPath();c.arc(f[0]+Math.cos(a)*r,f[1]+Math.sin(a)*r,6,0,7);c.fill();c.globalAlpha=.5;c.beginPath();c.arc(f[0]+Math.cos(a)*r*.6,f[1]+Math.sin(a)*r*.6,4,0,7);c.fill();c.globalAlpha=1}c.restore()});
 hills(470,'#3d2a5a',60,3);banderitas(255,t);ground(560,'#e8c98a');
 // glow behind characters
 c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(880,520,20,880,520,380);g.addColorStop(0,'rgba(255,190,90,.55)');g.addColorStop(1,'rgba(255,190,90,0)');c.fillStyle=g;c.fillRect(400,150,900,600);c.restore();

 carabao(760,700,1.45,t,false);tarsier(1060,680,1.5,t,true);
 // headline
 c.save();c.translate(70,140);c.rotate(-.04);c.font='900 132px Fredoka,sans-serif';c.lineJoin='round';
 [['WHY',0],['FIESTA?',135]].forEach(([w,y],i)=>{c.lineWidth=22;c.strokeStyle='#1b1f4a';c.strokeText(w,0,y+100);c.fillStyle=i?'#ffd166':'#ffffff';c.fillText(w,0,y+100)});c.restore();
 c.save();c.translate(80,470);c.rotate(-.04);sh(true,6);c.fillStyle='#e63946';c.beginPath();rr(0,0,430,70,12);c.fill();sh(false);
 c.font='700 40px Fredoka,sans-serif';c.fillStyle='#fff';c.fillText('The real origin story',24,49);c.restore();
 // flag stripe badge
 c.save();c.translate(80,570);c.font='700 34px Fredoka,sans-serif';c.lineWidth=8;c.strokeStyle='#1b1f4a';c.strokeText('🇵🇭 Since before 1521',0,0);c.fillStyle='#fff';c.fillText('🇵🇭 Since before 1521',0,0);c.restore();
 c.fillStyle=grainPat||c.createPattern(grain,'repeat');c.fillRect(0,0,W,H);
 return cv.toDataURL('image/jpeg',.92)});
fs.writeFileSync('thumbnail.jpg',Buffer.from(d.split(',')[1],'base64'));await b.close()})();
