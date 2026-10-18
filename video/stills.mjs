// Render preview stills: node stills.mjs <outDir> <CompositionId> <frame,frame,...>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, id, list] = process.argv.slice(2);
const frames = list.split(",").map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromeMode: "headless-shell" });
for (const frame of frames) {
  await renderStill({ composition, serveUrl, frame, output: `${out}/${id}-${String(frame).padStart(4, "0")}.jpg`, imageFormat: "jpeg", scale: 0.4, browserExecutable, chromeMode: "headless-shell" });
}
console.log("done", frames.length);
