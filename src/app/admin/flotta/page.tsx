import { getShips } from "@/lib/supabase/queries/ships";
import FlottaTable from "./FlottaTable";

export const dynamic = "force-dynamic";

export default async function FlottaPage() {
  const ships = await getShips();
  return <FlottaTable ships={ships} />;
}
