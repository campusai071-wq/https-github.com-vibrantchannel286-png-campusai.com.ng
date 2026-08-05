const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

code = code.replace(
  'function extractCutoffFallback(course, searchData) {',
  'function extractCutoffFallback(course: string, searchData: string | null) {'
);

fs.writeFileSync('src/services/geminiService.ts', code);
console.log("Fixed types for extractCutoffFallback");
