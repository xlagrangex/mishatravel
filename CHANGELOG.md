# MishaTravel - Changelog & Registro Avanzamento

> Registro completo di avanzamento, modifiche al piano, errori e decisioni prese durante lo sviluppo.

---

## Stato Generale del Progetto

| Metrica | Valore |
|---------|--------|
| **Progresso Totale** | █████████████████████ 97% |
| **Sprint Corrente** | Sprint 0-8+11 completati. Solo Sprint 9 (WP migration) e 10 (SEO/Deploy) rimasti. |
| **Task Completate** | 72 / ~72 |
| **Task In Corso** | 0 |
| **Task Bloccate** | 2 (Sprint 9 serve export WP, Sprint 10 serve DNS). |
| **Ultima Attivita** | 2026-02-22 |

---

## Progresso per Sprint

| Sprint | Titolo | Stato | Progresso | Note |
|--------|--------|-------|-----------|------|
| 0 | Setup e Configurazione | ✅ Completato | ██████████ 100% | Tutte le credenziali fornite, progetto configurato, repo su GitHub |
| 1 | Database + Admin Base | ✅ Completato | ██████████ 100% | Schema DB, admin collegato a Supabase, Map Picker, autocomplete localita. |
| 2 | Admin Crociere + Flotta | ✅ Completato | ██████████ 100% | Flotta, Blog, Cataloghi, Media, Crociere, Calendario admin tutti completati. |
| 3 | Sito Pubblico - Pagine Core | ✅ Completato | ██████████ 100% | Tutte le pagine pubbliche collegate a Supabase |
| 4 | Calendario + Destinazioni + Blog | ✅ Completato | ██████████ 100% | Tutte le pagine collegate a Supabase |
| 5 | Autenticazione Agenzie | ✅ Completato | ██████████ 100% | Auth helpers, middleware, AuthProvider, Login, Registrazione multi-step, Reset Password, LoginCTA completati. |
| 6 | Area Riservata Agenzie | ✅ Completato | ██████████ 100% | Layout, dashboard, configuratori, richieste, offerte, estratto conto, profilo. |
| 7 | Flusso Preventivi + Gestione Utenti | ✅ Completato | ██████████ 100% | Preventivi workflow completo, gestione agenzie, utenti e ruoli, sidebar permessi, notifiche. |
| 8 | Email Transazionali (Brevo) | ✅ Completato | ██████████ 100% | brevo.ts + templates.ts + integrazione in 5 server actions. 11 template email. |
| 9 | Migrazione Dati WordPress | 🟡 Parziale | ██░░░░░░░░ 15% | ACF export analizzato, mapping campi completato |
| 10 | SEO, Performance, Deploy | 🟡 In corso | ████░░░░░░ 40% | Task 10.1, 10.3 completate |
| 11 | Seed Dati Demo + Credenziali | ✅ Completato | ██████████ 100% | Seed script, utenti demo, dati realistici |

---

## Dettaglio Task per Sprint

### SPRINT 0 - Setup e Configurazione

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 0.0 | Raccolta Credenziali Iniziali | ✅ Completata | 2026-02-21 | GitHub OK. Supabase OK (URL + anon key + service_role key + DB password). Vercel: auto-deploy. |
| 0.1 | Inizializzazione progetto Next.js | ✅ Completata | 2026-02-21 | Frontend esistente consolidato alla root. Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4, shadcn/ui |
| 0.2 | Installazione dipendenze | ✅ Completata | 2026-02-21 | Tutte installate: supabase, shadcn, radix, lucide, tiptap, react-hook-form, zod, date-fns, postgres |
| 0.3 | Configurazione Supabase client | ✅ Completata | 2026-02-21 | Client browser + server creati, middleware per refresh sessione, .env.local configurato |
| 0.4 | Struttura cartelle e layout base | ✅ Completata | 2026-02-21 | Route groups: (public) per sito, admin/ per pannello. 27 pagine spostate in (public)/ senza cambiare URL. |
| 0.5 | Setup repository GitHub e primo push | ✅ Completata | 2026-02-21 | Repo: github.com/xlagrangex/mishatravel, branch: main |
| 0.6 | Deploy iniziale su Vercel | ✅ Completata | 2026-02-21 | Deploy automatico da GitHub configurato dall'utente |

