import { notFound } from "next/navigation";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import CruiseCard from "@/components/cards/CruiseCard";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Ruler, Layers } from "lucide-react";
import { ships, getShipBySlug, getCruisesForShip } from "@/lib/data";

export function generateStaticParams() {
  return ships.map((s) => ({ slug: s.slug }));
}

export default async function ShipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ship = getShipBySlug(slug);
  if (!ship) notFound();

  const shipCruises = getCruisesForShip(slug);

  return (
    <>
      <PageHero
        title={ship.name}
        breadcrumbs={[
          { label: "Flotta", href: "/flotta" },
          { label: ship.name, href: `/flotta/${ship.slug}` },
        ]}
        backgroundImage={ship.image}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={ship.image} alt={ship.name} fill className="object-cover" priority />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">{ship.name}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{ship.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <Users className="size-5 text-[#C41E2F]" />
                  <div>
                    <p className="text-xs text-gray-500">Capacita</p>
                    <p className="font-semibold text-[#1B2D4F]">{ship.capacity} pax</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <Calendar className="size-5 text-[#C41E2F]" />
                  <div>
                    <p className="text-xs text-gray-500">Anno</p>
                    <p className="font-semibold text-[#1B2D4F]">{ship.year}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <Ruler className="size-5 text-[#C41E2F]" />
                  <div>
                    <p className="text-xs text-gray-500">Dimensioni</p>
                    <p className="font-semibold text-[#1B2D4F]">L: da definire</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <Layers className="size-5 text-[#C41E2F]" />
                  <div>
                    <p className="text-xs text-gray-500">Ponti</p>
                    <p className="font-semibold text-[#1B2D4F]">{ship.decks.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deck Plan */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">Piano dei Ponti</h3>
            <div className="space-y-4">
              {ship.decks.map((deck, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-5 flex items-center gap-4">
                  <Badge className="bg-[#1B2D4F] text-white shrink-0 text-sm px-3 py-1">{deck.name}</Badge>
                  <div>
                    <p className="font-semibold text-[#1B2D4F]">{deck.cabins} cabine</p>
                    <p className="text-sm text-gray-600">{deck.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available cruises */}
          {shipCruises.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
                Crociere con {ship.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shipCruises.map((c) => (
                  <CruiseCard key={c.slug} slug={c.slug} title={c.title} ship={c.ship} river={c.river} duration={c.duration} priceFrom={c.priceFrom} image={c.image} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
