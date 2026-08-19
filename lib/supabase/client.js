import { createBrowserClient } from '@supabase/ssr'

// Client for use inside Client Components ('use client').
// Reads the publishable (anon) key — safe to expose to the browser because
// all data access is gated by Row Level Security policies in Postgres.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}
