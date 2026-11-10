"""Development Status slides for the Utilization Report (R2026.4), in the layout of
the client's example (#, Title, Enhancement Items, Phase, Status), on the ADB /
ITD template. Items and statuses come from the repo history: SESSION_HANDOFF.txt
(web part 1.0.0 to 1.0.37), handoffs/session_handoff_2026-10-22.txt (React web part
to 1.0.51) and git log (1.0.52 to 1.0.58). Status is of the REFERENCE web part in
the test tenant (7rkd12), not of the dev team's production build.
Run: python3 presentations/build_dev_status.py
"""
import os
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt
from lxml import etree
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'EDRMS_Utilization_Report_Development_Status.pptx')
AS_OF = 'As of 10th November'
PHASE = 'R2026.4'

DONE = 'Completed'
SAMPLE = 'Completed, sample data'
RAC = 'Completed, awaiting RAC data'
SRC = 'Built, source to confirm'
PROG = 'In progress'
OPEN = 'Pending decision'

# (Title, [(Enhancement item, Status)])  grouped by the backlog user stories
ITEMS = [
    ('Report Access and Navigation', [
        ('Side menu: 2 live dashboards, 4 future ones shown disabled', DONE),
        ('Collapsible menu, remembered per browser', DONE),
        ('"Data as of" Monday refresh stamp; date pickers end on that date', DONE),
        ('(i) information icons with plain definitions on every card', DONE),
        ('Page settings: default dashboard, sidebar, text size (Large default)', DONE)]),
    ('Bank-wide KPIs', [
        ('Four summary cards, each opening its breakdown', SAMPLE)]),
    ('Site Overview', [
        ('Top 10 chart and Sites by Department / Office / RM / RO table', SAMPLE),
        ('Search, Filter, sort, paging and Export table', DONE),
        ('Department code opens Department Insights for that unit', DONE)]),
    ('EDRMS Users Breakdown', [
        ('Headcount, active users, no access, training and training %', SAMPLE),
        ('Search and Filter; figures follow the units chosen', DONE),
        ('Headcount and training read from the imported manual data', RAC)]),
    ('Documents Activity', [
        ('Year / Month, Total / New documents, storage', SAMPLE),
        ('Unit drop-down replaced by Search and Filter, with a total row', DONE)]),
    ('Records Declaration', [
        ('Documents, records, declaration rate, people declaring', SAMPLE),
        ('Search and Filter on the table and figures', DONE)]),
    ('Physical Counterparts', [
        ('Donut, figures and table; Filter updates all three', SAMPLE)]),
    ('Declaration Trend and Date Range', [
        ('Presets, custom range, Year / Month', DONE),
        ('Click a year to see its months', DONE)]),
    ('Headcount Comparison', [
        ('Headcount against documents or records; sort, search, filter', SAMPLE)]),
    ('Department Profile (Category filter)', [
        ('Category > Sub-category > Sub-group > Site, multi-select with search', DONE),
        ('Categories built from the site list (no code change for new values)', RAC),
        ('Go-Live date and View guide link', RAC)]),
    ('Department Insights: Sites', [
        ('Site name, owner name, created date; year or custom range', SAMPLE)]),
    ('Department Insights: Site Visitors', [
        ('Unique visitors, internal / external, most visited sites', SAMPLE),
        ('Definition and source agreed (Purview audit log)', DONE),
        ('Internal / external split tested on the tenant', PROG)]),
    ('Department Insights: Documents, Records, Physical', [
        ('Per-site tables with measure switch; bar click finds the row', SAMPLE)]),
    ('Departmental Library Usage', [
        ('Folders, documents, records, counterparts, active users per library', SAMPLE),
        ('Folder count from the weekly Graph scan', SRC)]),
    ('Export', [
        ('PDF of the dashboard as on screen', DONE),
        ('PowerPoint: one slide per breakdown, filters and Data as of', DONE),
        ('Excel per table, formatted, with filters', DONE)]),
    ('Import Data (manual RAC data)', [
        ('Import button for Site Owners and admins only', DONE),
        ('One template: Sites, People, Departments, Code mapping', DONE),
        ('Every rule checked; a file with any problem is refused whole', DONE),
        ('Tested with the AP All Users export and the VLOOKUP SITE tab', DONE)]),
    ('PostgreSQL Database', [
        ('Design: 4 reporting tables, 73 columns', DONE),
        ('Column verification against the tenant (15 of 73 confirmed)', PROG),
        ('New instance or drm-npr: where the reporting tables live', OPEN)]),
    ('Client review materials', [
        ('Requirements reconfirmation deck and RAC Items 5 to 12 mockups', DONE),
        ('Functional walkthrough deck (41 functions) for RAC decisions', DONE)]),
]

prs = Presentation(os.path.join(HERE, 'templates', 'ADB_EDRMS_template.pptx'))
lst = prs.slides._sldIdLst
for sid in list(lst):
    prs.part.drop_rel(sid.rId)
    lst.remove(sid)
LAYOUT = next(l for l in prs.slide_layouts if l.name == 'Title and Content')

NAVY = RGBColor(0x0E, 0x2A, 0x3B)  # header fill, as in the example
INK = RGBColor(0x1F, 0x29, 0x37)
STATUS_COL = {DONE: RGBColor(0x1A, 0x7F, 0x37), SAMPLE: RGBColor(0x1A, 0x7F, 0x37), RAC: RGBColor(0x8A, 0x4B, 0x00),
              SRC: RGBColor(0x8A, 0x4B, 0x00), PROG: RGBColor(0x00, 0x5A, 0x96), OPEN: RGBColor(0xB4, 0x23, 0x18)}


