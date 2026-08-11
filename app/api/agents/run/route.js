import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { runResearchAgent } from '../../../../lib/agents/research';

export async function POST(request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  const supabase = await createClient(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });

  let runId;
  try {
    const { agentId, input } = await request.json();
    if (!agentId || !input?.trim()) return NextResponse.json({ ok: false, error: 'Agent and input are required.' }, { status: 400 });

    const { data: agent, error: agentError } = await supabase.from('agents').select('id, name, description, config').eq('id', agentId).eq('owner_id', user.id).single();
    if (agentError || !agent) return NextResponse.json({ ok: false, error: 'Agent not found.' }, { status: 404 });

    const { data: run, error: runError } = await supabase.from('agent_runs').insert({ agent_id: agent.id, owner_id: user.id, status: 'running', input: { input }, started_at: new Date().toISOString() }).select('id').single();
    if (runError) throw runError;
    runId = run.id;

    const config = agent.config && typeof agent.config === 'object' ? agent.config : {};
    const result = await runResearchAgent({ question: input.trim(), sources: [], liveSearch: false, config });
    const { error: completeError } = await supabase.from('agent_runs').update({ status: 'completed', output: { result }, completed_at: new Date().toISOString() }).eq('id', runId).eq('owner_id', user.id);
    if (completeError) throw completeError;

    return NextResponse.json({ ok: true, result, runId, agent: { id: agent.id, name: agent.name } });
  } catch (error) {
    if (runId) await supabase.from('agent_runs').update({ status: 'failed', error_message: error instanceof Error ? error.message : 'Agent run failed.', completed_at: new Date().toISOString() }).eq('id', runId).eq('owner_id', user.id);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Agent run failed.' }, { status: 500 });
  }
}
