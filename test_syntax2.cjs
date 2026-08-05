const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const regex = /export const [a-zA-Z0-9_]* =/g;
let match;
const functions = [];
while ((match = regex.exec(code)) !== null) {
  functions.push({name: match[0], index: match.index});
}

for (let i = 0; i < functions.length; i++) {
  const start = functions[i].index;
  const end = i < functions.length - 1 ? functions[i+1].index : code.length;
  const chunk = code.substring(start, end);
  let braces = 0;
  for(let j = 0; j < chunk.length; j++) {
    if (chunk[j] === '{') braces++;
    else if (chunk[j] === '}') braces--;
  }
  console.log(functions[i].name, 'unclosed:', braces);
}
