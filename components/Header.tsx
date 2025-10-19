'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function Avatar({ email }: { email?: string | null }) {
  const letter = email?.charAt(0)?.toUpperCase() || 'U';
  return (
    <div className="w-8 h-8 rounded-full bg-slate-700 text-white grid place-items-center text-sm font-semibold">
      {letter}
    </div>
  );
}

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <header className="bg-black border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold hover:text-slate-300">
          NeighborLink
        </Link>

        {/* Left nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/search" className="hover:text-slate-300">
            Browse
          </Link>
          <Link href="/saved" className="hover:text-slate-300">
            Saved
          </Link>
          <Link href="/messages" className="hover:text-slate-300">
            Messages
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/create-listing"
            className="rounded-lg bg-white text-black px-3 py-1 font-medium hover:bg-slate-200"
          >
            Post Listing
          </Link>

          {!user ? (
            <Link href="/login" className="hover:text-slate-300">
              Sign in
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 hover:opacity-90"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <Avatar email={user.email} />
                <span className="hidden sm:inline text-sm">
                  {user.email ?? 'Account'}
                </span>
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-800 bg-[#0a0a0a] shadow-lg overflow-hidden z-50"
                >
                  <div className="px-3 py-2 text-xs text-slate-400">
                    Signed in as
                    <div className="text-slate-200 truncate">{user.email}</div>
                  </div>
                  <div className="border-t border-slate-800" />
                  <Link
                    role="menuitem"
                    href="/my-listings"
                    className="block px-3 py-2 text-sm hover:bg-slate-900"
                    onClick={() => setOpen(false)}
                  >
                    My Listings
                  </Link>
                  <Link
                    role="menuitem"
                    href="/saved"
                    className="block px-3 py-2 text-sm hover:bg-slate-900"
                    onClick={() => setOpen(false)}
                  >
                    Saved
                  </Link>
                  <Link
                    role="menuitem"
                    href="/messages"
                    className="block px-3 py-2 text-sm hover:bg-slate-900"
                    onClick={() => setOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    role="menuitem"
                    href="/verify"
                    className="block px-3 py-2 text-sm hover:bg-slate-900"
                    onClick={() => setOpen(false)}
                  >
                    Verify account
                  </Link>
                  <div className="border-t border-slate-800" />
                  <button
                    role="menuitem"
                    onClick={signOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-900"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-6">
          <Link href="/search" className="hover:text-slate-300">
            Browse
          </Link>
          <Link href="/saved" className="hover:text-slate-300">
            Saved
          </Link>
          <Link href="/messages" className="hover:text-slate-300">
            Messages
          </Link>
        </div>
      </div>
    </header>
  );
}
