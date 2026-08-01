const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const config = require("./firebase-applet-config.json");
const app = initializeApp(config);
const db = getFirestore(app);

// 1. Seed Master Courses
const masterCoursesJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "src/data/masterCourses.json"), "utf-8"));

const DEFAULT_COURSES_DETAILED = [
  {
    id: "computer-science",
    courseName: "Computer Science",
    faculty: "Science",
    utmeSubjects: ["English Language", "Mathematics", "Physics", "Chemistry"],
    olevelRequirements: ["Mathematics", "English Language", "Physics", "Chemistry", "Biology/Further Mathematics"],
    directEntryRequirements: "Two A-Level passes in Mathematics and Physics, or NCE/ND with Upper Credit in Computer Science."
  },
  {
    id: "medicine-and-surgery",
    courseName: "Medicine and Surgery",
    faculty: "Basic Medical Sciences",
    utmeSubjects: ["English Language", "Biology", "Chemistry", "Physics"],
    olevelRequirements: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
    directEntryRequirements: "A-Level passes in Biology/Zoology, Chemistry, and Physics in one sitting, or B.Sc in related field with First Class/Second Class Upper."
  },
  {
    id: "law",
    courseName: "Law",
    faculty: "Law",
    utmeSubjects: ["English Language", "Literature in English", "CRK/IRS", "Government/Economics"],
    olevelRequirements: ["English Language", "Mathematics", "Literature in English", "Government", "CRK/IRS/Economics"],
    directEntryRequirements: "Two A-Level passes in Arts or Social Science subjects, or Diploma in Law with Upper Credit."
  },
  {
    id: "nursing-science",
    courseName: "Nursing Science",
    faculty: "Health Sciences",
    utmeSubjects: ["English Language", "Biology", "Chemistry", "Physics"],
    olevelRequirements: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
    directEntryRequirements: "Registered Nurse (RN) license or A-Level passes in Biology, Chemistry, and Physics."
  },
  {
    id: "electrical-engineering",
    courseName: "Electrical / Electronics Engineering",
    faculty: "Engineering",
    utmeSubjects: ["English Language", "Mathematics", "Physics", "Chemistry"],
    olevelRequirements: ["English Language", "Mathematics", "Physics", "Chemistry", "Further Mathematics/Technical Drawing"],
    directEntryRequirements: "A-Level passes in Mathematics and Physics, or ND/HND Upper Credit in Electrical Engineering."
  },
  {
    id: "accounting",
    courseName: "Accounting / Accountancy",
    faculty: "Management Sciences",
    utmeSubjects: ["English Language", "Mathematics", "Economics", "Government/Commerce"],
    olevelRequirements: ["English Language", "Mathematics", "Economics", "Financial Accounting/Commerce", "Government"],
    directEntryRequirements: "Two A-Level passes including Economics and Accounting, or ATS/ICAN Stage 1."
  }
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function runSeed() {
  console.log("Seeding master courses...");
  let courseCount = 0;

  for (const item of DEFAULT_COURSES_DETAILED) {
    await setDoc(doc(db, "master_courses", item.id), {
      ...item,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    courseCount++;
  }

  for (const item of masterCoursesJson) {
    const slug = slugify(item.title);
    if (!slug) continue;
    await setDoc(doc(db, "master_courses", slug), {
      id: slug,
      courseName: item.title,
      faculty: "General",
      utmeSubjects: ["English Language", "Mathematics", "Relevant Subject 1", "Relevant Subject 2"],
      olevelRequirements: ["English Language", "Mathematics", "Credit in 3 other relevant subjects"],
      directEntryRequirements: "Two A-Level passes in relevant subjects or ND/HND Upper Credit.",
      updatedAt: new Date().toISOString()
    }, { merge: true });
    courseCount++;
  }

  console.log(`Successfully seeded ${courseCount} master courses into Firestore.`);

  // 2. Seed Institutions
  console.log("Seeding admission institutions...");
  const unisJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "src/data/universities.json"), "utf-8"));
  let instCount = 0;

  for (const uni of unisJson) {
    const docId = uni.slug || slugify(uni.name);
    await setDoc(doc(db, "admission_institutions", docId), {
      id: docId,
      name: uni.name,
      slug: uni.slug || docId,
      category: uni.category || "Federal",
      type: "University",
      state: uni.state || "Nigeria",
      url: uni.url || "",
      general_jamb_cutoff: uni.general_jamb_cutoff || 180,
      verified_data: uni.verified_data || {},
      courses: [
        "Computer Science", "Medicine and Surgery", "Law", 
        "Accounting", "Electrical / Electronics Engineering", "Nursing Science"
      ],
      updatedAt: new Date().toISOString()
    }, { merge: true });
    instCount++;
  }

  console.log(`Successfully seeded ${instCount} admission institutions into Firestore.`);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