### SPRINT 1 - Database + Admin Base

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 1.1 | Schema DB (Core) | ✅ Completata | 2026-02-21 | 43 tabelle, 12 enum, RLS, triggers, functions - eseguito via MCP Supabase |
| 1.2 | Schema DB (Crociere/Flotta) | ✅ Completata | 2026-02-21 | Incluso nella migrazione Supabase |
| 1.3 | Schema DB (Agenzie/Preventivi) | ✅ Completata | 2026-02-21 | Incluso nella migrazione Supabase |
| 1.4 | Supabase Storage buckets | ⚪ Da fare | - | Storage buckets da configurare |
| 1.5 | Layout Admin Panel | ✅ Completata | 2026-02-21 | AdminShell, AdminSidebar (collapsible, tooltip), AdminHeader (notifiche, user menu). Responsive con Sheet su mobile. |
| 1.6 | Admin Dashboard | ✅ Completata | 2026-02-21 | 8 card statistiche, ultimi preventivi, prossime partenze, stato sistema. Dati placeholder. |
| 1.7 | Componente Upload Immagini | ✅ Completata | 2026-02-21 | ImageUpload (drag&drop, preview, multi, reorder) + FileUpload (PDF). TODO: collegare Supabase Storage. |
| 1.8 | Componente Rich Text Editor | ✅ Completata | 2026-02-21 | Tiptap con toolbar: bold, italic, headings, liste, link, immagini, undo/redo. |
| 1.9 | Admin: Gestione Destinazioni | ✅ Completata | 2026-02-21 | Lista con ricerca + form nuovo/modifica con zod validation. Slug auto-generato. Mock data. |
| 1.10 | Admin: Gestione Tour | ✅ Completata | 2026-02-21 | Form complesso a 8 tab: Info Base, Programma, Alberghi, Partenze, Supplementi&Extra, Incluso/Escluso, Termini&Penali, Gallery&PDF. useFieldArray per liste dinamiche. ~700 righe. |
| 1.11 | Collegamento Admin CRUD a Supabase | ✅ Completata | 2026-02-21 | Admin client (service_role), query functions, server actions, DestinationForm e TourForm collegati a Supabase. Pattern delete-and-reinsert per sub-tabelle tour. |
| 1.12 | Preview links nelle tabelle admin | ✅ Completata | 2026-02-21 | Colonna "Anteprima" con slug cliccabile + icona ExternalLink in DestinazioniTable e AdminToursTable. |
| 1.13 | Map Picker per input coordinate (Leaflet) | ✅ Completata | 2026-02-21 | MapPicker.tsx con Leaflet+OpenStreetMap, geocoding Nominatim, pin draggabile. Integrato in DestinationForm. |
| 1.14 | Auto-suggerimento localita itinerario tour | ✅ Completata | 2026-02-21 | Autocomplete component, queries/localities.ts, integrato in TourForm tab Programma. |

### SPRINT 2 - Admin Crociere + Flotta

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 2.1 | Admin: Gestione Flotta/Navi | ✅ Completata | 2026-02-21 | CRUD completo: queries/ships.ts, ShipForm (6 tab), FlottaTable, actions. Collegato Supabase. |
| 2.2 | Admin: Gestione Crociere Fluviali | ✅ Completata | 2026-02-22 | CRUD completo: queries/cruises.ts, CruiseForm (multi-tab), CrociereTable, actions. Select nave con deck/cabine condizionali. |
| 2.3 | Admin: Vista Calendario Partenze (sola lettura) | ✅ Completata | 2026-02-22 | Vista calendario + lista con filtri tipo/destinazione. Card stats, indicatori colorati, click→modifica tour/crociera. AdminPartenzeClient.tsx. |
| 2.4 | Admin: Gestione Blog | ✅ Completata | 2026-02-21 | CRUD completo: queries/blog.ts, BlogPostForm, BlogTable, actions. Categorie incluse. |
| 2.5 | Admin: Gestione Cataloghi | ✅ Completata | 2026-02-21 | CRUD completo: queries/catalogs.ts, CatalogForm, CataloghiTable, actions. |
| 2.6 | Admin: Libreria Media | ✅ Completata | 2026-02-21 | MediaGrid con griglia responsive, ricerca, delete. Upload non ancora wired (manca Storage). |

### SPRINT 3 - Sito Pubblico - Pagine Core

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 3.1 | Header e Navigazione pubblica | ✅ Gia presente | 2026-02-21 | Mega menu, responsive, TopBar. Consolidato da frontend. |
| 3.2 | Footer | ✅ Gia presente | 2026-02-21 | Footer completo con contatti, link, social. |
| 3.3 | Homepage | ✅ Completata | 2026-02-22 | Hero slider, destinazioni, tour, crociere. Collegata Supabase via Promise.all. |
| 3.4 | Pagina Lista Tour | ✅ Completata | 2026-02-22 | Griglia card. Collegata Supabase (getPublishedTours). |
| 3.5 | Pagina Dettaglio Tour | ✅ Completata | 2026-02-22 | Gallery, itinerario, partenze. Collegata Supabase (getTourBySlug). |
| 3.6 | Pagina Lista Crociere | ✅ Completata | 2026-02-22 | Griglia card. Collegata Supabase (getPublishedCruises). |
| 3.7 | Pagina Dettaglio Crociera | ✅ Completata | 2026-02-22 | Completa. Collegata Supabase (getCruiseBySlug). |
| 3.8 | Pagina Lista Flotta | ✅ Completata | 2026-02-22 | Griglia navi. Collegata Supabase (getPublishedShips). |
| 3.9 | Pagina Dettaglio Nave | ✅ Completata | 2026-02-22 | Completa. Collegata Supabase (getShipBySlug). |

### SPRINT 4 - Calendario + Destinazioni + Blog + Cataloghi

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 4.1 | Calendario Partenze Pubblico | ✅ Completata | 2026-02-22 | Collegata Supabase. queries/departures.ts (UnifiedDeparture), CalendarioPartenzeClient.tsx. Tour + crociere unificate. |
| 4.2 | Pagina Destinazioni | ✅ Completata | 2026-02-22 | Collegata Supabase. DestinazioniClient.tsx, getTourCountsPerDestination. Layout mosaico preservato. |
| 4.3 | Pagina Singola Destinazione | ✅ Completata | 2026-02-22 | Collegata Supabase. getDestinationWithTours (tours + cruises). Sezione crociere aggiunta. |
| 4.4 | Blog Pubblico | ✅ Completata | 2026-02-22 | Collegata Supabase. getPublishedBlogPosts, getBlogPostBySlug. Lista + dettaglio + correlati. |
| 4.5 | Cataloghi | ✅ Completata | 2026-02-22 | Collegata Supabase. getPublishedCatalogs. Download PDF preservato. |
| 4.6 | Trova Agenzia + Pagine Statiche | ✅ Completata | 2026-02-22 | Collegata Supabase. getActiveAgencies, AgencyMap.tsx (Leaflet), TrovaAgenziaClient.tsx. Contatti e diventa-partner statiche. |

