'use client';

import { useEffect, useState } from 'react';
import CategorySelect from '@/components/CategorySelect';

export type Filters = {
  q: string;
  categoryId: number | '';
  minPrice: string;
  maxPrice: string;
  city: string;
};

export default function FiltersBar({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const [local, setLocal] = useState<Filters>(value);

  useEffect(() => setLocal(value), [value]);

  function apply() {
    onChange(local);
  }
  function reset() {
    const blank: Filters = { q: '', categoryId: '', minPrice: '', maxPrice: '', city: '' };
    setLocal(blank);
    onChange(blank);
  }

  return (
    <div className="rounded-2xl border p-3 md:p-4 bg-white/70 backdrop-blur">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          className="border rounded p-2"
          placeholder="Search keywords"
          value={local.q}
          onChange={(e) => setLocal({ ...local, q: e.target.value })}
        />
        <CategorySelect
          value={local.categoryId}
          onChange={(v) => setLocal({ ...local, categoryId: v })}
        />
        <input
          className="border rounded p-2"
          placeholder="City (e.g., Joliet)"
          value={local.city}
          onChange={(e) => setLocal({ ...local, city: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Min $"
          inputMode="decimal"
          value={local.minPrice}
          onChange={(e) => setLocal({ ...local, minPrice: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Max $"
          inputMode="decimal"
          value={local.maxPrice}
          onChange={(e) => setLocal({ ...local, maxPrice: e.target.value })}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={apply} className="px-4 py-2 rounded bg-black text-white">Apply</button>
        <button onClick={reset} className="px-4 py-2 rounded border">Reset</button>
      </div>
    </div>
  );
}
