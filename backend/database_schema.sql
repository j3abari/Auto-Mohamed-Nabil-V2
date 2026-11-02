-- ================================================================
-- Auto Mohamed Nabil V2 — Supabase Database Schema
-- Performax 1 | Run this in Supabase SQL Editor
-- ================================================================

-- ── Extensions ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- for full-text search

-- ================================================================
-- TABLE: admin_users
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE,
  password_hash TEXT NOT NULL,             -- bcrypt hash
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'staff'
                CHECK (role IN ('admin', 'staff')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login    TIMESTAMPTZ,
  last_ip       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: cars
-- ================================================================
CREATE TABLE IF NOT EXISTS cars (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  make              TEXT NOT NULL,
  model             TEXT NOT NULL,
  year              INTEGER NOT NULL CHECK (year BETWEEN 1990 AND 2030),
  variant           TEXT,
  body_type         TEXT,                  -- SUV, Sedan, Hatchback, Pickup, Van
  condition         TEXT DEFAULT 'used'
                    CHECK (condition IN ('new','used','certified')),

  -- السعر
  price             DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  original_price    DECIMAL(12,2),
  price_negotiable  BOOLEAN DEFAULT false,

  -- المواصفات
  mileage           INTEGER CHECK (mileage >= 0),
  fuel_type         TEXT CHECK (fuel_type IN ('petrol','diesel','electric','hybrid')),
  transmission      TEXT CHECK (transmission IN ('automatic','manual')),
  engine_cc         INTEGER,
  horsepower        INTEGER,
  color             TEXT,
  interior_color    TEXT,
  seats             INTEGER DEFAULT 5,
  doors             INTEGER DEFAULT 4,
  drive_type        TEXT CHECK (drive_type IN ('2wd','4wd','awd')),

  -- الحالة
  status            TEXT DEFAULT 'available'
                    CHECK (status IN ('available','reserved','sold','pending','archived')),
  is_featured       BOOLEAN DEFAULT false,
  is_published      BOOLEAN DEFAULT true,

  -- المحتوى
  description       TEXT,
  features          TEXT[] DEFAULT '{}',
  images            JSONB DEFAULT '[]',    -- [{url, alt, isPrimary}]
  inspection_report TEXT,                  -- PDF URL
  whatsapp_desc     TEXT,                  -- نص جاهز للواتساب

  -- SEO
  meta_title        TEXT,
  meta_description  TEXT,

  -- Analytics
  views_count       INTEGER DEFAULT 0,
  inquiries_count   INTEGER DEFAULT 0,

  -- Tracking
  created_by        UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: inquiries
-- ================================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_ref       TEXT UNIQUE NOT NULL,        -- INQ-2026-XXXXXX

  -- السيارة
  car_id            UUID REFERENCES cars(id) ON DELETE SET NULL,
  car_snapshot      JSONB,                       -- snapshot at inquiry time

  -- العميل
  customer_name     TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_email    TEXT,
  customer_city     TEXT,

  -- الاستفسار
  inquiry_type      TEXT DEFAULT 'general'
                    CHECK (inquiry_type IN ('general','price','test_drive','finance','trade_in')),
  message           TEXT,
  preferred_contact TEXT DEFAULT 'whatsapp'
                    CHECK (preferred_contact IN ('whatsapp','phone','email')),

  -- CRM
  status            TEXT DEFAULT 'new'
                    CHECK (status IN ('new','contacted','negotiating','won','lost','cancelled')),
  assigned_to       UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  follow_up_date    TIMESTAMPTZ,
  staff_notes       TEXT,

  -- المصدر
  source            TEXT DEFAULT 'website'
                    CHECK (source IN ('website','whatsapp','facebook','instagram','referral','walk_in')),
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,

  -- Security
  client_ip         TEXT,
  user_agent        TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: audit_logs
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email  TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  changes     JSONB,
  client_ip   TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES للأداء
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_cars_status       ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_is_featured   ON cars(is_featured);
CREATE INDEX IF NOT EXISTS idx_cars_is_published  ON cars(is_published);
CREATE INDEX IF NOT EXISTS idx_cars_make          ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_price         ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year          ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_slug          ON cars(slug);
CREATE INDEX IF NOT EXISTS idx_cars_make_model    ON cars(make, model);

CREATE INDEX IF NOT EXISTS idx_inquiries_status   ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_car_id   ON inquiries(car_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created  ON inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_user_id      ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created      ON audit_logs(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_cars_fts ON cars
  USING gin((make || ' ' || model || ' ' || COALESCE(variant,'') || ' ' || COALESCE(color,'')) gin_trgm_ops);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE cars         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs   ENABLE ROW LEVEL SECURITY;

-- Public: read published, non-archived cars only
CREATE POLICY "public_read_cars" ON cars
  FOR SELECT
  USING (is_published = true AND status != 'archived');

-- service_role bypasses RLS automatically — our backend uses service key ✓
-- All writes go through backend API only

-- ================================================================
-- FUNCTIONS
-- ================================================================

-- Increment inquiries_count atomically
CREATE OR REPLACE FUNCTION increment_inquiries(car_id_input UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE cars
  SET inquiries_count = inquiries_count + 1
  WHERE id = car_id_input;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_timestamp_cars
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_inquiries
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ================================================================
-- SEED: Default Admin User
-- Password = run node script below to get hash, then paste it
-- node -e "require('bcryptjs').hash('YOUR_PASSWORD', 12).then(h => console.log(h))"
-- ================================================================
-- INSERT INTO admin_users (username, email, password_hash, full_name, role)
-- VALUES (
--   'performax',
--   'admin@auto-mnabil.com',
--   '$2b$12$PASTE_BCRYPT_HASH_HERE',
--   'Performax Admin',
--   'admin'
-- );