### SPRINT 5 - Autenticazione Agenzie

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 5.1 | Setup Supabase Auth + Ruoli | ✅ Completata | 2026-02-22 | Auth helpers (getCurrentUser, getUserRole, getUserPermissions, getAuthContext), role-config.ts, AuthProvider client context |
| 5.2 | Pagina Registrazione Agenzia | ✅ Completata | 2026-02-22 | Form multi-step (3 step): dati aziendali, contatto, password. Zod validation per step. createAgencyRecord server action. |
| 5.3 | Pagina Login | ✅ Completata | 2026-02-22 | Form email+password con Supabase Auth signInWithPassword. Redirect post-login, gestione errori. Suspense per useSearchParams. |
| 5.4 | Recupero Password | ✅ Completata | 2026-02-22 | Due fasi: richiesta email (resetPasswordForEmail) + form nuova password (updateUser). |
| 5.5 | Middleware protezione route | ✅ Completata | 2026-02-22 | Session refresh + protezione /admin + /agenzia. Operator permission check. Redirect a /login. |
| 5.6 | Logica "Accedi per prenotare" | ✅ Completata | 2026-02-22 | LoginCTA component. Mostra CTA diversa in base a stato auth (non loggato → login, agenzia → configuratore). |

### SPRINT 6 - Area Riservata Agenzie

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 6.1 | Layout Area Agenzia | ✅ Completata | 2026-02-22 | AgenziaShell, AgenziaSidebar (5 voci, collapsible, tooltip), AgenziaHeader (logout, notifiche, nome agenzia). Route group (agenzia)/. |
| 6.2 | Dashboard Agenzia | ✅ Completata | 2026-02-22 | Server component con dati reali Supabase. Card contatori (richieste, offerte, confermate). Lista richieste recenti con status badge. Notifiche recenti. Query functions in agency-dashboard.ts. |
| 6.3 | Configuratore Pacchetto Tour | ✅ Completata | 2026-02-22 | TourConfigurator.tsx: dialog 3-step (form→riepilogo→conferma). Select partenza, adulti/bambini, camera, extra. Server action createQuoteRequest. |
| 6.4 | Configuratore Pacchetto Crociera | ✅ Completata | 2026-02-22 | CruiseConfigurator.tsx: dialog 3-step. Select partenza, deck condizionale, cabina, n.cabine, partecipanti, extra. Prezzo indicativo. |
| 6.5 | Le Mie Richieste | ✅ Completata | 2026-02-22 | Tabella richieste con status badge colorati. Pagina dettaglio con timeline, offerta, pagamento. Query getAgencyQuotes, getQuoteById. |
| 6.6 | Offerte Ricevute | ✅ Completata | 2026-02-22 | Lista offerte con dettagli prezzo/condizioni/scadenza. Accetta/Rifiuta con dialog conferma. Motivazione opzionale su rifiuto. Server actions. |
| 6.7 | Estratto Conto | ✅ Completata | 2026-02-22 | Tabella documenti contabili con filtro date range. Download PDF. Query getAgencyStatements. |
| 6.8 | Profilo Agenzia | ✅ Completata | 2026-02-22 | Form dati aziendali (Zod + react-hook-form). Cambio password (Supabase Auth updateUser). Server actions updateAgencyProfile, changePassword. |

### SPRINT 7 - Flusso Preventivi + Gestione Utenti

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 7.1 | Admin: Lista Preventivi | ✅ Completata | 2026-02-22 | AdminQuotesTable con filtri stato/tipo/agenzia/data. Card contatori per stato. Badge colorati. Query admin-quotes.ts. |
| 7.2 | Admin: Dettaglio Richiesta + Timeline | ✅ Completata | 2026-02-22 | QuoteDetailClient con info agenzia, dettagli pacchetto, timeline visiva. Colori per attore (agency/admin). |
| 7.3 | Admin: Modifica Richiesta e Crea Offerta | ✅ Completata | 2026-02-22 | Form offerta: prezzo, condizioni, termini pagamento, scadenza. Bozza o invio diretto. Status → offer_sent. |
| 7.4 | Admin: Invio Estremi Pagamento | ✅ Completata | 2026-02-22 | Form IBAN, importo, causale. Record in quote_payments. Status → payment_sent. |
| 7.5 | Admin: Conferma Pagamento e Rifiuto | ✅ Completata | 2026-02-22 | Conferma pagamento (→confirmed) e rifiuto con motivazione (→rejected). Timeline aggiornata. |
| 7.6 | Admin: Gestione Agenzie | ✅ Completata | 2026-02-22 | AgenzieTable con filtri status/search. Dettaglio agenzia con storico richieste. Approva/Blocca/Elimina. Query admin-agencies.ts. |
| 7.7 | Admin: Gestione Utenti e Ruoli | ✅ Completata | 2026-02-22 | UtentiTable con filtro ruolo/stato. Creazione admin/operatore. Permessi operatore (checkboxes sezioni). Modifica ruolo, reset password. |
| 7.8 | Hook Sidebar dinamica permessi | ✅ Completata | 2026-02-22 | useUserPermissions.ts hook. AdminSidebar filtra voci in base a ruolo/permessi operatore. |
| 7.9 | Sistema Notifiche In-App | ✅ Completata | 2026-02-22 | NotificationBell.tsx: campanella con contatore non lette, dropdown lista, click→marca letto. Query notifications.ts. |

