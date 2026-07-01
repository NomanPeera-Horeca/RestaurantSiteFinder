import type { ReactNode } from "react";

/** Pass-through when subscription checkout is not configured. */
export function PremiumGate({ children }: { feature?: string; children: ReactNode }) {
  return <>{children}</>;
}
