-- Migration: Add about_sections table for dynamic "About Us" page content

CREATE TABLE IF NOT EXISTS about_sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE,
  type        VARCHAR(20) NOT NULL DEFAULT 'card' CHECK (type IN ('intro', 'card')),
  icon        VARCHAR(50) DEFAULT 'Info',
  color       VARCHAR(20) DEFAULT '#8B0000',
  title       VARCHAR(255) NOT NULL,
  content     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO about_sections (section_key, type, icon, color, title, content, sort_order) VALUES
  ('who_we_are', 'intro', 'Info',  '#8B0000', 'Who We Are',
   'The Sourashtra community is a vibrant group of people with roots in Gujarat who have settled predominantly in Tamil Nadu over centuries. Known for their skills in silk weaving, the Sourashtra people have made significant contributions to the textile industry of Tamil Nadu.

The Sourashtra Community Portal is a digital platform designed to connect community members, preserve cultural heritage, and facilitate community welfare activities across Tamil Nadu and beyond.', 1),
  ('mission', 'card', 'Target', '#8B0000', 'Our Mission',
   'To foster unity, preserve culture and promote the welfare of the Sourashtra community through digital innovation and community engagement.', 10),
  ('vision', 'card', 'Eye', '#2563eb', 'Our Vision',
   'A connected, prosperous and culturally vibrant Sourashtra community that thrives while preserving its rich heritage and traditions.', 20),
  ('values', 'card', 'Gem', '#7c3aed', 'Our Values',
   'Community first, cultural preservation, education, mutual support, transparency and inclusive growth for all members.', 30),
  ('commitment', 'card', 'Users', '#059669', 'Our Commitment',
   'We are committed to providing quality services, supporting education, enabling business networking and organizing cultural events.', 40)
ON CONFLICT (section_key) DO NOTHING;
