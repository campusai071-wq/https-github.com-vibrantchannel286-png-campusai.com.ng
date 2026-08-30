import React, { useMemo, useState } from 'react';
import { FORMULA_DATA } from '../data/formulas';
import { Search } from 'lucide-react';

export const FormulaSheet: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDomain, setActiveDomain] = useState<string>('All');

  const domains = useMemo(
    () => ['All', ...Array.from(new Set(FORMULA_DATA.map((f) => f.domain)))],
    []
  );

  const visibleFormulas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return FORMULA_DATA.filter((f) => {
      const matchesDomain = activeDomain === 'All' || f.domain === activeDomain;
      const matchesSearch =
        !term ||
        f.concept.toLowerCase().includes(term) ||
        f.formula.toLowerCase().includes(term);
      return matchesDomain && matchesSearch;
    });
  }, [searchTerm, activeDomain]);

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">JAMB Syllabus Formula Sheet</h2>

      {/* Search */}
      <div className="mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search formulas (e.g. Calculus, Snell's Law, Ideal Gas)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Domain filter pills — click one to show all formulas in that domain */}
      <div className="flex flex-wrap gap-2 mb-6">
        {domains.map((domain) => {
          const isActive = activeDomain === domain;
          const count =
            domain === 'All'
              ? FORMULA_DATA.length
              : FORMULA_DATA.filter((f) => f.domain === domain).length;

          return (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
              }`}
            >
              {domain} ({count})
            </button>
          );
        })}
      </div>

      {/* Flat grid of every formula matching the active domain + search */}
      {visibleFormulas.length === 0 ? (
        <p className="text-gray-500 text-sm">No formulas match your search.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleFormulas.map((f, i) => (
            <div key={i} className="p-5 border rounded-xl bg-white shadow-sm">
              <span className="inline-block text-xs font-bold uppercase tracking-wide text-emerald-600 mb-1">
                {f.domain}
              </span>
              <h3 className="font-bold text-lg mb-2">{f.concept}</h3>
              <div className="bg-gray-900 text-emerald-400 p-3 rounded-lg font-mono text-sm mb-3 overflow-x-auto">
                {f.formula}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Vars:</strong> {f.variables}
              </p>
              <p className="text-sm text-gray-700">
                <strong>App:</strong> {f.application}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};