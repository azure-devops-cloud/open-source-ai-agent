import { NextResponse } from 'next/server';
import { runResearchAgent } from '../../../../lib/agents/research';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  }

  let runId;

  try {
    const body = await request.json();
    const question = body.question?.trim();
    const sources = Array.isArray(body.sources) ? body.sources : [];

    if (!question) {
      return NextResponse.json({ ok: false, error: 'A research question is required.' }, { status: 400 });
    }

    let { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('owner_id', user.id)
      .eq('name', 'Research Agent')
      .maybeSingle();

    if (!agent) {
      const { data: createdAgent, error: agentError } = await supabase
        .from('agents')
        .insert({
          owner_id: user.id,
          name: 'Research Agent',
          description: 'General-purpose research and synthesis agent.',
          config: { provider: process.env.AI_PROVIDER || 'ollama', model: process.env.AI_MODEL || 'qwen3:8b' },
        })
        .select('id')
        .single();

      if (agentError) throw agentError;
      agent = createdAgent;
    }

    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        agent_id: agent.id,
        owner_id: user.id,
        status: 'running',
        input: { question, sources },
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (runError) throw runError;
    runId = run.id;

    const result = await runResearchAgent({ question, sources });

    const { error: completeError } = await supabase
      .from('agent_runs')
      .update({
        status: 'completed',
        output: { result },
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)
      .eq('owner_id', user.id);

    if (completeError) throw completeError;

    return NextResponse.json({ ok: true, result, runId });
  } catch (error) {
    if (runId) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Research agent failed.',
          completed_at: new Date().toISOString(),
        })
        .eq('id', runId)
        .eq('owner_id', user.id);
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Research agent failed.' },
      { status: 500 },
    );
  }
}
