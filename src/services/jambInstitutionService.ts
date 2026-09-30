/**
 * JAMB IBASS Institutional & Programme Directory Service
 * Real-time query engine for verified tertiary institutions and accredited programmes
 * using official JAMB IBASS endpoints with intelligent caching and local ground-truth fallbacks.
 */

import { getOfficialInstitutionProgrammes } from '../utils/officialCutoffProvider';
import { UNIVERSITIES_DB } from '../data/universityData';
import universityData from '../data/universities';

export interface IbassInstitutionRecord {
  id: number;
  title: string;
  name: string;
  abbreviation?: string;
  state?: string;
  ownership?: 'Federal' | 'State' | 'Private' | string;
  type?: string;
  category?: string;
  accreditation?: string;
  capsCode?: string;
  dapsCode?: string;
}

export interface IbassProgrammeRecord {
  id: number;
  institutionId: number;
  title: string;
  cleanName: string;
  department?: string;
  faculty?: string;
  code?: string;
  utmeSubjects?: string;
  olevelRequirements?: string;
  deRequirements?: string;
  remarks?: string;
  status?: string;
}

// In-memory caches for snappy UI performance
const institutionsCache = new Map<string, IbassInstitutionRecord[]>();
const programmesCache = new Map<string, IbassProgrammeRecord[]>();
const courseStringsCache = new Map<string, string[]>();

/**
 * Normalizes ALL-CAPS or raw IBASS course titles to standard Nigerian academic format.
 * Example: "COMPUTER SCIENCE WITH MATHEMATICS" -> "Computer Science with Mathematics"
 */
