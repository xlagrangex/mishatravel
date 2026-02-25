import PageHero from "@/components/layout/PageHero";
import PdfViewer from "@/components/PdfViewer";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Maximize2 } from "lucide-react";
import { getPublishedCatalogs } from "@/lib/supabase/queries/catalogs";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export const metadata = {
  title: "Cataloghi | Misha Travel",
  description: "Sfoglia e scarica i cataloghi Misha Travel con tutti gli itinerari, date e prezzi.",
};

export default async function CataloghiPage() {
  const cataloghi = await getPublishedCatalogs();

  return (
    <>
      <PageHero
        title="I Nostri Cataloghi"
        subtitle="Sfoglia e scarica i cataloghi Misha Travel"
        backgroundImage="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Cataloghi", href: "/cataloghi" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Sfoglia i nostri cataloghi direttamente online per scoprire tutti gli itinerari, le date
            di partenza e i prezzi delle nostre proposte di viaggio.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {cataloghi.length > 0 ? (
            <div className="space-y-16">
              {cataloghi.map((cat) => (
                <div
                  key={cat.id}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start max-w-6xl mx-auto"
                >
                  {/* Info card on the left */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {cat.cover_image_url && (
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={cat.cover_image_url}
                          alt={cat.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 40vw"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                          {cat.title}
                        </h3>
                        {cat.year && (
                          <p className="text-sm text-gray-500 mt-0.5">Edizione {cat.year}</p>
                        )}
                      </div>
                      {cat.pdf_url && (
                        <div className="flex flex-col gap-2">
                          <Button
                            asChild
                            className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
                          >
                            <a href={cat.pdf_url} download target="_blank" rel="noopener noreferrer">
                              <Download className="size-4 mr-2" />
                              Scarica PDF
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF viewer on the right */}
                  <div className="lg:col-span-3">
                    {cat.pdf_url ? (
                      <PdfViewer url={cat.pdf_url} title={cat.title} />
                    ) : (
                      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Maximize2 className="size-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 italic">PDF non disponibile</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-100 max-w-2xl mx-auto">
              <BookOpen className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                I cataloghi saranno disponibili a breve.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Stiamo preparando i nuovi cataloghi. Torna a trovarci presto!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
