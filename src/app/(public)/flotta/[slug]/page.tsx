import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import CruiseCard from "@/components/cards/CruiseCard";
import { Badge } from "@/components/ui/badge";
import { Users, Layers } from "lucide-react";
import { getShipBySlug } from "@/lib/supabase/queries/ships";
import { getCruisesForShip } from "@/lib/supabase/queries/cruises";
import { generateShipMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ship = await getShipBySlug(slug);
  if (!ship) return { title: "Nave non trovata" };
  return generateShipMetadata(ship);
}

export default async function ShipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ship = await getShipBySlug(slug);
  if (!ship) notFound();

  const shipCruises = await getCruisesForShip(ship.id);

  const coverImage = ship.cover_image_url || "/images/placeholder.jpg";

  return (
    <>
      <PageHero
        title={ship.name}
        breadcrumbs={[
          { label: "Flotta", href: "/flotta" },
          { label: ship.name, href: `/flotta/${ship.slug}` },
        ]}
        backgroundImage={coverImage}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={coverImage} alt={ship.name} fill className="object-cover" priority />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">{ship.name}</h2>
              {ship.description ? (
                <div
                  className="text-gray-600 leading-relaxed mb-6 prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: ship.description }}
                />
              ) : (
                <p className="text-gray-500 mb-6">Descrizione non ancora disponibile.</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {ship.cabine_disponibili && (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                    <Users className="size-5 text-[#C41E2F]" />
                    <div>
                      <p className="text-xs text-gray-500">Cabine</p>
                      <p className="font-semibold text-[#1B2D4F]">{ship.cabine_disponibili}</p>
                    </div>
                  </div>
                )}
                {(ship.cabin_details ?? []).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                    <Layers className="size-5 text-[#C41E2F]" />
                    <div>
                      <p className="text-xs text-gray-500">Tipologie cabina</p>
                      <p className="font-semibold text-[#1B2D4F]">{ship.cabin_details.length}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cabin details */}
          {(ship.cabin_details ?? []).length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">Tipologie Cabina</h3>
              <div className="space-y-4">
                {ship.cabin_details.map((cabin: any, i: number) => (
                  <div key={cabin.id || i} className="bg-gray-50 rounded-lg p-5 flex items-start gap-4">
                    <Badge className="bg-[#1B2D4F] text-white shrink-0 text-sm px-3 py-1">{cabin.titolo}</Badge>
                    <div>
                      {cabin.tipologia && (
                        <p className="font-semibold text-[#1B2D4F]">{cabin.tipologia}</p>
                      )}
                      {cabin.descrizione && (
                        <p className="text-sm text-gray-600">{cabin.descrizione}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {(ship.services ?? []).length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">Servizi a bordo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ship.services.map((service: any, i: number) => (
                  <div key={service.id || i} className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-[#C41E2F] shrink-0" />
                    {service.testo}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {(ship.activities ?? []).length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">Attivita a bordo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ship.activities.map((activity: any, i: number) => (
                  <div key={activity.id || i} className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-[#1B2D4F] shrink-0" />
                    {activity.attivita}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {(ship.gallery ?? []).length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">Galleria</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ship.gallery.map((img: any, i: number) => (
                  <div key={img.id || i} className="relative aspect-video rounded-lg overflow-hidden">
                    <Image src={img.image_url} alt={img.caption || ship.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available cruises */}
          {shipCruises.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
                Crociere con {ship.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shipCruises.map((c) => (
                  <CruiseCard
                    key={c.slug}
                    slug={c.slug}
                    title={c.title}
                    ship={c.ship_name ?? ""}
                    river={c.destination_name ?? ""}
                    duration={c.durata_notti ?? ""}
                    priceFrom={c.a_partire_da ? Number(c.a_partire_da) : 0}
                    image={c.cover_image_url || "/images/placeholder.jpg"}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Flotta", url: "/flotta" },
              { name: ship.name, url: `/flotta/${ship.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
