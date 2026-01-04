'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import ListingCard from '@/components/ListingCard';
import FiltersBar, { type Filters } from '@/components/FiltersBar';
import SaveSearchButton from '@/components/SaveSearchButton';

const SearchMap = dynamic(() => import('@/components/SearchMap'), { ssr: false });

type Listing = {
  id: string;
  title: string;
  price: number | null;
  city: string | null;
  state?: string | null;
  created_at: string;
  listing_media?: { url: string }[];
  category_id: number | null;
  latitude: number | null;
  longitude: number | null;
  condition?: string | null;
  image?: string; // used by sample listings only
};

const PAGE_SIZE = 18;
const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ---- Fake fallback listings (shown when DB query returns 0 or on error, or DEMO mode) ----
const sampleListings: Listing[] = [
  {
    id: 'demo-1',
    title: 'Modern Sofa - Excellent Condition',
    price: 450,
    city: 'Chicago',
    state: 'IL',
    image: 'https://picsum.photos/id/1060/800/600',
    created_at: new Date().toISOString(),
    category_id: 1,
    latitude: 41.8781,
    longitude: -87.6298,
    condition: 'Like New',
  },
  {
    id: 'demo-2',
    title: 'MacBook Pro 14” (M2, 2023)',
    price: 1350,
    city: 'Evanston',
    state: 'IL',
    image: 'https://picsum.photos/id/180/800/600',
    created_at: new Date().toISOString(),
    category_id: 2,
    latitude: 42.0451,
    longitude: -87.6877,
    condition: 'Excellent',
  },
  {
    id: 'demo-3',
    title: 'Mountain Bike - Trek Marlin 6',
    price: 550,
    city: 'Naperville',
    state: 'IL',
    image: 'https://picsum.photos/id/367/800/600',
    created_at: new Date().toISOString(),
    category_id: 3,
    latitude: 41.7508,
    longitude: -88.1535,
    condition: 'Good',
  },
  {
    id: 'demo-4',
    title: 'Samsung 55” 4K Smart TV',
    price: 300,
    city: 'Aurora',
    state: 'IL',
    image: 'https://picsum.photos/id/1080/800/600',
    created_at: new Date().toISOString(),
    category_id: 2,
    latitude: 41.7606,
    longitude: -88.3201,
    condition: 'Used',
  },
  {
    id: 'demo-5',
    title: 'KitchenAid Mixer',
    price: 200,
    city: 'Oak Park',
    state: 'IL',
    image: 'https://picsum.photos/id/292/800/600',
    created_at: new Date().toISOString(),
    category_id: 5,
    latitude: 41.885,
    longitude: -87.7845,
    condition: 'Like New',
  },
  {
    id: 'demo-6',
    title: 'iPhone 14 Pro Max - 256GB',
    price: 950,
    city: 'Schaumburg',
    state: 'IL',
    image: 'https://picsum.photos/id/1010/800/600',
    created_at: new Date().toISOString(),
    category_id: 2,
    latitude: 42.0334,
    longitude: -88.0834,
    condition: 'Excellent',
  },
  {
    id: 'demo-7',
    title: 'Wooden Dining Table (6-Seater)',
    price: 650,
    city: 'Skokie',
    state: 'IL',
    image: 'https://picsum.photos/id/349/800/600',
    created_at: new Date().toISOString(),
    category_id: 1,
    latitude: 42.0324,
    longitude: -87.7416,
    condition: 'Good',
  },
  {
    id: 'demo-8',
    title: 'Leather Recliner Chair',
    price: 180,
    city: 'Chicago',
    state: 'IL',
    image: 'https://picsum.photos/id/433/800/600',
    created_at: new Date().toISOString(),
    category_id: 1,
    latitude: 41.8781,
    longitude: -87.6298,
    condition: 'Used',
  },
];

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>({
    q: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    city: '',
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [page, setPage] = useState(0);
  const [mapView, setMapView] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      // DEMO mode: always show samples and stop here
      if (DEMO) {
        if (!cancelled) {
          setListings(sampleListings);
          setCanLoadMore(false);
          setLoading(false);
        }
        return;
      }

      let query = supabase
        .from('listings')
        .select(
          'id,title,price,city,state,created_at,listing_media(url),category_id,latitude,longitude,condition',
          { count: 'exact' }
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      // categoryId is number | ''
      if (filters.categoryId !== '') {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.city.trim()) {
        query = query.ilike('city', `%${filters.city.trim()}%`);
      }
      if (filters.minPrice.trim()) {
        const v = Number(filters.minPrice);
        if (!Number.isNaN(v)) query = query.gte('price', v);
      }
      if (filters.maxPrice.trim()) {
        const v = Number(filters.maxPrice);
        if (!Number.isNaN(v)) query = query.lte('price', v);
      }
      if (filters.q.trim()) {
        query = query.ilike('title', `%${filters.q.trim()}%`);
      }

      const { data, error, count } = await query;

      // If a newer request started, ignore this response
      if (cancelled) return;

      if (error) {
        console.error('[Search] Supabase error:', error.message);
        // Fallback on error (only on first page)
        if (page === 0) {
          setListings(sampleListings);
          setCanLoadMore(false);
        }
        setLoading(false);
        return;
      }

      const fetched = (data as Listing[]) ?? [];

      // Fallback when no results on first page
      if (page === 0 && fetched.length === 0) {
        setListings(sampleListings);
        setCanLoadMore(false);
        setLoading(false);
        return;
      }

      setListings((prev) => (page === 0 ? fetched : [...prev, ...fetched]));

      const total = count ?? 0;
      const loaded = (page + 1) * PAGE_SIZE;
      setCanLoadMore(loaded < total);

      setLoading(false);
    })();

    // Cleanup cancels in-flight request from overwriting newer state
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  function onApply(newFilters: Filters) {
    setPage(0);
    setFilters(newFilters);
  }

  function loadMore() {
    if (!canLoadMore || loading) return;
    setPage((p) => p + 1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Browse listings</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapView((v) => !v)}
            className="px-3 py-1.5 rounded border"
          >
            {mapView ? 'Show Grid' : 'Show Map'}
          </button>
          <SaveSearchButton filters={filters} />
        </div>
      </div>

      <FiltersBar value={filters} onChange={onApply} />

      {mapView ? (
        <SearchMap listings={listings as any} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={{
                  ...l,
                  // If sample listing has a bare `image`, convert it to listing_media
                  listing_media: l.listing_media ?? (l.image ? [{ url: l.image }] : []),
                }}
              />
            ))}

            {!loading && listings.length === 0 && (
              <div className="text-slate-600">No listings match your filters.</div>
            )}
          </div>

          <div className="flex justify-center pt-2">
            {canLoadMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 py-2 rounded border disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
