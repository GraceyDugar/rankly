import { Config } from "@remotion/cli/config";

// The bundled headless browser can't start on this Mac, so render with
// the installed Google Chrome instead.
Config.setBrowserExecutable("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
Config.setChromeMode("headless-shell");
Config.setVideoImageFormat("jpeg");
