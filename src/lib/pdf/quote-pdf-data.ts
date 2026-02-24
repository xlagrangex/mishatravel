import { createAdminClient } from "@/lib/supabase/admin";
import { getTourById } from "@/lib/supabase/queries/tours";
import { getCruiseById } from "@/lib/supabase/queries/cruises";
import { getShipById } from "@/lib/supabase/queries/ships";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgencyInfo {
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  province: string | null;
}

export interface QuoteOfferInfo {
  total_price: number | null;
  conditions: string | null;
  payment_terms: string | null;
  offer_expiry: string | null;
  notes: string | null;
}

export interface LocationPoint {
  nome: string;
  coordinate: string | null;
  sort_order: number;
}

export interface ItineraryDayInfo {
  numero_giorno: string;
  localita: string;
  descrizione: string;
  date: string | null;
}

export interface HotelInfo {
  localita: string;
  nome_albergo: string;
  stelle: number;
}

export interface DepartureInfo {
  id: string;
  from_city: string;
  data_partenza: string;
  prices: { label: string; value: string | number | null }[];
}

export interface SupplementInfo {
  titolo: string;
  prezzo: string | null;
}

export interface InclusionInfo {
  titolo: string;
  is_included: boolean;
}

export interface ExcursionInfo {
  titolo: string;
  descrizione: string | null;
  prezzo: number | null;
}

export interface ShipInfo {
  name: string;
  slug: string | null;
  cover_image_url: string | null;
  description: string | null;
  services: string[];
  activities: string[];
}

export interface CabinDetailInfo {
  titolo: string;
  immagine_url: string | null;
  tipologia: string | null;
  descrizione: string | null;
}

export interface QuotePdfPayload {
  quoteId: string;
  quoteCreatedAt: string;
  requestType: "tour" | "cruise";
  status: string;
  participantsAdults: number;
  participantsChildren: number;
  notes: string | null;

  agency: AgencyInfo;
  offer: QuoteOfferInfo | null;

  // Selected departure
  selectedDepartureDate: string | null;
  selectedDepartureCity: string | null;

  // Product details
  title: string;
  slug: string;
  coverImageUrl: string | null;
  destinationName: string | null;
  durataNotti: string | null;
  pensione: string[];
  tipoVoli: string | null;
  noteImportanti: string | null;

  // Related data
  locations: LocationPoint[];
  itinerary: ItineraryDayInfo[];
  hotels: HotelInfo[];
  departures: DepartureInfo[];
  supplements: SupplementInfo[];
  inclusions: InclusionInfo[];
  terms: string[];
  penalties: string[];
  excursions: ExcursionInfo[];

