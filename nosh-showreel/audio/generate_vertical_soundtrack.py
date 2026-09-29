"""Soundtrack for the vertical "Nosh Video Editing" reel.

Music bed: "Final Step" by Rafael Krux (FreePD.com, 2018), public domain
(CC0 1.0), via github.com/SoundSafari/CC0-1.0-Music. It runs at 119.998 BPM,
so no retiming is needed; the edit places its impacts (every 32 beats) on
frames 120 / 600 / 1080 and splices its real final hit onto frame 1440.

Sound design is synthesized from audio/vertical-cues.json (compiled from
src/vertical/cues.ts). Also exports a per-frame audio envelope used by the
picture (HUD meters, the "SOUND." bounce) to src/vertical/audioEnvelope.json.

Output: public/audio/vertical-soundtrack.wav — 48 kHz / 16-bit, ≈-15 LUFS, ≤ -1.2 dBFS.
Usage: python3 audio/generate_vertical_soundtrack.py
"""
import json
import os
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import ndimage, signal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import generate_soundtrack as gs  # noqa: E402  (shared synth kit)

ROOT = gs.ROOT
SR = gs.SR
FPS = 30
DUR = 53.0
N = int(SR * DUR)
rng = np.random.default_rng(1405)
TRACK = os.path.join(ROOT, "audio", "source", "Rafael Krux - Final Step (FreePD, CC0).mp3")
BEAT0, PERIOD = 0.2045, 0.500010
FIRST_HIT_V = 4.0  # frame 120
FINAL_HIT_V = 48.0  # frame 1440

idx, tt, lp, hp, bp, pan, note, env_ad, sweep_phase = gs.idx, gs.tt, gs.lp, gs.hp, gs.bp, gs.pan, gs.note, gs.env_ad, gs.sweep_phase
DMIN = [62, 65, 67, 69, 72]  # D minor pentatonic


def dm(i, octave=0):
    return note(DMIN[i % 5] + 12 * (octave + i // 5))


class Bus:
    def __init__(self):
        self.buf = np.zeros((N, 2))

    def add(self, x, t, gain=1.0, p=0.0):
        if x.ndim == 1:
            x = pan(x, p)
        i = idx(t)
        if i >= N:
            return
        if i < 0:
            x = x[-i:]
            i = 0
        n = min(len(x), N - i)
        self.buf[i : i + n] += x[:n] * gain


def reverb(x, rt=1.6):
    n = int(rt * SR)
    ir = np.stack([rng.normal(0, 1, n), rng.normal(0, 1, n)], axis=1) * np.exp(-6.9 * tt(n) / rt)[:, None]
    ir = lp(ir, 7000, 2)
    ir = np.concatenate([np.zeros((int(0.015 * SR), 2)), ir])
    ir /= np.sqrt(np.sum(ir**2, axis=0, keepdims=True))
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], axis=1)


# ── new sound design ─────────────────────────────────────────────────
def s_razor():
    n = int(0.45 * SR)
    t = tt(n)
    ring = (np.sin(2 * np.pi * 3150 * t) + 0.7 * np.sin(2 * np.pi * 4730 * t) + 0.4 * np.sin(2 * np.pi * 6880 * t)) * np.exp(-t / 0.11)
    swipe = hp(rng.normal(0, 1, n), 3500) * env_ad(n, 0.004, 0.05)
    return ring * 0.35 + swipe * 0.8


def s_clap():
    n = int(0.3 * SR)
    x = np.zeros(n)
    for d in (0.0, 0.004, 0.009):
        s = idx(d)
        m = int(0.02 * SR)
        x[s : s + m] += bp(rng.normal(0, 1, m), 700, 6000) * np.exp(-tt(m) / 0.006)
    x += np.sin(2 * np.pi * 1150 * tt(n)) * np.exp(-tt(n) / 0.02) * 0.6
    x += np.sin(sweep_phase(210, 120, n)) * np.exp(-tt(n) / 0.05) * 0.8
    return x


def s_snip():
    n = int(0.12 * SR)
    x = np.zeros(n)
    for k, d in enumerate((0.0, 0.045)):
        s = idx(d)
        m = int(0.012 * SR)
        x[s : s + m] += (hp(rng.normal(0, 1, m), 4000) + 0.5 * np.sin(2 * np.pi * 5200 * tt(m))) * np.exp(-tt(m) / 0.003) * (1 if k == 0 else 0.7)
    return x


