import React, { useEffect, useState } from 'react';
import { X, Loader2, Brain } from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface PredictionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
}

const PredictionDetailsModal: React.FC<PredictionDetailsModalProps> = ({ isOpen, onClose, userEmail, userName }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userEmail) {
      const fetchPredictions = async () => {
        setIsLoading(true);
        try {
          const q = query(collection(db, "predictions"), where("userEmail", "==", userEmail), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPredictions(data);
        } catch (error) {
          console.error("Error fetching predictions:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPredictions();
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-950 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black dark:text-white flex items-center gap-2">
            <Brain className="text-blue-600" /> Analysis for {userName}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="dark:text-white" />
          </button>
        </div>
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : predictions.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No predictions found for this user.</p>
        ) : (
          <div className="space-y-4">
            {predictions.map(pred => (
              <div key={pred.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-mono text-gray-400 mb-2">{new Date(pred.createdAt?.seconds * 1000).toLocaleString()}</p>
                <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {pred.data && typeof pred.data === 'object' ? (
                     <pre>{JSON.stringify(pred.data, null, 2)}</pre>
                  ) : (
                    <span>{String(pred.data)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionDetailsModal;
