function clean(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function tag(xml, name) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : '';
}

function items(xml) {
  const blocks = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(item|entry)>/gi)].map((m) => m[0]);
  return blocks.map((block) => ({
    title: clean(tag(block, 'title')),
    url: clean(tag(block, 'link') || block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1]),
    description: clean(tag(block, 'description') || tag(block, 'summary') || tag(block, 'content')),
    publishedAt: clean(tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated')),
  })).filter((item) => item.title || item.url);
}

export async function fetchRssFeed(feedUrl, { limit = 20 } = {}) {
  if (!feedUrl?.trim()) throw new Error('RSS feed URL is required.');
  const response = await fetch(feedUrl, { headers: { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' }, cache: 'no-store' });
  if (!response.ok) throw new Error(`RSS feed failed with HTTP ${response.status}.`);
  const xml = await response.text();
  return items(xml).slice(0, Math.min(Math.max(limit, 1), 50));
}

export async function collectRssFeeds(feedUrls = [], options = {}) {
  const results = [];
  for (const feedUrl of feedUrls) {
    try {
      const articles = await fetchRssFeed(feedUrl, options);
      results.push(...articles.map((article) => ({ ...article, feedUrl })));
    } catch (error) {
      results.push({ feedUrl, error: error instanceof Error ? error.message : 'Feed failed' });
    }
  }
  return results;
}
