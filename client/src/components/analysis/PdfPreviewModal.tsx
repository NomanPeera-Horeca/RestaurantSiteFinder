import { useState } from "react";
import type { FullReport } from "../../../../shared/analysis-types";
import { serviceModelLabel } from "../../../../shared/concept-options";
import { formatCompetitorAreaSubtitle } from "../../../../shared/search-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { captureEvent } from "@/lib/posthog";
import { usePremium, LEAD_EMAIL_KEY } from "@/hooks/usePremium";
import { verdictBadgeClass, verdictScoreClass } from "@/lib/verdict-styles";
import { PremiumPdfDownloadButton } from "@/components/PremiumPdfReport";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { savePendingReport } from "@/lib/pending-report-storage";

interface PdfPreviewModalProps {
  report: FullReport | null;
  open: boolean;
  onClose: () => void;
}

function execSummaryParagraph(report: FullReport): string {
  const score = report.opportunityScore;
  const rec = report.recommendation;
  const count = report.competitors.length;
  const direct = report.directCompetitors?.length ?? report.conceptFit?.directCompetitorCount ?? 0;
  const cuisine = report.conceptInput?.cuisineConcept?.toLowerCase() ?? "restaurant";

  if (rec === "NO-GO") {
    return `This location scores ${score}/10 with a NO-GO recommendation. With ${count} nearby restaurants and notable cuisine saturation, the trade area presents significant headwinds for a new ${cuisine} concept at this address. Proceed only with a differentiated concept and favorable lease terms.`;
  }
  if (rec === "CAUTION") {
    return `This location scores ${score}/10 with a CAUTION recommendation. The market shows mixed signals: some opportunity exists, but ${direct} direct competitors and saturation factors require careful validation before signing a lease.`;
  }
  return `This location scores ${score}/10 with a GO recommendation. Market gaps, demand signals, and competitive positioning align well for a new concept at this address.`;
}

function PdfDocumentPreview({ report }: { report: FullReport }) {
  const rec = report.conceptFit?.recommendation ?? report.recommendation;
  const score = report.conceptFit?.fitScore ?? report.opportunityScore;
  const direct = report.directCompetitors ?? [];
  const directCount = direct.length || (report.conceptFit?.directCompetitorCount ?? 0);
  const radius = report.searchRadiusMiles ?? 5;
  const gap = report.marketAnalysis.underservedCuisines[0] ?? "Underserved segment";
  const weakness =
    report.marketAnalysis.reviewSentiment.topComplaints[0] ?? "Competitor quality gaps";
  const serviceLabel = report.conceptInput
    ? serviceModelLabel(report.conceptInput.serviceModel)
    : "Restaurant";
  const cuisine = report.conceptInput?.cuisineConcept ?? "Concept";
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const avgRating =
    report.competitors.length > 0
      ? (
          report.competitors.reduce((s, c) => s + c.rating, 0) / report.competitors.length
        ).toFixed(1)
      : "N/A";

  const recBadge = verdictBadgeClass(rec);
  const recScore = verdictScoreClass(rec);

  return (
    <div className="bg-white m-4 p-8 shadow-sm min-h-[500px] font-serif">
      <div className="text-center pb-6 border-b-2 border-foreground mb-7">
        <p className="font-sans text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-4">
          Restaurant Site Finder
        </p>
        <h1 className="font-sans text-2xl font-bold text-foreground mb-2">Location Analysis Report</h1>
        <p className="text-sm text-muted-foreground">{report.address}</p>
        <p className="font-sans text-xs text-muted-foreground mt-1">Prepared for the owner of this report · {today}</p>
      </div>

      <section className="mb-7">
        <h2 className="font-sans text-base font-bold border-b border-border pb-1.5 mb-3">Executive Summary</h2>
        <h3 className="font-sans text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          Your Opportunity Score
        </h3>
        <div className="inline-flex items-center gap-3 border-2 border-border rounded-lg px-4 py-2 mb-3 font-sans">
          <span className={cn("text-3xl font-extrabold", recScore)}>{score}/10</span>
          <span className={cn("text-xs font-bold uppercase px-2.5 py-1 rounded-md border", recBadge)}>{rec}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90 mb-3">{execSummaryParagraph(report)}</p>
        <h3 className="font-sans text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Key Findings</h3>
        <ul className="text-sm space-y-1 list-disc pl-5 text-foreground/90">
          <li>
            <strong>Market:</strong> {report.competitors.length} restaurants mapped in {radius}-mile trade area. Top gap: {gap}.
          </li>
          <li>
            <strong>Competition:</strong> {directCount} direct rivals. Average rating {avgRating}. Weakness: {weakness}.
          </li>
          <li>
            <strong>Concept Fit:</strong> {report.conceptFit?.fitScore ?? score}/10 for {serviceLabel.toLowerCase()} {cuisine.toLowerCase()}. Recommendation: {rec}.
          </li>
        </ul>
      </section>

      <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center mb-3">
        Continue reading
      </p>

      <div className="relative -mx-8 px-8 pb-8 min-h-[480px]">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/90 to-transparent z-[2] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-muted via-muted/90 to-transparent z-[2] pointer-events-none" />

        <div className="blur-[5px] opacity-55 select-none pointer-events-none space-y-7 pt-2">
          <section>
            <h2 className="font-sans text-base font-bold border-b border-border pb-1.5 mb-2">Location Details</h2>
            <p className="text-sm">Address: {report.address}</p>
            <p className="text-sm">Trade area: {radius} miles · {report.competitors.length} restaurants mapped</p>
          </section>
          <section>
            <h2 className="font-sans text-base font-bold border-b border-border pb-1.5 mb-2">Market Analysis</h2>
            <p className="text-sm">{report.marketAnalysis.demographics.slice(0, 120)}...</p>
          </section>
          <section>
            <h2 className="font-sans text-base font-bold border-b border-border pb-1.5 mb-2">Competition Analysis</h2>
            <p className="text-sm">{formatCompetitorAreaSubtitle(report.competitors.length, report.conceptInput?.serviceModel)}</p>
          </section>
          <section>
            <h2 className="font-sans text-base font-bold border-b border-border pb-1.5 mb-2">Concept Fit</h2>
            <p className="text-sm">{report.conceptFit?.summary ?? report.concepts[0]?.reasoning ?? ""}</p>
          </section>
          <section>
            <h2 className="font-sans text-base font-bold border-b border-border pb-1.5 mb-2">Winning Concepts</h2>
            {report.concepts.slice(0, 2).map((c) => (
              <p key={c.name} className="text-sm mb-2">
                {c.name}: {c.description.slice(0, 80)}...
              </p>
            ))}
          </section>
        </div>

        <PaywallCard report={report} />
      </div>
    </div>
  );
}

