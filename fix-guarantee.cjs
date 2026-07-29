const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const regex2 = /To guarantee you gain admission this year, follow this rescue roadmap immediately./g;

if (regex2.test(content)) {
  content = content.replace(regex2, "To maximize your chances of gaining admission this year, follow this action plan.");
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Guarantee replaced successfully!");
} else {
  console.log("Could not find guarantee string.");
}
