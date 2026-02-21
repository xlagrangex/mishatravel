import { getAllDepartures } from "@/lib/supabase/queries/departures";
import CalendarioPartenzeClient from "./CalendarioPartenzeClient";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function CalendarioPartenzePage() {
  const departures = await getAllDepartures();

  return <CalendarioPartenzeClient departures={departures} />;
}
