import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Center, DotGrid, Label, PushIn, Robot, Slam, Typed, useIn } from "./components";
import { c, mono, sans, serif } from "./theme";

// Scene timings in frames (30fps). Cuts land on the 120 BPM beat grid.
export const INTRO_SCENES = {
  open: [0, 90],
  googling: [90, 210],
  chat: [210, 420],
  competitor: [420, 510],
  meet: [510, 600],
  report: [600, 810],
  monday: [810, 930],
  shortlist: [930, 1035],
  end: [1035, 1140],
} as const;
export const INTRO_FRAMES = 1140;

// 1. Robot wakes up on a dark dot field.
const Open: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useIn(8, 10);
  return (
    <AbsoluteFill>
      <DotGrid opacity={interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" })} />
      <Center>
        <div style={{ transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-20, 0])}deg)` }}>
          <Robot size={240} />
        </div>
        <div style={{ marginTop: 50, opacity: useIn(40) }}>
          <Label color={c.accentLight}>{"// ai search, right now"}</Label>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// 2. "People stopped Googling. They ask AI."
const Googling: React.FC = () => {
  const frame = useCurrentFrame();
  const second = frame >= 60;
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        {!second ? (
          <div style={{ display: "flex", gap: 36 }}>
            <Slam delay={0}>People</Slam>
            <Slam delay={15}>stopped</Slam>
            <Slam delay={30} color={c.accentLight}>
              Googling.
            </Slam>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 40, alignItems: "baseline" }}>
            <Slam delay={60} size={180}>
              They
            </Slam>
            <Slam delay={75} size={220} italic color={c.accentLight}>
              ask AI.
            </Slam>
          </div>
        )}
      </Center>
    </AbsoluteFill>
  );
};

// 3. A customer asks AI; your brand isn't in the answer.
const answers = ["Northwind CRM", "Ledgerly", "Brightdesk", "Folio"];
const Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useIn(0, 16);
  const thinking = frame >= 55 && frame < 90;
  const stamp = useIn(150, 9);
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div
          style={{
            width: 1180,
            borderRadius: 36,
            background: c.card,
            padding: "44px 56px",
            boxShadow: "0 60px 120px -40px rgba(0,0,0,0.6)",
            transform: `translateY(${interpolate(card, [0, 1], [80, 0])}px)`,
            opacity: card,
            fontFamily: sans,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                background: c.ink,
                color: c.cream,
                borderRadius: 26,
                padding: "18px 30px",
                fontSize: 40,
                letterSpacing: "-0.01em",
              }}
            >
              <Typed text="best CRM for freelancers?" start={10} />
            </div>
          </div>
          <div style={{ marginTop: 34, minHeight: 330 }}>
            {thinking && (
              <div style={{ display: "flex", gap: 14, padding: "10px 4px" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      background: c.accent,
                      opacity: 0.3 + 0.7 * Math.abs(Math.sin((frame + i * 6) / 5)),
                    }}
                  />
                ))}
              </div>
            )}
            {frame >= 90 &&
              answers.map((a, i) => {
                const p = Math.min(1, Math.max(0, (frame - 90 - i * 15) / 8));
                return (
                  <div
                    key={a}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      padding: "14px 0",
                      borderBottom: `2px solid ${c.line}`,
                      fontSize: 38,
                      color: c.ink,
                      opacity: p,
                      transform: `translateX(${(1 - p) * -30}px)`,
                    }}
                  >
                    <span style={{ fontFamily: mono, color: c.muted, fontSize: 26 }}>#{i + 1}</span>
                    {a}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 22,
                        background: c.greenSoft,
                        color: c.green,
                        borderRadius: 30,
                        padding: "6px 16px",
                      }}
                    >
                      recommended
                    </span>
                  </div>
                );
              })}
          </div>
          <div
            style={{
              position: "absolute",
              right: -60,
              bottom: -50,
              transform: `rotate(-6deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`,
              opacity: stamp,
              background: c.accent,
              color: "white",
              fontWeight: 700,
              fontSize: 46,
              padding: "20px 34px",
              borderRadius: 20,
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)",
            }}
          >
            Your brand: not mentioned ✕
          </div>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// 4. "AI picked your competitor." with a shake on the hit.
const Competitor: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame >= 15 && frame < 27 ? Math.sin(frame * 3) * 10 : 0;
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center style={{ transform: `translateX(${shake}px)` }}>
        <Slam size={160}>AI picked your</Slam>
        <Slam delay={15} size={230} italic color={c.accentLight} style={{ marginTop: 16 }}>
          competitor.
        </Slam>
      </Center>
    </AbsoluteFill>
  );
};

// 5. "Meet Rankly."
const Meet: React.FC = () => {
  const p = useIn(0, 11);
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div style={{ transform: `scale(${p})` }}>
            <Robot size={190} />
          </div>
          <Slam delay={8} size={170}>
            Meet Rankly.
          </Slam>
        </div>
        <div style={{ marginTop: 40, opacity: useIn(30) }}>
          <Label color={c.accentLight}>AI visibility tracker · AEO &amp; GEO</Label>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// 6. The report: score climbs, rows flip to "recommended", fixes tick in.
const rows = [
  { q: "best CRM for freelancers", from: "not mentioned", to: "#2" },
  { q: "best CRM for small agencies", from: "not mentioned", to: "#1" },
  { q: "simple CRM for consultants", from: "#4", to: "#2" },
];
const fixes = ["Publish “Northwind vs you”", "Get listed in “Best CRMs for freelancers”", "Answer 2 Reddit threads"];
const Report: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useIn(0, 16);
  const score = Math.round(interpolate(frame, [40, 120], [1, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: c.cream }}>
      <DotGrid dark={false} opacity={0.6} />
      <Center>
        <div
          style={{
            width: 1500,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 40,
            transform: `translateY(${interpolate(card, [0, 1], [60, 0])}px)`,
            opacity: card,
            fontFamily: sans,
            color: c.ink,
          }}
        >
          <div style={{ background: c.card, border: `2px solid ${c.line}`, borderRadius: 36, padding: 48 }}>
            <Label>{"// your weekly report"}</Label>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 24 }}>
              <span style={{ fontSize: 150, fontWeight: 700, letterSpacing: "-0.05em" }}>{score}</span>
              <span style={{ fontSize: 60, color: c.muted }}>/5</span>
              <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 50, color: c.accent, marginLeft: 20 }}>
                AI visibility
              </span>
            </div>
            {rows.map((r, i) => {
              const flipped = frame >= 60 + i * 20;
              return (
                <div
                  key={r.q}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 18,
                    padding: "18px 24px",
                    borderRadius: 18,
                    background: c.cream,
                    fontSize: 30,
                  }}
                >
                  {r.q}
                  <span
                    style={{
                      fontSize: 22,
                      borderRadius: 30,
                      padding: "6px 16px",
                      background: flipped ? c.greenSoft : c.accentSoft,
                      color: flipped ? c.green : c.accent,
                    }}
                  >
                    {flipped ? r.to : r.from}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ background: c.ink, color: c.cream, borderRadius: 36, padding: 48 }}>
            <Label color={c.accentLight}>{"// this week's fixes"}</Label>
            {fixes.map((f, i) => {
              const p = Math.min(1, Math.max(0, (frame - 100 - i * 18) / 8));
              return (
                <div key={f} style={{ display: "flex", gap: 20, marginTop: 34, fontSize: 32, opacity: p, lineHeight: 1.25 }}>
                  <span style={{ color: c.accentLight, fontFamily: serif, fontStyle: "italic", fontSize: 40 }}>0{i + 1}</span>
                  {f}
                </div>
              );
            })}
          </div>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// 7. The Monday email drops in.
const Monday: React.FC = () => {
  const p = useIn(5, 13);
  return (
    <AbsoluteFill style={{ background: c.cream }}>
      <DotGrid dark={false} opacity={0.6} />
      <Center>
        <div
          style={{
            width: 1040,
            display: "flex",
            gap: 28,
            alignItems: "center",
            background: "rgba(255,253,249,0.96)",
            border: `2px solid ${c.line}`,
            borderRadius: 34,
            padding: "30px 36px",
            boxShadow: "0 40px 80px -30px rgba(60,30,10,0.35)",
            transform: `translateY(${interpolate(p, [0, 1], [-260, 0])}px)`,
            fontFamily: sans,
          }}
        >
          <Robot size={96} blink={false} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: c.muted }}>
              <span style={{ fontWeight: 600, color: c.ink }}>Rankly</span>
              <span>Monday · 9:00</span>
            </div>
            <div style={{ fontSize: 38, fontWeight: 600, color: c.ink, marginTop: 6 }}>Your AI visibility: 4/5 (↑3)</div>
            <div style={{ fontSize: 28, color: c.muted, marginTop: 4 }}>Beating you: Northwind · 3 fixes inside →</div>
          </div>
        </div>
        <div style={{ marginTop: 80, display: "flex", gap: 30 }}>
          <Slam delay={30} size={110} color={c.ink}>
            Every Monday.
          </Slam>
          <Slam delay={45} size={130} italic color={c.accent}>
            Automatically.
          </Slam>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// 8. "Get on AI's shortlist."
const Shortlist: React.FC = () => (
  <AbsoluteFill>
    <DotGrid />
    <Center>
      <Slam size={190}>Get on AI&apos;s</Slam>
      <Slam delay={15} size={250} italic color={c.accentLight} style={{ marginTop: 10 }}>
        shortlist.
      </Slam>
    </Center>
  </AbsoluteFill>
);

// 9. End card.
const End: React.FC = () => {
  const p = useIn(0, 12);
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", alignItems: "center", gap: 36, transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`, opacity: p }}>
          <Robot size={170} />
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 170, letterSpacing: "-0.045em", color: c.cream }}>Rankly</span>
        </div>
        <div style={{ marginTop: 50, display: "flex", gap: 24, alignItems: "center", opacity: useIn(20) }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: 38,
              fontWeight: 600,
              color: c.ink,
              background: c.cream,
              borderRadius: 60,
              padding: "16px 36px",
            }}
          >
            rankly.world
          </span>
          <span style={{ fontFamily: mono, fontSize: 28, color: c.accentLight, letterSpacing: "0.1em" }}>
            7 DAYS FREE · THEN $9/MO
          </span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// Quick orange flash on each cut, like a camera hit on the beat.
