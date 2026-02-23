import PageHero from "@/components/layout/PageHero";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        breadcrumbs={[{ label: "Privacy Policy", href: "/privacy-policy" }]}
      />

      <section className="py-12 bg-white">
        <div className="mx-auto px-4 max-w-[1000px]">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-sm text-gray-400 mb-8">Ultimo aggiornamento: 1 giugno 2025</p>

            <p className="mb-8 leading-relaxed">
              Ai sensi dell&apos;art. 13 del Regolamento (UE) 2016/679 (&ldquo;GDPR&rdquo;), la presente informativa
              è resa da Crucemundo Italia Misha Travel S.r.l., in qualità di Titolare del trattamento,
              per informare gli utenti del sito web https://www.mishatravel.com circa le modalità e
              finalità del trattamento dei dati personali raccolti tramite il sito.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              1. Titolare del Trattamento
            </h2>
            <p className="mb-2 leading-relaxed">Crucemundo Italia Misha Travel S.r.l.</p>
            <p className="mb-2 leading-relaxed">Piazza Grimaldi 1-3-5-7 r, 16124 – Genova (GE) – Italia</p>
            <p className="mb-2 leading-relaxed">P.IVA: 02531300990</p>
            <p className="mb-8 leading-relaxed">Email: agenzia@mishatravel.com</p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              2. Tipologie di dati trattati
            </h2>
            <p className="mb-2 leading-relaxed">
              Il sito raccoglie e tratta le seguenti categorie di dati personali:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>Dati anagrafici e identificativi:</strong> nome, cognome</li>
              <li><strong>Dati di contatto:</strong> indirizzo email, numero di telefono</li>
              <li><strong>Dati aziendali:</strong> ragione sociale, sede, P.IVA</li>
              <li><strong>Dati di login:</strong> username, password (criptata)</li>
              <li><strong>Dati di navigazione:</strong> indirizzo IP, orari di accesso, user agent</li>
              <li>Dati acquisiti tramite cookie tecnici, analitici e di profilazione</li>
              <li>Dati relativi al comportamento di navigazione e alle richieste di preventivo</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              3. Modalità di raccolta
            </h2>
            <p className="mb-2 leading-relaxed">
              I dati sono raccolti direttamente dall&apos;interessato attraverso:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Form di contatto</li>
              <li>Moduli di richiesta preventivo</li>
              <li>Modulo di registrazione agenzia</li>
              <li>Accesso all&apos;area riservata/login</li>
              <li>Iscrizione volontaria alla newsletter</li>
              <li>Navigazione del sito (tramite strumenti di tracciamento)</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              4. Finalità del trattamento e base giuridica
            </h2>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-[#1B2D4F]">Finalità</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-[#1B2D4F]">Base Giuridica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Registrazione dell&apos;agenzia partner</td>
                    <td className="border border-gray-200 px-4 py-3">Esecuzione di un contratto o misure precontrattuali</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Gestione dell&apos;area riservata e accesso alla dashboard</td>
                    <td className="border border-gray-200 px-4 py-3">Esecuzione di un contratto</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Invio preventivi e gestione delle richieste</td>
                    <td className="border border-gray-200 px-4 py-3">Esecuzione di un contratto</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Invio comunicazioni di servizio (es. aggiornamenti tour)</td>
                    <td className="border border-gray-200 px-4 py-3">Esecuzione di un contratto</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Adempimento obblighi fiscali, contabili o normativi</td>
                    <td className="border border-gray-200 px-4 py-3">Obbligo legale</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Analisi statistiche aggregate (anonime)</td>
                    <td className="border border-gray-200 px-4 py-3">Legittimo interesse del Titolare</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Attività di marketing diretto e remarketing</td>
                    <td className="border border-gray-200 px-4 py-3">Consenso dell&apos;interessato</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Iscrizione alla newsletter</td>
                    <td className="border border-gray-200 px-4 py-3">Consenso dell&apos;interessato</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Attività di profilazione e segmentazione per proposte mirate</td>
                    <td className="border border-gray-200 px-4 py-3">Consenso dell&apos;interessato</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-8 leading-relaxed">
              Il conferimento dei dati è facoltativo, ma necessario per usufruire dei servizi del sito.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              5. Conservazione dei dati
            </h2>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-[#1B2D4F]">Tipo di dato</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-[#1B2D4F]">Durata conservazione</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Account agenzia registrata</td>
                    <td className="border border-gray-200 px-4 py-3">Fino a cancellazione o inattività &gt;24 mesi</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Dati richieste preventivo</td>
                    <td className="border border-gray-200 px-4 py-3">24 mesi dal ricevimento</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Dati marketing/newsletter</td>
                    <td className="border border-gray-200 px-4 py-3">Fino a revoca del consenso o 24 mesi</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Dati di navigazione</td>
                    <td className="border border-gray-200 px-4 py-3">26 mesi tramite Google Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Backup e log server</td>
                    <td className="border border-gray-200 px-4 py-3">Fino a 12 mesi salvo obblighi legali diversi</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              6. Destinatari dei dati
            </h2>
            <p className="mb-2 leading-relaxed">
              I dati possono essere comunicati ai seguenti soggetti, nella loro qualità di responsabili
              o autonomi titolari del trattamento:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Fornitori di servizi tecnici (hosting, web agency, CRM)</li>
              <li>Consulenti e liberi professionisti (es. commercialista)</li>
              <li>Provider di email marketing o servizi automatizzati</li>
              <li>Autorità pubbliche in adempimento di obblighi legali</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              I dati non saranno diffusi, salvo obblighi di legge.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              7. Trasferimento dei dati fuori dall&apos;UE
            </h2>
            <p className="mb-2 leading-relaxed">
              Alcuni fornitori terzi (es. Google, Meta) possono trasferire dati extra-UE. In tal caso,
              il trattamento avviene nel rispetto del GDPR tramite:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Decisioni di adeguatezza della Commissione Europea</li>
              <li>Clausole contrattuali standard approvate dalla Commissione</li>
              <li>Misure supplementari tecniche e organizzative</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              8. Tracciamenti e strumenti esterni
            </h2>
            <p className="mb-2 leading-relaxed">Il sito utilizza:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Google Analytics</strong> – per analisi statistiche aggregate</li>
              <li><strong>Meta/Facebook Pixel</strong> – per campagne remarketing</li>
              <li><strong>Cookie di funzionalità</strong> – per migliorare l&apos;esperienza utente</li>
              <li><strong>Plugin WordPress di terze parti</strong> – per registrazione, login, form</li>
              <li><strong>Strumenti di email automation</strong> – per invii automatici legati ai preventivi</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              Per maggiori informazioni, si rimanda alla{" "}
              <a href="/cookie-policy" className="text-[#C41E2F] underline hover:no-underline">
                Cookie Policy
              </a>.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              9. Diritti dell&apos;interessato
            </h2>
            <p className="mb-2 leading-relaxed">L&apos;interessato ha diritto di:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Ottenere conferma dell&apos;esistenza dei propri dati</li>
              <li>Accedere, rettificare, cancellare i propri dati</li>
              <li>Limitare od opporsi al trattamento</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Ricevere i propri dati in formato strutturato (portabilità)</li>
              <li>Proporre reclamo all&apos;Autorità Garante per la protezione dei dati personali</li>
            </ul>
            <p className="mb-8 leading-relaxed">
              Le richieste vanno inviate a:{" "}
              <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] underline hover:no-underline">
                agenzia@mishatravel.com
              </a>
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              10. Sicurezza dei dati
            </h2>
            <p className="mb-8 leading-relaxed">
              I dati personali sono trattati con strumenti informatici e telematici nel rispetto di
              misure tecniche e organizzative adeguate a garantire la sicurezza, l&apos;integrità e la
              riservatezza dei dati, in conformità all&apos;art. 32 del GDPR.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              11. Modifiche alla presente informativa
            </h2>
            <p className="mb-6 leading-relaxed">
              La presente informativa può essere soggetta a modifiche. Gli aggiornamenti saranno
              pubblicati su questa pagina con data di revisione.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
