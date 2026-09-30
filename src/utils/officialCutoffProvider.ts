import unilagCutoffs from '../data/unilagCutoffs.json';
import { FUTA_CUTOFFS_2026_2027, getFUTACutoffForCandidate, FUTA_SESSION, FUTA_INSTITUTION_NAME } from '../data/futaCutoffs2026_2027';
import { UI_CUTOFFS_2025_2026, getUICutoffByCourse, UI_SESSION, UI_INSTITUTION_NAME } from '../data/uiCutoffs2025_2026';
import { OAU_CUTOFFS_2025_2026, getOAUCutoffForCandidate, OAU_SESSION, OAU_INSTITUTION_NAME } from '../data/oauCutoffs2025_2026';
import { DELSU_CUTOFFS_2026_2027, DELSU_SESSION, DELSU_INSTITUTION_NAME } from '../data/delsuCutoffs2026_2027';
import { FUHSI_CUTOFFS_2026_2027, FUHSI_SESSION, FUHSI_INSTITUTION_NAME } from '../data/fuhsiCutoffs2026_2027';
import { FULOKOJA_CUTOFFS_2026_2027, FULOKOJA_SESSION, FULOKOJA_INSTITUTION_NAME } from '../data/fulokojaCutoffs2026_2027';
import { FUOYE_CUTOFFS_2026_2027, FUOYE_SESSION, FUOYE_INSTITUTION_NAME } from '../data/fuoyeCutoffs2026_2027';
import { FUTMINNA_CUTOFFS_2026_2027, FUTMINNA_SESSION, FUTMINNA_INSTITUTION_NAME } from '../data/futminnaCutoffs2026_2027';
import { getLAUTECHCutoffByCourse, LAUTECH_CUTOFFS_2025_2026 } from '../data/lautechCutoffs2025_2026';
import { YABATECH_CUTOFFS_2026_2027, YABATECH_SESSION, YABATECH_INSTITUTION_NAME } from '../data/yabatechCutoffs2026_2027';

export interface OfficialCutoffResult {
  institution: string;
  course: string;
  cutoff: number;
  departmentalCutoff: string;
  institutionalCutoff: string;
  cutoffIsOfficial: boolean;
  cutoffType: 'official_departmental_cutoff';
  cutoffSource: string;
  cutoffYear: string;
  cutoffQuotaUsed: string;
  isCatchment: boolean;
  isELDS: boolean;
  explanation: string;
}

function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/\band\b/g, '')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Universal lookup for all officially published university departmental cutoffs in Nigeria.
 */
