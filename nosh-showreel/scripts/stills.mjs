// Review tool: bundle once, open one browser, render many frames, then tile
// them into a labelled contact sheet.
// Usage: node scripts/stills.mjs <sheetName> <frame|a-b/step> [...] [--scale=0.5] [--no-bundle]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const name = args.shift();
const scale = Number((args.find((a) => a.startsWith("--scale=")) ?? "--scale=0.5").split("=")[1]);
const reuse = args.includes("--no-bundle");
const compId = (args.find((a) => a.startsWith("--comp=")) ?? "--comp=NoshShowreel").split("=")[1];
const frames = args
  .filter((a) => !a.startsWith("--"))
  .flatMap((a) => {
    const m = a.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (!m) return [Number(a)];
    const out = [];
    for (let f = Number(m[1]); f <= Number(m[2]); f += Number(m[3])) out.push(f);
    return out;
  });

const bundleDir = path.join(root, "out", "bundle");
if (!reuse || !fs.existsSync(bundleDir)) {
  await bundle({ entryPoint: path.join(root, "src", "index.ts"), outDir: bundleDir, publicDir: path.join(root, "public") });
}
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.REMOTION_BROWSER ?? null,
  chromiumOptions: { gl: "swangle" },
});
const composition = await selectComposition({ serveUrl: bundleDir, id: compId, puppeteerInstance: browser });
const outDir = path.join(root, "out", "stills", name);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const queue = [...frames];
const worker = async () => {
  while (queue.length) {
    const frame = queue.shift();
    await renderStill({
      composition,
      serveUrl: bundleDir,
      frame,
      output: path.join(outDir, `f${String(frame).padStart(4, "0")}.png`),
      scale,
      puppeteerInstance: browser,
      overwrite: true,
    });
  }
};
const t0 = Date.now();
await Promise.all([worker(), worker(), worker(), worker()]);
await browser.close({ silent: true });
console.log(`rendered ${frames.length} stills in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
execFileSync("python3", [path.join(root, "scripts", "contact_sheet.py"), outDir, path.join(root, "out", "stills", `${name}.jpg`), String(composition.height > composition.width ? 6 : 3)], { stdio: "inherit" });
