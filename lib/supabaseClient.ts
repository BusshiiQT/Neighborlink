import { getSupabaseBrowser } from './supabaseBrowser';

// Compatibility export: all browser consumers share the SSR cookie session.
export const supabase = getSupabaseBrowser();
