const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const getEstimatedCutoff = `
function estimateCompetitiveCutoff(course: string): number {
  const nCourse = course.toLowerCase();
  if (nCourse.includes('medicine') || nCourse.includes('surgery') || nCourse.includes('dental') || nCourse.includes('law')) {
    return 75.0;
  } else if (nCourse.includes('nursing') || nCourse.includes('pharmacy') || nCourse.includes('software') || nCourse.includes('computer science') || nCourse.includes('radiography') || nCourse.includes('physiotherapy')) {
    return 70.0;
  } else if (nCourse.includes('engineering') || nCourse.includes('accounting') || nCourse.includes('medical laboratory') || nCourse.includes('public health') || nCourse.includes('architecture')) {
    return 65.0;
  } else if (nCourse.includes('economics') || nCourse.includes('mass communication') || nCourse.includes('business administration') || nCourse.includes('microbiology') || nCourse.includes('biochemistry')) {
    return 60.0;
  }
  return 55.0;
}
`;

if (!code.includes('function estimateCompetitiveCutoff')) {
    code = code.replace("import { generateContent } from \"./aiService\";", "import { generateContent } from \"./aiService\";\n" + getEstimatedCutoff);
}

fs.writeFileSync('src/services/geminiService.ts', code);
console.log("Patched geminiService.ts properly 2");
