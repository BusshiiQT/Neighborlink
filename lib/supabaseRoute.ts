// lib/supabaseRoute.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

/**
 * Create a Supabase client for Route Handlers (API routes).
 * Pass the request's cookie store from the handler:
 *   import { cookies } from 'next/headers';
 *   const supabase = await getSupabaseRoute(cookies());
 */
export async function getSupabaseRoute(cookieStore: ReadonlyRequestCookies) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        // In route handlers, cookieStore is usually mutable and has .set()
        // but the type is “readonly”. Guard at runtime to satisfy TS.
        const anyStore = cookieStore as unknown as {
          set?: (args: { name: string; value: string } & CookieOptions) => void;
        };
        if (anyStore.set) {
          anyStore.set({ name, value, ...(options ?? {}) });
        }
      },
      remove(name: string, options?: CookieOptions) {
        const anyStore = cookieStore as unknown as {
          set?: (args: { name: string; value: string } & CookieOptions) => void;
        };
        if (anyStore.set) {
          anyStore.set({ name, value: '', ...(options ?? {}), maxAge: 0 });
        }
      },
    },
  });
}
