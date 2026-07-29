import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc, query, where, Timestamp } from 'firebase/firestore';
import { MasterCourse, AdmissionInstitution, AdmissionRequirementOverride, AdmissionArticle } from '../types';
import { slugify } from './utils';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const COURSES_COL = 'master_courses';
const INSTITUTIONS_COL = 'admission_institutions';
const OVERRIDES_COL = 'admission_requirement_overrides';
const ARTICLES_COL = 'admission_articles';

export const admissionsService = {
  /**
   * Master Courses
   */
  getAllMasterCourses: async (): Promise<MasterCourse[]> => {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, COURSES_COL));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterCourse));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COURSES_COL);
      return [];
    }
  },

  getMasterCourse: async (idOrName: string): Promise<MasterCourse | null> => {
    if (!db) return null;
    try {
      const id = slugify(idOrName);
      const snap = await getDoc(doc(db, COURSES_COL, id));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as MasterCourse;
      
      const q = query(collection(db, COURSES_COL), where("courseName", "==", idOrName));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) return { id: qSnap.docs[0].id, ...qSnap.docs[0].data() } as MasterCourse;
      
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, COURSES_COL + '/' + idOrName);
      return null;
    }
  },

  /**
   * Institutions
   */
  getAllInstitutions: async (): Promise<AdmissionInstitution[]> => {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, INSTITUTIONS_COL));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionInstitution));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, INSTITUTIONS_COL);
      return [];
    }
  },

  getInstitution: async (idOrName: string): Promise<AdmissionInstitution | null> => {
    if (!db) return null;
    try {
      const id = slugify(idOrName);
      const snap = await getDoc(doc(db, INSTITUTIONS_COL, id));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as AdmissionInstitution;
      
      const q = query(collection(db, INSTITUTIONS_COL), where("name", "==", idOrName));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) return { id: qSnap.docs[0].id, ...qSnap.docs[0].data() } as AdmissionInstitution;
      
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, INSTITUTIONS_COL + '/' + idOrName);
      return null;
    }
  },

  /**
   * Overrides & Special Considerations
   */
  getOverrides: async (institutionId: string, courseId: string): Promise<AdmissionRequirementOverride[]> => {
    if (!db) return [];
    try {
      const q = query(
        collection(db, OVERRIDES_COL),
        where("institutionId", "==", institutionId),
        where("courseId", "==", courseId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionRequirementOverride));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, OVERRIDES_COL);
      return [];
    }
  },

  /**
   * Admin Seeding Tools (Internal use)
   */
  upsertMasterCourse: async (course: Partial<MasterCourse>) => {
    if (!db) return;
    
    // 1. Validation & Required Fields
    if (!course.courseName) throw new Error("courseName is required");
    if (!course.utmeSubjects || !Array.isArray(course.utmeSubjects)) throw new Error("utmeSubjects must be an array");
    if (!course.olevelRequirements || !Array.isArray(course.olevelRequirements)) throw new Error("olevelRequirements must be an array");
    
    const id = slugify(course.courseName);
    const ref = doc(db, COURSES_COL, id);
    
    // 2. Indexing (Keywords)
    const keywords = Array.from(new Set([
      ...course.courseName.toLowerCase().split(/\s+/),
      ...(course.faculty ? course.faculty.toLowerCase().split(/\s+/) : [])
    ])).filter(k => k.length > 2);

    // 3. Version History & Deduplication
    const existingSnap = await getDoc(ref);
    let newVersion = 1;
    
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as MasterCourse;
      newVersion = (existingData.version || 0) + 1;
      
      // Save to history
      const historyRef = doc(collection(db, `${COURSES_COL}_history`));
      await setDoc(historyRef, {
        ...existingData,
        originalId: id,
        archivedAt: Timestamp.now()
      });
    }

    const payload = {
      ...course,
      keywords,
      version: newVersion,
      lastVerified: course.lastVerified || Timestamp.now(),
      nextReview: course.nextReview || Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year default
      updatedAt: Timestamp.now()
    };

    await setDoc(ref, payload, { merge: true });
  },

  upsertInstitution: async (inst: Partial<AdmissionInstitution>) => {
    if (!db) return;
    
    // 1. Validation & Required Fields
    if (!inst.name) throw new Error("name is required");
    if (!inst.type || !['University', 'Polytechnic', 'College of Education', 'Innovation Enterprise Institution'].includes(inst.type)) throw new Error("Invalid or missing type");
    if (!inst.category || !['Federal', 'State', 'Private'].includes(inst.category)) throw new Error("Invalid or missing category");
    
    const id = slugify(inst.name);
    const ref = doc(db, INSTITUTIONS_COL, id);

    // 2. Indexing (Keywords)
    const keywords = Array.from(new Set([
      ...inst.name.toLowerCase().split(/\s+/),
      ...(inst.state ? inst.state.toLowerCase().split(/\s+/) : []),
      inst.type.toLowerCase(),
      inst.category.toLowerCase()
    ])).filter(k => k.length > 2);

    // 3. Version History & Deduplication
    const existingSnap = await getDoc(ref);
    let newVersion = 1;

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as AdmissionInstitution;
      newVersion = (existingData.version || 0) + 1;
      
      // Save to history
      const historyRef = doc(collection(db, `${INSTITUTIONS_COL}_history`));
      await setDoc(historyRef, {
        ...existingData,
        originalId: id,
        archivedAt: Timestamp.now()
      });
    }

    const payload = {
      ...inst,
      keywords,
      version: newVersion,
      lastVerified: inst.lastVerified || Timestamp.now(),
      nextReview: inst.nextReview || Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year default
      updatedAt: Timestamp.now()
    };

    await setDoc(ref, payload, { merge: true });
  },

  upsertAdmissionArticle: async (article: Partial<AdmissionArticle>) => {
    if (!db) return;
    
    // 1. Validation & Required Fields
    if (!article.title) throw new Error("title is required");
    if (!article.id) throw new Error("id is required");
    
    const id = article.id;
    const ref = doc(db, ARTICLES_COL, id);

    // 2. Indexing (Keywords)
    const keywords = Array.from(new Set([
      ...article.title.toLowerCase().split(/\s+/),
      ...(article.category ? article.category.toLowerCase().split(/\s+/) : []),
      ...(article.keywords ? article.keywords.map(k => k.toLowerCase()) : [])
    ])).filter(k => k.length > 2);

    // 3. Version History & Deduplication
    const existingSnap = await getDoc(ref);
    let newVersion = 1;

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as AdmissionArticle;
      newVersion = (parseInt(existingData.version as any) || 0) + 1;
      
      // Save to history
      const historyRef = doc(collection(db, `${ARTICLES_COL}_history`));
      await setDoc(historyRef, {
        ...existingData,
        originalId: id,
        archivedAt: Timestamp.now()
      });
    }

    const payload = {
      ...article,
      keywords,
      version: newVersion,
      last_verified: article.last_verified || Timestamp.now(),
      next_review: article.next_review || Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year default
      updatedAt: Timestamp.now()
    };

    await setDoc(ref, payload, { merge: true });
  },

  getAllAdmissionArticles: async (): Promise<AdmissionArticle[]> => {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, ARTICLES_COL));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionArticle));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, ARTICLES_COL);
      return [];
    }
  }
};
