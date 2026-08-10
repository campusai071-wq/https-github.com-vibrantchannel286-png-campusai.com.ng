const { config } = require('dotenv');
config();
const keys = [];
Object.entries(process.env).forEach(([envKey, envValue]) => {
  if (envValue && typeof envValue === 'string') {
    const lowerKey = envKey.toLowerCase();
    if (lowerKey.includes('serper') || lowerKey.includes('serp_api') || lowerKey.includes('serpapi')) {
       keys.push(envValue);
    }
  }
});
console.log("Serper keys:", keys.length);
