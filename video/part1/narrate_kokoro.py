# Voices every beat in beats.json with Kokoro (free, runs locally), voice am_michael.
# Writes public/vo/<n>.wav and src/beats.gen.json with each clip's length.
# Usage: python3 narrate_kokoro.py   (model and voice in tts/, see KT_VIDEO_HANDOFF.md)
import json, os, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from pronounce import phonemes
np.savez('tts/voices.npz', am_michael=np.fromfile('tts/am_michael.bin', dtype=np.float32).reshape(-1, 1, 256))
k = Kokoro('tts/model_quantized.onnx', 'tts/voices.npz')
beats = json.load(open('beats.json'))
ONLY = set(map(int, sys.argv[1:]))  # optional: re-voice only these beats
old = {i: x for i, x in enumerate(json.load(open('src/beats.gen.json')))} if ONLY else {}
for i, b in enumerate(beats):
    if ONLY and i not in ONLY: b['seconds'] = old[i]['seconds']; continue
    s, sr = k.create(phonemes(k, b['t']), voice='am_michael', speed=1.0, is_phonemes=True)
    sf.write(f'public/vo/{i}.wav', s, sr); b['seconds'] = len(s) / sr
json.dump(beats, open('src/beats.gen.json', 'w'), indent=1)
print(round(sum(b['seconds'] for b in beats)), 'seconds of narration')
