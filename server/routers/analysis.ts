import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { makeRequest, type PlaceDetailsResult } from "../_core/map";
import { createReport } from "../db";
import type {
  Competitor,
  WinningConcept,
  EquipmentBundle,
  FullReport,
  InitialScan,
} from "../../shared/analysis-types";
import type { ConceptInput } from "../../shared/concept-options";
import { formatConceptLabel } from "../../shared/concept-options";
import { equipmentUrlForCategory, shopUrlForConcept } from "../../shared/horeca-equipment-links";
import { getTradeAreaRadiusMiles } from "../../shared/search-config";
import {
  filterDirectCompetitors,
  buildInitialScanInsight,
} from "../concept-utils";
import { fetchNearbyRestaurants } from "../places-search";
import { runLLMAnalysis } from "./analysis-llm";

const conceptInputSchema = z.object({
  serviceModel: z.enum([
    "fast_casual", "qsr", "full_service", "ghost_kitchen", "cafe", "bar_grill", "explore",
  ]),
  cuisineConcept: z.string(),
  priceTier: z.string().optional(),
  mode: z.enum(["specific", "explore"]),
});

function isSpecificConcept(concept?: ConceptInput): boolean {
  return Boolean(concept && concept.mode === "specific" && concept.serviceModel !== "explore");
}

// ---- Helpers ----

function priceLevelLabel(level: number | null | undefined): string {
  if (level === null || level === undefined) return "N/A";
  const labels = ["Free", "$", "$$", "$$$", "$$$$"];
  return labels[level] ?? "N/A";
}

