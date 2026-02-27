import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { PublicLocation } from "@/types/public-map";

interface MapViewProps {
  locations: PublicLocation[];
  onSelectLocation: (location: PublicLocation) => void;
}

function FitToLocations({ locations }: { locations: PublicLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) {
      map.setView([33.749, -84.388], 11);
      return;
    }

    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 14);
      return;
    }

    const bounds = L.latLngBounds(
      locations.map((location) => [location.latitude, location.longitude]),
    );
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [locations, map]);

  return null;
}

export default function MapView({ locations, onSelectLocation }: MapViewProps) {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={[33.749, -84.388]}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToLocations locations={locations} />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            eventHandlers={{
              click: () => onSelectLocation(location),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
