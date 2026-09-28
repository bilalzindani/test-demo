import { random } from "remotion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>=?";

// Decode effect: characters resolve left→right as progress goes 0→1.
// Unresolved characters flicker through random glyphs (deterministic per frame).
export const scramble = (text: string, progress: number, frame: number, seed = "s") => {
  const n = text.length;
  const resolved = Math.floor(progress * (n + 4)) - 4;
  let out = "";
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    if (ch === " " || i <= resolved) {
      out += ch;
    } else if (i > resolved + 6) {
      out += progress <= 0 ? "" : random(`${seed}-${i}-${frame}`) < 0.5 ? "" : "·";
    } else {
      out += GLYPHS[Math.floor(random(`${seed}-${i}-${frame}`) * GLYPHS.length)];
    }
  }
  return out;
};

export const timecode = (frame: number, fps = 30) => {
  const ff = frame % fps;
  const totalSec = Math.floor(frame / fps);
  const ss = totalSec % 60;
  const mm = Math.floor(totalSec / 60) % 60;
  const hh = Math.floor(totalSec / 3600);
  const p = (v: number) => String(v).padStart(2, "0");
  return `${p(hh)}:${p(mm)}:${p(ss)}:${p(ff)}`;
};
