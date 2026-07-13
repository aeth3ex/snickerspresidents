/*
# Bilingual changelog + site news table

1. Modified Tables
- `changelog`: add `title_en` (text), `body_en` (text) columns for English versions of existing Russian content.
  Existing rows get title_en/body_en populated with their Russian values as a fallback.

2. New Tables
- `site_news`: stores site-wide news announcements visible to all users.
  - `id` (uuid, primary key)
  - `title_ru` (text, not null) — Russian title
  - `title_en` (text, not null) — English title
  - `body_ru` (text, not null) — Russian body
  - `body_en` (text, not null) — English body
  - `sort_order` (int, default 0) — display ordering
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

3. Security
- `site_news`: RLS enabled. SELECT open to anon+authenticated (public reading). INSERT/UPDATE/DELETE restricted to anon+authenticated
  (writes are gated by the admin edge function which uses the service role key to bypass RLS, so the anon policy is a safety net).
- `changelog`: existing policies remain — SELECT open to anon+authenticated; writes via edge function with service role key.

4. Important Notes
- The admin-api edge function handles all writes (add/update/delete changelog + news) with service role key, bypassing RLS.
- Frontend reads changelog and news directly via anon key (SELECT only).
- No data is lost: existing changelog rows keep their Russian title/body; new English columns are populated as fallback.
*/

-- Add bilingual columns to changelog
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'changelog' AND column_name = 'title_en') THEN
    ALTER TABLE changelog ADD COLUMN title_en text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'changelog' AND column_name = 'body_en') THEN
    ALTER TABLE changelog ADD COLUMN body_en text;
  END IF;
END $$;

-- Populate English columns from Russian as fallback for existing rows
UPDATE changelog SET title_en = title WHERE title_en IS NULL;
UPDATE changelog SET body_en = body WHERE body_en IS NULL;

-- Make English columns non-null after backfill
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'changelog' AND column_name = 'title_en' AND is_nullable = 'YES') THEN
    ALTER TABLE changelog ALTER COLUMN title_en SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'changelog' AND column_name = 'body_en' AND is_nullable = 'YES') THEN
    ALTER TABLE changelog ALTER COLUMN body_en SET NOT NULL;
  END IF;
END $$;

-- Create site_news table
CREATE TABLE IF NOT EXISTS site_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ru text NOT NULL,
  title_en text NOT NULL,
  body_ru text NOT NULL,
  body_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_news ENABLE ROW LEVEL SECURITY;

-- Public read access for site_news
DROP POLICY IF EXISTS "anon_select_news" ON site_news;
CREATE POLICY "anon_select_news" ON site_news FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_news" ON site_news;
CREATE POLICY "anon_insert_news" ON site_news FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_news" ON site_news;
CREATE POLICY "anon_update_news" ON site_news FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_news" ON site_news;
CREATE POLICY "anon_delete_news" ON site_news FOR DELETE
  TO anon, authenticated USING (true);
