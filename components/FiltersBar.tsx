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

  useEffect(() => {
    setLocal(value);
  }, [value]);

  function apply() {
    onChange(local);
  }

  function reset() {
    const blank: Filters = {
      q: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      city: '',
    };

    setLocal(blank);
    onChange(blank);
  }

  const inputClasses =
    'w-full rounded-lg border border-slate-700 bg-black px-3 py-2.5 text-white placeholder:text-slate-500 outline-none transition focus:border-slate-400';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          className={inputClasses}
          placeholder="Search keywords"
          value={local.q}
          onChange={(e) =>
            setLocal({
              ...local,
              q: e.target.value,
            })
          }
        />

        <CategorySelect
          value={local.categoryId}
          onChange={(v) =>
            setLocal({
              ...local,
              categoryId: v,
            })
          }
        />

        <input
          className={inputClasses}
          placeholder="City (e.g., Joliet)"
          value={local.city}
          onChange={(e) =>
            setLocal({
              ...local,
              city: e.target.value,
            })
          }
        />

        <input
          className={inputClasses}
          placeholder="Min $"
          inputMode="decimal"
          value={local.minPrice}
          onChange={(e) =>
            setLocal({
              ...local,
              minPrice: e.target.value,
            })
          }
        />

        <input
          className={inputClasses}
          placeholder="Max $"
          inputMode="decimal"
          value={local.maxPrice}
          onChange={(e) =>
            setLocal({
              ...local,
              maxPrice: e.target.value,
            })
          }
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={apply}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-slate-200"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-500 hover:bg-slate-900"
        >
          Reset
        </button>
      </div>
    </div>
  );
}