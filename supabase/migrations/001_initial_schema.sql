-- ============================================================
-- MishaTravel - Schema Database Completo
-- Basato sull'export ACF di WordPress (acf-export-2026-02-21.json)
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE content_status AS ENUM ('draft', 'published');
CREATE TYPE pensione_type AS ENUM ('no', 'mezza', 'completa');
CREATE TYPE cruise_type AS ENUM ('Crociera di Gruppo', 'Crociera');
CREATE TYPE cabin_room_type AS ENUM ('Singola', 'Doppia', 'Tripla', 'Quadrupla');
CREATE TYPE agency_status AS ENUM ('pending', 'active', 'blocked');
CREATE TYPE quote_status AS ENUM ('sent', 'in_review', 'offer_sent', 'accepted', 'declined', 'payment_sent', 'confirmed', 'rejected');
CREATE TYPE quote_type AS ENUM ('tour', 'cruise');
CREATE TYPE payment_status AS ENUM ('pending', 'received', 'confirmed');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'operator', 'agency');
CREATE TYPE actor_type AS ENUM ('admin', 'agency', 'system');
CREATE TYPE statement_status AS ENUM ('Bozza', 'Inviato via Mail');
CREATE TYPE operator_section AS ENUM (
  'tours', 'cruises', 'fleet', 'departures', 'destinations',
  'agencies', 'quotes', 'blog', 'catalogs', 'media', 'users_readonly',
  'account_statements'
);

-- ============================================================
-- 1. DESTINAZIONI (Destinations)
-- ACF Group: "Destinazioni" - solo campo coordinate
-- CPT: destinazioni (title, editor, thumbnail, taxonomy destinazione)
-- ============================================================

CREATE TABLE destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,                   -- WP editor content
  cover_image_url text,               -- WP featured image
  coordinate text,                    -- ACF: coordinate
  macro_area text,                    -- da WP taxonomy 'destinazione'
  sort_order integer DEFAULT 0,
  status content_status DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. TOUR
-- ACF Group: "Tours" (19 campi) + "Prezzo su richiesta"
-- ============================================================

CREATE TABLE tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,                       -- WP editor content
  cover_image_url text,               -- WP featured image
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,

  -- ACF Fields
  a_partire_da text,                  -- Prezzo testuale (es. "1.290€ a persona" o "Prezzo su Richiesta")
  prezzo_su_richiesta boolean DEFAULT false,  -- ACF: prezzo_su_richiesta (shared field group)
  numero_persone integer DEFAULT 30,  -- ACF: numero_persone
  durata_notti text,                  -- ACF: durata (testo, es. "7")
  pensione pensione_type[] DEFAULT '{completa}',  -- ACF: pensione (checkbox multi-valore)
  tipo_voli text,                     -- ACF: tipo_voli
  note_importanti text,               -- ACF: note_importanti (wysiwyg HTML)
  nota_penali text,                   -- ACF: nota_penali (textarea)
  programma_pdf_url text,             -- ACF: d_programma (file URL)

  -- SEO & Status
  meta_title text,
  meta_description text,
  status content_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ACF repeater: localita (nome + coordinate)
CREATE TABLE tour_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  nome text NOT NULL,
  coordinate text,
  sort_order integer DEFAULT 0
);

-- ACF repeater: programma (numero_giorno, localita, descrizione wysiwyg)
CREATE TABLE tour_itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  numero_giorno text,
  localita text,
  descrizione text,                   -- wysiwyg HTML
  sort_order integer DEFAULT 0
);

-- ACF nested repeater: alberghi (localita → alberghi: nome_albergo + stelle)
CREATE TABLE tour_hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  localita text NOT NULL,             -- Città/località
  nome_albergo text,                  -- Nome hotel
  stelle integer,                     -- Stelle (3, 4, 5...)
  sort_order integer DEFAULT 0
);

