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
    title: "Federal University of Technology, Akure (FUTA) 2024/2026 Admission Guidelines & Screening",
    summary: "Official admission guidelines and Post-UTME screening announcement for FUTA for the 2024/2026 academic session. Details eligibility (180+ UTME, 1st choice), ₦2,000 fee, mandatory Physics pass rule, and CBT screening schedule.",
    steps: [
      "Choose FUTA as your First Choice (Most Preferred) institution in your JAMB UTME application (or change via JAMB portal).",
      "Score a minimum of 180 in the 2026 UTME.",
      "Ensure O'Level results (WAEC, NECO, GCE) with at least five (5) credit passes including English Language and Mathematics at not more than two (2) sittings are uploaded on JAMB CAPS.",
      "Verify that you possess at least a pass in Physics (mandatory prerequisite to qualify for admission into ANY programme in FUTA).",
      "Pay the N2,000 screening fee on the e-Transact platform at any bank and complete the online registration on www.futa.edu.ng.",
      "Attend the Computer-Based Post-UTME screening at the FUTA Digital Resource Centre, Obanla Campus according to your School's schedule.",
      "Monitor departmental aggregate ranking and accept admission offer on JAMB CAPS."
    ],
    requirements: [
      "Minimum JAMB UTME score of 180",
      "Minimum five (5) O'Level credit passes in relevant subjects including English Language and Mathematics in not more than 2 sittings",
      "At least a pass in Physics (compulsory for all FUTA courses)",
      "Uploaded O'Level results on JAMB CAPS (FUTA will NOT consider candidates with Awaiting Results)",
      "Printed FUTA Post-UTME Online Registration Form and e-Transact bank payment receipt",
      "One passport photograph and JAMB UTME Result Slip"
    ],
    eligibility_rules: [
      "Candidate must have chosen FUTA as First Choice institution (or processed a change of institution on JAMB portal).",
      "Candidate must be at least 16 years of age.",
      "Candidates with Awaiting Results (AR) are NOT eligible.",
      "Financial Management Technology is NOT offered in FUTA (candidates who selected it must change course/institution).",
      "No cell phones, iPads, wristwatches, or extraneous electronic gadgets allowed in the CBT screening hall."
    ],
    key_facts: [
      "FUTA uses a point-based aggregate system combining UTME (75%) and O'Level grades (25%).",
      "CBT screening holds at the FUTA Digital Resource Centre, Obanla Campus.",
      "Screening schedule: Day 1 (SAAT, SET, SEMS, SHHT), Day 2 (SEET), Day 3 (SOC, SOS), Day 4 (Mop-Up / Direct Entry)."
    ],
    important_notes: [
      "Screening fee is ₦2,000 payable on e-Transact only.",
      "Candidates who fail to participate in the screening exercise will not be considered for admission."
    ],
    keywords: ["futa", "federal university of technology akure", "futa admission", "futa cutoff", "futa screening", "75:25 system", "futa post utme 2026"],
    related_topics: ["FUTA Departmental Cutoffs", "FUTA Post-UTME Screening", "FUTA Clearances", "JAMB CAPS"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-20",
    version: "2024/2026"
  },
  {
    id: "futa_departmental_cutoffs_2026",
    organization: "FUTA",
    page_type: "policy",
    category: "Institution Cutoffs",
    subcategory: "Official Departmental Cut-Off Marks",
    title: "FUTA Official Departmental Aggregate Cut-Off Marks (2024/2026 Session)",
    summary: "Complete approved departmental aggregate cut-off marks for admission into all undergraduate degree programmes at the Federal University of Technology, Akure (FUTA) for the 2024/2026 academic session.",
    steps: [],
    requirements: [
      "Score minimum 180 in UTME",
      "Meet or exceed the departmental aggregate score for your chosen course",
      "5 O'Level credits including English and Maths in max 2 sittings",
      "Pass in Physics"
    ],
    eligibility_rules: [
      "Candidates must meet the specific aggregate benchmark for their department.",
      "Admission is ranked strictly by aggregate score under merit and quotas."
    ],
    key_facts: [
      "SEET (Engineering): Electrical & Electronics (74.37), Mechanical (73.75), Civil & Environmental (71.87), Computer Eng (69.62), Agric & Environmental (55.12), Metallurgical & Materials (54.87), Mining (54.75), ICT (49.75), Industrial & Production (47.5).",
      "SOC (Computing): Computer Science (69.0), Cyber Security (63.75), Software Engineering (63.75), Information Technology (63.75), Information Systems (63.75).",
      "SET (Environmental): Architecture (72.87), Surveying & Geoinformatics (64.25), Quantity Surveying (57.0), Building (56.62), Industrial Design (53.25), Urban & Regional Planning (52.87), Estate Management (47.5).",
      "SOS (Sciences): Biochemistry (63.37), Microbiology (63.0), Industrial Mathematics (59.0), Biotechnology (47.5), Biology (47.5), Chemistry (47.5), Physics (47.5), Statistics (47.5).",
      "SHHT & SBMS (Health / Medical): Medicine & Surgery (62.0), Pharmacy (60.0), Nursing Science (60.0), Human Anatomy (59.5), Human Physiology (57.25), Medical Laboratory Science (47.5), Biomedical Technology (47.5).",
      "SAAT (Agriculture): Food Science & Tech (58.12), Forestry & Wood Tech (57.5), Animal Production & Health (55.37), Agric Extension (47.5), Agric Economics (47.5), Crop/Soil/Pest (47.5), Ecotourism (47.5), Fisheries (47.5).",
      "SEMS (Earth Sciences): Applied Geophysics (47.5), Applied Geology (47.5), Marine Science & Tech (47.5), Meteorology (47.5), Remote Sensing & GIS (47.5)."
    ],
    important_notes: [
      "Aggregate is calculated on a 100% scale using FUTA's approved 75:25 formula.",
      "Departmental cut-off marks are binding for 2024/2026 admission recommendations on JAMB CAPS."
    ],
    keywords: ["futa departmental cutoffs", "futa course cut off", "futa aggregate 2026", "futa eee cutoff", "futa csc cutoff", "futa medicine cutoff", "futa architecture cutoff"],
    related_topics: ["FUTA Admission Guidelines", "FUTA Post-UTME Screening"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-20",
    version: "2024/2026"
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
    version: "2024/2026"
  },
  {
    id: "futa_clearance_and_registration",
    organization: "FUTA",
    page_type: "procedural",
    category: "Registration",
    subcategory: "Fresh Students Clearance",
    title: "FUTA Fresh Students Physical & Online Clearance Procedures",
    summary: "Step-by-step clearance and documentation guide for candidates offered provisional admission into FUTA for the 2024/2026 academic session.",
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
    version: "2024/2026"
  },
  {
    id: "futa_schools_and_faculties",
    organization: "FUTA",
    page_type: "informational",
    category: "Academics",
    subcategory: "Schools, Colleges and Academic Structure",
    title: "FUTA Schools, Colleges, Academic Departments & Specialized Centres",
    summary: "Complete overview of the 13+ academic schools, College of Health Sciences, specialized research centres, and departments at the Federal University of Technology, Akure (FUTA).",
    steps: [],
    requirements: [],
    eligibility_rules: [],
    key_facts: [
      "College of Health Sciences (CHS): Comprising School of Basic Medical Sciences (SBMS), School of Basic Clinical Sciences (SBCS), and School of Clinical Sciences (SCS) — Medicine and Surgery, Nursing Science, Human Anatomy, Physiology, Biomedical Technology.",
      "School of Computing (SOC): Computer Science, Cyber Security, Software Engineering, Information Technology, Information Systems.",
      "School of Electrical Systems Engineering (SESE): Electrical & Electronics Engineering, Computer Engineering, Information & Communication Technology.",
      "School of Infrastructure, Minerals & Manufacturing Engineering (SIMME): Civil & Environmental Engineering, Mechanical Engineering, Metallurgical & Materials Engineering, Mining Engineering, Industrial & Production Engineering.",
      "School of Earth and Mineral Sciences (SEMS): Applied Geology, Applied Geophysics, Marine Science & Technology, Meteorology, Remote Sensing & GIS.",
      "School of Physical Sciences (SPS): Industrial Mathematics, Physics, Chemistry, Statistics.",
      "School of Life Sciences (SLS): Biochemistry, Biology, Biotechnology, Microbiology.",
      "School of Environmental Technology (SET): Building, Estate Management, Industrial Design, Quantity Surveying, Surveying & Geoinformatics, Urban & Regional Planning.",
      "School of Agriculture and Agricultural Technology (SAAT): Agricultural Extension & Communication, Animal Production & Health, Agricultural & Resource Economics, Crop, Soil & Pest Management, Ecotourism & Wildlife, Fisheries & Aquaculture, Food Science & Technology, Forestry & Wood Technology.",
      "School of Logistics and Innovation Technology (SLIT): Logistics and Transport Management, Innovation and Technology Management.",
      "School of Postgraduate Studies (SPGS): Postgraduate Diplomas, Masters (M.Sc./M.Tech), and Ph.D. degrees across disciplines.",
      "Newly Established Schools: School of Architecture, School of Science and Technology Education.",
      "Specialized Centres: Computer Resource Centre (CRC), University Advancement Centre (UAC), Centre for Career Services (CCS), International Strategy Office, Centre for Gender Issues in Science & Technology (CEGIST), Centre for Entrepreneurship (CENT), Open and Distance Learning (ODL), Sports Centre, Centre for Renewable Energy Technology (CRET), WASCAL (West African Science Service Center on Climate Change), Technology Park and Incubation Centre, Global Software Hub."
    ],
    important_notes: [
      "All FUTA degree programs are fully accredited by the National Universities Commission (NUC) and respective regulatory bodies including COREN, MDCN, NMCN, ARCON, QSRBN, TOPREC, CORBON, and CPN.",
      "Established in 1981, FUTA is one of Nigeria's premier top-ranking universities of technology with over 50 academic departments."
    ],
    keywords: [
      "futa schools", "futa courses", "soc futa", "sems futa", "chs futa", "sese futa", "simme futa",
      "saat futa", "slit futa", "sps futa", "sls futa", "set futa", "futa engineering", "futa computer science",
      "futa medicine", "futa architecture", "futa centres", "cret futa", "wascal futa", "crc futa"
    ],
    related_topics: ["FUTA Admission Guidelines", "Master Courses", "FUTA Institutional Profile"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-09-04",
    version: "2025/2026"
  },
  {
    id: "futa_institutional_profile_and_governance",
    organization: "FUTA",
    page_type: "informational",
    category: "Institution Profile",
    subcategory: "Governance, Statistics & Institutional Data",
    title: "Federal University of Technology, Akure (FUTA) - Institutional Profile, Governance & Official Data",
    summary: "Official institutional data, governance leadership, vision, mission, core values (ICARE), budget allocations, student population demographics, support hotlines, and research breakthroughs for the Federal University of Technology, Akure (FUTA).",
    steps: [],
    requirements: [
      "Institution: Federal University of Technology, Akure (FUTA)",
      "Established: 1981",
      "Location: P.M.B. 704, Akure, Ondo State, Nigeria",
      "Motto: Technology for Self-Reliance"
    ],
    eligibility_rules: [],
    key_facts: [
      "Governance Leadership: Pro-Chancellor & Chairman of Governing Council is Dr. Olugbenga A. Awe (appointed by the Federal Government). Executive administration includes Vice Chancellor's Office, DVC Academic, DVC Development, Registry, and Bursary.",
      "Vision: To be a world class University of Technology and a centre of excellence in training, research and service delivery.",
      "Mission: To promote technological advancement by providing conducive environment for research, teaching and learning engenders development of products that are technologically oriented, self-reliant and relevant to society.",
      "Core Values (ICARE): Integrity, Creativity, Accountability, Respect, and Excellence.",
      "Annual Personnel Allocation: ₦10,904,666,153.00",
      "Annual Overhead Allocation: ₦451,589,534.00",
      "Annual Capital Allocation: ₦1,039,371,080.00",
      "Current TETFund Allocation: ₦2,560,562,362.66",
      "Student Population Statistics: Total Population of 31,078 students (Undergraduate Total: 20,099 [14,622 Male, 5,477 Female]; Postgraduate Population: 10,979).",
      "Research Breakthroughs & Honors: Development of unique low-cost medical ventilator by FUTA researchers, Alumnus international research awards in China, Cardiff Metropolitan University AI & Women in Tech collaboration, Tech-Them Young Next-Gen Techies Initiative at FUTA Techhub.",
      "Official Academic Journals: FJRS, ATA, JOST, FJMT, JEET, JEAR, JOVICOD, FJLS.",
      "Official Student Portals: Undergraduate Portal (UG), Postgraduate Portal (PG), Open & Distance Learning (ODL), Centre for Continuing Education (CCE), School of Professional Development (SPD), E-Transcript Portal.",
      "Official Support Hotlines: +234 906 670 7545, +234 907 616 5061 (Powered by Computer Resource Centre FUTA)."
    ],
    important_notes: [
      "Address: The Federal University of Technology Akure, P.M.B. 704, Akure, Ondo State.",
      "Official Website: https://www.futa.edu.ng",
      "Strategic Plan: FUTA Strategic Plan 2024 - 2030."
    ],
    keywords: [
      "futa", "futa profile", "futa pro chancellor", "olugbenga awe", "futa vc", "futa governing council",
      "futa student population", "futa budget", "futa tetfund", "futa mission", "futa vision",
      "futa icare", "futa support line", "futa phone number", "futa address", "futa contact",
      "futa portal", "futa cce", "futa odl", "futa journals", "futa research ventilator", "futa akure"
    ],
    related_topics: ["FUTA Schools, Faculties and Academic Structure", "FUTA Departmental Cutoffs", "FUTA Admission Guidelines"],
    official_source: "https://www.futa.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-09-04",
    version: "2025/2026"
  },
  {
    id: "lautech_post_utme_screening_2025_2026",
    organization: "LAUTECH",
    page_type: "procedural",
    category: "Institution Admission",
    subcategory: "LAUTECH Admissions",
    title: "Ladoke Akintola University of Technology (LAUTECH) Post-UTME Screening & Direct Entry Notice",
    summary: "Official admission notice for Ladoke Akintola University of Technology (LAUTECH), Ogbomoso for the 2024/2026 academic session. Details eligibility criteria (170+ UTME, 1st choice, age 16+), application portal, 80:20 scoring ratio, fees, and Direct Entry interview schedule.",
    steps: [
      "Choose LAUTECH as your first-choice institution in the UTME or Direct Entry (DE) application.",
      "Score a minimum of 170 in the UTME (check specific departmental cut-offs for competitive courses like Medicine: 280, Nursing: 260, MLS: 240, Computer Science: 230).",
      "Upload O'Level results to JAMB CAPS before the stipulated deadline (20th August). Candidates with awaiting results may register but must upload results to CAPS before the deadline.",
      "Ensure you are at least 16 years old by 30th September.",
      "Visit the official university admission portal: https://apply.lautech.edu.ng.",
      "Pay non-refundable registration fee of ₦2,000.00 and portal access fee of ₦3,000.00 (Total: ₦5,000.00) using an Interswitch-enabled debit card.",
      "Carefully fill and submit the online application form with a clear passport photograph on white background in JPEG format (max 20KB).",
      "Direct Entry candidates must forward transcripts to The Registrar at least 1 week before screening and attend the Oral and Written Interview on 25th-26th August at The Hall, LAUTECH Campus, Ogbomoso.",
      "Monitor admission recommendation and accept offer on JAMB CAPS within 3 weeks of uploading."
    ],
    requirements: [
      "Minimum UTME score of 170 (higher for professional programmes)",
      "Five (5) O'Level credit passes in relevant subjects at not more than two (2) sittings in WAEC, NECO, or NABTEB",
      "Strict Requirement for Medicine, Nursing, and Medical Laboratory Science: 5 relevant credit passes at ONE SITTING ONLY",
      "Uploaded O'Level results on JAMB CAPS",
      "Digital passport photograph on white background in JPEG format (maximum 20KB)",
      "Direct Entry: University Degree (min 2:2), Upper Credit ND, RNS, NCE (min Merit), Lower Credit HND, or JUPEB with 5 O'Level credits"
    ],
    eligibility_rules: [
      "Candidate must have chosen LAUTECH as First Choice institution.",
      "Candidate must be at least 16 years of age by 30th September.",
      "Any inconsistency in names, state of origin, or age on documents may result in disqualification.",
      "Admission offered on JAMB CAPS not accepted within 3 weeks will be forfeited/withdrawn.",
      "Direct Entry candidates must attend the physical oral and written interview at The Hall, LAUTECH Ogbomoso."
    ],
    key_facts: [
      "LAUTECH aggregate scoring formula is 80% UTME score and 20% O'Level grades (80:20 formula).",
      "Application portal: https://apply.lautech.edu.ng",
      "Application fees: ₦2,000 registration fee + ₦3,000 portal access fee = ₦5,000 total.",
      "Enquiries: registrar@lautech.edu.ng, admissions@lautech.edu.ng"
    ],
    important_notes: [
      "Beware of fraudsters; LAUTECH admissions are strictly merit and credential-based via apply.lautech.edu.ng and JAMB CAPS.",
      "Candidates who provide false information will have their admission withdrawn and may be prosecuted."
    ],
    keywords: ["lautech", "ladoke akintola university of technology", "lautech post utme", "lautech screening", "lautech cutoff", "ogbomoso", "80:20 formula", "lautech de interview"],
    related_topics: ["LAUTECH Departmental Cutoffs", "LAUTECH 80:20 Aggregate System", "JAMB CAPS"],
    official_source: "https://apply.lautech.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-20",
    version: "2024/2026"
  },
  {
    id: "lautech_departmental_cutoffs_2025_2026",
    organization: "LAUTECH",
    page_type: "policy",
    category: "Institution Cutoffs",
    subcategory: "Official Departmental Cut-Off Marks",
    title: "LAUTECH Official Departmental Programme Cut-Off Marks (57 Programmes)",
    summary: "Complete approved UTME cut-off marks, O'Level credit requirements, and UTME subject combinations for all 57 undergraduate degree programmes at Ladoke Akintola University of Technology (LAUTECH), Ogbomoso.",
    steps: [],
    requirements: [
      "Minimum UTME general score of 170",
      "Meet or exceed specific course UTME cut-off mark",
      "5 relevant O'Level credits (Medicine, Nursing, MLS require one sitting only)"
    ],
    eligibility_rules: [
      "Candidates must meet the specific UTME cut-off mark and subject combination for their chosen programme.",
      "Admission is ranked strictly by 80% UTME + 20% O'Level aggregate."
    ],
    key_facts: [
      "Health / Clinical Sciences: Medicine (280, 1 sitting), Nursing (260, 1 sitting), Medical Laboratory Science (240, 1 sitting), Nutrition and Dietetics (220), Physiology (200), Anatomy (180).",
      "Engineering & Tech: Civil Eng (220), Electronic & Electrical Eng (220), Mechanical Eng (220), Computer Eng (200), Chemical Eng (180), Agricultural Eng (170), Food Eng (170).",
      "Computing & Informatics: Computer Science (230), Cyber Security Science (210), Information System (200).",
      "Environmental Sciences: Architecture (220), Surveying & Geoinformatics (200), Building (170), Estate Management (170), Urban and Regional Planning (170).",
      "Pure & Applied Sciences: Biochemistry (210), Science Laboratory Technology (200), Pure & Applied Biology (180), Earth Science (170), Pure & Applied Chemistry (170), Pure & Applied Maths (170), Pure & Applied Physics (170), Statistics (170).",
      "Management & Social Sciences: Accounting (200), Mass Communication (220), Business Administration (180), Economics (180), Marketing (180), Political Science (180), Sociology (180), Hospitality & Tourism (180), Psychology (170), Transport Management (170).",
      "Arts & Humanities: English & Literary Studies (200), Theatre Arts (190), Fine & Applied Arts (170), History (170), Library & Info Science (170), Linguistics (170), Philosophy (170).",
      "Agricultural Sciences: Food Science (200), Consumer & Home Economics (180), Agricultural Economics (170), Agric Extension (170), Animal Nutrition (170), Animal Production (170), Crop & Environmental (170), Crop Production (170), Fisheries & Aquaculture (170), Forest Resources (170), Wildlife & Ecotourism (170)."
    ],
    important_notes: [
      "Medicine, Nursing, and Medical Laboratory Science strictly mandate 5 credit passes at ONE SITTING ONLY.",
      "Candidates with Awaiting Results must upload on JAMB CAPS before 20th August."
    ],
    keywords: ["lautech cut off marks", "lautech medicine cutoff", "lautech nursing cutoff", "lautech computer science cutoff", "lautech engineering cutoff", "lautech departmental cutoffs"],
    related_topics: ["LAUTECH Post-UTME Screening", "LAUTECH 80:20 Scoring System"],
    official_source: "https://apply.lautech.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-20",
    version: "2024/2026"
  },
  {
    id: "lautech_80_20_scoring_system",
    organization: "LAUTECH",
    page_type: "procedural",
    category: "Institution Screening",
    subcategory: "Aggregate Calculation Formula",
    title: "LAUTECH 80:20 Aggregate Scoring Formula & Computation Guide",
    summary: "Comprehensive guide to how LAUTECH calculates its aggregate admission score based on 80% UTME score and 20% O'Level grades.",
    steps: [
      "Step 1 (UTME 80% Component): Divide your UTME score by 400 and multiply by 80. Formula: (UTME Score / 400) * 80.",
      "Step 2 (O'Level 20% Component): Calculate points from your 5 core relevant O'Level subjects. Grades are assigned points (A1=8, B2=7, B3=6, C4=5, C5=4, C6=3; or 100% grade scale converted to 20%). Formula: (Total O'Level Points / Maximum Points) * 20.",
      "Step 3 (Final Aggregate): Sum the UTME component + O'Level component for your composite aggregate score out of 100%."
    ],
    requirements: [
      "JAMB UTME Result Slip with minimum 170 overall score",
      "5 relevant O'Level credit passes (uploaded on JAMB CAPS)"
    ],
    eligibility_rules: [
      "Medicine, Nursing, and MLS strictly evaluate O'Level results from one sitting only.",
      "Minimum UTME score varies by programme (up to 280 for Medicine)."
    ],
    key_facts: [
      "80% of aggregate comes from UTME score, making JAMB performance heavily decisive in LAUTECH admissions.",
      "20% of aggregate is awarded based on O'Level grade quality in 5 compulsory subjects."
    ],
    important_notes: [
      "Ensure all 5 required subjects are verified and match the exact programme specifications."
    ],
    keywords: ["lautech aggregate formula", "80:20 scoring system", "lautech screening points", "lautech calculation"],
    related_topics: ["LAUTECH Post-UTME Screening", "LAUTECH Departmental Cutoffs"],
    official_source: "https://apply.lautech.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-20",
    version: "2024/2026"
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
    title: "Disclosure & Condonement of Irregularly/Illegally Admitted Candidates (2024/25 & 2025/27 Intakes)",
    summary: "Official ministerial approval granted by the Honourable Minister of Education for condonement of candidates illegally admitted into Colleges of Education without JAMB for 2025/2025 and 2024/2026 academic sessions (Ref: JAMB/ADMS/DO/208/V.I).",
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
      "Applies strictly to 2025/2025 and 2024/2026 academic intakes. Does NOT apply to 2026 intakes.",
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
    title: "2024/2026 NCE & ND Non-Technology Agric Registration Guidelines",
    summary: "Official JAMB Registrar Advisory governing NCE mode registration, ND Non-Technology Agric Related Programmes, and complete abolition of 100/200 Level degree admissions in Colleges of Education starting 2024/2026 session.",
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
      "NO 100 or 200 Level degree admissions allowed in any College of Education from 2024/2026 session — ALL entrants must be through NCE.",
      "NO admissions into affiliated degree programmes in any College of Education from 2024/2026 session.",
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
    version: "2024/2026"
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
      "Candidate must attain at least 16 years of age by 31st December 2024 (or 31st August 2025 for institutions whose 2025/2025 session extends through July 2025).",
      "Full compliance with institution departmental and screening criteria."
    ],
    eligibility_rules: [
      "Sacrosanct baseline: Candidate cannot be admitted below 16 years of age.",
      "Institutions whose 2025/2025 admission cycle extends through July 2025 are allowed to admit candidates who turn 16 by August 31, 2025.",
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
    version: "2025/2025"
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
    id: "abu_zaria_academic_programmes_list",
    organization: "Ahmadu Bello University (ABU), Zaria",
    page_type: "policy",
    category: "Institution Rules",
    subcategory: "Programmes",
    title: "Ahmadu Bello University (ABU) Full List of Academic Programmes",
    summary: "Complete official directory of all 989 academic programmes offered by Ahmadu Bello University (ABU) across all faculties, including Doctorate, M.Phil, Academic Masters, Professional Masters, Postgraduate Diploma, and Undergraduate degrees.",
    requirements: [
      "Varies by programme. Candidates must verify specific requirements via the ABU portal."
    ],
    eligibility_rules: [
      "Total Programmes: 989",
      "Doctorate (Ph.D): 224 programmes",
      "Master of Philosophy (M.Phil): 129 programmes",
      "Academic Masters: 257 programmes",
      "Professional Masters: 42 programmes",
      "Postgraduate Diploma: 89 programmes",
      "Undergraduate: 114 programmes",
      "Others (e.g. Advanced Diploma): 134 programmes"
    ],
    key_facts: [
      "Total Active Programmes: 989",
      "Portal URL: https://programmes.abu.edu.ng/programmes_list.php",
      "Faculties include: Agriculture, Arts, Basic Clinical Sciences, Education, Engineering, Law, Medicine, Social Sciences, Veterinary Medicine, etc."
    ],
    keywords: ["abu zaria programmes", "ahmadu bello university courses", "abu postgraduate", "abu undergraduate", "programmes.abu.edu.ng"],
    related_topics: ["University Cut-off Marks", "Post-UTME Release Hub"],
    official_source: "https://programmes.abu.edu.ng/programmes_list.php",
    source_type: "Official University Directory",
    last_verified: "2026-08-27",
    version: "2026"
  },
  {
    id: "unilag_statistics_overview",
    organization: "University of Lagos (UNILAG)",
    page_type: "informational",
    category: "Institutional Data",
    subcategory: "Statistics",
    title: "University of Lagos (UNILAG) 2024 Financial & Student Statistics",
    summary: "Overview of UNILAG 2024 financial performance (Personnel, Overhead, Capital, Endowment, TETFund) and student registration statistics for 2023/2024 and 2025/2025 sessions.",
    requirements: [],
    eligibility_rules: [
      "2023/2024 Total Registered Students: 33,779",
      "2025/2025 Total Registered Students: 35,068"
    ],
    key_facts: [
      "2024 Personnel Costs: ₦17,605,648,287.00",
      "2024 Overhead Costs: ₦276,488,015.00",
      "2024 Capital Expenditure: ₦1,474,320,707.00",
      "2024 Endowment Fund: ₦4,438,093,099.08",
      "2024 TETFund Allocation: ₦1,656,944,930.00"
    ],
    keywords: ["unilag statistics", "unilag financial overview 2024", "unilag student population", "university of lagos data"],
    related_topics: ["University Cut-off Marks"],
    official_source: "https://unilag.edu.ng/unilag-statistics/",
    source_type: "Official University Website",
    last_verified: "2026-08-27",
    version: "2024"
  },
  {
    id: "unilag_student_portal_hub",
    organization: "University of Lagos (UNILAG)",
    page_type: "informational",
    category: "Institution Portals",
    subcategory: "Student Resources",
    title: "UNILAG Student Portal Hub & Essential Academic Resources",
    summary: "Centralized access portal for UNILAG students including student portal login, LMS (LagOnline), Library services, student records, NELFUND application, and official academic timetables/calendars.",
    requirements: [],
    eligibility_rules: [],
    key_facts: [
      "Student Portal Login: http://studentportal.unilag.edu.ng/",
      "Learning Management System (LagOnline): https://vlearn.unilag.edu.ng/",
      "Library Access: https://library.unilag.edu.ng/",
      "Records Portal: https://records.unilag.edu.ng/",
      "NELFUND Student Loan: https://portal.nelf.gov.ng/auth/login"
    ],
    important_notes: [
      "The student portal is the primary hub for course registration, exam timetable access, and academic profile management.",
      "Check the portal regularly for updated academic calendars and exam schedules."
    ],
    keywords: ["unilag student portal", "lagonline", "unilag lms", "unilag library", "unilag records", "unilag student login"],
    related_topics: ["University of Lagos (UNILAG) 2024 Financial & Student Statistics", "University Cut-off Marks"],
    official_source: "https://unilag.edu.ng/student-portal/",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-27",
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
    title: "FUOYE 2024/2026 UPASE Screening Official Step-by-Step Application Guide",
    summary: "Complete official candidate guide for the Federal University Oye-Ekiti (FOUYE) 2024/2026 University Pre-Admission Screening Exercise (UPASE), covering portal login, personal detail updates, requirement checks, Remita fee payment (₦2,000 screening + ₦2,500 COP), document uploads, and clearance statuses.",
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
      "Department of Law: FUOYE will NOT admit candidates into the Department of Law for the 2024/2026 academic session. Candidates must change to other available programmes.",
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
    title: "FUTES-IYIN 2024/2026 Post-UTME Screening Guidelines & Cut-Off Marks",
    summary: "Official guidelines, department cut-off marks, fees (₦2,000 screening + ₦3,000 portal access), Direct Entry requirements, and faculty programs for Federal University of Technology and Environmental Sciences, Iyin-Ekiti (FUTES-IYIN) 2024/2026 admission exercise.",
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
  },
  {
    id: "oau_student_portal_guide",
    organization: "Obafemi Awolowo University (OAU)",
    page_type: "procedural",
    category: "Institution Portals",
    subcategory: "Course Registration",
    title: "OAU Student Portal Login & Course Registration Guide",
    summary: "Step-by-step guide for OAU students on portal login, changing passwords, accessing the student dashboard, and submitting course registration forms.",
    steps: [
      "1. Login to the Portal: Enter your Matriculation Number as both Username and Password, then click Login.",
      "2. Change Your Password: Create a new password meeting criteria (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).",
      "3. Access Your Dashboard: Redirected to dashboard after password change.",
      "4. Navigate to Course Registration: Click 'Course Registration' under Quick Actions or via side menu 'Course Management'.",
      "5. Add Courses: Click 'Add' button. Note: School fees must be paid to access this page.",
      "6. Submit Courses: Scroll to bottom, click 'Submit Added Courses Form', and wait for approval."
    ],
    keywords: ["oau portal", "oau registration", "student portal", "course registration", "eportal"],
    official_source: "https://eportal2.oauife.edu.ng/",
    source_type: "Official Institution Guide",
    last_verified: "2026-08-28",
    version: "2026"
  },
  {
    id: "yabatech_admissions_2026_2027",
    organization: "Yaba College of Technology (YABATECH)",
    page_type: "informational",
    category: "Institution Admission",
    subcategory: "Yabatech Admissions",
    title: "Yaba College of Technology (YABATECH) Admissions 2024/2026",
    summary: "Admission information for Yaba College of Technology (YABATECH) 2024/2026 Academic Session, covering ND (PT/ODFeL), PGD, and HND (FT/PT/ODFeL) programmes.",
    requirements: [
      "ND: Minimum age 16 years as at October 31st, 2026.",
      "HND: ND in same discipline with minimum LOWER CREDIT from an NBTE accredited institution.",
      "HND: One year post-ND Industrial Attachment work experience.",
      "SSCE entry requirements as per JAMB Brochure."
    ],
    key_facts: [
      "Application fee: ₦25,000 (ND and HND).",
      "Application deadline: Six (6) weeks from date of publication.",
      "Help line: +234 703 743 1055.",
      "Application email: admissions@yabatech.edu.ng."
    ],
    keywords: ["yabatech", "yaba college of technology", "yabatech admission 2026", "nd programmes", "hnd programmes", "pgd admission"],
    official_source: "https://www.yabatech.edu.ng",
    source_type: "Official Institution Portal",
    last_verified: "2026-08-28",
    version: "2024/2026"
  },
  {
    id: "jamb_caps_statistics_august_2026",
    organization: "JAMB",
    page_type: "informational",
    category: "Admissions",
    subcategory: "CAPS Statistics",
    title: "JAMB CAPS Admission Statistics (As of August 28, 2026)",
    summary: "Comprehensive JAMB CAPS admission statistics for the 2024/2026 academic year, including candidate qualification metrics, O'Level statistics, new arrival processing data, and overall admission summaries as of August 28, 2026.",
    requirements: [],
    eligibility_rules: [],
    key_facts: [
      "Admission Year: 2024/2026",
      "As of: Friday, August 28, 2026",
      "Total Institutions: 1,800",
      "Total Candidates: 2,275,690",
      "Qualified for Admission (140+): 2,047,984",
      "Admissions Summary (Total Processed): 143,752 (Approved+Accepted+Recommended+Desk Officer)",
      "Approved for Candidates Acceptance: 36,973",
      "Accepted Admissions: 63,758"
    ],
    important_notes: [
      "Data represents cumulative figures for the 2024/2026 admission exercise."
    ],
    keywords: ["jamb caps", "caps statistics 2026", "admission statistics 2024/2026", "jamb 2026 admissions"],
    related_topics: ["JAMB CAPS", "Admission Status"],
    official_source: "https://caps.jamb.gov.ng/dashboard.aspx",
    source_type: "Official Government Dashboard",
    last_verified: "2026-08-28",
    version: "2024/2026"
  },
  {
    id: "kwasu_hostel_balloting_fees_schedule",
    organization: "Kwara State University (KWASU)",
    page_type: "policy",
    category: "Accommodation",
    subcategory: "Hostel Balloting & Fees",
    title: "KWASU Student Hostel Balloting & Accommodation Fees Schedule",
    summary: "Official schedule of hostel accommodation and balloting fees for Kwara State University (KWASU) Malete, detailing fees per block across affiliated and managed student hostels including Omowumi, Mopelola, Ejanla, Croyant, Ajeem, Agit, and Amina Castle.",
    steps: [
      "Log in to the official KWASU student portal during the balloting window.",
      "Navigate to the Accommodation / Hostel Balloting module.",
      "Select your preferred hostel and block from the available listed options (e.g. Croyant, Ajeem, Amina Castle, Mopelola, Omowumi, Ejanla, Agit).",
      "Generate the accommodation payment invoice corresponding to the chosen hostel (fees range from ₦95,000 to ₦115,000 depending on hostel and block).",
      "Complete payment via the accredited online payment gateway or bank channel before the reservation deadline to secure bed allocation."
    ],
    requirements: [
      "Active KWASU student portal account with matriculation/application number",
      "Completed school fees or acceptance fee payment (for freshers)",
      "Prompt fee payment upon selecting a bed space during the active balloting period"
    ],
    eligibility_rules: [
      "Hostel bed space allocation operates on a first-come, first-served basis through the active balloting portal.",
      "Bed spaces are tied strictly to the balloting student and cannot be transferred or sublet."
    ],
    key_facts: [
      "Croyant Hostel (Block 1): ₦115,000 per bed space",
      "Ajeem1 Hostel (Block 1): ₦115,000 per bed space",
      "Ajeem2 Hostel (Block 1): ₦115,000 per bed space",
      "Agit1 Hostel (Block 1): ₦115,000 per bed space",
      "Omowumi Hostel (Block 2): ₦100,000 per bed space",
      "Omowumi Hostel (Block 1): ₦95,000 per bed space",
      "Mopelola Hostel (Block 1): ₦95,000 per bed space",
      "Ejanla Hostel (Block 1): ₦95,000 per bed space",
      "Amina Castle A Hostel (Block 1): ₦95,000 per bed space",
      "Amina Castle B Hostel (Block 1): ₦95,000 per bed space"
    ],
    important_notes: [
      "Balloting takes place strictly via the official KWASU portal.",
      "Hostels like Croyant, Ajeem, and Agit are priced at ₦115,000 per session, while Omowumi Block 1, Mopelola, Ejanla, and Amina Castle A & B are priced at ₦95,000 per session.",
      "Ensure prompt payment after balloting to prevent automatic revocation of the allocated room block."
    ],
    keywords: [
      "kwasu hostel", "kwasu balloting", "hostel balloting", "omowumi hostel",
      "mopelola hostel", "ejanla hostel", "croyant hostel", "ajeem1", "ajeem2", "ajeem hostel",
      "agit1", "agit hostel", "amina castle", "amina castle a", "amina castle b",
      "kwasu accommodation", "malete hostels", "kwara state university hostel fees", "kwasu fees"
    ],
    related_topics: ["Student Accommodation", "KWASU Portal", "Fresher Budgeting"],
    official_source: "https://portal.kwasu.edu.ng",
    source_type: "Official Institution Balloting Portal",
    last_verified: "2026-09-04",
    version: "2025/2026"
  },
  {
    id: "futa_agricultural_environmental_engineering_profile",
    organization: "FUTA",
    page_type: "policy",
    category: "Department Profile & Regulations",
    subcategory: "Agricultural and Environmental Engineering (AGE)",
    title: "FUTA Department of Agricultural and Environmental Engineering (B.Eng. AGE) - Programme Profile, Regulations & Degree Requirements",
    summary: "Comprehensive academic handbook and regulations for the Bachelor of Engineering (B.Eng.) in Agricultural and Environmental Engineering at the Federal University of Technology, Akure (FUTA). Details HOD leadership, COREN accreditation, admission requirements, student population, degree duration, workload limits, 5.0 CGPA computation system, degree classifications, and graduation unit thresholds.",
    steps: [
      "Admission (100L UTME or 200L Direct Entry) meeting departmental subject criteria.",
      "Semester Course Registration adhering to minimum 15 units and maximum 24 units workload.",
      "Direct Entry students audit and pass mandatory foundation courses: GNS 101, GNS 102, GNS 103, MEE 101, and MEE 102.",
      "Completion of Continuous Assessment (max 40%) and Semester Examinations (60%).",
      "Completion of SWEP (Students' Work Experience Programme - AGE 210), SIWES / Industrial Attachments, laboratory practicals, and 500-level final year design project.",
      "Attainment of minimum required credit units (196 units for UTME; 153 units for Direct Entry) with minimum CGPA of 1.00."
    ],
    requirements: [
      "UTME Entry Requirements: Minimum of 5 credit passes in O'Level (WAEC/NECO/GCE/NABTEB) at not more than two (2) sittings in English Language, Mathematics, Physics, Chemistry, and any of Biology, Agricultural Science, or Technical Drawing.",
      "UTME Subject Combination: English Language, Mathematics, Physics, and Chemistry.",
      "Direct Entry (DE) Requirements: (1) National Diploma (ND) at Upper Credit level or equivalent in Agricultural Engineering or related disciplines from recognized polytechnics/institutions; OR (2) GCE Advanced Level / IJMB passes with not less than grade 'C' in at least two of Chemistry, Physics, and Mathematics.",
      "Degree Minimum Units: 196 units for 5-year UTME candidates; 153 units for 4-year Direct Entry candidates.",
      "Minimum Cumulative Grade Point Average (CGPA): 1.00 on a 5.00 grading scale."
    ],
    eligibility_rules: [
      "Programme Duration: Normal duration is 5 academic sessions (10 semesters) for UTME students, with maximum allowable residency of 15 semesters. Normal duration is 4 academic sessions (8 semesters) for Direct Entry students, with maximum allowable residency of 12 semesters.",
      "Student Workload Limits: Minimum of 15 course units and maximum of 24 course units per semester.",
      "Direct Entry Mandatory Audit: Must audit and pass GNS 101, GNS 102, GNS 103, MEE 101, and MEE 102. If failed as audit courses, they must be registered formally as credit courses."
    ],
    key_facts: [
      "Department Leadership: Head of Department (HOD) is Prof. F. R. FALAYI (Email: age@futa.edu.ng | Phone: +234 803 394 4486).",
      "Degree Awarded: Bachelor of Engineering (B.Eng.) in Agricultural and Environmental Engineering.",
      "Professional Accreditation: Fully accredited by the Council for the Regulation of Engineering in Nigeria (COREN) and affiliated with the Nigerian Institution of Agricultural Engineers (NIAE - Division of NSE).",
      "Student Population Breakdown (475 Total): 100 Level: 81; 200 Level: 86; 300 Level: 95; 400 Level: 88; 500 Level: 125.",
      "Official 5.0 Grading System Scale: A (70-100% = 5 GP), B (60-69% = 4 GP), C (50-59% = 3 GP), D (45-49% = 2 GP), E (40-44% = 1 GP), F (0-39% = 0 GP).",
      "Degree Classification Thresholds: First Class Honours (CGPA 4.50 - 5.00), Second Class Honours Upper Division (CGPA 3.50 - 4.49), Second Class Honours Lower Division (CGPA 2.40 - 3.49), Third Class Honours (CGPA 1.50 - 2.39), Pass (CGPA 1.00 - 1.49).",
      "Semester Academic Schedule: 15 weeks reserved for teaching and lectures, followed by 2 weeks of degree examinations.",
      "Continuous Assessment & Evaluation: Continuous Assessment carries a maximum of 40%, with final semester examination carrying 60%.",
      "Departmental Professional Association: Students are active members of the Nigerian Institution of Agricultural Engineers Student Body (NIAESB).",
      "Departmental Journal: Journal of Agricultural Engineering & Technology (JAET), published annually by NIAE / NSE."
    ],
    important_notes: [
      "Definitions: TLU (Total Load Units per semester), CLU (Cumulative Load Units to date), TCP (Total Credit Points = Units × Grade Point), CCP (Cumulative Credit Points to date), GPA = TCP / TLU, CGPA = Total CCP / Total CLU.",
      "Department Sections: Technical, Administrative, and Academic, with dedicated laboratories supervised by senior technologists and academic staff in charge.",
      "Student Welfare: Each student is assigned a designated academic staff adviser for mentorship and academic counselling."
    ],
    keywords: [
      "futa age", "futa agricultural and environmental engineering", "prof falayi", "age futa",
      "futa b.eng age", "futa engineering grading system", "futa cgpa scale", "futa first class cgpa",
      "futa age admission requirements", "futa direct entry engineering", "futa swep age 210",
      "futa age graduation requirements", "futa age course outline", "futa niaesb", "jaet futa"
    ],
    related_topics: ["FUTA Courseware and Synopses", "FUTA Schools, Faculties and Academic Structure", "FUTA Departmental Cutoffs"],
    official_source: "https://www.futa.edu.ng/age",
    source_type: "Official Departmental Portal",
    last_verified: "2026-09-04",
    version: "2025/2026"
  },
  {
    id: "futa_age_curriculum_coursewares_synopses",
    organization: "FUTA",
    page_type: "informational",
    category: "Coursewares & Synopses",
    subcategory: "Agricultural and Environmental Engineering Curriculum (100L - 500L)",
    title: "FUTA B.Eng. Agricultural and Environmental Engineering - Complete Course Outline, Synopses & Coursewares (100L - 500L)",
    summary: "Detailed curriculum breakdown, credit unit weightings, course outlines, and full course synopses for all levels (100L to 500L) in the Department of Agricultural and Environmental Engineering at the Federal University of Technology, Akure (FUTA).",
    steps: [
      "100 Level (Harmattan 21 Units, Rain 20 Units): Foundational physical sciences, mathematics, engineering drawing, workshop practice, and general studies.",
      "200 Level (Harmattan 21 Units, Rain 20 Units + SWEP 4 Units): Applied mechanics, computer programming (Fortran), science of materials, fluid mechanics, strength of materials, thermodynamics, general agriculture practical plots, and SWEP.",
      "300 Level (Harmattan 21 Units, Rain 21 Units): Engineering statistics, mechanics of machines, engineering mathematics I & II, hydraulics, hydrology, machine drawing & design, farm structures, and soil mechanics.",
      "400 Level: Advanced farm power & machinery, agricultural materials handling, irrigation & drainage, thermodynamics & heat transfer, farm electrification, and SIWES industrial internship.",
      "500 Level: Advanced machinery design, land clearing & development, engineering economics, advanced hydraulics, soil & water conservation, rural water supply & sanitation, farm transportation, and final year B.Eng. research project."
    ],
    requirements: [
      "Core 100L Courses: CHE 101 (3U), CHE 103 (1U), PHY 101 (3U), PHY 103 (2U), PHY 107 (1U), MTS 101 (3U), MEE 101 (3U), GNS 101 (2U), CVE 105 (2U), GNS 103 (1U), CHE 102 (3U), CHE 104 (1U), PHY 102 (3U), PHY 108 (1U), MTS 102 (3U), MTS 104 (3U), MEE 102 (2U), GNS 102 (2U), GNS 106 (2U).",
      "Core 200L Courses: CHE 205 (2U), MTS 201 (3U), CSC 201 (3U), MEE 201 (2U), MEE 207 (3U), EEE 201 (3U), MNE 201 (1U), MME 201 (3U), CSP 201 (1U), MTS 202 (3U), CVE 202 (3U), MEE 202 (3U), MEE 206 (3U), AGE 204 (3U), PMT 210 (3U), CSP 210 (2U), AGE 210 (SWEP - 4U).",
      "Core 300L Courses: AGE 301 (2U), AGE 311 (2U), AGE 315 (2U), AGE 323 (3U), MTS 315 (3U), AGE 325 (2U), APH 201 (2U), AGY 209 (2U), MME 311 (3U), AGE 304 (3U), AGE 312 (3U), AGE 314 (3U), AGE 328 (3U), AGE 336 (3U), MTS 316 (3U).",
      "Core 400L & 500L Courses: AGE 403, AGE 405, AGE 407, AGE 409, AGE 411, AGE 413, AGE 415, AGE 417, AGE 503, AGE 504, AGE 506/552, AGE 509, AGE 511/525, AGE 512, AGE 519, AGE 522, AGE 528, AGE 531/575."
    ],
    eligibility_rules: [],
    key_facts: [
      "CSC 201 (Introduction to Computer Programming / Fortran): Covers Fortran 03 (Fortran 2003) with legacy Fortran 77/95 concepts, structure, arrays, subroutines, and scientific computation for engineering students.",
      "AGE 204 (Basic Fluid Mechanics): Fluid statics, hydrostatic forces on submerged bodies, conservation laws, fluid dynamics, and viscous flows.",
      "CVE 202 (Strength of Materials I): Force equilibrium, free body diagrams, stress and strain, Young's modulus, axially loaded bars, temperature stresses, hoop stresses in cylinders and rings, bending moment and shear force diagrams.",
      "MEE 202 (Engineering Drawing II): Orthographic, isometric, auxiliary projections, intersection of surfaces and developments, sectional views, curves of interpenetration, assembly drawings, and CAD standards.",
      "MEE 206 (Basic Engineering Thermodynamics): State of matter, zeroth, first and second laws of thermodynamics, closed and open systems, entropy, heat and work transfers, and ideal gas cycles.",
      "CSP 201 & CSP 210 (General Agriculture Theory & Practical): Practical field planting plot allocation for arable crop management, livestock production, fisheries, forestry nurseries, farm machinery, and tractor driving.",
      "MEE 207 (Applied Mechanics) & MME 201 (Science of Materials): Particle kinematics, rigid body dynamics, crystal structures, mechanical, electrical, optical, and magnetic properties of engineering materials.",
      "AGE 301 (Engineering Statistics): Descriptive statistics, probability distributions (normal, binomial), linear and multiple regression, correlation, ANOVA, and engineering statistical modeling.",
      "AGE 315 (Introduction to Environmental Engineering): Water and wastewater treatment, air pollution and noise control, solid and hazardous waste management, ecosystem protection, and environmental sample analysis.",
      "AGE 323 (Mechanics of Machines): General dynamics, mechanisms, belt, gear, and chain drives, cams and followers, balancing of rotating masses, simple harmonic motion, and vehicular brake/clutch systems.",
      "MTS 315 & MTS 316 (Engineering Mathematics I & II): ODEs, Wronskian, series solutions, Bessel, Legendre, and Hypergeometric functions, Laplace transforms, Fourier series and transforms, PDEs (heat, wave, Laplace equations), and separation of variables.",
      "AGE 304 (Theory of Farm Structures): Farm building design for plant and animal production, storage structures, pin-jointed trusses, method of joints, elastic design, and limit state structural design.",
      "AGE 312 (Basic Hydraulics) & AGE 314 (Basic Hydrology): Liquid statics and dynamics, pipe networks, pump selection, turbines (Pelton, radial, axial), Manning's and Chezy's open channel flow, hydrologic cycle, precipitation measurement, runoff estimation, evapotranspiration, and river gauging.",
      "AGE 328 (Machine Drawing and Design) & AGE 336 (Basic Soil Mechanics): Machine component design, shafts, belts, CAD drafting, soil stress distribution, bearing capacity, and soil conservation fundamentals.",
      "AGE 413 (Engineering Thermodynamics and Heat Transfer) & AGE 415 (Farm Power and Machinery): Conduction, convection, radiation, farm tractor force analysis, internal combustion engines (spark and compression ignition), primary/secondary tillage implements, and sprayers.",
      "AGE 511 / AGE 525 (Land Clearing & Development): Environmental impact assessment, land acquisition laws in Nigeria, vegetation profiles, heavy clearing equipment economics, budgeting, and soil conservation.",
      "AGE 519 (Agricultural Machinery) & AGE 552 (Design of Agricultural Machinery): Agricultural mechanization planning, planter calibration, fertilizer distributors, harvesting machinery, grain dryers, machinery replacement economics, and low-cost machine fabrication.",
      "AGE 575 (Advanced Hydraulics): Internal pipe flow turbulence, pressure drop correlations, non-uniform open channel flow, and rectangular, triangular, and trapezoidal weir discharge hydraulics."
    ],
    important_notes: [
      "Coursewares and synopses are available for digital download in PDF format on the FUTA courseware portal.",
      "All 200L students must complete SWEP (Students' Work Experience Programme - AGE 210, 4 units) during the long vacation.",
      "Direct Entry students must register for required audited courses in their 200 level first and second semesters."
    ],
    keywords: [
      "futa age courses", "futa age synopsis", "csc 201 futa", "age 204 futa", "cve 202 futa",
      "mee 202 futa", "mee 206 futa", "age 301 futa", "age 311 futa", "age 315 futa",
      "age 323 futa", "mts 315 futa", "mts 316 futa", "age 304 futa", "age 312 futa",
      "age 314 futa", "age 328 futa", "age 336 futa", "age 413 futa", "age 415 futa",
      "age 519 futa", "age 525 futa", "age 552 futa", "age 575 futa", "futa coursewares"
    ],
    related_topics: ["FUTA Department of Agricultural and Environmental Engineering", "FUTA Schools, Faculties and Academic Structure"],
    official_source: "https://www.futa.edu.ng/age/courseware",
    source_type: "Official Departmental Courseware Portal",
    last_verified: "2026-09-04",
    version: "2025/2026"
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
