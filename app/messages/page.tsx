// app/messages/page.tsx

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabaseServer';

type Thread = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
};

export default async function MessagesPage() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('threads')
    .select('id, listing_id, buyer_id, seller_id')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

  if (error) {
    console.error('[Messages] Failed to load threads:', error.message);

    return (
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Messages</h1>

        <p className="text-red-500">
          Failed to load messages.
        </p>
      </main>
    );
  }

  const threads = (data as Thread[]) ?? [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="rounded-xl border border-slate-800 p-6">
          <p className="font-medium">No conversations yet</p>

          <p className="mt-1 text-sm text-slate-400">
            When you message a seller, your conversations will appear here.
          </p>

          <Link
            href="/search"
            className="inline-block mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {threads.map((thread) => {
            const isBuyer = thread.buyer_id === user.id;

            return (
              <li key={thread.id}>
                <Link
                  href={`/messages/${thread.id}`}
                  className="block rounded-xl border border-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-900/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        Conversation
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {isBuyer
                          ? 'Conversation with seller'
                          : 'Conversation with buyer'}
                      </p>
                    </div>

                    <span className="text-sm text-slate-400">
                      Open →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}