import { notFound } from "next/navigation";
import { getAgencyById, getAgencyQuoteRequests } from "@/lib/supabase/queries/admin-agencies";
import { getAgencyDocumentsAdmin } from "@/lib/supabase/queries/agency-documents";
import AgencyDetail from "./AgencyDetail";

export const dynamic = "force-dynamic";

interface AgencyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgencyDetailPage({ params }: AgencyDetailPageProps) {
  const { id } = await params;
  const [agency, quoteRequests, documents] = await Promise.all([
    getAgencyById(id),
    getAgencyQuoteRequests(id),
    getAgencyDocumentsAdmin(id),
  ]);

  if (!agency) notFound();

  return <AgencyDetail agency={agency} quoteRequests={quoteRequests} documents={documents} />;
}
