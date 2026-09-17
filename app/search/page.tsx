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
};

const PAGE_SIZE = 18;

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

      let query = supabase
        .from('listings')
        .select(
          'id,title,price,city,state,created_at,listing_media(url),category_id,latitude,longitude,condition',
          { count: 'exact' }
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (filters.categoryId !== '') {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.city.trim()) {
        query = query.ilike('city', `%${filters.city.trim()}%`);
      }

      if (filters.minPrice.trim()) {
        const value = Number(filters.minPrice);

        if (!Number.isNaN(value)) {
          query = query.gte('price', value);
        }
      }

      if (filters.maxPrice.trim()) {
        const value = Number(filters.maxPrice);

        if (!Number.isNaN(value)) {
          query = query.lte('price', value);
        }
      }

      if (filters.q.trim()) {
        query = query.ilike('title', `%${filters.q.trim()}%`);
      }

      const { data, error, count } = await query;

      // Ignore this response if a newer search has already started.
      if (cancelled) {
        return;
      }

      if (error) {
        console.error('[Search] Supabase error:', error.message);

        if (page === 0) {
          setListings([]);
          setCanLoadMore(false);
        }

        setLoading(false);
        return;
      }

      const fetched = (data as Listing[]) ?? [];

      setListings((previousListings) =>
        page === 0 ? fetched : [...previousListings, ...fetched]
      );

      const total = count ?? 0;
      const loaded = (page + 1) * PAGE_SIZE;

      setCanLoadMore(loaded < total);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  function onApply(newFilters: Filters) {
    setPage(0);
    setFilters(newFilters);
  }

  function loadMore() {
    if (!canLoadMore || loading) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Browse listings</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapView((current) => !current)}
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
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
              />
            ))}

            {!loading && listings.length === 0 && (
              <div className="text-slate-600">
                No listings match your filters.
              </div>
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