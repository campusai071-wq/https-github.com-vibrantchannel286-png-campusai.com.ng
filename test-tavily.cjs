const { config } = require('dotenv');
config();
const { TavilyClient } = require('tavily');
const keys = [];
Object.entries(process.env).forEach(([envKey, envValue]) => {
  if (envValue && typeof envValue === 'string') {
    const trimmed = envValue.trim();
    if (trimmed.startsWith('tvly-')) {
       keys.push(trimmed);
    }
  }
});
if(keys.length > 0) {
  const t0 = Date.now();
  const client = new TavilyClient({ apiKey: keys[0] });
  client.search({ query: "FUTA Computer Science cutoff mark 2026", search_depth: "basic", max_results: 5 })
    .then(r => console.log(`Time: ${Date.now() - t0}ms, results: ${r.results.length}`))
    .catch(e => console.error("Tavily error:", e.message));
}