-- ACF repeater: calendario_partenze (from, data_partenza, 3_price, 4_price)
CREATE TABLE tour_departures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  from_city text,                     -- ACF: from (città di partenza)
  data_partenza date,                 -- ACF: data_partenza
  prezzo_3_stelle numeric,            -- ACF: 3_price (number type)
  prezzo_4_stelle text,               -- ACF: 4_price (text type - può contenere testo)
  sort_order integer DEFAULT 0
);

-- ACF repeater: supplementi (titolo + prezzo)
CREATE TABLE tour_supplements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  prezzo text,                        -- text perché può contenere testo formattato
  sort_order integer DEFAULT 0
);

-- ACF repeaters: included + not_included (unificati con flag)
CREATE TABLE tour_inclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  is_included boolean NOT NULL,       -- true = incluso, false = non incluso
  sort_order integer DEFAULT 0
);

-- ACF repeater: termini (titolo)
CREATE TABLE tour_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF repeater: penalty (titolo)
CREATE TABLE tour_penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF: gallery (galleria immagini)
CREATE TABLE tour_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0
);

-- ACF repeater: programmi_extra / Escursioni Facoltative (titolo, descrizione, prezzo)
CREATE TABLE tour_optional_excursions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  descrizione text,                   -- wysiwyg HTML
  prezzo numeric,
  sort_order integer DEFAULT 0
);

-- ============================================================
-- 3. IMBARCAZIONI / NAVI (Ships)
-- ACF Group: "Imbarcazioni" (8 campi)
-- ============================================================

CREATE TABLE ships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,                   -- WP editor content
  cover_image_url text,               -- WP featured image

  -- ACF Fields
  cabine_disponibili text,            -- ACF: cabine_disponibili
  servizi_cabine text,                -- ACF: servizi_cabine
  piani_ponte_url text,               -- ACF: piani_ponte (immagine deck plan)

  status content_status DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ACF repeater: adatto_per (testo)
CREATE TABLE ship_suitable_for (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id uuid NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
  testo text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF repeater: attivita (attivita)
CREATE TABLE ship_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id uuid NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
  attivita text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF repeater: servizi (testo)
CREATE TABLE ship_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id uuid NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
  testo text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF: galleria
CREATE TABLE ship_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id uuid NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0
);

-- ACF repeater: cabine_dettaglio (titolo, immagine, tipologia select, descrizione)
CREATE TABLE ship_cabin_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id uuid NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
  titolo text NOT NULL,               -- Nome tipo cabina
  immagine_url text,                  -- ACF: immagine_cabina
  tipologia cabin_room_type,          -- ACF: tipologia (Singola/Doppia/Tripla/Quadrupla)
  descrizione text,                   -- ACF: descrizione (textarea)
  sort_order integer DEFAULT 0
);

-- ============================================================
-- 4. CROCIERE (Cruises)
-- ACF Group: "Crociere" (22 campi) + "Prezzo su richiesta"
-- ============================================================

CREATE TABLE cruises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,                       -- WP editor content
  cover_image_url text,               -- WP featured image
  ship_id uuid REFERENCES ships(id) ON DELETE SET NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,

  -- ACF Fields
  tipo_crociera cruise_type,          -- ACF: tipo_crociera (Crociera di Gruppo / Crociera)
  a_partire_da text,                  -- ACF: a_partire_da (prezzo testuale)
  prezzo_su_richiesta boolean DEFAULT false,  -- ACF: prezzo_su_richiesta
  numero_minimo_persone integer,      -- ACF: numero_minimo_di_persone
  durata_notti text,                  -- ACF: durata_notti
  pensione pensione_type[] DEFAULT '{completa}',
  tipo_voli text,
  etichetta_primo_deck text,          -- ACF: etichetta_primo_deck (nome deck 1)
  etichetta_secondo_deck text,        -- ACF: etichetta_secondo_deck (nome deck 2)
  etichetta_terzo_deck text,          -- ACF: etichetta_terzo_deck (nome deck 3)
  note_importanti text,               -- wysiwyg HTML
  nota_penali text,
  programma_pdf_url text,             -- ACF: programma_pdf (file URL)

  -- SEO & Status
  meta_title text,
  meta_description text,
  status content_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ACF repeater: localita (nome + coordinate)
