/**
 * HTML email templates for MishaTravel transactional emails.
 *
 * Every template function returns a fully self-contained HTML string
 * wrapped in the brand layout (header with logo, footer with contacts).
 *
 * Brand colours:
 *   Primary (red)  : #C41E2F
 *   Text (dark gray): #333333
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
            <td style="background-color:#ffffff;padding:24px 32px;text-align:center;border-bottom:2px solid #C41E2F;">
              <img src="${SITE_URL}/images/logo/logo-logo.png" alt="MishaTravel - Tour Operator" width="200" style="display:block;margin:0 auto;max-width:200px;height:auto;" />
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
                    <strong style="color:#C41E2F;">MishaTravel S.r.l.</strong><br/>
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
 * Email confirmation for new signups (replaces Supabase default email).
 */
export function signupConfirmationEmail(agencyName: string, confirmLink: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Conferma il tuo account</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Grazie per esserti registrato su MishaTravel. Per completare la registrazione,
      conferma il tuo indirizzo email cliccando il pulsante qui sotto:
    </p>
    ${ctaButton("Conferma Email", confirmLink)}
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il link scadr&agrave; tra 24 ore. Dopo la conferma, il nostro team verificher&agrave;
      i tuoi dati e approver&agrave; il tuo account.
    </p>
    <p style="color:#64748b;font-size:13px;margin-top:24px;">
      Se non hai effettuato tu questa registrazione, puoi ignorare questa email.<br/>
      Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br/>
      <a href="${confirmLink}" style="color:#C41E2F;word-break:break-all;">${confirmLink}</a>
    </p>
  `);
}

/**
 * Welcome email sent to the agency after successful registration.
 */
export function welcomeAgencyEmail(agencyName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Benvenuto su MishaTravel!</h2>
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
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Account approvato!</h2>
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

/**
 * Email sent when an admin creates an agency account directly.
 */
export function agencyCreatedByAdminEmail(agencyName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Il tuo account MishaTravel</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il tuo account su MishaTravel &egrave; stato creato dal nostro team ed &egrave; gi&agrave; attivo.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Puoi accedere all&rsquo;area riservata con le credenziali che ti sono state comunicate.
    </p>
    ${ctaButton("Accedi alla tua area", `${SITE_URL}/login`)}
    <p style="color:#64748b;font-size:13px;margin-top:24px;">
      Per qualsiasi domanda, non esitare a contattarci.
    </p>
  `);
}

/**
 * Email sent to admin when an agency uploads a document.
 */
export function adminDocumentUploadedEmail(agencyName: string, agencyId: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Documento caricato</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      L&rsquo;agenzia <strong>${agencyName}</strong> ha caricato la visura camerale.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Verificala nel pannello admin.
    </p>
    ${ctaButton("Verifica documento", `${SITE_URL}/admin/agenzie/${agencyId}`)}
  `);
}

/**
 * Email sent to the agency when admin verifies their visura camerale.
 */
export function agencyDocumentVerifiedEmail(agencyName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Visura camerale verificata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      La tua visura camerale &egrave; stata <strong style="color:#16a34a;">verificata con successo</strong> dal nostro team.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il tuo account &egrave; ora completamente attivo. Puoi accedere all&rsquo;area riservata e iniziare a richiedere preventivi per i tuoi clienti.
    </p>
    ${ctaButton("Vai alla dashboard", `${SITE_URL}/agenzia/dashboard`)}
    <p style="color:#64748b;font-size:13px;margin-top:24px;">
      Per qualsiasi domanda, non esitare a contattarci.
    </p>
  `);
}

/**
 * Email sent when an agency account expires due to missing documents.
 */
