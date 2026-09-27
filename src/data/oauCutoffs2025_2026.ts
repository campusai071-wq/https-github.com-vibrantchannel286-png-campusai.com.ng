/**
 * Official Obafemi Awolowo University (OAU), Ile-Ife
 * 2024/2025 & 2025/2026 Academic Session: Official Departmental Admission Cut-Off Marks
 * 
 * Sourced directly from stamped faculty dean releases covering:
 *  - Merit Cutoff
 *  - 6 Catchment States: Osun, Oyo, Ogun, Ondo, Ekiti, Lagos
 *  - Educationally Less Developed States (ELDS)
 */

export interface OAUCutoffProgramme {
  faculty: string;
  programme: string;
  merit: number;
  catchment: {
    osun?: number;
    oyo?: number;
    ogun?: number;
    ondo?: number;
    ekiti?: number;
    lagos?: number;
    all?: number;
  };
  elds: number | Record<string, number>;
}

export const OAU_SESSION = "2025/2026";
export const OAU_INSTITUTION_NAME = "Obafemi Awolowo University (OAU), Ile-Ife";

export const OAU_CUTOFFS_2025_2026: OAUCutoffProgramme[] = [
  // ── College of Health Sciences ──
  {
    faculty: "College of Health Sciences",
    programme: "Medicine and Surgery",
    merit: 82.475,
    catchment: {
      osun: 81.400,
      oyo: 80.962,
      ogun: 80.450,
      ondo: 80.775,
      ekiti: 80.475,
      lagos: 77.325,
    },
    elds: {
      ebonyi: 81.625,
      kogi: 79.300,
      benue: 76.200,
      kwara: 78.700,
      default: 78.000,
    },
  },
  {
    faculty: "College of Health Sciences",
    programme: "Nursing Science",
    merit: 77.354,
    catchment: {
      osun: 76.650,
      oyo: 75.400,
      ogun: 76.200,
      ondo: 74.625,
      ekiti: 75.825,
      lagos: 71.050,
    },
    elds: {
      kogi: 75.600,
      crossriver: 74.150,
      kwara: 76.625,
      benue: 76.690,
      default: 75.000,
    },
  },
  {
    faculty: "College of Health Sciences",
    programme: "Dentistry",
    merit: 73.725,
    catchment: {
      osun: 67.600,
      oyo: 65.900,
      ogun: 71.800,
      ondo: 71.200,
      ekiti: 67.950,
      lagos: 67.000,
    },
    elds: {
      kwara: 66.825,
      kogi: 67.825,
      default: 67.000,
    },
  },

  // ── Faculty of Basic Medical Sciences ──
  {
    faculty: "Basic Medical Sciences",
    programme: "Human Nutrition and Dietetics",
    merit: 66.750,
    catchment: {
      osun: 65.700,
      oyo: 64.800,
      ogun: 60.500,
      ondo: 64.150,
      ekiti: 62.500,
      lagos: 60.355,
    },
    elds: 61.154,
  },
  {
    faculty: "Basic Medical Sciences",
    programme: "Medical Rehabilitation",
    merit: 72.575,
    catchment: {
      osun: 71.225,
      oyo: 70.825,
      ogun: 69.250,
      ondo: 71.125,
      ekiti: 69.525,
      lagos: 66.700,
    },
    elds: 66.575,
  },

  // ── Faculty of Law ──
  {
    faculty: "Law",
    programme: "Law",
    merit: 76.075,
    catchment: {
      osun: 75.300,
      oyo: 74.750,
      ondo: 74.225,
      ogun: 74.900,
      ekiti: 74.100,
      lagos: 67.375,
    },
    elds: 70.175,
  },

  // ── Faculty of Pharmacy ──
  {
    faculty: "Pharmacy",
    programme: "Pharmacy",
    merit: 73.475,
    catchment: {
      osun: 70.675,
      oyo: 70.000,
      ondo: 67.075,
      ogun: 69.775,
      ekiti: 69.650,
      lagos: 61.525,
    },
    elds: 60.375,
  },

  // ── Faculty of Technology ──
  {
    faculty: "Technology",
    programme: "Aerospace Engineering",
    merit: 73.025,
    catchment: {
      ekiti: 59.625,
      lagos: 62.875,
      ogun: 68.000,
      ondo: 66.300,
      osun: 68.125,
      oyo: 68.600,
    },
    elds: 60.000,
  },
  {
    faculty: "Technology",
    programme: "Agricultural & Environmental Engineering",
    merit: 51.300,
    catchment: {
      all: 50.000,
      ekiti: 50.00,
      lagos: 50.00,
      ogun: 50.00,
      ondo: 50.00,
      osun: 50.00,
      oyo: 50.00,
    },
    elds: 50.000,
  },
  {
    faculty: "Technology",
    programme: "Chemical Engineering",
    merit: 68.500,
    catchment: {
      ekiti: 60.475,
      lagos: 50.000,
      ogun: 58.600,
      ondo: 62.325,
      osun: 61.775,
      oyo: 55.575,
    },
    elds: 55.000,
  },
  {
    faculty: "Technology",
    programme: "Civil Engineering",
    merit: 68.325,
    catchment: {
      ekiti: 59.075,
      lagos: 53.675,
      ogun: 62.800,
      ondo: 53.900,
      osun: 65.875,
      oyo: 60.175,
    },
    elds: 55.000,
  },
  {
    faculty: "Technology",
    programme: "Electronic & Electrical Engineering",
    merit: 70.200,
    catchment: {
      ekiti: 56.400,
      lagos: 53.325,
      ogun: 60.575,
      ondo: 59.450,
      osun: 66.975,
      oyo: 65.700,
    },
    elds: 55.000,
  },
  {
    faculty: "Technology",
    programme: "Food Science & Technology",
    merit: 54.500,
    catchment: {
      ekiti: 52.975,
      lagos: 53.575,
      ogun: 52.000,
      ondo: 54.275,
      osun: 52.400,
      oyo: 51.975,
    },
    elds: 50.000,
  },
  {
    faculty: "Technology",
    programme: "Mechanical Engineering",
    merit: 69.325,
    catchment: {
      ekiti: 62.175,
      lagos: 52.950,
      ogun: 61.175,
      ondo: 61.275,
      osun: 66.950,
      oyo: 64.525,
    },
    elds: 55.000,
  },
  {
    faculty: "Technology",
    programme: "Materials Science & Engineering",
    merit: 52.900,
    catchment: {
      all: 50.000,
      ekiti: 50.00,
      lagos: 50.00,
      ogun: 50.00,
      ondo: 50.00,
      osun: 50.00,
      oyo: 50.00,
    },
    elds: 50.000,
  },

  // ── Faculty of Computing Science and Engineering ──
  {
    faculty: "Computing Science & Engineering",
    programme: "Computer Engineering",
    merit: 66.25,
    catchment: {
      osun: 56.65,
      oyo: 56.65,
      ondo: 57.27,
      ogun: 56.70,
      ekiti: 62.10,
      lagos: 65.10,
    },
    elds: 53.90,
  },
  {
    faculty: "Computing Science & Engineering",
    programme: "Computer Science with Economics",
    merit: 64.17,
    catchment: {
      osun: 54.35,
      oyo: 55.85,
      ondo: 54.45,
      ogun: 58.00,
      ekiti: 57.72,
      lagos: 58.00,
    },
    elds: 53.50,
  },
  {
    faculty: "Computing Science & Engineering",
    programme: "Computer Science with Mathematics",
    merit: 67.73,
    catchment: {
      osun: 61.65,
      oyo: 62.00,
      ondo: 61.80,
      ogun: 63.05,
      ekiti: 61.85,
      lagos: 62.52,
    },
    elds: 53.00,
  },
  {
    faculty: "Computing Science & Engineering",
    programme: "Cybersecurity",
    merit: 63.65,
    catchment: {
      osun: 56.75,
      oyo: 57.82,
      ondo: 57.07,
      ogun: 57.95,
      ekiti: 60.05,
      lagos: 57.85,
    },
    elds: 54.30,
  },
  {
    faculty: "Computing Science & Engineering",
    programme: "Information and Communication Technology",
    merit: 62.80,
    catchment: {
      all: 51.00,
      osun: 51.00,
      oyo: 51.00,
      ondo: 51.00,
      ogun: 51.00,
      ekiti: 51.00,
      lagos: 51.00,
    },
    elds: 50.00,
  },
  {
    faculty: "Computing Science & Engineering",
    programme: "Information System",
    merit: 59.73,
    catchment: {
      all: 51.00,
      osun: 51.00,
      oyo: 51.00,
      ondo: 51.00,
      ogun: 51.00,
      ekiti: 51.00,
      lagos: 51.00,
    },
    elds: 50.00,
  },
  {
    faculty: "Computing Science & Engineering",
    programme: "Software Engineering",
    merit: 66.77,
    catchment: {
      osun: 61.72,
      oyo: 61.02,
      ondo: 61.25,
      ogun: 61.20,
      ekiti: 63.22,
      lagos: 67.00,
    },
    elds: 51.00,
  },

  // ── Faculty of Social Sciences ──
  {
    faculty: "Social Sciences",
    programme: "Demography and Social Statistics",
    merit: 53.45,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Social Sciences",
    programme: "Economics",
    merit: 62.73,
    catchment: {
      osun: 56.35,
      oyo: 57.75,
      ekiti: 54.15,
      ondo: 50.65,
      lagos: 54.15,
      ogun: 55.28,
    },
    elds: 51.80,
  },
  {
    faculty: "Social Sciences",
    programme: "Entrepreneurship",
    merit: 50.13,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Social Sciences",
    programme: "Geography",
    merit: 56.55,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Social Sciences",
    programme: "Political Science",
    merit: 54.53,
    catchment: {
      osun: 63.35,
      oyo: 61.50,
      ekiti: 55.73,
      ondo: 56.30,
      lagos: 52.83,
      ogun: 60.80,
    },
    elds: 51.03,
  },
  {
    faculty: "Social Sciences",
    programme: "Psychology",
    merit: 62.20,
    catchment: {
      osun: 55.65,
      oyo: 56.40,
      ekiti: 52.38,
      ondo: 56.75,
      lagos: 53.80,
      ogun: 55.28,
    },
    elds: 50.93,
  },
  {
    faculty: "Social Sciences",
    programme: "Sociology and Anthropology",
    merit: 55.43,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Social Sciences",
    programme: "Mass Communication",
    merit: 66.15,
    catchment: {
      osun: 63.98,
      oyo: 63.90,
      ekiti: 58.15,
      ondo: 62.20,
      lagos: 51.93,
      ogun: 61.78,
    },
    elds: 54.68,
  },
  {
    faculty: "Social Sciences",
    programme: "Film Production",
    merit: 52.65,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Social Sciences",
    programme: "Broadcast Journalism",
    merit: 61.55,
    catchment: {
      osun: 58.75,
      oyo: 57.35,
      ekiti: 54.45,
      ondo: 53.75,
      lagos: 50.53,
      ogun: 56.35,
    },
    elds: 54.48,
  },
  {
    faculty: "Social Sciences",
    programme: "Information Science and Media Studies",
    merit: 52.08,
    catchment: { all: 50.00 },
    elds: 50.00,
  },

  // ── Faculty of Administration ──
  {
    faculty: "Administration",
    programme: "Accounting",
    merit: 69.600,
    catchment: {
      osun: 67.725,
      oyo: 65.800,
      ekiti: 59.500,
      ondo: 60.375,
      lagos: 52.000,
      ogun: 65.575,
    },
    elds: 61.500,
  },
  {
    faculty: "Administration",
    programme: "Business Administration",
    merit: 62.400,
    catchment: {
      osun: 57.600,
      oyo: 54.825,
      ekiti: 50.000,
      ondo: 52.000,
      lagos: 53.000,
      ogun: 57.025,
    },
    elds: 54.000,
  },
  {
    faculty: "Administration",
    programme: "International Relations",
    merit: 52.650,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Administration",
    programme: "Local Government and Development Studies",
    merit: 52.375,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Administration",
    programme: "Public Administration",
    merit: 55.050,
    catchment: { all: 50.00 },
    elds: 50.00,
  },

  // ── Faculty of Environmental Design and Management (EDM) ──
  {
    faculty: "Environmental Design & Management",
    programme: "Architecture",
    merit: 70.575,
    catchment: {
      osun: 68.300,
      oyo: 67.475,
      ondo: 62.425,
      ogun: 64.400,
      ekiti: 60.825,
      lagos: 58.850,
    },
    elds: 64.550,
  },
  {
    faculty: "Environmental Design & Management",
    programme: "Building",
    merit: 53.950,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Environmental Design & Management",
    programme: "Estate Management",
    merit: 50.575,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Environmental Design & Management",
    programme: "Fine and Applied Arts",
    merit: 59.775,
    catchment: {
      osun: 55.100,
      oyo: 55.100,
      ondo: 51.300,
      ogun: 52.775,
      ekiti: 53.850,
      lagos: 54.100,
    },
    elds: 52.325,
  },
  {
    faculty: "Environmental Design & Management",
    programme: "Quantity Surveying",
    merit: 53.175,
    catchment: { all: 50.00 },
    elds: 50.00,
  },
  {
    faculty: "Environmental Design & Management",
    programme: "Surveying and Geoinformatics",
    merit: 55.900,
    catchment: {
      osun: 51.200,
      oyo: 53.025,
      ondo: 50.000,
      ogun: 55.000,
      ekiti: 52.050,
      lagos: 53.300,
    },
    elds: 50.000,
  },
  {
    faculty: "Environmental Design & Management",
    programme: "Urban and Regional Planning",
    merit: 58.550,
    catchment: { all: 50.00 },
    elds: 50.00,
  },

  // ── Faculty of Science ──
  { faculty: "Science", programme: "Applied Geophysics", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  {
    faculty: "Science",
    programme: "Biochemistry",
    merit: 56.00,
    catchment: {
      osun: 51.625,
      oyo: 51.925,
      ondo: 52.850,
      ogun: 53.375,
      ekiti: 52.200,
      lagos: 50.000,
    },
    elds: 53.00,
  },
  { faculty: "Science", programme: "Botany", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Science", programme: "Chemistry", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Science", programme: "Engineering Physics", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Science", programme: "Geology", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Science", programme: "Industrial Chemistry", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Science", programme: "Mathematics", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  {
    faculty: "Science",
    programme: "Microbiology",
    merit: 57.925,
    catchment: {
      osun: 55.450,
      oyo: 52.900,
      ondo: 52.350,
      ogun: 51.525,
      ekiti: 52.175,
      lagos: 51.925,
    },
    elds: 50.00,
  },
  { faculty: "Science", programme: "Physics", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Science", programme: "Science Laboratory Technology", merit: 51.575, catchment: { all: 51.575 }, elds: 51.575 },
  { faculty: "Science", programme: "Statistics", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Science", programme: "Zoology", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },

  // ── Faculty of Agriculture ──
  { faculty: "Agriculture", programme: "Agricultural Economics", merit: 51.90, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Agriculture", programme: "Agricultural Extension and Rural Development", merit: 50.70, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Agriculture", programme: "Animal Sciences", merit: 51.65, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Agriculture", programme: "Crop Production and Protection", merit: 53.50, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Agriculture", programme: "Soil and Land Resources Management", merit: 54.90, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Agriculture", programme: "Forestry and Wildlife", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Agriculture", programme: "Family Nutrition and Consumer Science", merit: 50.80, catchment: { all: 50.00 }, elds: 50.00 },

  // ── Faculty of Arts ──
  {
    faculty: "Arts",
    programme: "Dramatic Arts",
    merit: 62.03,
    catchment: {
      osun: 59.40,
      oyo: 59.24,
      ondo: 56.45,
      ekiti: 51.93,
      ogun: 56.96,
      lagos: 50.00,
    },
    elds: 50.00,
  },
  {
    faculty: "Arts",
    programme: "English Language",
    merit: 58.58,
    catchment: {
      osun: 57.43,
      oyo: 57.85,
      ondo: 50.00,
      ekiti: 50.00,
      ogun: 54.50,
      lagos: 50.00,
    },
    elds: 50.00,
  },
  { faculty: "Arts", programme: "French", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  {
    faculty: "Arts",
    programme: "German",
    merit: 61.78,
    catchment: {
      osun: 60.88,
      oyo: 59.03,
      ondo: 55.30,
      ekiti: 50.00,
      ogun: 59.58,
      lagos: 50.00,
    },
    elds: 50.00,
  },
  { faculty: "Arts", programme: "Portuguese", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Arts", programme: "History", merit: 52.20, catchment: { all: 50.00 }, elds: 50.00 },
  {
    faculty: "Arts",
    programme: "Linguistics",
    merit: 57.10,
    catchment: {
      osun: 53.60,
      oyo: 53.20,
      ondo: 50.00,
      ekiti: 50.00,
      ogun: 50.00,
      lagos: 50.00,
    },
    elds: 50.00,
  },
  { faculty: "Arts", programme: "Yoruba", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Arts", programme: "Music", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Arts", programme: "Philosophy", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Arts", programme: "Literature-in-English", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Arts", programme: "Religious Studies", merit: 50.00, catchment: { all: 50.00 }, elds: 50.00 },

  // ── Faculty of Education ──
  { faculty: "Education", programme: "Education Economics", merit: 59.80, catchment: { all: 50.90 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Geography", merit: 62.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education History", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Religious Studies", merit: 56.00, catchment: { all: 51.00 }, elds: 50.00 },
  {
    faculty: "Education",
    programme: "Education English",
    merit: 59.10,
    catchment: {
      osun: 54.60,
      oyo: 54.47,
      ondo: 54.60,
      ogun: 55.20,
      ekiti: 56.00,
      lagos: 54.60,
    },
    elds: 50.00,
  },
  { faculty: "Education", programme: "Education French", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Yoruba", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  {
    faculty: "Education",
    programme: "Education Political Science",
    merit: 61.90,
    catchment: {
      osun: 54.00,
      oyo: 52.00,
      ondo: 52.00,
      ogun: 52.00,
      ekiti: 53.00,
      lagos: 52.00,
    },
    elds: 50.00,
  },
  { faculty: "Education", programme: "Education Fine Arts", merit: 52.45, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Music", merit: 50.30, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Adult Education", merit: 54.20, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Guidance and Counselling", merit: 58.00, catchment: { all: 51.90, ekiti: 52.50 }, elds: 50.00 },
  { faculty: "Education", programme: "Educational Management", merit: 56.60, catchment: { all: 52.125 }, elds: 50.00 },
  { faculty: "Education", programme: "Educational Technology", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Library and Information Science", merit: 58.60, catchment: { all: 51.30 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Social Studies", merit: 53.80, catchment: { all: 50.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Mathematics/Integrated Science", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Language and Communication Arts", merit: 54.10, catchment: { all: 52.00, oyo: 52.90 }, elds: 50.00 },
  { faculty: "Education", programme: "Early Childhood and Primary Education", merit: 54.50, catchment: { all: 52.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Physical and Health Education", merit: 57.30, catchment: { all: 52.90, oyo: 53.00, ondo: 51.30, ogun: 57.00, ekiti: 51.30, lagos: 55.30 }, elds: 50.00 },
  { faculty: "Education", programme: "Human Kinetics Education", merit: 55.50, catchment: { all: 52.90, oyo: 53.00, ondo: 51.30, ogun: 57.00, ekiti: 51.30, lagos: 55.30 }, elds: 50.00 },
  { faculty: "Education", programme: "Health Education", merit: 52.20, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Mathematics", merit: 59.50, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Biology", merit: 57.90, catchment: { all: 53.00, osun: 52.30, oyo: 54.20 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Chemistry", merit: 53.10, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Physics", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Agricultural Science", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Computer Education", merit: 51.00, catchment: { all: 51.00 }, elds: 50.00 },
  { faculty: "Education", programme: "Education Home Economics", merit: 61.70, catchment: { all: 55.70 }, elds: 50.00 },
];

/**
 * Returns list of distinct faculty names in OAU
 */
export function getOAUFaculties(): string[] {
  return Array.from(new Set(OAU_CUTOFFS_2025_2026.map(p => p.faculty)));
}

/**
 * Normalizes course strings for fuzzy matching
 */
function clean(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Retrieves the precise cutoff for a candidate applying to OAU based on state of origin
 */
export function getOAUCutoffForCandidate(
  programmeName: string,
  stateOfOrigin: string
): {
  programme: OAUCutoffProgramme | null;
  cutoff: number;
  quotaType: 'merit' | 'catchment' | 'elds';
  quotaLabel: string;
} {
  const pClean = clean(programmeName);
  const prog = OAU_CUTOFFS_2025_2026.find(p => {
    const itemClean = clean(p.programme);
    return itemClean === pClean || itemClean.includes(pClean) || pClean.includes(itemClean);
  });

  if (!prog) {
    return {
      programme: null,
      cutoff: 50.0,
      quotaType: 'merit',
      quotaLabel: 'General Benchmark',
    };
  }

  const s = (stateOfOrigin || '').toLowerCase().trim();
  const catchmentStates = ['osun', 'oyo', 'ogun', 'ondo', 'ekiti', 'lagos'];
  const eldsStates = [
    'adamawa', 'bauchi', 'bayelsa', 'benue', 'borno', 'cross river', 'ebonyi',
    'gombe', 'jigawa', 'kano', 'kaduna', 'katsina', 'kebbi', 'kogi', 'kwara',
    'nasarawa', 'niger', 'plateau', 'rivers', 'sokoto', 'taraba', 'yobe', 'zamfara'
  ];

  // 1. Catchment Check
  if (catchmentStates.includes(s)) {
    const cMap = prog.catchment;
    const stateKey = s as keyof typeof cMap;
    const stateVal = cMap[stateKey] ?? cMap.all;
    if (typeof stateVal === 'number') {
      return {
        programme: prog,
        cutoff: stateVal,
        quotaType: 'catchment',
        quotaLabel: `OAU Catchment (${stateOfOrigin})`,
      };
    }
  }

  // 2. ELDS Check
  if (eldsStates.includes(s)) {
    if (typeof prog.elds === 'number') {
      return {
        programme: prog,
        cutoff: prog.elds,
        quotaType: 'elds',
        quotaLabel: `ELDS Quota (${stateOfOrigin})`,
      };
    } else if (typeof prog.elds === 'object') {
      const eldsMap = prog.elds as Record<string, number>;
      const stateKey = s.replace(/\s+/g, '');
      const eldsVal = eldsMap[stateKey] ?? eldsMap.default ?? prog.merit;
      return {
        programme: prog,
        cutoff: eldsVal,
        quotaType: 'elds',
        quotaLabel: `ELDS Quota (${stateOfOrigin})`,
      };
    }
  }

  // 3. National Merit
  return {
    programme: prog,
    cutoff: prog.merit,
    quotaType: 'merit',
    quotaLabel: 'National Merit Quota',
  };
}
