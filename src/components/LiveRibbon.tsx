"use client";

import { useEffect, useRef, useState } from "react";

type Item = { question: string; at: string };

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// Pop colours, Wispr-style pastels on a light background.
const POP = ["#c9b8ff", "#8be3b8", "#ffd84d", "#ffa8c5", "#e8a07f"];

// Little pastel chips that float around the robot.
const CHIPS = [
  { text: "Asking AI…", bg: "#ece4ff", fg: "#4b2fa3", x: "37%", y: "4%", delay: "0s" },
  { text: "Who gets named?", bg: "#d9f6e7", fg: "#0b6b48", x: "55%", y: "0%", delay: "1.4s" },
  { text: "#2 on the list", bg: "#fff1b8", fg: "#7a5a00", x: "57%", y: "80%", delay: "0.7s" },
  { text: "3 fixes inside", bg: "#ffe0ea", fg: "#9b1d43", x: "35%", y: "84%", delay: "2.1s" },
];

const SPEED = 60; // user units per second along each curve

// Real, anonymous free-check questions drift in from the left as loose
// handwriting, pass through the Rankly robot, and leave on the right as a
// bold ribbon of finished checks.
export default function LiveRibbon() {
  const [items, setItems] = useState<Item[]>([]);
  const inPath = useRef<SVGTextPathElement>(null);
  const outPath = useRef<SVGTextPathElement>(null);
  const inMeasure = useRef<SVGTextElement>(null);
  const outMeasure = useRef<SVGTextElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/activity")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => alive && d && setItems(d.recent ?? []))
        .catch(() => {});
    load();
    const poll = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, []);

  // Each curve holds two copies of its sentence, so wrapping the offset at one
  // copy's length loops seamlessly.
  useEffect(() => {
    if (items.length < 3) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inLen = 0;
    let outLen = 0;
    const measure = () => {
      inLen = inMeasure.current?.getComputedTextLength() ?? 0;
      outLen = outMeasure.current?.getComputedTextLength() ?? 0;
    };
    measure();
    document.fonts?.ready.then(measure);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const tick = (now: number) => {
      if (!paused.current) t += (now - last) / 1000;
      last = now;
      if (inLen > 0) inPath.current?.setAttribute("startOffset", String(((t * SPEED) % inLen) - inLen));
      if (outLen > 0) outPath.current?.setAttribute("startOffset", String(((t * SPEED) % outLen) - outLen));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  if (items.length < 3) return null;

  const raw = items.map((i) => `“${i.question.toLowerCase()}”   ·   `).join("");
  const done = items.map((it, i) => (
    <tspan key={i}>
      <tspan fill={POP[i % POP.length]}>✓ </tspan>
      <tspan>{it.question}</tspan>
      <tspan fill="#f8f5f0" fillOpacity="0.45">{`  ${ago(it.at)}`}</tspan>
      <tspan fill={POP[(i + 2) % POP.length]}>{"      ✦      "}</tspan>
    </tspan>
  ));

  // whiteSpace: pre keeps the wide gaps between items (SVG collapses them otherwise).
  const inFont = { fontFamily: "var(--font-instrument-serif), serif", fontStyle: "italic", fontSize: 30, style: { whiteSpace: "pre" } } as const;
  const outFont = { fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 21, fontWeight: 500, style: { whiteSpace: "pre" } } as const;

  return (
    <section
      className="relative overflow-hidden border-y border-line bg-[#fffaeb] pt-10 pb-8"
      aria-label="Recent AI visibility checks"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Happening on Rankly right now</p>
      </div>

      <div className="relative left-1/2 w-full min-w-[920px] max-w-[1600px] -translate-x-1/2">
        <svg viewBox="0 0 1600 300" className="block w-full" role="img" aria-label={`Recent checks: ${items.map((i) => i.question).join(", ")}`}>
          <defs>
            <path id="ribbon-in" d="M -80 215 C 180 60, 430 290, 740 150" />
            <path id="ribbon-out" d="M 860 150 C 1110 30, 1330 270, 1700 115" />
            <linearGradient id="ribbon-fade" gradientUnits="userSpaceOnUse" x1="0" x2="740" y1="0" y2="0">
              <stop offset="0" stopColor="#16130f" stopOpacity="0" />
              <stop offset="0.4" stopColor="#16130f" stopOpacity="0.4" />
              <stop offset="1" stopColor="#16130f" stopOpacity="0.6" />
            </linearGradient>
            <radialGradient id="ribbon-glow">
              <stop offset="0" stopColor="#c9b8ff" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="#ffd84d" stopOpacity="0.18" />
              <stop offset="1" stopColor="#ffd84d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hidden copies, used only to measure one loop's length */}
          <text ref={inMeasure} {...inFont} opacity="0" x="0" y="-100" aria-hidden>{raw}</text>
          <text ref={outMeasure} {...outFont} opacity="0" x="0" y="-100" aria-hidden>{done}</text>

          <circle cx="800" cy="150" r="190" fill="url(#ribbon-glow)" />

          {/* Raw questions drifting in */}
          <text {...inFont} fill="url(#ribbon-fade)">
            <textPath ref={inPath} href="#ribbon-in" startOffset="0">
              {raw}
              {raw}
            </textPath>
          </text>

          {/* Finished checks leaving on a dark ribbon */}
          <use href="#ribbon-out" transform="translate(0 9)" fill="none" stroke="#c9b8ff" strokeWidth="56" strokeLinecap="round" />
          <use href="#ribbon-out" fill="none" stroke="#16130f" strokeWidth="56" strokeLinecap="round" />
          <text {...outFont} fill="#f8f5f0" dominantBaseline="central">
            <textPath ref={outPath} href="#ribbon-out" startOffset="0">
              {done}
              {done}
            </textPath>
          </text>

          {/* The Rankly robot, listening */}
          <g transform="translate(800 150)">
            <rect x="-100" y="-44" width="200" height="88" rx="44" fill="#ffffff" stroke="#16130f" strokeOpacity="0.08" strokeWidth="2" />
            <g transform="translate(-80 -24) scale(0.75)">
              <rect width="64" height="64" rx="15" fill="#b9532c" />
              <line x1="32" y1="9" x2="32" y2="17" stroke="#16130f" strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="32" cy="8" r="4.6" fill="#f8f5f0" />
              <rect x="10" y="17" width="44" height="36" rx="13" fill="#16130f" />
              <rect x="16" y="23" width="32" height="22" rx="8" fill="#f8f5f0" />
              <circle className="ribbon-eye" cx="25" cy="34" r="3.6" fill="#16130f" />
              <circle className="ribbon-eye" cx="39" cy="34" r="3.6" fill="#16130f" />
            </g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect
                key={i}
                className="ribbon-bar"
                x={-16 + i * 13}
                y={-17}
                width="6"
                height="34"
                rx="3"
                fill={i % 2 ? "#16130f" : POP[(i / 2) % POP.length]}
                style={{ animationDelay: `${i * 0.11}s` }}
              />
            ))}
          </g>
        </svg>

        {CHIPS.map((c) => (
          <span
            key={c.text}
            aria-hidden
            className="ribbon-chip pointer-events-none absolute hidden whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium shadow-[0_10px_24px_-12px_rgba(40,20,0,0.35)] sm:inline-block"
            style={{ left: c.x, top: c.y, background: c.bg, color: c.fg, animationDelay: c.delay }}
          >
            {c.text}
          </span>
        ))}
      </div>
    </section>
  );
}