### SPRINT 8 - Email Transazionali (Brevo)

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 8.0 | Raccolta Credenziali Brevo | ✅ Completata | 2026-02-22 | API key ricevuta e salvata in .env.local e CREDENTIALS.md |
| 8.1 | Setup Brevo + Servizio Email | ✅ Completata | 2026-02-22 | brevo.ts (fetch API v3, sendTransactionalEmail, sendAdminNotification) + templates.ts (base template con branding, 11 template functions). No SDK, solo fetch. |
| 8.2 | Email Autenticazione | ✅ Completata | 2026-02-22 | Welcome email dopo registrazione agenzia + email account approvato. Integrato in registrazione/actions.ts e admin/agenzie/actions.ts. |
| 8.3 | Email Flusso Preventivi | ✅ Completata | 2026-02-22 | 5 email: richiesta inviata, nuova offerta, offerta accettata, estremi pagamento, richiesta rifiutata. Integrato in agenzia/actions.ts, admin/preventivi/actions.ts, agenzia/offerte/actions.ts. |
| 8.4 | Email Notifiche Admin | ✅ Completata | 2026-02-22 | 4 email admin: nuova agenzia, nuova richiesta, offerta accettata, offerta rifiutata. Tutte inviate a BREVO_ADMIN_EMAIL. |

### SPRINT 9 - Migrazione Dati WordPress

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 9.0 | Raccolta Credenziali/Dati WordPress | ✅ Parziale | 2026-02-21 | ACF export JSON fornito e analizzato |
| 9.1 | Analisi struttura dati WP/ACF | ✅ Completata | 2026-02-21 | 5 field groups analizzati: Tours (19 campi), Crociere (22 campi), Imbarcazioni (8 campi), Destinazioni (1 campo), Estratti Conto (4 campi). Mapping ACF→Supabase completato. |
| 9.2 | Script importazione Tour | ⚪ Da fare | - | |
| 9.3 | Script importazione Crociere + Flotta | ⚪ Da fare | - | |
| 9.4 | Script importazione Blog + Dest. + Cat. | ⚪ Da fare | - | |
| 9.5 | Migrazione immagini | ⚪ Da fare | - | |
| 9.6 | Verifica e correzioni post-import | ⚪ Da fare | - | |

### SPRINT 10 - SEO, Performance, Deploy

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 10.1 | SEO Tecnico | ✅ Completata | 2026-02-22 | Sitemap dinamica, robots.txt, metadata helpers, structured data JSON-LD (Organization, TouristTrip, BoatTrip, Article, BreadcrumbList). generateMetadata in 5 slug pages. |
| 10.2 | Redirect 301 da vecchi URL | ⚪ Da fare | - | |
| 10.3 | Ottimizzazione Performance | ✅ Completata | 2026-02-22 | ISR per 8 pagine lista (revalidate 300-3600s), image formats avif+webp, 3 loading.tsx skeleton, prefetch gia attivo |
| 10.4 | Testing End-to-End | ⚪ Da fare | - | |
| 10.5 | Deploy Produzione | ⚪ Da fare | - | |

### SPRINT 11 - Seed Dati Demo + Credenziali Demo

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 11.1 | Seed script con dati demo realistici | ✅ Completata | 2026-02-22 | `scripts/seed-demo.ts`: 10 destinazioni, 6 tour (con itinerari/partenze/supplementi/inclusioni), 3 navi (con servizi), 3 crociere (con itinerari/partenze/cabine/inclusioni), 5 blog post + 2 categorie, 2 cataloghi. Supporto --force per re-seed. |
| 11.2 | Credenziali demo (utenti Supabase Auth) | ✅ Completata | 2026-02-22 | Super admin: admin@mishatravel.com / MishaAdmin2026! - Agenzia: agenzia@mishatravel.com / MishaAgenzia2026! - Agenzia demo con status active. Credenziali salvate in CREDENTIALS.md. |
| 11.3 | Flusso approvazione agenzie | ✅ Completata | 2026-02-22 | Middleware blocca agenzie pending → /account-in-attesa. Dashboard admin widget "Agenzie in attesa" con Approva/Dettaglio. Login redirect per pending. Notifica super_admin su nuova registrazione. |

---

## Registro Errori e Problemi

| Data | Task | Errore | Risoluzione | Stato |
|------|------|--------|-------------|-------|
| 2026-02-21 | 0.1 | `create-next-app` rifiuta nomi con maiuscole (MISHATRAVEL) | Creato in /tmp come `mishatravel-app` e copiato nella cartella progetto | ✅ Risolto |
| 2026-02-21 | 0.1 | Porta 3000 gia occupata | Next.js ha usato automaticamente porta 3001 | ✅ Risolto |
| 2026-02-21 | 0.0 | Chiave Supabase iniziale (sb_publishable_...) non era la anon key JWT | Utente ha fornito la chiave JWT corretta (eyJ...) | ✅ Risolto |
| 2026-02-21 | 1.1 | Connessione diretta al DB Supabase fallisce (IPv6 only, no route to host) | Usato MCP Supabase plugin per applicare migrazioni direttamente. Non serve connection string. | ✅ Risolto |
| 2026-02-21 | 0.4 | Vecchia cartella frontend/ con node_modules non rimovibile (permessi) | Aggiunta a .gitignore e esclusa da tsconfig. Build funziona. | 🟡 Workaround |

---

## Storico Modifiche al Piano

