// Curated public RSS/Atom feeds. RSS itself is a publishing format, not an open-source license.
// Only feeds that are publicly reachable without an API key are included here.
export const PUBLIC_FEED_CATALOG = [
  { id: 'bbc-world', name: 'BBC World', category: 'world', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC' },
  { id: 'bbc-technology', name: 'BBC Technology', category: 'technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC' },
  { id: 'bbc-business', name: 'BBC Business', category: 'business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC' },
  { id: 'nasa-news', name: 'NASA News Releases', category: 'science', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA' },
  { id: 'nasa-technology', name: 'NASA Technology', category: 'science', url: 'https://www.nasa.gov/rss/dyn/technology.rss', source: 'NASA' },
  { id: 'nasa-artemis', name: 'NASA Artemis', category: 'science', url: 'https://www.nasa.gov/rss/dyn/Artemis.rss', source: 'NASA' },
];

export function getPublicFeedCatalog() {
  return PUBLIC_FEED_CATALOG;
}
