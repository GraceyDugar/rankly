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

// Same palette as the theme tokens in globals.css (SVG needs literal values).
const INK = "#16130f";
const CREAM = "#f8f5f0";
const CARD = "#fffdf9";
const LINE = "#e6dfd4";
const ACCENT = "#b9532c";
const ACCENT_SOFT = "#f3e2d7";

// Floating tiles around the robot, styled like the hero's engine tiles.
const TILES = [
  { glyph: "✦", name: "Asking AI", x: "35%", y: "0%", r: "-8deg", delay: "0s" },
  { glyph: "?", name: "Who's named", x: "58%", y: "-2%", r: "6deg", delay: "1.5s" },
  { glyph: "#2", name: "Your rank", x: "59%", y: "70%", r: "-4deg", delay: "0.8s" },
  { glyph: "3", name: "Fixes", x: "37%", y: "72%", r: "5deg", delay: "2.2s" },
];

const SPEED = 60; // user units per second along each curve

// Real, anonymous free-check questions drift in from the left, pass through
// the Rankly robot, and leave on the right as a ribbon of finished checks.
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
      {`✓ ${it.question}`}
      <tspan fillOpacity="0.6">{`  ${ago(it.at)}`}</tspan>
      <tspan fill={ACCENT_SOFT}>{"      ✦      "}</tspan>
    </tspan>
  ));

  // whiteSpace: pre keeps the wide gaps between items (SVG collapses them otherwise).
  const inFont = { fontFamily: "var(--font-instrument-serif), serif", fontStyle: "italic", fontSize: 30, style: { whiteSpace: "pre" } } as const;
  const outFont = { fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 21, fontWeight: 500, style: { whiteSpace: "pre" } } as const;

  return (
    <section
      className="relative overflow-hidden pt-8 pb-10"
      aria-label="Recent AI visibility checks"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_30%_55%_at_50%_58%,black,transparent)]"
      />

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{"// happening on rankly right now"}</p>
      </div>

      <div className="relative left-1/2 w-full min-w-[920px] max-w-[1600px] -translate-x-1/2">
        <svg viewBox="0 0 1600 300" className="block w-full" role="img" aria-label={`Recent checks: ${items.map((i) => i.question).join(", ")}`}>
          <defs>
            <path id="ribbon-in" d="M -80 215 C 180 60, 430 290, 740 150" />
            <path id="ribbon-out" d="M 860 150 C 1110 30, 1330 270, 1700 115" />
            <linearGradient id="ribbon-fade" gradientUnits="userSpaceOnUse" x1="0" x2="740" y1="0" y2="0">
              <stop offset="0" stopColor={INK} stopOpacity="0" />
              <stop offset="0.4" stopColor={INK} stopOpacity="0.4" />
              <stop offset="1" stopColor={INK} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Hidden copies, used only to measure one loop's length */}
          <text ref={inMeasure} {...inFont} opacity="0" x="0" y="-100" aria-hidden>{raw}</text>
          <text ref={outMeasure} {...outFont} opacity="0" x="0" y="-100" aria-hidden>{done}</text>

          {/* Raw questions drifting in */}
          <text {...inFont} fill="url(#ribbon-fade)">
            <textPath ref={inPath} href="#ribbon-in" startOffset="0">
              {raw}
              {raw}
            </textPath>
          </text>

          {/* Finished checks leaving on a terracotta ribbon with an ink edge, like the logo */}
          <use href="#ribbon-out" transform="translate(0 8)" fill="none" stroke={INK} strokeWidth="56" strokeLinecap="round" />
          <use href="#ribbon-out" fill="none" stroke={ACCENT} strokeWidth="56" strokeLinecap="round" />
          <text {...outFont} fill={CREAM} dominantBaseline="central">
            <textPath ref={outPath} href="#ribbon-out" startOffset="0">
              {done}
              {done}
            </textPath>
          </text>

          {/* The Rankly robot, listening */}
          <g transform="translate(800 150)">
            <rect x="-100" y="-44" width="200" height="88" rx="44" fill={CARD} stroke={LINE} strokeWidth="2" />
            <g transform="translate(-80 -24) scale(0.75)">
              <rect width="64" height="64" rx="15" fill={ACCENT} />
              <line x1="32" y1="9" x2="32" y2="17" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="32" cy="8" r="4.6" fill={CREAM} />
              <rect x="10" y="17" width="44" height="36" rx="13" fill={INK} />
              <rect x="16" y="23" width="32" height="22" rx="8" fill={CREAM} />
              <circle className="ribbon-eye" cx="25" cy="34" r="3.6" fill={INK} />
              <circle className="ribbon-eye" cx="39" cy="34" r="3.6" fill={INK} />
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
                fill={i % 2 ? ACCENT : INK}
                style={{ animationDelay: `${i * 0.11}s` }}
              />
            ))}
          </g>
        </svg>

        {TILES.map((t) => (
          <div
            key={t.name}
            aria-hidden
            className="float pointer-events-none absolute z-10 hidden flex-col items-center gap-1 rounded-2xl border border-line bg-card/90 px-4 py-3 shadow-[0_10px_30px_-15px_rgba(60,30,10,0.35)] backdrop-blur lg:flex"
            style={{ left: t.x, top: t.y, animationDelay: t.delay, ["--r" as string]: t.r }}
          >
            <span className="font-serif text-2xl italic text-accent">{t.glyph}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
