/**
 * Brevo (Sendinblue) transactional email service.
 *
 * Uses the Brevo HTTP API v3 directly with fetch (no SDK required).
 * All email sending is non-blocking: errors are logged but never thrown
 * so that the calling server action is not interrupted.
 *
 * Email settings (sender, admin email) are read from the `site_settings`
 * DB table at runtime, with environment variables as fallback.
 */

import { getSettingsMap } from '@/lib/supabase/queries/settings'

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";

// Environment variable fallbacks (used when DB has no value)
const ENV_SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL ?? "noreply@mishatravel.com";
const ENV_SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "MishaTravel";
const ENV_ADMIN_EMAIL =
  process.env.BREVO_ADMIN_EMAIL ?? "info@mishatravel.com";

// Backward-compatible exports (static fallback values)
export const ADMIN_EMAIL = ENV_ADMIN_EMAIL;
export const SENDER_EMAIL = ENV_SENDER_EMAIL;

// ---------------------------------------------------------------------------
// Dynamic settings loader
// ---------------------------------------------------------------------------

async function getEmailSettings() {
  try {
    const settings = await getSettingsMap();
    return {
      senderEmail: settings.sender_email || ENV_SENDER_EMAIL,
      senderName: settings.sender_name || ENV_SENDER_NAME,
      adminEmails: settings.admin_notification_emails || ENV_ADMIN_EMAIL,
    };
  } catch {
    return {
      senderEmail: ENV_SENDER_EMAIL,
      senderName: ENV_SENDER_NAME,
      adminEmails: ENV_ADMIN_EMAIL,
    };
  }
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Send a transactional email via the Brevo API.
 *
 * @returns `true` if the API responded with 2xx, `false` otherwise.
 *          Never throws -- errors are logged to console.
 */
export async function sendTransactionalEmail(
  to: EmailRecipient | EmailRecipient[],
  subject: string,
  htmlContent: string
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn(
      "[Brevo] BREVO_API_KEY is not set -- skipping email send."
    );
    return false;
  }

  const { senderEmail, senderName } = await getEmailSettings();
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: recipients.map((r) => ({
          email: r.email,
          ...(r.name ? { name: r.name } : {}),
        })),
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `[Brevo] Failed to send email "${subject}" to ${recipients
          .map((r) => r.email)
          .join(", ")}. Status ${response.status}: ${body}`
      );
      return false;
    }

    console.log(
      `[Brevo] Email "${subject}" sent to ${recipients
        .map((r) => r.email)
        .join(", ")}`
    );
    return true;
  } catch (err) {
    console.error(`[Brevo] Network error sending email "${subject}":`, err);
    return false;
  }
}

/**
 * Convenience: send an email to the admin address(es).
 * Reads admin emails from site_settings (supports comma-separated addresses).
 */
export async function sendAdminNotification(
  subject: string,
  htmlContent: string
): Promise<boolean> {
  const { adminEmails } = await getEmailSettings();
  const emails = adminEmails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const recipients = emails.map((email) => ({
    email,
    name: "MishaTravel Admin",
  }));
  return sendTransactionalEmail(recipients, subject, htmlContent);
}
