# MishaTravel - Documento di Visione del Progetto

> Ricostruzione completa del sito mishatravel.com da WordPress a applicazione React moderna

---

## 1. Panoramica Generale

MishaTravel e un tour operator italiano che attualmente opera tramite un sito WordPress con Advanced Custom Fields (ACF). Il progetto consiste nella ricostruzione totale del sito come applicazione web moderna, includendo:

- **Sito pubblico** per la presentazione di tour e crociere fluviali
- **Admin panel** per la gestione completa dei contenuti (sostituzione di WordPress)
- **Area riservata agenzie** per la gestione delle richieste e dei preventivi
- **Sistema di email transazionali** per tutte le comunicazioni

---

## 2. Stack Tecnologico

| Layer | Tecnologia | Motivazione |
|-------|-----------|-------------|
| Framework | Next.js 15 (App Router) | SSR/SSG per SEO, routing, ottimizzazione immagini |
| UI Library | React 19 + TypeScript | Componenti tipizzati, sicurezza del codice |
| Styling | Tailwind CSS 4 + shadcn/ui | Design system rapido, componenti pronti |
| Database | Supabase (PostgreSQL) | DB relazionale gestito, API automatiche, realtime |
| Autenticazione | Supabase Auth | Login/registrazione agenzie, ruoli admin |
| File Storage | Supabase Storage | Foto tour/crociere, cataloghi PDF, media |
| Email | Brevo (ex Sendinblue) | Email transazionali (registrazione, preventivi, notifiche) |
| Deploy Frontend | Vercel | Deploy automatico da Git, CDN globale |
| Deploy Backend | Supabase Cloud | PostgreSQL gestito, edge functions |
| Versionamento | GitHub | Repository del codice sorgente |

---

## 3. Architettura dell'Applicazione

### 3.1 Struttura delle Route

```
/ (Homepage)
├── /destinazioni                    → Griglia di tutte le destinazioni
│   └── /destinazioni/[slug]         → Pagina singola destinazione con tour/crociere correlate
│
├── /tour                            → Elenco di tutti i tour
│   └── /tour/[slug]                 → Pagina dettaglio singolo tour
│
├── /crociere-fluviali               → Elenco di tutte le crociere fluviali
│   └── /crociere-fluviali/[slug]    → Pagina dettaglio singola crociera
│
├── /flotta                          → Elenco della flotta (imbarcazioni)
│   └── /flotta/[slug]               → Pagina dettaglio singola imbarcazione
│
├── /calendario-partenze             → Calendario interattivo di tutte le partenze
│
├── /cataloghi                       → Sfoglia e scarica cataloghi PDF
│
├── /blog                            → Lista articoli del blog
│   └── /blog/[slug]                 → Articolo singolo del blog
│
├── /diventa-partner                 → Pagina informativa per diventare agenzia partner
├── /trova-agenzia                   → Ricerca agenzie partner sul territorio
├── /contatti                        → Pagina contatti
│
├── /login                           → Login agenzie
├── /registrazione                   → Registrazione nuova agenzia
├── /recupera-password               → Recupero password
│
├── /agenzia/                        → AREA RISERVATA AGENZIE (protetta)
│   ├── /agenzia/dashboard           → Panoramica richieste attive e notifiche
│   ├── /agenzia/richieste           → Tutte le richieste inviate (con stati)
│   ├── /agenzia/offerte             → Offerte ricevute dal tour operator
│   ├── /agenzia/estratto-conto      → Storico pagamenti, fatture, saldo
│   └── /agenzia/profilo             → Dati e impostazioni dell'agenzia
│
└── /admin/                          → ADMIN PANEL (protetto, solo staff)
    ├── /admin/dashboard             → Statistiche, richieste recenti, notifiche
    ├── /admin/tour                  → Gestione tour (CRUD)
    ├── /admin/crociere              → Gestione crociere fluviali (CRUD)
    ├── /admin/flotta                → Gestione imbarcazioni (CRUD)
    ├── /admin/partenze              → Gestione calendario partenze
    ├── /admin/destinazioni          → Gestione destinazioni (CRUD)
    ├── /admin/agenzie               → Gestione agenzie registrate
    ├── /admin/utenti                → Gestione utenti e ruoli (admin, operatori, agenzie)
    ├── /admin/preventivi            → Gestione richieste/preventivi
    ├── /admin/blog                  → Gestione articoli blog (CRUD)
    ├── /admin/cataloghi             → Upload e gestione cataloghi PDF
    └── /admin/media                 → Libreria media (immagini, file)
```

