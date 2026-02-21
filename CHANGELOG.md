# MishaTravel - Changelog & Registro Avanzamento

> Registro completo di avanzamento, modifiche al piano, errori e decisioni prese durante lo sviluppo.

---

## Stato Generale del Progetto

| Metrica | Valore |
|---------|--------|
| **Progresso Totale** | ████████░░░░░░░░░░░░ 38% |
| **Sprint Corrente** | Sprint 1 (completamento task 1.13, 1.14) → Sprint 2 |
| **Task Completate** | 17 / ~69 |
| **Task In Corso** | 0 |
| **Task Bloccate** | 0 |
| **Ultima Attivita** | 2026-02-21 |

---

## Progresso per Sprint

| Sprint | Titolo | Stato | Progresso | Note |
|--------|--------|-------|-----------|------|
| 0 | Setup e Configurazione | ✅ Completato | ██████████ 100% | Tutte le credenziali fornite, progetto configurato, repo su GitHub |
| 1 | Database + Admin Base | 🟡 Quasi completato | █████████░ 90% | Schema DB eseguito, admin collegato a Supabase. Mancano: Map Picker (1.13), autocomplete localita (1.14). |
| 2 | Admin Crociere + Flotta | 🟡 Parziale | ██░░░░░░░░ 20% | Pagine placeholder create per tutte le sezioni |
| 3 | Sito Pubblico - Pagine Core | 🟡 Parziale | ██████████ 95% | 27 pagine gia costruite con dati mock, manca solo collegamento DB |
| 4 | Calendario + Destinazioni + Blog | 🟡 Parziale | ████████░░ 80% | Pagine esistenti, manca collegamento DB |
| 5 | Autenticazione Agenzie | ⚪ Non iniziato | ░░░░░░░░░░ 0% | |
| 6 | Area Riservata Agenzie | ⚪ Non iniziato | ░░░░░░░░░░ 0% | |
| 7 | Flusso Preventivi + Gestione Utenti | ⚪ Non iniziato | ░░░░░░░░░░ 0% | |
| 8 | Email Transazionali (Brevo) | ⚪ Non iniziato | ░░░░░░░░░░ 0% | |
| 9 | Migrazione Dati WordPress | 🟡 Parziale | ██░░░░░░░░ 15% | ACF export analizzato, mapping campi completato |
| 10 | SEO, Performance, Deploy | ⚪ Non iniziato | ░░░░░░░░░░ 0% | |

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
| 1.13 | Map Picker per input coordinate (Leaflet) | ⚪ Da fare | - | Componente MapPicker con Leaflet+OpenStreetMap nel form destinazione. Click su mappa, ricerca localita, pin draggabile. |
| 1.14 | Auto-suggerimento localita itinerario tour | ⚪ Da fare | - | Autocomplete nel campo localita del TourForm (tab Programma) con localita gia usate in altri tour. |

### SPRINT 2 - Admin Crociere + Flotta

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 2.1 | Admin: Gestione Flotta/Navi | 🟡 Placeholder | 2026-02-21 | Pagina placeholder creata, CRUD da implementare |
| 2.2 | Admin: Gestione Crociere Fluviali | 🟡 Placeholder | 2026-02-21 | Pagina placeholder creata |
| 2.3 | Admin: Vista Calendario Partenze (sola lettura) | 🟡 Placeholder | 2026-02-21 | Pagina placeholder creata. Semplificata: sola lettura, legge da tour_departures/cruise_departures. |
| 2.4 | Admin: Gestione Blog | 🟡 Placeholder | 2026-02-21 | Pagina placeholder creata |
| 2.5 | Admin: Gestione Cataloghi | 🟡 Placeholder | 2026-02-21 | Pagina placeholder creata |
| 2.6 | Admin: Libreria Media | 🟡 Placeholder | 2026-02-21 | Pagina placeholder creata |

### SPRINT 3 - Sito Pubblico - Pagine Core

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 3.1 | Header e Navigazione pubblica | ✅ Gia presente | 2026-02-21 | Mega menu, responsive, TopBar. Consolidato da frontend. |
| 3.2 | Footer | ✅ Gia presente | 2026-02-21 | Footer completo con contatti, link, social. |
| 3.3 | Homepage | ✅ UI pronta | 2026-02-21 | Hero slider, destinazioni, tour, crociere. Dati mock. |
| 3.4 | Pagina Lista Tour | ✅ UI pronta | 2026-02-21 | Griglia card, filtri. Dati mock. |
| 3.5 | Pagina Dettaglio Tour | ✅ UI pronta | 2026-02-21 | Gallery, itinerario, partenze, incluso/escluso. Dati mock. |
| 3.6 | Pagina Lista Crociere | ✅ UI pronta | 2026-02-21 | Griglia card. Dati mock. |
| 3.7 | Pagina Dettaglio Crociera | ✅ UI pronta | 2026-02-21 | Completa. Dati mock. |
| 3.8 | Pagina Lista Flotta | ✅ UI pronta | 2026-02-21 | Griglia navi. Dati mock. |
| 3.9 | Pagina Dettaglio Nave | ✅ UI pronta | 2026-02-21 | Completa. Dati mock. |

