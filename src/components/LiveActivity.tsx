"use client";

import { useEffect, useState } from "react";

type Item = { question: string; at: string };

// Show the running total only once it's meaningful.
const MIN_TOTAL_TO_SHOW = 25;

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Real, anonymous activity from free checks: rotates one at a time.
export default function LiveActivity() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [i, setI] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/activity")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!alive || !d) return;
          setItems(d.recent ?? []);
          setTotal(d.total ?? 0);
        })
        .catch(() => {});
    load();
    const poll = setInterval(load, 45_000);
    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const item = items[i % items.length];

  return (
    <div className="mt-5 flex flex-col gap-2 text-sm text-muted" aria-live="polite">
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1.5">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span key={i} className="live-fade min-w-0 truncate">
          Someone checked <span className="text-foreground">&ldquo;{item.question}&rdquo;</span> · {ago(item.at)}
        </span>
      </div>
      {total >= MIN_TOTAL_TO_SHOW && (
        <p className="pl-1 text-xs">
          <span className="font-semibold text-foreground">{total.toLocaleString()}</span> AI visibility checks run so far
        </p>
      )}
    </div>
  );
}
