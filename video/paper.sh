#!/bin/sh
# Renders the printed-report walkthrough: one PNG per page in paper/, plus paper/walkthrough.pdf.
set -e; cd "$(dirname "$0")"; mkdir -p paper
B=--browser-executable=${HEADLESS:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
N=$(node -e "const b=require('./src/beats.gen.json');const s=new Set(b.filter(x=>x.dash).map((x,i,a)=>x.dash+x.sec));console.log(s.size-1)")
for i in $(seq 0 $((N-1))); do
  npx remotion still src/index.jsx Paper "paper/page-$(printf %02d $((i+1))).png" --frame=$i --scale=2 $B >/dev/null 2>&1
done
python3 -c "
from PIL import Image; import glob
p=[Image.open(f).convert('RGB') for f in sorted(glob.glob('paper/page-*.png'))]
p[0].save('paper/walkthrough.pdf', save_all=True, append_images=p[1:], resolution=300)"
