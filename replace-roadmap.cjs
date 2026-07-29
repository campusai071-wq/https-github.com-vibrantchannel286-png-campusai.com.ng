const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const regex = /{\/\* Admission Rescue & Strategic Action Plan \*\/}[\s\S]*?{\/\* Try alternative courses button \*\/}/m;

const replacement = `{/* Admission Rescue & Strategic Action Plan */}
                  <div className="mt-6 p-6 bg-gradient-to-br from-indigo-500/[0.03] to-blue-500/[0.02] border border-blue-500/20 rounded-2xl text-left space-y-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Sliders size={15} />
                      </div>
                      <div>
                        <h5 className="text-xs font-black uppercase tracking-widest text-blue-400">STRATEGIC ACTION PLAN</h5>
                        <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5">Custom steps for {targetUni?.name || 'your institution'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <p className="text-[10px] text-blue-200 leading-relaxed font-semibold">
                        {admissionProbability >= 65 ? (
                          <>
                            ✅ Your aggregate score of <span className="text-white font-extrabold">{aggregateScore}%</span> is highly competitive for <span className="text-white font-extrabold">{targetCourse || courseSearch}</span>. To maximize your chances of gaining admission this year, follow this action plan.
                          </>
                        ) : (
                          <>
                            ⚠️ Your aggregate score of <span className="text-white font-extrabold">{aggregateScore}%</span> is close to or below the typical competitive cutoff of <span className="text-white font-extrabold">{aiResult.departmentalCutoff || aiResult.cutoff || 'the standard range'}</span> for {targetCourse || courseSearch}. To maximize your chances of gaining admission this year, follow this action plan.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Interactive Checklist */}
                    <div className="space-y-3.5">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>📋</span> Next Steps
                      </p>
                        
                      <div className="space-y-2.5">
                        {(() => {
                          const steps = admissionProbability >= 65 ? [
                            {
                              id: 'step1',
                              title: 'Complete Post-UTME registration',
                              desc: \`Monitor the official portal for \${targetUni?.name || 'your institution'} and ensure you register for the Post-UTME screening as soon as it opens.\`,
                            },
                            {
                              id: 'step2',
                              title: 'Upload O\\'Level to JAMB CAPS',
                              desc: 'Log in to your JAMB CAPS portal and ensure your O\\'Level results are fully uploaded and verified.',
                              hasLink: true,
                              link: 'https://jamb.gov.ng/efacility',
                              linkLabel: 'Open JAMB e-Facility'
                            },
                            {
                              id: 'step3',
                              title: 'Monitor admission list',
                              desc: 'Keep a close eye on the CAPS "Transfer Approval" and "Admission Status" tabs for updates.'
                            }
                          ] : [
                            {
                              id: 'step1',
                              title: 'Verify portal activation & deadlines',
                              desc: 'The JAMB Change of Course/Institution portal is officially active. Log in to the official JAMB e-Facility portal to complete your adjustments.',
                              hasLink: true,
                              link: 'https://jamb.gov.ng/efacility',
                              linkLabel: 'Open JAMB e-Facility'
                            },
                            {
                              id: 'step2',
                              title: 'Change of Course',
                              desc: 'Consider switching to a less competitive course within the same institution to improve your chances.'
                            },
                            {
                              id: 'step3',
                              title: 'Alternative institutions',
                              desc: 'Explore state or private universities that have lower cutoff marks for your desired course.'
                            },
                            {
                              id: 'step4',
                              title: 'Consider supplementary admission',
                              desc: 'Monitor for supplementary forms when the main admission lists have been concluded.'
                            }
                          ];

                          return steps.map((step) => {
                            const isChecked = checkedSteps[step.id];
                            return (
                              <div key={step.id} className={\`p-4 rounded-xl border transition-all duration-300 \${isChecked ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 'bg-black/20 border-white/5 hover:border-white/10'}\`}>
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => setCheckedSteps(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                                    className={\`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border transition-all duration-300 \${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-500 text-transparent hover:border-blue-400'}\`}
                                  >
                                    <Check size={12} strokeWidth={3} />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <h6 className={\`text-[11px] font-black uppercase tracking-wider transition-colors duration-300 \${isChecked ? 'text-emerald-400' : 'text-gray-200'}\`}>
                                      {step.title}
                                    </h6>
                                    <p className={\`text-[10px] font-medium leading-relaxed mt-1.5 transition-colors duration-300 \${isChecked ? 'text-gray-500 line-through' : 'text-gray-400'}\`}>
                                      {step.desc}
                                    </p>
                                    {step.hasLink && !isChecked && (
                                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-lg mt-3 transition-colors border border-blue-500/20">
                                        <ExternalLink size={10} />
                                        {step.linkLabel}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Try alternative courses button */}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Regex didn't match.");
}
