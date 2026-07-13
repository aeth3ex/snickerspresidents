/*
# Create changelog table and admin settings

1. New Tables
- `changelog` — stores version changelog entries visible to all users
  - `id` (uuid, primary key)
  - `version` (text, not null) — version label e.g. "v1.0"
  - `title` (text, not null) — short title for the update
  - `body` (text, not null) — full changelog text (multi-line)
  - `created_at` (timestamptz, default now())
  - `sort_order` (int, default 0) — higher = newer, for ordering
- `admin_settings` — stores admin configuration (admin code hash, current version label)
  - `id` (int, primary key, always 1) — singleton row
  - `admin_code_hash` (text, not null) — SHA-256 hash of the admin code
  - `current_version` (text, default 'v1.0') — shown in the UI badge
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- changelog: public read (anon + authenticated), write only via service role (edge function)
- admin_settings: NO public read — only accessible via edge function with service role key
*/

CREATE TABLE IF NOT EXISTS changelog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_code_hash text NOT NULL,
  current_version text NOT NULL DEFAULT 'v1.0',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- changelog: anyone can read (public changelog), no direct public writes
DROP POLICY IF EXISTS "public_read_changelog" ON changelog;
CREATE POLICY "public_read_changelog" ON changelog FOR SELECT
  TO anon, authenticated USING (true);

-- admin_settings: completely locked from anon/authenticated — only service role can access
DROP POLICY IF EXISTS "public_read_admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "public_write_admin_settings" ON admin_settings;
-- No policies = locked. Service role bypasses RLS.

-- Seed initial admin code hash: SHA-256 of "2003"
-- This is the initial admin code, changeable via the admin panel
INSERT INTO admin_settings (id, admin_code_hash, current_version)
VALUES (1, '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd9aca41327c6f5e8a7', 'v1.0')
ON CONFLICT (id) DO NOTHING;

-- Seed initial changelog entry
INSERT INTO changelog (version, title, body, sort_order)
VALUES ('v1.0', 'Релиз Snickers Presidents', 'Первый релиз игры Snickers Presidents.

Что включено:
- Полностью переписанная игра на React + TypeScript
- 7 типов юнитов: B, K, M, W, D, E, R
- Атака, лечение, захват клеток, дипломатия
- Лимит 1 атака на юнита за ход
- Режим разработчика (секретный код)
- Блокнот ИИ для заметок
- История ходов с экспортом
- Сетки 3x3 до 20x20', 1)
ON CONFLICT DO NOTHING;
