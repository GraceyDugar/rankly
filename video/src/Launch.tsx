import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Center, DotGrid, Label, Robot, Slam, Typed, useIn } from "./components";
import { c, mono, sans, serif } from "./theme";

/*
 * 45s launch film: a remake of the original 60s Rankly intro with the same
 * soundtrack. The track is 120 BPM with its first beat at 0.464s, so every
 * cut sits on b(k). The music is the original's 0–32.464s followed by its
 * 46.464–59s (both bar lines), which keeps the hit, the silence and the ending.
 */
export const LAUNCH_FRAMES = 1350;
const b = (k: number) => Math.round(13.92 + 15 * k);
const SPLICE = b(64); // 32.464s
const B_START = Math.round(46.464 * 30);

const SCENES: [string, number, number][] = [
  ["wall", 0, b(8)],
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
  ["askai", b(64), b(67)],
  ["stranger", b(67), b(71)],
  ["zero", b(71), b(74)],
  ["montage", b(74), b(79)],
  ["end", b(79), LAUNCH_FRAMES],
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, start: number, len = 8) => interpolate(frame, [start, start + len], [0, 1], clamp);

// ---------- 1. A wall of AI answers where "you" are never mentioned ----------
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
    <AbsoluteFill>
      <DotGrid />
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
          {WALL.map(([q, names], i) => {
            const p = ramp(frame, i * 7, 10);
            return (
              <div
                key={q}
                style={{
                  background: c.ink2,
                  border: "1px solid rgba(248,245,240,0.08)",
                  borderRadius: 22,
                  padding: "22px 26px",
                  fontFamily: sans,
                  color: c.cream,
                  opacity: p * 0.9,
                  transform: `translateY(${(1 - p) * 40}px)`,
                  boxShadow: "0 30px 60px -30px rgba(0,0,0,0.8)",
                }}
              >
                <div style={{ fontFamily: mono, fontSize: 16, color: "rgba(248,245,240,0.5)" }}>{`// "${q}"`}</div>
                {names.map((n, k) => (
                  <div key={n} style={{ fontSize: 22, marginTop: 8 }}>
                    <span style={{ fontFamily: mono, color: "rgba(248,245,240,0.4)", marginRight: 10 }}>{k + 1}</span>
                    {n}
                  </div>
                ))}
                <div
                  style={{
                    display: "inline-block",
                    marginTop: 12,
                    background: c.accent,
                    color: "white",
                    fontSize: 15,
                    borderRadius: 20,
                    padding: "4px 12px",
                    opacity: ramp(frame, i * 7 + 8, 6),
                  }}
                >
                  You: not mentioned
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* Darken the edges so it reads as depth */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(22,19,15,0.92) 80%)" }} />
    </AbsoluteFill>
  );
};

// ---------- 2. The hit ----------
const Competitor: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame < 10 ? Math.sin(frame * 3) * (10 - frame) : 0;
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center style={{ transform: `translateX(${shake}px)` }}>
        <Slam size={150}>AI picked your</Slam>
        <Slam delay={8} size={230} italic color={c.accentLight} style={{ marginTop: 14 }}>
          competitor.
        </Slam>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 3. Robot logo reveal ----------
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = useIn(0, 9);
  const word = useIn(30, 13);
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
        <div style={{ height: 40 }} />
        <div style={{ opacity: ramp(frame, 40, 10) }}>
          <Label color={c.accentLight}>{"// the AI visibility tracker"}</Label>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 4. Tagline ----------
const Shortlist: React.FC = () => (
  <AbsoluteFill>
    <DotGrid />
    <Center>
      <div style={{ display: "flex", alignItems: "baseline", gap: 34 }}>
        <Slam size={170}>Get on AI&apos;s</Slam>
        <Slam delay={15} size={220} italic color={c.accentLight}>
          shortlist.
        </Slam>
      </div>
    </Center>
  </AbsoluteFill>
);

// ---------- 5. Google shows 10 links, AI names 3 ----------
const Google: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = frame >= 30;
  const n = swap ? 3 : 10;
  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 140 }}>
        <div style={{ fontFamily: sans, color: c.cream, width: 560 }}>
          <Label color={c.accentLight}>{swap ? "AI names" : "Google shows"}</Label>
          <div key={n} style={{ fontSize: 300, fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1, marginTop: 10, opacity: ramp(frame, swap ? 30 : 0, 6) }}>
            {n}
          </div>
          <div style={{ fontSize: 60, color: "rgba(248,245,240,0.7)" }}>{swap ? "businesses." : "links."}</div>
        </div>
        <div style={{ width: 620 }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const keep = i < 3;
            const o = swap ? (keep ? 1 : interpolate(frame, [30, 40], [1, 0.08], clamp)) : ramp(frame, i * 2, 6);
            return (
              <div
                key={i}
                style={{
                  height: 34,
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
const RANKED = ["Northwind CRM", "Ledgerly", "Paperfin"];
const Invisible: React.FC = () => {
  const frame = useCurrentFrame();
  const second = frame >= 30;
  const youFade = interpolate(frame, [30, 48], [1, 0.05], clamp);
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        {second ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
            <Slam delay={30} size={120}>
              You&apos;re
            </Slam>
            <Slam delay={36} size={150} italic color={c.accentLight}>
              invisible.
            </Slam>
          </div>
        ) : (
          <Slam size={120}>Not on the list?</Slam>
        )}
        <div style={{ width: 900, marginTop: 60, fontFamily: sans }}>
          {[...RANKED, "You"].map((n, i) => (
            <div
              key={n}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 26px",
                marginTop: 12,
                borderRadius: 16,
                background: "rgba(248,245,240,0.06)",
                border: "1px solid rgba(248,245,240,0.08)",
                fontSize: 34,
                color: c.cream,
                opacity: i === 3 ? youFade * ramp(frame, 14, 6) : ramp(frame, i * 4, 6),
              }}
            >
              <span>
                <span style={{ fontFamily: mono, fontSize: 22, opacity: 0.5, marginRight: 20 }}>{i < 3 ? `#${i + 1}` : "—"}</span>
                {n}
              </span>
              {i < 3 && (
                <span style={{ fontSize: 20, background: "rgba(4,120,87,0.25)", color: "#7ee0b8", borderRadius: 20, padding: "4px 14px" }}>recommended</span>
              )}
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
  const frame = useCurrentFrame();
  const card = useIn(0, 15);
  const clickAt = 92;
  const asking = frame >= clickAt;
  // Cursor glides to the button, then clicks.
  const cx = interpolate(frame, [70, 90], [1100, 1330], clamp);
  const cy = interpolate(frame, [70, 90], [760, 640], clamp);
  const press = frame >= clickAt && frame < clickAt + 6 ? 0.94 : 1;
  return (
    <UI>
      <AbsoluteFill style={{ padding: "150px 200px", fontFamily: sans, color: c.ink }}>
        <div style={{ opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
          <Label>AI visibility tracker · AEO &amp; GEO</Label>
          <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1, marginTop: 24 }}>
            Get on AI&apos;s <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: c.accent }}>shortlist.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: c.accent, fontWeight: 600 }}>Free check · ~30 seconds</div>
          <div style={{ width: 1100, marginTop: 18, background: c.card, border: `2px solid ${c.line}`, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 80px -40px rgba(60,30,10,0.4)" }}>
            <div style={{ padding: "26px 30px", fontSize: 34, borderBottom: `2px solid ${c.line}` }}>
              <Typed text="Acme CRM" start={14} speed={2.2} />
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: 14 }}>
              <div style={{ flex: 1, padding: "12px 16px", fontSize: 34 }}>
                {frame >= 36 ? <Typed text="best CRM for freelancers" start={36} speed={1.3} /> : <span style={{ color: "#aaa197" }}>e.g. best CRM for freelancers</span>}
              </div>
              <div
                style={{
                  background: c.accent,
                  color: "white",
                  borderRadius: 18,
                  padding: "20px 30px",
                  fontSize: 30,
                  fontWeight: 600,
                  transform: `scale(${press})`,
                  opacity: asking ? 0.75 + 0.25 * Math.sin(frame / 3) : 1,
                }}
              >
                {asking ? "Asking AI…" : "Run free check →"}
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* cursor */}
      <svg width="44" height="44" viewBox="0 0 24 24" style={{ position: "absolute", left: cx, top: cy, opacity: ramp(frame, 66, 4) }}>
        <path d="M3 2l7 19 2.5-7.5L20 11z" fill={c.ink} stroke="white" strokeWidth="1.2" />
      </svg>
    </UI>
  );
};

