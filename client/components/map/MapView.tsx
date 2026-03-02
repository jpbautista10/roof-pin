import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/mapbox";
import { LngLatBounds } from "mapbox-gl";
import LocationPin from "@/components/map/LocationPin";
import { PublicLocation } from "@/types/public-map";

interface MapViewProps {
  locations: PublicLocation[];
  onSelectLocation: (location: PublicLocation) => void;
  brandColor?: string;
}

const INITIAL_CENTER = {
  latitude: 33.749,
  longitude: -84.388,
  zoom: 11,
};

const MAPBOX_STYLE = "mapbox://styles/mapbox/standard";
const PRIVATE_RADIUS_METERS = 200;
const PRIVATE_RADIUS_STEPS = 40;
const PRIVATE_CENTER_OFFSET_MAX_METERS = 80;
const PRIVATE_RADIUS_FILL_LAYER_ID = "private-radius-fill";
const PRIVATE_RADIUS_OUTLINE_LAYER_ID = "private-radius-outline";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function createCircleCoordinates(
  latitude: number,
  longitude: number,
  radiusInMeters: number,
  steps: number,
) {
  const earthRadiusMeters = 6371000;
  const angularDistance = radiusInMeters / earthRadiusMeters;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const longitudeRadians = (longitude * Math.PI) / 180;

  const coordinates: [number, number][] = [];

  for (let step = 0; step <= steps; step += 1) {
    const bearing = (2 * Math.PI * step) / steps;

    const sinLatitude =
      Math.sin(latitudeRadians) * Math.cos(angularDistance) +
      Math.cos(latitudeRadians) * Math.sin(angularDistance) * Math.cos(bearing);
    const nextLatitudeRadians = Math.asin(sinLatitude);

    const y =
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitudeRadians);
    const x =
      Math.cos(angularDistance) - Math.sin(latitudeRadians) * sinLatitude;
    const nextLongitudeRadians = longitudeRadians + Math.atan2(y, x);

    coordinates.push([
      (nextLongitudeRadians * 180) / Math.PI,
      (nextLatitudeRadians * 180) / Math.PI,
    ]);
  }

  return coordinates;
}

function offsetCoordinates(
  latitude: number,
  longitude: number,
  maxOffsetMeters: number,
) {
  const distance = Math.random() * maxOffsetMeters;
  const bearing = Math.random() * 2 * Math.PI;
  const earthRadiusMeters = 6371000;
  const angularDistance = distance / earthRadiusMeters;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const longitudeRadians = (longitude * Math.PI) / 180;

  const sinLatitude =
    Math.sin(latitudeRadians) * Math.cos(angularDistance) +
    Math.cos(latitudeRadians) * Math.sin(angularDistance) * Math.cos(bearing);
  const nextLatitudeRadians = Math.asin(sinLatitude);

  const y =
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitudeRadians);
  const x = Math.cos(angularDistance) - Math.sin(latitudeRadians) * sinLatitude;
  const nextLongitudeRadians = longitudeRadians + Math.atan2(y, x);

  return {
    latitude: (nextLatitudeRadians * 180) / Math.PI,
    longitude: (nextLongitudeRadians * 180) / Math.PI,
  };
}

