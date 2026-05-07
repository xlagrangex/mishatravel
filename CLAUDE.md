# MishaTravel - Istruzioni per Claude Code

> Questo file viene letto automaticamente da Claude Code all'inizio di ogni sessione.
> Contiene tutto il contesto necessario per lavorare sul progetto senza perdere informazioni.

---

## Il Progetto in Breve

MishaTravel e un tour operator italiano (mishatravel.com). Stiamo ricostruendo il loro sito WordPress come applicazione React moderna con admin panel e area riservata agenzie.

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase (PostgreSQL, Auth, Storage) + Brevo (email)

**Deploy**: Vercel (auto-deploy da GitHub) + Supabase Cloud

**Repo**: https://github.com/xlagrangex/mishatravel (branch: main)

---

## I 5 File di Progetto - LEGGILI SEMPRE

All'inizio di ogni sessione, DEVI leggere questi 5 file per avere il contesto completo:

### 1. `CLAUDE.md` (questo file)
- **Cosa contiene**: Istruzioni operative per Claude, regole di comportamento, contesto del progetto
- **Come usarlo**: Leggilo per primo. Contiene le regole da seguire durante la sessione.
- **Chi lo modifica**: Solo su richiesta esplicita dell'utente

### 2. `PROJECT_OVERVIEW.md`
- **Cosa contiene**: La visione funzionale completa del progetto. Ogni sezione del sito, ogni pagina, ogni flusso (agenzie, preventivi, admin panel), tutti i ruoli, lo schema delle route, la descrizione dettagliata di cosa fa ogni funzionalita.
- **Come usarlo**: Consultalo per capire COSA deve fare una funzionalita. E' il documento di riferimento funzionale.
- **Chi lo modifica**: Claude, quando l'utente richiede modifiche al piano funzionale. Ogni modifica va registrata nel CHANGELOG.md.

### 3. `SPRINT_PLAN.md`
- **Cosa contiene**: Il piano di sviluppo operativo suddiviso in 11 sprint con ~65 task atomiche. Ogni task ha ID, descrizione, dipendenze. Include i punti in cui chiedere credenziali all'utente.
- **Come usarlo**: Consultalo per sapere COSA fare dopo. Segui le task in ordine rispettando le dipendenze. Prima di iniziare una task, verifica che le sue dipendenze siano completate.
- **Chi lo modifica**: Claude, quando l'utente richiede modifiche al piano o quando emergono nuove task. Ogni modifica va registrata nel CHANGELOG.md.

### 4. `CHANGELOG.md`
- **Cosa contiene**: Il registro vivo dell'avanzamento del progetto. Contiene:
  - Progresso totale con percentuale e barra visuale
  - Stato di ogni sprint (non iniziato / in corso / completato)
  - Dettaglio di ogni task (stato, data completamento, note, errori)
  - Registro errori con problema, risoluzione e stato
  - Storico delle modifiche ai documenti di piano (con data, motivo, cosa e cambiato)
  - Storico delle credenziali fornite
- **Come usarlo**: AGGIORNALO SEMPRE. Dopo ogni task completata, ogni errore incontrato, ogni modifica al piano. E' la memoria del progetto tra le sessioni.
- **Chi lo modifica**: Claude, dopo ogni azione significativa.

### 5. `CREDENTIALS.md` (GITIGNORED)
- **Cosa contiene**: Tutte le credenziali, chiavi API, accessi ai servizi (Supabase, GitHub, Vercel, Brevo, WordPress, dominio).
- **Come usarlo**: Consultalo per trovare le credenziali necessarie. NON scrivere mai credenziali in altri file committati.
- **Chi lo modifica**: Claude, quando l'utente fornisce nuove credenziali. Le variabili d'ambiente vanno anche in `.env.local`.
- **IMPORTANTE**: Questo file e gitignored. Non viene mai pushato su GitHub. Le credenziali reali vanno SOLO qui e in `.env.local`.

---

## Regole Operative

