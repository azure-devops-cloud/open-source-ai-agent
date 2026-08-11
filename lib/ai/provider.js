function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getAIConfig() {
  return {
    provider: process.env.AI_PROVIDER || 'ollama',
    model: process.env.AI_MODEL || 'qwen3:8b',
    baseUrl: process.env.AI_BASE_URL || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
  };
}

export async function generateText({ system, prompt, temperature = 0.2 }) {
  const config = getAIConfig();

  if (config.provider === 'ollama') {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        stream: false,
        options: { temperature },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with HTTP ${response.status}. Make sure Ollama is running and the model is available.`);
    }

    const data = await response.json();
    return data.message?.content || '';
  }

  if (config.provider === 'openai-compatible' || config.provider === 'groq') {
    const apiKey = required(config.provider === 'groq' ? 'GROQ_API_KEY' : 'AI_API_KEY');
    const baseUrl = config.provider === 'groq'
      ? 'https://api.groq.com/openai/v1'
      : config.baseUrl;

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`AI provider request failed with HTTP ${response.status}: ${detail.slice(0, 300)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  throw new Error(`Unsupported AI_PROVIDER: ${config.provider}`);
}
