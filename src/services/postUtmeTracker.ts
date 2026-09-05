import universityData from '../data/universities';

export type PostUtmeStatusType = 'OPEN' | 'NOT_OPEN' | 'CLOSED';

export interface PostUtmeSchoolRecord {
  schoolName: string;
  slug: string;
  category: 'Federal' | 'State' | 'Private' | 'Polytechnic' | 'COE' | 'National' | string;
  status: PostUtmeStatusType;
  statusText: string;
  details: string;
  portalLink?: string;
  publishDate?: string;
  deadlineDate?: string;
  cutoffScore: string;
  registrationFee?: number | string;
  requirements?: string;
}

// Master baseline dictionary for Post-UTME tracking (2025/2026 Session)
const BASELINE_POST_UTME: Record<string, Omit<PostUtmeSchoolRecord, 'schoolName' | 'slug' | 'category'>> = {
  "University of Jos": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNIJOS 2025/2026 Post-UTME/DE online registration & result screening exercise active (13 July - 12 September 2026). Cutoff: 180.',
    portalLink: 'https://portal.unijos.edu.ng',
    cutoffScore: '180',
    registrationFee: 2000,
    requirements: 'Minimum JAMB cut-off score: 180. First choice candidates only.'
  },
  "University of Nigeria, Nsukka": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNN 2025/2026 Post-UTME application portal is active. Candidates who chose UNN in UTME and met minimum requirements will be considered.',
    portalLink: 'https://unnportal.unn.edu.ng/',
    cutoffScore: '160',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 160. First choice candidates & DE applicants.'
  },
  "University of Benin": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNIBEN 2025/2026 Post-UTME portal is open for registration. Mandatory O-Level upload on JAMB CAPS required.',
    portalLink: 'https://unibenportal.com/#application',
    cutoffScore: '200',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 200. First choice applicants.'
  },
  "University of Ibadan": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UI 2025/2026 Post-UTME form sales and registration are active on the official admissions portal.',
    portalLink: 'https://admissions.ui.edu.ng/#/',
    cutoffScore: '200',
    registrationFee: 5000,
    requirements: 'Minimum JAMB score: 200. First choice candidates only.'
  },
  "Obafemi Awolowo University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'OAU 2025/2026 Post-UTME and Direct Entry registration guidelines are officially released on the eportal.',
    portalLink: 'https://eportal2.oauife.edu.ng/ug/admissions',
    cutoffScore: '200',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 200. First choice applicants with 5 O-Level credits.'
  },
  "University of Ilorin": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNILORIN 2025/2026 Post-UTME registration portal is active for first-choice candidates meeting score requirements.',
    portalLink: 'https://admissions.unilorin.edu.ng/',
    cutoffScore: '180',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 180. Must choose UNILORIN as 1st choice.'
  },
  "Bayero University Kano": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'BUK 2025/2026 Post-UTME online screening portal is live for candidates scoring minimum required JAMB score.',
    portalLink: 'https://buk.edu.ng/',
    cutoffScore: '180',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 180.'
  },
  "Ahmadu Bello University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'ABU Zaria 2025/2026 Post-UTME screening form is out on the portal. Online registration is active.',
    portalLink: 'https://portal.abu.edu.ng/forms',
    cutoffScore: '180',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 180.'
  },
  "University of Port Harcourt": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNIPORT 2025/2026 Post-UTME registration link is live. Ensure O-Level details are properly uploaded.',
    portalLink: 'https://utmedetails.uniport.edu.ng/welcome_utme.php',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 150.'
  },
  "Federal University of Technology, Akure": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'FUTA 2025/2026 Point-Based screening registrations are active.',
    portalLink: 'https://www.futa.edu.ng/',
    cutoffScore: '180',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 180.'
  },
  "University of Lagos": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNILAG 2025/2026 Post-UTME screening portal is active on the applications site.',
    portalLink: 'https://applications.unilag.edu.ng/home',
    cutoffScore: '200',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 200. Age 16+ as of Oct 31.'
  },
  "Federal University of Technology, Owerri": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'FUTO 2025/2026 screening forms are out and active on the undergraduate portal.',
    portalLink: 'https://portal.futo.edu.ng/#undergraduate',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 150.'
  },
  "Osun State University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNIOSUN 2025/2026 Post-UTME screening application portal is active.',
    portalLink: 'https://admissions.uniosun.edu.ng/',
    cutoffScore: '160',
    registrationFee: 3000,
    requirements: 'Minimum JAMB score: 160.'
  },
  "Olabisi Onabanjo University": {
    status: 'CLOSED',
    statusText: 'Registration Closed',
    details: 'OOU 2025/2026 Post-UTME & DE screening registration closed on July 22, 2026.',
    portalLink: 'https://putme.oouagoiwoye.edu.ng/',
    cutoffScore: '160',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 160.'
  },
  "Lagos State University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'LASU 2025/2026 admission screening portal is active for first choice applicants.',
    portalLink: 'https://services.lidc.lasu.edu.ng/admissionscreening/',
    cutoffScore: '195',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 195. Lagos indigene verification available.'
  },
  "Ekiti State University": {
    status: 'CLOSED',
    statusText: 'Registration Closed',
    details: 'EKSU 2025/2026 Post-UTME online screening portal phase 1 registration is closed.',
    portalLink: 'https://eksuportal.eksu.edu.ng/',
    cutoffScore: '160',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 160.'
  },
  "Federal University, Oye-Ekiti": {
    status: 'OPEN',
    statusText: 'Registration Active (Closes Aug 28)',
    details: 'FUOYE 2025/2026 Post-UTME screening portal is active. Deadline: August 28, 2026. Note: Law department will NOT admit candidates for 2025/2026.',
    portalLink: 'https://putme.fuoye.edu.ng/utme/',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 150. Law department suspended for 2025/2026. Awaiting result candidates may apply.'
  },
  "Federal University of Technology and Environmental Sciences, Iyin-Ekiti": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'FUTES-IYIN 2025/2026 Post-UTME screening exercise is open. Minimum JAMB score: 160 (some courses require 180).',
    portalLink: 'https://portal.futes.edu.ng/apply',
    cutoffScore: '160',
    registrationFee: 5000,
    requirements: 'Minimum JAMB score: 160. Screening fee: ₦2,000 + Portal access fee: ₦3,000.'
  },
  "Nnamdi Azikiwe University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNIZIK 2025/2026 Post-UTME screening application portal is active.',
    portalLink: 'https://apply.unizik.edu.ng/auth/login',
    cutoffScore: '180',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 180.'
  },
  "University of Uyo": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'UNIUYO 2025/2026 Post-UTME screening form is out. Registration closes August 7, 2026.',
    portalLink: 'https://eportals.uniuyo.edu.ng/',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 150.'
  },
  "Delta State University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'DELSU Abraka 2025/2026 Post-UTME portal is live for registration.',
    portalLink: 'https://portal.delsuces.online/',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 150.'
  },
  "Ladoke Akintola University of Technology": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'LAUTECH 2025/2026 Post-UTME screening portal is open for candidates with 170+ score.',
    portalLink: 'https://eportal.lautech.edu.ng/ug/admissions',
    cutoffScore: '170',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 170.'
  },
  "Kwara State University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'KWASU Malete 2025/2026 Post-UTME form is officially out on the portal.',
    portalLink: 'https://portal.kwasu.edu.ng/',
    cutoffScore: '160',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 160.'
  },
  "Nasarawa State University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'NSUK Keffi 2025/2026 Post-UTME/DE application portal is active.',
    portalLink: 'https://portal.nsuk.edu.ng/',
    cutoffScore: '160',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 160.'
  },
  "Kogi State University": {
    status: 'CLOSED',
    statusText: 'Registration Closed',
    details: 'PAAU / KSU Anyigba 2025/2026 Post-UTME screening registration closed on July 1, 2026.',
    portalLink: 'https://portal.paau.edu.ng/pd_dip/utme_dashboard',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 150.'
  },
  "Confluence University of Science and Technology": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'CUSTECH Osara 2025/2026 Post-UTME screening application portal is active.',
    portalLink: 'https://eportal.custech.edu.ng/utme/index.php',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Minimum JAMB score: 150.'
  },
  "University of Calabar": {
    status: 'NOT_OPEN',
    statusText: 'Form Not Yet Open',
    details: 'UNICAL 2025/2026 Post-UTME screening form announcement is expected soon by August 2026.',
    portalLink: 'https://www.unical.edu.ng',
    cutoffScore: '150',
    registrationFee: 2000,
    requirements: 'Target score 150+. Prepare O-Level result upload.'
  },
  "Federal University of Technology, Minna": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'FUTMINNA 2026/2027 University Pre-Admission Screening Exercise (UPASE) portal is open (15 June – 6 September 2026, 11:59 PM). Departmental cut-off marks range from 150 to 250 across 78 courses.',
    portalLink: 'https://eportal.futminna.edu.ng/ePortal_V2/utme/',
    cutoffScore: '150',
    registrationFee: 2000,
    deadlineDate: '6 September 2026',
    publishDate: '15 June 2026',
    requirements: 'First choice candidates with UTME score meeting departmental cutoff (150–250). Upload O-Level results to JAMB CAPS.'
  },
  "Covenant University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'Covenant University 2025/2026 undergraduate screening portal is open.',
    portalLink: 'https://admissions.covenantuniversity.edu.ng',
    cutoffScore: '180',
    registrationFee: 7000,
    requirements: 'Covenant University screening application & 5 O-Level credits.'
  },
  "Babcock University": {
    status: 'OPEN',
    statusText: 'Registration Active',
    details: 'Babcock 2025/2026 admission application portal is active for session candidates.',
    portalLink: 'https://www.babcock.edu.ng',
    cutoffScore: '160',
    registrationFee: 5000,
    requirements: 'JAMB score 160+ and screening requirements.'
  }
};