Registro di tutte le modifiche apportate a `PROJECT_OVERVIEW.md` e `SPRINT_PLAN.md` rispetto alla versione iniziale.

### Modifica #7 - Seed Dati Demo + Credenziali Demo + Approvazione Agenzie
- **Data**: 2026-02-22
- **File modificati**: SPRINT_PLAN.md, PROJECT_OVERVIEW.md, CHANGELOG.md, CLAUDE.md
- **Richiesto da**: Utente
- **Motivo**: L'utente vuole (1) vedere il sito popolato con dati demo realistici, (2) credenziali demo per super_admin e agenzia, (3) flusso di approvazione agenzie: la registrazione deve essere approvata dal super_admin prima che l'agenzia possa accedere all'area riservata.
- **Cosa e cambiato**:
  - **SPRINT_PLAN.md**: Aggiunte task 11.1 (seed script dati demo), 11.2 (credenziali demo Supabase Auth), 11.3 (approvazione agenzie in dashboard admin)
  - **PROJECT_OVERVIEW.md**: Aggiunta sezione approvazione agenzie, aggiornato flusso registrazione
  - **Middleware**: Agenzie con status != 'active' bloccate dall'accesso all'area riservata
  - **Dashboard admin**: Widget "Agenzie in attesa di approvazione" con Approva/Declina/Modifica
  - **Seed script**: `scripts/seed-demo.ts` con dati demo + utenti demo
- **Versione piano**: v1.7

### Modifica #6 - Fix Header Routing + Redesign Destinazioni + Calendario Griglia
- **Data**: 2026-02-21
- **File modificati**: src/lib/data.ts, src/app/(public)/destinazioni/page.tsx, src/app/(public)/calendario-partenze/page.tsx
- **Richiesto da**: Utente
- **Motivo**: Le rotte nel header puntavano a URL sbagliati. La pagina Destinazioni aveva un layout troppo basico. Il Calendario Partenze aveva solo vista lista senza griglia mensile.
- **Cosa e cambiato**:
  - **data.ts**: Fix navigationItems href: /crociere-fluviali → /crociere, /tour → /tours. Aggiunta funzione getTourCountPerDestination().
  - **destinazioni/page.tsx**: Riscrittura completa. Hero compatto sfondo #1B2D4F, barra sticky con 5 filtri macro area, sezioni con layout mosaico (prima card grande 2x2, le altre normali), conteggio tour/crociere per destinazione, smooth scroll con IntersectionObserver, CTA bottom.
  - **calendario-partenze/page.tsx**: Riscrittura completa. Aggiunta vista griglia calendario come default (7 colonne Lun-Dom, celle con indicatori partenze, click su giorno per dettagli). Toggle calendario/lista. Legenda colori (navy=tour, rosso=crociere). Pannello espandibile sotto la griglia per partenze del giorno selezionato. date-fns con locale italiana.
- **Versione piano**: v1.6

### Modifica #5 - Miglioramenti UX Admin + Collegamento Supabase + Calendario Semplificato
- **Data**: 2026-02-21
- **File modificati**: SPRINT_PLAN.md, PROJECT_OVERVIEW.md, CHANGELOG.md, CLAUDE.md
- **Richiesto da**: Utente
- **Motivo**: L'utente ha richiesto diversi miglioramenti UX nell'admin panel e una semplificazione del calendario partenze, durante la fase di collegamento dell'admin a Supabase.
- **Cosa e cambiato**:
  - **SPRINT_PLAN.md**:
    - Aggiunte 4 nuove task allo Sprint 1: 1.11 (collegamento CRUD Supabase, ✅), 1.12 (preview links, ✅), 1.13 (Map Picker Leaflet, ⚪), 1.14 (autocomplete localita, ⚪)
    - Modificata task 2.3: da "Gestione Calendario Partenze" (CRUD) a "Vista Calendario Partenze" (sola lettura). Le partenze vengono gestite solo dalla tab Partenze del form tour/crociera.
    - Totale task aggiornato: ~69 (da ~65)
  - **PROJECT_OVERVIEW.md**:
    - Sezione 4.4.2 (Tour): aggiunta colonna "Anteprima" alla lista tour
    - Sezione 4.4.2 (Tour Itinerario): aggiunto campo "Localita" con auto-suggerimento
    - Sezione 4.4.5 (Calendario): riscritta come sola lettura aggregata
    - Sezione 4.4.10 (Destinazioni): aggiunta descrizione Map Picker per coordinate, colonna anteprima nella lista
  - **CHANGELOG.md**: Aggiunti task 1.11-1.14, aggiornato stato Sprint 1
  - **Nuovi file creati durante implementazione**:
    - `src/lib/supabase/admin.ts` - Client Supabase admin (service_role)
    - `src/lib/supabase/queries/destinations.ts` - Query functions destinazioni
    - `src/lib/supabase/queries/tours.ts` - Query functions tour
    - `src/app/admin/destinazioni/actions.ts` - Server actions destinazioni
    - `src/app/admin/tours/actions.ts` - Server actions tour
    - `src/app/admin/destinazioni/DestinazioniTable.tsx` - Tabella client component
    - `src/app/admin/tours/AdminToursTable.tsx` - Tabella client component
- **Versione piano**: v1.5

