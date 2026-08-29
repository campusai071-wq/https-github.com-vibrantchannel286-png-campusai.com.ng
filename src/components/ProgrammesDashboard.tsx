import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { ProgrammeSearch } from './ProgrammeSearch';
import { ProgrammeDetail } from './ProgrammeDetail';
import { EligibilityCheck } from './EligibilityCheck';
import { CapsStatsDashboard } from './CapsStatsDashboard';

export const ProgrammesDashboard: React.FC = () => {
  const [selectedProgramme, setSelectedProgramme] = useState<any | null>(null);
  const [view, setView] = useState<'search' | 'detail' | 'eligibility' | 'stats'>('search');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Programmes Hub</h1>
      
      <div className="flex gap-4 mb-6">
        <button onClick={() => setView('search')} className={`px-4 py-2 rounded ${view === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Search</button>
        <button onClick={() => setView('eligibility')} className={`px-4 py-2 rounded ${view === 'eligibility' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Check Eligibility</button>
        <button onClick={() => setView('stats')} className={`px-4 py-2 rounded ${view === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Stats</button>
      </div>

      {view === 'search' && (
        <ProgrammeSearch 
          onSelect={(prog) => {
            setSelectedProgramme(prog);
            setView('detail');
          }} 
        />
      )}
      
      {view === 'detail' && selectedProgramme && (
        <ProgrammeDetail 
          programme={selectedProgramme} 
          onBack={() => setView('search')} 
        />
      )}
      
      {view === 'eligibility' && <EligibilityCheck />}
      {view === 'stats' && <CapsStatsDashboard />}
    </div>
  );
};