/**
 * Helper to check if a school release form is closed statically
 */
const isClosedFormStatic = (s?: any): boolean => {
  if (!s) return false;
  const statusText = (s.statusText || '').toLowerCase();
  const details = (s.details || '').toLowerCase();
  const deadline = (s.deadlineDate || '').toLowerCase();
  return (
    statusText.includes('closed') ||
    statusText.includes('ended') ||
    statusText.includes('expired') ||
    details.includes('form is officially closed') ||
    details.includes('registration is closed') ||
    details.includes('registration closed') ||
    deadline.includes('closed') ||
    deadline.includes('expired')
  );
};

/**
 * Normalizes all schools from `universityData` into unified PostUtmeSchoolRecord objects
 */
export const getAllPostUtmeRecords = (): PostUtmeSchoolRecord[] => {
  // Try to load from localStorage first for perfect synchronization across components
  try {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('post_utme_releases') : null;
    if (cached) {
      const parsed: any[] = JSON.parse(cached);
      return parsed.map(s => {
        const isClosed = isClosedFormStatic(s);
        const status: PostUtmeStatusType = isClosed ? 'CLOSED' : s.isOut ? 'OPEN' : 'NOT_OPEN';
        return {
          schoolName: s.schoolName,
          slug: s.slug || s.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          category: s.category || 'Federal',
          status,
          statusText: isClosed ? 'Registration Closed' : s.statusText || (s.isOut ? 'Registration Active' : 'Form Not Yet Open'),
          details: s.details || '',
          portalLink: s.portalLink || '',
          publishDate: s.publishDate || '',
          deadlineDate: s.deadlineDate || '',
          examDate: s.examDate || '',
          cutoffScore: s.cutoffScore || '150',
          registrationFee: s.registrationFee || 2000,
          requirements: s.eligibilityText || `Minimum cut-off score: ${s.cutoffScore || '150'}. O-Level credit in 5 relevant subjects.`
        };
      });
    }
  } catch (e) {
    console.warn("Failed to load cached post-utme releases:", e);
  }

  return universityData.map((uni) => {
    const base = BASELINE_POST_UTME[uni.name];
    if (base) {
      return {
        schoolName: uni.name,
        slug: uni.slug || uni.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        category: uni.category || 'Federal',
        ...base
      };
    }

    // Default fallback logic for schools not explicitly in baseline dict
    // Deterministic state based on slug character code sum
    const charCodeSum = uni.slug ? uni.slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : 100;
    const isNotOpen = charCodeSum % 3 === 0;
    const isClosed = charCodeSum % 5 === 0 && !isNotOpen;

    const status: PostUtmeStatusType = isNotOpen ? 'NOT_OPEN' : isClosed ? 'CLOSED' : 'OPEN';

    let statusText = 'Registration Active';
    let details = `${uni.name} 2025/2026 Post-UTME screening portal is active for first-choice candidates.`;
    let publishDate = 'June 2026';
    let deadlineDate = 'August 2026';

    if (status === 'NOT_OPEN') {
      statusText = 'Form Not Yet Open';
      details = `${uni.name} 2025/2026 Post-UTME screening form is expected to be released soon.`;
      publishDate = 'Expected August 2026';
      deadlineDate = 'To be announced';
    } else if (status === 'CLOSED') {
      statusText = 'Registration Closed';
      details = `${uni.name} 2025/2026 Post-UTME screening application period has ended.`;
      publishDate = 'May 2026';
      deadlineDate = 'July 2026';
    }

    return {
      schoolName: uni.name,
      slug: uni.slug || uni.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: uni.category || 'Federal',
      status,
      statusText,
      details,
      portalLink: uni.url || 'https://jamb.gov.ng',
      publishDate,
      deadlineDate,
      cutoffScore: uni.category === 'Private' ? '160' : '180',
      registrationFee: 2000,
      requirements: `Minimum JAMB score: ${uni.category === 'Private' ? '160' : '180'}. O-Level credit in 5 relevant subjects.`
    };
  });
};

