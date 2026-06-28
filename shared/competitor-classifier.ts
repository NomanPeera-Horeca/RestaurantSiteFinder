export interface CompetitorClassificationInput {
  name: string;
  types?: string[];
  priceLevel?: number | null;
  cuisine?: string;
  serviceModel?: string;
}

export interface CompetitorClassification {
  cuisine: string;
  serviceModel: string;
  conceptLabel: string;
}

const TYPE_CUISINE: Record<string, string> = {
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
  cafe: "Coffee / Cafe",
  bakery: "Bakery",
  bar: "Bar & Grill",
  fast_food_restaurant: "Fast Food",
  meal_delivery: "Delivery",
  meal_takeaway: "Takeout",
};

/** Ordered patterns: first match wins. */
const NAME_CUISINE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(maharaja|bhog|tandoor|biryani|masala|curry house|india|indian|punjabi|dosa|samosa)\b/i, "Indian"],
  [/\b(taqueria|teotihuac|mexican|taco|cantina|fonda|el\b|la\b.*grill|birria|pupuseria)\b/i, "Mexican"],
  [/\b(honduras|catracho|pupusa|salvador|guatemal|latin grill|arepa|colombian|cuban|caribbean)\b/i, "Latin American"],
  [/\b(confucius|dim sum|wok|szechuan|sichuan|peking|mandarin|cantonese|chinese)\b/i, "Chinese"],
  [/\b(pho|banh mi|vietnamese|viet\b)\b/i, "Vietnamese"],
  [/\b(sushi|ramen|hibachi|teriyaki|japanese|izakaya|poke)\b/i, "Japanese"],
  [/\b(korean|bibimbap|bulgogi|kbbq)\b/i, "Korean"],
  [/\b(thai\b|pad thai)\b/i, "Thai"],
  [/\b(pizza|pizzeria)\b/i, "Pizza"],
  [/\b(burger|smash\b|patty)\b/i, "Burgers"],
  [/\b(wing|wings|boba|bubble tea)\b/i, "Wings & Quick Bites"],
  [/\b(seafood|oyster|crawfish|shrimp|fish house|catfish)\b/i, "Seafood"],
  [/\b(bbq|barbecue|smokehouse|brisket)\b/i, "BBQ"],
  [/\b(steak|chophouse|prime rib)\b/i, "Steakhouse"],
  [/\b(mediterranean|greek|lebanese|falafel|shawarma|kebab|halal|middle eastern|persian|turkish)\b/i, "Mediterranean / Middle Eastern"],
  [/\b(italian|pasta|trattoria|ristorante)\b/i, "Italian"],
  [/\b(cafe|coffee|espresso|bakery|donut|doughnut|pastry|boba)\b/i, "Coffee / Cafe"],
  [/\b(sandwich|deli|sub shop|hoagie)\b/i, "Sandwiches / Deli"],
  [/\b(soul food|southern|cajun|creole)\b/i, "Southern / Cajun"],
  [/\b(vegan|vegetarian|plant.?based|salad|bowl)\b/i, "Healthy / Bowls"],
  [/\b(bistro|grill|kitchen|diner|eatery)\b/i, "American / Grill"],
];

function priceSuffix(level: number | null | undefined): string {
  if (level === null || level === undefined) return "";
  const labels = ["", "$", "$$", "$$$", "$$$$"];
  const label = labels[level];
  return label ? ` (${label})` : "";
}

export function extractCuisineFromPlace(types: string[], name: string): string {
  for (const type of types) {
    if (TYPE_CUISINE[type]) return TYPE_CUISINE[type];
  }
  for (const [pattern, label] of NAME_CUISINE_PATTERNS) {
    if (pattern.test(name)) return label;
  }
  return "American / General";
}

export function extractServiceModelFromPlace(
  types: string[],
  name: string,
  priceLevel: number | null | undefined
): string {
  const typeSet = new Set(types);
  const lower = name.toLowerCase();

  if (
    typeSet.has("cafe") ||
    typeSet.has("bakery") ||
    /\b(cafe|coffee|bakery|boba|espresso|donut|pastry)\b/i.test(name)
  ) {
    return "Cafe / Bakery";
  }

  if (
    typeSet.has("fast_food_restaurant") ||
    /\b(drive.?thru|drive.?in|express|quick|wings?|chick.?fil|whataburger|mcdonald|burger king|taco bell|panda)\b/i.test(
      name
    )
  ) {
    return "QSR / Drive-thru";
  }

  if (typeSet.has("bar") || /\b(bar & grill|sports bar|pub|tavern|cantina bar)\b/i.test(name)) {
    return "Bar & Grill";
  }

  if (
    (typeSet.has("meal_delivery") || typeSet.has("meal_takeaway")) &&
    !typeSet.has("restaurant") &&
    priceLevel !== null &&
    priceLevel !== undefined &&
    priceLevel <= 1
  ) {
    return "Ghost Kitchen / Delivery";
  }

  if (typeSet.has("meal_takeaway") && priceLevel !== null && priceLevel !== undefined && priceLevel <= 1) {
    return "Fast Casual";
  }

  if (priceLevel !== null && priceLevel !== undefined && priceLevel >= 3) {
    return "Full Service";
  }

  return "Full Service";
}

export function classifyCompetitor(input: CompetitorClassificationInput): CompetitorClassification {
  const types = input.types ?? [];
  const cuisine =
    input.cuisine && input.cuisine !== "Restaurant"
      ? input.cuisine
      : extractCuisineFromPlace(types, input.name);
  const serviceModel =
    input.serviceModel ?? extractServiceModelFromPlace(types, input.name, input.priceLevel ?? null);
  const price = priceSuffix(input.priceLevel ?? null);

  return {
    cuisine,
    serviceModel,
    conceptLabel: `${serviceModel} · ${cuisine}${price}`,
  };
}

/** Client-side enrichment when stored competitors lack classification fields. */
export function getCompetitorConceptLabel(competitor: {
  name: string;
  cuisine: string;
  priceLevel?: number | null;
  serviceModel?: string;
  conceptLabel?: string;
}): string {
  if (competitor.conceptLabel) return competitor.conceptLabel;
  return classifyCompetitor({
    name: competitor.name,
    cuisine: competitor.cuisine,
    priceLevel: competitor.priceLevel,
    serviceModel: competitor.serviceModel,
  }).conceptLabel;
}

export function proximityLabel(index: number, distanceMiles: number | null | undefined): string | null {
  if (distanceMiles == null) return null;
  if (index === 0) return "Closest";
  if (index === 1 && distanceMiles <= 1.5) return "Very close";
  if (index === 2 && distanceMiles <= 2) return "Nearby";
  return null;
}
