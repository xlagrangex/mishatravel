import { createAdminClient } from "@/lib/supabase/admin";
import { getTourById } from "@/lib/supabase/queries/tours";
import { getCruiseById } from "@/lib/supabase/queries/cruises";

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
}

export interface HotelInfo {
  localita: string;
  nome_albergo: string;
  stelle: number;
}

export interface DepartureInfo {
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
  cover_image_url: string | null;
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

  // Product details
  title: string;
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
  cabinType: string | null;
  numCabins: number | null;
  deckLabels: { primo: string | null; secondo: string | null; terzo: string | null } | null;
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

  // Filter by agency only when accessed by an agency user
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

  // 2. Fetch full product data
  const isTour = quote.request_type === "tour";
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
      title: tour.title,
      coverImageUrl: null, // skip external image for performance
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
      })),
      hotels: (tour.hotels ?? []).map((h: any) => ({
        localita: h.localita,
        nome_albergo: h.nome_albergo,
        stelle: h.stelle,
      })),
      departures: (tour.departures ?? []).map((d: any) => ({
        from_city: d.from_city,
        data_partenza: d.data_partenza,
        prices: [
          { label: "3 Stelle", value: d.prezzo_3_stelle },
          { label: "4 Stelle", value: d.prezzo_4_stelle },
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
      cabinType: null,
      numCabins: null,
      deckLabels: null,
    };
  }

  // Cruise
  if (!isTour && cruiseRef?.id) {
    const cruise = await getCruiseById(cruiseRef.id);
    if (!cruise) return null;

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
      title: cruise.title,
      coverImageUrl: null, // skip external image for performance
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
        ? { name: cruise.ship.name, cover_image_url: null }
        : null,
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
