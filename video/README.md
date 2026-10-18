# Rankly videos (Remotion)

Two videos, built with code in the Rankly brand:

- **Intro** (38s, 1920x1080): launch video for social media. Cuts are timed to a 120 BPM beat.
- **HowItWorks** (25s, loops): product walkthrough shown on rankly.world (`public/videos/how-rankly-works.mp4`).

```bash
cd video
npm install
npm run studio        # preview and tweak in the browser
npm run render:how    # → ../public/videos/how-rankly-works.mp4
npx remotion render src/index.ts Intro out/rankly-intro.mp4 --props='{"music":"music/track.mp3"}'
```

Music: put a **licensed** track in `video/public/music/` and pass it as the `music` prop.
Rendering uses the installed Google Chrome (see `remotion.config.ts`).
