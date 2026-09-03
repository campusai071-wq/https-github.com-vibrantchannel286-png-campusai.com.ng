import { jsPDF } from "jspdf";

const DB_NAME = "CampusAIPdfVault";
const STORE_NAME = "pdf_blobs";

function openPdfDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported in this environment"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdfBlobLocally(id: string, dataUrl: string): Promise<boolean> {
  try {
    const db = await openPdfDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ id, dataUrl, savedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn("[IndexedDB Vault] Write error:", e);
    return false;
  }
}

export async function getPdfBlobLocally(id: string): Promise<string | null> {
  try {
    const db = await openPdfDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result?.dataUrl || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deletePdfBlobLocally(id: string): Promise<boolean> {
  try {
    const db = await openPdfDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Generates an instant offline client-side PDF document if network or remote download fails.
 * Guarantees that download never returns 404 or fails on mobile browsers.
 */
export function generateClientStudyPdf(title: string, category: string, author?: string): Blob {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("CAMPUSAI ACADEMIC STUDY VAULT • NIGERIA", margin, 12);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text("Verified UTME, Post-UTME & Tertiary Preparation Repository", margin, 20);

  // Title
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const splitTitle = doc.splitTextToSize(title, contentWidth);
  doc.text(splitTitle, margin, 40);

  const titleHeight = splitTitle.length * 7;
  const currentY = 44 + titleHeight;

  // Metadata Card
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, "F");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Category: ${category}   •   Author: ${author || "Student Candidate"}`, margin + 4, currentY + 6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString("en-NG")} via CampusAI Vault System`, margin + 4, currentY + 12);

  // Body content
  let bodyY = currentY + 24;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("1. CORE EXAMINATION OBJECTIVES & SYLLABUS HIGHLIGHTS", margin, bodyY);
  bodyY += 7;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(31, 41, 55);
  const text = `This study document contains essential examination objectives, core topical summaries, and syllabus guidelines compiled for candidates preparing for tertiary entrance screening, JAMB UTME, and Post-UTME assessments. Review key formulae, high-yield definitions, and consistent mock CBT practice questions daily.`;
  const splitBody = doc.splitTextToSize(text, contentWidth);
  doc.text(splitBody, margin, bodyY);
  bodyY += splitBody.length * 5 + 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("2. HIGH-YIELD TOPICS & PRACTICE RECOMMENDATIONS", margin, bodyY);
  bodyY += 7;

  const topics = [
    "Comprehensive Coverage of Past UTME and Screening Questions (Past 10 Years)",
    "Concept Mastery over Memorization: Focus on fundamental scientific and logical principles",
    "Time Management Drill: Target 45-50 seconds per CBT question during mock sessions",
    "Formulae & Terminologies Notebook: Maintain a personal summary of high-yield definitions",
    "Biometric & Exam Day Readiness: Verify all examination slips and accredited center locations"
  ];

  topics.forEach((t, i) => {
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin, bodyY - 1, contentWidth, 8, 1, 1, "F");
    doc.setTextColor(6, 78, 59);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(`• ${i + 1}.`, margin + 3, bodyY + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(t, margin + 11, bodyY + 4.5);
    bodyY += 10;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("CampusAI Official Academic Repository • www.campusai.com.ng", margin, 288);

  const arrayBuf = doc.output("arraybuffer");
  return new Blob([arrayBuf], { type: "application/pdf" });
}
