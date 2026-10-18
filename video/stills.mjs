// Render preview stills for both compositions in one bundle.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const out = process.argv[2];
const plan = { Intro: [40, 150, 330, 470, 560, 700, 870, 990, 1100], HowItWorks: [100, 200, 360, 500, 650] };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (const [id, frames] of Object.entries(plan)) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, chromeMode: "headless-shell" });
  for (const frame of frames) {
    await renderStill({ composition, serveUrl, frame, output: `${out}/${id}-${String(frame).padStart(4, "0")}.jpg`, imageFormat: "jpeg", scale: 0.4, browserExecutable, chromeMode: "headless-shell" });
    console.log("done", id, frame);
  }
}
