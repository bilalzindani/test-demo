// Compile src/lib/cues.ts with esbuild and write audio/cues.json, so the
// soundtrack generator reads exactly the timings the picture uses.
import { build } from "esbuild";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tmp = path.join(os.tmpdir(), `cues-${process.pid}.mjs`);
await build({
  entryPoints: [path.join(root, "src", "lib", "cues.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: tmp,
  logLevel: "error",
});
const { buildCues } = await import(pathToFileURL(tmp).href);
const data = buildCues();
fs.mkdirSync(path.join(root, "audio"), { recursive: true });
fs.writeFileSync(path.join(root, "audio", "cues.json"), JSON.stringify(data, null, 1));
fs.rmSync(tmp);
console.log(`wrote audio/cues.json (${data.cues.length} cues)`);
