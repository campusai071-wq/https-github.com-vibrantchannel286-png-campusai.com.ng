import axios from 'axios';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const apiKey = "aloc_8AEgkpFC6LYcBCBRFpIPDLxBqKYRUFSTzHVNvxuK";
const baseUrl = "https://dev.aloc.com.ng/api/v1";

const cfg = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(cfg);
const db = getFirestore(app);

const SUBJECTS = [
  'english-language',
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'economics',
  'government',
  'literature-in-english',
  'christian-religious-studies',
  'commerce',
  'accounting',
  'civic-education',
  'geography'
];

function normalize(q, subject) {
  const rawOptions = q.options || q.option || {};
  return {
    id: String(q.id),
    question: q.text || q.question || '',
    option: {
      a: rawOptions.A || rawOptions.a || '',
      b: rawOptions.B || rawOptions.b || '',
      c: rawOptions.C || rawOptions.c || '',
      d: rawOptions.D || rawOptions.d || '',
      ...(rawOptions.E || rawOptions.e ? { e: rawOptions.E || rawOptions.e } : {})
    },
    answer: String(q.correctAnswer || q.answer || '').trim().toLowerCase(),
    solution: q.solution || q.explanation || (q.section ? `Passage/Section: ${q.section}` : `Official past question (${q.year || 'Standard syllabus'}).`),
    examType: String(q.examType || 'JAMB').toUpperCase(),
    examYear: String(q.year || q.examYear || '2024'),
    section: q.section || null,
    hasPassage: !!(q.section || q.hasPassage),
    imageUrl: q.imageUrl || q.image || null,
    metadata: {
      source: 'aloc',
      alocId: q.id,
      year: q.year,
      subject: q.subject || subject,
      questionNumber: q.questionNumber
    },
    category: q.category || 'official_aloc_question',
    questionNumber: q.questionNumber || null,
    source: 'aloc',
    subject: subject,
    updatedAt: new Date().toISOString()
  };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchAndSave(subject) {
  try {
    console.log(`Fetching fresh ALOC questions for ${subject}...`);
    const res = await axios.get(`${baseUrl}/questions`, {
      params: {
        subject,
        limit: 15,
        random: 'true'
      },
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
        'X-Client-Type': 'seed-script'
      },
      timeout: 10000
    });

    const items = res.data?.data || [];
    console.log(`Received ${items.length} questions for ${subject}`);
    let saved = 0;
    for (const item of items) {
      if (!item.id || !item.text) continue;
      const normalized = normalize(item, subject);
      await setDoc(doc(db, 'aloc_questions_vault', String(normalized.id)), normalized);
      saved++;
    }
    console.log(`Saved ${saved} questions to aloc_questions_vault for ${subject}`);
  } catch (err) {
    console.error(`Error fetching ${subject}:`, err.response?.status, err.response?.data || err.message);
  }
}

async function run() {
  console.log("Starting ALOC questions seeder for all 13 subjects...");
  for (const sub of SUBJECTS) {
    await fetchAndSave(sub);
    await sleep(2200); // 2.2s spacing to stay well under 30 req/min
  }
  console.log("ALOC vault seeding complete!");
  process.exit(0);
}

run();
