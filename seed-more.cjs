const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");

const app = initializeApp(config);
const db = getFirestore(app);

const articles = [
  {
    "id": "kb-course-medicine-001",
    "title": "JAMB Subject Combination and Requirements for Medicine and Surgery",
    "slug": "medicine-surgery-requirements",
    "category": "Courses",
    "course": "Medicine and Surgery",
    "summary": "Medicine and Surgery requires English, Biology, Physics, and Chemistry at both UTME and O'Level, and is among the most competitive courses with generally high cut-off marks.",
    "content": "For Medicine and Surgery (MBBS), the compulsory JAMB UTME subject combination is Use of English, Biology, Physics, and Chemistry — all four are required with no elective options. At O'Level, candidates need a minimum of five credit passes, including English Language, Biology, Physics, Chemistry, and Mathematics, obtained in not more than two sittings. Medicine is one of the most competitive courses in Nigerian tertiary admissions, with individual institutions typically setting departmental aggregate cut-offs well above their general UTME minimum, and with admission quotas kept deliberately small relative to demand due to accreditation and clinical training capacity limits (NUC/Medical and Dental Council of Nigeria accreditation standards). Candidates should confirm the specific departmental cut-off and any additional screening requirements (which can include CBT-based post-UTME screening, interviews, or aptitude tests) directly from their chosen institution, since these vary significantly.",
    "requirements": [
      "UTME: Use of English, Biology, Physics, Chemistry (all compulsory)",
      "O'Level: minimum 5 credits including English, Biology, Physics, Chemistry, Mathematics, in not more than 2 sittings"
    ]
  },
  {
    "id": "kb-course-law-001",
    "title": "JAMB Subject Combination and Requirements for Law",
    "slug": "law-requirements",
    "category": "Courses",
    "course": "Law",
    "summary": "Law requires English, Literature in English, and Government or History at UTME, with Mathematics needed only at O'Level, not UTME.",
    "content": "For Law (LL.B), the JAMB UTME subject combination is Use of English (compulsory), Literature in English, Government or History, and one other Arts or Social Science subject (such as CRS/IRS, Economics, or Geography). Mathematics is not required among the UTME subjects for Law but is still required as an O'Level credit pass. At O'Level, candidates need a minimum of five credit passes including English Language and Mathematics, obtained in not more than two sittings. Direct Entry candidates typically need at least two relevant A-Level passes including Literature in English, or an equivalent Diploma/NCE/first degree in a related field, though this varies by institution. Law programmes typically run five years, after which graduates attend the Nigerian Law School for one additional year to qualify as Barristers and Solicitors.",
    "requirements": [
      "UTME: Use of English, Literature in English, Government or History, and one other Arts/Social Science subject",
      "O'Level: minimum 5 credits including English Language and Mathematics, in not more than 2 sittings"
    ]
  },
  {
    "id": "kb-ui-001",
    "title": "University of Ibadan (UI) — Admission Overview",
    "slug": "ui-admission-overview",
    "category": "Institutions",
    "institution": "University of Ibadan (UI)",
    "summary": "UI, Nigeria's first and oldest university, admits via UTME/Direct Entry followed by a CBT-based Post-UTME screening exercise, and does not accept IJMB or JUPEB for Direct Entry.",
    "content": "The University of Ibadan (UI) is Nigeria's first and oldest university, and remains one of the country's most competitive institutions for admission. Candidates apply through the standard UTME route or through Direct Entry. For Direct Entry, UI officially accepts qualifications from WAEC, NECO, Cambridge Advanced Level, NCE, ND, HND, and Degree certificates from recognised institutions — but explicitly does not accept IJMB or JUPEB. UI's Post-UTME screening is conducted as a Computer-Based Test (CBT), where candidates answer questions on a computer at the exam venue, rather than a paper-based or purely document-review process."
  },
  {
    "id": "kb-unilag-001",
    "title": "UNILAG (University of Lagos) — Admission Overview",
    "slug": "unilag-admission-overview",
    "category": "Institutions",
    "institution": "University of Lagos (UNILAG)",
    "summary": "UNILAG is a federal university in Lagos and one of Nigeria's most competitive institutions, admitting via UTME/DE followed by a paid online Post-UTME screening and aptitude test.",
    "content": "The University of Lagos (UNILAG), established over six decades ago, is a federal university and one of Nigeria's most sought-after and competitive higher institutions. Admission follows the standard national route: candidates take UTME (or apply via Direct Entry), select UNILAG, and — for the 2026/2027 session — must have scored at least 200 in UTME with UNILAG as their first-choice institution to be eligible for the Post-UTME Online Screening exercise. Eligible candidates then register and pay for screening on the university's own application portal, sit an online Post-UTME aptitude test, and must have their O'Level results uploaded on both JAMB CAPS and the UNILAG application portal by the published deadline for their application to be considered."
  },
  {
    "id": "kb-jamb-001",
    "title": "What is JAMB (Joint Admissions and Matriculation Board)",
    "slug": "what-is-jamb",
    "category": "JAMB",
    "summary": "JAMB is Nigeria's central body for conducting the entrance examination into tertiary institutions and coordinating admissions.",
    "content": "JAMB, the Joint Admissions and Matriculation Board, is the Nigerian government agency responsible for conducting the Unified Tertiary Matriculation Examination (UTME) and coordinating admissions into universities, polytechnics, and colleges of education nationwide. JAMB manages candidate registration, exam scheduling, result release, and the Central Admissions Processing System (CAPS), which institutions use to process and confirm admissions in a transparent, centralized way. The current Registrar of JAMB is Prof. Is-haq Olanrewaju Oloyede."
  }
];

async function seed() {
  let count = 0;
  for (const article of articles) {
    const ref = doc(db, "admission_articles", article.id);
    await setDoc(ref, {
      ...article,
      keywords: [
        ...article.title.toLowerCase().split(/\s+/),
        article.category.toLowerCase(),
        ...(article.keywords ? article.keywords.map(k => k.toLowerCase()) : [])
      ].filter(k => k.length > 2)
    }, { merge: true });
    count++;
  }
  console.log(`Seeded ${count} articles.`);
}

seed().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
