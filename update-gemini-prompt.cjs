const fs = require('fs');

let content = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const regex = /"alternatives": \[\{ "name": "string", "typicalCutoff": "string", "reasoning": "string" \}\],/;
const replacement = `"alternatives": [{ "name": "string", "typicalCutoff": "string", "reasoning": "string" }],
  "strengths": ["string (e.g. 'Aggregate above merit', 'Valid subject combination', etc)"],
  "riskFactors": ["string (e.g. 'Highly competitive department', 'Outside catchment area', etc)"],`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/services/geminiService.ts', content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Regex failed.");
}
