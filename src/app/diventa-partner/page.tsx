import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Handshake, TrendingUp, BookOpen, HeadphonesIcon, Users, Award, CheckCircle } from "lucide-react";

const vantaggi = [
  { icon: TrendingUp, title: "Commissioni Competitive", desc: "Le migliori commissioni del mercato su tutti i nostri prodotti, con bonus al raggiungimento degli obiettivi." },
  { icon: BookOpen, title: "Formazione Continua", desc: "Webinar, fam trip e corsi di aggiornamento per conoscere a fondo le nostre destinazioni e prodotti." },
  { icon: HeadphonesIcon, title: "Supporto Dedicato", desc: "Un account manager dedicato per assistervi in ogni fase della vendita e della prenotazione." },
  { icon: Users, title: "Materiale Marketing", desc: "Cataloghi, brochure, contenuti social e materiale promozionale personalizzabile per la vostra agenzia." },
  { icon: Award, title: "Programma Incentivi", desc: "Premi e incentivi per le agenzie piu performanti: viaggi premio, bonus e riconoscimenti speciali." },
  { icon: Handshake, title: "Partnership Esclusiva", desc: "Accesso a prodotti esclusivi e partenze garantite riservate ai nostri partner." },
];

const steps = [
  { num: "01", title: "Compila il Modulo", desc: "Inserisci i dati della tua agenzia nel modulo sottostante." },
  { num: "02", title: "Valutazione", desc: "Il nostro team valutera la richiesta entro 48 ore lavorative." },
  { num: "03", title: "Attivazione", desc: "Riceverai le credenziali di accesso all'area riservata e il kit di benvenuto." },
  { num: "04", title: "Inizia a Vendere", desc: "Accedi al portale B2B, consulta disponibilita e prenota per i tuoi clienti." },
];

const faq = [
  { q: "Quali sono i requisiti per diventare partner?", a: "E necessario essere un'agenzia di viaggio regolarmente iscritta e con licenza valida. Non sono richiesti volumi minimi di vendita per l'adesione." },
  { q: "Quanto tempo richiede l'attivazione?", a: "La valutazione della richiesta avviene entro 48 ore lavorative. Una volta approvata, l'attivazione e immediata." },
  { q: "Posso accedere a un portale B2B?", a: "Si, tutti i partner hanno accesso al nostro portale B2B per consultare disponibilita, prezzi in tempo reale e procedere con le prenotazioni online." },
  { q: "Sono previsti costi di adesione?", a: "No, l'adesione al programma partner Misha Travel e completamente gratuita e senza vincoli." },
  { q: "Come funzionano i fam trip?", a: "Organizziamo regolarmente educational e fam trip sulle nostre destinazioni. I partner attivi hanno priorita nella selezione." },
];

export default function DiventaPartnerPage() {
  return (
    <>
      <PageHero
        title="Diventa Partner"
        subtitle="Unisciti alla rete di agenzie Misha Travel"
        backgroundImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Diventa Partner", href: "/diventa-partner" }]}
      />

      {/* Intro */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Misha Travel e alla ricerca di agenzie di viaggio motivate e professionali con cui
            costruire partnership durature. Entra a far parte della nostra rete e offri ai tuoi
            clienti esperienze di viaggio uniche.
          </p>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            I Vantaggi di Essere Partner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vantaggi.map((v) => (
              <div key={v.title} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                <v.icon className="size-10 text-[#C41E2F] mb-4" />
                <h3 className="font-bold text-lg text-[#1B2D4F] mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            Come Funziona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#C41E2F] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-[#1B2D4F] mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            Cosa Dicono i Nostri Partner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Agenzia Viaggi Roma", text: "Collaboriamo con Misha Travel da 3 anni. I loro prodotti si vendono da soli e il supporto e sempre impeccabile.", role: "Direttore" },
              { name: "Turismo & Cultura Napoli", text: "I fam trip organizzati da Misha Travel sono un'opportunita straordinaria per conoscere i prodotti e le destinazioni.", role: "Responsabile Vendite" },
              { name: "Mondo Viaggi Milano", text: "Le commissioni competitive e il portale B2B intuitivo rendono Misha Travel il partner ideale per la nostra agenzia.", role: "Titolare" },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-lg p-6 border border-gray-100">
                <p className="text-gray-600 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-[#1B2D4F]">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            Domande Frequenti
          </h2>
          <Accordion type="single" collapsible>
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold text-[#1B2D4F]">{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6 text-center">
              Richiedi di Diventare Partner
            </h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nome Agenzia *</label>
                  <Input placeholder="Nome della tua agenzia" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">P.IVA *</label>
                  <Input placeholder="Partita IVA" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Referente *</label>
                  <Input placeholder="Nome e Cognome" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Ruolo</label>
                  <Input placeholder="Titolare / Direttore / ecc." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                <Input type="email" placeholder="email@agenzia.com" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Telefono *</label>
                <Input type="tel" placeholder="+39 06 1234567" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Citta e Provincia *</label>
                <Input placeholder="Roma (RM)" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Note / Messaggio</label>
                <Textarea placeholder="Raccontaci della tua agenzia..." rows={4} />
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="privacy-partner" className="mt-1" required />
                <label htmlFor="privacy-partner" className="text-sm text-gray-600">
                  Accetto il trattamento dei dati personali secondo la{" "}
                  <a href="/privacy-policy" className="text-[#C41E2F] underline">Privacy Policy</a>. *
                </label>
              </div>
              <Button type="submit" className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
                <CheckCircle className="size-4 mr-2" />
                Invia Richiesta
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
