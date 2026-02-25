import PageHero from "@/components/layout/PageHero";
import PdfViewer from "@/components/PdfViewer";
import { Button } from "@/components/ui/button";
import { Download, BookOpen } from "lucide-react";
import { getPublishedCatalogs } from "@/lib/supabase/queries/catalogs";

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
        backgroundImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600&h=600&fit=crop"
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
        <div className="container mx-auto px-4 max-w-4xl">
          {cataloghi.length > 0 ? (
            <div className="space-y-16">
              {cataloghi.map((cat) => (
                <div key={cat.id}>
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                      {cat.title}
                    </h3>
                    {cat.year && (
                      <p className="text-sm text-gray-500 mt-1">Edizione {cat.year}</p>
                    )}
                  </div>

                  {cat.pdf_url ? (
                    <>
                      <PdfViewer url={cat.pdf_url} title={cat.title} />
                      <div className="mt-4 flex justify-center">
                        <Button
                          asChild
                          className="bg-[#C41E2F] hover:bg-[#A31825] text-white"
                        >
                          <a href={cat.pdf_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="size-4 mr-2" />
                            Scarica PDF
                          </a>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">PDF non disponibile</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
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
