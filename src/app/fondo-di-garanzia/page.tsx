import PageHero from "@/components/layout/PageHero";
import { Shield, CheckCircle } from "lucide-react";

export default function FondoDiGaranziaPage() {
  return (
    <>
      <PageHero
        title="Fondo di Garanzia"
        breadcrumbs={[{ label: "Fondo di Garanzia", href: "/fondo-di-garanzia" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 mb-8 flex items-start gap-4">
            <Shield className="size-10 text-[#C41E2F] shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] mb-2">La Tua Sicurezza e la Nostra Priorita</h2>
              <p className="text-gray-600 leading-relaxed">
                Misha Travel aderisce al Fondo di Garanzia Nazionale a tutela dei viaggiatori,
                come previsto dal D.Lgs. 62/2018 (Codice del Turismo), garantendo la massima
                protezione per ogni prenotazione.
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Cos&apos;e il Fondo di Garanzia
            </h2>
            <p className="mb-6 leading-relaxed">
              Il Fondo Nazionale di Garanzia e stato istituito presso il Ministero del Turismo
              per tutelare i consumatori che acquistano pacchetti turistici. Il fondo interviene
              in caso di insolvenza o fallimento dell&apos;organizzatore di viaggi, garantendo il
              rimborso del prezzo versato e il rientro immediato del viaggiatore.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Quando Interviene il Fondo
            </h2>
            <div className="space-y-3 mb-6">
              {[
                "Rimborso del prezzo versato per il pacchetto turistico in caso di insolvenza dell'organizzatore",
                "Rimpatrio del viaggiatore nel caso in cui si trovi all'estero al momento dell'insolvenza",
                "Fornitura di un'assistenza immediata in caso di emergenza durante il viaggio",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Come Funziona
            </h2>
            <p className="mb-6 leading-relaxed">
              Tutti i tour operator e le agenzie di viaggio che vendono pacchetti turistici in
              Italia sono tenuti a contribuire al Fondo. Misha Travel versa regolarmente il
              proprio contributo, garantendo cosi ai propri clienti la massima tutela prevista
              dalla legge.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Come Richiedere l&apos;Intervento
            </h2>
            <p className="mb-6 leading-relaxed">
              In caso di necessita, il viaggiatore puo richiedere l&apos;intervento del Fondo
              presentando apposita domanda corredata dalla documentazione di viaggio. Per
              informazioni dettagliate sulle procedure, contattare il nostro servizio clienti
              all&apos;indirizzo info@mishatravel.com o consultare il sito del Ministero del Turismo.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Polizza Assicurativa Integrativa
            </h2>
            <p className="mb-6 leading-relaxed">
              Oltre al Fondo di Garanzia, Misha Travel stipula una polizza assicurativa
              integrativa per la responsabilita civile professionale, offrendo un ulteriore
              livello di protezione ai propri clienti. I dettagli della copertura sono
              disponibili presso i nostri uffici.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