def tb(s, x, y, w, h, t, size, bold=False, color=INK, align=PP_ALIGN.LEFT, font='Calibri'):
    b = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = b.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run(); r.text = t
    r.font.size, r.font.bold, r.font.name = Pt(size), bold, font
    r.font.color.rgb = color


def grid(c):
    tcPr = c._tc.get_or_add_tcPr()
    for tag in ('a:lnL', 'a:lnR', 'a:lnT', 'a:lnB'):
        ln = etree.SubElement(tcPr, qn(tag), w='9525')
        sf = etree.SubElement(ln, qn('a:solidFill'))
        etree.SubElement(sf, qn('a:srgbClr'), val='1F2937')
    # fill must come after borders in tcPr
    for f in tcPr.findall(qn('a:solidFill')):
        tcPr.remove(f); tcPr.append(f)


def cell_text(c, t, size, bold=False, color=INK):
    c.margin_left = c.margin_right = Inches(0.06)
    c.margin_top = c.margin_bottom = Inches(0.02)
    c.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf = c.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = t
    r.font.size, r.font.bold, r.font.name = Pt(size), bold, 'Calibri'
    r.font.color.rgb = color


# Page the groups so no group is split, at most ROWS item rows per slide.
ROWS = 15
pages, cur, n = [], [], 0
for i, (title, items) in enumerate(ITEMS, 1):
    if n + len(items) > ROWS and cur:
        pages.append(cur); cur, n = [], 0
    cur.append((i, title, items)); n += len(items)
if cur:
    pages.append(cur)

for k, page in enumerate(pages):
    s = prs.slides.add_slide(LAYOUT)
    for ph in list(s.placeholders):
        ph._element.getparent().remove(ph._element)
    tb(s, 0.36, 0.1, 7.0, 0.65, 'Development Status' + (' (continued)' if k else ''), 30, True, RGBColor(0x44, 0x54, 0x6A), font='Cambria')
    tb(s, 0.43, 0.8, 7.0, 0.26, 'EDRMS UTILIZATION REPORT, RELEASE 2026.4  |  ' + AS_OF.upper(), 10.5, True, RGBColor(0x6B, 0x7A, 0x90))
    nrows = 1 + sum(len(it) for _, _, it in page)
    rowh = 0.27
    widths = [0.4, 3.1, 5.6, 0.85, 2.45]
    gt = s.shapes.add_table(nrows, 5, Inches(0.4), Inches(1.95), Inches(sum(widths)), Inches(rowh * nrows))
    t = gt.table
    for i, w in enumerate(widths):
        t.columns[i].width = Inches(w)
    for r in range(nrows):
        t.rows[r].height = Inches(rowh)
        for c in range(5):
            cl = t.cell(r, c)
            cl.fill.solid()
            cl.fill.fore_color.rgb = NAVY if r == 0 else RGBColor(0xFF, 0xFF, 0xFF)
            grid(cl)
    for c, h in enumerate(['', 'Title', 'Enhancement Items', 'Phase', 'Status (test tenant web part)']):
        cell_text(t.cell(0, c), h, 11, True, RGBColor(0xFF, 0xFF, 0xFF))
    r = 1
    for num, title, items in page:
        first = r
        for item, status in items:
            cell_text(t.cell(r, 2), item, 10.5)
            cell_text(t.cell(r, 3), PHASE, 10.5)
            cell_text(t.cell(r, 4), status, 10.5, True, STATUS_COL[status])
            r += 1
        if len(items) > 1:
            t.cell(first, 0).merge(t.cell(r - 1, 0))
            t.cell(first, 1).merge(t.cell(r - 1, 1))
        cell_text(t.cell(first, 0), str(num), 10.5)
        cell_text(t.cell(first, 1), title, 10.5, True)

# Legend slide content: what each status means
s = prs.slides.add_slide(LAYOUT)
for ph in list(s.placeholders):
    ph._element.getparent().remove(ph._element)
tb(s, 0.36, 0.1, 7.0, 0.65, 'What each status means', 30, True, RGBColor(0x44, 0x54, 0x6A), font='Cambria')
tb(s, 0.43, 0.8, 7.0, 0.26, 'DEVELOPMENT STATUS  |  ' + AS_OF.upper(), 10.5, True, RGBColor(0x6B, 0x7A, 0x90))
legend = [(DONE, 'Built and working in the reference web part on the test tenant.'),
          (SAMPLE, 'Built and working; shows sample figures until the reporting database is connected.'),
          (RAC, 'Built and working; waits for the manual data from RAC (training, Go-Live, convention links, categories).'),
          (SRC, 'Built; the production source still needs confirming (folder count: AvePoint).'),
          (PROG, 'Started, not finished.'),
          (OPEN, 'Needs a decision before work can start (database instance: ITD).')]
for i, (k, d) in enumerate(legend):
    y = 1.95 + i * 0.62
    tb(s, 0.5, y, 3.2, 0.5, k, 14, True, STATUS_COL[k])
    tb(s, 3.8, y, 8.8, 0.5, d, 13)
tb(s, 0.5, 5.75, 12.0, 0.4, 'Phase: all items belong to Release 2026.4. The production build by the development team is tracked separately.', 11, False, RGBColor(0x6B, 0x7A, 0x90))

prs.save(OUT)
print('wrote', OUT, len(prs.slides), 'slides', [sum(len(it) for _, _, it in p) for p in pages])
