/*
# Home Service Platform — Core Schema

## Overview
Creates the full database schema for a local home-service marketplace connecting
customers with trusted service providers (plumbers, electricians, cleaners, etc.).
Supports three roles: customer, provider, and admin.

## New Tables

1. **profiles** — extends auth.users with role, name, phone, location, verification status.
   - `id` uuid PK, references auth.users ON DELETE CASCADE
   - `role` text CHECK ('customer', 'provider', 'admin')
   - `full_name`, `phone`, `email`, `avatar_url`, `location`, `bio`
   - `is_verified` boolean (admin verifies providers)
   - `is_premium` boolean (subscription status)
   - `created_at`

2. **services** — catalog of service categories (Plumber, Electrician, AC Repair, etc.)
   - `id` uuid PK
   - `name`, `category`, `icon`, `description`
   - `base_price` numeric
   - `created_at`

3. **provider_services** — a provider's offered services with custom pricing
   - `id` uuid PK
   - `provider_id` uuid FK → profiles
   - `service_id` uuid FK → services
   - `price` numeric, `description`, `is_featured`
   - `created_at`

4. **bookings** — booking records linking customer, provider, and service
   - `id` uuid PK
   - `customer_id`, `provider_id` uuid FK → profiles
   - `service_id` uuid FK → services, `provider_service_id` uuid FK → provider_services
   - `scheduled_date` date, `scheduled_time` time
   - `status` text CHECK ('pending','accepted','rejected','completed','cancelled')
   - `payment_method` text ('online','cash'), `payment_status` text ('pending','paid')
   - `total_amount`, `convenience_fee` numeric
   - `address`, `notes`
   - `created_at`, `completed_at`

5. **reviews** — customer reviews of providers after completed bookings
   - `id` uuid PK
   - `booking_id` uuid FK → bookings
   - `customer_id`, `provider_id` uuid FK → profiles
   - `rating` int CHECK (1-5), `comment` text
   - `created_at`

## Security (RLS)
- All tables have RLS enabled.
- profiles: users read all profiles (need to see providers), update own only.
- services: public read (anon + authenticated), admin write only.
- provider_services: public read, provider manages own.
- bookings: customer sees own, provider sees own, admin sees all. Customer creates own, can cancel. Provider updates status. Admin can manage all.
- reviews: public read, customer creates review for own completed booking, admin can delete.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  avatar_url text,
  location text DEFAULT '',
  bio text DEFAULT '',
  is_verified boolean NOT NULL DEFAULT false,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ SERVICES ============
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  icon text NOT NULL DEFAULT 'Wrench',
  description text NOT NULL DEFAULT '',
  base_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_services" ON services;
CREATE POLICY "select_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============ PROVIDER_SERVICES ============
CREATE TABLE IF NOT EXISTS provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, service_id)
);

ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_provider_services" ON provider_services;
CREATE POLICY "select_provider_services" ON provider_services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_provider_services" ON provider_services;
CREATE POLICY "insert_own_provider_services" ON provider_services FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "update_own_provider_services" ON provider_services;
CREATE POLICY "update_own_provider_services" ON provider_services FOR UPDATE
  TO authenticated USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "delete_own_provider_services" ON provider_services;
CREATE POLICY "delete_own_provider_services" ON provider_services FOR DELETE
  TO authenticated USING (auth.uid() = provider_id);

-- ============ BOOKINGS ============
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  provider_service_id uuid REFERENCES provider_services(id) ON DELETE SET NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed','cancelled')),
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('online','cash')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid')),
  total_amount numeric NOT NULL DEFAULT 0,
  convenience_fee numeric NOT NULL DEFAULT 20,
  address text NOT NULL DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_bookings" ON bookings;
CREATE POLICY "select_bookings" ON bookings FOR SELECT
  TO authenticated USING (
    customer_id = auth.uid()
    OR provider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_bookings" ON bookings;
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_bookings" ON bookings;
CREATE POLICY "update_bookings" ON bookings FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR provider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    customer_id = auth.uid()
    OR provider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_bookings" ON bookings;
CREATE POLICY "admin_delete_bookings" ON bookings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_reviews" ON reviews;
CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
        AND bookings.customer_id = auth.uid()
        AND bookings.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_service ON provider_services(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED SERVICE CATALOG ============
INSERT INTO services (name, category, icon, description, base_price) VALUES
  ('Plumber', 'Repair', 'Droplets', 'Fix leaks, pipes, faucets, drainage and bathroom fittings.', 299),
  ('Electrician', 'Repair', 'Zap', 'Wiring, switches, sockets, circuit breakers and electrical safety checks.', 299),
  ('AC Repair & Service', 'Appliance', 'Wind', 'AC installation, gas refill, cleaning and full servicing.', 499),
  ('House Cleaning', 'Cleaning', 'Sparkles', 'Deep cleaning, regular cleaning, kitchen and bathroom sanitization.', 399),
  ('Carpenter', 'Repair', 'Hammer', 'Furniture repair, door and cabinet fitting, modular woodwork.', 349),
  ('Painter', 'Renovation', 'PaintRoller', 'Interior and exterior painting, waterproofing, texture finishes.', 499),
  ('Washing Machine & Refrigerator Repair', 'Appliance', 'WashingMachine', 'Diagnosis, part replacement and servicing for all major brands.', 399),
  ('Home Salon Services', 'Beauty', 'Scissors', 'Haircut, facial, waxing, manicure and pedicure at home.', 499)
ON CONFLICT DO NOTHING;
