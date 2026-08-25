const d=require('./gapdata.json');
let gapsWithNeed=0, gapsNoNeed=0, builtWithNeed=0;
d.tabs.forEach(t=>{
  const gn=t.gaps.filter(g=>g.need).length;
  gapsWithNeed+=gn; gapsNoNeed+=t.gaps.length-gn;
  builtWithNeed+=t.needs.filter(n=>/^y/i.test(n.inProto)).length;
  if(t.gaps.length) console.log(t.name+': gaps '+t.gaps.length+' | with a stated need '+gn+' | without '+(t.gaps.length-gn));
});
console.log('\nGAPS total          :',gapsWithNeed+gapsNoNeed);
console.log('  with stated need  :',gapsWithNeed,' <- unblocked by deps 1-4');
console.log('  no stated need    :',gapsNoNeed,' <- need your steer');
console.log('BUILT rows carrying an ASK:',builtWithNeed,' <- built but unsourced (mostly Project Insights)');
