import { RequestHandler } from "express";
import { GeocodeSuggestResponse } from "@shared/api";

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
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
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "roof-pin/1.0",
      },
    });

    if (!response.ok) {
      res.status(502).json({ message: "Geocoding provider unavailable." });
      return;
    }

    const payload = (await response.json()) as PhotonResponse;
    const suggestions = (payload.features ?? [])
      .map((feature) => {
        const coordinates = feature.geometry?.coordinates;
        if (!coordinates || coordinates.length < 2) {
          return null;
        }

        const [longitude, latitude] = coordinates;
        const props = feature.properties ?? {};
        const road = [props.housenumber, props.street]
          .filter(Boolean)
          .join(" ");
        const labelSegments = [
          props.name,
          road,
          props.city,
          props.state,
          props.postcode,
          props.country,
        ].filter(Boolean);

        return {
          id: `${props.osm_type ?? "osm"}-${props.osm_id ?? Math.random()}`,
          label: labelSegments.join(", "),
          latitude,
          longitude,
          city: props.city ?? null,
          state: props.state ?? null,
          country: props.country ?? null,
          postcode: props.postcode ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const result: GeocodeSuggestResponse = { suggestions };
    res.json(result);
  } catch {
    res.status(500).json({ message: "Unable to fetch geocoding suggestions." });
  }
};
