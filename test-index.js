const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
console.log(html.includes('<title data-rh="true">'));
