import axios from 'axios';
import { getApiUrl } from './utils';
import universityData from '../data/universities';
import masterCourses from '../data/masterCourses.json';
import { BASELINE_RELEASES } from '../data/postUtmeData';

export type UnifiedResultType =
  | 'internal-tool'
  | 'internal-calculator'
  | 'internal-resource'
  | 'internal-news'
  | 'web';

export interface UnifiedSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  url: string;
  type: UnifiedResultType;
  badge: string;
  isInternal: boolean;
  isLocal?: boolean;
  source?: string;
  category?: string;
  slug?: string;
}

// Backwards compatibility alias for components expecting SearchResultItem
export type SearchResultItem = UnifiedSearchResult;

interface InternalFeatureItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  content: string;
  keywords: string[];
  type: UnifiedResultType;
  badge: string;
}

// A. Verified Core Platform Tools & Features
const CORE_PLATFORM_FEATURES: InternalFeatureItem[] = [
  {
    id: 'tool-calculator-universal',
    title: 'JAMB Aggregate Calculator (Universal 2026 Engine)',
    subtitle: 'Official Institutional Formula Compliance',
    url: '/calculator',
    content: 'Universal admission aggregate calculator for Nigerian Universities, Polytechnics, and Colleges of Education. Supports 50:50 ratio, O\'Level points, and Catchment/ELDS criteria.',
    keywords: ['calculator', 'aggregate', 'jamb', 'utme', 'olevel', 'score', 'waec', 'cutoff', 'point', 'grades', '50:50', 'composite', 'custom formula', 'calculate aggregate'],
    type: 'internal-calculator',
    badge: 'Universal Calculator'
  },
  {
    id: 'tool-calculator-simple',
    title: 'Standard Academic Calculator',
    subtitle: 'Quick Mathematical Utility',
    url: '/calculator-simple',
    content: 'Fast, lightweight arithmetic calculator for quick computation of marks, percentages, and basic study calculations.',
    keywords: ['simple calculator', 'calculator', 'arithmetic', 'math tool', 'basic calc'],
    type: 'internal-calculator',
    badge: 'Calculator'
  },
  {
    id: 'tool-target-score',
    title: 'Target Score & Reverse Aggregate Planner',
    subtitle: 'Admission Strategist & Goal Forecaster',
    url: '/target',
    content: 'Reverse aggregate strategist. Set your dream course cutoff mark to calculate the exact minimum UTME and Post-UTME scores needed to secure merit admission.',
    keywords: ['target', 'target score', 'reverse aggregate', 'goals', 'reverse planner', 'needed score', 'how many points', 'cutoff goal', 'admission target'],
    type: 'internal-tool',
    badge: 'Admission Strategist'
  },
  {
    id: 'tool-admissions-eligibility',
    title: 'Admission Eligibility & O\'Level Subject Verifier',
    subtitle: 'Faculty Guidelines & Combination Verification',
    url: '/admissions',
    content: 'Verify 5-credit O\'Level subject combinations against official faculty guidelines. Compare direct cutoffs, catchment policies, and requirement checks.',
    keywords: ['admissions', 'eligibility', 'checker', 'subject combination', 'olevel check', 'credit', 'requirements', 'faculty', 'admission requirements'],
    type: 'internal-tool',
    badge: 'Eligibility Checker'
  },
  {
    id: 'tool-jamb-caps',
    title: 'JAMB CAPS Portal & Status Decoder',
    subtitle: 'Live Telemetry & Acceptance Flow',
    url: '/jamb-caps',
    content: 'Real-time telemetry and status decoder for JAMB Central Admissions Processing System (CAPS). Decode Admission in Progress (AIP), Recommended, and Acceptance steps.',
    keywords: ['caps', 'jamb caps', 'telemetry', 'admission status', 'aip', 'recommended', 'accept admission', 'reject admission', 'marketplace', 'caps status', 'caps portal'],
    type: 'internal-tool',
    badge: 'CAPS Portal'
  },
  {
    id: 'tool-cbt-simulator',
    title: 'CBT Exam Simulator (JAMB UTME / Post-UTME)',
    subtitle: 'Timed Practice with 8-Key Navigation',
    url: '/cbt-simulator',
    content: 'Timed authentic Computer-Based Test (CBT) practice simulator with official JAMB 8-key navigation (A, B, C, D, P, N, S, R), realistic timer, and instant explanations.',
    keywords: ['cbt', 'simulator', 'exam', 'practice', 'cbt practice', 'jamb cbt', 'utme test', 'mock exam', 'past questions', 'timed test', '8 key', 'practice test'],
    type: 'internal-tool',
    badge: 'Exam Simulator'
  },
  {
    id: 'tool-cbt-history',
    title: 'CBT Performance Analytics & Weak-Topic Diagnostics',
    subtitle: 'Persistent Topic Mastery & Trend Analysis',
    url: '/cbt-history',
    content: 'Persistent analytics tracking topic mastery across multiple completed CBT attempts. Diagnoses high-priority weak areas and historical score progression.',
    keywords: ['cbt history', 'analytics', 'weak topics', 'diagnostics', 'performance', 'topic mastery', 'test history', 'cbt review', 'improving topics', 'practice analytics'],
    type: 'internal-tool',
    badge: 'Topic Analytics'
  },
  {
    id: 'tool-cbt-locator',
    title: 'JAMB CBT Center & Campus Locator',
    subtitle: 'Grounded Maps & Accredited Venues',
    url: '/cbt-locator',
    content: 'Find accredited JAMB CBT registration and examination centers nationwide, campus landmarks, and student hostels with Google Maps grounding.',
    keywords: ['cbt center', 'center locator', 'locator', 'jamb center', 'accredited centers', 'where to register', 'exam center', 'maps', 'cbt venues'],
    type: 'internal-resource',
    badge: 'Center Locator'
  },
  {
    id: 'tool-study-hub',
    title: 'Study Hub & Topic Revision Drills',
    subtitle: 'Subject Mastery, Formulas & Notes',
    url: '/study-hub',
    content: 'Structured subject study, topic-by-topic drills, essential science & arts formulas, and curated revision notes for Nigerian exams.',
    keywords: ['study hub', 'study', 'study mathematics', 'revision', 'drills', 'topics', 'past question revision', 'flashcards', 'formula sheet', 'revision notes'],
    type: 'internal-tool',
    badge: 'Study Hub'
  },
  {
    id: 'tool-cgpa-calculator',
    title: 'CGPA Analytics Studio & GPA Planner',
    subtitle: '5.0 NUC & 4.0 Grading Systems',
    url: '/cgpa-calculator',
    content: 'Academic GPA/CGPA tracker for Nigerian tertiary institutions. Supports 5.0 (NUC) and 4.0 grading scales, class-of-degree forecaster, and semester logs.',
    keywords: ['cgpa', 'gpa', 'cgpa calculator', 'calculate cgpa', 'grade point', 'first class', 'second class', 'semester gpa', 'university grades'],
    type: 'internal-calculator',
    badge: 'CGPA Studio'
  },
  {
    id: 'tool-syllabus-explorer',
    title: 'Master UTME Syllabus Explorer (JAMB & WAEC)',
    subtitle: 'Official Exam Topics & Textbooks',
    url: '/syllabus',
    content: 'Official examination syllabuses for 15+ UTME subjects. Detailed topic breakdowns, learning objectives, and recommended textbooks.',
    keywords: ['syllabus', 'syllabuses', 'utme syllabus', 'jamb syllabus', 'curriculum', 'topics', 'recommended text', 'exam scope', 'waec syllabus'],
    type: 'internal-resource',
    badge: 'Syllabus Explorer'
  },
  {
    id: 'tool-postutme-hub',
    title: '2026 Post-UTME Screening Hub & Release Calendar',
    subtitle: 'Registration Schedules & Cut-off Dates',
    url: '/postutme',
    content: 'Live tracking of official 2026 Post-UTME screening forms, registration opening & closing dates, application portals, and departmental cutoffs.',
    keywords: ['post utme', 'post-utme', 'screening', 'forms', 'registration dates', 'deadline', 'is post utme out', 'screening dates', 'screening calendar'],
    type: 'internal-resource',
    badge: 'Screening Hub'
  },
  {
    id: 'tool-university-directory',
    title: 'Institutional Gateways & University Directory',
    subtitle: '260+ Verified Nigerian Tertiary Portals',
    url: '/universities',
    content: 'Verified direct access directory to 260+ Nigerian Federal, State, and Private universities, polytechnics, and colleges of education.',
    keywords: ['universities', 'university directory', 'institutions', 'portals', 'schools', 'polytechnic', 'colleges of education', 'federal university', 'state university'],
    type: 'internal-resource',
    badge: 'University Directory'
  },
  {
    id: 'tool-admission-checklist',
    title: 'Admission Clearance Document Checklist',
    subtitle: 'Screening & Registration Prerequisites',
    url: '/admission-checklist',
    content: 'Interactive checklist of mandatory clearance credentials: O\'Level statement of results, JAMB admission letter, birth certificate, and state of origin.',
    keywords: ['checklist', 'admission checklist', 'clearance', 'documents', 'admission letter', 'screening requirements', 'birth certificate', 'attestation', 'clearance checklist'],
    type: 'internal-resource',
    badge: 'Clearance Checklist'
  },
  {
    id: 'tool-result-slip-guide',
    title: 'Original JAMB Result Slip Printing Guide',
    subtitle: 'Step-by-step e-Facility Printing',
    url: '/result-slip-guide',
    content: 'Step-by-step verified procedures to print the official colored original JAMB result slip with passport photograph from the e-Facility portal.',
    keywords: ['result slip', 'jamb result slip', 'original result', 'print result', 'efacility', 'passport result', 'jamb slip', 'original result slip'],
    type: 'internal-resource',
    badge: 'Result Guide'
  },
  {
    id: 'tool-ai-advisor',
    title: 'AI Academic Advisor & Admissions Coach',
    subtitle: '24/7 Intelligent University Guidance',
    url: '/chat',
    content: '24/7 intelligent admissions mentor and tutor for subject combination analysis, NUC regulations, cut-off mark queries, and academic coaching.',
    keywords: ['chat', 'ai coach', 'ai advisor', 'tutor', 'admissions help', 'guidance', 'gemini', 'assistant'],
    type: 'internal-tool',
    badge: 'AI Coach'
  },
  {
    id: 'tool-pdf-store',
    title: 'Academic PDF Store & Vault',
    subtitle: 'Past Questions & Verified Brochures',
    url: '/pdf-store',
    content: 'Official past examination questions, verified subject syllabus brochures, and academic prep PDF downloads.',
    keywords: ['pdf store', 'pdf', 'past questions', 'downloads', 'materials', 'ebooks', 'vault'],
    type: 'internal-resource',
    badge: 'PDF Vault'
  },
  {
    id: 'tool-admission-news',
    title: 'Admission News & JAMB Press Bulletins',
    subtitle: 'Official Policy & Campus Announcements',
    url: '/news',
    content: 'Daily verified updates covering JAMB policies, university Post-UTME forms, ASUU negotiations, NUC accreditations, and scholarships.',
    keywords: ['news', 'admission news', 'bulletin', 'updates', 'asuu', 'press release', 'post utme news', 'campus news'],
    type: 'internal-resource',
    badge: 'Admission News'
  }
];

