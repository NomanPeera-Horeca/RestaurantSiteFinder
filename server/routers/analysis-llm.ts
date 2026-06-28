import { invokeLLM } from "../_core/llm";
import type {
  Competitor,
  MarketAnalysis,
  WinningConcept,
  ConceptFit,
} from "../../shared/analysis-types";
import type { ConceptInput } from "../../shared/concept-options";
import { buildConceptContext } from "../concept-utils";

function priceLevelLabel(level: number | null | undefined): string {
  if (level === null || level === undefined) return "N/A";
  return ["Free", "$", "$$", "$$$", "$$$$"][level] ?? "N/A";
}

const menuMarketFitSchema = {
  type: "object",
  properties: {
    demandScore: { type: "number" },
    demandExplanation: { type: "string" },
    populationMatch: { type: "string" },
    searchDemandSignals: { type: "string" },
    competitiveAdvantage: { type: "string" },
  },
  required: ["demandScore", "demandExplanation", "populationMatch", "searchDemandSignals", "competitiveAdvantage"],
  additionalProperties: false,
};

const conceptItemSchema = {
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
    menuMarketFit: menuMarketFitSchema,
  },
  required: ["name", "description", "cuisineType", "menuIdeas", "targetAudience", "estimatedInvestment", "riskScore", "reasoning", "menuMarketFit"],
  additionalProperties: false,
};

const conceptFitSchema = {
  type: "object",
  properties: {
    userConceptSummary: { type: "string", description: "One-line summary of the user's proposed concept" },
    fitScore: { type: "number", description: "1-10 score for THIS specific concept at THIS location" },
    recommendation: { type: "string", enum: ["GO", "NO-GO", "CAUTION"] },
    summary: { type: "string", description: "2-3 sentence location intelligence analysis for the user's concept" },
    competitiveVerdict: { type: "string", description: "Competitive landscape analysis for this concept type based on direct rivals nearby" },
    whyItWorksOrFails: { type: "string", description: "Detailed reasoning tied to service model and trade area" },
    alternativeConcepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          serviceModel: { type: "string" },
          cuisineType: { type: "string" },
          whyBetter: { type: "string" },
          fitScore: { type: "number" },
        },
        required: ["name", "serviceModel", "cuisineType", "whyBetter", "fitScore"],
        additionalProperties: false,
      },
      description: "Exactly 2 alternative concepts if user concept is NO-GO or CAUTION",
    },
    alternativeLocationGuidance: {
      type: "string",
      description: "Where this concept type might work better (area types, demographics, corridors—not specific addresses)",
    },
  },
  required: [
    "userConceptSummary", "fitScore", "recommendation", "summary",
    "competitiveVerdict", "whyItWorksOrFails", "alternativeConcepts", "alternativeLocationGuidance",
  ],
  additionalProperties: false,
};

function buildSchema(includeConceptFit: boolean) {
  const properties: Record<string, unknown> = {
    saturatedCuisines: { type: "array", items: { type: "string" } },
    underservedCuisines: { type: "array", items: { type: "string" } },
    topComplaints: { type: "array", items: { type: "string" } },
    topPraises: { type: "array", items: { type: "string" } },
    sentimentPatterns: { type: "array", items: { type: "string" } },
    demographics: { type: "string" },
    footTraffic: { type: "string" },
    concepts: { type: "array", items: conceptItemSchema },
    opportunityScore: { type: "number", description: "Overall location opportunity 1-10" },
    recommendation: { type: "string", enum: ["GO", "NO-GO", "CAUTION"] },
  };

  const required = [
    "saturatedCuisines", "underservedCuisines", "topComplaints", "topPraises",
    "sentimentPatterns", "demographics", "footTraffic", "concepts",
    "opportunityScore", "recommendation",
  ];

  if (includeConceptFit) {
    properties.conceptFit = conceptFitSchema;
    required.push("conceptFit");
  }

  return { type: "object", properties, required, additionalProperties: false };
}

