const fs=require('fs'),{execSync}=require('child_process');
execSync('rm -rf _v && mkdir _v && cd _v && unzip -q ../../../../../../home/user/Jim/EDRMS_Workshop_Slides_20260825.pptx 2>/dev/null || (cd _v && unzip -q /home/user/Jim/EDRMS_Workshop_Slides_20260825.pptx)');
const EMU=914400, W=13.333*EMU, H=7.5*EMU;
const dir='_v/ppt/slides';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.xml'))
  .sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0]);
let bad=0;
files.forEach(f=>{
  const xml=fs.readFileSync(dir+'/'+f,'utf8');
  const offs=[...xml.matchAll(/<a:off x="(-?\d+)" y="(-?\d+)"\/><a:ext cx="(\d+)" cy="(\d+)"\/>/g)];
  const texts=[...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m=>m[1]);
  let issues=[];
  offs.forEach(m=>{
    const x=+m[1],y=+m[2],cx=+m[3],cy=+m[4];
    if(x<0||y<0) issues.push(`negative pos ${(x/EMU).toFixed(2)},${(y/EMU).toFixed(2)}`);
    if(x+cx>W+1000) issues.push(`right overflow to ${((x+cx)/EMU).toFixed(2)}" (max 13.33)`);
    if(y+cy>H+1000) issues.push(`bottom overflow to ${((y+cy)/EMU).toFixed(2)}" (max 7.5)`);
  });
  const n=f.match(/\d+/)[0];
  if(issues.length){bad++;console.log(`SLIDE ${n}: ${issues.length} issue(s)`);
    [...new Set(issues)].slice(0,6).forEach(i=>console.log('   ! '+i));}
  else console.log(`slide ${n}: ok  (${offs.length} shapes, ${texts.length} text runs)`);
});
console.log(bad?`\n${bad} slide(s) with geometry problems`:'\nAll slides within bounds.');
