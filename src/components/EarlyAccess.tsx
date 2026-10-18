"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { usePaymentsEnabled } from "./PaymentsContext";

const DIALOG_ID = "early-access";

// Every "$9" button on the site. Opens the dialog, which shows checkout
// when payments are enabled and the early-access form otherwise.
export function CtaButton({ className, children }: { className: string; children: React.ReactNode }) {
  const paymentsEnabled = usePaymentsEnabled();
  if (paymentsEnabled) {
    return (
      <a href="/start" className={className}>
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={() => (document.getElementById(DIALOG_ID) as HTMLDialogElement | null)?.showModal()}
    >
      {children}
    </button>
  );
}

export function EarlyAccessDialog() {
  const paymentsEnabled = usePaymentsEnabled();
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(paymentsEnabled ? "/api/checkout" : "/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, brand }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      if (paymentsEnabled && data.url) {
        window.location.href = data.url; // Dodo's secure checkout
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-xl border border-line bg-background px-4 py-3 text-[15px] outline-none focus:border-accent/60";

  return (
    <dialog
      id={DIALOG_ID}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-line bg-card p-0 text-foreground shadow-2xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
    >
      <div className="p-7">
        <div className="flex items-start justify-between">
          <p className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">{site.trialDays} days free · then ${site.price}/mo</p>
          <form method="dialog">
            <button aria-label="Close" className="text-xl leading-none text-muted hover:text-foreground">×</button>
          </form>
        </div>

        {done ? (
          <div className="py-6">
            <h2 className="text-2xl font-semibold tracking-tight">You&apos;re on the list ✓</h2>
            <p className="mt-2 text-muted">
              We&apos;ll email you the moment {site.name} opens. Your founding price of ${site.price}/month is locked in.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {paymentsEnabled ? `Start your ${site.trialDays}-day free trial` : "Get early access"}
            </h2>
            <p className="text-muted">
              {paymentsEnabled
                ? `First report today. $${site.price}/month after ${site.trialDays} days — cancel anytime before and pay nothing.`
                : `Join the list and lock in $${site.price}/month forever. No payment today.`}
            </p>
            <input className={input} type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {!paymentsEnabled && (
              <input className={input} placeholder="Your brand (optional)" value={brand} onChange={(e) => setBrand(e.target.value)} />
            )}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (paymentsEnabled ? "Opening checkout…" : "Joining…") : paymentsEnabled ? "Start trial for $0 →" : "Join early access"}
            </button>
            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>
        )}
      </div>
    </dialog>
  );
}
