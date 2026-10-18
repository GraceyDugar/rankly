import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { c, mono, sans, serif } from "./theme";

// The Rankly robot mascot (same art as the logo), with optional blink.
export const Robot: React.FC<{ size: number; blink?: boolean; tile?: boolean }> = ({ size, blink = true, tile = true }) => {
  const frame = useCurrentFrame();
  const closed = blink && frame % 75 >= 70; // quick blink every 2.5s
  const glow = 0.6 + 0.4 * Math.sin(frame / 6);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {tile && <rect width="64" height="64" rx="15" fill={c.accent} />}
      <line x1="32" y1="9" x2="32" y2="17" stroke={c.ink} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="32" cy="8" r="4.6" fill={c.cream} opacity={glow} />
      <rect x="10" y="17" width="44" height="36" rx="13" fill={c.ink} />
      <rect x="16" y="23" width="32" height="22" rx="8" fill={c.cream} />
      <g transform={closed ? "translate(0 34) scale(1 0.12) translate(0 -34)" : undefined}>
        <circle cx="25" cy="34" r="3.6" fill={c.ink} />
        <circle cx="39" cy="34" r="3.6" fill={c.ink} />
      </g>
      <circle cx="20" cy="40.5" r="2" fill={c.accent} opacity="0.7" />
      <circle cx="44" cy="40.5" r="2" fill={c.accent} opacity="0.7" />
    </svg>
  );
};

// Dot texture background (dark or light), slowly drifting.
export const DotGrid: React.FC<{ dark?: boolean; opacity?: number }> = ({ dark = true, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.4) % 22;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: dark ? c.ink : c.cream,
        backgroundImage: `radial-gradient(${dark ? "rgba(232,160,127,0.22)" : "rgba(185,83,44,0.18)"} 1.6px, transparent 1.6px)`,
        backgroundSize: "22px 22px",
        backgroundPosition: `${shift}px ${shift}px`,
        opacity,
      }}
    >
      {dark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 55% 50% at 50% 50%, rgba(185,83,44,${0.22 + 0.06 * Math.sin(frame / 20)}), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

// Spring-in helper: 0 → 1 starting at `delay` frames.
export const useIn = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 } });
};

// Big text that slams in (scale down + blur clear), like a beat hit.
export const Slam: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  italic?: boolean;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, size = 150, color = c.cream, italic = false, style }) => {
  const frame = useCurrentFrame();
  const p = useIn(delay, 12);
  const blur = interpolate(frame - delay, [0, 6], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        fontFamily: italic ? serif : sans,
        fontStyle: italic ? "italic" : "normal",
        fontWeight: italic ? 400 : 700,
        fontSize: size,
        letterSpacing: italic ? 0 : "-0.045em",
        lineHeight: 1,
        color,
        transform: `scale(${interpolate(p, [0, 1], [1.35, 1])})`,
        opacity: p,
        filter: `blur(${blur}px)`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Typewriter text with blinking caret.
export const Typed: React.FC<{ text: string; start: number; speed?: number; style?: React.CSSProperties }> = ({
  text,
  start,
  speed = 1.4,
  style,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) / speed)));
  const caret = frame % 20 < 10 || n < text.length;
  return (
    <span style={style}>
      {text.slice(0, n)}
      <span style={{ opacity: caret ? 1 : 0, color: c.accent }}>|</span>
    </span>
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = c.muted }) => (
  <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: "0.2em", textTransform: "uppercase", color }}>{children}</div>
);

export const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

// Slow camera push-in across a scene, for momentum.
export const PushIn: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [1, 1.06], { extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})` }}>{children}</div>;
};
