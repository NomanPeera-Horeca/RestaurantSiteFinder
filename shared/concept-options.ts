/** Service model options for concept-specific analysis */
export const SERVICE_MODELS = [
  { value: "fast_casual", label: "Fast Casual" },
  { value: "qsr", label: "QSR / Drive-thru" },
  { value: "full_service", label: "Full Service" },
  { value: "ghost_kitchen", label: "Ghost Kitchen / Delivery" },
  { value: "cafe", label: "Cafe / Bakery" },
  { value: "bar_grill", label: "Bar & Grill" },
  { value: "explore", label: "Not sure yet — suggest concepts for me" },
] as const;

export const CUISINE_PRESETS = [
  "Burgers",
  "Pizza",
  "Mexican",
  "Asian",
  "BBQ",
  "Healthy / Bowls",
  "Coffee / Cafe",
  "Chicken",
  "Seafood",
  "Italian",
  "Other",
] as const;

export const PRICE_TIERS = [
  { value: "$", label: "$ Budget" },
  { value: "$$", label: "$$ Mid-range" },
  { value: "$$$", label: "$$$ Premium" },
] as const;

export type ServiceModelValue = (typeof SERVICE_MODELS)[number]["value"];

export interface ConceptInput {
  serviceModel: ServiceModelValue;
  cuisineConcept: string;
  priceTier?: string;
  /** specific = user has a concept; explore = open-ended suggestions */
  mode: "specific" | "explore";
}

export function formatConceptLabel(concept: ConceptInput): string {
  if (concept.mode === "explore") return "Open concept exploration";
  const model = SERVICE_MODELS.find(m => m.value === concept.serviceModel)?.label ?? concept.serviceModel;
  const price = concept.priceTier ? ` (${concept.priceTier})` : "";
  return `${concept.cuisineConcept} — ${model}${price}`;
}

export function serviceModelLabel(value: string): string {
  return SERVICE_MODELS.find(m => m.value === value)?.label ?? value;
}

export const defaultConceptInput: ConceptInput = {
  serviceModel: "fast_casual",
  cuisineConcept: "Burgers",
  mode: "specific",
};
