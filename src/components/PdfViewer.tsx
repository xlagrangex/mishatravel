"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ComponentType,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const ZOOM_LEVELS = [1, 1.25, 1.5];
const ZOOM_LABELS = ["Adatta", "125%", "150%"];

interface PdfViewerProps {
  url: string;
  title?: string;
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [PdfComponents, setPdfComponents] = useState<{
    Document: ComponentType<any>;
    Page: ComponentType<any>;
  } | null>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [baseWidth, setBaseWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamically load react-pdf (avoids SSR issues with pdfjs-dist)
  useEffect(() => {
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfComponents({ Document: mod.Document, Page: mod.Page });
    });
  }, []);

  // Measure container width for responsive PDF rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBaseWidth(entry.contentRect.width - 32);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      setLoaded(true);
    },
    [],
  );

  const prevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNumber((p) => Math.min(numPages, p + 1));
  const handleZoomIn = () =>
    setZoomIndex((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1));
  const handleZoomOut = () => setZoomIndex((z) => Math.max(0, z - 1));

  const scale = ZOOM_LEVELS[zoomIndex];
  const inlineWidth = baseWidth > 0 ? baseWidth * scale : undefined;
  const fullscreenWidth = 800 * scale;

  const loadingSpinner = (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 400 }}
    >
      <Loader2 className="size-8 animate-spin text-[#C41E2F]" />
    </div>
  );

  const errorFallback = (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
      <p>Impossibile caricare il PDF.</p>
      <Button asChild variant="outline" size="sm">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Apri in una nuova scheda
        </a>
      </Button>
    </div>
  );

  const renderControls = (isFullscreen: boolean) => (
    <div className="flex items-center justify-between bg-[#1B2D4F] text-white px-3 py-2 rounded-b-lg sm:px-4">
      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevPage}
          disabled={pageNumber <= 1}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-8"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm tabular-nums min-w-[70px] text-center">
          {pageNumber} / {numPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          disabled={pageNumber >= numPages}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-8"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Zoom (hidden on small screens) */}
      <div className="hidden sm:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoomIndex <= 0}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-8"
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="text-xs tabular-nums min-w-[48px] text-center">
          {ZOOM_LABELS[zoomIndex]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-8"
        >
          <ZoomIn className="size-4" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!isFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFullscreen(true)}
            className="text-white hover:bg-white/20 size-8"
          >
            <Maximize2 className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-white hover:bg-white/20 size-8"
        >
          <a href={url} download target="_blank" rel="noopener noreferrer">
            <Download className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );

  const { Document, Page } = PdfComponents ?? {};

  return (
    <>
      {/* Inline viewer */}
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div
          className="overflow-auto bg-gray-100 flex justify-center"
          style={{ maxHeight: "75vh" }}
        >
          <div className="py-4 px-4">
            {Document && Page ? (
              <Document
                file={url}
                onLoadSuccess={onLoadSuccess}
                loading={loadingSpinner}
                error={errorFallback}
              >
                <Page
                  pageNumber={pageNumber}
                  width={inlineWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            ) : (
              loadingSpinner
            )}
          </div>
        </div>
        {loaded && numPages > 0 && renderControls(false)}
      </div>

      {/* Fullscreen dialog */}
      {Document && Page && (
        <Dialog open={fullscreen} onOpenChange={setFullscreen}>
          <DialogContent
            className="max-w-[95vw] h-[90vh] w-full p-0 gap-0 flex flex-col sm:max-w-[95vw]"
            showCloseButton
          >
            <DialogTitle className="sr-only">
              {title || "Catalogo PDF"}
            </DialogTitle>
            <div className="flex-1 overflow-auto bg-gray-100 flex justify-center min-h-0">
              <div className="py-4 px-4">
                <Document
                  file={url}
                  loading={loadingSpinner}
                  error={errorFallback}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={fullscreenWidth}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </Document>
              </div>
            </div>
            {renderControls(true)}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
