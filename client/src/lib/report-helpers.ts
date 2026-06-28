import type { Competitor, FullReport, MenuMarketFit, WinningConcept } from "../../../shared/analysis-types";
import { classifyCompetitor } from "../../../shared/competitor-classifier";
import { distanceMilesBetween, roundDistanceMiles } from "../../../shared/geo";
import { formatMappedCount } from "../../../shared/search-config";

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

export function competitorDistanceMiles(
  c: Competitor,
  originLat?: number,
  originLng?: number
): number | null {
  if (c.distanceMiles != null) return c.distanceMiles;
  if (originLat == null || originLng == null || !c.lat || !c.lng) return null;
  return roundDistanceMiles(distanceMilesBetween(originLat, originLng, c.lat, c.lng));
}

export function countWithinMiles(
  competitors: Competitor[],
  miles: number,
  originLat?: number,
  originLng?: number
): number {
  return competitors.filter((c) => {
    const d = competitorDistanceMiles(c, originLat, originLng);
    return d != null && d <= miles;
  }).length;
}

export const CONCEPT_FIT_TOOLTIP =
  "Concept fit answers: Does this neighborhood want your exact restaurant type? We score direct rivals, cuisine saturation, review patterns, and demand signals for your service model and price tier. A low score means the market is crowded or mismatched, not that your idea is bad everywhere.";

export const MMF_SECTION_TOOLTIP =
  "Menu-Market Fit scores how well a concept's menu matches what people near this address actually order and praise in reviews.";

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

export function cuisineCoverageSummary(underservedCount: number): string {
  if (underservedCount > 0) {
    return "Most cuisines are covered nearby, but a few gaps remain where a differentiated concept could win.";
  }
  return "Most popular cuisines are already well covered near this address. You will need a clear angle to stand out.";
}

/** Turn review patterns into numbered must-do actions. */
export function patternsToDifferentiationActions(
  patterns: string[],
  complaints: string[] = [],
  praises: string[] = []
): string[] {
  const actions: string[] = [];
  const pool = [...complaints, ...patterns, ...praises];

  for (const raw of pool) {
    if (actions.length >= 3) break;
    const text = raw.replace(/^Customers?\s+/i, "").replace(/\.$/, "").trim();
    if (!text) continue;

    if (/slow|wait|speed|service|line|long/i.test(raw) && !actions.some((a) => /speed|wait|service/i.test(a))) {
      actions.push(`Run faster, more consistent service than nearby rivals. Reviews flag waits and uneven service.`);
      continue;
    }
    if (/quality|taste|food|flavor|fresh|beverage|drink|coffee|ambiance|atmosphere/i.test(raw) && !actions.some((a) => /quality|menu|drink/i.test(a))) {
      actions.push(`Make quality your calling card. Customers praise food and drinks at top competitors — match or beat them.`);
      continue;
    }
    if (/price|expensive|value|portion|small/i.test(raw) && !actions.some((a) => /price|value|portion/i.test(a))) {
      actions.push(`Win on value and portion size. Price complaints show room for a concept that feels worth it.`);
      continue;
    }
    if (/parking|location|hard to find|access/i.test(raw) && !actions.some((a) => /parking|easy to find/i.test(a))) {
      actions.push(`Remove friction: easy parking, clear signage, and fast pickup if rivals make access hard.`);
      continue;
    }
    if (/healthy|option|menu|vegetarian|vegan|gluten/i.test(raw) && !actions.some((a) => /menu|diet/i.test(a))) {
      actions.push(`Add menu options competitors skip. Reviewers ask for choices rivals do not offer.`);
      continue;
    }
    if (/clean|dirty|hygiene/i.test(raw) && !actions.some((a) => /clean/i.test(a))) {
      actions.push(`Keep the space spotless every shift. Cleanliness complaints are an easy win if you execute daily.`);
      continue;
    }
  }

  if (actions.length === 0 && praises.length > 0) {
    actions.push(`Copy what winners do well: ${praises[0].replace(/^Customers?\s+/i, "").replace(/\.$/, "")}.`);
  }
  if (actions.length === 0 && complaints.length > 0) {
    actions.push(`Fix what rivals get wrong: ${complaints[0].replace(/^Customers?\s+/i, "").replace(/\.$/, "")}.`);
  }
  if (actions.length === 0 && patterns.length > 0) {
    actions.push(`Use local review themes to pick one thing to do better than everyone else nearby.`);
  }

  while (actions.length < 3) {
    const fallbacks = [
      "Pick one signature item and make it the best within a short drive of this address.",
      "Train staff so every visit feels the same — consistency beats one-off great days.",
      "Market to the busiest meal period near this location (morning coffee, lunch, or dinner).",
    ];
    const next = fallbacks[actions.length];
    if (!actions.includes(next)) actions.push(next);
    else break;
  }

  return actions.slice(0, 3);
}

