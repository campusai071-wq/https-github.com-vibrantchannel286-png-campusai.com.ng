/**
 * Official University of Ibadan (UI) Undergraduate Admissions Unit
 * 2025/2026 Admission Exercise: Departmental Cut Off Marks
 * 
 * Verified against official university publication.
 */

export interface UICutoffProgramme {
  faculty: string;
  programme: string;
  merit: number;
  catchment: number;
  elds: number;
}

export const UI_SESSION = "2025/2026";
export const UI_INSTITUTION_NAME = "University of Ibadan (UI)";

export const UI_CUTOFFS_2025_2026: UICutoffProgramme[] = [
  // ── Faculty of Agriculture ──
  { faculty: "Agriculture", programme: "Agric. Economics", merit: 51.375, catchment: 51.375, elds: 51.375 },
  { faculty: "Agriculture", programme: "Agric. Extension and Rural Devel.", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Agriculture", programme: "Crop and Horticultural Sciences", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Agriculture", programme: "Soil Resources Management", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Agriculture", programme: "Animal Science", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Agriculture", programme: "Crop Protection and Environmental Biology", merit: 50, catchment: 50, elds: 50 },

  // ── Faculty of Arts ──
  { faculty: "Arts", programme: "Anthropology", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Arabic Language and Literature", merit: 53.5, catchment: 53.5, elds: 53.5 },
  { faculty: "Arts", programme: "Archeaology", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Classical Studies", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Communication and Language Arts", merit: 61, catchment: 61, elds: 58.5 },
  { faculty: "Arts", programme: "European Studies - French", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "European Studies- German", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "European Studies- Russian", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "English", merit: 56.5, catchment: 56.5, elds: 53.375 },
  { faculty: "Arts", programme: "History", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Islamic Studies", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Linguistics", merit: 56.875, catchment: 56.875, elds: 56.875 },
  { faculty: "Arts", programme: "Linguistics- Igbo", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Linguistics- Yoruba", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Music", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Philosophy", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Religious Studies", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Arts", programme: "Theatre Arts", merit: 56, catchment: 56, elds: 52.25 },

  // ── College of Medicine ──
  { faculty: "College of Medicine", programme: "Biochemistry", merit: 53.125, catchment: 53.125, elds: 53.125 },
  { faculty: "College of Medicine", programme: "Dentistry", merit: 68.625, catchment: 68.625, elds: 66.75 },
  { faculty: "College of Medicine", programme: "Environmental Health Science", merit: 51.25, catchment: 51.25, elds: 51.25 },
  { faculty: "College of Medicine", programme: "Human Nutrition and Dietetics", merit: 55.625, catchment: 55.625, elds: 52.25 },
  { faculty: "College of Medicine", programme: "Medical Laboratory Science", merit: 63.25, catchment: 63.25, elds: 60.25 },
  { faculty: "College of Medicine", programme: "Medicine and Surgery", merit: 78.875, catchment: 78.875, elds: 77.375 },
  { faculty: "College of Medicine", programme: "Nursing Science", merit: 71.375, catchment: 71.375, elds: 67.875 },
  { faculty: "College of Medicine", programme: "Physiology", merit: 55.75, catchment: 55.75, elds: 55.5 },
  { faculty: "College of Medicine", programme: "Physiotherapy", merit: 65.125, catchment: 65.125, elds: 61.625 },

  // ── Faculty of Computing ──
  { faculty: "Computing", programme: "Computer Science", merit: 63.5, catchment: 63.5, elds: 53.5 },

  // ── Faculty of Economics & Management Science ──
  { faculty: "Economics & Mgt Science", programme: "Economics", merit: 58.125, catchment: 58.125, elds: 53.625 },
  { faculty: "Economics & Mgt Science", programme: "Accounting", merit: 68.5, catchment: 68.5, elds: 66.125 },
  { faculty: "Economics & Mgt Science", programme: "Banking and Finance", merit: 51.875, catchment: 51.875, elds: 51.875 },
  { faculty: "Economics & Mgt Science", programme: "Marketing and Consumer Studies", merit: 50.875, catchment: 50.875, elds: 50.875 },

  // ── Faculty of Education ──
  { faculty: "Education", programme: "Adult Education", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Business Education", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Early Childhood Education", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Arabic Studies", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Biology", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Chemistry", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Religious Studies", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Communication and Lang Arts", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Economics", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and English", merit: 53.125, catchment: 53.125, elds: 52.25 },
  { faculty: "Education", programme: "Education and French", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Geography", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and History", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Islamic Studies", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Computer Science", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Educational Technology", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Mathematics", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Physics", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Political Science", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Education and Yoruba", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Educational Management", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Guidance and Counselling", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Health Education", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Human Kinetics", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Library, Archival and Information Studies", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Education", programme: "Special Education", merit: 50, catchment: 50, elds: 50 },

  // ── Faculty of Environmental Design Management ──
  { faculty: "Environmental Design Mgt", programme: "Architecture", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Environmental Design Mgt", programme: "Estate Management", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Environmental Design Mgt", programme: "Urban and Regional Planning", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Environmental Design Mgt", programme: "Quantity Surveying", merit: 50, catchment: 50, elds: 50 },

  // ── Faculty of Law ──
  { faculty: "Law", programme: "Law", merit: 70.875, catchment: 70.875, elds: 67.625 },

  // ── Faculty of Pharmacy ──
  { faculty: "Pharmacy", programme: "Pharmacy", merit: 69.125, catchment: 69.125, elds: 62.875 },

  // ── Faculty of Renewable Natural Resources ──
  { faculty: "Renewable Natural Resources", programme: "Aquaculture and Fisheries Management", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Renewable Natural Resources", programme: "Forest Production & Products", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Renewable Natural Resources", programme: "Wildlife & Ecotourism Management", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Renewable Natural Resources", programme: "Social and Environmental Forestry", merit: 50, catchment: 50, elds: 50 },

  // ── Faculty of Science ──
  { faculty: "Science", programme: "Anthropology", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Science", programme: "Archeaology", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Science", programme: "Botany", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Science", programme: "Chemistry", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Science", programme: "Geography", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Science", programme: "Geology", merit: 51, catchment: 51, elds: 51 },
  { faculty: "Science", programme: "Industrial Chemistry", merit: 51, catchment: 51, elds: 51 },
  { faculty: "Science", programme: "Mathematics", merit: 51, catchment: 51, elds: 51 },
  { faculty: "Science", programme: "Microbiology", merit: 50.5, catchment: 50.5, elds: 50.5 },
  { faculty: "Science", programme: "Physics", merit: 51, catchment: 51, elds: 51 },
  { faculty: "Science", programme: "Statistics", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Science", programme: "Zoology", merit: 50, catchment: 50, elds: 50 },

  // ── Faculty of Social Sciences ──
  { faculty: "Social Sciences", programme: "Geography", merit: 50, catchment: 50, elds: 50 },
  { faculty: "Social Sciences", programme: "Political Science", merit: 55.375, catchment: 55.375, elds: 55.375 },
  { faculty: "Social Sciences", programme: "Psychology", merit: 54.5, catchment: 54.5, elds: 54.5 },
  { faculty: "Social Sciences", programme: "Sociology", merit: 51, catchment: 51, elds: 51 },

  // ── Faculty of Technology ──
  { faculty: "Technology", programme: "Agricultural and Environmental Engineering", merit: 56.875, catchment: 56.875, elds: 56.875 },
  { faculty: "Technology", programme: "Civil Engineering", merit: 63.25, catchment: 63.25, elds: 57 },
  { faculty: "Technology", programme: "Electrical and Electronics Engineering", merit: 70, catchment: 70, elds: 58.875 },
  { faculty: "Technology", programme: "Food Technology", merit: 51.125, catchment: 51.125, elds: 51.125 },
  { faculty: "Technology", programme: "Industrial and Production Engineering", merit: 51.625, catchment: 51.625, elds: 51.625 },
  { faculty: "Technology", programme: "Biomedical Engineering", merit: 55.375, catchment: 55.375, elds: 55.375 },
  { faculty: "Technology", programme: "Mechanical Engineering", merit: 70.5, catchment: 70.5, elds: 60.125 },
  { faculty: "Technology", programme: "Petroleum Engineering", merit: 62.75, catchment: 62.75, elds: 57.125 },
  { faculty: "Technology", programme: "Wood Products Engineering", merit: 51, catchment: 51, elds: 51 },
  { faculty: "Technology", programme: "Automotive Engineering", merit: 51.5, catchment: 51.5, elds: 51.5 },

  // ── Faculty of Veterinary Medicine ──
  { faculty: "Veterinary Medicine", programme: "Veterinary Medicine", merit: 57.125, catchment: 57.125, elds: 57.125 }
];

/**
 * Helper lookup functions for University of Ibadan Cut Offs
 */
export function getUICutoffByCourse(courseName: string): UICutoffProgramme | undefined {
  if (!courseName) return undefined;
  const clean = courseName.trim().toLowerCase();

  // 1. Exact match
  const exact = UI_CUTOFFS_2025_2026.find(
    item => item.programme.toLowerCase() === clean
  );
  if (exact) return exact;

  // 2. Normalized aliases
  const aliasMap: Record<string, string> = {
    'medicine': 'Medicine and Surgery',
    'medicine & surgery': 'Medicine and Surgery',
    'mbbs': 'Medicine and Surgery',
    'nursing': 'Nursing Science',
    'computer science': 'Computer Science',
    'law': 'Law',
    'pharmacy': 'Pharmacy',
    'dentistry': 'Dentistry',
    'accounting': 'Accounting',
    'economics': 'Economics',
    'mechanical engineering': 'Mechanical Engineering',
    'mech eng': 'Mechanical Engineering',
    'electrical engineering': 'Electrical and Electronics Engineering',
    'electrical and electronics engineering': 'Electrical and Electronics Engineering',
    'eee': 'Electrical and Electronics Engineering',
    'civil engineering': 'Civil Engineering',
    'petroleum engineering': 'Petroleum Engineering',
    'medical lab': 'Medical Laboratory Science',
    'medical laboratory science': 'Medical Laboratory Science',
    'mls': 'Medical Laboratory Science',
    'physiotherapy': 'Physiotherapy',
    'biochemistry': 'Biochemistry',
    'physiology': 'Physiology',
    'human nutrition': 'Human Nutrition and Dietetics',
    'human nutrition and dietetics': 'Human Nutrition and Dietetics',
    'cla': 'Communication and Language Arts',
    'communication and language arts': 'Communication and Language Arts',
    'vet med': 'Veterinary Medicine',
    'veterinary medicine': 'Veterinary Medicine',
    'microbiology': 'Microbiology',
    'political science': 'Political Science',
    'sociology': 'Sociology',
    'theatre arts': 'Theatre Arts'
  };

  if (aliasMap[clean]) {
    const found = UI_CUTOFFS_2025_2026.find(
      item => item.programme.toLowerCase() === aliasMap[clean].toLowerCase()
    );
    if (found) return found;
  }

  // 3. Substring match
  return UI_CUTOFFS_2025_2026.find(
    item => item.programme.toLowerCase().includes(clean) || clean.includes(item.programme.toLowerCase())
  );
}

/**
 * Get all unique faculties in UI
 */
export function getUIFaculties(): string[] {
  return Array.from(new Set(UI_CUTOFFS_2025_2026.map(item => item.faculty)));
}

/**
 * Get all programmes under a specific faculty
 */
export function getUIProgrammesByFaculty(faculty: string): UICutoffProgramme[] {
  return UI_CUTOFFS_2025_2026.filter(
    item => item.faculty.toLowerCase() === faculty.toLowerCase()
  );
}
