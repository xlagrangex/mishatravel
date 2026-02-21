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
3. **Dopo OGNI micro-modifica**: Aggiorna TUTTI i file MD pertinenti (CHANGELOG.md, CLAUDE.md sezione "Stato Attuale", SPRINT_PLAN.md). NON aspettare la fine dello sprint o di un blocco di task. Ogni singola modifica al codice → aggiornamento immediato dei file MD.
4. **Dopo ogni commit**: Fai sempre `git push` (istruzione globale dell'utente)

### ⚠️ REGOLA CRITICA: Aggiornamento File MD
**Alla fine di OGNI micro-modifica devi aggiornare i file MD.**
Questo significa:
- Ogni nuovo file creato → aggiorna CHANGELOG.md e struttura in CLAUDE.md se necessario
- Ogni componente completato → aggiorna stato task in CHANGELOG.md
- Ogni errore incontrato → registra in CHANGELOG.md sezione errori
- Ogni dipendenza installata → aggiorna lista in CLAUDE.md
- Ogni modifica strutturale (route, layout) → aggiorna struttura progetto in CLAUDE.md
- **MAI accumulare modifiche senza aggiornare i file MD**

### Quando l'Utente Chiede Modifiche al Piano
1. Aggiorna `PROJECT_OVERVIEW.md` e/o `SPRINT_PLAN.md`
2. Registra la modifica nel CHANGELOG.md nella sezione "Storico Modifiche al Piano" con:
   - Data
   - File modificati
   - Richiesto da (utente / necessita tecnica)
   - Motivo
   - Cosa e cambiato nel dettaglio
   - Incrementa la versione del piano (v1.1 → v1.2 → v1.3...)
3. Aggiorna le percentuali di avanzamento nel CHANGELOG.md

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
│   │   └── admin/               ← Admin panel (layout separato, noindex)
│   │       ├── layout.tsx       ← Layout admin (AdminShell)
│   │       ├── page.tsx         ← Dashboard con statistiche
│   │       ├── destinazioni/    ← CRUD destinazioni (collegato Supabase)
│   │       │   ├── page.tsx, DestinazioniTable.tsx, actions.ts
│   │       │   ├── nuovo/page.tsx, [id]/modifica/page.tsx
│   │       ├── tours/           ← CRUD tours (collegato Supabase)
│   │       │   ├── page.tsx, AdminToursTable.tsx, actions.ts
│   │       │   ├── nuovo/page.tsx, [id]/modifica/page.tsx
│   │       ├── crociere/        ← Placeholder
│   │       ├── flotta/          ← Placeholder
│   │       ├── partenze/        ← Placeholder (sola lettura, legge da tour/crociere)
│   │       ├── blog/            ← Placeholder
│   │       ├── cataloghi/       ← Placeholder
│   │       ├── media/           ← Placeholder
│   │       ├── agenzie/         ← Placeholder
│   │       ├── preventivi/      ← Placeholder
│   │       ├── estratti-conto/  ← Placeholder
│   │       └── utenti/          ← Placeholder
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
│   │   │   └── forms/
│   │   │       ├── DestinationForm.tsx ← Form destinazione con Zod
│   │   │       └── TourForm.tsx       ← Form tour 8 tab con useFieldArray
│   │   └── ui/                  ← 19 componenti shadcn/ui
│   │
│   ├── lib/
│   │   ├── data.ts              ← Dati mock (1935 righe) - ancora usati dal sito pubblico
│   │   ├── types.ts             ← 40 interfacce TypeScript + 3 tipi compositi
│   │   ├── utils.ts             ← Utility (cn helper)
│   │   └── supabase/
│   │       ├── client.ts        ← Supabase client per browser
│   │       ├── server.ts        ← Supabase client per server (SSR)
│   │       ├── admin.ts         ← Supabase client admin (service_role, bypassa RLS)
│   │       └── queries/
│   │           ├── destinations.ts ← getDestinations, getDestinationById, getDestinationOptions
│   │           └── tours.ts       ← getTours, getTourById
│   │
│   └── middleware.ts             ← Middleware per refresh sessione Supabase
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

- **Sprint corrente**: Sprint 1 - Database + Admin Base (90% - mancano task 1.13 Map Picker e 1.14 Autocomplete localita)
- **Ultima azione**: Admin collegato a Supabase (CRUD Destinazioni + Tour), preview links aggiunti, file MD aggiornati con Modifica #5
- **Prossimo step**: Task 1.13 (Map Picker Leaflet per coordinate) oppure Sprint 2 (CRUD Crociere + Flotta)
- **Bloccanti**: Nessuno
- **Progresso totale**: ~38% (17/69 task completate)

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

*Ultimo aggiornamento: 2026-02-21*
*Versione piano: v1.5*
