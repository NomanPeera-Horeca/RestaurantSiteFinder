import type { FullReport } from "../../../../shared/analysis-types";
import { verdictMomentTitle } from "@/lib/verdict-styles";
import { ConfettiOverlay } from "./ConfettiOverlay";

interface ReportVerdictMomentProps {
  report: FullReport;
  showConfetti?: boolean;
}

export function ReportVerdictMoment({ report, showConfetti = true }: ReportVerdictMomentProps) {
  const rec = report.conceptFit?.recommendation ?? report.recommendation;
  const score = report.conceptFit?.fitScore ?? report.opportunityScore;
  const direct = report.directCompetitors?.length ?? report.conceptFit?.directCompetitorCount ?? 0;

  return (
    <>
      <ConfettiOverlay active={showConfetti} />
      <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#145c39] text-white p-7 text-center shadow-xl mb-8">
        <span className="inline-block text-[10px] font-extrabold tracking-[0.14em] uppercase bg-white/15 border border-white/25 px-3 py-1 rounded-full mb-3">
          Location analysis complete
        </span>
        <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-2">{verdictMomentTitle(rec)}</h2>
        <p className="text-sm text-white/85 max-w-lg mx-auto">
          Recommendation: {rec} · Score {score}/10 · {direct} direct rivals · review intelligence analyzed
        </p>
        <p className="text-xs text-white/60 mt-2 max-w-md mx-auto">
          Scroll down for competitors, market gaps, and winning concepts.
        </p>
      </div>
    </>
  );
}
