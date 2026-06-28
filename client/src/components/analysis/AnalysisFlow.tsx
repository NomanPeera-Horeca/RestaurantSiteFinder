import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { captureEvent } from "@/lib/posthog";
import { consumeReportCredit, hasReportCredits } from "@/lib/report-credits";
import type { InitialScan } from "../../../../shared/analysis-types";
import type { ConceptInput } from "../../../../shared/concept-options";
import { formatConceptLabel } from "../../../../shared/concept-options";
import { toast } from "sonner";
import { AnalysisContextBar } from "./AnalysisContextBar";
import { AnalysisAgentProgress, type AgentStep } from "./AnalysisAgentProgress";
import { ScanMomentCard } from "./ScanMomentCard";
import { ReportBriefLoader } from "./ReportBriefLoader";
import { ReportVerdictMoment } from "./ReportVerdictMoment";
import { ReportClosureSection } from "./ReportClosureSection";
import { PdfPreviewModal } from "./PdfPreviewModal";
import { AnalysisCreditsBanner } from "./AnalysisCreditsBanner";
import { RentStressTease } from "./RentStressTease";
import { ReportBody } from "@/pages/Report";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeLifetimeButton } from "./UpgradeLifetimeButton";
import { useLiveAgentSteps, stepStatusForIndex } from "@/hooks/useLiveAgentSteps";

type FlowPhase = "scanning" | "gate" | "generating" | "report" | "no_credits";

interface AnalysisFlowProps {
  scanData: InitialScan | null;
  concept: ConceptInput;
  address: string;
  lat: number;
  lng: number;
  isInitialScanPending: boolean;
  onAnalyzeAnother: () => void;
  fullPage?: boolean;
}

