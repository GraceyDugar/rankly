"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { CtaButton } from "./EarlyAccess";
import FullReportForm from "./FullReportForm";

// Rotating status words while the scan runs, so the wait feels alive.
const VERBS = [
  "Asking AI",
  "Pondering",
  "Triangulating",
  "Cross-referencing",
  "Reading between the lines",
  "Tallying recommendations",
  "Sizing up competitors",
  "Consulting the oracle",
  "Untangling answers",
  "Ranking the shortlist",
  "Double-checking",
  "Almost there",
];

type Result = {
  keyword: string;
  mentioned: boolean;
  position: number | null;
  competitors: string[];
  related: { name: string; position: number } | null;
  answer: string;
  searched: boolean;
};

export default function FreeScan() {
  const [brand, setBrand] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [scannedBrand, setScannedBrand] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setElapsed((s) => s + 0.5), 500);
    return () => clearInterval(timer);
  }, [loading]);

  // Advance a word every ~2.5s and hold on the last one.
  const verb = VERBS[Math.min(Math.floor(elapsed / 2.5), VERBS.length - 1)];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setElapsed(0);
    setError("");
    setResult(null);
    setShowAnswer(false);
    try {
      const send = () =>
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand, keyword }),
        });
      // AI providers are occasionally overloaded; one quiet retry fixes most of it.
      let res = await send();
      if (res.status >= 500) res = await send();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "AI is busy right now. Please try again in a minute.");
      setScannedBrand(brand);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Couldn't reach the server. Check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full bg-transparent text-[15px] text-foreground placeholder:text-muted/70 outline-none";

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-medium text-accent">Free check · ~30 seconds</p>
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_40px_-20px_rgba(60,30,10,0.25)] focus-within:border-accent/50"
      >
        <label className="sr-only" htmlFor="brand">Your brand</label>
        <input
          id="brand"
          className={`${field} px-5 py-4`}
          placeholder="Your brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />
        <div className="mx-5 border-t border-line" />
        <div className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="keyword">A question your customers ask</label>
          <input
            id="keyword"
            className={`${field} px-3 py-3 sm:py-2`}
            placeholder="e.g. best CRM for freelancers"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-accent px-5 py-3 text-[15px] font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? `${verb}…` : "Run free check →"}
          </button>
        </div>
      </form>
      {loading && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted" aria-live="polite">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          {verb}…
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <p className="font-mono text-xs text-muted">{`// result for “${result.keyword}”`}</p>
          {result.mentioned ? (
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              AI recommends <span className="font-serif text-3xl font-normal italic text-accent">{scannedBrand}</span>
              {result.position ? ` — #${result.position} on the list.` : "."}
            </p>
          ) : (
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              AI doesn&apos;t mention <span className="font-serif text-3xl font-normal italic text-accent">{scannedBrand}</span>.
            </p>
          )}

          {result.related && (
            <p className="mt-3 rounded-xl bg-accent-soft/60 px-4 py-3 text-sm">
              It does name a related name: <span className="font-medium">{result.related.name}</span> (#{result.related.position}).
              AI may be mixing you up with it.
            </p>
          )}

          {result.competitors.length > 0 && (
            <>
              <p className="mt-5 text-sm font-medium text-muted">
                {result.mentioned ? "Also recommended:" : "It recommended these instead:"}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.competitors.map((c) => (
                  <li key={c} className="rounded-full border border-line bg-background px-3 py-1 text-sm">
                    {c}
                  </li>
                ))}
              </ul>
            </>
          )}

          <button onClick={() => setShowAnswer((s) => !s)} className="mt-5 text-sm text-muted underline underline-offset-4">
            {showAnswer ? "Hide" : "Read"} the full AI answer
          </button>
          {showAnswer && (
            <p className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-background p-4 text-sm leading-relaxed text-muted">
              {result.answer}
            </p>
          )}

          <FullReportForm brand={scannedBrand} firstQuestion={result.keyword} />

          <CtaButton className="mt-3 w-full text-center text-sm text-muted underline underline-offset-4 hover:text-foreground">
            {site.paymentsEnabled
              ? `Or track it every Monday · $${site.price}/month →`
              : "Or join early access for weekly tracking →"}
          </CtaButton>
        </div>
      )}
    </div>
  );
}
