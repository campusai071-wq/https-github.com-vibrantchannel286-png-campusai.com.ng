const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");

const app = initializeApp(config);
const db = getFirestore(app);

const articles = [
  {
    "id": "kb-unn-001",
    "title": "UNN (University of Nigeria, Nsukka) — Admission Overview",
    "slug": "unn-admission-overview",
    "category": "Institutions",
    "institution": "University of Nigeria, Nsukka (UNN)",
    "course": "",
    "summary": "UNN, Nigeria's first indigenous university (established 1955/1960) in Enugu State, runs a CBT Post-UTME exercise testing the same four subjects as UTME, and does not publish a single general cut-off for all courses — thresholds vary by department.",
    "content": "The University of Nigeria, Nsukka (UNN), located in Enugu State, was founded by Nnamdi Azikiwe and is recognized as Nigeria's first indigenous university (established 1955, formally inaugurated October 7, 1960). UNN's Post-UTME exercise is a genuine Computer-Based Test rather than a document-only review: each candidate is tested on the same four subjects registered for their UTME, in a 60-question exam (15 questions per subject) with a 60-minute time limit. Candidates present their online Acknowledgement Slip and JAMB Result Slip at the exam venue for accreditation, and are issued a passcode for exam login on-site. Notably, UNN does not use one general cut-off mark for every course — thresholds are set by department and are typically confirmed only after the Post-UTME screening exercise concludes, rather than being published in advance for all courses. Candidates awaiting November/December GCE or NECO results are not eligible to apply, and applicants must be at least 16 years old by September 30 of the admission year.",
    "requirements": [
      "UNN selected as first-choice institution in UTME, or Direct Entry application",
      "UTME score at or above UNN's published minimum eligibility threshold for the session",
      "Names on WAEC/NECO results must match exactly with JAMB registration details",
      "At least 16 years old by September 30 of the admission year",
      "Not currently awaiting November/December GCE or NECO results"
    ],
    "steps": [],
    "documents_required": ["Online Acknowledgement Slip", "JAMB Result Slip"],
    "important_dates": [],
    "fees": [],
    "official_sources": [],
    "related_topics": ["UNN Post-UTME/DE Screening 2026/2027", "UTME", "CAPS"],
    "keywords": ["UNN", "University of Nigeria Nsukka", "Enugu State university", "UNN admission"],
    "faq": [
      {"question": "Does UNN have one general cut-off mark for all courses?", "answer": "No. UNN sets different eligibility and departmental thresholds by course, and these are typically confirmed only after the Post-UTME screening exercise rather than published as one fixed number for all candidates in advance."},
      {"question": "Is UNN's Post-UTME a real exam or just document checking?", "answer": "It is a genuine Computer-Based Test: 60 questions covering the same four UTME subjects, with a 60-minute time limit."}
    ],
    "last_verified": "2026-07-29",
    "version": "1.0",
    "notes": "Built from multiple strongly converging secondary reports rather than a direct fetch of unn.edu.ng in this pass. The general eligibility threshold of 160 (reported consistently across 2025/2026 and 2026/2027 cycles) appears to function as UNN's minimum screening-eligibility score, distinct from the department-specific admission cut-offs referenced by SmartJamb as set only after screening."
  },
  {
    "id": "kb-unn-002",
    "title": "UNN 2026/2027 Post-UTME/DE Screening: Eligibility, Dates and Fee",
    "slug": "unn-post-utme-de-screening-2026-2027",
    "category": "Institutions",
    "institution": "University of Nigeria, Nsukka (UNN)",
    "course": "",
    "summary": "UNN's 2026/2027 Post-UTME registration ran July 15 - August 5, 2026, for candidates scoring 160+, with a ₦2,000 screening fee.",
    "content": "According to UNN's official 2026/2027 admission notice, online registration for the Post-UTME and Direct Entry screening exercise began Wednesday, July 15, 2026, and closed Wednesday, August 5, 2026. Eligible candidates were those who selected UNN as their first-choice institution in the 2026 UTME and scored 160 or above, plus qualifying Direct Entry applicants. Candidates were required to ensure the names on their WAEC/NECO results matched exactly with their JAMB registration details, and were reminded to upload O'Level results to JAMB CAPS as part of the admission consideration process. The screening fee was consistently reported at ₦2,000 across the university's recent admission cycles. UNN's registration deadlines have been extended in at least one prior cycle (2025/2026, from mid-August to early September), so candidates should monitor the university's official website for any similar extension announcements in future cycles rather than assuming the initially published deadline is final.",
    "requirements": [
      "UNN as first-choice institution, UTME score ≥ 160 (2026/2027 threshold; reconfirm each cycle)",
      "WAEC/NECO name consistency with JAMB registration",
      "O'Level results uploaded to JAMB CAPS"
    ],
    "steps": [
      "Register online for the Post-UTME/DE screening exercise via UNN's official portal within the open window",
      "Pay the ₦2,000 screening fee",
      "Ensure O'Level results are uploaded to JAMB CAPS",
      "Print the online Acknowledgement Slip",
      "Bring the Acknowledgement Slip and JAMB Result Slip to the exam venue for accreditation",
      "Sit the CBT exam (4 subjects, 60 questions, 60 minutes) using the passcode issued at the venue"
    ],
    "documents_required": ["Online Acknowledgement Slip", "JAMB Result Slip", "O'Level result uploaded to JAMB CAPS"],
    "important_dates": [
      {"event": "2026/2027 Post-UTME/DE registration window", "date": "July 15 - August 5, 2026"}
    ],
    "fees": [
      {"item": "Post-UTME/DE screening fee", "amount": "₦2,000"}
    ],
    "official_sources": [],
    "related_topics": ["UNN Admission Overview", "O'Level Upload", "CAPS", "UTME"],
    "keywords": ["UNN post UTME 2026", "UNN cut off 160", "UNN screening fee", "UNN CBT exam"],
    "faq": [
      {"question": "How much is UNN's Post-UTME screening fee?", "answer": "₦2,000, consistent with recent admission cycles."},
      {"question": "Has UNN extended its Post-UTME registration deadline before?", "answer": "Yes, in the 2025/2026 cycle the deadline was extended by about three weeks (from mid-August to early September), so candidates should keep checking the official UNN website even close to a published deadline."}
    ],
    "last_verified": "2026-07-29",
    "version": "1.0",
    "notes": "Sourced from multiple converging secondary reports (EduTimes Africa, Myschool News, CampusInfo, MySchoolGist); no direct fetch of unn.edu.ng was performed in this pass."
  },
  {
    "id": "kb-futa-006",
    "title": "FUTA New Student Online Registration (FIRARS Portal)",
    "slug": "futa-firars-registration",
    "category": "Institutions",
    "institution": "Federal University of Technology, Akure (FUTA)",
    "course": "",
    "summary": "After being offered admission, FUTA candidates confirm acceptance fee payment, create an account on the FIRARS portal, and complete an online registration and document upload before proceeding to school fees payment.",
    "content": "Newly admitted FUTA candidates complete their post-admission registration through the university's FIRARS portal. A fresh candidate with no existing account first confirms that their acceptance fee payment has been made and reflected against their UTME registration number; if unconfirmed, they use the portal's payment confirmation link. Once payment is verified, the candidate creates an account using a personal phone number and email address, since this is the channel FUTA uses for communication throughout the student's studies. After logging in, the candidate completes a registration form divided into five sections and uploads scanned (JPEG) copies of required documents. Direct Entry candidates must additionally upload their ND, NCE, or IJMB result. After a final review, the candidate submits the registration and receives a preview/report page showing a screening remark. Candidates who pass this screening proceed to pay school fees at the bank; the etranzact receipt from that payment is then used to verify school fees payment and to complete course registration on the portal.",
    "requirements": ["Confirmed acceptance fee payment against UTME registration number", "Personal (not shared) phone number and email address"],
    "steps": [
      "Confirm acceptance fee payment is reflected against your UTME registration number (or use the portal's confirm payment link if not yet reflected)",
      "Create an account on the FIRARS portal as a fresher (login credentials are sent to your phone/email)",
      "Log in and complete the five-section registration data form",
      "Upload scanned JPEG copies of required documents (see FUTA New Student Document Checklist)",
      "Review all forms carefully, then click Finalise Submission",
      "Print the preview/report page and check the screening remark",
      "If screening passed, pay school fees at the bank",
      "Use the etranzact bank receipt to verify school fees payment and complete course registration on the portal"
    ],
    "documents_required": ["Birth certificate", "Certificate of origin", "Court affidavit (optional)", "Attestation letter", "JAMB admission letter (optional; report to admission office if unavailable)", "Passport photograph", "O'Level result(s)", "ND/NCE/IJMB result (Direct Entry candidates only)"],
    "important_dates": [],
    "fees": [],
    "official_sources": ["https://firars.futa.edu.ng/app/welcome/admissions", "https://firarsapp.futa.edu.ng/apps/applications"],
    "related_topics": ["FUTA Fees", "Clearance", "Matriculation", "Acceptance Fees"],
    "keywords": ["FIRARS", "FUTA online registration", "FUTA new student portal", "FUTA fresher registration"],
    "faq": [
      {"question": "What happens if I don't have a JAMB admission letter?", "answer": "According to FUTA's registration instructions, candidates without a JAMB admission letter should report in person to the University admission office on resumption rather than attempting to upload one on the portal."},
      {"question": "How do I prove I've paid my school fees on the FIRARS portal?", "answer": "The etranzact receipt obtained from the bank after payment is used on the portal to verify school fees payment and to unlock course registration."}
    ],
    "last_verified": "2026-07-29",
    "version": "1.0"
  },
  {
    "id": "kb-futa-007",
    "title": "FUTA Admission by Transfer",
    "slug": "futa-admission-by-transfer",
    "category": "Institutions",
    "institution": "Federal University of Technology, Akure (FUTA)",
    "course": "",
    "summary": "FUTA accepts transfer candidates from other universities who meet its minimum entry qualifications, via a paid application submitted through the Academic Registry by end of July.",
    "content": "According to FUTA's official admissions policy, a candidate wishing to transfer into FUTA from another university must hold at least the minimum qualification required for entry into FUTA. Application forms for admission by transfer are obtained from the Admission Officer at FUTA's Academic Registry upon payment of an application fee. Completed transfer applications must be submitted no later than the end of July, according to the university's published policy; candidates should confirm this deadline is still current for the relevant admission cycle before relying on it.",
    "requirements": ["Minimum qualification for entry into FUTA (as required of any candidate)", "Application fee payment"],
    "steps": [
      "Obtain the transfer application form from the Admission Officer, Academic Registry, FUTA",
      "Pay the applicable application fee",
      "Complete and submit the application before the end of July",
      "Await Academic Registry's decision on the transfer request"
    ],
    "documents_required": ["Completed transfer application form", "Evidence of current university standing/qualification"],
    "important_dates": [
      {"event": "FUTA transfer application submission deadline (per official policy)", "date": "End of July (confirm current-cycle date)"}
    ],
    "fees": [
      {"item": "Transfer application fee", "amount": "Amount not published on the page reviewed; confirm with FUTA Academic Registry"}
    ],
    "official_sources": ["https://admissions.futa.edu.ng/"],
    "related_topics": ["Transfer", "Change of Institution", "Clearance"],
    "keywords": ["FUTA transfer admission", "transfer to FUTA", "FUTA Academic Registry transfer"],
    "faq": [
      {"question": "Where do I get FUTA's transfer application form?", "answer": "From the Admission Officer at FUTA's Academic Registry (P.M.B 704, Akure), upon payment of the applicable application fee."}
    ],
    "last_verified": "2026-07-29",
    "version": "1.0"
  },
  {
    "id": "kb-futa-008",
    "title": "FUTA Deferment of Admission",
    "slug": "futa-deferment-of-admission",
    "category": "Institutions",
    "institution": "Federal University of Technology, Akure (FUTA)",
    "course": "",
    "summary": "FUTA only considers deferment requests from candidates who have already fully satisfied school and departmental registration requirements and have a strong justification, submitted by mid-first-semester.",
    "content": "Per FUTA's official admissions policy, deferment of admission (postponing enrolment to a later session) is not considered unless the candidate has already fully satisfied the school's and department's requirements for registration and has a genuinely compelling reason for the deferment. Requests must be forwarded in writing to the Admission Officer no later than the middle of the first semester of the session in which admission was offered.",
    "requirements": ["Full satisfaction of school and departmental registration requirements", "Cogent/compelling reason for deferment"],
    "steps": [
      "Complete school and departmental registration requirements first",
      "Prepare a written deferment request with supporting justification",
      "Submit to the Admission Officer no later than the middle of the first semester"
    ],
    "documents_required": ["Written deferment request", "Supporting evidence for the stated reason"],
    "important_dates": [
      {"event": "FUTA deferment request deadline", "date": "Not later than the middle of the first semester of the admission session"}
    ],
    "fees": [],
    "official_sources": ["https://admissions.futa.edu.ng/"],
    "related_topics": ["Clearance", "Matriculation"],
    "keywords": ["FUTA deferment of admission", "defer FUTA admission", "postpone FUTA enrolment"],
    "faq": [
      {"question": "Can I defer my FUTA admission before registering at all?", "answer": "No. Per official policy, deferment is only considered after a candidate has already fully satisfied the school's and department's registration requirements, not as an alternative to registering."}
    ],
    "last_verified": "2026-07-29",
    "version": "1.0"
  },
  {
    "id": "kb-jamb-policy-2026",
    "title": "2026 JAMB Policy Meeting Approved Minimum Tolerable Cut-off Marks",
    "slug": "jamb-policy-meeting-minimum-cutoffs-2026",
    "category": "Policy & Eligibility",
    "institution": "JAMB / Federal Ministry of Education",
    "course": "",
    "summary": "2026 national minimum tolerable cutoff scores: Universities 150, Nursing 150, Polytechnics/COEs/IEIs 100. Minimum admission age remains 16 years.",
    "content": "The 2026 JAMB Policy Meeting approved national baseline minimum tolerable admission scores across all Nigerian tertiary institutions: Universities (150), Colleges of Nursing (150), Polytechnics, Monotechnics, Colleges of Agriculture, Colleges of Education, and Innovation Enterprise Institutions (100). The minimum admissible age remains 16 years old by December of the admission year. Furthermore, 94 candidates were placed on the solicitation watchlist, and 43 tertiary institutions with 20 or more outstanding Direct Entry clearance requests were summoned for mandatory clearance.",
    "requirements": [
      "Minimum 16 years of age by December 31 of admission year",
      "UTME score at or above baseline threshold for institution type",
      "Uploaded O'Level results on JAMB CAPS"
    ],
    "steps": [],
    "documents_required": ["JAMB UTME Result Slip", "O'Level Result uploaded to CAPS"],
    "important_dates": [],
    "fees": [],
    "official_sources": ["https://www.jamb.gov.ng/"],
    "related_topics": ["UTME Registration", "JAMB CAPS", "Direct Entry"],
    "keywords": ["2026 policy meeting", "minimum cutoff 150", "university cutoff 150", "polytechnic cutoff 100", "nursing cutoff 150", "admission age 16"],
    "faq": [
      {"question": "Can a university set a cutoff higher than 150?", "answer": "Yes. 150 is the national minimum tolerable baseline. Individual universities and competitive faculties (such as Medicine, Law, Engineering) set higher departmental cutoffs."}
    ],
    "last_verified": "2026-08-11",
    "version": "2026"
  },
  {
    "id": "kb-jamb-condonement-2026",
    "title": "Disclosure & Condonement of Illegal Admissions (2024/25 & 2025/26 Intakes)",
    "slug": "jamb-condonement-illegal-admissions-2026",
    "category": "Admissions",
    "institution": "JAMB / Colleges of Education",
    "course": "",
    "summary": "Special ministerial waiver allowing Colleges of Education and tertiary institutions to submit lists of illegally admitted candidates for 2024/25 and 2025/26 for formal condonement via JAMB Portal.",
    "content": "In accordance with Ref: JAMB/ADMS/DO/208/V.I issued June 22, 2026, the Honourable Minister of Education approved the condonement of candidates illegally admitted into Colleges of Education without JAMB for 2024/2025 and 2025/2026 academic sessions (excludes 2026). Candidates obtain an SSCE Result Verification Code from the exam body, approach a CBT/PRC/IPRC centre, pay ₦4,200 on JAMB portal (₦3,500 application + ₦700 centre charge), choose their illegal admission college as 1st choice, and get proposed/recommended by the College Provost on CAPS before June 30, 2026.",
    "requirements": [
      "SSCE Result Verification Code (WAEC/NECO/NABTEB/NBAIS)",
      "₦4,200 JAMB ePayment fee",
      "Endorsement by College Provost"
    ],
    "steps": [
      "Obtain SSCE Result Verification Code (WAEC: ₦1,500 for 1 sitting / ₦2,000 for 2 sittings)",
      "Visit CBT/PRC/IPRC centre with verification code",
      "Pay ₦4,200 fee on JAMB eFacility portal",
      "Select College and Programme where illegally admitted as 1st Choice",
      "Upload verified O'Level details and registration template",
      "College Provost recommends candidate on eFacility CAPS"
    ],
    "documents_required": ["SSCE Verification Code", "O'Level Result Statement"],
    "important_dates": [
      {"event": "Institution submission deadline to JAMB", "date": "June 30, 2026"}
    ],
    "fees": [
      {"item": "Condonement registration & portal fee", "amount": "₦4,200"}
    ],
    "official_sources": ["https://www.jamb.gov.ng/pdfs/2026/Letter%20to%20Provosts%20on%20Special%20waiver.pdf"],
    "related_topics": ["JAMB Regularization", "JAMB CAPS", "O'Level Upload"],
    "keywords": ["condonement illegal admission", "jamb waiver 2026", "waec verification code", "jamb 4200"],
    "faq": [
      {"question": "Does condonement apply to 2026 admissions?", "answer": "No. Condonement strictly applies to 2024/2025 and 2025/2026 intakes only."}
    ],
    "last_verified": "2026-08-11",
    "version": "2026"
  },
  {
    "id": "kb-jamb-nce-agric-2026",
    "title": "2026/2027 NCE & ND Non-Technology Agric Registration Guidelines",
    "slug": "jamb-nce-nd-agric-registration-guidelines-2026",
    "category": "Registration & Admissions",
    "institution": "JAMB / NCCE",
    "course": "",
    "summary": "Abolition of 100L/200L degree admissions in Colleges of Education, NCE registration flow, and ₦700 reduced fee for 2026 UTME COE migrants.",
    "content": "Starting 2026/2027 session, NO direct 100L or 200L degree admissions are permitted in any College of Education; all entrants must be admitted through NCE. Furthermore, no admissions into affiliated degree programmes are allowed in COEs. 2026 UTME candidates who applied to COEs or ND Agric are automatically migrated to NCE mode and pay ONLY ₦700 registration fee (₦3,500 JAMB fee waived). SSCE verification code is required during registration.",
    "requirements": [
      "NIN & JAMB Profile Code",
      "SSCE Result Verification Code",
      "Passport photograph & biometric capture"
    ],
    "steps": [
      "Obtain SSCE Verification Code from WAEC/NECO/NABTEB/NBAIS",
      "Send NIN to 55019 or 66019 for Profile Code",
      "Create profile on eFacility and select NCE/Agric option",
      "Pay ₦700 registration fee (for 2026 UTME COE migrants) or standard fee",
      "Select up to 3 Colleges of Education and submit for CAPS recommendation"
    ],
    "documents_required": ["SSCE Verification Code", "Registration Slip"],
    "important_dates": [],
    "fees": [
      {"item": "Registration fee for 2026 UTME COE migrants", "amount": "₦700"}
    ],
    "official_sources": ["https://www.jamb.gov.ng/pdfs/2026/V5%20Special%20Registration%20Flow%20NCE%20ND.pdf"],
    "related_topics": ["UTME Registration", "JAMB CAPS", "Direct Entry"],
    "keywords": ["nce registration 2026", "no 100l coe", "affiliated degree colleges of education", "nce 700 fee"],
    "faq": [
      {"question": "Can I still get 100L degree admission directly in a College of Education?", "answer": "No. From the 2026/2027 session onward, all admissions into Colleges of Education must be through NCE."}
    ],
    "last_verified": "2026-08-11",
    "version": "2026"
  },
  {
    "id": "kb-jamb-roadmap-2024-2028",
    "title": "Strategic Roadmap for Inclusive Access to Quality Higher Education (2024–2028)",
    "slug": "jamb-inclusive-education-strategic-roadmap-2024-2028",
    "category": "Special Needs & Inclusion",
    "institution": "Federal Ministry of Education / JAMB",
    "course": "",
    "summary": "₦14.7B 5-year strategic roadmap by JEOG and FME guaranteeing trimodal UTME exam modes (Braille, CBT, Read-Aloud) and non-discriminatory access for persons with disabilities.",
    "content": "The Strategic Roadmap for Inclusive Access to Quality Higher Education in Nigeria (2024-2028) is a ₦14.7B initiative by JAMB Equal Opportunity Group (JEOG) led by Prof. Is-haq Oloyede and Prof. Peter Okebukola. It establishes national guidelines for inclusive education, trimodal UTME options (fully Braille, fully CBT, fully Read-Aloud by proctor), a national disability database by 2025, a 5% annual increase in Special Needs admissions, and a 10% annual increase in disability-friendly tertiary campuses.",
    "requirements": [
      "Special Needs qualification (visually impaired, hearing impaired, physical/health impairment, autism, Down Syndrome, learning disabilities, albinism)"
    ],
    "steps": [],
    "documents_required": [],
    "important_dates": [],
    "fees": [],
    "official_sources": ["https://www.jamb.gov.ng/PDFs/FINAL-2024-2028%20Strategic%20Roadmap%20for%20Inclusive%20Access%20to%20Quality%20Higher%20Education-Oct_2024updated.pdf"],
    "related_topics": ["UTME Registration", "JAMB Policy Meeting"],
    "keywords": ["jeog", "inclusive roadmap jamb", "braille cbt read aloud", "special needs utme", "peter okebukola"],
    "faq": [
      {"question": "What examination modes are provided for blind and Special Needs UTME candidates?", "answer": "JEOG provides a trimodal system: (a) Fully Braille, (b) Fully CBT, and (c) Fully Read-Aloud by proctor."}
    ],
    "last_verified": "2026-08-11",
    "version": "2024-2028"
  },
  {
    "id": "kb-jamb-returnee-2026",
    "title": "JAMB Returnee Candidates Application Guidelines",
    "slug": "jamb-returnee-candidates-guidelines-2026",
    "category": "Admissions",
    "institution": "JAMB",
    "course": "",
    "summary": "Application procedures for Nigerian students displaced from foreign universities in crisis zones (Ukraine, Sudan, Turkey) or seeking inter-university transfers.",
    "content": "JAMB provides a dedicated path for Nigerian students returning from foreign institutions in conflict zones (such as Ukraine, Sudan, Turkey) or seeking inter-university transfers. Applicants download the Returnee Advisory and Affidavit Guide, execute a court Affidavit, and apply on returnee.jamb.gov.ng uploading official transcripts and previous admission credentials for JAMB clearance and absorption into Nigerian universities.",
    "requirements": [
      "Official academic transcript from former foreign/local university",
      "Sworn court Affidavit adhering to JAMB Affidavit Guide",
      "Online application via returnee.jamb.gov.ng"
    ],
    "steps": [
      "Download official Advisory for Returnee Students from JAMB website",
      "Complete court Affidavit following the Affidavit Guide",
      "Apply online at https://returnee.jamb.gov.ng/",
      "Upload transcripts, former admission letter, passport, and affidavit",
      "Obtain formal JAMB clearance for university absorption"
    ],
    "documents_required": ["Academic Transcripts", "Sworn Affidavit", "Former Admission Letter", "Passport Data Page"],
    "important_dates": [],
    "fees": [],
    "official_sources": ["https://www.jamb.gov.ng/ReturneeApplicants.aspx"],
    "related_topics": ["Direct Entry", "JAMB Regularization"],
    "keywords": ["returnee candidates", "ukraine returnee", "sudan returnee", "turkey returnee", "inter university transfer jamb"],
    "faq": [
      {"question": "Where do returnee students apply?", "answer": "Via the official JAMB Returnee portal at https://returnee.jamb.gov.ng/."}
    ],
    "last_verified": "2026-08-11",
    "version": "2026"
  },
  {
    "id": "kb-jamb-profiled-email-2026",
    "title": "Implementation of 'Profiled Email' Service to Substitute Lost SIM",
    "slug": "jamb-profiled-email-service-substitute-lost-sim",
    "category": "Services & Profile",
    "institution": "JAMB",
    "course": "",
    "summary": "Official JAMB process allowing candidates who lost their registered SIM to attach a 'Profiled Email' at an accredited CBT center via TEMPL 006.",
    "content": "Candidates who lost their registered JAMB SIM card can now visit any accredited CBT center, obtain and complete TEMPL 006 with a new email address, sign the declaration, and have the CBT official upload the form via the CBT Registration App. Once the candidate authenticates the email via the confirmation link/code sent to their inbox, their profile is updated to 'Profiled Email'. This restores access to password resets, result resends, ePINs, and adds a new 'Messages' tab on the profile dashboard mirroring 55019/66019 SMS notifications.",
    "requirements": ["New unused email address", "Completed TEMPL 006 template form", "JAMB Profile Code/Reg Number"],
    "steps": [
      "Visit an accredited CBT Center and request TEMPL 006 form",
      "Fill in Registration/Phone/Profile Code details and new email address",
      "Sign the binding attestation declaration",
      "CBT official uploads completed template on CBT Registration App",
      "Authenticate new email address via link/code sent to email inbox",
      "Access updated eFacility profile with 55019 features and Messages menu"
    ],
    "documents_required": ["Signed TEMPL 006 Template"],
    "important_dates": [],
    "fees": [],
    "official_sources": ["https://www.jamb.gov.ng/img/2025Advisories/PROFILED_EMAIL_SERVICE1.pdf"],
    "related_topics": ["JAMB Profile Code", "Password Reset", "E-Facility"],
    "keywords": ["lost sim jamb", "profiled email", "templ 006", "add email jamb", "substitute lost sim"],
    "faq": [
      {"question": "What if I lost my JAMB registered SIM card?", "answer": "You can visit any accredited CBT center to fill and upload TEMPL 006 to attach a 'Profiled Email' address to your account."}
    ],
    "last_verified": "2026-08-11",
    "version": "2026"
  },
  {
    "id": "kb-jamb-minimum-age-16-policy",
    "title": "Admission of Candidates with Minimum Admissible Age of 16 Years (Ref: JAMB/ADMS/139/V.III)",
    "slug": "jamb-minimum-admissible-age-16-years-policy",
    "category": "Policy & Eligibility",
    "institution": "JAMB / Federal Ministry of Education",
    "course": "",
    "summary": "Official JAMB circular (Ref: JAMB/ADMS/139/V.III) enforcing 16 years as minimum admission age, allowing harvest of candidates turning 16 by August 31, 2025.",
    "content": "JAMB circular Ref: JAMB/ADMS/139/V.III signed by Director Admissions Mohammed A. Babaji clarifies the minimum admission age of 16 years. To ensure equity for institutions whose 2024/2025 admission cycle extends into July 2025, institutions are allowed to harvest candidates turning 16 by August 31, 2025 from CAPS. Institutions that prefer to strictly limit 16 years to December 31, 2024 remain free to do so.",
    "requirements": ["Attain 16 years of age by 31st December 2024 (or 31st August 2025 for extended sessions)"],
    "steps": [
      "Institutions harvest candidates turning 16 between Jan 1 and Aug 31, 2025 from CAPS",
      "Submit list to JAMB within one week for approval",
      "Process admissions on CAPS for eligible candidates"
    ],
    "documents_required": [],
    "important_dates": [],
    "fees": [],
    "official_sources": ["https://www.jamb.gov.ng/"],
    "related_topics": ["JAMB Policy Meeting", "JAMB CAPS"],
    "keywords": ["minimum age 16", "jamb/adms/139/v.iii", "admission age requirement", "16 years august 31 2025"],
    "faq": [
      {"question": "Can I gain university admission if I am 15 years old?", "answer": "No. The minimum admissible age of 16 years is a sacrosanct national policy."}
    ],
    "last_verified": "2026-08-11",
    "version": "2024/2025"
  },
  {
    "id": "kb-jamb-registrar-segun-aina",
    "title": "Profile of the Registrar & Chief Executive — Prof. Segun Aina",
    "slug": "jamb-registrar-prof-segun-aina",
    "category": "Governance & Leadership",
    "institution": "JAMB",
    "course": "",
    "summary": "Profile of Prof. Segun Aina, the sixth Registrar and Chief Executive Officer of the Joint Admissions and Matriculation Board.",
    "content": "Prof. Segun Aina is the sixth Registrar and Chief Executive Officer of JAMB. A distinguished Professor of Computer Engineering, he holds a B.Eng from Univ. of Kent (UK), M.Sc and PhD from Loughborough Univ (UK), and Senior Management Programme from LBS. His leadership focuses on digital transformation, AI, examination technology, and public sector innovation.",
    "requirements": [],
    "steps": [],
    "documents_required": [],
    "important_dates": [],
    "fees": [],
    "official_sources": ["https://www.jamb.gov.ng/Registrar_CE.aspx"],
    "related_topics": ["Board Leadership", "JAMB Mandate"],
    "keywords": ["segun aina", "prof segun aina", "jamb registrar", "sixth registrar jamb"],
    "faq": [
      {"question": "Who is the Registrar of JAMB?", "answer": "Prof. Segun Aina is the sixth Registrar and Chief Executive Officer of the Joint Admissions and Matriculation Board (JAMB)."}
    ],
    "last_verified": "2026-08-11",
    "version": "2026"
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