// B. Dedicated School Aggregate Calculators (Real routes in App.tsx)
const DEDICATED_SCHOOL_CALCULATORS: Array<{
  name: string;
  slug: string;
  formula: string;
  keywords: string[];
}> = [
  { name: 'University of Lagos (UNILAG)', slug: 'unilag', formula: '50:30:20 (UTME / 8 + Post-UTME + O\'Level Points)', keywords: ['unilag', 'lagos', 'akoka', 'university of lagos'] },
  { name: 'Lagos State University (LASU)', slug: 'lasu', formula: '50:50 Composite Ratio (UTME 50% + 5 Best O\'Level Grades 50%)', keywords: ['lasu', 'ojo', 'lagos state university', 'lagos state'] },
  { name: 'University of Ibadan (UI)', slug: 'ui', formula: '50:50 Ratio (UTME / 8 + Post-UTME / 2)', keywords: ['ui', 'ibadan', 'university of ibadan'] },
  { name: 'Obafemi Awolowo University (OAU)', slug: 'oau', formula: '50:40:10 Ratio (UTME 50% + Post-UTME 40% + O\'Level 10%)', keywords: ['oau', 'ife', 'great ife', 'obafemi awolowo'] },
  { name: 'University of Benin (UNIBEN)', slug: 'uniben', formula: '50:50 Ratio (UTME / 8 + Post-UTME / 2)', keywords: ['uniben', 'benin', 'university of benin'] },
  { name: 'University of Ilorin (UNILORIN)', slug: 'unilorin', formula: '50:30:20 Ratio (UTME 50% + Post-UTME 30% + O\'Level 20%)', keywords: ['unilorin', 'ilorin', 'better by far', 'university of ilorin'] },
  { name: 'University of Nigeria, Nsukka (UNN)', slug: 'unn', formula: '90:10 Ratio (UTME Score * 0.9 + O\'Level Points * 0.1)', keywords: ['unn', 'nsukka', 'lion', 'university of nigeria'] },
  { name: 'Federal University of Technology, Akure (FUTA)', slug: 'futa', formula: '50:50 Ratio (UTME / 8 + Post-UTME / 2)', keywords: ['futa', 'akure', 'federal university of technology akure'] },
  { name: 'Ahmadu Bello University (ABU Zaria)', slug: 'abu-zaria', formula: '50:50 Ratio (UTME Score / 8 + Post-UTME / 2)', keywords: ['abu', 'zaria', 'ahmadu bello university', 'abu zaria'] },
  { name: 'Federal University, Oye-Ekiti (FUOYE)', slug: 'fuoye', formula: '60:40 Ratio (UTME 60% + O\'Level 40% Online Screening)', keywords: ['fuoye', 'oye ekiti', 'oye-ekiti', 'federal university oye ekiti'] },
  { name: 'Delta State University (DELSU)', slug: 'delsu', formula: '50:50 Composite Screening Formula', keywords: ['delsu', 'abraka', 'delta state university'] },
  { name: 'Kwara State University (KWASU)', slug: 'kwasu', formula: '50:50 Ratio (UTME 50% + O\'Level Points 50%)', keywords: ['kwasu', 'malete', 'kwara state university'] },
  { name: 'Adekunle Ajasin University (AAUA)', slug: 'aaua', formula: 'UTME + Post-UTME Screening Composite Aggregate', keywords: ['aaua', 'akungba', 'adekunle ajasin university'] },
  { name: 'Yaba College of Technology (YABATECH)', slug: 'yabatech', formula: '50:50 National Diploma Screening Aggregate', keywords: ['yabatech', 'yaba tech', 'polytechnic', 'yaba college of technology'] },
  { name: 'Olabisi Onabanjo University (OOU)', slug: 'oou', formula: '50:50 Ratio (UTME 50% + Post-UTME 50%)', keywords: ['oou', 'ago iwoye', 'olabisi onabanjo university'] },
  { name: 'Federal University of Agriculture, Abeokuta (FUNAAB)', slug: 'funaab', formula: '50:50 Composite Grading (UTME 50% + O\'Level 50%)', keywords: ['funaab', 'abeokuta', 'agriculture', 'federal university of agriculture abeokuta'] },
  { name: 'Nnamdi Azikiwe University (UNIZIK)', slug: 'unizik', formula: '70:30 Weighted Ratio (UTME 70% + O\'Level 30%)', keywords: ['unizik', 'awka', 'nnamdi azikiwe university'] },
  { name: 'Federal University of Technology, Owerri (FUTO)', slug: 'futo', formula: '100% Verified UTME + O\'Level Verification', keywords: ['futo', 'owerri', 'federal university of technology owerri'] }
];

