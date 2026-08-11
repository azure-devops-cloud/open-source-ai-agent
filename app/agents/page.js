'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '../../lib/supabase';

export default function AgentsPage() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('Loading…');

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      setMessage('Supabase is not configured.');
      return;
    }

    let mounted = true;
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(currentUser);
      if (!currentUser) {
        setMessage('Sign in first to manage your agents.');
        return;
      }
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: false });
      if (error) setMessage(error.message);
      else {
        setAgents(data ?? []);
        setMessage(data?.length ? '' : 'No agents yet. Create your first one.');
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function createAgent(event) {
    event.preventDefault();
    const supabase = createSupabaseClient();
    if (!supabase || !user || !name.trim()) return;

    const { data, error } = await supabase
      .from('agents')
      .insert({ owner_id: user.id, name: name.trim(), description: description.trim() || null })
      .select('id, name, description, created_at')
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }
    setAgents((current) => [data, ...current]);
    setName('');
    setDescription('');
    setMessage('Agent created successfully.');
  }

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">AGENT DASHBOARD</p>
        <h1>Your AI Agents</h1>
        <p className="subtitle">Agents are stored securely in Supabase with Row Level Security.</p>
      </section>

      {!user ? (
        <section className="grid"><article><strong>Authentication required</strong><span>{message}</span><a href="/auth">Sign in →</a></article></section>
      ) : (
        <>
          <form onSubmit={createAgent} style={{ maxWidth: 720, margin: '0 auto 32px', display: 'grid', gap: 12 }}>
            <input aria-label="Agent name" placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: 14, borderRadius: 10, border: '1px solid #ccc' }} />
            <input aria-label="Agent description" placeholder="What should this agent do?" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: 14, borderRadius: 10, border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: 14, borderRadius: 10, border: 0, cursor: 'pointer' }}>Create agent</button>
          </form>
          <section className="grid">
            {agents.map((agent) => (
              <article key={agent.id}>
                <strong>{agent.name}</strong>
                <span>{agent.description || 'No description'}</span>
                {agent.name.toLowerCase() === 'research agent' || agent.name.toLowerCase() === 'research' ? (
                  <a href={`/research?agent=${agent.id}`} style={{ marginTop: 10, display: 'inline-block' }}>Run agent →</a>
                ) : (
                  <span style={{ marginTop: 10 }}>Agent runner coming next</span>
                )}
              </article>
            ))}
          </section>
          {message && <p style={{ textAlign: 'center', marginTop: 20 }}>{message}</p>}
        </>
      )}
    </main>
  );
}
