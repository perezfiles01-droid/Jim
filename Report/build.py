#!/usr/bin/env python3
"""Build index.html from the sources in src/.

The deliverable is one self contained file, because the people who need
to open it should be able to double click it rather than run a local
server. The sources stay split so that editing one dashboard cannot
disturb another.

Load order matters. core.js creates the DASHBOARDS registry and every
render helper, data.js runs the reconciliation assertions against those
helpers, each dashboard registers itself, and app.js wires the nav last.

    python3 build.py
"""

from pathlib import Path

SRC = Path(__file__).parent / "src"
OUT = Path(__file__).parent / "index.html"

CSS = ["shell.css"]

# Order is load order. Do not sort this list.
JS = [
    "core.js",     # helpers and the DASHBOARDS registry, must be first
    "data.js",     # sample data plus the reconciliation assertions
    "bo.js",       # 1  Bankwide oversight
    "rc.js",       # 2  Risk and compliance
    "di.js",       # 3  Department insight
    "fp.js",       # 4  File plan insights
    "rm.js",       # 5  Records management metrics
    "ah.js",       # 6  Records and archives holdings
    "fs.js",       # 7  Format and storage analysis
    "rd.js",       # 8  Retention and disposition metrics
    "sc.js",       # 9  Security and information classification
    "su.js",       # 10 Search and usage analytics
    "ds.js",       #    Data sources and feasibility
    "app.js",      #    nav wiring, must be last
]


def banner(name, char="="):
    line = char * 65
    return f"\n/* {line}\n   {name}\n   {line} */\n"


def bundle(files, char):
    return "".join(banner(f, char) + (SRC / f).read_text(encoding="utf-8") for f in files)


def main():
    shell = (SRC / "shell.html").read_text(encoding="utf-8")
    missing = [f for f in CSS + JS + ["shell.html"] if not (SRC / f).exists()]
    if missing:
        raise SystemExit("missing source files: " + ", ".join(missing))

    html = shell.replace("/*__CSS__*/", bundle(CSS, "-"))
    html = html.replace("/*__JS__*/", bundle(JS, "="))
    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes) from {len(CSS) + len(JS) + 1} sources")


if __name__ == "__main__":
    main()
