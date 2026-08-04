const fs = require('fs');
let file = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const funcStart = file.indexOf('const enforceAdmissionTiers =');
const funcEnd = file.indexOf('// ─── Cutoff Calculator');

if (funcStart !== -1 && funcEnd !== -1) {
    const before = file.substring(0, funcStart);
    let middle = file.substring(funcStart, funcEnd);
    const after = file.substring(funcEnd);
    
    middle = middle.replace(/\$\{cutoffVal\}/g, '${effectiveCutoff}');
    
    // Also, we need to pass effectiveCutoff to calculateMaxAndTarget instead of cutoffVal
    middle = middle.replace(/cutoffVal, university, formulaText/g, 'effectiveCutoff, university, formulaText');
    
    // Also change cutoffVal to effectiveCutoff where it's used in strings outside of interpolations if any
    
    file = before + middle + after;
    fs.writeFileSync('src/services/geminiService.ts', file);
    console.log('patched');
} else {
    console.log('not found');
}
