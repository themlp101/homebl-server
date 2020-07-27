CREATE TABLE homebl_notes (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  user_id INTEGER REFERENCES homebl_users(id)
    ON DELETE CASCADE
);