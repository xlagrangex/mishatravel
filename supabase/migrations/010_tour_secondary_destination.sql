-- Migration 010: Add optional secondary destination to tours
-- Allows a tour to span two destinations (e.g. Giappone + Corea del Sud).
-- The original destination_id remains the primary; destination_id_2 is optional.

ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS destination_id_2 uuid REFERENCES destinations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tours_destination_2 ON tours(destination_id_2);

ALTER TABLE tours
  ADD CONSTRAINT tours_destinations_distinct CHECK (
    destination_id_2 IS NULL OR destination_id IS NULL OR destination_id <> destination_id_2
  );
