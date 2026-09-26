/**
 * Multi-Model Admissions Aggregate Engine
 * =========================================
 * Centralised calculation layer for CampusAI.ng
 *
 * Responsibilities:
 *  1. Institution-specific aggregate formula (UNILAG 50:30:20, UI 50:50, UNN online etc.)
 *  2. JAMB 45:35:20 (Merit : Catchment : ELDS) quota-adjusted effective cutoffs
 *  3. 2025/2026 departmental cutoff tables for UNILAG, UI, UNN
 *
 * Quota policy source:
 *  - JAMB Unified Tertiary Matriculation Examination Brochure 2024/2025
 *  - NUC Memo on affirmative cutoff adjustment guidelines
 *
 * Effective cutoff adjustment logic:
 *  - ELDS candidates  → effective cutoff reduced by 5.0 points (federal concession)
 *  - Catchment cands  → effective cutoff reduced by 3.0 points (institutional area bonus)
 *  - National Merit   → no reduction; compete at published departmental cutoff
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuotaPool = 'merit' | 'catchment' | 'elds';

export interface AggregateResult {
  /** Final aggregate out of 100 */
  aggregate: number;
  /** Pool the candidate falls into */
  quotaPool: QuotaPool;
  /** Published departmental cutoff */
  publishedCutoff: number;
  /** Effective cutoff after quota discount */
  effectiveCutoff: number;
  /** Aggregate - effectiveCutoff (positive = above cutoff) */
  buffer: number;
  /** Points discount applied due to quota */
  quotaDiscount: number;
  /** Human-readable label for the quota pool */
  quotaLabel: string;
  /** Breakdown string for display */
  formulaBreakdown: string;
}

// ─── Quota Discount Constants ─────────────────────────────────────────────────

/** Federal ELDS (20% slot pool) effective cutoff reduction */
export const ELDS_CUTOFF_DISCOUNT = 5.0;

/** Institutional Catchment Area (35% slot pool) effective cutoff reduction */
export const CATCHMENT_CUTOFF_DISCOUNT = 3.0;

// ─── O'Level Grade Point Mappings ─────────────────────────────────────────────

export const UNILAG_OLEVEL_GRADE_MAP: Record<string, number> = {
  A1: 4.0,
  B2: 3.6,
  B3: 3.2,
  C4: 2.8,
  C5: 2.4,
  C6: 2.0,
  D7: 0.0,
  E8: 0.0,
  F9: 0.0,
};

/**
 * Calculates candidate's O-Level aggregate contribution based on best 5 relevant subjects.
 * For UNILAG: A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0 (Max = 20.0 points)
 */
export function calculateOlevelPoints(
  grades: string[],
  institution: string = 'unilag'
): number {
  const uni = institution.toLowerCase();
  const sortedPoints = grades
    .map((g) => UNILAG_OLEVEL_GRADE_MAP[g.toUpperCase().trim()] ?? 0)
    .sort((a, b) => b - a)
    .slice(0, 5);

  const total = sortedPoints.reduce((acc, curr) => acc + curr, 0);
  return parseFloat(Math.min(total, 20.0).toFixed(2));
}

// ─── 2025/2026 Departmental Cutoff Tables ────────────────────────────────────

/**
 * UNILAG 2025/2026 Merit Aggregate Cutoffs (50:30:20 model, out of 100)
 */
export const UNILAG_CUTOFFS_2025: Record<string, number> = {
  'Medicine & Surgery': 80.50,
  'Dentistry': 78.20,
  'Pharmacy': 77.40,
  'Nursing Science': 72.30,
  'Medical Laboratory Science': 71.60,
  'Physiotherapy': 71.00,
  'Radiography': 70.50,
  'Law': 76.80,
  'Computer Science': 75.40,
  'Accounting': 74.15,
  'Finance': 73.60,
  'Banking & Finance': 73.30,
  'Economics': 72.80,
  'Electrical Engineering': 73.80,
  'Mechanical Engineering': 73.80,
  'Civil Engineering': 72.90,
  'Chemical Engineering': 72.50,
  'Systems Engineering': 72.30,
  'Business Administration': 71.50,
  'Marketing': 70.80,
  'Mass Communication': 71.20,
  'Architecture': 72.00,
  'Surveying & Geoinformatics': 70.50,
  'Estate Management': 70.20,
  'Biochemistry': 70.00,
  'Microbiology': 69.80,
  'Zoology': 68.50,
  'Botany': 67.80,
  'Marine Sciences': 67.50,
  'Mathematics': 69.20,
  'Physics': 68.90,
  'Chemistry': 68.60,
  'English': 68.20,
  'History & Strategic Studies': 66.50,
  'Philosophy': 65.80,
  'Sociology': 65.40,
  'Political Science': 65.20,
  'Psychology': 66.80,
  'Social Work': 63.50,
  'Library & Information Science': 62.00,
  'Linguistics': 62.00,
  'Adult Education': 60.00,
  'Educational Management': 59.50,
  'Guidance & Counselling': 59.00,
};

