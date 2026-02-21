import PageHero from "@/components/layout/PageHero";
import { FileText, AlertTriangle, Globe, Syringe } from "lucide-react";

export default function DocumentiDiViaggioPage() {
  return (
    <>
      <PageHero
        title="Documenti di Viaggio"
        breadcrumbs={[{ label: "Documenti di Viaggio", href: "/documenti-di-viaggio" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 flex items-start gap-4">
            <AlertTriangle className="size-6 text-amber-600 shrink-0" />
            <p className="text-amber-800 text-sm leading-relaxed">
              Le informazioni riportate di seguito hanno carattere orientativo. E responsabilita
              del viaggiatore verificare i requisiti specifici per la propria destinazione
              presso le autorita competenti (Consolati, Ambasciate, Ministero degli Esteri).
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Passaporto
              </h2>
            </div>
            <p className="mb-4 leading-relaxed">
              Per i viaggi al di fuori dell&apos;Unione Europea e necessario un passaporto valido.
              La maggior parte dei paesi richiede che il passaporto abbia una validita
              residua di almeno 6 mesi dalla data di ingresso nel paese.
            </p>
            <p className="mb-8 leading-relaxed">
              Si consiglia di richiedere o rinnovare il passaporto con largo anticipo
              rispetto alla data di partenza, poiche i tempi di rilascio possono variare.
              E opportuno conservare una fotocopia del passaporto separata dall&apos;originale.
            </p>

            <div className="flex items-center gap-3 mb-4">
              <Globe className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Visti di Ingresso
              </h2>
            </div>
            <p className="mb-4 leading-relaxed">
              Alcune destinazioni richiedono un visto di ingresso che deve essere ottenuto
              prima della partenza. Le procedure e i tempi di rilascio variano da paese a
              paese. Ecco alcune indicazioni generali per le nostre principali destinazioni:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>India:</strong> E-Visa ottenibile online, da richiedere almeno 4 giorni prima della partenza</li>
              <li><strong>Russia:</strong> Visto obbligatorio, da richiedere presso il Consolato con almeno 20 giorni di anticipo</li>
              <li><strong>Turchia:</strong> E-Visa ottenibile online</li>
              <li><strong>Giordania:</strong> Visto all&apos;arrivo o incluso nel Jordan Pass</li>
              <li><strong>Nepal:</strong> Visto all&apos;arrivo in aeroporto</li>
              <li><strong>Egitto:</strong> Visto all&apos;arrivo in aeroporto</li>
              <li><strong>USA (New York):</strong> ESTA da richiedere online almeno 72 ore prima della partenza</li>
              <li><strong>Mongolia:</strong> Visto da richiedere presso l&apos;Ambasciata</li>
              <li><strong>Cina:</strong> Visto obbligatorio, da richiedere presso il Centro Visti con almeno 15 giorni di anticipo</li>
            </ul>

            <div className="flex items-center gap-3 mb-4">
              <Syringe className="size-7 text-[#C41E2F]" />
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Vaccinazioni e Profilassi
              </h2>
            </div>
            <p className="mb-4 leading-relaxed">
              Per alcune destinazioni sono consigliate o obbligatorie specifiche vaccinazioni.
              Si raccomanda di consultare il proprio medico o l&apos;ASL competente per la
              medicina dei viaggi con almeno 6 settimane di anticipo rispetto alla partenza.
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>India / Nepal:</strong> Consigliate epatite A e B, tifo, antitetanica. Profilassi antimalarica in alcune zone</li>
              <li><strong>Africa (Egitto, Marocco, Tunisia):</strong> Consigliate epatite A e B</li>
              <li><strong>America Latina:</strong> Febbre gialla obbligatoria per alcune zone (Amazzonia, Bolivia). Consigliate epatite A e B</li>
              <li><strong>Europa / Turchia:</strong> Nessuna vaccinazione obbligatoria</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Tessera Sanitaria Europea
            </h2>
            <p className="mb-6 leading-relaxed">
              Per i viaggi all&apos;interno dell&apos;Unione Europea, si consiglia di portare con se
              la Tessera Europea di Assicurazione Malattia (TEAM) che consente di usufruire
              delle cure mediche alle stesse condizioni degli assistiti del paese ospitante.
            </p>

            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Link Utili
            </h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Ministero degli Affari Esteri - Viaggiare Sicuri: <span className="text-[#C41E2F]">www.viaggiaresicuri.it</span></li>
              <li>Polizia di Stato - Passaporto: <span className="text-[#C41E2F]">www.poliziadistato.it/articolo/passaporto</span></li>
              <li>Ministero della Salute - Vaccinazioni: <span className="text-[#C41E2F]">www.salute.gov.it</span></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
