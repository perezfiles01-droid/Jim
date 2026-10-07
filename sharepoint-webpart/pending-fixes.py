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
open(os.path.join(root, 'sp-src.tmp.html'), 'w', encoding='utf-8').write(s)