def s_sweep(dur):
    w = gs.s_whoosh(dur, 400, 7000, peak=0.92)
    return w * 0.7


def s_thump():
    n = int(0.4 * SR)
    return np.sin(sweep_phase(95, 45, n)) * env_ad(n, 0.002, 0.12) + 0.3 * hp(rng.normal(0, 1, n), 3000) * env_ad(n, 0.0005, 0.004)


def s_iris(dur):
    n = int((dur + 0.15) * SR)
    x = lp(rng.normal(0, 1, n), 1800) * np.linspace(0.2, 1, n) * 0.25
    t = 0.0
    gap = 0.05
    while t < dur - 0.02:
        s = idx(t)
        m = int(0.008 * SR)
        x[s : s + m] += hp(rng.normal(0, 1, m), 2500) * np.exp(-tt(m) / 0.002)
        t += gap
        gap = max(0.012, gap * 0.84)  # accelerate, but never stall
    x[-int(0.15 * SR):] += s_shutter()[: int(0.15 * SR)]
    return x


def s_shutter():
    n = int(0.2 * SR)
    x = np.zeros(n)
    for k, d in enumerate((0.0, 0.07)):
        s = idx(d)
        m = int(0.03 * SR)
        x[s : s + m] += bp(rng.normal(0, 1, m), 900, 5000) * np.exp(-tt(m) / 0.006) * (1 if k == 0 else 0.75)
    return x


def s_zip(dur):
    n = int(dur * SR)
    ph = sweep_phase(280, 1600, n)
    flutter = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 38 * tt(n)))
    return np.sin(ph) * flutter * np.linspace(0.3, 1, n) * np.minimum(1, (dur - tt(n)) / 0.03) * 0.5


def s_beep():
    n = int(0.2 * SR)
    x = np.zeros(n)
    for d in (0.0, 0.09):
        s = idx(d)
        m = int(0.05 * SR)
        x[s : s + m] += np.sin(2 * np.pi * 2350 * tt(m)) * np.hanning(m)
    return x


def s_riser(dur):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = hp(rng.normal(0, 1, n), 1500) * t**2.5 * 0.7 + np.sin(sweep_phase(160, 1400, n)) * t**2 * 0.35
    return x


def s_sparkle(v=1.0):
    n = int(1.0 * SR)
    x = np.zeros(n)
    for k in range(26):
        s = int(rng.uniform(0, 0.35) * SR)
        m = int(0.25 * SR)
        f = dm(int(rng.integers(0, 10)), 3)
        seg = np.sin(2 * np.pi * f * tt(m)) * np.exp(-tt(m) / 0.08)
        x[s : s + m] += seg * rng.uniform(0.3, 1)
    return x * v / 5


def s_swell(dur):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    base = sum(np.sin(2 * np.pi * note(m) * tt(n)) for m in (50, 57, 62, 65))  # D minor
    return lp(base * t**2, 1800, 2) * 0.18 + lp(rng.normal(0, 1, n), 2500) * t**3 * 0.12


def s_projector(dur):
    n = int(dur * SR)
    x = np.zeros(n)
    step = SR // 24
    for s in range(0, n - 200, step):
        m = int(0.006 * SR)
        x[s : s + m] += bp(rng.normal(0, 1, m), 1500, 5000) * np.exp(-tt(m) / 0.0015)
    x += lp(rng.normal(0, 1, n), 300) * 0.25
    env = np.minimum(1, tt(n) / 0.2) * np.minimum(1, (dur - tt(n)) / 0.4)
    return x * env


