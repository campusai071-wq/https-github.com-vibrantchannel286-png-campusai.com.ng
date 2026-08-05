const fs = require('fs');
const lines = fs.readFileSync('src/services/geminiService.ts', 'utf8').split('\n');
console.log(lines.slice(1693, 1885).join('\n'));
