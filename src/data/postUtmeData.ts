export interface SchoolReleaseStatus {
  schoolName?: string;
  category?: string;
  isOut?: boolean;
  statusText?: string;
  details?: string;
  portalLink?: string;
  publishDate?: string;
  deadlineDate?: string;
  examDate?: string;
  cutoffScore?: string;
  registrationFee?: number;
  citationUrl?: string;
  eligibilityText?: string;
  isSyncedLive?: boolean;
}

export // Fixed pre-loaded statuses for common top schools as a solid baseline
const BASELINE_RELEASES: Record<string, Partial<SchoolReleaseStatus>> = {
  "University of Jos": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIJOS 2026/2027 Post-UTME/DE online registration & result screening exercise active (13 July - 12 September 2026). Cutoff: 180.",
    portalLink: "https://portal.unijos.edu.ng",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://www.unijos.edu.ng/",
    eligibilityText: "Minimum JAMB score: 180"
  },
  "University of Nigeria, Nsukka": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNN 2026/2027 Post-UTME application portal is active. Candidates who chose UNN in UTME and met minimum requirements will be considered for admission.",
    portalLink: "https://unnportal.unn.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/unn-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 160"
  },
  "University of Benin": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIBEN 2026/2027 Post-UTME portal is open for registration. Strict application deadline applies. Screening of O-Level upload on CAPS is mandatory.",
    portalLink: "https://unibenportal.com/#application",
    cutoffScore: "200",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/uniben-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "University of Ibadan": {
    isOut: true,
    statusText: "Registration Active",
    details: "UI 2026/2027 Post-UTME form sales and registration are active on the admissions portal. Check subject compatibility before registering.",
    portalLink: "https://admissions.ui.edu.ng/#/",
    cutoffScore: "200",
    registrationFee: 5000,
    citationUrl: "https://myschoolgist.com/news/ui-post-utme/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Obafemi Awolowo University": {
    isOut: true,
    statusText: "Registration Active",
    details: "OAU 2026/2027 Post-UTME and Direct Entry registration guidelines are officially released on the eportal.",
    portalLink: "https://eportal2.oauife.edu.ng/ug/admissions",
    cutoffScore: "200",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/oau-post-utme-de-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "University of Ilorin": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNILORIN 2026/2027 Post-UTME registration portal is active for first-choice candidates meeting score requirements.",
    portalLink: "https://admissions.unilorin.edu.ng/",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/unilorin-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Bayero University, Kano": {
    isOut: true,
    statusText: "Registration Active",
    details: "BUK 2026/2027 Post-UTME online screening portal is live for candidates scoring minimum required JAMB score.",
    portalLink: "https://buk.edu.ng/",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/buk-post-utme/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Ahmadu Bello University": {
    isOut: true,
    statusText: "Registration Active",
    details: "ABU Zaria 2026/2027 Post-UTME screening form is out on the portal. Online registration is active.",
    portalLink: "https://portal.abu.edu.ng/forms",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/abu-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "University of Port Harcourt": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIPORT 2026/2027 Post-UTME registration link is live. Ensure O'Level details are properly uploaded.",
    portalLink: "https://utmedetails.uniport.edu.ng/welcome_utme.php",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/uniport-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Federal University of Technology, Akure": {
    isOut: true,
    statusText: "Form Released (Point-Based)",
    details: "FUTA 2026/2027 Point-Based screening registrations are active. Deadline: Friday, 31 July 2026.",
    portalLink: "https://www.futa.edu.ng/",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/futa-post-utme-de-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "University of Lagos": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNILAG 2026/2027 Post-UTME screening portal is active on the applications site.",
    portalLink: "https://applications.unilag.edu.ng/home",
    cutoffScore: "200",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/unilag-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Federal University of Technology, Owerri": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUTO 2026/2027 screening forms are out and active on the undergraduate portal.",
    portalLink: "https://portal.futo.edu.ng/#undergraduate",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/futo-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 150"
  },
  "Osun State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIOSUN 2026/2027 Post-UTME screening application portal is active.",
    portalLink: "https://admissions.uniosun.edu.ng/",
    cutoffScore: "160",
    registrationFee: 3000,
    citationUrl: "https://myschoolgist.com/news/uniosun-post-utme/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Olabisi Onabanjo University": {
    isOut: true,
    statusText: "Registration Active",
    details: "OOU 2026/2027 Post-UTME & DE screening forms are out. Registration deadline: Friday, 22 July 2026.",
    portalLink: "https://putme.oouagoiwoye.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/oou-post-utme-de/",
    eligibilityText: "Minimum JAMB score: 160"
  },
  "Lagos State University": {
    isOut: true,
    statusText: "Form Released",
    details: "LASU 2026/2027 admission screening portal is active for first choice applicants.",
    portalLink: "https://services.lidc.lasu.edu.ng/admissionscreening/",
    cutoffScore: "195",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/lasu-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Ekiti State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "EKSU 2026/2027 Post-UTME online screening portal is active.",
    portalLink: "https://eksuportal.eksu.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/eksu-post-utme/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Federal University Oye-Ekiti": {
    isOut: true,
    statusText: "Registration Active (Closes Aug 28)",
    details: "FUOYE 2026/2027 Post-UTME screening portal is active. Deadline: August 28, 2026. Note: Law department will NOT admit candidates for 2026/2027.",
    portalLink: "https://putme.fuoye.edu.ng/utme/",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/fuoye-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 150. Law department suspended for 2026/2027. Awaiting result candidates may apply."
  },
  "Federal University of Technology and Environmental Sciences, Iyin-Ekiti": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUTES-IYIN 2026/2027 Post-UTME screening exercise is open. Minimum JAMB score: 160 (some courses require 180).",
    portalLink: "https://portal.futes.edu.ng/apply",
    cutoffScore: "160",
    registrationFee: 5000,
    citationUrl: "https://portal.futes.edu.ng/apply",
    eligibilityText: "Minimum JAMB score: 160. Screening fee: ₦2,000 + Portal access fee: ₦3,000."
  },
  "Nnamdi Azikiwe University": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIZIK 2026/2027 Post-UTME screening application portal is active.",
    portalLink: "https://apply.unizik.edu.ng/auth/login",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/unizik-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "University of Uyo": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIUYO 2026/2027 Post-UTME screening form is out. Registration closes Friday, 7 August 2026.",
    portalLink: "https://eportals.uniuyo.edu.ng/",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/uniuyo-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 150"
  },
  "Delta State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "DELSU Abraka 2026/2027 Post-UTME portal is live for registration.",
    portalLink: "https://portal.delsuces.online/",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/delsu-post-utme-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Ladoke Akintola University of Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "LAUTECH 2026/2027 Post-UTME screening portal is open for candidates with 170+ score.",
    portalLink: "https://eportal.lautech.edu.ng/ug/admissions",
    cutoffScore: "170",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/lautech-post-utme/",
    eligibilityText: "Minimum JAMB score: 170"
  },
  "Kwara State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "KWASU Malete 2026/2027 Post-UTME form is officially out on the portal.",
    portalLink: "https://portal.kwasu.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/kwara-state-university-post-utme-form-out/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Nasarawa State University, Keffi": {
    isOut: true,
    statusText: "Registration Active",
    details: "NSUK Keffi 2026/2027 Post-UTME/DE application portal is active.",
    portalLink: "https://portal.nsuk.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/nsuk-post-utme-de-form/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "University of Abuja": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIABUJA 2026/2027 Post-UTME online screening portal is live. Ensure O-Level results are uploaded to JAMB CAPS.",
    portalLink: "https://portal.uniabuja.edu.ng/",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/uniabuja-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 180. Candidates must have uploaded O-Level results to CAPS."
  },
  "Imo State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "IMSU Owerri 2026/2027 Post-UTME online screening form is active for candidates who scored 150+ in UTME.",
    portalLink: "https://imsu.edu.ng/apply",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/imsu-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 150. First and second choice candidates with change of institution eligible."
  },
  "Bauchi State University, Gadau": {
    isOut: true,
    statusText: "Registration Active",
    details: "BASU Gadau (Sa'adu Zungur University) 2026/2027 Post-UTME/DE online screening portal is active.",
    portalLink: "https://basu.edu.ng/apply",
    cutoffScore: "140",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/basu-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 140."
  },
  "WAEC & JAMB CAPS Verification": {
    isOut: true,
    statusText: "Upload Window Active",
    details: "2026 WAEC / NECO result upload on JAMB CAPS is mandatory for all 2026/2027 Post-UTME candidates. Ensure result verification is completed before institutional admission screening closes.",
    portalLink: "https://efacility.jamb.gov.ng/",
    cutoffScore: "5 Credits",
    registrationFee: 0,
    citationUrl: "https://myschoolgist.com/news/jamb-caps-olevel-upload/",
    eligibilityText: "Mandatory 5 O-Level credit passes including Mathematics and English Language."
  },
  "Sule Lamido University": {
    isOut: true,
    statusText: "Registration Active",
    details: "SLU 2026/2027 Post-UTME application form is active on the admissions portal.",
    portalLink: "https://admissions.slu.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/slu-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 160"
  },
  "Federal University, Wukari": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUWUKARI 2026/2027 Post-UTME & DE screening registration portal is active.",
    portalLink: "https://ug.fuwportal.edu.ng/putme_registration.php",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/fuwukari-post-utme-de-13054/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Federal University of Health Sciences, Otukpo": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUHSO 2026/2027 Post-UTME application portal is live for prospective healthcare candidates.",
    portalLink: "https://postutme.fuhso.edu.ng/apply",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/fuhso-post-utme/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Kogi State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "PAAU / KSU Anyigba 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://portal.paau.edu.ng/pd_dip/utme_dashboard",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/ksu-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 150"
  },
  "Confluence University of Science and Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "CUSTECH Osara 2026/2027 Post-UTME screening application portal is active.",
    portalLink: "https://eportal.custech.edu.ng/utme/index.php",
    cutoffScore: "150",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/custech-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 150"
  },
  "Plateau State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "PLASU Bokkos 2026/2027 Post-UTME online registration portal is live.",
    portalLink: "https://plasu.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/plasu-post-utme/",
    eligibilityText: "Minimum JAMB score: 160"
  },
  "Modibbo Adama University": {
    isOut: true,
    statusText: "Registration Active",
    details: "MAU Yola 2026/2027 Post-UTME screening application portal is open.",
    portalLink: "https://mau.edu.ng/",
    cutoffScore: "160",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/mautech-post-utme-form/",
    eligibilityText: "Minimum JAMB score: 160"
  },
  "Abubakar Tafawa Balewa University": {
    isOut: true,
    statusText: "Registration Active",
    details: "ATBU Bauchi 2026/2027 Post-UTME screening login portal is active.",
    portalLink: "http://screening.atbu.edu.ng/pages/login.php",
    cutoffScore: "180",
    registrationFee: 2000,
    citationUrl: "https://myschoolgist.com/news/atbu-post-utme-screening/",
    eligibilityText: "Candidates who chose the university as first choice and scored required minimum JAMB mark."
  },
  "Sokoto State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "SSU 2026/2027 Post-UTME/DE screening registration portal is live. Minimum cut-off mark: 150.",
    portalLink: "https://ssu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who scored 150+ in 2026 UTME and selected SSU."
  },
  "Northwest University, Kano": {
    isOut: true,
    statusText: "Registration Active",
    details: "NWUK (YUMSUK) 2026/2027 Post-UTME online application exercise is active.",
    portalLink: "https://nwu.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Minimum UTME score 160+."
  },
  "Abdulkadir Kure University, Minna": {
    isOut: true,
    statusText: "Registration Active",
    details: "Abdulkadir Kure University Minna 2026/2027 Post-UTME/DE screening portal is active.",
    portalLink: "https://akub.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "First choice candidates with 150+ JAMB score."
  },
  "Federal University of Health Sciences & Tech. Tsafe": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUHST Tsafe 2026/2027 Post-UTME application portal is accepting candidates for healthcare programs.",
    portalLink: "https://fuhsttsafe.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score in 2026 UTME."
  },
  "Bamidele Olumilua University of Edu, Sci & Tech.": {
    isOut: true,
    statusText: "Registration Active",
    details: "BOUESTI Ikere-Ekiti 2026/2027 Post-UTME screening forms are out on the admissions portal.",
    portalLink: "https://bouesti.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Candidates who selected BOUESTI and scored 160+."
  },
  "Aliko Dangote University of Science and Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "ADUSTECH Wudil 2026/2027 Post-UTME/DE screening application portal is active.",
    portalLink: "https://adustech.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "UTME score of 160 and above."
  },
  "Kogi State University, Kabba": {
    isOut: true,
    statusText: "Registration Active",
    details: "KSU Kabba 2026/2027 Post-UTME/DE online screening portal is live.",
    portalLink: "https://ksukabba.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score in 2026 UTME."
  },
  "Kashim Ibrahim University": {
    isOut: true,
    statusText: "Registration Active",
    details: "KIU 2026/2027 Post-UTME screening application portal is officially open.",
    portalLink: "https://kiu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Minimum 150 JAMB UTME score."
  },
  "Abdullahi Fodio University of Science and Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "AFUSTA 2026/2027 Post-UTME/DE application portal is active.",
    portalLink: "https://afusta.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who scored 150+ in 2026 UTME."
  },
  "Federal University of Science & Tech. Kabo": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUST Kabo 2026/2027 Post-UTME application exercise is active.",
    portalLink: "https://fustkabo.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "Al-Qalam University": {
    isOut: true,
    statusText: "Registration Active",
    details: "AUK Katsina 2026/2027 Post-UTME/DE registration guidelines are published.",
    portalLink: "https://auk.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "First choice candidates with required minimum score."
  },
  "Federal University of Medical Health Sci. Kwale": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUMHS Kwale 2026/2027 Post-UTME registration is open for medical & allied sciences.",
    portalLink: "https://fumhskwale.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ UTME score."
  },
  "Benue State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "BSU Makurdi 2026/2027 Post-UTME online screening portal is live.",
    portalLink: "https://bsum.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "UTME score of 150 and above."
  },
  "Yobe State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "YSU Damaturu 2026/2027 Post-UTME/DE application portal is active.",
    portalLink: "https://ysu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates meeting minimum cut-off."
  },
  "Jewel University Gombe": {
    isOut: true,
    statusText: "Registration Active",
    details: "Jewel University Gombe 2026/2027 Post-UTME admission forms are open.",
    portalLink: "https://jeweluniversity.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ JAMB score."
  },
  "Summit University, Offa": {
    isOut: true,
    statusText: "Registration Active",
    details: "Summit University Offa 2026/2027 undergraduate registration portal is active.",
    portalLink: "https://summituniversity.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "UTME candidates with 150+ score."
  },
  "Federal University Dutse": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUD 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://fud.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who selected FUD and scored 150+."
  },
  "Enugu State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "ESUT Enugu 2026/2027 Post-UTME online screening application portal is active.",
    portalLink: "https://esut.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "UTME score of 160 and above."
  },
  "Federal University of Education, Zaria": {
    isOut: true,
    statusText: "Registration Active",
    details: "FCE Zaria (Federal Univ of Education) 2026/2027 screening forms are on sale.",
    portalLink: "https://fcezaria.edu.ng",
    cutoffScore: "140",
    registrationFee: 2000,
    eligibilityText: "Minimum UTME score 140+."
  },
  "Lagos State University of Science and Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "LASUSTECH Ikorodu 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://lasustech.edu.ng",
    cutoffScore: "180",
    registrationFee: 2000,
    eligibilityText: "Candidates with 180+ score in 2026 UTME."
  },
  "Bayelsa Medical University": {
    isOut: true,
    statusText: "Registration Active",
    details: "BMU Yenagoa 2026/2027 Post-UTME/DE application portal is active.",
    portalLink: "https://bmu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "First choice candidates with minimum required score."
  },
  "Gombe State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "GOMSU 2026/2027 Post-UTME/DE online screening portal is live.",
    portalLink: "https://gsu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who selected GSU with 150+ score."
  },
  "Federal University of Health Sciences Ira-Orangun": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUHSI Ira-Orangun 2026/2027 Post-UTME application portal is open.",
    portalLink: "https://fuhsi.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Healthcare candidates with 160+ UTME score."
  },
  "Kaduna State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "KASU 2026/2027 Post-UTME/DE online screening portal is active.",
    portalLink: "https://kasu.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Candidates with 160+ score in 2026 UTME."
  },
  "Emmanuel Alayande University of Education": {
    isOut: true,
    statusText: "Registration Active",
    details: "EAUE Oyo 2026/2027 Post-UTME/DE screening form is out on portal.",
    portalLink: "https://eaued.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Minimum 150 JAMB score."
  },
  "Joseph Sarwuan Tarka University": {
    isOut: true,
    statusText: "Registration Active",
    details: "JOSTUM (FUAM) Makurdi 2026/2027 Post-UTME application exercise is live.",
    portalLink: "https://jostum.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ in 2026 UTME."
  },
  "Bingham University": {
    isOut: true,
    statusText: "Registration Active",
    details: "Bingham University Karu 2026/2027 Post-UTME screening forms are out.",
    portalLink: "https://binghamuni.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Minimum JAMB score 150."
  },
  "Lead City University": {
    isOut: true,
    statusText: "Registration Active",
    details: "Lead City University Ibadan 2026/2027 undergraduate admission portal is active.",
    portalLink: "https://lcu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "UTME candidates with 150+ score."
  },
  "Federal University, Lafia": {
    isOut: true,
    statusText: "Registration Active",
    details: "FULAFIA 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://fulafia.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "Tai Solarin University of Education": {
    isOut: true,
    statusText: "Registration Active",
    details: "TASUED Ijagun 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://tasued.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Minimum 150 JAMB score."
  },
  "State University of Medical and Applied Sciences": {
    isOut: true,
    statusText: "Registration Active",
    details: "SUMAS Igbo-Eno 2026/2027 Post-UTME online registration is active.",
    portalLink: "https://sumas.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Healthcare and science candidates with 160+ score."
  },
  "Michael Okpara University of Agriculture, Umudike": {
    isOut: true,
    statusText: "Registration Active",
    details: "MOUAU Umudike 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://mouau.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who selected MOUAU and scored 150+."
  },
  "Federal University of Technology, Ikot-Abasi": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUTIA 2026/2027 Post-UTME/DE application portal is active.",
    portalLink: "https://futia.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ UTME score."
  },
  "Edo State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "EDSU Uzairue 2026/2027 Post-UTME screening portal is open.",
    portalLink: "https://edouniversity.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Candidates with 160+ in UTME."
  },
  "Federal University of Health Sciences, Azare": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUHSA Azare 2026/2027 Post-UTME application portal is live.",
    portalLink: "https://fuhsa.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Healthcare candidates with 160+ score."
  },
  "Federal University of Agriculture, Bassambiri": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUAB Bassambiri 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://fuab.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "Adamawa State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "ADSU Mubi 2026/2027 Post-UTME/DE screening portal is active.",
    portalLink: "https://adsu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ in 2026 UTME."
  },
  "Federal University of Transportation, Daura": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUTD Daura 2026/2027 Post-UTME screening forms are out.",
    portalLink: "https://futd.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "Alvan Ikoku Federal University of Education": {
    isOut: true,
    statusText: "Registration Active",
    details: "Alvan Ikoku Federal University of Education Owerri 2026/2027 screening forms are active.",
    portalLink: "https://alvanikoku.edu.ng",
    cutoffScore: "140",
    registrationFee: 2000,
    eligibilityText: "Minimum UTME score 140+."
  },
  "Chukwuemeka Odumegwu Ojukwu University": {
    isOut: true,
    statusText: "Registration Active",
    details: "COOU Igbariam 2026/2027 Post-UTME/DE application portal is active.",
    portalLink: "https://coou.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score in 2026 UTME."
  },
  "Olusegun Agagu University of Science and Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "OAUSTECH Okitipupa 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://oaustech.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "Abia State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "ABSU Uturu 2026/2027 Post-UTME online registration procedures released.",
    portalLink: "https://absu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who selected ABSU with 150+ score."
  },
  "Federal University of Agriculture and Technology, Okeho": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUNATO Okeho 2026/2027 Post-UTME application exercise is live.",
    portalLink: "https://funato.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "University of Maiduguri": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIMAID 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://unimaid.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who scored 150+ in 2026 UTME."
  },
  "Federal University of Allied Health Sciences": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUAHSE Enugu 2026/2027 Post-UTME application procedures released.",
    portalLink: "https://fuahse.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Healthcare candidates with 150+ score."
  },
  "Nigeria Police Academy": {
    isOut: true,
    statusText: "Registration Active",
    details: "POLAC Wudil 13th Regular Course admission application exercise is live.",
    portalLink: "https://polac.edu.ng",
    cutoffScore: "180",
    registrationFee: 2000,
    eligibilityText: "Candidates with 180+ score in 2026 UTME."
  },
  "Federal University Dutsin-ma": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUDMA Dutsin-Ma 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://fudutsinma.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "UTME score of 150 and above."
  },
  "Federal University Kashere": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUKASHERE Gombe 2026/2027 Post-UTME application portal is live.",
    portalLink: "https://fukashere.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "Sa'adu Zungur University": {
    isOut: true,
    statusText: "Registration Active",
    details: "SA'ZU (BASUG) Gadau 2026/2027 Post-UTME screening application is active.",
    portalLink: "https://basug.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ in UTME."
  },
  "Prince Audu Abubakar University": {
    isOut: true,
    statusText: "Registration Active",
    details: "PAAU (KSU) Anyigba 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://paau.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "First choice candidates with 150+ score."
  },
  "Nigerian Maritime University": {
    isOut: true,
    statusText: "Registration Active",
    details: "NMU Okerenkoko 2026/2027 Post-UTME screening portal is open.",
    portalLink: "https://nmu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Maritime and technology candidates with 150+ score."
  },
  "Lagos State University of Education": {
    isOut: true,
    statusText: "Registration Active",
    details: "LASUED Otto-Ijanikin 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://lasued.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Candidates with 160+ score."
  },
  "Ambrose Alli University": {
    isOut: true,
    statusText: "Registration Active",
    details: "AAU Ekpoma 2026/2027 Post-UTME/DE application procedures released.",
    portalLink: "https://aauekpoma.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who selected AAU Ekpoma with 150+."
  },
  "Federal University of Petroleum Resources, Effurun": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUPRE Effurun 2026/2027 Post-UTME/DE application portal is active.",
    portalLink: "https://fupre.edu.ng",
    cutoffScore: "170",
    registrationFee: 2000,
    eligibilityText: "Petroleum and engineering candidates with 170+ score."
  },
  "Adekunle Ajasin University, Akungba": {
    isOut: true,
    statusText: "Registration Active",
    details: "AAUA Akungba-Akoko 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://aaua.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Candidates with 160+ score in 2026 UTME."
  },
  "Ebonyi State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "EBSU Abakaliki 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://ebsu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "UTME score of 150 and above."
  },
  "Dennis Osadebay University": {
    isOut: true,
    statusText: "Registration Active",
    details: "DOU Anwai Asaba 2026/2027 Post-UTME screening portal is open.",
    portalLink: "https://dou.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "University of Delta, Agbor": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIDEL Agbor 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://unidel.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "University of Agriculture and Environmental Sciences": {
    isOut: true,
    statusText: "Registration Active",
    details: "UAES Umuagwo 2026/2027 Post-UTME screening forms are out.",
    portalLink: "https://uaes.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ score."
  },
  "University of Cross River": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNICROSS Calabar 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://unicross.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ in UTME."
  },
  "Federal University, Otuoke": {
    isOut: true,
    statusText: "Registration Active",
    details: "FUOTUOKE Bayelsa 2026/2027 Post-UTME screening portal is active.",
    portalLink: "https://fuotuoke.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates who selected FUOTUOKE and scored 150+."
  },
  "Niger Delta University": {
    isOut: true,
    statusText: "Registration Active",
    details: "NDU Wilberforce Island 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://ndu.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ in 2026 UTME."
  },
  "Rivers State University": {
    isOut: true,
    statusText: "Registration Active",
    details: "RSU Port Harcourt 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://rsu.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Candidates with 160+ in UTME."
  },
  "University of Medical Sciences Ondo": {
    isOut: true,
    statusText: "Registration Active",
    details: "UNIMED Ondo 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://unimed.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Healthcare candidates with 160+ score."
  },
  "Afe Babalola University, Ado Ekiti": {
    isOut: true,
    statusText: "Registration Active",
    details: "ABUAD Ado-Ekiti 2026/2027 undergraduate admission portal is active.",
    portalLink: "https://abuad.edu.ng",
    cutoffScore: "180",
    registrationFee: 2000,
    eligibilityText: "Candidates with 180+ in 2026 UTME."
  },
  "Redeemer's University": {
    isOut: true,
    statusText: "Registration Active",
    details: "RUN Ede 2026/2027 Post-UTME application portal is open.",
    portalLink: "https://run.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Candidates with 160+ score."
  },
  "Babcock University": {
    isOut: true,
    statusText: "Registration Active",
    details: "Babcock University Ilishan-Remo 2026/2027 admissions portal is active.",
    portalLink: "https://babcock.edu.ng",
    cutoffScore: "170",
    registrationFee: 2000,
    eligibilityText: "Candidates with 170+ score."
  },
  "Ignatius Ajuru University of Education": {
    isOut: true,
    statusText: "Registration Active",
    details: "IAUE Rumuolumeni 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://iaue.edu.ng",
    cutoffScore: "150",
    registrationFee: 2000,
    eligibilityText: "Candidates with 150+ in UTME."
  },
  "Covenant University": {
    isOut: true,
    statusText: "Registration Active",
    details: "Covenant University Ota 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://covenantuniversity.edu.ng",
    cutoffScore: "180",
    registrationFee: 2000,
    eligibilityText: "Candidates with 180+ score."
  },
  "Nigerian Defence Academy": {
    isOut: true,
    statusText: "Registration Active",
    details: "NDA Kaduna 78th Regular Course admission portal is active.",
    portalLink: "https://nda.edu.ng",
    cutoffScore: "180",
    registrationFee: 2000,
    eligibilityText: "Candidates with 180+ in 2026 UTME."
  },
  "Yaba College of Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "YABATECH Yaba 2026/2027 Post-UTME screening portal is open.",
    portalLink: "https://yabatech.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "Polytechnic candidates with 120+ score."
  },
  "Federal Polytechnic, Idah": {
    isOut: true,
    statusText: "Registration Active",
    details: "Federal Poly Idah 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://fepoda.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "UTME candidates with 120+ score."
  },
  "Federal Polytechnic, Offa": {
    isOut: true,
    statusText: "Registration Active",
    details: "OFFAPOLY 2026/2027 Post-UTME screening procedures released.",
    portalLink: "https://fedpoffaonline.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "Candidates with 120+ score."
  },
  "Plateau State Polytechnic": {
    isOut: true,
    statusText: "Registration Active",
    details: "PLAPOLY Barkin Ladi 2026/2027 ND admission forms are live.",
    portalLink: "https://plapoly.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "Candidates with 120+ score."
  },
  "Federal Polytechnic, Ede": {
    isOut: true,
    statusText: "Registration Active",
    details: "EDEPOLY 2026/2027 Post-UTME online application portal is active.",
    portalLink: "https://federalpolyede.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "Candidates with 120+ in UTME."
  },
  "Federal Polytechnic, Oko": {
    isOut: true,
    statusText: "Registration Active",
    details: "OKOPOLY 2026/2027 Post-UTME application portal is open.",
    portalLink: "https://federalpolyoko.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "Candidates with 120+ score."
  },
  "Delta State Poly, Ogwashi-Uku": {
    isOut: true,
    statusText: "Registration Active",
    details: "DSPG Ogwashi-Uku 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://dspg.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "Candidates with 120+ score."
  },
  "Kogi State Poly": {
    isOut: true,
    statusText: "Registration Active",
    details: "KSP Lokoja 2026/2027 Post-UTME application procedures released.",
    portalLink: "https://kogistatepolytechnic.edu.ng",
    cutoffScore: "120",
    registrationFee: 2000,
    eligibilityText: "Candidates with 120+ score."
  },
  "Air Force Institute of Technology": {
    isOut: true,
    statusText: "Registration Active",
    details: "AFIT Kaduna 2026/2027 Post-UTME application portal is active.",
    portalLink: "https://afit.edu.ng",
    cutoffScore: "160",
    registrationFee: 2000,
    eligibilityText: "Aviation and engineering candidates with 160+ score."
  }
};


