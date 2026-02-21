import PageHero from "@/components/layout/PageHero";

export const metadata = {
  title: "FAQ - Domande Frequenti | Misha Travel",
  description: "Risposte alle domande più frequenti su prenotazioni, preventivi, pagamenti e viaggi con Misha Travel.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        title="Domande Frequenti"
        subtitle="Risposte alle domande più comuni"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Banner revisione */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10">
            <p className="text-amber-800 text-sm font-medium">
              Contenuti da revisionare &mdash; Questa pagina contiene testi provvisori da verificare e aggiornare.
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const faqItems = [
  {
    question: "Misha Travel vende direttamente ai privati?",
    answer:
      "No, Misha Travel è un tour operator B2B. Lavoriamo esclusivamente con agenzie di viaggio. Se sei un privato, puoi contattarci per trovare l'agenzia partner più vicina a te, oppure visitare la sezione \"Trova Agenzia\" del nostro sito.",
  },
  {
    question: "Come posso registrare la mia agenzia?",
    answer:
      "Puoi registrarti dalla pagina \"Registrati\" del nostro sito, compilando il modulo con i dati della tua agenzia (ragione sociale, P.IVA, indirizzo, contatti). Il nostro team verificherà i dati entro 24 ore lavorative e ti invierà una conferma di attivazione.",
  },
  {
    question: "Come funziona la richiesta di preventivo?",
    answer:
      "Una volta registrato e approvato, accedi all'area riservata. Da lì puoi navigare tra tour e crociere, selezionare il prodotto che ti interessa e compilare il modulo di richiesta preventivo specificando date, numero di passeggeri e eventuali richieste speciali. Riceverai il preventivo via email.",
  },
  {
    question: "Quali sono i tempi di risposta per un preventivo?",
    answer:
      "Il nostro team si impegna a rispondere alle richieste di preventivo entro 24-48 ore lavorative, salvo periodi di alta stagione in cui i tempi potrebbero essere leggermente più lunghi.",
  },
  {
    question: "Quali metodi di pagamento accettate?",
    answer:
      "Accettiamo bonifico bancario. Le coordinate bancarie vengono fornite insieme alla conferma di prenotazione. Per i dettagli sulle tempistiche di pagamento (acconto e saldo), consulta la sezione \"Come Prenotare\".",
  },
  {
    question: "Cosa include il prezzo del pacchetto?",
    answer:
      "Ogni scheda tour/crociera specifica nel dettaglio cosa è incluso e cosa non è incluso nel prezzo. In generale i pacchetti includono: trasferimenti, sistemazione in hotel/nave, pasti come da programma, visite ed escursioni con guida. Non sono generalmente inclusi: voli internazionali (salvo dove specificato), assicurazioni, mance, extra personali.",
  },
  {
    question: "È possibile personalizzare un tour?",
    answer:
      "Sì, molti dei nostri tour possono essere personalizzati su richiesta. Contatta il nostro team specificando le tue esigenze (estensioni, upgrade hotel, servizi aggiuntivi) e ti proporremo una soluzione su misura.",
  },
  {
    question: "Quali assicurazioni viaggio offrite?",
    answer:
      "Offriamo diverse coperture assicurative per i viaggiatori, tra cui annullamento viaggio, assistenza sanitaria, bagaglio e responsabilità civile. Per i dettagli consulta la pagina \"Coperture Assicurative\".",
  },
  {
    question: "Come funziona la cancellazione di un viaggio?",
    answer:
      "Le penali di cancellazione variano in base al tour e alla tempistica. Per le condizioni dettagliate, consulta la pagina \"Cancellazioni e Penali\" del nostro sito. In caso di circostanze eccezionali, ti invitiamo a contattarci direttamente.",
  },
  {
    question: "Come posso contattarvi?",
    answer:
      "Puoi contattarci telefonicamente al +39 010 246 1630, via email a info@mishatravel.com, oppure visitandoci presso la nostra sede di Piazza Grimaldi, Genova. Siamo disponibili dal lunedì al venerdì, dalle 9:00 alle 18:00.",
  },
];
