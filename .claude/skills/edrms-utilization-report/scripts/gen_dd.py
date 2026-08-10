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
t1 = rows('## TABLE 1. UTILIZATION REPORT TABLE', '**36 columns**')
t2 = rows('## TABLE 2. SITE ACTIVITY TABLE', '**19 columns.**')
t3 = rows('## TABLE 3. USER ACTIVITY TABLE', '**7 columns.**')
t4 = rows('## TABLE 4. FILE PLAN TABLE', '**8 columns.**')
assert (len(t1),len(t2),len(t3),len(t4))==(36,19,7,8), (len(t1),len(t2),len(t3),len(t4))

# ---- the four traceability tables (6 columns each) ----
u1 = rows('### Table 1: Utilization Report Table', '### Table 2: Site Activity Table')
u2 = rows('### Table 2: Site Activity Table', '### Table 3: User Activity Table')
u3 = rows('### Table 3: User Activity Table', '### Table 4: File Plan Table')
u4 = rows('### Table 4: File Plan Table', '## WHERE EVERY FIGURE COMES FROM')
assert (len(u1),len(u2),len(u3),len(u4))==(36,19,7,8), (len(u1),len(u2),len(u3),len(u4))

def status(txt):
    t = txt.replace('*','')
    if 'Gap ' in t: return 'gap'
    if 'Planned' in t: return 'planned'
    if 'NEW' in t: return 'new'
    if 'Derived' in t: return 'derived'
    return 'have'

KEY = {'SnapshotDate','FormatGroup','ListId','SiteUrl','SiteName','LibraryName',
       'IsDeclaredRecord','CreatedDate','HasPhysical','IsDeleted',
       'SiteVisits7','SiteVisits30','SiteVisits90','LibraryCount',
       'LastActivityDate','UserPrincipalName','EDRMSDueDateForDisposal',
       'LibraryLastActivityDate','CategoryName'}

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

c1, c2, c3, c4 = cardcols(t1,u1,'T1'), cardcols(t2,u2,'T2'), cardcols(t3,u3,'T3'), cardcols(t4,u4,'T4')

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
    tr.append([md2html(cells[0]), md2html(cells[1]), md2html(cells[2]), md2html(cells[3]), st])
assert len(tr)>=46, len(tr)   # grew again with the section 5 and 8 metrics

open('gen_out.js','w').write(json.dumps({
 'c1':c1,'c2':c2,'c3':c3,'c4':c4,
 'u1':usecols(u1),'u2':usecols(u2),'u3':usecols(u3),'u4':usecols(u4),'tr':tr}))
print('T1',len(c1),'T2',len(c2),'T3',len(c3),'T4',len(c4),'figures',len(tr))
from collections import Counter
for nm,u in (('T1',u1),('T2',u2),('T3',u3),('T4',u4)):
    print(nm,'status',Counter(status(x[3]) for x in u))
