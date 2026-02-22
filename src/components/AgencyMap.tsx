"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { AgencyMarker } from "./AgencyMapInner";

// ---------------------------------------------------------------------------
// Dynamic import (ssr: false to avoid Leaflet SSR issues)
// ---------------------------------------------------------------------------

const DynamicMap = dynamic(() => import("./AgencyMapInner"), {
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

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

interface AgencyMapProps {
  agencies: AgencyMarker[];
  selectedId?: string | null;
}

export default function AgencyMap({ agencies, selectedId }: AgencyMapProps) {
  return <DynamicMap agencies={agencies} selectedId={selectedId} />;
}

export type { AgencyMarker };
