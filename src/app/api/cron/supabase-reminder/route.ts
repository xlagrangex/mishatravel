import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/brevo";

// Vercel Cron runs this daily at 9:00 AM Rome time (7:00 UTC)
// We only actually send emails on specific dates before May 9th

const RECIPIENTS = [
  { email: "vincenzopetronebiz@gmail.com", name: "Vincenzo" },
  { email: "vincenzopetrone3000@gmail.com", name: "Vincenzo" },
];

const DEADLINE = new Date("2025-05-09"); // May 9 — Supabase Pro renewal

type Reminder = {
  daysBeforeDeadline: number;
  subject: string;
  html: string;
};

const REMINDERS: Reminder[] = [
  {
    daysBeforeDeadline: 8, // May 1
    subject: "Ehi Vincenzo, promemoria gentile su Supabase Pro",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 12px;">
        <h1 style="color: #1B2D4F; font-size: 24px;">Ciao Vincenzo!</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Questo è un promemoria gentile: il piano <strong>Supabase Pro</strong> di MishaTravel si rinnova il <strong>9 maggio</strong>.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hai ancora tempo, ma magari dai un'occhiata all'egress nella dashboard per verificare che il fix funzioni.
        </p>
        <p style="font-size: 14px; color: #888;">Mancano 8 giorni. Tranquillo, per ora.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 5, // May 4
    subject: "Vincenzo, ti ricordo Supabase... non fare il furbo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #fff3cd; border-radius: 12px; border: 2px solid #ffc107;">
        <h1 style="color: #856404; font-size: 24px;">Ancora qui?</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Mancano <strong>5 giorni</strong> al rinnovo di Supabase Pro. $25 che potresti spendere in pizza.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Vai su <strong>Supabase Dashboard → Organization → Billing</strong> e controlla l'egress. Se è sotto controllo, fai il downgrade!
        </p>
        <p style="font-size: 14px; color: #856404;">Non costringermi a mandare un'altra email...</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 3, // May 6
    subject: "VINCENZO. SUPABASE. DISDICI. ORA.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #ffe0e0; border-radius: 12px; border: 3px solid #C41E2F;">
        <h1 style="color: #C41E2F; font-size: 28px;">Ma dico, stai scherzando?!</h1>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Mancano <strong>3 GIORNI</strong> e ancora non hai disdetto il piano Pro di Supabase per MishaTravel!
        </p>
        <p style="font-size: 18px; color: #C41E2F; font-weight: bold; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 15px 0;">
          $25 buttati = 2 pizze + birra
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          VAI. ADESSO. Supabase Dashboard → Organization → Billing → Downgrade.
        </p>
        <p style="font-size: 14px; color: #C41E2F; font-weight: bold;">La prossima email sarà PEGGIO.</p>
      </div>
    `,
  },
  {
    daysBeforeDeadline: 1, // May 8
    subject: "ULTIMO AVVISO: DOMANI TI SCALANO $25 PER SUPABASE",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #C41E2F; border-radius: 12px;">
        <h1 style="color: white; font-size: 32px; text-align: center;">DOMANI.</h1>
        <h2 style="color: white; font-size: 20px; text-align: center;">$25 VOLANO VIA.</h2>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0;">
            Vincenzo, questa è l'ULTIMA email. Domani 9 maggio Supabase rinnova il piano Pro a $25/mese.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 10px;">
            Se non disdici OGGI, paghi un altro mese per niente.
          </p>
          <p style="font-size: 18px; color: #C41E2F; font-weight: bold; margin-top: 15px; text-align: center;">
            Supabase Dashboard → Organization → Billing → DOWNGRADE TO FREE
          </p>
        </div>
        <p style="color: white; font-size: 14px; text-align: center; margin-top: 15px;">
          Se domani vedo che hai ancora il Pro, giuro che ti mando un'email ogni ORA.
        </p>
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
  today.setHours(0, 0, 0, 0);

  const deadlineCopy = new Date(DEADLINE);
  deadlineCopy.setHours(0, 0, 0, 0);

  const diffMs = deadlineCopy.getTime() - today.getTime();
  const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Past deadline — no more reminders needed
  if (daysLeft <= 0) {
    return NextResponse.json({ message: "Past deadline, no reminder sent", daysLeft });
  }

  // Check if today matches a reminder
  const reminder = REMINDERS.find((r) => r.daysBeforeDeadline === daysLeft);
  if (!reminder) {
    return NextResponse.json({ message: "No reminder today", daysLeft });
  }

  const sent = await sendTransactionalEmail(RECIPIENTS, reminder.subject, reminder.html);

  return NextResponse.json({
    sent,
    daysLeft,
    subject: reminder.subject,
  });
}