export function accountExpiredEmail(agencyName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Account eliminato</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il tuo account su MishaTravel &egrave; stato eliminato perch&eacute; la visura camerale
      non &egrave; stata caricata entro il termine di 7 giorni dalla registrazione.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Puoi registrarti nuovamente in qualsiasi momento.
    </p>
    ${ctaButton("Registrati di nuovo", `${SITE_URL}/registrazione`)}
  `);
}

/**
 * Password reset email with branded template.
 */
export function passwordResetEmail(resetLink: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Recupera la tua password</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Hai richiesto il recupero della password per il tuo account MishaTravel.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Clicca il pulsante qui sotto per impostare una nuova password:
    </p>
    ${ctaButton("Reimposta Password", resetLink)}
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il link scadr&agrave; tra 1 ora. Se non hai richiesto tu il recupero della password, puoi ignorare questa email in sicurezza.
    </p>
    <p style="color:#64748b;font-size:13px;margin-top:24px;">
      Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br/>
      <a href="${resetLink}" style="color:#C41E2F;word-break:break-all;">${resetLink}</a>
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
  quoteId: string,
  previewPriceLabel?: string | null
): string {
  const typeLabel = requestType === "tour" ? "tour" : "crociera";
  const priceBlock = previewPriceLabel
    ? `<tr>
        <td style="padding:8px 16px;font-size:13px;color:#64748b;">Prezzo indicativo</td>
        <td style="padding:8px 16px;font-size:14px;color:#333333;font-weight:600;">${previewPriceLabel}</td>
      </tr>`
    : "";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Richiesta preventivo inviata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      La tua richiesta di preventivo per il ${typeLabel} <strong>&ldquo;${productName}&rdquo;</strong> &egrave; stata ricevuta con successo.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:8px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Numero richiesta</td>
        <td style="padding:8px 16px;border-bottom:1px solid #e2e8f0;font-size:16px;font-weight:600;color:#333333;">${quoteId.slice(0, 8).toUpperCase()}</td>
      </tr>
      ${priceBlock}
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
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Nuova offerta ricevuta</h2>
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
  productName: string,
  participantCount?: number
): string {
  const participantNote = participantCount && participantCount > 0
    ? `<p style="color:#334155;font-size:15px;line-height:1.7;">
        I dati dei <strong>${participantCount} partecipanti</strong> sono stati registrati correttamente.
      </p>`
    : "";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Offerta accettata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      La tua accettazione dell&rsquo;offerta per <strong>&ldquo;${productName}&rdquo;</strong> &egrave; stata registrata con successo.
    </p>
    ${participantNote}
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      A breve riceverai il contratto e le coordinate bancarie per effettuare il pagamento. Controlla la tua area riservata per aggiornamenti.
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
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Estremi di pagamento</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Di seguito trovi gli estremi per effettuare il pagamento relativo a <strong>&ldquo;${productName}&rdquo;</strong>:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">IBAN</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${bankDetails}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Importo</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">&euro; ${amount.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;">Causale</td>
        <td style="padding:12px 16px;font-size:14px;color:#333333;font-weight:600;">${reference}</td>
      </tr>
    </table>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Una volta effettuato il pagamento, il nostro team provveder&agrave; a confermare la prenotazione.
    </p>
    ${ctaButton("Vedi dettagli", `${SITE_URL}/agenzia/richieste`)}
  `);
}

/**
 * Contract + banking details sent by admin to the agency after acceptance.
 */
