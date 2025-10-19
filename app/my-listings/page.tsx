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

export default function MyListingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) { window.location.href = '/login'; return; }
      setUserId(user.id);
      await load(user.id);
    })();
  }, []);

  async function load(uid: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('id,title,price,city,created_at,listing_media(url)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setListings((data as any) || []);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!userId) return;
    if (!confirm('Delete this listing and its images? This cannot be undone.')) return;

    // 1) Delete Storage files for this listing (prefix = userId/listingId/)
    const prefix = `${userId}/${id}/`;
    // list files at that prefix (may need multiple depths; here we list the folder)
    const { data: files, error: listErr } = await supabase
      .storage
      .from('listing-images')
      .list(prefix, { limit: 100 });

    if (listErr) console.error('list storage error:', listErr);

    if (files && files.length) {
      // build paths to remove
      const paths = files.map((f) => `${prefix}${f.name}`);
      const { error: rmErr } = await supabase.storage.from('listing-images').remove(paths);
      if (rmErr) console.error('remove storage error:', rmErr);
    }

    // 2) Delete listing (FK cascade removes listing_media rows)
    const { error: delErr } = await supabase.from('listings').delete().eq('id', id);
    if (delErr) {
      alert(delErr.message);
      return;
    }

    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-6">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Listings</h1>
        <a href="/create-listing" className="px-3 py-1.5 rounded-full bg-black text-white">New</a>
      </div>

      {listings.length === 0 ? (
        <div className="text-slate-600">
          You haven’t posted anything yet. <a className="underline" href="/create-listing">Create your first listing</a>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="relative">
              <ListingCard listing={l} />
              <div className="mt-2 flex gap-2">
                <a href={`/listing/${l.id}`} className="px-3 py-1.5 border rounded">View</a>
                <button onClick={() => remove(l.id)} className="px-3 py-1.5 border rounded text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
