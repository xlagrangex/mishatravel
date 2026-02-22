import { getDestinations } from "@/lib/supabase/queries/destinations";
import DestinazioniTable from "./DestinazioniTable";

export const dynamic = "force-dynamic";

export default async function DestinazioniPage() {
  const destinations = await getDestinations();
  return <DestinazioniTable destinations={destinations} />;
}
