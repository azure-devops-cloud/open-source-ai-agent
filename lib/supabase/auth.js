import { createClient } from './client';

export async function sendMagicLink(email, redirectTo) {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
}
