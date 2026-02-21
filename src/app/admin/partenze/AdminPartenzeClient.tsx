"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  List,
  Plane,
  Ship,
  CalendarCheck,
  MapPin,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  addDays,
} from "date-fns";
import { it } from "date-fns/locale";
import type { AdminDeparture } from "@/lib/supabase/queries/departures";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTHS_IT = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type ViewMode = "calendar" | "list";
type TypeFilter = "tutti" | "tour" | "crociera";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AdminPartenzeClientProps {
  departures: AdminDeparture[];
  destinations: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminPartenzeClient({
  departures,
  destinations,
}: AdminPartenzeClientProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [filterType, setFilterType] = useState<TypeFilter>("tutti");
  const [filterDest, setFilterDest] = useState<string>("tutte");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // -----------------------------------------------------------------------
  // Stats
  // -----------------------------------------------------------------------

  const stats = useMemo(() => {
    const total = departures.length;
    const tours = departures.filter((d) => d.type === "tour").length;
    const cruises = departures.filter((d) => d.type === "crociera").length;
    const now = new Date();
    const thirtyDaysLater = addDays(now, 30);
    const next30 = departures.filter((d) => {
      const date = new Date(d.date);
      return date >= now && date <= thirtyDaysLater;
    }).length;
    return [
      { label: "Partenze Totali", value: String(total), icon: Calendar },
      { label: "Partenze Tour", value: String(tours), icon: Plane },
      { label: "Partenze Crociere", value: String(cruises), icon: Ship },
      { label: "Prossime 30gg", value: String(next30), icon: CalendarCheck },
    ];
  }, [departures]);

  // -----------------------------------------------------------------------
  // Filtered departures for current month
  // -----------------------------------------------------------------------

  const filteredDeps = useMemo(() => {
    return departures
      .filter((d) => {
        if (filterType !== "tutti" && d.type !== filterType) return false;
        if (filterDest !== "tutte" && d.destination_name !== filterDest)
          return false;
        const date = new Date(d.date);
        return (
          date.getFullYear() === currentMonth.year &&
          date.getMonth() === currentMonth.month
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [departures, currentMonth, filterType, filterDest]);

  // Group departures by day for calendar view
  const depsByDay = useMemo(() => {
    const map = new Map<string, typeof filteredDeps>();
    filteredDeps.forEach((dep) => {
      const key = dep.date.split("T")[0];
      const existing = map.get(key) || [];
      existing.push(dep);
      map.set(key, existing);
    });
    return map;
  }, [filteredDeps]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(
      new Date(currentMonth.year, currentMonth.month)
    );
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Selected day departures
  const selectedDayDeps = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return depsByDay.get(key) || [];
  }, [selectedDay, depsByDay]);

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  const getEditUrl = (dep: AdminDeparture) => {
    return dep.type === "tour"
      ? `/admin/tours/${dep.parent_id}/modifica`
      : `/admin/crociere/${dep.parent_id}/modifica`;
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));

  const formatPrice = (price: number | null) => {
    if (price == null) return "N/D";
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (durata: string | null) => {
    if (!durata) return null;
    const n = parseInt(durata, 10);
    if (isNaN(n)) return durata;
    return `${n} notti`;
  };

  const currentMonthDate = new Date(currentMonth.year, currentMonth.month);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Calendario Partenze
        </h1>
        <p className="text-sm text-muted-foreground">
          Vista calendario di tutte le partenze tour e crociere (sola lettura)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-muted p-3 text-muted-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Month navigation */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-heading min-w-[200px] text-center text-lg font-semibold text-secondary">
                {MONTHS_IT[currentMonth.month]} {currentMonth.year}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters and view toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Type filter */}
              <Select
                value={filterType}
                onValueChange={(v) => setFilterType(v as TypeFilter)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti i tipi</SelectItem>
                  <SelectItem value="tour">Solo Tour</SelectItem>
                  <SelectItem value="crociera">Solo Crociere</SelectItem>
                </SelectContent>
              </Select>

              {/* Destination filter */}
              <Select
                value={filterDest}
                onValueChange={(v) => setFilterDest(v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Destinazione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutte">Tutte le destinazioni</SelectItem>
                  {destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View toggle */}
              <div className="flex rounded-lg border bg-muted p-1">
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="gap-1.5"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendario</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-1.5"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Lista</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      {viewMode === "calendar" && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-full bg-[#1B2D4F]" />
            Tour
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-full bg-[#C41E2F]" />
            Crociere
          </div>
          <span className="text-xs text-muted-foreground/60">
            {filteredDeps.length} partenze nel mese
          </span>
        </div>
      )}

      {/* Calendar Grid View */}
      {viewMode === "calendar" && (
        <Card>
          <CardContent className="p-4">
            {/* Weekday headers */}
            <div className="mb-2 grid grid-cols-7">
              {WEEKDAYS_SHORT.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-semibold text-secondary"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 border-l border-t border-border">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayDeps = depsByDay.get(key) || [];
                const inMonth = isSameMonth(day, currentMonthDate);
                const today = isToday(day);
                const isSelected = selectedDay
                  ? isSameDay(day, selectedDay)
                  : false;
                const tourCount = dayDeps.filter(
                  (d) => d.type === "tour"
                ).length;
                const cruiseCount = dayDeps.filter(
                  (d) => d.type === "crociera"
                ).length;
                const hasDeps = dayDeps.length > 0;

                return (
                  <button
                    key={key}
                    onClick={() =>
                      hasDeps
                        ? setSelectedDay(isSelected ? null : day)
                        : undefined
                    }
                    className={`
                      relative min-h-[60px] border-b border-r border-border p-1.5 text-left transition-colors duration-200 md:min-h-[90px] md:p-2
                      ${!inMonth ? "bg-muted/30" : "bg-background"}
                      ${hasDeps ? "cursor-pointer hover:bg-accent/50" : "cursor-default"}
                      ${isSelected ? "bg-accent ring-2 ring-inset ring-primary" : ""}
                      ${today ? "ring-2 ring-inset ring-[#C41E2F]/40" : ""}
                    `}
                  >
                    {/* Day number */}
                    <span
                      className={`
                        inline-flex size-6 items-center justify-center rounded-full text-xs font-medium md:size-7 md:text-sm
                        ${!inMonth ? "text-muted-foreground/40" : today ? "bg-[#C41E2F] text-white" : "text-foreground"}
                      `}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Departure indicators */}
                    {hasDeps && inMonth && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {/* Mobile: dots */}
                        <div className="flex gap-1 md:hidden">
                          {tourCount > 0 && (
                            <span className="size-2 rounded-full bg-[#1B2D4F]" />
                          )}
                          {cruiseCount > 0 && (
                            <span className="size-2 rounded-full bg-[#C41E2F]" />
                          )}
                        </div>
                        {/* Desktop: mini badges */}
                        <div className="hidden flex-col gap-0.5 md:flex">
                          {tourCount > 0 && (
                            <span className="truncate rounded bg-[#1B2D4F] px-1.5 py-0.5 text-[10px] leading-tight font-medium text-white">
                              {tourCount} Tour
                            </span>
                          )}
                          {cruiseCount > 0 && (
                            <span className="truncate rounded bg-[#C41E2F] px-1.5 py-0.5 text-[10px] leading-tight font-medium text-white">
                              {cruiseCount} Croc.
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
              <div className="mt-6 overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between bg-secondary px-5 py-3">
                  <h3 className="font-heading font-semibold text-white">
                    Partenze del{" "}
                    {format(selectedDay, "d MMMM yyyy", { locale: it })}
                  </h3>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="space-y-3 p-4">
                  {selectedDayDeps.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm md:flex-row md:items-center"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            className={
                              dep.type === "tour"
                                ? "bg-[#1B2D4F] text-white"
                                : "bg-[#C41E2F] text-white"
                            }
                          >
                            {dep.type === "tour" ? "Tour" : "Crociera"}
                          </Badge>
                          {dep.status && dep.status !== "published" && (
                            <Badge variant="outline" className="text-xs">
                              {dep.status === "draft" ? "Bozza" : dep.status}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-secondary">
                          {dep.title}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {dep.destination_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3.5" />
                              {dep.destination_name}
                            </span>
                          )}
                          {formatDuration(dep.duration) && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {formatDuration(dep.duration)}
                            </span>
                          )}
                          <span className="font-medium">
                            {formatPrice(dep.price)}
                          </span>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={getEditUrl(dep)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Modifica{" "}
                          {dep.type === "tour" ? "Tour" : "Crociera"}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* List / Table View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            {filteredDeps.length > 0 ? (
              <div className="rounded-lg bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Titolo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Destinazione</TableHead>
                      <TableHead>Durata</TableHead>
                      <TableHead>Prezzo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeps.map((dep) => (
                      <TableRow key={dep.id}>
                        <TableCell>
                          <Badge
                            className={
                              dep.type === "tour"
                                ? "bg-[#1B2D4F] text-white"
                                : "bg-[#C41E2F] text-white"
                            }
                          >
                            {dep.type === "tour" ? "Tour" : "Crociera"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={getEditUrl(dep)}
                            className="hover:text-primary hover:underline"
                          >
                            {dep.title}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(dep.date)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {dep.destination_name ?? "---"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDuration(dep.duration) ?? "---"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(dep.price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              dep.status === "published"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }
                          >
                            {dep.status === "published"
                              ? "Pubblicato"
                              : "Bozza"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                          >
                            <Link href={getEditUrl(dep)}>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Modifica
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">
                  Nessuna partenza per {MONTHS_IT[currentMonth.month]}{" "}
                  {currentMonth.year}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prova a cambiare mese o a rimuovere i filtri.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state for calendar view */}
      {viewMode === "calendar" && filteredDeps.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessuna partenza per {MONTHS_IT[currentMonth.month]}{" "}
            {currentMonth.year} con i filtri selezionati
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prova a cambiare mese o a rimuovere i filtri.
          </p>
        </div>
      )}
    </div>
  );
}
