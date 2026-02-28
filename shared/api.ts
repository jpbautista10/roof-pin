/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface GeocodeSuggestion {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  country: string | null;
  postcode: string | null;
}

export interface GeocodeSuggestResponse {
  suggestions: GeocodeSuggestion[];
}
