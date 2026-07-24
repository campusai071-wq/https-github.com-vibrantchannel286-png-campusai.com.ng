const fs = require('fs');

let code = fs.readFileSync('api/server.ts', 'utf-8');

code = code.replace("if (reqPath.startsWith('/news/') && adminDb) {", "console.log('injectSEO called with', reqPath, 'adminDb:', !!adminDb);\n  if (reqPath.startsWith('/news/') && adminDb) {");

fs.writeFileSync('api/server.ts', code);