export function contractSentEmail(
  agencyName: string,
  productName: string,
  iban: string,
  extra?: {
    destinatario?: string | null
    causale?: string | null
    banca?: string | null
    notes?: string | null
  }
): string {
  const rows = [
    `<tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">IBAN</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${iban}</td>
    </tr>`,
  ];
  if (extra?.destinatario) {
    rows.push(`<tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Destinatario</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${extra.destinatario}</td>
    </tr>`);
  }
  if (extra?.banca) {
    rows.push(`<tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Banca</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${extra.banca}</td>
    </tr>`);
  }
  if (extra?.causale) {
    rows.push(`<tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Causale</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${extra.causale}</td>
    </tr>`);
  }
  // Remove border-bottom from last row
  const lastRow = rows[rows.length - 1];
  rows[rows.length - 1] = lastRow.replace(/border-bottom:1px solid #e2e8f0;/g, '');

  const notesBlock = extra?.notes
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="background-color:#f8fafc;border-radius:6px;padding:16px;border-left:4px solid #e2e8f0;">
          <p style="margin:0;font-size:13px;color:#64748b;">Note</p>
          <p style="margin:8px 0 0;font-size:14px;color:#334155;line-height:1.6;">${extra.notes.replace(/\n/g, "<br/>")}</p>
        </td>
      </tr>
    </table>`
    : "";

  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Contratto e dati di pagamento</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Il contratto per <strong>&ldquo;${productName}&rdquo;</strong> &egrave; pronto. In allegato trovi il documento contrattuale.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Di seguito i dati per effettuare il bonifico:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      ${rows.join("\n")}
    </table>
    ${notesBlock}
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Accedi alla tua area riservata per scaricare il contratto completo e procedere con il pagamento.
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

/**
 * Offer revoked by tour operator.
 */
export function offerRevokedEmail(
  agencyName: string,
  productName: string
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#C41E2F;font-size:22px;">Offerta revocata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Ti informiamo che l&rsquo;offerta relativa a <strong>&ldquo;${productName}&rdquo;</strong>
      &egrave; stata revocata.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Riceverai una nuova proposta aggiornata a breve.
      Per qualsiasi domanda, non esitare a contattarci.
    </p>
    ${ctaButton("Accedi alla tua area riservata", SITE_URL + "/agenzia/offerte")}
  `);
}

/**
 * Reminder email sent to agency by admin.
 */
export function reminderEmail(
  agencyName: string,
  productName: string,
  message?: string | null
): string {
  const messageBlock = message
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="background-color:#fffbeb;border-radius:6px;padding:16px;border-left:4px solid #f59e0b;">
          <p style="margin:0;font-size:13px;color:#64748b;">Messaggio dal tour operator</p>
          <p style="margin:8px 0 0;font-size:14px;color:#334155;line-height:1.6;">${message.replace(/\n/g, "<br/>")}</p>
        </td>
      </tr>
    </table>`
    : "";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Promemoria</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Ti ricordiamo che la tua richiesta per <strong>&ldquo;${productName}&rdquo;</strong> &egrave; in attesa di un tuo riscontro.
    </p>
    ${messageBlock}
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Accedi alla tua area riservata per verificare lo stato e procedere.
    </p>
    ${ctaButton("Vai alla tua area", `${SITE_URL}/agenzia/richieste`)}
  `);
}

/**
 * Notify agency that a document has been uploaded by the admin.
 */
