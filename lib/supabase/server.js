import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient(accessToken = null) {
  const cookieStore = await cookies();
  const options = {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Cookie writes can fail from a Server Component; the auth callback
          // and client-side auth flow still handle the session exchange.
        }
      },
    },
  };

  if (accessToken) {
    options.global = { headers: { Authorization: `Bearer ${accessToken}` } };
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    options
  );
}
