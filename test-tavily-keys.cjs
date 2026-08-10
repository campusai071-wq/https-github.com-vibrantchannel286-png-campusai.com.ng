const { config } = require('dotenv');
config();
const keys = [];
Object.entries(process.env).forEach(([envKey, envValue]) => {
  if (envValue && typeof envValue === 'string') {
    const trimmed = envValue.trim();
    if (trimmed.startsWith('tvly-')) {
       keys.push(envValue);
    }
  }
});
console.log("Tavily keys:", keys.length);
