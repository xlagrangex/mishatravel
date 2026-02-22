"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapLocation {
  nome: string;
  coords: [number, number];
}

interface ItineraryMapProps {
  locations: MapLocation[];
  activeIndex: number | null;
}

// ---------------------------------------------------------------------------
// Fix Leaflet default marker icon (runs once at module load)
// ---------------------------------------------------------------------------

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ACTIVE_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "active-marker",
});

// ---------------------------------------------------------------------------
// MapController — handles fitBounds + fly to active pin
// ---------------------------------------------------------------------------

function MapController({
  locations,
  activeIndex,
}: {
  locations: MapLocation[];
  activeIndex: number | null;
}) {
  const map = useMap();
  const didFitRef = useRef(false);

  useEffect(() => {
    if (!didFitRef.current && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => l.coords));
      map.fitBounds(bounds, { padding: [40, 40] });
      didFitRef.current = true;
    }
  }, [map, locations]);

  useEffect(() => {
    if (activeIndex !== null && locations[activeIndex]) {
      map.flyTo(locations[activeIndex].coords, Math.max(map.getZoom(), 8), {
        duration: 0.8,
      });
    }
  }, [activeIndex, map, locations]);

  return null;
}

// ---------------------------------------------------------------------------
// Component (client-only — loaded via next/dynamic with ssr: false)
// ---------------------------------------------------------------------------

export default function ItineraryMap({ locations, activeIndex }: ItineraryMapProps) {
  const polylinePositions = useMemo(
    () => locations.map((loc) => loc.coords),
    [locations]
  );

  return (
    <>
      <style>{`
        .active-marker {
          filter: hue-rotate(140deg) saturate(1.5);
          z-index: 1000 !important;
        }
      `}</style>
      <MapContainer
        center={locations[0]?.coords ?? [45.46, 9.19]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, i) => (
          <Marker
            key={`${loc.nome}-${i}`}
            position={loc.coords}
            icon={i === activeIndex ? ACTIVE_ICON : DEFAULT_ICON}
          >
            <Popup>
              <span className="font-semibold">{loc.nome}</span>
            </Popup>
          </Marker>
        ))}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#C41E2F", weight: 3, opacity: 0.7, dashArray: "8 4" }}
          />
        )}
        <MapController locations={locations} activeIndex={activeIndex} />
      </MapContainer>
    </>
  );
}
