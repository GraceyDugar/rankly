import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { DotGrid, Label, Robot, Typed, useIn } from "./components";
import { c, mono, sans, serif } from "./theme";

export const HOW_FRAMES = 750; // 25s, loops on the website

const STEPS = [
  { title: "Add your brand", body: "Your business + customer questions", from: 0, to: 150 },
  { title: "Rankly asks AI", body: "Like a brand-new customer would", from: 150, to: 270 },
  { title: "Who gets named", body: "Your rank and the competitors", from: 270, to: 420 },
  { title: "AI visibility score", body: "Plus 3 specific fixes", from: 420, to: 570 },
  { title: "Every Monday", body: "The report lands in your inbox", from: 570, to: 720 },
];

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = useIn(0, 16);
  return (
    <div
      style={{
        width: 980,
        background: c.card,
        border: `2px solid ${c.line}`,
        borderRadius: 36,
        padding: 52,
        boxShadow: "0 50px 100px -50px rgba(60,30,10,0.45)",
        transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
        opacity: p,
        fontFamily: sans,
        color: c.ink,
      }}
    >
      {children}
    </div>
  );
};

const Field: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ border: `2px solid ${c.line}`, borderRadius: 18, padding: "20px 26px", fontSize: 34, background: c.cream, marginTop: 18 }}>
    {children}
  </div>
);

const StepAdd: React.FC = () => {
  const frame = useCurrentFrame();
  const pressed = frame >= 120 && frame < 132;
  return (
    <Card>
      <Label>{"// free check"}</Label>
      <Field>
        <Typed text="Acme CRM" start={12} speed={2} />
      </Field>
      <Field>
        <Typed text="best CRM for freelancers" start={40} speed={1.4} />
      </Field>
      <div
        style={{
          marginTop: 26,
          background: c.accent,
          color: "white",
          borderRadius: 18,
          padding: "22px 0",
          textAlign: "center",
          fontSize: 34,
          fontWeight: 600,
          transform: `scale(${pressed ? 0.96 : 1})`,
        }}
      >
        Run free check →
      </div>
    </Card>
  );
};

const VERBS = ["Asking AI", "Pondering", "Triangulating", "Cross-referencing", "Sizing up competitors"];
const StepAsk: React.FC = () => {
  const frame = useCurrentFrame();
  const verb = VERBS[Math.min(VERBS.length - 1, Math.floor(frame / 24))];
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <Robot size={120} />
        <div>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em" }}>{verb}…</div>
          <div style={{ fontSize: 30, color: c.muted, marginTop: 8 }}>“best CRM for freelancers”</div>
        </div>
      </div>
      <div style={{ marginTop: 40, height: 14, borderRadius: 7, background: c.cream, overflow: "hidden" }}>
        <div style={{ width: `${interpolate(frame, [0, 115], [5, 100], { extrapolateRight: "clamp" })}%`, height: "100%", background: c.accent }} />
      </div>
    </Card>
  );
};

const NAMED = ["Northwind CRM", "Ledgerly", "Brightdesk", "Folio", "Pipewise"];
const StepNamed: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Card>
      <Label>{"// result for “best CRM for freelancers”"}</Label>
      <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 20 }}>
        AI doesn&apos;t mention <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: c.accent, fontSize: 64 }}>Acme CRM</span>.
      </div>
      <div style={{ fontSize: 28, color: c.muted, marginTop: 30 }}>It recommended these instead:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 16 }}>
        {NAMED.map((n, i) => {
          const p = Math.min(1, Math.max(0, (frame - 30 - i * 10) / 7));
          return (
            <span
              key={n}
              style={{
                border: `2px solid ${c.line}`,
                background: c.cream,
                borderRadius: 40,
                padding: "12px 24px",
                fontSize: 30,
                opacity: p,
                transform: `scale(${0.8 + 0.2 * p})`,
              }}
            >
              {n}
            </span>
          );
        })}
      </div>
    </Card>
  );
};

