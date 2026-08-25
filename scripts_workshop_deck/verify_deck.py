"""Verify the workshop deck: structure, geometry, and the no-numbers rule."""
import re, sys, zipfile
from xml.dom.minidom import parseString

DECK = "/home/user/Jim/EDRMS_Utilization_Confirmation_Workshop.pptx"
EMU = 914400
W, H = 10.0 * EMU, 5.625 * EMU
TOL = 2000
CHECK = [int(a) for a in sys.argv[1:]] or list(range(4, 16))

z = zipfile.ZipFile(DECK)
fails = 0

if z.testzip() is not None:
    print("ZIP CORRUPT"); sys.exit(1)
print("zip integrity: OK")

for n in [x for x in z.namelist() if x.endswith((".xml", ".rels"))]:
    try:
        parseString(z.read(n))
    except Exception as e:
        print("MALFORMED", n, e); fails += 1
print("xml well-formed: all parts parse" if not fails else f"{fails} malformed")

# Catch requirement tallies, not legitimate numerals. Time windows inside a
# metric name ("within 90 days", "12 months") are content, not counts, and so
# are single-digit question numbers. Anything else numeric is a tally.
TIME_OK = re.compile(r"\b\d{1,3}\s*(?:and\s+\d{1,3}\s*)?"
                     r"(?:day|days|month|months|year|years|hour|hours)\b", re.I)
TALLY = re.compile(r"\b\d{2,}\b")

for i in CHECK:
    name = f"ppt/slides/slide{i}.xml"
    if name not in z.namelist():
        continue
    x = z.read(name).decode("utf-8")
    issues = []

    # geometry: any shape carrying text or fill must sit on the slide
    for sp in x.split("<p:sp>")[1:]:
        m = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/><a:ext cx="(\d+)" cy="(\d+)"', sp)
        if not m:
            continue
        px, py, cx, cy = map(int, m.groups())
        txt = "".join(re.findall(r"<a:t>([^<]*)</a:t>", sp)).strip()
        spPr = re.search(r"<p:spPr>.*?</p:spPr>", sp, re.S)
        body = spPr.group(0) if spPr else ""
        body = re.sub(r"<a:ln[\s>].*?</a:ln>", "", body, flags=re.S)
        filled = "<a:solidFill>" in body
        if not txt and not filled:
            continue
        label = (txt[:30] or "(panel)")
        if px < -TOL or py < -TOL:
            issues.append(f'"{label}" negative position')
        if px + cx > W + TOL:
            issues.append(f'"{label}" runs to {(px+cx)/EMU:.2f}in wide (max 10.00)')
        if py + cy > H + TOL:
            issues.append(f'"{label}" runs to {(py+cy)/EMU:.2f}in deep (max 5.63)')

    texts = re.findall(r"<a:t>([^<]*)</a:t>", x)
    tallies = [t for t in texts if TALLY.search(TIME_OK.sub("", t))]
    if tallies:
        issues.append("NUMBER FOUND: " + " | ".join(tallies)[:120])

    if issues:
        fails += 1
        print(f"SLIDE {i}: {len(issues)} issue(s)")
        for s in dict.fromkeys(issues):
            print("   !", s)
    else:
        shapes = x.count("<p:sp>")
        print(f"slide {i:>2}: ok   {shapes} shapes, {len(texts)} runs, no tallies")

print("\nFAILED" if fails else "\nAll checked slides clean.")
sys.exit(1 if fails else 0)
