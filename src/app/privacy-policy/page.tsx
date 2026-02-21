import PageHero from "@/components/layout/PageHero";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        breadcrumbs={[{ label: "Privacy Policy", href: "/privacy-policy" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-sm text-gray-400 mb-8">Ultimo aggiornamento: 21 febbraio 2026</p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              1. Titolare del Trattamento
            </h2>
            <p className="mb-6 leading-relaxed">
              Il titolare del trattamento dei dati personali e Misha Travel Srl, con sede legale
              in Via Example 123, 00100 Roma (RM), Italia. P.IVA: 01234567890. Email:
              privacy@mishatravel.com.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              2. Dati Raccolti
            </h2>
            <p className="mb-4 leading-relaxed">
              Raccogliamo i seguenti dati personali: nome e cognome, indirizzo email, numero di
              telefono, indirizzo postale, dati di navigazione (indirizzo IP, tipo di browser,
              pagine visitate) e qualsiasi altra informazione fornita volontariamente dall&apos;utente
              tramite i moduli presenti sul sito.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              3. Finalita del Trattamento
            </h2>
            <p className="mb-2 leading-relaxed">I dati personali sono trattati per le seguenti finalita:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Gestione delle richieste di informazioni e preventivi</li>
              <li>Gestione delle prenotazioni e dei servizi di viaggio</li>
              <li>Invio di comunicazioni commerciali e promozionali (previo consenso)</li>
              <li>Adempimento di obblighi legali e contrattuali</li>
              <li>Analisi statistica e miglioramento dei servizi</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              4. Base Giuridica del Trattamento
            </h2>
            <p className="mb-6 leading-relaxed">
              Il trattamento dei dati si basa sul consenso dell&apos;interessato, sull&apos;esecuzione di un
              contratto di cui l&apos;interessato e parte, su obblighi legali a cui e soggetto il
              titolare, e sul legittimo interesse del titolare.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              5. Conservazione dei Dati
            </h2>
            <p className="mb-6 leading-relaxed">
              I dati personali sono conservati per il tempo strettamente necessario al
              raggiungimento delle finalita per cui sono stati raccolti e comunque non oltre
              i termini previsti dalla normativa vigente.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              6. Diritti dell&apos;Interessato
            </h2>
            <p className="mb-2 leading-relaxed">
              L&apos;interessato ha diritto di:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Accedere ai propri dati personali</li>
              <li>Richiederne la rettifica o la cancellazione</li>
              <li>Limitare il trattamento</li>
              <li>Opporsi al trattamento</li>
              <li>Richiedere la portabilita dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Proporre reclamo all&apos;Autorita Garante</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              7. Contatti
            </h2>
            <p className="mb-6 leading-relaxed">
              Per esercitare i propri diritti o per qualsiasi domanda relativa alla presente
              informativa, e possibile contattare il titolare all&apos;indirizzo email
              privacy@mishatravel.com.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
