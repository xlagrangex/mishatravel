import PageHero from "@/components/layout/PageHero";

export const metadata = {
  title: "Informativa GDPR | Misha Travel",
  description: "Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR) - Misha Travel.",
};

export default function GdprPage() {
  return (
    <>
      <PageHero
        title="Informativa GDPR"
        subtitle="Regolamento UE 2016/679 sulla protezione dei dati personali"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-[1000px]">
          {/* Banner revisione */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10">
            <p className="text-amber-800 text-sm font-medium">
              Contenuti da revisionare &mdash; Questa pagina contiene testi provvisori da verificare e aggiornare con l&apos;informativa GDPR ufficiale.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
            <p className="text-sm text-gray-500">Ultimo aggiornamento: da definire</p>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                1. Titolare del trattamento
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Crucemundo Italia Misha Travel S.r.l.</strong></p>
                <p>Piazza Grimaldi 1-3-5-7 r, 16124 Genova (GE) &ndash; Italia</p>
                <p>P.IVA: 02531300990</p>
                <p>Email: <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] hover:underline">agenzia@mishatravel.com</a></p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                2. Base giuridica e finalit&agrave; del trattamento
              </h2>
              <p className="leading-relaxed">
                Il trattamento dei dati personali &egrave; effettuato ai sensi dell&apos;art. 6 del Regolamento (UE) 2016/679
                per le seguenti finalit&agrave;:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Esecuzione contrattuale:</strong> gestione della registrazione dell&apos;agenzia partner, elaborazione
                  di preventivi, gestione delle prenotazioni e dell&apos;area riservata.</li>
                <li><strong>Obbligo legale:</strong> adempimento di obblighi fiscali, contabili e normativi.</li>
                <li><strong>Legittimo interesse:</strong> analisi statistiche aggregate e anonime per il miglioramento del servizio.</li>
                <li><strong>Consenso:</strong> invio di comunicazioni commerciali, newsletter e attivit&agrave; di marketing diretto.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                3. Categorie di dati trattati
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dati anagrafici e identificativi (nome, cognome)</li>
                <li>Dati di contatto (email, telefono)</li>
                <li>Dati aziendali (ragione sociale, P.IVA, sede)</li>
                <li>Dati di accesso (username, password criptata)</li>
                <li>Dati di navigazione (IP, user agent, orari di accesso)</li>
                <li>Dati acquisiti tramite cookie e strumenti di tracciamento</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                4. Diritti dell&apos;interessato
              </h2>
              <p className="leading-relaxed">
                Ai sensi degli artt. 15-22 del GDPR, l&apos;interessato ha diritto di:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Accesso:</strong> ottenere conferma dell&apos;esistenza di dati personali che lo riguardano e riceverne copia.</li>
                <li><strong>Rettifica:</strong> ottenere la correzione di dati inesatti o l&apos;integrazione di dati incompleti.</li>
                <li><strong>Cancellazione:</strong> ottenere la cancellazione dei propri dati (&quot;diritto all&apos;oblio&quot;) nei casi previsti dalla legge.</li>
                <li><strong>Limitazione:</strong> ottenere la limitazione del trattamento nei casi previsti.</li>
                <li><strong>Portabilit&agrave;:</strong> ricevere i propri dati in formato strutturato e trasferirli ad altro titolare.</li>
                <li><strong>Opposizione:</strong> opporsi al trattamento per motivi legittimi, incluso il marketing diretto.</li>
                <li><strong>Revoca del consenso:</strong> revocare il consenso prestato in qualsiasi momento, senza pregiudicare la liceit&agrave; del trattamento basato sul consenso prestato prima della revoca.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                5. Periodo di conservazione
              </h2>
              <p className="leading-relaxed">
                I dati personali saranno conservati per il tempo strettamente necessario al conseguimento
                delle finalit&agrave; per cui sono stati raccolti e comunque non oltre i termini previsti dalla
                normativa vigente. In particolare:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Dati contrattuali: 10 anni dalla cessazione del rapporto (obblighi fiscali)</li>
                <li>Dati di navigazione: 24 mesi</li>
                <li>Dati per marketing: fino alla revoca del consenso</li>
                <li>Dati di account: fino alla cancellazione dell&apos;account o 24 mesi dall&apos;ultimo accesso</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                6. Destinatari dei dati
              </h2>
              <p className="leading-relaxed">
                I dati personali potranno essere comunicati a:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Fornitori di servizi tecnologici (hosting, email, analytics)</li>
                <li>Fornitori di servizi turistici (hotel, compagnie di trasporto, guide)</li>
                <li>Consulenti e professionisti (commercialisti, avvocati)</li>
                <li>Autorit&agrave; competenti, ove richiesto per legge</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                7. Trasferimento dati extra-UE
              </h2>
              <p className="leading-relaxed">
                Alcuni dei servizi utilizzati (es. Google Analytics, Meta/Facebook) potrebbero comportare
                il trasferimento di dati verso paesi terzi. In tali casi, il trattamento avviene nel rispetto
                delle garanzie previste dal GDPR (decisioni di adeguatezza, clausole contrattuali standard
                approvate dalla Commissione Europea).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                8. Reclami
              </h2>
              <p className="leading-relaxed">
                L&apos;interessato che ritenga che il trattamento dei propri dati personali sia effettuato in violazione
                del GDPR ha il diritto di proporre reclamo al Garante per la protezione dei dati personali
                (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-[#C41E2F] hover:underline">www.garanteprivacy.it</a>).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                9. Contatti per esercitare i diritti
              </h2>
              <p className="leading-relaxed">
                Per esercitare i diritti sopra indicati, &egrave; possibile inviare una richiesta a:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p>Email: <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] hover:underline">agenzia@mishatravel.com</a></p>
                <p>PEC: (da definire)</p>
                <p>Indirizzo: Piazza Grimaldi 1-3-5-7 r, 16124 Genova (GE)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
