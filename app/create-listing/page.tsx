'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import CategorySelect from '@/components/CategorySelect';
import DemoPill from '@/components/DemoPill';

export default function CreateListingPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [condition, setCondition] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // Auth check
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setMe(data.user.id);
    })();
  }, [router]);

  // --- AI helpers ---
  async function aiRewrite(target: 'title' | 'desc') {
    const text = target === 'title' ? title : desc;
    if (!text.trim()) {
      alert('Type something first to rewrite.');
      return;
    }
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      if (target === 'title') setTitle(data.result);
      else setDesc(data.result);
    } catch (e: any) {
      alert(e?.message || 'AI rewrite failed');
    }
  }

  async function aiPrice() {
    if (!title.trim() && !desc.trim()) {
      alert('Add a title or description first so AI has context.');
      return;
    }
    try {
      const res = await fetch('/api/ai/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: desc,
          city,
          category: String(categoryId || ''),
        }),
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      if (data.price) setPrice(String(data.price));
    } catch (e: any) {
      alert(e?.message || 'AI price failed');
    }
  }
  // --- end AI helpers ---

  async function handleCreate() {
    if (!me) return;
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }

    setSaving(true);

    // Tiny moderation heuristic for MVP
    const banned = ['wire transfer', 'gift card only', 'escort'];
    const risky = banned.some((w) => (title + ' ' + desc).toLowerCase().includes(w));
    const riskScore = risky ? 0.7 : 0.1;

    // Parse optional coords
    const latNum = lat.trim() ? Number(lat) : null;
    const lngNum = lng.trim() ? Number(lng) : null;

    // 1) Insert listing
    const { data: created, error: insertErr } = await supabase
      .from('listings')
      .insert([
        {
          user_id: me,
          title: title.trim(),
          description: desc.trim() || null,
          price: price.trim() ? Number(price) : null,
          currency: 'USD',
          category_id: categoryId === '' ? null : Number(categoryId),
          condition: condition || null,
          city: city || null,
          state: stateCode || null,
          latitude: latNum,
          longitude: lngNum,
          status: 'active',
          risk_score: riskScore,
        },
      ])
      .select('id')
      .single();

    if (insertErr || !created) {
      setSaving(false);
      alert(insertErr?.message || 'Failed to create listing.');
      return;
    }

    const listingId = created.id as string;

    // 2) Upload images if any
    for (const f of files) {
      const path = `${me}/${listingId}/${Date.now()}-${f.name}`;
      const up = await supabase.storage.from('listing-images').upload(path, f, { upsert: true });
      if (!up.error) {
        const { data: pub } = supabase.storage.from('listing-images').getPublicUrl(path);
        await supabase
          .from('listing_media')
          .insert([{ listing_id: listingId, url: pub.publicUrl, type: 'image' }]);
      }
    }

    setSaving(false);
    router.push(`/listing/${listingId}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-semibold">Create a listing</h1>

        {/* Title + AI Rewrite */}
        <div className="space-y-2">
          <label className="block text-sm text-slate-300">Title</label>
          <div className="flex items-center gap-2">
            <input
              className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 2015 Honda Civic EX"
            />
            <button
              type="button"
              onClick={() => aiRewrite('title')}
              className="px-2 py-1 border rounded text-xs border-slate-600 hover:bg-white/10"
            >
              Rewrite
            </button>
            <DemoPill />
          </div>
        </div>

        {/* Description + AI Improve */}
        <div className="space-y-2">
          <label className="block text-sm text-slate-300">Description</label>
          <textarea
            className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
            rows={6}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Details, condition, extras, pickup location hints…"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => aiRewrite('desc')}
              className="px-2 py-1 border rounded text-xs border-slate-600 hover:bg-white/10"
            >
              Improve description
            </button>
            <DemoPill />
          </div>
        </div>

        {/* Price + Suggest */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-sm text-slate-300">Price (USD)</label>
            <input
              className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 4200"
              inputMode="decimal"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={aiPrice}
              className="px-3 py-2 border rounded border-slate-600 hover:bg-white/10"
            >
              Suggest price
            </button>
            <DemoPill />
          </div>
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm text-slate-300">Category</label>
            <CategorySelect value={categoryId} onChange={(v) => setCategoryId(v)} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-300">Condition (optional)</label>
            <input
              className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="New / Like New / Good / Fair / For parts"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm text-slate-300">City</label>
            <input
              className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Joliet"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-slate-300">State</label>
            <input
              className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              placeholder="IL"
            />
          </div>
        </div>

        {/* Optional coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm text-slate-300">Latitude (optional)</label>
            <input
              className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="41.525..."
              inputMode="decimal"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-slate-300">Longitude (optional)</label>
            <input
              className="w-full border rounded p-3 bg-black text-white border-slate-700 placeholder-slate-400"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-88.081..."
              inputMode="decimal"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="block text-sm text-slate-300">Photos</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-slate-200 file:text-black file:font-medium hover:file:bg-slate-300"
          />
          {!!files.length && (
            <div className="text-xs text-slate-400">{files.length} image(s) selected</div>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 rounded bg-white text-black font-medium disabled:opacity-50"
          >
            {saving ? 'Publishing…' : 'Publish listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
