import { RequestHandler } from "express";
import { GeocodeSuggestResponse } from "@shared/api";

interface MapboxContextItem {
  id?: string;
  text?: string;
  short_code?: string;
}

interface MapboxFeature {
  id?: string;
  place_name?: string;
  center?: [number, number];
  place_type?: string[];
  text?: string;
  context?: MapboxContextItem[];
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

function getContextText(context: MapboxContextItem[] | undefined, key: string) {
  return (
    context?.find((item) => item.id?.startsWith(`${key}.`))?.text?.trim() ??
    null
  );
}

export const handleGeocodeSuggest: RequestHandler = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limitValue = Number(req.query.limit);
  const limit = Number.isFinite(limitValue)
    ? Math.max(1, Math.min(8, Math.floor(limitValue)))
    : 5;

  if (q.length < 2) {
    const empty: GeocodeSuggestResponse = { suggestions: [] };
    res.json(empty);
    return;
  }

  try {
    const token =
      process.env.MAPBOX_ACCESS_TOKEN ?? process.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!token) {
      res.status(500).json({ message: "Mapbox token is not configured." });
      return;
    }

    const encodedQuery = encodeURIComponent(q);
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json`,
    );
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("autocomplete", "true");
    url.searchParams.set(
      "types",
      "address,place,postcode,locality,neighborhood",
    );
    url.searchParams.set("access_token", token);

    const response = await fetch(url.toString());

    if (!response.ok) {
      res.status(502).json({ message: "Geocoding provider unavailable." });
      return;
    }

    const payload = (await response.json()) as MapboxResponse;
    const suggestions = (payload.features ?? [])
      .map((feature) => {
        const coordinates = feature.center;
        if (!coordinates || coordinates.length < 2) {
          return null;
        }

        const [longitude, latitude] = coordinates;
        const city =
          getContextText(feature.context, "place") ??
          getContextText(feature.context, "locality") ??
          (feature.place_type?.includes("place")
            ? (feature.text?.trim() ?? null)
            : null);
        const state = getContextText(feature.context, "region");
        const country = getContextText(feature.context, "country");
        const postcode = getContextText(feature.context, "postcode");

        return {
          id: feature.id ?? `${latitude},${longitude}`,
          label: feature.place_name?.trim() || feature.text?.trim() || q,
          latitude,
          longitude,
          city,
          state,
          country,
          postcode,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const result: GeocodeSuggestResponse = { suggestions };
    res.json(result);
  } catch {
    res.status(500).json({ message: "Unable to fetch geocoding suggestions." });
  }
};
