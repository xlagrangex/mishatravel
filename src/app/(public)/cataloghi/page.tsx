import PageHero from "@/components/layout/PageHero";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cataloghi } from "@/lib/data";

export default function CataloghiPage() {
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
            Scarica i nostri cataloghi per scoprire tutti gli itinerari, le date di partenza e i
            prezzi delle nostre proposte di viaggio. Puoi sfogliarli online o scaricarli in formato
            PDF per consultarli quando vuoi.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {cataloghi.map((cat) => (
              <div
                key={cat.slug}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 group"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{cat.description}</p>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      className="flex-1 bg-[#C41E2F] hover:bg-[#A31825] text-white"
                    >
                      <a href={cat.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="size-4 mr-2" />
                        Scarica PDF
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-[#1B2D4F] text-[#1B2D4F] hover:bg-[#1B2D4F] hover:text-white"
                    >
                      <a href={cat.pdfUrl} target="_blank" rel="noopener noreferrer">
                        Sfoglia Online
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
