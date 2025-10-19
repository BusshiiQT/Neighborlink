import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = supabaseServer();
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Include latest 100 listings
  const { data } = await supabase
    .from('listings')
    .select('id,updated_at:created_at')
    .eq('status','active')
    .order('created_at', { ascending: false })
    .limit(100);

  const items = (data || []).map((r: any) => ({
    url: `${base}/listing/${r.id}`,
    lastModified: r.updated_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...items,
  ];
}
