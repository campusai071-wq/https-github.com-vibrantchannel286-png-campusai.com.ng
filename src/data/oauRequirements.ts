export interface OAURequirement {
  faculty: string;
  course: string;
  utmeRequirements: string;
  olevelRequirements: string;
  directEntryRequirements: string;
}

export const OAU_REQUIREMENTS: OAURequirement[] = [
  // FACULTY OF PHARMACY
  {
    faculty: "Pharmacy",
    course: "Pharmacy",
    utmeRequirements: "English, Physics, Chemistry and Biology",
    olevelRequirements: "English Language, Mathematics, Physics, Chemistry and Biology",
    directEntryRequirements: "B.Sc. with a minimum of 2:2 in Biochemistry, Microbiology, Industrial Chemistry, Food Science & Technology"
  },
  // COLLEGE OF HEALTH SCIENCES
  {
    faculty: "College of Health Sciences",
    course: "Medicine and Surgery",
    utmeRequirements: "English, Physics, Chemistry and Biology",
    olevelRequirements: "English Language, Mathematics, Physics, Chemistry and Biology",
    directEntryRequirements: "(i) B.Sc. with a minimum of 2:1 in Biology, Chemistry, Anatomy, Biochemistry, Physiology and other Biological Sciences in which their student take exactly the same courses in their first year as first year student of Medicine and Dentistry. (ii) 3 A'level passes in Biology, Chemistry, Physics"
  },
  {
    faculty: "College of Health Sciences",
    course: "Dentistry",
    utmeRequirements: "English, Physics, Chemistry and Biology",
    olevelRequirements: "English Language, Mathematics, Physics, Chemistry and Biology",
    directEntryRequirements: "(i) B.Sc. with a minimum of 2:1 in Biology, Microbiology, Anatomy, Biochemistry, Physiology and other Biological Sciences in which their student take exactly the same courses in their first year as first year student of Medicine and Dentistry. (ii) 3 A'level passes in Biology, Chemistry, Physics"
  },
  {
    faculty: "College of Health Sciences",
    course: "Nursing",
    utmeRequirements: "English, Physics, Chemistry and Biology",
    olevelRequirements: "English Language, Mathematics, Physics, Chemistry and Biology",
    directEntryRequirements: "(i) B.Sc. with a minimum of 2:1 in Biology, Microbiology, Anatomy, Biochemistry, Physiology and other Biological Sciences in which their student take exactly the same courses in their first year as first year student of Medicine and Dentistry. (ii) 3 A'level passes in Biology, Chemistry, Physics"
  },
  {
    faculty: "College of Health Sciences",
    course: "Medical Rehabilitation",
    utmeRequirements: "English, Physics, Chemistry and Biology",
    olevelRequirements: "English Language, Mathematics, Physics, Chemistry and Biology",
    directEntryRequirements: "(i) B.Sc. with a minimum of 2:1 in Biology, Microbiology, Anatomy, Biochemistry, Physiology and other Biological Sciences in which their student take exactly the same courses in their first year as first year student of Medicine and Dentistry. (ii) 3 A'level passes in Biology, Chemistry, Physics"
  },
  // FACULTY OF TECHNOLOGY
  {
    faculty: "Faculty of Technology",
    course: "Electronic and Electrical Engineering",
    utmeRequirements: "English Language, Chemistry, Physics and Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Mechanical Engineering",
    utmeRequirements: "English, Chemistry, Physics and Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Civil Engineering",
    utmeRequirements: "English, Chemistry, Physics and Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Chemical Engineering",
    utmeRequirements: "English, Chemistry, Physics and Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Metallurgical and Materials Engineering",
    utmeRequirements: "English, Chemistry, Physics and Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Food Engineering/Food Science & Technology",
    utmeRequirements: "English, Chemistry, Physics and Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Agricultural & Environmental Engineering",
    utmeRequirements: "English, Chemistry, Physics and Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Computer Engineering",
    utmeRequirements: "English, Chemistry, Physics and Maths",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric./Economics/Further Mathematics",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Computer Science with Mathematics",
    utmeRequirements: "English, Chemistry, Physics and Maths",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Computer Science with Economics",
    utmeRequirements: "English, Chemistry, Physics and Maths",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science/Economics/Geography/Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  {
    faculty: "Faculty of Technology",
    course: "Aerospace Engineering",
    utmeRequirements: "English, Chemistry, Physics and Maths",
    olevelRequirements: "English, Mathematics, Physics, Chemistry, Further Mathematics.",
    directEntryRequirements: "(i) ND/HND with minimum of upper credit in relevant Engineering Discipline (ii) 3 A'level credit passes in Physics, Chemistry, Mathematics"
  },
  // FACULTY OF SCIENCE
  {
    faculty: "Faculty of Science",
    course: "Biochemistry",
    utmeRequirements: "English Language, Chemistry, Physics and Biology",
    olevelRequirements: "English Language, Chemistry, Mathematics, Physics and Biology",
    directEntryRequirements: "(1) 3 A'Level Credit in Chemistry, Physics and Biology with a minimum of 15 points. (2) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Botany",
    utmeRequirements: "English Language, Chemistry, Biology and Physics",
    olevelRequirements: "English Language, Biology, Chemistry, Physics and Mathematics",
    directEntryRequirements: "(1) 3 A/Level Credit in Chemistry, Biology and Physics. (2) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Chemistry",
    utmeRequirements: "English Language, Chemistry, Mathematics, and Physics.",
    olevelRequirements: "English Language, Chemistry, Physics, Mathematics and Biology.",
    directEntryRequirements: "(1) 3 A'Level Credit in Chemistry and either Physics or Mathematics and Biology. (2) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Industrial Chemistry",
    utmeRequirements: "English Language, Chemistry, Mathematics & Physics.",
    olevelRequirements: "English Language, Chemistry, Physics, Mathematics & Biology.",
    directEntryRequirements: "(1) 3 A/Level credit results in Chemistry and either Physics or Mathematics and Biology. (2) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Geology",
    utmeRequirements: "English Language, Chemistry, Biology & Physics.",
    olevelRequirements: "English Language, Chemistry, Physics, Biology and Mathematics.",
    directEntryRequirements: "(1) 3 A'Level Credit Passes in Chemistry, Physics, Mathematics, Biology and Geography (2) HND in Geology from recognized Polytechnics with an Upper Credit (3) HND in Mineral Resources (Geology Option) with an Upper Credit (4) HND in Mining Engineering (5) First Degree (B.Sc) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Applied Geophysics",
    utmeRequirements: "English Language, Chemistry, Physics and Mathematics.",
    olevelRequirements: "English Language, Biology, Chemistry, Physics and Mathematics",
    directEntryRequirements: "(1) 3 A'Level Credit Passes in Chemistry, Physics and Mathematics (2) HND in Geology from recognized Polytechnics with an Upper Credit (3) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Mathematics",
    utmeRequirements: "English Language, Mathematics, Physics and Chemistry",
    olevelRequirements: "English Language, Biology, Mathematics, Physics and Chemistry",
    directEntryRequirements: "(1) 3 A'Level Credit Passes in Mathematics, Physics or Chemistry (2) OND Pass from recognized Polytechnics in Statistics with an Upper Credit (3) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Statistics",
    utmeRequirements: "English Language, Physics, Mathematics and Chemistry.",
    olevelRequirements: "English Language, Mathematics, Physics, Chemistry & Biology.",
    directEntryRequirements: "(1) 3 A'Level Credit Passes in Mathematics, Physics or Chemistry (2) OND Pass from recognized Polytechnics in Statistics with an Upper Credit (3) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Microbiology",
    utmeRequirements: "English Language, Biology, Chemistry and Physics.",
    olevelRequirements: "English Language, Biology, Chemistry, Physics and Mathematics",
    directEntryRequirements: "(1) 3 A'Level Credit Passes in Biology, Physics and Chemistry (2) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Physics / Engineering Physics",
    utmeRequirements: "English Language, Mathematics, Physics & Chemistry.",
    olevelRequirements: "English Language, Physics, Chemistry, Mathematics and Biology",
    directEntryRequirements: "(1) 3 A'Level Credit Passes in Physics, Mathematics and Chemistry (2) OND Pass from recognized Polytechnics in Electronic & Electrical Engineering or Mechanical Engineering with an Upper Credit (3) First Degree (B.Sc.) in Science related courses"
  },
  {
    faculty: "Faculty of Science",
    course: "Zoology",
    utmeRequirements: "English Language, Biology, Physics and Chemistry or Mathematics",
    olevelRequirements: "English Language, Biology, Physics, Mathematics and Chemistry.",
    directEntryRequirements: "(1) 3 A'Level Credit Passes in Biology, Physics or Chemistry (2) First Degree (B.Sc.) in Science related courses"
  },
  // FACULTY OF SOCIAL SCIENCES
  {
    faculty: "Faculty of Social Sciences",
    course: "Economics",
    utmeRequirements: "English, Mathematics, Government and Economics",
    olevelRequirements: "English, Mathematics, Economics, 1 from Government/Geography and one from Biology, Agriculture, Civics, History, IRK/CRK, Yoruba, Literature, Chemistry, Physics, Further Mathematics and ICT",
    directEntryRequirements: "(i) 3 A'Level Passes in Economics, Government and Mathematics (ii) Upper Credit Passes in ND/HND in Economics"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Demography and Social Statistics",
    utmeRequirements: "English, Mathematics, Economics and any from Government, Civics, Data Processing and Computer Studies",
    olevelRequirements: "English, Mathematics, Economics and any two from Geography/Government, Chemistry, Physics, Biology, Agricultural Science, Further Mathematics and Civics",
    directEntryRequirements: "(i) 3 A'Level Passes in Mathematics/Statistics and any two from Economics, Geography or government (ii) Upper Credit at OND/HND in Mathematics and Statistics"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Geography",
    utmeRequirements: "English, Geography, and any 2 from Economics, Government, Mathematics, Chemistry, Physics, Biology/Agric Science",
    olevelRequirements: "English, Mathematics, Geography, and any 2 from Economics, Government, Chemistry, Physics, Biology/Agric, CRS/IRS, Yoruba, Civics Education, ICT/Animal Husbandry, Cosmetology, Marketing",
    directEntryRequirements: "(i) 3 A'Level in Geography, any 2 Science or Humanities subject (ii) Upper Credit at ND/HND in Survey and Geoinformatics, Land Surveying, Urban and Regional Planning, Statistics, Mathematics or Conservation Sciences, Tourism"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Political Science",
    utmeRequirements: "English, Government and any 2 from Economics, Geography, Literature, CRS/IRS, Mathematics",
    olevelRequirements: "English, Mathematics, Government and any 2 from Economics, Geography, Literature, CRS/IRS, Civics Education, Yoruba, ICT, Physics/Chemistry/Biology/Agric Sciences",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Public Administration, Local Government Studies (ii) 3 A/Level passes in Government and any 2 from Economics, Geography, Mathematics"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Psychology",
    utmeRequirements: "English and any 3 from Mathematics, Economics, Government, Physics, Geography, Chemistry and Biology",
    olevelRequirements: "English, Mathematics, Economics and any 2 from Government, Biology, Geography, Physics, Chemistry, History, Literature, Yoruba, CRS/IRS, Agric Science, ICT, Civics Education, Garment Making, Catering and Craft Practice",
    directEntryRequirements: "(i) Registered Nursing Certificate, Upper Credit at ND/HND in Social Work or Medical Laboratory Science (ii) 3 A'Level Passes in Biology, Physics, Chemistry"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Sociology and Anthropology",
    utmeRequirements: "English, Mathematics and any 3 from Literature, Geography, CRS/IRS, Government, History, Economics",
    olevelRequirements: "English, Mathematics and any 3 from Literature, Yoruba, Physics, Chemistry, Economics, Geography, CRS/IRS, Government, Visual Arts, Music, History, Biology, Agriculture and ICT",
    directEntryRequirements: "(i) 3 A'Level Passes in any 3 from Geography, Government, History, Economics, CRS/IRS, Sociology. (ii) Upper Credit at ND/HND in Mass Communication, Social Works, Mathematics and Statistics"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Entrepreneurship and Industrial Extension",
    utmeRequirements: "As in other courses in Social Sciences",
    olevelRequirements: "English, Mathematics and one Social Science subject (Economics, Government and Geography) plus any 2 subjects from Civics, Physics, Chemistry Biology, Agric. Science, Computer, CRK/IRK, Yoruba/Igbo./Hausa, Fine Arts, Music, Literature and Principles of Accounting.",
    directEntryRequirements: "(i) Upper Credit at ND/HND in any discipline (ii) A'Level Credit Passes in three Subjects"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Mass Communication",
    utmeRequirements: "As in other courses in Social Sciences",
    olevelRequirements: "English, Mathematics, Literature in English and any other two of Arts or Social Sciences subject",
    directEntryRequirements: "Upper Credit at ND/HND in any discipline"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Film Production",
    utmeRequirements: "As in other courses in Social Sciences",
    olevelRequirements: "English, Mathematics, Literature in English and any other two of Arts or Social Sciences subject",
    directEntryRequirements: "Upper Credit at ND/HND in any discipline"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Broadcast Journalism",
    utmeRequirements: "As in other courses in Social Sciences",
    olevelRequirements: "English, Mathematics, Literature in English and any other two of Arts or Social Sciences subject",
    directEntryRequirements: "Upper Credit at ND/HND in any discipline"
  },
  {
    faculty: "Faculty of Social Sciences",
    course: "Information Science and Media Studies",
    utmeRequirements: "As in other courses in Social Sciences",
    olevelRequirements: "English, Mathematics, Literature in English and any other two of Arts or Social Sciences subject",
    directEntryRequirements: "Upper Credit at ND/HND in any discipline"
  },
  // FACULTY OF AGRICULTURE
  {
    faculty: "Faculty of Agriculture",
    course: "Animal Science",
    utmeRequirements: "English, Physics, Chemistry, Biology or Agric. Science",
    olevelRequirements: "English, Mathematics, Chemistry and 2 from Biology/Agric. Science, Physics, Economics, Geography, Further Mathematics",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Animal Science and related Agricultural discipline (ii) 3 A'Level Credit Passes in Chemistry, Biology and Physics"
  },
  {
    faculty: "Faculty of Agriculture",
    course: "Crop Production and Protection",
    utmeRequirements: "English, Chemistry, Physics and Biology/Agric Science",
    olevelRequirements: "English, Mathematics, Chemistry and 2 from Physics, Biology/Agricultural Science, Geography, Further Mathematics",
    directEntryRequirements: "(i) 3 A'Level Credit passes in Chemistry, Biology or Botany or Zoology and Physics/Mathematics"
  },
  {
    faculty: "Faculty of Agriculture",
    course: "Agricultural Economics",
    utmeRequirements: "English, Chemistry, Physics and Biology/Agric Science",
    olevelRequirements: "English, Mathematics, Chemistry and 2 from Biology/Agric. Science, Physics, Economics, Geography, Further Mathematics",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Agricultural Science (ii) 3 A'Level Credit Passes in Chemistry, Biology and Physics"
  },
  {
    faculty: "Faculty of Agriculture",
    course: "Agricultural Extension and Rural Development",
    utmeRequirements: "English, Chemistry, Physics and Biology/Agric Science",
    olevelRequirements: "English, Mathematics, Chemistry and 2 from Biology/Agric. Science, Physics, Economics, Geography, Further Mathematics",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Agricultural Science (ii) 3 A'Level Credit Passes in Chemistry, Biology and Physics"
  },
  {
    faculty: "Faculty of Agriculture",
    course: "Soil Science and Land Resources Management",
    utmeRequirements: "English, Chemistry, Physics and Biology/Agric Science",
    olevelRequirements: "English, Mathematics, Chemistry and 2 from Biology/Agric. Science, Physics, Economics, Geography, Further Mathematics",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Agricultural Science (ii) 3 A'Level Credit Passes in Chemistry, Biology and Physics"
  },
  {
    faculty: "Faculty of Agriculture",
    course: "Consumer Sciences",
    utmeRequirements: "English, Chemistry, Physics and Biology/Agric Science",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and Biology/Agric. Science",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Catering and Hotel Management, Textile and Clothing Construction, Food Science and Technology; Nutrition, Leisure and Tourism"
  },
  // FACULTY OF ARTS
  {
    faculty: "Faculty of Arts",
    course: "Dramatic Arts",
    utmeRequirements: "English Language, Literature in English and 3 other subjects from History, Yoruba/Igbo/Hausa/French, Music, CRS/IRS, Fine Arts, Government, Geography, Mathematics, Economics, Physics, Biology, Agricultural Science, Home Economics, Chemistry, Food & Nutrition/Civic Education/Principles of Account/Catering & Catering Craft Practice/Animal Husbandry/Garment Making/Cosmetology, Photography and Office Practice, Computer Studies",
    olevelRequirements: "Five O'Level Credit Passes to include English, Literature and any other 3 subjects (Same as UTME subjects)",
    directEntryRequirements: "Diploma in Dramatic Arts from O.A.U. or any other recognized Diploma/NCE in Theatre Arts"
  },
  {
    faculty: "Faculty of Arts",
    course: "English",
    utmeRequirements: "English, Literature in English and 3 other subjects from History/Yoruba/Igbo/Hausa/French/Music/CRS/IRS/Fine Art/Government/Geography/Economics/Civics Education and Principles of Account",
    olevelRequirements: "English, Literature in English and 3 other subjects from History/Yoruba/Igbo/Hausa/French/Music/CRS/IRS/Fine Art/Government/Geography/Economics/Civics Education and Principles of Account",
    directEntryRequirements: "Advanced Level"
  },
  {
    faculty: "Faculty of Arts",
    course: "Literature in English",
    utmeRequirements: "English, Literature in English and 3 other subjects from History/Yoruba/Igbo/Hausa/French/Music/CRS/IRS/Arabic/Fine Art/Government/Geography/Economics/Civic Education and Principles of Account",
    olevelRequirements: "English, Literature in English and 3 other subjects from History/Yoruba/Igbo/Hausa/French/Music/CRS/IRS/Arabic/Fine Art/Government/Geography/Economics/Civic Education and Principles of Account",
    directEntryRequirements: "Advanced Level"
  },
  {
    faculty: "Faculty of Arts",
    course: "French",
    utmeRequirements: "English Plus 4 other subjects from Literature/Yoruba/Igbo/CRS/IRS/History/French/Government/Fine Arts/Mathematics/Music/Economic/Physics/Chemistry/Biology, Home Economics/Geography/Food & Nutrition/Civic Education",
    olevelRequirements: "English Plus 4 other subjects from Literature/Yoruba/Igbo/CRS/IRS/History/French/Government/Fine Arts/Mathematics/Music/Economic/Physics/Chemistry/Biology, Home Economics/Geography/Food & Nutrition/Civic Education",
    directEntryRequirements: "(i) NCE French Village (NFV) Diploma, (ii) Diploma in Natural History Museum, (iii) O.A.U./Diploma in Conservation Science/Tourism, O.A.U."
  },
  {
    faculty: "Faculty of Arts",
    course: "German",
    utmeRequirements: "English Plus 4 other subjects from Literature/Yoruba/Igbo/CRS/IRS/History/French/Government/Fine Arts/Mathematics/Music/Economic/Physics/Chemistry/Biology Home Economics/Geography/Food & Nutrition/Civic Education, Agric. Science",
    olevelRequirements: "English Plus 4 other subjects from Literature/Yoruba/Igbo/CRS/IRS/History/French/Government/Fine Arts/Mathematics/Music/Economic/Physics/Chemistry/Biology Home Economics/Geography/Food & Nutrition/Civic Education, Agric. Science",
    directEntryRequirements: "Diploma Zentifikat, Deutsch"
  },
  {
    faculty: "Faculty of Arts",
    course: "Portuguese",
    utmeRequirements: "English Plus 4 other subjects from Literature/Yoruba/Igbo/CRS/IRS/History/French/Government/Fine Arts/Mathematics/Music/Economic/Physics/Chemistry/Biology Home Economics/Geography/Food & Nutrition/Civic Education",
    olevelRequirements: "English Plus 4 other subjects from Literature/Yoruba/Igbo/CRS/IRS/History/French/Government/Fine Arts/Mathematics/Music/Economic/Physics/Chemistry/Biology Home Economics/Geography/Food & Nutrition/Civic Education",
    directEntryRequirements: "Diploma Celpe-Bras (Intermediario)"
  },
  {
    faculty: "Faculty of Arts",
    course: "History",
    utmeRequirements: "English and 4 Credits in History, Government, Civic Education, Literature, CRS/IRS, French, Yoruba, or Hausa or Igbo, Economics, Mathematics, Principles of Accounts",
    olevelRequirements: "English and 4 Credits in History, Government, Civic Education, Literature, CRS/IRS, French, Yoruba, or Hausa or Igbo, Economics, Mathematics, Principles of Accounts",
    directEntryRequirements: "Diploma in Conservation Sciences/Tourism"
  },
  {
    faculty: "Faculty of Arts",
    course: "Yoruba",
    utmeRequirements: "English, and 4 others from Literature in English, Yoruba, Igbo, CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principles of Accounts, Government, Civic Education, Music",
    olevelRequirements: "English, and 4 others from Literature in English, Yoruba, Igbo, CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principles of Accounts, Government, Civic Education, Music",
    directEntryRequirements: "(i) Diploma in Yoruba (ii) Certificate in Yoruba/NCE"
  },
  {
    faculty: "Faculty of Arts",
    course: "Linguistics",
    utmeRequirements: "English, and 4 others from Literature in English, Yoruba, Igbo, CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principles of Accounts, Government, Civic Education, Music",
    olevelRequirements: "English, and 4 others from Literature in English, Yoruba, Igbo, CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principles of Accounts, Government, Civic Education, Music",
    directEntryRequirements: "Diploma in Yoruba/NCE with Language option"
  },
  {
    faculty: "Faculty of Arts",
    course: "Music",
    utmeRequirements: "English Language and 4 others from Literature, Yoruba/Igbo/Hausa, Music CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principles of Account, Government, Civic Education, Computer Science",
    olevelRequirements: "English Language and 4 others from Literature, Yoruba/Igbo/Hausa, Music CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principles of Account, Government, Civic Education, Computer Science",
    directEntryRequirements: "Diploma in Music from OAU or any other recognized Higher Institution, ABRSM London Grade 8 (Theory/Practical) or Equivalent, OAU Cert. in Music, OND in Music, NCE in Music (Credit)"
  },
  {
    faculty: "Faculty of Arts",
    course: "Philosophy",
    utmeRequirements: "English Language, Pass in Mathematics, and Credits in 4 other subjects from Literature, Yoruba/Igbo/Hausa, Music, Government, Civic Education, Economics Geography, CRS/IRS, History, French, Biology, Chemistry, Physics, Agric. Science, Fine Arts",
    olevelRequirements: "English Language, Pass in Mathematics, and Credits in 4 other subjects from Literature, Yoruba/Igbo/Hausa, Music, Government, Civic Education, Economics Geography, CRS/IRS, History, French, Biology, Chemistry, Physics, Agric. Science, Fine Arts",
    directEntryRequirements: "Advanced Level (AL)/(OND)/Recognized Diploma"
  },
  {
    faculty: "Faculty of Arts",
    course: "Religious Studies",
    utmeRequirements: "English, and 4 others from Literature, Yoruba, Igbo, CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principle of Accounts, Government, Civic Education, Music, Hausa",
    olevelRequirements: "English, and 4 others from Literature, Yoruba, Igbo, CRS/IRS, History, French, Fine Arts, Mathematics, Biology, Chemistry, Physics, Economics, Geography, Agric. Science, Principle of Accounts, Government, Civic Education, Music, Hausa",
    directEntryRequirements: "Diploma in Theology or Religious Studies from Immanuel College of Theology, Vining College of Theology, Methodist Theological Institute, NCE in CRK/IRK, Religious Studies, 2 Advanced Level Papers"
  },
  // FACULTY OF ADMINISTRATION
  {
    faculty: "Faculty of Administration",
    course: "International Relations",
    utmeRequirements: "English, Mathematics, Government and any other one from Economics, Geography, History, Literature in English",
    olevelRequirements: "English, Mathematics, Government and any other two from Economics, Geography, History, Literature, in English Computer Studies/ICT",
    directEntryRequirements: "O'Level Requirements plus two A'Level Passes in Government, Economics or History"
  },
  {
    faculty: "Faculty of Administration",
    course: "Local Government Studies",
    utmeRequirements: "English, Mathematics, Government and one from Accounting, Economics, Geography, History, Yoruba, Computer Studies/ICT",
    olevelRequirements: "English, Mathematics, Government and two from Accounting, Economics, Geography, Yoruba, History, Computer Studies/ICT",
    directEntryRequirements: "(i) Credit Passes at A'Level in Economics, Government, History or Geography. (ii) ND/HND in Local Government Studies, Public Administration, Accounting or Business Administration Studies (upper Credit)"
  },
  {
    faculty: "Faculty of Administration",
    course: "Management & Accounting",
    utmeRequirements: "English, Mathematics, Economics and any other from Accounting, Government, Geography, Computer Studies/ICT",
    olevelRequirements: "English, Mathematics, Economics and any 2 from Accounting, Government, Geography, Literature, Biology, Yoruba, Computer Studies/ICT",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Accounting, Banking & Finance/Business Administration (ii) ATSWA (Final Stage) (iii) ICAN or ACCA (Foundation Level) (iv) Credit Passes at A'Level in which one must be in Economics or Accounting"
  },
  {
    faculty: "Faculty of Administration",
    course: "Business Administration",
    utmeRequirements: "English, Mathematics, Economics and any other from Accounting, Government, Geography, Computer Studies/ICT",
    olevelRequirements: "English, Mathematics, Economics and any 2 from Accounting, Government, Geography, Literature, Biology, Yoruba, Computer Studies/ICT",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Accounting, Banking & Finance/Business Administration (ii) ATSWA (Final Stage) (iii) ICAN or ACCA (Foundation Level) (iv) Credit Passes at A'Level in which one must be in Economics or Accounting"
  },
  {
    faculty: "Faculty of Administration",
    course: "Public Administration",
    utmeRequirements: "English, Mathematics, Government, Economics",
    olevelRequirements: "English, Mathematics, Government and any 2 from Economics, History, Geography, Yoruba, CRS/IRS, Literature, Biology, Accounting, Civic Education, Computer Studies/ICT",
    directEntryRequirements: "(i) Upper Credit at ND/HND in Local Government Studies, Public Administration, Statistics (ii) 3 A'level credit passes in Economics, Government/History"
  },
  // FACULTY OF ENVIRONMENTAL DESIGN & MANAGEMENT
  {
    faculty: "Faculty of Environmental Design & Management",
    course: "Architecture",
    utmeRequirements: "Mathematics, English and any 2 from Physics, Chemistry, Economics, Fine Arts.",
    olevelRequirements: "Mathematics, English, Physics and 2 from Fine Arts, Technical Drawing, Economics, Physics, Chemistry, Economics, Geography, Biology, Agricultural Science.",
    directEntryRequirements: "(i) ND/HND upper credit in Architecture (ii) A'Level Credit passes in Physics, Mathematics or Chemistry"
  },
  {
    faculty: "Faculty of Environmental Design & Management",
    course: "Building",
    utmeRequirements: "English, Chemistry, Physics, Mathematics",
    olevelRequirements: "English, Mathematics, Physics, Chemistry and any 1 from Technical Drawing, Economics, Further Mathematics, Fine Arts, Geography, Land Surveying and Building Construction.",
    directEntryRequirements: "(i) ND/HND upper credit in Architecture, Civil Engineering, Quantity Surveying, Building (ii) A'Level Credit passes in Physics, Mathematics or Chemistry"
  },
  {
    faculty: "Faculty of Environmental Design & Management",
    course: "Surveying and Geoinformatics",
    utmeRequirements: "English, Mathematics, Physics and Geography/Chemistry",
    olevelRequirements: "English, Mathematics, Physics one from Chemistry/Geography and one from Economics/Biology/Further Mathematics/Technical Drawing",
    directEntryRequirements: "Upper Credit ND/HND in Surveying, Mathematics or Physics. A'Level passes in Mathematics, Physics and Chemistry"
  },
  {
    faculty: "Faculty of Environmental Design & Management",
    course: "Quantity Surveying",
    utmeRequirements: "English Language and 2 from Physics, Chemistry, Technical Drawing, Geography, Economics and Biology",
    olevelRequirements: "English, Mathematics, Physics and 2 from Chemistry, Technical Drawing, Geography, Economics, Biology, Further Mathematics",
    directEntryRequirements: "(i) ND/HND upper credit in Architecture, Quantity Surveying, Building (ii) A'Level Credit passes in Physics, Mathematics or Chemistry"
  },
  {
    faculty: "Faculty of Environmental Design & Management",
    course: "Urban & Regional Planning",
    utmeRequirements: "English, Mathematics, Geography, Economics/Government",
    olevelRequirements: "English, Mathematics, Geography, Economics and 1 from Biology, Physics, Chemistry, Technical Drawing, Fine Arts, History, Government.",
    directEntryRequirements: "(i) A'Level passes in Economics, Geography and Mathematics. (ii) ND/HND in Urban and Regional Planning, Building, Quantity Surveying, Architecture, Land Surveying, Civil Engineering"
  },
  {
    faculty: "Faculty of Environmental Design & Management",
    course: "Estate Management",
    utmeRequirements: "English, Mathematics Economics and one from Biology, Physics, Chemistry, Geography and Fine Arts",
    olevelRequirements: "English, Mathematics Economics and 1 from Chemistry, Physics, Biology, Geography, Building Construction, Technical Drawing, Fine Arts and 1 from Yoruba, Agriculture, Account, Food & Nutrition, Literature Government, CRS/IRS, Further Mathematics, Home Economics",
    directEntryRequirements: "(i) A'Level passes in Economics, Mathematics and any Science Subject. (ii) ND/HND in Building Construction"
  },
  {
    faculty: "Faculty of Environmental Design & Management",
    course: "Fine and Applied Arts",
    utmeRequirements: "English and any 3 from the Arts, Social Science and Science excluding Commerce, Book Keeping and Shorthand",
    olevelRequirements: "English, one Science and any 3 from Sciences, Social Science, Arts, except Commerce, Book Keeping and Shorthand",
    directEntryRequirements: "(ii) 3 A'Level passes in one Science Subject and English. (iii) Diploma in Fine Arts"
  },
  // FACULTY OF LAW
  {
    faculty: "Faculty of Law",
    course: "Law",
    utmeRequirements: "English, Literature plus any two other subjects",
    olevelRequirements: "Five O'Level Credit Passes to include English, Literature and any other 3 subject from Government, History, CRS/IRS, French, Maths, Economics, Physics, Chemistry, Biology, Agriculture and Accounting",
    directEntryRequirements: "(i) First Degree with a minimum of 2nd Class Honours plus UME requirements (ii) 3 A'Level credit passes in Art or Social Sciences"
  },
  // FACULTY OF EDUCATION
  {
    faculty: "Faculty of Education",
    course: "History Education",
    utmeRequirements: "History and any other 2 from CRK/IRK, French, Literature in English, Yoruba, Geography, Physics, Economics, Government and Hausa",
    olevelRequirements: "English and 4 from Agric/Food & Nutrition, Arabic, Fine Arts, Biology, Chemistry, CRK/IRK, Economics, French, Geography, Government, Hausa, Home Economics, Igbo, Literature, Mathematics, Music, Physics, Accounting, Yoruba, Technical Drawing, Further Maths., Building Construction, Land Surveying, PHE, Social Studies and Integrated Science.",
    directEntryRequirements: "(i) A'Level/GCE Credit in English, History, and any 1 of IRS/CRS, Economics, Geography, Government, Fine Arts, Yoruba, Hausa, Igbo, Literature in English (ii) NCE Merit/Credit in History (Double Major), History/IRS or CRS, History/Geography, History/Economics, Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "English Education",
    utmeRequirements: "Literature in English and 1 Arts subject and any other subject",
    olevelRequirements: "English, Literature in English, plus any other three subjects from IRS/CRS, Yoruba, Hausa, Igbo, History, Government, French, Biology, Agricultural Science, Food and Nutrition, or 5 Merit/Credit at TC II",
    directEntryRequirements: "(i) A'Level/Credit in English Language, Literature in English (ii) NCE Merit/Credit in English/Social Studies, English/CRS/IRS, English/Yoruba, English/French, English/Special Education, English/History, Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Fine and Applied Arts)",
    utmeRequirements: "Fine Arts, one other Arts subject and other subject",
    olevelRequirements: "English plus any 4 as listed in Education History Above",
    directEntryRequirements: "(i) A'Level/Credit in English, Fine Arts plus any 1 subject from Technical Drawing, Geography, Economics, History, Government, CRS/IRS, Yoruba, Igbo, Hausa (ii) NCE Merit/Credit in Fine Arts (Double major), Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (French)",
    utmeRequirements: "French plus 2 other Arts subjects",
    olevelRequirements: "English plus any 4 from Education History above",
    directEntryRequirements: "(i) A'Level/Credit in English, French, 1 from IRS/CRS History, Yoruba, Literature, Government (ii) NCE Credit in Education, French (Double major), Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Language Arts)",
    utmeRequirements: "Any 3 from Yoruba, Literature in English, IRS/CRS, History and Economics",
    olevelRequirements: "English, Literature plus any other 3 subjects from IRS/CRS, Yoruba/Hausa/ Igbo, History/Government, French, Biology, Agricultural Science/Food Nutrition or 5 Merit/Credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English, Literature plus any other three subjects from IRS/CRS, Yoruba/Hausa/Igbo, History/Government, French (ii) NCE Merit/Credit in English/Social Studies, English/CRS/IRS, English/Yoruba, English/French, English/Special Education, English/History, Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Music)",
    utmeRequirements: "Music and any other two Arts, Social Sciences",
    olevelRequirements: "English plus any 4 as listed in Education History above",
    directEntryRequirements: "(i) A'Level/GCE Credit in English, Music, plus any one of Yoruba/Hausa/Igbo, Literature, English, History/Government (ii) NCE Merit/Credit in Music (Double Major) or combined with a teaching Subject, Diploma in Education."
  },
  {
    faculty: "Faculty of Education",
    course: "Physical and Health Education",
    utmeRequirements: "Biology and any 2 relevant Subjects",
    olevelRequirements: "English, plus any other four subjects from Mathematics, Physics, Chemistry, Agricultural Science, Food and Nutrition, Geography, Economics, Government, Biology, Health Science, Integrated Science, Literature, IRS/CRS, History, Government or five Merit/Credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English plus any other two subjects from Mathematics, Physics, Chemistry, Agricultural Science/Food and Nutrition, Geography, Economics, Government, Biology/Health Sciences/Integrated Science, Literature, History/Government (ii) ND/HND/NCE Merit/Credit in Physical and Health Education; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Religious Studies)",
    utmeRequirements: "2 Arts subjects including Religious and 1 other subject",
    olevelRequirements: "English Language, IRS/CRS, plus any other three subjects from Literature in English, Yoruba/Hausa/Igbo, History/ Government, French, Economics, Geography, Biology, Agric. Science/ Food and Nutrition or five Merit/Credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English Language, IRS/CRS, plus any other three subjects from Literature in English, Yoruba/Hausa/lgbo, History/Government, French (ii) NCE Merit/Credit in IRS/CRS, CRS/English, CRS/Yoruba, IRS/Yoruba, CRS/French, IRS/French, CRS/Political Science, IRS/Political Science; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Yoruba)",
    utmeRequirements: "Yoruba and any other 2 subjects chosen from History, Literature, French, IRK/CRK, Arabic and Geography/Physics",
    olevelRequirements: "English, Yoruba and any 3 from Government, Economics, Geography, Agric. Science/Food and Nutrition, French, IRS/CRS, Literature, Biology or Five Merit/Credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in Yoruba, English and any other three subjects from Literature in English, IRS/CRS, History/Government, French (ii) NCE Merit/Credit in Yoruba/English Language, Yoruba/French, Yoruba/Hausa, Yoruba/Igbo, Yoruba/Social Studies, Yoruba/Guidance and Counselling, Yoruba/History/Government, Yoruba/Diploma in Education."
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Biology)",
    utmeRequirements: "Biology and any other 2 subjects chosen from Chemistry, Mathematics and Physics",
    olevelRequirements: "English Language, Biology, Chemistry, Mathematics and any one of Agricultural Science/Food and Nutrition, Physics, Health Science or 5 Merit/Credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in Biology, Chemistry and any one of Physics, Further Mathematics, Agricultural Science, Food and Nutrition. (ii) NCE Merit/Credit in Biology/Chemistry, Biology/Physics, Biology/Integrated Science, Biology/Mathematics, Maths/Agricultural Science; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Chemistry)",
    utmeRequirements: "Chemistry and any other 2 subjects chosen from Physics, Biology and Mathematics",
    olevelRequirements: "Mathematics, Chemistry, English and any 2 subjects from Physics, Biology, Agricultural Science or 5 merit/credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English Language, Chemistry and any one subject from Physics, Mathematics and Further Mathematics (ii) NCE Merit/Credit in Chemistry/Physics, Chemistry/Mathematics, Chemistry/Biology, Chemistry/Integrated Science; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Mathematics)",
    utmeRequirements: "Mathematics and any other 2 of the following Science subjects: Physics, Chemistry and Biology",
    olevelRequirements: "English, Mathematics, Physics/Chemistry and any 2 subjects from Further Maths. Biology, Agricultural Science/Food and Nutrition, Technical Drawing or 5 Merit/Credit at TC II.",
    directEntryRequirements: "(i) A'Level/GCE Credit in Mathematics, English Language, Physics/Chemistry and any other subject from Further Mathematics, Technical Drawing (ii) NCE Merit/Credit in Maths/Physics, Mathematics/Chemistry, Mathematics/Technical Education, Mathematics/Computer Science, Mathematics/Technical Education, Diploma in Education."
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Mathematics & Integrated Science)",
    utmeRequirements: "Any 3 of Mathematics, Chemistry, Physics, Biology and Agricultural Science",
    olevelRequirements: "English Language, Mathematics, and any other 3 subjects from Biology, Chemistry, Physics, General Science, Agricultural Science/Food & Nutrition, Health Science, Technical Drawing or 5 Merit/credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in Mathematics, English Language and one subject from Biology, Chemistry, Physics, General Science, Agricultural Science/Food and Nutrition, Further Mathematics (ii) NCE Merit/Credit Integrated Science/Mathematic, Integrated Science/Biology, Integrated Science/Technical Education, Integrated Science/Physics, Integrated Science/Chemistry, Integrated Science/Computer Science, Integrated Science/Auto-Mechanics, Integrated Science/Special Education; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Physics)",
    utmeRequirements: "Any 3 of Mathematics, Chemistry, Physics, Biology and Agricultural Science",
    olevelRequirements: "English Language, Mathematics, and any other 3 subjects from Biology, Chemistry, Physics, General Science, Agricultural Science/Food & Nutrition, Health Science, Technical Drawing or 5 Merit/credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in Mathematics, English Language and one subject from Biology, Chemistry, Physics, General Science, Agricultural Science/Food and Nutrition, Further Mathematics (ii) NCE Merit/Credit Integrated Science/Mathematic, Integrated Science/Biology, Integrated Science/Technical Education, Integrated Science/Physics, Integrated Science/Chemistry, Integrated Science/Computer Science, Integrated Science/Auto-Mechanics, Integrated Science/Special Education; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Economics)",
    utmeRequirements: "Economics, Mathematics, and other subject from Geography/Physics, History, Government and Literature in English",
    olevelRequirements: "English Language, Mathematics, Economics and any other two subjects from Government, Geography, IRS/CRS, Yoruba/Hausa/Igbo, Business Education/Accounting or 5 Merit/Credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English, Economics and any other subject from Government, Geography, Mathematics (ii) NCE Merit/Credit in Economics/Mathematics, Economics/Geography, Economics/Accounting, Economics/Business Education, Economics/Secretarial Studies, Economics/Government, Economics/Business Education, Economics/Political Science, Economics/Social Studies, Business Education, Computer/Science/Economics, (double major or combined with any teaching subject is also acceptable); Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Geography)",
    utmeRequirements: "Geography, English Language, Mathematics and any other two from Economics, Government Biology, Agricultural Science/Food & Nutrition, Chemistry, IRS/CRS,Yoruba/Hausa/ Igbo or 5 merit/credit at TC II",
    olevelRequirements: "Geography, English Language, Mathematics and any other two from Economics, Government Biology, Agricultural Science/Food & Nutrition, Chemistry, IRS/CRS,Yoruba/Hausa/ Igbo or 5 merit/credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English Language, Geography, and any one subject from Economics, Mathematics, Business-Method, Government (ii) NCE Merit/Credit in Geography/Social Studies, Geography/Economics, Geography/Mathematics, Geography/Physics, Geography/Chemistry, Geography/Integrated Science, Geography/Political Science, Geography/Biology, Geography/Computer Science, Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Guidance and Counselling",
    utmeRequirements: "Any 3 subject",
    olevelRequirements: "English Language, Mathematics plus any three subjects from Literature in English, History/Government, French, Fine Arts, IRS/CRS, Yoruba/Igbo/Hausa Physics, Chemistry, Biology, Integrated Science, Geography, Further Maths., Secretarial Studies, Agricultural Science/Food & Nutrition, Economics, Technical Drawing, Physical and Health Education, Music or 5 merit/credit at TC II",
    directEntryRequirements: "Any two (2) teaching subjects or any one double major NCE subject; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Social Studies)",
    utmeRequirements: "Any 3 of CRS, Economics, Geography/Physics, Government, History and IRS",
    olevelRequirements: "English Language, at least 1 from Economics/Government/Social Studies/Geography, three (3) from History, Music, Fine Arts, IRS/CRS, Home Economics, Literature in English. Accounting, Agric. Science, Physics, Chemistry, Biology, Integrated Science, Physical and Health Education or 5 merit/credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English and two other subjects from Government, Geography, Home Economics, Literature in English, Economics, History/Government, IRS/CRS, Fine Arts, Music (ii) NCE Merit/Credit in Social Studies (Double Major) Social Studies/Music, Social Studies/IRS or CRS, Social Studies/English, Social Studies/Political Science, Social Studies/Fine Arts, Social Studies/Economics, Social Studies/Geography, Social Studies/Yoruba; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Education (Political Science)",
    utmeRequirements: "Government or History plus 2 other Arts or Social Sciences subjects",
    olevelRequirements: "English Language, Mathematics, Government, and any other 2 subjects from Economics, Geography, History or 5 merit/credit at TC II",
    directEntryRequirements: "(i) A'Level/GCE Credit in English Language, Government and any other one subject from Economics, Geography, Mathematics (ii) NCE Merit/Credit in Political Science (Double Major), Political Science/English Language, Political Science/Economics, Political Science/Geography, Political Science/Mathematics, Political Science/Yoruba, Political Science/Igbo, Political Science/Hausa, Political Science/Social Studies; Diploma in Education"
  },
  {
    faculty: "Faculty of Education",
    course: "Educational Management",
    utmeRequirements: "English Language and 3 of Economics, Government, Geography, Accounting, Agric. Science, Food & Nutrition, Arabic, Fine Art, Biology, Chemistry, CRS, IRS, French, Hausa, Home Econs. Igbo, Literature, Mathematics, Music, Physics, Yoruba, Further Maths, Technical Drawing, Physical and Health Education, Social Studies, Integrated Science, Civic Education.",
    olevelRequirements: "English Language and 4 from Economics, Government, Geography, Accounting, Agric. Science, Food & Nutrition, Arabic, Fine Art, Biology, Chemistry, CRS, IRS, French, Hausa, Home Econs. Igbo, Literature, Mathematics, Music, Physics, Yoruba, Further Maths, Technical Drawing, Physical and Health Education, Social Studies, Integrated Science, Civic Education.",
    directEntryRequirements: "(i) A'Level Credit passes in Economics for Cognate Area of Economics, Geography for Cognate Area of Geography, Government for cognate Area of Political Science, Social Studies for cognate area of Social Studies, Business Studies/Accounting (Double major or combined) for cognate area of Accounting and one other Social Sciences Subject (ii) NCE Credit passes in two Teaching or Professional subject."
  }
];

