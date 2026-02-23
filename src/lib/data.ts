// ============================================================
// MishaTravel Mock Data
// ============================================================

// --------------------------------------------------
// Types
// --------------------------------------------------

export type MacroArea =
  | "Europa"
  | "America Latina"
  | "Asia/Russia"
  | "Africa"
  | "Percorsi Fluviali";

export interface Destination {
  slug: string;
  name: string;
  macroArea: MacroArea;
  image: string;
  description: string;
}

export interface TourDeparture {
  date: string;
  price: number;
  availability: "disponibile" | "ultime disponibilita" | "sold out";
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Tour {
  slug: string;
  title: string;
  destination: string;
  destinationSlug: string;
  duration: string;
  priceFrom: number;
  image: string;
  description: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  departures: TourDeparture[];
}

export interface CruiseDeparture {
  date: string;
  price: number;
  availability: "disponibile" | "ultime disponibilita" | "sold out";
}

export interface DeckPlan {
  name: string;
  description: string;
  image: string;
}

export interface Cruise {
  slug: string;
  title: string;
  ship: string;
  river: string;
  duration: string;
  priceFrom: number;
  image: string;
  description: string;
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  deckPlan: DeckPlan[];
  departures: CruiseDeparture[];
}

export interface ShipDeck {
  name: string;
  cabins: number;
  description: string;
}

export interface Ship {
  slug: string;
  name: string;
  image: string;
  capacity: number;
  year: number;
  description: string;
  decks: ShipDeck[];
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  date: string;
  content: string;
}

export interface Catalogo {
  slug: string;
  title: string;
  image: string;
  pdfUrl: string;
  description: string;
}

export interface NavSubmenu {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  submenu?: NavSubmenu[] | Record<string, NavSubmenu[]>;
}

export interface TopBarLink {
  label: string;
  href: string;
  icon?: string;
}

export interface FooterColumn {
  title: string;
  lines: string[];
}

export interface FooterLinkSection {
  title: string;
  links: { label: string; href: string }[];
}

// --------------------------------------------------
// Destinations
// --------------------------------------------------

export const destinations: Destination[] = [
  // Europa
  {
    slug: "spagna",
    name: "Spagna",
    macroArea: "Europa",
    image: "/images/destinazioni/spagna.jpg",
    description:
      "Un viaggio attraverso la penisola iberica tra architettura moresca, flamenco e una gastronomia inimitabile.",
  },
  {
    slug: "portogallo",
    name: "Portogallo",
    macroArea: "Europa",
    image: "/images/destinazioni/portogallo.jpg",
    description:
      "Dalle stradine di Lisbona alle cantine del Douro, un paese ricco di storia e tradizione.",
  },
  {
    slug: "polonia",
    name: "Polonia",
    macroArea: "Europa",
    image: "/images/destinazioni/polonia.jpg",
    description:
      "Cracovia, Varsavia e le miniere di sale: scopri il fascino dell'Europa centro-orientale.",
  },
  {
    slug: "turchia",
    name: "Turchia",
    macroArea: "Europa",
    image: "/images/destinazioni/turchia.jpg",
    description:
      "Un crocevia di civiltà tra Cappadocia, Istanbul e le coste dell'Egeo, dove Oriente e Occidente si incontrano.",
  },

  // America Latina
  {
    slug: "bolivia",
    name: "Bolivia",
    macroArea: "America Latina",
    image: "/images/destinazioni/bolivia.jpg",
    description:
      "Dal Salar de Uyuni alle vette andine, la Bolivia offre paesaggi surreali e culture ancestrali.",
  },
  {
    slug: "uruguay",
    name: "Uruguay",
    macroArea: "America Latina",
    image: "/images/destinazioni/uruguay.jpg",
    description:
      "Colonia del Sacramento, Montevideo e le spiagge atlantiche: un gioiello nascosto del Sudamerica.",
  },
  {
    slug: "peru",
    name: "Peru",
    macroArea: "America Latina",
    image: "/images/destinazioni/peru.jpg",
    description:
      "Machu Picchu, la Valle Sacra e il Lago Titicaca: sulle tracce dell'Impero Inca.",
  },
  {
    slug: "brasile",
    name: "Brasile",
    macroArea: "America Latina",
    image: "/images/destinazioni/brasile.jpg",
    description:
      "Rio de Janeiro, l'Amazzonia e Salvador de Bahia: energia, natura e cultura tropicale.",
  },
  {
    slug: "cile",
    name: "Cile",
    macroArea: "America Latina",
    image: "/images/destinazioni/cile.jpg",
    description:
      "Dal deserto di Atacama alla Patagonia, un paese lungo e stretto pieno di meraviglie naturali.",
  },
  {
    slug: "argentina",
    name: "Argentina",
    macroArea: "America Latina",
    image: "/images/destinazioni/argentina.jpg",
    description:
      "Buenos Aires, i ghiacciai della Patagonia e le cascate dell'Iguazù: un viaggio indimenticabile.",
  },

  // Asia/Russia
  {
    slug: "india",
    name: "India",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/india.jpg",
    description:
      "Il Triangolo d'Oro, il Rajasthan e i templi millenari: un viaggio che cambia la vita.",
  },
  {
    slug: "nepal",
    name: "Nepal",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/nepal.jpg",
    description:
      "Kathmandu, l'Himalaya e i monasteri buddhisti: spiritualità e avventura nel tetto del mondo.",
  },
  {
    slug: "georgia",
    name: "Georgia",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/georgia.jpg",
    description:
      "Tbilisi, le chiese rupestri e il Caucaso: un tesoro nascosto tra Europa e Asia.",
  },
  {
    slug: "kirghizistan",
    name: "Kirghizistan",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/kirghizistan.jpg",
    description:
      "Laghi alpini, yurte e steppe infinite: l'avventura nomade nel cuore dell'Asia Centrale.",
  },
  {
    slug: "mongolia",
    name: "Mongolia",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/mongolia.jpg",
    description:
      "Il deserto del Gobi, le steppe infinite e la cultura nomade: un viaggio nel tempo.",
  },
  {
    slug: "filippine",
    name: "Filippine",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/filippine.jpg",
    description:
      "Spiagge paradisiache, risaie a terrazza e una natura marina straordinaria.",
  },
  {
    slug: "giappone",
    name: "Giappone",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/giappone.jpg",
    description:
      "Tokyo, Kyoto e il Monte Fuji: tradizione e modernità nel Paese del Sol Levante.",
  },
  {
    slug: "armenia",
    name: "Armenia",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/armenia.jpg",
    description:
      "Monasteri millenari, il Monte Ararat e una cultura antichissima nel cuore del Caucaso.",
  },
  {
    slug: "giordania",
    name: "Giordania",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/giordania.jpg",
    description:
      "Petra, il Wadi Rum e il Mar Morto: un viaggio nel cuore della storia e della natura.",
  },
  {
    slug: "azerbaijan",
    name: "Azerbaijan",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/azerbaijan.jpg",
    description:
      "Baku, la Terra del Fuoco e il Caucaso orientale: un paese sorprendente tra antico e moderno.",
  },
  {
    slug: "russia",
    name: "Russia",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/russia.jpg",
    description:
      "Mosca, San Pietroburgo e la Transiberiana: un viaggio attraverso il paese più grande del mondo.",
  },
  {
    slug: "uzbekistan",
    name: "Uzbekistan",
    macroArea: "Asia/Russia",
    image: "/images/destinazioni/uzbekistan.jpg",
    description:
      "Samarcanda, Bukhara e Khiva: le meraviglie della Via della Seta nel cuore dell'Asia Centrale.",
  },

  // Africa
  {
    slug: "tunisia",
    name: "Tunisia",
    macroArea: "Africa",
    image: "/images/destinazioni/tunisia.jpg",
    description:
      "Cartagine, il Sahara e i souk di Tunisi: un mosaico di culture affacciato sul Mediterraneo.",
  },
  {
    slug: "egitto",
    name: "Egitto",
    macroArea: "Africa",
    image: "/images/destinazioni/egitto.jpg",
    description:
      "Le Piramidi, il Nilo e Luxor: sulle tracce dei Faraoni in una delle culle della civiltà.",
  },
  {
    slug: "marocco",
    name: "Marocco",
    macroArea: "Africa",
    image: "/images/destinazioni/marocco.jpg",
    description:
      "Marrakech, Fez e il deserto del Sahara: colori, profumi e tradizioni millenarie.",
  },

  // Percorsi Fluviali
  {
    slug: "senna",
    name: "Senna",
    macroArea: "Percorsi Fluviali",
    image: "/images/destinazioni/senna.jpg",
    description:
      "Da Parigi alla Normandia, una crociera lungo la Senna tra arte, storia e paesaggi bucolici.",
  },
  {
    slug: "danubio",
    name: "Danubio",
    macroArea: "Percorsi Fluviali",
    image: "/images/destinazioni/danubio.jpg",
    description:
      "Da Vienna a Budapest, il Danubio attraversa il cuore dell'Europa tra capitali imperiali.",
  },
  {
    slug: "reno",
    name: "Reno",
    macroArea: "Percorsi Fluviali",
    image: "/images/destinazioni/reno.jpg",
    description:
      "Castelli medievali, vigneti e città storiche lungo il grande fiume dell'Europa occidentale.",
  },
  {
    slug: "mosella",
    name: "Mosella",
    macroArea: "Percorsi Fluviali",
    image: "/images/destinazioni/mosella.jpg",
    description:
      "Vigneti terrazzati e borghi pittoreschi nella valle più romantica della Germania.",
  },
  {
    slug: "douro",
    name: "Douro",
    macroArea: "Percorsi Fluviali",
    image: "/images/destinazioni/douro.jpg",
    description:
      "Porto, le cantine del vino Porto e i vigneti patrimonio UNESCO nella valle del Douro.",
  },
  {
    slug: "schelda",
    name: "Schelda",
    macroArea: "Percorsi Fluviali",
    image: "/images/destinazioni/schelda.jpg",
    description:
      "Anversa, Gand e Bruges: le Fiandre e le loro meraviglie lungo il fiume Schelda.",
  },
];

// Helper: get destinations grouped by macro area
export function getDestinationsByMacroArea(): Record<MacroArea, Destination[]> {
  return destinations.reduce(
    (acc, dest) => {
      if (!acc[dest.macroArea]) {
        acc[dest.macroArea] = [];
      }
      acc[dest.macroArea].push(dest);
      return acc;
    },
    {} as Record<MacroArea, Destination[]>,
  );
}

// --------------------------------------------------
// Tours
// --------------------------------------------------

export const tours: Tour[] = [
  {
    slug: "india-triangolo-doro-udaipur-jodhpur-pushkar-mandawa",
    title: "India: Triangolo d'Oro con Udaipur, Jodhpur, Pushkar e Mandawa",
    destination: "India",
    destinationSlug: "india",
    duration: "16 notti / 17 giorni",
    priceFrom: 3890,
    image: "/images/tours/india-triangolo-oro.jpg",
    description:
      "Un viaggio completo nel Rajasthan che unisce il classico Triangolo d'Oro (Delhi, Agra, Jaipur) alle gemme nascoste di Udaipur, Jodhpur, Pushkar e Mandawa. Palazzi dei Maharaja, il Taj Mahal e i colori del deserto del Thar vi aspettano.",
    highlights: [
      "Taj Mahal al tramonto e all'alba",
      "Palazzo dei Venti di Jaipur",
      "Udaipur, la Venezia d'Oriente",
      "Forte di Mehrangarh a Jodhpur",
      "Tempio di Brahma a Pushkar",
      "Haveli dipinte di Mandawa nella regione dello Shekhawati",
      "Safari in cammello nel deserto del Thar",
      "Cerimonia Aarti sulle rive del lago di Pushkar",
    ],
    itinerary: [
      {
        day: 1,
        title: "Italia - Delhi",
        description:
          "Partenza dall'Italia con volo diretto o con scalo. Arrivo a Delhi e trasferimento in hotel.",
      },
      {
        day: 2,
        title: "Delhi",
        description:
          "Giornata dedicata alla visita della capitale: Vecchia Delhi con il Red Fort, Jama Masjid e Chandni Chowk. Nuova Delhi con India Gate e il Qutub Minar.",
      },
      {
        day: 3,
        title: "Delhi - Mandawa",
        description:
          "Partenza verso la regione dello Shekhawati. Visita delle haveli dipinte di Mandawa, veri e propri musei a cielo aperto.",
      },
      {
        day: 4,
        title: "Mandawa - Pushkar",
        description:
          "Proseguimento verso Pushkar, città santa sulle rive dell'omonimo lago sacro. Visita del Tempio di Brahma.",
      },
      {
        day: 5,
        title: "Pushkar - Jodhpur",
        description:
          "Trasferimento a Jodhpur, la 'Città Blu'. Visita del maestoso Forte di Mehrangarh e del mercato Sardar.",
      },
      {
        day: 6,
        title: "Jodhpur",
        description:
          "Giornata libera per esplorare i vicoli della città vecchia, visitare Jaswant Thada e il mercato delle spezie.",
      },
      {
        day: 7,
        title: "Jodhpur - Udaipur",
        description:
          "Trasferimento verso Udaipur con sosta al tempio jainista di Ranakpur, capolavoro di architettura in marmo bianco.",
      },
      {
        day: 8,
        title: "Udaipur",
        description:
          "Visita del City Palace, del Jagdish Temple e giro in barca sul Lago Pichola con vista sul Lake Palace.",
      },
      {
        day: 9,
        title: "Udaipur - Chittorgarh - Bundi",
        description:
          "Visita della fortezza di Chittorgarh, patrimonio UNESCO, e proseguimento verso la pittoresca Bundi.",
      },
      {
        day: 10,
        title: "Bundi - Jaipur",
        description:
          "Trasferimento a Jaipur, la 'Città Rosa'. Primo approccio con la capitale del Rajasthan.",
      },
      {
        day: 11,
        title: "Jaipur",
        description:
          "Visita del Forte di Amber con salita in jeep, Palazzo dei Venti (Hawa Mahal), City Palace e Jantar Mantar.",
      },
      {
        day: 12,
        title: "Jaipur - Fatehpur Sikri - Agra",
        description:
          "Partenza verso Agra con sosta a Fatehpur Sikri, la città fantasma mughal. Arrivo ad Agra e visita del Taj Mahal al tramonto.",
      },
      {
        day: 13,
        title: "Agra",
        description:
          "Visita del Taj Mahal all'alba per la luce migliore. Forte di Agra e Itimad-ud-Daulah (Baby Taj).",
      },
      {
        day: 14,
        title: "Agra - Delhi",
        description:
          "Rientro a Delhi. Pomeriggio libero per shopping nei bazar o relax in hotel.",
      },
      {
        day: 15,
        title: "Delhi",
        description:
          "Giornata libera a disposizione per visite facoltative: Akshardham Temple o escursione opzionale.",
      },
      {
        day: 16,
        title: "Delhi - Italia",
        description:
          "Trasferimento in aeroporto per il volo di rientro. Arrivo in Italia.",
      },
      {
        day: 17,
        title: "Arrivo in Italia",
        description: "Arrivo in Italia e fine dei servizi.",
      },
    ],
    included: [
      "Voli internazionali dall'Italia",
      "Tutti i trasferimenti in veicolo privato con aria condizionata",
      "16 notti in hotel 4/5 stelle con colazione",
      "Guida locale parlante italiano per tutto il tour",
      "Ingressi ai monumenti e siti come da programma",
      "Giro in barca sul Lago Pichola a Udaipur",
      "Salita in jeep al Forte di Amber",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Pasti non menzionati",
      "Bevande ai pasti",
      "Mance a guida e autista",
      "Visto d'ingresso per l'India",
      "Escursioni facoltative",
      "Tutto quanto non espressamente indicato nella quota include",
    ],
    departures: [
      { date: "2025-10-12", price: 3890, availability: "disponibile" },
      { date: "2025-11-09", price: 3990, availability: "disponibile" },
      { date: "2025-12-26", price: 4290, availability: "ultime disponibilita" },
      { date: "2026-01-18", price: 3890, availability: "disponibile" },
      { date: "2026-02-15", price: 3890, availability: "disponibile" },
    ],
  },
  {
    slug: "new-york-cascate-niagara",
    title: "New York & Cascate del Niagara",
    destination: "New York",
    destinationSlug: "new-york",
    duration: "8 giorni / 7 notti",
    priceFrom: 2950,
    image: "/images/tours/new-york-niagara.jpg",
    description:
      "Un viaggio iconico che combina l'energia di New York City con lo spettacolo naturale delle Cascate del Niagara. Dalla Statua della Libertà a Times Square, da Central Park alla potenza delle cascate.",
    highlights: [
      "Statua della Libertà e Ellis Island",
      "Times Square e Broadway",
      "Central Park e Metropolitan Museum",
      "One World Observatory",
      "Cascate del Niagara lato americano e canadese",
      "Giro in battello Maid of the Mist",
      "Brooklyn Bridge e DUMBO",
      "High Line e Chelsea Market",
    ],
    itinerary: [
      {
        day: 1,
        title: "Italia - New York",
        description:
          "Volo dall'Italia a New York. Arrivo al JFK, trasferimento in hotel a Manhattan. Serata libera per un primo approccio con la città.",
      },
      {
        day: 2,
        title: "New York - Midtown e Downtown",
        description:
          "Visita di Times Square, Empire State Building, One World Observatory e Wall Street. Passeggiata al Battery Park.",
      },
      {
        day: 3,
        title: "New York - Liberty Island e Brooklyn",
        description:
          "Traghetto per la Statua della Libertà ed Ellis Island. Pomeriggio a Brooklyn: DUMBO e Brooklyn Bridge.",
      },
      {
        day: 4,
        title: "New York - Central Park e Musei",
        description:
          "Mattina a Central Park. Visita del Metropolitan Museum o dell'American Museum of Natural History. Serata a Broadway (facoltativa).",
      },
      {
        day: 5,
        title: "New York - Cascate del Niagara",
        description:
          "Volo interno o trasferimento verso le Cascate del Niagara. Arrivo e prima vista panoramica delle cascate illuminate di sera.",
      },
      {
        day: 6,
        title: "Cascate del Niagara",
        description:
          "Giornata dedicata alle cascate: giro in battello Maid of the Mist, Cave of the Winds e passeggiata lungo il Niagara Gorge.",
      },
      {
        day: 7,
        title: "Cascate del Niagara - New York",
        description:
          "Rientro a New York. Pomeriggio libero per shopping sulla Fifth Avenue o visita della High Line e Chelsea Market.",
      },
      {
        day: 8,
        title: "New York - Italia",
        description:
          "Trasferimento in aeroporto e volo di rientro in Italia.",
      },
    ],
    included: [
      "Voli internazionali dall'Italia",
      "Volo interno New York - Niagara (o trasferimento)",
      "7 notti in hotel 4 stelle",
      "Prima colazione giornaliera",
      "Trasferimenti aeroportuali",
      "Guida accompagnatore italiano",
      "Ingressi: Statua della Libertà, One World Observatory, Maid of the Mist",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Pasti non menzionati",
      "ESTA e tasse consolari",
      "Spettacoli a Broadway",
      "Mance",
      "Escursioni facoltative",
    ],
    departures: [
      { date: "2025-10-05", price: 2950, availability: "disponibile" },
      { date: "2025-11-23", price: 3150, availability: "disponibile" },
      { date: "2025-12-20", price: 3490, availability: "ultime disponibilita" },
      { date: "2026-03-14", price: 2950, availability: "disponibile" },
    ],
  },
  {
    slug: "transiberiana-transmongolica",
    title: "Transiberiana Transmongolica",
    destination: "Mongolia / Russia",
    destinationSlug: "mongolia",
    duration: "15 giorni / 14 notti",
    priceFrom: 4950,
    image: "/images/tours/transiberiana.jpg",
    description:
      "Il viaggio in treno più leggendario del mondo: da Mosca a Pechino attraverso la Siberia, il Lago Baikal e le steppe della Mongolia. Un'avventura epica tra paesaggi infiniti e culture millenarie.",
    highlights: [
      "Mosca: Piazza Rossa e Cremlino",
      "Treno Transiberiano in prima classe",
      "Lago Baikal, la Perla della Siberia",
      "Irkutsk, la Parigi della Siberia",
      "Ulan Bator e il monastero di Gandan",
      "Steppe mongole e campo di ger",
      "Parco Nazionale Terelj",
      "Arrivo a Pechino: Grande Muraglia e Città Proibita",
    ],
    itinerary: [
      {
        day: 1,
        title: "Italia - Mosca",
        description:
          "Volo dall'Italia a Mosca. Trasferimento in hotel e primo approccio con la capitale russa.",
      },
      {
        day: 2,
        title: "Mosca",
        description:
          "Visita della Piazza Rossa, Cremlino, Cattedrale di San Basilio e metropolitana di Mosca.",
      },
      {
        day: 3,
        title: "Mosca - Treno Transiberiano",
        description:
          "Partenza dalla stazione Yaroslavsky. Inizio del viaggio in treno attraverso gli Urali.",
      },
      {
        day: 4,
        title: "In treno - Taiga siberiana",
        description:
          "Giornata sul treno attraversando la taiga siberiana. Soste nelle stazioni per acquisti locali.",
      },
      {
        day: 5,
        title: "In treno - Verso il Baikal",
        description:
          "Proseguimento del viaggio con paesaggi che cambiano dalla taiga alla steppa.",
      },
      {
        day: 6,
        title: "Irkutsk",
        description:
          "Arrivo a Irkutsk. Visita della città e delle sue chiese in legno.",
      },
      {
        day: 7,
        title: "Lago Baikal",
        description:
          "Escursione al Lago Baikal, il lago più profondo del mondo. Visita del villaggio di Listvyanka.",
      },
      {
        day: 8,
        title: "Irkutsk - Treno verso Mongolia",
        description:
          "Ripresa del viaggio in treno verso il confine mongolo.",
      },
      {
        day: 9,
        title: "Confine - Ulan Bator",
        description:
          "Attraversamento del confine russo-mongolo. Arrivo a Ulan Bator.",
      },
      {
        day: 10,
        title: "Ulan Bator",
        description:
          "Visita della capitale: monastero di Gandan, Piazza Sukhbaatar e Museo di Storia Nazionale.",
      },
      {
        day: 11,
        title: "Parco Nazionale Terelj",
        description:
          "Escursione nel Parco Terelj. Notte in un tradizionale campo di ger (yurte).",
      },
      {
        day: 12,
        title: "Terelj - Treno verso Pechino",
        description:
          "Rientro a Ulan Bator e partenza in treno verso la Cina.",
      },
      {
        day: 13,
        title: "Deserto del Gobi (dal treno)",
        description:
          "Attraversamento del deserto del Gobi con panorami spettacolari dal finestrino.",
      },
      {
        day: 14,
        title: "Pechino",
        description:
          "Arrivo a Pechino. Visita della Grande Muraglia Cinese a Mutianyu e della Città Proibita.",
      },
      {
        day: 15,
        title: "Pechino - Italia",
        description:
          "Ultimo giorno a Pechino. Trasferimento in aeroporto e volo di rientro.",
      },
    ],
    included: [
      "Voli internazionali Italia-Mosca e Pechino-Italia",
      "Biglietto Transiberiano in prima classe (cabine da 2)",
      "Hotel 4 stelle a Mosca, Irkutsk, Ulan Bator e Pechino",
      "Notte in campo ger al Parco Terelj",
      "Tutti i pasti sul treno",
      "Escursioni e visite come da programma",
      "Guida accompagnatore italiano per l'intero viaggio",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Visti per Russia, Mongolia e Cina",
      "Pasti nelle città (tranne colazione)",
      "Mance",
      "Bevande extra",
      "Escursioni facoltative",
    ],
    departures: [
      { date: "2026-06-15", price: 4950, availability: "disponibile" },
      { date: "2026-07-20", price: 5250, availability: "disponibile" },
      { date: "2026-08-10", price: 5250, availability: "ultime disponibilita" },
    ],
  },
  {
    slug: "meraviglie-della-giordania",
    title: "Meraviglie della Giordania",
    destination: "Giordania",
    destinationSlug: "giordania",
    duration: "8 giorni / 7 notti",
    priceFrom: 1890,
    image: "/images/tours/giordania.jpg",
    description:
      "Dalle antiche rovine di Petra al deserto rosso del Wadi Rum, dal Mar Morto ai mosaici di Madaba: un viaggio nella culla della civiltà tra storia biblica e paesaggi mozzafiato.",
    highlights: [
      "Petra, una delle Sette Meraviglie del Mondo Moderno",
      "Deserto del Wadi Rum con notte in campo beduino",
      "Galleggiamento nel Mar Morto",
      "Jerash, la Pompei d'Oriente",
      "Monte Nebo e Madaba",
      "Amman, la capitale tra antico e moderno",
      "Castelli del deserto",
      "Cucina tradizionale giordana",
    ],
    itinerary: [
      {
        day: 1,
        title: "Italia - Amman",
        description:
          "Volo dall'Italia ad Amman. Trasferimento in hotel e cena di benvenuto.",
      },
      {
        day: 2,
        title: "Amman - Jerash - Ajloun",
        description:
          "Visita della città romana di Jerash, una delle meglio conservate al mondo. Proseguimento per il Castello di Ajloun.",
      },
      {
        day: 3,
        title: "Amman - Castelli del Deserto - Mar Morto",
        description:
          "Escursione ai Castelli del Deserto (Qasr Amra, Qasr Kharana). Pomeriggio al Mar Morto per il bagno galleggiante.",
      },
      {
        day: 4,
        title: "Mar Morto - Madaba - Monte Nebo - Kerak - Petra",
        description:
          "Visita della mappa a mosaico di Madaba e del Monte Nebo. Proseguimento verso Petra con sosta al Castello di Kerak.",
      },
      {
        day: 5,
        title: "Petra",
        description:
          "Giornata intera a Petra: il Siq, il Tesoro (Al-Khazneh), le Tombe Reali, il Monastero (Ad-Deir). Sera: Petra by Night (facoltativa).",
      },
      {
        day: 6,
        title: "Petra - Piccola Petra - Wadi Rum",
        description:
          "Visita della Piccola Petra (Siq al-Barid). Trasferimento nel Wadi Rum: escursione in jeep nel deserto. Notte in campo beduino sotto le stelle.",
      },
      {
        day: 7,
        title: "Wadi Rum - Amman",
        description:
          "Alba nel deserto. Rientro verso Amman. Visita della Cittadella e del Teatro Romano. Cena d'arrivederci.",
      },
      {
        day: 8,
        title: "Amman - Italia",
        description:
          "Trasferimento in aeroporto e volo di rientro in Italia.",
      },
    ],
    included: [
      "Voli internazionali dall'Italia",
      "7 notti: 5 in hotel 4 stelle + 1 campo beduino nel Wadi Rum + 1 resort Mar Morto",
      "Pensione completa per tutta la durata del viaggio",
      "Trasferimenti in pullman GT con aria condizionata",
      "Guida accompagnatore italiano",
      "Ingressi a tutti i siti come da programma",
      "Escursione in jeep nel Wadi Rum",
      "Jordan Pass incluso",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Bevande ai pasti",
      "Mance a guida e autista",
      "Petra by Night (facoltativa, circa 17 JOD)",
      "Escursioni facoltative",
      "Tutto quanto non indicato nella quota include",
    ],
    departures: [
      { date: "2025-10-18", price: 1890, availability: "disponibile" },
      { date: "2025-11-08", price: 1890, availability: "disponibile" },
      { date: "2026-03-07", price: 1990, availability: "disponibile" },
      { date: "2026-04-04", price: 2090, availability: "ultime disponibilita" },
      { date: "2026-05-02", price: 1890, availability: "disponibile" },
    ],
  },
  {
    slug: "tour-turchia-con-archeologo",
    title: "Tour Turchia con l'Archeologo",
    destination: "Turchia",
    destinationSlug: "turchia",
    duration: "10 giorni / 9 notti",
    priceFrom: 2450,
    image: "/images/tours/turchia-archeologo.jpg",
    description:
      "Un viaggio esclusivo in Turchia accompagnati da un archeologo professionista. Da Istanbul alla Cappadocia, da Efeso a Pamukkale: scoprirete la Turchia da una prospettiva unica, con approfondimenti storici e archeologici impossibili in un tour tradizionale.",
    highlights: [
      "Istanbul: Santa Sofia, Moschea Blu e Grand Bazaar",
      "Cappadocia: camini delle fate e città sotterranee",
      "Volo in mongolfiera sulla Cappadocia (facoltativo)",
      "Efeso: una delle città antiche meglio conservate",
      "Pamukkale e Hierapolis",
      "Konya: il mausoleo di Rumi",
      "Ankara: Museo delle Civiltà Anatoliche",
      "Accompagnamento di un archeologo per tutto il tour",
    ],
    itinerary: [
      {
        day: 1,
        title: "Italia - Istanbul",
        description:
          "Arrivo a Istanbul e trasferimento in hotel nel quartiere di Sultanahmet. Incontro con l'archeologo accompagnatore.",
      },
      {
        day: 2,
        title: "Istanbul - Città Vecchia",
        description:
          "Visita di Santa Sofia, Moschea Blu, Ippodromo, Cisterna Basilica. L'archeologo racconta la stratificazione di Costantinopoli.",
      },
      {
        day: 3,
        title: "Istanbul - Topkapi e Bosforo",
        description:
          "Palazzo Topkapi con i suoi tesori. Crociera sul Bosforo e visita del Grand Bazaar.",
      },
      {
        day: 4,
        title: "Istanbul - Ankara",
        description:
          "Volo interno per Ankara. Visita del Museo delle Civiltà Anatoliche, uno dei più importanti al mondo.",
      },
      {
        day: 5,
        title: "Ankara - Cappadocia",
        description:
          "Trasferimento in Cappadocia. Visita del Museo all'Aperto di Goreme con le chiese rupestri affrescate.",
      },
      {
        day: 6,
        title: "Cappadocia",
        description:
          "Volo in mongolfiera all'alba (facoltativo). Visita della città sotterranea di Derinkuyu e della Valle di Ihlara.",
      },
      {
        day: 7,
        title: "Cappadocia - Konya - Pamukkale",
        description:
          "Trasferimento a Konya: visita del Mausoleo di Mevlana (Rumi). Proseguimento verso Pamukkale.",
      },
      {
        day: 8,
        title: "Pamukkale - Efeso",
        description:
          "Visita delle terrazze di travertino di Pamukkale e delle rovine di Hierapolis. Trasferimento a Kusadasi/Selcuk.",
      },
      {
        day: 9,
        title: "Efeso",
        description:
          "Visita approfondita di Efeso con l'archeologo: la Biblioteca di Celso, il Teatro, le Case a Terrazza. Visita del Tempio di Artemide.",
      },
      {
        day: 10,
        title: "Izmir - Italia",
        description:
          "Trasferimento all'aeroporto di Izmir e volo di rientro in Italia.",
      },
    ],
    included: [
      "Voli internazionali dall'Italia",
      "Volo interno Istanbul-Ankara",
      "9 notti in hotel 4 stelle con colazione e cena",
      "Archeologo accompagnatore italiano per l'intero tour",
      "Trasferimenti in pullman GT",
      "Ingressi a tutti i siti e musei come da programma",
      "Crociera sul Bosforo",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Pranzi",
      "Bevande ai pasti",
      "Volo in mongolfiera in Cappadocia (circa 250 euro)",
      "Mance",
      "Escursioni facoltative",
    ],
    departures: [
      { date: "2025-09-20", price: 2450, availability: "ultime disponibilita" },
      { date: "2025-10-11", price: 2450, availability: "disponibile" },
      { date: "2026-04-18", price: 2550, availability: "disponibile" },
      { date: "2026-05-09", price: 2550, availability: "disponibile" },
    ],
  },
  {
    slug: "nepal",
    title: "Nepal",
    destination: "Nepal",
    destinationSlug: "nepal",
    duration: "12 giorni / 11 notti",
    priceFrom: 3200,
    image: "/images/tours/nepal.jpg",
    description:
      "Dalle pagode di Kathmandu ai panorami himalayani di Nagarkot, dal Chitwan con i rinoceronti alla città natale del Buddha a Lumbini: un viaggio che unisce spiritualità, natura e avventura nel tetto del mondo.",
    highlights: [
      "Kathmandu: Durbar Square, Swayambhunath e Boudhanath",
      "Bhaktapur, la città medievale preservata",
      "Panorama himalayano da Nagarkot",
      "Pokhara e il Lago Phewa",
      "Trekking panoramico a Poon Hill",
      "Parco Nazionale di Chitwan: safari e rinoceronti",
      "Lumbini, luogo di nascita del Buddha",
      "Patan e i suoi artigiani",
    ],
    itinerary: [
      {
        day: 1,
        title: "Italia - Kathmandu",
        description:
          "Volo dall'Italia a Kathmandu. Arrivo e trasferimento in hotel nel quartiere di Thamel.",
      },
      {
        day: 2,
        title: "Kathmandu",
        description:
          "Visita di Durbar Square, stupa di Swayambhunath (Tempio delle Scimmie) e il grande stupa di Boudhanath.",
      },
      {
        day: 3,
        title: "Bhaktapur - Nagarkot",
        description:
          "Visita della città medievale di Bhaktapur. Trasferimento a Nagarkot per il tramonto sull'Himalaya.",
      },
      {
        day: 4,
        title: "Nagarkot - Patan - Pokhara",
        description:
          "Alba sull'Himalaya. Visita di Patan (Lalitpur) e volo panoramico verso Pokhara.",
      },
      {
        day: 5,
        title: "Pokhara",
        description:
          "Giro in barca sul Lago Phewa, visita della Pagoda della Pace Mondiale, cascata Devi e grotta Gupteshwor.",
      },
      {
        day: 6,
        title: "Pokhara - Trekking",
        description:
          "Inizio del trekking panoramico: sentiero verso Ghandruk con viste sull'Annapurna e il Machhapuchhre.",
      },
      {
        day: 7,
        title: "Trekking - Poon Hill",
        description:
          "Alba da Poon Hill (3.210 m) con vista su Dhaulagiri, Annapurna e Manaslu. Discesa e rientro a Pokhara.",
      },
      {
        day: 8,
        title: "Pokhara - Chitwan",
        description:
          "Trasferimento al Parco Nazionale di Chitwan. Pomeriggio: passeggiata nel villaggio Tharu.",
      },
      {
        day: 9,
        title: "Chitwan",
        description:
          "Safari in jeep e in canoa nel parco: rinoceronti indiani, coccodrilli e oltre 500 specie di uccelli.",
      },
      {
        day: 10,
        title: "Chitwan - Lumbini",
        description:
          "Trasferimento a Lumbini, patrimonio UNESCO e luogo di nascita del Buddha. Visita del giardino sacro.",
      },
      {
        day: 11,
        title: "Lumbini - Kathmandu",
        description:
          "Rientro a Kathmandu. Pomeriggio libero per shopping e relax. Cena d'arrivederci.",
      },
      {
        day: 12,
        title: "Kathmandu - Italia",
        description:
          "Trasferimento in aeroporto e volo di rientro in Italia.",
      },
    ],
    included: [
      "Voli internazionali dall'Italia",
      "Volo interno Kathmandu-Pokhara",
      "11 notti: hotel 4 stelle, lodge durante il trekking, resort a Chitwan",
      "Pensione completa durante trekking e Chitwan",
      "Colazione in hotel nelle città",
      "Guida accompagnatore italiano e guide locali",
      "Safari in jeep e canoa a Chitwan",
      "Permessi di trekking",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Pasti non menzionati",
      "Visto d'ingresso per il Nepal",
      "Mance",
      "Attrezzatura da trekking personale",
      "Escursioni facoltative",
    ],
    departures: [
      { date: "2025-10-20", price: 3200, availability: "disponibile" },
      { date: "2025-11-15", price: 3200, availability: "disponibile" },
      { date: "2026-03-15", price: 3350, availability: "disponibile" },
      { date: "2026-04-12", price: 3350, availability: "ultime disponibilita" },
    ],
  },
];

// --------------------------------------------------
// Crociere (River Cruises)
// --------------------------------------------------

export const cruises: Cruise[] = [
  {
    slug: "splendore-del-douro",
    title: "MS Douro Cruiser - Splendore del Douro",
    ship: "MS Douro Cruiser",
    river: "Douro",
    duration: "8 giorni / 7 notti",
    priceFrom: 1890,
    image: "/images/crociere/splendore-douro.jpg",
    description:
      "Una crociera completa lungo la Valle del Douro, patrimonio UNESCO, da Porto a Barca d'Alva al confine con la Spagna. Degustazioni di vino Porto, visite a cantine storiche e paesaggi mozzafiato tra vigneti e oliveti.",
    itinerary: [
      { day: 1, title: "Porto - Imbarco", description: "Arrivo a Porto, trasferimento e imbarco sulla MS Douro Cruiser. Cocktail di benvenuto e cena a bordo." },
      { day: 2, title: "Porto - Regua", description: "Navigazione lungo la Valle del Douro. Visita a una Quinta con degustazione di vino Porto. Arrivo a Regua." },
      { day: 3, title: "Regua - Pinhao", description: "Visita di Lamego e del Santuario di Nossa Senhora dos Remedios. Navigazione verso Pinhao tra i vigneti terrazzati." },
      { day: 4, title: "Pinhao - Barca d'Alva", description: "Navigazione fino a Barca d'Alva, al confine spagnolo. Escursione facoltativa a Salamanca." },
      { day: 5, title: "Barca d'Alva - Ferradosa", description: "Rientro verso valle. Sosta a Freixo de Espada a Cinta. Visita di un'azienda agricola locale." },
      { day: 6, title: "Ferradosa - Regua", description: "Visita di Vila Real e del Palazzo di Mateus. Degustazione di vini della regione." },
      { day: 7, title: "Regua - Porto", description: "Navigazione di rientro verso Porto. Visita delle cantine di Vila Nova de Gaia. Cena di gala." },
      { day: 8, title: "Porto - Sbarco", description: "Colazione a bordo e sbarco. Trasferimento in aeroporto o estensione soggiorno." },
    ],
    included: [
      "7 notti in cabina esterna con finestra panoramica o balcone",
      "Pensione completa a bordo con bevande ai pasti",
      "Escursioni guidate come da programma",
      "Degustazioni di vino Porto",
      "Intrattenimento serale a bordo",
      "Wi-Fi a bordo",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Voli dall'Italia",
      "Trasferimenti aeroportuali",
      "Escursioni facoltative (Salamanca)",
      "Bevande premium e minibar",
      "Mance all'equipaggio",
    ],
    deckPlan: [
      { name: "Ponte Superiore", description: "Cabine con balcone privato, suite e solarium", image: "/images/navi/douro-cruiser-deck-superior.jpg" },
      { name: "Ponte Principale", description: "Cabine con finestra panoramica, ristorante e lounge", image: "/images/navi/douro-cruiser-deck-main.jpg" },
      { name: "Ponte Inferiore", description: "Cabine con finestra, sala fitness e spa", image: "/images/navi/douro-cruiser-deck-lower.jpg" },
    ],
    departures: [
      { date: "2025-09-14", price: 1890, availability: "ultime disponibilita" },
      { date: "2025-10-05", price: 1890, availability: "disponibile" },
      { date: "2026-03-22", price: 1990, availability: "disponibile" },
      { date: "2026-04-19", price: 2090, availability: "disponibile" },
    ],
  },
  {
    slug: "essenza-del-douro",
    title: "MS Douro Cruiser - Essenza del Douro",
    ship: "MS Douro Cruiser",
    river: "Douro",
    duration: "5 giorni / 4 notti",
    priceFrom: 1290,
    image: "/images/crociere/essenza-douro.jpg",
    description:
      "Una crociera breve ma intensa che cattura l'essenza della Valle del Douro. Ideale per chi ha poco tempo ma non vuole rinunciare alla magia del fiume portoghese.",
    itinerary: [
      { day: 1, title: "Porto - Imbarco", description: "Arrivo a Porto, trasferimento e imbarco. Cena di benvenuto a bordo." },
      { day: 2, title: "Porto - Regua", description: "Navigazione nella Valle del Douro. Visita a una Quinta e degustazione di vino Porto." },
      { day: 3, title: "Regua - Pinhao", description: "Escursione a Lamego. Navigazione verso Pinhao tra vigneti patrimonio UNESCO." },
      { day: 4, title: "Pinhao - Porto", description: "Navigazione di rientro con soste panoramiche. Visita delle cantine di Gaia. Cena di gala." },
      { day: 5, title: "Porto - Sbarco", description: "Colazione a bordo e sbarco. Possibilità di visita di Porto." },
    ],
    included: [
      "4 notti in cabina esterna",
      "Pensione completa con bevande ai pasti",
      "Escursioni guidate",
      "Degustazione di vino Porto",
      "Intrattenimento serale",
      "Wi-Fi a bordo",
    ],
    excluded: [
      "Voli dall'Italia",
      "Trasferimenti aeroportuali",
      "Escursioni facoltative",
      "Bevande premium",
      "Mance",
    ],
    deckPlan: [
      { name: "Ponte Superiore", description: "Cabine con balcone privato e suite", image: "/images/navi/douro-cruiser-deck-superior.jpg" },
      { name: "Ponte Principale", description: "Cabine con finestra panoramica", image: "/images/navi/douro-cruiser-deck-main.jpg" },
    ],
    departures: [
      { date: "2025-10-12", price: 1290, availability: "disponibile" },
      { date: "2025-11-02", price: 1290, availability: "disponibile" },
      { date: "2026-04-05", price: 1390, availability: "disponibile" },
    ],
  },
  {
    slug: "speciale-fascino-del-douro",
    title: "MS Douro Cruiser - Speciale Fascino del Douro",
    ship: "MS Douro Cruiser",
    river: "Douro",
    duration: "8 giorni / 7 notti",
    priceFrom: 1690,
    image: "/images/crociere/fascino-douro.jpg",
    description:
      "Un'edizione speciale della crociera sul Douro a prezzo ridotto, con lo stesso itinerario completo e tutte le escursioni incluse. Una proposta imperdibile per scoprire il Douro a un prezzo eccezionale.",
    itinerary: [
      { day: 1, title: "Porto - Imbarco", description: "Arrivo a Porto e imbarco sulla MS Douro Cruiser." },
      { day: 2, title: "Porto - Entre-os-Rios", description: "Navigazione e visita delle cantine lungo il percorso." },
      { day: 3, title: "Entre-os-Rios - Regua", description: "Visita di Amarante e proseguimento verso Regua." },
      { day: 4, title: "Regua - Pinhao", description: "Escursione a Lamego e navigazione tra i vigneti." },
      { day: 5, title: "Pinhao - Barca d'Alva", description: "Navigazione fino al confine spagnolo. Tempo libero." },
      { day: 6, title: "Barca d'Alva - Ferradosa", description: "Rientro con visita di borghi lungo il fiume." },
      { day: 7, title: "Ferradosa - Porto", description: "Navigazione di rientro e cena di gala." },
      { day: 8, title: "Porto - Sbarco", description: "Colazione e sbarco." },
    ],
    included: [
      "7 notti in cabina esterna",
      "Pensione completa con bevande ai pasti",
      "Escursioni guidate",
      "Degustazioni",
      "Intrattenimento serale",
      "Wi-Fi",
    ],
    excluded: [
      "Voli dall'Italia",
      "Trasferimenti",
      "Escursioni facoltative",
      "Bevande premium",
      "Mance",
    ],
    deckPlan: [
      { name: "Ponte Superiore", description: "Suite e cabine con balcone", image: "/images/navi/douro-cruiser-deck-superior.jpg" },
      { name: "Ponte Principale", description: "Cabine con finestra", image: "/images/navi/douro-cruiser-deck-main.jpg" },
      { name: "Ponte Inferiore", description: "Cabine standard", image: "/images/navi/douro-cruiser-deck-lower.jpg" },
    ],
    departures: [
      { date: "2025-11-16", price: 1690, availability: "disponibile" },
      { date: "2026-03-08", price: 1690, availability: "disponibile" },
      { date: "2026-05-17", price: 1790, availability: "disponibile" },
    ],
  },
  {
    slug: "sul-bel-danubio-blu",
    title: "MS Fidelio - Sul Bel Danubio Blu",
    ship: "MS Fidelio",
    river: "Danubio",
    duration: "8 giorni / 7 notti",
    priceFrom: 1990,
    image: "/images/crociere/danubio-blu.jpg",
    description:
      "La classica crociera sul Danubio tra Vienna, Budapest e Bratislava. Navigando attraverso il cuore dell'Impero Asburgico, tra palazzi imperiali, terme storiche e la dolce campagna pannonica.",
    itinerary: [
      { day: 1, title: "Vienna - Imbarco", description: "Arrivo a Vienna e imbarco sulla MS Fidelio. Cocktail di benvenuto." },
      { day: 2, title: "Vienna", description: "Giornata dedicata a Vienna: Hofburg, Schonbrunn, Duomo di Santo Stefano e passeggiata sul Ring." },
      { day: 3, title: "Vienna - Bratislava", description: "Navigazione verso Bratislava. Visita del centro storico e del Castello." },
      { day: 4, title: "Bratislava - Budapest", description: "Navigazione lungo l'Ansa del Danubio. Arrivo a Budapest in serata con vista sul Parlamento illuminato." },
      { day: 5, title: "Budapest", description: "Giornata a Budapest: Castello di Buda, Bastione dei Pescatori, Terme Szechenyi e via Andrassy." },
      { day: 6, title: "Budapest - Esztergom", description: "Navigazione verso Esztergom. Visita della Basilica e della città. Sosta a Visegrad." },
      { day: 7, title: "Esztergom - Vienna", description: "Navigazione di rientro attraverso la Wachau. Sosta a Durnstein. Cena di gala." },
      { day: 8, title: "Vienna - Sbarco", description: "Colazione a bordo e sbarco a Vienna." },
    ],
    included: [
      "7 notti in cabina esterna con balcone francese o finestra panoramica",
      "Pensione completa con bevande selezionate ai pasti",
      "Escursioni guidate in italiano",
      "Intrattenimento serale (musica dal vivo, serate a tema)",
      "Wi-Fi a bordo",
      "Tasse portuali",
      "Assicurazione medico-bagaglio",
    ],
    excluded: [
      "Voli dall'Italia",
      "Trasferimenti aeroportuali",
      "Escursioni facoltative",
      "Terme a Budapest (facoltative)",
      "Bevande premium e minibar",
      "Mance all'equipaggio",
    ],
    deckPlan: [
      { name: "Sun Deck", description: "Solarium, piscina e area relax", image: "/images/navi/fidelio-deck-sun.jpg" },
      { name: "Upper Deck", description: "Suite e cabine deluxe con balcone", image: "/images/navi/fidelio-deck-upper.jpg" },
      { name: "Main Deck", description: "Cabine con balcone francese, ristorante principale", image: "/images/navi/fidelio-deck-main.jpg" },
      { name: "Lower Deck", description: "Cabine con finestra, lounge bar", image: "/images/navi/fidelio-deck-lower.jpg" },
    ],
    departures: [
      { date: "2025-09-28", price: 1990, availability: "ultime disponibilita" },
      { date: "2025-10-19", price: 1990, availability: "disponibile" },
      { date: "2026-04-12", price: 2090, availability: "disponibile" },
      { date: "2026-05-10", price: 2190, availability: "disponibile" },
      { date: "2026-06-07", price: 2290, availability: "disponibile" },
    ],
  },
  {
    slug: "danubio-magico",
    title: "MS Fidelio - Danubio Magico",
    ship: "MS Fidelio",
    river: "Danubio",
    duration: "8 giorni / 7 notti",
    priceFrom: 2290,
    image: "/images/crociere/danubio-magico.jpg",
    description:
      "Un itinerario premium sul Danubio che include esperienze esclusive: concerto privato a Vienna, cena di gala nella puszta ungherese e degustazione di vini della Wachau. Per chi cerca il meglio della crociera fluviale.",
    itinerary: [
      { day: 1, title: "Vienna - Imbarco", description: "Arrivo a Vienna, imbarco e cena di benvenuto con concerto di musica classica." },
      { day: 2, title: "Vienna", description: "Tour esclusivo di Vienna con visita privata del Palazzo di Schonbrunn." },
      { day: 3, title: "Wachau - Durnstein - Melk", description: "Navigazione nella Valle della Wachau. Degustazione di vini a Durnstein. Visita dell'Abbazia di Melk." },
      { day: 4, title: "Bratislava", description: "Giornata a Bratislava con visita del Castello e del centro storico." },
      { day: 5, title: "Budapest", description: "Arrivo a Budapest. Tour della città e crociera serale sul Danubio illuminato." },
      { day: 6, title: "Budapest - Puszta", description: "Escursione nella Puszta ungherese: spettacolo equestre e cena tipica." },
      { day: 7, title: "Ansa del Danubio", description: "Visita di Szentendre, Visegrad ed Esztergom. Cena di gala a bordo." },
      { day: 8, title: "Budapest - Sbarco", description: "Colazione e sbarco a Budapest." },
    ],
    included: [
      "7 notti in cabina deluxe con balcone",
      "Pensione completa con bevande premium illimitate",
      "Concerto privato a Vienna",
      "Cena nella Puszta",
      "Degustazione vini della Wachau",
      "Tutte le escursioni incluse",
      "Wi-Fi e minibar inclusi",
      "Mance incluse",
    ],
    excluded: [
      "Voli dall'Italia",
      "Trasferimenti aeroportuali",
      "Trattamenti spa",
      "Acquisti personali",
    ],
    deckPlan: [
      { name: "Sun Deck", description: "Solarium con piscina", image: "/images/navi/fidelio-deck-sun.jpg" },
      { name: "Upper Deck", description: "Suite panoramiche", image: "/images/navi/fidelio-deck-upper.jpg" },
      { name: "Main Deck", description: "Cabine deluxe e ristorante", image: "/images/navi/fidelio-deck-main.jpg" },
    ],
    departures: [
      { date: "2025-10-12", price: 2290, availability: "disponibile" },
      { date: "2026-05-03", price: 2390, availability: "disponibile" },
      { date: "2026-06-14", price: 2490, availability: "disponibile" },
    ],
  },
  {
    slug: "delizie-del-danubio-vienna-bucharest",
    title: "MS Fidelio - Delizie del Danubio Vienna-Bucharest",
    ship: "MS Fidelio",
    river: "Danubio",
    duration: "15 giorni / 14 notti",
    priceFrom: 3490,
    image: "/images/crociere/danubio-vienna-bucharest.jpg",
    description:
      "Il grande itinerario del Danubio: da Vienna a Bucharest attraverso sette nazioni. Una crociera epica che tocca le capitali imperiali, le Porte di Ferro e il Delta del Danubio, patrimonio UNESCO.",
    itinerary: [
      { day: 1, title: "Vienna - Imbarco", description: "Arrivo a Vienna e imbarco sulla MS Fidelio." },
      { day: 2, title: "Vienna", description: "Visita di Vienna: Schonbrunn, Hofburg e centro storico." },
      { day: 3, title: "Wachau - Melk", description: "Navigazione nella Wachau e visita dell'Abbazia di Melk." },
      { day: 4, title: "Bratislava", description: "Visita della capitale slovacca." },
      { day: 5, title: "Budapest", description: "Giornata intera nella capitale ungherese." },
      { day: 6, title: "Kalocsa - Mohacs", description: "Visita di Kalocsa, città della paprika, e spettacolo equestre." },
      { day: 7, title: "Belgrado", description: "Visita della capitale serba: Fortezza di Kalemegdan e via Knez Mihailova." },
      { day: 8, title: "Navigazione", description: "Giornata di navigazione con conferenze a bordo sulla storia del Danubio." },
      { day: 9, title: "Porte di Ferro", description: "Attraversamento delle Porte di Ferro, il tratto più spettacolare del Danubio." },
      { day: 10, title: "Vidin", description: "Visita della Fortezza di Baba Vida in Bulgaria." },
      { day: 11, title: "Rousse", description: "Visita di Rousse, la 'Piccola Vienna' bulgara." },
      { day: 12, title: "Giurgiu", description: "Escursione a Bucharest dalla Romania." },
      { day: 13, title: "Delta del Danubio", description: "Escursione nel Delta del Danubio, patrimonio UNESCO. Birdwatching." },
      { day: 14, title: "Navigazione di rientro", description: "Giornata sul fiume. Cena di gala." },
      { day: 15, title: "Bucharest - Sbarco", description: "Sbarco e trasferimento a Bucharest. Visita della città e volo di rientro." },
    ],
    included: [
      "14 notti in cabina esterna con balcone",
      "Pensione completa con bevande ai pasti",
      "Tutte le escursioni del programma",
      "Conferenze a bordo",
      "Intrattenimento serale",
      "Wi-Fi a bordo",
      "Tasse portuali",
      "Assicurazione",
    ],
    excluded: [
      "Voli internazionali",
      "Trasferimenti aeroportuali",
      "Escursioni facoltative",
      "Bevande premium",
      "Trattamenti spa",
      "Mance",
    ],
    deckPlan: [
      { name: "Sun Deck", description: "Solarium e area panoramica", image: "/images/navi/fidelio-deck-sun.jpg" },
      { name: "Upper Deck", description: "Suite e cabine premium", image: "/images/navi/fidelio-deck-upper.jpg" },
      { name: "Main Deck", description: "Cabine standard e ristorante", image: "/images/navi/fidelio-deck-main.jpg" },
      { name: "Lower Deck", description: "Cabine economy e bar", image: "/images/navi/fidelio-deck-lower.jpg" },
    ],
    departures: [
      { date: "2026-05-24", price: 3490, availability: "disponibile" },
      { date: "2026-07-05", price: 3690, availability: "disponibile" },
      { date: "2026-09-06", price: 3490, availability: "disponibile" },
    ],
  },
];

// --------------------------------------------------
// Ships / Fleet
// --------------------------------------------------

export const ships: Ship[] = [
  {
    slug: "ms-river-sapphire",
    name: "MS River Sapphire 5*",
    image: "/images/navi/ms-river-sapphire.jpg",
    capacity: 140,
    year: 2019,
    description:
      "Nave a 5 stelle di ultima generazione con suite panoramiche, spa e ristorante gourmet. Il fiore all'occhiello della flotta per le crociere sul Reno e sul Danubio.",
    decks: [
      { name: "Diamond Deck", cabins: 12, description: "Suite con balcone privato e jacuzzi" },
      { name: "Sapphire Deck", cabins: 24, description: "Cabine deluxe con balcone francese" },
      { name: "Ruby Deck", cabins: 28, description: "Cabine standard con finestra panoramica" },
    ],
  },
  {
    slug: "ms-river-diamond",
    name: "MS River Diamond",
    image: "/images/navi/ms-river-diamond.jpg",
    capacity: 130,
    year: 2017,
    description:
      "Eleganza e comfort sulle acque del Danubio. La MS River Diamond offre cabine spaziose, una cucina eccellente e un servizio impeccabile.",
    decks: [
      { name: "Upper Deck", cabins: 20, description: "Cabine con balcone e suite" },
      { name: "Main Deck", cabins: 24, description: "Cabine con finestra panoramica" },
      { name: "Lower Deck", cabins: 20, description: "Cabine con finestra" },
    ],
  },
  {
    slug: "ms-monarch-countess",
    name: "MS Monarch Countess",
    image: "/images/navi/ms-monarch-countess.jpg",
    capacity: 120,
    year: 2015,
    description:
      "Nave dal design classico ed elegante, perfetta per le crociere sulla Senna e sulla Mosella. Atmosfera intima e servizio personalizzato.",
    decks: [
      { name: "Promenade Deck", cabins: 18, description: "Cabine superior con balcone" },
      { name: "Main Deck", cabins: 22, description: "Cabine standard con finestra" },
      { name: "Lower Deck", cabins: 18, description: "Cabine economy" },
    ],
  },
  {
    slug: "ms-crucevita",
    name: "MS Crucevita",
    image: "/images/navi/ms-crucevita.jpg",
    capacity: 110,
    year: 2014,
    description:
      "Nave accogliente e funzionale, ideale per scoprire i fiumi europei in un'atmosfera familiare. Ristorante panoramico e ampio solarium.",
    decks: [
      { name: "Upper Deck", cabins: 16, description: "Cabine con balcone" },
      { name: "Main Deck", cabins: 20, description: "Cabine con finestra" },
      { name: "Lower Deck", cabins: 16, description: "Cabine standard" },
    ],
  },
  {
    slug: "ms-douro-cruiser",
    name: "MS Douro Cruiser",
    image: "/images/navi/ms-douro-cruiser.jpg",
    capacity: 130,
    year: 2018,
    description:
      "Progettata specificamente per la navigazione sul Douro, con un pescaggio ridotto e cabine tutte con vista fiume. Piscina sul ponte superiore e bar panoramico.",
    decks: [
      { name: "Sun Deck", cabins: 8, description: "Suite con balcone e piscina" },
      { name: "Upper Deck", cabins: 22, description: "Cabine deluxe con balcone francese" },
      { name: "Main Deck", cabins: 26, description: "Cabine con finestra panoramica" },
    ],
  },
  {
    slug: "ms-albertina",
    name: "MS Albertina",
    image: "/images/navi/ms-albertina.jpg",
    capacity: 150,
    year: 2020,
    description:
      "Una delle navi più nuove della flotta, la MS Albertina offre tecnologia all'avanguardia, cabine ampie con balcone e un centro benessere completo.",
    decks: [
      { name: "Sky Deck", cabins: 10, description: "Suite panoramiche premium" },
      { name: "Upper Deck", cabins: 26, description: "Cabine con balcone" },
      { name: "Main Deck", cabins: 28, description: "Cabine con finestra" },
      { name: "Lower Deck", cabins: 12, description: "Cabine interne" },
    ],
  },
  {
    slug: "ms-vetaris",
    name: "MS Vetaris",
    image: "/images/navi/ms-vetaris.jpg",
    capacity: 100,
    year: 2016,
    description:
      "Nave boutique dall'atmosfera esclusiva. Con sole 50 cabine, la MS Vetaris garantisce un'esperienza intima e personalizzata sullo Schelda e sulla Senna.",
    decks: [
      { name: "Upper Deck", cabins: 16, description: "Cabine deluxe con terrazzino" },
      { name: "Main Deck", cabins: 18, description: "Cabine con finestra" },
      { name: "Lower Deck", cabins: 16, description: "Cabine standard" },
    ],
  },
  {
    slug: "ms-fidelio",
    name: "MS Fidelio",
    image: "/images/navi/ms-fidelio.jpg",
    capacity: 160,
    year: 2021,
    description:
      "L'ammiraglia della flotta: la MS Fidelio combina dimensioni generose con un'eleganza senza tempo. Specializzata nelle grandi crociere sul Danubio da Vienna a Bucharest.",
    decks: [
      { name: "Sun Deck", cabins: 8, description: "Suite presidenziali con balcone panoramico" },
      { name: "Upper Deck", cabins: 28, description: "Cabine deluxe con balcone privato" },
      { name: "Main Deck", cabins: 32, description: "Cabine con balcone francese" },
      { name: "Lower Deck", cabins: 16, description: "Cabine con finestra" },
    ],
  },
  {
    slug: "ms-envss-splendor",
    name: "MS Envss Splendor",
    image: "/images/navi/ms-envss-splendor.jpg",
    capacity: 135,
    year: 2022,
    description:
      "L'ultima arrivata nella flotta, la MS Envss Splendor rappresenta l'eccellenza della crociera fluviale con design contemporaneo, efficienza energetica e il massimo del comfort.",
    decks: [
      { name: "Sky Deck", cabins: 6, description: "Owner's Suite e Penthouse" },
      { name: "Upper Deck", cabins: 24, description: "Cabine con balcone panoramico" },
      { name: "Main Deck", cabins: 26, description: "Cabine con balcone francese" },
      { name: "Lower Deck", cabins: 14, description: "Cabine con finestra" },
    ],
  },
];

// --------------------------------------------------
// Blog Posts
// --------------------------------------------------

export const blogPosts: BlogPost[] = [
  {
    slug: "in-viaggio-tra-le-polis-antica-grecia",
    title: "In viaggio tra le Polis dell'Antica Grecia",
    category: "Storia e Cultura",
    image: "/images/blog/polis-grecia.jpg",
    excerpt:
      "Un affascinante percorso attraverso le città-stato dell'antica Grecia, da Atene a Sparta, da Corinto a Delfi, sulle tracce della culla della civiltà occidentale.",
    date: "2025-09-15",
    content:
      "L'antica Grecia non era un unico stato, ma un mosaico di città-stato indipendenti, le polis, ciascuna con la propria identità, le proprie leggi e i propri costumi. Viaggiare oggi tra i resti di queste città significa immergersi in un mondo che ha gettato le fondamenta della nostra civiltà.\n\nAtene, la più celebre tra le polis, conserva sull'Acropoli il Partenone, simbolo eterno della democrazia e dell'arte classica. Passeggiando nell'Agorà, il cuore pulsante della vita pubblica, si può quasi sentire l'eco dei discorsi di Pericle e delle lezioni di Socrate.\n\nSparta, la rivale di Atene, offre un'esperienza completamente diversa. Qui la vita era dedicata alla disciplina militare e all'austerità. Le rovine sono meno imponenti, ma il paesaggio laconico racconta una storia di forza e determinazione.\n\nCorinto, ponte tra il Peloponneso e la Grecia continentale, era un centro commerciale e culturale di straordinaria importanza. Il Tempio di Apollo e la Fontana di Pirene testimoniano la ricchezza di questa città.\n\nDelfi, l'ombelico del mondo per gli antichi greci, conserva il celebre Oracolo e il Teatro, incastonati in un paesaggio montano di rara bellezza. Visitare Delfi al tramonto rimane una delle esperienze più emozionanti di un viaggio in Grecia.",
  },
  {
    slug: "antica-troia-tra-mito-ed-archeologia",
    title: "Antica Troia: tra mito ed archeologia",
    category: "Archeologia",
    image: "/images/blog/troia.jpg",
    excerpt:
      "Sulla costa turca dell'Egeo, le rovine di Troia raccontano una storia che va ben oltre il mito di Omero. Un viaggio tra nove città sovrapposte e millenni di storia.",
    date: "2025-08-22",
    content:
      "Per secoli la Troia di Omero è stata considerata pura leggenda. Poi, nel 1870, Heinrich Schliemann iniziò a scavare sulla collina di Hissarlik, nella Turchia nord-occidentale, e il mito divenne realtà.\n\nOggi il sito archeologico di Troia, patrimonio UNESCO, rivela non una ma nove città sovrapposte, costruite e distrutte nell'arco di oltre 4.000 anni. Dalla Troia I dell'Età del Bronzo Antico (3000 a.C.) alla Troia IX romana, ogni strato racconta un capitolo diverso della storia umana.\n\nLa Troia che più affascina i visitatori è la Troia VII, identificata dalla maggior parte degli archeologi come la città dell'Iliade. I segni di incendio e distruzione violenta risalenti al 1180 a.C. circa sembrano confermare il racconto omerico di una guerra devastante.\n\nIl museo del sito, inaugurato nel 2018, offre una presentazione moderna e coinvolgente dei reperti, con ricostruzioni virtuali che permettono di visualizzare come appariva la città nei suoi diversi periodi storici.\n\nVisitare Troia con un archeologo, come nei nostri tour speciali in Turchia, trasforma una semplice visita in un viaggio nel tempo, dove ogni pietra ha una storia da raccontare.",
  },
  {
    slug: "petra-luce-tra-kanyon-color-rosa",
    title: "Petra: una luce tra kanyon color rosa",
    category: "Meraviglie del Mondo",
    image: "/images/blog/petra.jpg",
    excerpt:
      "La città rosa dei Nabatei, scolpita nella roccia del deserto giordano, continua a stupire i viaggiatori di tutto il mondo con la sua bellezza senza tempo.",
    date: "2025-07-10",
    content:
      "Non esiste preparazione che tenga: quando si percorre il Siq, lo stretto canyon che conduce al cuore di Petra, e si intravede per la prima volta il Tesoro (Al-Khazneh) illuminato dalla luce del mattino, l'emozione è travolgente.\n\nPetra, la capitale del regno nabateo, fu scavata nella roccia arenaria più di 2.000 anni fa. I Nabatei, popolo di mercanti e ingegneri idraulici, crearono una città che poteva ospitare fino a 30.000 abitanti nel cuore del deserto, grazie a un sofisticato sistema di canalizzazione dell'acqua.\n\nOltre al celebre Tesoro, Petra custodisce centinaia di tombe monumentali, un teatro romano da 8.000 posti, templi e l'imponente Monastero (Ad-Deir), raggiungibile dopo una scalinata di 800 gradini che ripaga la fatica con una vista mozzafiato.\n\nIl momento migliore per visitare Petra è all'alba, quando la luce radente dipinge la roccia di sfumature che vanno dal rosa al rosso, dall'arancione al viola. Non a caso Petra è soprannominata la Città Rosa.\n\nPetra by Night, con il Siq illuminato da migliaia di candele, offre un'esperienza mistica e indimenticabile, accompagnata dalla musica tradizionale beduina sotto un cielo stellato.",
  },
  {
    slug: "cappadocia-rocce-mozzafiato-viaggi-nel-tempo",
    title: "Cappadocia: tra rocce mozzafiato e viaggi nel tempo",
    category: "Turchia",
    image: "/images/blog/cappadocia.jpg",
    excerpt:
      "I camini delle fate, le chiese rupestri e le città sotterranee della Cappadocia offrono un'esperienza unica al mondo, sospesa tra natura e storia millenaria.",
    date: "2025-06-05",
    content:
      "La Cappadocia è uno di quei luoghi che sembrano appartenere a un altro pianeta. Le formazioni rocciose scolpite da milioni di anni di erosione, i celebri camini delle fate e le valli colorate creano un paesaggio surreale che lascia senza fiato.\n\nMa la Cappadocia non è solo natura. Per millenni, questo territorio è stato plasmato dall'uomo: le comunità cristiane dei primi secoli scavarono nella tenera roccia vulcanica chiese, monasteri e intere città sotterranee per sfuggire alle persecuzioni.\n\nIl Museo all'Aperto di Goreme, patrimonio UNESCO, conserva chiese rupestri con affreschi bizantini straordinariamente ben conservati, risalenti al X-XII secolo. La Chiesa Buia (Karanlik Kilise) custodisce colori così vividi da sembrare dipinti ieri.\n\nLe città sotterranee di Derinkuyu e Kaymakli sono un'altra meraviglia: veri e propri complessi su più livelli che potevano ospitare migliaia di persone, con ventilazione naturale, pozzi e persino chiese.\n\nL'esperienza più iconica della Cappadocia resta il volo in mongolfiera all'alba: centinaia di palloni colorati che si alzano contemporaneamente sopra le valli, mentre il sole tinge di rosa le formazioni rocciose, creano uno spettacolo che si imprime nella memoria per sempre.",
  },
  {
    slug: "uzbekistan-dorato",
    title: "Uzbekistan Dorato",
    category: "Asia Centrale",
    image: "/images/blog/uzbekistan.jpg",
    excerpt:
      "Samarcanda, Bukhara e Khiva: le leggendarie città della Via della Seta svelano un patrimonio architettonico e culturale di inestimabile bellezza.",
    date: "2025-05-18",
    content:
      "L'Uzbekistan è il cuore pulsante della Via della Seta, la rete di rotte commerciali che per secoli collegava l'Oriente all'Occidente. Le sue città custodiscono un patrimonio architettonico che toglie il fiato.\n\nSamarcanda, la città di Tamerlano, è dominata dalla Piazza Registan, considerata una delle piazze più belle del mondo. Le tre madrase che la circondano, con le loro facciate ricoperte di maioliche azzurre e dorate, rappresentano il vertice dell'architettura timuride.\n\nBukhara, con i suoi 140 monumenti protetti, è un museo a cielo aperto. Il complesso Poi-Kalyan, con il suo minareto alto 47 metri che servì da faro per le carovane, la Moschea Bolo-Hauz e la Fortezza dell'Ark raccontano oltre mille anni di storia.\n\nKhiva, la città-museo completamente restaurata, trasporta il visitatore in un'altra epoca. Passeggiare tra le mura della città interna (Ichan-Kala) al tramonto, quando la luce dorata accarezza i minareti turchesi, è un'esperienza da Mille e Una Notte.\n\nL'Uzbekistan sorprende anche per l'ospitalità della sua gente, per una cucina ricca e saporita (il plov, piatto nazionale, è una delizia) e per i bazar ancora vivi e autentici dove il tempo sembra essersi fermato.",
  },
];

// --------------------------------------------------
// Cataloghi
// --------------------------------------------------

export const cataloghi: Catalogo[] = [
  {
    slug: "catalogo-crociere-fluviali-2025-2026",
    title: "Catalogo Crociere Fluviali 2025/2026",
    image: "/images/cataloghi/crociere-fluviali.jpg",
    pdfUrl: "/cataloghi/crociere-fluviali-2025-2026.pdf",
    description:
      "Sfoglia il nostro catalogo completo delle crociere fluviali: Danubio, Douro, Reno, Mosella, Senna e Schelda. Itinerari, prezzi, date di partenza e dettagli delle navi.",
  },
  {
    slug: "catalogo-grandi-piccoli-itinerari-2025-2026",
    title: "Catalogo Grandi Piccoli Itinerari 2025/2026",
    image: "/images/cataloghi/grandi-piccoli-itinerari.jpg",
    pdfUrl: "/cataloghi/grandi-piccoli-itinerari-2025-2026.pdf",
    description:
      "Tutti i nostri tour culturali e avventure nel mondo: Asia, America Latina, Africa, Europa e molto altro. Itinerari dettagliati con accompagnatori esperti.",
  },
];

// --------------------------------------------------
// Navigation
// --------------------------------------------------

export const navigationItems: NavItem[] = [
  {
    label: "Destinazioni",
    href: "/destinazioni",
    submenu: {
      Europa: [
        { label: "Spagna", href: "/destinazioni/spagna" },
        { label: "Portogallo", href: "/destinazioni/portogallo" },
        { label: "Polonia", href: "/destinazioni/polonia" },
        { label: "Turchia", href: "/destinazioni/turchia" },
      ],
      "America Latina": [
        { label: "Bolivia", href: "/destinazioni/bolivia" },
        { label: "Uruguay", href: "/destinazioni/uruguay" },
        { label: "Peru", href: "/destinazioni/peru" },
        { label: "Brasile", href: "/destinazioni/brasile" },
        { label: "Cile", href: "/destinazioni/cile" },
        { label: "Argentina", href: "/destinazioni/argentina" },
      ],
      "Asia/Russia": [
        { label: "India", href: "/destinazioni/india" },
        { label: "Nepal", href: "/destinazioni/nepal" },
        { label: "Georgia", href: "/destinazioni/georgia" },
        { label: "Kirghizistan", href: "/destinazioni/kirghizistan" },
        { label: "Mongolia", href: "/destinazioni/mongolia" },
        { label: "Filippine", href: "/destinazioni/filippine" },
        { label: "Giappone", href: "/destinazioni/giappone" },
        { label: "Armenia", href: "/destinazioni/armenia" },
        { label: "Giordania", href: "/destinazioni/giordania" },
        { label: "Azerbaijan", href: "/destinazioni/azerbaijan" },
        { label: "Russia", href: "/destinazioni/russia" },
        { label: "Uzbekistan", href: "/destinazioni/uzbekistan" },
      ],
      Africa: [
        { label: "Tunisia", href: "/destinazioni/tunisia" },
        { label: "Egitto", href: "/destinazioni/egitto" },
        { label: "Marocco", href: "/destinazioni/marocco" },
      ],
      "Percorsi Fluviali": [
        { label: "Senna", href: "/destinazioni/senna" },
        { label: "Danubio", href: "/destinazioni/danubio" },
        { label: "Reno", href: "/destinazioni/reno" },
        { label: "Mosella", href: "/destinazioni/mosella" },
        { label: "Douro", href: "/destinazioni/douro" },
        { label: "Schelda", href: "/destinazioni/schelda" },
      ],
    },
  },
  {
    label: "Crociere Fluviali",
    href: "/crociere",
  },
  {
    label: "I Nostri Tour",
    href: "/tours",
  },
  {
    label: "Flotta",
    href: "/flotta",
  },
  {
    label: "Calendario partenze",
    href: "/calendario-partenze",
  },
  {
    label: "Sfoglia Cataloghi",
    href: "/cataloghi",
  },
  {
    label: "Blog",
    href: "/blog",
  },
];

export const topBarLinks: TopBarLink[] = [
  { label: "info@mishatravel.com", href: "mailto:info@mishatravel.com", icon: "mail" },
  { label: "Contatti", href: "/contatti" },
  { label: "Diventa Partner", href: "/diventa-partner" },
  { label: "Trova Agenzia", href: "/trova-agenzia" },
  { label: "Login", href: "/login", icon: "user" },
];

// --------------------------------------------------
// Footer
// --------------------------------------------------

export const footerContactColumns: FooterColumn[] = [
  {
    title: "I nostri contatti",
    lines: [
      "Piazza Grimaldi 1-3",
      "16124 Genova",
      "Tel: +39 010 8994000",
      "info@mishatravel.com",
    ],
  },
  {
    title: "Reparto Agenzia",
    lines: [
      "Piazza Grimaldi 1-3",
      "16124 Genova",
      "Tel: +39 010 8994000",
      "booking@mishatravel.com",
    ],
  },
  {
    title: "Ufficio Commerciale",
    lines: [
      "Piazza Grimaldi 1-3",
      "16124 Genova",
      "Tel: +39 010 8994000",
      "agenzia@mishatravel.com",
    ],
  },
  {
    title: "Ufficio Crociere",
    lines: [
      "Piazza Grimaldi 1-3",
      "16124 Genova",
      "Tel: +39 010 8994000",
      "programmazione@mishatravel.com",
    ],
  },
];

export const footerLinkSections: FooterLinkSection[] = [
  {
    title: "Link Rapidi",
    links: [
      { label: "Home", href: "/" },
      { label: "Chi Siamo", href: "/chi-siamo" },
      { label: "Destinazioni", href: "/destinazioni" },
      { label: "Crociere Fluviali", href: "/crociere" },
      { label: "I Nostri Tour", href: "/tours" },
      { label: "Calendario Partenze", href: "/calendario-partenze" },
      { label: "Sfoglia Cataloghi", href: "/cataloghi" },
      { label: "Blog", href: "/blog" },
      { label: "Contatti", href: "/contatti" },
    ],
  },
  {
    title: "Pagine Legali",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Termini e Condizioni", href: "/termini-condizioni" },
      { label: "Condizioni Generali di Vendita", href: "/condizioni-vendita" },
      { label: "Informativa GDPR", href: "/gdpr" },
      { label: "Cancellazioni e Penali", href: "/cancellazioni-e-penali" },
      { label: "Fondo di Garanzia", href: "/fondo-di-garanzia" },
      { label: "Reclami", href: "/reclami" },
    ],
  },
  {
    title: "Info Utili",
    links: [
      { label: "Come Prenotare", href: "/come-prenotare-guida-completa" },
      { label: "Coperture Assicurative", href: "/coperture-assicurative" },
      { label: "Documenti di Viaggio", href: "/documenti-di-viaggio" },
      { label: "FAQ", href: "/faq" },
      { label: "Contatti", href: "/contatti" },
    ],
  },
  {
    title: "Area Agenzie",
    links: [
      { label: "Guida per le Agenzie", href: "/guida-agenzie" },
      { label: "Diventa Partner", href: "/diventa-partner" },
      { label: "Login Agenzie", href: "/login" },
      { label: "Registrati", href: "/registrazione" },
      { label: "Trova Agenzia", href: "/trova-agenzia" },
    ],
  },
];

