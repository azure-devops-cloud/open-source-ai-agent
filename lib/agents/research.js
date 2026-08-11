import { generateText } from '../ai/provider';

const SYSTEM_PROMPT = `You are the Research Agent for an open-source AI platform.
Your job is to produce accurate, structured research answers.

Rules:
- Separate facts from assumptions.
- If source material is supplied, rely on it and cite sources by title or URL.
- If source material is not supplied, clearly state that live web research has not been performed.
- Never invent citations, URLs, statistics, or quotations.
- Prefer concise findings, key evidence, uncertainties, and next steps.`;

export async function runResearchAgent({ question, sources = [] }) {
  if (!question?.trim()) throw new Error('A research question is required.');

  const sourceBlock = sources.length
    ? sources.map((source, index) => `${index + 1}. ${source.title || 'Untitled'}\n${source.url || ''}\n${source.content || ''}`).join('\n\n')
    : 'No external source material was supplied.';

  const prompt = `Research question:\n${question.trim()}\n\nSource material:\n${sourceBlock}\n\nReturn:\n1. Executive summary\n2. Key findings\n3. Evidence and sources\n4. Uncertainties / limitations\n5. Suggested next steps`;

  return generateText({ system: SYSTEM_PROMPT, prompt });
}
