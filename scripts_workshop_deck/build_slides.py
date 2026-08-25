"""Compose slides 4-15 and inject them into the workshop deck.

Usage: python3 build_slides.py <slide numbers...>   (default: all)
Edits EDRMS_Utilization_Confirmation_Workshop.pptx in place, replacing only
the named slide parts. Slides 1-3, master, theme and media are untouched.
"""
import sys, os, re, shutil, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ooxml_builder as B
from workshop_content import DASHBOARDS

DECK = "/home/user/Jim/EDRMS_Utilization_Confirmation_Workshop.pptx"
M = 0.45              # left margin
CW = 10.0 - 2 * M     # content width


# ------------------------------------------------------------ page one: purpose
def purpose_slide(d):
    x = B.title(d["title"])
    x += B.subtitle(d["purpose"])

    # three purpose cards
    cw = (CW - 2 * 0.32) / 3
    for i, (h, b) in enumerate(d["cards"]):
        cx = M + i * (cw + 0.32)
        x += B.card(cx, 1.20, cw, h, b, body_h=0.86)

    # measures panel
    x += B.caps(M, 2.44, 5.0, "WHAT YOU WILL SEE ON THE PAGE")
    x += B.panel(M, 2.72, CW, 2.28)
    gw = (CW - 0.5) / 4
    for i, (g, items) in enumerate(d["groups"]):
        gx = M + 0.22 + i * gw
        x += B.rule(gx, 2.94, gw - 0.34, color=B.TEAL, h=0.035)
        x += B.text(gx, 3.02, gw - 0.34, 0.24, g, size=1050,
                    color=B.NAVY, bold=True)
        x += B.bullet_rows(gx, 3.34, gw - 0.30, items, gap=0.30, size=900)
    return B.wrap_slide(x, d["title"])


# --------------------------------------------------- page two: what we need
def questions_slide(d):
    x = B.title(d["title"])
    x += B.subtitle("What we need from you before these can be built.")
    x += B.caps(M, 1.12, 5.0, "WHAT WE NEED FROM YOU")

    qs = d["questions"]
    has_div = any(q[2] == "DIVISION" for q in qs)

    if has_div:
        # Division gets a full-width highlighted block, the rest go 3-across
        dq = next(q for q in qs if q[2] == "DIVISION")
        rest = [q for q in qs if q[2] != "DIVISION"]

        x += B.panel(M, 1.42, CW, 1.30, fill=B.BAND, line=B.BANDLN)
        x += B.shape(M, 1.42, 0.055, 1.30, fill=B.TEAL)
        x += B.shape(M + 0.24, 1.58, 0.28, 0.28, fill=B.TEAL, geom="ellipse")
        x += B.text(M + 0.24, 1.60, 0.28, 0.24, "1", size=1100,
                    color=B.WHITE, bold=True, align="ctr")
        x += B.text(M + 0.62, 1.56, 3.2, 0.28, dq[0], size=1250,
                    color=B.NAVY, bold=True)
        x += B.text(M + 0.62, 1.86, 4.3, 0.70, dq[1], size=1000,
                    color=B.INK, anchor="t", line_spc="92000")
        x += B.text(M + 5.15, 1.56, 3.6, 0.22, "WHERE IT IS USED", size=950,
                    color=B.TEAL, bold=True, spc=105)
        x += B.bullet_rows(M + 5.15, 1.84, 3.55, d["division_sections"],
                           gap=0.215, size=920)

        qw = (CW - 2 * 0.32) / 3
        for i, (h, b, _) in enumerate(rest):
            qx = M + i * (qw + 0.32)
            x += B.numbered(qx, 3.00, qw, i + 2, h, b, body_h=1.05)
    else:
        qw = (CW - 0.36) / 2
        for i, (h, b, _) in enumerate(qs):
            qx = M + (i % 2) * (qw + 0.36)
            qy = 1.46 + (i // 2) * 1.16
            x += B.numbered(qx, qy, qw, i + 1, h, b, body_h=0.80)

    return B.wrap_slide(x, d["title"] + " — asks")


# --------------------------------------------------------------- injection
BUILDERS = {}


def register(num, fn):
    BUILDERS[num] = fn


register(4,  lambda: purpose_slide(DASHBOARDS["bankwide"]))
register(5,  lambda: questions_slide(DASHBOARDS["bankwide"]))
register(6,  lambda: purpose_slide(DASHBOARDS["department"]))
register(7,  lambda: questions_slide(DASHBOARDS["department"]))
register(8,  lambda: purpose_slide(DASHBOARDS["project"]))
register(9,  lambda: questions_slide(DASHBOARDS["project"]))
register(10, lambda: purpose_slide(DASHBOARDS["fileplan"]))
register(11, lambda: questions_slide(DASHBOARDS["fileplan"]))

try:
    import phased_slides
    phased_slides.register_all(register, B, M, CW)
except ImportError:
    pass


def inject(targets):
    tmp = DECK + ".tmp"
    zin = zipfile.ZipFile(DECK, "r")
    zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
    built = []
    for item in zin.infolist():
        data = zin.read(item.filename)
        m = re.match(r"ppt/slides/slide(\d+)\.xml$", item.filename)
        if m and int(m.group(1)) in targets and int(m.group(1)) in BUILDERS:
            n = int(m.group(1))
            data = BUILDERS[n]().encode("utf-8")
            built.append(n)
        zout.writestr(item, data)
    zin.close(); zout.close()
    shutil.move(tmp, DECK)
    return built


if __name__ == "__main__":
    args = [int(a) for a in sys.argv[1:]] or sorted(BUILDERS)
    done = inject(set(args))
    print("injected slides:", done)