export function AnalysisFlow({
  scanData,
  concept,
  address,
  lat,
  lng,
  isInitialScanPending,
  onAnalyzeAnother,
  fullPage = false,
}: AnalysisFlowProps) {
  const [leadId, setLeadId] = useState<number | null>(null);
  const [phase, setPhase] = useState<FlowPhase>("scanning");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [showReportConfetti, setShowReportConfetti] = useState(false);
  const reportTriggered = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const scanFinished = !isInitialScanPending && !!scanData;
  const liveScanIndex = useLiveAgentSteps(isInitialScanPending, 5, 1200);

  const fullReport = trpc.analysis.fullReport.useMutation({
    onError: (err) => {
      captureEvent("full_report_error", { error: err.message.slice(0, 120) });
      toast.error("Failed to generate report. Please try again.");
      reportTriggered.current = false;
      setPhase("gate");
    },
  });

  const updateScore = trpc.lead.updateScore.useMutation();

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (isInitialScanPending) {
      setPhase("scanning");
      reportTriggered.current = false;
    }
  }, [isInitialScanPending, address]);

  useEffect(() => {
    if (!scanData || isInitialScanPending) return;
    setPhase("gate");
  }, [scanData, isInitialScanPending]);

  useEffect(() => {
    if (phase !== "generating" || !leadId || reportTriggered.current) return;
    reportTriggered.current = true;
    fullReport.mutate({ address, lat, lng, leadId, concept });
  }, [phase, leadId, address, lat, lng, concept]);

  useEffect(() => {
    if (!fullReport.data || !leadId) return;
    setPhase("report");
    setShowReportConfetti(true);
    captureEvent("full_report_viewed", {
      recommendation: fullReport.data.recommendation,
      opportunity_score: fullReport.data.opportunityScore,
      concept_fit_score: fullReport.data.conceptFit?.fitScore ?? 0,
    });
    updateScore.mutate({
      leadId,
      opportunityScore: fullReport.data.opportunityScore,
      recommendation: fullReport.data.recommendation,
      conceptFitScore: fullReport.data.conceptFit?.fitScore,
      conceptRecommendation: fullReport.data.conceptFit?.recommendation,
    });
  }, [fullReport.data, leadId]);

  const handleLeadCaptured = (id: number, email?: string) => {
    if (!hasReportCredits(email)) {
      setPhase("no_credits");
      toast.error("You have used all 3 reports. Upgrade to generate more.");
      return;
    }
    consumeReportCredit(email);
    setLeadId(id);
    setPhase("generating");
  };

  const scanSteps: AgentStep[] = useMemo(() => {
    const radius = scanData?.searchRadiusMiles ?? 5;
    const conceptLabel = formatConceptLabel(concept).toLowerCase();

    const defs = [
      {
        id: "loc",
        label: "Found location on map",
        pendingSub: "Pinning your address on the trade area map...",
        activeSub: address,
        doneSub: scanData?.address ?? address,
      },
      {
        id: "area",
        label: `Scanning ${radius}-mile trade area`,
        pendingSub: "Querying Google Places for every restaurant nearby...",
        activeSub: "Counting restaurants in your trade area...",
        doneSub: `${scanData?.competitorCount ?? 0} restaurants found nearby`,
      },
      {
        id: "direct",
        label: "Matching direct competitors",
        pendingSub: `Filtering rivals that match ${conceptLabel}...`,
        activeSub: "Comparing service model, cuisine, and price tier...",
        doneSub: `${scanData?.directCompetitorCount ?? 0} ${conceptLabel} concepts within range`,
      },
      {
        id: "cuisine",
        label: "Mapping cuisine saturation",
        pendingSub: "Grouping competitors by cuisine type...",
        activeSub: "Identifying oversaturated and open categories...",
        doneSub: `${scanData?.topCuisines.length ?? 0} cuisine types identified`,
      },
      {
        id: "model",
        label: "Scoring opportunity fit",
        pendingSub: "Checking review patterns brokers never share...",
        activeSub: "Matching your concept to local demand patterns...",
        doneSub: "Initial scan complete. See what we found below.",
      },
    ];

    return defs.map((def, index) => {
      const status = scanFinished
        ? "done"
        : stepStatusForIndex(index, liveScanIndex, false);
      const sublabel =
        status === "done"
          ? def.doneSub
          : status === "active"
            ? def.activeSub
            : def.pendingSub;
      return {
        id: def.id,
        label: def.label,
        sublabel,
        status,
      };
    });
  }, [scanData, concept, address, isInitialScanPending, scanFinished, liveScanIndex]);

  const phaseLabel =
    phase === "report"
      ? "Report ready"
      : phase === "generating"
        ? "Compiling report"
        : phase === "gate"
          ? "Scan complete"
          : "Analyzing trade area...";

  const agentTitle =
    phase === "gate"
      ? "Trade area scan complete"
      : phase === "generating"
        ? "Compiling your location intelligence report..."
        : scanFinished
          ? "Trade area scan complete"
          : "Analyzing your trade area...";

  return (
    <section
      ref={sectionRef}
      id="analysis-flow"
      className={
        fullPage
          ? "flex-1 py-8 bg-background"
          : "py-12 bg-background border-t border-border/50"
      }
    >
      <AnalysisContextBar address={address} concept={concept} phaseLabel={phaseLabel} />

      <div className={`container pt-8 space-y-8 ${phase === "report" ? "max-w-5xl" : "max-w-3xl"}`}>
        {phase !== "report" && phase !== "generating" && (
          <AnalysisAgentProgress
            title={agentTitle}
            steps={scanSteps}
            isActive={isInitialScanPending}
          />
        )}

        {phase === "gate" && scanData && (
          <ScanMomentCard
            scanData={scanData}
            concept={concept}
            address={address}
            lat={lat}
            lng={lng}
            onCaptured={handleLeadCaptured}
          />
        )}

        {phase === "generating" && fullReport.isPending && <ReportBriefLoader />}

        {phase === "no_credits" && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-6 text-center space-y-4">
              <div>
                <p className="font-semibold text-foreground mb-2">All 3 reports used</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade for $49 to download PDFs, save reports to your account, and keep analyzing new locations.
                </p>
              </div>
              <UpgradeLifetimeButton
                feature="no_credits_gate"
                size="lg"
                className="w-full sm:w-auto h-12 rounded-xl font-semibold px-8"
              />
              <p className="text-xs text-muted-foreground">
                One-time payment · lifetime access · secure Stripe checkout
              </p>
              <Button type="button" variant="outline" className="rounded-xl" onClick={onAnalyzeAnother}>
                Back to home
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "report" && fullReport.data && (
          <>
            <ReportVerdictMoment report={fullReport.data} showConfetti={showReportConfetti} />
            <ReportBody report={fullReport.data} />
            <ReportClosureSection
              report={fullReport.data}
              onPreviewPdf={() => setPdfModalOpen(true)}
              onEmailReport={() => setPdfModalOpen(true)}
            />
            <AnalysisCreditsBanner onAnalyzeAnother={onAnalyzeAnother} />
            <RentStressTease report={fullReport.data} />
          </>
        )}
      </div>

      <PdfPreviewModal
        report={fullReport.data ?? null}
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </section>
  );
}
