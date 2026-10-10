# Synthesises a soft, royalty-free background bed (public/music.wav): warm pad
# chords, a gentle plucked arpeggio and a light pulse, at 84 bpm. Usage: python3 music.py <seconds>
import numpy as np, wave, sys
SR = 44100; BPM = 84; beat = 60 / BPM; secs = float(sys.argv[1]) + 4
n = int(SR * (secs + 8)); out = np.zeros((n, 2))  # headroom so the last bar never overruns
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]  # Am7 Fmaj7 Cmaj7 G7
bar = 4 * beat
for i in range(int(secs / bar) + 1):  # whole bars, trimmed below
    ch = prog[i % 4]; s0 = int(i * bar * SR); L = int(bar * SR * 1.15); seg = np.arange(L) / SR
    env = np.minimum(1, seg / 0.8) * np.minimum(1, (bar * 1.15 - seg) / 0.6)
    for j, m in enumerate(ch):  # pad: detuned sines, panned
        f = midi(m); v = (np.sin(2*np.pi*f*seg) + 0.5*np.sin(2*np.pi*f*1.003*seg) + 0.25*np.sin(2*np.pi*2*f*seg)) * env * 0.05
        e = min(n, s0 + L); pan = 0.3 + 0.4 * (j / 3)
        out[s0:e, 0] += v[:e-s0] * (1 - pan); out[s0:e, 1] += v[:e-s0] * pan
    bass = midi(ch[0] - 12)
    for k in range(8):  # arpeggio in eighths, plus bass on beats 1 and 3
        st = int((i * bar + k * beat / 2) * SR); Lp = int(0.6 * SR); sg = np.arange(Lp) / SR
        f = midi([ch[0], ch[1], ch[2], ch[3], ch[2] + 12, ch[3], ch[2], ch[1]][k] + 12)
        p = np.sin(2*np.pi*f*sg) * np.exp(-sg * 7) * 0.035
        e = min(n, st + Lp); side = k % 2
        out[st:e, side] += p[:e-st]; out[st:e, 1-side] += p[:e-st] * 0.6
        if k in (0, 4):
            b = np.sin(2*np.pi*bass*sg) * np.exp(-sg * 3) * 0.12; out[st:e] += b[:e-st, None]
    for k in range(4):  # soft kick-like pulse
        st = int((i * bar + k * beat) * SR); Lk = int(0.25 * SR); sg = np.arange(Lk) / SR
        kk = np.sin(2*np.pi*(55 + 60*np.exp(-sg*30))*sg) * np.exp(-sg*14) * 0.08
        e = min(n, st + Lk); out[st:e] += kk[:e-st, None]
out = out[:int(SR * secs)]; t = np.arange(len(out)) / SR
fade = np.minimum(1, np.minimum(t / 2, (secs - t) / 3))[:, None]; out *= fade
out = out / np.abs(out).max() * 0.8
with wave.open('public/music.wav', 'wb') as w:  # converted to music.mp3 by build.sh
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
