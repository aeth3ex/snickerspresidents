import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EDGE_URL = `${supabaseUrl}/functions/v1/admin-api`;

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  title_en: string;
  body: string;
  body_en: string;
  created_at: string;
  sort_order: number;
}

export interface NewsEntry {
  id: string;
  title_ru: string;
  title_en: string;
  body_ru: string;
  body_en: string;
  sort_order: number;
  created_at: string;
}

export async function fetchChangelog(): Promise<ChangelogEntry[]> {
  const res = await fetch(`${EDGE_URL}/changelog`);
  if (!res.ok) throw new Error(`Failed to fetch changelog: ${res.status}`);
  const data = await res.json();
  return data.entries as ChangelogEntry[];
}

export async function fetchVersion(): Promise<string> {
  const res = await fetch(`${EDGE_URL}/version`);
  if (!res.ok) return 'v1.0';
  const data = await res.json();
  return data.version as string;
}

export async function verifyAdminCode(code: string): Promise<boolean> {
  const res = await fetch(`${EDGE_URL}/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.is_admin === true;
}

export async function addChangelogEntry(
  code: string,
  version: string,
  title: string,
  titleEn: string,
  body: string,
  bodyEn: string,
  sortOrder: number
): Promise<ChangelogEntry> {
  const res = await fetch(`${EDGE_URL}/changelog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, version, title, title_en: titleEn, body, body_en: bodyEn, sort_order: sortOrder }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to add entry');
  const data = await res.json();
  return data.entry;
}

export async function updateChangelogEntry(
  code: string,
  id: string,
  updates: {
    version?: string;
    title?: string;
    title_en?: string;
    body?: string;
    body_en?: string;
    sort_order?: number;
  }
): Promise<ChangelogEntry> {
  const res = await fetch(`${EDGE_URL}/changelog/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, ...updates }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update entry');
  const data = await res.json();
  return data.entry;
}

export async function deleteChangelogEntry(code: string, id: string): Promise<void> {
  const res = await fetch(`${EDGE_URL}/changelog/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete entry');
}

export async function changeAdminCode(code: string, newCode: string): Promise<void> {
  const res = await fetch(`${EDGE_URL}/change-code`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, new_code: newCode }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to change code');
}

export async function updateVersion(code: string, version: string): Promise<void> {
  const res = await fetch(`${EDGE_URL}/version`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, version }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update version');
}

export async function fetchNews(): Promise<NewsEntry[]> {
  const res = await fetch(`${EDGE_URL}/news`);
  if (!res.ok) throw new Error(`Failed to fetch news: ${res.status}`);
  const data = await res.json();
  return data.entries as NewsEntry[];
}

export async function addNewsEntry(
  code: string,
  titleRu: string,
  titleEn: string,
  bodyRu: string,
  bodyEn: string,
  sortOrder: number
): Promise<NewsEntry> {
  const res = await fetch(`${EDGE_URL}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, title_ru: titleRu, title_en: titleEn, body_ru: bodyRu, body_en: bodyEn, sort_order: sortOrder }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to add news');
  const data = await res.json();
  return data.entry;
}

export async function updateNewsEntry(
  code: string,
  id: string,
  updates: {
    title_ru?: string;
    title_en?: string;
    body_ru?: string;
    body_en?: string;
    sort_order?: number;
  }
): Promise<NewsEntry> {
  const res = await fetch(`${EDGE_URL}/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, ...updates }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update news');
  const data = await res.json();
  return data.entry;
}

export async function deleteNewsEntry(code: string, id: string): Promise<void> {
  const res = await fetch(`${EDGE_URL}/news/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete news');
}