export function documentUploadedToAgencyEmail(
  agencyName: string,
  productName: string,
  documentType: string
): string {
  const typeLabel = documentType === 'fattura' ? 'una fattura' :
    documentType === 'contratto' ? 'un contratto' : `un documento (${documentType})`;
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Nuovo documento disponibile</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Gentile <strong>${agencyName}</strong>,
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      &Egrave; stato caricato ${typeLabel} relativo alla tua richiesta per <strong>&ldquo;${productName}&rdquo;</strong>.
    </p>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Accedi alla tua area riservata per scaricare il documento.
    </p>
    ${ctaButton("Vedi i tuoi documenti", `${SITE_URL}/agenzia/richieste`)}
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
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Nuova agenzia registrata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Una nuova agenzia si &egrave; registrata sulla piattaforma e richiede l&rsquo;approvazione.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Ragione Sociale</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${agencyName}</td>
      </tr>
      ${contactName ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Referente</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${contactName}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${email}</td>
      </tr>
      ${city ? `<tr>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;">Citta</td>
        <td style="padding:12px 16px;font-size:14px;color:#333333;">${city}</td>
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
  children: number,
  previewPriceLabel?: string | null
): string {
  const typeLabel = requestType === "tour" ? "Tour" : "Crociera";
  const priceRow = previewPriceLabel
    ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Prezzo visto</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${previewPriceLabel}</td>
      </tr>`
    : "";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Nuova richiesta preventivo</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      L&rsquo;agenzia <strong>${agencyName}</strong> ha inviato una nuova richiesta di preventivo.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Tipo</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${typeLabel}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Prodotto</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${productName}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Partecipanti</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${adults} adulti, ${children} bambini</td>
      </tr>
      ${priceRow}
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;">ID Richiesta</td>
        <td style="padding:12px 16px;font-size:14px;color:#333333;font-family:monospace;">${quoteId.slice(0, 8).toUpperCase()}</td>
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
  quoteId: string,
  participantCount?: number
): string {
  const participantNote = participantCount && participantCount > 0
    ? `<p style="color:#334155;font-size:15px;line-height:1.7;">
        Sono stati registrati <strong>${participantCount} partecipanti</strong> con i relativi documenti.
      </p>`
    : "";
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#16a34a;font-size:22px;">Offerta accettata</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      L&rsquo;agenzia <strong>${agencyName}</strong> ha accettato l&rsquo;offerta per <strong>&ldquo;${productName}&rdquo;</strong>.
    </p>
    ${participantNote}
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Procedi con l&rsquo;invio del contratto e dell&rsquo;IBAN.
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

// ---------------------------------------------------------------------------
// 4. Public form notification emails
// ---------------------------------------------------------------------------

/**
 * Notify admin: new contact form submission.
 */
export function adminNewContactFormEmail(
  nome: string,
  cognome: string,
  email: string,
  oggetto: string,
  messaggio: string,
  telefono?: string | null
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Nuovo messaggio dal form contatti</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Hai ricevuto un nuovo messaggio dal sito web.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Nome</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${nome} ${cognome}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${email}</td>
      </tr>
      ${telefono ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Telefono</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${telefono}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Oggetto</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${oggetto}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:12px 16px;font-size:14px;color:#334155;line-height:1.6;">${messaggio.replace(/\n/g, "<br/>")}</td>
      </tr>
    </table>
    ${ctaButton("Vedi messaggi", `${SITE_URL}/admin/messaggi`)}
  `);
}

/**
 * Notify admin: new partnership inquiry.
 */
export function adminNewPartnerInquiryEmail(
  nome_cognome: string,
  agenzia: string,
  email: string,
  messaggio: string,
  citta?: string | null,
  telefono?: string | null
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Nuova richiesta di partnership</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      Un&rsquo;agenzia ha compilato il form &ldquo;Diventa Partner&rdquo;.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Nome</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${nome_cognome}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Agenzia</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${agenzia}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${email}</td>
      </tr>
      ${telefono ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Telefono</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${telefono}</td>
      </tr>` : ""}
      ${citta ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Citta</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${citta}</td>
      </tr>` : ""}
      <tr>
        <td colspan="2" style="padding:12px 16px;font-size:14px;color:#334155;line-height:1.6;">${messaggio.replace(/\n/g, "<br/>")}</td>
      </tr>
    </table>
    ${ctaButton("Vedi messaggi", `${SITE_URL}/admin/messaggi`)}
  `);
}

/**
 * Notify admin: new complaint received.
 */
export function adminNewComplaintEmail(
  nome_cognome: string,
  email: string,
  n_pratica: string,
  descrizione: string,
  destinazione?: string | null
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#C41E2F;font-size:22px;">Nuovo reclamo ricevuto</h2>
    <p style="color:#334155;font-size:15px;line-height:1.7;">
      &Egrave; stato ricevuto un nuovo reclamo dal sito web.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #e2e8f0;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:140px;">Nome</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${nome_cognome}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${email}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">N. Pratica</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;font-weight:600;">${n_pratica}</td>
      </tr>
      ${destinazione ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Destinazione</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#333333;">${destinazione}</td>
      </tr>` : ""}
      <tr>
        <td colspan="2" style="padding:12px 16px;font-size:14px;color:#334155;line-height:1.6;">${descrizione.replace(/\n/g, "<br/>")}</td>
      </tr>
    </table>
    ${ctaButton("Vedi messaggi", `${SITE_URL}/admin/messaggi`)}
  `);
}
