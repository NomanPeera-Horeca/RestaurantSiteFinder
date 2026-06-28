import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { captureEvent } from "@/lib/posthog";
import { usePremium, LEAD_EMAIL_KEY } from "@/hooks/usePremium";
import type { FullReport } from "../../../../shared/analysis-types";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { PremiumPdfDownloadButton } from "@/components/PremiumPdfReport";

interface PdfPaywallSectionProps {
  report: FullReport;
}

function buildExecutiveSummary(report: FullReport): string {
  const rec = report.conceptFit?.recommendation ?? report.recommendation;
  const score = report.conceptFit?.fitScore ?? report.opportunityScore;
  const direct = report.directCompetitors?.length ?? report.conceptFit?.directCompetitorCount ?? 0;
  const avg =
    report.competitors.length > 0
      ? report.competitors.reduce((s, c) => s + c.rating, 0) / report.competitors.length
      : 0;

  return `Recommendation: ${rec} for this address. Opportunity score ${score}/10. ${direct} direct competitor(s) nearby with an average market rating of ${avg.toFixed(1)}. Primary gaps and risk factors are detailed in the full PDF, formatted for partners, landlords, and lenders.`;
}

export function PdfPaywallSection({ report }: PdfPaywallSectionProps) {
  const { isPremium, email } = usePremium();
  const checkout = trpc.subscription.createCheckout.useMutation();

  const startCheckout = async () => {
    const checkoutEmail = email || localStorage.getItem(LEAD_EMAIL_KEY) || "";
    if (!checkoutEmail) {
      toast.error("Enter your email above to continue.");
      return;
    }
    captureEvent("upgrade_cta_clicked", { plan: "lifetime", feature: "pdf_download" });
    try {
      const result = await checkout.mutateAsync({ email: checkoutEmail, plan: "lifetime" });
      captureEvent("checkout_session_created", { plan: "lifetime" });
      window.location.href = result.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
    }
  };

  if (isPremium) {
    return (
      <div className="rounded-2xl border border-primary/30 overflow-hidden">
        <div className="bg-[oklch(0.22_0.04_260)] text-white px-6 py-5">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your PDF is unlocked
          </h3>
          <p className="text-sm text-white/75 mt-1">Download and share with partners or your bank.</p>
        </div>
        <div className="p-6 bg-card flex justify-center">
          <PremiumPdfDownloadButton report={report} />
        </div>
      </div>
    );
  }

  const summary = buildExecutiveSummary(report);

  return (
    <div className="rounded-2xl border-2 border-primary/25 overflow-hidden">
      <div className="bg-[oklch(0.22_0.04_260)] text-white px-6 py-5">
        <h3 className="text-lg font-bold">Executive Summary PDF</h3>
        <p className="text-sm text-white/75 mt-1">Share with partners, landlords, or your bank. Professional format.</p>
      </div>

      <div className="p-6 bg-card border-b border-border/50">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Preview · Executive Summary</p>
        <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Bank-ready format", "Partner pitch", "Landlord negotiation"].map((tag) => (
            <span key={tag} className="text-xs font-semibold rounded-md bg-primary/10 text-primary px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative bg-muted/40 min-h-[200px]">
        <div className="absolute inset-0 p-6 filter blur-sm opacity-40 pointer-events-none select-none space-y-3">
          <div className="h-3 bg-muted rounded w-11/12" />
          <div className="h-3 bg-muted rounded w-4/5" />
          <div className="h-3 bg-muted rounded w-10/12" />
          <div className="h-3 bg-muted rounded w-3/5" />
        </div>
        <div className="relative flex items-center justify-center p-6 min-h-[200px]">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full text-center shadow-lg">
            <h4 className="text-lg font-bold mb-2">Download and save your PDF</h4>
            <p className="text-3xl font-bold text-primary mb-1">$49</p>
            <p className="text-sm text-muted-foreground mb-4">one-time · lifetime access · up to 3 location reports</p>
            <ul className="text-left text-sm text-muted-foreground space-y-1.5 mb-5">
              <li>✓ Full PDF report download</li>
              <li>✓ Saved to your account forever</li>
              <li>✓ Email copy sent automatically</li>
            </ul>
            <Button
              className="w-full h-12 rounded-xl font-semibold"
              disabled={checkout.isPending}
              onClick={startCheckout}
            >
              {checkout.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Pay $49 and unlock PDF"
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground mt-3">Secure checkout powered by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
