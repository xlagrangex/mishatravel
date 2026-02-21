import { getMediaItems } from "@/lib/supabase/queries/media";
import MediaGrid from "./MediaGrid";

export default async function MediaPage() {
  const items = await getMediaItems();
  return <MediaGrid items={items} />;
}
