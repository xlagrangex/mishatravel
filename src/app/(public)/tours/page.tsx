import { getPublishedToursWithDepartures } from "@/lib/supabase/queries/tours";
import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";
import { getPublishedMacroAreas } from "@/lib/supabase/queries/macro-areas";
import ToursPageClient from "./ToursPageClient";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function ToursPage() {
  const [toursData, destinationsData, macroAreasData] = await Promise.all([
    getPublishedToursWithDepartures(),
    getPublishedDestinations(),
    getPublishedMacroAreas(),
  ]);

  const destinations = destinationsData
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

  return <ToursPageClient tours={toursData} destinations={destinations} macroAreas={macroAreas} />;
}
