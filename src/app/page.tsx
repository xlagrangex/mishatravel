import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/cards/DestinationCard";
import TourCard from "@/components/cards/TourCard";
import CruiseCard from "@/components/cards/CruiseCard";
import BlogCard from "@/components/cards/BlogCard";
import { destinations, tours, cruises, blogPosts } from "@/lib/data";

export default function HomePage() {
  const featuredDestinations = destinations.slice(0, 8);
  const featuredTours = tours.slice(0, 6);
  const featuredCruises = cruises.slice(0, 6);
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <>
      {/* ===== HERO SLIDER ===== */}
      <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/misc/statue-liberty-new-york-city-skyline-usa-scaled.jpg"
          alt="New York e Cascate del Niagara"
          fill
          className="object-cover"
          priority
        />
        <div className="hero-overlay" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <p className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 text-white/80">
            Misha Travel Tour Operator
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-poppins)] mb-4 leading-tight">
            NEW YORK &amp; CASCATE DEL NIAGARA
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            a partire da <span className="font-bold text-2xl">&#8364;2.950</span>
          </p>
          <Button asChild size="lg" className="bg-[#C41E2F] hover:bg-[#A31825] text-white px-8 py-3 text-base">
            <Link href="/tours/india-triangolo-doro-udaipur-jodhpur-pushkar-mandawa">Scopri di pi&ugrave;</Link>
          </Button>
        </div>
      </section>

      {/* ===== DESTINAZIONI ===== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Scegli la tua destinazione
          </h2>
          <div className="section-divider mb-10" />
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {featuredDestinations.map((dest) => (
              <div key={dest.slug} className="snap-start shrink-0 w-[200px] md:w-[220px]">
                <DestinationCard slug={dest.slug} name={dest.name} image={dest.image} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-[#C41E2F] hover:bg-[#A31825] text-white px-8">
              <Link href="/destinazioni">Scopri tutte le destinazioni</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== AGENCY CTA ===== */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
            Offri ai tuoi clienti il viaggio della loro vita
          </h2>
          <p className="text-xl text-[#C41E2F] font-semibold mb-6 font-[family-name:var(--font-poppins)]">
            Al resto pensiamo noi
          </p>
          <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Misha Travel e un tour operator B2B specializzato in viaggi culturali, grandi itinerari e
            crociere fluviali. Lavoriamo esclusivamente con agenzie di viaggio, offrendo prodotti di alta
            qualita, assistenza dedicata e margini competitivi. Diventa nostro partner e offri ai tuoi
            clienti esperienze di viaggio indimenticabili.
          </p>
          <Button asChild size="lg" className="bg-[#C41E2F] hover:bg-[#A31825] text-white px-8">
            <Link href="/diventa-partner">Diventa Partner</Link>
          </Button>
        </div>
      </section>

      {/* ===== I NOSTRI TOUR ===== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            I nostri Tour
          </h2>
          <div className="section-divider mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTours.map((tour) => (
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
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white px-8">
              <Link href="/tours">Tutti i tour</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== LE NOSTRE CROCIERE ===== */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Le nostre crociere
          </h2>
          <div className="section-divider mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCruises.map((cruise) => (
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
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white px-8">
              <Link href="/crociere">Tutte le crociere</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            I nostri ultimi Articoli dal Blog
          </h2>
          <div className="section-divider mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                category={post.category}
                image={post.image}
                date={post.date}
                excerpt={post.excerpt}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white px-8">
              <Link href="/blog">Vai al blog</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
