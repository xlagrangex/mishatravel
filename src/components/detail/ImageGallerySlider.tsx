"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface GalleryImage {
  image_url: string;
  caption: string | null;
}

interface ImageGallerySliderProps {
  images: GalleryImage[];
  coverImage: string;
  alt: string;
}

export default function ImageGallerySlider({ images, coverImage, alt }: ImageGallerySliderProps) {
  const allImages: GalleryImage[] = images.length > 0
    ? images
    : [{ image_url: coverImage, caption: null }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group bg-gray-100"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={allImages[currentIndex].image_url}
            alt={allImages[currentIndex].caption || alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="size-5 text-gray-700" />
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {allImages.length}
            </div>
          )}
          {/* Arrow nav on main image */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="size-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="size-5 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all ${
                  i === currentIndex
                    ? "ring-2 ring-[#C41E2F] ring-offset-1 opacity-100"
                    : "opacity-60 hover:opacity-90"
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.caption || `${alt} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <X className="size-8" />
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={allImages[currentIndex].image_url}
              alt={allImages[currentIndex].caption || alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors"
              >
                <ChevronLeft className="size-8 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors"
              >
                <ChevronRight className="size-8 text-white" />
              </button>
            </>
          )}
          {allImages[currentIndex].caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-lg max-w-lg text-center">
              {allImages[currentIndex].caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}
