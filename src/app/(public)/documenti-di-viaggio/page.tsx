import PageHero from "@/components/layout/PageHero";
import { FileText, AlertTriangle, Globe, Syringe, Ship, Baby, CheckSquare, ExternalLink } from "lucide-react";

export default function DocumentiDiViaggioPage() {
  return (
    <>
      <PageHero
        title="Documenti di Viaggio"
        subtitle="Guida completa e aggiornata sui documenti necessari per viaggiare con sicurezza"
        breadcrumbs={[{ label: "Documenti di Viaggio", href: "/documenti-di-viaggio" }]}
      />

      {/* Quick Nav */}
      <section className="py-6 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#italiani" className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              Viaggiatori Italiani
            </a>
            <a href="#stranieri" className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              Stranieri Residenti
            </a>
            <a href="#minori" className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              Viaggi con Minori
            </a>
            <a href="#crociere" className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              Crociere
            </a>
            <a href="#tabella-paesi" className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              Requisiti per Paese
            </a>
            <a href="#vaccinazioni" className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#C41E2F] hover:text-[#C41E2F] transition-colors text-sm font-medium text-[#1B2D4F]">
              Vaccinazioni
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Viaggiatori Italiani */}
          <div id="italiani" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Viaggiatori Italiani
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 mb-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4">Destinazioni all&apos;interno dell&apos;Unione Europea</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Carta d&apos;identità valida per l&apos;espatrio (non prorogata con timbro)</li>
                <li>Oppure passaporto in corso di validità</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Attenzione:</strong> Alcune compagnie aeree e di trasporto richiedono comunque il passaporto,
                  anche per destinazioni UE. Verificare sempre con il vettore prima della partenza.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Consiglio:</strong> Per viaggi all&apos;interno dell&apos;UE, il passaporto rimane sempre la scelta
                  più sicura e universalmente accettata.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4">Destinazioni extra-UE</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Passaporto obbligatorio con almeno 6 mesi di validità residua dalla data d&apos;ingresso</li>
                <li>Visto turistico quando richiesto (ottenibile online, all&apos;arrivo o presso consolati)</li>
                <li>Vaccinazioni obbligatorie per alcuni paesi (febbre gialla, epatite, COVID-19)</li>
                <li>Assicurazione viaggio (obbligatoria per alcuni paesi)</li>
              </ul>
              <h4 className="font-semibold text-[#1B2D4F] mb-2 text-sm">Documenti aggiuntivi spesso richiesti:</h4>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 text-sm">
                <li>Biglietto di ritorno o proseguimento del viaggio</li>
                <li>Prova di disponibilità economica (estratto conto, carta di credito)</li>
                <li>Prenotazione alberghiera o lettera di invito</li>
                <li>Certificato di vaccinazione (quando richiesto)</li>
              </ul>
            </div>
          </div>

          {/* Viaggiatori Stranieri */}
          <div id="stranieri" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Viaggiatori Stranieri Residenti in Italia
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4">Documenti Necessari</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Passaporto in corso di validità del paese di origine</li>
                <li>Permesso di soggiorno valido e non scaduto</li>
                <li>Carta di soggiorno UE (se posseduta)</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Importante:</strong> È obbligatorio verificare con l&apos;ambasciata o consolato del paese di
                  destinazione i requisiti specifici per l&apos;ingresso e il rientro in Italia. Alcuni paesi
                  potrebbero richiedere visti aggiuntivi anche per cittadini con permesso di soggiorno italiano.
                </p>
              </div>
              <h4 className="font-semibold text-[#1B2D4F] mb-2 text-sm">Consigli utili:</h4>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 text-sm">
                <li>Portare sempre con sé sia il passaporto che il permesso di soggiorno</li>
                <li>Verificare la validità del permesso di soggiorno prima della partenza</li>
                <li>Consultare il sito dell&apos;ambasciata del paese di destinazione</li>
                <li>In caso di rinnovo del permesso in corso, portare la ricevuta della Questura</li>
              </ul>
            </div>
          </div>

          {/* Minori */}
          <div id="minori" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Baby className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Viaggi con Minori
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4">Documenti Obbligatori</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Documento individuale obbligatorio (carta d&apos;identità o passaporto)</li>
                <li>Per destinazioni extra-UE: passaporto individuale obbligatorio</li>
                <li>Il minore non può più viaggiare sul passaporto dei genitori</li>
              </ul>

              <h4 className="font-semibold text-[#1B2D4F] mb-3">Viaggi con un solo genitore o senza genitori:</h4>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Dichiarazione di accompagnamento da richiedere in Questura</li>
                <li>Documento che attesti il consenso dell&apos;altro genitore</li>
                <li>Copia del documento d&apos;identità del genitore che dà il consenso</li>
                <li>Per viaggi con terze persone: autorizzazione di entrambi i genitori</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Attenzione particolare per:</strong>
                </p>
                <ul className="list-disc pl-5 text-amber-800 text-sm mt-2 space-y-1">
                  <li>Minori con genitori separati o divorziati</li>
                  <li>Viaggi studio o con gruppi organizzati</li>
                  <li>Destinazioni extra-UE (requisiti più rigorosi)</li>
                  <li>Scali in paesi con normative restrittive sui minori</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  Contattare la Questura di competenza almeno 15 giorni prima della partenza per ottenere
                  tutti i documenti necessari.
                </p>
              </div>
            </div>
          </div>

          {/* Crociere */}
          <div id="crociere" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Ship className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Crociere e Viaggi Marittimi
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4">Requisiti Generali</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Passaporto obbligatorio per crociere con scali extra-UE</li>
                <li>Passaporto fortemente consigliato anche per itinerari nel Mediterraneo</li>
                <li>Visti necessari per alcuni scali specifici</li>
              </ul>

              <h4 className="font-semibold text-[#1B2D4F] mb-3">Destinazioni che richiedono particolare attenzione:</h4>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li><strong>Egitto:</strong> Visto obbligatorio (consigliato eVisa online)</li>
                <li><strong>Tunisia:</strong> Passaporto con validità residua di almeno 6 mesi</li>
                <li><strong>Israele:</strong> Passaporto obbligatorio, possibili controlli aggiuntivi</li>
                <li><strong>Turchia:</strong> Passaporto obbligatorio</li>
                <li><strong>Marocco:</strong> Passaporto con validità residua di almeno 6 mesi</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Importante:</strong> Anche se alcuni porti potrebbero teoricamente accettare la carta
                  d&apos;identità, molte compagnie di crociera richiedono il passaporto per tutti i passeggeri
                  per evitare complicazioni durante gli scali.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Consiglio:</strong> Contattare sempre la compagnia di crociera e l&apos;agenzia di viaggio
                  con largo anticipo per verificare tutti i requisiti specifici dell&apos;itinerario scelto.
                </p>
              </div>
            </div>
          </div>

          {/* Tabella Paesi */}
          <div id="tabella-paesi" className="mb-16">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              Tabella Paesi – Requisiti Principali
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#1B2D4F] text-white">
                    <th className="px-3 py-3 text-left font-semibold">Destinazione</th>
                    <th className="px-3 py-3 text-left font-semibold">Passaporto</th>
                    <th className="px-3 py-3 text-left font-semibold">Visto</th>
                    <th className="px-3 py-3 text-left font-semibold">Validità Min.</th>
                    <th className="px-3 py-3 text-left font-semibold">Note Speciali</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Egitto</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">eVisa Online</td>
                    <td className="px-3 py-3">6 mesi</td>
                    <td className="px-3 py-3">Consigliato richiedere eVisa prima della partenza</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">USA</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">ESTA</td>
                    <td className="px-3 py-3">Fine soggiorno</td>
                    <td className="px-3 py-3">Solo turismo/business &lt; 90 giorni</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Cuba</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">Tarjeta Turistica</td>
                    <td className="px-3 py-3">6 mesi</td>
                    <td className="px-3 py-3">Assicurazione medica obbligatoria</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Thailandia</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">No &lt; 30gg</td>
                    <td className="px-3 py-3">6 mesi</td>
                    <td className="px-3 py-3">Biglietto di ritorno richiesto</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Regno Unito</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">No</td>
                    <td className="px-3 py-3">Fine soggiorno</td>
                    <td className="px-3 py-3">Solo passaporto (no carta d&apos;identità)</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Giappone</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">No &lt; 90gg</td>
                    <td className="px-3 py-3">Fine soggiorno</td>
                    <td className="px-3 py-3">Solo turismo, controlli rigorosi</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Australia</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">eVisitor</td>
                    <td className="px-3 py-3">6 mesi</td>
                    <td className="px-3 py-3">Visto elettronico gratuito online</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Cina</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">Sì</td>
                    <td className="px-3 py-3">6 mesi</td>
                    <td className="px-3 py-3">Visto da richiedere al consolato</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">India</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">e-Visa</td>
                    <td className="px-3 py-3">6 mesi</td>
                    <td className="px-3 py-3">Visto elettronico disponibile</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 font-medium text-[#1B2D4F]">Russia</td>
                    <td className="px-3 py-3">Obbligatorio</td>
                    <td className="px-3 py-3">Sì</td>
                    <td className="px-3 py-3">6 mesi</td>
                    <td className="px-3 py-3">Visto da richiedere al consolato + invito</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800 text-sm">
                <strong>Nota importante:</strong> Questa tabella fornisce informazioni generali. I requisiti possono
                cambiare rapidamente. Verificare sempre le informazioni aggiornate sul sito{" "}
                <a href="https://www.viaggiaresicuri.it" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  www.viaggiaresicuri.it
                </a>{" "}
                prima della partenza.
              </p>
            </div>
          </div>

          {/* Vaccinazioni */}
          <div id="vaccinazioni" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Syringe className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Vaccinazioni e Profilassi Sanitaria
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4">Febbre Gialla (Obbligatoria)</h3>

              <h4 className="font-semibold text-[#1B2D4F] mb-2 text-sm">Africa:</h4>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Angola, Benin, Burkina Faso, Camerun, Repubblica Centrafricana, Ciad, Congo, Costa d&apos;Avorio,
                Guinea Equatoriale, Gabon, Ghana, Guinea, Liberia, Mali, Niger, Nigeria, Sierra Leone,
                Sudan del Sud, Togo
              </p>

              <h4 className="font-semibold text-[#1B2D4F] mb-2 text-sm">Sud America:</h4>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Argentina (solo alcune zone), Bolivia, Brasile, Colombia, Ecuador, Guyana Francese, Guyana,
                Paraguay, Perù, Suriname, Trinidad e Tobago, Venezuela
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <CheckSquare className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Checklist Documenti di Viaggio
              </h2>
            </div>

            <div className="bg-[#1B2D4F]/5 rounded-xl p-8 border border-[#1B2D4F]/10">
              <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4">Prima della Partenza</h3>
              <ul className="space-y-3">
                {[
                  "Verificare validità passaporto (almeno 6 mesi per destinazioni extra-UE)",
                  "Controllare necessità di visto per la destinazione",
                  "Verificare vaccinazioni obbligatorie",
                  "Stipulare assicurazione viaggio (se richiesta)",
                  "Prenotare biglietti di andata e ritorno",
                  "Confermare prenotazione alberghiera",
                  "Preparare prova di disponibilità economica",
                  "Per minori: preparare dichiarazione di accompagnamento (se necessaria)",
                  "Fare copie di tutti i documenti importanti",
                  "Verificare con la compagnia aerea i documenti accettati",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <div className="w-5 h-5 rounded border-2 border-[#C41E2F]/40 shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Suggerimento:</strong> Completare questa checklist almeno 30 giorni prima della partenza
                  per avere tempo sufficiente per ottenere eventuali documenti mancanti.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mb-16">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="size-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Responsabilità e Disclaimer</h3>
                  <p className="text-amber-800 text-sm mb-3 leading-relaxed">
                    Le informazioni contenute in questa guida sono fornite a scopo informativo generale e si basano
                    sulle normative vigenti al momento della pubblicazione. I requisiti di viaggio possono cambiare
                    rapidamente e senza preavviso.
                  </p>
                  <p className="text-amber-800 text-sm font-medium mb-2">Responsabilità del Viaggiatore:</p>
                  <ul className="list-disc pl-5 text-amber-800 text-sm space-y-1">
                    <li>È responsabilità esclusiva del viaggiatore verificare i requisiti aggiornati</li>
                    <li>Consultare sempre fonti ufficiali prima della partenza</li>
                    <li>Verificare con ambasciate, consolati e compagnie di trasporto</li>
                    <li>Controllare il sito www.viaggiaresicuri.it per aggiornamenti</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fonti e Contatti */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ExternalLink className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Fonti Ufficiali e Contatti
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <a href="https://www.viaggiaresicuri.it" target="_blank" rel="noopener noreferrer"
                className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:border-[#C41E2F] transition-colors text-center">
                <p className="font-semibold text-[#1B2D4F] mb-1">Viaggiare Sicuri</p>
                <p className="text-[#C41E2F] text-sm">www.viaggiaresicuri.it</p>
              </a>
              <a href="https://www.esteri.it" target="_blank" rel="noopener noreferrer"
                className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:border-[#C41E2F] transition-colors text-center">
                <p className="font-semibold text-[#1B2D4F] mb-1">Ministero Affari Esteri</p>
                <p className="text-[#C41E2F] text-sm">www.esteri.it</p>
              </a>
              <a href="https://www.poliziadistato.it" target="_blank" rel="noopener noreferrer"
                className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:border-[#C41E2F] transition-colors text-center">
                <p className="font-semibold text-[#1B2D4F] mb-1">Polizia di Stato</p>
                <p className="text-[#C41E2F] text-sm">www.poliziadistato.it</p>
              </a>
            </div>
            <p className="text-gray-400 text-sm text-center">
              Le informazioni in questa guida sono aggiornate al 1 giugno 2025. Per informazioni più recenti,
              consultare sempre le fonti ufficiali.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