export function parseDemographicsScan(text: string): { label: string; value: string }[] {
  const cleaned = text.replace(/^AI estimate based on competitor mix:\s*/i, "").trim();
  const bullets: { label: string; value: string }[] = [];

  const incomeMatch = cleaned.match(/\$[\d,]+(?:k)?(?:\s*[–-]\s*\$?[\d,]+(?:k)?)?/i);
  if (incomeMatch) {
    bullets.push({ label: "Estimated income band", value: incomeMatch[0].replace(/\s+/g, " ") });
  }

  if (/office|worker|commute|corporate|business district/i.test(cleaned)) {
    bullets.push({ label: "Who eats here", value: "Office workers and weekday lunch traffic" });
  } else if (/famil|residential|neighborhood|suburb/i.test(cleaned)) {
    bullets.push({ label: "Who eats here", value: "Families and residential diners" });
  } else {
    bullets.push({ label: "Who eats here", value: "Mixed office, residential, and local visitors" });
  }

  if (/dine.?in|sit.?down|full service|table service/i.test(cleaned)) {
    bullets.push({ label: "Best format here", value: "Dine-in and sit-down service" });
  } else if (/delivery|takeout|to.?go|pickup|ghost/i.test(cleaned)) {
    bullets.push({ label: "Best format here", value: "Takeout, delivery, or quick pickup" });
  } else {
    bullets.push({ label: "Best format here", value: "Casual dining out" });
  }

  if (/casual|fast casual|quick/i.test(cleaned)) {
    bullets.push({ label: "Typical spend", value: "Casual price points ($ to $$)" });
  } else if (/upscale|fine|premium|$$$/i.test(cleaned)) {
    bullets.push({ label: "Typical spend", value: "Higher-end dining ($$$+)" });
  } else if (incomeMatch) {
    bullets.push({ label: "Typical spend", value: "Mid-range casual dining" });
  }

  if (bullets.length < 3) {
    const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
    for (const sentence of sentences) {
      if (bullets.length >= 4) break;
      if (bullets.some((b) => b.value.includes(sentence.slice(0, 20)))) continue;
      bullets.push({ label: "Area note", value: sentence.trim() });
    }
  }

  return bullets.slice(0, 4);
}

export function parseFootTrafficScan(text: string): {
  level: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  peakTimes: string[];
  drivers: string[];
} {
  const cleaned = text.replace(/^AI estimate based on area and competitor activity:\s*/i, "").trim();
  const lower = cleaned.toLowerCase();
  const isHigh = lower.includes("high") || lower.includes("busy") || lower.includes("heavy") || lower.includes("strong");
  const isLow = lower.includes("low") || lower.includes("quiet") || lower.includes("light") || lower.includes("limited");
  const level: "HIGH" | "MEDIUM" | "LOW" = isHigh ? "HIGH" : isLow ? "LOW" : "MEDIUM";

  const peakTimes: string[] = [];
  if (/morning|breakfast|coffee|commute|7|8|9 am/i.test(lower)) peakTimes.push("Morning rush (7–10 AM)");
  if (/lunch|midday|noon|11|12|1 pm/i.test(lower)) peakTimes.push("Lunch (11 AM–2 PM)");
  if (/evening|dinner|night|weekend|5|6|7 pm/i.test(lower)) peakTimes.push("Evening & weekends");
  if (peakTimes.length === 0) {
    if (level === "HIGH") peakTimes.push("Steady traffic across dayparts");
    else peakTimes.push("Lunch hours", "Evening dinner");
  }

  const drivers: string[] = [];
  if (/office|worker|business|corporate/i.test(lower)) drivers.push("Nearby offices drive weekday meal visits");
  if (/cafe|coffee|bakery/i.test(lower)) drivers.push("Cluster of cafes signals morning walk-in traffic");
  if (/retail|shop|mall|strip|center/i.test(lower)) drivers.push("Retail and shopping pull pass-by visitors");
  if (/residential|neighborhood|family|housing/i.test(lower)) drivers.push("Residential density supports weekend and dinner visits");
  if (/school|campus|university|college/i.test(lower)) drivers.push("Schools or campuses add predictable lunch peaks");
  if (drivers.length === 0) {
    drivers.push("Competitor activity suggests moderate local dining demand");
    if (level === "LOW") drivers.push("May rely on destination visits rather than walk-by traffic");
    else drivers.push("Peak times matter more than constant foot flow");
  }

  return { level, summary: cleaned, peakTimes: peakTimes.slice(0, 3), drivers: drivers.slice(0, 3) };
}

