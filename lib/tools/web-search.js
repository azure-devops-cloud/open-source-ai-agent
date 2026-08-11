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

/**
 * Open-source-friendly search adapter.
 * Set SEARXNG_URL to your own SearXNG instance, e.g. https://search.example.com.
 * No commercial search API key is required.
 */
export async function webSearch(query, { maxResults = 5 } = {}) {
  if (!query?.trim()) throw new Error('A search query is required.');
  const baseUrl = process.env.SEARXNG_URL;
  if (!baseUrl) throw new Error('Web search is not configured. Set SEARXNG_URL to your self-hosted SearXNG instance.');

  const url = new URL('/search', baseUrl);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('format', 'json');
  url.searchParams.set('language', 'en');
  url.searchParams.set('safesearch', '1');
  url.searchParams.set('categories', 'general');

  const response = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SearXNG search failed with HTTP ${response.status}: ${detail.slice(0, 300)}`);
  }

  return normalizeResults(await response.json()).slice(0, Math.min(Math.max(maxResults, 1), 10));
}
