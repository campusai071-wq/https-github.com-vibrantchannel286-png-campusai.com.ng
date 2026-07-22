import React, { useState, useEffect } from 'react';
import { saveGlobalScoringSystem, getGlobalScoringSystem } from '../services/dbService';
import { Loader2, Save } from 'lucide-react';
import universities from '../data/universities'; // Assuming this is the definition

// Placeholder for now, as I need to query the database.
// This is complex. Let's start with a simple form to update a single formula.

export const FormulasTab: React.FC = () => {
  const [selectedUni, setSelectedUni] = useState(universities[0].slug);
  const [formula, setFormula] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadFormula = async () => {
    setLoading(true);
    const data = await getGlobalScoringSystem(selectedUni);
    if (data) {
        setFormula(data.formula || '');
        setExplanation(data.explanation || '');
    } else {
        setFormula('');
        setExplanation('');
    }
    setLoading(false);
  };

  useEffect(() => { loadFormula(); }, [selectedUni]);

  const handleSave = async () => {
    setLoading(true);
    try {
        await saveGlobalScoringSystem(selectedUni, { formula, explanation });
        setMessage('Formula updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    } catch (e) {
        setMessage('Error saving formula.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase text-gray-400">Manage Institutional Formulas</h3>
      <label htmlFor="manage-uni-select" className="sr-only">Select University</label>
      <select id="manage-uni-select" value={selectedUni} onChange={e => setSelectedUni(e.target.value)} className="w-full p-2 bg-gray-100 rounded-lg">
        {universities.map(u => <option key={u.slug} value={u.slug}>{u.name}</option>)}
      </select>
      <input value={formula} onChange={e => setFormula(e.target.value)} placeholder="Formula (e.g., 50:10:40)" className="w-full p-2 bg-gray-100 rounded-lg" />
      <textarea value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Explanation" className="w-full p-2 bg-gray-100 rounded-lg" />
      <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Formula
      </button>
      {message && <p className="text-xs text-emerald-500">{message}</p>}
    </div>
  );
};
