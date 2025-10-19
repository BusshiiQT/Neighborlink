// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getSupabaseServer } from '@/lib/supabaseServer';

const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ✅ await the client
  const supabase = await getSupabaseServer();

  // Pull latest 100 active listings
  const { data, error } = await supabase
    .from('listings')
    .select('id, created_at, updated_at, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100);

  // Always return at least core routes
  const baseEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  if (error || !data) return baseEntries;

  const listingEntries: MetadataRoute.Sitemap = data.map((row) => ({
    url: `${BASE_URL}/listing/${row.id}`,
    lastModified: new Date(row.updated_at ?? row.created_at ?? Date.now()),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [...baseEntries, ...listingEntries];
}
