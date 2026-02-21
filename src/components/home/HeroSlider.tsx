"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "NEW YORK & CASCATE DEL NIAGARA",
    subtitle: "Misha Travel Tour Operator",
    duration: "7 notti",
    price: "2.950",
    image: "/images/misc/statue-liberty-new-york-city-skyline-usa-scaled.jpg",
    href: "/tours/new-york-cascate-del-niagara",
  },
  {
    title: "TRANSIBERIANA TRANSMONGOLICA",
    subtitle: "Misha Travel Tour Operator",
    duration: "15 notti",
    price: "5.200",
    image: "/images/misc/trans-siberian-railroad-5220319_1280.jpg",
    href: "/tours/transiberiana-transmongolica",
  },
  {
    title: "MERAVIGLIE DELLA GIORDANIA",
    subtitle: "Misha Travel Tour Operator",
    duration: "7 notti",
    price: "1.000",
    image: "/images/misc/petra-4971956_1280.jpg",
    href: "/tours/meraviglie-della-giordania",
  },
  {
    title: "TOUR TURCHIA CON L'ARCHEOLOGO",
    subtitle: "Misha Travel Tour Operator",
    duration: "7 notti",
    price: "1.785",
    image: "/images/misc/sanctuary-1641539_1280.jpg",
    href: "/tours/tour-turchia-con-archeologo",
  },
  {
    title: "India: Triangolo D'oro",
    subtitle: "Misha Travel Tour Operator",
    duration: "10 notti",
    price: null,
    image: "/images/misc/screenshot-2025-08-04-alle-18.37.32.png",
    href: "/tours/india-triangolo-doro-udaipur-jodhpur-pushkar-mandawa",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
      {/* Pattern background behind everything */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/images/hero/hero-background.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      />

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl mx-auto">
              <p className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 text-white/80">
                {slide.subtitle}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-[family-name:var(--font-poppins)] mb-3 leading-tight">
                {slide.title}
              </h2>
              <p className="text-base md:text-lg text-white/80 mb-2">
                {slide.duration}
              </p>
              <p className="text-lg md:text-xl text-white/90 mb-6">
                {slide.price ? (
                  <>
                    a partire da{" "}
                    <span className="font-bold text-2xl">
                      &euro;{slide.price}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold">Prezzo su Richiesta</span>
                )}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#C41E2F] hover:bg-[#A31825] text-white px-8 py-3 text-base"
              >
                <Link href={slide.href}>Scopri di pi&ugrave;</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        aria-label="Slide precedente"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        aria-label="Slide successiva"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current
                ? "w-8 h-3 bg-white"
                : "w-3 h-3 bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Vai alla slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
