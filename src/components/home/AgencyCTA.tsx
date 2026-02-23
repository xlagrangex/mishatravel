import Link from "next/link";
import { Handshake, Globe, Ship } from "lucide-react";
import SectionReveal from "./SectionReveal";

export default function AgencyCTA() {
  return (
    <section className="relative py-20 bg-[#1B2D4F] overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-poppins)] mb-4">
            Offri ai tuoi clienti il viaggio della loro vita
          </h2>
          <p className="text-xl text-[#C41E2F] font-semibold mb-8 font-[family-name:var(--font-poppins)]">
            Al resto pensiamo noi
          </p>
          <p className="text-white/70 leading-relaxed mb-4 max-w-2xl mx-auto">
            Misha Travel &egrave; il partner ideale per le agenzie di viaggio
            che vogliono proporre tour e crociere fluviali progettati con cura,
            garantiti e personalizzabili.
          </p>
          <p className="text-white/70 leading-relaxed mb-12 max-w-2xl mx-auto">
            Dalle esperienze culturali alle rotte fluviali esclusive, ti
            forniamo itinerari pronti da vendere, assistenza continua e materiali
            per la promozione.
          </p>
        </SectionReveal>

        {/* Feature cards */}
        <SectionReveal delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <Link
              href="/tours"
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#C41E2F] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="size-7 text-white" />
              </div>
              <span className="block text-sm font-semibold text-white">
                I nostri Tour
              </span>
              <span className="block text-xs text-white/50 mt-1">
                Viaggi culturali e itinerari
              </span>
            </Link>
            <Link
              href="/crociere"
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#C41E2F] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Ship className="size-7 text-white" />
              </div>
              <span className="block text-sm font-semibold text-white">
                Crociere Fluviali
              </span>
              <span className="block text-xs text-white/50 mt-1">
                Rotte esclusive in Europa
              </span>
            </Link>
            <Link
              href="/diventa-partner"
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#C41E2F] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Handshake className="size-7 text-white" />
              </div>
              <span className="block text-sm font-semibold text-white">
                Diventa Partner
              </span>
              <span className="block text-xs text-white/50 mt-1">
                Entra nella nostra rete
              </span>
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.3}>
          <Link
            href="/diventa-partner"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold transition-colors text-lg"
          >
            Diventa Partner
          </Link>
        </SectionReveal>
      </div>
    </section>
  );
}
