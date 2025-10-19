'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  status: string;
  created_at: string;
};

export default function ModerationPage() {
  const [me, setMe] = useState<any>(null);
  const [role, setRole] = useState<string>('user');
  const [rows, setRows] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { window.location.href = '/login'; return; }
      setMe(u.user);

      const { data: prof } = await supabase.from('profiles').select('role').eq('id', u.user.id).single();
      const r = (prof as any)?.role ?? 'user';
      setRole(r);
      if (!['admin', 'mod'].includes(r)) { alert('Admins only'); window.location.href = '/'; return; }

      const { data } = await supabase
        .from('reports')
        .select('id,target_type,target_id,reason,status,created_at')
        .order('created_at', { ascending: false });
      setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

  async function setStatus(id: string, status: string) {
    await supabase.from('reports').update({ status }).eq('id', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-6">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Moderation queue</h1>
      {rows.length === 0 ? (
        <div className="text-slate-600">Nothing to review.</div>
      ) : (
        <ul className="divide-y border rounded-lg">
          {rows.map((r) => (
            <li key={r.id} className="p-4 space-y-2">
              <div className="text-sm text-slate-600">
                <span className="font-medium">Target:</span> {r.target_type} • <span className="font-mono">{r.target_id}</span>
              </div>
              <div className="text-sm"><span className="text-slate-600">Reason:</span> {r.reason ?? '—'}</div>
              <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-[2px] rounded border">{r.status}</span>
                <button onClick={()=>setStatus(r.id,'reviewing')} className="px-2 py-1.5 border rounded">Mark reviewing</button>
                <button onClick={()=>setStatus(r.id,'resolved')} className="px-2 py-1.5 border rounded">Resolve</button>
                <button onClick={()=>setStatus(r.id,'rejected')} className="px-2 py-1.5 border rounded">Reject</button>
              </div>
              {r.target_type === 'listing' && (
                <a className="inline-block text-sm underline" href={`/listing/${r.target_id}`} target="_blank">Open listing</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
