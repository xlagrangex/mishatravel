import { getAdminDepartures } from "@/lib/supabase/queries/departures";
import AdminPartenzeClient from "./AdminPartenzeClient";

export const dynamic = "force-dynamic";

export default async function PartenzePage() {
  const { departures, destinations } = await getAdminDepartures();

  return (
    <AdminPartenzeClient departures={departures} destinations={destinations} />
  );
}
