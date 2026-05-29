/** Verified Horeca Store category URLs (not Shopify /collections paths). */
export const HORECA_EQUIPMENT_URLS = {
  equipment: "https://www.thehorecastore.com/restaurant-equipment",
  cooking: "https://www.thehorecastore.com/commercial-cooking-equipment",
  refrigeration: "https://www.thehorecastore.com/commercial-refrigeration-equipment",
} as const;

export function equipmentUrlForCategory(category: string): string {
  const key = category.toLowerCase();
  if (key.includes("refrig")) return HORECA_EQUIPMENT_URLS.refrigeration;
  if (
    key.includes("cook") ||
    key.includes("holding") ||
    key.includes("beverage") ||
    key.includes("display")
  ) {
    return HORECA_EQUIPMENT_URLS.cooking;
  }
  return HORECA_EQUIPMENT_URLS.equipment;
}

export function shopUrlForConcept(name: string, cuisineType?: string): string {
  const label = `${name} ${cuisineType ?? ""}`.toLowerCase();
  if (/cooler|refrig|freezer|ice/.test(label)) {
    return HORECA_EQUIPMENT_URLS.refrigeration;
  }
  if (/burger|pizza|grill|fry|qsr|fast food|bbq|mexican|asian|chicken|steak|bar/.test(label)) {
    return HORECA_EQUIPMENT_URLS.cooking;
  }
  return HORECA_EQUIPMENT_URLS.equipment;
}
