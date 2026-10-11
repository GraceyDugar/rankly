"use client";

import { useActionState } from "react";
import { sendLoginLink, type LoginState } from "../actions";

export default function LoginForm({ linkError }: { linkError: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendLoginLink, {});

  if (state.sent) {
    return (
      <p className="rounded-xl border border-line bg-card p-4 text-sm">
        If that email has admin access, a login link is on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      {linkError && <p className="text-sm text-red-700">That link expired or was already used. Request a new one.</p>}
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="w-full rounded-xl border border-line bg-card px-4 py-3 outline-none focus:border-accent/60"
      />
      <button
        disabled={pending}
        className="w-full rounded-xl bg-foreground py-3 font-medium text-background hover:bg-foreground/85 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a login link"}
      </button>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