export function getOAURequirementByCourse(course: string): OAURequirement | undefined {
  if (!course) return undefined;
  const clean = course.toLowerCase().trim();
  
  const aliasMap: Record<string, string> = {
    'medicine': 'Medicine and Surgery',
    'medicine & surgery': 'Medicine and Surgery',
    'med & surg': 'Medicine and Surgery',
    'med surg': 'Medicine and Surgery',
    'mbbs': 'Medicine and Surgery',
    'medical rehab': 'Medical Rehabilitation',
    'elect elect': 'Electronic and Electrical Engineering',
    'electrical engineering': 'Electronic and Electrical Engineering',
    'mech eng': 'Mechanical Engineering',
    'civil eng': 'Civil Engineering',
    'agric eng': 'Agricultural & Environmental Engineering',
    'agric economics': 'Agricultural Economics',
    'agric extension': 'Agricultural Extension and Rural Development',
    'food science': 'Food Engineering/Food Science & Technology',
    'demo & social stats': 'Demography and Social Statistics',
    'mass comm': 'Mass Communication',
    'business admin': 'Business Administration',
    'public admin': 'Public Administration',
    'fine arts': 'Fine and Applied Arts',
    'surveying': 'Surveying and Geoinformatics',
    'geo-informatics': 'Surveying and Geoinformatics',
    'qs': 'Quantity Surveying',
    'urp': 'Urban & Regional Planning'
  };

  if (aliasMap[clean]) {
    const found = OAU_REQUIREMENTS.find(
      item => item.course.toLowerCase() === aliasMap[clean].toLowerCase()
    );
    if (found) return found;
  }

  // Substring match
  return OAU_REQUIREMENTS.find(
    item => item.course.toLowerCase().includes(clean) || clean.includes(item.course.toLowerCase())
  );
}
