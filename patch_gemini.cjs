const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf-8');

// Replace gemini-3.5-flash with gemini-3.1-flash-lite for the query optimizer
code = code.replace(/model:\s*"gemini-3\.5-flash",\n\s*contents:\s*`You are a search query optimizer/g, 
'model: "gemini-3.1-flash-lite",\n          contents: `You are a search query optimizer');

fs.writeFileSync('src/services/geminiService.ts', code);
