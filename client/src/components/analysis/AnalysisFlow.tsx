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

type FlowPhase = "scanning" | "gate" | "generating" | "report" | "no_credits";

interface AnalysisFlowProps {
  scanData: InitialScan | null;
  concept: ConceptInput;
  address: string;
  lat: number;
  lng: number;
  isInitialScanPending: boolean;
  onAnalyzeAnother: () => void;
  onScanComplete?: (scan: InitialScan) => void;
}

export function AnalysisFlow({
  scanData,
  concept,
  address,
  lat,
  lng,
  isInitialScanPending,
  onAnalyzeAnother,
  onScanComplete,
}: AnalysisFlowProps) {
  const [leadId, setLeadId] = useState<number | null>(null);
  const [phase, setPhase] = useState<FlowPhase>("scanning");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [showReportConfetti, setShowReportConfetti] = useState(false);
  const reportTriggered = useRef(false);
  const scanToastShown = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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
      scanToastShown.current = false;
      reportTriggered.current = false;
    }
  }, [isInitialScanPending, address]);

  useEffect(() => {
    if (!scanData || isInitialScanPending) return;
    setPhase("gate");
    if (!scanToastShown.current) {
      scanToastShown.current = true;
      onScanComplete?.(scanData);
    }
  }, [scanData, isInitialScanPending, onScanComplete]);

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

  const handleLeadCaptured = (id: number) => {
    if (!hasReportCredits()) {
      setPhase("no_credits");
      toast.error("You have used all 3 reports. Upgrade to generate more.");
      return;
    }
    consumeReportCredit();
    setLeadId(id);
    setPhase("generating");
  };

  const scanSteps: AgentStep[] = useMemo(() => {
    const radius = scanData?.searchRadiusMiles ?? 5;
    const gateReached = phase !== "scanning";

    return [
      {
        id: "loc",
        label: "Found location on map",
        sublabel: scanData?.address ?? address,
        status: isInitialScanPending ? "pending" : "done",
      },
      {
        id: "area",
        label: `Scanning ${radius}-mile trade area`,
        sublabel: isInitialScanPending
          ? "Querying Google Places..."
          : `${scanData?.competitorCount ?? 0} restaurants found nearby`,
        status: isInitialScanPending ? "active" : "done",
      },
      {
        id: "direct",
        label: "Matching direct competitors",
        sublabel: gateReached
          ? `${scanData?.directCompetitorCount ?? 0} ${formatConceptLabel(concept).toLowerCase()} concepts within range`
          : undefined,
        status: isInitialScanPending ? "pending" : gateReached ? "done" : "active",
      },
      {
        id: "cuisine",
        label: "Mapping cuisine saturation",
        sublabel: gateReached ? `${scanData?.topCuisines.length ?? 0} cuisine types identified` : undefined,
        status: gateReached ? "done" : isInitialScanPending ? "pending" : "pending",
      },
      {
        id: "model",
        label: "Running location prediction model",
        sublabel: gateReached ? "Forecasting fit for your concept at this address..." : undefined,
        status: gateReached ? "done" : "pending",
      },
    ];
  }, [scanData, concept, address, isInitialScanPending, phase]);

  const phaseLabel =
    phase === "report"
      ? "Report ready"
      : phase === "generating"
        ? "Unlocking report"
        : phase === "gate"
          ? "Signal detected"
          : isInitialScanPending
            ? "Predicting..."
            : "Scanning...";

  const agentTitle =
    phase === "gate" || phase === "generating" || phase === "report"
      ? "Prediction model finished"
      : isInitialScanPending
        ? "Predicting your market fit..."
        : "Predicting your market fit...";

  return (
    <section ref={sectionRef} id="analysis-flow" className="py-12 bg-background border-t border-border/50">
      <AnalysisContextBar address={address} concept={concept} phaseLabel={phaseLabel} />

      <div className={`container pt-8 space-y-8 ${phase === "report" ? "max-w-5xl" : "max-w-3xl"}`}>
        {phase !== "report" && (
          <AnalysisAgentProgress
            title={agentTitle}
            steps={scanSteps}
            isActive={isInitialScanPending}
            dimmed={phase === "gate" || phase === "generating"}
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
            <CardContent className="p-6 text-center">
              <p className="font-semibold text-foreground mb-2">All 3 reports used</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upgrade for $49 to download PDFs and save reports to your account.
              </p>
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
