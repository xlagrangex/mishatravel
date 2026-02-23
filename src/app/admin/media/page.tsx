import { getMediaItems, getMediaFolders, getMediaFolderCounts } from "@/lib/supabase/queries/media";
import MediaLibrary from "./MediaLibrary";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const [mediaResult, folders, folderCounts] = await Promise.all([
    getMediaItems({ page: 1, pageSize: 50 }),
    getMediaFolders(),
    getMediaFolderCounts(),
  ]);

  return (
    <MediaLibrary
      initialItems={mediaResult.items}
      initialTotal={mediaResult.total}
      initialFolders={folders}
      initialCounts={folderCounts}
    />
  );
}
