const XLSX=require('xlsx');
const wb=XLSX.readFile('/home/user/Jim/EDRMS_Util_Dashboard_Gap_Checker_2026-08-21.xlsx',{cellStyles:true});
const tab={};
wb.SheetNames.forEach(n=>{
  const ws=wb.Sheets[n]; const ref=XLSX.utils.decode_range(ws['!ref']);
  for(let R=4;R<=ref.e.r;R++){
    const g=i=>{const c=ws[XLSX.utils.encode_cell({r:R,c:i})];return c?String(c.v||''):'';};
    const item=g(1).trim(); if(!item) continue;
    const c1=ws[XLSX.utils.encode_cell({r:R,c:1})];
    const f=(c1&&c1.s)?(c1.s.fgColor||c1.s.bgColor||{}):{};
    const col=f.rgb||(f.theme!==undefined?'theme'+f.theme:'NONE');
    const why=g(5).trim(), need=g(6).trim(), proto=g(3).trim();
    let kind='(no why)';
    if(/^Built, but relabelled/i.test(why))kind='Built, relabelled';
    else if(/^Not bult, but replaced|^Not built, but replaced/i.test(why))kind='Replaced with';
    else if(/^Removed/i.test(why))kind='Removed';
    else if(why)kind='other why';
    const k=col+' | proto='+proto+' | '+kind+' | need='+(need?'yes':'no');
    tab[k]=(tab[k]||0)+1;
  }
});
Object.entries(tab).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(String(v).padStart(4)+'  '+k));
