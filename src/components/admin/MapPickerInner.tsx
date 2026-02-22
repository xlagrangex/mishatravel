"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

// Fix Leaflet default marker icon (runs once at module load)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerInnerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPickerInner({ position, onPositionChange }: MapPickerInnerProps) {
  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          onPositionChange(latlng.lat, latlng.lng);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <MapContainer
      center={position}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={position}
        draggable={true}
        ref={markerRef}
        eventHandlers={eventHandlers}
      />
      <ClickHandler onPositionChange={onPositionChange} />
      <RecenterMap center={position} />
    </MapContainer>
  );
}
