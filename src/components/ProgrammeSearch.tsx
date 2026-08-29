import React, { useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

interface ProgrammeSearchProps {
  onSelect: (programme: any) => void;
}

export const ProgrammeSearch: React.FC<ProgrammeSearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      // Basic search logic: Firestore doesn't support substring search directly
      // This is a simple query, may need to be expanded later or use Algolia if advanced search is needed
      const programmesRef = collection(db, 'programmes');
      const q = query(programmesRef, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'), limit(10));
      const querySnapshot = await getDocs(q);
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setResults(items);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a programme..."
          className="flex-grow p-2 border rounded"
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="space-y-2">
        {results.map((prog) => (
          <div key={prog.id} className="p-4 border rounded cursor-pointer hover:bg-gray-50" onClick={() => onSelect(prog)}>
            <h3 className="font-bold">{prog.name}</h3>
            <p>{prog.institution}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
