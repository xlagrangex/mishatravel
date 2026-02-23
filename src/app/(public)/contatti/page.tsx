import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata = {
  title: "Contatti | Misha Travel",
  description: "Contatta Misha Travel: telefono, email, indirizzo della sede di Genova.",
};

export default function ContattiPage() {
  return (
    <>
      <PageHero
        title="Contattaci"
        subtitle="Se hai qualche problema, siamo qui"
        breadcrumbs={[{ label: "Contatti", href: "/contatti" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
                I Nostri Recapiti
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Il nostro team &egrave; a disposizione per rispondere alle vostre domande, fornire
                informazioni sui nostri tour e crociere, e aiutarvi a pianificare il viaggio perfetto.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <MapPin className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Sede</h3>
                    <p className="text-gray-600">Crucemundo Italia Misha Travel S.r.l.</p>
                    <p className="text-gray-600">Piazza Grimaldi, 7 R</p>
                    <p className="text-gray-600">16124 Genova (GE) &ndash; Italia</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <Phone className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Telefono</h3>
                    <p className="text-gray-600">
                      <a href="tel:+390102461630" className="hover:text-[#C41E2F] transition-colors">+39 010 246 1630</a>
                    </p>
                    <p className="text-gray-600">
                      <a href="tel:+390108994000" className="hover:text-[#C41E2F] transition-colors">+39 010 899 4000</a>
                      <span className="text-gray-400 text-sm ml-1">(Booking)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <Mail className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Email</h3>
                    <p className="text-gray-600">
                      <a href="mailto:info@mishatravel.com" className="hover:text-[#C41E2F] transition-colors">info@mishatravel.com</a>
                    </p>
                    <p className="text-gray-600">
                      <a href="mailto:agenzia@mishatravel.com" className="hover:text-[#C41E2F] transition-colors">agenzia@mishatravel.com</a>
                      <span className="text-gray-400 text-sm ml-1">(Preventivi)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#C41E2F] rounded-lg p-3 shrink-0">
                    <Clock className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2D4F] mb-1">Orari di Apertura</h3>
                    <p className="text-gray-600">Luned&igrave; &ndash; Venerd&igrave;: 9:00 &ndash; 18:00</p>
                    <p className="text-gray-600">Sabato e Domenica: Chiuso</p>
                  </div>
                </div>
              </div>

              {/* Reparti */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
                  Reparti
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-[#1B2D4F] text-sm">Reparto Booking</p>
                    <p className="text-sm text-gray-600">
                      Tel: <a href="tel:+390108994000" className="hover:text-[#C41E2F]">+39 010 899 4000</a> &bull;
                      Email: <a href="mailto:agenzia@mishatravel.com" className="hover:text-[#C41E2F]">agenzia@mishatravel.com</a>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-[#1B2D4F] text-sm">Reparto Amministrazione</p>
                    <p className="text-sm text-gray-600">
                      Email: <a href="mailto:amministrazione@mishatravel.com" className="hover:text-[#C41E2F]">amministrazione@mishatravel.com</a>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-[#1B2D4F] text-sm">Reparto Marketing e Comunicazione</p>
                    <p className="text-sm text-gray-600">
                      Email: <a href="mailto:marketing@mishatravel.com" className="hover:text-[#C41E2F]">marketing@mishatravel.com</a>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-[#1B2D4F] text-sm">Supporto Tecnico Portale</p>
                    <p className="text-sm text-gray-600">
                      Email: <a href="mailto:supporto@mishatravel.com" className="hover:text-[#C41E2F]">supporto@mishatravel.com</a>
                    </p>
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
                    <Input type="tel" placeholder="+39 010 ..." />
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

      {/* Map */}
      <section className="h-[400px] bg-gray-200 relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2855.3!2d8.9323!3d44.4056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d343f0e8b0e3f1%3A0x3b0a5a7e8f8c8f1a!2sPiazza+Grimaldi%2C+16124+Genova+GE!5e0!3m2!1sit!2sit!4v1"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Misha Travel - Sede di Genova"
        />
      </section>
    </>
  );
}
