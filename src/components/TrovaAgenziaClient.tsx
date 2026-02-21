"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Search } from "lucide-react";
import AgencyMap from "@/components/AgencyMap";
import type { AgencyMarker } from "@/components/AgencyMap";
import type { Agency } from "@/lib/types";

interface TrovaAgenziaClientProps {
  agencies: Agency[];
}

export default function TrovaAgenziaClient({ agencies }: TrovaAgenziaClientProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = agencies.filter(
    (a) =>
      a.business_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.province ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // For now agencies don't have lat/lng in the DB schema.
  // When coordinates are added, this will populate the map automatically.
  const agencyMarkers: AgencyMarker[] = [];

  return (
    <div className="container mx-auto px-4">
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            placeholder="Cerca per citta, provincia o nome agenzia..."
            className="pl-10 py-6 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Map + List layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 h-[400px] lg:h-[600px] rounded-lg overflow-hidden border border-gray-200">
          <AgencyMap agencies={agencyMarkers} selectedId={selectedId} />
        </div>

        {/* Agency List */}
        <div className="lg:col-span-2 space-y-4 lg:max-h-[600px] lg:overflow-y-auto lg:pr-2">
          {filtered.length > 0 ? (
            filtered.map((agency) => (
              <div
                key={agency.id}
                className={`bg-gray-50 rounded-lg p-5 border cursor-pointer transition-all ${
                  selectedId === agency.id
                    ? "border-[#C41E2F] ring-1 ring-[#C41E2F]/20"
                    : "border-gray-100 hover:border-gray-300"
                }`}
                onClick={() => setSelectedId(agency.id)}
              >
                <h3 className="font-bold text-lg text-[#1B2D4F] mb-2">{agency.business_name}</h3>
                <div className="space-y-1.5 text-sm text-gray-600">
                  {(agency.address || agency.city) && (
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 text-[#C41E2F] shrink-0" />
                      <span>
                        {agency.address && `${agency.address}, `}
                        {agency.city}
                        {agency.province && ` (${agency.province})`}
                      </span>
                    </p>
                  )}
                  {agency.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="size-4 text-[#C41E2F] shrink-0" />
                      <a
                        href={`tel:${agency.phone}`}
                        className="hover:text-[#C41E2F] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {agency.phone}
                      </a>
                    </p>
                  )}
                  {agency.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="size-4 text-[#C41E2F] shrink-0" />
                      <a
                        href={`mailto:${agency.email}`}
                        className="hover:text-[#C41E2F] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {agency.email}
                      </a>
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-3 border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white"
                  size="sm"
                  asChild
                >
                  <a
                    href={`mailto:${agency.email || "info@mishatravel.com"}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Contatta Agenzia
                  </a>
                </Button>
              </div>
            ))
          ) : agencies.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-10 text-center">
              <MapPin className="size-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">
                Nessuna agenzia registrata al momento.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Le agenzie partner appariranno qui non appena saranno attivate.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-10 text-center">
              <p className="text-gray-500 text-lg">
                Nessuna agenzia trovata per &ldquo;{search}&rdquo;.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Prova a cercare con un&apos;altra citta o provincia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
