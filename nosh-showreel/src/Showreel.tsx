import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SCENES } from "./lib/timeline";
import { Backdrop } from "./components/Backdrop";
import { Grain, HUD, Vignette } from "./components/Overlays";
import { Hook } from "./scenes/S01Hook";
import { Chaos } from "./scenes/S02Chaos";
import { Logo } from "./scenes/S03Logo";
import { Voice } from "./scenes/S04Voice";
import { Leads } from "./scenes/S05Leads";
import { Chat } from "./scenes/S06Chat";
import { Workflow } from "./scenes/S07Workflow";
import { Industries } from "./scenes/S08Industries";
import { Value } from "./scenes/S09Value";
import { Finale } from "./scenes/S10Finale";

const Scene: React.FC<{ name: keyof typeof SCENES; children: React.ReactNode }> = ({ name, children }) => (
  <Sequence from={SCENES[name].from} durationInFrames={SCENES[name].dur} name={name}>
    {children}
  </Sequence>
);

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{ background: "#07080C" }}>
    <Backdrop />
    <Scene name="hook">
      <Hook />
    </Scene>
    <Scene name="chaos">
      <Chaos />
    </Scene>
    <Scene name="logo">
      <Logo />
    </Scene>
    <Scene name="voice">
      <Voice />
    </Scene>
    <Scene name="leads">
      <Leads />
    </Scene>
    <Scene name="chat">
      <Chat />
    </Scene>
    <Scene name="workflow">
      <Workflow />
    </Scene>
    <Scene name="industries">
      <Industries />
    </Scene>
    <Scene name="value">
      <Value />
    </Scene>
    <Scene name="finale">
      <Finale />
    </Scene>
    <Vignette />
    <Grain />
    <HUD />
    {/* Music: "Take the Ride" by Bryan Teoh (FreePD, CC0) + synthesized sound design.
        Built by audio/generate_soundtrack.py from the same timeline as the picture. */}
    <Audio src={staticFile("audio/soundtrack.wav")} />
  </AbsoluteFill>
);
