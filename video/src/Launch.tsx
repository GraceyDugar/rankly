import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Center, DotGrid, Label, Robot, Slam, Typed, useIn } from "./components";
import { c, mono, sans, serif } from "./theme";

/*
 * 45s launch film: a remake of the original 60s Rankly intro with the same
 * soundtrack. The track is 120 BPM with its first beat at 0.464s, so every
 * cut sits on b(k). The music is the original's 0–32.464s followed by its
 * 46.464–59s (both bar lines), which keeps the hit, the silence and the ending.
 *
 * Legibility rule: people watch this on phones, where 1080p shrinks ~5×.
 * Anything meant to be read is 40px or bigger; headlines are 100px+.
 *
 * The same film renders landscape (Launch, 1920x1080) and as a 9:16 reel
 * (LaunchReel, 1080x1920). In the reel, content stays inside Instagram's safe
 * zone: clear of the top ~250px and bottom ~420px, where the app draws its UI.
 */
export const LAUNCH_FRAMES = 1350;
const b = (k: number) => Math.round(13.92 + 15 * k);
const SPLICE = b(64); // 32.464s
const B_START = Math.round(46.464 * 30);

const SCENES: [string, number, number][] = [
  ["ask", 0, b(8)],
  ["competitor", b(8), b(13)],
  ["logo", b(13), b(17)],
  ["shortlist", b(17), b(21)],
  ["google", b(21), b(25)],
  ["invisible", b(25), b(29)],
  ["check", b(29), b(37)],
  ["result", b(37), b(45)],
  ["free", b(45), b(49)],
  ["todo", b(49), b(57)],
  ["price", b(57), b(61)],
  ["bars", b(61), b(64)],
  ["keywords", b(64), b(71)],
  ["zero", b(71), b(74)],
  ["montage", b(74), b(79)],
  ["end", b(79), LAUNCH_FRAMES],
];

const Vertical = createContext(false);
const useV = () => useContext(Vertical);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, start: number, len = 8) => interpolate(frame, [start, start + len], [0, 1], clamp);
const Em: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = c.accentLight }) => (
  <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, letterSpacing: 0, color }}>{children}</span>
);

const RANKED = ["Northwind CRM", "Ledgerly", "Paperfin"];

// ---------- Background: a wall of AI answers where "you" are never mentioned ----------
const WALL = [
  ["best bakery in Austin", ["Crumb & Co", "Rise Bakehouse", "Little Oven"]],
  ["best CRM for freelancers", ["Northwind CRM", "Ledgerly", "Paperfin"]],
  ["best dentist in Denver", ["Cedar Dental", "Bright Smile", "Peak Family"]],
  ["best yoga studio near me", ["Stillpoint Yoga", "Flow House", "Juniper"]],
  ["best invoicing tool", ["Paperfin", "Billable", "Northwind"]],
  ["best language app for adults", ["Lingo Lane", "Parla", "Wordwise"]],
  ["best hiking boots under $150", ["Trailhead", "Summit Co", "Ridgeline"]],
  ["best coffee roaster online", ["Kiln Coffee", "Ember Roasters", "Dorsal"]],
  ["best AI SEO tool", ["Bigrank Pro", "SearchStack", "Northwind"]],
  ["best web designer in Pune", ["Studio Nine", "Pixelhaus", "Mono Lab"]],
  ["best pet groomer in Leeds", ["Pawsh", "Fluff & Co", "Groom Room"]],
  ["best accounting app", ["Tallyhoo", "Ledgerly", "Numbers & Co"]],
] as const;

