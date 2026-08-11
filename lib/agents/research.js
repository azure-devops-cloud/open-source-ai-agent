import { generateText } from '../ai/provider';
import { webSearch } from '../tools/web-search';

const DEFAULT_SYSTEM_PROMPT = `You are the Research Agent for an open-source AI platform.
Your job is to produce accurate, structured research answers.

Rules:
- Use only supplied source material for externally verifiable claims.
- Cite factual claims with numbered source references like [1], [2] only when sources were actually retrieved.
- Never invent citations, URLs, statistics, or quotations.
- If no external sources were retrieved, explicitly say that live web research was not performed.
- Clearly distinguish facts from uncertainty.
- Keep the answer concise and useful.`;

export async function runResearchAgent({ question, sources = [], liveSearch = false, config = {} }) {
  if (!question?.trim()) throw new Error('A research question is required.');
  let retrievedSources = sources;
  if (liveSearch && retrievedSources.length === 0) retrievedSources = await webSearch(question, { maxResults: 5 });
  const sourceBlock = retrievedSources.length ? retrievedSources.map((source, index) => `${index + 1}. ${source.title || 'Untitled source'}\nURL: ${source.url || ''}\nContent: ${source.content || ''}`).join('\n\n') : 'No external source material was retrieved.';
  const prompt = `Research question:\n${question.trim()}\n\nRetrieved sources:\n${sourceBlock}\n\nReturn exactly these sections:\n1. Executive summary\n2. Key findings\n3. Evidence and sources\n4. Uncertainties / limitations\n5. Suggested next steps\n\nOnly cite [1], [2], etc. when corresponding sources exist. If there are no sources, say that live web research was not performed. Do not fabricate sources.`;
  return generateText({ system: config.systemPrompt || DEFAULT_SYSTEM_PROMPT, prompt, model: config.model, temperature: config.temperature });
}
