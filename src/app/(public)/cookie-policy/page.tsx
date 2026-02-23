import PageHero from "@/components/layout/PageHero";

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        title="Cookie Policy"
        breadcrumbs={[{ label: "Cookie Policy", href: "/cookie-policy" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-sm text-gray-400 mb-8">Ultimo aggiornamento: 1 giugno 2025</p>

            <p className="mb-8 leading-relaxed">
              Il presente documento informa gli utenti del sito www.mishatravel.com sull&apos;utilizzo
              dei cookie e tecnologie simili, in conformità al Regolamento UE 2016/679 (GDPR), al
              D.lgs. 196/2003 e alle Linee Guida del Garante Privacy italiano.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              1. Cosa sono i cookie
            </h2>
            <p className="mb-2 leading-relaxed">
              I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell&apos;utente
              (computer, smartphone, tablet), dove vengono memorizzati per poi essere ritrasmessi agli
              stessi siti alla visita successiva. I cookie possono essere:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>Tecnici</strong> (essenziali per il funzionamento del sito)</li>
              <li><strong>Analitici</strong> (per finalità statistiche)</li>
              <li><strong>Di profilazione</strong> (per finalità di marketing)</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              2. Tipologie di cookie utilizzate
            </h2>
            <p className="mb-4 leading-relaxed">
              Il presente sito utilizza le seguenti categorie di cookie:
            </p>

            <h3 className="text-lg font-semibold text-[#1B2D4F] mb-2">a) Cookie tecnici (necessari)</h3>
            <p className="mb-6 leading-relaxed">
              Consentono la normale navigazione e fruizione del sito, la gestione dell&apos;area riservata
              agenzie, il salvataggio delle preferenze e la sicurezza del sito. Non richiedono il
              consenso preventivo.
            </p>

            <h3 className="text-lg font-semibold text-[#1B2D4F] mb-2">b) Cookie analitici (statistici)</h3>
            <p className="mb-2 leading-relaxed">
              Utilizzati per raccogliere informazioni in forma aggregata e anonima sul numero di
              utenti e su come questi visitano il sito.
            </p>
            <p className="mb-2 leading-relaxed">
              <strong>Strumento usato:</strong> Google Analytics (con anonimizzazione dell&apos;IP attiva).
            </p>
            <p className="mb-6 leading-relaxed">
              <strong>Base giuridica:</strong> legittimo interesse del Titolare.
            </p>

            <h3 className="text-lg font-semibold text-[#1B2D4F] mb-2">c) Cookie di profilazione e marketing</h3>
            <p className="mb-2 leading-relaxed">
              Utilizzati per creare profili utente e inviare messaggi pubblicitari in linea con le
              preferenze manifestate.
            </p>
            <p className="mb-2 leading-relaxed">
              <strong>Strumento usato:</strong> Meta/Facebook Pixel, eventualmente altri strumenti pubblicitari.
            </p>
            <p className="mb-6 leading-relaxed">
              Questi cookie vengono installati solo previo consenso esplicito dell&apos;utente.
            </p>

            <h3 className="text-lg font-semibold text-[#1B2D4F] mb-2">d) Cookie di terze parti</h3>
            <p className="mb-4 leading-relaxed">
              Il sito può includere funzionalità esterne come mappe interattive, video incorporati
              o moduli esterni (es. YouTube, Google Maps, WhatsApp, Calendly), che possono rilasciare
              cookie anche senza il controllo diretto del Titolare.
            </p>
            <p className="mb-8 leading-relaxed">
              L&apos;uso di tali cookie è soggetto alle rispettive informative delle terze parti.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              3. Gestione dei cookie
            </h2>
            <p className="mb-2 leading-relaxed">L&apos;utente può:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Accettare tutti i cookie</li>
              <li>Rifiutare tutti i cookie non essenziali</li>
              <li>Gestire in modo granulare le proprie preferenze tramite il banner iniziale o il link
                &ldquo;Modifica preferenze cookie&rdquo; disponibile in ogni pagina del sito</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              Le preferenze possono essere modificate in qualsiasi momento. In alternativa, è possibile
              intervenire direttamente dalle impostazioni del browser per bloccare o cancellare i cookie
              già salvati:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Chrome</li>
              <li>Firefox</li>
              <li>Safari</li>
              <li>Edge</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              4. Base giuridica del trattamento
            </h2>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>Cookie tecnici</strong> → legittimo interesse del Titolare</li>
              <li><strong>Cookie analitici anonimizzati</strong> → legittimo interesse</li>
              <li><strong>Cookie di profilazione / marketing</strong> → consenso</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              5. Conservazione dei cookie
            </h2>
            <p className="mb-2 leading-relaxed">
              I cookie hanno una durata variabile a seconda della loro tipologia:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cookie di sessione:</strong> si cancellano automaticamente alla chiusura del browser</li>
              <li><strong>Cookie persistenti:</strong> restano memorizzati per un periodo definito (da pochi giorni a 12-24 mesi, a seconda dello strumento)</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              L&apos;elenco completo e aggiornato dei cookie utilizzati dal sito è disponibile nella
              sezione &ldquo;Gestione preferenze cookie&rdquo;.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              6. Diritti dell&apos;utente
            </h2>
            <p className="mb-2 leading-relaxed">L&apos;utente ha il diritto di:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Ottenere informazioni sui trattamenti effettuati tramite i cookie</li>
              <li>Opporsi ai trattamenti basati sul legittimo interesse</li>
              <li>Proporre reclamo all&apos;Autorità Garante</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              Per esercitare tali diritti è possibile scrivere a:{" "}
              <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] underline hover:no-underline">
                agenzia@mishatravel.com
              </a>
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              7. Titolare del trattamento
            </h2>
            <p className="mb-2 leading-relaxed">Crucemundo Italia Misha Travel S.r.l.</p>
            <p className="mb-2 leading-relaxed">Piazza Grimaldi 1-3-5-7 r, 16124 – Genova (GE) – Italia</p>
            <p className="mb-2 leading-relaxed">P.IVA: 02531300990</p>
            <p className="mb-6 leading-relaxed">
              Email:{" "}
              <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] underline hover:no-underline">
                agenzia@mishatravel.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
