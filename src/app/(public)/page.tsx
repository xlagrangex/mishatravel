import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";
import { getPublishedTours } from "@/lib/supabase/queries/tours";
import { getPublishedCruises } from "@/lib/supabase/queries/cruises";
import { getAllDepartures } from "@/lib/supabase/queries/departures";
import HeroSection from "@/components/home/HeroSection";
import DestinationsCarousel from "@/components/home/DestinationsCarousel";
import InteractiveMap from "@/components/home/InteractiveMap";
import DeparturesTimeline from "@/components/home/DeparturesTimeline";
import AgencyCTA from "@/components/home/AgencyCTA";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [destinations, tours, cruises, departures] = await Promise.all([
    getPublishedDestinations(),
    getPublishedTours(),
    getPublishedCruises(),
    getAllDepartures(),
  ]);

  return (
    <>
      {/* 1. Hero fullscreen + search bar */}
      <HeroSection
        destinations={destinations}
        tours={tours}
        cruises={cruises}
        departures={departures}
      />

      {/* 2. Destinazioni carousel */}
      <DestinationsCarousel destinations={destinations} />

      {/* 3. Mappa interattiva */}
      <InteractiveMap destinations={destinations} />

      {/* 4. Prossime partenze timeline */}
      <DeparturesTimeline departures={departures} />

      {/* 5. CTA Agenzie */}
      <AgencyCTA />
    </>
  );
}
