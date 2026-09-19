/**
 * Federal University Lokoja (FULOKOJA)
 * Office of the Registrar - Admissions Division
 * Approved Cut-off Marks for All Programmes (2026/2027 Admissions Exercise)
 * Approved at the 45th Meeting of the Central Admissions Committee on Thursday, Sept. 17, 2026
 */

export interface FulokojaCutoffProgramme {
  sn: number;
  programme: string;
  cutoff: number;
  faculty: string;
}

export const FULOKOJA_SESSION = "2026/2027";
export const FULOKOJA_INSTITUTION_NAME = "Federal University Lokoja (FULOKOJA)";
export const FULOKOJA_APPROVAL_DATE = "Sept. 17, 2026";
export const FULOKOJA_MEETING = "45th Central Admissions Committee Meeting";

export const FULOKOJA_CUTOFFS_2026_2027: FulokojaCutoffProgramme[] = [
  // FAC. ARTS
  { sn: 1, programme: "Arabic Studies", cutoff: 40.0, faculty: "Arts" },
  { sn: 2, programme: "Archaeology", cutoff: 40.0, faculty: "Arts" },
  { sn: 3, programme: "Christian Religious Studies", cutoff: 40.0, faculty: "Arts" },
  { sn: 4, programme: "English and Literary Studies", cutoff: 40.0, faculty: "Arts" },
  { sn: 5, programme: "French", cutoff: 40.0, faculty: "Arts" },
  { sn: 6, programme: "History and Int'l Studies", cutoff: 40.0, faculty: "Arts" },
  { sn: 7, programme: "Islamic Studies", cutoff: 40.0, faculty: "Arts" },
  { sn: 8, programme: "Linguistics", cutoff: 40.0, faculty: "Arts" },
  { sn: 9, programme: "Music", cutoff: 40.0, faculty: "Arts" },
  { sn: 10, programme: "Philosophy", cutoff: 40.0, faculty: "Arts" },
  { sn: 11, programme: "Theatre Arts", cutoff: 50.0, faculty: "Arts" },

  // FAC. AGRICULTURE
  { sn: 12, programme: "Agricultural Economics", cutoff: 40.0, faculty: "Agriculture" },
  { sn: 13, programme: "Agriculture", cutoff: 40.0, faculty: "Agriculture" },
  { sn: 14, programme: "Fishery and Aquaculture", cutoff: 40.0, faculty: "Agriculture" },

  // FAC. COMMUNICATION AND MEDIA STUDIES
  { sn: 15, programme: "Broadcasting Journalism", cutoff: 40.0, faculty: "Communication and Media Studies" },
  { sn: 16, programme: "Film and Multimedia Studies", cutoff: 40.0, faculty: "Communication and Media Studies" },
  { sn: 17, programme: "Mass Communication", cutoff: 63.0, faculty: "Communication and Media Studies" },

  // FAC. COMPUTING
  { sn: 18, programme: "Artificial Intelligence", cutoff: 62.0, faculty: "Computing" },
  { sn: 19, programme: "Computer Science", cutoff: 50.0, faculty: "Computing" },
  { sn: 20, programme: "Cyber Security", cutoff: 60.0, faculty: "Computing" },
  { sn: 21, programme: "Data Science", cutoff: 50.0, faculty: "Computing" },
  { sn: 22, programme: "Software Engineering", cutoff: 50.0, faculty: "Computing" },

  // FAC. EDUCATION (ARTS BASED)
  { sn: 23, programme: "English Education", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 24, programme: "History Education", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 25, programme: "Business Education", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 26, programme: "Educational Mgt & Planning", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 27, programme: "Guidance and Counseling", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 28, programme: "Political Science Education", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 29, programme: "Economics Education", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 30, programme: "Geography Education", cutoff: 40.0, faculty: "Education (Arts Based)" },
  { sn: 31, programme: "Social Studies Education", cutoff: 40.0, faculty: "Education (Arts Based)" },

  // FAC. EDUCATION (SCIENCE BASED)
  { sn: 32, programme: "Biology Education", cutoff: 40.0, faculty: "Education (Science Based)" },
  { sn: 33, programme: "Chemistry Education", cutoff: 40.0, faculty: "Education (Science Based)" },
  { sn: 34, programme: "Computer Science Education", cutoff: 40.0, faculty: "Education (Science Based)" },
  { sn: 35, programme: "Integrated Science Education", cutoff: 40.0, faculty: "Education (Science Based)" },
  { sn: 36, programme: "Mathematics Education", cutoff: 40.0, faculty: "Education (Science Based)" },
  { sn: 37, programme: "Physics Education", cutoff: 40.0, faculty: "Education (Science Based)" },

  // FAC. ENGINEERING
  { sn: 38, programme: "Computer Engineering", cutoff: 62.0, faculty: "Engineering" },
  { sn: 39, programme: "Electrical and Electronic Engineering", cutoff: 61.0, faculty: "Engineering" },
  { sn: 40, programme: "Mechanical Engineering", cutoff: 61.0, faculty: "Engineering" },

  // FAC. ENVIRONMENTAL SCIENCES
  { sn: 41, programme: "Architecture", cutoff: 55.0, faculty: "Environmental Sciences" },
  { sn: 42, programme: "Building", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 43, programme: "Environmental Management", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 44, programme: "Geography", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 45, programme: "Urban & Regional Planning", cutoff: 40.0, faculty: "Environmental Sciences" },

  // FAC. HEALTH SCIENCES
  { sn: 46, programme: "Medical Laboratory Science", cutoff: 68.5, faculty: "Health Sciences" },
  { sn: 47, programme: "Nursing Science", cutoff: 72.0, faculty: "Health Sciences" },

  // FAC. PHARMACEUTICAL SCIENCES
  { sn: 48, programme: "Pharmacy", cutoff: 72.5, faculty: "Pharmaceutical Sciences" },

  // FAC. LAW
  { sn: 49, programme: "Law", cutoff: 73.0, faculty: "Law" },

  // FAC. LIFE SCIENCE
  { sn: 50, programme: "Biochemistry", cutoff: 60.0, faculty: "Life Science" },
  { sn: 51, programme: "Biology", cutoff: 40.0, faculty: "Life Science" },
  { sn: 52, programme: "Biotechnology", cutoff: 55.0, faculty: "Life Science" },
  { sn: 53, programme: "Botany", cutoff: 40.0, faculty: "Life Science" },
  { sn: 54, programme: "Microbiology", cutoff: 60.0, faculty: "Life Science" },
  { sn: 55, programme: "Zoology", cutoff: 40.0, faculty: "Life Science" },

  // FAC. MANAGEMENT SCIENCES
  { sn: 56, programme: "Accounting", cutoff: 60.0, faculty: "Management Sciences" },
  { sn: 57, programme: "Actuarial Science", cutoff: 45.0, faculty: "Management Sciences" },
  { sn: 58, programme: "Business Administration", cutoff: 61.0, faculty: "Management Sciences" },
  { sn: 59, programme: "Entrepreneurship Studies", cutoff: 45.0, faculty: "Management Sciences" },
  { sn: 60, programme: "Finance", cutoff: 45.0, faculty: "Management Sciences" },
  { sn: 61, programme: "Procurement Management", cutoff: 45.0, faculty: "Management Sciences" },
  { sn: 62, programme: "Public Administration", cutoff: 58.0, faculty: "Management Sciences" },

  // FAC. PHYSICAL SCIENCE
  { sn: 63, programme: "Chemistry", cutoff: 40.0, faculty: "Physical Science" },
  { sn: 64, programme: "Geology", cutoff: 40.0, faculty: "Physical Science" },
  { sn: 65, programme: "Industrial Chemistry", cutoff: 40.0, faculty: "Physical Science" },
  { sn: 66, programme: "Mathematics", cutoff: 40.0, faculty: "Physical Science" },
  { sn: 67, programme: "Physics", cutoff: 40.0, faculty: "Physical Science" },
  { sn: 68, programme: "Statistics", cutoff: 40.0, faculty: "Physical Science" },

  // FAC. SOCIAL SCIENCES
  { sn: 69, programme: "Criminology and Security Studies", cutoff: 45.0, faculty: "Social Sciences" },
  { sn: 70, programme: "Economics", cutoff: 55.0, faculty: "Social Sciences" },
  { sn: 71, programme: "Library and Information Science", cutoff: 45.0, faculty: "Social Sciences" },
  { sn: 72, programme: "Political Science", cutoff: 60.0, faculty: "Social Sciences" },
  { sn: 73, programme: "Psychology", cutoff: 45.0, faculty: "Social Sciences" },
  { sn: 74, programme: "Social Works", cutoff: 40.0, faculty: "Social Sciences" },
  { sn: 75, programme: "Sociology", cutoff: 50.0, faculty: "Social Sciences" }
];

