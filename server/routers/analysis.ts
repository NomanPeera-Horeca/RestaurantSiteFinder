import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "../_core/map";
import { invokeLLM } from "../_core/llm";
import { createReport } from "../db";
import type {
  Competitor,
  MarketAnalysis,
  WinningConcept,
  EquipmentBundle,
  FullReport,
  InitialScan,
} from "../../shared/analysis-types";

// ---- Helpers ----

function extractCuisine(types: string[], name: string): string {
  const cuisineMap: Record<string, string> = {
    chinese_restaurant: "Chinese",
    japanese_restaurant: "Japanese",
    italian_restaurant: "Italian",
    mexican_restaurant: "Mexican",
    indian_restaurant: "Indian",
    thai_restaurant: "Thai",
    french_restaurant: "French",
    korean_restaurant: "Korean",
    vietnamese_restaurant: "Vietnamese",
    mediterranean_restaurant: "Mediterranean",
    american_restaurant: "American",
    pizza_restaurant: "Pizza",
    seafood_restaurant: "Seafood",
    steak_house: "Steakhouse",
    sushi_restaurant: "Sushi",
    burger_restaurant: "Burgers",
    cafe: "Cafe",
    bakery: "Bakery",
    bar: "Bar & Grill",
    fast_food_restaurant: "Fast Food",
  };

  for (const type of types) {
    if (cuisineMap[type]) return cuisineMap[type];
  }

  // Try to infer from name
  const nameLower = name.toLowerCase();
  const nameHints: Record<string, string> = {
    pizza: "Pizza", sushi: "Sushi", burger: "Burgers", taco: "Mexican",
    thai: "Thai", chinese: "Chinese", indian: "Indian", italian: "Italian",
    bbq: "BBQ", barbecue: "BBQ", ramen: "Japanese", pho: "Vietnamese",
    mediterranean: "Mediterranean", greek: "Greek", korean: "Korean",
    seafood: "Seafood", steak: "Steakhouse", cafe: "Cafe", coffee: "Cafe",
    bakery: "Bakery", deli: "Deli", sandwich: "Sandwiches",
  };

  for (const [hint, cuisine] of Object.entries(nameHints)) {
    if (nameLower.includes(hint)) return cuisine;
  }

  return "Restaurant";
}

function priceLevelLabel(level: number | null | undefined): string {
  if (level === null || level === undefined) return "N/A";
  const labels = ["Free", "$", "$$", "$$$", "$$$$"];
  return labels[level] ?? "N/A";
}

