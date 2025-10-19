// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-3">Welcome to NeighborLink</h1>
      <p className="text-gray-600 mb-8 max-w-xl">
        Buy, sell, and connect with people in your neighborhood.
      </p>
      <div className="flex gap-4">
        <Link
          href="/search"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Browse Listings
        </Link>
        <Link
          href="/create-listing"
          className="px-6 py-3 rounded-lg border hover:bg-gray-50"
        >
          Post a Listing
        </Link>
      </div>
    </main>
  );
}
