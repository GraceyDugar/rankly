"use client";

import { useEffect, useState } from "react";

type Item = { question: string; at: string };

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// Bold "live" band: real, anonymous free-check questions scrolling like a
// ticker tape. Hidden until there's enough activity to look alive.
export default function LiveMarquee() {
  const [items, setItems] = useState<Item[]>([]);

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

  if (items.length < 3) return null;
  // Two copies side by side so the loop is seamless.
  const loop = [...items, ...items];

  return (
    <section className="border-y border-foreground bg-foreground py-8 text-background" aria-label="Recent AI visibility checks">
      <div className="mx-auto mb-5 flex max-w-6xl items-center gap-3 px-6">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/70">Happening on Rankly right now</p>
      </div>
      <div className="marquee-mask overflow-hidden">
        <ul className="marquee-track flex w-max gap-4">
          {loop.map((it, i) => (
            <li
              key={i}
              aria-hidden={i >= items.length}
              className="flex shrink-0 items-center gap-3 rounded-full border border-background/15 bg-background/5 px-5 py-2.5"
            >
              <span className="text-[#e8a07f]">✦</span>
              <span className="text-[15px]">
                Someone checked <span className="font-serif text-lg italic text-[#e8a07f]">&ldquo;{it.question}&rdquo;</span>
              </span>
              <span className="font-mono text-xs text-background/50">{ago(it.at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
