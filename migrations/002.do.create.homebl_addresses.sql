CREATE TABLE homebl_addresses (
  id SERIAL PRIMARY KEY,
  address_1 VARCHAR(120) NOT NULL,
  address_2 VARCHAR(120),
  address_3 VARCHAR(120),
  city VARCHAR(100) NOT NULL,
  state CHAR(2) NOT NULL,
  zip_code VARCHAR(16) NOT NULL,
  user_id INTEGER REFERENCES homebl_users(id)
    ON DELETE CASCADE
);