const fs = require('fs');
const lines = fs.readFileSync('src/services/geminiService.ts', 'utf8').split('\n');

let openBraces = 0;
let inTry = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('try {')) inTry++;
  if (line.includes('} catch')) inTry--;
}
console.log('Unclosed try blocks?', inTry);
