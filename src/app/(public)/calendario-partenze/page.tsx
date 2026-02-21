import { getAllDepartures } from "@/lib/supabase/queries/departures";
import CalendarioPartenzeClient from "./CalendarioPartenzeClient";

export default async function CalendarioPartenzePage() {
  const departures = await getAllDepartures();

  return <CalendarioPartenzeClient departures={departures} />;
}
