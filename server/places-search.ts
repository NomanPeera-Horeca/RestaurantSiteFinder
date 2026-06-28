import { makeRequest, type PlacesSearchResult } from "./_core/map";
import type { Competitor } from "../shared/analysis-types";
import type { ConceptInput } from "../shared/concept-options";
import { getTradeAreaRadiusMeters } from "../shared/search-config";
import { distanceMilesBetween, roundDistanceMiles } from "../shared/geo";
import { getCuisineSearchKeyword } from "./concept-utils";

type NearbySearchResponse = PlacesSearchResult & { next_page_token?: string };

function extractCuisine(types: string[], name: string): string {
  const cuisineMap: Record<string, string> = {
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
    cafe: "Cafe",
    bakery: "Bakery",
    bar: "Bar & Grill",
    fast_food_restaurant: "Fast Food",
  };

  for (const type of types) {
    if (cuisineMap[type]) return cuisineMap[type];
  }

  const nameLower = name.toLowerCase();
  const nameHints: Record<string, string> = {
    pizza: "Pizza", sushi: "Sushi", burger: "Burgers", taco: "Mexican",
    thai: "Thai", chinese: "Chinese", indian: "Indian", italian: "Italian",
    bbq: "BBQ", barbecue: "BBQ", ramen: "Japanese", pho: "Vietnamese",
    mediterranean: "Mediterranean", greek: "Greek", korean: "Korean",
    seafood: "Seafood", steak: "Steakhouse", cafe: "Cafe", coffee: "Cafe",
    bakery: "Bakery", deli: "Deli", sandwich: "Sandwiches",
  };

  for (const [hint, cuisine] of Object.entries(nameHints)) {
    if (nameLower.includes(hint)) return cuisine;
  }

  return "Restaurant";
}

function mapPlace(
  place: PlacesSearchResult["results"][number],
  originLat: number,
  originLng: number
): Competitor {
  const lat = place.geometry.location.lat;
  const lng = place.geometry.location.lng;
  return {
    placeId: place.place_id,
    name: place.name,
    cuisine: extractCuisine(place.types, place.name),
    rating: place.rating ?? 0,
    userRatingsTotal: place.user_ratings_total ?? 0,
    priceLevel: (place as { price_level?: number | null }).price_level ?? null,
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
    return general.slice(0, 60);
  }

  const cuisineKeyword = getCuisineSearchKeyword(concept!.cuisineConcept);
  if (!cuisineKeyword) {
    return general.slice(0, 60);
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

  return Array.from(byId.values()).slice(0, 60);
}
