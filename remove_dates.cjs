
const fs = require('fs');

function removeDates(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove publishDate: "...", and deadlineDate: "...",
  // Handling both double and single quotes, and potential trailing commas
  content = content.replace(/\s*publishDate:\s*['"].*?['"],?/g, '');
  content = content.replace(/\s*deadlineDate:\s*['"].*?['"],?/g, '');
  fs.writeFileSync(filePath, content);
  console.log('Removed dates from ' + filePath);
}

removeDates('src/components/PostUtmeReleaseHub.tsx');
removeDates('src/services/postUtmeTracker.ts');
