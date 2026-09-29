import React from "react";
import { AbsoluteFill } from "remotion";
import { B } from "../theme";
import { ease, lerp, tw } from "../../lib/motion";

// Vertical whip-pan: y translation + y-only Gaussian motion blur.
export const vWhipCurve = (t: number, dur: number) => {
  const u = Math.min(1, Math.max(0, t / dur));
  const q = u * u * u * (u * (u * 6 - 15) + 10);
  return { out: -q * 2150, in: (1 - q) * 2150, blur: Math.sin(Math.PI * u) * 85 };
};
export const VWhip: React.FC<{ id: string; y: number; blur: number; children: React.ReactNode }> = ({ id, y, blur, children }) => (
  <AbsoluteFill style={{ transform: `translateY(${y}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
    {blur > 0.5 && (
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={id} x="0%" y="-20%" width="100%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`0 ${blur}`} />
          </filter>
        </defs>
      </svg>
    )}
    {children}
  </AbsoluteFill>
);

// Camera aperture: nine blades rotate in to close (p=1) around the centre.
export const Iris: React.FC<{ p: number; cx?: number; cy?: number }> = ({ p, cx = 540, cy = 960 }) => {
  if (p <= 0.001) return null;
  const R = 1500;
  const open = lerp(1200, 0, ease.inOut(Math.min(1, p)));
  const blades = 9;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${cx} ${cy})`}>
          {Array.from({ length: blades }).map((_, i) => {
            const a = (i / blades) * Math.PI * 2 + p * 0.9;
            // each blade is a big quad tangent to the aperture circle of radius `open`
            const tx = Math.cos(a);
            const ty = Math.sin(a);
            const nx = -ty;
            const ny = tx;
            const p1 = [tx * open - nx * R, ty * open - ny * R];
            const p2 = [tx * open + nx * R * 0.25, ty * open + ny * R * 0.25];
            const p3 = [tx * (open + R) + nx * R * 0.25, ty * (open + R) + ny * R * 0.25];
            const p4 = [tx * (open + R) - nx * R, ty * (open + R) - ny * R];
            return (
              <path
                key={i}
                d={`M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} L ${p4[0]} ${p4[1]} Z`}
                fill={i % 2 === 0 ? "#0A0612" : "#0E0819"}
                stroke={B.plumLine}
                strokeWidth={2}
              />
            );
          })}
          <circle r={Math.max(0, open)} fill="none" stroke={B.violet} strokeOpacity={0.5 * (1 - p)} strokeWidth={4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Clapperboard with a hinged, striped arm. `arm` = 0 closed … 1 open (≈30°).
export const Clapper: React.FC<{ x: number; y: number; arm: number; scale?: number; rot?: number }> = ({ x, y, arm, scale = 1, rot = 0 }) => {
  const W = 760;
  const stripes = (h: number) => (
    <>
      <rect width={W} height={h} rx={14} fill={B.white} />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M ${i * 96 - 20} 0 L ${i * 96 + 40} 0 L ${i * 96} ${h} L ${i * 96 - 60} ${h} Z`} fill={i % 2 === 0 ? B.purple : "#120A22"} />
      ))}
    </>
  );
  const rows: [string, string][] = [
    ["PRODUCTION", "Nosh VIDEO EDITING"],
    ["SCENE", "01"],
    ["TAKE", "01"],
  ];
  return (
    <div style={{ position: "absolute", left: x - (W / 2) * scale, top: y - 300 * scale, transform: `scale(${scale}) rotate(${rot}deg)`, transformOrigin: "0 0" }}>
      <svg width={W} height={620} viewBox={`0 -40 ${W} 620`} overflow="visible">
        {/* body */}
        <rect x={0} y={96} width={W} height={470} rx={22} fill="#0B0714" stroke={B.plumLine} strokeWidth={3} />
        <g transform="translate(0 96)">{stripes(56)}</g>
        {rows.map(([k, v], i) => (
          <g key={k} transform={`translate(34 ${196 + i * 118})`}>
            <text style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 24, letterSpacing: "0.18em" }} fill={B.lavender}>
              {k}
            </text>
            <text y={62} style={{ fontFamily: "Archivo", fontWeight: 900, fontSize: 52 }} fill={B.white}>
              {v}
            </text>
            <line x1={0} x2={W - 68} y1={86} y2={86} stroke={B.plumLine} strokeWidth={2} />
          </g>
        ))}
        {/* arm, hinged at top-left */}
        <g transform={`rotate(${-arm * 30} 12 92)`}>
          <g transform="translate(0 36)">{stripes(56)}</g>
        </g>
        <circle cx={22} cy={94} r={12} fill="#1A1028" stroke={B.lavender} strokeWidth={3} />
      </svg>
    </div>
  );
};

// Warm light-leak / film-burn flash (0..1 intensity)
export const FilmBurn: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 55% at ${30 + p * 40}% ${40 + p * 10}%, rgba(255,255,255,${0.95 * p}) 0%, rgba(221,214,254,${0.75 * p}) 30%, rgba(139,92,246,${0.45 * p}) 60%, rgba(0,0,0,0) 100%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};

export const Flash: React.FC<{ f: number; at: number; dur?: number; color?: string }> = ({ f, at, dur = 8, color = B.white }) => {
  const p = 1 - tw(f, [at, at + dur], [0, 1], ease.out);
  if (f < at || p <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: p }} />;
};
