const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf-8');

// Replace tools lines
code = code.replace(/tools:\s*\[\{\s*googleSearch:\s*\{\}\s*\}\s*,\s*\{\s*googleMaps:\s*\{\}\s*\}\]\s*\}\s*/g, '');
code = code.replace(/tools:\s*\[\{\s*googleSearch:\s*\{\}\s*\}\s*,\s*\{\s*googleMaps:\s*\{\}\s*\}\]\s*as\s*any\s*/g, '');
code = code.replace(/tools:\s*hasSearchResults\s*\?\s*\[\{\s*googleSearch:\s*\{\}\s*\}\]\s*as\s*any\s*:\s*\[\]\s*/g, '');
code = code.replace(/tools:\s*\[\{\s*googleSearch:\s*\{\}\s*\}\]\s*/g, '');

fs.writeFileSync('src/services/geminiService.ts', code);
