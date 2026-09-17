"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(true);
  const identity = useRef<string | null | undefined>(undefined);
  const generation = useRef(0);
  const mutating = useRef(false);

  useEffect(() => {
    let active = true;
    let authEvents = 0;
    let pending: ReturnType<typeof setTimeout> | undefined;
    const invalidate = () => { generation.current++; };
    identity.current = undefined;
    const loadIdentity = (id: string | null) => {
      if (!active || identity.current === id) return;
      identity.current = id;
      const current = ++generation.current;
      mutating.current = false;
      setUserId(id);
      setFav(false);
      setBusy(!!id);
      clearTimeout(pending);
      if (!id) return;
      // Auth callbacks must finish before starting another Supabase operation.
      pending = setTimeout(() => {
        void (async () => {
          try {
            const { data, error } = await supabase.from('favorites')
              .select('listing_id').eq('user_id', id).eq('listing_id', listingId).maybeSingle();
            if (active && current === generation.current && !error) setFav(!!data);
          } finally {
            if (active && current === generation.current) setBusy(false);
          }
        })().catch(() => { /* Leave the control unsaved after a failed lookup. */ });
      }, 0);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      authEvents++;
      loadIdentity(session?.user.id ?? null);
    });
    const initialEvents = authEvents;
    void supabase.auth.getUser().then(({ data }) => {
      if (authEvents === initialEvents) loadIdentity(data.user?.id ?? null);
    }).catch(() => {
      if (authEvents === initialEvents) loadIdentity(null);
    });
    return () => {
      active = false;
      invalidate();
      clearTimeout(pending);
      sub.subscription.unsubscribe();
    };
  }, [listingId, supabase]);

  const toggle = useCallback(async () => {
    if (busy || mutating.current) return;
    if (!userId) {
      window.location.href = '/login';
      return;
    }
    const current = generation.current;
    mutating.current = true;
    setBusy(true);
    const next = !fav;
    try {
      // Revalidate before using a cached identity for a write.
      const { data, error: authError } = await supabase.auth.getUser();
      if (current !== generation.current) return;
      if (authError || data.user?.id !== userId) {
        window.location.reload();
        return;
      }
      setFav(next);
      const { error } = next
        ? await supabase.from('favorites').insert([{ user_id: userId, listing_id: listingId }])
        : await supabase.from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
      if (error) throw error;
    } catch (error) {
      if (current === generation.current) {
        setFav(!next);
        console.error('Favorite toggle failed:', error);
      }
    } finally {
      if (current === generation.current) {
        mutating.current = false;
        setBusy(false);
      }
    }
  }, [busy, fav, listingId, supabase, userId]);

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "Remove from saved" : "Save listing"}
      className={`rounded-full p-2 ${fav ? "bg-red-600 text-white" : "bg-white text-black"} shadow`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-6.716-4.564-9.193-7.04C.79 11.944.5 9.23 2.343 7.39a5.25 5.25 0 017.425 0L12 9.62l2.232-2.232a5.25 5.25 0 117.425 7.425C18.716 16.436 12 21 12 21z" />
      </svg>
    </button>
  );
}
