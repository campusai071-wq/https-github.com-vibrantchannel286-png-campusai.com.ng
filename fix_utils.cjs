const fs = require('fs');
let code = fs.readFileSync('src/services/utils.ts', 'utf-8');
code = code.replace(/function fallbackNotification\(\) \{/g, 'const fallbackNotification = () => {');
fs.writeFileSync('src/services/utils.ts', code);
