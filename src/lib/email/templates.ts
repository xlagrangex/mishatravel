/**
 * HTML email templates for MishaTravel transactional emails.
 *
 * Every template function returns a fully self-contained HTML string
 * wrapped in the brand layout (header with logo, footer with contacts).
 *
 * Brand colours:
 *   Primary (red)  : #C41E2F
 *   Secondary (navy): #1B2D4F
 */

// ---------------------------------------------------------------------------
// Base wrapper
// ---------------------------------------------------------------------------

function baseTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MishaTravel</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1B2D4F;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:1px;">
                MishaTravel
              </h1>
              <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;letter-spacing:0.5px;">Tour Operator</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#64748b;line-height:1.6;">
                    <strong style="color:#1B2D4F;">MishaTravel S.r.l.</strong><br/>
                    Tel: +39 02 1234567 | Email: info@mishatravel.com<br/>
                    www.mishatravel.com
                  </td>
                </tr>
                <tr>
                  <td style="font-size:11px;color:#94a3b8;padding-top:12px;">
                    Questa email &egrave; stata inviata automaticamente. Per assistenza contattaci a info@mishatravel.com.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** A styled CTA button */
function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#C41E2F;border-radius:6px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mishatravel.com";

// ---------------------------------------------------------------------------
// 1. Authentication emails
// ---------------------------------------------------------------------------

/**
 * Welcome email sent to the agency after successful registration.
 */
export function welcomeAgencyEmail(agencyName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Benvenuto su MishaTravel!</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Grazie per aver completato la registrazione su MishaTravel. Il tuo account &egrave; stato creato con successo.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il nostro team verificher&agrave; i tuoi dati e approver&agrave; il tuo account nel pi&ugrave; breve tempo possibile.
      Riceverai un&rsquo;email di conferma non appena il tuo account sar&agrave; attivo.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Nel frattempo, puoi esplorare i nostri tour e crociere sul sito.
    </p>
    ${ctaButton("Esplora i nostri viaggi", SITE_URL)}
    <p style="color:#64748b;font-size:13px;margin-top:24px;">
      Se non hai effettuato tu questa registrazione, puoi ignorare questa email.
    </p>
  `);
}

/**
 * Email sent when the admin approves an agency account.
 */
export function agencyApprovedEmail(agencyName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Account approvato!</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Siamo lieti di comunicarti che il tuo account su MishaTravel &egrave; stato <strong style="color:#16a34a;">approvato</strong>.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Puoi ora accedere all&rsquo;area riservata e iniziare a richiedere preventivi per i tuoi clienti.
    </p>
    ${ctaButton("Accedi alla tua area", `${SITE_URL}/login`)}
    <p style="color:#64748b;font-size:13px;margin-top:24px;">
      Per qualsiasi domanda, non esitare a contattarci.
    </p>
  `);
}

// ---------------------------------------------------------------------------
// 2. Quote flow emails (to Agency)
// ---------------------------------------------------------------------------

/**
 * Confirmation that a quote request was submitted successfully.
 */
export function quoteRequestSubmittedEmail(
  agencyName: string,
  productName: string,
  requestType: string,
  quoteId: string
): string {
  const typeLabel = requestType === "tour" ? "tour" : "crociera";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Richiesta preventivo inviata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      La tua richiesta di preventivo per il ${typeLabel} <strong>&ldquo;${productName}&rdquo;</strong> &egrave; stata ricevuta con successo.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="background-color:#f1f5f9;border-radius:6px;padding:16px;">
          <p style="margin:0;font-size:13px;color:#64748b;">Numero richiesta</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1B2D4F;">${quoteId.slice(0, 8).toUpperCase()}</p>
        </td>
      </tr>
    </table>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il nostro team esaminer&agrave; la tua richiesta e ti invieremo un&rsquo;offerta il prima possibile.
    </p>
    ${ctaButton("Vedi le tue richieste", `${SITE_URL}/agenzia/richieste`)}
  `);
}

/**
 * Notification that a new offer has been received for a quote request.
 */
export function newOfferReceivedEmail(
  agencyName: string,
  productName: string,
  totalPrice: number,
  offerExpiry: string | null
): string {
  const expiryNote = offerExpiry
    ? `<p style="color:#334155;font-size:15px;line-height:1.7;">
        L&rsquo;offerta &egrave; valida fino al <strong>${offerExpiry}</strong>.
      </p>`
    : "";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Nuova offerta ricevuta</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Abbiamo preparato un&rsquo;offerta per la tua richiesta relativa a <strong>&ldquo;${productName}&rdquo;</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="background-color:#f0fdf4;border-radius:6px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#64748b;">Prezzo totale</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#16a34a;">&euro; ${totalPrice.toFixed(2)}</p>
        </td>
      </tr>
    </table>
    ${expiryNote}
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Accedi alla tua area riservata per visualizzare i dettagli completi e accettare o rifiutare l&rsquo;offerta.
    </p>
    ${ctaButton("Vedi l'offerta", `${SITE_URL}/agenzia/offerte`)}
  `);
}

/**
 * Confirmation that the agency accepted an offer.
 */
