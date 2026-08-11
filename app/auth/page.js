'use client';

import { useState } from 'react';
import { createSupabaseClient } from '../../lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const supabase = createSupabaseClient();
    if (!supabase) {
      setMessage('Supabase is not configured.');
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setMessage(error ? error.message : 'Check your email for the sign-in link.');
    setLoading(false);
  }

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">AUTHENTICATION</p>
        <h1>Sign in</h1>
        <p className="subtitle">Use your email to receive a secure Supabase magic link.</p>
        <form onSubmit={signIn} style={{ display: 'flex', gap: 12, maxWidth: 520, margin: '24px auto 0' }}>
          <input
            aria-label="Email address"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, padding: 14, borderRadius: 10, border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '14px 18px', borderRadius: 10, border: 0, cursor: 'pointer' }}>
            {loading ? 'Sending…' : 'Send link'}
          </button>
        </form>
        {message && <p style={{ marginTop: 18 }}>{message}</p>}
      </section>
    </main>
  );
}
