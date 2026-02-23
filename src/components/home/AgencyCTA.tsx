import Image from "next/image";
import Link from "next/link";
import { MapPin, Ship } from "lucide-react";
import SectionReveal from "./SectionReveal";

export default function AgencyCTA() {
  return (
    <section className="relative py-24 bg-gray-50 overflow-hidden">
      {/* World map watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/images/agency-cta/world-map.png"
          alt=""
          width={1280}
          height={640}
          className="opacity-[0.15] object-contain max-w-full max-h-full"
          aria-hidden="true"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading — same pattern as all other sections */}
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
            Offri ai tuoi clienti il viaggio della loro vita
          </h2>
          <p className="text-lg md:text-xl text-center text-[#C41E2F] font-semibold font-[family-name:var(--font-poppins)] mb-3">
            Al resto pensiamo noi
          </p>
          <div className="section-divider mb-16" />
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              Misha Travel &egrave; il partner ideale per le agenzie di viaggio
              che vogliono proporre tour e crociere fluviali progettati con cura,
              garantiti e personalizzabili.
            </p>
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              Dalle esperienze culturali alle rotte fluviali esclusive, ti
              forniamo itinerari pronti da vendere, assistenza continua e
              materiali per la promozione.
            </p>
          </div>
        </SectionReveal>

        {/* Two cards */}
        <SectionReveal delay={0.15}>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-6 max-w-3xl mx-auto">
            {/* Card: Tour */}
            <Link
              href="/tours"
              className="group relative flex-1 max-w-[380px] mx-auto sm:mx-0 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <Image
                src="/images/agency-cta/bg-tours.png"
                alt="I nostri tour"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 380px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B2D4F]/70 to-[#1B2D4F]/40" />
              <div className="relative flex items-center justify-center gap-4 p-8 min-h-[140px]">
                <MapPin className="size-10 text-white shrink-0" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-white font-[family-name:var(--font-poppins)]">
                  I nostri tour
                </h3>
              </div>
            </Link>

            {/* Card: Crociere */}
            <Link
              href="/crociere"
              className="group relative flex-1 max-w-[380px] mx-auto sm:mx-0 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <Image
                src="/images/agency-cta/bg-cruises.png"
                alt="Crociere Fluviali"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 380px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B2D4F]/70 to-[#1B2D4F]/40" />
              <div className="relative flex items-center justify-center gap-4 p-8 min-h-[140px]">
                <Ship className="size-10 text-white shrink-0" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-white font-[family-name:var(--font-poppins)]">
                  Crociere Fluviali
                </h3>
              </div>
            </Link>
          </div>
        </SectionReveal>

        {/* CTA — same button style as other sections */}
        <SectionReveal delay={0.2}>
          <div className="text-center mt-8">
            <Link
              href="/diventa-partner"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white font-semibold transition-colors"
            >
              Diventa Partner
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