async function fetchNearbyRestaurants(lat: number, lng: number): Promise<Competitor[]> {
  const location = `${lat},${lng}`;

  const result = await makeRequest<PlacesSearchResult>(
    "/maps/api/place/nearbysearch/json",
    { location, radius: 1500, type: "restaurant", keyword: "restaurant" }
  );

  if (result.status !== "OK" || !result.results) {
    return [];
  }

  return result.results.slice(0, 20).map(place => ({
    placeId: place.place_id,
    name: place.name,
    cuisine: extractCuisine(place.types, place.name),
    rating: place.rating ?? 0,
    userRatingsTotal: place.user_ratings_total ?? 0,
    priceLevel: (place as any).price_level ?? null,
    address: place.formatted_address,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }));
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

async function runLLMAnalysis(
  address: string,
  competitors: Competitor[],
  reviews: string[]
): Promise<{
  marketAnalysis: MarketAnalysis;
  concepts: WinningConcept[];
  opportunityScore: number;
  recommendation: "GO" | "NO-GO" | "CAUTION";
}> {
  const competitorSummary = competitors.map(c =>
    `- ${c.name} (${c.cuisine}, Rating: ${c.rating}, Price: ${priceLevelLabel(c.priceLevel)}, Reviews: ${c.userRatingsTotal})`
  ).join("\n");

  const cuisineCounts: Record<string, number> = {};
  for (const c of competitors) {
    cuisineCounts[c.cuisine] = (cuisineCounts[c.cuisine] || 0) + 1;
  }

  const reviewSample = reviews.slice(0, 30).join("\n---\n");

  const prompt = `You are an expert restaurant market analyst. Analyze this location for a potential new restaurant.

LOCATION: ${address}

NEARBY COMPETITORS (within 1.5km radius):
${competitorSummary}

CUISINE DISTRIBUTION:
${Object.entries(cuisineCounts).map(([c, n]) => `${c}: ${n} restaurants`).join("\n")}

SAMPLE REVIEWS FROM COMPETITORS:
${reviewSample || "No reviews available"}

IMPORTANT: For each winning concept you suggest, you MUST include a "menuMarketFit" analysis. This is critical. Do NOT just suggest a cuisine because it is underserved. You must also analyze whether the local population actually WANTS that cuisine. Consider:
- The ethnic and demographic composition of the neighborhood (e.g., if an area is predominantly Asian, a Mexican restaurant may struggle even if there are no Mexican restaurants nearby)
- Whether people in this area actively search for or travel to eat this cuisine type
- The cultural dining preferences of the local population
- Whether the suggested menu items match what locals actually want to eat
- Real demand signals from reviews, nearby business types, and population patterns

A cuisine being "underserved" does NOT automatically mean there is demand for it. An area might have zero Ethiopian restaurants because nobody in that neighborhood wants Ethiopian food, not because it is an opportunity.

Provide a comprehensive analysis in the following JSON structure. Be specific, data-driven, and actionable.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a restaurant market analyst. Return only valid JSON matching the schema." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "restaurant_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            saturatedCuisines: {
              type: "array",
              items: { type: "string" },
              description: "Cuisines that are oversaturated in this area (3+ restaurants)"
            },
            underservedCuisines: {
              type: "array",
              items: { type: "string" },
              description: "Cuisine types that are missing or underrepresented"
            },
            topComplaints: {
              type: "array",
              items: { type: "string" },
              description: "Top 5 customer complaints extracted from reviews"
            },
            topPraises: {
              type: "array",
              items: { type: "string" },
              description: "Top 3 things customers praise in reviews"
            },
            sentimentPatterns: {
              type: "array",
              items: { type: "string" },
              description: "Key sentiment patterns and market signals"
            },
            demographics: {
              type: "string",
              description: "Inferred demographic profile of the area"
            },
            footTraffic: {
              type: "string",
              description: "Assessment of foot traffic potential"
            },
            concepts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  cuisineType: { type: "string" },
                  menuIdeas: { type: "array", items: { type: "string" } },
                  targetAudience: { type: "string" },
                  estimatedInvestment: { type: "string" },
                  riskScore: { type: "number" },
                  reasoning: { type: "string" },
                  menuMarketFit: {
                    type: "object",
                    properties: {
                      demandScore: { type: "number", description: "1-10 score of how much actual demand exists for this cuisine in this specific area. 1 = no demand, 10 = very high demand. Consider demographics, population composition, and dining preferences." },
                      demandExplanation: { type: "string", description: "2-3 sentences explaining WHY this cuisine does or does not fit the local market demand. Reference specific demographic or cultural factors." },
                      populationMatch: { type: "string", description: "How the local population demographics align with this cuisine. E.g., 'This area has a large South Asian population that regularly seeks authentic Indian cuisine' or 'The predominantly college-age population drives demand for affordable fast-casual options'." },
                      searchDemandSignals: { type: "string", description: "Evidence that people in this area actively look for this type of food. Consider: nearby grocery stores selling related ingredients, cultural centers, community demographics, review mentions of wanting this cuisine type." },
                      competitiveAdvantage: { type: "string", description: "What specific advantage this concept has in this market given the local demand patterns." },
                    },
                    required: ["demandScore", "demandExplanation", "populationMatch", "searchDemandSignals", "competitiveAdvantage"],
                    additionalProperties: false,
                  },
                },
                required: ["name", "description", "cuisineType", "menuIdeas", "targetAudience", "estimatedInvestment", "riskScore", "reasoning", "menuMarketFit"],
                additionalProperties: false,
              },
              description: "Exactly 3 winning restaurant concepts. Each MUST include menuMarketFit analysis."
            },
            opportunityScore: {
              type: "number",
              description: "Overall opportunity score from 1-10"
            },
            recommendation: {
              type: "string",
              enum: ["GO", "NO-GO", "CAUTION"],
              description: "Final recommendation"
            },
          },
          required: [
            "saturatedCuisines", "underservedCuisines", "topComplaints",
            "topPraises", "sentimentPatterns", "demographics", "footTraffic",
            "concepts", "opportunityScore", "recommendation"
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  const parsed = JSON.parse(typeof content === "string" ? content : "{}");

  return {
    marketAnalysis: {
      saturatedCuisines: parsed.saturatedCuisines || [],
      underservedCuisines: parsed.underservedCuisines || [],
      reviewSentiment: {
        topComplaints: parsed.topComplaints || [],
        topPraises: parsed.topPraises || [],
        patterns: parsed.sentimentPatterns || [],
      },
      demographics: parsed.demographics || "",
      footTraffic: parsed.footTraffic || "",
    },
    concepts: (parsed.concepts || []).slice(0, 3),
    opportunityScore: parsed.opportunityScore || 5,
    recommendation: parsed.recommendation || "CAUTION",
  };
}

function generateEquipmentBundles(concepts: WinningConcept[]): EquipmentBundle[] {
  const HORECA_BASE = "https://www.thehorecastore.com";

  const equipmentByType: Record<string, EquipmentBundle["items"]> = {
    Pizza: [
      { name: "Commercial Pizza Oven", category: "Cooking", description: "High-temperature deck or conveyor pizza oven", estimatedPrice: "$3,000 - $15,000", horecaStoreUrl: `${HORECA_BASE}/collections/pizza-ovens` },
      { name: "Pizza Prep Table", category: "Prep", description: "Refrigerated pizza prep station with ingredient rail", estimatedPrice: "$1,500 - $4,000", horecaStoreUrl: `${HORECA_BASE}/collections/prep-tables` },
      { name: "Dough Mixer", category: "Prep", description: "Commercial spiral or planetary mixer for dough", estimatedPrice: "$800 - $3,000", horecaStoreUrl: `${HORECA_BASE}/collections/mixers` },
      { name: "Pizza Display Case", category: "Display", description: "Heated pizza display for grab-and-go", estimatedPrice: "$500 - $2,000", horecaStoreUrl: `${HORECA_BASE}/collections/display-cases` },
    ],
    Sushi: [
      { name: "Sushi Display Case", category: "Display", description: "Refrigerated sushi display counter", estimatedPrice: "$2,000 - $6,000", horecaStoreUrl: `${HORECA_BASE}/collections/display-cases` },
      { name: "Rice Cooker (Commercial)", category: "Cooking", description: "Large-capacity commercial rice cooker", estimatedPrice: "$300 - $1,500", horecaStoreUrl: `${HORECA_BASE}/collections/rice-cookers` },
      { name: "Prep Refrigeration Unit", category: "Refrigeration", description: "Under-counter refrigeration for fresh fish", estimatedPrice: "$1,500 - $4,000", horecaStoreUrl: `${HORECA_BASE}/collections/refrigeration` },
    ],
    Burgers: [
      { name: "Commercial Griddle", category: "Cooking", description: "Flat-top griddle for smash burgers and patties", estimatedPrice: "$1,000 - $4,000", horecaStoreUrl: `${HORECA_BASE}/collections/griddles` },
      { name: "Deep Fryer", category: "Cooking", description: "Commercial deep fryer for fries and sides", estimatedPrice: "$500 - $3,000", horecaStoreUrl: `${HORECA_BASE}/collections/fryers` },
      { name: "Charbroiler", category: "Cooking", description: "Gas or electric charbroiler for flame-grilled burgers", estimatedPrice: "$1,000 - $5,000", horecaStoreUrl: `${HORECA_BASE}/collections/charbroilers` },
    ],
    "Fast Food": [
      { name: "Speed Oven", category: "Cooking", description: "Rapid-cook oven for quick service", estimatedPrice: "$3,000 - $8,000", horecaStoreUrl: `${HORECA_BASE}/collections/ovens` },
      { name: "Holding Cabinet", category: "Storage", description: "Hot holding cabinet for prepared items", estimatedPrice: "$1,000 - $3,000", horecaStoreUrl: `${HORECA_BASE}/collections/holding-cabinets` },
      { name: "Deep Fryer", category: "Cooking", description: "High-volume commercial fryer", estimatedPrice: "$500 - $3,000", horecaStoreUrl: `${HORECA_BASE}/collections/fryers` },
    ],
    Cafe: [
      { name: "Espresso Machine", category: "Beverage", description: "Commercial espresso machine with grinder", estimatedPrice: "$2,000 - $15,000", horecaStoreUrl: `${HORECA_BASE}/collections/espresso-machines` },
      { name: "Pastry Display Case", category: "Display", description: "Refrigerated or ambient pastry display", estimatedPrice: "$800 - $3,000", horecaStoreUrl: `${HORECA_BASE}/collections/display-cases` },
      { name: "Blender Station", category: "Beverage", description: "Commercial blender for smoothies and frappes", estimatedPrice: "$200 - $800", horecaStoreUrl: `${HORECA_BASE}/collections/blenders` },
    ],
    Mexican: [
      { name: "Tortilla Press/Warmer", category: "Cooking", description: "Commercial tortilla press and warmer", estimatedPrice: "$300 - $1,500", horecaStoreUrl: `${HORECA_BASE}/collections/cooking-equipment` },
      { name: "Steam Table", category: "Holding", description: "Multi-well steam table for toppings and fillings", estimatedPrice: "$500 - $2,000", horecaStoreUrl: `${HORECA_BASE}/collections/steam-tables` },
      { name: "Commercial Griddle", category: "Cooking", description: "Flat-top griddle for quesadillas and fajitas", estimatedPrice: "$1,000 - $4,000", horecaStoreUrl: `${HORECA_BASE}/collections/griddles` },
    ],
    Mediterranean: [
      { name: "Shawarma Machine", category: "Cooking", description: "Vertical rotisserie for shawarma/gyros", estimatedPrice: "$500 - $3,000", horecaStoreUrl: `${HORECA_BASE}/collections/cooking-equipment` },
      { name: "Flatbread Oven", category: "Cooking", description: "High-heat oven for pita and flatbreads", estimatedPrice: "$2,000 - $8,000", horecaStoreUrl: `${HORECA_BASE}/collections/ovens` },
      { name: "Salad Prep Station", category: "Prep", description: "Refrigerated prep table for salads and mezze", estimatedPrice: "$1,500 - $4,000", horecaStoreUrl: `${HORECA_BASE}/collections/prep-tables` },
    ],
    Healthy: [
      { name: "Commercial Blender", category: "Beverage", description: "High-powered blender for smoothies and bowls", estimatedPrice: "$200 - $800", horecaStoreUrl: `${HORECA_BASE}/collections/blenders` },
      { name: "Salad Prep Station", category: "Prep", description: "Refrigerated prep table for fresh ingredients", estimatedPrice: "$1,500 - $4,000", horecaStoreUrl: `${HORECA_BASE}/collections/prep-tables` },
      { name: "Juice Extractor", category: "Beverage", description: "Commercial cold-press juicer", estimatedPrice: "$500 - $3,000", horecaStoreUrl: `${HORECA_BASE}/collections/juicers` },
    ],
    default: [
      { name: "Commercial Range", category: "Cooking", description: "6-burner gas range with oven", estimatedPrice: "$2,000 - $8,000", horecaStoreUrl: `${HORECA_BASE}/collections/ranges` },
      { name: "Walk-in Cooler", category: "Refrigeration", description: "Walk-in refrigeration unit", estimatedPrice: "$3,000 - $10,000", horecaStoreUrl: `${HORECA_BASE}/collections/refrigeration` },
      { name: "Prep Table", category: "Prep", description: "Stainless steel prep table with undershelf", estimatedPrice: "$300 - $1,500", horecaStoreUrl: `${HORECA_BASE}/collections/prep-tables` },
      { name: "Commercial Dishwasher", category: "Warewashing", description: "High-temp commercial dishwasher", estimatedPrice: "$2,000 - $8,000", horecaStoreUrl: `${HORECA_BASE}/collections/dishwashers` },
      { name: "Ventilation Hood", category: "Ventilation", description: "Commercial kitchen exhaust hood system", estimatedPrice: "$1,500 - $5,000", horecaStoreUrl: `${HORECA_BASE}/collections/ventilation` },
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
      ctaUrl: `${HORECA_BASE}/pages/contact`,
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

      return (result.predictions || []).slice(0, 5).map(p => ({
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
    }))
    .mutation(async ({ input }) => {
      const competitors = await fetchNearbyRestaurants(input.lat, input.lng);

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
        topCuisines,
        averageRating: Math.round(avgRating * 10) / 10,
        previewInsight: competitors.length > 15
          ? "High-density restaurant area. competition is fierce but foot traffic is likely strong."
          : competitors.length > 8
          ? "Moderate restaurant density. there are clear opportunities for differentiation."
          : "Low restaurant density. this could be an underserved market with first-mover advantage.",
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
    }))
    .mutation(async ({ input }) => {
      // Fetch competitors
      const competitors = await fetchNearbyRestaurants(input.lat, input.lng);

      // Fetch reviews from top competitors
      const placeIds = competitors.slice(0, 5).map(c => c.placeId);
      const reviews = await fetchPlaceReviews(placeIds);

      // Run LLM analysis
      const analysis = await runLLMAnalysis(input.address, competitors, reviews);

      // Generate equipment bundles
      const equipmentBundles = generateEquipmentBundles(analysis.concepts);

      const report: FullReport = {
        address: input.address,
        lat: input.lat,
        lng: input.lng,
        competitors,
        marketAnalysis: analysis.marketAnalysis,
        concepts: analysis.concepts,
        equipmentBundles,
        opportunityScore: analysis.opportunityScore,
        recommendation: analysis.recommendation,
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
