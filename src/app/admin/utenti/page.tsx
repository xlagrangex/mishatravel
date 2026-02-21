import { getAdminUsers, getUserStats } from "@/lib/supabase/queries/admin-users";
import UtentiTable from "./UtentiTable";

export default async function UtentiPage() {
  const [users, stats] = await Promise.all([
    getAdminUsers(),
    getUserStats(),
  ]);

  return <UtentiTable users={users} stats={stats} />;
}