CREATE TABLE cruise_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  nome text NOT NULL,
  coordinate text,
  sort_order integer DEFAULT 0
);

-- ACF repeater: programma (numero_giorno, localita, descrizione)
CREATE TABLE cruise_itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  numero_giorno text,
  localita text,
  descrizione text,                   -- wysiwyg HTML
  sort_order integer DEFAULT 0
);

-- ACF nested repeater: alberghi per crociere
-- NB: In ACF per crociere, nome_albergo = "Tipologia Camera", stelle = "Ponte" (promenade/main)
CREATE TABLE cruise_cabins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  localita text,                      -- ACF: localita (area/sezione)
  tipologia_camera text,              -- ACF: nome_albergo (campo rinominato per crociere)
  ponte text,                         -- ACF: stelle → ponte (es. 'promenade', 'main')
  sort_order integer DEFAULT 0
);

-- ACF repeater: calendario_partenze per crociere
-- NB: 3 livelli di prezzo per deck (Main/Middle/Superior) vs 2 per tour
CREATE TABLE cruise_departures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  from_city text,                     -- ACF: from
  data_partenza date,                 -- ACF: data_partenza
  prezzo_main_deck numeric,           -- ACF: 3_price (Main Deck)
  prezzo_middle_deck text,            -- ACF: 4_price (Middle Deck - text type)
  prezzo_superior_deck text,          -- ACF: terz (Superior Deck - text type)
  sort_order integer DEFAULT 0
);

-- ACF repeater: supplementi
CREATE TABLE cruise_supplements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  prezzo text,
  sort_order integer DEFAULT 0
);

-- ACF repeaters: included + not_included
CREATE TABLE cruise_inclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  is_included boolean NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF repeater: termini
CREATE TABLE cruise_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF repeater: penalty
CREATE TABLE cruise_penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ACF: gallery
CREATE TABLE cruise_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id uuid NOT NULL REFERENCES cruises(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0
);

-- ============================================================
-- 5. BLOG
-- ============================================================

CREATE TABLE blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sort_order integer DEFAULT 0
);

CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  cover_image_url text,
  excerpt text,
  content text,
  meta_title text,
  meta_description text,
  status content_status DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. CATALOGHI
-- ============================================================

CREATE TABLE catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  year integer,
  cover_image_url text,
  pdf_url text,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 7. LIBRERIA MEDIA
-- ============================================================

CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  file_size integer,
  mime_type text,
  width integer,
  height integer,
  folder text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 8. AGENZIE
-- ============================================================

CREATE TABLE agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  vat_number text,                    -- Partita IVA
  fiscal_code text,                   -- Codice Fiscale
  license_number text,                -- Numero Licenza
  address text,
  city text,
  zip_code text,
  province text,
  contact_name text,
  phone text,
  email text,
  website text,
  status agency_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 9. ESTRATTI CONTO (Account Statements)
-- ACF Group: "Estratti conto"
-- ============================================================

CREATE TABLE account_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  title text,                         -- WP post title
  file_url text,                      -- ACF: caricare_gli_estratti_conto (PDF)
  data date,                          -- ACF: data
  stato statement_status DEFAULT 'Bozza',  -- ACF: stato (Bozza / Inviato via Mail)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 10. PREVENTIVI / RICHIESTE
-- ============================================================

CREATE TABLE quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  request_type quote_type NOT NULL,   -- tour o cruise
  tour_id uuid REFERENCES tours(id) ON DELETE SET NULL,
  cruise_id uuid REFERENCES cruises(id) ON DELETE SET NULL,
  departure_id uuid,                  -- FK dinamico (tour_departures o cruise_departures)
  participants_adults integer DEFAULT 0,
  participants_children integer DEFAULT 0,
  -- Campi specifici crociere
  cabin_type text,                    -- Tipo cabina richiesta
  num_cabins integer,
  -- Note
  notes text,
  -- Stato workflow
  status quote_status DEFAULT 'sent',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extra richiesti nel preventivo
