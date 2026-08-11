'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseClient } from '../../../lib/supabase';

export default function AgentPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth'; return; }
      const { data, error: agentError } = await supabase.from('agents').select('id, name, description, config').eq('id', id).eq('owner_id', user.id).single();
      if (agentError || !data) setError(agentError?.message || 'Agent not found.'); else setAgent(data);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  async function runAgent(event) {
    event.preventDefault(); setRunning(true); setResult(''); setError('');
    try {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Authentication required. Please sign in again.');
      const response = await fetch('/api/agents/run', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ agentId: agent.id, input: question }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Agent run failed.');
      setResult(data.result);
    } catch (err) { setError(err instanceof Error ? err.message : 'Agent run failed.'); }
    finally { setRunning(false); }
  }

  if (loading) return <main className="container"><section className="hero"><p>Loading agent…</p></section></main>;
  if (!agent) return <main className="container"><section className="hero"><p className="eyebrow">AGENT RUNNER</p><h1>Unable to load agent</h1><p>{error}</p><a href="/agents">← Back to agents</a></section></main>;

  return <main className="container"><section className="hero"><p className="eyebrow">AGENT RUNNER</p><h1>{agent.name}</h1><p className="subtitle">{agent.description || 'Run this AI agent with your own instruction.'}</p><form onSubmit={runAgent} style={{ maxWidth: 760, margin: '24px auto 0' }}><textarea required rows={6} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What should this agent do?" style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid #ccc', resize: 'vertical' }} /><button type="submit" disabled={running} style={{ marginTop: 12, padding: '14px 20px', borderRadius: 10, border: 0, cursor: 'pointer' }}>{running ? 'Running…' : 'Run Agent'}</button></form>{error && <p style={{ marginTop: 20 }}>{error}</p>}{result && <article style={{ margin: '28px auto 0', maxWidth: 760, textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{result}</article>}<p style={{ marginTop: 24 }}><a href="/agents">← Back to agents</a></p></section></main>;
}
