import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Globe, DollarSign, Handshake, RefreshCw, BarChart3, HeadphonesIcon, Wrench, ClipboardList, CheckCircle, Quote } from "lucide-react";

const vantaggi = [
  {
    icon: Globe,
    title: "Conoscenza approfondita delle destinazioni",
    desc: "Il nostro team viaggia costantemente per selezionare e testare personalmente ogni destinazione. Questo ci permette di offrirti informazioni dettagliate e consigli pratici che faranno la differenza nella vendita ai tuoi clienti.",
  },
  {
    icon: DollarSign,
    title: "Rapporto qualità-prezzo ottimale",
    desc: "Lavoriamo per offrirti il miglior equilibrio tra qualità del servizio e convenienza economica. Le nostre partnership dirette con fornitori selezionati ci permettono di proporre tariffe competitive mantenendo sempre standard elevati.",
  },
  {
    icon: Handshake,
    title: "Staff competente e sempre disponibile",
    desc: "Il nostro team è formato da professionisti esperti che condividono la passione per il viaggio. Siamo sempre pronti ad ascoltarti, a risolvere dubbi e a supportarti in ogni fase del processo.",
  },
  {
    icon: RefreshCw,
    title: "Flessibilità operativa",
    desc: "Comprendiamo che nel turismo le esigenze possono cambiare rapidamente. Per questo motivo offriamo soluzioni flessibili che si adattano alle tue necessità operative, ai tempi dei tuoi clienti e alle specificità di ogni pratica.",
  },
  {
    icon: BarChart3,
    title: "Condizioni commerciali vantaggiose",
    desc: "Le nostre commissioni e condizioni contrattuali sono studiate per essere realmente interessanti e sostenibili nel tempo. Crediamo in partnership durature basate sulla reciproca convenienza.",
  },
];

const testimonials = [
  {
    text: "Collaborare con Misha Travel ha significato avere un partner vero, non solo un fornitore. Il loro supporto costante e la qualità delle proposte hanno rafforzato la fiducia dei nostri clienti.",
    name: "Elena R.",
    role: "Agenzia Viaggi & Turismo",
  },
  {
    text: "Apprezzo particolarmente la loro flessibilità e disponibilità. Quando abbiamo esigenze particolari, trovano sempre una soluzione. È il tipo di collaborazione che cercavamo.",
    name: "Andrea M.",
    role: "Travel Solutions",
  },
  {
    text: "La conoscenza diretta delle destinazioni fa la differenza. I miei clienti apprezzano i consigli dettagliati che posso dare grazie alle informazioni che ricevo da Misha Travel.",
    name: "Francesca L.",
    role: "Viaggi & Sogni",
  },
];

const steps = [
  {
    num: "01",
    title: "Primo Contatto",
    desc: "Ci piace conoscere personalmente i nostri partner. Organizziamo un incontro per presentarci, capire le tue esigenze e illustrarti nel dettaglio la nostra offerta.",
  },
  {
    num: "02",
    title: "Definizione dell'Accordo",
    desc: "Insieme definiamo le condizioni di collaborazione più adatte alla tua agenzia, dalle commissioni alle modalità operative, tutto su misura per te.",
  },
  {
    num: "03",
    title: "Inizio Collaborazione",
    desc: "Ti accompagniamo nei primi passi con formazione dedicata e supporto costante. Il nostro obiettivo è che tu possa iniziare a lavorare con noi nel modo più sereno possibile.",
  },
];

const faq = [
  {
    q: "Quali sono i requisiti per diventare partner?",
    a: "Cerchiamo agenzie serie e motivate a offrire un servizio di qualità. Non ci sono requisiti di fatturato minimo: valutiamo ogni potenziale partner per la professionalità e la condivisione dei nostri valori.",
  },
  {
    q: "Come sono strutturate le commissioni?",
    a: "Offriamo condizioni commerciali trasparenti e competitive. Le commissioni variano in base al tipo di servizio e al volume di collaborazione. Tutti i dettagli vengono chiariti durante il primo incontro.",
  },
  {
    q: "Quale supporto ricevono i partner?",
    a: "Ogni partner ha un referente dedicato e accesso ai nostri strumenti professionali. Organizziamo anche incontri formativi periodici per mantenervi sempre aggiornati.",
  },
  {
    q: "È possibile personalizzare i viaggi?",
    a: "Certamente. Una delle nostre peculiarità è proprio la capacità di adattare le proposte alle esigenze specifiche dei clienti finali.",
  },
];

