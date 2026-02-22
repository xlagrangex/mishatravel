import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  UserPlus,
  LogIn,
  LayoutDashboard,
  Globe,
  Ship,
  FileText,
  Search,
  ArrowRight,
  CheckCircle,
  Monitor,
  ShieldCheck,
  Headphones,
} from "lucide-react";

export const metadata = {
  title: "Guida per le Agenzie | Misha Travel",
  description:
    "Guida completa per le agenzie di viaggio: registrazione, accesso al portale B2B, navigazione del sito e richiesta preventivi su Misha Travel.",
};

const siteAreas = [
  {
    icon: Globe,
    title: "Tour",
    href: "/tours",
    desc: "Esplora tutti i tour di gruppo e individuali organizzati da Misha Travel: Giordania, Turchia, India, Uzbekistan e molte altre destinazioni.",
  },
  {
    icon: Ship,
    title: "Crociere Fluviali",
    href: "/crociere",
    desc: "Scopri le crociere fluviali in Europa e nel mondo: Danubio, Reno, Nilo, Mekong e altri itinerari esclusivi.",
  },
  {
    icon: Search,
    title: "Calendario Partenze",
    href: "/calendario-partenze",
    desc: "Consulta le date di partenza disponibili, filtra per destinazione e periodo per trovare la soluzione ideale per i tuoi clienti.",
  },
  {
    icon: FileText,
    title: "Sfoglia Cataloghi",
    href: "/sfoglia-cataloghi",
    desc: "Scarica e sfoglia i nostri cataloghi digitali aggiornati con tutti i dettagli su itinerari, servizi inclusi e prezzi.",
  },
];

