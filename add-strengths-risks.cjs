const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const regex = /<div className="mt-6 p-4 bg-black\/40 rounded-xl border border-white\/5">\s*<p className="text-\[9px\] font-black text-gray-400 uppercase mb-2 tracking-widest">Admission Strategy Analysis<\/p>\s*<div className="markdown-body text-\[11px\] text-gray-300 leading-relaxed font-medium">\s*<Markdown>\{aiResult\.detailedStrategy \|\| aiResult\.recommendation \|\| 'No specific strategy analysis available\.'\}<\/Markdown>\s*<\/div>\s*<\/div>/m;

const replacement = `                  {(aiResult.strengths?.length > 0 || aiResult.riskFactors?.length > 0) && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiResult.strengths?.length > 0 && (
                        <div className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl">
                          <p className="text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest flex items-center gap-1.5"><Check size={12} /> Strengths</p>
                          <div className="flex flex-wrap gap-2">
                            {aiResult.strengths.map((str, idx) => (
                              <span key={idx} className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                                🟢 {str}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiResult.riskFactors?.length > 0 && (
                        <div className="p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl">
                          <p className="text-[10px] font-black text-orange-400 uppercase mb-3 tracking-widest flex items-center gap-1.5"><TriangleAlert size={12} /> Risk Factors</p>
                          <div className="flex flex-wrap gap-2">
                            {aiResult.riskFactors.map((risk, idx) => (
                              <span key={idx} className="px-2.5 py-1.5 bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                                ⚠️ {risk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    <details className="group">
                      <summary className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between cursor-pointer list-none select-none">
                        <span className="flex items-center gap-2"><Activity size={12} className="text-blue-400" /> Why this prediction?</span>
                        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <p className="text-[11px] text-gray-300">Your admission chance is based on multiple weighted factors including:</p>
                        <ul className="space-y-2 text-[10px] font-semibold text-gray-400">
                          <li className="flex items-center gap-2"><span>•</span> JAMB score relative to historical performance (approx. 35%)</li>
                          <li className="flex items-center gap-2"><span>•</span> O'Level grades and required subject matching (approx. 20%)</li>
                          <li className="flex items-center gap-2"><span>•</span> Aggregate score vs standard departmental cutoffs (approx. 25%)</li>
                          <li className="flex items-center gap-2"><span>•</span> Departmental competitiveness & quota constraints (approx. 15%)</li>
                          <li className="flex items-center gap-2"><span>•</span> Catchment/ELDS state considerations (approx. 5%)</li>
                        </ul>
                      </div>
                    </details>
                  </div>

                  <div className="mt-6 p-5 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2"><Activity size={12} className="text-purple-400" /> Admission Strategy Analysis</p>
                    <div className="markdown-body text-[11px] text-gray-300 leading-relaxed font-medium">
                      <Markdown>{aiResult.detailedStrategy || aiResult.recommendation || 'No specific strategy analysis available.'}</Markdown>
                    </div>
                  </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Regex failed.");
}