// --------------------------------------------------
// Compatibility aliases (used by layout components)
// --------------------------------------------------

export const mainNavItems = navigationItems;

export const destinationsByArea: Record<MacroArea, Destination[]> =
  getDestinationsByMacroArea();

export const allDestinations = destinations;

export const footerContacts = footerContactColumns.map((col) => ({
  title: col.title,
  address:
    col.lines.find((l) => l.includes("Piazza") || l.includes("Genova")) ?? "",
  phones: col.lines.filter((l) => l.startsWith("Tel:")).map((l) => l.replace("Tel: ", "")),
  emails: col.lines.filter((l) => l.includes("@")),
}));

export const footerLinkRapidi =
  footerLinkSections.find((s) => s.title === "Link Rapidi")?.links ?? [];

export const footerPagineLegali =
  footerLinkSections.find((s) => s.title === "Pagine Legali")?.links ?? [];

export const footerInfoUtili =
  footerLinkSections.find((s) => s.title === "Info Utili")?.links ?? [];

export const footerAreaAgenzie =
  footerLinkSections.find((s) => s.title === "Area Agenzie")?.links ?? [];

// --------------------------------------------------
// Helper functions for pages
// --------------------------------------------------

export function getTourBySlug(slug: string): Tour | undefined {
  return tours.find((t) => t.slug === slug);
}

