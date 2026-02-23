import Image from "next/image";
import Link from "next/link";
import { MapPin, Ship } from "lucide-react";
import SectionReveal from "./SectionReveal";

export default function AgencyCTA() {
  return (
    <section className="relative py-20 md:py-24 bg-slate-50 overflow-hidden">
      {/* World map watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/images/agency-cta/world-map.png"
          alt=""
          width={1280}
          height={640}
          className="opacity-30 object-contain max-w-full max-h-full"
          aria-hidden="true"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <SectionReveal>
          <h2 className="text-3xl md:text-[2.4rem] font-semibold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] leading-[1.3] mb-6 max-w-4xl mx-auto">
            Offri ai tuoi clienti il viaggio della loro vita,
            <br />
            Al resto pensiamo noi
          </h2>

          <div className="max-w-[80%] mx-auto text-center space-y-4 mb-12">
            <p className="text-lg text-gray-500 leading-relaxed">
              Misha Travel &egrave; il partner ideale per le agenzie di viaggio
              che vogliono proporre tour e crociere fluviali progettati con cura,
              garantiti e personalizzabili.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              Dalle esperienze culturali alle rotte fluviali esclusive, ti
              forniamo itinerari pronti da vendere, assistenza continua e
              materiali per la promozione.
            </p>
          </div>
        </SectionReveal>

        {/* Two cards */}
        <SectionReveal delay={0.15}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-4xl mx-auto">
            {/* Card: Tour */}
            <Link
              href="/tours"
              className="group relative w-full sm:w-[380px] min-h-[136px] rounded-lg overflow-hidden transition-all duration-400 hover:shadow-xl"
            >
              <Image
                src="/images/agency-cta/bg-tours.png"
                alt="I nostri tour"
                fill
                className="object-cover object-left transition-transform duration-500 group-hover:scale-105"
                sizes="380px"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative flex items-center justify-center gap-4 p-8 h-full">
                <MapPin className="size-12 text-white shrink-0" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold text-white font-[family-name:var(--font-poppins)]">
                  I nostri tour
                </h3>
              </div>
            </Link>

            {/* Card: Crociere */}
            <Link
              href="/crociere"
              className="group relative w-full sm:w-[380px] min-h-[136px] rounded-lg overflow-hidden transition-all duration-400 hover:shadow-xl"
            >
              <Image
                src="/images/agency-cta/bg-cruises.png"
                alt="Crociere Fluviali"
                fill
                className="object-cover object-left transition-transform duration-500 group-hover:scale-105"
                sizes="380px"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative flex items-center justify-center gap-4 p-8 h-full">
                <Ship className="size-12 text-white shrink-0" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold text-white font-[family-name:var(--font-poppins)]">
                  Crociere Fluviali
                </h3>
              </div>
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
