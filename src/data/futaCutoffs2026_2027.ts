/**
 * Official Federal University of Technology, Akure (FUTA)
 * 2026/2027 Admission Exercise: Approved Departmental Cut-Off Marks
 * 
 * Verified against official university Post-UTME screening announcement.
 * General Institutional Cut-Off Mark: 180
 */

export interface FUTACutoffProgramme {
  school: string;
  programme: string;
  code: string;
  cutoff: number;
}

export const FUTA_SESSION = "2026/2027";
export const FUTA_INSTITUTION_NAME = "Federal University of Technology, Akure (FUTA)";
export const FUTA_GENERAL_CUTOFF = 180;
export const FUTA_SCREENING_FEE = 2000;

export const FUTA_CUTOFFS_2026_2027: FUTACutoffProgramme[] = [
  // ── School of Agriculture and Agricultural Technology (SAAT) ──
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Agricultural Extension and Communication Technology", code: "AEC", cutoff: 47.5 },
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Animal Production and Health", code: "APH", cutoff: 55.37 },
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Agricultural & Resource Economics", code: "ARE", cutoff: 47.5 },
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Crop, Soil and Pest Management", code: "CSP", cutoff: 47.5 },
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Ecotourism and Wildlife Management", code: "EWM", cutoff: 47.5 },
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Fisheries and Aquaculture Technology", code: "FAT", cutoff: 47.5 },
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Food Science and Technology", code: "FST", cutoff: 58.12 },
  { school: "School of Agriculture & Agricultural Technology (SAAT)", programme: "Forestry and Wood Technology", code: "FWT", cutoff: 57.5 },

  // ── School of Engineering and Engineering Technology (SEET) ──
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Agricultural & Environmental Engineering", code: "AGE", cutoff: 55.12 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Computer Engineering", code: "CPE", cutoff: 69.62 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Civil & Environmental Engineering", code: "CVE", cutoff: 71.87 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Electrical & Electronics Engineering", code: "EEE", cutoff: 74.37 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Information & Communication Technology", code: "ICT", cutoff: 49.75 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Industrial & Production Engineering", code: "IPE", cutoff: 47.5 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Mechanical Engineering", code: "MEE", cutoff: 73.75 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Metallurgical & Materials Engineering", code: "MME", cutoff: 54.87 },
  { school: "School of Engineering & Engineering Technology (SEET)", programme: "Mining Engineering", code: "MNE", cutoff: 54.75 },

  // ── School of Earth and Mineral Sciences (SEMS) ──
  { school: "School of Earth & Mineral Sciences (SEMS)", programme: "Applied Geophysics", code: "AGP", cutoff: 47.5 },
  { school: "School of Earth & Mineral Sciences (SEMS)", programme: "Applied Geology", code: "AGY", cutoff: 47.5 },
  { school: "School of Earth & Mineral Sciences (SEMS)", programme: "Marine Science & Technology", code: "MST", cutoff: 47.5 },
  { school: "School of Earth & Mineral Sciences (SEMS)", programme: "Meteorology", code: "MCS", cutoff: 47.5 },
  { school: "School of Earth & Mineral Sciences (SEMS)", programme: "Remote Sensing & GIS", code: "RSG", cutoff: 47.5 },

  // ── School of Environmental Technology (SET) ──
  { school: "School of Environmental Technology (SET)", programme: "Architecture", code: "ARC", cutoff: 72.87 },
  { school: "School of Environmental Technology (SET)", programme: "Building", code: "BDG", cutoff: 56.62 },
  { school: "School of Environmental Technology (SET)", programme: "Estate Management", code: "ESM", cutoff: 47.5 },
  { school: "School of Environmental Technology (SET)", programme: "Industrial Design", code: "IDD", cutoff: 53.25 },
  { school: "School of Environmental Technology (SET)", programme: "Quantity Surveying", code: "QSV", cutoff: 57.0 },
  { school: "School of Environmental Technology (SET)", programme: "Surveying & Geoinformatics", code: "SVG", cutoff: 64.25 },
  { school: "School of Environmental Technology (SET)", programme: "Urban & Regional Planning", code: "URP", cutoff: 52.87 },

  // ── School of Computing (SOC) ──
  { school: "School of Computing (SOC)", programme: "Computer Science", code: "CSC", cutoff: 69.0 },
  { school: "School of Computing (SOC)", programme: "Information Technology", code: "IFT", cutoff: 63.75 },
  { school: "School of Computing (SOC)", programme: "Information Systems", code: "IFS", cutoff: 63.75 },
  { school: "School of Computing (SOC)", programme: "Cyber Security", code: "CSS", cutoff: 63.75 },
  { school: "School of Computing (SOC)", programme: "Software Engineering", code: "SEN", cutoff: 63.75 },

  // ── School of Sciences (SOS) ──
  { school: "School of Sciences (SOS)", programme: "Biochemistry", code: "BCH", cutoff: 63.37 },
  { school: "School of Sciences (SOS)", programme: "Biology", code: "BIO", cutoff: 47.5 },
  { school: "School of Sciences (SOS)", programme: "Biotechnology", code: "BTH", cutoff: 47.5 },
  { school: "School of Sciences (SOS)", programme: "Chemistry", code: "CHE", cutoff: 47.5 },
  { school: "School of Sciences (SOS)", programme: "Microbiology", code: "MCB", cutoff: 63.0 },
  { school: "School of Sciences (SOS)", programme: "Industrial Mathematics", code: "MTS", cutoff: 59.0 },
  { school: "School of Sciences (SOS)", programme: "Physics", code: "PHY", cutoff: 47.5 },
  { school: "School of Sciences (SOS)", programme: "Statistics", code: "STA", cutoff: 47.5 },

  // ── School of Health and Health Technology (SHHT) ──
  { school: "School of Health & Health Technology (SHHT)", programme: "Pharmacy", code: "PHM", cutoff: 60.0 },
  { school: "School of Health & Health Technology (SHHT)", programme: "Medical Laboratory Science", code: "MLS", cutoff: 47.5 },
  { school: "School of Health & Health Technology (SHHT)", programme: "Nursing Science", code: "RN", cutoff: 60.0 },

  // ── School of Basic Medical Services (SBMS) ──
  { school: "School of Basic Medical Services (SBMS)", programme: "Human Anatomy", code: "ANA", cutoff: 59.5 },
  { school: "School of Basic Medical Services (SBMS)", programme: "Biomedical Technology", code: "BMT", cutoff: 47.5 },
  { school: "School of Basic Medical Services (SBMS)", programme: "Human Physiology", code: "PHS", cutoff: 57.25 },
  { school: "School of Basic Medical Services (SBMS)", programme: "Medicine and Surgery", code: "MBBS", cutoff: 62.0 }
];

