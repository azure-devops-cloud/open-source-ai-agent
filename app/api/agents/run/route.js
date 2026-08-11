import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { runResearchAgent } from '../../../../lib/agents/research';
import { executeTool, getEnabledToolIds } from '../../../../lib/tools/registry';

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
    const enabledTools = getEnabledToolIds(config);
    let sources = [];
    let marketData = null;
    const toolErrors = [];

    if (enabledTools.includes('rss')) {
      const feedUrls = Array.isArray(config.rssFeedUrls) ? config.rssFeedUrls : [];
      if (!feedUrls.length) throw new Error('RSS Collector is enabled, but no RSS feed URLs are configured in Agent Settings.');
      const rssResult = await executeTool('rss', { feedUrls, limit: 20 }, config);
      sources = rssResult.filter((item) => item && !item.error && (item.title || item.url)).map((item) => ({ title: item.title, url: item.url, content: item.description, publishedAt: item.publishedAt }));
      toolErrors.push(...rssResult.filter((item) => item?.error).map((item) => ({ tool: 'rss', ...item })));
    }

    if (enabledTools.includes('market_data')) {
      const configured = config.marketSymbols && typeof config.marketSymbols === 'object' ? config.marketSymbols : {};
      const marketInput = { stocks: configured.stocks || [], indices: configured.indices || [], crypto: configured.crypto || [], fx: configured.fx || [], commodities: configured.commodities || [] };
      const hasSymbols = Object.values(marketInput).some((items) => Array.isArray(items) && items.length);
      if (hasSymbols) {
        marketData = await executeTool('market_data', marketInput, config);
        toolErrors.push(...(marketData.errors || []).map((item) => ({ tool: 'market_data', ...item })));
      } else {
        toolErrors.push({ tool: 'market_data', error: 'Market Data is enabled, but no symbols are configured.' });
      }
    }

    const result = await runResearchAgent({ question: input.trim(), sources, marketData, liveSearch: false, config });
    const output = { result, sourceCount: sources.length, marketData, enabledTools, toolErrors };
    const { error: completeError } = await supabase.from('agent_runs').update({ status: 'completed', output, completed_at: new Date().toISOString() }).eq('id', runId).eq('owner_id', user.id);
    if (completeError) throw completeError;

    return NextResponse.json({ ok: true, result, runId, sourceCount: sources.length, marketData, enabledTools, toolErrors, agent: { id: agent.id, name: agent.name } });
  } catch (error) {
    if (runId) await supabase.from('agent_runs').update({ status: 'failed', error_message: error instanceof Error ? error.message : 'Agent run failed.', completed_at: new Date().toISOString() }).eq('id', runId).eq('owner_id', user.id);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Agent run failed.' }, { status: 500 });
  }
}
