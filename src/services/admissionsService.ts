import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc, query, where, Timestamp } from 'firebase/firestore';
import { MasterCourse, AdmissionInstitution, AdmissionRequirementOverride, AdmissionArticle } from '../types';
import { slugify } from './utils';
import { handleFirestoreError, OperationType } from './firestoreUtils';
import { JAMB_KNOWLEDGE_BASE } from '../data/jambKnowledgeBase';

const COURSES_COL = 'master_courses';
const INSTITUTIONS_COL = 'admission_institutions';
const OVERRIDES_COL = 'admission_requirement_overrides';
const ARTICLES_COL = 'admission_articles';

// Simple in-memory cache to prevent excessive API calls
let cachedMasterCourses: MasterCourse[] | null = null;
let cachedInstitutions: AdmissionInstitution[] | null = null;
let cachedAdmissionArticles: AdmissionArticle[] | null = null;

let lastMasterCoursesFetch = 0;
let lastInstitutionsFetch = 0;
let lastArticlesFetch = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache duration


export const DEFAULT_MASTER_COURSES: MasterCourse[] = [
  {
    id: 'computer-science',
    courseName: 'Computer Science',
    faculty: 'Science',
    utmeSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
    olevelRequirements: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology/Further Mathematics'],
    directEntryRequirements: 'Two A-Level passes in Mathematics and Physics, or NCE/ND with Upper Credit in Computer Science.',
    updatedAt: null
  },
  {
    id: 'medicine-and-surgery',
    courseName: 'Medicine and Surgery',
    faculty: 'Basic Medical Sciences',
    utmeSubjects: ['English Language', 'Biology', 'Chemistry', 'Physics'],
    olevelRequirements: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
    directEntryRequirements: 'A-Level passes in Biology/Zoology, Chemistry, and Physics in one sitting, or B.Sc in related field with First Class/Second Class Upper.',
    updatedAt: null
  },
  {
    id: 'law',
    courseName: 'Law',
    faculty: 'Law',
    utmeSubjects: ['English Language', 'Literature in English', 'CRK/IRS', 'Government/Economics'],
    olevelRequirements: ['English Language', 'Mathematics', 'Literature in English', 'Government', 'CRK/IRS/Economics'],
    directEntryRequirements: 'Two A-Level passes in Arts or Social Science subjects, or Diploma in Law with Upper Credit.',
    updatedAt: null
  },
  {
    id: 'nursing-science',
    courseName: 'Nursing Science',
    faculty: 'Health Sciences',
    utmeSubjects: ['English Language', 'Biology', 'Chemistry', 'Physics'],
    olevelRequirements: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
    directEntryRequirements: 'Registered Nurse (RN) license or A-Level passes in Biology, Chemistry, and Physics.',
    updatedAt: null
  },
  {
    id: 'electrical-engineering',
    courseName: 'Electrical / Electronics Engineering',
    faculty: 'Engineering',
    utmeSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
    olevelRequirements: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Further Mathematics/Technical Drawing'],
    directEntryRequirements: 'A-Level passes in Mathematics and Physics, or ND/HND Upper Credit in Electrical Engineering.',
    updatedAt: null
  },
  {
    id: 'accounting',
    courseName: 'Accounting / Accountancy',
    faculty: 'Management Sciences',
    utmeSubjects: ['English Language', 'Mathematics', 'Economics', 'Government/Commerce'],
    olevelRequirements: ['English Language', 'Mathematics', 'Economics', 'Financial Accounting/Commerce', 'Government'],
    directEntryRequirements: 'Two A-Level passes including Economics and Accounting, or ATS/ICAN Stage 1.',
    updatedAt: null
  }
];