const Wall: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 1400 }}>
      <div
        style={{
          position: "absolute",
          inset: -200,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 40,
          padding: 120,
          transform: `rotateX(28deg) rotateZ(-6deg) translateY(${-frame * 2.2}px) scale(${1 + frame / 900})`,
        }}
      >
        {WALL.map(([q, names], i) => (
          <div
            key={q}
            style={{
              background: c.ink2,
              border: "1px solid rgba(248,245,240,0.08)",
              borderRadius: 22,
              padding: "22px 26px",
              fontFamily: sans,
              color: c.cream,
              opacity: ramp(frame, i * 4, 10),
            }}
          >
            <div style={{ fontFamily: mono, fontSize: 16, color: "rgba(248,245,240,0.5)" }}>{`// "${q}"`}</div>
            {names.map((n, k) => (
              <div key={n} style={{ fontSize: 22, marginTop: 8 }}>
                <span style={{ fontFamily: mono, color: "rgba(248,245,240,0.4)", marginRight: 10 }}>{k + 1}</span>
                {n}
              </div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 1. Customers ask AI. AI names 3. Not you. ----------
const Ask: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const bar = useIn(8, 14);
  const stamp = useIn(88, 11);
  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ opacity: 0.35, filter: "blur(2px)" }}>
        <Wall />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(22,19,15,0.82) 35%, rgba(22,19,15,0.97) 80%)" }} />
      <Center>
        {v ? (
          <>
            <Slam size={124}>Customers now</Slam>
            <Slam delay={4} size={124} style={{ marginTop: 12 }}>
              ask <Em>AI.</Em>
            </Slam>
          </>
        ) : (
          <Slam size={116}>
            Customers now ask <Em>AI.</Em>
          </Slam>
        )}
        <div style={{ marginTop: 60, width: v ? 920 : 1280, opacity: bar, transform: `translateY(${(1 - bar) * 30}px)`, fontFamily: sans }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              background: c.card,
              color: c.ink,
              borderRadius: 80,
              padding: v ? "28px 40px" : "30px 46px",
              fontSize: v ? 48 : 56,
              boxShadow: "0 40px 90px -30px rgba(0,0,0,0.8)",
            }}
          >
            <span style={{ color: c.accent }}>✦</span>
            <Typed text="best CRM for freelancers?" start={16} speed={1.15} />
          </div>
          <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", gap: v ? 16 : 22, marginTop: 30, justifyContent: "center" }}>
            {RANKED.map((n, i) => (
              <div
                key={n}
                style={{
                  fontSize: 46,
                  color: c.cream,
                  background: "rgba(248,245,240,0.1)",
                  border: "2px solid rgba(248,245,240,0.16)",
                  borderRadius: 60,
                  padding: "14px 32px",
                  opacity: ramp(frame, 50 + i * 8, 6),
                  transform: `translateY(${(1 - ramp(frame, 50 + i * 8, 6)) * 20}px)`,
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 34, color: c.accentLight, marginRight: 16 }}>#{i + 1}</span>
                {n}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 50,
            background: c.accent,
            color: "white",
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 72,
            letterSpacing: "-0.03em",
            borderRadius: 24,
            padding: "16px 40px",
            opacity: stamp,
            transform: `rotate(-3deg) scale(${interpolate(stamp, [0, 1], [1.7, 1])})`,
            boxShadow: "0 30px 70px -20px rgba(185,83,44,0.7)",
          }}
        >
          You? Not mentioned.
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 2. The hit ----------
const Competitor: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const shake = frame < 10 ? Math.sin(frame * 3) * (10 - frame) : 0;
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center style={{ transform: `translateX(${shake}px)` }}>
        <Slam size={v ? 118 : 150}>AI picked your</Slam>
        <Slam delay={8} size={v ? 196 : 230} italic color={c.accentLight} style={{ marginTop: 14 }}>
          competitor.
        </Slam>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 3. Rankly, the AI visibility tracker ----------
const Logo: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const pop = useIn(0, 9);
  const word = useIn(14, 13);
  const tag = ramp(frame, 26, 8);
  const tagline = (
    <div style={{ marginTop: 30, opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`, fontFamily: serif, fontStyle: "italic", fontSize: v ? 86 : 104, color: c.accentLight }}>
      the AI visibility tracker
    </div>
  );
  if (v) {
    return (
      <AbsoluteFill>
        <DotGrid />
        <Center>
          <div style={{ transform: `scale(${pop}) rotate(${interpolate(pop, [0, 1], [-25, 0])}deg)` }}>
            <Robot size={240} />
          </div>
          <div style={{ marginTop: 30, fontFamily: sans, fontWeight: 700, fontSize: 180, letterSpacing: "-0.045em", lineHeight: 1, color: c.cream, opacity: word, transform: `translateY(${(1 - word) * 30}px)` }}>
            Rankly
          </div>
          {tagline}
        </Center>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", alignItems: "center", gap: interpolate(word, [0, 1], [0, 44]) }}>
          <div style={{ transform: `scale(${pop}) rotate(${interpolate(pop, [0, 1], [-25, 0])}deg)` }}>
            <Robot size={interpolate(word, [0, 1], [260, 190])} />
          </div>
          <div style={{ overflow: "hidden", width: interpolate(word, [0, 1], [0, 640]) }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 190, letterSpacing: "-0.045em", color: c.cream, opacity: word }}>
              Rankly
            </span>
          </div>
        </div>
        {tagline}
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 4. Tagline ----------
const Shortlist: React.FC = () => {
  const v = useV();
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: v ? "center" : "baseline", gap: v ? 16 : 34 }}>
          <Slam size={v ? 136 : 170}>Get on AI&apos;s</Slam>
          <Slam delay={15} size={v ? 210 : 220} italic color={c.accentLight}>
            shortlist.
          </Slam>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 5. Google shows 10 links, AI search names 3 ----------
const Google: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const swap = frame >= 30;
  const n = swap ? 3 : 10;
  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: "center", gap: v ? 70 : 140 }}>
        <div style={{ fontFamily: sans, color: c.cream, width: v ? 860 : 620 }}>
          <div style={{ fontSize: 64, fontWeight: 600, color: swap ? c.accentLight : "rgba(248,245,240,0.7)" }}>{swap ? "AI search names" : "Google shows"}</div>
          <div key={n} style={{ fontSize: 300, fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1, marginTop: 10, opacity: ramp(frame, swap ? 30 : 0, 6) }}>
            {n}
          </div>
          <div style={{ fontSize: 64, color: "rgba(248,245,240,0.7)" }}>{swap ? "businesses." : "links."}</div>
        </div>
        <div style={{ width: v ? 860 : 620 }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const keep = i < 3;
            const o = swap ? (keep ? 1 : interpolate(frame, [30, 40], [1, 0.08], clamp)) : ramp(frame, i * 2, 6);
            return (
              <div
                key={i}
                style={{
                  height: v ? 30 : 34,
                  marginTop: 14,
                  borderRadius: 10,
                  background: swap && keep ? c.accent : "rgba(248,245,240,0.12)",
                  width: `${92 - (i % 4) * 9}%`,
                  opacity: o,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 6. Not on the list? You're invisible. ----------
const Invisible: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const second = frame >= 30;
  const youFade = interpolate(frame, [30, 48], [1, 0.05], clamp);
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        {second ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
            <Slam delay={30} size={v ? 96 : 130}>
              You&apos;re
            </Slam>
            <Slam delay={36} size={v ? 124 : 160} italic color={c.accentLight}>
              invisible.
            </Slam>
          </div>
        ) : (
          <Slam size={v ? 100 : 130}>Not on the list?</Slam>
        )}
        <div style={{ width: v ? 920 : 980, marginTop: 56, fontFamily: sans }}>
          {[...RANKED, "You"].map((n, i) => (
            <div
              key={n}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 30px",
                marginTop: 12,
                borderRadius: 18,
                background: "rgba(248,245,240,0.06)",
                border: "1px solid rgba(248,245,240,0.08)",
                fontSize: v ? 42 : 46,
                color: c.cream,
                opacity: i === 3 ? youFade * ramp(frame, 14, 6) : ramp(frame, i * 4, 6),
              }}
            >
              <span>
                <span style={{ fontFamily: mono, fontSize: 34, opacity: 0.5, marginRight: 22 }}>{i < 3 ? `#${i + 1}` : "—"}</span>
                {n}
              </span>
              {i < 3 && <span style={{ fontSize: 30, background: "rgba(4,120,87,0.25)", color: "#7ee0b8", borderRadius: 30, padding: "6px 18px" }}>recommended</span>}
            </div>
          ))}
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 7. The free check (light UI) ----------
const UI: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: c.cream }}>
    <DotGrid dark={false} opacity={0.6} />
    {children}
  </AbsoluteFill>
);

