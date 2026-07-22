
import { NewsItem } from './types';

export const ADMISSION_DATES = {
  // Synchronized with the official Myschool/JAMB announcement Feb 2026
  JAMB_REG_START: '2026-01-26T08:00:00',
  JAMB_EPIN_END: '2026-02-26T23:59:59',
  JAMB_REG_END: '2026-02-28T23:59:59', // Final official closing deadline
  UNILAG_POST_UTME: '2026-02-15T00:00:00',
  UI_POST_UTME: '2026-03-01T00:00:00'
};

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '18',
    slug: 'post-utme-screening-registration-2026-begins-select',
    title: 'Post-UTME 2026: Select Universities Begin Screening Registration',
    category: 'JAMB',
    date: 'June 29, 2026',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    excerpt: 'While a universal date has not been set by all, several Nigerian universities have started announcing their specific Post-UTME screening procedures for the 2026/2027 session.',
    fullContent: 'For the 2026/2027 academic session, a number of Nigerian universities have started to release their specific Post-UTME screening requirements and registration procedures. Candidates are strongly advised to check the official websites of their preferred institutions regularly as announcements are being made gradually.\n\nBe cautious of third-party platforms claiming to handle registrations or charging for "guaranteed" admission. Always use official university portals.',
    sourceUrl: 'https://myschool.ng',
    isImportant: true
  },
  {
    id: '15',
    slug: 'jamb-releases-2026-utme-results-percent-score-below-200',
    title: 'JAMB UTME 2026 Results Released: Only 24% Score Above 200',
    category: 'JAMB',
    date: 'May 05, 2026',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    excerpt: 'The Joint Admissions and Matriculation Board (JAMB) has officially released the results of the 2026 Unified Tertiary Matriculation Examination (UTME), showing a sharp decline in average scores.',
    fullContent: 'The Joint Admissions and Matriculation Board (JAMB) has officially announced the release of the 2026 Unified Tertiary Matriculation Examination (UTME) results.\n\nOut of the 1,985,642 candidates who registered and sat for the exam across 750 CBT centres nationwide, only about 24% scored 200 and above, while approximately 76% scored below the 200 mark. This has raised concerns among parents, teachers, and university administrators regarding the high-stakes testing environment and candidate preparation.\n\nJAMB Registrar, Prof. Is-haq Oloyede, stated that the board will not compromise on its standards and warned against fraudulent sites claiming to upgrade scores.\n\nHow to check your results:\n- Send UTME-RESULT to 55019 or 66019 using the phone number registered for the profile.\n- Alternatively, log in to the official JAMB e-facility portal to print your result slip.',
    sourceUrl: 'https://www.jamb.gov.ng',
    isImportant: true
  },
  {
    id: '16',
    slug: 'nelfund-disburses-student-loan-tuitions-tu-unilag-ui-and-others',
    title: 'NELFUND Disbursements Approved: N10 Billion Disbursed for Institutional Tuitions',
    category: 'Federal',
    date: 'May 18, 2026',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    excerpt: 'The Nigerian Education Loan Fund (NELFUND) has successfully disbursed academic fees for over 20,000 undergraduate applicants in several state and federal universities.',
    fullContent: 'The management of the Nigerian Education Loan Fund (NELFUND) has announced the successful clearance and disbursement of administrative and academic tuition fees directly to selected institutions under its first phase.\n\nKey beneficiaries in this round include:\n- University of Lagos (UNILAG) - N1.2 Billion\n- University of Ibadan (UI) - N950 Million\n- Ahmadu Bello University (ABU) - N1.5 Billion\n- University of Nigeria, Nsukka (UNN) - N1.1 Billion\n\nThe Managing Director of NELFUND stated that this direct disbursement covers 100% of institutional charges for student loan applicants. In addition to the tuition support, qualified students will begin receiving their monthly N20,000 upkeep allowances directly into their bank accounts from the end of May 2026.',
    sourceUrl: 'https://nelfund.gov.ng',
    isImportant: true
  },
  {
    id: '17',
    slug: 'asuu-threatens-new-warning-strike-over-unfulfilled-2026-agreements',
    title: 'ASUU Threatens Nationwide Warning Strike Over Unfulfilled Core Agreements',
    category: 'National',
    date: 'May 24, 2026',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    excerpt: 'The Academic Staff Union of Universities (ASUU) has put federal and state branches on high alert for a potential warning strike, citing government indifference to renegotiated welfare packages.',
    fullContent: 'Following an Emergency National Executive Council (NEC) session on May 23, 2026, the Academic Staff Union of Universities (ASUU) has criticized the Federal Government over its continuous delay in implementing the negotiated 2026 Funding and Revitalization Agreement.\n\nThe union has given a final 14-day ultimatum, threatening a 2-week warning strike if their demands are not addressed.\n\nMain demands include:\n- Immediate full settlement of withheld salaries and earned academic allowances (EAA).\n- Total removal of university payroll systems from IPPIS to safeguard university autonomy.\n- Release of revitalization funding to arrest decaying campus infrastructures nationwide.\n\nASUU President urged students and parents to understand that this push is necessary to secure the quality and survival of public education in Nigeria.',
    sourceUrl: 'https://asuu.org.ng',
    isImportant: true
  },
  {
    id: '5',
    slug: 'jamb-rules-out-2026-utme-registration-extension-1-million-registered',
    title: 'JAMB Rules Out 2026 UTME Registration Extension; 1 Million Registered',
    category: 'JAMB',
    date: 'Feb 12, 2026',
    image: '',
    excerpt: 'The Joint Admissions and Matriculation Board (JAMB) has announced that there will be NO extension for the 2026 registration period. ePIN sales end Feb 26th, while final registration closes Feb 28th.',
    fullContent: 'JAMB has officially confirmed that approximately one million candidates have already registered for the ongoing 2026 UTME. The Board has made it clear that the registration timeline remains unchanged to align with the calendars of other examination bodies. \n\nKey Dates to Note:\n- Monday, Jan 26: Registration Commenced\n- Thursday, Feb 26: Sales of ePIN Conclude\n- Saturday, Feb 28: Final Registration Deadline\n\nThe Board expressed concern over the "near absence" of candidates at many accredited CBT centres at this stage and warns that late-minute agitations for extensions will not be entertained. Candidates are also warned to beware of registration cheats and fraudulent tutorial centres posing as CBT agents.',
    sourceUrl: 'https://myschool.ng',
    isImportant: true
  },
  {
    id: '3',
    slug: 'jamb-announces-official-registration-dates-for-2026-utmede',
    title: 'JAMB Announces Official Registration Dates for 2026 UTME/DE',
    category: 'JAMB',
    date: 'Jan 25, 2026',
    image: '',
    excerpt: 'The Joint Admissions and Matriculation Board (JAMB) has scheduled the 2026 Unified Tertiary Matriculation Examination (UTME) registration to commence on January 31, 2026. Candidates are required to generate their profile codes using their NIN.',
    sourceUrl: 'https://www.jamb.gov.ng',
    isImportant: true
  },
  {
    id: '1',
    slug: 'unilag-announces-20262027-post-utme-registration-schedule',
    title: 'UNILAG Announces 2026/2027 Post-UTME Registration Schedule',
    category: 'Federal',
    date: 'Jan 02, 2026',
    image: '',
    excerpt: 'The University of Lagos (UNILAG) has released the early schedule for the 2026 screening exercise. Candidates are advised to prepare their O-Level results.',
    sourceUrl: 'https://unilag.edu.ng/?cat=4'
  },
  {
    id: '2',
    slug: 'lasu-tops-state-university-rankings-for-2026-academic-session',
    title: 'LASU Tops State University Rankings for 2026 Academic Session',
    category: 'State',
    date: 'Jan 01, 2026',
    image: '',
    excerpt: 'Lagos State University (LASU) continues its dominance in research and student welfare, securing the #1 spot in the latest January rankings.',
    sourceUrl: 'https://lasu.edu.ng/home/news/'
  },
  {
    id: '6',
    slug: 'shell-nigeria-university-scholarship-scheme-2026-applications-open',
    title: 'Shell Nigeria University Scholarship Scheme 2026: Applications Open',
    category: 'Scholarships',
    date: 'Feb 15, 2026',
    image: '',
    excerpt: 'Shell Nigeria (SPDC) invites applications from full-time second-year undergraduates in Nigerian Universities for its 2026 University Scholarship Scheme.',
    sourceUrl: 'https://www.shell.com.ng'
  },
  {
    id: '7',
    slug: 'federal-civil-service-commission-fcsc-recruitment-2026-apply-now',
    title: 'Federal Civil Service Commission (FCSC) Recruitment 2026: Apply Now',
    category: 'Jobs',
    date: 'Feb 18, 2026',
    image: '',
    excerpt: 'The Federal Civil Service Commission is inviting applications from qualified Nigerians for various positions in several Ministries, Departments, and Agencies.',
    sourceUrl: 'https://fedcivilservice.gov.ng'
  },
  {
    id: '8',
    slug: 'nysc-2026-batch-a-mobilization-senate-list-verification-begins',
    title: 'NYSC 2026 Batch A Mobilization: Senate List Verification Begins',
    category: 'NYSC',
    date: 'Feb 20, 2026',
    image: '',
    excerpt: 'The National Youth Service Corps (NYSC) has directed all prospective corps members for 2026 Batch A to verify their names on the Senate list.',
    sourceUrl: 'https://www.nysc.gov.ng'
  },
  {
    id: '9',
    slug: 'nuc-approves-12-new-private-universities-for-2026-academic-session',
    title: 'NUC Approves 12 New Private Universities for 2026 Academic Session',
    category: 'Private',
    date: 'Feb 22, 2026',
    image: '',
    excerpt: 'The National Universities Commission (NUC) has granted operational licenses to 12 new private institutions to expand access to higher education.',
    sourceUrl: 'https://nuc.edu.ng'
  },
  {
    id: '10',
    slug: 'asuu-issues-14-day-ultimatum-over-unresolved-2026-funding-agreements',
    title: 'ASUU Issues 14-Day Ultimatum Over Unresolved 2026 Funding Agreements',
    category: 'National',
    date: 'Feb 24, 2026',
    image: '',
    excerpt: 'The Academic Staff Union of Universities (ASUU) has warned of a potential strike if the Federal Government fails to implement the 2026 funding roadmap.',
    sourceUrl: 'https://asuu.org.ng',
    isImportant: true
  },
  {
    id: '11',
    slug: 'jamb-to-deploy-biometric-verification-for-2026-mock-utme',
    title: 'JAMB to Deploy Biometric Verification for 2026 Mock UTME',
    category: 'JAMB',
    date: 'Feb 25, 2026',
    image: '',
    excerpt: 'In a bid to curb examination malpractice, JAMB will implement advanced biometric verification for the upcoming 2026 Mock UTME scheduled for March.',
    sourceUrl: 'https://jamb.gov.ng'
  },
  {
    id: '12',
    slug: 'graduate-trainee-program-2026-top-nigerian-banks-recruiting',
    title: 'Graduate Trainee Program 2026: Top Nigerian Banks Recruiting',
    category: 'Jobs',
    date: 'Feb 26, 2026',
    image: '',
    excerpt: 'Several tier-1 Nigerian banks have opened their 2026 graduate trainee portals. Applicants must have a minimum of 2:1 and be under 26 years old.',
    sourceUrl: 'https://proshare.co'
  },
  {
    id: '13',
    slug: 'nysc-2026-batch-a-official-orientation-camp-dates-announced',
    title: 'NYSC 2026 Batch A: Official Orientation Camp Dates Announced',
    category: 'NYSC',
    date: 'Feb 27, 2026',
    image: '',
    excerpt: 'The NYSC management has released the official timetable for the 2026 Batch A orientation course. Registration begins next week.',
    sourceUrl: 'https://nysc.gov.ng'
  },
  {
    id: '14',
    slug: 'nuc-releases-16-new-guidelines-for-issuance-of-honorary-doctorates',
    title: 'NUC Releases 16 New Guidelines for Issuance of Honorary Doctorates',
    category: 'National',
    date: 'Feb 28, 2026',
    image: '',
    excerpt: 'The National Universities Commission (NUC) has introduced 16 stringent guidelines for the award of honorary degrees in Nigerian universities to maintain academic integrity.',
    fullContent: 'The National Universities Commission (NUC) has released a new set of 16 guidelines to regulate the award of honorary doctorate degrees in the Nigerian University System (NUS). \n\nThis move aims to curb the perceived "commercialization" of honorary degrees and ensure that such honors are reserved for individuals who have made truly exceptional contributions to society. \n\nKey Guidelines Include:\n- Mandatory 7-year gap between awards for the same individual.\n- Prohibition of awarding honorary degrees to individuals currently holding political office.\n- Strict criteria for the selection process involving the University Senate and Council.\n- Limitation on the number of honorary degrees a university can award per convocation.\n\nThe NUC warned that universities found violating these guidelines would face sanctions, including the withdrawal of accreditation for certain programs.',
    sourceUrl: 'https://nuc.edu.ng'
  },
  {
    id: '99',
    slug: 'jamb-issues-mandatory-guidelines-for-20262027-admission-via-caps',
    title: 'JAMB Issues Mandatory Guidelines for 2026/2027 Admission via CAPS',
    category: 'JAMB',
    date: 'July 10, 2026',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    excerpt: 'The Joint Admissions and Matriculation Board (JAMB) has released new directives for 2026/2027 admissions, strengthening Central Admissions Processing System (CAPS) operations and admission integrity.',
    fullContent: 'The Joint Admissions and Matriculation Board (JAMB) has released mandatory guidelines and directives governing the 2026/2027 academic session admissions cycle through the Central Admissions Processing System (CAPS). This release seeks to eliminate administrative arbitrariness, enforce transparency, and safeguard the absolute integrity of university admission selections across Nigeria.\n\n### The Supremacy of CAPS\nJAMB Registrar, Prof. Is-haq Oloyede, reiterated that any admission offer processed outside the official CAPS platform is not only illegal but completely null and void. Candidates who accept "paper admissions" or informal school listings do so at their own risk, as such admissions will not be recognized for mobilization by the National Youth Service Corps (NYSC) or for the validation of graduation credentials.\n\n### Key Regulations Implemented\n1. **First Choice Priority**: Tertiary institutions are strictly prohibited from recommending candidates for admission who did not choose them as their first-choice institution during the primary window.\n2. **Threshold Adherence**: Recommendations must strictly comply with the officially approved institutional and departmental cutoff marks. No candidate with an aggregate score lower than the defined minimum can be recommended under any circumstances.\n3. **Acceptance Timeline**: Once an admission recommendation is uploaded and approved on CAPS, candidates have a strict, non-negotiable window to accept or reject the offer. Unaccepted offers will be automatically withdrawn and the slot declared vacant for subsequent batches.\n4. **Quota and Geopolitics**: All institutions must adhere strictly to their approved capacities and the federal government\'s policy on Catchment Areas, Merit, and Educationally Less Developed States (ELDS) during the recommendation process on the platform.',
    sourceUrl: 'https://www.jamb.gov.ng',
    isImportant: true
  },
  {
    id: '100',
    slug: 'jamb-issues-new-guidelines-for-20262027-institution-change-and-caps',
    title: 'JAMB Issues New Guidelines for 2026/2027 Institution Change and CAPS',
    category: 'JAMB',
    date: 'July 10, 2026',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    excerpt: 'JAMB warns candidates on the importance of visiting accredited centers for correction of data and change of institution. The board has also introduced a mandatory status declaration to enforce compliance.',
    fullContent: 'The Joint Admissions and Matriculation Board (JAMB) has issued comprehensive new guidelines for candidates wishing to apply for a Change of Institution, Course, or Correction of Data for the 2026/2027 academic session. The board warns candidates against utilizing unauthorized platforms or cybercafes, emphasizing that all such transactions must be completed strictly at accredited JAMB CBT centers nationwide.\n\n### Mandatory Matriculation Status Declaration\nIn a decisive step to strengthen compliance and prevent double enrollment, JAMB has introduced a **mandatory status declaration for all candidates, requiring anyone already enrolled in a tertiary institution to clearly state their matriculation status during registration**.\n\nFailure to disclose or falsifying this status will result in the immediate cancellation of registration and the withdrawal of previous admissions. This directive is designed to prevent candidates from blocking multiple admission slots across different universities, ensuring a fair opportunity for all UTME participants.\n\n### Security and Biometric Protocols\nTo eliminate third-party interference and identity theft during corrections, JAMB has enforced strict biometric verification before any database alteration can take place. Candidates must undergo fingerprint validation at an accredited CBT center. No change of institution, course, or date of birth can be initiated without the physical presence and biometric confirmation of the candidate.\n\n### Navigating CAPS Portal Transfers\nCandidates are advised to closely monitor the "Transfer Approval" tab on their JAMB CAPS profiles. Under the new guidelines, if a candidate does not meet the highly competitive cutoff mark for their primary choice of course, but meets the threshold for a related or alternative program, the institution may propose a transfer. Candidates must manually accept this program transfer on CAPS for the new recommendation to progress.',
    sourceUrl: 'https://www.jamb.gov.ng',
    isImportant: true
  }
];

export const TICKER_HEADLINES = [
  "JAMB 2026: No extension for registration period. Final deadline is February 28th...",
  "ePIN sales conclude on Feb 26th - Generate your profile code now...",
  "UNILAG 2026/2027 admission portal now active for updates...",
  "Over 1 Million candidates successfully profiled for 2026 UTME...",
  "Beware of fraudulent CBT agents - Only use accredited registration centres..."
];
