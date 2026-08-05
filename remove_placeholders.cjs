
const fs = require('fs');
const content = fs.readFileSync('src/components/PostUtmeReleaseHub.tsx', 'utf8');

const updatedContent = content.replace(/publishDate: ".*?",/g, '').replace(/deadlineDate: ".*?",/g, '');

fs.writeFileSync('src/components/PostUtmeReleaseHub.tsx', updatedContent);
console.log('Placeholders removed.');
