"""Build the reel's soundtrack: an openly licensed music bed, edited to picture,
plus a synthesized sound-design layer. Both are driven by audio/cues.json,
which scripts/export-cues.mjs compiles from the same timeline the video uses.

Music bed: "Take the Ride" by Bryan Teoh (FreePD.com, 2020), released into the
public domain (CC0 1.0). Sourced from github.com/SoundSafari/CC0-1.0-Music.

Edit (see README): the track (120.999 BPM) is resampled to exactly 120 BPM so
its beats sit on the picture's 15-frame grid; its own drop (beat 32) lands on
the logo drop at 0:12.00; a low-pass sweep + 5-frame gap builds into it; the
finale collapses the bed and splices to the track's real final hit (beat 512)
at 0:56.00, whose tail rings out under the lock-up.

Output: public/audio/soundtrack.wav — 48 kHz / 16-bit stereo, -14 LUFS, <= -1 dBFS.
Usage: python3 audio/generate_soundtrack.py
"""
import json
import os

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import ndimage, signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 60.0
N = int(SR * DUR)
FPS = 30
rng = np.random.default_rng(2026)

TRACK = os.path.join(ROOT, "audio", "source", "Bryan Teoh - Take the Ride (FreePD, CC0).mp3")
BEAT0, PERIOD = 0.0310, 0.495871  # measured beat grid of the source (120.999 BPM)
STRETCH = 121 / 120  # resample ratio → exactly 120 BPM (-14 cents, inaudible)

DROP_V = 12.0  # logo drop (frame 360)
END_V = 56.0  # final lock-up impact (frame 1680)


# ── helpers ──────────────────────────────────────────────────────────
def idx(t):
    return int(round(t * SR))


def tt(n):
    return np.arange(n) / SR


def sos(kind, f, order=4):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def lp(x, f, order=4):
    return signal.sosfilt(sos("lowpass", f, order), x, axis=0)


def hp(x, f, order=4):
    return signal.sosfilt(sos("highpass", f, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], btype="bandpass", fs=SR, output="sos"), x, axis=0)


def pan(x, p):
    a = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# C# major pentatonic (the track is in C# major) — all pitched SFX use it
PENT = [61, 63, 65, 68, 70]