export default function MapView({
  locations,
  onSelectLocation,
  brandColor,
}: MapViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const hasAppliedInitialViewport = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isStyleReady, setIsStyleReady] = useState(false);

  const validLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude),
      ),
    [locations],
  );

  const privateLocations = useMemo(
    () => validLocations.filter((location) => location.privacy_mode),
    [validLocations],
  );

  const publicLocations = useMemo(
    () => validLocations.filter((location) => !location.privacy_mode),
    [validLocations],
  );

  const viewportLocations = useMemo(
    () => (publicLocations.length > 0 ? publicLocations : validLocations),
    [publicLocations, validLocations],
  );

  const privateLocationById = useMemo(
    () =>
      privateLocations.reduce<Record<string, PublicLocation>>(
        (acc, location) => {
          acc[location.id] = location;
          return acc;
        },
        {},
      ),
    [privateLocations],
  );

  const obfuscatedPrivateCenters = useMemo(
    () =>
      privateLocations.map((location) => ({
        locationId: location.id,
        projectName: location.project_name,
        ...offsetCoordinates(
          location.latitude,
          location.longitude,
          PRIVATE_CENTER_OFFSET_MAX_METERS,
        ),
      })),
    [privateLocations],
  );

  const privateRadiusGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: obfuscatedPrivateCenters.map((center) => ({
        type: "Feature" as const,
        properties: {
          locationId: center.locationId,
          projectName: center.projectName,
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            createCircleCoordinates(
              center.latitude,
              center.longitude,
              PRIVATE_RADIUS_METERS,
              PRIVATE_RADIUS_STEPS,
            ),
          ],
        },
      })),
    }),
    [obfuscatedPrivateCenters],
  );

  const initialViewState = useMemo(() => {
    if (viewportLocations.length === 0) {
      return INITIAL_CENTER;
    }

    return {
      latitude: viewportLocations[0].latitude,
      longitude: viewportLocations[0].longitude,
      zoom: viewportLocations.length === 1 ? 14 : INITIAL_CENTER.zoom,
    };
  }, [viewportLocations]);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    const map = mapRef.current;
    const shouldAnimate = hasAppliedInitialViewport.current;

    if (viewportLocations.length === 0) {
      if (shouldAnimate) {
        map.flyTo({
          center: [INITIAL_CENTER.longitude, INITIAL_CENTER.latitude],
          zoom: INITIAL_CENTER.zoom,
          duration: 700,
        });
      } else {
        map.jumpTo({
          center: [INITIAL_CENTER.longitude, INITIAL_CENTER.latitude],
          zoom: INITIAL_CENTER.zoom,
        });
      }

      hasAppliedInitialViewport.current = true;
      return;
    }

    if (viewportLocations.length === 1) {
      if (shouldAnimate) {
        map.flyTo({
          center: [
            viewportLocations[0].longitude,
            viewportLocations[0].latitude,
          ],
          zoom: 14,
          duration: 700,
        });
      } else {
        map.jumpTo({
          center: [
            viewportLocations[0].longitude,
            viewportLocations[0].latitude,
          ],
          zoom: 14,
        });
      }

      hasAppliedInitialViewport.current = true;
      return;
    }

    const bounds = viewportLocations.reduce(
      (acc, location) => acc.extend([location.longitude, location.latitude]),
      new LngLatBounds(
        [viewportLocations[0].longitude, viewportLocations[0].latitude],
        [viewportLocations[0].longitude, viewportLocations[0].latitude],
      ),
    );

    map.fitBounds(bounds, {
      padding: 48,
      duration: shouldAnimate ? 700 : 0,
    });

    hasAppliedInitialViewport.current = true;
  }, [isMapReady, viewportLocations]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <p className="px-4 text-center text-sm text-slate-600">
          Mapbox token missing. Set `VITE_MAPBOX_ACCESS_TOKEN`.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAPBOX_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl
        interactiveLayerIds={[
          PRIVATE_RADIUS_FILL_LAYER_ID,
          PRIVATE_RADIUS_OUTLINE_LAYER_ID,
        ]}
        onLoad={() => {
          setIsMapReady(true);
          setIsStyleReady(false);
        }}
        onIdle={() => {
          if (mapRef.current?.isStyleLoaded()) {
            setIsStyleReady(true);
          }
        }}
        onClick={(event) => {
          const locationId =
            event.features?.[0]?.properties?.locationId ??
            event.features?.[0]?.properties?.locationid;

          if (typeof locationId !== "string") {
            return;
          }

          const selectedLocation = privateLocationById[locationId];
          if (selectedLocation) {
            onSelectLocation(selectedLocation);
          }
        }}
      >
        <NavigationControl position="top-right" />

        {isStyleReady && privateLocations.length > 0 ? (
          <Source
            id="private-radius-source"
            type="geojson"
            data={privateRadiusGeoJson}
          >
            <Layer
              id={PRIVATE_RADIUS_FILL_LAYER_ID}
              type="fill"
              paint={{
                "fill-color": brandColor ?? "#0f766e",
                "fill-opacity": 0.16,
              }}
            />
            <Layer
              id={PRIVATE_RADIUS_OUTLINE_LAYER_ID}
              type="line"
              paint={{
                "line-color": brandColor ?? "#0f766e",
                "line-width": 2,
                "line-opacity": 0.55,
              }}
            />
          </Source>
        ) : null}

        {publicLocations.map((location) => (
          <Marker
            key={location.id}
            latitude={location.latitude}
            longitude={location.longitude}
            anchor="bottom"
          >
            <button
              type="button"
              className="group relative cursor-pointer border-0 bg-transparent p-0"
              onClick={() => onSelectLocation(location)}
              aria-label={location.project_name}
            >
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md group-hover:block group-focus-visible:block">
                {location.project_name}
              </span>
              <LocationPin className="-mt-1" color={brandColor} />
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