export default function GuidaAgenziePage() {
  return (
    <>
      <PageHero
        title="Guida per le Agenzie"
        subtitle="Tutto quello che devi sapere per utilizzare il portale Misha Travel"
        breadcrumbs={[{ label: "Guida per le Agenzie", href: "/guida-agenzie" }]}
      />

      {/* Intro */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-lg text-gray-600 leading-relaxed text-center">
            mishatravel.com &egrave; la piattaforma B2B dedicata alle agenzie di viaggio.
            Qui trovi tour, crociere fluviali e pacchetti esclusivi pensati per essere venduti
            ai tuoi clienti. In questa guida ti spieghiamo come registrarti, accedere
            all&apos;area riservata e muoverti tra le sezioni del sito.
          </p>
        </div>
      </section>

      {/* Panoramica navigazione */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <Monitor className="size-10 text-[#C41E2F] mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              Panoramica del Sito
            </h2>
            <p className="text-gray-600 mt-2">Le sezioni principali a tua disposizione</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {siteAreas.map((area) => (
              <Link
                key={area.title}
                href={area.href}
                className="group bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:border-[#C41E2F]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <area.icon className="size-8 text-[#C41E2F] shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-[#1B2D4F] mb-1 group-hover:text-[#C41E2F] transition-colors">
                      {area.title}
                      <ArrowRight className="size-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{area.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Processo di registrazione */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="size-8 text-[#C41E2F]" />
            <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              Registrazione
            </h2>
          </div>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Per accedere ai prezzi riservati e richiedere preventivi, &egrave; necessario registrarsi
            come agenzia partner. La registrazione &egrave; gratuita e richiede pochi minuti.
          </p>

          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Vai alla pagina di registrazione",
                desc: "Clicca su \"Registrati\" nel menu in alto a destra o nel footer del sito. Verrai indirizzato al modulo di registrazione per agenzie.",
              },
              {
                step: "2",
                title: "Compila i dati della tua agenzia",
                desc: "Inserisci ragione sociale, Partita IVA, indirizzo della sede, nome del referente, email aziendale e numero di telefono.",
              },
              {
                step: "3",
                title: "Invia la richiesta",
                desc: "Dopo aver compilato il modulo, riceverai un'email di conferma ricezione. Il nostro team verificherà i dati entro 24-48 ore lavorative.",
              },
              {
                step: "4",
                title: "Ricevi le credenziali",
                desc: "Una volta approvata la registrazione, riceverai via email le credenziali di accesso (username e password) per entrare nell'area riservata.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C41E2F] text-white text-lg font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-[#1B2D4F] mb-1">{item.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Button asChild size="lg" className="bg-[#C41E2F] hover:bg-[#A31825] text-white">
              <Link href="/registrati">
                <UserPlus className="size-4 mr-2" />
                Registrati Ora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#1B2D4F] text-[#1B2D4F] hover:bg-[#1B2D4F] hover:text-white">
              <Link href="/diventa-partner">Scopri i Vantaggi Partner</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Accesso e Area Riservata */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <LogIn className="size-8 text-[#C41E2F]" />
            <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              Accesso e Area Riservata
            </h2>
          </div>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Una volta registrato e approvato, puoi accedere all&apos;area riservata con le tue credenziali.
            Da qui hai il controllo completo sulle tue attivit&agrave;.
          </p>

          <div className="bg-white rounded-xl p-8 border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-4">
              Come effettuare il login
            </h3>
            <ol className="list-decimal pl-6 text-gray-600 space-y-3">
              <li>Clicca su <strong>&ldquo;Login Agenzie&rdquo;</strong> nel menu principale o nel footer</li>
              <li>Inserisci <strong>email</strong> e <strong>password</strong> ricevute via email</li>
              <li>Accedi alla tua <strong>dashboard personale</strong></li>
            </ol>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Password dimenticata?</strong> Usa la funzione &ldquo;Recupera password&rdquo; nella pagina
                di login. Riceverai un&apos;email con le istruzioni per reimpostarla.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <LayoutDashboard className="size-7 text-[#C41E2F]" />
            <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
              Cosa trovi nella Dashboard
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Preventivi richiesti", desc: "Storico completo di tutte le richieste inviate, con stato di avanzamento (ricevuto, in lavorazione, confermato)." },
              { title: "Prezzi riservati", desc: "Visualizza i prezzi B2B riservati alle agenzie partner, non visibili ai visitatori non registrati." },
              { title: "Documenti e PDF", desc: "Scarica estratti conto, conferme di prenotazione e preventivi in formato PDF." },
              { title: "Dati del profilo", desc: "Aggiorna i dati della tua agenzia, il referente e le informazioni di contatto." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-lg p-5 border border-gray-100">
                <CheckCircle className="size-5 text-[#C41E2F] mb-2" />
                <h4 className="font-semibold text-[#1B2D4F] mb-1 text-sm">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flusso di navigazione */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] text-center mb-3">
            Come Navigare tra le Sezioni
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Ecco il percorso tipico di un&apos;agenzia sul nostro sito, dalla ricerca del prodotto
            alla richiesta di preventivo.
          </p>

          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

            <div className="space-y-8">
              {[
                {
                  num: "1",
                  title: "Esplora il catalogo",
                  desc: "Dalla homepage, accedi alla sezione Tour o Crociere Fluviali. Puoi anche usare il Calendario Partenze per filtrare per data.",
                  link: { label: "Vai ai Tour", href: "/tours" },
                },
                {
                  num: "2",
                  title: "Scegli il prodotto",
                  desc: "Clicca su un tour o una crociera per visualizzare la scheda completa: itinerario, servizi inclusi, galleria fotografica e prezzo (se disponibile).",
                },
                {
                  num: "3",
                  title: "Richiedi il preventivo",
                  desc: "Clicca su \"Richiedi Preventivo\" nella scheda prodotto. Se sei loggato verrai portato direttamente al riepilogo; altrimenti ti sarà chiesto di effettuare il login.",
                },
                {
                  num: "4",
                  title: "Personalizza la richiesta",
                  desc: "Aggiungi note, indicazioni speciali o richieste particolari del tuo cliente (es. camera singola, transfer aggiuntivo, estensione soggiorno).",
                },
                {
                  num: "5",
                  title: "Invia e monitora",
                  desc: "Dopo l'invio ricevi conferma via email. Dalla dashboard puoi seguire lo stato: \"ricevuto\", \"in lavorazione\", \"preventivo pronto\", \"confermato\".",
                },
                {
                  num: "6",
                  title: "Ricevi il preventivo",
                  desc: "Il nostro booking team ti invierà il preventivo dettagliato, scaricabile in PDF dalla tua area riservata. Da lì potrai confermare la prenotazione.",
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-5 relative">
                  <div className="w-12 h-12 rounded-full bg-[#1B2D4F] text-white text-lg font-bold flex items-center justify-center shrink-0 z-10">
                    {step.num}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 flex-1 border border-gray-100">
                    <h3 className="font-bold text-[#1B2D4F] mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                    {step.link && (
                      <Link
                        href={step.link.href}
                        className="inline-flex items-center gap-1 text-[#C41E2F] text-sm font-medium mt-3 hover:underline"
                      >
                        {step.link.label}
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supporto e sicurezza */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-8 border border-gray-100">
              <Headphones className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                Supporto Dedicato
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Per qualsiasi dubbio sulla navigazione, sulla registrazione o sulle funzionalit&agrave;
                del portale, il nostro team &egrave; a disposizione:
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  Email:{" "}
                  <a href="mailto:agenzia@mishatravel.com" className="text-[#C41E2F] font-medium hover:underline">
                    agenzia@mishatravel.com
                  </a>
                </p>
                <p className="text-gray-600">
                  Tel:{" "}
                  <a href="tel:+390108994000" className="text-[#C41E2F] font-medium hover:underline">
                    +39 010 899 4000
                  </a>
                </p>
                <p className="text-gray-500">Lun&ndash;Ven, 9:00&ndash;18:00</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-8 border border-gray-100">
              <ShieldCheck className="size-8 text-[#C41E2F] mb-4" />
              <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                Sicurezza e Privacy
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                I dati della tua agenzia e dei tuoi clienti sono trattati nel pieno rispetto
                del GDPR. L&apos;area riservata utilizza connessioni crittografate e accessi protetti.
              </p>
              <div className="space-y-2">
                <Link href="/privacy-policy" className="text-[#C41E2F] text-sm hover:underline block">
                  Privacy Policy
                </Link>
                <Link href="/gdpr" className="text-[#C41E2F] text-sm hover:underline block">
                  Informativa GDPR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="py-12 bg-[#1B2D4F]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)] mb-3">
            Pronto a iniziare?
          </h2>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            Registra la tua agenzia in pochi minuti e inizia a esplorare i nostri tour e crociere
            con prezzi riservati.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-[#C41E2F] hover:bg-[#A31825] text-white">
              <Link href="/registrati">Registrati come Agenzia</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1B2D4F]">
              <Link href="/come-prenotare-guida-completa">Come Prenotare</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
