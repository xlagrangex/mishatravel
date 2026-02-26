import { getMediaItems, getMediaFolders, getMediaFolderCounts, getPdfFolders, getPdfFolderCounts } from "@/lib/supabase/queries/media";
import MediaPageTabs from "./MediaPageTabs";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const [imageResult, imageFolders, imageCounts, pdfResult, pdfFolders, pdfCounts] = await Promise.all([
    getMediaItems({ page: 1, pageSize: 50 }),
    getMediaFolders(),
    getMediaFolderCounts(),
    getMediaItems({ page: 1, pageSize: 50, mimeTypePrefix: "application/pdf" }),
    getPdfFolders(),
    getPdfFolderCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-poppins)]">
          Media Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestisci immagini e documenti PDF.
        </p>
      </div>
      <MediaPageTabs
        imageItems={imageResult.items}
        imageTotal={imageResult.total}
        imageFolders={imageFolders}
        imageCounts={imageCounts}
        pdfItems={pdfResult.items}
        pdfTotal={pdfResult.total}
        pdfFolders={pdfFolders}
        pdfCounts={pdfCounts}
      />
    </div>
  );
}