export function getOfficialInstitutionCutoff(
  university: string,
  course: string,
  stateOfOrigin?: string
): OfficialCutoffResult | null {
  if (!university || !course) return null;

  const nUni = normalize(university);
  const nCourse = normalize(course);
  const stateKey = (stateOfOrigin || '').toLowerCase().trim();

  // 1. UNIVERSITY OF LAGOS (UNILAG)
  if (nUni.includes('unilag') || nUni.includes('lagos') && (nUni.includes('university') || nUni.includes('fed'))) {
    const depts = (unilagCutoffs as any).departments || [];
    let found = depts.find((d: any) => normalize(d.name) === nCourse);
    if (!found) {
      found = depts.find((d: any) => {
        const dNorm = normalize(d.name);
        return dNorm.includes(nCourse) || nCourse.includes(dNorm);
      });
    }

    if (found && found.merit !== null && found.merit !== undefined) {
      const catchmentStates = ['ekiti', 'lagos', 'ogun', 'ondo', 'osun', 'oyo'];
      const hasCatchment = stateKey && catchmentStates.includes(stateKey) &&
        found.catchment && found.catchment[stateKey] !== undefined && found.catchment[stateKey] !== null;

      const targetCutoff = hasCatchment ? found.catchment[stateKey] : found.merit;
      const quotaLabel = hasCatchment ? `Catchment Quota (${stateOfOrigin})` : 'National Merit Quota';

      return {
        institution: "University of Lagos (UNILAG)",
        course: found.name,
        cutoff: targetCutoff,
        departmentalCutoff: `${targetCutoff}%`,
        institutionalCutoff: "200",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (UNILAG Central Admissions Committee Bulletin)',
        cutoffYear: "2026/2027",
        cutoffQuotaUsed: quotaLabel,
        isCatchment: !!hasCatchment,
        isELDS: false,
        explanation: `Official UNILAG 2026/2027 Cutoff: Merit (${found.merit}%)${hasCatchment ? `, Catchment for ${stateOfOrigin} (${targetCutoff}%)` : ''}`
      };
    }
  }

  // 2. FEDERAL UNIVERSITY OF TECHNOLOGY, AKURE (FUTA)
  if (nUni.includes('futa') || (nUni.includes('akure') && (nUni.includes('technology') || nUni.includes('fed')))) {
    const futaCandidate = getFUTACutoffForCandidate(course, stateOfOrigin);
    if (futaCandidate && futaCandidate.programme) {
      return {
        institution: FUTA_INSTITUTION_NAME,
        course: futaCandidate.programme.programme,
        cutoff: futaCandidate.cutoff,
        departmentalCutoff: `${futaCandidate.cutoff}%`,
        institutionalCutoff: "180",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (FUTA Admissions Unit Approved Benchmarks)',
        cutoffYear: FUTA_SESSION,
        cutoffQuotaUsed: futaCandidate.quotaLabel,
        isCatchment: futaCandidate.quotaType === 'catchment',
        isELDS: futaCandidate.quotaType === 'elds',
        explanation: `Official FUTA 2026/2027 Cutoff: Merit (${futaCandidate.programme.merit}%), Catchment (${futaCandidate.programme.catchment}%), ELDS (${futaCandidate.programme.elds}%)`
      };
    }
  }

  // 3. UNIVERSITY OF IBADAN (UI)
  if (nUni.includes('ibadan') || nUni === 'ui' || nUni.includes('universityofibadan')) {
    const uiProg = getUICutoffByCourse(course);
    if (uiProg) {
      // Check ELDS / Catchment
      const eldsStates = ["adamawa", "bauchi", "bayelsa", "benue", "borno", "cross river", "ebonyi", "gombe", "jigawa", "kaduna", "kano", "katsina", "kebbi", "kogi", "kwara", "nasarawa", "niger", "plateau", "rivers", "sokoto", "taraba", "yobe", "zamfara"];
      const catchmentStates = ["ekiti", "lagos", "ogun", "ondo", "osun", "oyo"];
      
      const isELDS = eldsStates.includes(stateKey);
      const isCatchment = catchmentStates.includes(stateKey);

      const targetCutoff = isELDS ? uiProg.elds : (isCatchment ? uiProg.catchment : uiProg.merit);
      const quotaLabel = isELDS ? `ELDS Quota (${stateOfOrigin})` : (isCatchment ? `Catchment Quota (${stateOfOrigin})` : 'National Merit Quota');

      return {
        institution: UI_INSTITUTION_NAME,
        course: uiProg.programme,
        cutoff: targetCutoff,
        departmentalCutoff: `${targetCutoff}%`,
        institutionalCutoff: "200",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2025-2026 Dataset (UI Admissions Committee Approved Benchmarks)',
        cutoffYear: UI_SESSION,
        cutoffQuotaUsed: quotaLabel,
        isCatchment,
        isELDS,
        explanation: `Official UI 2025/2026 Cutoff: Merit (${uiProg.merit}%), Catchment (${uiProg.catchment}%), ELDS (${uiProg.elds}%)`
      };
    }
  }

  // 4. OBAFEMI AWOLOWO UNIVERSITY (OAU)
  if (nUni.includes('oau') || nUni.includes('obafemi') || nUni.includes('awolowo') || nUni.includes('ife')) {
    const oauCandidate = getOAUCutoffForCandidate(course, stateOfOrigin || "");
    if (oauCandidate && oauCandidate.programme) {
      return {
        institution: OAU_INSTITUTION_NAME,
        course: oauCandidate.programme.programme,
        cutoff: oauCandidate.cutoff,
        departmentalCutoff: `${oauCandidate.cutoff}%`,
        institutionalCutoff: "200",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2025-2026 Dataset (OAU Faculty Dean Stamped Publication)',
        cutoffYear: OAU_SESSION,
        cutoffQuotaUsed: oauCandidate.quotaLabel,
        isCatchment: oauCandidate.quotaType === 'catchment',
        isELDS: oauCandidate.quotaType === 'elds',
        explanation: `Official OAU 2025/2026 Cutoff: Merit (${oauCandidate.programme.merit}%), Catchment for ${stateOfOrigin || 'State'} (${oauCandidate.cutoff}%)`
      };
    }
  }

  // 5. DELTA STATE UNIVERSITY (DELSU)
  if (nUni.includes('delsu') || (nUni.includes('delta') && nUni.includes('state') && nUni.includes('abraka'))) {
    let found = DELSU_CUTOFFS_2026_2027.find(p => normalize(p.programme) === nCourse);
    if (!found) {
      found = DELSU_CUTOFFS_2026_2027.find(p => {
        const pNorm = normalize(p.programme);
        return pNorm.includes(nCourse) || nCourse.includes(pNorm);
      });
    }
    if (found) {
      return {
        institution: DELSU_INSTITUTION_NAME,
        course: found.programme,
        cutoff: found.cutoff,
        departmentalCutoff: `${found.cutoff}%`,
        institutionalCutoff: "150",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (DELSU Vice Chancellor Directorate Release)',
        cutoffYear: DELSU_SESSION,
        cutoffQuotaUsed: 'National Merit Quota',
        isCatchment: false,
        isELDS: false,
        explanation: `Official DELSU 2026/2027 Cutoff: ${found.cutoff}%`
      };
    }
  }

  // 6. FUOYE (Federal University Oye-Ekiti)
  if (nUni.includes('fuoye') || (nUni.includes('oye') && nUni.includes('ekiti'))) {
    let found = FUOYE_CUTOFFS_2026_2027.find(p => normalize(p.programme) === nCourse);
    if (!found) {
      found = FUOYE_CUTOFFS_2026_2027.find(p => {
        const pNorm = normalize(p.programme);
        return pNorm.includes(nCourse) || nCourse.includes(pNorm);
      });
    }
    if (found) {
      return {
        institution: FUOYE_INSTITUTION_NAME,
        course: found.programme,
        cutoff: found.meritScore,
        departmentalCutoff: `${found.meritScore}%`,
        institutionalCutoff: "160",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (FUOYE Admissions Board Approved Merit Points)',
        cutoffYear: FUOYE_SESSION,
        cutoffQuotaUsed: 'National Merit Quota',
        isCatchment: false,
        isELDS: false,
        explanation: `Official FUOYE 2026/2027 Merit Cutoff: ${found.meritScore}%`
      };
    }
  }

  // 7. FULOKOJA (Federal University Lokoja)
  if (nUni.includes('fulokoja') || (nUni.includes('lokoja') && (nUni.includes('university') || nUni.includes('fed')))) {
    let found = FULOKOJA_CUTOFFS_2026_2027.find(p => normalize(p.programme) === nCourse);
    if (!found) {
      found = FULOKOJA_CUTOFFS_2026_2027.find(p => {
        const pNorm = normalize(p.programme);
        return pNorm.includes(nCourse) || nCourse.includes(pNorm);
      });
    }
    if (found) {
      return {
        institution: FULOKOJA_INSTITUTION_NAME,
        course: found.programme,
        cutoff: found.cutoff,
        departmentalCutoff: `${found.cutoff}%`,
        institutionalCutoff: "160",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (FULokoja Senate Admissions Committee Release)',
        cutoffYear: FULOKOJA_SESSION,
        cutoffQuotaUsed: 'National Merit Quota',
        isCatchment: false,
        isELDS: false,
        explanation: `Official FULokoja 2026/2027 Cutoff: ${found.cutoff}%`
      };
    }
  }

  // 8. FUHSI (Federal University of Health Sciences, Ila-Orangun)
  if (nUni.includes('fuhsi') || (nUni.includes('ila') && nUni.includes('orangun'))) {
    let found = FUHSI_CUTOFFS_2026_2027.find(p => normalize(p.programme) === nCourse);
    if (!found) {
      found = FUHSI_CUTOFFS_2026_2027.find(p => {
        const pNorm = normalize(p.programme);
        return pNorm.includes(nCourse) || nCourse.includes(pNorm);
      });
    }
    if (found) {
      return {
        institution: FUHSI_INSTITUTION_NAME,
        course: found.programme,
        cutoff: found.merit,
        departmentalCutoff: `${found.merit}%`,
        institutionalCutoff: "180",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (FUHSI Admissions Board Release)',
        cutoffYear: FUHSI_SESSION,
        cutoffQuotaUsed: 'National Merit Quota',
        isCatchment: false,
        isELDS: false,
        explanation: `Official FUHSI 2026/2027 Cutoff: ${found.merit}%`
      };
    }
  }

  // 9. FUTMINNA (Federal University of Technology Minna)
  if (nUni.includes('futminna') || (nUni.includes('minna') && (nUni.includes('technology') || nUni.includes('fed')))) {
    let found = FUTMINNA_CUTOFFS_2026_2027.find(p => normalize(p.programme) === nCourse);
    if (!found) {
      found = FUTMINNA_CUTOFFS_2026_2027.find(p => {
        const pNorm = normalize(p.programme);
        return pNorm.includes(nCourse) || nCourse.includes(pNorm);
      });
    }
    if (found) {
      return {
        institution: FUTMINNA_INSTITUTION_NAME,
        course: found.programme,
        cutoff: found.cutoff,
        departmentalCutoff: `${found.cutoff}%`,
        institutionalCutoff: "160",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (FUTMINNA Academic Board Approved Benchmarks)',
        cutoffYear: FUTMINNA_SESSION,
        cutoffQuotaUsed: 'National Merit Quota',
        isCatchment: false,
        isELDS: false,
        explanation: `Official FUTMINNA 2026/2027 Merit Cutoff: ${found.cutoff}%`
      };
    }
  }

  // 10. LAUTECH
  if (nUni.includes('lautech') || nUni.includes('ladoke') || nUni.includes('ogbomoso')) {
    const lautechCutoff = getLAUTECHCutoffByCourse(course);
    if (lautechCutoff) {
      return {
        institution: "Ladoke Akintola University of Technology (LAUTECH)",
        course: lautechCutoff.programme,
        cutoff: lautechCutoff.utmeCutoff,
        departmentalCutoff: `${lautechCutoff.utmeCutoff}%`,
        institutionalCutoff: "170",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2025-2026 Dataset (LAUTECH Admissions Committee Approved Cut-offs)',
        cutoffYear: "2025/2026",
        cutoffQuotaUsed: 'National Merit Quota',
        isCatchment: false,
        isELDS: false,
        explanation: `Official LAUTECH 2025/2026 Cutoff: ${lautechCutoff.utmeCutoff}%`
      };
    }
  }

  // 11. YABATECH
  if (nUni.includes('yaba') || nUni.includes('yabatech')) {
    let found = YABATECH_CUTOFFS_2026_2027.find(p => normalize(p.programme) === nCourse);
    if (!found) {
      found = YABATECH_CUTOFFS_2026_2027.find(p => {
        const pNorm = normalize(p.programme);
        return pNorm.includes(nCourse) || nCourse.includes(pNorm);
      });
    }
    if (found) {
      return {
        institution: YABATECH_INSTITUTION_NAME,
        course: found.programme,
        cutoff: found.meritScore,
        departmentalCutoff: `${found.meritScore}%`,
        institutionalCutoff: "150",
        cutoffIsOfficial: true,
        cutoffType: 'official_departmental_cutoff',
        cutoffSource: 'Official 2026-2027 Dataset (YABATECH Academic Board Cut-off Mark Release)',
        cutoffYear: YABATECH_SESSION,
        cutoffQuotaUsed: 'National Merit Quota',
        isCatchment: false,
        isELDS: false,
        explanation: `Official YABATECH 2026/2027 Cutoff: ${found.meritScore}%`
      };
    }
  }

  return null;
}

