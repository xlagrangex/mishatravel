import { getCatalogs } from "@/lib/supabase/queries/catalogs";
import CataloghiTable from "./CataloghiTable";

export const dynamic = "force-dynamic";

export default async function CataloghiPage() {
  const catalogs = await getCatalogs();
  return <CataloghiTable catalogs={catalogs} />;
}
