import { makeRequest, type PlacesSearchResult } from "./_core/map";
import type { Competitor } from "../shared/analysis-types";
import type { ConceptInput } from "../shared/concept-options";
import { getTradeAreaRadiusMeters } from "../shared/search-config";
import { distanceMilesBetween, roundDistanceMiles } from "../shared/geo";
import { classifyCompetitor } from "../shared/competitor-classifier";
import { getCuisineSearchKeyword } from "./concept-utils";

type NearbySearchResponse = PlacesSearchResult & { next_page_token?: string };

function mapPlace(
  place: PlacesSearchResult["results"][number],
  originLat: number,
  originLng: number
): Competitor {
  const lat = place.geometry.location.lat;
  const lng = place.geometry.location.lng;
  const priceLevel = (place as { price_level?: number | null }).price_level ?? null;
  const classified = classifyCompetitor({
    name: place.name,
    types: place.types,
    priceLevel,
  });

  return {
    placeId: place.place_id,
    name: place.name,
    cuisine: classified.cuisine,
    serviceModel: classified.serviceModel,
    conceptLabel: classified.conceptLabel,
    rating: place.rating ?? 0,
    userRatingsTotal: place.user_ratings_total ?? 0,
    priceLevel,
    address: place.formatted_address,
    lat,
    lng,
    distanceMiles: roundDistanceMiles(distanceMilesBetween(originLat, originLng, lat, lng)),
  };
}

async function fetchNearbySearchPage(
  lat: number,
  lng: number,
  radiusMeters: number,
  keyword: string,
  pageToken?: string
): Promise<{ places: Competitor[]; nextPageToken?: string }> {
  const params: Record<string, unknown> = {
    location: `${lat},${lng}`,
    radius: radiusMeters,
    type: "restaurant",
    keyword,
  };
  if (pageToken) params.pagetoken = pageToken;

  const result = await makeRequest<NearbySearchResponse>(
    "/maps/api/place/nearbysearch/json",
    params
  );

  if (result.status !== "OK" && result.status !== "ZERO_RESULTS") {
    return { places: [] };
  }

  return {
    places: (result.results ?? []).map((place) => mapPlace(place, lat, lng)),
    nextPageToken: result.next_page_token,
  };
}

async function fetchAllPages(
  lat: number,
  lng: number,
  radiusMeters: number,
  keyword: string,
  maxPages = 3
): Promise<Competitor[]> {
  const byId = new Map<string, Competitor>();
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const { places, nextPageToken } = await fetchNearbySearchPage(
      lat,
      lng,
      radiusMeters,
      keyword,
      pageToken
    );

    for (const place of places) {
      byId.set(place.placeId, place);
    }

    if (!nextPageToken) break;
    pageToken = nextPageToken;
    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  return Array.from(byId.values());
}

function isSpecificConcept(concept?: ConceptInput): boolean {
  return Boolean(concept && concept.mode === "specific" && concept.serviceModel !== "explore");
}

export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  concept?: ConceptInput
): Promise<Competitor[]> {
  const radiusMeters = getTradeAreaRadiusMeters(concept?.serviceModel);
  const general = await fetchAllPages(lat, lng, radiusMeters, "restaurant");

  if (!isSpecificConcept(concept)) {
    return general
      .sort((a, b) => (a.distanceMiles ?? 99) - (b.distanceMiles ?? 99))
      .slice(0, 60);
  }

  const cuisineKeyword = getCuisineSearchKeyword(concept!.cuisineConcept);
  if (!cuisineKeyword) {
    return general
      .sort((a, b) => (a.distanceMiles ?? 99) - (b.distanceMiles ?? 99))
      .slice(0, 60);
  }

  const byId = new Map<string, Competitor>();
  for (const place of general) byId.set(place.placeId, place);

  try {
    const targeted = await fetchAllPages(
      lat,
      lng,
      radiusMeters,
      `${cuisineKeyword} restaurant`,
      2
    );
    for (const place of targeted) {
      if (!byId.has(place.placeId)) {
        byId.set(place.placeId, place);
      }
    }
  } catch (e) {
    console.warn("[Places] Cuisine-targeted search failed:", e);
  }

  return Array.from(byId.values())
    .sort((a, b) => (a.distanceMiles ?? 99) - (b.distanceMiles ?? 99))
    .slice(0, 60);
}
