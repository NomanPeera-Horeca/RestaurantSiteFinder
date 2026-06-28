import type { MenuMarketFit } from "../../../shared/analysis-types";
import { MMF_TOOLTIP } from "@/lib/verdict-styles";
import { RecommendationProgress } from "@/components/analysis/RecommendationProgress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Users } from "lucide-react";

function mmfScoreColor(score: number): string {
  if (score >= 7) return "text-green-700";
  if (score >= 4) return "text-amber-700";
  return "text-red-700";
}

interface MenuMarketFitCardProps {
  mmf: MenuMarketFit;
  /** Shown in standalone header only, e.g. user's cuisine label */
  label?: string;
  className?: string;
  /** embedded = inside winning concept card (matches HTML prototype mmf-box) */
  variant?: "standalone" | "embedded";
}

export function MenuMarketFitCard({
  mmf,
  label,
  className = "",
  variant = "standalone",
}: MenuMarketFitCardProps) {
  const rec = mmf.demandScore >= 7 ? "GO" : mmf.demandScore >= 4 ? "CAUTION" : "NO-GO";

  if (variant === "embedded") {
    return (
      <div className={`rounded-[10px] border border-primary/20 bg-primary/5 p-3.5 mt-1 space-y-2 ${className}`}>
        <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
          Menu-Market Fit
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold"
                aria-label="What is Menu-Market Fit?"
              >
                ?
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              {MMF_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </h5>
        <p className={`text-sm font-bold ${mmfScoreColor(mmf.demandScore)}`}>
          Demand: {mmf.demandScore}/10
        </p>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, mmf.demandScore * 10)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{mmf.demandExplanation}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-primary/30 bg-primary/5 p-5 space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary shrink-0" />
          Menu-Market Fit
          {label ? <span className="text-muted-foreground font-normal">· {label}</span> : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
                aria-label="What is Menu-Market Fit?"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              {MMF_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Demand:</span>
          <span className={`font-bold text-lg ${mmfScoreColor(mmf.demandScore)}`}>{mmf.demandScore}/10</span>
        </div>
      </div>
      <RecommendationProgress value={mmf.demandScore * 10} recommendation={rec} className="h-2.5" />
      <p className="text-sm text-foreground leading-relaxed">{mmf.demandExplanation}</p>
    </div>
  );
}
