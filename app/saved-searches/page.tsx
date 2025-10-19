'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type SavedSearch = { id: string; name: string; filters: any; last_seen_at: string; };

export default function SavedSearchesPage() {
  const [rows, setRows] = useState<SavedSearch[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { window.location.href = '/login'; return; }
      const { data } = await supabase.from('saved_searches').select('*').order('created_at', { ascending: false });
      setRows((data as any) || []);
      setLoading(false);
      // fetch counts
      for (const r of (data as any) || []) {
        const { data: c } = await supabase.rpc('saved_search_new_count', { p_search_id: r.id });
        setCounts((prev) => ({ ...prev, [r.id]: (c as number) ?? 0 }));
      }
    })();
  }, []);

  async function markSeen(id: string) {
    await supabase.rpc('saved_search_mark_seen', { p_search_id: id });
    setCounts((prev) => ({ ...prev, [id]: 0 }));
  }

  async function remove(id: string) {
    if (!confirm('Delete this saved search?')) return;
    await supabase.from('saved_searches').delete().eq('id', id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-6">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Saved searches</h1>
      {rows.length === 0 ? (
        <div className="text-slate-600">No saved searches yet. Create one from the Search page.</div>
      ) : (
        <ul className="divide-y border rounded-lg">
          {rows.map((r) => (
            <li key={r.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs text-slate-600 truncate">
                  {JSON.stringify(r.filters)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {counts[r.id] > 0 && (
                  <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-[2px]">
                    {counts[r.id]} new
                  </span>
                )}
                <a href={`/search`} className="px-2 py-1.5 border rounded" onClick={() => markSeen(r.id)}>Open</a>
                <button onClick={() => remove(r.id)} className="px-2 py-1.5 border rounded text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
