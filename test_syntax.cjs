const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

let braces = 0;
for(let i = 0; i<code.length; i++) {
  if (code[i] === '{') braces++;
  else if (code[i] === '}') braces--;
}
console.log('Braces mismatch:', braces);
