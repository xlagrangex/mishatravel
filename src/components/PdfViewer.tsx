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
  const [spread, setSpread] = useState(1); // first page of the current spread
  const [zoomIndex, setZoomIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [baseWidth, setBaseWidth] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use 2-page spread on desktop, 1 on small screens
  const [isMobile, setIsMobile] = useState(false);
  const pagesPerSpread = isMobile ? 1 : 2;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  // Navigate by pagesPerSpread
  const prevSpread = () => {
    setTransitioning(true);
    setTimeout(() => {
      setSpread((s) => Math.max(1, s - pagesPerSpread));
      setTransitioning(false);
    }, 150);
  };
  const nextSpread = () => {
    setTransitioning(true);
    setTimeout(() => {
      setSpread((s) => Math.min(numPages, s + pagesPerSpread));
      setTransitioning(false);
    }, 150);
  };

  const handleZoomIn = () =>
    setZoomIndex((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1));
  const handleZoomOut = () => setZoomIndex((z) => Math.max(0, z - 1));

  const scale = ZOOM_LEVELS[zoomIndex];

  // Width per single page: half the container for 2-page, full for 1-page
  const pageGap = 4; // gap in px between pages
  const inlinePageWidth =
    baseWidth > 0
      ? (pagesPerSpread === 2
          ? (baseWidth - pageGap) / 2
          : baseWidth) * scale
      : undefined;

  const fullscreenPageWidth =
    (pagesPerSpread === 2 ? 440 : 700) * scale;

  // Which pages to render in the current spread
  const getSpreadPages = (startPage: number) => {
    const pages: number[] = [startPage];
    if (pagesPerSpread === 2 && startPage + 1 <= numPages) {
      pages.push(startPage + 1);
    }
    return pages;
  };

  // Human-readable spread label
  const spreadLabel =
    pagesPerSpread === 2 && spread + 1 <= numPages
      ? `${spread}-${spread + 1} / ${numPages}`
      : `${spread} / ${numPages}`;

  const isAtStart = spread <= 1;
  const isAtEnd = spread + pagesPerSpread > numPages;

  const loadingSpinner = (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 300 }}
    >
      <Loader2 className="size-7 animate-spin text-[#C41E2F]" />
    </div>
  );

  const errorFallback = (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
      <p>Impossibile caricare il PDF.</p>
      <Button asChild variant="outline" size="sm">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Apri in una nuova scheda
        </a>
      </Button>
    </div>
  );

  const renderPages = (pageWidth: number | undefined) => (
    <div
      className="flex items-start justify-center transition-opacity duration-200 ease-in-out"
      style={{
        gap: pageGap,
        opacity: transitioning ? 0 : 1,
      }}
    >
      {getSpreadPages(spread).map((pNum) => (
        <div
          key={pNum}
          className="shadow-md bg-white rounded-sm overflow-hidden"
        >
          {PdfComponents && (
            <PdfComponents.Page
              pageNumber={pNum}
              width={pageWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderControls = (isFullscreen: boolean) => (
    <div className="flex items-center justify-between bg-[#1B2D4F] text-white px-3 py-1.5 rounded-b-lg sm:px-4">
      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSpread}
          disabled={isAtStart}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-7"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="text-xs tabular-nums min-w-[60px] text-center">
          {spreadLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSpread}
          disabled={isAtEnd}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-7"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      {/* Zoom (hidden on small screens) */}
      <div className="hidden sm:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoomIndex <= 0}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-7"
        >
          <ZoomOut className="size-3.5" />
        </Button>
        <span className="text-xs tabular-nums min-w-[40px] text-center">
          {ZOOM_LABELS[zoomIndex]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
          className="text-white hover:bg-white/20 disabled:opacity-30 size-7"
        >
          <ZoomIn className="size-3.5" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!isFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFullscreen(true)}
            className="text-white hover:bg-white/20 size-7"
          >
            <Maximize2 className="size-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-white hover:bg-white/20 size-7"
        >
          <a href={url} download target="_blank" rel="noopener noreferrer">
            <Download className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );

  const { Document } = PdfComponents ?? {};

  return (
    <>
      {/* Inline viewer */}
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div
          className="overflow-auto bg-gray-100 flex justify-center"
          style={{ maxHeight: "55vh" }}
        >
          <div className="py-3 px-3">
            {Document ? (
              <Document
                file={url}
                onLoadSuccess={onLoadSuccess}
                loading={loadingSpinner}
                error={errorFallback}
              >
                {renderPages(inlinePageWidth)}
              </Document>
            ) : (
              loadingSpinner
            )}
          </div>
        </div>
        {loaded && numPages > 0 && renderControls(false)}
      </div>

      {/* Fullscreen dialog */}
      {Document && (
        <Dialog open={fullscreen} onOpenChange={setFullscreen}>
          <DialogContent
            className="max-w-[95vw] h-[90vh] w-full p-0 gap-0 flex flex-col sm:max-w-[95vw]"
            showCloseButton
          >
            <DialogTitle className="sr-only">
              {title || "Catalogo PDF"}
            </DialogTitle>
            <div className="flex-1 overflow-auto bg-gray-100 flex justify-center min-h-0">
              <div className="py-3 px-3">
                <Document
                  file={url}
                  loading={loadingSpinner}
                  error={errorFallback}
                >
                  {renderPages(fullscreenPageWidth)}
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
