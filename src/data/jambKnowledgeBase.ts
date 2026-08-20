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
  },
  {
    id: "futa_admission_guidelines_2026",
    organization: "FUTA",
    page_type: "procedural",
    category: "Institution Admission",
    subcategory: "FUTA Admissions",
    title: "Federal University of Technology, Akure (FUTA) 2026/2027 Admission Guidelines",
    summary: "Comprehensive official admission guidelines for FUTA for the 2026/2027 academic session, detailing the 75:25 point-based aggregate system, screening prerequisites, and eligibility criteria.",
    steps: [
      "Choose FUTA as your First Choice (Most Preferred) institution in your JAMB UTME application.",
      "Score the minimum institutional cutoff mark (typically 180 and above depending on the course).",
      "Ensure O'Level results (WAEC, NECO, GCE) with required credits in Mathematics, English, Physics, Chemistry, and Biology/Agricultural Science are uploaded on JAMB CAPS.",
      "Register for the FUTA Post-UTME screening online via the official FUTA admission portal (https://www.futa.edu.ng).",
      "Participate in the FUTA screening process and monitor your aggregate score calculation.",
      "Accept admission offer promptly on JAMB CAPS once recommended."
    ],
    requirements: [
      "Minimum JAMB UTME score of 180 (higher for professional courses like Engineering, Computer Science, Architecture, and Nursing/Health Sciences)",
      "O'Level results in not more than two sittings",
      "Uploaded O'Level results on JAMB CAPS",
      "FUTA Post-UTME online registration slip"
    ],
    eligibility_rules: [
      "Candidate must have chosen FUTA as First Choice institution.",
      "O'Level core subjects must match course requirements exactly."
    ],
    key_facts: [
      "FUTA uses a 75:25 Point-Based Aggregate System (75% UTME score + 25% O'Level grade points).",
      "No physical written Post-UTME exam; screening is strictly point-based credential verification using UTME and O'Level grades."
    ],
    important_notes: [
      "Ensure your email address and phone number are active throughout the admission season.",
      "Beware of fraudsters demanding cash for admission placement; FUTA admissions are strictly merit and quota-based via JAMB CAPS."
    ],
    keywords: ["futa", "federal university of technology akure", "futa admission", "futa cutoff", "futa screening", "75:25 system"],
    related_topics: ["FUTA Post-UTME Screening", "FUTA Clearances", "JAMB CAPS"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-10",
    version: "2026/2027"
  },
  {
    id: "futa_post_utme_screening",
    organization: "FUTA",
    page_type: "procedural",
    category: "Institution Screening",
    subcategory: "Point-Based Aggregate",
    title: "FUTA Post-UTME Screening & 75:25 Aggregate Calculation Formula",
    summary: "Detailed breakdown of FUTA's unique point-based screening system combining UTME performance (75%) and O'Level grades (25%).",
    steps: [
      "Step 1: Compute UTME Score Component (75% max): Divide your JAMB score by 400, then multiply by 75. Formula: (JAMB Score / 400) * 75.",
      "Step 2: Compute O'Level Score Component (25% max): Sum the points of your best 5 relevant O'Level subjects (Mathematics, English Language, and 3 core subjects relevant to your course).",
      "Step 3: O'Level Grade Point Scale: A1 = 80, B2 = 72, B3 = 67, C4 = 62, C5 = 57, C6 = 52. Average across 5 subjects is multiplied by 25% (or Sum of 5 grades / 20).",
      "Step 4: Total Aggregate Score: Add UTME Component + O'Level Component for a final score out of 100%."
    ],
    requirements: [
      "JAMB UTME Score",
      "O'Level Result (WAEC/NECO/GCE) showing grades in 5 relevant subjects"
    ],
    eligibility_rules: [
      "O'Level results obtained in more than two sittings are not accepted for competitive professional courses.",
      "Mathematics and English Language are compulsory core subjects in the 5 O'Level count."
    ],
    key_facts: [
      "Maximum UTME weight = 75 marks.",
      "Maximum O'Level weight = 25 marks.",
      "Total Aggregate = Out of 100 marks."
    ],
    important_notes: [
      "Entering incorrect O'Level grades during online registration will lead to automatic disqualification during physical clearance.",
      "Ensure awaiting results are updated immediately they are released by WAEC/NECO."
    ],
    keywords: ["futa aggregate", "75:25 formula", "futa screening points", "olevel grading futa", "futa post utme"],
    related_topics: ["FUTA Admission Guidelines", "CGPA Calculator"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-10",
    version: "2026/2027"
  },
  {
    id: "futa_clearance_and_registration",
    organization: "FUTA",
    page_type: "procedural",
    category: "Registration",
    subcategory: "Fresh Students Clearance",
    title: "FUTA Fresh Students Physical & Online Clearance Procedures",
    summary: "Step-by-step clearance and documentation guide for candidates offered provisional admission into FUTA for the 2026/2027 academic session.",
    steps: [
      "Log in to the FUTA undergraduate portal using your JAMB registration number to accept the admission and print the FUTA Admission Letter.",
      "Pay the prescribed Acceptance Fee via the online payment platform (Remita / FUTA portal).",
      "Complete the online biodata form and upload required credentials (Birth certificate, State of origin certificate, O'level results, JAMB result slip, and Admission letter).",
      "Print out the completed clearance screening form and file copies of all credentials.",
      "Proceed to the designated department/school clearance venue for physical document verification.",
      "Obtain clearance sign-off from the Admissions Office and proceed to pay school fees to obtain matriculation number."
    ],
    requirements: [
      "FUTA Admission Letter & JAMB Admission Letter",
      "JAMB UTME Result Slip (Original)",
      "O'Level Certificates or Statements of Result (WAEC/NECO)",
      "Birth Certificate or Statutory Declaration of Age",
      "Certificate of State/Local Government Origin",
      "Passport photographs (recent, white background)",
      "Acceptance fee and School fees payment receipts"
    ],
    eligibility_rules: [
      "Physical clearance is mandatory; failure to appear within the stipulated deadline forfeits the admission offer.",
      "Credentials presented must match details submitted on JAMB CAPS."
    ],
    key_facts: [
      "Clearance usually takes place at the FUTA e-Learning Center or respective departmental boardrooms.",
      "Matriculation numbers are generated immediately upon school fees confirmation."
    ],
    important_notes: [
      "Keep multiple photocopies of all credentials in a sturdy file jacket.",
      "Medical examination at the University Health Centre is a mandatory post-clearance requirement."
    ],
    keywords: ["futa clearance", "futa freshers", "acceptance fee futa", "futa registration", "futa physical clearance"],
    related_topics: ["FUTA Admission Guidelines", "FUTA Post-UTME Screening"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-10",
    version: "2026/2027"
  },
  {
    id: "futa_schools_and_faculties",
    organization: "FUTA",
    page_type: "informational",
    category: "Academics",
    subcategory: "Faculties and Departments",
    title: "FUTA Schools, Faculties and Academic Structure",
    summary: "Overview of schools and major professional degree programs offered at the Federal University of Technology, Akure (FUTA).",
    steps: [],
    requirements: [],
    eligibility_rules: [],
    key_facts: [
      "SEET (School of Engineering and Engineering Technology): Mechanical, Civil, Electrical/Electronics, Mechatronics, Computer, Agricultural & Environmental Engineering, Petroleum & Chemical Engineering.",
      "SOC (School of Computing): Computer Science, Cyber Security, Software Engineering, Information Technology, Information Systems.",
      "SAAT (School of Agriculture and Agricultural Technology): Crop Production, Animal Production, Agricultural Economics, Fisheries and Aquaculture.",
      "SOS (School of Sciences): Microbiology, Biochemistry, Industrial Chemistry, Mathematics, Physics, Statistics, Biology.",
      "SEMS (School of Earth and Mineral Sciences): Applied Geology, Applied Geophysics, Mining Engineering, Remote Sensing & GIS.",
      "SET (School of Environmental Technology): Architecture, Quantity Surveying, Estate Management, Building, Urban & Regional Planning.",
      "SHHT (School of Health and Health Technology): Nursing Science, Human Anatomy, Physiology, Public Health."
    ],
    important_notes: [
      "All FUTA programs are accredited by NUC and relevant professional bodies (COREN, NCN, NIOB, NIA, etc.)."
    ],
    keywords: ["futa schools", "futa courses", "seet futa", "soc futa", "futa engineering", "futa computer science"],
    related_topics: ["FUTA Admission Guidelines", "Master Courses"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-10",
    version: "2026/2027"
  },
  {
    id: "jamb_policy_meeting_cutoffs_2026",
    organization: "JAMB / Federal Ministry of Education",
    page_type: "policy",
    category: "Policy & Eligibility",
    subcategory: "Minimum Tolerable Admission Cut-offs",
    title: "2026 JAMB Policy Meeting Approved Minimum Tolerable Admission Cut-off Scores",
    summary: "Official minimum tolerable admission cutoff scores approved at the 2026 JAMB Policy Meeting for all tertiary institutions in Nigeria, minimum admission age (16 years), and DE clearance directives.",
    steps: [],
    requirements: [
      "Minimum age of 16 years by December 31 of the admission year",
      "UTME score meeting or exceeding national baseline threshold for institution type",
      "Uploaded O'Level results on JAMB CAPS"
    ],
    eligibility_rules: [
      "Universities minimum tolerable score: 150",
      "Colleges of Nursing minimum tolerable score: 150",
      "Polytechnics, Monotechnics, Colleges of Agriculture, Colleges of Education, and IEIs: 100",
      "Individual institutions may set higher departmental cut-off marks, but no institution may admit candidates below these national minimum thresholds."
    ],
    key_facts: [
      "Universities baseline: 150",
      "Colleges of Nursing baseline: 150",
      "Polytechnics / Colleges of Education / IEIs baseline: 100",
      "Minimum admission age remains 16 years old.",
      "94 candidates flagged on the official 2026 List of Solicitation Candidates.",
      "43 institutions with 20 or more outstanding Direct Entry result clearance requests (e.g. Federal Poly Nasarawa 222, KadPoly 220, UNICAL 115, DELSU 95, UNIABUJA 81) summoned for mandatory clearance."
    ],
    important_notes: [
      "Top competitive universities (e.g. UNILAG, UI, OAU, FUTA) typically set higher departmental screening cut-offs."
    ],
    keywords: ["2026 policy meeting", "minimum cutoff 150", "university cutoff 150", "polytechnic cutoff 100", "nursing cutoff 150", "admission age 16", "solicitation candidates", "outstanding de clearance"],
    related_topics: ["UTME Registration", "JAMB CAPS", "Direct Entry"],
    official_source: "https://www.jamb.gov.ng/",
    source_type: "Official Website",
    last_verified: "2026-08-11",
    version: "2026"
  },
  {
    id: "jamb_condonement_illegal_admissions_2026",
    organization: "JAMB",
    page_type: "procedural",
    category: "Admissions",
    subcategory: "Irregular Admission Condonement",
    title: "Disclosure & Condonement of Irregularly/Illegally Admitted Candidates (2024/25 & 2025/26 Intakes)",
    summary: "Official ministerial approval granted by the Honourable Minister of Education for condonement of candidates illegally admitted into Colleges of Education without JAMB for 2024/2025 and 2025/2026 academic sessions (Ref: JAMB/ADMS/DO/208/V.I).",
    steps: [
      "1. Obtain O'Level Result Verification Code from the relevant examination body website (WAEC: https://buyresultsverificationcode.waeconline.org.ng — ₦1,500 for 1 sitting, ₦2,000 for 2 sittings across exam bodies).",
      "2. Approach any accredited CBT Center, Professional Registration Centre (PRC), or Institutional Professional Registration Centre (IPRC) with your O'Level Result Verification Code.",
      "3. Make ePayment on the JAMB Portal: Application registration fee (₦3,500) + CBT/PRC/IPRC centre registration charges (₦700) = Total ₦4,200.",
      "4. Select 1st Choice, 2nd Choice, and 3rd Choice (Colleges of Education). The 1st Choice MUST be the College and Programme in which the candidate was illegally admitted.",
      "5. Supply all requirements, results, and upload filled registration template form.",
      "6. College Admission Officer proposes and Provost recommends candidate to JAMB via eFacility portal to CAPS."
    ],
    requirements: [
      "Official O'Level Result Verification Code (WAEC/NECO/NABTEB/NBAIS)",
      "JAMB ePayment receipt for ₦4,200 (₦3,500 application + ₦700 centre charges)",
      "Official endorsement by College Provost / Institution Registrar"
    ],
    eligibility_rules: [
      "Applies strictly to 2024/2025 and 2025/2026 academic intakes. Does NOT apply to 2026 intakes.",
      "Candidates with Awaiting Results (AR) status are NOT eligible for condonement.",
      "All institution submissions must reach JAMB on or before June 30, 2026. False declarations or omissions will not be condoned."
    ],
    key_facts: [
      "Condonement total fee: ₦4,200 on JAMB Portal.",
      "1st Choice must match the exact College and Programme where the illegal admission took place.",
      "Enables illegally admitted students to regularize admission and obtain valid JAMB Admission Letters."
    ],
    important_notes: [
      "Candidates must obtain the SSCE verification code prior to visiting the CBT/IPRC centre."
    ],
    keywords: ["condonement of illegal admission", "irregular admission", "waiver", "colleges of education condonement", "waec verification code", "jamb 4200", "babaji", "jamb/adms/do/208/v.i"],
    related_topics: ["JAMB Regularization", "O'Level Upload", "JAMB CAPS"],
    official_source: "https://www.jamb.gov.ng/pdfs/2026/Letter%20to%20Provosts%20on%20Special%20waiver.pdf",
    source_type: "Official Circular",
    last_verified: "2026-08-11",
    version: "2026"
  },
  {
    id: "jamb_nce_nd_agric_registration_guidelines_2026",
    organization: "JAMB / NCCE",
    page_type: "policy",
    category: "Registration & Admissions",
    subcategory: "NCE & ND Agric Guidelines",
    title: "2026/2027 NCE & ND Non-Technology Agric Registration Guidelines",
    summary: "Official JAMB Registrar Advisory governing NCE mode registration, ND Non-Technology Agric Related Programmes, and complete abolition of 100/200 Level degree admissions in Colleges of Education starting 2026/2027 session.",
    steps: [
      "1. Obtain O'Level Result Verification Code from examination body website (WAEC: https://buyresultsverificationcode.waeconline.org.ng — ₦1,500 for 1 sitting, ₦2,000 for 2 sittings).",
      "2. Send NIN to 55019 or 66019 to obtain a JAMB Profile Code.",
      "3. Log in to e-Facility portal and select NCE/Agric registration option.",
      "4. Make ePayment (₦3,500 application fee + ₦700 CBT fee; OR pay ONLY ₦700 if migrating from 2026 UTME application).",
      "5. Present SSCE Verification Code, choose up to 3 choices (Colleges of Education), capture biometrics, and print Registration Slip.",
      "6. College Admission Officer proposes and Provost recommends candidate on eFacility to CAPS."
    ],
    requirements: [
      "NIN & JAMB Profile Code",
      "SSCE Result Verification Code (WAEC/NECO/NABTEB/NBAIS)",
      "Passport photograph & biometric capture"
    ],
    eligibility_rules: [
      "NO 100 or 200 Level degree admissions allowed in any College of Education from 2026/2027 session — ALL entrants must be through NCE.",
      "NO admissions into affiliated degree programmes in any College of Education from 2026/2027 session.",
      "Candidate can be processed for ONLY ONE mode of entry at a time (choosing NCE suspends ongoing UTME/DE process)."
    ],
    key_facts: [
      "2026 UTME Candidates migrating to NCE/ND Agric pay ONLY ₦700 registration fee (₦3,500 JAMB application fee is WAIVED).",
      "2026 DE Candidates who chose affiliated COEs have 3 free options: Change of Institution, Transfer to Parent University, or Default to Second Choice.",
      "2026 UTME (100L) Candidates who chose affiliated COEs have 3 free options: Change of Institution, Change to Second Choice, or Default to NCE Programme.",
      "Every College of Education has an Institutional Professional Registration Centre (IPRC) with minimum 2 registration points."
    ],
    important_notes: [
      "Candidates with Awaiting Results (AR) cannot be proposed or recommended on CAPS until O'Level results are verified and uploaded."
    ],
    keywords: ["nce registration guidelines", "nd agric registration", "no 100l in coe", "affiliated colleges of education", "nce 700 fee", "ncce", "jamb advisory june 2026"],
    related_topics: ["UTME Registration", "Direct Entry", "JAMB CAPS"],
    official_source: "https://www.jamb.gov.ng/pdfs/2026/V5%20Special%20Registration%20Flow%20NCE%20ND.pdf",
    source_type: "Official Advisory",
    last_verified: "2026-08-11",
    version: "2026"
  },
  {
    id: "jamb_inclusive_education_strategic_roadmap_2024_2028",
    organization: "Federal Ministry of Education / JAMB",
    page_type: "policy",
    category: "Special Needs & Inclusion",
    subcategory: "JEOG Strategic Roadmap",
    title: "Strategic Roadmap for Inclusive Access to Quality Higher Education in Nigeria (2024–2028)",
    summary: "Comprehensive 5-year strategic roadmap developed by the JAMB Equal Opportunity Group (JEOG) and Federal Ministry of Education (budget: ₦14,735,947,046) establishing national standards, trimodal UTME examination modes, and inclusion targets for persons with disabilities in tertiary institutions.",
    steps: [],
    requirements: [
      "Eligible candidates with Special Needs (visual impairment, hearing impairment, physical/health impairment, autism, Down Syndrome, learning disabilities, albinism, etc.)",
      "Registration via JEOG designated centers nationwide"
    ],
    eligibility_rules: [
      "Trimodal UTME choice: (a) Fully Braille, (b) Fully CBT, or (c) Fully Read-Aloud by proctor.",
      "Equal opportunity and non-discriminatory admission criteria applied across all tertiary institutions."
    ],
    key_facts: [
      "Drafted by JEOG led by Registrar Prof. Is-haq Oloyede and Chairman Prof. Emeritus Peter Okebukola.",
      "Total estimated implementation cost: ₦14,735,947,046.",
      "Goal 1: Establish national standards & quality assurance guidelines for inclusive basic & higher education.",
      "Goal 2: Establish & update national database of eligible Special Needs individuals by 2025.",
      "Goal 3: At least 5% annual increase in admission of candidates with Special Needs through JAMB.",
      "Goal 4: Trimodal UTME system with 5% annual increase in fully-CBT mode leading up to 2028.",
      "Goal 5: 2% annual growth rate in UTME participation for non-visually impaired disability categories (autism, Down Syndrome, hard of hearing, muteness).",
      "Goal 6: Expand basic education opportunities for blind/visually-impaired candidates by 5% annually.",
      "Goal 7: 10% annual increase in tertiary institutions (Universities, Polytechnics, COEs) with ambient, disability-friendly environments and support centers.",
      "Goal 8: At least 60% of students with disabilities report receiving non-discriminatory attention in class, hostels, and campus by 2028.",
      "Goal 9: Rank Nigeria among top 5 in Africa and top 20 globally for successful inclusive education implementation."
    ],
    important_notes: [
      "JAMB Equal Opportunity Group (JEOG) processes over 2,600 Special Needs candidates with an average success rate exceeding 33%."
    ],
    keywords: ["strategic roadmap inclusive access", "jeog", "jamb equal opportunity group", "special needs utme", "braille cbt read aloud", "disability access jamb", "peter okebukola", "ishaq oloyede", "inclusive education nigeria"],
    related_topics: ["UTME Registration", "JAMB Policy Meeting", "JAMB CAPS"],
    official_source: "https://www.jamb.gov.ng/PDFs/FINAL-2024-2028%20Strategic%20Roadmap%20for%20Inclusive%20Access%20to%20Quality%20Higher%20Education-Oct_2024updated.pdf",
    source_type: "Official Policy Document",
    last_verified: "2026-08-11",
    version: "2024-2028"
  },
  {
    id: "jamb_returnee_candidates_guidelines_2026",
    organization: "JAMB",
    page_type: "procedural",
    category: "Admissions",
    subcategory: "Foreign Returnees & Transfers",
    title: "JAMB Returnee Candidates Application Guidelines (Foreign Returnees & Inter-University Transfer)",
    summary: "Official JAMB process for Nigerian students displaced from foreign institutions (e.g. Ukraine, Sudan, Turkey) or seeking inter-university transfers to gain absorbed admission into Nigerian universities.",
    steps: [
      "1. Download the official 'Advisory for Returnee Students (Ukraine, Turkey, Sudan, Inter-University Transfer)' from JAMB website.",
      "2. Download and review the Affidavit Guide and official Affidavit template.",
      "3. Execute a sworn court Affidavit before a High Court commissioner for oaths.",
      "4. Visit the official returnee portal: https://returnee.jamb.gov.ng/ and complete the application form.",
      "5. Upload official academic transcripts from former university, previous admission letter, passport data page, and sworn affidavit.",
      "6. JAMB evaluates credentials and issues formal clearance/recommendation to the target Nigerian university for absorption."
    ],
    requirements: [
      "Official academic transcript from former foreign or local university",
      "Sworn court Affidavit adhering to JAMB Affidavit Guide",
      "Application submitted via https://returnee.jamb.gov.ng/",
      "Valid international passport or national ID"
    ],
    eligibility_rules: [
      "Must be a genuine returnee student displaced by war/crisis or seeking formal inter-university transfer.",
      "Subject combinations and credit transfers must meet target university and NUC/JAMB standards."
    ],
    key_facts: [
      "Provides legitimate academic path for Nigerian students affected by conflict in Ukraine, Sudan, and Turkey.",
      "Generates official JAMB clearance and updated registration record."
    ],
    important_notes: [
      "Ensure transcripts are official and verified by target institution before clearance finalization."
    ],
    keywords: ["returnee candidates", "ukraine returnee students", "sudan returnee students", "turkey returnee", "inter university transfer jamb", "returnee.jamb.gov.ng", "affidavit guide"],
    related_topics: ["Direct Entry", "JAMB Regularization", "Admission Letter"],
    official_source: "https://www.jamb.gov.ng/ReturneeApplicants.aspx",
    source_type: "Official Portal Guidelines",
    last_verified: "2026-08-11",
    version: "2026"
  },
  {
    id: "jamb_profiled_email_lost_sim_service",
    organization: "JAMB",
    page_type: "procedural",
    category: "Services & Profile",
    subcategory: "SIM Loss & Profile Update",
    title: "Implementation of 'Profiled Email' Service to Substitute Lost SIM",
    summary: "Official JAMB procedure allowing candidates who lost their registered SIM card to attach a 'Profiled Email' at an accredited CBT center via TEMPL 006 to restore profile access and receive SMS notifications.",
    steps: [
      "1. Candidate visits any accredited CBT Center and requests template TEMPL 006 ('add email' service).",
      "2. Complete template details (Registration Number, Phone Number, Profile Code, and mandatory new email address never previously used on JAMB platform).",
      "3. Sign the declaration/attestation section affirming accuracy.",
      "4. CBT official logs in with authorized credentials on the CBT Registration App, initiates 'add email' feature, and uploads the signed TEMPL 006 template.",
      "5. System validates new email address and sends a confirmation link or verification code to candidate's email inbox.",
      "6. Candidate clicks verification link or inputs confirmation code to authenticate.",
      "7. Profile is updated to 'Profiled Email', unlocking Password Reset, RESEND, RESULT, ePIN, and a new 'Messages' menu (acting as the SMS inbox of the lost SIM)."
    ],
    requirements: [
      "New email address (never previously registered on JAMB platform)",
      "Completed & signed TEMPL 006 template form",
      "Registration Number, Phone Number, or Profile Code"
    ],
    eligibility_rules: [
      "Email must be active, accessible, and not previously associated with another JAMB profile.",
      "Template upload must be performed at an accredited CBT Center by an authorized official."
    ],
    key_facts: [
      "Replaces the need for SIM retrieval for JAMB profile operations.",
      "Restores access to 55019 / 66019 USSD commands via profile dashboard.",
      "Adds a new 'Messages' menu inside eFacility profile where all 55019/66019 SMS notifications are mirrored."
    ],
    important_notes: [
      "Candidate must sign the TEMPL 006 form to make the declaration legally binding."
    ],
    keywords: ["lost sim jamb", "profiled email", "templ 006", "add email jamb", "substitute lost sim", "jamb email update", "cbt registration app email", "55019 messages"],
    related_topics: ["JAMB Profile Code", "E-Facility", "Password Reset"],
    official_source: "https://www.jamb.gov.ng/img/2025Advisories/PROFILED_EMAIL_SERVICE1.pdf",
    source_type: "Official Implementation Guide",
    last_verified: "2026-08-11",
    version: "2025/2026"
  },
  {
    id: "jamb_minimum_admissible_age_16_years_policy",
    organization: "JAMB / Federal Ministry of Education",
    page_type: "policy",
    category: "Policy & Eligibility",
    subcategory: "Minimum Admissible Age",
    title: "Admission of Candidates with Minimum Admissible Age of 16 Years (Ref: JAMB/ADMS/139/V.III)",
    summary: "Official JAMB policy circular (Ref: JAMB/ADMS/139/V.III) enforcing 16 years as the minimum age for admission into Nigerian tertiary institutions, with flexibility for sessions extending into August 2025.",
    steps: [
      "1. Institutions harvest eligible candidates reaching 16 years of age between January 1st and August 31st, 2025 from CAPS.",
      "2. Submit the harvested list to JAMB for final admission approval.",
      "3. Candidates who meet departmental standards but were previously restricted due to age can now be considered."
    ],
    requirements: [
      "Candidate must attain at least 16 years of age by 31st December 2024 (or 31st August 2025 for institutions whose 2024/2025 session extends through July 2025).",
      "Full compliance with institution departmental and screening criteria."
    ],
    eligibility_rules: [
      "Sacrosanct baseline: Candidate cannot be admitted below 16 years of age.",
      "Institutions whose 2024/2025 admission cycle extends through July 2025 are allowed to admit candidates who turn 16 by August 31, 2025.",
      "Institutions desiring to strictly enforce 16 years within the 2024 calendar year (by Dec 31, 2024) are completely free to do so."
    ],
    key_facts: [
      "Ensures equity across institutions with varying academic calendar end-dates.",
      "Signed by Director Admissions Mohammed A. Babaji on behalf of the Registrar.",
      "Prevents candidates from being unduly disadvantaged due to delayed session calendars."
    ],
    important_notes: [
      "16 years minimum age is a national baseline across all universities, polytechnics, colleges of nursing, and colleges of education."
    ],
    keywords: ["minimum age 16", "jamb/adms/139/v.iii", "admission age requirement", "16 years august 31 2025", "16 years december 31 2024", "caps age harvest", "babaji age circular"],
    related_topics: ["JAMB Policy Meeting", "JAMB CAPS", "University Admission Criteria"],
    official_source: "https://www.jamb.gov.ng/img/2024Advisories/PROFILED_EMAIL_SERVICE1.pdf",
    source_type: "Official Circular",
    last_verified: "2026-08-11",
    version: "2024/2025"
  },
  {
    id: "jamb_registrar_prof_segun_aina",
    organization: "JAMB",
    page_type: "informational",
    category: "Governance & Leadership",
    subcategory: "Executive Leadership",
    title: "Profile of the Registrar & Chief Executive — Prof. Segun Aina",
    summary: "Official profile of Prof. Segun Aina, the sixth Registrar and Chief Executive of the Joint Admissions and Matriculation Board (JAMB).",
    steps: [],
    requirements: [],
    eligibility_rules: [],
    key_facts: [
      "Name: Prof. Segun Aina",
      "Role: Sixth Registrar and Chief Executive Officer of JAMB.",
      "Academic Background: Distinguished Professor of Computer Engineering.",
      "Qualifications: B.Eng in Computer Systems Engineering (Univ. of Kent, UK), M.Sc in Internet Computing & Network Security (Loughborough Univ, UK), PhD in Digital Signal Processing (Loughborough Univ, UK), Senior Management Programme (Lagos Business School).",
      "Key Pillars & Leadership Vision: Unwavering commitment to examination integrity, public sector innovation, digital transformation, artificial intelligence integration, and modernizing examination technology across Nigeria."
    ],
    important_notes: [
      "Affirms readiness to strengthen operational processes, technological innovation, and transparent equal opportunity matriculation services."
    ],
    keywords: ["segun aina", "prof segun aina", "jamb registrar", "sixth registrar jamb", "computer engineering registrar"],
    related_topics: ["JAMB Mandate", "Board Leadership"],
    official_source: "https://www.jamb.gov.ng/Registrar_CE.aspx",
    source_type: "Official Profile",
    last_verified: "2026-08-11",
    version: "2026"
  },
  {
    id: "jamb_ibass_eligibility_checker_system",
    organization: "JAMB / IBASS",
    page_type: "procedural",
    category: "Brochure & Syllabus",
    subcategory: "IBASS Eligibility Checker",
    title: "JAMB IBASS Eligibility Checker & Automated Programme Verification System",
    summary: "Official JAMB Integrated Brochure & Syllabus System (IBASS) tool enabling candidates to verify admission eligibility across modes of entry, institutions, O'Level subject combinations, A'Level credits, and UTME subject requirements.",
    steps: [
      "1. Access the official IBASS portal at https://ibass.jamb.gov.ng/eligibility-checker",
      "2. Select Mode of Entry (UTME or Direct Entry), Institution Type (University, Polytechnic, COE, IEI), Category, target Institution, and Program.",
      "3. Specify O'Level Credits (A1-C6) and Passes (D7-E8) across up to 9 selected SSCE subjects.",
      "4. Specify A'Level Credits and Passes (if applying via Direct Entry).",
      "5. Select 4 UTME Subject Combination (with English Language as mandatory compulsory subject).",
      "6. Click 'Check Eligibility' to run instant validation against official IBASS brochure requirements and CAPS admission criteria."
    ],
    requirements: [
      "5 O'Level credit passes (A1-C6) including English Language and Mathematics (where applicable) at maximum 2 sittings.",
      "4 UTME subjects matching the official IBASS brochure requirements for target course.",
      "Valid A'Level results / Diploma qualifications for Direct Entry candidates."
    ],
    eligibility_rules: [
      "English Language is compulsory across all UTME subject combinations.",
      "Subject combinations must strictly match the IBASS brochure for the selected institution and program.",
      "Candidates with Awaiting Results (AR) can check eligibility conditionally before final result upload on CAPS."
    ],
    key_facts: [
      "Official URL: https://ibass.jamb.gov.ng/",
      "Provides digital brochure, e-syllabus, CBT guidelines, process manuals, and live eligibility checker.",
      "Directly synced with JAMB Central Admissions Processing System (CAPS)."
    ],
    important_notes: [
      "Always verify brochure requirements on IBASS before registering or changing courses to prevent disqualification."
    ],
    keywords: ["ibass", "eligibility checker", "jamb eligibility checker", "utme subject combination", "o level requirement checker", "ibass brochure", "jamb e-syllabus", "check programme eligibility"],
    related_topics: ["UTME Registration", "JAMB CAPS", "Direct Entry", "O'Level Upload"],
    official_source: "https://ibass.jamb.gov.ng/eligibility-checker",
    source_type: "Official Portal Tool",
    last_verified: "2026-08-11",
    version: "2026"
  },
  {
    id: "fuoye_2026_post_utme_screening",
    organization: "Federal University Oye-Ekiti (FUOYE)",
    page_type: "policy",
    category: "Post-UTME",
    subcategory: "Screening & Cut-off Marks",
    title: "FUOYE 2026/2027 UPASE Screening Official Step-by-Step Application Guide",
    summary: "Complete official candidate guide for the Federal University Oye-Ekiti (FOUYE) 2026/2027 University Pre-Admission Screening Exercise (UPASE), covering portal login, personal detail updates, requirement checks, Remita fee payment (₦2,000 screening + ₦2,500 COP), document uploads, and clearance statuses.",
    steps: [
      "1. Access Portal: Visit https://putme.fuoye.edu.ng/utme/ and review requirements/cut-off marks.",
      "2. Login: Use your JAMB Registration Number as username and any registered name as password. (Candidates who recently changed institution should wait 3-4 working days or contact call centre).",
      "3. Update Personal Details: Provide valid email address, active phone number, and current contact address.",
      "4. Verify Requirements: Check JAMB score, core/optional subjects, and O'Level requirements against your chosen programme.",
      "5. Screening Fee Payment: Generate Remita RRR and pay ₦2,000 UTME/DE screening fee (or ₦2,500 Change of Programme fee if switching courses).",
      "6. Upload Documents: Scan and upload O'Level certificates/results and passport photograph (max 100KB).",
      "7. Final Submission & Status Tracking: Submit application and monitor status ('CLEARED', 'REJECTED', 'DISQUALIFIED', 'PROPOSED')."
    ],
    requirements: [
      "Minimum JAMB cut-off mark: 150 (Medicine 280, Nursing 240, MLS 230, Radiography 220, Criminology 210, Mass Comm/Accounting/Business Admin/Theatre Arts/Computer Science 200).",
      "O'Level result credits in relevant subjects (English Language and Mathematics compulsory).",
      "Valid JAMB Registration Number and registered name."
    ],
    eligibility_rules: [
      "FUOYE conducts online point screening (JAMB UTME score 60% + O'Level score 30% + Sitting Bonus 10%). No written post-UTME exam.",
      "Department of Law: FUOYE will NOT admit candidates into the Department of Law for the 2026/2027 academic session. Candidates must change to other available programmes.",
      "Awaiting Result (AR) candidates may apply but submission requires O'Level result upload.",
      "Deadline: August 28, 2026."
    ],
    key_facts: [
      "Portal URL: https://putme.fuoye.edu.ng/utme/",
      "Application Deadline: August 28, 2026",
      "Screening Fee: ₦2,000 | Change of Programme Fee: ₦2,500",
      "Passport Photograph Size: Maximum 100KB (permanent for university duration)",
      "Application Statuses: CLEARED, REJECTED, DISQUALIFIED, PROPOSED"
    ],
    important_notes: [
      "No official communication will be sent via email/SMS; candidates must regularly log in to check status.",
      "Clearance does not guarantee admission until final PROPOSED status via JAMB CAPS."
    ],
    keywords: ["fuoye upase 2026", "fuoye post utme guide", "putme.fuoye.edu.ng", "fuoye screening portal", "fuoye remita payment", "fuoye clearance status"],
    related_topics: ["Post-UTME Release Hub", "University Cut-off Marks", "Aggregate Calculator"],
    official_source: "https://putme.fuoye.edu.ng/utme/",
    source_type: "Official University PDF Guide",
    last_verified: "2026-08-19",
    version: "2026"
  },
  {
    id: "futes_iyin_2026_post_utme_screening",
    organization: "Federal University of Technology and Environmental Sciences, Iyin-Ekiti (FUTES-IYIN)",
    page_type: "policy",
    category: "Post-UTME",
    subcategory: "Screening & Cut-off Marks",
    title: "FUTES-IYIN 2026/2027 Post-UTME Screening Guidelines & Cut-Off Marks",
    summary: "Official guidelines, department cut-off marks, fees (₦2,000 screening + ₦3,000 portal access), Direct Entry requirements, and faculty programs for Federal University of Technology and Environmental Sciences, Iyin-Ekiti (FUTES-IYIN) 2026/2027 admission exercise.",
    steps: [
      "Visit the FUTES-IYIN Admission portal at https://portal.futes.edu.ng/apply",
      "Sign up with a valid email address to receive an activation token (unactivated accounts deleted after 48 hours).",
      "Complete biodata and fill out application forms meticulously.",
      "Pay Post-UTME Screening Fee (₦2,000) and Portal Access Fee (₦3,000) through REMITA platform.",
      "Upload passport photograph (max 100KB) and O'Level results (minimum 5 credits in relevant subjects including English and Mathematics at not more than 2 sittings)."
    ],
    requirements: [
      "Minimum JAMB cut-off mark: 160 (Some programmes require 180, e.g. Biochemistry, Microbiology, Science Lab Tech, Civil & Environmental Engineering, Computer Engineering, Electrical & Electronics Eng, Mechanical Eng, Mechatronics Eng, Architecture, Software Engineering, Computer Science, Cyber Security).",
      "5 O'Level credit passes in relevant subjects including English Language and Mathematics.",
      "Direct Entry candidates: National Diploma not below Upper Credit or A'Level passes in 3 relevant subjects."
    ],
    eligibility_rules: [
      "Candidates must have attained minimum age of 16 years by September 30, 2026.",
      "Candidates who wish to change institution to FUTES-IYIN must apply via JAMB website and select 'OTHER' Choice option on portal.",
      "Direct Entry transcript must be forwarded to the Registrar by September 30, 2026."
    ],
    key_facts: [
      "Portal URL: https://portal.futes.edu.ng/apply",
      "Screening Fee: ₦2,000 + Portal Access Fee: ₦3,000 (Total ₦5,000 via REMITA)",
      "Support lines: 08023628913, 08067271169",
      "Email: info@futes.edu.ng",
      "Faculties: Natural and Applied Sciences, Engineering and Technology, Environmental Sciences Design and Management, Computing"
    ],
    important_notes: [
      "Passport photograph cannot be changed throughout your stay in the University once uploaded.",
      "Ensure accurate completion of registration details."
    ],
    keywords: ["futes-iyin", "federal university of technology and environmental sciences iyin-ekiti", "futes-iyin post-utme 2026", "futes-iyin cut-off mark", "portal.futes.edu.ng"],
    related_topics: ["Post-UTME Release Hub", "University Cut-off Marks"],
    official_source: "https://portal.futes.edu.ng/apply",
    source_type: "Official University Portal",
    last_verified: "2026-08-19",
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