// ---------- 8. The result ----------
const Result: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useIn(0, 14);
  const score = frame >= 80 ? 2 : null;
  return (
    <UI>
      <Center>
        <div
          style={{
            width: 1180,
            background: c.card,
            border: `2px solid ${c.line}`,
            borderRadius: 36,
            padding: "48px 56px",
            boxShadow: "0 50px 120px -50px rgba(60,30,10,0.5)",
            transform: `scale(${interpolate(card, [0, 1], [0.92, 1])})`,
            opacity: card,
            fontFamily: sans,
            color: c.ink,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Label>{"// free check"}</Label>
            <Label>Rankly</Label>
          </div>
          <div style={{ fontFamily: mono, fontSize: 22, color: c.muted, marginTop: 18 }}>Q: “best CRM for freelancers”</div>
          <div style={{ fontSize: 66, fontWeight: 700, letterSpacing: "-0.035em", marginTop: 10 }}>
            AI recommends your <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: c.accent, fontSize: 78 }}>competitor.</span>
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
                  marginTop: 16,
                  padding: "18px 26px",
                  borderRadius: 18,
                  background: c.cream,
                  border: you ? `2px solid ${c.accent}` : `2px solid transparent`,
                  fontSize: 32,
                  fontWeight: you ? 600 : 400,
                  opacity: ramp(frame, 16 + i * 14, 7),
                }}
              >
                <span>
                  <span style={{ fontFamily: mono, fontSize: 22, color: c.muted, marginRight: 20 }}>{you ? "—" : `#${i + 1}`}</span>
                  {n}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    borderRadius: 20,
                    padding: "6px 16px",
                    background: you ? c.accentSoft : c.greenSoft,
                    color: you ? c.accent : c.green,
                  }}
                >
                  {you ? "not mentioned" : "recommended"}
                </span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 26, paddingTop: 22, borderTop: `2px solid ${c.line}` }}>
            <div>
              <Label>AI visibility score</Label>
              <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1, marginTop: 8 }}>
                {score ?? "?"}
                <span style={{ fontSize: 40, color: c.muted }}>/5</span>
              </div>
            </div>
            <div style={{ fontSize: 28, color: c.accent, opacity: ramp(frame, 96, 8) }}>+ 3 fixes →</div>
          </div>
        </div>
      </Center>
    </UI>
  );
};

