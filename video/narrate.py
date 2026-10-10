# Generates public/vo/<id>.wav with Piper and writes each clip's length into src/scenes.gen.json.
import json, subprocess, wave, sys, os
voice = sys.argv[1]; os.makedirs('public/vo', exist_ok=True)
scenes = json.load(open('scenes.json'))
for s in scenes:
    out = f"public/vo/{s['id']}.wav"
    subprocess.run([sys.executable, '-m', 'piper', '-m', voice, '-s', '0', '--length-scale', '1.05', '-f', out], input=s['text'].encode(), check=True, capture_output=True)
    w = wave.open(out); s['seconds'] = w.getnframes() / w.getframerate()
rects = json.load(open('public/rects.json'))
for s in scenes:
    if s['dash']: s['crop'] = rects[s['dash']][s['id']]
json.dump(scenes, open('src/scenes.gen.json', 'w'), indent=1)
print([(s['id'], round(s['seconds'], 1)) for s in scenes])
