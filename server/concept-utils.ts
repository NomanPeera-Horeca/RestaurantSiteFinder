import type { Competitor } from "../shared/analysis-types";
import type { ConceptInput } from "../shared/concept-options";
import { formatConceptLabel, serviceModelLabel } from "../shared/concept-options";
import { getTradeAreaRadiusMiles } from "../shared/search-config";

const CUISINE_KEYWORDS: Record<string, string[]> = {
  burgers: ["burger", "burgers", "smash", "shake shack", "in-n-out", "whataburger"],
  pizza: ["pizza", "pizzeria"],
  mexican: ["mexican", "taco", "burrito", "tex-mex", "taqueria"],
  asian: ["chinese", "japanese", "sushi", "thai", "vietnamese", "korean", "ramen", "pho", "asian"],
  bbq: ["bbq", "barbecue", "barbeque", "smokehouse", "brisket"],
  "healthy / bowls": ["healthy", "bowl", "salad", "juice", "acai", "smoothie"],
  healthy: ["healthy", "bowl", "salad", "juice", "acai", "smoothie"],
  "coffee / cafe": ["coffee", "cafe", "espresso", "bakery", "pastry"],
  chicken: ["chicken", "wings", "chick-fil", "popeyes", "kfc", "nashville hot"],
  seafood: ["seafood", "fish", "oyster", "crab", "shrimp"],
  italian: ["italian", "pasta", "trattoria", "ristorante"],
};

function keywordListForConcept(cuisineConcept: string): string[] {
  const key = cuisineConcept.toLowerCase().trim();
  if (CUISINE_KEYWORDS[key]) return CUISINE_KEYWORDS[key];

  for (const [preset, words] of Object.entries(CUISINE_KEYWORDS)) {
    if (key.includes(preset) || preset.includes(key)) return words;
  }

  return key.split(/[\s/,&]+/).filter(w => w.length > 2);
}

/** Primary Google Places keyword for a cuisine-specific nearby search */
export function getCuisineSearchKeyword(cuisineConcept: string): string | null {
  const keywords = keywordListForConcept(cuisineConcept);
  return keywords[0] ?? null;
}

export function filterDirectCompetitors(
  competitors: Competitor[],
  cuisineConcept: string
): Competitor[] {
  if (!cuisineConcept.trim()) return [];

  const keywords = keywordListForConcept(cuisineConcept);
  return competitors.filter(c => {
    const hay = `${c.name} ${c.cuisine}`.toLowerCase();
    return keywords.some(kw => hay.includes(kw));
  });
}

export function buildConceptContext(concept: ConceptInput): string {
  if (concept.mode === "explore" || concept.serviceModel === "explore") {
    return "The operator has NOT chosen a specific concept yet. Suggest 3 winning concepts for this trade area.";
  }

  const label = formatConceptLabel(concept);
  const modelNotes: Record<string, string> = {
    qsr: "Evaluate for quick-service throughput, drive-thru potential, price compression, and lunch/daypart volume.",
    fast_casual: "Evaluate for counter service, lunch+dinner mix, delivery radius, and $10–18 check viability.",
    full_service: "Evaluate for dine-in covers, seat turns, alcohol potential, and rent vs average check.",
    ghost_kitchen: "Evaluate for delivery density, aggregator competition, and packaging economics—not foot traffic.",
    cafe: "Evaluate for morning/daypart traffic, beverage margin, and bakery prep needs.",
    bar_grill: "Evaluate for evening traffic, bar revenue, and competitive bar saturation.",
  };

  const modelNote = modelNotes[concept.serviceModel] ?? "";
  const priceNote = concept.priceTier ? `Target price tier: ${concept.priceTier}.` : "";

  return `The operator wants to open: ${label}.
${modelNote}
${priceNote}
Your PRIMARY job is to score THIS SPECIFIC concept at THIS location (GO / NO-GO / CAUTION).
If NO-GO or CAUTION, suggest 2 alternative concepts that fit THIS location better AND guidance on where THIS concept might work better instead.`;
}

export function serviceModelDisplay(value: string): string {
  return serviceModelLabel(value);
}

export function buildInitialScanInsight(
  competitorCount: number,
  directCount: number,
  concept: ConceptInput
): string {
  if (concept.mode === "explore" || concept.serviceModel === "explore") {
    if (competitorCount > 15) {
      return "High-density restaurant area. Competition is fierce but foot traffic is likely strong.";
    }
    if (competitorCount > 8) {
      return "Moderate restaurant density. There are clear opportunities for differentiation.";
    }
    return "Low restaurant density. This could be an underserved market with first-mover advantage.";
  }

  const conceptName = concept.cuisineConcept || "your concept";
  const miles = getTradeAreaRadiusMiles(concept.serviceModel);
  if (directCount >= 8) {
    return `Crowded ${conceptName} market: ${directCount} direct competitors within ${miles} miles. Differentiation or a NO-GO verdict is likely unless you have a clear edge.`;
  }
  if (directCount >= 4) {
    return `Moderate ${conceptName} competition (${directCount} direct competitors within ${miles} miles). Viability depends on service model fit and check average.`;
  }
  if (directCount > 0) {
    return `Only ${directCount} direct ${conceptName} competitor(s) within ${miles} miles. Potential opening if local demand matches your service model.`;
  }
  return `No direct ${conceptName} competitors within ${miles} miles. Validate demand before assuming first-mover advantage.`;
}
