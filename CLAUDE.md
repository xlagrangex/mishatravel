# MishaTravel - Istruzioni per Claude Code

> Questo file viene letto automaticamente da Claude Code all'inizio di ogni sessione.
> Contiene tutto il contesto necessario per lavorare sul progetto senza perdere informazioni.

---

## Il Progetto in Breve

MishaTravel e un tour operator italiano (mishatravel.com). Stiamo ricostruendo il loro sito WordPress come applicazione React moderna con admin panel e area riservata agenzie.

**Stack**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase (PostgreSQL, Auth, Storage) + Brevo (email)

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
3. **Dopo ogni task completata**: Aggiorna CHANGELOG.md (stato task, data, note)
4. **Dopo ogni commit**: Fai sempre `git push` (istruzione globale dell'utente)

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
├── src/
│   ├── app/                     ← Next.js App Router (27 pagine gia costruite)
│   │   ├── layout.tsx           ← Layout root (TopBar + Header + Footer)
│   │   ├── page.tsx             ← Homepage
│   │   ├── tours/               ← Tour (lista + [slug])
│   │   ├── crociere/            ← Crociere fluviali (lista + [slug])
│   │   ├── flotta/              ← Flotta navi (lista + [slug])
│   │   ├── destinazioni/        ← Destinazioni (lista + [slug])
│   │   ├── blog/                ← Blog (lista + [slug])
│   │   ├── calendario-partenze/ ← Calendario partenze
│   │   ├── cataloghi/           ← Cataloghi PDF
│   │   ├── login/               ← Login agenzie (UI pronta, no backend)
│   │   ├── registrazione/       ← Registrazione (UI pronta, no backend)
│   │   ├── reset/               ← Reset password (UI pronta, no backend)
│   │   ├── contatti/            ← Contatti
│   │   ├── diventa-partner/     ← Diventa partner
│   │   ├── trova-agenzia/       ← Trova agenzia
│   │   └── [pagine legali]/     ← Privacy, Cookie, T&C, etc.
│   │
│   ├── components/
│   │   ├── layout/              ← TopBar, Header, Footer, PageHero
│   │   ├── cards/               ← TourCard, CruiseCard, DestinationCard, BlogCard, ShipCard
│   │   └── ui/                  ← 14 componenti shadcn/ui
│   │
│   ├── lib/
│   │   ├── data.ts              ← Dati mock (1935 righe) - DA SOSTITUIRE CON SUPABASE
│   │   ├── utils.ts             ← Utility (cn helper)
│   │   └── supabase/
│   │       ├── client.ts        ← Supabase client per browser
│   │       └── server.ts        ← Supabase client per server (SSR)
│   │
│   └── middleware.ts             ← Middleware per refresh sessione Supabase
│
├── public/
│   └── images/                  ← Immagini locali (logo, hero, tour, crociere, navi)
│
├── package.json                 ← Dipendenze: next, react, supabase, shadcn, radix, lucide
├── next.config.ts
├── tsconfig.json
├── components.json              ← Config shadcn/ui
└── .gitignore
```

---

## Stato Attuale (aggiorna questa sezione ad ogni sessione)

- **Sprint corrente**: Sprint 0 quasi completato, pronto per Sprint 1
- **Ultima azione**: Consolidato frontend esistente, configurato Supabase, creato CHANGELOG
- **Prossimo step**: Sprint 1 - Schema database Supabase + Admin Panel
- **Bloccanti**: Nessuno
- **Da chiedere all'utente**: Service Role Key di Supabase (per operazioni admin lato server)

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
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.575.0",
  "next": "16.1.6",
  "radix-ui": "^1.4.3",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwind-merge": "^3.5.0"
}
```

### Da installare (Sprint 1):
- `react-hook-form` + `zod` (form e validazione per admin panel)
- `@tiptap/react` + estensioni (rich text editor per admin)
- `date-fns` (formattazione date)

---

*Ultimo aggiornamento: 2026-02-21*
*Versione piano: v1.2*
