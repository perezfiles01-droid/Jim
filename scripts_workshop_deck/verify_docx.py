"""Verify the facilitation script docx: structure, headings, tables, text."""
import re, sys, zipfile
from xml.dom.minidom import parseString

DOC = "/home/user/Jim/EDRMS_Workshop_Facilitation_Script_20260825.docx"
z = zipfile.ZipFile(DOC)
fails = 0

print("zip integrity:", "OK" if z.testzip() is None else "CORRUPT")
parts = [n for n in z.namelist() if n.endswith((".xml", ".rels"))]
for n in parts:
    try:
        parseString(z.read(n))
    except Exception as e:
        print("MALFORMED", n, e); fails += 1
print(f"xml parts: {len(parts)} all parse" if not fails else f"{fails} malformed")

x = z.read("word/document.xml").decode("utf-8")

# headings
heads = []
for m in re.finditer(r"<w:p\b[^>]*>(.*?)</w:p>", x, re.S):
    para = m.group(1)
    hs = re.search(r'<w:pStyle w:val="Heading(\d)"', para)
    if hs:
        t = "".join(re.findall(r"<w:t(?:\s[^>]*)?>([^<]*)</w:t>", para))
        heads.append((int(hs.group(1)), t))

print(f"\nheadings: {len(heads)}")
for lvl, t in heads:
    print("  " + "  " * (lvl - 1) + ("# " * lvl) + t)

tables = len(re.findall(r"<w:tbl>", x))
rows = len(re.findall(r"<w:tr\b", x))
paras = len(re.findall(r"<w:p\b", x))
texts = re.findall(r"<w:t(?:\s[^>]*)?>([^<]*)</w:t>", x)
words = sum(len(t.split()) for t in texts)
print(f"\ntables: {tables}   rows: {rows}   paragraphs: {paras}   words: ~{words}")

has_toc = "TOC \\o" in x or "TableOfContents" in x or 'w:instr' in x and 'TOC' in x
print("TOC field present:", has_toc)
print("switch cues:", x.count("SWITCH NOW"))

# The instruction was to avoid requirement volumes -- how many items exist,
# how many are built, how many are blocked. Durations, clock times, slide and
# tab references are navigation and must stay. So flag a numeral only when it
# sits next to a word that makes it a count of requirements.
COUNTY = re.compile(
    r"\b\d+\s*(?:of\s+\d+\s*)?"
    r"(?:requirements?|items?|rows?|gaps?|fields?|measures?|tiles?|columns?)\b|"
    r"\b(?:total|only|just|all|some)\s+\d+\b|"
    r"\b\d+\s*(?:are\s+)?(?:built|unbuilt|not built|blocked|missing|remaining)\b",
    re.I)
bad = [t for t in texts if COUNTY.search(t)]
if bad:
    print("\nREQUIREMENT TALLIES FOUND:", " | ".join(bad)[:300]); fails += 1
else:
    print("no requirement tallies: OK")

print("\nFAILED" if fails else "\nDocument structurally clean.")
sys.exit(1 if fails else 0)
