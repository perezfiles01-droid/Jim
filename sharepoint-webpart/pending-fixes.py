# Text fixes that Floot carries but index.html (GitHub Pages) does not yet,
# because GitHub only changes when the requester asks. Every SharePoint build
# must include them until GitHub is synced from Floot, then delete this file.
#   python3 sharepoint-webpart/pending-fixes.py   (writes sp-src.tmp.html)
#   cd sharepoint-webpart && REPORT_SOURCE=/home/user/Jim/sp-src.tmp.html npm run build
import re, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
s = s.replace('&#9662; Click to open', 'View breakdown <span aria-hidden="true">&#8250;</span>')
for o, n in [
    ('      var map=prepare(view);\n      html2canvas(view,{', '      var map=prepare(view), LW=document.documentElement.offsetWidth||1920;\n      html2canvas(view,{'),
    ('r.style.width="1920px";', 'r.style.width=LW+"px";'),
    ('backgroundColor:"#F4F6F9",windowWidth:1920,', 'backgroundColor:"#F4F6F9",windowWidth:LW,'),
]:
    assert o in s, o
    s = s.replace(o, n)
s, k = re.subn(r'<h2>Department insights</h2>(\s*)</div>', r'<h2>Department insights</h2>\1  <div class="bd">EDRMS use by department: sites, site visitors, documents, declared records and physical counterparts</div>\1</div>', s)
assert k == 1
s, k = re.subn(r'<h2>Library usage</h2>(\s*)</div>', r'<h2>Library usage</h2>\1  <div class="bd">Document libraries in EDRMS sites: documents, declared records, physical counterparts and active users</div>\1</div>', s)
assert k == 1
# Search box on the physical counterparts table (Bank-wide), with Export table
# beside it like the Sites table; the donut wrapper keeps it inside the card.
PHYS = [
    ('    const rows=sortedDepts.map(d=>[d.code+" - "+d.name, F(d.phys), F(d.rec),',
     '    const physQRaw=document.getElementById("bw-phys-search")?.value||"", physQ=physQRaw.trim().toLowerCase();\n'
     '    const rows=sortedDepts.filter(d=>!physQ||(d.code+" "+d.name).toLowerCase().includes(physQ)).map(d=>[d.code+" - "+d.name, F(d.phys), F(d.rec),'),
    ('       <div class="scrollx"><div class="dtab" id="bw-phys" style=',
     '       <div class="sites-search-wrap phys-search-wrap"><input class="sites-search" id="bw-phys-search" type="search" aria-label="Search by department / office / RM / RO" placeholder="Search by department / office / RM / RO" value="${physQRaw.replace(/"/g,"&quot;")}" /></div>\n'
     '       <div class="scrollx"><div class="dtab" id="bw-phys" style='),
    ('    document.querySelectorAll("#bw-phys-panel .hd").forEach(el=>el.onclick=()=>{',
     '    const physSearch=document.getElementById("bw-phys-search");\n'
     '    if(physSearch)physSearch.oninput=()=>{const v=physSearch.value;bwPhysPage=1;drawPhysPanel();setTimeout(()=>{const n=document.getElementById("bw-phys-search");if(n){n.focus();n.setSelectionRange(v.length,v.length);}},0);};\n'
     '    document.querySelectorAll("#bw-phys-panel .hd").forEach(el=>el.onclick=()=>{'),
    ('chart.append(donut,legend);scroll.parentElement.insertBefore(split,scroll);main.append(scroll);split.append(main,chart);',
     'chart.append(donut,legend);scroll.parentElement.insertBefore(split,scroll);split.append(main,chart);const physWrap=scope.querySelector(".phys-search-wrap");if(physWrap){const fi=document.activeElement&&physWrap.contains(document.activeElement)?document.activeElement:null,fp=fi?fi.selectionStart:0;main.append(physWrap);if(fi){fi.focus();fi.setSelectionRange(fp,fp);}}main.append(scroll);'),
]
for o, n in PHYS:
    assert s.count(o) == 1, o
    s = s.replace(o, n)
open(os.path.join(root, 'sp-src.tmp.html'), 'w', encoding='utf-8').write(s)