async function fetchPlaceReviews(placeIds: string[]): Promise<string[]> {
  const allReviews: string[] = [];

  // Fetch reviews for top 5 competitors
  const topIds = placeIds.slice(0, 5);

  for (const placeId of topIds) {
    try {
      const result = await makeRequest<PlaceDetailsResult>(
        "/maps/api/place/details/json",
        { place_id: placeId, fields: "reviews" }
      );

      if (result.status === "OK" && result.result?.reviews) {
        for (const review of result.result.reviews) {
          if (review.text) {
            allReviews.push(review.text);
          }
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch reviews for ${placeId}:`, e);
    }
  }

  return allReviews;
}

function generateEquipmentBundles(concepts: WinningConcept[]): EquipmentBundle[] {
  type ItemDef = Omit<EquipmentBundle["items"][number], "horecaStoreUrl">;
  const item = (def: ItemDef): EquipmentBundle["items"][number] => ({
    ...def,
    horecaStoreUrl: equipmentUrlForCategory(def.category),
  });

  const equipmentByType: Record<string, EquipmentBundle["items"]> = {
    Pizza: [
      item({ name: "Commercial Pizza Oven", category: "Cooking", description: "High-temperature deck or conveyor pizza oven", estimatedPrice: "$3,000 - $15,000" }),
      item({ name: "Pizza Prep Table", category: "Prep", description: "Refrigerated pizza prep station with ingredient rail", estimatedPrice: "$1,500 - $4,000" }),
      item({ name: "Dough Mixer", category: "Prep", description: "Commercial spiral or planetary mixer for dough", estimatedPrice: "$800 - $3,000" }),
      item({ name: "Pizza Display Case", category: "Display", description: "Heated pizza display for grab-and-go", estimatedPrice: "$500 - $2,000" }),
    ],
    Sushi: [
      item({ name: "Sushi Display Case", category: "Display", description: "Refrigerated sushi display counter", estimatedPrice: "$2,000 - $6,000" }),
      item({ name: "Rice Cooker (Commercial)", category: "Cooking", description: "Large-capacity commercial rice cooker", estimatedPrice: "$300 - $1,500" }),
      item({ name: "Prep Refrigeration Unit", category: "Refrigeration", description: "Under-counter refrigeration for fresh fish", estimatedPrice: "$1,500 - $4,000" }),
    ],
    Burgers: [
      item({ name: "Commercial Griddle", category: "Cooking", description: "Flat-top griddle for smash burgers and patties", estimatedPrice: "$1,000 - $4,000" }),
      item({ name: "Deep Fryer", category: "Cooking", description: "Commercial deep fryer for fries and sides", estimatedPrice: "$500 - $3,000" }),
      item({ name: "Charbroiler", category: "Cooking", description: "Gas or electric charbroiler for flame-grilled burgers", estimatedPrice: "$1,000 - $5,000" }),
    ],
    "Fast Food": [
      item({ name: "Speed Oven", category: "Cooking", description: "Rapid-cook oven for quick service", estimatedPrice: "$3,000 - $8,000" }),
      item({ name: "Holding Cabinet", category: "Storage", description: "Hot holding cabinet for prepared items", estimatedPrice: "$1,000 - $3,000" }),
      item({ name: "Deep Fryer", category: "Cooking", description: "High-volume commercial fryer", estimatedPrice: "$500 - $3,000" }),
    ],
    Cafe: [
      item({ name: "Espresso Machine", category: "Beverage", description: "Commercial espresso machine with grinder", estimatedPrice: "$2,000 - $15,000" }),
      item({ name: "Pastry Display Case", category: "Display", description: "Refrigerated or ambient pastry display", estimatedPrice: "$800 - $3,000" }),
      item({ name: "Blender Station", category: "Beverage", description: "Commercial blender for smoothies and frappes", estimatedPrice: "$200 - $800" }),
    ],
    Mexican: [
      item({ name: "Tortilla Press/Warmer", category: "Cooking", description: "Commercial tortilla press and warmer", estimatedPrice: "$300 - $1,500" }),
      item({ name: "Steam Table", category: "Holding", description: "Multi-well steam table for toppings and fillings", estimatedPrice: "$500 - $2,000" }),
      item({ name: "Commercial Griddle", category: "Cooking", description: "Flat-top griddle for quesadillas and fajitas", estimatedPrice: "$1,000 - $4,000" }),
    ],
    Mediterranean: [
      item({ name: "Shawarma Machine", category: "Cooking", description: "Vertical rotisserie for shawarma/gyros", estimatedPrice: "$500 - $3,000" }),
      item({ name: "Flatbread Oven", category: "Cooking", description: "High-heat oven for pita and flatbreads", estimatedPrice: "$2,000 - $8,000" }),
      item({ name: "Salad Prep Station", category: "Prep", description: "Refrigerated prep table for salads and mezze", estimatedPrice: "$1,500 - $4,000" }),
    ],
    Healthy: [
      item({ name: "Commercial Blender", category: "Beverage", description: "High-powered blender for smoothies and bowls", estimatedPrice: "$200 - $800" }),
      item({ name: "Salad Prep Station", category: "Prep", description: "Refrigerated prep table for fresh ingredients", estimatedPrice: "$1,500 - $4,000" }),
      item({ name: "Juice Extractor", category: "Beverage", description: "Commercial cold-press juicer", estimatedPrice: "$500 - $3,000" }),
    ],
    default: [
      item({ name: "Commercial Range", category: "Cooking", description: "6-burner gas range with oven", estimatedPrice: "$2,000 - $8,000" }),
      item({ name: "Walk-in Cooler", category: "Refrigeration", description: "Walk-in refrigeration unit", estimatedPrice: "$3,000 - $10,000" }),
      item({ name: "Prep Table", category: "Prep", description: "Stainless steel prep table with undershelf", estimatedPrice: "$300 - $1,500" }),
      item({ name: "Commercial Dishwasher", category: "Warewashing", description: "High-temp commercial dishwasher", estimatedPrice: "$2,000 - $8,000" }),
      item({ name: "Ventilation Hood", category: "Ventilation", description: "Commercial kitchen exhaust hood system", estimatedPrice: "$1,500 - $5,000" }),
    ],
  };

  return concepts.map(concept => {
    const cuisineKey = Object.keys(equipmentByType).find(
      key => key !== "default" && (
        concept.cuisineType.toLowerCase().includes(key.toLowerCase()) ||
        concept.name.toLowerCase().includes(key.toLowerCase())
      )
    );

    const specificItems = equipmentByType[cuisineKey || ""] || [];
    const defaultItems = equipmentByType.default;
    const items = [...specificItems, ...defaultItems.slice(0, Math.max(0, 5 - specificItems.length))];

    return {
      conceptName: concept.name,
      items,
      totalEstimate: "Contact Horeca Store for custom bundle pricing",
      ctaText: `Shop ${concept.name} Equipment at Horeca Store`,
      ctaUrl: shopUrlForConcept(concept.name, concept.cuisineType),
    };
  });
}

// ---- Router ----

export const analysisRouter = router({
  /** Autocomplete - proxy through server to use correct API key */
  autocomplete: publicProcedure
    .input(z.object({ input: z.string().min(2) }))
    .query(async ({ input: { input: query } }) => {
      const result = await makeRequest<{
        predictions: Array<{ description: string; place_id: string }>;
        status: string;
      }>("/maps/api/place/autocomplete/json", {
        input: query,
        types: "address",
      });

      return (result.predictions || []).slice(0, 8).map(p => ({
        description: p.description,
        placeId: p.place_id,
      }));
    }),

  /** Geocode a place by its place_id */
  geocode: publicProcedure
    .input(z.object({ placeId: z.string() }))
    .query(async ({ input }) => {
      const result = await makeRequest<{
        results: Array<{
          geometry: { location: { lat: number; lng: number } };
          formatted_address: string;
        }>;
        status: string;
      }>("/maps/api/geocode/json", {
        place_id: input.placeId,
      });

      if (result.status === "OK" && result.results?.[0]) {
        return {
          address: result.results[0].formatted_address,
          lat: result.results[0].geometry.location.lat,
          lng: result.results[0].geometry.location.lng,
        };
      }
      return null;
    }),

  /** Quick scan - returns preview data before lead wall */
  initialScan: publicProcedure
    .input(z.object({
      address: z.string().min(1),
      lat: z.number(),
      lng: z.number(),
      concept: conceptInputSchema.optional(),
    }))
    .mutation(async ({ input }) => {
      const concept = input.concept;
      const competitors = await fetchNearbyRestaurants(input.lat, input.lng, concept);
      const directCompetitors = concept && isSpecificConcept(concept)
        ? filterDirectCompetitors(competitors, concept.cuisineConcept)
        : [];

      const cuisineCounts: Record<string, number> = {};
      for (const c of competitors) {
        cuisineCounts[c.cuisine] = (cuisineCounts[c.cuisine] || 0) + 1;
      }

      const topCuisines = Object.entries(cuisineCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([c]) => c);

      const avgRating = competitors.length > 0
        ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
        : 0;

      const scan: InitialScan = {
        address: input.address,
        lat: input.lat,
        lng: input.lng,
        competitorCount: competitors.length,
        directCompetitorCount: directCompetitors.length,
        topCuisines,
        averageRating: Math.round(avgRating * 10) / 10,
        previewInsight: concept
          ? buildInitialScanInsight(competitors.length, directCompetitors.length, concept)
          : competitors.length > 15
          ? "This is a high-density restaurant area. A lot of competition, but that also means real foot traffic. Your full report will show whether there is room for you to win here."
          : competitors.length > 8
          ? "Moderate restaurant activity at this location. There may be room to succeed here depending on your concept. Your full report will tell you exactly where the opportunity is."
          : "Low restaurant activity near this address. That could mean a wide open opportunity or a sign that demand is not there. Your full report will tell you which.",
        conceptLabel: concept ? formatConceptLabel(concept) : undefined,
        searchRadiusMiles: getTradeAreaRadiusMiles(concept?.serviceModel),
      };

      return scan;
    }),

  /** Full analysis - requires lead capture first */
  fullReport: publicProcedure
    .input(z.object({
      address: z.string().min(1),
      lat: z.number(),
      lng: z.number(),
      leadId: z.number(),
      concept: conceptInputSchema.optional(),
    }))
    .mutation(async ({ input }) => {
      const concept = input.concept;
      const competitors = await fetchNearbyRestaurants(input.lat, input.lng, concept);
      const directCompetitors = concept && isSpecificConcept(concept)
        ? filterDirectCompetitors(competitors, concept.cuisineConcept)
        : [];

      const reviewSource = directCompetitors.length > 0 ? directCompetitors : competitors;
      const placeIds = reviewSource.slice(0, 5).map(c => c.placeId);
      const reviews = await fetchPlaceReviews(placeIds);

      const analysis = await runLLMAnalysis(
        input.address,
        competitors,
        reviews,
        concept,
        directCompetitors,
        getTradeAreaRadiusMiles(concept?.serviceModel)
      );

      let equipmentBundles = generateEquipmentBundles(analysis.concepts);
      if (concept && isSpecificConcept(concept)) {
        const userBundle = generateEquipmentBundles([{
          name: concept.cuisineConcept,
          cuisineType: concept.cuisineConcept,
          description: "",
          menuIdeas: [],
          targetAudience: "",
          estimatedInvestment: "",
          riskScore: 5,
          reasoning: "",
          menuMarketFit: {
            demandScore: analysis.conceptFit?.fitScore ?? 5,
            demandExplanation: "",
            populationMatch: "",
            searchDemandSignals: "",
            competitiveAdvantage: "",
          },
        }]);
        equipmentBundles = [...userBundle, ...equipmentBundles.slice(0, 2)];
      }

      const report: FullReport = {
        address: input.address,
        lat: input.lat,
        lng: input.lng,
        competitors,
        directCompetitors: directCompetitors.length ? directCompetitors : undefined,
        marketAnalysis: analysis.marketAnalysis,
        concepts: analysis.concepts,
        equipmentBundles,
        opportunityScore: analysis.opportunityScore,
        recommendation: analysis.recommendation,
        conceptInput: concept,
        conceptFit: analysis.conceptFit,
        searchRadiusMiles: getTradeAreaRadiusMiles(concept?.serviceModel),
      };

      // Save report to database
      try {
        await createReport({
          leadId: input.leadId,
          address: input.address,
          lat: String(input.lat),
          lng: String(input.lng),
          competitors: competitors as any,
          marketAnalysis: analysis.marketAnalysis as any,
          concepts: analysis.concepts as any,
          equipmentList: equipmentBundles as any,
          opportunityScore: analysis.opportunityScore,
          recommendation: analysis.recommendation,
        });
      } catch (e) {
        console.error("Failed to save report:", e);
      }

      return report;
    }),
});
