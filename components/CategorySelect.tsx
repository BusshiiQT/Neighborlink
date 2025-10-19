'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Cat = { id: number; name: string; slug: string };

export default function CategorySelect({
  value,
  onChange,
}: {
  value: number | '';
  onChange: (v: number) => void;
}) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('categories')
      .select('id,name,slug')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setCats(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <select
      className="border rounded p-3 w-full"
      value={value === '' ? '' : String(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={loading}
    >
      <option value="">{loading ? 'Loading…' : 'Choose a category'}</option>
      {cats.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
