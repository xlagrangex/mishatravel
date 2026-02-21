import { getAdminDepartures } from "@/lib/supabase/queries/departures";
import AdminPartenzeClient from "./AdminPartenzeClient";

export default async function PartenzePage() {
  const { departures, destinations } = await getAdminDepartures();

  return (
    <AdminPartenzeClient departures={departures} destinations={destinations} />
  );
}
