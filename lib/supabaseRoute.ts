// lib/supabaseRoute.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

// Type for the cookie store in your environment (cookies() returns a Promise)
type CookieStore = Awaited<ReturnType<typeof nextCookies>>;

/**
 * Supabase server client for Route Handlers (API routes).
 * Works with Next.js App Router and @supabase/ssr.
 *
 * - Accepts an optional cookie store (or Promise) from next/headers.
 * - Awaits it so we never call .get/.set on a Promise.
 */
export async function getSupabaseRoute(
  cookieStoreArg?: CookieStore | Promise<CookieStore>
) {
  const cookieStore = cookieStoreArg ? await cookieStoreArg : await nextCookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...(options ?? {}) });
        } catch {
          // ignore writes in immutable contexts (e.g., during build)
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...(options ?? {}), maxAge: 0 });
        } catch {
          // ignore writes in immutable contexts
        }
      },
    },
  });
}

// Optional alias for legacy imports
export { getSupabaseRoute as supabaseRoute };
