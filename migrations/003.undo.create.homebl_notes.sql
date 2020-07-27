ALTER TABLE homebl_addresses
  DROP COLUMN IF EXISTS note_id; 

DROP TABLE IF EXISTS homebl_notes CASCADE;