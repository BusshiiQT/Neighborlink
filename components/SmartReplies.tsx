'use client';

import { useState } from 'react';

export default function SmartReplies({ history, onPick }: {
  history: { sender: 'me'|'them'; text: string }[];
  onPick: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/ai/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) return alert(data.error);
    setSuggestions(data.suggestions || []);
  }

  return (
    <div className="space-y-2">
      <button onClick={load} disabled={loading} className="px-3 py-1.5 border rounded text-xs disabled:opacity-50">
        {loading ? 'Thinking…' : 'Smart replies'}
      </button>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onPick(s)} className="px-2 py-1 border rounded text-xs hover:bg-white/10">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
