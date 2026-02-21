import PageHero from "@/components/layout/PageHero";
import CruiseCard from "@/components/cards/CruiseCard";
import ShipCard from "@/components/cards/ShipCard";
import DestinationCard from "@/components/cards/DestinationCard";
import { cruises, ships, destinationsByArea } from "@/lib/data";

export default function CrocierePage() {
  const fluvialDests = destinationsByArea["Percorsi Fluviali"] ?? [];

  return (
    <>
      <PageHero
        title="Crociere Fluviali"
        subtitle="Scopri il mondo navigando i grandi fiumi"
        backgroundImage="https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Crociere", href: "/crociere" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Le crociere fluviali Misha Travel offrono un modo unico di viaggiare: il comfort di un hotel
            di lusso che si sposta con voi, fermandosi ogni giorno in un porto diverso. Navi eleganti,
            cucina eccellente, escursioni guidate in italiano e un servizio impeccabile.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-8">
            Le nostre crociere
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cruises.map((cruise) => (
              <CruiseCard
                key={cruise.slug}
                slug={cruise.slug}
                title={cruise.title}
                ship={cruise.ship}
                river={cruise.river}
                duration={cruise.duration}
                priceFrom={cruise.priceFrom}
                image={cruise.image}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-8">
            Le nostre imbarcazioni
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ships.map((ship) => (
              <ShipCard
                key={ship.slug}
                slug={ship.slug}
                name={ship.name}
                image={ship.image}
                capacity={`${ship.capacity} passeggeri`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-8">
            Le nostre destinazioni fluviali
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fluvialDests.map((dest) => (
              <DestinationCard key={dest.slug} slug={dest.slug} name={dest.name} image={dest.image} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
