export interface IbassInstitution {
  id: number;
  name?: string;
  institution_name?: string;
  code?: string;
  type?: string;
  category?: string;
  state?: string;
  address?: string;
}

export interface IbassProgramme {
  id: number;
  institution_id: number;
  course_code?: string;
  course_name?: string;
  utme_subjects?: string;
  olevel_requirements?: string;
  direct_entry_requirements?: string;
  remarks?: string;
  faculty?: string;
  degree_type?: string;
}

export interface IbassPaginatedResponse<T> {
  status?: boolean;
  data?: {
    current_page?: number;
    last_page?: number;
    total?: number;
    per_page?: number;
    data?: T[];
  } | T[];
}

/**
 * Fetch list of institutions live from official JAMB IBASS API via server proxy
 */
export async function fetchIbassInstitutions(options?: {
  page?: number;
  search?: string;
  type?: string | null;
  category?: string | null;
}): Promise<{ items: IbassInstitution[]; lastPage: number; currentPage: number }> {
  try {
    const page = options?.page || 1;
    const res = await fetch(`/api/ibass/institutions?page=${page}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inst_type: options?.type || null,
        inst_category: options?.category || null,
        inst_search: options?.search || ''
      })
    });

    if (!res.ok) {
      throw new Error(`IBASS proxy error: ${res.statusText}`);
    }

    const resData: IbassPaginatedResponse<IbassInstitution> = await res.json();
    let items: IbassInstitution[] = [];
    let lastPage = 1;
    let currentPage = page;

    if (resData.data && !Array.isArray(resData.data)) {
      items = resData.data.data || [];
      lastPage = resData.data.last_page || 1;
      currentPage = resData.data.current_page || page;
    } else if (Array.isArray(resData.data)) {
      items = resData.data;
    }

    return { items, lastPage, currentPage };
  } catch (err: any) {
    console.error('Failed to fetch IBASS institutions:', err);
    return { items: [], lastPage: 1, currentPage: 1 };
  }
}

/**
 * Fetch programmes & requirement details for an institution live from official JAMB IBASS API via server proxy
 */
export async function fetchIbassProgrammes(
  institutionId: number | string,
  options?: { page?: number; search?: string }
): Promise<{ items: IbassProgramme[]; lastPage: number; currentPage: number }> {
  try {
    const page = options?.page || 1;
    const res = await fetch(`/api/ibass/institution/programmes/${institutionId}?page=${page}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_search: options?.search || ''
      })
    });

    if (!res.ok) {
      throw new Error(`IBASS programmes proxy error: ${res.statusText}`);
    }

    const resData: IbassPaginatedResponse<IbassProgramme> = await res.json();
    let items: IbassProgramme[] = [];
    let lastPage = 1;
    let currentPage = page;

    if (resData.data && !Array.isArray(resData.data)) {
      items = resData.data.data || [];
      lastPage = resData.data.last_page || 1;
      currentPage = resData.data.current_page || page;
    } else if (Array.isArray(resData.data)) {
      items = resData.data;
    }

    return { items, lastPage, currentPage };
  } catch (err: any) {
    console.error(`Failed to fetch IBASS programmes for institution ${institutionId}:`, err);
    return { items: [], lastPage: 1, currentPage: 1 };
  }
}

export interface ParsedRequirements {
  utmeMandatory: string[];
  utmeOptions: string[];
  utmeOptionsRequired: number;
  olevelMandatory: string[];
  olevelMinCredits: number;
}

export interface CandidateInput {
  utmeSubjects: string[]; // List of 4 UTME subjects
  olevelCredits: string[]; // List of O'Level subjects passed with C6 or better
}

export interface EvaluationResult {
  isEligible: boolean;
  checks: {
    utmeValid: boolean;
    olevelValid: boolean;
    missingUtmeMandatory: string[];
    missingOlevelMandatory: string[];
    utmeOptionsMet: boolean;
  };
}

/**
 * Parses raw IBASS requirement text strings into structured constraints
 */
export function parseUtmeRequirements(utmeText: string, olevelText?: string): ParsedRequirements {
  const text = (utmeText || '').toLowerCase();
  const otext = (olevelText || '').toLowerCase();

  // Standard JAMB UTME subject dictionary
  const knownSubjects = [
    'mathematics', 'physics', 'chemistry', 'biology', 'agricultural science',
    'economics', 'geography', 'government', 'literature in english', 'crs', 'christian religious studies',
    'irs', 'islamic religious studies', 'commerce', 'accounting', 'financial accounting',
    'history', 'french', 'hausa', 'igbo', 'yoruba', 'computer studies', 'further mathematics'
  ];

  const utmeMandatory: string[] = ['English Language'];
  
  knownSubjects.forEach(sub => {
    // Check if explicitly required as mandatory
    if (text.includes(sub) && !text.includes(`any one of`) && !text.includes(`any two of`) && !text.includes(`or ` + sub)) {
      const formattedName = sub.charAt(0).toUpperCase() + sub.slice(1);
      if (!utmeMandatory.some(m => m.toLowerCase() === sub)) {
        utmeMandatory.push(formattedName);
      }
    }
  });

  const utmeOptions: string[] = [];
  knownSubjects.forEach(sub => {
    if (text.includes(sub) && !utmeMandatory.some(m => m.toLowerCase() === sub)) {
      const formattedName = sub.charAt(0).toUpperCase() + sub.slice(1);
      utmeOptions.push(formattedName);
    }
  });

  const olevelMandatory: string[] = ['English Language', 'Mathematics'];
  if (otext.includes('physics')) olevelMandatory.push('Physics');
  if (otext.includes('chemistry')) olevelMandatory.push('Chemistry');

  return {
    utmeMandatory,
    utmeOptions,
    utmeOptionsRequired: text.includes('any two') ? 2 : text.includes('any three') ? 3 : 1,
    olevelMandatory,
    olevelMinCredits: otext.includes('five') || otext.includes('5') ? 5 : 5
  };
}

/**
 * Evaluates a candidate's UTME and O'Level choices against parsed IBASS requirements
 */
export function evaluateEligibility(candidate: CandidateInput, rules: ParsedRequirements): EvaluationResult {
  const candUtmeNorm = candidate.utmeSubjects.map(s => s.toLowerCase());
  const candOlevelNorm = candidate.olevelCredits.map(s => s.toLowerCase());

  const missingUtmeMandatory = rules.utmeMandatory.filter(
    sub => !candUtmeNorm.includes(sub.toLowerCase())
  );

  const matchedUtmeOptions = rules.utmeOptions.filter(
    sub => candUtmeNorm.includes(sub.toLowerCase())
  );

  const utmeOptionsMet = rules.utmeOptions.length === 0 || matchedUtmeOptions.length >= rules.utmeOptionsRequired;
  const utmeValid = missingUtmeMandatory.length === 0 && utmeOptionsMet;

  const missingOlevelMandatory = rules.olevelMandatory.filter(
    sub => !candOlevelNorm.includes(sub.toLowerCase())
  );

  const olevelValid = missingOlevelMandatory.length === 0 && candOlevelNorm.length >= rules.olevelMinCredits;

  return {
    isEligible: utmeValid && olevelValid,
    checks: {
      utmeValid,
      olevelValid,
      missingUtmeMandatory,
      missingOlevelMandatory,
      utmeOptionsMet
    }
  };
}