const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = Object.values(INTRO_SCENES).map(([s]) => s).filter((s) => s > 0);
  const since = Math.min(...cuts.map((s) => (frame >= s ? frame - s : 999)));
  const o = interpolate(since, [0, 4], [0.5, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: c.accent, opacity: o, pointerEvents: "none" }} />;
};

const scenes: Record<keyof typeof INTRO_SCENES, React.FC> = {
  open: Open,
  googling: Googling,
  chat: Chat,
  competitor: Competitor,
  meet: Meet,
  report: Report,
  monday: Monday,
  shortlist: Shortlist,
  end: End,
};

// `music`: file in /public (e.g. "music/track.mp3"), added once a licensed track is chosen.
export const Intro: React.FC<{ music?: string }> = ({ music }) => (
  <AbsoluteFill style={{ background: c.ink }}>
    {Object.entries(INTRO_SCENES).map(([key, [from, to]]) => {
      const Scene = scenes[key as keyof typeof INTRO_SCENES];
      return (
        <Sequence key={key} from={from} durationInFrames={to - from}>
          <PushIn duration={to - from}>
            <Scene />
          </PushIn>
        </Sequence>
      );
    })}
    <CutFlash />
    {music && (
      <Audio
        src={staticFile(music)}
        // Measured on the rendered file: a 1-frame trim puts the beats on the cuts.
        trimBefore={1}
        volume={(f) => interpolate(f, [INTRO_FRAMES - 45, INTRO_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    )}
  </AbsoluteFill>
);