// ---------- 9. Free check. No signup. No card. ----------
const Free: React.FC = () => (
  <AbsoluteFill>
    <DotGrid />
    <Center>
      <div style={{ display: "flex", gap: 34, alignItems: "baseline" }}>
        <Slam size={108}>Free check.</Slam>
        <Slam delay={15} size={108}>
          No signup.
        </Slam>
        <Slam delay={30} size={134} italic color={c.accentLight}>
          No card.
        </Slam>
      </div>
    </Center>
  </AbsoluteFill>
);

// ---------- 10. Not a dashboard. A to-do list. ----------
const STEPS = [
  ["01", "Add 5 questions.", "Your brand + what customers ask. 2 minutes."],
  ["02", "We ask AI every Monday.", "Like a brand-new customer would."],
  ["03", "Report in your inbox.", "Score, rank, competitors, 3 fixes."],
] as const;
const Todo: React.FC = () => {
  const frame = useCurrentFrame();
  const step = frame < 40 ? 0 : frame < 80 ? 1 : 2;
  const panel = useIn(step === 0 ? 0 : step === 1 ? 40 : 80, 14);
  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "0 170px", gap: 110, fontFamily: sans, color: c.cream }}>
        <div style={{ width: 720 }}>
          <Label color={c.accentLight}>{"// how it works"}</Label>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 20, lineHeight: 1.02 }}>Not a dashboard.</div>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 96, color: c.accentLight, lineHeight: 1.02 }}>A to-do list.</div>
          {STEPS.map(([n, t, s], i) => (
            <div key={n} style={{ display: "flex", gap: 22, marginTop: 34, opacity: i > step ? 0.18 : i === step ? 1 : 0.45 }}>
              <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 40, color: c.accentLight }}>{n}</span>
              <div>
                <div style={{ fontSize: 36, fontWeight: 600 }}>{t}</div>
                <div style={{ fontSize: 24, color: "rgba(248,245,240,0.55)", marginTop: 4 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", opacity: panel, transform: `translateY(${(1 - panel) * 40}px)` }}>
          {step === 0 && (
            <div style={{ width: 560, background: c.card, color: c.ink, borderRadius: 28, padding: 36 }}>
              <div style={{ fontSize: 22, color: c.muted }}>Brand</div>
              <div style={{ fontSize: 36, fontWeight: 600 }}>Acme CRM</div>
              {["best CRM for freelancers", "CRM for solo consultants", "cheap CRM with invoicing", "simple CRM for agencies", "best CRM for designers"].map((q, i) => (
                <div key={q} style={{ fontSize: 24, padding: "12px 0", borderTop: `2px solid ${c.line}`, marginTop: i ? 0 : 16, opacity: ramp(frame, 6 + i * 5, 5) }}>
                  <span style={{ fontFamily: mono, color: c.muted, marginRight: 14 }}>0{i + 1}</span>
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
                    width: 86,
                    height: 150,
                    borderRadius: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    fontFamily: mono,
                    fontSize: 20,
                    background: i === 0 ? c.accent : "rgba(248,245,240,0.06)",
                    color: i === 0 ? "white" : "rgba(248,245,240,0.4)",
                  }}
                >
                  {d}
                  {i === 0 && <span style={{ fontSize: 34 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div style={{ width: 600, background: c.card, color: c.ink, borderRadius: 28, padding: 34 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: c.muted }}>
                <span>From Rankly · Monday</span>
                <span>9:00</span>
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>AI visibility: 3/5 (↑1)</div>
              <div style={{ fontSize: 24, background: c.cream, borderRadius: 14, padding: "12px 16px", marginTop: 14 }}>
                <b>Beating you:</b> Northwind (9×), Ledgerly (6×)
              </div>
              {["Publish “Northwind vs Acme”", "Get listed in “Best CRMs for freelancers”", "Answer 2 Reddit threads"].map((f, i) => (
                <div key={f} style={{ fontSize: 24, marginTop: 12, opacity: ramp(frame, 88 + i * 6, 5) }}>
                  <span style={{ color: c.accent, marginRight: 12 }}>✓</span>
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

// ---------- 11. Price: $50+ → $9 ----------
const Price: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [12, 40], [50, 9], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const rankly = frame >= 40;
  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120, fontFamily: sans, color: c.cream }}>
        <div style={{ width: 520, background: c.ink2, border: "1px solid rgba(248,245,240,0.1)", borderRadius: 30, padding: 40, opacity: rankly ? 0.35 : 1 }}>
          <Label color="rgba(248,245,240,0.5)">Other AI SEO tools</Label>
          <div style={{ fontSize: 40, fontWeight: 600, marginTop: 14 }}>Built for big teams.</div>
          {[80, 70, 88, 60].map((w, i) => (
            <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 7, background: "rgba(248,245,240,0.12)", marginTop: 18 }} />
          ))}
          <div style={{ fontFamily: mono, fontSize: 22, marginTop: 30, color: "rgba(248,245,240,0.5)" }}>$50–500 / MONTH</div>
        </div>
        <div>
          <Label color={rankly ? c.accentLight : "rgba(248,245,240,0.5)"}>{rankly ? "Rankly" : "Per month"}</Label>
          <div style={{ fontSize: 260, fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1, color: rankly ? c.accentLight : c.cream }}>
            ${v}
            <span style={{ fontSize: 70, color: "rgba(248,245,240,0.5)" }}>/mo</span>
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
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
          <Slam size={100}>Who AI recommends</Slam>
          <Slam delay={6} size={124} italic color={c.accentLight}>
            instead.
          </Slam>
        </div>
        <div style={{ width: 1100, marginTop: 56, background: c.card, borderRadius: 30, padding: "36px 44px", fontFamily: sans }}>
          {BARS.map(([n, v], i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 24, marginTop: i ? 18 : 0, fontSize: 30, color: n === "You" ? c.accent : c.ink }}>
              <span style={{ width: 260 }}>{n}</span>
              <div style={{ flex: 1, height: 26, borderRadius: 13, background: c.cream }}>
                <div style={{ height: "100%", borderRadius: 13, background: c.ink, width: `${(v / 9) * 100 * ramp(frame, 6 + i * 3, 14)}%` }} />
              </div>
              <span style={{ fontFamily: mono, fontSize: 22, width: 50, color: c.muted }}>{v}×</span>
            </div>
          ))}
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 13. Ask AI yourself? ----------
const ChatShell: React.FC<{ header: string; children: React.ReactNode; headerColor?: string }> = ({ header, children, headerColor }) => (
  <div style={{ width: 1100, minHeight: 380, background: c.ink2, border: "1px solid rgba(248,245,240,0.1)", borderRadius: 30, padding: "26px 36px", fontFamily: sans, color: c.cream }}>
    <div style={{ fontFamily: mono, fontSize: 20, color: headerColor ?? "rgba(248,245,240,0.45)" }}>● {header}</div>
    {children}
  </div>
);
const UserBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
    <div style={{ background: "rgba(248,245,240,0.12)", borderRadius: 18, padding: "14px 22px", fontSize: 30 }}>{children}</div>
  </div>
);
const AiBubble: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <div style={{ marginTop: 22, maxWidth: 800, background: "rgba(248,245,240,0.06)", borderRadius: 18, padding: "18px 24px", fontSize: 28, lineHeight: 1.4, opacity }}>
    {children}
  </div>
);

const AskAI: React.FC = () => (
  <AbsoluteFill>
    <DotGrid />
    <Center>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 50 }}>
        <Slam size={110}>Ask AI</Slam>
        <Slam delay={8} size={136} italic color={c.accentLight}>
          yourself?
        </Slam>
      </div>
      <ChatShell header="AI chat · signed in as you">
        <UserBubble>
          <Typed text="best CRM for freelancers" start={8} speed={1.1} />
        </UserBubble>
      </ChatShell>
    </Center>
  </AbsoluteFill>
);

// ---------- 14. It remembers you → Rankly asks like a stranger ----------
const Stranger: React.FC = () => {
  const frame = useCurrentFrame();
  const second = frame >= 30;
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginBottom: 50 }}>
          {second ? (
            <>
              <Slam delay={30} size={104}>
                Rankly asks like a
              </Slam>
              <Slam delay={36} size={130} italic color={c.accentLight}>
                stranger.
              </Slam>
            </>
          ) : (
            <>
              <Slam size={110}>It</Slam>
              <Slam delay={4} size={136} italic color={c.accentLight}>
                remembers
              </Slam>
              <Slam delay={8} size={110}>
                you.
              </Slam>
            </>
          )}
        </div>
        <ChatShell header={second ? "New session · asked like a new customer" : "AI chat · signed in as you"} headerColor={second ? c.accentLight : undefined}>
          <UserBubble>best CRM for freelancers</UserBubble>
          {second ? (
            <>
              <AiBubble opacity={ramp(frame, 32, 6)}>
                Top picks for freelancers: <b>Northwind CRM</b>, <b>Ledgerly</b> and <b>Paperfin</b>.
              </AiBubble>
              <div style={{ display: "inline-block", marginTop: 18, background: c.accent, color: "white", borderRadius: 20, padding: "6px 16px", fontSize: 22, opacity: ramp(frame, 44, 5) }}>
                You: not mentioned
              </div>
            </>
          ) : (
            <AiBubble opacity={ramp(frame, 6, 6)}>
              Great question! Since you use <b>Acme CRM</b>, it&apos;s a great fit for you, and you&apos;re already set up 😊
            </AiBubble>
          )}
        </ChatShell>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 15. 0 minutes (on the silence) ----------
const Zero: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DotGrid opacity={0.6} />
      <Center>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 230, letterSpacing: "-0.055em", color: c.cream, opacity: ramp(frame, 0, 10), transform: `scale(${interpolate(frame, [0, 45], [1.04, 1], clamp)})` }}>
          0 minutes
        </div>
        <div style={{ fontFamily: sans, fontSize: 48, color: "rgba(248,245,240,0.6)", marginTop: 10, opacity: ramp(frame, 12, 10) }}>
          checking AI by hand. <span style={{ color: c.cream, fontWeight: 600 }}>Ever.</span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 16. Beat montage ----------
