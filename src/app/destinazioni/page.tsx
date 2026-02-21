import PageHero from "@/components/layout/PageHero";
import DestinationCard from "@/components/cards/DestinationCard";
import { getDestinationsByMacroArea, type MacroArea } from "@/lib/data";

const macroAreas: MacroArea[] = ["America Latina", "Asia/Russia", "Europa", "Africa", "Percorsi Fluviali"];

export default function DestinazioniPage() {
  const grouped = getDestinationsByMacroArea();

  return (
    <>
      <PageHero
        title="Le Nostre Destinazioni"
        subtitle="Scopri tutte le destinazioni Misha Travel"
        backgroundImage="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Destinazioni", href: "/destinazioni" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Misha Travel vi porta alla scoperta del mondo con tour culturali e crociere fluviali
            in cinque continenti. Dall'Europa all'America Latina, dall'Asia all'Africa, ogni
            destinazione e curata con passione e professionalita.
          </p>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          {macroAreas.map((area) => (
            <div key={area} className="mb-14">
              <div className="bg-navy-gradient text-white px-6 py-5 rounded-lg mb-6">
                <h2 className="text-2xl font-bold font-[family-name:var(--font-poppins)]">{area}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(grouped[area] ?? []).map((dest) => (
                  <DestinationCard key={dest.slug} slug={dest.slug} name={dest.name} image={dest.image} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
