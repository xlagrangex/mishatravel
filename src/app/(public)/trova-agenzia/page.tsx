import PageHero from "@/components/layout/PageHero";
import TrovaAgenziaClient from "@/components/TrovaAgenziaClient";
import { getActiveAgencies } from "@/lib/supabase/queries/agencies";

export const dynamic = "force-dynamic";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export const metadata = {
  title: "Trova un'Agenzia | Misha Travel",
  description: "Cerca l'agenzia Misha Travel più vicina a te. Trova il partner di viaggio ideale nella tua città.",
};

export default async function TrovaAgenziaPage() {
  const agencies = await getActiveAgencies();

  return (
    <>
      <PageHero
        title="Trova un'Agenzia"
        subtitle="Cerca l'agenzia Misha Travel più vicina a te"
        backgroundImage="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Trova Agenzia", href: "/trova-agenzia" }]}
      />

      <section className="py-12 bg-white">
        <TrovaAgenziaClient agencies={agencies} />
      </section>
    </>
  );
}
