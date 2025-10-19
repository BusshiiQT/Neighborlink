'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SmartReplies from '@/components/SmartReplies';

type Msg = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = (params?.id as string) || '';

  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);

  // Initial auth + load + mark read
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.push('/login');
        return;
      }
      setMe(user.id);

      // Load history
      const { data: rows, error } = await supabase
        .from('messages')
        .select('id,thread_id,sender_id,body,created_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      setMsgs((rows as Msg[]) ?? []);
      setLoading(false);

      // Mark read for this thread
      await supabase.rpc('mark_thread_read', { p_thread: threadId });
    })();
  }, [router, threadId]);

  // Realtime: new messages in this thread
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        async (payload: any) => {
          const m = payload.new as Msg;
          setMsgs((prev) => [...prev, m]);
          // If incoming from the other person, mark read
          if (me && m.sender_id !== me) {
            await supabase.rpc('mark_thread_read', { p_thread: threadId });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, me]);

  // Mark read when window regains focus (handy on desktop)
  useEffect(() => {
    function onFocus() {
      if (threadId) {
        supabase.rpc('mark_thread_read', { p_thread: threadId });
      }
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [threadId]);

  async function send() {
    if (!me) return;
    const text = newMsg.trim();
    if (!text) return;

    const { error } = await supabase.from('messages').insert([
      {
        thread_id: threadId,
        sender_id: me,
        body: text,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setNewMsg('');
    // Mark my thread as read after sending (resets my side of unread counter)
    await supabase.rpc('mark_thread_read', { p_thread: threadId });
  }

  // Smart replies history (last few)
  const historyForAI = useMemo(
    () =>
      msgs.slice(-8).map((m) => ({
        sender: m.sender_id === me ? ('me' as const) : ('them' as const),
        text: m.body,
      })),
    [msgs, me]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Conversation</h1>

      {loading ? (
        <div>Loading…</div>
      ) : msgs.length === 0 ? (
        <div className="text-slate-400">No messages yet. Say hi!</div>
      ) : (
        <ul className="space-y-2">
          {msgs.map((m) => {
            const mine = m.sender_id === me;
            return (
              <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? 'bg-white text-black' : 'bg-slate-800 text-white'
                  }`}
                  title={new Date(m.created_at).toLocaleString()}
                >
                  {m.body}
                </div>
              </li>
            );
          })}
          <div ref={endRef} />
        </ul>
      )}

      {/* Smart replies */}
      <div className="pt-2">
        <SmartReplies
          history={historyForAI}
          onPick={(t) => setNewMsg(t)}
        />
      </div>

      {/* Composer */}
      <div className="mt-2 flex items-center gap-2">
        <input
          className="flex-1 border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
          placeholder="Type a message…"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded bg-white text-black font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
