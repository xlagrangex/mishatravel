import PageHero from "@/components/layout/PageHero";

export default function TerminiCondizioniPage() {
  return (
    <>
      <PageHero
        title="Termini e Condizioni"
        breadcrumbs={[{ label: "Termini e Condizioni", href: "/termini-condizioni" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-sm text-gray-400 mb-8">Ultimo aggiornamento: 21 febbraio 2026</p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              1. Premessa
            </h2>
            <p className="mb-6 leading-relaxed">
              Le presenti Condizioni Generali regolano il rapporto tra Misha Travel Srl (di
              seguito &ldquo;l&apos;Organizzatore&rdquo;) e il viaggiatore (di seguito &ldquo;il Cliente&rdquo;) per
              la vendita di pacchetti turistici ai sensi del D.Lgs. 62/2018 (Codice del Turismo).
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              2. Prenotazione e Conferma
            </h2>
            <p className="mb-6 leading-relaxed">
              La prenotazione si intende confermata al ricevimento dell&apos;acconto pari al 30%
              del costo totale del pacchetto. Il saldo dovra essere versato entro 30 giorni
              dalla data di partenza per i tour e 45 giorni per le crociere fluviali. In caso
              di prenotazioni effettuate a meno di 30/45 giorni dalla partenza, l&apos;intero importo
              dovra essere versato contestualmente alla prenotazione.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              3. Prezzi
            </h2>
            <p className="mb-6 leading-relaxed">
              I prezzi indicati nel catalogo e sul sito web sono per persona in camera doppia,
              salvo diversa indicazione. I prezzi possono essere soggetti a variazioni in base
              alle fluttuazioni dei cambi valutari, dei costi del carburante e delle tasse
              aeroportuali, nei limiti previsti dalla legge.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              4. Documenti di Viaggio
            </h2>
            <p className="mb-6 leading-relaxed">
              E responsabilita del Cliente verificare la validita dei propri documenti di viaggio
              (passaporto, visto, certificati sanitari) prima della partenza. L&apos;Organizzatore
              non e responsabile per mancate partenze dovute a documenti non validi o insufficienti.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              5. Modifiche e Variazioni
            </h2>
            <p className="mb-6 leading-relaxed">
              L&apos;Organizzatore si riserva il diritto di modificare l&apos;itinerario qualora
              circostanze eccezionali lo richiedano, garantendo servizi di qualita equivalente
              o superiore. In caso di modifiche significative, il Cliente ha diritto di recedere
              dal contratto con rimborso integrale.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              6. Responsabilita
            </h2>
            <p className="mb-6 leading-relaxed">
              L&apos;Organizzatore e responsabile dell&apos;esecuzione dei servizi previsti dal contratto,
              secondo quanto stabilito dal Codice del Turismo. La responsabilita dell&apos;Organizzatore
              e limitata a quanto previsto dalle convenzioni internazionali in materia di trasporto
              e alloggio.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              7. Reclami
            </h2>
            <p className="mb-6 leading-relaxed">
              Eventuali reclami devono essere inoltrati per iscritto entro 10 giorni lavorativi
              dal rientro dal viaggio, all&apos;indirizzo email reclami@mishatravel.com o tramite
              raccomandata A/R alla sede legale dell&apos;Organizzatore.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              8. Foro Competente
            </h2>
            <p className="mb-6 leading-relaxed">
              Per qualsiasi controversia derivante dal presente contratto sara competente in via
              esclusiva il Foro di Roma, salvo il foro del consumatore come previsto dalla normativa
              vigente.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
