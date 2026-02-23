// =============================================================================
// MishaTravel Database Schema - TypeScript Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Destinations
// -----------------------------------------------------------------------------

export type DestinationStatus = 'draft' | 'published';

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  coordinate: string | null;
  macro_area: string | null;
  sort_order: number;
  status: DestinationStatus;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Tours
// -----------------------------------------------------------------------------

export type TourStatus = 'draft' | 'published';
export type PensioneType = 'no' | 'mezza' | 'completa';

export interface Tour {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  cover_image_url: string | null;
  destination_id: string | null;
  a_partire_da: string | null;
  prezzo_su_richiesta: boolean;
  numero_persone: number;
  durata_notti: string | null;
  pensione: PensioneType[];
  tipo_voli: string | null;
  note_importanti: string | null;
  nota_penali: string | null;
  programma_pdf_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: TourStatus;
  created_at: string;
  updated_at: string;
}

export interface TourLocation {
  id: string;
  tour_id: string;
  nome: string;
  coordinate: string | null;
  sort_order: number;
}

export interface TourItineraryDay {
  id: string;
  tour_id: string;
  numero_giorno: string;
  localita: string;
  descrizione: string;
  sort_order: number;
}

export interface TourHotel {
  id: string;
  tour_id: string;
  localita: string;
  nome_albergo: string;
  stelle: number;
  sort_order: number;
}

export interface TourDeparture {
  id: string;
  tour_id: string;
  from_city: string;
  data_partenza: string;
  prezzo_3_stelle: number | null;
  prezzo_4_stelle: string | null;
  sort_order: number;
}

export interface TourSupplement {
  id: string;
  tour_id: string;
  titolo: string;
  prezzo: string | null;
  sort_order: number;
}

export interface TourInclusion {
  id: string;
  tour_id: string;
  titolo: string;
  is_included: boolean;
  sort_order: number;
}

export interface TourTerm {
  id: string;
  tour_id: string;
  titolo: string;
  sort_order: number;
}

export interface TourPenalty {
  id: string;
  tour_id: string;
  titolo: string;
  sort_order: number;
}

