import { Easing, interpolate, random, spring } from "remotion";

type EaseFn = (t: number) => number;

// Curated easing set. Named after the feel, not the math.
export const ease = {
  linear: (t: number) => t,
  out: Easing.bezier(0.22, 1, 0.36, 1), // quint out, the workhorse
  expoOut: Easing.bezier(0.16, 1, 0.3, 1),
  expoIn: Easing.bezier(0.7, 0, 0.84, 0),
  expoInOut: Easing.bezier(0.87, 0, 0.13, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  backOut: Easing.bezier(0.34, 1.56, 0.64, 1),
  anticipate: Easing.bezier(0.68, -0.6, 0.32, 1.6),
  snap: Easing.bezier(0.9, 0, 0.1, 1),
} satisfies Record<string, EaseFn>;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix = lerp;

// Tween: interpolate with clamping + easing in one call.
export const tw = (
  frame: number,
  range: [number, number],
  out: [number, number] = [0, 1],
  easing: EaseFn = ease.out,
) =>
  interpolate(frame, range, out, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Multi-keyframe tween (clamped).
export const kf = (
  frame: number,
  input: number[],
  output: number[],
  easing: EaseFn = ease.inOut,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const FPS = 30;

export const springs = {
  snappy: { damping: 30, stiffness: 400, mass: 1 },
  bouncy: { damping: 13, stiffness: 180, mass: 0.9 },
  smooth: { damping: 26, stiffness: 120, mass: 1 },
  pop: { damping: 11, stiffness: 260, mass: 0.7 },
  heavy: { damping: 18, stiffness: 90, mass: 1.6 },
} as const;

export const sp = (
  frame: number,
  config: { damping: number; stiffness: number; mass: number } = springs.smooth,
  delay = 0,
) =>
  spring({
    frame: frame - delay,
    fps: FPS,
    config,
  });

// Deterministic random helpers
export const rnd = (seed: string | number) => random(seed);
export const rndRange = (seed: string | number, a: number, b: number) =>
  a + (b - a) * random(seed);
export const rndPick = <T,>(seed: string | number, arr: readonly T[]): T =>
  arr[Math.floor(random(seed) * arr.length) % arr.length];

// Beat-synced pulse: 1 on the beat, decaying to 0 before the next one.
export const beatPulse = (frame: number, beat = 15, decay = 6, offset = 0) => {
  const f = (((frame - offset) % beat) + beat) % beat;
  return Math.exp(-f / decay);
};

// A value that shakes; amplitude decays after an impact frame.
export const impactShake = (
  frame: number,
  at: number,
  amp = 18,
  duration = 14,
  seed = "shake",
) => {
  const f = frame - at;
  if (f < 0 || f > duration) return { x: 0, y: 0, r: 0 };
  const k = Math.pow(1 - f / duration, 2);
  return {
    x: (random(`${seed}x${f}`) - 0.5) * 2 * amp * k,
    y: (random(`${seed}y${f}`) - 0.5) * 2 * amp * k,
    r: (random(`${seed}r${f}`) - 0.5) * 2 * 0.6 * k,
  };
};
