"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Fix Leaflet default marker icon (runs once at module load)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom red icon for selected marker
const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgencyMarker {
  id: string;
  business_name: string;
  city: string | null;
  province: string | null;
  phone: string | null;
  email?: string | null;
  address?: string | null;
  lat: number;
  lng: number;
}

interface AgencyMapInnerProps {
  agencies: AgencyMarker[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// FlyToSelected helper
// ---------------------------------------------------------------------------

function FlyToSelected({
  agencies,
  selectedId,
}: {
  agencies: AgencyMarker[];
  selectedId?: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      const agency = agencies.find((a) => a.id === selectedId);
      if (agency) {
        map.flyTo([agency.lat, agency.lng], 13, { duration: 1 });
      }
    }
  }, [selectedId, agencies, map]);
  return null;
}

// ---------------------------------------------------------------------------
// FitBounds helper — fit map to show all markers
// ---------------------------------------------------------------------------

function FitBounds({ agencies }: { agencies: AgencyMarker[] }) {
  const map = useMap();
  const prevCount = useRef(agencies.length);

  useEffect(() => {
    if (agencies.length > 0 && agencies.length !== prevCount.current) {
      const bounds = L.latLngBounds(agencies.map((a) => [a.lat, a.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
    prevCount.current = agencies.length;
  }, [agencies, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const defaultCenter: [number, number] = [42.5, 12.5];
const defaultZoom = 6;

export default function AgencyMapInner({ agencies, selectedId, onMarkerClick }: AgencyMapInnerProps) {
  const center = useMemo<[number, number]>(() => {
    if (agencies.length === 0) return defaultCenter;
    const lats = agencies.map((a) => a.lat);
    const lngs = agencies.map((a) => a.lng);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }, [agencies]);

  return (
    <MapContainer
      center={center}
      zoom={agencies.length > 0 ? 6 : defaultZoom}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {agencies.map((agency) => (
        <Marker
          key={agency.id}
          position={[agency.lat, agency.lng]}
          icon={selectedId === agency.id ? selectedIcon : new L.Icon.Default()}
          eventHandlers={
            onMarkerClick
              ? { click: () => onMarkerClick(agency.id) }
              : undefined
          }
        >
          <Popup>
            <div className="text-sm min-w-[180px]">
              <p className="font-bold text-[#1B2D4F]">{agency.business_name}</p>
              {agency.address && (
                <p className="text-gray-600 mt-1">{agency.address}</p>
              )}
              {agency.city && (
                <p className="text-gray-600">
                  {agency.city}
                  {agency.province ? ` (${agency.province})` : ""}
                </p>
              )}
              {agency.phone && (
                <p className="text-gray-600 mt-1">
                  <a href={`tel:${agency.phone}`} className="text-[#C41E2F] hover:underline">{agency.phone}</a>
                </p>
              )}
              {agency.email && (
                <p className="text-gray-600">
                  <a href={`mailto:${agency.email}`} className="text-[#C41E2F] hover:underline">{agency.email}</a>
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      <FlyToSelected agencies={agencies} selectedId={selectedId} />
      <FitBounds agencies={agencies} />
    </MapContainer>
  );
}
