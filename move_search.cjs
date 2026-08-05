const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

// Find start of search block
const searchStartStr = 'const allKnowledge = await getAllKnowledgeFragments();';
const searchEndStr = 'const normUni = university.toLowerCase();';

const startIndex = code.indexOf(searchStartStr);
const endIndex = code.indexOf(searchEndStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find search block");
  process.exit(1);
}

const searchBlock = code.substring(startIndex, endIndex);

// Remove the block from its current location
code = code.substring(0, startIndex) + code.substring(endIndex);

// Find where to insert it: before `let cutoffVal`
const insertPoint = code.indexOf('let cutoffVal = estimateCompetitiveCutoff(course);');

if (insertPoint === -1) {
    const fallbackPoint = code.indexOf('let cutoffVal = extractCutoffFallback(course, typeof officialCutoffData');
    if (fallbackPoint !== -1) {
         code = code.substring(0, fallbackPoint) + searchBlock + code.substring(fallbackPoint);
    } else {
        const estPoint = code.indexOf('let cutoffVal');
        if (estPoint !== -1) {
             code = code.substring(0, estPoint) + searchBlock + code.substring(estPoint);
        } else {
            console.log("Could not find insertion point");
            process.exit(1);
        }
    }
} else {
    code = code.substring(0, insertPoint) + searchBlock + code.substring(insertPoint);
}

// Modify `let cutoffVal = estimateCompetitiveCutoff(course);`
// to use `extractCutoffFallback` if we haven't already.
code = code.replace(
  'let cutoffVal = estimateCompetitiveCutoff(course);',
  'let cutoffVal = extractCutoffFallback(course, typeof officialCutoffData !== "undefined" ? officialCutoffData + "\\n" + learnedPrompt : null);'
);

fs.writeFileSync('src/services/geminiService.ts', code);
console.log("Successfully moved search block and updated cutoffVal");