const WORDS: [React.ReactNode, number][] = [
  ["5 questions.", 0],
  ["Every Monday.", 15],
  ["3 fixes.", 30],
  [
    <>
      <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: c.accentLight }}>$9</span>/month.
    </>,
    45,
  ],
];
const Montage: React.FC = () => {
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
        <Slam key={at} delay={at} size={200}>
          {word}
        </Slam>
      </Center>
    </AbsoluteFill>
  );
};

// ---------- 17. End card ----------
const End: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = LAUNCH_FRAMES - b(79);
  const out = interpolate(frame, [dur - 24, dur], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <DotGrid />
      <Center style={{ opacity: out }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: useIn(0, 12), transform: `scale(${interpolate(useIn(0, 12), [0, 1], [0.85, 1])})` }}>
          <Robot size={150} />
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 150, letterSpacing: "-0.045em", color: c.cream }}>Rankly</span>
        </div>
        <div style={{ marginTop: 30, opacity: ramp(frame, 14, 10), fontFamily: sans, fontSize: 76, fontWeight: 700, letterSpacing: "-0.035em", color: c.cream }}>
          Get on AI&apos;s <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: c.accentLight, fontSize: 88 }}>shortlist.</span>
        </div>
        <div style={{ marginTop: 26, opacity: ramp(frame, 30, 10), fontFamily: sans, fontSize: 32, color: "rgba(248,245,240,0.65)" }}>
          Free check · No signup · 7-day trial for $0
        </div>
        <div
          style={{
            marginTop: 34,
            opacity: ramp(frame, 44, 10),
            transform: `translateY(${(1 - ramp(frame, 44, 10)) * 16}px)`,
            background: c.cream,
            color: c.ink,
            borderRadius: 60,
            padding: "18px 40px",
            fontFamily: sans,
            fontSize: 36,
            fontWeight: 600,
          }}
        >
          rankly.world →
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const COMPONENTS: Record<string, React.FC> = {
  wall: Wall,
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
  askai: AskAI,
  stranger: Stranger,
  zero: Zero,
  montage: Montage,
  end: End,
};