/**
 * Returns the verified, accredited undergraduate programmes for institutions
 * with official datasets in CampusAI.ng.
 */
export function getOfficialInstitutionProgrammes(university: string): string[] | null {
  if (!university) return null;
  const nUni = normalize(university);

  // 1. UNILAG
  if (nUni.includes('unilag') || (nUni.includes('lagos') && (nUni.includes('university') || nUni.includes('fed')))) {
    const depts = (unilagCutoffs as any).departments || [];
    return depts.map((d: any) => d.name).sort();
  }

  // 2. FUTA
  if (nUni.includes('futa') || (nUni.includes('akure') && (nUni.includes('technology') || nUni.includes('fed')))) {
    return Array.from(new Set(FUTA_CUTOFFS_2026_2027.map(p => p.programme))).sort();
  }

  // 3. UI
  if (nUni.includes('ibadan') || nUni === 'ui' || nUni.includes('universityofibadan')) {
    return Array.from(new Set(UI_CUTOFFS_2025_2026.map(p => p.programme))).sort();
  }

  // 4. OAU
  if (nUni.includes('oau') || nUni.includes('awolowo') || nUni.includes('ife')) {
    return Array.from(new Set(OAU_CUTOFFS_2025_2026.map(p => p.programme))).sort();
  }

  // 5. DELSU
  if (nUni.includes('delsu') || (nUni.includes('delta') && nUni.includes('university'))) {
    return Array.from(new Set(DELSU_CUTOFFS_2026_2027.map(p => p.programme))).sort();
  }

  // 6. FUHSI
  if (nUni.includes('fuhsi') || nUni.includes('ila') || nUni.includes('healthsciences')) {
    return Array.from(new Set(FUHSI_CUTOFFS_2026_2027.map(p => p.programme))).sort();
  }

  // 7. FULOKOJA
  if (nUni.includes('fulokoja') || nUni.includes('lokoja')) {
    return Array.from(new Set(FULOKOJA_CUTOFFS_2026_2027.map(p => p.programme))).sort();
  }

  // 8. FUOYE
  if (nUni.includes('fuoye') || nUni.includes('oyeekiti') || nUni.includes('oye')) {
    return Array.from(new Set(FUOYE_CUTOFFS_2026_2027.map(p => p.programme))).sort();
  }

  // 9. FUTMINNA
  if (nUni.includes('futminna') || nUni.includes('minna')) {
    return Array.from(new Set(FUTMINNA_CUTOFFS_2026_2027.map(p => p.programme))).sort();
  }

  // 10. LAUTECH
  if (nUni.includes('lautech') || nUni.includes('ladoke') || nUni.includes('ogbomoso')) {
    return Array.from(new Set(LAUTECH_CUTOFFS_2025_2026.map(p => p.programme))).sort();
  }

  // 11. YABATECH
  if (nUni.includes('yaba') || nUni.includes('yabatech')) {
    return Array.from(new Set(YABATECH_CUTOFFS_2026_2027.map(p => p.programme))).sort();
  }

  return null;
}
