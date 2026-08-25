const XLSX=require('xlsx'), fs=require('fs');
const wb=XLSX.readFile('/home/user/Jim/EDRMS_Util_Dashboard_Gap_Checker_2026-08-21.xlsx');
const out={tabs:[],totals:{reqs:0,built:0,notBuilt:0,blank:0}};
wb.SheetNames.forEach(n=>{
  const rows=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:''});
  const data=rows.slice(4).filter(r=>String(r[1]||'').trim());
  const rec=data.map(r=>({item:String(r[1]).trim(),type:String(r[2]).trim(),
    inProto:String(r[3]).trim(),why:String(r[5]).trim(),need:String(r[6]).trim(),q:String(r[7]).trim()}));
  const built=rec.filter(r=>/^y/i.test(r.inProto)).length;
  const notBuilt=rec.filter(r=>/^n/i.test(r.inProto)).length;
  const blank=rec.length-built-notBuilt;
  out.tabs.push({name:n,reqs:rec.length,built,notBuilt,blank,
    gaps:rec.filter(r=>/^n/i.test(r.inProto)),
    needs:rec.filter(r=>r.need)});
  out.totals.reqs+=rec.length; out.totals.built+=built;
  out.totals.notBuilt+=notBuilt; out.totals.blank+=blank;
});
fs.writeFileSync('gapdata.json',JSON.stringify(out,null,1));
console.log('TOTALS',JSON.stringify(out.totals));
out.tabs.forEach(t=>console.log(' ',t.name,'| reqs',t.reqs,'built',t.built,'gaps',t.notBuilt,'| needs',t.needs.length));
