import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Calendar, Clock, AlertCircle } from 'lucide-react';

const PolicySection: React.FC = () => {
  return (
    <section id="policies" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
            <BookOpen className="text-blue-600 dark:text-blue-400" size={32} />
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">2026 JAMB Admission Policies</h2>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="text-blue-600" size={20}/> 1. Official Cut-Off Marks (National Minimum)</h3>
            <p className="text-gray-600 dark:text-gray-400">These are the "Minimum Admissible Scores." While schools can set their own marks higher, they are strictly prohibited from admitting anyone below these benchmarks.</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl font-semibold text-gray-900 dark:text-white">Universities: 150</div>
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl font-semibold text-gray-900 dark:text-white">Colleges of Nursing: 150</div>
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl font-semibold text-gray-900 dark:text-white">Polytechnics/Monotechnics: 100</div>
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl font-semibold text-gray-900 dark:text-white">Colleges of Ed (NCE): No UTME Required</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertCircle className="text-blue-600" size={20}/> 2. The "No UTME" Exemption Rule</h3>
            <p className="text-gray-600 dark:text-gray-400">For NCE and Agriculture (non-engineering) candidates, you only need 4 O'Level credit passes in relevant subjects. You must still register with JAMB for verification and processing through CAPS.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> 3. Admission Deadlines</h3>
            <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>Public Universities: October 31, 2026.</li>
                <li>Private Universities: November 30, 2026.</li>
                <li>Polytechnics & Colleges of Education: December 31, 2026.</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock className="text-blue-600" size={20}/> 4. Age and CAPS Rules</h3>
            <p className="text-gray-600 dark:text-gray-400">Minimum age is 16 by September 30, 2026. For CAPS, once offered admission, you have exactly 4 weeks to accept or reject it.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PolicySection;