// C. UTME Syllabus Subject Catalog
const UTME_SYLLABUS_SUBJECTS = [
  { name: 'English Language (Use of English)', code: 'use-of-english', keywords: ['english', 'use of english', 'comprehension', 'lexis', 'oral english', 'literature in english'] },
  { name: 'Mathematics', code: 'mathematics', keywords: ['math', 'mathematics', 'algebra', 'calculus', 'geometry', 'trigonometry', 'study mathematics'] },
  { name: 'Physics', code: 'physics', keywords: ['physics', 'mechanics', 'optics', 'electricity', 'magnetism', 'waves', 'nuclear physics'] },
  { name: 'Chemistry', code: 'chemistry', keywords: ['chemistry', 'organic chemistry', 'stoichiometry', 'periodic table', 'acids and bases'] },
  { name: 'Biology', code: 'biology', keywords: ['biology', 'ecology', 'genetics', 'physiology', 'cell biology', 'plant biology', 'zoology'] },
  { name: 'Economics', code: 'economics', keywords: ['economics', 'microeconomics', 'macroeconomics', 'demand', 'supply', 'inflation'] },
  { name: 'Government', code: 'government', keywords: ['government', 'constitution', 'political science', 'democracy', 'federalism'] },
  { name: 'Literature in English', code: 'literature', keywords: ['literature', 'literature in english', 'prose', 'poetry', 'drama', 'shakespeare', 'african prose'] },
  { name: 'Christian Religious Studies (CRS)', code: 'crs', keywords: ['crs', 'crk', 'christian religious studies', 'bible knowledge'] },
  { name: 'Islamic Religious Studies (IRS)', code: 'irs', keywords: ['irs', 'irk', 'islamic studies', 'quran', 'hadith'] },
  { name: 'Commerce', code: 'commerce', keywords: ['commerce', 'trade', 'warehousing', 'insurance', 'banking'] },
  { name: 'Financial Accounting', code: 'accounting', keywords: ['accounting', 'accounts', 'balance sheet', 'bookkeeping', 'ledger', 'financial accounting'] },
  { name: 'Agricultural Science', code: 'agriculture', keywords: ['agriculture', 'agric', 'crop science', 'soil science', 'animal science', 'agricultural science'] },
  { name: 'Geography', code: 'geography', keywords: ['geography', 'map reading', 'climatology', 'physical geography'] },
  { name: 'Computer Studies', code: 'computer-studies', keywords: ['computer', 'computer studies', 'ict', 'data processing', 'programming', 'hardware'] }
];

