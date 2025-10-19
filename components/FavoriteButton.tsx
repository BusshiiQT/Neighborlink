"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function FavoriteButton({ listingId }: { listingId: string }) {
  // Create the browser client only on the client
  const supabase = useMemo(() => getSupabaseBrowser(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load initial state: current user + whether this listing is favorited
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;

      const u = data?.user ?? null;
      setUserId(u?.id ?? null);
      if (!u) return;

      const { data: exists, error: favErr } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", u.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (!alive) return;
      if (!favErr) setFav(!!exists);
    })();

    return () => {
      alive = false;
    };
  }, [listingId, supabase]);

  const toggle = useCallback(async () => {
    if (!userId) {
      // route to your auth page if not signed in
      window.location.href = "/login";
      return;
    }
    if (busy) return;

    setBusy(true);

    // optimistic update
    const next = !fav;
    setFav(next);

    try {
      if (next) {
        const { error } = await supabase
          .from("favorites")
          .insert([{ user_id: userId, listing_id: listingId }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId);
        if (error) throw error;
      }
    } catch (e) {
      // rollback on failure
      setFav(!next);
      console.error("Favorite toggle failed:", e);
      // optionally show a toast/alert here
    } finally {
      setBusy(false);
    }
  }, [busy, fav, listingId, supabase, userId]);

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "Remove from saved" : "Save listing"}
      className={`rounded-full p-2 ${
        fav ? "bg-red-600 text-white" : "bg-white text-black"
      } shadow`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-6.716-4.564-9.193-7.04C.79 11.944.5 9.23 2.343 7.39a5.25 5.25 0 017.425 0L12 9.62l2.232-2.232a5.25 5.25 0 117.425 7.425C18.716 16.436 12 21 12 21z" />
      </svg>
    </button>
  );
}