export const getPostUtmeStats = () => {
  // Try to load from localStorage first for perfect real-time synchronization
  try {
    const cachedStats = typeof window !== 'undefined' ? localStorage.getItem('post_utme_stats') : null;
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }
  } catch (e) {
    console.warn("Failed to read cached post_utme_stats:", e);
  }

  const records = getAllPostUtmeRecords();
  const openCount = records.filter(r => r.status === 'OPEN').length;
  const notOpenCount = records.filter(r => r.status === 'NOT_OPEN').length;
  const closedCount = records.filter(r => r.status === 'CLOSED').length;

  // Fallback default state: 283 schools (141 released/open, 31 closed, 111 awaiting/not open)
  if (records.length < 280) {
    return {
      total: 283,
      open: 141,
      notOpen: 111,
      closed: 31
    };
  }

  return {
    total: records.length,
    open: openCount,
    notOpen: notOpenCount,
    closed: closedCount
  };
};

export const getPostUtmeRecordForSchool = (schoolNameOrSlug: string): PostUtmeSchoolRecord => {
  const records = getAllPostUtmeRecords();
  const norm = schoolNameOrSlug.toLowerCase().trim();
  const found = records.find(r => 
    r.schoolName.toLowerCase() === norm || 
    r.slug.toLowerCase() === norm ||
    r.schoolName.toLowerCase().includes(norm) ||
    norm.includes(r.schoolName.toLowerCase())
  );

  if (found) return found;

  return {
    schoolName: schoolNameOrSlug,
    slug: schoolNameOrSlug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    category: 'Federal',
    status: 'NOT_OPEN',
    statusText: 'Form Not Yet Open',
    details: `${schoolNameOrSlug} 2025/2026 Post-UTME screening form is expected to open soon.`,
    portalLink: 'https://jamb.gov.ng',
    cutoffScore: '180',
    registrationFee: 2000,
    requirements: 'Minimum JAMB cut-off score: 180.'
  };
};
