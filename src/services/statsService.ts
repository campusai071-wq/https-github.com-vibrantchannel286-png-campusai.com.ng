import { db } from './dbService';
import { doc, getDoc, updateDoc, setDoc, increment, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';

const STATS_COLLECTION = 'calculation_stats';

export const incrementDailyCalculation = async () => {
  if (!db) return;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, STATS_COLLECTION, today);
  
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { count: increment(1) });
    } else {
      await setDoc(docRef, { count: 1, date: today });
    }
  } catch (e) {
    console.error("Error incrementing calculation stats:", e);
  }
};

export const getDailyCalculationCounts = async (limitDays: number = 30) => {
    if (!db) return [];
    
    try {
        const q = query(collection(db, STATS_COLLECTION), orderBy('date', 'desc'), limit(limitDays));
        const snap = await getDocs(q);
        const stats: { date: string; count: number }[] = [];
        snap.forEach((docSnap) => {
            stats.push({ date: docSnap.id, count: docSnap.data().count });
        });
        return stats.reverse();
    } catch (e) {
        console.error("Error fetching calculation stats:", e);
        return [];
    }
};
