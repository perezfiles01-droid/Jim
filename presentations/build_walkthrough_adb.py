"""Builds EDRMS_Utilization_Report_Walkthrough_ADB.pptx on the ADB / ITD template
(templates/ADB_EDRMS_template.pptx, from EDRMS_Util_Report_4.pptx).

Content comes from walkthrough_content.json, written by build_walkthrough_deck.js,
so the two decks always say the same thing. Run:
    node presentations/build_walkthrough_deck.js      (refreshes the JSON)
    python3 presentations/build_walkthrough_adb.py

Template safe area: the top-right wave covers x > 7.42", y < 1.86"; the bottom
footer image covers x < 4.69", y > 6.35"; the bottom-right wave x > 8.72", y > 6.26".
"""
import copy
import json
import math
import os
import struct

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(HERE, 'templates', 'ADB_EDRMS_template.pptx')
SHOTS = os.path.join(HERE, 'walkthrough_shots')
OUT = os.path.join(HERE, 'EDRMS_Utilization_Report_Walkthrough_ADB.pptx')

# Template styles (read from the template's own slides)
TITLE_FONT, BODY_FONT = 'Cambria', 'Calibri'
SLATE = RGBColor(0x44, 0x54, 0x6A)      # titles
INK = RGBColor(0x33, 0x3F, 0x50)        # body
EYEBROW = RGBColor(0x6B, 0x7A, 0x90)    # small caps label
NAVY = RGBColor(0x1F, 0x3A, 0x5F)
ACCENT = RGBColor(0x0E, 0x8C, 0x7F)     # teal from the wave
BOX_FILL = RGBColor(0xFF, 0xF7, 0xE8)
BOX_LINE = RGBColor(0xE8, 0xB8, 0x6A)
BROWN = RGBColor(0x8A, 0x4B, 0x00)
CARD = RGBColor(0xF2, 0xF6, 0xFA)
CARD_LINE = RGBColor(0xD6, 0xE1, 0xEC)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
HEAD_FILL = RGBColor(0x44, 0x54, 0x6A)

data = json.load(open(os.path.join(HERE, 'walkthrough_content.json')))
SPEC, REGISTER = data['spec'], data['register']

prs = Presentation(TEMPLATE)
# Remove the template's own slides; keep its master and layouts.
sldIdLst = prs.slides._sldIdLst
for sldId in list(sldIdLst):
    prs.part.drop_rel(sldId.rId)
    sldIdLst.remove(sldId)
L_TITLE = next(l for l in prs.slide_layouts if l.name == 'Title Slide')
L_CONTENT = next(l for l in prs.slide_layouts if l.name == 'Title and Content')


def new_slide(layout):
    s = prs.slides.add_slide(layout)
    return s


def drop_placeholders(s, keep=()):
    for ph in list(s.placeholders):
        if ph.placeholder_format.idx not in keep:
            ph._element.getparent().remove(ph._element)