// Helper to normalize input for deterministic string matching
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * High-performance synchronous internal search across CampusAI assets:
 * Core Features, Specific Calculators, Universities, Post-UTME Screenings, Syllabuses, and Degree Courses.
 * Zero network latency, zero Firestore reads.
 */
export const searchInternalCampusAI = (rawQuery: string): UnifiedSearchResult[] => {
  const normalizedQuery = normalizeString(rawQuery);
  if (!normalizedQuery || normalizedQuery.length < 2) return [];

  const queryTokens = normalizedQuery.split(' ').filter(t => t.length > 0);
  const results: Array<{ item: UnifiedSearchResult; score: number }> = [];

  // Scorer testing exact match, prefix, substring, and token intersection
  const scoreMatch = (target: string, boostMultiplier = 1.0): number => {
    const t = normalizeString(target);
    if (!t) return 0;

    if (t === normalizedQuery) return 100 * boostMultiplier;
    if (t.startsWith(normalizedQuery)) return 80 * boostMultiplier;
    if (t.includes(normalizedQuery)) return 60 * boostMultiplier;

    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (t.includes(token)) matchedTokens++;
    }

    if (matchedTokens === queryTokens.length) return 50 * boostMultiplier;
    if (matchedTokens > 0) return (20 * matchedTokens / queryTokens.length) * boostMultiplier;
    return 0;
  };

  const isCalcIntent = normalizedQuery.includes('calc') || normalizedQuery.includes('aggregate') || normalizedQuery.includes('score');
  const isSyllabusIntent = normalizedQuery.includes('syllabus') || normalizedQuery.includes('curriculum') || normalizedQuery.includes('topics');
  const isPostUtmeIntent = normalizedQuery.includes('post utme') || normalizedQuery.includes('screening') || normalizedQuery.includes('form');

  // 1. Core Platform Features
  for (const feat of CORE_PLATFORM_FEATURES) {
    let score = scoreMatch(feat.title, 1.2);
    if (feat.subtitle) {
      score = Math.max(score, scoreMatch(feat.subtitle, 1.0));
    }

    for (const kw of feat.keywords) {
      const kwScore = scoreMatch(kw, 1.1);
      score = Math.max(score, kwScore);
    }

    // Secondary content match
    const contentScore = scoreMatch(feat.content, 0.4);
    score = Math.max(score, contentScore);

    // Intent boosts
    if (isCalcIntent && feat.type === 'internal-calculator') score += 15;
    if (isSyllabusIntent && feat.id === 'tool-syllabus-explorer') score += 25;
    if (isPostUtmeIntent && feat.id === 'tool-postutme-hub') score += 25;

    if (score >= 20) {
      results.push({
        score,
        item: {
          id: feat.id,
          title: feat.title,
          subtitle: feat.subtitle,
          url: feat.url,
          content: feat.content,
          source: 'CampusAI Platform',
          type: feat.type,
          badge: feat.badge,
          isInternal: true,
          isLocal: true
        }
      });
    }
  }

  // 2. Dedicated School Aggregate Calculators
  for (const calc of DEDICATED_SCHOOL_CALCULATORS) {
    let score = scoreMatch(calc.name, 1.3);

    for (const kw of calc.keywords) {
      const kwScore = scoreMatch(kw, 1.2);
      score = Math.max(score, kwScore);
    }

    // Natural queries like "UNILAG calculator" or "calculate UNILAG aggregate"
    const schoolMatched = calc.keywords.some(k => normalizedQuery.includes(normalizeString(k)));
    if (schoolMatched) {
      if (isCalcIntent) {
        score = Math.max(score, 110);
      } else {
        score = Math.max(score, 75);
      }
    }

    if (score >= 25) {
      results.push({
        score: score + 5,
        item: {
          id: `calc-${calc.slug}`,
          title: `${calc.name} Aggregate Calculator`,
          subtitle: `Formula: ${calc.formula}`,
          url: `/${calc.slug}-aggregate-calculator`,
          content: `Official 2026 admission aggregate calculator for ${calc.name}. Verified formula: ${calc.formula}. Calculate your combined merit score.`,
          source: 'CampusAI Calculators',
          type: 'internal-calculator',
          badge: 'School Calculator',
          isInternal: true,
          isLocal: true,
          slug: calc.slug
        }
      });
    }
  }

  // 3. UTME Syllabuses
  for (const subj of UTME_SYLLABUS_SUBJECTS) {
    let score = scoreMatch(subj.name, 1.2);

    for (const kw of subj.keywords) {
      const kwScore = scoreMatch(kw, 1.1);
      score = Math.max(score, kwScore);
    }

    if (isSyllabusIntent && subj.keywords.some(k => normalizedQuery.includes(normalizeString(k)))) {
      score += 35;
    }

    if (score >= 25) {
      results.push({
        score,
        item: {
          id: `syllabus-${subj.code}`,
          title: `JAMB Syllabus: ${subj.name}`,
          subtitle: 'Official UTME Examination Curriculum',
          url: '/syllabus',
          content: `Official UTME curriculum, comprehensive topic breakdown, exam scope, and recommended literature texts for ${subj.name}.`,
          source: 'CampusAI Syllabus',
          type: 'internal-resource',
          badge: 'JAMB Syllabus',
          isInternal: true,
          isLocal: true
        }
      });
    }
  }

  // 4. University Directory (260+ Nigerian Institutions)
  if (Array.isArray(universityData)) {
    for (const uni of universityData) {
      const u = uni as any;
      let score = scoreMatch(u.name || '', 1.1);
      if (u.slug && (u.slug === normalizedQuery || normalizedQuery.includes(u.slug))) {
        score = Math.max(score, 90);
      }
      if (u.shortName && scoreMatch(u.shortName, 1.2) > 50) {
        score = Math.max(score, 85);
      }

      if (score >= 25) {
        results.push({
          score,
          item: {
            id: `uni-${u.slug}`,
            title: u.name,
            subtitle: `${u.category || 'Tertiary'} Institution${u.state ? ` • ${u.state}` : ''}`,
            url: `/universities/${u.slug}`,
            content: `Official Nigerian ${u.category || 'tertiary'} institution profile, direct admission portal access, and verified post-UTME screening gateway.`,
            source: 'CampusAI Directory',
            type: 'internal-resource',
            badge: `${u.category || 'Higher'} Institution`,
            isInternal: true,
            isLocal: true,
            slug: u.slug
          }
        });
      }
    }
  }

  // 5. Post-UTME Screening Hub Releases
  if (BASELINE_RELEASES) {
    for (const [schoolName, release] of Object.entries(BASELINE_RELEASES)) {
      let score = scoreMatch(schoolName, 1.1);
      if (isPostUtmeIntent && scoreMatch(schoolName) > 20) {
        score += 30;
      }

      if (score >= 28) {
        results.push({
          score: score + 5,
          item: {
            id: `postutme-${normalizeString(schoolName).replace(/\s+/g, '-')}`,
            title: `${schoolName} Post-UTME Screening Status`,
            subtitle: `Status: ${release.statusText || 'Pending'}`,
            url: '/postutme',
            content: release.details || `${schoolName} 2026/2027 Post-UTME screening status: ${release.statusText || 'Pending'}. Cut-off: ${release.cutoffScore || 'TBA'}.`,
            source: 'CampusAI Screening Hub',
            type: 'internal-resource',
            badge: release.statusText || 'Post-UTME Hub',
            isInternal: true,
            isLocal: true
          }
        });
      }
    }
  }

  // 6. Master Degree Programmes / Courses (from masterCourses.json)
  if (Array.isArray(masterCourses)) {
    for (const course of masterCourses as Array<{ id: string; title: string }>) {
      const score = scoreMatch(course.title, 1.2);
      if (score >= 35) {
        results.push({
          score,
          item: {
            id: `course-${course.id}`,
            title: `${course.title} (Degree Course)`,
            subtitle: 'JAMB Subject Combinations & Faculty Requirements',
            url: '/admissions',
            content: `Official JAMB 2026 UTME subject combinations, 5-credit O'Level prerequisites, and direct entry guidelines for ${course.title}.`,
            source: 'CampusAI Admissions Explorer',
            type: 'internal-resource',
            badge: 'Course Requirements',
            isInternal: true,
            isLocal: true
          }
        });
      }
    }
  }

  // Sort descending by relevance score
  results.sort((a, b) => b.score - a.score);

  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const uniqueItems: UnifiedSearchResult[] = [];

  for (const { item } of results) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueItems.push(item);
    }
    // Limit to top 8 strong internal results to keep dropdown scannable
    if (uniqueItems.length >= 8) break;
  }

  return uniqueItems;
};

