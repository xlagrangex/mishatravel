import Link from "next/link";
import SectionReveal from "./SectionReveal";

export default function AgencyCTA() {
  return (
    <section className="relative py-16 bg-gray-50 overflow-hidden">
      {/* Dotted pattern background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #1B2D4F 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
            Offri ai tuoi clienti il viaggio della loro vita
          </h2>
          <p className="text-xl text-[#C41E2F] font-semibold mb-6 font-[family-name:var(--font-poppins)]">
            Al resto pensiamo noi
          </p>
          <p className="text-gray-600 leading-relaxed mb-4 max-w-2xl mx-auto">
            Misha Travel &egrave; il partner ideale per le agenzie di viaggio che vogliono proporre tour e
            crociere fluviali progettati con cura, garantiti e personalizzabili.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Dalle esperienze culturali alle rotte fluviali esclusive, ti forniamo itinerari pronti da vendere,
            assistenza continua e materiali per la promozione.
          </p>
        </SectionReveal>

        {/* GIF Icons */}
        <SectionReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
            <Link href="/tours" className="group flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/tours/icon-001.gif"
                  alt="I nostri tour"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-[#1B2D4F] group-hover:text-[#C41E2F] transition-colors">
                I nostri tour
              </span>
            </Link>
            <Link href="/crociere" className="group flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/cruises/output-onlinegiftools.gif"
                  alt="Crociere Fluviali"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-[#1B2D4F] group-hover:text-[#C41E2F] transition-colors">
                Crociere Fluviali
              </span>
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.3}>
          <Link
            href="/diventa-partner"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold transition-colors text-lg"
          >
            Diventa Partner
          </Link>
        </SectionReveal>
      </div>
    </section>
  );
}