const Check: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const card = useIn(0, 15);
  const clickAt = 92;
  const asking = frame >= clickAt;
  const press = frame >= clickAt && frame < clickAt + 6 ? 0.94 : 1;
  // Cursor glides in from below-left of the button, then clicks it.
  const cx = interpolate(frame, [70, 90], [-45, 55], clamp);
  const cy = interpolate(frame, [70, 90], [260, 45], clamp);
  return (
    <UI>
      <AbsoluteFill style={{ padding: v ? "0 80px" : "130px 160px", justifyContent: v ? "center" : "flex-start", fontFamily: sans, color: c.ink }}>
        <div style={{ opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
          <Label size={v ? 28 : 36} color={c.accent}>AI visibility tracker · AEO &amp; GEO</Label>
          <div style={{ fontSize: v ? 116 : 130, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1, marginTop: 24 }}>
            Free <Em color={c.accent}>AI visibility</Em> check.
          </div>
          <div style={{ width: v ? 920 : 1600, marginTop: 56, background: c.card, border: `3px solid ${c.line}`, borderRadius: 32, boxShadow: "0 30px 80px -40px rgba(60,30,10,0.4)" }}>
            <div style={{ padding: "28px 36px", fontSize: v ? 46 : 50, borderBottom: `3px solid ${c.line}` }}>
              <Typed text="Acme CRM" start={14} speed={2.2} />
            </div>
            <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: v ? "stretch" : "center", padding: 16 }}>
              <div style={{ flex: 1, padding: "14px 20px", fontSize: v ? 46 : 50 }}>
                {frame >= 36 ? <Typed text="best CRM for freelancers" start={36} speed={1.3} /> : <span style={{ color: "#aaa197" }}>a question customers ask</span>}
              </div>
              <div style={{ position: "relative", marginTop: v ? 12 : 0 }}>
                <div
                  style={{
                    background: c.accent,
                    color: "white",
                    borderRadius: 22,
                    padding: "24px 38px",
                    fontSize: 44,
                    fontWeight: 600,
                    textAlign: "center",
                    transform: `scale(${press})`,
                    opacity: asking ? 0.75 + 0.25 * Math.sin(frame / 3) : 1,
                  }}
                >
                  {asking ? "Asking AI…" : "Run free check →"}
                </div>
                <svg width="60" height="60" viewBox="0 0 24 24" style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, opacity: ramp(frame, 66, 4) }}>
                  <path d="M3 2l7 19 2.5-7.5L20 11z" fill={c.ink} stroke="white" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </UI>
  );
};

