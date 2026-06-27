import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const LEAD_EMAIL_KEY = "rsf_lead_email";

export function usePremium() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(localStorage.getItem(LEAD_EMAIL_KEY) ?? "");
  }, []);

  const { data, isLoading } = trpc.subscription.getStatus.useQuery(
    { email },
    { enabled: !!email, staleTime: 5 * 60 * 1000 }
  );

  return {
    isPremium: data?.isPremium ?? false,
    plan: data?.plan ?? "free",
    isLoading: !!email && isLoading,
    email,
  };
}

export { LEAD_EMAIL_KEY };
