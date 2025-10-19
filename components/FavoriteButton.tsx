'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setUserId(u?.id ?? null);
      if (!u) return;

      const { data: exists } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', u.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      setFav(!!exists);
    })();
  }, [listingId]);

  async function toggle() {
    if (!userId) { window.location.href = '/login'; return; }
    if (busy) return;
    setBusy(true);

    if (fav) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
      setFav(false);
    } else {
      await supabase.from('favorites').insert([{ user_id: userId, listing_id: listingId }]);
      setFav(true);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      aria-label={fav ? 'Remove from saved' : 'Save listing'}
      className={`rounded-full p-2 ${fav ? 'bg-red-600 text-white' : 'bg-white text-black'} shadow`}
    >
      {/* simple heart icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-6.716-4.564-9.193-7.04C.79 11.944.5 9.23 2.343 7.39a5.25 5.25 0 017.425 0L12 9.62l2.232-2.232a5.25 5.25 0 117.425 7.425C18.716 16.436 12 21 12 21z" />
      </svg>
    </button>
  );
}
