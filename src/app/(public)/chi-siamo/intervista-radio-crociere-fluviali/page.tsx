import type { Metadata } from "next";
import Link from "next/link";
import { Radio, ArrowRight, Quote, Mic } from "lucide-react";
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
  { id: "chi-siamo", label: "Chi è MishaTravel" },
  { id: "crociere-fluviali", label: "Le crociere fluviali su Danubio, Reno e Douro" },
  { id: "viaggi-gruppo", label: "I viaggi di gruppo: come funzionano davvero" },
  { id: "mete", label: "Le mete consigliate: Uzbekistan, safari, Asia" },
  { id: "trend-europa", label: "Il trend del momento: riscoprire l'Europa" },
  { id: "valore-agenzia", label: "Perché affidarsi a un'agenzia" },
  { id: "copertura", label: "Non solo Genova: copertura nazionale" },
];

// Structured data — VideoObject schema for rich results & AI search
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
        {/* decorative pattern */}
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
              Un&rsquo;intervista per chi viaggia e per chi sta pensando di farlo.
            </p>
          </div>

          {/* Player */}
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
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#C41E2F]/10">
                <Mic className="size-5 text-[#C41E2F]" />
              </div>
              <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#1B2D4F]">
                Di cosa si parla nell&rsquo;intervista
              </h2>
            </div>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {CHAPTERS.map((ch, i) => (
                <li key={ch.id}>
                  <a
                    href={`#${ch.id}`}
                    className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C41E2F] hover:bg-white hover:shadow-md"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1B2D4F] text-xs font-bold text-white transition-colors group-hover:bg-[#C41E2F]">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-[#1B2D4F]">
                      {ch.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================
          TRASCRIZIONE
          ============================================ */}
      <article className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <header className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C41E2F]">
                Trascrizione integrale
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold text-[#1B2D4F] md:text-4xl">
                L&rsquo;intervista, parola per parola
              </h2>
              <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-[#C41E2F]" />
            </header>

            <Dialog speaker="Presentatore" text="Ben ritrovati amici e amiche di Storytime. Oggi siamo qui con una nuova ospite e quindi con una nuova storia. Diamo il benvenuto a Alessia Cardone. Ciao Alessia!" />
            <Dialog speaker="Alessia" text="Ciao, buongiorno a tutti." />
            <Dialog speaker="Presentatore" text="Ciao, ben arrivata. Grazie. Come stai?" />
            <Dialog speaker="Alessia" text="Bene, tutto bene grazie." />
            <Dialog speaker="Presentatore" text="Ottimo. Allora, Alessia oggi ci fai viaggiare un pochino per il mondo." />
            <Dialog speaker="Alessia" text="Esatto." />

            <ChapterHeading id="chi-siamo" number={1} title="Chi è MishaTravel" />

            <Dialog speaker="Presentatore" text="Perché raccontiamo un pochino com'è nata, insomma, la tua realtà, perché tu sei un agente di viaggio." />
            <Dialog speaker="Alessia" text="Esatto, sì." />
            <Dialog speaker="Presentatore" text="Quindi oggi andiamo a parlare di Misha Travel, giusto?" />
            <Dialog speaker="Alessia" text="Esatto. Noi siamo un'agenzia viaggi e tour operator a Genova, in Liguria. Siamo specializzati sia nei viaggi individuali che nei viaggi di gruppo. La nostra agenzia opera in Liguria da oltre 40 anni. Nel 2018 poi abbiamo avviato una collaborazione con un tour operator spagnolo che è proprio la Crucemundo, da cui nasce il nostro nuovo nome, e siamo appunto specializzati in crociere fluviali, che è il nostro settore di nicchia. Abbiamo le nostre navi di proprietà e poi abbiamo ovviamente partenze garantite e viaggi in tutto il mondo." />

            <ChapterHeading id="crociere-fluviali" number={2} title="Le crociere fluviali su Danubio, Reno e Douro" />

            <Dialog speaker="Presentatore" text="Diamo magari qualche esempio di crociera fluviale. Cioè, se qualcuno magari, come posso dire, non è particolarmente avvezzo ai viaggi e quindi, caspita, ascolta queste due parole e dice: «Mi potrebbe interessare ma non so che cos'è». Gli raccontiamo un pochino di che cosa si tratta?" />
            <Dialog speaker="Alessia" text="Sì. Abbiamo queste crociere che viaggiano appunto sul Danubio, sul Reno e sul Douro, che parte dal Portogallo e arriva in Spagna. Sono navi molto più piccole rispetto alle grandi crociere a cui siamo abituati — e giustamente, d'altronde anche i fiumi sono più vicini, sono più piccoli. Sono adatte a qualsiasi tipologia di clientela, dai più giovani alle persone più adulte. Si viaggia solitamente la notte, la mattina si arriva e si attracca direttamente al porto, che solitamente è molto vicino alla città. Si possono fare escursioni individuali o acquistate a bordo, o direttamente da noi in agenzia." />

            <PullQuote text="Si possono vedere città dove con una crociera più grande non si può arrivare." />

            <Dialog speaker="Alessia" text="E la differenza rispetto a una crociera normale è che si possono vedere altre città dove con una crociera più grande non si può arrivare." />
            <Dialog speaker="Presentatore" text="Certo, è vero. Sicuramente questo è un aspetto particolare ed importante, proprio perché magari andiamo anche a scoprire città che non sono così particolarmente turistiche, ma sono altrettanto belle." />
            <Dialog speaker="Alessia" text="Quello sì. E poi durante la navigazione comunque si vedono anche altri panorami. Ci si può avvicinare di più a certi panorami e quindi è un vero spettacolo." />

            <Dialog speaker="Presentatore" text="Beh, immagino che comunque anche tu sia un'appassionata di viaggi. C'è stato magari qualche viaggio che è stato per te il tuo preferito, che vorresti consigliare?" />
            <Dialog speaker="Alessia" text="Beh, sicuramente uno dei più belli che ho fatto, oltre alle crociere — che ne ho fatte molte, sia come viaggi di gruppo che individualmente — il safari in Africa è stato uno dei più belli che ho fatto. E poi un po' in tutto il mondo, mi piace viaggiare e scoprire nuove culture, quindi… cittadina del mondo proprio!" />

            <ChapterHeading id="viaggi-gruppo" number={3} title="I viaggi di gruppo: come funzionano davvero" />

            <Dialog speaker="Presentatore" text="E tu hai citato un aspetto molto importante che è quello appunto dei viaggi di gruppo. Che cosa sono? Cioè, li raccontiamo un pochino?" />
            <Dialog speaker="Alessia" text="Allora, noi come agenzia siamo appunto specializzati anche in questi viaggi di gruppo. Sono viaggi dove normalmente noi non lavoriamo con grandi gruppi, quindi 50-60 persone — anche se è capitato quello — ma solitamente rimaniamo sulla ventina di persone. Sono viaggi dove c'è sempre un accompagnatore nostro dell'agenzia che accompagna; io personalmente accompagno questi gruppi. E la differenza è che io mi occupo proprio, seguo tutto il gruppo dall'inizio alla fine. Quindi mi occupo di prenotare gli hotel, i trasferimenti… La differenza magari nel fare un altro viaggio con altri tour operator o altre persone è che noi ti seguiamo dall'inizio alla fine, nel pre e post-vendita. Qualunque problema, abbiamo appunto un nostro assistente direttamente con i clienti, quindi possono essere tranquilli e viaggiare in sicurezza senza dover pensare a nulla." />

            <Dialog speaker="Presentatore" text="Certo, proprio solo presentarsi all'orario di partenza in aeroporto. Che direi, insomma, che non è così scontato, proprio perché è bello affidarsi a persone estremamente competenti e quindi non dover pensare a nulla. Però ti volevo chiedere: viaggi di gruppo, ma le persone in questi viaggi di gruppo già si conoscono, può essere un'occasione… come funziona?" />
            <Dialog speaker="Alessia" text="No, può essere un'occasione per conoscere anche persone nuove. Molto spesso abbiamo persone che viaggiano anche da sole. Quindi magari per paura di partire da sole, arrivare in una città che non conoscono e trovarsi anche un po' spaesati se non sono abituati, si affidano appunto a noi a questi viaggi di gruppo e molto spesso incontrano nuove amicizie che nascono proprio da questi viaggi. Quindi è un po' il bello di viaggiare con altre persone sconosciute." />
            <Dialog speaker="Presentatore" text="È interessante, insomma, anche questo aspetto. Infatti ci tenevo a raccontarlo proprio per dare magari anche spunto a chi…" />
            <Dialog speaker="Alessia" text="Infatti la cosa bella è — ci tengo appunto a dire — che tanti pensano al viaggio di gruppo come un viaggio magari che attrae più le persone diciamo un po' più avanti con l'età. In realtà abbiamo molti giovani anche che si affidano a noi per fare questi viaggi di gruppo, perché è un'occasione anche per rimanere tutti insieme, magari amici in gruppo che vogliono viaggiare, o gente che vuole viaggiare da sola e conoscere nuove persone. Quindi è un'ottima idea di viaggio anche per i giovani." />
            <Dialog speaker="Presentatore" text="Certo. Anche perché magari, diciamo nella cerchia di amicizie, non a tutti si riesce ad avere le ferie sempre nello stesso periodo, quindi può essere una bella idea per dire: «Beh, io voglio andare via in quella data e quindi vado. Con chi vado non lo so, ma lo scopriamo strada facendo»." />

            <ChapterHeading id="mete" number={4} title="Le mete consigliate: Uzbekistan, safari, Asia" />

            <Dialog speaker="Presentatore" text="Sempre magari parlando invece dell'agenzia, io ti ho chiesto prima qual era il viaggio tuo personale che ti ha colpito di più. Invece quello diciamo da parte dell'agenzia, come viaggio dell'agenzia?" />
            <Dialog speaker="Alessia" text="Vabbè, le crociere… poi l'Uzbekistan. Noi facciamo molti viaggi anche in Cina." />
            <Dialog speaker="Presentatore" text="Oh sì, in Cina! In Asia, quindi." />
            <Dialog speaker="Alessia" text="Sì, in Asia. Quindi l'Uzbekistan è stata una destinazione dove si può mettere insieme la cultura del posto addentrandosi anche un po' in avventure che normalmente non si farebbero, come dormire nelle yurte, fare tipologie di escursioni che magari uno non farebbe mai. Quindi, almeno una volta nella vita, la consiglio di provarla. Assolutamente sì." />

            <ChapterHeading id="trend-europa" number={5} title="Il trend del momento: riscoprire l'Europa" />

            <Dialog speaker="Presentatore" text="E invece ti volevo chiedere per quanto riguarda magari le tendenze. Perché spesso si è parlato di turismo consapevole, quindi magari cercare di trovare anche altre mete rispetto magari a quelle classiche che giustamente rimangono sempre bellissime, però andare un pochino di più per la scoperta del mondo. C'è magari qualche paese ad oggi che noti che le persone stanno riscoprendo?" />
            <Dialog speaker="Alessia" text="Allora, adesso, visto un po' anche il periodo e tutto, stanno rivalutando tanto l'Europa, che in realtà prima si pensava al viaggio di più giorni come a un viaggio in cui «voglio cambiare continente». Ma in realtà, anche quando parliamo di queste crociere fluviali che tanta gente non le conosce, rimangono poi affascinati e incuriositi anche dal volere provare questa nuova avventura. Perché si pensa sempre alla crociera come la classica che ti fa il Mediterraneo o ti fa magari i fiordi, invece può essere un nuovo modo per vedere l'Europa sotto un altro punto di vista." />

            <PullQuote text="Un nuovo modo per vedere l'Europa sotto un altro punto di vista." />

            <ChapterHeading id="valore-agenzia" number={6} title="Perché affidarsi a un'agenzia" />

            <Dialog speaker="Presentatore" text="Qui concludiamo un pochino con il messaggio di far capire l'importanza di affidarsi a dei professionisti e anche cosa vuol dire quando ci si mette nelle mani di professionisti, però con viaggi di gruppo, ecco. Quindi c'è una certezza, c'è una sicurezza." />
            <Dialog speaker="Alessia" text="Certo, c'è sicuramente una maggiore sicurezza sia come viaggi di gruppo ma anche come viaggi individuali, perché abbiamo molti clienti che viaggiano individualmente e si affidano a noi. Voglio un po' sfatare il mito della cosa «mi affido a un'agenzia, pago di più, quindi faccio da solo». In realtà non è vero. Noi ovviamente avendo l'esperienza sappiamo consigliare. Molto spesso proviamo direttamente le strutture e i resort che consigliamo ai nostri clienti, quindi…" />
            <Dialog speaker="Presentatore" text="Esatto!" />
            <Dialog speaker="Alessia" text="…ci piace sempre avere una sicurezza prima di mandare i clienti in una destinazione." />
            <Dialog speaker="Presentatore" text="Certo, però come dici tu, questo vi dà proprio l'esperienza di affidare le persone a una struttura che voi conoscete molto bene." />
            <Dialog speaker="Alessia" text="Certo. E poi è sempre un feedback positivo, quindi questo è la nostra soddisfazione più grande alla fine." />

            <ChapterHeading id="copertura" number={7} title="Non solo Genova: copertura nazionale" />

            <Dialog speaker="Presentatore" text="E mi raccontavi che voi siete a Genova, giusto?" />
            <Dialog speaker="Alessia" text="A Genova, sì." />
            <Dialog speaker="Presentatore" text="Da voi arrivano solo persone nel territorio limitrofo?" />
            <Dialog speaker="Alessia" text="No, noi essendo appunto un tour operator lavoriamo anche con altre agenzie, quindi abbiamo clienti un po' da tutta Italia che spesso si affidano a noi, soprattutto per queste crociere." />

            <Dialog speaker="Presentatore" text="Oh, perfetto. E vorrei concludere questa chiacchierata rimarcando un pochino questo messaggio del viaggio «fatto fai da te». Quindi con un'agenzia qual è il valore aggiunto?" />
            <Dialog speaker="Alessia" text="Il valore aggiunto è che hai la sicurezza che, qualunque problema, ci chiami e noi siamo sempre operativi. C'è sempre un referente attivo 24 ore su 24 che ti può assistere per qualunque problematica. Non so, sei prenotato all'aeroporto e non lo trovi? Ci chiami e noi ti aiutiamo sempre. Nei festivi, anche, in qualunque momento. E poi ovviamente hai la sicurezza che se tu prenoti un albergo o un villaggio, lo trovi effettivamente, non come spesso si sentono queste truffe su internet che magari uno paga e poi arriva… e tu ad arrivarci ci sei arrivato, e poi la struttura chi lo sa!" />

            <Dialog speaker="Presentatore" text="Va bene. Senti, ti ringrazio tantissimo per averci parlato della vostra realtà e secondo me ci siamo riuscite un pochino a far venir voglia di viaggiare ai nostri ascoltatori. Allora Alessia, io ti ringrazio." />
            <Dialog speaker="Alessia" text="Grazie a te." />
            <Dialog speaker="Presentatore" text="Alessia grazie mille, un saluto a te e ai nostri ascoltatori. Ciao!" />
            <Dialog speaker="Alessia" text="Ciao, ciao a tutti. E vi aspettiamo tutti! Per qualunque informazione potete contattarci, abbiamo tutti i preventivi, tutte le richieste… Speriamo di potervi aiutare." />
          </div>
        </div>
      </article>

      {/* ============================================
          CTA finale
          ============================================ */}
      <section className="bg-gradient-to-br from-[#C41E2F] to-[#A31825] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-bold text-white md:text-4xl">
              Vuoi scoprire le nostre crociere fluviali?
            </h2>
            <p className="mt-4 text-base text-white/90 md:text-lg">
              Danubio, Reno, Douro e altri fiumi europei con navi di proprietà MishaTravel.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/crociere"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 font-semibold text-[#C41E2F] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Vedi le crociere
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contatti"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#C41E2F]"
              >
                Richiedi un preventivo
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

function Dialog({ speaker, text }: { speaker: "Presentatore" | "Alessia"; text: string }) {
  const isAlessia = speaker === "Alessia";
  return (
    <div className={`mb-5 flex gap-4 ${isAlessia ? "flex-row-reverse text-right" : ""}`}>
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase tracking-wider ${
          isAlessia
            ? "bg-[#C41E2F] text-white"
            : "bg-gray-200 text-gray-700"
        }`}
        aria-hidden="true"
      >
        {isAlessia ? "A" : "P"}
      </div>
      <div className="flex-1">
        <span
          className={`text-[11px] font-semibold uppercase tracking-widest ${
            isAlessia ? "text-[#C41E2F]" : "text-gray-500"
          }`}
        >
          {isAlessia ? "Alessia Cardone" : "Storytime"}
        </span>
        <p
          className={`mt-1 text-base leading-relaxed text-gray-700 md:text-[17px] ${
            isAlessia ? "font-medium" : ""
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function ChapterHeading({
  id,
  number,
  title,
}: {
  id: string;
  number: number;
  title: string;
}) {
  return (
    <div id={id} className="my-12 scroll-mt-20 border-l-4 border-[#C41E2F] pl-5">
      <span className="text-xs font-semibold uppercase tracking-widest text-[#C41E2F]">
        Capitolo {number}
      </span>
      <h3 className="mt-1 font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#1B2D4F] md:text-3xl">
        {title}
      </h3>
    </div>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <div className="my-10 rounded-2xl bg-gradient-to-br from-[#1B2D4F] to-[#0f1d36] p-8 text-center shadow-xl md:p-10">
      <Quote className="mx-auto size-10 text-[#C41E2F]" />
      <p className="mt-4 font-[family-name:var(--font-poppins)] text-xl font-bold leading-snug text-white md:text-2xl">
        {text}
      </p>
    </div>
  );
}
