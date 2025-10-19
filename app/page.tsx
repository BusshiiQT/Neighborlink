// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-3">Welcome to NeighborLink</h1>
      <p className="text-gray-600 mb-8 max-w-lg">
        Buy, sell, and connect with people in your neighborhood — powered by Supabase.
      </p>
      <div className="flex gap-4">
        <Link
          href="/search"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Listings
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
