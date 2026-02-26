"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageIcon, FileText } from "lucide-react";
import MediaLibrary from "./MediaLibrary";
import PdfLibrary from "./PdfLibrary";
import type { MediaItem, MediaFolder } from "@/lib/types";

interface MediaPageTabsProps {
  imageItems: MediaItem[];
  imageTotal: number;
  imageFolders: MediaFolder[];
  imageCounts: Record<string, number>;
  pdfItems: MediaItem[];
  pdfTotal: number;
  pdfFolders: MediaFolder[];
  pdfCounts: Record<string, number>;
}

export default function MediaPageTabs({
  imageItems,
  imageTotal,
  imageFolders,
  imageCounts,
  pdfItems,
  pdfTotal,
  pdfFolders,
  pdfCounts,
}: MediaPageTabsProps) {
  return (
    <Tabs defaultValue="immagini" className="space-y-4">
      <TabsList>
        <TabsTrigger value="immagini" className="gap-1.5">
          <ImageIcon className="size-4" />
          Immagini
        </TabsTrigger>
        <TabsTrigger value="pdf" className="gap-1.5">
          <FileText className="size-4" />
          Documenti PDF
        </TabsTrigger>
      </TabsList>

      <TabsContent value="immagini" className="mt-0">
        <MediaLibrary
          initialItems={imageItems}
          initialTotal={imageTotal}
          initialFolders={imageFolders}
          initialCounts={imageCounts}
        />
      </TabsContent>

      <TabsContent value="pdf" className="mt-0">
        <PdfLibrary
          initialItems={pdfItems}
          initialTotal={pdfTotal}
          initialFolders={pdfFolders}
          initialCounts={pdfCounts}
        />
      </TabsContent>
    </Tabs>
  );
}
