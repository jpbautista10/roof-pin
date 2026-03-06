import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import { LngLatBounds } from "mapbox-gl";
import { LocateFixed, Loader2, Plus, Minus } from "lucide-react";
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

const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";
const PRIVATE_CENTER_OFFSET_MAX_METERS = 500;

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function getDisplayCoordinates(location: PublicLocation) {
  if (!location.privacy_mode) {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  const distance = Math.random() * PRIVATE_CENTER_OFFSET_MAX_METERS;
  const bearing = Math.random() * 2 * Math.PI;
  const earthRadiusMeters = 6371000;
  const angularDistance = distance / earthRadiusMeters;
  const latitudeRadians = (location.latitude * Math.PI) / 180;
  const longitudeRadians = (location.longitude * Math.PI) / 180;

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
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLocating(false);

        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 1200,
        });
      },
      () => {
        setLocating(false);
        alert(
          "Unable to retrieve your location. Please check your permissions.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const validLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude),
      ),
    [locations],
  );

  const displayLocations = useMemo(
    () =>
      validLocations.map((location) => ({
        ...location,
        ...getDisplayCoordinates(location),
      })),
    [validLocations],
  );

  const viewportLocations = useMemo(() => displayLocations, [displayLocations]);

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
    <div className="relative h-full w-full">
      {!isMapReady && <div className="absolute inset-0 z-10 bg-slate-100" />}
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAPBOX_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl
        onLoad={() => {
          setIsMapReady(true);
        }}
      >
        {userLocation && (
          <Marker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute h-8 w-8 animate-ping rounded-full bg-blue-400 opacity-30" />
              <span className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
            </div>
          </Marker>
        )}

        {displayLocations.map((location) => (
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
              <LocationPin className="-mt-1" color={brandColor} />
            </button>
          </Marker>
        ))}
      </Map>

      {/* Custom map controls: zoom + locate — iOS glass style */}
      <div
        className="absolute right-2.5 top-[4.75rem] z-10 flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          boxShadow:
            "0 0.5px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
          className="flex h-10 w-10 items-center justify-center border-b transition-colors hover:bg-white/50"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="h-[18px] w-[18px] text-slate-800" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
          className="flex h-10 w-10 items-center justify-center border-b transition-colors hover:bg-white/50"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="h-[18px] w-[18px] text-slate-800" />
        </button>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-white/50 disabled:opacity-60"
          aria-label="Locate me"
          title="Zoom to my location"
        >
          {locating ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin text-slate-800" />
          ) : (
            <LocateFixed className="h-[18px] w-[18px] text-slate-800" />
          )}
        </button>
      </div>
    </div>
  );
}
