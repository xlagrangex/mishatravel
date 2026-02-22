import { getAdminAgencies, getAgencyStats } from "@/lib/supabase/queries/admin-agencies";
import AgenzieTable from "./AgenzieTable";

export const dynamic = "force-dynamic";

export default async function AgenziePage() {
  const [agencies, stats] = await Promise.all([
    getAdminAgencies(),
    getAgencyStats(),
  ]);

  return <AgenzieTable agencies={agencies} stats={stats} />;
}
