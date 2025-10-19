'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PremiumBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from('profiles').select('plan, ai_credits').eq('id', u.user.id).single();
      if (p?.plan === 'free' && (p?.ai_credits ?? 0) <= 0) setShow(true);
    })();
  }, []);

  if (!show) return null;

  return (
    <div className="bg-indigo-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <span>Upgrade to Premium for unlimited AI tools (rewrites, price suggestions, smart replies).</span>
        <a href="/upgrade" className="underline">Upgrade</a>
      </div>
    </div>
  );
}
