'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Where to go after sign-in (works for local + prod)
  const redirectTo = useMemo(() => {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (typeof window !== 'undefined' ? window.location.origin : '');
    return base ? `${base}/search` : '/search';
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/search');
        return;
      }
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/search');
        }
      });
      unsub = () => sub.subscription.unsubscribe();
      setChecking(false);
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-slate-700">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold text-center text-slate-900">
          Sign in to NeighborLink
        </h1>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            className: {
              container: 'text-slate-900',
              input: 'text-slate-900',
              button: 'bg-black hover:opacity-90',
            },
          }}
          // 👇 Only GitHub enabled
          providers={['github']}
          redirectTo={redirectTo}
          magicLink={true}
        />

        <p className="mt-3 text-xs text-slate-600 text-center">
          If GitHub sign-in fails, enable the provider in Supabase (Auth → Providers) and add
          callback URLs like <code className="px-1 py-0.5 bg-slate-100 rounded">/auth/callback</code>.
        </p>
      </div>
    </div>
  );
}
