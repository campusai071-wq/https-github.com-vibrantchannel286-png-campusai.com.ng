
export interface UniversityData {
  name: string;
  founded: string;
  motto: string;
  bestKnownFor: string;
  campusVibe: string;
  facultyStudentRatio: string;
  researchOutput: string;
  facilities: string[];
  scoringSystem: {
    hasJamb: boolean;
    hasPostUtme: boolean;
    hasOLevel: boolean;
    explanation: string;
  };
  courses: string[];
}

export const UNIVERSITIES_DB: Record<string, UniversityData> = {
  "University of Lagos": {
    name: "University of Lagos",
    founded: "1962",
    motto: "In Deed and in Truth",
    bestKnownFor: "Engineering, Law, and Business. Known as the 'University of First Choice'.",
    campusVibe: "Cosmopolitan, vibrant, and highly competitive. Located in the heart of Lagos.",
    facultyStudentRatio: "1:35",
    researchOutput: "High - Leading in medical and environmental research in Nigeria.",
    facilities: ["Main Library", "Unilag Radio", "Medical Center", "Sport Center"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: true,
      explanation: "UNILAG uses a 50:30:20 ratio. 50% from JAMB, 30% from Post-UTME, and 20% from O-Level results (5 subjects)."
    },
    courses: [
      "Accounting", "Actuarial Science", "Architecture", "Business Administration", 
      "Civil Engineering", "Computer Science", "Economics", "Law", "Medicine and Surgery",
      "Mechanical Engineering", "Pharmacy", "Psychology", "Systems Engineering"
    ]
  },
  "University of Ibadan": {
    name: "University of Ibadan",
    founded: "1948",
    motto: "Recte Sapere Fons (To think straight is the fount of knowledge)",
    bestKnownFor: "Medicine, Arts, Law, Pharmacy, Engineering, and Post-graduate studies. Nigeria's premier university.",
    campusVibe: "Academic, serene, and traditional. Strong emphasis on research and excellence.",
    facultyStudentRatio: "1:25",
    researchOutput: "Very High - The leading research institution in West Africa.",
    facilities: ["Kenneth Dike Library", "UI Zoo", "Botanical Garden", "University Health Service"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: false,
      explanation: "UI uses a 50:50 formula: (JAMB Score / 8) + (Post-UTME / 2). 5 O-Level credit passes in 1 sitting required for key competitive courses."
    },
    courses: [
      "Medicine and Surgery", "Nursing Science", "Dentistry", "Pharmacy", "Physiotherapy",
      "Medical Laboratory Science", "Physiology", "Biochemistry", "Human Nutrition and Dietetics",
      "Environmental Health Science", "Law", "Computer Science", "Mechanical Engineering",
      "Electrical and Electronics Engineering", "Civil Engineering", "Petroleum Engineering",
      "Biomedical Engineering", "Agricultural and Environmental Engineering", "Industrial and Production Engineering",
      "Automotive Engineering", "Food Technology", "Wood Products Engineering", "Economics",
      "Accounting", "Banking and Finance", "Marketing and Consumer Studies", "Political Science",
      "Psychology", "Sociology", "Communication and Language Arts", "English", "Linguistics",
      "Theatre Arts", "Arabic Language and Literature", "History", "Philosophy", "Music",
      "Microbiology", "Geology", "Physics", "Industrial Chemistry", "Mathematics",
      "Botany", "Zoology", "Chemistry", "Statistics", "Architecture", "Urban and Regional Planning",
      "Estate Management", "Quantity Surveying", "Veterinary Medicine", "Agric. Economics",
      "Animal Science", "Crop and Horticultural Sciences", "Soil Resources Management", "Educational Management"
    ]
  },
  "Obafemi Awolowo University": {
    name: "Obafemi Awolowo University",
    founded: "1961",
    motto: "For Learning and Culture",
    bestKnownFor: "Architecture, ICT, and Agriculture. Known for its beautiful campus architecture.",
    campusVibe: "Intellectually stimulating, politically active, and culturally rich.",
    facultyStudentRatio: "1:30",
    researchOutput: "High - Strong focus on technology and indigenous knowledge.",
    facilities: ["Hezekiah Oluwasanmi Library", "OAU ICT Center", "Natural History Museum"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: true,
      explanation: "OAU uses a 50:10:40 formula: Weighted JAMB (50%), CBT Screening (10%) and O'Level points (40%)."
    },
    courses: [
      "Architecture", "Chemical Engineering", "Computer Science and Engineering", "Demography and Social Statistics",
      "International Relations", "Law", "Medicine and Surgery", "Music", "Philosophy", "Quantity Surveying"
    ]
  },
  "Ahmadu Bello University": {
    name: "Ahmadu Bello University",
    founded: "1962",
    motto: "The Strategic Hub of the North",
    bestKnownFor: "Architecture, Engineering, and Medicine. Largest university in Sub-Saharan Africa.",
    campusVibe: "Diverse, expansive, and academic. Strong pan-African identity.",
    facultyStudentRatio: "1:40",
    researchOutput: "High - Leading in agricultural and nuclear research.",
    facilities: ["Kashim Ibrahim Library", "ABU Teaching Hospital", "Nuclear Research Center"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: false,
      explanation: "ABU uses a 50:50 ratio between JAMB and Post-UTME screening."
    },
    courses: [
      "Accounting", "Agriculture", "Architecture", "Civil Engineering", "Fine Arts",
      "Geography", "History", "Medicine and Surgery", "Pharmacy", "Quantity Surveying", "Urban and Regional Planning"
    ]
  },
  "University of Nigeria, Nsukka": {
    name: "University of Nigeria, Nsukka",
    founded: "1960",
    motto: "To Restore the Dignity of Man",
    bestKnownFor: "Journalism, Pharmacy, and Engineering. First indigenous university in Nigeria.",
    campusVibe: "Resilient, traditional, and community-oriented. Strong 'Lions and Lionesses' spirit.",
    facultyStudentRatio: "1:35",
    researchOutput: "High - Strong focus on humanities and professional studies.",
    facilities: ["Nnamdi Azikiwe Library", "UNN Medical Center", "Roar Nigeria Hub"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: false,
      explanation: "UNN uses a 60:40 ratio (JAMB:Post-UTME) or 50:50 depending on the year's policy."
    },
    courses: [
      "Accountancy", "Banking and Finance", "Civil Engineering", "Electronic Engineering",
      "Estate Management", "Law", "Mass Communication", "Medicine and Surgery", "Pharmacy", "Public Administration"
    ]
  },
  "Federal University of Technology, Akure": {
    name: "Federal University of Technology, Akure",
    founded: "1981",
    motto: "Technology for Self-Reliance",
    bestKnownFor: "Engineering, Earth Sciences, Computing, and Agricultural Science. One of Nigeria's premier technology universities.",
    campusVibe: "Academic, highly competitive, and innovation-focused.",
    facultyStudentRatio: "1:28",
    researchOutput: "Very High - Leading in applied scientific research, engineering, and technology incubation.",
    facilities: ["FUTA Library", "FUTA ICT Center", "University Health Center", "School of Science Park"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: false,
      hasOLevel: true,
      explanation: "FUTA uses a point-based aggregate system with a 75:25 ratio. UTME score is weighted at 75% and O'Level results make up 25%."
    },
    courses: [
      "Accounting", "Agricultural and Environmental Engineering", "Agricultural and Resource Economics", 
      "Animal Production and Health", "Applied Geology", "Applied Geophysics", "Architecture", 
      "Biochemistry", "Biology", "Biotechnology", "Chemistry", "Civil Engineering", 
      "Computer Engineering", "Computer Science", "Cyber Security", "Electrical and Electronic Engineering", 
      "Estate Management", "Food Science and Technology", "Industrial and Production Engineering", 
      "Information Technology", "Mathematical Sciences", "Mechanical Engineering", 
      "Metallurgical and Materials Engineering", "Meteorology", "Microbiology", "Mining Engineering", 
      "Physics", "Quantity Surveying", "Software Engineering", "Statistics", "Urban and Regional Planning"
    ]
  },
  "Ogun State College of Nursing Sciences": {
    name: "Ogun State College of Nursing Sciences",
    founded: "2021",
    motto: "Excellence in Nursing Education",
    bestKnownFor: "Nursing and Midwifery education.",
    campusVibe: "Professional, focused, and healthcare-oriented.",
    facultyStudentRatio: "1:20",
    researchOutput: "Moderate - Clinical research focus.",
    facilities: ["Simulation Lab", "Demonstration Room", "Library"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: true,
      explanation: "Uses a competitive aggregate system standard for Colleges of Nursing."
    },
    courses: [
      "Midwifery (ND/HND)", "Nursing (ND/HND)", "Public Health Nursing (ND/HND)"
    ]
  },
  "University of Ilorin": {
    name: "University of Ilorin",
    founded: "1975",
    motto: "Probitas Doctrina (Character and Learning)",
    bestKnownFor: "Medicine, Law, Nursing, Engineering, Agriculture, and Accounting. Known as the 'Better by Far' University with consistent uninterrupted academic calendar.",
    campusVibe: "Disciplined, peaceful, and highly competitive. One of Nigeria's most applied-to universities.",
    facultyStudentRatio: "1:30",
    researchOutput: "High - Leading in clinical medical sciences, agricultural breakthroughs, and legal education.",
    facilities: ["UNILORIN Main Library", "University Teaching Hospital (UITH)", "UNILORIN CBT Center", "Research Sugar Research Institute"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: true,
      explanation: "UNILORIN uses a 50:30:20 aggregate formula: JAMB UTME Score (50%), CBT Post-UTME Screening (30%), and 5 relevant O'Level subject grades (20%). O'Level scale: A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0 (max 20 marks)."
    },
    courses: [
      "Medicine and Surgery", "Nursing Science", "Pharmacy", "Law", "Computer Science", "Accounting", 
      "Mechanical Engineering", "Civil Engineering", "Electrical and Electronics Engineering", 
      "Biomedical Engineering", "Chemical Engineering", "Agricultural and Biosystems Engineering",
      "Economics", "Mass Communication", "Medical Laboratory Science", "Biochemistry", "Microbiology", 
      "Agriculture", "Veterinary Medicine", "Physiology", "Anatomy", "Dentistry", "Finance", 
      "Business Administration", "Political Science", "Educational Management", "Sociology"
    ]
  },
  "University of Benin": {
    name: "University of Benin",
    founded: "1970",
    motto: "Knowledge for Service",
    bestKnownFor: "Engineering, Medicine, Pharmacy, and Law. Known as UNIBEST / Great UNIBEN.",
    campusVibe: "Vibrant, historic, and academically intense. Located in Ugbowo, Benin City.",
    facultyStudentRatio: "1:32",
    researchOutput: "High - Renowned for petroleum engineering, pharmacognosy, and medical specialties.",
    facilities: ["John Harris Library", "UBTH Teaching Hospital", "Center of Excellence in Geosciences"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: false,
      explanation: "UNIBEN uses a 50:50 formula: (JAMB Score / 8) + (Post-UTME / 2). Total aggregate is out of 100%."
    },
    courses: [
      "Medicine and Surgery", "Pharmacy", "Law", "Dentistry", "Nursing Science", "Mechanical Engineering",
      "Civil Engineering", "Petroleum Engineering", "Electrical/Electronics Engineering", "Computer Science",
      "Accounting", "Economics", "Business Administration", "Medical Laboratory Science", "Physiotherapy"
    ]
  },
  "Delta State University": {
    name: "Delta State University",
    founded: "1992",
    motto: "Knowledge, Character and Service",
    bestKnownFor: "Medicine, Law, Education, and Management Sciences.",
    campusVibe: "Energetic, state-of-the-art multi-campus environment centered in Abraka.",
    facultyStudentRatio: "1:30",
    researchOutput: "Moderate to High - Strong focus on regional healthcare and environmental science.",
    facilities: ["DELSU Main Library", "DELSU Teaching Hospital Oghara", "E-Learning Center"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: true,
      hasOLevel: false,
      explanation: "DELSU uses a 50:50 formula: (JAMB Score / 8) + (Post-UTME / 2). Total aggregate is out of 100%."
    },
    courses: [
      "Medicine and Surgery", "Law", "Nursing Science", "Pharmacy", "Medical Laboratory Science",
      "Accounting", "Business Administration", "Economics", "Computer Science", "Mass Communication"
    ]
  },
  "Federal University, Oye-Ekiti": {
    name: "Federal University, Oye-Ekiti",
    founded: "2011",
    motto: "Innovation and Character",
    bestKnownFor: "Agriculture, Engineering, Humanities, and Social Sciences. Highly competitive admission.",
    campusVibe: "Serene, academically rigorous, and rapidly expanding. Located in Ekiti State.",
    facultyStudentRatio: "1:32",
    researchOutput: "High - Noted for research in agricultural advancements, geology, and green energy.",
    facilities: ["Main Library", "FUOYE ICT Hub", "Research Farms", "Engineering Workshops"],
    scoringSystem: {
      hasJamb: true,
      hasPostUtme: false,
      hasOLevel: true,
      explanation: "FUOYE uses a 100-point Aggregate: JAMB UTME Score (60%) + O'Level Score (30%) + Sitting Bonus (10%)."
    },
    courses: [
      "Accounting", "Agricultural Science", "Architecture", "Biochemistry", "Civil Engineering", 
      "Computer Engineering", "Computer Science", "Criminology and Security Studies", "Economics", 
      "Electrical and Electronics Engineering", "English and Literary Studies", "Food Science and Technology", 
      "History and International Studies", "Law", "Mass Communication", "Medicine and Surgery", 
      "Mechanical Engineering", "Microbiology", "Nursing Science", "Pharmacy", "Political Science", 
      "Psychology", "Sociology", "Theatre and Media Arts"
    ]
  }
};

export const getUniversityFromDB = (name: string): UniversityData | null => {
  // Try exact match
  if (UNIVERSITIES_DB[name]) return UNIVERSITIES_DB[name];
  
  // Try fuzzy match (case insensitive and partial)
  const searchName = name.toLowerCase();
  const foundKey = Object.keys(UNIVERSITIES_DB).find(key => 
    key.toLowerCase().includes(searchName) || searchName.includes(key.toLowerCase())
  );
  
  return foundKey ? UNIVERSITIES_DB[foundKey] : null;
};
