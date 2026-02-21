import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, User, HelpCircle, ClipboardList, Mail, MapPin, Phone } from "lucide-react";

export default function ComePrenotarePage() {
  return (
    <>
      <PageHero
        title="Come Prenotare"
        subtitle="Guida completa per navigare su mishatravel.com – tutto quello che devi sapere per richiedere preventivi e prenotare i nostri servizi."
        backgroundImage="https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Come Prenotare", href: "/come-prenotare-guida-completa" }]}
      />

      {/* Quick Nav */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#agenzie" className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              <Building2 className="size-4" />
              Sono un&apos;Agenzia
            </a>
            <a href="#privato" className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              <User className="size-4" />
              Sono un Privato
            </a>
            <a href="#faq" className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              <HelpCircle className="size-4" />
              Domande Frequenti
            </a>
          </div>
        </div>
      </section>

      {/* Section: Agenzie */}
      <section id="agenzie" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="size-8 text-[#C41E2F]" />
            <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              Sei un&apos;Agenzia di Viaggio?
            </h2>
          </div>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Perfetto! Questo sito è pensato proprio per te. mishatravel.com è dedicato principalmente
            alle agenzie di viaggio e offre prezzi riservati, preventivi personalizzati e un&apos;area
            riservata per gestire tutte le tue richieste.
          </p>

          {/* Non registrato */}
          <div className="bg-gray-50 rounded-xl p-8 mb-10 border border-gray-100">
            <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              1. Non sei ancora registrato?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Per inviare richieste di preventivo o accedere ai prezzi riservati, è necessario registrarsi
              come agenzia. Ecco come funziona la registrazione:
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#C41E2F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Vai alla pagina &ldquo;Registrati come agenzia&rdquo;</p>
                  <p className="text-gray-600 text-sm">Troverai il link nel menu principale del sito</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#C41E2F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F] mb-2">Compila il modulo con i seguenti dati:</p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Nome e Cognome del referente</li>
                    <li>Nome dell&apos;agenzia</li>
                    <li>Partita IVA</li>
                    <li>Codice fiscale (se richiesto)</li>
                    <li>Indirizzo completo</li>
                    <li>Numero di telefono</li>
                    <li>Email aziendale</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#C41E2F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Dopo l&apos;invio del modulo riceverai:</p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mt-1">
                    <li>Una mail automatica di conferma ricezione</li>
                    <li>Entro 24h lavorative (salvo festivi), il nostro team verificherà i dati inseriti</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#C41E2F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">4</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Attivazione dell&apos;account</p>
                  <p className="text-gray-600 text-sm">
                    Se la tua agenzia è idonea, riceverai un&apos;email con conferma di attivazione
                    dell&apos;account e potrai accedere all&apos;area riservata.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium">
                Importante: Non è possibile inviare richieste di preventivo se non sei registrato e approvato.
              </p>
            </div>
          </div>

          {/* Già registrato */}
          <div className="bg-gray-50 rounded-xl p-8 mb-10 border border-gray-100">
            <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              2. Sei già registrato?
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Una volta effettuato il login, accedi alla tua dashboard personale, da cui puoi:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Visualizzare tutti i tour e le crociere disponibili</li>
              <li>Vedere i prezzi riservati, visibili solo agli utenti registrati</li>
              <li>Inviare richieste di preventivo personalizzate per ogni prodotto</li>
              <li>Scrivere eventuali note o richieste aggiuntive per ogni preventivo</li>
              <li>Ricevere conferme via email dell&apos;avvenuta richiesta</li>
              <li>Monitorare lo stato di avanzamento (es: &ldquo;ricevuto&rdquo;, &ldquo;in valutazione&rdquo;, &ldquo;approvato&rdquo;, &ldquo;in attesa cliente&rdquo;)</li>
              <li>Consultare e scaricare in PDF: estratti conto, preventivi già inviati, cronologia delle richieste</li>
            </ul>
          </div>

          {/* Come inviare preventivo */}
          <div className="bg-white rounded-xl p-8 border-2 border-[#C41E2F]/20">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="size-7 text-[#C41E2F]" />
              <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Come Inviare una Richiesta di Preventivo
              </h3>
            </div>
            <h4 className="font-semibold text-[#1B2D4F] mb-4">Procedura Step-by-Step</h4>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1B2D4F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Naviga tra le categorie del sito</p>
                  <p className="text-gray-600 text-sm">Tour, Crociere, Pacchetti, ecc.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1B2D4F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Clicca sul tour o crociera che ti interessa</p>
                  <p className="text-gray-600 text-sm">Potrai esplorare tutti i dettagli del pacchetto</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1B2D4F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F] mb-1">Visualizzerai la scheda dettagliata del pacchetto:</p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Descrizione completa</li>
                    <li>Galleria immagini</li>
                    <li>Itinerario dettagliato</li>
                    <li>Prezzo (se disponibile)</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1B2D4F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">4</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Clicca su &ldquo;Richiedi Preventivo&rdquo;</p>
                  <p className="text-gray-600 text-sm">Il pulsante è ben visibile nella scheda del prodotto</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1B2D4F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">5</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Controllo accesso</p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mt-1">
                    <li>Se sei loggato: accederai direttamente alla pagina di riepilogo</li>
                    <li>Se NON sei loggato: ti verrà richiesto di accedere o registrarti</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1B2D4F] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">6</div>
                <div>
                  <p className="font-semibold text-[#1B2D4F]">Conferma e monitoraggio</p>
                  <p className="text-gray-600 text-sm">
                    Dopo l&apos;invio, riceverai una conferma via email e l&apos;operazione sarà visibile nella
                    tua dashboard per il monitoraggio.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Nota sui prezzi:</strong> Alcuni pacchetti mostrano la dicitura &ldquo;Prezzo su richiesta&rdquo; –
                in questi casi l&apos;importo viene calcolato su misura e ti invieremo un preventivo personalizzato
                dopo la valutazione. Il prezzo sarà visibile solo nella tua area riservata.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Privato */}
      <section id="privato" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <User className="size-8 text-[#C41E2F]" />
            <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              Sei un Utente Privato?
            </h2>
          </div>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Anche tu sei il benvenuto! Questo sito è progettato per i professionisti del turismo
            (agenzie), ma se stai esplorando i nostri tour come viaggiatore privato, abbiamo delle
            soluzioni per te.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-amber-800 text-sm font-medium">
              Attenzione: Non puoi inviare direttamente una richiesta di preventivo dal sito. Tuttavia hai due opzioni:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <Mail className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="font-bold text-lg text-[#1B2D4F] mb-3">Opzione A – Contattaci direttamente</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Scrivi a:{" "}
                <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] font-medium">
                  agenzia@mishatravel.com
                </a>
              </p>
              <p className="text-gray-600 text-sm mb-2">Indicaci:</p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mb-4">
                <li>Il tour o la crociera che ti interessa</li>
                <li>Il tuo nome e cognome</li>
                <li>Il comune o la zona in cui vivi</li>
              </ul>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ti metteremo in contatto con l&apos;agenzia partner più vicina a te, tra quelle iscritte
                alla nostra rete, che potrà seguirti nella prenotazione.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <MapPin className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="font-bold text-lg text-[#1B2D4F] mb-3">Opzione B – Trova un&apos;agenzia partner da solo</h3>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
                <li>Visita la pagina &ldquo;Mappa Agenzie Partner&rdquo;</li>
                <li>Inserisci la tua posizione o CAP</li>
                <li>Troverai le agenzie di viaggio più vicine a te</li>
                <li>Puoi contattarle direttamente e indicare il nome del tour che hai visto su mishatravel.com</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-4">
            <HelpCircle className="size-8 inline-block mr-2 text-[#C41E2F]" />
            Domande Frequenti
          </h2>
          <p className="text-gray-600 text-center mb-10">Le Tue Domande, Le Nostre Risposte</p>
          <div className="space-y-6">
            {[
              {
                q: "Devo aspettare l'approvazione per registrarmi come agenzia?",
                a: "Sì. La registrazione non è automatica. Ogni profilo viene verificato manualmente per garantire la qualità del servizio.",
              },
              {
                q: "Posso fare più richieste contemporaneamente?",
                a: "Certo. Puoi inviare più richieste di preventivo su pacchetti diversi. Troverai tutto organizzato nella tua dashboard.",
              },
              {
                q: "Posso modificare una richiesta già inviata?",
                a: "No. Ma puoi inviarne una nuova e indicare nelle note che si tratta di una modifica della precedente.",
              },
              {
                q: "Cosa succede dopo che ho inviato una richiesta?",
                a: "Ricevi: una mail di conferma immediata, una seconda mail quando il nostro team prende in carico o risponde al preventivo, e un aggiornamento dello stato nella tua area riservata.",
              },
              {
                q: "E se non ricevo risposta?",
                a: "Di solito rispondiamo entro 1 giorno lavorativo. Se non ricevi nulla, scrivici a agenzia@mishatravel.com",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Riepilogo Rapido */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-8">
            Riepilogo Rapido
          </h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#1B2D4F] text-white">
                  <th className="px-4 py-3 text-left font-semibold">Tipo di Utente</th>
                  <th className="px-4 py-3 text-left font-semibold">Cosa può fare</th>
                  <th className="px-4 py-3 text-left font-semibold">Dove farlo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-[#1B2D4F]">Agenzia non registrata</td>
                  <td className="px-4 py-3 text-gray-600">Registrarsi con dati aziendali</td>
                  <td className="px-4 py-3 text-gray-600">Modulo registrazione</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#1B2D4F]">Agenzia registrata</td>
                  <td className="px-4 py-3 text-gray-600">Accedere alla dashboard, richiedere preventivi, gestire account</td>
                  <td className="px-4 py-3 text-gray-600">Login e area riservata</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#1B2D4F]">Privato</td>
                  <td className="px-4 py-3 text-gray-600">Contattare via email o tramite agenzia partner</td>
                  <td className="px-4 py-3 text-gray-600">Email o Mappa agenzie</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-100 text-sm text-gray-600 space-y-2">
            <p><strong className="text-[#1B2D4F]">Agenzie:</strong> Registrazione → Login → Richiesta Preventivo → Monitoraggio</p>
            <p><strong className="text-[#1B2D4F]">Privati:</strong> Email diretta o ricerca agenzia partner</p>
            <p><strong className="text-[#1B2D4F]">Tutti:</strong> Per dubbi contattare{" "}
              <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F]">agenzia@mishatravel.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#1B2D4F]">
        <div className="container mx-auto px-4 text-center">
          <Phone className="size-8 text-[#C41E2F] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)] mb-4">
            Contatti e Supporto
          </h2>
          <p className="text-white/70 mb-2 max-w-xl mx-auto">
            Per qualsiasi dubbio o richiesta di assistenza
          </p>
          <p className="text-white font-medium mb-6">
            <a href="mailto:agenzia@mishatravel.com" className="hover:text-[#C41E2F] transition-colors">
              agenzia@mishatravel.com
            </a>
          </p>
          <p className="text-white/60 text-sm max-w-xl mx-auto mb-8">
            Siamo qui per rendere la tua esperienza di prenotazione semplice e sicura. Il nostro team
            di supporto è sempre pronto ad aiutarti in ogni fase del processo.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-[#C41E2F] hover:bg-[#A31825] text-white">
              <Link href="/tours">Scopri i Tour</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1B2D4F]">
              <Link href="/crociere">Scopri le Crociere</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
