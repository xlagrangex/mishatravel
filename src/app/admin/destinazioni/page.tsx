import { getDestinations } from "@/lib/supabase/queries/destinations";
import DestinazioniTable from "./DestinazioniTable";

export default async function DestinazioniPage() {
  const destinations = await getDestinations();
  return <DestinazioniTable destinations={destinations} />;
}
