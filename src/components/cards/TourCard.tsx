import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";

interface TourCardProps {
  slug: string;
  title: string;
  destination: string;
  duration: string;
  priceFrom: number;
  prezzoSuRichiesta?: boolean;
  image: string;
  type: "tour";
  departureFrom?: string;
}

export default function TourCard({
  slug,
  title,
  destination,
  duration,
  priceFrom,
  prezzoSuRichiesta,
  image,
  departureFrom,
}: TourCardProps) {
  const formattedPrice = prezzoSuRichiesta
    ? null
    : new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(priceFrom);

  return (
    <Link href={`/tours/${slug}`} className="group h-full">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Destination badge - top left */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-[#C41E2F] text-white">
              <MapPin className="size-3" />
              {destination}
            </span>
          </div>

          {/* Duration badge - top right */}
          {duration && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/90 text-[#1B2D4F] backdrop-blur-sm">
                <Clock className="size-3" />
                {duration}
              </span>
            </div>
          )}

          {/* Price overlay - bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#1B2D4F]/80 text-white backdrop-blur-sm">
              Tour
            </span>
            {prezzoSuRichiesta ? (
              <span className="text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                Prezzo su richiesta
              </span>
            ) : formattedPrice ? (
              <span className="text-sm font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                da {formattedPrice}
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold text-[15px] text-[#1B2D4F] font-[family-name:var(--font-poppins)] line-clamp-2 group-hover:text-[#C41E2F] transition-colors leading-snug">
            {title}
          </h3>

          {departureFrom && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="size-3" />
              Partenza da {departureFrom}
            </span>
          )}

          {/* CTA */}
          <div className="mt-auto pt-3">
            <span className="inline-flex items-center text-sm font-semibold text-[#C41E2F] group-hover:gap-2 gap-1 transition-all duration-300">
              Scopri di pi&ugrave;
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
