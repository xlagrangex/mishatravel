"use client";

import { useState, useMemo } from "react";
import PageHero from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UnifiedDeparture } from "@/lib/supabase/queries/departures";
import {
  ChevronLeft,
  ChevronRight,
  Ship,
  MapPin,
  Clock,
  CalendarDays,
  List,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { it } from "date-fns/locale";

const MONTHS_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type ViewMode = "calendar" | "list";

interface CalendarioPartenzeClientProps {
  departures: UnifiedDeparture[];
}

export default function CalendarioPartenzeClient({ departures }: CalendarioPartenzeClientProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [filterType, setFilterType] = useState<"tutti" | "tour" | "crociera">("tutti");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const filteredDeps = useMemo(() => {
    return departures
      .filter((d) => {
        if (filterType !== "tutti" && d.type !== filterType) return false;
        const date = new Date(d.date);
        return date.getFullYear() === currentMonth.year && date.getMonth() === currentMonth.month;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [departures, currentMonth, filterType]);

  // Group departures by day for calendar view
  const depsByDay = useMemo(() => {
    const map = new Map<string, typeof filteredDeps>();
    filteredDeps.forEach((dep) => {
      const key = dep.date.split("T")[0]; // YYYY-MM-DD
      const existing = map.get(key) || [];
      existing.push(dep);
      map.set(key, existing);
    });
    return map;
  }, [filteredDeps]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(new Date(currentMonth.year, currentMonth.month));
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Selected day departures
  const selectedDayDeps = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return depsByDay.get(key) || [];
  }, [selectedDay, depsByDay]);

  const prevMonth = () => {
    setSelectedDay(null);
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setSelectedDay(null);
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));

  const formatPrice = (price: number | null) => {
    if (price == null) return "Su richiesta";
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price);
  };

  const formatDuration = (durata: string | null) => {
    if (!durata) return null;
    const n = parseInt(durata, 10);
    if (isNaN(n)) return durata;
    return `${n} notti`;
  };

  const currentMonthDate = new Date(currentMonth.year, currentMonth.month);

  // Empty state when DB has no departures at all
  if (departures.length === 0) {
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
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <CalendarDays className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Nessuna partenza disponibile al momento.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Le date di partenza saranno pubblicate a breve. Ricontrolla presto!
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

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
          {/* Controls row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Month navigation */}
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="size-6 text-[#1B2D4F]" />
              </button>
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] min-w-[220px] text-center">
                {MONTHS_IT[currentMonth.month]} {currentMonth.year}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="size-6 text-[#1B2D4F]" />
              </button>
            </div>

            {/* Filters + View toggle */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {/* Type filters */}
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

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 hidden md:block" />

              {/* View toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "calendar"
                      ? "bg-white text-[#1B2D4F] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CalendarDays className="size-4" />
                  <span className="hidden sm:inline">Calendario</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#1B2D4F] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="size-4" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>
          </div>

          {/* Legend */}
          {viewMode === "calendar" && (
            <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#1B2D4F]" />
                Tour
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#C41E2F]" />
                Crociere
              </div>
            </div>
          )}

          {/* Calendar Grid View */}
          {viewMode === "calendar" && (
            <div className="mb-8">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS_SHORT.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-[#1B2D4F] py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 border-t border-l border-gray-200">
                {calendarDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayDeps = depsByDay.get(key) || [];
                  const inMonth = isSameMonth(day, currentMonthDate);
                  const today = isToday(day);
                  const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                  const tourCount = dayDeps.filter((d) => d.type === "tour").length;
                  const cruiseCount = dayDeps.filter((d) => d.type === "crociera").length;
                  const hasDeps = dayDeps.length > 0;

                  return (
                    <button
                      key={key}
                      onClick={() => hasDeps ? setSelectedDay(isSelected ? null : day) : undefined}
                      className={`
                        relative border-r border-b border-gray-200 p-1.5 md:p-2 min-h-[60px] md:min-h-[90px]
                        text-left transition-colors duration-200
                        ${!inMonth ? "bg-gray-50" : "bg-white"}
                        ${hasDeps ? "cursor-pointer hover:bg-blue-50/50" : "cursor-default"}
                        ${isSelected ? "bg-blue-50 ring-2 ring-inset ring-[#1B2D4F]" : ""}
                        ${today ? "ring-2 ring-inset ring-[#C41E2F]/40" : ""}
                      `}
                    >
                      {/* Day number */}
                      <span
                        className={`
                          inline-flex items-center justify-center size-6 md:size-7 rounded-full text-xs md:text-sm font-medium
                          ${!inMonth ? "text-gray-300" : today ? "bg-[#C41E2F] text-white" : "text-gray-700"}
                        `}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Departure indicators */}
                      {hasDeps && inMonth && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {/* Mobile: just dots */}
                          <div className="flex gap-1 md:hidden">
                            {tourCount > 0 && (
                              <span className="size-2 rounded-full bg-[#1B2D4F]" />
                            )}
                            {cruiseCount > 0 && (
                              <span className="size-2 rounded-full bg-[#C41E2F]" />
                            )}
                          </div>
                          {/* Desktop: mini badges */}
                          <div className="hidden md:flex flex-col gap-0.5">
                            {tourCount > 0 && (
                              <span className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-[#1B2D4F] text-white font-medium truncate">
                                {tourCount} Tour
                              </span>
                            )}
                            {cruiseCount > 0 && (
                              <span className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-[#C41E2F] text-white font-medium truncate">
                                {cruiseCount} {cruiseCount === 1 ? "Croc." : "Croc."}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected day detail panel */}
              {selectedDay && selectedDayDeps.length > 0 && (
                <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#1B2D4F]">
                    <h3 className="text-white font-semibold font-[family-name:var(--font-poppins)]">
                      Partenze del {format(selectedDay, "d MMMM yyyy", { locale: it })}
                    </h3>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {selectedDayDeps.map((dep) => (
                      <div
                        key={dep.id}
                        className="bg-white rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 border border-gray-100 shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={dep.type === "tour" ? "bg-[#1B2D4F] text-white" : "bg-[#C41E2F] text-white"}>
                              {dep.type === "tour" ? "Tour" : "Crociera"}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-[#1B2D4F]">{dep.title}</h4>
                          <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-600">
                            {dep.destination_name && (
                              <span className="flex items-center gap-1"><MapPin className="size-3.5" />{dep.destination_name}</span>
                            )}
                            {formatDuration(dep.duration) && (
                              <span className="flex items-center gap-1"><Clock className="size-3.5" />{formatDuration(dep.duration)}</span>
                            )}
                            {dep.type === "crociera" && <span className="flex items-center gap-1"><Ship className="size-3.5" />Crociera Fluviale</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">da</p>
                            <p className="text-lg font-bold text-[#C41E2F]">{formatPrice(dep.price)}</p>
                          </div>
                          <Button asChild size="sm" className="bg-[#C41E2F] hover:bg-[#A31825] text-white text-xs whitespace-nowrap">
                            <Link href={`${dep.basePath}/${dep.slug}`}>Scopri</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <>
              {filteredDeps.length > 0 ? (
                <div className="space-y-4">
                  {filteredDeps.map((dep) => (
                    <div key={dep.id} className="bg-gray-50 rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4 border border-gray-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={dep.type === "tour" ? "bg-[#1B2D4F] text-white" : "bg-[#C41E2F] text-white"}>
                            {dep.type === "tour" ? "Tour" : "Crociera"}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(dep.date)}</span>
                        </div>
                        <h3 className="font-semibold text-lg text-[#1B2D4F]">{dep.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          {dep.destination_name && (
                            <span className="flex items-center gap-1"><MapPin className="size-4" />{dep.destination_name}</span>
                          )}
                          {formatDuration(dep.duration) && (
                            <span className="flex items-center gap-1"><Clock className="size-4" />{formatDuration(dep.duration)}</span>
                          )}
                          {dep.type === "crociera" && <span className="flex items-center gap-1"><Ship className="size-4" />Crociera Fluviale</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">da</p>
                          <p className="text-xl font-bold text-[#C41E2F]">{formatPrice(dep.price)}</p>
                        </div>
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
            </>
          )}

          {/* Empty state for calendar view */}
          {viewMode === "calendar" && filteredDeps.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <CalendarDays className="size-12 text-gray-300 mx-auto mb-4" />
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
