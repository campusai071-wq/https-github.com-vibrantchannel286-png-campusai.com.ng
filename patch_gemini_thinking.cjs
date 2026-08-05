const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

code = code.replace(
  'config: { \n           responseMimeType: "application/json",\n          tools: [{ googleSearch: {} }]\n        }',
  'config: { \n           responseMimeType: "application/json",\n           thinkingConfig: { thinkingLevel: "HIGH" },\n          tools: [{ googleSearch: {} }]\n        }'
);

fs.writeFileSync('src/services/geminiService.ts', code);
console.log("Patched thinking in geminiService.ts correctly");
