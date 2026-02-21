# MishaTravel - Piano di Sviluppo Sprint

> Piano operativo suddiviso in sprint con task atomiche, dipendenze e punti di raccolta credenziali.

---

## Panoramica Sprint

| Sprint | Focus | Durata Stimata | Demoabile |
|--------|-------|---------------|-----------|
| 0 | Setup e Configurazione | 1 sessione | Progetto funzionante in locale |
| 1 | Database + Admin Base | 2-3 sessioni | Admin con CRUD tour funzionante |
| 2 | Admin Crociere + Flotta | 2-3 sessioni | Gestione completa crociere e flotta |
| 3 | Sito Pubblico - Pagine Core | 2-3 sessioni | Homepage, tour, crociere, flotta visibili |
| 4 | Calendario + Destinazioni + Cataloghi + Blog | 2 sessioni | Sito pubblico completo |
| 5 | Autenticazione Agenzie | 1-2 sessioni | Login, registrazione, area protetta |
| 6 | Area Riservata Agenzie | 2-3 sessioni | Dashboard, richieste, configuratore pacchetti |
| 7 | Flusso Preventivi + Gestione Utenti/Ruoli | 2-3 sessioni | Workflow preventivi + gestione admin/operatori/agenzie |
| 8 | Email Transazionali (Brevo) | 1-2 sessioni | Tutte le email funzionanti |
| 9 | Migrazione Dati WordPress | 1-2 sessioni | Contenuti importati dal vecchio sito |
| 10 | SEO, Performance, Deploy | 1-2 sessioni | Sito live su Vercel |

---

## SPRINT 0 - Setup e Configurazione

### Obiettivo: Progetto inizializzato, tutti i servizi configurati, repo su GitHub.

---

### 🔑 TASK 0.0 - Raccolta Credenziali Iniziali

**AZIONE RICHIESTA ALL'UTENTE** - Prima di iniziare devo avere:

