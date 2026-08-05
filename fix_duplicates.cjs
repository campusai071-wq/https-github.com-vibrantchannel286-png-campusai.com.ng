const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const t1 = code.indexOf('export const formatStrategyMarkdown', 78000);
const t2 = code.indexOf('export const formatStrategyMarkdown', t1 + 10);
const t3 = code.indexOf('export const getUniversityCourses');

console.log('t1:', t1, 't2:', t2, 't3:', t3);

const goodCode = code.substring(0, t2) + code.substring(t3);

fs.writeFileSync('src/services/geminiService.ts', goodCode);
console.log('Duplicates removed!');
