const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf-8');

// Line 699: config: { responseMimeType: "application/json" });
code = code.replace(/config:\s*\{\s*responseMimeType:\s*"application\/json"\s*\}\);/g, 'config: { responseMimeType: "application/json" } });');

// generationConfig: { responseMimeType: "application/json" }});
code = code.replace(/generationConfig:\s*\{\s*responseMimeType:\s*"application\/json"\s*\}\}\);/g, 'generationConfig: { responseMimeType: "application/json" } });');

// Empty property assignment like `        );` after `config: { ... },`
code = code.replace(/,\n\s*\);/g, '\n      });');
code = code.replace(/,\n\s*\}\);/g, '\n      });');

// For line 2222:
//         config: { 
//           systemInstruction,
//           
//         }
code = code.replace(/systemInstruction,\n\s*\}/g, 'systemInstruction\n        }');

// For 2404:
//           config: { 
//             systemInstruction,
//           }
code = code.replace(/systemInstruction,\n\s*\}/g, 'systemInstruction\n          }');

// For 2552:
//         config: {
//           responseMimeType: "application/json",
//           
//           responseSchema: { ... }
code = code.replace(/responseMimeType:\s*"application\/json",\n\s*responseSchema:/g, 'responseMimeType: "application/json",\n          responseSchema:');

// Let's just fix it automatically with regex for `,\n\s*\}`
code = code.replace(/,\s*\}/g, ' }');

fs.writeFileSync('src/services/geminiService.ts', code);
