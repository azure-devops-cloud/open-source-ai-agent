const DEFAULT_HEADERS = { accept: 'application/json' };

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function json(url) {
  const response = await fetch(url, { headers: DEFAULT_HEADERS, cache: 'no-store' });
  if (!response.ok) throw new Error(`Market data request failed with HTTP ${response.status}.`);
  return response.json();
}

export async function getCrypto(symbol = 'BTC') {
  const id = ({ BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', XRP: 'ripple', DOGE: 'dogecoin' })[symbol.toUpperCase()] || symbol.toLowerCase();
  const data = await json(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd,inr&include_24hr_change=true&include_24hr_vol=true`);
  const item = data[id];
  if (!item) throw new Error(`Crypto asset not found: ${symbol}`);
  return { type: 'crypto', symbol: symbol.toUpperCase(), priceUsd: number(item.usd), priceInr: number(item.inr), change24hPct: number(item.usd_24h_change), volume24hUsd: number(item.usd_24h_vol), source: 'CoinGecko' };
}

export async function getMarketQuote(symbol) {
  if (!symbol?.trim()) throw new Error('Market symbol is required.');
  const data = await json(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.trim())}?range=1d&interval=1m`);
  const result = data.chart?.result?.[0];
  if (!result) throw new Error(`Market symbol not found: ${symbol}`);
  const meta = result.meta || {};
  const price = number(meta.regularMarketPrice ?? meta.previousClose);
  const previousClose = number(meta.previousClose);
  return { type: 'market', symbol: symbol.toUpperCase(), exchange: meta.exchangeName || null, currency: meta.currency || null, price, previousClose, change: price !== null && previousClose !== null ? price - previousClose : null, changePct: price !== null && previousClose ? ((price - previousClose) / previousClose) * 100 : null, source: 'Yahoo Finance chart endpoint' };
}

export async function getMarketData({ stocks = [], indices = [], crypto = [], fx = [], commodities = [] } = {}) {
  const output = { stocks: [], indices: [], crypto: [], fx: [], commodities: [], errors: [] };
  const groups = [['stocks', stocks], ['indices', indices], ['fx', fx], ['commodities', commodities]];
  for (const [type, symbols] of groups) for (const symbol of symbols || []) {
    try { output[type].push({ ...(await getMarketQuote(symbol)), category: type }); } catch (error) { output.errors.push({ category: type, symbol, error: error instanceof Error ? error.message : 'Market data failed' }); }
  }
  for (const symbol of crypto || []) {
    try { output.crypto.push(await getCrypto(symbol)); } catch (error) { output.errors.push({ category: 'crypto', symbol, error: error instanceof Error ? error.message : 'Crypto data failed' }); }
  }
  return output;
}
