/* Geometry check for the workshop deck.
   Parses each shape individually so deliberate decorative bleed (unfilled
   outline shapes carrying no text) is allowed, while any content shape —
   anything with text, or any filled panel — must sit inside the slide. */
const fs = require("fs"), { execSync } = require("child_process");

const PPTX = "/home/user/Jim/EDRMS_Workshop_Slides_20260825.pptx";
execSync(`rm -rf _v && mkdir _v && cd _v && unzip -q "${PPTX}"`);

const EMU = 914400, W = 13.333 * EMU, H = 7.5 * EMU, TOL = 1000;
const dir = "_v/ppt/slides";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".xml"))
  .sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]);

let bad = 0, totalShapes = 0, decorative = 0;

files.forEach(f => {
  const xml = fs.readFileSync(dir + "/" + f, "utf8");
  const shapes = xml.split(/<p:sp>/).slice(1);
  const issues = [];
  let content = 0;

  shapes.forEach(sp => {
    const m = sp.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/><a:ext cx="(\d+)" cy="(\d+)"\/>/);
    if (!m) return;
    totalShapes++;
    const [x, y, cx, cy] = m.slice(1).map(Number);
    const texts = [...sp.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(t => t[1]).join("");
    // Strip the line block first: a stroke colour is a solidFill too, and an
    // outline-only shape must still count as unfilled.
    const spPr = (sp.match(/<p:spPr>[\s\S]*?<\/p:spPr>/) || [""])[0]
      .replace(/<a:ln[\s>][\s\S]*?<\/a:ln>/g, "")
      .replace(/<a:ln[^>]*\/>/g, "");
    const filled = /<a:solidFill>/.test(spPr);
    const isDecor = !texts.trim() && !filled;

    if (isDecor) { decorative++; return; }
    content++;

    const label = texts.trim().slice(0, 34) || "(filled panel)";
    if (x < -TOL || y < -TOL)
      issues.push(`"${label}" negative position`);
    if (x + cx > W + TOL)
      issues.push(`"${label}" runs to ${((x + cx) / EMU).toFixed(2)}" wide (max 13.33)`);
    if (y + cy > H + TOL)
      issues.push(`"${label}" runs to ${((y + cy) / EMU).toFixed(2)}" deep (max 7.5)`);
  });

  const n = f.match(/\d+/)[0];
  if (issues.length) {
    bad++;
    console.log(`SLIDE ${n}: ${issues.length} issue(s)`);
    [...new Set(issues)].slice(0, 8).forEach(i => console.log("   ! " + i));
  } else {
    console.log(`slide ${String(n).padStart(2)}: ok   ${content} content shapes`);
  }
});

console.log(bad
  ? `\n${bad} slide(s) with geometry problems`
  : `\nAll ${files.length} slides clean. ${totalShapes} shapes checked, ${decorative} decorative (bleed allowed).`);
process.exit(bad ? 1 : 0);
