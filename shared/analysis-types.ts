import type { ConceptInput } from "./concept-options";

/** Competitor from Google Places */
export interface Competitor {
  placeId: string;
  name: string;
  cuisine: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number | null;
  address: string;
  lat: number;
  lng: number;
}

/** Market analysis data */
export interface MarketAnalysis {
  saturatedCuisines: string[];
  underservedCuisines: string[];
  reviewSentiment: ReviewSentiment;
  demographics: string;
  footTraffic: string;
}

export interface ReviewSentiment {
  topComplaints: string[];
  topPraises: string[];
  patterns: string[];
}

/** Menu-market fit analysis for a concept */
export interface MenuMarketFit {
  demandScore: number;
  demandExplanation: string;
  populationMatch: string;
  searchDemandSignals: string;
  competitiveAdvantage: string;
}

/** Winning concept suggestion */
export interface WinningConcept {
  name: string;
  description: string;
  cuisineType: string;
  menuIdeas: string[];
  targetAudience: string;
  estimatedInvestment: string;
  riskScore: number;
  reasoning: string;
  menuMarketFit: MenuMarketFit;
}

/** Equipment recommendation */
export interface EquipmentItem {
  name: string;
  category: string;
  description: string;
  estimatedPrice: string;
  horecaStoreUrl: string;
}

export interface EquipmentBundle {
  conceptName: string;
  items: EquipmentItem[];
  totalEstimate: string;
  ctaText: string;
  ctaUrl: string;
}

/** Verdict for the user's specific concept at this location */
export interface ConceptFit {
  userConceptSummary: string;
  fitScore: number;
  recommendation: "GO" | "NO-GO" | "CAUTION";
  summary: string;
  competitiveVerdict: string;
  whyItWorksOrFails: string;
  directCompetitorCount: number;
  alternativeConcepts: AlternativeConcept[];
  alternativeLocationGuidance: string;
}

export interface AlternativeConcept {
  name: string;
  serviceModel: string;
  cuisineType: string;
  whyBetter: string;
  fitScore: number;
}

/** Full report structure */
export interface FullReport {
  address: string;
  lat: number;
  lng: number;
  competitors: Competitor[];
  directCompetitors?: Competitor[];
  marketAnalysis: MarketAnalysis;
  concepts: WinningConcept[];
  equipmentBundles: EquipmentBundle[];
  opportunityScore: number;
  recommendation: "GO" | "NO-GO" | "CAUTION";
  conceptInput?: ConceptInput;
  conceptFit?: ConceptFit;
  searchRadiusMiles?: number;
}

/** Initial scan result (before lead wall) */
export interface InitialScan {
  address: string;
  lat: number;
  lng: number;
  competitorCount: number;
  directCompetitorCount?: number;
  topCuisines: string[];
  averageRating: number;
  previewInsight: string;
  conceptLabel?: string;
  searchRadiusMiles?: number;
}

export type { ConceptInput };
