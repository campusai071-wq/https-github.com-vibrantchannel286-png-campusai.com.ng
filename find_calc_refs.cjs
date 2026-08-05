const fs = require('fs');
const appCode = fs.readFileSync('src/App.tsx', 'utf8');
console.log("Navbar/App tabs or routes in App.tsx:");
appCode.split('\n').forEach((line, i) => {
  if (line.includes('Calculator') || line.includes('CGPA') || line.includes('Tab') || line.includes('activeTab') || line.includes('Navigation') || line.includes('Nav')) {
    console.log((i+1) + ': ' + line.trim().slice(0, 100));
  }
});
