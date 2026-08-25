/* The deliberate sweep for fabricated constants.
 *
 * Why this file exists. Four invented constants were found in this prototype
 * by accident, one at a time, because somebody happened to ask what a number
 * meant: an "average monthly growth" of 2.4% that was a hardcoded string, a
 * "users declaring" figure that was users times 0.34, a storage divisor of
 * 3400, and two tautologies where a ratio column collapsed to a constant
 * because its numerator and denominator were split by the same weights.
 *
 * Finding the fifth in front of a bank committee is not acceptable, so this
 * script looks for the whole class on purpose rather than waiting to stumble
 * on it.
 *
 * What a fabricated constant is, precisely. Not "a hardcoded number": this
 * whole prototype is demo data and every base figure in DATA is hardcoded on
 * purpose and disclosed as such. The defect is narrower and much more
 * dangerous: a FIXED RATIO applied to a figure that is displayed next to it.
 * It has no source, it reads as though it were computed, and it produces a
 * column that says the same thing on every row whatever the data. A reader
 * sees "every department declares at 34%" and takes it for a finding.
 *
 * So the test is not "is this number hardcoded" but "does this number vary
 * when the data varies". Three checks:
 *
 *   1. CONSTANT COLUMN. A numeric column, percentage or bare ratio, reading
 *      identically down four or more rows.
 *   2. PROPORTIONAL COLUMNS. Two numeric columns whose ratio is identical
 *      down every row. This catches the constant even when the ratio column
 *      itself is not displayed: page views held at exactly seven times
 *      visitors is a fabricated 7 whether or not a "views per visitor"
 *      column prints it.
 *   3. Both of the above on EVERY drill of EVERY dashboard, and on every
 *      department. check_division.js already carried check 1, but it only
 *      ever saw the drill that happens to be open when a dashboard mounts,
 *      and it only matched values ending in "%". The two worst offenders
 *      found by this script were a bare "7.0" and a column behind a card
 *      nobody had clicked.
 *
 *   node check_constants.js /home/user/Jim/index.html
 */
const {chromium}=(()=>{for(const m of ["playwright-core","/tmp/node_modules/playwright-core"]){try{return require(m);}catch(e){}}throw new Error("playwright-core not found");})();
const path=process.argv[2]||"/home/user/Jim/index.html";
const url=path.startsWith("http")?path:"file://"+path;

let pass=0,fail=0;
const ok=(c,m)=>{c?(pass++,console.log("  pass  "+m)):(fail++,console.log("  FAIL  "+m));};

/* A cell is numeric if it is a plain number, a percentage or a size, with
   thousands separators allowed. Anything else, a name or a date, is skipped. */
function num(v){
  if(v==null)return null;
  const s=String(v).trim().replace(/,/g,"");
  const m=/^(-?\d+(?:\.\d+)?)\s*(%|GB|TB|M|k)?$/.exec(s);
  if(!m)return null;
  let n=parseFloat(m[1]);
  if(m[2]==="TB")n*=1024;
  if(m[2]==="M")n*=1e6;
  if(m[2]==="k")n*=1e3;
  return n;
}

/* Read every table currently on screen as head plus rows. */
const readTables=()=>document.querySelectorAll(".dtab").length===0?[]:
  [...document.querySelectorAll(".dtab")].map(t=>({
    head:[...(t.querySelector(".dhead")?.children||[])].map(c=>c.textContent.trim()),
    rows:[...t.querySelectorAll(".drow")].map(r=>[...r.children].map(c=>c.textContent.trim()))
  }));

const findings=[];

