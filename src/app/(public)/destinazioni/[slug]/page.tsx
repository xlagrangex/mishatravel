import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parsePrice, stripHtml } from "@/lib/utils";
import PageHero from "@/components/layout/PageHero";
import TourCard from "@/components/cards/TourCard";
import CruiseCard from "@/components/cards/CruiseCard";
import { getDestinationWithTours } from "@/lib/supabase/queries/destinations";
import { getDestinationBySlug } from "@/lib/supabase/queries/destinations";
import { generateDestinationMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import AdminEditSetter from "@/components/admin/AdminEditSetter";
import { getAuthContext } from "@/lib/supabase/auth";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return { title: "Destinazione non trovata" };
  return generateDestinationMetadata(destination);
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getDestinationWithTours(slug);
  if (!result) notFound();

  const { destination: dest, tours, cruises } = result;
  const { role } = await getAuthContext();
  const isAdmin = role === "super_admin" || role === "admin" || role === "operator";

  return (
    <>
      {isAdmin && <AdminEditSetter url={`/admin/destinazioni/${dest.id}/modifica`} />}
      <PageHero
        title={dest.name}
        backgroundImage={dest.cover_image_url ?? undefined}
        breadcrumbs={[
          { label: "Destinazioni", href: "/destinazioni" },
          { label: dest.name, href: `/destinazioni/${dest.slug}` },
        ]}
      />

      {/* Description always visible */}
      {dest.description && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <p className="text-gray-600">{stripHtml(dest.description)}</p>
          </div>
        </section>
      )}

      {tours.length > 0 && (
        <section className={`py-12 ${dest.description ? "bg-gray-50" : "bg-white"}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-8">
              Tour in {dest.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard
                  key={tour.slug}
                  slug={tour.slug}
                  title={tour.title}
                  destination={tour.destination_name ?? dest.name}
                  duration={tour.durata_notti ?? ""}
                  priceFrom={parsePrice(tour.a_partire_da)}
                  prezzoSuRichiesta={tour.prezzo_su_richiesta}
                  image={tour.cover_image_url || "/images/placeholder.jpg"}
                  type="tour"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {cruises.length > 0 && (
        <section className={`py-12 ${tours.length > 0 ? "bg-white" : dest.description ? "bg-gray-50" : "bg-white"}`}>
          <div className="container mx-auto px-4">
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
                  priceFrom={parsePrice(cruise.a_partire_da)}
                  prezzoSuRichiesta={cruise.prezzo_su_richiesta}
                  image={cruise.cover_image_url || "/images/placeholder.jpg"}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Destinazioni", url: "/destinazioni" },
              { name: dest.name, url: `/destinazioni/${dest.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
