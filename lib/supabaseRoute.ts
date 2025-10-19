// lib/supabaseRoute.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase server client for Route Handlers (API routes).
 * Works with Next.js App Router and @supabase/ssr.
 */
export async function getSupabaseRoute() {
  const cookieStore = await cookies();

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
          /* ignore writes in immutable contexts */
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...(options ?? {}), maxAge: 0 });
        } catch {
          /* ignore writes in immutable contexts */
        }
      },
    },
  });
}

// Optional alias so older imports keep working:
export { getSupabaseRoute as supabaseRoute };
