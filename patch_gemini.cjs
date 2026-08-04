const fs = require('fs');
let file = fs.readFileSync('src/services/geminiService.ts', 'utf8');

// Replace diff calculation
file = file.replace(
  /const diff = score - cutoffVal;\n  const quotaText = isELDS \? "ELDS quota" : isCatchment \? "Catchment quota" : "Merit quota";/,
  `let effectiveCutoff = cutoffVal;
  if (isELDS) {
    effectiveCutoff -= 4.5;
  } else if (isCatchment) {
    effectiveCutoff -= 2.5;
  }
  const diff = score - effectiveCutoff;
  const quotaText = isELDS ? "ELDS quota" : isCatchment ? "Catchment quota" : "Merit quota";`
);

// Replace hardcoded "Since you do not fall into the primary catchment quota..."
file = file.replace(
  /\*\*Since you do not fall into the primary catchment quota for this region\*\*, standard general merit rules will apply, which are extremely rigid\./g,
  `Standard tie-breakers and quotas will apply, which are extremely rigid for high-demand fields.`
);

// We need to replace all instances of `\${cutoffVal}%` with `\${effectiveCutoff}%` inside enforceAdmissionTiers
// But we should only do it inside enforceAdmissionTiers block.
const funcStart = file.indexOf('const enforceAdmissionTiers');
const funcEnd = file.indexOf('// ─── Cutoff Calculator');
if (funcStart !== -1 && funcEnd !== -1) {
    const before = file.substring(0, funcStart);
    let middle = file.substring(funcStart, funcEnd);
    const after = file.substring(funcEnd);
    
    middle = middle.replace(/\$\{cutoffVal\}/g, '${effectiveCutoff}');
    
    // Except where we call calculateMaxAndTarget which needs the original cutoff (or effective?)
    // Actually, maxPossibleAggregate should probably be compared to effectiveCutoff!
    // So changing cutoffVal to effectiveCutoff everywhere inside the function is correct!
    // Let's replace 'cutoffVal' with 'effectiveCutoff' when passed to calculateMaxAndTarget
    
    file = before + middle + after;
}

fs.writeFileSync('src/services/geminiService.ts', file);
console.log('patched');
