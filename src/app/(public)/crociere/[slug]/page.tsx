import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCruiseBySlug, getRelatedCruises } from "@/lib/supabase/queries/cruises";
import { generateCruiseMetadata } from "@/lib/seo/metadata";
import { boatTripSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import CruiseDetailClient from "./CruiseDetailClient";
import AdminEditSetter from "@/components/admin/AdminEditSetter";
import { getAuthContext } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cruise = await getCruiseBySlug(slug);
  if (!cruise) return { title: "Crociera non trovata" };
  return generateCruiseMetadata(cruise);
}

export default async function CruiseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cruise = await getCruiseBySlug(slug);
  if (!cruise) notFound();

  const related = await getRelatedCruises(slug, 3);
  const { role } = await getAuthContext();
  const isAdmin = role === "super_admin" || role === "admin" || role === "operator";

  return (
    <>
      {isAdmin && <AdminEditSetter url={`/admin/crociere/${cruise.id}/modifica`} />}
      <CruiseDetailClient cruise={cruise} related={related} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(boatTripSchema(cruise)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Crociere", url: "/crociere" },
              { name: cruise.title, url: `/crociere/${cruise.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
