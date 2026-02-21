import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RegistrazionePage() {
  return (
    <>
      <PageHero
        title="Registrazione Agenzia"
        subtitle="Crea il tuo account per accedere al portale B2B"
        backgroundImage="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Registrazione", href: "/registrazione" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
            <p className="text-gray-600 mb-8 text-center">
              Compila il modulo sottostante per richiedere l&apos;accesso al portale B2B Misha Travel.
              La richiesta verra valutata dal nostro team e riceverai una conferma via email
              entro 48 ore lavorative.
            </p>

            <form className="space-y-5">
              <h3 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] border-b pb-2">
                Dati Agenzia
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Ragione Sociale *</label>
                  <Input placeholder="Nome Agenzia Srl" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">P.IVA *</label>
                  <Input placeholder="IT01234567890" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Codice Fiscale</label>
                  <Input placeholder="Codice Fiscale" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Licenza N.</label>
                  <Input placeholder="Numero licenza" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Indirizzo *</label>
                <Input placeholder="Via, numero civico" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Citta *</label>
                  <Input placeholder="Roma" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Provincia *</label>
                  <Input placeholder="RM" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">CAP *</label>
                  <Input placeholder="00100" required />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] border-b pb-2 pt-4">
                Dati Referente
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nome *</label>
                  <Input placeholder="Nome" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Cognome *</label>
                  <Input placeholder="Cognome" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                  <Input type="email" placeholder="email@agenzia.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Telefono *</label>
                  <Input type="tel" placeholder="+39 06 1234567" required />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] border-b pb-2 pt-4">
                Credenziali di Accesso
              </h3>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email di accesso *</label>
                <Input type="email" placeholder="email@agenzia.com" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
                  <Input type="password" placeholder="Minimo 8 caratteri" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Conferma Password *</label>
                  <Input type="password" placeholder="Ripeti la password" required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Note aggiuntive</label>
                <Textarea placeholder="Eventuali note o informazioni aggiuntive..." rows={3} />
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="privacy-reg" className="mt-1" required />
                <label htmlFor="privacy-reg" className="text-sm text-gray-600">
                  Accetto il trattamento dei dati personali secondo la{" "}
                  <a href="/privacy-policy" className="text-[#C41E2F] underline">Privacy Policy</a> e i{" "}
                  <a href="/termini-condizioni" className="text-[#C41E2F] underline">Termini e Condizioni</a>. *
                </label>
              </div>

              <Button type="submit" className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
                Invia Richiesta di Registrazione
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Hai gia un account?{" "}
              <Link href="/login" className="text-[#C41E2F] font-medium hover:underline">
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
