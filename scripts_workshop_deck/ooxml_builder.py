"""Shape builders that emit OOXML matching the idiom already used in
EDRMS_Utilization_Confirmation_Workshop.pptx, so injected slides are
indistinguishable from the hand-made ones.

Slide is 10 x 5.625in. All positions in inches; converted to EMU here.
Design tokens are read off slide 3 of the source deck.
"""

EMU = 914400
SLIDE_W, SLIDE_H = 10.0, 5.625

# tokens lifted from slide 3
NAVY   = "003D5B"
TEAL   = "009B8A"
INK    = "333333"
MUTE   = "6B7280"
PANEL  = "F4F7F8"
BORDER = "D8DEE1"
BAND   = "D1FAE5"
BANDLN = "6EE7B7"
WHITE  = "FFFFFF"
AMBER  = "FFF3E0"
AMBRLN = "E3B778"
RED    = "FCE4E4"
REDLN  = "E0A6A6"
BLUE   = "DBEEF4"
BLUELN = "8FBFD4"

_uid = [1000]


def _nid():
    _uid[0] += 1
    return _uid[0]


def _e(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def _xfrm(x, y, w, h):
    return (f'<a:xfrm><a:off x="{int(x*EMU)}" y="{int(y*EMU)}"/>'
            f'<a:ext cx="{int(w*EMU)}" cy="{int(h*EMU)}"/></a:xfrm>')


def _nv(name):
    return (f'<p:nvSpPr><p:cNvPr id="{_nid()}" name="{_e(name)}"/>'
            f'<p:cNvSpPr/><p:nvPr/></p:nvSpPr>')


def _fill(color):
    return f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>' if color else '<a:noFill/>'


def _line(color, w=12700):
    if not color:
        return '<a:ln/>'
    return (f'<a:ln w="{w}"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
            f'<a:prstDash val="solid"/></a:ln>')


def shape(x, y, w, h, fill=None, line=None, geom="rect", name="Shape", lw=12700):
    """A plain filled/outlined shape carrying no text."""
    return (f'<p:sp>{_nv(name)}<p:spPr>{_xfrm(x,y,w,h)}'
            f'<a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom>'
            f'{_fill(fill)}{_line(line,lw)}</p:spPr>'
            f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p>'
            f'<a:endParaRPr lang="en-PH" sz="1000"/></a:p></p:txBody></p:sp>')


def text(x, y, w, h, runs, size=1000, color=INK, bold=False, align="l",
         anchor="ctr", spc=0, name="Text", italic=False, wrap=True, line_spc=None):
    """runs: a string, or a list of (string, {overrides}) tuples."""
    if isinstance(runs, str):
        runs = [(runs, {})]
    body = ""
    for t, o in runs:
        sz = o.get("size", size)
        cl = o.get("color", color)
        bd = o.get("bold", bold)
        it = o.get("italic", italic)
        sp = o.get("spc", spc)
        i_attr = ' i="1"' if it else ''
        s_attr = ' spc="%d"' % sp if sp else ''
        body += (f'<a:r><a:rPr lang="en-US" sz="{sz}" b="{1 if bd else 0}"'
                 f'{i_attr} kern="0"{s_attr} dirty="0">'
                 f'<a:solidFill><a:srgbClr val="{cl}"/></a:solidFill>'
                 f'<a:latin typeface="Calibri" pitchFamily="34" charset="0"/>'
                 f'<a:ea typeface="Calibri" pitchFamily="34" charset="-122"/>'
                 f'<a:cs typeface="Calibri" pitchFamily="34" charset="-120"/>'
                 f'</a:rPr><a:t>{_e(t)}</a:t></a:r>')
    ln = f'<a:lnSpc><a:spcPct val="{line_spc}"/></a:lnSpc>' if line_spc else ""
    return (f'<p:sp>{_nv(name)}<p:spPr>{_xfrm(x,y,w,h)}'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln/></p:spPr>'
            f'<p:txBody><a:bodyPr wrap="{"square" if wrap else "none"}" rtlCol="0" anchor="{anchor}">'
            f'<a:normAutofit/></a:bodyPr><a:lstStyle/>'
            f'<a:p><a:pPr marL="0" indent="0" algn="{align}">{ln}<a:buNone/></a:pPr>'
            f'{body}</a:p></p:txBody></p:sp>')


# ---------------------------------------------------------------- composites

def caps(x, y, w, label, color=NAVY, size=1200):
    """Small-caps section label, as used on slide 3."""
    return text(x, y, w, 0.22, label, size=size, color=color, bold=True, spc=105)


def rule(x, y, w, color=TEAL, h=0.04):
    return shape(x, y, w, h, fill=color, name="Rule")


def card(x, y, w, heading, body, rule_w=None, head_size=1200, body_size=1000,
         body_h=0.54, indent=0.0):
    """Teal rule, navy heading, grey body — the slide 3 card."""
    out = rule(x, y, rule_w or w)
    out += text(x + indent, y + 0.06, w - indent, 0.23, heading,
                size=head_size, color=NAVY, bold=True)
    out += text(x, y + 0.37, w, body_h, body, size=body_size, color=INK,
                anchor="t", line_spc="92000")
    return out


def numbered(x, y, w, n, heading, body, head_size=1200, body_size=1000,
             body_h=0.6, circle=0.28):
    """Teal circle + number, heading, body — the slide 3 action pattern."""
    out = shape(x, y, circle, circle, fill=TEAL, geom="ellipse", name="Dot")
    out += text(x, y + 0.02, circle, 0.24, str(n), size=1100, color=WHITE,
                bold=True, align="ctr")
    out += text(x + circle + 0.1, y - 0.01, w - circle - 0.1, 0.26, heading,
                size=head_size, color=NAVY, bold=True)
    out += text(x + circle + 0.1, y + 0.27, w - circle - 0.12, body_h, body,
                size=body_size, color=INK, anchor="t", line_spc="92000")
    return out


def panel(x, y, w, h, fill=PANEL, line=BORDER):
    return shape(x, y, w, h, fill=fill, line=line, name="Panel")


def chip(x, y, w, h, label, fill=TEAL, color=WHITE, size=900, geom="roundRect"):
    """Small pill label."""
    return (shape(x, y, w, h, fill=fill, geom=geom, name="Chip")
            + text(x, y, w, h, label, size=size, color=color, bold=True,
                   align="ctr", spc=60))


def bullet_rows(x, y, w, items, gap=0.235, size=950, dot=0.055, color=TEAL):
    """Compact list: small square marker + text."""
    out = ""
    cy = y
    for it in items:
        out += shape(x, cy + 0.07, dot, dot, fill=color, name="Bullet")
        out += text(x + 0.16, cy, w - 0.16, 0.22, it, size=size, color=INK)
        cy += gap
    return out


def wrap_slide(inner, name="Slide"):
    """Header + tail matching the source deck's slide parts."""
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'
            '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            f'<p:cSld name="{_e(name)}"><p:bg><p:bgPr>'
            '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/>'
            '</p:bgPr></p:bg><p:spTree><p:nvGrpSpPr>'
            '<p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            + inner +
            '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>')


def title(t):
    """The 27pt dashboard title already present on slides 4-15."""
    return text(0.22, 0.10, 9.2, 0.54, t, size=2700, color=NAVY, bold=True,
                anchor="ctr", name="Title")


def subtitle(t):
    """20pt purpose line, matching slide 3's 'The Gap Checker' line."""
    return text(0.21, 0.70, 9.2, 0.34, t, size=1400, color=TEAL, name="Subtitle")