export const DEFAULT_INSTITUTIONS: AdmissionInstitution[] = [
  {
    id: 'unilag',
    name: 'University of Lagos (UNILAG)',
    state: 'Lagos',
    type: 'University',
    category: 'Federal',
    courses: ['Computer Science', 'Medicine and Surgery', 'Law', 'Electrical / Electronics Engineering', 'Accounting'],
    updatedAt: null
  },
  {
    id: 'ui',
    name: 'University of Ibadan (UI)',
    state: 'Oyo',
    type: 'University',
    category: 'Federal',
    courses: ['Medicine and Surgery', 'Computer Science', 'Law', 'Nursing Science'],
    updatedAt: null
  },
  {
    id: 'abu',
    name: 'Ahmadu Bello University (ABU)',
    state: 'Kaduna',
    type: 'University',
    category: 'Federal',
    courses: ['Computer Science', 'Medicine and Surgery', 'Electrical / Electronics Engineering', 'Accounting'],
    updatedAt: null
  },
  {
    id: 'unn',
    name: 'University of Nigeria, Nsukka (UNN)',
    state: 'Enugu',
    type: 'University',
    category: 'Federal',
    courses: ['Medicine and Surgery', 'Nursing Science', 'Law', 'Electrical / Electronics Engineering'],
    updatedAt: null
  },
  {
    id: 'oau',
    name: 'Obafemi Awolowo University (OAU)',
    state: 'Osun',
    type: 'University',
    category: 'Federal',
    courses: ['Computer Science', 'Medicine and Surgery', 'Law', 'Accounting'],
    updatedAt: null
  },
  {
    id: 'lasu',
    name: 'Lagos State University (LASU)',
    state: 'Lagos',
    type: 'University',
    category: 'State',
    courses: ['Computer Science', 'Law', 'Nursing Science', 'Accounting'],
    updatedAt: null
  }
];

