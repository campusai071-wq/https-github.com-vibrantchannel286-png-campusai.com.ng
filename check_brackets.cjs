const fs = require('fs');
const lines = fs.readFileSync('src/services/geminiService.ts', 'utf8').split('\n');

for (let i = 2190; i < 2210; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
