export interface KnowledgeDocument {
  id: string;
  organization: string;
  page_type: 'procedural' | 'informational' | 'policy';
  category: string;
  subcategory?: string;
  title: string;
  summary: string;
  steps?: string[];
  requirements?: string[];
  eligibility_rules?: string[];
  key_facts?: string[];
  important_notes?: string[];
  keywords: string[];
  related_topics?: string[];
  official_source: string;
  source_type: string;
  last_verified: string;
  version: string;
}

export const JAMB_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: "jamb_profile_creation",
    organization: "JAMB",
    page_type: "procedural",
    category: "Registration",
    subcategory: "Profile Management",
    title: "JAMB Profile Creation",
    summary: "Every candidate must create a unique JAMB profile before accessing any JAMB service. This is mandatory for UTME, Direct Entry, and post-registration operations.",
    steps: [
      "Obtain your National Identification Number (NIN) from NIMC.",
      "Send SMS: 'NIN [space] 11-digit NIN' (e.g. NIN 12345678901) to 55019 or 66019.",
      "Receive a 10-character profile code via SMS from 55019.",
      "Visit the JAMB e-Facility portal (https://efacility.jamb.gov.ng) or an accredited CBT centre.",
      "Use the profile code to purchase the application e-PIN.",
      "Log in and complete profile setup by verifying email, surname, given names, date of birth, state, and LGA of origin."
    ],
    requirements: [
      "Valid 11-digit National Identification Number (NIN)",
      "Active mobile phone number registered with NIN",
      "Valid personal email address"
    ],
    eligibility_rules: [
      "Each candidate is entitled to only ONE profile.",
      "NIMC biodata MUST match SSCE result details exactly."
    ],
    key_facts: [
      "Profile creation is free of charge via SMS (standard SMS rates apply).",
      "The profile code is tied directly to candidate's NIN."
    ],
    important_notes: [
      "Ensure your details supplied to NIMC tally with your SSCE certificate — JAMB pulls biodata directly from the NIMC database.",
      "If you forget your password, click 'Forgot Password' on e-Facility or text 'RESEND' to 55019."
    ],
    keywords: ["profile creation", "nin", "55019", "66019", "profile code", "jamb portal", "efacility"],
    related_topics: ["UTME Registration", "Direct Entry Registration"],
    official_source: "https://www.jamb.gov.ng/FAQ.aspx",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_utme_registration",
    organization: "JAMB",
    page_type: "procedural",
    category: "Registration",
    subcategory: "UTME",
    title: "UTME Registration",
    summary: "The Unified Tertiary Matriculation Examination (UTME) is JAMB's computer-based entrance examination for entry into degree, ND, NCE, and NID programs across Nigerian tertiary institutions.",
    steps: [
      "Generate a Profile Code using your NIN via 55019 / 66019.",
      "Purchase an e-PIN from approved banks, USSD codes, or online portals.",
      "Visit an accredited JAMB CBT centre with your Profile Code and e-PIN.",
      "Provide your choice of institutions (1st, 2nd, 3rd, 4th) and specific course combinations.",
      "Provide O'Level results or indicate 'Awaiting Results' (AR).",
      "Complete biometric capture (all ten fingers) and live passport photograph capture.",
      "Collect your printed UTME Registration Slip containing your registration number."
    ],
    requirements: [
      "JAMB Profile Code",
      "JAMB e-PIN",
      "Biometric finger capture",
      "NIMC registration details"
    ],
    eligibility_rules: [
      "Minimum admission age is 16 years by December of the admission year.",
      "UTME subject combination must include Use of English plus 3 relevant subjects."
    ],
    key_facts: [
      "Registration fee varies by Mock option (with Mock vs without Mock).",
      "Biometric verification is strictly enforced during registration and examination."
    ],
    important_notes: [
      "Current studentship status must be declared if currently enrolled in another institution.",
      "O'Level results must be uploaded to JAMB portal before admission consideration."
    ],
    keywords: ["utme", "utme registration", "cbt centre", "epin", "subject combination", "biometric"],
    related_topics: ["Profile Creation", "O'Level Upload", "JAMB CAPS"],
    official_source: "https://www.jamb.gov.ng",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_direct_entry_registration",
    organization: "JAMB",
    page_type: "procedural",
    category: "Registration",
    subcategory: "Direct Entry",
    title: "Direct Entry (DE) Registration",
    summary: "Direct Entry registration enables candidates with advanced qualifications (ND, HND, NCE, IJMB, JUPEB, Degree) to gain admission directly into 200-Level or 300-Level in Nigerian universities.",
    steps: [
      "Generate a JAMB Profile Code using your NIN.",
      "Purchase a Direct Entry e-PIN from accredited vendors.",
      "Visit an accredited JAMB CBT Centre or JAMB Professional Testing Centre (PTC).",
      "Provide matriculation/registration number and details of previous qualification.",
      "Upload A'Level certificates, ND/HND transcripts or statement of results.",
      "Complete biometric capture and print the Direct Entry Registration Slip."
    ],
    requirements: [
      "Valid A'Level qualification certificate or statement of result",
      "JAMB Profile Code & DE e-PIN",
      "Official academic transcript sent to target institution",
      "Original O'Level result(s)"
    ],
    eligibility_rules: [
      "Candidates must possess minimum acceptable grade/CGPA in candidate's diploma/NCE/A-Level.",
      "A'Level results must be verified by awarding bodies prior to admission approval."
    ],
    key_facts: [
      "DE registration is restricted to specific JAMB state offices and designated CBT hubs.",
      "Acceptable qualifications include IJMB, JUPEB, NCE, ND, HND, GCE A'Level, and University Degrees."
    ],
    important_notes: [
      "Ensure previous institution forwards official transcript to choice university.",
      "Verification of credentials is strictly conducted before CAPS approval."
    ],
    keywords: ["direct entry", "de registration", "ijmb", "jupeb", "nce", "nd", "hnd", "transcript"],
    related_topics: ["Profile Creation", "JAMB CAPS", "O'Level Upload"],
    official_source: "https://www.jamb.gov.ng",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_caps",
    organization: "JAMB",
    page_type: "informational",
    category: "Admissions",
    subcategory: "CAPS Portal",
    title: "JAMB Central Admissions Processing System (CAPS)",
    summary: "CAPS is JAMB's automated portal that handles all admission recommendations and approvals. It eliminates manual manipulations, ensures transparency, and allows candidates to accept or reject admission offers.",
    steps: [
      "Log in to the JAMB e-Facility portal (https://efacility.jamb.gov.ng) with email and password.",
      "Click 'Check Admission Status'.",
      "Select 'Access my CAPS' (switch browser to desktop mode if on mobile).",
      "Click on 'Admission Status' on the left menu.",
      "View recommendation/approval status.",
      "If offered admission, click 'Accept Offer' or 'Reject Offer'."
    ],
    requirements: [
      "Verified JAMB profile login",
      "Uploaded O'Level results on JAMB portal"
    ],
    eligibility_rules: [
      "Accepting an offer is permanent and closes consideration by other institutions.",
      "Rejecting an offer returns candidate to the CAPS Marketplace for other schools to evaluate."
    ],
    key_facts: [
      "CAPS Marketplace allows other institutions with unfilled quotas to request candidates.",
      "Transfer Approval: CAPS notifies candidates if an institution recommends a course transfer."
    ],
    important_notes: [
      "Admissions offered outside CAPS (i.e. solely on school portals without CAPS entry) are illegal and invalid.",
      "Candidates must respond to admission offers within the stipulated timeframe (usually 2 weeks)."
    ],
    keywords: ["caps", "jamb caps", "accept admission", "reject admission", "marketplace", "transfer approval"],
    related_topics: ["Admission Status", "Admission Letter", "O'Level Upload"],
    official_source: "https://www.jamb.gov.ng/caps",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_admission_letter",
    organization: "JAMB",
    page_type: "procedural",
    category: "Admissions",
    subcategory: "Documents",
    title: "JAMB Admission Letter Printing",
    summary: "The official JAMB Admission Letter is mandatory proof of admission required during university clearance, NYSC mobilization, and scholarship applications.",
    steps: [
      "Log in to JAMB e-Facility (https://efacility.jamb.gov.ng).",
      "Ensure you have accepted your admission on CAPS.",
      "Click on 'Print Admission Letter' from the dashboard services.",
      "Confirm transaction details and proceed to payment (online card or bank branch).",
      "Upon payment confirmation, select Examination Year and enter Registration Number.",
      "Download and print both Candidate and Institution copies of the Admission Letter."
    ],
    requirements: [
      "Accepted admission status on CAPS",
      "JAMB Registration Number",
      "Payment of official printing fee"
    ],
    eligibility_rules: [
      "Admission Letter cannot be printed if admission status is 'Not Admitted' or pending."
    ],
    key_facts: [
      "The letter contains security watermark, QR verification code, and official registrar signature.",
      "It serves as primary documentation for NYSC clearance."
    ],
    important_notes: [
      "Always print and keep multiple original copies for institution physical screening.",
      "Do not attempt printing until offer is accepted on CAPS."
    ],
    keywords: ["admission letter", "print admission letter", "nysc clearance", "efacility", "jamb letter"],
    related_topics: ["JAMB CAPS", "Admission Status"],
    official_source: "https://efacility.jamb.gov.ng/",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_result_slip",
    organization: "JAMB",
    page_type: "procedural",
    category: "Examination",
    subcategory: "Results",
    title: "JAMB Official Result Slip",
    summary: "The Official JAMB Result Slip features candidate's passport photograph, detailed subject scores, and institution choices, required for Post-UTME screening and university clearance.",
    steps: [
      "Log in to JAMB e-Facility portal.",
      "Click on 'Print Result Slip' on the service list.",
      "Pay the official fee via Remita or approved gateways.",
      "Select Exam Year and enter Registration Number.",
      "View and print the high-resolution result slip."
    ],
    requirements: [
      "JAMB Registration Number or Email",
      "Payment of result slip printing fee"
    ],
    eligibility_rules: [
      "Original result slip with photograph is required for physical screening."
    ],
    key_facts: [
      "Candidates can check free score breakdown via SMS by sending 'UTMERESULT' to 55019 using registered SIM.",
      "Official result slip contains anti-fraud barcode and photograph."
    ],
    important_notes: [
      "Standard SMS notification is for quick checking; official screening requires the printed slip from e-Facility."
    ],
    keywords: ["result slip", "utmeresult", "print result", "jamb score", "55019", "post utme result"],
    related_topics: ["UTME Registration", "Admission Status"],
    official_source: "https://efacility.jamb.gov.ng/",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_change_of_course_institution",
    organization: "JAMB",
    page_type: "procedural",
    category: "Post-Registration",
    subcategory: "Correction of Data",
    title: "Change of Course / Institution",
    summary: "Service allowing candidates to modify their institution choices or course selection post-UTME to align with their actual UTME score or university requirements.",
    steps: [
      "Log in to JAMB e-Facility portal or visit an accredited CBT Centre.",
      "Click 'Correction of Data' -> 'Course / Institution'.",
      "Generate Transaction ID and make payment online or at bank.",
      "Select new preferred institution(s) and course(s) based on eligibility.",
      "Verify changes against JAMB IBASS subject combination rules.",
      "Submit and print the Change of Data Slip."
    ],
    requirements: [
      "JAMB Registration Number",
      "Payment of official change of course fee",
      "Compliance with destination institution cutoff and subject combination"
    ],
    eligibility_rules: [
      "Changes must be completed before destination institution closes Post-UTME portal.",
      "Subject combination chosen in UTME must match new course requirements."
    ],
    key_facts: [
      "Can be performed multiple times within the active window upon payment for each instance."
    ],
    important_notes: [
      "Always check IBASS or school requirement before making changes to avoid invalid combinations."
    ],
    keywords: ["change of course", "change of institution", "correction of data", "ibass", "post utme"],
    related_topics: ["UTME Registration", "JAMB CAPS"],
    official_source: "https://efacility.jamb.gov.ng/",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_olevel_upload",
    organization: "JAMB",
    page_type: "procedural",
    category: "Admissions",
    subcategory: "O'Level Results",
    title: "O'Level Result Upload to JAMB Portal",
    summary: "Uploading SSCE results (WAEC, NECO, NABTEB, NBAIS) to candidate's JAMB profile is a strict prerequisite for admission consideration on CAPS.",
    steps: [
      "Obtain official SSCE result statement or scratch card details.",
      "Visit an accredited JAMB CBT Centre or JAMB State Office (cannot be done on personal phone).",
      "Provide JAMB Registration Number and O'Level original result printout.",
      "CBT officer uploads grades grade-by-grade on JAMB Portal.",
      "Log into JAMB CAPS ('My O'Level') to verify that all subjects and grades reflect correctly."
    ],
    requirements: [
      "Valid WAEC / NECO / NABTEB examination details (Exam No, Year, Center No)",
      "Accredited CBT Centre operator clearance"
    ],
    eligibility_rules: [
      "Awaiting Results (AR) candidates MUST upload results as soon as released by exam bodies.",
      "Maximum of two sittings allowed across acceptable exam combinations."
    ],
    key_facts: [
      "Candidates cannot be recommended or approved for admission on CAPS with missing O'Level records.",
      "Awaiting results must be updated prior to institution admission shortlisting."
    ],
    important_notes: [
      "Verify upload on CAPS 'My O'Level' section to ensure grades were not mistakenly omitted by operator."
    ],
    keywords: ["olevel upload", "waec", "neco", "nabteb", "my olevel", "awaiting result", "caps upload"],
    related_topics: ["JAMB CAPS", "UTME Registration"],
    official_source: "https://www.jamb.gov.ng/FAQ.aspx",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_admission_status",
    organization: "JAMB",
    page_type: "procedural",
    category: "Admissions",
    subcategory: "Status Check",
    title: "Checking JAMB Admission Status",
    summary: "Candidates can check their admission status for free on the JAMB e-Facility portal or via SMS to track their progress through the admission cycle.",
    steps: [
      "Visit https://efacility.jamb.gov.ng and log in.",
      "Click on 'Check Admission Status'.",
      "Select Exam Year and enter Registration Number.",
      "Click 'Check Admission Status' or click 'Access my CAPS' for detailed stage tracking."
    ],
    requirements: [
      "JAMB Registration Number or registered email address"
    ],
    eligibility_rules: [
      "Checking admission status is completely FREE on the portal."
    ],
    key_facts: [
      "CAPS Status Stages: 1. Not Admitted -> 2. Recommended -> 3. Approved -> 4. Admitted (Accept/Reject).",
      "SMS check: Send 'STATUS [Exam Year] [RegNo]' to 55019 or 66019."
    ],
    important_notes: [
      "Status changes dynamically as institutions submit batch recommendations to JAMB."
    ],
    keywords: ["admission status", "check admission", "recommended", "approved", "caps status", "55019"],
    related_topics: ["JAMB CAPS", "Admission Letter"],
    official_source: "https://www.jamb.gov.ng/caps",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  },
  {
    id: "jamb_regularization",
    organization: "JAMB",
    page_type: "procedural",
    category: "Post-Registration",
    subcategory: "Late Registration",
    title: "JAMB Regularization (Late Registration / Condonement)",
    summary: "Process for students admitted into tertiary institutions without formal JAMB admission records to regularize their admission and obtain an official JAMB Registration Number.",
    steps: [
      "Log in to JAMB e-Facility portal.",
      "Select 'Late Registration' or 'Condonement of Illegitimate Admission'.",
      "Fill the online regularization form accurately.",
      "Pay the prescribed regularization fee via Remita.",
      "Print the generated Indemnity Form.",
      "Submit the Indemnity Form to your institution's Registrar for signature and official stamp.",
      "Institution forwards signed form to the JAMB State Office for final approval."
    ],
    requirements: [
      "Institution admission details",
      "Signed and stamped Indemnity Form",
      "Official fee payment receipt"
    ],
    eligibility_rules: [
      "Only applicable to students admitted through recognized non-JAMB modes or legacy programs.",
      "Requires institutional endorsement before JAMB processing."
    ],
    key_facts: [
      "Enables students to qualify for NYSC or Exemption Certificate upon graduation.",
      "Generates an official JAMB Registration Number upon approval."
    ],
    important_notes: [
      "Always follow up with your institution's admissions office to confirm submission of Indemnity Form to JAMB."
    ],
    keywords: ["regularization", "late registration", "indemnity form", "condonement", "nysc clearance"],
    related_topics: ["Admission Letter", "Profile Creation"],
    official_source: "https://efacility.jamb.gov.ng/",
    source_type: "Official Website",
    last_verified: "2026-07-28",
    version: "2026"
  }
];

/**
 * Search the JAMB Knowledge Base using semantic keyword matching
 */
export const searchJAMBKnowledgeBase = (query: string): KnowledgeDocument[] => {
  if (!query || !query.trim()) return JAMB_KNOWLEDGE_BASE;
  const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  return JAMB_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const summaryLower = doc.summary.toLowerCase();
    const categoryLower = doc.category.toLowerCase();
    const subcategoryLower = (doc.subcategory || '').toLowerCase();
    
    tokens.forEach(token => {
      if (titleLower.includes(token)) score += 10;
      if (doc.keywords.some(k => k.includes(token))) score += 8;
      if (subcategoryLower.includes(token)) score += 5;
      if (categoryLower.includes(token)) score += 4;
      if (summaryLower.includes(token)) score += 2;
    });

    return { doc, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.doc);
};
