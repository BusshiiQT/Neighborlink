import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          const previousCookies = response.cookies.getAll();
          response = NextResponse.next({ request });
          previousCookies.forEach(cookie => response.cookies.set(cookie));
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          // SSR 0.7 does not supply cache headers with refreshed cookies.
          response.headers.set('Cache-Control', 'private, no-store');
        },
      },
    },
  );

  // Protected pages and route handlers still perform their own authorization.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)'],
};