export const DEFAULT_ADMISSION_ARTICLES: AdmissionArticle[] = [
  {
    id: 'ui_2025_2026_cutoffs',
    slug: 'ui-2025-2026-cutoffs',
    title: 'University of Ibadan (UI) Official 2025/2026 Departmental Cut-Off Marks',
    category: 'Cutoff Marks',
    summary: 'Official University of Ibadan (UI) Undergraduate Admissions Unit approved cut-off marks across all 13 Faculties for the 2025/2026 academic session covering Merit, Catchment, and ELDS quotas.',
    content: '### University of Ibadan (UI) 2025/2026 Cut-Off Marks\n\nThe Undergraduate Admissions Unit of the University of Ibadan (UI) has officially released the approved departmental aggregate cut-off marks for the 2025/2026 admission exercise.\n\n#### Key Departmental Benchmarks (Merit / Catchment / ELDS):\n- **Medicine & Surgery**: 78.875 / 78.875 / 77.375\n- **Nursing Science**: 71.375 / 71.375 / 67.875\n- **Law**: 70.875 / 70.875 / 67.625\n- **Mechanical Engineering**: 70.500 / 70.500 / 60.125\n- **Electrical and Electronics Engineering**: 70.000 / 70.000 / 58.875\n- **Pharmacy**: 69.125 / 69.125 / 62.875\n- **Dentistry**: 68.625 / 68.625 / 66.750\n- **Accounting**: 68.500 / 68.500 / 66.125\n- **Physiotherapy**: 65.125 / 65.125 / 61.625\n- **Computer Science**: 63.500 / 63.500 / 53.500\n- **Medical Laboratory Science**: 63.250 / 63.250 / 60.250\n- **Civil Engineering**: 63.250 / 63.250 / 57.000\n- **Petroleum Engineering**: 62.750 / 62.750 / 57.125\n- **Communication and Language Arts**: 61.000 / 61.000 / 58.500\n- **Economics**: 58.125 / 58.125 / 53.625\n- **Veterinary Medicine**: 57.125 / 57.125 / 57.125\n\n#### Institutional Aggregate Formula:\nUI uses a 50:50 combination of UTME and Post-UTME:\n**Aggregate = (JAMB / 8) + (Post-UTME / 2)** (Maximum: 100 points, Baseline minimum: 50.0 points).',
    last_verified: 'August 2026',
    next_review: 'November 2026',
    version: 1,
    official_sources: ['https://www.ui.edu.ng', 'https://admissions.ui.edu.ng'],
    institution: 'University of Ibadan (UI)',
    keywords: ['ui', 'university of ibadan', 'cut off marks', '2025/2026', 'merit', 'catchment', 'elds', 'medicine', 'nursing', 'law', 'engineering'],
    updatedAt: null
  },
  {
    id: 'jamb_2026_policy_meeting',
    slug: 'jamb-2026-policy-meeting',
    title: 'JAMB 2026 Official Policy Guidelines & Minimum Cutoff Benchmarks',
    category: 'Policy & Guidelines',
    summary: 'Official breakdown of the 2026 JAMB policy meeting conclusions regarding minimum UTME score thresholds for Universities, Polytechnics, and Colleges of Education.',
    content: "### Key Policy Takeaways\n\n1. **University Cut-off Minimum**: 140 score baseline for Federal and State universities, though individual competitive courses maintain higher thresholds (e.g. 200+ for Medicine & Law).\n2. **Polytechnic Baseline**: Minimum 100-120 JAMB score.\n3. **O-Level Verification**: Uploading 5 O-Level credit passes on JAMB CAPS is mandatory prior to admission consideration. You can [buy your O'Level verification code here](https://buyresultsverificationcode.ng/?fbclid=IwY2xjawT83JFwZG9mAWV4dG4DYWVtAjEwAGJyaWQRMVl2M3BqODFFcTUwSGtwbWhzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe10oz4ePhZXWZvYxSjH_eeJsTj49p4KWzIzA7vTBCTYps-6xrG7536zJnmgk_aem_zxhBW4ca0ejN3YDJVPL6QA).",
    last_verified: null,
    next_review: null,
    version: 1,
    official_sources: ['https://www.jamb.gov.ng'],
    institution: 'JAMB Headquarters',
    keywords: ['policy', 'jamb', 'cutoff', '2026', 'guidelines'],
    updatedAt: null
  },
  {
    id: 'post_utme_2026_releases',
    slug: 'post-utme-2026-releases',
    title: '2026/2027 Post-UTME Screening Procedures & Eligibility Rules',
    category: 'Post-UTME',
    summary: 'Comprehensive instructions on how candidates can register for institutional screening exercises, calculate aggregate scores, and upload credentials.',
    content: '### Post-UTME Registration Overview\n\n- Ensure your institution choice is declared as **First Choice** on JAMB CAPS.\n- Prepare your O-Level result printout (WAEC/NECO/NABTEB) and JAMB result slip.\n- Calculate institutional aggregate (typically 50% JAMB + 30% Post-UTME + 20% O-Level).',
    last_verified: null,
    next_review: null,
    version: 1,
    official_sources: ['https://myschool.ng'],
    institution: 'National Universities Commission',
    keywords: ['post-utme', 'screening', 'aggregate', 'registration'],
    updatedAt: null
  },
  {
    id: 'jamb_de_outstanding_clearance',
    slug: 'jamb-de-outstanding-clearance',
    title: 'JAMB Direct Entry (DE) A-Level Verification & Clearance Protocol',
    category: 'Direct Entry',
    summary: 'Direct Entry candidates with IJMB, JUPEB, NCE, or ND results must verify their certificate authenticity through the JAMB DE portal.',
    content: '### Direct Entry Guidelines\n\n- All JUPEB & IJMB results must be verified directly by awarding exam bodies.\n- Candidates without verified A-Level results on CAPS will not be cleared by target universities.\n- Ensure matriculation status is accurately declared.',
    last_verified: null,
    next_review: null,
    version: 1,
    official_sources: ['https://www.jamb.gov.ng'],
    institution: 'JAMB DE Portal',
    keywords: ['direct entry', 'jupeb', 'ijmb', 'verification', 'de'],
    updatedAt: null
  },
  {
    id: 'jamb_returnee_advisory',
    slug: 'jamb-returnee-advisory',
    title: 'JAMB CAPS Transfer & Program Acceptance Regulations 2026',
    category: 'CAPS Portal',
    summary: 'How to accept or reject program transfers on JAMB CAPS without losing admission opportunities.',
    content: '### CAPS Transfer Rules\n\n- If your preferred program is full, institutions may offer a transfer to a related course.\n- Candidates must log into JAMB CAPS, navigate to "Transfer Approval", and accept before the offer expires.\n- Unaccepted transfers automatically revert to candidate pool after the deadline.',
    last_verified: null,
    next_review: null,
    version: 1,
    official_sources: ['https://www.jamb.gov.ng'],
    institution: 'JAMB CAPS',
    keywords: ['caps', 'transfer', 'acceptance', 'jamb portal'],
    updatedAt: null
  },
  {
    id: 'jamb_result_slip',
    slug: 'jamb-result-slip',
    title: 'JAMB Official Original Result Slip Printing Guide',
    category: 'Examination Results',
    summary: 'The Official Original JAMB Result Slip features your passport photograph, detailed subject scores, and institution choices. It is a mandatory document required for Post-UTME screening, physical clearance, and university registration.',
    content: '### Detailed Overview of JAMB Original Result Slip\n\nEvery candidate who sat for the Unified Tertiary Matriculation Examination (UTME) must print their original result slip from the JAMB e-Facility portal. Unlike the free notification of result, the Original Result Slip is a security-enabled document with a barcode, passport photograph, and watermarked security background.\n\n### Requirements for Printing\n1. A device with internet access.\n2. Your JAMB Registration Number.\n3. A valid payment card or internet banking options.\n4. A PDF reader and a standard printer (color printing is highly recommended).',
    steps: [
      'Log into your JAMB e-Facility account via (https://efacility.jamb.gov.ng) using your registered email and password.',
      'On the e-Facility dashboard, locate and click on the "Print Result Slip" service card.',
      'Select your examination year and input your JAMB Registration Number in the provided field.',
      'Click on "Pay with Remita" or your preferred payment method. The official cost is ₦1,700 plus merchant processing fees.',
      'Complete the payment transaction. Once approved, you will be redirected back to the JAMB portal.',
      'Click on the "Print Result Slip" button to generate and download your official PDF result slip.',
      'Open the PDF and print it in full color. It is highly recommended to print at least 3 extra copies for your screening files.'
    ],
    important_dates: [
      { event: 'Result Release Date', date: 'Usually 4-7 days after UTME completion' },
      { event: 'Printing Period', date: 'Available throughout the admission cycle' }
    ],
    fees: [
      { purpose: 'Official JAMB Portal Fee', amount: '₦1,700' },
      { purpose: 'Cyber Cafe / Printing Fee (Optional)', amount: '₦200 - ₦500' }
    ],
    faq: [
      {
        q: 'Can I print my JAMB result slip more than once?',
        a: 'Yes. Once you pay the ₦1,700 fee on the e-Facility portal, you can log back in and download/print the PDF as many times as you want without paying again.'
      },
      {
        q: 'Is a colored printout mandatory?',
        a: 'Yes, most universities and polytechnics require a colored printout for physical clearance so that your passport photograph is clearly visible.'
      },
      {
        q: 'What if I forgot my e-Facility login details?',
        a: 'You can use the "Forgot Password" link on the login page or retrieve them using your JAMB registered SMS code or visiting any JAMB CBT center.'
      }
    ],
    last_verified: 'August 2026',
    next_review: 'November 2026',
    version: 1,
    official_sources: ['https://efacility.jamb.gov.ng', 'https://www.jamb.gov.ng'],
    institution: 'Joint Admissions and Matriculation Board (JAMB)',
    keywords: ['result slip', 'jamb slip', 'original result', 'printing', 'efacility', 'fees'],
    updatedAt: null
  },
  ...JAMB_KNOWLEDGE_BASE.filter(doc => doc.id !== 'jamb_result_slip').map(doc => ({
    id: doc.id,
    slug: doc.id,
    title: doc.title,
    category: doc.category,
    institution: doc.organization,
    summary: doc.summary,
    content: (doc.steps ? '### Steps\n' + doc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n' : '') + 
             (doc.requirements ? '### Requirements\n' + doc.requirements.map(r => `- ${r}`).join('\n') + '\n\n' : '') +
             (doc.important_notes ? '### Important Notes\n' + doc.important_notes.map(n => `- ${n}`).join('\n') : ''),
    steps: doc.steps,
    requirements: doc.requirements,
    official_sources: doc.official_source ? [doc.official_source] : undefined,
    keywords: [doc.category.toLowerCase(), ...(doc.subcategory ? [doc.subcategory.toLowerCase()] : [])],
    last_verified: doc.last_verified
  }))
];

export const admissionsService = {
  /**
   * Master Courses
   */
  getAllMasterCourses: async (): Promise<MasterCourse[]> => {
    if (!db) return DEFAULT_MASTER_COURSES;
    if (cachedMasterCourses && (Date.now() - lastMasterCoursesFetch < CACHE_TTL)) {
      return cachedMasterCourses;
    }
    try {
      const snap = await getDocs(collection(db, COURSES_COL));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterCourse));
      const result = list.length > 0 ? list : DEFAULT_MASTER_COURSES;
      cachedMasterCourses = result;
      lastMasterCoursesFetch = Date.now();
      return result;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COURSES_COL);
      return DEFAULT_MASTER_COURSES;
    }
  },

  getMasterCourse: async (idOrName: string): Promise<MasterCourse | null> => {
    if (!db) return DEFAULT_MASTER_COURSES.find(c => c.id === idOrName || c.courseName === idOrName) || null;
    try {
      const id = slugify(idOrName);
      const snap = await getDoc(doc(db, COURSES_COL, id));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as MasterCourse;
      
      const q = query(collection(db, COURSES_COL), where("courseName", "==", idOrName));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) return { id: qSnap.docs[0].id, ...qSnap.docs[0].data() } as MasterCourse;
      
      return DEFAULT_MASTER_COURSES.find(c => c.id === idOrName || c.courseName === idOrName) || null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, COURSES_COL + '/' + idOrName);
      return DEFAULT_MASTER_COURSES.find(c => c.id === idOrName || c.courseName === idOrName) || null;
    }
  },

  /**
   * Institutions
   */
  getAllInstitutions: async (): Promise<AdmissionInstitution[]> => {
    if (!db) return DEFAULT_INSTITUTIONS;
    if (cachedInstitutions && (Date.now() - lastInstitutionsFetch < CACHE_TTL)) {
      return cachedInstitutions;
    }
    try {
      const snap = await getDocs(collection(db, INSTITUTIONS_COL));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionInstitution));
      const result = list.length > 0 ? list : DEFAULT_INSTITUTIONS;
      cachedInstitutions = result;
      lastInstitutionsFetch = Date.now();
      return result;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, INSTITUTIONS_COL);
      return DEFAULT_INSTITUTIONS;
    }
  },

  getInstitution: async (idOrName: string): Promise<AdmissionInstitution | null> => {
    if (!db) return DEFAULT_INSTITUTIONS.find(i => i.id === idOrName || i.name === idOrName) || null;
    try {
      const id = slugify(idOrName);
      const snap = await getDoc(doc(db, INSTITUTIONS_COL, id));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as AdmissionInstitution;
      
      const q = query(collection(db, INSTITUTIONS_COL), where("name", "==", idOrName));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) return { id: qSnap.docs[0].id, ...qSnap.docs[0].data() } as AdmissionInstitution;
      
      return DEFAULT_INSTITUTIONS.find(i => i.id === idOrName || i.name === idOrName) || null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, INSTITUTIONS_COL + '/' + idOrName);
      return DEFAULT_INSTITUTIONS.find(i => i.id === idOrName || i.name === idOrName) || null;
    }
  },

  /**
   * Overrides & Special Considerations
   */
  getOverrides: async (institutionId: string, courseId: string): Promise<AdmissionRequirementOverride[]> => {
    if (!db) return [];
    try {
      const q = query(
        collection(db, OVERRIDES_COL),
        where("institutionId", "==", institutionId),
        where("courseId", "==", courseId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionRequirementOverride));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, OVERRIDES_COL);
      return [];
    }
  },

  /**
   * Admin Seeding Tools (Internal use)
   */
  seedAllBaselineData: async (): Promise<{ coursesSeeded: number; institutionsSeeded: number; articlesSeeded: number }> => {
    if (!db) throw new Error("Firestore is not connected.");

    let coursesSeeded = 0;
    let institutionsSeeded = 0;
    let articlesSeeded = 0;

    for (const c of DEFAULT_MASTER_COURSES) {
      await admissionsService.upsertMasterCourse(c);
      coursesSeeded++;
    }

    for (const inst of DEFAULT_INSTITUTIONS) {
      await admissionsService.upsertInstitution(inst);
      institutionsSeeded++;
    }

    for (const art of DEFAULT_ADMISSION_ARTICLES) {
      await admissionsService.upsertAdmissionArticle(art);
      articlesSeeded++;
    }

    return { coursesSeeded, institutionsSeeded, articlesSeeded };
  },

  upsertMasterCourse: async (course: Partial<MasterCourse>) => {
    if (!db) return;
    
    // 1. Validation & Required Fields
    if (!course.courseName) throw new Error("courseName is required");
    if (!course.utmeSubjects || !Array.isArray(course.utmeSubjects)) throw new Error("utmeSubjects must be an array");
    if (!course.olevelRequirements || !Array.isArray(course.olevelRequirements)) throw new Error("olevelRequirements must be an array");
    
    const id = slugify(course.courseName);
    const ref = doc(db, COURSES_COL, id);
    
    // 2. Indexing (Keywords)
    const keywords = Array.from(new Set([
      ...course.courseName.toLowerCase().split(/\s+/),
      ...(course.faculty ? course.faculty.toLowerCase().split(/\s+/) : [])
    ])).filter(k => k.length > 2);

    // 3. Version History & Deduplication
    const existingSnap = await getDoc(ref);
    let newVersion = 1;
    
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as MasterCourse;
      newVersion = (existingData.version || 0) + 1;
      
      // Save to history
      const historyRef = doc(collection(db, `${COURSES_COL}_history`));
      await setDoc(historyRef, {
        ...existingData,
        originalId: id,
        archivedAt: Timestamp.now()
      });
    }

    const payload = {
      ...course,
      keywords,
      version: newVersion,
      lastVerified: course.lastVerified || Timestamp.now(),
      nextReview: course.nextReview || Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year default
      updatedAt: Timestamp.now()
    };

    await setDoc(ref, payload, { merge: true });
  },

  upsertInstitution: async (inst: Partial<AdmissionInstitution>) => {
    if (!db) return;
    
    // 1. Validation & Required Fields
    if (!inst.name) throw new Error("name is required");
    if (!inst.type || !['University', 'Polytechnic', 'College of Education', 'Innovation Enterprise Institution'].includes(inst.type)) throw new Error("Invalid or missing type");
    if (!inst.category || !['Federal', 'State', 'Private'].includes(inst.category)) throw new Error("Invalid or missing category");
    
    const id = slugify(inst.name);
    const ref = doc(db, INSTITUTIONS_COL, id);

    // 2. Indexing (Keywords)
    const keywords = Array.from(new Set([
      ...inst.name.toLowerCase().split(/\s+/),
      ...(inst.state ? inst.state.toLowerCase().split(/\s+/) : []),
      inst.type.toLowerCase(),
      inst.category.toLowerCase()
    ])).filter(k => k.length > 2);

    // 3. Version History & Deduplication
    const existingSnap = await getDoc(ref);
    let newVersion = 1;

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as AdmissionInstitution;
      newVersion = (existingData.version || 0) + 1;
      
      // Save to history
      const historyRef = doc(collection(db, `${INSTITUTIONS_COL}_history`));
      await setDoc(historyRef, {
        ...existingData,
        originalId: id,
        archivedAt: Timestamp.now()
      });
    }

    const payload = {
      ...inst,
      keywords,
      version: newVersion,
      lastVerified: inst.lastVerified || Timestamp.now(),
      nextReview: inst.nextReview || Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year default
      updatedAt: Timestamp.now()
    };

    await setDoc(ref, payload, { merge: true });
  },

  upsertAdmissionArticle: async (article: Partial<AdmissionArticle>) => {
    if (!db) return;
    
    // 1. Validation & Required Fields
    if (!article.title) throw new Error("title is required");
    if (!article.id) throw new Error("id is required");
    
    const id = article.id;
    const ref = doc(db, ARTICLES_COL, id);

    // 2. Indexing (Keywords)
    const keywords = Array.from(new Set([
      ...article.title.toLowerCase().split(/\s+/),
      ...(article.category ? article.category.toLowerCase().split(/\s+/) : []),
      ...(article.keywords ? article.keywords.map(k => k.toLowerCase()) : [])
    ])).filter(k => k.length > 2);

    // 3. Version History & Deduplication
    const existingSnap = await getDoc(ref);
    let newVersion = 1;

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as AdmissionArticle;
      newVersion = (parseInt(existingData.version as any) || 0) + 1;
      
      // Save to history
      const historyRef = doc(collection(db, `${ARTICLES_COL}_history`));
      await setDoc(historyRef, {
        ...existingData,
        originalId: id,
        archivedAt: Timestamp.now()
      });
    }

    const payload = {
      ...article,
      keywords,
      version: newVersion,
      last_verified: article.last_verified || Timestamp.now(),
      next_review: article.next_review || Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year default
      updatedAt: Timestamp.now()
    };

    await setDoc(ref, payload, { merge: true });
  },

  getAllAdmissionArticles: async (): Promise<AdmissionArticle[]> => {
    if (!db) return DEFAULT_ADMISSION_ARTICLES;
    if (cachedAdmissionArticles && (Date.now() - lastArticlesFetch < CACHE_TTL)) {
      return cachedAdmissionArticles;
    }
    try {
      const snap = await getDocs(collection(db, ARTICLES_COL));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionArticle));
      
      const listIds = new Set(list.map(item => item.id));
      const result = [...list];
      for (const defaultArt of DEFAULT_ADMISSION_ARTICLES) {
        if (!listIds.has(defaultArt.id)) {
          result.push(defaultArt);
        }
      }
      
      cachedAdmissionArticles = result;
      lastArticlesFetch = Date.now();
      return result;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, ARTICLES_COL);
      return DEFAULT_ADMISSION_ARTICLES;
    }
  }
};