// Persistent "Checked by hand: 0 min" chip, like the original.
const Chip: React.FC = () => {
  const frame = useCurrentFrame();
  const light = SCENES.some(([k, s, e]) => (k === "check" || k === "result") && frame >= s && frame < e);
  const o = interpolate(frame, [b(8), b(9), LAUNCH_FRAMES - 30, LAUNCH_FRAMES - 10], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        bottom: 44,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 20px",
        borderRadius: 30,
        fontFamily: mono,
        fontSize: 20,
        background: light ? c.ink : "rgba(248,245,240,0.08)",
        color: light ? c.cream : "rgba(248,245,240,0.75)",
        border: "1px solid rgba(248,245,240,0.12)",
        opacity: o,
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 5, background: "#34d399", opacity: 0.6 + 0.4 * Math.sin(frame / 5) }} />
      Checked by hand: <b>0 min</b>
    </div>
  );
};

// Orange flash on every cut.
const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const since = Math.min(...SCENES.slice(1).map(([, s]) => (frame >= s ? frame - s : 999)));
  return <AbsoluteFill style={{ background: c.accent, opacity: interpolate(since, [0, 4], [0.35, 0], clamp), pointerEvents: "none" }} />;
};

export const Launch: React.FC<{ music?: string }> = ({ music = "music/launch-track.m4a" }) => (
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
);
