"""Clickable PowerPoint prototype of the Utilization Report web part.

Every screen state is a full-page slide (presentations/prototype/<state>.png). Each
clickable part of the screen carries an invisible link to the slide showing what that
click does; long pages get Scroll down / Scroll up buttons. Clicking anywhere else does
nothing (advance on click is off), so in Slide Show the deck behaves like the report.
Run: node presentations/capture_prototype.js, then python3 presentations/build_prototype_deck.py
"""
import json
import os

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, 'prototype2')
OUT = os.path.join(HERE, 'EDRMS_Utilization_Report_Clickable_Prototype.pptx')
P = '{http://schemas.openxmlformats.org/presentationml/2006/main}'
ORANGE = RGBColor(0xE8, 0x6A, 0x10)

graph = json.load(open(os.path.join(SHOTS, 'graph.json')))
states = graph['states']
START = graph['start']
ORDER = [START] + [k for k in states if k != START]

prs = Presentation(os.path.join(HERE, 'templates', 'ADB_EDRMS_template.pptx'))
lst = prs.slides._sldIdLst
first = True
for sid in list(lst):
    if first:  # keep the template's cover slide
        first = False
        continue
    prs.part.drop_rel(sid.rId)
    lst.remove(sid)
SW, SH = prs.slide_width, prs.slide_height
cover = prs.slides[0]
for sh in cover.shapes:
    if sh.has_text_frame:
        t = sh.text_frame.text
        if 'Reconfirmation' in t:
            sh.text_frame.paragraphs[0].runs[0].text = 'Clickable prototype (R2026.4)'
            for r in sh.text_frame.paragraphs[0].runs[1:]:
                r.text = ''
        elif 'August' in t:
            sh.text_frame.paragraphs[0].runs[0].text = 'November 2026'
            for r in sh.text_frame.paragraphs[0].runs[1:]:
                r.text = ''
BLANK = next(l for l in prs.slide_layouts if l.name == 'DEFAULT')
CONTENT = next(l for l in prs.slide_layouts if l.name == 'Title and Content')


def strip(s):
    for ph in list(s.placeholders):
        ph._element.getparent().remove(ph._element)


def no_click_advance(s, fade=True):
    el = s._element
    for t in el.findall(P + 'transition'):
        el.remove(t)
    # a transition may also sit inside mc:AlternateContent (e.g. Morph); two transitions make the file unreadable
    for ac in el.findall('{http://schemas.openxmlformats.org/markup-compatibility/2006}AlternateContent'):
        if ac.find('.//' + P + 'transition') is not None:
            el.remove(ac)
    tr = etree.Element(P + 'transition')
    tr.set('spd', 'fast')
    tr.set('advClick', '0')
    if fade:
        etree.SubElement(tr, P + 'fade')
    anchor = el.find(P + 'clrMapOvr')
    (anchor if anchor is not None else el.find(P + 'cSld')).addnext(tr)


def hotspot(s, x, y, w, h, target, name):
    sh = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    sh.name = 'Link: ' + name
    sh.fill.solid()
    sh.fill.fore_color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    # fully transparent fill: invisible but still clickable in Slide Show
    srgb = sh.fill._xPr.find(qn('a:solidFill')).find(qn('a:srgbClr'))
    etree.SubElement(srgb, qn('a:alpha')).set('val', '0')
    sh.line.fill.background()
    sh.shadow.inherit = False
    sh.click_action.target_slide = target
    return sh


def button(s, x, y, w, h, label, target):
    b = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    b.adjustments[0] = 0.5
    b.fill.solid(); b.fill.fore_color.rgb = ORANGE
    b.line.fill.background(); b.shadow.inherit = False
    b.name = 'Button: ' + label
    tf = b.text_frame
    tf.margin_left = tf.margin_right = Inches(0.1); tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = label
    r.font.size = Pt(14); r.font.bold = True; r.font.name = 'Calibri'; r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    b.click_action.target_slide = target


# Instructions slide
ins = prs.slides.add_slide(CONTENT)
strip(ins)

# One slide per state, created first so links can point at any of them
slides = {}
for k in ORDER:
    s = prs.slides.add_slide(BLANK)
    strip(s)
    pic = s.shapes.add_picture(os.path.join(SHOTS, states[k]['file']), 0, 0, SW, SH)
    pic.name = 'Screen ' + k
    slides[k] = s

for k in ORDER:
    s, st = slides[k], states[k]
    if st.get('back'):  # e.g. an open menu: a click anywhere closes it
        hotspot(s, 0, 0, SW, SH, slides[st['back']], 'close')
    for h in st['hot']:
        if h['target'] not in slides:
            continue
        pad = Inches(0.03)
        hotspot(s, int(h['x'] * SW) - pad, int(h['y'] * SH) - pad, int(h['w'] * SW) + 2 * pad, int(h['h'] * SH) + 2 * pad, slides[h['target']], h['name'])
    bw, bh = Inches(2.2), Inches(0.42)
    if st.get('down') and st['down'] in slides:
        button(s, int((SW - bw) / 2) + Inches(1.0), SH - bh - Inches(0.12), bw, bh, 'Scroll down ▼', slides[st['down']])
    if st.get('up') and st['up'] in slides:
        button(s, int((SW - bw) / 2) + Inches(1.0), Inches(0.12), bw, bh, '▲ Scroll up', slides[st['up']])
    no_click_advance(s)


def tb(s, x, y, w, h, text, size, bold=False, color=RGBColor(0x33, 0x3F, 0x50), font='Calibri'):
    t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = t.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    paras = text if isinstance(text, list) else [text]
    for i, line in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        r = p.add_run(); r.text = line
        r.font.size = Pt(size); r.font.bold = bold; r.font.name = font; r.font.color.rgb = color
        p.space_after = Pt(6)
    return t


tb(ins, 0.36, 0.1, 7.0, 0.65, 'How to use this prototype', 30, True, RGBColor(0x44, 0x54, 0x6A), 'Cambria')
tb(ins, 0.45, 1.3, 7.0, 3.6, [
    '1. Start the Slide Show, then click Open the report.',
    '2. Click anything you would click in the real report: the menu, the cards, Filter, the page numbers, a department code, Export, Import data.',
    '3. Each click opens the slide that shows what that click does.',
    '4. Long pages have an orange Scroll down button at the bottom, and Scroll up at the top.',
    '5. Clicking anywhere that is not a button does nothing, as in the report. Use the mouse rather than the arrow keys.',
    '6. Figures are sample data. Layout and wording may still change slightly in the final system.'], 15)
button(ins, Inches(0.45), Inches(5.1), Inches(2.6), Inches(0.5), 'Open the report ▶', slides[START])
no_click_advance(ins, fade=False)
no_click_advance(cover, fade=False)
button(cover, Inches(9.6), Inches(5.6), Inches(2.6), Inches(0.5), 'Open the report ▶', slides[START])

prs.save(OUT)
links = sum(len(states[k]['hot']) for k in ORDER)
print('wrote', OUT, len(prs.slides), 'slides,', links, 'links')
