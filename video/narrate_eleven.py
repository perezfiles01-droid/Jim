# Voices every beat in beats.json with ElevenLabs (public/vo/<n>.wav), then writes
# src/beats.gen.json: each beat with its clip length and on-page rectangle.
# Usage: python3 narrate_eleven.py [voice_id]   (default: Matilda, professional)
import json, sys, os, subprocess, urllib.request, wave
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'XrExE9yKIg1WjnnlVkGX'
os.makedirs('public/vo', exist_ok=True)
beats = json.load(open('beats.json')); rects = json.load(open('public/beats.rects.json'))
for i, b in enumerate(beats):
    body = json.dumps({'text': b['t'], 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.15}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
        data=body, headers={'Content-Type': 'application/json'})
    open(f'public/vo/{i}.mp3', 'wb').write(urllib.request.urlopen(req).read())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'public/vo/{i}.mp3', '-ar', '44100', '-ac', '1',
        f'public/vo/{i}.wav'], check=True); os.remove(f'public/vo/{i}.mp3')
    w = wave.open(f'public/vo/{i}.wav'); b['seconds'] = w.getnframes() / w.getframerate(); b['rect'] = rects[i]
json.dump(beats, open('src/beats.gen.json', 'w'), indent=1)
print(round(sum(b['seconds'] for b in beats)), 'seconds of narration')
