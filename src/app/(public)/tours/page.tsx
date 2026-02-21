import PageHero from "@/components/layout/PageHero";
import TourCard from "@/components/cards/TourCard";
import DestinationCard from "@/components/cards/DestinationCard";
import { tours, getDestinationsByMacroArea, type MacroArea } from "@/lib/data";

const macroAreas: MacroArea[] = ["America Latina", "Asia/Russia", "Europa", "Africa"];

export default function ToursPage() {
  const grouped = getDestinationsByMacroArea();

  return (
    <>
      <PageHero
        title="I Nostri Tour"
        backgroundImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Tours", href: "/tours" }]}
      />

      {/* Intro */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Misha Travel propone tour culturali e grandi itinerari in tutto il mondo.
            Ogni viaggio e curato nei minimi dettagli, con accompagnatori esperti in lingua
            italiana, hotel selezionati e esperienze autentiche. Scopri i nostri tour e
            trova il viaggio perfetto per i tuoi clienti.
          </p>
        </div>
      </section>

      {/* Tour Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            I nostri tour
          </h2>
          <p className="text-gray-600 mb-8">
            Esplora la nostra selezione di tour culturali e avventure nel mondo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
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
        </div>
      </section>

      {/* Destinations by macro-area */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-8">
            Le nostre destinazioni
          </h2>
          {macroAreas.map((area) => (
            <div key={area} className="mb-12">
              <div className="bg-navy-gradient text-white px-6 py-4 rounded-t-lg mb-4">
                <h3 className="text-xl font-semibold font-[family-name:var(--font-poppins)]">
                  {area}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(grouped[area] ?? []).map((dest) => (
                  <DestinationCard
                    key={dest.slug}
                    slug={dest.slug}
                    name={dest.name}
                    image={dest.image}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
