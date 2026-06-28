import { useEffect, useState } from "react";
import { AnalysisAgentProgress, type AgentStep } from "./AnalysisAgentProgress";
import { RecommendationProgress } from "./RecommendationProgress";
import { useLiveAgentSteps, stepStatusForIndex } from "@/hooks/useLiveAgentSteps";

const REPORT_STEPS: Omit<AgentStep, "status">[] = [
  { id: "reviews", label: "Reading competitor reviews", sublabel: "Pulling patterns from Google Places review text..." },
  { id: "fit", label: "Scoring concept fit for your trade area", sublabel: "Matching your service model to local demand..." },
  { id: "report", label: "Compiling your location intelligence report", sublabel: "Building GO / NO-GO recommendation and market gaps..." },
];

export function ReportBriefLoader() {
  const [progress, setProgress] = useState(12);
  const activeIndex = useLiveAgentSteps(true, REPORT_STEPS.length, 2200);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(92, p + 4));
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const steps: AgentStep[] = REPORT_STEPS.map((step, i) => ({
    ...step,
    status: stepStatusForIndex(i, activeIndex, false),
  }));

  return (
    <div className="space-y-6">
      <AnalysisAgentProgress
        title="Compiling your location intelligence report..."
        steps={steps}
        isActive
      />
      <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">
          This usually takes 30 to 60 seconds. We are analyzing reviews, scoring fit, and writing your recommendation.
        </p>
        <RecommendationProgress value={progress} recommendation="CAUTION" className="max-w-xs mx-auto h-2" />
      </div>
    </div>
  );
}
