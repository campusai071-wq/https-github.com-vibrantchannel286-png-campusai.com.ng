const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const targetStr = `                      {/* Interactive Checklist (Directly matching official JAMB change of course/institution guidelines) */}
                      <div className="space-y-3.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>🔄</span> JAMB Change of Course/Institution Checklist
                        </p>
                        
                        <div className="space-y-2.5">
                          {[
                            {
                              id: 'step1',
                              title: 'Verify portal activation & deadlines',
                              desc: \`The 2026 JAMB Change of Course/Institution portal was officially activated on May 15, 2026. Log in to the official JAMB e-Facility portal to complete your adjustments before the typical late-year close in December 2026.\`,
                              hasLink: true,
                              link: 'https://jamb.gov.ng/efacility',
                              linkLabel: 'Open JAMB e-Facility'
                            },
                            {
                              id: 'step2',
                              title: 'Log in to your profile securely',
                              desc: 'Log in using your registered JAMB email address and password credentials.'
                            },
                            {
                              id: 'step3',
                              title: 'Select "Change of Course/Institution"',
                              desc: 'Locate the correction service option under the application services pane (a processing fee of ₦2,500 applies).'
                            },
                            {
                              id: 'step4',
                              title: \`Select a safer program or lower-tier institution\`,
                              desc: \`Choose alternative programmes at \${targetUni?.name || 'your institution'} or other state/private options matching your aggregate.\`
                            }
                          ].map((step, sIdx) => {
                            const isChecked = checkedRescueSteps[step.id];
                            return (
                              <div
                                key={step.id}
                                onClick={() => toggleRescueStep(step.id)}
                                className={\`p-3 rounded-xl border transition-all cursor-pointer select-none flex gap-3 items-start \${
                                  isChecked 
                                    ? 'bg-amber-500/10 border-amber-500/30' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }\`}
                              >
                                <div className={\`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all \${
                                  isChecked 
                                    ? 'bg-amber-500 border-amber-500 text-black' 
                                    : 'border-gray-500 bg-black/20 text-transparent'
                                }\`}>
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={\`text-[10px] font-black uppercase tracking-tight \${isChecked ? 'text-amber-300' : 'text-white'}\`}>
                                    {sIdx + 1}. {step.title}
                                  </p>
                                  <p className="text-[9.5px] text-gray-400 leading-relaxed font-semibold mt-0.5">{step.desc}</p>
                                  
                                  {step.hasLink && (
                                    <a
                                      href={step.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest border-b border-amber-400/30 pb-0.5 transition-all"
                                    >
                                      {step.linkLabel} <ExternalLink size={8} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>`;

const replacement = `                      {/* Interactive Checklist (Dynamic based on admission probability) */}
                      <div className="space-y-3.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>📋</span> ACTION PLAN CHECKLIST
                        </p>
                        
                        <div className="space-y-2.5">
                          {(admissionProbability >= 65 ? [
                            {
                              id: 'step1',
                              title: 'Complete Post-UTME registration',
                              desc: \`Ensure you have registered for the Post-UTME screening on the official \${targetUni?.name || 'institution'} portal.\`
                            },
                            {
                              id: 'step2',
                              title: 'Upload O\\'Level to JAMB CAPS',
                              desc: 'Log in to your JAMB CAPS portal and verify that your WAEC/NECO results are correctly uploaded.',
                              hasLink: true,
                              link: 'https://jamb.gov.ng/efacility',
                              linkLabel: 'Open JAMB e-Facility'
                            },
                            {
                              id: 'step3',
                              title: 'Monitor admission list',
                              desc: 'Keep checking your JAMB CAPS status regularly for any updates on your admission.'
                            }
                          ] : [
                            {
                              id: 'step1',
                              title: 'Verify portal activation & deadlines',
                              desc: \`The 2026 JAMB Change of Course/Institution portal is officially active. Log in to the official JAMB e-Facility portal to complete your adjustments before the deadline.\`,
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
                          ]).map((step, sIdx) => {
                            const isChecked = checkedRescueSteps[step.id];
                            return (
                              <div
                                key={step.id}
                                onClick={() => toggleRescueStep(step.id)}
                                className={\`p-3 rounded-xl border transition-all cursor-pointer select-none flex gap-3 items-start \${
                                  isChecked 
                                    ? 'bg-amber-500/10 border-amber-500/30' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }\`}
                              >
                                <div className={\`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all \${
                                  isChecked 
                                    ? 'bg-amber-500 border-amber-500 text-black' 
                                    : 'border-gray-500 bg-black/20 text-transparent'
                                }\`}>
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={\`text-[10px] font-black uppercase tracking-tight \${isChecked ? 'text-amber-300' : 'text-white'}\`}>
                                    {sIdx + 1}. {step.title}
                                  </p>
                                  <p className="text-[9.5px] text-gray-400 leading-relaxed font-semibold mt-0.5">{step.desc}</p>
                                  
                                  {step.hasLink && (
                                    <a
                                      href={step.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest border-b border-amber-400/30 pb-0.5 transition-all"
                                    >
                                      {step.linkLabel} <ExternalLink size={8} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Checklist replaced successfully!");
} else {
  console.log("Could not find the checklist target string. Trying regex...");
  const regex = /{\/\* Interactive Checklist \(Directly matching official JAMB change of course\/institution guidelines\) \*\/}[\s\S]*?<\/div>\s*<\/div>/;
  if (regex.test(content)) {
     content = content.replace(regex, replacement);
     fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
     console.log("Regex Checklist replaced successfully!");
  } else {
     console.log("Regex also failed.");
  }
}
