import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Ship } from "lucide-react";

interface CruiseCardProps {
  slug: string;
  title: string;
  ship: string;
  river: string;
  duration: string;
  priceFrom: number;
  prezzoSuRichiesta?: boolean;
  image: string;
}

export default function CruiseCard({
  slug,
  title,
  ship,
  river,
  duration,
  priceFrom,
  prezzoSuRichiesta,
  image,
}: CruiseCardProps) {
  const formattedPrice = prezzoSuRichiesta
    ? null
    : new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(priceFrom);

  return (
    <Link href={`/crociere/${slug}`} className="group h-full">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Image — only type badge */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#C41E2F] text-white">
              Crociera
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-[15px] text-[#1B2D4F] font-[family-name:var(--font-poppins)] line-clamp-2 group-hover:text-[#C41E2F] transition-colors leading-snug mb-3">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
            {river && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3 text-[#C41E2F]" />
                {river}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-[#C41E2F]" />
                Durata: {duration}
              </span>
            )}
            {ship && (
              <span className="flex items-center gap-1">
                <Ship className="size-3 text-gray-400" />
                {ship}
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