CREATE TABLE quote_request_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  extra_name text NOT NULL,
  quantity integer DEFAULT 1
);

-- Offerte create dall'admin
CREATE TABLE quote_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  package_details jsonb,              -- Dettagli personalizzati dell'offerta
  total_price numeric,
  conditions text,
  payment_terms text,
  offer_expiry date,
  created_at timestamptz DEFAULT now()
);

-- Pagamenti
CREATE TABLE quote_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  bank_details text,
  amount numeric,
  reference text,                     -- Causale
  status payment_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Timeline / storico azioni su un preventivo
CREATE TABLE quote_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  actor actor_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 11. NOTIFICHE
-- ============================================================

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 12. UTENTI E RUOLI
-- ============================================================

CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE operator_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section operator_section NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, section)
);

CREATE TABLE user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Destinations
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_destinations_macro_area ON destinations(macro_area);

-- Tours
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_destination ON tours(destination_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tour_departures_tour ON tour_departures(tour_id);
CREATE INDEX idx_tour_departures_date ON tour_departures(data_partenza);

-- Ships
CREATE INDEX idx_ships_slug ON ships(slug);

-- Cruises
CREATE INDEX idx_cruises_slug ON cruises(slug);
CREATE INDEX idx_cruises_ship ON cruises(ship_id);
CREATE INDEX idx_cruises_destination ON cruises(destination_id);
CREATE INDEX idx_cruises_status ON cruises(status);
CREATE INDEX idx_cruise_departures_cruise ON cruise_departures(cruise_id);
CREATE INDEX idx_cruise_departures_date ON cruise_departures(data_partenza);

-- Blog
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);

-- Agencies
CREATE INDEX idx_agencies_user ON agencies(user_id);
CREATE INDEX idx_agencies_status ON agencies(status);

-- Quotes
CREATE INDEX idx_quotes_agency ON quote_requests(agency_id);
CREATE INDEX idx_quotes_status ON quote_requests(status);
CREATE INDEX idx_quotes_tour ON quote_requests(tour_id);
CREATE INDEX idx_quotes_cruise ON quote_requests(cruise_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- User Roles
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Operator Permissions
CREATE INDEX idx_operator_permissions_user ON operator_permissions(user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all main tables
CREATE TRIGGER tr_destinations_updated BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tours_updated BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ships_updated BEFORE UPDATE ON ships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_cruises_updated BEFORE UPDATE ON cruises FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_blog_posts_updated BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_catalogs_updated BEFORE UPDATE ON catalogs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_agencies_updated BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_account_statements_updated BEFORE UPDATE ON account_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_quote_requests_updated BEFORE UPDATE ON quote_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_roles_updated BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id uuid)
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission for a section
CREATE OR REPLACE FUNCTION has_permission(p_user_id uuid, p_section operator_section)
RETURNS boolean AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id;

  -- Super admin and admin have all permissions
  IF v_role IN ('super_admin', 'admin') THEN
    RETURN true;
  END IF;

  -- Operator: check specific permissions
  IF v_role = 'operator' THEN
    RETURN EXISTS (
      SELECT 1 FROM operator_permissions
      WHERE user_id = p_user_id AND section = p_section
    );
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_optional_excursions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_suitable_for ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_cabin_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruises ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_cabins ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: PUBLIC READ (published content)
-- Chiunque può leggere contenuti pubblicati
-- ============================================================

-- Helper: macro per tabelle contenuto pubblico con status
CREATE POLICY "Public read published destinations" ON destinations FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published tours" ON tours FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published cruises" ON cruises FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published ships" ON ships FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published blog_posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published catalogs" ON catalogs FOR SELECT USING (is_published = true);

-- Sub-tabelle: leggibili se il parent è published
-- Tour sub-tables
CREATE POLICY "Public read tour_locations" ON tour_locations FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_locations.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_itinerary_days" ON tour_itinerary_days FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_itinerary_days.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_hotels" ON tour_hotels FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_hotels.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_departures" ON tour_departures FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_departures.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_supplements" ON tour_supplements FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_supplements.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_inclusions" ON tour_inclusions FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_inclusions.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_terms" ON tour_terms FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_terms.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_penalties" ON tour_penalties FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_penalties.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_gallery" ON tour_gallery FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_gallery.tour_id AND tours.status = 'published'));
CREATE POLICY "Public read tour_optional_excursions" ON tour_optional_excursions FOR SELECT
  USING (EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_optional_excursions.tour_id AND tours.status = 'published'));

