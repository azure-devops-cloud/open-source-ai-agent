function clean(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

export async function webSearch(query, { maxResults = 5 } = {}) {
  if (!query?.trim()) throw new Error('A search query is required.');
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('Web search is not configured. Add TAVILY_API_KEY in Vercel environment variables.');

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, query: query.trim(), search_depth: 'advanced', max_results: Math.min(Math.max(maxResults, 1), 10), include_answer: false, include_raw_content: false }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Web search failed with HTTP ${response.status}: ${detail.slice(0, 300)}`);
  }
  const data = await response.json();
  return (data.results || []).map((item) => ({ title: clean(item.title) || 'Untitled source', url: clean(item.url), content: clean(item.content) })).filter((item) => item.url);
}
