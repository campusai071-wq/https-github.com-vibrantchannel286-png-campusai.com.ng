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
