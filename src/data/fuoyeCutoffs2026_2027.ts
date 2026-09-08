/**
 * Federal University Oye-Ekiti (FUOYE)
 * 2026/2027 Admission Merit Points
 */

export interface FuoyeCutoffProgramme {
  sn: number;
  programme: string;
  meritScore: number;
  faculty: string;
}

export const FUOYE_SESSION = "2026/2027";
export const FUOYE_INSTITUTION_NAME = "Federal University Oye-Ekiti (FUOYE)";

export const FUOYE_CUTOFFS_2026_2027: FuoyeCutoffProgramme[] = [
  // Agriculture
  { sn: 1, programme: "Agricultural Economics And Extension", meritScore: 55.5, faculty: "Agriculture" },
  { sn: 2, programme: "Animal Production And Health", meritScore: 54.3, faculty: "Agriculture" },
  { sn: 3, programme: "Crop Science and Horticulture", meritScore: 53.5, faculty: "Agriculture" },
  { sn: 4, programme: "Fisheries And Aquaculture", meritScore: 53.6, faculty: "Agriculture" },
  { sn: 5, programme: "Food Science And Technology", meritScore: 62.0, faculty: "Agriculture" },
  { sn: 6, programme: "Hospitality And Tourism Management", meritScore: 57.8, faculty: "Agriculture" },
  { sn: 7, programme: "Hospitality And Tourism Management (Alt)", meritScore: 54.3, faculty: "Agriculture" },
  { sn: 8, programme: "Water Resources Management & Agrometeorology", meritScore: 51.9, faculty: "Agriculture" },

  // Engineering & Technology
  { sn: 10, programme: "Computer Engineering", meritScore: 65.35, faculty: "Engineering" },
  { sn: 11, programme: "Electrical and Electronics Engineering", meritScore: 63.75, faculty: "Engineering" },
  { sn: 12, programme: "Information and Communication Engineering", meritScore: 59.1, faculty: "Engineering" },
  { sn: 13, programme: "Mechatronics Engineering", meritScore: 67.55, faculty: "Engineering" },
  { sn: 14, programme: "System Engineering", meritScore: 60.25, faculty: "Engineering" },
  { sn: 16, programme: "Agricultural Engineering", meritScore: 57.45, faculty: "Engineering" },
  { sn: 17, programme: "Civil Engineering", meritScore: 65.0, faculty: "Engineering" },
  { sn: 18, programme: "Materials and Metallurgical Engineering", meritScore: 58.55, faculty: "Engineering" },
  { sn: 19, programme: "Mechanical Engineering", meritScore: 64.45, faculty: "Engineering" },

  // Environmental Design
  { sn: 21, programme: "Architecture", meritScore: 59.6, faculty: "Environmental Design" },
  { sn: 22, programme: "Building", meritScore: 56.3, faculty: "Environmental Design" },
  { sn: 23, programme: "Estate Management", meritScore: 58.0, faculty: "Environmental Design" },
  { sn: 24, programme: "Quantity Surveying", meritScore: 57.85, faculty: "Environmental Design" },
  { sn: 25, programme: "Surveying and Geoinformatics", meritScore: 58.0, faculty: "Environmental Design" },
  { sn: 26, programme: "Urban and Regional Planning", meritScore: 54.5, faculty: "Environmental Design" },

  // Arts & Humanities
  { sn: 28, programme: "English And Literary Studies", meritScore: 62.55, faculty: "Arts" },
  { sn: 29, programme: "History And International Studies", meritScore: 63.75, faculty: "Arts" },
  { sn: 30, programme: "Linguistics and Languages", meritScore: 60.25, faculty: "Arts" },
  { sn: 31, programme: "Philosophy", meritScore: 57.3, faculty: "Arts" },
  { sn: 32, programme: "Religious Studies", meritScore: 52.95, faculty: "Arts" },
  { sn: 33, programme: "Theatre And Media Arts", meritScore: 63.45, faculty: "Arts" },

  // Communication & Media Studies
  { sn: 35, programme: "Broadcasting", meritScore: 61.05, faculty: "Communication & Media Studies" },
  { sn: 36, programme: "Journalism and Media Studies", meritScore: 61.2, faculty: "Communication & Media Studies" },
  { sn: 37, programme: "Mass Communication", meritScore: 66.75, faculty: "Communication & Media Studies" },
  { sn: 38, programme: "Public Relations", meritScore: 61.05, faculty: "Communication & Media Studies" },

  // Management Sciences
  { sn: 40, programme: "Accounting", meritScore: 67.3, faculty: "Management Sciences" },
  { sn: 41, programme: "Banking and Finance", meritScore: 62.15, faculty: "Management Sciences" },
  { sn: 42, programme: "Business Administration", meritScore: 65.7, faculty: "Management Sciences" },
  { sn: 43, programme: "Public Administration", meritScore: 59.2, faculty: "Management Sciences" },

  // Medicine & Health Sciences
  { sn: 45, programme: "Doctor of Pharmacy", meritScore: 76.95, faculty: "Pharmacy" },
  { sn: 47, programme: "Medicine & Surgery", meritScore: 81.4, faculty: "Basic Medical Sciences" },
  { sn: 49, programme: "Nursing", meritScore: 75.85, faculty: "Nursing Science" },
  { sn: 51, programme: "Medical Laboratory Science", meritScore: 73.95, faculty: "Allied Health Sciences" },
  { sn: 52, programme: "Radiography and Radiation Science", meritScore: 75.55, faculty: "Allied Health Sciences" },
  { sn: 53, programme: "Anatomy", meritScore: 67.1, faculty: "Basic Medical Sciences" },
  { sn: 54, programme: "Physiology", meritScore: 67.2, faculty: "Basic Medical Sciences" },

  // Education
  { sn: 56, programme: "Agricultural Education", meritScore: 51.85, faculty: "Education" },
  { sn: 57, programme: "Adult Education", meritScore: 53.7, faculty: "Education" },
  { sn: 58, programme: "Biology Education", meritScore: 56.3, faculty: "Education" },
  { sn: 59, programme: "Business Education", meritScore: 58.6, faculty: "Education" },
  { sn: 60, programme: "Chemistry Education", meritScore: 55.5, faculty: "Education" },
  { sn: 61, programme: "Educational Technology", meritScore: 51.5, faculty: "Education" },
  { sn: 62, programme: "Educational Management", meritScore: 50.55, faculty: "Education" },
  { sn: 63, programme: "Health Education", meritScore: 57.1, faculty: "Education" },
  { sn: 64, programme: "Human Kinetics", meritScore: 56.4, faculty: "Education" },
  { sn: 65, programme: "Library And Information Science", meritScore: 58.5, faculty: "Education" },
  { sn: 66, programme: "Mathematics Education", meritScore: 46.45, faculty: "Education" },
  { sn: 67, programme: "Physics Education", meritScore: 51.7, faculty: "Education" },
  { sn: 68, programme: "Economics Education", meritScore: 58.35, faculty: "Education" },
  { sn: 69, programme: "English Language Education", meritScore: 58.45, faculty: "Education" },
  { sn: 70, programme: "Guidance And Counseling", meritScore: 55.95, faculty: "Education" },
  { sn: 71, programme: "Primary Education", meritScore: 50.05, faculty: "Education" },

  // Sciences
  { sn: 73, programme: "Animal and Environmental Biology", meritScore: 56.2, faculty: "Sciences" },
  { sn: 74, programme: "Biochemistry", meritScore: 62.65, faculty: "Sciences" },
  { sn: 75, programme: "Environmental Management and Toxicology", meritScore: 60.1, faculty: "Sciences" },
  { sn: 76, programme: "Microbiology", meritScore: 62.0, faculty: "Sciences" },
  { sn: 77, programme: "Plant Science and Biotechnology", meritScore: 57.05, faculty: "Sciences" },
  { sn: 79, programme: "Computer Science", meritScore: 65.2, faculty: "Computing & Statistics" },
  { sn: 80, programme: "Cyber Security", meritScore: 61.45, faculty: "Computing & Statistics" },
  { sn: 81, programme: "Data Science And Analytics", meritScore: 57.7, faculty: "Computing & Statistics" },
  { sn: 82, programme: "Software Engineering", meritScore: 62.0, faculty: "Computing & Statistics" },
  { sn: 84, programme: "Chemistry", meritScore: 57.65, faculty: "Sciences" },
  { sn: 85, programme: "Geology", meritScore: 58.0, faculty: "Sciences" },
  { sn: 86, programme: "Geophysics", meritScore: 51.75, faculty: "Sciences" },
  { sn: 87, programme: "Industrial Chemistry", meritScore: 55.25, faculty: "Sciences" },
  { sn: 88, programme: "Mathematics", meritScore: 55.0, faculty: "Sciences" },
  { sn: 89, programme: "Physics", meritScore: 52.35, faculty: "Sciences" },
  { sn: 90, programme: "Statistics", meritScore: 58.1, faculty: "Sciences" },

  // Social Sciences
  { sn: 92, programme: "Criminology and Security Studies", meritScore: 68.15, faculty: "Social Sciences" },
  { sn: 93, programme: "Demography and Social Statistics", meritScore: 53.55, faculty: "Social Sciences" },
  { sn: 94, programme: "Economics", meritScore: 63.7, faculty: "Social Sciences" },
  { sn: 95, programme: "Peace And Conflict Studies", meritScore: 59.85, faculty: "Social Sciences" },
  { sn: 96, programme: "Political Science", meritScore: 62.3, faculty: "Social Sciences" },
  { sn: 97, programme: "Psychology", meritScore: 58.15, faculty: "Social Sciences" },
  { sn: 98, programme: "Sociology", meritScore: 61.0, faculty: "Social Sciences" }
];

export const getFuoyeCutoffByCourse = (courseName: string): FuoyeCutoffProgramme | null => {
  const query = courseName.toLowerCase().trim();
  const match = FUOYE_CUTOFFS_2026_2027.find(item => {
    const cleanProg = item.programme.toLowerCase();
    return cleanProg.includes(query) || query.includes(cleanProg);
  });
  return match || null;
};
