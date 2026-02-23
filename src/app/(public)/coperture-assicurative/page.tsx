import PageHero from "@/components/layout/PageHero";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export default function CopertureAssicurativePage() {
  return (
    <>
      <PageHero
        title="Coperture Assicurative"
        breadcrumbs={[{ label: "Coperture Assicurative", href: "/coperture-assicurative" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-8 leading-relaxed text-lg">
              Viaggiare in sicurezza e una priorita per Misha Travel. Tutti i nostri pacchetti
              includono una copertura assicurativa base. Offriamo inoltre coperture integrative
              facoltative per una protezione ancora piu completa.
            </p>

            {/* Assicurazione base inclusa */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="size-7 text-green-700" />
                <h2 className="text-xl font-bold text-green-800">
                  Assicurazione Medico-Bagaglio (Inclusa)
                </h2>
              </div>
              <p className="text-green-700 mb-4">
                Inclusa in tutti i pacchetti di viaggio Misha Travel senza costi aggiuntivi.
              </p>
              <div className="space-y-2">
                {[
                  "Spese mediche e ospedaliere all'estero fino a 50.000 euro",
                  "Rimpatrio sanitario d'urgenza",
                  "Assistenza telefonica 24h/365 giorni",
                  "Smarrimento e danneggiamento bagaglio fino a 1.500 euro",
                  "Ritardata consegna bagaglio",
                  "Responsabilita civile verso terzi",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="size-4 text-green-600 shrink-0 mt-1" />
                    <span className="text-green-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assicurazione Annullamento */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="size-7 text-blue-700" />
                <h2 className="text-xl font-bold text-blue-800">
                  Assicurazione Annullamento Viaggio (Facoltativa)
                </h2>
              </div>
              <p className="text-blue-700 mb-4">
                Copertura facoltativa consigliata. Costo: dal 3% al 5% del valore del pacchetto.
              </p>
              <div className="space-y-2">
                {[
                  "Rimborso totale in caso di annullamento per motivi documentati",
                  "Malattia o infortunio del viaggiatore o di un familiare",
                  "Convocazione in tribunale come giurato o testimone",
                  "Danni gravi all'abitazione del viaggiatore",
                  "Licenziamento o mancata assunzione",
                  "Interruzione del viaggio gia iniziato",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="size-4 text-blue-600 shrink-0 mt-1" />
                    <span className="text-blue-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cosa NON e coperto */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-8">
              <h2 className="text-xl font-bold text-red-800 mb-4">Cosa Non e Coperto</h2>
              <div className="space-y-2">
                {[
                  "Patologie preesistenti non dichiarate",
                  "Annullamento per motivi diversi da quelli previsti dalla polizza",
                  "Danni causati da eventi bellici o atti terroristici (salvo copertura specifica)",
                  "Sport estremi non dichiarati in fase di prenotazione",
                  "Pandemie (salvo polizza specifica COVID-19)",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <XCircle className="size-4 text-red-500 shrink-0 mt-1" />
                    <span className="text-red-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Come Attivare la Copertura Facoltativa
            </h2>
            <p className="mb-6 leading-relaxed">
              L&apos;assicurazione annullamento viaggio puo essere sottoscritta al momento della
              prenotazione del pacchetto. Il costo viene calcolato in percentuale sul valore
              totale del viaggio. Per maggiori informazioni, contattate il nostro servizio
              clienti o la vostra agenzia di riferimento.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Come Aprire un Sinistro
            </h2>
            <p className="mb-6 leading-relaxed">
              In caso di sinistro, contattare immediatamente la centrale operativa al numero
              indicato sulla polizza (disponibile 24/7). Successivamente, inviare tutta la
              documentazione richiesta (certificati medici, denuncia, ricevute) all&apos;indirizzo
              email sinistri@mishatravel.com entro 10 giorni dal rientro.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
