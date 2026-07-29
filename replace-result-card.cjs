const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const targetStr = `                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                    {/* Gauge + confidence */}
                    <div className="flex flex-col items-center">
                      <ProbabilityGauge probability={aiResult.isOffered === false ? 0 : admissionProbability} />
                      <div className="mt-3.5 flex items-center justify-center gap-1.5 p-1.5 px-3 bg-white/[0.03] border border-white/5 rounded-xl select-none">
                        <span className="text-[7.5px] font-extrabold uppercase text-gray-400 tracking-widest">Confidence:</span>
                        <div className="flex gap-0.5">
                          <span className=\`w-2.5 h-1.5 rounded-sm bg-emerald-500\` />
                          <span className=\`w-2.5 h-1.5 rounded-sm \${confidenceLevel === 'Medium' || confidenceLevel === 'High' ? 'bg-emerald-500' : 'bg-white/10'}\` />
                          <span className=\`w-2.5 h-1.5 rounded-sm \${confidenceLevel === 'High' ? 'bg-emerald-500' : 'bg-white/10'}\` />
                        </div>
                        <span className=\`text-[8px] font-black uppercase tracking-wider \${confidenceLevel === 'High' ? 'text-emerald-400' : confidenceLevel === 'Medium' ? 'text-cyan-400' : 'text-amber-400'}\`>
                          {confidenceLevel}
                        </span>
                      </div>
                    </div>

                    {/* Aggregate + badges */}
                    <div className="text-center sm:text-left">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        {(isAR || isPostUtmePending) ? 'Projected Aggregate' : 'My Aggregate Score'}
                      </p>
                      <h4 className="text-3xl font-black text-white">{aggregateScore}%</h4>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="p-2 bg-blue-500/5 rounded-lg border border-blue-500/10 inline-flex items-center gap-1.5">
                          {aiResult.isOffered === false
                            ? <><X size={10} className="text-red-400" /><span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Course Not Found/Accredited</span></>
                            : <><ShieldCheck size={10} className="text-blue-400" /><span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Logic Verified</span></>}
                        </div>
                        {stateOfOrigin && (
                          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 inline-flex items-center gap-1.5">
                            <MapPin size={10} className="text-purple-400" />
                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Quota Applied: {stateOfOrigin}</span>
                          </div>
                        )}
                        {user?.scholarCredits > 0 && (
                          <div className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 inline-flex items-center gap-1.5 animate-pulse">
                            <Crown size={10} className="text-amber-500" />
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{user.scholarCredits} Premium Trials Left</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Export & Upload Action Bar */}
                  <div className="flex items-center gap-3 my-5 pt-4 border-t border-white/10 flex-wrap">
                    <button
                      onClick={() => setIsPdfExportModalOpen(true)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      <Printer size={14} /> Export PDF Summary
                    </button>
                    <button
                      onClick={() => setIsUploadHubModalOpen(true)}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                    >
                      <Upload size={14} /> Upload Result Slip / Files
                    </button>
                  </div>`;

const replacement = `                  {(() => {
                    let chanceLevel = '🔴 Unlikely';
                    let chanceColor = 'text-red-500';
                    let chanceBg = 'bg-red-500/10 border-red-500/20';

                    if (admissionProbability >= 75) {
                      chanceLevel = '🟢 Strong Chance';
                      chanceColor = 'text-emerald-500';
                      chanceBg = 'bg-emerald-500/10 border-emerald-500/20';
                    } else if (admissionProbability >= 50) {
                      chanceLevel = '🟡 Competitive';
                      chanceColor = 'text-amber-400';
                      chanceBg = 'bg-amber-500/10 border-amber-500/20';
                    } else if (admissionProbability >= 30) {
                      chanceLevel = '🟠 Borderline';
                      chanceColor = 'text-orange-500';
                      chanceBg = 'bg-orange-500/10 border-orange-500/20';
                    }

                    if (aiResult.isOffered === false) {
                      chanceLevel = '🔴 Not Accredited';
                      chanceColor = 'text-red-500';
                      chanceBg = 'bg-red-500/10 border-red-500/20';
                    }

                    return (
                      <>
                        <div className="flex flex-col items-center mb-8">
                          <div className={\`px-6 py-2.5 rounded-full border mb-6 font-black text-sm md:text-base uppercase tracking-widest flex items-center justify-center \${chanceBg} \${chanceColor} shadow-lg\`}>
                             {chanceLevel}
                          </div>
                          
                          <ProbabilityGauge probability={aiResult.isOffered === false ? 0 : admissionProbability} />
                          
                          <div className="mt-4 flex items-center justify-center gap-2 p-2 px-4 bg-white/[0.03] border border-white/5 rounded-xl select-none">
                            <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-widest">Confidence:</span>
                            <div className="flex gap-1">
                              <span className={\`w-3 h-1.5 rounded-sm bg-emerald-500\`} />
                              <span className={\`w-3 h-1.5 rounded-sm \${confidenceLevel === 'Medium' || confidenceLevel === 'High' ? 'bg-emerald-500' : 'bg-white/10'}\`} />
                              <span className={\`w-3 h-1.5 rounded-sm \${confidenceLevel === 'High' ? 'bg-emerald-500' : 'bg-white/10'}\`} />
                            </div>
                            <span className={\`text-[9px] font-black uppercase tracking-wider \${confidenceLevel === 'High' ? 'text-emerald-400' : confidenceLevel === 'Medium' ? 'text-cyan-400' : 'text-amber-400'}\`}>
                              {confidenceLevel}
                            </span>
                          </div>
                        </div>

                        {/* Admission Snapshot Card */}
                        <div className="mb-6 p-5 bg-black/40 rounded-[20px] border border-white/5 shadow-inner">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Activity size={12} className="text-blue-400" /> Admission Snapshot
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Institution</p>
                              <p className="text-xs md:text-sm font-bold text-white mt-1 truncate">{targetUni?.name}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Course</p>
                              <p className="text-xs md:text-sm font-bold text-white mt-1 truncate">{targetCourse || courseSearch}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{(isAR || isPostUtmePending) ? 'Projected' : 'Aggregate'}</p>
                              <p className="text-lg md:text-xl font-black text-emerald-400 mt-1">{aggregateScore}%</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Quota</p>
                              <p className="text-xs md:text-sm font-bold text-purple-400 mt-1">{stateOfOrigin || 'General'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
                          <div className="p-2 bg-blue-500/5 rounded-lg border border-blue-500/10 inline-flex items-center gap-1.5">
                            {aiResult.isOffered === false
                              ? <><X size={10} className="text-red-400" /><span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Course Not Accredited</span></>
                              : <><ShieldCheck size={10} className="text-blue-400" /><span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Logic Verified</span></>}
                          </div>
                          {user?.scholarCredits > 0 && (
                            <div className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 inline-flex items-center gap-1.5">
                              <Crown size={10} className="text-amber-500" />
                              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{user.scholarCredits} Premium Trials Left</span>
                            </div>
                          )}
                        </div>

                        {/* Export & Upload Action Bar */}
                        <div className="flex items-center gap-3 my-6 pt-5 border-t border-white/10 flex-wrap justify-center sm:justify-start">
                          <button
                            onClick={() => setIsPdfExportModalOpen(true)}
                            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                          >
                            <FileText size={16} /> Export Result Slip (PDF / Image)
                          </button>
                          <button
                            onClick={() => setIsUploadHubModalOpen(true)}
                            className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all active:scale-95"
                          >
                            <Upload size={16} /> Upload Additional Documents
                          </button>
                        </div>
                      </>
                    );
                  })()}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the target string. Checking context...");
}
