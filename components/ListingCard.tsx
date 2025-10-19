import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';

type ListingWithMedia = {
  id: string;
  title: string;
  price: number | null;
  city: string | null;
  created_at: string;
  listing_media?: { url: string }[];
};

export default function ListingCard({ listing }: { listing: ListingWithMedia }) {
  const img = listing.listing_media?.[0]?.url;

  return (
    <div className="relative">
      <a
        href={`/listing/${listing.id}`}
        className="block border rounded-2xl overflow-hidden hover:shadow-md transition"
      >
        <div className="relative aspect-video bg-slate-100">
          {img ? (
            <Image src={img} alt={listing.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
              No image
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <div className="font-medium line-clamp-2">{listing.title}</div>
          <div className="text-lg">{listing.price == null ? '—' : `$${listing.price}`}</div>
          <div className="text-xs text-slate-600">
            {listing.city ?? 'Chicagoland'} • {new Date(listing.created_at).toLocaleDateString()}
          </div>
        </div>
      </a>

      {/* Favorite control */}
      <div className="absolute top-2 right-2">
        <FavoriteButton listingId={listing.id} />
      </div>
    </div>
  );
}
