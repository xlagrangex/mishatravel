import { notFound } from "next/navigation";
import PageHero from "@/components/layout/PageHero";
import TourCard from "@/components/cards/TourCard";
import CruiseCard from "@/components/cards/CruiseCard";
import { getDestinationWithTours } from "@/lib/supabase/queries/destinations";

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getDestinationWithTours(slug);
  if (!result) notFound();

  const { destination: dest, tours, cruises } = result;

  return (
    <>
      <PageHero
        title={dest.name}
        subtitle={dest.description ?? undefined}
        backgroundImage={dest.cover_image_url ?? undefined}
        breadcrumbs={[
          { label: "Destinazioni", href: "/destinazioni" },
          { label: dest.name, href: `/destinazioni/${dest.slug}` },
        ]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Tour in {dest.name}
          </h2>
          <p className="text-gray-600 mb-8">{dest.description}</p>

          {tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard
                  key={tour.slug}
                  slug={tour.slug}
                  title={tour.title}
                  destination={tour.destination_name ?? dest.name}
                  duration={tour.durata_notti ?? ""}
                  priceFrom={tour.a_partire_da ? Number(tour.a_partire_da) : 0}
                  image={tour.cover_image_url || "/images/placeholder.jpg"}
                  type="tour"
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">
                Per il momento nessun tour previsto per {dest.name}. Contattaci per maggiori informazioni.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {cruises.length > 0 ? (
            <>
              <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-8">
                Crociere in {dest.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cruises.map((cruise) => (
                  <CruiseCard
                    key={cruise.slug}
                    slug={cruise.slug}
                    title={cruise.title}
                    ship={cruise.ship_name ?? ""}
                    river={cruise.destination_name ?? dest.name}
                    duration={cruise.durata_notti ?? ""}
                    priceFrom={cruise.a_partire_da ? Number(cruise.a_partire_da) : 0}
                    image={cruise.cover_image_url || "/images/placeholder.jpg"}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">
                Per il momento nessuna crociera prevista per {dest.name}.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
