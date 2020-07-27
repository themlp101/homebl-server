BEGIN;

TRUNCATE
  homebl_notes,
  homebl_addresses,
  homebl_users
  RESTART IDENTITY CASCADE;

INSERT INTO homebl_users (user_name, full_name, password)
VALUES  
  ('matty', 'Matt Patterson', '$2a$04$YIuSCcrI1/kvEtB4clrnkenQjjKIeRSuKPJr2kZCJixZ8owkJHZGK'),
  ('test_user1', 'Test User1', '$2a$04$ny/a3HZkjpcekK07mOt2H.9I9aRnFwD2aeIZClEhLvtlJVhxjOOiK'),
  ('test_user2', 'Test User2', '$2a$04$QrJB.UZB1TtLHm2QJ/8ZJuimRIzDT2xMoYUMAvmMV5F491dHcuusO');

INSERT INTO homebl_addresses (address_1, address_2, address_3, city, state, zip_code, user_id )
VALUES
  ('123 Main Street', NULL, NULL, 'Denver', 'CO', '80014', 1),
  ('58 Lucas Street', NULL, NULL, 'Denver', 'CO', '80014', 1),
  ('1625 Cedar Brook Avenue', NULL, NULL, 'Denver', 'CO', '80019', 1),
  ('452 Amelia Lane', NULL, NULL, 'Denver', 'CO', '80019', 1),
  ('457 Amelia Lane', NULL, NULL, 'Denver', 'CO', '80019', 1),
  ('127 Meager Landing', NULL, NULL, 'Denver', 'CO', '80014', 1),
  ('125 Seton Elementary Blvd', NULL, NULL, 'Denver', 'CO', '80014', 1);

INSERT INTO homebl_notes (content, address_id)
VALUES 
  ('Check schedule to view, I love the backyard for the kids', 1),
  ('See this today -- check with realtor Bob', 2),
  ('Interested if prices was lower', 3),
  ('I need to find out if my furniture will fit!', 4),
  ('Omg, the kitchen is my dream!', 4),
  ('Find out more info with realtor Bob', 5),
  ('Double check with lender', 6),
  ('I need to see this one today!', 7),
  ('I need to see this one today!', 1),
  ('I need to see this one today!', 3);

COMMIT;