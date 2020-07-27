CREATE TABLE homebl_notes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  address_id INTEGER REFERENCES homebl_addresses(id)
    ON DELETE CASCADE
);

