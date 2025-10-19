// app/listing/[id]/page.tsx
import { supabaseServer } from '@/lib/supabaseServer';
import FavoriteButton from '@/components/FavoriteButton';
import MessageButton from '@/components/MessageButton';
import Carousel from '@/components/Carousel';

type PageParams = { id: string };

export default async function ListingDetail({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  const supabase = supabaseServer();

  // 1) Listing core fields
  const { data: listing, error: listingErr } = await supabase
    .from('listings')
    .select(
      'id,user_id,title,description,price,city,state,condition,latitude,longitude,category_id,created_at'
    )
    .eq('id', id)
    .single();

  if (listingErr || !listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        Listing not found.{listingErr ? ` (${listingErr.message})` : ''}
      </div>
    );
  }

  // 2) Media
  const { data: media } = await supabase
    .from('listing_media')
    .select('url,position,created_at')
    .eq('listing_id', listing.id)
    .order('position', { ascending: true });
  const images = (media as { url: string }[]) ?? [];

  // 3) Category
  let catName = '—';
  if (listing.category_id != null) {
    const { data: cat } = await supabase
      .from('categories')
      .select('name')
      .eq('id', listing.category_id)
      .maybeSingle();
    if (cat?.name) catName = cat.name as string;
  }

  return (
    <div className="w-full">
      {/* Hero carousel */}
      <section className="w-full">
        <Carousel images={images} alt={listing.title} />
      </section>

      {/* Title row (no negative margins, no overlap) */}
      <div className="max-w-6xl mx-auto px-4 mt-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-4xl font-semibold">{listing.title}</h1>
        <div className="hidden md:block">
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: description + meta */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-slate-800">
              {listing.description || '—'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-slate-500">Category</div>
              <div className="font-medium">{catName}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-slate-500">Condition</div>
              <div className="font-medium">{listing.condition || '—'}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-slate-500">Posted</div>
              <div className="font-medium">
                {new Date(listing.created_at).toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-slate-500">Location</div>
              <div className="font-medium">
                {listing.city || '—'}
                {listing.state ? `, ${listing.state}` : ''}
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-amber-50">
            <div className="font-semibold mb-1">Safety tips</div>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Meet in a public place and bring a friend.</li>
              <li>Don’t pay in advance; verify the item in person.</li>
              <li>Use the in-app chat; avoid sharing phone/email early.</li>
            </ul>
          </div>
        </div>

        {/* Right: price + CTAs */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border p-4 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">
                {listing.price == null ? '—' : `$${listing.price}`}
              </div>
              <div className="md:hidden">
                <FavoriteButton listingId={listing.id} />
              </div>
            </div>

            <div className="text-sm text-slate-600">
              {listing.city || 'Chicagoland'}
              {listing.state ? `, ${listing.state}` : ''} •{' '}
              {new Date(listing.created_at).toLocaleDateString()}
            </div>

            <MessageButton listingId={listing.id} sellerId={listing.user_id} />

            {typeof listing.latitude === 'number' &&
              typeof listing.longitude === 'number' && (
                <div className="text-xs text-slate-500">
                  Approx. coords: {listing.latitude}, {listing.longitude}
                </div>
              )}
          </div>
        </aside>
      </section>
    </div>
  );
}
