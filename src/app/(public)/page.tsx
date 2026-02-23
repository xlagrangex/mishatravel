import Link from "next/link";
import { Button } from "@/components/ui/button";
import { parsePrice } from "@/lib/utils";
import TourCard from "@/components/cards/TourCard";
import CruiseCard from "@/components/cards/CruiseCard";
import HeroSection from "@/components/home/HeroSection";
import DestinationsCarousel from "@/components/home/DestinationsCarousel";
import LatestAdditions from "@/components/home/LatestAdditions";
import DeparturesTimeline from "@/components/home/DeparturesTimeline";
import AgencyCTA from "@/components/home/AgencyCTA";
import SectionReveal from "@/components/home/SectionReveal";
import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";
import { getPublishedTours } from "@/lib/supabase/queries/tours";
import { getPublishedCruises } from "@/lib/supabase/queries/cruises";
import { getAllDepartures } from "@/lib/supabase/queries/departures";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [destinations, tours, cruises, departures] = await Promise.all([
    getPublishedDestinations(),
    getPublishedTours(),
    getPublishedCruises(),
    getAllDepartures(),
  ]);

  const featuredTours = tours.slice(0, 6);
  const featuredCruises = cruises.slice(0, 6);

  return (
    <>
      {/* 1. Hero con slideshow + search bar */}
      <HeroSection
        destinations={destinations}
        tours={tours}
        cruises={cruises}
        departures={departures}
      />

      {/* 2. Carousel destinazioni — subito sotto la hero */}
      <DestinationsCarousel destinations={destinations} />

      {/* 3. Ultimi viaggi aggiunti */}
      <LatestAdditions tours={tours} cruises={cruises} />

      {/* 4. Prossime partenze */}
      <DeparturesTimeline departures={departures} tours={tours} cruises={cruises} />

      {/* 5. CTA Agenzie */}
      <AgencyCTA />

      {/* 6. I nostri Tour */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
              I nostri Tour
            </h2>
            <div className="section-divider mb-14" />
          </SectionReveal>
          {featuredTours.length > 0 ? (
            <SectionReveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTours.map((tour) => (
                  <TourCard
                    key={tour.slug}
                    slug={tour.slug}
                    title={tour.title}
                    destination={tour.destination_name ?? ""}
                    duration={tour.durata_notti ?? ""}
                    priceFrom={parsePrice(tour.a_partire_da)}
                    prezzoSuRichiesta={tour.prezzo_su_richiesta}
                    image={tour.cover_image_url || "/images/placeholder.jpg"}
                    type="tour"
                  />
                ))}
              </div>
            </SectionReveal>
          ) : (
            <p className="text-center text-gray-500">Nessun tour disponibile al momento.</p>
          )}
          <SectionReveal delay={0.3}>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg" className="border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white px-8">
                <Link href="/tours">Tutti i tour</Link>
              </Button>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* 7. Crociere Fluviali */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
              Crociere Fluviali
            </h2>
            <div className="section-divider mb-14" />
          </SectionReveal>
          {featuredCruises.length > 0 ? (
            <SectionReveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCruises.map((cruise) => (
                  <CruiseCard
                    key={cruise.slug}
                    slug={cruise.slug}
                    title={cruise.title}
                    ship={cruise.ship_name ?? ""}
                    river={cruise.destination_name ?? ""}
                    duration={cruise.durata_notti ?? ""}
                    priceFrom={parsePrice(cruise.a_partire_da)}
                    prezzoSuRichiesta={cruise.prezzo_su_richiesta}
                    image={cruise.cover_image_url || "/images/placeholder.jpg"}
                  />
                ))}
              </div>
            </SectionReveal>
          ) : (
            <p className="text-center text-gray-500">Nessuna crociera disponibile al momento.</p>
          )}
          <SectionReveal delay={0.3}>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg" className="border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white px-8">
                <Link href="/crociere">Tutte le crociere</Link>
              </Button>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