# ── music bed ────────────────────────────────────────────────────────
def smoothstep(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def music_bed():
    y, sr = sf.read(TRACK, always_2d=True)
    if sr != SR:  # the FreePD master is 44.1 kHz → 48 kHz (polyphase)
        from math import gcd

        g = gcd(SR, sr)
        y = signal.resample_poly(y, SR // g, sr // g, axis=0)
    tb = lambda k: BEAT0 + PERIOD * k  # noqa: E731
    # align on the measured beat grid (the big booms have slow sub-bass attacks,
    # so transient pickers land late; the grid is accurate to ~5 ms)
    first = tb(15)
    final = tb(175)
    off_a = first - FIRST_HIT_V
    off_b = final - FINAL_HIT_V
    v = tt(N)
    seg_a = y[np.clip(((v + off_a) * SR).astype(int), 0, len(y) - 1)]
    seg_b = y[np.clip(((v + off_b) * SR).astype(int), 0, len(y) - 1)]

    cut = np.full(N, 20000.0)
    m1 = v < FIRST_HIT_V
    cut[m1] = 900 * (16000 / 900) ** (smoothstep(v[m1] / (FIRST_HIT_V - 0.05)) ** 1.5)
    m3 = (v >= FINAL_HIT_V - 0.55) & (v < FINAL_HIT_V)
    cut[m3] = 16000 * (260 / 16000) ** smoothstep((v[m3] - (FINAL_HIT_V - 0.55)) / 0.5)
    bank_f = [260, 420, 680, 1100, 1800, 2900, 4600, 7400, 11800, 16000]
    bank = [signal.sosfiltfilt(gs.sos("lowpass", f, 2), seg_a, axis=0) for f in bank_f] + [seg_a]
    bank_f = bank_f + [20000.0]
    pos = np.interp(np.log(cut), np.log(bank_f), np.arange(len(bank_f)))
    i0 = np.floor(pos).astype(int)
    i1 = np.minimum(i0 + 1, len(bank_f) - 1)
    w = (pos - i0)[:, None]
    stack = np.stack(bank)
    ar = np.arange(N)
    filt = stack[i0, ar] * (1 - w) + stack[i1, ar] * w

    g = np.zeros(N)
    g[m1] = -3 + 3 * smoothstep(v[m1] / FIRST_HIT_V)
    dip = (v >= FIRST_HIT_V - 0.12) & (v < FIRST_HIT_V - 0.004)
    g[dip] = -11
    mc = (v >= FINAL_HIT_V - 0.55) & (v < FINAL_HIT_V)
    g[mc] = -36 * smoothstep((v[mc] - (FINAL_HIT_V - 0.55)) / 0.5)
    bed = filt * (10 ** (g / 20))[:, None]
    bed[v >= FINAL_HIT_V - 0.003] = 0

    b0 = idx(FINAL_HIT_V - 0.003)
    tail = seg_b[b0:].copy()
    fi = int(0.003 * SR)
    tail[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = v[b0:] > DUR - 0.8
    tail[fo] *= (np.linspace(1, 0, fo.sum()) ** 2)[:, None]
    bed[b0:] += tail
    for k, name in ((47, "impact 2"), (79, "impact 3")):
        print(f"  {name}: track {tb(k):.2f}s → video {tb(k) - off_a:.3f}s")
    print(f"music: first impact {first:.3f}s → {FIRST_HIT_V}s, final hit {final:.3f}s → {FINAL_HIT_V}s")
    return bed


# ── build ────────────────────────────────────────────────────────────
def build():
    cues = json.load(open(os.path.join(ROOT, "audio", "vertical-cues.json")))["cues"]
    sfx = Bus()
    send = Bus()
    for c in cues:
        t = c["f"] / FPS
        ty = c["type"]
        dur = c.get("dur", 0) / FPS
        i = c.get("i", 0)
        v = c.get("v", 1.0)
        if ty == "tick":
            sfx.add(gs.s_tick(v), t, 0.12)
        elif ty == "swish":
            sfx.add(gs.s_whoosh(max(0.25, dur), 900, 6500, peak=0.45), t, 0.07 * v)
        elif ty == "whoosh":
            sfx.add(gs.s_whoosh(max(0.35, dur), 450, 5200, peak=0.5), t, 0.13 * v)
        elif ty == "whip":
            w = gs.s_whoosh(dur + 0.12, 500, 5600, peak=0.5)
            sfx.add(w, t - 0.04, 0.18)
        elif ty == "scramble":
            sfx.add(gs.s_scramble(max(0.3, dur)), t, 0.022, p=0.1)
        elif ty == "hit":
            x = gs.s_hit(False)
            sfx.add(x, t, 0.22 * v)
            send.add(x, t, 0.07 * v)
        elif ty == "razor":
            x = s_razor()
            sfx.add(x, t, 0.2, p=0.2)
            send.add(x, t, 0.1)
        elif ty == "clap":
            x = s_clap()
            sfx.add(x, t, 0.5)
            send.add(x, t, 0.2)
        elif ty == "thock":
            sfx.add(gs.s_thock(), t, 0.14, p=[-0.4, -0.1, 0.15, 0.4][i % 4])
        elif ty == "snip":
            sfx.add(s_snip(), t, 0.22, p=-0.2 + 0.13 * (i % 4))
        elif ty == "sweep":
            sfx.add(s_sweep(max(0.5, dur)), t, 0.07)
        elif ty == "thump":
            sfx.add(s_thump(), t, 0.3)
        elif ty == "blip":
            sfx.add(gs.s_blip(dm(i, 2), 0.07, 0.02), t, 0.035, p=-0.3 + 0.06 * (i % 10))
        elif ty == "pop":
            sfx.add(gs.s_pop(v), t, 0.12, p=rng.uniform(-0.3, 0.3))
        elif ty == "iris":
            sfx.add(s_iris(dur), t, 0.2)
        elif ty == "shutter":
            sfx.add(s_shutter(), t, 0.25)
        elif ty == "zip":
            sfx.add(s_zip(max(0.3, dur)), t, 0.09)
        elif ty == "beep":
            sfx.add(s_beep(), t, 0.06, p=0.3)
        elif ty == "glitch":
            sfx.add(gs.s_glitch(140), t, 0.12)
            sfx.add(gs.s_glitch(90), t + 0.12, 0.09)
        elif ty == "success":
            x = gs.s_chime([81, 86], 0.07)  # A5 → D6
            sfx.add(x, t, 0.09, p=0.2)
            send.add(x, t, 0.07)
        elif ty == "typing":
            gs.s_typing(int(round(c["dur"])), t, sfx, gain=0.05)
        elif ty == "click":
            sfx.add(gs.s_click(), t, 0.18, p=0.2)
        elif ty == "riser":
            sfx.add(pan(s_riser(max(0.4, dur)), 0), t, 0.12)
        elif ty == "sparkle":
            x = s_sparkle(v)
            sfx.add(x, t, 0.18)
            send.add(x, t, 0.12)
        elif ty == "swell":
            sfx.add(pan(s_swell(max(0.5, dur)), 0), t, 0.5)
        elif ty == "projector":
            sfx.add(s_projector(max(0.5, dur)), t, 0.06, p=-0.2)
        elif ty == "suck":
            x = gs.s_suck(max(0.2, dur))
            sfx.add(pan(x, 0), t, 0.14)
        elif ty == "drop":
            x = gs.s_drop(True)
            sfx.add(pan(x, 0), t, 0.26)
            send.add(pan(x, 0), t, 0.14)

    music = music_bed()
    wet = reverb(send.buf)
    mix = gs.hp(music + sfx.buf + wet * 0.5, 22, 2)

    meter = pyln.Meter(SR)
    mix *= 10 ** ((-15.0 - meter.integrated_loudness(mix)) / 20)
    ceiling = 10 ** (-1.2 / 20)
    look = int(0.004 * SR)
    peak = ndimage.maximum_filter1d(np.max(np.abs(mix), axis=1), size=2 * look + 1)
    gain = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    rel = np.exp(-1 / (0.12 * SR))
    g_s = gain.copy()
    for k in range(1, N):
        g_s[k] = min(gain[k], rel * g_s[k - 1] + (1 - rel) * gain[k])
    mix *= g_s[:, None]
    mix = np.clip(mix, -ceiling, ceiling)
    fi = int(0.004 * SR)
    mix[:fi] *= np.linspace(0, 1, fi)[:, None]
    mix[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]

    out = os.path.join(ROOT, "public", "audio", "vertical-soundtrack.wav")
    sf.write(out, mix, SR, subtype="PCM_16")
    print(f"wrote {out}: {meter.integrated_loudness(mix):.1f} LUFS, peak {20*np.log10(np.max(np.abs(mix))):.2f} dBFS, limiter GR {20*np.log10(g_s.min()):.1f} dB, {len(cues)} cues")

    # per-frame envelope for the picture
    mono = mix.mean(1)
    low = lp(mono, 200, 2)
    high = hp(mono, 4000, 2)
    frames = int(DUR * FPS)
    spf = SR // FPS

    def lev(x):
        vals = []
        for k in range(frames):
            s = x[k * spf : (k + 1) * spf]
            db = 20 * np.log10(np.sqrt(np.mean(s**2)) + 1e-9)
            vals.append(round(float(np.clip((db + 42) / 34, 0, 1)), 3))
        return vals

    env = {"fps": FPS, "frames": frames, "rms": lev(mono), "low": lev(low), "high": lev(high)}
    with open(os.path.join(ROOT, "src", "vertical", "audioEnvelope.json"), "w") as fh:
        json.dump(env, fh)
    print(f"wrote src/vertical/audioEnvelope.json ({frames} frames, mean rms {np.mean(env['rms']):.2f})")


if __name__ == "__main__":
    build()
