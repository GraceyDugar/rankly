"use client";

import { useState } from "react";

// After a free check: get a full 5-question report by email, free, once.
export default function FullReportForm({ brand, firstQuestion }: { brand: string; firstQuestion: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [questions, setQuestions] = useState(firstQuestion);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/free-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, brand, website, questions: questions.split("\n") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-background placeholder:text-background/40 outline-none focus:border-accent";

  if (done) {
    return (
      <div className="mt-6 rounded-xl bg-foreground p-5 text-background">
        <p className="font-medium">Your full report is on its way ✓</p>
        <p className="mt-1 text-sm opacity-70">It lands in your inbox in about 5 minutes. Check Promotions or Spam if you don&apos;t see it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-xl bg-foreground p-5 text-background">
      <div>
        <p className="font-medium">Get your full AI visibility report, free</p>
        <p className="mt-1 text-sm opacity-70">Up to 5 questions · your score · who beats you · 3 fixes. Emailed in ~5 minutes.</p>
      </div>
      <textarea
        className={`${input} min-h-[120px]`}
        value={questions}
        onChange={(e) => setQuestions(e.target.value)}
        placeholder={"Up to 5 questions your customers ask AI, one per line"}
        required
      />
      <input className={input} placeholder="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className={input} type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button
          disabled={loading}
          className="shrink-0 rounded-xl bg-accent px-5 py-3 text-[15px] font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Email my report →"}
        </button>
      </div>
      <p className="text-xs opacity-50">One free report per email. Add more questions on new lines.</p>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </form>
  );
}