export function formatProgrammeTitle(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  
  // Lowercase conjunctions and prepositions in Nigerian course names
  const lowerWords = new Set(['and', 'with', 'in', 'of', 'for', 'the', '&', 'to']);

  const words = trimmed.split(' ');
  const formatted = words.map((word, index) => {
    // Preserve abbreviations like (ND/HND), (NCE), (MBBS), (B.Sc), (BA)
    if (word.startsWith('(') && word.endsWith(')')) {
      return word.toUpperCase();
    }
    const cleanWord = word.toLowerCase();
    if (index > 0 && lowerWords.has(cleanWord)) {
      return cleanWord;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return formatted.join(' ')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s*&\s*/g, ' & ');
}

/**
 * Searches and retrieves official accredited institutions from JAMB IBASS.
 */
export async function searchIbassInstitutions(
  searchTerm = '',
  page = 1
): Promise<IbassInstitutionRecord[]> {
  const cacheKey = `search_${searchTerm.toLowerCase().trim()}_p${page}`;
  if (institutionsCache.has(cacheKey)) {
    return institutionsCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/ibass/institutions?page=${page}&inst_search=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const json = await res.json();
      const rawList = Array.isArray(json?.data?.data) ? json.data.data : (Array.isArray(json?.data) ? json.data : []);
      
      const parsed: IbassInstitutionRecord[] = rawList.map((item: any) => {
        const rawTitle = item.title || item.school_name || item.name || '';
        return {
          id: Number(item.id),
          title: rawTitle,
          name: formatProgrammeTitle(rawTitle),
          abbreviation: item.abbreviation || item.original_daps_abbreviation || '',
          state: item.state || '',
          ownership: item.ownership || '',
          type: item.type || '',
          category: item.category || '',
          accreditation: item.accreditation || 'Full',
          capsCode: item.caps_code || '',
          dapsCode: item.daps_code || ''
        };
      });

      if (parsed.length > 0) {
        institutionsCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[JAMB IBASS Service] Live institution search failed, using local DB:', err);
  }

  // Local fallback from universityData catalogue
  const queryLower = searchTerm.toLowerCase().trim();
  const localFallbacks: IbassInstitutionRecord[] = universityData
    .filter(u => !queryLower || u.name.toLowerCase().includes(queryLower) || u.slug.toLowerCase().includes(queryLower))
    .slice(0, 20)
    .map((u, idx) => ({
      id: 9000 + idx,
      title: u.name.toUpperCase(),
      name: u.name,
      abbreviation: u.slug.toUpperCase(),
      state: '',
      ownership: (u.category?.toLowerCase().includes('state') ? 'State' : (u.category?.toLowerCase().includes('private') ? 'Private' : 'Federal')) as any,
      type: 'University',
      accreditation: 'Full'
    }));

  institutionsCache.set(cacheKey, localFallbacks);
  return localFallbacks;
}

/**
 * Resolves a university name or acronym to its official JAMB IBASS institution ID.
 */
export async function resolveIbassInstitutionId(institutionName: string): Promise<number | null> {
  if (!institutionName) return null;
  const norm = institutionName.toLowerCase().trim();

  // Known top-tier official IBASS ID map for ultra-fast lookup
  const KNOWN_IBASS_IDS: Record<string, number> = {
    'akure': 351,
    'futa': 351,
    'federal university of technology, akure': 351,
    'unilag': 405,
    'lagos': 405,
    'university of lagos': 405,
    'ibadan': 404,
    'ui': 404,
    'university of ibadan': 404,
    'oau': 398,
    'ife': 398,
    'obafemi awolowo university': 398,
    'benin': 399,
    'uniben': 399,
    'university of benin': 399,
    'ilorin': 403,
    'unilorin': 403,
    'university of ilorin': 403,
    'unn': 406,
    'nsukka': 406,
    'university of nigeria': 406,
    'abu': 394,
    'zaria': 394,
    'ahmadu bello university': 394,
    'lautech': 455,
    'delsu': 438,
    'fuoye': 868,
    'futminna': 352,
    'yabatech': 214
  };

  for (const [key, id] of Object.entries(KNOWN_IBASS_IDS)) {
    if (norm.includes(key)) return id;
  }

  // Otherwise query live
  const searchResults = await searchIbassInstitutions(institutionName, 1);
  if (searchResults.length > 0) {
    return searchResults[0].id;
  }

  return null;
}

/**
 * Fetches real-time, verified accredited programmes for an institution from JAMB IBASS.
 */
export async function getIbassProgrammesForInstitution(
  institutionIdOrName: number | string,
  courseQuery = ''
): Promise<IbassProgrammeRecord[]> {
  let instId: number | null = typeof institutionIdOrName === 'number' ? institutionIdOrName : null;
  const instNameStr = typeof institutionIdOrName === 'string' ? institutionIdOrName : '';

  if (instId === null && instNameStr) {
    instId = await resolveIbassInstitutionId(instNameStr);
  }

  const cacheKey = `progs_${instId || instNameStr}_${courseQuery.toLowerCase().trim()}`;
  if (programmesCache.has(cacheKey)) {
    return programmesCache.get(cacheKey)!;
  }

  let liveResults: IbassProgrammeRecord[] = [];

  if (instId) {
    try {
      const res = await fetch(`/api/ibass/institution/programmes/${instId}?course_search=${encodeURIComponent(courseQuery)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json?.data?.data) ? json.data.data : (Array.isArray(json?.data) ? json.data : []);
        
        liveResults = rawList.map((item: any) => ({
          id: Number(item.id),
          institutionId: Number(item.institution || instId),
          title: item.title || '',
          cleanName: formatProgrammeTitle(item.title || ''),
          department: item.department || '',
          faculty: item.department || '',
          code: item.code || '',
          utmeSubjects: item.subjects || '',
          olevelRequirements: item.utme_requirements || '',
          deRequirements: item.de_requirements || '',
          remarks: item.remarks || '',
          status: item.status || 'Approved'
        }));
      }
    } catch (err) {
      console.warn(`[JAMB IBASS Service] Live programmes fetch failed for ID ${instId}:`, err);
    }
  }

  // Merge with official ground truth courses if available (e.g. FUTA, UNILAG, UI, OAU)
  const officialLocal = instNameStr ? getOfficialInstitutionProgrammes(instNameStr) : null;
  if (officialLocal && officialLocal.length > 0) {
    const existingTitles = new Set(liveResults.map(p => p.cleanName.toLowerCase()));
    officialLocal.forEach((progName, idx) => {
      if (!existingTitles.has(progName.toLowerCase())) {
        liveResults.push({
          id: 80000 + idx,
          institutionId: instId || 0,
          title: progName.toUpperCase(),
          cleanName: progName,
          status: 'Approved'
        });
      }
    });
  }

  // Deduplicate and alphabetize
  const uniqueMap = new Map<string, IbassProgrammeRecord>();
  for (const prog of liveResults) {
    const key = prog.cleanName.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, prog);
    }
  }

  const finalSorted = Array.from(uniqueMap.values()).sort((a, b) => a.cleanName.localeCompare(b.cleanName));
  if (finalSorted.length > 0) {
    programmesCache.set(cacheKey, finalSorted);
  }

  return finalSorted;
}

/**
 * Universal Course Provider for CutoffCalculator.tsx dropdown.
 * Delivers verified, clean strings populated from official JAMB IBASS datasets.
 */
export async function getVerifiedCoursesForCalculator(institutionName: string): Promise<string[]> {
  if (!institutionName) return [];

  const cacheKey = institutionName.toLowerCase().trim();
  if (courseStringsCache.has(cacheKey)) {
    return courseStringsCache.get(cacheKey)!;
  }

  // 1. Instant check against verified curriculum ground-truths (0ms latency)
  const officialDirect = getOfficialInstitutionProgrammes(institutionName);
  if (officialDirect && officialDirect.length > 0) {
    courseStringsCache.set(cacheKey, officialDirect);
    return officialDirect;
  }

  // 2. Query JAMB IBASS API via server proxy
  const programmes = await getIbassProgrammesForInstitution(institutionName);
  if (programmes.length > 0) {
    const courses = programmes.map(p => p.cleanName);
    courseStringsCache.set(cacheKey, courses);
    return courses;
  }

  // 3. Fallback to UNIVERSITIES_DB static catalogue
  const dbMatch = UNIVERSITIES_DB[institutionName] || 
    Object.values(UNIVERSITIES_DB).find(x => x.name.toLowerCase() === institutionName.toLowerCase());
  if (dbMatch?.courses && dbMatch.courses.length > 0) {
    courseStringsCache.set(cacheKey, dbMatch.courses);
    return dbMatch.courses;
  }

  return [];
}
