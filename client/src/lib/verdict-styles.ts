/** Score and badge styling tied to GO / CAUTION / NO-GO, not raw numeric score. */

export type Verdict = "GO" | "CAUTION" | "NO-GO" | string;

export function verdictScoreClass(rec: Verdict): string {
  if (rec === "GO") return "text-green-700";
  if (rec === "NO-GO") return "text-red-700";
  return "text-amber-700";
}

export function verdictBorderClass(rec: Verdict): string {
  if (rec === "GO") return "border-l-green-600";
  if (rec === "NO-GO") return "border-l-red-600";
  return "border-l-amber-500";
}

export function verdictBadgeClass(rec: Verdict): string {
  if (rec === "GO") return "bg-green-100 text-green-800 border-green-200";
  if (rec === "NO-GO") return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

export function verdictMomentTitle(rec: Verdict): string {
  if (rec === "GO") return "Our model predicts GO for this address.";
  if (rec === "CAUTION") return "Our model predicts proceed with caution.";
  return "Our model predicts this is a tough fit.";
}

export function closureTitle(rec: Verdict): string {
  if (rec === "GO") return "Your investor will ask for proof. Here it is.";
  if (rec === "CAUTION") return "Show your partner why to proceed carefully";
  return "Save this analysis before you walk away";
}

export const MMF_TOOLTIP =
  "Menu-Market Fit scores how well this concept's menu matches local demand based on competitor reviews, cuisine gaps, and dining patterns in your trade area.";
