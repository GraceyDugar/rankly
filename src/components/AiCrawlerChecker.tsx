"use client";

import Link from "next/link";
import { useState } from "react";
import type { CrawlerUse } from "@/lib/robots";

type Crawler = { token: string; company: string; use: CrawlerUse; allowed: boolean; matchedAgent: string | null; rule: string | null };
type Result = { host: string; robots: { state: "found" | "missing" | "error"; status: number }; llmsTxt: boolean; crawlers: Crawler[] };

const USE_LABEL: Record<CrawlerUse, string> = {
  search: "Search & AI answers",
  agent: "Reads pages when asked",
  training: "Trains AI models",
};

export default function AiCrawlerChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai-crawlers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
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

  const blocked = result?.crawlers.filter((c) => !c.allowed) ?? [];
  const blockedAnswers = blocked.filter((c) => c.use !== "training");

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-card p-2 shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_40px_-20px_rgba(60,30,10,0.25)] focus-within:border-accent/50 sm:flex-row sm:items-center"
      >
        <label className="sr-only" htmlFor="site-url">Your website</label>
        <input
          id="site-url"
          className="w-full bg-transparent px-3 py-3 text-[15px] text-foreground outline-none placeholder:text-muted/70 sm:py-2"
          placeholder="yourwebsite.com"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-accent px-5 py-3 text-[15px] font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Reading robots.txt…" : "Check AI access →"}
        </button>
      </form>
      <p className="mt-2 text-xs text-muted/80">Free, no signup. We only read your public robots.txt and llms.txt.</p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-line bg-card p-6" aria-live="polite">
          <p className="font-mono text-xs text-muted">{`// ${result.host}`}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">
            {result.robots.state === "error" ? (
              <>Every AI crawler is turned away right now.</>
            ) : blocked.length === 0 ? (
              <>
                All {result.crawlers.length} AI crawlers can <span className="font-serif text-3xl font-normal italic text-accent">read your site.</span>
              </>
            ) : (
              <>
                {blocked.length} of {result.crawlers.length} AI crawlers are <span className="font-serif text-3xl font-normal italic text-accent">blocked.</span>
              </>
            )}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {result.robots.state === "error"
              ? `${result.host}/robots.txt returned a server error (${result.robots.status}). Crawlers treat that as "stay away" until it's fixed.`
              : result.robots.state === "missing"
                ? "No robots.txt found, so every crawler is allowed by default."
                : blockedAnswers.length
                  ? "Blocked search and answer crawlers can't read your pages, so those AI tools can't quote or recommend you from them."
                  : blocked.length
                    ? "Search and answer crawlers can read your site. Only AI training crawlers are blocked."
                    : "Nothing in your robots.txt stops AI from reading your homepage."}
          </p>

          <div className="mt-5 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Crawler</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Used for</th>
                  <th className="px-4 py-3">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.crawlers.map((c) => (
                  <tr key={c.token} className="align-top">
                    <td className="px-4 py-3">
                      <span className="font-medium">{c.token}</span>
                      <span className="block text-xs text-muted">{c.company}</span>
                      {/* On phones the "Used for" column folds in here, so Access stays on screen. */}
                      <span className="block text-xs text-muted sm:hidden">{USE_LABEL[c.use]}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">{USE_LABEL[c.use]}</td>
                    <td className="break-words px-4 py-3">
                      {c.allowed ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">allowed</span>
                      ) : (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">blocked</span>
                      )}
                      {c.rule && (
                        <span className="mt-1 block font-mono text-[11px] text-muted">
                          {c.matchedAgent === "*" ? "User-agent: *" : `User-agent: ${c.matchedAgent}`} · {c.rule}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-muted">
            <span className="font-medium text-foreground">llms.txt:</span>{" "}
            {result.llmsTxt ? "found ✓" : "not found. It's optional: a plain-text summary of your site for AI (see ours at rankly.world/llms.txt)."}
          </p>
          <p className="mt-2 text-xs text-muted/80">
            This reads robots.txt only. A firewall, such as Cloudflare&apos;s AI bot settings, can still block crawlers without showing up here.
          </p>

          <div className="mt-6 flex flex-col items-start gap-3 rounded-xl bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <span className="font-medium">Readable isn&apos;t the same as recommended.</span>{" "}
              <span className="text-muted">See if AI actually names you when customers ask.</span>
            </p>
            <Link href="/" className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85">
              Free AI visibility check →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