-- Ship sub-tables
CREATE POLICY "Public read ship_suitable_for" ON ship_suitable_for FOR SELECT
  USING (EXISTS (SELECT 1 FROM ships WHERE ships.id = ship_suitable_for.ship_id AND ships.status = 'published'));
CREATE POLICY "Public read ship_activities" ON ship_activities FOR SELECT
  USING (EXISTS (SELECT 1 FROM ships WHERE ships.id = ship_activities.ship_id AND ships.status = 'published'));
CREATE POLICY "Public read ship_services" ON ship_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM ships WHERE ships.id = ship_services.ship_id AND ships.status = 'published'));
CREATE POLICY "Public read ship_gallery" ON ship_gallery FOR SELECT
  USING (EXISTS (SELECT 1 FROM ships WHERE ships.id = ship_gallery.ship_id AND ships.status = 'published'));
CREATE POLICY "Public read ship_cabin_details" ON ship_cabin_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM ships WHERE ships.id = ship_cabin_details.ship_id AND ships.status = 'published'));

-- Cruise sub-tables
CREATE POLICY "Public read cruise_locations" ON cruise_locations FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_locations.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_itinerary_days" ON cruise_itinerary_days FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_itinerary_days.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_cabins" ON cruise_cabins FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_cabins.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_departures" ON cruise_departures FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_departures.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_supplements" ON cruise_supplements FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_supplements.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_inclusions" ON cruise_inclusions FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_inclusions.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_terms" ON cruise_terms FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_terms.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_penalties" ON cruise_penalties FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_penalties.cruise_id AND cruises.status = 'published'));
CREATE POLICY "Public read cruise_gallery" ON cruise_gallery FOR SELECT
  USING (EXISTS (SELECT 1 FROM cruises WHERE cruises.id = cruise_gallery.cruise_id AND cruises.status = 'published'));

-- Blog categories: sempre leggibili
CREATE POLICY "Public read blog_categories" ON blog_categories FOR SELECT USING (true);

-- Media: sempre leggibili
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);

-- ============================================================
-- RLS POLICIES: ADMIN FULL ACCESS
-- Admin/Super Admin possono fare tutto via service_role key
-- Il service_role key bypassa automaticamente le RLS
-- Queste policy sono per admin autenticati via anon key + JWT
-- ============================================================

-- Admin can read ALL content (including drafts)
CREATE POLICY "Admin read all destinations" ON destinations FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin read all tours" ON tours FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin read all cruises" ON cruises FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin read all ships" ON ships FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin read all blog_posts" ON blog_posts FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin read all catalogs" ON catalogs FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));

-- Admin can INSERT/UPDATE/DELETE content
CREATE POLICY "Admin manage destinations" ON destinations FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tours" ON tours FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruises" ON cruises FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage ships" ON ships FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage blog_posts" ON blog_posts FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage blog_categories" ON blog_categories FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage catalogs" ON catalogs FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage media" ON media FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));

