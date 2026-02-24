"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Check, X, ChevronRight, MapPin as MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { parsePrice } from "@/lib/utils";
import ImageGallerySlider from "@/components/detail/ImageGallerySlider";
import BookingWidget from "@/components/detail/BookingWidget";
import QuickInfoBar from "@/components/detail/QuickInfoBar";
import SectionNav from "@/components/detail/SectionNav";
import PricingTable from "@/components/detail/PricingTable";
import SupplementsList from "@/components/detail/SupplementsList";
import ConditionsSection from "@/components/detail/ConditionsSection";
import TourConfigurator from "@/components/agenzia/TourConfigurator";
import StickyBottomBar from "@/components/shared/StickyBottomBar";
import TourCard from "@/components/cards/TourCard";
import type {
  TourWithRelations,
  TourLocation,
  TourGalleryItem,
  TourDeparture,
  TourSupplement,
} from "@/lib/types";
import type { TourListItem } from "@/lib/supabase/queries/tours";
import type { MapLocation } from "@/components/maps/ItineraryMap";

// Lazy-load the map to avoid SSR issues with Leaflet
const ItineraryMap = dynamic(() => import("@/components/maps/ItineraryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg border bg-gray-50">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <MapPinIcon className="size-8" />
        <span className="text-sm">Caricamento mappa...</span>
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCoordinate(coord: string | null): [number, number] | null {
  if (!coord) return null;
  const parts = coord.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
  return null;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TourDetailClientProps {
  tour: TourWithRelations;
  related: TourListItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TourDetailClient({ tour, related }: TourDetailClientProps) {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  const [preselectedDepId, setPreselectedDepId] = useState<string | undefined>(undefined);

  const priceNum = parsePrice(tour.a_partire_da) || null;
  const coverImage = tour.cover_image_url || "/images/placeholder.jpg";
  const destinationName = tour.destination?.name ?? "";

  const includedItems = (tour.inclusions ?? []).filter((i) => i.is_included);
  const excludedItems = (tour.inclusions ?? []).filter((i) => !i.is_included);

  // Map locations with coordinates
  const mapLocations: MapLocation[] = useMemo(() => {
    return (tour.locations ?? [])
      .map((loc: TourLocation) => {
        const coords = parseCoordinate(loc.coordinate);
        return coords ? { nome: loc.nome, coords } : null;
      })
      .filter(Boolean) as MapLocation[];
  }, [tour.locations]);

  // Match day → location index for map sync
  const dayToLocationIndex = useMemo(() => {
    return (tour.itinerary_days ?? []).map((day) => {
      const idx = mapLocations.findIndex(
        (loc) => loc.nome.toLowerCase() === day.localita?.toLowerCase()
      );
      return idx >= 0 ? idx : null;
    });
  }, [tour.itinerary_days, mapLocations]);

  // Next departure (future dates)
  const prossimaPartenza = useMemo(() => {
    const now = new Date();
    const future = (tour.departures ?? [])
      .filter((d: TourDeparture) => new Date(d.data_partenza) >= now)
      .sort((a: TourDeparture, b: TourDeparture) => new Date(a.data_partenza).getTime() - new Date(b.data_partenza).getTime());
    return future[0]?.data_partenza ?? null;
  }, [tour.departures]);

  // Gallery images
  const galleryImages = useMemo(() => {
    return (tour.gallery ?? []).map((g: TourGalleryItem) => ({
      image_url: g.image_url,
      caption: g.caption,
    }));
  }, [tour.gallery]);

  // Open configurator with optional preselected departure
  const openConfigurator = useCallback((departureId?: string) => {
    setPreselectedDepId(departureId || undefined);
    setConfiguratorOpen(true);
  }, []);

  // Section nav items
  const sections = useMemo(() => {
    const items = [
      { id: "panoramica", label: "Panoramica" },
      { id: "itinerario", label: "Itinerario" },
      { id: "incluso-escluso", label: "Incluso / Escluso" },
      { id: "date-prezzi", label: "Date e Prezzi" },
      { id: "condizioni", label: "Condizioni" },
    ];
    return items;
  }, []);

  const handleAccordionChange = useCallback(
    (value: string) => {
      if (!value) {
        setActiveDay(null);
        return;
      }
      const dayIndex = parseInt(value.replace("day-", ""), 10);
      const locIndex = dayToLocationIndex[dayIndex] ?? null;
      setActiveDay(locIndex);
    },
    [dayToLocationIndex]
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#C41E2F] transition-colors">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/tours" className="hover:text-[#C41E2F] transition-colors">Tours</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-gray-800 font-medium truncate max-w-[250px]">{tour.title}</span>
          </nav>
        </div>
      </div>

      {/* Above the fold: Slider + BookingWidget */}
      <section className="bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Slider - 3/5 */}
            <div className="lg:col-span-3">
              <ImageGallerySlider
                images={galleryImages}
                coverImage={coverImage}
                alt={tour.title}
              />
            </div>
            {/* Booking Widget - 2/5 */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-4">
                <BookingWidget
                  type="tour"
                  title={tour.title}
                  priceFrom={priceNum}
                  prezzoSuRichiesta={tour.prezzo_su_richiesta}
                  durataNotti={tour.durata_notti}
                  destinationName={destinationName}
                  programmaPdfUrl={tour.programma_pdf_url}
                  onRequestQuote={() => openConfigurator()}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-white pb-4">
        <div className="container mx-auto px-4">
          <QuickInfoBar
            durataNotti={tour.durata_notti}
            destinationName={destinationName}
            pensione={tour.pensione ?? []}
            prossimaPartenza={prossimaPartenza}
            tipoVoli={tour.tipo_voli}
          />
        </div>
      </section>

      {/* Section Nav */}
      <SectionNav sections={sections} />

      {/* Scroll sections */}
      <div className="bg-white">
        {/* Panoramica */}
        <section id="panoramica" className="py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              {tour.title}
            </h2>
            {tour.content ? (
              <div
                className="text-gray-600 leading-relaxed prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: tour.content }}
              />
            ) : (
              <p className="text-gray-500">Descrizione non ancora disponibile.</p>
            )}
          </div>
        </section>

        {/* Itinerario + Mappa */}
        <section id="itinerario" className="py-10 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              Itinerario giorno per giorno
            </h2>
            {(tour.itinerary_days ?? []).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mappa (mobile: sopra) */}
                {mapLocations.length > 0 && (
                  <div className="lg:hidden h-[250px] rounded-xl overflow-hidden border border-gray-200">
                    <ItineraryMap locations={mapLocations} activeIndex={activeDay} />
                  </div>
                )}
                {/* Accordion */}
                <div>
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    onValueChange={handleAccordionChange}
                  >
                    {tour.itinerary_days.map((day, i) => (
                      <AccordionItem key={day.id || i} value={`day-${i}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="flex items-center gap-3">
                            <Badge className="bg-[#C41E2F] text-white shrink-0">
                              Giorno {day.numero_giorno}
                            </Badge>
                            <span className="font-semibold text-[#1B2D4F]">{day.localita}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          {day.descrizione ? (
                            <div
                              className="text-gray-600 text-sm leading-relaxed pl-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: day.descrizione }}
                            />
                          ) : (
                            <p className="text-gray-500 text-sm pl-2">Descrizione non disponibile.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                {/* Mappa (desktop: destra, sticky) */}
                {mapLocations.length > 0 && (
                  <div className="hidden lg:block">
                    <div className="sticky top-28 h-[450px] rounded-xl overflow-hidden border border-gray-200">
                      <ItineraryMap locations={mapLocations} activeIndex={activeDay} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Itinerario non ancora disponibile.</p>
            )}
          </div>
        </section>

        {/* Incluso / Escluso */}
        <section id="incluso-escluso" className="py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              Incluso / Escluso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <Check className="size-5" /> La quota comprende
                </h3>
                {includedItems.length > 0 ? (
                  <ul className="space-y-2.5">
                    {includedItems.map((item, i) => (
                      <li key={item.id || i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="size-4 text-green-600 mt-0.5 shrink-0" />
                        {item.titolo}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Nessun elemento specificato.</p>
                )}
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <X className="size-5" /> La quota non comprende
                </h3>
                {excludedItems.length > 0 ? (
                  <ul className="space-y-2.5">
                    {excludedItems.map((item, i) => (
                      <li key={item.id || i} className="flex items-start gap-2 text-sm text-gray-700">
                        <X className="size-4 text-red-500 mt-0.5 shrink-0" />
                        {item.titolo}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Nessun elemento specificato.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Tabs: Date e Prezzi / Supplementi / Condizioni */}
      <section id="date-prezzi" className="py-10 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="prezzi" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto flex-wrap">
              <TabsTrigger value="prezzi" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">
                Date e Prezzi
              </TabsTrigger>
              <TabsTrigger value="supplementi" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">
                Supplementi
              </TabsTrigger>
              <TabsTrigger value="condizioni" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">
                Condizioni
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prezzi" className="pt-6">
              <PricingTable
                type="tour"
                departures={tour.departures ?? []}
                onRequestQuote={(depId) => openConfigurator(depId)}
                priceLabel1={tour.price_label_1}
                priceLabel2={tour.price_label_2}
              />
            </TabsContent>

            <TabsContent value="supplementi" className="pt-6">
              <SupplementsList
                supplements={tour.supplements ?? []}
                optionalExcursions={tour.optional_excursions ?? []}
              />
            </TabsContent>

            <TabsContent value="condizioni" className="pt-6" id="condizioni">
              <ConditionsSection
                terms={tour.terms ?? []}
                penalties={tour.penalties ?? []}
                noteImportanti={tour.note_importanti}
                notaPenali={tour.nota_penali}
                pensione={tour.pensione ?? []}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Tours */}
      {related.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              Tour Correlati
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((t) => (
                <TourCard
                  key={t.slug}
                  slug={t.slug}
                  title={t.title}
                  destination={t.destination_name ?? ""}
                  duration={t.durata_notti ?? ""}
                  priceFrom={parsePrice(t.a_partire_da)}
                  prezzoSuRichiesta={t.prezzo_su_richiesta}
                  image={t.cover_image_url || "/images/placeholder.jpg"}
                  type="tour"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Bottom Bar (mobile) */}
      {priceNum && <StickyBottomBar price={priceNum} onClick={() => openConfigurator()} />}

      {/* TourConfigurator Dialog (controlled) */}
      <TourConfigurator
        tourId={tour.id}
        tourTitle={tour.title}
        departures={tour.departures ?? []}
        supplements={tour.supplements ?? []}
        open={configuratorOpen}
        onOpenChange={setConfiguratorOpen}
        preselectedDepartureId={preselectedDepId}
        priceLabel1={tour.price_label_1}
        priceLabel2={tour.price_label_2}
      />
    </>
  );
}
