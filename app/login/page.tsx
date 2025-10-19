'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const supabase = getSupabaseBrowser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold text-center">Sign in</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/search`}
        />
      </div>
    </div>
  );
}
