import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShipCardProps {
  slug: string;
  name: string;
  image: string;
  capacity: string;
}

export default function ShipCard({
  slug,
  name,
  image,
  capacity,
}: ShipCardProps) {
  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm card-hover border border-gray-100">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="font-semibold text-xl text-gray-900 font-[family-name:var(--font-poppins)]">
          {name}
        </h3>

        {/* Capacity */}
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="size-4" />
          {capacity}
        </p>

        {/* CTA */}
        <Button asChild className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white mt-1">
          <Link href={`/flotta/${slug}`}>Scopri di Pi&ugrave;</Link>
        </Button>
      </div>
    </div>
  );
}
