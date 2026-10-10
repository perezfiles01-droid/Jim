#!/bin/sh
# Rebuilds the walkthrough end to end. Usage: ./build.sh <path to en-us-libritts-high.onnx>
set -e; cd "$(dirname "$0")"
CHROME=${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome} NODE_PATH=../node_modules node shoot.js ../index.html
python3 narrate.py "$1"
python3 music.py "$(python3 -c "import json;b=json.load(open('src/beats.gen.json'));print(int(sum(x['seconds'] for x in b))+len(b))")"
ffmpeg -v error -y -i public/music.wav -b:a 160k public/music.mp3 && rm public/music.wav
npx remotion render src/index.jsx Walkthrough out/edrms-walkthrough.mp4 \
  --browser-executable=${HEADLESS:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
