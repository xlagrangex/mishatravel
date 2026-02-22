import { getCruises } from "@/lib/supabase/queries/cruises";
import CrociereTable from "./CrociereTable";

export const dynamic = "force-dynamic";

export default async function CrocierePage() {
  const cruises = await getCruises();
  return <CrociereTable cruises={cruises} />;
}