const StepScore: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ["best CRM for freelancers", false],
    ["best CRM for small agencies", true],
    ["simple CRM for consultants", false],
  ] as const;
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={{ fontSize: 120, fontWeight: 700, letterSpacing: "-0.05em" }}>2</span>
        <span style={{ fontSize: 50, color: c.muted }}>/5</span>
        <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 46, color: c.accent, marginLeft: 16 }}>AI visibility score</span>
      </div>
      {rows.map(([q, ok], i) => {
        const p = Math.min(1, Math.max(0, (frame - 15 - i * 12) / 8));
        return (
          <div
            key={q}
            style={{ display: "flex", justifyContent: "space-between", marginTop: 14, padding: "16px 22px", borderRadius: 16, background: c.cream, fontSize: 28, opacity: p }}
          >
            {q}
            <span style={{ fontSize: 22, borderRadius: 30, padding: "4px 14px", background: ok ? c.greenSoft : c.accentSoft, color: ok ? c.green : c.accent }}>
              {ok ? "#2" : "not mentioned"}
            </span>
          </div>
        );
      })}
      <div style={{ marginTop: 26, fontSize: 28, opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <b>Fix #1:</b> Publish an honest “Northwind vs Acme CRM” page.
      </div>
    </Card>
  );
};

const StepMonday: React.FC = () => {
  const p = useIn(5, 13);
  return (
    <div
      style={{
        width: 980,
        display: "flex",
        gap: 26,
        alignItems: "center",
        background: c.card,
        border: `2px solid ${c.line}`,
        borderRadius: 32,
        padding: "30px 34px",
        boxShadow: "0 40px 80px -30px rgba(60,30,10,0.35)",
        transform: `translateY(${interpolate(p, [0, 1], [-200, 0])}px)`,
        opacity: p,
        fontFamily: sans,
      }}
    >
      <Robot size={92} blink={false} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: c.muted }}>
          <span style={{ fontWeight: 600, color: c.ink }}>Rankly · reports@rankly.world</span>
          <span>Monday 9:00</span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 600, color: c.ink, marginTop: 6 }}>Acme CRM: AI visibility 2/5 this week</div>
        <div style={{ fontSize: 26, color: c.muted, marginTop: 4 }}>Beating you: Northwind (3×) · 3 fixes inside →</div>
      </div>
    </div>
  );
};

const panels = [StepAdd, StepAsk, StepNamed, StepScore, StepMonday];

export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const active = STEPS.findIndex((s) => frame >= s.from && frame < s.to);
  const fadeOut = interpolate(frame, [HOW_FRAMES - 30, HOW_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: c.cream }}>
      <DotGrid dark={false} opacity={0.5} />
      <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut), display: "flex", flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 90 }}>
        {/* Step list */}
        <div style={{ width: 560, fontFamily: sans }}>
          <Label>{"// how rankly works"}</Label>
          <div style={{ marginTop: 30 }}>
            {STEPS.map((s, i) => {
              const on = i === active;
              const done = active > i || active === -1;
              return (
                <div key={s.title} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "18px 0", opacity: on ? 1 : done ? 0.55 : 0.35 }}>
                  <span
                    style={{
                      width: 58,
                      height: 58,
                      flexShrink: 0,
                      borderRadius: 16,
                      display: "grid",
                      placeItems: "center",
                      fontFamily: mono,
                      fontSize: 24,
                      background: on ? c.accent : c.card,
                      color: on ? "white" : c.muted,
                      border: `2px solid ${on ? c.accent : c.line}`,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: c.ink, letterSpacing: "-0.02em" }}>{s.title}</div>
                    <div style={{ fontSize: 24, color: c.muted, marginTop: 4 }}>{s.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Live product panel */}
        <div style={{ flex: 1, position: "relative", height: 640, display: "flex", alignItems: "center" }}>
          {STEPS.map((s, i) => {
            const Panel = panels[i];
            return (
              <Sequence key={s.title} from={s.from} durationInFrames={(i === STEPS.length - 1 ? HOW_FRAMES : s.to) - s.from} layout="none">
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                  <Panel />
                </div>
              </Sequence>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
