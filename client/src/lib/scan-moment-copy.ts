import type { InitialScan } from "../../../shared/analysis-types";
import type { ConceptInput } from "../../../shared/concept-options";
import { formatConceptLabel } from "../../../shared/concept-options";

export interface ScanMomentCopy {
  badge: string;
  headline: string;
  subtext: string;
  detail: string;
}

export function buildScanMomentCopy(
  scanData: InitialScan,
  concept: ConceptInput
): ScanMomentCopy {
  const radius = scanData.searchRadiusMiles ?? 5;
  const direct = scanData.directCompetitorCount ?? 0;
  const total = scanData.competitorCount;
  const avg = scanData.averageRating;
  const cuisine = (concept.cuisineConcept ?? "restaurant").toLowerCase();
  const conceptLabel = formatConceptLabel(concept).toLowerCase();
  const topCuisine = scanData.topCuisines[0];

  let badge: string;
  if (direct >= 8) {
    badge = `${direct} direct rivals in ${radius} miles`;
  } else if (direct > 0) {
    badge = `Only ${direct} direct ${cuisine} rival${direct === 1 ? "" : "s"} nearby`;
  } else if (concept.cuisineConcept) {
    badge = `No direct ${cuisine} rivals in range`;
  } else {
    badge = `${total} restaurants mapped nearby`;
  }

  let headline: string;
  if (direct >= 8) {
    headline = `${direct} restaurants already match your concept nearby.`;
  } else if (direct >= 4) {
    headline = `Moderate competition for ${conceptLabel} in this trade area.`;
  } else if (direct > 0) {
    headline = `Only ${direct} direct rival${direct === 1 ? "" : "s"} for ${conceptLabel} nearby.`;
  } else if (concept.cuisineConcept) {
    headline = `No direct ${cuisine} competitors mapped in range.`;
  } else if (total > 15) {
    headline = `Busy trade area with ${total} restaurants nearby.`;
  } else if (total > 8) {
    headline = `Moderate restaurant activity at this address.`;
  } else {
    headline = `Sparse restaurant activity near this address.`;
  }

  const subtext =
    scanData.previewInsight ||
    `We mapped ${total} restaurants in your ${radius}-mile trade area.`;

  const detailParts: string[] = [];
  if (direct > 0) {
    detailParts.push(
      `${direct} direct ${conceptLabel} concept${direct === 1 ? "" : "s"} within range`
    );
  }
  if (topCuisine) {
    detailParts.push(`${topCuisine} is the dominant cuisine nearby`);
  }
  if (avg > 0) {
    detailParts.push(
      avg < 4
        ? `area average rating is ${avg}, below the 4.0 bar`
        : `area average rating is ${avg}`
    );
  }
  detailParts.push("Enter your details below for your full location intelligence report");

  return {
    badge,
    headline,
    subtext,
    detail: detailParts.join(". ") + ".",
  };
}