---

## 4. Descrizione Funzionale Dettagliata

### 4.1 SITO PUBBLICO

#### 4.1.1 Homepage

La homepage e la vetrina principale del tour operator. Contiene le seguenti sezioni nell'ordine:

1. **Hero Banner**: Immagine/slider a tutto schermo con le destinazioni in evidenza. Ogni card nel banner mostra: immagine di sfondo, nome destinazione, durata (es. "7 notti"), prezzo a partire da (es. "da €2.950"). L'admin puo gestire quali destinazioni/tour mostrare nello slider.

2. **Barra di Ricerca Rapida**: Ricerca veloce per destinazione, tipo (tour/crociera), periodo di partenza.

3. **Griglia Destinazioni ("Scegli la tua destinazione")**: Griglia di 20+ destinazioni rappresentate come tessere cliccabili con immagine di sfondo e nome. Cliccando su una destinazione si va alla pagina con tutti i tour/crociere disponibili per quella destinazione.

4. **Sezione Tour ("I nostri tour")**: Carosello/griglia delle card dei tour in evidenza. Ogni card mostra: immagine principale, titolo del tour, durata, prezzo a partire da, pulsante "Scopri di piu".

5. **Sezione Crociere ("Le nostre crociere")**: Carosello/griglia delle card delle crociere fluviali in evidenza. Ogni card mostra: immagine della nave, nome della crociera, nave, durata, prezzo, pulsante "Scopri di piu".

6. **Sezione Blog ("Ultimi articoli")**: Ultimi 3-4 articoli del blog con immagine, titolo, estratto e link.

7. **Footer**: Contatti (telefono +39 010 2461630, email info@mishatravel.com), link rapidi (Diventa Partner, Trova Agenzia, Login), link alle pagine principali, social media.

#### 4.1.2 Pagina Destinazione (/destinazioni/[slug])

Mostra tutti i tour e le crociere fluviali disponibili per una specifica destinazione. Contiene:
- Header con immagine della destinazione e descrizione
- Filtri (tipo: tour/crociere, periodo, prezzo)
- Griglia di card dei tour/crociere associati

#### 4.1.3 Pagina Dettaglio Tour (/tour/[slug])

Pagina completa di un singolo tour con tutte le informazioni:

- **Gallery fotografica**: Slider/lightbox con tutte le foto del tour
- **Informazioni principali**: Titolo, destinazione, durata (giorni/notti), prezzo a partire da
- **Descrizione**: Testo completo descrittivo del tour
- **Itinerario giorno per giorno**: Elenco dei giorni con titolo e descrizione per ciascun giorno (es. "Giorno 1: Arrivo a Istanbul", "Giorno 2: Visita al Grand Bazaar...")
- **Cosa e incluso**: Lista puntata di tutto cio che e incluso nel prezzo (voli, hotel, pasti, guide, trasferimenti, etc.)
- **Cosa NON e incluso**: Lista puntata delle esclusioni (assicurazione, pasti non menzionati, mance, etc.)
- **Date di partenza**: Tabella/lista delle date disponibili con prezzo e disponibilita
- **Pulsante prenotazione**:
  - Se l'utente NON e loggato come agenzia: mostra "Accedi per richiedere un preventivo" con link al login
  - Se l'utente E loggato come agenzia: mostra il configuratore pacchetto (vedi sezione 4.3)
- **Tour correlati**: Suggerimenti di tour simili o nella stessa destinazione

#### 4.1.4 Pagina Dettaglio Crociera Fluviale (/crociere-fluviali/[slug])

Pagina completa di una singola crociera fluviale. Simile al tour ma con campi aggiuntivi specifici:

- **Gallery fotografica**: Slider/lightbox con foto della crociera e della nave
- **Informazioni principali**: Titolo, percorso fluviale (es. "Danubio: Budapest-Vienna"), durata, nave assegnata, prezzo a partire da
- **Nave**: Link alla pagina della nave con foto e specifiche
- **Descrizione**: Testo completo della crociera
- **Itinerario giorno per giorno**: Come per i tour
- **Piano dei ponti (Deck Plan)**: Visualizzazione dei deck della nave con le cabine disponibili. Ogni deck mostra:
  - Nome del ponte (es. "Ponte Superiore", "Ponte Principale")
  - Tipologie di cabine disponibili su quel ponte
  - Planimetria/immagine del deck
  - Prezzo per tipologia di cabina
- **Cosa e incluso / NON incluso**: Come per i tour
- **Date di partenza**: Con prezzo differenziato per deck/cabina
- **Pulsante prenotazione**: Come per i tour (con login agenzia richiesto)
- **Crociere correlate**: Suggerimenti

#### 4.1.5 Pagina Dettaglio Nave (/flotta/[slug])

Pagina dedicata a una singola imbarcazione della flotta:

- **Gallery fotografica**: Esterni e interni della nave
- **Specifiche tecniche**: Lunghezza, larghezza, anno costruzione/ristrutturazione, capacita passeggeri, numero cabine, numero ponti, tonnellaggio
- **Descrizione**: Testo descrittivo della nave
- **Piano completo dei ponti**: Visualizzazione di tutti i deck con cabine
- **Tipologie di cabine**: Per ogni tipo di cabina: foto, metratura, dotazioni, posizione sul ponte
- **Servizi a bordo**: Ristorante, bar, sun deck, sala conferenze, etc.
- **Crociere disponibili con questa nave**: Link alle crociere che utilizzano questa imbarcazione

#### 4.1.6 Calendario Partenze (/calendario-partenze)

Pagina con un calendario interattivo che mostra tutte le partenze programmate:

- **Vista calendario mensile**: Con indicatori colorati (verde = tour, blu = crociere fluviali)
- **Vista lista**: Elenco cronologico delle partenze con filtri
- **Filtri**: Per tipo (tour/crociere), destinazione, mese, fascia di prezzo
- **Ogni partenza mostra**: Data, nome del tour/crociera, destinazione, durata, prezzo, posti disponibili
- **Click su partenza**: Porta alla pagina dettaglio del tour/crociera corrispondente
- **Navigazione mese**: Frecce avanti/indietro, pulsante "Oggi"

#### 4.1.7 Cataloghi (/cataloghi)

Pagina per sfogliare e scaricare i cataloghi PDF del tour operator:
- Griglia di cataloghi con copertina, titolo, anno
- Download diretto del PDF
- Eventuale viewer PDF integrato

#### 4.1.8 Blog (/blog)

- **Lista articoli**: Griglia/lista con immagine, titolo, data, estratto, categoria
- **Paginazione**
- **Filtro per categoria**
- **Pagina singolo articolo** (/blog/[slug]): Immagine di copertina, titolo, data, autore, contenuto completo con rich text (testo, immagini, video embed), articoli correlati

#### 4.1.9 Pagine Statiche

- **Diventa Partner**: Pagina informativa con i vantaggi di diventare agenzia partner, requisiti, e pulsante per la registrazione
- **Trova Agenzia** (/trova-agenzia): Pagina interattiva per trovare le agenzie partner MishaTravel sul territorio italiano. Contiene:
  - **Mappa interattiva**: Mappa (Leaflet + OpenStreetMap) con pin/marker per ogni agenzia partner attiva. Popup con nome agenzia, indirizzo, telefono.
  - **Barra di ricerca**: Ricerca per nome agenzia, citta o provincia. Risultati filtrati in tempo reale.
  - **Filtri**: Per regione, provincia, citta.
  - **Lista agenzie**: Panel laterale (desktop) o sotto la mappa (mobile) con lista scrollabile.
  - **Interazione mappa-lista**: Click su pin evidenzia nella lista e viceversa.
  - **Geolocalizzazione**: Pulsante per centrare sulla posizione dell'utente.
  - **Dati**: Agenzie da Supabase (tabella agencies con latitude, longitude, region), solo status "active".
- **Contatti**: Indirizzo, telefono, email, mappa, form di contatto generico
- **Chi Siamo**: Presentazione del tour operator (se presente sul sito attuale)

---

### 4.2 SISTEMA DI AUTENTICAZIONE