def pent(i, octave=0):
    return note(PENT[i % 5] + 12 * (octave + i // 5))


def env_ad(n, attack, tau):
    a = max(1, int(attack * SR))
    e = np.exp(-tt(n) / tau)
    e[:a] *= np.linspace(0, 1, a)
    return e


def sweep_phase(f0, f1, n):
    f = f0 * (f1 / f0) ** (np.arange(n) / max(1, n - 1))
    return np.cumsum(f) / SR * 2 * np.pi


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


# ── music bed ────────────────────────────────────────────────────────
def onset_near(y, t, win=0.06):
    """Refine a grid time to the actual transient (max rise of low-band energy)."""
    mono = y.mean(1)
    seg = mono[idx(t - win) : idx(t + win)]
    e = np.convolve(np.abs(lp(seg, 180, 2)), np.ones(96) / 96, mode="same")
    rise = np.diff(e, prepend=e[0])
    return t - win + np.argmax(rise) / SR


def smoothstep(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def music_bed():
    y, sr = sf.read(TRACK, always_2d=True)
    assert sr == SR, sr
    y = signal.resample_poly(y, 121, 120, axis=0)
    tb = lambda k: (BEAT0 + PERIOD * k) * STRETCH  # noqa: E731

    drop_onset = onset_near(y, tb(32))
    end_onset = onset_near(y, tb(512))
    off_a = drop_onset - DROP_V  # video v ↔ track v + off_a
    off_b = end_onset - END_V

    v = tt(N)
    bed = np.zeros((N, 2))
    a_idx = np.clip(((v + off_a) * SR).astype(int), 0, len(y) - 1)
    b_idx = np.clip(((v + off_b) * SR).astype(int), 0, len(y) - 1)
    seg_a = y[a_idx]
    seg_b = y[b_idx]

    # time-varying low-pass via zero-phase filter bank crossfade (phase-coherent)
    cut = np.full(N, 20000.0)
    m1 = v < 5.0
    cut[m1] = 650
    m2 = (v >= 5.0) & (v < 11.84)
    cut[m2] = 650 * (14000 / 650) ** smoothstep((v[m2] - 5.0) / 6.84) ** 1.6
    m3 = (v >= 55.45) & (v < END_V)
    cut[m3] = 14000 * (260 / 14000) ** smoothstep((v[m3] - 55.45) / 0.5)
    bank_f = [260, 400, 650, 1000, 1600, 2500, 4000, 6300, 10000, 14000]
    bank = [signal.sosfiltfilt(sos("lowpass", f, 2), seg_a, axis=0) for f in bank_f] + [seg_a]
    bank_f = bank_f + [20000.0]
    lf = np.log(cut)
    lb = np.log(bank_f)
    pos = np.interp(lf, lb, np.arange(len(bank_f)))
    i0 = np.floor(pos).astype(int)
    i1 = np.minimum(i0 + 1, len(bank_f) - 1)
    w = (pos - i0)[:, None]
    stack = np.stack(bank)  # (B, N, 2)
    ar = np.arange(N)
    filt_a = stack[i0, ar] * (1 - w) + stack[i1, ar] * w

    # gain automation (dB)
    g = np.zeros(N)
    g[v < 5.0] = -7 + 2 * (v[v < 5.0] / 5.0)
    g[m2] = -5 + 4 * smoothstep((v[m2] - 5.0) / 6.84)
    gain_a = 10 ** (g / 20)
    # 5-frame gap before the drop (11.84 → 12.00), 6 ms ramps
    gap = np.ones(N)
    r = int(0.006 * SR)
    g0, g1 = idx(11.84), idx(DROP_V) - int(0.004 * SR)
    gap[g0:g1] = 0
    gap[g0 - r : g0] = np.linspace(1, 0, r)
    r2 = int(0.002 * SR)
    gap[g1 : g1 + r2] = np.linspace(0, 1, r2)
    # finale collapse into the dot (-36 dB by the splice)
    col = np.ones(N)
    mc = (v >= 55.45) & (v < END_V)
    col[mc] = 10 ** (-36 * smoothstep((v[mc] - 55.45) / 0.5) / 20)
    bed = filt_a * (gain_a * gap * col)[:, None]
    bed[v >= END_V] = 0

    # ending: the track's real final hit + tail, from 3 ms before the onset
    b0 = idx(END_V - 0.003)
    fade_in = np.linspace(0, 1, int(0.003 * SR))
    tail = seg_b[b0:].copy()
    tail[: len(fade_in)] *= fade_in[:, None]
    fo = v[b0:] > 59.4
    tail[fo] *= np.linspace(1, 0, fo.sum())[:, None] ** 2
    bed[b0:] += tail
    print(f"music: drop onset {drop_onset:.3f}s → 12.000s, final hit {end_onset:.3f}s → 56.000s (track offset {off_a:+.3f}s / {off_b:+.3f}s)")
    return bed


# ── sound design (synth) ─────────────────────────────────────────────
def s_pop(v=1.0):
    n = int(0.12 * SR)
    ph = sweep_phase(520, 1180, n)
    x = np.sin(ph) * env_ad(n, 0.002, 0.035)
    x += 0.4 * hp(rng.normal(0, 1, n), 3000) * env_ad(n, 0.0005, 0.004)
    return x * v


def s_tick(v=1.0):
    n = int(0.06 * SR)
    x = np.sin(2 * np.pi * 2217 * tt(n)) * env_ad(n, 0.0005, 0.012)
    x += 0.5 * hp(rng.normal(0, 1, n), 4000) * env_ad(n, 0.0003, 0.003)
    return x * v


def s_ring(dur):
    n = int(dur * SR)
    t = tt(n)
    trill = (signal.square(2 * np.pi * 17 * t) + 1) / 2
    a = np.sin(2 * np.pi * note(87) * t) + 0.25 * np.sin(2 * np.pi * note(87) * 2.76 * t)  # D#6
    b = np.sin(2 * np.pi * note(92) * t) + 0.25 * np.sin(2 * np.pi * note(92) * 2.76 * t)  # G#6
    x = a * trill + b * (1 - trill)
    e = np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.06)
    return lp(x * e, 6000, 2)


def s_typing(chars, start, bus, gain=0.07):
    for c in range(chars):
        t = start + c / FPS + rng.uniform(-0.006, 0.006)
        n = int(0.03 * SR)
        x = bp(rng.normal(0, 1, n), 1800, 7000) * env_ad(n, 0.0003, 0.006)
        x += 0.6 * np.sin(2 * np.pi * 190 * tt(n)) * env_ad(n, 0.001, 0.012)
        bus.add(x, t, gain * rng.uniform(0.7, 1.1), p=-0.15)


def s_missed():
    n = int(0.5 * SR)
    ph = sweep_phase(note(80), note(68), n)  # G#5 → G#4, down an octave
    x = (np.sin(ph) + 0.5 * np.sin(ph * 1.5)) * env_ad(n, 0.004, 0.16)
    thud = np.sin(sweep_phase(110, 45, n)) * env_ad(n, 0.002, 0.09)
    return lp(x, 5000, 2) * 0.8 + thud


def s_glitch(n_ms=110):
    n = int(n_ms / 1000 * SR)
    hold = rng.integers(20, 90)
    src = np.repeat(rng.choice([-1.0, 1.0], n // hold + 1), hold)[:n]
    src *= np.repeat(rng.uniform(0.3, 1, n // 400 + 1), 400)[:n]
    gate = (np.floor(tt(n) / 0.018) % 2 == 0).astype(float)
    return bp(src * gate, 300, 6000) * 0.6


def s_whoosh(dur, f_lo=350, f_hi=4200, peak=0.55):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    env = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    noise = rng.normal(0, 1, n)
    # stepped band-pass sweep (blocks), crossfaded
    out = np.zeros(n)
    blocks = 24
    for k in range(blocks):
        c = f_lo * (f_hi / f_lo) ** np.sin(np.pi * min(1, (k + 0.5) / blocks) * 0.999) if peak < 0.9 else f_lo * (f_hi / f_lo) ** ((k + 0.5) / blocks)
        seg = bp(noise, c * 0.6, min(c * 1.6, SR / 2 - 100))
        w = np.clip(1 - np.abs(t * blocks - (k + 0.5)), 0, 1)
        out += seg * w
    x = out * env
    pan_curve = np.linspace(-0.6, 0.6, n)
    return np.stack([x * np.cos((pan_curve + 1) * np.pi / 4), x * np.sin((pan_curve + 1) * np.pi / 4)], axis=1)


def s_notif(i):
    n = int(0.22 * SR)
    f = pent(int(rng.integers(0, 10)), 1)
    t = tt(n)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2 * t)) * env_ad(n, 0.002, 0.05)
    x += 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * env_ad(n, 0.02, 0.04) * (t > 0.05)
    return x


def s_hit(big=False):
    n = int(0.6 * SR)
    kick = np.sin(sweep_phase(140, 44, n)) * env_ad(n, 0.001, 0.14 if big else 0.1)
    snap = bp(rng.normal(0, 1, n), 1200, 7000) * env_ad(n, 0.0005, 0.05)
    return kick * 0.9 + snap * (0.5 if big else 0.35)


def s_suck(dur):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    noise = hp(rng.normal(0, 1, n), 2500)
    riser = np.sin(sweep_phase(220, 2200, n)) * 0.25
    x = (noise * 0.8 + riser) * t**3
    x[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))
    return x


def s_drop(final=False):
    n = int(3.2 * SR)
    sub = np.tanh(2.2 * np.sin(sweep_phase(62, 30, n))) * env_ad(n, 0.002, 1.0 if final else 0.8)
    burst = lp(rng.normal(0, 1, n), 2600) * env_ad(n, 0.001, 0.09)
    crash = hp(rng.normal(0, 1, n), 5000) * env_ad(n, 0.002, 0.9) * 0.35
    return sub * 0.9 + burst * 0.5 + crash


def s_thock():
    n = int(0.25 * SR)
    x = np.sin(sweep_phase(150, 78, n)) * env_ad(n, 0.001, 0.07)
    x += 0.3 * hp(rng.normal(0, 1, n), 2500) * env_ad(n, 0.0005, 0.005)
    return x


def s_scramble(dur):
    n = int(dur * SR)
    x = np.zeros(n)
    step = int(0.028 * SR)
    blip = int(0.012 * SR)
    for s in range(0, n - blip, step):
        f = pent(int(rng.integers(0, 10)), 2)
        x[s : s + blip] += signal.square(2 * np.pi * f * tt(blip)) * np.hanning(blip)
    return lp(x, 7000, 2) * 0.6


def s_dive(dur):
    w = s_whoosh(dur, 250, 5200, peak=0.92)
    n = w.shape[0]
    riser = np.sin(sweep_phase(90, 900, n)) * np.linspace(0, 1, n) ** 2 * 0.35
    w += pan(lp(riser, 3000, 2), 0)
    return w


def s_whump():
    n = int(0.5 * SR)
    return np.sin(sweep_phase(95, 40, n)) * env_ad(n, 0.002, 0.12)


def s_assemble(dur):
    n = int(dur * SR)
    x = np.zeros((n, 2))
    for k in range(70):
        t0 = int((1 - (1 - rng.uniform()) ** 2.5) * (n - 4000))
        g = int(0.06 * SR)
        f = pent(int(rng.integers(0, 10)), 2)
        grain = np.sin(2 * np.pi * f * tt(g)) * np.hanning(g)
        x[t0 : t0 + g] += pan(grain, rng.uniform(-0.9, 0.9)) * rng.uniform(0.3, 1)
    return x


def s_chime(notes, gap=0.07):
    n = int(1.4 * SR)
    x = np.zeros(n)
    for k, m in enumerate(notes):
        s = int(k * gap * SR)
        tn = tt(n - s)
        f = note(m)
        x[s:] += (np.sin(2 * np.pi * f * tn) + 0.3 * np.sin(2 * np.pi * f * 2.76 * tn) + 0.12 * np.sin(2 * np.pi * f * 5.4 * tn)) * np.exp(-tn / 0.35)
    return x


def s_blip(f, dur=0.09, tau=0.03):
    n = int(dur * SR)
    t = tt(n)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * env_ad(n, 0.001, tau)


def s_bubble(user):
    n = int(0.1 * SR)
    ph = sweep_phase(700 if user else 480, 1300 if user else 860, n)
    return np.sin(ph) * env_ad(n, 0.001, 0.025)


def s_slam():
    n = int(0.4 * SR)
    x = np.sin(sweep_phase(110, 52, n)) * env_ad(n, 0.001, 0.09)
    x += lp(rng.normal(0, 1, n), 900) * env_ad(n, 0.001, 0.03) * 0.8
    return x


def s_clockspin(dur):
    n = int(dur * SR)
    x = np.zeros(n)
    t = 0.0
    gap = 0.018
    while t < dur - 0.02:
        x[idx(t) : idx(t) + int(0.02 * SR)] += s_tick()[: int(0.02 * SR)] * 0.8
        t += gap
        gap *= 1.12
    return x


def s_click():
    n = int(0.12 * SR)
    x = np.zeros(n)
    for k, t0 in enumerate([0.0, 0.07]):
        c = int(0.006 * SR)
        s = idx(t0)
        x[s : s + c] += (hp(rng.normal(0, 1, c), 2500) * 0.8 + np.sin(2 * np.pi * 3400 * tt(c)) * 0.5) * np.exp(-tt(c) / 0.0015) * (1 if k == 0 else 0.6)
    return x


# ── reverb ───────────────────────────────────────────────────────────
def reverb(x, rt=1.8, pre=0.018, wet_lp=7000):
    n = int(rt * SR)
    t = tt(n)
    ir = np.stack([rng.normal(0, 1, n), rng.normal(0, 1, n)], axis=1) * np.exp(-6.9 * t / rt)[:, None]
    ir = lp(ir, wet_lp, 2)
    ir = np.concatenate([np.zeros((int(pre * SR), 2)), ir])
    ir /= np.sqrt(np.sum(ir**2, axis=0, keepdims=True))
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], axis=1)
    return out


# ── build ────────────────────────────────────────────────────────────
def build():
    cues = json.load(open(os.path.join(ROOT, "audio", "cues.json")))["cues"]
    sfx = Bus()
    send = Bus()  # reverb send
    duck_events = []

    for c in cues:
        t = c["f"] / FPS
        ty = c["type"]
        dur = c.get("dur", 0) / FPS
        i = c.get("i", 0)
        v = c.get("v", 1.0)
        if ty == "pop":
            x = s_pop(v)
            sfx.add(x, t, 0.22)
            send.add(x, t, 0.1)
        elif ty == "tick":
            sfx.add(s_tick(v), t, 0.11, p=0.1)
        elif ty == "ring":
            x = s_ring(dur + 0.05)
            sfx.add(x, t, 0.1, p=0.35)
            send.add(x, t, 0.07, p=0.35)
        elif ty == "typing":
            s_typing(int(round(c["dur"])), t, sfx)
        elif ty == "missed":
            x = s_missed()
            sfx.add(x, t, 0.26, p=0.3)
            send.add(x, t, 0.12)
            sfx.add(s_glitch(90), t + 0.02, 0.1)
        elif ty == "swoosh":
            w = s_whoosh(max(dur, 0.5))
            sfx.add(w, t, 0.1)
        elif ty == "notif":
            x = s_notif(i)
            g = 0.035 + 0.035 * min(1, i / 40)
            sfx.add(x, t, g, p=rng.uniform(-0.75, 0.75))
            send.add(x, t, g * 0.6)
        elif ty == "hit":
            big = i >= 10
            x = s_hit(big)
            sfx.add(x, t, 0.34 if big else 0.28)
            send.add(x, t, 0.1)
            duck_events.append((t, 0.18, 3.0))
        elif ty == "glitch":
            sfx.add(s_glitch(), t, 0.1, p=rng.uniform(-0.5, 0.5))
        elif ty == "suck":
            x = s_suck(dur)
            sfx.add(pan(x, 0), t, 0.16)
            send.add(pan(x, 0), t, 0.06)
        elif ty == "drop":
            final = i == 1
            x = s_drop(final)
            sfx.add(pan(x, 0), t, 0.3)
            send.add(pan(x, 0), t, 0.16)
        elif ty == "thock":
            sfx.add(s_thock(), t, 0.16, p=[-0.4, -0.1, 0.15, 0.4][i % 4])
        elif ty == "scramble":
            sfx.add(s_scramble(dur), t, 0.028, p=0.1)
        elif ty == "dive":
            sfx.add(s_dive(dur), t, 0.11)
            sfx.add(s_whump(), t + dur, 0.2)
        elif ty == "assemble":
            x = s_assemble(dur)
            sfx.add(x, t, 0.05)
            send.add(x, t, 0.05)
        elif ty == "success":
            x = s_chime([80, 85], 0.07)  # G#5 → C#6
            sfx.add(x, t, 0.1, p=0.35)
            send.add(x, t, 0.08, p=0.35)
        elif ty == "whip":
            w = s_whoosh(dur + 0.12, 500, 5200, peak=0.5)
            sfx.add(w[:, ::-1], t - 0.04, 0.2)
        elif ty == "score":
            sfx.add(s_blip(pent(3 + i, 2), 0.06, 0.018), t, 0.02, p=0.05)
        elif ty == "land":
            f = [pent(8, 1), pent(6, 1), pent(4, 1)][i]
            sfx.add(s_blip(f), t, 0.045, p=0.55)
        elif ty == "stripes":
            for k in range(9):
                w = s_whoosh(0.16, 900 + 250 * k, 6000, peak=0.5)
                sfx.add(w, t + k * 1.2 / FPS, 0.045)
        elif ty in ("bubbleUser", "bubbleBot"):
            sfx.add(s_bubble(ty == "bubbleUser"), t, 0.085 if i == 0 else 0.05, p=[0.0, -0.6, 0.6][i])
        elif ty == "chip":
            sfx.add(s_blip(pent(10 + i * 2, 1), 0.05, 0.012), t, 0.03)
        elif ty == "node":
            x = s_chime([PENT[i % 5] + 12 * (1 + i // 5)], 0.0)
            sfx.add(x[: int(0.5 * SR)], t, 0.07, p=-0.4 + 0.1 * i)
            send.add(x, t, 0.05)
        elif ty == "slam":
            sfx.add(s_slam(), t, 0.24, p=[-0.5, 0.5, -0.5, 0.5][i])
            duck_events.append((t, 0.12, 2.0))
        elif ty == "flip":
            w = s_whoosh(0.3, 700, 4800, peak=0.45)
            sfx.add(w, t, 0.06)
        elif ty == "clockspin":
            sfx.add(s_clockspin(dur), t, 0.05, p=-0.3)
        elif ty == "click":
            sfx.add(s_click(), t, 0.16, p=0.25)

    music = music_bed()

    # sidechain duck (music dips under hits so they punch through)
    duck = np.ones(N)
    v = tt(N)
    for t0, length, db in duck_events:
        m = (v >= t0) & (v < t0 + length)
        duck[m] = np.minimum(duck[m], 10 ** (-db * (1 - (v[m] - t0) / length) / 20))
    wet = reverb(send.buf)
    mix = music * duck[:, None] + sfx.buf + wet * 0.5
    mix = hp(mix, 22, 2)

    # loudness → -14 LUFS, then look-ahead limiter to -1 dBFS
    meter = pyln.Meter(SR)
    loud = meter.integrated_loudness(mix)
    mix *= 10 ** ((-14.0 - loud) / 20)
    ceiling = 10 ** (-1.2 / 20)
    look = int(0.004 * SR)
    peak = ndimage.maximum_filter1d(np.max(np.abs(mix), axis=1), size=2 * look + 1)
    gain = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    # release smoothing (60 ms)
    rel = np.exp(-1 / (0.06 * SR))
    g_s = gain.copy()
    for k in range(1, N):
        g_s[k] = min(gain[k], rel * g_s[k - 1] + (1 - rel) * gain[k])
    mix *= g_s[:, None]
    mix = np.clip(mix, -ceiling, ceiling)
    # 4 ms fade-in / tail fade-out
    f_in = int(0.004 * SR)
    mix[:f_in] *= np.linspace(0, 1, f_in)[:, None]
    mix[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]

    out = os.path.join(ROOT, "public", "audio", "soundtrack.wav")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sf.write(out, mix, SR, subtype="PCM_16")
    final_loud = meter.integrated_loudness(mix)
    print(f"wrote {out}: {final_loud:.1f} LUFS, peak {20*np.log10(np.max(np.abs(mix))):.2f} dBFS, max limiter GR {20*np.log10(g_s.min()):.1f} dB, {len(cues)} cues")
    return mix


if __name__ == "__main__":
    build()
