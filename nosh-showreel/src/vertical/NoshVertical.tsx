import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { VS } from "./timeline";
import { Panel, VGrain, Viewfinder } from "./components/Frame";
import { VHook } from "./scenes/V1Hook";
import { VBrand } from "./scenes/V2Brand";
import { VEditing } from "./scenes/V3Editing";
import { VAIEdit } from "./scenes/V4AIEdit";
import { VUGC } from "./scenes/V5UGC";
import { VFilms } from "./scenes/V6Films";
import { VFinale } from "./scenes/V7Finale";

const Scene: React.FC<{ name: keyof typeof VS; children: React.ReactNode }> = ({ name, children }) => (
  <Sequence from={VS[name].from} durationInFrames={VS[name].dur} name={name}>
    {children}
  </Sequence>
);

// Nosh Video Editing — vertical reel (1080×1920). Scenes play inside the
// site-style rounded card; viewfinder HUD, grain and audio sit on top.
export const NoshVertical: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Panel />
    <div style={{ position: "absolute", left: 18, top: 18, right: 18, bottom: 18, borderRadius: 46, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -18, top: -18, width: 1080, height: 1920 }}>
        <Scene name="hook">
          <VHook />
        </Scene>
        <Scene name="brand">
          <VBrand />
        </Scene>
        <Scene name="editing">
          <VEditing />
        </Scene>
        <Scene name="aiEdit">
          <VAIEdit />
        </Scene>
        <Scene name="ugc">
          <VUGC />
        </Scene>
        <Scene name="films">
          <VFilms />
        </Scene>
        <Scene name="finale">
          <VFinale />
        </Scene>
      </div>
    </div>
    <VGrain />
    <Viewfinder />
    {/* "Final Step" by Rafael Krux (FreePD, CC0) edited to picture + synthesized
        sound design — built by audio/generate_vertical_soundtrack.py */}
    <Audio src={staticFile("audio/vertical-soundtrack.wav")} />
  </AbsoluteFill>
);
