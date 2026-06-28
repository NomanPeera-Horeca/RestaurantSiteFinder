import { isAdminEmail } from "../../../shared/admin";

const REPORT_CREDITS_USED_KEY = "rsf_report_credits_used";
const LEAD_EMAIL_KEY = "rsf_lead_email";

export const MAX_REPORT_CREDITS = 3;

function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LEAD_EMAIL_KEY);
}

export function isReportAdmin(email?: string | null): boolean {
  return isAdminEmail(email ?? getStoredEmail());
}

export function getReportsRemaining(email?: string | null): number {
  if (isReportAdmin(email)) return MAX_REPORT_CREDITS;
  if (typeof window === "undefined") return MAX_REPORT_CREDITS;
  const used = parseInt(localStorage.getItem(REPORT_CREDITS_USED_KEY) ?? "0", 10);
  return Math.max(0, MAX_REPORT_CREDITS - used);
}

export function consumeReportCredit(email?: string | null): number {
  if (isReportAdmin(email)) return MAX_REPORT_CREDITS;
  const remaining = getReportsRemaining();
  if (remaining <= 0) return 0;
  const used = parseInt(localStorage.getItem(REPORT_CREDITS_USED_KEY) ?? "0", 10);
  localStorage.setItem(REPORT_CREDITS_USED_KEY, String(used + 1));
  return getReportsRemaining();
}

export function hasReportCredits(email?: string | null): boolean {
  if (isReportAdmin(email)) return true;
  return getReportsRemaining() > 0;
}
