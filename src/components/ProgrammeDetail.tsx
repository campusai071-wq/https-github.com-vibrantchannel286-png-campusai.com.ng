import React from 'react';
import { cleanJambHtml } from '../lib/jambCleaner';

interface ProgrammeDetailProps {
  programme: any;
  onBack: () => void;
}

export const ProgrammeDetail: React.FC<ProgrammeDetailProps> = ({ programme, onBack }) => {
  return (
    <div className="space-y-4 p-6 border rounded shadow-sm">
      <button onClick={onBack} className="text-blue-600 mb-4">&larr; Back to search</button>
      <h2 className="text-2xl font-bold">{programme.name}</h2>
      <p className="text-gray-600">{programme.institution}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">UTME Requirements</h3>
          <div dangerouslySetInnerHTML={{ __html: cleanJambHtml(programme.utme_requirements) }} />
        </div>
        <div>
          <h3 className="font-semibold">Required Subjects</h3>
          <div dangerouslySetInnerHTML={{ __html: cleanJambHtml(programme.subjects) }} />
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold">Remarks</h3>
        <div dangerouslySetInnerHTML={{ __html: cleanJambHtml(programme.remarks) }} />
      </div>
    </div>
  );
};
