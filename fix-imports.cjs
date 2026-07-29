const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const regex = /Clock\s*\} from 'lucide-react';/m;
if (regex.test(content)) {
  content = content.replace(regex, "Clock, TriangleAlert, FileText } from 'lucide-react';");
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Imports updated!");
} else {
  console.log("Regex failed.");
}
