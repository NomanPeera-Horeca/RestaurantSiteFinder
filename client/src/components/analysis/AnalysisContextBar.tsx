import { formatConceptLabel, type ConceptInput } from "../../../../shared/concept-options";
import { getReportsRemaining } from "@/lib/report-credits";

interface AnalysisContextBarProps {
  address: string;
  concept?: ConceptInput;
  phaseLabel: string;
}

export function AnalysisContextBar({ address, concept, phaseLabel }: AnalysisContextBarProps) {
  const remaining = getReportsRemaining();
  return (
    <div className="sticky top-16 z-30 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="container max-w-3xl py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
            <span className="text-primary">📍</span>
            {address}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {concept ? formatConceptLabel(concept) : "Restaurant concept"} · {phaseLabel}
          </p>
        </div>
        <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-3 py-1 shrink-0">
          {remaining} of 3 reports left
        </span>
      </div>
    </div>
  );
}
