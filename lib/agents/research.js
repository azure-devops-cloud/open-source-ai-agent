import { generateText } from '../ai/provider';
import { webSearch } from '../tools/web-search';

const SYSTEM_PROMPT = `You are the Research Agent for an open-source AI platform.
Your job is to produce accurate, structured, source-backed research answers.

Rules:
- Use only the supplied source material for externally verifiable claims.
- Cite factual claims with numbered source references like [1], [2].
- Never invent citations, URLs, statistics, or quotations.
- Clearly distinguish facts from uncertainty.
- If the sources do not support a claim, say that the available sources do not establish it.
- Do not claim live research unless web sources were actually retrieved.
- Keep the answer concise and useful.`;

export async function runResearchAgent({ question, sources = [], liveSearch = true }) {
  if (!question?.trim()) throw new Error('A research question is required.');

  let retrievedSources = sources;
  if (liveSearch && retrievedSources.length === 0) {
    retrievedSources = await webSearch(question, { maxResults: 5 });
  }

  const sourceBlock = retrievedSources.length
    ? retrievedSources.map((source, index) => `${index + 1}. ${source.title || 'Untitled source'}\nURL: ${source.url || ''}\nContent: ${source.content || ''}`).join('\n\n')
    : 'No external source material was retrieved.';

  const prompt = `Research question:\n${question.trim()}\n\nRetrieved sources:\n${sourceBlock}\n\nReturn exactly these sections:\n1. Executive summary\n2. Key findings\n3. Evidence and sources\n4. Uncertainties / limitations\n5. Suggested next steps\n\nFor the Evidence and sources section, list the retrieved sources as [1], [2], etc. Include the source URLs. Do not fabricate sources.`;

  return generateText({ system: SYSTEM_PROMPT, prompt });
}
