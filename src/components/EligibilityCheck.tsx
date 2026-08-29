import React, { useState } from 'react';

export const EligibilityCheck: React.FC = () => {
  const [programmeId, setProgrammeId] = useState('');
  const [scores, setScores] = useState({ math: 0, english: 0, physics: 0, chemistry: 0 });

  const checkEligibility = () => {
    // Implement logic here to compare scores with requirements from the programme
    alert('Eligibility check functionality under development!');
  };

  return (
    <div className="space-y-4 p-6 border rounded shadow-sm">
      <h2 className="text-xl font-bold">Check Eligibility</h2>
      <input 
        type="text" 
        placeholder="Programme ID" 
        value={programmeId} 
        onChange={(e) => setProgrammeId(e.target.value)}
        className="w-full p-2 border rounded"
      />
      {/* Add subject inputs here */}
      <button onClick={checkEligibility} className="w-full p-2 bg-green-600 text-white rounded">
        Check Eligibility
      </button>
    </div>
  );
};
