import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { parsePrice } from "@/lib/utils";
import SectionReveal from "./SectionReveal";
import type { TourListItem } from "@/lib/supabase/queries/tours";
import type { CruiseListItem } from "@/lib/supabase/queries/cruises";

type Item = {
  type: "tour" | "crociera";
  slug: string;
  title: string;
  cover_image_url: string | null;
  destination_name: string | null;
  durata_notti: string | null;
  a_partire_da: string | null;
  prezzo_su_richiesta: boolean;
  created_at: string;
};

export default function LatestAdditions({
  tours,
  cruises,
}: {
  tours: TourListItem[];
  cruises: CruiseListItem[];
}) {
  // Merge tours + cruises, sort by created_at desc, take first 4
  const items: Item[] = [
    ...tours.map((t) => ({ ...t, type: "tour" as const })),
    ...cruises.map((c) => ({ ...c, type: "crociera" as const, destination_name: c.destination_name })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#C41E2F]/10 text-[#C41E2F] text-xs font-bold uppercase tracking-wide">
              New
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              Ultimi viaggi aggiunti
            </h2>
          </div>
          <div className="section-divider mb-12" />
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((item) => {
              const href = item.type === "tour" ? `/tours/${item.slug}` : `/crociere/${item.slug}`;
              const price = parsePrice(item.a_partire_da);

              return (
                <Link key={item.slug} href={href} className="group h-full">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {item.cover_image_url ? (
                        <Image
                          src={item.cover_image_url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          quality={60}
                          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                      {/* Type badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md ${
                            item.type === "tour"
                              ? "bg-[#1B2D4F] text-white"
                              : "bg-[#C41E2F] text-white"
                          }`}
                        >
                          {item.type === "tour" ? "Tour" : "Crociera"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-[#1B2D4F] text-sm mb-2 line-clamp-2 group-hover:text-[#C41E2F] transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-3">
                        {item.destination_name && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-[#C41E2F]" />
                            {item.destination_name}
                          </span>
                        )}
                        {item.durata_notti && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-[#C41E2F]" />
                            {item.durata_notti}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto">
                        {item.prezzo_su_richiesta ? (
                          <p className="text-xs font-semibold text-[#C41E2F]">Prezzo su richiesta</p>
                        ) : price > 0 ? (
                          <p className="text-xs text-gray-400">
                            da{" "}
                            <span className="font-bold text-[#C41E2F] text-sm">
                              &euro;{price.toLocaleString("it-IT")}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
