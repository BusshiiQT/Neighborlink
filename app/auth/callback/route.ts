import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseRoute } from '@/lib/supabaseRoute';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  let destination = '/login?error=auth_callback';

  if (code && !url.searchParams.has('error')) {
    try {
      const supabase = await getSupabaseRoute(await cookies());
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) destination = '/search';
    } catch {
      // Do not expose provider errors, tokens, or internal configuration.
    }
  }

  const response = NextResponse.redirect(new URL(destination, url.origin));
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
