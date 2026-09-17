'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

function Avatar({ email }: { email?: string | null }) {
  const letter = email?.charAt(0)?.toUpperCase() || 'U';
  return (
    <div className="w-8 h-8 rounded-full bg-slate-700 text-white grid place-items-center text-sm font-semibold">
      {letter}
    </div>
  );
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const loggingOut = useRef(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let identity: string | null | undefined;
    let revision = 0;
    let reload: ReturnType<typeof setTimeout> | undefined;
    const updateUser = (nextUser: User | null) => {
      if (!mounted) return;
      const nextId = nextUser?.id ?? null;
      const changed = identity !== undefined && identity !== nextId;
      identity = nextId;
      setUser(nextUser);
      if (changed && !loggingOut.current) {
        // Reset page-local state and the router cache, including in other tabs.
        clearTimeout(reload);
        reload = setTimeout(() => window.location.reload(), 0);
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      revision++;
      updateUser(session?.user ?? null);
    });
    const initialRevision = revision;
    void supabase.auth.getUser().then(({ data }) => {
      if (revision === initialRevision) updateUser(data.user ?? null);
    }).catch(() => { /* A transient lookup failure must not change identity. */ });
    return () => {
      mounted = false;
      clearTimeout(reload);
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
    if (loggingOut.current) return;
    loggingOut.current = true;
    setSigningOut(true);
    setLogoutError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.replace('/');
    } catch {
      setLogoutError('Could not sign out. Please try again.');
      loggingOut.current = false;
      setSigningOut(false);
    }
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
                  <div className="border-t border-slate-800" />
                  <button
                    role="menuitem"
                    onClick={signOut}
                    disabled={signingOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-900"
                  >
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                  {logoutError && <p role="alert" className="px-3 py-2 text-sm text-red-400">{logoutError}</p>}
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
