const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

// I will replace estimateCompetitiveCutoff with a more robust fallback that searches the text
const extractCutoffCode = `
function extractCutoffFallback(course, searchData) {
  if (!searchData) return estimateCompetitiveCutoff(course);
  
  const matches = searchData.match(/(?:cutoff|cut-off|aggregate|merit|benchmark)[^\\d]{0,50}?(\\d{2}\\.\\d{1,2})/gi);
  if (matches && matches.length > 0) {
    for (let m of matches) {
      const numMatch = m.match(/(\\d{2}\\.\\d{1,2})/);
      if (numMatch) {
         const val = parseFloat(numMatch[1]);
         if (val >= 40 && val <= 90) return val;
      }
    }
  }
  
  const matchesInt = searchData.match(/(?:cutoff|cut-off|aggregate|merit|benchmark)[^\\d]{0,50}?(\\d{2})[%\\s]/gi);
  if (matchesInt && matchesInt.length > 0) {
    for (let m of matchesInt) {
      const numMatch = m.match(/(\\d{2})/);
      if (numMatch) {
         const val = parseFloat(numMatch[1]);
         if (val >= 40 && val <= 90) return val;
      }
    }
  }
  
  return estimateCompetitiveCutoff(course);
}
`;

if (!code.includes('extractCutoffFallback')) {
  code = code.replace("function estimateCompetitiveCutoff", extractCutoffCode + "\nfunction estimateCompetitiveCutoff");
}

fs.writeFileSync('src/services/geminiService.ts', code);
console.log("Added extractCutoffFallback");
