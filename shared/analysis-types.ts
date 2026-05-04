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
  demandScore: number; // 1-10 how much demand exists for this cuisine
  demandExplanation: string; // why this cuisine does or doesn't fit the local market
  populationMatch: string; // how the local demographics align with this cuisine
  searchDemandSignals: string; // evidence of people looking for this cuisine type
  competitiveAdvantage: string; // what advantage this concept has in this specific market
}

/** Winning concept suggestion */
export interface WinningConcept {
  name: string;
  description: string;
  cuisineType: string;
  menuIdeas: string[];
  targetAudience: string;
  estimatedInvestment: string;
  riskScore: number; // 1-10
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

/** Full report structure */
export interface FullReport {
  address: string;
  lat: number;
  lng: number;
  competitors: Competitor[];
  marketAnalysis: MarketAnalysis;
  concepts: WinningConcept[];
  equipmentBundles: EquipmentBundle[];
  opportunityScore: number;
  recommendation: "GO" | "NO-GO" | "CAUTION";
}

/** Initial scan result (before lead wall) */
export interface InitialScan {
  address: string;
  lat: number;
  lng: number;
  competitorCount: number;
  topCuisines: string[];
  averageRating: number;
  previewInsight: string;
}
