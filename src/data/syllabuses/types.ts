export interface SyllabusTopic {
  id: string;
  topicNumber: number | string;
  title: string;
  contents: string[];
  objectives: string[];
}

export interface SyllabusSection {
  id: string;
  sectionCode?: string;
  title: string;
  topics: SyllabusTopic[];
}

export interface UTMETextbook {
  author: string;
  year?: string;
  title: string;
  publisher?: string;
  edition?: string;
  location?: string;
}

export interface UTMESyllabus {
  id: string; // e.g. "chemistry", "crs", "commerce", "computer_studies", "economics", "french", "geography", "government", "biology", "agriculture", "art", "arabic"
  subject: string;
  category: 'Science' | 'Arts' | 'Social Science' | 'Commercial';
  generalObjectives: string[];
  sections?: SyllabusSection[];
  topics?: SyllabusTopic[];
  recommendedTexts: UTMETextbook[];
  lastUpdated: string;
}