export interface TourGalleryItem {
  id: string;
  tour_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface TourOptionalExcursion {
  id: string;
  tour_id: string;
  titolo: string;
  descrizione: string | null;
  prezzo: number | null;
  sort_order: number;
}

// -----------------------------------------------------------------------------
// Ships
// -----------------------------------------------------------------------------

export type ShipStatus = 'draft' | 'published';

export interface Ship {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  cabine_disponibili: string | null;
  servizi_cabine: string | null;
  piani_ponte_url: string | null;
  status: ShipStatus;
  created_at: string;
  updated_at: string;
}

export interface ShipSuitableFor {
  id: string;
  ship_id: string;
  testo: string;
  sort_order: number;
}

export interface ShipActivity {
  id: string;
  ship_id: string;
  attivita: string;
  sort_order: number;
}

export interface ShipService {
  id: string;
  ship_id: string;
  testo: string;
  sort_order: number;
}

export interface ShipGalleryItem {
  id: string;
  ship_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export type ShipCabinTipologia = 'Singola' | 'Doppia' | 'Tripla' | 'Quadrupla';

export interface ShipCabinDetail {
  id: string;
  ship_id: string;
  titolo: string;
  immagine_url: string | null;
  tipologia: ShipCabinTipologia | null;
  descrizione: string | null;
  deck_id: string | null;
  sort_order: number;
}

export interface ShipDeck {
  id: string;
  ship_id: string;
  nome: string;
  sort_order: number;
}

// -----------------------------------------------------------------------------
// Cruises
// -----------------------------------------------------------------------------

export type CruiseStatus = 'draft' | 'published';
export type TipoCrociera = 'Crociera di Gruppo' | 'Crociera';

export interface Cruise {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  cover_image_url: string | null;
  ship_id: string | null;
  destination_id: string | null;
  tipo_crociera: TipoCrociera | null;
  a_partire_da: string | null;
  prezzo_su_richiesta: boolean;
  numero_minimo_persone: number | null;
  durata_notti: string | null;
  pensione: PensioneType[];
  tipo_voli: string | null;
  etichetta_primo_deck: string | null;
  etichetta_secondo_deck: string | null;
  etichetta_terzo_deck: string | null;
  note_importanti: string | null;
  nota_penali: string | null;
  programma_pdf_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: CruiseStatus;
  created_at: string;
  updated_at: string;
}

export interface CruiseLocation {
  id: string;
  cruise_id: string;
  nome: string;
  coordinate: string | null;
  sort_order: number;
}

export interface CruiseItineraryDay {
  id: string;
  cruise_id: string;
  numero_giorno: string;
  localita: string;
  descrizione: string;
  sort_order: number;
}

export interface CruiseCabin {
  id: string;
  cruise_id: string;
  localita: string;
  tipologia_camera: string | null;
  ponte: string | null;
  sort_order: number;
}

export interface CruiseDeparture {
  id: string;
  cruise_id: string;
  from_city: string;
  data_partenza: string;
  prezzo_main_deck: number | null;
  prezzo_middle_deck: string | null;
  prezzo_superior_deck: string | null;
  sort_order: number;
}

export interface CruiseDeparturePrice {
  id: string;
  departure_id: string;
  cabin_id: string;
  prezzo: string | null;
  sort_order: number;
}

export interface CruiseSupplement {
  id: string;
  cruise_id: string;
  titolo: string;
  prezzo: string | null;
  sort_order: number;
}

export interface CruiseInclusion {
  id: string;
  cruise_id: string;
  titolo: string;
  is_included: boolean;
  sort_order: number;
}

export interface CruiseTerm {
  id: string;
  cruise_id: string;
  titolo: string;
  sort_order: number;
}

export interface CruisePenalty {
  id: string;
  cruise_id: string;
  titolo: string;
  sort_order: number;
}

export interface CruiseGalleryItem {
  id: string;
  cruise_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

// -----------------------------------------------------------------------------
// Blog
// -----------------------------------------------------------------------------

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  cover_image_url: string | null;
  excerpt: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: BlogPostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Catalog
// -----------------------------------------------------------------------------

export interface Catalog {
  id: string;
  title: string;
  year: number | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Media
// -----------------------------------------------------------------------------

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  folder: string | null;
  bucket: string | null;
  alt_text: string | null;
  created_at: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Agency & Account
// -----------------------------------------------------------------------------

export type AgencyStatus = 'pending' | 'active' | 'blocked';

export interface Agency {
  id: string;
  user_id: string;
  business_name: string;
  vat_number: string | null;
  fiscal_code: string | null;
  license_number: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  province: string | null;
  region: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  status: AgencyStatus;
  created_at: string;
  updated_at: string;
}

export interface AgencyDocument {
  id: string;
  agency_id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  uploaded_at: string;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  notes: string | null;
}

// -----------------------------------------------------------------------------
// Site Settings
// -----------------------------------------------------------------------------

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

export type SiteSettingKey =
  | 'admin_notification_emails'
  | 'sender_email'
  | 'sender_name'
  | 'company_phone'
  | 'company_address'
  | 'company_website';

export type AccountStatementStato = 'Bozza' | 'Inviato via Mail';

export interface AccountStatement {
  id: string;
  agency_id: string;
  title: string;
  file_url: string | null;
  data: string;
  stato: AccountStatementStato;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Quotes
// -----------------------------------------------------------------------------

export type QuoteRequestType = 'tour' | 'cruise';
export type QuoteRequestStatus =
  | 'requested'
  | 'offered'
  | 'accepted'
  | 'confirmed'
  | 'declined'
  | 'rejected'
  // Legacy statuses (kept for DB enum compatibility)
  | 'sent'
  | 'in_review'
  | 'offer_sent'
  | 'payment_sent';

export interface QuoteRequest {
  id: string;
  agency_id: string;
  request_type: QuoteRequestType;
  tour_id: string | null;
  cruise_id: string | null;
  departure_id: string | null;
  participants_adults: number | null;
  participants_children: number | null;
  cabin_type: string | null;
  num_cabins: number | null;
  notes: string | null;
  status: QuoteRequestStatus;
  preview_price: number | null;
  preview_price_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequestExtra {
  id: string;
  request_id: string;
  extra_name: string;
  quantity: number | null;
}

export interface QuoteOffer {
  id: string;
  request_id: string;
  package_details: Record<string, unknown> | null;
  total_price: number | null;
  conditions: string | null;
  payment_terms: string | null;
  offer_expiry: string | null;
  contract_file_url: string | null;
  iban: string | null;
  created_at: string;
}

export interface QuoteParticipant {
  id: string;
  request_id: string;
  full_name: string;
  document_type: string | null;
  document_number: string | null;
  is_child: boolean;
  sort_order: number;
  created_at: string;
}

export interface QuoteDocument {
  id: string;
  request_id: string;
  file_url: string;
  file_name: string;
  document_type: string;
  uploaded_by: string | null;
  created_at: string;
}

export type QuotePaymentStatus = 'pending' | 'received' | 'confirmed';

export interface QuotePayment {
  id: string;
  request_id: string;
  bank_details: string | null;
  amount: number | null;
  reference: string | null;
  status: QuotePaymentStatus;
  created_at: string;
}

export type QuoteTimelineActor = 'admin' | 'agency' | 'system';

export interface QuoteTimeline {
  id: string;
  request_id: string;
  action: string;
  details: string | null;
  actor: QuoteTimelineActor;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Users & Permissions
// -----------------------------------------------------------------------------

export type UserRoleType = 'super_admin' | 'admin' | 'operator' | 'agency';

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
  updated_at: string;
}

export type OperatorSection =
  | 'tours'
  | 'cruises'
  | 'fleet'
  | 'departures'
  | 'destinations'
  | 'agencies'
  | 'quotes'
  | 'blog'
  | 'catalogs'
  | 'media'
  | 'users_readonly'
  | 'account_statements';

export interface OperatorPermission {
  id: string;
  user_id: string;
  section: OperatorSection;
  created_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

// =============================================================================
// Composite / "WithRelations" Types
// =============================================================================

export type TourWithRelations = Tour & {
  locations: TourLocation[];
  itinerary_days: TourItineraryDay[];
  hotels: TourHotel[];
  departures: TourDeparture[];
  supplements: TourSupplement[];
  inclusions: TourInclusion[];
  terms: TourTerm[];
  penalties: TourPenalty[];
  gallery: TourGalleryItem[];
  optional_excursions: TourOptionalExcursion[];
  destination: Destination | null;
};

export type CruiseWithRelations = Cruise & {
  locations: CruiseLocation[];
  itinerary_days: CruiseItineraryDay[];
  cabins: CruiseCabin[];
  departures: CruiseDeparture[];
  departure_prices: CruiseDeparturePrice[];
  supplements: CruiseSupplement[];
  inclusions: CruiseInclusion[];
  terms: CruiseTerm[];
  penalties: CruisePenalty[];
  gallery: CruiseGalleryItem[];
  ship: Ship | null;
  ship_decks: ShipDeck[];
  ship_cabins: ShipCabinDetail[];
  destination: Destination | null;
};

export type ShipWithRelations = Ship & {
  suitable_for: ShipSuitableFor[];
  activities: ShipActivity[];
  services: ShipService[];
  gallery: ShipGalleryItem[];
  cabin_details: ShipCabinDetail[];
  decks: ShipDeck[];
};
