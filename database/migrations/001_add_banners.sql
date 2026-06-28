-- Migration: Add banners/slider table
-- Run this against your existing database to add banner support

CREATE TABLE IF NOT EXISTS banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) NOT NULL,
  subtitle    VARCHAR(500),
  description TEXT,
  image_url   VARCHAR(500),
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  bg_color    VARCHAR(20) DEFAULT '#1a1a2e',
  text_color  VARCHAR(20) DEFAULT '#ffffff',
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
