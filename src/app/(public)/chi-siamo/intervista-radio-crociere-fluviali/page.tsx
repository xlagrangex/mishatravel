import type { Metadata } from "next";
import Link from "next/link";
import {
  Radio,
  ArrowRight,
  Quote,
  Mic,
  Ship,
  Users,
  Compass,
  Sparkles,
  Shield,
  MapPin,
} from "lucide-react";
import YouTubeLiteEmbed from "@/components/media/YouTubeLiteEmbed";

const VIDEO_ID = "uT8C58QECZw";
const VIDEO_TITLE = "Intervista a MishaTravel: crociere fluviali e viaggi di gruppo";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const PAGE_URL = "https://www.mishatravel.com/chi-siamo/intervista-radio-crociere-fluviali";

export const metadata: Metadata = {
  title: "Intervista radio a MishaTravel: crociere fluviali e viaggi di gruppo | Misha Travel",
  description:
    "Alessia Cardone racconta a Storytime su Evoluzione Radio le crociere fluviali su Danubio, Reno e Douro, i viaggi di gruppo MishaTravel e il valore di affidarsi a professionisti del viaggio.",
  openGraph: {
    title: "Intervista a MishaTravel su Storytime — Evoluzione Radio",
    description:
      "Crociere fluviali, viaggi di gruppo e il valore di un'agenzia: l'intervista ad Alessia Cardone di MishaTravel.",
    url: PAGE_URL,
    type: "article",
    images: [
      {
        url: `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`,
        width: 1280,
        height: 720,
        alt: "Alessia Cardone di MishaTravel a Storytime",
      },
    ],
  },
  alternates: { canonical: PAGE_URL },
};

const CHAPTERS = [
  { id: "chi-siamo", label: "Chi è MishaTravel", icon: Compass },
  { id: "crociere-fluviali", label: "Le crociere fluviali", icon: Ship },
  { id: "viaggi-gruppo", label: "I viaggi di gruppo", icon: Users },
  { id: "mete", label: "Le mete consigliate", icon: Sparkles },
  { id: "trend-europa", label: "Riscoprire l'Europa", icon: Compass },
  { id: "valore-agenzia", label: "Il valore di un'agenzia", icon: Shield },
  { id: "copertura", label: "Copertura nazionale", icon: MapPin },
];

const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: VIDEO_TITLE,
  description:
    "Intervista ad Alessia Cardone, agente di viaggio MishaTravel, ospite a Storytime su Evoluzione Radio. Racconta le crociere fluviali su Danubio, Reno e Douro, i viaggi di gruppo accompagnati, le mete più richieste e il valore di affidarsi a un'agenzia specializzata.",
  thumbnailUrl: [`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`],
  embedUrl: `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`,
  contentUrl: VIDEO_URL,
  inLanguage: "it-IT",
  publisher: {
    "@type": "Organization",
    name: "MishaTravel",
    url: "https://www.mishatravel.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.mishatravel.com/images/logo/logo-footer.webp",
    },
  },
  actor: {
    "@type": "Person",
    name: "Alessia Cardone",
    jobTitle: "Agente di viaggio",
    worksFor: { "@type": "Organization", name: "MishaTravel" },
  },
};

