import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");

// Point Remotion at a preinstalled Chromium instead of downloading one,
// e.g. REMOTION_BROWSER=/path/to/headless_shell npm run render
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
