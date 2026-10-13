"use client";

import { useActionState } from "react";
import { saveBrand, type WelcomeState } from "./actions";

export default function WelcomeForm({ subscriptionId }: { subscriptionId: string }) {
  const [state, action, pending] = useActionState<WelcomeState, FormData>(saveBrand, {});
  const input = "w-full rounded-xl border border-line bg-card px-4 py-3 text-[15px] outline-none focus:border-accent/60";

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-2xl font-semibold tracking-tight">You&apos;re all set ✓</h2>
        <p className="mt-2 text-muted">
          Your first AI visibility report is being prepared and will arrive by email in a few minutes. After that, every Monday.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="subscription_id" value={subscriptionId} />
      <input name="brand" required placeholder="Your brand name" className={input} />
      <input name="website" placeholder="Website (optional)" className={input} />
      <textarea
        name="questions"
        required
        rows={6}
        placeholder={"5 questions your customers ask AI — one per line\nbest CRM for freelancers\nbest CRM for small agencies\n…"}
        className={input}
      />
      <button disabled={pending} className="w-full rounded-xl bg-accent py-3.5 font-medium text-white hover:brightness-110 disabled:opacity-60">
        {pending ? "Saving…" : "Start tracking"}
      </button>
      {state.error && <p className={`text-sm ${state.pending ? "text-muted" : "text-red-700"}`}>{state.error}</p>}
    </form>
  );
}
