import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { captureEvent } from "@/lib/posthog";
import { trpc } from "@/lib/trpc";
import { LEAD_EMAIL_KEY } from "@/hooks/usePremium";
import {
  clearPendingReport,
  loadPendingReport,
} from "@/lib/pending-report-storage";
import { PremiumPdfDownloadButton, downloadPdfReport } from "@/components/PremiumPdfReport";
import type { FullReport } from "../../../shared/analysis-types";
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";

export default function PremiumSuccess() {
  const [phase, setPhase] = useState<"loading" | "ready" | "no_report" | "error">("loading");
  const [report, setReport] = useState<FullReport | null>(null);
  const [downloading, setDownloading] = useState(false);
  const autoDownloaded = useRef(false);

  const confirmCheckout = trpc.subscription.confirmCheckout.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session");
    const plan = params.get("plan") ?? "lifetime";

    if (!sessionId) {
      setPhase("error");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await confirmCheckout.mutateAsync({ sessionId });
        if (cancelled) return;

        if (result.email) {
          localStorage.setItem(LEAD_EMAIL_KEY, result.email);
        }

        await utils.subscription.getStatus.invalidate({ email: result.email });

        captureEvent("premium_upgrade_completed", { plan });

        const pending = loadPendingReport();
        setReport(pending);
        setPhase(pending ? "ready" : "no_report");
        document.title = "Payment confirmed | Restaurant Site Finder";
      } catch (err) {
        if (cancelled) return;
        console.error("[PremiumSuccess]", err);
        setPhase("error");
        toast.error(err instanceof Error ? err.message : "Could not confirm payment");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "ready" || !report || autoDownloaded.current) return;
    autoDownloaded.current = true;

    (async () => {
      setDownloading(true);
      try {
        await downloadPdfReport(report, "premium_lifetime");
        clearPendingReport();
        toast.success("Your PDF report downloaded successfully.");
      } catch {
        toast.error("Payment confirmed, but PDF download failed. Use the button below to retry.");
      } finally {
        setDownloading(false);
      }
    })();
  }, [phase, report]);

  const handleManualDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      await downloadPdfReport(report, "premium_lifetime");
      clearPendingReport();
      toast.success("PDF downloaded.");
    } catch {
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-28 pb-20">
        <div className="container max-w-lg text-center">
          {phase === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Confirming your payment...</h1>
              <p className="text-muted-foreground">Preparing your PDF report.</p>
            </>
          )}

          {phase === "error" && (
            <>
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">We could not confirm payment</h1>
              <p className="text-muted-foreground mb-6">
                If you were charged, contact support with your receipt. You can also return to your report and try again.
              </p>
              <Link href="/">
                <Button size="lg" className="rounded-xl">
                  Back to home
                </Button>
              </Link>
            </>
          )}

          {(phase === "ready" || phase === "no_report") && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">Payment confirmed</h1>
              <p className="text-muted-foreground mb-6">
                {phase === "ready"
                  ? downloading
                    ? "Generating your full location analysis PDF..."
                    : "Your lifetime access is active. Your PDF should be in your Downloads folder."
                  : "Your lifetime access is active. Open your analysis again to download the PDF for that location."}
              </p>

              {report && (
                <div className="rounded-xl border border-border bg-card p-5 text-left mb-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Location Analysis PDF</p>
                      <p className="text-sm text-muted-foreground mt-0.5 break-words">{report.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score {report.conceptFit?.fitScore ?? report.opportunityScore}/10 ·{" "}
                        {report.conceptFit?.recommendation ?? report.recommendation}
                      </p>
                    </div>
                  </div>
                  <PremiumPdfDownloadButton
                    report={report}
                    unlocked
                    size="lg"
                    className="w-full h-12 rounded-xl font-semibold"
                  />
                  {!downloading && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full rounded-xl"
                      onClick={handleManualDownload}
                    >
                      Download PDF again
                    </Button>
                  )}
                </div>
              )}

              <Link href="/">
                <Button size="lg" className="rounded-xl font-semibold h-12 px-8">
                  Analyze another location
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
