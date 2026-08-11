'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseClient } from '../../../../lib/supabase';

export default function AgentRunsPage() {
  const { id } = useParams();
  const [runs, setRuns] = useState([]);
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth'; return; }
      const [{ data: agentData, error: agentError }, { data: runData, error: runError }] = await Promise.all([
        supabase.from('agents').select('id,name,description').eq('id', id).single(),
        supabase.from('agent_runs').select('id,status,input,output,error_message,started_at,completed_at').eq('agent_id', id).order('started_at', { ascending: false }).limit(25),
      ]);
      if (agentError) setError(agentError.message);
      else setAgent(agentData);
      if (runError) setError(runError.message);
      else setRuns(runData || []);
    }
    load();
  }, [id]);

  return <main className="container"><section className="hero"><p className="eyebrow">RUN HISTORY</p><h1>{agent?.name || 'Agent runs'}</h1><p className="subtitle">Recent executions stored securely in Supabase.</p></section>{error && <p style={{ textAlign: 'center' }}>{error}</p>}<section className="grid">{runs.map((run) => <article key={run.id}><strong>{run.status}</strong><span>{run.started_at ? new Date(run.started_at).toLocaleString() : ''}</span><span style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{run.input?.input || ''}</span>{run.output?.result && <details style={{ marginTop: 12 }}><summary>View result</summary><p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{run.output.result}</p></details>}{run.error_message && <span>{run.error_message}</span>}</article>)}{!runs.length && <article><strong>No runs yet</strong><span>Run this agent to create your first execution.</span></article>}</section><p style={{ textAlign: 'center', marginTop: 24 }}><a href={`/agents/${id}`}>← Back to runner</a></p></main>;
}
