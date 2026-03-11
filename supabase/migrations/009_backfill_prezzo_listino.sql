-- Backfill prezzo_listino from a_partire_da for existing tours and cruises
-- so the admin panel shows the old prices in the new "Prezzo di Listino" field.
-- Only updates rows where prezzo_listino is NULL and a_partire_da starts with a digit.
-- Handles Italian number format (comma as decimal separator).

UPDATE tours
SET prezzo_listino = REPLACE(regexp_replace(a_partire_da, '[^0-9,.]', '', 'g'), ',', '.')::numeric
WHERE prezzo_listino IS NULL
  AND a_partire_da IS NOT NULL
  AND a_partire_da ~ '^\d';

UPDATE cruises
SET prezzo_listino = REPLACE(regexp_replace(a_partire_da, '[^0-9,.]', '', 'g'), ',', '.')::numeric
WHERE prezzo_listino IS NULL
  AND a_partire_da IS NOT NULL
  AND a_partire_da ~ '^\d';
