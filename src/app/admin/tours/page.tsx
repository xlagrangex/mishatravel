import { getTours } from "@/lib/supabase/queries/tours";
import AdminToursTable from "./AdminToursTable";

export default async function ToursPage() {
  const tours = await getTours();
  return <AdminToursTable tours={tours} />;
}
