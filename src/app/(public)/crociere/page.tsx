import { getPublishedCruisesWithDepartures } from "@/lib/supabase/queries/cruises";
import { getPublishedShips } from "@/lib/supabase/queries/ships";
import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";
import CrocierePageClient from "./CrocierePageClient";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function CrocierePage() {
  const [cruisesData, shipsData, destinationsData] = await Promise.all([
    getPublishedCruisesWithDepartures(),
    getPublishedShips(),
    getPublishedDestinations(),
  ]);

  const ships = shipsData.map((s) => ({
    slug: s.slug,
    name: s.name,
    image: s.cover_image_url || "/images/placeholder.jpg",
  }));

  const fluvialDests = destinationsData
    .filter((d) => d.macro_area === "Percorsi Fluviali")
    .map((d) => ({ name: d.name, image: d.cover_image_url || "/images/placeholder.jpg" }));

  return (
    <CrocierePageClient
      cruises={cruisesData}
      ships={ships}
      destinations={fluvialDests}
    />
  );
}
