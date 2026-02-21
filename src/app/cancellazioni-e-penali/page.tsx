import PageHero from "@/components/layout/PageHero";
import Link from "next/link";

export default function CancellazioniEPenaliPage() {
  return (
    <>
      <PageHero
        title="Cancellazioni e Penali"
        breadcrumbs={[{ label: "Cancellazioni e Penali", href: "/cancellazioni-e-penali" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-sm text-gray-400 mb-8">Ultimo aggiornamento: 21 febbraio 2026</p>

            <p className="mb-8 leading-relaxed text-lg">
              Di seguito sono riportate le condizioni di cancellazione e le relative penali
              applicabili ai pacchetti di viaggio Misha Travel, in conformita con il D.Lgs.
              62/2018 (Codice del Turismo).
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Penali di Cancellazione - Tour
            </h2>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-[#1B2D4F]">
                    <th className="py-3 px-4 text-left font-semibold text-[#1B2D4F]">Giorni prima della partenza</th>
                    <th className="py-3 px-4 text-left font-semibold text-[#1B2D4F]">Penale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Oltre 60 giorni", "Perdita dell'acconto (30%)"],
                    ["Da 60 a 31 giorni", "50% del costo totale"],
                    ["Da 30 a 16 giorni", "75% del costo totale"],
                    ["Da 15 a 8 giorni", "90% del costo totale"],
                    ["Da 7 giorni a partenza / No show", "100% del costo totale"],
                  ].map(([days, penalty], i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 px-4">{days}</td>
                      <td className="py-3 px-4 font-medium text-[#C41E2F]">{penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Penali di Cancellazione - Crociere Fluviali
            </h2>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-[#1B2D4F]">
                    <th className="py-3 px-4 text-left font-semibold text-[#1B2D4F]">Giorni prima della partenza</th>
                    <th className="py-3 px-4 text-left font-semibold text-[#1B2D4F]">Penale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Oltre 90 giorni", "Perdita dell'acconto (30%)"],
                    ["Da 90 a 61 giorni", "50% del costo totale"],
                    ["Da 60 a 31 giorni", "75% del costo totale"],
                    ["Da 30 a 15 giorni", "90% del costo totale"],
                    ["Da 14 giorni a partenza / No show", "100% del costo totale"],
                  ].map(([days, penalty], i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 px-4">{days}</td>
                      <td className="py-3 px-4 font-medium text-[#C41E2F]">{penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Cancellazione da Parte dell&apos;Organizzatore
            </h2>
            <p className="mb-6 leading-relaxed">
              Misha Travel si riserva il diritto di cancellare un viaggio qualora non venga
              raggiunto il numero minimo di partecipanti o per cause di forza maggiore. In
              tal caso, il Cliente avra diritto al rimborso integrale delle somme versate,
              senza alcuna penale, oppure potra optare per un viaggio alternativo di pari
              valore o superiore con integrazione della differenza.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Cessione del Contratto
            </h2>
            <p className="mb-6 leading-relaxed">
              Il viaggiatore rinunciatario puo farsi sostituire da un&apos;altra persona,
              comunicandolo per iscritto almeno 7 giorni lavorativi prima della partenza.
              Il cedente e il cessionario sono solidalmente responsabili per il pagamento
              del prezzo e delle eventuali spese aggiuntive derivanti dalla cessione.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Assicurazione Annullamento
            </h2>
            <p className="mb-6 leading-relaxed">
              Per tutelarsi dalle penali di cancellazione, si consiglia vivamente di
              sottoscrivere l&apos;assicurazione annullamento viaggio al momento della
              prenotazione. Per maggiori dettagli, consulta la pagina{" "}
              <Link href="/coperture-assicurative" className="text-[#C41E2F] hover:underline">
                Coperture Assicurative
              </Link>.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Come Comunicare la Cancellazione
            </h2>
            <p className="mb-6 leading-relaxed">
              La cancellazione deve essere comunicata per iscritto via email all&apos;indirizzo
              prenotazioni@mishatravel.com o tramite la propria agenzia di viaggio. La data
              di ricevimento della comunicazione scritta fara fede per il calcolo delle penali.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
