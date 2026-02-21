import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import TourCard from "@/components/cards/TourCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Clock, MapPin, Check, X } from "lucide-react";
import { tours, getTourBySlug, getRelatedTours } from "@/lib/data";

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = getTourBySlug(slug);
  if (!tour) notFound();

  const related = getRelatedTours(slug, 3);

  const formattedPrice = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(tour.priceFrom);

  return (
    <>
      <PageHero
        title={tour.title}
        breadcrumbs={[
          { label: "Tours", href: "/tours" },
          { label: tour.title, href: `/tours/${tour.slug}` },
        ]}
        backgroundImage={tour.image}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="panoramica" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                  <TabsTrigger value="panoramica" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">
                    Panoramica
                  </TabsTrigger>
                  <TabsTrigger value="itinerario" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">
                    Itinerario
                  </TabsTrigger>
                  <TabsTrigger value="incluso" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">
                    Incluso / Escluso
                  </TabsTrigger>
                  <TabsTrigger value="partenze" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C41E2F] data-[state=active]:text-[#C41E2F] px-4 py-3">
                    Partenze
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="panoramica" className="pt-6">
                  <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
                    {tour.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {tour.description}
                  </p>
                  {tour.highlights && tour.highlights.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-[#1B2D4F] mb-3">Highlights</h3>
                      <ul className="space-y-2">
                        {tour.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <Check className="size-4 text-[#C41E2F] mt-1 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="itinerario" className="pt-6">
                  <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
                    Itinerario giorno per giorno
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {tour.itinerary.map((day, i) => (
                      <AccordionItem key={i} value={`day-${i}`}>
                        <AccordionTrigger className="text-left">
                          <span className="flex items-center gap-3">
                            <Badge className="bg-[#C41E2F] text-white shrink-0">
                              Giorno {day.day}
                            </Badge>
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

                <TabsContent value="incluso" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                        <Check className="size-5" /> La quota comprende
                      </h3>
                      <ul className="space-y-2">
                        {tour.included.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <Check className="size-4 text-green-600 mt-1 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                        <X className="size-5" /> La quota non comprende
                      </h3>
                      <ul className="space-y-2">
                        {tour.excluded.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <X className="size-4 text-red-500 mt-1 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="partenze" className="pt-6">
                  <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
                    Date di partenza e prezzi
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#1B2D4F]">
                          <th className="py-3 px-4 text-sm font-semibold text-[#1B2D4F]">Data</th>
                          <th className="py-3 px-4 text-sm font-semibold text-[#1B2D4F]">Prezzo</th>
                          <th className="py-3 px-4 text-sm font-semibold text-[#1B2D4F]">Disponibilita</th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tour.departures.map((dep, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{dep.date}</td>
                            <td className="py-3 px-4 text-sm font-bold text-[#C41E2F]">
                              {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(dep.price)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={dep.availability === "sold out" ? "destructive" : "outline"} className="text-xs">
                                {dep.availability}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button size="sm" className="bg-[#C41E2F] hover:bg-[#A31825] text-white text-xs">
                                Richiedi Preventivo
                              </Button>
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
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-[#1B2D4F]" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-[#1B2D4F]" />
                    <span>{tour.destination}</span>
                  </div>
                </div>

                <Button className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
                  Richiedi Preventivo
                </Button>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  Contattaci per un preventivo personalizzato
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tours */}
      {related.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              Tour Correlati
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((t) => (
                <TourCard key={t.slug} slug={t.slug} title={t.title} destination={t.destination} duration={t.duration} priceFrom={t.priceFrom} image={t.image} type="tour" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
