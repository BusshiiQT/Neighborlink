// lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Next.js 15+: createServerComponentClient expects a cookies getter that
 * returns a Promise<ReadonlyRequestCookies>. Passing the `cookies` function
 * itself satisfies the type and runtime.
 */
export function supabaseServer() {
  return createServerComponentClient({
    cookies, // <- do not call it here; pass the function
  });
}
