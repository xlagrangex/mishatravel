import { getCatalogs } from "@/lib/supabase/queries/catalogs";
import CataloghiTable from "./CataloghiTable";

export default async function CataloghiPage() {
  const catalogs = await getCatalogs();
  return <CataloghiTable catalogs={catalogs} />;
}