- [ ] **GitHub**: Crea un repository (es. `mishatravel` o `mishatravel-app`) e condividi il nome/URL. Oppure dimmi le credenziali per crearlo io via `gh`.
- [ ] **Supabase**: Crea un progetto su [supabase.com](https://supabase.com) e forniscimi:
  - URL del progetto (`https://xxxxx.supabase.co`)
  - `anon` public key
  - `service_role` secret key (per operazioni admin)
  - Password del database (o accesso alla dashboard)
- [ ] **Vercel**: Account Vercel collegato a GitHub. Fornisci accesso o il team/account name per il deploy.

> Nota: Le credenziali WordPress/ACF e Brevo serviranno piu avanti (Sprint 8 e 9).

---

### TASK 0.1 - Inizializzazione progetto Next.js
- **Cosa**: `npx create-next-app@latest` con App Router, TypeScript, Tailwind CSS, ESLint
- **Output**: Progetto Next.js funzionante in locale
- **Dipendenze**: Nessuna

### TASK 0.2 - Installazione dipendenze
- **Cosa**: Installare shadcn/ui, Supabase client (`@supabase/supabase-js`, `@supabase/ssr`), icone (lucide-react), date library (date-fns), rich text editor (tiptap), form management (react-hook-form + zod)
- **Dipendenze**: 0.1

### TASK 0.3 - Configurazione Supabase client
- **Cosa**: Setup client Supabase per browser e server (SSR), file `.env.local` con le chiavi, middleware Next.js per gestione sessioni
- **Dipendenze**: 0.1, 0.0 (serve URL e chiavi Supabase)

### TASK 0.4 - Struttura cartelle e layout base
- **Cosa**: Creare la struttura delle cartelle (`(public)`, `(auth)`, `(agenzia)`, `admin`), layout root con font, metadata base, componente Header e Footer pubblici placeholder
- **Dipendenze**: 0.1

### TASK 0.5 - Setup repository GitHub e primo push
- **Cosa**: `git init`, `.gitignore` configurato (no `.env.local`), primo commit, push su GitHub
- **Dipendenze**: 0.0 (serve repo GitHub), 0.4

### TASK 0.6 - Deploy iniziale su Vercel
- **Cosa**: Collegare repo GitHub a Vercel, configurare variabili d'ambiente, primo deploy
- **Dipendenze**: 0.5, 0.0 (serve account Vercel)

---

## SPRINT 1 - Database + Admin Panel Base

### Obiettivo: Schema database creato, admin panel con layout e CRUD completo per i Tour.

---

### TASK 1.1 - Schema database Supabase (Parte 1 - Core)
- **Cosa**: Creare tramite Supabase SQL Editor le tabelle fondamentali:
  - `destinations` (id, name, slug, description, image_url, macro_area, sort_order, created_at, updated_at)
  - `tours` (id, title, slug, destination_id FK, short_description, full_description, duration_days, duration_nights, price_from, cover_image_url, status [draft/published], created_at, updated_at)
  - `tour_itinerary_days` (id, tour_id FK, day_number, title, description, image_url)
  - `tour_inclusions` (id, tour_id FK, text, is_included boolean)
  - `tour_gallery` (id, tour_id FK, image_url, caption, sort_order)
  - `tour_departures` (id, tour_id FK, departure_date, return_date, price, total_spots, available_spots, status)
  - `tour_extras` (id, tour_id FK, name, description, extra_price)
  - `blog_categories` (id, name, slug)
  - `blog_posts` (id, title, slug, category_id FK, cover_image_url, excerpt, content, meta_title, meta_description, status, published_at, created_at, updated_at)
  - `catalogs` (id, title, year, cover_image_url, pdf_url, sort_order, is_published)
  - `media` (id, filename, url, file_size, mime_type, width, height, folder, created_at)
- **Cosa anche**: Row Level Security (RLS) policies per ogni tabella
- **Dipendenze**: 0.3

### TASK 1.2 - Schema database Supabase (Parte 2 - Crociere e Flotta)
- **Cosa**: Creare le tabelle specifiche per crociere e flotta:
  - `ships` (id, name, slug, description, year_built, year_renovated, length_m, width_m, passenger_capacity, crew_count, tonnage, cover_image_url, created_at, updated_at)
  - `ship_decks` (id, ship_id FK, name, sort_order, plan_image_url)
  - `cabin_types` (id, ship_id FK, deck_id FK, name, description, size_sqm, amenities jsonb, quantity, cover_image_url)
  - `ship_services` (id, ship_id FK, name, description)
  - `ship_gallery` (id, ship_id FK, image_url, caption, sort_order)
  - `cruises` (id, title, slug, ship_id FK, destination_id FK, route_description, short_description, full_description, duration_days, duration_nights, price_from, cover_image_url, status, created_at, updated_at)
  - `cruise_itinerary_days` (id, cruise_id FK, day_number, title, description, image_url)
  - `cruise_inclusions` (id, cruise_id FK, text, is_included boolean)
  - `cruise_gallery` (id, cruise_id FK, image_url, caption, sort_order)
  - `cruise_departures` (id, cruise_id FK, departure_date, return_date, status)
  - `cruise_departure_prices` (id, departure_id FK, cabin_type_id FK, price)
  - `cruise_extras` (id, cruise_id FK, name, description, extra_price)
- **Dipendenze**: 1.1

### TASK 1.3 - Schema database Supabase (Parte 3 - Agenzie e Preventivi)
- **Cosa**: Tabelle per il sistema agenzie e preventivi:
  - `agencies` (id, user_id FK auth.users, business_name, vat_number, fiscal_code, license_number, address, city, zip_code, province, contact_name, phone, website, status [pending/active/blocked], created_at, updated_at)
  - `quote_requests` (id, agency_id FK, request_type [tour/cruise], tour_id FK nullable, cruise_id FK nullable, departure_id FK nullable, participants_adults, participants_children, cabin_type_id FK nullable, num_cabins, notes, status [sent/in_review/offer_sent/accepted/declined/payment_sent/confirmed/rejected], created_at, updated_at)
  - `quote_request_extras` (id, request_id FK, extra_id, quantity)
  - `quote_offers` (id, request_id FK, package_details jsonb, total_price decimal, conditions text, payment_terms text, offer_expiry date, created_at)
  - `quote_payments` (id, request_id FK, bank_details text, amount decimal, reference text, status [pending/received/confirmed], created_at)
  - `quote_timeline` (id, request_id FK, action text, details text, actor_type [admin/agency], created_at)
  - `notifications` (id, user_id FK, title, message, is_read boolean, link, created_at)
  - `user_roles` (id, user_id FK auth.users, role enum [super_admin/admin/operator/agency], created_at, updated_at)
  - `operator_permissions` (id, user_id FK, section enum [tours/cruises/fleet/departures/destinations/agencies/quotes/blog/catalogs/media/users_readonly], created_at)
  - `user_activity_log` (id, user_id FK, action text, details text, ip_address text, created_at)
- **Dipendenze**: 1.1

### TASK 1.4 - Supabase Storage buckets
- **Cosa**: Creare i bucket di storage: `tours`, `cruises`, `ships`, `blog`, `catalogs`, `agencies`, `general`. Configurare policies di accesso (pubblico in lettura, autenticato in scrittura per admin).
- **Dipendenze**: 0.3

### TASK 1.5 - Layout Admin Panel
- **Cosa**: Creare il layout dell'admin panel con:
  - Sidebar di navigazione con tutte le voci (Dashboard, Tour, Crociere, Flotta, Partenze, Destinazioni, Agenzie, Utenti, Preventivi, Blog, Cataloghi, Media)
  - Le voci della sidebar si mostrano/nascondono in base ai permessi del ruolo dell'utente loggato (operatore vede solo le sezioni assegnate)
  - Header con nome utente, notifiche, logout
  - Area contenuto principale
  - Responsive (sidebar collassabile su mobile)
  - Protezione route: solo utenti con ruolo admin
- **Dipendenze**: 0.4, 0.3

### TASK 1.6 - Admin Dashboard
- **Cosa**: Pagina dashboard con card statistiche placeholder (contatori), lista richieste recenti, prossime partenze. Per ora con dati mock, poi collegati al DB.
- **Dipendenze**: 1.5

### TASK 1.7 - Componente Upload Immagini
- **Cosa**: Componente riutilizzabile per upload immagini su Supabase Storage con:
  - Drag & drop
  - Preview prima dell'upload
  - Progress bar
  - Upload multiplo
  - Crop/ridimensionamento (opzionale)
  - Ritorno URL dopo upload
- **Dipendenze**: 1.4, 0.2

### TASK 1.8 - Componente Rich Text Editor
- **Cosa**: Componente editor di testo ricco basato su Tiptap con: bold, italic, heading, liste, link, immagini inline (upload integrato con Supabase Storage), embed video.
- **Dipendenze**: 0.2, 1.7

### TASK 1.9 - Admin: Gestione Destinazioni (CRUD completo)
- **Cosa**: Pagina lista + editor destinazioni. Prima entita CRUD completa per stabilire il pattern. Lista con tabella, ricerca, azioni. Editor con form (nome, slug auto, macro-area select, descrizione, upload immagine). Validazione con zod.
- **Dipendenze**: 1.1, 1.5, 1.7

### TASK 1.10 - Admin: Gestione Tour (CRUD completo)
- **Cosa**: Pagina lista + editor tour. L'editor con tab multiple:
  - Tab Info Base: campi principali + select destinazione
  - Tab Itinerario: lista dinamica giorni (aggiungi/rimuovi/riordina)
  - Tab Incluso/Escluso: liste dinamiche
  - Tab Gallery: upload multiplo + riordina
  - Tab Partenze: tabella partenze (aggiungi/modifica/elimina)
  - Tab Extra: lista servizi aggiuntivi
  - Tab SEO: meta title, description, OG image
- **Dipendenze**: 1.1, 1.5, 1.7, 1.8, 1.9 (serve destinazioni per il select)

### TASK 1.11 - Collegamento Admin CRUD a Supabase (Destinazioni + Tour)
- **Cosa**: Sostituire i dati mock nel pannello admin con query reali a Supabase:
  - Creare `src/lib/supabase/admin.ts` (client con service_role key per bypassare RLS)
  - Creare query functions per destinazioni e tour (`getDestinations`, `getTours`, `getById`, etc.)
  - Creare server actions per save/delete con validazione Zod
  - Convertire le pagine lista da client component con mock a server component con fetch reale
  - Collegare i form (DestinationForm, TourForm) alle server actions
  - Aggiungere gestione errori server e feedback utente
- **Dipendenze**: 1.1, 1.9, 1.10
- **Stato**: ✅ Completata

### TASK 1.12 - Preview links nelle tabelle admin
- **Cosa**: Nelle tabelle lista admin (destinazioni, tour, e future), aggiungere una colonna "Anteprima" con lo slug cliccabile (es. `/destinazioni/roma`, `/tours/istanbul-classica`) che apre la pagina pubblica in un nuovo tab. Icona ExternalLink accanto allo slug.
- **Dipendenze**: 1.11
- **Stato**: ✅ Completata

### TASK 1.13 - Map Picker per input coordinate (Leaflet)
- **Cosa**: Componente MapPicker con Leaflet + OpenStreetMap da integrare nel form destinazione per rendere l'inserimento delle coordinate piu semplice:
  - Mappa cliccabile: click sulla mappa inserisce lat/lng nel campo coordinate
  - Barra di ricerca localita (geocoding) per cercare un luogo e posizionare il marker
  - Pin draggabile per aggiustamento fine
  - Mostra coordinate correnti in tempo reale
  - Se coordinate gia presenti, mostra il pin nella posizione corretta
  - Installare `leaflet` e `react-leaflet`
- **Dipendenze**: 1.11
- **Stato**: ⚪ Da fare

### TASK 1.14 - Auto-suggerimento localita nell'itinerario tour
- **Cosa**: Nel TourForm, tab "Programma" (itinerario giorni), il campo "Localita" di ogni giorno deve suggerire localita gia inserite in precedenza in altri tour (query da `tour_itinerary_days.locality` distinte). Autocomplete con dropdown.
- **Dipendenze**: 1.11
- **Stato**: ⚪ Da fare

---

## SPRINT 2 - Admin Crociere + Flotta

### Obiettivo: Gestione completa di navi, crociere fluviali con campi condizionali (deck/cabine).

---

### TASK 2.1 - Admin: Gestione Flotta/Navi (CRUD completo)
- **Cosa**: Lista navi + editor nave con:
  - Informazioni base (nome, specifiche tecniche)
  - Gestione Deck (lista dinamica): nome, ordine, planimetria
  - Gestione Cabine per Deck (lista annidata): tipo, metratura, dotazioni, quantita, foto
  - Servizi a bordo (lista)
  - Gallery
- **Dipendenze**: 1.2, 1.5, 1.7

### TASK 2.2 - Admin: Gestione Crociere Fluviali (CRUD completo)
- **Cosa**: Lista crociere + editor crociera con tab:
  - Tab Info Base: campi + select nave (quando selezionata, carica deck/cabine)
  - Tab Itinerario
  - Tab Deck e Cabine (CONDIZIONALE): appare dopo selezione nave, mostra deck con cabine e prezzi
  - Tab Incluso/Escluso
  - Tab Gallery
  - Tab Partenze: con prezzi differenziati per cabina
  - Tab Extra
  - Tab SEO
- **Dipendenze**: 1.2, 1.5, 1.7, 1.8, 2.1 (serve navi per il select)

### TASK 2.3 - Admin: Vista Calendario Partenze (sola lettura)
- **Cosa**: Vista calendario mensile + vista tabella che LEGGE le partenze gia definite nei tour e nelle crociere (tabelle `tour_departures` e `cruise_departures`). Non e un CRUD separato: le partenze vengono create/modificate direttamente dalla tab "Partenze" del form tour o crociera. Questa pagina serve come panoramica aggregata.
  - Vista calendario con indicatori colorati (verde = tour, blu = crociere)
  - Vista tabella filtrabile (tipo, destinazione, mese)
  - Click su partenza porta alla pagina modifica del tour/crociera corrispondente
  - Navigazione mese avanti/indietro
- **Dipendenze**: 1.1, 1.2, 1.10, 2.2

### TASK 2.4 - Admin: Gestione Blog (CRUD)
- **Cosa**: Lista articoli + editor articolo con rich text editor, upload immagine copertina, categorie, meta SEO, programmazione pubblicazione.
- **Dipendenze**: 1.1, 1.5, 1.7, 1.8

### TASK 2.5 - Admin: Gestione Cataloghi
- **Cosa**: Lista cataloghi + upload PDF, immagine copertina, titolo, anno, ordine. Toggle pubblicato/nascosto.
- **Dipendenze**: 1.1, 1.4, 1.5

### TASK 2.6 - Admin: Libreria Media
- **Cosa**: Pagina per visualizzare tutti i file caricati su Supabase Storage. Griglia con preview, ricerca per nome, info file. Upload diretto. Eliminazione.
- **Dipendenze**: 1.4, 1.5, 1.7

---

## SPRINT 3 - Sito Pubblico - Pagine Core

### Obiettivo: Homepage completa, pagine tour, crociere e flotta pubbliche e funzionanti.

---

### TASK 3.1 - Header e Navigazione pubblica
- **Cosa**: Header responsive con logo MishaTravel, menu di navigazione (Destinazioni, Crociere Fluviali, I Nostri Tour, Flotta, Calendario Partenze, Cataloghi, Blog), pulsanti "Diventa Partner" e "Login". Menu hamburger su mobile. Mega menu per Destinazioni (con macro-aree).
- **Dipendenze**: 0.4

### TASK 3.2 - Footer
- **Cosa**: Footer con colonne: contatti (telefono, email), link rapidi (Diventa Partner, Trova Agenzia, Login), link pagine principali, copyright. Responsive.
- **Dipendenze**: 0.4

### TASK 3.3 - Homepage
- **Cosa**: Implementazione completa della homepage:
  1. Hero banner/slider con destinazioni in evidenza (dati da DB)
  2. Barra ricerca rapida
  3. Griglia destinazioni (dati da DB)
  4. Sezione tour in evidenza (card con dati da DB)
  5. Sezione crociere in evidenza (card con dati da DB)
  6. Sezione ultimi articoli blog
  7. Tutti i dati fetchati da Supabase con SSR/ISR
- **Dipendenze**: 3.1, 3.2, 1.1 (servono dati nel DB)

### TASK 3.4 - Pagina Lista Tour (/tour)
- **Cosa**: Griglia di card tour con immagine, titolo, durata, prezzo. Filtri per destinazione, durata, prezzo. Paginazione. SSR.
- **Dipendenze**: 3.1, 1.1

### TASK 3.5 - Pagina Dettaglio Tour (/tour/[slug])
- **Cosa**: Pagina completa del singolo tour:
  - Gallery fotografica (lightbox)
  - Info principali (titolo, destinazione, durata, prezzo)
  - Descrizione completa
  - Itinerario giorno per giorno (accordion/tabs)
  - Incluso / Non incluso
  - Tabella partenze con date e prezzi
  - Pulsante "Accedi per richiedere preventivo" (se non loggato) o configuratore (se loggato - implementato nello Sprint 6)
  - Tour correlati
  - SEO: meta tag dinamici, schema TouristTrip
- **Dipendenze**: 3.4, 1.1

### TASK 3.6 - Pagina Lista Crociere (/crociere-fluviali)
- **Cosa**: Come lista tour ma per crociere. Card con immagine nave, titolo, percorso, durata, prezzo. Filtri.
- **Dipendenze**: 3.1, 1.2

### TASK 3.7 - Pagina Dettaglio Crociera (/crociere-fluviali/[slug])
- **Cosa**: Pagina completa singola crociera:
  - Gallery
  - Info principali + nave
  - Descrizione
  - Itinerario
  - Piano deck con cabine e prezzi
  - Incluso / Non incluso
  - Partenze con prezzi per cabina
  - Pulsante prenotazione (come tour)
  - Crociere correlate
  - SEO: meta tag, schema BoatTrip
- **Dipendenze**: 3.6, 1.2

### TASK 3.8 - Pagina Lista Flotta (/flotta)
- **Cosa**: Griglia navi con immagine, nome, specifiche chiave (capacita, anno). Link a dettaglio.
- **Dipendenze**: 3.1, 1.2

### TASK 3.9 - Pagina Dettaglio Nave (/flotta/[slug])
- **Cosa**: Pagina completa nave:
  - Gallery
  - Specifiche tecniche
  - Descrizione
  - Piano deck completo con cabine
  - Servizi a bordo
  - Crociere disponibili con questa nave
- **Dipendenze**: 3.8, 1.2

---

## SPRINT 4 - Calendario + Destinazioni + Blog + Cataloghi + Pagine Statiche

### Obiettivo: Sito pubblico completo con tutte le pagine.

---

### TASK 4.1 - Calendario Partenze Pubblico (/calendario-partenze)
- **Cosa**: Calendario interattivo mensile:
  - Indicatori colorati (verde = tour, blu = crociere)
  - Vista calendario + vista lista
  - Filtri: tipo, destinazione, mese
  - Click su partenza → link a pagina tour/crociera
  - Navigazione mese avanti/indietro + "Oggi"
- **Dipendenze**: 1.1, 1.2, 3.1

### TASK 4.2 - Pagina Destinazioni (/destinazioni)
- **Cosa**: Griglia di tutte le destinazioni raggruppate per macro-area. Click su destinazione porta alla pagina dedicata.
- **Dipendenze**: 3.1, 1.1

### TASK 4.3 - Pagina Singola Destinazione (/destinazioni/[slug])
- **Cosa**: Header con immagine e descrizione destinazione. Sotto: lista tour e crociere disponibili per quella destinazione (filtrabili).
- **Dipendenze**: 4.2

### TASK 4.4 - Blog Pubblico (/blog e /blog/[slug])
- **Cosa**: Lista articoli con immagine, titolo, data, estratto, categoria. Filtro per categoria. Paginazione. Pagina singola con contenuto completo, articoli correlati. SEO con schema Article.
- **Dipendenze**: 3.1, 1.1

### TASK 4.5 - Cataloghi (/cataloghi)
- **Cosa**: Griglia cataloghi con copertina, titolo, anno. Download diretto PDF.
- **Dipendenze**: 3.1, 1.1

### TASK 4.6 - Pagine Statiche
- **Cosa**: Pagina "Diventa Partner" (testo informativo + CTA registrazione), "Trova Agenzia" (ricerca per citta), "Contatti" (indirizzo, telefono, email, mappa embed, form contatto), "Chi Siamo" (se presente sul sito attuale).
- **Dipendenze**: 3.1, 3.2

---

## SPRINT 5 - Autenticazione Agenzie

### Obiettivo: Sistema completo di registrazione, login, verifica email e protezione route per agenzie.

---

### TASK 5.1 - Setup Supabase Auth
- **Cosa**: Configurare Supabase Auth per email/password. Impostare i redirect URL. Creare il trigger database che inserisce un record in `agencies` alla registrazione. Configurare il sistema di ruoli nella tabella `user_roles` (super_admin, admin, operator, agency). Creare le RLS policies basate sui ruoli. Creare funzione Supabase `get_user_role()` e `get_user_permissions()` per check permessi.
- **Dipendenze**: 1.3, 0.3

### TASK 5.2 - Pagina Registrazione Agenzia (/registrazione)
- **Cosa**: Form multi-step:
  - Step 1: Dati aziendali (ragione sociale, P.IVA, CF, indirizzo, licenza)
  - Step 2: Dati contatto (nome referente, email, telefono, sito web)
  - Step 3: Password + accettazione termini
  - Validazione con zod ad ogni step
  - Submit → crea utente Supabase Auth + record agency
- **Dipendenze**: 5.1

### TASK 5.3 - Pagina Login (/login)
- **Cosa**: Form email + password, "Ricordami", link "Password dimenticata", link "Registrati". Gestione errori (credenziali errate, account non verificato, account bloccato). Redirect a dashboard agenzia dopo login.
- **Dipendenze**: 5.1

### TASK 5.4 - Recupero Password (/recupera-password)
- **Cosa**: Form inserimento email → Supabase Auth invia email di reset → Pagina di reset con nuova password.
- **Dipendenze**: 5.1

### TASK 5.5 - Middleware protezione route con ruoli
- **Cosa**: Middleware Next.js che:
  - Route `/agenzia/*` → richiede login con ruolo `agency`
  - Route `/admin/*` → richiede login con ruolo `super_admin`, `admin` o `operator`
  - Per gli operatori: verifica che abbiano il permesso per la sezione specifica (es. `/admin/blog` → permesso `blog`)
  - Redirect a login se non autenticato
  - Redirect a pagina corretta dopo login in base al ruolo
  - Redirect a 403 se autenticato ma senza permessi
- **Dipendenze**: 5.1

### TASK 5.6 - Logica "Accedi per prenotare" nelle pagine tour/crociere
- **Cosa**: Aggiornare le pagine dettaglio tour e crociera per mostrare:
  - Se non loggato: pulsante "Accedi per richiedere un preventivo" → redirect a login
  - Se loggato come agenzia: pulsante "Richiedi preventivo" (collegato al configuratore dello Sprint 6)
- **Dipendenze**: 5.5, 3.5, 3.7

---

## SPRINT 6 - Area Riservata Agenzie

### Obiettivo: Dashboard agenzia completa con configuratore pacchetti e gestione richieste.

---

### TASK 6.1 - Layout Area Agenzia
- **Cosa**: Layout dedicato con sidebar (Dashboard, Le Mie Richieste, Offerte Ricevute, Estratto Conto, Profilo), header con nome agenzia e logout. Responsive.
- **Dipendenze**: 5.5

### TASK 6.2 - Dashboard Agenzia (/agenzia/dashboard)
- **Cosa**: Card contatori (richieste in attesa, offerte da valutare, prenotazioni confermate), lista richieste recenti con stato, notifiche (nuove offerte ricevute).
- **Dipendenze**: 6.1, 1.3

### TASK 6.3 - Configuratore Pacchetto Tour
- **Cosa**: Modale/pagina che si apre dalla pagina dettaglio tour per creare una richiesta:
  - Select data partenza (tra quelle disponibili)
  - Input numero adulti / bambini
  - Select tipologia camera
  - Checkboxes servizi extra (caricati dal DB per quel tour)
  - Textarea note
  - Riepilogo prima dell'invio
  - Submit → salva in `quote_requests` con stato "sent"
- **Dipendenze**: 5.6, 1.3

### TASK 6.4 - Configuratore Pacchetto Crociera
- **Cosa**: Come il configuratore tour ma con campi aggiuntivi:
  - Select data partenza
  - Select deck (caricato dalla nave)
  - Select tipo cabina (filtrato per deck selezionato - CONDIZIONALE)
  - Input numero cabine
  - Input partecipanti per cabina
  - Checkboxes extra
  - Textarea note
  - Riepilogo con prezzo indicativo (calcolato da matrice prezzi)
  - Submit → salva in `quote_requests`
- **Dipendenze**: 5.6, 1.3

### TASK 6.5 - Le Mie Richieste (/agenzia/richieste)
- **Cosa**: Tabella con tutte le richieste dell'agenzia: numero, data, tour/crociera, stato (badge colorato). Click apre dettaglio con timeline completa, dati pacchetto, offerta ricevuta (se presente), azioni.
- **Dipendenze**: 6.1, 1.3

### TASK 6.6 - Offerte Ricevute (/agenzia/offerte)
- **Cosa**: Lista offerte dal tour operator. Per ogni offerta: dettagli pacchetto, prezzo, condizioni, scadenza. Pulsanti "Accetta" e "Declina" (con conferma e motivazione opzionale per il declino). Aggiorna stato in DB.
- **Dipendenze**: 6.5, 1.3

### TASK 6.7 - Estratto Conto (/agenzia/estratto-conto)
- **Cosa**: Tabella storico transazioni: data, descrizione, importo, stato pagamento. Filtro per periodo. Visualizzazione dettagli pagamento quando l'admin invia gli estremi.
- **Dipendenze**: 6.1, 1.3

### TASK 6.8 - Profilo Agenzia (/agenzia/profilo)
- **Cosa**: Form per visualizzare e modificare dati aziendali e di contatto. Sezione cambio password.
- **Dipendenze**: 6.1, 5.1

---

## SPRINT 7 - Flusso Preventivi (Lato Admin)

### Obiettivo: L'admin puo gestire l'intero workflow richiesta→offerta→pagamento→conferma.

---

### TASK 7.1 - Admin: Lista Preventivi/Richieste (/admin/preventivi)
- **Cosa**: Tabella richieste con filtri (stato, agenzia, tipo, data). Badge stato colorato. Contatore richieste per stato. Ordinamento. Click per dettaglio.
- **Dipendenze**: 1.3, 1.5

### TASK 7.2 - Admin: Dettaglio Richiesta con Timeline
- **Cosa**: Pagina dettaglio completa:
  - Dati agenzia richiedente
  - Dettagli pacchetto richiesto (tour/crociera, date, partecipanti, cabina, extra)
  - Timeline visiva di tutti i passaggi
  - Stato attuale evidenziato
- **Dipendenze**: 7.1

### TASK 7.3 - Admin: Modifica Richiesta e Crea Offerta
- **Cosa**: L'admin puo:
  - Modificare dettagli della richiesta (date alternative, cabina diversa)
  - Creare un'offerta: prezzo totale, condizioni, termini pagamento, scadenza
  - Salvare come bozza o inviare all'agenzia
  - Invio aggiorna stato a "offer_sent" e inserisce in timeline
- **Dipendenze**: 7.2

### TASK 7.4 - Admin: Invio Estremi Pagamento
- **Cosa**: Dopo accettazione agenzia, l'admin puo inviare:
  - Coordinate bancarie
  - Importo
  - Causale
  - Aggiorna stato a "payment_sent"
- **Dipendenze**: 7.3

### TASK 7.5 - Admin: Conferma Pagamento e Rifiuto
- **Cosa**: Pulsante "Conferma pagamento ricevuto" → stato "confirmed". Pulsante "Rifiuta richiesta" con motivazione → stato "rejected". Ogni azione aggiornata nella timeline.
- **Dipendenze**: 7.4

### TASK 7.6 - Admin: Gestione Agenzie (/admin/agenzie)
- **Cosa**: Lista agenzie registrate con stato, data, citta. Dettaglio agenzia con dati + storico richieste. Azioni: approva, blocca, elimina.
- **Dipendenze**: 1.3, 1.5

### TASK 7.7 - Admin: Gestione Utenti e Ruoli (/admin/utenti)
- **Cosa**: Pagina centralizzata per la gestione di TUTTI gli utenti della piattaforma:
  - **Lista utenti**: Tabella unica con colonne (nome, email, ruolo badge, stato, ultimo accesso). Filtri per ruolo (Super Admin, Admin, Operatore, Agenzia) e stato.
  - **Creazione nuovo admin/operatore**: Form con nome, cognome, email, ruolo, password temporanea (o invio link setup via email).
  - **Assegnazione permessi operatore**: Checkboxes per le sezioni accessibili (Tour, Crociere, Flotta, Partenze, Destinazioni, Agenzie, Preventivi, Blog, Cataloghi, Media, Utenti sola lettura).
  - **Modifica utente**: Cambio ruolo, modifica permessi, reset password, disattiva/riattiva account.
  - **Eliminazione**: Solo Super Admin puo eliminare un Admin. Admin puo eliminare Operatori.
  - **Log attivita**: Per ogni utente, storico azioni principali (ultimo accesso, modifiche effettuate).
  - **Vista agenzie integrata**: Le agenzie appaiono nella stessa lista (filtrabili per ruolo "Agenzia") con link al dettaglio agenzia di /admin/agenzie.
  - Protezione: Solo Super Admin e Admin vedono questa sezione. Operatori con permesso `users_readonly` vedono solo la lista senza azioni di modifica.
- **Dipendenze**: 1.3, 1.5, 5.1, 7.6

### TASK 7.8 - Hook Sidebar dinamica per permessi operatore
- **Cosa**: Creare un hook `useUserPermissions()` che legge ruolo e permessi dell'utente loggato. La sidebar dell'admin panel mostra/nasconde le voci in base ai permessi. Se un operatore non ha accesso a "Blog", la voce non appare nella sidebar e la route e bloccata dal middleware.
- **Dipendenze**: 5.5, 7.7

### TASK 7.9 - Sistema Notifiche In-App
- **Cosa**: Icona campanella nell'header (admin e agenzia) con contatore notifiche non lette. Dropdown con lista notifiche. Click segna come letta e naviga al link. Le notifiche vengono create automaticamente ad ogni cambio stato di una richiesta.
- **Dipendenze**: 1.3, 1.5, 6.1

---

## SPRINT 8 - Email Transazionali (Brevo)

### Obiettivo: Tutte le email transazionali funzionanti tramite Brevo.

---

### 🔑 TASK 8.0 - Raccolta Credenziali Brevo

**AZIONE RICHIESTA ALL'UTENTE**:

- [ ] **Brevo**: Crea un account su [brevo.com](https://www.brevo.com) (se non lo hai gia) e forniscimi:
  - API Key di Brevo (SMTP o API v3)
  - Email mittente verificata (es. noreply@mishatravel.com o info@mishatravel.com)
  - Email admin dove ricevere le notifiche (es. info@mishatravel.com)

---

### TASK 8.1 - Setup Brevo + Servizio Email
- **Cosa**: Installare SDK Brevo (`@getbrevo/brevo`), creare servizio email centralizzato in Supabase Edge Functions o Next.js API routes. Configurare template base HTML per le email con branding MishaTravel.
- **Dipendenze**: 8.0

### TASK 8.2 - Email Autenticazione
- **Cosa**: Implementare invio email per:
  - Verifica email registrazione
  - Benvenuto dopo verifica
  - Reset password
- **Dipendenze**: 8.1, 5.2

### TASK 8.3 - Email Flusso Preventivi (verso Agenzia)
- **Cosa**: Email per:
  - Richiesta inviata con successo
  - Nuova offerta ricevuta
  - Conferma accettazione offerta
  - Dettagli pagamento ricevuti
  - Prenotazione confermata
  - Richiesta rifiutata
- **Dipendenze**: 8.1, 7.3

### TASK 8.4 - Email Notifiche Admin
- **Cosa**: Email per:
  - Nuova agenzia registrata
  - Nuova richiesta preventivo
  - Offerta accettata da agenzia
  - Offerta declinata da agenzia
- **Dipendenze**: 8.1, 7.3

---

## SPRINT 9 - Migrazione Dati WordPress

### Obiettivo: Tutti i contenuti del sito attuale importati nel nuovo sistema.

---

### 🔑 TASK 9.0 - Raccolta Credenziali e Dati WordPress

**AZIONE RICHIESTA ALL'UTENTE** - Fornire UNO dei seguenti:

**Opzione A (Piu rapida - consigliata):**
- [ ] Export ACF: Da WordPress → ACF → Tools → Export Field Groups → JSON
- [ ] Export WordPress: Da WordPress → Tools → Export → All Content → XML
- [ ] Accesso FTP/SFTP al server per scaricare le immagini dalla cartella `wp-content/uploads/`

**Opzione B (Alternativa):**
- [ ] Accesso admin WordPress (URL login, username, password)
- [ ] Accesso database MySQL (host, user, password, nome DB) oppure accesso phpMyAdmin
- [ ] Accesso FTP/SFTP (host, user, password)

---

### TASK 9.1 - Analisi struttura dati WordPress/ACF
- **Cosa**: Analizzare l'export ACF per mappare ogni campo ACF alle colonne del nostro schema Supabase. Creare un documento di mapping. Identificare campi non mappati o da adattare.
- **Dipendenze**: 9.0

### TASK 9.2 - Script importazione Tour
- **Cosa**: Script Node.js/TypeScript che legge i tour dall'export WP e li inserisce in Supabase: dati base, itinerario, incluso/escluso, gallery, partenze, extra.
- **Dipendenze**: 9.1, 1.1

### TASK 9.3 - Script importazione Crociere + Flotta
- **Cosa**: Come 9.2 ma per crociere fluviali, navi, deck, cabine. Gestione relazioni.
- **Dipendenze**: 9.1, 1.2

### TASK 9.4 - Script importazione Blog + Destinazioni + Cataloghi
- **Cosa**: Importazione articoli blog (con conversione HTML→contenuto editor), destinazioni, cataloghi.
- **Dipendenze**: 9.1, 1.1

### TASK 9.5 - Migrazione immagini
- **Cosa**: Download di tutte le immagini da WordPress (`wp-content/uploads/`) e upload su Supabase Storage. Aggiornamento URL nei record importati.
- **Dipendenze**: 9.2, 9.3, 9.4

### TASK 9.6 - Verifica e correzioni post-import
- **Cosa**: Controllo manuale dei dati importati. Fix di problemi di formattazione, immagini mancanti, relazioni errate. Confronto con il sito live.
- **Dipendenze**: 9.5

---

## SPRINT 10 - SEO, Performance e Deploy Produzione

### Obiettivo: Sito live, performante, SEO-friendly.

---

### TASK 10.1 - SEO Tecnico
- **Cosa**:
  - Sitemap XML dinamica (genera automaticamente da tour/crociere/blog)
  - robots.txt
  - Meta tag dinamici per ogni pagina (title, description, OG, Twitter Card)
  - Schema.org structured data: TouristTrip, BoatTrip, Event, Article, Organization
  - Canonical URL
- **Dipendenze**: Sprint 3 e 4 completati

### TASK 10.2 - Redirect 301 da vecchi URL
- **Cosa**: Mappatura URL vecchi WordPress → nuovi URL Next.js. Configurazione redirect in `next.config.js`. Importante per non perdere il posizionamento SEO attuale.
- **Dipendenze**: 9.6, 10.1

### TASK 10.3 - Ottimizzazione Performance
- **Cosa**:
  - ISR per pagine tour/crociere/blog (revalidate ogni X minuti)
  - Lazy loading immagini sotto la fold
  - Prefetch link navigazione
  - Bundle analysis e code splitting
  - Core Web Vitals check
- **Dipendenze**: Sprint 3 e 4 completati

### TASK 10.4 - Testing End-to-End
- **Cosa**: Test manuale completo di tutti i flussi:
  - Navigazione pubblica completa
  - Registrazione agenzia → login → richiesta preventivo
  - Admin: creazione tour/crociera → gestione preventivo → conferma
  - Email inviate correttamente
  - Responsive su mobile/tablet/desktop
- **Dipendenze**: Tutti gli sprint precedenti

### TASK 10.5 - Deploy Produzione
- **Cosa**:
  - Configurazione dominio mishatravel.com su Vercel (o nuovo sottodominio per staging)
  - Variabili d'ambiente di produzione su Vercel
  - SSL/HTTPS verificato
  - Test finale su produzione
- **Dipendenze**: 10.4

### 🔑 TASK 10.5.1 - Credenziali Deploy Produzione

**AZIONE RICHIESTA ALL'UTENTE**:

- [ ] **Dominio**: Accesso al pannello DNS del dominio mishatravel.com (registrar: quale?) per puntare al nuovo sito
- [ ] **Vercel**: Conferma account/team Vercel per deploy produzione
- [ ] **Supabase Produzione**: Conferma progetto Supabase (se diverso da dev)

---

## Riepilogo Punti di Raccolta Credenziali

| Quando | Cosa Serve | Sprint |
|--------|-----------|--------|
| **Prima di iniziare** | GitHub repo, Supabase (URL + chiavi), Vercel account | Sprint 0 |
| **Sprint 8** | Brevo API Key, email mittente, email admin | Sprint 8 |
| **Sprint 9** | Export WordPress (ACF JSON + XML) OPPURE credenziali WP + DB + FTP | Sprint 9 |
| **Sprint 10** | Accesso DNS dominio, conferma Vercel/Supabase produzione | Sprint 10 |

---

## SPRINT 11 - Demo, Seed Data e Miglioramenti UX

### Obiettivo: Sito visibile con dati demo, credenziali di test, flusso approvazione agenzie completo.

---

### TASK 11.1 - Seed Script Dati Demo
- **Cosa**: Script `scripts/seed-demo.ts` eseguibile con `npx tsx scripts/seed-demo.ts` che popola il DB con dati demo realistici:
  - 8-10 destinazioni (con macro_area corrette)
  - 5-6 tour con itinerario, partenze, supplementi, incluso/escluso
  - 3-4 crociere con cabine, deck, partenze
  - 3-4 navi con specifiche, servizi, cabine
  - 5-6 articoli blog con categorie
  - 2-3 cataloghi
  - 1 agenzia demo con dati completi
- **Dipendenze**: 1.1

### TASK 11.2 - Credenziali Demo Supabase Auth
- **Cosa**: Creare utenti demo in Supabase Auth con ruoli assegnati:
  - Super Admin: `admin@mishatravel.com` / `MishaAdmin2026!`
  - Agenzia demo: `agenzia@mishatravel.com` / `MishaAgenzia2026!`
  - Assegnare ruoli nella tabella `user_roles`
  - L'agenzia demo deve avere status `active` per poter accedere
  - Salvare credenziali in CREDENTIALS.md
- **Dipendenze**: 5.1, 11.1

### TASK 11.3 - Flusso Approvazione Agenzie
- **Cosa**: Implementare il flusso completo di approvazione registrazione agenzia:
  - La registrazione crea l'agenzia con status `pending` (gia implementato)
  - Il middleware blocca l'accesso all'area riservata per agenzie con status != `active`
  - Widget "Agenzie in attesa di approvazione" nella dashboard admin con:
    - Lista agenzie pending con nome, email, data registrazione
    - Pulsanti: Approva (status→active), Declina (status→blocked), Visualizza dettaglio
  - Messaggio all'agenzia dopo login che spiega che il suo account e in attesa di approvazione
  - Notifica creata per l'admin quando una nuova agenzia si registra
- **Dipendenze**: 5.2, 7.6

---

## Note Operative

1. **Ogni sprint produce qualcosa di testabile**: L'utente puo verificare il progresso ad ogni sprint.
2. **L'admin panel viene prima del sito pubblico**: Cosi i contenuti possono essere inseriti/importati mentre si costruisce il frontend pubblico.
3. **L'autenticazione e le agenzie vengono dopo il sito base**: Il sito deve funzionare prima come vetrina, poi si aggiunge il sistema transazionale.
4. **Le email sono quasi alla fine**: Il flusso deve funzionare prima senza email, poi si aggiungono le notifiche.
5. **La migrazione WordPress e separata**: Puo avvenire in parallelo con altri sprint se i dati sono disponibili.

---

*Piano creato il: 21 Febbraio 2026*
*Totale task: ~72 task atomiche*
*Versione piano: v1.7*
