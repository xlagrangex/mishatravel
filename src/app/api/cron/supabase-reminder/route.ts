import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/brevo";

// Vercel Cron runs once/day at 9:00 AM Rome time (7:00 UTC).
// On multi-email days (May 5-8), ALL emails for that day are sent at once.

const RECIPIENTS = [
  { email: "vincenzopetronebiz@gmail.com", name: "Vincenzo" },
  { email: "vincenzopetrone3000@gmail.com", name: "Vincenzo" },
];

const DEADLINE = new Date("2025-05-09");

type Reminder = {
  daysBeforeDeadline: number;
  subject: string;
  html: string;
};

const REMINDERS: Reminder[] = [
  // ============ FASE 1: Avvertimenti (1x/giorno, solo mattina) ============
  {
    daysBeforeDeadline: 21, // April 18
    subject: "Vincenzo, segna in agenda: Supabase Pro scade il 9 maggio",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f0f7ff; border-radius: 12px; border: 1px solid #bdd7ff;">
        <h1 style="color: #1B2D4F; font-size: 24px;">Ciao bello!</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Ti scrivo con largo anticipo perché ti conosco: sei un <strong>procrastinatore seriale</strong>.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Il piano <strong>Supabase Pro</strong> di MishaTravel si rinnova il <strong>9 maggio</strong>. Sono $25.
          Lo so che stai già pensando "sì sì lo faccio dopo". NO. Segnalo. Adesso. Nel calendario.
        </p>
        <p style="font-size: 14px; color: #888;">Mancano 21 giorni. Ti tengo d'occhio.</p>
        <p style="font-size: 12px; color: #aaa;">— Il tuo cron job che ti vuole bene</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 17, // April 22
    subject: "Hai segnato la data? No, vero? Lo sapevo.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 12px;">
        <h1 style="color: #1B2D4F; font-size: 24px;">Scommetto che non hai fatto niente</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Ti avevo detto di segnare il 9 maggio nel calendario. L'hai fatto? <strong>Ovviamente no.</strong>
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Sei quella persona che lascia 47 tab aperte nel browser "per dopo". Quel "dopo" non arriva mai, Vincenzo.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Intanto vai su Supabase Dashboard e controlla l'<strong>egress</strong>. Se è sotto i 5 GB sei a posto per il downgrade.
        </p>
        <p style="font-size: 14px; color: #888;">Mancano 17 giorni. Non farmi perdere la pazienza.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 13, // April 26
    subject: "Vincenzo, svegliati. 13 giorni a buttare $25.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #fff8e1; border-radius: 12px; border: 2px solid #ffb300;">
        <h1 style="color: #e65100; font-size: 24px;">Stai dormendo?!</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Quasi due settimane che ti mando email e tu niente. Sei una <strong>merda di procrastinatore</strong>, lo sai?
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Ci vogliono letteralmente <strong>30 secondi</strong>:
        </p>
        <ol style="font-size: 16px; color: #333; line-height: 1.8;">
          <li>Apri Supabase Dashboard</li>
          <li>Organization → Billing</li>
          <li>Controlla egress (deve essere sotto 5 GB)</li>
          <li>Se ok → Downgrade to Free</li>
        </ol>
        <p style="font-size: 16px; color: #333;">30 secondi. Ce la fai? O devo venire lì?</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 10, // April 29
    subject: "Sei incredibile. Nel senso peggiore.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #fce4ec; border-radius: 12px; border: 2px solid #e91e63;">
        <h1 style="color: #c2185b; font-size: 26px;">Ma che problemi hai?</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          10 giorni. Ti ho mandato 3 email. Tre. E tu che fai? <strong>NIENTE.</strong>
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Sei quella persona che dice "lo faccio domani" e poi domani dice "lo faccio domani" e poi si ritrova con un addebito da $25 e dice "ah, me ne ero dimenticato".
        </p>
        <p style="font-size: 20px; color: #c2185b; font-weight: bold; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 15px 0;">
          NON TI DIMENTICARE.<br/>DISDICI SUPABASE PRO.
        </p>
        <p style="font-size: 14px; color: #888;">Se non lo fai, sei ufficialmente una merda. Con affetto.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 8, // May 1
    subject: "1 MAGGIO e tu non disdici neanche Supabase. Merda.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #e8f5e9; border-radius: 12px; border: 2px solid #4caf50;">
        <h1 style="color: #2e7d32; font-size: 24px;">Buon 1 maggio, merdaccia!</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Oggi è festa. Non hai scuse. Hai tempo libero. Usa <strong>30 dei tuoi 86.400 secondi</strong> per disdire Supabase Pro.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Oppure continua a procrastinare come fai sempre, e poi lamentati che "i soldi volano via". Volano via perché SEI PIGRO.
        </p>
        <p style="font-size: 14px; color: #2e7d32; font-weight: bold;">Supabase Dashboard → Organization → Billing → DOWNGRADE.</p>
      </div>
    `,
  },

  // ============ FASE 2: BOMBARDAMENTO (3x/giorno, dal 5 al 8 maggio) ============

  // --- 5 MAGGIO (4 giorni prima) ---
  {
    daysBeforeDeadline: 4,
    subject: "BUONGIORNO MERDA. 4 GIORNI. HAI DISDETTO? NO.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #fff3cd; border-radius: 12px; border: 3px solid #ff8f00;">
        <h1 style="color: #e65100; font-size: 28px;">SVEGLIA VINCENZO!</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Sono le 9 di mattina. Primo pensiero della giornata: <strong>HAI ANCORA SUPABASE PRO ATTIVO.</strong>
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          4 giorni. Sesta email. Sei un caso clinico di procrastinazione. Dovrebbero studiarti all'università.
        </p>
        <p style="font-size: 22px; color: #e65100; font-weight: bold; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 15px 0;">
          $25 = 3 pizze margherita 🍕🍕🍕
        </p>
        <p style="font-size: 14px; color: #e65100;">Da oggi ti scrivo 3 VOLTE AL GIORNO. Preparati.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 4,
    subject: "Pausa pranzo? DISDICI SUPABASE INVECE DI MANGIARE.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #ffe0b2; border-radius: 12px; border: 2px solid #ff6d00;">
        <h1 style="color: #e65100; font-size: 24px;">Stai pranzando?</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Metti giù la forchetta. Prendi il telefono. Apri Supabase. Disdici.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Non meriti di pranzare tranquillo con $25 in ballo. Non sei una persona responsabile finché quel downgrade non è fatto.
        </p>
        <p style="font-size: 16px; color: #e65100; font-weight: bold;">Seconda email di oggi. La terza arriva stasera. Non ti mollo.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 4,
    subject: "Buonanotte? NO. Prima disdici Supabase.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #263238; border-radius: 12px;">
        <h1 style="color: #ffab00; font-size: 24px;">Pensavi di andare a dormire?</h1>
        <p style="font-size: 16px; color: #ccc; line-height: 1.6;">
          Non meriti riposo. Non con Supabase Pro ancora attivo. Terza email di oggi.
        </p>
        <p style="font-size: 16px; color: #ccc; line-height: 1.6;">
          Domani mi sveglio e ti rimando altre 3 email. E dopodomani. E il giorno dopo. Finché non disdici, sei la mia prigione e io sono la tua.
        </p>
        <p style="font-size: 16px; color: #ffab00; font-weight: bold;">DISDICI. POI DORMI. FINE.</p>
      </div>
    `,
  },

  // --- 6 MAGGIO (3 giorni prima) ---
  {
    daysBeforeDeadline: 3,
    subject: "GIORNO 2 DI BOMBARDAMENTO. 3 GIORNI. MERDA AMBULANTE.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #ffebee; border-radius: 12px; border: 3px solid #d32f2f;">
        <h1 style="color: #d32f2f; font-size: 30px;">SEI IMPOSSIBILE.</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          3 giorni. Stai per buttare $25 nel cesso. Come i neuroni che usi per gestire i tuoi abbonamenti: pochi e mal funzionanti.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Tu leggi questa email, pensi "ah sì devo farlo", poi apri Instagram, poi TikTok, poi ti dimentichi. Lo fai SEMPRE.
        </p>
        <div style="background: #d32f2f; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;">
          <p style="font-size: 24px; font-weight: bold; margin: 0;">DISDICI ADESSO</p>
          <p style="font-size: 14px; margin: 5px 0 0;">Supabase → Organization → Billing → Downgrade</p>
        </div>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 3,
    subject: "Sono le 2 e non hai ancora disdetto. Che schifo.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #fce4ec; border-radius: 12px; border: 2px solid #c62828;">
        <h1 style="color: #c62828; font-size: 24px;">Eccomi di nuovo.</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Stamattina ti ho scritto. Non hai fatto niente. Lo so. Lo SENTO.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Sai cosa sei? Sei quello che dice "5 minuti" e poi passano 3 ore. Quello che dice "inizio la dieta lunedì" da 6 anni. Quello che ha Supabase Pro attivo DA UN MESE e non riesce a cliccare UN BOTTONE.
        </p>
        <p style="font-size: 18px; color: #c62828; font-weight: bold; text-align: center;">UN. SINGOLO. BOTTONE. VINCENZO.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 3,
    subject: "Email della sera: TI ODIO (con affetto). 3 GIORNI.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #1a1a2e; border-radius: 12px;">
        <h1 style="color: #e94560; font-size: 26px;">Buonasera, fallimento umano.</h1>
        <p style="font-size: 16px; color: #eee; line-height: 1.6;">
          Un'intera giornata. Mattina, pomeriggio, sera. Tre email. E tu? Niente. Zero. Nada.
        </p>
        <p style="font-size: 16px; color: #eee; line-height: 1.6;">
          Domani mancano 2 giorni. Il tempo stringe. La mia pazienza è finita 4 email fa. Eppure eccomi qui, come un coglione, a scriverti di nuovo.
        </p>
        <p style="font-size: 16px; color: #e94560; font-weight: bold;">Domani sarà peggio. Molto peggio. Disdici e finiscila.</p>
      </div>
    `,
  },

  // --- 7 MAGGIO (2 giorni prima) ---
  {
    daysBeforeDeadline: 2,
    subject: "DOPODOMANI TI SCALANO $25. MUOVI. IL. CULO.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #000; border-radius: 12px;">
        <h1 style="color: #ff1744; font-size: 36px; text-align: center;">2 GIORNI</h1>
        <p style="font-size: 18px; color: white; line-height: 1.6; text-align: center;">
          $25 spariscono dopodomani. Per NIENTE. Perché sei PIGRO.
        </p>
        <p style="font-size: 16px; color: #ccc; line-height: 1.6;">
          Ti ho mandato tipo 12 email. DODICI. Sai chi manda 12 email senza risultato? Un pazzo. E sai chi le ignora? <strong>UNA MERDA COSMICA.</strong>
        </p>
        <div style="background: #ff1744; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; margin: 0;">ISTRUZIONI PER CEREBROLESI:</p>
          <p style="font-size: 20px; font-weight: bold; margin: 10px 0;">1. Apri Supabase<br/>2. Billing<br/>3. Downgrade<br/>4. Conferma</p>
          <p style="font-size: 14px; margin: 0;">Anche un gatto ci riuscirebbe.</p>
        </div>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 2,
    subject: "POMERIGGIO: Ancora Pro? Sei la vergogna della tua famiglia.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #4a0000; border-radius: 12px;">
        <h1 style="color: #ff6b6b; font-size: 24px;">Non ci credo.</h1>
        <p style="font-size: 16px; color: #ffcdd2; line-height: 1.6;">
          È pomeriggio. Stamattina ti ho scritto. Non hai fatto niente. Come SEMPRE.
        </p>
        <p style="font-size: 16px; color: #ffcdd2; line-height: 1.6;">
          Lo sai che procrastinare è una forma di autolesionismo? Stai letteralmente scegliendo di buttare $25 perché sei troppo pigro per muovere 4 click.
        </p>
        <p style="font-size: 16px; color: #ffcdd2; line-height: 1.6;">
          Quattro. Click. QUATTRO. Anche una patata bollita avrebbe già disdetto.
        </p>
        <p style="font-size: 20px; color: #ff6b6b; font-weight: bold; text-align: center;">Sei peggio di una patata bollita.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 2,
    subject: "SERA: Domani è l'ultimo giorno. Sei avvisato, merda.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #0d0d0d; border-radius: 12px; border: 2px solid #ff1744;">
        <h1 style="color: #ff1744; font-size: 28px;">Ultima sera utile.</h1>
        <p style="font-size: 16px; color: #eee; line-height: 1.6;">
          Domani è l'8 maggio. L'ULTIMO GIORNO. Se non disdici domani, il 9 ti scalano $25 e diventi ufficialmente il re dei procrastinatori.
        </p>
        <p style="font-size: 16px; color: #eee; line-height: 1.6;">
          Vuoi questo titolo? Vuoi essere ricordato come quello che ha pagato $25 perché non riusciva a cliccare un bottone? DAVVERO?
        </p>
        <p style="font-size: 16px; color: #ff1744; font-weight: bold; text-align: center;">Domani ti bombardo. Preparati mentalmente.</p>
      </div>
    `,
  },

  // --- 8 MAGGIO (ULTIMO GIORNO) ---
  {
    daysBeforeDeadline: 1,
    subject: "OGGI O MAI PIU. ULTIME ORE. SVEGLIATI MERDA.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 0;">
        <div style="background: #d32f2f; padding: 30px; text-align: center;">
          <h1 style="color: white; font-size: 48px; margin: 0; letter-spacing: 4px;">OGGI.</h1>
          <p style="color: white; font-size: 22px; margin: 10px 0 0;">ULTIMO GIORNO. $25 SPARISCONO DOMANI.</p>
        </div>
        <div style="background: white; padding: 30px; border: 4px solid #d32f2f;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Vincenzo. Ti ho mandato più di 15 email. QUINDICI. Ho perso la dignità, la voce, e la voglia di vivere.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Se stasera il piano è ancora Pro, sei la persona più merdosa, pigra, procrastinatrice e irrecuperabile che abbia mai avuto la sfortuna di notificare.
          </p>
          <div style="background: #000; color: #ff1744; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 22px; font-weight: bold;">
            SUPABASE → BILLING → DOWNGRADE → FREE<br/>
            <span style="font-size: 16px; color: #fff;">FALLO. ADESSO. NON DOPO. ADESSO.</span>
          </div>
        </div>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 1,
    subject: "POMERIGGIO DELL'8 MAGGIO. HAI DISDETTO? RISPONDI.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: linear-gradient(135deg, #d32f2f, #b71c1c); border-radius: 12px;">
        <h1 style="color: white; font-size: 32px; text-align: center;">MANCANO ORE.</h1>
        <p style="font-size: 18px; color: white; line-height: 1.6; text-align: center;">
          Non giorni. Non settimane. <strong>ORE.</strong>
        </p>
        <p style="font-size: 16px; color: #ffcdd2; line-height: 1.6;">
          Se stai leggendo questa email e non stai contemporaneamente cliccando su "Downgrade", sei un caso perso. Una merda cronica. Un procrastinatore terminale.
        </p>
        <p style="font-size: 16px; color: #ffcdd2; line-height: 1.6;">
          L'ultima email arriva stasera. Poi mi arrendo. E tu paghi. Come sempre.
        </p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 1,
    subject: "ULTIMA EMAIL IN ASSOLUTO. DOMANI PERDI $25. ADDIO.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 0;">
        <div style="background: #000; padding: 40px; text-align: center;">
          <h1 style="color: #ff1744; font-size: 40px; margin: 0;">GAME OVER</h1>
          <p style="color: #666; font-size: 16px; margin: 10px 0 0;">Questa è l'ultima email. Per davvero.</p>
        </div>
        <div style="background: #111; padding: 30px;">
          <p style="font-size: 16px; color: #eee; line-height: 1.6;">
            Vincenzo, abbiamo avuto un bel percorso insieme. Ti ho scritto più di 15 email. Ti ho chiamato merda, pigro, caso umano, patata bollita, vergogna della famiglia, procrastinatore terminale.
          </p>
          <p style="font-size: 16px; color: #eee; line-height: 1.6;">
            E tu hai ignorato tutto. Con costanza. Con dedizione. Con una coerenza che, in fondo, ammiro.
          </p>
          <p style="font-size: 16px; color: #eee; line-height: 1.6;">
            Domani mattina Supabase si prende i tuoi $25. Io ho fatto tutto il possibile. Ho fallito. O meglio: <strong>TU hai fallito</strong>.
          </p>
          <div style="background: #ff1744; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; margin: 0;">ULTIMA CHANCE</p>
            <p style="font-size: 16px; margin: 10px 0 0;">Supabase Dashboard → Organization → Billing → DOWNGRADE TO FREE</p>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
            Con tutto l'odio e l'affetto del mondo,<br/>
            <em>Il tuo cron job che ha perso ogni speranza in te.</em><br/><br/>
            P.S. Se hai già disdetto e stai leggendo questa email ridendo: bravo, merda. Ce l'hai fatta.
          </p>
        </div>
      </div>
    `,
  },
];

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (not random visitors)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const deadlineCopy = new Date(DEADLINE);
  deadlineCopy.setUTCHours(0, 0, 0, 0);

  const diffMs = deadlineCopy.getTime() - today.getTime();
  const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Past deadline — no more reminders needed
  if (daysLeft <= 0) {
    return NextResponse.json({ message: "Past deadline, no reminder sent", daysLeft });
  }

  // Find ALL reminders for today
  const todayReminders = REMINDERS.filter((r) => r.daysBeforeDeadline === daysLeft);

  if (todayReminders.length === 0) {
    return NextResponse.json({ message: "No reminder today", daysLeft });
  }

  // Send ALL emails for today (on bombardment days this means 3 emails at once)
  const results: { subject: string; sent: boolean }[] = [];
  for (const reminder of todayReminders) {
    const sent = await sendTransactionalEmail(RECIPIENTS, reminder.subject, reminder.html);
    results.push({ subject: reminder.subject, sent });
  }

  return NextResponse.json({
    daysLeft,
    emailsSent: results.length,
    results,
  });
}
