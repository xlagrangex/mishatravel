"use client";

import { useEffect, useRef } from "react";

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
// Component (client-only, loaded via next/dynamic with ssr: false)
// ---------------------------------------------------------------------------

export default function ItineraryMap({ locations, activeIndex }: ItineraryMapProps) {
  const L = require("leaflet") as typeof import("leaflet");
  require("leaflet/dist/leaflet.css");
  const {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    useMap,
  } = require("react-leaflet");

  // Fix Leaflet default marker icon
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, [L.Icon.Default]);

  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const activeIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [49, 49],
    className: "active-marker",
  });

  const polylinePositions = locations.map((loc) => loc.coords);

  // FitBounds + fly to active
  function MapController() {
    const map = useMap();
    const didFitRef = useRef(false);

    useEffect(() => {
      if (!didFitRef.current && locations.length > 0) {
        const bounds = L.latLngBounds(locations.map((l) => l.coords));
        map.fitBounds(bounds, { padding: [40, 40] });
        didFitRef.current = true;
      }
    }, [map]);

    useEffect(() => {
      if (activeIndex !== null && locations[activeIndex]) {
        map.flyTo(locations[activeIndex].coords, Math.max(map.getZoom(), 8), {
          duration: 0.8,
        });
      }
    }, [activeIndex, map]);

    return null;
  }

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
            icon={i === activeIndex ? activeIcon : defaultIcon}
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
        <MapController />
      </MapContainer>
    </>
  );
}
