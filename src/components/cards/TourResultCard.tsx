"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateIT, getNextDeparture } from "@/lib/filters";

interface TourResultCardProps {
  slug: string;
  title: string;
  destination: string;
  duration: string;
  priceFrom: number;
  prezzoSuRichiesta?: boolean;
  image: string;
  departures: { data_partenza: string; prezzo_3_stelle: number | null }[];
  onCompareToggle?: () => void;
  isCompared?: boolean;
}

export default function TourResultCard({
  slug,
  title,
  destination,
  duration,
  priceFrom,
  prezzoSuRichiesta,
  image,
  departures,
  onCompareToggle,
  isCompared,
}: TourResultCardProps) {
  const nextDep = getNextDeparture(departures);

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-64 lg:w-72 h-48 md:h-auto shrink-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 280px"
          />
          <Badge className="absolute top-3 left-3 bg-gray-800 text-white">Tour</Badge>
          {onCompareToggle && (
            <button
              onClick={(e) => { e.preventDefault(); onCompareToggle(); }}
              className={`absolute top-3 right-3 size-7 rounded-full flex items-center justify-center transition-colors ${
                isCompared ? "bg-[#C41E2F] text-white" : "bg-white/80 text-gray-600 hover:bg-white"
              }`}
              title="Confronta"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-5 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 font-[family-name:var(--font-poppins)] group-hover:text-[#C41E2F] transition-colors line-clamp-2">
              <Link href={`/tours/${slug}`}>{title}</Link>
            </h3>

            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="size-3.5" />{destination}</span>
              <span className="flex items-center gap-1"><Clock className="size-3.5" />{duration}</span>
            </div>

            {nextDep && (
              <div className="flex items-center gap-1.5 mt-3 text-sm">
                <Calendar className="size-3.5 text-[#C41E2F]" />
                <span className="text-gray-600">
                  Prossima partenza: <strong className="text-gray-800">{formatDateIT(nextDep.data_partenza)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              {prezzoSuRichiesta ? (
                <span className="text-lg font-bold text-[#C41E2F]">Prezzo su richiesta</span>
              ) : (
                <>
                  <span className="text-xs text-gray-500">da</span>
                  <span className="text-2xl font-bold text-[#C41E2F] ml-1">{formatPrice(priceFrom)}</span>
                  <span className="text-xs text-gray-500 ml-1">/ persona</span>
                </>
              )}
            </div>
            <Link
              href={`/tours/${slug}`}
              className="px-5 py-2 bg-[#C41E2F] hover:bg-[#A31825] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Scopri
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
