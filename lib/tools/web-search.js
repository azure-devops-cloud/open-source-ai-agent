function clean(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function normalizeResults(data) {
  const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  return results.map((item) => ({
    title: clean(item.title || item.name) || 'Untitled source',
    url: clean(item.url || item.link),
    content: clean(item.content || item.snippet || item.description),
  })).filter((item) => item.url);
}

/** Optional search provider. Normal runtime works with no search service. */
export async function webSearch(query, { maxResults = 5 } = {}) {
  if (!query?.trim()) throw new Error('A search query is required.');
  const provider = (process.env.SEARCH_PROVIDER || 'none').toLowerCase();
  if (provider === 'none') return [];
  if (provider !== 'searxng') throw new Error(`Unsupported SEARCH_PROVIDER: ${provider}`);

  const baseUrl = process.env.SEARXNG_URL;
  if (!baseUrl) throw new Error('SEARCH_PROVIDER=searxng requires SEARXNG_URL.');
  const url = new URL('/search', baseUrl);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('format', 'json');
  url.searchParams.set('language', 'en');
  url.searchParams.set('safesearch', '1');
  url.searchParams.set('categories', 'general');

  const response = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) throw new Error(`SearXNG search failed with HTTP ${response.status}.`);
  return normalizeResults(await response.json()).slice(0, Math.min(Math.max(maxResults, 1), 10));
}
