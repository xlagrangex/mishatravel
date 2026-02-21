import PageHero from "@/components/layout/PageHero";

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        title="Cookie Policy"
        breadcrumbs={[{ label: "Cookie Policy", href: "/cookie-policy" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-sm text-gray-400 mb-8">Ultimo aggiornamento: 21 febbraio 2026</p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              1. Cosa Sono i Cookie
            </h2>
            <p className="mb-6 leading-relaxed">
              I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo dell&apos;utente
              quando visita un sito web. Servono a migliorare l&apos;esperienza di navigazione, a
              ricordare le preferenze dell&apos;utente e a raccogliere informazioni anonime sull&apos;utilizzo
              del sito.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              2. Tipologie di Cookie Utilizzati
            </h2>
            <h3 className="text-lg font-semibold text-[#1B2D4F] mb-2">Cookie Tecnici (Necessari)</h3>
            <p className="mb-4 leading-relaxed">
              Questi cookie sono essenziali per il corretto funzionamento del sito web. Senza di
              essi, alcune funzionalita del sito potrebbero non essere disponibili. Non richiedono
              il consenso dell&apos;utente in quanto strettamente necessari.
            </p>

            <h3 className="text-lg font-semibold text-[#1B2D4F] mb-2">Cookie Analitici</h3>
            <p className="mb-4 leading-relaxed">
              Utilizziamo cookie analitici per comprendere come i visitatori interagiscono con il
              nostro sito web. Questi cookie raccolgono informazioni in forma aggregata e anonima,
              aiutandoci a migliorare le prestazioni e l&apos;usabilita del sito.
            </p>

            <h3 className="text-lg font-semibold text-[#1B2D4F] mb-2">Cookie di Profilazione</h3>
            <p className="mb-6 leading-relaxed">
              Questi cookie vengono utilizzati per tracciare i visitatori sui siti web e mostrare
              annunci pubblicitari pertinenti e coinvolgenti. Vengono installati solo previo
              consenso dell&apos;utente.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              3. Come Gestire i Cookie
            </h2>
            <p className="mb-6 leading-relaxed">
              L&apos;utente puo gestire le proprie preferenze sui cookie attraverso il banner che
              appare alla prima visita del sito, oppure modificando le impostazioni del proprio
              browser. Si ricorda che la disabilitazione di alcuni cookie potrebbe influire
              sull&apos;esperienza di navigazione.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              4. Cookie di Terze Parti
            </h2>
            <p className="mb-6 leading-relaxed">
              Il nostro sito potrebbe contenere cookie installati da terze parti (ad esempio Google
              Analytics, Facebook, ecc.). Per maggiori informazioni su questi cookie, si prega di
              consultare le rispettive informative sulla privacy.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              5. Contatti
            </h2>
            <p className="mb-6 leading-relaxed">
              Per qualsiasi domanda relativa alla presente Cookie Policy, e possibile contattarci
              all&apos;indirizzo email privacy@mishatravel.com o scrivere a Misha Travel Srl, Via
              Example 123, 00100 Roma (RM).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
