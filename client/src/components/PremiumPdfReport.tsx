import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";
import { captureEvent } from "@/lib/posthog";
import { toast } from "sonner";
import type { FullReport } from "../../../shared/analysis-types";
import { addressSlug, formatFileDate, generatePdfReport } from "@/lib/pdf-report-generator";

export { generatePdfReport } from "@/lib/pdf-report-generator";

export async function downloadPdfReport(report: FullReport, plan?: string): Promise<void> {
  const pdf = generatePdfReport(report);
  const filename = `RSF-Report-${addressSlug(report.address)}-${formatFileDate()}.pdf`;
  pdf.save(filename);
  captureEvent("pdf_report_downloaded", {
    address: report.address,
    score: report.opportunityScore,
    plan: plan ?? "premium",
  });
}

interface PremiumPdfDownloadButtonProps {
  report: FullReport;
  unlocked?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PremiumPdfDownloadButton({
  report,
  unlocked = false,
  size = "sm",
  className,
}: PremiumPdfDownloadButtonProps) {
  const { isPremium, isLoading, plan } = usePremium();
  const [generating, setGenerating] = useState(false);

  if (!unlocked && (isLoading || !isPremium)) return null;

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await downloadPdfReport(report, plan ?? "premium");
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      className={className ?? "rounded-lg"}
      disabled={generating}
      onClick={handleDownload}
    >
      {generating ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          Generating your report...
        </>
      ) : (
        <>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download PDF Report
        </>
      )}
    </Button>
  );
}
