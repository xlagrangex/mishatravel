"use client";

import { useState } from "react";
import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Search } from "lucide-react";

const sampleAgencies = [
  { name: "Viaggi & Sogni", city: "Roma", province: "RM", address: "Via del Corso 120", phone: "+39 06 1234567", email: "info@viaggiesogni.it" },
  { name: "Mondo Vacanze", city: "Milano", province: "MI", address: "Corso Buenos Aires 45", phone: "+39 02 9876543", email: "info@mondovacanze.it" },
  { name: "Orizzonti Travel", city: "Napoli", province: "NA", address: "Via Toledo 88", phone: "+39 081 5551234", email: "info@orizzontitravel.it" },
  { name: "Mare e Monti Viaggi", city: "Firenze", province: "FI", address: "Via Tornabuoni 15", phone: "+39 055 4441234", email: "info@maremontiviaggi.it" },
  { name: "Globetrotter Agency", city: "Torino", province: "TO", address: "Via Roma 200", phone: "+39 011 3331234", email: "info@globetrotteragency.it" },
  { name: "Avventure nel Mondo", city: "Bologna", province: "BO", address: "Via Indipendenza 55", phone: "+39 051 2221234", email: "info@avventurenelmondo.it" },
];

export default function TrovaAgenziaPage() {
  const [search, setSearch] = useState("");

  const filtered = sampleAgencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.province.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHero
        title="Trova un'Agenzia"
        subtitle="Cerca l'agenzia Misha Travel più vicina a te"
        backgroundImage="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Trova Agenzia", href: "/trova-agenzia" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Search */}
          <div className="max-w-2xl mx-auto mb-10">
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

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((agency) => (
                <div key={agency.name} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <h3 className="font-bold text-lg text-[#1B2D4F] mb-3">{agency.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 text-[#C41E2F] shrink-0" />
                      {agency.address}, {agency.city} ({agency.province})
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="size-4 text-[#C41E2F] shrink-0" />
                      {agency.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="size-4 text-[#C41E2F] shrink-0" />
                      {agency.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white"
                    size="sm"
                  >
                    Contatta Agenzia
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">
                Nessuna agenzia trovata per &ldquo;{search}&rdquo;.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Prova a cercare con un&apos;altra citta o provincia.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
