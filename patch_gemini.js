const fs = require('fs');
let file = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const anchor = `    let overridePrompt = "";`;

const injection = `    let overridePrompt = "";
    const isOAU = university.toLowerCase().includes("oau") || university.toLowerCase().includes("obafemi awolowo");
    if (isOAU) {
      const oauReq = getOAURequirementByCourse(course);
      if (oauReq) {
        overridePrompt += \`\\n\\n⚠️ CRITICAL SYSTEM OVERRIDE (OAU OFFICIAL ADMISSION REQUIREMENTS):
- Faculty: \${oauReq.faculty}
- Course: \${oauReq.course}
- Mandatory UTME Subjects: \${oauReq.utmeRequirements}
- Mandatory O'Level Subjects: \${oauReq.olevelRequirements}
- Direct Entry (DE): \${oauReq.directEntryRequirements}
You MUST strictly evaluate the candidate's O-Level and JAMB subjects against these exact OAU requirements. If the candidate's subjects do not match these, they are 100% disqualified.\`;
      }
    }
`;

file = file.replace(anchor, injection);
fs.writeFileSync('src/services/geminiService.ts', file);
