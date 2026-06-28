import type { Competitor, FullReport, WinningConcept } from "../../../shared/analysis-types";
import { classifyCompetitor } from "../../../shared/competitor-classifier";

export function countCuisines(competitors: Competitor[]): { cuisine: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const c of competitors) {
    const cuisine =
      c.cuisine && c.cuisine !== "Restaurant"
        ? c.cuisine
        : classifyCompetitor({ name: c.name, cuisine: c.cuisine, priceLevel: c.priceLevel }).cuisine;
    counts[cuisine] = (counts[cuisine] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([cuisine, count]) => ({ cuisine, count }))
    .sort((a, b) => b.count - a.count);
}

export function formatCuisineBreakdown(
  counts: { cuisine: string; count: number }[],
  max = 6
): string {
  return counts
    .slice(0, max)
    .map(({ cuisine, count }) => `${cuisine}: ${count}`)
    .join(" · ");
}

export function totalReviewCount(competitors: Competitor[]): number {
  return competitors.reduce((sum, c) => sum + (c.userRatingsTotal || 0), 0);
}

export function formatReviewVolume(total: number): string {
  if (total >= 1000) return `${(total / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return String(total);
}

export const CONCEPT_FIT_TOOLTIP =
  "Concept fit answers: Does this neighborhood want your exact restaurant type? We score direct rivals, cuisine saturation, review patterns, and demand signals for your service model and price tier. A low score means the market is crowded or mismatched, not that your idea is bad everywhere.";

export const MMF_SECTION_TOOLTIP =
  "Menu-Market Fit scores how well a concept's menu matches local demand based on competitor reviews, cuisine gaps, and dining patterns in your trade area.";

export function recommendationHeadline(rec: string): string {
  if (rec === "GO") return "Our recommendation: GO at this address";
  if (rec === "NO-GO") return "Our recommendation: NO-GO at this address";
  return "Our recommendation: CAUTION at this address";
}

export function recommendationSummary(rec: string): string {
  if (rec === "GO") return "Competition, demand signals, and review patterns support opening here with your concept.";
  if (rec === "NO-GO") return "Competition density and review patterns suggest this address is a poor fit for your concept as proposed.";
  return "Mixed signals. Validate lease terms and differentiation before you sign.";
}

export function recommendationProgressClasses(rec: string): { track: string; indicator: string } {
  if (rec === "GO") return { track: "bg-green-100", indicator: "bg-green-600" };
  if (rec === "NO-GO") return { track: "bg-red-100", indicator: "bg-red-600" };
  return { track: "bg-amber-100", indicator: "bg-amber-500" };
}

/** Turn review patterns into numbered differentiation plays. */
export function patternsToDifferentiationActions(patterns: string[]): string[] {
  return patterns.slice(0, 3).map((pattern, i) => {
    const cleaned = pattern.replace(/^Customers?\s+/i, "").replace(/\.$/, "");
    if (/slow|wait|speed|service/i.test(pattern)) {
      return `Beat rivals on speed and consistency. ${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
    }
    if (/quality|rating|food|taste/i.test(pattern)) {
      return `Win on quality where competitors slip. ${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
    }
    if (/healthy|option|menu|gap/i.test(pattern)) {
      return `Fill a menu gap competitors miss. ${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
    }
    return `Differentiate on what reviews flag. ${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
  });
}

export function pickMenuMarketFitConcept(report: FullReport): WinningConcept | null {
  const userCuisine = report.conceptInput?.cuisineConcept?.toLowerCase();
  if (userCuisine) {
    const match = report.concepts.find(
      (c) => c.cuisineType.toLowerCase().includes(userCuisine) || c.name.toLowerCase().includes(userCuisine)
    );
    if (match?.menuMarketFit) return match;
  }
  return report.concepts.find((c) => c.menuMarketFit) ?? null;
}

export function directCompetitorBreakdown(
  direct: Competitor[] | undefined,
  all: Competitor[]
): string {
  if (direct && direct.length > 0) {
    const byCuisine = countCuisines(direct);
    return `${direct.length} direct rival${direct.length === 1 ? "" : "s"}: ${formatCuisineBreakdown(byCuisine, 4)}`;
  }
  return `${all.length} restaurants mapped in trade area`;
}
