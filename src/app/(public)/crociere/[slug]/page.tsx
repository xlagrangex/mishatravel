import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import CruiseCard from "@/components/cards/CruiseCard";
import CruiseConfigurator from "@/components/agenzia/CruiseConfigurator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Clock, Ship, Waves, Check, X } from "lucide-react";
import { getCruiseBySlug, getRelatedCruises } from "@/lib/supabase/queries/cruises";
import StickyBottomBar from "@/components/shared/StickyBottomBar";
import { generateCruiseMetadata } from "@/lib/seo/metadata";
import { boatTripSchema, breadcrumbSchema } from "@/lib/seo/structured-data";

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

  const priceNum = cruise.a_partire_da ? Number(cruise.a_partire_da) : null;
  const formattedPrice = priceNum
    ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(priceNum)
    : null;

  const shipName = cruise.ship?.name ?? "";
  const destinationName = cruise.destination?.name ?? "";
  const coverImage = cruise.cover_image_url || "/images/placeholder.jpg";

  // Separate included and excluded items
  const includedItems = (cruise.inclusions ?? []).filter((i) => i.is_included);
  const excludedItems = (cruise.inclusions ?? []).filter((i) => !i.is_included);

  // Build deck configuration from cruise labels
  const decks: { label: string; value: string }[] = [];
  if (cruise.etichetta_primo_deck) decks.push({ label: cruise.etichetta_primo_deck, value: "main" });
  if (cruise.etichetta_secondo_deck) decks.push({ label: cruise.etichetta_secondo_deck, value: "middle" });
  if (cruise.etichetta_terzo_deck) decks.push({ label: cruise.etichetta_terzo_deck, value: "superior" });

  return (
    <>
      <PageHero
        title={cruise.title}
        breadcrumbs={[
          { label: "Crociere", href: "/crociere" },
          { label: cruise.title, href: `/crociere/${cruise.slug}` },
        ]}
        backgroundImage={coverImage}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image src={coverImage} alt={cruise.title} fill className="object-cover" priority />
              </div>

              <Tabs defaultValue="panoramica" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto flex-wrap">
                  <TabsTrigger value="panoramica" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Panoramica</TabsTrigger>
                  <TabsTrigger value="itinerario" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Itinerario</TabsTrigger>
                  <TabsTrigger value="incluso" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Incluso / Escluso</TabsTrigger>
                  <TabsTrigger value="partenze" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Partenze</TabsTrigger>
                </TabsList>

                <TabsContent value="panoramica" className="pt-6">
                  <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">{cruise.title}</h2>
                  {cruise.content ? (
                    <div
                      className="text-gray-600 leading-relaxed prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: cruise.content }}
                    />
                  ) : (
                    <p className="text-gray-500">Descrizione non ancora disponibile.</p>
                  )}
                </TabsContent>

                <TabsContent value="itinerario" className="pt-6">
                  {(cruise.itinerary_days ?? []).length > 0 ? (
                    <Accordion type="single" collapsible>
                      {cruise.itinerary_days.map((day, i) => (
                        <AccordionItem key={day.id || i} value={`day-${i}`}>
                          <AccordionTrigger>
                            <span className="flex items-center gap-3">
                              <Badge className="bg-[#1B2D4F] text-white shrink-0">Giorno {day.numero_giorno}</Badge>
                              <span className="font-semibold">{day.localita}</span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-600 pl-20">{day.descrizione}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-gray-500">Itinerario non ancora disponibile.</p>
                  )}
                </TabsContent>

                <TabsContent value="incluso" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2"><Check className="size-5" /> La quota comprende</h3>
                      {includedItems.length > 0 ? (
                        <ul className="space-y-2">
                          {includedItems.map((item, i) => (
                            <li key={item.id || i} className="flex items-start gap-2 text-gray-600"><Check className="size-4 text-green-600 mt-1 shrink-0" />{item.titolo}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">Nessun elemento specificato.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2"><X className="size-5" /> La quota non comprende</h3>
                      {excludedItems.length > 0 ? (
                        <ul className="space-y-2">
                          {excludedItems.map((item, i) => (
                            <li key={item.id || i} className="flex items-start gap-2 text-gray-600"><X className="size-4 text-red-500 mt-1 shrink-0" />{item.titolo}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">Nessun elemento specificato.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="partenze" className="pt-6">
                  {(cruise.departures ?? []).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-[#1B2D4F]">
                            <th className="py-3 px-4 text-sm font-semibold">Partenza da</th>
                            <th className="py-3 px-4 text-sm font-semibold">Data</th>
                            <th className="py-3 px-4 text-sm font-semibold">Prezzo</th>
                            <th className="py-3 px-4"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cruise.departures.map((dep, i) => (
                            <tr key={dep.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm">{dep.from_city}</td>
                              <td className="py-3 px-4 text-sm">
                                {new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dep.data_partenza))}
                              </td>
                              <td className="py-3 px-4 text-sm font-bold text-[#C41E2F]">
                                {dep.prezzo_main_deck
                                  ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(dep.prezzo_main_deck)
                                  : "Su richiesta"}
                              </td>
                              <td className="py-3 px-4">
                                <CruiseConfigurator
                                  cruiseId={cruise.id}
                                  cruiseTitle={cruise.title}
                                  departures={cruise.departures ?? []}
                                  supplements={cruise.supplements ?? []}
                                  cabins={cruise.cabins ?? []}
                                  decks={decks}
                                  preselectedDepartureId={dep.id}
                                >
                                  <Button size="sm" className="bg-[#C41E2F] hover:bg-[#A31825] text-white text-xs">Richiedi Preventivo</Button>
                                </CruiseConfigurator>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nessuna partenza programmata al momento.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Prezzo a partire da</p>
                <p className="text-3xl font-bold text-[#C41E2F] mb-4">
                  {formattedPrice ?? (cruise.prezzo_su_richiesta ? "Su richiesta" : "N/D")}
                </p>
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  {shipName && (
                    <div className="flex items-center gap-2"><Ship className="size-4 text-[#1B2D4F]" /><span>{shipName}</span></div>
                  )}
                  {cruise.durata_notti && (
                    <div className="flex items-center gap-2"><Clock className="size-4 text-[#1B2D4F]" /><span>{cruise.durata_notti}</span></div>
                  )}
                  {destinationName && (
                    <div className="flex items-center gap-2"><Waves className="size-4 text-[#1B2D4F]" /><span>{destinationName}</span></div>
                  )}
                </div>
                <CruiseConfigurator
                  cruiseId={cruise.id}
                  cruiseTitle={cruise.title}
                  departures={cruise.departures ?? []}
                  supplements={cruise.supplements ?? []}
                  cabins={cruise.cabins ?? []}
                  decks={decks}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">Crociere Correlate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((c) => (
                <CruiseCard
                  key={c.slug}
                  slug={c.slug}
                  title={c.title}
                  ship={c.ship_name ?? ""}
                  river={c.destination_name ?? ""}
                  duration={c.durata_notti ?? ""}
                  priceFrom={c.a_partire_da ? Number(c.a_partire_da) : 0}
                  image={c.cover_image_url || "/images/placeholder.jpg"}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {priceNum && <StickyBottomBar price={priceNum} />}

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
