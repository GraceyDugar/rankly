"use client";

import { useState, useSyncExternalStore } from "react";
import { site } from "@/lib/site";

const noop = () => () => {};
function trialEndDate() {
  return new Date(Date.now() + site.trialDays * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Sticky bottom bar on /start: email + "Pay $0 today" → Dodo checkout.
export default function StartTrial() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Always the visitor's own date (the page itself is pre-built).
  const freeUntil = useSyncExternalStore(noop, trialEndDate, () => "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Couldn't start checkout. Please try again.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center">
        <p className="text-sm text-muted md:flex-1">
          {freeUntil ? (
            <>
              Free until <span className="font-semibold text-foreground">{freeUntil}</span>. Cancel anytime.
            </>
          ) : (
            <>Free for {site.trialDays} days. Cancel anytime.</>
          )}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email (reports go here)"
            className="w-full rounded-full border border-line bg-background px-5 py-3 text-[15px] outline-none focus:border-accent/60 sm:w-72"
          />
          <button
            disabled={loading}
            className="shrink-0 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Opening secure checkout…" : "Pay $0 today · Start free trial"}
          </button>
        </div>
        {error && <p className="text-sm text-red-700 md:basis-full">{error}</p>}
      </form>
    </div>
  );
}
