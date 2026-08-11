import { generateText } from '../ai/provider';
import { webSearch } from '../tools/web-search';

const DEFAULT_SYSTEM_PROMPT = `You are the Research Agent for an open-source AI platform.
Your job is to produce accurate, structured research answers.

Rules:
- Use only supplied source material and supplied market data for externally verifiable claims.
- Cite factual article claims with numbered source references like [1], [2] only when those sources were actually retrieved.
- Never invent citations, URLs, statistics, prices, market values, or quotations.
- Treat market data as a read-only snapshot from the stated provider; do not imply that a quote is real-time unless the provider explicitly establishes that.
- If no external sources were retrieved, explicitly say that live web research was not performed.
- Clearly distinguish facts from uncertainty and stale/unavailable data.
- Do not provide trade execution instructions or claim that an order was placed.
- Keep the answer concise and useful.`;

function formatMarketData(data) {
  if (!data) return 'No market data was retrieved.';
  const sections = [];
  for (const [category, items] of Object.entries(data)) {
    if (category === 'errors' || !Array.isArray(items) || !items.length) continue;
    sections.push(`${category.toUpperCase()}:\n${items.map((item) => JSON.stringify(item)).join('\n')}`);
  }
  if (Array.isArray(data.errors) && data.errors.length) sections.push(`MARKET DATA ERRORS:\n${data.errors.map((item) => JSON.stringify(item)).join('\n')}`);
  return sections.length ? sections.join('\n\n') : 'No market data was retrieved.';
}

export async function runResearchAgent({ question, sources = [], marketData = null, liveSearch = false, config = {} }) {
  if (!question?.trim()) throw new Error('A research question is required.');
  let retrievedSources = sources;
  if (liveSearch && retrievedSources.length === 0) retrievedSources = await webSearch(question, { maxResults: 5 });
  const sourceBlock = retrievedSources.length ? retrievedSources.map((source, index) => `${index + 1}. ${source.title || 'Untitled source'}\nURL: ${source.url || ''}\nContent: ${source.content || ''}\nPublished: ${source.publishedAt || 'unknown'}`).join('\n\n') : 'No external source material was retrieved.';
  const marketBlock = formatMarketData(marketData);
  const prompt = `Research question:\n${question.trim()}\n\nRetrieved sources:\n${sourceBlock}\n\nRead-only market data snapshot:\n${marketBlock}\n\nReturn exactly these sections:\n1. Executive summary\n2. Key findings\n3. Evidence and sources\n4. Uncertainties / limitations\n5. Suggested next steps\n\nOnly cite [1], [2], etc. when corresponding article sources exist. Market data does not use article citation numbers; identify its provider/source when discussing it. If there are no article sources, say that live web research was not performed. Do not fabricate sources or market values.`;
  return generateText({ system: config.systemPrompt || DEFAULT_SYSTEM_PROMPT, prompt, model: config.model, temperature: config.temperature });
}
