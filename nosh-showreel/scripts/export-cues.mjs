// Compile a cue module with esbuild and write its JSON, so the soundtrack
// generator reads exactly the timings the picture uses.
// Usage: node scripts/export-cues.mjs [src/lib/cues.ts] [audio/cues.json]
import { build } from "esbuild";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const entry = path.resolve(root, process.argv[2] ?? "src/lib/cues.ts");
const outFile = path.resolve(root, process.argv[3] ?? "audio/cues.json");
const tmp = path.join(os.tmpdir(), `cues-${process.pid}.mjs`);
await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: tmp,
  logLevel: "error",
});
const { buildCues } = await import(pathToFileURL(tmp).href);
const data = buildCues();
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(data, null, 1));
fs.rmSync(tmp);
console.log(`wrote ${path.relative(root, outFile)} (${data.cues.length} cues)`);
