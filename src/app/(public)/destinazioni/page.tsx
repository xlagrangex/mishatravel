import { getPublishedDestinations, getTourCountsPerDestination } from "@/lib/supabase/queries/destinations";
import DestinazioniClient from "./DestinazioniClient";

export const dynamic = "force-dynamic";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export default async function DestinazioniPage() {
  const [destinations, tourCounts] = await Promise.all([
    getPublishedDestinations(),
    getTourCountsPerDestination(),
  ]);

  // Reclassify destinations that would land in "Altro" to more specific areas
  const RECLASSIFY: Record<string, string> = {
    "scozia": "Europa",
    "irlanda": "Europa",
    "islanda": "Europa",
  };

  // Group by macro_area
  const grouped: Record<string, typeof destinations> = {};
  for (const dest of destinations) {
    let area = dest.macro_area ?? "Altro";
    // If destination falls into "Altro", try to reclassify by name
    if (area === "Altro") {
      const nameKey = dest.name.toLowerCase();
      for (const [keyword, targetArea] of Object.entries(RECLASSIFY)) {
        if (nameKey.includes(keyword)) {
          area = targetArea;
          break;
        }
      }
    }
    if (!grouped[area]) grouped[area] = [];
    grouped[area].push(dest);
  }
  // Remove "Altro" if it's empty after reclassification
  if (grouped["Altro"]?.length === 0) delete grouped["Altro"];

  return <DestinazioniClient grouped={grouped} tourCounts={tourCounts} />;
}
