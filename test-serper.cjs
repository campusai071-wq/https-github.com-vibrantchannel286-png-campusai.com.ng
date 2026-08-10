const { config } = require('dotenv');
config();
const axios = require('axios');
const keys = [];
Object.entries(process.env).forEach(([envKey, envValue]) => {
  if (envValue && typeof envValue === 'string') {
    const lowerKey = envKey.toLowerCase();
    if (lowerKey.includes('serper') || lowerKey.includes('serp_api') || lowerKey.includes('serpapi')) {
       const match = envValue.trim().match(/\b([a-f0-9]{32,64})\b/i);
       if (match) keys.push(match[1]);
    }
  }
});
if(keys.length > 0) {
  const t0 = Date.now();
  axios.post('https://google.serper.dev/search', { q: 'FUTA Computer Science cutoff mark' }, {
    headers: { 'X-API-KEY': keys[0], 'Content-Type': 'application/json' },
    timeout: 5000
  }).then(r => console.log(`Time: ${Date.now() - t0}ms, organic: ${r.data.organic.length}`))
    .catch(e => console.error(e.message));
}
