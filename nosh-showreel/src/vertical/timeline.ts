// Vertical reel timing — single source of truth for picture and sound.
// Grid: 120 BPM @ 30 fps → 1 beat = 15 frames.
// Music: "Final Step" (Rafael Krux, FreePD, CC0), 119.998 BPM. Video beat b ↔
// track beat b + 7, so the track's impacts (every 32 beats) land on frames
// 120, 600 and 1080; its real final hit is spliced in at frame 1440.

export const V_FPS = 30;
export const V_TOTAL = 1590; // 53 s
export const V_HITS = [120, 600, 1080];
export const V_FINAL_HIT = 1440;
export const V_ACCENTS = [225, 315, 1215]; // smaller hits inside sections

export const VS = {
  hook: { from: 0, dur: 120 },
  brand: { from: 120, dur: 127 },
  editing: { from: 232, dur: 368 },
  aiEdit: { from: 600, dur: 240 },
  ugc: { from: 840, dur: 240 },
  films: { from: 1080, dur: 330 },
  finale: { from: 1395, dur: 195 },
} as const;

export const HOOKV = {
  line1: 8,
  line2: 20,
  theyre: 45,
  edited: 52,
  slice: 72,
  clapper: [90, 120] as [number, number],
};

export const BRANDV = {
  letters: [0, 2, 4, 6],
  sub: [10, 34] as [number, number],
  tagline: 36,
  accent: 105, // track accent at frame 225
  whip: [112, 127] as [number, number],
};

export const EDITV = {
  whipIn: [0, 15] as [number, number],
  words: [0, 90, 180, 270], // CUT / GRADE / SOUND / MOTION
  cuts: [30, 45, 60, 75],
  grade: [100, 160] as [number, number],
  playhead: [83, 353] as [number, number], // starts on the track accent (frame 315); a new shot every 3 beats
  beatMarks: 190,
  keyframes: 280,
  chips: 300,
  iris: [352, 368] as [number, number],
};

export const AIV = {
  iris: [0, 12] as [number, number],
  headline: 8,
  captions: [30, 100] as [number, number],
  silence: [100, 170] as [number, number],
  reframe: [170, 236] as [number, number],
  glitch: [230, 240] as [number, number],
};

export const UGCV = {
  headline: 6,
  lines: [
    { text: "I tried this so you don't have to…", start: 28, end: 78 },
    { text: "…and honestly? Obsessed.", start: 84, end: 124 },
  ],
  product: 104,
  grid: [140, 176] as [number, number],
  winner: 200,
  exit: [226, 240] as [number, number],
};

export const FILMV = {
  flash: [0, 10] as [number, number],
  headline: 8,
  prompt: "A lone astronaut crosses a violet desert beneath two moons. Cinematic, 35mm.",
  typeStart: 22,
  generate: 104,
  diffuse: [108, 135] as [number, number], // resolves on the track accent (frame 1215)
  subtitle: [168, 214] as [number, number],
  title: [222, 280] as [number, number],
  strip: [236, 330] as [number, number],
};

export const FINV = {
  words: [0, 15, 30], // EDIT. ENHANCE. GENERATE.
  collapse: [40, 45] as [number, number],
  lock: 45, // = frame 1440, the final hit
  sub: [54, 74] as [number, number],
  tagline: 64,
  cta: 82,
  url: [92, 112] as [number, number],
  shimmer: 128,
  outro: [160, 188] as [number, number],
};

export const vat = (s: keyof typeof VS, local: number) => VS[s].from + local;