### All'Inizio di Ogni Sessione
1. Leggi `CHANGELOG.md` per capire dove siamo arrivati
2. Leggi `SPRINT_PLAN.md` per capire cosa fare dopo
3. Se serve contesto su una funzionalita, leggi `PROJECT_OVERVIEW.md`
4. Se servono credenziali, leggi `CREDENTIALS.md`

### Durante lo Sviluppo
1. **Prima di iniziare una task**: Verifica le dipendenze nel SPRINT_PLAN.md
2. **Durante una task**: Se incontri un errore, registralo nel CHANGELOG.md
3. **Dopo ogni commit**: Fai sempre `git push` (istruzione globale dell'utente)

### ⚠️ REGOLA CRITICA: Sistema di Versionamento e Aggiornamento File MD

**Questa regola e AUTOMATICA. Non devo aspettare che l'utente me lo chieda.**

#### Versione del Piano
La versione segue il formato `vX.Y` dove:
- **X** = major (cambia solo con ristrutturazioni complete del piano)
- **Y** = minor (incrementa ad ogni modifica, vedi trigger sotto)

La versione corrente e indicata in fondo a TUTTI i 4 file MD. Deve essere SEMPRE sincronizzata.

#### Trigger di aggiornamento: QUANDO aggiornare i file MD

| Evento (trigger) | Incremento versione? | Cosa aggiornare |
|-------------------|---------------------|-----------------|
| **Task completata** (codice scritto e funzionante) | NO | CHANGELOG.md (stato task → ✅), CLAUDE.md (Stato Attuale) |
| **Errore incontrato** | NO | CHANGELOG.md (sezione errori) |
| **Nuovo file creato** | NO | CHANGELOG.md (lista file), CLAUDE.md (struttura progetto se strutturale) |
| **Dipendenza installata** | NO | CLAUDE.md (lista dipendenze) |
| **L'utente chiede una nuova feature/modifica al piano** | SI → v1.Y+1 | TUTTI e 4: SPRINT_PLAN.md (nuove task), PROJECT_OVERVIEW.md (nuova descrizione funzionale), CHANGELOG.md (Modifica #N), CLAUDE.md (stato attuale) |
| **Emerge una necessita tecnica che cambia il piano** | SI → v1.Y+1 | Come sopra |
| **Credenziale fornita** | NO | CREDENTIALS.md, .env.local, CHANGELOG.md (storico credenziali) |
| **Fine sessione** | NO | CLAUDE.md (Stato Attuale aggiornato per la prossima sessione) |

#### Procedura per incremento versione (trigger con "SI")

Quando il trigger richiede incremento versione, eseguire TUTTI questi passi PRIMA di iniziare a scrivere codice:

1. **SPRINT_PLAN.md**: Aggiungere le nuove task con ID sequenziale (es. 1.13, 1.14...), descrizione, dipendenze, stato ⚪
2. **PROJECT_OVERVIEW.md**: Aggiornare la descrizione funzionale della sezione interessata
3. **CHANGELOG.md**:
   - Aggiungere voce "Modifica #N" con: data, file modificati, richiesto da, motivo, cosa e cambiato
   - Aggiungere le nuove task nella tabella dello sprint corrispondente
   - Aggiornare contatori (task totali, percentuali)
4. **CLAUDE.md**: Aggiornare "Stato Attuale"
5. **Tutti e 4 i file**: Aggiornare la riga `*Versione piano: vX.Y*` in fondo
6. **Commit**: `docs: register Modifica #N - [breve descrizione]` + push
7. **Solo dopo** questo commit, iniziare a implementare

#### Procedura per task completata (trigger senza incremento versione)

Dopo aver completato una task e committato il codice:
1. CHANGELOG.md: Stato task → ✅, data completamento, note
2. CLAUDE.md: Aggiornare "Stato Attuale" (sprint corrente, prossimo step, percentuale)
3. Commit: includere gli aggiornamenti MD nello stesso commit del codice, oppure in un commit separato subito dopo
4. Push

#### Regola d'oro
**MAI accumulare piu di 1 task completata senza aggiornare i file MD. MAI ricevere una richiesta di modifica dall'utente e iniziare a scrivere codice senza prima aver aggiornato il piano.**

### Gestione Credenziali
- Le credenziali vanno SOLO in `CREDENTIALS.md` (gitignored) e `.env.local` (gitignored)
- MAI scrivere credenziali in file committati
- Quando l'utente fornisce nuove credenziali, aggiorna entrambi i file
- Aggiorna anche il CHANGELOG.md nella sezione "Storico Credenziali Fornite"

### Gestione Errori
- Ogni errore va registrato nel CHANGELOG.md nella sezione "Registro Errori e Problemi"
- Formato: Data | Task | Errore | Risoluzione | Stato
- Se un errore blocca una task, segnala la task come 🔴 Bloccata

---

## Struttura del Progetto

```
MISHATRAVEL/
├── CLAUDE.md                    ← Questo file (istruzioni per Claude)
├── PROJECT_OVERVIEW.md          ← Visione funzionale del progetto
├── SPRINT_PLAN.md               ← Piano sprint con task operative
├── CHANGELOG.md                 ← Registro avanzamento e modifiche
├── CREDENTIALS.md               ← Credenziali (GITIGNORED)
├── .env.local                   ← Variabili d'ambiente (GITIGNORED)
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  ← Schema DB completo (38 tabelle, RLS, triggers)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← Layout root minimale (fonts + html/body)
│   │   │
│   │   ├── (public)/            ← Route group sito pubblico (URL invariati)
│   │   │   ├── layout.tsx       ← Layout pubblico (TopBar + Header + Footer)
│   │   │   ├── page.tsx         ← Homepage
│   │   │   ├── tours/           ← Tour (lista + [slug])
│   │   │   ├── crociere/        ← Crociere fluviali (lista + [slug])
│   │   │   ├── flotta/          ← Flotta navi (lista + [slug])
│   │   │   ├── destinazioni/    ← Destinazioni (lista + [slug])
│   │   │   ├── blog/            ← Blog (lista + [slug])
│   │   │   ├── calendario-partenze/
│   │   │   ├── cataloghi/
│   │   │   ├── login/           ← Login agenzie (UI pronta, no backend)
│   │   │   ├── registrazione/
│   │   │   ├── reset/
│   │   │   ├── contatti/
│   │   │   ├── diventa-partner/
│   │   │   ├── trova-agenzia/
│   │   │   └── [pagine legali]/ ← Privacy, Cookie, T&C, etc.
│   │   │
│   │   ├── admin/               ← Admin panel (layout separato, noindex)
│   │   │   ├── layout.tsx       ← Layout admin (AdminShell)
│   │   │   ├── page.tsx         ← Dashboard con statistiche
│   │   │   ├── destinazioni/    ← CRUD destinazioni (collegato Supabase)
│   │   │   │   ├── page.tsx, DestinazioniTable.tsx, actions.ts
│   │   │   │   ├── nuovo/page.tsx, [id]/modifica/page.tsx
│   │   │   ├── tours/           ← CRUD tours (collegato Supabase)
│   │   │   │   ├── page.tsx, AdminToursTable.tsx, actions.ts
│   │   │   │   ├── nuovo/page.tsx, [id]/modifica/page.tsx
│   │   │   ├── crociere/        ← CRUD crociere (collegato Supabase)
│   │   │   ├── flotta/          ← CRUD flotta (collegato Supabase)
│   │   │   ├── partenze/        ← Placeholder (sola lettura)
│   │   │   ├── blog/            ← CRUD blog (collegato Supabase)
│   │   │   ├── cataloghi/       ← CRUD cataloghi (collegato Supabase)
│   │   │   ├── media/           ← Media library (collegato Supabase)
│   │   │   ├── agenzie/         ← Placeholder
│   │   │   ├── preventivi/      ← Placeholder
│   │   │   ├── estratti-conto/  ← Placeholder
│   │   │   └── utenti/          ← Placeholder
│   │   │
│   │   └── (agenzia)/           ← Route group area riservata agenzie (noindex)
│   │       ├── layout.tsx       ← Layout agenzia (AgenziaShell, fetch nome + notifiche)
│   │       └── agenzia/
│   │           ├── dashboard/page.tsx  ← Dashboard con contatori e richieste recenti
│   │           ├── richieste/         ← Le Mie Richieste (da fare)
│   │           ├── offerte/           ← Offerte Ricevute (da fare)
│   │           ├── estratto-conto/    ← Estratto Conto (da fare)
│   │           └── profilo/           ← Profilo Agenzia (da fare)
│   │
│   ├── components/
│   │   ├── layout/              ← TopBar, Header, Footer, PageHero
│   │   ├── cards/               ← TourCard, CruiseCard, DestinationCard, BlogCard, ShipCard
│   │   ├── admin/               ← Componenti admin panel
│   │   │   ├── AdminShell.tsx   ← Shell con sidebar collassabile + mobile sheet
│   │   │   ├── AdminSidebar.tsx ← Sidebar 16 voci, 3 sezioni
│   │   │   ├── AdminHeader.tsx  ← Header con notifiche e user menu
│   │   │   ├── ImageUpload.tsx  ← Upload immagini drag&drop con preview
│   │   │   ├── FileUpload.tsx   ← Upload file (PDF) con progress
│   │   │   ├── RichTextEditor.tsx ← Editor Tiptap con toolbar
│   │   │   ├── MapPicker.tsx     ← Leaflet map picker per coordinate
│   │   │   └── forms/
│   │   │       ├── DestinationForm.tsx ← Form destinazione con MapPicker
│   │   │       ├── TourForm.tsx       ← Form tour 8 tab con autocomplete localita
│   │   │       ├── ShipForm.tsx       ← Form nave 6 tab (info, adatta per, attivita, servizi, cabine, gallery)
│   │   │       ├── BlogPostForm.tsx   ← Form blog post con categorie
│   │   │       └── CatalogForm.tsx    ← Form catalogo
│   │   ├── agenzia/              ← Componenti area agenzia
│   │   │   ├── AgenziaShell.tsx  ← Shell con sidebar collassabile + mobile sheet
│   │   │   ├── AgenziaSidebar.tsx ← Sidebar 5 voci (Dashboard, Richieste, Offerte, Estratto, Profilo)
│   │   │   └── AgenziaHeader.tsx ← Header con nome agenzia, notifiche, logout
│   │   ├── auth/                 ← Componenti autenticazione
│   │   │   └── AuthProvider.tsx  ← Client context provider + useAuth hook
│   │   └── ui/                  ← 22 componenti shadcn/ui + autocomplete
│   │
│   ├── lib/
│   │   ├── data.ts              ← Dati mock (1935 righe) - ancora usati dal sito pubblico
│   │   ├── types.ts             ← 40 interfacce TypeScript + 3 tipi compositi
│   │   ├── utils.ts             ← Utility (cn helper)
│   │   ├── auth/
│   │   │   └── role-config.ts   ← SECTION_MAP, ADMIN_ROLES, PROTECTED_PREFIXES
│   │   ├── email/
│   │   │   ├── brevo.ts         ← Servizio email Brevo (fetch API v3, non-blocking)
│   │   │   └── templates.ts     ← 11 template HTML email con branding MishaTravel
│   │   └── supabase/
│   │       ├── client.ts        ← Supabase client per browser
│   │       ├── server.ts        ← Supabase client per server (SSR)
│   │       ├── admin.ts         ← Supabase client admin (service_role, bypassa RLS)
│   │       ├── auth.ts          ← Auth helpers (getCurrentUser, getUserRole, getAuthContext)
│   │       └── queries/
│   │           ├── destinations.ts ← getDestinations, getDestinationById, getDestinationOptions
│   │           ├── tours.ts       ← getTours, getTourById
│   │           ├── cruises.ts     ← getCruises, getPublishedCruises, getCruiseBySlug
│   │           ├── ships.ts       ← getShips, getPublishedShips, getShipBySlug
│   │           ├── blog.ts        ← getBlogPosts, getPublishedBlogPosts, getBlogPostBySlug
│   │           ├── catalogs.ts    ← getCatalogs, getPublishedCatalogs
│   │           ├── media.ts       ← getMediaItems, deleteMediaItem
│   │           ├── localities.ts  ← getDistinctLocalities (autocomplete)
│   │           ├── departures.ts  ← getAllDepartures (UnifiedDeparture)
│   │           ├── agencies.ts    ← getActiveAgencies
│   │           ├── agency-dashboard.ts ← getAgencyByUserId, getQuoteRequestCountsByStatus, getRecentQuoteRequests, getRecentNotifications
│   │           ├── quotes.ts          ← getAgencyQuotes, getQuoteById, getAgencyOffers, acceptOffer, declineOffer
│   │           └── account-statements.ts ← getAgencyStatements (con filtro date range)
│   │
│   └── middleware.ts             ← Middleware: session refresh + protezione route (ruoli + permessi)
│
├── public/
│   └── images/                  ← Immagini locali (logo, hero, tour, crociere, navi)
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── components.json              ← Config shadcn/ui
└── .gitignore
```

---

## Stato Attuale (aggiorna questa sezione ad ogni sessione)

- **Sprint corrente**: Sprint 12 completato al 100%. Sprint 0-9+11+12 completati, Sprint 10 al 90%.
- **Ultima azione**: Sprint 12 chiuso. Migration `010_tour_secondary_destination.sql` applicata; form admin, query e visualizzazione pubbliche supportano tour con doppia destinazione (es. "Giappone + Corea del Sud"). Build OK.
- **Prossimo step**: Task 10.5 (deploy produzione su Vercel - serve accesso DNS dominio)
- **Bloccanti**: Task 10.5 bloccata da accesso DNS dominio.
- **Progresso totale**: 99% (86/~87 task completate).

---

## Convenzioni di Codice

### Naming
- Componenti: PascalCase (es. `TourCard.tsx`)
- Utility/lib: camelCase (es. `createClient.ts`)
- Route: kebab-case in italiano (es. `/crociere-fluviali/[slug]`)
- Tabelle DB: snake_case in inglese (es. `tour_itinerary_days`)

### Lingua
- **UI**: Italiano (tutta l'interfaccia)
- **Codice**: Inglese (variabili, funzioni, commenti tecnici)
- **Database**: Inglese (nomi tabelle e colonne)
- **Documentazione progetto**: Italiano (CLAUDE.md, OVERVIEW, SPRINT_PLAN, CHANGELOG)

### Design System
- Colore primario (rosso): `#C41E2F`
- Colore secondario (navy): `#1B2D4F`
- Font heading: Poppins
- Font body: Inter
- Componenti UI: shadcn/ui con customizzazione brand

### Git
- Commit in inglese, prefisso convenzionale: `feat:`, `fix:`, `docs:`, `refactor:`
- Push SEMPRE dopo ogni commit (istruzione utente)
- Co-authored-by Claude in ogni commit
- Mai committare .env*, CREDENTIALS.md

---

## Dipendenze Installate

```json
{
  "@supabase/supabase-js": "^2.97.0",
  "@supabase/ssr": "^0.8.0",
  "@hookform/resolvers": "^5.0.1",
  "@tiptap/extension-image": "^2.12.0",
  "@tiptap/extension-link": "^2.12.0",
  "@tiptap/pm": "^2.12.0",
  "@tiptap/react": "^2.12.0",
  "@tiptap/starter-kit": "^2.12.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.575.0",
  "next": "16.1.6",
  "radix-ui": "^1.4.3",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "react-hook-form": "^7.56.4",
  "tailwind-merge": "^3.5.0",
  "zod": "^3.25.11"
}
```

---

*Ultimo aggiornamento: 2026-05-07*
*Versione piano: v1.8*