Il sistema di autenticazione e riservato esclusivamente alle agenzie di viaggio partner. Non esiste registrazione per utenti finali (turisti).

#### 4.2.1 Registrazione Agenzia (/registrazione)

Form multi-step per la registrazione di una nuova agenzia:

**Step 1 - Dati Aziendali**:
- Ragione sociale
- Partita IVA
- Codice fiscale
- Indirizzo sede legale (via, citta, CAP, provincia)
- Licenza di agenzia (numero)

**Step 2 - Dati di Contatto**:
- Nome e cognome referente
- Email aziendale (diventa username)
- Telefono
- Sito web (opzionale)

**Step 3 - Credenziali**:
- Password (con requisiti di sicurezza)
- Conferma password
- Accettazione termini e condizioni
- Consenso privacy

**Dopo la registrazione**:
- Email di verifica inviata tramite Brevo
- L'agenzia deve verificare l'email prima di poter accedere
- L'admin riceve una notifica email di nuova registrazione
- L'admin puo approvare/bloccare l'agenzia dal panel

#### 4.2.2 Login Agenzia (/login)

- Form email + password
- Opzione "Ricordami"
- Link a "Password dimenticata"
- Link a "Registrati"
- Messaggio di errore chiaro in caso di credenziali errate o account non verificato/bloccato

#### 4.2.3 Recupero Password (/recupera-password)

- Inserimento email
- Invio email con link di reset tramite Brevo
- Pagina di reset con nuova password + conferma

---

### 4.3 AREA RISERVATA AGENZIE

Accessibile solo dopo login. Layout con sidebar di navigazione dedicata.

#### 4.3.1 Dashboard Agenzia (/agenzia/dashboard)

- **Riepilogo richieste**: Contatori per stato (in attesa, offerte ricevute, confermate)
- **Richieste recenti**: Lista delle ultime 5 richieste con stato
- **Notifiche**: Avvisi di nuove offerte ricevute, aggiornamenti sulle richieste
- **Link rapidi**: Nuova richiesta, visualizza offerte

#### 4.3.2 Le Mie Richieste (/agenzia/richieste)

Lista di tutte le richieste inviate dall'agenzia con:
- Numero richiesta
- Data invio
- Tour/crociera richiesto
- Stato attuale (badge colorato)
- Click per visualizzare il dettaglio completo

**Dettaglio singola richiesta**: Timeline dello stato con tutte le comunicazioni scambiate, dettagli del pacchetto richiesto, offerta ricevuta (se presente), azioni disponibili (accetta/declina).

#### 4.3.3 Configuratore Pacchetto (Nuova Richiesta)

Quando un'agenzia autenticata clicca "Richiedi preventivo" da una pagina tour/crociera, si apre il configuratore:

**Per un Tour**:
- Data di partenza (selezionabile tra quelle disponibili)
- Numero di partecipanti (adulti, bambini)
- Tipologia camera (singola, doppia, tripla)
- Servizi aggiuntivi/extra (lista checkboxes definita dall'admin per quel tour)
- Note aggiuntive (campo testo libero)

**Per una Crociera Fluviale**:
- Data di partenza
- Selezione del Deck/Ponte
- Selezione tipologia cabina (filtrata per deck selezionato)
- Numero di cabine
- Numero di partecipanti per cabina
- Servizi aggiuntivi/extra
- Note aggiuntive

Al click su "Invia Richiesta":
- La richiesta viene salvata nel database con stato "INVIATA"
- L'admin riceve email di notifica tramite Brevo
- L'agenzia vede la richiesta nella lista con stato "Inviata"

#### 4.3.4 Offerte Ricevute (/agenzia/offerte)

Quando l'admin invia un'offerta all'agenzia:
- L'agenzia riceve email di notifica
- Nella sezione "Offerte Ricevute" appare la nuova offerta
- L'offerta contiene: dettagli del pacchetto (eventualmente modificati dall'admin), prezzo totale, condizioni, termini di pagamento, scadenza offerta
- L'agenzia puo:
  - **Accettare**: Conferma l'offerta, l'admin riceve notifica, lo stato passa a "ACCETTATA"
  - **Declinare**: Rifiuta l'offerta con motivazione opzionale, l'admin riceve notifica

#### 4.3.5 Pagamento

