// app/messages/page.tsx
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabaseServer';

type ThreadRow = {
  id: string;
  last_message_at: string | null;
  buyer_id: string;
  seller_id: string;
  unread_buyer: number | null;
  unread_seller: number | null;
  listing: { title: string } | { title: string }[] | null;
};

export default async function MessagesPage() {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="max-w-4xl mx-auto px-4 py-6">Please log in to view your messages.</div>;
  }

  const { data: threads, error } = await supabase
    .from('threads')
    .select(`
      id,
      listing_id,
      buyer_id,
      seller_id,
      unread_buyer,
      unread_seller,
      last_message_at,
      listing:listing_id ( title )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    return <div className="max-w-4xl mx-auto px-4 py-6">Error loading messages: {error.message}</div>;
  }

  const rows = (threads as ThreadRow[]) ?? [];

  const getTitle = (row: ThreadRow) =>
    !row.listing
      ? 'Listing'
      : Array.isArray(row.listing)
      ? row.listing[0]?.title ?? 'Listing'
      : row.listing.title ?? 'Listing';

  const unreadForMe = (row: ThreadRow) =>
    row.buyer_id === user.id ? row.unread_buyer ?? 0 : row.unread_seller ?? 0;

  if (rows.length === 0) {
    return <div className="max-w-4xl mx-auto px-4 py-6">No messages yet.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Messages</h1>
      <ul className="divide-y border rounded-lg">
        {rows.map((t) => {
          const unread = unreadForMe(t);
          return (
            <li key={t.id} className="p-4 hover:bg-slate-50">
              <Link href={`/messages/${t.id}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{getTitle(t)}</span>
                  {unread > 0 && (
                    <span className="text-xs bg-red-600 text-white rounded-full px-2 py-[2px]">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {t.last_message_at ? new Date(t.last_message_at).toLocaleString() : '—'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