export default function IntervistaRadioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />

      {/* ============================================
          HERO con player
          ============================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B2D4F] via-[#162644] to-[#0f1d36] pb-16 pt-28 md:pb-24 md:pt-32">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px, 70px 70px",
          }}
        />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <Radio className="size-3.5" />
              Storytime · Evoluzione Radio
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight text-white md:text-5xl">
              Crociere fluviali, viaggi di gruppo
              <br />
              <span className="text-[#C41E2F]">e il valore di un&rsquo;agenzia.</span>
            </h1>
            <p className="mt-6 text-base text-white/80 md:text-lg">
              Alessia Cardone di MishaTravel ospite a <em>Storytime</em> su Evoluzione Radio.
              Dodici minuti per capire come viaggiamo, dove possiamo portarti e perché
              affidarsi a chi conosce davvero il mestiere fa la differenza.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <YouTubeLiteEmbed videoId={VIDEO_ID} title={VIDEO_TITLE} />
          </div>
        </div>
      </section>

      {/* ============================================
          INDICE ARGOMENTI
          ============================================ */}
      <section className="border-b border-gray-100 bg-white py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#C41E2F]/10">
                <Mic className="size-5 text-[#C41E2F]" />
              </div>
              <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#1B2D4F]">
                Di cosa si parla nell&rsquo;intervista
              </h2>
            </div>
            <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {CHAPTERS.map((ch, i) => {
                const Icon = ch.icon;
                return (
                  <li key={ch.id}>
                    <a
                      href={`#${ch.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C41E2F] hover:bg-white hover:shadow-md"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1B2D4F] shadow-sm transition-colors group-hover:bg-[#C41E2F] group-hover:text-white">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-[#1B2D4F]">
                        <span className="text-[#C41E2F]">{String(i + 1).padStart(2, "0")}.</span> {ch.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================
          SEZIONI NARRATIVE
          ============================================ */}
      <div className="bg-white">
        {/* ───── 1. Chi è MishaTravel ───── */}
        <ChapterSection
          id="chi-siamo"
          number={1}
          eyebrow="Chi siamo"
          title="Quarant'anni a portare l'Italia in viaggio"
          icon={Compass}
        >
          <p>
            MishaTravel nasce a Genova come <strong>tour operator e agenzia viaggi</strong>{" "}
            e opera in Liguria da <strong>oltre quarant&rsquo;anni</strong>. Nel 2018 abbiamo
            avviato la partnership con <em>Crucemundo</em>, tour operator spagnolo specializzato
            in crociere fluviali, da cui nasce il nostro nuovo nome:{" "}
            <strong>Crucemundo Italia Misha Travel</strong>.
          </p>
          <p>
            Lavoriamo sia con <strong>viaggi individuali</strong> costruiti su misura sia con{" "}
            <strong>viaggi di gruppo accompagnati</strong> da personale dell&rsquo;agenzia.
            Le crociere fluviali sono il nostro settore di nicchia: abbiamo navi di proprietà
            e partenze garantite verso destinazioni in tutto il mondo.
          </p>
          <InlineCTA href="/chi-siamo" label="Scopri la nostra storia" />
        </ChapterSection>

        {/* ───── 2. Crociere fluviali ───── */}
        <ChapterSection
          id="crociere-fluviali"
          number={2}
          eyebrow="Crociere fluviali"
          title="Danubio, Reno, Douro: l'Europa vista dall'acqua"
          icon={Ship}
          accent
        >
          <p>
            Le nostre <strong>crociere fluviali</strong> attraversano i grandi fiumi europei:{" "}
            il <strong>Danubio</strong> tra Austria, Ungheria e Slovacchia, il{" "}
            <strong>Reno</strong> tra Germania, Francia e Paesi Bassi, e il{" "}
            <strong>Douro</strong> dal Portogallo fino in Spagna.
          </p>
          <p>
            Sono <strong>navi più piccole</strong> delle classiche crociere marittime — perché
            i fiumi sono più stretti — e questo è il loro vantaggio:{" "}
            <strong>attraccano direttamente in centro città</strong>, spesso a pochi passi
            dal cuore storico. Si naviga di notte, la mattina si scende a terra per le
            escursioni (individuali, di gruppo o acquistate a bordo) e si scoprono città
            che dalle grandi navi marittime sono semplicemente irraggiungibili.
          </p>
          <p>
            Sono adatte a <strong>qualsiasi età</strong>: dai più giovani a chi cerca un
            viaggio rilassato senza rinunciare alla cultura e ai panorami.
          </p>
        </ChapterSection>

        <PullQuoteSection
          text="Si possono vedere città dove con una crociera più grande non si può arrivare."
          author="Alessia Cardone"
        />

        <CTABand
          title="Pronto per una crociera fluviale?"
          description="Esplora gli itinerari su Danubio, Reno, Douro e altri fiumi europei con le navi di proprietà MishaTravel."
          primaryHref="/crociere"
          primaryLabel="Vedi le crociere"
          secondaryHref="/flotta"
          secondaryLabel="Scopri la nostra flotta"
        />

        {/* ───── 3. Viaggi di gruppo ───── */}
        <ChapterSection
          id="viaggi-gruppo"
          number={3}
          eyebrow="Viaggi di gruppo"
          title="Una ventina di persone, un accompagnatore, zero pensieri"
          icon={Users}
        >
          <p>
            I nostri viaggi di gruppo non sono mai pullmanate da cinquanta persone.{" "}
            <strong>Solitamente siamo sulla ventina</strong>, con un{" "}
            <strong>accompagnatore MishaTravel</strong> che segue il gruppo dall&rsquo;inizio
            alla fine: prenotazioni, trasferimenti, imprevisti, tutto è gestito.
          </p>
          <p>
            Sono <strong>l&rsquo;ideale per chi viaggia da solo</strong>: molti dei nostri
            clienti partono in solitaria proprio per <strong>conoscere persone nuove</strong>,
            e dai nostri gruppi nascono spesso amicizie che durano oltre il viaggio.
          </p>
          <p>
            E no, non sono solo per &ldquo;senior&rdquo;: abbiamo{" "}
            <strong>molti giovani</strong> che scelgono il viaggio di gruppo per rimanere
            insieme tra amici o per partire quando nessuno della loro cerchia ha le stesse
            ferie. Tu scegli la data, noi pensiamo al resto.
          </p>
          <InlineCTA href="/calendario-partenze" label="Vedi le prossime partenze di gruppo" />
        </ChapterSection>

        {/* ───── 4. Mete consigliate ───── */}
        <ChapterSection
          id="mete"
          number={4}
          eyebrow="Le mete"
          title="Dall'Uzbekistan ai safari, passando per la Cina"
          icon={Sparkles}
          accent
        >
          <p>
            Oltre alle crociere, ci sono destinazioni che <strong>ti consigliamo almeno
            una volta nella vita</strong>:
          </p>
          <ul className="my-4 space-y-2 pl-0">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C41E2F]" />
              <span>
                <strong>Uzbekistan</strong> — Cultura millenaria della Via della Seta,
                dormire nelle yurte, escursioni che cambiano la prospettiva del viaggio.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C41E2F]" />
              <span>
                <strong>Cina e Asia</strong> — Tra i nostri viaggi più richiesti, con itinerari
                che alternano grandi città e zone meno turistiche.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C41E2F]" />
              <span>
                <strong>Safari in Africa</strong> — Uno dei viaggi più intensi e ricordati
                tra quelli organizzati direttamente da noi.
              </span>
            </li>
          </ul>
          <InlineCTA href="/destinazioni" label="Esplora tutte le destinazioni" />
        </ChapterSection>

        {/* ───── 5. Trend Europa ───── */}
        <ChapterSection
          id="trend-europa"
          number={5}
          eyebrow="Il trend del momento"
          title="L'Europa torna ad essere il viaggio"
          icon={Compass}
        >
          <p>
            Per anni il &ldquo;viaggio importante&rdquo; significava{" "}
            <strong>cambiare continente</strong>. Oggi le persone stanno riscoprendo
            l&rsquo;Europa, anche grazie alle <strong>crociere fluviali</strong>: una
            formula che molti non conoscono e che <strong>incuriosisce</strong> appena
            ne sentono parlare.
          </p>
          <p>
            Non più solo Mediterraneo o fiordi norvegesi: il Danubio attraversa quattro
            capitali in una settimana, il Reno collega le città storiche tedesche con
            i tulipani olandesi, il Douro porta tra le terre del vino portoghese.
          </p>
        </ChapterSection>

        <PullQuoteSection
          text="Un nuovo modo per vedere l'Europa sotto un altro punto di vista."
          author="Alessia Cardone"
          variant="red"
        />

        {/* ───── 6. Valore agenzia ───── */}
        <ChapterSection
          id="valore-agenzia"
          number={6}
          eyebrow="Perché un'agenzia"
          title="Il mito da sfatare: «mi affido a un'agenzia, pago di più»"
          icon={Shield}
          accent
        >
          <p>
            È il dubbio che frena molti viaggiatori. Ma <strong>non è vero</strong>.
            Quello che paghi è <strong>quarant&rsquo;anni di esperienza nel settore</strong>:
          </p>
          <ul className="my-4 space-y-2 pl-0">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C41E2F]" />
              <span>
                <strong>Strutture testate da noi.</strong> Molto spesso proviamo direttamente
                gli hotel e i resort che consigliamo, prima di mandarci i clienti.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C41E2F]" />
              <span>
                <strong>Assistenza 24 ore su 24.</strong> Un referente attivo per qualunque
                problema, anche nei festivi. Volo cancellato? Prenotazione introvabile in
                aeroporto? Ci chiami e ti aiutiamo.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C41E2F]" />
              <span>
                <strong>Zero truffe online.</strong> Quando prenoti un hotel con noi,
                quell&rsquo;hotel <em>esiste davvero</em> ed è pronto ad accoglierti.
                Niente sorprese all&rsquo;arrivo.
              </span>
            </li>
          </ul>
          <InlineCTA href="/contatti" label="Richiedi un preventivo personalizzato" />
        </ChapterSection>

        {/* ───── 7. Copertura nazionale ───── */}
        <ChapterSection
          id="copertura"
          number={7}
          eyebrow="Dove siamo"
          title="A Genova, ma lavoriamo con tutta Italia"
          icon={MapPin}
        >
          <p>
            La nostra sede è a Genova, ma essendo <strong>tour operator</strong>{" "}
            collaboriamo con <strong>agenzie viaggio su tutto il territorio nazionale</strong>.
            Ovunque tu sia, c&rsquo;è probabilmente un&rsquo;agenzia partner vicino a te che
            propone i nostri viaggi.
          </p>
          <p>
            Se preferisci parlare direttamente con noi, ci puoi raggiungere via telefono,
            email o richiedendo un preventivo dal sito.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/trova-agenzia"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1B2D4F] px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#162644] hover:shadow-lg"
            >
              <MapPin className="size-4" />
              Trova un&rsquo;agenzia partner
            </Link>
            <Link
              href="/contatti"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[#C41E2F] px-6 py-3 font-semibold text-[#C41E2F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C41E2F] hover:text-white"
            >
              Contattaci direttamente
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </ChapterSection>
      </div>

      {/* ============================================
          CTA finale
          ============================================ */}
      <section className="bg-gradient-to-br from-[#C41E2F] to-[#A31825] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-bold text-white md:text-4xl">
              Iniziamo a pianificare il tuo prossimo viaggio
            </h2>
            <p className="mt-4 text-base text-white/90 md:text-lg">
              Crociere fluviali, viaggi di gruppo, itinerari su misura: dicci dove
              vuoi andare e ci pensiamo noi.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contatti"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 font-semibold text-[#C41E2F] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Richiedi un preventivo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/crociere"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#C41E2F]"
              >
                Vedi le crociere
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================
// Local components
// ============================================

function ChapterSection({
  id,
  number,
  eyebrow,
  title,
  icon: Icon,
  accent = false,
  children,
}: {
  id: string;
  number: number;
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 py-16 md:py-20 ${accent ? "bg-gray-50" : "bg-white"}`}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1B2D4F] text-white shadow-lg">
              <Icon className="size-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C41E2F]">
                Capitolo {String(number).padStart(2, "0")} · {eyebrow}
              </span>
              <h2 className="mt-1 font-[family-name:var(--font-poppins)] text-2xl font-bold leading-tight text-[#1B2D4F] md:text-3xl">
                {title}
              </h2>
            </div>
          </div>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-gray-700 md:text-[17px]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function InlineCTA({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-2">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 font-semibold text-[#C41E2F] transition-all duration-300 hover:gap-3 hover:text-[#A31825]"
      >
        {label}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function PullQuoteSection({
  text,
  author,
  variant = "navy",
}: {
  text: string;
  author: string;
  variant?: "navy" | "red";
}) {
  const isRed = variant === "red";
  return (
    <section
      className={
        isRed
          ? "bg-gradient-to-br from-[#C41E2F] to-[#A31825] py-16"
          : "bg-gradient-to-br from-[#1B2D4F] to-[#0f1d36] py-16"
      }
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Quote
            className={`mx-auto size-12 ${
              isRed ? "text-white/30" : "text-[#C41E2F]"
            }`}
          />
          <blockquote className="mt-4">
            <p className="font-[family-name:var(--font-poppins)] text-2xl font-bold leading-snug text-white md:text-3xl lg:text-4xl">
              &ldquo;{text}&rdquo;
            </p>
            <footer className="mt-5 text-sm font-medium uppercase tracking-widest text-white/70">
              {author} — MishaTravel
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function CTABand({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <section className="border-y border-gray-100 bg-white py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-[#1B6FA8]/5 to-[#C41E2F]/5 p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#1B2D4F] md:text-2xl">
                {title}
              </h3>
              <p className="mt-2 text-base text-gray-600">{description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C41E2F] px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A31825] hover:shadow-lg"
              >
                {primaryLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#1B2D4F] px-6 py-3 font-semibold text-[#1B2D4F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1B2D4F] hover:text-white"
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
