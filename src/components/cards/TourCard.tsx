import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    ? "Su richiesta"
    : new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(priceFrom);

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm card-hover border border-gray-100 h-full flex flex-col">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Destination badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-[#C41E2F] text-white border-none text-xs px-2.5 py-1 rounded-md">
            {destination}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-lg text-gray-900 font-[family-name:var(--font-poppins)] line-clamp-2">
          {title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Badge variant="outline" className="text-xs font-normal rounded-md">
              Tour
            </Badge>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {duration}
          </span>
          {departureFrom && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              Partenza da {departureFrom}
            </span>
          )}
        </div>

        {/* Price */}
        <p className="text-sm text-gray-600 mt-auto">
          {prezzoSuRichiesta ? (
            <span className="font-bold text-[#C41E2F] text-base">
              Prezzo su richiesta
            </span>
          ) : (
            <>
              Prezzo a partire da:{" "}
              <span className="font-bold text-[#C41E2F] text-base">
                {formattedPrice}
              </span>
            </>
          )}
        </p>

        {/* CTA */}
        <Button asChild className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white">
          <Link href={`/tours/${slug}`}>Scopri di Pi&ugrave;</Link>
        </Button>
      </div>
    </div>
  );
}