Dopo l'accettazione:
- L'admin invia gli estremi di pagamento (coordinate bancarie, importo, causale)
- L'agenzia visualizza i dettagli di pagamento nell'area riservata
- Dopo il pagamento, l'admin conferma la ricezione e la prenotazione passa a "CONFERMATA"

#### 4.3.6 Estratto Conto (/agenzia/estratto-conto)

- Storico completo di tutte le transazioni
- Per ogni voce: data, descrizione (tour/crociera), importo, stato pagamento
- Possibilita di filtrare per periodo
- Totale importi

#### 4.3.7 Profilo Agenzia (/agenzia/profilo)

- Visualizzazione e modifica dei dati aziendali
- Cambio password
- Gestione dati di contatto

---

### 4.4 ADMIN PANEL (Tour Operator)

Pannello di amministrazione completo accessibile solo allo staff di MishaTravel. Layout con sidebar di navigazione, header con notifiche.

#### 4.4.1 Dashboard Admin (/admin/dashboard)

- **Statistiche**: Numero tour attivi, crociere attive, agenzie registrate, richieste in attesa
- **Richieste recenti**: Le ultime richieste da gestire con azioni rapide
- **Prossime partenze**: Tour/crociere in partenza nei prossimi 30 giorni
- **Notifiche**: Nuove registrazioni, nuove richieste, offerte accettate/declinate

#### 4.4.2 Gestione Tour (/admin/tour)

**Lista Tour**: Tabella con ricerca, filtri (destinazione, stato), azioni (modifica, duplica, elimina)

**Editor Tour** (Creazione/Modifica):

Sostituto di WordPress + ACF. L'interfaccia deve essere piu intuitiva di ACF. Campi organizzati in tab/sezioni:

**Tab "Informazioni Base"**:
- Titolo del tour
- Slug (auto-generato, modificabile)
- Destinazione (select, relazione con tabella destinazioni)
- Descrizione breve (textarea)
- Descrizione completa (rich text editor con formattazione, immagini inline)
- Durata: giorni e notti (numeri)
- Prezzo a partire da (numero, in EUR)
- Stato pubblicazione (bozza/pubblicato)

**Tab "Itinerario"**:
- Lista dinamica di giorni. Per ogni giorno:
  - Numero giorno (auto)
  - Titolo del giorno (es. "Arrivo a Istanbul")
  - Descrizione del giorno (rich text)
  - Immagine del giorno (opzionale)
- Pulsanti: Aggiungi giorno, Riordina (drag & drop), Elimina giorno

**Tab "Incluso / Escluso"**:
- Lista "Cosa e incluso" (aggiungi/rimuovi voci)
- Lista "Cosa NON e incluso" (aggiungi/rimuovi voci)

**Tab "Gallery"**:
- Upload multiplo di immagini
- Drag & drop per riordinare
- Immagine principale (cover)
- Possibilita di aggiungere didascalie

**Tab "Partenze e Prezzi"**:
- Tabella partenze con: data partenza, data ritorno, prezzo, posti totali, posti disponibili, stato (aperta/chiusa/esaurita)
- Aggiunta/modifica/eliminazione partenze

**Tab "Extra e Servizi Aggiuntivi"**:
- Lista di servizi extra aggiungibili dall'agenzia in fase di richiesta
- Per ogni extra: nome, descrizione, prezzo aggiuntivo (opzionale)

**Tab "SEO"**:
- Meta title
- Meta description
- Immagine Open Graph

#### 4.4.3 Gestione Crociere Fluviali (/admin/crociere)

**Lista Crociere**: Come per i tour ma con colonna nave associata.

**Editor Crociera** (Creazione/Modifica):

Simile ai tour ma con campi aggiuntivi specifici per le crociere. I campi condizionali (deck, cabine) si attivano in base alla nave selezionata.

**Tab "Informazioni Base"**: Come per i tour + campo "Nave" (select, relazione con tabella flotta). Quando si seleziona una nave, vengono caricati automaticamente i deck e le cabine associate.

**Tab "Itinerario"**: Identico ai tour.

**Tab "Deck e Cabine"** (CONDIZIONALE - appare solo dopo selezione nave):
- Per ogni deck della nave selezionata:
  - Nome deck
  - Cabine disponibili per questo deck (con tipologia e prezzo)
  - Possibilita di override del prezzo per questa specifica crociera