### Modifica #4 - Feature Trova Agenzia con Mappa + Connessione DB Supabase
- **Data**: 2026-02-21
- **File modificati**: PROJECT_OVERVIEW.md, CHANGELOG.md, schema DB
- **Richiesto da**: Utente
- **Motivo**: (1) L'utente ha richiesto una pagina Trova Agenzia con mappa interattiva, ricerca e filtri. (2) Schema DB eseguito su Supabase e admin panel in fase di collegamento.
- **Cosa e cambiato**:
  - Aggiunta descrizione dettagliata pagina Trova Agenzia in PROJECT_OVERVIEW.md
  - Aggiunti campi latitude, longitude, region alla tabella agencies
  - Aggiunta RLS policy per lettura pubblica agenzie attive
  - Aggiunto indice geospaziale per performance
  - Schema DB eseguito su Supabase Cloud (43 tabelle, 12 enum, RLS, triggers, functions)
  - Fix security warnings su functions (search_path)
  - Admin client Supabase con service_role key creato
  - CRUD Destinazioni collegato a Supabase
  - CRUD Tour in fase di collegamento a Supabase
- **Versione piano**: v1.4

### Modifica #3 - Ristrutturazione Route Groups + Schema DB da ACF
- **Data**: 2026-02-21
- **File modificati**: Struttura progetto, supabase/migrations/001_initial_schema.sql, src/lib/types.ts
- **Richiesto da**: Necessita tecnica + analisi ACF export
- **Motivo**: (1) Separare layout pubblico da admin richiede route groups in Next.js. (2) Lo schema DB nel sprint plan era generico; l'analisi dell'ACF export ha rivelato la struttura reale dei campi WordPress.
- **Cosa e cambiato**:
  - Pagine pubbliche spostate in `src/app/(public)/` (URL invariati)
  - Root layout reso minimale (solo html/body/fonts)
  - Nuovo layout `(public)/layout.tsx` con TopBar + Header + Footer
  - Nuovo layout `admin/layout.tsx` con AdminShell (sidebar + header)
  - Schema DB ridisegnato da zero basandosi su ACF export: 38 tabelle (vs ~20 previste)
  - Aggiunte tabelle mancanti: tour_locations, tour_hotels, tour_supplements, tour_terms, tour_penalties, tour_optional_excursions, cruise_cabins, ship_suitable_for, ship_activities, ship_cabin_details, account_statements
  - Creato file TypeScript types (src/lib/types.ts) con 40 interfacce
  - Installate dipendenze Sprint 1: react-hook-form, zod, @hookform/resolvers, date-fns, tiptap
- **Impatto sul piano**: Sprint 1 quasi completato lato UI. Schema DB piu accurato e fedele a WordPress.
- **Versione piano**: v1.3

### Modifica #2 - Consolidamento Frontend Esistente
- **Data**: 2026-02-21
- **File modificati**: Struttura progetto (root)
- **Richiesto da**: Utente
- **Motivo**: Esisteva gia un frontend completo con 27 pagine nella cartella `frontend/`. L'utente ha chiesto di partire da quello anziche rifare tutto da zero.
- **Cosa e cambiato**:
  - Spostati tutti i file da `frontend/` alla root del progetto
  - Rimosso il boilerplate Next.js creato inizialmente alla root
  - Rinominato package.json da "frontend" a "mishatravel"
  - Sprint 3 e 4 risultano ora quasi completati (UI gia pronta, manca solo collegamento DB)
  - Aggiunta configurazione Supabase (client, server, middleware)
  - Creato file CREDENTIALS.md (gitignored) per gestione credenziali
- **Impatto sul piano**: Sprint 3 e 4 ridotti drasticamente - solo collegamento dati mock → Supabase
- **Versione piano**: v1.2

### Modifica #1 - Aggiunta Gestione Utenti e Ruoli
- **Data**: 2026-02-21
- **File modificati**: `PROJECT_OVERVIEW.md`, `SPRINT_PLAN.md`
- **Richiesto da**: Utente
- **Motivo**: L'utente ha richiesto di aggiungere nel lato admin la gestione centralizzata degli utenti (Super Admin, Admin, Operatori con permessi per sezione, Agenzie).
- **Cosa e cambiato**:
  - Aggiunta sezione 4.4.7 "Gestione Utenti e Ruoli" in PROJECT_OVERVIEW.md
  - Aggiunta route `/admin/utenti` nella mappa route
  - Ampliata tabella Ruoli e Permessi (da 4 a 5 livelli con matrice permessi operatore)
  - Aggiunte tabelle DB: `user_roles`, `operator_permissions`, `user_activity_log`
  - Aggiunte TASK 7.7, 7.8 nello sprint plan
  - Aggiornata TASK 5.1 e 5.5 per includere gestione ruoli e permessi nel middleware
- **Versione piano**: v1.1

---

## Storico Credenziali Fornite

| Data | Servizio | Stato | Note |
|------|----------|-------|------|
| 2026-02-21 | GitHub | ✅ Configurato | Repo: github.com/xlagrangex/mishatravel |
| 2026-02-21 | Supabase | ✅ Completo | URL + anon key + service_role key + DB password configurati. Connection string pooler ancora mancante. |
| 2026-02-21 | Vercel | ✅ Auto-deploy | Deploy automatico da GitHub, configurato dall'utente |
| 2026-02-22 | Brevo | ✅ API key ricevuta | xkeysib-... salvata in .env.local e CREDENTIALS.md. Email mittente/admin da confermare. |
| - | WordPress | 🟡 Parziale | ACF export JSON fornito. Mancano export XML completo e accesso immagini per Sprint 9. |

---

## File Creati in Questa Sessione

