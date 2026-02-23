import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Reclami | Misha Travel",
  description: "Modulo reclami Misha Travel. Invia la tua segnalazione e riceverai riscontro entro i termini previsti dalla normativa.",
};

export default function ReclamiPage() {
  return (
    <>
      <PageHero
        title="Reclami"
        subtitle="Gestione dei reclami e delle segnalazioni"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Banner revisione */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10">
            <p className="text-amber-800 text-sm font-medium">
              Contenuti da revisionare &mdash; Questa pagina contiene testi provvisori da verificare e aggiornare.
            </p>
          </div>

          {/* Intro */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Come presentare un reclamo
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Misha Travel si impegna a garantire la massima qualit&agrave; dei servizi offerti. Qualora
              il viaggiatore riscontri difformit&agrave; rispetto a quanto previsto dal contratto di viaggio,
              ha il diritto di presentare un reclamo secondo le modalit&agrave; di seguito indicate.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Il reclamo pu&ograve; essere presentato dall&apos;agenzia di viaggio per conto del proprio cliente
              o direttamente dal viaggiatore.
            </p>
          </div>

          {/* Normativa */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Riferimenti normativi
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              La gestione dei reclami &egrave; disciplinata dal D.Lgs. 62/2018 (Codice del Turismo) e dalla
              Direttiva UE 2015/2302 relativa ai pacchetti turistici e ai servizi turistici collegati.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-[#1B2D4F]">Tempistiche</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 text-sm">
                <li>Il reclamo deve essere inviato <strong>entro 10 giorni lavorativi</strong> dalla data di rientro dal viaggio.</li>
                <li>Il reclamo pu&ograve; essere inviato anche <strong>durante il viaggio</strong> per contestazioni in corso.</li>
                <li>L&apos;organizzatore risponder&agrave; <strong>entro 30 giorni</strong> dal ricevimento del reclamo.</li>
              </ul>
            </div>
          </div>

          {/* Modalità */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Modalit&agrave; di invio
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Il reclamo pu&ograve; essere inviato con una delle seguenti modalit&agrave;:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-5 text-center">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">Email</h3>
                <a href="mailto:reclami@mishatravel.com" className="text-[#C41E2F] hover:underline text-sm">
                  reclami@mishatravel.com
                </a>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 text-center">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">Raccomandata A/R</h3>
                <p className="text-gray-600 text-sm">
                  Piazza Grimaldi 1-3-5-7 r<br />
                  16124 Genova (GE)
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 text-center">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">Modulo online</h3>
                <p className="text-gray-600 text-sm">
                  Compila il modulo sottostante
                </p>
              </div>
            </div>
          </div>

          {/* Cosa indicare */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Informazioni da includere nel reclamo
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Nome e cognome del viaggiatore</li>
              <li>Numero di pratica / prenotazione</li>
              <li>Date del viaggio</li>
              <li>Destinazione</li>
              <li>Descrizione dettagliata del disservizio riscontrato</li>
              <li>Eventuale documentazione a supporto (foto, ricevute, corrispondenza)</li>
              <li>Richiesta specifica (rimborso, risarcimento, altra soluzione)</li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6 text-center">
              Modulo Reclami Online
            </h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nome e Cognome *</label>
                  <Input placeholder="Nome e Cognome del viaggiatore" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                  <Input type="email" placeholder="email@esempio.com" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Telefono</label>
                  <Input type="tel" placeholder="+39 ..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">N. Pratica / Prenotazione *</label>
                  <Input placeholder="Es. MT-2025-001234" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Destinazione *</label>
                  <Input placeholder="Es. Giordania" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Date del viaggio *</label>
                  <Input placeholder="Es. 10/03/2025 - 17/03/2025" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Agenzia di viaggio (se applicabile)</label>
                <Input placeholder="Nome dell'agenzia" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Descrizione del reclamo *</label>
                <Textarea
                  placeholder="Descrivi in dettaglio il disservizio riscontrato..."
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Richiesta</label>
                <Textarea
                  placeholder="Indica la soluzione che desideri (rimborso, risarcimento, ecc.)"
                  rows={3}
                />
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="privacy-reclami" className="mt-1" required />
                <label htmlFor="privacy-reclami" className="text-sm text-gray-600">
                  Dichiaro che le informazioni fornite sono veritiere e accetto il trattamento dei dati
                  personali ai sensi della{" "}
                  <a href="/privacy-policy" className="text-[#C41E2F] underline">Privacy Policy</a>. *
                </label>
              </div>
              <Button type="submit" className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
                Invia Reclamo
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
