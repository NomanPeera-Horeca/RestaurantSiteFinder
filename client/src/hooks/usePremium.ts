/** Premium subscription status — stubbed when subscription API is unavailable. */

const LEAD_EMAIL_KEY = "rsf_lead_email";

export function usePremium() {
  return {
    isPremium: false,
    plan: "free" as const,
    isLoading: false,
    email: typeof localStorage !== "undefined" ? localStorage.getItem(LEAD_EMAIL_KEY) ?? "" : "",
  };
}

export { LEAD_EMAIL_KEY };
