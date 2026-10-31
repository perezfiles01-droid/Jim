# Voices every beat in beats.json with Kokoro (free, runs locally), voice am_michael.
# Writes public/vo/<n>.wav and src/beats.gen.json with each clip's length.
# Usage: python3 narrate_kokoro.py   (model and voice in tts/, see KT_VIDEO_HANDOFF.md)
import json, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
np.savez('tts/voices.npz', am_michael=np.fromfile('tts/am_michael.bin', dtype=np.float32).reshape(-1, 1, 256))
k = Kokoro('tts/model_quantized.onnx', 'tts/voices.npz')
beats = json.load(open('beats.json'))
for i, b in enumerate(beats):
    s, sr = k.create(b['t'], voice='am_michael', speed=1.0, lang='en-us')
    sf.write(f'public/vo/{i}.wav', s, sr); b['seconds'] = len(s) / sr
json.dump(beats, open('src/beats.gen.json', 'w'), indent=1)
print(round(sum(b['seconds'] for b in beats)), 'seconds of narration')
