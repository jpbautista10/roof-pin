import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (locations.length === 0) {
      map.flyTo({
        center: [INITIAL_CENTER.longitude, INITIAL_CENTER.latitude],
        zoom: INITIAL_CENTER.zoom,
        duration: 700,
      });
      return;
    }

    if (locations.length === 1) {
      map.flyTo({
        center: [locations[0].longitude, locations[0].latitude],
        zoom: 14,
        duration: 700,
      });
      return;
    }

    const bounds = locations.reduce(
      (acc, location) => acc.extend([location.longitude, location.latitude]),
      new LngLatBounds(
        [locations[0].longitude, locations[0].latitude],
        [locations[0].longitude, locations[0].latitude],
      ),
    );

    map.fitBounds(bounds, {
      padding: 48,
      duration: 700,
    });
  }, [locations]);

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
        initialViewState={INITIAL_CENTER}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAPBOX_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl
      >
        <NavigationControl position="top-right" />

        {locations.map((location) => (
          <Marker
            key={location.id}
            latitude={location.latitude}
            longitude={location.longitude}
            anchor="bottom"
          >
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0"
              onClick={() => onSelectLocation(location)}
              aria-label={location.project_name}
            >
              <LocationPin className="-mt-1" color={brandColor} />
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
