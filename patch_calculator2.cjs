const fs = require('fs');
let code = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

code = code.replace(
  "{sittings === 2 && (\n                    <div>\n                      <label className=\"text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block\">Sitting 2 Exam Board</label>",
  "{sittings === 2 && (\n                    <div>\n                      <p className=\"text-[9px] text-amber-400 font-bold mb-2\">Note: Enter your combined best 5 subjects across both sittings.</p>\n                      <label className=\"text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1 block\">Sitting 2 Exam Board</label>"
);

fs.writeFileSync('src/components/CutoffCalculator.tsx', code);
console.log("Patched CutoffCalculator.tsx");
