/** Great-circle distance in miles between two lat/lng points. */
export function distanceMilesBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function roundDistanceMiles(miles: number): number {
  return Math.round(miles * 10) / 10;
}

/** Rough drive-time estimate from straight-line miles (avg ~25 mph mixed urban/suburban). */
export function estimateDriveTimeMinutes(distanceMiles: number): number {
  if (distanceMiles <= 0.15) return 1;
  return Math.max(2, Math.round((distanceMiles / 25) * 60));
}

export function formatDriveTime(distanceMiles: number | null | undefined): string {
  if (distanceMiles == null) return "N/A";
  const minutes = estimateDriveTimeMinutes(distanceMiles);
  return minutes <= 1 ? "~1 min" : `~${minutes} min`;
}
