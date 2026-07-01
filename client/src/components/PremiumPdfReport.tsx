import type { FullReport } from "@shared/analysis-types";

interface PremiumPdfDownloadButtonProps {
  report: FullReport;
  unlocked?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
}

/** Hidden until PDF export is enabled on this deployment. */
export function PremiumPdfDownloadButton(_props: PremiumPdfDownloadButtonProps) {
  return null;
}