/**
 * Fuzzy search to get FUTA Departmental Cutoff by Course name or acronym
 */
export function getFUTACutoffByCourse(courseName: string): FUTACutoffProgramme | undefined {
  if (!courseName) return undefined;
  const clean = courseName.toLowerCase().trim();

  // 1. Exact match by code
  const exactCode = FUTA_CUTOFFS_2026_2027.find(
    item => item.code.toLowerCase() === clean
  );
  if (exactCode) return exactCode;

  // 2. Exact match by programme name
  const exactName = FUTA_CUTOFFS_2026_2027.find(
    item => item.programme.toLowerCase() === clean
  );
  if (exactName) return exactName;

  // 3. Alias map for common search variants
  const aliasMap: Record<string, string> = {
    'computer science': 'Computer Science',
    'csc': 'Computer Science',
    'compsci': 'Computer Science',
    'software engineering': 'Software Engineering',
    'se': 'Software Engineering',
    'sen': 'Software Engineering',
    'cyber security': 'Cyber Security',
    'cybersecurity': 'Cyber Security',
    'css': 'Cyber Security',
    'electrical engineering': 'Electrical & Electronics Engineering',
    'electrical and electronic engineering': 'Electrical & Electronics Engineering',
    'electrical and electronics engineering': 'Electrical & Electronics Engineering',
    'eee': 'Electrical & Electronics Engineering',
    'mechanical engineering': 'Mechanical Engineering',
    'mech eng': 'Mechanical Engineering',
    'mee': 'Mechanical Engineering',
    'civil engineering': 'Civil & Environmental Engineering',
    'civil and environmental engineering': 'Civil & Environmental Engineering',
    'cve': 'Civil & Environmental Engineering',
    'computer engineering': 'Computer Engineering',
    'cpe': 'Computer Engineering',
    'metallurgical engineering': 'Metallurgical & Materials Engineering',
    'metallurgical and materials engineering': 'Metallurgical & Materials Engineering',
    'materials engineering': 'Metallurgical & Materials Engineering',
    'mme': 'Metallurgical & Materials Engineering',
    'mining engineering': 'Mining Engineering',
    'mne': 'Mining Engineering',
    'industrial engineering': 'Industrial & Production Engineering',
    'industrial and production engineering': 'Industrial & Production Engineering',
    'ipe': 'Industrial & Production Engineering',
    'agricultural engineering': 'Agricultural & Environmental Engineering',
    'agricultural and environmental engineering': 'Agricultural & Environmental Engineering',
    'age': 'Agricultural & Environmental Engineering',
    'information technology': 'Information Technology',
    'it': 'Information Technology',
    'ift': 'Information Technology',
    'information systems': 'Information Systems',
    'ifs': 'Information Systems',
    'architecture': 'Architecture',
    'arc': 'Architecture',
    'building': 'Building',
    'bdg': 'Building',
    'estate management': 'Estate Management',
    'esm': 'Estate Management',
    'quantity surveying': 'Quantity Surveying',
    'qsv': 'Quantity Surveying',
    'surveying': 'Surveying & Geoinformatics',
    'surveying & geoinformatics': 'Surveying & Geoinformatics',
    'svg': 'Surveying & Geoinformatics',
    'urban and regional planning': 'Urban & Regional Planning',
    'urp': 'Urban & Regional Planning',
    'medicine': 'Medicine and Surgery',
    'medicine and surgery': 'Medicine and Surgery',
    'mbbs': 'Medicine and Surgery',
    'nursing': 'Nursing Science',
    'nursing science': 'Nursing Science',
    'rn': 'Nursing Science',
    'pharmacy': 'Pharmacy',
    'medical lab': 'Medical Laboratory Science',
    'medical laboratory science': 'Medical Laboratory Science',
    'mls': 'Medical Laboratory Science',
    'anatomy': 'Human Anatomy',
    'physiology': 'Human Physiology',
    'biomedical technology': 'Biomedical Technology',
    'biochemistry': 'Biochemistry',
    'bch': 'Biochemistry',
    'microbiology': 'Microbiology',
    'mcb': 'Microbiology',
    'biology': 'Biology',
    'biotechnology': 'Biotechnology',
    'chemistry': 'Chemistry',
    'physics': 'Physics',
    'statistics': 'Statistics',
    'industrial mathematics': 'Industrial Mathematics',
    'mathematics': 'Industrial Mathematics',
    'mts': 'Industrial Mathematics',
    'applied geology': 'Applied Geology',
    'geology': 'Applied Geology',
    'agy': 'Applied Geology',
    'applied geophysics': 'Applied Geophysics',
    'geophysics': 'Applied Geophysics',
    'agp': 'Applied Geophysics',
    'meteorology': 'Meteorology',
    'mcs': 'Meteorology',
    'marine science': 'Marine Science & Technology',
    'marine science & technology': 'Marine Science & Technology',
    'mst': 'Marine Science & Technology',
    'remote sensing': 'Remote Sensing & GIS',
    'rsg': 'Remote Sensing & GIS',
    'food science': 'Food Science and Technology',
    'food science and technology': 'Food Science and Technology',
    'fst': 'Food Science and Technology',
    'animal production': 'Animal Production and Health',
    'animal production and health': 'Animal Production and Health',
    'aph': 'Animal Production and Health',
    'agricultural economics': 'Agricultural & Resource Economics',
    'agricultural & resource economics': 'Agricultural & Resource Economics',
    'are': 'Agricultural & Resource Economics',
    'crop science': 'Crop, Soil and Pest Management',
    'crop, soil and pest management': 'Crop, Soil and Pest Management',
    'csp': 'Crop, Soil and Pest Management',
    'ecotourism': 'Ecotourism and Wildlife Management',
    'ewm': 'Ecotourism and Wildlife Management',
    'fisheries': 'Fisheries and Aquaculture Technology',
    'fat': 'Fisheries and Aquaculture Technology',
    'forestry': 'Forestry and Wood Technology',
    'fwt': 'Forestry and Wood Technology'
  };

  if (aliasMap[clean]) {
    const found = FUTA_CUTOFFS_2026_2027.find(
      item => item.programme.toLowerCase() === aliasMap[clean].toLowerCase()
    );
    if (found) return found;
  }

  // 4. Substring match
  return FUTA_CUTOFFS_2026_2027.find(
    item => item.programme.toLowerCase().includes(clean) || clean.includes(item.programme.toLowerCase())
  );
}

/**
 * Get all unique schools/faculties in FUTA
 */
export function getFUTASchools(): string[] {
  return Array.from(new Set(FUTA_CUTOFFS_2026_2027.map(item => item.school)));
}

/**
 * Get all programmes under a specific school
 */
export function getFUTAProgrammesBySchool(school: string): FUTACutoffProgramme[] {
  return FUTA_CUTOFFS_2026_2027.filter(
    item => item.school.toLowerCase() === school.toLowerCase()
  );
}
