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
        {/* Image — only type badge */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            quality={60}
            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 30vw"
          />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#1B2D4F] text-white">
              Tour
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-[15px] text-[#1B2D4F] font-[family-name:var(--font-poppins)] line-clamp-2 group-hover:text-[#C41E2F] transition-colors leading-snug mb-3">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 mb-3">
            {destination && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#C41E2F]" />
                {destination}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-[#C41E2F]" />
                {duration}
              </span>
            )}
            {departureFrom && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-gray-400" />
                Partenza da {departureFrom}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            {prezzoSuRichiesta ? (
              <p className="text-sm font-semibold text-[#C41E2F]">Prezzo su richiesta</p>
            ) : formattedPrice ? (
              <p className="text-xs text-gray-400">
                da{" "}
                <span className="font-bold text-[#C41E2F] text-lg">
                  {formattedPrice}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