export default function DiventaPartnerPage() {
  return (
    <>
      <PageHero
        title="Diventa Partner"
        subtitle="Uniamo le forze per offrire ai tuoi clienti esperienze di viaggio indimenticabili"
        backgroundImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Diventa Partner", href: "/diventa-partner" }]}
      />

      {/* Intro */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-6">
            Perché scegliere una partnership con noi
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg text-center mb-4">
            Sappiamo quanto sia importante per un&apos;agenzia di viaggi avere al proprio fianco un tour
            operator affidabile e competente. In Misha Travel crediamo nel valore della collaborazione
            autentica: non siamo solo un fornitore, siamo il partner che ti aiuta a crescere.
          </p>
          <p className="text-gray-600 leading-relaxed text-center">
            La nostra esperienza nel settore ci ha insegnato che ogni agenzia ha le proprie specificità
            e i propri obiettivi. Per questo motivo, abbiamo sviluppato un approccio personalizzato che
            si adatta alle tue esigenze, garantendo sempre il massimo supporto professionale.
          </p>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            I vantaggi di lavorare con Misha Travel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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

      {/* Testimonials */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            La voce dei nostri partner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <Quote className="size-6 text-[#C41E2F]/30 mb-3" />
                <p className="text-gray-600 italic mb-4 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-[#1B2D4F]">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cosa offriamo */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            Cosa offriamo ai nostri partner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <HeadphonesIcon className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="font-bold text-lg text-[#1B2D4F] mb-3">Supporto Personalizzato</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Referente dedicato per ogni partner</li>
                <li>Consulenza nella scelta delle proposte più adatte</li>
                <li>Formazione continua su destinazioni e servizi</li>
                <li>Assistenza nella gestione di richieste complesse</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <Wrench className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="font-bold text-lg text-[#1B2D4F] mb-3">Strumenti Professionali</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Accesso alla nostra piattaforma di prenotazione</li>
                <li>Materiali informativi aggiornati e di qualità</li>
                <li>Schede tecniche dettagliate per ogni destinazione</li>
                <li>Reportistica per monitorare l&apos;andamento</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <ClipboardList className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="font-bold text-lg text-[#1B2D4F] mb-3">Gestione Semplificata</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Procedure chiare e snelle per ogni prenotazione</li>
                <li>Gestione flessibile di modifiche e variazioni</li>
                <li>Condizioni di pagamento adattabili</li>
                <li>Supporto amministrativo per la documentazione</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            Come avviare la partnership
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#C41E2F] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-[#1B2D4F] mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-10">
            Domande frequenti
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2 text-center">
              Parliamone insieme
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
              Sei interessato a conoscere meglio le nostre proposte di partnership? Siamo a tua disposizione per un incontro senza impegno.
            </p>
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nome e Cognome *</label>
                  <Input placeholder="Nome e Cognome" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Agenzia *</label>
                  <Input placeholder="Nome dell'agenzia" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Città *</label>
                  <Input placeholder="Città" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Telefono *</label>
                  <Input type="tel" placeholder="+39 ..." required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                <Input type="email" placeholder="email@agenzia.com" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Messaggio</label>
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
                Richiedi un Incontro
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact info */}
      <section className="py-8 bg-[#1B2D4F]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/70 text-sm mb-2">I nostri contatti</p>
          <p className="text-white font-medium mb-1">
            <a href="mailto:partnership@mishatravel.com" className="hover:text-[#C41E2F] transition-colors">
              partnership@mishatravel.com
            </a>
          </p>
          <p className="text-white/70 text-sm mb-1">www.mishatravel.com</p>
          <p className="text-white/50 text-sm">Orari: Lunedì-Venerdì 9:00-18:00 — Ti ricontatteremo entro 24 ore</p>
        </div>
      </section>
    </>
  );
}
