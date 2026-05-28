-- ══════════════════════════════════════════════
--  TIMTIML DATABASE SETUP
--  Run this in Supabase → SQL Editor → New query
-- ══════════════════════════════════════════════

-- ── USERS ──
CREATE TABLE IF NOT EXISTS users (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── LESSON PROGRESS ──
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email   TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  course       TEXT NOT NULL,  -- e.g. 'html', 'python', 'olevel-cs'
  lesson_num   INTEGER NOT NULL,
  quiz_passed  BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, course, lesson_num)
);

-- ── TESTIMONIALS ──
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  service      TEXT NOT NULL,
  text         TEXT NOT NULL,
  stars        INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  location     TEXT,
  approval_code TEXT NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at  TIMESTAMPTZ
);

-- ── PAYMENTS ──
CREATE TABLE IF NOT EXISTS payments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  currency     TEXT NOT NULL,
  amount       TEXT NOT NULL,
  ref_code     TEXT NOT NULL UNIQUE,
  verified     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  verified_at  TIMESTAMPTZ
);

-- ── INDEXES for fast lookups ──
CREATE INDEX IF NOT EXISTS idx_progress_email  ON lesson_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_progress_course ON lesson_progress(course);
CREATE INDEX IF NOT EXISTS idx_testis_status   ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_payments_ref    ON payments(ref_code);

-- ── Row Level Security (keep data safe) ──
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS so our Python API can read/write everything
-- Public (anon) role has no access — all reads/writes go through our API

SELECT 'Database setup complete! ✅' AS result;
