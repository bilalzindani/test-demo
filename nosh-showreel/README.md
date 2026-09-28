# Nosh AI Automation — 60s Motion Showreel

A one-minute motion-graphics showreel for **[noshaiautomation.com](https://noshaiautomation.com)**, built entirely in code with [Remotion](https://www.remotion.dev) (React → video). Every frame is a pure function of time, so the whole piece is re-renderable, editable and re-brandable.

**Output:** `out/nosh-ai-automation-showreel.mp4` · 1920×1080 · 30 fps · 60 s · H.264 + AAC

---

## Concept — "The dot that never sleeps"

A single lime dot is the always-on AI. It opens the reel, becomes a ringing call nobody answers, is the singularity the chaos collapses into, becomes the **o** of the wordmark, is dived through into the voice agent, and finally shrinks back to black — so the last frame loops into the first.

Everything is locked to a **120 BPM grid** (1 beat = 15 frames, 1 bar = 60 frames); cuts, hits and transitions land on beats.

| Time | Chapter | What happens | Signature technique |
|---|---|---|---|
| 0:00 | **2:47 AM** | Dot → ringing call → "No one picks up." → missed | Variable-font width animation, slot-roll digit, typewriter, RGB-split glitch, orb → card morph |
| 0:05 | **The problem** | Pull-back reveals 47 notifications flooding in; beat-synced kinetic words; everything implodes | Camera pull-back match cut, spring physics, 4 kinetic-type styles (mask / width-stretch / drop / decode), glitch slicing, radial speed lines |
| 0:12 | **The drop** | Lime detonation, wordmark slams in, dive through the "o" | Circle flood + shockwaves, per-letter slams with camera shake, stroke-drawn ring, scramble decode, exponential zoom-through |
| 0:16 | **01 Voice agents** | Particle voice orb listens and speaks; live captions; booking lands | Hand-projected 3D point cloud (720 pts) with simplex-noise displacement, radial spectrum, word-timed captions, confetti |
| 0:23 | **02 Lead qualification** | Leads travel from calls/WhatsApp/web into an AI scoring core and route to lanes | Whip pan with true directional motion blur, path draw-on, motion along bézier paths, score gauges, live counters |
| 0:30 | **03 Chatbots** | Three live conversations on three channels | Diagonal stripe wipe, CSS-3D phone rig orbit, bottom-anchored chat physics, typing indicators, chips |
| 0:37 | **04 Workflow automation** | Node graph executes; camera rides the packets, then reveals the scale | Zoom-through crossfade, tilted 3D infinite canvas, packets with trails, node activation glow, ghost workflows |
| 0:43 | **05 Built for your industry** | Healthcare · Restaurants · E-commerce · Home Services | 4-way panel slams, per-panel micro-animations (ECG, reservations, tracker, gears), circular type badge, staggered 3D card flip whose back faces assemble the next shot |
| 0:50 | **06 The outcome** | 24/7 · Hours back · Your IP · ROI, faster | Beat cuts with four different transitions (flip hand-off, push, iris, split doors), backwards clock, line-chart draw |
| 0:54 | **07 Let's build** | Words fly in from depth, collapse to the dot, dot unpacks into the lock-up; CTA clicked | 3D depth type, collapse to singularity, logo build from the dot, cursor + click ripple, loop-back to black |

A persistent **HUD** (timecode, frame counter, chapter labels, progress bar, crop marks), film grain and vignette tie it together as a reel.

Messaging is taken from Nosh's public positioning: AI voice agents (sales, appointments, support), the lead qualification system (calls, WhatsApp, CRM), AI chatbots (website, Messenger, WhatsApp), workflow automation (Make, Zapier, CRMs), and the four industries they serve. UI numbers inside the mock-ups (counters, scores, order numbers) are illustrative.

---

## Music & sound

**Music bed:** *"Take the Ride"* — **Bryan Teoh** (FreePD.com, 2020). Released into the public domain under **CC0 1.0** — free for commercial use, no attribution required (credited here anyway). Sourced from the [SoundSafari/CC0-1.0-Music](https://github.com/SoundSafari/CC0-1.0-Music) corpus. Original file: `audio/source/`.

The track was chosen by analysis, not guesswork (`scripts/analyze_music.py`): 120.999 BPM with 3.6 ms beat jitter, a genuine 14-second build, and a clean final hit. The edit (`audio/generate_soundtrack.py`):

- resampled by 121/120 so it runs at **exactly 120 BPM** (−14 cents, inaudible, no time-stretch artefacts) — its beats sit on the picture's 15-frame grid;
- the track's own drop (beat 32) is transient-aligned to the **logo drop at 0:12.000**, and its build fill lands on the chaos implosion;
- a low-pass filter sweep (650 Hz → open) builds through the hook and chaos, with a 5-frame silence before the drop;
- the finale collapses the bed and splices to the track's **real final hit (beat 512) at 0:56.000**; its natural tail rings under the lock-up.

**Sound design:** 164 cues synthesized from the same timeline as the picture (`src/lib/cues.ts` → `audio/cues.json`): phone ring, typing, notification pings, whooshes, whip, stripe swishes, impacts, UI pops, node chimes, click. All pitched sounds are tuned to the track's key (C# major pentatonic).

**Master:** −14 LUFS integrated, ≤ −1.2 dBFS peak (look-ahead limiter), 48 kHz.

---

## Project layout

```
src/
  Root.tsx, Showreel.tsx        composition + master timeline (Sequences, overlays, audio)
  lib/timeline.ts               single source of truth for all timings (120 BPM grid)
  lib/cues.ts                   sound-design cue sheet derived from timeline.ts
  lib/motion.ts, theme.ts       easing set, springs, helpers · colour + type tokens
  components/                   HUD/grain, kinetic type, wordmark, voice orb, phones, stripes, whip…
  scenes/S01…S10                one file per chapter
audio/generate_soundtrack.py    music edit + SFX synth + master → public/audio/soundtrack.wav
scripts/                        cue export, contact-sheet review tool, music analysis, grain textures
public/                         fonts (OFL), grain tiles, rendered soundtrack
```

## Run it

```bash
npm install
npm run dev                         # Remotion Studio (scrub the timeline)
npm run render                      # → out/nosh-ai-automation-showreel.mp4

# rebuild the soundtrack after changing timings
node scripts/export-cues.mjs
pip install numpy scipy soundfile pyloudnorm && python3 audio/generate_soundtrack.py

# review: render labelled contact sheets of any frames
node scripts/stills.mjs mysheet 0-1799/60
```

Set `REMOTION_BROWSER=/path/to/chrome-headless-shell` to use a preinstalled browser instead of downloading one.

## Re-branding

- **Colours / type:** `src/lib/theme.ts` (the lime accent, ink, violet, coral). Fonts are Archivo (variable, width + weight axes), Instrument Serif, JetBrains Mono and Inter — all SIL Open Font License.
- **Wordmark:** `src/components/Wordmark.tsx` sets "nosh" in Archivo 900 with a geometric ring-and-dot "o", positioned from measured glyph metrics. Swap in the official logo here if preferred.
- **Copy:** each scene's text lives at the top of its file in `src/scenes/`.

## Credits

- Motion design, code & sound design: generated with Claude Code.
- Music: "Take the Ride" by Bryan Teoh — FreePD.com — CC0 1.0 (public domain).
- Fonts: Archivo (Omnibus-Type), Instrument Serif (Instrument), JetBrains Mono (JetBrains), Inter (Rasmus Andersson) — SIL OFL 1.1, via Fontsource.
- Icons: Lucide (ISC).
