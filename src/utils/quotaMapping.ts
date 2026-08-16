/**
 * Official Federal and State University Catchment Area Mappings
 * & JAMB 23 Educationally Less Developed States (ELDS) Standard
 */

export const ALL_NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja"
];

/**
 * The 23 Official JAMB Educationally Less Developed States (ELDS)
 * Federal universities allocate up to 20% of admission slots under ELDS policy.
 */
export const OFFICIAL_ELDS_STATES = [
  "Adamawa", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Ebonyi", "Gombe",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Niger",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

/**
 * Institutional Catchment State Mapping for Nigerian Universities
 */
export const INSTITUTION_CATCHMENT_MAP: Record<string, string[]> = {
  // South-West Federal Universities
  "ui": ["Oyo", "Osun", "Ogun", "Ondo", "Ekiti", "Lagos"],
  "university of ibadan": ["Oyo", "Osun", "Ogun", "Ondo", "Ekiti", "Lagos"],
  "unilag": ["Lagos", "Ogun", "Osun", "Oyo", "Ondo", "Ekiti"],
  "university of lagos": ["Lagos", "Ogun", "Osun", "Oyo", "Ondo", "Ekiti"],
  "oau": ["Osun", "Oyo", "Ogun", "Ondo", "Ekiti", "Lagos"],
  "obafemi awolowo university": ["Osun", "Oyo", "Ogun", "Ondo", "Ekiti", "Lagos"],
  "futa": ["Ondo", "Ekiti", "Oyo", "Osun", "Ogun", "Lagos"],
  "federal university of technology akure": ["Ondo", "Ekiti", "Oyo", "Osun", "Ogun", "Lagos"],
  "funaab": ["Ogun", "Lagos", "Oyo", "Osun", "Ondo", "Ekiti"],
  "federal university of agriculture abeokuta": ["Ogun", "Lagos", "Oyo", "Osun", "Ondo", "Ekiti"],
  "fuoye": ["Ekiti", "Ondo", "Osun", "Oyo", "Ogun", "Lagos"],
  "federal university oye ekiti": ["Ekiti", "Ondo", "Osun", "Oyo", "Ogun", "Lagos"],

  // South-East Federal Universities
  "unn": ["Enugu", "Anambra", "Imo", "Abia", "Ebonyi"],
  "university of nigeria nsukka": ["Enugu", "Anambra", "Imo", "Abia", "Ebonyi"],
  "futo": ["Imo", "Abia", "Anambra", "Enugu", "Ebonyi"],
  "federal university of technology owerri": ["Imo", "Abia", "Anambra", "Enugu", "Ebonyi"],
  "funai": ["Ebonyi", "Abia", "Anambra", "Enugu", "Imo"],
  "ae-funai": ["Ebonyi", "Abia", "Anambra", "Enugu", "Imo"],
  "alex ekwueme federal university": ["Ebonyi", "Abia", "Anambra", "Enugu", "Imo"],

  // South-South Federal Universities
  "uniben": ["Edo", "Delta", "Bayelsa", "Rivers", "Cross River", "Akwa Ibom"],
  "university of benin": ["Edo", "Delta", "Bayelsa", "Rivers", "Cross River", "Akwa Ibom"],
  "uniport": ["Rivers", "Bayelsa", "Delta", "Akwa Ibom", "Cross River", "Edo"],
  "university of port harcourt": ["Rivers", "Bayelsa", "Delta", "Akwa Ibom", "Cross River", "Edo"],
  "unical": ["Cross River", "Akwa Ibom", "Rivers", "Bayelsa", "Delta", "Edo"],
  "university of calabar": ["Cross River", "Akwa Ibom", "Rivers", "Bayelsa", "Delta", "Edo"],
  "fupre": ["Delta", "Edo", "Rivers", "Bayelsa", "Akwa Ibom", "Cross River"],
  "federal university of petroleum resources effurun": ["Delta", "Edo", "Rivers", "Bayelsa", "Akwa Ibom", "Cross River"],
  "uniuyo": ["Akwa Ibom", "Cross River", "Rivers", "Bayelsa", "Abia", "Imo"],
  "university of uyo": ["Akwa Ibom", "Cross River", "Rivers", "Bayelsa", "Abia", "Imo"],

  // North-Central Federal Universities
  "unilorin": [
    "Kwara", "Kogi", "Benue", "Niger", "Plateau", "Nasarawa", "Osun", "Oyo", "Ondo", "Ekiti", 
    "Lagos", "Ogun", "Kebbi", "Sokoto", "Zamfara", "Kaduna", "Kano", "Katsina", "Bauchi", 
    "Gombe", "Taraba", "Borno", "Yobe", "Adamawa", "FCT Abuja"
  ],
  "university of ilorin": [
    "Kwara", "Kogi", "Benue", "Niger", "Plateau", "Nasarawa", "Osun", "Oyo", "Ondo", "Ekiti", 
    "Lagos", "Ogun", "Kebbi", "Sokoto", "Zamfara", "Kaduna", "Kano", "Katsina", "Bauchi", 
    "Gombe", "Taraba", "Borno", "Yobe", "Adamawa", "FCT Abuja"
  ],
  "futminna": ["Niger", "Benue", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Plateau", "Sokoto", "Zamfara", "FCT Abuja"],
  "federal university of technology minna": ["Niger", "Benue", "Kebbi", "Kogi", "Kwara", "Nasarawa", "Plateau", "Sokoto", "Zamfara", "FCT Abuja"],
  "unijos": ["Plateau", "Benue", "Nasarawa", "Bauchi", "Gombe", "Taraba", "Kaduna", "Niger", "Kogi"],
  "university of jos": ["Plateau", "Benue", "Nasarawa", "Bauchi", "Gombe", "Taraba", "Kaduna", "Niger", "Kogi"],
  "uniabuja": ["FCT Abuja", "Niger", "Nasarawa", "Kogi", "Plateau", "Benue", "Kaduna"],
  "university of abuja": ["FCT Abuja", "Niger", "Nasarawa", "Kogi", "Plateau", "Benue", "Kaduna"],

  // North-West Federal Universities
  "abu": [
    "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara", "Niger", "Plateau", 
    "Benue", "Kogi", "Nasarawa", "Bauchi", "Gombe", "Adamawa", "Borno", "Taraba", "Yobe", "FCT Abuja"
  ],
  "ahmadu bello university": [
    "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara", "Niger", "Plateau", 
    "Benue", "Kogi", "Nasarawa", "Bauchi", "Gombe", "Adamawa", "Borno", "Taraba", "Yobe", "FCT Abuja"
  ],
  "buk": ["Kano", "Jigawa", "Kaduna", "Katsina", "Kebbi", "Sokoto", "Zamfara", "Bauchi", "Yobe", "Borno"],
  "bayero university kano": ["Kano", "Jigawa", "Kaduna", "Katsina", "Kebbi", "Sokoto", "Zamfara", "Bauchi", "Yobe", "Borno"],
  "udusok": ["Sokoto", "Kebbi", "Zamfara", "Katsina", "Kano", "Jigawa"],
  "usmanu danfodiyo university": ["Sokoto", "Kebbi", "Zamfara", "Katsina", "Kano", "Jigawa"],

  // North-East Federal Universities
  "unimaid": ["Borno", "Yobe", "Adamawa", "Bauchi", "Gombe", "Taraba"],
  "university of maiduguri": ["Borno", "Yobe", "Adamawa", "Bauchi", "Gombe", "Taraba"],
  "atbu": ["Bauchi", "Gombe", "Adamawa", "Taraba", "Borno", "Yobe", "Plateau"],
  "abubakar tafawa balewa university": ["Bauchi", "Gombe", "Adamawa", "Taraba", "Borno", "Yobe", "Plateau"],
  "mautech": ["Adamawa", "Taraba", "Borno", "Yobe", "Gombe", "Bauchi"],
  "modibbo adama university": ["Adamawa", "Taraba", "Borno", "Yobe", "Gombe", "Bauchi"],

  // Major State Universities (State indigenous quota)
  "lasu": ["Lagos"],
  "lagos state university": ["Lagos"],
  "delsu": ["Delta"],
  "delta state university": ["Delta"],
  "oou": ["Ogun"],
  "olabisi onabanjo university": ["Ogun"],
  "aaua": ["Ondo"],
  "adekunle ajasin university": ["Ondo"],
  "eksu": ["Ekiti"],
  "ekiti state university": ["Ekiti"],
  "uniosun": ["Osun"],
  "osun state university": ["Osun"],
  "aau": ["Edo"],
  "ambrose alli university": ["Edo"],
  "ksu": ["Kogi"],
  "prince abubakar audu university": ["Kogi"],
  "kogi state university": ["Kogi"]
};

/**
 * Checks if a candidate's state of origin is an ELDS state
 */
export function isStateELDS(stateOfOrigin?: string): boolean {
  if (!stateOfOrigin) return false;
  return OFFICIAL_ELDS_STATES.includes(stateOfOrigin.trim());
}

/**
 * Retrieves the official catchment states for a given university
 */
export function getInstitutionCatchmentStates(institutionNameOrSlug?: string): string[] {
  if (!institutionNameOrSlug) return [];
  const clean = institutionNameOrSlug.toLowerCase().trim();

  // 1. Direct key match
  if (INSTITUTION_CATCHMENT_MAP[clean]) {
    return INSTITUTION_CATCHMENT_MAP[clean];
  }

  // 2. Substring search in map keys
  for (const [key, states] of Object.entries(INSTITUTION_CATCHMENT_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return states;
    }
  }

  // 3. Fallback geographic heuristic for SW federal
  if (clean.includes("ibadan") || clean.includes("akure") || clean.includes("futa") || clean.includes("oau") || clean.includes("funaab") || clean.includes("oye-ekiti")) {
    return ["Lagos", "Ogun", "Osun", "Oyo", "Ondo", "Ekiti"];
  }

  return [];
}

/**
 * Checks if a candidate's state of origin qualifies for the institution's Catchment Pool
 */
export function isStateInCatchment(institutionNameOrSlug?: string, stateOfOrigin?: string): boolean {
  if (!institutionNameOrSlug || !stateOfOrigin) return false;
  const catchmentStates = getInstitutionCatchmentStates(institutionNameOrSlug);
  return catchmentStates.includes(stateOfOrigin.trim());
}

export interface QuotaEvaluation {
  quotaType: 'merit' | 'catchment' | 'elds';
  quotaLabel: string;
  quotaDescription: string;
  isCatchment: boolean;
  isELDS: boolean;
  statutoryShare: string; // e.g. "45% Merit", "35% Catchment", "20% ELDS"
}

/**
 * Evaluates the candidate's statutory quota for a given university and state of origin
 */
export function evaluateCandidateQuota(institutionNameOrSlug?: string, stateOfOrigin?: string): QuotaEvaluation {
  const isELDS = isStateELDS(stateOfOrigin);
  const isCatchment = isStateInCatchment(institutionNameOrSlug, stateOfOrigin);

  if (isELDS) {
    return {
      quotaType: 'elds',
      quotaLabel: `ELDS Quota (${stateOfOrigin || 'State'})`,
      quotaDescription: `As an indigene of ${stateOfOrigin}, you qualify for the federal 20% Educationally Less Developed States (ELDS) concessionary quota pool.`,
      isCatchment,
      isELDS: true,
      statutoryShare: '20% ELDS Quota'
    };
  }

  if (isCatchment) {
    return {
      quotaType: 'catchment',
      quotaLabel: `Catchment Quota (${stateOfOrigin || 'State'})`,
      quotaDescription: `As a resident/indigene of ${stateOfOrigin}, you fall within the official catchment area for this institution (competing in the 35% localized catchment pool).`,
      isCatchment: true,
      isELDS: false,
      statutoryShare: '35% Catchment Pool'
    };
  }

  return {
    quotaType: 'merit',
    quotaLabel: 'National Merit Quota',
    quotaDescription: `Competing under the open 45% National Merit Quota, applicable to all qualified candidates nationwide without geographic concessions.`,
    isCatchment: false,
    isELDS: false,
    statutoryShare: '45% Open Merit'
  };
}