### SPRINT 4 - Calendario + Destinazioni + Blog + Cataloghi

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 4.1 | Calendario Partenze Pubblico | ✅ UI pronta | 2026-02-21 | Dati mock. |
| 4.2 | Pagina Destinazioni | ✅ UI pronta | 2026-02-21 | Griglia destinazioni. Dati mock. |
| 4.3 | Pagina Singola Destinazione | ✅ UI pronta | 2026-02-21 | Dati mock. |
| 4.4 | Blog Pubblico | ✅ UI pronta | 2026-02-21 | Lista + singolo articolo. Dati mock. |
| 4.5 | Cataloghi | ✅ UI pronta | 2026-02-21 | Dati mock. |
| 4.6 | Pagine Statiche | ✅ UI pronta | 2026-02-21 | Contatti, diventa-partner, trova-agenzia, legali. |

### SPRINT 5 - Autenticazione Agenzie

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 5.1 | Setup Supabase Auth + Ruoli | ⚪ Da fare | - | |
| 5.2 | Pagina Registrazione Agenzia | ⚪ Da fare | - | |
| 5.3 | Pagina Login | ⚪ Da fare | - | |
| 5.4 | Recupero Password | ⚪ Da fare | - | |
| 5.5 | Middleware protezione route | ⚪ Da fare | - | |
| 5.6 | Logica "Accedi per prenotare" | ⚪ Da fare | - | |

### SPRINT 6 - Area Riservata Agenzie

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 6.1 | Layout Area Agenzia | ⚪ Da fare | - | |
| 6.2 | Dashboard Agenzia | ⚪ Da fare | - | |
| 6.3 | Configuratore Pacchetto Tour | ⚪ Da fare | - | |
| 6.4 | Configuratore Pacchetto Crociera | ⚪ Da fare | - | |
| 6.5 | Le Mie Richieste | ⚪ Da fare | - | |
| 6.6 | Offerte Ricevute | ⚪ Da fare | - | |
| 6.7 | Estratto Conto | ⚪ Da fare | - | |
| 6.8 | Profilo Agenzia | ⚪ Da fare | - | |

### SPRINT 7 - Flusso Preventivi + Gestione Utenti

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 7.1 | Admin: Lista Preventivi | 🟡 Placeholder | 2026-02-21 | Pagina placeholder |
| 7.2 | Admin: Dettaglio Richiesta + Timeline | ⚪ Da fare | - | |
| 7.3 | Admin: Modifica Richiesta e Crea Offerta | ⚪ Da fare | - | |
| 7.4 | Admin: Invio Estremi Pagamento | ⚪ Da fare | - | |
| 7.5 | Admin: Conferma Pagamento e Rifiuto | ⚪ Da fare | - | |
| 7.6 | Admin: Gestione Agenzie | 🟡 Placeholder | 2026-02-21 | Pagina placeholder |
| 7.7 | Admin: Gestione Utenti e Ruoli | 🟡 Placeholder | 2026-02-21 | Pagina placeholder |
| 7.8 | Hook Sidebar dinamica permessi | ⚪ Da fare | - | |
| 7.9 | Sistema Notifiche In-App | ⚪ Da fare | - | |

### SPRINT 8 - Email Transazionali (Brevo)

| ID | Task | Stato | Data Completamento | Note/Errori |
|----|------|-------|--------------------|-------------|
| 8.0 | Raccolta Credenziali Brevo | ⚪ Da fare | - | |
| 8.1 | Setup Brevo + Servizio Email | ⚪ Da fare | - | |
| 8.2 | Email Autenticazione | ⚪ Da fare | - | |
| 8.3 | Email Flusso Preventivi | ⚪ Da fare | - | |
| 8.4 | Email Notifiche Admin | ⚪ Da fare | - | |

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
| 10.1 | SEO Tecnico | ⚪ Da fare | - | |
| 10.2 | Redirect 301 da vecchi URL | ⚪ Da fare | - | |
| 10.3 | Ottimizzazione Performance | ⚪ Da fare | - | |
| 10.4 | Testing End-to-End | ⚪ Da fare | - | |
| 10.5 | Deploy Produzione | ⚪ Da fare | - | |

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
| - | Brevo | ⏳ In attesa | Serve per Sprint 8 |
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

*Ultimo aggiornamento: 2026-02-21*
*Versione piano: v1.5*
