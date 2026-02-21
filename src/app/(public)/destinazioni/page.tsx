import { getPublishedDestinations, getTourCountsPerDestination } from "@/lib/supabase/queries/destinations";
import DestinazioniClient from "./DestinazioniClient";

export default async function DestinazioniPage() {
  const [destinations, tourCounts] = await Promise.all([
    getPublishedDestinations(),
    getTourCountsPerDestination(),
  ]);

  // Group by macro_area (same logic as the old mock helper)
  const grouped: Record<string, typeof destinations> = {};
  for (const dest of destinations) {
    const area = dest.macro_area ?? "Altro";
    if (!grouped[area]) grouped[area] = [];
    grouped[area].push(dest);
  }

  return <DestinazioniClient grouped={grouped} tourCounts={tourCounts} />;
}
