const fs = require('fs');
let code = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

// Add a note when 2 sittings is selected
code = code.replace(
  '{sittings === 2 && (\\n                    <div>\\n                      <label className="text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Sitting 2 Exam Board</label>',
  '{sittings === 2 && (\\n                    <div>\\n                      <p className="text-[10px] text-amber-400 font-bold mb-2">Note: Enter your combined best 5 subjects across both sittings.</p>\\n                      <label className="text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Sitting 2 Exam Board</label>'
);

// We need to use exact matching or simpler replace
