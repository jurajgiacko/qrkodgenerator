-- QR Kód Generátor - Databázová schéma pre Supabase
-- Spustite tento SQL v Supabase SQL Editor

-- Tabuľka používateľov (pre interné prihlásenie)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabuľka QR kódov
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id VARCHAR(8) UNIQUE NOT NULL,
  name VARCHAR(100),
  target_url TEXT NOT NULL,
  logo_type VARCHAR(20) CHECK (logo_type IN ('enervit', 'royalbay')),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Tabuľka skenov (analytika)
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_id ON qr_codes(short_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_qr_code_id ON scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at);

-- Testovací používateľ
-- Email: enervit / Heslo: enervit123
INSERT INTO users (email, password_hash, name) VALUES 
  ('enervit', '$2b$10$Dw6sIx5KVtx7OLJRgCzNGeOx8roRTqJ19484MxkyL2yj4l/BSvlkC', 'Enervit')
ON CONFLICT (email) DO NOTHING;
