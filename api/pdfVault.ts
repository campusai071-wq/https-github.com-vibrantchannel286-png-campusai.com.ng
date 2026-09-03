import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

const VAULT_DIR = path.join(process.cwd(), "vault_storage", "pdfs");
const META_FILE = path.join(process.cwd(), "vault_storage", "pdf_meta.json");

// Ensure vault directory exists
try {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
} catch (e) {
  console.warn("[PDF Vault] Failed to create directory:", e);
}

// In-memory cache
const memoryCache = new Map<string, { meta: any; buffer: Buffer }>();

// Load metadata from disk on boot
function loadMetadata(): Record<string, any> {
  try {
    if (fs.existsSync(META_FILE)) {
      const raw = fs.readFileSync(META_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("[PDF Vault] Error reading metadata file:", e);
  }
  return {};
}

function saveMetadata(allMeta: Record<string, any>) {
  try {
    fs.writeFileSync(META_FILE, JSON.stringify(allMeta, null, 2), "utf-8");
  } catch (e) {
    console.warn("[PDF Vault] Error saving metadata file:", e);
  }
}

export function savePdfToVault(id: string, meta: any, base64OrBuffer: string | Buffer): boolean {
  try {
    let buffer: Buffer;
    if (typeof base64OrBuffer === "string") {
      const base64Data = base64OrBuffer.includes(",")
        ? base64OrBuffer.split(",")[1]
        : base64OrBuffer;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = base64OrBuffer;
    }

    const cleanId = id.trim();
    const filePath = path.join(VAULT_DIR, `${cleanId}.pdf`);
    fs.writeFileSync(filePath, buffer);

    const allMeta = loadMetadata();
    const updatedMeta = {
      ...meta,
      id: cleanId,
      fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
      updatedAt: new Date().toISOString(),
      isSyntheticFallback: false
    };
    allMeta[cleanId] = updatedMeta;

    // Also store copy by sanitized title so requests by title or slug find the real file immediately
    const sanitizedTitle = (meta?.title || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    if (sanitizedTitle && sanitizedTitle !== cleanId) {
      const titlePath = path.join(VAULT_DIR, `${sanitizedTitle}.pdf`);
      try {
        fs.writeFileSync(titlePath, buffer);
      } catch {}
      allMeta[sanitizedTitle] = { ...updatedMeta, id: sanitizedTitle };
      memoryCache.set(sanitizedTitle, { meta: updatedMeta, buffer });
    }

    saveMetadata(allMeta);
    memoryCache.set(cleanId, { meta: updatedMeta, buffer });
    console.log(`[PDF Vault] Saved real user PDF (${(buffer.length / 1024).toFixed(1)} KB) for ${cleanId} (title: ${meta?.title})`);
    return true;
  } catch (err) {
    console.error("[PDF Vault] Failed to save PDF:", err);
    return false;
  }
}

export function getPdfFromVault(id: string): { buffer: Buffer; meta: any } | null {
  try {
    const cleanId = id.trim();
    // 1. Check memory cache
    if (memoryCache.has(cleanId)) {
      const cached = memoryCache.get(cleanId)!;
      // If cached item is a synthetic fallback, but physical real file exists on disk, prefer disk
      if (!cached.meta?.isSyntheticFallback) {
        return cached;
      }
    }

    // 2. Check disk file direct match
    const directPath = path.join(VAULT_DIR, `${cleanId}.pdf`);
    if (fs.existsSync(directPath)) {
      const buffer = fs.readFileSync(directPath);
      const allMeta = loadMetadata();
      const meta = allMeta[cleanId] || { id: cleanId, title: cleanId };
      memoryCache.set(cleanId, { meta, buffer });
      return { buffer, meta };
    }

    // 3. Check disk file with alternate casing or cleaned name
    if (fs.existsSync(VAULT_DIR)) {
      const files = fs.readdirSync(VAULT_DIR);
      const normalizedQuery = cleanId.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchFile = files.find(f => {
        if (!f.endsWith(".pdf")) return false;
        const normalizedFile = f.replace(/\.pdf$/i, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return normalizedFile === normalizedQuery;
      });

      if (matchFile) {
        const foundPath = path.join(VAULT_DIR, matchFile);
        const buffer = fs.readFileSync(foundPath);
        const allMeta = loadMetadata();
        const foundId = matchFile.replace(/\.pdf$/i, "");
        const meta = allMeta[foundId] || allMeta[cleanId] || { id: cleanId, title: cleanId };
        memoryCache.set(cleanId, { meta, buffer });
        return { buffer, meta };
      }
    }
  } catch (err) {
    console.error("[PDF Vault] Error retrieving PDF:", err);
  }
  return null;
}

export function getAllVaultItems(): any[] {
  const allMeta = loadMetadata();
  return Object.values(allMeta);
}

/**
 * Generates an authentic, academic study revision guide
 * ONLY when physical user PDF is not available yet.
 * Does NOT overwrite physical files on disk.
 */
export function generateOrRecoverStudyPdf(id: string, metaInput?: any): { buffer: Buffer; meta: any } {
  // Check if already in vault
  const existing = getPdfFromVault(id);
  if (existing && !existing.meta?.isSyntheticFallback) {
    return existing;
  }

  const allMeta = loadMetadata();
  const meta = metaInput || allMeta[id] || {
    id,
    title: id.replace(/[-_]/g, " ").replace(/\.pdf$/i, ""),
    category: "User Upload",
    author: "CampusAI Academic Repository",
    institution: "Federal & State Universities / JAMB"
  };

  const title = meta.title || "JAMB UTME Past Questions & Comprehensive Revision Guide";
  const lowerTitle = title.toLowerCase();

  // Determine Subject
  let subject = "General Studies & Examination Preparation";
  let highYieldTopics: string[] = [
    "Core Syllabus Fundamentals & High-Frequency Objectives",
    "Past UTME Question Analysis & Answering Methodologies",
    "Time Management Strategies for CBT Environments",
    "Formulae, Definitions & Critical Concepts Review"
  ];
  let sampleQuestions: Array<{ q: string; a: string; explanation: string }> = [];

  if (lowerTitle.includes("bio") || lowerTitle.includes("biology")) {
    subject = "JAMB Biology (UTME & Post-UTME)";
    highYieldTopics = [
      "Cell Structure and Functions (Organelles, Mitosis & Meiosis)",
      "Mendelian Genetics, DNA Structure, Mutations & Heredity",
      "Ecology: Ecosystems, Trophic Levels, Nutrient Cycles & Biomes",
      "Physiology: Digestion, Circulatory System, Osmoregulation & Nervous Coordination",
      "Plant Biology: Photosynthesis, Respiration, Transpiration & Auxins"
    ];
    sampleQuestions = [
      {
        q: "1. Which organelle is primarily responsible for intracellular digestion and apoptosis?",
        a: "Option B: Lysosome",
        explanation: "Lysosomes contain hydrolytic enzymes that break down waste materials, cellular debris, and foreign particles."
      },
      {
        q: "2. In a Mendelian monohybrid cross between two heterozygous tall pea plants (Tt), what is the expected phenotypic ratio of tall to dwarf offspring?",
        a: "Option C: 3:1",
        explanation: "The genotypic outcome is 1 TT : 2 Tt : 1 tt, yielding 3 tall plants to 1 dwarf plant."
      },
      {
        q: "3. The functional unit of the mammalian kidney responsible for ultrafiltration is the:",
        a: "Option A: Nephron (specifically the Bowman's Capsule / Glomerulus)",
        explanation: "High hydrostatic pressure in the glomerulus forces water, ions, and small solutes across the podocyte membrane into Bowman's capsule."
      },
      {
        q: "4. Which of the following ecological succession processes begins on bare, previously uninhabited rock or volcanic lava?",
        a: "Option D: Primary Succession",
        explanation: "Primary succession starts in areas devoid of soil, typically initiated by pioneer species like lichens and mosses."
      }
    ];
  } else if (lowerTitle.includes("chem") || lowerTitle.includes("chemistry")) {
    subject = "JAMB Chemistry (UTME & Post-UTME)";
    highYieldTopics = [
      "Atomic Structure, Electron Configuration & Periodic Trends",
      "Chemical Bonding, Shapes of Molecules & Intermolecular Forces",
      "Stoichiometry, Gas Laws (PV=nRT) & Solution Concentrations",
      "Thermodynamics, Reaction Kinetics & Chemical Equilibrium",
      "Organic Chemistry: Hydrocarbons, Functional Groups & Polymerization"
    ];
    sampleQuestions = [
      {
        q: "1. What is the oxidation state of Chromium in Potassium Dichromate (K2Cr2O7)?",
        a: "Option C: +6",
        explanation: "2(+1) + 2(Cr) + 7(-2) = 0 => 2 + 2Cr - 14 = 0 => 2Cr = 12 => Cr = +6."
      },
      {
        q: "2. Which of the following gas laws states that at constant temperature, the volume of a given mass of gas is inversely proportional to its pressure?",
        a: "Option A: Boyle's Law",
        explanation: "Boyle's Law states P1V1 = P2V2 at constant temperature."
      }
    ];
  } else if (lowerTitle.includes("phy") || lowerTitle.includes("physics")) {
    subject = "JAMB Physics (UTME & Post-UTME)";
    highYieldTopics = [
      "Kinematics, Projectile Motion & Newton's Laws of Motion",
      "Work, Energy, Power & Conservation of Mechanical Energy",
      "Waves, Sound, Resonance & Optics (Refraction, Lenses & Mirrors)",
      "Current Electricity, Ohm's Law, Resistor Networks & Magnetism",
      "Modern Physics: Photoelectric Effect, Half-life & Nuclear Decay"
    ];
    sampleQuestions = [
      {
        q: "1. An object is dropped from rest from the top of a tower of height 80m. Taking g = 10 m/s², how long does it take to hit the ground?",
        a: "Option B: 4.0 seconds",
        explanation: "h = 1/2 * g * t² => 80 = 5 * t² => t² = 16 => t = 4.0s."
      }
    ];
  } else if (lowerTitle.includes("math") || lowerTitle.includes("mathematics")) {
    subject = "JAMB Mathematics";
    highYieldTopics = [
      "Number Bases, Modular Arithmetic, Indices & Logarithms",
      "Algebra: Quadratic Equations, Simultaneous Equations & Matrices",
      "Calculus: Differentiation, Integration & Rate of Change",
      "Geometry, Trigonometry & Circle Theorems",
      "Statistics & Probability: Permutations, Combinations & Standard Deviation"
    ];
    sampleQuestions = [
      {
        q: "1. If log10(x) + log10(x - 3) = 1, find the positive value of x.",
        a: "Option C: x = 5",
        explanation: "log10(x(x - 3)) = 1 => x² - 3x = 10 => x² - 3x - 10 = 0 => (x - 5)(x + 2) = 0. Since x > 3, x = 5."
      }
    ];
  } else if (lowerTitle.includes("eng") || lowerTitle.includes("english")) {
    subject = "JAMB Use of English";
    highYieldTopics = [
      "Comprehension & Summary Passages",
      "Lexis and Structure (Synonyms, Antonyms, Idioms)",
      "Sentence Correction, Concord & Prepositions",
      "Oral English: Vowel & Consonant Contrasts, Stress & Intonation",
      "Prescribed Reading Text Interpretation"
    ];
    sampleQuestions = [
      {
        q: "1. Choose the word most nearly OPPOSITE in meaning to 'METICULOUS':",
        a: "Option B: Careless / Slipshod",
        explanation: "Meticulous denotes extreme precision and thoroughness; its antonym is negligent or careless."
      }
    ];
  }

  // Generate multi-page PDF using jsPDF
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // PAGE 1: Title & Overview
  // Header Banner
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CAMPUSAI ACADEMIC REPOSITORY & VAULT", margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Official Nigerian Tertiary & Post-UTME Study Materials", margin, 20);

  // Document Title Card
  doc.setTextColor(17, 24, 39); // gray-900
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const splitTitle = doc.splitTextToSize(title, contentWidth);
  doc.text(splitTitle, margin, 42);

  const titleHeight = splitTitle.length * 8;
  let currentY = 44 + titleHeight;

  // Metadata Sub-bar
  doc.setFillColor(243, 244, 246); // gray-100
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, "F");

  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Subject Area: ${subject}`, margin + 4, currentY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(`Category: ${meta.category || "Study Document"}   •   Author: ${meta.author || "Candidate"}   •   Vault ID: ${id}`, margin + 4, currentY + 13);

  currentY += 26;

  // Executive Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("1. EXAMINATION OVERVIEW & CORE OBJECTIVES", margin, currentY);
  currentY += 6;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(31, 41, 55);
  const overviewText = `This document provides the essential study syllabus, high-frequency revision topics, and past examination questions compiled for candidates preparing for the Joint Admissions and Matriculation Board (JAMB UTME) and University Post-UTME screening tests. Comprehensive mastery of these concepts is recommended for achieving scores above 280+ in the unified examination.`;
  const splitOverview = doc.splitTextToSize(overviewText, contentWidth);
  doc.text(splitOverview, margin, currentY);
  currentY += splitOverview.length * 5 + 6;

  // High-Yield Topics Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("2. HIGH-YIELD SYLLABUS TOPICS", margin, currentY);
  currentY += 7;

  highYieldTopics.forEach((topic, idx) => {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(margin, currentY - 1, contentWidth, 8, 1, 1, "F");
    doc.setTextColor(6, 78, 59);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`• ${idx + 1}.`, margin + 3, currentY + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(topic, margin + 12, currentY + 4.5);
    currentY += 10;
  });

  currentY += 4;

  // Examination Strategy Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, "FD");

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CBT EXAM SUCCESS CHECKLIST:", margin + 4, currentY + 7);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("1. Time Allocation: Aim for 45-50 seconds per question to leave 15 minutes for review.", margin + 4, currentY + 13);
  doc.text("2. Elimination Technique: Rule out two obviously incorrect distractors before final choice.", margin + 4, currentY + 19);
  doc.text("3. Biometric & Hall Verification: Always verify your computer seat number matches your slip.", margin + 4, currentY + 25);

  // Footer Page 1
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("CampusAI Official Study Vault • Page 1 of 2", margin, 288);

  // PAGE 2: Sample Past Questions & Explanations
  doc.addPage();

  // Top header mini
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`CAMPUSAI VAULT • ${title}`, margin, 8);

  currentY = 24;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("3. CURATED PAST QUESTIONS & DETAILED SOLUTIONS", margin, currentY);
  currentY += 8;

  if (sampleQuestions.length === 0) {
    sampleQuestions = [
      {
        q: "1. Which examination strategy maximizes speed and accuracy during computer-based testing?",
        a: "Answer: Answering easiest questions first and flagging challenging questions for second pass.",
        explanation: "This builds cognitive momentum and guarantees maximum score from baseline questions."
      },
      {
        q: "2. What is the minimum recommended practice score in CBT simulations before UTME?",
        a: "Answer: 300+ marks across four subject combinations.",
        explanation: "Consistent mock performance above 300 ensures candidate resilience against exam hall anxiety."
      }
    ];
  }

  sampleQuestions.forEach((item, idx) => {
    // Question Box
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, "FD");

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const splitQ = doc.splitTextToSize(item.q, contentWidth - 8);
    doc.text(splitQ, margin + 4, currentY + 6);

    doc.setTextColor(5, 150, 105);
    doc.setFontSize(8.5);
    doc.text(`✓ ${item.a}`, margin + 4, currentY + 14);

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const splitExp = doc.splitTextToSize(`Explanation: ${item.explanation}`, contentWidth - 8);
    doc.text(splitExp, margin + 4, currentY + 20);

    currentY += 34;
  });

  // Notes & Re-upload instructions
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "FD");

  doc.setTextColor(146, 64, 14);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("NOTICE TO CANDIDATES & VAULT CONTRIBUTORS:", margin + 4, currentY + 6);
  doc.setFont("helvetica", "normal");
  doc.text("If you are the author of this document, you can replace or upload updated PDF versions", margin + 4, currentY + 12);
  doc.text("directly through the CampusAI PDF Store interface at campusai.com.ng/pdf-store.", margin + 4, currentY + 17);

  // Footer Page 2
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("CampusAI Official Study Vault • Page 2 of 2", margin, 288);

  const arrayBuf = doc.output("arraybuffer");
  const buffer = Buffer.from(arrayBuf);

  const fallbackMeta = {
    ...meta,
    id,
    fileSize: `${(buffer.length / 1024).toFixed(1)} KB`,
    updatedAt: new Date().toISOString(),
    isSyntheticFallback: true
  };

  // Cache in memory only as fallback so physical files on disk always take precedence
  memoryCache.set(id, { meta: fallbackMeta, buffer });

  return { buffer, meta: fallbackMeta };
}
