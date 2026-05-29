import type { ConceptInput } from "../../../shared/concept-options";
import { defaultConceptInput } from "../../../shared/concept-options";

export function conceptFromSearchParams(params: URLSearchParams): ConceptInput | undefined {
  const serviceModel = params.get("serviceModel");
  if (!serviceModel) return undefined;

  return {
    serviceModel: serviceModel as ConceptInput["serviceModel"],
    cuisineConcept: params.get("cuisineConcept") ?? "",
    priceTier: params.get("priceTier") ?? undefined,
    mode: (params.get("mode") as ConceptInput["mode"]) ?? "specific",
  };
}

export function appendConceptToSearchParams(params: URLSearchParams, concept: ConceptInput): void {
  params.set("serviceModel", concept.serviceModel);
  params.set("cuisineConcept", concept.cuisineConcept);
  params.set("mode", concept.mode);
  if (concept.priceTier) params.set("priceTier", concept.priceTier);
}

export function isConceptReady(concept: ConceptInput): boolean {
  if (concept.serviceModel === "explore" || concept.mode === "explore") return true;
  return Boolean(concept.cuisineConcept.trim());
}

export { defaultConceptInput };
