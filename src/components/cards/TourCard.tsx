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
  priceType?: "da" | "fisso";
  prezzoListino?: number | null;
  prezzoOfferta?: number | null;
  image: string;
  type: "tour";
  departureFrom?: string;
}

function formatDuration(val: string): string {
  const trimmed = val.trim();
  if (/^\d+$/.test(trimmed)) return `${trimmed} notti`;
  return trimmed;
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export default function TourCard({
  slug,
  title,
  destination,
  duration,
  priceFrom,
  prezzoSuRichiesta,
  priceType = "da",
  prezzoListino,
  prezzoOfferta,
  image,
  departureFrom,
}: TourCardProps) {
  const hasDiscount =
    !prezzoSuRichiesta &&
    prezzoListino != null &&
    prezzoListino > 0 &&
    prezzoOfferta != null &&
    prezzoOfferta > 0 &&
    prezzoOfferta < prezzoListino;

  const discountPct = hasDiscount
    ? Math.round((1 - prezzoOfferta / prezzoListino) * 100)
    : 0;

  const effectivePrice = prezzoOfferta || prezzoListino || priceFrom;
  const formattedPrice =
    prezzoSuRichiesta || !effectivePrice ? null : fmtEur(effectivePrice);

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
            quality={60}
            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 30vw"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#1B2D4F] text-white">
              Tour
            </span>
          </div>
          {hasDiscount && discountPct > 0 && (
            <div className="absolute top-3 right-3">
              <span className="text-sm font-extrabold px-3 py-1.5 rounded-lg bg-[#C41E2F] text-white shadow-md">
                -{discountPct}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 py-4 flex flex-col flex-1">
          <h3 className="font-semibold text-base text-[#1B2D4F] font-[family-name:var(--font-poppins)] line-clamp-2 group-hover:text-[#C41E2F] transition-colors leading-snug mb-2">
            {title}
          </h3>

          {destination && (
            <p className="flex items-center gap-1.5 text-[15px] text-gray-600 mb-1">
              <MapPin className="size-4 text-[#C41E2F] shrink-0" />
              {destination}
            </p>
          )}
          {duration && (
            <p className="flex items-center gap-1.5 text-[15px] text-gray-600 mb-1">
              <Clock className="size-4 text-[#C41E2F] shrink-0" />
              {formatDuration(duration)}
            </p>
          )}

          {/* Price */}
          <div className="mt-auto pt-3">
            {prezzoSuRichiesta ? (
              <p className="text-base font-semibold text-[#C41E2F]">Prezzo su richiesta</p>
            ) : formattedPrice ? (
              <div>
                {hasDiscount && (
                  <p className="text-sm text-gray-400 line-through">
                    {fmtEur(prezzoListino)}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  {priceType === "da" && <>da{" "}</>}
                  <span className="font-bold text-[#C41E2F] text-2xl">
                    {formattedPrice}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">a persona</span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
