import { notFound } from "next/navigation";
import PageHero from "@/components/layout/PageHero";
import TourCard from "@/components/cards/TourCard";
import { destinations, getDestinationBySlug, getToursForDestination } from "@/lib/data";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const destTours = getToursForDestination(slug);

  return (
    <>
      <PageHero
        title={dest.name}
        subtitle={dest.description}
        backgroundImage={dest.image}
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

          {destTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destTours.map((tour) => (
                <TourCard
                  key={tour.slug}
                  slug={tour.slug}
                  title={tour.title}
                  destination={tour.destination}
                  duration={tour.duration}
                  priceFrom={tour.priceFrom}
                  image={tour.image}
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
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              Per il momento nessuna crociera prevista per {dest.name}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
