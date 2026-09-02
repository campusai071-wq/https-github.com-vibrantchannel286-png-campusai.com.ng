/**
 * Federal University of Health Sciences, Ila-Orangun (FUHSI)
 * Official Cut-off Marks for 2026/2027 Admissions
 * Signed by Registrar: Kassim Kayode Babamale
 */

export interface FUHSIStateCutoffs {
  osun: number;
  oyo: number;
  ondo: number;
  ogun: number;
  ekiti: number;
  lagos: number;
}

export interface FUHSICutoffProgramme {
  sn: number;
  programme: string;
  merit: number;
  states: FUHSIStateCutoffs;
  faculty: string;
}

export const FUHSI_SESSION = "2026/2027";
export const FUHSI_INSTITUTION_NAME = "Federal University of Health Sciences, Ila-Orangun (FUHSI)";

export const FUHSI_CUTOFFS_2026_2027: FUHSICutoffProgramme[] = [
  {
    sn: 1,
    programme: "Audiology",
    merit: 65.5,
    states: { osun: 65.1, oyo: 65.1, ondo: 63.2, ogun: 62.5, ekiti: 64.3, lagos: 61.4 },
    faculty: "Allied Health Sciences"
  },
  {
    sn: 2,
    programme: "Biochemistry",
    merit: 50.3,
    states: { osun: 50.3, oyo: 50.3, ondo: 50.3, ogun: 50.3, ekiti: 50.3, lagos: 50.3 },
    faculty: "Basic Medical Sciences"
  },
  {
    sn: 3,
    programme: "Information Technology and Health Informatics",
    merit: 59.8,
    states: { osun: 59.2, oyo: 58.2, ondo: 57.2, ogun: 52.9, ekiti: 56.5, lagos: 52.0 },
    faculty: "Health Information & Computing"
  },
  {
    sn: 4,
    programme: "Medical Laboratory Science",
    merit: 72.2,
    states: { osun: 71.4, oyo: 70.8, ondo: 69.4, ogun: 70.8, ekiti: 70.1, lagos: 67.6 },
    faculty: "Medical Laboratory Science"
  },
  {
    sn: 5,
    programme: "MBBS",
    merit: 81.3,
    states: { osun: 80.3, oyo: 79.7, ondo: 79.8, ogun: 76.1, ekiti: 79.4, lagos: 72.2 },
    faculty: "Clinical Sciences"
  },
  {
    sn: 6,
    programme: "Microbiology",
    merit: 50.0,
    states: { osun: 50.0, oyo: 50.0, ondo: 50.0, ogun: 50.0, ekiti: 50.0, lagos: 50.0 },
    faculty: "Basic Sciences"
  },
  {
    sn: 7,
    programme: "Nursing Science",
    merit: 75.4,
    states: { osun: 73.7, oyo: 71.9, ondo: 74.5, ogun: 73.0, ekiti: 71.3, lagos: 70.3 },
    faculty: "Nursing Science"
  },
  {
    sn: 8,
    programme: "Nutrition & Dietetics",
    merit: 61.8,
    states: { osun: 61.2, oyo: 60.4, ondo: 55.8, ogun: 59.6, ekiti: 59.7, lagos: 51.4 },
    faculty: "Allied Health Sciences"
  },
  {
    sn: 9,
    programme: "Doctor of Physiotherapy",
    merit: 73.3,
    states: { osun: 73.3, oyo: 71.9, ondo: 69.7, ogun: 71.4, ekiti: 68.0, lagos: 68.2 },
    faculty: "Allied Health Sciences"
  },
  {
    sn: 10,
    programme: "Biotechnology and Molecular Biology",
    merit: 50.0,
    states: { osun: 50.0, oyo: 50.0, ondo: 50.0, ogun: 50.0, ekiti: 50.0, lagos: 50.0 },
    faculty: "Basic Sciences"
  },
  {
    sn: 11,
    programme: "Prosthetics and Orthotics",
    merit: 65.7,
    states: { osun: 65.4, oyo: 63.4, ondo: 60.1, ogun: 62.4, ekiti: 63.7, lagos: 61.5 },
    faculty: "Allied Health Sciences"
  },
  {
    sn: 12,
    programme: "Environmental Health Science",
    merit: 59.3,
    states: { osun: 57.7, oyo: 58.2, ondo: 52.2, ogun: 51.6, ekiti: 56.0, lagos: 54.1 },
    faculty: "Public Health Sciences"
  },
  {
    sn: 13,
    programme: "Pharmacology",
    merit: 64.6,
    states: { osun: 63.4, oyo: 63.0, ondo: 60.8, ogun: 62.9, ekiti: 61.5, lagos: 56.2 },
    faculty: "Basic Medical Sciences"
  }
];

export const getFUHSIFaculties = (): string[] => {
  const faculties = new Set(FUHSI_CUTOFFS_2026_2027.map(item => item.faculty));
  return Array.from(faculties);
};

export const getFUHSICutoffByCourse = (courseName: string): FUHSICutoffProgramme | null => {
  const query = courseName.toLowerCase().trim();
  const match = FUHSI_CUTOFFS_2026_2027.find(item => 
    item.programme.toLowerCase().includes(query) || query.includes(item.programme.toLowerCase())
  );
  return match || null;
};
