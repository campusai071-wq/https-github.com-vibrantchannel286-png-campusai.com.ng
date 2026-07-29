const fs = require('fs');

let cc = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');
cc = cc.replace(/aiResult\.strengths\.map\(\(str, idx\)/g, "aiResult.strengths.map((str: string, idx: number)");
cc = cc.replace(/aiResult\.riskFactors\.map\(\(risk, idx\)/g, "aiResult.riskFactors.map((risk: string, idx: number)");
fs.writeFileSync('src/components/CutoffCalculator.tsx', cc, 'utf8');

let pem = fs.readFileSync('src/components/PdfExportModal.tsx', 'utf8');
pem = pem.replace(/convertOklchColors = \(cssText\) =>/g, "convertOklchColors = (cssText: string) =>");
pem = pem.replace(/const htmlEl = el;/g, "const htmlEl = el as HTMLElement;");
fs.writeFileSync('src/components/PdfExportModal.tsx', pem, 'utf8');

console.log("Types fixed!");
