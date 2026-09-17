'use client';

import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState('');
  const [callbackFailed, setCallbackFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let navigation: ReturnType<typeof setTimeout> | undefined;
    const failed = new URLSearchParams(window.location.search).get('error') === 'auth_callback';
    setCallbackFailed(failed);
    // Keep the PKCE verifier and return destination on the initiating origin.
    setRedirectTo(`${window.location.origin}/auth/callback`);
    const navigate = () => {
      if (!navigation) navigation = setTimeout(() => window.location.replace('/search'), 0);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && !failed) navigate();
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user && !failed) navigate();
      else setChecking(false);
    }).catch(() => {
      if (active) setChecking(false);
    });
    return () => {
      active = false;
      clearTimeout(navigation);
      sub.subscription.unsubscribe();
    };
  }, []);

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
        {callbackFailed && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            Sign-in could not be completed. Please try again with a new link.
          </p>
        )}
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
          providers={['github']}
          redirectTo={redirectTo}
          view="magic_link"
          showLinks={false}
        />
      </div>
    </div>
  );
}
