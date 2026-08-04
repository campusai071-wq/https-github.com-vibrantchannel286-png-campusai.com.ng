const fs = require('fs');
let file = fs.readFileSync('src/components/PdfExportModal.tsx', 'utf8');

const replacement = `
            {/* Admission Probability & Verdict */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-blue-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Admission Prediction Verdict</span>
                <h3 className="text-lg font-black text-gray-900 mt-0.5">{aiResult?.verdict || 'Competitive Merit Range'}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Estimated Admission Probability: <strong className={
                    admissionProbability >= 75 ? "text-emerald-600" :
                    admissionProbability >= 50 ? "text-amber-600" :
                    admissionProbability >= 30 ? "text-orange-600" : "text-red-600"
                  }>{admissionProbability}%</strong> ({confidenceLevel} confidence)
                </p>
              </div>
              <div className={\`w-16 h-16 rounded-full border-2 flex items-center justify-center font-black text-lg shrink-0 \${
                admissionProbability >= 75 ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                admissionProbability >= 50 ? 'bg-amber-100 border-amber-500 text-amber-700' :
                admissionProbability >= 30 ? 'bg-orange-100 border-orange-500 text-orange-700' : 
                'bg-red-100 border-red-500 text-red-700'
              }\`}>
                {admissionProbability}%
              </div>
            </div>`;

file = file.replace(/\{\/\*\s*Admission Probability & Verdict\s*\*\/\}.*?<\/div>\s*\{\/\*\s*Security Stamp & Footer\s*\*\/\}/s, replacement + '\n            {/* Security Stamp & Footer */}');

fs.writeFileSync('src/components/PdfExportModal.tsx', file);
console.log('patched');
