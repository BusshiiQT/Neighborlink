'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function MessageButton({
  listingId,
  sellerId,
}: {
  listingId: string;
  sellerId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function startThread() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const me = userData.user;
    if (!me) {
      router.push('/login');
      return;
    }

    // Find existing thread
    const { data: existing } = await supabase
      .from('threads')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', me.id)
      .eq('seller_id', sellerId)
      .maybeSingle();

    let threadId = existing?.id;

    if (!threadId) {
      // Create new thread
      const { data, error } = await supabase
        .from('threads')
        .insert([
          { listing_id: listingId, buyer_id: me.id, seller_id: sellerId },
        ])
        .select('id')
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      threadId = data.id;
    }

    router.push(`/messages/${threadId}`);
  }

  return (
    <button
      onClick={startThread}
      disabled={loading}
      className="w-full rounded-lg bg-black text-white py-2 hover:bg-black/80 transition disabled:opacity-50"
    >
      {loading ? 'Opening…' : 'Message seller'}
    </button>
  );
}