export function buildUserConceptMenuMarketFit(report: FullReport): MenuMarketFit | null {
  if (!report.conceptInput || report.conceptInput.mode !== "specific" || report.conceptInput.serviceModel === "explore") {
    return null;
  }

  const label = report.conceptInput.cuisineConcept;
  const matchingConcept = report.concepts.find(
    (c) =>
      c.cuisineType.toLowerCase().includes(label.toLowerCase()) ||
      c.name.toLowerCase().includes(label.toLowerCase()) ||
      label.toLowerCase().includes(c.cuisineType.toLowerCase())
  );
  if (matchingConcept) {
    return ensureMenuMarketFit(matchingConcept, report);
  }

  const demandScore = report.conceptFit?.fitScore ?? report.opportunityScore;
  const demographics = parseDemographicsScan(report.marketAnalysis.demographics);
  const topPraise = report.marketAnalysis.reviewSentiment.topPraises[0];
  const topComplaint = report.marketAnalysis.reviewSentiment.topComplaints[0];

  return {
    demandScore,
    demandExplanation:
      report.conceptFit?.whyItWorksOrFails?.slice(0, 280) ||
      `Local reviews and nearby restaurants suggest ${label} has ${demandScore >= 7 ? "strong" : demandScore >= 4 ? "moderate" : "limited"} menu demand at this address.`,
    populationMatch: demographics.find((d) => d.label === "Who eats here")?.value || demographics[0]?.value || "Based on nearby dining patterns.",
    searchDemandSignals:
      topPraise?.replace(/^Customers?\s+/i, "") ||
      "Review themes from restaurants surrounding this address.",
    competitiveAdvantage: topComplaint
      ? `Win where rivals slip: ${topComplaint.replace(/^Customers?\s+/i, "").replace(/\.$/, "")}.`
      : "Lead with a focused menu that beats nearby options on quality and consistency.",
  };
}

export function ensureMenuMarketFit(concept: WinningConcept, report: FullReport): MenuMarketFit {
  const existing = concept.menuMarketFit;
  if (existing?.demandExplanation && existing.demandScore > 0) return existing;

  const demandScore = Math.max(
    3,
    Math.min(9, Math.round((report.opportunityScore + (10 - concept.riskScore)) / 2))
  );

  return {
    demandScore,
    demandExplanation:
      existing?.demandExplanation ||
      `Local reviews and nearby restaurants suggest ${concept.cuisineType} has ${demandScore >= 7 ? "strong" : demandScore >= 4 ? "moderate" : "limited"} demand at this address.`,
    populationMatch:
      existing?.populationMatch ||
      concept.targetAudience ||
      "Fits the dining habits inferred from restaurants near this address.",
    searchDemandSignals:
      existing?.searchDemandSignals ||
      concept.reasoning?.slice(0, 160) ||
      "Based on cuisine mix and review themes from surrounding restaurants.",
    competitiveAdvantage:
      existing?.competitiveAdvantage ||
      `Lead with ${concept.menuIdeas[0] || "a signature item"} to stand out from nearby options.`,
  };
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
  return `${all.length} restaurants mapped near this address`;
}

export function mappedRestaurantLabel(count: number, capped?: boolean): string {
  return `${formatMappedCount(count, capped)} mapped restaurant${count === 1 && !capped ? "" : "s"}`;
}
