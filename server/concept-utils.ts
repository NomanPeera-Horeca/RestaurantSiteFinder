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
      return "This is a high-density restaurant area. A lot of competition, but that also means real foot traffic. Your full report will show whether there is room for you to win here.";
    }
    if (competitorCount > 8) {
      return "Moderate restaurant activity at this location. There may be room to succeed here depending on your concept. Your full report will tell you exactly where the opportunity is.";
    }
    return "Low restaurant activity near this address. That could mean a wide open opportunity or a sign that demand is not there. Your full report will tell you which.";
  }

  const conceptName = concept.cuisineConcept || "your concept";
  const miles = getTradeAreaRadiusMiles(concept.serviceModel);
  if (directCount >= 8) {
    return `${directCount} restaurants already doing what you want to do within ${miles} miles. This is a crowded market. Your full report will show whether you can still make money here or if there is a better location.`;
  }
  if (directCount >= 4) {
    return `${directCount} direct ${conceptName} competitors within ${miles} miles. Not impossible, but you will need a clear edge to make money here. Your full report breaks down exactly what you are up against.`;
  }
  if (directCount > 0) {
    return `Only ${directCount} direct ${conceptName} competitor(s) within ${miles} miles. That could be good news for you. Your full report will tell you if this location can make your restaurant successful.`;
  }
  return `No direct ${conceptName} competitors within ${miles} miles. That could mean big opportunity or no demand. Your full report will tell you which.`;
}
