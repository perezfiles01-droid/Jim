const XLSX=require('xlsx');
const wb=XLSX.readFile('/home/user/Jim/EDRMS_Util_Dashboard_Gap_Checker_2026-08-21.xlsx',{cellStyles:true});
wb.SheetNames.forEach(n=>{
  const ws=wb.Sheets[n]; const ref=XLSX.utils.decode_range(ws['!ref']);
  const tally={};
  for(let R=4;R<=ref.e.r;R++){
    for(let Ci=0;Ci<=8;Ci++){
      const a=XLSX.utils.encode_cell({r:R,c:Ci}); const c=ws[a];
      if(!c||!c.s)continue;
      const f=c.s.fgColor||c.s.bgColor||{};
      const rgb=f.rgb||f.theme!==undefined?('theme'+f.theme+'/'+(f.rgb||'')):null;
      if(!rgb)continue;
      const key=rgb+' col'+Ci;
      tally[key]=tally[key]||{n:0,ex:[]};
      tally[key].n++;
      if(tally[key].ex.length<2&&c.v)tally[key].ex.push(String(c.v).slice(0,55));
    }
  }
  const keys=Object.keys(tally).filter(k=>tally[k].n>0);
  if(!keys.length)return;
  console.log('\n=== '+n+' ===');
  keys.sort((a,b)=>tally[b].n-tally[a].n).slice(0,14).forEach(k=>
    console.log('  '+k.padEnd(28)+' x'+String(tally[k].n).padStart(3)+'  '+tally[k].ex.join(' | ')));
});
