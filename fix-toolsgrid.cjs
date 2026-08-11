const fs = require('fs');
let code = fs.readFileSync('src/components/App.tsx', 'utf8');

const targetStr = `                    onLaunchCalculator={() => {
                      setCurrentPage('calculator');
                      navigate('/calculator');
                    }}
                  />`;

const replaceStr = targetStr + `
                  
                  <Suspense fallback={<div className="h-40 flex items-center justify-center text-blue-500">Loading tools...</div>}>
                    <ToolsGrid />
                  </Suspense>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/App.tsx', code);
console.log('Fixed App.tsx');