export function offerAcceptedConfirmationEmail(
  agencyName: string,
  productName: string
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Offerta accettata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      La tua accettazione dell&rsquo;offerta per <strong>&ldquo;${productName}&rdquo;</strong> &egrave; stata registrata con successo.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      A breve riceverai gli estremi per effettuare il pagamento. Controlla la tua area riservata per aggiornamenti.
    </p>
    ${ctaButton("Vedi le tue richieste", `${SITE_URL}/agenzia/richieste`)}
  `);
}

/**
 * Payment details sent by admin to the agency.
 */
export function paymentDetailsSentEmail(
  agencyName: string,
  productName: string,
  bankDetails: string,
  amount: number,
  reference: string
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Estremi di pagamento</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Di seguito trovi gli estremi per effettuare il pagamento relativo a <strong>&ldquo;${productName}&rdquo;</strong>:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">IBAN</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;font-weight:600;">${bankDetails}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Importo</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;font-weight:600;">&euro; ${amount.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;">Causale</td>
        <td style="padding:12px 16px;font-size:14px;color:#1B2D4F;font-weight:600;">${reference}</td>
      </tr>
    </table>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Una volta effettuato il pagamento, il nostro team provveder&agrave; a confermare la prenotazione.
    </p>
    ${ctaButton("Vedi dettagli", `${SITE_URL}/agenzia/richieste`)}
  `);
}

/**
 * Quote rejected by admin.
 */
export function quoteRejectedEmail(
  agencyName: string,
  productName: string,
  motivation: string
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#C41E2F;font-size:22px;">Richiesta non confermata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Purtroppo la tua richiesta per <strong>&ldquo;${productName}&rdquo;</strong> non &egrave; stata confermata.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="background-color:#fef2f2;border-radius:6px;padding:16px;border-left:4px solid #C41E2F;">
          <p style="margin:0;font-size:13px;color:#64748b;">Motivazione</p>
          <p style="margin:8px 0 0;font-size:14px;color:#334155;line-height:1.6;">${motivation}</p>
        </td>
      </tr>
    </table>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Per ulteriori informazioni o per esplorare altre opzioni, non esitare a contattarci.
    </p>
    ${ctaButton("Esplora i nostri viaggi", SITE_URL)}
  `);
}

// ---------------------------------------------------------------------------
// 3. Admin notification emails
// ---------------------------------------------------------------------------

/**
 * Notify admin: new agency registered.
 */
export function adminNewAgencyEmail(
  agencyName: string,
  contactName: string | null,
  email: string,
  city: string | null
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Nuova agenzia registrata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Una nuova agenzia si &egrave; registrata sulla piattaforma e richiede l&rsquo;approvazione.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Ragione Sociale</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;font-weight:600;">${agencyName}</td>
      </tr>
      ${contactName ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Referente</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;">${contactName}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;">${email}</td>
      </tr>
      ${city ? `<tr>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;">Citta</td>
        <td style="padding:12px 16px;font-size:14px;color:#1B2D4F;">${city}</td>
      </tr>` : ""}
    </table>
    ${ctaButton("Gestisci agenzie", `${SITE_URL}/admin/agenzie`)}
  `);
}

/**
 * Notify admin: new quote request received.
 */
export function adminNewQuoteRequestEmail(
  agencyName: string,
  productName: string,
  requestType: string,
  quoteId: string,
  adults: number,
  children: number
): string {
  const typeLabel = requestType === "tour" ? "Tour" : "Crociera";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#1B2D4F;font-size:22px;">Nuova richiesta preventivo</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      L&rsquo;agenzia <strong>${agencyName}</strong> ha inviato una nuova richiesta di preventivo.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Tipo</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;font-weight:600;">${typeLabel}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Prodotto</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;">${productName}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Partecipanti</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1B2D4F;">${adults} adulti, ${children} bambini</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;">ID Richiesta</td>
        <td style="padding:12px 16px;font-size:14px;color:#1B2D4F;font-family:monospace;">${quoteId.slice(0, 8).toUpperCase()}</td>
      </tr>
    </table>
    ${ctaButton("Gestisci preventivi", `${SITE_URL}/admin/preventivi`)}
  `);
}

/**
 * Notify admin: offer accepted by agency.
 */
export function adminOfferAcceptedEmail(
  agencyName: string,
  productName: string,
  quoteId: string
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#16a34a;font-size:22px;">Offerta accettata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      L&rsquo;agenzia <strong>${agencyName}</strong> ha accettato l&rsquo;offerta per <strong>&ldquo;${productName}&rdquo;</strong>.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Procedi con l&rsquo;invio degli estremi di pagamento.
    </p>
    ${ctaButton("Gestisci il preventivo", `${SITE_URL}/admin/preventivi/${quoteId}`)}
  `);
}

/**
 * Notify admin: offer declined by agency.
 */
export function adminOfferDeclinedEmail(
  agencyName: string,
  productName: string,
  quoteId: string,
  motivation?: string
): string {
  const motivationBlock = motivation
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="background-color:#fef2f2;border-radius:6px;padding:16px;border-left:4px solid #C41E2F;">
          <p style="margin:0;font-size:13px;color:#64748b;">Motivazione</p>
          <p style="margin:8px 0 0;font-size:14px;color:#334155;line-height:1.6;">${motivation}</p>
        </td>
      </tr>
    </table>`
    : "";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#C41E2F;font-size:22px;">Offerta rifiutata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      L&rsquo;agenzia <strong>${agencyName}</strong> ha rifiutato l&rsquo;offerta per <strong>&ldquo;${productName}&rdquo;</strong>.
    </p>
    ${motivationBlock}
    ${ctaButton("Gestisci il preventivo", `${SITE_URL}/admin/preventivi/${quoteId}`)}
  `);
}
