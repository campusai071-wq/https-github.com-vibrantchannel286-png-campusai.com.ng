const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const regex3 = /{\/\* Admission Rescue & Strategic Action Plan \*\/}\s*{\(admissionProbability < 65 \|\|[\s\S]*?aiResult\.verdict\?\.toString\(\)\.toLowerCase\(\)\.includes\('low'\)\) && \(/;

if (regex3.test(content)) {
  content = content.replace(regex3, "{/* Strategic Action Plan */}\n                  {true && (");
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Condition replaced successfully!");
} else {
  console.log("Could not find condition string.");
}
