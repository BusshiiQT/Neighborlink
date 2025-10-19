// lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client (Next 15, App Router)
 * NOTE: cookies() is async in your type setup → await it.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies(); // ← important

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // or SUPABASE_SERVICE_ROLE_KEY (server-only) if you need privileged ops

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...(options ?? {}) });
        } catch {
          // ignore write failures in non-mutable contexts
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...(options ?? {}), maxAge: 0 });
        } catch {
          // ignore
        }
      },
    },
  });
}

// Optional alias if any files still import `supabaseServer`
export { getSupabaseServer as supabaseServer };
