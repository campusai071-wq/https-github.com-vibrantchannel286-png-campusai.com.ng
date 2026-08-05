const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const cutoffFuncCode = `export const getCourseCutoffInfo = async (
  university: string,
  course: string,
  score: number,
  oLevels: string,
  jambSubjects: string[],
  role?: string,
  isAwaitingResult = false,
  isPostUtmePending = false,
  formulaExplanation?: string,
  stateOfOrigin?: string,
  isELDS = false,
  isCatchment = false,
  quotaDiscount = 0,
  jambScore = 0,
  postUtmeScore = 0,
  olevelPoints = 0
) => {
  let fallbackDeterministicResult: any = null;
  try {
    // ─── DEDUPLICATE AND NORMALIZE JAMB SUBJECTS ──────────────────────────────
    const cleanJambSubjects = Array.from(
      new Set(
        (jambSubjects || [])
          .flatMap(s => String(s || '').split(/[_,\/\+]+/))
          .map(s => String(s || '').trim())
          .filter(Boolean)
      )
    );

    // ─── 1. MANDATORY SUBJECT COMBINATION VALIDATION HARD FAILURE GATE ───────────
    const subjectCheck = validateMandatorySubjects(course, cleanJambSubjects);
    if (!subjectCheck.valid) {
      console.log(\`Disqualified due to subject mismatch for \${course} at \${university}. Skipping external API call.\`);
      return {
        departmentalCutoff: "N/A",
        institutionalCutoff: "160",
        cutoff: "N/A",
        mathBreakdown: \`Aggregate score of \${score}% calculated for \${university} (\${course}).\`,
        scoreBreakdown: [
          { factor: "Aggregate", impact: \`\${score}%\` },
          { factor: "Subject Match", impact: "Invalid" }
        ],
        subjectCombinationValidation: subjectCheck,
        reliability: "high",
        confidenceReasoning: "Algorithmic validation determined mandatory JAMB subject mismatch.",
        evidencePanel: [],
        recommendation: \`CRITICAL JAMB SUBJECT MISMATCH: Your written JAMB subjects (\${cleanJambSubjects.join(', ')}) do not meet the compulsory requirements for \${course} at \${university}. \${subjectCheck.reason}\`,
        detailedStrategy: \`### 1. Verdict Summary\\n- **Verdict Status:** **Disqualified / Invalid Subject Combination**\\n- **Admission Probability:** **0%**\\n\\n### 2. The Reality Check\\nYour written JAMB subject combination of **\${cleanJambSubjects.join(', ')}** does **NOT** meet the compulsory subject requirements for **\${course}** at **\${university}**. \${subjectCheck.reason}\\n\\n### 3. Actionable Next Steps\\n*   **Immediate JAMB Change of Course:** Log into your JAMB CAPS portal and change your course choice to a department that strictly accepts your written JAMB subjects (\${cleanJambSubjects.join(', ')}).\\n*   **Consult JAMB Brochure:** Verify subject requirements for alternative departments before submitting your change of course.\`,
        probability: 0,
        verdict: "Disqualified / Invalid Subject Combination",
        alternatives: sanitizeAlternativeCourses([], course, cleanJambSubjects, university, stateOfOrigin),
        strengths: ["Calculated aggregate score recorded"],
        riskFactors: ["Invalid JAMB subject combination for chosen department"],
        isOffered: true,
        fresherBudget: "Estimated Total: ₦350,000 (Consult official portal for exact fee schedule)",
        sourcesCited: ['jamb.gov.ng'],
        predictionConfidenceInterval: "0%"
      };
    }

    const cacheKey = \`\${university}_\${course}_\${score}_\${oLevels}_\${cleanJambSubjects.join('_')}_\${role || 'Std'}_\${isAwaitingResult}_\${isPostUtmePending}_\${stateOfOrigin || 'None'}_\${isELDS}_\${isCatchment}_\${quotaDiscount}_v5\`;
    const cachedResult = await getCachedCourseCutoffInfo(university, cacheKey);
    if (cachedResult) {
      console.log(\`Using cached course cutoff check for \${university} - \${course}\`);
      let manualOverride = await getCutoffOverride(university, course);
      const nUni = university.toLowerCase().trim();
      const nCourse = course.toLowerCase().trim();
      if (!manualOverride && (nUni.includes("futa") || nUni.includes("akure") || nUni.includes("technology, akure")) && nCourse.includes("metallurgical")) {
        manualOverride = {
          institution: university,
          course: course,
          departmentalCutoff: "55.0%",
          institutionalCutoff: "180",
          explanation: "FUTA Merit Cutoff (JAMB + O'Level point aggregate system)"
        };
      }
      if (manualOverride) {
        cachedResult.departmentalCutoff = manualOverride.departmentalCutoff;
        if (manualOverride.institutionalCutoff) cachedResult.institutionalCutoff = manualOverride.institutionalCutoff;
        cachedResult.cutoff = manualOverride.departmentalCutoff;
        const parsedCutoffVal = parseFloat(manualOverride.departmentalCutoff.replace(/[^0-9.]/g, '')) || 55.0;
        const reEval = enforceAdmissionTiers(
          score, parsedCutoffVal, university, course, stateOfOrigin, isELDS, isCatchment,
          isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels
        );
        cachedResult.verdict = reEval.verdict;
        cachedResult.probability = reEval.probability;
        cachedResult.recommendation = reEval.recommendation;
        cachedResult.detailedStrategy = reEval.detailedStrategy;
      }
      if (Array.isArray(cachedResult.alternatives)) {
        cachedResult.alternatives = sanitizeAlternativeCourses(
          cachedResult.alternatives,
          course,
          cleanJambSubjects,
          university,
          stateOfOrigin
        );
      }
      return cachedResult;
    }

    // ─── 2. GROUNDING & LIVE SEARCH ───────────────────────────────────────────
    let officialCutoffData = "";
    let rawSearchContext = "";
    try {
      const [search2026, searchHistoric, searchSchedule] = await Promise.all([
        searchWeb(\`official 2026/2027 Post-UTME estimated competitive benchmark marks for \${course} at \${university} Nigeria\`).catch(() => ""),
        searchWeb(\`"\${university}" "\${course}" cutoff mark OR merit aggregate 2024 OR 2025 percentage score\`).catch(() => ""),
        searchWeb(\`"\${university}" Post-UTME 2026/2027 screening registration status form out dates OR exam schedule\`).catch(() => "")
      ]);

      const parts = [];
      if (search2026 && search2026.length > 50) parts.push(\`[2026/2027 Current Release]:\\n\${search2026}\`);
      if (searchHistoric && searchHistoric.length > 50) parts.push(\`[Historical Benchmarks]:\\n\${searchHistoric}\`);
      if (searchSchedule && searchSchedule.length > 50) parts.push(\`[Registration Status & Exam Schedule]:\\n\${searchSchedule}\`);

      if (parts.length > 0) {
        rawSearchContext = parts.join("\\n\\n");
        officialCutoffData = "OFFICIAL ONLINE GROUNDING DATA & SEARCH RESULTS (Use this as primary supporting evidence for cut-offs, fee schedules, and registration deadlines):\\n" + rawSearchContext.substring(0, 10000);
        const knowledgeKey = ("cutoff_search_raw_" + university + "_" + course).toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
        saveKnowledgeFragment(knowledgeKey, rawSearchContext.substring(0, 5000)).catch(err => {
          console.error("Error saving raw search facts to knowledge fragments:", err);
        });
      } else {
        officialCutoffData = "No specific online search grounding available. Rely on standard historical competitiveness and general institutional parameters.";
      }
    } catch (searchError) {
      console.warn("Search for official cutoff failed:", searchError);
      officialCutoffData = "Search failed due to rate limits or connectivity. Rely on standard competitive thresholds.";
    }

    let manualOverride = await getCutoffOverride(university, course);
    const nUni = university.toLowerCase().trim();
    const nCourse = course.toLowerCase().trim();
    if (!manualOverride && (nUni.includes("futa") || nUni.includes("akure") || nUni.includes("technology, akure")) && nCourse.includes("metallurgical")) {
      manualOverride = {
        institution: university,
        course: course,
        departmentalCutoff: "55.0%",
        institutionalCutoff: "180",
        explanation: "FUTA Merit Cutoff (JAMB + O'Level point aggregate system)"
      };
    }

    // ─── 3. DETERMINISTIC FOUNDATION EVALUATION ────────────────────────────────
    let cutoffVal = extractCutoffFallback(course, officialCutoffData || null);
    if (manualOverride && manualOverride.departmentalCutoff) {
      const match = manualOverride.departmentalCutoff.toString().match(/(\\d+(\\.\\d+)?)/);
      if (match) cutoffVal = parseFloat(match[1]);
    }

    const deterministicEvaluation = enforceAdmissionTiers(
      score, cutoffVal, university, course, stateOfOrigin, isELDS, isCatchment,
      isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels
    );

    const isPendingState = isPostUtmePending || isAwaitingResult;
    const scoreLabel = isPendingState ? 'Projected Aggregate Score' : 'Aggregate Score';
    const mathBreakdown = \`\${scoreLabel}: \${score}% calculated for \${university} (\${course}). Raw JAMB Score: \${jambScore > 0 ? jambScore : 'Not provided'} / 400. Raw Post-UTME: \${postUtmeScore > 0 ? \`\${postUtmeScore} / 100\` : (isPostUtmePending ? 'Pending' : 'N/A')}.\`;

    fallbackDeterministicResult = {
      departmentalCutoff: \`\${cutoffVal}%\`,
      institutionalCutoff: manualOverride?.institutionalCutoff || "160",
      cutoff: \`\${cutoffVal}%\`,
      mathBreakdown,
      scoreBreakdown: [
        { factor: "Aggregate Score", impact: \`\${score}%\` },
        { factor: "Cutoff Benchmark", impact: \`\${cutoffVal}%\` }
      ],
      subjectCombinationValidation: subjectCheck,
      reliability: manualOverride ? "high" : "medium",
      confidenceReasoning: manualOverride ? "Official verified cutoff override applied." : "Algorithmic audit completed using official university & JAMB competitive benchmarks.",
      evidencePanel: [],
      recommendation: deterministicEvaluation.recommendation,
      detailedStrategy: deterministicEvaluation.detailedStrategy,
      probability: deterministicEvaluation.probability,
      verdict: deterministicEvaluation.verdict,
      alternatives: sanitizeAlternativeCourses([], course, cleanJambSubjects, university, stateOfOrigin),
      strengths: score >= cutoffVal ? ["Aggregate score meets competitive benchmark", "Valid subject combination"] : ["Valid subject combination"],
      riskFactors: score < cutoffVal ? ["Aggregate score below merit cutoff", "High competition"] : ["Quota limits"],
      isOffered: true,
      fresherBudget: "Estimated Total: ₦350,000 (Consult official portal for exact fee schedule)",
      sourcesCited: ['jamb.gov.ng'],
      predictionConfidenceInterval: \`\${Math.max(5, deterministicEvaluation.probability - 5)}% to \${Math.min(98, deterministicEvaluation.probability + 5)}%\`
    };

    let overridePrompt = "";
    if (manualOverride) {
      overridePrompt = \`⚠️ CRITICAL SYSTEM OVERRIDE (MANDATORY ADMISSION GROUND TRUTH):
- The official, verified 2026 departmental competitive cut-off score for "\${course}" at "\${university}" is EXCLUSIVELY: "\${manualOverride.departmentalCutoff}".
- The institutional cut-off floor is: "\${manualOverride.institutionalCutoff || '150'}".
- Verified explanation / policy detail: "\${manualOverride.explanation || 'No extra notes.'}".
You MUST evaluate the candidate's aggregate score (\${score}%) strictly against this verified departmental cut-off score ("\${manualOverride.departmentalCutoff}") to compute the probability, recommendation, and verdict.\`;
    }

    const allKnowledge = await getAllKnowledgeFragments();
    const knowledge = allKnowledge.filter(k => {
      const keyStr = String(k.key || '').toLowerCase();
      const valStr = String(k.value || '').toLowerCase();
      const uniStr = university.toLowerCase();
      return keyStr.includes(uniStr) || valStr.includes(uniStr) || keyStr.includes('general');
    });

    let learnedPrompt = "";
    if (knowledge.length > 0) {
      let combined = knowledge.map(k => \`- \${k.key}: \${k.value}\`).join('\\n');
      if (combined.length > 10000) {
        combined = combined.substring(0, 10000) + "... [TRUNCATED]";
      }
      learnedPrompt = "ADDITIONAL LEARNED KNOWLEDGE (USE THIS TO OVERRIDE STATIC DATA IF IT CONTRADICTS):\\n" + combined + "\\n\\n";
    }

    const normUni = university.toLowerCase();
    const f = formulaExplanation ? formulaExplanation.toLowerCase() : '';
    let usesPostUtme = true;
    if (f.includes('futa') || normUni.includes('futa') || f.includes('75_25') || f.includes('75:25')) {
      usesPostUtme = false;
    } else if (f.includes('lasu') || normUni.includes('lasu') || f.includes('60_40') || f.includes('60:40') || f.includes('point_based')) {
      usesPostUtme = false;
    } else if (f.includes('fuoye') || normUni.includes('fuoye') || normUni.includes('oye-ekiti') || normUni.includes('oye ekiti')) {
      usesPostUtme = false;
    } else if (f.includes('pure_jamb')) {
      usesPostUtme = false;
    }

    let calcDedicatedKey: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const pref = localStorage.getItem('campusai_calc_key_pref');
        calcDedicatedKey = resolvePrefKey(pref);
      } catch (e) {
        console.error("Error reading calc key pref:", e);
      }
    }

    const response = await runAIWithFallback(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: \`
\${overridePrompt}

\${officialCutoffData}

\${learnedPrompt}

CRITICAL RULES FOR ADMISSION ANALYSIS:
1. DEPARTMENTAL CUT-OFF EXPLICIT GROUNDING:
   - Extract or search for the exact published or verified estimated competitive benchmark mark / aggregate score for \${course} at \${university} from the grounding search data. Output as percentage or score e.g. "58.5%" or "72.0%".
2. REALISTIC FRESHER BUDGET:
   - "fresherBudget" MUST be a realistic, structured, professional cost breakdown for a first-year student at "\${university}" in NGN.
3. STRICT FACULTY BOUNDARY MANDATE:
   - "alternatives" MUST contain 2 to 4 actual alternative courses offered at \${university} or alternative Nigerian universities matching candidate's written JAMB subjects (\${cleanJambSubjects.join(', ')}).
4. STRATEGIC ADVISEMENT BY STRICT TIER ASSIGNMENT:
   Compare candidate aggregate (\${score}%) directly against cutoff (\${cutoffVal}%):
   - Tier 1: BORDERLINE (Score == Cutoff) -> "Borderline", Probability 50-60%.
   - Tier 2: STRONG (Score is 1-5.99% above) -> "Strong", Probability 65-79%.
   - Tier 3: VERY STRONG (Score >= 6% above) -> "Very Strong / Excellent", Probability 80-98%.
   - Tier 4: BELOW CUTOFF (Score < Cutoff) -> "Low Probability", Probability < 30%.
5. DETAILED STRATEGY MARKDOWN:
   Must contain three sections: '### 1. Verdict Summary', '### 2. The Reality Check', and '### 3. Actionable Next Steps'.

- Institution: \${university}
- Program: \${course}
- Candidate Aggregate Score: \${score}%
- Pre-Calculated O'Level Points: \${olevelPoints > 0 ? olevelPoints : 'N/A'}
- Raw JAMB Score: \${jambScore > 0 ? \`\${jambScore} / 400\` : 'Not explicitly provided'}
- Raw Post-UTME / Screening Score: \${postUtmeScore > 0 ? \`\${postUtmeScore} / 100\` : 'N/A or Pending'}
- O-Level Profile: \${oLevels}
- JAMB Subjects: \${cleanJambSubjects.join(', ')}
- Role: \${role || 'Standard'}
- Uses Post-UTME Exam: \${usesPostUtme ? 'YES' : 'NO'}
- User Has All Results: \${!isAwaitingResult && !isPostUtmePending ? 'YES' : 'NO'}
- State of Origin: \${stateOfOrigin || 'Not Specified'}
- Is ELDS State: \${isELDS ? 'YES' : 'NO'}
- Is Catchment Area Candidate: \${isCatchment ? 'YES' : 'NO'}

Return JSON:
{
  "institutionalCutoff": "string",
  "departmentalCutoff": "string",
  "cutoff": "string",
  "mathBreakdown": "string",
  "scoreBreakdown": [
    { "factor": "string", "impact": "string" }
  ],
  "subjectCombinationValidation": { "valid": true, "reason": "string" },
  "reliability": "high",
  "confidenceReasoning": "string",
  "evidencePanel": [],
  "recommendation": "string",
  "detailedStrategy": "string",
  "probability": 75,
  "verdict": "Strong",
  "alternatives": [{ "name": "string", "typicalCutoff": "string", "reasoning": "string" }],
  "strengths": ["string"],
  "riskFactors": ["string"],
  "isOffered": true,
  "fresherBudget": "string",
  "sourcesCited": ["string"],
  "predictionConfidenceInterval": "string"
}\`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "HIGH" },
          tools: [{ googleSearch: {} }]
        }
      });
    }, calcDedicatedKey || undefined);

    const parsed = safeJsonParse(response.text, {});
    if (parsed) {
      if (Array.isArray(parsed.alternatives)) {
        parsed.alternatives = sanitizeAlternativeCourses(
          parsed.alternatives,
          course,
          cleanJambSubjects,
          university,
          stateOfOrigin
        );
      }
      saveCachedCourseCutoffInfo(university, cacheKey, parsed).catch(err => {
        console.error("Failed to cache course cutoff info:", err);
      });
      return parsed;
    }
    return fallbackDeterministicResult;
  } catch (e: any) {
    console.error("Gemini API call skipped or failed, returning deterministic foundation:", e);
    if (fallbackDeterministicResult) {
      return fallbackDeterministicResult;
    }
    const cleanSubjects = Array.isArray(jambSubjects) ? jambSubjects.filter(Boolean) : [];
    const manualOverride = await getCutoffOverride(university, course);
    let cutoffVal = extractCutoffFallback(course, null);
    if (manualOverride && manualOverride.departmentalCutoff) {
      const match = manualOverride.departmentalCutoff.toString().match(/(\\d+(\\.\\d+)?)/);
      if (match) cutoffVal = parseFloat(match[1]);
    }
    const enforced = enforceAdmissionTiers(
      score, cutoffVal, university, course, stateOfOrigin, isELDS, isCatchment,
      isAwaitingResult, isPostUtmePending, jambScore, postUtmeScore, formulaExplanation, oLevels
    );
    return {
      departmentalCutoff: \`\${cutoffVal}%\`,
      institutionalCutoff: "160",
      cutoff: \`\${cutoffVal}%\`,
      mathBreakdown: \`Aggregate score of \${score}% calculated for \${university} (\${course}).\`,
      scoreBreakdown: [
        { factor: "Aggregate", impact: \`\${score}%\` },
        { factor: "Cutoff", impact: \`\${cutoffVal}%\` }
      ],
      subjectCombinationValidation: validateMandatorySubjects(course, cleanSubjects),
      reliability: "medium",
      confidenceReasoning: "Fallback algorithmic evaluation applied.",
      evidencePanel: [],
      recommendation: enforced.recommendation,
      detailedStrategy: enforced.detailedStrategy,
      probability: enforced.probability,
      verdict: enforced.verdict,
      alternatives: sanitizeAlternativeCourses([], course, cleanSubjects, university, stateOfOrigin),
      strengths: ["Calculated aggregate score recorded"],
      riskFactors: score < cutoffVal ? ["Aggregate score below merit cutoff"] : [],
      isOffered: true,
      fresherBudget: "Estimated Total: ₦350,000 (Consult official portal for exact fee schedule)",
      sourcesCited: ['jamb.gov.ng'],
      predictionConfidenceInterval: \`\${Math.max(5, enforced.probability - 5)}% to \${Math.min(98, enforced.probability + 5)}%\`
    };
  }
};`;

const startIdx = code.indexOf('export const getCourseCutoffInfo = async (');
const endIdx = code.indexOf('export const getUniversityCourses = async (');

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not locate getCourseCutoffInfo or getUniversityCourses");
  process.exit(1);
}

const newCode = code.substring(0, startIdx) + cutoffFuncCode + "\n\n// ─── Cutoff Calculator ─────────────────────────────────────────────────────────\n\n" + code.substring(endIdx);

fs.writeFileSync('src/services/geminiService.ts', newCode);
console.log("Successfully replaced getCourseCutoffInfo in geminiService.ts!");
