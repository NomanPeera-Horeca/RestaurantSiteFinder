import type { FullReport } from "../../../../shared/analysis-types";
import { closureTitle } from "@/lib/verdict-styles";

interface ReportClosureSectionProps {
  report: FullReport;
  onPreviewPdf: () => void;
  onEmailReport: () => void;
}

export function ReportClosureSection({ report, onPreviewPdf, onEmailReport }: ReportClosureSectionProps) {
  const rec = report.conceptFit?.recommendation ?? report.recommendation;
  const score = report.conceptFit?.fitScore ?? report.opportunityScore;
  const direct = report.directCompetitors?.length ?? report.conceptFit?.directCompetitorCount ?? 0;
  const gap = report.marketAnalysis.underservedCuisines[0] ?? "Market gap";
  const topConcept = report.concepts[0]?.name ?? "Winning concept";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#145c39] text-white">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="p-7 text-left">
          <span className="inline-block text-[10px] font-extrabold tracking-[0.12em] uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/35 px-2.5 py-1 rounded-full mb-3">
            Your report is ready to share
          </span>
          <h3 className="text-xl font-bold mb-2">{closureTitle(rec)}</h3>
          <p className="text-sm text-white/85 mb-4 leading-relaxed">
            Recommendation {rec} at {score}/10 for {report.address.split(",")[0]}. The PDF packages everything below into one document they can forward.
          </p>
          <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 mb-4 text-sm leading-relaxed">
            Site selection consultants charge <strong className="text-amber-200">$2,500+</strong> for this. Your full PDF is{" "}
            <strong className="text-amber-200">$49 once</strong>, lifetime access.
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { v: rec, k: "Recommendation" },
              { v: `${score}/10`, k: "Score" },
              { v: String(direct), k: "Rivals" },
            ].map((s) => (
              <div key={s.k} className="bg-white/10 border border-white/15 rounded-lg px-3 py-2 min-w-[70px]">
                <div className="text-sm font-bold">{s.v}</div>
                <div className="text-[9px] uppercase tracking-wide text-white/60">{s.k}</div>
              </div>
            ))}
          </div>
          <ul className="space-y-1.5 mb-5 text-sm text-white/85">
            <li>🔒 Full competitor table with ratings and review counts</li>
            <li>🔒 Menu-market fit breakdown for {topConcept}</li>
            <li>🔒 Rent stress test and break-even estimate</li>
          </ul>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onPreviewPdf}
              className="w-full h-12 rounded-xl bg-white text-[#0f172a] font-bold text-sm hover:bg-white/95 transition-colors"
            >
              See what your PDF looks like
              <span className="block text-[11px] font-medium opacity-75 mt-0.5">Preview free, then unlock to download</span>
            </button>
            <button
              type="button"
              onClick={onEmailReport}
              className="text-sm text-white/75 underline underline-offset-2 hover:text-white py-1"
            >
              Or email me a link to this report
            </button>
          </div>
          <p className="text-[11px] text-white/50 mt-3">
            Instant PDF download after payment. Forward to a partner in one click.
          </p>
        </div>

        <button
          type="button"
          onClick={onPreviewPdf}
          className="bg-black/25 p-6 flex items-center justify-center min-h-[280px] hover:bg-black/30 transition-colors group"
          aria-label="Preview PDF report"
        >
          <div className="relative bg-white rounded-lg w-full max-w-[220px] shadow-2xl rotate-2 group-hover:rotate-0 group-hover:scale-[1.03] transition-transform">
            <div className="bg-[#1e293b] text-white px-3 py-2 text-[9px] font-bold uppercase tracking-wide">
              Executive Summary
            </div>
            <div className="p-3 text-left">
              <p className="text-[10px] font-bold text-primary leading-snug mb-2">
                Recommendation: {rec} · Score {score}/10 · {direct} rivals mapped
              </p>
              <div className="h-1.5 bg-slate-200 rounded w-full mb-1.5" />
              <div className="h-1.5 bg-slate-200 rounded w-4/5 mb-1.5" />
              <div className="blur-sm opacity-45 pt-2 border-t border-dashed border-slate-200">
                <div className="h-1.5 bg-slate-200 rounded w-full mb-1.5" />
                <div className="h-1.5 bg-slate-200 rounded w-3/5" />
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 -rotate-6 bg-primary text-white text-[10px] font-extrabold px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
              TAP TO PREVIEW
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
