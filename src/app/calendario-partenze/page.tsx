"use client";

import { useState, useMemo } from "react";
import PageHero from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllDepartures } from "@/lib/data";
import { ChevronLeft, ChevronRight, Ship, MapPin, Clock } from "lucide-react";
import Link from "next/link";

const MONTHS_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export default function CalendarioPartenzePage() {
  const allDeps = useMemo(() => getAllDepartures(), []);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [filterType, setFilterType] = useState<"tutti" | "tour" | "crociera">("tutti");

  const filteredDeps = useMemo(() => {
    return allDeps
      .filter((d) => {
        if (filterType !== "tutti" && d.type !== filterType) return false;
        const date = new Date(d.date);
        return date.getFullYear() === currentMonth.year && date.getMonth() === currentMonth.month;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allDeps, currentMonth, filterType]);

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price);

  return (
    <>
      <PageHero
        title="Calendario Partenze"
        subtitle="Tutte le date di partenza per tour e crociere"
        backgroundImage="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Calendario Partenze", href: "/calendario-partenze" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="size-6 text-[#1B2D4F]" />
            </button>
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              {MONTHS_IT[currentMonth.month]} {currentMonth.year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="size-6 text-[#1B2D4F]" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-8 justify-center">
            {(["tutti", "tour", "crociera"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterType === type
                    ? "bg-[#C41E2F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === "tutti" ? "Tutti" : type === "tour" ? "Tour" : "Crociere"}
              </button>
            ))}
          </div>

          {/* Results */}
          {filteredDeps.length > 0 ? (
            <div className="space-y-4">
              {filteredDeps.map((dep, i) => (
                <div key={`${dep.slug}-${dep.date}-${i}`} className="bg-gray-50 rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4 border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={dep.type === "tour" ? "bg-[#1B2D4F] text-white" : "bg-[#C41E2F] text-white"}>
                        {dep.type === "tour" ? "Tour" : "Crociera"}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDate(dep.date)}</span>
                    </div>
                    <h3 className="font-semibold text-lg text-[#1B2D4F]">{dep.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><MapPin className="size-4" />{dep.destination}</span>
                      <span className="flex items-center gap-1"><Clock className="size-4" />{dep.duration}</span>
                      {dep.type === "crociera" && <span className="flex items-center gap-1"><Ship className="size-4" />Crociera Fluviale</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">da</p>
                      <p className="text-xl font-bold text-[#C41E2F]">{formatPrice(dep.price)}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs whitespace-nowrap ${
                        dep.availability === "sold out"
                          ? "border-red-500 text-red-500"
                          : dep.availability === "ultime disponibilita"
                            ? "border-orange-500 text-orange-500"
                            : "border-green-500 text-green-500"
                      }`}
                    >
                      {dep.availability}
                    </Badge>
                    <Button asChild size="sm" className="bg-[#C41E2F] hover:bg-[#A31825] text-white text-xs whitespace-nowrap">
                      <Link href={`${dep.basePath}/${dep.slug}`}>Scopri</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">
                Nessuna partenza prevista per {MONTHS_IT[currentMonth.month]} {currentMonth.year} con i filtri selezionati.
              </p>
              <p className="text-gray-400 text-sm mt-2">Prova a cambiare mese o a rimuovere i filtri.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
