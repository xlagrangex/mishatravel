import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContattiPage() {
  return (
    <>
      <PageHero
        title="Contattaci"
        subtitle="Siamo a tua disposizione per qualsiasi informazione"
        backgroundImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Contatti", href: "/contatti" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
                I Nostri Recapiti
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Il nostro team e a disposizione per rispondere alle vostre domande, fornire
                informazioni sui nostri tour e crociere, e aiutarvi a pianificare il viaggio perfetto.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <MapPin className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Sede</h3>
                    <p className="text-gray-600">Misha Travel Srl</p>
                    <p className="text-gray-600">Via Example 123, 00100 Roma (RM)</p>
                    <p className="text-gray-600">Italia</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <Phone className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Telefono</h3>
                    <p className="text-gray-600">+39 06 1234567</p>
                    <p className="text-gray-600">+39 333 1234567 (WhatsApp)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <Mail className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Email</h3>
                    <p className="text-gray-600">info@mishatravel.com</p>
                    <p className="text-gray-600">prenotazioni@mishatravel.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <Clock className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Orari di Apertura</h3>
                    <p className="text-gray-600">Lunedi - Venerdi: 9:00 - 18:00</p>
                    <p className="text-gray-600">Sabato: 9:00 - 13:00</p>
                    <p className="text-gray-600">Domenica: Chiuso</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
                  Scrivici un Messaggio
                </h2>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Nome *</label>
                      <Input placeholder="Il tuo nome" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Cognome *</label>
                      <Input placeholder="Il tuo cognome" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                    <Input type="email" placeholder="email@esempio.com" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Telefono</label>
                    <Input type="tel" placeholder="+39 333 1234567" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Oggetto *</label>
                    <Input placeholder="Informazioni su un viaggio" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Messaggio *</label>
                    <Textarea
                      placeholder="Scrivi il tuo messaggio..."
                      rows={5}
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="privacy" className="mt-1" required />
                    <label htmlFor="privacy" className="text-sm text-gray-600">
                      Ho letto e accetto la{" "}
                      <a href="/privacy-policy" className="text-[#C41E2F] underline">
                        Privacy Policy
                      </a>{" "}
                      e autorizzo il trattamento dei miei dati personali. *
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
                    Invia Messaggio
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="h-[400px] bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <MapPin className="size-8 text-[#C41E2F] mx-auto mb-2" />
            <p className="text-[#1B2D4F] font-semibold">Misha Travel Srl</p>
            <p className="text-gray-500 text-sm">Mappa interattiva - Coming soon</p>
          </div>
        </div>
      </section>
    </>
  );
}
