'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SaveSearchButton({ filters }: { filters: any }) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { window.location.href = '/login'; return; }
    const { error } = await supabase.from('saved_searches')
      .insert([{ user_id: u.user.id, name: name || 'My search', filters }]);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setOpen(false);
    alert('Search saved.');
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(v=>!v)} className="px-3 py-1.5 rounded border">Save search</button>
      {open && (
        <div className="absolute z-10 mt-2 bg-white border rounded p-3 shadow w-64">
          <input
            className="w-full border rounded p-2 mb-2"
            placeholder="Name (optional)"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />
          <button onClick={save} disabled={busy} className="w-full rounded bg-black text-white py-2 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}
