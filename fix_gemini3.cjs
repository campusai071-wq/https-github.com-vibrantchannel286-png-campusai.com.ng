const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf-8');

// For 2220, 2402, 2426: `systemInstruction\n      });` -> `systemInstruction\n      } });`
code = code.replace(/systemInstruction\n\s*\}\);/g, 'systemInstruction\n        } });');

fs.writeFileSync('src/services/geminiService.ts', code);
