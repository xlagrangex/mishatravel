import { getPublishedCruisesWithDepartures, type CruiseListItemEnriched } from "@/lib/supabase/queries/cruises";
import { getPublishedShips, type ShipListItem } from "@/lib/supabase/queries/ships";
import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";
import type { Destination } from "@/lib/types";
import {
  cruises as mockCruises,
  ships as mockShips,
  destinations as mockDestinations,
} from "@/lib/data";
import CrocierePageClient from "./CrocierePageClient";

export default async function CrocierePage() {
  let cruisesData: CruiseListItemEnriched[] = [];
  let shipsData: ShipListItem[] = [];
  let destinationsData: (Destination & { macro_area?: string | null; cover_image_url?: string | null })[] = [];

  try {
    const [c, s, d] = await Promise.all([
      getPublishedCruisesWithDepartures(),
      getPublishedShips(),
      getPublishedDestinations(),
    ]);
    cruisesData = c;
    shipsData = s;
    destinationsData = d as typeof destinationsData;
  } catch {
    // Fallback to empty, will trigger mock data
  }

  // If Supabase returns empty, fallback to mock data
  const useMock = cruisesData.length === 0;

  const cruises: CruiseListItemEnriched[] = useMock
    ? mockCruises.map((c) => ({
        id: c.slug,
        title: c.title,
        slug: c.slug,
        cover_image_url: c.image,
        durata_notti: c.duration,
        a_partire_da: String(c.priceFrom),
        tipo_crociera: "Crociera di Gruppo",
        status: "published",
        created_at: new Date().toISOString(),
        ship_id: null,
        destination_id: null,
        ship_name: c.ship,
        destination_name: c.river,
        destination_macro_area: "Percorsi Fluviali",
        departures: c.departures.map((d) => ({
          id: d.date,
          data_partenza: d.date,
          prezzo_main_deck: d.price,
          from_city: null,
        })),
      }))
    : cruisesData;

  const ships = useMock
    ? mockShips.map((s) => ({ slug: s.slug, name: s.name, image: s.image }))
    : shipsData.map((s) => ({ slug: s.slug, name: s.name, image: s.cover_image_url || "/images/placeholder.jpg" }));

  const fluvialDests = useMock
    ? mockDestinations
        .filter((d) => d.macroArea === "Percorsi Fluviali")
        .map((d) => ({ name: d.name, image: d.image }))
    : destinationsData
        .filter((d) => (d as any).macro_area === "Percorsi Fluviali")
        .map((d) => ({ name: d.name, image: (d as any).cover_image_url || "/images/placeholder.jpg" }));

  return (
    <CrocierePageClient
      cruises={cruises}
      ships={ships}
      destinations={fluvialDests}
    />
  );
}
