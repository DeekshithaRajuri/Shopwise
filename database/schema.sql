-- Run once:  psql -U postgres -d ecommerce -f database/schema.sql

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  external_id INT UNIQUE,              -- id from the mock API (dummyjson)
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  price       NUMERIC(10,2) NOT NULL,  -- in INR
  image       TEXT
);

-- one cart per browser session
CREATE TABLE IF NOT EXISTS cart_items (
  session_id TEXT NOT NULL,
  product_id INT  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT  NOT NULL CHECK (quantity > 0),
  added_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (session_id, product_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  code        TEXT PRIMARY KEY,
  description TEXT,
  type        TEXT NOT NULL CHECK (type IN ('PERCENT', 'FLAT')),
  value       NUMERIC(10,2) NOT NULL,
  min_order   NUMERIC(10,2) NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  order_number        TEXT UNIQUE NOT NULL,
  session_id          TEXT NOT NULL,
  customer_name       TEXT NOT NULL,
  customer_email      TEXT NOT NULL,
  customer_phone      TEXT,
  subtotal            NUMERIC(10,2) NOT NULL,
  discount            NUMERIC(10,2) NOT NULL DEFAULT 0,
  total               NUMERIC(10,2) NOT NULL,
  coupon_code         TEXT,
  status              TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | PAID
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT,
  name       TEXT NOT NULL,
  price      NUMERIC(10,2) NOT NULL,  -- price at time of purchase
  quantity   INT NOT NULL
);

-- used by connect-pg-simple to store sessions
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    varchar NOT NULL COLLATE "default" PRIMARY KEY,
  "sess"   json NOT NULL,
  "expire" timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- sample coupons
INSERT INTO coupons (code, description, type, value, min_order) VALUES
  ('SAVE10',  '10% off your order',         'PERCENT', 10,  0),
  ('FLAT200', 'Flat ₹200 off above ₹1,000', 'FLAT',    200, 1000)
ON CONFLICT DO NOTHING;

-- fallback products (the app can also import more from the mock API)
INSERT INTO products (name, description, category, price)
SELECT * FROM (VALUES
  ('Classic Backpack',   'Water-resistant 20L backpack with laptop sleeve.', 'bags',        1499),
  ('Wireless Earbuds',   'Bluetooth 5.3, 24-hour battery with case.',        'electronics', 2299),
  ('Steel Water Bottle', 'Insulated, keeps drinks cold for 24 hours.',       'home',         699),
  ('Desk Lamp',          'LED lamp with three brightness levels.',           'home',         999)
) AS v(name, description, category, price)
WHERE NOT EXISTS (SELECT 1 FROM products);
