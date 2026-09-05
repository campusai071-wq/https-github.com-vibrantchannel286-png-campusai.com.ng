/**
 * Federal University of Technology, Minna (FUTMINNA)
 * 2026/2027 University Pre-Admission Screening Exercise (UPASE)
 * Official Departmental Cut-Off Marks & Registration Guidelines
 */

export interface FUTMINNACutoffProgramme {
  sn: number;
  programme: string;
  cutoff: number;
  school: string;
  faculty: string;
  isNew?: boolean;
}

export const FUTMINNA_SESSION = "2026/2027";
export const FUTMINNA_INSTITUTION_NAME = "Federal University of Technology, Minna (FUTMINNA)";
export const FUTMINNA_UPASE_INFO = {
  exerciseName: "2026/2027 University Pre-Admission Screening Exercise (UPASE)",
  openingDate: "15th June, 2026",
  closingDate: "6th September, 2026 (11:59 PM)",
  portalUrl: "https://eportal.futminna.edu.ng/ePortal_V2/utme/",
  minCutoff: 150,
  maxCutoff: 250,
  status: "OPEN",
  registrationFee: 2000
};

export const FUTMINNA_CUTOFFS_2026_2027: FUTMINNACutoffProgramme[] = [
  // ── School of Agriculture and Agricultural Technology (SAAT) ──
  { sn: 1, programme: "Crop Production", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 2, programme: "Forestry and Wildlife Technology", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 3, programme: "Horticulture", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 4, programme: "Soil Science and Land Management", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 7, programme: "Agricultural Economics and Farm Management", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 8, programme: "Agricultural Extension and Rural Development", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 9, programme: "Agribusiness", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 26, programme: "Animal Production", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 27, programme: "Food Science Technology", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },
  { sn: 29, programme: "Water Resources Aquaculture and Fisheries Technology", cutoff: 150, school: "SAAT", faculty: "Agriculture & Agricultural Technology" },

  // ── School of Engineering and Engineering Technology (SEET) ──
  { sn: 17, programme: "Computer Engineering", cutoff: 200, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 18, programme: "Electrical/Electronics Engineering", cutoff: 180, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 19, programme: "Mechatronics Engineering", cutoff: 200, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 20, programme: "Telecommunication Engineering", cutoff: 170, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 36, programme: "Mining Engineering", cutoff: 170, school: "SEET", faculty: "Engineering & Engineering Technology", isNew: true },
  { sn: 37, programme: "Nuclear Engineering", cutoff: 180, school: "SEET", faculty: "Engineering & Engineering Technology", isNew: true },
  { sn: 39, programme: "Agric. and Bioresources Engineering", cutoff: 160, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 40, programme: "Chemical Engineering", cutoff: 170, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 41, programme: "Civil Engineering", cutoff: 200, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 42, programme: "Food Engineering", cutoff: 160, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 43, programme: "Mechanical Engineering", cutoff: 180, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 44, programme: "Material and Metallurgical Engineering", cutoff: 170, school: "SEET", faculty: "Engineering & Engineering Technology" },
  { sn: 45, programme: "Petroleum and Gas Engineering", cutoff: 170, school: "SEET", faculty: "Engineering & Engineering Technology" },

  // ── School of Environmental Technology (SET) ──
  { sn: 10, programme: "Architecture", cutoff: 200, school: "SET", faculty: "Environmental Technology" },
  { sn: 11, programme: "Furniture Design Architecture", cutoff: 180, school: "SET", faculty: "Environmental Technology" },
  { sn: 12, programme: "Interior Architecture and Design", cutoff: 180, school: "SET", faculty: "Environmental Technology" },
  { sn: 13, programme: "Landscape Architecture", cutoff: 180, school: "SET", faculty: "Environmental Technology" },
  { sn: 21, programme: "Building Technology", cutoff: 170, school: "SET", faculty: "Environmental Technology" },
  { sn: 22, programme: "Estate Management & Valuation", cutoff: 150, school: "SET", faculty: "Environmental Technology" },
  { sn: 23, programme: "Quantity Surveying", cutoff: 160, school: "SET", faculty: "Environmental Technology" },
  { sn: 24, programme: "Survey and Geoinformatics", cutoff: 160, school: "SET", faculty: "Environmental Technology" },
  { sn: 25, programme: "Urban and Regional Planning", cutoff: 150, school: "SET", faculty: "Environmental Technology" },
  { sn: 38, programme: "Water, Sanitation and Hygiene", cutoff: 170, school: "SET", faculty: "Environmental Technology", isNew: true },

  // ── School of Information and Communication Technology (SICT) ──
  { sn: 30, programme: "Computer Science", cutoff: 200, school: "SICT", faculty: "Information & Communication Technology" },
  { sn: 31, programme: "Cyber Security Science", cutoff: 200, school: "SICT", faculty: "Information & Communication Technology" },
  { sn: 32, programme: "Data Science", cutoff: 170, school: "SICT", faculty: "Information & Communication Technology" },
  { sn: 33, programme: "Information Technology", cutoff: 170, school: "SICT", faculty: "Information & Communication Technology" },
  { sn: 34, programme: "Information Science & Media Studies", cutoff: 150, school: "SICT", faculty: "Information & Communication Technology" },
  { sn: 35, programme: "Software Engineering", cutoff: 200, school: "SICT", faculty: "Information & Communication Technology" },
  { sn: 76, programme: "Artificial Intelligence", cutoff: 200, school: "SICT", faculty: "Information & Communication Technology", isNew: true },

  // ── School of Life Sciences & Health Sciences (SLS / CHS) ──
  { sn: 5, programme: "Medical Laboratory Science", cutoff: 200, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 6, programme: "Nursing Science", cutoff: 220, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 14, programme: "Human Anatomy", cutoff: 170, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 15, programme: "Human Physiology", cutoff: 170, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 16, programme: "Medicine and Surgery", cutoff: 250, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 28, programme: "Human Nutrition and Dietetics", cutoff: 170, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 51, programme: "Animal Biology", cutoff: 150, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 52, programme: "Biochemistry", cutoff: 180, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 53, programme: "Biotechnology", cutoff: 170, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 54, programme: "Forensic Science", cutoff: 170, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 55, programme: "Microbiology", cutoff: 180, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 56, programme: "Public Health", cutoff: 200, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 57, programme: "Plant Biology", cutoff: 150, school: "SLS", faculty: "Health & Life Sciences" },
  { sn: 58, programme: "Doctor of Pharmacy", cutoff: 230, school: "SLS", faculty: "Health & Life Sciences" },

  // ── School of Physical Sciences (SPS) ──
  { sn: 59, programme: "Chemistry", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 60, programme: "Geology", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 61, programme: "Geophysics", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 62, programme: "Geography", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 63, programme: "Industrial Mathematics", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 64, programme: "Mathematics", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 65, programme: "Meteorology", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 66, programme: "Physics", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 67, programme: "Statistics", cutoff: 150, school: "SPS", faculty: "Physical Sciences" },
  { sn: 78, programme: "Nuclear Science", cutoff: 180, school: "SPS", faculty: "Physical Sciences", isNew: true },

  // ── School of Science and Technology Education (SSTE) ──
  { sn: 68, programme: "Education Biology", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },
  { sn: 69, programme: "Education Chemistry", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },
  { sn: 70, programme: "Education Geography", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },
  { sn: 71, programme: "Education Mathematics", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },
  { sn: 72, programme: "Education Physics", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },
  { sn: 73, programme: "Educational Technology", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },
  { sn: 74, programme: "Industrial and Technology Education", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },
  { sn: 75, programme: "Library and Information Science", cutoff: 150, school: "SSTE", faculty: "Science & Technology Education" },

  // ── School of Management & Innovative Technology (SMIT / SIT) ──
  { sn: 46, programme: "Entrepreneurship and Business Studies", cutoff: 170, school: "SMIT", faculty: "Management & Innovative Technology" },
  { sn: 47, programme: "Logistics and Supply Chain Management", cutoff: 150, school: "SMIT", faculty: "Management & Innovative Technology" },
  { sn: 48, programme: "Logistics and Transport Technology", cutoff: 150, school: "SMIT", faculty: "Management & Innovative Technology" },
  { sn: 49, programme: "Procurement Management Technology", cutoff: 150, school: "SMIT", faculty: "Management & Innovative Technology" },
  { sn: 50, programme: "Project Management Technology", cutoff: 150, school: "SMIT", faculty: "Management & Innovative Technology" },
  { sn: 77, programme: "Intelligence and Security Studies", cutoff: 170, school: "SMIT", faculty: "Management & Innovative Technology", isNew: true }
];

