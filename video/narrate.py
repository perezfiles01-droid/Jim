# Voices every beat in beats.json with Piper (public/vo/<n>.wav), then writes
# src/beats.gen.json: each beat with its clip length and on-page rectangle.
# Usage: python3 narrate.py <path to en-us-libritts-high.onnx>
import json, sys, wave, os
from piper import PiperVoice
from piper.config import SynthesisConfig
SPEAKER = 441  # picked from a scan of LibriTTS speakers for the widest natural pitch range
voice = PiperVoice.load(sys.argv[1]); os.makedirs('public/vo', exist_ok=True)
cfg = SynthesisConfig(speaker_id=SPEAKER, length_scale=1.0, noise_scale=0.75, noise_w_scale=0.9)
beats = json.load(open('beats.json')); rects = json.load(open('public/beats.rects.json'))
for i, b in enumerate(beats):
    out = f'public/vo/{i}.wav'
    with wave.open(out, 'wb') as w: voice.synthesize_wav(b['t'], w, syn_config=cfg)
    w = wave.open(out); b['seconds'] = w.getnframes() / w.getframerate(); b['rect'] = rects[i]
json.dump(beats, open('src/beats.gen.json', 'w'), indent=1)
print(round(sum(b['seconds'] for b in beats)), 'seconds of narration')
