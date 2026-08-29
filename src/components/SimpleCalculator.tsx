import React, { useState } from 'react';
import SEO from './SEO';
import { incrementDailyCalculation } from '../services/statsService';

const SimpleCalculator: React.FC = () => {
  const [jamb, setJamb] = useState('');
  const [olevelGrades, setOlevelGrades] = useState<string[]>(['', '', '', '']);
  const [postUtme, setPostUtme] = useState('');
  const [includeOLevel, setIncludeOLevel] = useState(false);
  const [includePostUtme, setIncludePostUtme] = useState(true);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const j = parseFloat(jamb);
    const p = parseFloat(postUtme);
    
    // Simple point mapping: A1=5, B2=4, B3=3, C4=2, C5=1.5, C6=1, D7=0, E8=0, F9=0
    const gradePoints: { [key: string]: number } = {
      'A1': 5, 'B2': 4, 'B3': 3, 'C4': 2, 'C5': 1.5, 'C6': 1, 'D7': 0, 'E8': 0, 'F9': 0
    };
    
    let aggregate = 0;
    if (!isNaN(j)) aggregate += (j / 8);
    if (includeOLevel) {
        const olevelTotal = olevelGrades.reduce((sum, grade) => sum + (gradePoints[grade] || 0), 0);
        aggregate += olevelTotal;
    }
    if (includePostUtme && !isNaN(p)) aggregate += (p / 2);
    
    setResult(aggregate);
    incrementDailyCalculation(); // Track this
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <SEO title="Simple Calculator" description="Simple aggregate calculator" canonical="/calculator-simple" />
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Calculator</h1>
          <p className="text-gray-500 dark:text-gray-400">Simple aggregate calculation.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">JAMB Score (out of 400)</label>
            <input 
              type="number" 
              placeholder="e.g. 250" 
              value={jamb} 
              onChange={(e) => setJamb(e.target.value)} 
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="font-medium text-gray-700 dark:text-gray-300">Include O'Level Points?</label>
            <input type="checkbox" checked={includeOLevel} onChange={(e) => setIncludeOLevel(e.target.checked)} className="w-5 h-5" />
          </div>
          {includeOLevel && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Grades for 4 O'Level Subjects</h3>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <label className="flex-1 text-sm text-gray-600 dark:text-gray-400">O'LEVEL {i}:</label>
                  <select 
                    value={olevelGrades[i-1] || ''} 
                    onChange={(e) => {
                      const newGrades = [...olevelGrades];
                      newGrades[i-1] = e.target.value;
                      setOlevelGrades(newGrades);
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">select</option>
                    <option value="A1">A1</option>
                    <option value="B2">B2</option>
                    <option value="B3">B3</option>
                    <option value="C4">C4</option>
                    <option value="C5">C5</option>
                    <option value="C6">C6</option>
                    <option value="D7">D7</option>
                    <option value="E8">E8</option>
                    <option value="F9">F9</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="font-medium text-gray-700 dark:text-gray-300">Include Post-UTME Score?</label>
            <input type="checkbox" checked={includePostUtme} onChange={(e) => setIncludePostUtme(e.target.checked)} className="w-5 h-5" />
          </div>
          {includePostUtme && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Post-UTME Score (out of 100)</label>
              <input 
                type="number" 
                placeholder="e.g. 70" 
                value={postUtme} 
                onChange={(e) => setPostUtme(e.target.value)} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          )}

          <button 
            onClick={calculate} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20"
          >
            Calculate
          </button>
        </div>

        {result !== null && (
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Your Aggregate</p>
            <div className="text-5xl font-extrabold text-blue-900 dark:text-blue-200">{result.toFixed(2)}</div>
          </div>
        )}

        <div className="mt-10 text-center">
          <a href="/calculator" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Want Advanced Analysis?</a>
        </div>
      </div>
    </div>
  );
};

export default SimpleCalculator;
