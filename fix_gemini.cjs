const fs = require('fs');

let code = fs.readFileSync('src/services/geminiService.ts', 'utf-8');

// The original file was ruined by the previous script. Let's fix the specific lines.
// It seems I just deleted the tool declaration entirely, leaving syntax errors.

// Actually, I can just replace `,           });` with ` }});` 
code = code.replace(/config:\s*\{\s*responseMimeType:\s*"application\/json",\s*\}/g, 'config: { responseMimeType: "application/json" }');

// We have things like:
// config: { responseMimeType: "application/json",           });
code = code.replace(/config:\s*\{\s*responseMimeType:\s*"application\/json",\s*\}\);/g, 'config: { responseMimeType: "application/json" }\n});');
code = code.replace(/generationConfig:\s*\{\s*responseMimeType:\s*"application\/json"\s*\},\s*\}\);/g, 'generationConfig: { responseMimeType: "application/json" }\n});');

fs.writeFileSync('src/services/geminiService.ts', code);