/**
 * UI 2025/2026 Merit Aggregate Cutoffs (50:50 model, out of 100)
 */
export const UI_CUTOFFS_2025: Record<string, number> = {
  'Medicine & Surgery': 78.875,
  'Dentistry': 74.500,
  'Nursing Science': 71.375,
  'Pharmacy': 69.125,
  'Physiotherapy': 65.125,
  'Medical Laboratory Science': 63.250,
  'Law': 70.875,
  'Computer Science': 63.500,
  'Electrical & Electronics Engineering': 70.000,
  'Mechanical Engineering': 70.500,
  'Civil Engineering': 63.250,
  'Chemical Engineering': 62.000,
  'Biomedical Engineering': 55.375,
  'Petroleum Engineering': 62.750,
  'Agricultural & Environmental Engineering': 56.875,
  'Accounting': 68.500,
  'Economics': 58.125,
  'Biochemistry': 53.125,
  'Microbiology': 52.000,
  'Zoology': 50.000,
  'Botany': 48.500,
  'Mathematics': 57.000,
  'Physics': 55.000,
  'Chemistry': 54.500,
  'English': 56.500,
  'History': 52.000,
  'Linguistics': 56.875,
  'Communication and Language Arts': 61.000,
  'Political Science': 55.375,
  'Psychology': 54.500,
  'Sociology': 52.000,
  'Theatre Arts': 56.000,
  'Human Nutrition & Dietetics': 55.625,
  'Physiology': 55.750,
  'Anatomy': 54.000,
  'Veterinary Medicine': 57.125,
  'Library & Information Science': 48.000,
};

/**
 * UNN 2025/2026 Effective Cutoffs (online O'Level screening, no written Post-UTME)
 */
export const UNN_CUTOFFS_2025: Record<string, number> = {
  'Medicine & Surgery': 75.00,
  'Pharmacy': 70.00,
  'Dentistry': 69.00,
  'Nursing Science': 66.00,
  'Medical Laboratory Science': 64.00,
  'Law': 72.00,
  'Computer Science': 65.00,
  'Electrical Engineering': 64.00,
  'Mechanical Engineering': 64.00,
  'Civil Engineering': 63.00,
  'Chemical Engineering': 62.00,
  'Accounting': 68.00,
  'Economics': 63.00,
  'Business Administration': 62.00,
  'Political Science': 60.00,
  'Sociology': 58.00,
  'Psychology': 60.00,
  'Mass Communication': 62.00,
  'English & Literary Studies': 60.00,
  'History & International Studies': 58.00,
  'Mathematics': 63.00,
  'Physics': 62.00,
  'Chemistry': 61.00,
  'Biochemistry': 63.00,
  'Microbiology': 60.00,
  'Zoology': 58.00,
  'Botany': 57.00,
  'Veterinary Medicine': 62.00,
  'Agriculture': 58.00,
  'Education': 55.00,
};

// ─── Departmental Cutoff Lookup ───────────────────────────────────────────────

/** Fuzzy cutoff lookup: exact → case-insensitive → substring */
function lookupCutoff(table: Record<string, number>, course: string): number {
  if (table[course] !== undefined) return table[course];
  const lower = course.toLowerCase();
  for (const [key, val] of Object.entries(table)) {
    if (key.toLowerCase() === lower) return val;
  }
  for (const [key, val] of Object.entries(table)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) return val;
  }
  return -1;
}

/** Returns the published 2025/26 departmental cutoff for a given institution + course (or -1 if not found) */
export function getDepartmentalCutoff(institutionName: string, courseName: string): number {
  const uni = institutionName.toLowerCase();
  const course = courseName.trim();

  if (uni.includes('unilag') || (uni.includes('lagos') && uni.includes('university'))) {
    return lookupCutoff(UNILAG_CUTOFFS_2025, course);
  }
  if (uni.includes('ibadan') || (uni.includes(' ui') && !uni.includes('unilorin'))) {
    return lookupCutoff(UI_CUTOFFS_2025, course);
  }
  if (uni.includes('nsukka') || uni.includes('unn') || (uni.includes('nigeria') && uni.includes('university'))) {
    return lookupCutoff(UNN_CUTOFFS_2025, course);
  }
  return -1;
}

// ─── Quota-Adjusted Cutoff ────────────────────────────────────────────────────

/**
 * Returns the effective cutoff after applying ELDS or Catchment quota discounts.
 * Discount policy (JAMB/NUC guidance):
 *  - ELDS: -5.0 pts  |  Catchment: -3.0 pts  |  Merit: 0 pts
 */
