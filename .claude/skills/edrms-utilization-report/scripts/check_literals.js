/* The static half of the fabricated-constant sweep.
 *
 * check_constants.js drives the page and catches a fabricated constant by its
 * effect: a column that never varies, or two columns locked in a fixed ratio.
 * That only works for numbers that reach a TABLE. The worst constant this
 * project has had reached neither: "average monthly growth" was the string
 * "2.4%" printed in a KPI tile, calculated from nothing, and no amount of
 * walking tables would ever have found it. LIB_GROWTH=0.107 sat in DATA for
 * days without being displayed at all, waiting for somebody to use it.
 *
 * So this script reads the source instead, and flags the two shapes:
 *
 *   1. a percentage written as a literal string, "2.4%"
 *   2. a data value multiplied by a fraction, or divided by a magic number
 *
 * Shape 2 has legitimate uses, unit conversion and formatting among them, so
 * the allowlist below carries every accepted case WITH ITS REASON. That is
 * the point of the file: a new fraction applied to a data value fails the
 * build, and the only way to pass it is to write down why it is not an
 * invented ratio. An unexplained 0.34 cannot get back in quietly.
 *
 *   node check_literals.js /home/user/Jim/index.html
 */
const fs=require("fs");
const path=process.argv[2]||"/home/user/Jim/index.html";
const src=fs.readFileSync(path,"utf8");

/* Blank out comment bodies but keep the newlines, so line numbers still
   point at the real thing and the historical notes in the source, which
   quote every constant that was removed, do not trip the check. */
const code=src
  .replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g," "))
  .replace(/(^|[^:])\/\/[^\n]*/g,(m,p)=>p+m.slice(p.length).replace(/./g," "));

/* Accepted uses, each with the reason it is not a fabricated ratio. The key
   is matched against the offending line. */
const ALLOW=[
  [/v\/1024|\/1024\)\.toFixed/,     "unit conversion, bytes to gigabytes to terabytes"],
  [/\(v\/1000\)/,                   "axis label formatting, thousands to k"],
  [/TOTAL_DOCS\/1e6/,               "tile formatting, documents to millions"],
  [/w\.push\(0\.6\+m\*0\.08/,       "monthly() weight generator, shapes a demo series and is displayed as nothing"],
  [/out\.push\(0\.55\+\(x-Math\.floor\(x\)\)\*1\.1\)/,
                                    "weights() generator, the same, and deliberately not periodic"],
  [/Math\.sin\(\(i\+1\)\*\(seed\+1\)\*12\.9898\)\*43758\.5453/,
                                    "weights() hash constants, a pseudo random source and not a measure"],
  [/Math\.max\(1,v\)\*\(0\.72\+w\[i\]\*0\.5\)/,
    "weightsLike() jitter. Multiplies a WEIGHT, not a displayed figure, and w[i] varies per "+
    "row, so the resulting share differs down the column rather than repeating"],
  [/Math\.round\(ceiling\*\(0\.25\+x\*0\.45\)\)/,
    "per-site distinct-count shaping. x is the row's own weight, so the count varies per site; "+
    "the result is then clamped to [1, min(users, things)], which is what makes the row possible "+
    "rather than what makes it plausible"],
  [/Math\.floor\(u\*0\.6\)/,
    "a CEILING on how many of a department's users may be 'never accessed', not a displayed figure: "+
    "the count itself comes from DATA.USERS_NEVER and the cap only decides where it lands"],
  [/DATA\.DOCUMENTS\*PERM_REC\/DATA\.LABEL_TOTAL/,
    "documents apportioned to permanent retention by its record share. Flagged deliberately: "+
    "it is an apportionment, not a measurement, and it goes when the term to document join arrives, audit question 13"],
];

let fail=0,pass=0;
const report=(line,i,why)=>{
  if(GEOMETRY.test(line))return;
  const hit=ALLOW.find(([re])=>re.test(line));
  if(hit)return;
  fail++;
  console.log(`  FAIL  ${path.split("/").pop()}:${i+1}  ${why}`);
  console.log(`        ${line.trim().slice(0,110)}`);
};

const lines=code.split("\n");

/* Geometry is not measurement. width="100%" on an SVG, a viewBox, a data URI
   icon: none of these are figures a reader takes away, and they use the same
   characters as the things that are. Skipped by shape rather than added to
   the allowlist one at a time. */
const GEOMETRY=/(width|height|x|y|cx|cy|r|rx|ry|stroke-width|font-size|flex|basis|left|top)\s*=?\s*["'][^"']*%|viewBox|data:image\/svg|preserveAspectRatio/;

console.log("No percentage is written as a literal string");
lines.forEach((l,i)=>{
  const m=/"[\s]*-?\d+(\.\d+)?\s*%[\s]*"|'[\s]*-?\d+(\.\d+)?\s*%[\s]*'/.exec(l);
  if(m)report(l,i,`a percentage written out as the literal ${m[0]}, so it is not computed from anything`);
});

console.log("No data value is scaled by an unexplained constant");
lines.forEach((l,i)=>{
  /* a fraction applied to something with a name */
  if(/[A-Za-z_$][A-Za-z0-9_$.\[\]]*\s*\*\s*0\.\d+/.test(l)||
     /0\.\d+\s*\*\s*[A-Za-z_$][A-Za-z0-9_$.\[\]]*/.test(l))
    report(l,i,"a data value multiplied by a fraction. If the fraction is invented, the column it feeds "+
               "will read the same value on every row");
  /* a division by a magic number of three digits or more */
  if(/[A-Za-z_$][A-Za-z0-9_$.\[\]]*\s*\/\s*\d{3,}\b/.test(l))
    report(l,i,"a data value divided by a magic number. This is how the 3400 storage divisor got in: "+
               "an assumed average document size printed as a computed total");
});

if(!fail){pass++;console.log("  pass  no unexplained constant scales a data value anywhere in the source");}

console.log("\n==============================================");
console.log(`pass ${pass}   fail ${fail}`);
process.exit(fail?1:0);