export const findMatchingSchoolRelease = (message: string): { schoolName: string; data: Partial<SchoolReleaseStatus> } | null => {
  const msgLower = message.toLowerCase();

  const aliases: Record<string, string> = {
    'futa': 'Federal University of Technology, Akure',
    'ui': 'University of Ibadan',
    'unilag': 'University of Lagos',
    'uniben': 'University of Benin',
    'oau': 'Obafemi Awolowo University',
    'unilorin': 'University of Ilorin',
    'unn': 'University of Nigeria, Nsukka',
    'futo': 'Federal University of Technology, Owerri',
    'uniosun': 'Osun State University',
    'lasu': 'Lagos State University',
    'fuoye': 'Federal University Oye-Ekiti',
    'unizik': 'Nnamdi Azikiwe University',
    'uniuyo': 'University of Uyo',
    'delsu': 'Delta State University',
    'lautech': 'Ladoke Akintola University of Technology',
    'kwasu': 'Kwara State University',
    'nsuk': 'Nasarawa State University, Keffi',
    'uniabuja': 'University of Abuja',
    'ebsu': 'Ebonyi State University',
    'unijos': 'University of Jos',
    'buk': 'Bayero University, Kano',
    'abu': 'Ahmadu Bello University',
    'uniport': 'University of Port Harcourt',
    'eksu': 'Ekiti State University',
    'oou': 'Olabisi Onabanjo University'
  };

  for (const [alias, fullName] of Object.entries(aliases)) {
    const regex = new RegExp(`\\b${alias}\\b`, 'i');
    if (regex.test(msgLower)) {
      if (BASELINE_RELEASES[fullName]) {
        return { schoolName: fullName, data: BASELINE_RELEASES[fullName] };
      }
    }
  }

  for (const [fullName, data] of Object.entries(BASELINE_RELEASES)) {
    if (msgLower.includes(fullName.toLowerCase())) {
      return { schoolName: fullName, data };
    }
  }

  return null;
};