  // Cruise-specific
  ship: ShipInfo | null;
  shipCabinDetails: CabinDetailInfo[];
  cabinType: string | null;
  numCabins: number | null;
  deckLabels: { primo: string | null; secondo: string | null; terzo: string | null } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Given a selectedDepartureDate and a numero_giorno string (e.g. "1", "2", "3-4"),
 * calculate the actual calendar date for that day.
 */
function calculateDayDate(
  departureDate: string | null,
  numeroGiorno: string
): string | null {
  if (!departureDate) return null;
  const firstDay = parseInt(numeroGiorno.split("-")[0].replace(/\D/g, ""), 10);
  if (isNaN(firstDay) || firstDay < 1) return null;
  const base = new Date(departureDate + "T00:00:00");
  base.setDate(base.getDate() + firstDay - 1);
  return base.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Main fetch function
// ---------------------------------------------------------------------------

export async function getQuotePdfData(
  quoteId: string,
  agencyId: string | null
): Promise<QuotePdfPayload | null> {
  const admin = createAdminClient();

  // 1. Fetch quote with agency + basic tour/cruise info
  let query = admin
    .from("quote_requests")
    .select(
      `
      *,
      agency:agencies!agency_id(business_name, contact_name, phone, email, city, province),
      tour:tours!tour_id(id, title),
      cruise:cruises!cruise_id(id, title),
      offers:quote_offers(*)
    `
    )
    .eq("id", quoteId);

  if (agencyId) {
    query = query.eq("agency_id", agencyId);
  }

  const { data: quote, error } = await query.single();

  if (error || !quote) return null;

  const agency = quote.agency as any;
  const agencyInfo: AgencyInfo = {
    business_name: agency?.business_name ?? "Agenzia",
    contact_name: agency?.contact_name ?? null,
    phone: agency?.phone ?? null,
    email: agency?.email ?? null,
    city: agency?.city ?? null,
    province: agency?.province ?? null,
  };

  // Latest offer
  const offers = (quote.offers as any[]) ?? [];
  const latestOffer =
    offers.length > 0
      ? offers.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;

  const offerInfo: QuoteOfferInfo | null = latestOffer
    ? {
        total_price: latestOffer.total_price,
        conditions: latestOffer.conditions,
        payment_terms: latestOffer.payment_terms,
        offer_expiry: latestOffer.offer_expiry,
        notes: latestOffer.notes,
      }
    : null;

  // 2. Resolve selected departure date
  const isTour = quote.request_type === "tour";
  let selectedDepartureDate: string | null = null;
  let selectedDepartureCity: string | null = null;

  if (quote.departure_id) {
    const table = isTour ? "tour_departures" : "cruise_departures";
    const { data: dep } = await admin
      .from(table)
      .select("data_partenza, from_city")
      .eq("id", quote.departure_id)
      .single();
    if (dep) {
      selectedDepartureDate = dep.data_partenza ?? null;
      selectedDepartureCity = dep.from_city ?? null;
    }
  }

  // 3. Fetch full product data
  const tourRef = quote.tour as any;
  const cruiseRef = quote.cruise as any;

  if (isTour && tourRef?.id) {
    const tour = await getTourById(tourRef.id);
    if (!tour) return null;

    return {
      quoteId,
      quoteCreatedAt: quote.created_at,
      requestType: "tour",
      status: quote.status,
      participantsAdults: quote.participants_adults ?? 0,
      participantsChildren: quote.participants_children ?? 0,
      notes: quote.notes,
      agency: agencyInfo,
      offer: offerInfo,
      selectedDepartureDate,
      selectedDepartureCity,
      title: tour.title,
      slug: tour.slug,
      coverImageUrl: tour.cover_image_url,
      destinationName: tour.destination?.name ?? null,
      durataNotti: tour.durata_notti,
      pensione: tour.pensione ?? [],
      tipoVoli: tour.tipo_voli,
      noteImportanti: tour.note_importanti,
      locations: (tour.locations ?? []).map((l: any) => ({
        nome: l.nome,
        coordinate: l.coordinate,
        sort_order: l.sort_order ?? 0,
      })),
      itinerary: (tour.itinerary_days ?? []).map((d: any) => ({
        numero_giorno: d.numero_giorno,
        localita: d.localita,
        descrizione: d.descrizione,
        date: calculateDayDate(selectedDepartureDate, d.numero_giorno),
      })),
      hotels: (tour.hotels ?? []).map((h: any) => ({
        localita: h.localita,
        nome_albergo: h.nome_albergo,
        stelle: h.stelle,
      })),
      departures: (tour.departures ?? []).map((d: any) => ({
        id: d.id,
        from_city: d.from_city,
        data_partenza: d.data_partenza,
        prices: [
          { label: tour.price_label_1 ?? "Comfort", value: d.prezzo_3_stelle },
          { label: tour.price_label_2 ?? "Deluxe", value: d.prezzo_4_stelle },
        ].filter((p) => p.value != null),
      })),
      supplements: (tour.supplements ?? []).map((s: any) => ({
        titolo: s.titolo,
        prezzo: s.prezzo,
      })),
      inclusions: (tour.inclusions ?? []).map((i: any) => ({
        titolo: i.titolo,
        is_included: i.is_included,
      })),
      terms: (tour.terms ?? []).map((t: any) => t.titolo),
      penalties: (tour.penalties ?? []).map((p: any) => p.titolo),
      excursions: (tour.optional_excursions ?? []).map((e: any) => ({
        titolo: e.titolo,
        descrizione: e.descrizione,
        prezzo: e.prezzo,
      })),
      ship: null,
      shipCabinDetails: [],
      cabinType: null,
      numCabins: null,
      deckLabels: null,
    };
  }

  // Cruise
  if (!isTour && cruiseRef?.id) {
    const cruise = await getCruiseById(cruiseRef.id);
    if (!cruise) return null;

    // Fetch full ship details
    let shipDescription: string | null = null;
    let shipServices: string[] = [];
    let shipActivities: string[] = [];
    let shipCabinDetails: CabinDetailInfo[] = [];

    if (cruise.ship?.id) {
      try {
        const fullShip = await getShipById(cruise.ship.id);
        if (fullShip) {
          shipDescription = fullShip.description ?? null;
          shipServices = (fullShip.services ?? []).map((s: any) => s.testo);
          shipActivities = (fullShip.activities ?? []).map((a: any) => a.attivita);
          shipCabinDetails = (fullShip.cabin_details ?? []).map((c: any) => ({
            titolo: c.titolo,
            immagine_url: c.immagine_url,
            tipologia: c.tipologia,
            descrizione: c.descrizione,
          }));
        }
      } catch {
        // Non-blocking: ship details are optional
      }
    }

    return {
      quoteId,
      quoteCreatedAt: quote.created_at,
      requestType: "cruise",
      status: quote.status,
      participantsAdults: quote.participants_adults ?? 0,
      participantsChildren: quote.participants_children ?? 0,
      notes: quote.notes,
      agency: agencyInfo,
      offer: offerInfo,
      selectedDepartureDate,
      selectedDepartureCity,
      title: cruise.title,
      slug: cruise.slug,
      coverImageUrl: cruise.cover_image_url,
      destinationName: cruise.destination?.name ?? null,
      durataNotti: cruise.durata_notti,
      pensione: cruise.pensione ?? [],
      tipoVoli: cruise.tipo_voli,
      noteImportanti: cruise.note_importanti,
      locations: (cruise.locations ?? []).map((l: any) => ({
        nome: l.nome,
        coordinate: l.coordinate,
        sort_order: l.sort_order ?? 0,
      })),
      itinerary: (cruise.itinerary_days ?? []).map((d: any) => ({
        numero_giorno: d.numero_giorno,
        localita: d.localita,
        descrizione: d.descrizione,
        date: calculateDayDate(selectedDepartureDate, d.numero_giorno),
      })),
      hotels: [],
      departures: (cruise.departures ?? []).map((d: any) => {
        const prices: { label: string; value: string | number | null }[] = [];
        if (d.prezzo_main_deck != null)
          prices.push({ label: cruise.etichetta_primo_deck ?? "Main Deck", value: d.prezzo_main_deck });
        if (d.prezzo_middle_deck != null)
          prices.push({ label: cruise.etichetta_secondo_deck ?? "Middle Deck", value: d.prezzo_middle_deck });
        if (d.prezzo_superior_deck != null)
          prices.push({ label: cruise.etichetta_terzo_deck ?? "Superior Deck", value: d.prezzo_superior_deck });
        return {
          id: d.id,
          from_city: d.from_city,
          data_partenza: d.data_partenza,
          prices,
        };
      }),
      supplements: (cruise.supplements ?? []).map((s: any) => ({
        titolo: s.titolo,
        prezzo: s.prezzo,
      })),
      inclusions: (cruise.inclusions ?? []).map((i: any) => ({
        titolo: i.titolo,
        is_included: i.is_included,
      })),
      terms: (cruise.terms ?? []).map((t: any) => t.titolo),
      penalties: (cruise.penalties ?? []).map((p: any) => p.titolo),
      excursions: [],
      ship: cruise.ship
        ? {
            name: cruise.ship.name,
            slug: cruise.ship.slug ?? null,
            cover_image_url: cruise.ship.cover_image_url ?? null,
            description: shipDescription,
            services: shipServices,
            activities: shipActivities,
          }
        : null,
      shipCabinDetails,
      cabinType: quote.cabin_type,
      numCabins: quote.num_cabins,
      deckLabels: {
        primo: cruise.etichetta_primo_deck,
        secondo: cruise.etichetta_secondo_deck,
        terzo: cruise.etichetta_terzo_deck,
      },
    };
  }

  return null;
}
