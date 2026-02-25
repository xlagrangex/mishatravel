// ---------------------------------------------------------------------------
// Centralized quote status → action message config
// Used by both admin and agency views to show who needs to act next.
// ---------------------------------------------------------------------------

export type StatusActionInfo = {
  adminMessage: string
  adminActionRequired: boolean
  agencyMessage: string
  agencyActionRequired: boolean
}

const STATUS_ACTIONS: Record<string, StatusActionInfo> = {
  // ---- Agency submitted, admin must review ----
  sent: {
    adminMessage: "Azione richiesta: valuta la richiesta e prepara un'offerta",
    adminActionRequired: true,
    agencyMessage: "In attesa di revisione da parte dell'operatore",
    agencyActionRequired: false,
  },
  requested: {
    adminMessage: "Azione richiesta: valuta la richiesta e prepara un'offerta",
    adminActionRequired: true,
    agencyMessage: "In attesa di revisione da parte dell'operatore",
    agencyActionRequired: false,
  },
  in_review: {
    adminMessage: "Azione richiesta: completa la revisione e invia un'offerta",
    adminActionRequired: true,
    agencyMessage: "L'operatore sta valutando la tua richiesta",
    agencyActionRequired: false,
  },

  // ---- Admin sent offer, agency must respond ----
  offer_sent: {
    adminMessage: "In attesa di risposta dall'agenzia",
    adminActionRequired: false,
    agencyMessage: "Azione richiesta: valuta l'offerta ricevuta e rispondi",
    agencyActionRequired: true,
  },
  offered: {
    adminMessage: "In attesa di risposta dall'agenzia",
    adminActionRequired: false,
    agencyMessage: "Azione richiesta: valuta l'offerta ricevuta e rispondi",
    agencyActionRequired: true,
  },

  // ---- Agency accepted, admin must send contract ----
  accepted: {
    adminMessage: "Azione richiesta: invia il contratto e i dati bancari",
    adminActionRequired: true,
    agencyMessage: "In attesa dell'invio del contratto da parte dell'operatore",
    agencyActionRequired: false,
  },

  // ---- Admin sent payment details, must confirm receipt ----
  payment_sent: {
    adminMessage: "Azione richiesta: verifica e conferma il pagamento ricevuto",
    adminActionRequired: true,
    agencyMessage:
      "In attesa della conferma del pagamento da parte dell'operatore",
    agencyActionRequired: false,
  },

  // ---- Admin sent contract, agency must countersign + pay ----
  contract_sent: {
    adminMessage: "In attesa della controfirma e del pagamento dall'agenzia",
    adminActionRequired: false,
    agencyMessage:
      "Azione richiesta: invia il contratto controfirmato, la ricevuta di pagamento e conferma il pagamento",
    agencyActionRequired: true,
  },

  // ---- Terminal / completed states ----
  confirmed: {
    adminMessage: "Prenotazione confermata",
    adminActionRequired: false,
    agencyMessage: "Prenotazione confermata",
    agencyActionRequired: false,
  },
  declined: {
    adminMessage: "L'agenzia ha rifiutato l'offerta",
    adminActionRequired: false,
    agencyMessage: "Hai rifiutato l'offerta",
    agencyActionRequired: false,
  },
  rejected: {
    adminMessage: "Richiesta rifiutata dall'operatore",
    adminActionRequired: false,
    agencyMessage: "L'operatore ha rifiutato la richiesta",
    agencyActionRequired: false,
  },
  archived: {
    adminMessage: "Archiviato",
    adminActionRequired: false,
    agencyMessage: "Archiviato",
    agencyActionRequired: false,
  },
}

const TERMINAL_STATUSES = new Set([
  "confirmed",
  "declined",
  "rejected",
  "archived",
])

export function isTerminalStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status)
}

export function getAdminStatusAction(status: string): {
  message: string
  actionRequired: boolean
} {
  const info = STATUS_ACTIONS[status]
  if (!info) return { message: status, actionRequired: false }
  return { message: info.adminMessage, actionRequired: info.adminActionRequired }
}

export function getAgencyStatusAction(status: string): {
  message: string
  actionRequired: boolean
} {
  const info = STATUS_ACTIONS[status]
  if (!info) return { message: status, actionRequired: false }
  return {
    message: info.agencyMessage,
    actionRequired: info.agencyActionRequired,
  }
}
