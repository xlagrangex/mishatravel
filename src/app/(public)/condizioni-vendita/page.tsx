import PageHero from "@/components/layout/PageHero";

export const metadata = {
  title: "Condizioni Generali di Vendita | Misha Travel",
  description: "Condizioni generali di vendita dei pacchetti turistici Misha Travel.",
};

export default function CondizioniVenditaPage() {
  return (
    <>
      <PageHero
        title="Condizioni Generali di Vendita"
        subtitle="Condizioni contrattuali per i pacchetti turistici"
      />

      <section className="py-16 bg-white">
        <div className="mx-auto px-4 max-w-[1000px]">
          {/* Banner revisione */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10">
            <p className="text-amber-800 text-sm font-medium">
              Contenuti da revisionare &mdash; Questa pagina contiene testi provvisori da verificare e aggiornare con le condizioni ufficiali.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
            <p className="text-sm text-gray-500">Ultimo aggiornamento: da definire</p>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                1. Premessa
              </h2>
              <p className="leading-relaxed">
                Le presenti Condizioni Generali di Vendita disciplinano l&apos;acquisto di pacchetti turistici,
                servizi di viaggio e prodotti correlati offerti da Crucemundo Italia Misha Travel S.r.l.
                (di seguito &quot;Organizzatore&quot;) tramite le agenzie di viaggio partner (di seguito &quot;Venditore&quot;),
                ai sensi del D.Lgs. 62/2018 (Codice del Turismo) e della Direttiva UE 2015/2302.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                2. Organizzatore
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Crucemundo Italia Misha Travel S.r.l.</strong></p>
                <p>Piazza Grimaldi 1-3-5-7 r, 16124 Genova (GE)</p>
                <p>P.IVA: 02531300990</p>
                <p>Email: agenzia@mishatravel.com</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                3. Prenotazione e conclusione del contratto
              </h2>
              <p className="leading-relaxed">
                La prenotazione si intende conclusa e vincolante al momento della conferma scritta
                da parte dell&apos;Organizzatore e del versamento dell&apos;acconto previsto. Il contratto di viaggio
                &egrave; regolato dalle presenti condizioni, dalle informazioni contenute nella scheda tecnica
                del pacchetto e dalle norme di legge vigenti.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                4. Pagamenti
              </h2>
              <p className="leading-relaxed">
                All&apos;atto della prenotazione &egrave; richiesto il versamento di un acconto pari al 25% del prezzo
                totale del pacchetto. Il saldo dovr&agrave; essere corrisposto entro 30 giorni prima della data
                di partenza, salvo diverse condizioni specificate nella conferma di prenotazione.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                5. Prezzo del pacchetto
              </h2>
              <p className="leading-relaxed">
                I prezzi indicati nei cataloghi e sul sito web sono da intendersi per persona e si riferiscono
                alla sistemazione in camera doppia, salvo diversa indicazione. Il prezzo pu&ograve; essere soggetto
                a variazioni in caso di modifiche dei costi di trasporto, tasse o tassi di cambio,
                nei limiti previsti dalla normativa vigente.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                6. Recesso del viaggiatore
              </h2>
              <p className="leading-relaxed">
                Il viaggiatore pu&ograve; recedere dal contratto in qualsiasi momento prima dell&apos;inizio del
                pacchetto, corrispondendo all&apos;Organizzatore le penali di cancellazione previste nella
                sezione &quot;Cancellazioni e Penali&quot; del presente sito.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                7. Responsabilit&agrave; dell&apos;Organizzatore
              </h2>
              <p className="leading-relaxed">
                L&apos;Organizzatore &egrave; responsabile dell&apos;esecuzione dei servizi turistici previsti dal contratto,
                indipendentemente dal fatto che tali servizi siano prestati direttamente o da altri fornitori.
                La responsabilit&agrave; &egrave; regolata dal D.Lgs. 62/2018.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                8. Foro competente
              </h2>
              <p className="leading-relaxed">
                Per qualsiasi controversia relativa all&apos;applicazione delle presenti condizioni sar&agrave;
                competente in via esclusiva il Foro di Genova.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