export function getCruiseBySlug(slug: string): Cruise | undefined {
  return cruises.find((c) => c.slug === slug);
}

export function getShipBySlug(slug: string): Ship | undefined {
  return ships.find((s) => s.slug === slug);
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((b) => b.slug === slug);
}

export function getToursForDestination(destSlug: string): Tour[] {
  return tours.filter((t) => t.destinationSlug === destSlug);
}

export function getTourCountPerDestination(): Record<string, number> {
  const counts: Record<string, number> = {};
  tours.forEach((t) => {
    counts[t.destinationSlug] = (counts[t.destinationSlug] || 0) + 1;
  });
  cruises.forEach((c) => {
    const riverSlug = c.river.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    counts[riverSlug] = (counts[riverSlug] || 0) + 1;
  });
  return counts;
}

export function getCruisesForShip(shipSlug: string): Cruise[] {
  return cruises.filter(
    (c) => c.ship.toLowerCase().replace(/[\s*]+/g, "-") === shipSlug ||
      c.ship.toLowerCase().includes(shipSlug.replace("ms-", "").replace(/-/g, " ")),
  );
}

export function getRelatedTours(currentSlug: string, limit = 3): Tour[] {
  const current = getTourBySlug(currentSlug);
  if (!current) return tours.slice(0, limit);
  const sameDest = tours.filter(
    (t) => t.destinationSlug === current.destinationSlug && t.slug !== currentSlug,
  );
  const others = tours.filter(
    (t) => t.destinationSlug !== current.destinationSlug && t.slug !== currentSlug,
  );
  return [...sameDest, ...others].slice(0, limit);
}

export function getRelatedCruises(currentSlug: string, limit = 3): Cruise[] {
  const current = getCruiseBySlug(currentSlug);
  if (!current) return cruises.slice(0, limit);
  const sameRiver = cruises.filter(
    (c) => c.river === current.river && c.slug !== currentSlug,
  );
  const others = cruises.filter(
    (c) => c.river !== current.river && c.slug !== currentSlug,
  );
  return [...sameRiver, ...others].slice(0, limit);
}

export function getAllDepartures() {
  const tourDeps = tours.flatMap((t) =>
    t.departures.map((d) => ({
      ...d,
      type: "tour" as const,
      title: t.title,
      slug: t.slug,
      destination: t.destination,
      duration: t.duration,
      basePath: "/tours",
    })),
  );
  const cruiseDeps = cruises.flatMap((c) =>
    c.departures.map((d) => ({
      ...d,
      type: "crociera" as const,
      title: c.title,
      slug: c.slug,
      destination: c.river,
      duration: c.duration,
      basePath: "/crociere",
    })),
  );
  return [...tourDeps, ...cruiseDeps];
}