export const getFulokojaFaculties = (): string[] => {
  const faculties = new Set(FULOKOJA_CUTOFFS_2026_2027.map(item => item.faculty));
  return Array.from(faculties);
};

export const getFulokojaCutoffByCourse = (courseName: string): FulokojaCutoffProgramme | null => {
  if (!courseName) return null;
  const query = courseName.toLowerCase().trim();
  
  // Direct exact match
  const exact = FULOKOJA_CUTOFFS_2026_2027.find(item => item.programme.toLowerCase() === query);
  if (exact) return exact;

  // Normalized keywords match
  const match = FULOKOJA_CUTOFFS_2026_2027.find(item => {
    const cleanProg = item.programme.toLowerCase();
    return cleanProg.includes(query) || query.includes(cleanProg);
  });
  if (match) return match;

  // Specific alias mappings
  if (query.includes('nursing')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Nursing Science") || null;
  if (query.includes('pharmacy')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Pharmacy") || null;
  if (query.includes('med lab') || query.includes('medical laboratory')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Medical Laboratory Science") || null;
  if (query.includes('computer sci')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Computer Science") || null;
  if (query.includes('cyber')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Cyber Security") || null;
  if (query.includes('software')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Software Engineering") || null;
  if (query.includes('ai') || query.includes('artificial intelligence')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Artificial Intelligence") || null;
  if (query.includes('law')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Law") || null;
  if (query.includes('mass com') || query.includes('mass communication')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Mass Communication") || null;
  if (query.includes('account')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Accounting") || null;
  if (query.includes('business admin')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Business Administration") || null;
  if (query.includes('electrical')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Electrical and Electronic Engineering") || null;
  if (query.includes('mechanical')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Mechanical Engineering") || null;
  if (query.includes('computer eng')) return FULOKOJA_CUTOFFS_2026_2027.find(i => i.programme === "Computer Engineering") || null;

  return null;
};
