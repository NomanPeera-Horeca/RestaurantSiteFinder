import type { FullReport } from "../../../shared/analysis-types";

const PENDING_REPORT_KEY = "rsf_pending_report";

export function savePendingReport(report: FullReport): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_REPORT_KEY, JSON.stringify(report));
  } catch (e) {
    console.warn("[RSF] Could not cache report for PDF checkout", e);
  }
}

export function loadPendingReport(): FullReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_REPORT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FullReport;
  } catch {
    return null;
  }
}

export function clearPendingReport(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_REPORT_KEY);
}
