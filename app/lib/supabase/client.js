import { createBrowserClient } from '@supabase/ssr';

function trimOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** Placeholders allow `next build` when env is not set; configure real keys in `.env.local` for runtime. */
const SUPABASE_URL =
  trimOrEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL) || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  trimOrEmpty(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'sb_publishable_BUILD_PLACEHOLDER';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
