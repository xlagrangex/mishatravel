/**
 * MishaTravel - Seed Script per Dati Demo
 *
 * Popola il database Supabase con dati demo realistici e crea utenti demo.
 *
 * Uso:
 *   npx tsx scripts/seed-demo.ts          # Inserisce solo se non esistono
 *   npx tsx scripts/seed-demo.ts --force  # Cancella tutto e re-inserisce
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Load .env.local from project root
config({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\x1b[31m[ERROR]\x1b[0m Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FORCE = process.argv.includes("--force");

// ============================================================
// COLORS
// ============================================================
const c = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

function log(msg: string) {
  console.log(`${c.cyan}[SEED]${c.reset} ${msg}`);
}
function logOk(msg: string) {
  console.log(`${c.green}  [OK]${c.reset} ${msg}`);
}
function logWarn(msg: string) {
  console.log(`${c.yellow}[WARN]${c.reset} ${msg}`);
}
function logErr(msg: string) {
  console.error(`${c.red}[ERR]${c.reset} ${msg}`);
}

// ============================================================
// DEMO USER CREDENTIALS
// ============================================================
const DEMO_ADMIN = {
  email: "admin@mishatravel.com",
  password: "MishaAdmin2026!",
  role: "super_admin" as const,
};

const DEMO_AGENCY = {
  email: "agenzia@mishatravel.com",
  password: "MishaAgenzia2026!",
  role: "agency" as const,
};

// ============================================================
// HELPER: safe insert with error handling
// ============================================================
async function safeInsert<T extends Record<string, unknown>>(
  table: string,
  data: T | T[],
  returnId = true
): Promise<(T & { id: string })[]> {
  const query = returnId
    ? supabase.from(table).insert(data).select()
    : supabase.from(table).insert(data).select();

  const { data: result, error } = await query;
  if (error) {
    logErr(`Insert into ${table} failed: ${error.message}`);
    throw error;
  }
  return result as (T & { id: string })[];
}

// ============================================================
// CHECK IF DEMO DATA EXISTS
// ============================================================
async function checkExistingData(): Promise<boolean> {
  const { data } = await supabase.auth.admin.listUsers();
  if (data?.users) {
    const adminExists = data.users.some(
      (u) => u.email === DEMO_ADMIN.email
    );
    if (adminExists) return true;
  }
  return false;
}

// ============================================================
// DELETE ALL DEMO DATA (for --force)
// ============================================================
async function deleteAllData() {
  log("Deleting all existing data (--force mode)...");

  // Delete users first
  const { data: users } = await supabase.auth.admin.listUsers();
  if (users?.users) {
    for (const user of users.users) {
      if (
        user.email === DEMO_ADMIN.email ||
        user.email === DEMO_AGENCY.email
      ) {
        // Delete user_roles first (FK constraint)
        await supabase.from("user_roles").delete().eq("user_id", user.id);
        // Delete agencies (FK constraint)
        await supabase.from("agencies").delete().eq("user_id", user.id);
        // Delete notifications
        await supabase.from("notifications").delete().eq("user_id", user.id);
        // Delete the auth user
        await supabase.auth.admin.deleteUser(user.id);
        logOk(`Deleted user: ${user.email}`);
      }
    }
  }

  // Delete content in dependency order (children first)
  const childTables = [
    "tour_itinerary_days",
    "tour_departures",
    "tour_supplements",
    "tour_inclusions",
    "tour_terms",
    "tour_penalties",
    "tour_gallery",
    "tour_optional_excursions",
    "tour_locations",
    "tour_hotels",
    "cruise_itinerary_days",
    "cruise_departures",
    "cruise_supplements",
    "cruise_inclusions",
    "cruise_terms",
    "cruise_penalties",
    "cruise_gallery",
    "cruise_locations",
    "cruise_cabins",
    "ship_suitable_for",
    "ship_activities",
    "ship_services",
    "ship_gallery",
    "ship_cabin_details",
    "blog_posts",
    "blog_categories",
  ];

  for (const table of childTables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) logWarn(`Could not clear ${table}: ${error.message}`);
    else logOk(`Cleared ${table}`);
  }

  // Delete parent tables
  const parentTables = ["tours", "cruises", "ships", "destinations", "catalogs"];
  for (const table of parentTables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) logWarn(`Could not clear ${table}: ${error.message}`);
    else logOk(`Cleared ${table}`);
  }

  logOk("All existing data deleted.");
}

// ============================================================
// CREATE DEMO USERS
// ============================================================
async function createDemoUsers(): Promise<{
  adminId: string;
  agencyUserId: string;
}> {
  log("Creating demo users...");

  // Create super admin
  const { data: adminData, error: adminError } =
    await supabase.auth.admin.createUser({
      email: DEMO_ADMIN.email,
      password: DEMO_ADMIN.password,
      email_confirm: true,
      user_metadata: { full_name: "Admin MishaTravel" },
    });

  if (adminError) {
    logErr(`Failed to create admin user: ${adminError.message}`);
    throw adminError;
  }
  const adminId = adminData.user.id;
  logOk(`Created admin user: ${DEMO_ADMIN.email} (id: ${adminId})`);

  // Assign super_admin role
  await safeInsert("user_roles", {
    user_id: adminId,
    role: DEMO_ADMIN.role,
  });
  logOk(`Assigned role: ${DEMO_ADMIN.role}`);

  // Create agency user
  const { data: agencyData, error: agencyError } =
    await supabase.auth.admin.createUser({
      email: DEMO_AGENCY.email,
      password: DEMO_AGENCY.password,
      email_confirm: true,
      user_metadata: { full_name: "Agenzia Viaggi Demo" },
    });

  if (agencyError) {
    logErr(`Failed to create agency user: ${agencyError.message}`);
    throw agencyError;
  }
  const agencyUserId = agencyData.user.id;
  logOk(`Created agency user: ${DEMO_AGENCY.email} (id: ${agencyUserId})`);

  // Assign agency role
  await safeInsert("user_roles", {
    user_id: agencyUserId,
    role: DEMO_AGENCY.role,
  });
  logOk(`Assigned role: ${DEMO_AGENCY.role}`);

  return { adminId, agencyUserId };
}

// ============================================================
// CREATE AGENCY RECORD
// ============================================================
async function createAgencyRecord(agencyUserId: string): Promise<string> {
  log("Creating demo agency record...");

  const [agency] = await safeInsert("agencies", {
    user_id: agencyUserId,
    business_name: "Agenzia Viaggi Demo S.r.l.",
    vat_number: "IT12345678901",
    fiscal_code: "12345678901",
    license_number: "LIC-2024-001234",
    address: "Via Roma 42",
    city: "Milano",
    zip_code: "20121",
    province: "MI",
    contact_name: "Marco Rossi",
    phone: "+39 02 1234567",
    email: DEMO_AGENCY.email,
    website: "https://www.agenziademo.it",
    status: "active",
  });

  logOk(`Created agency: ${agency.business_name} (id: ${agency.id})`);
  return agency.id;
}

// ============================================================
// SEED DESTINATIONS
// ============================================================
async function seedDestinations(): Promise<Record<string, string>> {
  log("Seeding destinations...");

  const destinations = [
    {
      name: "Turchia",
      slug: "turchia",
      description:
        "Crocevia millenario tra Europa e Asia, la Turchia incanta con le moschee di Istanbul, i paesaggi lunari della Cappadocia e le spiagge della costa egea. Una terra dove storia bizantina, ottomana e modernita si fondono in un mosaico unico.",
      macro_area: "Medio Oriente",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "39.9334,32.8597",
    },
    {
      name: "Giappone",
      slug: "giappone",
      description:
        "Il Paese del Sol Levante stupisce per i suoi contrasti: dai templi zen di Kyoto ai neon di Tokyo, dai ciliegi in fiore alle Alpi giapponesi. Un viaggio tra tradizione millenaria e innovazione futuristica.",
      macro_area: "Asia Orientale",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "36.2048,138.2529",
    },
    {
      name: "India",
      slug: "india",
      description:
        "Terra di spiritualita e colori, l'India offre esperienze indimenticabili: il maestoso Taj Mahal, i palazzi del Rajasthan, le cerimonie sul Gange e una cucina che conquista tutti i sensi.",
      macro_area: "Asia Meridionale",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "20.5937,78.9629",
    },
    {
      name: "Marocco",
      slug: "marocco",
      description:
        "Tra le medine labirintiche di Fez e Marrakech, le dune dorate del Sahara e le montagne dell'Atlante, il Marocco regala un'esperienza sensoriale completa fatta di profumi, colori e sapori.",
      macro_area: "Africa",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "31.7917,-7.0926",
    },
    {
      name: "Egitto",
      slug: "egitto",
      description:
        "Culla di una delle piu antiche civilta del mondo, l'Egitto affascina con le Piramidi di Giza, i templi di Luxor e una crociera sul Nilo che ripercorre millenni di storia straordinaria.",
      macro_area: "Africa",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "26.8206,30.8025",
    },
    {
      name: "Peru",
      slug: "peru",
      description:
        "Dalle vette andine di Machu Picchu alla foresta amazzonica, dalla cultura Inca alla vibrante Lima. Il Peru e una destinazione che emoziona con paesaggi mozzafiato e un patrimonio culturale immenso.",
      macro_area: "Sud America",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "-9.19,-75.0152",
    },
    {
      name: "Danubio",
      slug: "danubio",
      description:
        "Il secondo fiume piu lungo d'Europa attraversa dieci paesi, collegando capitali storiche come Vienna, Budapest e Bratislava. Una crociera fluviale sul Danubio e un viaggio nel cuore della Mitteleuropa.",
      macro_area: "Percorsi Fluviali",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "47.4979,19.0402",
    },
    {
      name: "Duero",
      slug: "duero",
      description:
        "Il Douro portoghese scorre tra vigneti terrazzati patrimonio UNESCO, borghi pittoreschi e cantine dove nasce il celebre vino Porto. Una crociera fluviale tra cultura, enogastronomia e paesaggi incantevoli.",
      macro_area: "Percorsi Fluviali",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "41.1579,-8.6291",
    },
    {
      name: "Georgia",
      slug: "georgia",
      description:
        "Incastonata tra il Caucaso e il Mar Nero, la Georgia sorprende con le sue chiese medievali, la tradizione vinicola millenaria e paesaggi montani spettacolari. Un gioiello ancora poco conosciuto.",
      macro_area: "Caucaso",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "42.3154,43.3569",
    },
    {
      name: "Giordania",
      slug: "giordania",
      description:
        "La Giordania custodisce tesori come la citta rosa di Petra, il deserto del Wadi Rum e le acque del Mar Morto. Un viaggio tra archeologia nabatea, ospitalita beduina e paesaggi da film.",
      macro_area: "Medio Oriente",
      cover_image_url: "/images/placeholder.jpg",
      status: "published" as const,
      coordinate: "30.5852,36.2384",
    },
  ];

  const result = await safeInsert("destinations", destinations);
  const idMap: Record<string, string> = {};
  for (const d of result) {
    idMap[(d as any).slug] = (d as any).id;
    logOk(`Destination: ${(d as any).name}`);
  }

  return idMap;
}

// ============================================================
// SEED TOURS
// ============================================================
async function seedTours(destIds: Record<string, string>): Promise<string[]> {
  log("Seeding tours...");

  const toursData = [
    {
      title: "Istanbul Classica",
      slug: "istanbul-classica",
      content:
        "<p>Un viaggio imperdibile alla scoperta di Istanbul, la citta che unisce due continenti. Dalla maestosa Basilica di Santa Sofia alla Moschea Blu, dal vivace Gran Bazar alle acque del Bosforo, ogni angolo racconta secoli di storia e cultura.</p><p>Il programma include visite guidate ai principali monumenti bizantini e ottomani, una crociera panoramica sul Bosforo e tempo libero per esplorare i colorati quartieri di Sultanahmet e Beyoglu.</p>",
      cover_image_url: "/images/placeholder.jpg",
      destination_id: destIds["turchia"],
      a_partire_da: "1.290",
      durata_notti: "7",
      numero_persone: 25,
      pensione: ["completa"],
      tipo_voli: "Voli di linea Turkish Airlines",
      status: "published" as const,
      meta_title: "Tour Istanbul Classica - 7 Notti | MishaTravel",
      meta_description:
        "Scopri Istanbul in 7 notti: Santa Sofia, Moschea Blu, Gran Bazar, crociera sul Bosforo. Tour di gruppo con guida in italiano.",
    },
    {
      title: "Giappone Essenziale",
      slug: "giappone-essenziale",
      content:
        "<p>Un viaggio straordinario nel Giappone piu autentico, da Tokyo a Kyoto passando per Osaka e Nara. Dodici notti per immergersi nella cultura nipponica, tra templi zen, giardini perfetti, cerimonie del te e la vibrante modernita delle metropoli.</p><p>Il tour include il Japan Rail Pass per spostarsi in treno ad alta velocita Shinkansen, notti in ryokan tradizionale con onsen termale e degustazioni di cucina kaiseki.</p>",
      cover_image_url: "/images/placeholder.jpg",
      destination_id: destIds["giappone"],
      a_partire_da: "3.490",
      durata_notti: "12",
      numero_persone: 20,
      pensione: ["mezza"],
      tipo_voli: "Voli di linea ANA/JAL",
      status: "published" as const,
      meta_title: "Tour Giappone Essenziale - 12 Notti | MishaTravel",
      meta_description:
        "Tour Giappone 12 notti: Tokyo, Kyoto, Osaka, Nara. Shinkansen, ryokan, templi zen. Guida in italiano.",
    },
    {
      title: "India del Nord: Il Triangolo d'Oro",
      slug: "india-del-nord-triangolo-doro",
      content:
        "<p>Il classico itinerario del Triangolo d'Oro tocca le tre citta piu iconiche dell'India del Nord: Delhi, Agra e Jaipur. Nove notti per scoprire il Taj Mahal al tramonto, i palazzi dei Maharaja, i bazar colorati e la spiritualita millenaria indiana.</p><p>Il tour prevede trasferimenti in pullman GT climatizzato, hotel selezionati 4/5 stelle e guida locale parlante italiano. Possibilita di estensione a Varanasi.</p>",
      cover_image_url: "/images/placeholder.jpg",
      destination_id: destIds["india"],
      a_partire_da: "1.890",
      durata_notti: "9",
      numero_persone: 25,
      pensione: ["completa"],
      tipo_voli: "Voli di linea Emirates via Dubai",
      status: "published" as const,
      meta_title:
        "Tour India Triangolo d'Oro - 9 Notti | MishaTravel",
      meta_description:
        "Tour India del Nord 9 notti: Delhi, Agra (Taj Mahal), Jaipur. Hotel 4/5 stelle, guida italiano.",
    },
    {
      title: "Marocco Imperiale",
      slug: "marocco-imperiale",
      content:
        "<p>Un viaggio affascinante attraverso le quattro citta imperiali del Marocco: Marrakech, Fez, Meknes e Rabat. Otto notti per perdersi nelle medine patrimonio UNESCO, esplorare i souk profumati di spezie e scoprire l'architettura islamica piu raffinata.</p><p>Il programma include una notte nel deserto del Sahara con cena sotto le stelle, attraversamento delle gole del Todra e visita ai villaggi berberi dell'Atlante.</p>",
      cover_image_url: "/images/placeholder.jpg",
      destination_id: destIds["marocco"],
      a_partire_da: "1.190",
      durata_notti: "8",
      numero_persone: 30,
      pensione: ["completa"],
      tipo_voli: "Voli di linea Royal Air Maroc",
      status: "published" as const,
      meta_title: "Tour Marocco Imperiale - 8 Notti | MishaTravel",
      meta_description:
        "Tour Marocco 8 notti: Marrakech, Fez, deserto Sahara, gole del Todra. Pensione completa, guida italiano.",
    },
    {
      title: "Peru e Machu Picchu",
      slug: "peru-e-machu-picchu",
      content:
        "<p>Un'avventura epica attraverso il Peru, dalla cosmopolita Lima alle vette andine di Cusco e alla Valle Sacra degli Inca. Il momento culmine: l'alba a Machu Picchu, la citta perduta degli Inca sospesa tra le nuvole.</p><p>Undici notti che includono anche il Lago Titicaca con le isole galleggianti degli Uros, il quartiere coloniale di Cusco e le saline di Maras. Tour con acclimatamento graduale all'altitudine.</p>",
      cover_image_url: "/images/placeholder.jpg",
      destination_id: destIds["peru"],
      a_partire_da: "2.990",
      durata_notti: "11",
      numero_persone: 20,
      pensione: ["completa"],
      tipo_voli: "Voli di linea LATAM via Madrid",
      status: "published" as const,
      meta_title: "Tour Peru e Machu Picchu - 11 Notti | MishaTravel",
      meta_description:
        "Tour Peru 11 notti: Lima, Cusco, Machu Picchu, Lago Titicaca. Pensione completa, guida italiano.",
    },
    {
      title: "Giordania: Petra e il Mar Morto",
      slug: "giordania-petra-mar-morto",
      content:
        "<p>Sette notti alla scoperta della Giordania, terra di antiche civilta e paesaggi lunari. Dal Tesoro di Petra scavato nella roccia rosa al deserto del Wadi Rum dove Lawrence d'Arabia cavalcava tra le dune rosse.</p><p>Il viaggio include il bagno nelle acque ipersaline del Mar Morto, la visita alla cittadella di Amman, i mosaici bizantini di Madaba e il panorama dal Monte Nebo. Pernottamento in campo tendato di lusso nel Wadi Rum.</p>",
      cover_image_url: "/images/placeholder.jpg",
      destination_id: destIds["giordania"],
      a_partire_da: "1.590",
      durata_notti: "7",
      numero_persone: 25,
      pensione: ["completa"],
      tipo_voli: "Voli di linea Royal Jordanian",
      status: "published" as const,
      meta_title: "Tour Giordania: Petra e Mar Morto - 7 Notti | MishaTravel",
      meta_description:
        "Tour Giordania 7 notti: Petra, Wadi Rum, Mar Morto, Amman. Campo tendato nel deserto, guida italiano.",
    },
  ];

  const tours = await safeInsert("tours", toursData);
  const tourIds: string[] = [];

  for (const tour of tours) {
    const t = tour as any;
    tourIds.push(t.id);
    logOk(`Tour: ${t.title} (${t.durata_notti} notti)`);
  }

  // --- ITINERARY DAYS ---
  log("  Seeding tour itinerary days...");
  const itineraryData = [
    // Istanbul Classica (tour 0)
    { tour_id: tourIds[0], numero_giorno: "1", localita: "Milano - Istanbul", descrizione: "<p>Partenza dall'aeroporto di Milano Malpensa con volo diretto Turkish Airlines. Arrivo a Istanbul nel pomeriggio. Trasferimento in hotel nel quartiere di Sultanahmet. Cena di benvenuto in ristorante tipico con vista sul Bosforo.</p>", sort_order: 0 },
    { tour_id: tourIds[0], numero_giorno: "2", localita: "Istanbul - Sultanahmet", descrizione: "<p>Giornata dedicata ai capolavori di Sultanahmet: visita alla Basilica di Santa Sofia, alla Moschea Blu e all'antico Ippodromo. Nel pomeriggio, esplorazione della Cisterna Basilica e passeggiata nel quartiere.</p>", sort_order: 1 },
    { tour_id: tourIds[0], numero_giorno: "3", localita: "Istanbul - Palazzo Topkapi", descrizione: "<p>Mattina al Palazzo Topkapi, residenza dei sultani ottomani per quattro secoli, con il famoso Harem e la sala del tesoro. Pomeriggio al Gran Bazar, il piu grande mercato coperto del mondo.</p>", sort_order: 2 },
    { tour_id: tourIds[0], numero_giorno: "4", localita: "Istanbul - Bosforo", descrizione: "<p>Crociera panoramica sul Bosforo tra Europa e Asia. Sosta al quartiere asiatico di Uskudar. Pomeriggio al Bazar delle Spezie e visita alla Moschea di Solimano il Magnifico.</p>", sort_order: 3 },
    { tour_id: tourIds[0], numero_giorno: "5", localita: "Istanbul - Quartieri moderni", descrizione: "<p>Escursione ai quartieri di Beyoglu e Galata: Torre di Galata, Istiklal Caddesi, chiese armene e greche. Pomeriggio libero per shopping. Cena in ristorante sulla terrazza panoramica.</p>", sort_order: 4 },
    { tour_id: tourIds[0], numero_giorno: "6", localita: "Escursione Principi", descrizione: "<p>Giornata dedicata all'escursione alle Isole dei Principi nel Mar di Marmara. Trasferimento in traghetto. Giro dell'isola di Buyukada in carrozza (senza auto). Pranzo di pesce fresco.</p>", sort_order: 5 },
    { tour_id: tourIds[0], numero_giorno: "7", localita: "Istanbul - Milano", descrizione: "<p>Mattina libera per ultimi acquisti. Trasferimento in aeroporto e volo di rientro a Milano.</p>", sort_order: 6 },

    // Giappone Essenziale (tour 1)
    { tour_id: tourIds[1], numero_giorno: "1", localita: "Roma - Tokyo", descrizione: "<p>Partenza dall'aeroporto di Roma Fiumicino con volo ANA. Pasti e intrattenimento a bordo.</p>", sort_order: 0 },
    { tour_id: tourIds[1], numero_giorno: "2", localita: "Tokyo", descrizione: "<p>Arrivo a Tokyo Narita. Trasferimento in hotel a Shinjuku. Resto della giornata libera per riprendersi dal jet lag. Cena di benvenuto con sushi tradizionale.</p>", sort_order: 1 },
    { tour_id: tourIds[1], numero_giorno: "3", localita: "Tokyo", descrizione: "<p>Giornata dedicata a Tokyo: tempio Senso-ji ad Asakusa, quartiere di Akihabara, parco di Ueno. Pomeriggio nel quartiere di Harajuku e Shibuya crossing. Cena in izakaya tipica.</p>", sort_order: 2 },
    { tour_id: tourIds[1], numero_giorno: "4", localita: "Tokyo - Hakone", descrizione: "<p>Escursione a Hakone: crociera sul Lago Ashi con vista sul Monte Fuji, museo all'aperto, viaggio sulla funicolare. Pernottamento in ryokan con onsen termale.</p>", sort_order: 3 },
    { tour_id: tourIds[1], numero_giorno: "5", localita: "Hakone - Kyoto", descrizione: "<p>Trasferimento in Shinkansen (treno proiettile) a Kyoto. Pomeriggio al tempio Kinkaku-ji (Padiglione d'Oro) e al giardino zen del Ryoan-ji.</p>", sort_order: 4 },
    { tour_id: tourIds[1], numero_giorno: "6", localita: "Kyoto", descrizione: "<p>Giornata a Kyoto: foresta di bambu di Arashiyama, tempio Tenryu-ji, quartiere delle geisha Gion. Cerimonia del te in casa tradizionale.</p>", sort_order: 5 },
    { tour_id: tourIds[1], numero_giorno: "7", localita: "Kyoto - Nara", descrizione: "<p>Escursione a Nara: tempio Todai-ji con il Grande Buddha in bronzo, parco dei cervi sacri. Rientro a Kyoto e visita al Fushimi Inari con i mille torii rossi.</p>", sort_order: 6 },
    { tour_id: tourIds[1], numero_giorno: "8", localita: "Kyoto - Osaka", descrizione: "<p>Trasferimento a Osaka. Visita al castello di Osaka e al quartiere di Dotonbori. Street food tour nel quartiere di Shinsekai.</p>", sort_order: 7 },
    { tour_id: tourIds[1], numero_giorno: "9-10", localita: "Osaka - Hiroshima", descrizione: "<p>Escursione di due giorni a Hiroshima: Museo della Pace, cupola Genbaku, isola di Miyajima con il torii galleggiante. Ritorno a Osaka.</p>", sort_order: 8 },
    { tour_id: tourIds[1], numero_giorno: "11", localita: "Osaka - Tokyo", descrizione: "<p>Rientro a Tokyo in Shinkansen. Pomeriggio libero per shopping a Ginza. Cena di arrivederci in ristorante stellato.</p>", sort_order: 9 },
    { tour_id: tourIds[1], numero_giorno: "12", localita: "Tokyo - Roma", descrizione: "<p>Trasferimento in aeroporto e volo di rientro a Roma Fiumicino.</p>", sort_order: 10 },

    // India del Nord (tour 2)
    { tour_id: tourIds[2], numero_giorno: "1", localita: "Milano - Delhi", descrizione: "<p>Partenza dall'aeroporto di Milano con volo Emirates via Dubai. Arrivo a Delhi in tarda serata. Trasferimento in hotel 5 stelle.</p>", sort_order: 0 },
    { tour_id: tourIds[2], numero_giorno: "2", localita: "Delhi", descrizione: "<p>Visita della Old Delhi: Red Fort, Jama Masjid, Chandni Chowk in risciò. Pomeriggio alla New Delhi: India Gate, Qutub Minar, Tomba di Humayun. Cena di benvenuto.</p>", sort_order: 1 },
    { tour_id: tourIds[2], numero_giorno: "3", localita: "Delhi - Agra", descrizione: "<p>Trasferimento ad Agra via Mathura. Nel pomeriggio visita al Forte di Agra, possente fortezza mughal. Tramonto con vista sul Taj Mahal dal giardino Mehtab Bagh.</p>", sort_order: 2 },
    { tour_id: tourIds[2], numero_giorno: "4", localita: "Agra", descrizione: "<p>Alba al Taj Mahal, il monumento all'amore eterno. Visita approfondita del mausoleo e dei giardini. Pomeriggio al Baby Taj (Itimad-ud-Daulah). Serata libera.</p>", sort_order: 3 },
    { tour_id: tourIds[2], numero_giorno: "5", localita: "Agra - Fatehpur Sikri - Jaipur", descrizione: "<p>Trasferimento a Jaipur con sosta a Fatehpur Sikri, la citta fantasma mughal perfettamente conservata. Arrivo a Jaipur, la Citta Rosa, nel pomeriggio.</p>", sort_order: 4 },
    { tour_id: tourIds[2], numero_giorno: "6", localita: "Jaipur", descrizione: "<p>Salita al Forte Amber su jeep. Visita al Palazzo dei Venti (Hawa Mahal), City Palace e osservatorio astronomico Jantar Mantar. Shopping nei bazar di pietre preziose.</p>", sort_order: 5 },
    { tour_id: tourIds[2], numero_giorno: "7", localita: "Jaipur", descrizione: "<p>Giornata per esplorare Jaipur: Nahargarh Fort, mercato dei tessuti, lezione di cucina indiana. Cena di gala in palazzo storico con spettacolo di danze rajasthane.</p>", sort_order: 6 },
    { tour_id: tourIds[2], numero_giorno: "8", localita: "Jaipur - Delhi", descrizione: "<p>Rientro a Delhi. Pomeriggio libero per shopping o relax. Cena di arrivederci in ristorante panoramico.</p>", sort_order: 7 },
    { tour_id: tourIds[2], numero_giorno: "9", localita: "Delhi - Milano", descrizione: "<p>Trasferimento in aeroporto e volo di rientro a Milano via Dubai.</p>", sort_order: 8 },

    // Marocco Imperiale (tour 3)
    { tour_id: tourIds[3], numero_giorno: "1", localita: "Roma - Casablanca - Rabat", descrizione: "<p>Volo per Casablanca. Trasferimento a Rabat, la capitale. Visita alla Torre Hassan, al Mausoleo di Mohammed V e alla Kasbah degli Oudaia. Cena di benvenuto.</p>", sort_order: 0 },
    { tour_id: tourIds[3], numero_giorno: "2", localita: "Rabat - Meknes - Volubilis - Fez", descrizione: "<p>Partenza per Meknes, la Versailles del Marocco: Bab Mansour, granai del sultano Moulay Ismail. Sosta alle rovine romane di Volubilis. Arrivo a Fez in serata.</p>", sort_order: 1 },
    { tour_id: tourIds[3], numero_giorno: "3", localita: "Fez", descrizione: "<p>Giornata intera nella medina di Fez, la piu grande zona pedonale del mondo: Madrasa Bou Inania, concerie Chouara, souk degli artigiani. Pranzo in riad storico.</p>", sort_order: 2 },
    { tour_id: tourIds[3], numero_giorno: "4", localita: "Fez - Ifrane - Erfoud", descrizione: "<p>Attraversamento del Medio Atlante passando per Ifrane, la piccola Svizzera marocchina, e le foreste di cedri con le scimmie di Barberia. Arrivo a Erfoud, porta del deserto.</p>", sort_order: 3 },
    { tour_id: tourIds[3], numero_giorno: "5", localita: "Erfoud - Merzouga - Deserto", descrizione: "<p>Escursione in 4x4 alle dune di Erg Chebbi. Passeggiata in cammello al tramonto. Notte in campo tendato di lusso nel Sahara con cena berbera e musica tradizionale sotto le stelle.</p>", sort_order: 4 },
    { tour_id: tourIds[3], numero_giorno: "6", localita: "Merzouga - Gole Todra - Ouarzazate", descrizione: "<p>Alba nel deserto. Trasferimento attraverso le Gole del Todra e la Valle delle Rose fino a Ouarzazate. Visita agli studi cinematografici Atlas dove sono stati girati Gladiatore e Game of Thrones.</p>", sort_order: 5 },
    { tour_id: tourIds[3], numero_giorno: "7", localita: "Ouarzazate - Ait Benhaddou - Marrakech", descrizione: "<p>Visita alla kasbah di Ait Benhaddou, patrimonio UNESCO. Attraversamento del passo Tizi n'Tichka (2260m). Arrivo a Marrakech nel pomeriggio. Serata in Piazza Jemaa el-Fna.</p>", sort_order: 6 },
    { tour_id: tourIds[3], numero_giorno: "8", localita: "Marrakech - Roma", descrizione: "<p>Mattina alla Koutoubia, ai Giardini Majorelle e al Palazzo Bahia. Tempo libero per il souk. Trasferimento in aeroporto e volo di rientro.</p>", sort_order: 7 },

    // Peru e Machu Picchu (tour 4)
    { tour_id: tourIds[4], numero_giorno: "1", localita: "Milano - Lima", descrizione: "<p>Volo intercontinentale per Lima via Madrid. Arrivo in serata. Trasferimento in hotel nel quartiere di Miraflores.</p>", sort_order: 0 },
    { tour_id: tourIds[4], numero_giorno: "2", localita: "Lima", descrizione: "<p>City tour di Lima: centro storico coloniale, Plaza de Armas, Convento di San Francisco con catacombe. Pranzo gastronomico con ceviche. Pomeriggio al quartiere bohemien di Barranco.</p>", sort_order: 1 },
    { tour_id: tourIds[4], numero_giorno: "3", localita: "Lima - Cusco", descrizione: "<p>Volo per Cusco (3400m). Pomeriggio di acclimatamento con passeggiata leggera nel centro: Plaza de Armas, Cattedrale, tempio Qorikancha. Mate de coca per l'altitudine.</p>", sort_order: 2 },
    { tour_id: tourIds[4], numero_giorno: "4", localita: "Cusco - Valle Sacra", descrizione: "<p>Escursione nella Valle Sacra degli Inca: mercato indigeno di Pisac, saline di Maras, terrazzamenti circolari di Moray, fortezza di Ollantaytambo.</p>", sort_order: 3 },
    { tour_id: tourIds[4], numero_giorno: "5", localita: "Valle Sacra - Machu Picchu", descrizione: "<p>Treno panoramico Vistadome fino ad Aguas Calientes. Salita a Machu Picchu: visita guidata della citta perduta degli Inca al tramonto. Pernottamento ad Aguas Calientes.</p>", sort_order: 4 },
    { tour_id: tourIds[4], numero_giorno: "6", localita: "Machu Picchu - Cusco", descrizione: "<p>Alba a Machu Picchu (seconda entrata). Opzionale: salita al Huayna Picchu. Rientro in treno a Cusco. Serata libera.</p>", sort_order: 5 },
    { tour_id: tourIds[4], numero_giorno: "7", localita: "Cusco", descrizione: "<p>Giornata libera a Cusco: quartiere di San Blas (artigianato), siti inca di Sacsayhuaman, Q'enqo. Lezione di cucina peruviana. Cena in ristorante novoandino.</p>", sort_order: 6 },
    { tour_id: tourIds[4], numero_giorno: "8-9", localita: "Cusco - Puno - Lago Titicaca", descrizione: "<p>Trasferimento in pullman panoramico a Puno (10 ore con soste). Giornata sul Lago Titicaca: isole galleggianti degli Uros, isola di Taquile. Pernottamento a Puno.</p>", sort_order: 7 },
    { tour_id: tourIds[4], numero_giorno: "10", localita: "Puno - Lima", descrizione: "<p>Volo Puno-Lima. Pomeriggio libero per ultimi acquisti nel quartiere di Miraflores. Cena di arrivederci fronte oceano.</p>", sort_order: 8 },
    { tour_id: tourIds[4], numero_giorno: "11", localita: "Lima - Milano", descrizione: "<p>Trasferimento in aeroporto e volo di rientro a Milano via Madrid.</p>", sort_order: 9 },

    // Giordania (tour 5)
    { tour_id: tourIds[5], numero_giorno: "1", localita: "Roma - Amman", descrizione: "<p>Volo per Amman. Arrivo e trasferimento in hotel. Cena di benvenuto con specialita giordane: mansaf, hummus, falafel.</p>", sort_order: 0 },
    { tour_id: tourIds[5], numero_giorno: "2", localita: "Amman - Jerash - Ajloun", descrizione: "<p>Visita di Amman: Cittadella, Teatro Romano, moschea di Re Abdullah. Escursione a Jerash, la Pompei d'Oriente, e al castello crociato di Ajloun.</p>", sort_order: 1 },
    { tour_id: tourIds[5], numero_giorno: "3", localita: "Amman - Madaba - Monte Nebo - Mar Morto", descrizione: "<p>I mosaici bizantini di Madaba (mappa della Terra Santa). Monte Nebo con il panorama sulla Terra Promessa. Discesa al Mar Morto: bagno nelle acque a -430m sotto il livello del mare.</p>", sort_order: 2 },
    { tour_id: tourIds[5], numero_giorno: "4", localita: "Mar Morto - Kerak - Piccola Petra", descrizione: "<p>Trasferimento verso sud con sosta al castello crociato di Kerak. Visita alla Piccola Petra (Siq al-Barid). Arrivo a Wadi Musa per la notte.</p>", sort_order: 3 },
    { tour_id: tourIds[5], numero_giorno: "5", localita: "Petra", descrizione: "<p>Giornata intera a Petra: passeggiata nel Siq, il Tesoro (Al-Khazneh), le tombe reali, il monastero Ad-Deir. Opzionale: Petra by Night con candele nel Siq.</p>", sort_order: 4 },
    { tour_id: tourIds[5], numero_giorno: "6", localita: "Petra - Wadi Rum", descrizione: "<p>Trasferimento nel deserto del Wadi Rum. Safari in jeep tra canyon, archi naturali e incisioni rupestri. Tramonto dalle dune. Notte in campo tendato di lusso beduino.</p>", sort_order: 5 },
    { tour_id: tourIds[5], numero_giorno: "7", localita: "Wadi Rum - Amman - Roma", descrizione: "<p>Alba nel deserto. Trasferimento all'aeroporto di Amman e volo di rientro a Roma.</p>", sort_order: 6 },
  ];

  await safeInsert("tour_itinerary_days", itineraryData);
  logOk(`Inserted ${itineraryData.length} itinerary days`);

  // --- TOUR DEPARTURES ---
  log("  Seeding tour departures...");
  const departuresData = [
    // Istanbul
    { tour_id: tourIds[0], from_city: "Milano", data_partenza: "2026-04-12", prezzo_3_stelle: 1290, prezzo_4_stelle: "1590", sort_order: 0 },
    { tour_id: tourIds[0], from_city: "Roma", data_partenza: "2026-05-10", prezzo_3_stelle: 1350, prezzo_4_stelle: "1650", sort_order: 1 },
    { tour_id: tourIds[0], from_city: "Milano", data_partenza: "2026-09-20", prezzo_3_stelle: 1390, prezzo_4_stelle: "1690", sort_order: 2 },
    { tour_id: tourIds[0], from_city: "Roma", data_partenza: "2026-10-18", prezzo_3_stelle: 1290, prezzo_4_stelle: "1590", sort_order: 3 },

    // Giappone
    { tour_id: tourIds[1], from_city: "Roma", data_partenza: "2026-03-28", prezzo_3_stelle: 3490, prezzo_4_stelle: "4290", sort_order: 0 },
    { tour_id: tourIds[1], from_city: "Milano", data_partenza: "2026-04-18", prezzo_3_stelle: 3690, prezzo_4_stelle: "4490", sort_order: 1 },
    { tour_id: tourIds[1], from_city: "Roma", data_partenza: "2026-10-10", prezzo_3_stelle: 3490, prezzo_4_stelle: "4290", sort_order: 2 },
    { tour_id: tourIds[1], from_city: "Milano", data_partenza: "2026-11-07", prezzo_3_stelle: 3390, prezzo_4_stelle: "4190", sort_order: 3 },

    // India
    { tour_id: tourIds[2], from_city: "Milano", data_partenza: "2026-02-28", prezzo_3_stelle: 1890, prezzo_4_stelle: "2390", sort_order: 0 },
    { tour_id: tourIds[2], from_city: "Roma", data_partenza: "2026-03-21", prezzo_3_stelle: 1950, prezzo_4_stelle: "2450", sort_order: 1 },
    { tour_id: tourIds[2], from_city: "Milano", data_partenza: "2026-10-31", prezzo_3_stelle: 1890, prezzo_4_stelle: "2390", sort_order: 2 },
    { tour_id: tourIds[2], from_city: "Roma", data_partenza: "2026-11-21", prezzo_3_stelle: 1890, prezzo_4_stelle: "2390", sort_order: 3 },

    // Marocco
    { tour_id: tourIds[3], from_city: "Roma", data_partenza: "2026-03-14", prezzo_3_stelle: 1190, prezzo_4_stelle: "1490", sort_order: 0 },
    { tour_id: tourIds[3], from_city: "Milano", data_partenza: "2026-04-25", prezzo_3_stelle: 1290, prezzo_4_stelle: "1590", sort_order: 1 },
    { tour_id: tourIds[3], from_city: "Roma", data_partenza: "2026-09-12", prezzo_3_stelle: 1190, prezzo_4_stelle: "1490", sort_order: 2 },
    { tour_id: tourIds[3], from_city: "Milano", data_partenza: "2026-10-10", prezzo_3_stelle: 1190, prezzo_4_stelle: "1490", sort_order: 3 },
    { tour_id: tourIds[3], from_city: "Roma", data_partenza: "2026-11-14", prezzo_3_stelle: 1090, prezzo_4_stelle: "1390", sort_order: 4 },

    // Peru
    { tour_id: tourIds[4], from_city: "Milano", data_partenza: "2026-05-09", prezzo_3_stelle: 2990, prezzo_4_stelle: "3690", sort_order: 0 },
    { tour_id: tourIds[4], from_city: "Roma", data_partenza: "2026-06-13", prezzo_3_stelle: 3090, prezzo_4_stelle: "3790", sort_order: 1 },
    { tour_id: tourIds[4], from_city: "Milano", data_partenza: "2026-09-05", prezzo_3_stelle: 2990, prezzo_4_stelle: "3690", sort_order: 2 },

    // Giordania
    { tour_id: tourIds[5], from_city: "Roma", data_partenza: "2026-03-07", prezzo_3_stelle: 1590, prezzo_4_stelle: "1890", sort_order: 0 },
    { tour_id: tourIds[5], from_city: "Milano", data_partenza: "2026-04-04", prezzo_3_stelle: 1650, prezzo_4_stelle: "1950", sort_order: 1 },
    { tour_id: tourIds[5], from_city: "Roma", data_partenza: "2026-10-03", prezzo_3_stelle: 1590, prezzo_4_stelle: "1890", sort_order: 2 },
    { tour_id: tourIds[5], from_city: "Milano", data_partenza: "2026-11-07", prezzo_3_stelle: 1490, prezzo_4_stelle: "1790", sort_order: 3 },
  ];

  await safeInsert("tour_departures", departuresData);
  logOk(`Inserted ${departuresData.length} tour departures`);

  // --- TOUR SUPPLEMENTS ---
  log("  Seeding tour supplements...");
  const supplementsData: any[] = [];
  for (const tourId of tourIds) {
    supplementsData.push(
      { tour_id: tourId, titolo: "Supplemento camera singola", prezzo: "290", sort_order: 0 },
      { tour_id: tourId, titolo: "Assicurazione medico-bagaglio", prezzo: "45", sort_order: 1 },
      { tour_id: tourId, titolo: "Assicurazione annullamento viaggio", prezzo: "85", sort_order: 2 }
    );
  }
  // Tour-specific supplements
  supplementsData.push(
    { tour_id: tourIds[2], titolo: "Visto India (e-Tourist Visa)", prezzo: "25", sort_order: 3 },
    { tour_id: tourIds[4], titolo: "Ingresso Huayna Picchu", prezzo: "60", sort_order: 3 },
    { tour_id: tourIds[5], titolo: "Petra by Night", prezzo: "35", sort_order: 3 }
  );

  await safeInsert("tour_supplements", supplementsData);
  logOk(`Inserted ${supplementsData.length} tour supplements`);

  // --- TOUR INCLUSIONS ---
  log("  Seeding tour inclusions...");
  const inclusionsData: any[] = [];
  for (const tourId of tourIds) {
    inclusionsData.push(
      { tour_id: tourId, titolo: "Voli internazionali di linea in classe economica", is_included: true, sort_order: 0 },
      { tour_id: tourId, titolo: "Trasferimenti e spostamenti in pullman GT climatizzato", is_included: true, sort_order: 1 },
      { tour_id: tourId, titolo: "Pernottamento in hotel selezionati (cat. indicata)", is_included: true, sort_order: 2 },
      { tour_id: tourId, titolo: "Trattamento di pensione completa come da programma", is_included: true, sort_order: 3 },
      { tour_id: tourId, titolo: "Guida locale parlante italiano", is_included: true, sort_order: 4 },
      { tour_id: tourId, titolo: "Ingressi ai siti e monumenti previsti dal programma", is_included: true, sort_order: 5 },
      { tour_id: tourId, titolo: "Bevande ai pasti", is_included: false, sort_order: 6 },
      { tour_id: tourId, titolo: "Mance a guide, autisti e facchini", is_included: false, sort_order: 7 },
      { tour_id: tourId, titolo: "Spese personali e extra di carattere personale", is_included: false, sort_order: 8 },
      { tour_id: tourId, titolo: "Assicurazione medico-bagaglio e annullamento (facoltativa)", is_included: false, sort_order: 9 },
      { tour_id: tourId, titolo: "Tutto quanto non espressamente indicato alla voce 'La quota comprende'", is_included: false, sort_order: 10 }
    );
  }

  await safeInsert("tour_inclusions", inclusionsData);
  logOk(`Inserted ${inclusionsData.length} tour inclusions`);

  return tourIds;
}

// ============================================================
// SEED SHIPS
// ============================================================
async function seedShips(): Promise<string[]> {
  log("Seeding ships...");

  const shipsData = [
    {
      name: "MS Fidelio",
      slug: "ms-fidelio",
      description:
        "<p>La MS Fidelio e una nave fluviale di classe superiore, completamente rinnovata nel 2023. Con le sue 80 cabine eleganti distribuite su tre ponti, offre un'esperienza di crociera raffinata lungo il Danubio e i suoi affluenti.</p><p>La nave dispone di un ampio ristorante panoramico, sun deck con piscina, lounge bar, sala lettura e centro benessere con sauna finlandese. Le cabine del ponte superiore dispongono di balcone privato francese.</p>",
      cover_image_url: "/images/placeholder.jpg",
      cabine_disponibili: "80 cabine su 3 ponti",
      servizi_cabine:
        "Aria condizionata, TV satellitare, minibar, cassaforte, asciugacapelli, set cortesia",
      status: "published" as const,
    },
    {
      name: "MS Douro Cruiser",
      slug: "ms-douro-cruiser",
      description:
        "<p>La MS Douro Cruiser e stata progettata specificamente per la navigazione sul Douro portoghese, con un profilo basso che le permette di passare sotto i ponti storici della valle. 65 cabine eleganti con finestre panoramiche o balcone privato.</p><p>A bordo: ristorante con cucina portoghese e internazionale, bar con terrazza esterna, piscina sul sun deck, biblioteca e programma di intrattenimento con fado dal vivo.</p>",
      cover_image_url: "/images/placeholder.jpg",
      cabine_disponibili: "65 cabine su 3 ponti",
      servizi_cabine:
        "Aria condizionata, TV LCD, minibar, cassaforte, accappatoio, pantofole",
      status: "published" as const,
    },
    {
      name: "MS Arlene II",
      slug: "ms-arlene-ii",
      description:
        "<p>La MS Arlene II e una nave fluviale boutique di ultima generazione, varata nel 2024, che naviga il Reno tra Basilea e Amsterdam. Con sole 55 cabine suite, offre un servizio esclusivo con un rapporto passeggeri-equipaggio tra i migliori della categoria.</p><p>Design contemporaneo, spa completa, due ristoranti (uno gourmet), lounge panoramico a prua. Tutte le cabine dispongono di balcone francese o terrazzino privato.</p>",
      cover_image_url: "/images/placeholder.jpg",
      cabine_disponibili: "55 suite su 3 ponti",
      servizi_cabine:
        "Aria condizionata, TV 42 pollici, minibar premium, Nespresso, balcone, set cortesia Acqua di Parma",
      status: "published" as const,
    },
  ];

  const ships = await safeInsert("ships", shipsData);
  const shipIds = ships.map((s: any) => s.id);

  for (const ship of ships) {
    logOk(`Ship: ${(ship as any).name}`);
  }

  // --- SHIP SUITABLE FOR ---
  log("  Seeding ship suitable for...");
  const suitableData = [
    { ship_id: shipIds[0], testo: "Coppie e viaggi romantici", sort_order: 0 },
    { ship_id: shipIds[0], testo: "Gruppi organizzati", sort_order: 1 },
    { ship_id: shipIds[0], testo: "Viaggiatori over 50", sort_order: 2 },
    { ship_id: shipIds[1], testo: "Appassionati di enogastronomia", sort_order: 0 },
    { ship_id: shipIds[1], testo: "Coppie", sort_order: 1 },
    { ship_id: shipIds[1], testo: "Viaggiatori culturali", sort_order: 2 },
    { ship_id: shipIds[2], testo: "Viaggiatori esigenti", sort_order: 0 },
    { ship_id: shipIds[2], testo: "Coppie in cerca di lusso", sort_order: 1 },
    { ship_id: shipIds[2], testo: "Anniversari e occasioni speciali", sort_order: 2 },
  ];
  await safeInsert("ship_suitable_for", suitableData);
  logOk(`Inserted ${suitableData.length} suitable_for entries`);

  // --- SHIP SERVICES ---
  log("  Seeding ship services...");
  const servicesData = [
    { ship_id: shipIds[0], testo: "Ristorante panoramico con cucina internazionale", sort_order: 0 },
    { ship_id: shipIds[0], testo: "Lounge Bar con pianoforte", sort_order: 1 },
    { ship_id: shipIds[0], testo: "Sun Deck con piscina e lettini", sort_order: 2 },
    { ship_id: shipIds[0], testo: "Centro benessere con sauna", sort_order: 3 },
    { ship_id: shipIds[0], testo: "Sala conferenze e biblioteca", sort_order: 4 },
    { ship_id: shipIds[1], testo: "Ristorante con cucina portoghese e internazionale", sort_order: 0 },
    { ship_id: shipIds[1], testo: "Bar con terrazza esterna", sort_order: 1 },
    { ship_id: shipIds[1], testo: "Piscina sul Sun Deck", sort_order: 2 },
    { ship_id: shipIds[1], testo: "Biblioteca e sala giochi", sort_order: 3 },
    { ship_id: shipIds[1], testo: "Intrattenimento serale con fado dal vivo", sort_order: 4 },
    { ship_id: shipIds[2], testo: "Ristorante principale e ristorante gourmet", sort_order: 0 },
    { ship_id: shipIds[2], testo: "Spa completa con trattamenti", sort_order: 1 },
    { ship_id: shipIds[2], testo: "Lounge panoramico a prua", sort_order: 2 },
    { ship_id: shipIds[2], testo: "Fitness center e yoga deck", sort_order: 3 },
    { ship_id: shipIds[2], testo: "Servizio maggiordomo per suite premium", sort_order: 4 },
  ];
  await safeInsert("ship_services", servicesData);
  logOk(`Inserted ${servicesData.length} ship services`);

  return shipIds;
}

// ============================================================
// SEED CRUISES
// ============================================================
async function seedCruises(
  destIds: Record<string, string>,
  shipIds: string[]
): Promise<string[]> {
  log("Seeding cruises...");

  const cruisesData = [
    {
      title: "Sul Bel Danubio Blu",
      slug: "sul-bel-danubio-blu",
      content:
        "<p>Una crociera classica lungo il Danubio che tocca tre capitali europee: Vienna, Bratislava e Budapest. Sette notti di navigazione tra paesaggi incantevoli, villaggi pittoreschi e citta ricche di storia e cultura.</p><p>A bordo della MS Fidelio, godrete di un servizio raffinato, cucina internazionale e un ricco programma di escursioni con guida in italiano. Serate a tema con musica dal vivo e degustazioni di vini locali.</p>",
      cover_image_url: "/images/placeholder.jpg",
      ship_id: shipIds[0],
      destination_id: destIds["danubio"],
      tipo_crociera: "Crociera di Gruppo" as const,
      a_partire_da: "1.690",
      durata_notti: "7",
      numero_minimo_persone: 30,
      pensione: ["completa"],
      tipo_voli: "Voli non inclusi",
      etichetta_primo_deck: "Main Deck",
      etichetta_secondo_deck: "Middle Deck",
      etichetta_terzo_deck: "Upper Deck",
      status: "published" as const,
      meta_title: "Crociera Danubio - Sul Bel Danubio Blu | MishaTravel",
      meta_description:
        "Crociera sul Danubio 7 notti: Vienna, Bratislava, Budapest. MS Fidelio, pensione completa, escursioni con guida italiano.",
    },
    {
      title: "Splendore del Douro",
      slug: "splendore-del-douro",
      content:
        "<p>Navigazione lungo la valle del Douro, patrimonio UNESCO, tra vigneti terrazzati e quintas storiche. Sette notti da Porto a Vega de Terron e ritorno, con soste per degustazioni di vino Porto e visite a borghi medievali.</p><p>La MS Douro Cruiser offre un'esperienza autentica portoghese: cucina tipica, serate di fado, escursioni tra cantine e azulejos. Un viaggio lento e raffinato nel cuore del Portogallo.</p>",
      cover_image_url: "/images/placeholder.jpg",
      ship_id: shipIds[1],
      destination_id: destIds["duero"],
      tipo_crociera: "Crociera di Gruppo" as const,
      a_partire_da: "1.890",
      durata_notti: "7",
      numero_minimo_persone: 25,
      pensione: ["completa"],
      tipo_voli: "Voli non inclusi",
      etichetta_primo_deck: "Main Deck",
      etichetta_secondo_deck: "Middle Deck",
      etichetta_terzo_deck: "Upper Deck",
      status: "published" as const,
      meta_title: "Crociera Douro - Splendore del Douro | MishaTravel",
      meta_description:
        "Crociera Douro 7 notti: Porto, Valle del Douro UNESCO, Vega de Terron. Degustazioni Porto, fado, cucina portoghese.",
    },
    {
      title: "Delizie del Danubio",
      slug: "delizie-del-danubio",
      content:
        "<p>La versione estesa della nostra crociera piu amata: dieci notti sul Danubio da Passau a Budapest, con soste prolungate a Vienna e Bratislava e tappe esclusive come la Valle della Wachau e Durnstein.</p><p>Un'esperienza gastronomica arricchita da cene a tema nelle capitali, degustazioni di vini della Wachau, visita all'Abbazia di Melk e concerto di musica classica a Vienna. Tutto a bordo della raffinata MS Fidelio.</p>",
      cover_image_url: "/images/placeholder.jpg",
      ship_id: shipIds[0],
      destination_id: destIds["danubio"],
      tipo_crociera: "Crociera di Gruppo" as const,
      a_partire_da: "2.390",
      durata_notti: "10",
      numero_minimo_persone: 30,
      pensione: ["completa"],
      tipo_voli: "Voli non inclusi",
      etichetta_primo_deck: "Main Deck",
      etichetta_secondo_deck: "Middle Deck",
      etichetta_terzo_deck: "Upper Deck",
      status: "published" as const,
      meta_title: "Crociera Danubio 10 Notti - Delizie del Danubio | MishaTravel",
      meta_description:
        "Crociera Danubio estesa 10 notti: Passau, Wachau, Vienna, Bratislava, Budapest. MS Fidelio, pensione completa.",
    },
  ];

  const cruises = await safeInsert("cruises", cruisesData);
  const cruiseIds = cruises.map((cr: any) => cr.id);

  for (const cruise of cruises) {
    logOk(`Cruise: ${(cruise as any).title}`);
  }

  // --- CRUISE ITINERARY DAYS ---
  log("  Seeding cruise itinerary days...");
  const cruiseItinerary = [
    // Sul Bel Danubio Blu (cruise 0)
    { cruise_id: cruiseIds[0], numero_giorno: "1", localita: "Passau (Germania)", descrizione: "<p>Imbarco a Passau, la citta dei tre fiumi. Sistemazione in cabina. Cocktail di benvenuto del Comandante e cena di gala. Partenza serale verso l'Austria.</p>", sort_order: 0 },
    { cruise_id: cruiseIds[0], numero_giorno: "2", localita: "Linz (Austria)", descrizione: "<p>Mattina di navigazione nella Valle della Wachau. Arrivo a Linz nel primo pomeriggio. Escursione facoltativa a Salisburgo oppure visita del centro storico di Linz. Navigazione notturna.</p>", sort_order: 1 },
    { cruise_id: cruiseIds[0], numero_giorno: "3", localita: "Melk - Wachau (Austria)", descrizione: "<p>Sosta a Melk: visita all'imponente Abbazia benedettina. Navigazione pomeridiana nella Valle della Wachau tra vigneti e castelli. Sosta a Durnstein, borgo medievale.</p>", sort_order: 2 },
    { cruise_id: cruiseIds[0], numero_giorno: "4", localita: "Vienna (Austria)", descrizione: "<p>Giornata intera a Vienna. Tour guidato: Opera, Ringstrasse, Palazzo di Schonbrunn. Pomeriggio libero per musei o shopping. Serata: concerto di musica classica (opzionale).</p>", sort_order: 3 },
    { cruise_id: cruiseIds[0], numero_giorno: "5", localita: "Bratislava (Slovacchia)", descrizione: "<p>Arrivo a Bratislava in mattinata. Tour a piedi del centro storico: Castello, Cattedrale di San Martino, Porta di Michele. Pomeriggio libero. Navigazione serale verso Budapest.</p>", sort_order: 4 },
    { cruise_id: cruiseIds[0], numero_giorno: "6", localita: "Budapest (Ungheria)", descrizione: "<p>Giornata dedicata a Budapest: Parlamento, Bastione dei Pescatori, Terme Szechenyi. Navigazione panoramica serale sotto i ponti illuminati di Budapest. Cena di gala.</p>", sort_order: 5 },
    { cruise_id: cruiseIds[0], numero_giorno: "7", localita: "Budapest", descrizione: "<p>Sbarco dopo la colazione. Possibilita di estensione soggiorno a Budapest. Trasferimento in aeroporto o stazione.</p>", sort_order: 6 },

    // Splendore del Douro (cruise 1)
    { cruise_id: cruiseIds[1], numero_giorno: "1", localita: "Porto (Portogallo)", descrizione: "<p>Imbarco a Porto nel pomeriggio. Tempo per esplorare la Ribeira, patrimonio UNESCO. Cena di benvenuto a bordo con degustazione di vino Porto.</p>", sort_order: 0 },
    { cruise_id: cruiseIds[1], numero_giorno: "2", localita: "Regua", descrizione: "<p>Navigazione mattutina nella bassa valle del Douro. Arrivo a Regua. Visita al Museo del Douro e degustazione in una quinta storica. Serata con fado dal vivo.</p>", sort_order: 1 },
    { cruise_id: cruiseIds[1], numero_giorno: "3", localita: "Pinhao - Quinta do Seixo", descrizione: "<p>Navigazione fino a Pinhao tra i vigneti terrazzati. Visita alla stazione ferroviaria decorata con azulejos. Escursione alla Quinta do Seixo con degustazione premium.</p>", sort_order: 2 },
    { cruise_id: cruiseIds[1], numero_giorno: "4", localita: "Vega de Terron (Confine Spagna)", descrizione: "<p>Navigazione nella alta valle del Douro. Arrivo a Vega de Terron al confine spagnolo. Escursione facoltativa a Salamanca (Spagna). Inversione di rotta.</p>", sort_order: 3 },
    { cruise_id: cruiseIds[1], numero_giorno: "5", localita: "Ferradosa - Pocinho", descrizione: "<p>Giornata di navigazione tra i paesaggi piu belli della valle. Lezione di cucina portoghese a bordo. Sosta a Pocinho per passeggiata tra i vigneti.</p>", sort_order: 4 },
    { cruise_id: cruiseIds[1], numero_giorno: "6", localita: "Lamego - Entre-os-Rios", descrizione: "<p>Escursione a Lamego: Santuario di Nossa Senhora dos Remedios con scalinata barocca. Pomeriggio di navigazione. Cena tipica portoghese.</p>", sort_order: 5 },
    { cruise_id: cruiseIds[1], numero_giorno: "7", localita: "Porto", descrizione: "<p>Arrivo a Porto. Tour guidato: Torre dei Clerigos, Libreria Lello, cantine di Vila Nova de Gaia. Sbarco nel pomeriggio.</p>", sort_order: 6 },

    // Delizie del Danubio (cruise 2)
    { cruise_id: cruiseIds[2], numero_giorno: "1", localita: "Passau (Germania)", descrizione: "<p>Imbarco a Passau. Visita della citta vecchia e della Cattedrale di Santo Stefano con il piu grande organo a canne d'Europa. Cocktail di benvenuto e partenza serale.</p>", sort_order: 0 },
    { cruise_id: cruiseIds[2], numero_giorno: "2", localita: "Linz (Austria)", descrizione: "<p>Arrivo a Linz. Escursione al campo di concentramento di Mauthausen o visita al centro di Linz con il museo Ars Electronica. Navigazione pomeridiana.</p>", sort_order: 1 },
    { cruise_id: cruiseIds[2], numero_giorno: "3", localita: "Melk - Wachau", descrizione: "<p>Abbazia di Melk e navigazione nella Wachau. Sosta a Durnstein per visitare le rovine del castello dove fu imprigionato Riccardo Cuor di Leone. Degustazione vini Gruner Veltliner.</p>", sort_order: 2 },
    { cruise_id: cruiseIds[2], numero_giorno: "4-5", localita: "Vienna (Austria)", descrizione: "<p>Due giornate a Vienna. Primo giorno: tour classico con Schonbrunn, Opera, Hofburg. Secondo giorno: quartiere dei musei, Naschmarkt, serata al Prater. Concerto di valzer viennesi.</p>", sort_order: 3 },
    { cruise_id: cruiseIds[2], numero_giorno: "6", localita: "Bratislava (Slovacchia)", descrizione: "<p>Giornata a Bratislava: castello, centro storico, Slavin memorial. Degustazione di vini slovacchi e cucina locale. Navigazione notturna sull'ansa del Danubio.</p>", sort_order: 4 },
    { cruise_id: cruiseIds[2], numero_giorno: "7", localita: "Esztergom (Ungheria)", descrizione: "<p>Sosta a Esztergom, antica capitale ungherese: Basilica monumentale. Navigazione attraverso l'ansa del Danubio fino a Visegrad e Szentendre, villaggio degli artisti.</p>", sort_order: 5 },
    { cruise_id: cruiseIds[2], numero_giorno: "8-9", localita: "Budapest (Ungheria)", descrizione: "<p>Due giornate a Budapest. Tour completo: Buda (Castello, Bastione dei Pescatori, Matthias Church) e Pest (Parlamento, Vaci Utca, Terme). Crociera notturna illuminata. Cena di gala.</p>", sort_order: 6 },
    { cruise_id: cruiseIds[2], numero_giorno: "10", localita: "Budapest", descrizione: "<p>Sbarco dopo la colazione. Possibilita di estensione soggiorno. Trasferimento in aeroporto.</p>", sort_order: 7 },
  ];
  await safeInsert("cruise_itinerary_days", cruiseItinerary);
  logOk(`Inserted ${cruiseItinerary.length} cruise itinerary days`);

  // --- CRUISE DEPARTURES ---
  log("  Seeding cruise departures...");
  const cruiseDepartures = [
    // Sul Bel Danubio Blu
    { cruise_id: cruiseIds[0], from_city: "Passau", data_partenza: "2026-04-18", prezzo_main_deck: 1690, prezzo_middle_deck: "1990", prezzo_superior_deck: "2390", sort_order: 0 },
    { cruise_id: cruiseIds[0], from_city: "Passau", data_partenza: "2026-05-23", prezzo_main_deck: 1790, prezzo_middle_deck: "2090", prezzo_superior_deck: "2490", sort_order: 1 },
    { cruise_id: cruiseIds[0], from_city: "Passau", data_partenza: "2026-06-20", prezzo_main_deck: 1890, prezzo_middle_deck: "2190", prezzo_superior_deck: "2590", sort_order: 2 },
    { cruise_id: cruiseIds[0], from_city: "Passau", data_partenza: "2026-09-12", prezzo_main_deck: 1790, prezzo_middle_deck: "2090", prezzo_superior_deck: "2490", sort_order: 3 },

    // Splendore del Douro
    { cruise_id: cruiseIds[1], from_city: "Porto", data_partenza: "2026-04-04", prezzo_main_deck: 1890, prezzo_middle_deck: "2190", prezzo_superior_deck: "2590", sort_order: 0 },
    { cruise_id: cruiseIds[1], from_city: "Porto", data_partenza: "2026-05-16", prezzo_main_deck: 1990, prezzo_middle_deck: "2290", prezzo_superior_deck: "2690", sort_order: 1 },
    { cruise_id: cruiseIds[1], from_city: "Porto", data_partenza: "2026-06-27", prezzo_main_deck: 2090, prezzo_middle_deck: "2390", prezzo_superior_deck: "2790", sort_order: 2 },
    { cruise_id: cruiseIds[1], from_city: "Porto", data_partenza: "2026-09-26", prezzo_main_deck: 1990, prezzo_middle_deck: "2290", prezzo_superior_deck: "2690", sort_order: 3 },

    // Delizie del Danubio
    { cruise_id: cruiseIds[2], from_city: "Passau", data_partenza: "2026-05-02", prezzo_main_deck: 2390, prezzo_middle_deck: "2790", prezzo_superior_deck: "3290", sort_order: 0 },
    { cruise_id: cruiseIds[2], from_city: "Passau", data_partenza: "2026-06-06", prezzo_main_deck: 2490, prezzo_middle_deck: "2890", prezzo_superior_deck: "3390", sort_order: 1 },
    { cruise_id: cruiseIds[2], from_city: "Passau", data_partenza: "2026-09-05", prezzo_main_deck: 2390, prezzo_middle_deck: "2790", prezzo_superior_deck: "3290", sort_order: 2 },
  ];
  await safeInsert("cruise_departures", cruiseDepartures);
  logOk(`Inserted ${cruiseDepartures.length} cruise departures`);

  // --- CRUISE INCLUSIONS ---
  log("  Seeding cruise inclusions...");
  const cruiseInclusions: any[] = [];
  for (const cruiseId of cruiseIds) {
    cruiseInclusions.push(
      { cruise_id: cruiseId, titolo: "Sistemazione in cabina della categoria prescelta", is_included: true, sort_order: 0 },
      { cruise_id: cruiseId, titolo: "Pensione completa dalla cena del primo giorno alla colazione dell'ultimo", is_included: true, sort_order: 1 },
      { cruise_id: cruiseId, titolo: "Acqua e caffe ai pasti", is_included: true, sort_order: 2 },
      { cruise_id: cruiseId, titolo: "Escursioni guidate in italiano come da programma", is_included: true, sort_order: 3 },
      { cruise_id: cruiseId, titolo: "Intrattenimento serale a bordo", is_included: true, sort_order: 4 },
      { cruise_id: cruiseId, titolo: "Assistenza MishaTravel durante tutta la crociera", is_included: true, sort_order: 5 },
      { cruise_id: cruiseId, titolo: "Voli (possibilita di preventivo su richiesta)", is_included: false, sort_order: 6 },
      { cruise_id: cruiseId, titolo: "Trasferimenti aeroporto/porto", is_included: false, sort_order: 7 },
      { cruise_id: cruiseId, titolo: "Bevande alcoliche ai pasti", is_included: false, sort_order: 8 },
      { cruise_id: cruiseId, titolo: "Mance all'equipaggio (consigliato 7-10 EUR/giorno)", is_included: false, sort_order: 9 },
      { cruise_id: cruiseId, titolo: "Escursioni facoltative non indicate nel programma", is_included: false, sort_order: 10 },
      { cruise_id: cruiseId, titolo: "Assicurazione viaggio", is_included: false, sort_order: 11 },
    );
  }
  await safeInsert("cruise_inclusions", cruiseInclusions);
  logOk(`Inserted ${cruiseInclusions.length} cruise inclusions`);

  // --- CRUISE CABINS ---
  log("  Seeding cruise cabins...");
  const cruiseCabins = [
    // Sul Bel Danubio Blu
    { cruise_id: cruiseIds[0], localita: "Main Deck", tipologia_camera: "Cabina Standard", ponte: "Main Deck", sort_order: 0 },
    { cruise_id: cruiseIds[0], localita: "Middle Deck", tipologia_camera: "Cabina Superior", ponte: "Middle Deck", sort_order: 1 },
    { cruise_id: cruiseIds[0], localita: "Upper Deck", tipologia_camera: "Cabina Deluxe con balcone", ponte: "Upper Deck", sort_order: 2 },
    // Splendore del Douro
    { cruise_id: cruiseIds[1], localita: "Main Deck", tipologia_camera: "Cabina Classic", ponte: "Main Deck", sort_order: 0 },
    { cruise_id: cruiseIds[1], localita: "Middle Deck", tipologia_camera: "Cabina Superior", ponte: "Middle Deck", sort_order: 1 },
    { cruise_id: cruiseIds[1], localita: "Upper Deck", tipologia_camera: "Junior Suite con balcone", ponte: "Upper Deck", sort_order: 2 },
    // Delizie del Danubio
    { cruise_id: cruiseIds[2], localita: "Main Deck", tipologia_camera: "Cabina Standard", ponte: "Main Deck", sort_order: 0 },
    { cruise_id: cruiseIds[2], localita: "Middle Deck", tipologia_camera: "Cabina Superior", ponte: "Middle Deck", sort_order: 1 },
    { cruise_id: cruiseIds[2], localita: "Upper Deck", tipologia_camera: "Cabina Deluxe con balcone", ponte: "Upper Deck", sort_order: 2 },
  ];
  await safeInsert("cruise_cabins", cruiseCabins);
  logOk(`Inserted ${cruiseCabins.length} cruise cabins`);

  // --- CRUISE SUPPLEMENTS ---
  log("  Seeding cruise supplements...");
  const cruiseSupplements: any[] = [];
  for (const cruiseId of cruiseIds) {
    cruiseSupplements.push(
      { cruise_id: cruiseId, titolo: "Supplemento camera singola", prezzo: "490", sort_order: 0 },
      { cruise_id: cruiseId, titolo: "Assicurazione medico-bagaglio", prezzo: "55", sort_order: 1 },
      { cruise_id: cruiseId, titolo: "Assicurazione annullamento viaggio", prezzo: "95", sort_order: 2 },
      { cruise_id: cruiseId, titolo: "Pacchetto bevande All-Inclusive", prezzo: "180", sort_order: 3 },
    );
  }
  await safeInsert("cruise_supplements", cruiseSupplements);
  logOk(`Inserted ${cruiseSupplements.length} cruise supplements`);

  return cruiseIds;
}

// ============================================================
// SEED BLOG
// ============================================================
async function seedBlog(): Promise<void> {
  log("Seeding blog categories and posts...");

  // Categories
  const categories = await safeInsert("blog_categories", [
    { name: "Consigli di Viaggio", slug: "consigli-di-viaggio", sort_order: 0 },
    { name: "Destinazioni", slug: "destinazioni", sort_order: 1 },
  ]);
  const catIds = categories.map((c: any) => c.id);
  logOk("Created 2 blog categories");

  // Posts
  const postsData = [
    {
      title: "10 Cose da Sapere Prima di Visitare il Giappone",
      slug: "10-cose-da-sapere-giappone",
      category_id: catIds[0],
      cover_image_url: "/images/placeholder.jpg",
      excerpt:
        "Dalla pocket WiFi alle regole del treno, tutto quello che serve sapere per un viaggio perfetto in Giappone.",
      content: `<h2>1. Il Japan Rail Pass e il vostro migliore amico</h2>
<p>Se avete in programma di spostarvi tra le citta, il Japan Rail Pass vi fara risparmiare centinaia di euro. Va acquistato prima della partenza e si attiva alla prima corsa. Permette di viaggiare su tutti i treni JR, incluso lo Shinkansen (treno proiettile).</p>

<h2>2. Il contante e ancora re</h2>
<p>Nonostante sia un paese tecnologicamente avanzatissimo, in Giappone molti ristoranti, negozi tradizionali e ryokan accettano solo contanti. Portate sempre yen con voi. I bancomat delle poste (Japan Post) e dei convenience store Seven-Eleven accettano carte straniere.</p>

<h2>3. Toglietevi le scarpe (ovunque)</h2>
<p>Nei templi, nei ryokan, in molti ristoranti e persino in alcune cliniche mediche dovrete togliervi le scarpe. Portate calzini puliti e senza buchi! Spesso troverete ciabattine fornite all'ingresso.</p>

<h2>4. La puntualita non e opzionale</h2>
<p>I treni giapponesi partono al secondo preciso dell'orario previsto. Se il tabellone dice 10:32, il treno parte alle 10:32:00. Non un secondo dopo. Pianificate di arrivare almeno 5 minuti prima.</p>`,
      status: "published" as const,
      published_at: "2026-01-15T10:00:00Z",
      meta_title: "10 Cose da Sapere Prima di Visitare il Giappone | MishaTravel Blog",
      meta_description:
        "Guida pratica per il primo viaggio in Giappone: Japan Rail Pass, contanti, scarpe, puntualita e altre regole da conoscere.",
    },
    {
      title: "Guida alla Turchia: Cosa Vedere Oltre Istanbul",
      slug: "guida-turchia-cosa-vedere",
      category_id: catIds[1],
      cover_image_url: "/images/placeholder.jpg",
      excerpt:
        "Cappadocia, Pamukkale, Efeso: la Turchia offre molto piu della sola Istanbul. Scoprite le meraviglie nascoste.",
      content: `<h2>La Cappadocia: un paesaggio lunare</h2>
<p>A circa un'ora di volo da Istanbul, la Cappadocia sembra un altro pianeta. Le formazioni rocciose chiamate "camini delle fate", le citta sotterranee e le chiese rupestri dipinte creano un paesaggio unico al mondo. Il modo migliore per ammirarlo? Un volo in mongolfiera all'alba, un'esperienza che da sola vale il viaggio in Turchia.</p>

<h2>Pamukkale: il castello di cotone</h2>
<p>Le terrazze bianche di travertino di Pamukkale, con le loro piscine naturali di acqua termale, sono uno spettacolo della natura. Accanto si trovano le rovine dell'antica citta romana di Hierapolis, con un teatro magnificamente conservato e una piscina sacra dove nuotare tra colonne romane sommerse.</p>

<h2>Efeso: la Roma d'Oriente</h2>
<p>Una delle citta antiche meglio conservate del Mediterraneo. Passeggiare lungo la Via dei Cureti, ammirare la Biblioteca di Celso e il Grande Teatro (che ospitava 25.000 spettatori) e come fare un viaggio nel tempo nell'Impero Romano d'Oriente.</p>

<h2>La Costa Licia: turquoise coast</h2>
<p>Tra Antalya e Fethiye si estende la Costa Licia, un paradiso di baie nascoste, acque cristalline e tombe rupestri scavate nelle pareti rocciose. La spiaggia di Oludeniz e regolarmente votata tra le piu belle del mondo. Da qui parte anche il Cammino Licio, uno dei trekking costieri piu belli del pianeta.</p>`,
      status: "published" as const,
      published_at: "2026-01-28T09:00:00Z",
      meta_title: "Guida alla Turchia: Cosa Vedere Oltre Istanbul | MishaTravel Blog",
      meta_description:
        "Scopri la Turchia oltre Istanbul: Cappadocia, Pamukkale, Efeso, Costa Licia. Guida completa alle destinazioni imperdibili.",
    },
    {
      title: "Crociera Fluviale: Perche Sceglierla per la Prima Volta",
      slug: "crociera-fluviale-perche-sceglierla",
      category_id: catIds[0],
      cover_image_url: "/images/placeholder.jpg",
      excerpt:
        "Nessun mal di mare, navi intime, paesaggi mozzafiato: ecco perche la crociera fluviale e il modo migliore per scoprire l'Europa.",
      content: `<h2>Nessun mal di mare, garantito</h2>
<p>La differenza fondamentale con le crociere oceaniche? L'acqua e sempre calma. I fiumi non hanno onde, correnti forti o tempeste. La navigazione e talmente dolce che spesso non vi accorgerete nemmeno che la nave si sta muovendo. Perfetto per chi soffre il mal di mare.</p>

<h2>Navi intime, servizio personalizzato</h2>
<p>Una nave fluviale ospita mediamente 100-160 passeggeri, contro i 3.000-6.000 delle grandi navi da crociera. Questo significa un'atmosfera piu raccolta, un servizio piu attento e la possibilita di conoscere davvero gli altri viaggiatori. Niente code, niente folla.</p>

<h2>Ogni giorno una citta diversa, senza fare valigia</h2>
<p>Il grande vantaggio della crociera fluviale e che la nave attracca nel cuore delle citta. A Vienna scendete a due passi dall'Opera, a Budapest sotto il Parlamento, a Porto accanto alla Ribeira. Ogni mattina una destinazione nuova, senza dover cambiare hotel o trascinare bagagli.</p>

<h2>Il paesaggio e lo spettacolo</h2>
<p>La navigazione stessa diventa parte del viaggio. I vigneti della Wachau, i castelli del Reno, i terrazzamenti del Douro: dalla vostra cabina o dal sun deck godrete di panorami che nessun pullman puo offrire. E la luce che cambia sul fiume al tramonto e pura magia.</p>`,
      status: "published" as const,
      published_at: "2026-02-05T11:00:00Z",
      meta_title: "Crociera Fluviale: Perche Sceglierla | MishaTravel Blog",
      meta_description:
        "Vantaggi della crociera fluviale: niente mal di mare, navi intime, paesaggi mozzafiato. Guida per la prima volta.",
    },
    {
      title: "Petra: Come Organizzare la Visita Perfetta",
      slug: "petra-come-organizzare-visita",
      category_id: catIds[1],
      cover_image_url: "/images/placeholder.jpg",
      excerpt:
        "Orari migliori, percorsi consigliati, cosa indossare: la guida definitiva per visitare la citta rosa dei Nabatei.",
      content: `<h2>Quando andare: la stagione giusta</h2>
<p>I mesi migliori per visitare Petra sono marzo-maggio e settembre-novembre. Le temperature sono piacevoli (20-28 gradi) e la luce e perfetta per le fotografie. Evitate luglio-agosto: il caldo supera i 40 gradi nel canyon e la visita diventa estenuante.</p>

<h2>Arrivate presto, prestissimo</h2>
<p>Il parco apre alle 6:00 del mattino. Essere tra i primi ad entrare nel Siq (il canyon che conduce al Tesoro) e un'esperienza magica: pochi turisti, luce dorata che filtra tra le pareti alte 80 metri, silenzio rotto solo dai vostri passi. Alle 9:00 arrivano i gruppi organizzati e l'atmosfera cambia completamente.</p>

<h2>Due giorni sono meglio di uno</h2>
<p>Petra e immensa: il sito archeologico copre 264 km quadrati. In un giorno potete vedere il Siq, il Tesoro, la Strada delle Facciate e le Tombe Reali. Ma per il Monastero (Ad-Deir), che richiede 800 gradini, e per i sentieri panoramici come l'High Place of Sacrifice, serve una seconda giornata.</p>

<h2>Cosa portare (e cosa no)</h2>
<p>Essenziale: scarpe da trekking comode, cappello, crema solare, almeno 2 litri d'acqua a persona, snack energetici. Utile: bastoncini da trekking per il Monastero. Da evitare: sandali (i sassi sono taglienti), trolley (terreno accidentato), vestiti scuri (assorbono il calore).</p>`,
      status: "published" as const,
      published_at: "2026-02-12T08:30:00Z",
      meta_title: "Petra: Come Organizzare la Visita Perfetta | MishaTravel Blog",
      meta_description:
        "Guida completa per visitare Petra: quando andare, orari migliori, cosa portare, percorsi consigliati nella citta nabatea.",
    },
    {
      title: "India: 5 Piatti che Dovete Assolutamente Provare",
      slug: "india-5-piatti-da-provare",
      category_id: catIds[0],
      cover_image_url: "/images/placeholder.jpg",
      excerpt:
        "Dalla butter chicken al masala dosa, i piatti imperdibili della cucina indiana durante il vostro viaggio.",
      content: `<h2>1. Butter Chicken (Murgh Makhani)</h2>
<p>Il piatto indiano piu famoso al mondo, nato a Delhi negli anni '50. Pezzi di pollo tandoori avvolti in una salsa cremosa di pomodoro, burro e spezie. E' delicato, profumato e perfetto per chi si avvicina alla cucina indiana per la prima volta. Accompagnatelo con naan caldo appena sfornato dal tandoor.</p>

<h2>2. Biryani di Hyderabad</h2>
<p>Il re dei piatti unici indiani. Riso basmati profumato allo zafferano, stratificato con carne (agnello, pollo o montone) marinata in yogurt e spezie, cotto lentamente in pentola sigillata. Ogni citta dell'India ha la sua versione, ma quello di Hyderabad resta il piu celebrato.</p>

<h2>3. Masala Dosa</h2>
<p>L'emblema della cucina dell'India del Sud. Una crepe croccantissima di riso e lenticchie fermentate, farcita con un ripieno speziato di patate, cipolle e senape. Si accompagna con sambar (zuppa di lenticchie) e coconut chutney. Perfetto per colazione o pranzo.</p>

<h2>4. Thali Rajasthano</h2>
<p>Non un piatto ma un'esperienza: un grande vassoio rotondo con decine di ciotoline contenenti diverse preparazioni - dal, sabzi (verdure), raita (yogurt), chapati, riso, pickle e dolci. Ogni ristorante ha il suo thali e spesso e refill illimitato.</p>

<h2>5. Lassi alla Rosa di Jaipur</h2>
<p>La bevanda iconica del Rajasthan: yogurt fresco frullato con acqua di rosa, zucchero e petali di rosa. Rinfrescante, profumato e perfetto dopo un curry piccante. Trovatelo nei banchi della citta vecchia di Jaipur, servito in ciotole di terracotta usa e getta.</p>`,
      status: "published" as const,
      published_at: "2026-02-18T14:00:00Z",
      meta_title: "India: 5 Piatti da Provare in Viaggio | MishaTravel Blog",
      meta_description:
        "I piatti imperdibili della cucina indiana: butter chicken, biryani, masala dosa, thali rajasthano e lassi alla rosa.",
    },
  ];

  await safeInsert("blog_posts", postsData);
  logOk(`Inserted ${postsData.length} blog posts`);
}

// ============================================================
// SEED CATALOGS
// ============================================================
async function seedCatalogs(): Promise<void> {
  log("Seeding catalogs...");

  await safeInsert("catalogs", [
    {
      title: "Catalogo Tour Culturali 2026",
      year: 2026,
      cover_image_url: "/images/placeholder.jpg",
      pdf_url: null,
      is_published: true,
      sort_order: 0,
    },
    {
      title: "Catalogo Crociere Fluviali 2026",
      year: 2026,
      cover_image_url: "/images/placeholder.jpg",
      pdf_url: null,
      is_published: true,
      sort_order: 1,
    },
  ]);
  logOk("Inserted 2 catalogs");
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("");
  console.log(
    `${c.bold}${c.cyan}================================================${c.reset}`
  );
  console.log(
    `${c.bold}${c.cyan}  MishaTravel - Seed Demo Data${c.reset}`
  );
  console.log(
    `${c.bold}${c.cyan}================================================${c.reset}`
  );
  console.log("");

  log(`Supabase URL: ${SUPABASE_URL}`);
  log(`Force mode: ${FORCE ? "YES" : "NO"}`);
  console.log("");

  // Check if data already exists
  const exists = await checkExistingData();

  if (exists && !FORCE) {
    logWarn(
      "Demo data already exists! Use --force to delete and re-insert."
    );
    console.log("");
    console.log(
      `${c.dim}  Usage: npx tsx scripts/seed-demo.ts --force${c.reset}`
    );
    console.log("");
    return;
  }

  if (exists && FORCE) {
    await deleteAllData();
    console.log("");
  }

  try {
    // 1. Create users
    const { adminId, agencyUserId } = await createDemoUsers();
    console.log("");

    // 2. Create agency record
    const agencyId = await createAgencyRecord(agencyUserId);
    console.log("");

    // 3. Seed destinations
    const destIds = await seedDestinations();
    console.log("");

    // 4. Seed tours
    const tourIds = await seedTours(destIds);
    console.log("");

    // 5. Seed ships
    const shipIds = await seedShips();
    console.log("");

    // 6. Seed cruises
    const cruiseIds = await seedCruises(destIds, shipIds);
    console.log("");

    // 7. Seed blog
    await seedBlog();
    console.log("");

    // 8. Seed catalogs
    await seedCatalogs();
    console.log("");

    // Summary
    console.log(
      `${c.bold}${c.green}================================================${c.reset}`
    );
    console.log(
      `${c.bold}${c.green}  SEED COMPLETATO CON SUCCESSO!${c.reset}`
    );
    console.log(
      `${c.bold}${c.green}================================================${c.reset}`
    );
    console.log("");
    console.log(`${c.bold}  Riepilogo:${c.reset}`);
    console.log(`    - 2 utenti demo (super_admin + agency)`);
    console.log(`    - 1 agenzia demo (attiva)`);
    console.log(`    - ${Object.keys(destIds).length} destinazioni`);
    console.log(`    - ${tourIds.length} tour con itinerari, partenze, supplementi, inclusioni`);
    console.log(`    - ${shipIds.length} navi con servizi e caratteristiche`);
    console.log(`    - ${cruiseIds.length} crociere con itinerari, partenze, cabine, inclusioni`);
    console.log(`    - 2 categorie blog + 5 articoli`);
    console.log(`    - 2 cataloghi`);
    console.log("");
    console.log(`${c.bold}  Credenziali Demo:${c.reset}`);
    console.log(
      `    ${c.yellow}Super Admin:${c.reset}  ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`
    );
    console.log(
      `    ${c.yellow}Agenzia:${c.reset}      ${DEMO_AGENCY.email} / ${DEMO_AGENCY.password}`
    );
    console.log("");
  } catch (error) {
    logErr("Seed failed with error:");
    console.error(error);
    process.exit(1);
  }
}

main();
