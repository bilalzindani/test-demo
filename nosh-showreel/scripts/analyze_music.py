"""Objective shortlist analysis for candidate music beds.

For each track: duration, tempo + beat regularity, loudness contour (2 s bins),
brightness (spectral centroid), percussive ratio (HPSS), and the biggest
energy jumps ("drop" candidates). Used to choose a track that fits a picture
locked to a 120 BPM grid.
Usage: python3 scripts/analyze_music.py <dir-with-mp3s>
"""
import glob
import os
import sys
import warnings

import numpy as np

warnings.filterwarnings("ignore")
import librosa  # noqa: E402

SR = 22050


def analyze(path):
    y, sr = librosa.load(path, sr=SR, mono=True)
    dur = len(y) / sr
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=sr)
    tempo = float(np.atleast_1d(tempo)[0])
    bt = librosa.frames_to_time(beats, sr=sr)
    ibi = np.diff(bt)
    reg = float(np.std(ibi) / np.mean(ibi)) if len(ibi) > 4 else 9.0
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
    hop_t = 512 / sr
    bins = int(dur // 2)
    contour = [float(np.mean(rms[int(i * 2 / hop_t): int((i + 1) * 2 / hop_t)])) for i in range(bins)]
    contour = np.array(contour)
    db = 20 * np.log10(contour + 1e-6)
    jumps = np.diff(db)
    top = np.argsort(jumps)[::-1][:3]
    cent = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    h, p = librosa.effects.hpss(y[: sr * 60])
    perc = float(np.sum(p**2) / (np.sum(h**2) + np.sum(p**2) + 1e-9))
    spark = "".join(" ▁▂▃▄▅▆▇█"[min(8, max(0, int((v - db.max() + 30) / 30 * 8)))] for v in db[:60])
    return {
        "name": os.path.basename(path)[:-4],
        "dur": dur,
        "tempo": tempo,
        "reg": reg,
        "cent": cent,
        "perc": perc,
        "drops": [(int((i + 1) * 2), round(float(jumps[i]), 1)) for i in top],
        "spark": spark,
    }


def main():
    rows = [analyze(p) for p in sorted(glob.glob(os.path.join(sys.argv[1], "*.mp3")))]
    print(f"{'track':38} {'dur':>5} {'bpm':>6} {'beatCV':>6} {'bright':>6} {'perc':>5}  drops(s,+dB)            loudness/2s (first 120s)")
    for r in sorted(rows, key=lambda r: abs(r["tempo"] - 120)):
        drops = " ".join(f"{t}s+{j}" for t, j in r["drops"])
        print(f"{r['name'][:38]:38} {r['dur']:5.0f} {r['tempo']:6.1f} {r['reg']:6.3f} {r['cent']:6.0f} {r['perc']:5.2f}  {drops:24} {r['spark']}")


if __name__ == "__main__":
    main()
