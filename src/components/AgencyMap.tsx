"use client";

import { useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgencyMarker {
  id: string;
  business_name: string;
  city: string | null;
  province: string | null;
  phone: string | null;
  lat: number;
  lng: number;
}

interface AgencyMapProps {
  agencies: AgencyMarker[];
  selectedId?: string | null;
}

// ---------------------------------------------------------------------------
// Inner Map Component (loaded dynamically with ssr: false)
// ---------------------------------------------------------------------------

function InnerMapComponent({ agencies, selectedId }: AgencyMapProps) {
  const L = require("leaflet") as typeof import("leaflet");
  require("leaflet/dist/leaflet.css");
  const { MapContainer, TileLayer, Marker, Popup, useMap } = require("react-leaflet");

  // Fix Leaflet default marker icon issue with bundlers
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, [L.Icon.Default]);

  // Center of Italy as default
  const defaultCenter: [number, number] = [42.5, 12.5];
  const defaultZoom = 6;

  // Calculate bounds if agencies exist
  const center = useMemo<[number, number]>(() => {
    if (agencies.length === 0) return defaultCenter;
    const lats = agencies.map((a) => a.lat);
    const lngs = agencies.map((a) => a.lng);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }, [agencies]);

  // Fly to selected agency
  function FlyToSelected() {
    const map = useMap();
    useEffect(() => {
      if (selectedId) {
        const agency = agencies.find((a) => a.id === selectedId);
        if (agency) {
          map.flyTo([agency.lat, agency.lng], 13, { duration: 1 });
        }
      }
    }, [selectedId, map]);
    return null;
  }

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
        <Marker key={agency.id} position={[agency.lat, agency.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-[#1B2D4F]">{agency.business_name}</p>
              {agency.city && (
                <p className="text-gray-600">
                  {agency.city}
                  {agency.province ? ` (${agency.province})` : ""}
                </p>
              )}
              {agency.phone && <p className="text-gray-600">{agency.phone}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
      <FlyToSelected />
    </MapContainer>
  );
}

// Dynamic import with SSR disabled
const DynamicMap = dynamic(() => Promise.resolve(InnerMapComponent), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg border bg-gray-50">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <MapPin className="h-8 w-8" />
        <span className="text-sm">Caricamento mappa...</span>
      </div>
    </div>
  ),
});

export default function AgencyMap({ agencies, selectedId }: AgencyMapProps) {
  return <DynamicMap agencies={agencies} selectedId={selectedId} />;
}

export type { AgencyMarker };
