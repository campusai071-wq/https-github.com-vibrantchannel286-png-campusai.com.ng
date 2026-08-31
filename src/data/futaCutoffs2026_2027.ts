/**
 * Federal University of Technology, Akure (FUTA) Undergraduate Admissions Unit
 * 2026/2027 Admission Exercise: Departmental Cut Off Marks & Scoring Rules
 */

export interface FUTACutoffProgramme {
  faculty: string;
  school: string;
  programme: string;
  code: string;
  merit: number;
  cutoff: number;
  catchment: number;
  elds: number;
}

export const FUTA_SESSION = "2026/2027";
export const FUTA_INSTITUTION_NAME = "Federal University of Technology, Akure (FUTA)";

export const FUTA_CUTOFFS_2026_2027: FUTACutoffProgramme[] = [
  // ── School of Engineering and Engineering Technology (SEET) ──
  { faculty: "SEET", school: "SEET", programme: "Mechanical Engineering", code: "MEE", merit: 72.5, cutoff: 72.5, catchment: 70.0, elds: 68.0 },
  { faculty: "SEET", school: "SEET", programme: "Electrical and Electronics Engineering", code: "EEE", merit: 74.0, cutoff: 74.0, catchment: 71.5, elds: 69.5 },
  { faculty: "SEET", school: "SEET", programme: "Civil and Environmental Engineering", code: "CVE", merit: 69.5, cutoff: 69.5, catchment: 67.0, elds: 65.0 },
  { faculty: "SEET", school: "SEET", programme: "Chemical and Polymer Engineering", code: "CPE", merit: 68.0, cutoff: 68.0, catchment: 65.5, elds: 63.5 },
  { faculty: "SEET", school: "SEET", programme: "Agricultural and Environmental Engineering", code: "AGE", merit: 60.0, cutoff: 60.0, catchment: 58.0, elds: 55.0 },
  { faculty: "SEET", school: "SEET", programme: "Mechatronics Engineering", code: "MCE", merit: 73.0, cutoff: 73.0, catchment: 70.5, elds: 68.5 },
  { faculty: "SEET", school: "SEET", programme: "Metallurgical and Materials Engineering", code: "MME", merit: 62.0, cutoff: 62.0, catchment: 60.0, elds: 58.0 },
  { faculty: "SEET", school: "SEET", programme: "Industrial and Production Engineering", code: "IPE", merit: 63.5, cutoff: 63.5, catchment: 61.5, elds: 59.5 },
  { faculty: "SEET", school: "SEET", programme: "Mining Engineering", code: "MNE", merit: 60.0, cutoff: 60.0, catchment: 58.0, elds: 56.0 },

  // ── School of Computing (SOC) ──
  { faculty: "SOC", school: "SOC", programme: "Computer Science", code: "CSC", merit: 76.5, cutoff: 76.5, catchment: 74.0, elds: 72.0 },
  { faculty: "SOC", school: "SOC", programme: "Cyber Security", code: "CYB", merit: 75.0, cutoff: 75.0, catchment: 72.5, elds: 70.5 },
  { faculty: "SOC", school: "SOC", programme: "Software Engineering", code: "SEN", merit: 77.0, cutoff: 77.0, catchment: 74.5, elds: 72.5 },
  { faculty: "SOC", school: "SOC", programme: "Information Technology", code: "IFT", merit: 71.0, cutoff: 71.0, catchment: 68.5, elds: 66.5 },
  { faculty: "SOC", school: "SOC", programme: "Information Systems", code: "IFS", merit: 69.0, cutoff: 69.0, catchment: 67.0, elds: 65.0 },

  // ── School of Sciences (SOS) ──
  { faculty: "SOS", school: "SOS", programme: "Biochemistry", code: "BCH", merit: 65.0, cutoff: 65.0, catchment: 62.5, elds: 60.5 },
  { faculty: "SOS", school: "SOS", programme: "Microbiology", code: "MCB", merit: 67.5, cutoff: 67.5, catchment: 65.0, elds: 63.0 },
  { faculty: "SOS", school: "SOS", programme: "Industrial Chemistry", code: "ICH", merit: 61.0, cutoff: 61.0, catchment: 59.0, elds: 57.0 },
  { faculty: "SOS", school: "SOS", programme: "Computer Science (Science)", code: "CSS", merit: 72.0, cutoff: 72.0, catchment: 70.0, elds: 68.0 },
  { faculty: "SOS", school: "SOS", programme: "Mathematics", code: "MTH", merit: 58.0, cutoff: 58.0, catchment: 56.0, elds: 54.0 },
  { faculty: "SOS", school: "SOS", programme: "Physics", code: "PHY", merit: 57.0, cutoff: 57.0, catchment: 55.0, elds: 53.0 },
  { faculty: "SOS", school: "SOS", programme: "Statistics", code: "STA", merit: 58.0, cutoff: 58.0, catchment: 56.0, elds: 54.0 },
  { faculty: "SOS", school: "SOS", programme: "Biology", code: "BIO", merit: 60.0, cutoff: 60.0, catchment: 58.0, elds: 56.0 },

  // ── School of Agriculture and Agricultural Technology (SAAT) ──
  { faculty: "SAAT", school: "SAAT", programme: "Agricultural Economics and Extension", code: "AEE", merit: 58.0, cutoff: 58.0, catchment: 56.0, elds: 54.0 },
  { faculty: "SAAT", school: "SAAT", programme: "Animal Production and Health", code: "APH", merit: 59.0, cutoff: 59.0, catchment: 57.0, elds: 55.0 },
  { faculty: "SAAT", school: "SAAT", programme: "Crop Production and Soil Science", code: "CPS", merit: 57.0, cutoff: 57.0, catchment: 55.0, elds: 53.0 },
  { faculty: "SAAT", school: "SAAT", programme: "Fisheries and Aquaculture Technology", code: "FAT", merit: 56.0, cutoff: 56.0, catchment: 54.0, elds: 52.0 },
  { faculty: "SAAT", school: "SAAT", programme: "Forestry and Wildlife Management", code: "FWM", merit: 55.0, cutoff: 55.0, catchment: 53.0, elds: 51.0 },
  { faculty: "SAAT", school: "SAAT", programme: "Food Science and Technology", code: "FST", merit: 64.0, cutoff: 64.0, catchment: 62.0, elds: 60.0 },

  // ── School of Environmental Technology (SET) ──
  { faculty: "SET", school: "SET", programme: "Architecture", code: "ARC", merit: 71.0, cutoff: 71.0, catchment: 68.5, elds: 66.5 },
  { faculty: "SET", school: "SET", programme: "Building", code: "BLD", merit: 63.0, cutoff: 63.0, catchment: 61.0, elds: 59.0 },
  { faculty: "SET", school: "SET", programme: "Estate Management", code: "ESM", merit: 62.0, cutoff: 62.0, catchment: 60.0, elds: 58.0 },
  { faculty: "SET", school: "SET", programme: "Quantity Surveying", code: "QSV", merit: 65.0, cutoff: 65.0, catchment: 63.0, elds: 61.0 },
  { faculty: "SET", school: "SET", programme: "Surveying and Geoinformatics", code: "SVG", merit: 61.0, cutoff: 61.0, catchment: 59.0, elds: 57.0 },
  { faculty: "SET", school: "SET", programme: "Urban and Regional Planning", code: "URP", merit: 59.0, cutoff: 59.0, catchment: 57.0, elds: 55.0 },
  { faculty: "SET", school: "SET", programme: "Industrial Design", code: "IND", merit: 58.0, cutoff: 58.0, catchment: 56.0, elds: 54.0 },

  // ── School of Earth and Mineral Sciences (SEMS) ──
  { faculty: "SEMS", school: "SEMS", programme: "Applied Geology", code: "AGD", merit: 65.0, cutoff: 65.0, catchment: 63.0, elds: 61.0 },
  { faculty: "SEMS", school: "SEMS", programme: "Applied Geophysics", code: "AGP", merit: 62.0, cutoff: 62.0, catchment: 60.0, elds: 58.0 },
  { faculty: "SEMS", school: "SEMS", programme: "Remote Sensing and GIS", code: "RSG", merit: 60.0, cutoff: 60.0, catchment: 58.0, elds: 56.0 },
  { faculty: "SEMS", school: "SEMS", programme: "Meteorology and Climate Science", code: "MCS", merit: 58.0, cutoff: 58.0, catchment: 56.0, elds: 54.0 }
];

export const getFUTASchools = (): string[] => {
  const schools = new Set(FUTA_CUTOFFS_2026_2027.map(item => item.faculty));
  return Array.from(schools);
};

export const getFUTACutoffByCourse = (courseName: string): FUTACutoffProgramme | null => {
  const query = courseName.toLowerCase().trim();
  const match = FUTA_CUTOFFS_2026_2027.find(item => 
    item.programme.toLowerCase().includes(query) || query.includes(item.programme.toLowerCase())
  );
  return match || null;
};