function inspect(label,tables){
  tables.forEach((t,ti)=>{
    if(t.rows.length<4)return;
    const ncol=Math.max(...t.rows.map(r=>r.length));
    const col=c=>t.rows.map(r=>num(r[c]));
    const name=c=>t.head[c]||("column "+(c+1));

    /* 1. a numeric column that never changes */
    for(let c=1;c<ncol;c++){
      const v=col(c).filter(x=>x!==null);
      if(v.length<4)continue;
      if(new Set(v).size===1)
        findings.push(`${label} / table ${ti+1} / "${name(c)}" reads ${v[0]} on all ${v.length} rows`);
    }

    /* A "share of the total" column is 100 times its own numerator over the
       column sum, so it is ALWAYS in a fixed ratio to that numerator, on
       every row, by definition. That is a legitimate derivation and not a
       fabricated constant, so the pair is exempted. Without this the check
       reports every share column on the suite and the real findings are lost
       in the noise. */
    const shareOf=(p,q)=>{
      const P=col(p),Q=col(q);
      const sum=Q.reduce((a,v)=>a+(v||0),0);
      if(!sum)return false;
      let n=0;
      for(let i=0;i<P.length;i++){
        if(P[i]===null||Q[i]===null)continue;
        if(Math.abs(P[i]-100*Q[i]/sum)>0.15)return false;
        n++;
      }
      return n>=4;
    };

    /* 2. two columns locked in a fixed ratio. Rounding moves the last digit,
       so agreement to four significant figures counts as locked: a genuine
       relationship between two independent measures does not survive that. */
    for(let a=1;a<ncol;a++)for(let b=a+1;b<ncol;b++){
      if(shareOf(a,b)||shareOf(b,a))continue;
      const A=col(a),B=col(b);
      const r=[];
      for(let i=0;i<A.length;i++){
        if(A[i]===null||B[i]===null||B[i]===0)continue;
        r.push(+(A[i]/B[i]).toPrecision(4));
      }
      if(r.length<4)continue;
      if(new Set(r).size===1&&r[0]!==1)
        findings.push(`${label} / table ${ti+1} / "${name(a)}" is exactly ${r[0]} times `+
                      `"${name(b)}" on all ${r.length} rows`);
    }
  });
}

(async()=>{
  const browser=await chromium.launch(
    {executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
  const page=await browser.newPage({viewport:{width:1500,height:1000}});
  const errors=[];
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(url);
  await page.waitForTimeout(500);

  /* Bank-wide: every top tile that opens a drill. */
  await page.evaluate(()=>switchTo("bw"));
  await page.waitForTimeout(200);
  const bwKeys=await page.$$eval("#bw-kpis .kpi[data-k]",e=>e.map(x=>x.dataset.k));
  console.log(`Bank-wide, ${bwKeys.length} drills`);
  for(const k of bwKeys){
    await page.click(`#bw-kpis .kpi[data-k="${k}"]`);
    await page.waitForTimeout(120);
    inspect(`bw:${k}`,await page.evaluate(readTables));
  }

  /* Department Insights: every drill, on every department. A constant that
     varies between departments but not within one is still a constant, and
     only the full cross product shows which. */
  await page.evaluate(()=>switchTo("dp"));
  await page.waitForTimeout(200);
  const depts=await page.$$eval("#dp-sel option",e=>e.map(x=>x.value));
  const dpKeys=await page.$$eval("#dp-kpis .kpi[data-k]",e=>e.map(x=>x.dataset.k));
  console.log(`Department Insights, ${depts.length} departments x ${dpKeys.length} drills`);
  for(const d of depts){
    await page.selectOption("#dp-sel",d);
    await page.waitForTimeout(80);
    for(const k of dpKeys){
      await page.click(`#dp-kpis .kpi[data-k="${k}"]`);
      await page.waitForTimeout(60);
      inspect(`dp:${d}:${k}`,await page.evaluate(readTables));
    }
  }

  /* The three dashboards with no drill rail. */
  for(const key of ["fp","rd","ra"]){
    await page.evaluate(k=>switchTo(k),key);
    await page.waitForTimeout(200);
    inspect(key,await page.evaluate(readTables));
  }

  console.log("");
  if(findings.length){
    /* The same fabricated constant shows up once per department, so collapse
       to the distinct shapes or the output is unreadable. */
    const seen=new Map();
    findings.forEach(f=>{
      const shape=f.replace(/^dp:[A-Z]+:/,"dp:*:").replace(/\d+(\.\d+)?/g,"N");
      if(!seen.has(shape))seen.set(shape,f);
    });
    [...seen.values()].forEach(f=>ok(false,f));
  }
  ok(findings.length===0,`no fabricated constant in any table (${findings.length} raw findings)`);

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
