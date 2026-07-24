const fs = require('fs');
let code = fs.readFileSync('api/server.ts', 'utf-8');
code = code.replace("console.log('injectSEO called with reqPath:', reqPath, 'dbInstance exists:', !!dbInstance);", 
"fs.appendFileSync('seo_debug.log', 'injectSEO called with reqPath: ' + reqPath + ' dbInstance exists: ' + !!dbInstance + '\\n');");
fs.writeFileSync('api/server.ts', code);
