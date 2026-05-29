/**
 * Google Maps API Integration - Direct API calls (no proxy)
 */

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  return apiKey;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
}

export async function makeRequest<T = unknown>(
  endpoint: string,
  params: Record<string, unknown> = {},
  options: RequestOptions = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`https://maps.googleapis.com${endpoint}`);
  url.searchParams.append("key", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Maps API failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as T;
}

// Type definitions kept for compatibility
export type TravelMode = "driving" | "walking" | "bicycling" | "transit";
export type MapType = "roadmap" | "satellite" | "terrain" | "hybrid";
export type SpeedUnit = "KPH" | "MPH";
export type LatLng = { lat: number; lng: number };

export type GeocodingResult = {
  results: Array<{
    address_components: Array<{ long_name: string; short_name: string; types: string[] }>;
    formatted_address: string;
    geometry: { location: LatLng; location_type: string; viewport: { northeast: LatLng; southwest: LatLng } };
    place_id: string;
    types: string[];
  }>;
  status: string;
};

export type PlacesSearchResult = {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: { location: LatLng };
    rating?: number;
    user_ratings_total?: number;
    business_status?: string;
    types: string[];
  }>;
  status: string;
};

export type PlaceDetailsResult = {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: Array<{ author_name: string; rating: number; text: string; time: number }>;
    opening_hours?: { open_now: boolean; weekday_text: string[] };
    geometry: { location: LatLng };
  };
  status: string;
};

export type DirectionsResult = { routes: any[]; status: string };
export type DistanceMatrixResult = { rows: any[]; origin_addresses: string[]; destination_addresses: string[]; status: string };
export type ElevationResult = { results: any[]; status: string };
export type TimeZoneResult = { dstOffset: number; rawOffset: number; status: string; timeZoneId: string; timeZoneName: string };
export type RoadsResult = { snappedPoints: any[] };
