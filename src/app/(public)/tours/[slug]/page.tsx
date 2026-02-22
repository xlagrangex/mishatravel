import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTourBySlug, getRelatedTours } from "@/lib/supabase/queries/tours";
import { generateTourMetadata } from "@/lib/seo/metadata";
import { tourTripSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import TourDetailClient from "./TourDetailClient";
import AdminEditSetter from "@/components/admin/AdminEditSetter";
import { getAuthContext } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour non trovato" };
  return generateTourMetadata(tour);
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const related = await getRelatedTours(slug, 3);
  const { role } = await getAuthContext();
  const isAdmin = role === "super_admin" || role === "admin" || role === "operator";

  return (
    <>
      {isAdmin && <AdminEditSetter url={`/admin/tours/${tour.id}/modifica`} />}
      <TourDetailClient tour={tour} related={related} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(tourTripSchema(tour)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Tours", url: "/tours" },
              { name: tour.title, url: `/tours/${tour.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