/**
 * Unified Global Search:
 * Concurrently queries the local internal index (0ms response),
 * in parallel with verified Firestore news articles and live external web search intelligence.
 *
 * Results are strictly ordered:
 * 1. Internal CampusAI Results (up to 5-8 items)
 * 2. Internal Firestore News (up to 3-5 items)
 * 3. External Web Results (up to 3-5 items)
 */
export const searchUnified = async (query: string): Promise<UnifiedSearchResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // 1. Instant local internal matches (synchronous)
  const internalMatches = searchInternalCampusAI(trimmed);

  // 2. Fetch server matches (Firestore news + Web Intelligence)
  let serverMatches: UnifiedSearchResult[] = [];
  try {
    const response = await axios.post(getApiUrl('/api/search'), { query: trimmed });
    const rawResults = response.data?.results;
    if (Array.isArray(rawResults)) {
      serverMatches = rawResults.map((r: any, index: number) => {
        const isLocalNews = r.isLocal || (r.url && r.url.startsWith('/news'));
        const type: UnifiedResultType = isLocalNews ? 'internal-news' : 'web';
        return {
          id: isLocalNews ? `news-${r.date || index}-${(r.url || '').replace(/[^a-zA-Z0-9]/g, '')}` : `web-${index}`,
          title: (r.title || 'Portal Update').trim(),
          subtitle: isLocalNews ? (r.category || 'Verified Campus Bulletin') : (r.source || 'External Source'),
          url: r.url || r.link || '',
          content: (r.content || r.snippet || '').trim().substring(0, 300),
          source: isLocalNews ? 'CampusAI News' : (r.source || 'Web Intelligence'),
          type,
          badge: isLocalNews ? 'News' : (r.source || 'Web Intel'),
          isInternal: Boolean(isLocalNews),
          isLocal: Boolean(isLocalNews),
          category: r.category
        };
      });
    }
  } catch (e) {
    console.warn('[searchUnified] Server search endpoint request failed, using instant internal index:', e);
  }

  // 3. Separate news matches from external web matches
  const newsMatches = serverMatches.filter(m => m.isInternal && m.type === 'internal-news').slice(0, 5);
  const webMatches = serverMatches.filter(m => !m.isInternal && m.type === 'web').slice(0, 5);

  // 4. Combine in strict priority order: Internal Platform Assets -> Verified News -> Web Intelligence
  const combined = [...internalMatches, ...newsMatches, ...webMatches];

  // Deduplicate by URL or normalized Title
  const seenKeys = new Set<string>();
  const finalResults: UnifiedSearchResult[] = [];

  for (const item of combined) {
    const key = (item.url || item.title).toLowerCase().trim();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      finalResults.push(item);
    }
  }

  return finalResults;
};

