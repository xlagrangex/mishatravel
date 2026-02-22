import { getTours } from "@/lib/supabase/queries/tours";
import AdminToursTable from "./AdminToursTable";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const tours = await getTours();
  return <AdminToursTable tours={tours} />;
}
