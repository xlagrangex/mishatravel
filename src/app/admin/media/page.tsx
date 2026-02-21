import { getStorageFiles, STORAGE_BUCKETS } from "@/lib/supabase/queries/media";
import MediaGrid from "./MediaGrid";

export default async function MediaPage() {
  const items = await getStorageFiles();
  return <MediaGrid items={items} buckets={[...STORAGE_BUCKETS]} />;
}
