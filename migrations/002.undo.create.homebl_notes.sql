ALTER TABLE homebl_users
  DROP COLUMN IF EXISTS user_id; 

DROP TABLE IF EXISTS homebl_notes CASCADE;