export function getEffectiveCutoff(
  publishedCutoff: number,
  quotaPool: QuotaPool
): { effectiveCutoff: number; discount: number; quotaLabel: string } {
  if (quotaPool === 'elds') {
    return {
      effectiveCutoff: parseFloat(Math.max(0, publishedCutoff - ELDS_CUTOFF_DISCOUNT).toFixed(2)),
      discount: ELDS_CUTOFF_DISCOUNT,
      quotaLabel: 'ELDS (20% Pool) — Concessionary -5pts',
    };
  }
  if (quotaPool === 'catchment') {
    return {
      effectiveCutoff: parseFloat(Math.max(0, publishedCutoff - CATCHMENT_CUTOFF_DISCOUNT).toFixed(2)),
      discount: CATCHMENT_CUTOFF_DISCOUNT,
      quotaLabel: 'Catchment Area (35% Pool) — Local Preference -3pts',
    };
  }
  return {
    effectiveCutoff: publishedCutoff,
    discount: 0,
    quotaLabel: 'National Merit (45% Pool) — Open Competition',
  };
}

// ─── Master Evaluation ────────────────────────────────────────────────────────

/**
 * Full admissions evaluation for a candidate.
 *
 * @param institutionName           University name or slug
 * @param courseName                Department/course being applied for
 * @param jamb                      JAMB score (0-400)
 * @param postUtme                  Post-UTME / screening score (0-100)
 * @param olevelPoints              Computed O'Level points using institution-specific grade map
 * @param isELDS                    Whether candidate's state qualifies for ELDS pool
 * @param isCatchment               Whether candidate's state falls in institution's catchment area
 * @param publishedCutoffOverride   Override internal cutoff table (for AI-sourced cutoffs)
 */
export function evaluateAdmission(
  institutionName: string,
  courseName: string,
  jamb: number,
  postUtme: number,
  olevelPoints: number,
  isELDS: boolean,
  isCatchment: boolean,
  publishedCutoffOverride?: number
): AggregateResult {
  const uni = institutionName.toLowerCase();

  // 1. Quota pool (ELDS > Catchment > Merit)
  const quotaPool: QuotaPool = isELDS ? 'elds' : isCatchment ? 'catchment' : 'merit';

  // 2. Institution-specific aggregate
  let aggregate: number;
  let formulaBreakdown: string;

  if (uni.includes('unilag') || (uni.includes('lagos') && uni.includes('university'))) {
    const j = jamb / 8;
    const p = postUtme * 0.3;
    const o = Math.min(olevelPoints, 20);
    aggregate = parseFloat(Math.min(j + p + o, 100).toFixed(2));
    formulaBreakdown = `UNILAG 50:30:20 → JAMB(${j.toFixed(2)}) + Post-UTME(${p.toFixed(2)}) + O'Level(${o.toFixed(2)}) = ${aggregate}`;
  } else if (uni.includes('ibadan') || (uni.includes(' ui') && !uni.includes('unilorin'))) {
    const j = jamb / 8;
    const p = postUtme / 2;
    aggregate = parseFloat(Math.min(j + p, 100).toFixed(2));
    formulaBreakdown = `UI 50:50 → (${jamb}/8) + (${postUtme}/2) = ${j.toFixed(2)} + ${p.toFixed(2)} = ${aggregate}`;
  } else if (uni.includes('nsukka') || uni.includes('unn') || (uni.includes('nigeria') && uni.includes('university'))) {
    const j = jamb / 8;
    aggregate = parseFloat(Math.min(j + postUtme, 100).toFixed(2));
    formulaBreakdown = `UNN Online Screening → (${jamb}/8) + O'Level screening(${postUtme}) = ${j.toFixed(2)} + ${postUtme} = ${aggregate}`;
  } else {
    // Generic 50:30:20 fallback
    const j = jamb / 400 * 50;
    const p = postUtme / 100 * 30;
    const o = Math.min(olevelPoints, 20);
    aggregate = parseFloat(Math.min(j + p + o, 100).toFixed(2));
    formulaBreakdown = `50:30:20 Generic → JAMB(${j.toFixed(2)}) + Post-UTME(${p.toFixed(2)}) + O'Level(${o.toFixed(2)}) = ${aggregate}`;
  }

  // 3. Published cutoff
  const lookupVal = getDepartmentalCutoff(institutionName, courseName);
  const publishedCutoff = publishedCutoffOverride !== undefined
    ? publishedCutoffOverride
    : lookupVal > 0 ? lookupVal : 60;

  // 4. Apply quota discount
  const { effectiveCutoff, discount, quotaLabel } = getEffectiveCutoff(publishedCutoff, quotaPool);

  // 5. Buffer
  const buffer = parseFloat((aggregate - effectiveCutoff).toFixed(2));

  return {
    aggregate,
    quotaPool,
    publishedCutoff,
    effectiveCutoff,
    buffer,
    quotaDiscount: discount,
    quotaLabel,
    formulaBreakdown,
  };
}