export async function runLLMAnalysis(
  address: string,
  competitors: Competitor[],
  reviews: string[],
  concept?: ConceptInput,
  directCompetitors: Competitor[] = [],
  searchRadiusMiles = 5
): Promise<{
  marketAnalysis: MarketAnalysis;
  concepts: WinningConcept[];
  opportunityScore: number;
  recommendation: "GO" | "NO-GO" | "CAUTION";
  conceptFit?: ConceptFit;
}> {
  const specific = Boolean(concept && concept.mode === "specific" && concept.serviceModel !== "explore");

  const competitorSummary = competitors.map(c =>
    `- ${c.name} (${c.cuisine}, Rating: ${c.rating}, Price: ${priceLevelLabel(c.priceLevel)}, Reviews: ${c.userRatingsTotal})`
  ).join("\n");

  const directSummary = directCompetitors.length
    ? directCompetitors.map(c =>
        `- ${c.name} (${c.cuisine}, Rating: ${c.rating}, Price: ${priceLevelLabel(c.priceLevel)})`
      ).join("\n")
    : "None identified in nearby results";

  const cuisineCounts: Record<string, number> = {};
  for (const c of competitors) {
    cuisineCounts[c.cuisine] = (cuisineCounts[c.cuisine] || 0) + 1;
  }

  const reviewSample = reviews.slice(0, 30).join("\n---\n");
  const conceptBlock = concept ? buildConceptContext(concept) : "Suggest 3 winning concepts for this trade area.";

  const prompt = `You are an expert restaurant market analyst.

${conceptBlock}

LOCATION: ${address}

ALL NEARBY RESTAURANTS (within ${searchRadiusMiles} miles):
${competitorSummary}

DIRECT COMPETITORS FOR USER'S CONCEPT (${directCompetitors.length} found):
${directSummary}

CUISINE DISTRIBUTION:
${Object.entries(cuisineCounts).map(([c, n]) => `${c}: ${n} restaurants`).join("\n")}

SAMPLE REVIEWS FROM COMPETITORS:
${reviewSample || "No reviews available"}

RULES:
- For each winning concept, include menuMarketFit with demographic demand analysis.
- Underserved cuisine does NOT equal demand. An underserved cuisine is only an opportunity if there are positive demand signals (search volume proxies, population demographics, or complementary businesses nearby).

COMPETITOR MATCHING RULES (critical):
- Direct competitors must match the user's SERVICE MODEL and CONCEPT TYPE exactly.
  - Wings QSR is NOT a direct competitor to a Chicken Fine Dining concept.
  - Seafood casual is NOT a direct competitor to a Chicken QSR concept.
  - Match on: (1) primary protein/cuisine, (2) service model (QSR vs casual vs fine dining), (3) price tier.
  - If no true direct competitors exist, return directCompetitors as an empty list rather than approximate matches.

REVIEW SENTIMENT RULES (critical):
- topComplaints and topPraises must ONLY reflect patterns present in the SAMPLE REVIEWS provided above.
- Do NOT generate generic complaints like "high competition from existing restaurants" or "cultural diversity in cuisine preferences". Those are not review sentiments; they are market observations and belong in marketAnalysis, not review sentiment.
- If the review sample is thin or absent, return topComplaints and topPraises as short lists with a note that "review data is limited for this area".
- sentimentPatterns must be patterns observable in actual review text (e.g. "Customers praise fast service and mention lunch crowds" or "Multiple reviews note parking difficulty").

ALTERNATIVE CONCEPT RULES (critical):
- In conceptFit.alternativeConcepts, the whyBetter field must cite a specific data point from the inputs above.
  - GOOD: "Only 1 Vietnamese restaurant within 5 miles, and 3 existing Thai restaurants show 4.4+ ratings suggesting appetite for Asian cuisine at this location."
  - BAD: "Growing demand for Vietnamese food" or "Trending cuisine type."
- Never use phrases like "growing trends", "increasing popularity", or "untapped market" without a specific data reference.

DEMOGRAPHICS AND FOOT TRAFFIC RULES:
- The demographics and footTraffic fields are AI estimates inferred from competitor mix, price levels, and area type. They are NOT census data or real foot traffic counts.
- Begin the demographics field with: "AI estimate based on competitor mix: "
- Begin the footTraffic field with: "AI estimate based on area and competitor activity: "

${specific ? `- conceptFit is REQUIRED: score the USER'S specific concept first. opportunityScore/recommendation should reflect overall location; conceptFit.fitScore/recommendation is for THEIR concept only.
- If conceptFit is NO-GO or CAUTION, alternativeConcepts must suggest 2 concepts that fit THIS location better, with whyBetter citing specific competitor count or gap data from the inputs above.
- alternativeLocationGuidance must describe area TYPE or trade area characteristics where this concept would perform better (e.g. "dense office corridors, suburban family neighborhoods") rather than vague advice.` : "- Provide exactly 3 winning concepts tailored to market gaps, each with a specific data-backed reason from the competitor or review inputs."}

Be specific and cite data from the inputs above. Avoid generic conclusions that could apply to any location.`;

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
        schema: buildSchema(specific),
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  const parsed = JSON.parse(typeof content === "string" ? content : "{}");

  let conceptFit: ConceptFit | undefined;
  if (specific && parsed.conceptFit) {
    conceptFit = {
      ...parsed.conceptFit,
      directCompetitorCount: directCompetitors.length,
      alternativeConcepts: (parsed.conceptFit.alternativeConcepts || []).slice(0, 2),
    };
  }

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
    conceptFit,
  };
}
