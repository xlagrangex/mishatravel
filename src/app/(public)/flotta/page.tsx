import PageHero from "@/components/layout/PageHero";
import ShipCard from "@/components/cards/ShipCard";
import { getPublishedShips } from "@/lib/supabase/queries/ships";

export const dynamic = "force-dynamic";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export default async function FlottaPage() {
  const ships = await getPublishedShips();

  return (
    <>
      <PageHero
        title="La Nostra Flotta"
        subtitle="Navi eleganti per crociere indimenticabili"
        backgroundImage="https://images.unsplash.com/photo-1541343672885-9be56236302a?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Flotta", href: "/flotta" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            La flotta Misha Travel e composta da navi moderne e confortevoli, progettate per
            offrire il massimo della qualita durante le nostre crociere fluviali. Ogni nave
            dispone di cabine spaziose, ristoranti, aree relax e intrattenimento a bordo.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {ships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ships.map((ship) => (
                <ShipCard
                  key={ship.slug}
                  slug={ship.slug}
                  name={ship.name}
                  image={ship.cover_image_url || "/images/placeholder.jpg"}
                  capacity={ship.name}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">
                Nessuna nave disponibile al momento. Torna a trovarci presto!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