def text(s, x, y, w, h, runs, size=12, color=INK, bold=False, italic=False, font=BODY_FONT,
         align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, name=None):
    """runs: str, or list of paragraphs; a paragraph is str or list of (text, opts)."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        tb.name = name
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    paras = runs if isinstance(runs, list) else [runs]
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        parts = p if isinstance(p, list) else [(p, {})]
        for t, o in parts:
            r = para.add_run()
            r.text = t
            f = r.font
            f.name = o.get('font', font)
            f.size = Pt(o.get('size', size))
            f.bold = o.get('bold', bold)
            f.italic = o.get('italic', italic)
            f.color.rgb = o.get('color', color)
    return tb


def numbered(s, x, y, w, h, items, size=12):
    tb = text(s, x, y, w, h, items, size=size)
    for p in tb.text_frame.paragraphs:
        pPr = p._p.get_or_add_pPr()
        pPr.set('marL', str(int(Inches(0.28))))
        pPr.set('indent', str(int(-Inches(0.28))))
        bu = etree.SubElement(pPr, qn('a:buAutoNum'))
        bu.set('type', 'arabicPeriod')
        p.space_after = Pt(3)
    return tb


def bullets(s, x, y, w, h, items, size=12):
    tb = text(s, x, y, w, h, items, size=size)
    for p in tb.text_frame.paragraphs:
        pPr = p._p.get_or_add_pPr()
        pPr.set('marL', str(int(Inches(0.22))))
        pPr.set('indent', str(int(-Inches(0.22))))
        bc = etree.SubElement(pPr, qn('a:buChar'))
        bc.set('char', '•')
        p.space_after = Pt(4)
    return tb


def box(s, x, y, w, h, fill, line, rounded=True, name=None, line_w=0.75):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE,
                            Inches(x), Inches(y), Inches(w), Inches(h))
    if rounded:
        sh.adjustments[0] = min(0.12, 0.1 / max(0.1, min(w, h)))
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(line_w)
    sh.shadow.inherit = False
    if name:
        sh.name = name
    return sh


def shape_text(sh, t, size=12, bold=False, italic=False, color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, margin=0.05):
    tf = sh.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(margin)
    tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = t
    r.font.size, r.font.bold, r.font.italic, r.font.name = Pt(size), bold, italic, BODY_FONT
    r.font.color.rgb = color


def title(s, t, eyebrow=None, fid=None, size=30):
    runs = [[(fid + '  ', {'color': ACCENT}), (t, {})]] if fid else [t]
    text(s, 0.36, 0.08, 11.6, 0.66, runs, size=size, bold=True, color=SLATE, font=TITLE_FONT,
         anchor=MSO_ANCHOR.MIDDLE, name='Title')
    if eyebrow:
        tb = text(s, 0.43, 0.8, 7.0, 0.24, eyebrow.upper(), size=10.5, bold=True, color=EYEBROW, name='Section label')
        for r in tb.text_frame.paragraphs[0].runs:
            r.font._rPr.set('spc', '160')


def png_size(f):
    with open(f, 'rb') as fh:
        fh.read(16)
        return struct.unpack('>II', fh.read(8))


def shot(s, name, x, y, w, h, alt=''):
    f = os.path.join(SHOTS, name + '.png')
    pw, ph = png_size(f)
    r = min(w / pw, h / ph)
    iw, ih = pw * r, ph * r
    ix, iy = x + (w - iw) / 2, y + (h - ih) / 2
    box(s, ix - 0.06, iy - 0.06, iw + 0.12, ih + 0.12, CARD, CARD_LINE, name='Screenshot frame')
    pic = s.shapes.add_picture(f, Inches(ix), Inches(iy), Inches(iw), Inches(ih))
    pic._element.nvPicPr.cNvPr.set('descr', alt or name)


def decision(s, fid, x, y, w, h=1.25, example=None):
    box(s, x, y, w, h, BOX_FILL, BOX_LINE, name='RAC decision box')
    text(s, x + 0.18, y + 0.07, w - 2.2, 0.24, 'RAC decision for ' + fid, size=11.5, bold=True, color=BROWN)
    text(s, x + w - 2.0, y + 0.08, 1.82, 0.22, 'click a box, type X', size=9.5, italic=True, color=RGBColor(0x8A, 0x6A, 0x3A), align=PP_ALIGN.RIGHT)
    for i, o in enumerate(['Keep', 'Change', 'Remove']):
        bx, by = x + 0.18 + i * 1.25, y + 0.38
        sq = box(s, bx, by, 0.27, 0.27, WHITE, BROWN, rounded=False, name='Type X here: %s (%s)' % (o, fid), line_w=1)
        shape_text(sq, 'X' if example and example['mark'] == i else '', size=13, bold=True, color=RGBColor(0x8A, 0x1C, 0x12),
                   align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, margin=0)
        text(s, bx + 0.35, by, 0.85, 0.27, o, size=11.5, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 0.18, y + 0.76, 0.85, 0.22, 'Comments:', size=10.5, color=EYEBROW)
    cb = box(s, x + 1.0, y + 0.72, w - 1.18, h - 0.84, WHITE, BOX_LINE, rounded=False, name='Type comments here (%s)' % fid)
    shape_text(cb, example['comment'] if example else '', size=10.5, italic=bool(example))


def notes(s, t):
    tf = s.notes_slide.notes_text_frame
    if tf is not None:  # the template's notes master has no body placeholder; notes are then skipped
        tf.text = t


def est_lines(t, w, size):
    per = max(10, int(w * 72 / (size * 0.5)))  # characters per line, Calibri average
    return max(1, math.ceil(len(t) / per))


SECTION = ''


# ---------------------------------------------------------------- slides
def cover():
    s = new_slide(L_TITLE)
    s.placeholders[0].text = 'EDRMS Utilization Report'
    s.placeholders[1].text = 'November 2026'
    for ph in (s.placeholders[0], s.placeholders[1]):
        pass
    text(s, 0.34, 3.96, 11.0, 0.7, 'Functional walkthrough of the web part (R2026.4)', size=24, color=WHITE)
    drop_placeholders(s, keep=(0, 1))
    notes(s, 'Purpose: walk RAC through every screen and every click of the Utilization Report, and collect a decision on each function: keep it, change it, or remove it.')


def divider(sp):
    s = new_slide(L_TITLE)
    s.placeholders[0].text = sp['title']
    s.placeholders[1].text = sp['text']
    for p in s.placeholders[1].text_frame.paragraphs:
        for r in p.runs:
            r.font.size = Pt(16)
    drop_placeholders(s, keep=(0, 1))


def feature(sp):
    s = new_slide(L_CONTENT)
    drop_placeholders(s)
    title(s, sp['title'], eyebrow=sp['section'], fid=sp['id'], size=28 if len(sp['title']) < 34 else 24 if len(sp['title']) < 44 else 21)
    LX, LY, LW, LH = 0.4, 1.2, 7.05, 5.0
    if sp.get('shot2'):
        shot(s, sp['shot'], LX, LY, LW, 2.4, sp['title'])
        shot(s, sp['shot2'], LX, LY + 2.6, LW, 2.4, sp['title'] + ', after the click')
    else:
        shot(s, sp['shot'], LX, LY, LW, LH, sp['title'])
    X, W = 7.8, 5.1
    size = 12
    what, clicks, dat = sp['what'], sp['clicks'], sp.get('data')
    # Fit: shrink to 11pt if the right column would overflow its 2.7" of text space.
    def need(sz):
        lines = est_lines(what, W, sz) + sum(est_lines(c, W - 0.28, sz) for c in clicks) + (est_lines('Data: ' + dat, W, sz - 1) if dat else 0)
        return lines * sz * 1.25 / 72 + 0.6 + 0.04 * len(clicks)
    if need(12) > 2.85:
        size = 11
    y = 1.95
    text(s, X, y, W, 0.24, 'What it shows', size=12.5, bold=True, color=NAVY)
    wh = est_lines(what, W, size) * size * 1.25 / 72 + 0.05
    text(s, X, y + 0.26, W, wh, what, size=size)
    y = y + 0.26 + wh + 0.1
    text(s, X, y, W, 0.24, 'When you click', size=12.5, bold=True, color=NAVY)
    dh = (est_lines('Data: ' + dat, W, size - 1) * (size - 1) * 1.25 / 72 + 0.05) if dat else 0
    numbered(s, X, y + 0.26, W, max(0.4, 4.8 - (y + 0.26) - dh), clicks, size=size)
    if dat:
        text(s, X, 4.82 - dh, W, dh, [[('Data: ', {'bold': True}), (dat, {})]], size=size - 1, color=EYEBROW)
    decision(s, sp['id'], X, 4.9, W)
    notes(s, sp.get('notes') or (what + ' Click steps: ' + ' '.join(clicks)))


def howto():
    s = new_slide(L_CONTENT); drop_placeholders(s)
    title(s, 'How to read and comment on this deck', eyebrow='Introduction')
    steps = [('One function per slide', 'Each slide shows one part of the report as it looks in SharePoint, what it shows, and exactly what happens when you click.'),
             ('Every function has an ID', 'F-01, F-02 and so on. Use the ID when you comment, so there is no doubt which part you mean.'),
             ('Type X in one box per function', 'Click the small box beside Keep, Change or Remove and type X. Click the Comments box to type a change. The last slides repeat all decisions in one table.'),
             ('Figures are sample data', 'Numbers on screen are sample figures for review. Real figures replace them when the reporting database is connected.')]
    for i, (h, b) in enumerate(steps):
        y = 1.3 + i * 1.2
        c = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.5), Inches(y + 0.05), Inches(0.6), Inches(0.6))
        c.fill.solid(); c.fill.fore_color.rgb = ACCENT; c.line.fill.background(); c.shadow.inherit = False
        shape_text(c, str(i + 1), size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, margin=0)
        text(s, 1.35, y, 5.9, 0.34, h, size=16, bold=True, color=NAVY)
        text(s, 1.35, y + 0.36, 5.9, 0.75, b, size=13)
    decision(s, 'F-00', 7.9, 2.3, 4.9, 1.4, example={'mark': 1, 'comment': 'Show the top 15 instead of the top 10.'})
    text(s, 7.9, 3.8, 4.9, 0.3, 'Example of a filled-in decision box', size=11, color=EYEBROW, align=PP_ALIGN.CENTER)


def glance():
    s = new_slide(L_CONTENT); drop_placeholders(s)
    title(s, 'The report at a glance', eyebrow='Introduction')
    shot(s, '01_bw_full', 0.4, 1.2, 7.05, 5.0, 'Bank-wide Oversight as it opens')
    rows = [('Two live dashboards', 'Bank-wide Oversight (all of ADB) and Department Insights (one or more units).'),
            ('Four future dashboards', 'Project Insights, Institutional File Plan, Retention and Disposal, Records and Archive Holdings: in the menu, not yet available.'),
            ('Same pattern everywhere', 'A title band, summary cards, and a breakdown that opens under the card you click.'),
            ('Click through to the detail', 'Cards open breakdowns; department codes open Department Insights; bars find their row.'),
            ('Weekly data', '"Data as of" shows the Monday of the latest weekly refresh.')]
    for i, (h, b) in enumerate(rows):
        y = 1.95 + i * 0.84
        text(s, 7.8, y, 5.1, 0.26, h, size=13, bold=True, color=NAVY)
        text(s, 7.8, y + 0.27, 5.1, 0.55, b, size=12)


def who():
    s = new_slide(L_CONTENT); drop_placeholders(s)
    title(s, 'Who sees what', eyebrow='Introduction')
    cards = [('Visitors and Members', 'Read or Edit access to the site', ['See both dashboards and every breakdown', 'Use search, filters, sorting and paging', 'Export to PDF, PowerPoint and Excel', 'Do NOT see Import data'], '50_reader_header'),
             ('Site Owners and admins', 'Full Control, or site collection admin', ['Everything Members can do', 'PLUS the Import data button beside Export', 'Load the manual data template', 'Only they can change the stored manual data'], '51_owner_header')]
    for i, (h, sub, items, img) in enumerate(cards):
        x = 0.5 + i * 6.25
        box(s, x, 1.95, 6.0, 4.25, CARD, CARD_LINE, name=h + ' card')
        text(s, x + 0.3, 2.1, 5.4, 0.4, h, size=18, bold=True, color=NAVY)
        text(s, x + 0.3, 2.5, 5.4, 0.3, sub, size=12, italic=True, color=EYEBROW)
        bullets(s, x + 0.3, 2.9, 5.4, 1.6, items, size=13)
        shot(s, img, x + 0.3, 4.6, 5.4, 1.45, h + ' header')


def settings(sp):
    s = new_slide(L_CONTENT); drop_placeholders(s)
    title(s, 'Web part settings (page editors)', eyebrow=sp['section'], fid='F-24')
    text(s, 0.45, 1.25, 6.9, 0.6, 'When the SharePoint page is in Edit mode, the web part\'s settings pane (pencil icon on the web part) offers three choices. Readers never see these.', size=13)
    cards = [('Dashboard on this page', 'Bank-wide Oversight or Department Insights', 'Which dashboard the page opens on. Readers can still switch with the menu.'),
             ('Show the report\'s own sidebar', 'Shown or Hidden', 'Hide it when the site\'s own navigation already links to each dashboard page.'),
             ('Text size', 'Standard, Large (default) or Extra large', 'Large is 25% bigger, Extra large 50% bigger. Exports are always drawn at standard size.')]
    for i, (h, sub, b) in enumerate(cards):
        x = 0.45 + i * 4.2
        box(s, x, 2.0, 3.95, 2.6, CARD, CARD_LINE, name=h + ' card')
        text(s, x + 0.25, 2.15, 3.45, 0.4, h, size=15, bold=True, color=NAVY)
        text(s, x + 0.25, 2.6, 3.45, 0.5, sub, size=12, italic=True, color=EYEBROW)
        text(s, x + 0.25, 3.15, 3.45, 1.35, b, size=12.5)
    decision(s, 'F-24', 0.45, 4.85, 8.1, 1.3)


def template_slide(sp):
    s = new_slide(L_CONTENT); drop_placeholders(s)
    title(s, 'The manual data template', eyebrow=sp['section'], fid='F-51')
    tabs = [('Sites', 'Sir Rotsen\'s site list, pasted as it is', 'Site, URL, Site Name, Department, Division, Production, Full Name, Category, Sub-category, Sub-group', 'The four filter boxes (F-07, F-30)'),
            ('People', 'The AP All Users export, plus one column RAC fills', 'Email, Display Name, Department, Division, Unit, Office Location, Staff type, Completed EDRMS training (Yes/No)', 'Headcount and training (F-14, F-19)'),
            ('Departments', 'One row per unit', 'Unit code, Go-Live date, Site convention link, Completed training (count)', 'Go-Live and View guide (F-33)'),
            ('Code mapping', 'Optional', 'Code in People, Report unit', 'Places people under the right unit')]
    table(s, ['Tab', 'What it is', 'Columns', 'Feeds'], [list(t) for t in tabs], 0.45, 1.25, 7.0, [1.15, 1.7, 2.6, 1.55], size=10.5)
    text(s, 7.8, 1.95, 5.1, 0.25, 'Rules every file must pass', size=12.5, bold=True, color=NAVY)
    bullets(s, 7.8, 2.25, 5.1, 2.5, ['Tab names and headings as in the template', 'Valid codes, Yes/No, dates up to today, sharepoint.com links',
                                      'Training no more than the headcount; per person or as a count, not both', 'Service accounts and repeated rows skipped and reported',
                                      'If any rule is broken, nothing is loaded'], size=12)
    decision(s, 'F-51', 7.8, 4.9, 5.1)


def table(s, head, rows, x, y, w, colw, size=11, rowh=0.3):
    gt = s.shapes.add_table(len(rows) + 1, len(head), Inches(x), Inches(y), Inches(w), Inches(rowh * (len(rows) + 1)))
    t = gt.table
    for i, cw in enumerate(colw):
        t.columns[i].width = Inches(cw)
    for r in range(len(rows) + 1):
        t.rows[r].height = Inches(rowh)
        for c in range(len(head)):
            cell = t.cell(r, c)
            cell.margin_left = cell.margin_right = Inches(0.05)
            cell.margin_top = cell.margin_bottom = Inches(0.03)
            val = head[c] if r == 0 else rows[r - 1][c]
            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            run = p.add_run(); run.text = val
            run.font.size = Pt(size); run.font.name = BODY_FONT
            run.font.bold = r == 0 or (c == 0 and bool(val))
            run.font.color.rgb = WHITE if r == 0 else INK
            cell.fill.solid()
            cell.fill.fore_color.rgb = HEAD_FILL if r == 0 else (WHITE if r % 2 else RGBColor(0xF4, 0xF7, 0xFA))
    return gt


def sources(sp):
    s = new_slide(L_CONTENT); drop_placeholders(s)
    title(s, 'Where each figure comes from', eyebrow=sp['section'])
    rows = [['Sites, site owners, created date', 'AvePoint Cloud Governance', 'Automatic, weekly'],
            ['Documents, storage', 'Microsoft 365 / Graph scan', 'Automatic, weekly'],
            ['Records declared, physical counterparts', 'EDRMS records table (drm-npr)', 'Automatic, weekly'],
            ['Site visitors, active users', 'Purview audit log', 'Automatic, weekly'],
            ['Folders per library', 'Microsoft Graph scan', 'Pending AvePoint confirmation'],
            ['Headcount, staff type', 'AP All Users export (People tab)', 'Manual import (F-50)'],
            ['Completed training', 'RAC list (People or Departments tab)', 'Manual import'],
            ['Go-Live date, site convention link', 'RAC (Departments tab)', 'Manual import'],
            ['Category, Sub-category, Sub-group', 'Sir Rotsen\'s site list (Sites tab)', 'Manual import']]
    table(s, ['Figure', 'Source', 'How it arrives'], rows, 0.45, 1.95, 12.4, [4.4, 4.6, 3.4], size=12.5, rowh=0.42)


def asks(sp):
    s = new_slide(L_CONTENT); drop_placeholders(s)
    title(s, 'What we still need from RAC', eyebrow=sp['section'])
    items = [('Completed EDRMS training', 'Per person (Yes/No on People) or a count per unit (Departments). Please say which.'),
             ('Go-Live date and site convention link', 'One row per Department / Office / RM / RO on the Departments tab.'),
             ('Category, Sub-category, Sub-group', 'The three columns in sir Rotsen\'s site file, to confirm the drill-down (HQ, RM, RO and below).'),
             ('Code mapping', 'Which report unit each HR code belongs to (SD1, SD2, SD3, CCSD, CSD and others).'),
             ('Decisions on every function', 'Keep, change or remove, using the boxes on each slide or the register that follows.')]
    for i, (h, b) in enumerate(items):
        y = 1.3 + i * 0.95
        c = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.5), Inches(y + 0.05), Inches(0.55), Inches(0.55))
        c.fill.solid(); c.fill.fore_color.rgb = ACCENT; c.line.fill.background(); c.shadow.inherit = False
        shape_text(c, str(i + 1), size=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, margin=0)
        text(s, 1.3, y, 6.0 if y < 1.86 else 11.4, 0.34, h, size=16, bold=True, color=NAVY)
        text(s, 1.3, y + 0.36, 6.0 if y < 1.86 else 11.4, 0.5, b, size=13)


def register(sp):
    rows = [[r['id'], r['title'], r['area'].split('. ', 1)[-1], '', '', '', ''] for r in REGISTER]
    per = 11
    for k in range(0, len(rows), per):
        s = new_slide(L_CONTENT); drop_placeholders(s)
        title(s, 'Decision register' + (' (continued)' if k else ''), eyebrow=sp['section'])
        table(s, ['ID', 'Function', 'Area', 'Keep (X)', 'Change (X)', 'Remove (X)', 'Comments'], rows[k:k + per],
              0.45, 1.95, 12.4, [0.7, 4.1, 2.9, 0.9, 1.0, 1.0, 1.8], size=11, rowh=0.3)


def close():
    s = new_slide(L_TITLE)
    s.placeholders[0].text = 'Next steps'
    s.placeholders[1].text = ('1. RAC reviews each function and fills in the decision boxes.\n'
                              '2. RAC provides the training list, Go-Live dates, convention links, categories and code mapping.\n'
                              '3. The EDRMS team updates the report and walks RAC through the changes.')
    for p in s.placeholders[1].text_frame.paragraphs:
        for r in p.runs:
            r.font.size = Pt(14)
    drop_placeholders(s, keep=(0, 1))


for sp in SPEC:
    if sp['type'] == 'divider':
        divider(sp)
    elif sp['type'] == 'feature':
        feature(sp)
    else:
        {'cover': lambda sp: cover(), 'howto': lambda sp: howto(), 'glance': lambda sp: glance(), 'who': lambda sp: who(),
         'settings': settings, 'template': template_slide, 'sources': sources, 'asks': asks,
         'register': register, 'close': lambda sp: close()}[sp['key']](sp)

prs.save(OUT)
print('wrote', OUT, len(prs.slides), 'slides')
