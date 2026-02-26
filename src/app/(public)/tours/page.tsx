import { getPublishedToursWithDepartures } from "@/lib/supabase/queries/tours";
import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";
import { getPublishedMacroAreas } from "@/lib/supabase/queries/macro-areas";
import {
  tours as mockTours,
  destinations as mockDestinations,
} from "@/lib/data";
import ToursPageClient from "./ToursPageClient";

export const dynamic = "force-dynamic";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function ToursPage() {
  let toursData: Awaited<ReturnType<typeof getPublishedToursWithDepartures>> = [];
  let destinationsData: Awaited<ReturnType<typeof getPublishedDestinations>> = [];
  let macroAreasData: Awaited<ReturnType<typeof getPublishedMacroAreas>> = [];

  try {
    const [t, d, m] = await Promise.all([
      getPublishedToursWithDepartures(),
      getPublishedDestinations(),
      getPublishedMacroAreas(),
    ]);
    toursData = t;
    destinationsData = d;
    macroAreasData = m;
  } catch {
    toursData = [];
    destinationsData = [];
    macroAreasData = [];
  }

  // If Supabase returns empty, fallback to mock data
  const useMock = toursData.length === 0;

  const tours = useMock
    ? mockTours.map((t) => ({
        id: t.slug,
        title: t.title,
        slug: t.slug,
        cover_image_url: t.image,
        durata_notti: t.duration,
        a_partire_da: String(t.priceFrom),
        prezzo_su_richiesta: false,
        status: "published",
        created_at: new Date().toISOString(),
        destination_id: null,
        destination_name: t.destination,
        destination_slug: t.destinationSlug,
        destination_macro_area: mockDestinations.find((d) => d.slug === t.destinationSlug)?.macroArea ?? null,
        next_departure_date: null,
        last_departure_date: null,
        departures: t.departures.map((d) => ({
          id: d.date,
          data_partenza: d.date,
          prezzo_3_stelle: d.price,
          from_city: null,
        })),
      }))
    : toursData;

  const destinations = useMock
    ? mockDestinations
        .filter((d) => d.macroArea !== "Percorsi Fluviali")
        .map((d) => ({ name: d.name, slug: d.slug, macroArea: d.macroArea }))
    : destinationsData
        .filter((d) => d.macro_area !== "Percorsi Fluviali")
        .map((d) => ({
          name: d.name,
          slug: d.slug,
          macroArea: d.macro_area ?? "Altro",
        }));

  // Macro areas for navigation boxes (exclude "Percorsi Fluviali" since tours page is for land tours)
  const macroAreas = macroAreasData
    .filter((a) => a.name !== "Percorsi Fluviali")
    .map((a) => ({
      name: a.name,
      image: a.cover_image_url || "",
    }));

  return <ToursPageClient tours={tours} destinations={destinations} macroAreas={macroAreas} />;
}
