export interface UnilagApplicationType {
  applicationTypeID?: string;
  applicationTypeName?: string;
  applicationInstructionsHTML?: string;
  applicationSession?: string;
  transferAllowed?: boolean;
}

export interface UnilagProgramme {
  programmeName: string;
  programmeID: string;
  qualification?: string | null;
  department?: string;
  faculty?: string;
}

export interface UnilagRequirement {
  programmeID?: string;
  programmeName?: string;
  utmeSubjects?: string;
  olevelRequirements?: string;
  directEntryRequirements?: string;
  specialConsiderations?: string;
  remarks?: string;
}

export interface UnilagApiResponse<T> {
  httpStatusCode: number;
  responseMessage: string;
  hasError: boolean;
  data: T;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

/**
 * Fetch list of official UNILAG application categories (Undergraduate, DLI, ICE, JUPEB, ULBS, etc.)
 */
export async function fetchUnilagApplicationTypes(): Promise<UnilagApplicationType[]> {
  const cacheKey = 'unilag:app_types';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch('/api/unilag/application-types');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json: UnilagApiResponse<UnilagApplicationType[]> = await res.json();
    if (json.hasError || !Array.isArray(json.data)) {
      throw new Error(json.responseMessage || 'Invalid response');
    }
    cache.set(cacheKey, { data: json.data, timestamp: Date.now() });
    return json.data;
  } catch (err) {
    console.warn('[UNILAG Service] Falling back to default application types:', err);
    return [
      { applicationTypeID: 'Undergraduate', applicationTypeName: 'Undergraduate (UTME / Direct Entry)' },
      { applicationTypeID: 'DLI', applicationTypeName: 'Distance Learning Institute (DLI)' },
      { applicationTypeID: 'ICE', applicationTypeName: 'Institute of Continuing Education (ICE Part-Time)' },
      { applicationTypeID: 'JUPEB SC', applicationTypeName: 'JUPEB / Foundation Programme' },
      { applicationTypeID: 'ULBS', applicationTypeName: 'University of Lagos Business School (ULBS)' },
      { applicationTypeID: 'INTER-UNI. TRANSFER', applicationTypeName: 'Inter-University Transfer' },
      { applicationTypeID: 'Postgraduate (MPhil/PhD)', applicationTypeName: 'School of Postgraduate Studies (SPGS)' }
    ];
  }
}

/**
 * Fetch official list of programmes for a specific application category (e.g. Undergraduate, DLI, ICE)
 */
export async function fetchUnilagProgrammes(applicationTypeId: string = 'Undergraduate'): Promise<UnilagProgramme[]> {
  const cacheKey = `unilag:programmes:${applicationTypeId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`/api/unilag/programmes?applicationTypeId=${encodeURIComponent(applicationTypeId)}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json: UnilagApiResponse<UnilagProgramme[]> = await res.json();
    if (json.hasError || !Array.isArray(json.data)) {
      throw new Error(json.responseMessage || 'Invalid response');
    }
    cache.set(cacheKey, { data: json.data, timestamp: Date.now() });
    return json.data;
  } catch (err) {
    console.error(`[UNILAG Service] Failed to fetch programmes for ${applicationTypeId}:`, err);
    return [];
  }
}

/**
 * Fetch specific admission entry requirements for a UNILAG programme
 */
export async function fetchUnilagRequirements(programmeId: string, applicationTypeId?: string): Promise<UnilagRequirement | null> {
  const cacheKey = `unilag:req:${programmeId}:${applicationTypeId || ''}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `/api/unilag/requirements?programmeId=${encodeURIComponent(programmeId)}${applicationTypeId ? `&applicationTypeId=${encodeURIComponent(applicationTypeId)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json: UnilagApiResponse<UnilagRequirement | UnilagRequirement[]> = await res.json();
    if (json.hasError || !json.data) {
      throw new Error(json.responseMessage || 'Invalid response');
    }
    const result = Array.isArray(json.data) ? json.data[0] : json.data;
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error(`[UNILAG Service] Failed to fetch requirement for ${programmeId}:`, err);
    return null;
  }
}
