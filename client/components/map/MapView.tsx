import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
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

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function MapView({
  locations,
  onSelectLocation,
  brandColor,
}: MapViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const hasAppliedInitialViewport = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const validLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude),
      ),
    [locations],
  );

  const initialViewState = useMemo(() => {
    if (validLocations.length === 0) {
      return INITIAL_CENTER;
    }

    return {
      latitude: validLocations[0].latitude,
      longitude: validLocations[0].longitude,
      zoom: validLocations.length === 1 ? 14 : INITIAL_CENTER.zoom,
    };
  }, [validLocations]);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    const map = mapRef.current;
    const shouldAnimate = hasAppliedInitialViewport.current;

    if (validLocations.length === 0) {
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

    if (validLocations.length === 1) {
      if (shouldAnimate) {
        map.flyTo({
          center: [validLocations[0].longitude, validLocations[0].latitude],
          zoom: 14,
          duration: 700,
        });
      } else {
        map.jumpTo({
          center: [validLocations[0].longitude, validLocations[0].latitude],
          zoom: 14,
        });
      }

      hasAppliedInitialViewport.current = true;
      return;
    }

    const bounds = validLocations.reduce(
      (acc, location) => acc.extend([location.longitude, location.latitude]),
      new LngLatBounds(
        [validLocations[0].longitude, validLocations[0].latitude],
        [validLocations[0].longitude, validLocations[0].latitude],
      ),
    );

    map.fitBounds(bounds, {
      padding: 48,
      duration: shouldAnimate ? 700 : 0,
    });

    hasAppliedInitialViewport.current = true;
  }, [isMapReady, validLocations]);

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
        onLoad={() => setIsMapReady(true)}
      >
        <NavigationControl position="top-right" />

        {validLocations.map((location) => (
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
