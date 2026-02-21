"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ShipItem {
  slug: string;
  name: string;
  image: string;
}

interface FleetStripProps {
  ships: ShipItem[];
}

export default function FleetStrip({ ships }: FleetStripProps) {
  if (ships.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-6">
          La nostra flotta
        </h2>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {ships.map((ship) => (
              <Link
                key={ship.slug}
                href={`/flotta/${ship.slug}`}
                className="group shrink-0 w-48 rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="relative h-28">
                  <Image
                    src={ship.image}
                    alt={ship.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="192px"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ship.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
