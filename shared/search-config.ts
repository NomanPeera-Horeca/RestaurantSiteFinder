import type { ServiceModelValue } from "./concept-options";

export const METERS_PER_MILE = 1609.344;

/**
 * Primary trade-area radius by service model (US restaurant site-selection norms).
 * Suburban fast casual / QSR typically draws from ~3–5 miles; full service wider.
 */
export const TRADE_AREA_RADIUS_MILES: Record<ServiceModelValue | "default", number> = {
  qsr: 5,
  fast_casual: 5,
  full_service: 7,
  ghost_kitchen: 8,
  cafe: 3,
  bar_grill: 6,
  explore: 5,
  default: 5,
};

export function getTradeAreaRadiusMiles(serviceModel?: ServiceModelValue): number {
  if (!serviceModel) return TRADE_AREA_RADIUS_MILES.default;
  return TRADE_AREA_RADIUS_MILES[serviceModel] ?? TRADE_AREA_RADIUS_MILES.default;
}

export function getTradeAreaRadiusMeters(serviceModel?: ServiceModelValue): number {
  return Math.round(getTradeAreaRadiusMiles(serviceModel) * METERS_PER_MILE);
}

export function formatTradeAreaLabel(serviceModel?: ServiceModelValue): string {
  const miles = getTradeAreaRadiusMiles(serviceModel);
  return `${miles}-mile trade area`;
}

export function formatMappedCount(count: number, capped?: boolean): string {
  if (capped && count >= 60) return `${count}+`;
  return String(count);
}

export function formatCompetitorAreaSubtitle(
  count: number,
  serviceModel?: ServiceModelValue,
  capped?: boolean
): string {
  const miles = getTradeAreaRadiusMiles(serviceModel);
  const label = formatMappedCount(count, capped);
  return `${label} restaurant${count === 1 && !capped ? "" : "s"} mapped within ${miles} miles of this address`;
}

export function formatDirectCompetitorAreaSubtitle(
  count: number,
  serviceModel?: ServiceModelValue,
  capped?: boolean
): string {
  const miles = getTradeAreaRadiusMiles(serviceModel);
  const label = formatMappedCount(count, capped);
  return `${label} similar concept${count === 1 && !capped ? "" : "s"} within ${miles} miles of this address`;
}