// ---------- 8. The result ----------
const Result: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const card = useIn(0, 14);
  const score = frame >= 80 ? 2 : null;
  return (
    <UI>
      <Center>
        <div
          style={{
            width: v ? 920 : 1440,
            background: c.card,
            border: `3px solid ${c.line}`,
            borderRadius: 40,
            padding: v ? "42px 44px" : "46px 60px",
            boxShadow: "0 50px 120px -50px rgba(60,30,10,0.5)",
            transform: `scale(${interpolate(card, [0, 1], [0.92, 1])})`,
            opacity: card,
            fontFamily: sans,
            color: c.ink,
          }}
        >
          <div style={{ fontSize: v ? 72 : 76, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.05 }}>
            AI recommends your <Em color={c.accent}>competitor.</Em>
          </div>
          {[...RANKED.slice(0, 2), "You (Acme CRM)"].map((n, i) => {
            const you = i === 2;
            return (
              <div
                key={n}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 18,
                  padding: v ? "18px 24px" : "18px 30px",
                  borderRadius: 20,
                  background: c.cream,
                  border: you ? `3px solid ${c.accent}` : `3px solid transparent`,
                  fontSize: v ? 40 : 46,
                  fontWeight: you ? 600 : 400,
                  opacity: ramp(frame, 16 + i * 14, 7),
                }}
              >
                <span>
                  <span style={{ fontFamily: mono, fontSize: v ? 30 : 34, color: c.muted, marginRight: 22 }}>{you ? "—" : `#${i + 1}`}</span>
                  {n}
                </span>
                <span style={{ fontSize: v ? 28 : 32, borderRadius: 30, padding: "6px 20px", background: you ? c.accentSoft : c.greenSoft, color: you ? c.accent : c.green }}>
                  {you ? "not mentioned" : "recommended"}
                </span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28, paddingTop: 24, borderTop: `3px solid ${c.line}` }}>
            <div>
              <div style={{ fontSize: 40, color: c.muted }}>AI visibility score</div>
              <div style={{ fontSize: 110, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1, marginTop: 6 }}>
                {score ?? "?"}
                <span style={{ fontSize: 56, color: c.muted }}>/5</span>
              </div>
            </div>
            <div style={{ fontSize: v ? 50 : 56, fontWeight: 600, color: c.accent, opacity: ramp(frame, 96, 8) }}>+ 3 fixes →</div>
          </div>
        </div>
      </Center>
    </UI>
  );
};

