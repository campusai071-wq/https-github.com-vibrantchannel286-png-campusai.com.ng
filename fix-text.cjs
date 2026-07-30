const fs = require('fs');

let content = fs.readFileSync('src/components/CutoffCalculator.tsx', 'utf8');

const regex = /⚠️ Your aggregate score of <span className="text-white font-extrabold">\{aggregateScore\}%<\/span> is close to or below the typical competitive cutoff of <span className="text-white font-extrabold">\{aiResult\.departmentalCutoff \|\| aiResult\.cutoff\}<\/span> for \{targetCourse \|\| courseSearch\}\. To maximize your chances of gaining admission this year, follow this action plan\./;

const replacement = `{parseFloat(aggregateScore.toString()) >= parseFloat((aiResult.departmentalCutoff || '0').replace(/[^0-9.]/g, '')) ? (
                            <>✅ Your aggregate score of <span className="text-white font-extrabold">{aggregateScore}%</span> meets or exceeds the typical competitive cutoff of <span className="text-white font-extrabold">{aiResult.departmentalCutoff || aiResult.cutoff}</span> for {targetCourse || courseSearch}. To maximize your chances of gaining admission this year, follow this action plan.</>
                          ) : (
                            <>⚠️ Your aggregate score of <span className="text-white font-extrabold">{aggregateScore}%</span> is close to or below the typical competitive cutoff of <span className="text-white font-extrabold">{aiResult.departmentalCutoff || aiResult.cutoff}</span> for {targetCourse || courseSearch}. To maximize your chances of gaining admission this year, follow this action plan.</>
                          )}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/CutoffCalculator.tsx', content, 'utf8');
  console.log("Text replaced successfully!");
} else {
  console.log("Regex failed.");
}
