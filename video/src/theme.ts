import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

export const sans = loadGeist("normal", { weights: ["400", "600", "700"], subsets: ["latin"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const serif = loadSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;

// Same palette as rankly.world
export const c = {
  ink: "#16130f",
  ink2: "#221d17",
  cream: "#f8f5f0",
  card: "#fffdf9",
  line: "#e6dfd4",
  muted: "#6b645b",
  accent: "#b9532c",
  accentSoft: "#f3e2d7",
  accentLight: "#e8a07f",
  green: "#047857",
  greenSoft: "#e7f6ee",
};

export const FPS = 30;
// Beat grid for the intro: 120 BPM = one beat every 15 frames.
export const BEAT = 15;