// ---------- 9. Free check. No signup. No card. ----------
const Free: React.FC = () => {
  const v = useV();
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", flexDirection: v ? "column" : "row", gap: v ? 24 : 34, alignItems: v ? "center" : "baseline" }}>
          <Slam size={v ? 124 : 108}>Free check.</Slam>
          <Slam delay={15} size={v ? 124 : 108}>
            No signup.
          </Slam>
          <Slam delay={30} size={v ? 160 : 134} italic color={c.accentLight}>
            No card.
          </Slam>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 10. Weekly: 5 questions → AI every Monday → report ----------
const STEPS = ["Add 5 questions.", "We ask AI every Monday.", "Score + 3 fixes by email."];
const Todo: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const step = frame < 40 ? 0 : frame < 80 ? 1 : 2;
  const panel = useIn(step === 0 ? 0 : step === 1 ? 40 : 80, 14);
  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: v ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          padding: v ? "0 80px" : "0 140px",
          gap: v ? 56 : 90,
          fontFamily: sans,
          color: c.cream,
        }}
      >
        <div style={{ width: v ? 920 : 820 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
            Every <Em>Monday.</Em>
          </div>
          {STEPS.map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 40, opacity: i > step ? 0.2 : i === step ? 1 : 0.5 }}>
              <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 64, color: c.accentLight, width: 50 }}>{i + 1}</span>
              <span style={{ fontSize: 56, fontWeight: 600, letterSpacing: "-0.02em" }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: v ? "none" : 1, height: v ? 520 : undefined, display: "flex", alignItems: v ? "flex-start" : "center", justifyContent: "center", opacity: panel, transform: `translateY(${(1 - panel) * 40}px)` }}>
          {step === 0 && (
            <div style={{ width: 700, background: c.card, color: c.ink, borderRadius: 32, padding: 40 }}>
              <div style={{ fontSize: 46, fontWeight: 700 }}>Acme CRM</div>
              {["best CRM for freelancers", "CRM for consultants", "CRM with invoicing", "CRM for agencies", "CRM for designers"].map((q, i) => (
                <div key={q} style={{ fontSize: 40, padding: "14px 0", borderTop: `3px solid ${c.line}`, marginTop: i ? 0 : 18, opacity: ramp(frame, 6 + i * 5, 5) }}>
                  <span style={{ fontFamily: mono, fontSize: 32, color: c.accent, marginRight: 18 }}>{i + 1}</span>
                  {q}
                </div>
              ))}
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "flex", gap: 14 }}>
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => (
                <div
                  key={d}
                  style={{
                    width: v ? 108 : 92,
                    height: 190,
                    borderRadius: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    fontFamily: mono,
                    fontSize: 30,
                    background: i === 0 ? c.accent : "rgba(248,245,240,0.06)",
                    color: i === 0 ? "white" : "rgba(248,245,240,0.4)",
                  }}
                >
                  {d}
                  {i === 0 && <span style={{ fontSize: 50 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div style={{ width: 720, background: c.card, color: c.ink, borderRadius: 32, padding: 40 }}>
              <div style={{ fontSize: 34, color: c.muted }}>From Rankly · Monday</div>
              <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 6 }}>AI visibility: 3/5 ↑</div>
              {["Publish “Northwind vs Acme”", "Get on “best CRMs” lists", "Answer 2 Reddit threads"].map((f, i) => (
                <div key={f} style={{ fontSize: 40, marginTop: 16, opacity: ramp(frame, 88 + i * 6, 5) }}>
                  <span style={{ color: c.accent, marginRight: 14 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 11. Price: other AI SEO tools $50–500 → Rankly $9 ----------
const Price: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const val = Math.round(interpolate(frame, [12, 40], [50, 9], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const rankly = frame >= 40;
  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: "center", gap: v ? 70 : 120, fontFamily: sans, color: c.cream }}>
        <div style={{ width: v ? 860 : 720, background: c.ink2, border: "1px solid rgba(248,245,240,0.1)", borderRadius: 32, padding: 48, opacity: rankly ? 0.4 : 1 }}>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em" }}>Other AI SEO tools</div>
          <div style={{ fontSize: 46, color: "rgba(248,245,240,0.6)", marginTop: 10 }}>Built for big teams.</div>
          <div style={{ fontSize: 72, fontWeight: 700, marginTop: 30, textDecoration: rankly ? "line-through" : "none", textDecorationColor: c.accentLight }}>$50–500/mo</div>
        </div>
        <div style={{ textAlign: v ? "center" : "left" }}>
          <div style={{ fontSize: 64, fontWeight: 600, color: rankly ? c.accentLight : "rgba(248,245,240,0.5)" }}>{rankly ? "Rankly" : "Per month"}</div>
          <div style={{ fontSize: 280, fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1, color: rankly ? c.accentLight : c.cream }}>
            ${val}
            <span style={{ fontSize: 80, color: "rgba(248,245,240,0.5)" }}>/mo</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 12. Who AI recommends instead (bars) ----------
const BARS: [string, number][] = [
  ["Northwind CRM", 9],
  ["Ledgerly", 6],
  ["Paperfin", 3],
  ["You", 0],
];
const Bars: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: v ? "center" : "baseline", gap: v ? 8 : 26 }}>
          <Slam size={v ? 100 : 110}>See who AI picks</Slam>
          <Slam delay={6} size={v ? 130 : 136} italic color={c.accentLight}>
            instead.
          </Slam>
        </div>
        <div style={{ width: v ? 920 : 1300, marginTop: 56, background: c.card, borderRadius: 32, padding: v ? "36px 38px" : "40px 50px", fontFamily: sans }}>
          {BARS.map(([n, val], i) => (
            <div
              key={n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: v ? 20 : 28,
                marginTop: i ? 22 : 0,
                fontSize: v ? 40 : 46,
                fontWeight: n === "You" ? 700 : 400,
                color: n === "You" ? c.accent : c.ink,
              }}
            >
              <span style={{ width: v ? 300 : 360 }}>{n}</span>
              <div style={{ flex: 1, height: 34, borderRadius: 17, background: c.cream }}>
                <div style={{ height: "100%", borderRadius: 17, background: c.ink, width: `${(val / 9) * 100 * ramp(frame, 6 + i * 3, 14)}%` }} />
              </div>
              <span style={{ fontFamily: mono, fontSize: v ? 34 : 40, width: v ? 60 : 70, color: c.muted }}>{val}×</span>
            </div>
          ))}
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 13. The keywords, spelled out ----------
const KEYWORDS = [
  ["AEO", "Answer Engine Optimization"],
  ["GEO", "Generative Engine Optimization"],
  ["AI SEO", "Ranking in AI search"],
] as const;
const Keywords: React.FC = () => {
  const v = useV();
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <Slam size={v ? 76 : 84} color="rgba(248,245,240,0.75)" style={{ marginBottom: v ? 20 : 40 }}>
          One simple tracker for
        </Slam>
        {KEYWORDS.map(([k, meaning], i) =>
          v ? (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
              <Slam delay={12 + i * 22} size={140} italic color={c.accentLight}>
                {k}
              </Slam>
              <Slam delay={16 + i * 22} size={56} style={{ marginTop: 4 }}>
                {meaning}
              </Slam>
            </div>
          ) : (
            <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 44, marginTop: 14 }}>
              <Slam delay={12 + i * 22} size={150} italic color={c.accentLight} style={{ width: 460, textAlign: "right" }}>
                {k}
              </Slam>
              <Slam delay={16 + i * 22} size={70} style={{ width: 1000 }}>
                {meaning}
              </Slam>
            </div>
          ),
        )}
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 14. 0 minutes (on the silence) ----------
const Zero: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DotGrid opacity={0.6} />
      <Center>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: v ? 180 : 230, letterSpacing: "-0.055em", color: c.cream, opacity: ramp(frame, 0, 10), transform: `scale(${interpolate(frame, [0, 45], [1.04, 1], clamp)})` }}>
          0 minutes
        </div>
        <div style={{ fontFamily: sans, fontSize: v ? 54 : 64, color: "rgba(248,245,240,0.6)", marginTop: 10, opacity: ramp(frame, 12, 10) }}>
          checking AI by hand. <span style={{ color: c.cream, fontWeight: 600 }}>Ever.</span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 15. Beat montage ----------
const WORDS: [React.ReactNode, number][] = [
  ["5 questions.", 0],
  ["Every Monday.", 15],
  ["3 fixes.", 30],
  [
    <>
      <Em>$9</Em>/month.
    </>,
    45,
  ],
];
const Montage: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  let idx = 0;
  WORDS.forEach(([, at], i) => {
    if (frame >= at) idx = i;
  });
  const [word, at] = WORDS[Math.max(0, idx)];
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <Slam key={at} delay={at} size={v ? 136 : 200}>
          {word}
        </Slam>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 16. End card ----------
const End: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const dur = LAUNCH_FRAMES - b(79);
  const out = interpolate(frame, [dur - 24, dur], [1, 0], clamp);
  const logo = useIn(0, 12);
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center style={{ opacity: out }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})` }}>
          <Robot size={v ? 130 : 150} />
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: v ? 130 : 150, letterSpacing: "-0.045em", color: c.cream }}>Rankly</span>
        </div>
        <div
          style={{
            marginTop: 24,
            maxWidth: v ? 900 : undefined,
            textAlign: "center",
            lineHeight: 1.05,
            opacity: ramp(frame, 12, 10),
            fontFamily: sans,
            fontSize: v ? 92 : 84,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            color: c.cream,
          }}
        >
          The <Em>AI visibility</Em> tracker.
        </div>
        <div style={{ marginTop: 22, opacity: ramp(frame, 26, 10), fontFamily: sans, fontSize: 46, color: "rgba(248,245,240,0.7)" }}>
          Free check · 7-day trial for $0
        </div>
        <div
          style={{
            marginTop: 36,
            opacity: ramp(frame, 40, 10),
            transform: `translateY(${(1 - ramp(frame, 40, 10)) * 16}px)`,
            background: c.cream,
            color: c.ink,
            borderRadius: 70,
            padding: "20px 48px",
            fontFamily: sans,
            fontSize: 52,
            fontWeight: 700,
          }}
        >
          rankly.world →
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const COMPONENTS: Record<string, React.FC> = {
  ask: Ask,
  competitor: Competitor,
  logo: Logo,
  shortlist: Shortlist,
  google: Google,
  invisible: Invisible,
  check: Check,
  result: Result,
  free: Free,
  todo: Todo,
  price: Price,
  bars: Bars,
  keywords: Keywords,
  zero: Zero,
  montage: Montage,
  end: End,
};

// Persistent brand chip, so every frame says what Rankly is. In the reel it
// sits near the top, since Instagram covers the bottom with captions.
const Chip: React.FC = () => {
  const v = useV();
  const frame = useCurrentFrame();
  const light = SCENES.some(([k, s, e]) => (k === "check" || k === "result") && frame >= s && frame < e);
  const o = interpolate(frame, [b(17), b(18), b(79) - 10, b(79)], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        ...(v ? { top: 260, left: "50%", transform: "translateX(-50%)" } : { left: 48, bottom: 44 }),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 24px",
        borderRadius: 40,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 30,
        whiteSpace: "nowrap",
        background: light ? c.ink : "rgba(248,245,240,0.1)",
        color: c.cream,
        border: "1px solid rgba(248,245,240,0.14)",
        opacity: o,
      }}
    >
      <Robot size={34} blink={false} />
      Rankly · AI visibility tracker
    </div>
  );
};

// Orange flash on every cut.
const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const since = Math.min(...SCENES.slice(1).map(([, s]) => (frame >= s ? frame - s : 999)));
  return <AbsoluteFill style={{ background: c.accent, opacity: interpolate(since, [0, 4], [0.35, 0], clamp), pointerEvents: "none" }} />;
};

export const Launch: React.FC<{ music?: string; vertical?: boolean }> = ({ music = "music/launch-track.m4a", vertical = false }) => (
  <Vertical.Provider value={vertical}>
    <AbsoluteFill style={{ background: c.ink }}>
      {SCENES.map(([key, from, to]) => {
        const Scene = COMPONENTS[key];
        return (
          <Sequence key={key} from={from} durationInFrames={to - from}>
            <Scene />
          </Sequence>
        );
      })}
      <Chip />
      <CutFlash />
      {music && (
        <>
          {/* Part A: the original 0–32.464s */}
          <Sequence from={0} durationInFrames={SPLICE}>
            <Audio src={staticFile(music)} trimAfter={SPLICE} />
          </Sequence>
          {/* Part B: the original 46.464–59s (quiet breath, last loud run, the silence, the ending) */}
          <Sequence from={SPLICE} durationInFrames={LAUNCH_FRAMES - SPLICE}>
            <Audio
              src={staticFile(music)}
              trimBefore={B_START}
              volume={(f) => interpolate(f, [LAUNCH_FRAMES - SPLICE - 45, LAUNCH_FRAMES - SPLICE], [1, 0], clamp)}
            />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  </Vertical.Provider>
);
