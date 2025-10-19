// app/listing/[id]/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import FavoriteButton from "@/components/FavoriteButton";
import MessageButton from "@/components/MessageButton";
import Carousel from "@/components/Carousel";
import AiNegotiator from "@/components/AiNegotiator";

// Very lightweight UUID test: 8-4-4-4-12 hex
function looksLikeUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

type PageParams = { id: string };

export default async function ListingDetail({
  params,
}: {
  params: Promise<PageParams>; // ✅ Next.js 15 async params fix
}) {
  const { id } = await params; // ✅ Must await params before using

  // -------- DEMO LISTINGS --------
  const isDemo = id.startsWith("demo-");
  if (isDemo) {
    const demo = getDemoListing(id);
    const images = demo.images.map((url: string) => ({ url }));

    return (
      <div className="w-full">
        <section className="w-full">
          <Carousel images={images} alt={demo.title} />
        </section>

        <div className="max-w-6xl mx-auto px-4 mt-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-4xl font-semibold">{demo.title}</h1>
          <div className="hidden md:block">
            <FavoriteButton listingId={demo.id} />
          </div>
        </div>

        <section className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-slate-800">{demo.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="text-slate-500">Category</div>
                <div className="font-medium">{demo.category}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-slate-500">Condition</div>
                <div className="font-medium">{demo.condition}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-slate-500">Posted</div>
                <div className="font-medium">
                  {new Date(demo.created_at).toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-slate-500">Location</div>
                <div className="font-medium">
                  {demo.city}
                  {demo.state ? `, ${demo.state}` : ""}
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 bg-amber-50">
              <div className="font-semibold mb-1">Safety tips</div>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                <li>Meet in a public place and bring a friend.</li>
                <li>Inspect the item carefully before paying.</li>
                <li>Use in-app chat; avoid sharing contact info early.</li>
              </ul>
            </div>
          </div>

          {/* Right column: price + demo contact */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border p-4 space-y-4 sticky top-24">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-semibold">
                  {demo.price == null ? "—" : `$${demo.price}`}
                </div>
                <div className="md:hidden">
                  <FavoriteButton listingId={demo.id} />
                </div>
              </div>

              <div className="text-sm text-slate-600">
                {demo.city}
                {demo.state ? `, ${demo.state}` : ""} •{" "}
                {new Date(demo.created_at).toLocaleDateString()}
              </div>

              {/* Demo contact/negotiation */}
              <AiNegotiator title={demo.title} price={demo.price} sellerName="Demo Seller" />

              {/* In real mode you’d use MessageButton; here we show a demo-only info */}
              <div className="rounded-lg border p-3 text-sm bg-slate-50">
                <div className="font-medium mb-1">Contact Seller (demo)</div>
                <p className="text-slate-700">
                  Use the AI suggestion above, then paste it into your messaging UI.
                </p>
              </div>

              {typeof demo.latitude === "number" &&
                typeof demo.longitude === "number" && (
                  <div className="text-xs text-slate-500">
                    Approx. coords: {demo.latitude}, {demo.longitude}
                  </div>
                )}
            </div>
          </aside>
        </section>
      </div>
    );
  }

  // -------- REAL LISTINGS (Supabase) --------
  if (!looksLikeUuid(id)) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        Listing not found. (Invalid id format)
      </div>
    );
  }

  const supabase = await getSupabaseServer();

  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select(
      "id,user_id,title,description,price,city,state,condition,latitude,longitude,category_id,created_at"
    )
    .eq("id", id)
    .single();

  if (listingErr || !listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        Listing not found.{listingErr ? ` (${listingErr.message})` : ""}
      </div>
    );
  }

  const { data: media } = await supabase
    .from("listing_media")
    .select("url,position,created_at")
    .eq("listing_id", listing.id)
    .order("position", { ascending: true });

  const images = (media as { url: string }[]) ?? [];

  let catName = "—";
  if (listing.category_id != null) {
    const { data: cat } = await supabase
      .from("categories")
      .select("name")
      .eq("id", listing.category_id)
      .maybeSingle();
    if (cat?.name) catName = cat.name as string;
  }

  return (
    <div className="w-full">
      <section className="w-full">
        <Carousel images={images} alt={listing.title} />
      </section>

      <div className="max-w-6xl mx-auto px-4 mt-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-4xl font-semibold">{listing.title}</h1>
        <div className="hidden md:block">
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-slate-800">
              {listing.description || "—"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-slate-500">Category</div>
              <div className="font-medium">{catName}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-slate-500">Condition</div>
              <div className="font-medium">{listing.condition || "—"}</div>
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
                {listing.city || "—"}
                {listing.state ? `, ${listing.state}` : ""}
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

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border p-4 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">
                {listing.price == null ? "—" : `$${listing.price}`}
              </div>
              <div className="md:hidden">
                <FavoriteButton listingId={listing.id} />
              </div>
            </div>

            <div className="text-sm text-slate-600">
              {listing.city || "Chicagoland"}
              {listing.state ? `, ${listing.state}` : ""} •{" "}
              {new Date(listing.created_at).toLocaleDateString()}
            </div>

            <MessageButton listingId={listing.id} sellerId={listing.user_id} />

            {typeof listing.latitude === "number" &&
              typeof listing.longitude === "number" && (
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

// Simple factory for demo listings
function getDemoListing(id: string) {
  const catalog: Record<string, any> = {
    "demo-1": {
      id: "demo-1",
      title: "Modern Sofa - Excellent Condition",
      description:
        "Three-seater modern sofa, smoke/pet-free home. Cushions recently steam-cleaned. Selling because we’re moving.",
      price: 450,
      city: "Chicago",
      state: "IL",
      condition: "Like New",
      created_at: new Date().toISOString(),
      category: "Furniture",
      images: [
        "https://picsum.photos/id/1060/1200/800",
        "https://picsum.photos/id/1067/1200/800",
      ],
      latitude: 41.8781,
      longitude: -87.6298,
    },
    // ...rest of demo items unchanged
  };

  return (
    catalog[id] ?? {
      id,
      title: "Demo Listing",
      description: "This is a demo listing.",
      price: null,
      city: "Chicago",
      state: "IL",
      condition: "—",
      created_at: new Date().toISOString(),
      category: "—",
      images: ["https://picsum.photos/id/1060/1200/800"],
      latitude: 41.8781,
      longitude: -87.6298,
    }
  );
}
