/**
 * Yaba College of Technology (YABATECH) National Diploma (Full-Time)
 * 2026/2027 Admissions Merit & Catchment/State Score Sheet
 */

export interface YabatechCutoffProgramme {
  sNo: number;
  programme: string;
  meritScore: number;
  ekiti?: number;
  lagos?: number;
  ogun?: number;
  ondo?: number;
  osun?: number;
  oyo?: number;
}

export const YABATECH_SESSION = "2026/2027";
export const YABATECH_INSTITUTION_NAME = "Yaba College of Technology (YABATECH)";

export const YABATECH_CUTOFFS_2026_2027: YabatechCutoffProgramme[] = [
  { sNo: 1, programme: "ND Accountancy", meritScore: 63.10, ekiti: 52.00, lagos: 61.75, ogun: 61.75, ondo: 59.85, osun: 61.00, oyo: 60.75 },
  { sNo: 2, programme: "ND Agricultural & Bio-Environmental Engineering", meritScore: 52.50, ekiti: 48.00, lagos: 51.00, ogun: 51.50, ondo: 49.50, osun: 50.00, oyo: 50.50 },
  { sNo: 3, programme: "ND Agricultural Technology", meritScore: 52.15, ekiti: 48.00, lagos: 50.50, ogun: 51.00, ondo: 49.00, osun: 49.50, oyo: 50.00 },
  { sNo: 4, programme: "ND Architectural", meritScore: 57.00, ekiti: 53.00, lagos: 55.50, ogun: 56.00, ondo: 54.00, osun: 54.50, oyo: 55.00 },
  { sNo: 5, programme: "ND Banking & Finance", meritScore: 58.30, ekiti: 54.10, lagos: 50.55, ogun: 53.05, ondo: 54.85, osun: 52.90, oyo: 55.10 },
  { sNo: 6, programme: "ND Building Technology", meritScore: 55.95, ekiti: 52.00, lagos: 54.50, ogun: 55.00, ondo: 53.00, osun: 53.50, oyo: 54.00 },
  { sNo: 7, programme: "ND Business Administration & Management", meritScore: 62.95, ekiti: 57.80, lagos: 61.35, ogun: 62.35, ondo: 60.10, osun: 60.20, oyo: 61.85 },
  { sNo: 8, programme: "ND Chemical Engineering", meritScore: 54.50, ekiti: 51.00, lagos: 53.00, ogun: 53.50, ondo: 52.00, osun: 52.50, oyo: 53.00 },
  { sNo: 9, programme: "ND Civil Engineering", meritScore: 59.60, ekiti: 54.15, lagos: 58.05, ogun: 57.95, ondo: 54.30, osun: 55.45, oyo: 55.95 },
  { sNo: 10, programme: "ND Computer Engineering", meritScore: 61.10, ekiti: 55.65, lagos: 59.20, ogun: 59.95, ondo: 59.10, osun: 58.95, oyo: 59.30 },
  { sNo: 11, programme: "ND Computer Science", meritScore: 63.25, ekiti: 59.85, lagos: 61.90, ogun: 61.85, ondo: 61.20, osun: 61.45, oyo: 61.65 },
  { sNo: 12, programme: "ND Electrical & Electronics Engineering", meritScore: 62.10, ekiti: 57.75, lagos: 60.55, ogun: 61.50, ondo: 58.05, osun: 59.90, oyo: 59.95 },
  { sNo: 13, programme: "ND Estate Management", meritScore: 51.40, ekiti: 48.00, lagos: 50.00, ogun: 50.50, ondo: 49.00, osun: 49.50, oyo: 50.00 },
  { sNo: 14, programme: "ND Fashion Design", meritScore: 58.20, ekiti: 54.00, lagos: 57.00, ogun: 57.50, ondo: 55.50, osun: 56.00, oyo: 56.50 },
  { sNo: 15, programme: "ND Food Science & Technology", meritScore: 55.25, ekiti: 51.50, lagos: 54.00, ogun: 54.50, ondo: 53.00, osun: 53.50, oyo: 54.00 },
  { sNo: 16, programme: "ND General Art", meritScore: 51.85, ekiti: 48.50, lagos: 50.50, ogun: 51.00, ondo: 49.50, osun: 50.00, oyo: 50.50 },
  { sNo: 17, programme: "ND Hospitality Management", meritScore: 52.65, ekiti: 49.00, lagos: 51.50, ogun: 52.00, ondo: 50.00, osun: 50.50, oyo: 51.00 },
  { sNo: 18, programme: "ND Industrial Maintenance Engineering", meritScore: 52.80, ekiti: 49.00, lagos: 51.50, ogun: 52.00, ondo: 50.00, osun: 50.50, oyo: 51.00 },
  { sNo: 19, programme: "ND Tourism Management Technology", meritScore: 51.00, ekiti: 47.50, lagos: 50.00, ogun: 50.00, ondo: 48.50, osun: 49.00, oyo: 49.50 },
  { sNo: 20, programme: "ND Library & Information Science", meritScore: 61.35, ekiti: 57.55, lagos: 59.70, ogun: 60.10, ondo: 58.00, osun: 59.90, oyo: 60.70 },
  { sNo: 21, programme: "ND Marine Engineering", meritScore: 51.05, ekiti: 47.50, lagos: 50.00, ogun: 50.00, ondo: 48.50, osun: 49.00, oyo: 49.50 },
  { sNo: 22, programme: "ND Marketing", meritScore: 60.45, ekiti: 55.30, lagos: 59.20, ogun: 58.90, ondo: 55.40, osun: 51.85, oyo: 56.95 },
  { sNo: 23, programme: "ND Mass Communication", meritScore: 66.20, ekiti: 61.35, lagos: 64.10, ogun: 64.35, ondo: 62.20, osun: 64.05, oyo: 64.65 },
  { sNo: 24, programme: "ND Mechanical Engineering", meritScore: 59.90, ekiti: 55.85, lagos: 58.75, ogun: 58.55, ondo: 54.20, osun: 56.65, oyo: 56.35 },
  { sNo: 25, programme: "ND Mechatronics Engineering", meritScore: 57.30, ekiti: 53.50, lagos: 56.00, ogun: 56.50, ondo: 54.50, osun: 55.00, oyo: 55.50 },
  { sNo: 26, programme: "ND Metallurgical Engineering", meritScore: 52.30, ekiti: 48.50, lagos: 51.00, ogun: 51.50, ondo: 49.50, osun: 50.00, oyo: 50.50 },
  { sNo: 27, programme: "ND Mineral and Petroleum Engineering", meritScore: 52.80, ekiti: 49.00, lagos: 51.50, ogun: 52.00, ondo: 50.00, osun: 50.50, oyo: 51.00 },
  { sNo: 28, programme: "ND Nutrition & Dietetics", meritScore: 59.55, ekiti: 55.00, lagos: 58.00, ogun: 58.50, ondo: 56.50, osun: 57.00, oyo: 57.50 },
  { sNo: 29, programme: "ND Office Technology & Management", meritScore: 59.10, ekiti: 54.50, lagos: 57.50, ogun: 58.00, ondo: 56.00, osun: 56.50, oyo: 57.00 },
  { sNo: 30, programme: "ND Photography", meritScore: 59.60, ekiti: 56.55, lagos: 57.95, ogun: 57.70, ondo: 51.55, osun: 57.15, oyo: 56.45 },
  { sNo: 31, programme: "ND Polymer Technology", meritScore: 53.65, ekiti: 50.00, lagos: 52.50, ogun: 53.00, ondo: 51.00, osun: 51.50, oyo: 52.00 },
  { sNo: 32, programme: "ND Printing Technology", meritScore: 56.50, ekiti: 52.50, lagos: 55.00, ogun: 55.50, ondo: 53.50, osun: 54.00, oyo: 54.50 },
  { sNo: 33, programme: "ND Public Administration", meritScore: 61.10, ekiti: 58.90, lagos: 54.25, ogun: 54.50, ondo: 56.95, osun: 59.95, oyo: 59.10 },
  { sNo: 34, programme: "ND Quantity Surveying", meritScore: 51.60, ekiti: 48.00, lagos: 50.50, ogun: 51.00, ondo: 49.00, osun: 49.50, oyo: 50.00 },
  { sNo: 35, programme: "ND Railway Engineering", meritScore: 56.80, ekiti: 53.00, lagos: 55.50, ogun: 56.00, ondo: 54.00, osun: 54.50, oyo: 55.00 },
  { sNo: 36, programme: "ND Science Laboratory Technology", meritScore: 62.30, ekiti: 59.40, lagos: 60.85, ogun: 61.45, ondo: 60.50, osun: 60.55, oyo: 60.95 },
  { sNo: 37, programme: "ND Statistics", meritScore: 51.30, ekiti: 48.00, lagos: 50.00, ogun: 50.50, ondo: 49.00, osun: 49.50, oyo: 50.00 },
  { sNo: 38, programme: "ND Taxation", meritScore: 56.90, ekiti: 53.00, lagos: 55.50, ogun: 56.00, ondo: 54.00, osun: 54.50, oyo: 55.00 },
  { sNo: 39, programme: "ND Transport Planning & Mgt.", meritScore: 52.35, ekiti: 48.50, lagos: 51.00, ogun: 51.50, ondo: 49.50, osun: 50.00, oyo: 50.50 },
  { sNo: 40, programme: "ND Surveying & Geo-Informatics", meritScore: 50.80, ekiti: 47.00, lagos: 49.50, ogun: 50.00, ondo: 48.00, osun: 48.50, oyo: 49.00 },
  { sNo: 41, programme: "ND Textile Technology", meritScore: 53.60, ekiti: 50.00, lagos: 52.50, ogun: 53.00, ondo: 51.00, osun: 51.50, oyo: 52.00 },
  { sNo: 42, programme: "ND Urban & Regional Planning", meritScore: 50.40, ekiti: 47.00, lagos: 49.50, ogun: 50.00, ondo: 48.00, osun: 48.50, oyo: 49.00 },
  { sNo: 43, programme: "ND Welding & Fabrication", meritScore: 51.85, ekiti: 48.50, lagos: 50.50, ogun: 51.00, ondo: 49.50, osun: 50.00, oyo: 50.50 }
];

export const getYabatechCutoffByCourse = (courseName: string): YabatechCutoffProgramme | null => {
  const query = courseName.toLowerCase().trim().replace(/^nd\s*/, '');
  const match = YABATECH_CUTOFFS_2026_2027.find(item => {
    const cleanProg = item.programme.toLowerCase().replace(/^nd\s*/, '');
    return cleanProg.includes(query) || query.includes(cleanProg);
  });
  return match || null;
};