/**
 * Existing external web search for Gemini prompt grounding.
 * Preserved for backward compatibility.
 */
export const searchWeb = async (query: string, usePostUtmeKey = false): Promise<string> => {
  console.log("Starting Search with query:", query);

  try {
    const response = await axios.post(getApiUrl('/api/search'), { query, usePostUtmeKey });
    const results = response.data.results;
    if (!results || !Array.isArray(results)) return "No results found.";
    
    // Limit to top 4 search results to keep prompt size clean and concise
    const limitedResults = results.slice(0, 4);
    
    return limitedResults.map((r: any) => {
      const title = (r.title || "Portal Update").trim();
      const url = r.url || r.link || '';
      let snippet = (r.content || r.snippet || '').trim();
      if (snippet.length > 350) {
        snippet = snippet.substring(0, 350) + "...";
      }
      return `Title: ${title}\nURL: ${url}\nContent: ${snippet}`;
    }).join('\n\n');
  } catch (e) {
    console.error("Search failed:", e);
    return "Search unavailable due to API failure.";
  }
};

/**
 * Existing raw external search for Gemini prompt grounding.
 * Preserved for backward compatibility.
 */
export const searchWebRaw = async (query: string, usePostUtmeKey = false): Promise<SearchResultItem[]> => {
  try {
    const response = await axios.post(getApiUrl('/api/search'), { query, usePostUtmeKey });
    const results = response.data.results;
    if (!results || !Array.isArray(results)) return [];

    const webOnly = results.filter((r: any) => !r.isLocal);
    const limitedResults = (webOnly.length > 0 ? webOnly : results).slice(0, 4);

    return limitedResults.map((r: any, idx: number) => {
      let content = (r.content || r.snippet || "").trim();
      if (content.length > 350) {
        content = content.substring(0, 350) + "...";
      }
      return {
        id: `raw-${idx}`,
        title: (r.title || "Portal Update").trim(),
        url: r.url || r.link || "",
        content: content,
        type: 'web' as const,
        badge: r.source || 'Web Search',
        isInternal: false,
        isLocal: false,
        source: r.source || 'Web Search'
      };
    });
  } catch (e) {
    console.error("Search failed (raw):", e);
  }

  return [];
};
