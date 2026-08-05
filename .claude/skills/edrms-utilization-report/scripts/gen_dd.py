import re, json, html

md = open('/home/user/Jim/utilizationdb.md').read()

def rows(section_start, section_end=None):
    seg = md[md.index(section_start):]
    if section_end: seg = seg[:seg.index(section_end)]
    out=[]
    for line in seg.split('\n'):
        line=line.strip()
        if not re.match(r'^\| \d+ \|', line): continue
        out.append([c.strip() for c in line.split('|')][1:-1])
    return out

def md2html(t):
    t = t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    return t

def esc(t): return md2html(t).replace('\\','\\\\').replace('"','\\"').replace('$','\\$').replace('`','\\`')

# ---- the two column definition tables (8 columns each) ----
t1 = rows('## TABLE 1. UTILIZATION REPORT TABLE', '**37 columns.**')
t2 = rows('## TABLE 2. SITE ACTIVITY TABLE', '**20 columns.**')
assert len(t1)==37 and len(t2)==20, (len(t1), len(t2))

# ---- the two traceability tables (6 columns each) ----
u1 = rows('### Table 1: Utilization Report Table', '### Table 2: Site Activity Table')
u2 = rows('### Table 2: Site Activity Table', '## WHERE TO GO FOR EACH SOURCE')
assert len(u1)==37 and len(u2)==20, (len(u1), len(u2))

def status(txt):
    t = txt.replace('*','')
    if 'Gap ' in t: return 'gap'
    if 'Planned' in t: return 'planned'
    if 'NEW' in t: return 'new'
    if 'Derived' in t: return 'derived'
    return 'have'

KEY = {'SnapshotDate','FormatGroup','ListId','SiteUrl','SiteName','LibraryName',
       'IsDeclaredRecord','CreatedDate','HasPhysical','IsDeleted',
       'SiteVisits7','SiteVisits30','SiteVisits90'}

def cardcols(defs, uses, tname):
    out=[]
    for d,u in zip(defs,uses):
        name, typ, desc = d[1], d[2], d[3]
        assert name==u[1], (tname,name,u[1])
        st = status(u[3])
        flag = 'gap' if st=='gap' else ('key' if name in KEY else '')
        out.append([name, typ, md2html(desc), flag])
    return out

def usecols(uses):
    return [[u[1], md2html(u[2]), status(u[3]), md2html(u[4]), md2html(u[5])] for u in uses]

def js(arr, indent):
    pad=' '*indent
    return '\n'.join(pad+'['+','.join('"'+esc(c)+'"' for c in r)+'],' for r in arr).rstrip(',')

c1, c2 = cardcols(t1,u1,'T1'), cardcols(t2,u2,'T2')

# figure-side table: | Dashboard | Figure | Table | How | Ready? |
seg = md[md.index('## WHERE EVERY FIGURE COMES FROM'):md.index('## WHERE TO GO FOR EACH SOURCE')]
tr=[]
for line in seg.split('\n'):
    line=line.strip()
    if not line.startswith('| ') or line.startswith('| ---') or line.startswith('| Dashboard'): continue
    cells=[c.strip() for c in line.split('|')][1:-1]
    if len(cells)!=5: continue
    r=cells[4]
    st = 'gap' if 'Blocked' in r else 'usage' if 'usage' in r else 'scan' if 'scan' in r else 'ok'
    tr.append([cells[0], cells[1], cells[2], md2html(cells[3]), st])
assert len(tr)==23, len(tr)

open('gen_out.js','w').write(json.dumps({
 'c1':c1,'c2':c2,'u1':usecols(u1),'u2':usecols(u2),'tr':tr}))
print('T1',len(c1),'T2',len(c2))
from collections import Counter
print('T1 status', Counter(status(u[3]) for u in u1))
print('T2 status', Counter(status(u[3]) for u in u2))
