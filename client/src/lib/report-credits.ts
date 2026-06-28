const REPORT_CREDITS_USED_KEY = "rsf_report_credits_used";
export const MAX_REPORT_CREDITS = 3;

export function getReportsRemaining(): number {
  if (typeof window === "undefined") return MAX_REPORT_CREDITS;
  const used = parseInt(localStorage.getItem(REPORT_CREDITS_USED_KEY) ?? "0", 10);
  return Math.max(0, MAX_REPORT_CREDITS - used);
}

export function consumeReportCredit(): number {
  const remaining = getReportsRemaining();
  if (remaining <= 0) return 0;
  const used = parseInt(localStorage.getItem(REPORT_CREDITS_USED_KEY) ?? "0", 10);
  localStorage.setItem(REPORT_CREDITS_USED_KEY, String(used + 1));
  return getReportsRemaining();
}

export function hasReportCredits(): boolean {
  return getReportsRemaining() > 0;
}
