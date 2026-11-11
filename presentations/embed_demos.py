"""Puts the click-through videos (presentations/demo_videos/F-xx.mp4) into the
Dashboard Controls deck, one per function slide, in place of its screenshot(s).
Each video starts on its own when the slide opens in Slide Show and loops.
Usage: python3 presentations/embed_demos.py IN.pptx OUT.pptx
"""
import copy
import os
import re
import sys

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_SHAPE_TYPE
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
VID = os.path.join(HERE, 'demo_videos')
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}
P = '{%s}' % NS['p']

src, dst = sys.argv[1], sys.argv[2]
prs = Presentation(src)

# Full slide: the 16:9 recording covers the whole page.
VX, VY = 0, 0
VW, VH = prs.slide_width / 914400, prs.slide_height / 914400

TIMING = '''<p:timing xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>
<p:par><p:cTn id="2" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>
<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>
<p:par><p:cTn id="4" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>
<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="5" dur="1" fill="hold"/><p:tgtEl><p:spTgt spid="SPID"/></p:tgtEl></p:cBhvr></p:cmd>
</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>
<p:video><p:cMediaNode vol="80000" mute="1"><p:cTn id="6" repeatCount="indefinite" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="SPID"/></p:tgtEl></p:cMediaNode></p:video>
</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>'''

done, missing = [], []
for idx, s in enumerate(prs.slides):
    title = next((sh for sh in s.shapes if sh.has_text_frame and sh.name == 'Title'), None)
    m = re.match(r'\s*(F-\d+)\b', title.text_frame.text) if title else None
    if not m:
        continue
    fid = m.group(1)
    mp4, png = os.path.join(VID, fid + '.mp4'), os.path.join(VID, fid + '.png')
    if not os.path.exists(mp4):
        missing.append(fid)
        continue
    # The whole page becomes the click-through: remove every shape on the slide.
    for sh in list(s.shapes):
        sh._element.getparent().remove(sh._element)
    mv = s.shapes.add_movie(mp4, Inches(VX), Inches(VY), Inches(VW), Inches(VH), poster_frame_image=png, mime_type='video/mp4')
    mv.name = 'Click-through ' + fid
    spid = mv.shape_id
    # Autoplay when the slide opens, loop, muted: replace any timing python-pptx wrote.
    sld = s._element
    for t in sld.findall(P + 'timing'):
        sld.remove(t)
    timing = etree.fromstring(TIMING.replace('SPID', str(spid)))
    # p:timing must come after p:clrMapOvr / p:transition and before p:extLst
    ext = sld.find(P + 'extLst')
    if ext is not None:
        ext.addprevious(timing)
    else:
        sld.append(timing)
    done.append(fid)

prs.save(dst)
print('embedded', len(done), done)
print('no video for', missing)
