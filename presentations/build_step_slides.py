"""Turns each function slide (F-xx) of the Dashboard Controls deck into a click-through:
one full-page screenshot per step, an orange box around what is clicked next and a
short label, then the result. Slides change with a fade, so in Slide Show each click
of the presenter moves smoothly to the next step (the style of the client's example).

Steps come from presentations/demo_videos/steps/F-xx.json (record_demos.js, STEPS=1).
Usage: python3 presentations/build_step_slides.py IN.pptx OUT.pptx
"""
import json
import os
import re
import sys

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
STEPS = os.path.join(HERE, 'demo_videos', 'steps')
PNS = 'http://schemas.openxmlformats.org/presentationml/2006/main'
P = '{%s}' % PNS
ORANGE = RGBColor(0xE8, 0x6A, 0x10)

src, dst = sys.argv[1], sys.argv[2]
prs = Presentation(src)
SW, SH = prs.slide_width, prs.slide_height


def clear(s):
    for sh in list(s.shapes):
        sh._element.getparent().remove(sh._element)
    for t in s._element.findall(P + 'timing'):
        s._element.remove(t)


def fade(s):
    el = s._element
    for t in el.findall(P + 'transition'):
        el.remove(t)
    tr = etree.SubElement(el, P + 'transition')
    tr.set('spd', 'med')
    etree.SubElement(tr, P + 'fade')
    # order: cSld, clrMapOvr, transition, timing, extLst
    anchor = el.find(P + 'clrMapOvr')
    if anchor is None:
        anchor = el.find(P + 'cSld')
    anchor.addnext(tr)


def tidy(t):
    verb, rest = ('Point at', t[9:]) if t.startswith('Point at ') else t.partition(' ')[::2]
    rest = re.sub(r'[\u25be\u203a\u2197\u2193\u2191]', '', rest).strip()
    fixed = [
        (r'^Search', 'the search box'), (r'^Data as of', 'Data as of'),
        (r'^PDF', 'PDF'), (r'^PPT', 'PowerPoint'), (r'^GO-LIVE', 'the Go-Live date'),
        (r'^Drop the filled', 'the upload area'), (r'^Bank-wide oversight', 'away'),
        (r'^Approximate headcount against records', 'headcount against records'),
        (r'^Approximate headcount against documents', 'headcount against documents'),
        (r'^(.*?)\s[\d,.]+[MK]?(\s|$).*', None),                       # card: name then figure
    ]
    if verb == 'Click' and rest in ('', '\u2715', '\u00d7'):
        rest = 'the bar' if rest == '' else 'Close'
    for pat, rep in fixed:
        m = re.match(pat, rest)
        if not m:
            continue
        if rep is None:
            name = m.group(1).strip()
            if 'View' in t and len(name) > 2:
                rest = 'the ' + (name.capitalize() if name.isupper() else name) + ' card'
                break
            continue
        rest = rep
        break
    if rest.isupper() and len(rest) > 4:
        rest = rest.capitalize()
    rest = re.sub(r'\bEdrms\b|\bedrms\b', 'EDRMS', rest)
    words = rest.split()
    if len(words) > 6:
        rest = ' '.join(words[:6])
    if rest == 'away':
        return 'Move the pointer away'
    rest = re.sub(r'\s+\d[\d,]*$', '', rest) if verb == 'Point at' else rest
    return verb + ' ' + rest


def fill_step(s, fid, st, k, total):
    if not st.get('final'):
        st = dict(st, text=tidy(st['text']))
    clear(s)
    pic = s.shapes.add_picture(os.path.join(STEPS, st['file']), 0, 0, SW, SH)
    pic.name = '%s step %d' % (fid, k)
    pic._element.nvPicPr.cNvPr.set('descr', '%s, step %d of %d: %s' % (fid, k, total, st['text']))
    if not st.get('final'):
        pad = Inches(0.06)
        x, y = int(st['x'] * SW) - pad, int(st['y'] * SH) - pad
        w, h = int(st['w'] * SW) + 2 * pad, int(st['h'] * SH) + 2 * pad
        b = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
        b.adjustments[0] = 0.15
        b.fill.background()
        b.line.color.rgb = ORANGE
        b.line.width = Pt(3)
        b.shadow.inherit = False
        b.name = 'Highlight'
        # label just below the box (above it if near the bottom), kept on the slide
        lw, lh = Inches(max(1.4, 0.11 * len(st['text']) + 0.4)), Inches(0.38)
        lx = min(max(0, x), SW - lw)
        ly = y + h + Inches(0.08) if y + h + lh + Inches(0.1) < SH else y - lh - Inches(0.08)
        lab = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, lx, ly, lw, lh)
        lab.adjustments[0] = 0.3
        lab.fill.solid(); lab.fill.fore_color.rgb = ORANGE
        lab.line.fill.background(); lab.shadow.inherit = False
        lab.name = 'Step label'
        tf = lab.text_frame
        tf.margin_left = tf.margin_right = Inches(0.1); tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE; tf.word_wrap = False
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
        r = p.add_run(); r.text = '%d. %s' % (k, st['text'])
        r.font.size = Pt(14); r.font.bold = True; r.font.name = 'Calibri'
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    fade(s)


done, missing = [], []
order = list(prs.slides._sldIdLst)
for s in list(prs.slides):
    title = next((sh for sh in s.shapes if sh.has_text_frame and sh.name == 'Title'), None)
    m = re.match(r'\s*(F-\d+)\b', title.text_frame.text) if title else None
    if not m:
        continue
    fid = m.group(1)
    jf = os.path.join(STEPS, fid + '.json')
    if not os.path.exists(jf):
        missing.append(fid)
        continue
    steps = json.load(open(jf))
    fill_step(s, fid, steps[0], 1, len(steps))
    prev = next(e for e in prs.slides._sldIdLst if e.rId == prs.part.relate_to(s.part, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide'))
    for k, st in enumerate(steps[1:], 2):
        ns = prs.slides.add_slide(s.slide_layout)
        fill_step(ns, fid, st, k, len(steps))
        new_id = prs.slides._sldIdLst[-1]
        prev.addnext(new_id)
        prev = new_id
    done.append('%s (%d)' % (fid, len(steps)))

prs.save(dst)
print('slides', len(prs.slides), 'functions', len(done))
print(', '.join(done))
print('no steps for', missing)