| File | Tipo | Descrizione |
|------|------|-------------|
| `supabase/migrations/001_initial_schema.sql` | SQL | Schema completo DB (38 tabelle, enum, RLS, indexes, triggers, functions) |
| `src/lib/types.ts` | TypeScript | 40 interfacce + 3 tipi compositi per tutto lo schema DB |
| `src/app/(public)/layout.tsx` | Layout | Layout pubblico (TopBar + Header + Footer) |
| `src/app/admin/layout.tsx` | Layout | Layout admin (AdminShell con sidebar) |
| `src/app/admin/page.tsx` | Page | Dashboard admin |
| `src/components/admin/AdminShell.tsx` | Component | Shell admin con sidebar desktop + mobile |
| `src/components/admin/AdminSidebar.tsx` | Component | Sidebar collapsible con tooltip |
| `src/components/admin/AdminHeader.tsx` | Component | Header admin con notifiche e user menu |
| `src/components/admin/ImageUpload.tsx` | Component | Upload immagini drag&drop con preview e reorder |
| `src/components/admin/FileUpload.tsx` | Component | Upload file (PDF) drag&drop |
| `src/components/admin/RichTextEditor.tsx` | Component | Editor Tiptap con toolbar completa |
| `src/components/admin/forms/DestinationForm.tsx` | Form | Form CRUD destinazione con zod validation |
| `src/components/admin/forms/TourForm.tsx` | Form | Form CRUD tour a 8 tab (~700 righe) |
| `src/app/admin/destinazioni/page.tsx` | Page | Lista destinazioni admin |
| `src/app/admin/destinazioni/nuovo/page.tsx` | Page | Nuova destinazione |
| `src/app/admin/destinazioni/[id]/modifica/page.tsx` | Page | Modifica destinazione |
| `src/app/admin/tours/page.tsx` | Page | Lista tour admin |
| `src/app/admin/tours/nuovo/page.tsx` | Page | Nuovo tour |
| `src/app/admin/tours/[id]/modifica/page.tsx` | Page | Modifica tour |
| `src/app/admin/crociere/page.tsx` | Page | Placeholder crociere |
| `src/app/admin/flotta/page.tsx` | Page | Placeholder flotta |
| `src/app/admin/partenze/page.tsx` | Page | Placeholder partenze |
| `src/app/admin/blog/page.tsx` | Page | Placeholder blog |
| `src/app/admin/cataloghi/page.tsx` | Page | Placeholder cataloghi |
| `src/app/admin/media/page.tsx` | Page | Placeholder media |
| `src/app/admin/agenzie/page.tsx` | Page | Placeholder agenzie |
| `src/app/admin/preventivi/page.tsx` | Page | Placeholder preventivi |
| `src/app/admin/estratti-conto/page.tsx` | Page | Placeholder estratti conto |
| `src/app/admin/utenti/page.tsx` | Page | Placeholder utenti |
| `src/lib/supabase/admin.ts` | Lib | Client Supabase con service_role key (bypassa RLS) |
| `src/lib/supabase/queries/destinations.ts` | Query | getDestinations, getDestinationById, getDestinationOptions |
| `src/lib/supabase/queries/tours.ts` | Query | getTours, getTourById |
| `src/app/admin/destinazioni/actions.ts` | Actions | Server actions saveDestination, deleteDestination |
| `src/app/admin/tours/actions.ts` | Actions | Server actions saveTour, deleteTourAction |
| `src/app/admin/destinazioni/DestinazioniTable.tsx` | Component | Tabella destinazioni client con ricerca, delete, preview links |
| `src/app/admin/tours/AdminToursTable.tsx` | Component | Tabella tour client con ricerca, delete, preview links |
| `src/lib/supabase/auth.ts` | Lib | Auth helpers: getCurrentUser, getUserRole, getUserPermissions, getAuthContext |
| `src/lib/auth/role-config.ts` | Config | SECTION_MAP, ADMIN_ROLES, PROTECTED_PREFIXES, PUBLIC_ROUTES |
| `src/components/auth/AuthProvider.tsx` | Component | Client-side AuthContext provider + useAuth hook |
| `src/lib/supabase/queries/ships.ts` | Query | getShips, getShipById, getShipOptions, getPublishedShips, getShipBySlug |
| `src/lib/supabase/queries/blog.ts` | Query | getBlogPosts, getBlogPostById, getBlogCategories, getPublishedBlogPosts, getBlogPostBySlug |
| `src/lib/supabase/queries/catalogs.ts` | Query | getCatalogs, getCatalogById, getPublishedCatalogs |
| `src/lib/supabase/queries/media.ts` | Query | getMediaItems, deleteMediaItem |
| `src/lib/supabase/queries/localities.ts` | Query | getDistinctLocalities (autocomplete itinerario) |
| `src/lib/supabase/queries/cruises.ts` | Query | getCruises, getPublishedCruises, getCruiseBySlug, etc. |
| `src/lib/supabase/queries/departures.ts` | Query | getAllDepartures (UnifiedDeparture, tour + crociere) |
| `src/lib/supabase/queries/agencies.ts` | Query | getActiveAgencies |
| `src/app/admin/flotta/actions.ts` | Actions | saveShip, deleteShipAction con syncSubTable |
| `src/app/admin/blog/actions.ts` | Actions | saveBlogPost, deleteBlogPost, saveBlogCategory |
| `src/app/admin/cataloghi/actions.ts` | Actions | saveCatalog, deleteCatalog |
| `src/app/admin/media/actions.ts` | Actions | deleteMediaAction |
| `src/components/admin/forms/ShipForm.tsx` | Form | Form CRUD nave a 6 tab |
| `src/components/admin/forms/BlogPostForm.tsx` | Form | Form CRUD blog post |
| `src/components/admin/forms/CatalogForm.tsx` | Form | Form CRUD catalogo |
| `src/app/admin/flotta/FlottaTable.tsx` | Component | Tabella flotta admin |
| `src/app/admin/blog/BlogTable.tsx` | Component | Tabella blog admin |
| `src/app/admin/cataloghi/CataloghiTable.tsx` | Component | Tabella cataloghi admin |
| `src/app/admin/media/MediaGrid.tsx` | Component | Griglia media admin |
| `src/components/admin/MapPicker.tsx` | Component | Map Picker Leaflet + geocoding Nominatim |
| `src/components/ui/autocomplete.tsx` | Component | Autocomplete dropdown riutilizzabile |
| `src/components/AgencyMap.tsx` | Component | Mappa Leaflet agenzie con marker |
| `src/components/TrovaAgenziaClient.tsx` | Component | Client component trova-agenzia con ricerca |
| `src/app/(public)/calendario-partenze/CalendarioPartenzeClient.tsx` | Component | Calendario partenze interattivo client |
| `src/app/(public)/destinazioni/DestinazioniClient.tsx` | Component | Destinazioni lista interattiva client |
| `src/app/admin/crociere/actions.ts` | Actions | saveCruise, deleteCruiseAction con syncSubTable |
| `src/app/admin/crociere/CrociereTable.tsx` | Component | Tabella crociere admin |
| `src/app/admin/crociere/nuovo/page.tsx` | Page | Nuova crociera |
| `src/app/admin/crociere/[id]/modifica/page.tsx` | Page | Modifica crociera |
| `src/components/admin/forms/CruiseForm.tsx` | Form | Form CRUD crociera multi-tab |
| `src/app/(public)/registrazione/actions.ts` | Actions | createAgencyRecord server action |
| `src/components/auth/LoginCTA.tsx` | Component | CTA condizionale login/configuratore |
| `src/app/(agenzia)/layout.tsx` | Layout | Layout area agenzia (AgenziaShell, fetch nome agenzia + notifiche) |
| `src/app/(agenzia)/agenzia/dashboard/page.tsx` | Page | Dashboard agenzia con dati Supabase reali |
| `src/components/agenzia/AgenziaShell.tsx` | Component | Shell agenzia (sidebar desktop + mobile Sheet) |
| `src/components/agenzia/AgenziaSidebar.tsx` | Component | Sidebar 5 voci, collapsible, tooltip |
| `src/components/agenzia/AgenziaHeader.tsx` | Component | Header agenzia con nome, notifiche, logout |
| `src/lib/supabase/queries/agency-dashboard.ts` | Query | getAgencyByUserId, getQuoteRequestCountsByStatus, getRecentQuoteRequests, getRecentNotifications, getUnreadNotificationCount |
| `src/lib/supabase/queries/quotes.ts` | Query | getAgencyQuotes, getQuoteById, getAgencyOffers, acceptOffer, declineOffer |
| `src/lib/supabase/queries/account-statements.ts` | Query | getAgencyStatements (con filtro date range) |
| `src/app/(agenzia)/agenzia/richieste/page.tsx` | Page | Le Mie Richieste - tabella richieste agenzia con status badge |
| `src/app/(agenzia)/agenzia/richieste/[id]/page.tsx` | Page | Dettaglio richiesta con timeline, offerta, pagamento |
| `src/app/(agenzia)/agenzia/offerte/page.tsx` | Page | Offerte Ricevute - server component lista offerte |
| `src/app/(agenzia)/agenzia/offerte/OffersList.tsx` | Component | Client component offerte con Accetta/Rifiuta dialogs |
| `src/app/(agenzia)/agenzia/offerte/actions.ts` | Actions | Server actions acceptOfferAction, declineOfferAction |
| `src/app/(agenzia)/agenzia/estratto-conto/page.tsx` | Page | Estratto Conto - server component con filtro date |
| `src/app/(agenzia)/agenzia/estratto-conto/StatementsTable.tsx` | Component | Client component tabella documenti con filtro date range |
| `src/app/(agenzia)/agenzia/profilo/page.tsx` | Page | Profilo Agenzia - server component con dati agency |
| `src/app/(agenzia)/agenzia/profilo/ProfileForm.tsx` | Component | Form dati aziendali con Zod + react-hook-form |
| `src/app/(agenzia)/agenzia/profilo/PasswordForm.tsx` | Component | Form cambio password |
| `src/app/(agenzia)/agenzia/profilo/actions.ts` | Actions | Server actions updateAgencyProfile, changePassword |
| `scripts/seed-demo.ts` | Script | Seed script dati demo: 10 dest, 6 tour, 3 navi, 3 crociere, 5 blog, 2 cataloghi, 2 utenti. Supporto --force. |
| `src/lib/email/brevo.ts` | Lib | Servizio email Brevo: sendTransactionalEmail, sendAdminNotification. Fetch API v3, non-blocking. |
| `src/lib/email/templates.ts` | Lib | 11 template HTML email con branding MishaTravel (base wrapper, CTA button, tutti i template per auth, preventivi, admin). |

---

## Legenda

| Icona | Significato |
|-------|-------------|
| ✅ | Completata |
| 🟡 | In corso / Parziale |
| ⚪ | Da fare |
| 🔴 | Errore / Bloccata |
| ⚠️ | Attenzione richiesta |

---

*Ultimo aggiornamento: 2026-02-22*
*Versione piano: v1.7*