- Matrice prezzi: Deck x Tipologia Cabina x Stagione

**Tab "Incluso / Escluso"**: Come per i tour.
**Tab "Gallery"**: Come per i tour.
**Tab "Partenze e Prezzi"**: Come per i tour ma con prezzi differenziati per deck/cabina.
**Tab "Extra e Servizi"**: Come per i tour.
**Tab "SEO"**: Come per i tour.

#### 4.4.4 Gestione Flotta (/admin/flotta)

**Lista Navi**: Tabella con nome, anno, capacita, numero crociere associate.

**Editor Nave**:
- Nome nave
- Descrizione
- Specifiche: lunghezza, larghezza, anno costruzione, anno ristrutturazione, capacita passeggeri, numero equipaggio, tonnellaggio
- **Gestione Deck** (Lista dinamica):
  - Per ogni deck: nome, ordine (dal basso verso l'alto), immagine planimetria
  - **Gestione Cabine per Deck** (Lista dinamica annidata):
    - Per ogni tipologia cabina: nome (es. "Suite Superior"), metratura, descrizione, dotazioni (lista), numero cabine di questo tipo, foto
- Servizi a bordo (lista)
- Gallery fotografica

#### 4.4.5 Gestione Calendario Partenze (/admin/partenze)

- **Vista calendario**: Visualizzazione mensile con tutte le partenze
- **Vista tabella**: Lista filtrabile e ordinabile
- **Creazione partenza**: Seleziona tour o crociera, data partenza, data ritorno, prezzo, posti
- **Modifica rapida**: Click su partenza per modificare stato/posti/prezzo
- **Gestione disponibilita**: Aggiornamento posti disponibili

#### 4.4.6 Gestione Agenzie (/admin/agenzie)

- **Lista agenzie**: Tabella con ragione sociale, citta, email, data registrazione, stato (attiva/bloccata), numero richieste
- **Dettaglio agenzia**: Tutti i dati dell'agenzia, storico richieste, estratto conto
- **Azioni**: Approva, Blocca, Elimina, Invia comunicazione

#### 4.4.7 Gestione Utenti e Ruoli (/admin/utenti)

Sezione per la gestione centralizzata di tutti gli utenti della piattaforma: admin, operatori e agenzie.

**Lista Utenti**: Tabella unica con filtri per ruolo, stato, data registrazione. Colonne: nome, email, ruolo (badge), stato, ultimo accesso.

**Ruoli disponibili**:

| Ruolo | Permessi |
|-------|----------|
| **Super Admin** | Accesso completo. Puo creare/modificare/eliminare altri admin e operatori. Gestione ruoli. Unico che puo eliminare un altro admin. |
| **Admin** | Accesso completo all'admin panel. Gestione tour, crociere, flotta, preventivi, agenzie, blog, cataloghi, media. Non puo gestire altri admin. |
| **Operatore** | Accesso limitato all'admin panel. Puo gestire solo le sezioni assegnate (es. solo preventivi, solo blog). I permessi per sezione sono configurabili dal Super Admin/Admin. |
| **Agenzia** | Nessun accesso all'admin panel. Solo area riservata agenzia. |

**Creazione nuovo utente admin/operatore**:
- Nome e cognome
- Email (diventa username)
- Ruolo (Admin / Operatore)
- Per Operatore: checkboxes per assegnare le sezioni accessibili:
  - [ ] Tour
  - [ ] Crociere
  - [ ] Flotta
  - [ ] Partenze
  - [ ] Destinazioni
  - [ ] Agenzie
  - [ ] Preventivi
  - [ ] Blog
  - [ ] Cataloghi
  - [ ] Media
  - [ ] Utenti (solo visualizzazione)
- Password temporanea o invio link di setup via email
- Stato (attivo/disattivato)

**Modifica utente**: Cambio ruolo, modifica permessi operatore, reset password, disattiva/riattiva account.

**Gestione agenzie dalla stessa vista**: Le agenzie appaiono nella stessa lista utenti (filtrabili per ruolo "Agenzia") con le stesse azioni di /admin/agenzie (approva, blocca, dettaglio). Questo fornisce una vista centralizzata di TUTTI gli utenti del sistema.

**Log attivita**: Per ogni utente, storico delle azioni principali (ultimo accesso, modifiche effettuate, richieste gestite).

#### 4.4.8 Gestione Preventivi/Richieste (/admin/preventivi)

Questa e la sezione core del lavoro quotidiano dell'admin. Gestione completa del flusso richiesta-offerta-conferma.

**Lista Richieste**: Tabella con filtri per stato, agenzia, tipo (tour/crociera), data.

**Dettaglio Richiesta**: Pagina completa con:

- **Dati richiesta originale**: Cosa ha richiesto l'agenzia (tour/crociera, date, partecipanti, deck/cabina, extra)
- **Dati agenzia**: Chi ha fatto la richiesta
- **Timeline**: Cronologia completa di tutti i passaggi
- **Azioni Admin**:
  1. **Modifica richiesta**: L'admin puo modificare i dettagli (date alternative, cabina diversa, etc.)
  2. **Crea e invia offerta**: L'admin compone l'offerta con:
     - Dettagli del pacchetto (confermati o modificati)
     - Prezzo totale
     - Condizioni e note
     - Termini di pagamento
     - Scadenza offerta
     → Invio all'agenzia (email Brevo + notifica in-app)
  3. **Invia estremi pagamento**: Dopo accettazione, invia:
     - Coordinate bancarie
     - Importo da pagare
     - Causale
     → Email all'agenzia
  4. **Conferma pagamento ricevuto**: Segna la prenotazione come confermata
  5. **Rifiuta richiesta**: Con motivazione

**Stati della richiesta** (visibili nella timeline):
```
INVIATA → IN LAVORAZIONE → OFFERTA INVIATA → ACCETTATA → PAGAMENTO INVIATO → CONFERMATA
                                             → DECLINATA
         → RIFIUTATA
```

#### 4.4.9 Gestione Blog (/admin/blog)

- **Lista articoli**: Tabella con titolo, data, categoria, stato (bozza/pubblicato)
- **Editor articolo**:
  - Titolo
  - Slug (auto-generato)
  - Categoria (select)
  - Immagine di copertina
  - Contenuto (rich text editor completo: testo formattato, immagini, video embed, link)
  - Estratto/Anteprima
  - Meta title e meta description (SEO)
  - Data pubblicazione (programmabile)
  - Stato (bozza/pubblicato)

#### 4.4.10 Gestione Destinazioni (/admin/destinazioni)

- **Lista destinazioni**: Griglia con immagine, nome, numero tour/crociere associate
- **Editor destinazione**:
  - Nome
  - Slug
  - Immagine
  - Descrizione
  - Macro-area (Europa, America Latina, Asia/Russia, Africa, Percorsi Fluviali)

#### 4.4.11 Gestione Cataloghi (/admin/cataloghi)

- Upload PDF
- Titolo, anno, immagine di copertina
- Ordine di visualizzazione
- Pubblicato/Nascosto

#### 4.4.12 Libreria Media (/admin/media)

- Upload multiplo di immagini e file
- Organizzazione in cartelle (opzionale)
- Ricerca per nome
- Visualizzazione griglia/lista
- Dettagli: dimensioni, peso, URL, utilizzo (dove e usata l'immagine)

---

### 4.5 SISTEMA EMAIL TRANSAZIONALI (Brevo)

Tutte le email sono inviate tramite Brevo e inviate sia all'agenzia che all'admin dove appropriato.

#### Email verso le Agenzie:
| Evento | Oggetto Email |
|--------|---------------|
| Registrazione completata | "Benvenuto su MishaTravel - Conferma la tua email" |
| Email verificata | "Account attivato - Inizia a esplorare le nostre proposte" |
| Password dimenticata | "Reimposta la tua password - MishaTravel" |
| Richiesta inviata | "La tua richiesta #XXX e stata inviata" |
| Offerta ricevuta | "Nuova offerta per la tua richiesta #XXX" |
| Offerta accettata (conferma) | "Conferma accettazione offerta #XXX" |
| Estremi pagamento ricevuti | "Dettagli pagamento per la prenotazione #XXX" |
| Prenotazione confermata | "Prenotazione #XXX confermata!" |
| Richiesta rifiutata | "Aggiornamento sulla richiesta #XXX" |

#### Email verso l'Admin (Tour Operator):
| Evento | Oggetto Email |
|--------|---------------|
| Nuova agenzia registrata | "Nuova agenzia registrata: [Ragione Sociale]" |
| Nuova richiesta preventivo | "Nuova richiesta #XXX da [Agenzia]" |
| Offerta accettata | "Offerta #XXX accettata da [Agenzia]" |
| Offerta declinata | "Offerta #XXX declinata da [Agenzia]" |

---

### 4.6 MIGRAZIONE DATI DA WORDPRESS

Per la migrazione dei dati dal sito WordPress esistente:

1. **Export dati ACF**: Esportazione della struttura campi ACF (JSON) e dei contenuti
2. **Export contenuti WordPress**: Export XML di tutti i contenuti (tour, crociere, blog, pagine)
3. **Export immagini**: Download di tutte le immagini dalla libreria media WordPress
4. **Script di importazione**: Script Node.js che:
   - Legge i file di export
   - Mappa i campi ACF alle nuove tabelle Supabase
   - Importa i contenuti nel database
   - Carica le immagini su Supabase Storage
   - Genera gli slug corretti per mantenere (dove possibile) la stessa struttura URL per SEO

---

### 4.7 SEO E PERFORMANCE

#### SEO:
- Tutte le pagine tour/crociere/blog generate con SSR/SSG per indicizzazione Google
- Meta tag dinamici (title, description, Open Graph, Twitter Card)
- Schema.org structured data: TouristTrip per tour, Event per partenze, BoatTrip per crociere, Article per blog
- Sitemap XML automatica
- robots.txt
- Redirect 301 dalle vecchie URL WordPress alle nuove (per mantenere il posizionamento)
- URL SEO-friendly in italiano

#### Performance:
- Next.js Image Optimization (WebP/AVIF automatico, lazy loading, responsive)
- ISR (Incremental Static Regeneration) per pagine tour/crociere
- Code splitting automatico
- CDN Vercel globale

---

## 5. Ruoli e Permessi

| Ruolo | Accesso | Gestito da |
|-------|---------|------------|
| **Visitatore** | Sito pubblico, pagine tour/crociere (senza prenotazione), blog, cataloghi | - |
| **Agenzia** | Tutto il pubblico + Area riservata agenzia + Richiesta preventivi | Admin / Super Admin |
| **Operatore** | Admin panel limitato alle sezioni assegnate (es. solo preventivi, solo blog). Permessi configurabili per sezione. | Admin / Super Admin |
| **Admin** | Admin panel completo. Gestione contenuti, agenzie, preventivi, operatori. Non puo gestire altri admin. | Super Admin |
| **Super Admin** | Accesso totale. Crea/modifica/elimina admin e operatori. Gestione ruoli e permessi. Unico che puo eliminare un admin. | - (ruolo massimo) |

### Matrice Permessi Operatore (configurabile)

L'admin o super admin puo assegnare a ciascun operatore l'accesso a specifiche sezioni:

| Sezione Admin | Descrizione permesso |
|---------------|---------------------|
| Tour | Creare, modificare, eliminare tour |
| Crociere | Creare, modificare, eliminare crociere |
| Flotta | Creare, modificare, eliminare navi |
| Partenze | Gestire calendario partenze |
| Destinazioni | Creare, modificare, eliminare destinazioni |
| Agenzie | Visualizzare e gestire agenzie partner |
| Preventivi | Gestire richieste e inviare offerte |
| Blog | Creare, modificare, eliminare articoli |
| Cataloghi | Caricare e gestire cataloghi PDF |
| Media | Caricare e gestire file nella libreria media |
| Utenti | Solo visualizzazione lista utenti |

---

## 6. Responsive Design

L'intera applicazione deve essere mobile-first e responsive:
- **Mobile** (< 768px): Navigazione hamburger, layout a colonna singola, card full-width
- **Tablet** (768px - 1024px): Layout a 2 colonne, sidebar collassabile nell'admin
- **Desktop** (> 1024px): Layout completo, sidebar espansa nell'admin

---

## 7. Lingua

L'interfaccia e interamente in **italiano**. Non e prevista al momento una versione multilingua.

---

*Documento aggiornato al: 21 Febbraio 2026*
