const fs = require('fs');
const code = fs.readFileSync('src/services/geminiService.ts', 'utf8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('export const') || l.includes('function ') || l.includes('const getCourseCutoffInfo')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 80));
  }
});