function PaywallCard({ report }: { report: FullReport }) {
  const { isPremium, email } = usePremium();
  const checkout = trpc.subscription.createCheckout.useMutation();
  const [partnerEmail, setPartnerEmail] = useState("");
  const [paid, setPaid] = useState(false);

  const startCheckout = async () => {
    const checkoutEmail = email || localStorage.getItem(LEAD_EMAIL_KEY) || "";
    if (!checkoutEmail) {
      toast.error("Enter your email above to continue.");
      return;
    }
    captureEvent("upgrade_cta_clicked", { plan: "lifetime", feature: "pdf_preview_modal" });
    try {
      savePendingReport(report);
      const result = await checkout.mutateAsync({ email: checkoutEmail, plan: "lifetime" });
      captureEvent("checkout_session_created", { plan: "lifetime" });
      window.location.href = result.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
    }
  };

  if (isPremium || paid) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%] z-[5] w-[calc(100%-2rem)] max-w-md bg-card border rounded-2xl p-6 shadow-2xl text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary text-2xl font-bold">
          ✓
        </div>
        <h4 className="text-lg font-bold mb-2">Your PDF is ready</h4>
        <p className="text-sm text-muted-foreground mb-4">Download now and share with your investor, partner, or bank.</p>
        <PremiumPdfDownloadButton report={report} unlocked={isPremium || paid} size="lg" className="w-full h-11 font-semibold" />
        {partnerEmail.includes("@") && (
          <p className="text-xs text-muted-foreground mt-3">
            A copy was also sent to {partnerEmail}. They can run their own analysis on our site.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%] z-[5] w-[calc(100%-2rem)] max-w-md bg-card border rounded-2xl p-5 shadow-2xl font-sans">
      <h4 className="text-base font-bold text-center mb-1">Unlock the full report</h4>
      <p className="text-xs text-muted-foreground text-center mb-3 leading-relaxed">
        You read the executive summary. The rest is in the PDF you hand to investors.
      </p>
      <ol className="space-y-1.5 mb-3 text-xs">
        {[
          "Full competitor table with ratings and review counts",
          "Menu-market fit for each winning concept",
          "Rent stress test and break-even estimate",
          "Market analysis and review sentiment",
          "Shareable copy for your partner or co-founder",
        ].map((text, i) => (
          <li key={text} className="flex gap-2 items-start border-b border-border/50 pb-1.5 last:border-0">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <p className="text-2xl font-bold text-primary text-center">$49</p>
      <p className="text-[11px] text-muted-foreground text-center mb-3">One-time · lifetime access · up to 3 reports</p>
      <div className="mb-3">
        <Label htmlFor="partner-email" className="text-xs">Forward to a partner or investor (optional)</Label>
        <Input
          id="partner-email"
          type="email"
          value={partnerEmail}
          onChange={(e) => setPartnerEmail(e.target.value)}
          placeholder="partner@restaurant.com"
          className="h-9 mt-1 text-sm"
        />
        <p className="text-[10px] text-muted-foreground mt-1">They receive a copy and can run their own analysis on our site.</p>
      </div>
      <Button className="w-full h-11 font-semibold" disabled={checkout.isPending} onClick={startCheckout}>
        {checkout.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pay $49 and download PDF now"}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center mt-2">Secure checkout · instant download after payment</p>
      {import.meta.env.DEV && (
        <button type="button" className="text-[10px] text-muted-foreground underline mt-2 w-full" onClick={() => setPaid(true)}>
          Dev: skip payment
        </button>
      )}
    </div>
  );
}

export function PdfPreviewModal({ report, open, onClose }: PdfPreviewModalProps) {
  if (!open || !report) return null;

  return (
    <div
      className="fixed inset-0 z-[500] bg-slate-900/65 backdrop-blur-sm overflow-y-auto p-4 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-w-[640px] mx-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-lg bg-slate-900/75 text-white flex items-center justify-center hover:bg-slate-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="rounded-xl overflow-hidden bg-muted shadow-2xl max-h-[88vh] overflow-y-auto">
          <PdfDocumentPreview report={report} />
        </div>
      </div>
    </div>
  );
}
