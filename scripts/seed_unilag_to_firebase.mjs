/**
 * UNILAG Admissions Data Extractor & Firestore Seeder
 * 
 * Fetches all official UNILAG academic programmes, admission types,
 * and entry requirements from https://applicationsapi.unilag.edu.ng/
 * and writes them directly into Firebase Firestore.
 * 
 * Run in Command Prompt / Terminal:
 *   node scripts/seed_unilag_to_firebase.mjs
 */

import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';

// 1. Load Firebase configuration
const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig;

if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
} else {
  // Fallback credentials
  firebaseConfig = {
    projectId: "planning-with-ai-e00fb",
    appId: "1:839188766880:web:a482b160d10b721479e9c5",
    apiKey: "AIzaSyA29YiPHU-RtbN72D57o6l26FUVkULoE0g",
    authDomain: "planning-with-ai-e00fb.firebaseapp.com",
    firestoreDatabaseId: "(default)"
  };
}

console.log(`\n🚀 Initializing Firebase for Project: ${firebaseConfig.projectId}...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// All official UNILAG Application Types
const APPLICATION_TYPES = [
  'Undergraduate',
  'DLI',
  'ICE',
  'ICE (EDUCATION)',
  'JUPEB SC',
  'ULBS',
  'ULBS-SP',
  'ULBS-MP',
  'TDPT',
  'JointMasters',
  'INTER-UNI. TRANSFER',
  'Postgraduate (MPhil/PhD)',
  'HRDC',
  '-'
];

const BASE_URL = 'https://applicationsapi.unilag.edu.ng/api/entryrequirement';

// Helper delay to respect rate limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizeDocId(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 120) || `prog_${Date.now()}`;
}

async function fetchJson(url) {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://applications.unilag.edu.ng/'
  };

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

async function main() {
  console.log('====================================================');
  console.log('🏛️  UNILAG Admissions Live Harvester & Firestore Sync');
  console.log('====================================================\n');

  const allRecords = [];
  let totalSaved = 0;

  for (const appType of APPLICATION_TYPES) {
    console.log(`📡 Fetching programmes for Application Type: [${appType}]...`);
    try {
      const url = `${BASE_URL}/programmes?applicationTypeId=${encodeURIComponent(appType)}`;
      const res = await fetchJson(url);

      if (res && Array.isArray(res.data) && res.data.length > 0) {
        console.log(`   ✅ Found ${res.data.length} programmes in [${appType}]`);

        for (const prog of res.data) {
          const programmeName = prog.programmeName || prog.programmeID || 'Unknown';
          const programmeID = prog.programmeID || prog.programmeName;
          const qualification = prog.qualification || null;

          const record = {
            id: sanitizeDocId(`unilag_${appType}_${programmeID}`),
            institution: 'University of Lagos (UNILAG)',
            institutionSlug: 'unilag',
            applicationType: appType,
            programmeName,
            programmeID,
            qualification,
            source: 'https://applicationsapi.unilag.edu.ng',
            updatedAt: new Date().toISOString()
          };

          allRecords.push(record);
        }
      } else {
        console.log(`   ℹ️ No records found for [${appType}]`);
      }
    } catch (err) {
      console.error(`   ❌ Failed to fetch [${appType}]:`, err.message);
    }

    await sleep(400); // Friendly rate limit
  }

  console.log(`\n📦 Total UNILAG Programmes Collected: ${allRecords.length}`);

  if (allRecords.length === 0) {
    console.log('⚠️ No records to save. Exiting.');
    return;
  }

  // Save local JSON backup
  const backupPath = path.resolve(process.cwd(), 'unilag_programmes_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(allRecords, null, 2), 'utf8');
  console.log(`💾 Saved local JSON backup to: ${backupPath}`);

  // Push to Firestore in batches
  console.log(`\n🔥 Syncing to Firestore collection 'unilag_programmes'...`);
  const BATCH_SIZE = 400;

  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const chunk = allRecords.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const ref = doc(db, 'unilag_programmes', item.id);
      batch.set(ref, {
        ...item,
        timestamp: Timestamp.now()
      }, { merge: true });
    }

    await batch.commit();
    totalSaved += chunk.length;
    console.log(`   ✨ Saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${totalSaved}/${allRecords.length})`);
    await sleep(200);
  }

  console.log('\n====================================================');
  console.log(`🎉 SUCCESS! All ${totalSaved} UNILAG programmes are now in Firestore!`);
  console.log('====================================================\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Fatal Error during seeding:', err);
  process.exit(1);
});
