import Link from "next/link";
import Image from "next/image";
import { Radio, ArrowRight } from "lucide-react";
import PageHero from "@/components/layout/PageHero";

export const metadata = {
  title: "Chi Siamo | Misha Travel",
  description: "Scopri la storia e la missione di Misha Travel, tour operator specializzato in viaggi culturali e crociere fluviali.",
};

export default function ChiSiamoPage() {
  return (
    <>
      <PageHero
        title="Chi Siamo"
        subtitle="La nostra storia, la nostra passione per il viaggio"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Banner revisione */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10">
            <p className="text-amber-800 text-sm font-medium">
              Contenuti da revisionare &mdash; Questa pagina contiene testi provvisori da verificare e aggiornare.
            </p>
          </div>

          {/* Card richiamo intervista radio */}
          <Link
            href="/chi-siamo/intervista-radio-crociere-fluviali"
            className="group mb-12 block overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B2D4F] to-[#0f1d36] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="grid sm:grid-cols-5">
              <div className="relative aspect-video sm:col-span-2 sm:aspect-auto">
                <Image
                  src="https://i.ytimg.com/vi/uT8C58QECZw/maxresdefault.jpg"
                  alt="Intervista a MishaTravel su Storytime"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C41E2F] shadow-xl transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-6 text-white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center p-6 sm:col-span-3 sm:p-8">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90">
                  <Radio className="size-3" />
                  Storytime &middot; Evoluzione Radio
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-poppins)] text-xl font-bold text-white sm:text-2xl">
                  Ci hanno raccontato in radio
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  Alessia Cardone ospite a Storytime: crociere fluviali, viaggi di gruppo e il valore di un&rsquo;agenzia.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C41E2F] transition-all duration-300 group-hover:gap-3 group-hover:text-white">
                  Guarda l&rsquo;intervista
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          </Link>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Crucemundo Italia &ndash; Misha Travel
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Misha Travel &egrave; il marchio commerciale di Crucemundo Italia S.r.l., tour operator italiano con sede a
              Genova, specializzato nella creazione e commercializzazione di viaggi culturali, grandi itinerari e
              crociere fluviali in Europa e nel mondo.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              La nostra missione
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Operiamo esclusivamente nel canale B2B, lavorando a stretto contatto con le agenzie di viaggio
              su tutto il territorio nazionale. Il nostro obiettivo &egrave; fornire prodotti turistici di alta qualit&agrave;,
              assistenza personalizzata e condizioni commerciali competitive, permettendo alle agenzie partner
              di offrire ai propri clienti esperienze di viaggio indimenticabili.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Cosa facciamo
            </h2>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-[#C41E2F] font-bold mt-1">&#8226;</span>
                <span><strong>Tour culturali:</strong> itinerari studiati per scoprire le meraviglie artistiche, storiche e naturali di ogni destinazione</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C41E2F] font-bold mt-1">&#8226;</span>
                <span><strong>Grandi itinerari:</strong> viaggi intercontinentali con percorsi accuratamente selezionati</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C41E2F] font-bold mt-1">&#8226;</span>
                <span><strong>Crociere fluviali:</strong> navigazioni lungo i pi&ugrave; suggestivi fiumi europei con navi di propriet&agrave;</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              I nostri valori
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">Qualit&agrave;</h3>
                <p className="text-sm text-gray-600">
                  Selezioniamo personalmente ogni fornitore e testiamo le destinazioni per garantire standard elevati.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">Affidabilit&agrave;</h3>
                <p className="text-sm text-gray-600">
                  Assistenza continua prima, durante e dopo il viaggio. Il nostro team &egrave; sempre disponibile.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">Partnership</h3>
                <p className="text-sm text-gray-600">
                  Non siamo solo fornitori: siamo partner delle agenzie, con un approccio collaborativo e trasparente.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Dati aziendali
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 text-gray-600">
              <p><strong>Ragione sociale:</strong> Crucemundo Italia Misha Travel S.r.l.</p>
              <p><strong>Sede:</strong> Piazza Grimaldi 1-3-5-7 r, 16124 Genova (GE)</p>
              <p><strong>P.IVA:</strong> 02531300990</p>
              <p><strong>Email:</strong> info@mishatravel.com</p>
              <p><strong>Telefono:</strong> +39 010 246 1630</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
