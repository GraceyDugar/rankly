"use client";

import { createContext, useContext } from "react";

// Whether checkout is live, decided on the server from the runtime
// NEXT_PUBLIC_PAYMENTS_ENABLED setting (so it doesn't need a rebuild).
const PaymentsContext = createContext(false);

export function PaymentsProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  return <PaymentsContext value={enabled}>{children}</PaymentsContext>;
}

export function usePaymentsEnabled() {
  return useContext(PaymentsContext);
}
