function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function sanitizeModelOutput(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<analysis>[\s\S]*?<\/analysis>/gi, '').replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '').trim();
}

export function getAIConfig(overrides = {}) {
  return {
    provider: overrides.provider || process.env.AI_PROVIDER || 'ollama',
    model: overrides.model || process.env.AI_MODEL || 'qwen3:8b',
    baseUrl: overrides.baseUrl || process.env.AI_BASE_URL || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    temperature: overrides.temperature ?? 0.2,
  };
}

export async function generateText({ system, prompt, temperature = 0.2, model, provider, baseUrl }) {
  const config = getAIConfig({ model, provider, baseUrl, temperature });
  let output = '';

  if (config.provider === 'ollama') {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: config.model, stream: false, options: { temperature: config.temperature }, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (!response.ok) throw new Error(`Ollama request failed with HTTP ${response.status}.`);
    const data = await response.json(); output = data.message?.content || '';
  } else if (config.provider === 'openai-compatible' || config.provider === 'groq') {
    const apiKey = required(config.provider === 'groq' ? 'GROQ_API_KEY' : 'AI_API_KEY');
    const baseUrl = config.provider === 'groq' ? 'https://api.groq.com/openai/v1' : config.baseUrl;
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: config.model, temperature: config.temperature, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (!response.ok) { const detail = await response.text(); throw new Error(`AI provider request failed with HTTP ${response.status}: ${detail.slice(0, 300)}`); }
    const data = await response.json(); output = data.choices?.[0]?.message?.content || '';
  } else throw new Error(`Unsupported AI_PROVIDER: ${config.provider}`);

  return sanitizeModelOutput(output);
}
