import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client for use inside Server Components, Server Actions, and Route Handlers.
// Must be created fresh per-request (never module-level singleton) because it
// carries the current request's cookies.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component during render: cookies can't be
            // written here. Safe to ignore because proxy.js refreshes the
            // session on every navigation anyway.
          }
        },
      },
    }
  )
}
