'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Cat = { id: number; name: string; slug: string };

// A small fallback list so the form is never blocked
const FALLBACK: Cat[] = [
  { id: 1, name: 'Furniture', slug: 'furniture' },
  { id: 2, name: 'Electronics', slug: 'electronics' },
  { id: 3, name: 'Home & Kitchen', slug: 'home-kitchen' },
  { id: 4, name: 'Services', slug: 'services' },
  { id: 5, name: 'Jobs & Gigs', slug: 'jobs-gigs' },
  { id: 6, name: 'Bikes & Sports', slug: 'bikes-sports' },
  { id: 7, name: 'Other', slug: 'other' },
];

export default function CategorySelect({
  value,
  onChange,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
}) {
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const options = useMemo(() => {
    if (cats && cats.length) return cats;
    return FALLBACK;
  }, [cats]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const { data, error } = await supabase
          .from('categories')
          .select('id,name,slug')
          .order('name', { ascending: true });

        if (error) throw error;

        if (!cancelled) {
          setCats((data ?? []) as Cat[]);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message ?? 'Failed to load categories');
          setCats(null); // fallback list will be used
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-1">
      <select
        className="border rounded p-3 w-full bg-black text-white border-slate-700"
        value={value === '' ? '' : String(value)}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? '' : Number(v));
        }}
        // IMPORTANT: don’t disable the select, or you can’t recover
        disabled={false}
      >
        <option value="">
          {loading ? 'Loading…' : 'Choose a category'}
        </option>

        {options.map((c) => (
          <option key={c.id} value={String(c.id)}>
            {c.name}
          </option>
        ))}
      </select>

      {err && (
        <div className="text-xs text-amber-400">
          Using fallback categories. Supabase error: {err}
        </div>
      )}
    </div>
  );
}
