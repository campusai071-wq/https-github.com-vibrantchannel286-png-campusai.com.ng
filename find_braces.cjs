const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');
const lines = code.split('\n');

let openBraces = 0;
let lastTryLine = 0;
let tryStack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('{')) {
      for (let c of line) if (c==='{') openBraces++;
  }
  if (line.includes('}')) {
      for (let c of line) if (c==='}') openBraces--;
  }
}
console.log('Open braces at end:', openBraces);
