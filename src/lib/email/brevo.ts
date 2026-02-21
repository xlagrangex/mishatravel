/**
 * Brevo (Sendinblue) transactional email service.
 *
 * Uses the Brevo HTTP API v3 directly with fetch (no SDK required).
 * All email sending is non-blocking: errors are logged but never thrown
 * so that the calling server action is not interrupted.
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";
const SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL ?? "noreply@mishatravel.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "MishaTravel";
const ADMIN_EMAIL =
  process.env.BREVO_ADMIN_EMAIL ?? "info@mishatravel.com";

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export { ADMIN_EMAIL, SENDER_EMAIL };

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
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
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
 * Convenience: send an email to the admin address.
 */
export async function sendAdminNotification(
  subject: string,
  htmlContent: string
): Promise<boolean> {
  return sendTransactionalEmail(
    { email: ADMIN_EMAIL, name: "MishaTravel Admin" },
    subject,
    htmlContent
  );
}
