/**
 * Delta State University, Abraka (DELSU)
 * Directorate of Ceremonials, Information and Public Relations, Vice Chancellor's Office
 * Approved Departmental Cut-off Marks for Programmes (2026/2027 Admissions Exercise)
 * Official Release Bulletin (portal.delsuces.online)
 */

export interface DelsuCutoffProgramme {
  sn: number;
  programme: string;
  cutoff: number;
  faculty: string;
}

export const DELSU_SESSION = "2026/2027";
export const DELSU_INSTITUTION_NAME = "Delta State University, Abraka (DELSU)";
export const DELSU_ISSUING_BODY = "Public Relations Unit of Directorate of Ceremonials, Information and Public Relations, Vice Chancellor's Office";
export const DELSU_PORTAL_URL = "https://portal.delsuces.online";

export const DELSU_CUTOFFS_2026_2027: DelsuCutoffProgramme[] = [
  // 8. FACULTY OF ENGINEERING
  { sn: 1, programme: "Chemical Engineering", cutoff: 45.0, faculty: "Engineering" },
  { sn: 2, programme: "Civil Engineering", cutoff: 52.9, faculty: "Engineering" },
  { sn: 3, programme: "Electrical/Electronic Engineering", cutoff: 50.5, faculty: "Engineering" },
  { sn: 4, programme: "Mechanical Engineering", cutoff: 52.5, faculty: "Engineering" },
  { sn: 5, programme: "Petroleum Engineering", cutoff: 51.5, faculty: "Engineering" },

  // 9. FACULTY OF ENVIRONMENTAL SCIENCES
  { sn: 6, programme: "Architecture", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 7, programme: "Building", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 8, programme: "Estate Management", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 9, programme: "Quantity Survey", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 10, programme: "Survey and Geo Informatics", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 11, programme: "Urban and Regional Planning", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 12, programme: "Environmental Management", cutoff: 40.0, faculty: "Environmental Sciences" },
  { sn: 13, programme: "Geography and Environmental Sustainability", cutoff: 40.0, faculty: "Environmental Sciences" },

  // 10. FACULTY OF MANAGEMENT SCIENCES
  { sn: 14, programme: "Accounting", cutoff: 56.7, faculty: "Management Sciences" },
  { sn: 15, programme: "Banking and Finance", cutoff: 48.5, faculty: "Management Sciences" },
  { sn: 16, programme: "Business Administration", cutoff: 55.1, faculty: "Management Sciences" },
  { sn: 17, programme: "Marketing", cutoff: 45.0, faculty: "Management Sciences" },
  { sn: 18, programme: "Public Administration", cutoff: 52.0, faculty: "Management Sciences" },
  { sn: 19, programme: "Entrepreneurship", cutoff: 40.0, faculty: "Management Sciences" },
  { sn: 20, programme: "Office and Information Management", cutoff: 40.0, faculty: "Management Sciences" },

  // 11. FACULTY OF SCIENCE
  { sn: 21, programme: "Animal & Environmental Biology (Zoology)", cutoff: 40.0, faculty: "Science" },
  { sn: 22, programme: "Biochemistry", cutoff: 48.2, faculty: "Science" },
  { sn: 23, programme: "Botany", cutoff: 40.0, faculty: "Science" },
  { sn: 24, programme: "Biotechnology", cutoff: 40.0, faculty: "Science" },
  { sn: 25, programme: "Chemistry", cutoff: 40.0, faculty: "Science" },
  { sn: 26, programme: "Geology", cutoff: 40.0, faculty: "Science" },
  { sn: 27, programme: "Industrial Chemistry", cutoff: 40.0, faculty: "Science" },
  { sn: 28, programme: "Industrial Mathematics", cutoff: 40.0, faculty: "Science" },
  { sn: 29, programme: "Mathematics", cutoff: 40.0, faculty: "Science" },
  { sn: 30, programme: "Microbiology", cutoff: 50.0, faculty: "Science" },
  { sn: 31, programme: "Physics", cutoff: 40.0, faculty: "Science" },
  { sn: 32, programme: "Environmental Science and Toxicology", cutoff: 40.0, faculty: "Science" },
  // Science Laboratory Technology (SLT)
  { sn: 33, programme: "S. L. T. (Biochemistry Tech)", cutoff: 40.0, faculty: "Science" },
  { sn: 34, programme: "S. L. T. (Biological Tech)", cutoff: 40.0, faculty: "Science" },
  { sn: 35, programme: "S. L. T. (Chemistry Tech)", cutoff: 40.0, faculty: "Science" },
  { sn: 36, programme: "S. L. T. (Physics & Electronic Tech)", cutoff: 40.0, faculty: "Science" },

  // 12. FACULTY OF THE SOCIAL SCIENCES
  { sn: 37, programme: "Criminology and Security studies", cutoff: 40.0, faculty: "Social Sciences" },
  { sn: 38, programme: "Economics", cutoff: 45.0, faculty: "Social Sciences" },
  { sn: 39, programme: "Library and Information Science", cutoff: 40.0, faculty: "Social Sciences" },
  { sn: 40, programme: "Political Science", cutoff: 50.0, faculty: "Social Sciences" },
  { sn: 41, programme: "Psychology", cutoff: 40.0, faculty: "Social Sciences" },
  { sn: 42, programme: "Social work", cutoff: 40.0, faculty: "Social Sciences" },
  { sn: 43, programme: "Sociology", cutoff: 40.0, faculty: "Social Sciences" }
];

export const getDelsuFaculties = (): string[] => {
  const faculties = new Set(DELSU_CUTOFFS_2026_2027.map(item => item.faculty));
  return Array.from(faculties);
};

export const getDelsuCutoffByCourse = (courseName: string): DelsuCutoffProgramme | null => {
  if (!courseName) return null;
  const query = courseName.toLowerCase().trim();

  // Direct exact match
  const exact = DELSU_CUTOFFS_2026_2027.find(item => item.programme.toLowerCase() === query);
  if (exact) return exact;

  // Normalized search
  const match = DELSU_CUTOFFS_2026_2027.find(item => {
    const cleanProg = item.programme.toLowerCase();
    return cleanProg.includes(query) || query.includes(cleanProg);
  });
  if (match) return match;

  // Aliases
  if (query.includes('civil')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Civil Engineering") || null;
  if (query.includes('mechanical')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Mechanical Engineering") || null;
  if (query.includes('chemical eng')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Chemical Engineering") || null;
  if (query.includes('electrical') || query.includes('electronic')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Electrical/Electronic Engineering") || null;
  if (query.includes('petroleum')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Petroleum Engineering") || null;
  if (query.includes('account')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Accounting") || null;
  if (query.includes('business admin')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Business Administration") || null;
  if (query.includes('banking')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Banking and Finance") || null;
  if (query.includes('public admin')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Public Administration") || null;
  if (query.includes('marketing')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Marketing") || null;
  if (query.includes('biochem')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Biochemistry") || null;
  if (query.includes('microbio')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Microbiology") || null;
  if (query.includes('political sci')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Political Science") || null;
  if (query.includes('economics')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Economics") || null;
  if (query.includes('criminology')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Criminology and Security studies") || null;
  if (query.includes('slt') || query.includes('science lab')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme.startsWith("S. L. T.")) || null;
  if (query.includes('architecture')) return DELSU_CUTOFFS_2026_2027.find(i => i.programme === "Architecture") || null;

  return null;
};
