import { RequestHandler } from "express";

interface MapboxContextItem {
  id?: string;
  text?: string;
  short_code?: string;
}

interface MapboxFeature {
  place_name?: string;
  center?: [number, number];
  place_type?: string[];
  text?: string;
  context?: MapboxContextItem[];
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

interface ImportRow {
  project_name: string;
  address: string;
  work_type?: string;
  date_completed?: string;
  privacy_mode?: boolean;
}

function getContextText(
  context: MapboxContextItem[] | undefined,
  key: string,
) {
  return (
    context?.find((item) => item.id?.startsWith(`${key}.`))?.text?.trim() ??
    null
  );
}

async function geocodeAddress(address: string, token: string) {
  const encodedQuery = encodeURIComponent(address);
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json`,
  );
  url.searchParams.set("limit", "1");
  url.searchParams.set(
    "types",
    "address,place,postcode,locality,neighborhood",
  );
  url.searchParams.set("access_token", token);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Geocoding request failed");
  }

  const payload = (await response.json()) as MapboxResponse;
  const feature = payload.features?.[0];

  if (!feature?.center || feature.center.length < 2) {
    return null;
  }

  const [longitude, latitude] = feature.center;
  const city =
    getContextText(feature.context, "place") ??
    getContextText(feature.context, "locality") ??
    (feature.place_type?.includes("place")
      ? (feature.text?.trim() ?? null)
      : null);
  const state = getContextText(feature.context, "region");
  const country = getContextText(feature.context, "country");
  const postcode = getContextText(feature.context, "postcode");
  const neighborhood = getContextText(feature.context, "neighborhood");

  return {
    latitude,
    longitude,
    place_label: feature.place_name?.trim() || address,
    address_json: {
      city,
      state,
      country,
      postcode,
      neighborhood,
      full_address: feature.place_name?.trim() || address,
    },
  };
}

export interface GeocodedImportRow {
  row_index: number;
  status: "success" | "error";
  error?: string;
  data?: {
    project_name: string;
    place_label: string;
    latitude: number;
    longitude: number;
    geocode_latitude: number;
    geocode_longitude: number;
    address_json: Record<string, string | null>;
    work_type?: string;
    date_completed?: string;
    privacy_mode?: boolean;
  };
}

export const handleBatchGeocode: RequestHandler = async (req, res) => {
  const token =
    process.env.MAPBOX_ACCESS_TOKEN ?? process.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    res.status(500).json({ message: "Mapbox token is not configured." });
    return;
  }

  const rows = req.body?.rows as ImportRow[] | undefined;

  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ message: "Request body must contain a non-empty 'rows' array." });
    return;
  }

  if (rows.length > 200) {
    res.status(400).json({ message: "Maximum 200 rows per import." });
    return;
  }

  const results: GeocodedImportRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.project_name?.trim()) {
      results.push({ row_index: i, status: "error", error: "Missing project_name" });
      continue;
    }

    if (!row.address?.trim()) {
      results.push({ row_index: i, status: "error", error: "Missing address" });
      continue;
    }

    try {
      const geocoded = await geocodeAddress(row.address.trim(), token);

      if (!geocoded) {
        results.push({
          row_index: i,
          status: "error",
          error: `Could not geocode address: "${row.address}"`,
        });
        continue;
      }

      results.push({
        row_index: i,
        status: "success",
        data: {
          project_name: row.project_name.trim(),
          place_label: geocoded.place_label,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          geocode_latitude: geocoded.latitude,
          geocode_longitude: geocoded.longitude,
          address_json: geocoded.address_json,
          work_type: row.work_type?.trim() || undefined,
          date_completed: row.date_completed?.trim() || undefined,
          privacy_mode: row.privacy_mode ?? false,
        },
      });
    } catch {
      results.push({
        row_index: i,
        status: "error",
        error: `Geocoding failed for address: "${row.address}"`,
      });
    }
  }

  res.json({ results });
};
