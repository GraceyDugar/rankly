"use client";

import { useActionState } from "react";
import { addCustomer, type AdminState } from "./actions";

export default function AddCustomerForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(addCustomer, {});
  const input = "w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent/60";
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2">
      <input name="email" type="email" required placeholder="Customer email" className={input} />
      <input name="brand" required placeholder="Brand name" className={input} />
      <input name="website" placeholder="Website (optional)" className={`${input} sm:col-span-2`} />
      <textarea
        name="questions"
        required
        rows={5}
        placeholder={"Up to 5 questions, one per line\nbest CRM for freelancers\n…"}
        className={`${input} sm:col-span-2`}
      />
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-60">
          {pending ? "Adding…" : "Add customer (active)"}
        </button>
        {state.ok && <span className="text-sm text-emerald-700">{state.ok}</span>}
        {state.error && <span className="text-sm text-red-700">{state.error}</span>}
      </div>
    </form>
  );
}
