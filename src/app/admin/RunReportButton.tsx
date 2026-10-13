"use client";

import { useFormStatus } from "react-dom";

export default function RunReportButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-background disabled:opacity-60">
      {pending ? "Running… (~1 min)" : "Run report now"}
    </button>
  );
}
