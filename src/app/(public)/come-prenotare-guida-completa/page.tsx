import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, FileText, CreditCard, Phone, Shield, HelpCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    num: "01",
    title: "Scegli il Tuo Viaggio",
    desc: "Esplora le nostre destinazioni, tour e crociere fluviali. Usa il calendario partenze per trovare la data ideale. Puoi anche contattarci direttamente per una consulenza personalizzata.",
  },
  {
    icon: FileText,
    num: "02",
    title: "Richiedi un Preventivo",
    desc: "Compila il modulo di richiesta preventivo sulla pagina del viaggio scelto, oppure contattaci telefonicamente o via email. Riceverai un preventivo dettagliato entro 24 ore.",
  },
  {
    icon: CreditCard,
    num: "03",
    title: "Conferma e Prenota",
    desc: "Una volta accettato il preventivo, procedi con il versamento dell'acconto per confermare la prenotazione. Potrai pagare tramite bonifico bancario, carta di credito o in agenzia.",
  },
];

const faqs = [
  {
    q: "Come posso pagare?",
    a: "Accettiamo bonifico bancario, carte di credito (Visa, Mastercard, American Express) e pagamento diretto in agenzia. E possibile rateizzare l'importo in base alle condizioni del viaggio.",
  },
  {
    q: "Quanto anticipo serve per prenotare?",
    a: "Di norma e richiesto un acconto del 30% alla conferma della prenotazione. Il saldo deve essere versato 30 giorni prima della partenza per i tour e 45 giorni per le crociere.",
  },
  {
    q: "Posso modificare la prenotazione dopo la conferma?",
    a: "Si, le modifiche sono possibili in base alla disponibilita e alle condizioni del fornitore. Eventuali costi aggiuntivi saranno comunicati preventivamente.",
  },
  {
    q: "L'assicurazione e inclusa?",
    a: "Tutti i nostri pacchetti includono l'assicurazione medico-bagaglio base. Consigliamo sempre di valutare un'assicurazione annullamento viaggio opzionale per una maggiore tranquillita.",
  },
  {
    q: "Cosa succede in caso di cancellazione?",
    a: "Le penali di cancellazione variano in base al viaggio e alla tempistica. Consulta la pagina Cancellazioni e Penali per tutti i dettagli.",
  },
];

export default function ComePrenotarePage() {
  return (
    <>
      <PageHero
        title="Come Prenotare"
        subtitle="Guida completa alla prenotazione del tuo viaggio"
        backgroundImage="https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Come Prenotare", href: "/come-prenotare-guida-completa" }]}
      />

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-4">
            Prenotare e Facile
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            In soli tre semplici passaggi potrai assicurarti il viaggio dei tuoi sogni con Misha Travel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step) => (
              <div key={step.num} className="text-center bg-gray-50 rounded-xl p-8 border border-gray-100">
                <div className="w-20 h-20 rounded-full bg-[#C41E2F]/10 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="size-8 text-[#C41E2F]" />
                </div>
                <span className="text-4xl font-bold text-[#1B2D4F]/10">{step.num}</span>
                <h3 className="text-xl font-bold text-[#1B2D4F] mt-2 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional info */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <Phone className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="font-bold text-lg text-[#1B2D4F] mb-2">Prenota per Telefono</h3>
              <p className="text-gray-600 text-sm mb-3">
                Preferisci parlare con un nostro consulente? Chiamaci dal lunedi al venerdi,
                dalle 9:00 alle 18:00.
              </p>
              <p className="font-bold text-[#1B2D4F]">+39 06 1234567</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <Shield className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="font-bold text-lg text-[#1B2D4F] mb-2">Prenota in Sicurezza</h3>
              <p className="text-gray-600 text-sm mb-3">
                Tutti i pagamenti sono protetti e sicuri. Misha Travel aderisce al Fondo di
                Garanzia per la tutela dei viaggiatori.
              </p>
              <Link href="/fondo-di-garanzia" className="text-[#C41E2F] font-medium text-sm hover:underline">
                Scopri di piu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            <HelpCircle className="size-8 inline-block mr-2 text-[#C41E2F]" />
            Domande Frequenti
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-[#1B2D4F] mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#1B2D4F]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)] mb-4">
            Pronto a Partire?
          </h2>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            Esplora le nostre proposte e trova il viaggio perfetto per te.
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
