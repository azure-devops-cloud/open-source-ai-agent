// Curated public RSS/Atom feeds. RSS is a publishing format, not an open-source license.
// These feeds are publicly reachable without an API key. Publishers' own terms still apply.
export const PUBLIC_FEED_CATALOG = [
  { id: 'bbc-world', name: 'BBC World', category: 'world', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC' },
  { id: 'bbc-technology', name: 'BBC Technology', category: 'technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC' },
  { id: 'bbc-business', name: 'BBC Business', category: 'business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC' },
  { id: 'nasa-news', name: 'NASA News Releases', category: 'science', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA' },
  { id: 'nasa-technology', name: 'NASA Technology', category: 'science', url: 'https://www.nasa.gov/rss/dyn/technology.rss', source: 'NASA' },
  { id: 'nasa-artemis', name: 'NASA Artemis', category: 'science', url: 'https://www.nasa.gov/rss/dyn/Artemis.rss', source: 'NASA' },
  { id: 'jpl-news', name: 'NASA JPL News', category: 'science', url: 'https://www.jpl.nasa.gov/feeds/news/', source: 'NASA JPL' },
  { id: 'cneos-news', name: 'NASA CNEOS News', category: 'science', url: 'https://cneos.jpl.nasa.gov/feed/news.xml', source: 'NASA CNEOS' },
  { id: 'github-blog', name: 'GitHub Blog', category: 'developer', url: 'https://github.com/blog.atom', source: 'GitHub' },
  { id: 'kubernetes-cve', name: 'Kubernetes Security CVEs', category: 'security', url: 'https://k8s.io/docs/reference/issues-security/official-cve-feed/feed.xml', source: 'Kubernetes' },
  { id: 'huggingface-blog', name: 'Hugging Face Blog', category: 'ai', url: 'https://huggingface.co/blog/feed.xml', source: 'Hugging Face' },
  { id: 'arxiv-ai', name: 'arXiv AI', category: 'research', url: 'https://export.arxiv.org/rss/cs.AI', source: 'arXiv' },
];

export function getPublicFeedCatalog() {
  return PUBLIC_FEED_CATALOG;
}