export const getFUTMINNASchools = (): string[] => {
  const schools = new Set(FUTMINNA_CUTOFFS_2026_2027.map(item => item.school));
  return Array.from(schools);
};

export const getFUTMINNAFaculties = (): string[] => {
  const faculties = new Set(FUTMINNA_CUTOFFS_2026_2027.map(item => item.faculty));
  return Array.from(faculties);
};

export const getFUTMINNACutoffByCourse = (courseName: string): FUTMINNACutoffProgramme | null => {
  if (!courseName) return null;
  const query = courseName.toLowerCase().trim();
  
  // Exact match first
  let match = FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme.toLowerCase() === query);
  if (match) return match;

  // Fuzzy matches for common aliases
  if (query.includes("medicine") || query.includes("surgery") || query.includes("mbbs")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Medicine and Surgery") || null;
  }
  if (query.includes("pharmacy") || query.includes("pharm d") || query.includes("pharm.d")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Doctor of Pharmacy") || null;
  }
  if (query.includes("nursing")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Nursing Science") || null;
  }
  if (query.includes("medical lab") || query.includes("mls")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Medical Laboratory Science") || null;
  }
  if (query.includes("artificial intelligence") || query.includes(" ai") || query === "ai") {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Artificial Intelligence") || null;
  }
  if (query.includes("cyber security") || query.includes("cybersecurity")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Cyber Security Science") || null;
  }
  if (query.includes("software eng")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Software Engineering") || null;
  }
  if (query.includes("computer eng")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Computer Engineering") || null;
  }
  if (query.includes("computer sci")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Computer Science") || null;
  }
  if (query.includes("civil eng")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Civil Engineering") || null;
  }
  if (query.includes("mechanical eng")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Mechanical Engineering") || null;
  }
  if (query.includes("electrical") || query.includes("electronics")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Electrical/Electronics Engineering") || null;
  }
  if (query.includes("mechatronics")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Mechatronics Engineering") || null;
  }
  if (query.includes("architecture") && !query.includes("landscape") && !query.includes("interior") && !query.includes("furniture")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Architecture") || null;
  }
  if (query.includes("public health")) {
    return FUTMINNA_CUTOFFS_2026_2027.find(item => item.programme === "Public Health") || null;
  }

  // Inverted substring match
  match = FUTMINNA_CUTOFFS_2026_2027.find(item => 
    item.programme.toLowerCase().includes(query) || query.includes(item.programme.toLowerCase())
  );
  return match || null;
};
