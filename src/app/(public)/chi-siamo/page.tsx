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
