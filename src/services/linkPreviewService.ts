import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export interface LinkPreviewItem {
  path: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  updatedAt?: number;
}

export type LinkPreviewMap = Record<string, LinkPreviewItem>;

const LOCAL_STORAGE_KEY = 'campusai_link_previews';

export const DEFAULT_LINK_PREVIEWS: LinkPreviewItem[] = [
  { path: '/', title: 'Main Portal Dashboard', subtitle: 'Home Overview', imageUrl: '' },
  { path: '/calculator', title: 'Aggregate Calculator Hub', subtitle: 'All Universities', imageUrl: '' },
  { path: '/login', title: 'Student Portal Login', subtitle: 'Authentication & Profile', imageUrl: '' },
  { path: '/unilag-aggregate-calculator', title: 'UNILAG Calculator', subtitle: 'Lagos', imageUrl: '' },
  { path: '/ui-aggregate-calculator', title: 'UI Calculator', subtitle: 'Ibadan', imageUrl: '' },
  { path: '/lasu-aggregate-calculator', title: 'LASU Calculator', subtitle: 'Lagos State', imageUrl: '' },
  { path: '/oau-aggregate-calculator', title: 'OAU Calculator', subtitle: 'Ife', imageUrl: '' },
  { path: '/uniben-aggregate-calculator', title: 'UNIBEN Calculator', subtitle: 'Benin', imageUrl: '' },
  { path: '/futa-aggregate-calculator', title: 'FUTA Calculator', subtitle: 'Akure', imageUrl: '' },
  { path: '/cutoff-calculator', title: 'Cutoff & Aggregate Finder', subtitle: 'Requirements', imageUrl: '' },
  { path: '/syllabus', title: 'Syllabus Finder', subtitle: 'JAMB 2026', imageUrl: '' },
  { path: '/e-syllabus', title: 'JAMB E-Syllabus', subtitle: 'Official Syllabus', imageUrl: '' },
  { path: '/postutme', title: 'Post-UTME Release Hub', subtitle: 'Admission Status', imageUrl: '' },
  { path: '/directory', title: 'University Directory', subtitle: 'Institutions', imageUrl: '' },
  { path: '/admission-checklist', title: 'Admission Checklist', subtitle: 'Documents', imageUrl: '' },
  { path: '/cgpa-calculator', title: 'CGPA Tracker', subtitle: 'Analytics', imageUrl: '' },
  { path: '/brochure', title: 'JAMB Brochure (IBASS)', subtitle: 'Requirements', imageUrl: '' },
  { path: '/news', title: 'Verified News & Updates', subtitle: 'Admission News', imageUrl: '' },
  { path: '/feedback', title: 'Student Feedback & Support', subtitle: 'Help Desk', imageUrl: '' },
];

export const getStoredLinkPreviews = (): LinkPreviewMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local link previews:', e);
  }
  return {};
};

export const fetchLinkPreviewsFromCloud = async (): Promise<LinkPreviewMap> => {
  const localMap = getStoredLinkPreviews();
  if (!db) return localMap;

  try {
    const snap = await getDoc(doc(db, 'settings', 'link_previews'));
    if (snap.exists()) {
      const data = snap.data();
      const cloudMap = (data.previews || {}) as LinkPreviewMap;
      const merged = { ...localMap, ...cloudMap };
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (e) {
    console.warn('Failed to fetch link previews from Firestore:', e);
  }
  return localMap;
};

export const saveLinkPreviewImage = async (
  path: string, 
  imageUrl: string, 
  title?: string, 
  subtitle?: string
): Promise<LinkPreviewMap> => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const currentMap = getStoredLinkPreviews();
  
  const existing = currentMap[normalizedPath] || {
    path: normalizedPath,
    title: title || normalizedPath,
    subtitle: subtitle || 'Custom Link',
    imageUrl: ''
  };

  const updatedItem: LinkPreviewItem = {
    ...existing,
    title: title || existing.title,
    subtitle: subtitle || existing.subtitle,
    imageUrl,
    updatedAt: Date.now()
  };

  const updatedMap = {
    ...currentMap,
    [normalizedPath]: updatedItem
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMap));
  }

  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'link_previews'), {
        previews: updatedMap,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (e) {
      console.error('Failed to write link_previews to Firestore:', e);
    }
  }

  return updatedMap;
};

export const deleteLinkPreviewImage = async (path: string): Promise<LinkPreviewMap> => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const currentMap = getStoredLinkPreviews();

  if (currentMap[normalizedPath]) {
    delete currentMap[normalizedPath];
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentMap));
    }
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'link_previews'), {
          previews: currentMap,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } catch (e) {
        console.error('Failed to update link_previews in Firestore:', e);
      }
    }
  }

  return currentMap;
};
