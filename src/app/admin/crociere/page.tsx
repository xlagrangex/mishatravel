import { getCruises } from "@/lib/supabase/queries/cruises";
import CrociereTable from "./CrociereTable";

export default async function CrocierePage() {
  const cruises = await getCruises();
  return <CrociereTable cruises={cruises} />;
}
