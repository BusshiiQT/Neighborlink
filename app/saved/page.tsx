'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ListingCard from '@/components/ListingCard';

type Listing = {
  id: string;
  title: string;
  price: number | null;
  city: string | null;
  created_at: string;
  listing_media?: { url: string }[];
};

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const user = u.user;
      if (!user) { window.location.href = '/login'; return; }

      // Join favorites -> listings (+ media)
      const { data, error } = await supabase
        .from('favorites')
        .select('listing:listing_id(id,title,price,city,created_at,listing_media(url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      setListings(((data as any) || []).map((r: any) => r.listing).filter(Boolean));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-6">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold">Saved</h1>
      {listings.length === 0 ? (
        <div className="text-slate-600">You haven’t saved anything yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
