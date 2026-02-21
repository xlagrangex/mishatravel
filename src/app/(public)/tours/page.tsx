import { getPublishedToursWithDepartures } from "@/lib/supabase/queries/tours";
import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";
import {
  tours as mockTours,
  destinations as mockDestinations,
} from "@/lib/data";
import ToursPageClient from "./ToursPageClient";

export default async function ToursPage() {
  let toursData: Awaited<ReturnType<typeof getPublishedToursWithDepartures>> = [];
  let destinationsData: Awaited<ReturnType<typeof getPublishedDestinations>> = [];

  try {
    const [t, d] = await Promise.all([
      getPublishedToursWithDepartures(),
      getPublishedDestinations(),
    ]);
    toursData = t;
    destinationsData = d;
  } catch {
    toursData = [];
    destinationsData = [];
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
        status: "published",
        created_at: new Date().toISOString(),
        destination_id: null,
        destination_name: t.destination,
        destination_slug: t.destinationSlug,
        destination_macro_area: mockDestinations.find((d) => d.slug === t.destinationSlug)?.macroArea ?? null,
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

  return <ToursPageClient tours={tours} destinations={destinations} />;
}
