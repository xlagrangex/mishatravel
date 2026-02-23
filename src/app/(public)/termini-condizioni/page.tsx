import PageHero from "@/components/layout/PageHero";

export default function TerminiCondizioniPage() {
  return (
    <>
      <PageHero
        title="Termini e Condizioni"
        breadcrumbs={[{ label: "Termini e Condizioni", href: "/termini-condizioni" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-sm text-gray-400 mb-8">Ultimo aggiornamento: 1 giugno 2025</p>

            <p className="mb-8 leading-relaxed">
              L&apos;accesso e l&apos;utilizzo del sito web www.mishatravel.com (di seguito, &ldquo;Sito&rdquo;)
              implicano l&apos;accettazione integrale e senza riserve dei presenti Termini e Condizioni da
              parte dell&apos;utente. Qualora l&apos;utente non intenda accettare anche solo una delle seguenti
              disposizioni, è invitato a non utilizzare il sito.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              1. Titolare del Sito
            </h2>
            <p className="mb-2 leading-relaxed">Il sito è gestito da:</p>
            <p className="mb-2 leading-relaxed">Crucemundo Italia Misha Travel S.r.l.</p>
            <p className="mb-2 leading-relaxed">Piazza Grimaldi 1-3-5-7 r, 16124 – Genova (GE) – Italia</p>
            <p className="mb-2 leading-relaxed">P.IVA: 02531300990</p>
            <p className="mb-8 leading-relaxed">
              Email:{" "}
              <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] underline hover:no-underline">
                agenzia@mishatravel.com
              </a>
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              2. Accesso al Sito e visibilità dei contenuti
            </h2>
            <p className="mb-2 leading-relaxed">
              Il Sito è liberamente accessibile da qualsiasi utente, che può consultare i contenuti
              pubblici disponibili, inclusi:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Schede descrittive dei tour e crociere</li>
              <li>Itinerari e dettagli di viaggio</li>
              <li>Immagini illustrative</li>
              <li>Offerte e promozioni generiche</li>
            </ul>
            <p className="mb-2 leading-relaxed">
              Tuttavia, solo le agenzie di viaggio regolarmente registrate e approvate possono:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Inviare richieste di preventivo</li>
              <li>Accedere all&apos;area riservata con funzionalità dedicate</li>
              <li>Visualizzare condizioni riservate, documentazione e informazioni non pubbliche</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              L&apos;utente è consapevole che alcune funzionalità sono esclusive per utenti professionali
              (agenzie) e non disponibili al pubblico generico.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              3. Registrazione agenzie e area riservata
            </h2>
            <p className="mb-4 leading-relaxed">
              La registrazione è consentita esclusivamente alle agenzie di viaggio e ai professionisti
              del settore turistico. La richiesta di iscrizione prevede l&apos;inserimento di dati aziendali
              obbligatori e sarà soggetta a verifica manuale da parte del Titolare. L&apos;accesso all&apos;area
              riservata è subordinato all&apos;approvazione del profilo.
            </p>
            <p className="mb-2 leading-relaxed">Una volta loggati, gli utenti potranno:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Visualizzare le richieste di preventivo inviate</li>
              <li>Monitorare lo stato di approvazione di ciascuna richiesta</li>
              <li>Consultare gli estratti conto e lo storico delle interazioni</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              Non è prevista la possibilità, da parte dell&apos;agenzia, di modificare i contenuti del
              sito, né di inserire materiali propri.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              4. Mappa delle agenzie partner
            </h2>
            <p className="mb-4 leading-relaxed">
              All&apos;interno del Sito è disponibile una mappa geolocalizzata delle agenzie partner
              registrate, con lo scopo di favorire il contatto tra il cliente finale interessato ai
              pacchetti offerti e l&apos;agenzia di viaggio più vicina.
            </p>
            <p className="mb-8 leading-relaxed">
              La presenza sulla mappa avviene esclusivamente per agenzie iscritte e approvate. I dati
              visibili sono strettamente necessari e trattati nel rispetto della normativa sulla
              protezione dei dati personali.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              5. Contenuti del sito e proprietà intellettuale
            </h2>
            <p className="mb-4 leading-relaxed">
              Tutti i contenuti presenti sul sito – inclusi, a titolo esemplificativo e non esaustivo,
              testi, fotografie, schede tour, descrizioni, video, grafiche, loghi, file PDF, mappe,
              disegni, layout grafico e nome di dominio – sono di esclusiva proprietà di Crucemundo
              Italia Misha Travel S.r.l. o concessi in licenza d&apos;uso da terze parti.
            </p>
            <p className="mb-8 leading-relaxed">
              È vietata la copia, riproduzione, distribuzione, pubblicazione, alterazione, trasmissione
              o utilizzo non autorizzato, anche parziale, su qualsiasi supporto e con qualsiasi
              tecnologia, senza il previo consenso scritto del Titolare.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              6. Accuratezza delle informazioni e responsabilità
            </h2>
            <p className="mb-4 leading-relaxed">
              Il Titolare si impegna a mantenere aggiornati e accurati i contenuti del sito, ma non
              garantisce l&apos;assenza di errori, omissioni, refusi, o la tempestività dell&apos;aggiornamento
              delle informazioni.
            </p>
            <p className="mb-4 leading-relaxed">
              Eventuali errori materiali, discrepanze nei prezzi o modifiche logistiche nei pacchetti
              possono essere corretti in qualsiasi momento, senza preavviso.
            </p>
            <p className="mb-8 leading-relaxed">
              Il Titolare declina ogni responsabilità per danni diretti o indiretti derivanti
              dall&apos;utilizzo, consultazione o affidamento sulle informazioni contenute nel sito.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              7. Comportamenti vietati
            </h2>
            <p className="mb-2 leading-relaxed">È vietato, da parte di qualsiasi utente:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Condividere o cedere a terzi le proprie credenziali di accesso</li>
              <li>Utilizzare più dispositivi o utenti per accedere abusivamente ai servizi riservati</li>
              <li>Tentare l&apos;accesso non autorizzato ad aree riservate</li>
              <li>Eseguire attività di scraping, mining o download massivo dei contenuti del sito</li>
              <li>Caricare, trasmettere o diffondere virus o codici potenzialmente dannosi</li>
              <li>Alterare o interferire con il funzionamento tecnico del sito</li>
              <li>Usare il sito per scopi contrari alla legge o lesivi dei diritti di terzi</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              Il Titolare si riserva il diritto di sospendere o cancellare in qualsiasi momento
              l&apos;account degli utenti che violano i presenti Termini o ne fanno un uso improprio.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              8. Disponibilità del sito
            </h2>
            <p className="mb-4 leading-relaxed">
              Il Titolare si riserva il diritto di modificare, sospendere o interrompere il
              funzionamento del sito o di qualsiasi sua parte, anche senza preavviso.
            </p>
            <p className="mb-8 leading-relaxed">
              Non viene fornita alcuna garanzia in merito alla disponibilità continua, senza errori
              o interruzioni del servizio.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              9. Legge applicabile e foro competente
            </h2>
            <p className="mb-4 leading-relaxed">
              I presenti Termini e Condizioni sono regolati dalla legge italiana.
            </p>
            <p className="mb-6 leading-relaxed">
              Per ogni controversia derivante dall&apos;interpretazione, esecuzione o validità dei presenti
              Termini sarà competente in via esclusiva il Foro di Genova, fatto salvo quanto disposto
              da eventuali norme inderogabili di legge.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