-- Admin manage all sub-tables (tour)
CREATE POLICY "Admin manage tour_locations" ON tour_locations FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_itinerary_days" ON tour_itinerary_days FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_hotels" ON tour_hotels FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_departures" ON tour_departures FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_supplements" ON tour_supplements FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_inclusions" ON tour_inclusions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_terms" ON tour_terms FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_penalties" ON tour_penalties FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_gallery" ON tour_gallery FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage tour_optional_excursions" ON tour_optional_excursions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));

-- Admin manage all sub-tables (ship)
CREATE POLICY "Admin manage ship_suitable_for" ON ship_suitable_for FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage ship_activities" ON ship_activities FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage ship_services" ON ship_services FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage ship_gallery" ON ship_gallery FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage ship_cabin_details" ON ship_cabin_details FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));

-- Admin manage all sub-tables (cruise)
CREATE POLICY "Admin manage cruise_locations" ON cruise_locations FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_itinerary_days" ON cruise_itinerary_days FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_cabins" ON cruise_cabins FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_departures" ON cruise_departures FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_supplements" ON cruise_supplements FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_inclusions" ON cruise_inclusions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_terms" ON cruise_terms FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_penalties" ON cruise_penalties FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage cruise_gallery" ON cruise_gallery FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));

-- ============================================================
-- RLS POLICIES: AGENCY ACCESS
-- Le agenzie vedono solo i propri dati
-- ============================================================

CREATE POLICY "Agency read own data" ON agencies FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Agency update own data" ON agencies FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Agency read own statements" ON account_statements FOR SELECT TO authenticated
  USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "Agency read own quotes" ON quote_requests FOR SELECT TO authenticated
  USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));
CREATE POLICY "Agency create quotes" ON quote_requests FOR INSERT TO authenticated
  WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));
CREATE POLICY "Agency update own quotes" ON quote_requests FOR UPDATE TO authenticated
  USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "Agency read own quote extras" ON quote_request_extras FOR SELECT TO authenticated
  USING (request_id IN (
    SELECT qr.id FROM quote_requests qr
    JOIN agencies a ON a.id = qr.agency_id
    WHERE a.user_id = auth.uid()
  ));
CREATE POLICY "Agency create quote extras" ON quote_request_extras FOR INSERT TO authenticated
  WITH CHECK (request_id IN (
    SELECT qr.id FROM quote_requests qr
    JOIN agencies a ON a.id = qr.agency_id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Agency read own offers" ON quote_offers FOR SELECT TO authenticated
  USING (request_id IN (
    SELECT qr.id FROM quote_requests qr
    JOIN agencies a ON a.id = qr.agency_id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Agency read own payments" ON quote_payments FOR SELECT TO authenticated
  USING (request_id IN (
    SELECT qr.id FROM quote_requests qr
    JOIN agencies a ON a.id = qr.agency_id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Agency read own timeline" ON quote_timeline FOR SELECT TO authenticated
  USING (request_id IN (
    SELECT qr.id FROM quote_requests qr
    JOIN agencies a ON a.id = qr.agency_id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Agency read own notifications" ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Agency update own notifications" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: ADMIN ACCESS for agency/quote management
-- ============================================================

CREATE POLICY "Admin manage agencies" ON agencies FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage account_statements" ON account_statements FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage quote_requests" ON quote_requests FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage quote_request_extras" ON quote_request_extras FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage quote_offers" ON quote_offers FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage quote_payments" ON quote_payments FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage quote_timeline" ON quote_timeline FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));
CREATE POLICY "Admin manage notifications" ON notifications FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin', 'operator'));

-- User roles: solo super_admin e admin possono gestire
CREATE POLICY "Admin manage user_roles" ON user_roles FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin'));
CREATE POLICY "User read own role" ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin manage operator_permissions" ON operator_permissions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin'));
CREATE POLICY "User read own permissions" ON operator_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin manage activity_log" ON user_activity_log FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('super_admin', 'admin'))
  WITH CHECK (get_user_role(auth.uid()) IN ('super_admin', 'admin'));
CREATE POLICY "User read own activity" ON user_activity_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());
