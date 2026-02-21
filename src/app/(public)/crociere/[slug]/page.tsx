import { notFound } from "next/navigation";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import CruiseCard from "@/components/cards/CruiseCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Clock, Ship, Waves, Check, X } from "lucide-react";
import { cruises, getCruiseBySlug, getRelatedCruises } from "@/lib/data";

export function generateStaticParams() {
  return cruises.map((c) => ({ slug: c.slug }));
}

export default async function CruiseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cruise = getCruiseBySlug(slug);
  if (!cruise) notFound();

  const related = getRelatedCruises(slug, 3);
  const formattedPrice = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(cruise.priceFrom);

  return (
    <>
      <PageHero
        title={cruise.title}
        breadcrumbs={[
          { label: "Crociere", href: "/crociere" },
          { label: cruise.title, href: `/crociere/${cruise.slug}` },
        ]}
        backgroundImage={cruise.image}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image src={cruise.image} alt={cruise.title} fill className="object-cover" priority />
              </div>

              <Tabs defaultValue="panoramica" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto flex-wrap">
                  <TabsTrigger value="panoramica" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Panoramica</TabsTrigger>
                  <TabsTrigger value="itinerario" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Itinerario</TabsTrigger>
                  <TabsTrigger value="ponte" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Piano dei Ponti</TabsTrigger>
                  <TabsTrigger value="incluso" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Incluso / Escluso</TabsTrigger>
                  <TabsTrigger value="partenze" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">Partenze</TabsTrigger>
                </TabsList>

                <TabsContent value="panoramica" className="pt-6">
                  <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">{cruise.title}</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{cruise.description}</p>
                </TabsContent>

                <TabsContent value="itinerario" className="pt-6">
                  <Accordion type="single" collapsible>
                    {cruise.itinerary.map((day, i) => (
                      <AccordionItem key={i} value={`day-${i}`}>
                        <AccordionTrigger>
                          <span className="flex items-center gap-3">
                            <Badge className="bg-[#1B2D4F] text-white shrink-0">Giorno {day.day}</Badge>
                            <span className="font-semibold">{day.title}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600 pl-20">{day.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>

                <TabsContent value="ponte" className="pt-6">
                  <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">Piano dei Ponti</h2>
                  {cruise.deckPlan.map((deck, i) => (
                    <div key={i} className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-lg text-[#1B2D4F] mb-2">{deck.name}</h3>
                      <p className="text-gray-600 mb-3">{deck.description}</p>
                      <div className="relative aspect-[3/1] rounded overflow-hidden">
                        <Image src={deck.image} alt={deck.name} fill className="object-cover" />
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="incluso" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2"><Check className="size-5" /> La quota comprende</h3>
                      <ul className="space-y-2">
                        {cruise.included.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600"><Check className="size-4 text-green-600 mt-1 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2"><X className="size-5" /> La quota non comprende</h3>
                      <ul className="space-y-2">
                        {cruise.excluded.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600"><X className="size-4 text-red-500 mt-1 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="partenze" className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#1B2D4F]">
                          <th className="py-3 px-4 text-sm font-semibold">Data</th>
                          <th className="py-3 px-4 text-sm font-semibold">Prezzo</th>
                          <th className="py-3 px-4 text-sm font-semibold">Disponibilita</th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cruise.departures.map((dep, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{dep.date}</td>
                            <td className="py-3 px-4 text-sm font-bold text-[#C41E2F]">
                              {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(dep.price)}
                            </td>
                            <td className="py-3 px-4"><Badge variant="outline" className="text-xs">{dep.availability}</Badge></td>
                            <td className="py-3 px-4">
                              <Button size="sm" className="bg-[#C41E2F] hover:bg-[#A31825] text-white text-xs">Richiedi Preventivo</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Prezzo a partire da</p>
                <p className="text-3xl font-bold text-[#C41E2F] mb-4">{formattedPrice}</p>
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2"><Ship className="size-4 text-[#1B2D4F]" /><span>{cruise.ship}</span></div>
                  <div className="flex items-center gap-2"><Clock className="size-4 text-[#1B2D4F]" /><span>{cruise.duration}</span></div>
                  <div className="flex items-center gap-2"><Waves className="size-4 text-[#1B2D4F]" /><span>{cruise.river}</span></div>
                </div>
                <Button className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">Richiedi Preventivo</Button>
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
                <CruiseCard key={c.slug} slug={c.slug} title={c.title} ship={c.ship} river={c.river} duration={c.duration} priceFrom={c.priceFrom} image={c.image} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
