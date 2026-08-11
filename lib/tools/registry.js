import { collectRssFeeds } from './rss';

const TOOL_DEFINITIONS = {
  rss: {
    id: 'rss',
    name: 'RSS Collector',
    description: 'Collect recent articles from configured RSS or Atom feeds.',
    execute: async (input = {}) => collectRssFeeds(input.feedUrls || [], { limit: input.limit || 20 }),
  },
};

export function listTools() {
  return Object.values(TOOL_DEFINITIONS).map(({ execute, ...tool }) => tool);
}

export function getEnabledToolIds(config = {}) {
  return Array.isArray(config.tools) ? config.tools.filter((id) => typeof id === 'string') : [];
}

export async function executeTool(toolId, input, config = {}) {
  const enabled = getEnabledToolIds(config);
  if (!enabled.includes(toolId)) throw new Error(`Tool "${toolId}" is not enabled for this agent.`);
  const tool = TOOL_DEFINITIONS[toolId];
  if (!tool) throw new Error(`Unknown tool: ${toolId}`);
  return tool.execute(input);
}
