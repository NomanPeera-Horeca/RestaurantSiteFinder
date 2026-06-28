import type { FullReport } from "../shared/analysis-types";

/** Realistic preview fixture — Houston Bissonnet / BBQ concept (matches live demo data). */
export const PREVIEW_REPORT: FullReport = {
  address: "8800 Bissonnet St, Houston, TX 77074, USA",
  lat: 29.6770919,
  lng: -95.5311259,
  searchRadiusMiles: 5,
  competitorsCapped: true,
  opportunityScore: 4,
  recommendation: "CAUTION",
  conceptInput: {
    serviceModel: "full_service",
    cuisineConcept: "BBQ",
    priceTier: "$$",
  },
  conceptFit: {
    userConceptSummary: "Full-service BBQ restaurant at mid-tier pricing",
    fitScore: 3,
    recommendation: "NO-GO",
    summary:
      "This trade area is saturated with American, BBQ, and general dining concepts. Review patterns show strong loyalty to established competitors rather than openness to a new BBQ entrant.",
    competitiveVerdict:
      "15 direct-style rivals within 5 miles including established smokehouse and grill concepts. Korean BBQ and traditional Texas BBQ both show strong existing demand captured by incumbents.",
    whyItWorksOrFails:
      "A new BBQ concept would need a clear daypart or cuisine angle (e.g., fast lunch vs. premium dinner) that is not already served within 1 mile. Without lease concessions or a differentiated format, break-even covers are difficult to achieve against incumbents averaging 4.3★.",
    directCompetitorCount: 15,
    alternativeConcepts: [
      {
        name: "Fast-Casual Mediterranean Bowl Bar",
        serviceModel: "fast_casual",
        cuisineType: "Mediterranean",
        whyBetter: "Underserved category with only 2 mapped competitors; lunch daypart gap near office corridors.",
        fitScore: 7,
      },
      {
        name: "Specialty Coffee + All-Day Breakfast",
        serviceModel: "cafe",
        cuisineType: "Cafe / Breakfast",
        whyBetter: "Morning daypart under-served; lower capex than full-service BBQ; aligns with commuter traffic patterns.",
        fitScore: 6,
      },
    ],
    alternativeLocationGuidance:
      "If BBQ remains your concept, consider trade areas with fewer than 8 mapped smokehouse/grill competitors and median household income aligned with $$ pricing — west Houston suburbs show lower saturation in our database.",
  },
  directCompetitors: [],
  competitors: Array.from({ length: 60 }, (_, i) => ({
    placeId: `preview-${i}`,
    name: [
      "Pappas Bar-B-Q",
      "Casa Honduras",
      "Arby's",
      "Apple Restaurant",
      "Golden Seafood",
      "Taqueria Arandas",
      "Church's Chicken",
      "Lucky's Pub",
      "Korean Garden",
      "Smokey River BBQ",
    ][i % 10] + (i >= 10 ? ` #${i}` : ""),
    cuisine: ["BBQ", "Latin American", "American / Burger", "Seafood", "Mexican", "Chicken", "Bar & Grill", "Korean", "BBQ", "American"][i % 10],
    rating: 3.2 + (i % 8) * 0.15,
    userRatingsTotal: 80 + i * 47,
    priceLevel: 2,
    address: "Houston, TX",
    lat: 29.677 + (i % 5) * 0.012,
    lng: -95.531 - (i % 7) * 0.009,
    conceptLabel: ["Full Service · BBQ ($$)", "Full Service · Latin ($)", "QSR · Burger ($)", "Full Service · Seafood ($$)"][i % 4],
  })),
  marketAnalysis: {
    saturatedCuisines: ["American / General", "BBQ", "Mexican", "Chicken / QSR"],
    underservedCuisines: ["Mediterranean", "Vietnamese", "Specialty Coffee"],
    demographics:
      "Trade area skews diverse suburban residential with mixed commercial corridors. Median household income approx. $52,000–$58,000. Daytime population boosted by retail and medical office clusters within 1.5 miles. Evening dining demand concentrated Fri–Sun.",
    footTraffic:
      "Primary vehicle traffic on Bissonnet corridor; limited walk-up lunch without dedicated parking. Peak dining windows 11:30am–1:30pm and 6:00–9:00pm. Weekend brunch window shows moderate opportunity if parking is accessible.",
    reviewSentiment: {
      patterns: [
        "Service speed is the most cited complaint across mid-tier competitors — opportunity for operators who prioritize ticket time.",
        "Portion value drives repeat visits; price-sensitive diners dominate review praise.",
        "Parking and wait times spike negative reviews on weekends.",
      ],
      topComplaints: ["Slow service", "Inconsistent food quality", "Long wait times", "Parking difficulty"],
      topPraises: ["Generous portions", "Friendly staff", "Good value for money", "Family-friendly atmosphere"],
    },
  },
  concepts: [
    {
      name: "Fast-Casual Mediterranean Bowl Bar",
      description:
        "Counter-service Mediterranean bowls, wraps, and salads targeting lunch commuters and health-conscious families. Lower labor cost than full service with strong margin on bowls.",
      cuisineType: "Mediterranean",
      menuIdeas: ["Chicken shawarma bowl", "Falafel platter", "Lamb gyro wrap", "Greek salad", "Hummus mezze box"],
      targetAudience: "Office workers, families, health-conscious diners 25–45",
      estimatedInvestment: "$185,000 – $260,000",
      riskScore: 4,
      reasoning: "Only 2 Mediterranean concepts mapped within 5 miles. Lunch daypart gap with limited fast-casual options.",
      menuMarketFit: {
        demandScore: 7,
        demandExplanation: "Review patterns show growing demand for lighter, customizable lunch options not served by incumbent BBQ and burger concepts.",
        populationMatch: "Diverse suburban demographic aligns with Mediterranean flavor profiles.",
        searchDemandSignals: "Rising interest in bowl-format and halal-friendly options in SW Houston.",
        competitiveAdvantage: "Speed of service vs. full-service incumbents; menu not replicated within 1 mile.",
      },
    },
    {
      name: "Specialty Coffee + All-Day Breakfast",
      description:
        "Third-wave coffee with all-day breakfast plates, targeting morning commuters and remote workers seeking a daytime hangout.",
      cuisineType: "Cafe / Breakfast",
      menuIdeas: ["Avocado toast", "Breakfast tacos", "Pour-over coffee", "Acai bowl", "Pastry case"],
      targetAudience: "Commuters, remote workers, weekend brunch crowd",
      estimatedInvestment: "$120,000 – $175,000",
      riskScore: 5,
      reasoning: "Morning daypart underserved relative to dinner saturation. Lower rent-to-revenue threshold than full-service BBQ.",
      menuMarketFit: {
        demandScore: 6,
        demandExplanation: "Limited specialty coffee within immediate trade area; breakfast/brunch reviews cite drive-time to alternatives.",
        populationMatch: "Mixed residential + commercial supports morning and midday traffic.",
        searchDemandSignals: "Consistent brunch search interest; few dedicated breakfast concepts mapped.",
        competitiveAdvantage: "Captures daypart competitors ignore; lower capex and labor vs. dinner-focused BBQ.",
      },
    },
    {
      name: "Family-Style Tex-Mex Grill",
      description:
        "Casual Tex-Mex with strong margarita program and kid-friendly menu — leverages existing regional preference without head-to-head BBQ competition.",
      cuisineType: "Tex-Mex",
      menuIdeas: ["Fajita platters", "Enchiladas", "Queso fundido", "Margarita flights", "Kids combo meals"],
      targetAudience: "Families, date-night couples, group dining",
      estimatedInvestment: "$220,000 – $310,000",
      riskScore: 6,
      reasoning: "Mexican is present but fragmented; opportunity for a polished family format with consistent execution.",
      menuMarketFit: {
        demandScore: 5,
        demandExplanation: "Moderate demand — category exists but quality gaps in reviews create opening for elevated execution.",
        populationMatch: "Strong regional affinity for Tex-Mex in Houston trade areas.",
        searchDemandSignals: "Group dining and margarita-related praise in competitor reviews.",
        competitiveAdvantage: "Differentiates from BBQ saturation while staying within familiar flavor preferences.",
      },
    },
  ],
  equipmentBundles: [
    {
      conceptName: "Full-Service BBQ",
      totalEstimate: "$285,000 – $420,000",
      ctaText: "View equipment packages",
      ctaUrl: "https://thehorecastore.com",
      items: [
        { name: "Commercial Smoker / Pit", category: "cooking", description: "", estimatedPrice: "$18,000", horecaStoreUrl: "" },
        { name: "Commercial Range (6-burner)", category: "cooking", description: "", estimatedPrice: "$8,500", horecaStoreUrl: "" },
        { name: "Walk-in Cooler", category: "refrigeration", description: "", estimatedPrice: "$12,000", horecaStoreUrl: "" },
        { name: "Walk-in Freezer", category: "refrigeration", description: "", estimatedPrice: "$9,500", horecaStoreUrl: "" },
        { name: "Prep Table ( refrigerated )", category: "prep", description: "", estimatedPrice: "$3,200", horecaStoreUrl: "" },
        { name: "Type-I Ventilation Hood", category: "ventilation", description: "", estimatedPrice: "$14,000", horecaStoreUrl: "" },
        { name: "Commercial Dishwasher", category: "warewashing", description: "", estimatedPrice: "$6,800", horecaStoreUrl: "" },
        { name: "POS System (2 terminals)", category: "technology", description: "", estimatedPrice: "$4,500", horecaStoreUrl: "" },
      ],
    },
  ],
};
